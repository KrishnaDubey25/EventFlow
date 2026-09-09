(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const app = document.getElementById('app');
  const toastHost = document.getElementById('toastHost');

  const STORE = {
    users: 'eventflow_users_v4',
    session: 'eventflow_session_v4',
    shared: 'eventflow_shared_v4'
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const shortDate = now.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const demoEvent = {
    id: 'EVF-CRICKET-01',
    name: 'National Cricket Championship',
    match: 'India vs Pakistan',
    venue: 'Unity Cricket Stadium',
    city: 'Mumbai',
    date: dateLabel,
    gatesOpen: '4:00 PM',
    start: '7:00 PM',
    end: '10:45 PM',
    total: 58420
  };

  const defaultShared = {
    gates: {
      North: { crowd: 91, people: 3820, wait: 24, color: 'red', seats: 'A & B' },
      East:  { crowd: 43, people: 1680, wait: 8, color: 'green', seats: 'C & D' },
      South: { crowd: 67, people: 2510, wait: 14, color: 'yellow', seats: 'E & F' },
      West:  { crowd: 78, people: 3010, wait: 18, color: 'orange', seats: 'G & H' }
    },
    parking: { P1: 93, P2: 74, P3: 48, P4: 31 },
    hotels: [
      { name:'City Grand', rooms:18, price:3600, distance:'1.8 km', shuttle:true },
      { name:'Vista Stay', rooms:42, price:2900, distance:'2.6 km', shuttle:true },
      { name:'Metro Lodge', rooms:67, price:2200, distance:'3.4 km', shuttle:false }
    ],
    transport: { shuttles: 18, buses: 11, taxis: 86, metroLoad: 72 },
    eventHealth: 84,
    alerts: [
      { id:'a1', level:'high', title:'North Gate is very crowded', text:'Send new arrivals to East Gate.', time:'Now' },
      { id:'a2', level:'medium', title:'Parking P1 is almost full', text:'Show P3 to drivers coming from the west road.', time:'2 min' },
      { id:'a3', level:'info', title:'Metro East is moving well', text:'Travel time is around 11 minutes.', time:'5 min' }
    ],
    tasks: [
      { id:'t1', title:'Send 3 more shuttle buses', detail:'Move buses from Parking P3 to East Gate.', priority:'High', status:'New', owner:'City Shuttle Team' },
      { id:'t2', title:'Open two extra entry lines', detail:'Add two entry lines at East Gate.', priority:'Medium', status:'New', owner:'Gate Operations' },
      { id:'t3', title:'Keep 40 hotel rooms ready', detail:'Hold rooms for late guests.', priority:'Low', status:'New', owner:'Hotel Partner Desk' }
    ],
    lastAction: '',
    surge: false,
    eventFinished: false,
    attendeeNotice: 'East Gate is the best gate right now. It has less crowd and a shorter wait.',
    updatedAt: Date.now()
  };

  let state = {
    view: 'landing',
    authMode: 'signin',
    authRole: 'attendee',
    session: readJSON(STORE.session, null),
    shared: readJSON(STORE.shared, defaultShared),
    activePage: 'home',
    mobileOpen: false,
    selectedGate: 'East',
    ticketVerified: false,
    ticket: null,
    simulationTimer: null
  };

  ensureSeedUsers();
  if (state.session) {
    state.view = 'dashboard';
    state.activePage = firstPageForRole(state.session.role);
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : structuredCloneSafe(fallback);
    } catch {
      return structuredCloneSafe(fallback);
    }
  }

  function structuredCloneSafe(v) {
    if (v == null) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function saveShared() {
    state.shared.updatedAt = Date.now();
    localStorage.setItem(STORE.shared, JSON.stringify(state.shared));
  }

  function ensureSeedUsers() {
    const existing = readJSON(STORE.users, []);
    if (existing.length) return;
    const seed = [
      { id:'u-management', name:'Demo Manager', email:'manager@eventflow.demo', password:'event123', role:'management' },
      { id:'u-operator', name:'Demo Operator', email:'operator@eventflow.demo', password:'event123', role:'operator' },
      { id:'u-attendee', name:'Demo Attendee', email:'attendee@eventflow.demo', password:'event123', role:'attendee' }
    ];
    localStorage.setItem(STORE.users, JSON.stringify(seed));
  }

  function firstPageForRole(role) {
    return role === 'management' ? 'command' : role === 'operator' ? 'overview' : 'journey';
  }

  function roleTitle(role) {
    return role === 'management' ? 'Event Management' : role === 'operator' ? 'Operator' : 'Attendee';
  }

  function statusColor(crowd) {
    if (crowd >= 85) return 'red';
    if (crowd >= 70) return 'orange';
    if (crowd >= 55) return 'yellow';
    return 'green';
  }

  function crowdWord(crowd) {
    if (crowd >= 85) return 'Very High';
    if (crowd >= 70) return 'High';
    if (crowd >= 55) return 'Medium';
    return 'Low';
  }

  function colorValue(name) {
    return ({ red:'var(--red)', orange:'var(--orange)', yellow:'var(--amber)', green:'var(--green)' })[name] || 'var(--blue)';
  }

  function icon(name) {
    const icons = {
      home:'⌂', map:'◇', crowd:'●', bus:'↔', bed:'▤', park:'P', alert:'!', spark:'✦', chart:'▥', time:'◷', people:'◎', settings:'⚙', ticket:'▱', route:'→', event:'◆', bell:'•', user:'○', task:'✓', box:'□', message:'✉', menu:'☰', logout:'↗', help:'?', seat:'S'
    };
    return icons[name] || '•';
  }

  function toast(title, text='') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<strong>${escapeHTML(title)}</strong>${text ? `<span>${escapeHTML(text)}</span>` : ''}`;
    toastHost.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function escapeHTML(str='') {
    return String(str).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function setView(view) {
    state.view = view;
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function navTo(page) {
    state.activePage = page;
    state.mobileOpen = false;
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function render() {
    if (state.view === 'landing') renderLanding();
    else if (state.view === 'auth') renderAuth();
    else renderDashboard();
  }

  function renderLanding() {
    app.innerHTML = `
      <div class="app-shell">
        <header class="top-nav">
          <div class="container nav-inner">
            ${brandHTML()}
            <nav class="nav-links" aria-label="Main navigation">
              <a href="#how">How it works</a>
              <a href="#live">Live event</a>
              <a href="#roles">For everyone</a>
            </nav>
            <div class="nav-actions">
              <button class="btn btn-secondary" data-go-auth="signin">Sign in</button>
              <button class="btn btn-primary" data-go-auth="signup">Create account</button>
            </div>
          </div>
        </header>

        <main>
          <section class="hero">
            <div class="container hero-grid">
              <div>
                <span class="pill pill-live">Live event demo</span>
                <h1>Move people through events <span>the smart way.</span></h1>
                <p>EventFlow helps guests, event teams and service teams know what to do next. It shows crowd levels, better gates, travel help, event timing and simple actions — all in one place.</p>
                <div class="hero-actions">
                  <button class="btn btn-primary" data-go-auth="signup">Start EventFlow</button>
                  <button class="btn btn-secondary" data-demo-role="attendee">Open attendee demo</button>
                </div>
                <div class="hero-meta">
                  <span><strong>3 simple views</strong><br>Management · Operator · Attendee</span>
                  <span><strong>Runs in your browser</strong><br>No database needed right now</span>
                  <span><strong>Easy English</strong><br>Clear words and clear actions</span>
                </div>
              </div>
              <div class="hero-visual" aria-label="EventFlow stadium preview">
                <div class="hero-card">
                  <div class="hero-card-top">
                    <div><div class="hero-card-title">Unity Cricket Stadium</div><small style="color:var(--muted)">${shortDate} · Live now</small></div>
                    <span class="pill pill-live">LIVE</span>
                  </div>
                  <div class="mini-kpis">
                    <div class="mini-kpi"><strong>58,420</strong><span>Guests today</span></div>
                    <div class="mini-kpi"><strong>East</strong><span>Best gate now</span></div>
                    <div class="mini-kpi"><strong>8 min</strong><span>Gate wait</span></div>
                  </div>
                  <div class="stadium-preview">
                    <div class="grid-lines"></div>
                    <div class="stadium-ring"></div>
                    <div class="crowd-stream stream-a"></div><div class="crowd-stream stream-b"></div>
                    <div class="gate-dot gate-n"><i style="background:var(--red)"></i>North · Busy</div>
                    <div class="gate-dot gate-e"><i style="background:var(--green)"></i>East · Best</div>
                    <div class="gate-dot gate-s"><i style="background:var(--amber)"></i>South</div>
                    <div class="gate-dot gate-w"><i style="background:var(--orange)"></i>West</div>
                    <div class="floating-chip chip-left"><span style="color:var(--muted)">Crowd at North</span><strong>91%</strong></div>
                    <div class="floating-chip chip-right"><span style="color:var(--muted)">Your best route</span><strong>East Gate → C12</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section-tight" id="live">
            <div class="container">
              <span class="eyebrow">Today in EventFlow</span>
              <h2 class="section-title" style="font-size:clamp(30px,4.5vw,48px)">Know what is happening now.</h2>
              <div class="live-event-card">
                <div class="event-main">
                  <span class="pill pill-live">LIVE NOW</span>
                  <h3 class="event-title">${demoEvent.name} — ${demoEvent.match}</h3>
                  <p class="section-sub" style="font-size:14px">EventFlow is watching the full event journey: arrival, parking, gates, seats, food areas, travel, stay and exit.</p>
                  <div class="event-facts">
                    <div class="fact"><strong>${demoEvent.venue}</strong><br>${demoEvent.city}</div>
                    <div class="fact"><strong>${demoEvent.start}</strong><br>Match starts</div>
                    <div class="fact"><strong>East Gate</strong><br>Best gate now</div>
                    <div class="fact"><strong>84 / 100</strong><br>Event score</div>
                  </div>
                </div>
                <div class="event-side">
                  <div class="eyebrow">Simple live message</div>
                  <h3 style="font-size:25px;letter-spacing:-.035em;margin:12px 0 10px">North Gate is busy.</h3>
                  <p style="color:var(--muted);line-height:1.65;margin:0 0 20px">Guests going to Blocks C and D can use East Gate. It is faster and has less crowd right now.</p>
                  <button class="btn btn-primary" data-demo-role="attendee">See attendee view</button>
                </div>
              </div>
            </div>
          </section>

          <section class="section" id="how">
            <div class="container">
              <span class="eyebrow">What EventFlow does</span>
              <h2 class="section-title">One event. One clear flow.</h2>
              <p class="section-sub">Large events can feel confusing. EventFlow keeps the most useful information in one simple place.</p>
              <div class="problem-grid">
                ${landingCard('01','Find the right gate','See which gate is busy and which gate is easier right now.')}
                ${landingCard('02','Reach your seat faster','Use your ticket to see the gate and path that fits your seat.')}
                ${landingCard('03','Help teams act early','Management sees crowd changes and can send simple tasks to operators.')}
                ${landingCard('04','Plan the full journey','Arrival, parking, hotel, event time and exit can be seen together.')}
              </div>
            </div>
          </section>

          <section class="section-tight">
            <div class="container">
              <span class="eyebrow">From start to finish</span>
              <h2 class="section-title" style="font-size:clamp(30px,4.5vw,48px)">EventFlow stays with the full event journey.</h2>
              <div class="feature-grid">
                ${landingCard('A','Before the event','See event time, travel options, parking, stay and when you should leave.')}
                ${landingCard('B','At the stadium','Use your ticket to find the best gate, shorter wait and fastest seat path.')}
                ${landingCard('C','During the event','Get simple updates for food areas, timing, help points and travel changes.')}
                ${landingCard('D','When the event ends','See a better exit, shuttle, parking or metro option before everyone leaves together.')}
                ${landingCard('E','For the event team','Management sees the full event and sends clear jobs when something gets busy.')}
                ${landingCard('F','For service teams','Operators see only their tasks, resources and the work they need to finish.')}
              </div>
            </div>
          </section>

          <section class="section" style="background:rgba(255,255,255,.56)" id="roles">
            <div class="container">
              <span class="eyebrow">Three views</span>
              <h2 class="section-title">Everyone sees only what they need.</h2>
              <div class="role-grid">
                ${roleLandingCard('01','Event Management','See the whole event','Crowd, gates, parking, travel, alerts and team work on one screen.','management')}
                ${roleLandingCard('02','Operator','Do the next task','Service teams see jobs, resources and what needs attention now.','operator')}
                ${roleLandingCard('03','Attendee','Know where to go','Upload your ticket, see your best gate, route, seat, travel and event plan.','attendee')}
              </div>
            </div>
          </section>

          <section class="section">
            <div class="container" style="text-align:center">
              <span class="eyebrow">Ready to try it?</span>
              <h2 class="section-title">Make the event easy to understand.</h2>
              <p class="section-sub" style="margin:0 auto 25px">Create a local account and open the view you need. Your demo data stays in this browser.</p>
              <button class="btn btn-primary" data-go-auth="signup">Create account</button>
            </div>
          </section>
        </main>
      </div>`;

    bindLanding();
  }

  function landingCard(num, title, text) {
    return `<article class="info-card"><div class="info-icon">${num}</div><h3>${title}</h3><p>${text}</p></article>`;
  }

  function roleLandingCard(num, title, sub, text, role) {
    return `<article class="info-card role-card"><span class="role-num">VIEW ${num}</span><h3 style="font-size:23px;margin-top:12px">${title}</h3><div style="font-weight:800;color:var(--blue);font-size:13px;margin-bottom:10px">${sub}</div><p>${text}</p><button class="btn btn-soft btn-small" style="margin-top:18px" data-demo-role="${role}">Open demo</button></article>`;
  }

  function bindLanding() {
    $$('[data-go-auth]').forEach(btn => btn.addEventListener('click', () => {
      state.authMode = btn.dataset.goAuth;
      state.view = 'auth';
      render();
    }));
    $$('[data-demo-role]').forEach(btn => btn.addEventListener('click', () => demoLogin(btn.dataset.demoRole)));
  }

  function renderAuth() {
    const isSignup = state.authMode === 'signup';
    app.innerHTML = `
      <div class="auth-page">
        <section class="auth-art">
          <div>${brandHTML()}</div>
          <div>
            <span class="pill">Simple event help</span>
            <h2>${isSignup ? 'Create your EventFlow account.' : 'Welcome back to EventFlow.'}</h2>
            <p>${isSignup ? 'Choose your role. Your account will be saved only in this browser for this demo.' : 'Sign in to see your event view. You can also use a demo account.'}</p>
          </div>
          <div style="color:var(--muted);font-size:12px">${demoEvent.name} · ${shortDate}</div>
        </section>
        <section class="auth-panel">
          <div class="auth-box">
            <button class="btn btn-secondary btn-small" id="backHome">← Back to home</button>
            <div class="auth-tabs" style="margin-top:22px">
              <button class="auth-tab ${!isSignup ? 'active' : ''}" data-auth-tab="signin">Sign in</button>
              <button class="auth-tab ${isSignup ? 'active' : ''}" data-auth-tab="signup">Create account</button>
            </div>
            <form id="authForm">
              ${isSignup ? `<div class="form-group"><label class="form-label" for="name">Your name</label><input class="form-control" id="name" required placeholder="Enter your name"></div>` : ''}
              <div class="form-group"><label class="form-label" for="email">Email</label><input class="form-control" id="email" type="email" required placeholder="name@example.com"></div>
              <div class="form-group"><label class="form-label" for="password">Password</label><input class="form-control" id="password" type="password" required minlength="4" placeholder="At least 4 characters"></div>
              ${isSignup ? `
                <div class="form-label">Choose your role</div>
                <div class="role-select">
                  ${authRoleOption('management','Management','See the whole event')}
                  ${authRoleOption('operator','Operator','Work on event tasks')}
                  ${authRoleOption('attendee','Attendee','Get your event journey')}
                </div>` : ''}
              <button class="btn btn-primary" style="width:100%" type="submit">${isSignup ? 'Create account' : 'Sign in'}</button>
            </form>
            <div class="or-line">or use a demo</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              <button class="btn btn-secondary btn-small" data-demo-login="management">Management</button>
              <button class="btn btn-secondary btn-small" data-demo-login="operator">Operator</button>
              <button class="btn btn-secondary btn-small" data-demo-login="attendee">Attendee</button>
            </div>
            <div class="local-note"><strong>Demo note:</strong> Sign up and sign in work only in this browser using local storage. No database is connected right now.</div>
          </div>
        </section>
      </div>`;

    $('#backHome').addEventListener('click', () => setView('landing'));
    $$('[data-auth-tab]').forEach(b => b.addEventListener('click', () => { state.authMode = b.dataset.authTab; render(); }));
    $$('[data-role]').forEach(b => b.addEventListener('click', () => { state.authRole = b.dataset.role; render(); }));
    $$('[data-demo-login]').forEach(b => b.addEventListener('click', () => demoLogin(b.dataset.demoLogin)));
    $('#authForm').addEventListener('submit', handleAuth);
  }

  function authRoleOption(role, title, text) {
    return `<button class="role-option ${state.authRole === role ? 'active' : ''}" type="button" data-role="${role}"><b>${title}</b><span>${text}</span></button>`;
  }

  function handleAuth(e) {
    e.preventDefault();
    const email = $('#email').value.trim().toLowerCase();
    const password = $('#password').value;
    const users = readJSON(STORE.users, []);
    if (state.authMode === 'signup') {
      const name = $('#name').value.trim();
      if (users.some(u => u.email === email)) return toast('Account already exists', 'Please sign in with this email.');
      const user = { id:'u-'+Date.now(), name, email, password, role:state.authRole };
      users.push(user);
      localStorage.setItem(STORE.users, JSON.stringify(users));
      startSession(user);
      toast('Account created', `Welcome, ${name}.`);
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return toast('Sign in failed', 'Check your email and password.');
      startSession(user);
      toast('Signed in', `Opening ${roleTitle(user.role)} view.`);
    }
  }

  function demoLogin(role) {
    const users = readJSON(STORE.users, []);
    const user = users.find(u => u.role === role) || {id:'demo', name:'Demo User', email:'demo@eventflow.local', role};
    startSession(user);
  }

  function startSession(user) {
    state.session = { id:user.id, name:user.name, email:user.email, role:user.role };
    localStorage.setItem(STORE.session, JSON.stringify(state.session));
    state.view = 'dashboard';
    state.activePage = firstPageForRole(user.role);
    state.ticketVerified = false;
    render();
  }

  function logout() {
    localStorage.removeItem(STORE.session);
    state.session = null;
    state.view = 'landing';
    state.activePage = 'home';
    render();
    toast('Signed out', 'Your local demo account is still saved in this browser.');
  }

  function brandHTML() {
    return `<div class="brand"><span class="brand-mark">E</span><span>EventFlow</span></div>`;
  }

  const menus = {
    management: [
      ['command','home','Command Center'], ['stadium','map','Stadium View'], ['crowd','crowd','Crowd & Gates'], ['travel','bus','Travel & Parking'], ['stay','bed','Hotels & Stay'], ['actions','spark','Smart Actions'], ['alerts','alert','Alerts'], ['timeline','time','Event Plan'], ['analytics','chart','Reports']
    ],
    operator: [
      ['overview','home','Overview'], ['tasks','task','My Tasks'], ['resources','box','Resources'], ['travel','bus','Travel Work'], ['stay','bed','Hotel Work'], ['messages','message','Messages'], ['reports','chart','Reports']
    ],
    attendee: [
      ['journey','route','My Journey'], ['stadium','map','Stadium Map'], ['ticket','ticket','My Ticket'], ['travel','bus','Travel'], ['stay','bed','Stay'], ['event','event','My Event'], ['alerts','bell','My Alerts']
    ]
  };

  function renderDashboard() {
    if (!state.session) return setView('landing');
    const role = state.session.role;
    const menu = menus[role];
    app.innerHTML = `
      <div class="dashboard-shell">
        <aside class="sidebar ${state.mobileOpen ? 'open' : ''}" id="sidebar">
          ${brandHTML()}
          <div class="role-badge"><small>Your view</small><strong>${roleTitle(role)}</strong></div>
          <nav class="side-nav">
            ${menu.map(([id,ic,label]) => `<button class="side-link ${state.activePage === id ? 'active' : ''}" data-page="${id}"><span class="side-icon">${icon(ic)}</span><span>${label}</span></button>`).join('')}
          </nav>
          <div class="sidebar-bottom">
            <div class="user-mini"><strong>${escapeHTML(state.session.name)}</strong><span>${escapeHTML(state.session.email)}</span></div>
            <button class="btn btn-secondary btn-small" id="logoutBtn">Sign out</button>
          </div>
        </aside>
        <div class="mobile-overlay ${state.mobileOpen ? 'show' : ''}" id="mobileOverlay"></div>
        <main class="dashboard-main">
          <header class="dash-topbar">
            <div style="display:flex;align-items:center;gap:10px">
              <button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">${icon('menu')}</button>
              <div class="topbar-title"><small>${demoEvent.match}</small><strong>${demoEvent.venue}</strong></div>
            </div>
            <div class="topbar-actions">
              <span class="pill pill-live">LIVE · ${shortDate}</span>
              ${role === 'management' ? '<button class="btn btn-secondary btn-small" id="demoSurgeTop">Make North Gate busy</button>' : ''}
              <button class="icon-btn" id="helpBtn" aria-label="Help">?</button>
            </div>
          </header>
          <div class="dashboard-content" id="dashboardContent">${pageFor(role, state.activePage)}</div>
        </main>
      </div>`;

    bindDashboard();
    startLightSimulation();
  }

  function bindDashboard() {
    $$('[data-page]').forEach(b => b.addEventListener('click', () => navTo(b.dataset.page)));
    $('#logoutBtn').addEventListener('click', logout);
    $('#mobileMenuBtn')?.addEventListener('click', () => { state.mobileOpen = true; renderDashboard(); });
    $('#mobileOverlay')?.addEventListener('click', () => { state.mobileOpen = false; renderDashboard(); });
    $('#helpBtn')?.addEventListener('click', openHelp);
    $('#demoSurgeTop')?.addEventListener('click', triggerCrowdSurge);
    bindPageEvents();
  }

  function pageFor(role, page) {
    if (role === 'management') return managementPage(page);
    if (role === 'operator') return operatorPage(page);
    return attendeePage(page);
  }

  function pageHead(eyebrow, title, sub, action='') {
    return `<div class="page-head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;
  }

  function managementPage(page) {
    switch(page) {
      case 'stadium': return managementStadium();
      case 'crowd': return crowdPage();
      case 'travel': return managementTravel();
      case 'stay': return managementStay();
      case 'actions': return actionsPage();
      case 'alerts': return alertsPage(true);
      case 'timeline': return timelinePage(true);
      case 'analytics': return analyticsPage();
      default: return commandCenter();
    }
  }

  function commandCenter() {
    const g = state.shared.gates;
    return `
      ${pageHead('Event Management','See the full event clearly.','This screen shows the most important things happening right now.', `<button class="btn btn-primary" id="crowdSurgeBtn">Make North Gate busy</button>`)}
      <div class="kpi-grid">
        ${kpi('Event Score', state.shared.eventHealth + ' / 100','Overall event is stable','trend-up')}
        ${kpi('Guests Inside','42,760','73% of expected guests','trend-up')}
        ${kpi('Best Gate','East Gate','Only '+g.East.wait+' min wait','trend-up')}
        ${kpi('Open Alerts',String(state.shared.alerts.length),'1 needs quick action','trend-warn')}
      </div>
      <div class="grid-2">
        <section class="panel">
          <div class="panel-head"><div><h3>Live Stadium View</h3><p>See where crowd is building up.</p></div><button class="btn btn-secondary btn-small" data-jump="stadium">Open full view</button></div>
          ${stadiumMapHTML('management')}
        </section>
        <div style="display:grid;gap:18px">
          <section class="panel">
            <div class="panel-head"><div><h3>Gate Status</h3><p>Green is easier. Red is very busy.</p></div></div>
            ${gateListHTML()}
          </section>
          <section class="panel">
            <div class="panel-head"><div><h3>What needs attention</h3><p>Simple actions for the event team.</p></div><button class="btn btn-soft btn-small" data-jump="actions">View all</button></div>
            ${actionMiniHTML()}
          </section>
        </div>
      </div>
      <div class="grid-2-equal">
        <section class="panel"><div class="panel-head"><div><h3>Event Plan</h3><p>What is happening next.</p></div></div>${timelineListHTML(5)}</section>
        <section class="panel"><div class="panel-head"><div><h3>Team Work</h3><p>Jobs sent to operators.</p></div></div>${taskListHTML(3,true)}</section>
      </div>`;
  }

  function managementStadium() {
    return `${pageHead('Live Stadium','See crowd around the stadium.','Tap a gate to see its crowd, wait time and seat blocks.', `<button class="btn btn-primary" id="crowdSurgeBtn">Make North Gate busy</button>`)}
      <div class="grid-2">
        <section class="panel">${stadiumMapHTML('management')}</section>
        <section class="panel"><div class="panel-head"><div><h3>Gate Details</h3><p>Best gate is based on crowd and wait time.</p></div></div>${gateListHTML(true)}<div style="margin-top:16px;padding:14px;border-radius:15px;background:#eef9f4;border:1px solid #d7eee2"><strong style="font-size:13px">Best move now</strong><p style="margin:5px 0 0;color:#567568;font-size:12px;line-height:1.55">Send Blocks C and D to East Gate. It has less crowd and a faster entry line.</p></div></section>
      </div>`;
  }

  function crowdPage() {
    return `${pageHead('Crowd & Gates','Keep people moving safely.','See which gate is getting busy and move guests before the wait becomes too long.', `<button class="btn btn-primary" id="crowdSurgeBtn">Run crowd demo</button>`)}
      <div class="kpi-grid">${kpi('North Gate',state.shared.gates.North.crowd+'%','Very busy','trend-warn')}${kpi('East Gate',state.shared.gates.East.crowd+'%','Best choice','trend-up')}${kpi('South Gate',state.shared.gates.South.crowd+'%','Medium crowd','')}${kpi('West Gate',state.shared.gates.West.crowd+'%','High crowd','trend-warn')}</div>
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>All Gates</h3><p>Current crowd and wait time.</p></div></div>${gateListHTML(true)}</section><section class="panel"><div class="panel-head"><div><h3>Next 30 Minutes</h3><p>Simple crowd estimate.</p></div></div>${crowdChartHTML()}</section></div>`;
  }

  function managementTravel() {
    const p=state.shared.parking,t=state.shared.transport;
    return `${pageHead('Travel & Parking','Keep arrival and exit smooth.','See parking, shuttle and metro load in one simple view.')}
      <div class="kpi-grid">${kpi('Shuttles Ready',t.shuttles,'6 near the stadium','trend-up')}${kpi('Buses Ready',t.buses,'2 extra can be sent','')}${kpi('Metro Load',t.metroLoad+'%','Busy but moving','trend-warn')}${kpi('Taxis Near Venue',t.taxis,'Average wait 7 min','')}</div>
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Parking</h3><p>Show drivers a parking area with more space.</p></div></div>${Object.entries(p).map(([name,v])=>resourceMeter(`Parking ${name}`,`${100-v}% spaces left`,v)).join('')}</section><section class="panel"><div class="panel-head"><div><h3>Travel Message</h3><p>What guests should know.</p></div></div><div class="action-card"><span class="severity sev-med">BUSY</span><h4>Parking P1 is almost full</h4><p>New drivers should use Parking P3. It has more space and a shuttle to East Gate.</p><div class="action-impact">Expected result: less waiting near P1</div><div class="action-buttons"><button class="btn btn-primary btn-small" id="sendParkingMsg">Send guest message</button></div></div></section></div>`;
  }

  function managementStay() {
    return `${pageHead('Hotels & Stay','Help guests find a place to stay.','See rooms left, distance and shuttle help from nearby partner hotels.')}
      <div class="kpi-grid">${kpi('Rooms Left','127','Across 3 partner hotels','trend-up')}${kpi('Closest Stay','1.8 km','City Grand','')}${kpi('Shuttle Hotels','2','Direct event shuttle','')}${kpi('Late Guests','64','May need rooms after 11 PM','trend-warn')}</div>
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Hotel Rooms</h3><p>Simple room view for the event team.</p></div></div>${hotelListHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Stay Plan</h3><p>Best next step.</p></div></div><div class="action-card"><span class="severity sev-med">PLAN</span><h4>Keep 40 rooms ready</h4><p>Late guests may need rooms after the match. Hold rooms at Vista Stay first because it has a direct shuttle.</p><div class="action-buttons"><button class="btn btn-primary btn-small" id="assignHotelTask">Send task to operator</button></div></div></section></div>`;
  }

  function actionsPage() {
    return `${pageHead('Smart Actions','See simple suggestions.','EventFlow turns crowd and travel changes into clear actions. You can approve or ignore each one.')}
      <div class="grid-2-equal">
        <section class="panel"><div class="panel-head"><div><h3>Suggested now</h3><p>Based on the current demo data.</p></div></div>
          ${fullAction('high','North Gate is too busy','Send 700 guests to East Gate.','North Gate can drop from 91% to about 72%.','reroute')}
          ${fullAction('medium','Parking P1 is almost full','Show Parking P3 to new drivers.','Less road waiting near P1.','parking')}
          ${fullAction('medium','More shuttle seats may be needed','Send 3 extra shuttle buses to East Gate.','Shorter travel wait after the match.','shuttle')}
        </section>
        <section class="panel"><div class="panel-head"><div><h3>After you approve</h3><p>The operator sees the job and the attendee gets a clear message.</p></div></div>${taskListHTML(6,true)}</section>
      </div>`;
  }

  function fullAction(level,title,text,impact,key) {
    return `<div class="action-card"><div class="action-top"><span class="severity ${level==='high'?'sev-high':'sev-med'}">${level==='high'?'HIGH':'MEDIUM'}</span><span style="font-size:10px;color:var(--muted)">Live suggestion</span></div><h4>${title}</h4><p>${text}</p><div class="action-impact">${impact}</div><div class="action-buttons"><button class="btn btn-primary btn-small" data-approve="${key}">Approve</button><button class="btn btn-secondary btn-small" data-ignore="${key}">Ignore</button></div></div>`;
  }

  function alertsPage(management=false) {
    return `${pageHead(management?'Event Alerts':'My Alerts',management?'Know what needs attention.':'Updates for your event.','Important messages are kept short and easy to understand.')}
      <div class="grid-2"><section class="panel"><div class="panel-head"><div><h3>Live alerts</h3><p>Newest message comes first.</p></div></div>${alertListHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Alert guide</h3><p>What the colors mean.</p></div></div>${alertGuideHTML()}</section></div>`;
  }

  function timelinePage(management=false) {
    return `${pageHead('Event Plan',management?'See the full event day.':'Know what happens next.','The event plan keeps arrival, match time and exit in one simple timeline.')}
      <div class="grid-2"><section class="panel"><div class="panel-head"><div><h3>${shortDate}</h3><p>${demoEvent.name}</p></div></div>${timelineListHTML(10)}</section><section class="panel"><div class="panel-head"><div><h3>Busy times</h3><p>When more people may move at the same time.</p></div></div>${busyTimesHTML()}</section></div>`;
  }

  function analyticsPage() {
    return `${pageHead('Reports','See what is working.','Simple charts show crowd, travel and gate movement for the event.')}
      <div class="kpi-grid">${kpi('Average Gate Wait','14 min','4 min better than last hour','trend-up')}${kpi('Best Gate Use','East 31%','More guests moved to East','trend-up')}${kpi('Parking Use','68%','Across all parking areas','')}${kpi('Guest Travel Time','27 min','Average arrival time','')}</div>
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Crowd by time</h3><p>Demo event data.</p></div></div>${simpleBarChart([28,42,58,76,91,82,70,62],['4','5','6','7','8','9','10','11'])}</section><section class="panel"><div class="panel-head"><div><h3>Gate use</h3><p>Percent of guest entry.</p></div></div>${simpleBarChart([29,31,21,19],['North','East','South','West'])}</section></div>`;
  }

  function operatorPage(page) {
    switch(page) {
      case 'tasks': return operatorTasks();
      case 'resources': return operatorResources();
      case 'travel': return operatorTravel();
      case 'stay': return operatorStay();
      case 'messages': return operatorMessages();
      case 'reports': return operatorReports();
      default: return operatorOverview();
    }
  }

  function operatorOverview() {
    const pending=state.shared.tasks.filter(t=>t.status!=='Done').length;
    return `${pageHead('Operator','Know what to do next.','You only see the work and resources that your team needs.', `<button class="btn btn-primary" data-jump="tasks">Open my tasks</button>`)}
      <div class="kpi-grid">${kpi('Open Tasks',pending,'Newest task is at the top','trend-warn')}${kpi('Shuttles Ready',state.shared.transport.shuttles,'3 can move now','trend-up')}${kpi('Parking Space','52%','Best space at P3 and P4','')}${kpi('Rooms Left','127','Partner hotels','')}</div>
      <div class="grid-2"><section class="panel"><div class="panel-head"><div><h3>My Tasks</h3><p>Start with the high priority job.</p></div><button class="btn btn-soft btn-small" data-jump="tasks">View all</button></div>${taskListHTML(4,false)}</section><section class="panel"><div class="panel-head"><div><h3>Live Event Message</h3><p>What the management team wants now.</p></div></div><div class="action-card"><span class="severity sev-high">HIGH</span><h4>Help East Gate take more guests</h4><p>North Gate is busy. Keep shuttles and entry lines ready near East Gate.</p><div class="action-impact">Guests should see a shorter wait.</div></div></section></div>`;
  }

  function operatorTasks() {
    return `${pageHead('My Tasks','Do one clear job at a time.','Accept a task, mark it in progress, then finish it. Management sees the same status.')}
      <section class="panel"><div class="panel-head"><div><h3>Task list</h3><p>${state.shared.tasks.filter(t=>t.status!=='Done').length} tasks still open.</p></div></div>${taskListHTML(20,false)}</section>`;
  }

  function operatorResources() {
    return `${pageHead('Resources','Know what your team has ready.','Update the demo resources and use them for event work.')}
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Travel resources</h3><p>Buses, shuttles and parking.</p></div></div>${resourceMeter('Shuttle buses','18 ready',64)}${resourceMeter('Event buses','11 ready',55)}${resourceMeter('Taxi pickup space','86 taxis nearby',72)}${resourceMeter('Parking P3','52% space left',48)}</section><section class="panel"><div class="panel-head"><div><h3>Hotel resources</h3><p>Rooms that can still be used.</p></div></div>${state.shared.hotels.map(h=>resourceMeter(h.name,`${h.rooms} rooms left`,Math.max(10,100-h.rooms))).join('')}</section></div>`;
  }

  function operatorTravel() {
    return `${pageHead('Travel Work','Keep people moving.','These jobs help guests reach the stadium and leave smoothly.')}
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Travel Tasks</h3><p>Only travel-related work.</p></div></div>${taskListFiltered(['shuttle','Parking','entry'],false)}</section><section class="panel"><div class="panel-head"><div><h3>Parking Status</h3><p>See where more cars can go.</p></div></div>${Object.entries(state.shared.parking).map(([name,v])=>resourceMeter(`Parking ${name}`,`${100-v}% space left`,v)).join('')}</section></div>`;
  }

  function operatorStay() {
    return `${pageHead('Hotel Work','Help guests who need a stay.','See rooms left and any hotel job sent by management.')}
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Partner hotels</h3><p>Current demo room count.</p></div></div>${hotelListHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Hotel Task</h3><p>Simple work for the hotel partner.</p></div></div>${taskListFiltered(['hotel','room'],false)}</section></div>`;
  }

  function operatorMessages() {
    return `${pageHead('Messages','Short updates from management.','No long reports. Only clear messages that help you act.')}
      <section class="panel"><div class="alert-list">${state.shared.alerts.map(a=>`<div class="alert-item"><span class="alert-dot" style="background:${a.level==='high'?'var(--red)':a.level==='medium'?'var(--amber)':'var(--blue)'}"></span><div><strong>${a.title}</strong><p>${a.text}</p></div><span class="alert-time">${a.time}</span></div>`).join('')}</div></section>`;
  }

  function operatorReports() {
    return `${pageHead('Reports','See your team work.','A simple view of tasks finished and resources used.')}
      <div class="kpi-grid">${kpi('Tasks Done',state.shared.tasks.filter(t=>t.status==='Done').length,'Today','trend-up')}${kpi('Tasks Open',state.shared.tasks.filter(t=>t.status!=='Done').length,'Needs work','trend-warn')}${kpi('Shuttles Used','12','Out of 18','')}${kpi('Guest Help','1,840','Guests supported','trend-up')}</div><section class="panel" style="margin-top:18px"><div class="panel-head"><div><h3>Work by hour</h3><p>Demo data.</p></div></div>${simpleBarChart([12,18,24,31,29,22,16],['4','5','6','7','8','9','10'])}</section>`;
  }

  function attendeePage(page) {
    switch(page) {
      case 'stadium': return attendeeStadium();
      case 'ticket': return attendeeTicketPage();
      case 'travel': return attendeeTravel();
      case 'stay': return attendeeStay();
      case 'event': return attendeeEvent();
      case 'alerts': return alertsPage(false);
      default: return attendeeJourney();
    }
  }

  function attendeeJourney() {
    if (!state.ticketVerified) {
      return `${pageHead('My Journey','Start with your ticket.','Add your ticket photo or ticket number. EventFlow will then show the best gate and route for your seat.')}
        <div class="ticket-gate">
          <section class="panel">${ticketFormHTML()}</section>
          <section class="journey-card">
            <span class="pill">What happens next?</span>
            <h2>Your event path becomes simple.</h2>
            <p>After your ticket is added, you will see your seat block, best gate, gate crowd, walking time, travel help and event timing.</p>
            <div class="journey-stats"><div class="journey-stat"><strong>1</strong><span>Add ticket</span></div><div class="journey-stat"><strong>2</strong><span>See best gate</span></div><div class="journey-stat"><strong>3</strong><span>Follow your route</span></div></div>
          </section>
        </div>`;
    }
    const t=state.ticket;
    return `${pageHead('My Journey','Your event path is ready.',state.shared.attendeeNotice, `<button class="btn btn-secondary" data-jump="stadium">Open stadium map</button>`)}
      <div class="journey-hero">
        <section class="journey-card">
          <span class="pill pill-live">YOUR BEST ROUTE</span>
          <h2>${t.gate} Gate → Block ${t.block}</h2>
          <p>Use ${t.gate} Gate. It has less crowd and gets you closer to your seat.</p>
          <div class="journey-stats"><div class="journey-stat"><strong>${state.shared.gates[t.gate].wait} min</strong><span>Gate wait</span></div><div class="journey-stat"><strong>${t.walk} min</strong><span>Walk to seat</span></div><div class="journey-stat"><strong>${t.seat}</strong><span>Your seat</span></div></div>
        </section>
        <section class="panel"><div class="panel-head"><div><h3>What to do now</h3><p>Follow these simple steps.</p></div></div>${personalJourneyTimeline()}</section>
      </div>
      <div class="grid-2">
        <section class="panel"><div class="panel-head"><div><h3>Stadium Map</h3><p>Your route is shown in blue.</p></div><button class="btn btn-secondary btn-small" data-jump="stadium">Open full map</button></div>${stadiumMapHTML('attendee')}</section>
        <div style="display:grid;gap:18px"><section class="panel"><div class="panel-head"><div><h3>Gate Choices</h3><p>Best option comes first.</p></div></div>${attendeeRouteOptions()}</section><section class="panel"><div class="panel-head"><div><h3>Event Today</h3><p>Keep the main times with you.</p></div></div>${timelineListHTML(4)}</section></div>
      </div>`;
  }

  function attendeeTicketPage() {
    return `${pageHead('My Ticket','Add or check your ticket.','Your ticket helps EventFlow show the right gate and seat path.')}
      <div class="grid-2-equal"><section class="panel">${ticketFormHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Ticket details</h3><p>Demo seat details after your ticket is added.</p></div></div>${state.ticketVerified ? ticketDetailsHTML() : `<div style="padding:36px 10px;text-align:center;color:var(--muted)">Add your ticket to see seat and gate details.</div>`}</section></div>`;
  }

  function attendeeStadium() {
    return `${pageHead('Stadium Map','See where to go.','Red means very busy. Green means easier. Your blue route points to the best gate for your seat.')}
      <div class="grid-2"><section class="panel">${stadiumMapHTML('attendee')}</section><section class="panel"><div class="panel-head"><div><h3>Your route</h3><p>${state.ticketVerified ? 'Based on your ticket and current gate crowd.' : 'Add your ticket first for a personal route.'}</p></div></div>${state.ticketVerified ? attendeeRouteOptions() : `<button class="btn btn-primary" data-jump="ticket">Add my ticket</button>`}</section></div>`;
  }

  function attendeeTravel() {
    return `${pageHead('Travel','Reach the event with less waiting.','Pick the option that feels easiest for you.')}
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Best ways to arrive</h3><p>Based on current demo crowd.</p></div></div>${travelOptionsHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Parking</h3><p>If you are coming by car.</p></div></div>${Object.entries(state.shared.parking).map(([name,v])=>resourceMeter(`Parking ${name}`,`${100-v}% space left`,v)).join('')}<div style="margin-top:14px;padding:12px;border-radius:13px;background:#eef9f4;color:#4d735f;font-size:12px"><strong>Best choice:</strong> Parking P3 has more space and a shuttle to East Gate.</div></section></div>`;
  }

  function attendeeStay() {
    return `${pageHead('Stay','Find a simple stay near the event.','See rooms left, price, distance and shuttle help.')}
      <section class="panel"><div class="panel-head"><div><h3>Nearby stays</h3><p>Demo partner hotels.</p></div></div>${hotelListHTML(true)}</section>`;
  }

  function attendeeEvent() {
    return `${pageHead('My Event',`${demoEvent.match}`,'All the important event details in one place.')}
      <div class="grid-2-equal"><section class="panel"><div class="panel-head"><div><h3>Event details</h3><p>${demoEvent.name}</p></div></div>${eventDetailsHTML()}</section><section class="panel"><div class="panel-head"><div><h3>Today’s plan</h3><p>What happens next.</p></div></div>${timelineListHTML(8)}</section></div>`;
  }

  function ticketFormHTML() {
    return `<div class="panel-head"><div><h3>${state.ticketVerified ? 'Ticket added' : 'Add your ticket'}</h3><p>Use a photo or enter the ticket number.</p></div></div>
      ${state.ticketVerified ? `<div class="ticket-success"><div class="upload-icon" style="margin:0;background:#dcf2e6;color:var(--green)">✓</div><div><b>${escapeHTML(state.ticket.number)}</b><span>Block ${state.ticket.block} · ${state.ticket.seat} · ${state.ticket.gate} Gate</span></div></div><button class="btn btn-secondary btn-small" style="margin-top:12px" id="changeTicket">Change ticket</button>` : `
      <div class="ticket-upload"><input type="file" id="ticketFile" accept="image/*"><div><div class="upload-icon">${icon('ticket')}</div><h4>Upload ticket photo</h4><p>Tap here and choose the ticket image from your phone.</p></div></div>
      <div id="fileName" style="margin-top:8px;color:var(--muted);font-size:11px"></div>
      <div class="or-line">or</div>
      <label class="form-label" for="ticketNumber">Ticket number</label>
      <div class="ticket-number-wrap"><input class="form-control" id="ticketNumber" placeholder="Example: EVF-482913"><button class="btn btn-primary" id="verifyTicket">Show my route</button></div>
      <div class="local-note">For this local demo, EventFlow creates a sample seat route from your ticket number or uploaded ticket. No ticket image is sent anywhere.</div>`}`;
  }

  function ticketDetailsHTML() {
    const t=state.ticket;
    return `<div class="resource-list">
      ${detailRow('Ticket',t.number)}${detailRow('Seat block',`Block ${t.block}`)}${detailRow('Seat',t.seat)}${detailRow('Best gate',`${t.gate} Gate`)}${detailRow('Gate wait',`${state.shared.gates[t.gate].wait} minutes`)}${detailRow('Walk to seat',`${t.walk} minutes`)}
    </div>`;
  }

  function detailRow(label,value) { return `<div style="display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)"><span style="color:var(--muted);font-size:12px">${label}</span><strong style="font-size:12px;text-align:right">${value}</strong></div>`; }

  function verifyTicket(source='number') {
    let number = ($('#ticketNumber')?.value || '').trim();
    const file = $('#ticketFile')?.files?.[0];
    if (!number && !file) return toast('Add your ticket', 'Upload a photo or enter a ticket number.');
    if (!number) number = 'IMG-' + String(file.name).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase();
    const hash = [...number].reduce((a,c)=>a+c.charCodeAt(0),0);
    const blocks=['C12','D08','C07','D14','E03','B11'];
    const block = blocks[hash % blocks.length];
    const bestGate = chooseBestGateForBlock(block);
    state.ticket = { number, block, seat:`Row ${8 + hash%18}, Seat ${12 + hash%30}`, gate:bestGate, walk:5 + hash%6 };
    state.ticketVerified = true;
    state.selectedGate = bestGate;
    toast('Ticket added', `${bestGate} Gate is your best route right now.`);
    renderDashboard();
  }

  function chooseBestGateForBlock(block) {
    const preferred = block.startsWith('C') || block.startsWith('D') ? ['East','South','North','West'] : ['South','West','East','North'];
    return preferred.sort((a,b)=>(state.shared.gates[a].crowd + state.shared.gates[a].wait*1.2) - (state.shared.gates[b].crowd + state.shared.gates[b].wait*1.2))[0];
  }

  function kpi(label, value, foot, trend='') {
    return `<div class="kpi-card"><div class="kpi-label"><span>${label}</span><span>•</span></div><div class="kpi-value">${value}</div><div class="kpi-foot ${trend}">${foot}</div></div>`;
  }

  function stadiumMapHTML(mode='management') {
    const g=state.shared.gates;
    const selected=state.selectedGate;
    const attendee = mode==='attendee';
    const target = attendee && state.ticketVerified ? state.ticket.gate : selected;
    return `<div class="stadium-map" data-stadium-map>
      <div class="map-bg-grid"></div><div class="road road-a"></div><div class="road road-b"></div><div class="road road-c"></div>
      <div class="crowd-halo crowd-${statusColor(g.North.crowd)}" style="width:150px;height:150px;left:calc(50% - 75px);top:0"></div>
      <div class="crowd-halo crowd-${statusColor(g.East.crowd)}" style="width:130px;height:130px;right:0;top:calc(50% - 65px)"></div>
      <div class="crowd-halo crowd-${statusColor(g.South.crowd)}" style="width:130px;height:130px;left:calc(50% - 65px);bottom:0"></div>
      <div class="crowd-halo crowd-${statusColor(g.West.crowd)}" style="width:135px;height:135px;left:0;top:calc(50% - 68px)"></div>
      <div class="stadium-3d"><div class="stadium-outer"></div><div class="stadium-mid"></div><div class="seat-zone"></div><div class="stadium-field"></div></div>
      ${mapGate('North',g.North,selected)}${mapGate('East',g.East,selected)}${mapGate('South',g.South,selected)}${mapGate('West',g.West,selected)}
      <div class="map-place place-parking">Parking P3</div><div class="map-place place-metro">Metro East</div><div class="map-place place-medical">Medical Help</div><div class="map-place place-food">Food Zone</div>
      ${attendee && state.ticketVerified ? `<div class="user-pin" title="You are here"></div><div class="flow-route route-to-east"></div><div class="flow-route route-to-seat"></div>` : ''}
      <div class="map-overlay-top"><div class="map-chip">${attendee ? (state.ticketVerified ? `Your route → ${target} Gate` : 'Add ticket for your route') : 'Live crowd view'}</div><div class="map-chip">Updated now</div></div>
      <div class="map-legend"><span><i style="background:var(--green)"></i>Low</span><span><i style="background:var(--amber)"></i>Medium</span><span><i style="background:var(--orange)"></i>High</span><span><i style="background:var(--red)"></i>Very High</span></div>
    </div>`;
  }

  function mapGate(name,data,selected) {
    return `<button class="map-gate gate-${name.toLowerCase()} ${selected===name?'selected':''}" data-gate="${name}"><strong><span class="status-dot" style="background:${colorValue(statusColor(data.crowd))}"></span>${name} Gate</strong><span>${data.crowd}% · ${data.wait} min</span></button>`;
  }

  function gateListHTML(clickable=false) {
    return `<div class="gate-list">${Object.entries(state.shared.gates).map(([name,g])=>{
      const c=statusColor(g.crowd);
      return `<div class="gate-row" ${clickable?`data-gate-row="${name}" style="cursor:pointer"`:''}><div><strong>${name} Gate</strong><small>${g.people.toLocaleString('en-IN')} people · Blocks ${g.seats}</small></div><div class="meter"><i style="width:${g.crowd}%;background:${colorValue(c)}"></i></div><div class="status-text" style="color:${colorValue(c)}">${crowdWord(g.crowd)}</div></div>`;
    }).join('')}</div>`;
  }

  function actionMiniHTML() {
    return `<div class="action-card"><div class="action-top"><span class="severity sev-high">HIGH</span><span style="font-size:10px;color:var(--muted)">North Gate</span></div><h4>Move new guests to East Gate</h4><p>East Gate has a shorter wait and more room right now.</p><div class="action-buttons"><button class="btn btn-primary btn-small" data-approve="reroute">Approve</button><button class="btn btn-secondary btn-small" data-jump="actions">See details</button></div></div>`;
  }

  function alertListHTML() {
    return `<div class="alert-list">${state.shared.alerts.map(a=>`<div class="alert-item"><span class="alert-dot" style="background:${a.level==='high'?'var(--red)':a.level==='medium'?'var(--amber)':'var(--blue)'}"></span><div><strong>${a.title}</strong><p>${a.text}</p></div><span class="alert-time">${a.time}</span></div>`).join('')}</div>`;
  }

  function alertGuideHTML() {
    return `<div class="resource-list"><div class="alert-item"><span class="alert-dot" style="background:var(--red)"></span><div><strong>Red</strong><p>Needs quick action now.</p></div></div><div class="alert-item"><span class="alert-dot" style="background:var(--amber)"></span><div><strong>Yellow</strong><p>Keep watching this area.</p></div></div><div class="alert-item"><span class="alert-dot" style="background:var(--blue)"></span><div><strong>Blue</strong><p>Useful event update.</p></div></div></div>`;
  }

  function timelineListHTML(limit=8) {
    const items=[
      ['3:30 PM','Travel starts','Parking and metro teams get ready.'],['4:00 PM','Gates open','Guests start entering the stadium.'],['5:00 PM','Arrival gets busy','More shuttles move toward East and South gates.'],['6:15 PM','Main arrival time','Most guests are near the stadium.'],['7:00 PM','Match starts','Entry flow becomes lighter.'],['8:30 PM','Food break','Food areas may get busy.'],['10:20 PM','Exit plan starts','Guests see their best exit before the match ends.'],['10:45 PM','Match ends','People leave in smaller groups.'],['11:00 PM','Shuttle peak','More buses move to parking and metro.'],['11:30 PM','Event closes','Teams complete final checks.']
    ];
    return `<div class="timeline-list">${items.slice(0,limit).map(i=>`<div class="timeline-item"><div class="timeline-time">${i[0]}</div><div class="timeline-dot"></div><div class="timeline-copy"><strong>${i[1]}</strong><span>${i[2]}</span></div></div>`).join('')}</div>`;
  }

  function busyTimesHTML() {
    return `<div class="resource-list">${resourceMeter('Main arrival','6:00 PM – 6:45 PM',88)}${resourceMeter('Food areas','8:15 PM – 8:45 PM',66)}${resourceMeter('Main exit','10:35 PM – 11:10 PM',92)}${resourceMeter('Shuttle pickup','10:45 PM – 11:20 PM',81)}</div>`;
  }

  function crowdChartHTML() { return simpleBarChart([48,55,63,72,84,91],['Now','5m','10m','15m','20m','30m']); }

  function simpleBarChart(values, labels) {
    const max=Math.max(...values,100);
    return `<div class="chart">${values.map((v,i)=>`<div class="chart-bar" style="height:${Math.max(10,v/max*100)}%" title="${v}"><span>${labels[i]}</span></div>`).join('')}</div><div style="margin-top:27px;color:var(--muted);font-size:11px">Demo data updates during the live simulation.</div>`;
  }

  function resourceMeter(title, sub, value) {
    const c=statusColor(value);
    return `<div class="resource-card"><div class="resource-top"><div><strong>${title}</strong><span>${sub}</span></div><span>${value}%</span></div><div class="meter"><i style="width:${value}%;background:${colorValue(c)}"></i></div></div>`;
  }

  function hotelListHTML(attendee=false) {
    return `<div class="resource-list">${state.shared.hotels.map((h,i)=>`<div class="hotel-card"><div class="hotel-thumb">H${i+1}</div><div><strong>${h.name}</strong><span>${h.distance} · ${h.rooms} rooms left ${h.shuttle?'· Event shuttle':''}</span></div><div class="hotel-price">₹${h.price.toLocaleString('en-IN')}<br><span style="color:var(--muted);font-weight:600">per night</span>${attendee?`<br><button class="btn btn-soft btn-small" style="margin-top:7px" data-hotel="${h.name}">Choose</button>`:''}</div></div>`).join('')}</div>`;
  }

  function taskListHTML(limit=5, management=false) {
    return `<div class="task-list">${state.shared.tasks.slice(0,limit).map(t=>taskCardHTML(t,management)).join('')}</div>`;
  }

  function taskListFiltered(words,management=false) {
    const arr=state.shared.tasks.filter(t=>words.some(w=>(t.title+' '+t.detail).toLowerCase().includes(w.toLowerCase())));
    return `<div class="task-list">${arr.length?arr.map(t=>taskCardHTML(t,management)).join(''):'<div style="color:var(--muted);font-size:12px">No matching tasks right now.</div>'}</div>`;
  }

  function taskCardHTML(t,management) {
    const statusClass=t.priority==='High'?'sev-high':'sev-med';
    return `<div class="task-card"><div class="task-card-top"><div><h4>${t.title}</h4><p>${t.detail}</p></div><span class="severity ${statusClass}">${t.priority.toUpperCase()}</span></div><div class="task-meta"><span class="meta-chip">${t.owner}</span><span class="meta-chip">Status: ${t.status}</span></div>${management?'':`<div class="task-actions">${taskButtons(t)}</div>`}</div>`;
  }

  function taskButtons(t) {
    if (t.status==='Done') return `<button class="btn btn-secondary btn-small" disabled>Done</button>`;
    if (t.status==='In Progress') return `<button class="btn btn-primary btn-small" data-task-done="${t.id}">Mark done</button>`;
    if (t.status==='Accepted') return `<button class="btn btn-primary btn-small" data-task-progress="${t.id}">Start work</button>`;
    return `<button class="btn btn-primary btn-small" data-task-accept="${t.id}">Accept task</button>`;
  }

  function travelOptionsHTML() {
    return `<div class="route-list"><div class="route-option recommended"><div class="route-icon">M</div><div><strong>Metro + Event Shuttle</strong><span>Less road traffic · Shuttle to East Gate</span></div><div class="route-time">32 min</div></div><div class="route-option"><div class="route-icon">P</div><div><strong>Car + Parking P3</strong><span>More parking space · Shuttle included</span></div><div class="route-time">38 min</div></div><div class="route-option"><div class="route-icon">T</div><div><strong>Taxi</strong><span>Drop at East pickup zone</span></div><div class="route-time">35 min</div></div></div>`;
  }

  function attendeeRouteOptions() {
    const t=state.ticket;
    const gates=Object.entries(state.shared.gates).sort((a,b)=>(a[1].crowd+a[1].wait)-(b[1].crowd+b[1].wait));
    return `<div class="route-list">${gates.slice(0,3).map(([name,g],idx)=>`<div class="route-option ${name===t.gate?'recommended':''}"><div class="route-icon">${idx===0?'✓':'→'}</div><div><strong>${name} Gate ${name===t.gate?'· Best for you':''}</strong><span>${crowdWord(g.crowd)} crowd · ${g.wait} min wait</span></div><div class="route-time">${g.wait + t.walk} min</div></div>`).join('')}</div>`;
  }

  function personalJourneyTimeline() {
    const t=state.ticket;
    return `<div class="timeline-list"><div class="timeline-item"><div class="timeline-time">Now</div><div class="timeline-dot"></div><div class="timeline-copy"><strong>Go toward ${t.gate} Gate</strong><span>It has the shortest wait for your seat.</span></div></div><div class="timeline-item"><div class="timeline-time">+${state.shared.gates[t.gate].wait} min</div><div class="timeline-dot"></div><div class="timeline-copy"><strong>Enter the stadium</strong><span>Keep your ticket ready.</span></div></div><div class="timeline-item"><div class="timeline-time">+${state.shared.gates[t.gate].wait+t.walk} min</div><div class="timeline-dot"></div><div class="timeline-copy"><strong>Reach Block ${t.block}</strong><span>${t.seat}</span></div></div><div class="timeline-item"><div class="timeline-time">10:20 PM</div><div class="timeline-dot"></div><div class="timeline-copy"><strong>Check your exit message</strong><span>EventFlow will show a less crowded exit.</span></div></div></div>`;
  }

  function eventDetailsHTML() {
    return `${detailRow('Event',demoEvent.name)}${detailRow('Match',demoEvent.match)}${detailRow('Venue',demoEvent.venue)}${detailRow('City',demoEvent.city)}${detailRow('Date',demoEvent.date)}${detailRow('Gates open',demoEvent.gatesOpen)}${detailRow('Starts',demoEvent.start)}${detailRow('Expected end',demoEvent.end)}`;
  }

  function bindPageEvents() {
    $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.jump)));
    $$('[data-gate]').forEach(b=>b.addEventListener('click',()=>{ state.selectedGate=b.dataset.gate; toast(`${b.dataset.gate} Gate`, `${state.shared.gates[b.dataset.gate].crowd}% crowd · ${state.shared.gates[b.dataset.gate].wait} min wait.`); renderDashboard(); }));
    $$('[data-gate-row]').forEach(b=>b.addEventListener('click',()=>{ state.selectedGate=b.dataset.gateRow; navTo('stadium'); }));
    $('#crowdSurgeBtn')?.addEventListener('click',triggerCrowdSurge);
    $('#sendParkingMsg')?.addEventListener('click',()=>{ state.shared.attendeeNotice='Parking P1 is almost full. If you are driving, use Parking P3 for easier parking.'; saveShared(); toast('Message sent','Attendee view now shows Parking P3.'); });
    $('#assignHotelTask')?.addEventListener('click',()=>addTask('Keep 40 hotel rooms ready','Hold 40 rooms at Vista Stay for late guests.','Medium','Hotel Partner Desk'));
    $$('[data-approve]').forEach(b=>b.addEventListener('click',()=>approveAction(b.dataset.approve)));
    $$('[data-ignore]').forEach(b=>b.addEventListener('click',()=>toast('Suggestion hidden','No change was made.')));
    $$('[data-task-accept]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.taskAccept,'Accepted')));
    $$('[data-task-progress]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.taskProgress,'In Progress')));
    $$('[data-task-done]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.taskDone,'Done')));
    $$('[data-hotel]').forEach(b=>b.addEventListener('click',()=>toast('Stay saved',`${b.dataset.hotel} is saved as your preferred stay.`)));
    $('#verifyTicket')?.addEventListener('click',verifyTicket);
    $('#ticketFile')?.addEventListener('change', e=>{ const f=e.target.files?.[0]; if (f) { $('#fileName').textContent=`Selected: ${f.name}`; } });
    $('#changeTicket')?.addEventListener('click',()=>{ state.ticketVerified=false; state.ticket=null; renderDashboard(); });
  }

  function approveAction(key) {
    if (key==='reroute') {
      state.shared.gates.North.crowd=Math.max(65,state.shared.gates.North.crowd-19);
      state.shared.gates.North.wait=Math.max(12,state.shared.gates.North.wait-8);
      state.shared.gates.East.crowd=Math.min(68,state.shared.gates.East.crowd+14);
      state.shared.gates.East.people+=620;
      state.shared.attendeeNotice='North Gate is busy. EventFlow moved new arrivals toward East Gate for a faster entry.';
      addTask('Open two extra entry lines','Add two entry lines at East Gate for redirected guests.','High','Gate Operations',false);
      state.shared.eventHealth=Math.min(94,state.shared.eventHealth+4);
      state.shared.lastAction='Guests moved from North Gate to East Gate.';
      saveShared();
      toast('Action approved','Guest flow moved toward East Gate.');
    } else if (key==='parking') {
      state.shared.parking.P1=Math.max(78,state.shared.parking.P1-8);
      state.shared.parking.P3=Math.min(65,state.shared.parking.P3+9);
      state.shared.attendeeNotice='Parking P1 is busy. Use Parking P3 for easier parking.';
      saveShared(); toast('Parking message active','New drivers will see Parking P3.');
    } else if (key==='shuttle') {
      addTask('Send 3 more shuttle buses','Move 3 shuttle buses from P3 to East Gate.','High','City Shuttle Team',false);
      state.shared.transport.shuttles += 3;
      state.shared.attendeeNotice='More event shuttles are now moving to East Gate.';
      saveShared(); toast('Shuttle task sent','Operator can see the new task.');
    }
    renderDashboard();
  }

  function addTask(title,detail,priority,owner,rerender=true) {
    const exists=state.shared.tasks.some(t=>t.title===title && t.status!=='Done');
    if (!exists) state.shared.tasks.unshift({id:'t'+Date.now(),title,detail,priority,status:'New',owner});
    saveShared();
    toast('Task sent',`${owner} can see it now.`);
    if (rerender) renderDashboard();
  }

  function updateTask(id,status) {
    const task=state.shared.tasks.find(t=>t.id===id);
    if (!task) return;
    task.status=status;
    if (status==='Done') {
      state.shared.eventHealth=Math.min(96,state.shared.eventHealth+2);
      state.shared.attendeeNotice = task.title.toLowerCase().includes('shuttle') ? 'Extra shuttle buses are ready. Your travel wait may be shorter now.' : state.shared.attendeeNotice;
    }
    saveShared();
    toast(`Task ${status.toLowerCase()}`,task.title);
    renderDashboard();
  }

  function triggerCrowdSurge() {
    state.shared.surge=true;
    state.shared.gates.North.crowd=96;
    state.shared.gates.North.people=4210;
    state.shared.gates.North.wait=29;
    state.shared.eventHealth=Math.max(76,state.shared.eventHealth-6);
    if (!state.shared.alerts.some(a=>a.id==='surge')) state.shared.alerts.unshift({id:'surge',level:'high',title:'North Gate crowd is rising fast',text:'Move new guests to East Gate now.',time:'Now'});
    state.shared.attendeeNotice='North Gate is very crowded. Please use East Gate. It is faster right now.';
    saveShared();
    toast('Crowd surge started','North Gate is now very busy.');
    renderDashboard();
  }

  function openHelp() {
    const modal=document.createElement('div');
    modal.className='modal-backdrop';
    modal.innerHTML=`<div class="modal"><div class="modal-head"><h3>How to use this demo</h3><button class="modal-close" aria-label="Close">×</button></div><div style="color:var(--muted);line-height:1.7;font-size:13px;margin-top:16px"><p><strong style="color:var(--ink)">Management:</strong> see the whole event, run the crowd demo and approve simple actions.</p><p><strong style="color:var(--ink)">Operator:</strong> accept event jobs, start work and mark them done.</p><p><strong style="color:var(--ink)">Attendee:</strong> add a ticket, see the best gate and follow the event journey.</p><p>This version works locally in one browser. It is made for a clear hackathon demo without a database.</p></div></div>`;
    document.body.appendChild(modal);
    $('.modal-close',modal).addEventListener('click',()=>modal.remove());
    modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
  }

  function startLightSimulation() {
    if (state.simulationTimer) return;
    state.simulationTimer=setInterval(()=>{
      if (!state.session) return;
      const shared=readJSON(STORE.shared,state.shared);
      state.shared=shared;
      if (!shared.surge) {
        for (const name of Object.keys(shared.gates)) {
          const g=shared.gates[name];
          const delta=Math.floor(Math.random()*3)-1;
          g.crowd=Math.max(28,Math.min(92,g.crowd+delta));
          g.color=statusColor(g.crowd);
        }
        saveShared();
      }
    },6000);
  }

  render();
})();

(() => {
  'use strict';
  const app = document.getElementById('app');
  const toastHost = document.getElementById('toast');
  const STORE = {
    users:'eventflow_true_users_v1',
    session:'eventflow_true_session_v1',
    tasks:'eventflow_true_tasks_v1',
    ticket:'eventflow_true_ticket_v1'
  };
  const N = () => new Date();
  const plusMin = (d,m) => new Date(d.getTime()+m*60000);
  const seed = N();
  const iso = d => d.toISOString();
  const fmtTime = v => new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit'}).format(new Date(v));
  const fmtDate = v => new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v));
  const fmtDateShort = v => new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short'}).format(new Date(v));
  const read = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k,v) => localStorage.setItem(k,JSON.stringify(v));

  function schedule(base, rows){
    return rows.map(r=>({title:r[0],place:r[1],detail:r[2],start:iso(plusMin(base,r[3])),end:iso(plusMin(base,r[4]))}));
  }

  const EVENTS = [
    {
      id:'indpak', eventId:'EF-MUM-CR-091', category:'Cricket',
      name:'India vs Pakistan — Championship Night', venue:'Harbour Arena', city:'Mumbai',
      start:iso(plusMin(seed,-85)), end:iso(plusMin(seed,210)),
      expected:58420, inside:43180, capacity:60000, health:88,
      entry:'East Gate', exit:'South Gate', place:'Block C12 · Row J · Seat 18',
      stayNeeded:false,
      gates:{North:93,East:46,South:62,West:71},
      parking:[
        {name:'P1 North',total:1200,used:1175,walk:'15 min',road:'North Service Road',note:'Almost full'},
        {name:'P2 West',total:1600,used:1280,walk:'11 min',road:'West Link Road',note:'Medium traffic'},
        {name:'P3 East',total:2200,used:1430,walk:'8 min',road:'East Access Road',note:'Best option'},
        {name:'P4 Overflow',total:1800,used:610,walk:'17 min',road:'Third Road',note:'No roadside parking'}
      ],
      food:[
        {name:'North Food Court',crowd:91,wait:'20 min',status:'Very busy'},
        {name:'East Food Street',crowd:43,wait:'6 min',status:'Best now'},
        {name:'South Snacks',crowd:66,wait:'11 min',status:'Medium'},
        {name:'Fan Store',crowd:31,wait:'3 min',status:'Easy'}
      ],
      hotels:[
        {name:'Harbour Stay',distance:'1.3 km',rooms:42,price:'₹3,800',travel:'Shuttle 20 min'},
        {name:'City Grand',distance:'2.1 km',rooms:18,price:'₹4,600',travel:'Shuttle 30 min'},
        {name:'Metro Rooms',distance:'2.7 km',rooms:64,price:'₹2,900',travel:'Metro + walk'}
      ],
      transport:[
        {name:'Metro East',load:58,next:'Next in 7 min',detail:'Last metro 12:35 AM'},
        {name:'Shuttle S3',load:47,next:'Next in 4 min',detail:'Every 8 min'},
        {name:'Taxi East',load:72,next:'9 min pickup',detail:'Busy'},
        {name:'North Road',load:94,next:'+14 min',detail:'Avoid now'}
      ],
      schedule:schedule(seed,[
        ['Gates open','All gates','Ticket checks and entry lines are active.',-85,-60],
        ['Opening ceremony','Main stadium','Teams enter and crowd settles inside.',-60,-35],
        ['First innings','Main stadium','Match is live. Food demand is medium.',-35,55],
        ['Innings break','Food + washrooms','Highest food and washroom demand.',55,75],
        ['Second innings','Main stadium','Match continues. Exit planning starts.',75,165],
        ['Final overs','Main stadium','Final phase. Exit routes are prepared.',165,210],
        ['Managed exit','Exits + transport','Guests split across metro, parking and pickups.',210,260]
      ])
    },
    {
      id:'pulse', eventId:'EF-MUM-MU-146', category:'Concert',
      name:'Pulse Arena Live', venue:'Central Grounds', city:'Mumbai',
      start:iso(plusMin(seed,-20)), end:iso(plusMin(seed,250)), expected:36000, inside:28150, capacity:40000, health:84,
      entry:'West Gate',exit:'East Gate',place:'Stage A · Zone B',stayNeeded:false,
      gates:{North:59,East:45,South:88,West:52},
      parking:[{name:'P1 North',total:900,used:650,walk:'13 min',road:'North Road',note:'Good'}, {name:'P2 South',total:1300,used:1190,walk:'7 min',road:'South Road',note:'Very busy'}, {name:'P3 East',total:1800,used:810,walk:'9 min',road:'East Link',note:'Best option'}],
      food:[{name:'Stage A Food',crowd:82,wait:'16 min',status:'Busy'},{name:'East Eats',crowd:39,wait:'5 min',status:'Best now'},{name:'Merch Store',crowd:35,wait:'4 min',status:'Easy'}],
      hotels:[{name:'Central Inn',distance:'0.9 km',rooms:25,price:'₹3,200',travel:'20 min loop'},{name:'Metro Suites',distance:'1.8 km',rooms:49,price:'₹4,200',travel:'Metro link'}],
      transport:[{name:'Metro Central',load:64,next:'Next in 5 min',detail:'Last metro 12:20 AM'},{name:'Shuttle C2',load:53,next:'Next in 6 min',detail:'Every 10 min'},{name:'South Road',load:92,next:'+16 min',detail:'Avoid now'}],
      schedule:schedule(seed,[['Main gates open','East, West, North','General and premium lines are open.',-20,5],['Opening act','Stage B','Opening performance is live.',5,55],['Headline show','Stage A','Main performance is live.',55,175],['Acoustic set','Stage B','Crowd moves toward Stage B.',175,205],['Final set','Stage A','Final performance and exit messaging.',205,250],['Exit & pickup','East pickup + Metro','Guests move to pickup and metro.',250,300]])
    },
    {
      id:'expo', eventId:'EF-MUM-EX-228', category:'Expo',
      name:'Future Tech Expo 2026', venue:'Innovation Hall', city:'Mumbai',
      start:iso(plusMin(seed,80)), end:iso(plusMin(seed,530)), expected:26000, inside:0, capacity:32000, health:95,
      entry:'North Gate',exit:'West Gate',place:'Hall 2 · Robotics',stayNeeded:true,
      gates:{North:32,East:44,South:39,West:28},
      parking:[{name:'P1 Hall',total:900,used:280,walk:'5 min',road:'Innovation Road',note:'Good'},{name:'P2 Metro',total:800,used:320,walk:'9 min',road:'Metro Link',note:'Good'},{name:'P3 East',total:1400,used:400,walk:'8 min',road:'East Road',note:'Best for Hall 2'}],
      food:[{name:'Hall 1 Cafe',crowd:34,wait:'4 min',status:'Easy'},{name:'Hall 2 Cafe',crowd:51,wait:'7 min',status:'Medium'},{name:'Partner Store',crowd:22,wait:'2 min',status:'Easy'}],
      hotels:[{name:'Tech Residency',distance:'0.7 km',rooms:84,price:'₹3,100',travel:'Walkable'},{name:'Innovation Suites',distance:'1.4 km',rooms:57,price:'₹4,300',travel:'Shuttle 20 min'},{name:'Metro Stay',distance:'2.0 km',rooms:112,price:'₹2,800',travel:'Metro link'}],
      transport:[{name:'Metro Tech Park',load:40,next:'Next in 8 min',detail:'Last metro 11:55 PM'},{name:'Shuttle E1',load:31,next:'Next in 7 min',detail:'Every 12 min'},{name:'East Road',load:36,next:'Normal',detail:'Good'}],
      schedule:schedule(seed,[['Entry opens','Registration','Badge scans and registration.',80,110],['Expo opens','All halls','All exhibit halls are active.',110,230],['Demo sessions','Hall 1 + Hall 2','Startup and robotics demos.',230,360],['AI showcase','Main Theatre','Main showcase session.',360,450],['Networking','Partner lounge','Meet companies and speakers.',450,510],['Closing','All halls','Final sessions and guest exit.',510,530]])
    },
    {
      id:'food', eventId:'EF-MUM-FF-044', category:'Festival',
      name:'City Food Festival', venue:'Riverside Park', city:'Mumbai',
      start:iso(plusMin(seed,-420)), end:iso(plusMin(seed,-120)), expected:18000, inside:0, capacity:24000, health:91,
      entry:'East Gate',exit:'East Gate',place:'Central Food Lawn',stayNeeded:false,
      gates:{North:35,East:42,South:49,West:37},
      parking:[{name:'P1 Riverside',total:900,used:0,walk:'6 min',road:'River Road',note:'Closed after event'}],
      food:[{name:'Street Food',crowd:0,wait:'0 min',status:'Closed'},{name:'Dessert Lane',crowd:0,wait:'0 min',status:'Closed'}],
      hotels:[{name:'River Inn',distance:'1.2 km',rooms:36,price:'₹2,600',travel:'Taxi'}],
      transport:[{name:'Metro Riverside',load:0,next:'—',detail:'Event ended'}],
      schedule:schedule(seed,[['Entry','East Gate','Festival entry.',-420,-390],['Lunch rush','Main lawn','Peak lunch crowd.',-390,-300],['Chef stage','Stage 1','Live cooking.',-300,-210],['Final tasting','Main lawn','Last tasting session.',-210,-140],['Exit','East Gate','Managed guest exit.',-140,-120]])
    }
  ];

  const TASKS = [
    {id:'T-21',event:'indpak',priority:'High',title:'Open one more East Gate line',where:'East Gate',why:'North Gate is 93% busy',by:'10 min',need:'6 staff + 2 scanners',route:'Service Zone → East Gate',status:'New',steps:['Move six staff to East Gate.','Open one extra ticket scan lane.','Place the “Use East Gate” board.','Report queue level after 8 minutes.']},
    {id:'T-22',event:'indpak',priority:'Medium',title:'Move food demand to East Food Street',where:'North Food Court',why:'Current wait is 20 min',by:'Now',need:'2 guides + digital sign',route:'North Concourse → East Food Street',status:'New',steps:['Place two guides near North Food Court.','Show East Food Street wait time on sign.','Keep medical path clear.']},
    {id:'T-23',event:'indpak',priority:'High',title:'Prepare P4 overflow parking',where:'Parking P4',why:'P1 is almost full',by:'15 min',need:'4 marshals + cones',route:'Third Road → P4',status:'Working',steps:['Open overflow gate.','Place cones before Third Road junction.','Send new cars to P4.']},
    {id:'T-31',event:'pulse',priority:'High',title:'Redirect South Road arrivals',where:'South Road',why:'Road load is 92%',by:'12 min',need:'4 marshals',route:'South Road → East Link',status:'New',steps:['Reduce South entry flow.','Send vehicles to East Link.','Update P3 parking board.']}
  ];

  if(!localStorage.getItem(STORE.users)) write(STORE.users,[
    {name:'Demo Guest',email:'attendee@eventflow.demo',password:'event123',role:'attendee'},
    {name:'Demo Operator',email:'operator@eventflow.demo',password:'event123',role:'operator'},
    {name:'Demo Manager',email:'manager@eventflow.demo',password:'event123',role:'management'}
  ]);
  if(!localStorage.getItem(STORE.tasks)) write(STORE.tasks,TASKS);

  let session = read(STORE.session,null);
  let state = {
    screen: session ? 'app' : 'landing',
    authMode:'signin', authRole:'attendee',
    role: session?.role || 'attendee',
    name: session?.name || '',
    tab:'events', filter:'all', eventId:'indpak', ticket:read(STORE.ticket,null),
    destination:'seat', route:'safe', selectedTask:'T-21'
  };

  function statusOf(e){ const t=N(); if(t < new Date(e.start)) return 'upcoming'; if(t > new Date(e.end)) return 'done'; return 'live'; }
  function statusText(s){ return s==='done'?'Completed':s[0].toUpperCase()+s.slice(1); }
  function activeSlot(e){ const t=N(); return e.schedule.find(s=>t>=new Date(s.start)&&t<new Date(s.end)); }
  function nextSlot(e){ const t=N(); return e.schedule.find(s=>new Date(s.start)>t); }
  function countdown(v){ const m=Math.max(0,Math.round((new Date(v)-N())/60000)); if(m<60) return `${m} min`; return `${Math.floor(m/60)}h ${m%60}m`; }
  function bestGate(e){ return Object.entries(e.gates).sort((a,b)=>a[1]-b[1])[0][0]; }
  function worstGate(e){ return Object.entries(e.gates).sort((a,b)=>b[1]-a[1])[0][0]; }
  function crowdWord(v){ return v>=85?'Very busy':v>=70?'Busy':v>=50?'Medium':'Easy'; }
  function crowdColor(v){ return v>=85?'#ff6577':v>=70?'#ff9a62':v>=50?'#ffc66b':'#62d6a7'; }
  function e(){ return EVENTS.find(x=>x.id===state.eventId) || EVENTS[0]; }
  function roleLabel(r){ return r==='management'?'Event Management':r[0].toUpperCase()+r.slice(1); }
  function icon(ch){ return `<span class="nav-icon">${ch}</span>`; }
  function toast(title,text=''){ const d=document.createElement('div'); d.className='toast'; d.innerHTML=`<b>${title}</b><span>${text}</span>`; toastHost.appendChild(d); setTimeout(()=>d.remove(),3200); }
  function setState(p){ Object.assign(state,p); render(); }

  function landing(){
    return `<div class="shell">
      <header class="topnav">
        <div class="brand"><span class="brand-mark"></span>EventFlow</div>
        <div class="nav-actions"><button class="btn btn-soft" data-action="open-live">Live events</button><button class="btn btn-primary" data-action="auth">Sign in</button></div>
      </header>
      <section class="hero">
        <div>
          <span class="eyebrow"><span class="live-dot"></span>Live event operating system</span>
          <h1>Make every event <span>easy to enter, enjoy and manage.</span></h1>
          <p>EventFlow connects guests, event teams, travel, food, stays, entry gates and live crowd movement in one simple flow. Guests always know what is happening now and where to go next. Teams always know what needs attention.</p>
          <div class="hero-actions"><button class="btn btn-primary" data-action="auth">Open EventFlow</button><button class="btn btn-dark" data-action="demo-attendee">Try guest demo</button></div>
          <div class="hero-points">
            <div class="hero-point"><b>Know what is live</b><span>See the event program, live now, next and later.</span></div>
            <div class="hero-point"><b>Guide every guest</b><span>Seat, food, washroom, medical, parking, stay and exit.</span></div>
            <div class="hero-point"><b>Run the whole event</b><span>Management and operators share the same live picture.</span></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="event-orbit">
            <div class="orbit-ring ring1"></div><div class="orbit-ring ring2"></div>
            <div class="orbit-line ol1"></div><div class="orbit-line ol2"></div><div class="orbit-line ol3"></div><div class="orbit-line ol4"></div>
            <div class="orbit-core"><div><b>EVENTFLOW</b><span>One event. One clear flow.</span></div></div>
            <div class="orbit-node n1"><b>Guests</b><span>Pass · route · help</span></div>
            <div class="orbit-node n2"><b>Event team</b><span>Tasks · crowd · alerts</span></div>
            <div class="orbit-node n3"><b>Travel</b><span>Metro · shuttle · parking</span></div>
            <div class="orbit-node n4"><b>Services</b><span>Food · store · medical</span></div>
            <div class="orbit-node n5"><b>Stay</b><span>Rooms · pickup · check-in</span></div>
          </div>
        </div>
      </section>
      <section class="section soft" id="live-events">
        <div class="section-head"><small>What EventFlow manages</small><h2>More than crowd control.</h2><p>Traffic and crowded gates are only one part. EventFlow follows the full guest journey from arrival to exit while giving the event team a live operating view.</p></div>
        <div class="feature-grid">
          ${feature('01','Live program','Guests see what is happening now, what starts next and where it happens.')}
          ${feature('02','Smart event guide','Seat, stage, food, store, washroom, help, parking, stay and exit from one screen.')}
          ${feature('03','Safer navigation','Busy roads and gates are avoided when a faster or less crowded route is available.')}
          ${feature('04','Food & service flow','Teams can see which stalls are overloaded and which areas have free capacity.')}
          ${feature('05','Travel & parking','Parking spaces, road pressure, metro, shuttle and pickup options are managed together.')}
          ${feature('06','Team operations','Operators receive clear jobs with place, reason, deadline, route and required resources.')}
        </div>
      </section>
      <section class="section">
        <div class="section-head"><small>Live demo events</small><h2>See the event first. Then choose your role.</h2><p>EventFlow can run many events at the same time. Select any live or upcoming event after sign in.</p></div>
        <div class="live-showcase">
          <div class="showcase-main"><span class="eyebrow"><span class="live-dot"></span>Current operating picture</span><div class="showcase-kpis">
            <div class="mini-kpi"><b>${EVENTS.filter(x=>statusOf(x)==='live').length}</b><span>Live now</span></div>
            <div class="mini-kpi"><b>${EVENTS.filter(x=>statusOf(x)==='upcoming').length}</b><span>Upcoming</span></div>
            <div class="mini-kpi"><b>${EVENTS.filter(x=>statusOf(x)==='done').length}</b><span>Completed</span></div>
            <div class="mini-kpi"><b>3</b><span>User roles</span></div>
          </div></div>
          <div class="showcase-side">${EVENTS.map(x=>`<div class="event-chip"><div><strong>${x.name}</strong><small>${x.venue} · ${fmtTime(x.start)} – ${fmtTime(x.end)}</small></div><span class="status-pill status-${statusOf(x)}">${statusText(statusOf(x))}</span></div>`).join('')}</div>
        </div>
      </section>
    </div>`;
  }
  function feature(n,t,p){ return `<article class="feature-card"><div class="feature-icon">${n}</div><h3>${t}</h3><p>${p}</p></article>`; }

  function auth(){
    return `<div class="auth-wrap">
      <section class="auth-art"><div><div class="brand"><span class="brand-mark"></span>EventFlow</div><h1>Choose your role. See only what you need.</h1><p>Guests get a simple event guide. Operators get jobs and live work areas. Event managers get the full event control view.</p></div>
      <div class="auth-list"><div><b>Attendee</b><span>Ticket, live program, route and services.</span></div><div><b>Operator</b><span>Event jobs, crowd points and service loads.</span></div><div><b>Management</b><span>All events, teams, guests and operations.</span></div></div></section>
      <section class="auth-panel"><div class="auth-card"><h2>${state.authMode==='signup'?'Create account':'Welcome back'}</h2><p>${state.authMode==='signup'?'Create a local browser account for this demo.':'Sign in to open your EventFlow workspace.'}</p>
      <div class="role-tabs">${['attendee','operator','management'].map(r=>`<button class="${state.authRole===r?'active':''}" data-action="auth-role" data-role="${r}">${roleLabel(r)}</button>`).join('')}</div>
      <form id="auth-form">
      ${state.authMode==='signup'?`<div class="form-field"><label>Name</label><input name="name" placeholder="Your name" required /></div>`:''}
      <div class="form-field"><label>Email</label><input name="email" type="email" value="${state.authRole==='attendee'?'attendee@eventflow.demo':state.authRole==='operator'?'operator@eventflow.demo':'manager@eventflow.demo'}" required /></div>
      <div class="form-field"><label>Password</label><input name="password" type="password" value="event123" required /></div>
      <button class="btn btn-primary" style="width:100%;margin-top:6px" type="submit">${state.authMode==='signup'?'Create account':'Sign in'}</button>
      </form>
      <div class="auth-note">Demo password: <b>event123</b>. Accounts are stored only in this browser. No database is used in this version.</div>
      <button class="btn btn-soft" style="width:100%;margin-top:10px;color:#24364a;border-color:#dce3eb" data-action="toggle-auth">${state.authMode==='signup'?'Already have an account? Sign in':'New here? Create account'}</button>
      <button class="btn" style="width:100%;margin-top:8px;background:transparent;color:#5d7084" data-action="back-home">Back to home</button>
      </div></section>
    </div>`;
  }

  const NAV = {
    attendee:[['events','Events','E'],['journey','My Journey','J'],['navigate','Navigate','N'],['services','Food, Stay & Travel','S']],
    operator:[['events','Events','E'],['overview','Live Work','L'],['map','Movement','M'],['tasks','Tasks','T'],['services','Services','S']],
    management:[['events','All Events','E'],['overview','Control Room','C'],['journey','Guest Journey','J'],['map','Live Movement','M'],['services','Food, Stay & Travel','S'],['tasks','Teams & Jobs','T'],['reports','Reports','R']]
  };

  function appShell(content){
    const ev=e();
    return `<div class="app-layout">
      <aside class="sidebar"><div class="brand"><span class="brand-mark"></span>EventFlow</div>
        <div class="side-event"><small>Selected event</small><b>${ev.name}</b><span>${ev.eventId} · ${statusText(statusOf(ev))}</span></div>
        <nav class="side-nav">${NAV[state.role].map(([id,label,ic])=>`<button data-action="tab" data-tab="${id}" class="${state.tab===id?'active':''}">${icon(ic)}${label}</button>`).join('')}</nav>
        <div class="sidebar-bottom"><div class="user-mini"><b>${state.name||'Demo user'}</b><span>${roleLabel(state.role)}</span></div><button class="btn btn-soft" style="width:100%;margin-top:8px" data-action="logout">Sign out</button></div>
      </aside>
      <main class="main"><header class="app-topbar"><div class="app-title"><small>${roleLabel(state.role)}</small><h1>${tabTitle()}</h1></div><div class="top-tools"><div class="clock-chip" id="clock">${new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',second:'2-digit'}).format(N())}</div><button class="btn btn-dark" data-action="events">Change event</button></div></header>${content}</main>
    </div>`;
  }
  function tabTitle(){ const item=NAV[state.role].find(x=>x[0]===state.tab); return item?item[1]:'EventFlow'; }

  function eventsPage(){
    const counts={all:EVENTS.length,live:EVENTS.filter(x=>statusOf(x)==='live').length,upcoming:EVENTS.filter(x=>statusOf(x)==='upcoming').length,done:EVENTS.filter(x=>statusOf(x)==='done').length};
    const list=EVENTS.filter(x=>state.filter==='all'||statusOf(x)===state.filter);
    return `<section class="page"><div class="page-head"><div><h2>${state.role==='attendee'?'Your event hub':'Event control hub'}</h2><p>${state.role==='attendee'?'First choose the event you are attending. You will then see what is live, where to go and what you need next.':'See every event by real time state. Open one event to manage its guests, teams, travel, food, stay and live operations.'}</p></div></div>
      <div class="stats"><div class="stat"><small>All events</small><b>${counts.all}</b><span>Available in EventFlow</span></div><div class="stat"><small>Live now</small><b>${counts.live}</b><span>Running at this moment</span></div><div class="stat"><small>Upcoming</small><b>${counts.upcoming}</b><span>Still left to start</span></div><div class="stat"><small>Completed</small><b>${counts.done}</b><span>Already finished</span></div></div>
      <div class="filters">${[['all','All events'],['live','Live'],['upcoming','Upcoming'],['done','Completed']].map(x=>`<button class="filter ${state.filter===x[0]?'active':''}" data-action="filter" data-filter="${x[0]}">${x[1]}</button>`).join('')}</div>
      <div class="event-list">${list.map(eventRow).join('')}</div>
    </section>`;
  }
  function eventRow(x){
    const s=statusOf(x); const active=activeSlot(x); const nxt=nextSlot(x);
    return `<article class="event-row"><div class="event-name"><span class="tag ${s}">${statusText(s)}</span><b style="display:block;margin-top:8px">${x.name}</b><small>${x.category} · ${x.venue} · ${x.city}</small></div><div class="event-meta"><small>Event ID</small><b>${x.eventId}</b></div><div class="event-meta"><small>Time</small><b class="event-time">${fmtDateShort(x.start)} · ${fmtTime(x.start)} – ${fmtTime(x.end)}</b></div><div class="event-meta"><small>${s==='live'?'Live now':s==='upcoming'?'Starts in':'Status'}</small><b>${s==='live'?(active?.title||'Event live'):s==='upcoming'?countdown(x.start):'Completed'}</b></div><div class="event-actions"><button class="btn btn-dark" data-action="select-event" data-event="${x.id}">View event</button>${state.role==='attendee'&&s!=='done'?`<button class="btn btn-primary" data-action="go-event" data-event="${x.id}">Go to event</button>`:''}</div></article>`;
  }

  function attendeeJourney(){
    const ev=e(); const act=activeSlot(ev); const nxt=nextSlot(ev);
    if(!state.ticket){
      return `<section class="page"><div class="page-head"><div><h2>Open your event pass</h2><p>Enter the ticket number from your ticket. EventFlow will prepare the event guide for this event.</p></div></div><div class="grid2"><div class="panel"><div class="section-label">Ticket</div><h3>${ev.name}</h3><p>${ev.venue} · ${fmtTime(ev.start)} – ${fmtTime(ev.end)}</p><form id="ticket-form"><div class="form-field"><label>Ticket number</label><input name="ticket" placeholder="Example: INDPK-C12-018" required /></div><button class="btn btn-primary" type="submit">Open my pass</button></form></div><div class="panel"><div class="section-label">What you get</div><div class="activity-list">${activity('✓','Live program','Know what is happening now and next.',true)}${activity('→','Best way in','Get the easier gate and route.',false)}${activity('●','Everything inside','Seat, food, washroom, medical and exit.',false)}</div></div></div></section>`;
    }
    return `<section class="page"><div class="page-head"><div><h2>Your event, one clear journey</h2><p>Start from what is live now. Tap any place to open navigation.</p></div><button class="btn btn-dark" data-action="clear-ticket">Use another ticket</button></div>
      <div class="ticket-card"><div class="ticket-pass"><div class="tagline">EventFlow smart pass</div><h3>${ev.name}</h3><p>${ev.venue} · ${fmtDate(ev.start)}</p><div class="ticket-data"><div><small>Ticket</small><b>${state.ticket}</b></div><div><small>Your place</small><b>${ev.place}</b></div><div><small>Best entry</small><b>${bestGate(ev)} Gate</b></div><div><small>Exit</small><b>${ev.exit}</b></div><div><small>Live now</small><b>${act?.title||statusText(statusOf(ev))}</b></div><div><small>Next</small><b>${nxt?.title||'Managed exit'}</b></div></div><div class="ticket-qr"></div></div>
      <div class="panel"><div class="section-label">What is happening now?</div><h3>${act?.title||'Event not live right now'}</h3><p>${act?.detail|| (statusOf(ev)==='upcoming'?`Event starts in ${countdown(ev.start)}.`:'This event has finished.')}</p>${act?`<button class="btn btn-primary" data-action="dest" data-dest="seat">Go to ${act.place}</button>`:''}</div></div>
      <div class="grid2" style="margin-top:14px"><div class="panel"><div class="section-label">Go anywhere</div><div class="activity-list">
      ${activity('◆','My place',ev.place,false,'seat')}${activity('●','Food & drinks',bestFood(ev).name+' · '+bestFood(ev).wait,false,'food')}${activity('◇','Event store','Fan store / event merchandise',false,'store')}${activity('WC','Washroom','Nearest low-queue washroom',false,'washroom')}${activity('+','Medical help','First-aid and medical support',false,'medical')}${activity('P','Parking',bestParking(ev).name+' · '+bestParking(ev).walk,false,'parking')}${ev.stayNeeded?activity('H','Stay & hotel',bestHotel(ev).name+' · '+bestHotel(ev).rooms+' rooms left',false,'hotel'):''}${activity('M','Metro / shuttle',bestTransport(ev).name+' · '+bestTransport(ev).next,false,'metro')}${activity('↗','Exit',ev.exit+' · best after event',false,'exit')}
      </div></div><div class="panel"><div class="section-label">Today at this event</div><div class="timeline">${timelineRows(ev)}</div></div></div>
    </section>`;
  }
  function activity(ic,title,sub,nowFlag,dest){ return `<div class="activity ${nowFlag?'activity-now':''}"><div class="activity-icon">${ic}</div><div><b>${title}</b><span>${sub}</span></div>${dest?`<button class="btn btn-soft" data-action="dest" data-dest="${dest}">Go there</button>`:''}</div>`; }
  function timelineRows(ev){ const t=N(); return ev.schedule.map((s,i)=>{ const live=t>=new Date(s.start)&&t<new Date(s.end); const next=!live&&new Date(s.start)>t&&!ev.schedule.slice(0,i).some(x=>new Date(x.start)>t); return `<div class="timeline-row ${live?'live':next?'next':''}"><div class="timeline-time">${fmtTime(s.start)}</div><div class="timeline-line"><i class="timeline-dot"></i></div><div class="timeline-content"><b>${s.title}${live?' · LIVE':''}</b><p>${s.place} — ${s.detail}</p></div></div>`; }).join(''); }
  function bestFood(ev){ return [...ev.food].sort((a,b)=>a.crowd-b.crowd)[0]; }
  function bestParking(ev){ return [...ev.parking].sort((a,b)=>(a.used/a.total)-(b.used/b.total))[0]; }
  function bestHotel(ev){ return [...ev.hotels].sort((a,b)=>b.rooms-a.rooms)[0]; }
  function bestTransport(ev){ return [...ev.transport].sort((a,b)=>a.load-b.load)[0]; }

  const DEST = {
    seat:{label:'Your place',turn:'Take the next right',sub:'Then follow EventFlow signs to your block.',eta:'11 min',distance:'1.8 km'},
    food:{label:'East Food Street',turn:'Keep left after East Gate',sub:'Low queue food zone is ahead.',eta:'8 min',distance:'1.2 km'},
    store:{label:'Event Store',turn:'Take the second left',sub:'Store is beside the east concourse.',eta:'7 min',distance:'950 m'},
    washroom:{label:'Washroom B',turn:'Go straight for 300 m',sub:'Use the next indoor corridor.',eta:'5 min',distance:'620 m'},
    medical:{label:'Medical Point',turn:'Turn right at the service road',sub:'Medical team is beside Gate East.',eta:'6 min',distance:'780 m'},
    parking:{label:'P3 East Parking',turn:'Take East Access Road',sub:'Do not park on Third Road.',eta:'9 min',distance:'2.1 km'},
    hotel:{label:'Recommended Stay',turn:'Continue toward Metro Link',sub:'Shuttle pickup is outside East Gate.',eta:'18 min',distance:'3.4 km'},
    metro:{label:'Metro East',turn:'Keep right after the exit',sub:'Next metro shown in travel panel.',eta:'12 min',distance:'2.6 km'},
    exit:{label:'South Gate Exit',turn:'Follow the south concourse',sub:'Lower pressure exit for your section.',eta:'8 min',distance:'1.1 km'}
  };

  function navigation(){
    const ev=e(); const d=DEST[state.destination]||DEST.seat; const safe=bestGate(ev); const busy=worstGate(ev);
    return `<section class="page"><div class="page-head"><div><h2>Turn-by-turn event navigation</h2><p>This map is focused like a driving navigation screen: one route, next turn, ETA, busy road sections, easier gate and nearby event services.</p></div><button class="btn btn-dark" data-action="journey">Back to journey</button></div>
      <div class="nav-cockpit"><div class="nav-world"><div class="nav-ground"><div class="city-grid"></div><div class="road r1"></div><div class="road r2"></div><div class="road r3"></div><div class="road r4"></div><div class="block blk1"></div><div class="block blk2"></div><div class="block blk3"></div><div class="block blk4"></div><div class="stadium" data-label="${ev.venue}"></div></div>
        <svg class="route-layer" viewBox="0 0 1000 720" preserveAspectRatio="none"><path class="route-safe-outline" d="M120 610 C210 580 245 520 330 500 C420 480 475 475 525 430 C590 370 610 320 675 310 C730 302 755 325 790 350"/><path class="route-safe" d="M120 610 C210 580 245 520 330 500 C420 480 475 475 525 430 C590 370 610 320 675 310 C730 302 755 325 790 350"/><path class="route-busy" d="M330 500 C390 400 450 250 535 170"/><path class="route-alt" d="M120 610 C180 530 220 430 325 360 C410 300 470 270 535 170"/></svg>
        <div class="crowd-zone cz-red"></div><div class="crowd-zone cz-green"></div>
        <div class="gate gate-n">N<br>${ev.gates.North}%</div><div class="gate gate-e">E<br>${ev.gates.East}%</div><div class="gate gate-s">S<br>${ev.gates.South}%</div><div class="gate gate-w">W<br>${ev.gates.West}%</div>
        <div class="map-pin pin-start">YOU</div><div class="map-pin pin-park">P3</div><div class="map-pin pin-food">FOOD</div><div class="map-pin pin-hotel">STAY</div><div class="map-pin pin-metro">METRO</div><div class="vehicle-arrow"></div>
        <div class="turn-banner"><div class="top"><div class="turn-arrow">↱</div><div><small>In 240 m</small><h3>${d.turn}</h3><p>${d.sub}</p></div></div></div>
        <div class="nav-status"><div class="eta"><div><b>${d.eta}</b><span>ETA</span></div><div><b>${d.distance}</b><span>Distance</span></div><div><b>${safe}</b><span>Best gate</span></div></div><div class="traffic-card"><b>${busy} Gate is crowded.</b><br/>EventFlow is keeping you on the lower-pressure route through ${safe} Gate.</div></div>
      </div><aside class="nav-side"><div class="section-label">Destination</div><h2>${d.label}</h2><p>${ev.name} · ${ev.venue}</p>
        <div class="route-card best"><h4>Recommended route · ${safe} Gate</h4><p>Lower crowd pressure and easier movement.</p><footer><span>${d.eta}</span><span>${ev.gates[safe]}% crowd</span></footer></div>
        <div class="route-card warn"><h4>Shorter route · ${busy} Gate</h4><p>Not recommended right now because the gate is very busy.</p><footer><span>+${Math.max(4,Math.round(ev.gates[busy]/12))} min wait</span><span>${ev.gates[busy]}% crowd</span></footer></div>
        <div class="dest-grid">${Object.entries(DEST).map(([k,v])=>`<button class="dest-btn ${state.destination===k?'active':''}" data-action="dest" data-dest="${k}">${v.label}</button>`).join('')}</div>
        <div class="info-stack"><div class="info-row"><span>Best parking</span><b>${bestParking(ev).name}<br>${bestParking(ev).walk} walk</b></div><div class="info-row"><span>Metro</span><b>${bestTransport(ev).name}<br>${bestTransport(ev).next}</b></div><div class="info-row"><span>Food</span><b>${bestFood(ev).name}<br>${bestFood(ev).wait}</b></div><div class="info-row"><span>Exit</span><b>${ev.exit}</b></div></div>
      </aside></div></section>`;
  }

  function controlRoom(role){
    const ev=e(); const active=activeSlot(ev); const best=bestGate(ev), worst=worstGate(ev); const tasks=read(STORE.tasks,TASKS).filter(t=>t.event===ev.id);
    return `<section class="page"><div class="page-head"><div><h2>${role==='management'?'Live control room':'Live work picture'}</h2><p>${role==='management'?'Everything happening at the selected event: guests, gates, travel, food, stay and team work.':'The important live information your event team needs to act quickly.'}</p></div><span class="tag ${statusOf(ev)}">${statusText(statusOf(ev))}</span></div>
      <div class="stats"><div class="stat"><small>Guests inside</small><b>${ev.inside.toLocaleString('en-IN')}</b><span>of ${ev.capacity.toLocaleString('en-IN')} capacity</span></div><div class="stat"><small>Live now</small><b style="font-size:17px">${active?.title||statusText(statusOf(ev))}</b><span>${active?.place||'No live slot'}</span></div><div class="stat"><small>Busiest gate</small><b>${worst}</b><span>${ev.gates[worst]}% crowd pressure</span></div><div class="stat"><small>Open jobs</small><b>${tasks.filter(t=>t.status!=='Done').length}</b><span>${tasks.filter(t=>t.priority==='High'&&t.status!=='Done').length} high priority</span></div></div>
      <div class="grid2"><div class="panel"><div class="section-label">Gate crowd</div><h3>Where are people building up?</h3><p>Use this with the movement map to redirect guests and staff.</p><div class="crowd-bars">${Object.entries(ev.gates).map(([k,v])=>`<div class="crowd-row"><span>${k} Gate</span><div class="meter"><i style="width:${v}%;background:${crowdColor(v)}"></i></div><b>${v}%</b></div>`).join('')}</div><button class="btn btn-primary" style="margin-top:15px" data-action="map">Open navigation view</button></div>
      <div class="panel"><div class="section-label">Live program</div><div class="timeline">${timelineRows(ev)}</div></div></div>
      <div class="grid3" style="margin-top:14px">${serviceSummary('Travel & parking',`${bestParking(ev).name} is the best parking now.`,`${bestParking(ev).total-bestParking(ev).used} spaces`,`Road: ${bestParking(ev).road}`)}${serviceSummary('Food & stores',`${bestFood(ev).name} has the shortest queue.`,bestFood(ev).wait,`${bestFood(ev).crowd}% crowd`)}${serviceSummary('Stay & hotels',ev.stayNeeded?`${bestHotel(ev).name} has the most room capacity.`:'Stay is optional for this short event.',ev.hotels[0]?.rooms+' rooms',ev.hotels[0]?.travel||'—')}</div>
      <div class="panel" style="margin-top:14px"><div class="section-label">Team work</div><h3>Jobs that keep the event moving</h3><p>Each job shows where, why, by when and what the operator needs.</p>${tasks.map(jobCard).join('')}</div>
    </section>`;
  }
  function serviceSummary(title,text,k1,k2){ return `<div class="service-card"><h4>${title}</h4><p>${text}</p><div class="service-kpis"><div><small>Live detail</small><b>${k1}</b></div><div><small>Extra</small><b>${k2}</b></div></div></div>`; }
  function jobCard(t){ return `<article class="job-card"><span class="tag ${t.priority==='High'?'live':'upcoming'}">${t.priority}</span><h4>${t.title}</h4><p>${t.why}</p><div class="job-meta"><div><small>Where</small><b>${t.where}</b></div><div><small>By when</small><b>${t.by}</b></div><div><small>Need</small><b>${t.need}</b></div><div><small>Status</small><b>${t.status}</b></div></div><div class="job-actions"><button class="btn btn-soft" data-action="task-detail" data-task="${t.id}">Open details</button><button class="btn btn-dark" data-action="map">Show work area</button></div></article>`; }

  function movementMap(){ return navigation(); }

  function servicesPage(){
    const ev=e();
    return `<section class="page"><div class="page-head"><div><h2>Food, stay, travel and parking</h2><p>EventFlow does not stop at the venue gate. It keeps the guest moving before, during and after the event.</p></div></div>
      <div class="grid3">${ev.parking.map(p=>serviceSummary(p.name,`${p.road} · ${p.note}`,`${p.total-p.used} free`,`${p.walk} walk`)).join('')}</div>
      <div class="grid2" style="margin-top:14px"><div class="panel"><div class="section-label">Food & stores</div><table class="table"><thead><tr><th>Place</th><th>Crowd</th><th>Wait</th><th>Status</th></tr></thead><tbody>${ev.food.map(f=>`<tr><td>${f.name}</td><td>${f.crowd}%</td><td>${f.wait}</td><td>${f.status}</td></tr>`).join('')}</tbody></table></div><div class="panel"><div class="section-label">Hotels & stay</div><table class="table"><thead><tr><th>Hotel</th><th>Distance</th><th>Rooms</th><th>Price</th></tr></thead><tbody>${ev.hotels.map(h=>`<tr><td>${h.name}<small>${h.travel}</small></td><td>${h.distance}</td><td>${h.rooms}</td><td>${h.price}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="panel" style="margin-top:14px"><div class="section-label">Travel out</div><table class="table"><thead><tr><th>Option</th><th>Load</th><th>Next</th><th>Note</th></tr></thead><tbody>${ev.transport.map(t=>`<tr><td>${t.name}</td><td>${t.load}%</td><td>${t.next}</td><td>${t.detail}</td></tr>`).join('')}</tbody></table></div>
    </section>`;
  }

  function tasksPage(){
    const all=read(STORE.tasks,TASKS); const list=all.filter(t=>t.event===state.eventId); const selected=all.find(t=>t.id===state.selectedTask)||list[0];
    return `<section class="page"><div class="page-head"><div><h2>${state.role==='operator'?'Your event jobs':'Teams & jobs'}</h2><p>Every job has a clear place, reason, deadline, route and steps. Operators should never receive only “do this”.</p></div></div><div class="grid2"><div>${list.map(jobCard).join('')}</div><div class="panel">${selected?taskDetail(selected):'<p>No task selected.</p>'}</div></div></section>`;
  }
  function taskDetail(t){ return `<div class="section-label">${t.id} · ${t.priority} priority</div><h3 style="font-size:22px">${t.title}</h3><p>${t.why}</p><div class="job-meta"><div><small>Where</small><b>${t.where}</b></div><div><small>By when</small><b>${t.by}</b></div><div><small>Need</small><b>${t.need}</b></div><div><small>Route</small><b>${t.route}</b></div></div><div class="section-label" style="margin-top:20px">How to do it</div><ol style="color:#aebed0;font-size:10px;line-height:1.8;padding-left:18px">${t.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="job-actions"><button class="btn btn-primary" data-action="task-status" data-task="${t.id}" data-status="Accepted">Accept</button><button class="btn btn-dark" data-action="task-status" data-task="${t.id}" data-status="Working">Start work</button><button class="btn btn-soft" data-action="task-status" data-task="${t.id}" data-status="Done">Mark done</button><button class="btn btn-dark" data-action="map">Show on map</button></div>`; }

  function reportsPage(){
    const ev=e();
    return `<section class="page"><div class="page-head"><div><h2>Event reports</h2><p>A clear summary of guest movement, service pressure and team response.</p></div></div><div class="stats"><div class="stat"><small>Event health</small><b>${ev.health}/100</b><span>Overall event flow</span></div><div class="stat"><small>Guest load</small><b>${Math.round(ev.inside/ev.capacity*100)}%</b><span>Venue occupancy</span></div><div class="stat"><small>Best gate</small><b>${bestGate(ev)}</b><span>${ev.gates[bestGate(ev)]}% pressure</span></div><div class="stat"><small>Food wait</small><b>${bestFood(ev).wait}</b><span>Best available food zone</span></div></div><div class="grid2"><div class="panel"><div class="section-label">Gate pressure</div><div class="crowd-bars">${Object.entries(ev.gates).map(([k,v])=>`<div class="crowd-row"><span>${k}</span><div class="meter"><i style="width:${v}%;background:${crowdColor(v)}"></i></div><b>${v}%</b></div>`).join('')}</div></div><div class="panel"><div class="section-label">Event program</div><div class="timeline">${timelineRows(ev)}</div></div></div></section>`;
  }

  function mainContent(){
    if(state.tab==='events') return eventsPage();
    if(state.role==='attendee'){
      if(state.tab==='journey') return attendeeJourney();
      if(state.tab==='navigate') return navigation();
      if(state.tab==='services') return servicesPage();
    }
    if(state.tab==='overview') return controlRoom(state.role);
    if(state.tab==='map') return movementMap();
    if(state.tab==='tasks') return tasksPage();
    if(state.tab==='services') return servicesPage();
    if(state.tab==='journey') return attendeeJourney();
    if(state.tab==='reports') return reportsPage();
    return eventsPage();
  }

  function render(){
    if(state.screen==='landing') app.innerHTML=landing();
    else if(state.screen==='auth') app.innerHTML=auth();
    else app.innerHTML=appShell(mainContent());
    bind();
  }

  function bind(){
    document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset)));
    const af=document.getElementById('auth-form'); if(af) af.addEventListener('submit',authSubmit);
    const tf=document.getElementById('ticket-form'); if(tf) tf.addEventListener('submit',ticketSubmit);
  }

  function handle(d){
    switch(d.action){
      case 'auth': state.screen='auth'; render(); break;
      case 'back-home': state.screen='landing'; render(); break;
      case 'open-live': document.getElementById('live-events')?.scrollIntoView({behavior:'smooth'}); break;
      case 'auth-role': state.authRole=d.role; render(); break;
      case 'toggle-auth': state.authMode=state.authMode==='signin'?'signup':'signin'; render(); break;
      case 'demo-attendee': loginDemo('attendee'); break;
      case 'logout': localStorage.removeItem(STORE.session); session=null; state={...state,screen:'landing',role:'attendee',tab:'events'}; render(); break;
      case 'tab': state.tab=d.tab; render(); break;
      case 'events': state.tab='events'; render(); break;
      case 'filter': state.filter=d.filter; render(); break;
      case 'select-event': state.eventId=d.event; state.tab=state.role==='attendee'?'journey':'overview'; render(); break;
      case 'go-event': state.eventId=d.event; state.tab='journey'; render(); break;
      case 'journey': state.tab='journey'; render(); break;
      case 'dest': state.destination=d.dest; state.tab='navigate'; render(); break;
      case 'map': state.tab='map'; render(); break;
      case 'clear-ticket': state.ticket=null; localStorage.removeItem(STORE.ticket); render(); break;
      case 'task-detail': state.selectedTask=d.task; if(state.tab!=='tasks') state.tab='tasks'; render(); break;
      case 'task-status': updateTask(d.task,d.status); break;
    }
  }

  function loginDemo(role){
    const u=read(STORE.users,[]).find(x=>x.role===role); session={name:u.name,email:u.email,role:u.role}; write(STORE.session,session); Object.assign(state,{screen:'app',role,authRole:role,name:u.name,tab:'events'}); render();
  }
  function authSubmit(ev){
    ev.preventDefault(); const fd=new FormData(ev.currentTarget); const email=(fd.get('email')||'').toString().trim().toLowerCase(); const password=(fd.get('password')||'').toString(); let users=read(STORE.users,[]);
    if(state.authMode==='signup'){
      if(users.some(u=>u.email===email)){ toast('Account already exists','Use sign in instead.'); return; }
      const u={name:(fd.get('name')||'Guest').toString().trim()||'Guest',email,password,role:state.authRole}; users.push(u); write(STORE.users,users); session={name:u.name,email:u.email,role:u.role};
    } else {
      const u=users.find(x=>x.email===email&&x.password===password&&x.role===state.authRole); if(!u){ toast('Could not sign in','Check role, email and password. Demo password is event123.'); return; } session={name:u.name,email:u.email,role:u.role};
    }
    write(STORE.session,session); Object.assign(state,{screen:'app',role:session.role,name:session.name,tab:'events'}); render();
  }
  function ticketSubmit(ev){ ev.preventDefault(); const fd=new FormData(ev.currentTarget); const t=(fd.get('ticket')||'').toString().trim(); if(!t){ toast('Enter ticket number'); return; } state.ticket=t; write(STORE.ticket,t); toast('Pass ready','Your live event guide is now open.'); render(); }
  function updateTask(id,status){ const tasks=read(STORE.tasks,TASKS).map(t=>t.id===id?{...t,status}:t); write(STORE.tasks,tasks); toast(`Task ${status.toLowerCase()}`,`Status updated for ${id}.`); render(); }

  setInterval(()=>{ const clock=document.getElementById('clock'); if(clock) clock.textContent=new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',second:'2-digit'}).format(N()); },1000);
  render();
})();

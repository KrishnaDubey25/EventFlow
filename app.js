(() => {
  'use strict';

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const app = $('#app');
  const toastHost = $('#toastHost');

  const KEYS = {
    users: 'eventflow3d_users_v1',
    session: 'eventflow3d_session_v1',
    tasks: 'eventflow3d_tasks_v1'
  };

  const EVENTS = [
    {
      id:'cricket', type:'Cricket Night', name:'City Cricket Night', venue:'Harbour Arena', date:'09 Sep 2026', time:'6:30 PM – 11:00 PM', city:'Mumbai',
      status:'Live now', people:'42,860', health:88, center:[72.8258,18.9388], tint:'#edf3ff',
      headline:'Match in progress', now:'Second innings is live', next:'Food court rush expected at 8:35 PM',
      mainActivity:'Watch the match', mainPlace:'Your Seat', zone:'Block C12', crowd:{north:91,east:48,south:64,west:72},
      spaces:[['C12 Seats',84],['Fan Zone',68],['Food Court',76],['Parking P3',57]]
    },
    {
      id:'concert', type:'Music', name:'Pulse Arena Live', venue:'Central Grounds', date:'09 Sep 2026', time:'7:00 PM – 11:30 PM', city:'Mumbai',
      status:'Live now', people:'31,420', health:84, center:[72.8555,19.0588], tint:'#f2edff',
      headline:'Main set is live', now:'Headline performance is on Stage A', next:'Acoustic set starts at 9:10 PM',
      mainActivity:'Go to Main Stage', mainPlace:'Stage A', zone:'Standing Zone B', crowd:{north:62,east:44,south:87,west:58},
      spaces:[['Stage A',86],['Stage B',52],['Food Street',69],['Parking P2',73]]
    },
    {
      id:'expo', type:'Technology Expo', name:'Future Tech Expo', venue:'Innovation Hall', date:'09 Sep 2026', time:'10:00 AM – 8:00 PM', city:'Mumbai',
      status:'Live now', people:'18,760', health:93, center:[72.8562,19.1170], tint:'#eaf9f7',
      headline:'Demo sessions are live', now:'Robotics Hall demos are running', next:'AI showcase starts at 5:20 PM',
      mainActivity:'See Robotics Demo', mainPlace:'Hall 2', zone:'Demo Bay R4', crowd:{north:38,east:55,south:49,west:31},
      spaces:[['Hall 1',64],['Hall 2',79],['Startup Zone',55],['Parking P1',46]]
    },
    {
      id:'festival', type:'Food & Culture', name:'City Food & Culture Fest', venue:'Riverside Park', date:'09 Sep 2026', time:'4:00 PM – 10:30 PM', city:'Mumbai',
      status:'Live now', people:'24,190', health:90, center:[72.8190,18.9823], tint:'#fff4e8',
      headline:'Festival is in full flow', now:'Live kitchen and folk stage are open', next:'Night parade starts at 8:45 PM',
      mainActivity:'Explore Food Street', mainPlace:'Food Street', zone:'Lane F3', crowd:{north:47,east:66,south:41,west:74},
      spaces:[['Food Street',78],['Culture Stage',63],['Family Zone',51],['Parking P4',67]]
    }
  ];

  const EVENT_ICONS = { cricket:'◉', concert:'♫', expo:'⌘', festival:'✦' };
  const POI_ICONS = { seat:'S', stage:'A', food:'F', washroom:'W', medical:'+', exit:'E', parking:'P', stay:'H', help:'?', gate:'G' };

  let maps = [];
  let state = {
    view:'landing', authMode:'signin', authRole:'attendee', selectedEvent:'cricket', session:null,
    appTab:'overview', attendeePass:null, selectedActivity:null, mapDestination:null, roleGate:false
  };

  function read(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key,val){ localStorage.setItem(key,JSON.stringify(val)); }
  function eventById(id){ return EVENTS.find(e=>e.id===id) || EVENTS[0]; }
  function selectedEvent(){ return eventById(state.selectedEvent); }
  function roleLabel(role){ return role==='management'?'Event Management':role==='operator'?'Operator':'Attendee'; }

  function seed(){
    if(!localStorage.getItem(KEYS.users)){
      write(KEYS.users,[
        {id:'m1',name:'Event Manager',email:'manager@eventflow.demo',password:'event123',role:'management'},
        {id:'o1',name:'Operations Team',email:'operator@eventflow.demo',password:'event123',role:'operator'},
        {id:'a1',name:'Demo Attendee',email:'attendee@eventflow.demo',password:'event123',role:'attendee'}
      ]);
    }
    if(!localStorage.getItem(KEYS.tasks)){
      const tasks=[];
      EVENTS.forEach((e,idx)=>{
        tasks.push(
          {id:e.id+'-t1',eventId:e.id,title:'Open extra entry lane',where:idx===1?'South Gate':'East Gate',action:'Open two extra entry lines and guide guests to the open side.',due:'Within 10 min',route:'Service Point → '+(idx===1?'South Gate':'East Gate'),priority:'High',status:'New'},
          {id:e.id+'-t2',eventId:e.id,title:'Move shuttle capacity',where:'Parking P3',action:'Send one extra shuttle to the busiest pickup point.',due:'Within 15 min',route:'Fleet Bay → Parking P3',priority:'Medium',status:'New'},
          {id:e.id+'-t3',eventId:e.id,title:'Check guest help point',where:'Help Desk',action:'Make sure the help desk has staff, water and clear signs.',due:'Before next rush',route:'Operations Room → Help Desk',priority:'Normal',status:'Ready'}
        );
      });
      write(KEYS.tasks,tasks);
    }
    state.session=read(KEYS.session,null);
  }

  function cleanupMaps(){ maps.forEach(m=>{ try{m.remove();}catch{} }); maps=[]; }
  function render(){ cleanupMaps(); window.scrollTo({top:0,behavior:'instant'}); if(state.view==='landing') renderLanding(); else if(state.view==='roleGate') renderRoleGate(); else if(state.view==='auth') renderAuth(); else renderApp(); }
  function toast(title,text=''){ const n=document.createElement('div'); n.className='toast'; n.innerHTML=`<b>${title}</b><span>${text}</span>`; toastHost.appendChild(n); setTimeout(()=>n.remove(),3500); }

  function brand(light=false){ return `<div class="brand"><span class="brand-mark">E</span><span style="${light?'color:#fff':''}">EventFlow</span></div>`; }

  function renderLanding(){
    state.view='landing';
    app.innerHTML=`
      <div>
        <header class="topbar">
          <div class="container nav">
            ${brand()}
            <nav class="nav-links"><a href="#live">Live events</a><a href="#features">What it does</a><a href="#roles">For everyone</a></nav>
            <div class="nav-actions"><button class="btn btn-light btn-sm" data-auth="signin">Sign in</button><button class="btn btn-primary btn-sm" data-auth="signup">Create account</button></div>
          </div>
        </header>
        <main>
          <section class="hero">
            <div class="container hero-grid">
              <div>
                <span class="pill">One simple guide for the whole event</span>
                <h1>Know what is happening. <em>Know where to go.</em></h1>
                <p>EventFlow helps guests, operators and event teams understand a busy event without confusion. See what is live, find the right place, coordinate teams and keep the event moving smoothly.</p>
                <div class="hero-actions"><a href="#live" class="btn btn-primary">Explore live events ↓</a><button class="btn btn-light" data-auth="signup">Create account</button></div>
                <div class="hero-proof"><div><strong>3 simple views</strong>Management · Operator · Attendee</div><div><strong>Whole event flow</strong>Before · During · Exit</div><div><strong>No paid map key</strong>3D maps only when needed</div></div>
              </div>
              <div class="hero-showcase" aria-label="Animated EventFlow journey preview, not a map">
                <div class="showcase-panel">
                  <div class="orbit o1"></div><div class="orbit o2"></div>
                  <div class="showcase-copy"><span class="pill" style="background:rgba(255,255,255,.1);color:#dfe8ff">LIVE EVENT FLOW</span><h3>One event. Many moving parts.</h3><p>EventFlow turns them into one clear journey for every person.</p></div>
                  <div class="journey-stack">
                    <div class="journey-row"><div class="journey-icon">01</div><div><b>Guest journey</b><span>Ticket → live activity → place → help → exit</span></div><span class="journey-status">CLEAR</span></div>
                    <div class="journey-row"><div class="journey-icon">02</div><div><b>Team work</b><span>Problem → task → location → action → done</span></div><span class="journey-status">CONNECTED</span></div>
                    <div class="journey-row"><div class="journey-icon">03</div><div><b>Event control</b><span>People → spaces → travel → hotels → services</span></div><span class="journey-status">LIVE</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section-tight" id="live">
            <div class="container"><span class="eyebrow">Demo live events</span><h2 class="section-title">Choose the event you are joining.</h2><p class="section-sub">Start from the event, then EventFlow opens the right experience for an attendee, operator or event manager.</p><div class="live-events">${EVENTS.map(eventCard).join('')}</div></div>
          </section>

          <section class="section" id="features" style="background:rgba(255,255,255,.58)">
            <div class="container"><span class="eyebrow">More than directions</span><h2 class="section-title">EventFlow handles the full event experience.</h2><p class="section-sub">Finding a less crowded route is only one feature. The main goal is to make the whole event easier to understand and easier to run.</p>
              <div class="feature-grid">
                ${feature('01','Live event guide','See what is happening now, what starts next and where each activity is happening.')}
                ${feature('02','Personal event journey','A ticket connects the guest to the right entry, seat or zone and the next useful step.')}
                ${feature('03','Smart movement','When one area becomes busy, guests can see an easier gate, path or exit.')}
                ${feature('04','Team coordination','Operators receive clear jobs with a place, action, time and work route—not vague instructions.')}
                ${feature('05','Space & service readiness','See hotel rooms, parking, event zones, food areas and service capacity in one place.')}
                ${feature('06','Smooth event finish','Plan exits, shuttles, parking and transport before everyone leaves at the same time.')}
              </div>
            </div>
          </section>

          <section class="section" id="roles"><div class="container"><span class="eyebrow">Built for everyone</span><h2 class="section-title">Different people. Different needs.</h2><div class="roles-grid">
            ${roleCard('01','Attendee','See what is live, choose where you want to go, and get a simple step-by-step route.',['Ticket-based pass','Live activity list','3D route only when needed','Food, help, washroom, exit, stay'])}
            ${roleCard('02','Operator','Pick an event, see your exact tasks, open the work area on the 3D map and update progress.',['Four live event overview','Where + what + by when','Crowd and travel view','Hotels, parking and resources'])}
            ${roleCard('03','Event Management','See the whole event and understand where people, services and teams need attention.',['Event health overview','Crowd & space status','3D operations map','Connected operator tasks'])}
          </div></div></section>

          <section class="section-tight"><div class="container"><div class="panel" style="padding:38px;text-align:center;background:linear-gradient(135deg,#111b2c,#263e67);color:#fff"><span class="pill" style="background:rgba(255,255,255,.1);color:#fff">EVENTFLOW DEMO</span><h2 style="font-size:clamp(32px,5vw,54px);letter-spacing:-.055em;margin:14px 0 10px">Start with a live event.</h2><p style="color:rgba(255,255,255,.66);max-width:650px;margin:0 auto 22px;line-height:1.7">Choose an event above or create a local demo account. No database or paid API key is needed.</p><a class="btn btn-light" href="#live">Choose live event</a></div></div></section>
        </main>
      </div>`;
    $$('[data-auth]').forEach(b=>b.addEventListener('click',()=>{state.authMode=b.dataset.auth;state.view='auth';render();}));
    $$('[data-open-event]').forEach(b=>b.addEventListener('click',()=>{state.selectedEvent=b.dataset.openEvent;state.view='roleGate';render();}));
  }

  function eventCard(e){ return `<article class="event-card" style="--eventTint:${e.tint}"><span class="pill pill-live">${e.status}</span><h3>${e.name}</h3><p>${e.type} · ${e.venue}</p><div class="event-meta"><span>${e.date}</span><span>${e.time.split('–')[0].trim()}</span></div><button class="btn btn-soft btn-sm btn-block" data-open-event="${e.id}">Open this event →</button></article>`; }
  function feature(n,t,p){ return `<article class="feature-card"><div class="feature-icon">${n}</div><h3>${t}</h3><p>${p}</p></article>`; }
  function roleCard(n,t,p,items){ return `<article class="role-card"><small>VIEW ${n}</small><h3>${t}</h3><p>${p}</p><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></article>`; }

  function renderRoleGate(){
    const e=selectedEvent();
    app.innerHTML=`<div class="auth-wrap">
      <section class="auth-side"><div>${brand(true)}</div><div><span class="pill pill-live">${e.status}</span><h2>${e.name}</h2><p>${e.venue} · ${e.city}<br>${e.date} · ${e.time}</p><p style="margin-top:22px">Choose how you are joining this event. EventFlow will open only the information you need.</p></div><button class="btn btn-light" id="backLanding">← Back to live events</button></section>
      <section class="auth-main"><div class="auth-box"><span class="eyebrow">Open EventFlow</span><h2 style="font-size:34px;letter-spacing:-.05em;margin:10px 0 7px">How are you joining?</h2><p style="color:var(--muted);line-height:1.6">You can try the demo instantly or sign in with your own local account.</p>
        <div class="roles-grid" style="grid-template-columns:1fr;margin-top:20px">
          ${gateRole('attendee','Attendee','I am visiting the event','See what is live, use my ticket and find any place.')}
          ${gateRole('operator','Operator','I am working at the event','See my events, tasks, travel flow and work areas.')}
          ${gateRole('management','Event Management','I am running the event','See the full event, teams, spaces and live operations.')}
        </div>
      </div></section></div>`;
    $('#backLanding').addEventListener('click',()=>{state.view='landing';render();});
    $$('[data-try-role]').forEach(b=>b.addEventListener('click',()=>demoLogin(b.dataset.tryRole)));
    $$('[data-sign-role]').forEach(b=>b.addEventListener('click',()=>{state.authRole=b.dataset.signRole;state.authMode='signin';state.view='auth';render();}));
  }
  function gateRole(role,title,sub,text){ return `<article class="role-card" style="padding:20px"><small>${sub.toUpperCase()}</small><h3 style="font-size:21px">${title}</h3><p>${text}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary btn-sm" data-try-role="${role}">Try demo</button><button class="btn btn-light btn-sm" data-sign-role="${role}">Sign in</button></div></article>`; }

  function renderAuth(){
    const isSignup=state.authMode==='signup', e=selectedEvent();
    app.innerHTML=`<div class="auth-wrap"><section class="auth-side"><div>${brand(true)}</div><div><span class="pill">${roleLabel(state.authRole)}</span><h2>${isSignup?'Create your EventFlow account.':'Welcome back.'}</h2><p>${e.name}<br>${e.venue} · ${e.date}</p></div><button class="btn btn-light" id="backEvent">← Back</button></section><section class="auth-main"><div class="auth-box"><div class="auth-tabs"><button class="auth-tab ${!isSignup?'active':''}" data-mode="signin">Sign in</button><button class="auth-tab ${isSignup?'active':''}" data-mode="signup">Create account</button></div><form id="authForm">
      ${isSignup?`<div class="field"><label>Your name</label><input id="name" class="control" required placeholder="Enter your name"></div>`:''}
      <div class="field"><label>Email</label><input id="email" class="control" type="email" required placeholder="name@example.com"></div><div class="field"><label>Password</label><input id="password" class="control" type="password" required minlength="4" placeholder="At least 4 characters"></div>
      ${isSignup?`<div class="field"><label>Choose your role</label><div class="role-pick">${['attendee','operator','management'].map(r=>`<button type="button" class="role-choice ${state.authRole===r?'active':''}" data-role="${r}"><b>${roleLabel(r)}</b><span>${r==='attendee'?'Visit the event':r==='operator'?'Work on tasks':'Run the event'}</span></button>`).join('')}</div></div>`:''}
      <button class="btn btn-primary btn-block" type="submit">${isSignup?'Create account':'Sign in'}</button></form><div style="text-align:center;color:var(--muted);font-size:12px;margin:16px 0">or</div><button class="btn btn-light btn-block" id="demoBtn">Use ${roleLabel(state.authRole)} demo</button><p style="font-size:11px;color:var(--muted);line-height:1.55;margin:16px 0 0">Local demo only. Accounts and demo changes stay in this browser. No database is connected.</p></div></section></div>`;
    $('#backEvent').addEventListener('click',()=>{state.view='roleGate';render();});
    $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.authMode=b.dataset.mode;render();}));
    $$('[data-role]').forEach(b=>b.addEventListener('click',()=>{state.authRole=b.dataset.role;render();}));
    $('#demoBtn').addEventListener('click',()=>demoLogin(state.authRole));
    $('#authForm').addEventListener('submit',handleAuth);
  }

  function handleAuth(ev){
    ev.preventDefault(); const users=read(KEYS.users,[]); const email=$('#email').value.trim().toLowerCase(); const password=$('#password').value;
    if(state.authMode==='signup'){
      if(users.some(u=>u.email===email)) return toast('Account already exists','Please sign in with this email.');
      const u={id:'u'+Date.now(),name:$('#name').value.trim(),email,password,role:state.authRole}; users.push(u); write(KEYS.users,users); startSession(u); toast('Account created','Opening your EventFlow view.');
    }else{
      const u=users.find(x=>x.email===email&&x.password===password); if(!u) return toast('Sign in failed','Check your email and password.'); startSession(u); toast('Signed in','Opening '+roleLabel(u.role)+'.');
    }
  }
  function demoLogin(role){ const users=read(KEYS.users,[]); const u=users.find(x=>x.role===role)||{id:'demo-'+role,name:'Demo User',email:'demo@eventflow.local',role}; startSession(u); }
  function startSession(u){ state.session={id:u.id,name:u.name,email:u.email,role:u.role}; write(KEYS.session,state.session); state.view='app'; state.appTab='overview'; state.attendeePass=null; state.selectedActivity=null; render(); }
  function logout(){ localStorage.removeItem(KEYS.session); state.session=null; state.view='landing'; state.appTab='overview'; render(); }

  function renderApp(){
    if(!state.session){state.view='landing';return renderLanding();}
    if(state.session.role==='attendee') renderAttendee(); else if(state.session.role==='operator') renderOperator(); else renderManagement();
  }

  function appHeader(){
    const e=selectedEvent(); return `<header class="app-header"><div class="container app-head-inner">${brand()}<div class="event-switch"><span class="pill pill-live">LIVE</span><select class="control" id="eventSwitch" aria-label="Choose event">${EVENTS.map(x=>`<option value="${x.id}" ${x.id===e.id?'selected':''}>${x.name}</option>`).join('')}</select></div><div class="user-chip"><div class="avatar">${(state.session.name||'U')[0]}</div><div class="user-text"><b style="font-size:12px;display:block">${state.session.name}</b><span style="font-size:10px;color:var(--muted)">${roleLabel(state.session.role)}</span></div><button class="icon-btn" id="logoutBtn" title="Sign out">↗</button></div></div></header>`;
  }
  function bindHeader(){ $('#eventSwitch')?.addEventListener('change',e=>{state.selectedEvent=e.target.value;state.attendeePass=null;state.selectedActivity=null;state.appTab='overview';render();}); $('#logoutBtn')?.addEventListener('click',logout); }
  function tabs(items){ return `<div class="tabs">${items.map(([id,label])=>`<button class="tab ${state.appTab===id?'active':''}" data-tab="${id}">${label}</button>`).join('')}</div>`; }
  function bindTabs(){ $$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{state.appTab=b.dataset.tab;render();})); }

  // -------- Attendee --------
  function renderAttendee(){
    const e=selectedEvent(); const ticketReady=!!state.attendeePass;
    app.innerHTML=`<div class="app-shell">${appHeader()}<main class="page"><div class="container"><div class="page-head"><div><span class="eyebrow">Attendee · ${e.type}</span><h1>${ticketReady?'Your event, made simple.':'Start with your ticket.'}</h1><p>${ticketReady?`${e.now}. Choose what you want to do and EventFlow will guide you.`:'Enter your ticket number. EventFlow will create your event pass and show what is happening now.'}</p></div><span class="pill pill-live">${e.status}</span></div>
      ${ticketReady?tabs([['overview','Now'],['map','3D Guide'],['plan','My Plan'],['help','Event Help']]):''}
      <div id="attendeeBody">${ticketReady?attendeeTab(e):ticketEntry(e)}</div>
    </div></main></div>`;
    bindHeader(); if(ticketReady) bindTabs();
    if(!ticketReady){ $('#ticketForm').addEventListener('submit',createPass); $('#demoPass').addEventListener('click',()=>createDemoPass()); }
    else bindAttendee(e);
  }

  function ticketEntry(e){ return `<div class="ticket-box"><section class="panel ticket-entry"><span class="pill">STEP 1</span><h2 style="font-size:32px;letter-spacing:-.05em;margin:15px 0 8px">Enter your ticket number</h2><p>We use the ticket number to prepare a demo pass, seat/zone and event journey. No ticket image upload is needed in this demo.</p><form id="ticketForm"><div class="field"><label>Ticket number</label><input id="ticketNo" class="control" required placeholder="Example: EF-42819" autocomplete="off"></div><button class="btn btn-primary btn-block" type="submit">Open my event pass →</button></form><button id="demoPass" class="btn btn-light btn-block" style="margin-top:10px">Use demo pass</button></section><aside class="pass-card"><div class="pass-head"><div><small style="color:rgba(255,255,255,.55)">${e.type.toUpperCase()}</small><h3 style="font-size:28px;margin:8px 0">${e.name}</h3><span style="color:rgba(255,255,255,.65);font-size:13px">${e.venue} · ${e.time}</span></div><span class="pill" style="background:rgba(255,255,255,.1);color:#fff">PASS PREVIEW</span></div><div style="position:relative;z-index:2;margin-top:70px"><p style="color:rgba(255,255,255,.65)">After the ticket opens, you will first see:</p><div class="step-list"><div class="step" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.1);color:#fff"><div class="step-num">1</div><div><b>What is happening now</b><span>Live activities and useful places</span></div></div><div class="step" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.1);color:#fff"><div class="step-num">2</div><div><b>Choose where you want to go</b><span>Seat, stage, food, help, washroom, exit...</span></div></div><div class="step" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.1);color:#fff"><div class="step-num">3</div><div><b>Open the 3D guide</b><span>See the gate and path only when needed</span></div></div></div></div></aside></div>`; }

  function createPass(ev){ev.preventDefault(); const no=$('#ticketNo').value.trim(); if(no.length<3)return toast('Ticket number is too short','Enter a valid demo ticket number.'); state.attendeePass=passFromTicket(no); state.appTab='overview'; render(); toast('Pass ready','Your live event guide is open.');}
  function createDemoPass(){state.attendeePass=passFromTicket('DEMO-2409');state.appTab='overview';render();}
  function hash(s){return [...s].reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,7);}
  function passFromTicket(no){ const e=selectedEvent(); const h=Math.abs(hash(no)); return {ticket:no.toUpperCase(),block:e.id==='concert'?'Zone '+String.fromCharCode(65+h%4):e.id==='expo'?'Hall '+(1+h%3):e.id==='festival'?'Lane F'+(1+h%5):'Block '+String.fromCharCode(65+h%4)+(10+h%8),row:'R'+(1+h%18),seat:1+h%40,gate:bestGate(e)}; }
  function bestGate(e){ const pairs=Object.entries(e.crowd).sort((a,b)=>a[1]-b[1]); return cap(pairs[0][0])+' Gate'; }
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}

  function attendeeTab(e){
    if(state.appTab==='map') return attendeeMapView(e);
    if(state.appTab==='plan') return attendeePlan(e);
    if(state.appTab==='help') return attendeeHelp(e);
    return attendeeNow(e);
  }
  function attendeeNow(e){ const a=activitiesFor(e); const p=state.attendeePass; return `<div class="grid-2"><section><div class="now-card"><div class="now-time">Happening now</div><h2 style="font-size:28px;letter-spacing:-.045em;margin:10px 0 6px">${e.headline}</h2><p style="color:var(--muted);margin:0">${e.now}</p><p style="font-size:12px;color:#315cca;font-weight:800;margin:12px 0 0">NEXT · ${e.next}</p></div><h3 style="margin:24px 0 4px">Where do you want to go?</h3><p style="color:var(--muted);font-size:13px;margin-top:0">Tap a place or activity. EventFlow will show the useful details first; the 3D map opens only when you ask for directions.</p><div class="activity-grid">${a.map(activityCard).join('')}</div></section><aside><div class="pass-card"><div class="pass-head"><div><small style="color:rgba(255,255,255,.55)">EVENT PASS</small><h3 style="font-size:24px;margin:6px 0">${e.name}</h3><span style="color:rgba(255,255,255,.62);font-size:12px">${p.ticket}</span></div><span class="pill" style="background:rgba(255,255,255,.1);color:#fff">ACTIVE</span></div><div class="pass-seat"><div><small>ZONE</small><strong>${p.block}</strong></div><div><small>ROW</small><strong>${p.row}</strong></div><div><small>SEAT</small><strong>${p.seat}</strong></div></div><div style="position:relative;z-index:2;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)"><small style="color:rgba(255,255,255,.52)">EASIER ENTRY RIGHT NOW</small><div style="font-size:20px;font-weight:900;margin-top:5px">${p.gate}</div></div></div><div class="panel" style="margin-top:16px"><h3>Quick event status</h3><div class="stat-list"><div class="stat-line"><span>Best gate</span><strong>${p.gate}</strong></div><div class="stat-line"><span>Food wait</span><strong>8–12 min</strong></div><div class="stat-line"><span>Medical help</span><strong>Open</strong></div><div class="stat-line"><span>Exit plan</span><strong>Ready</strong></div></div></div></aside></div>`; }
  function activitiesFor(e){
    const primary={cricket:['seat','My seat','Match is live','Go to your block and seat.'],concert:['stage','Main stage','Live now','Headline show is running.'],expo:['stage','Robotics Hall','Demo live','Live demos are running.'],festival:['food','Food Street','Open now','Popular kitchens are serving now.']}[e.id];
    return [primary,['food','Food & drinks','Open now','Find a nearby food area with lower wait.'],['washroom','Washroom','Open','Find the nearest washroom.'],['medical','Medical help','Ready','Find the nearest medical point.'],['parking','Parking / pickup','Live','Find parking, pickup or shuttle point.'],['exit','Exit / transport','Plan ahead','See the easier exit and next travel step.']].map(x=>({id:x[0],title:x[1],badge:x[2],text:x[3]}));
  }
  function activityCard(a){ return `<button class="activity" data-activity="${a.id}"><div class="activity-icon">${POI_ICONS[a.id]||'•'}</div><b>${a.title}</b><span>${a.badge} · ${a.text}</span></button>`; }
  function bindAttendee(e){
    $$('[data-activity]').forEach(b=>b.addEventListener('click',()=>{state.selectedActivity=b.dataset.activity; openActivityDetail(e,b.dataset.activity);}));
    $$('[data-go-destination]').forEach(b=>b.addEventListener('click',()=>{state.mapDestination=b.dataset.goDestination;state.appTab='map';render();}));
    if(state.appTab==='map') setTimeout(()=>init3DMap('attendeeMap',e,state.mapDestination||state.selectedActivity||defaultPoi(e),{mode:'attendee'}),20);
  }
  function openActivityDetail(e,id){ const a=activitiesFor(e).find(x=>x.id===id); const place=poiLabel(e,id); const info=document.createElement('div'); info.className='toast'; info.style.width='min(420px,calc(100vw - 40px))'; info.innerHTML=`<b style="font-size:15px">${a.title}</b><span>${place}<br>${activityDetail(e,id)}</span><button class="btn btn-light btn-sm" style="margin-top:10px" data-go-destination="${id}">Go there →</button>`; toastHost.appendChild(info); info.querySelector('[data-go-destination]').addEventListener('click',()=>{info.remove();state.mapDestination=id;state.appTab='map';render();}); setTimeout(()=>{if(info.isConnected)info.remove()},6500); }
  function activityDetail(e,id){ const p=state.attendeePass; if(id==='seat'||id==='stage') return `Use ${p.gate}. EventFlow will guide you to ${p.block}.`; if(id==='food') return 'The suggested food point has a shorter queue right now.'; if(id==='washroom')return 'This is the nearest open washroom from your event zone.'; if(id==='medical')return 'Medical staff are available at this point.'; if(id==='parking')return 'Parking P3 and the shuttle pickup are shown together.'; return 'This exit has a smoother connection to parking and transport.'; }
  function attendeeMapView(e){ const id=state.mapDestination||state.selectedActivity||defaultPoi(e); return `<div><div class="panel" style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap"><div><span class="eyebrow">3D EVENT GUIDE</span><h3 style="font-size:23px;margin:6px 0">Going to ${poiLabel(e,id)}</h3><p style="margin:0">${mapInstruction(e,id)}</p></div><button class="btn btn-light" data-tab="overview">← Choose another place</button></div>${mapContainer('attendeeMap',e,id,'attendee')}</div>`; }
  function attendeePlan(e){ return `<div class="grid-2"><section class="panel"><span class="eyebrow">Your event plan</span><h3 style="font-size:25px;margin-top:8px">A simple plan from now to exit.</h3><div class="step-list">${[['Now',e.now],['Next',e.next],['When you need food','Use the suggested food point with lower wait'],['Before the end','Check your exit and transport again'],['After the event','Follow the easier exit → pickup / parking / metro']].map((x,i)=>`<div class="step"><div class="step-num">${i+1}</div><div><b>${x[0]}</b><span>${x[1]}</span></div></div>`).join('')}</div></section><aside class="panel"><h3>Space around you</h3><p>These numbers help you choose a calmer area when you have options.</p><div class="capacity-list">${e.spaces.map(s=>capacityRow(s[0],s[1])).join('')}</div></aside></div>`; }
  function attendeeHelp(e){ return `<div class="grid-3">${[['Medical help','Open now','Medical point is ready near the main event area.'],['Guest help desk','Open now','Ask for ticket, seat, accessibility or lost-item help.'],['Food & water','Multiple areas','EventFlow can point you to a less busy option.'],['Washrooms','Multiple areas','Choose the nearest open facility from your zone.'],['Parking & pickup','Live status','See parking, shuttle and pickup choices together.'],['Stay / hotel','Nearby options','See partner stay options and travel connection.']].map(x=>`<article class="panel"><span class="pill">${x[1]}</span><h3 style="margin-top:14px">${x[0]}</h3><p>${x[2]}</p></article>`).join('')}</div>`; }

  // -------- Operator --------
  function renderOperator(){ const e=selectedEvent(); app.innerHTML=`<div class="app-shell">${appHeader()}<main class="page"><div class="container"><div class="page-head"><div><span class="eyebrow">Operator</span><h1>Your events and work.</h1><p>Pick an event first. Then see exactly where to go, what to do and by when.</p></div><span class="pill pill-live">4 events live</span></div>${tabs([['overview','Live Events'],['tasks','My Tasks'],['map','3D Work Map'],['flow','Crowd & Travel'],['spaces','Hotels & Space']])}${operatorTab(e)}</div></main></div>`; bindHeader();bindTabs();bindOperator(e); }
  function operatorTab(e){ if(state.appTab==='tasks')return operatorTasks(e); if(state.appTab==='map')return operatorMap(e); if(state.appTab==='flow')return crowdTravel(e); if(state.appTab==='spaces')return spacesView(e,'operator'); return operatorOverview(e); }
  function operatorOverview(e){ return `<div><div class="event-ops-grid">${EVENTS.map(x=>`<button class="mini-event ${x.id===e.id?'active':''}" data-pick-event="${x.id}"><span class="pill pill-live">LIVE</span><b>${x.name}</b><span>${x.venue}<br>${x.people} guests</span></button>`).join('')}</div><div class="grid-2" style="margin-top:18px"><section class="panel"><span class="eyebrow">Selected event</span><h2 style="font-size:32px;letter-spacing:-.05em;margin:10px 0">${e.name}</h2><p>${e.now}. ${e.next}.</p><div class="grid-3" style="margin-top:20px"><div class="kpi"><small>Guests</small><strong>${e.people}</strong><div class="trend">Live estimate</div></div><div class="kpi"><small>Event health</small><strong>${e.health}%</strong><div class="trend">Stable</div></div><div class="kpi"><small>My open tasks</small><strong>${tasksFor(e.id).filter(t=>t.status!=='Done').length}</strong><div class="trend">Actionable</div></div></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button class="btn btn-primary" data-tab="tasks">Open my tasks</button><button class="btn btn-light" data-tab="map">Open 3D work map</button></div></section><aside class="panel"><h3>Next work to do</h3>${tasksFor(e.id).slice(0,2).map(taskMini).join('')}</aside></div></div>`; }
  function operatorTasks(e){ const ts=tasksFor(e.id); return `<div class="grid-2"><section><div class="task-list">${ts.map(taskCard).join('')}</div></section><aside class="panel"><span class="eyebrow">How to use tasks</span><h3 style="font-size:24px;margin-top:8px">No vague instructions.</h3><p>Every task shows the place, exact work, time and route/work area.</p><div class="step-list"><div class="step"><div class="step-num">1</div><div><b>Read the place</b><span>Know exactly where the job is.</span></div></div><div class="step"><div class="step-num">2</div><div><b>Open on 3D map</b><span>See the area before you move.</span></div></div><div class="step"><div class="step-num">3</div><div><b>Update status</b><span>Management sees the same progress.</span></div></div></div></aside></div>`; }
  function operatorMap(e){ return `<div>${mapContainer('operatorMap',e,'gate','operator')}<div class="grid-3" style="margin-top:16px">${tasksFor(e.id).map(t=>`<button class="panel" style="text-align:left" data-task-map="${t.id}"><span class="pill ${t.priority==='High'?'pill-red':''}">${t.priority}</span><h3 style="margin-top:12px">${t.title}</h3><p>${t.where} · ${t.status}</p></button>`).join('')}</div></div>`; }
  function bindOperator(e){ $$('[data-pick-event]').forEach(b=>b.addEventListener('click',()=>{state.selectedEvent=b.dataset.pickEvent;render();})); $$('[data-task-status]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.taskStatus,b.dataset.nextStatus))); $$('[data-task-map]').forEach(b=>b.addEventListener('click',()=>{const t=taskById(b.dataset.taskMap);state.mapDestination=taskToPoi(t);state.appTab='map';render();})); $$('[data-show-task-map]').forEach(b=>b.addEventListener('click',()=>{const t=taskById(b.dataset.showTaskMap);state.mapDestination=taskToPoi(t);state.appTab='map';render();})); if(state.appTab==='map')setTimeout(()=>init3DMap('operatorMap',e,state.mapDestination||'gate',{mode:'operator'}),20); }

  // -------- Management --------
  function renderManagement(){ const e=selectedEvent(); app.innerHTML=`<div class="app-shell">${appHeader()}<main class="page"><div class="container"><div class="page-head"><div><span class="eyebrow">Event Management</span><h1>See the event clearly.</h1><p>People, spaces, travel and team work—without turning the screen into a wall of data.</p></div><span class="pill pill-live">${e.status}</span></div>${tabs([['overview','Overview'],['map','3D Operations Map'],['flow','People & Travel'],['tasks','Team Tasks'],['spaces','Hotels & Space']])}${managementTab(e)}</div></main></div>`;bindHeader();bindTabs();bindManagement(e); }
  function managementTab(e){ if(state.appTab==='map')return managementMap(e); if(state.appTab==='flow')return crowdTravel(e); if(state.appTab==='tasks')return managementTasks(e); if(state.appTab==='spaces')return spacesView(e,'management'); return managementOverview(e); }
  function managementOverview(e){ return `<div><div class="event-ops-grid">${EVENTS.map(x=>`<button class="mini-event ${x.id===e.id?'active':''}" data-pick-event="${x.id}"><span class="pill pill-live">LIVE</span><b>${x.name}</b><span>${x.people} guests · Health ${x.health}%</span></button>`).join('')}</div><div class="grid-4" style="margin-top:18px"><div class="kpi"><small>Event health</small><strong>${e.health}</strong><div class="trend">out of 100</div></div><div class="kpi"><small>Guests in event</small><strong>${e.people}</strong><div class="trend">Live estimate</div></div><div class="kpi"><small>Busiest gate</small><strong>${maxGate(e)}</strong><div class="trend">Needs attention</div></div><div class="kpi"><small>Open team tasks</small><strong>${tasksFor(e.id).filter(t=>t.status!=='Done').length}</strong><div class="trend">Shared with operators</div></div></div><div class="grid-2" style="margin-top:18px"><section class="panel"><span class="eyebrow">What needs attention</span><h3 style="font-size:25px;margin-top:8px">${maxGate(e)} is the busiest entry.</h3><p>Move arriving guests toward a calmer gate and keep one operator ready at the busy side.</p><div class="capacity-list" style="margin-top:18px">${Object.entries(e.crowd).map(([g,v])=>capacityRow(cap(g)+' Gate',v)).join('')}</div><button class="btn btn-primary" style="margin-top:18px" data-tab="map">See on 3D operations map</button></section><aside class="panel"><span class="eyebrow">Event flow now</span><h3 style="font-size:24px;margin-top:8px">${e.headline}</h3><p>${e.now}</p><div class="stat-list"><div class="stat-line"><span>Next change</span><strong>${e.next}</strong></div><div class="stat-line"><span>Parking</span><strong>57% used</strong></div><div class="stat-line"><span>Shuttle load</span><strong>Moderate</strong></div><div class="stat-line"><span>Hotel rooms nearby</span><strong>164 left</strong></div></div></aside></div></div>`; }
  function managementMap(e){ return `<div>${mapContainer('managementMap',e,'gate','management')}<div class="grid-4" style="margin-top:16px">${Object.entries(e.crowd).map(([g,v])=>`<div class="kpi"><small>${cap(g)} Gate</small><strong>${v}%</strong><div class="trend" style="color:${crowdColor(v)}">${crowdWord(v)}</div></div>`).join('')}</div></div>`; }
  function managementTasks(e){ return `<div class="grid-2"><section class="task-list">${tasksFor(e.id).map(taskCard).join('')}</section><aside class="panel"><h3>Shared team progress</h3><p>When an operator changes a task, this screen reads the same local demo task state.</p><div class="capacity-list">${['New','Accepted','Working','Done'].map(s=>capacityRow(s,Math.round(tasksFor(e.id).filter(t=>t.status===s).length/Math.max(1,tasksFor(e.id).length)*100))).join('')}</div></aside></div>`; }
  function bindManagement(e){ $$('[data-pick-event]').forEach(b=>b.addEventListener('click',()=>{state.selectedEvent=b.dataset.pickEvent;render();})); $$('[data-task-status]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.taskStatus,b.dataset.nextStatus))); $$('[data-show-task-map]').forEach(b=>b.addEventListener('click',()=>{const t=taskById(b.dataset.showTaskMap);state.mapDestination=taskToPoi(t);state.appTab='map';render();})); if(state.appTab==='map')setTimeout(()=>init3DMap('managementMap',e,state.mapDestination||'gate',{mode:'management'}),20); }

  // -------- Shared operations --------
  function tasksFor(eventId){return read(KEYS.tasks,[]).filter(t=>t.eventId===eventId)} function taskById(id){return read(KEYS.tasks,[]).find(t=>t.id===id)}
  function taskMini(t){return `<div style="padding:14px 0;border-bottom:1px solid #edf1f5"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:13px">${t.title}</b><span class="pill">${t.status}</span></div><span style="font-size:11px;color:var(--muted)">${t.where} · ${t.due}</span></div>`;}
  function taskCard(t){ const next=t.status==='New'?'Accepted':t.status==='Accepted'?'Working':t.status==='Working'?'Done':'Done'; return `<article class="task-card"><div class="task-top"><div><span class="pill ${t.priority==='High'?'pill-red':t.priority==='Medium'?'pill-warn':''}">${t.priority} priority</span><h4>${t.title}</h4></div><span class="pill">${t.status}</span></div><p style="color:var(--muted);font-size:13px;line-height:1.55">${t.action}</p><div class="task-info"><div><small>Where</small><b>${t.where}</b></div><div><small>What to do</small><b>${shortAction(t.action)}</b></div><div><small>By when</small><b>${t.due}</b></div><div><small>Work route</small><b>${t.route}</b></div></div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-light btn-sm" data-show-task-map="${t.id}">Show on 3D map</button>${t.status!=='Done'?`<button class="btn btn-primary btn-sm" data-task-status="${t.id}" data-next-status="${next}">${t.status==='New'?'Accept task':t.status==='Accepted'?'Start work':'Mark done'}</button>`:'<span class="pill pill-live">Completed</span>'}</div></article>`; }
  function shortAction(a){return a.split(' and ')[0]+'.'}
  function updateTask(id,status){const all=read(KEYS.tasks,[]);const t=all.find(x=>x.id===id);if(!t)return;t.status=status;write(KEYS.tasks,all);toast('Task updated',`${t.title} → ${status}`);render();}
  function taskToPoi(t){ const w=t.where.toLowerCase(); if(w.includes('parking'))return'parking'; if(w.includes('help'))return'medical'; if(w.includes('south'))return'south'; if(w.includes('east'))return'east'; return'gate'; }

  function crowdTravel(e){ const bars=[35,42,51,63,76,88,72,66,59,47,40,32]; return `<div class="grid-2"><section class="panel"><span class="eyebrow">People movement</span><h3 style="font-size:24px;margin-top:8px">Where people are building up</h3><p>Simple event flow view. Higher bars mean more people moving through the event at that time.</p><div class="flow-bars">${bars.map((h,i)=>`<i style="height:${h}%;animation-delay:${i*50}ms"></i>`).join('')}</div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted)"><span>Arrival</span><span>Peak</span><span>Exit</span></div></section><aside class="panel"><h3>Gate crowd</h3><p>Use this with the 3D map when you need the exact area.</p><div class="capacity-list">${Object.entries(e.crowd).map(([g,v])=>capacityRow(cap(g)+' Gate',v)).join('')}</div><div class="stat-list" style="margin-top:20px"><div class="stat-line"><span>Shuttle load</span><strong>68%</strong></div><div class="stat-line"><span>Parking used</span><strong>57%</strong></div><div class="stat-line"><span>Pickup queue</span><strong>9 min</strong></div><div class="stat-line"><span>Average walk</span><strong>12 min</strong></div></div></aside></div>`; }
  function spacesView(e,role){ return `<div><div class="grid-2"><section class="panel"><span class="eyebrow">Event spaces</span><h3 style="font-size:24px;margin-top:8px">Where there is room right now</h3><p>${role==='operator'?'Use this before moving people or supplies to another area.':'See which areas have room before sending more people there.'}</p><div class="capacity-list">${e.spaces.map(s=>capacityRow(s[0],s[1])).join('')}</div></section><aside class="panel"><span class="eyebrow">Parking & transport</span><h3 style="font-size:24px;margin-top:8px">Travel readiness</h3><div class="stat-list"><div class="stat-line"><span>Parking P3</span><strong>214 spaces left</strong></div><div class="stat-line"><span>Shuttle S2</span><strong>6 min</strong></div><div class="stat-line"><span>Taxi pickup</span><strong>Moderate</strong></div><div class="stat-line"><span>Metro connection</span><strong>Good</strong></div></div></aside></div><h3 style="margin:24px 0 12px">Nearby stay</h3><div class="hotel-grid">${[['Harbour Stay','1.4 km','48 rooms'],['City Central','2.1 km','72 rooms'],['Metro Suites','2.8 km','44 rooms']].map(h=>`<article class="hotel"><span class="pill pill-live">Available</span><h4 style="margin-top:13px">${h[0]}</h4><p>${h[1]} · Shuttle connection</p><strong>${h[2].split(' ')[0]}</strong> <small>rooms left</small></article>`).join('')}</div></div>`; }
  function capacityRow(name,val){ return `<div class="capacity-row"><span>${name}</span><div class="progress"><i style="width:${Math.max(2,val)}%;background:${val>85?'var(--red)':val>70?'var(--orange)':val>55?'var(--amber)':'linear-gradient(90deg,var(--blue),var(--cyan))'}"></i></div><strong>${val}%</strong></div>`; }
  function maxGate(e){const [g]=Object.entries(e.crowd).sort((a,b)=>b[1]-a[1])[0];return cap(g)+' Gate'}
  function crowdWord(v){return v>=85?'Very busy':v>=70?'Busy':v>=55?'Medium':'Easy'}
  function crowdColor(v){return v>=85?'#d94757':v>=70?'#e1702f':v>=55?'#e2a11a':'#1ca46d'}

  // -------- 3D map --------
  function mapContainer(id,e,destination,mode){ return `<section class="map-shell"><div id="${id}" class="map3d"></div><div class="map-fallback hidden" id="${id}Fallback"><div class="map-fallback-card"><span class="pill">3D MAP</span><h3>Map could not load.</h3><p>The event guide still works. Connect to the internet to load OpenStreetMap 3D tiles.</p></div></div><div class="map-overlay-top"><div class="map-title"><b>${e.name}</b><span>${mode==='attendee'?'3D guest guide':mode==='operator'?'3D operator work map':'3D operations map'}</span></div><div class="map-tools"><button class="map-tool" data-map-rotate="${id}">Rotate 3D</button><button class="map-tool" data-map-reset="${id}">Reset view</button></div></div><div class="map-legend"><span><i class="status-dot c-green"></i>Easy</span><span><i class="status-dot c-amber"></i>Medium</span><span><i class="status-dot c-orange"></i>Busy</span><span><i class="status-dot c-red"></i>Very busy</span></div><div class="map-detail" id="${id}Detail"><small>SELECTED PLACE</small><h3 style="margin:6px 0">${poiLabel(e,destination)}</h3><p>${mapInstruction(e,destination)}</p><span class="pill" style="background:rgba(255,255,255,.1);color:#fff">3D · REAL ROADS & BUILDINGS</span></div></section>`; }

  function init3DMap(id,e,destination,opts={}){
    const el=document.getElementById(id); if(!el)return;
    ensureMapLibre().then(()=>start3DMap(id,e,destination,opts)).catch(()=>showFallback(id));
  }
  function ensureMapLibre(){
    if(window.maplibregl) return Promise.resolve();
    if(window.__eventflowMapPromise) return window.__eventflowMapPromise;
    window.__eventflowMapPromise=new Promise((resolve,reject)=>{
      if(!document.getElementById('maplibreCss')){const l=document.createElement('link');l.id='maplibreCss';l.rel='stylesheet';l.href='https://unpkg.com/maplibre-gl@6.8.0/dist/maplibre-gl.css';document.head.appendChild(l);}
      const s=document.createElement('script');s.src='https://unpkg.com/maplibre-gl@6.8.0/dist/maplibre-gl.js';s.async=true;s.onload=()=>window.maplibregl?resolve():reject(new Error('MapLibre unavailable'));s.onerror=()=>reject(new Error('MapLibre failed to load'));document.head.appendChild(s);
      setTimeout(()=>{if(!window.maplibregl)reject(new Error('MapLibre timeout'))},7000);
    });
    return window.__eventflowMapPromise;
  }
  function start3DMap(id,e,destination,opts={}){
    const el=document.getElementById(id); if(!el||!window.maplibregl)return showFallback(id);
    let loaded=false;
    const map=new maplibregl.Map({container:id,style:'https://tiles.openfreemap.org/styles/bright',center:e.center,zoom:16.1,pitch:58,bearing:-24,canvasContextAttributes:{antialias:true},attributionControl:true}); maps.push(map);
    map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
    const failTimer=setTimeout(()=>{if(!loaded)showFallback(id)},7000);
    map.on('error',err=>{ if(!loaded && String(err?.error?.message||'').toLowerCase().includes('fetch')) showFallback(id); });
    map.on('load',()=>{
      loaded=true;clearTimeout(failTimer);document.getElementById(id+'Fallback')?.classList.add('hidden');
      add3DBuildings(map);
      addEvent3DOverlay(map,e);
      const points=eventPoints(e); addMapMarkers(map,e,points,id,opts.mode); addRoute(map,e,destination,points,opts.mode);
      map.easeTo({center:routeCenter(e,destination,points),zoom:16.35,pitch:62,bearing:-28,duration:1200});
    });
    const rotateBtn=document.querySelector(`[data-map-rotate="${id}"]`), resetBtn=document.querySelector(`[data-map-reset="${id}"]`);
    rotateBtn?.addEventListener('click',()=>map.easeTo({bearing:map.getBearing()+65,pitch:62,duration:900}));
    resetBtn?.addEventListener('click',()=>map.easeTo({center:e.center,zoom:16.1,pitch:58,bearing:-24,duration:900}));
  }
  function showFallback(id){document.getElementById(id)?.classList.add('hidden');document.getElementById(id+'Fallback')?.classList.remove('hidden');}
  function add3DBuildings(map){
    try{
      const layers=map.getStyle().layers||[]; const label=layers.find(l=>l.type==='symbol'&&l.layout&&l.layout['text-field']);
      if(!map.getSource('eventflow-buildings')) map.addSource('eventflow-buildings',{url:'https://tiles.openfreemap.org/planet',type:'vector'});
      if(!map.getLayer('eventflow-3d-buildings')) map.addLayer({id:'eventflow-3d-buildings',source:'eventflow-buildings','source-layer':'building',type:'fill-extrusion',minzoom:14.8,filter:['!=',['get','hide_3d'],true],paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],0],0,'#e9edf3',40,'#d9e3f1',120,'#c8d5ea',250,'#b6c7e4'],'fill-extrusion-height':['interpolate',['linear'],['zoom'],14.8,0,16,['coalesce',['get','render_height'],12]],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.88}},label?.id);
    }catch(err){console.warn('3D buildings unavailable',err)}
  }

  function addEvent3DOverlay(map,e){
    try{
      const [lng,lat]=e.center;
      const rect=(cx,cy,w,h,props={})=>({type:'Feature',properties:props,geometry:{type:'Polygon',coordinates:[[[cx-w,cy-h],[cx+w,cy-h],[cx+w,cy+h],[cx-w,cy+h],[cx-w,cy-h]]]}});
      let features=[];
      if(e.id==='cricket'){
        features=[
          rect(lng,lat+.00058,.00078,.00018,{height:24,color:'#cbd8ed',name:'North Stand'}),
          rect(lng,lat-.00058,.00078,.00018,{height:22,color:'#cbd8ed',name:'South Stand'}),
          rect(lng+.00078,lat,.00018,.00042,{height:26,color:'#b9cae6',name:'East Stand'}),
          rect(lng-.00078,lat,.00018,.00042,{height:20,color:'#d5dfef',name:'West Stand'}),
          rect(lng,lat,.00052,.00031,{height:1,color:'#9bd58e',name:'Field'})
        ];
      }else if(e.id==='concert'){
        features=[rect(lng-.00045,lat,.00023,.00052,{height:19,color:'#7789db',name:'Main Stage'}),rect(lng+.00022,lat+.00032,.00052,.00018,{height:5,color:'#d5dcef',name:'Upper Zone'}),rect(lng+.00022,lat-.00032,.00052,.00018,{height:5,color:'#cbd5ec',name:'Lower Zone'})];
      }else if(e.id==='expo'){
        features=[rect(lng-.00055,lat+.00028,.00035,.00024,{height:17,color:'#b9d8df',name:'Hall 1'}),rect(lng+.0003,lat+.00028,.00035,.00024,{height:20,color:'#b6c8e8',name:'Hall 2'}),rect(lng-.00015,lat-.00038,.00055,.00022,{height:13,color:'#d0d9ea',name:'Startup Hall'})];
      }else{
        features=[rect(lng-.00045,lat,.0003,.00022,{height:10,color:'#e6c99c',name:'Food Pavilion'}),rect(lng+.00035,lat+.00032,.00026,.00018,{height:14,color:'#bfcce8',name:'Culture Stage'}),rect(lng+.00035,lat-.00032,.00028,.00018,{height:8,color:'#c7dfc2',name:'Family Zone'})];
      }
      map.addSource('eventflow-venue3d',{type:'geojson',data:{type:'FeatureCollection',features}});
      map.addLayer({id:'eventflow-venue3d',type:'fill-extrusion',source:'eventflow-venue3d',paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':.92}});
      map.addLayer({id:'eventflow-venue-outline',type:'line',source:'eventflow-venue3d',paint:{'line-color':'#65789a','line-width':1.4,'line-opacity':.5}});
    }catch(err){console.warn('Event 3D overlay unavailable',err)}
  }

  function eventPoints(e){ const [lng,lat]=e.center; const p=(dx,dy)=>[lng+dx,lat+dy]; return {
    venue:{id:'venue',label:e.venue,coord:p(0,0),color:'#3567f5'}, north:{id:'north',label:'North Gate',coord:p(0,.00145),color:crowdColor(e.crowd.north),crowd:e.crowd.north}, east:{id:'east',label:'East Gate',coord:p(.00155,.00012),color:crowdColor(e.crowd.east),crowd:e.crowd.east}, south:{id:'south',label:'South Gate',coord:p(.00008,-.00145),color:crowdColor(e.crowd.south),crowd:e.crowd.south}, west:{id:'west',label:'West Gate',coord:p(-.00155,-.0001),color:crowdColor(e.crowd.west),crowd:e.crowd.west},
    seat:{id:'seat',label:e.id==='cricket'?'Your Seat / Block':'Main Event Area',coord:p(.00022,.00014),color:'#7a5cff'}, stage:{id:'stage',label:e.mainPlace,coord:p(.00015,.00012),color:'#7a5cff'}, food:{id:'food',label:'Food & Drinks',coord:p(.00102,.00072),color:'#20b9c7'}, washroom:{id:'washroom',label:'Washroom',coord:p(-.00072,-.0007),color:'#3567f5'}, medical:{id:'medical',label:'Medical Help',coord:p(-.00102,.00065),color:'#d94757'}, parking:{id:'parking',label:'Parking / Pickup',coord:p(.00215,-.00142),color:'#e2a11a'}, exit:{id:'exit',label:'Suggested Exit',coord:p(-.00155,-.0001),color:'#1ca46d'}, stay:{id:'stay',label:'Nearby Stay',coord:p(.00265,.00155),color:'#7a5cff'}, gate:{id:'gate',label:bestGate(e),coord:gatePoint(e,p)}
    } }
  function gatePoint(e,p){const g=bestGate(e).split(' ')[0].toLowerCase();return {north:p(0,.00145),east:p(.00155,.00012),south:p(.00008,-.00145),west:p(-.00155,-.0001)}[g]}
  function addMapMarkers(map,e,points,id,mode){
    const keys=mode==='attendee'?['north','east','south','west','seat','stage','food','washroom','medical','parking','exit']:['north','east','south','west','food','medical','parking','venue'];
    keys.forEach(k=>{const pt=points[k]; if(!pt)return; const div=document.createElement('div'); const isGate=['north','east','south','west'].includes(k); div.className=isGate?'crowd-marker':'poi-marker';div.style.setProperty('--marker',pt.color);div.textContent=isGate?(pt.crowd+'%'):(POI_ICONS[k]||EVENT_ICONS[e.id]||'•');div.title=pt.label;div.addEventListener('click',()=>{const d=document.getElementById(id+'Detail');if(d)d.innerHTML=`<small>${isGate?'LIVE CROWD':'EVENT PLACE'}</small><h3 style="margin:6px 0">${pt.label}</h3><p>${isGate?`${pt.crowd}% crowd · ${crowdWord(pt.crowd)} right now.`:poiClickText(e,k)}</p><span class="pill" style="background:rgba(255,255,255,.1);color:#fff">CLICKED ON 3D MAP</span>`;}); new maplibregl.Marker({element:div,anchor:'bottom'}).setLngLat(pt.coord).addTo(map);});
  }
  function addRoute(map,e,destination,points,mode){ const dest=resolvePoint(e,destination,points), gate=resolveGate(e,points); const start=mode==='attendee'?points.parking?.coord||offset(e.center,.0022,-.0015):offset(e.center,-.0020,.0019); const coords=[start,gate.coord,dest.coord]; try{map.addSource('eventflow-route',{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:coords}}});map.addLayer({id:'route-glow',type:'line',source:'eventflow-route',paint:{'line-color':'#ffffff','line-width':9,'line-opacity':.8}});map.addLayer({id:'route-main',type:'line',source:'eventflow-route',paint:{'line-color':'#3567f5','line-width':5,'line-opacity':.95,'line-dasharray':[1.1,1.25]}});}catch{}
  }
  function resolveGate(e,p){const g=bestGate(e).split(' ')[0].toLowerCase();return p[g]||p.east}
  function resolvePoint(e,id,p){ if(id==='gate')return resolveGate(e,p); if(id==='north'||id==='east'||id==='south'||id==='west')return p[id];return p[id]||p[defaultPoi(e)]||p.venue }
  function defaultPoi(e){return e.id==='cricket'?'seat':e.id==='concert'?'stage':e.id==='expo'?'stage':'food'}
  function routeCenter(e,id,p){const d=resolvePoint(e,id,p).coord,g=resolveGate(e,p).coord;return[(d[0]+g[0])/2,(d[1]+g[1])/2]}
  function offset(c,dx,dy){return[c[0]+dx,c[1]+dy]}
  function poiLabel(e,id){ const labels={seat:'My Seat',stage:e.mainPlace,food:'Food & Drinks',washroom:'Washroom',medical:'Medical Help',parking:'Parking / Pickup',exit:'Suggested Exit',stay:'Nearby Stay',gate:bestGate(e),north:'North Gate',east:'East Gate',south:'South Gate',west:'West Gate'}; return labels[id]||e.mainPlace; }
  function poiClickText(e,id){ if(['north','east','south','west'].includes(id))return 'Live gate crowd status.';return `${poiLabel(e,id)} is marked on the event map. Click or use the route guide to reach it.`; }
  function mapInstruction(e,id){const gate=bestGate(e); if(id==='parking')return `Go to Parking / Pickup. If you enter the event after that, ${gate} is currently easier.`; if(id==='exit')return `Use this exit for a smoother connection to pickup, parking and transport.`; if(id==='medical')return `Medical Help is open. Follow the highlighted path from the event area.`; if(id==='washroom')return `Follow the highlighted path to the nearest washroom from your current event zone.`; if(id==='food')return `This food point has a lower wait. Enter through ${gate} if you are still outside.`; if(id==='north'||id==='east'||id==='south'||id==='west')return `${poiLabel(e,id)} live crowd is shown on the map.`; return `Use ${gate}, then follow the highlighted path to ${poiLabel(e,id)}.`; }

  seed(); render();
})();

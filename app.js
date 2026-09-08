const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const cfg = window.EVENTFLOW_CONFIG || {};
const SB = window.EventFlowSupabase;
const STORE = 'eventflow.premium.state.v2';

const icons = {
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>',
  crowd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 15c3.2-.2 5.5 1.6 5.5 5"/></svg>',
  bus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M7 18v3M17 18v3M4 10h16M8 14h.01M16 14h.01"/></svg>',
  hotel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 21V5h12v16M16 10h4v11M8 9h4M8 13h4M8 17h4"/></svg>',
  parking:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M10 17V7h4a3 3 0 0 1 0 6h-4"/></svg>',
  venue:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h16M6 20V8l6-4 6 4v12M9 20v-6h6v6"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
  flask:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 3h6M10 3v6l-5.5 9.3A1.8 1.8 0 0 0 6 21h12a1.8 1.8 0 0 0 1.5-2.7L14 9V3"/><path d="M8 15h8"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3.4 0 6 1.5 6 5"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  route:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m3 11 9-8 9 8v9H6v-9"/><path d="M9 20v-6h6v6"/></svg>',
  profile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></svg>',
  message:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v12H8l-4 4V4Z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12 4 4L19 6"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></svg>'
};
function ico(name){ return `<span class="icon">${icons[name] || icons.grid}</span>`; }
function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
function num(n){return Math.round(n).toLocaleString('en-IN');}
function nowTime(){return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}

const baseState = {
  logged:false,
  role:'organizer',
  page:'command',
  scenario:'Normal Traffic',
  backend:'checking',
  account:{name:'Demo Controller',email:'demo@eventflow.local',provider:'demo'},
  event:{name:'National Sports Championship Final',venue:'Unity Arena',date:'08 Sep 2026',city:'Mumbai Event District'},
  attendees:58420, inside:42860, incoming:10480, exiting:1260,
  occupancy:{venue:79,hotel:76,parking:82,transport:72},
  gates:{north:74,east:45,south:61,west:38},
  crowdPrediction:{north15:82,north30:91,north60:78,probability:86,risk:84},
  score:87,
  attendeeRoute:'North Gate',
  attendeeMessage:'Your current route is clear. North Gate is operating within planned capacity.',
  alerts:[
    {id:1,severity:'medium',title:'Parking P2 rising',detail:'P2 has reached 82% occupancy. P4 overflow remains available.',time:'1 min ago',status:'Open'},
    {id:2,severity:'info',title:'Metro East stable',detail:'Passenger pressure is within normal range with 4-minute headway.',time:'3 min ago',status:'Open'},
    {id:3,severity:'medium',title:'Hotel Central demand',detail:'Late-arrival accommodation demand is 13% above forecast.',time:'5 min ago',status:'Open'}
  ],
  actions:[
    {id:1,priority:'high',title:'Pre-stage East Gate lanes',location:'East Gate',problem:'Arrival wave expected after Metro East service.',before:45,after:56,unit:'% density',action:'Open two standby security lanes before 18:35.',impact:'Reduces queue formation during the next arrival wave.',status:'Pending'},
    {id:2,priority:'medium',title:'Reserve overflow parking',location:'Parking P4',problem:'P2 demand is trending above baseline.',before:82,after:68,unit:'% P2 load',action:'Reserve 420 P4 spaces for late arrivals.',impact:'Keeps P2 below saturation and smooths access roads.',status:'Pending'},
    {id:3,priority:'medium',title:'Stage two shuttles',location:'Metro East',problem:'Transport demand may peak after 19:10.',before:72,after:64,unit:'% load',action:'Move two standby shuttles to Metro East staging.',impact:'Cuts expected passenger wait by 4 minutes.',status:'Pending'}
  ],
  tasks:[
    {id:101,title:'Prepare overflow shuttle capacity',priority:'Medium',pickup:'Parking P4',destination:'East Gate',capacity:120,status:'Assigned',requested:'18:40'},
    {id:102,title:'Reserve 40 late-arrival rooms',priority:'Medium',pickup:'Hotel Zone B',destination:'Accommodation desk',capacity:40,status:'In Progress',requested:'18:15'}
  ],
  fleet:[
    {id:'SH-104',route:'P4 → Arena',occ:68,status:'Active',next:'6 min'},
    {id:'SH-107',route:'Metro East → Arena',occ:82,status:'Active',next:'4 min'},
    {id:'SH-112',route:'P3 → East Gate',occ:44,status:'Standby',next:'12 min'},
    {id:'BUS-28',route:'Central → Arena',occ:73,status:'Active',next:'9 min'}
  ]
};

let state = (()=>{ try {return {...baseState,...JSON.parse(localStorage.getItem(STORE)||'{}')};} catch {return structuredClone(baseState);} })();
state.occupancy = {...baseState.occupancy,...(state.occupancy||{})};
state.gates = {...baseState.gates,...(state.gates||{})};
state.crowdPrediction = {...baseState.crowdPrediction,...(state.crowdPrediction||{})};
state.event = {...baseState.event,...(state.event||{})};

function save(){ localStorage.setItem(STORE, JSON.stringify(state)); }
function toast(title,message){
  const host=$('#toastHost'); if(!host)return;
  const el=document.createElement('div'); el.className='toast'; el.innerHTML=`<b>${title}</b><p>${message}</p>`; host.appendChild(el);
  setTimeout(()=>el.remove(),3600);
}
function setState(patch, rerender=true){ state={...state,...patch}; save(); if(rerender) renderApp(); }

async function checkBackend(){
  try{ const ok=await SB.ping(); state.backend=ok?'connected':'offline'; }catch{state.backend='offline';}
  save(); if(state.logged) renderTopStatus();
}

/* ---------- LANDING ---------- */
function landingMapSVG(){
  return `<svg viewBox="0 0 760 500" aria-label="Animated miniature EventFlow city digital twin">
    <defs>
      <radialGradient id="heroHeatA"><stop offset="0" stop-color="#ff6d78" stop-opacity=".24"/><stop offset="1" stop-color="#ff6d78" stop-opacity="0"/></radialGradient>
      <radialGradient id="heroHeatB"><stop offset="0" stop-color="#53d9d0" stop-opacity=".18"/><stop offset="1" stop-color="#53d9d0" stop-opacity="0"/></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <rect width="760" height="500" fill="#081018"/>
    <g opacity=".65" stroke="#1c2c37" stroke-width="11" fill="none" stroke-linecap="round">
      <path d="M40 400 C165 360 190 260 320 250 S520 260 720 150"/><path d="M70 110 C190 160 290 140 365 230 S535 390 710 420"/><path d="M340 50 L350 445"/>
    </g>
    <g opacity=".8" stroke="#2a414f" stroke-width="1" fill="none" stroke-dasharray="5 7">
      <path d="M40 400 C165 360 190 260 320 250 S520 260 720 150"/><path d="M70 110 C190 160 290 140 365 230 S535 390 710 420"/><path d="M340 50 L350 445"/>
    </g>
    <circle cx="382" cy="243" r="118" fill="url(#heroHeatB)" filter="url(#soft)"/>
    <circle cx="278" cy="205" r="72" fill="url(#heroHeatA)" filter="url(#soft)" class="crowd-halo"/>
    <g fill="#0e1c25" stroke="#35505e"><rect x="300" y="185" rx="12" width="170" height="110"/><rect x="108" y="74" rx="8" width="92" height="61"/><rect x="570" y="80" rx="8" width="90" height="64"/><rect x="82" y="342" rx="8" width="106" height="70"/><rect x="566" y="350" rx="8" width="112" height="70"/></g>
    <g fill="#93a9b5" font-family="Inter" font-size="10" font-weight="700"><text x="337" y="245">UNITY ARENA</text><text x="126" y="108">HOTEL ZONE</text><text x="590" y="115">METRO EAST</text><text x="100" y="378">PARKING P4</text><text x="590" y="386">FOOD DISTRICT</text></g>
    <g fill="none" stroke="#53d9d0" stroke-width="2" stroke-dasharray="6 7"><path d="M170 105 C225 120 245 170 310 210"/><path d="M610 115 C550 130 505 180 465 220"/></g>
    ${Array.from({length:18},(_,i)=>{const x=120+(i*31)%520,y=110+((i*73)%270);return `<circle cx="${x}" cy="${y}" r="2.4" fill="#83e9e1" opacity="${.45+(i%4)*.12}"><animate attributeName="opacity" values=".35;1;.35" dur="${2+(i%3)}s" repeatCount="indefinite"/></circle>`}).join('')}
    <circle r="3.2" fill="#8cebe4"><animateMotion dur="8s" repeatCount="indefinite" path="M120 390 C220 360 250 280 340 255 S520 230 665 155"/></circle>
    <circle r="3" fill="#9c8cff"><animateMotion dur="9.5s" repeatCount="indefinite" begin="-3s" path="M620 110 C540 130 500 170 455 220 S390 265 335 270"/></circle>
  </svg>`;
}
function landing(){
  return `<main class="landing">
    <nav class="landing-nav">
      <div class="logo"><div class="logo-mark"></div><div class="logo-copy"><b>EventFlow</b><small>City-scale orchestration</small></div></div>
      <div class="land-links"><a href="#platform">Platform</a><a href="#intelligence">Intelligence</a><a href="#roles">Roles</a><a href="#demo">Live Demo</a></div>
      <div class="nav-actions"><button class="btn ghost" onclick="openAuth('login')">Sign in</button><button class="btn primary" onclick="demoLogin('organizer')">Launch demo</button></div>
    </nav>
    <section class="hero">
      <div class="hero-copy">
        <div class="hero-kicker"><i></i> Live orchestration intelligence</div>
        <h1>One event.<span>One operating system.</span></h1>
        <p>EventFlow predicts crowd pressure, coordinates capacity across venues, transport, parking and hospitality, then intelligently redirects people before bottlenecks become incidents.</p>
        <div class="hero-actions"><button class="btn primary" onclick="demoLogin('organizer')">${ico('spark')} Launch Command Center</button><button class="btn" onclick="document.querySelector('#platform').scrollIntoView()">${ico('map')} Explore the platform</button></div>
        <div class="hero-proof"><div class="proof-item"><b>58,420</b><span>Event visitors</span></div><div class="proof-item"><b>87/100</b><span>Coordination score</span></div><div class="proof-item"><b>&lt; 20 min</b><span>Early risk prediction</span></div></div>
      </div>
      <div class="hero-visual"><div class="hero-halo"></div><div class="city-shell"><div class="city-topbar"><div class="window-dots"><i></i><i></i><i></i></div><div class="city-status"><i></i> DIGITAL TWIN LIVE</div></div><div class="hero-map">${landingMapSVG()}</div></div><div class="floating-kpi one"><small>North Gate pressure</small><b>74%</b><span>+8% in 15 min</span></div><div class="floating-kpi two"><small>EventFlow score</small><b>87 / 100</b><span>Coordinated</span></div></div>
    </section>
    <section class="section" id="platform">
      <div class="section-head"><div class="eyebrow">Not event management. Event orchestration.</div><h2>From fragmented services to one connected operational picture.</h2><p>EventFlow creates a shared intelligence layer across the event ecosystem, so a change in crowd pressure can immediately influence transport, parking, hospitality and attendee guidance.</p></div>
      <div class="feature-grid">
        <article class="feature large"><div class="feature-icon">${ico('map')}</div><h3>Live Event Digital Twin</h3><p>A spatial operating view of venues, gates, hotels, parking, transit and crowd movement—with interactive zones, animated routes and density-aware context.</p><div class="feature-metric"><span>LIVE SIGNALS</span><b>GPS · gates · transit · occupancy</b></div></article>
        <article class="feature medium"><div class="feature-icon">${ico('crowd')}</div><h3>Predictive Crowd Intelligence</h3><p>Forecast crowd pressure at 15, 30 and 60 minutes, calculate congestion probability, and surface a recommended action before capacity becomes critical.</p><div class="feature-metric"><span>FORECAST HORIZON</span><b>60 minutes</b></div></article>
        <article class="feature third"><div class="feature-icon">${ico('spark')}</div><h3>AI Decision Engine</h3><p>Rule-driven prototype intelligence continuously evaluates thresholds and turns them into clear operational actions.</p></article>
        <article class="feature third"><div class="feature-icon">${ico('bus')}</div><h3>Dynamic Capacity Balancing</h3><p>Transport, parking and hotel capacity can be reallocated as demand moves across the city.</p></article>
        <article class="feature third"><div class="feature-icon">${ico('route')}</div><h3>Crowd-Aware Routing</h3><p>Attendee routes change with real event conditions instead of sending everyone through the same bottleneck.</p></article>
      </div>
    </section>
    <section class="section" id="intelligence">
      <div class="pill-row"><span class="pill">Predict</span><span class="pill">Coordinate</span><span class="pill">Redirect</span><span class="pill">Balance</span><span class="pill">Respond</span></div>
      <div class="section-head"><div class="eyebrow">Cross-stakeholder intelligence</div><h2>A recommendation is only useful when the whole ecosystem can act on it.</h2><p>Organizer approval creates an operator assignment. Operator acceptance updates fleet capacity. Attendee guidance then reflects the new state. The system behaves as one connected loop.</p></div>
    </section>
    <section class="section" id="roles"><div class="section-head"><div class="eyebrow">Three dedicated experiences</div><h2>Different users. One coordinated event state.</h2></div><div class="role-cards">
      ${roleCard('organizer','Command Center','City-wide situational awareness, prediction, simulation and action approval',['Digital Twin','AI Actions','Scenario Simulator','Operations Analytics'])}
      ${roleCard('operator','Operator Console','Focused resource and assignment workflow for transport and hospitality teams.',['Assignments','Capacity Updates','Demand Forecast','Fleet Status'])}
      ${roleCard('attendee','Attendee Assistant','A simple travel companion that converts city-scale intelligence into personal guidance.',['Personal Journey','Crowd-aware Routes','Arrival Planner','Exit Guidance'])}
    </div></section>
    <section class="final-cta" id="demo"><div class="cta-panel"><div><h2>Orchestrate the entire event ecosystem.</h2><p>Trigger a crowd surge and watch EventFlow predict, coordinate and redistribute the event in real time.</p></div><button class="btn primary" onclick="demoLogin('organizer')">Open live demo</button></div></section>
  </main>`;
}
function roleCard(role,title,desc,items){return `<article class="role-card"><div class="feature-icon">${ico(role==='organizer'?'grid':role==='operator'?'bus':'route')}</div><h3>${title}</h3><p>${desc}</p><div class="role-list">${items.map(x=>`<span><i></i>${x}</span>`).join('')}</div><button class="btn soft" style="margin-top:18px" onclick="demoLogin('${role}')">Open ${title}</button></article>`}

/* ---------- AUTH ---------- */
let authMode='login', authRole='organizer';
function openAuth(mode='login'){
  authMode=mode;
  document.body.insertAdjacentHTML('beforeend', authModal());
}
function authModal(){
  return `<div class="modal" id="authModal" onclick="if(event.target===this)this.remove()"><div class="modal-card"><div class="modal-head"><b>Access EventFlow</b><button class="modal-close" onclick="$('#authModal').remove()">×</button></div><div class="modal-body">
    <div class="auth-tabs"><button class="auth-tab ${authMode==='login'?'active':''}" onclick="switchAuth('login')">Sign in</button><button class="auth-tab ${authMode==='register'?'active':''}" onclick="switchAuth('register')">Create account</button></div>
    <div id="authContent">${authForm()}</div>
  </div></div></div>`;
}
function authForm(){
  return `<div class="form-grid">
    ${authMode==='register'?`<div class="field"><label>Name</label><input id="authName" placeholder="Your name" /></div>`:''}
    <div class="field"><label>Email</label><input id="authEmail" type="email" placeholder="name@example.com" /></div>
    <div class="field"><label>Password</label><input id="authPassword" type="password" placeholder="Minimum 6 characters" /></div>
    <div class="field"><label>Role</label><div class="auth-role-grid">${['organizer','operator','attendee'].map(r=>`<button class="role-option ${authRole===r?'active':''}" onclick="event.preventDefault();authRole='${r}';$('#authContent').innerHTML=authForm()">${r[0].toUpperCase()+r.slice(1)}</button>`).join('')}</div></div>
    <div class="auth-status ${state.backend==='connected'?'good':''}">${state.backend==='connected'?'Supabase project reachable. Authentication will use your connected project.':'Backend check pending/offline. Demo mode still works without interruption.'}</div>
    <button class="btn primary" onclick="submitAuth()">${authMode==='login'?'Sign in':'Create account'}</button>
    <button class="btn" onclick="demoLogin(authRole);$('#authModal')?.remove()">${checkinMode?'Preview without GPS upload':'Continue with demo '+authRole}</button>
  </div>`;
}
function switchAuth(mode){authMode=mode;$('#authContent').innerHTML=authForm();$$('.auth-tab').forEach((b,i)=>b.classList.toggle('active',(i===0&&mode==='login')||(i===1&&mode==='register')))}
async function submitAuth(){
  const email=$('#authEmail')?.value?.trim(),password=$('#authPassword')?.value||'',name=$('#authName')?.value?.trim()||email?.split('@')[0];
  if(!email||password.length<6){toast('Check your details','Enter a valid email and a password of at least 6 characters.');return}
  try{
    const data=authMode==='login'?await SB.signIn({email,password}):await SB.signUp({email,password,name,role:authRole});
    const user=data?.user || await SB.getUser();
    const role=user?.user_metadata?.role || authRole;
    state.logged=true;state.role=role;state.page=(checkinMode&&role==='attendee')?'map':defaultPage(role);state.account={name:user?.user_metadata?.name||name,email,provider:'supabase'};save();
    $('#authModal')?.remove();renderApp();toast('Connected to EventFlow',`Signed in as ${role}.`);hydrateFromSupabase();
  }catch(e){toast('Authentication failed',e.message||'Could not sign in to Supabase.');}
}
function demoLogin(role='organizer'){
  state.logged=true;state.role=role;state.page=(checkinMode&&role==='attendee')?'map':defaultPage(role);state.account={name:role==='organizer'?'Demo Controller':role==='operator'?'MetroLink Operations':'Demo Attendee',email:'demo@eventflow.local',provider:'demo'};save();renderApp();toast('Live demo ready',`${role[0].toUpperCase()+role.slice(1)} experience loaded.`);
}
async function logout(){if(state.account.provider==='supabase')await SB.signOut();state.logged=false;save();renderApp();}
function defaultPage(role){return role==='organizer'?'command':role==='operator'?'overview':'journey'}

/* ---------- SHELL ---------- */
const navs={
 organizer:[['command','grid','Command Center'],['map','map','Live Map'],['crowd','crowd','Crowd Intelligence'],['transport','bus','Transport'],['accommodation','hotel','Accommodation'],['parking','parking','Parking'],['venues','venue','Venues'],['actions','spark','AI Actions'],['alerts','bell','Alerts'],['simulation','flask','Simulation'],['analytics','chart','Analytics'],['timeline','clock','Event Timeline'],['operators','users','Operators'],['settings','settings','Settings']],
 operator:[['overview','grid','Overview'],['resources','venue','Resources'],['assignments','check','Assignments'],['forecast','chart','Demand Forecast'],['fleet','bus','Fleet / Capacity'],['messages','message','Messages'],['analytics','chart','Analytics'],['settings','settings','Settings']],
 attendee:[['journey','route','My Journey'],['map','map','Live Map'],['navigation','route','Navigation'],['transport','bus','Transport'],['parking','parking','Parking'],['accommodation','hotel','Accommodation'],['event','clock','My Event'],['alerts','bell','Alerts'],['profile','profile','Profile']]
};
function shell(){
  const nav=navs[state.role];
  return `<div class="app-shell"><aside class="sidebar">
    <div class="side-brand"><div class="logo-mark"></div><div><b>EventFlow</b><small>Orchestration OS</small></div></div>
    <div class="event-chip"><small>Active event</small><b>${state.event.name}</b><span>${state.event.venue} · ${state.event.date}</span></div>
    <div class="nav-label">${state.role==='organizer'?'Operations':state.role==='operator'?'Operator console':'Personal assistant'}</div>
    <div class="nav-list">${nav.map(([p,i,l])=>`<button class="nav-item ${state.page===p?'active':''}" onclick="setPage('${p}')">${ico(i)}<span>${l}</span>${p==='alerts'&&state.alerts.filter(a=>a.status==='Open').length?`<em class="count">${state.alerts.filter(a=>a.status==='Open').length}</em>`:''}</button>`).join('')}</div>
    <div class="sidebar-bottom"><div class="role-tabs">${['organizer','operator','attendee'].map(r=>`<button class="role-tab ${state.role===r?'active':''}" onclick="switchRole('${r}')">${r.slice(0,3).toUpperCase()}</button>`).join('')}</div><div class="user-card"><div class="avatar">${state.account.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div><div><b>${state.account.name}</b><small>${state.account.provider==='supabase'?'Supabase account':'Hackathon demo'}</small></div><button title="Log out" onclick="logout()">${ico('logout')}</button></div></div>
  </aside><main class="app-main"><header class="topbar"><div class="top-left"><button class="search-box" onclick="openPalette()">${ico('search')} Search venues, gates, transport... <kbd>⌘K</kbd></button></div><div class="top-right"><div class="live-badge" id="liveStatus"><i></i> LIVE · <span id="lastUpdated">NOW</span></div><button class="top-icon" onclick="openNotifications()">${ico('bell')}<span class="badge-dot"></span></button><button class="top-icon" onclick="openPalette()">${ico('spark')}</button></div></header><div class="content" id="content"></div></main></div>`;
}
function renderTopStatus(){const el=$('#liveStatus');if(!el)return;el.title=state.backend==='connected'?'Supabase reachable':'Running live demo fallback';}
function setPage(page){state.page=page;save();renderContent();window.scrollTo({top:0,behavior:'smooth'});}
function switchRole(role){state.role=role;state.page=defaultPage(role);save();renderApp();}

function pageHeader(kicker,title,desc,actions=''){return `<div class="page-header"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${actions?`<div class="header-actions">${actions}</div>`:''}</div>`}
function kpi(label,value,meta,trend='up'){return `<div class="panel kpi"><div class="kpi-label"><span>${label}</span><span>LIVE</span></div><div class="kpi-value">${value}</div><div class="kpi-meta"><span>${meta}</span><span class="trend ${trend}">${trend==='up'?'↗':trend==='down'?'↘':'●'}</span></div></div>`}
function scorePanel(){
  const s=state.score;return `<div class="panel score-panel"><div class="score-top"><div><div class="eyebrow">EventFlow score</div><div class="score-num">${s}<span>/100</span></div></div><div class="score-state"><b>${s>=85?'Coordinated':s>=70?'Stabilizing':'Under Pressure'}</b><small>system-wide health</small></div></div><div class="score-meter"><i style="width:${s}%"></i></div><div class="subscores">${[['Crowd Balance',clamp(s-2,0,100)],['Transport Efficiency',clamp(s+1,0,100)],['Accommodation',clamp(s-4,0,100)],['Visitor Experience',clamp(s+3,0,100)]].map(([l,v])=>`<div class="subscore"><div><label>${l}</label><div class="mini-meter"><i style="width:${v}%"></i></div></div><b>${v}</b></div>`).join('')}</div></div>`;
}

/* ---------- DIGITAL TWIN ---------- */
const mapLocations={
 north:{name:'North Gate',type:'Entry Gate',capacity:2500,current:()=>Math.round(2500*state.gates.north/100),density:()=>state.gates.north,status:()=>state.gates.north>=90?'Critical':state.gates.north>=75?'Heavy':state.gates.north>=55?'Moderate':'Normal',note:'Primary arrivals from Central approach.'},
 east:{name:'East Gate',type:'Entry Gate',capacity:2200,current:()=>Math.round(2200*state.gates.east/100),density:()=>state.gates.east,status:()=>state.gates.east>=75?'Heavy':state.gates.east>=55?'Moderate':'Normal',note:'Best connected to Metro East and shuttle staging.'},
 p2:{name:'Parking P2',type:'Parking Zone',capacity:1800,current:()=>Math.round(1800*state.occupancy.parking/100),density:()=>state.occupancy.parking,status:()=>state.occupancy.parking>=90?'Critical':state.occupancy.parking>=75?'Heavy':'Normal',note:'Western vehicle arrivals and taxi overflow.'},
 hotel:{name:'Hotel Central',type:'Accommodation',capacity:540,current:()=>Math.round(540*state.occupancy.hotel/100),density:()=>state.occupancy.hotel,status:()=>state.occupancy.hotel>=90?'Critical':state.occupancy.hotel>=75?'Heavy':'Normal',note:'Partner inventory connected to Shuttle S2.'},
 metro:{name:'Metro East',type:'Transit Hub',capacity:3200,current:()=>Math.round(3200*state.occupancy.transport/100),density:()=>state.occupancy.transport,status:()=>state.occupancy.transport>=90?'Critical':state.occupancy.transport>=75?'Heavy':'Normal',note:'High-frequency rail and shuttle interchange.'},
 arena:{name:'Unity Arena',type:'Main Venue',capacity:54000,current:()=>Math.round(54000*state.occupancy.venue/100),density:()=>state.occupancy.venue,status:()=>state.occupancy.venue>=90?'Critical':state.occupancy.venue>=80?'Heavy':'Normal',note:'Main championship venue and concert zone.'}
};
function densityColor(v){return v>=90?'#ff6d78':v>=75?'#f2bd5c':v>=55?'#e5cf72':'#58d89a'}
function halo(cx,cy,r,value){const c=densityColor(value);return `<circle class="crowd-halo" cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${value>=90?.12:value>=75?.09:.055}"/><circle cx="${cx}" cy="${cy}" r="${r*.55}" fill="${c}" opacity="${value>=90?.12:.05}"/>`}
function marker(id,x,y,value,label){const c=densityColor(value);return `<g class="map-marker" onclick="openMapDrawer('${id}')"><circle class="marker-ring" cx="${x}" cy="${y}" r="10" stroke="${c}"/><circle class="marker-core" cx="${x}" cy="${y}" r="6" fill="${c}"/><text x="${x+10}" y="${y-3}" class="map-label">${label}</text><text x="${x+10}" y="${y+8}" class="map-sub">${value}% load</text></g>`}
function digitalTwinMarkup(attendee=false){
  const activeRoute=state.attendeeRoute||'North Gate';
  return `<div class="google-map-shell">
    <div class="gm-toolbar">
      <div class="gm-live-copy"><span class="gm-pulse"></span><div><b>EventFlow Live Mobility Map</b><small id="gmStatus">Loading OpenStreetMap…</small></div></div>
      <div class="gm-controls">
        <button class="map-tool active" id="gmTrafficBtn" onclick="EventFlowFreeMap.toggleRoads()">Road map</button>
        <button class="map-tool active" id="gmCrowdBtn" onclick="EventFlowFreeMap.toggleCrowd()">Live GPS crowd</button>
        ${attendee?`<button class="map-tool" onclick="EventFlowFreeMap.useMyLocation()">Share live GPS</button><button class="map-tool" onclick="EventFlowFreeMap.findAlternateRoute()">Find alternate route</button>`:`<button class="map-tool" onclick="openCheckinQR()">Check-in QR</button>`}
      </div>
    </div>
    <div class="gm-map-wrap">
      <div id="eventMap" class="google-map" aria-label="EventFlow live OpenStreetMap mobility map"></div>
      <div class="gm-overlay-card gm-left-card">
        <small>${attendee?'YOUR JOURNEY':'LIVE CROWD NETWORK'}</small>
        <b>${attendee?activeRoute:'Anonymous phone signals'}</b>
        <span id="gmPhoneCount">Connecting GPS density…</span>
        ${attendee?`<span>GPS accuracy <strong id="gmAccuracy">not connected</strong></span>`:`<span>Raw attendee GPS is not shown; organizer sees aggregated density.</span>`}
      </div>
      <div class="gm-overlay-card gm-right-card">
        <small>ROUTING INTELLIGENCE</small>
        <b>${attendee?'Road + crowd aware':'OpenStreetMap + EventFlow crowd'}</b>
        <span>${attendee?'If your gate or approach is congested, EventFlow selects a lower-pressure gate and draws an alternate road route.':'Road geography comes from OpenStreetMap; live event pressure comes from opted-in attendee GPS.'}</span>
      </div>
    </div>
    ${attendee?`<div class="gm-route-list" id="gmRouteList"><div class="gm-route-empty">Share GPS, then tap <b>Find alternate route</b>. EventFlow will combine live GPS crowd pressure with OpenStreetMap road routing and choose a lower-pressure gate.</div></div>`:''}
    <div class="gm-privacy"><span>●</span> GPS is shared only after attendee permission. EventFlow uses short-lived, pseudonymous signals and aggregated crowd cells for the command map.</div>
  </div>`;
}
function openCheckinQR(){
  const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('checkin','1');
  openModal('Attendee Live GPS Check-in',`<div class="qr-layout"><div><div class="eyebrow">SCAN AT EVENT ENTRY</div><h3 style="font:700 18px Manrope;margin:8px 0">Join the live crowd network</h3><p class="muted" style="font-size:10px;line-height:1.7">Attendees scan this QR on their phone, open EventFlow, and explicitly allow location. Their exact coordinates are never displayed on the organizer map; only aggregate crowd density is shown.</p><div class="qr-link">${u.toString()}</div></div><div class="qr-box"><canvas id="checkinQr" width="210" height="210"></canvas></div></div>`);
  requestAnimationFrame(()=>{const c=document.getElementById('checkinQr');if(c&&window.QRCode)QRCode.toCanvas(c,u.toString(),{width:210,margin:1},()=>{});});
}
function openMapDrawer(id){
  const l=mapLocations[id]; const d=$('#mapDrawer'); if(!l||!d)return; const v=l.density();
  d.innerHTML=`<button class="drawer-close" onclick="closeMapDrawer()">×</button><div class="drawer-icon">${ico(id==='p2'?'parking':id==='hotel'?'hotel':id==='metro'?'bus':id==='arena'?'venue':'crowd')}</div><div class="eyebrow">${l.type}</div><h3>${l.name}</h3><p>${l.note}</p><div class="drawer-stat"><span>Current people/load</span><b>${num(l.current())}</b></div><div class="drawer-stat"><span>Capacity</span><b>${num(l.capacity)}</b></div><div class="drawer-stat"><span>Density</span><b style="color:${densityColor(v)}">${v}% · ${l.status()}</b></div><div class="capacity-bar"><i style="width:${v}%"></i></div>${id==='north'?`<div class="drawer-stat"><span>Expected in 15 min</span><b>${state.crowdPrediction.north15}%</b></div><div class="drawer-stat"><span>Congestion probability</span><b>${state.crowdPrediction.probability}%</b></div><button class="btn soft" style="width:100%;margin-top:12px" onclick="setPage('crowd')">Open prediction intelligence</button>`:''}`;d.classList.add('open');
}
function closeMapDrawer(){$('#mapDrawer')?.classList.remove('open')}

/* ---------- ORGANIZER ---------- */
function commandCenter(){
  const surge=state.scenario==='Crowd Surge';
  return `${pageHeader('City-scale command center','Live Event Command Center','One operational picture across crowd movement, transport, parking, accommodation and venue capacity.',`<button class="btn" onclick="openDailyBrief()">${ico('spark')} Daily briefing</button><button class="btn primary" onclick="setPage('simulation')">${ico('flask')} Run scenario</button>`)}
  <div class="grid kpi-grid">
    ${kpi('Registered',num(state.attendees),'Total attendees')}${kpi('Inside event',num(state.inside),`${Math.round(state.inside/state.attendees*100)}% of registered`)}${kpi('Incoming',num(state.incoming),'Next arrival wave',surge?'warn':'up')}${kpi('Venue occupancy',state.occupancy.venue+'%','Unity Arena',state.occupancy.venue>85?'warn':'up')}${kpi('Transport load',state.occupancy.transport+'%','Network average',state.occupancy.transport>85?'warn':'up')}${kpi('Active warnings',state.alerts.filter(a=>a.status==='Open').length,'Across event ecosystem',state.alerts.some(a=>a.severity==='critical')?'down':'warn')}
  </div>
  <div class="grid command-grid"><section class="panel map-panel"><div class="map-toolbar"><div class="map-title">${ico('map')}<div><b>Event Digital Twin</b><small>${state.event.city} · ${state.scenario}</small></div></div><div class="map-tools"><button class="map-tool active">Crowd heat</button><button class="map-tool">Routes</button><button class="map-tool">Capacity</button></div></div>${digitalTwinMarkup(false)}</section><aside class="right-stack">${scorePanel()}<section class="panel"><div class="panel-head"><h3>Operations Alerts</h3><span>${state.alerts.filter(a=>a.status==='Open').length} active</span></div><div class="alert-feed">${alertsHTML(4)}</div></section></aside></div>
  <section class="panel scenario-strip">${scenarioButtons()}</section>
  <div class="grid action-grid">${state.actions.slice(0,3).map(actionCard).join('')}</div>`;
}
function alertsHTML(limit=99){return state.alerts.filter(a=>a.status==='Open').slice(0,limit).map(a=>`<div class="alert-row"><div class="alert-top"><span class="severity ${a.severity}">${a.severity}</span><small>${a.time}</small></div><p><b style="color:#ced9de">${a.title}</b><br>${a.detail}</p><div class="alert-actions"><button class="mini-btn" onclick="ackAlert(${a.id})">Acknowledge</button><button class="mini-btn" onclick="setPage('map')">View map</button></div></div>`).join('')||`<div class="panel-body muted" style="font-size:10px">No active alerts. Event conditions are stable.</div>`}
function scenarioButtons(){return ['Normal Traffic','Crowd Surge','Parking Full','Transport Failure','Heavy Rain','Event Finished','Emergency Gate Closure'].map(s=>`<button class="scenario-btn ${(state.scenario===s)?'active':''} ${(s==='Emergency Gate Closure')?'danger':''}" onclick="applyScenario('${s}')">${ico(s==='Crowd Surge'?'crowd':s==='Parking Full'?'parking':s==='Transport Failure'?'bus':s==='Heavy Rain'?'bell':s==='Event Finished'?'clock':s==='Emergency Gate Closure'?'bell':'grid')} ${s}</button>`).join('')}
function actionCard(a){return `<article class="panel action-card"><span class="priority">${a.priority} priority · ${a.status}</span><h3>${a.title}</h3><div class="loc">${a.location} · ${a.problem}</div><div class="impact-row"><div class="impact-box"><small>Before</small><b>${a.before}%</b></div><div class="impact-arrow">→</div><div class="impact-box"><small>After</small><b>${a.after}%</b></div></div><p class="action-copy"><b style="color:#c8d5da">Recommended:</b> ${a.action}<br><span style="color:#6f8491">${a.impact}</span></p><div class="action-buttons">${a.status==='Pending'?`<button class="btn small" onclick="simulateAction(${a.id})">Simulate</button><button class="btn small primary" onclick="approveAction(${a.id})">Approve</button><button class="btn small danger" onclick="dismissAction(${a.id})">Dismiss</button>`:`<span class="status ${a.status==='Approved'?'good':''}">${a.status}</span>`}</div></article>`}
function organizerPage(page){
  if(page==='command') return commandCenter();
  if(page==='map') return `${pageHeader('Spatial intelligence','Live Event Digital Twin','Explore live venue, gate, parking, transport and hospitality conditions on one interactive operating map.',`<button class="btn" onclick="applyScenario('Crowd Surge')">Trigger crowd surge</button>`)}<section class="panel map-panel"><div class="map-toolbar"><div class="map-title">${ico('map')}<div><b>Event District · Full View</b><small>Click any marker for capacity and prediction details</small></div></div><div class="map-tools"><button class="map-tool active">Heatmap</button><button class="map-tool active">Flow paths</button><button class="map-tool">Emergency</button></div></div>${digitalTwinMarkup(false)}</section>`;
  if(page==='crowd') return crowdPage();
  if(page==='actions') return `${pageHeader('EventFlow Intelligence','AI Action Center','Every recommendation shows the problem, prediction, proposed action and expected impact before approval.')}<div class="grid action-grid">${state.actions.map(actionCard).join('')}</div>`;
  if(page==='alerts') return `${pageHeader('Operations intelligence','Alert Center','Acknowledge, resolve and map operational pressure across the event ecosystem.')}<section class="panel"><div class="panel-head"><h3>Live alerts</h3><span>${state.alerts.filter(a=>a.status==='Open').length} open</span></div><div class="alert-feed" style="max-height:none">${alertsHTML()}</div></section>`;
  if(page==='simulation') return simulationPage();
  if(page==='analytics') return analyticsPage();
  if(page==='timeline') return timelinePage();
  if(page==='transport') return resourcePage('transport');
  if(page==='accommodation') return resourcePage('accommodation');
  if(page==='parking') return resourcePage('parking');
  if(page==='venues') return resourcePage('venues');
  if(page==='operators') return operatorsPage();
  return settingsPage();
}
function crowdPage(){
  const g=state.gates;return `${pageHeader('Predict before pressure becomes critical','Predictive Crowd Intelligence','Forecast current and future load by zone, calculate congestion probability and recommend a balancing action.')}
  <div class="grid four-col">${[['North Gate',g.north,state.crowdPrediction.north15,state.crowdPrediction.north30,state.crowdPrediction.probability],['East Gate',g.east,clamp(g.east+7,0,100),clamp(g.east+11,0,100),34],['South Gate',g.south,clamp(g.south+4,0,100),clamp(g.south+6,0,100),46],['West Gate',g.west,clamp(g.west+3,0,100),clamp(g.west+5,0,100),21]].map(x=>`<div class="panel stat-card"><small>${x[0]}</small><b style="color:${densityColor(x[1])}">${x[1]}%</b><span>Current density</span><div class="progress-list" style="margin-top:13px"><div class="progress-row"><label>+15 min</label><div class="progress-track"><i style="width:${x[2]}%"></i></div><b>${x[2]}%</b></div><div class="progress-row"><label>+30 min</label><div class="progress-track"><i style="width:${x[3]}%"></i></div><b>${x[3]}%</b></div><div class="progress-row"><label>Risk</label><div class="progress-track"><i style="width:${x[4]}%"></i></div><b>${x[4]}%</b></div></div></div>`).join('')}</div>
  <div class="grid two-col" style="margin-top:12px"><section class="panel"><div class="panel-head"><h3>North Gate forecast</h3><span>60-minute horizon</span></div><div class="chart"><canvas id="crowdChart"></canvas></div></section><section class="panel"><div class="panel-head"><h3>Recommended response</h3><span>${state.crowdPrediction.risk}/100 risk score</span></div><div class="panel-body"><div class="eyebrow">EventFlow Intelligence</div><h3 style="font:700 17px Manrope">${state.gates.north>=85?'North Gate may exceed safe capacity within 16 minutes.':'North Gate remains manageable, but pressure is rising.'}</h3><p class="muted" style="font-size:10px;line-height:1.6">${state.gates.north>=85?'Redirect 700 arriving attendees to East Gate, deploy three additional shuttles, and open Parking P4 overflow.':'Pre-stage two lanes at East Gate and keep shuttle capacity ready for the next arrival wave.'}</p><button class="btn primary" onclick="setPage('actions')">Review AI actions</button></div></section></div>`;
}
function simulationPage(){return `${pageHeader('What-if event simulator','Test a Scenario Before Acting','Change one condition and compare predicted crowd, travel time, congestion, safety risk and resource pressure.',`<button class="btn danger" onclick="resetDemo()">Reset baseline</button>`)}<section class="panel"><div class="panel-head"><h3>Scenario controls</h3><span>Live interconnected prototype</span></div><div class="scenario-strip" style="margin-top:0;border:0">${scenarioButtons()}</div></section><div class="grid two-col" style="margin-top:12px"><section class="panel"><div class="panel-head"><h3>Before action</h3><span>Current scenario: ${state.scenario}</span></div><div class="panel-body progress-list">${simMetrics(false)}</div></section><section class="panel"><div class="panel-head"><h3>After EventFlow response</h3><span>Recommended balancing</span></div><div class="panel-body progress-list">${simMetrics(true)}</div></section></div><section class="panel map-panel" style="margin-top:12px"><div class="map-toolbar"><div class="map-title">${ico('flask')}<div><b>Scenario impact map</b><small>Spatial response changes immediately with the selected condition</small></div></div></div>${digitalTwinMarkup(false)}</section>`}
function simMetrics(after){let factor=after?.78:1;let items=[['Crowd pressure',state.gates.north],['Travel time',state.scenario==='Crowd Surge'?88:62],['Congestion score',state.crowdPrediction.risk],['Safety risk',state.gates.north>=90?92:63],['Resource pressure',Math.max(state.occupancy.transport,state.occupancy.parking)]];return items.map(([l,v])=>{let x=after?Math.round(v*factor):v;return `<div class="progress-row"><label>${l}</label><div class="progress-track"><i style="width:${x}%"></i></div><b>${x}</b></div>`}).join('')}
function analyticsPage(){return `${pageHeader('Operations analytics','Event Intelligence Analytics','Understand crowd waves, capacity use and predicted-vs-actual performance across the event.')}
<div class="grid three-col">${[['Average travel time','18.4 min','↓ 3.8 min'],['Peak venue occupancy','88%','19:22'],['Alerts resolved','31','94% SLA']].map(x=>`<div class="panel stat-card"><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
<div class="grid two-col" style="margin-top:12px"><section class="panel"><div class="panel-head"><h3>Crowd by time</h3><span>Predicted vs actual</span></div><div class="chart"><canvas id="analyticsLine"></canvas></div></section><section class="panel"><div class="panel-head"><h3>Capacity utilization</h3><span>Current</span></div><div class="bar-chart">${[['Venue',state.occupancy.venue],['Transit',state.occupancy.transport],['Parking',state.occupancy.parking],['Hotels',state.occupancy.hotel],['N Gate',state.gates.north],['E Gate',state.gates.east]].map((x,i)=>`<div class="bar ${i%2?'violet':''}" style="height:${x[1]}%" title="${x[0]} ${x[1]}%"><span>${x[0]}</span></div>`).join('')}</div></section></div>`}
function timelinePage(){const steps=[['14:00','Gates Open'],['15:30','Opening Ceremony'],['17:00','Main Match'],['19:30','Concert'],['21:30','Event Finish'],['22:00','Crowd Dispersal']];return `${pageHeader('Event operations','Event Timeline','Schedule milestones are overlaid with expected arrival, venue, food-zone and exit crowd waves.')}<section class="panel"><div class="timeline">${steps.map((x,i)=>`<div class="time-step ${i===2?'active':i===4?'peak':''}"><b>${x[0]}</b><span>${x[1]}</span><div class="wave" style="opacity:${.35+i*.1}"></div></div>`).join('')}</div></section><div class="grid three-col" style="margin-top:12px">${[['Arrival peak','16:20–17:05','North + East gates'],['Food-zone peak','19:05–19:35','South concourse'],['Exit peak','21:38–22:20','Metro East + P2']].map(x=>`<div class="panel stat-card"><small>${x[0]}</small><b style="font-size:16px">${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>`}
function operatorsPage(){return `${pageHeader('Cross-stakeholder coordination','Connected Operators','Organizer-approved actions become assignments for transport, parking and hospitality providers.')}
<div class="grid resource-cards">${[['MetroLink Operations','Transport','18 vehicles active','98% response SLA'],['Unity Parking Services','Parking','4 zones connected','1,320 spaces free'],['CityStay Network','Hospitality','3 partner zones','418 rooms available']].map((x,i)=>`<div class="panel resource-card"><div class="resource-head"><div class="resource-icon">${ico(i===0?'bus':i===1?'parking':'hotel')}</div><span class="status good">Connected</span></div><h3>${x[0]}</h3><p>${x[1]} operator</p><div class="resource-stats"><div class="resource-stat"><small>Live state</small><b>${x[2]}</b></div><div class="resource-stat"><small>Coordination</small><b>${x[3]}</b></div></div></div>`).join('')}</div><section class="panel" style="margin-top:12px"><div class="panel-head"><h3>Shared task status</h3><span>Cross-role synchronized</span></div>${taskTable()}</section>`}
function resourcePage(type){
  const data={
    transport:{k:'Transport network',title:'Transport Coordination',desc:'Balance shuttles, buses and metro demand across arrival and exit waves.',icon:'bus',items:[['Metro East','Rail + shuttle','72% load','4 min headway'],['Shuttle S1','P4 → Arena','68% load','6 min'],['Shuttle S2','Hotel Zone A → Arena','61% load','8 min']]},
    accommodation:{k:'Hospitality capacity',title:'Accommodation Intelligence',desc:'Balance late-arrival demand across partner hotels and temporary event accommodation.',icon:'hotel',items:[['Hotel Central','Zone A','76% occupied','130 rooms free'],['Hotel Vista','Zone B','71% occupied','92% match'],['City Grand','Zone C','64% occupied','Metro access']]},
    parking:{k:'Vehicle capacity',title:'Parking Orchestration',desc:'Monitor occupancy, protect access roads and redirect arrivals before zones fill.',icon:'parking',items:[['Parking P1','North approach','68% occupied','480 free'],['Parking P2','West approach',state.occupancy.parking+'% occupied','324 free'],['Parking P4','Overflow','42% occupied','1,044 free']]},
    venues:{k:'Venue operations',title:'Venue Capacity',desc:'Track occupancy, gate pressure and internal zone load across event locations.',icon:'venue',items:[['Unity Arena','Main venue',state.occupancy.venue+'% occupied','42,860 inside'],['Hall 2','Expo zone','61% occupied','Stable'],['Concert Lawn','Evening zone','34% occupied','Peak at 19:30']]}
  }[type];
  return `${pageHeader(data.k,data.title,data.desc)}<div class="grid resource-cards">${data.items.map((x,i)=>`<div class="panel resource-card"><div class="resource-head"><div class="resource-icon">${ico(data.icon)}</div><span class="status ${i===1&&type==='parking'&&state.occupancy.parking>88?'bad':'good'}">Live</span></div><h3>${x[0]}</h3><p>${x[1]}</p><div class="resource-stats"><div class="resource-stat"><small>Utilization</small><b>${x[2]}</b></div><div class="resource-stat"><small>Operational note</small><b>${x[3]}</b></div></div></div>`).join('')}</div><section class="panel" style="margin-top:12px"><div class="panel-head"><h3>Demand outlook</h3><span>Next 60 minutes</span></div><div class="panel-body progress-list">${[['Now',65],['+15 min',74],['+30 min',82],['+60 min',68]].map(x=>`<div class="progress-row"><label>${x[0]}</label><div class="progress-track"><i style="width:${x[1]}%"></i></div><b>${x[1]}%</b></div>`).join('')}</div></section>`}
function settingsPage(){return `${pageHeader('Platform configuration','Settings','Demo-safe configuration for event intelligence, backend state and accessibility preferences.')}<div class="grid two-col"><section class="panel"><div class="panel-head"><h3>Backend connection</h3><span>${state.backend}</span></div><div class="panel-body"><div class="status ${state.backend==='connected'?'good':'warn'}">${state.backend==='connected'?'Supabase project reachable':'Demo fallback active'}</div><p class="muted" style="font-size:9px;line-height:1.6">The app is configured with the project URL and publishable browser key. Run the included SQL schema once to activate persistent EventFlow tables and role-linked records.</p><button class="btn" onclick="checkBackend().then(()=>toast('Connection checked',state.backend))">Re-check connection</button></div></section><section class="panel"><div class="panel-head"><h3>Demo controls</h3><span>Hackathon mode</span></div><div class="panel-body"><button class="btn danger" onclick="resetDemo()">Reset all simulated data</button><p class="muted" style="font-size:9px">Restores crowd, capacity, alerts, tasks and attendee routing to baseline.</p></div></section></div>`}

/* ---------- OPERATOR ---------- */
function operatorOverview(){return `${pageHeader('Connected operations','Operator Overview','Your operational slice of EventFlow: capacity, assignments, fleet state and demand—not organizer-only controls.',`<button class="btn primary" onclick="addCapacity()">${ico('plus')} Add capacity</button>`)}
<div class="grid kpi-grid">${kpi('Available capacity','486','Seats / rooms / spaces')}${kpi('Used capacity','72%','Across managed resources')}${kpi('Incoming demand','+214','Next 60 minutes','warn')}${kpi('Active routes','8','2 standby')}${kpi('Assignments',state.tasks.filter(t=>t.status!=='Completed').length,'From organizer')}${kpi('Forecast pressure','High','19:10–19:45','warn')}</div>
<div class="grid two-col" style="margin-top:12px"><section class="panel"><div class="panel-head"><h3>Assignments</h3><span>Shared with organizer</span></div><div class="alert-feed" style="max-height:none">${tasksHTML()}</div></section><section class="panel"><div class="panel-head"><h3>Demand forecast</h3><span>Next 3 hours</span></div><div class="panel-body progress-list">${[['Next 30 min',58],['Next 1 hr',76],['Next 2 hr',89],['Next 3 hr',64]].map(x=>`<div class="progress-row"><label>${x[0]}</label><div class="progress-track"><i style="width:${x[1]}%"></i></div><b>${x[1]}%</b></div>`).join('')}</div></section></div><section class="panel" style="margin-top:12px"><div class="panel-head"><h3>Fleet status</h3><span>Live vehicles</span></div>${fleetTable()}</section>`}
function tasksHTML(){return state.tasks.map(t=>`<div class="alert-row"><div class="alert-top"><span class="severity ${t.priority.toLowerCase()==='high'?'high':'medium'}">${t.priority}</span><span class="status ${t.status==='Completed'?'good':t.status==='In Progress'?'warn':''}">${t.status}</span></div><p><b style="color:#d6e0e4">${t.title}</b><br>${t.pickup} → ${t.destination} · capacity ${t.capacity}</p><div class="alert-actions">${t.status!=='Completed'?`<button class="mini-btn" onclick="updateTask(${t.id},'In Progress')">Accept / Start</button><button class="mini-btn" onclick="updateTask(${t.id},'Completed')">Complete</button>`:''}</div></div>`).join('')}
function taskTable(){return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Assignment</th><th>Operator route</th><th>Capacity</th><th>Status</th></tr></thead><tbody>${state.tasks.map(t=>`<tr><td>${t.title}</td><td>${t.pickup} → ${t.destination}</td><td>${t.capacity}</td><td><span class="status ${t.status==='Completed'?'good':t.status==='In Progress'?'warn':''}">${t.status}</span></td></tr>`).join('')}</tbody></table></div>`}
function fleetTable(){return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Vehicle</th><th>Route</th><th>Occupancy</th><th>Status</th><th>Next trip</th></tr></thead><tbody>${state.fleet.map(v=>`<tr><td>${v.id}</td><td>${v.route}</td><td>${v.occ}%</td><td><span class="status ${v.status==='Active'?'good':'warn'}">${v.status}</span></td><td>${v.next}</td></tr>`).join('')}</tbody></table></div>`}
function operatorPage(page){
  if(page==='overview')return operatorOverview();
  if(page==='assignments')return `${pageHeader('Organizer-linked workflow','Assignments','Approved organizer actions appear here as operational tasks.')}<section class="panel"><div class="alert-feed" style="max-height:none">${tasksHTML()}</div></section>`;
  if(page==='fleet')return `${pageHeader('Dynamic capacity sharing','Fleet & Capacity','Update available capacity so EventFlow can use it in future recommendations.',`<button class="btn primary" onclick="addCapacity()">Add standby shuttles</button>`)}<section class="panel">${fleetTable()}</section>`;
  if(page==='forecast')return `${pageHeader('Demand intelligence','Operator Demand Forecast','Prepare before demand reaches your resources.')}<div class="grid three-col">${[['Next 30 min','+38 guests','Moderate'],['Next 1 hr','+114 guests','High'],['Next 3 hr','+240 guests','High']].map(x=>`<div class="panel stat-card"><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]} pressure</span></div>`).join('')}</div><section class="panel" style="margin-top:12px"><div class="panel-head"><h3>Recommended preparation</h3><span>EventFlow Intelligence</span></div><div class="panel-body"><h3 style="font:700 16px Manrope">Reserve 40 rooms and move two standby shuttles closer to Metro East.</h3><p class="muted" style="font-size:9px;line-height:1.6">This keeps late-arrival accommodation and transport pressure below the projected peak.</p></div></section>`;
  if(page==='resources')return resourcePage('transport');
  if(page==='messages')return `${pageHeader('Coordination channel','Messages','Operational messages and requests from the EventFlow command center.')}<section class="panel"><div class="alert-feed" style="max-height:none">${tasksHTML()}${alertsHTML(3)}</div></section>`;
  if(page==='analytics')return analyticsPage();
  return settingsPage();
}

/* ---------- ATTENDEE ---------- */
function attendeeJourney(){return `${pageHeader('Personal event assistant','Your Event Journey','EventFlow converts city-scale crowd and capacity intelligence into a simple personal route.',`<select class="btn" onchange="toast('Language updated',this.value+' selected for attendee guidance')"><option>English</option><option>Hindi</option><option>Marathi</option></select>`)}
<div class="grid two-col"><section class="panel journey"><div class="eyebrow">Recommended journey</div><h3 style="font:700 18px Manrope;margin:8px 0 14px">Home → Unity Arena</h3>${[['home','Home','Depart 4:15 PM','0 min'],['bus','Metro Station A','Board East line','22 min'],['bus','Event Shuttle S4','Live arrival in 6 min','12 min'],['route',state.attendeeRoute,'Recommended entry','8 min'],['venue','Seat Section B','Main match','6 min']].map(x=>`<div class="journey-step"><div class="journey-dot">${ico(x[0])}</div><div><b>${x[1]}</b><small>${x[2]}</small></div><span>${x[3]}</span></div>`).join('')}</section><section class="panel"><div class="panel-head"><h3>Live Guidance</h3><span>Personalized</span></div><div class="panel-body"><span class="status ${state.attendeeRoute==='East Gate'?'warn':'good'}">Route intelligence active</span><h3 style="font:700 18px/1.4 Manrope">${state.attendeeMessage}</h3><p class="muted" style="font-size:9px;line-height:1.6">Based on simulated crowd density, gate capacity, shuttle availability and transport pressure.</p><button class="btn primary" onclick="toast('Recommended route active',state.attendeeRoute+' is now set as your journey route.')">Use recommended route</button></div></section></div>
<section class="panel" style="margin-top:12px"><div class="panel-head"><h3>Crowd-aware route options</h3><span>To Unity Arena</span></div><div class="panel-body grid route-grid"><div class="route-card"><small>Fastest</small><b>9 min</b><span>Gate A · higher crowd</span></div><div class="route-card"><small>Least crowded</small><b>12 min</b><span>South Gate</span></div><div class="route-card"><small>Accessible</small><b>14 min</b><span>East corridor</span></div><div class="route-card recommended"><small>EventFlow recommended</small><b>${state.attendeeRoute==='East Gate'?'8':'10'} min</b><span>${state.attendeeRoute}</span></div></div></section><section class="panel map-panel" style="margin-top:12px"><div class="map-toolbar"><div class="map-title">${ico('map')}<div><b>Your smart event map</b><small>Simplified personal guidance</small></div></div></div>${digitalTwinMarkup(true)}</section>`}
function attendeePage(page){
  if(page==='journey')return attendeeJourney();
  if(page==='map'||page==='navigation')return `${pageHeader('Crowd-aware navigation','Smart Event Map','A simplified live map that shows your current route, destination, transport, parking, food and medical areas.')}<section class="panel map-panel"><div class="map-toolbar"><div class="map-title">${ico('route')}<div><b>${state.attendeeRoute} route</b><small>${state.attendeeRoute==='East Gate'?'12 minutes saved · 54% lower crowd density':'Current journey operating normally'}</small></div></div></div>${digitalTwinMarkup(true)}</section>`;
  if(page==='alerts')return `${pageHeader('Personalized alerts','Your Event Alerts','Only messages that affect your own journey, transport, gate or event timing.')}<section class="panel"><div class="alert-feed" style="max-height:none"><div class="alert-row"><div class="alert-top"><span class="severity info">route</span><small>now</small></div><p>${state.attendeeMessage}</p></div><div class="alert-row"><div class="alert-top"><span class="severity info">shuttle</span><small>2 min ago</small></div><p>Your Shuttle S4 will arrive in approximately 6 minutes.</p></div><div class="alert-row"><div class="alert-top"><span class="severity medium">parking</span><small>4 min ago</small></div><p>Parking P2 is busy. P4 currently has more than 1,000 available spaces.</p></div></div></section>`;
  if(page==='accommodation')return `${pageHeader('Stay intelligence','Accommodation Recommendations','Recommendations consider price, distance, live availability, nearby transport and crowd pressure.')}<div class="grid resource-cards">${[['Hotel Vista','92% Match','₹3,200 / night','2.4 km · shuttle available'],['City Grand','86% Match','₹2,850 / night','3.1 km · metro nearby'],['Event Hostel','81% Match','₹1,450 / night','1.8 km · shared shuttle']].map(x=>`<div class="panel resource-card"><span class="status good">${x[1]}</span><h3>${x[0]}</h3><p>${x[3]}</p><div class="resource-stats"><div class="resource-stat"><small>Price</small><b>${x[2]}</b></div><div class="resource-stat"><small>Congestion</small><b>Low</b></div></div><button class="btn small" style="margin-top:11px" onclick="toast('Journey preview','Route to ${x[0]} opened in demo mode.')">View journey</button></div>`).join('')}</div>`;
  if(page==='transport')return resourcePage('transport');
  if(page==='parking')return resourcePage('parking');
  if(page==='event')return timelinePage();
  return `${pageHeader('Attendee profile','Profile','Manage your event preferences, accessibility needs and travel mode.')}<div class="grid two-col"><section class="panel"><div class="panel-body form-grid"><div class="field"><label>Name</label><input value="Demo Attendee"/></div><div class="field"><label>Travel mode</label><select><option>Metro + Shuttle</option><option>Car</option><option>Taxi</option></select></div><div class="field"><label>Accessibility</label><select><option>None</option><option>Step-free route</option><option>Assisted entry</option></select></div><button class="btn primary" onclick="toast('Profile saved','Attendee preferences updated locally.')">Save preferences</button></div></section></div>`;
}

/* ---------- INTERACTIONS ---------- */
function applyScenario(s){
  state.scenario=s;
  if(s==='Normal Traffic'){
    state.gates={north:74,east:45,south:61,west:38};state.occupancy={venue:79,hotel:76,parking:82,transport:72};state.crowdPrediction={north15:82,north30:91,north60:78,probability:86,risk:84};state.score=87;state.attendeeRoute='North Gate';state.attendeeMessage='Your current route is clear. North Gate is operating within planned capacity.';
  } else if(s==='Crowd Surge'){
    state.gates.north=92;state.gates.east=47;state.incoming=14820;state.occupancy.transport=84;state.crowdPrediction={north15:98,north30:100,north60:91,probability:96,risk:94};state.score=72;state.attendeeRoute='East Gate';state.attendeeMessage='North Gate congestion detected. EventFlow has redirected your journey through East Gate.';
    ensureAlert('critical','North Gate crowd surge','North Gate is predicted to exceed safe capacity in 16 minutes.');
    ensureSurgeActions();
  } else if(s==='Parking Full'){
    state.occupancy.parking=96;state.score=79;ensureAlert('critical','Parking P2 saturation','Parking P2 has reached 96% occupancy. Redirect incoming vehicles to P4.');
  } else if(s==='Transport Failure'){
    state.occupancy.transport=94;state.score=74;ensureAlert('critical','Shuttle Route S2 unavailable','Transport capacity dropped below forecast demand. Deploy standby vehicles.');
  } else if(s==='Heavy Rain'){
    state.score=76;state.occupancy.transport=88;ensureAlert('high','Heavy rainfall response','Outdoor pedestrian demand is shifting toward covered shuttle corridors.');
  } else if(s==='Event Finished'){
    state.exiting=18120;state.incoming=420;state.occupancy.venue=62;state.score=83;state.attendeeMessage='Exit balancing is active. Section C should use Gate 4 after a short staggered hold.';ensureAlert('medium','Crowd dispersal active','EventFlow is staggering exits across Metro East, parking and shuttle zones.');
  } else if(s==='Emergency Gate Closure'){
    state.gates.north=100;state.score=64;state.attendeeRoute='East Gate';state.attendeeMessage='North Gate is unavailable. Follow EventFlow guidance to East Gate and the marked safe corridor.';ensureAlert('critical','North Gate closure','Emergency demonstration mode: North Gate closed. Alternative movement corridors activated.');
  }
  save();renderContent();toast('Scenario activated',`${s}: the connected event state has been updated.`);
}
function ensureAlert(severity,title,detail){if(!state.alerts.some(a=>a.title===title&&a.status==='Open'))state.alerts.unshift({id:Date.now(),severity,title,detail,time:'now',status:'Open'});}
function ensureSurgeActions(){
  const titles=state.actions.map(a=>a.title);
  const adds=[
    {id:201,priority:'high',title:'Redirect 700 attendees',location:'North → East Gate',problem:'North Gate will exceed safe capacity in 16 min.',before:98,after:71,unit:'% density',action:'Route 700 arrivals to East Gate using attendee advisories and approach signage.',impact:'North Gate predicted load falls to 71%; East Gate rises to 63%.',status:'Pending'},
    {id:202,priority:'high',title:'Deploy 3 additional shuttles',location:'Parking P4 → East Gate',problem:'Rerouted arrivals increase East Gate transport demand.',before:94,after:73,unit:'% load',action:'Assign three standby shuttles with 180-seat combined capacity.',impact:'Keeps East corridor wait time below 9 minutes.',status:'Pending'},
    {id:203,priority:'high',title:'Open Parking P4 overflow',location:'Parking P4',problem:'Incoming vehicle wave will overload P2 approach.',before:96,after:68,unit:'% P2 load',action:'Open P4 and redirect 420 vehicles before the west approach saturates.',impact:'Reduces approach-road queue and protects emergency access.',status:'Pending'}
  ];adds.forEach(a=>{if(!titles.includes(a.title))state.actions.unshift(a)})
}
function ackAlert(id){const a=state.alerts.find(x=>x.id===id);if(a)a.status='Acknowledged';save();renderContent();toast('Alert acknowledged','The operations feed has been updated.');}
function dismissAction(id){const a=state.actions.find(x=>x.id===id);if(a)a.status='Dismissed';save();renderContent();toast('Recommendation dismissed','No cross-role action was created.');}
function simulateAction(id){const a=state.actions.find(x=>x.id===id);if(!a)return;openModal('Impact Simulation',`<div class="eyebrow">${a.location}</div><h3 style="font:700 18px Manrope">${a.title}</h3><p class="muted" style="font-size:9px;line-height:1.6">${a.impact}</p><div class="impact-row"><div class="impact-box"><small>Before</small><b>${a.before}%</b></div><div class="impact-arrow">→</div><div class="impact-box"><small>After</small><b>${a.after}%</b></div></div><button class="btn primary" style="width:100%" onclick="closeModal();approveAction(${a.id})">Approve simulated action</button>`)}
async function approveAction(id){
  const a=state.actions.find(x=>x.id===id);if(!a)return;a.status='Approved';
  if(a.title.includes('Redirect')){state.gates.north=71;state.gates.east=63;state.attendeeRoute='East Gate';state.attendeeMessage='North Gate congestion detected. EventFlow has redirected your journey through East Gate.';state.score=clamp(state.score+7,0,100)}
  if(a.title.includes('shuttle')){if(!state.tasks.some(t=>t.title.includes('Deploy three additional buses')))state.tasks.unshift({id:Date.now(),title:'Deploy three additional buses',priority:'High',pickup:'Parking P4',destination:'East Gate',capacity:180,status:'Assigned',requested:nowTime()});state.occupancy.transport=clamp(state.occupancy.transport-5,0,100)}
  if(a.title.includes('Parking P4'))state.occupancy.parking=68;
  save();renderContent();toast('Action approved','Operator and attendee experiences have been updated.');
  if(state.account.provider==='supabase')syncActionToBackend(a);
}
async function syncActionToBackend(a){
  try{
    if(a.title.includes('shuttle')) await SB.insert('operator_tasks',{event_id:cfg.DEMO_EVENT_ID,title:'Deploy three additional buses',priority:'high',pickup:'Parking P4',destination:'East Gate',required_capacity:180,status:'assigned'});
    await SB.insert('alerts',{event_id:cfg.DEMO_EVENT_ID,severity:'info',title:'Organizer action approved',detail:a.title,status:'open'});
  }catch(e){console.warn('Supabase table sync skipped:',e.message);}
}
async function updateTask(id,status){
  const t=state.tasks.find(x=>x.id===id);if(!t)return;t.status=status;
  if(status==='In Progress'){state.attendeeMessage='Additional shuttle deployment is in progress. EventFlow is reducing your expected wait time.';state.occupancy.transport=clamp(state.occupancy.transport-3,0,100);toast('Assignment accepted','Organizer command center now shows deployment in progress.');}
  if(status==='Completed'){state.attendeeMessage='Additional shuttle capacity is now available near Parking P4 and East Gate.';state.occupancy.transport=clamp(state.occupancy.transport-7,0,100);state.score=clamp(state.score+4,0,100);toast('Task completed','Organizer and attendee guidance are updated.');}
  save();renderContent();
  if(state.account.provider==='supabase'){try{await SB.update('operator_tasks',{status:status.toLowerCase().replace(' ','_')},{id});}catch(e){console.warn(e.message)}}
}
function addCapacity(){state.occupancy.transport=clamp(state.occupancy.transport-7,0,100);state.fleet.push({id:'SH-'+(120+state.fleet.length),route:'Metro East → Arena',occ:0,status:'Standby',next:'8 min'});save();renderContent();toast('Capacity shared','Two equivalent standby units added to EventFlow recommendations.');}
function resetDemo(){const keep={logged:state.logged,role:state.role,page:defaultPage(state.role),backend:state.backend,account:state.account};state=structuredClone(baseState);Object.assign(state,keep);save();closeModal();renderApp();toast('Demo reset','Baseline event conditions restored.');}
async function hydrateFromSupabase(){
  if(state.account.provider!=='supabase')return;
  try{
    const tasks=await SB.select('operator_tasks',`select=*&event_id=eq.${encodeURIComponent(cfg.DEMO_EVENT_ID)}&order=created_at.desc&limit=10`);
    if(Array.isArray(tasks)&&tasks.length){state.tasks=tasks.map(t=>({id:t.id,title:t.title,priority:(t.priority||'medium').replace(/^./,c=>c.toUpperCase()),pickup:t.pickup||'—',destination:t.destination||'—',capacity:t.required_capacity||0,status:(t.status||'assigned').replace('_',' ').replace(/^./,c=>c.toUpperCase()),requested:t.created_at?new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'now'}));save();renderContent()}
  }catch(e){console.warn('EventFlow tables not yet installed:',e.message)}
}

/* ---------- MODALS / SEARCH ---------- */
function openModal(title,body){document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="genericModal" onclick="if(event.target===this)this.remove()"><div class="modal-card"><div class="modal-head"><b>${title}</b><button class="modal-close" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div></div></div>`)}
function closeModal(){$('#genericModal')?.remove()}
function openPalette(){
  const cmds=state.role==='organizer'?[['Live Map','map','map'],['Critical Alerts','alerts','bell'],['Crowd Intelligence','crowd','crowd'],['AI Actions','actions','spark'],['What-if Simulator','simulation','flask'],['Transport','transport','bus']]:state.role==='operator'?[['Assignments','assignments','check'],['Fleet & Capacity','fleet','bus'],['Demand Forecast','forecast','chart']]:[['My Journey','journey','route'],['Live Map','map','map'],['Navigation','navigation','route'],['Alerts','alerts','bell']];
  openModal('Command Palette',`<div class="command-list">${cmds.map(([l,p,i])=>`<button class="command-btn" onclick="closeModal();setPage('${p}')">${ico(i)} ${l}</button>`).join('')}</div>`);
}
function openNotifications(){openModal('Notification Center',`<div class="alert-feed" style="max-height:none">${state.role==='attendee'?`<div class="alert-row"><span class="severity info">journey</span><p>${state.attendeeMessage}</p></div>`:alertsHTML(5)}</div>`)}
function openDailyBrief(){openModal('EventFlow Intelligence Brief',`<div class="eyebrow">Today · ${state.event.name}</div><h3 style="font:700 19px/1.35 Manrope">58,420 expected visitors. Highest pressure window: 18:30–19:20.</h3><div class="grid two-col" style="margin-top:12px"><div class="impact-box"><small>Highest risk zone</small><b>North Gate</b></div><div class="impact-box"><small>Parking peak</small><b>87%</b></div></div><p class="muted" style="font-size:9px;line-height:1.65">Preparation: deploy five additional shuttle vehicles, reserve Parking P4 for late arrivals, pre-stage East Gate lanes and keep accommodation overflow available in Zone B.</p>`)}

/* ---------- CHARTS ---------- */
function drawLineCanvas(id,data,data2){
  const canvas=$('#'+id);if(!canvas)return;const dpr=window.devicePixelRatio||1;const rect=canvas.getBoundingClientRect();canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const w=rect.width,h=rect.height,p=18;c.clearRect(0,0,w,h);c.strokeStyle='#1b2a35';c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(p,p+(h-2*p)*i/5);c.lineTo(w-p,p+(h-2*p)*i/5);c.stroke()}
  const draw=(arr,color,dash=[])=>{c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dash);c.beginPath();arr.forEach((v,i)=>{const x=p+i*(w-2*p)/(arr.length-1),y=h-p-(v/100)*(h-2*p);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();c.setLineDash([])};draw(data,'#53d9d0');if(data2)draw(data2,'#9c8cff',[5,5]);
}
function drawCharts(){if(state.page==='crowd')drawLineCanvas('crowdChart',[state.gates.north,state.crowdPrediction.north15,state.crowdPrediction.north30,state.crowdPrediction.north60,72]);if(state.page==='analytics')drawLineCanvas('analyticsLine',[42,51,65,78,89,82,70,58],[39,48,62,75,86,80,68,57]);}

/* ---------- RENDER ---------- */
function renderContent(){
  const c=$('#content');if(!c)return;
  c.innerHTML=state.role==='organizer'?organizerPage(state.page):state.role==='operator'?operatorPage(state.page):attendeePage(state.page);
  requestAnimationFrame(()=>{
    drawCharts();
    if(document.getElementById('eventMap') && window.EventFlowFreeMap){
      EventFlowFreeMap.mount({role:state.role,gateLoad:{...state.gates},venueLoad:state.occupancy.venue,recommendedGate:state.attendeeRoute});
    }
  });
}
window.EventFlowState=()=>state;
function renderApp(){
  const app=$('#app');app.innerHTML=state.logged?shell():landing();if(state.logged){renderContent();renderTopStatus()}
}

/* Live simulation */
setInterval(()=>{
  if(!state.logged)return;
  if(state.scenario==='Normal Traffic'){
    state.inside=clamp(state.inside+Math.round((Math.random()-.45)*80),0,state.attendees);
    state.incoming=clamp(state.incoming+Math.round((Math.random()-.5)*90),0,16000);
    state.gates.north=clamp(state.gates.north+Math.round((Math.random()-.5)*2),69,78);
    state.gates.east=clamp(state.gates.east+Math.round((Math.random()-.5)*2),40,52);
  } else if(state.scenario==='Crowd Surge' && state.actions.some(a=>a.title==='Redirect 700 attendees'&&a.status!=='Approved')){
    state.gates.north=clamp(state.gates.north+1,90,98);
  }
  save();const lu=$('#lastUpdated');if(lu)lu.textContent='JUST NOW';
  if(state.page==='command'&&state.role==='organizer')renderContent();
},7000);

document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(state.logged)openPalette()}});
window.addEventListener('resize',()=>requestAnimationFrame(drawCharts));

const checkinMode=new URLSearchParams(location.search).get('checkin')==='1';
if(checkinMode){
  authRole='attendee';
  if(state.logged){state.role='attendee';state.page='map';save();}
}
renderApp();
if(checkinMode){
  setTimeout(()=>{
    if(!state.logged){
      openAuth('login');
      toast('Attendee GPS check-in','Sign in or create an attendee account, then allow live location. Demo login can preview the UI but does not upload GPS to Supabase.');
    } else {
      toast('GPS check-in ready','Tap Share live GPS and allow location permission. Your signal will join the anonymous crowd layer when a Supabase session is active.');
    }
  },350);
}
checkBackend();

const APP_KEY = 'eventflow-white-premium-v1';
const CHANNEL_NAME = 'eventflow-live-ops';
const bc = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;

const demoEvents = [
  { id:'EVT-MUM-CRK-0912', title:'India vs Pakistan — Night Match', type:'Cricket', venue:'Harbour Arena, Mumbai', date:'2026-09-12', start:'18:30', end:'23:15', status:'upcoming', attendance:58420, gates:'4 gates', phase:'Entry planning', color:'coral' },
  { id:'EVT-MUM-MUS-0909', title:'City Music Night', type:'Concert', venue:'Central Grounds, Mumbai', date:'2026-09-09', start:'18:00', end:'23:30', status:'live', attendance:21480, gates:'3 gates', phase:'Main performance', color:'violet' },
  { id:'EVT-MUM-TEC-0911', title:'Future Tech Expo', type:'Expo', venue:'Innovation Hall, Mumbai', date:'2026-09-11', start:'10:00', end:'19:00', status:'upcoming', attendance:8700, gates:'2 gates', phase:'Setup', color:'green' },
  { id:'EVT-MUM-FOD-0909', title:'City Food Festival', type:'Festival', venue:'Riverfront District, Mumbai', date:'2026-09-09', start:'12:00', end:'22:00', status:'live', attendance:12940, gates:'4 gates', phase:'Dinner peak', color:'amber' },
  { id:'EVT-MUM-CON-0907', title:'Creators Conference 2026', type:'Conference', venue:'Grand Convention Centre', date:'2026-09-07', start:'09:00', end:'18:00', status:'completed', attendance:5320, gates:'2 gates', phase:'Completed', color:'green' }
];

const defaultLiveState = {
  gates: {
    east:{name:'East Gate', open:true, crowd:38, wait:4, operator:'Aarav Shah'},
    north:{name:'North Gate', open:true, crowd:92, wait:18, operator:'Riya Menon'},
    south:{name:'South Gate', open:true, crowd:61, wait:9, operator:'Kabir Jain'},
    west:{name:'West Gate', open:false, crowd:18, wait:0, operator:'Meera Rao'}
  },
  parking: [
    {id:'P1', name:'Parking P1', vehicle:'car', total:1400, free:1015, walk:'7 min', road:'Arena Link Road', note:'Best choice right now', lat:18.9369, lng:72.8238},
    {id:'P2', name:'Parking P2', vehicle:'car', total:900, free:0, walk:'11 min', road:'Marine Service Road', note:'Full', lat:18.9410, lng:72.8242},
    {id:'B1', name:'Bike Parking B1', vehicle:'bike', total:420, free:220, walk:'5 min', road:'East Service Lane', note:'Two-wheeler only', lat:18.9386, lng:72.8291}
  ],
  food:[
    {id:'food-pizza',name:'Pizza Station', category:'Pizza', open:true, wait:6, zone:'East Food Street', operator:'Vendor East', price:'₹180–₹420', lat:18.9397,lng:72.8285},
    {id:'food-veg',name:'Fresh Bowl', category:'Veg meals', open:true, wait:2, zone:'South Concourse', operator:'GreenServe', price:'₹140–₹280', lat:18.9368,lng:72.8267},
    {id:'food-drinks',name:'Drinks & Water Bar', category:'Beverages', open:true, wait:4, zone:'Gate 3 Plaza', operator:'Hydrate Team', price:'₹40–₹180', lat:18.9380,lng:72.8294},
    {id:'food-dessert',name:'Dessert Corner', category:'Desserts', open:true, wait:11, zone:'North Walk', operator:'Sweet Co.', price:'₹120–₹300', lat:18.9410,lng:72.8264}
  ],
  stays:[
    {id:'stay-1',name:'Harbour Stay',price:'₹3,200/night',rooms:18,distance:'1.8 km',shuttle:'Every 20 min',phone:'Demo: +91 90000 10001'},
    {id:'stay-2',name:'City Grand',price:'₹4,600/night',rooms:7,distance:'2.4 km',shuttle:'On request',phone:'Demo: +91 90000 10002'},
    {id:'stay-3',name:'Event Lodge',price:'₹2,200/night',rooms:34,distance:'3.1 km',shuttle:'Every 30 min',phone:'Demo: +91 90000 10003'}
  ],
  transit:{metro:{name:'Metro Central',status:'Running',last:'00:10',crowd:'Medium'},shuttle:{name:'Event Shuttle S4',status:'Running',next:'6 min'},taxi:{name:'Taxi Zone T2',status:'Available'}},
  operators:[
    {id:'op-1',name:'Aarav Shah',area:'East Gate',status:'Working'},
    {id:'op-2',name:'Riya Menon',area:'North Gate',status:'Working'},
    {id:'op-3',name:'Kabir Jain',area:'Parking P1',status:'Available'},
    {id:'op-4',name:'Meera Rao',area:'Food Street',status:'Working'}
  ],
  tasks:[
    {id:'T-101',title:'Open one extra entry line',category:'Gate',where:'North Gate',why:'Crowd is above 90%',by:'Within 8 min',need:'2 security staff + 1 scanner',steps:['Open lane N4','Move barrier 2 metres','Start ticket scan','Update wait time'],status:'new',assignee:'Riya Menon'},
    {id:'T-102',title:'Clean spill near Food Street',category:'Cleaning',where:'East Food Street',why:'Guest reported slippery floor',by:'Within 6 min',need:'Cleaning kit + wet floor sign',steps:['Place warning sign','Clean spill','Dry area','Mark task done'],status:'new',assignee:'Meera Rao'},
    {id:'T-103',title:'Free 120 parking spaces',category:'Parking',where:'Parking P1',why:'P2 is full',by:'Within 15 min',need:'Parking team + lane cones',steps:['Open overflow row C','Guide incoming cars','Update free count'],status:'working',assignee:'Kabir Jain'},
    {id:'T-104',title:'Check light near Gate 3',category:'Lighting',where:'Gate 3 Plaza',why:'Low light reported',by:'Within 20 min',need:'Electrical kit',steps:['Check panel L3','Replace faulty light','Confirm brightness'],status:'new',assignee:'Aarav Shah'},
    {id:'T-105',title:'Support medical desk queue',category:'Health',where:'Medical Point M1',why:'Queue is increasing',by:'Within 10 min',need:'1 helper + water',steps:['Add helper','Separate minor cases','Update queue'],status:'new',assignee:'Meera Rao'}
  ],
  activity:[
    {icon:'🚪',text:'East Gate opened extra lane',time:'2 min ago'},
    {icon:'🅿️',text:'P1 reports 1,015 car spaces free',time:'4 min ago'},
    {icon:'🍕',text:'Pizza Station wait changed to 6 min',time:'6 min ago'},
    {icon:'🧹',text:'Cleaning request created near Food Street',time:'8 min ago'}
  ]
};

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
let state = loadState();
let currentMap = null;
let currentRouteData = null;
let authMode = 'login';
let selectedRole = 'attendee';
let currentNav = 'events';
let selectedEventId = state.selectedEventId || 'EVT-MUM-MUS-0909';

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(APP_KEY)||'{}');
    return {users:saved.users||[],session:saved.session||null,selectedEventId:saved.selectedEventId||null,live:saved.live||structuredClone(defaultLiveState),ticket:saved.ticket||null,notifications:saved.notifications||[
      {text:'East Gate is the fastest entry right now.',time:'Now'},
      {text:'Parking P1 has 1,015 car spaces free.',time:'2 min ago'},
      {text:'Pizza Station wait is 6 minutes.',time:'4 min ago'}
    ]};
  }catch{return {users:[],session:null,selectedEventId:null,live:structuredClone(defaultLiveState),ticket:null,notifications:[]}}
}
function saveState(){ localStorage.setItem(APP_KEY,JSON.stringify(state)); bc?.postMessage({type:'sync'}); }
window.addEventListener('storage',e=>{if(e.key===APP_KEY){state=loadState();if(state.session) renderShell();}});
bc?.addEventListener('message',()=>{state=loadState();if(state.session) renderShell();});

function eventStatus(e){
  const now = new Date();
  const start = new Date(`${e.date}T${e.start}:00`); const end = new Date(`${e.date}T${e.end}:00`);
  if(now<start) return 'upcoming'; if(now>end) return 'completed'; return 'live';
}
function statusLabel(status){return status==='live'?'LIVE':status==='upcoming'?'UPCOMING':'COMPLETED'}
function statusClass(status){return status==='live'?'success':status==='upcoming'?'violet':''}
function formatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
function initials(name='Demo User'){return name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function renderLanding(){
  cleanupMap(); state.session=null; saveState(); app.innerHTML=''; app.append(document.getElementById('landing-template').content.cloneNode(true));
  document.getElementById('landing-events').innerHTML=demoEvents.slice(0,4).map(eventCardHTML).join('');
  bindCommon();
}
function eventCardHTML(e){const s=eventStatus(e);return `<article class="event-card"><div class="event-card-top"><div><span class="status ${statusClass(s)}">${statusLabel(s)}</span><h3>${esc(e.title)}</h3><p>${esc(e.venue)}</p></div><span class="chip ${e.color==='coral'?'coral':e.color==='violet'?'violet':'green'}">${esc(e.type)}</span></div><div class="event-meta"><div><span>Date</span><b>${formatDate(e.date)}</b></div><div><span>Time</span><b>${e.start}–${e.end}</b></div><div><span>Guests</span><b>${e.attendance.toLocaleString('en-IN')}</b></div><div><span>Now</span><b>${esc(e.phase)}</b></div></div><button class="btn soft" data-action="event-demo" data-event="${e.id}">Explore event</button></article>`}

function renderAuth(mode='login'){
  cleanupMap(); authMode=mode; app.innerHTML=''; app.append(document.getElementById('auth-template').content.cloneNode(true));
  const isReg=mode==='register';
  document.getElementById('auth-title').textContent=isReg?'Create your EventFlow account.':'Welcome back.';
  document.getElementById('auth-subtitle').textContent=isReg?'Choose your role. Everything runs locally in this browser.':'Sign in and continue to your event space.';
  document.getElementById('name-field').closest('label').style.display=isReg?'block':'none';
  document.getElementById('auth-submit').textContent=isReg?'Create account':'Sign in';
  document.getElementById('auth-switch-copy').innerHTML=isReg?`Already have an account? <button type="button" data-action="open-login">Sign in</button>`:`New here? <button type="button" data-action="open-register">Create account</button>`;
  const roles=[['attendee','Attendee'],['operator','Operator'],['management','Management']];
  document.getElementById('role-picker').innerHTML=roles.map(([id,l])=>`<button type="button" class="role-btn ${id===selectedRole?'active':''}" data-role="${id}">${l}</button>`).join('');
  document.querySelectorAll('.role-btn').forEach(b=>b.onclick=()=>{selectedRole=b.dataset.role;document.querySelectorAll('.role-btn').forEach(x=>x.classList.toggle('active',x===b));});
  document.getElementById('auth-form').onsubmit=handleAuth;
  bindCommon();
}
function handleAuth(e){
  e.preventDefault(); const email=document.getElementById('email-field').value.trim().toLowerCase(); const pass=document.getElementById('password-field').value; const name=document.getElementById('name-field').value.trim()||'EventFlow User'; const msg=document.getElementById('auth-message');
  if(pass.length<4){msg.textContent='Use at least 4 characters for the password.';return}
  if(authMode==='register'){
    if(state.users.some(u=>u.email===email&&u.role===selectedRole)){msg.textContent='This account already exists for this role.';return}
    state.users.push({name,email,password:pass,role:selectedRole}); state.session={name,email,role:selectedRole}; saveState(); renderShell();
  }else{
    const user=state.users.find(u=>u.email===email&&u.password===pass&&u.role===selectedRole);
    if(!user){msg.textContent='Account not found. Use demo account or create one.';return}
    state.session={name:user.name,email:user.email,role:user.role}; saveState(); renderShell();
  }
}
function demoLogin(){
  const demos={attendee:['Demo Attendee','attendee@eventflow.demo'],operator:['Demo Operator','operator@eventflow.demo'],management:['Event Manager','manager@eventflow.demo']};
  state.session={name:demos[selectedRole][0],email:demos[selectedRole][1],role:selectedRole}; saveState(); renderShell();
}

const navs={
  attendee:[['events','Events'],['journey','My Journey'],['services','Food & Help'],['parking','Parking'],['stay','Stay'],['map','Navigation']],
  operator:[['events','Events'],['tasks','My Tasks'],['services','Live Services'],['map','Work Map'],['activity','Updates']],
  management:[['events','All Events'],['control','Live Control'],['guests','Guest Journey'],['services','Food & Services'],['parking','Parking & Travel'],['teams','Teams & Jobs'],['map','Live Map']]
};
function renderShell(){
  if(!state.session){renderLanding();return} cleanupMap(); app.innerHTML=''; app.append(document.getElementById('shell-template').content.cloneNode(true));
  const role=state.session.role; document.getElementById('sidebar-role').textContent=role==='management'?'Management':role[0].toUpperCase()+role.slice(1);
  document.getElementById('profile-name').textContent=state.session.name;document.getElementById('profile-email').textContent=state.session.email;document.getElementById('profile-avatar').textContent=initials(state.session.name);
  document.getElementById('sidebar-nav').innerHTML=navs[role].map(([id,label],i)=>`<button class="nav-btn ${currentNav===id||(!currentNav&&i===0)?'active':''}" data-nav="${id}"><span class="nav-label">${label}</span><span>${navIcon(id)}</span></button>`).join('');
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{currentNav=b.dataset.nav;renderView();});
  bindCommon(); startClock(); renderView();
}
function navIcon(id){return ({events:'◉',journey:'↗',services:'◌',parking:'P',stay:'⌂',map:'⌖',tasks:'✓',activity:'↻',control:'◇',guests:'◎',teams:'▦'}[id]||'•')}
function startClock(){const el=document.getElementById('live-clock');const tick=()=>{if(el)el.textContent=new Date().toLocaleString('en-IN',{weekday:'short',hour:'2-digit',minute:'2-digit'})};tick();setInterval(tick,30000)}

function renderView(){
  cleanupMap(); const role=state.session.role; const titles={events:['EVENTFLOW','Events'],journey:['ATTENDEE','My Journey'],services:['LIVE SERVICES','Food & Help'],parking:['TRAVEL','Parking'],stay:['STAY','Stay'],map:['NAVIGATION','Live Map'],tasks:['OPERATOR','My Tasks'],activity:['LIVE UPDATES','Updates'],control:['MANAGEMENT','Live Control'],guests:['GUEST EXPERIENCE','Guest Journey'],teams:['OPERATIONS','Teams & Jobs']};
  document.getElementById('page-kicker').textContent=titles[currentNav]?.[0]||'EVENTFLOW';document.getElementById('page-title').textContent=titles[currentNav]?.[1]||'Events';document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===currentNav));
  if(currentNav==='events') return renderEventHub(); if(role==='attendee') return renderAttendeeView(currentNav); if(role==='operator') return renderOperatorView(currentNav); return renderManagementView(currentNav);
}
function renderEventHub(filter='all'){
  const root=document.getElementById('view-root'); const statusCounts={live:0,upcoming:0,completed:0}; demoEvents.forEach(e=>statusCounts[eventStatus(e)]++); const filtered=filter==='all'?demoEvents:demoEvents.filter(e=>eventStatus(e)===filter);
  root.innerHTML=`<div class="hub-top"><div class="hub-title"><span class="page-kicker">YOUR EVENT SPACE</span><h2>${state.session.role==='attendee'?'Choose your event.':'Events you can access.'}</h2><p>${state.session.role==='attendee'?'See what is live now, what is coming next and where you need to go.':'Open one event to see its live operations.'}</p></div><div class="filter-row">${[['all','All'],['live',`Live ${statusCounts.live}`],['upcoming',`Upcoming ${statusCounts.upcoming}`],['completed',`Completed ${statusCounts.completed}`]].map(([id,l])=>`<button class="filter-btn ${filter===id?'active':''}" data-filter="${id}">${l}</button>`).join('')}</div></div><div class="event-list">${filtered.map(eventRowHTML).join('')}</div>`;
  root.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>renderEventHub(b.dataset.filter)); root.querySelectorAll('[data-open-event]').forEach(b=>b.onclick=()=>openEvent(b.dataset.openEvent));
}
function eventRowHTML(e){const s=eventStatus(e);return `<article class="event-row"><div><span class="status ${statusClass(s)}">${statusLabel(s)}</span><h3>${esc(e.title)}</h3><p>${esc(e.venue)} • ID ${e.id}</p></div><div class="event-cell"><span>Date</span><b>${formatDate(e.date)}</b></div><div class="event-cell"><span>Time</span><b>${e.start}–${e.end}</b></div><div class="event-cell"><span>Current</span><b>${esc(e.phase)}</b></div><button class="btn ${s==='live'?'accent':'soft'}" data-open-event="${e.id}">${state.session.role==='attendee'?'Open event':'Open control'}</button></article>`}
function openEvent(id){selectedEventId=id;state.selectedEventId=id;saveState();currentNav=state.session.role==='attendee'?'journey':state.session.role==='operator'?'tasks':'control';renderShell()}
function selectedEvent(){return demoEvents.find(e=>e.id===selectedEventId)||demoEvents[1]}

function renderAttendeeView(view){
  if(view==='journey') return renderAttendeeJourney(); if(view==='services') return renderAttendeeServices(); if(view==='parking') return renderParking('attendee'); if(view==='stay') return renderStay(); if(view==='map') return renderNavigation();
}
function renderAttendeeJourney(){
  const e=selectedEvent();const root=document.getElementById('view-root');
  root.innerHTML=`<div class="grid-2"><div>${state.ticket?ticketHTML(e):ticketConnectHTML(e)}</div><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>What is happening now?</h3><p>Simple live schedule for this event.</p></div><span class="status success">LIVE</span></div>${timelineHTML()}</div></div><div class="panel"><div class="panel-head"><div><h3>Where do you want to go?</h3><p>Choose one place. EventFlow will show one clear route.</p></div><span class="chip coral">Best gate: East Gate</span></div><div class="destination-grid">${destinations().map(d=>destinationHTML(d)).join('')}</div></div><div class="grid-3" style="margin-top:14px"><div class="content-card"><span class="page-kicker">ENTRY</span><h3>Use East Gate</h3><p>4 min wait • lower crowd • fastest for your seat block.</p><button class="btn soft" data-go-map="gate-east">Show route</button></div><div class="content-card"><span class="page-kicker">PARKING</span><h3>P1 has 1,015 spaces</h3><p>Car parking • 7 min walk • Arena Link Road.</p><button class="btn soft" data-go-parking>View parking</button></div><div class="content-card"><span class="page-kicker">AFTER EVENT</span><h3>Metro until 00:10</h3><p>Metro Central • medium crowd • shuttle every 6 min.</p><button class="btn soft" data-go-map="metro">Show route</button></div></div>`;
  root.querySelector('[data-connect-ticket]')?.addEventListener('click',connectTicket); root.querySelectorAll('[data-destination]').forEach(b=>b.onclick=()=>goDestination(b.dataset.destination)); root.querySelectorAll('[data-go-map]').forEach(b=>b.onclick=()=>goDestination(b.dataset.goMap));root.querySelector('[data-go-parking]')?.addEventListener('click',()=>{currentNav='parking';renderShell()});
}
function ticketConnectHTML(e){return `<div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Connect your ticket</h3><p>Add a ticket number or choose a ticket photo. Demo stays in your browser.</p></div></div><label style="font-size:11px;font-weight:800">Ticket number<input id="ticket-number" style="width:100%;margin-top:7px;padding:12px;border:1px solid var(--line);border-radius:12px" placeholder="Example: EVT-2419-AX" /></label><div style="height:10px"></div><label class="btn soft wide">Choose ticket photo<input id="ticket-photo" type="file" accept="image/*" hidden></label><button class="btn accent wide" style="margin-top:10px" data-connect-ticket>Open my event pass</button></div>`}
function ticketHTML(e){return `<div class="ticket-card"><span class="status success">CONNECTED</span><small>${e.id}</small><h3>${esc(e.title)}</h3><p>${esc(e.venue)}</p><div class="ticket-details"><div><span>BLOCK</span><b>C12</b></div><div><span>SEAT</span><b>Row F • 18</b></div><div><span>BEST ENTRY</span><b>East Gate</b></div></div></div>`}
function connectTicket(){const n=document.getElementById('ticket-number')?.value.trim();state.ticket={number:n||'DEMO-'+Math.random().toString(36).slice(2,8).toUpperCase(),block:'C12',seat:'F-18'};saveState();renderAttendeeJourney()}
function timelineHTML(){const rows=[['18:00','Gates open','done'],['19:00','Opening show','done'],['20:00','Main program','live'],['21:15','Food & break window','next'],['22:40','Exit guidance starts','next'],['23:30','Event ends','next']];return `<div class="timeline">${rows.map(([t,l,s])=>`<div class="timeline-row"><b>${t}</b><span class="timeline-dot ${s==='live'?'live':''}"></span><div><b>${l}</b><small>${s==='live'?'Happening now':s==='done'?'Completed':'Coming later'}</small></div><span class="chip ${s==='live'?'coral':''}">${s.toUpperCase()}</span></div>`).join('')}</div>`}
function destinations(){return [
  {id:'seat',icon:'🎟️',name:'My Seat / Place',desc:'Block C12 • Row F'},
  {id:'food-pizza',icon:'🍕',name:'Pizza Station',desc:'6 min wait'},
  {id:'food-veg',icon:'🥗',name:'Fresh Bowl',desc:'2 min wait'},
  {id:'washroom',icon:'🚻',name:'Washroom',desc:'Nearest open point'},
  {id:'medical',icon:'✚',name:'Medical Help',desc:'M1 • open'},
  {id:'parking-p1',icon:'🅿️',name:'Parking P1',desc:'1,015 car spaces'},
  {id:'metro',icon:'🚇',name:'Metro Central',desc:'Last metro 00:10'},
  {id:'exit',icon:'↗',name:'Best Exit',desc:'East Exit after event'}
]}
function destinationHTML(d){return `<button class="destination-card" data-destination="${d.id}"><span class="icon">${d.icon}</span><b>${d.name}</b><small>${d.desc}</small></button>`}
function goDestination(id){currentRouteData=id;currentNav='map';renderShell()}

function renderAttendeeServices(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">LIVE AROUND YOU</span><h2>Food, help and useful places.</h2><p>Choose a specific place first. Then open one clear route.</p></div><div class="grid-2" style="margin-top:18px"><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Food & drinks</h3><p>Live wait time from event operators.</p></div></div><div class="list-stack">${state.live.food.map(foodRowHTML).join('')}</div></div><div><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Help & facilities</h3><p>Quick places you may need.</p></div></div><div class="list-stack">${[['Medical Point M1','Open • 3 min walk','medical'],['Washroom W2','Open • low queue','washroom'],['Guest Help Desk','Open until 23:45','help'],['Metro Central','Running • last 00:10','metro']].map(([n,d,id])=>`<div class="service-row"><div><h4>${n}</h4><p>${d}</p></div><button class="btn soft" data-go="${id}">Go there</button></div>`).join('')}</div></div><div class="panel"><div class="panel-head"><div><h3>Live notice</h3><p>Updates from the event team.</p></div></div><div class="activity-feed">${state.live.activity.slice(0,4).map(activityHTML).join('')}</div></div></div></div>`;root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goDestination(b.dataset.go));}
function foodRowHTML(f){return `<div class="service-row"><div><h4>${f.name}</h4><p>${f.category} • ${f.zone} • ${f.price}</p><div class="service-meta"><span class="chip ${f.wait<=4?'green':f.wait<=8?'amber':'coral'}">${f.wait<=4?'Free now':`${f.wait} min wait`}</span><span class="chip">${f.operator}</span></div></div><button class="btn soft" data-go="${f.id}">Go there</button></div>`}
function renderParking(role){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">PARKING</span><h2>Find one clear parking option.</h2><p>Choose car or bike. EventFlow shows availability, walking time and restrictions.</p></div><div class="filter-row" style="margin:18px 0"><button class="filter-btn active" data-vehicle="all">All</button><button class="filter-btn" data-vehicle="car">Car</button><button class="filter-btn" data-vehicle="bike">Bike</button></div><div id="parking-list" class="grid-3">${parkingCards('all')}</div><div class="panel"><div class="panel-head"><div><h3>Parking rules</h3><p>Simple notes before you drive in.</p></div></div><div class="grid-3"><div class="content-card"><b>Third Road</b><p>No roadside parking. Use official parking only.</p></div><div class="content-card"><b>Best car option</b><p>P1 • 1,015 spaces • 7 min walk.</p></div><div class="content-card"><b>Best bike option</b><p>B1 • 220 spaces • 5 min walk.</p></div></div></div>`;root.querySelectorAll('[data-vehicle]').forEach(b=>b.onclick=()=>{root.querySelectorAll('[data-vehicle]').forEach(x=>x.classList.toggle('active',x===b));document.getElementById('parking-list').innerHTML=parkingCards(b.dataset.vehicle);document.querySelectorAll('[data-parking-go]').forEach(x=>x.onclick=()=>goDestination('parking-'+x.dataset.parkingGo.toLowerCase()))});root.querySelectorAll('[data-parking-go]').forEach(x=>x.onclick=()=>goDestination('parking-'+x.dataset.parkingGo.toLowerCase()));}
function parkingCards(filter){return state.live.parking.filter(p=>filter==='all'||p.vehicle===filter).map(p=>`<div class="content-card"><div class="event-card-top"><div><span class="status ${p.free>0?'success':'danger'}">${p.free>0?'AVAILABLE':'FULL'}</span><h3>${p.name}</h3></div><span class="chip">${p.vehicle.toUpperCase()}</span></div><p>${p.road}</p><div class="event-meta"><div><span>Free</span><b>${p.free.toLocaleString('en-IN')}</b></div><div><span>Walk</span><b>${p.walk}</b></div></div><p style="font-size:11px;color:var(--muted)">${p.note}</p>${p.free>0?`<button class="btn soft wide" data-parking-go="${p.id}">Navigate here</button>`:''}</div>`).join('')}
function renderStay(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">STAY</span><h2>Need a place after the event?</h2><p>Demo stay options with price, room count and shuttle information.</p></div><div class="grid-3" style="margin-top:18px">${state.live.stays.map(s=>`<div class="content-card"><span class="status ${s.rooms>10?'success':'warning'}">${s.rooms} ROOMS LEFT</span><h3>${s.name}</h3><p>${s.distance} from event</p><div class="event-meta"><div><span>Price</span><b>${s.price}</b></div><div><span>Shuttle</span><b>${s.shuttle}</b></div></div><p style="font-size:11px;color:var(--muted)">${s.phone}</p><button class="btn soft wide" data-go="stay-${s.id}">Show route</button></div>`).join('')}</div>`;root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goDestination(b.dataset.go));}

function renderNavigation(){
  const root=document.getElementById('view-root');const target=currentRouteData||'gate-east';const info=destinationInfo(target);root.innerHTML=`<div class="panel-title"><span class="page-kicker">TURN-BY-TURN</span><h2>${info.title}</h2><p>${info.subtitle}</p></div><div class="map-layout" style="margin-top:18px"><div class="map-card"><div class="map-topbar"><div><h3>Route to ${info.title}</h3><p>One route only • safer when crowd is high</p></div><div class="map-actions"><button class="mini-btn" id="use-location">Use my location</button><button class="mini-btn" id="recenter-map">Recenter</button></div></div><div class="map-wrap"><div class="map-fallback" id="map-fallback"><div><b>Loading road map…</b><span>If map tiles are blocked, your route steps still work on the right.</span></div></div><div id="map" class="map-canvas"></div><div class="turn-card"><div class="turn-arrow">↱</div><div><b id="next-turn">Go straight for 120 m</b><span id="turn-detail">Then take the next right toward East Gate</span></div></div><div class="route-summary"><div><span>ETA</span><b id="route-eta">8 min</b></div><div><span>DISTANCE</span><b id="route-distance">1.2 km</b></div><div><span>ENTRY</span><b>East Gate</b></div></div></div></div><div class="side-stack"><div class="live-box"><h3>Route steps</h3><p>Clear instructions, one step at a time.</p><div id="route-steps" class="status-list">${routeSteps(info).map((s,i)=>`<div class="status-item"><div><b>${i+1}. ${s}</b><span>${i===0?'Start now':'Next step'}</span></div>${i===0?'<span class="chip coral">NOW</span>':''}</div>`).join('')}</div></div><div class="live-box"><h3>What is happening around you</h3><div class="status-list"><div class="status-item"><div><b>East Gate</b><span>Open • 4 min wait</span></div><span class="chip green">38%</span></div><div class="status-item"><div><b>North Gate</b><span>Open • 18 min wait</span></div><span class="chip coral">92%</span></div><div class="status-item"><div><b>Parking P1</b><span>Car parking</span></div><span class="chip green">1,015 free</span></div><div class="status-item"><div><b>Pizza Station</b><span>East Food Street</span></div><span class="chip amber">6 min</span></div></div></div><div class="live-box"><h3>Why this route?</h3><p>North Gate is crowded. EventFlow sends you to East Gate even if the walk is slightly longer.</p><button class="btn soft wide" data-go="gate-east">Use East Gate route</button></div></div></div>`;
  root.querySelector('[data-go]')?.addEventListener('click',e=>goDestination(e.currentTarget.dataset.go));document.getElementById('use-location').onclick=useMyLocation;document.getElementById('recenter-map').onclick=()=>currentMap?.flyTo({center:[72.8266,18.9388],zoom:15.5,pitch:55});initRealMap(info);
}
function destinationInfo(id){const map={
  'gate-east':{title:'East Gate',subtitle:'Best entry right now • 38% crowd • 4 min wait',coords:[72.8290,18.9386]},seat:{title:'Block C12',subtitle:'Your seat area • enter through East Gate',coords:[72.8268,18.9390]},'food-pizza':{title:'Pizza Station',subtitle:'East Food Street • 6 min wait',coords:[72.8285,18.9397]},'food-veg':{title:'Fresh Bowl',subtitle:'South Concourse • 2 min wait',coords:[72.8267,18.9368]},washroom:{title:'Washroom W2',subtitle:'Open • low queue',coords:[72.8278,18.9377]},medical:{title:'Medical Point M1',subtitle:'Open • event medical team available',coords:[72.8249,18.9382]},'parking-p1':{title:'Parking P1',subtitle:'1,015 car spaces free • 7 min walk',coords:[72.8238,18.9369]},'parking-b1':{title:'Bike Parking B1',subtitle:'220 bike spaces free • 5 min walk',coords:[72.8291,18.9386]},metro:{title:'Metro Central',subtitle:'Running • last metro 00:10',coords:[72.8314,18.9362]},exit:{title:'East Exit',subtitle:'Recommended exit after the event',coords:[72.8292,18.9381]},help:{title:'Guest Help Desk',subtitle:'Open until 23:45',coords:[72.8270,18.9381]}};
  if(id.startsWith('stay-')) return {title:'Hotel / Stay',subtitle:'Stay option with event shuttle',coords:[72.8195,18.9422]};return map[id]||map['gate-east'];
}
function routeSteps(info){return [`Go straight for about 120 metres`,`Take the next right toward Arena Link Road`,`Stay on the quieter side of the road`,`Follow signs for ${info.title}`,`You have arrived at ${info.title}`]}
function cleanupMap(){if(currentMap){try{currentMap.remove()}catch{}currentMap=null}}
function initRealMap(info){
  if(!window.maplibregl) return; const fallback=document.getElementById('map-fallback');
  try{currentMap=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/positron',center:[72.8266,18.9388],zoom:15.5,pitch:55,bearing:-18,attributionControl:false});currentMap.addControl(new maplibregl.NavigationControl({showCompass:true}),'bottom-right');
    currentMap.on('load',()=>{fallback.style.display='none'; addLiveMarkers(info); drawDemoRoute(info.coords);});currentMap.on('error',()=>{});
  }catch{}
}
function addLiveMarkers(info){if(!currentMap)return;const points=[
  ['East Gate',[72.8290,18.9386],'#2aaa74'],['North Gate',[72.8264,18.9411],'#e65353'],['Parking P1',[72.8238,18.9369],'#8a5cf6'],['Pizza',[72.8285,18.9397],'#f4a62a'],['Medical',[72.8249,18.9382],'#e65353'],['Metro',[72.8314,18.9362],'#242121']];
  points.forEach(([name,coords,color])=>{const el=document.createElement('button');el.className='map-marker';Object.assign(el.style,{width:'18px',height:'18px',borderRadius:'50%',border:'3px solid white',background:color,boxShadow:'0 4px 12px rgba(0,0,0,.2)'});new maplibregl.Marker({element:el}).setLngLat(coords).setPopup(new maplibregl.Popup({offset:12}).setHTML(`<strong>${name}</strong>`)).addTo(currentMap)});
  new maplibregl.Marker({color:'#ff6b57'}).setLngLat(info.coords).addTo(currentMap);
  currentMap.addSource('crowd-north',{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Point',coordinates:[72.8264,18.9411]},properties:{}}]}});currentMap.addLayer({id:'crowd-north',type:'circle',source:'crowd-north',paint:{'circle-radius':24,'circle-color':'#e65353','circle-opacity':.22,'circle-stroke-color':'#e65353','circle-stroke-width':2}});
}
async function drawDemoRoute(dest){if(!currentMap)return; const start=[72.8219,18.9357]; let coords=[start,[72.8232,18.9363],[72.8245,18.9373],[72.8260,18.9378],[72.8273,18.9382],dest];
  try{const url=`https://router.project-osrm.org/route/v1/foot/${start[0]},${start[1]};${dest[0]},${dest[1]}?overview=full&geometries=geojson&steps=true`;const r=await fetch(url);if(r.ok){const d=await r.json();if(d.routes?.[0]){coords=d.routes[0].geometry.coordinates;document.getElementById('route-distance').textContent=(d.routes[0].distance/1000).toFixed(1)+' km';document.getElementById('route-eta').textContent=Math.max(3,Math.round(d.routes[0].duration/60))+' min';const steps=d.routes[0].legs?.[0]?.steps?.slice(0,5)||[];if(steps.length){document.getElementById('route-steps').innerHTML=steps.map((s,i)=>`<div class="status-item"><div><b>${i+1}. ${stepText(s)}</b><span>${Math.round(s.distance)} m</span></div>${i===0?'<span class="chip coral">NOW</span>':''}</div>`).join('');document.getElementById('next-turn').textContent=stepText(steps[0]);document.getElementById('turn-detail').textContent=steps[1]?`Then ${stepText(steps[1]).toLowerCase()}`:'Continue to destination';}}}}catch{}
  const geo={type:'Feature',geometry:{type:'LineString',coordinates:coords}};currentMap.addSource('route',{type:'geojson',data:geo});currentMap.addLayer({id:'route-outline',type:'line',source:'route',paint:{'line-color':'#ffffff','line-width':9,'line-opacity':.96}});currentMap.addLayer({id:'route',type:'line',source:'route',paint:{'line-color':'#ff6b57','line-width':5,'line-opacity':1}});const bounds=coords.reduce((b,c)=>b.extend(c),new maplibregl.LngLatBounds(coords[0],coords[0]));currentMap.fitBounds(bounds,{padding:70,pitch:55,bearing:-18,duration:900});
}
function stepText(s){const type=s.maneuver?.type||'continue';const mod=s.maneuver?.modifier||'';const road=s.name?` onto ${s.name}`:'';if(type==='turn')return `Take ${mod||'the turn'}${road}`;if(type==='depart')return `Start and go ${mod||'straight'}${road}`;if(type==='arrive')return 'You have arrived';return `Continue ${mod||'straight'}${road}`}
function useMyLocation(){if(!navigator.geolocation){showModal('Location not available','This browser does not support location access.');return}navigator.geolocation.getCurrentPosition(pos=>{currentMap?.flyTo({center:[pos.coords.longitude,pos.coords.latitude],zoom:16,pitch:55});showModal('Location ready','EventFlow moved the map to your current phone location. Route data in this demo still uses the event demo network.');},()=>showModal('Location permission needed','Allow location access in your browser to use your current position.'));}

function renderOperatorView(view){if(view==='tasks')return renderOperatorTasks();if(view==='services')return renderOperatorServices();if(view==='map'){currentRouteData='gate-east';return renderNavigation()}if(view==='activity')return renderActivity();}
function renderOperatorTasks(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">YOUR WORK</span><h2>Tasks from management.</h2><p>Every task explains where, why, deadline and what you need.</p></div><div class="list-stack" style="margin-top:18px">${state.live.tasks.map(taskHTML).join('')}</div>`;bindTaskActions(root)}
function taskHTML(t){return `<div class="operator-task"><div class="task-top"><div><span class="chip ${t.status==='working'?'amber':t.status==='done'?'green':'coral'}">${t.status.toUpperCase()}</span><h4>${t.title}</h4><p>${t.category} • Assigned by Event Management</p></div><span class="chip violet">${t.assignee}</span></div><div class="task-detail-grid"><div><span>WHERE</span><b>${t.where}</b></div><div><span>WHY</span><b>${t.why}</b></div><div><span>BY WHEN</span><b>${t.by}</b></div><div><span>YOU NEED</span><b>${t.need}</b></div></div><div class="service-meta">${t.steps.map((s,i)=>`<span class="chip">${i+1}. ${s}</span>`).join('')}</div><div class="action-row">${t.status==='new'?`<button class="btn dark" data-task="${t.id}" data-status="working">Start work</button>`:''}${t.status==='working'?`<button class="btn success" data-task="${t.id}" data-status="done">Mark done</button>`:''}<button class="btn soft" data-task-map="${t.id}">Show location</button></div></div>`}
function bindTaskActions(root){root.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>updateTask(b.dataset.task,b.dataset.status));root.querySelectorAll('[data-task-map]').forEach(b=>b.onclick=()=>{currentRouteData='gate-east';currentNav='map';renderShell()})}
function updateTask(id,status){const t=state.live.tasks.find(x=>x.id===id);if(!t)return;t.status=status;state.live.activity.unshift({icon:'✓',text:`${t.assignee}: ${t.title} → ${status}`,time:'Just now'});state.notifications.unshift({text:`Operator update: ${t.title} is ${status}.`,time:'Now'});saveState();renderOperatorTasks()}
function renderOperatorServices(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">LIVE SERVICES</span><h2>Update what guests can use right now.</h2><p>Your changes immediately update the local attendee and management views.</p></div><div class="grid-2" style="margin-top:18px"><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Gates</h3><p>Open, close or reduce wait.</p></div></div><div class="list-stack">${Object.entries(state.live.gates).map(([id,g])=>`<div class="service-row"><div><h4>${g.name}</h4><p>${g.open?'Open':'Closed'} • ${g.crowd}% crowd • ${g.wait} min</p></div><div class="action-row"><button class="btn soft" data-gate-toggle="${id}">${g.open?'Close':'Open'}</button><button class="btn soft" data-gate-line="${id}">Add line</button></div></div>`).join('')}</div></div><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Food & parking</h3><p>Mark services free or add space.</p></div></div><div class="list-stack">${state.live.food.slice(0,2).map(f=>`<div class="service-row"><div><h4>${f.name}</h4><p>${f.wait} min wait • ${f.zone}</p></div><button class="btn soft" data-food-free="${f.id}">Mark free</button></div>`).join('')}<div class="service-row"><div><h4>Parking P1</h4><p>${state.live.parking[0].free.toLocaleString('en-IN')} spaces free</p></div><button class="btn soft" data-parking-add>Add 120 spaces</button></div><div class="service-row"><div><h4>Event Shuttle S4</h4><p>Next shuttle in ${state.live.transit.shuttle.next}</p></div><button class="btn soft" data-shuttle>Deploy extra shuttle</button></div></div></div></div>`;root.querySelectorAll('[data-gate-toggle]').forEach(b=>b.onclick=()=>operatorGateToggle(b.dataset.gateToggle));root.querySelectorAll('[data-gate-line]').forEach(b=>b.onclick=()=>operatorAddLine(b.dataset.gateLine));root.querySelectorAll('[data-food-free]').forEach(b=>b.onclick=()=>operatorFoodFree(b.dataset.foodFree));root.querySelector('[data-parking-add]').onclick=operatorParkingAdd;root.querySelector('[data-shuttle]').onclick=operatorShuttle;}
function logAction(icon,text){state.live.activity.unshift({icon,text,time:'Just now'});state.notifications.unshift({text,time:'Now'});saveState();}
function operatorGateToggle(id){const g=state.live.gates[id];g.open=!g.open;logAction('🚪',`${g.name} ${g.open?'opened':'closed'} by operator`);renderOperatorServices()}
function operatorAddLine(id){const g=state.live.gates[id];g.wait=Math.max(2,g.wait-5);g.crowd=Math.max(20,g.crowd-12);logAction('➕',`Extra entry line opened at ${g.name}`);renderOperatorServices()}
function operatorFoodFree(id){const f=state.live.food.find(x=>x.id===id);f.wait=2;logAction('🍴',`${f.name} marked free now`);renderOperatorServices()}
function operatorParkingAdd(){state.live.parking[0].free+=120;logAction('🅿️','Parking P1 opened 120 more spaces');renderOperatorServices()}
function operatorShuttle(){state.live.transit.shuttle.next='2 min';logAction('🚌','Extra event shuttle deployed');renderOperatorServices()}
function renderActivity(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">LIVE UPDATE FEED</span><h2>What changed around the event.</h2><p>Operator work, gate changes and service updates.</p></div><div class="panel" style="margin-top:18px"><div class="activity-feed">${state.live.activity.map(activityHTML).join('')}</div></div>`}
function activityHTML(a){return `<div class="activity-row"><div class="activity-icon">${a.icon}</div><div><b>${a.text}</b><span>${a.time}</span></div></div>`}

function renderManagementView(view){if(view==='control')return renderControl();if(view==='guests')return renderGuestMgmt();if(view==='services')return renderManagementServices();if(view==='parking')return renderManagementParking();if(view==='teams')return renderTeams();if(view==='map'){currentRouteData='gate-east';return renderNavigation()}}
function renderControl(){const root=document.getElementById('view-root');const e=selectedEvent();root.innerHTML=`<div class="panel-title"><span class="page-kicker">${e.id}</span><h2>${e.title}</h2><p>One control room for guests, gates, food, parking, stay, travel and team work.</p></div><div class="grid-4" style="margin-top:18px"><div class="metric-card"><span>Guests inside</span><strong>18,940</strong><small>+1,240 in last 30 min</small></div><div class="metric-card"><span>Open gates</span><strong>${Object.values(state.live.gates).filter(g=>g.open).length}/4</strong><small>North is busiest</small></div><div class="metric-card"><span>Parking free</span><strong>${state.live.parking.reduce((a,p)=>a+p.free,0).toLocaleString('en-IN')}</strong><small>Car + bike spaces</small></div><div class="metric-card"><span>Open jobs</span><strong>${state.live.tasks.filter(t=>t.status!=='done').length}</strong><small>${state.live.tasks.filter(t=>t.status==='working').length} in progress</small></div></div><div class="grid-2"><div class="panel"><div class="panel-head"><div><h3>Live event schedule</h3><p>What is happening now and next.</p></div><span class="status success">LIVE</span></div>${timelineHTML()}</div><div class="panel"><div class="panel-head"><div><h3>Live operations</h3><p>Latest changes from operators.</p></div></div><div class="activity-feed">${state.live.activity.slice(0,6).map(activityHTML).join('')}</div></div></div><div class="grid-3"><div class="panel"><div class="panel-head"><div><h3>Gate pressure</h3></div></div>${Object.values(state.live.gates).map(g=>`<div class="status-item"><div><b>${g.name}</b><span>${g.open?'Open':'Closed'} • ${g.wait} min wait</span></div><span class="chip ${g.crowd>80?'coral':g.crowd<45?'green':'amber'}">${g.crowd}%</span></div>`).join('')}</div><div class="panel"><div class="panel-head"><div><h3>Food status</h3></div></div>${state.live.food.map(f=>`<div class="status-item"><div><b>${f.name}</b><span>${f.zone}</span></div><span class="chip ${f.wait<=4?'green':f.wait<=8?'amber':'coral'}">${f.wait} min</span></div>`).join('')}</div><div class="panel"><div class="panel-head"><div><h3>Travel & stay</h3></div></div><div class="status-item"><div><b>Metro Central</b><span>Last 00:10</span></div><span class="chip green">Running</span></div><div class="status-item"><div><b>Event Shuttle</b><span>Next ${state.live.transit.shuttle.next}</span></div><span class="chip green">Running</span></div><div class="status-item"><div><b>Hotel rooms</b><span>Partner stays</span></div><span class="chip violet">${state.live.stays.reduce((a,s)=>a+s.rooms,0)} free</span></div></div></div>`}
function renderGuestMgmt(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">GUEST JOURNEY</span><h2>See the event from a guest’s point of view.</h2><p>Arrival, entry, activity, food, stay and exit are all connected.</p></div><div class="grid-4" style="margin-top:18px">${[['Arriving now','3,420','Metro + car + taxi'],['Waiting at gates','1,240','North has highest wait'],['Inside event','18,940','Main program live'],['Leaving soon','4,800','Exit wave in 55 min']].map(([a,b,c])=>`<div class="metric-card"><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`).join('')}</div><div class="panel"><div class="panel-head"><div><h3>Guest journey stages</h3><p>Where people are in the event journey.</p></div></div><div class="flow-row">${[['01','ARRIVE','Travel + parking'],['02','ENTER','Gate + ticket'],['03','ENJOY','Seat + food + help'],['04','LEAVE','Exit + metro']].map((x,i)=>`<div class="flow-node ${i===2?'active':''}"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>${i<3?'<div class="flow-line"></div>':''}`).join('')}</div></div>`}
function renderManagementServices(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">FOOD & SERVICES</span><h2>Know what guests can use right now.</h2><p>Wait times, service status, operator and location.</p></div><div class="grid-2" style="margin-top:18px"><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Food counters</h3></div></div><div class="list-stack">${state.live.food.map(foodRowHTML).join('')}</div></div><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Guest facilities</h3></div></div><div class="list-stack">${[['Medical Point M1','Open','Health Team'],['Washroom W2','Low queue','Facility Team'],['Guest Help Desk','Open','Guest Experience'],['Water Point H2','Free now','Hydration Team']].map(([n,s,o])=>`<div class="service-row"><div><h4>${n}</h4><p>${o}</p></div><span class="chip green">${s}</span></div>`).join('')}</div></div></div>`}
function renderManagementParking(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">TRAVEL & PARKING</span><h2>Cars, bikes, metro and exit planning.</h2><p>See availability before it becomes a crowd problem.</p></div><div class="grid-3" style="margin-top:18px">${parkingCards('all')}</div><div class="grid-3"><div class="panel"><h3>Metro</h3><p>Metro Central • ${state.live.transit.metro.status} • last ${state.live.transit.metro.last}</p><span class="chip amber">${state.live.transit.metro.crowd} crowd</span></div><div class="panel"><h3>Shuttle</h3><p>${state.live.transit.shuttle.name} • next ${state.live.transit.shuttle.next}</p><span class="chip green">Running</span></div><div class="panel"><h3>Taxi</h3><p>${state.live.transit.taxi.name}</p><span class="chip green">Available</span></div></div>`}
function renderTeams(){const root=document.getElementById('view-root');root.innerHTML=`<div class="panel-title"><span class="page-kicker">TEAMS & JOBS</span><h2>Who is doing what, where.</h2><p>Assign work and track the exact operational status.</p></div><div class="grid-2" style="margin-top:18px"><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Team status</h3></div></div><div class="list-stack">${state.live.operators.map(o=>`<div class="service-row"><div><h4>${o.name}</h4><p>${o.area}</p></div><span class="chip ${o.status==='Working'?'amber':'green'}">${o.status}</span></div>`).join('')}</div></div><div class="panel" style="margin-top:0"><div class="panel-head"><div><h3>Assigned jobs</h3></div></div><div class="list-stack">${state.live.tasks.map(t=>`<div class="service-row"><div><h4>${t.title}</h4><p>${t.where} • ${t.assignee}</p></div><span class="chip ${t.status==='done'?'green':t.status==='working'?'amber':'coral'}">${t.status}</span></div>`).join('')}</div></div></div>`}

function showNotifications(){showModal('Live notifications',state.notifications.slice(0,6).map(n=>`• ${n.text} — ${n.time}`).join('\n'))}
function showModal(title,text){modalRoot.innerHTML=`<div class="modal-backdrop"><div class="modal"><h3>${esc(title)}</h3><p style="white-space:pre-line">${esc(text)}</p><div class="modal-actions"><button class="btn dark" data-close-modal>Close</button></div></div></div>`;modalRoot.querySelector('[data-close-modal]').onclick=()=>modalRoot.innerHTML='';}
function bindCommon(){document.querySelectorAll('[data-action]').forEach(el=>{el.addEventListener('click',()=>{const a=el.dataset.action;if(a==='open-login')renderAuth('login');if(a==='open-register')renderAuth('register');if(a==='back-home')renderLanding();if(a==='demo-login')demoLogin();if(a==='logout'){state.session=null;saveState();renderLanding()}if(a==='scroll-events')document.getElementById('events')?.scrollIntoView({behavior:'smooth'});if(a==='event-demo'){selectedEventId=el.dataset.event;state.selectedEventId=selectedEventId;saveState();renderAuth('login')}if(a==='show-notifications')showNotifications();if(a==='go-home-hub'){currentNav='events';renderShell();}})});}

if(state.session) renderShell(); else renderLanding();

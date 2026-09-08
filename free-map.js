(function(){
  const cfg = window.EVENTFLOW_CONFIG || {};
  const LL = () => window.EventFlowLiveLocation;
  let map = null;
  let mounted = false;
  let crowdOn = true;
  let roadsOn = true;
  let crowdTimer = null;
  let markers = [];
  let myMarker = null;
  let currentOptions = {};
  let liveGatePressure = {};
  let routesCache = [];
  let selectedRoute = 0;

  const COLORS = { normal:'#58d89a', moderate:'#e5cf72', heavy:'#f2a85b', critical:'#ff6672' };
  const el = id => document.getElementById(id);
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));

  function setStatus(text,tone=''){
    const n=el('gmStatus');
    if(n){ n.textContent=text; n.className='gm-status '+tone; }
  }

  function haversine(a,b){
    const R=6371000, rad=Math.PI/180;
    const dLat=(b.lat-a.lat)*rad, dLng=(b.lng-a.lng)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  }

  function levelFor(v){ return v>=90?'critical':v>=75?'heavy':v>=55?'moderate':'normal'; }
  function gateEntries(){ return Object.entries(cfg.EVENT_GATES || {}); }

  function baseStyle(){
    return {
      version:8,
      sources:{
        osm:{
          type:'raster',
          tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize:256,
          attribution:'© OpenStreetMap contributors'
        }
      },
      layers:[{
        id:'osm-base', type:'raster', source:'osm', minzoom:0, maxzoom:19,
        paint:{
          'raster-opacity':0.94,
          'raster-brightness-min':0.12,
          'raster-brightness-max':0.72,
          'raster-saturation':-0.56,
          'raster-contrast':0.18
        }
      }]
    };
  }

  function makeMarker(label, pressure, extra=''){
    const node=document.createElement('button');
    node.type='button';
    node.className='ml-pin';
    const level=levelFor(pressure);
    node.style.setProperty('--pin',COLORS[level]);
    node.innerHTML=`<span>${label}</span><b>${Math.round(pressure)}%</b>${extra?`<small>${extra}</small>`:''}`;
    return node;
  }

  function removeMarkers(){ markers.forEach(m=>m.remove()); markers=[]; }

  function addMarkers(){
    if(!map || !window.maplibregl) return;
    removeMarkers();
    const center=cfg.EVENT_CENTER;
    const venueNode=makeMarker('UNITY ARENA',Number(currentOptions.venueLoad||79),'venue');
    markers.push(new maplibregl.Marker({element:venueNode,anchor:'bottom'}).setLngLat([center.lng,center.lat]).setPopup(new maplibregl.Popup({offset:22}).setHTML('<b>Unity Arena</b><br>National Sports Championship Final')).addTo(map));
    gateEntries().forEach(([id,g])=>{
      const pressure=Number(liveGatePressure[id] ?? currentOptions.gateLoad?.[id] ?? 0);
      const node=makeMarker(g.label.toUpperCase(),pressure,'crowd');
      const popup=new maplibregl.Popup({offset:22}).setHTML(`<b>${g.label}</b><br>EventFlow crowd pressure: ${Math.round(pressure)}%`);
      markers.push(new maplibregl.Marker({element:node,anchor:'bottom'}).setLngLat([g.lng,g.lat]).setPopup(popup).addTo(map));
    });
  }

  function simulatedCells(){
    const loads=currentOptions.gateLoad||{};
    const pts=[];
    const around=(g,count,pressure)=>{
      for(let i=0;i<count;i++){
        const a=i*2.399, r=.00018+((i%7)/7)*.00075;
        pts.push({lat:g.lat+Math.cos(a)*r,lng:g.lng+Math.sin(a)*r,count:Math.max(1,Math.round(pressure/13+(i%4)))});
      }
    };
    gateEntries().forEach(([id,g])=>around(g, id==='north'?9:5, Number(loads[id]||45)));
    return pts;
  }

  function ensureCrowdLayer(){
    if(!map.getSource('eventflow-crowd')){
      map.addSource('eventflow-crowd',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      map.addLayer({
        id:'eventflow-crowd-halo', type:'circle', source:'eventflow-crowd',
        paint:{
          'circle-radius':['interpolate',['linear'],['get','count'],1,12,5,22,15,40,30,58],
          'circle-color':['match',['get','level'],'critical',COLORS.critical,'heavy',COLORS.heavy,'moderate',COLORS.moderate,COLORS.normal],
          'circle-opacity':0.20,
          'circle-blur':0.55,
          'circle-stroke-width':1,
          'circle-stroke-opacity':0.55,
          'circle-stroke-color':['match',['get','level'],'critical',COLORS.critical,'heavy',COLORS.heavy,'moderate',COLORS.moderate,COLORS.normal]
        }
      });
      map.addLayer({
        id:'eventflow-crowd-core', type:'circle', source:'eventflow-crowd',
        paint:{
          'circle-radius':['interpolate',['linear'],['get','count'],1,4,5,7,15,11,30,15],
          'circle-color':['match',['get','level'],'critical',COLORS.critical,'heavy',COLORS.heavy,'moderate',COLORS.moderate,COLORS.normal],
          'circle-opacity':0.72,
          'circle-stroke-width':1.5,
          'circle-stroke-color':'#071019'
        }
      });
      map.on('click','eventflow-crowd-core',e=>{
        const f=e.features?.[0]; if(!f)return;
        new maplibregl.Popup({offset:10}).setLngLat(e.lngLat).setHTML(`<b>Live crowd cell</b><br>${f.properties.count} active GPS signal${Number(f.properties.count)===1?'':'s'}<br>Pressure: ${String(f.properties.level).toUpperCase()}`).addTo(map);
      });
      map.on('mouseenter','eventflow-crowd-core',()=>map.getCanvas().style.cursor='pointer');
      map.on('mouseleave','eventflow-crowd-core',()=>map.getCanvas().style.cursor='');
    }
  }

  function computeGatePressure(cells){
    const base={};
    gateEntries().forEach(([id])=>base[id]=Number(currentOptions.gateLoad?.[id]||0));
    if(!cells.length){ liveGatePressure=base; return; }
    const out={...base};
    gateEntries().forEach(([id,g])=>{
      let nearby=0;
      cells.forEach(c=>{
        const count=Number(c.people_count||c.count||0);
        if(haversine({lat:Number(c.lat),lng:Number(c.lng)},g)<=180) nearby+=count;
      });
      // Treat each opted-in phone as a sampling signal, not one-for-one attendance.
      out[id]=clamp(base[id]+nearby*4,0,100);
    });
    liveGatePressure=out;
  }

  async function refreshCrowd(){
    if(!map || !mounted) return;
    let cells=[];
    try{ cells=await LL()?.getCrowdCells?.() || []; }catch{}
    const isLive=cells.length>0;
    computeGatePressure(cells);
    if(!cells.length) cells=simulatedCells();
    ensureCrowdLayer();
    const features=cells.slice(0,220).map(c=>{
      const count=Number(c.people_count||c.count||1);
      const level=count>=18?'critical':count>=10?'heavy':count>=5?'moderate':'normal';
      return {type:'Feature',geometry:{type:'Point',coordinates:[Number(c.lng),Number(c.lat)]},properties:{count,level}};
    });
    map.getSource('eventflow-crowd')?.setData({type:'FeatureCollection',features});
    if(map.getLayer('eventflow-crowd-halo')) map.setLayoutProperty('eventflow-crowd-halo','visibility',crowdOn?'visible':'none');
    if(map.getLayer('eventflow-crowd-core')) map.setLayoutProperty('eventflow-crowd-core','visibility',crowdOn?'visible':'none');
    const total=cells.reduce((a,x)=>a+Number(x.people_count||x.count||0),0);
    const n=el('gmPhoneCount'); if(n)n.textContent=isLive?`${total} live phone signal${total===1?'':'s'}`:'Demo crowd density · waiting for opted-in phones';
    addMarkers();
  }

  function ensureRouteLayer(){
    if(!map.getSource('eventflow-routes')){
      map.addSource('eventflow-routes',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      map.addLayer({
        id:'eventflow-route-lines',type:'line',source:'eventflow-routes',
        layout:{'line-cap':'round','line-join':'round'},
        paint:{
          'line-color':['case',['==',['get','selected'],1],'#5de0d7','#91a1ad'],
          'line-width':['case',['==',['get','selected'],1],6,3.5],
          'line-opacity':['case',['==',['get','selected'],1],0.95,0.42]
        }
      });
    }
  }

  function updateRouteLayer(){
    ensureRouteLayer();
    const features=routesCache.map((r,i)=>({type:'Feature',geometry:r.geometry,properties:{selected:i===selectedRoute?1:0,index:i}}));
    map.getSource('eventflow-routes')?.setData({type:'FeatureCollection',features});
  }

  function chooseRecommendedGate(origin){
    const entries=gateEntries();
    if(!entries.length)return null;
    let best=null;
    entries.forEach(([id,g])=>{
      const pressure=Number(liveGatePressure[id] ?? currentOptions.gateLoad?.[id] ?? 50);
      const distance=haversine(origin,g);
      // Crowd pressure dominates; distance keeps recommendations practical.
      const score=pressure*1.7 + distance/45;
      if(!best || score<best.score)best={id,...g,pressure,distance,score};
    });
    return best;
  }

  async function findAlternateRoute(){
    if(!map)return;
    let origin=LL()?.getLastPoint?.();
    if(!origin){
      setStatus('Share live GPS first — requesting location permission','warn');
      LL()?.start?.();
      return;
    }
    await refreshCrowd();
    const gate=chooseRecommendedGate(origin);
    if(!gate){setStatus('No gate coordinates are configured.','bad');return;}
    setStatus(`Finding road alternatives to ${gate.label}…`);
    try{
      const base=(cfg.OSRM_BASE_URL||'https://router.project-osrm.org').replace(/\/$/,'');
      const url=`${base}/route/v1/driving/${origin.lng},${origin.lat};${gate.lng},${gate.lat}?alternatives=3&steps=true&geometries=geojson&overview=full`;
      const res=await fetch(url);
      const data=await res.json();
      if(!res.ok || data.code!=='Ok' || !data.routes?.length) throw new Error(data.message||'No route found');
      routesCache=data.routes.map(r=>({geometry:r.geometry,duration:Number(r.duration||0),distance:Number(r.distance||0)}));
      selectedRoute=0;
      updateRouteLayer();
      const list=el('gmRouteList');
      if(list){
        list.innerHTML=routesCache.map((r,i)=>{
          const mins=Math.max(1,Math.round(r.duration/60));
          const km=(r.distance/1000).toFixed(1);
          return `<button class="gm-route-option ${i===0?'active':''}" data-route-index="${i}"><span>${i===0?'EventFlow recommended':'Road alternative '+(i+1)}</span><b>${mins} min</b><small>${km} km · ${gate.label} · ${Math.round(gate.pressure)}% crowd</small></button>`;
        }).join('');
        list.querySelectorAll('[data-route-index]').forEach(btn=>btn.addEventListener('click',()=>{
          selectedRoute=Number(btn.dataset.routeIndex||0);
          list.querySelectorAll('.gm-route-option').forEach(x=>x.classList.toggle('active',x===btn));
          updateRouteLayer();
          fitSelectedRoute();
        }));
      }
      fitSelectedRoute();
      setStatus(`${gate.label} selected · ${Math.round(gate.pressure)}% crowd pressure`,'good');
      window.dispatchEvent(new CustomEvent('eventflow:route-recommended',{detail:{gate:gate.label,pressure:gate.pressure}}));
    }catch(err){
      console.warn(err);
      setStatus('Free road router unavailable — showing crowd-aware gate guidance only.','warn');
      const list=el('gmRouteList');
      if(list)list.innerHTML=`<div class="gm-route-empty"><b>${gate.label}</b> is the lowest-pressure gate right now (${Math.round(gate.pressure)}%). Road routing service did not respond, but the crowd recommendation is still active.</div>`;
    }
  }

  function fitSelectedRoute(){
    const r=routesCache[selectedRoute]; if(!r?.geometry?.coordinates?.length)return;
    const bounds=new maplibregl.LngLatBounds();
    r.geometry.coordinates.forEach(c=>bounds.extend(c));
    map.fitBounds(bounds,{padding:70,maxZoom:16,duration:650});
  }

  function setMyMarker(point){
    if(!map || !point)return;
    if(myMarker)myMarker.remove();
    const node=document.createElement('div'); node.className='ml-user-dot'; node.title='Your live GPS';
    myMarker=new maplibregl.Marker({element:node,anchor:'center'}).setLngLat([point.lng,point.lat]).addTo(map);
    const acc=el('gmAccuracy'); if(acc)acc.textContent=`±${Math.round(point.accuracy||0)} m`;
    map.easeTo({center:[point.lng,point.lat],duration:450});
  }

  async function mount(options={}){
    currentOptions=options;
    const host=el('eventMap'); if(!host)return;
    if(crowdTimer){clearInterval(crowdTimer);crowdTimer=null;}
    if(map){ try{map.remove();}catch{} map=null; mounted=false; markers=[]; myMarker=null; routesCache=[]; }
    if(!window.maplibregl){
      host.innerHTML='<div class="gm-error">MapLibre could not load.<small>Check your internet connection; no API key is required.</small></div>';
      setStatus('MapLibre unavailable','bad');
      return;
    }
    map=new maplibregl.Map({
      container:host,
      style:baseStyle(),
      center:[cfg.EVENT_CENTER.lng,cfg.EVENT_CENTER.lat],
      zoom:15.1,
      minZoom:11,
      maxZoom:19,
      attributionControl:true
    });
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
    map.addControl(new maplibregl.ScaleControl({maxWidth:100,unit:'metric'}),'bottom-left');
    map.on('load',async()=>{
      mounted=true;
      liveGatePressure={...(currentOptions.gateLoad||{})};
      addMarkers();
      await refreshCrowd();
      const last=LL()?.getLastPoint?.(); if(last)setMyMarker(last);
      setStatus('OpenStreetMap roads + EventFlow GPS crowd live','good');
      crowdTimer=setInterval(refreshCrowd,5000);
    });
    map.on('error',e=>console.warn('MapLibre:',e?.error||e));
  }

  function toggleRoads(){
    roadsOn=!roadsOn;
    if(map?.getLayer('osm-base')) map.setPaintProperty('osm-base','raster-opacity',roadsOn?0.94:0.28);
    el('gmTrafficBtn')?.classList.toggle('active',roadsOn);
  }
  function toggleCrowd(){
    crowdOn=!crowdOn;
    ['eventflow-crowd-halo','eventflow-crowd-core'].forEach(id=>{if(map?.getLayer(id))map.setLayoutProperty(id,'visibility',crowdOn?'visible':'none');});
    el('gmCrowdBtn')?.classList.toggle('active',crowdOn);
  }
  function useMyLocation(){ LL()?.start?.(); }
  function stopLocation(){ LL()?.stop?.(); }

  window.addEventListener('eventflow:gps-point',e=>{ setMyMarker(e.detail.point); setStatus('GPS connected · crowd signal active','good'); });
  window.addEventListener('eventflow:gps-error',e=>setStatus(e.detail.message,'bad'));
  window.addEventListener('eventflow:gps-local',e=>setStatus(e.detail.reason,'warn'));

  window.EventFlowFreeMap={mount,toggleRoads,toggleCrowd,useMyLocation,stopLocation,findAlternateRoute,refreshCrowd};
})();

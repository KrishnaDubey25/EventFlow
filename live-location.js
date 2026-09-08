(function(){
  const cfg = window.EVENTFLOW_CONFIG || {};
  const SB = window.EventFlowSupabase;
  let watchId = null;
  let lastSentAt = 0;
  let lastPoint = null;
  let pseudoId = localStorage.getItem('eventflow.device.id');
  if(!pseudoId){
    pseudoId = (crypto.randomUUID ? crypto.randomUUID() : 'dev-'+Date.now()+'-'+Math.random().toString(36).slice(2));
    localStorage.setItem('eventflow.device.id', pseudoId);
  }

  function emit(name, detail){ window.dispatchEvent(new CustomEvent(name,{detail})); }
  function distanceMeters(a,b){
    if(!a||!b) return Infinity;
    const R=6371000, rad=Math.PI/180;
    const dLat=(b.lat-a.lat)*rad, dLng=(b.lng-a.lng)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  }
  function getAuthUserId(){
    const s=SB?.getSession?.();
    return s?.user?.id || null;
  }
  async function publish(point){
    const userId=getAuthUserId();
    if(!SB || !userId){
      emit('eventflow:gps-local',{point,reason:'Sign in with a Supabase attendee account to share GPS with the command center.'});
      return false;
    }
    const row={
      event_id:cfg.DEMO_EVENT_ID,
      user_id:userId,
      device_id:pseudoId,
      lat:point.lat,
      lng:point.lng,
      accuracy_m:Math.round(point.accuracy||0),
      heading_deg:Number.isFinite(point.heading)?point.heading:null,
      speed_mps:Number.isFinite(point.speed)?point.speed:null,
      last_seen:new Date().toISOString()
    };
    try{
      await SB.upsert('attendee_locations',row,'event_id,user_id');
      emit('eventflow:gps-published',{point});
      return true;
    }catch(err){
      emit('eventflow:gps-error',{message:err.message});
      return false;
    }
  }
  function start(){
    if(!('geolocation' in navigator)){
      emit('eventflow:gps-error',{message:'Geolocation is not supported on this device/browser.'}); return;
    }
    if(watchId!==null) return;
    emit('eventflow:gps-status',{status:'requesting'});
    watchId=navigator.geolocation.watchPosition(async pos=>{
      const point={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,heading:pos.coords.heading,speed:pos.coords.speed,ts:pos.timestamp};
      const now=Date.now();
      const moved=distanceMeters(lastPoint,point);
      lastPoint=point;
      emit('eventflow:gps-point',{point});
      // Avoid flooding Supabase: send at most every 8s, or sooner after a meaningful movement.
      if(now-lastSentAt>=8000 || moved>=25){ lastSentAt=now; await publish(point); }
    },err=>{
      const msg=err.code===1?'Location permission was denied. Enable location access to join live crowd routing.':err.message;
      emit('eventflow:gps-error',{message:msg}); stop();
    },{enableHighAccuracy:true,maximumAge:4000,timeout:12000});
    emit('eventflow:gps-status',{status:'tracking'});
  }
  function stop(){
    if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;}
    emit('eventflow:gps-status',{status:'stopped'});
  }
  function getLastPoint(){return lastPoint;}
  async function getCrowdCells(){
    if(!SB) return [];
    try{
      return await SB.request?.('/rest/v1/rpc/get_crowd_cells',{method:'POST',body:JSON.stringify({p_event_id:cfg.DEMO_EVENT_ID})}) || [];
    }catch(e){
      // Fallback when request is not exposed by the tiny REST wrapper.
      try{
        const base=(cfg.SUPABASE_URL||'').replace(/\/$/,'');
        const key=cfg.SUPABASE_PUBLISHABLE_KEY||'';
        const session=SB.getSession?.();
        const res=await fetch(base+'/rest/v1/rpc/get_crowd_cells',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${session?.access_token||key}`,'Content-Type':'application/json'},body:JSON.stringify({p_event_id:cfg.DEMO_EVENT_ID})});
        return res.ok?await res.json():[];
      }catch{return []}
    }
  }
  window.EventFlowLiveLocation={start,stop,getLastPoint,getCrowdCells,isTracking:()=>watchId!==null};
})();

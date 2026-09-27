import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileVideo2, ImagePlus, Map, Navigation2, ScanLine, ShieldCheck, Sparkles, UploadCloud, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredEventById } from '../../services/eventStorageService';
import VideoFloorMap from '../../components/venue3d/VideoFloorMap';
import { loadPublishedSpatialTwin, loadPublishedSpatialTwinByName, loadSpatialTwin, publishSpatialTwin, saveSpatialTwin } from '../../services/spatialTwinStorage';
import type { FloorPlan, FloorPlanAnalysis, FloorPoi } from '../../types/floorPlan';
import { analyseVideoToFloorPlan } from '../../services/videoFloorAnalyzer';
import { addNotification } from '../../services/notificationService';
import {
  createVolunteerAssignment, createHelpRequest, getEventPresence, getDisplayEventPresence, getFieldAssignments, getHelpRequests,
  nearestPoiLabel, updateFieldAssignment, updateHelpRequest, upsertEventPresence,
  type EventPresence, type FieldAssignment, type HelpRequest,
} from '../../services/eventCollaborationService';
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout';
import { OperatorLayout } from '../../components/operator/OperatorLayout';
import { AppLayout } from '../../components/layout/AppLayout';
import './venue3d.css';

type Preview = { url: string; type: 'image' | 'video'; name: string };
type BuildState = 'idle' | 'extracting' | 'analysing' | 'mapping' | 'saving' | 'ready' | 'error';
type MapRole = 'organizer' | 'operator' | 'attendee';

async function imageFileToBlob(file: File) { return file.slice(0, file.size, file.type || 'image/jpeg'); }
async function extractVideoFrames(file: File, maxFrames = 14): Promise<Blob[]> {
  const url = URL.createObjectURL(file); const video = document.createElement('video');
  video.src=url; video.muted=true; video.playsInline=true; video.preload='auto';
  await new Promise<void>((resolve,reject)=>{video.onloadedmetadata=()=>resolve();video.onerror=()=>reject(new Error('Could not read the walkthrough video.'));});
  const duration=Math.max(.5,video.duration||1), count=Math.min(maxFrames,Math.max(4,Math.ceil(duration/4.5)));
  const canvas=document.createElement('canvas'); const scale=Math.min(1,960/Math.max(1,video.videoWidth));
  canvas.width=Math.max(2,Math.round(video.videoWidth*scale));canvas.height=Math.max(2,Math.round(video.videoHeight*scale));
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas is unavailable.'); const frames:Blob[]=[];
  for(let i=0;i<count;i++){const t=Math.min(duration-.08,Math.max(.02,((i+1)/(count+1))*duration));await new Promise<void>((resolve,reject)=>{const done=()=>{video.removeEventListener('seeked',done);resolve();};video.addEventListener('seeked',done,{once:true});video.addEventListener('error',()=>reject(new Error('Could not sample the video.')),{once:true});video.currentTime=t;});ctx.drawImage(video,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',.88));if(blob)frames.push(blob);}URL.revokeObjectURL(url);return frames;
}

export default function Venue3DPage(){
  const {eventId}=useParams<{eventId:string}>(); const [search]=useSearchParams(); const {user}=useAuth();
  const role:MapRole=user?.role==='organizer'?'organizer':user?.role==='operator'?'operator':'attendee';
  const event=eventId?getStoredEventById(eventId):null; const eventName=event?.name||search.get('name')||'Live Event Venue';
  const nameKey=eventName.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const storageKey=eventId||search.get('room')||nameKey;
  const [files,setFiles]=useState<File[]>([]), [previews,setPreviews]=useState<Preview[]>([]); const [floorPlan,setFloorPlan]=useState<FloorPlan|null>(null);
  const [referenceFrames,setReferenceFrames]=useState<Blob[]>([]), [buildState,setBuildState]=useState<BuildState>('idle'); const [progress,setProgress]=useState(0);
  const [message,setMessage]=useState(''), [published,setPublished]=useState(false); const [presence,setPresence]=useState<EventPresence[]>([]);
  const [assignments,setAssignments]=useState<FieldAssignment[]>([]), [helpRequests,setHelpRequests]=useState<HelpRequest[]>([]);

  const refreshCollaboration=()=>{setPresence(getEventPresence(storageKey));setAssignments(getFieldAssignments(storageKey));setHelpRequests(getHelpRequests(storageKey));};
  const reloadMap=async()=>{
    const stored=role === 'organizer'
      ? (await loadSpatialTwin(storageKey)||await loadSpatialTwin(nameKey))
      : (loadPublishedSpatialTwin(storageKey)||loadPublishedSpatialTwin(nameKey)||loadPublishedSpatialTwinByName(eventName));
    if(stored?.floorPlan){setFloorPlan(stored.floorPlan);setReferenceFrames(stored.frames||[]);setBuildState('ready');setProgress(100);setPublished(Boolean(loadPublishedSpatialTwin(storageKey)||loadPublishedSpatialTwin(nameKey)));}
    else if(role!=='organizer'){setFloorPlan(null);setBuildState('idle');setPublished(false);}
  };

  useEffect(()=>{reloadMap().catch(()=>undefined);refreshCollaboration();},[storageKey,nameKey,role]);
  useEffect(()=>{const refresh=()=>{refreshCollaboration();reloadMap().catch(()=>undefined);};window.addEventListener('eventflow_collaboration_updated',refresh);window.addEventListener('eventflow_floor_plan_updated',refresh);window.addEventListener('storage',refresh);const t=window.setInterval(refresh,4000);return()=>{window.removeEventListener('eventflow_collaboration_updated',refresh);window.removeEventListener('eventflow_floor_plan_updated',refresh);window.removeEventListener('storage',refresh);clearInterval(t);};},[storageKey,nameKey,role]);
  useEffect(()=>{const next=files.slice(0,8).map(file=>({url:URL.createObjectURL(file),type:file.type.startsWith('video/')?'video' as const:'image' as const,name:file.name}));setPreviews(next);return()=>next.forEach(x=>URL.revokeObjectURL(x.url));},[files]);
  const summary=useMemo(()=>({images:files.filter(f=>f.type.startsWith('image/')).length,videos:files.filter(f=>f.type.startsWith('video/')).length}),[files]);
  const displayPresence=useMemo(()=>floorPlan ? getDisplayEventPresence(storageKey,floorPlan,role!=='attendee',role==='organizer'?34:24) : presence,[presence,floorPlan,role,storageKey]);

  const persistPlan=async(plan:FloorPlan,frames=referenceFrames)=>{setFloorPlan(plan);setPublished(false);const record={id:`${storageKey}-${Date.now()}`,eventId:storageKey,eventName,createdAt:Date.now(),frames,floorPlan:plan,published:false};await saveSpatialTwin(record);if(nameKey!==storageKey)await saveSpatialTwin({...record,id:`${nameKey}-${Date.now()}`,eventId:nameKey});};
  const buildFloorMap=async()=>{if(!files.length){setMessage('Add venue photos or a walkthrough video first.');return;}try{setMessage('');setBuildState('extracting');setProgress(20);const video=files.find(f=>f.type.startsWith('video/'));let frames:Blob[]=[];if(video)frames=await extractVideoFrames(video,14);const images=files.filter(f=>f.type.startsWith('image/')).slice(0,Math.max(0,14-frames.length));frames.push(...await Promise.all(images.map(imageFileToBlob)));if(!frames.length)throw new Error('No usable venue frames could be extracted.');setBuildState('analysing');setProgress(48);const sourceKind:FloorPlanAnalysis['sourceKind']=video&&images.length?'mixed':video?'video':'photos';const plan=await analyseVideoToFloorPlan(frames,sourceKind,(v,s)=>{setProgress(Math.max(45,Math.min(88,v)));if(s)setMessage(s);});setBuildState('mapping');setProgress(88);setReferenceFrames(frames);setBuildState('saving');setProgress(92);await persistPlan(plan,frames);setProgress(100);setBuildState('ready');setMessage('Draft map ready. Verify points, then publish.');}catch(e){setBuildState('error');setMessage(e instanceof Error?e.message:'Could not create the floor map.');}};

  const requestOperatorHelp=(operator:FloorPoi)=>{const now=new Date();const attendeeName=user?.fullName||user?.name||'Attendee';const me=getEventPresence(storageKey).find(p=>p.userId===user?.id);const locationLabel=me?.sourceLabel||floorPlan?.pois.find(p=>p.type==='gate')?.label||'indoor route';const req=createHelpRequest({eventId:storageKey,attendeeId:user?.id||'guest-attendee',attendeeName,operatorId:operator.id,operatorLabel:operator.label.replace(/Volunteer/ig,'Operator'),location:{x:me?.x??operator.x,y:me?.y??operator.y,label:locationLabel}});addNotification({notificationId:`help-org-${req.id}`,userId:'organizer',role:'organizer',eventId:storageKey,type:'WARNING',title:'Attendee help request',message:`${attendeeName} · ${locationLabel} · ${req.operatorLabel}`,createdAt:now.toISOString(),read:false,source:'Indoor Map',relatedResourceId:operator.id,actionLink:eventId?`/operations/events/${eventId}/3d-venue`:'/operations/events'});addNotification({notificationId:`help-op-${req.id}`,userId:'operator',role:'operator',eventId:storageKey,type:'WARNING',title:'Help request assigned',message:`${attendeeName} needs help near ${locationLabel}.`,createdAt:now.toISOString(),read:false,source:'Indoor Map',relatedResourceId:operator.id,actionLink:eventId?`/operators/events/${eventId}/venue-map`:'/operators/events'});addNotification({notificationId:`help-att-${req.id}`,userId:user?.id||'all_attendees',role:'attendee',eventId:storageKey,type:'INFO',title:'Help requested',message:`${req.operatorLabel} has been notified.`,createdAt:now.toISOString(),read:false,source:'Indoor Map',relatedResourceId:operator.id});refreshCollaboration();setMessage(`Help request sent to ${req.operatorLabel}.`);};
  const shareInsideEvent=(source:FloorPoi)=>{const commit=(geo?:GeolocationPosition)=>{upsertEventPresence({userId:user?.id||'guest-attendee',name:user?.fullName||user?.name||'Attendee',eventId:storageKey,x:source.x,y:source.y,inside:true,lat:geo?.coords.latitude,lng:geo?.coords.longitude,accuracy:geo?.coords.accuracy,sourceLabel:source.label,updatedAt:Date.now()});refreshCollaboration();setMessage(`Live location shared at ${source.label}.`);};navigator.geolocation?navigator.geolocation.getCurrentPosition(commit,()=>commit(),{enableHighAccuracy:true,timeout:8000}):commit();};
  const sourceChanged=(source:FloorPoi)=>{if(role!=='attendee'||!user)return;const existing=getEventPresence(storageKey).find(p=>p.userId===user.id);if(existing?.inside){upsertEventPresence({...existing,x:source.x,y:source.y,sourceLabel:source.label,updatedAt:Date.now()});refreshCollaboration();}};
  const operatorMoved=(operator:FloorPoi,from:{x:number;y:number},to:{x:number;y:number})=>{if(!floorPlan||role!=='organizer')return;const fromLabel=nearestPoiLabel(floorPlan.pois,from.x,from.y),toLabel=nearestPoiLabel(floorPlan.pois,to.x,to.y);const a=createVolunteerAssignment({eventId:storageKey,volunteer:operator,from:{...from,label:fromLabel},to:{...to,label:toLabel},createdBy:user?.fullName||user?.name||'Organizer'});const now=new Date().toISOString();addNotification({notificationId:`assign-op-${a.id}`,userId:'operator',role:'operator',eventId:storageKey,type:'WARNING',title:'New field assignment',message:`${operator.label.replace(/Volunteer/ig,'Operator')}: ${a.message}`,createdAt:now,read:false,source:'Crowd Map',relatedResourceId:operator.id,actionLink:eventId?`/operators/events/${eventId}/venue-map`:'/operators/events'});refreshCollaboration();setMessage(`${operator.label.replace(/Volunteer/ig,'Operator')} dispatched to ${toLabel}.`);};
  const publishMap=()=>{if(!floorPlan)return;const ok=publishSpatialTwin(storageKey,eventName,floorPlan);if(nameKey!==storageKey)publishSpatialTwin(nameKey,eventName,floorPlan);setPublished(ok);setMessage(ok?'Published to attendee + operator views.':'Could not publish map.');};

  const buildLabel:Record<BuildState,string>={idle:'Generate Floor Map',extracting:'Sampling…',analysing:'Analysing…',mapping:'Mapping…',saving:'Saving…',ready:'Regenerate',error:'Try Again'};
  const backTo=role==='organizer'?(eventId?`/operations/events/${eventId}`:'/operations'):role==='operator'?(eventId?`/operators/events/${eventId}`:'/operators/events'):'/my-event';
  const page = <div className="v3d-page floor-page"><div className="v3d-wrap"><Link className="v3d-back" to={backTo}><ArrowLeft size={15}/> Back</Link>
    <div className="v3d-head floor-head"><div><div className="v3d-eyebrow"><Map size={15}/> Indoor Map</div><h1>{eventName}</h1><p>{role==='organizer'?'Build · verify · publish':role==='operator'?'Attendees · assignments · help':'Navigate · locate operator · request help'}</p></div><span className="v3d-role">{role.toUpperCase()}</span></div>
    <div className="v3d-kpis floor-kpis"><div><ImageIcon size={19}/><span><b>{summary.images||referenceFrames.length}</b> views</span></div><div><Video size={19}/><span><b>{summary.videos}</b> video</span></div><div><ShieldCheck size={19}/><span><b>{displayPresence.length}</b> inside{role!=='attendee'?' · demo':''}</span></div></div>
    <div className="v3d-grid floor-grid"><div className="v3d-card v3d-main-card floor-main-card">{floorPlan?<VideoFloorMap plan={floorPlan} eventName={eventName} role={role} onPlanChange={role==='organizer'?(p)=>persistPlan(p).catch(()=>undefined):undefined} onRequestHelp={role==='attendee'?requestOperatorHelp:undefined} onVolunteerMoved={role==='organizer'?operatorMoved:undefined} onSourceChange={role==='attendee'?sourceChanged:undefined} onInsideEvent={role==='attendee'?shareInsideEvent:undefined} onAssignmentStatus={role==='operator'?(id,status)=>{updateFieldAssignment(storageKey,id,status);refreshCollaboration();}:undefined} onHelpStatus={role==='operator'?(id,status)=>{updateHelpRequest(storageKey,id,status);refreshCollaboration();}:undefined} liveAttendees={displayPresence} assignments={assignments} helpRequests={helpRequests}/>:previews.length?<div className="reference-workspace capture-ready floor-reference"><div className="capture-overlay"><ScanLine size={17}/><span>Reference ready</span></div><div className="reference-main">{previews[0].type==='video'?<video src={previews[0].url} controls playsInline className="reference-hero-media"/>:<img src={previews[0].url} alt={previews[0].name} className="reference-hero-media"/>}</div></div>:<div className="reconstruction-empty floor-empty"><div className="reconstruction-icon"><UploadCloud size={34}/></div><h2>{role==='organizer'?'Add venue walkthrough':'Published map unavailable'}</h2><p>{role==='organizer'?'Video/photos → operational map':'Ask the organizer to publish this event map.'}</p></div>}</div>
      <aside className="v3d-side">{role==='organizer'&&<div className="v3d-card v3d-builder-card floor-builder-card"><div className="v3d-card-title"><FileVideo2 size={17}/><h3>Map builder</h3></div><div className="v3d-upload compact"><input id="v3d-files" type="file" accept="image/*,video/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/><label htmlFor="v3d-files"><ImagePlus size={22}/><strong>Add video / photos</strong><span>Analyse venue structure</span></label></div><button className="v3d-generate" disabled={['extracting','analysing','mapping','saving'].includes(buildState)} onClick={buildFloorMap}>{buildState==='ready'?<CheckCircle2 size={17}/>:<Sparkles size={17}/>} {buildLabel[buildState]}</button>{floorPlan&&<button className="v3d-generate" style={{background:published?'#2e7a66':'#0B1120'}} onClick={publishMap}><ShieldCheck size={17}/>{published?'Published':'Publish map'}</button>}{buildState!=='idle'&&<div className="spatial-progress"><span style={{width:`${progress}%`}}/><small>{progress}%</small></div>}{message&&<div className={`spatial-message ${buildState==='error'?'error':''}`}>{message}</div>}</div>}
        <div className="v3d-card spatial-method-card floor-method-card"><div className="v3d-card-title"><Navigation2 size={17}/><h3>Live status</h3></div><div className="spatial-method-list compact-flow"><span><b>{presence.length}</b> attendees</span><span><b>{assignments.filter(a=>a.status!=='DONE').length}</b> assignments</span><span><b>{helpRequests.filter(h=>h.status!=='RESOLVED').length}</b> help</span></div></div>
      </aside></div></div></div>;
  if (role === 'organizer') return <OrganizerLayout activeEvent={event} pageTitle="Indoor Venue Map" pageBadge="MAP">{page}</OrganizerLayout>;
  if (role === 'operator') return <OperatorLayout title="Indoor Venue Map" subtitle={eventName} pageBadge="MAP">{page}</OperatorLayout>;
  return <AppLayout pageTitle="Indoor Venue Map" pageBadge="LIVE MAP">{page}</AppLayout>;
}

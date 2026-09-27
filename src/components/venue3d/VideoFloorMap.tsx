import React, { useMemo, useRef, useState } from 'react';
import { LocateFixed, Navigation2, Shield, Users, Radio, CheckCircle2, MapPin, UserRound, LifeBuoy, Search } from 'lucide-react';
import type { FloorPlan, FloorPoi } from '../../types/floorPlan';
import type { EventPresence, FieldAssignment, HelpRequest } from '../../services/eventCollaborationService';

type Props = {
  plan: FloorPlan;
  eventName: string;
  role: 'organizer' | 'operator' | 'attendee';
  onPlanChange?: (plan: FloorPlan) => void;
  onRequestHelp?: (operator: FloorPoi) => void;
  onVolunteerMoved?: (operator: FloorPoi, from: {x:number;y:number}, to: {x:number;y:number}) => void;
  onSourceChange?: (poi: FloorPoi) => void;
  onInsideEvent?: (source: FloorPoi) => void;
  onAssignmentStatus?: (id:string,status:FieldAssignment['status'])=>void;
  onHelpStatus?: (id:string,status:HelpRequest['status'])=>void;
  liveAttendees?: EventPresence[];
  assignments?: FieldAssignment[];
  helpRequests?: HelpRequest[];
};

const poiColor: Record<FloorPoi['type'], string> = {
  gate:'#183f69', medical:'#b94b56', food:'#9a7745', washroom:'#59758c', help:'#315f97', exit:'#a14a4a', volunteer:'#2e7a66', stage:'#6d547c', seat:'#294d75',
};

function routePath(source: FloorPoi, destination: FloorPoi, plan: FloorPlan) {
  const walkway = plan.walkways[0] || [];
  if (walkway.length < 2) return `M ${source.x} ${source.y} L ${destination.x} ${destination.y}`;
  const nearestIndex = (poi: FloorPoi) => {
    let best = 0, bestDistance = Number.POSITIVE_INFINITY;
    walkway.forEach(([x, y], index) => {
      const d = Math.hypot(x - poi.x, y - poi.y);
      if (d < bestDistance) { bestDistance = d; best = index; }
    });
    return best;
  };
  const a = nearestIndex(source), b = nearestIndex(destination);
  const routePoints = a <= b ? walkway.slice(a, b + 1) : walkway.slice(b, a + 1).reverse();
  const points: Array<[number, number]> = [[source.x, source.y], ...routePoints, [destination.x, destination.y]];
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

export default function VideoFloorMap({
  plan, eventName, role, onPlanChange, onRequestHelp, onVolunteerMoved, onSourceChange, onInsideEvent,
  onAssignmentStatus, onHelpStatus, liveAttendees = [], assignments = [], helpRequests = [],
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const navigable = useMemo(() => plan.pois.filter(p => p.type !== 'volunteer'), [plan.pois]);
  const [sourceId, setSourceId] = useState(() => plan.pois.find(p=>p.type==='gate')?.id || navigable[0]?.id || '');
  const [destinationId, setDestinationId] = useState(() => plan.pois.find(p=>p.type==='seat')?.id || plan.pois.find(p=>p.type==='medical')?.id || navigable[1]?.id || '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [destinationSearch, setDestinationSearch] = useState('');
  const dragStart = useRef<{id:string;x:number;y:number} | null>(null);

  const source = plan.pois.find(p=>p.id===sourceId) || navigable[0];
  const destination = plan.pois.find(p=>p.id===destinationId) || navigable[1] || source;
  const selected = plan.pois.find(p=>p.id===selectedId) || null;
  const operators = plan.pois.filter(p=>p.type==='volunteer');
  const route = source && destination ? routePath(source, destination, plan) : '';
  const nearestOperator = source && operators.length ? [...operators].sort((a,b)=>Math.hypot(a.x-source.x,a.y-source.y)-Math.hypot(b.x-source.x,b.y-source.y))[0] : operators[0];
  const activeAssignments = assignments.filter(a => a.status !== 'DONE');
  const activeHelp = helpRequests.filter(h=>h.status!=='RESOLVED');
  const destinationMatches = destinationSearch.trim()
    ? navigable.filter(p=>p.label.toLowerCase().includes(destinationSearch.trim().toLowerCase())).slice(0,5)
    : [];
  const nearbyOperators = source ? [...operators].sort((a,b)=>Math.hypot(a.x-source.x,a.y-source.y)-Math.hypot(b.x-source.x,b.y-source.y)).slice(0,3) : operators.slice(0,3);

  const updatePoi = (id: string, x: number, y: number) => {
    if (!onPlanChange) return;
    onPlanChange({
      ...plan,
      pois: plan.pois.map(p => p.id===id ? { ...p, x:Math.max(28,Math.min(plan.width-28,x)), y:Math.max(28,Math.min(plan.height-28,y)) } : p),
    });
  };

  const pointerToSvg = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const matrix = svg.getScreenCTM(); if (!matrix) return null;
    const mapped = pt.matrixTransform(matrix.inverse());
    return { x:mapped.x, y:mapped.y };
  };

  const finishDrag = () => {
    if (!dragId) return;
    const original = dragStart.current;
    const moved = plan.pois.find(p => p.id === dragId);
    if (original && moved?.type === 'volunteer' && onVolunteerMoved && (Math.abs(original.x-moved.x) > 3 || Math.abs(original.y-moved.y) > 3)) {
      onVolunteerMoved(moved, {x:original.x,y:original.y}, {x:moved.x,y:moved.y});
    }
    dragStart.current = null;
    setDragId(null);
  };

  return <div className="floor-map-shell">
    <div className="floor-map-topline">
      <div><span>INDOOR OPERATIONS MAP</span><strong>{eventName}</strong><small>{liveAttendees.filter(p=>!p.simulated).length} live + {liveAttendees.filter(p=>p.simulated).length} demo · {operators.length} operators · {activeHelp.length} help request{activeHelp.length===1?'':'s'}</small></div>
      <div className="floor-map-live"><i/> LIVE</div>
    </div>

    <div className="floor-plan-stage">
      <svg ref={svgRef} className="floor-plan-svg" viewBox={`0 0 ${plan.width} ${plan.height}`} role="img" aria-label={`${eventName} indoor floor map`}
        onPointerMove={(e)=>{ if (!dragId || role!=='organizer') return; const pt=pointerToSvg(e); if(pt) updatePoi(dragId,pt.x,pt.y); }}
        onPointerUp={finishDrag} onPointerLeave={finishDrag}>
        <defs><pattern id="floorGridLarge" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(30,53,79,.065)" strokeWidth="1"/></pattern></defs>
        <rect x="12" y="12" width={plan.width-24} height={plan.height-24} rx="24" className="fp-base"/>
        <rect x="12" y="12" width={plan.width-24} height={plan.height-24} rx="24" fill="url(#floorGridLarge)"/>
        {plan.zones.map(zone => <g key={zone.id}><rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={zone.radius || 14} className={`floor-zone floor-zone-${zone.type}`}/><text x={zone.x+zone.w/2} y={zone.y+26} textAnchor="middle" className="floor-zone-label">{zone.label}</text></g>)}
        {plan.walkways.map((way,i)=><polyline key={i} points={way.map(p=>p.join(',')).join(' ')} className="floor-walkway"/>)}
        {route && <><path d={route} className="fp-route-shadow floor-route-wide"/><path d={route} className="fp-route floor-route-wide"/></>}
        {liveAttendees.map((p, index) => <g key={`${p.userId}-${index}`} transform={`translate(${p.x} ${p.y})`} className="floor-live-attendee"><circle r={p.simulated?11:16} fill={p.simulated?'rgba(124,92,255,.13)':'rgba(79,124,255,.18)'} stroke={p.simulated?'#7C5CFF':'#4F7CFF'} strokeWidth="2" strokeDasharray={p.simulated?'3 2':undefined}/><circle r={p.simulated?4:6} fill={p.simulated?'#7C5CFF':'#4F7CFF'}/>{!p.simulated&&<><rect x="-48" y="20" width="96" height="22" rx="8" fill="#0B1120" opacity=".92"/><text y="35" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{p.name || 'Attendee'}</text></>}</g>)}
        {plan.pois.map(p => {
          const isSelected = selectedId===p.id, isSource = sourceId===p.id, isDest = destinationId===p.id;
          const task = p.type === 'volunteer' ? activeAssignments.find(a => a.assigneeId === p.id) : null;
          const help = p.type==='volunteer' ? activeHelp.find(h=>h.operatorId===p.id) : null;
          return <g key={p.id} className={`floor-poi-node ${isSelected?'selected':''} ${role==='organizer'?'draggable':''}`} transform={`translate(${p.x} ${p.y})`}
            onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(p.id); if(role==='organizer'&&p.type==='volunteer'){ setDragId(p.id); dragStart.current={id:p.id,x:p.x,y:p.y}; (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId); } }}
            onClick={()=>setSelectedId(p.id)}>
            {(isSource || isDest) && <circle r="19" className={isSource?'floor-source-ring':'floor-destination-ring'}/>} 
            <circle r={p.type==='volunteer'?12:14} fill={poiColor[p.type]} className="floor-poi-dot"/><circle r="4" fill="#fff" opacity=".92"/>
            {task && <circle r="18" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 3"/>}
            {help && <circle r="22" fill="none" stroke="#dc2626" strokeWidth="2.5"/>}
            <rect x="-54" y="20" width="108" height="24" rx="8" className="floor-poi-label-bg"/><text y="36" textAnchor="middle" className="floor-poi-label">{p.type==='volunteer'?p.label.replace(/Volunteer/ig,'Operator'):p.label}</text>
          </g>;
        })}
      </svg>

      <div className="floor-map-legend"><span><i className="route"/>Route</span><span><i className="poi"/>Facility</span><span><i className="vol"/>Operator</span><span><i style={{background:'#4F7CFF'}}/>Live attendee</span><span><i style={{background:'#7C5CFF'}}/>Demo movement</span>{role==='organizer'&&<span className="drag-hint">Drag operator → dispatch</span>}</div>
      {selected && <div className="floor-poi-card"><small>{selected.type==='volunteer'?'FIELD OPERATOR':selected.type.toUpperCase()}</small><strong>{selected.type==='volunteer'?selected.label.replace(/Volunteer/ig,'Operator'):selected.label}</strong>
        <span>{selected.type==='volunteer' ? `${selected.status || 'available'} · ${source?Math.round(Math.hypot(selected.x-source.x,selected.y-source.y)):'—'} map units away` : 'Indoor navigation point'}</span>
        {selected.type==='volunteer' && role==='attendee' && onRequestHelp && <button onClick={()=>onRequestHelp(selected)}><LifeBuoy size={13}/> Request help</button>}
        {selected.type!=='volunteer'&&<button onClick={()=>setDestinationId(selected.id)}>Navigate here</button>}
      </div>}
    </div>

    {role==='attendee' && <div className="floor-destination-search">
      <div className="floor-search-box"><Search size={16}/><input value={destinationSearch} onChange={e=>setDestinationSearch(e.target.value)} placeholder="Search destination: gate, seat, food, help…" aria-label="Search indoor destination"/></div>
      {destinationMatches.length>0 && <div className="floor-search-results">{destinationMatches.map(p=><button key={p.id} type="button" onClick={()=>{setDestinationId(p.id);setSelectedId(p.id);setDestinationSearch(p.label);}}><MapPin size={13}/><span>{p.label}</span><small>{p.type}</small></button>)}</div>}
    </div>}

    <div className="floor-map-controls">
      <label><span>FROM</span><select value={sourceId} onChange={e=>{setSourceId(e.target.value); const poi=plan.pois.find(p=>p.id===e.target.value); if(poi) onSourceChange?.(poi);}}>{navigable.map(p=><option value={p.id} key={p.id}>{p.label}</option>)}</select></label>
      <Navigation2 size={18}/><label><span>TO</span><select value={destinationId} onChange={e=>setDestinationId(e.target.value)}>{navigable.filter(p=>p.id!==sourceId).map(p=><option value={p.id} key={p.id}>{p.label}</option>)}</select></label>
      <div className="floor-route-summary"><strong>{source?.label || 'Start'} → {destination?.label || 'Destination'}</strong><span>{role==='attendee'?'Follow highlighted route':role==='operator'?'Live field route':'Drag operators to rebalance'}</span></div>
    </div>

    <div className="floor-map-statusbar">
      <div><LocateFixed size={14}/><span><b>{role==='attendee'?'Your indoor position':'Live position layer'}</b><small>{source?.label || 'Entry'}</small></span></div>
      {role==='attendee' && source && <button type="button" className="floor-help-button" onClick={()=>onInsideEvent?.(source)}><Radio size={13}/> I’m inside</button>}
      <div className="floor-help-status"><Users size={14}/><span><b>{operators.filter(v=>v.status!=='busy').length || operators.length} operators nearby</b><small>{nearestOperator?.label.replace(/Volunteer/ig,'Operator') || 'Team ready'}</small></span>{role==='attendee' && nearestOperator && onRequestHelp && <button type="button" className="floor-help-button" onClick={()=>onRequestHelp(nearestOperator)}>Call help</button>}</div>
      <div><Shield size={14}/><span><b>{activeAssignments.length ? `${activeAssignments.length} field task${activeAssignments.length>1?'s':''}` : 'Route clear'}</b><small>{activeAssignments[0]?.message || 'No blocked segment'}</small></span></div>
    </div>

    {role==='attendee' && nearbyOperators.length>0 && <div className="floor-nearby-operators">
      <div className="floor-nearby-head"><Users size={15}/><strong>Nearby operators</strong><span>{nearbyOperators.length} available nearby</span></div>
      <div className="floor-nearby-grid">{nearbyOperators.map(op=>{const d=source?Math.round(Math.hypot(op.x-source.x,op.y-source.y)):0;return <button key={op.id} type="button" className="floor-operator-card" onClick={()=>setSelectedId(op.id)}><span className="floor-operator-dot"/><span><b>{op.label.replace(/Volunteer/ig,'Operator')}</b><small>{op.status||'available'} · {d} map units away</small></span><LifeBuoy size={15}/></button>})}</div>
    </div>}

    {role==='operator' && (activeAssignments.length>0 || activeHelp.length>0) && <div className="mt-3 grid gap-2 md:grid-cols-2">
      {activeHelp.slice(0,4).map(h=><div key={h.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-[#0B1120]"><div className="flex items-center gap-2"><LifeBuoy size={14} className="text-rose-600"/><strong>{h.attendeeName} needs help</strong></div><div className="mt-1 text-[#6B6252]">{h.location.label} · {h.operatorLabel.replace(/Volunteer/ig,'Operator')}</div><div className="mt-2 flex gap-2">{h.status==='NEW'&&<button className="rounded-lg bg-[#4F7CFF] px-2 py-1 font-bold text-white" onClick={()=>onHelpStatus?.(h.id,'ACKNOWLEDGED')}>Acknowledge</button>}<button className="rounded-lg bg-emerald-600 px-2 py-1 font-bold text-white" onClick={()=>onHelpStatus?.(h.id,'RESOLVED')}>Resolved</button></div></div>)}
      {activeAssignments.slice(0,4).map(a=><div key={a.id} className="rounded-xl border border-[#C9D9F7] bg-[#F7FAFF] p-3 text-xs text-[#0B1120]"><div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#4F7CFF]"/><strong>{a.assigneeLabel.replace(/Volunteer/ig,'Operator')}</strong></div><div className="mt-1 text-[#6B6252]">{a.message}</div><div className="mt-2 flex gap-2">{a.status==='NEW'&&<button className="rounded-lg bg-[#4F7CFF] px-2 py-1 font-bold text-white" onClick={()=>onAssignmentStatus?.(a.id,'ACKNOWLEDGED')}>Acknowledge</button>}<button className="rounded-lg bg-emerald-600 px-2 py-1 font-bold text-white" onClick={()=>onAssignmentStatus?.(a.id,'DONE')}>Done</button></div></div>)}
    </div>}
  </div>;
}

import React from 'react';
import type { FloorPlan } from '../../types/floorPlan';
import type { EventPresence } from '../../services/eventCollaborationService';

export const CrowdPresenceMiniMap: React.FC<{ plan: FloorPlan; attendees: EventPresence[] }> = ({ plan, attendees }) => {
  const operators=plan.pois.filter(p=>p.type==='volunteer');
  const live=attendees.filter(a=>!a.simulated).length;
  const simulated=attendees.filter(a=>a.simulated).length;
  return <div className="overflow-hidden rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF]">
    <div className="flex items-center justify-between border-b border-[#C9D9F7] px-3 py-2"><div><b className="text-xs text-[#0B1120]">Published venue movement</b><span className="ml-2 text-[10px] text-[#6B6252]">attendees + operators</span></div><span className="rounded-full bg-[#E8F0FF] px-2 py-1 text-[10px] font-bold text-[#1F56C5]">LIVE + DEMO</span></div>
    <svg viewBox={`0 0 ${plan.width} ${plan.height}`} className="h-[280px] w-full" aria-label="Live attendee crowd map">
      <rect x="10" y="10" width={plan.width-20} height={plan.height-20} rx="22" fill="#F7FAFF" stroke="#C9D9F7"/>
      {plan.zones.map(z=><g key={z.id}><rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.radius||12} fill="#EAF2FF" stroke="#B8CBE7"/><text x={z.x+z.w/2} y={z.y+22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#294D75">{z.label}</text></g>)}
      {plan.walkways.map((w,i)=><polyline key={i} points={w.map(p=>p.join(',')).join(' ')} fill="none" stroke="#A8BDD7" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/>)}
      {attendees.map((a,i)=><g key={`${a.userId}-${i}`} transform={`translate(${a.x} ${a.y})`}><circle r={a.simulated?10:14} fill={a.simulated?'rgba(124,92,255,.12)':'rgba(79,124,255,.14)'} stroke={a.simulated?'#7C5CFF':'#4F7CFF'} strokeWidth="2" strokeDasharray={a.simulated?'3 2':undefined}/><circle r="4" fill={a.simulated?'#7C5CFF':'#4F7CFF'}/></g>)}
      {operators.map((op,i)=><g key={op.id} transform={`translate(${op.x} ${op.y})`}><rect x="-8" y="-8" width="16" height="16" rx="5" fill="#0B1120" stroke="#DDBE7A" strokeWidth="2"/><circle r="3" fill="#DDBE7A"/><text y="-13" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0B1120">OP{i+1}</text></g>)}
    </svg>
    <div className="grid grid-cols-3 border-t border-[#C9D9F7] text-center text-[10px]"><div className="p-2"><b className="block text-sm text-[#0B1120]">{live}</b><span className="text-[#6B6252]">Opted-in</span></div><div className="border-x border-[#C9D9F7] p-2"><b className="block text-sm text-[#5B45D6]">{simulated}</b><span className="text-[#6B6252]">Demo people</span></div><div className="p-2"><b className="block text-sm text-[#0B1120]">{operators.length}</b><span className="text-[#6B6252]">Operators</span></div></div>
  </div>;
};

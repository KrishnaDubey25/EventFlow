import React, { useMemo, useState } from 'react';
import { Bot, Send, X, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTicket } from '../../context/TicketContext';
import { getOrganizerEvents, getAllPublishedEvents } from '../../services/eventStorageService';
import { getNotificationsForRole } from '../../services/notificationService';
import { getOperatorResources } from '../../services/operatorResourceService';
import { getEventPresence, getFieldAssignments } from '../../services/eventCollaborationService';
import { loadPublishedSpatialTwin } from '../../services/spatialTwinStorage';
import { normalizeOperatorType, OperatorUser } from '../../types/auth';
import { askNugenRoleAssistant, type RoleAssistantMessage } from '../../services/nugenRoleAssistantService';

export const NugenRoleAssistant: React.FC = () => {
  const { user } = useAuth();
  const { userTickets } = useTicket();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<RoleAssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const context = useMemo(() => {
    if (!user) return {};
    const notifications = getNotificationsForRole(user.role, user.id).slice(0, 8).map(n => ({ title:n.title, message:n.message, eventId:n.eventId }));
    if (user.role === 'attendee') {
      const mapContext = userTickets.slice(0, 8).map(t => {
        const twin = loadPublishedSpatialTwin(t.eventId);
        return twin?.floorPlan ? {
          eventId: t.eventId,
          publishedIndoorMap: true,
          places: twin.floorPlan.pois.slice(0, 16).map(p => ({ label:p.label, type:p.type })),
          ownSharedPosition: getEventPresence(t.eventId).find(p => p.userId === user.id)?.sourceLabel || null,
        } : { eventId:t.eventId, publishedIndoorMap:false };
      });
      return {
        role: 'attendee',
        tickets: userTickets.map(t => ({ eventName:t.eventName, eventId:t.eventId, gate:t.assignedGate, section:t.section, seat:t.seat })),
        publishedEvents: getAllPublishedEvents().slice(0, 8).map(e => ({ id:e.id, name:e.name, venue:e.venue, date:e.date, time:e.time })),
        indoorNavigation: mapContext,
        notifications,
      };
    }
    if (user.role === 'organizer') {
      const events = getOrganizerEvents(user.id);
      return {
        role: 'organizer',
        events: events.map(e => ({
          id:e.id, name:e.name, venue:e.venue, visibility:e.visibility, expectedAttendance:e.expectedAttendance, capacity:e.capacity,
          indoorMapPublished:Boolean(loadPublishedSpatialTwin(e.id)),
          attendeesInside:getEventPresence(e.id).filter(p=>p.inside).length,
          activeFieldTasks:getFieldAssignments(e.id).filter(a=>a.status!=='DONE').length,
        })),
        notifications,
      };
    }
    const operator = user as OperatorUser;
    const resources = getOperatorResources(user.id, normalizeOperatorType(operator.operatorType));
    const assignedEventIds = Array.from(new Set(resources.flatMap(r => r.assignedEventIds || [])));
    return {
      role: 'operator',
      operatorType: operator.operatorType,
      resources: resources.slice(0, 16).map(r => ({ id:r.id, name:r.name, status:r.status, capacity:r.capacity, available:r.availableCapacity, location:r.location, assignedEventIds:r.assignedEventIds || [] })),
      fieldOperations: assignedEventIds.slice(0, 8).map(eventId => ({
        eventId,
        indoorMapPublished:Boolean(loadPublishedSpatialTwin(eventId)),
        attendeesInside:getEventPresence(eventId).filter(p=>p.inside).length,
        assignments:getFieldAssignments(eventId).filter(a=>a.status!=='DONE').slice(0,8).map(a=>({ volunteer:a.volunteerLabel, from:a.from.label, to:a.to.label, status:a.status })),
      })),
      notifications,
    };
  }, [user, userTickets, open]);

  if (!user) return null;

  const send = async () => {
    const q = question.trim(); if (!q || loading) return;
    const next = [...messages, { role:'user' as const, content:q }];
    setMessages(next); setQuestion(''); setLoading(true);
    try {
      const result = await askNugenRoleAssistant({ role:user.role, question:q, context, history:messages.slice(-6) });
      setMessages([...next, { role:'assistant', content:result.answer }]);
    } catch (error) {
      setMessages([...next, { role:'assistant', content:error instanceof Error ? error.message : 'Nugen assistant is unavailable.' }]);
    } finally { setLoading(false); }
  };

  return <>
    <button onClick={()=>setOpen(v=>!v)} className="fixed bottom-5 right-5 z-[80] flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6EA8FF]/30 bg-[#102A43] text-[#F5EFE2] shadow-xl hover:bg-[#163a61]" title="Nugen AI Assistant"><Bot className="h-5 w-5"/></button>
    {open && <div className="fixed bottom-20 right-5 z-[80] w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-[#6EA8FF]/25 bg-[#0B1120] text-[#F5EFE2] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><div className="rounded-xl bg-[#4F7CFF]/15 p-2 text-[#78B7FF]"><Sparkles className="h-4 w-4"/></div><div><div className="text-xs font-black">Nugen · {user.role}</div><div className="text-[10px] text-[#9FB3CC]">Role-scoped EventFlow assistant</div></div></div><button onClick={()=>setOpen(false)} className="rounded-lg p-1.5 text-[#9FB3CC] hover:bg-white/10"><X className="h-4 w-4"/></button></div>
      <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">{messages.length===0?<div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-xs text-[#C7D8EF]"><ShieldCheck className="mb-2 h-4 w-4 text-[#78B7FF]"/>Ask about your {user.role} workflow only. The aligned model is blocked from other-role or outside information.</div>:messages.map((m,i)=><div key={i} className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${m.role==='user'?'ml-auto bg-[#4F7CFF] text-white':'bg-white/[.07] text-[#E5EDF8]'}`}>{m.content}</div>)}{loading&&<div className="rounded-2xl bg-white/[.07] px-3 py-2 text-xs text-[#9FB3CC]">Thinking…</div>}</div>
      <div className="flex gap-2 border-t border-white/10 p-3"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder={`Ask ${user.role} assistant…`} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#71869f] focus:border-[#6EA8FF]/50"/><button onClick={send} disabled={!question.trim()||loading} className="rounded-xl bg-[#4F7CFF] px-3 text-white disabled:opacity-40"><Send className="h-4 w-4"/></button></div>
    </div>}
  </>;
};

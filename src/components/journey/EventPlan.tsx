import type { AppEvent } from '../../types/event';
import type { EventFlowTicket } from '../../types/booking';
import { CalendarDays, MapPin, Ticket, Clock3, DoorOpen, UtensilsCrossed, ShieldCheck, HeartPulse } from 'lucide-react';
import './eventPlan.css';

export function EventPlan({event,ticket,action}:{event:AppEvent;ticket?:EventFlowTicket;action?:React.ReactNode}){
 const schedule=event.schedule?.slice(0,4)||[];
 const food=event.hospitality.find(h=>h.type==='f&b');
 const medical=event.medicalAssistance?.[0] || event.hospitality.find(h=>h.type==='medical');
 const help=event.eventGuide?.helpPoint;
 return <section className="ep-card ep-compact" aria-label="Event plan">
  <div className="ep-top"><div><span className="ep-label">EVENT SCHEDULE</span><h2>{event.name}</h2><p>{event.location || event.venue}</p></div>{action}</div>
  <div className="ep-facts"><span><CalendarDays size={16}/>{event.date}</span><span><Clock3 size={16}/>{event.time}</span><span><MapPin size={16}/>{event.venue}</span>{ticket&&<span><Ticket size={16}/>{ticket.assignedGate}</span>}</div>
  <div className="ep-quick-grid">
    <div className="ep-section ep-program"><div className="ep-section-head"><Clock3 size={19}/><div><h3>Schedule</h3><p>Next published moments</p></div></div>{schedule.length?<div className="ep-timeline">{schedule.map((item,i)=><div key={i}><strong>{item.time}</strong><span>{item.activity}<small>{item.location||'Venue area'}</small></span></div>)}</div>:<p className="ep-empty">Schedule pending</p>}</div>
    <div className="ep-service-grid">
      <div className="ep-service-chip"><DoorOpen size={17}/><span><b>{ticket?.assignedGate||'Gate'}</b><small>Entry</small></span></div>
      <div className="ep-service-chip"><UtensilsCrossed size={17}/><span><b>{food?.location||'Food zone'}</b><small>Food</small></span></div>
      <div className="ep-service-chip"><HeartPulse size={17}/><span><b>{(medical as any)?.location||'Medical point'}</b><small>Medical</small></span></div>
      <div className="ep-service-chip"><ShieldCheck size={17}/><span><b>{help||'Help desk'}</b><small>Help</small></span></div>
    </div>
  </div>
 </section>;
}

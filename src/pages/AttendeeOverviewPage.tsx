import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, Compass, ParkingCircle, Navigation, Bell, ArrowRight, History, Users, Car } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, getUserTickets } from '../services/bookingService';
import { getStoredEventById, getAllPublishedEvents } from '../services/eventStorageService';
import { SAMPLE_EVENTS } from '../data/eventsData';
import type { AppEvent } from '../types/event';
import type { EventFlowTicket } from '../types/booking';
import { getEventTimingStatus, type EventTimingStatus } from '../utils/eventDateUtils';

export const AttendeeOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [upcomingEvents,setUpcomingEvents] = useState<{event:AppEvent;tickets:EventFlowTicket[];timing:EventTimingStatus}[]>([]);
  const [pastEvents,setPastEvents] = useState<{event:AppEvent;tickets:EventFlowTicket[];timing:EventTimingStatus}[]>([]);
  const [passes,setPasses] = useState(0);

  useEffect(()=>{
    if(!user?.id) return;
    const bookings=getUserBookings(user.id); const tickets=getUserTickets(user.id); setPasses(tickets.length);
    const items=bookings.map(b=>{ const event=getStoredEventById(b.eventId)||SAMPLE_EVENTS.find(e=>e.id===b.eventId); if(!event)return null; return {event,tickets:tickets.filter(t=>t.bookingId===b.bookingId||t.eventId===b.eventId),timing:getEventTimingStatus(event.date,event.time)}; }).filter(Boolean) as {event:AppEvent;tickets:EventFlowTicket[];timing:EventTimingStatus}[];
    setUpcomingEvents(items.filter(i=>!i.timing.isCompleted).sort((a,b)=>a.timing.totalMsRemaining-b.timing.totalMsRemaining));
    setPastEvents(items.filter(i=>i.timing.isCompleted));
  },[user?.id]);

  const nextEvent=upcomingEvents[0];
  const published=useMemo(()=>getAllPublishedEvents(),[]);
  const sectionTiles = [
    {label:'My Events',hint:`${upcomingEvents.length} active`,icon:Calendar,to:'/my-event'},
    {label:'Indoor Map',hint:'Source → destination',icon:Navigation,to:nextEvent?`/my-event/${nextEvent.event.id}/venue-map`:'/my-event'},
    {label:'Ticket',hint:`${passes} pass${passes===1?'':'es'}`,icon:Ticket,to:'/ticket'},
    {label:'Discover',hint:`${published.length} published`,icon:Compass,to:'/events'},
    {label:'Parking',hint:'Arrival planning',icon:ParkingCircle,to:nextEvent?`/my-event/${nextEvent.event.id}`:'/my-event'},
    {label:'Updates',hint:'Live event alerts',icon:Bell,to:nextEvent?`/my-event/${nextEvent.event.id}`:'/my-event'},
  ];

  return <AppLayout pageTitle="Overview" pageBadge="Attendee">
    <div className="attendee-overview mx-auto max-w-6xl space-y-5 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black text-[#F5EFE2]">Hi, {user?.fullName||user?.name||'Attendee'}</h1><p className="mt-1 text-xs text-[#B9B09F]">Everything you need for the next event.</p></div><Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-bold text-white">Discover <ArrowRight className="h-4 w-4"/></Link></div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Upcoming',upcomingEvents.length,Calendar],['Attended',pastEvents.length,History],['Passes',passes,Ticket],['Countdown',nextEvent?(nextEvent.timing.days>0?`${nextEvent.timing.days}d`:`${nextEvent.timing.hours}h`):'—',Clock]].map(([label,value,Icon]:any)=><div key={label} className="attendee-overview-stat rounded-2xl border p-4"><Icon className="attendee-overview-stat-icon h-4 w-4"/><div className="attendee-overview-stat-value mt-3 text-2xl font-black">{value}</div><div className="attendee-overview-stat-label text-[11px] font-bold uppercase tracking-[.12em]">{label}</div></div>)}
      </div>

      {nextEvent && <section className="overflow-hidden rounded-3xl border border-[#C9A15C]/20 bg-[#102A43] p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[.15em] text-[#78B7FF]">NEXT EVENT</span><h2 className="mt-2 text-xl font-black">{nextEvent.event.name}</h2><div className="mt-3 flex flex-wrap gap-3 text-xs text-[#C7D8EF]"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/>{nextEvent.event.date}</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5"/>{nextEvent.event.time}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{nextEvent.event.venue}</span></div></div><div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white/[.07] p-3"><span className="text-[9px] uppercase text-[#9FB3CC]">Gate</span><b className="mt-1 block">{nextEvent.tickets[0]?.assignedGate||'Gate 1'}</b></div><div className="rounded-xl bg-white/[.07] p-3"><span className="text-[9px] uppercase text-[#9FB3CC]">Section</span><b className="mt-1 block">{nextEvent.tickets[0]?.section||'Main'}</b></div></div></div><Link to={`/my-event/${nextEvent.event.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2.5 text-xs font-bold">Open Event Hub <ArrowRight className="h-4 w-4"/></Link></section>}

      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-[.12em] text-[#F5EFE2]">Quick sections</h2><span className="text-[10px] text-[#8FA3BD]">Tap to open</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sectionTiles.map(tile=><Link key={tile.label} to={tile.to} className="attendee-quick-card group flex items-center gap-3 rounded-2xl border p-4"><div className="attendee-quick-icon rounded-xl p-2.5"><tile.icon className="h-5 w-5"/></div><div className="min-w-0"><b className="attendee-quick-title block text-sm">{tile.label}</b><span className="attendee-quick-copy text-xs">{tile.hint}</span></div><ArrowRight className="ml-auto h-4 w-4 text-[#71869F] group-hover:text-[#78B7FF]"/></Link>)}</div></section>

      <section className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-[#C9A15C]/16 bg-[#101A2D] p-4"><Users className="attendee-overview-stat-icon h-4 w-4"/><b className="mt-2 block text-sm text-[#F5EFE2]">Crowd-aware route</b><span className="attendee-quick-copy text-xs">Use the published indoor map.</span></div><div className="rounded-2xl border border-[#C9A15C]/16 bg-[#101A2D] p-4"><Car className="attendee-overview-stat-icon h-4 w-4"/><b className="mt-2 block text-sm text-[#F5EFE2]">Arrival</b><span className="attendee-quick-copy text-xs">Parking + gate guidance.</span></div><div className="rounded-2xl border border-[#C9A15C]/16 bg-[#101A2D] p-4"><Bell className="attendee-overview-stat-icon h-4 w-4"/><b className="mt-2 block text-sm text-[#F5EFE2]">Live updates</b><span className="attendee-quick-copy text-xs">Only event-relevant alerts.</span></div></section>
    </div>
  </AppLayout>;
};

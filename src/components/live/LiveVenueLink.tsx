import React, { lazy, Suspense, useState } from 'react';
import { Radio, ChevronDown } from 'lucide-react';
import { getStoredEventById } from '../../services/eventStorageService';
import { AttendeeJourney } from '../journey/AttendeeJourney';
import '../../pages/live/liveVenue.css';
const LiveVenue=lazy(()=>import('../../pages/live/LiveVenuePage'));
export function LiveVenueLink({eventId,staff=false}:{eventId?:string;staff?:boolean}){
 const [open,setOpen]=useState(false);const event=eventId?getStoredEventById(eventId):undefined;
 if(!staff)return <AttendeeJourney initialEventId={eventId}/>;
 return <section className="ef-inline-operations"><button className="ef-launch" style={{width:'100%',textAlign:'left'}} onClick={()=>setOpen(v=>!v)}><Radio size={27}/><span><strong>Venue live simulation</strong><small>Real device updates when available · automatic demo simulation when the API is unavailable.</small></span><ChevronDown size={22} style={{transform:open?'rotate(180deg)':'none'}}/></button>{open&&<Suspense fallback={<p>Opening venue operations…</p>}><LiveVenue key={eventId} embedded eventOverride={event}/></Suspense>}</section>;
}

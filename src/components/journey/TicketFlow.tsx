import { safeJsonFetch } from '../../services/safeJsonFetch';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Clock3, DoorOpen, Info, MapPin, Radio, ShieldCheck } from 'lucide-react';
import type { EventFlowTicket } from '../../types/booking';
import type { AppEvent } from '../../types/event';
import type { VenueZone } from '../live/VenueMap';
import { predictGateUsage } from '../../services/gateForecast';

type PublicRoom = { zones: VenueZone[]; now: number };
const fresh = (zone: VenueZone | undefined, now: number) => !!zone && now - zone.updatedAt <= 15 * 60_000;
const gateNumber = (name: string) => name.match(/\bgate\s*([a-z0-9]+)/i)?.[1]?.toLowerCase();

export function TicketFlow({ event, ticket, room, onMap }: { event: AppEvent; ticket?: EventFlowTicket; room: string | null; onMap?: (zoneId: string) => void }) {
 const [snapshot, setSnapshot] = useState<PublicRoom | null>(null);
 const [cadence, setCadence] = useState<10 | 30>(30);
 const [clock, setClock] = useState(Date.now());
 const [lastDigest, setLastDigest] = useState(Date.now());
 const [summary,setSummary]=useState('Your ticket and gate are ready. Waiting for the next scheduled summary.');
 useEffect(() => {
  if (!room) { setSnapshot(null); return; }
  let active = true;
  const read = async () => { try { const next = await safeJsonFetch<PublicRoom>('/api/live-venue/rooms/' + encodeURIComponent(room)); if (active) setSnapshot(next); } catch { /* Keep the last known observation and its timestamp. */ } };
  read(); const timer = window.setInterval(read, 4000);
  return () => { active = false; window.clearInterval(timer); };
 }, [room]);
 useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
 useEffect(() => { if (clock - lastDigest >= cadence * 60_000) { setLastDigest(clock); setSummary(`Scheduled check: ${ticket?.assignedGate || 'your gate'} is ${snapshot?.zones.find(z => z.kind === 'gate' && gateNumber(z.name) === gateNumber(ticket?.assignedGate || ''))?.status || 'awaiting staff data'}. Check the observation time before moving.`); } }, [clock, lastDigest, cadence, snapshot, ticket?.assignedGate]);
 const assignedName = ticket?.assignedGate || 'Gate pending on your ticket';
 const gate = event.gates.find(g => g.name.toLowerCase() === assignedName.toLowerCase() || (gateNumber(g.name) && gateNumber(g.name) === gateNumber(assignedName)));
 const mapped = useMemo(() => snapshot?.zones.find(z => z.kind === 'gate' && (z.name.toLowerCase() === assignedName.toLowerCase() || (gateNumber(z.name) && gateNumber(z.name) === gateNumber(assignedName)))), [snapshot, assignedName]);
 const current = fresh(mapped, clock) ? mapped : undefined;
 const state = current?.status || 'unknown';
 const ticketConfig = event.ticketTypes?.find(t => t.name === ticket?.ticketType || t.id === ticket?.ticketType);
 const allowed = ticketConfig?.allowedGates || [];
 const alternate = state === 'closed' || state === 'crowded' ? snapshot?.zones.find(z => z.kind === 'gate' && z.id !== mapped?.id && fresh(z, clock) && z.status === 'normal' && allowed.some(id => id === z.id || event.gates.some(g => g.id === id && gateNumber(g.name) === gateNumber(z.name)))) : undefined;
 const route = current && ['normal', 'busy'].includes(state) ? `https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lng}&travelmode=walking` : undefined;
 const projected = current ? predictGateUsage(current, clock, cadence) : undefined;
 const nextMinutes = Math.max(0, Math.ceil((cadence * 60_000 - Math.max(0, clock - lastDigest)) / 60_000));
 return <section className="ej-flow" aria-label="Your ticket and gate guidance">
  <div className="ej-flow-head"><div><span className="ej-kicker"><Radio size={14}/> TICKET-BASED GUIDANCE</span><h3>Your entry, made clear.</h3></div><span className="ej-flow-tag">{ticket ? 'Account ticket matched' : 'Pass awaiting staff verification'}</span></div>
  <div className="ej-flow-grid"><div><span>EVENT</span><strong>{event.name}</strong></div><div><span>TICKET NUMBER</span><strong>{ticket?.ticketId || 'Not verified'}</strong></div><div><span>YOUR GATE</span><strong>{assignedName}</strong></div><div><span>SECTION / ENTRY</span><strong>{ticket ? `${ticket.section} · ${ticket.entryWindow}` : 'Confirm on your original pass'}</strong></div></div>
  <div className={'ej-gate-state '+(state === 'closed' || state === 'crowded' ? 'warning' : '')}><DoorOpen size={21}/><div><strong>{state === 'unknown' ? 'Gate status awaiting staff update' : `${assignedName} · ${state}`}</strong><p>{state === 'closed' || state === 'crowded' ? 'Pause at a safe point and follow event staff instructions.' : current ? `Staff observation from ${new Date(current.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}. ${current.note || 'Check on-site signage.'}` : 'Your assigned gate comes from this ticket. The event team has not published a recent mapped observation.'}</p>{alternate && <p className="ej-alternative"><ShieldCheck size={14}/> {alternate.name} is listed as eligible and normal. Confirm reassignment with staff before entering.</p>}</div></div>
  <div className="ej-flow-foot"><div className="ej-digest"><Clock3 size={16}/><label>Guidance summary every <select aria-label="Guidance update interval" value={cadence} onChange={e => { setCadence(Number(e.target.value) as 10 | 30); setLastDigest(Date.now()); }}><option value={10}>10 minutes</option><option value={30}>30 minutes</option></select></label><small>Next summary in ~{nextMinutes} min · urgent staff changes show on the live map as they arrive.</small><small role="status">{summary}</small></div><div className="ej-actions">{mapped && onMap && <button className="ej-secondary" onClick={() => onMap(mapped.id)}><MapPin size={15}/>Show gate on map</button>}{route && <a className="ej-primary" href={route} target="_blank" rel="noreferrer">Walking directions<ArrowUpRight size={15}/></a>}</div></div>
  <p className="ej-evidence"><Info size={14}/> {gate?.avgWaitMins !== undefined ? `Event plan lists a ${gate.avgWaitMins} min gate wait; this is not a live ETA. ` : ''}{projected === undefined ? 'Not enough timed gate-capacity observations for a 10/30-minute crowd trend. ' : `Estimated gate utilization in ${cadence} min: ${projected}% from recent staff counts; trend only. `}A faster route needs measured waits and approved venue paths; no predicted travel time is shown.</p>
 </section>;
}

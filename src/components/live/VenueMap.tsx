import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export type LocationPoint = { lat: number; lng: number };
export type VenueZone = LocationPoint & { id: string; name: string; kind: string; status: string; note: string; updatedAt: number; source?: "osm" | "event"; url?: string; capacity?: number; used?: number; unit?: string; history?: {at:number;used:number;capacity:number}[] };
export const statusColor: Record<string, string> = { unknown: '#94a3b8', normal: '#10b981', busy: '#f59e0b', crowded: '#ef4444', closed: '#475569' };
export function VenueMap({ center, radius, zones, cells, people = [], position, selected, onSelect, onPick, focus }: {
 center: LocationPoint; radius: number; zones: VenueZone[]; cells: (LocationPoint & { count: number })[]; people?: (LocationPoint & { id:string; label:string; kind:'attendee'|'operator'; simulated?:boolean })[]; position?: LocationPoint & { accuracy: number }; selected?: string; onSelect: (id: string) => void; onPick?: (p: LocationPoint) => void; focus: number;
}) {
 const el = useRef<HTMLDivElement>(null), map = useRef<L.Map | null>(null), layer = useRef<L.LayerGroup | null>(null);
 const callbacks = useRef({ onSelect, onPick }); callbacks.current = { onSelect, onPick };
 const [tileError, setTileError] = useState(false);
 useEffect(() => {
  if (!el.current) return;
  const m = L.map(el.current, { zoomControl: false }).setView([center.lat, center.lng], 16); map.current = m;
  L.control.zoom({ position: 'bottomright' }).addTo(m);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).on('tileerror', () => setTileError(true)).on('tileload', () => setTileError(false)).addTo(m);
  layer.current = L.layerGroup().addTo(m);
  m.on('click', e => callbacks.current.onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
  const observer = new ResizeObserver(() => m.invalidateSize()); observer.observe(el.current);
  return () => { observer.disconnect(); m.remove(); map.current = null; };
 }, []);
 useEffect(() => { map.current?.setView([center.lat, center.lng], 16); }, [center.lat, center.lng]);
 useEffect(() => { const z = zones.find(z=>z.id===selected); if(z) map.current?.panTo([z.lat,z.lng]); },[selected]);
 useEffect(() => { if (focus && map.current) { const p = position || center; map.current.setView([p.lat, p.lng], 17); } }, [focus]);
 useEffect(() => {
  const group = layer.current; if (!group) return; group.clearLayers();
  L.circle([center.lat, center.lng], { radius, color: '#14b8a6', weight: 1.5, dashArray: '6 8', fillOpacity: 0.035 }).addTo(group).bindTooltip('Configured venue proximity area');
  cells.forEach(c => L.circle([c.lat, c.lng], { radius: 35, stroke: false, fillColor: '#a855f7', fillOpacity: Math.min(.65, .16 + c.count * .06) }).addTo(group).bindTooltip(`${c.count} recently sharing device${c.count === 1 ? '' : 's'} · not total crowd`));
  zones.forEach(z => {
   const stale = z.source !== 'osm' && Date.now() - z.updatedAt > 15 * 60 * 1000;
   const color = z.source === 'osm' ? '#3b82f6' : stale ? statusColor.unknown : statusColor[z.status];
   const marker = L.circleMarker([z.lat, z.lng], { radius: selected === z.id ? 15 : 10, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 }).addTo(group);
   const label = document.createElement('span'); label.textContent = `${z.name} · ${z.source === 'osm' ? 'directory listing' : stale ? 'needs update' : z.status}`;
   marker.bindTooltip(label, { direction: 'top' }).on('click', e => { L.DomEvent.stopPropagation(e); callbacks.current.onSelect(z.id); });
   if (z.status === 'crowded' && !stale) L.circle([z.lat, z.lng], { radius: 45, color, weight: 1, fillOpacity: .14 }).addTo(group);
  });
  people.forEach(person => {
   const isOperator = person.kind === 'operator';
   const marker = L.circleMarker([person.lat, person.lng], { radius: isOperator ? 7 : 4.5, color: isOperator ? '#0B1120' : '#ffffff', weight: isOperator ? 2.5 : 1.5, fillColor: isOperator ? '#E8D5A8' : person.simulated ? '#8b5cf6' : '#2563eb', fillOpacity: .95 }).addTo(group);
   marker.bindTooltip(isOperator ? `${person.label} · operator` : `${person.label} · ${person.simulated ? 'simulated attendee' : 'live attendee'}`);
  });
  if (position) {
   L.circle([position.lat, position.lng], { radius: position.accuracy, color: '#3b82f6', weight: 1, fillOpacity: .08 }).addTo(group);
   L.circleMarker([position.lat, position.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(group).bindTooltip('Your location');
  }
 }, [center, radius, zones, cells, people, position, selected]);
 return <div className="ef-map-wrap"><div ref={el} className="ef-map" aria-label="Interactive venue map" />{tileError && <div className="ef-map-error">Map tiles unavailable. Check your connection; live observations remain listed below.</div>}</div>;
}

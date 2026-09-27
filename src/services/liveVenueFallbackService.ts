import type { AppEvent } from '../types/event';

type LocationPoint = { lat: number; lng: number };
type LocalZone = LocationPoint & {
  id: string; name: string; kind: string; status: string; note: string; updatedAt: number;
  source?: 'event'; capacity?: number; used?: number; unit?: string;
};

type LocalPerson = LocationPoint & { id: string; label: string; kind: 'attendee' | 'operator'; simulated?: boolean };

type LocalRoom = {
  code: string;
  eventId?: string;
  name: string;
  center: LocationPoint;
  radius: number;
  zones: LocalZone[];
  joined: number;
  inside: number;
  positions: Record<string, LocationPoint & { at: number }>;
  log: { text: string; at: number }[];
  staffToken: string;
  createdAt: number;
};

const KEY = 'eventflow_live_room_fallback_v2';

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const codeFor = (value: string) => hash(value).toString(36).toUpperCase().slice(0, 8).padEnd(8, 'E');
const validCoord = (n: unknown, min: number, max: number) => Number.isFinite(Number(n)) && Number(n) >= min && Number(n) <= max;
const eventCenter = (event?: AppEvent): LocationPoint => ({
  lat: validCoord(event?.latitude, -85, 85) ? Number(event!.latitude) : 19.076,
  lng: validCoord(event?.longitude, -180, 180) ? Number(event!.longitude) : 72.8777,
});

function readRooms(): Record<string, LocalRoom> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function writeRooms(rooms: Record<string, LocalRoom>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent('eventflow_live_fallback_updated'));
  } catch {}
}
function offset(center: LocationPoint, eastM: number, northM: number): LocationPoint {
  const lat = center.lat + northM / 111320;
  const lng = center.lng + eastM / (111320 * Math.max(.25, Math.cos(center.lat * Math.PI / 180)));
  return { lat, lng };
}
function eventZones(event: AppEvent | undefined, center: LocationPoint): LocalZone[] {
  const now = Date.now();
  const gates = (event?.gates || []).slice(0, 4).map((g, i) => ({
    ...offset(center, [-120, 110, -40, 70][i] || 0, [-70, -55, 95, 75][i] || 0),
    id: g.id || `gate-${i + 1}`, name: g.name || `Gate ${i + 1}`, kind: 'gate',
    status: g.status === 'critical' ? 'crowded' : g.status === 'congested' ? 'busy' : 'normal',
    note: 'Event entry point · simulated live layer', updatedAt: now, source: 'event' as const,
  }));
  const base: LocalZone[] = [
    { ...offset(center, 75, 25), id: 'sim-medical', name: 'Medical Point', kind: 'medical', status: 'normal', note: 'Event medical support', updatedAt: now, source: 'event' },
    { ...offset(center, -70, 35), id: 'sim-food', name: 'Food & Hydration', kind: 'food', status: 'busy', note: 'Organizer-managed concession zone', updatedAt: now, source: 'event' },
    { ...offset(center, 20, -105), id: 'sim-shuttle', name: 'Organizer Shuttle Bay', kind: 'transport', status: 'normal', note: 'Organizer-operated pickup / drop', updatedAt: now, source: 'event' },
    { ...offset(center, -105, -95), id: 'sim-parking', name: 'Parking P1', kind: 'parking', status: 'busy', note: 'Simulated occupancy layer', updatedAt: now, source: 'event', capacity: 500, used: 318, unit: 'spaces' },
  ];
  return [...gates, ...base];
}
function ensureRoom(event?: AppEvent, explicit?: Partial<LocalRoom>): LocalRoom {
  const rooms = readRooms();
  const eventId = explicit?.eventId || event?.id || 'demo-event';
  const code = explicit?.code || codeFor(eventId);
  if (rooms[code]) return rooms[code];
  const center = explicit?.center || eventCenter(event);
  const room: LocalRoom = {
    code, eventId, name: explicit?.name || event?.name || 'EventFlow Live Venue', center,
    radius: explicit?.radius || 500, zones: eventZones(event, center), joined: 36, inside: 29,
    positions: {}, staffToken: `LOCAL-${code}-STAFF`, createdAt: Date.now(),
    log: [
      { text: 'Simulation fallback activated — live venue remains available without the server endpoint.', at: Date.now() },
      { text: 'Crowd cells and venue operations are demo data until real devices connect.', at: Date.now() - 45000 },
    ],
  };
  rooms[code] = room; writeRooms(rooms); return room;
}
function simulatedCells(room: LocalRoom) {
  const seed = hash(room.eventId || room.code);
  const cells = [] as Array<LocationPoint & { count: number }>;
  for (let i = 0; i < 8; i++) {
    const angle = ((seed % 360) + i * 47) * Math.PI / 180;
    const distance = 55 + ((seed >> (i % 16)) % 115);
    const p = offset(room.center, Math.cos(angle) * distance, Math.sin(angle) * distance);
    cells.push({ ...p, count: 2 + ((seed + i * 13) % 8) });
  }
  Object.values(room.positions).filter(p => Date.now() - p.at < 120000).forEach(p => cells.push({ lat:p.lat, lng:p.lng, count:1 }));
  return cells;
}
function simulatedPeople(room: LocalRoom): LocalPerson[] {
  const seed = hash((room.eventId || room.code) + ':people');
  const people: LocalPerson[] = [];
  for (let i = 0; i < 22; i++) {
    const angle = (((seed % 360) + i * 61) % 360) * Math.PI / 180;
    const radius = 34 + ((seed + i * 29) % 125);
    const wobble = ((seed >> (i % 12)) % 23) - 11;
    const p = offset(room.center, Math.cos(angle) * radius + wobble, Math.sin(angle) * radius - wobble);
    people.push({ ...p, id:`sim-attendee-${i+1}`, label:`A${String(i+1).padStart(2,'0')}`, kind:'attendee', simulated:true });
  }
  const operatorOffsets = [[-95,-35],[90,-25],[-25,92],[55,78]] as const;
  operatorOffsets.forEach(([east,north],i)=>{ const p=offset(room.center,east,north); people.push({ ...p,id:`sim-operator-${i+1}`,label:`OP${i+1}`,kind:'operator',simulated:true }); });
  Object.entries(room.positions).filter(([,p])=>Date.now()-p.at<120000).forEach(([id,p],i)=>people.push({lat:p.lat,lng:p.lng,id:`live-${id}`,label:`LIVE${i+1}`,kind:'attendee'}));
  return people;
}

function snapshot(room: LocalRoom, staff = false) {
  const livePositions = Object.values(room.positions).filter(p => Date.now() - p.at < 120000);
  return {
    code: room.code, name: room.name, center: room.center, radius: room.radius, zones: room.zones,
    cells: simulatedCells(room), people: simulatedPeople(room), active: 24 + livePositions.length, joined: room.joined,
    inside: Math.max(room.inside, 29 + livePositions.length), log: room.log.slice(0, 12), staff,
    now: Date.now(), demoMode: true, dataSource: 'LOCAL_SIMULATION',
  };
}

export async function fallbackLiveVenueApi(url: string, body?: any, headers: Record<string, string> = {}, event?: AppEvent): Promise<any> {
  const methodIsWrite = body !== undefined;
  const eventRoom = url.match(/^\/events\/([^/]+)\/room$/);
  if (eventRoom) {
    const room = ensureRoom(event && event.id === decodeURIComponent(eventRoom[1]) ? event : undefined, { eventId: decodeURIComponent(eventRoom[1]) });
    return { code: room.code, simulated: true };
  }
  if (url === '/rooms' && methodIsWrite) {
    const center = body?.center || eventCenter(event);
    const room = ensureRoom(event, { eventId: body?.eventId || event?.id, name: body?.name, center, radius: Number(body?.radius) || 500 });
    return { code: room.code, staffToken: room.staffToken, simulated: true };
  }
  const roomMatch = url.match(/^\/rooms\/([^/]+)(?:\/(join|position|scan|zones))?$/);
  if (!roomMatch) throw new Error('Live venue is temporarily unavailable.');
  const code = decodeURIComponent(roomMatch[1]).toUpperCase();
  const action = roomMatch[2];
  const rooms = readRooms();
  const room = rooms[code] || ensureRoom(event, { code, eventId: event?.id, name: event?.name });
  const staff = Boolean(headers['X-Venue-Token']) && (headers['X-Venue-Token'] === room.staffToken || String(headers['X-Venue-Token']).startsWith('LOCAL-'));
  if (!action) return snapshot(room, staff);
  if (action === 'join') {
    const id = `guest-${code}-${Math.random().toString(36).slice(2, 8)}`;
    room.joined += 1; room.log.unshift({ text: 'An attendee joined the local live venue.', at: Date.now() });
    rooms[code] = room; writeRooms(rooms);
    return { id, secret: `local-${id}`, pass: `EFV:${code}:${id}` };
  }
  if (action === 'position') {
    const id = body?.id || 'guest';
    if (body?.stop) delete room.positions[id];
    else if (body?.position) room.positions[id] = { lat:Number(body.position.lat), lng:Number(body.position.lng), at:Date.now() };
    rooms[code] = room; writeRooms(rooms); return snapshot(room, staff);
  }
  if (action === 'scan') {
    room.inside = Math.max(0, room.inside + (body?.direction === 'exit' ? -1 : 1));
    room.log.unshift({ text: `${body?.direction === 'exit' ? 'Exit' : 'Entry'} recorded in demo attendance desk.`, at: Date.now() });
    rooms[code] = room; writeRooms(rooms); return { ok:true, inside:room.inside, simulated:true };
  }
  if (action === 'zones') {
    const zone = { ...body, id: body?.id || `zone-${Date.now()}`, updatedAt: Date.now(), source:'event' as const } as LocalZone;
    const idx = room.zones.findIndex(z => z.id === zone.id);
    if (idx >= 0) room.zones[idx] = zone; else room.zones.unshift(zone);
    room.log.unshift({ text: `${zone.name} updated by the event team.`, at: Date.now() });
    rooms[code] = room; writeRooms(rooms); return { ok:true, zone, simulated:true };
  }
  return snapshot(room, staff);
}

export function buildSimulatedNearbyPlaces(lat: number, lng: number) {
  const center = { lat, lng }; const now = Date.now();
  const defs = [
    ['near-parking','Parking P1','parking',-170,-90,'Organizer parking · demo availability'],
    ['near-shuttle','Organizer Shuttle Hub','transport',150,-75,'Organizer-operated shuttle pickup'],
    ['near-food','Food Court','food',95,115,'Concessions & hydration'],
    ['near-hotel','Partner Stay Zone','hotel',-210,130,'Hospitality directory reference'],
    ['near-medical','Medical Support','medical',35,85,'On-site first aid'],
  ] as const;
  return defs.map(([id,name,kind,east,north,note],i)=>({ id,name,kind,...offset(center,east,north),status:i===0?'busy':'normal',note,updatedAt:now,source:'event' as const }));
}

import { FACILITIES } from "../shared/facilities";
import { nearbyRouter } from "./nearbyPlaces";
import { Router } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';

const token = () => randomBytes(24).toString('hex');
const hash = (v: string) => createHash('sha256').update(v).digest('hex');
const root = process.env.LIVE_DATA_DIR || (process.env.VERCEL ? path.join('/tmp', 'eventflow-data') : path.join(process.cwd(), '.eventflow-data'));
const file = path.join(root, 'venues.json');
type Point = { lat: number; lng: number };
type Zone = Point & { id: string; name: string; kind: string; status: string; note: string; updatedAt: number; capacity?: number; used?: number; unit?: string; history?: {at:number;used:number;capacity:number}[] };
type Guest = { secretHash: string; pass: string; inside: boolean; position?: Point & { accuracy: number; at: number }; joinedAt: number };
type Room = { code: string; name: string; eventId: string; center: Point; radius: number; staffHash: string; zones: Zone[]; guests: Record<string, Guest>; log: { text: string; at: number }[]; createdAt: number };
let rooms: Record<string, Room> = {};
if (existsSync(file)) rooms = JSON.parse(readFileSync(file, 'utf8'));
function persist() { mkdirSync(root, { recursive: true }); writeFileSync(file + '.tmp', JSON.stringify(rooms), { mode: 0o600 }); renameSync(file + '.tmp', file); }
const metres = (a: Point, b: Point) => { const r = Math.PI / 180; const h = Math.sin((b.lat-a.lat)*r/2)**2 + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2; return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); };
const validPoint = (v: any) => v && Number.isFinite(v.lat) && Number.isFinite(v.lng) && Math.abs(v.lat) <= 85 && Math.abs(v.lng) <= 180;
function audit(r: Room, text: string) { r.log.unshift({ text, at: Date.now() }); r.log = r.log.slice(0, 60); persist(); }
export const liveVenueRouter = Router();
const limits = new Map<string, { at: number; n: number }>();
liveVenueRouter.use((req, res, next) => {
  const key = req.ip || 'unknown'; const now = Date.now();
  if (limits.size > 10000) for (const [k, v] of limits) if (now - v.at > 60000) limits.delete(k);
  const current = limits.get(key); const bucket = current && now - current.at < 60000 ? current : { at: now, n: 0 };
  limits.set(key, bucket); if (++bucket.n > 600) return res.status(429).json({ error: 'Too many requests. Please wait a minute.' }); next();
});
liveVenueRouter.use('/nearby', nearbyRouter);
liveVenueRouter.get('/events/:eventId/room', (req, res) => {
 const room = Object.values(rooms).filter(r => r.eventId === req.params.eventId).sort((a,b)=>b.createdAt-a.createdAt)[0];
 res.set('Cache-Control','no-store').json({code:room?.code || null});
});
liveVenueRouter.post('/rooms', (req, res) => {
  if (process.env.NODE_ENV === 'production' && !process.env.LIVE_SETUP_KEY) return res.status(503).json({ error: 'Host must configure LIVE_SETUP_KEY before creating live rooms.' });
  if (process.env.LIVE_SETUP_KEY && req.body.setupKey !== process.env.LIVE_SETUP_KEY) return res.status(403).json({ error: 'Valid host setup key required.' });
  const { name, center, eventId, radius } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 140 || !validPoint(center) || !Number.isFinite(radius) || radius < 50 || radius > 5000) return res.status(400).json({ error: 'Provide venue name, valid coordinates and a radius of 50–5000 metres.' });
  if (Object.keys(rooms).length >= 200) return res.status(409).json({ error: 'Room limit reached. Contact the host.' });
  let code = randomBytes(4).toString('hex').toUpperCase(); while (rooms[code]) code = randomBytes(4).toString('hex').toUpperCase();
  const staffToken = token(); rooms[code] = { code, name: name.trim(), eventId: String(eventId || '').slice(0, 100), center, radius, staffHash: hash(staffToken), zones: [], guests: {}, log: [], createdAt: Date.now() };
  audit(rooms[code], 'Live room opened. Awaiting attendee check-ins and operator observations.');
  res.json({ code, staffToken });
});
liveVenueRouter.use('/rooms/:code', (req, res, next) => {
  const room = rooms[String(req.params.code).toUpperCase()]; if (!room) return res.status(404).json({ error: 'Live room not found. Check the room code.' });
  res.locals.room = room;
  res.locals.staff = hash(req.get('X-Venue-Token') || '') === room.staffHash;
  next();
});
liveVenueRouter.get('/rooms/:code', (req, res) => {
  const r: Room = res.locals.room; const now = Date.now(); const cells = new Map<string, any>();
  let active = 0; let expired = false;
  for (const g of Object.values(r.guests)) {
    if (g.position && now - g.position.at > 120000) { delete g.position; expired = true; }
    const p = g.position; if (!p || p.accuracy > 100 || metres(p, r.center) > r.radius + p.accuracy) continue;
    active++;
    // Only aggregate ~50m cells are shared; never attendee identities or precise trails.
    const latStep = 50 / 111320, lngStep = latStep / Math.max(0.1, Math.cos(p.lat * Math.PI / 180));
    const lat = Math.round(p.lat / latStep) * latStep, lng = Math.round(p.lng / lngStep) * lngStep;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`; const cell = cells.get(key) || { lat, lng, count: 0 }; cell.count++; cells.set(key, cell);
  }
  if (expired) persist();
  res.set('Cache-Control', 'no-store').json({ code: r.code, name: r.name, eventId: r.eventId, center: r.center, radius: r.radius, zones: r.zones, cells: [...cells.values()], active, joined: Object.keys(r.guests).length, inside: Object.values(r.guests).filter(g => g.inside).length, log: r.log.slice(0, res.locals.staff ? 30 : 5), staff: res.locals.staff, now });
});
liveVenueRouter.post('/rooms/:code/join', (req, res) => {
  const r: Room = res.locals.room;
  if (Object.keys(r.guests).length >= 10000) return res.status(409).json({ error: 'Room attendee limit reached.' });
  const id = token(); const secret = token(); const pass = `EFV:${r.code}:${token()}`;
  r.guests[id] = { secretHash: hash(secret), pass, inside: false, joinedAt: Date.now() }; persist();
  res.json({ id, secret, pass });
});
liveVenueRouter.post('/rooms/:code/position', (req, res) => {
  const r: Room = res.locals.room; const g = r.guests[req.body.id];
  if (!g || hash(req.get('X-Guest-Token') || '') !== g.secretHash) return res.status(403).json({ error: 'Attendee session expired. Join again.' });
  if (req.body.stop === true) { delete g.position; persist(); return res.json({ ok: true }); }
  const { position } = req.body;
  if (!validPoint(position) || !Number.isFinite(position.accuracy) || position.accuracy < 0 || position.accuracy > 10000) return res.status(400).json({ error: 'Invalid location.' });
  g.position = { lat: position.lat, lng: position.lng, accuracy: position.accuracy, at: Date.now() }; persist(); res.json({ ok: true });
});
liveVenueRouter.post('/rooms/:code/zones', (req, res) => {
  if (!res.locals.staff) return res.status(403).json({ error: 'Staff key required.' });
  const r: Room = res.locals.room; const z = req.body;
  if (!validPoint(z) || typeof z.name !== 'string' || !z.name.trim() || z.name.length > 80 || !FACILITIES.some(f=>f[0]===z.kind) || !['unknown','normal','busy','crowded','closed'].includes(z.status)) return res.status(400).json({ error: 'Check the point name, coordinates and status.' });
  if (r.zones.length >= 100 && !r.zones.some(v => v.id === z.id)) return res.status(409).json({ error: 'Maximum 100 mapped points.' });
  if ((z.capacity !== undefined && (z.used === undefined || !Number.isInteger(z.capacity) || z.capacity < 0 || z.capacity > 1000000)) || (z.used !== undefined && (!Number.isInteger(z.used) || z.used < 0 || z.capacity === undefined || z.used > z.capacity))) return res.status(400).json({error:'Usage must be between zero and capacity.'});
  const zone: Zone = { id: r.zones.some(v => v.id === z.id) ? z.id : token(), name: z.name.trim(), lat: z.lat, lng: z.lng, kind: z.kind, status: z.status, note: String(z.note || '').slice(0, 240), updatedAt: Date.now(), ...(z.capacity !== undefined ? {capacity:z.capacity,used:z.used ?? 0,unit:String(z.unit||'spaces').slice(0,20),history:[...(r.zones.find(v=>v.id===z.id)?.history||[]).filter(p=>Date.now()-p.at<60*60_000 && p.capacity===z.capacity).slice(-11),{at:Date.now(),used:z.used,capacity:z.capacity}]} : {}) };
  r.zones = [...r.zones.filter(v => v.id !== zone.id), zone]; audit(r, `${zone.name}: ${zone.status}${zone.note ? ' — ' + zone.note : ''}`); res.json({ ok: true });
});
liveVenueRouter.post('/rooms/:code/scan', (req, res) => {
  if (!res.locals.staff) return res.status(403).json({ error: 'Staff key required.' });
  const r: Room = res.locals.room; const g = Object.values(r.guests).find(v => v.pass === req.body.pass);
  if (!g) return res.status(404).json({ error: 'Unknown pass for this room. Use the Live Venue attendance QR.' });
  if (!['entry','exit'].includes(req.body.direction)) return res.status(400).json({ error: 'Choose entry or exit.' });
  const inside = req.body.direction === 'entry'; if (g.inside === inside) return res.status(409).json({ error: inside ? 'Already checked in. Count unchanged.' : 'Not checked in. Count unchanged.' });
  g.inside = inside; if (!inside) delete g.position;
  audit(r, inside ? 'Staff recorded an attendee entry.' : 'Staff recorded an attendee exit.'); res.json({ ok: true });
});

// Expire raw coordinates even when nobody is polling the room.
const expiryTimer = setInterval(() => { let changed = false; for (const room of Object.values(rooms)) for (const guest of Object.values(room.guests)) if (guest.position && Date.now() - guest.position.at > 120000) { delete guest.position; changed = true; } if (changed) persist(); }, 30000);
expiryTimer.unref();

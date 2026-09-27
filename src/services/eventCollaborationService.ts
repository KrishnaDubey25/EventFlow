import type { FloorPoi } from '../types/floorPlan';

export type EventPresence = {
  userId: string;
  name: string;
  eventId: string;
  x: number;
  y: number;
  inside: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  sourceLabel?: string;
  destinationLabel?: string;
  updatedAt: number;
  simulated?: boolean;
};

export type FieldAssignment = {
  id: string;
  eventId: string;
  assigneeId: string;
  assigneeLabel: string;
  assigneeType: 'volunteer' | 'operator';
  from: { x: number; y: number; label: string };
  to: { x: number; y: number; label: string };
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'DONE';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type HelpRequest = {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  operatorId: string;
  operatorLabel: string;
  location: { x: number; y: number; label: string };
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: number;
  updatedAt: number;
};

const presenceKey = (eventId: string) => `eventflow_presence:${eventId}`;
const assignmentKey = (eventId: string) => `eventflow_field_assignments:${eventId}`;
const helpKey = (eventId: string) => `eventflow_help_requests:${eventId}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T, eventId: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('eventflow_collaboration_updated', { detail: { eventId } }));
  } catch {}
}

export function getEventPresence(eventId: string): EventPresence[] {
  const now = Date.now();
  return read<EventPresence[]>(presenceKey(eventId), []).filter((p) => now - p.updatedAt < 20 * 60 * 1000);
}

export function upsertEventPresence(presence: EventPresence) {
  const all = getEventPresence(presence.eventId).filter((p) => p.userId !== presence.userId);
  write(presenceKey(presence.eventId), [presence, ...all].slice(0, 500), presence.eventId);
}

export function removeEventPresence(eventId: string, userId: string) {
  write(presenceKey(eventId), getEventPresence(eventId).filter((p) => p.userId !== userId), eventId);
}

export function getFieldAssignments(eventId: string): FieldAssignment[] {
  return read<FieldAssignment[]>(assignmentKey(eventId), []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createVolunteerAssignment(input: {
  eventId: string;
  volunteer: FloorPoi;
  from: { x: number; y: number; label?: string };
  to: { x: number; y: number; label?: string };
  createdBy: string;
}) {
  const now = Date.now();
  const assignment: FieldAssignment = {
    id: `assign-${input.eventId}-${input.volunteer.id}-${now}`,
    eventId: input.eventId,
    assigneeId: input.volunteer.id,
    assigneeLabel: input.volunteer.label,
    assigneeType: 'operator',
    from: { x: input.from.x, y: input.from.y, label: input.from.label || 'Current post' },
    to: { x: input.to.x, y: input.to.y, label: input.to.label || 'Reassigned zone' },
    message: `Move from ${input.from.label || 'current post'} to ${input.to.label || 'reassigned zone'}`,
    status: 'NEW',
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  const all = getFieldAssignments(input.eventId);
  write(assignmentKey(input.eventId), [assignment, ...all].slice(0, 100), input.eventId);
  return assignment;
}

export function updateFieldAssignment(eventId: string, assignmentId: string, status: FieldAssignment['status']) {
  const all = getFieldAssignments(eventId).map((item) => item.id === assignmentId ? { ...item, status, updatedAt: Date.now() } : item);
  write(assignmentKey(eventId), all, eventId);
}

export function getHelpRequests(eventId: string): HelpRequest[] {
  return read<HelpRequest[]>(helpKey(eventId), []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createHelpRequest(input: Omit<HelpRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  const request: HelpRequest = {
    ...input,
    id: `help-${input.eventId}-${input.attendeeId}-${now}`,
    status: 'NEW',
    createdAt: now,
    updatedAt: now,
  };
  write(helpKey(input.eventId), [request, ...getHelpRequests(input.eventId)].slice(0, 100), input.eventId);
  return request;
}

export function updateHelpRequest(eventId: string, requestId: string, status: HelpRequest['status']) {
  const next = getHelpRequests(eventId).map((item) => item.id === requestId ? { ...item, status, updatedAt: Date.now() } : item);
  write(helpKey(eventId), next, eventId);
}

export function nearestPoiLabel(pois: FloorPoi[], x: number, y: number) {
  const target = [...pois]
    .filter((p) => p.type !== 'volunteer')
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  return target?.label || 'Indoor zone';
}


function demoHash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function getSimulatedEventPresence(eventId: string, plan: import('../types/floorPlan').FloorPlan, count = 28, phase = 0): EventPresence[] {
  const seed = demoHash(eventId || 'eventflow');
  const ways = plan.walkways.filter((w) => w.length >= 2);
  const candidates = plan.pois.filter((p) => p.type !== 'volunteer');
  const now = Date.now();
  const result: EventPresence[] = [];
  for (let i = 0; i < count; i++) {
    const way = ways.length ? ways[(seed + i * 7) % ways.length] : null;
    let x = plan.width * (.2 + (((seed >> (i % 16)) + i * 17) % 60) / 100);
    let y = plan.height * (.2 + (((seed >> ((i + 5) % 16)) + i * 23) % 60) / 100);
    if (way) {
      const seg = (seed + i * 11) % (way.length - 1);
      const a = way[seg], b = way[seg + 1];
      const baseT = .12 + (((seed + i * 29) % 75) / 100);
      const t = .08 + ((baseT + (phase % 20) * .045) % .86);
      x = a[0] + (b[0] - a[0]) * t + (((i * 13) % 17) - 8);
      y = a[1] + (b[1] - a[1]) * t + (((i * 19) % 17) - 8);
    } else if (candidates.length) {
      const poi = candidates[(seed + i) % candidates.length];
      x = poi.x + (((i * 13) % 31) - 15); y = poi.y + (((i * 17) % 31) - 15);
    }
    x = Math.max(22, Math.min(plan.width - 22, x)); y = Math.max(22, Math.min(plan.height - 22, y));
    result.push({ userId:`sim-attendee-${i+1}`, name:`Attendee ${String(i+1).padStart(2,'0')}`, eventId, x, y, inside:true, sourceLabel:nearestPoiLabel(plan.pois,x,y), updatedAt:now - (i%5)*12000, simulated:true });
  }
  return result;
}

export function getDisplayEventPresence(eventId: string, plan: import('../types/floorPlan').FloorPlan, includeSimulation = true, count = 28) {
  const real = getEventPresence(eventId);
  return includeSimulation ? [...real, ...getSimulatedEventPresence(eventId, plan, count)] : real;
}

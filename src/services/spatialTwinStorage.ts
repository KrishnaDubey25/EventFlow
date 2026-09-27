import type { FloorPlan } from '../types/floorPlan';

export type StoredSpatialTwin = {
  id: string;
  eventId: string;
  eventName: string;
  createdAt: number;
  frames: Blob[];
  floorPlan?: FloorPlan;
  published?: boolean;
};

const DB_NAME = 'eventflow-spatial-twins';
const STORE = 'twins';
const VERSION = 1;
const PUBLISHED_PREFIX = 'eventflow-published-floor-plan:';
const PUBLISHED_INDEX = 'eventflow-published-floor-plan:index';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'eventId' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function writePublished(eventId: string, eventName: string, floorPlan: FloorPlan, createdAt = Date.now()) {
  const payload = { eventId, eventName, createdAt, floorPlan, published: true };
  localStorage.setItem(PUBLISHED_PREFIX + eventId, JSON.stringify(payload));
  const index = getPublishedSpatialTwinIndex().filter((x) => x.eventId !== eventId);
  index.unshift({ eventId, eventName, createdAt });
  localStorage.setItem(PUBLISHED_INDEX, JSON.stringify(index.slice(0, 100)));
  window.dispatchEvent(new CustomEvent('eventflow_floor_plan_updated', { detail: { eventId } }));
}

export function getPublishedSpatialTwinIndex(): Array<{eventId:string;eventName:string;createdAt:number}> {
  try {
    const raw = localStorage.getItem(PUBLISHED_INDEX);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveSpatialTwin(twin: StoredSpatialTwin) {
  if (twin.floorPlan && twin.published === true) {
    try { writePublished(twin.eventId, twin.eventName, twin.floorPlan, twin.createdAt); } catch {}
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(twin);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadSpatialTwin(eventId: string): Promise<StoredSpatialTwin | null> {
  let published: StoredSpatialTwin | null = loadPublishedSpatialTwin(eventId);
  let db: IDBDatabase;
  try { db = await openDb(); } catch { return published; }
  const value = await new Promise<StoredSpatialTwin | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(eventId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value || published;
}

export function loadPublishedSpatialTwin(eventId: string): StoredSpatialTwin | null {
  try {
    const raw = localStorage.getItem(PUBLISHED_PREFIX + eventId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.floorPlan) return null;
    return {
      id:`published-${eventId}`,
      eventId,
      eventName:parsed.eventName || 'Event Venue',
      createdAt:parsed.createdAt || Date.now(),
      frames:[],
      floorPlan:parsed.floorPlan,
      published:true,
    };
  } catch { return null; }
}

export function loadPublishedSpatialTwinByName(eventName: string): StoredSpatialTwin | null {
  const normalized = eventName.trim().toLowerCase();
  const match = getPublishedSpatialTwinIndex().find((item) => item.eventName.trim().toLowerCase() === normalized);
  return match ? loadPublishedSpatialTwin(match.eventId) : null;
}

export function publishSpatialTwin(eventId: string, eventName: string, floorPlan: FloorPlan) {
  try {
    writePublished(eventId, eventName, floorPlan);
    return true;
  } catch { return false; }
}

export async function deleteSpatialTwin(eventId: string) {
  try {
    localStorage.removeItem(PUBLISHED_PREFIX + eventId);
    const index = getPublishedSpatialTwinIndex().filter((x) => x.eventId !== eventId);
    localStorage.setItem(PUBLISHED_INDEX, JSON.stringify(index));
  } catch {}
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(eventId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

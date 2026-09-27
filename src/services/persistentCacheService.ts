export type CacheEnvelope<T> = {
  value: T;
  savedAt: number;
  expiresAt?: number;
  version: 1;
};

const PREFIX = 'eventflow_cache_v1:';

export function cacheSet<T>(key: string, value: T, ttlMs?: number) {
  try {
    const now = Date.now();
    const envelope: CacheEnvelope<T> = {
      value,
      savedAt: now,
      expiresAt: ttlMs ? now + ttlMs : undefined,
      version: 1,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(envelope));
    window.dispatchEvent(new CustomEvent('eventflow_cache_updated', { detail: { key } }));
  } catch (error) {
    console.warn('EventFlow cache write skipped', error);
  }
}

export function cacheGet<T>(key: string, allowExpired = false): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (!allowExpired && envelope.expiresAt && envelope.expiresAt < Date.now()) return null;
    return envelope.value ?? null;
  } catch {
    return null;
  }
}

export function cacheMeta(key: string) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<unknown>;
    return { savedAt: envelope.savedAt, expiresAt: envelope.expiresAt };
  } catch {
    return null;
  }
}

export function cacheRemove(key: string) {
  try { localStorage.removeItem(PREFIX + key); } catch {}
}

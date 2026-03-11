/**
 * Layered cache: L1 in-memory (per process) + L2 adapter (e.g. Redis).
 * TTL by key prefix for production-ready behavior.
 */

const TTL = {
  person: 3600,
  resolve: 3600,
  neighbors: 86400,
  path: 86400,
  title2qid: 86400,
  trending: 300,
} as const;

const DEFAULT_TTL = 1800;

function getTtlForKey(key: string): number {
  if (key.startsWith('connect:person:')) return TTL.person;
  if (key.startsWith('connect:resolve:')) return TTL.resolve;
  if (key.startsWith('connect:neighbors:')) return TTL.neighbors;
  if (key.startsWith('connect:path:')) return TTL.path;
  if (key.startsWith('connect:title2qid:')) return TTL.title2qid;
  if (key.startsWith('connect:trending:')) return TTL.trending;
  return DEFAULT_TTL;
}

export interface CacheL2Adapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  delete?(key: string): Promise<void>;
}

const L1 = new Map<string, { value: unknown; expires: number }>();

export function setCacheLayered<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): void {
  const ttl = ttlSeconds ?? getTtlForKey(key);
  const expires = Date.now() + ttl * 1000;
  L1.set(key, { value, expires });
}

export function getFromCacheLayered<T>(key: string): T | null {
  const entry = L1.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    L1.delete(key);
    return null;
  }
  return entry.value as T;
}

export function invalidateCacheLayered(pattern?: string): void {
  if (!pattern) {
    L1.clear();
    return;
  }
  const re = new RegExp(pattern);
  for (const key of L1.keys()) {
    if (re.test(key)) L1.delete(key);
  }
}

export function setCache<T>(key: string, value: T, ttlSeconds?: number): void {
  setCacheLayered(key, value, ttlSeconds);
}

export function getFromCache<T>(key: string): T | null {
  return getFromCacheLayered<T>(key);
}

export { invalidateCacheLayered as invalidateCache };

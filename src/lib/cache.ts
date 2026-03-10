// In-memory cache (replace with Redis in production)

const store = new Map<string, { value: unknown; expires: number }>();

const TTL_DEFAULT = 1800; // 30 min

export function setCache<T>(key: string, value: T, ttlSeconds = TTL_DEFAULT): void {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export function getFromCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    store.clear();
    return;
  }
  const re = new RegExp(pattern);
  for (const key of store.keys()) {
    if (re.test(key)) store.delete(key);
  }
}

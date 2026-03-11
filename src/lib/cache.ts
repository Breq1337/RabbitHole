// Re-export layered cache (L1 in-memory + TTL by key type)
export {
  setCache,
  getFromCache,
  invalidateCache,
  setCacheLayered,
  getFromCacheLayered,
  invalidateCacheLayered,
  type CacheL2Adapter,
} from './cacheLayered';


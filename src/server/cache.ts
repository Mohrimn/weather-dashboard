interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(private defaultTtlMs = 10 * 60 * 1000) {}

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const weatherCache = new TTLCache();

export const buildCacheKey = (
  type: 'current' | 'forecast',
  provider: string,
  latitude: number,
  longitude: number
) => `${type}:${provider}:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;

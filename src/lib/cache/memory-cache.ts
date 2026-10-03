export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}
export interface CacheOptions {
  ttlMs: number;
  staleMs?: number;
}

export class MemoryCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  constructor(maxEntries = 100) {
    this.maxEntries = Math.max(10, maxEntries);
  }
  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }
  peek(key: string): CacheEntry<T> | undefined {
    return this.entries.get(key);
  }
  set(key: string, value: T, options: CacheOptions): void {
    const now = Date.now();
    this.entries.delete(key);
    this.entries.set(key, { value, createdAt: now, expiresAt: now + Math.max(0, options.ttlMs) });
    while (this.entries.size > this.maxEntries)
      this.entries.delete(this.entries.keys().next().value as string);
  }
  delete(key: string): void {
    this.entries.delete(key);
  }
  clear(): void {
    this.entries.clear();
  }
  size(): number {
    return this.entries.size;
  }
}

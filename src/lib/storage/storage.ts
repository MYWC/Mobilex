import { z, type ZodType } from 'zod';

export interface StorageEnvelope<T> {
  version: number;
  value: T;
  updatedAt: number;
}

const memoryFallback = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function rawGet(key: string): string | null {
  if (hasLocalStorage()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      /* fall through */
    }
  }
  return memoryFallback.get(key) ?? null;
}

function rawSet(key: string, value: string): void {
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through */
    }
  }
  memoryFallback.set(key, value);
}

function rawRemove(key: string): void {
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* fall through */
    }
  }
  memoryFallback.delete(key);
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = rawGet(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readValidatedStorage<T>(key: string, schema: ZodType<T>, fallback: T): T {
  const result = schema.safeParse(readStorage<unknown>(key, fallback));
  if (!result.success) {
    rawRemove(key);
    return fallback;
  }
  return result.data;
}

export function writeStorage<T>(key: string, value: T): void {
  rawSet(key, JSON.stringify(value));
}

export function writeVersionedStorage<T>(key: string, value: T, version = 1): void {
  const envelope: StorageEnvelope<T> = { version, value, updatedAt: Date.now() };
  writeStorage(key, envelope);
}

export function readVersionedStorage<T>(
  key: string,
  schema: ZodType<T>,
  fallback: T,
  expectedVersion = 1,
): T {
  const envelope = readStorage<unknown>(key, null);
  if (!envelope || typeof envelope !== 'object') return fallback;

  const parsed = z
    .object({
      version: z.number().int().nonnegative(),
      value: schema,
      updatedAt: z.number().int().nonnegative(),
    })
    .safeParse(envelope);

  if (!parsed.success || parsed.data.version !== expectedVersion) return fallback;
  return parsed.data.value;
}

export function removeStorage(key: string): void {
  rawRemove(key);
}

export function clearStorageNamespace(prefix: string): void {
  if (hasLocalStorage()) {
    try {
      const keys = Object.keys(window.localStorage);
      keys.filter((key) => key.startsWith(prefix)).forEach((key) => window.localStorage.removeItem(key));
    } catch {
      /* ignore */
    }
  }
  [...memoryFallback.keys()]
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => memoryFallback.delete(key));
}

export function subscribeStorage<T>(key: string, callback: (value: T | null) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const listener = (event: StorageEvent) => {
    if (event.key !== key) return;
    if (event.newValue == null) return callback(null);
    try {
      callback(JSON.parse(event.newValue) as T);
    } catch {
      callback(null);
    }
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

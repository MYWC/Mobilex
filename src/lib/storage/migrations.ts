import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/app/config/constants';
import { readStorage, writeStorage } from './storage';

function migrateArrayKey(from: string, to: string, validate: (value: unknown) => boolean): void {
  const existing = readStorage<unknown>(to, null);
  if (existing != null) return;
  const legacy = readStorage<unknown>(from, null);
  if (Array.isArray(legacy) && validate(legacy)) writeStorage(to, legacy);
}

export function migrateLegacyStorage(): void {
  runStorageMigrations();
}

export function runStorageMigrations(): void {
  migrateArrayKey(
    LEGACY_STORAGE_KEYS.cart,
    STORAGE_KEYS.cart,
    (value) => Array.isArray(value) && value.every((x) => x && typeof x === 'object'),
  );
  migrateArrayKey(
    LEGACY_STORAGE_KEYS.wishlist,
    STORAGE_KEYS.wishlist,
    (value) => Array.isArray(value) && value.every((x) => typeof x === 'string'),
  );
}

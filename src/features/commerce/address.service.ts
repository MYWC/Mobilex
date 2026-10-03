import { listUserAddresses, saveUserAddress, deleteUserAddress } from '@/lib/supabase/commerce.repository';
import { readStorage, writeStorage } from '@/lib/storage/storage';
import type { CommerceAddress } from './commerce.types';
import { getCurrentUser } from '@/services/auth/auth.service';
import { addressSchema } from './commerce.schema';

const KEY = 'mobilex.addresses.v2';

function normalizeLocal(list: CommerceAddress[]): CommerceAddress[] {
  let defaultFound = false;
  return list.map((address) => {
    if (address.isDefault && !defaultFound) {
      defaultFound = true;
      return address;
    }
    return address.isDefault ? { ...address, isDefault: false } : address;
  });
}

export async function loadAddresses(): Promise<CommerceAddress[]> {
  const user = await getCurrentUser();
  if (user) {
    try { return await listUserAddresses(user.id); } catch { /* fall back to local */ }
  }
  return normalizeLocal(readStorage<CommerceAddress[]>(KEY, []));
}

export async function upsertAddress(address: CommerceAddress): Promise<CommerceAddress> {
  const parsed = addressSchema.safeParse(address);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'آدرس معتبر نیست.');
  const user = await getCurrentUser();
  if (user && import.meta.env.VITE_SUPABASE_URL) {
    try { return await saveUserAddress(user.id, address); } catch { /* fall back to local */ }
  }
  const current = readStorage<CommerceAddress[]>(KEY, []);
  const id = address.id ?? crypto.randomUUID();
  const nextAddress = { ...address, id, isDefault: address.isDefault ?? current.length === 0 };
  const next = normalizeLocal([...current.filter((x) => x.id !== id), nextAddress]);
  writeStorage(KEY, next);
  return nextAddress;
}

export async function removeAddress(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (user && import.meta.env.VITE_SUPABASE_URL) {
    try { await deleteUserAddress(user.id, id); return; } catch { /* fallback */ }
  }
  const next = normalizeLocal(readStorage<CommerceAddress[]>(KEY, []).filter((address) => address.id !== id));
  if (next.length > 0 && !next.some((address) => address.isDefault)) next[0] = { ...next[0], isDefault: true };
  writeStorage(KEY, next);
}

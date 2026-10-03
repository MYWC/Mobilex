import { create } from 'zustand';
import { z } from 'zod';
import { EVENTS, STORAGE_KEYS } from '@/app/config/constants';
import { readValidatedStorage, writeStorage } from '@/lib/storage/storage';
import { emit } from '@/lib/events/bus';
import { getCurrentUser } from '@/services/auth/auth.service';
import {
  addCloudWishlist,
  clearCloudWishlist,
  listCloudWishlist,
  removeCloudWishlist,
} from './wishlist.cloud.service';
import { normalizeError } from '@/lib/errors/app-error';

const schema = z.array(z.string().min(1).max(128)).max(500);
interface WishlistState {
  ids: string[];
  hydrated: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  hydrate: () => void;
  syncWithCloud: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  add: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  has: (id: string) => boolean;
  clear: () => Promise<void>;
  mergeGuestIntoCloud: () => Promise<void>;
}
const persist = (ids: string[]) => {
  const unique = [...new Set(ids)].slice(-500);
  writeStorage(STORAGE_KEYS.wishlist, unique);
  emit(EVENTS.wishlistChanged, { ids: unique, count: unique.length });
  return unique;
};
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  hydrated: false,
  syncing: false,
  lastSyncAt: null,
  hydrate: () => set({ ids: readValidatedStorage(STORAGE_KEYS.wishlist, schema, []), hydrated: true }),
  syncWithCloud: async () => {
    const user = await getCurrentUser();
    if (!user) return;
    set({ syncing: true });
    try {
      const remote = await listCloudWishlist(user.id);
      const remoteIds = remote.map((x) => x.productId);
      const local = get().ids;
      const merged = persist([...remoteIds, ...local]);
      for (const id of merged) {
        if (!remoteIds.includes(id)) await addCloudWishlist(user.id, id);
      }
      set({ ids: merged, lastSyncAt: new Date().toISOString() });
    } catch (error) {
      throw normalizeError(error);
    } finally {
      set({ syncing: false });
    }
  },
  mergeGuestIntoCloud: async () => {
    await get().syncWithCloud();
  },
  has: (id) => get().ids.includes(id),
  toggle: async (id) => {
    if (get().has(id)) await get().remove(id);
    else await get().add(id);
  },
  add: async (id) => {
    if (!id || get().has(id)) return;

    const ids = persist([...get().ids, id]);
    set({ ids });

    try {
      const user = await getCurrentUser();

      if (user) {
        try {
          await addCloudWishlist(user.id, id);
        } catch {
          // Cloud sync failure must not undo the local wishlist.
        }
      }
    } catch {
      // Guest/local wishlist is still valid when auth is unavailable.
    }
  },
  remove: async (id) => {
    const ids = persist(get().ids.filter((x) => x !== id));
    set({ ids });

    try {
      const user = await getCurrentUser();

      if (user) {
        try {
          await removeCloudWishlist(user.id, id);
        } catch {
          // Cloud sync failure must not undo the local wishlist.
        }
      }
    } catch {
      // Local wishlist remains valid when auth is unavailable.
    }
  },
  clear: async () => {
    const user = await getCurrentUser();
    persist([]);
    set({ ids: [] });
    if (user) {
      try {
        await clearCloudWishlist(user.id);
      } catch {}
    }
  },
}));

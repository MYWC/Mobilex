import { create } from 'zustand';
import { STORAGE_KEYS } from '@/app/config/constants';
import { readStorage, writeStorage } from '@/lib/storage/storage';

interface RecentState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => void;
  add: (id: string) => void;
  clear: () => void;
}
export const useRecentStore = create<RecentState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: () =>
    set({
      ids: readStorage<string[]>(STORAGE_KEYS.recentlyViewed, []).filter(Boolean).slice(0, 30),
      hydrated: true,
    }),
  add: (id) => {
    if (!id) return;
    const ids = [id, ...get().ids.filter((x) => x !== id)].slice(0, 30);
    writeStorage(STORAGE_KEYS.recentlyViewed, ids);
    set({ ids });
  },
  clear: () => {
    writeStorage(STORAGE_KEYS.recentlyViewed, []);
    set({ ids: [] });
  },
}));

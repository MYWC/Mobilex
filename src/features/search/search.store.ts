import { create } from 'zustand';
import { STORAGE_KEYS } from '@/app/config/constants';
import { readStorage, writeStorage } from '@/lib/storage/storage';

interface SearchState {
  recent: string[];
  hydrate: () => void;
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}
export const useSearchStore = create<SearchState>((set, get) => ({
  recent: [],
  hydrate: () =>
    set({
      recent: readStorage<string[]>(STORAGE_KEYS.recentSearches, [])
        .filter((x) => typeof x === 'string')
        .slice(0, 8),
    }),
  add: (query) => {
    const q = query.trim();
    if (q.length < 2) return;
    const recent = [q, ...get().recent.filter((x) => x.toLocaleLowerCase() !== q.toLocaleLowerCase())].slice(
      0,
      8,
    );
    writeStorage(STORAGE_KEYS.recentSearches, recent);
    set({ recent });
  },
  remove: (query) => {
    const recent = get().recent.filter((x) => x !== query);
    writeStorage(STORAGE_KEYS.recentSearches, recent);
    set({ recent });
  },
  clear: () => {
    writeStorage(STORAGE_KEYS.recentSearches, []);
    set({ recent: [] });
  },
}));

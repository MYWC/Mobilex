import { create } from 'zustand';
import { z } from 'zod';
import { EVENTS } from '@/app/config/constants';
import { emit } from '@/lib/events/bus';
import { readValidatedStorage, writeStorage } from '@/lib/storage/storage';

const STORAGE_KEY = 'mobilex.compare';
const schema = z.array(z.string().min(1).max(128)).max(4);

interface CompareState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => void;
  has: (id: string) => boolean;
  add: (id: string) => boolean;
  remove: (id: string) => void;
  toggle: (id: string) => boolean;
  clear: () => void;
  isFull: () => boolean;
}

const persist = (ids: string[]) => { const next = [...new Set(ids)].slice(0, 4); writeStorage(STORAGE_KEY, next); emit(EVENTS.compareChanged, { ids: next, count: next.length }); };

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: () => set({ ids: readValidatedStorage(STORAGE_KEY, schema, []), hydrated: true }),
  has: (id) => get().ids.includes(id),
  add: (id) => {
    if (!id || get().has(id) || get().ids.length >= 4) return false;
    const ids = [...get().ids, id];
    persist(ids);
    set({ ids });
    return true;
  },
  remove: (id) => {
    const ids = get().ids.filter((x) => x !== id);
    persist(ids);
    set({ ids });
  },
  toggle: (id) => {
    if (get().has(id)) { get().remove(id); return true; }
    return get().add(id);
  },
  clear: () => { persist([]); set({ ids: [] }); },
  isFull: () => get().ids.length >= 4,
}));

import { create } from 'zustand';
import { subscribeToNetworkStatus } from '@/lib/browser/online';
import { EVENTS } from '@/app/config/constants';
import { emit } from '@/lib/events/bus';

interface RuntimeState {
  online: boolean;
  networkInitialized: boolean;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
  setOnline: (online: boolean) => void;
  initNetworkListener: () => () => void;
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  networkInitialized: false,
  lastOnlineAt: typeof navigator !== 'undefined' && navigator.onLine ? Date.now() : null,
  lastOfflineAt: typeof navigator !== 'undefined' && !navigator.onLine ? Date.now() : null,

  setOnline: (online) => {
    const now = Date.now();
    set({
      online,
      networkInitialized: true,
      lastOnlineAt: online ? now : null,
      lastOfflineAt: online ? null : now,
    });
    emit(EVENTS.networkChanged, { online, at: now });
  },

  initNetworkListener: () => {
    const unsubscribe = subscribeToNetworkStatus((online) => {
      useRuntimeStore.getState().setOnline(online);
    });
    return unsubscribe;
  },
}));

import { create } from 'zustand';
import { z } from 'zod';
import type { NotificationItem, NotificationTone } from '@/features/notifications/notification.types';
import { STORAGE_KEYS } from '@/app/config/constants';
import { readValidatedStorage, writeStorage } from '@/lib/storage/storage';
import { getCurrentUser } from '@/services/auth/auth.service';
import {
  listRemoteNotifications,
  markAllRemoteNotificationsRead,
  markRemoteNotificationRead,
  deleteRemoteNotification,
  subscribeNotifications,
} from './notification.service';

const schema = z
  .array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string().optional(),
      tone: z.enum(['info', 'success', 'warning', 'danger']),
      createdAt: z.number(),
      read: z.boolean(),
      href: z.string().optional(),
    }),
  )
  .max(100);

interface NotificationState {
  items: NotificationItem[];
  hydrated: boolean;
  syncing: boolean;
  realtime: boolean;
  hydrate: () => void;
  syncRemote: () => Promise<void>;
  startRealtime: () => Promise<() => void>;
  push: (
    input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'> &
      Partial<Pick<NotificationItem, 'id' | 'createdAt' | 'read'>>,
  ) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => void;
}

const persist = (items: NotificationItem[]) => writeStorage(STORAGE_KEYS.notifications, items.slice(0, 100));
const mergeNewest = (local: NotificationItem[], remote: NotificationItem[]) => {
  const map = new Map<string, NotificationItem>();
  for (const item of [...remote, ...local]) {
    const prev = map.get(item.id);
    if (!prev || item.createdAt >= prev.createdAt) map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  hydrated: false,
  syncing: false,
  realtime: false,
  hydrate: () => set({ items: readValidatedStorage(STORAGE_KEYS.notifications, schema, []), hydrated: true }),
  syncRemote: async () => {
    const user = await getCurrentUser();
    if (!user) return;
    set({ syncing: true });
    try {
      const remote = await listRemoteNotifications(user.id);
      const items = mergeNewest(get().items, remote);
      persist(items);
      set({ items });
    } finally {
      set({ syncing: false });
    }
  },
  startRealtime: async () => {
    const user = await getCurrentUser();
    if (!user) return () => undefined;
    const unsubscribe = await subscribeNotifications(user.id, () => {
      void get().syncRemote();
    });
    set({ realtime: true });
    return () => {
      unsubscribe();
      set({ realtime: false });
    };
  },
  push: (input) => {
    const item = {
      id: input.id ?? crypto.randomUUID(),
      title: input.title,
      body: input.body,
      tone: input.tone,
      href: input.href,
      createdAt: input.createdAt ?? Date.now(),
      read: input.read ?? false,
    };
    const items = [item, ...get().items.filter((x) => x.id !== item.id)].slice(0, 100);
    persist(items);
    set({ items });
  },
  markRead: async (id) => {
    const user = await getCurrentUser();
    const items = get().items.map((x) => (x.id === id ? { ...x, read: true } : x));
    persist(items);
    set({ items });
    if (user && /^[0-9a-fA-F-]{20,}$/.test(id)) {
      try {
        await markRemoteNotificationRead(user.id, id);
      } catch {}
    }
  },
  markAllRead: async () => {
    const user = await getCurrentUser();
    const items = get().items.map((x) => ({ ...x, read: true }));
    persist(items);
    set({ items });
    if (user) {
      try {
        await markAllRemoteNotificationsRead(user.id);
      } catch {}
    }
  },
  remove: async (id) => {
    const user = await getCurrentUser();
    const items = get().items.filter((x) => x.id !== id);
    persist(items);
    set({ items });
    if (user && /^[0-9a-fA-F-]{20,}$/.test(id)) {
      try {
        await deleteRemoteNotification(user.id, id);
      } catch {}
    }
  },
  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));

export function notify(title: string, body = '', tone: NotificationTone = 'info', href?: string): void {
  useNotificationStore.getState().push({ title, body, tone, href });
}

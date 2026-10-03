import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { AppUser, UserRole } from '@/types/core';
import { getAuthSnapshot, subscribeToAuth, signOut as serviceSignOut } from '@/services/auth/auth.service';
import { normalizeError } from '@/lib/errors/app-error';
import { EVENTS } from '@/app/config/constants';
import { emit } from '@/lib/events/bus';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error';

interface AuthState {
  user: User | null;
  session: Session | null;
  appUser: AppUser | null;
  status: AuthStatus;
  error: ReturnType<typeof normalizeError> | null;
  initialized: boolean;
  initialize: () => Promise<() => void>;
  setSnapshot: (user: User | null, session: Session | null) => void;
  clearError: () => void;
  signOut: () => Promise<void>;
}

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  const rawRole = metadata.role;
  const roles: UserRole[] = ['admin', 'product_manager', 'warehouse', 'support', 'customer'];
  return {
    id: user.id,
    email: user.email,
    fullName:
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : undefined,
    role: roles.includes(rawRole) ? rawRole : 'customer',
    avatarUrl: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  appUser: null,
  status: 'idle',
  error: null,
  initialized: false,

  initialize: async () => {
    set({ status: 'loading', error: null });
    try {
      const snapshot = await getAuthSnapshot();
      get().setSnapshot(snapshot.user, snapshot.session);
      set({ initialized: true });
    } catch (error) {
      const normalized = normalizeError(error);
      set({ status: 'error', error: normalized, initialized: true });
    }

    const unsubscribe = subscribeToAuth(({ user, session }) => {
      get().setSnapshot(user, session);
    });
    return unsubscribe;
  },

  setSnapshot: (user, session) => {
    const authenticated = Boolean(user && session);
    set({
      user,
      session,
      appUser: toAppUser(user),
      status: authenticated ? 'authenticated' : 'anonymous',
      error: null,
      initialized: true,
    });
    emit(EVENTS.authChanged, { authenticated, userId: user?.id ?? null });
  },

  clearError: () => set({ error: null, status: get().user ? 'authenticated' : 'anonymous' }),

  signOut: async () => {
    set({ status: 'loading', error: null });
    try {
      await serviceSignOut();
      get().setSnapshot(null, null);
    } catch (error) {
      set({ status: 'error', error: normalizeError(error) });
      throw error;
    }
  },
}));

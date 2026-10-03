import { create } from 'zustand';
import type { Locale, ThemeMode, ResolvedTheme } from '@/types/core';
import { APP, EVENTS, STORAGE_KEYS } from '@/app/config/constants';
import { detectLocale, setLocale } from '@/lib/i18n/i18n';
import { readStorage, writeStorage } from '@/lib/storage/storage';
import { emit } from '@/lib/events/bus';

interface AppState {
  locale: Locale;
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  mobileNavOpen: boolean;
  globalLoading: boolean;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setMobileNavOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  hydrate: () => void;
  resolveSystemTheme: () => void;
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(theme);
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }
  return resolved;
}

export const useAppStore = create<AppState>((set, get) => ({
  locale: detectLocale(),
  theme: readStorage<ThemeMode>(STORAGE_KEYS.theme, APP.defaultTheme),
  resolvedTheme: 'light',
  mobileNavOpen: false,
  globalLoading: false,
  hydrated: false,

  setLocale: (locale) => {
    setLocale(locale);
    emit(EVENTS.localeChanged, locale);
    set({ locale });
  },

  setTheme: (theme) => {
    const resolvedTheme = applyTheme(theme);
    writeStorage(STORAGE_KEYS.theme, theme);
    emit(EVENTS.themeChanged, { theme, resolvedTheme });
    set({ theme, resolvedTheme });
  },

  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  resolveSystemTheme: () => {
    const { theme } = get();
    set({ resolvedTheme: applyTheme(theme) });
  },

  hydrate: () => {
    const locale = readStorage<Locale>(STORAGE_KEYS.locale, detectLocale());
    const theme = readStorage<ThemeMode>(STORAGE_KEYS.theme, APP.defaultTheme);
    const resolvedTheme = applyTheme(theme);
    setLocale(locale);
    set({ locale, theme, resolvedTheme, hydrated: true });
  },
}));

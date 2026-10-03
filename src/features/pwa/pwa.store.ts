import { create } from 'zustand';

interface PwaState {
  supported: boolean;
  installable: boolean;
  installed: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  deferredPrompt: BeforeInstallPromptEvent | null;
  setInstallable: (prompt: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
  setUpdateAvailable: (registration: ServiceWorkerRegistration | null) => void;
  setRegistration: (registration: ServiceWorkerRegistration | null) => void;
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
}
export interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>; }

export const usePwaStore = create<PwaState>((set, get) => ({
  supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  installable: false,
  installed: typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches === true,
  updateAvailable: false,
  registration: null,
  deferredPrompt: null,
  setInstallable: (prompt) => set({ installable: Boolean(prompt), deferredPrompt: prompt }),
  setInstalled: (installed) => set({ installed, installable: false, deferredPrompt: null }),
  setUpdateAvailable: (registration) => set({ updateAvailable: Boolean(registration), registration }),
  setRegistration: (registration) => set({ registration }),
  promptInstall: async () => {
    const prompt = get().deferredPrompt; if (!prompt) return false;
    await prompt.prompt(); const choice = await prompt.userChoice; set({ installable: false, deferredPrompt: null, installed: choice.outcome === 'accepted' }); return choice.outcome === 'accepted';
  },
  applyUpdate: () => {
    const registration = get().registration;
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    const reload = () => window.location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true });
  },
}));

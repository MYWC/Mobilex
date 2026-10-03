import { usePwaStore } from '@/features/pwa/pwa.store';
import { logger } from '@/lib/logger/logger';
import { appBasePath } from '@/lib/ux/paths';

export async function registerPwa(): Promise<(() => void) | undefined> {
  if (import.meta.env.DEV || typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return undefined;
  try {
    const base = appBasePath();
    const registration = await navigator.serviceWorker.register(`${base}sw.js`, {
      scope: base,
      updateViaCache: 'none',
    });
    usePwaStore.getState().setRegistration(registration);
    const detectUpdate = () => {
      if (registration.waiting) usePwaStore.getState().setUpdateAvailable(registration);
    };
    detectUpdate();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) detectUpdate();
      });
    });
    return () => undefined;
  } catch (error) {
    logger.warn('PWA registration failed', { error: String(error) });
    return undefined;
  }
}

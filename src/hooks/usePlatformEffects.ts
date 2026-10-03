import { useEffect } from 'react';
import { registerPwa } from '@/lib/pwa/register';
import { usePwaStore } from '@/features/pwa/pwa.store';
import { startPerformanceMonitoring } from '@/lib/performance/metrics';
import { initGlobalObservability, track } from '@/lib/observability/telemetry';
import { useAppStore } from '@/stores/useAppStore';
import { hardenExternalAnchors, disableUnsafeWindowOpen } from '@/lib/security/client';
import { setOrganizationSchema, setWebsiteSchema } from '@/lib/seo/schema';

export function usePlatformEffects(): void {
  useEffect(() => {
    const offObs = initGlobalObservability();
    const offPerf = startPerformanceMonitoring();
    void registerPwa();
    hardenExternalAnchors();
    disableUnsafeWindowOpen();
    setOrganizationSchema();
    setWebsiteSchema();
    return () => {
      offObs();
      offPerf();
    };
  }, []);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      usePwaStore.getState().setInstallable(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      usePwaStore.getState().setInstalled(true);
      track({ type: 'custom', name: 'pwa_installed' });
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    const update = () => useAppStore.getState().resolveSystemTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => hardenExternalAnchors());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

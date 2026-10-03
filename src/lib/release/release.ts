import { appEnv } from '@/app/config/env';
import { APP } from '@/app/config/constants';

export interface ReleaseCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface ReleaseSnapshot {
  version: string;
  environment: string;
  generatedAt: string;
  checks: ReleaseCheck[];
  blockers: number;
  warnings: number;
}

export function getReleaseSnapshot(): ReleaseSnapshot {
  const checks: ReleaseCheck[] = [
    {
      id: 'supabase',
      label: 'Supabase',
      ok: appEnv.isSupabaseConfigured,
      detail: appEnv.isSupabaseConfigured ? 'Client credentials are configured.' : 'Configure VITE_SUPABASE_URL and the publishable/anon key.',
      severity: 'critical',
    },
    {
      id: 'demo',
      label: 'Demo mode',
      ok: !appEnv.isProduction || !appEnv.allowDemoMode,
      detail: appEnv.isProduction ? 'Production demo fallback is disabled.' : 'Demo fallback is allowed only for development.',
      severity: 'critical',
    },
    {
      id: 'pwa',
      label: 'PWA',
      ok: typeof navigator === 'undefined' || 'serviceWorker' in navigator,
      detail: 'Service Worker capability is available in supported browsers.',
      severity: 'warning',
    },
    {
      id: 'storage',
      label: 'Local state',
      ok: typeof window === 'undefined' || !!window.localStorage,
      detail: 'Local state is available for cart, wishlist and preferences.',
      severity: 'warning',
    },
    {
      id: 'runtime',
      label: 'Runtime',
      ok: true,
      detail: `Mobilex ${APP.version} · ${appEnv.appEnv}`,
      severity: 'info',
    },
    {
      id: 'payment-boundary',
      label: 'Payment boundary',
      ok: !appEnv.isProduction || appEnv.paymentMode !== 'live' || appEnv.isSupabaseConfigured,
      detail: appEnv.paymentMode === 'live' ? 'Live payment mode is declared; verify server-side gateway, webhook and staging transactions before launch.' : 'Payment secrets and webhook verification remain server-side; configure the gateway adapter before accepting live payments.',
      severity: 'warning',
    },
  ];

  return {
    version: APP.version,
    environment: appEnv.appEnv,
    generatedAt: new Date().toISOString(),
    checks,
    blockers: checks.filter((c) => c.severity === 'critical' && !c.ok).length,
    warnings: checks.filter((c) => c.severity === 'warning' && !c.ok).length,
  };
}

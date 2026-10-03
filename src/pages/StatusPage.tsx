import { Activity, CheckCircle2, CloudOff, Wifi, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { appEnv } from '@/app/config/env';
import { APP } from '@/app/config/constants';
import { setPageSeo } from '@/lib/seo/seo';
import { useEffect } from 'react';

export function StatusPage() {
  const online = useRuntimeStore((s) => s.online);
  const auth = useAuthStore((s) => s.status);
  useEffect(
    () =>
      setPageSeo('System Status | Mobilex', 'Mobilex runtime and platform status.', '/status', {
        noindex: true,
      }),
    [],
  );
  const rows = useMemo(
    () => [
      { label: 'Application', value: `Mobilex ${APP.version}`, ok: true, icon: <Activity size={16} /> },
      { label: 'Network', value: online ? 'Online' : 'Offline', ok: online, icon: <Wifi size={16} /> },
      {
        label: 'Supabase',
        value: appEnv.isSupabaseConfigured ? 'Configured' : 'Demo mode',
        ok: appEnv.isSupabaseConfigured,
        icon: appEnv.isSupabaseConfigured ? <ShieldCheck size={16} /> : <CloudOff size={16} />,
      },
      { label: 'Authentication', value: auth, ok: auth !== 'error', icon: <CheckCircle2 size={16} /> },
    ],
    [online, auth],
  );
  return (
    <main className="mx-status-page mx-shell">
      <div className="mx-status-hero mx-glass-panel">
        <span className="mx-badge mx-badge-primary">MOBILEX PLATFORM</span>
        <h1>وضعیت سیستم</h1>
        <p>یک نمای سریع از وضعیت runtime، اتصال و سرویس‌های اصلی برنامه.</p>
      </div>
      <div className="mx-status-grid">
        {rows.map((row) => (
          <article className="mx-card mx-card-interactive" key={row.label}>
            <div className="mx-status-icon">{row.icon}</div>
            <div>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
            <b className={row.ok ? 'is-ok' : 'is-bad'}>{row.ok ? 'OK' : 'CHECK'}</b>
          </article>
        ))}
      </div>
    </main>
  );
}

import { CheckCircle2, CircleAlert, ExternalLink, Rocket, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getReleaseSnapshot } from '@/lib/release/release';
import { APP } from '@/app/config/constants';

export function AdminReleasePage() {
  const release = getReleaseSnapshot();
  const allGreen = release.blockers === 0;
  return (
    <AdminShell title="مرکز انتشار Mobilex 2.0">
      <div className="mx-release-hero mx-glass-panel">
        <div className="mx-release-orb"><Rocket size={28}/></div>
        <div>
          <span className="mx-badge mx-badge-primary">FINAL RELEASE</span>
          <h1>Mobilex {APP.version}</h1>
          <p>کنترل نهایی محیط، امنیت، پرداخت و آمادگی انتشار.</p>
        </div>
        <div className={`mx-release-status ${allGreen ? 'is-ready' : 'is-blocked'}`}>
          {allGreen ? <CheckCircle2 size={16}/> : <XCircle size={16}/>} {allGreen ? 'آماده' : `${release.blockers} مسدودکننده`}
        </div>
      </div>

      <div className="mx-release-metrics">
        <article className="mx-card"><Sparkles size={17}/><strong>{release.checks.filter(c=>c.ok).length}</strong><span>کنترل موفق</span></article>
        <article className="mx-card"><CircleAlert size={17}/><strong>{release.warnings}</strong><span>هشدار</span></article>
        <article className="mx-card"><ShieldCheck size={17}/><strong>{release.blockers}</strong><span>مسدودکننده</span></article>
        <article className="mx-card"><Rocket size={17}/><strong>2.0</strong><span>نسخه</span></article>
      </div>

      <div className="mx-release-grid">
        <Card>
          <div className="mx-settings-head"><div className="mx-settings-icon"><ShieldCheck/></div><div><h3>Release Gates</h3><p>کنترل‌های سمت کاربر برای انتشار نهایی</p></div></div>
          <div className="mx-release-checks">
            {release.checks.map((check) => (
              <div className={`mx-release-check ${check.ok ? 'is-ok' : 'is-fail'}`} key={check.id}>
                <div className="mx-release-check-icon">{check.ok ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}</div>
                <div><strong>{check.label}</strong><p>{check.detail}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mx-settings-head"><div className="mx-settings-icon"><Rocket/></div><div><h3>قبل از Go-Live</h3><p>مواردی که خارج از UI باید انجام شوند</p></div></div>
          <ol className="mx-release-list">
            <li>Migration <code>0010_final_release_payment_webhooks.sql</code> را روی Supabase اعمال کن.</li>
            <li>Edge Functionهای پرداخت را deploy و secrets مربوط به gateway و webhook را تنظیم کن.</li>
            <li>با gateway واقعی یک پرداخت sandbox و webhook امضاشده را تست کن.</li>
            <li>روی محیط staging، `npm run quality:phase10` را اجرا کن.</li>
            <li>بعد از تأیید staging، build نهایی را روی دامنه اصلی deploy کن.</li>
          </ol>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button variant="secondary" onClick={()=>window.location.href='/status'} icon={<ExternalLink size={14}/>}>وضعیت سیستم</Button>
            <Button variant="secondary" onClick={()=>window.location.href='/'}>مشاهده فروشگاه</Button>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

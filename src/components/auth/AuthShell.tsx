import { Smartphone, ShieldCheck, Zap, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PropsWithChildren, ReactNode } from 'react';
import { routes } from '@/app/routes/routeConfig';

export function AuthShell({
  title,
  subtitle,
  children,
  asideTitle = 'تجربه‌ای سریع و امن',
  asideText = 'حساب Mobilex برای مدیریت سفارش‌ها، آدرس‌ها، علاقه‌مندی‌ها و تجربه شخصی‌شده فروشگاه استفاده می‌شود.',
  asideIcon,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  asideTitle?: string;
  asideText?: string;
  asideIcon?: ReactNode;
}>) {
  return (
    <main className="mx-auth-page mx-shell">
      <section className="mx-auth-grid">
        <div className="mx-auth-panel mx-glass-panel">
          <Link to={routes.home} className="mx-auth-brand">
            <span className="mx-brand-mark">
              <span>MX</span>
            </span>
            <div>
              <strong>
                Mobile<em>x</em>
              </strong>
              <small>2.0 Commerce</small>
            </div>
          </Link>
          <div className="mx-auth-copy">
            <span className="mx-badge mx-badge-primary">
              <Sparkles size={11} /> MOBILEX ACCOUNT
            </span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
        <aside className="mx-auth-aside mx-glass-panel">
          <div className="mx-auth-aside-art">
            <div className="mx-auth-orbit one"></div>
            <div className="mx-auth-orbit two"></div>
            <div className="mx-auth-orbit three"></div>
            <div className="mx-auth-phone">
              <Smartphone size={44} />
            </div>
          </div>
          <div className="mx-auth-aside-copy">
            <div className="mx-auth-aside-icon">{asideIcon ?? <ShieldCheck size={20} />}</div>
            <h2>{asideTitle}</h2>
            <p>{asideText}</p>
            <div className="mx-auth-trust-row">
              <span>
                <Zap size={14} /> سریع
              </span>
              <span>
                <ShieldCheck size={14} /> امن
              </span>
              <span>
                <ArrowLeft size={14} /> یکپارچه
              </span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

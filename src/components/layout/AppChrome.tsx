import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CompareTray } from '@/components/compare/CompareTray';

export function AppChrome({ children }: PropsWithChildren) {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  if (isAdmin)
    return (
      <div className="mx-app-frame mx-admin-frame">
        <div id="main-content" tabIndex={-1} className="mx-main-content">
          {children}
        </div>
      </div>
    );
  return (
    <div className="mx-app-frame">
      <SiteHeader />
      <CompareTray />
      <main id="main-content" tabIndex={-1} className="mx-main-content">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

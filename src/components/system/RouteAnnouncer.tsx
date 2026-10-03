import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

export function RouteAnnouncer() {
  const location = useLocation();
  const locale = useAppStore(s => s.locale);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const label = locale === 'fa' ? `صفحه ${document.title}` : `Page ${document.title}`; if (ref.current) ref.current.textContent = label; document.getElementById('main-content')?.focus({ preventScroll: true }); }, [location.pathname, location.search, locale]);
  return <div ref={ref} className="sr-only" aria-live="polite" aria-atomic="true" />;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function scrollToTop(options: ScrollToOptions = { top: 0, behavior: 'smooth' }): void {
  if (typeof window === 'undefined') return;
  const reduceMotion = window.matchMedia?.(REDUCED_MOTION).matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : (options.behavior ?? 'smooth') });
}

export function useNavigationEffects(): void {
  const location = useLocation();
  useEffect(() => {
    scrollToTop({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname, location.search, location.hash]);
}

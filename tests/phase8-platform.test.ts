import { describe, expect, it, beforeEach } from 'vitest';
import { getClientHealthSnapshot } from '@/lib/qa/health';
import { setBreadcrumbSchema } from '@/lib/seo/schema';
import { routes } from '@/app/routes/routeConfig';
import { useAppStore } from '@/stores/useAppStore';

describe('Phase 8 platform hardening', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('exposes a diagnostic status surface without mutating domain state', () => {
    const beforeTheme = useAppStore.getState().theme;
    const snapshot = getClientHealthSnapshot();
    expect(snapshot.timestamp).toMatch(/T/);
    expect(typeof snapshot.cartCount).toBe('number');
    expect(useAppStore.getState().theme).toBe(beforeTheme);
  });

  it('publishes breadcrumb schema with absolute item URLs', () => {
    window.history.replaceState({}, '', '/products');
    setBreadcrumbSchema([
      { name: 'خانه', path: '/' },
      { name: 'محصولات', path: routes.products },
    ]);
    const json = document.getElementById('mobilex-schema-breadcrumb');
    expect(json?.textContent).toContain('BreadcrumbList');
    expect(json?.textContent).toContain(`${window.location.origin}/products`);
  });

  it('keeps public status route registered', () => {
    expect(routes.status).toBe('/status');
  });
});

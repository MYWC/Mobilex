import { describe, expect, it } from 'vitest';
import { MemoryCache } from '@/lib/cache/memory-cache';
import { setSeo } from '@/lib/seo/seo';

describe('Phase 7 platform', () => {
  it('expires cached values deterministically', async () => {
    const cache = new MemoryCache<string>();
    cache.set('a', 'value', { ttlMs: 5 });
    expect(cache.get('a')).toBe('value');
    await new Promise((resolve) => setTimeout(resolve, 8));
    expect(cache.get('a')).toBeUndefined();
  });

  it('creates canonical and social SEO metadata', () => {
    document.head.innerHTML = '';
    setSeo({ title: 'Mobilex', description: 'Storefront', path: '/products' });
    expect(document.title).toBe('Mobilex');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Storefront',
    );
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Mobilex');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/products');
  });
});

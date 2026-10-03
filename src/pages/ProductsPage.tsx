import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { ActiveFilters } from '@/components/catalog/ActiveFilters';
import { Pagination } from '@/components/catalog/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCatalogStore } from '@/features/catalog/catalog.store';
import { useSearchStore } from '@/features/search/search.store';
import { useAppStore } from '@/stores/useAppStore';
import { usePageSeo } from '@/hooks/usePageSeo';
import { resolveAppUrl } from '@/lib/ux/paths';

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const locale = useAppStore((s) => s.locale);
  const fa = locale === 'fa';
  const f = useCatalogStore((s) => s.filters);
  const products = useCatalogStore((s) => s.products);
  const total = useCatalogStore((s) => s.total);
  const loading = useCatalogStore((s) => s.loading);
  const error = useCatalogStore((s) => s.error);
  const brands = useCatalogStore((s) => s.brands);
  const categories = useCatalogStore((s) => s.categories);
  const hydrate = useCatalogStore((s) => s.hydrateFromUrl);
  const load = useCatalogStore((s) => s.load);
  const facets = useCatalogStore((s) => s.loadFacets);
  const setQuery = useCatalogStore((s) => s.setQuery);
  const addSearch = useSearchStore((s) => s.add);
  usePageSeo(
    {
      title: f.query ? `جستجو — ${f.query}` : fa ? 'محصولات | Mobilex' : 'Products | Mobilex',
      description: fa
        ? 'فهرست محصولات، فیلترها و مرتب‌سازی فروشگاه Mobilex.'
        : 'Browse Mobilex products with filters and sorting.',
      path: '/products',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: fa ? 'محصولات Mobilex' : 'Mobilex Products',
      url: resolveAppUrl('/products'),
    },
  );
  useEffect(() => {
    hydrate(params);
  }, [params, hydrate]);
  useEffect(() => {
    void facets();
  }, [facets]);
  useEffect(() => {
    void load();
  }, [f]);
  useEffect(() => {
    const next = new URLSearchParams();
    if (f.query) next.set('q', f.query);
    if (f.brandIds.length) next.set('brand', f.brandIds.join(','));
    if (f.categoryIds.length) next.set('category', f.categoryIds.join(','));
    if (f.ratings.length) next.set('rating', f.ratings.join(','));
    if (f.onlyInStock) next.set('stock', '1');
    if (f.onlyDiscounted) next.set('sale', '1');
    if (f.onlyNew) next.set('new', '1');
    if (f.minPrice != null) next.set('min', String(f.minPrice));
    if (f.maxPrice != null) next.set('max', String(f.maxPrice));
    if (f.sort !== 'relevance') next.set('sort', f.sort);
    if (f.page > 1) next.set('page', String(f.page));
    const current = params.toString();
    if (next.toString() !== current) setParams(next, { replace: true });
  }, [f, setParams, params]);
  return (
    <div className="mx-page mx-catalog-page">
      <div className="mx-shell">
        <div className="mx-breadcrumb">
          <Link to="/">خانه</Link>
          <span>›</span>
          <strong>{fa ? 'محصولات' : 'Products'}</strong>
        </div>
        <SectionHeading
          eyebrow="CATALOG"
          title={f.query ? `نتایج «${f.query}»` : fa ? 'همه محصولات' : 'All products'}
          description={
            fa
              ? `${total.toLocaleString('fa-IR')} محصول برای کشف، مقایسه و انتخاب.`
              : `${total} products to discover, compare and choose.`
          }
        />
        <div className="mx-catalog-searchbar">
          <Search size={16} />
          <input
            value={f.query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && f.query.trim()) addSearch(f.query);
            }}
            placeholder={fa ? 'جستجوی سریع در محصولات…' : 'Search products…'}
          />
          {f.query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear">
              <X size={14} />
            </button>
          )}
        </div>
        <ActiveFilters />
        <div className="mx-catalog-layout">
          <FilterSidebar brands={brands} categories={categories} />
          <main className="mx-catalog-main">
            <CatalogToolbar brands={brands} categories={categories} />
            {error && (
              <div className="mx-error-inline">
                <strong>دریافت محصولات با مشکل مواجه شد.</strong>
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  تلاش دوباره
                </Button>
              </div>
            )}
            {loading ? (
              <div className="mx-product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="mx-skeleton-catalog">
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </div>
                ))}
              </div>
            ) : products.length ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="محصولی پیدا نشد"
                description="فیلترها یا عبارت جستجو را تغییر دهید."
                icon={<SlidersHorizontal />}
                actions={
                  <Button variant="outline" onClick={() => useCatalogStore.getState().clearFilters()}>
                    پاک کردن فیلترها
                  </Button>
                }
              />
            )}
            <Pagination />
          </main>
        </div>
      </div>
    </div>
  );
}

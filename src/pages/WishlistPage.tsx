import { Heart, PackageCheck, RefreshCw, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { listProducts } from '@/services/catalog/catalog.service';
import type { CatalogProduct } from '@/types/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMessage } from '@/lib/i18n/i18n';

export function WishlistPage() {
  const fa = useAppStore((s) => s.locale) === 'fa';
  const ids = useWishlistStore((s) => s.ids);
  const hydrate = useWishlistStore((s) => s.hydrate);
  const sync = useWishlistStore((s) => s.syncWithCloud);
  const clear = useWishlistStore((s) => s.clear);
  const syncing = useWishlistStore((s) => s.syncing);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (ids.length) {
      setLoading(true);
      void listProducts({
        query: '',
        brandIds: [],
        categoryIds: [],
        ratings: [],
        onlyInStock: false,
        onlyDiscounted: false,
        onlyNew: false,
        sort: 'relevance',
        page: 1,
        pageSize: 500,
      })
        .then((r) => setProducts(r.products.filter((p) => ids.includes(p.id))))
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [ids]);
  useEffect(() => {
    void sync().catch(() => undefined);
  }, [sync]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return q
      ? products.filter((p) =>
          [p.nameFa, p.nameEn, p.sku, p.brand?.nameFa, p.brand?.nameEn]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase()
            .includes(q),
        )
      : products;
  }, [products, query]);
  if (!ids.length)
    return (
      <div className="mx-page">
        <div className="mx-shell mx-account-page">
          <EmptyState
            icon={<Heart size={30} />}
            tone="primary"
            title={fa ? 'لیست علاقه‌مندی شما خالی است' : 'Your wishlist is empty'}
            description={
              fa
                ? 'محصولات موردعلاقه‌ات را ذخیره کن تا بعداً سریع پیدایشان کنی.'
                : 'Save products you love and come back to them later.'
            }
            actions={
              <Link to="/products">
                <Button icon={<ShoppingCart size={15} />}>{fa ? 'مشاهده محصولات' : 'Browse products'}</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  return (
    <div className="mx-page">
      <div className="mx-shell mx-account-page">
        <div className="mx-breadcrumb">
          <Link to="/">{fa ? 'خانه' : 'Home'}</Link>
          <span>›</span>
          <strong>{fa ? 'علاقه‌مندی‌ها' : 'Wishlist'}</strong>
        </div>
        <div className="mx-account-heading">
          <div>
            <span className="mx-section-kicker">WISHLIST</span>
            <h1>{fa ? 'علاقه‌مندی‌های من' : 'My wishlist'}</h1>
            <p>
              {ids.length} {fa ? 'محصول ذخیره شده' : 'saved products'} ·{' '}
              {syncing
                ? fa
                  ? 'در حال همگام‌سازی…'
                  : 'Syncing…'
                : fa
                  ? 'همگام با حساب'
                  : 'Synced when logged in'}
            </p>
          </div>
          <div className="mx-account-actions">
            <Button
              variant="outline"
              onClick={() => void sync()}
              loading={syncing}
              icon={<RefreshCw size={14} />}
            >
              {fa ? 'همگام‌سازی' : 'Sync'}
            </Button>
            <Button variant="danger" onClick={() => void clear()} icon={<Trash2 size={14} />}>
              {fa ? 'پاک کردن' : 'Clear'}
            </Button>
          </div>
        </div>
        <Card className="mx-wishlist-toolbar">
          <div className="mx-wishlist-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={fa ? 'جستجو در علاقه‌مندی‌ها…' : 'Search wishlist…'}
            />
          </div>
          <div className="mx-wishlist-stats">
            <span>
              <Heart size={14} />
              {ids.length} {fa ? 'ذخیره‌شده' : 'saved'}
            </span>
            <span>
              <PackageCheck size={14} />
              {products.filter((p) => p.stock > 0).length} {fa ? 'موجود' : 'in stock'}
            </span>
          </div>
        </Card>
        {loading ? (
          <Card className="mx-order-loading">
            <div className="mx-spinner" />
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Search size={28} />}
              title={fa ? 'نتیجه‌ای پیدا نشد' : 'No results'}
              description={fa ? 'جستجو را تغییر دهید.' : 'Change your search.'}
            />
          </Card>
        ) : (
          <div className="mx-product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

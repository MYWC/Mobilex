import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, GitCompareArrows, ShoppingCart, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { RatingStars } from '@/components/product/RatingStars';
import { useAppStore } from '@/stores/useAppStore';
import { useCompareStore } from '@/features/compare/compare.store';
import { getProductById } from '@/services/catalog/catalog.service';
import type { CatalogProduct } from '@/types/catalog';
import { useCartStore } from '@/features/cart/cart.store';

export function ComparePage() {
  const fa = useAppStore((s) => s.locale === 'fa');
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all(ids.map((id) => getProductById(id)))
      .then((rows) => {
        if (!active) return;
        setProducts(rows.filter(Boolean) as CatalogProduct[]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ids]);
  const specs = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((p) => Object.keys(p.specs ?? {}).forEach((k) => keys.add(k)));
    return [...keys];
  }, [products]);
  const addLine = (p: CatalogProduct) => {
    if (p.variants.length) {
      navigate(`/products/${p.slug}?buy=1`);
      return;
    }
    if (p.stock <= 0) return;
    const price = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    add({
      cartKey: p.id,
      id: p.id,
      variantId: null,
      variantLabel: '',
      name_fa: p.nameFa,
      name_en: p.nameEn,
      slug: p.slug,
      price,
      compareAtPrice: p.price,
      image: p.images[0]?.url,
      quantity: 1,
      maxQuantity: p.stock,
    });
  };
  if (!ids.length)
    return (
      <div className="mx-page">
        <div className="mx-shell mx-growth-empty">
          <Badge tone="primary">COMPARE</Badge>
          <h1>{fa ? 'مقایسه محصولات' : 'Compare products'}</h1>
          <p>
            {fa
              ? 'حداقل دو محصول را از کارت محصولات برای مقایسه انتخاب کنید.'
              : 'Select products from the catalog to compare them side by side.'}
          </p>
          <Link to="/products">
            <Button iconAfter={<ArrowLeft size={16} />}>{fa ? 'رفتن به محصولات' : 'Browse products'}</Button>
          </Link>
        </div>
      </div>
    );
  return (
    <div className="mx-page">
      <div className="mx-shell">
        <div className="mx-page-heading-row">
          <div>
            <div className="mx-kicker">SMART SHOPPING</div>
            <h1>{fa ? 'مقایسه حرفه‌ای محصولات' : 'Professional product comparison'}</h1>
            <p>
              {fa
                ? 'مشخصات، قیمت، امتیاز و وضعیت موجودی را کنار هم ببینید.'
                : 'Compare specifications, pricing, rating, and availability side by side.'}
            </p>
          </div>
          <div className="mx-flex-actions">
            <Button variant="outline" onClick={clear} icon={<Trash2 size={16} />}>
              {fa ? 'پاک کردن مقایسه' : 'Clear comparison'}
            </Button>
          </div>
        </div>
        <div className="mx-compare-topbar">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={18} />
            <strong>{ids.length}/4</strong>
            <span>{fa ? 'محصول در مقایسه' : 'products compared'}</span>
          </div>
          <div className="text-xs text-slate-500">{fa ? 'حداکثر ۴ محصول' : 'Up to 4 products'}</div>
        </div>
        {loading ? (
          <div className="mx-compare-loading">
            {fa ? 'در حال آماده‌سازی مقایسه…' : 'Preparing comparison…'}
          </div>
        ) : (
          <>
            <div className="mx-compare-grid">
              {products.map((p) => (
                <Card key={p.id} interactive className="mx-compare-product">
                  <button className="mx-compare-remove" onClick={() => remove(p.id)} aria-label="remove">
                    <X size={15} />
                  </button>
                  <Link to={`/products/${p.slug}`} className="mx-compare-image">
                    {p.images[0]?.url ? (
                      <img src={p.images[0].url} alt={fa ? p.nameFa : p.nameEn || p.nameFa} />
                    ) : (
                      <span>M</span>
                    )}
                  </Link>
                  <div className="mx-compare-body">
                    <div className="mx-product-brand">
                      {fa ? p.brand?.nameFa || '' : p.brand?.nameEn || p.brand?.nameFa || ''}
                    </div>
                    <Link to={`/products/${p.slug}`} className="mx-product-title">
                      {fa ? p.nameFa : p.nameEn || p.nameFa}
                    </Link>
                    <RatingStars value={p.review.rating} count={p.review.count} />
                    <PriceDisplay price={p.price} salePrice={p.salePrice} size="sm" />
                    <Button
                      size="sm"
                      fullWidth
                      disabled={p.stock <= 0}
                      onClick={() => addLine(p)}
                      icon={<ShoppingCart size={14} />}
                    >
                      {p.stock <= 0
                        ? fa
                          ? 'ناموجود'
                          : 'Out of stock'
                        : p.variants.length
                          ? fa
                            ? 'انتخاب مدل'
                            : 'Choose options'
                          : fa
                            ? 'افزودن به سبد'
                            : 'Add to cart'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="mx-compare-table-card">
              <div className="mx-compare-table-wrap">
                <table className="mx-compare-table">
                  <thead>
                    <tr>
                      <th>{fa ? 'مشخصه' : 'Feature'}</th>
                      {products.map((p) => (
                        <th key={p.id}>{fa ? p.nameFa : p.nameEn || p.nameFa}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{fa ? 'برند' : 'Brand'}</td>
                      {products.map((p) => (
                        <td key={p.id}>
                          {fa ? p.brand?.nameFa || '—' : p.brand?.nameEn || p.brand?.nameFa || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>{fa ? 'امتیاز' : 'Rating'}</td>
                      {products.map((p) => (
                        <td key={p.id}>
                          {p.review.rating.toFixed(1)}{' '}
                          <span className="text-slate-400">({p.review.count})</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>{fa ? 'موجودی' : 'Availability'}</td>
                      {products.map((p) => (
                        <td key={p.id}>
                          <Badge tone={p.stock > 0 ? 'success' : 'danger'} dot>
                            {p.stock > 0 ? (fa ? 'موجود' : 'In stock') : fa ? 'ناموجود' : 'Out'}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>{fa ? 'تعداد مدل' : 'Variants'}</td>
                      {products.map((p) => (
                        <td key={p.id}>{p.variants.length || '—'}</td>
                      ))}
                    </tr>
                    {specs.map((k) => (
                      <tr key={k}>
                        <td>{k}</td>
                        {products.map((p) => (
                          <td key={p.id}>{p.specs?.[k] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default ComparePage;

import { Heart, ShoppingCart, Eye, ArrowUpLeft, GitCompareArrows } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { CatalogProduct } from '@/types/catalog';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { RatingStars } from '@/components/product/RatingStars';
import { cn } from '@/lib/ui/cn';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { useCartStore } from '@/features/cart/cart.store';
import { useAppStore } from '@/stores/useAppStore';
import { useCompareStore } from '@/features/compare/compare.store';
import { trackGrowthEvent } from '@/features/recommendations/growth.events';

function mainImage(product: CatalogProduct) {
  return product.images.find((i) => i.isMain)?.url || product.images[0]?.url;
}
function stockLabel(p: CatalogProduct, fa: boolean) {
  return p.stock <= 0
    ? fa
      ? 'ناموجود'
      : 'Out of stock'
    : p.stock <= 3
      ? fa
        ? `موجودی محدود · ${p.stock}`
        : `Only ${p.stock} left`
      : fa
        ? 'موجود'
        : 'In stock';
}

export function ProductCard({ product, compact = false }: { product: CatalogProduct; compact?: boolean }) {
  const locale = useAppStore((s) => s.locale);
  const fa = locale === 'fa';
  const wished = useWishlistStore((s) => s.has(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const add = useCartStore((s) => s.add);
  const navigate = useNavigate();
  const compareHas = useCompareStore((s) => s.has(product.id));
  const compareToggle = useCompareStore((s) => s.toggle);
  const image = mainImage(product);
  const sale = Boolean(product.salePrice && product.salePrice < product.price);
  const discount = sale
    ? Math.round(((product.price - (product.salePrice || product.price)) / product.price) * 100)
    : 0;
  const addCart = () => {
    void trackGrowthEvent('add_to_cart', {
      productId: product.id,
      quantity: 1,
      variantRequired: product.variants.length > 0,
    });
    if (product.variants.length) navigate(`/products/${product.slug}?buy=1`);
    else if (product.stock > 0) {
      add({
        cartKey: product.id,
        id: product.id,
        variantId: null,
        variantLabel: '',
        name_fa: product.nameFa,
        name_en: product.nameEn,
        slug: product.slug,
        price: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
        image,
        quantity: 1,
      });
    }
  };
  return (
    <Card interactive className={cn('mx-product-card', compact && 'mx-product-card-compact')}>
      <div className="mx-product-media">
        <Link
          to={`/products/${product.slug}`}
          aria-label={fa ? product.nameFa : product.nameEn || product.nameFa}
        >
          {image ? (
            <img src={image} alt={fa ? product.nameFa : product.nameEn || product.nameFa} loading="lazy" />
          ) : (
            <div className="mx-product-media-empty">M</div>
          )}
        </Link>
        <div className="mx-product-badges">
          {product.isNew && (
            <Badge tone="info" dot>
              {fa ? 'جدید' : 'New'}
            </Badge>
          )}
          {sale && <Badge tone="danger">{discount}%</Badge>}
        </div>
        <IconButton
          label={
            wished
              ? fa
                ? 'حذف از علاقه‌مندی'
                : 'Remove from wishlist'
              : fa
                ? 'افزودن به علاقه‌مندی'
                : 'Add to wishlist'
          }
          className={cn('mx-product-wish', wished && 'is-active')}
          onClick={() => {
            void trackGrowthEvent('wishlist', { productId: product.id, action: wished ? 'remove' : 'add' });
            void toggleWish(product.id);
          }}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </IconButton>
        <IconButton
          label={fa ? 'مقایسه' : 'Compare'}
          className={cn('mx-product-compare', compareHas && 'is-active')}
          onClick={() => {
            void trackGrowthEvent('compare', {
              productId: product.id,
              action: compareHas ? 'remove' : 'add',
            });
            void compareToggle(product.id);
          }}
        >
          <GitCompareArrows size={16} />
        </IconButton>
        <div className="mx-product-quick">
          <Link className="mx-product-quick-button" to={`/products/${product.slug}?quick=1`}>
            <Eye size={15} />
            {fa ? 'مشاهده سریع' : 'Quick view'}
          </Link>
        </div>
      </div>
      <div className="mx-product-content">
        <div className="mx-product-brand">
          {fa ? product.brand?.nameFa || '' : product.brand?.nameEn || product.brand?.nameFa || ''}
        </div>
        <Link to={`/products/${product.slug}`} className="mx-product-title">
          {fa ? product.nameFa : product.nameEn || product.nameFa}
        </Link>
        <RatingStars value={product.review.rating} count={product.review.count} />
        <div className="mx-product-meta">
          {product.variants.length
            ? product.variants.length + (fa ? ' مدل قابل انتخاب' : ' variants')
            : stockLabel(product, fa)}
        </div>
        <PriceDisplay price={product.price} salePrice={product.salePrice} size="md" />
        <div className="mx-product-actions">
          <Button
            size="sm"
            fullWidth
            onClick={addCart}
            disabled={product.stock <= 0}
            icon={<ShoppingCart size={15} />}
          >
            {product.stock <= 0
              ? fa
                ? 'ناموجود'
                : 'Out of stock'
              : product.variants.length
                ? fa
                  ? 'انتخاب گزینه‌ها'
                  : 'Choose options'
                : fa
                  ? 'افزودن به سبد'
                  : 'Add to cart'}
          </Button>
          <Link className="mx-product-details" to={`/products/${product.slug}`} aria-label="Details">
            <ArrowUpLeft size={15} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

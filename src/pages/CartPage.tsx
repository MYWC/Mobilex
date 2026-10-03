import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { useAppStore } from '@/stores/useAppStore';
import { useCartStore } from '@/features/cart/cart.store';
import { calculateItemDiscount, calculateSubtotal } from '@/features/commerce/pricing';
import { COMMERCE } from '@/features/commerce/commerce.constants';
import { validateInventory } from '@/features/commerce/inventory.service';
import { formatCurrency, formatNumber } from '@/lib/format/number';
const money = (n: number, l: 'fa' | 'en') => formatCurrency(n, l);
export function CartPage() {
  const locale = useAppStore((s) => s.locale),
    fa = locale === 'fa',
    items = useCartStore((s) => s.items),
    selected = useCartStore((s) => s.selected),
    setSelected = useCartStore((s) => s.setSelected),
    selectAll = useCartStore((s) => s.selectAll),
    remove = useCartStore((s) => s.remove),
    update = useCartStore((s) => s.updateQuantity),
    removeSelected = useCartStore((s) => s.removeSelected),
    clear = useCartStore((s) => s.clear),
    setIssues = useCartStore((s) => s.setIssues),
    issues = useCartStore((s) => s.issues);
  const [confirm, setConfirm] = useState(false),
    [checking, setChecking] = useState(false);
  const nav = useNavigate();
  const selectedItems = useMemo(() => items.filter((i) => selected.includes(i.cartKey)), [items, selected]);
  const sub = calculateSubtotal(selectedItems),
    discount = calculateItemDiscount(selectedItems),
    progress = Math.min(100, Math.round((sub / COMMERCE.freeShippingThreshold) * 100)),
    remain = Math.max(0, COMMERCE.freeShippingThreshold - sub);
  if (!items.length)
    return (
      <div className="mx-page">
        <div className="mx-shell mx-cart-empty">
          <div className="mx-empty-illustration">
            <ShoppingBag size={42} />
          </div>
          <Badge tone="primary" dot>
            {fa ? 'CART 2.0' : 'CART 2.0'}
          </Badge>
          <h1>{fa ? 'سبدت منتظرته.' : 'Your cart is waiting.'}</h1>
          <p>
            {fa
              ? 'محصولات موردنظرت را اضافه کن؛ ما قیمت و موجودی را قبل از سفارش دوباره بررسی می‌کنیم.'
              : 'Add what you want; we will re-check price and inventory before order creation.'}
          </p>
          <Link to="/products">
            <Button
              size="lg"
              icon={<Sparkles size={17} />}
              iconAfter={fa ? <ArrowLeft size={16} /> : undefined}
            >
              {fa ? 'شروع خرید' : 'Start shopping'}
            </Button>
          </Link>
        </div>
      </div>
    );
  const check = async () => {
    if (!selectedItems.length) return;
    setChecking(true);
    const r = await validateInventory(selectedItems);
    if (!r.ok) {
      setIssues(
        r.errors.map((m, i) => ({
          cartKey: selectedItems[i]?.cartKey ?? selectedItems[0].cartKey,
          code: 'OUT_OF_STOCK',
          message: m,
        })),
      );
    } else {
      setIssues([]);
      nav('/checkout');
    }
    setChecking(false);
  };
  return (
    <div className="mx-page mx-commerce-page">
      <div className="mx-shell">
        <div className="mx-breadcrumb">
          <Link to="/">{fa ? 'خانه' : 'Home'}</Link>
          <span>›</span>
          <strong>{fa ? 'سبد خرید' : 'Cart'}</strong>
        </div>
        <div className="mx-commerce-head">
          <div>
            <Badge tone="primary">{fa ? 'CART 2.0' : 'CART 2.0'}</Badge>
            <h1>{fa ? `سبد خرید (${formatNumber(items.length, 'fa')})` : `Cart (${items.length})`}</h1>
            <p>
              {fa
                ? 'سبد انتخاب‌شده قبل از ثبت سفارش اعتبارسنجی می‌شود.'
                : 'Selected items are validated before order creation.'}
            </p>
          </div>
          <div className="mx-cart-head-actions">
            <Link to="/wishlist">
              <Button variant="glass" icon={<Heart size={15} />}>
                {fa ? 'علاقه‌مندی' : 'Wishlist'}
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setConfirm(true)} icon={<Trash2 size={15} />}>
              {fa ? 'خالی کردن' : 'Clear'}
            </Button>
          </div>
        </div>
        <div className="mx-shipping-progress">
          <div className="mx-shipping-progress-top">
            <div>
              <Truck size={16} />
              <span>
                {remain > 0
                  ? fa
                    ? `${money(remain, 'fa')} تا ارسال رایگان`
                    : `${money(remain, 'en')} to free shipping`
                  : fa
                    ? 'ارسال استاندارد رایگان شد 🎉'
                    : 'Standard shipping is free 🎉'}
              </span>
            </div>
            <strong>{progress}%</strong>
          </div>
          <div className="mx-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        {issues.length > 0 && (
          <Card className="mx-cart-warning">
            <AlertTriangle size={17} />
            <div>
              <strong>{fa ? 'نیاز به بررسی' : 'Needs attention'}</strong>
              <p>{issues.map((i) => i.message).join(' • ')}</p>
            </div>
          </Card>
        )}
        <div className="mx-commerce-layout">
          <section className="mx-cart-panel">
            <Card className="mx-cart-toolbar">
              <label className="mx-checkbox-row">
                <input
                  type="checkbox"
                  checked={items.length === selected.length}
                  onChange={(e) => selectAll(e.target.checked)}
                />
                <span>{fa ? 'انتخاب همه' : 'Select all'}</span>
              </label>
              <span className="mx-muted">
                {formatNumber(selected.length, fa ? 'fa' : 'en')} {fa ? 'انتخاب شده' : 'selected'}
              </span>
              {selected.length > 0 && (
                <button className="mx-inline-danger" type="button" onClick={removeSelected}>
                  {fa ? 'حذف انتخاب‌شده‌ها' : 'Remove selected'}
                </button>
              )}
            </Card>
            <div className="mx-cart-lines">
              {items.map((i) => {
                const sel = selected.includes(i.cartKey),
                  name = fa ? i.name_fa || i.name_en : i.name_en || i.name_fa,
                  save = Math.max(0, (i.compareAtPrice ?? i.price) - i.price) * i.quantity;
                return (
                  <Card className={`mx-cart-line ${sel ? 'is-selected' : ''}`} key={i.cartKey}>
                    <label className="mx-cart-line-select">
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={(e) => setSelected(i.cartKey, e.target.checked)}
                      />
                    </label>
                    <Link className="mx-cart-image" to={i.slug ? `/products/${i.slug}` : `/products/${i.id}`}>
                      {i.image ? <img src={i.image} alt={name} /> : <ShoppingBag size={28} />}
                    </Link>
                    <div className="mx-cart-line-main">
                      <div className="mx-cart-line-top">
                        <div>
                          <div className="mx-cart-line-kicker">PRODUCT</div>
                          <Link to={i.slug ? `/products/${i.slug}` : `/products/${i.id}`}>
                            <h3>{name}</h3>
                          </Link>
                          {i.variantLabel && <div className="mx-cart-variant">{i.variantLabel}</div>}
                        </div>
                        <button
                          className="mx-icon-text-danger"
                          type="button"
                          onClick={() => remove(i.cartKey)}
                        >
                          <Trash2 size={14} />
                          {fa ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                      <div className="mx-cart-line-bottom">
                        <div className="mx-cart-qty">
                          <button
                            type="button"
                            onClick={() => update(i.cartKey, i.quantity - 1)}
                            disabled={i.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <strong>{formatNumber(i.quantity, fa ? 'fa' : 'en')}</strong>
                          <button
                            type="button"
                            onClick={() => update(i.cartKey, i.quantity + 1)}
                            disabled={i.maxQuantity != null && i.quantity >= i.maxQuantity}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="mx-cart-price-stack">
                          <strong>{money(i.price * i.quantity, locale)}</strong>
                          {save > 0 && (
                            <small>
                              {fa ? `صرفه‌جویی ${money(save, 'fa')}` : `Save ${money(save, 'en')}`}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
          <aside className="mx-order-summary">
            <Card className="mx-summary-card">
              <div className="mx-summary-eyebrow">
                <ShieldCheck size={14} />
                SECURE CART
              </div>
              <h2>{fa ? 'خلاصه سفارش' : 'Order summary'}</h2>
              <div className="mx-summary-rows">
                <div>
                  <span>{fa ? 'کالاها' : 'Items'}</span>
                  <strong>{money(sub, locale)}</strong>
                </div>
                <div>
                  <span>
                    <Tag size={12} />
                    {fa ? 'تخفیف کالا' : 'Item discount'}
                  </span>
                  <strong className="positive">− {money(discount, locale)}</strong>
                </div>
              </div>
              <div className="mx-summary-total">
                <span>{fa ? 'مبلغ تقریبی' : 'Estimated total'}</span>
                <strong>{money(Math.max(0, sub - discount), locale)}</strong>
              </div>
              <Button
                fullWidth
                size="lg"
                disabled={!selectedItems.length}
                loading={checking}
                onClick={() => void check()}
                icon={<Check size={16} />}
              >
                {fa ? 'ادامه ثبت سفارش' : 'Continue checkout'}
              </Button>
            </Card>
          </aside>
        </div>
      </div>
      <Drawer open={confirm} onClose={() => setConfirm(false)} title={fa ? 'خالی کردن سبد' : 'Clear cart'}>
        <div className="mx-drawer-content">
          <p>{fa ? 'تمام کالاها حذف شوند؟' : 'Remove all items?'}</p>
          <div className="mx-drawer-actions">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              {fa ? 'انصراف' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clear();
                setConfirm(false);
              }}
            >
              {fa ? 'بله، حذف کن' : 'Yes, clear'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

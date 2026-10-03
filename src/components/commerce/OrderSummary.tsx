import { ShieldCheck, Truck, WalletCards, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { CartLine } from '@/features/cart/cart.types';
import type { ShippingMethod, CouponState } from '@/features/commerce/commerce.types';
import { calculatePricing } from '@/features/commerce/pricing';
import { getShippingOption } from '@/features/commerce/shipping.service';
import { useAppStore } from '@/stores/useAppStore';
import { formatCurrency } from '@/lib/format/number';
export function OrderSummary({
  items,
  shippingMethod,
  coupon,
  compact = false,
}: {
  items: CartLine[];
  shippingMethod: ShippingMethod;
  coupon: CouponState | null;
  compact?: boolean;
}) {
  const locale = useAppStore((s) => s.locale),
    fa = locale === 'fa',
    p = calculatePricing({
      lines: items,
      couponDiscount: coupon?.discount,
      shipping: getShippingOption(shippingMethod),
    });
  return (
    <Card className={`mx-summary-card ${compact ? 'is-compact' : ''}`}>
      <div className="mx-summary-eyebrow">
        <ShieldCheck size={15} />
        {fa ? 'خلاصه امن سفارش' : 'SECURE ORDER SUMMARY'}
      </div>
      <h2>{fa ? 'جمع‌بندی نهایی' : 'Final summary'}</h2>
      {!compact && (
        <div className="mx-summary-products">
          {items.map((i) => (
            <div key={i.cartKey}>
              <span>
                {fa ? i.name_fa || i.name_en : i.name_en || i.name_fa} × {i.quantity}
              </span>
              <strong>{formatCurrency(i.price * i.quantity, locale)}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="mx-summary-rows">
        <div>
          <span>{fa ? 'مبلغ کالاها' : 'Items'}</span>
          <strong>{formatCurrency(p.itemsSubtotal, locale)}</strong>
        </div>
        <div>
          <span>{fa ? 'تخفیف کالا' : 'Item discount'}</span>
          <strong className="positive">− {formatCurrency(p.itemDiscount, locale)}</strong>
        </div>
        <div>
          <span>
            <Tag size={13} />
            {fa ? 'تخفیف کد' : 'Coupon'}
          </span>
          <strong className="positive">− {formatCurrency(p.couponDiscount, locale)}</strong>
        </div>
        <div>
          <span>
            <Truck size={13} />
            {fa ? 'ارسال' : 'Shipping'}
          </span>
          <strong>{p.shipping === 0 ? (fa ? 'رایگان' : 'FREE') : formatCurrency(p.shipping, locale)}</strong>
        </div>
        {p.tax > 0 && (
          <div>
            <span>Tax</span>
            <strong>{formatCurrency(p.tax, locale)}</strong>
          </div>
        )}
      </div>
      <div className="mx-summary-total">
        <span>{fa ? 'مبلغ قابل پرداخت' : 'Payable now'}</span>
        <strong>{formatCurrency(p.payableTotal, locale)}</strong>
      </div>
      <div className="mx-summary-trust">
        <span>
          <ShieldCheck size={13} />
          {fa ? 'قیمت نهایی سمت سرور بررسی می‌شود' : 'Final total validated server-side'}
        </span>
        <span>
          <WalletCards size={13} />
          {fa ? 'پرداخت قابل رهگیری' : 'Traceable payment flow'}
        </span>
      </div>
    </Card>
  );
}

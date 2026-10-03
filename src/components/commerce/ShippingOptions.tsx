import { Check, Store, Truck, Zap } from 'lucide-react';
import type { ShippingMethod } from '@/features/commerce/commerce.types';
import { SHIPPING_OPTIONS } from '@/features/commerce/commerce.constants';
import { useAppStore } from '@/stores/useAppStore';
import { getEtaLabel } from '@/features/commerce/shipping.service';
import { formatCurrency } from '@/lib/format/number';
export function ShippingOptions({
  value,
  onChange,
  subtotal,
}: {
  value: ShippingMethod;
  onChange: (x: ShippingMethod) => void;
  subtotal: number;
}) {
  const locale = useAppStore((s) => s.locale),
    fa = locale === 'fa';
  return (
    <div className="mx-shipping-options">
      {SHIPPING_OPTIONS.map((o) => {
        const S = o.icon === 'truck' ? Truck : o.icon === 'zap' ? Zap : Store,
          sel = o.id === value,
          free = o.id !== 'pickup' && o.freeThreshold != null && subtotal >= o.freeThreshold;
        return (
          <button
            key={o.id}
            type="button"
            className={`mx-shipping-option ${sel ? 'is-selected' : ''}`}
            onClick={() => onChange(o.id)}
          >
            <span className="mx-shipping-option-icon">
              <S size={18} />
            </span>
            <span className="mx-shipping-option-copy">
              <strong>
                {fa
                  ? o.title
                  : o.id === 'standard'
                    ? 'Standard delivery'
                    : o.id === 'express'
                      ? 'Express delivery'
                      : 'Store pickup'}
              </strong>
              <small>
                {fa
                  ? o.description
                  : o.id === 'standard'
                    ? 'Tracked and economical'
                    : o.id === 'express'
                      ? 'Priority handling'
                      : 'Collect after preparation'}
              </small>
              <em>{getEtaLabel(o.id, locale)}</em>
            </span>
            <span className="mx-shipping-option-price">
              {free || o.price === 0 ? (fa ? 'رایگان' : 'FREE') : formatCurrency(o.price, locale)}
            </span>
            <span className="mx-radio">{sel ? <Check size={12} /> : null}</span>
          </button>
        );
      })}
    </div>
  );
}

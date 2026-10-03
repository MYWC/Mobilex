import type { ShippingOption } from './commerce.types';

export const COMMERCE = {
  freeShippingThreshold: 5_000_000,
  taxRate: 0,
  maxCouponDiscount: 100_000_000,
  maxCartLines: 100,
  maxQuantityPerLine: 99,
  checkoutDraftKey: 'mobilex.checkout-draft.v2',
  checkoutAttemptKey: 'mobilex.checkout-attempt.v1',
  lastOrderKey: 'mobilex.last-order.v2',
  orderIdempotencyTtlMs: 30 * 60_000,
} as const;

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    title: 'ارسال استاندارد',
    description: 'تحویل اقتصادی با رهگیری سفارش',
    price: 85_000,
    etaMinDays: 2,
    etaMaxDays: 4,
    freeThreshold: COMMERCE.freeShippingThreshold,
    icon: 'truck',
  },
  {
    id: 'express',
    title: 'ارسال سریع',
    description: 'اولویت پردازش و تحویل سریع‌تر',
    price: 165_000,
    etaMinDays: 1,
    etaMaxDays: 2,
    icon: 'zap',
  },
  {
    id: 'pickup',
    title: 'تحویل حضوری',
    description: 'دریافت از مرکز فروش پس از آماده‌سازی',
    price: 0,
    etaMinDays: 0,
    etaMaxDays: 1,
    icon: 'store',
  },
];

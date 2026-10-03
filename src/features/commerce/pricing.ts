import type { CartLine } from '@/features/cart/cart.types';
import type { CartPricing, ShippingOption } from './commerce.types';
import { COMMERCE } from './commerce.constants';

const amount = (value: unknown): number => (Number.isFinite(Number(value)) ? Number(value) : 0);
const quantity = (line: CartLine): number =>
  Math.max(1, Math.min(COMMERCE.maxQuantityPerLine, Math.floor(amount(line.quantity))));

export const calculateLineTotal = (line: CartLine): number =>
  Math.max(0, amount(line.price)) * quantity(line);
export const calculateSubtotal = (lines: CartLine[]): number =>
  lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
export const calculateOriginalSubtotal = (lines: CartLine[]): number =>
  lines.reduce(
    (sum, line) => sum + Math.max(0, amount(line.compareAtPrice ?? line.price)) * quantity(line),
    0,
  );
export const calculateItemDiscount = (lines: CartLine[]): number =>
  Math.max(0, calculateOriginalSubtotal(lines) - calculateSubtotal(lines));

export function calculateShipping(subtotalAfterCoupon: number, option: ShippingOption): number {
  if (option.id === 'pickup') return 0;
  if (option.freeThreshold != null && subtotalAfterCoupon >= option.freeThreshold) return 0;
  return Math.max(0, amount(option.price));
}

export function calculatePricing(input: {
  lines: CartLine[];
  couponDiscount?: number;
  shipping: ShippingOption;
  taxRate?: number;
}): CartPricing {
  const itemsSubtotal = calculateSubtotal(input.lines);
  const itemDiscount = calculateItemDiscount(input.lines);
  const couponDiscount = Math.min(
    itemsSubtotal,
    COMMERCE.maxCouponDiscount,
    Math.max(0, amount(input.couponDiscount)),
  );
  const taxable = Math.max(0, itemsSubtotal - couponDiscount);
  const shipping = calculateShipping(taxable, input.shipping);
  const tax = Math.round(taxable * Math.max(0, amount(input.taxRate ?? COMMERCE.taxRate)));
  const grandTotal = Math.max(0, taxable + shipping + tax);

  return {
    itemsSubtotal,
    itemDiscount,
    couponDiscount,
    shipping,
    tax,
    grandTotal,
    payableTotal: grandTotal,
    savings: itemDiscount + couponDiscount,
  };
}

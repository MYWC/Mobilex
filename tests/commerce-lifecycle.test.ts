import { describe, expect, it } from 'vitest';
import { calculatePricing } from '@/features/commerce/pricing';
import { getShippingOption } from '@/features/commerce/shipping.service';

describe('commerce lifecycle contracts', () => {
  it('free shipping threshold is evaluated after coupon discount', () => {
    const lines = [{ cartKey: 'a', id: 'a', price: 5_100_000, compareAtPrice: 5_500_000, quantity: 1 }];
    const pricing = calculatePricing({
      lines,
      couponDiscount: 200_000,
      shipping: getShippingOption('standard'),
    });
    expect(pricing.shipping).toBe(85_000);
  });

  it('pickup always has zero shipping', () => {
    const lines = [{ cartKey: 'a', id: 'a', price: 100_000, quantity: 1 }];
    const pricing = calculatePricing({ lines, shipping: getShippingOption('pickup') });
    expect(pricing.shipping).toBe(0);
  });

  it('negative coupon discounts can never reduce the total', () => {
    const lines = [{ cartKey: 'a', id: 'a', price: 1_000_000, quantity: 1 }];
    const pricing = calculatePricing({
      lines,
      couponDiscount: -1_000_000,
      shipping: getShippingOption('standard'),
    });
    expect(pricing.couponDiscount).toBe(0);
    expect(pricing.payableTotal).toBe(1_085_000);
  });
});

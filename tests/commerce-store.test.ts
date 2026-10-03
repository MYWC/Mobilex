import { describe, expect, it } from 'vitest';
import { useCommerceStore } from '@/features/commerce/commerce.store';
describe('commerce store', () => {
  it('moves through checkout state', () => {
    const s = useCommerceStore.getState();
    s.setShippingMethod('express');
    s.setPaymentMethod('cod');
    s.setStep('payment');
    const x = useCommerceStore.getState();
    expect(x.shippingMethod).toBe('express');
    expect(x.paymentMethod).toBe('cod');
    expect(x.step).toBe('payment');
    s.reset();
  });
});

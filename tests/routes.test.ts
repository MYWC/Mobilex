import { describe, expect, it } from 'vitest';
import { routes } from '@/app/routes/routeConfig';

describe('route contracts', () => {
  it('contains all Phase 1 routes', () => {
    expect(routes.home).toBe('/');
    expect(routes.products).toBe('/products');
    expect(routes.cart).toBe('/cart');
    expect(routes.checkout).toBe('/checkout');
    expect(routes.wishlist).toBe('/wishlist');
    expect(routes.orders).toBe('/orders');
    expect(routes.profile).toBe('/account');
    expect(routes.admin).toBe('/admin');
    expect(routes.login).toBe('/login');
    expect(routes.register).toBe('/register');
    expect(routes.forgotPassword).toBe('/forgot-password');
  });
});

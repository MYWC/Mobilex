import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/features/cart/cart.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], hydrated: false });
  useWishlistStore.setState({ ids: [], hydrated: false });
});

describe('cart state', () => {
  it('adds, merges and removes cart lines', () => {
    useCartStore.getState().add({ cartKey: 'p1', id: 'p1', price: 100, quantity: 1 });
    useCartStore.getState().add({ cartKey: 'p1', id: 'p1', price: 100, quantity: 2 });
    expect(useCartStore.getState().count()).toBe(3);
    expect(useCartStore.getState().subtotal()).toBe(300);
    useCartStore.getState().updateQuantity('p1', 5);
    expect(useCartStore.getState().count()).toBe(5);
    useCartStore.getState().remove('p1');
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe('wishlist state', () => {
  it('toggles ids without duplicates', () => {
    useWishlistStore.getState().add('p1');
    useWishlistStore.getState().add('p1');
    expect(useWishlistStore.getState().ids).toEqual(['p1']);
    expect(useWishlistStore.getState().has('p1')).toBe(true);
    useWishlistStore.getState().toggle('p1');
    expect(useWishlistStore.getState().has('p1')).toBe(false);
  });
});

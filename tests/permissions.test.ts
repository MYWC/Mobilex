import { describe, expect, it } from 'vitest';
import { canAll, canAny, hasPermission, isStaff } from '@/lib/auth/permissions';

describe('permission matrix', () => {
  it('grants admin full access', () => {
    expect(hasPermission('admin', 'settings.write')).toBe(true);
    expect(hasPermission('admin', 'users.write')).toBe(true);
  });

  it('restricts customer role', () => {
    expect(hasPermission('customer', 'orders.write')).toBe(false);
    expect(isStaff('customer')).toBe(false);
  });

  it('supports any/all checks', () => {
    expect(canAny('support', ['users.write', 'orders.read'])).toBe(true);
    expect(canAll('product_manager', ['catalog.read', 'catalog.write'])).toBe(true);
    expect(canAll('support', ['orders.write', 'catalog.write'])).toBe(false);
  });
});

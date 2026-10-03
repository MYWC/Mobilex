import { describe, expect, it } from 'vitest';
import { orderStatusLabel, statusTone } from '@/lib/admin/status';
import { hasPermission } from '@/lib/auth/permissions';

describe('phase 6 admin core', () => {
  it('maps statuses consistently', () => {
    expect(orderStatusLabel('delivered', 'fa')).toBe('تحویل‌شده');
    expect(statusTone('cancelled')).toBe('danger');
  });
  it('keeps RBAC explicit', () => {
    expect(hasPermission('admin', 'roles.write')).toBe(true);
    expect(hasPermission('customer', 'roles.write')).toBe(false);
    expect(hasPermission('warehouse', 'inventory.write')).toBe(true);
    expect(hasPermission('support', 'inventory.write')).toBe(false);
  });
});

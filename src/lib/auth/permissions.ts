import type { UserRole } from '@/types/core';

export type Permission =
  | 'catalog.read'
  | 'catalog.write'
  | 'inventory.read'
  | 'inventory.write'
  | 'orders.read'
  | 'orders.write'
  | 'users.read'
  | 'users.write'
  | 'content.read'
  | 'content.write'
  | 'analytics.read'
  | 'audit.read'
  | 'roles.read'
  | 'roles.write'
  | 'settings.read'
  | 'settings.write';

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  admin: [
    'catalog.read',
    'catalog.write',
    'inventory.read',
    'inventory.write',
    'orders.read',
    'orders.write',
    'users.read',
    'users.write',
    'content.read',
    'content.write',
    'analytics.read',
    'audit.read',
    'roles.read',
    'roles.write',
    'settings.read',
    'settings.write',
  ],
  product_manager: [
    'catalog.read',
    'catalog.write',
    'inventory.read',
    'inventory.write',
    'orders.read',
    'analytics.read',
  ],
  warehouse: ['orders.read', 'orders.write', 'catalog.read', 'inventory.read', 'inventory.write'],
  support: ['orders.read', 'orders.write', 'users.read', 'catalog.read', 'content.read'],
  customer: [],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  return Boolean(role && rolePermissions[role]?.includes(permission));
}

export function canAny(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAll(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function isStaff(role: UserRole | undefined): boolean {
  return role !== undefined && role !== 'customer';
}

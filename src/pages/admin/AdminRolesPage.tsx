import { ShieldCheck } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { hasPermission, type Permission } from '@/lib/auth/permissions';
import type { UserRole } from '@/types/core';
import { useAuthStore } from '@/stores/useAuthStore';
const roles: UserRole[] = ['admin', 'product_manager', 'warehouse', 'support', 'customer'];
const labels: Record<UserRole, string> = {
  admin: 'مدیر کل',
  product_manager: 'مدیر محصول',
  warehouse: 'انبار',
  support: 'پشتیبانی',
  customer: 'مشتری',
};
const perms: Permission[] = [
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
];
export function AdminRolesPage() {
  const role = useAuthStore((s) => s.appUser?.role);
  return (
    <AdminShell title="نقش‌ها و دسترسی">
      <div className="mx-admin-panel">
        <div className="mx-admin-panel-head">
          <div>
            <h2>
              <ShieldCheck size={14} /> ماتریس دسترسی
            </h2>
            <p>منبع کنترل UI؛ مجوز واقعی باید در Supabase RLS/RPC هم اعمال شود.</p>
          </div>
        </div>
        <div className="mx-role-matrix">
          <div className="mx-role-row header">
            <strong>Permission</strong>
            {roles.map((r) => (
              <strong key={r}>{labels[r]}</strong>
            ))}
          </div>
          {perms.map((p) => (
            <div className="mx-role-row" key={p}>
              <span>{p}</span>
              {roles.map((r) => (
                <span className={hasPermission(r, p) ? 'granted' : 'denied'} key={r}>
                  {hasPermission(r, p) ? '✓' : '—'}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Card className="mx-role-note">
        <strong>نقش فعلی شما: {role ? labels[role] : '—'}</strong>
        <span>تغییر نقش کاربران فقط از طریق RPC امن سمت سرور انجام می‌شود.</span>
      </Card>
    </AdminShell>
  );
}

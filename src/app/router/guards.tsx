import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import type { UserRole } from '@/types/core';
import { routes } from '@/app/routes/routeConfig';
import { useAuthStore } from '@/stores/useAuthStore';

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { initialized, status } = useAuthStore();
  if (!initialized || status === 'loading' || status === 'idle') return <div className="route-loading">در حال بررسی نشست کاربر…</div>;
  if (status !== 'authenticated') {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`${routes.login}?next=${encodeURIComponent(next)}`} replace state={{ from: location }} />;
  }
  return children;
}

export function GuestOnly({ children }: PropsWithChildren) {
  const { initialized, status } = useAuthStore();
  if (!initialized || status === 'loading' || status === 'idle') return <div className="route-loading">در حال بررسی نشست کاربر…</div>;
  if (status === 'authenticated') return <Navigate to={routes.profile} replace />;
  return children;
}

export function RequireRole({ roles, children }: PropsWithChildren<{ roles: UserRole[] }>) {
  const role = useAuthStore((state) => state.appUser?.role);
  if (!role || !roles.includes(role)) return <Navigate to={routes.home} replace />;
  return children;
}

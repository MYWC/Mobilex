import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { StatusPage } from '@/pages/StatusPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { GuestOnly, RequireAuth, RequireRole } from '@/app/router/guards';
import { routes } from '@/app/routes/routeConfig';
import type { UserRole } from '@/types/core';
import { RouteLoading } from '@/components/ui/RouteLoading';

const UILabPage = lazy(() => import('@/pages/UILabPage').then((m) => ({ default: m.UILabPage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailsPage = lazy(() =>
  import('@/pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage })),
);
const CartPage = lazy(() => import('@/pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() =>
  import('@/pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })),
);
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailsPage = lazy(() =>
  import('@/pages/OrderDetailsPage').then((m) => ({ default: m.OrderDetailsPage })),
);
const AccountPage = lazy(() => import('@/pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const AddressesPage = lazy(() => import('@/pages/AddressesPage').then((m) => ({ default: m.AddressesPage })));
const SecurityPage = lazy(() => import('@/pages/SecurityPage').then((m) => ({ default: m.SecurityPage })));
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const ComparePage = lazy(() =>
  import('@/pages/growth/ComparePage').then((m) => ({ default: m.ComparePage })),
);
const RecommendationsPage = lazy(() =>
  import('@/pages/growth/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage })),
);
const PromotionsPage = lazy(() =>
  import('@/pages/growth/PromotionsPage').then((m) => ({ default: m.PromotionsPage })),
);
const SupportPage = lazy(() =>
  import('@/pages/growth/SupportPage').then((m) => ({ default: m.SupportPage })),
);
const LoyaltyPage = lazy(() =>
  import('@/pages/growth/LoyaltyPage').then((m) => ({ default: m.LoyaltyPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
);
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })),
);
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminContentPage = lazy(() =>
  import('@/pages/admin/AdminContentPage').then((m) => ({ default: m.AdminContentPage })),
);
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
);
const AdminAuditPage = lazy(() =>
  import('@/pages/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })),
);
const AdminRolesPage = lazy(() =>
  import('@/pages/admin/AdminRolesPage').then((m) => ({ default: m.AdminRolesPage })),
);
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
);
const AdminReleasePage = lazy(() =>
  import('@/pages/admin/AdminReleasePage').then((m) => ({ default: m.AdminReleasePage })),
);
const protectedPage = (node: ReactNode) => <RequireAuth>{node}</RequireAuth>;
const staffPage = (node: ReactNode, roles: UserRole[]) => (
  <RequireAuth>
    <RequireRole roles={roles}>{node}</RequireRole>
  </RequireAuth>
);

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.uiLab} element={<UILabPage />} />
        <Route path={routes.products} element={<ProductsPage />} />
        <Route path={routes.product} element={<ProductDetailsPage />} />
        <Route path={routes.cart} element={<CartPage />} />
        <Route
          path={routes.checkout}
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path={routes.wishlist} element={<WishlistPage />} />
        <Route path={routes.compare} element={<ComparePage />} />
        <Route path={routes.recommendations} element={<RecommendationsPage />} />
        <Route path={routes.promotions} element={<PromotionsPage />} />
        <Route path={routes.support} element={protectedPage(<SupportPage />)} />
        <Route path={routes.orders} element={protectedPage(<OrdersPage />)} />
        <Route path={routes.orderDetail} element={protectedPage(<OrderDetailsPage />)} />
        <Route
          path={routes.orderConfirmation}
          element={
            <RequireAuth>
              <OrderConfirmationPage />
            </RequireAuth>
          }
        />
        <Route path={routes.profile} element={protectedPage(<AccountPage />)} />
        <Route path={routes.addresses} element={protectedPage(<AddressesPage />)} />
        <Route path={routes.security} element={protectedPage(<SecurityPage />)} />
        <Route path={routes.loyalty} element={protectedPage(<LoyaltyPage />)} />
        <Route path={routes.notifications} element={protectedPage(<NotificationsPage />)} />
        <Route path={routes.status} element={<StatusPage />} />
        <Route
          path={routes.admin}
          element={staffPage(<AdminDashboardPage />, ['admin', 'product_manager', 'warehouse', 'support'])}
        />
        <Route
          path={routes.adminDashboard}
          element={staffPage(<AdminDashboardPage />, ['admin', 'product_manager', 'warehouse', 'support'])}
        />
        <Route
          path={routes.adminProducts}
          element={staffPage(<AdminProductsPage />, ['admin', 'product_manager'])}
        />
        <Route
          path={routes.adminInventory}
          element={staffPage(<AdminInventoryPage />, ['admin', 'product_manager', 'warehouse'])}
        />
        <Route
          path={routes.adminOrders}
          element={staffPage(<AdminOrdersPage />, ['admin', 'warehouse', 'support'])}
        />
        <Route path={routes.adminUsers} element={staffPage(<AdminUsersPage />, ['admin', 'support'])} />
        <Route path={routes.adminContent} element={staffPage(<AdminContentPage />, ['admin'])} />
        <Route
          path={routes.adminAnalytics}
          element={staffPage(<AdminAnalyticsPage />, ['admin', 'product_manager'])}
        />
        <Route path={routes.adminAudit} element={staffPage(<AdminAuditPage />, ['admin'])} />
        <Route path={routes.adminRoles} element={staffPage(<AdminRolesPage />, ['admin'])} />
        <Route path={routes.adminSettings} element={staffPage(<AdminSettingsPage />, ['admin'])} />
        <Route path={routes.adminRelease} element={staffPage(<AdminReleasePage />, ['admin'])} />
        <Route
          path={routes.login}
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path={routes.register}
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path={routes.forgotPassword}
          element={
            <GuestOnly>
              <ForgotPasswordPage />
            </GuestOnly>
          }
        />
        <Route path="/__redirect" element={<Navigate to={routes.home} replace />} />
        <Route path={routes.notFound} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
export function RouterDevNav() {
  return (
    <nav className="dev-nav">
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/wishlist">Wishlist</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/checkout">Checkout</Link>
      <Link to="/orders">Orders</Link>
      <Link to="/account">Account</Link>
      <Link to="/notifications">Notifications</Link>
      <Link to="/status">Status</Link>
      <Link to="/ui-lab">UI Lab</Link>
    </nav>
  );
}

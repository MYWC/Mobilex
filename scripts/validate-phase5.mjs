import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/pages/AccountPage.tsx',
  'src/pages/AddressesPage.tsx',
  'src/pages/SecurityPage.tsx',
  'src/pages/WishlistPage.tsx',
  'src/pages/OrdersPage.tsx',
  'src/pages/OrderDetailsPage.tsx',
  'src/pages/NotificationsPage.tsx',
  'src/features/account/account.service.ts',
  'src/features/account/account.security.ts',
  'src/features/orders/orders.service.ts',
  'src/features/notifications/notification.service.ts',
  'src/features/wishlist/wishlist.cloud.service.ts',
  'supabase/migrations/0007_account_wishlist_notifications.sql',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Phase 5 missing files:', missing);
  process.exit(1);
}
const routes = fs.readFileSync(path.join(root, 'src/app/router/AppRouter.tsx'), 'utf8');
for (const route of [
  'routes.profile',
  'routes.addresses',
  'routes.security',
  'routes.wishlist',
  'routes.orders',
  'routes.orderDetail',
  'routes.notifications',
]) {
  if (!routes.includes(route)) {
    console.error(`Phase 5 route constant missing: ${route}`);
    process.exit(1);
  }
}
const css = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8');
for (const token of [
  '.mx-account-page',
  '.mx-orders-grid',
  '.mx-notification-popover',
  '.mx-wishlist-toolbar',
]) {
  if (!css.includes(token)) {
    console.error(`Phase 5 CSS selector missing: ${token}`);
    process.exit(1);
  }
}
console.log(
  `Phase 5 validation passed · ${required.length} core files present · account/orders/wishlist/notifications routes verified.`,
);

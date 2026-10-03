import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'src/features/cart/cart.store.ts',
  'src/features/commerce/pricing.ts',
  'src/features/commerce/order.service.ts',
  'src/features/commerce/inventory.service.ts',
  'src/features/commerce/coupon.service.ts',
  'src/features/commerce/commerce.store.ts',
  'src/pages/CartPage.tsx',
  'src/pages/CheckoutPage.tsx',
  'supabase/migrations/0004_commerce_core.sql',
  'supabase/migrations/0005_commerce_hardening.sql',
  'supabase/migrations/0006_commerce_inventory_payment_lifecycle.sql',
  'supabase/functions/validate-coupon/index.ts',
  'supabase/functions/create-payment-session/index.ts',
  'supabase/functions/payment-webhook/index.ts',
  'supabase/functions/release-expired-reservations/index.ts',
];

const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  console.error('Commerce validation failed. Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const sql = readFileSync(
  resolve(root, 'supabase/migrations/0006_commerce_inventory_payment_lifecycle.sql'),
  'utf8',
);
for (const token of [
  'mx_create_order',
  'mx_cancel_order',
  'mx_mark_payment_result',
  'mx_expire_inventory_reservations',
  'inventory_reservations',
  'coupon_usages',
  'idempotency_key',
]) {
  if (!sql.includes(token)) {
    console.error(`Commerce validation failed. Missing SQL contract: ${token}`);
    process.exit(1);
  }
}

console.log(`Commerce preflight passed: ${required.length} required files and lifecycle contracts verified.`);

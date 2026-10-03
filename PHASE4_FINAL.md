# Mobilex 2.0 — Phase 4 Final / Commerce Engine

This release is the hardened customer commerce layer built on Phase 3.

## Included

- Cart state engine with legacy migration, normalization, dedupe, selection and persistence.
- Server-aware inventory validation with price-change detection.
- Pricing engine for item discount, coupon discount, shipping, tax and final payable total.
- Checkout draft v2 with step persistence and UUID idempotency key.
- Address CRUD with local fallback and server persistence.
- Shipping methods and free-shipping threshold.
- Coupon validation through Edge Function with safe client fallback.
- Server-authoritative `mx_create_order` transaction: price, stock, variant, coupon, totals and order snapshots are recalculated server-side.
- Order idempotency so repeated clicks/retries do not intentionally create duplicate orders.
- Payment transaction and order event tables.
- RLS policies for customer-owned addresses, orders, order items, payments and events.
- Payment adapter boundary. A demo provider is available only for local development; no fake production gateway is claimed.
- Checkout UI with review, address, shipping, payment, final confirmation and recovery states.

## Server authority

The browser's pricing is a preview only. The order RPC does not trust `price`, `discount`, `shipping`, or `total` from the browser. It reads current catalog data, re-checks stock, recalculates the coupon and computes the authoritative total before inserting the order.

## Production checklist

1. Apply `supabase/migrations/0004_commerce_core.sql` and `0005_commerce_hardening.sql` after reviewing the existing Phase 3 catalog schema.
2. Deploy `validate-coupon`.
3. Configure and implement a real payment provider inside `create-payment-session` or another server-side provider adapter.
4. Implement a signed gateway callback/webhook that verifies the provider response before marking `payment_transactions` and `orders` as paid.
5. Configure strict CORS instead of `*` for Edge Functions when the production domain is known.
6. Keep service-role and merchant credentials only in server-side/Edge Function secrets.
7. Run `npm install`, then `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` in a networked environment.

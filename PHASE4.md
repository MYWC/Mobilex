# Mobilex 2.0 — Phase 4 / Commerce Engine

Phase 4 turns the Phase 3 storefront into a commerce-ready application layer.

## Delivered

- Cart 2.0: selected checkout subset, batch remove, quantity caps, persistence and validation issues.
- Pricing engine: line totals, item discounts, coupons, shipping, tax and payable total.
- Checkout state machine: review → address → shipping → payment → confirm.
- Address CRUD foundation with local demo persistence and Supabase repository.
- Shipping engine with standard/express/pickup and free-shipping threshold.
- Coupon validation service with demo fallback and Supabase/Edge validation.
- Inventory re-check before order creation.
- Server-authoritative `mx_create_order` RPC: locks product/variant rows, re-validates stock/price/coupon, decrements inventory and inserts order snapshots in one transaction.
- RLS policies for customer-owned addresses/orders/order_items and active coupon reads.
- Demo-mode order creation when Supabase isn't configured.
- Confirmation route and responsive commerce visual layer.
- Payment provider contract + development-only adapter. No fake production gateway is included.
- Unit tests for pricing and checkout state.

## Production activation

1. Review `supabase/migrations/0004_commerce_core.sql` against your actual catalog schema.
2. Apply the migration.
3. Deploy `supabase/functions/validate-coupon`.
4. Implement a real payment provider Edge Function/adapter. The client should receive only a signed redirect URL/session identifier.
5. Add payment webhook handling that updates `payment_status` and order status idempotently.
6. Keep service-role secrets only in server-side environments.

## Trust boundary

Client pricing is presentation-only. The database RPC is the authority for inventory, current unit price, coupon eligibility, shipping amount and final total during order creation.

## Payment note

No live bank/payment provider credentials were supplied, so this release deliberately does not pretend to have a real gateway. `online` is a contract ready for a provider adapter.

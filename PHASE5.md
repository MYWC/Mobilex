# Mobilex 2.0 — Phase 5

## Account & Customer Experience

Phase 5 adds the customer account layer on top of Phase 4 Commerce:

- Account Center and statistics
- Address Book
- Security and password recovery
- Cloud-synced wishlist with guest-to-account merge
- Orders list with filters, pagination and search
- Order detail timeline, cancellation and reorder
- Notification Center
- Notification preferences
- Realtime notification updates
- Account-scoped Supabase RLS migration

## New routes

- `/account`
- `/account/addresses`
- `/account/security`
- `/wishlist`
- `/orders`
- `/orders/:orderId`
- `/notifications`

## Data migration

Apply `supabase/migrations/0007_account_wishlist_notifications.sql` after the Phase 4 migrations.

## Validation

Run:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

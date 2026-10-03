# Mobilex 2.0 — Phase 5 Release Notes

## Customer Experience Foundation

This release sits directly on Phase 4 Commerce and adds a unified customer layer.

### Core features

- Account Center with live account metrics
- Address Book using existing Phase 4 address service
- Security Center for password changes and recovery
- Cloud wishlist with local-first guest merge on authentication
- Orders Center with server-side filters, search and pagination
- Order Detail with timeline, pricing, address and activity events
- Reorder flow with current inventory/price validation
- Notification Center with local cache + Supabase sync
- Notification preferences
- Notification bell in the global header
- Supabase Realtime notification subscription
- RLS migration for wishlist, notifications and notification preferences
- Graceful fallback when Phase 5 database migration has not yet been applied

## Routes

- /account
- /account/addresses
- /account/security
- /wishlist
- /orders
- /orders/:orderId
- /notifications

## Database

Apply:

- supabase/migrations/0007_account_wishlist_notifications.sql

## Verification

Static validation completed:

- Foundation preflight: PASS
- Commerce preflight: PASS
- Phase 5 preflight: PASS
- 127 TypeScript/TSX source files parsed with 0 syntax diagnostics
- 423 local imports audited with 0 broken local imports

Runtime dependency installation/build was not executed in the sandbox because npm registry access timed out and node_modules was not available there.

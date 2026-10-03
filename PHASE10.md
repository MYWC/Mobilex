# Mobilex 2.0 — Phase 10 Final Release

This is the final hardening phase. It closes production-mode demo fallbacks, adds a generic signed payment gateway boundary, webhook replay protection, release readiness UI, final CI gates, security metadata, and final release polish.

## Live payment adapter

Configure server-side Edge Function secrets:

- PAYMENT_PROVIDER
- PAYMENT_GATEWAY_URL
- PAYMENT_GATEWAY_SECRET
- PAYMENT_WEBHOOK_SECRET
- PAYMENT_ALLOWED_ORIGIN
- SUPABASE_SERVICE_ROLE_KEY

The gateway contract for `create-payment-session` must return `paymentId`, `redirectUrl`, `amount`, and optionally `expiresAt`. The webhook contract must send `orderId`, `paymentId`, `status`, `provider`, and a stable `eventId`; the raw JSON is signed with HMAC-SHA256 in `x-payment-signature` (`sha256=<hex>` is accepted).

## Final checks

Run:
`npm run quality:phase10`

The actual live payment flow must be verified against the real payment provider in staging before production.

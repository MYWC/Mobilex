# Mobilex Release Checklist

## Local quality

```bash
npm install
npm run validate:phase8
npm run routes:check
npm run a11y:check
npm run security:static
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

## Production configuration

- Set public Supabase URL and publishable/anon key.
- Set the production application URL.
- Configure the real payment provider only through server-side secrets.
- Apply all Supabase migrations in order.
- Verify RLS policies.
- Verify scheduled reservation cleanup.
- Verify webhooks and idempotency.
- Verify PWA manifest and icons.
- Verify robots, sitemap and canonical URL.
- Review the release report.

## Smoke test

Home → Products → Product → Wishlist → Cart → Checkout → Payment → Confirmation → Orders → Account.

Also verify logout/login, offline fallback, theme switching, RTL/LTR, mobile navigation and admin permissions.

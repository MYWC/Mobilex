# Mobilex 2.0 — Phase 6

A modular React + TypeScript + Vite storefront and Admin Control Center for Mobilex.

## Current architecture
- React + TypeScript + Vite
- Tailwind CSS 4
- Supabase Auth / Postgres / Realtime / Edge Functions
- Zustand state management
- Zod validation
- Modular Storefront + Account + Commerce + Admin domains

## Phase 6 highlights
- Responsive independent Admin Control Center.
- Permission-aware navigation and RBAC matrix.
- Sales dashboard with SVG revenue chart, order funnel, recent orders and low-stock intelligence.
- Product operations, order operations, user roles, inventory adjustments, analytics, audit logs, content/banner management and settings.
- Sensitive admin actions enforced by Supabase security-definer RPCs and database policies.
- Audit trail for status, role and inventory changes.
- Demo mode when Supabase environment variables are absent; real Supabase errors are not silently converted into demo data when live configuration exists.

## Run
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Quality
```bash
npm run validate
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

Apply Supabase migrations in order, including:
`supabase/migrations/0008_admin_control_center.sql`

## Admin routes
- `/admin/dashboard`
- `/admin/products`
- `/admin/inventory`
- `/admin/orders`
- `/admin/users`
- `/admin/content`
- `/admin/analytics`
- `/admin/audit`
- `/admin/roles`
- `/admin/settings`


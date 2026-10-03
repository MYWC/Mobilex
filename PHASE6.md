# Mobilex 2.0 — Phase 6

Phase 6 introduces the Admin Control Center on top of the Phase 5 account/commerce foundation.

## Included
- Independent admin shell with responsive sidebar/topbar.
- Permission-aware admin navigation.
- Operational dashboard with revenue trend, order funnel, recent orders, top products, and low-stock alerts.
- Catalog management view with active/inactive and low-stock filters.
- Inventory operations with secure adjustment RPC boundaries.
- Order operations with staff-only status transition RPC.
- User management and role changes through admin-only RPC.
- Analytics workspace with reusable SVG charts.
- Audit log explorer.
- Content/banner manager.
- Roles & permissions matrix.
- System settings workspace.
- Demo fallbacks when Supabase is not configured.
- Migration `0008_admin_control_center.sql` for audit, content, inventory ops, settings and server-side permission enforcement.

## Important
The UI permission matrix is not the security boundary. Sensitive actions are enforced again in Supabase functions/RLS.
Apply migration 0008 after the previous migrations.

## Quality
`npm run validate` now includes the Phase 6 structural validator.
When dependencies are installed, run `npm run quality` before production deployment.

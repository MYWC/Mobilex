# Phase 9 — Advanced Commerce & Growth

This release extends Mobilex 2.0 with a growth/community layer while preserving the Phase 1–8 architecture.

The storefront can run without Supabase in demo mode. When Supabase is configured, Phase 9 reads/writes its new tables under RLS and uses security-definer RPC boundaries for sensitive ticket/review helper operations.

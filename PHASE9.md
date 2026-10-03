# Mobilex 2.0 — Phase 9

Advanced Commerce & Growth: comparison, personalization, community reviews/Q&A, loyalty, support, promotion discovery, and growth telemetry.

## Major modules

- Smart Compare: up to 4 products, persistent client state, comparison table, live catalog data.
- Recommendations: heuristic personalization from recent views + wishlist + product affinity + popularity signals.
- Reviews: rating distribution, submission flow, verified-purchase flag, helpful counter, moderation-ready status.
- Q&A: customer questions, answers, official responder flag, answer counts.
- Loyalty: points balance, tier progression, transaction history.
- Support: ticket list, detail chat, structured priority/status, creation RPC.
- Promotions: active campaign discovery with copyable coupon codes.
- Growth telemetry: product/search/cart/wishlist/compare/promotion/review/support event foundation.
- Supabase migration 0009_growth_engine.sql: tables, RLS, RPCs, and answer-count trigger.

## New routes

- /compare
- /recommendations
- /promotions
- /support (auth)
- /account/loyalty (auth)

## Release note

Phase 9 depends on Phase 8 and expects migration 0009 to be applied after migrations 0004–0008.

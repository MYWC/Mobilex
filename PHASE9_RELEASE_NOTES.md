# Mobilex 2.0 — Phase 9 Release Notes

Phase 9 adds the advanced commerce and growth layer while preserving Phase 1–8 contracts.

## Customer-facing
- Compare up to 4 products with side-by-side specifications, pricing, rating, variants, and inventory.
- Personalized recommendations driven by recent views, wishlist affinity, category/brand similarity, stock, popularity, and rating signals.
- Product reviews with moderation-ready status, verified-purchase metadata, rating distribution, and helpful action.
- Product Q&A with customer questions, published answers, and official responder flag.
- Loyalty center with points balance, tier progression, and transaction history.
- Support center with ticket creation, priorities, statuses, and message threads.
- Promotions/deals discovery with time-bounded campaigns and coupon copying.
- Global compare tray and compare action on product cards and product details.

## Backend / Supabase
Migration `0009_growth_engine.sql` adds:
- growth_events
- product_reviews
- product_questions
- product_answers
- loyalty_accounts
- loyalty_transactions
- support_tickets
- support_messages
- promotions
- RLS policies, review helpful RPC, support-ticket RPC, answer-count trigger.

## QA
- JS script syntax checks: PASS
- delimiter heuristic over TS/TSX: PASS
- local `@/` import audit: PASS
- Full typecheck/build still requires `npm install` in a network-enabled environment.

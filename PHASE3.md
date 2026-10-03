# Phase 3 — Storefront Engine

## Scope
1. Data contracts and catalog repository
2. Search state and recent search persistence
3. Product card system
4. Catalog grid / list
5. Advanced filters
6. Product detail / gallery / variants
7. Quick View
8. Home storefront sections
9. URL state synchronization
10. Recently viewed
11. Responsive and accessibility states

## Architecture

`pages/` own route composition. `features/catalog/` owns product-domain state and contracts. `services/catalog/` owns remote/demos. `components/catalog/` and `components/product/` remain reusable.

## Data safety

Catalog is read-only in this phase. Cart/Wishlist mutation continues through their centralized Zustand stores. Server-side write validation remains a later Commerce Engine responsibility.


## Storefront experience added
- Discoverable category rail on Home
- Flash Sale countdown
- Product badges, ratings, live availability presentation
- Smart search modal with recent searches
- URL-synchronized catalog state and mobile filters

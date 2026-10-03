# Mobilex 2.0 — Phase 7: Production Platform

Phase 7 hardens the storefront for production delivery. It adds platform capabilities without replacing the domain architecture from Phases 1–6.

## Included

- PWA manifest, install prompt, service worker and update lifecycle
- Offline banner and resilient navigation fallback
- Route lazy-loading/code splitting
- Runtime performance telemetry: TTFB, FCP, LCP, CLS and INP where supported
- Privacy-conscious client telemetry queue with optional endpoint
- Centralized global error / unhandled rejection capture
- SEO helpers: Open Graph, Twitter, robots, canonical, JSON-LD
- Sitemap generator
- Security headers + secret scanning
- Build-size report
- CI quality workflow
- Accessibility primitives: skip link, route announcements, reduced-motion fallback, focus management
- Short-TTL catalog/facet cache to reduce repeated reads
- Stricter Supabase error handling: configured remote failures are no longer silently converted into demo data

## Commands

```bash
npm install
npm run validate
npm run validate:phase7
npm run security:check
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
node scripts/analyze-build.mjs
npm run seo:generate
```

### Environment additions

- `VITE_PUBLIC_APP_URL` — canonical public origin used by sitemap generation
- `VITE_OBSERVABILITY_ENDPOINT` — optional telemetry endpoint

The app never requires the telemetry endpoint. When absent, events remain local to the current session and no external telemetry request is made.

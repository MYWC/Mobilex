# Phase 7 Release Notes

Version: 2.0.0-beta.8

Phase 7 is the production-platform hardening layer on top of Phase 6.

The service worker is intentionally conservative: navigations are network-first with cached app-shell fallback; static assets use stale-while-revalidate; Supabase/API mutations are not cached by the service worker.

The PWA install flow uses the browser's install prompt where available. Update activation is explicit so users do not unexpectedly lose in-progress state.

Observability is privacy-conscious: URL query strings are omitted and the optional endpoint is entirely disabled when `VITE_OBSERVABILITY_ENDPOINT` is empty.

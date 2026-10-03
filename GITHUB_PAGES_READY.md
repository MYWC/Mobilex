# Mobilex 2.0 — GitHub Pages Ready

This release targets the repository site:

`https://mywc.github.io/Mobilex/`

## Local setup

1. Install Node.js 22.12+
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Run `npm run dev`

## Production checks

```bash
npm run pages:check
npm run typecheck
npm run lint
npm run test
npm run build
```

The production build automatically uses `/Mobilex/` as its base path. Local development uses `/`.

## GitHub Pages

Set GitHub Pages source to **GitHub Actions**. The workflow in `.github/workflows/deploy-pages.yml` builds the app, creates the SPA `404.html` fallback, uploads the Pages artifact, and deploys it.

## Supabase

Browser-safe publishable credentials belong in GitHub Actions repository Variables. Service/secret keys belong only in Supabase Edge Function secrets.

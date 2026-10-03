# Mobilex 2.0 — GitHub Pages Ready

This project is configured as a GitHub repository site at:

`https://mywc.github.io/Mobilex/`

## Windows PowerShell

From the project root run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-github-pages.ps1
```

The script removes stale dependencies, installs the coherent toolchain, runs the Pages preflight, typecheck, lint and tests, builds the production bundle, and creates the SPA `404.html` fallback.

## Local URL

`http://localhost:5173/Mobilex/`

## GitHub Pages

Repository → Settings → Pages → Source → **GitHub Actions**.

The deploy workflow is `.github/workflows/deploy-pages.yml`.

## GitHub Actions Variables

Add these repository Variables under Settings → Secrets and variables → Actions → Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not commit `.env`, `.env.local`, service keys, payment secrets, or webhook secrets.

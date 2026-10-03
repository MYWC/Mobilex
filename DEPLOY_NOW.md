# Mobilex 2.0 — Deploy Now

## 1. Replace the local project
Use this project as the complete replacement for the older Phase 10 files. Do not merge file-by-file with the old broken dependency tree.

## 2. Open the project root
`C:\Mobilex-2.0-Phase10-Final`

## 3. PowerShell
```powershell
node -v
powershell -ExecutionPolicy Bypass -File .\scripts\setup-github-pages.ps1
```

Node 22.12+ is required by Vite 8.

## 4. GitHub
After the local checks pass:

```powershell
git add .
git commit -m "fix: stable Mobilex 2.0 GitHub Pages release"
git push origin main --force-with-lease
```

## 5. GitHub Pages
Repository → Settings → Pages → Source → GitHub Actions.

## 6. Repository Variables
Add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The public site is:
`https://mywc.github.io/Mobilex/`

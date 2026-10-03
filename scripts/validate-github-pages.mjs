import fs from 'node:fs';
import path from 'node:path';

const required = [
  'index.html',
  'vite.config.ts',
  'src/App.tsx',
  'src/lib/pwa/register.ts',
  'src/lib/seo/seo.ts',
  'src/lib/seo/schema.ts',
  'src/lib/ux/paths.ts',
  'public/manifest.webmanifest',
  'public/sw.js',
  '.github/workflows/deploy-pages.yml',
];
for (const file of required) {
  if (!fs.existsSync(path.resolve(file))) throw new Error(`Missing GitHub Pages requirement: ${file}`);
}
const index = fs.readFileSync('index.html', 'utf8');
if (!index.includes('%BASE_URL%src/main.tsx')) throw new Error('index.html must use %BASE_URL% for main.tsx');
const vite = fs.readFileSync('vite.config.ts', 'utf8');
if (!vite.includes("'/Mobilex/'")) throw new Error('vite.config.ts must define /Mobilex/ build base');
console.log('GitHub Pages preflight passed.');

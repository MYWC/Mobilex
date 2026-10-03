import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'src/lib/release/release.ts',
  'src/pages/admin/AdminReleasePage.tsx',
  'src/styles/phase10.css',
  'supabase/migrations/0010_final_release_payment_webhooks.sql',
  'supabase/functions/create-payment-session/index.ts',
  'supabase/functions/payment-webhook/index.ts',
  'public/security.txt',
  'scripts/release-preflight.mjs',
  'tests/phase10-final.test.ts',
];
const missing = required.filter((f)=>!fs.existsSync(path.resolve(f)));
if(missing.length){console.error('Phase 10 validation failed: missing files\n'+missing.join('\n'));process.exit(1)}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const s of ['validate:phase10','quality:phase10','release:preflight']) if(!pkg.scripts?.[s]) throw new Error(`Missing npm script: ${s}`);
const routes=fs.readFileSync('src/app/routes/routeConfig.ts','utf8');
if(!routes.includes("'/admin/release'")) throw new Error('Admin release route missing.');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
if(!ci.includes('npm run quality:phase10')) throw new Error('CI does not use Phase 10 quality gate.');
const sw=fs.readFileSync('public/sw.js','utf8');
if(!sw.includes('mobilex-v2.0.0-final')) throw new Error('Service Worker final cache version missing.');
console.log(`Phase 10 preflight passed: ${required.length} release artifacts and contracts verified.`);

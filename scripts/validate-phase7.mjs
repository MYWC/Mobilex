import fs from 'node:fs';
import path from 'node:path';
const required = [
  'src/lib/performance/metrics.ts',
  'src/lib/observability/telemetry.ts',
  'src/lib/pwa/register.ts',
  'src/features/pwa/pwa.store.ts',
  'src/components/system/PlatformLayer.tsx',
  'src/components/system/OfflineBanner.tsx',
  'src/components/system/InstallPrompt.tsx',
  'src/components/system/UpdatePrompt.tsx',
  'public/sw.js',
  'public/manifest.webmanifest',
  'scripts/generate-sitemap.mjs',
  'scripts/analyze-build.mjs',
  'scripts/security-check.mjs',
];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error('Missing Phase 7 files:', missing);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
if (!manifest.start_url || !manifest.icons?.length) throw new Error('Invalid web manifest foundation.');
console.log(`Phase 7 preflight passed (${required.length} core files).`);

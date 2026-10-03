import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/components/system/CommandPalette.tsx',
  'src/components/system/NavigationEffects.tsx',
  'src/components/system/PlatformLayer.tsx',
  'src/lib/ux/navigation.ts',
  'src/lib/security/client.ts',
  'src/lib/seo/schema.ts',
  'src/lib/qa/health.ts',
  'src/pages/StatusPage.tsx',
  'src/styles/phase8.css',
  'public/offline.html',
  'public/sw.js',
  'scripts/a11y-audit.mjs',
  'scripts/route-integrity.mjs',
  'scripts/static-security-audit.mjs',
  'scripts/release-report.mjs',
  'tests/phase8-platform.test.ts',
  '.github/workflows/ci.yml',
  'PHASE8.md',
  'SECURITY.md',
  'ACCESSIBILITY.md',
  'RELEASE_CHECKLIST.md',
];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error('Phase 8 validation failed: missing files\n' + missing.join('\n'));
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
for (const script of [
  'validate:phase8',
  'quality:phase8',
  'a11y:check',
  'routes:check',
  'security:static',
  'release:report',
]) {
  if (!pkg.scripts?.[script]) {
    console.error(`Phase 8 validation failed: missing npm script ${script}`);
    process.exit(1);
  }
}
const css = fs.readFileSync(path.resolve('src/styles/globals.css'), 'utf8');
if (!css.includes("@import './phase8.css';")) {
  console.error('Phase 8 validation failed: phase8.css is not imported.');
  process.exit(1);
}
const sw = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');
for (const token of ['offline.html', 'mobilex-v2.0.0-final', 'SKIP_WAITING'])
  if (!sw.includes(token)) {
    console.error(`Phase 8 validation failed: service worker contract ${token} missing.`);
    process.exit(1);
  }
console.log(
  `Phase 8 preflight passed: ${required.length} required artifacts and release contracts verified.`,
);

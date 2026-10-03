import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const required = [
  'index.html',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'vitest.config.ts',
  'src/App.tsx',
  'src/main.tsx',
  'src/app/router/AppRouter.tsx',
  'src/app/router/guards.tsx',
  'src/app/routes/routeConfig.ts',
  'src/app/providers/AppProviders.tsx',
  'src/app/config/env.ts',
  'src/app/config/constants.ts',
  'src/stores/useAppStore.ts',
  'src/stores/useAuthStore.ts',
  'src/stores/useRuntimeStore.ts',
  'src/features/cart/cart.store.ts',
  'src/features/wishlist/wishlist.store.ts',
  'src/features/notifications/notification.store.ts',
  'src/lib/storage/storage.ts',
  'src/lib/storage/migrations.ts',
  'src/lib/errors/app-error.ts',
  'src/lib/events/bus.ts',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/repository.ts',
  'src/lib/api/http.ts',
  'src/lib/auth/permissions.ts',
  'src/lib/validation/schemas.ts',
  'src/styles/globals.css',
  'src/styles/tokens.css',
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Missing required foundation files:');
  missing.forEach((file) => console.error(` - ${file}`));
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const requiredScripts = ['dev', 'build', 'typecheck', 'test', 'lint', 'format:check', 'quality'];
const missingScripts = requiredScripts.filter((name) => !pkg.scripts?.[name]);
if (missingScripts.length) {
  console.error(`Missing npm scripts: ${missingScripts.join(', ')}`);
  process.exit(1);
}

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(path.join(root, 'src'));

const source = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (/service[_-]?role/i.test(source)) {
  console.error('Potential service-role secret reference found in frontend source.');
  process.exit(1);
}

console.log(
  `Foundation preflight passed: ${required.length} required files, ${sourceFiles.length} source files scanned.`,
);

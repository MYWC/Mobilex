import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const requiredDirs = ['src', 'public', 'supabase', 'tests', '.github'];
const missing = requiredDirs.filter((d) => !fs.existsSync(path.join(root, d)));
if (missing.length) throw new Error(`Missing release directories: ${missing.join(', ')}`);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== '2.0.0') throw new Error(`Expected final version 2.0.0, got ${pkg.version}`);
const env = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_PUBLIC_APP_URL'])
  if (!env.includes(key + '=')) throw new Error(`Missing env contract: ${key}`);
const migrationFiles = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();
if (!migrationFiles.some((f) => f.startsWith('0010_')))
  throw new Error('Final release migration is missing.');
const docs = ['SECURITY.md', 'ACCESSIBILITY.md', 'RELEASE_CHECKLIST.md', 'PHASE8.md', 'PHASE9.md'];
const missingDocs = docs.filter((f) => !fs.existsSync(path.join(root, f)));
if (missingDocs.length) throw new Error(`Missing release docs: ${missingDocs.join(', ')}`);
console.log(
  `Release preflight passed: ${migrationFiles.length} migrations, final version ${pkg.version}, and required release contracts present.`,
);

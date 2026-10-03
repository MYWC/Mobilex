import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'src/features/compare/compare.store.ts',
  'src/features/reviews/reviews.service.ts',
  'src/features/qa/qa.service.ts',
  'src/features/loyalty/loyalty.service.ts',
  'src/features/support/support.service.ts',
  'src/features/promotions/promotions.service.ts',
  'src/features/recommendations/recommendations.service.ts',
  'src/pages/growth/ComparePage.tsx',
  'src/pages/growth/LoyaltyPage.tsx',
  'src/pages/growth/SupportPage.tsx',
  'src/pages/growth/PromotionsPage.tsx',
  'supabase/migrations/0009_growth_engine.sql',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing Phase 9 file: ${file}`);
}
const routes = fs.readFileSync(path.join(root, 'src/app/routes/routeConfig.ts'), 'utf8');
for (const token of ['/compare', '/recommendations', '/promotions', '/support', '/account/loyalty'])
  if (!routes.includes(token)) throw new Error(`Missing route ${token}`);
const allFiles = [];
const walk = (dir) => {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(ent.name)) allFiles.push(full);
  }
};
walk(path.join(root, 'src'));
for (const file of allFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/from\s+['\"](@\/[^'\"]+)['\"]/g)) {
    const rel = path.join(root, 'src', m[1].slice(2));
    const ok =
      ['.ts', '.tsx', '.js', '.jsx'].some((ext) => fs.existsSync(rel + ext)) ||
      fs.existsSync(path.join(rel, 'index.ts')) ||
      fs.existsSync(path.join(rel, 'index.tsx'));
    if (!ok) throw new Error(`Broken local import in ${file}: ${m[1]}`);
  }
}
console.log(
  `Phase 9 preflight passed: ${required.length} critical files, all growth routes, and local imports found.`,
);

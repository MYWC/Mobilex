import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const routeFile = fs.readFileSync(path.resolve(root, 'src/app/routes/routeConfig.ts'), 'utf8');
const routerFile = fs.readFileSync(path.resolve(root, 'src/app/router/AppRouter.tsx'), 'utf8');
const routes = [...routeFile.matchAll(/\b(\w+):\s*['"]([^'"]+)['"]/g)].map((m) => ({
  name: m[1],
  path: m[2],
}));
const routeNames = new Set(routes.map((r) => r.name));
const referenced = [...routerFile.matchAll(/routes\.(\w+)/g)].map((m) => m[1]);
const missing = referenced.filter((name) => !routeNames.has(name));
if (missing.length) {
  console.error('Unknown route constants:', [...new Set(missing)].join(', '));
  process.exit(1);
}
for (const { name, path: routePath } of routes) {
  if (routePath.includes('*')) continue;
  if (!routerFile.includes(`routes.${name}`) && !['admin'].includes(name)) {
    console.error(`Route constant is not referenced: ${name}`);
    process.exit(1);
  }
}
console.log(`Route integrity passed: ${routes.length} route constants audited.`);

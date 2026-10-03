import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/components/admin/AdminShell.tsx',
  'src/pages/admin/AdminDashboardPage.tsx',
  'src/pages/admin/AdminProductsPage.tsx',
  'src/pages/admin/AdminInventoryPage.tsx',
  'src/pages/admin/AdminOrdersPage.tsx',
  'src/pages/admin/AdminUsersPage.tsx',
  'src/pages/admin/AdminContentPage.tsx',
  'src/pages/admin/AdminAnalyticsPage.tsx',
  'src/pages/admin/AdminAuditPage.tsx',
  'src/pages/admin/AdminRolesPage.tsx',
  'src/pages/admin/AdminSettingsPage.tsx',
  'src/styles/admin.css',
  'supabase/migrations/0008_admin_control_center.sql',
];
for (const file of required) if (!fs.existsSync(path.join(root,file))) throw new Error(`Missing Phase 6 file: ${file}`);
const routes=fs.readFileSync(path.join(root,'src/app/routes/routeConfig.ts'),'utf8');
for (const key of ['adminDashboard','adminProducts','adminInventory','adminOrders','adminUsers','adminContent','adminAnalytics','adminAudit','adminRoles','adminSettings']) if(!routes.includes(key)) throw new Error(`Missing route constant: ${key}`);
const permissions=fs.readFileSync(path.join(root,'src/lib/auth/permissions.ts'),'utf8');
for (const key of ['inventory.read','inventory.write','content.read','audit.read','roles.read']) if(!permissions.includes(key)) throw new Error(`Missing permission: ${key}`);
const appRouter=fs.readFileSync(path.join(root,'src/app/router/AppRouter.tsx'),'utf8');
for (const page of ['AdminDashboardPage','AdminProductsPage','AdminInventoryPage','AdminOrdersPage','AdminUsersPage','AdminContentPage','AdminAnalyticsPage','AdminAuditPage','AdminRolesPage','AdminSettingsPage']) if(!appRouter.includes(page)) throw new Error(`Admin route not wired: ${page}`);
console.log('Phase 6 preflight passed.');

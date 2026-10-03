import fs from 'node:fs';
import path from 'node:path';
const base = (process.env.VITE_PUBLIC_APP_URL || process.env.MOBILEX_PUBLIC_URL || '').replace(/\/$/, '');
if (!base) {
  console.warn('Skipping sitemap generation: set VITE_PUBLIC_APP_URL or MOBILEX_PUBLIC_URL.');
  process.exit(0);
}
const routes = ['/', '/products', '/compare', '/promotions'];
const now = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${base}${route}</loc><lastmod>${now}</lastmod></url>`).join('')}</urlset>\n`;
const out = path.resolve('public/sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`Wrote ${out}`);

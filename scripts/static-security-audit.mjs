import fs from 'node:fs';
import path from 'node:path';
const roots = ['src', 'public'];
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else files.push(f);
  }
}
for (const r of roots) if (fs.existsSync(r)) walk(r);
const frontendSecretPatterns = [
  /VITE_[A-Z0-9_]*(SECRET|PASSWORD|PRIVATE|TOKEN)/i,
  /BEGIN (RSA|EC|OPENSSH) PRIVATE KEY/i,
  /SUPABASE_SERVICE_ROLE/i,
];
const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.startsWith('src/'))
    for (const p of frontendSecretPatterns)
      if (p.test(text)) findings.push(`${file}: frontend secret-like pattern ${p}`);
}
const sw = fs.existsSync('public/sw.js') ? fs.readFileSync('public/sw.js', 'utf8') : '';
if (!sw.includes("cache: 'no-store'"))
  findings.push('public/sw.js: navigation fetch should bypass stale browser cache');
if (findings.length) {
  console.error('Static security audit failed:\n' + findings.join('\n'));
  process.exit(1);
}
console.log(`Static security audit passed: ${files.length} source/public files scanned.`);

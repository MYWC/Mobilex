import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const dirs = ['src/components', 'src/pages'];
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(tsx|jsx)$/.test(e.name)) files.push(f);
  }
}
for (const d of dirs) if (fs.existsSync(d)) walk(d);
const findings = [];
for (const file of files) {
  const s = fs.readFileSync(file, 'utf8');
  const stripped = s.replace(/<svg[\s\S]*?<\/svg>/g, '');
  if (/<img\b(?![^>]*\balt=)/i.test(stripped)) findings.push(`${file}: img without alt attribute`);
  if (/<button\b(?![^>]*\b(?:aria-label|title|children|>))/i.test(stripped)) {
    /* heuristic only */
  }
  if (/onClick=\{\(\)\s*=>\s*window\.open\(/.test(s) && !/noopener|noreferrer/.test(s))
    findings.push(`${file}: window.open without explicit safe features`);
}
if (findings.length) {
  console.error('Accessibility/static UX audit findings:\n' + findings.join('\n'));
  process.exit(1);
}
console.log(`Accessibility/static UX audit passed: ${files.length} TSX/JSX files scanned.`);

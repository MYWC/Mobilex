import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const count = (dir, rx) => {
  let n = 0;
  if (!fs.existsSync(dir)) return 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (rx.test(e.name)) n++;
    }
  };
  walk(dir);
  return n;
};
let git = 'not available';
try {
  git = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {}
const report = {
  generatedAt: new Date().toISOString(),
  version: pkg.version,
  commit: git,
  sourceFiles: count('src', /\.(ts|tsx)$/),
  testFiles: count('tests', /\.(ts|tsx)$/),
  migrations: count('supabase/migrations', /\.sql$/),
  edgeFunctions: count('supabase/functions', /index\.ts$/),
  status: 'final-release-candidate',
};
fs.writeFileSync(path.resolve('RELEASE_REPORT.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));

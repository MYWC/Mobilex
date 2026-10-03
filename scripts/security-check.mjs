import fs from 'node:fs';
const forbidden = [
  /service_role/i,
  /SUPABASE_SERVICE_ROLE/i,
  /VITE_.*SECRET/i,
  /PAYMENT_WEBHOOK_SECRET/i,
  /CRON_SECRET/i,
];
const roots = ['src', 'public'];
const files = [];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = `${dir}/${entry.name}`;
      if (entry.isDirectory()) stack.push(file);
      else if (!/node_modules/.test(file)) files.push(file);
    }
  }
}
let failed = false;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      console.error(`SECURITY FLAG: ${file} matches ${pattern}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log(`Security secret scan passed (${files.length} files).`);

import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist/assets');
if (!fs.existsSync(root)) { console.error('dist/assets not found. Run npm run build first.'); process.exit(1); }
const files = fs.readdirSync(root).map(name => { const file = path.join(root, name); return { name, bytes: fs.statSync(file).size }; }).sort((a,b)=>b.bytes-a.bytes);
const total = files.reduce((sum,item)=>sum+item.bytes,0);
console.log(`Total asset bytes: ${(total/1024).toFixed(1)} KiB`);
for (const file of files.slice(0,20)) console.log(`${(file.bytes/1024).toFixed(1).padStart(8)} KiB  ${file.name}`);
if (total > 2_500_000) process.exitCode = 2;

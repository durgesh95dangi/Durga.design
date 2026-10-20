// Verifies every internal href/src in /site resolves to a file (or a _redirects rule).
// Usage: node build/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const redirects = fs.readFileSync(path.join(OUT, '_redirects'), 'utf8').split('\n').map(l => l.split(' ')[0]).filter(Boolean);
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(OUT).filter(f => f.endsWith('.html'));
const missing = new Map(); let checked = 0;
const exists = u => {
  const p = decodeURIComponent(u.split(/[?#]/)[0]);
  if (!p || redirects.includes(p.replace(/\/$/, '')) || redirects.includes(p)) return true;
  const f = path.join(OUT, p);
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (m[1].startsWith('//')) continue;
    checked++;
    if (!exists(m[1])) missing.set(m[1], (missing.get(m[1]) || []).concat(path.relative(OUT, f)));
  }
}
console.log(`${pages.length} pages, ${checked} internal links checked, ${missing.size} broken`);
for (const [u, from] of missing) console.log(' ✕', u, '←', [...new Set(from)].slice(0, 3).join(', '));
process.exitCode = missing.size ? 1 : 0;

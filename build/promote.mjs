// Moves a finished draft from src/data/blog-drafts.json into the live blog (src/data/blog.json).
// Usage: npm run promote -- <slug>
// Refuses while the draft still has [ADD: ...] placeholders. Keeps the original publish date and URL,
// sets "updated" to today (India time), and removes the draft.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = path.join(ROOT, 'src/data/blog.json'), DRAFTS = path.join(ROOT, 'src/data/blog-drafts.json');
const slug = process.argv[2];
if (!slug) { console.error('Usage: npm run promote -- <slug>'); process.exit(1); }
const live = JSON.parse(fs.readFileSync(LIVE, 'utf8')), drafts = JSON.parse(fs.readFileSync(DRAFTS, 'utf8'));
const d = drafts.find(x => x.slug === slug);
if (!d) { console.error(`No draft called "${slug}". Drafts: ${drafts.map(x => x.slug).join(', ')}`); process.exit(1); }
const left = JSON.stringify(d).match(/\[ADD:[^\]]*\]/g) || [];
if (left.length) { console.error(`Not promoted: ${left.length} placeholder(s) still to fill:\n - ` + left.join('\n - ')); process.exit(1); }
const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const i = live.findIndex(x => x.slug === slug);
const next = { ...d, published: i >= 0 ? live[i].published : (d.published || today), updated: today };
if (i >= 0) live[i] = next; else live.unshift(next);
fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n');
fs.writeFileSync(DRAFTS, JSON.stringify(drafts.filter(x => x !== d), null, 2) + '\n');
console.log(`Promoted "${slug}" (updated ${today}). Run: npm run build && npm run check`);

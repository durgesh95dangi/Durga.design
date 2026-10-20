// Static site generator for durga.design
// Usage: node build/build.mjs   → writes HTML into /site (assets in /site/assets are static and untouched)
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, CAL, EMAIL, RESUME, LINKEDIN, X_URL, esc, attr, page, btn, ctas, crumbs, pageHero, shead, faq, faqLd, list, process, split,
  statGrid, card, quoteCard, TESTIMONIALS, logoSlider
} from './lib.mjs';
import { vilcartStory } from './content/vilcart.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'site');
const data = n => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', n + '.json'), 'utf8'));
const src = n => fs.readFileSync(path.join(ROOT, 'src/pages', n), 'utf8');
const services = data('services'), work = data('work'), expertise = data('expertise'), resources = data('resources'),
  tools = data('tools'), blog = data('blog'), categories = data('categories'), hubs = data('hubs');

const routes = [];
/* Cache-busting: every /assets/css|js link gets ?v=<content hash>, so browsers always load the latest file. */
const assetHash = {};
const versioned = html => html.replace(/(\/assets\/(?:css|js)\/[\w.-]+\.(?:css|js))"/g, (m, p) => {
  assetHash[p] ??= crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, p))).digest('hex').slice(0, 8);
  return `${p}?v=${assetHash[p]}"`;
});
function emit(route, html) {
  html = versioned(html);
  const file = route.endsWith('.html') ? path.join(OUT, route) : path.join(OUT, route, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (!route.endsWith('.html')) routes.push(route);
}
const mainOf = html => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
const styleOf = html => (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const media = p => p; // paths already normalised to /assets/media/...

/* ======================================================================
   ORDER / LOOKUPS
   ====================================================================== */
/* Project visibility:
   REMOVED   → not on the site at all (no page, not listed)
   NDA_CASES → listed in work grids as a non-clickable NDA card, no case study page
   everything else in work → public case study at /work/<slug>/ */
const REMOVED = ['ai-insurance'];  // Insurtech
const NDA_CASES = ['pureblue'];    // Pureblue.ai
for (const s of REMOVED) work.splice(work.findIndex(w => w.slug === s), 1);
const ndaCases = work.filter(w => NDA_CASES.includes(w.slug));
for (const s of NDA_CASES) work.splice(work.findIndex(w => w.slug === s), 1);
const WORK_ORDER = ['eyeontask', 'dhani', 'vilcart'];
work.sort((a, b) => WORK_ORDER.indexOf(a.slug) - WORK_ORDER.indexOf(b.slug));
const workBy = Object.fromEntries(work.map(w => [w.slug, w]));
/** What work grids show: public case studies first, then NDA projects. */
const SHOWCASE = [...work, ...ndaCases];
// expertise pages may only point at case studies that have a public page
expertise.forEach(e => { e.proof = e.proof.filter(p => workBy[p.href.split('/').pop()]); });
const blogBy = Object.fromEntries(blog.map(b => [b.slug, b]));
const SERVICE_ORDER = ['ux-audit', 'saas-product-design', 'product-redesign', 'design-partner'];
services.sort((a, b) => SERVICE_ORDER.indexOf(a.slug) - SERVICE_ORDER.indexOf(b.slug));
const EXP_ORDER = ['saas-ux', 'fintech-ux', 'ai-product-design', 'dashboard-ux', 'design-systems'];
expertise.sort((a, b) => EXP_ORDER.indexOf(a.slug) - EXP_ORDER.indexOf(b.slug));
const RES_ORDER = ['ux-checklist', 'ux-audit-template', 'dashboard-checklist', 'design-system-resources'];
resources.sort((a, b) => RES_ORDER.indexOf(a.slug) - RES_ORDER.indexOf(b.slug));
const RES_KIND = { 'ux-checklist': 'Checklist', 'ux-audit-template': 'Template', 'dashboard-checklist': 'Checklist', 'design-system-resources': 'Guide' };
const TOOL_CAT = {
  'contrast-checker': 'color', 'hex-to-rgb': 'color', 'color-blindness': 'color', 'type-scale': 'type', 'line-height': 'type',
  'spacing-scale': 'layout', 'aspect-ratio': 'layout', 'css-grid': 'layout', flexbox: 'layout',
  'border-radius': 'style', shadow: 'style', gradient: 'style', 'px-to-rem': 'convert', 'svg-to-base64': 'convert'
};
const TOOL_ORDER = Object.keys(TOOL_CAT);
tools.sort((a, b) => TOOL_ORDER.indexOf(a.slug) - TOOL_ORDER.indexOf(b.slug));
const TOOL_ICON = { color: 'Aa', type: 'T', layout: '▦', style: '◩', convert: '⇄' };
const WORK_CARD = {
  eyeontask: { img: '/assets/eyeontask.png', chips: ['SaaS', 'Web + Mobile'], metric: 'Churn 28% → 13%' },
  dhani: { img: '/assets/dhani.png', chips: ['Fintech', 'Mobile'], metric: '8 steps → 2 taps' },
  vilcart: { img: '/assets/vilcart.jpg', chips: ['E-commerce', 'Mobile'], metric: 'Built for low bandwidth' },
  pureblue: { img: '/assets/pureblue.webp', chips: ['AI', 'Dashboard'], metric: '100K+ data streams' }
};
const H1_ACCENT = {
  eyeontask: 'same page', dhani: '2 taps', vilcart: 'rural India', 'ai-insurance': 'Copilot', pureblue: 'Real-Time'
};
const nextOf = (arr, i) => arr[(i + 1) % arr.length];

/* ======================================================================
   SHARED BLOCKS
   ====================================================================== */
const workCard = (w, i) => {
  const c = WORK_CARD[w.slug], nda = NDA_CASES.includes(w.slug), tag = nda ? 'article' : 'a';
  return `<${tag} class="work-card${nda ? ' work-card--nda' : ''} rv" style="--i:${i % 2}"${nda ? '' : ` href="/work/${w.slug}/"`}>
  <div class="work-card__media">
    <img src="${c.img}" alt="${attr(w.client)} — ${attr(w.h1)}" loading="lazy">
    <div class="work-card__chips">${c.chips.map(x => `<span>${esc(x)}</span>`).join('')}</div>
    ${nda ? '' : `<span class="work-card__metric">${esc(c.metric)}</span>`}
  </div>
  <div>
    <div class="work-card__head"><h3 class="work-card__title">${esc(w.client)} — ${esc(w.h1)}</h3><span class="work-card__idx">${String(i + 1).padStart(2, '0')}</span></div>
    <p class="work-card__desc">${esc(w.summary)}</p>
    ${caseStatus(nda ? 'nda' : 'page')}
  </div>
</${tag}>`;
};
/** Case availability — one pattern everywhere:
 *  'page' → the card links to /work/<slug>/ and shows a "Read case study" button
 *  'nda'  → the card is NOT a link and shows a lock note instead */
const caseStatus = s => s === 'page'
  ? `<span class="btn btn-inv btn-sm case-cta">Read case study <span class="arr">↗</span></span>`
  : `<p class="case-nda"><span aria-hidden="true">🔒</span> Project under NDA — happy to walk through it on a call.</p>`;
const ndaCard = ({ media, kicker, title, text }, i = 0) => `<article class="card card--nda rv" style="--i:${i % 3}">
  ${media ? `<div class="card__media"><img src="${media}" alt="" loading="lazy"></div>` : `<div class="card__media card__media--nda" aria-hidden="true"><span>🔒</span><b>Under NDA</b></div>`}
  <div class="card__body">
    <p class="card__kicker">${kicker}</p>
    <h3 class="card__title">${esc(title)}</h3>
    <p class="card__text">${esc(text)}</p>
    <div class="card__foot">${caseStatus('nda')}</div>
  </div>
</article>`;
const nextCase = slug => {
  const i = WORK_ORDER.indexOf(slug), n = workBy[nextOf(WORK_ORDER, i)];
  return `<section class="section-md band-alt">
  <div class="container">
    <p class="t-label eyebrow rv">Next case study</p>
    <a class="next-case rv" href="/work/${n.slug}/">
      <div>
        <div class="tags" style="margin-bottom:var(--sp-4)"><span class="tag">${esc(n.category)}</span><span class="tag tag-neutral">${esc(n.platform)}</span></div>
        <h2 class="t-h2" style="margin-bottom:var(--sp-4)">${esc(n.client)} — ${esc(n.h1)}</h2>
        <p class="t-body" style="margin-bottom:var(--sp-6)">${esc(n.impact)}</p>
        <span class="btn btn-primary">Read case study <span class="arr">↗</span></span>
      </div>
      <div class="next-case__media"><img src="${WORK_CARD[n.slug].img}" alt="" loading="lazy"></div>
    </a>
  </div>
</section>`;
};
const postCard = (p, i = 0) => card({
  href: `/blog/${p.slug}/`, media: p.hero, mediaAlt: p.heroAlt,
  kicker: `<b>${esc(p.categoryLabel)}</b><span>${esc(p.readTime)}</span>`, title: p.title, text: p.excerpt || p.lead, foot: 'Read article', tags: p.category
}).replace('class="card rv"', `class="card rv" style="--i:${i % 3}"`);
const toolCard = (t, i = 0) => card({
  href: `/tool/${t.slug}/`, icon: TOOL_ICON[TOOL_CAT[t.slug]], kicker: `<b>${TOOL_CAT[t.slug]}</b>`, title: t.name, text: t.desc.split('. ')[0] + '.', foot: 'Open tool', tags: TOOL_CAT[t.slug]
}).replace('class="card rv"', `class="card rv" style="--i:${i % 3}"`);
const resCard = (r, i = 0) => card({
  href: `/resources/${r.slug}/`, icon: String(i + 1).padStart(2, '0'), kicker: `<b>${RES_KIND[r.slug]}</b><span>${esc(r.readTime)}</span>`, title: r.h1, text: r.desc, foot: 'Open framework'
}).replace('class="card rv"', `class="card rv" style="--i:${i % 3}"`);
const testimonials = (title = 'What clients <em>say</em>.') => `<section class="section-md band-alt">
  <div class="container">
    ${shead('Testimonials', title)}
    <div class="card-grid">${TESTIMONIALS.map(quoteCard).join('')}</div>
  </div>
</section>`;
const faqSection = (items, title = 'Questions, <em>answered</em>.') => items.length ? `<section class="section-md">
  <div class="container">
    ${shead('FAQ', title)}
    ${faq(items)}
  </div>
</section>` : '';

/* ======================================================================
   HOME + DESIGN SYSTEM (hand-built sources)
   ====================================================================== */
{
  // Homepage = recruiter / full-time audience. No freelance, service or pricing signals here (those live on /hire/).
  const body = mainOf(src('home.html'))
    .replace('<!--LOGO_SLIDER-->', logoSlider('Teams I’ve worked with'))
    .replaceAll('<!--RESUME_URL-->', RESUME)
    .replace('<!--WORK_CARDS-->', SHOWCASE.map(workCard).join('\n'));
  emit('/', page({
    path: '/', title: 'Durga — Product Designer for Fintech & B2B SaaS', active: '/',
    desc: 'Durga is a senior product designer with 8+ years designing fintech and B2B SaaS products, with teams at Vestas, Dhani and EyeOnTask.',
    head: '<link rel="stylesheet" href="/assets/css/home.css">\n', body, nav: 'minimal', navCta: { label: 'Download resume', href: RESUME, download: true },
    foot: { variant: 'recruiter', kicker: 'Open to senior product design roles', title: 'Hiring a product<br>designer? Let’s <em>talk</em>.' },
    jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: 'Durga Prasad', jobTitle: 'Senior Product Designer', url: SITE, sameAs: [LINKEDIN, X_URL] }
  }));
  const ds = src('design-system.html');
  emit('/design-system/', page({
    path: '/design-system/', title: 'Design System', active: '/design-system/', noindex: true,
    desc: 'Tokens, components and page patterns that keep every Durga.design page consistent.',
    head: `<style>${styleOf(ds)}</style>\n`, body: mainOf(ds),
    foot: { kicker: 'Design System v1.0', title: 'Build it <em>once</em>,<br>use it everywhere.' },
    scripts: `<script>
document.querySelectorAll('.sw').forEach(b => b.addEventListener('click', async () => {
  const t = document.querySelector('.toast'), v = 'var(' + b.dataset.token + ')';
  try { await navigator.clipboard.writeText(v); t.textContent = 'Copied ' + v; } catch { t.textContent = v; }
  t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1600);
}));
</script>\n`
  }).replace('</main>', '</main>\n<div class="toast" role="status" aria-live="polite"></div>'));
}

/* ======================================================================
   WORK
   ====================================================================== */
{
  const h = hubs.work;
  const body = `${pageHero({ eyebrow: 'Case studies', title: 'Designs that drove <em>real</em> business results.', lead: h.lead,
    actions: btn('Book a 15-min call', CAL, 'primary', 'lg') })}
<section class="band-dark section-md">
  <div class="container">
    ${shead('Selected work', `${SHOWCASE.length} products, <em>measured</em>.`, '<p class="t-body">Fintech, field service, rural commerce and AI — each one judged by what changed for the business.</p>')}
    <div class="work-grid">${SHOWCASE.map(workCard).join('\n')}</div>
  </div>
</section>
<section class="section-md">
  <div class="container">
    ${shead('Archive', 'Other selected <em>engagements</em>.')}
    <div class="card-grid">
      ${ndaCard({ media: '/assets/media/images/sparkd.webp', kicker: '<b>Healthcare</b><span>Mobile app</span>', title: 'Spark Diagnostics — Vitamin D Rapid Test App', text: 'An optical companion app that scans rapid lateral flow tests to deliver quantitative blood Vitamin D metrics in 15 minutes.' }, 0)}
      ${ndaCard({ media: '/assets/media/images/saas-dashboard.jpg', kicker: '<b>Clean energy</b><span>Enterprise SaaS</span>', title: 'Vestas — Enterprise Asset Telemetry Interface', text: 'Streamlined operational data monitoring for wind turbine telemetry and scheduled maintenance planning.' }, 1)}
      ${ndaCard({ media: '/assets/dhani.png', kicker: '<b>Fintech</b><span>Micro-lending</span>', title: 'Indiabulls — Digital Lending & Credit KYC', text: 'High-conversion paperless loan application and instant bank account verification flows.' }, 2)}
    </div>
    <div style="margin-top:var(--sp-16)">${logoSlider('Selected clients & partners')}</div>
  </div>
</section>`;
  emit('/work/', page({ path: '/work/', title: h.title, desc: h.desc, active: '/work/', body,
    foot: { kicker: 'Free · 15 minutes', title: 'Have a complex <em>product</em><br>challenge? Let\'s talk.' } }));

  // Case study pages
  const eyeontaskSrc = mainOf(src('work-eyeontask.html'));
  for (const w of work) {
    let body;
    const title = esc(w.h1).replace(esc(H1_ACCENT[w.slug]), `<em>${esc(H1_ACCENT[w.slug])}</em>`);
    if (w.slug === 'eyeontask') {
      body = eyeontaskSrc.slice(0, eyeontaskSrc.indexOf('<!-- 8. NEXT CASE -->')) + nextCase(w.slug);
      body = body.replace(/<!--[\s\S]*?CASE STUDY TEMPLATE[\s\S]*?-->/, '').replace('href="/#work">Work', 'href="/work/">Work');
    } else {
      const story = w.slug === 'vilcart' ? vilcartStory : null;
      const toc = story ? story.toc : [['challenge', 'The challenge'], ['decisions', 'Key decisions'], ['results', 'Results']];
      const sections = story ? story.html : `
        <section class="cs-section" id="challenge">
          <p class="cs-section__k rv">The challenge</p>
          <div class="prose">
            <h2 class="rv">Why the previous experience was costing revenue.</h2>
            ${w.challenge.split('\n\n').map(p => `<p class="rv">${esc(p)}</p>`).join('')}
          </div>
        </section>
        <section class="cs-section" id="decisions">
          <p class="cs-section__k rv">Key decisions</p>
          <div class="prose"><h2 class="rv">${w.decisions.length} fixes that changed the numbers.</h2></div>
          ${w.decisions.map((d, i) => `<article class="ps rv">
            <header class="ps__head"><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(d.title)}</h3></header>
            <div class="ps__col"><p class="ps__label ps__label--problem">Friction</p><p>${esc(d.problem)}</p></div>
            <div class="ps__col"><p class="ps__label ps__label--solution">Design solution</p><p>${esc(d.solution)}</p></div>
          </article>`).join('')}
        </section>
        <section class="cs-section" id="results">
          <p class="cs-section__k rv">Results</p>
          <div class="prose">
            <h2 class="rv">What changed.</h2>
            <p class="rv">${esc(w.impact)}.</p>
          </div>
          <ol class="outcomes rv" style="margin-top:var(--sp-8)">${w.results.map(r => `<li><span><b>${esc(r.value)}</b> — ${esc(r.label)}</span></li>`).join('')}</ol>
          ${w.quote ? `<blockquote class="pull rv" style="margin-top:var(--sp-12)">${esc(w.quote.text)}</blockquote><p class="t-caption rv" style="margin-top:var(--sp-3);padding-left:var(--sp-6)">— ${esc(w.quote.author)}, ${esc(w.quote.role)}</p>` : ''}
        </section>`;
      const meta = story ? story.meta : [['Client', w.client], ['Duration', w.duration], ['Platform', w.platform], ['Focus', w.category]];
      const stats = story ? story.stats : w.results;
      body = `
  <section class="cs-hero">
    <div class="container">
      ${crumbs([['Work', '/work/'], [w.client, '']])}
      <div class="tags fade-in" style="--d:.05s"><span class="tag">${esc(w.category)}</span><span class="tag tag-neutral">${esc(w.platform)}</span></div>
      <h1 class="t-h1 cs-hero__title fade-in" style="--d:.1s">${story ? story.title : title}</h1>
      <div class="cs-hero__grid">
        <p class="t-lead cs-hero__summary fade-in" style="--d:.25s">${esc(story ? story.summary : w.summary)}</p>
        <dl class="cs-meta fade-in" style="--d:.35s">${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
    </div>
  </section>
  <div class="container"><figure class="cs-cover rv" data-reveal-img><img src="${story ? story.cover : w.cover}" alt="${attr(w.client)} interface design"></figure></div>
  <section class="section-sm"><div class="container">${statGrid(stats)}</div></section>
  <section class="section-md" style="padding-top:var(--sp-12)">
    <div class="container cs-layout">
      <aside class="cs-toc" aria-label="On this page"><p class="t-label">On this page</p><ol>${toc.map(([id, l]) => `<li><a href="#${id}">${esc(l)}</a></li>`).join('')}</ol></aside>
      <div>${sections}</div>
    </div>
  </section>
  ${nextCase(w.slug)}`;
    }
    emit(`/work/${w.slug}/`, page({
      path: `/work/${w.slug}/`, title: w.title, desc: w.desc, active: '/work/', body, image: WORK_CARD[w.slug].img,
      foot: { kicker: 'Free · 15 minutes', title: 'Need this kind of<br><em>thinking</em>? Let\'s talk.' }
    }));
  }
}

/* ======================================================================
   SERVICES
   ====================================================================== */
{
  const h = hubs.services;
  const block = (s, i) => `<article class="split" id="${s.slug}">
  <div class="split__head">
    <p class="cs-section__k rv">${String(i + 1).padStart(2, '0')} · ${esc(s.badge)}</p>
    <h2 class="t-h3 rv">${esc(s.h1)}</h2>
    <div class="tags rv" style="margin-top:var(--sp-4)"><span class="tag">${esc(s.price)}</span><span class="tag tag-neutral">${esc(s.duration)}</span></div>
  </div>
  <div class="rv" style="--i:1">
    <p class="t-lead" style="margin-bottom:var(--sp-4)">${esc(s.lead)}</p>
    <p class="t-body" style="margin-bottom:var(--sp-6);max-width:var(--measure)">${esc(s.body)}</p>
    ${list(s.deliverables.slice(0, 3))}
    <div style="display:flex;flex-wrap:wrap;gap:var(--sp-4);margin-top:var(--sp-8)">${btn('See details', `/services/${s.slug}/`, 'primary')}${btn(s.ctas[0].label, s.ctas[0].href, 'secondary')}</div>
  </div>
</article>`;
  const body = `${pageHero({ eyebrow: h.eyebrow, title: 'Senior design craft, <em>zero</em> agency fluff.', lead: h.lead,
    actions: btn('Book a 15-min call', CAL, 'primary', 'lg') + btn('Compare plans', '/subscription/', 'secondary', 'lg') })}
<section class="section-md" style="padding-top:var(--sp-8)"><div class="container">${services.map(block).join('')}</div></section>`;
  emit('/services/', page({ path: '/services/', title: h.title, desc: h.desc, active: '/services/', body,
    foot: { kicker: 'Free · 15 minutes', title: 'Not sure which<br><em>fits</em>? Let\'s talk.' } }));

  services.forEach((s, i) => {
    const body = `${pageHero({ crumbs: [['Services', '/services/'], [s.h1, '']],
      tags: `<span class="tag">${esc(s.price)}</span><span class="tag tag-neutral">${esc(s.duration)}</span><span class="tag tag-neutral">${esc(s.badge)}</span>`,
      title: esc(s.h1), lead: s.lead, actions: ctas(s.ctas) })}
<section class="section-md" style="padding-top:var(--sp-8)">
  <div class="container">
    ${split('Overview', 'What this engagement is.', `<p class="t-lead" style="max-width:var(--measure)">${esc(s.body)}</p>`)}
    ${split('Who it’s for', 'Ideal if you are…', list(s.ideal, 'arrow'))}
    ${split('What you get', 'Delivered to you.', list(s.deliverables))}
    ${split('Outcomes', 'What changes.', list(s.outcomes, 'dot'))}
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${shead('Process', 'How it <em>works</em>.')}
    ${process(s.process)}
  </div>
</section>
${faqSection(s.faqs)}
<section class="section-sm" style="padding-top:0">
  <div class="container">
    <p class="t-label eyebrow rv">Other services</p>
    <div class="card-grid">${services.filter(o => o !== s).map((o, j) => card({ href: `/services/${o.slug}/`, kicker: `<b>${esc(o.price)}</b><span>${esc(o.duration)}</span>`, title: o.h1, text: o.lead, foot: 'See details' }).replace('class="card rv"', `class="card rv" style="--i:${j}"`)).join('')}</div>
  </div>
</section>`;
    emit(`/services/${s.slug}/`, page({ path: `/services/${s.slug}/`, title: s.title, desc: s.desc, active: '/services/', body, jsonld: faqLd(s.faqs),
      foot: { kicker: esc(s.price) + ' · ' + esc(s.duration), title: esc(s.cta.title).replace('started', '<em>started</em>') } }));
  });
}

/* ======================================================================
   SUBSCRIPTION + UX AUDIT (sales pages)
   ====================================================================== */
{
  const h = hubs.subscription;
  const why = [['Pause or cancel anytime', 'Got a slow month? Pause your subscription and resume when you have more design needs. No wasted spend.'],
    ['Fast delivery', 'Get your designs one at a time in just a few days on average.'], ['Fixed monthly rate', 'No surprises. Pay the same fixed price each month.'],
    ['Top-tier quality', 'Work directly with a senior designer. No juniors, no account managers.'], ['Flexible and scalable', 'Scale up or down as needed, and never worry about benefits, vacations, or sick days.'],
    ['Unique and all yours', 'Every design is made specifically for you and is 100% yours.']];
  const what = ['Web design', 'UI/UX design', 'Mobile apps', 'Landing pages', 'Wireframing', 'Slide decks', 'Branding', 'Logos', 'Icons', 'Brand guides', 'Email templates', 'Display ads', 'Social media', 'Frontend dev'];
  const plan = (name, price, turnaround, meetings, featured) => `<div class="price${featured ? ' price--featured' : ''} rv">
    ${featured ? '<span class="price__flag">Most popular</span>' : ''}
    <h3 class="t-card-title">${name}</h3>
    <div class="price__amount">$${price}<small>/mo</small></div>
    <p class="t-caption">No minimum commitment. Pause or cancel anytime.</p>
    ${list(['Unlimited UX and UI tasks, completed one at a time', 'Unlimited revisions', `${turnaround} turnaround on average for simple tasks`, 'Daily communication via Slack, Figma, Notion', meetings])}
    ${btn('Schedule a call', CAL, featured ? 'primary' : 'secondary', 'lg')}
  </div>`;
  const body = `${pageHero({ eyebrow: 'DesignStream subscription', title: 'Unlimited UX/UI design, <em>one</em> monthly fee.', lead: h.lead,
    actions: btn('See pricing', '#pricing', 'primary', 'lg') + btn('Book a 15-min call', CAL, 'secondary', 'lg') })}
<section class="section-md">
  <div class="container">
    ${shead('Why subscribe', 'Why subscribe instead of <em>hiring</em>?')}
    <div class="card-grid">${why.map(([t, x], i) => `<div class="card rv" style="--i:${i % 3}"><div class="card__body"><span class="card__icon" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="card__title">${t}</h3><p class="card__text">${x}</p></div></div>`).join('')}</div>
  </div>
</section>
<div class="strip" aria-hidden="true"><div class="marquee__track">${[...what, ...what].map(w => `<span>${w}<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z"/></svg></span>`).join('')}</div></div>
<section class="section-md">
  <div class="container">
    ${shead('How it works', 'Three steps to a better <em>product</em>.')}
    ${process([{ title: 'Subscribe', text: 'Pick a plan and get onboarded onto your dedicated Trello board within 24 hours.' }, { title: 'Request', text: "Add as many design requests to your board as you'd like. I'll work through them one by one." }, { title: 'Receive', text: "Receive high-quality designs in 2–4 business days on average. We'll revise until you're 100% satisfied." }], 3)}
  </div>
</section>
<section class="band-dark section-md">
  <div class="container">
    ${shead('Selected work', 'Designs that drove real <em>results</em>.', `<a class="btn btn-inv" href="/work/">View all work <span class="arr">↗</span></a>`)}
    <div class="work-grid">${SHOWCASE.map(workCard).join('')}</div>
  </div>
</section>
${testimonials()}
<section class="section-md" id="pricing">
  <div class="container">
    ${shead('Pricing', 'Subscription-based UX <em>design</em>.')}
    <div class="price-grid">${plan('DesignStream Growth', '2,999', '24–36 hour', '1 meeting every week', true)}${plan('DesignStream Lite', '999', '3 day', '1 meeting every 4 weeks', false)}</div>
  </div>
</section>
${faqSection([
    { q: 'Do you work with fintech or SaaS startups?', a: "Yes. I specialize in B2B SaaS, enterprise, and fintech. If your product has complex workflows and heavy data, I'm your guy." },
    { q: 'Are you available for design consulting or contract work?', a: "Yes. I do everything from two-week UX audits to massive multi-month redesigns. Just tell me what's broken." },
    { q: "What's your design process like?", a: "I focus on business logic first. Then I prototype in Figma and hand off pixel-perfect specs with Loom videos. Your engineers won't have to guess." },
    { q: 'Do you work with international clients?', a: "Yes. I'm based in Bengaluru but work mostly with US and European startups. It's fully async. I use Figma, Notion, and Loom to move fast without endless meetings." },
    { q: 'What industries do you have experience in?', a: 'Fintech, B2B SaaS, and Enterprise. I also have deep roots in Agri-tech and Field Service Management. Complex industries are where I thrive.' }])}`;
  emit('/subscription/', page({ path: '/subscription/', title: h.title, desc: h.desc, active: '/services/', body,
    foot: { kicker: 'Pause or cancel anytime', title: 'A senior designer,<br><em>on tap</em>.' } }));

  const a = hubs['ux-audit'];
  const value = [['The screen-by-screen video teardown', '$1,000', 'I record my screen as I navigate your product like a real user. You hear my unfiltered thoughts as I hit friction, confusion and usability violations in real time.'],
    ['Actionable wireframe redesigns', '$1,500', "I don't just point out problems; I solve them. You get a Figma file with low-fidelity wireframes showing exactly how your core screens should be laid out to convert."],
    ['The prioritised dev roadmap', '$500', 'A Notion document listing every issue I found, graded by impact vs. effort. Copy-paste the items into Jira and hand them straight to your engineers.'],
    ['1-on-1 strategy review call', '$500', 'After you receive the report, we jump on a 30-minute call to discuss findings, answer questions and plan your next moves.']];
  const ab = `${pageHero({ eyebrow: a.eyebrow, title: 'Stop losing users. Fix the <em>leaks</em> before you buy more ads.', lead: a.lead,
    actions: btn('Fix my UX for $499', '#pricing', 'primary', 'lg') + btn('Book a 15-min call', CAL, 'secondary', 'lg'),
    meta: '<span>100% money-back guarantee</span><span class="dot"></span><span>Delivered in 36 hours</span>' })}
<section class="section-md">
  <div class="container">
    ${split('The hard truth', 'Every drop-off is a tax on your <em>revenue</em>.', `<div class="prose">
      <p>You’ve built a great product and you’re paying for traffic. People land, scroll for five seconds, get confused by the layout and bounce. Or they start signing up, hit unnecessary friction, and leave.</p>
      <p>You can’t out-market a bad user experience. If the funnel leaks, more traffic is water poured into a bucket with a hole in it. Nine times out of ten, the problem is cognitive friction:</p>
    </div>${list(['Your primary CTA is hidden below the fold.', 'Your pricing page creates choice paralysis.', 'Your onboarding flow asks for too much information too early.', 'Your mobile experience is broken.'], 'x')}
    <p class="t-body" style="margin-top:var(--sp-6)">These are silent killers. They don’t throw error codes. They just quietly kill your conversion rate.</p>`)}
    ${split('Who’s auditing', 'Stop guessing. Let me find the <em>leaks</em>.', `<div class="prose">
      <p>Hi, I’m Durga, a senior product designer with over 8 years building interfaces for fintech and SaaS companies. I analyse products through user psychology, interaction cost and heuristic best practice, not “pretty colours”.</p>
      <p>Instead of hiring a full-time designer for $120k a year, or paying an agency $10,000 to rebrand, you get a surgical audit of the product you already have: where users get stuck, and exactly how to fix it.</p>
    </div>`)}
  </div>
</section>
<section class="section-md band-alt" id="pricing">
  <div class="container">
    ${shead('What you get', 'Exactly what’s in the <em>audit</em>.')}
    <div class="card-grid card-grid--2">${value.map(([t, v, x], i) => `<div class="card rv" style="--i:${i % 2}"><div class="card__body"><p class="card__kicker"><b>${String(i + 1).padStart(2, '0')}</b><span>Value ${v}</span></p><h3 class="card__title">${t}</h3><p class="card__text">${x}</p></div></div>`).join('')}</div>
    <div class="callout callout--accent rv" style="margin-top:var(--sp-10);grid-template-columns:1fr;max-width:640px">
      <p class="callout__label">Total value $3,500</p>
      <div class="price__amount">$499 <small>one-time · 36-hour turnaround</small></div>
      <p class="t-body">Spots are limited so every audit gets my full attention.</p>
      <div>${btn('Lock in my audit', CAL, 'primary', 'lg')}</div>
    </div>
  </div>
</section>
<section class="section-md">
  <div class="container">
    ${split('Guarantee', 'My 30-day <em>guarantee</em>.', `<p class="t-lead" style="max-width:var(--measure)">If you implement my top 3 recommendations and don’t see a positive improvement in your conversion metrics within 30 days, I’ll refund your $499 in full.</p>`)}
    ${split('Fit', 'Who this is for.', `<div class="card-grid card-grid--2" style="gap:var(--sp-8)"><div><p class="t-label" style="color:var(--clr-success);margin-bottom:var(--sp-3)">For</p>${list(['Post-revenue SaaS or fintech founders', 'Companies actively spending on ads or SEO', 'Teams with developers ready to implement changes'])}</div><div><p class="t-label" style="color:var(--clr-danger);margin-bottom:var(--sp-3)">Not for</p>${list(['Pre-launch ideas with no users or traffic', 'E-commerce stores (I specialise in software)', 'Founders looking for a rebrand or logo'], 'x')}</div></div>`)}
  </div>
</section>
${testimonials('Founders who stopped <em>guessing</em>.')}
${faqSection([
    { q: 'What do you need from me to get started?', a: 'Just a link to your product, any test credentials needed to log in, and a brief description of who your target user is. Analytics access (Mixpanel, GA4) is a bonus, but not required.' },
    { q: 'How is this different from a normal UX design project?', a: 'A normal UX project takes months and costs $10k+. This is a surgical strike: fast, affordable, and focused on high-impact conversion levers rather than reinventing your entire design system.' },
    { q: 'Do you also write the code?', a: 'No. I provide the design solutions, wireframes and UX logic. Your developers implement the changes, and the roadmap is structured so they can execute without ambiguity.' }])}`;
  emit('/ux-audit/', page({ path: '/ux-audit/', title: a.title, desc: a.desc, active: '/services/', body: ab,
    foot: { kicker: '$499 · 36 hours · money-back guarantee', title: 'Ready to stop<br>losing <em>users</em>?' } }));
}

/* ======================================================================
   EXPERTISE
   ====================================================================== */
{
  const h = hubs.expertise;
  const caseLabel = p => { const w = workBy[p.href.split('/').pop()]; return w ? `${w.client} — ${w.h1}` : p.raw.replace(/↗$/, ''); };
  const pillar = (e, i) => `<article class="split" id="${e.slug}">
  <div class="split__head">
    <p class="cs-section__k rv">Pillar ${String(i + 1).padStart(2, '0')}</p>
    <h2 class="t-h3 rv">${esc(e.h1)}</h2>
    <p class="rv">${esc(e.lead)}</p>
  </div>
  <div class="rv" style="--i:1">
    <p class="t-body" style="max-width:var(--measure);margin-bottom:var(--sp-6)">${esc(e.body)}</p>
    ${statGrid(e.stats)}
    <div style="margin-top:var(--sp-6)">${list(e.deliverables.slice(0, 4), 'arrow')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:var(--sp-4);margin-top:var(--sp-8)">${btn('Explore this domain', `/expertise/${e.slug}/`, 'primary')}${e.proof[0] ? btn('Case: ' + workBy[e.proof[0].href.split('/').pop()]?.client, e.proof[0].href + '/', 'secondary') : ''}</div>
  </div>
</article>`;
  emit('/expertise/', page({ path: '/expertise/', title: h.title, desc: h.desc, active: '/expertise/',
    body: `${pageHero({ eyebrow: h.eyebrow, title: 'Built for complexity, designed for <em>clarity</em>.', lead: h.lead })}
<section class="section-md" style="padding-top:var(--sp-8)"><div class="container">${expertise.map(pillar).join('')}</div></section>`,
    foot: { kicker: 'Free · 15 minutes', title: 'Need expertise for<br>your <em>product</em>?' } }));

  for (const e of expertise) {
    const body = `${pageHero({ crumbs: [['Expertise', '/expertise/'], [e.h1, '']], eyebrow: 'Specialised domain', title: esc(e.h1), lead: e.lead,
      actions: ctas(e.cta.ctas.map(c => ({ ...c, href: c.href === '/ux-audit' ? '/ux-audit/' : c.href }))) })}
<section class="section-sm"><div class="container">${statGrid(e.stats)}</div></section>
<section class="section-md" style="padding-top:var(--sp-8)">
  <div class="container">
    ${split('Context', 'Why it matters.', `<p class="t-lead" style="max-width:var(--measure)">${esc(e.body)}</p>`)}
    ${split('Bottlenecks', 'Friction I solve.', list(e.bottlenecks, 'x'))}
    ${split('Principles', 'Rules I design by.', `<ol class="outcomes" style="grid-template-columns:1fr">${e.principles.map(p => `<li><span>${esc(p)}</span></li>`).join('')}</ol>`)}
    ${split('Deliverables', 'What you receive.', list(e.deliverables))}
    ${e.proof.length === 0 ? '' : split('Proof', 'Proven in production.', `<div class="card-grid card-grid--2">${e.proof.map(p => { const w = workBy[p.href.split('/').pop()]; return card({ href: p.href + '/', media: w ? WORK_CARD[w.slug].img : '', kicker: w ? `<b>${esc(w.category)}</b>` : '', title: caseLabel(p), text: w ? w.impact : '', foot: 'Read case' }); }).join('')}</div>`)}
    ${split('Reading', 'Masterclass deep dives.', `<div class="card-grid card-grid--2">${e.reading.map(r => { const b = blogBy[r.href.split('/').pop()]; return b ? postCard(b) : ''; }).join('')}</div>`)}
  </div>
</section>
${faqSection(e.faqs)}`;
    emit(`/expertise/${e.slug}/`, page({ path: `/expertise/${e.slug}/`, title: e.title, desc: e.desc, active: '/expertise/', body, jsonld: faqLd(e.faqs),
      foot: { kicker: 'Free · 15 minutes', title: 'Ready to remove the<br><em>friction</em>?' } }));
  }
}

/* ======================================================================
   ABOUT + CONTACT
   ====================================================================== */
{
  const h = hubs.about;
  const body = `<section class="page-hero">
  <div class="container" style="display:grid;gap:var(--sp-12);align-items:end" data-about-grid>
    <div>
      <p class="t-label eyebrow fade-in">${esc(h.eyebrow)}</p>
      <h1 class="t-h1 page-hero__title fade-in" style="--d:.1s">Designing high-retention software for <em>ambitious</em> teams.</h1>
      <div class="prose fade-in" style="--d:.2s">
        <p class="t-lead">I’m Durga Prasad, a freelance product designer with 8+ years helping early-stage and scale-up tech companies turn complex engineering into intuitive, commercially defensible products.</p>
        <p>Most software doesn’t fail for lack of engineering horsepower. It fails because of friction debt: convoluted onboarding, ambiguous navigation, and cognitive overload that make users churn before they see value.</p>
        <p>I bridge user psychology, tokenised design systems and front-end engineering to remove that friction, whether it’s a fintech lending flow, an AI observability dashboard, or a multi-tenant SaaS platform.</p>
      </div>
      <div class="page-hero__actions fade-in" style="--d:.3s">${btn('Book a 15-min intro call', CAL, 'primary', 'lg')}${btn('View case studies', '/work/', 'secondary', 'lg')}</div>
    </div>
    <figure class="portrait fade-in" style="--d:.2s;position:relative;border:1px solid var(--clr-ink);box-shadow:var(--shadow-xl);overflow:hidden;aspect-ratio:4/5;max-width:440px">
      <img src="/assets/portrait.jpg" alt="Portrait of Durga Prasad" style="width:100%;height:100%;object-fit:cover;object-position:50% 20%">
      <figcaption class="status" style="position:absolute;left:var(--sp-4);bottom:var(--sp-4);background:var(--clr-surface)"><span class="status__dot"></span>Working async, worldwide</figcaption>
    </figure>
  </div>
</section>
<section class="section-sm"><div class="container">${statGrid([{ value: '8+', label: 'Years in product design' }, { value: '30+', label: 'Platforms shipped' }, { value: '$45M+', label: 'Client capital raised' }, { value: '2.4x', label: 'Average conversion lift' }])}</div></section>
<section class="section-md">
  <div class="container">
    ${shead('Design philosophy', 'How I approach <em>software</em>.', '<p class="t-body">Designing software is an engineering discipline anchored in behavioural economics and ergonomics, not decoration.</p>')}
    <div class="card-grid card-grid--2">${[
      ['Systems over isolated screens', "Single mockups don't scale. I build tokenised design systems where every Figma variable maps 1:1 to code, so what ships matches what was designed."],
      ['Time-to-value is everything', 'If users cannot feel value within 180 seconds, churn spikes. I design progressive onboarding that postpones friction until after value is unlocked.'],
      ['Data density without chaos', 'B2B and fintech operators need actionable data, not empty white space. I design glanceable hierarchies, sticky table geometry and contextual drill-downs.'],
      ['Engineering empathy by default', 'I speak TypeScript, Git and React. Designs ship with edge cases, loading states and accessible states, so handoff has no guesswork.']
    ].map(([t, x], i) => `<div class="card rv" style="--i:${i % 2}"><div class="card__body"><span class="card__icon" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="card__title">${t}</h3><p class="card__text">${x}</p></div></div>`).join('')}</div>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${split('Career', 'Track record &amp; experience.', `<ol class="timeline">${[
      ['2024 — Present', 'Fractional Design Partner & Systems Architect', 'Durga.design (global remote)', 'Partnering with seed to Series B SaaS, fintech and AI startups across North America, Europe and Asia. Delivering UX audits, token architecture and fast product redesigns.'],
      ['2022 — 2024', 'Lead Product Designer — Fintech & Lending', 'Dhani (Indiabulls ecosystem)', 'Designed multi-step credit verification flows, digital wallet interfaces and biometric authentication for 10M+ users. Reduced checkout drop-off by 38% and raised KYC completion to 91%.'],
      ['2020 — 2022', 'Senior Product Designer — Enterprise SaaS', 'EyeOnTask & Vilcart', 'Redesigned field service dispatching SaaS and B2B rural supply-chain software. Cut dispatcher workflow time from 12 to 4.2 minutes and onboarding churn from 28% to 13%.'],
      ['2018 — 2020', 'Product Designer & UI Engineer', 'Early-stage ventures & studios', 'Designed zero-to-one MVPs, web apps and customer portals for early-stage B2B SaaS founders, bridging visual design, user psychology and front-end implementation.']
    ].map(([w, t, at, x]) => `<li class="rv"><p class="timeline__when">${w}</p><h3>${t}</h3><p class="timeline__where">${at}</p><p>${x}</p></li>`).join('')}</ol>`)}
  </div>
</section>
<section class="section-md">
  <div class="container">
    ${shead('Toolkit', 'Technical &amp; design <em>toolkit</em>.')}
    <div class="stat-grid rv" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))">${[
      ['Product & UI design', 'Figma (Variables, Auto-Layout, Token Studio), Principle, ProtoPie, FigJam'],
      ['Front-end & code', 'React, Next.js (App Router), TypeScript, Tailwind CSS, HTML5 Canvas, Git'],
      ['UX research & analytics', 'Heuristic audits (Nielsen Norman), PostHog, Hotjar, UserTesting, FullStory'],
      ['Project operations', 'Linear, Notion, Loom, Slack (async workflow)']
    ].map(([t, x]) => `<div class="stat-cell"><p class="t-label" style="color:var(--clr-accent)">${t}</p><p class="t-body" style="font-size:var(--text-sm)">${x}</p></div>`).join('')}</div>
  </div>
</section>`;
  emit('/about/', page({ path: '/about/', title: h.title, desc: h.desc, active: '/about/', body,
    head: '<style>@media(min-width:900px){[data-about-grid]{grid-template-columns:7fr 5fr}}</style>\n',
    foot: { kicker: 'Free · 15 minutes', title: 'Have a product<br><em>challenge</em>? Let’s talk.' } }));

  const c = hubs.contact;
  const cbody = `${pageHero({ eyebrow: c.eyebrow, title: 'Let’s build software people <em>enjoy</em> using.', lead: c.lead })}
<section class="section-md">
  <div class="container">
    <div class="card-grid">
      ${card({ href: CAL, icon: '01', kicker: '<b>Fastest</b><span>Free</span>', title: '15-minute intro call', text: 'Talk through your roadmap, redesign challenges or partnership needs on Zoom or Google Meet.', foot: 'Pick a time on Cal.com' })}
      ${card({ href: '/services/ux-audit/', icon: '02', kicker: '<b>Fixed scope</b><span>$499</span>', title: 'SaaS UX audit', text: 'A 45-minute video teardown and structured Figma issue matrix that finds conversion leaks and friction.', foot: 'Order the audit' })}
      ${card({ href: '/subscription/', icon: '03', kicker: '<b>Monthly</b><span>From $999/mo</span>', title: 'Design partner retainer', text: 'A dedicated design partner for funded startups. Unlimited requests, 48-hour turnarounds, pause anytime.', foot: 'View plans' })}
    </div>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${split('Direct', 'Reach me directly.', `<div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))">${[
      ['Email', EMAIL, 'mailto:' + EMAIL, 'Response within 12 hours.'],
      ['Video call', 'cal.com/dpdangi/15min', CAL, '15-minute 1:1 call.'],
      ['X (Twitter)', '@my_durgesh', X_URL, 'Open DMs for quick feedback.'],
      ['LinkedIn', 'linkedin.com/in/durgaprasad-ux-designer', LINKEDIN, 'Connect and message.']
    ].map(([k, v, u, n]) => `<div class="stat-cell"><p class="t-label" style="color:var(--clr-ink-3)">${k}</p><a href="${u}" style="font-family:var(--font-display);font-size:var(--text-xl);overflow-wrap:anywhere"${/^https/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${v}</a><p class="t-caption">${n}</p></div>`).join('')}</div>`)}
    ${split('How I work', 'What working together looks like.', process([
      { title: 'Async-first', text: 'No unnecessary hour-long recurring meetings. Updates come as short Loom videos and interactive Figma prototypes.' },
      { title: 'In your tools', text: 'I plug into your tickets, Linear and Slack channels for real-time collaboration.' },
      { title: '48-hour turnaround', text: 'Requests are scoped into small sprints so developers never sit blocked waiting on UI specs.' },
      { title: 'Production parity', text: 'Every component ships with token specs, edge cases and responsive constraints.' }], 2))}
  </div>
</section>
${faqSection([
    { q: 'How quickly can we kick off?', a: 'UX audits start immediately and are delivered within 36 hours. Design retainer sprints usually start within 3–5 business days depending on queue capacity.' },
    { q: 'Do you sign NDAs before discovery?', a: 'Yes. For proprietary or unreleased products I’m happy to sign a standard mutual NDA before our walkthrough.' },
    { q: 'What timezones do you support?', a: 'I work from UTC+5:30 with good overlap across US East Coast, US West Coast and Central European working hours.' },
    { q: 'Can I reach out directly via email or social?', a: 'Yes. Email ' + EMAIL + ' or DM @my_durgesh on X. I reply to qualified inquiries within 12 hours.' }], 'Common <em>questions</em>.')}`;
  emit('/contact/', page({ path: '/contact/', title: c.title, desc: c.desc, active: '/contact/', body: cbody,
    foot: { kicker: 'Instant scheduling', title: 'Skip the email.<br>Grab <em>15 minutes</em>.' } }));
}

/* ======================================================================
   BLOG
   ====================================================================== */
{
  const h = hubs.blog;
  const usedCats = categories.map(c => ({ ...c, count: blog.filter(b => b.category === c.slug).length }));
  const chipsNav = active => `<div class="chips rv">${[{ slug: '', label: 'All' }, ...usedCats].map(c => `<a class="chip${active === c.slug ? ' is-active' : ''}" href="/blog/${c.slug ? 'category/' + c.slug + '/' : ''}">${esc(c.label)}${c.count !== undefined ? ` · ${c.count}` : ''}</a>`).join('')}</div>`;
  const [feat, ...rest] = blog;
  const body = `${pageHero({ eyebrow: h.eyebrow, title: 'UX insights that fix friction and keep <em>real</em> users.', lead: h.lead })}
<section class="section-md">
  <div class="container">
    ${chipsNav('')}
    <a class="next-case rv" href="/blog/${feat.slug}/" style="margin-block:var(--sp-10)">
      <div>
        <p class="card__kicker" style="margin-bottom:var(--sp-4)"><b>Latest · ${esc(feat.categoryLabel)}</b><span>${esc(feat.readTime)}</span></p>
        <h2 class="t-h2" style="margin-bottom:var(--sp-4)">${esc(feat.title)}</h2>
        <p class="t-body" style="margin-bottom:var(--sp-6)">${esc(feat.excerpt)}</p>
        <span class="btn btn-primary">Read article <span class="arr">↗</span></span>
      </div>
      <div class="next-case__media"><img src="${feat.hero}" alt="${attr(feat.heroAlt)}"></div>
    </a>
    <div class="card-grid">${rest.map(postCard).join('')}</div>
  </div>
</section>`;
  emit('/blog/', page({ path: '/blog/', title: h.title, desc: h.desc, active: '/blog/', body,
    foot: { kicker: 'Free · 15 minutes', title: 'Let me find the<br>hidden <em>leaks</em>.' } }));

  for (const c of usedCats) {
    const posts = blog.filter(b => b.category === c.slug);
    const body = `${pageHero({ crumbs: [['Blog', '/blog/'], [c.label, '']], title: esc(c.h1), lead: c.lead })}
<section class="section-md">
  <div class="container">
    ${chipsNav(c.slug)}
    <div style="margin-top:var(--sp-10)">${posts.length ? `<div class="card-grid">${posts.map(postCard).join('')}</div>` : `<div class="callout rv" style="max-width:640px"><p class="callout__label">Coming soon</p><h2 class="t-h3">New ${esc(c.label)} articles are on the way.</h2><p class="t-body">Meanwhile, the full library covers onboarding, dashboards, fintech trust and more.</p><div>${btn('Browse all articles', '/blog/', 'primary')}</div></div>`}</div>
  </div>
</section>`;
    emit(`/blog/category/${c.slug}/`, page({ path: `/blog/category/${c.slug}/`, title: c.title, desc: c.desc, active: '/blog/', body,
      foot: { kicker: 'Free · 15 minutes', title: `Need hands-on help with<br><em>${esc(c.label)}</em>?` } }));
  }

  blog.forEach((p, i) => {
    const url = `${SITE}/blog/${p.slug}/`;
    const related = blog.filter(b => b !== p && b.category === p.category).concat(blog.filter(b => b !== p && b.category !== p.category)).slice(0, 3);
    const body = `<section class="article-hero">
  <div class="container">
    ${crumbs([['Blog', '/blog/'], [p.categoryLabel, `/blog/category/${p.category}/`], ['Article', '']])}
    <div class="page-hero__meta fade-in" style="--d:.05s"><a class="tag" href="/blog/category/${p.category}/">${esc(p.categoryLabel)}</a><span>${esc(p.readTime)}</span></div>
    <h1 class="t-h1 article-hero__title fade-in" style="--d:.1s">${esc(p.title)}</h1>
    <p class="t-lead fade-in" style="--d:.2s;max-width:62ch">${esc(p.lead)}</p>
    <div class="byline fade-in" style="--d:.3s;margin-top:var(--sp-6)"><img src="/assets/portrait.jpg" alt=""><div><b>Durga Prasad</b><span>Senior Product Designer · Fintech &amp; B2B SaaS</span></div></div>
    <figure class="article-hero__cover rv" data-reveal-img><img src="${p.hero}" alt="${attr(p.heroAlt)}"></figure>
  </div>
</section>
<section class="section-md" style="padding-top:var(--sp-8)">
  <div class="container article">
    <div>
      ${p.quickAnswer ? `<div class="callout callout--accent rv" style="margin-bottom:var(--sp-10)"><p class="callout__label">Quick answer</p><p class="t-body" style="color:var(--clr-ink)">${esc(p.quickAnswer)}</p></div>` : ''}
      ${p.takeaways.length ? `<div class="rv" style="margin-bottom:var(--sp-10)"><p class="t-label eyebrow">Key takeaways</p>${list(p.takeaways)}</div>` : ''}
      <div class="prose prose-lg">${p.body}</div>
      ${p.faqs.length ? `<div style="margin-top:var(--sp-16)"><p class="t-label eyebrow rv">FAQ</p>${faq(p.faqs)}</div>` : ''}
    </div>
    <aside class="article__aside">
      <div class="callout rv">
        <p class="callout__label">Work with me</p>
        <p class="t-body" style="font-size:var(--text-sm)">Want these fixes applied to your product? I run surgical $499 UX audits for SaaS and fintech teams.</p>
        <div style="display:grid;gap:var(--sp-2)">${btn('Get a UX audit', '/ux-audit/', 'primary', 'sm')}${btn('Book a 15-min call', CAL, 'secondary', 'sm')}</div>
      </div>
      <div class="rv">
        <p class="t-label" style="color:var(--clr-ink-3);margin-bottom:var(--sp-3)">Share</p>
        <div class="share">
          <a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(url)}">X</a>
          <a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}">LinkedIn</a>
          <button class="btn btn-secondary btn-sm" type="button" data-copy="${url}">Copy link</button>
        </div>
      </div>
      <div class="rv">
        <p class="t-label" style="color:var(--clr-ink-3);margin-bottom:var(--sp-3)">Free tools</p>
        <a class="btn-ghost" style="font-weight:600;font-size:var(--text-sm)" href="/tool/">14 browser design tools →</a>
      </div>
    </aside>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${shead('Keep reading', 'More from the <em>workshop</em>.')}
    <div class="card-grid">${related.map(postCard).join('')}</div>
  </div>
</section>`;
    emit(`/blog/${p.slug}/`, page({
      path: `/blog/${p.slug}/`, title: p.title, desc: p.desc, active: '/blog/', body, image: p.hero,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.desc, image: SITE + p.hero, author: { '@type': 'Person', name: 'Durga Prasad', url: SITE }, mainEntityOfPage: url }, faqLd(p.faqs)].filter(Boolean),
      foot: { kicker: '$499 UX audit · 36 hours', title: 'Want this fixed in<br>your <em>product</em>?' }
    }));
  });
}

/* ======================================================================
   RESOURCES
   ====================================================================== */
{
  const h = hubs.resources;
  const body = `${pageHero({ eyebrow: h.eyebrow, title: 'Frameworks to audit, design &amp; <em>ship</em>.', lead: h.lead })}
<section class="section-md">
  <div class="container">
    ${shead('Frameworks', 'Checklists, scorecards &amp; <em>guides</em>.')}
    <div class="card-grid card-grid--2">${resources.map(resCard).join('')}</div>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${shead('Free tools', '14 browser design <em>utilities</em>.', btn('See all tools', '/tool/', 'secondary'))}
    <div class="card-grid">${tools.slice(0, 6).map(toolCard).join('')}</div>
  </div>
</section>`;
  emit('/resources/', page({ path: '/resources/', title: h.title, desc: h.desc, active: '/resources/', body,
    foot: { kicker: '$499 UX audit · 36 hours', title: 'Need an expert eye<br>on your <em>product</em>?' } }));

  for (const r of resources) {
    const total = r.groups.reduce((n, g) => n + g.items.length, 0);
    const body = `${pageHero({ crumbs: [['Resources', '/resources/'], [r.h1, '']], tags: `<span class="tag">${RES_KIND[r.slug]}</span><span class="tag tag-neutral">${esc(r.readTime)}</span><span class="tag tag-neutral">Interactive</span>`,
      title: esc(r.h1), lead: r.lead })}
<section class="section-md" data-checklist="${r.slug}">
  <div class="container" style="max-width:960px">
    <div class="ck-bar rv">
      <div><p class="t-caption">Audit score</p><p class="ck-bar__score"><span data-ck-done>0</span>/${total}</p></div>
      <div class="ck-bar__meter" aria-hidden="true"><i></i></div>
      <div style="display:flex;gap:var(--sp-2)"><button class="btn btn-secondary btn-sm" type="button" data-ck-reset>Reset</button>${btn('Get an expert audit', '/services/ux-audit/', 'primary', 'sm')}</div>
    </div>
    ${r.groups.map((g, gi) => `<div class="ck-group rv">
      <div class="ck-group__head"><h2 class="t-h3">${gi + 1}. ${esc(g.title)}</h2><span>0/${g.items.length} passed</span></div>
      ${g.items.map(it => `<label class="ck"><input type="checkbox"><div><b>${esc(it.title)}${it.tag ? ` <span class="tag">${esc(it.tag.replace(/^Critical\s*/, ''))}</span>` : ''}</b><p>${esc(it.desc)}</p></div></label>`).join('')}
    </div>`).join('')}
    <p class="t-caption rv">Your progress is saved in this browser only.</p>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${split('Principles', 'Best practices.', `<ol class="outcomes" style="grid-template-columns:1fr">${r.principles.map(p => `<li><span>${esc(p)}</span></li>`).join('')}</ol>`)}
    ${r.faqs.length ? split('FAQ', 'Common question.', faq(r.faqs)) : ''}
  </div>
</section>
<section class="section-md">
  <div class="container">
    <p class="t-label eyebrow rv">Other toolkits</p>
    <div class="card-grid">${resources.filter(o => o !== r).map(o => resCard(o, resources.indexOf(o))).join('')}</div>
  </div>
</section>`;
    emit(`/resources/${r.slug}/`, page({ path: `/resources/${r.slug}/`, title: r.title, desc: r.desc, active: '/resources/', body,
      foot: { kicker: '$499 · 45-minute video teardown', title: 'Want an expert<br><em>audit</em> instead?' } }));
  }
}

/* ======================================================================
   TOOLS
   ====================================================================== */
{
  const h = hubs.tool;
  const cats = ['color', 'type', 'layout', 'style', 'convert'];
  const body = `${pageHero({ eyebrow: 'Free · No account · Nothing uploaded', title: 'Fourteen design <em>tools</em> for your browser.', lead: h.lead.replace(' Search or filter by category.', '') })}
<section class="section-md">
  <div class="container">
    <div class="chips rv" data-filter-group="tools" style="margin-bottom:var(--sp-10)">
      <button class="chip" type="button" data-filter="all" aria-pressed="true">All · ${tools.length}</button>
      ${cats.map(c => `<button class="chip" type="button" data-filter="${c}" aria-pressed="false">${c} · ${tools.filter(t => TOOL_CAT[t.slug] === c).length}</button>`).join('')}
    </div>
    <div class="card-grid" data-filter-target="tools">${tools.map(toolCard).join('')}</div>
  </div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${split('About', 'What these tools are.', `<div class="prose"><p>Free browser utilities for product designers and front-end engineers working on fintech and B2B SaaS interfaces.</p><p>Check WCAG contrast, convert colour formats, preview colour vision deficiency, build type and spacing scales, solve aspect ratios, and copy CSS for grid, flexbox, radius, shadow and gradients. Everything runs locally in your browser.</p></div>`)}
  </div>
</section>`;
  emit('/tool/', page({ path: '/tool/', title: h.title, desc: h.desc, active: '/tool/', body }));

  for (const t of tools) {
    const others = tools.filter(o => o !== t && TOOL_CAT[o.slug] === TOOL_CAT[t.slug]).concat(tools.filter(o => TOOL_CAT[o.slug] !== TOOL_CAT[t.slug])).slice(0, 3);
    const body = `${pageHero({ crumbs: [['Tools', '/tool/'], [t.name, '']], tags: `<span class="tag">${TOOL_CAT[t.slug]}</span><span class="tag tag-neutral">Runs locally</span>`, title: esc(t.h1), lead: t.lead })}
<section class="section-md" style="padding-top:var(--sp-10)">
  <div class="container"><div class="tool rv" data-tool="${t.slug}"><noscript>This tool needs JavaScript.</noscript></div>
  ${t.note ? `<p class="t-caption rv" style="margin-top:var(--sp-4)">${esc(t.note)}</p>` : ''}</div>
</section>
<section class="section-md band-alt">
  <div class="container">
    ${split('What it does', `About the ${esc(t.name)}.`, `<div class="prose">${t.what.map(p => `<p>${esc(p)}</p>`).join('')}</div>`)}
    ${split('How to use', 'Three steps.', process(t.how.map((x, i) => ({ title: ['Set', 'Read', 'Copy'][i] || 'Step', text: x })), 3))}
    ${split('When to use it', 'Where it helps.', `<div class="prose">${t.when.map(p => `<p>${esc(p)}</p>`).join('')}</div>`)}
  </div>
</section>
${faqSection(t.faqs, 'FAQ.')}
<section class="section-md" style="padding-top:0">
  <div class="container">
    <p class="t-label eyebrow rv">More tools</p>
    <div class="card-grid">${others.map(toolCard).join('')}</div>
  </div>
</section>`;
    emit(`/tool/${t.slug}/`, page({ path: `/tool/${t.slug}/`, title: t.title, desc: t.desc, active: '/tool/', body, jsonld: faqLd(t.faqs),
      scripts: '<script src="/assets/js/tools.js" defer></script>\n' }));
  }
}

/* ======================================================================
   HIRE ME — freelancer profile (homepage layout + verified platform reviews)
   Figures copied from the public Upwork & Fiverr profiles (Oct 2026). No outbound links to Upwork.
   ====================================================================== */
{
  const PROFILE = {
    asOf: 'October 2026',
    upwork: { rating: 4.7, reviews: 30, jobs: 34, completed: 33, hours: '1.4K' },
    fiverr: { rating: 5.0, reviews: 47 }
  };
  const totalReviews = PROFILE.upwork.reviews + PROFILE.fiverr.reviews;
  const HISTORY = [ // public Upwork work history (client names private)
    ['UI/UX design in Figma for a SharePoint application', 5.0, 'Sep 2024'],
    ['UX designer for a SaaS web application', 5.0, 'Jan – Jun 2021'],
    ['Complete website design: wireframes, mockups, prototype', 5.0, 'Mar – Jul 2021'],
    ['Healthcare app interface polish', 5.0, 'May 2021'],
    ['Convert a design into Webflow', 5.0, 'Mar 2021'],
    ['Elegant, simple website design', 4.6, 'Sep 2020'],
    ['Front-end development & UI/UX for an email platform', 4.0, 'Dec 2020 – May 2022']
  ];
  const rate = r => `<span class="rate" style="--r:${r}" role="img" aria-label="${r} out of 5 stars"></span>`;
  const platform = (name, p, meta) => `<article class="review-sum rv">
    <p class="review-sum__platform">${name}${name === 'Upwork' ? ' · <span>Verified</span>' : ''}</p>
    <div class="review-sum__score">${p.rating.toFixed(1)}<small>/5</small></div>
    ${rate(p.rating)}
    <p class="review-sum__meta">${meta.map(m => `<span>${m}</span>`).join('')}</p>
  </article>`;
  const body = `<section class="hero">
  <div class="container">
    <div class="hero__frame">
      <div class="hero__grid" aria-hidden="true"></div>
      <div class="hero__top">
        <span class="status fade-in"><span class="status__dot"></span>Available for freelance projects</span>
        <span class="hero__time fade-in" data-clock>India · --:--</span>
      </div>
      <p class="hero__hello fade-in">Hi, I'm <b>Durga</b> — freelance senior product designer</p>
      <h1 class="t-hero hero__headline">
        <span class="rise"><span>Your freelance <a class="face" href="#reviews" aria-label="Client reviews"><img src="/assets/portrait.jpg" alt="" width="800" height="1200"></a></span></span>
        <span class="rise" style="--d:.12s"><span><em>product</em> designer.</span></span>
      </h1>
      <p class="t-lead hero__sub fade-in" style="--d:.4s">8+ years designing fintech and B2B SaaS products. Rated ${PROFILE.upwork.rating}★ on Upwork across ${PROFILE.upwork.reviews} reviews and ${PROFILE.fiverr.rating.toFixed(1)}★ on Fiverr across ${PROFILE.fiverr.reviews}, with ${PROFILE.upwork.hours}+ hours logged on Upwork.</p>
      <div class="hero__actions fade-in" style="--d:.5s">
        <a class="btn btn-primary btn-lg" data-magnetic href="${CAL}" target="_blank" rel="noopener">Book a 15-min call <span class="arr">↗</span></a>
        <a class="btn btn-secondary btn-lg" data-magnetic href="#reviews">See client reviews <span class="arr arr--down">↓</span></a>
      </div>
    </div>
    <div style="margin-top:var(--sp-12)">${logoSlider('Trusted by teams at')}</div>
  </div>
</section>

<section class="section-sm">
  <div class="container">${statGrid([
    { value: String(totalReviews), label: 'Client reviews across Upwork & Fiverr' },
    { value: `${PROFILE.upwork.rating}★`, label: `Upwork rating · ${PROFILE.upwork.reviews} reviews` },
    { value: `${PROFILE.fiverr.rating.toFixed(1)}★`, label: `Fiverr rating · ${PROFILE.fiverr.reviews} reviews` },
    { value: `${PROFILE.upwork.hours}+`, label: 'Hours billed on Upwork' },
    { value: String(PROFILE.upwork.jobs), label: `Upwork jobs · ${PROFILE.upwork.completed} completed` }
  ])}</div>
</section>

<section class="section-md" id="reviews">
  <div class="container">
    ${shead('Client reviews', 'Rated by the people who <em>hired</em> me.', `<p class="t-body">Ratings as shown on my freelance profiles, ${PROFILE.asOf}.</p>`)}
    <div class="review-grid">
      ${platform('Upwork', PROFILE.upwork, [`${PROFILE.upwork.reviews} reviews`, `${PROFILE.upwork.jobs} jobs`, `${PROFILE.upwork.hours} hours`])}
      ${platform('Fiverr', PROFILE.fiverr, [`${PROFILE.fiverr.reviews} reviews`, 'UI/UX & web design'])}
    </div>
    <p class="t-label eyebrow rv" style="margin-top:var(--sp-16)">What clients say</p>
    <div class="card-grid">${TESTIMONIALS.map(quoteCard).join('')}</div>
  </div>
</section>

<section class="section-md band-alt">
  <div class="container">
    ${shead('Track record', 'Recent freelance <em>engagements</em>.', '<p class="t-body">A selection from my Upwork work history. Client names stay private.</p>')}
    <div class="tbl-wrap rv">
      <table class="tbl tbl--history">
        <thead><tr><th>Project</th><th>Client rating</th><th>Timeline</th></tr></thead>
        <tbody>${HISTORY.map(([t, r, d]) => `<tr><td>${esc(t)}</td><td><span class="tbl-rate">${rate(r)}<b>${r.toFixed(1)}</b></span></td><td>${esc(d)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="band-dark section-md">
  <div class="container">
    ${shead('Selected work', 'Case studies from client <em>projects</em>.', `<a class="btn btn-inv" href="/work/">View all work <span class="arr">↗</span></a>`)}
    <div class="work-grid">${SHOWCASE.map(workCard).join('')}</div>
  </div>
</section>

<section class="section-md">
  <div class="container">
    ${shead('How we’d work', 'Simple, async, <em>predictable</em>.')}
    ${process([
      { title: 'Free 15-min call', text: 'You walk me through the product and what’s broken. I tell you honestly whether I’m the right fit.' },
      { title: 'Scope & proposal', text: 'A fixed-scope audit, a project quote, or a monthly retainer — whichever matches your roadmap.' },
      { title: 'Design sprints', text: 'Async updates through Loom videos and Figma prototypes. No hour-long recurring meetings.' },
      { title: 'Handoff & support', text: 'Specs, tokens and edge cases your developers can build from, and I stay close through launch.' }])}
  </div>
</section>

<section class="section-md band-alt">
  <div class="container">
    ${shead('Ways to hire me', 'Pick the engagement that <em>fits</em>.')}
    <div class="card-grid">
      ${card({ href: '/services/ux-audit/', icon: '01', kicker: '<b>$499</b><span>36 hours</span>', title: 'SaaS & fintech UX audit', text: 'A screen-by-screen video teardown, Figma fixes for your top friction points, and a prioritised dev roadmap.', foot: 'See the audit' })}
      ${card({ href: '/services/saas-product-design/', icon: '02', kicker: '<b>Project</b><span>3–6 weeks</span>', title: '0-to-1 product design', text: 'End-to-end flows, UI and an interactive prototype for a new product or a major feature.', foot: 'See the project scope' })}
      ${card({ href: '/subscription/', icon: '03', kicker: '<b>From $999/mo</b><span>Pause anytime</span>', title: 'Design partner retainer', text: 'A senior designer on tap. Unlimited requests worked one at a time, with fast turnarounds.', foot: 'See plans' })}
    </div>
  </div>
</section>

${faqSection([
    { q: 'What timezone do you work in?', a: 'I work from Bengaluru (UTC+5:30) with good overlap across US East Coast, US West Coast and Central European working hours.' },
    { q: 'How quickly can we start?', a: 'UX audits start immediately and are delivered within 36 hours. Retainer and project work usually starts within 3–5 business days, depending on my queue.' },
    { q: 'Will you sign an NDA?', a: 'Yes. For proprietary or unreleased products I’m happy to sign a standard mutual NDA before we walk through anything.' },
    { q: 'How do we communicate?', a: 'Fully async by default: Slack, Figma, Notion and Loom. We add a short call when a decision needs one.' }], 'Before we <em>start</em>.')}`;
  emit('/hire/', page({
    path: '/hire/', title: 'Hire a Freelance Product Designer — Durga', active: '/hire/',
    desc: `Freelance senior product designer for fintech and B2B SaaS. Rated ${PROFILE.upwork.rating}★ on Upwork (${PROFILE.upwork.reviews} reviews) and ${PROFILE.fiverr.rating.toFixed(1)}★ on Fiverr (${PROFILE.fiverr.reviews} reviews), 8+ years of experience.`,
    head: '<link rel="stylesheet" href="/assets/css/home.css">\n', body,
    foot: { kicker: 'Free · No commitment · 15 minutes', title: 'Let’s build your<br>next <em>product</em>.' },
    jsonld: { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Durga.design — Freelance Product Design', url: SITE + '/hire/', areaServed: 'Worldwide',
      aggregateRating: { '@type': 'AggregateRating', ratingValue: ((PROFILE.upwork.rating * PROFILE.upwork.reviews + PROFILE.fiverr.rating * PROFILE.fiverr.reviews) / totalReviews).toFixed(2), reviewCount: totalReviews, bestRating: 5 } }
  }));
}

/* ======================================================================
   404 · redirects · sitemap · robots
   ====================================================================== */
emit('404.html', page({ path: '/404', title: 'Page not found', desc: 'This page does not exist.', noindex: true,
  body: `${pageHero({ eyebrow: '404', title: 'This page took a <em>wrong</em> turn.', lead: 'The link may be old or mistyped. Here are the places most people are looking for.',
    actions: btn('Go home', '/', 'primary', 'lg') + btn('See the work', '/work/', 'secondary', 'lg') + btn('Read the blog', '/blog/', 'secondary', 'lg') })}` }));

fs.writeFileSync(path.join(OUT, '_redirects'), [
  '/case-study-vilcart /work/vilcart/ 301',
  '/case-study-eyeontask /work/eyeontask/ 301',
  '/work/ai-insurance /work/ 301',
  '/work/ai-insurance/ /work/ 301',
  '/work/pureblue /work/ 301',
  '/work/pureblue/ /work/ 301',
  `/book-a-call ${CAL} 302`,
  '/blog/category /blog/ 301',
  '/home / 301'
].join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /design-system/\nSitemap: ${SITE}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(r => r !== '/design-system/').map(r => `  <url><loc>${SITE}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${routes.length} pages → ${OUT}`);

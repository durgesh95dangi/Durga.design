// Shared layout + component helpers. Every page on durga.design is rendered through `page()`.
export const SITE = 'https://durga.design';
export const CAL = 'https://cal.com/dpdangi/15min';
export const EMAIL = 'patel95durgesh@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/durgaprasad-ux-designer';
export const X_URL = 'https://x.com/my_durgesh';
export const UPWORK = 'https://www.upwork.com/freelancers/dpdangi';
export const FIVERR = 'https://www.fiverr.com/dpdangi11';
/* One author entity, referenced by @id from every page, so search and AI engines
   connect every article, case study and profile to the same verified person. */
export const PERSON_ID = SITE + '/#person';
export const PERSON = {
  '@type': 'Person', '@id': PERSON_ID, name: 'Durga Prasad', alternateName: ['DurgaPrasad Dangi', 'Durga'],
  jobTitle: 'Senior Product Designer', description: 'Senior product designer with 8+ years designing fintech and B2B SaaS products.',
  url: SITE + '/about/', image: SITE + '/assets/portrait.jpg',
  homeLocation: { '@type': 'Place', name: 'Bengaluru, India' },
  knowsAbout: ['Product design', 'UX design', 'SaaS UX', 'Fintech UX', 'UX audits', 'Design systems', 'Dashboard design', 'SaaS onboarding', 'Conversion rate optimization'],
  sameAs: [LINKEDIN, X_URL, UPWORK, FIVERR]
};
export const personRef = { '@type': 'Person', '@id': PERSON_ID, name: 'Durga Prasad', url: SITE + '/about/' };
export const RESUME = '/durga-prasad-resume.docx'; // source: OneDrive\Desktop\Resume.docx — replace site/durga-prasad-resume.docx to update

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const attr = esc;
const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
export const href = h => h === '/book-a-call' ? CAL : /^\/[^#?]*[^/#?.]$/.test(h) && !/\.\w+$/.test(h) ? h + '/' : h;
/** Wrap the last word (or a given word) of a heading in <em> for the one-accent-word rule. */
export const accent = (text, word) => {
  const t = esc(text);
  if (word) return t.replace(esc(word), `<em>${esc(word)}</em>`);
  return t;
};

const NAV = [
  ['Work', '/work/'], ['Blog', '/blog/'], ['Resources', '/resources/'], ['About', '/about/']
];
const MENU_EXTRA = [['Hire me', '/hire/'], ['Tools', '/tool/'], ['Contact', '/contact/']];
/** Minimal menu used on the homepage only (pass nav: 'minimal' to page()). */
/* Recruiter homepage: in-page anchors only, so a hiring manager never lands on freelance/service pages. */
const NAV_MINIMAL = [['Home', '#top'], ['Work', '#work'], ['About', '#about']];

export function nav(active, variant = 'full', cta = null) {
  const c = cta || { label: 'Book a call', href: CAL };
  const ctaAttrs = c.download ? ' download' : ' target="_blank" rel="noopener"';
  const ctaArrow = c.download ? '↓' : '↗';
  const items = variant === 'minimal' ? NAV_MINIMAL : NAV, menuItems = variant === 'minimal' ? NAV_MINIMAL : [...NAV, ...MENU_EXTRA];
  const link = ([l, h]) => `<li><a class="nav__link${active === h ? ' is-active' : ''}" href="${h}"${active === h ? ' aria-current="page"' : ''}>${l}</a></li>`;
  const mlink = ([l, h]) => `<li><a href="${h}"${active === h ? ' aria-current="page"' : ''}>${l}</a></li>`;
  const landing = variant === 'landing'; // landing pages: logo + one CTA, no menu (one page, one action)
  return `<header class="nav" id="nav">
  <div class="container nav__inner">
    <a href="/" class="nav__logo" aria-label="Durga.design home">Durga<i></i>design</a>
    ${landing ? '<span style="margin-left:auto"></span>' : `<ul class="nav__links">${items.map(link).join('')}</ul>`}
    <a class="btn btn-primary btn-sm nav__cta" href="${c.href}"${ctaAttrs}>${c.label} <span class="arr${c.download ? ' arr--down' : ''}">${ctaArrow}</span></a>
    ${landing ? '' : '<button class="nav__burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span></button>'}
  </div>
</header>
${landing ? '' : `<nav class="menu" id="menu" aria-label="Site">
  <ul>${menuItems.map(mlink).join('')}</ul>
  <a class="btn btn-primary btn-lg" href="${c.href}"${ctaAttrs}>${cta ? c.label : 'Book a 15-min call'} <span class="arr">${ctaArrow}</span></a>
</nav>`}`;
}

export function footer({ kicker = 'Free · No commitment · 15 minutes', title = 'Got a <em>friction</em><br>problem? Let\'s talk.', variant = 'full' } = {}) {
  const col = (h, items) => `<div class="fcol rv"><h4>${h}</h4><ul>${items.map(([l, u]) => `<li><a href="${u}"${ext(u)}>${l}${/^https?:/.test(u) ? ' ↗' : ''}</a></li>`).join('')}</ul></div>`;
  return `<footer class="footer" id="contact">
  <div class="container">
    <p class="footer__kicker rv"><b>✦</b> ${kicker}</p>
    <h2 class="footer__cta rv" style="--i:1">${title}</h2>
    <div class="footer__grid${variant === 'recruiter' || variant === 'landing' ? ' footer__grid--recruiter' : ''}">
      <div class="rv" style="--i:2">
        <div class="mail">
          <a href="mailto:${EMAIL}">${EMAIL}</a>
          <button type="button" data-copy="${EMAIL}" aria-live="polite">Copy</button>
        </div>
        ${variant === 'recruiter'
          ? `<div style="margin-top:var(--sp-6)"><a class="btn btn-accent btn-lg" href="${RESUME}" download>Download resume <span class="arr arr--down">↓</span></a></div>`
          : `<div style="margin-top:var(--sp-6)"><a class="btn btn-accent btn-lg" href="${CAL}" target="_blank" rel="noopener">Book a 15-min call <span class="arr">↗</span></a></div>`}
      </div>
      ${variant === 'landing' ? `
      ${col('On this page', [['How it works', '#how'], ['Packages', '#packages'], ['Case studies', '#cases'], ['FAQ', '#faq']])}
      ${col('Elsewhere', [['LinkedIn', LINKEDIN], ['X (Twitter)', X_URL]])}` : variant === 'recruiter' ? `
      ${col('On this page', [['Selected work', '#work'], ['About me', '#about']])}
      ${col('Elsewhere', [['LinkedIn', LINKEDIN], ['X (Twitter)', X_URL]])}` : `
      ${col('Explore', [['Work', '/work/'], ['About', '/about/'], ['Hire me', '/hire/'], ['Contact', '/contact/']])}
      ${col('Learn', [['Blog', '/blog/'], ['Resources', '/resources/'], ['Free tools', '/tool/'], ['Design system', '/design-system/']])}
      ${col('Elsewhere', [['LinkedIn', LINKEDIN], ['X (Twitter)', X_URL], ['Fiverr', FIVERR]])}`}
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> Durga.design</span>
      <a href="#top">Back to top ↑</a>
    </div>
  </div>
</footer>`;
}

/* ---------- SEO layer ----------
   src/data/seo.json overrides the <title> and meta description per URL (used verbatim).
   Every page also gets BreadcrumbList schema, and FAQPage schema whenever it shows FAQs. */
let SEO = {};
export const setSeo = map => { SEO = map || {}; };
const unesc = s => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
const CRUMB = { work: 'Work', blog: 'Blog', resources: 'Resources', tool: 'Tools' };
function autoLd(path, name, body, ld) {
  const list = ld ? (Array.isArray(ld) ? ld : [ld]) : [];
  const types = JSON.stringify(list);
  const out = [...list];
  if (!/"FAQPage"/.test(types)) {
    const qa = [...body.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><div>([\s\S]*?)<\/div><\/details>/g)];
    if (qa.length) out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qa.map(m => ({ '@type': 'Question', name: unesc(m[1]), acceptedAnswer: { '@type': 'Answer', text: unesc(m[2]) } })) });
  }
  if (!/"BreadcrumbList"/.test(types) && path !== '/' && path.endsWith('/')) {
    const segs = path.split('/').filter(Boolean); const items = [['Home', SITE + '/']]; let acc = '';
    segs.forEach((seg, i) => { acc += '/' + seg; if (seg === 'category') return;
      items.push([i === segs.length - 1 ? name : (CRUMB[seg] || seg), SITE + acc + '/']); });
    out.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, item], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item })) });
  }
  return out.length > 1 ? out : (out[0] || null);
}

export function page({ path, title, desc, body, active, head = '', foot = {}, image = '/assets/portrait.jpg', scripts = '', noindex = false, jsonld = null, nav: navVariant = 'full', navCta = null, article = null, exactTitle = false }) {
  const o = SEO[path];
  if (o) { if (o.title) { title = o.title; exactTitle = true; } if (o.desc) desc = o.desc; }
  const full = exactTitle || title.includes('Durga') ? title : `${title} | Durga.design`;
  jsonld = noindex ? jsonld : autoLd(path, (o && o.crumb) || title.split(/ [|—·:] /)[0], body, jsonld);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${attr(desc)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="${article ? 'article' : 'website'}">
${article ? `<meta property="article:published_time" content="${article.published}">\n<meta property="article:modified_time" content="${article.modified}">\n<meta property="article:author" content="${SITE}/about/">\n<meta property="article:section" content="${attr(article.section)}">\n` : ''}<meta property="og:site_name" content="Durga.design">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:title" content="${attr(full)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:image" content="${SITE}${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@my_durgesh">
<link rel="alternate" type="application/rss+xml" title="Durga.design blog" href="/blog/feed.xml">
<meta name="theme-color" content="#F5F2EE">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="icon" href="/assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/ds.css">
${head}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>
<body>
<div class="scroll-progress" aria-hidden="true"></div>
${nav(active, navVariant, navCta)}
<main id="top">
${body}
</main>
${footer(foot)}
<script src="/assets/js/site.js" defer></script>
${scripts}</body>
</html>
`;
}

/* ---------- components ---------- */
export const btn = (label, h, kind = 'primary', size = '') => `<a class="btn btn-${kind}${size ? ' btn-' + size : ''}" href="${href(h)}"${ext(href(h))}>${esc(label.replace(/\s*[→↗↓]\s*$/, ''))} <span class="arr">${/^#/.test(h) ? '↓' : '↗'}</span></a>`;
export const ctas = (list, first = 'primary', rest = 'secondary', size = 'lg') => list.map((c, i) => btn(c.label, c.href, i ? rest : first, size)).join('\n');

export const crumbs = items => `<nav class="crumbs fade-in" aria-label="Breadcrumb">${items.map(([l, h], i) => i < items.length - 1 ? `<a href="${h}">${esc(l)}</a><span aria-hidden="true">/</span>` : `<span>${esc(l)}</span>`).join('')}</nav>`;

export function pageHero({ crumbs: c, eyebrow, title, lead, actions = '', meta = '', tags = '' }) {
  return `<section class="page-hero">
  <div class="container">
    ${c ? crumbs(c) : ''}
    ${tags ? `<div class="tags fade-in" style="--d:.05s">${tags}</div>` : ''}
    ${eyebrow ? `<p class="t-label eyebrow fade-in" style="--d:.05s">${esc(eyebrow)}</p>` : ''}
    <h1 class="t-h1 page-hero__title fade-in" style="--d:.1s">${title}</h1>
    ${lead ? `<p class="t-lead page-hero__lead fade-in" style="--d:.2s">${esc(lead)}</p>` : ''}
    ${meta ? `<div class="page-hero__meta fade-in" style="--d:.25s;margin-top:var(--sp-6)">${meta}</div>` : ''}
    ${actions ? `<div class="page-hero__actions fade-in" style="--d:.3s">${actions}</div>` : ''}
  </div>
</section>`;
}

export const shead = (eyebrow, title, aside = '') => `<div class="shead">
  <div>${eyebrow ? `<p class="t-label eyebrow rv">${esc(eyebrow)}</p>` : ''}<h2 class="t-h2 rv" style="--i:1">${title}</h2></div>
  ${aside ? `<div class="shead__aside rv" style="--i:2">${aside}</div>` : ''}
</div>`;

export const faq = items => items.length ? `<div class="faq">${items.map(f => `<details class="rv"><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`).join('')}</div>` : '';
export const faqLd = items => items.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : null;

export const list = (items, kind = 'check') => `<ul class="list list--${kind}">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;

export const process = (steps, cols) => `<div class="process" style="--cols:${cols || Math.min(steps.length, 4)}">${steps.map((s, i) => `<div class="process__step rv" style="--i:${i}"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('')}</div>`;

export const split = (eyebrow, title, content, note = '', id = '') => `<div class="split"${id ? ` id="${id}"` : ''}>
  <div class="split__head"><p class="cs-section__k rv">${esc(eyebrow)}</p><h2 class="t-h3 rv">${title}</h2>${note ? `<p class="rv">${esc(note)}</p>` : ''}</div>
  <div class="rv" style="--i:1">${content}</div>
</div>`;

export const statGrid = stats => `<div class="stat-grid rv">${stats.map(s => {
  const v = esc(s.value).replace(/^(.+?)\s*→\s*(.+)$/, '<span class="from">$1</span> → <span class="to">$2</span>');
  return `<div class="stat-cell"><div class="stat-cell__value">${v}</div><div class="t-caption">${esc(s.label)}</div></div>`;
}).join('')}</div>`;

export const card = ({ href: h, media, mediaAlt = '', kicker = '', title, text = '', foot = 'Read', tags = '', icon = '' }) => `<a class="card rv" href="${h}"${tags ? ` data-tags="${tags}"` : ''}${ext(h)}>
  ${media ? `<div class="card__media"><img src="${media}" alt="${attr(mediaAlt)}" loading="lazy"></div>` : ''}
  <div class="card__body">
    ${icon ? `<span class="card__icon" aria-hidden="true">${icon}</span>` : ''}
    ${kicker ? `<p class="card__kicker">${kicker}</p>` : ''}
    <h3 class="card__title">${esc(title)}</h3>
    ${text ? `<p class="card__text">${esc(text)}</p>` : ''}
    <div class="card__foot"><span>${foot}</span><span class="go" aria-hidden="true">↗</span></div>
  </div>
</a>`;

export const quoteCard = q => `<figure class="quote-card rv"><blockquote>${esc(q.text)}</blockquote><figcaption>${q.img ? `<img src="${q.img}" alt="" loading="lazy">` : ''}<div><b>${esc(q.name)}</b><span>${esc(q.role || '')}</span></div></figcaption></figure>`;

/* Client logo slider — one source for every page (homepage, work page …). Slides left → right, pauses on hover. */
const CLIENTS = [
  { name: 'Vestas' }, { name: 'Dhani', img: '/assets/logo-dhani.png' }, { name: 'Indiabulls', img: '/assets/logo-indiabulls.svg' },
  { name: 'EyeOnTask', img: '/assets/logo-eyeontask.png' }, { name: 'Vilcart', img: '/assets/logo-vilcart.png' },
  { name: 'Spark Diagnostics', img: '/assets/logo-spark.png' }, { name: 'Mums & Co', img: '/assets/logo-mums.png' }, { name: 'Nepali Vivaah' }
];
export const logoSlider = (label = 'Trusted by teams at') => {
  const item = (c, hidden) => c.img
    ? `<img src="${c.img}" alt="${hidden ? '' : esc(c.name)}"${hidden ? ' aria-hidden="true"' : ''} loading="lazy">`
    : `<span class="wordmark"${hidden ? ' aria-hidden="true"' : ''}>${esc(c.name)}</span>`;
  return `<div class="logos rv">
  <span class="logos__label">${esc(label)}</span>
  <div class="marquee marquee--ltr">
    <div class="marquee__track">${CLIENTS.map(c => item(c, false)).join('')}${CLIENTS.map(c => item(c, true)).join('')}</div>
  </div>
</div>`;
};

export const TESTIMONIALS = [
  { name: 'Christopher Rex', role: 'Chief AI Officer, AND Capital · via Upwork', img: '/assets/media/assets/img/avatar-christopher.jpg', text: 'What made Durga invaluable was speed. Many tasks turned around in a day or two. We built a design-to-dev pipeline around him with our frontend dev, and it just worked.' },
  { name: 'Abhay Patidar', role: 'Founder, Famebro Studio · via Fiverr', img: '/assets/media/assets/img/avatar-abhay.jpg', text: 'Fantastic experience working with this UI/UX designer! They created a sleek, user-friendly mobile app design that exceeded our expectations. Every detail was thoughtfully crafted, and the flow is seamless.' },
  { name: 'Sonali', role: 'Founder, Mums & Co · via Upwork', img: '/assets/media/assets/img/avatar-sonali-2.png', text: 'One of those designers you actually enjoy working with. Hit every deadline, never dropped the quality bar. Highly recommend to any US team.' }
];

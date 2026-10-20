# durga.design

Portfolio site for Durga Prasad, senior product designer. Live at **https://durga.design** (Cloudflare Pages).

A small static-site generator: content lives in `src/`, templates in `build/`, and everything renders into `site/`, which is what gets deployed.

## Structure

```
build/
  build.mjs        page templates for every page type (home, work, services, blog, tools…)
  lib.mjs          shared layout: nav, footer, components, site constants (email, socials, resume)
  check.mjs        verifies every internal link and image resolves
  content/         long-form content that needs custom markup (e.g. Vilcart case study)
src/
  data/*.json      content: case studies, services, expertise, blog posts, resources, tools
  pages/*.html     hand-built pages (homepage, EyeOnTask case study, design system)
site/              build output + static assets (deployed as-is)
  assets/css/ds.css   the design system — tokens, components, patterns (one stylesheet for every page)
  assets/js/site.js   shared interactions (reveal, menu, checklists, copy…)
  assets/js/tools.js  the 14 browser design tools
  design-system/      living reference of the design system (/design-system/)
```

## Commands

```bash
npm run build    # render all pages into site/
npm run check    # fail on any broken internal link or image
npm run deploy   # build + check + deploy to Cloudflare Pages (project: durga-design)
```

Deploying needs `wrangler` logged in to the Cloudflare account (`npx wrangler login`).

## Rules of the design system

- Light canvas on every page; dark only as a band inside a page.
- Zero border-radius. Hard offset shadows, never blurred.
- DM Serif Display for headings, Plus Jakarta Sans for everything else.
- Accent blue for actions, active states and one emphasis word per heading.
- Spacing from the 8px token scale only.

See `/design-system/` on the live site for tokens, components and button states.

## Audiences

- `/` — recruiter / full-time homepage. No freelance, service or pricing links.
- `/hire/` — freelance profile with platform reviews.

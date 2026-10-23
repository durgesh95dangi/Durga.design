# SEO + AEO for the site pages

What's done in the code, and what's left for Durga. All page titles and descriptions now live in one file, `src/data/seo.json`, so changing one is a one-line edit.

## What changed on every page
- **Breadcrumb schema** on every page except the homepage, so Google and AI tools understand where each page sits.
- **FAQ schema added automatically** to every page that shows FAQs (hire, ux-audit, subscription, saas-activation, contact, resources, tools, blog posts).
- **One author entity** (Durga Prasad, with LinkedIn, X, Upwork and Fiverr) linked from articles, case studies, services and tools.
- **Empty blog categories** (AI UX, Design Systems, UX Research) are set to noindex and left out of the sitemap until they have posts. Thin, empty pages can drag down how Google sees the whole site.

## Page by page
### /
- **Title tag:** Durga Prasad — Senior Product Designer, Fintech & B2B SaaS (58 chars)
- **Meta description:** Senior product designer with 8+ years in fintech and B2B SaaS. Case studies from Dhani (50M+ users), EyeOnTask and Vilcart. Open to senior roles. (145 chars)
- **Schema:** WebSite, Person

### /about/
- **Title tag:** About Durga Prasad — Product Designer, 8+ Years (47 chars)
- **Meta description:** Durga Prasad is a senior product designer in Bengaluru with 8+ years designing fintech and B2B SaaS. Background, how I work, and who I've worked with. (150 chars)
- **Schema:** ProfilePage, BreadcrumbList

### /work/
- **Title tag:** Product Design Case Studies: Fintech & B2B SaaS | Durga (55 chars)
- **Meta description:** Case studies from Dhani (50M+ user bill payments), EyeOnTask (field service SaaS) and Vilcart (rural B2B e-commerce): the problem, decisions and results. (153 chars)
- **Schema:** CollectionPage, BreadcrumbList

### /work/dhani/
- **Title tag:** Dhani Case Study: Bill Payments for 50M+ Users | Durga (54 chars)
- **Meta description:** How a high-friction bill payment funnel became a 2-tap checkout for Dhani, one of India's largest consumer fintech and neobanking platforms. (140 chars)
- **Schema:** Article, BreadcrumbList

### /work/eyeontask/
- **Title tag:** EyeOnTask Case Study: Field Service SaaS Redesign | Durga (57 chars)
- **Meta description:** Redesigning the dispatcher dashboard and field worker app for EyeOnTask, a field service platform used by 1,000+ companies across 26 countries. (143 chars)
- **Schema:** Article, BreadcrumbList

### /work/vilcart/
- **Title tag:** Vilcart Case Study: Rural B2B E-Commerce App | Durga (52 chars)
- **Meta description:** Designing a rural-first shopping and restocking app for kirana store owners in tier-3 villages across South India. Research, decisions and results. (147 chars)
- **Schema:** Article, BreadcrumbList

### /hire/
- **Title tag:** Hire a Freelance Product Designer for SaaS & Fintech (52 chars)
- **Meta description:** Freelance senior product designer for fintech and B2B SaaS. Rated 4.7★ on Upwork (30 reviews) and 5.0★ on Fiverr (47 reviews), 8+ years of experience. (150 chars)
- **Schema:** ProfessionalService, FAQPage, BreadcrumbList

### /ux-audit/
- **Title tag:** SaaS & Fintech UX Audit: $499, Delivered in 36 Hours (52 chars)
- **Meta description:** A $499 UX audit for SaaS and fintech products: a screen-by-screen video teardown, Figma fixes for your top friction points and a prioritized dev roadmap. (153 chars)
- **Schema:** Service, FAQPage, BreadcrumbList

### /subscription/
- **Title tag:** UX/UI Design Subscription for SaaS — From $999/mo (49 chars)
- **Meta description:** A senior product designer on a monthly plan: unlimited requests worked one at a time, fast turnarounds, pause or cancel anytime. From $999 a month. (147 chars)
- **Schema:** Service, FAQPage, BreadcrumbList

### /saas-activation/
- **Title tag:** SaaS Activation Sprint: Turn Trial Signups into Users (53 chars)
- **Meta description:** Onboarding redesign for B2B SaaS teams, seed to Series A. Free activation teardown, $499 Audit, 3-week Activation Sprint, or a monthly retainer. (144 chars)
- **Schema:** Service, FAQPage, BreadcrumbList

### /contact/
- **Title tag:** Contact Durga Prasad — Book a 15-Minute Call (44 chars)
- **Meta description:** Book a free 15-minute call, order a $499 UX audit, or ask about a monthly design partnership. Email replies within 12 hours. (124 chars)
- **Schema:** ContactPage, FAQPage, BreadcrumbList

### /blog/
- **Title tag:** SaaS & Fintech UX Blog by Durga Prasad (38 chars)
- **Meta description:** Practical UX advice for SaaS and fintech teams: onboarding, dashboards, pricing pages, microcopy and trust, from a product designer with 8+ years. (146 chars)
- **Schema:** Blog, BreadcrumbList

### /resources/
- **Title tag:** Free UX Checklists & Audit Templates for SaaS | Durga (53 chars)
- **Meta description:** Free UX checklists, a heuristic audit scorecard, a dashboard usability checklist and a design token guide for SaaS and fintech teams. (133 chars)
- **Schema:** CollectionPage, BreadcrumbList

### /tool/
- **Title tag:** Free Browser Design Tools | Color, Type, CSS · Durga.design (59 chars)
- **Meta description:** Fourteen free design tools that run in your browser: WCAG contrast, type scale, CSS Grid, flexbox, shadows, gradients, and more. No account. Nothing uploaded. (158 chars)
- **Schema:** CollectionPage, BreadcrumbList

Tool pages (14) now carry WebApplication schema (free, runs in the browser) plus their FAQ schema. Resource pages (4) carry CreativeWork schema.

## Content upgrades (done Oct 23, using the About page as the source of truth)
- **Homepage:** added a plain "who I am" paragraph in the About section: name, Bengaluru, 8+ years, Dhani flows for 10M+ users, EyeOnTask churn 28% → 13%, available for freelance and contract work.
- **Case studies:** "Results at a glance" label above the numbers on Dhani and EyeOnTask, plus "My role" and "Years" in the details panel (Dhani: Lead Product Designer, 2022–2024; EyeOnTask and Vilcart: 2020–2022). Vilcart's numbers are targets, not results, so that strip is labelled "Project targets".
- **UX audit page:** 5 new FAQs (what's included, how long it takes, money-back guarantee, audit vs usability testing, who it's for). These come from facts already on the page.

## Conflicts still on the site (Durga to decide)
- **Dhani users:** the About page says 10M+. The Dhani case study and the homepage work section say 50M+.
- **EyeOnTask duration:** the case study page says 18 months; the case study data (cards and schema) says 3 months.
- **Vilcart duration:** the story says 3 months; the data says 2 months. Vilcart's real results (4.5★, 85% repeat orders) are in the data but the page shows targets.
- **Résumé vs About page:** different titles and dates for Dhani and EyeOnTask, and the résumé lists Smartborn and Capgemini. Update the résumé so recruiters see one story.
- **Homepage positioning:** the hero badge says "Open to senior product design roles", while the new paragraph says "available for freelance and contract work". Pick one or keep both on purpose.
- The About page stats ($45M+ client capital raised, 2.4x average conversion lift, 30+ platforms) are kept as confirmed by Durga. Keep proof handy, because recruiters and clients may ask.

## After deploying
1. Google Search Console: submit `https://durga.design/sitemap.xml`. Then use URL Inspection → Request indexing on the homepage, /hire/, /ux-audit/ and /saas-activation/.
2. Bing Webmaster Tools: import the site from Search Console and submit the sitemap. Bing powers part of ChatGPT search and Copilot.
3. Search Console → Generative AI performance report (if your account has it): check monthly which pages appear in AI Overviews and AI Mode.
4. Monthly AI check: ask ChatGPT, Perplexity, Gemini and Google AI Mode "Who is a good freelance product designer for fintech SaaS?" and "What does a SaaS UX audit include?". Note whether you're mentioned.

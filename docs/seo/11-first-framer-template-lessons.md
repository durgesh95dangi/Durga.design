# I Built My First Framer Template. Here's Everything Nobody Tells You

- **SEO title tag:** My First Framer Template: Lessons From Idea to Marketplace (58 characters)
- **Meta description:** From the first idea to Framer Marketplace review, launch and v1.1: what building my first Framer template taught me after 7+ years in product design. (149 characters)
- **URL slug:** `/blog/first-framer-template-lessons/` (new post; keep this URL once it is live)
- **Status:** Added to the site code on 2026-10-29. Goes public on the next deploy. 6 of your 7 images used (hero + 5 in the article).

---

## Article

*The full journey of my first Framer template, from the first idea to Marketplace review, launch and v1.1.*

**Quick answer:** Building a Framer template is closer to shipping a product than designing a website. What Callback taught me: build editable sections as components with props, test at in-between screen widths, make everything that looks clickable work, ask someone else to click through before you submit, and plan v1.1 before you ship v1.

**Key takeaways**
- Build everything editable as components with props from day one.
- Test at in-between screen widths, not just the three breakpoints.
- If it looks clickable, make it work.
- Treat the first release as v1, not the final version.

I recently published my first template on the Framer Marketplace. It's called Callback, a free portfolio template for product designers.

I've designed products for more than seven years: fintech apps, field service tools, enterprise dashboards. I assumed a template would be a weekend project. It turned into a crash course in planning, building for strangers, getting reviewed, launching and updating a real product.

Here's the whole journey, from the first idea to v1.1, including the basic UX mistake I made in my own product.

## Why I built a template at all

I've built plenty of websites in Framer, mostly for myself and for clients. Making a template felt like the natural next step. Take what I know about how product designers get hired and turn it into something other designers can use.

The idea behind Callback was simple. Most portfolio templates I tried were built to look impressive. But when I've reviewed portfolios, I wasn't looking for big visuals. I wanted to see the problem, the designer's role and what changed after launch, fast.

So Callback puts case studies first: a headline result, a few real numbers, a short problem statement and the process in four clear steps. I thought it would take a weekend. It didn't.

## Planning: one page for every question a hiring manager asks

Before opening Framer, I listed what a hiring manager wants from a product designer's portfolio. Then I turned each need into a page.

- **Home:** who you are, a few key numbers and your best work up front.
- **Work:** every project in one place.
- **Case studies:** the problem, your role, the results and the process.
- **About and Resume:** your experience in a format people can scan. I added a full resume page because a PDF attachment often never gets opened.
- **Contact:** a form that actually sends.
- **The pages people forget:** a Licensing page, a custom 404 and a thank-you page after the form.

That came to nine pages at launch, each designed for desktop, tablet and phone.

![Callback's experience section listing four roles with industry tags and dates](https://durga.design/assets/media/images/blog/callback/callback-experience.webp)

## Content: making it feel real

A template full of lorem ipsum doesn't sell the idea. People need to picture their own work inside it.

So I invented a designer, Mara Ellis, and four fictional companies: Crewdock (field service SaaS), Ledgerline (fintech), Tendwell (healthcare) and Parcelry (logistics). Each one got a believable problem and believable results, so the work reads like a real portfolio.

For visuals I used AI-generated placeholder images, Inter Display for type and Phosphor icons. I listed every asset and its licence on the Licensing page, so nobody has to wonder what they're allowed to keep.

![Callback's Licensing page listing fonts, images, brand marks, icons and copy](https://durga.design/assets/media/images/blog/callback/callback-licensing.webp)

## Building: designing for strangers is a different job

When I build a site for myself, I know where everything lives. I know which layer to click and which frame holds what.

A template is used by someone who has never seen my layers panel. They want to change a title, swap an image and move on. If editing one line breaks the layout, they'll close the tab.

So I rebuilt most sections as components with clear props: title, description, image, link, a few metrics. Now someone can update a project card from the right panel without touching the structure underneath. That took longer than designing the pages themselves. It's also the part I'm proudest of, because nobody sees it until they need it.

![Callback's Work page with four project cards across SaaS, fintech, health and logistics](https://durga.design/assets/media/images/blog/callback/callback-work.webp)

## Testing: responsive isn't done until someone else checks it

I tested desktop, tablet and phone. Everything looked fine, so I submitted it.

The Framer review came back with layout issues at sizes I hadn't checked. Not the three breakpoints, but the widths in between, where real screens actually live.

Now I check every update at 320, 390, 768, 1024 and 1440 pixels. I also check one simple thing on each page: does anything make the page scroll sideways? If it does, it's broken, no matter how good it looks at my own screen size.

## Review: the card that didn't click

Submitting to the Marketplace means preparing listing images, a description and a live preview, then waiting for Framer's team to review it. Their feedback was specific and useful, and one note stuck with me.

My Work page had four project cards. Only the first one opened a full case study. In my head, the other three were placeholders. In a visitor's head, they were broken buttons.

The Framer team put it simply: make all the cards work, or make it clear which ones are interactive.

They were right, and it's the kind of thing I'd flag in anyone else's product within a minute. When you're close to your own work, you see what you meant to build, not what's actually on the screen.

I didn't hide the cards. I wrote a short case study for every project, linked every card, and added a clear "Read case study" link to each one. I also linked each case study to the next, so readers can move through the whole portfolio instead of hitting a dead end.

![Callback's case study layout with team quotes and key results](https://durga.design/assets/media/images/blog/callback/callback-case-study.webp)

## Polishing: small details decide whether it feels finished

A subtle shadow on the cards. Consistent spacing between sections. A proper title and description on every page for search. None of these show up in a feature list.

But they're the difference between a template that feels finished and one that feels almost done. People notice "almost done" even when they can't say why.

The listing images got the same treatment. They're the first thing people see in the Marketplace, long before they open the preview, so I redid them to show the real pages clearly.

![Callback's custom 404 page with links back home and to the work](https://durga.design/assets/media/images/blog/callback/callback-404.webp)

## Launching: sharing without spamming

Going live on the Marketplace doesn't bring visitors by itself. So I started sharing Callback in places designers already hang out: X, LinkedIn, Reddit, Quora, Discord and the Framer community.

I tried to write about what I learned rather than just announce a product. Every community has its own rules about links, so I read them first and kept to one link per post. The most valuable thing sharing brought back was feedback.

## Updating: shipping is the start, not the finish

After launch, I kept working on it. I updated the listing images, fixed what the review found, added the missing case studies and started a changelog on the Licensing page.

A template is a product. It has users, it gets feedback and it needs updates. Treating the first release as v1 rather than the final version made it much better.

## Should you build one?

If you're a designer who already works in Framer, I'd say yes. Even if it never earns a rupee, you'll learn more about your own design habits than from any client project. You stop designing for yourself and start designing for people you'll never meet.

If you haven't tried Framer yet, it's a good place to start. You design visually, publish with one click, and it handles responsive layouts, CMS and hosting for you. You can [try Framer here](https://framer.link/LUxnij6) and build your first site on the free plan.

A few things I'd tell myself before starting:

1. Build everything editable as components with props from day one.
2. Test at in-between screen widths, not just the three breakpoints.
3. If it looks clickable, make it work.
4. Ask someone else to click through it before you submit.
5. Plan for v1.1 before you ship v1.

## What I'd do differently

Honestly, not much in the design. The biggest change would be my process: ask for feedback earlier and click through my own work as if I'd never seen it.

The most useful lesson from my first template had nothing to do with Framer. Even after years of design, my own blind spots are the hardest ones to see. Someone else's eyes will find them in minutes.

If you want to see how Callback turned out, the live preview is at [callback-portfolio.framer.website](https://callback-portfolio.framer.website). And if you're building your first template, I'd love to hear what surprised you.

Note: the Framer link above is a referral link. If you sign up through it, I may earn a small reward at no extra cost to you.

## FAQ

**What pages should a product designer portfolio template include?**
Home, Work, case studies, About and a resume page people can scan, and a contact form that actually sends. Don't forget a Licensing page, a custom 404 and a thank-you page after the form.

**How should you test a Framer template before submitting it?**
Check every page at 320, 390, 768, 1024 and 1440 pixels wide, not only the three breakpoints, and make sure nothing makes the page scroll sideways. Then ask someone else to click through it.

**What did the Framer Marketplace review flag in Callback?**
Only the first of four project cards opened a case study, so the other three looked like broken buttons. The fix was to write a case study for every project, link every card and add a clear "Read case study" link.

---

## SEO + AEO instructions

### Post details
- **Primary keyword:** first Framer template
- **Secondary keywords:** Framer Marketplace review, how to make a Framer template, product designer portfolio template, Framer portfolio template, Framer template tips
- **Category:** Framer
- **Tags:** Framer, Templates, Portfolio, Product design
- **Questions this post should answer in AI tools and Google:**
  - Should you build one?
  - What pages should a product designer portfolio template include?
  - How should you test a Framer template before submitting it?
  - What did the Framer Marketplace review flag in Callback?

Keyword volumes aren't checked here. Confirm in Google Search Console (Performance → Queries) once the post has a few weeks of data.

### Steps for the website (plain words)
1. Placeholders: all filled in or removed.

2. Images: done. The images are in `site/assets/media/images/blog/callback/` and placed in the article with alt text.
3. Already promoted.
4. Run `npm run build` and `npm run check`, then deploy (`npm run deploy`, or push to GitHub and let the daily job deploy).

The title tag, meta description, canonical link, Open Graph tags, schema, sitemap, RSS feed and llms.txt are all generated automatically. You don't paste anything by hand.

### Head tags (generated automatically, shown for reference)
```html
<title>My First Framer Template: Lessons From Idea to Marketplace</title>
<meta name="description" content="From the first idea to Framer Marketplace review, launch and v1.1: what building my first Framer template taught me after 7+ years in product design.">
<link rel="canonical" href="https://durga.design/blog/first-framer-template-lessons/">
<meta property="og:type" content="article">
<meta property="og:title" content="My First Framer Template: Lessons From Idea to Marketplace">
<meta property="og:description" content="From the first idea to Framer Marketplace review, launch and v1.1: what building my first Framer template taught me after 7+ years in product design.">
<meta property="og:image" content="https://durga.design/assets/media/images/blog/callback/callback-portfolio.jpg">
<meta property="article:published_time" content="2026-10-29">
<meta property="article:author" content="https://durga.design/about/">
<meta name="twitter:card" content="summary_large_image">
```

### JSON-LD (generated automatically, shown for reference)
```json
[
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "I Built My First Framer Template. Here's Everything Nobody Tells You",
    "description": "From the first idea to Framer Marketplace review, launch and v1.1: what building my first Framer template taught me after 7+ years in product design.",
    "image": "https://durga.design/assets/media/images/blog/callback/callback-portfolio.jpg",
    "datePublished": "2026-10-29",
    "dateModified": "2026-10-29",
    "author": {
      "@type": "Person",
      "@id": "https://durga.design/#person",
      "name": "Durga Prasad",
      "url": "https://durga.design/about/"
    },
    "mainEntityOfPage": "https://durga.design/blog/first-framer-template-lessons/",
    "keywords": "first Framer template, Framer Marketplace review, how to make a Framer template, product designer portfolio template, Framer portfolio template, Framer template tips"
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What pages should a product designer portfolio template include?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Home, Work, case studies, About and a resume page people can scan, and a contact form that actually sends. Don't forget a Licensing page, a custom 404 and a thank-you page after the form."
        }
      },
      {
        "@type": "Question",
        "name": "How should you test a Framer template before submitting it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check every page at 320, 390, 768, 1024 and 1440 pixels wide, not only the three breakpoints, and make sure nothing makes the page scroll sideways. Then ask someone else to click through it."
        }
      },
      {
        "@type": "Question",
        "name": "What did the Framer Marketplace review flag in Callback?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Only the first of four project cards opened a case study, so the other three looked like broken buttons. The fix was to write a case study for every project, link every card and add a clear \"Read case study\" link."
        }
      }
    ]
  }
]
```
The build also adds BreadcrumbList schema, and the visible "Updated" date and author box.

### What you do by hand
- Optional: send Claude more real examples or numbers later. First-hand experience is what Google and AI tools reward most.
- After it's live: in Google Search Console, use URL Inspection → Request indexing for `https://durga.design/blog/first-framer-template-lessons/`. In Bing Webmaster Tools, use URL Submission.
- Share it where designers already are: the Framer community, r/framer, r/UXDesign and design Discord groups, one link per post and only where the rules allow.

### Post-publish check
1. Open https://durga.design/blog/first-framer-template-lessons/: the new H1, the "Updated" date and the author box are visible, and there are no [ADD] markers.
2. Right-click → View page source: the `<title>` matches the SEO title, and there's a `application/ld+json` block.
3. Paste the URL into Google's Rich Results Test (search.google.com/test/rich-results): no errors.
4. Search Console → URL Inspection says "URL is on Google" within a few days.
5. After 2–4 weeks, ask ChatGPT (with search on), Perplexity, Gemini and Google AI Mode: "Should you build one?". Note whether durga.design is cited.
6. In analytics, look for visits with `utm_source=chatgpt.com` and referrers from perplexity.ai and gemini.google.com.

# Generates one SEO + AEO doc per blog draft from src/data/blog-drafts.json.
import json,re,os,html as H
SITE='https://durga.design'
drafts=json.load(open('src/data/blog-drafts.json',encoding='utf-8'))
_live=[x for x in json.load(open('src/data/blog.json',encoding='utf-8')) if 'keywords' in x]
_order=['why-users-churn-during-saas-onboarding','pretty-design-trap-saas-dashboard-retention','saas-pricing-page-ux-psychology','fintech-ux-design-trust-patterns','reduce-cognitive-overload-b2b-saas','anatomy-of-high-converting-saas-landing-page','what-a-saas-ux-audit-actually-uncovers','mobile-ux-for-b2b-saas-hidden-traffic','saas-microcopy-that-increases-conversions','consumer-grade-enterprise-software-design']
_ds={x['slug'] for x in drafts}
drafts=sorted(drafts+[x for x in _live if x['slug'] not in _ds],key=lambda x:_order.index(x['slug']) if x['slug'] in _order else 99)
LIVE={x['slug'] for x in _live}-_ds
promo=['Day 1 (Oct 24)','Day 2 (Oct 25)','Day 3 (Oct 26)','Day 4 (Oct 27)','Day 5 (Oct 28)','Day 6 (Oct 29)','Day 7 (Oct 30)','Day 8 (Oct 31)','Day 9 (Nov 1)','Day 10 (Nov 2)']
def md(body):
    t=body
    t=re.sub(r'<!--\s*IMAGE:\s*(.*?)\s*\|\s*ALT:\s*(.*?)\s*-->',lambda m:f'\n> **Here you can add this kind of image:** {m.group(1)}. **Alt text:** {m.group(2)}\n',t)
    t=re.sub(r'<figure[^>]*><img src="([^"]+)" alt="([^"]*)"[^>]*><figcaption>.*?</figcaption></figure>',lambda m:f'\n![{H.unescape(m.group(2))}]({SITE}{m.group(1)})\n',t)
    t=re.sub(r'<a href="(/[^"]*)">(.*?)</a>',lambda m:f'[{m.group(2)}]({SITE}{m.group(1)})',t)
    t=re.sub(r'<a href="(https?://[^"]*)"[^>]*>(.*?)</a>',r'[\2](\1)',t)
    t=re.sub(r'<strong>(.*?)</strong>',r'**\1**',t)
    t=re.sub(r'<h2>(.*?)</h2>',r'\n## \1\n',t); t=re.sub(r'<h3>(.*?)</h3>',r'\n### \1\n',t)
    def ol(m):
        items=re.findall(r'<li>(.*?)</li>',m.group(1),re.S); return '\n'+'\n'.join(f'{i+1}. {x}' for i,x in enumerate(items))+'\n'
    t=re.sub(r'<ol>(.*?)</ol>',ol,t,flags=re.S)
    t=re.sub(r'<ul>(.*?)</ul>',lambda m:'\n'+'\n'.join('- '+x for x in re.findall(r'<li>(.*?)</li>',m.group(1),re.S))+'\n',t,flags=re.S)
    t=re.sub(r'<p>(.*?)</p>',r'\n\1\n',t,flags=re.S)
    t=re.sub(r'<[^>]+>','',t); t=H.unescape(t)
    return re.sub(r'\n{3,}','\n\n',t).strip()
for n,d in enumerate(drafts,1):
    url=f"{SITE}/blog/{d['slug']}/"; adds=re.findall(r'\[ADD:[^\]]*\]',json.dumps(d,ensure_ascii=False))
    qs=re.findall(r'<h2>([^<]*\?)</h2>',d['body'])+[f['q'] for f in d['faqs']]
    ld=[{"@context":"https://schema.org","@type":"BlogPosting","headline":d['title'],"description":d['desc'],"image":SITE+d['hero'],"datePublished":d['published'],"dateModified":d['updated'],"author":{"@type":"Person","@id":SITE+"/#person","name":"Durga Prasad","url":SITE+"/about/"},"mainEntityOfPage":url,"keywords":", ".join([d['keywords']['primary']]+d['keywords']['secondary'])},
        {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":f['q'],"acceptedAnswer":{"@type":"Answer","text":f['a']}} for f in d['faqs']]}]
    out=f"""# {d['title']}

- **SEO title tag:** {d['seoTitle']} ({len(d['seoTitle'])} characters)
- **Meta description:** {d['desc']} ({len(d['desc'])} characters)
- **URL slug:** `/blog/{d['slug']}/` (already live and indexed, so the URL stays the same)
- **Status:** {'Live in the site code (promoted ' + d['updated'] + '). Goes public on the next deploy. Images added (2 illustrations).' if d['slug'] in LIVE else "Draft. The live post doesn't change until every [ADD] below is filled in and the draft is promoted."}

---

## Article

*{d['lead']}*

**Quick answer:** {d['quickAnswer']}

**Key takeaways**
""" + '\n'.join('- '+t for t in d['takeaways']) + f"""

{md(d['body'])}

## FAQ

""" + '\n\n'.join(f"**{f['q']}**\n{f['a']}" for f in d['faqs']) + f"""

---

## SEO + AEO instructions

### Post details
- **Primary keyword:** {d['keywords']['primary']}
- **Secondary keywords:** {', '.join(d['keywords']['secondary'])}
- **Category:** {d['categoryLabel']}
- **Tags:** {', '.join(d['tags'])}
- **Questions this post should answer in AI tools and Google:**
""" + '\n'.join('  - '+q for q in qs) + f"""

Keyword volumes aren't checked here. Confirm in Google Search Console (Performance → Queries) once the post has a few weeks of data.

### Steps for the website (plain words)
1. Placeholders: {'all filled in or removed.' if not adds else 'replace each one with a real example or number from your own work:'}
""" + '\n'.join('   - '+a for a in adds) + f"""
2. Images: {'done. Both illustrations are in `site/assets/media/images/blog/inline/` and placed in the article with alt text.' if '<figure' in d['body'] else 'save each image in `site/assets/media/images/blog/`, then ask Claude to add them. The image notes above say what to show and give the alt text.'}
3. {'Already promoted.' if d['slug'] in LIVE else 'Promote the draft: run `npm run promote -- ' + d['slug'] + '`, or ask Claude to "promote ' + d['slug'] + '". It refuses while any [ADD] is left.'}
4. Run `npm run build` and `npm run check`, then deploy (`npm run deploy`, or push to GitHub and let the daily job deploy).

The title tag, meta description, canonical link, Open Graph tags, schema, sitemap, RSS feed and llms.txt are all generated automatically. You don't paste anything by hand.

### Head tags (generated automatically, shown for reference)
```html
<title>{H.escape(d['seoTitle'])}</title>
<meta name="description" content="{H.escape(d['desc'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{H.escape(d['seoTitle'])}">
<meta property="og:description" content="{H.escape(d['desc'])}">
<meta property="og:image" content="{SITE}{d['hero']}">
<meta property="article:published_time" content="{d['published']}">
<meta property="article:author" content="{SITE}/about/">
<meta name="twitter:card" content="summary_large_image">
```

### JSON-LD (generated automatically, shown for reference)
```json
{json.dumps(ld,indent=2,ensure_ascii=False)}
```
The build also adds BreadcrumbList schema, and the visible "Updated" date and author box.

### What you do by hand
- {'Optional: send Claude more real examples or numbers later. First-hand experience is what Google and AI tools reward most.' if not adds else 'Fill in the ' + str(len(adds)) + ' placeholder(s) with real details. This first-hand experience is what Google and AI tools reward most.'}
- After it's live: in Google Search Console, use URL Inspection → Request indexing for `{url}`. In Bing Webmaster Tools, use URL Submission.
- Share it using {promo[n-1]} of the 10-day promotion plan.

### Post-publish check
1. Open {url}: the new H1, the "Updated" date and the author box are visible, and there are no [ADD] markers.
2. Right-click → View page source: the `<title>` matches the SEO title, and there's a `application/ld+json` block.
3. Paste the URL into Google's Rich Results Test (search.google.com/test/rich-results): no errors.
4. Search Console → URL Inspection says "URL is on Google" within a few days.
5. After 2–4 weeks, ask ChatGPT (with search on), Perplexity, Gemini and Google AI Mode: "{qs[0] if qs else d['title']}". Note whether durga.design is cited.
6. In analytics, look for visits with `utm_source=chatgpt.com` and referrers from perplexity.ai and gemini.google.com.
"""
    open(f'docs/seo/{n:02d}-{d["slug"]}.md','w',encoding='utf-8').write(out)
print('docs',len(drafts))

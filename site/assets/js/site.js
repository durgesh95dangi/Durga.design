/* Durga.design — shared interactions. Every behaviour is opt-in by markup:
   .nav#nav              scrolled / hide-on-scroll
   .scroll-progress      reading progress bar
   .nav__link[href^="#"] / .cs-toc a   active section tracking
   .rv                   reveal on scroll   (stagger with style="--i:n")
   [data-count]          count-up number    (keeps a <sup> suffix)
   [data-reveal-img]     zoom-out image on reveal`n   [data-magnetic]       magnetic hover
   [data-copy="text"]    copy-to-clipboard button
   [data-clock]          live IST clock
   [data-year]           current year
*/
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Nav + progress
  const nav = $('#nav'), bar = $('.scroll-progress');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      nav.classList.toggle('is-hidden', y > 400 && y > lastY);
    }
    lastY = y;
    if (bar) {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Active section tracking for in-page nav links and case study index
  const trackers = $$('.nav__link[href^="#"], .cs-toc a[href^="#"]');
  const targets = [...new Set(trackers.map(a => a.getAttribute('href').slice(1)))].map(id => document.getElementById(id)).filter(Boolean);
  if (targets.length) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) trackers.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(t => so.observe(t));
  }

  // Count-up
  const count = el => {
    const end = +el.dataset.count, sup = el.querySelector('sup')?.outerHTML || '';
    if (reduce) { el.innerHTML = end + sup; return; }
    const t0 = performance.now(), d = 1200;
    const tick = t => {
      const p = Math.min((t - t0) / d, 1);
      el.innerHTML = Math.round(end * (1 - Math.pow(1 - p, 3))) + sup;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    if (e.target.matches('[data-count]')) count(e.target);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$('.rv, [data-reveal-img]').forEach(el => io.observe(el));

  // Magnetic
  if (!reduce && hover) {
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * .15}px ${(e.clientY - r.top - r.height / 2) * .25}px`;
      });
      b.addEventListener('mouseleave', () => b.style.translate = '');
    });
  }

  // Copy
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = btn.textContent;
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Copied ✓'; btn.classList.add('ok'); }
    catch { btn.textContent = 'Select & copy'; }
    setTimeout(() => { btn.textContent = label; btn.classList.remove('ok'); }, 1800);
  }));

  // Mobile menu
  const burger = $('.nav__burger');
  if (burger) {
    const set = open => { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); };
    burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('.menu a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // Copy the text of a target element: <button data-copy-from="#id">
  $$('[data-copy-from]').forEach(btn => btn.addEventListener('click', async () => {
    const t = $(btn.dataset.copyFrom), label = btn.textContent;
    const text = t ? (t.value ?? t.textContent).replace(/\s*Copy\s*$/, '').trim() : '';
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied ✓'; btn.classList.add('ok'); }
    catch { btn.textContent = 'Select & copy'; }
    setTimeout(() => { btn.textContent = label; btn.classList.remove('ok'); }, 1600);
  }));

  // Filter chips: <div data-filter-group="x"><button class="chip" data-filter="all|key"> ... items [data-tags="a b"]
  $$('[data-filter-group]').forEach(group => {
    const items = $$(`[data-filter-target="${group.dataset.filterGroup}"] > [data-tags]`);
    $$('.chip', group).forEach(chip => chip.addEventListener('click', () => {
      $$('.chip', group).forEach(c => c.setAttribute('aria-pressed', c === chip));
      const f = chip.dataset.filter;
      items.forEach(it => { it.hidden = !(f === 'all' || it.dataset.tags.split(' ').includes(f)); });
    }));
  });

  // Interactive checklist: <section data-checklist="key"> with .ck input[type=checkbox]
  $$('[data-checklist]').forEach(root => {
    const key = 'ck:' + root.dataset.checklist, boxes = $$('.ck input', root);
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    boxes.forEach((b, i) => { b.checked = saved.includes(i); });
    const update = () => {
      const done = boxes.filter(b => b.checked).length;
      $$('[data-ck-done]', root).forEach(el => el.textContent = done);
      $$('[data-ck-pct]', root).forEach(el => el.textContent = Math.round(done / boxes.length * 100) + '%');
      $$('.ck-bar__meter i', root).forEach(el => el.style.transform = `scaleX(${done / boxes.length})`);
      $$('.ck-group', root).forEach(g => { const bs = $$('input', g); const s = $('.ck-group__head span', g); if (s) s.textContent = `${bs.filter(b => b.checked).length}/${bs.length} passed`; });
      try { localStorage.setItem(key, JSON.stringify(boxes.map((b, i) => b.checked ? i : -1).filter(i => i >= 0))); } catch {}
    };
    boxes.forEach(b => b.addEventListener('change', update));
    $$('[data-ck-reset]', root).forEach(btn => btn.addEventListener('click', () => { boxes.forEach(b => b.checked = false); update(); }));
    update();
  });

  // Clock + year
  $$('[data-clock]').forEach(el => {
    const t = () => el.textContent = 'India · ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST';
    t(); setInterval(t, 30000);
  });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();

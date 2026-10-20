/* Durga.design — 14 browser design tools. Each mounts into <div class="tool" data-tool="slug">.
   Everything runs locally; nothing is uploaded. */
(() => {
  const root = document.querySelector('[data-tool]');
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const round = (v, d = 3) => +(+v).toFixed(d);

  /* ---------- colour maths ---------- */
  const hexNorm = h => { h = String(h).trim().replace(/^#/, ''); if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map(c => c + c).join(''); return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toUpperCase() : null; };
  const hexToRgb = h => { h = hexNorm(h); if (!h) return null; const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  const rgbToHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; };
  const hslToRgb = ([h, s, l]) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round); };
  const parseColor = str => {
    str = String(str).trim();
    const hx = hexToRgb(str); if (hx) return hx;
    let m = str.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i); if (m) return [+m[1], +m[2], +m[3]].map(v => clamp(v, 0, 255));
    m = str.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i); if (m) return hslToRgb([+m[1], +m[2], +m[3]]);
    return null;
  };
  const lum = rgb => { const [r, g, b] = rgb.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

  /* ---------- UI helpers ---------- */
  const code = (id, text = '') => `<div class="code" id="${id}"><span data-code>${text}</span><button type="button" data-copy-code="${id}">Copy</button></div>`;
  const colorField = (id, label, val) => `<div class="field"><span>${label}</span><div class="color-field"><input type="color" id="${id}-pick" value="${val}" aria-label="${label} picker"><input class="input" id="${id}" value="${val.toUpperCase()}" spellcheck="false" aria-label="${label} hex"></div></div>`;
  const range = (id, label, min, max, val, step = 1, unit = '') => `<div class="field"><label for="${id}">${label}<output id="${id}-out">${val}${unit}</output></label><input class="range" type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
  const num = (id, label, val, min = '', max = '', step = 'any') => `<div class="field"><label for="${id}">${label}</label><input class="input" type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="${step}"></div>`;
  const select = (id, label, opts, val) => `<div class="field"><label for="${id}">${label}</label><select class="select" id="${id}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${v}"${String(v) === String(val) ? ' selected' : ''}>${l}</option>`; }).join('')}</select></div>`;
  const seg = (id, label, opts, val) => `<div class="field"><span>${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map(o => `<button type="button" data-v="${o}" aria-pressed="${o === val}">${o}</button>`).join('')}</div></div>`;
  const segVal = id => $(`#${id} [aria-pressed=true]`).dataset.v;
  const setCode = (id, text) => { $(`#${id} [data-code]`).textContent = text; };
  const wire = fn => {
    root.addEventListener('input', e => {
      const t = e.target;
      if (t.type === 'range') { const o = $(`#${t.id}-out`); if (o) o.textContent = t.value + (o.dataset.unit || o.textContent.replace(/^[-\d.]+/, '')); }
      if (t.type === 'color') { const tx = $('#' + t.id.replace(/-pick$/, '')); if (tx) tx.value = t.value.toUpperCase(); }
      if (t.classList.contains('input') && t.closest('.color-field')) { const n = hexNorm(t.value); if (n) t.previousElementSibling.value = n.toLowerCase(); }
      fn();
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('.seg button'); if (b) { $$('button', b.parentElement).forEach(x => x.setAttribute('aria-pressed', x === b)); fn(); }
    });
    fn();
  };
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy-code]'); if (!b) return;
    const t = $(`#${b.dataset.copyCode} [data-code]`).textContent;
    try { await navigator.clipboard.writeText(t); b.textContent = 'Copied ✓'; b.classList.add('ok'); } catch { b.textContent = 'Select'; }
    setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('ok'); }, 1500);
  });
  const val = id => $('#' + id).value;
  const nval = id => parseFloat($('#' + id).value) || 0;

  const TOOLS = {
    /* 1 ---------------------------------------------------------------- */
    'contrast-checker'() {
      root.innerHTML = `<div class="tool__controls">
        ${colorField('fg', 'Text colour', '#100e0c')}
        ${colorField('bg', 'Background', '#f5f2ee')}
        <button class="btn btn-secondary" type="button" id="swap">Swap colours <span class="arr">⇄</span></button>
      </div>
      <div class="tool__out">
        <div><p class="t-caption">Contrast ratio</p><p class="big-readout" id="ratio">—</p><p class="t-body" id="verdict" style="font-weight:600"></p></div>
        <div class="pass-grid" id="grid"></div>
        <div id="prev" style="border:1px solid var(--clr-border);padding:var(--sp-6)"><p style="font-family:var(--font-display);font-size:var(--text-3xl);line-height:1.1">The quick brown fox</p><p style="margin-top:var(--sp-2)">Sample body copy at a readable size, so you can judge this pair the way a user would.</p></div>
        ${code('css')}
      </div>`;
      $('#swap').addEventListener('click', () => { const a = val('fg'), b = val('bg'); $('#fg').value = b; $('#bg').value = a; $('#fg-pick').value = hexNorm(b).toLowerCase(); $('#bg-pick').value = hexNorm(a).toLowerCase(); run(); });
      const run = () => {
        const f = parseColor(val('fg')), b = parseColor(val('bg')); if (!f || !b) return;
        const r = contrast(f, b);
        $('#ratio').textContent = r.toFixed(2) + ':1';
        $('#verdict').textContent = r >= 7 ? 'Excellent — passes AAA' : r >= 4.5 ? 'Good — passes AA' : r >= 3 ? 'Large text and UI only' : 'Fails — not readable';
        $('#verdict').className = 't-body ' + (r >= 4.5 ? 'pass' : r >= 3 ? '' : 'fail');
        $('#grid').innerHTML = [['Normal text AA', 4.5], ['Large text AA', 3], ['Normal text AAA', 7], ['UI & graphics', 3]].map(([l, t]) => `<div><span>${l}</span><span class="${r >= t ? 'pass' : 'fail'}">${r >= t ? 'Pass' : 'Fail'}</span></div>`).join('');
        Object.assign($('#prev').style, { color: rgbToHex(f), background: rgbToHex(b) });
        setCode('css', `--text: ${rgbToHex(f)};\n--bg: ${rgbToHex(b)}; /* ${r.toFixed(2)}:1 */`);
      };
      wire(run);
    },
    /* 2 ---------------------------------------------------------------- */
    'hex-to-rgb'() {
      root.innerHTML = `<div class="tool__controls">
        <div class="field"><label for="in">Any colour (hex, rgb or hsl)</label><input class="input" id="in" value="#1B54F8" spellcheck="false"></div>
        <div class="field"><span>Or pick</span><input type="color" id="pick" value="#1b54f8" style="width:100%;height:48px;border:1px solid var(--clr-border);background:none;cursor:pointer"></div>
        <div id="sw" style="height:120px;border:1px solid var(--clr-ink);box-shadow:var(--shadow-card)"></div>
      </div>
      <div class="tool__out">
        <p class="t-caption" id="err" style="color:var(--clr-danger)"></p>
        <div class="field"><span>HEX</span>${code('hex')}</div>
        <div class="field"><span>RGB</span>${code('rgb')}</div>
        <div class="field"><span>HSL</span>${code('hsl')}</div>
        <div class="field"><span>CSS variable</span>${code('var')}</div>
      </div>`;
      $('#pick').addEventListener('input', e => { $('#in').value = e.target.value.toUpperCase(); });
      wire(() => {
        const c = parseColor(val('in'));
        $('#err').textContent = c ? '' : 'Enter a colour like #1B54F8, rgb(27 84 248) or hsl(225 94% 54%).';
        if (!c) return;
        const hx = rgbToHex(c), [h, s, l] = rgbToHsl(c);
        $('#sw').style.background = hx; $('#pick').value = hx.toLowerCase();
        setCode('hex', hx); setCode('rgb', `rgb(${c.join(', ')})`); setCode('hsl', `hsl(${h}, ${s}%, ${l}%)`); setCode('var', `--brand: ${hx}; /* rgb(${c.join(' ')}) */`);
      });
    },
    /* 3 ---------------------------------------------------------------- */
    'color-blindness'() {
      const M = {
        Protanopia: [.567, .433, 0, .558, .442, 0, 0, .242, .758], Deuteranopia: [.625, .375, 0, .7, .3, 0, 0, .3, .7],
        Tritanopia: [.95, .05, 0, 0, .433, .567, 0, .475, .525], Achromatopsia: [.299, .587, .114, .299, .587, .114, .299, .587, .114]
      };
      const apply = (m, [r, g, b]) => [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b].map(v => clamp(Math.round(v), 0, 255));
      root.innerHTML = `<div class="tool__controls">
        ${colorField('c1', 'Colour A', '#1b54f8')}
        ${colorField('c2', 'Colour B', '#c2410c')}
        ${colorField('c3', 'Colour C', '#1f9d55')}
        <div class="field"><label for="file">Or test a screenshot (stays on your device)</label><input class="input" type="file" id="file" accept="image/*"></div>
      </div>
      <div class="tool__out"><div id="rows" style="display:grid;gap:var(--sp-3)"></div><div id="imgs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:var(--sp-3)"></div></div>`;
      const run = () => {
        const cs = ['c1', 'c2', 'c3'].map(id => parseColor(val(id))).filter(Boolean);
        $('#rows').innerHTML = [['Normal vision', null], ...Object.entries(M)].map(([n, m]) => `<div style="display:grid;grid-template-columns:130px 1fr;align-items:center;gap:var(--sp-3)"><span class="t-caption" style="color:var(--clr-ink);font-weight:600">${n}</span><div style="display:flex;border:1px solid var(--clr-border)">${cs.map(c => `<div title="${rgbToHex(m ? apply(m, c) : c)}" style="flex:1;height:48px;background:${rgbToHex(m ? apply(m, c) : c)}"></div>`).join('')}</div></div>`).join('');
      };
      $('#file').addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        const img = new Image(); img.onload = () => {
          const w = Math.min(600, img.width), h = Math.round(img.height * w / img.width);
          $('#imgs').innerHTML = '';
          Object.entries(M).forEach(([n, m]) => {
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
            const d = ctx.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const o = apply(m, [d.data[i], d.data[i + 1], d.data[i + 2]]); d.data[i] = o[0]; d.data[i + 1] = o[1]; d.data[i + 2] = o[2]; }
            ctx.putImageData(d, 0, 0); cv.style.cssText = 'width:100%;border:1px solid var(--clr-border)';
            const fig = document.createElement('figure'); fig.append(cv); const cap = document.createElement('figcaption'); cap.className = 't-caption'; cap.textContent = n; fig.append(cap); $('#imgs').append(fig);
          });
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(f);
      });
      wire(run);
    },
    /* 4 ---------------------------------------------------------------- */
    'type-scale'() {
      root.innerHTML = `<div class="tool__controls">
        ${num('base', 'Base size (px)', 16, 8, 40, 1)}
        ${select('ratio', 'Ratio', [[1.067, 'Minor second · 1.067'], [1.125, 'Major second · 1.125'], [1.2, 'Minor third · 1.2'], [1.25, 'Major third · 1.25'], [1.333, 'Perfect fourth · 1.333'], [1.414, 'Augmented fourth · 1.414'], [1.5, 'Perfect fifth · 1.5'], [1.618, 'Golden ratio · 1.618']], 1.25)}
        ${range('up', 'Steps up', 1, 8, 6)}
        ${range('down', 'Steps down', 0, 3, 2)}
      </div>
      <div class="tool__out"><div id="prev" style="display:grid;gap:var(--sp-2);border:1px solid var(--clr-border);padding:var(--sp-6);overflow:hidden"></div>${code('css')}</div>`;
      wire(() => {
        const b = nval('base') || 16, r = +val('ratio'), up = +val('up'), dn = +val('down');
        const steps = []; for (let i = up; i >= -dn; i--) steps.push({ i, px: b * Math.pow(r, i) });
        const name = i => i === 0 ? 'base' : i > 0 ? `${i}xl`.replace(/^1xl$/, 'lg').replace(/^2xl$/, 'xl').replace(/^(\d)xl$/, (m, d) => `${d - 1}xl`) : ['sm', 'xs', '2xs'][-i - 1];
        $('#prev').innerHTML = steps.map(s => `<div style="display:grid;grid-template-columns:90px 1fr;align-items:baseline;gap:var(--sp-3)"><span class="t-caption">${round(s.px, 1)}px · ${round(s.px / 16, 3)}rem</span><span style="font-family:${s.i > 0 ? 'var(--font-display)' : 'var(--font-ui)'};font-size:${s.px}px;line-height:1.15;white-space:nowrap">Design scale</span></div>`).join('');
        setCode('css', ':root {\n' + steps.map(s => `  --text-${name(s.i)}: ${round(s.px / 16, 4)}rem; /* ${round(s.px, 2)}px */`).join('\n') + '\n}');
      });
    },
    /* 5 ---------------------------------------------------------------- */
    'line-height'() {
      root.innerHTML = `<div class="tool__controls">
        ${range('size', 'Font size', 10, 96, 16, 1, 'px')}
        ${range('lh', 'Line height', 0.9, 2.2, 1.6, 0.05)}
        ${range('ls', 'Letter spacing', -0.05, 0.15, 0, 0.005, 'em')}
        ${seg('font', 'Typeface', ['Body', 'Display'], 'Body')}
        <button class="btn btn-secondary" type="button" id="auto">Suggest for this size</button>
      </div>
      <div class="tool__out"><div id="prev" style="border:1px solid var(--clr-border);padding:var(--sp-6);max-width:100%;overflow:hidden"><p>Good rhythm makes long text easy to follow. The line height gives each line room to breathe, and the tracking keeps letters from crowding or drifting apart at large sizes.</p></div>${code('css')}</div>`;
      $('#auto').addEventListener('click', () => {
        const s = nval('size'), lh = s <= 14 ? 1.6 : s <= 20 ? 1.55 : s <= 32 ? 1.3 : s <= 48 ? 1.15 : 1.05, ls = s <= 14 ? .01 : s <= 24 ? 0 : s <= 48 ? -.01 : -.02;
        $('#lh').value = lh; $('#ls').value = ls; $('#lh-out').textContent = lh; $('#ls-out').textContent = ls + 'em'; run();
      });
      const run = () => {
        const s = nval('size'), lh = nval('lh'), ls = nval('ls'), disp = segVal('font') === 'Display';
        Object.assign($('#prev p').style, { fontSize: s + 'px', lineHeight: lh, letterSpacing: ls + 'em', fontFamily: disp ? 'var(--font-display)' : 'var(--font-ui)' });
        setCode('css', `font-size: ${round(s / 16, 4)}rem; /* ${s}px */\nline-height: ${lh}; /* ${round(s * lh, 1)}px */\nletter-spacing: ${ls}em;`);
      };
      wire(run);
    },
    /* 6 ---------------------------------------------------------------- */
    'spacing-scale'() {
      root.innerHTML = `<div class="tool__controls">
        ${num('base', 'Base unit (px)', 8, 1, 32, 1)}
        ${seg('mode', 'Progression', ['Linear', 'Geometric'], 'Linear')}
        ${range('ratio', 'Geometric ratio', 1.2, 2, 1.5, 0.05)}
        ${range('count', 'Steps', 4, 14, 10)}
      </div>
      <div class="tool__out"><div id="bars" style="display:grid;gap:var(--sp-2)"></div>${code('css')}</div>`;
      wire(() => {
        const b = nval('base') || 8, geo = segVal('mode') === 'Geometric', r = nval('ratio'), n = +val('count');
        const lin = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
        const vals = Array.from({ length: n }, (_, i) => geo ? b * Math.pow(r, i - 1) : b * lin[i]);
        const max = Math.max(...vals);
        $('#bars').innerHTML = vals.map((v, i) => `<div style="display:grid;grid-template-columns:70px 1fr 64px;align-items:center;gap:var(--sp-3);font-size:var(--text-xs)"><b>--space-${i + 1}</b><div style="height:14px;width:${v / max * 100}%;background:var(--clr-accent)"></div><span style="text-align:right;color:var(--clr-ink-3)">${round(v, 1)}px</span></div>`).join('');
        setCode('css', ':root {\n' + vals.map((v, i) => `  --space-${i + 1}: ${round(v / 16, 4)}rem; /* ${round(v, 2)}px */`).join('\n') + '\n}');
      });
    },
    /* 7 ---------------------------------------------------------------- */
    'aspect-ratio'() {
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      root.innerHTML = `<div class="tool__controls">
        <p class="t-label">From dimensions</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3)">${num('w', 'Width', 1920, 1)}${num('h', 'Height', 1080, 1)}</div>
        <p class="t-label" style="margin-top:var(--sp-4)">From a ratio</p>
        ${select('preset', 'Ratio', ['16:9', '4:3', '3:2', '1:1', '4:5', '9:16', '21:9', '2:1'], '16:9')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3)">${num('w2', 'Known width', 1200, 1)}${num('h2', 'Solved height', '', 1)}</div>
      </div>
      <div class="tool__out">
        <div><p class="t-caption">Simplified ratio</p><p class="big-readout" id="ratio">16:9</p></div>
        <div class="stage" style="min-height:200px"><div id="box" style="background:var(--clr-accent);border:1px solid var(--clr-ink);box-shadow:var(--shadow-card);max-width:100%;max-height:180px"></div></div>
        ${code('css')}
      </div>`;
      $('#h2').readOnly = true;
      wire(() => {
        const w = Math.round(nval('w')), h = Math.round(nval('h'));
        if (w > 0 && h > 0) {
          const g = gcd(w, h); $('#ratio').textContent = `${w / g}:${h / g}`;
          const s = 180 / Math.max(w, h) * (w > h ? 1.4 : 1); Object.assign($('#box').style, { width: Math.min(w * s, 320) + 'px', aspectRatio: `${w} / ${h}` });
          setCode('css', `aspect-ratio: ${w / g} / ${h / g};\n/* ${w} × ${h} = ${round(w / h, 4)} */`);
        }
        const [a, b] = val('preset').split(':').map(Number);
        $('#h2').value = nval('w2') ? round(nval('w2') * b / a, 2) : '';
      });
    },
    /* 8 ---------------------------------------------------------------- */
    'css-grid'() {
      root.innerHTML = `<div class="tool__controls">
        ${seg('mode', 'Columns', ['Fixed count', 'Auto-fill'], 'Fixed count')}
        ${range('cols', 'Column count', 1, 12, 3)}
        ${range('min', 'Min column width (auto-fill)', 80, 400, 200, 10, 'px')}
        ${range('rows', 'Rows', 1, 6, 2)}
        ${range('gap', 'Gap', 0, 64, 16, 4, 'px')}
      </div>
      <div class="tool__out"><div class="stage" style="display:block;min-height:240px"><div id="grid"></div></div>${code('css')}</div>`;
      wire(() => {
        const auto = segVal('mode') === 'Auto-fill', c = +val('cols'), r = +val('rows'), g = +val('gap'), mn = +val('min');
        const cols = auto ? `repeat(auto-fill, minmax(${mn}px, 1fr))` : `repeat(${c}, minmax(0, 1fr))`;
        const n = auto ? 8 : c * r;
        Object.assign($('#grid').style, { display: 'grid', gridTemplateColumns: cols, gridAutoRows: '64px', gap: g + 'px' });
        $('#grid').innerHTML = Array.from({ length: n }, (_, i) => `<div style="background:var(--clr-surface);border:1px solid var(--clr-ink);display:grid;place-items:center;font:600 12px var(--font-ui)">${i + 1}</div>`).join('');
        setCode('css', `.grid {\n  display: grid;\n  grid-template-columns: ${cols};${auto ? '' : `\n  grid-template-rows: repeat(${r}, auto);`}\n  gap: ${g}px;\n}`);
      });
    },
    /* 9 ---------------------------------------------------------------- */
    flexbox() {
      root.innerHTML = `<div class="tool__controls">
        ${select('dir', 'flex-direction', ['row', 'row-reverse', 'column', 'column-reverse'], 'row')}
        ${select('wrap', 'flex-wrap', ['nowrap', 'wrap', 'wrap-reverse'], 'wrap')}
        ${select('jc', 'justify-content', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], 'flex-start')}
        ${select('ai', 'align-items', ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'], 'stretch')}
        ${range('gap', 'gap', 0, 48, 12, 4, 'px')}
        ${range('n', 'Items', 1, 10, 5)}
      </div>
      <div class="tool__out"><div class="stage" style="display:block;min-height:260px"><div id="box" style="min-height:220px;border:1px dashed var(--clr-ink-3)"></div></div>${code('css')}</div>`;
      wire(() => {
        const s = { display: 'flex', flexDirection: val('dir'), flexWrap: val('wrap'), justifyContent: val('jc'), alignItems: val('ai'), gap: val('gap') + 'px' };
        Object.assign($('#box').style, s);
        $('#box').innerHTML = Array.from({ length: +val('n') }, (_, i) => `<div style="background:var(--clr-surface);border:1px solid var(--clr-ink);padding:${8 + (i % 3) * 6}px ${14 + (i % 2) * 10}px;font:600 12px var(--font-ui)">${i + 1}</div>`).join('');
        setCode('css', `.container {\n  display: flex;\n  flex-direction: ${s.flexDirection};\n  flex-wrap: ${s.flexWrap};\n  justify-content: ${s.justifyContent};\n  align-items: ${s.alignItems};\n  gap: ${s.gap};\n}`);
      });
    },
    /* 10 --------------------------------------------------------------- */
    'border-radius'() {
      root.innerHTML = `<div class="tool__controls">
        ${seg('link', 'Corners', ['Linked', 'Separate'], 'Linked')}
        ${range('tl', 'Top left', 0, 120, 16, 1, 'px')}
        ${range('tr', 'Top right', 0, 120, 16, 1, 'px')}
        ${range('br', 'Bottom right', 0, 120, 16, 1, 'px')}
        ${range('bl', 'Bottom left', 0, 120, 16, 1, 'px')}
        <p class="t-caption">This site itself uses 0 radius everywhere — the preview is the only rounded thing here.</p>
      </div>
      <div class="tool__out"><div class="stage" style="min-height:280px"><div id="box" style="width:220px;height:160px;background:var(--clr-accent)"></div></div>${code('css')}</div>`;
      let last = 'tl';
      root.addEventListener('input', e => { if (['tl', 'tr', 'br', 'bl'].includes(e.target.id)) last = e.target.id; }, true);
      wire(() => {
        if (segVal('link') === 'Linked') ['tl', 'tr', 'br', 'bl'].forEach(k => { $('#' + k).value = val(last); $(`#${k}-out`).textContent = val(last) + 'px'; });
        const v = ['tl', 'tr', 'br', 'bl'].map(k => val(k) + 'px'), same = v.every(x => x === v[0]);
        $('#box').style.setProperty('border-radius', v.join(' '), 'important');
        setCode('css', `border-radius: ${same ? v[0] : v.join(' ')};`);
      });
    },
    /* 11 --------------------------------------------------------------- */
    shadow() {
      root.innerHTML = `<div class="tool__controls">
        ${range('x', 'Offset X', -40, 40, 6, 1, 'px')}
        ${range('y', 'Offset Y', -40, 40, 6, 1, 'px')}
        ${range('blur', 'Blur', 0, 80, 0, 1, 'px')}
        ${range('spread', 'Spread', -20, 40, 0, 1, 'px')}
        ${colorField('col', 'Colour', '#100e0c')}
        ${range('op', 'Opacity', 0, 100, 100, 1, '%')}
        ${seg('inset', 'Type', ['Outer', 'Inset'], 'Outer')}
      </div>
      <div class="tool__out"><div class="stage" style="min-height:280px;background:var(--clr-bg)"><div id="box" style="width:200px;height:140px;background:var(--clr-surface);border:1px solid var(--clr-ink)"></div></div>${code('css')}</div>`;
      wire(() => {
        const c = parseColor(val('col')) || [0, 0, 0], a = nval('op') / 100;
        const s = `${segVal('inset') === 'Inset' ? 'inset ' : ''}${val('x')}px ${val('y')}px ${val('blur')}px ${val('spread')}px rgba(${c.join(', ')}, ${round(a, 2)})`;
        $('#box').style.boxShadow = s; setCode('css', `box-shadow: ${s};`);
      });
    },
    /* 12 --------------------------------------------------------------- */
    gradient() {
      root.innerHTML = `<div class="tool__controls">
        ${seg('type', 'Type', ['Linear', 'Radial'], 'Linear')}
        ${range('angle', 'Angle', 0, 360, 135, 1, '°')}
        ${colorField('c1', 'Stop 1', '#1b54f8')}${range('p1', 'Stop 1 position', 0, 100, 0, 1, '%')}
        ${colorField('c2', 'Stop 2', '#f5f2ee')}${range('p2', 'Stop 2 position', 0, 100, 100, 1, '%')}
      </div>
      <div class="tool__out"><div id="box" style="height:260px;border:1px solid var(--clr-ink);box-shadow:var(--shadow-card)"></div>${code('css')}</div>`;
      wire(() => {
        const c1 = rgbToHex(parseColor(val('c1')) || [0, 0, 0]), c2 = rgbToHex(parseColor(val('c2')) || [255, 255, 255]);
        const g = segVal('type') === 'Linear' ? `linear-gradient(${val('angle')}deg, ${c1} ${val('p1')}%, ${c2} ${val('p2')}%)` : `radial-gradient(circle at center, ${c1} ${val('p1')}%, ${c2} ${val('p2')}%)`;
        $('#box').style.background = g; setCode('css', `background: ${g};`);
      });
    },
    /* 13 --------------------------------------------------------------- */
    'px-to-rem'() {
      root.innerHTML = `<div class="tool__controls">
        ${num('root', 'Root font size (px)', 16, 1)}
        ${num('parent', 'Parent font size for em (px)', 16, 1)}
        ${num('px', 'Pixels', 24, 0)}
        <div class="field"><label for="list">Batch (one px value per line)</label><textarea class="textarea" id="list">4\n8\n12\n16\n24\n32\n48\n64</textarea></div>
      </div>
      <div class="tool__out">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)"><div><p class="t-caption">rem</p><p class="big-readout" id="rem" style="font-size:var(--text-5xl)">—</p></div><div><p class="t-caption">em</p><p class="big-readout" id="em" style="font-size:var(--text-5xl)">—</p></div></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>px</th><th>rem</th><th>em</th></tr></thead><tbody id="rows"></tbody></table></div>
        ${code('css')}
      </div>`;
      wire(() => {
        const r = nval('root') || 16, p = nval('parent') || 16, x = nval('px');
        $('#rem').textContent = round(x / r, 4); $('#em').textContent = round(x / p, 4);
        const vals = val('list').split(/[\s,]+/).map(parseFloat).filter(v => !isNaN(v));
        $('#rows').innerHTML = vals.map(v => `<tr><td>${v}px</td><td>${round(v / r, 4)}rem</td><td>${round(v / p, 4)}em</td></tr>`).join('');
        setCode('css', vals.map(v => `${v}px → ${round(v / r, 4)}rem`).join('\n'));
      });
    },
    /* 14 --------------------------------------------------------------- */
    'svg-to-base64'() {
      root.innerHTML = `<div class="tool__controls">
        <div class="field"><label for="svg">Paste SVG markup</label><textarea class="textarea" id="svg" style="min-height:220px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1B54F8" d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z"/></svg></textarea></div>
        <div class="field"><label for="file">Or choose an .svg file</label><input class="input" type="file" id="file" accept=".svg,image/svg+xml"></div>
        <p class="t-caption" id="info"></p>
      </div>
      <div class="tool__out">
        <div class="stage" style="min-height:160px"><img id="prev" alt="SVG preview" style="max-width:160px;max-height:120px"></div>
        <div class="field"><span>Base64 data URI</span>${code('b64')}</div>
        <div class="field"><span>URL-encoded (smaller, CSS-friendly)</span>${code('url')}</div>
        <div class="field"><span>CSS</span>${code('css')}</div>
      </div>`;
      $('#file').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { $('#svg').value = t; run(); }); });
      const run = () => {
        const s = val('svg').trim().replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><');
        if (!/^<svg[\s>]/i.test(s) && !/^<\?xml/i.test(s)) { $('#info').textContent = 'Paste markup that starts with <svg.'; return; }
        const b64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));
        const url = 'data:image/svg+xml,' + encodeURIComponent(s).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'");
        $('#prev').src = b64;
        $('#info').textContent = `${s.length} chars in · base64 ${b64.length} · url-encoded ${url.length}`;
        setCode('b64', b64); setCode('url', url); setCode('css', `background-image: url("${url}");`);
      };
      wire(run);
    }
  };
  (TOOLS[root.dataset.tool] || (() => { root.textContent = 'Tool not found.'; }))();
})();

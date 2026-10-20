// Long-form Vilcart case study (source: the original /case-study-vilcart page).
const M = '/assets/media/images/vilcart/';
const fig = (src, alt, cap) => `<figure class="figure rv"><div class="figure__frame"><img src="${M}${src}" alt="${alt}" loading="lazy"></div>${cap ? `<figcaption><b>${cap[0]}</b> ${cap[1]}</figcaption>` : ''}</figure>`;
const persona = (name, facts, paras) => `<article class="card rv" style="height:100%"><div class="card__body">
  <p class="card__kicker"><b>Persona</b></p>
  <h3 class="card__title">${name}</h3>
  <div class="tags">${facts.map(f => `<span class="tag tag-neutral">${f}</span>`).join('')}</div>
  ${paras.map(p => `<p class="card__text">${p}</p>`).join('')}
</div></article>`;

export const vilcartStory = {
  title: 'How I designed e-commerce for <em>rural India</em>.',
  summary: 'A mobile shopping app that helps families in villages and small towns across South India buy premium home appliances — refrigerators, washing machines, air conditioners — that are hard to find locally.',
  cover: M + 'vilcart-cover.jpg',
  meta: [['My role', 'Lead Product Designer'], ['Duration', '3 months'], ['Platform', 'Android & iOS'], ['Tools', 'Figma']],
  stats: [
    { value: '40%', label: 'Target browse-to-purchase conversion' },
    { value: '<35%', label: 'Target cart abandonment' },
    { value: '2', label: 'Personas anchoring every decision' },
    { value: '3 months', label: 'From research to build, with Flutter & Node.js engineers' }
  ],
  toc: [['overview', 'Overview'], ['problem', 'The problem'], ['personas', 'Personas'], ['structure', 'IA & user flow'], ['visual', 'Visual system'], ['decisions', 'Key decisions']],
  html: `
  <section class="cs-section" id="overview">
    <p class="cs-section__k rv">Overview</p>
    <div class="prose">
      <h2 class="rv">Bringing premium appliances to villages.</h2>
      <p class="rv">This is a mobile e-commerce app designed to help people in villages and small towns across South India buy premium home appliances that are often difficult to find locally.</p>
      <p class="rv">I led the design end-to-end: research, information architecture, user flows, UI design and a full design system, working alongside a Flutter and Node.js engineering team over a 3-month build.</p>
    </div>
  </section>

  <section class="cs-section" id="problem">
    <p class="cs-section__k rv">The problem</p>
    <div class="prose">
      <h2 class="rv">Desire to buy was there. Trust wasn’t.</h2>
      <div class="tags rv"><span class="tag tag-neutral">Trust</span><span class="tag tag-neutral">Genuine products</span><span class="tag tag-neutral">Language</span><span class="tag tag-neutral">Fraud risk</span><span class="tag tag-neutral">Money on the line</span></div>
      <p class="rv">Many families in small towns genuinely wanted to buy appliances like fridges or washing machines but couldn’t. Stores were too far away, online apps felt complicated, and most people didn’t trust them.</p>
      <p class="rv">They worried about fake products, losing money, or being unable to return items. Big platforms weren’t available in their local language and often didn’t deliver to their area.</p>
      <p class="rv">So even though the desire to buy was real, the whole process felt risky and confusing, especially for expensive, considered purchases.</p>
    </div>
    <blockquote class="pull rv" style="margin-block:var(--sp-12)">The desire to buy was real. The process felt risky and confusing.</blockquote>
    <div class="card-grid card-grid--2">
      <div class="callout rv"><p class="callout__label">User goals</p><ul class="list list--check"><li>Buy appliances confidently without travelling to cities</li><li>Understand products clearly in their preferred language</li><li>Feel secure about product quality and delivery</li></ul></div>
      <div class="callout rv" style="--i:1"><p class="callout__label">Business goals</p><ul class="list list--arrow"><li>Reach 40% conversion from browse to purchase</li><li>Reduce cart abandonment below 35%</li><li>Establish trust and drive repeat purchases</li></ul></div>
    </div>
  </section>

  <section class="cs-section" id="personas">
    <p class="cs-section__k rv">Personas</p>
    <div class="prose">
      <h2 class="rv">Designing for two very different buyers.</h2>
      <p class="rv">A decision-making homemaker buying for the household, and a budget-conscious student buying on his own for the first time.</p>
    </div>
    <div class="card-grid card-grid--2" style="margin-top:var(--sp-8)">
      ${persona('Lakshmi Ramaswamy', ['34 yrs', 'Homemaker', 'Kannada', '₹35,000/month'], [
        'Lakshmi manages her household while her husband works at a local school. She makes most daily decisions but always discusses major purchases with him. The family has saved for two years to buy a washing machine; hand-washing for four takes 2–3 hours a day.',
        'The nearest electronics store is 60 km away. A visit last year cost ₹800 in bus fare and a full day, only to find limited options and a salesperson using technical terms she didn’t understand.'])}
      ${persona('Arun Kumar', ['21 yrs', 'Engineering student', 'Kannada, English', '₹6,000/month'], [
        'Arun is in his third year of engineering, living in a hostel where summer temperatures reach 40°C. He wants an air cooler to make studying bearable, but his parents are hesitant about him making a big purchase alone.',
        'He’s saved ₹8,000 from tutoring and his parents will add ₹7,000 if he finds a good deal. His concern: something genuine, within budget, delivered to his hostel without complications.'])}
    </div>
  </section>

  <section class="cs-section" id="structure">
    <p class="cs-section__k rv">IA &amp; user flow</p>
    <div class="prose">
      <h2 class="rv">Keeping the app simple to navigate.</h2>
      <p class="rv">A flat four-section structure designed for low digital literacy: no deep nesting, just a clear path from discovery to checkout.</p>
    </div>
    ${fig('ia.jpg', 'Vilcart information architecture diagram', ['IA', 'Four flat sections, no deep nesting.'])}
    <div class="prose"><h3 class="rv">Mapping the first-time buyer journey.</h3><p class="rv">Every edge case was mapped before a single screen was designed, from no location permission to cash-on-delivery checkout.</p></div>
    ${fig('userflow.webp', 'Vilcart first-time buyer user flow', ['User flow', 'First-time buyer, end to end.'])}
  </section>

  <section class="cs-section" id="visual">
    <p class="cs-section__k rv">Visual system</p>
    <div class="prose">
      <h2 class="rv">A visual system built for clarity.</h2>
      <p class="rv">Typography, colour and spacing chosen for high contrast and legibility, for people with low digital literacy across many screen sizes.</p>
    </div>
    ${fig('vilcart-3.jpg', 'Vilcart typography, colour and spacing guidelines', ['Guidelines', 'Type, colour and spacing.'])}
  </section>

  <section class="cs-section" id="decisions">
    <p class="cs-section__k rv">Key decisions</p>
    <div class="prose">
      <h2 class="rv">Designing for trust, not just transactions.</h2>
      <p class="rv">Every major decision traced back to one thing: removing the friction (language, fraud risk, ambiguity) that kept the desire to buy from becoming a completed purchase.</p>
    </div>
    ${fig('vilcart-4.jpg', 'Key design decisions on Vilcart screens', ['Decisions', 'Trust signals on every key screen.'])}
    ${fig('vilcart-5.jpg', 'Vilcart app mockup screens')}
    ${fig('order.jpg', 'Vilcart order and tracking screens', ['Orders', 'Clear status from checkout to doorstep.'])}
  </section>`
};

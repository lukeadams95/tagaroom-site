// Moving Coach page (/moving-coach/). Restored from the old WordPress page
// (tagaroom.com/moving-coach/, linked from printed QR cards). Text is verbatim
// from the old page; partner order and links are unchanged.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { esc } from './lib/dc.mjs';
import { header, RIBBON } from './partials.mjs';

const STRIPE = ['#FEFA1F', '#FC811C', '#F91055', '#DA019F', '#724DB5', '#01A0D6', '#40D13D', '#DEF306'];
const MEDIA = fileURLToPath(new URL('../design/media/', import.meta.url));

export const coach = {
  out: 'moving-coach/index.html',
  title: 'Your Moving Coach | TAG-A-ROOM',
  description: 'To reduce the stress of moving, TAG-A-ROOM® has assembled some of the best companies to help: Tyler Moving & Storage, Ship-n-Crate and Clutter Cleaner.',
  h1: 'Your Moving Coach',
  intro: [
    'TAG-A-ROOM® is the original creator of the color-coded moving and storage label systems. Our goal here at TAG-A-ROOM® is to help your move become as smooth and stress-free as possible. Ditch the hard-to-read handwriting and dried-out markers, and let us color your move!',
    'To reduce the stress of moving, we have assembled some of the best companies to help you with your moving needs!',
  ],
  partnersTitle: 'Moving Coach Partners',
  partners: [
    {
      name: 'Tyler Moving & Storage',
      sub: 'Professional Movers in Tyler, TX',
      text: ['We’re the moving company in Tyler, TX, that gets the job done the right way. When you’re looking for a professional moving company, you need a courteous and experienced moving expert who understands the stress, concerns, and details of moving.'],
      href: 'https://www.tylermovingandstorage.com/', cta: 'Tyler Moving & Storage',
      logo: { file: 'tyler-logo.jpg', alt: 'tyler moving and storage' },
    },
    {
      name: 'Ship & Crate',
      sub: 'Professional Shipping and Crating Services',
      text: ['Ship-n-Crate has headquarters in San Antonio and Corpus Christi, Texas. We also have locations in Austin, Dallas, and surrounding cities in Texas. We’re your best choice for Crating and Shipping Services. Also, our team uses the best techniques and materials to pack your things safely, so they don’t get damaged during delivery. Finally, pick Ship-n-Crate for safe, affordable, and pro help from start to finish. We promise our service is the best!'],
      href: 'https://shipandcrate.com/', cta: 'Visit Ship-n-Crate',
      logo: { file: 'ship-n-crate-web.jpg', alt: 'Ship and Crate Logo' },
    },
    {
      name: 'Clutter Cleaner',
      sub: 'Guiding families through a lifetime of belongings toward a future where memories live beyond the move.',
      text: ['We understand the significance of every piece in your family’s story. With compassion, care, and expert guidance, we will walk you through this transition, making it a seamless and positive experience for you and your loved ones.'],
      href: 'https://cluttercleaner.com/', cta: 'Visit Clutter Cleaner',
      logo: { file: 'cluttercleaner-RGB_reverse-copy-scaled.png', alt: 'clutter cleaner', dark: true },
    },
  ],
};

// Logos come from the old page; they're shown only when a copy is in design/media/.
const logo = p => (p.logo && fs.existsSync(MEDIA + p.logo.file)
  ? `<a class="mc-logo${p.logo.dark ? ' mc-logo--dark' : ''}" href="${esc(p.href)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img src="media/${esc(p.logo.file)}" alt="${esc(p.logo.alt)}" loading="lazy" decoding="async"></a>`
  : '');

export function coachPage(page, { footer }) {
  return `${header()}

<section class="pol-hero">
  <div class="pol-hero-inner">
    <nav class="pol-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Moving Coach</span></nav>
    <h1>${esc(page.h1)}</h1>
  </div>
  <div style="display:flex;height:5px">${RIBBON}</div>
</section>

<div class="pol-body">
  <div class="pol-wrap pol-wrap--single mc-wrap">
    <div class="pol-main">
      ${page.intro.map(t => `<p class="mc-intro">${esc(t)}</p>`).join('\n      ')}
    </div>
  </div>
</div>

<div class="sm-body">
  <h2 class="mc-title">${esc(page.partnersTitle)}</h2>
  <div class="mc-grid">
    ${page.partners.map((p, i) => `<section class="sm-group mc-card" style="border-top-color:${STRIPE[(i * 3 + 1) % 8]}" aria-labelledby="mc-${i}">
      ${logo(p)}
      <h3 id="mc-${i}">${esc(p.name)}</h3>
      <p class="mc-sub">${esc(p.sub)}</p>
      ${p.text.map(t => `<p>${esc(t)}</p>`).join('')}
      <a class="btn-primary mc-btn" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.cta)}</a>
    </section>`).join('\n    ')}
  </div>
</div>

${footer}`;
}

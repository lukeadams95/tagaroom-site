// Guide pages: long-form how-to pages at the site root (e.g. /storage-unit-labels).
// Copy lives here as plain data so the wording stays exact. Uses the policy
// pages' hero and body styles (src/css/site.css) plus a few .guide-* rules.

import { esc } from './lib/dc.mjs';
import { header, RIBBON } from './partials.mjs';
import { SITE_URL } from './site.mjs';

const STRIPE = ['#FEFA1F', '#FC811C', '#F91055', '#DA019F', '#724DB5', '#01A0D6', '#40D13D', '#DEF306'];
const slug = s => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Inline content: a string, or an array of strings, { a, href } links and { b } bold runs.
const inline = x => (Array.isArray(x) ? x : [x]).map(part => {
  if (typeof part === 'string') return esc(part);
  if (part.b !== undefined) return `<strong>${inline(part.b)}</strong>`;
  return `<a href="${esc(part.href)}">${esc(part.a)}</a>`;
}).join('');

function block(b) {
  const [type, content] = b;
  if (type === 'p') return `<p>${inline(content)}</p>`;
  if (type === 'ul') return `<ul>${content.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;
  if (type === 'img') return `<figure class="guide-fig"><img src="${esc(content.src)}" alt="${esc(content.alt)}" width="${content.w}" height="${content.h}" loading="lazy" decoding="async"></figure>`;
  if (type === 'table') return `<div class="guide-table-wrap"><table class="guide-table">
          <thead><tr>${content.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${content.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>`;
  if (type === 'faq') return content.map(([q, a]) => `<h3>${esc(q)}</h3>\n        <p>${inline(a)}</p>`).join('\n        ');
  throw new Error(`Unknown guide block "${type}"`);
}

export function guidePage(page, { footer }) {
  const sections = page.sections.map((s, i) => ({ ...s, id: slug(s.h), color: STRIPE[(i + 1) % 8] }));
  return `${header()}

<section class="pol-hero">
  <div class="pol-hero-inner">
    <nav class="pol-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(page.crumb)}</span></nav>
    <h1>${esc(page.h1)}</h1>
    <p class="pol-updated">${esc(page.byline)}</p>
  </div>
  <div style="display:flex;height:5px">${RIBBON}</div>
</section>

<div class="pol-body">
  <div class="pol-wrap pol-wrap--single">
    <div class="pol-main">
      <p class="guide-tldr">${inline(page.tldr)}</p>
      ${page.intro.map(block).join('\n      ')}
      ${sections.map(s => `<section class="pol-section" id="${s.id}" style="--pol-accent:${s.color}" aria-labelledby="${s.id}-h">
        <h2 id="${s.id}-h">${esc(s.h)}</h2>
        ${s.body.map(block).join('\n        ')}
      </section>`).join('\n      ')}
      <p class="guide-cta"><a href="${esc(page.cta[1])}" class="btn-primary">${esc(page.cta[0])}</a></p>
    </div>
  </div>
</div>

${footer}`;
}

// JSON-LD for a guide: WebPage + ItemList of the product categories it links to.
// No Offer or price markup.
export function guideJsonLd(page) {
  const url = `${SITE_URL}/${page.out.replace(/\.html$/, '')}`;
  const abs = p => `${SITE_URL}/${p.replace(/\.html$/, '')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, headline: page.h1,
        description: page.description, inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'TAG-A-ROOM' },
        publisher: { '@type': 'Organization', name: 'TAG-A-ROOM', url: `${SITE_URL}/` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/${page.image}` },
        mainEntity: { '@id': `${url}#labels` },
      },
      {
        '@type': 'ItemList', '@id': `${url}#labels`, name: page.itemList.name,
        itemListElement: page.itemList.items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, url: abs(href) })),
      },
    ],
  };
}

export const storageUnitLabels = {
  out: 'storage-unit-labels.html',
  title: 'Color-Coded Storage Unit Labels | TAG-A-ROOM',
  description: 'Label boxes going into a storage unit so you can find things months later. Color by room or category, list contents, number boxes and post a legend.',
  crumb: 'Storage Unit Labels',
  h1: 'Color-Coded Labels for Storage Units',
  byline: 'From the TAG-A-ROOM team. Our color-coded labels are made in the USA.',
  image: 'assets/color-coding.webp',
  tldr: [{ b: 'The short version:' }, " Give each room or category one color, write what's inside before you tape the box, put labels on the sides (not just the top), number every box and keep a master list. Then post a legend at the front of the unit. That's the whole system, and TAG-A-ROOM labels are built for it."],
  intro: [
    ['img', { src: 'assets/color-coding.webp', alt: 'TAG-A-ROOM color coding labels', w: 1442, h: 1091 }],
    ['p', 'Boxes go into a storage unit fast. Getting something back out six months later is the hard part. A simple color-coded system tells you what\'s in each box and where it belongs before you ever lift a lid.'],
  ],
  sections: [
    { h: 'Why storage needs more than a marker', body: [
      ['p', 'A scribble on top of a box works until the box is stacked. In a storage unit nearly every box is stacked, pushed to the back or turned sideways. Labels that are bright, consistent and on more than one side are what keep a unit searchable.'],
      ['table', { head: ['', 'Black marker on the top', 'TAG-A-ROOM color system'], rows: [
        ['When boxes are stacked', 'Hidden', 'Color shows on the sides'],
        ['Reading from the aisle', 'Hard to read', 'Bright colors you can read from across the room'],
        ["What's inside", 'Whatever you scribbled', 'Box Content Labels with a short list'],
        ['Finding a box later', 'Open and check', 'Match the color, then the number on your list'],
      ] }],
    ] },
    { h: 'Step 1: Pick one color per room or category', body: [
      ['p', ['One room, one color. Kitchen is one color, garage another, holiday decorations another. ', { a: 'Color Coding Labels', href: 'shop/color-coding-labels.html' }, ' are made for exactly this.']],
      ['p', 'Storing between homes? Color by the room the box goes to in the new place. Storing long term? Color by category, like seasonal, keepsakes, files or tools.'],
    ] },
    { h: "Step 2: Say what's inside before the tape goes on", body: [
      ['p', ['Color tells you where a box belongs. ', { a: 'Box Content Labels', href: 'shop/box-content-labels.html' }, ' tell you what\'s in it. Write a short, specific list ("Christmas lights, tree stand, extension cords") instead of "misc."']],
      ['img', { src: 'assets/box-content.webp', alt: 'TAG-A-ROOM box content labels', w: 1317, h: 1194 }],
    ] },
    { h: 'Step 3: Label the sides, not just the top', body: [
      ['p', 'Top labels disappear the moment boxes are stacked. Put labels on two sides, or all four sides plus the top, so you can see the color from any angle.'],
      ['p', 'One customer\'s trick: "I put a sticker on a corner so it\'s visible from 2 sides at once."'],
    ] },
    { h: 'Step 4: Flag the boxes that need care', body: [
      ['p', [{ a: 'Alert Labels', href: 'shop/alert-labels.html' }, ' cover open first, do not load, fragile and caution. Flag the fragile boxes so they don\'t end up at the bottom of a stack, and mark the ones you\'ll want first.']],
    ] },
    { h: 'Step 5: Number every box and keep a master list', body: [
      ['p', 'Number each box and write down what\'s in each number. Customers do this already. One told us: "Now I have numbered all the boxes, added these colored labels and the category labels by Tag-a-Room, and written everything in a book." Another plans to use "a master sheet to confirm where each color goes." Snap a photo of the list so it\'s on your phone at the unit.'],
    ] },
    { h: 'Step 6: Post a legend at the unit door', body: [
      ['p', 'At a new home, a Legend Sheet at the front entrance shows movers the color for every room. A storage unit works the same way. Tape a legend inside the door with each color and what it means, and add a quick sketch of which colors sit along the back wall and which are near the front.'],
      ['img', { src: 'assets/door-ids.webp', alt: 'TAG-A-ROOM legend sheet and Door ID label posted at a doorway', w: 1033, h: 1522 }],
    ] },
    { h: 'Step 7: Load with the colors facing out', body: [
      ['ul', [
        'Keep an aisle down the middle if the unit is big enough.',
        'Group boxes by color so each category has its own zone.',
        'Put what you\'ll need first (seasonal, paperwork) near the door.',
        'Face the labeled sides toward the aisle.',
      ]],
    ] },
    { h: 'Which TAG-A-ROOM labels to use', body: [
      ['ul', [
        [{ b: [{ a: 'Tag-A-Room Moving Label Systems', href: 'shop/moving-label-systems.html' }, ':'] }, ' a complete color-coded set if you\'re packing a whole home.'],
        [{ b: [{ a: 'Color Coding Labels', href: 'shop/color-coding-labels.html' }, ':'] }, ' room or category colors.'],
        [{ b: [{ a: 'Box Content Labels', href: 'shop/box-content-labels.html' }, ':'] }, ' list what\'s inside.'],
        [{ b: [{ a: 'Alert Labels', href: 'shop/alert-labels.html' }, ':'] }, ' fragile and handling flags.'],
      ]],
      ['p', ['Packing boxes for storage too? Here\'s ', { a: 'how to properly pack a cardboard box for moving and storage', href: 'blog/properly-pack-a-cardboard-box-for-moving-storage.html' }, '. Need a custom or bulk order for a storage facility, apartment community or moving company? ', { a: 'Contact us', href: 'contact.html' }, '.']],
    ] },
    { h: 'Storage unit labeling FAQs', body: [
      ['faq', [
        ['What\'s the best way to label boxes for a storage unit?', 'One color per room or category, a contents list on each box, labels on at least two sides, and a numbered master list with a legend at the unit door.'],
        ['Should I color code by room or by category?', 'By room if the boxes are going into a new home soon. By category if you\'re storing for a long time or pulling things out seasonally.'],
        ['Where should labels go on a box?', 'On the sides as well as the top. A label on a corner shows on two sides at once.'],
        ['Are TAG-A-ROOM labels made in the USA?', 'Yes.'],
      ]],
    ] },
  ],
  cta: ['Shop color-coded labels', 'shop/color-coding-labels.html'],
  itemList: { name: 'Which TAG-A-ROOM labels to use', items: [
    ['Tag-A-Room Moving Label Systems', 'shop/moving-label-systems.html'],
    ['Color Coding Labels', 'shop/color-coding-labels.html'],
    ['Box Content Labels', 'shop/box-content-labels.html'],
    ['Alert Labels', 'shop/alert-labels.html'],
  ] },
};

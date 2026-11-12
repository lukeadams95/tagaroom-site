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
  if (type === 'ol') return `<ol>${content.map(i => `<li>${inline(i)}</li>`).join('')}</ol>`;
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
  const plain = x => (Array.isArray(x) ? x : [x]).map(part => {
    if (typeof part === 'string') return part;
    if (part.b !== undefined) return plain(part.b);
    return part.a || '';
  }).join('');
  const faqs = (page.sections || []).flatMap(s => s.body.filter(b => b[0] === 'faq').flatMap(b => b[1]));
  const graph = [
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
  ];
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: plain(a) },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
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

export const seniorMoveManagers = {
  out: 'for/senior-move-managers.html',
  title: 'Moving Labels for Senior Move Managers | TAG-A-ROOM',
  description: 'Color-coded moving labels for senior move managers. Room, content and alert labels that keep families, helpers and movers on one plan. Made in USA.',
  crumb: 'Senior Move Managers',
  h1: 'Moving Labels for Senior Move Managers',
  byline: 'From the TAG-A-ROOM team. Our color-coded labels are made in the USA.',
  image: 'assets/move-managers.webp',
  tldr: [{ b: 'The short version:' }, ' A senior move is weeks of sorting, not one truck and one day. Color and label each decision (keep, donate, sell, family, stay behind, first night) so helpers and movers can see the plan on the box.'],
  intro: [
    ['img', { src: 'assets/move-managers.webp', alt: 'A move manager organizing boxes with a client', w: 1536, h: 1024 }],
    ['p', 'A senior move is rarely one truck and one day. It is weeks of sorting a home someone has lived in for decades. Some things go to the new place, some go to family, some get donated or sold, and some stay behind. TAG-A-ROOM gives senior move managers a color and label system that makes each of those decisions visible on the box, so nobody has to remember what you said on Tuesday.'],
    ['p', ['Made in USA. Designed by real movers. ', { a: 'Shop move manager labels', href: 'shop/move-managers.html' }, '.']],
  ],
  sections: [
    { h: 'Why senior moves need a different label plan', body: [
      ['p', 'A standard move labels rooms. A senior move also labels decisions.'],
      ['ul', [
        [{ b: 'Keep, donate, sell or family. ' }, 'Sorting can run for weeks before move day. Labels keep those piles from blending together when a relative shows up to help.'],
        [{ b: 'Items that stay behind. ' }, 'Downsizing means a lot of things do not go on the truck. A "do not load" label tells the crew to leave it.'],
        [{ b: 'The first night. ' }, 'Medications, glasses, chargers, bedding and a change of clothes need to come off the truck first and be easy to find.'],
        [{ b: 'Lots of helpers. ' }, 'Adult children, neighbors, organizers and the moving crew all touch the boxes. Written labels hold up better than verbal instructions.'],
        [{ b: 'A calmer client. ' }, 'Your client can see the plan on every box instead of asking where things are going.'],
      ]],
      ['p', ['For the general move manager and organizer overview, see ', { a: 'labels for move managers', href: 'for/move-managers.html' }, '. This page walks through the senior downsizing workflow.']],
    ] },
    { h: 'How senior move managers use TAG-A-ROOM', body: [
      ['ol', [
        [{ b: 'Plan the new home first. ' }, 'Assign a color to each room in the new place before anything gets packed. A smaller home usually means fewer colors.'],
        [{ b: 'Label decisions while you sort. ' }, 'Room colors go on what is moving. Content labels mark donate, sell and family boxes. Blank labels cover anything special, like "Sentimental Items."'],
        [{ b: 'Flag what matters. ' }, 'Use "open first" for the first-night boxes, "fragile" for dishes and keepsakes, and "do not load" for things staying behind.'],
        [{ b: 'Label with your client. ' }, 'Decisions stick better when your client sees the color key and watches each box get its label.'],
        [{ b: 'Hand the same system to the movers. ' }, 'Crews match box colors to room colors at the new home instead of reading handwriting.'],
        [{ b: 'Unpack by priority. ' }, 'Open-first boxes and the bedroom and bathroom colors come first, so the first night feels like home.'],
      ]],
    ] },
    { h: 'Labels senior move managers reach for', body: [
      ['ul', [
        [{ b: [{ a: 'Color coding labels', href: 'shop/color-coding-labels.html' }, ':'] }, ' for room-by-room destination coding at the new home'],
        [{ b: [{ a: 'Box content labels', href: 'shop/box-content-labels.html' }, ':'] }, ' so helpers know what is inside, including donate boxes, without opening cartons'],
        [{ b: [{ a: 'Alert labels', href: 'shop/alert-labels.html' }, ':'] }, ' for open first, do not load, fragile and caution'],
        [{ b: [{ a: 'Move manager systems', href: 'shop/move-managers.html' }, ':'] }, ' when you want label packs built for organizers and move managers'],
        [{ b: [{ a: 'Moving label systems', href: 'shop/moving-label-systems.html' }, ':'] }, ' when you are putting together a full kit for a larger home'],
      ]],
      ['p', 'You can get professional packs custom branded with your company name. Families, community staff and movers then see your business on every box, which is good marketing on every job.'],
    ] },
    { h: 'Where this fits a senior transition', body: [
      ['ul', [
        'Downsizing from a long-time family home into a smaller house, condo or senior living community',
        'Estate and family moves where siblings split the work and the belongings',
        'Moves where you manage the sorting and a professional moving crew handles the truck',
        'Projects with a long sorting phase before a short move day',
      ]],
      ['p', ['Related reading: ', { a: 'Simplify Your Home Downsizing Journey with Tag-A-Room Moving Labels', href: 'blog/simplify-your-home-downsizing-journey-with-tag-a-room-moving-labels.html' }, '.']],
    ] },
    { h: 'Senior move manager labeling FAQs', body: [
      ['faq', [
        ['Are these labels only for professional movers?', ['No. TAG-A-ROOM makes label systems for professional movers, move managers, restoration companies, apartments and DIY families. Senior move managers usually start with the ', { a: 'move managers shop', href: 'shop/move-managers.html' }, ' and color coding labels.']],
        ['Can I put my company name on the labels?', 'Yes. Custom branding is offered on professional move organizer packs. Check the shop for current options.'],
        ['Do the labels work when family members help pack?', 'Yes. That is a big reason to use them. Family helpers follow colors and labels instead of a verbal list that changes during the day.'],
        ['How do I mark things that are not moving?', 'Use a "do not load" alert label. It tells the crew to leave the item, which matters on a downsizing move where a lot stays behind or goes to family later.'],
        ['Where should the labels go?', 'On boxes, plastic totes and storage bins. We suggest keeping them off wood furniture and painted surfaces.'],
        ['Do you ship nationwide?', 'Yes. TAG-A-ROOM is an online store that ships nationwide.'],
        ['How is this different from the general move managers page?', ['Labels for move managers covers organizers and move managers in general. This page is about senior transitions: sorting decisions, items that stay behind, first-night boxes and family helpers. See ', { a: 'labels for move managers', href: 'for/move-managers.html' }, '.']],
      ]],
    ] },
    { h: 'Get labels for your next senior move', body: [
      ['p', ['Pick a room color system, add content and alert labels, and put your name on every box. ', { a: 'Shop move manager labels', href: 'shop/move-managers.html' }, ' or ', { a: 'browse all products', href: 'shop/all-products.html' }, '. Hours: Monday through Friday, 9:00 am to 4:00 pm Central Time.']],
    ] },
  ],
  cta: ['Shop move manager labels', 'shop/move-managers.html'],
  itemList: { name: 'Labels senior move managers reach for', items: [
    ['Color Coding Labels', 'shop/color-coding-labels.html'],
    ['Box Content Labels', 'shop/box-content-labels.html'],
    ['Alert Labels', 'shop/alert-labels.html'],
    ['Move manager systems', 'shop/move-managers.html'],
    ['Moving label systems', 'shop/moving-label-systems.html'],
  ] },
};

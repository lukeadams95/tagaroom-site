// Partner offer posts from the old WordPress site, restored at their original URLs
// (tagaroom.com/<slug>/; offer cards and partners link to them).
// Each old post was only an offer image. Those images are not in the Wayback Machine
// and the old site is suspended, so each page shows the post's title, date, tags and
// the offer partner (from the old post and its image file name) instead.
// When an image is recovered, save it in design/media/ and set `img` to its old URL.

const PHONE = '(210) 564-0147';
const DETAILS = `For current offer details, call TAG-A-ROOM at ${PHONE}.`;

export const OFFERS = [
  {
    slug: '10-off-moving-supplies', title: '10% OFF MOVING SUPPLIES', date: 'April 25, 2022',
    pageTitle: '10% Off Moving Supplies | TAG-A-ROOM',
    description: 'Special offer: 10% off moving supplies from TAG-A-ROOM®, the original color-coded moving and storage label system.',
    oldImage: 'https://tagaroom.com/wp-content/uploads/2022/04/Tag-A-Room_special-offer.jpg',
    blocks: [
      ['p', '10% off moving supplies from TAG-A-ROOM®, the original color-coded moving and storage label system.'],
      ['p', 'Tags: Austin, Corpus Christi, Dallas, Fort Worth, Houston, San Antonio'],
      ['note', DETAILS],
    ],
    cta: ['Shop Moving Supplies', 'shop/all-products.html'],
  },
  {
    slug: '50-00-off-ship-n-crate', title: '$50.00 OFF SHIP-N- CRATE', date: 'April 25, 2022',
    pageTitle: '$50.00 Off Ship-n-Crate | TAG-A-ROOM',
    description: 'Special offer: $50.00 off with Ship-n-Crate, professional shipping and crating services and a TAG-A-ROOM® Moving Coach partner.',
    oldImage: 'https://tagaroom.com/wp-content/uploads/2022/04/Ship-and-Crate_special-offer-1.jpg',
    blocks: [
      ['p', '$50.00 off with Ship-n-Crate, professional shipping and crating services and a TAG-A-ROOM® Moving Coach partner.'],
      ['p', 'Tags: Corpus Christi, San Antonio'],
      ['note', DETAILS],
    ],
    cta: ['Visit Ship-n-Crate', 'https://shipandcrate.com/'],
  },
  {
    slug: '25-00-off-junkluggers', title: '$25.00 OFF JUNKLUGGERS', date: 'April 26, 2022',
    pageTitle: '$25.00 Off Junkluggers | TAG-A-ROOM',
    description: 'Special offer: $25.00 off junk removal with The Junkluggers, shared by TAG-A-ROOM®, the original color-coded moving label system.',
    oldImage: 'https://tagaroom.com/wp-content/uploads/2022/04/Junkluggers_special-offer.jpg',
    blocks: [
      ['p', '$25.00 off with The Junkluggers.'],
      ['note', DETAILS],
    ],
    cta: ['Visit The Junkluggers', 'https://www.junkluggers.com/'],
  },
  {
    slug: '50-off-moving-services', title: '$50 Off Moving Services', date: 'April 26, 2022',
    pageTitle: '$50 Off Moving Services | TAG-A-ROOM',
    description: 'Special offer: $50 off moving services with Half Price Movers, shared by TAG-A-ROOM®, the original color-coded moving label system.',
    oldImage: 'https://tagaroom.com/wp-content/uploads/2022/04/half-price-movers-special-offer.jpg',
    blocks: [
      ['p', '$50 off moving services with Half Price Movers.'],
      ['note', DETAILS],
    ],
    cta: ['Visit Half Price Movers', 'https://www.halfpricemovers.com/'],
  },
  {
    slug: 'house-and-carpet-cleaning', title: 'HOUSE AND CARPET CLEANING', date: 'April 26, 2022',
    pageTitle: 'House and Carpet Cleaning Offer | TAG-A-ROOM',
    description: 'Special offer on house and carpet cleaning from Pegasus Carpet Cleaning, shared by TAG-A-ROOM®, the original color-coded moving label system.',
    oldImage: 'https://tagaroom.com/wp-content/uploads/2022/04/pegasus-carpet-cleaning-special-offer.jpg',
    blocks: [
      ['p', 'A special offer on house and carpet cleaning from Pegasus Carpet Cleaning.'],
      ['note', DETAILS],
    ],
    cta: null,
  },
];

const CTA = '<sc-if value="{{ hasCta }}"><p style="margin:8px 0 0"><a href="{{ ctaHref }}" target="{{ ctaTarget }}" rel="noopener" class="btn-primary" style="display:inline-block;background:#0169B8;color:#fff;font-weight:700;padding:14px 26px;border-radius:10px;font-size:17px">{{ ctaText }}</a></p></sc-if>';

export const offerPatches = {
  template: [
    ['letter-spacing:.18em;text-transform:uppercase;padding:8px 20px;border-radius:30px;margin-bottom:22px">Moving Tip</span>', 'letter-spacing:.18em;text-transform:uppercase;padding:8px 20px;border-radius:30px;margin-bottom:22px">Special Offer</span>'],
    ['  </sc-for>\n</article></div>', `  </sc-for>\n  ${CTA}\n</article></div>`],
  ],
};

export const offerPages = () => OFFERS.map(o => {
  const post = { title: o.title, date: o.date, blocks: o.blocks, ...(o.img ? { img: o.img } : {}) };
  const ext = o.cta && /^https?:/.test(o.cta[1]);
  return {
    design: 'Blog Post', out: `${o.slug}/index.html`, title: o.pageTitle, description: o.description, ogType: 'article', image: o.img,
    state: { post, slug: o.slug, loaded: true },
    extraVals: { hasCta: !!o.cta, ctaText: o.cta ? o.cta[0] : '', ctaHref: o.cta ? o.cta[1] : '', ctaTarget: ext ? '_blank' : '_self' },
    patches: offerPatches,
  };
});

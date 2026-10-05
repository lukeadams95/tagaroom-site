// Site map: which design file renders to which output page, and how the
// prototype's *.dc.html links translate to real URLs.

export const ECWID_STORE_ID = 1805034;

// Shop pages share one design template (All Products.dc.html); only the slug differs.
export const SHOP = [
  ['all', 'All Products', 'all-products'],
  ['moving-label-systems', 'Moving Label Systems'],
  ['moving-packing-labels', 'Moving and Packing Labels'],
  ['box-content-labels', 'Box Content Labels'],
  ['marketing-gifts', 'Marketing Gifts'],
  ['office-labels', 'Office Labels and Supplies'],
  ['alert-labels', 'Alert Labels'],
  ['shipping-labels', 'Shipping Labels'],
  ['color-coding-labels', 'Color Coding Labels'],
  ['professional-movers', 'Professional Movers'],
  ['realtors', 'Realtors'],
  ['mortgage-companies', 'Mortgage Companies'],
  ['restoration-companies', 'Restoration Companies'],
  ['move-managers', 'Move Managers'],
  ['apartments', 'Apartments and Property Managers'],
  ['diy-families', 'Do-It-Yourself Families'],
].map(([slug, design, file]) => ({ slug, design, out: `shop/${file || slug}.html` }));

export const AUDIENCES = [
  ['For Professional Movers', 'professional-movers'],
  ['For Realtors', 'realtors'],
  ['For Mortgage Companies', 'mortgage-companies'],
  ['For Restoration Companies', 'restoration-companies'],
  ['For Move Managers and Organizers', 'move-managers'],
  ['For Apartments and Property Managers', 'apartments'],
  ['For DIY Families', 'diy-families'],
].map(([design, slug]) => ({ design, out: `for/${slug}.html` }));

const PAGE_FILES = {
  'Homepage': 'index.html',
  'About Us': 'about.html',
  'Contact Us': 'contact.html',
  'Cart': 'cart.html',
  'Gallery': 'gallery.html',
  'Label Benefits': 'label-benefits.html',
  'Label Templates': 'label-templates.html',
  'Moving Tips': 'moving-tips.html',
  'Blog': 'blog.html',
};
for (const s of SHOP) PAGE_FILES[s.design] = s.out;
for (const a of AUDIENCES) PAGE_FILES[a.design] = a.out;

export const CART = 'cart.html';

// Translate a link from the design into a root-relative site path.
export function mapLink(href) {
  if (!href) return href;
  // Every cart entry point goes to the custom cart page.
  if (/(^|\.dc\.html)#!\/~\/cart$/.test(decodeURI(href)) || href === '#!/~/cart') return CART;
  const m = decodeURI(href).match(/^(?:\.\.\/)?([^?#]+)\.dc\.html(\?[^#]*)?(#.*)?$/);
  if (!m) return href;
  const [, name, query = '', hash = ''] = m;
  if (name === 'Blog Post') {
    const slug = new URLSearchParams(query).get('post');
    return `blog/${slug}.html${hash}`;
  }
  const out = PAGE_FILES[name];
  if (!out) throw new Error(`No page mapped for design link "${href}"`);
  return out + query + hash;
}

export const NAV = [
  { t: 'Products', href: 'shop/all-products.html', w: 380, groups: [
    [['All Products', 'shop/all-products.html']],
    [['Tag-A-Room Moving Label Systems', 'shop/moving-label-systems.html'], ['Moving & Packing Labels', 'shop/moving-packing-labels.html'], ['Box Content Labels', 'shop/box-content-labels.html'], ['Marketing Gifts – Loan Officers, Realtors, Moving Companies', 'shop/marketing-gifts.html'], ['Office Labels & Supplies', 'shop/office-labels.html'], ['Alert Labels', 'shop/alert-labels.html'], ['Shipping Labels', 'shop/shipping-labels.html'], ['Color Coding Labels', 'shop/color-coding-labels.html']],
    [['Professional Movers', 'shop/professional-movers.html'], ['Realtors', 'shop/realtors.html'], ['Mortgage Companies', 'shop/mortgage-companies.html'], ['Restoration Companies', 'shop/restoration-companies.html'], ['Move Managers – Organizers', 'shop/move-managers.html'], ['Apartments – Property Managers', 'shop/apartments.html'], ['Do-It-Yourself Families', 'shop/diy-families.html']],
  ] },
  { t: 'Label Benefits', href: 'label-benefits.html', w: 320, groups: [
    [['All Label Benefits', 'label-benefits.html']],
    [['Professional Movers', 'for/professional-movers.html'], ['Realtors', 'for/realtors.html'], ['Mortgage Companies', 'for/mortgage-companies.html'], ['Restoration Companies', 'for/restoration-companies.html'], ['Move Managers – Organizers', 'for/move-managers.html'], ['Apartments – Property Managers', 'for/apartments.html'], ['Do-It-Yourself Families', 'for/diy-families.html']],
  ] },
  { t: 'Templates', href: 'label-templates.html' },
  { t: 'About Us', href: 'about.html', w: 220, groups: [
    [['About Us', 'about.html']],
    [['Blog', 'blog.html'], ['Gallery', 'gallery.html'], ['Moving Tips', 'moving-tips.html']],
  ] },
  { t: 'Contact', href: 'contact.html' },
];

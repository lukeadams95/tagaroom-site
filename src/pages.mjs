// Page list. Each entry renders one design file; `patches` are small,
// explicit edits applied to the design source before rendering (they fail
// the build if the design changes underneath them).

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDesign, evalVals, patch } from './lib/dc.mjs';
import { ECWID_CONFIG } from './partials.mjs';
import { policyPage } from './policy.mjs';
import storePolicies from './policies/store.mjs';
import shippingPolicy from './policies/shipping.mjs';
import returnPolicy from './policies/returns.mjs';
import { SHOP, AUDIENCES, ECWID_STORE_ID } from './site.mjs';

const T = s => `${s} | TAG-A-ROOM`;

const footerPatches = {
  template: [
    ['<a href="#" aria-label="TAG-A-ROOM home"', '<a href="index.html" aria-label="TAG-A-ROOM home"'],
    ['<a href="#" aria-label="Instagram"', '<a href="https://www.instagram.com/tagaroom/" target="_blank" rel="noopener" aria-label="Instagram"'],
    ['<a href="#" aria-label="Facebook"', '<a href="https://www.facebook.com/tagaroom/" target="_blank" rel="noopener" aria-label="Facebook"'],
    ['<sc-for list="{{ company }}" as="n" hint-placeholder-count="5"><a href="#"', '<sc-for list="{{ company }}" as="n" hint-placeholder-count="5"><a href="{{ n.href }}"'],
    ['<sc-for list="{{ policies }}" as="n" hint-placeholder-count="3"><a href="#"', '<sc-for list="{{ policies }}" as="n" hint-placeholder-count="3"><a href="{{ n.href }}"'],
    ['style-hover="color:#014F8A">{{ n }}</a></sc-for></div>\n      <h4', 'style-hover="color:#014F8A">{{ n.t }}</a></sc-for></div>\n      <h4'],
    ['style-hover="color:#014F8A">{{ n }}</a></sc-for></div>\n    </div>\n  </div>', 'style-hover="color:#014F8A">{{ n.t }}</a></sc-for></div>\n    </div>\n  </div>'],
  ],
  script: [
    ["company: ['About', 'Blog', 'Gallery', 'Templates', 'Contact'],", "company: [['About', 'About%20Us.dc.html'], ['Blog', 'Blog.dc.html'], ['Gallery', 'Gallery.dc.html'], ['Templates', 'Label%20Templates.dc.html'], ['Contact', 'Contact%20Us.dc.html']].map(([t, href]) => ({ t, href })),"],
    ["policies: ['Shipping', 'Returns', 'General']", "policies: [['Shipping', 'shipping-policies.html'], ['Returns', 'return-policies.html'], ['General', 'policies.html']].map(([t, href]) => ({ t, href }))"],
  ],
};

const POST = slug => `Blog%20Post.dc.html?post=${slug}`;
const FOR = ['For Professional Movers', 'For Realtors', 'For Mortgage Companies', 'For Restoration Companies', 'For Move Managers and Organizers', 'For Apartments and Property Managers', 'For DIY Families'].map(n => encodeURI(n) + '.dc.html');

const home = {
  design: 'Homepage', out: 'index.html', scripts: ['js/home.js'], ecwid: 'preconnect',
  title: 'TAG-A-ROOM® | Professional Color-Coded Moving Labels',
  description: 'TAG-A-ROOM®, the original creator of the color-coded moving and storage label system. Professional moving labels trusted by movers and real estate pros. Made in USA, veteran packaged.',
  patches: {
    template: [
      // Inline store view (hidden until a shop link is used) and the normal homepage.
      ['<div style="display:{{ storeDisplay }};background:#fff">', '<div data-store-view hidden style="background:#fff">'],
      ['<div style="display:{{ homeDisplay }}">', '<div data-home-view>'],
      ['<div ref="{{ vpRef }}" style=', '<div data-marquee style='],
      ['<div ref="{{ trackRef }}" style=', '<div data-marquee-track style='],
      ['<div ref="{{ revRef }}" style=', '<div data-rev-track style='],
      ['“{{ r.body }}”', '“<span data-short>{{ r.s }}</span><span data-full hidden>{{ r.f }}</span>”'],
      // Category grid columns depended on window width; CSS media queries now.
      ['"><div style="display:grid;grid-template-columns:{{ catCols }};', '"><div class="home-cat-grid" style="display:grid;'],
      ['<span style="min-width:36px;text-align:center;font-weight:700;font-size:18px">{{ qty }}</span>', '<span data-qty aria-live="polite" style="min-width:36px;text-align:center;font-weight:700;font-size:18px">{{ qty }}</span>'],
      // Placeholder links in the design that have real destinations now.
      ['<a href="#" style="display:flex;flex-direction:column;align-items:center;gap:18px;width:140px', '<a href="{{ a.href }}" style="display:flex;flex-direction:column;align-items:center;gap:18px;width:140px'],
      // Moving tips: three videos from the Moving Tips page instead of blog cards.
      ['<a href="#" style="font-weight:700">View all posts →</a>', '<a href="Moving%20Tips.dc.html" style="font-weight:700">View all moving tips →</a>'],
      ['    <sc-for list="{{ posts }}" as="p" hint-placeholder-count="4">\n      <article style="background:#fff;border:1px solid #E3E8EE;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s" style-hover="transform:translateY(-4px);box-shadow:0 12px 28px rgba(20,32,46,.14)">\n        <div style="aspect-ratio:16/10;background:#fff center/cover no-repeat;background-image:url({{ p.img }})"></div>\n        <div style="padding:22px;display:flex;flex-direction:column;flex:1;gap:14px">\n          <h3 style="font-family:\'Archivo\',sans-serif;font-style:italic;font-weight:900;font-size:22px;line-height:1.15;margin:0;letter-spacing:-.01em;flex:1">{{ p.t }}</h3>\n          <a href="#" style="font-weight:700;font-size:15px">Read More →</a>\n        </div>\n      </article>\n    </sc-for>', '    <sc-for list="{{ videos }}" as="v">\n      <article style="background:#fff;border:1px solid #E3E8EE;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s" style-hover="transform:translateY(-4px);box-shadow:0 12px 28px rgba(20,32,46,.14)">\n        <button type="button" data-yt="{{ v.id }}" aria-label="Play video: {{ v.t }}" style="position:relative;display:block;width:100%;aspect-ratio:16/9;padding:0;border:0;cursor:pointer;background:#111111 center/cover no-repeat;background-image:url(https://i.ytimg.com/vi/{{ v.id }}/hqdefault.jpg)" style-hover="filter:brightness(1.08)"><span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:#0169B8;box-shadow:0 0 0 5px rgba(255,255,255,.85),0 6px 18px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l10.5-6.5z"/></svg></span></button>\n        <div style="padding:22px;display:flex;flex-direction:column;flex:1;gap:8px">\n          <h3 style="font-family:\'Archivo\',sans-serif;font-style:italic;font-weight:900;font-size:22px;line-height:1.15;margin:0;letter-spacing:-.01em">{{ v.t }}</h3>\n          <p style="margin:0;font-size:16px;line-height:1.5;color:#4A5A6C">{{ v.s }}</p>\n        </div>\n      </article>\n    </sc-for>'],
      ['<a href="#" style="font-weight:700;font-size:16px;border-bottom:2px solid #0169B8;padding-bottom:2px">Read Our Story →</a>', '<a href="About%20Us.dc.html" style="font-weight:700;font-size:16px;border-bottom:2px solid #0169B8;padding-bottom:2px">Read Our Story →</a>'],
    ],
    script: [
      // Shop links go to the designed shop pages (hero, store, CTA band) rather
      // than the bare inline store the design opened on the homepage.
      [".map(([s, id]) => '#!/' + s + '/c/' + id);", `.map((_, i) => ${JSON.stringify(SHOP.slice(1).map(s => encodeURI(s.design) + '.dc.html'))}[i]);`],
      ["const ALL = '#!/~/shop', PROD = '#!/Open-First-Dont-Load-Labels-125-Count/p/62956784';", "const ALL = 'All%20Products.dc.html', PROD = 'All%20Products.dc.html?product=62956784';"],
      // Video list for the homepage's Moving tips section (from the Moving Tips page).
      ['      posts: [', `      videos: [
        { id: 'Yz5mXi67MqM', t: 'An Organized Move Is a Better Move', s: 'How the color-coded system keeps every move on track.' },
        { id: '9D-xltneVdU', t: 'Door ID Labels', s: 'Tag each doorway so movers match boxes to rooms.' },
        { id: 'XBRzcpzmUfM', t: 'Start Early', s: 'Begin packing weeks ahead, starting with rooms you use least.' }
      ],
      posts: [`],
      ['return { t: r.t, n: r.n, body:', 'return { t: r.t, n: r.n, s: r.s, f: r.f, body:'],
      ['audiences: audNames.map((t, i) => ({ t, ', `audiences: audNames.map((t, i) => ({ t, href: ${JSON.stringify(FOR)}[i], `],
      ["img: 'assets/blog-checklist.png' }", `img: 'assets/blog-checklist.png', href: '${POST('complete-interstate-moving-checklist-2026')}' }`],
      ["img: 'assets/blog-gift-guide.png' }", `img: 'assets/blog-gift-guide.png', href: '${POST('realtor-closing-gift-guide-practical-moving-solutions')}' }`],
      ["img: 'assets/blog-labels.png' }", `img: 'assets/blog-labels.png', href: '${POST('properly-pack-a-cardboard-box-for-moving-storage')}' }`],
      ["img: 'assets/blog-boxes.png' }", `img: 'assets/blog-boxes.png', href: '${POST('the-stress-free-move-why-color-coded-labels-are-a-game-changer-for-your-new-home')}' }`],
    ],
  },
};

// All 16 shop pages render All Products.dc.html with a different slug.
const shopPatches = {
  template: [
    ['<div id="my-store-1805034"></div>', '<div id="my-store-1805034" data-category="{{ catId }}"></div>'],
    // Ecwid's featured products are re-rendered by shop.js from this template.
    ['<sc-if value="{{ hasFeatured }}" hint-placeholder-val="{{ false }}">\n<div style="background:#F5F7FA', '<sc-if value="{{ hasFeatured }}">\n<div data-featured hidden style="background:#F5F7FA'],
    ['<sc-for list="{{ featured }}" as="f" hint-placeholder-count="1">', '<template data-featured-tpl><sc-for list="{{ featured }}" as="f">'],
    ['  </sc-for>\n</section></div>\n</sc-if>', '  </sc-for></template>\n</section></div>\n</sc-if>'],
  ],
  script: [
    ["const s = 'all';", 'const s = this.props.slug;'],
    ['title: pg.t, tagline: pg.g,', 'title: pg.t, catId: pg.id || \'\', tagline: pg.g,'],
  ],
};
const FEATURED_TOKEN = { id: 0, title: '__TITLE__', href: '#', img: '', price: '__PRICE__' };

const cartPatches = {
  template: [
    // Both cart states render; cart.js shows the right one once Ecwid reports the cart.
    ['<sc-if value="{{ hasItems }}" hint-placeholder-val="{{ true }}"><p style=', '<sc-if value="{{ true }}"><p data-count-label style='],
    ['<sc-if value="{{ hasItems }}" hint-placeholder-val="{{ true }}">\n<section style="max-width:1240px;margin:0 auto;padding:28px 24px {{ bottomPad }}">', '<sc-if value="{{ true }}">\n<section data-cart-full hidden style="max-width:1240px;margin:0 auto;padding:28px 24px 0">'],
    ['<sc-if value="{{ isEmpty }}" hint-placeholder-val="{{ false }}">\n<section style=', '<sc-if value="{{ true }}">\n<section data-cart-empty hidden style='],
    ['<section style="max-width:1240px;margin:0 auto;padding:clamp(40px,6vw,72px) 24px {{ bottomPad2 }}">', '<section data-cross style="max-width:1240px;margin:0 auto;padding:clamp(40px,6vw,72px) 24px 72px">'],
    ['<sc-for list="{{ lines }}" as="it" hint-placeholder-count="3">', '<template data-line-tpl><sc-for list="{{ lines }}" as="it">'],
    ['        </sc-for>\n      </div>\n      <a href="All%20Products.dc.html"', '        </sc-for></template>\n      </div>\n      <a href="All%20Products.dc.html"'],
    ['<p style="margin:0 0 12px;font-weight:700;font-size:17px">{{ shipMsg }}</p>', '<p data-ship-msg style="margin:0 0 12px;font-weight:700;font-size:17px">{{ shipMsg }}</p>'],
    ['<div style="{{ barStyle }}"></div>', '<div data-ship-bar style="{{ barStyle }}"></div>'],
    ['<b style="font-weight:700">{{ subtotal }}</b>', '<b data-subtotal style="font-weight:700">{{ subtotal }}</b>'],
    ['<b style="font-weight:700;color:{{ shipColor }}">{{ shipVal }}</b>', '<b data-ship-val style="font-weight:700;color:{{ shipColor }}">{{ shipVal }}</b>'],
    ['<b style="font-weight:800;font-size:32px">{{ total }}</b>', '<b data-total style="font-weight:800;font-size:32px">{{ total }}</b>'],
    ['<b style="font-weight:800;font-size:24px">{{ total }}</b>', '<b data-total style="font-weight:800;font-size:24px">{{ total }}</b>'],
    ['<sc-if value="{{ promoOpen }}" hint-placeholder-val="{{ false }}">\n          <div style=', '<sc-if value="{{ true }}">\n          <div data-promo hidden style='],
    ['<sc-if value="{{ promoMsg }}" hint-placeholder-val="{{ false }}"><p style=', '<sc-if value="{{ true }}"><p data-promo-msg hidden style='],
    ['<a href="#" style="margin-top:20px;display:flex', '<a href="#" data-checkout style="margin-top:20px;display:flex'],
    ['<sc-if value="{{ showBar }}" hint-placeholder-val="{{ false }}">\n  <div style=', '<sc-if value="{{ true }}">\n  <div data-mobile-bar hidden style='],
    ['<a href="#" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:50px', '<a href="#" data-checkout style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:50px'],
    // Cross-sell cards link to the category instead of adding a guessed product.
    ['<span style="font-weight:800;font-size:18px;margin-bottom:14px">{{ p.price }}</span>', '<span style="font-size:15px;color:#4A5A6C;margin-bottom:14px">{{ p.variant }}</span>'],
    ['<button onClick="{{ p.add }}" style="margin-top:auto;height:42px;', '<a href="{{ p.href }}" style="margin-top:auto;height:42px;display:flex;align-items:center;justify-content:center;'],
    ['cursor:pointer" style-hover="background:#0169B8;color:#fff">Add to Cart</button>', 'cursor:pointer" style-hover="background:#0169B8;color:#fff">Shop Now</a>'],
    // Ecwid's checkout runs in this container when the visitor checks out.
    ['<dc-import name="Footer"', '<div data-checkout-view hidden style="background:#fff"><main style="max-width:1240px;margin:0 auto;padding:28px 24px clamp(56px,8vw,96px)"><a href="cart.html" style="display:inline-block;font-weight:700;font-size:15px;margin-bottom:20px">&larr; Back to cart</a><div id="my-store-1805034"></div></main></div>\n<dc-import name="Footer"'],
  ],
  script: [
    ['name: p.name, price: this.money(p.price),', 'name: p.name, variant: p.variant, href: p.href, price: this.money(p.price),'],
  ],
};
const CART_TOKEN = [{ id: 'tpl', name: '__NAME__', variant: '__VARIANT__', price: 0, qty: 1, img: '', badge: 'Made in USA', href: '#' }];

// Blog posts: Previous / Next links under the article.
const postPatches = {
  template: [
    ['  </sc-for>\n</article></div>', `  </sc-for>
  <nav aria-label="More posts" style="display:flex;flex-wrap:wrap;gap:16px;margin-top:48px;padding-top:32px;border-top:1px solid #E3E8EE">
    <sc-if value="{{ hasPrev }}"><a href="{{ prev.href }}" rel="prev" style="flex:1 1 260px;display:flex;flex-direction:column;gap:8px;padding:20px 22px;background:#fff;border:2px solid #E3E8EE;border-radius:16px;color:#111111;box-shadow:0 2px 10px rgba(17,17,17,.05)" style-hover="border-color:#0169B8;color:#0169B8"><span style="font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#0169B8">&larr; Previous post</span><span style="font-style:italic;font-weight:900;font-size:19px;line-height:1.2;text-transform:uppercase;letter-spacing:-.01em">{{ prev.t }}</span></a></sc-if>
    <sc-if value="{{ hasNext }}"><a href="{{ next.href }}" rel="next" style="flex:1 1 260px;display:flex;flex-direction:column;align-items:flex-end;text-align:right;gap:8px;padding:20px 22px;background:#fff;border:2px solid #E3E8EE;border-radius:16px;color:#111111;box-shadow:0 2px 10px rgba(17,17,17,.05)" style-hover="border-color:#0169B8;color:#0169B8"><span style="font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#0169B8">Next post &rarr;</span><span style="font-style:italic;font-weight:900;font-size:19px;line-height:1.2;text-transform:uppercase;letter-spacing:-.01em">{{ next.t }}</span></a></sc-if>
  </nav>
</article></div>`],
  ],
};

const config = { ecwidConfig: ECWID_CONFIG, ecwidStoreId: ECWID_STORE_ID, freeShippingThreshold: 75, contactEndpoint: '', contactEmail: 'info@tagaroom.com', categoryPages: {} };

function shopPages() {
  const d = readDesign(fileURLToPath(new URL('../design/All Products.dc.html', import.meta.url)));
  const script = patch(d.script, shopPatches.script);
  return SHOP.map(s => {
    const v = evalVals(script, { props: { slug: s.slug } });
    // Ecwid category id → its official page, so store navigation lands on the designed page.
    if (v.catId) config.categoryPages[v.catId] = s.out;
    return {
      design: 'All Products', out: s.out, title: T(v.title), description: v.tagline,
      props: { slug: s.slug }, state: { featured: [FEATURED_TOKEN] }, patches: shopPatches, scripts: ['js/shop.js'], ecwid: 'eager',
    };
  });
}

function list() {
  const pages = [
    home,
    ...shopPages(),
    { design: 'Cart', out: 'cart.html', title: T('Your Cart'), scripts: ['js/cart.js'], ecwid: 'eager', patches: cartPatches,
      state: { items: CART_TOKEN }, props: { freeShippingThreshold: 75 } },
    { design: 'About Us', out: 'about.html', title: T('About Us'),
      description: 'TAG-A-ROOM®: the original color-coded moving and storage label system, built by a mover, packed by veterans and trusted nationwide.' },
    { design: 'Label Benefits', out: 'label-benefits.html', title: T('Label Benefits'),
      description: 'Color-coded labels tell movers exactly where every box goes, so unloading is faster, less gets lost and moving day is calmer.' },
    { design: 'Label Templates', out: 'label-templates.html', title: T('Label Templates'),
      description: 'Free printable label templates for TAG-A-ROOM circle and rectangle labels.' },
  ];
  for (const a of AUDIENCES) pages.push({ design: a.design, out: a.out, title: T(a.design) });

  pages.push({
    design: 'Contact Us', out: 'contact.html', title: T('Contact Us'), scripts: ['js/contact.js'],
    description: 'Questions about TAG-A-ROOM labels, bulk pricing or custom branding? Call (210) 564-0147 or send our San Antonio team a message.',
    patches: { template: [
      // Render the success message, error line and FAQ answers hidden; contact.js reveals them.
      ['<sc-if value="{{ sent }}" hint-placeholder-val="{{ false }}">\n        <div style="text-align:center', '<sc-if value="{{ true }}">\n        <div data-form-sent hidden style="text-align:center'],
      ['<sc-if value="{{ notSent }}" hint-placeholder-val="{{ true }}">', '<sc-if value="{{ true }}">'],
      ['<sc-if value="{{ hasErr }}" hint-placeholder-val="{{ false }}"><p style=', '<sc-if value="{{ true }}"><p data-form-error hidden style='],
      ['<sc-if value="{{ q.open }}" hint-placeholder-val="{{ false }}">\n          <p style=', '<sc-if value="{{ true }}">\n          <p data-faq-answer hidden style='],
      ['<path d="M12 5v14" style="{{ q.vstyle }}">', '<path d="M12 5v14" data-faq-v>'],
    ] },
  });

  pages.push({
    design: 'Gallery', out: 'gallery.html', title: T('Gallery'), scripts: ['js/gallery.js'], state: { i: 0 },
    description: 'Photos of TAG-A-ROOM color-coded moving labels in real moves, warehouses and stores.',
    patches: { template: [
      ['<sc-if value="{{ lbOpen }}" hint-placeholder-val="{{ false }}">\n  <div onClick="{{ close }}"', '<sc-if value="{{ lbOpen }}">\n  <div data-lightbox hidden role="dialog" aria-modal="true" aria-label="Photo viewer" onClick="{{ close }}"'],
      ['<div role="img" aria-label="Gallery photo" style="{{ lbStyle }}">', '<div role="img" aria-label="Gallery photo" data-lb-img style="{{ lbStyle }}">'],
      ['<span style="position:absolute;bottom:16px', '<span data-lb-count style="position:absolute;bottom:16px'],
    ] },
  });

  pages.push({
    design: 'Moving Tips', out: 'moving-tips.html', title: T('Moving Tips'), scripts: ['js/tips.js'],
    description: 'Short how-to videos from professional movers: planning, labeling, packing, loading and moving big items.',
    patches: { template: [
      ['<sc-for list="{{ groups }}" as="g" hint-placeholder-count="5">\n    <div>', '<sc-for list="{{ groups }}" as="g" hint-placeholder-count="5">\n    <div data-group="{{ g.name }}">'],
    ] },
  });

  // Blog index: one static page per 9 posts.
  const posts = JSON.parse(fs.readFileSync(new URL('../design/blog-posts.json', import.meta.url), 'utf8'));
  const imgs = Object.fromEntries(Object.entries(posts).filter(([, p]) => p.img).map(([k, p]) => [k, p.img]));
  const blogPages = Math.ceil(Object.keys(posts).length / 9);
  for (let pg = 1; pg <= blogPages; pg++) {
    pages.push({
      design: 'Blog', out: pg === 1 ? 'blog.html' : `blog-${pg}.html`, title: T(pg === 1 ? 'Blog' : `Blog – Page ${pg}`),
      description: 'Moving tips, packing guides and color-coded labeling advice from the TAG-A-ROOM team.',
      state: { pg, imgs },
      patches: {
        template: [
          ['<button onClick="{{ g.go }}" aria-label="Page {{ g.n }}" style="', '<a href="{{ g.href }}#posts" aria-label="Page {{ g.n }}" style="display:inline-flex;align-items:center;justify-content:center;'],
          ['>{{ g.n }}</button>', '>{{ g.n }}</a>'],
        ],
        script: [['go: () =>', "href: i === 0 ? 'Blog.dc.html' : 'blog-' + (i + 1) + '.html', go: () =>"]],
      },
    });
  }

  // One static page per post (the design loads them at runtime from blog-posts.json).
  // Policy pages share PolicyLayout (src/policy.mjs); no CTA band.
  for (const pol of [storePolicies, shippingPolicy, returnPolicy]) {
    pages.push({
      out: pol.out, title: pol.pageTitle, description: pol.description, scripts: ['js/policy.js'],
      render: ({ renderComponent }) => policyPage(pol, { footer: renderComponent('Footer', { patches: footerPatches }) }),
    });
  }

  // Previous / Next follow the blog listing's order (newest first).
  const order = Object.entries(posts);
  const near = i => (order[i] ? { href: POST(order[i][0]), t: order[i][1].title } : null);
  order.forEach(([slug, post], i) => {
    const first = post.blocks.find(b => b[0] === 'p');
    const prev = near(i - 1), next = near(i + 1);
    pages.push({
      design: 'Blog Post', out: `blog/${slug}.html`, title: T(post.title),
      description: first ? first[1].slice(0, 155).replace(/\s+\S*$/, '') + '…' : '',
      state: { post, slug, loaded: true },
      extraVals: { prev, next, hasPrev: !!prev, hasNext: !!next },
      patches: postPatches,
    });
  });
  return pages;
}

export const PAGES = {
  list,
  footerPatches,
  config,
};

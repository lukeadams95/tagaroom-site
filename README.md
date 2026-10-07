# TAG-A-ROOM® Website

The TAG-A-ROOM site, built from the Claude Design project. The published site is
plain static HTML/CSS/JS in `docs/` (GitHub Pages serves it from there). The shop,
cart and checkout run on the live Ecwid store (#1805034).

```
design/     Claude Design files (*.dc.html, assets/, uploads/, blog-posts.json, chats/). The source of truth for layout and copy.
src/        Build script and the hand-written parts
  build.mjs     renders every page into docs/
  pages.mjs     page list: titles, descriptions, and small patches applied to the designs
  site.mjs      URL map (design file → page) and the header navigation
  partials.mjs  shared header, floating cart, HTML layout
  policy.mjs    PolicyLayout for the policy pages; text in policies/
  lib/dc.mjs    renderer for the .dc.html format
  css/site.css  shared styles (header, floating cart, responsive fixes)
  js/           page behavior: site.js (menu, cart badge, Ecwid), home, shop, cart, contact, gallery, tips
docs/       Built site. Generated, so don't edit by hand.
```

## Build and preview

Requires Node 18+. No npm packages are needed.

```
npm run build   # regenerates docs/
npm run serve   # http://localhost:8000
```

After changing anything in `design/` or `src/`, run the build and commit `docs/` too.

## How pages are made

Each page renders its design file directly. The build evaluates the design's
data, expands its loops and conditions, and turns hover/focus styles into CSS,
so the static output matches the design's first render. Interactive parts
(store, cart, forms, lightbox, filters) are wired up by the scripts in `src/js`.

`pages.mjs` holds a few explicit patches per page, for example a placeholder
`href="#"` that now points somewhere real, or a hook for a script. A patch that
no longer matches its design fails the build, so an updated design never
silently loses a fix.

To bring in a new design export, replace the files in `design/`, run the build,
and fix any patch the build reports.

## Settings

`src/pages.mjs` → `config`:

- `ecwidStoreId`: the Ecwid store.
- `freeShippingThreshold`: amount for the cart's free-shipping bar (75).
- `contactEndpoint`: URL of a form service (Formspree, Basin, …) that accepts a
  JSON POST. While it's empty, the Contact form opens the visitor's email app
  addressed to `contactEmail`.

## Pages

- Home: `index.html`
- Shop (Ecwid): `shop/*.html` (All Products + 8 categories + 7 audiences)
- Audience pages: `for/*.html`
- `label-benefits`, `label-templates`, `about`, `contact`, `gallery`, `moving-tips`
- Blog: `blog.html`, `blog-2.html`, `blog-3.html`, plus one page per post in `blog/`
- Cart: `cart.html`, the designed cart showing the real Ecwid cart; checkout is Ecwid's.
- Policies: `policies.html`, `shipping-policies.html`, `return-policies.html`. They share
  `src/policy.mjs` (PolicyLayout), and their text lives in `src/policies/*.mjs`, copied word for
  word from tagaroom.com. Don't reword it without the client's approval.

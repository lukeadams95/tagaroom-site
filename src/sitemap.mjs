// Sitemap page, generated from the site's own navigation and page list so it
// stays current as pages are added. Uses the policy pages' header styles.

import { esc } from './lib/dc.mjs';
import { header, RIBBON } from './partials.mjs';

const STRIPE = ['#FEFA1F', '#FC811C', '#F91055', '#DA019F', '#724DB5', '#01A0D6', '#40D13D', '#DEF306'];

export function sitemapPage(groups, { footer }) {
  const total = groups.reduce((n, g) => n + g.links.length, 0);
  return `${header()}

<section class="pol-hero">
  <div class="pol-hero-inner">
    <nav class="pol-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Sitemap</span></nav>
    <h1>Sitemap</h1>
    <p class="pol-updated">All ${total} pages on the TAG-A-ROOM website.</p>
  </div>
  <div style="display:flex;height:5px">${RIBBON}</div>
</section>

<div class="sm-body">
  <div class="sm-grid">
    ${groups.map((g, i) => `<section class="sm-group${g.wide ? ' sm-group--wide' : ''}" style="border-top-color:${STRIPE[(i * 3 + 1) % 8]}" aria-labelledby="sm-${i}">
      <h2 id="sm-${i}"><a href="${g.href}">${esc(g.t)}</a></h2>
      <ul>${g.links.map(([t, href]) => `<li><a href="${href}">${esc(t)}</a></li>`).join('')}</ul>
    </section>`).join('\n    ')}
  </div>
</div>

${footer}`;
}


// 404 page: same header and hero as the sitemap, with the main ways back in.
export function notFoundPage({ footer }) {
  const links = [['Home', 'index.html'], ['Shop All Products', 'shop/all-products.html'], ['Label Benefits', 'label-benefits.html'], ['Label Templates', 'label-templates.html'], ['Blog', 'blog.html'], ['Contact Us', 'contact.html'], ['Sitemap', 'sitemap.html']];
  return `${header()}

<section class="pol-hero">
  <div class="pol-hero-inner">
    <nav class="pol-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Page not found</span></nav>
    <h1>Page Not Found</h1>
    <p class="pol-updated">The page you were looking for isn't here. It may have moved when our website was updated.</p>
  </div>
  <div style="display:flex;height:5px">${RIBBON}</div>
</section>

<div class="sm-body">
  <div class="sm-grid">
    <section class="sm-group" style="border-top-color:${STRIPE[1]}" aria-labelledby="nf-links">
      <h2 id="nf-links">Try one of these pages</h2>
      <ul>${links.map(([t, href]) => `<li><a href="${href}">${esc(t)}</a></li>`).join('')}</ul>
    </section>
  </div>
</div>

${footer}`;
}

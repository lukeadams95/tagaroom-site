import { NAV, CART } from './site.mjs';
import { esc } from './lib/dc.mjs';

const chev = (size, extra = '') => `<svg ${extra}width="${size}" height="${size}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg>`;
const cartSvg = (s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.5 11h10L20 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>`;
export const RIBBON = '<i style="flex:1;background:#FEFA1F"></i><i style="flex:1;background:#FC811C"></i><i style="flex:1;background:#F91055"></i><i style="flex:1;background:#DA019F"></i><i style="flex:1;background:#724DB5"></i><i style="flex:1;background:#01A0D6"></i><i style="flex:1;background:#40D13D"></i><i style="flex:1;background:#DEF306"></i>';

// Header.dc.html: fixed bar with hover dropdowns on desktop and a hamburger
// menu below 1100px. `active` / `activeKid` highlight the current section.
export function header({ active = '', activeKid = '' } = {}) {
  const desk = NAV.map(n => {
    const on = n.t === active;
    const kids = n.groups ? `<div class="dropdown" style="min-width:${n.w}px">${n.groups.map(g => `<div class="dd-group">${g.map(([t, href], ti) => {
      const head = g.length === 1 && n.groups.indexOf(g) === 0;
      const kidOn = activeKid === t;
      return `<a href="${href}"${head ? ' class="dd-head"' : kidOn ? ' class="dd-on"' : ''}>${esc(t)}</a>`;
    }).join('')}</div>`).join('')}</div>` : '';
    return `<div class="nav-item"><a href="${n.href}" class="nav-link${on ? ' is-active' : ''}"${n.groups ? ' aria-haspopup="true"' : ''}>${esc(n.t)}${n.groups ? chev(11, 'class="chev" ') : ''}</a>${kids}</div>`;
  }).join('');
  const mobile = NAV.map(n => n.groups
    ? `<div class="m-item"><a href="${n.href}" class="m-link" data-m-toggle aria-expanded="false">${esc(n.t)}${chev(12)}</a><div class="m-sub" hidden>${n.groups.flat().map(([t, href]) => `<a href="${href}">${esc(t)}</a>`).join('')}</div></div>`
    : `<div class="m-item"><a href="${n.href}" class="m-link">${esc(n.t)}</a></div>`).join('');
  return `<div class="header-spacer"></div>
<header class="site-header">
  <div class="header-bar">
    <a href="index.html" class="header-logo" aria-label="TAG-A-ROOM home"><img src="uploads/logo-1790711738779-iq0a.webp" alt="TAG-A-ROOM"></a>
    <nav class="desktop-nav" aria-label="Main">${desk}</nav>
    <div class="header-actions">
      <a href="shop/all-products.html" class="icon-link" aria-label="Search products"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></a>
      <a href="${CART}" class="icon-link cart-link" aria-label="Cart">${cartSvg()}<b class="cart-badge" data-cart-count>0</b></a>
      <a href="shop/all-products.html" class="btn-primary header-cta">Shop Professional Packs</a>
      <button type="button" class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <div style="display:flex;height:4px">${RIBBON}</div>
  <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>${mobile}<a href="shop/all-products.html" class="btn-primary m-cta">Shop Professional Packs</a></div>
</header>`;
}

export function floatingCart() {
  return `<a href="${CART}" class="floating-cart" aria-label="View cart"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.5 11h10L20 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg><b data-cart-count>0</b></a>`;
}

export function layout({ title, description = '', head = '', body, scripts = [], root = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}<link rel="icon" href="uploads/logo-1790711738779-iq0a.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,600;0,700;0,800;1,700;1,800;1,900&amp;family=JetBrains+Mono:wght@400&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
${head}<script>window.TAR_ROOT=${JSON.stringify(root)};</script>
<script src="js/config.js" defer></script>
<script src="js/site.js" defer></script>
${scripts.map(s => `<script src="${s}" defer></script>`).join('\n')}
</head>
<body>
${body}
</body>
</html>
`;
}

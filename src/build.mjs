// Builds the static site in docs/ from the Claude Design files in design/.
// Usage: node src/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readDesign, evalVals, renderTemplate, patch, PseudoSheet, esc } from './lib/dc.mjs';
import { mapLink } from './site.mjs';
import { header, floatingCart, layout } from './partials.mjs';
import { PAGES } from './pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design');
const OUT = path.join(ROOT, 'docs');
const sheet = new PseudoSheet();
const pageCss = new Map(); // css text -> file name
const designCache = new Map();

const design = name => {
  if (!designCache.has(name)) designCache.set(name, readDesign(path.join(DESIGN, `${name}.dc.html`)));
  return designCache.get(name);
};

const ctx = {
  sheet,
  link: mapLink,
  urls: s => s,
  importComponent(name, props) {
    if (name === 'Header') return header(props);
    if (name === 'Footer') return renderComponent('Footer', { patches: PAGES.footerPatches });
    if (name === 'Audience Template') {
      // The audience pages' secondary CTA (bulk pricing, custom logos…) is a placeholder link.
      const page = Object.assign({}, props.page, props.page.ctaHref === '#' ? { ctaHref: 'Contact%20Us.dc.html' } : {});
      return renderComponent('Audience Template', { props: { page } });
    }
    throw new Error(`Unknown component ${name}`);
  },
};

function renderComponent(name, { props = {}, state = {}, patches = {}, extraVals = {} } = {}) {
  const d = design(name);
  const template = patch(d.template, patches.template, name);
  const script = patch(d.script, patches.script, name + ' script');
  const vals = Object.assign(evalVals(script, { props, state }), extraVals);
  collectHelmet(d.helmet);
  return renderTemplate(template, Object.assign({ props }, vals), ctx);
}

// Page-specific <style> blocks from the design's <helmet>, shared by content hash.
let currentHelmetCss = [];
function collectHelmet(helmet) {
  for (const m of helmet.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    const css = m[1].trim();
    if (!pageCss.has(css)) pageCss.set(css, `css/page-${crypto.createHash('sha1').update(css).digest('hex').slice(0, 8)}.css`);
    if (!currentHelmetCss.includes(pageCss.get(css))) currentHelmetCss.push(pageCss.get(css));
  }
}

// Rewrite root-relative URLs for a page that lives `depth` folders down.
function relocate(html, prefix) {
  if (!prefix) return html;
  const fix = u => (/^([a-z]+:|#|\/|data:)/i.test(u) || u === '' ? u : prefix + u);
  return html
    .replace(/(\s(?:href|src))="([^"]*)"/g, (_, a, u) => `${a}="${fix(u)}"`)
    .replace(/url\((&quot;|['"]?)(.*?)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`);
}

// The designs repeat a fixed cart button on each page; use the shared one.
const stripFloatingCart = html => html.replace(/<a href="cart\.html"[^>]*?style="position:fixed[\s\S]*?<\/a>/g, '');

// "Contact us" style links are placeholders (href="#") in the designs.
const linkContacts = html => html.replace(/<a href="#"([^>]*)>(\s*(?:Contact[^<]*|Get Brokerage Pricing))<\/a>/g, '<a href="contact.html"$1>$2</a>');

const written = [];
function writePage(out, { title, description, body, scripts = [], css = [], ecwid = '' }) {
  const depth = out.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  const head = css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n') + (css.length ? '\n' : '');
  let html = layout({ title, description, head, body: linkContacts(stripFloatingCart(body)) + (out === 'cart.html' ? '' : '\n' + floatingCart()), scripts, root: prefix, ecwid, storeId: PAGES.config.ecwidStoreId });
  html = relocate(html, prefix);
  fs.mkdirSync(path.dirname(path.join(OUT, out)), { recursive: true });
  fs.writeFileSync(path.join(OUT, out), html);
  written.push(out);
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const p of PAGES.list()) {
    currentHelmetCss = [];
    const body = p.render
      ? p.render({ renderComponent, design, esc, ctx })
      : renderComponent(p.design, { props: p.props, state: p.state, patches: p.patches, extraVals: p.extraVals });
    writePage(p.out, { title: p.title, description: p.description, body, scripts: p.scripts, css: currentHelmetCss.slice(), ecwid: p.ecwid });
  }

  // Stylesheets
  fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
  const base = fs.readFileSync(path.join(ROOT, 'src/css/site.css'), 'utf8');
  fs.writeFileSync(path.join(OUT, 'css/site.css'), base + '\n/* Hover and focus states from the designs */\n' + sheet.css());
  for (const [css, file] of pageCss) fs.writeFileSync(path.join(OUT, file), css + '\n');

  // Scripts
  fs.cpSync(path.join(ROOT, 'src/js'), path.join(OUT, 'js'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'js/config.js'), `window.TAR_CONFIG=${JSON.stringify(PAGES.config)};\n`);

  // Copy every asset referenced by the output.
  const refs = new Set();
  const scan = text => {
    text = text.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const add = u => refs.add(decodeURIComponent(u));
    for (const m of text.matchAll(/(["'])((?:assets|uploads)\/[^"'<>]+?)\1/g)) add(m[2]);
    for (const m of text.matchAll(/url\(((?:assets|uploads)\/[^"')]+)\)/g)) add(m[1]);
  };
  for (const f of walk(OUT)) if (/\.(html|css|js)$/.test(f)) scan(fs.readFileSync(f, 'utf8'));
  let missing = 0;
  for (const r of refs) {
    const src = path.join(DESIGN, r);
    if (!fs.existsSync(src)) { console.warn('Missing asset:', r); missing++; continue; }
    fs.mkdirSync(path.dirname(path.join(OUT, r)), { recursive: true });
    fs.copyFileSync(src, path.join(OUT, r));
  }
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  console.log(`Built ${written.length} pages, ${refs.size} assets${missing ? `, ${missing} missing` : ''}, ${sheet.rules.size} hover/focus rules.`);
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}

build();

// Builds the static site in docs/ from the Claude Design files in design/.
// Usage: node src/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readDesign, evalVals, renderTemplate, patch, PseudoSheet, esc } from './lib/dc.mjs';
import { mapLink, SITE_URL } from './site.mjs';
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

// Images and downloads still stored on the old WordPress site (tagaroom.com,
// being retired). When a copy exists in design/media/ (same file name), the
// page uses it; otherwise the old URL stays and is listed in
// design/media/files-to-download.txt so it can be saved before the site goes away.
const MEDIA = path.join(DESIGN, 'media');
const OLD_FILE = /https?:\/\/(?:www\.)?tagaroom\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"'()\s<>&]+)/g;
const oldFilesMissing = new Map(); // file name -> original URL
const localizeOldSite = html => html.replace(OLD_FILE, (url, name) => {
  if (fs.existsSync(path.join(MEDIA, decodeURIComponent(name)))) return 'media/' + name;
  oldFilesMissing.set(decodeURIComponent(name), url);
  return url;
});

// "Contact us" style links are placeholders (href="#") in the designs.
const linkContacts = html => html.replace(/<a href="#"([^>]*)>(\s*(?:Contact[^<]*|Get Brokerage Pricing))<\/a>/g, '<a href="contact.html"$1>$2</a>');

const written = [];
function writePage(out, { title, description, body, scripts = [], css = [], ecwid = '' }) {
  const depth = out.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  const head = css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n') + (css.length ? '\n' : '');
  let html = layout({ title, description, head, body: linkContacts(stripFloatingCart(body)) + (out === 'cart.html' ? '' : '\n' + floatingCart()), scripts, root: prefix, ecwid, storeId: PAGES.config.ecwidStoreId });
  html = relocate(localizeOldSite(html), prefix);
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
  checkMeta(PAGES.list());
  writeSitemapXml();

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
    for (const m of text.matchAll(/(["'])((?:assets|uploads|media)\/[^"'<>]+?)\1/g)) add(m[2]);
    for (const m of text.matchAll(/url\(((?:assets|uploads|media)\/[^"')]+)\)/g)) add(m[1]);
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
  writeOldSiteReport();
  console.log(`Built ${written.length} pages, ${refs.size} assets${missing ? `, ${missing} missing` : ''}, ${sheet.rules.size} hover/focus rules.`);
}

// Every page needs its own <title> and meta description.
function checkMeta(pages) {
  const problems = [];
  const seen = { title: new Map(), description: new Map() };
  for (const p of pages) {
    for (const k of ['title', 'description']) {
      if (!p[k] || !String(p[k]).trim()) { problems.push(`${p.out}: missing ${k}`); continue; }
      if (seen[k].has(p[k])) problems.push(`${p.out}: same ${k} as ${seen[k].get(p[k])}`);
      else seen[k].set(p[k], p.out);
    }
  }
  if (problems.length) throw new Error('Page titles/descriptions:\n' + problems.join('\n'));
}

// sitemap.xml (all public pages except the cart) and robots.txt.
// Cloudflare Pages serves about.html at /about, so the sitemap uses clean URLs.
function writeSitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const url = out => SITE_URL + '/' + out.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
  const pages = written.filter(o => o !== 'cart.html').sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(o => `  <url><loc>${url(o)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

// List what still loads from the old site, plus a PowerShell script that saves it all.
function writeOldSiteReport() {
  fs.mkdirSync(MEDIA, { recursive: true });
  const urls = [...oldFilesMissing.values()].sort();
  fs.writeFileSync(path.join(MEDIA, 'files-to-download.txt'), urls.length
    ? `# ${urls.length} files the site still loads from the old tagaroom.com website.\n# Save each one into this folder (design/media/) with the same file name, then rebuild.\n${urls.join('\n')}\n`
    : '# Nothing left: every image and download is served from this site.\n');
  const ps = `# Saves the files the new site still loads from the old tagaroom.com website.
# Run in Windows PowerShell; the files go to a "tagaroom-media" folder on your Desktop.
# Then upload that folder's files to design/media/ in the GitHub repo.
$out = Join-Path ([Environment]::GetFolderPath('Desktop')) 'tagaroom-media'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$urls = @(
${urls.map(u => `  '${u}'`).join(",\n")}
)
foreach ($u in $urls) {
  $name = [System.Uri]::UnescapeDataString(($u -split '/')[-1])
  try { Invoke-WebRequest -Uri $u -OutFile (Join-Path $out $name) -UseBasicParsing; Write-Host "Saved $name" }
  catch { Write-Warning "Could not download $u" }
}
Write-Host "Done: $($urls.Count) files in $out"
`;
  fs.writeFileSync(path.join(MEDIA, 'download-old-site-files.ps1'), urls.length ? ps : '# Nothing left to download.\n');
  if (urls.length) console.warn(`${urls.length} files still load from the old tagaroom.com site (see design/media/files-to-download.txt).`);
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}

build();

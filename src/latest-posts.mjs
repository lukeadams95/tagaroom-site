// Homepage "Latest posts" block (Nov 20, 2026).
// Source: design/blog-posts.json (same data as /blog). Newest first by date,
// drafts and future-dated posts skipped (America/Chicago date), top 3.
// Plain links in the built HTML, so it refreshes on every build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDate(p) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(p.datePublished || '');
  if (iso) return Date.UTC(+iso[1], +iso[2] - 1, +iso[3]);
  const m = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/.exec((p.date || '').trim());
  if (m) {
    const mi = MONTHS.findIndex(n => n.toLowerCase().startsWith(m[1].toLowerCase().slice(0, 3)));
    if (mi >= 0) return Date.UTC(+m[3], mi, +m[2]);
  }
  return NaN;
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function latestPostsHtml(count = 3) {
  const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'design/blog-posts.json'), 'utf8'));
  const [y, mo, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
  const today = Date.UTC(y, mo - 1, d);
  const latest = Object.entries(posts)
    .filter(([, p]) => !p.draft)
    .map(([slug, p]) => ({ slug, p, t: parseDate(p) }))
    .filter(x => !Number.isNaN(x.t) && x.t <= today)
    .sort((a, b) => b.t - a.t || a.slug.localeCompare(b.slug))
    .slice(0, count);
  if (!latest.length) return '';
  const items = latest.map(({ slug, p, t }) => {
    const dt = new Date(t);
    const label = `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
    return `      <li style="background:#fff;border:1px solid #E3E8EE;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:10px">
        <time datetime="${dt.toISOString().slice(0, 10)}" style="font-size:14px;font-weight:700;color:#4A5A6C">${label}</time>
        <h3 style="font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:22px;line-height:1.15;margin:0;letter-spacing:-.01em"><a href="blog/${esc(slug)}.html" style="color:inherit;text-decoration:none">${esc(p.title)}</a></h3>
      </li>`;
  }).join('\n');
  return `<div id="latest-posts" style="background:#F5F7FA;padding-bottom:clamp(56px,8vw,96px)"><section aria-labelledby="latest-posts-heading" style="max-width:1240px;margin:0 auto;padding:clamp(56px,8vw,96px) 24px 0">
  <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;margin-bottom:32px">
    <h2 id="latest-posts-heading" style="text-transform:uppercase;font-family:'Archivo',sans-serif;font-style:italic;font-weight:900;font-size:clamp(28px,4vw,42px);line-height:1.05;margin:0;letter-spacing:-.01em">Latest posts</h2>
    <a href="blog.html" style="font-weight:700">View all posts →</a>
  </div>
  <ul style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px">
${items}
  </ul>
</section></div>
`;
}

// Insert the block just before the homepage's closing blue CTA band.
export function injectLatestPosts(body) {
  const anchor = '<section style="position:relative;background:#0169B8;color:#fff;overflow:hidden">';
  const i = body.lastIndexOf(anchor);
  if (i < 0) throw new Error('latest-posts: homepage CTA band not found');
  return body.slice(0, i) + latestPostsHtml() + body.slice(i);
}

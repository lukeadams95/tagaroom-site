// Cloudflare Pages middleware: old-site redirects.
//
// Pages doesn't apply docs/_redirects to requests that run through Functions, and
// this middleware runs for every route except the static folders excluded in
// docs/_routes.json (written by src/build.mjs). So it applies the same list
// (src/redirects.mjs: exact paths first, then the /prefix/* rules) and adds one
// rule _redirects can't express:
//
//   Old Ecwid store links end in -c<id> (category) or -p<id> (product) and lived
//   under any page path, e.g. /Professional-Movers-c196046558,
//   /home/Professional-Movers-c196046558, /some-post/Tag-A-Room-Moving-Label-Systems-c4497123.
//   They go where /shop-moving-labels-organization/<same name> goes (matched by id);
//   an id with no match goes to the all-products shop page (/shop/ redirects there).
//
// The visitor's query string is kept, as _redirects does.

import { REDIRECTS } from '../src/redirects.mjs';

const EXACT = new Map();
const SPLATS = [];
const STORE = new Map(); // 'c196046558' / 'p433097172' -> target
for (const [from, to] of REDIRECTS) {
  if (from.endsWith('/*')) { SPLATS.push([from.slice(0, -1), to]); continue; }
  if (!EXACT.has(from)) EXACT.set(from, to);
  const m = from.match(/^\/shop-moving-labels-organization\/[^/]*-([cp])(\d+)\/?$/);
  if (m && !STORE.has(m[1] + m[2])) STORE.set(m[1] + m[2], to);
}
const STORE_URL = /-([cp])(\d+)\/?$/;
const SHOP_FALLBACK = '/shop/all-products';

export function target(path) {
  if (EXACT.has(path)) return EXACT.get(path);
  const m = path.match(STORE_URL);
  if (m) return STORE.get(m[1] + m[2]) || SHOP_FALLBACK;
  const s = SPLATS.find(([prefix]) => path.startsWith(prefix));
  return s ? s[1] : null;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/')) return context.next();
  const to = target(url.pathname);
  if (!to) return context.next();
  const dest = new URL(to, url.origin);
  for (const [k, v] of url.searchParams) if (!dest.searchParams.has(k)) dest.searchParams.append(k, v);
  return new Response(null, { status: 301, headers: { Location: dest.href } });
}

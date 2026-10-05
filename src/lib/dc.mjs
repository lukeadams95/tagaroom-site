// Renders a Claude Design component file (*.dc.html) to static HTML at build time.
//
// The design files are React-backed prototypes: an <x-dc> template with
// {{ path }} bindings, <sc-for>/<sc-if> blocks, <dc-import> components and
// style-hover/style-focus attributes, plus a `class Component extends DCLogic`
// script whose renderVals() supplies the data. We evaluate renderVals() once in
// Node with the initial state and expand the template, so the static output
// matches the design's first render. Interactivity is added separately by the
// hand-written scripts in src/js.

import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

export function readDesign(file) {
  const src = fs.readFileSync(file, 'utf8');
  const open = src.indexOf('<x-dc>');
  const close = src.lastIndexOf('</x-dc>');
  if (open < 0 || close < 0) throw new Error(`No <x-dc> template in ${file}`);
  let template = src.slice(open + 6, close);
  let helmet = '';
  template = template.replace(/<helmet>([\s\S]*?)<\/helmet>/, (_, h) => { helmet = h; return ''; });
  const m = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/);
  return { file, template, helmet, script: m ? m[1] : '' };
}

// Apply [find, replace] patches, failing loudly when the design has drifted.
export function patch(text, patches = [], label = '') {
  for (const [find, rep] of patches) {
    const n = text.split(find).length - 1;
    if (n === 0) throw new Error(`Patch not found in ${label}: ${String(find).slice(0, 80)}`);
    text = text.split(find).join(rep);
  }
  return text;
}

class DCLogic {
  constructor() { this.props = {}; this.state = {}; }
  setState() {}
}

// Evaluate the component script and return renderVals() for the given props/state.
export function evalVals(script, { props = {}, state = {} } = {}) {
  if (!script.trim()) return {};
  const ctx = vm.createContext({
    DCLogic, console, Math, JSON, Object, Array, String, Number, Boolean, Date, RegExp, encodeURI, encodeURIComponent,
    window: {}, document: {}, location: { search: '', hash: '', pathname: '/' }, localStorage: { getItem() { return null; } },
  });
  const Component = vm.runInContext(`${script}\n;Component`, ctx);
  const c = new Component();
  c.props = props;
  c.state = Object.assign({}, c.state, state);
  return c.renderVals ? c.renderVals() : {};
}

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const UNITLESS = new Set(['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order', 'zoom']);
export function styleObj(o) {
  return Object.entries(o).map(([k, v]) => {
    const prop = k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    return `${prop}:${typeof v === 'number' && !UNITLESS.has(k) ? v + 'px' : v}`;
  }).join(';');
}

function lookup(scope, path) {
  if (path === 'true') return true;
  if (path === 'false') return false;
  let v = scope;
  for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; }
  return v;
}

function stringify(v) {
  if (v == null || v === false) return '';
  if (typeof v === 'object') return styleObj(v);
  return String(v);
}

const interp = (text, scope) => text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, p) => esc(stringify(lookup(scope, p))));

// Hover/focus rules are collected site-wide into one stylesheet.
export class PseudoSheet {
  constructor() { this.rules = new Map(); }
  cls(pseudo, css) {
    const key = pseudo + '|' + css;
    const name = 'p' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 7);
    if (!this.rules.has(key)) {
      const decls = css.split(';').map(d => d.trim()).filter(Boolean).map(d => /!important$/.test(d) ? d : d + ' !important').join(';');
      // style-focus in the designs sits on labels and inputs alike; :focus-within covers both.
      const sel = pseudo === 'focus' ? `.${name}:focus-within` : `.${name}:${pseudo}`;
      this.rules.set(key, `${sel}{${decls}}`);
    }
    return name;
  }
  css() { return [...this.rules.values()].join('\n') + '\n'; }
}

// Rewrite one tag's attributes: drop event handlers and editor hints, turn
// style-hover/style-focus into classes, interpolate bindings.
function renderTag(tag, scope, ctx) {
  return tag.replace(/^<([a-zA-Z0-9-]+)([\s\S]*?)(\/?)>$/, (all, name, attrs, selfClose) => {
    const out = [];
    const extraCls = [];
    let cls = null;
    const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'))?/g;
    let m;
    while ((m = re.exec(attrs))) {
      const key = m[1];
      let val = m[2] !== undefined ? m[2].slice(1, -1) : null;
      if (key === 'ref' || key.startsWith('hint-') || /^onMouse/.test(key)) continue;
      // Event bindings become hooks for the page scripts: onClick="{{ p.open }}" → data-click="open".
      if (/^on[A-Z]/.test(key)) {
        const h = (val || '').match(/\{\{\s*([^}]+?)\s*\}\}/);
        if (h) out.push(`data-${key.slice(2).toLowerCase()}="${h[1].split('.').pop()}"`);
        continue;
      }
      if (key === 'style-hover' || key === 'style-focus') {
        extraCls.push(ctx.sheet.cls(key.slice(6), interp(val, scope).replace(/&quot;/g, '"')));
        continue;
      }
      if (key === 'noValidate') { out.push('novalidate'); continue; }
      if (val === null) { out.push(key); continue; }
      const raw = val.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
      if (raw && typeof lookup(scope, raw[1]) === 'boolean') {
        const b = lookup(scope, raw[1]);
        if (/^aria-/.test(key)) out.push(`${key}="${b}"`);
        else if (b) out.push(key);
        continue;
      }
      val = interp(val, scope);
      if (key === 'href' || key === 'src') val = ctx.link(val);
      if (key === 'style') val = ctx.urls(val);
      if (key === 'class') { cls = val; continue; }
      out.push(`${key}="${val}"`);
    }
    const allCls = [cls, ...extraCls].filter(Boolean).join(' ');
    if (allCls) out.push(`class="${allCls}"`);
    return `<${name}${out.length ? ' ' + out.join(' ') : ''}${selfClose ? ' /' : ''}>`;
  });
}

// Find the index just past the matching close tag for a block that opens at `from`.
function matchClose(src, name, from) {
  const re = new RegExp(`<${name}[\\s>]|</${name}>`, 'g');
  re.lastIndex = from;
  let depth = 0, m;
  while ((m = re.exec(src))) {
    if (m[0].startsWith('</')) { depth--; if (depth === 0) return { innerEnd: m.index, end: m.index + m[0].length }; }
    else depth++;
  }
  throw new Error(`Unclosed <${name}>`);
}

function attr(tag, key) {
  const m = tag.match(new RegExp(`\\s${key}="([^"]*)"`));
  return m ? m[1] : null;
}

export function renderTemplate(src, scope, ctx) {
  let out = '';
  let i = 0;
  const blockRe = /<(sc-for|sc-if|dc-import)[\s>]/g;
  const tagRe = /<[a-zA-Z][^>]*>/g;
  const emit = text => {
    // Interpolate text and rewrite tags in a chunk without blocks.
    let r = '', j = 0, t;
    tagRe.lastIndex = 0;
    while ((t = tagRe.exec(text))) {
      r += interp(text.slice(j, t.index), scope);
      r += renderTag(t[0], scope, ctx);
      j = t.index + t[0].length;
    }
    return r + interp(text.slice(j), scope);
  };
  let b;
  while ((b = blockRe.exec(src))) {
    const name = b[1];
    out += emit(src.slice(i, b.index));
    const openEnd = src.indexOf('>', b.index) + 1;
    const openTag = src.slice(b.index, openEnd);
    const { innerEnd, end } = matchClose(src, name, b.index);
    const inner = src.slice(openEnd, innerEnd);
    if (name === 'sc-for') {
      const list = lookup(scope, attr(openTag, 'list').replace(/^\{\{\s*|\s*\}\}$/g, '')) || [];
      const as = attr(openTag, 'as');
      list.forEach((item, idx) => { out += renderTemplate(inner, Object.assign({}, scope, { [as]: item, $index: idx }), ctx); });
    } else if (name === 'sc-if') {
      if (lookup(scope, attr(openTag, 'value').replace(/^\{\{\s*|\s*\}\}$/g, ''))) out += renderTemplate(inner, scope, ctx);
    } else {
      const props = {};
      for (const m of openTag.matchAll(/\s([a-z][-a-z]*)="([^"]*)"/g)) {
        if (m[1] === 'name' || m[1].startsWith('hint-')) continue;
        const raw = m[2].match(/^\{\{\s*([^}]+?)\s*\}\}$/);
        props[m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = raw ? lookup(scope, raw[1]) : m[2];
      }
      out += ctx.importComponent(attr(openTag, 'name'), props);
    }
    i = end;
    blockRe.lastIndex = end;
  }
  return out + emit(src.slice(i));
}

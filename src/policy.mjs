// PolicyLayout: shared layout for the policy pages (Store, Shipping, Return).
// Content lives in src/policies/*.mjs as plain data so the wording stays exact.

import { esc } from './lib/dc.mjs';
import { header, RIBBON } from './partials.mjs';

const STRIPE = ['#FEFA1F', '#FC811C', '#F91055', '#DA019F', '#724DB5', '#01A0D6', '#40D13D', '#DEF306'];

export const slug = s => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ICONS = {
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  store: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4',
};
const icon = (name, size = 24, color = '#0169B8') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

// Inline content: a string, or an array of strings and { a, href } links.
const inline = x => (Array.isArray(x) ? x : [x]).map(part => (typeof part === 'string'
  ? esc(part)
  : `<a href="${esc(part.href)}"${/^https?:/.test(part.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(part.a)}</a>`)).join('');

function block([type, content]) {
  if (type === 'p') return `<p>${inline(content)}</p>`;
  if (type === 'h3') return `<h3>${esc(content)}</h3>`;
  if (type === 'ul') return `<ul>${content.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;
  if (type === 'note') return `<p class="pol-note">${inline(content)}</p>`;
  throw new Error(`Unknown policy block "${type}"`);
}

function summary(cards) {
  return `<div class="pol-summary" role="group" aria-label="At a glance">
  ${cards.map((c, i) => `<div class="pol-card" style="border-top-color:${STRIPE[(i * 2 + 1) % 8]}">
    <div class="pol-card-head"><span class="pol-card-icon">${icon(c.icon)}</span><h3>${esc(c.t)}</h3></div>
    ${c.facts ? `<dl>${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : `<p class="pol-card-text">${esc(c.text)}</p>`}
  </div>`).join('\n  ')}
  <p class="pol-summary-note">At a glance. The full policy is below.</p>
</div>`;
}

const tocList = items => `<ol>${items.map(s => `<li><a href="#${s.id}" data-toc-link>${esc(s.h)}</a></li>`).join('')}</ol>`;

export function policyPage(page, { footer }) {
  const sections = page.sections.map((s, i) => ({ ...s, id: slug(s.h), color: STRIPE[i % 8] }));
  const crumbs = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="policies.html">Policies</a><span aria-hidden="true">/</span><span aria-current="page">${esc(page.title)}</span>`;
  // A table of contents only helps when there is more than one section.
  const toc = sections.length > 1;
  return `${header()}

<section class="pol-hero">
  <div class="pol-hero-inner">
    <nav class="pol-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <h1>${esc(page.h1 || page.title)}</h1>
    <p class="pol-updated">Last updated: ${esc(page.updated)}</p>
  </div>
  <div style="display:flex;height:5px">${RIBBON}</div>
</section>

<div class="pol-body">
  <div class="pol-wrap${toc ? '' : ' pol-wrap--single'}">
    ${toc ? `<aside class="pol-toc" aria-label="On this page">
      <p class="pol-toc-title">On this page</p>
      ${tocList(sections)}
    </aside>` : ''}
    <div class="pol-main">
      ${toc ? `<details class="pol-jump">
        <summary>Jump to section</summary>
        ${tocList(sections)}
      </details>` : ''}
      ${page.lead ? `<h2 class="pol-lead">${esc(page.lead)}</h2>` : ''}
      ${page.intro ? `<p class="pol-intro"><a href="${page.intro.href}">${esc(page.intro.link)}</a></p>` : ''}
      ${sections.map(s => `<section class="pol-section" id="${s.id}" style="--pol-accent:${s.color}" aria-labelledby="${s.id}-h">
        <h2 id="${s.id}-h">${esc(s.h)}</h2>
        ${s.summary ? summary(s.summary) : ''}
        ${s.body.map(block).join('\n        ')}
      </section>`).join('\n      ')}
      ${page.related ? `<nav class="pol-related" aria-label="Related policies"><span>Related policies</span>${page.related.map(r => `<a href="${esc(r.href)}">${esc(r.t)} →</a>`).join('')}</nav>` : ''}
      <aside class="pol-questions">
        <h2>Questions about our policies?</h2>
        <p>Our team is happy to help.</p>
        <div class="pol-q-actions">
          <a href="mailto:info@tagaroom.com" class="pol-q-link">${icon('mail', 20)}info@tagaroom.com</a>
          <a href="tel:+12105640147" class="pol-q-link">${icon('phone', 20)}(210) 564-0147</a>
          <a href="contact.html" class="btn-primary pol-q-btn">Contact Us</a>
        </div>
      </aside>
    </div>
  </div>
</div>
<button type="button" class="pol-top" data-back-to-top hidden aria-label="Back to top"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Back to top</button>

${footer}`;
}

ICONS.mail = 'M3 5h18v14H3zM3 7l9 6 9-6';
ICONS.phone = 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z';

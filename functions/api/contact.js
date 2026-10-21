// Cloudflare Pages Function: POST /api/contact
// Emails the Contact Us form to TAG-A-ROOM through Resend.
//
// Body: JSON (or form data) with name, email, msg (required) and phone, company, who, topic.
// Returns JSON { ok: true } or { ok: false, error }.
//
// Pages → Settings → Variables and Secrets:
//   RESEND_API_KEY        (secret, production and preview)
//   TURNSTILE_SECRET_KEY  (secret, production) — the token is checked with siteverify
//   TEST_TO               (preview only) — sends there instead of the business, skips Turnstile.
//                         Never set it in production.

const FROM = 'Tagaroom Website <leads@newleadrelay.com>';
const TO = 'info@tagaroom.com';
const PROD_HOSTS = new Set(['tagaroom.com', 'www.tagaroom.com']);
const MAX_BODY = 20000; // bytes
const LIMITS = { name: 120, email: 200, phone: 40, company: 160, who: 80, topic: 120, msg: 5000 };
const LABELS = { name: 'Name', email: 'Email', phone: 'Phone', company: 'Company', who: 'I am a', topic: 'Topic', msg: 'Message' };
const EMAIL_RE = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;
const MIN_FILL_MS = 2500;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = s => String(s).replace(/[\r\n]+/g, ' ').trim();

async function readBody(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return { tooBig: true };
  const raw = await request.text();
  if (raw.length > MAX_BODY) return { tooBig: true };
  const type = request.headers.get('Content-Type') || '';
  if (type.includes('application/json')) {
    try { const d = JSON.parse(raw); return { data: d && typeof d === 'object' ? d : {} }; } catch { return { data: null }; }
  }
  return { data: Object.fromEntries(new URLSearchParams(raw)) };
}

async function verifyTurnstile(token, secret, request) {
  if (!token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(10000) });
    const out = await r.json();
    return out.success === true && PROD_HOSTS.has(out.hostname);
  } catch (err) {
    console.error('contact: siteverify failed', err);
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  const { tooBig, data } = await readBody(request);
  if (tooBig) return json({ ok: false, error: 'Your message is too long. Please shorten it and try again.' }, 413);
  if (!data) return json({ ok: false, error: 'Bad request.' }, 400);

  const testTo = (env.TEST_TO || '').trim();
  const host = new URL(request.url).hostname;
  // Only the live site emails the business; preview deployments need TEST_TO.
  if (!testTo && !PROD_HOSTS.has(host)) return json({ ok: false, error: 'This form only sends from tagaroom.com.' }, 403);

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (String(data.website || '').trim()) return json({ ok: true });
  const started = Number(data.form_started);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS) return json({ ok: false, error: 'Please wait a moment and try again.' }, 400);

  const f = {};
  for (const [k, max] of Object.entries(LIMITS)) {
    const v = typeof data[k] === 'string' || typeof data[k] === 'number' ? String(data[k]).trim() : '';
    if (v.length > max) return json({ ok: false, error: `${LABELS[k]} is too long.` }, 400);
    f[k] = v;
  }
  if (!f.name) return json({ ok: false, error: 'Please enter your name.' }, 400);
  if (!EMAIL_RE.test(f.email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  if (!f.msg) return json({ ok: false, error: 'Please enter a message.' }, 400);
  if ((f.msg.match(/https?:\/\//gi) || []).length > 5) return json({ ok: false, error: 'Please remove some of the links and try again.' }, 400);

  if (!testTo) {
    if (!env.TURNSTILE_SECRET_KEY) { console.error('contact: TURNSTILE_SECRET_KEY is not set'); return json({ ok: false, error: 'The form is not available right now.' }, 503); }
    const token = String(data['cf-turnstile-response'] || '');
    if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request))) return json({ ok: false, error: 'Please complete the verification and try again.' }, 403);
  }
  if (!env.RESEND_API_KEY) { console.error('contact: RESEND_API_KEY is not set'); return json({ ok: false, error: 'The form is not available right now.' }, 503); }

  const rows = Object.keys(LABELS).filter(k => f[k]);
  const text = rows.map(k => `${LABELS[k]}: ${f[k]}`).join('\n') + `\n\nSent from the Contact Us form on ${host}.`;
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows.map(k => `<tr><td style="vertical-align:top;font-weight:bold;white-space:nowrap">${LABELS[k]}</td><td style="white-space:pre-wrap">${esc(f[k])}</td></tr>`).join('')}</table><p style="font-family:Arial,sans-serif;font-size:12px;color:#666">Sent from the Contact Us form on ${esc(host)}. Reply to this email to answer ${esc(f.name)} directly.</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [testTo || TO],
      reply_to: f.email,
      subject: oneLine(`${testTo ? '[TEST] ' : ''}New website message from ${f.name}`).slice(0, 180),
      text,
      html,
    }),
  });
  if (!r.ok) {
    console.error('contact: Resend error', r.status, (await r.text()).slice(0, 300));
    return json({ ok: false, error: 'Sending failed.' }, 502);
  }
  const out = await r.json().catch(() => ({}));
  return json({ ok: true, ...(testTo ? { test: true, id: out.id } : {}) });
}

export const onRequest = () => new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });

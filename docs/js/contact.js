// Contact Us: form validation and sending, FAQ accordion.
(() => {
  'use strict';
  const CFG = window.TAR_CONFIG || {};
  const form = document.querySelector('form[data-submit]');
  const sent = document.querySelector('[data-form-sent]');
  const error = document.querySelector('[data-form-error]');

  if (form) {
    const field = name => form.querySelector(`[data-input="${name}"], [data-change="${name}"]`);
    const fields = ['name', 'email', 'phone', 'company', 'who', 'topic', 'msg'];
    fields.forEach(n => { const f = field(n); if (f) f.name = n; });
    const required = { name: v => v.trim(), email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: v => v.trim() };
    let tried = false;

    // Honeypot: hidden from people and screen readers; bots that fill it are dropped by the server.
    const trap = document.createElement('div');
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden';
    trap.innerHTML = '<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(trap);
    const started = Date.now();

    // Turnstile loads only once the visitor starts using the form, and stays invisible unless a check is needed.
    let tsBox = null, tsWidget = null, tsLoading = null, tsToken = '', tsWaiters = [];
    const loadTurnstile = () => {
      if (tsLoading || !CFG.turnstileSiteKey) return tsLoading;
      tsBox = document.createElement('div');
      tsBox.style.cssText = 'display:flex;justify-content:center';
      form.querySelector('button[type="submit"]').insertAdjacentElement('beforebegin', tsBox);
      tsLoading = new Promise((resolve, reject) => {
        window.__tarTsReady = () => {
          tsWidget = window.turnstile.render(tsBox, {
            sitekey: CFG.turnstileSiteKey, appearance: 'interaction-only', action: 'contact',
            callback: t => { tsToken = t; tsWaiters.splice(0).forEach(w => w(t)); },
            'expired-callback': () => { tsToken = ''; },
            'error-callback': () => { tsToken = ''; },
          });
          resolve();
        };
        const sc = document.createElement('script');
        sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__tarTsReady';
        sc.async = true;
        sc.onerror = reject;
        document.head.appendChild(sc);
      });
      return tsLoading;
    };
    ['focusin', 'pointerdown', 'keydown'].forEach(ev => form.addEventListener(ev, loadTurnstile, { once: true, passive: true }));
    const turnstileToken = async () => {
      if (!CFG.turnstileSiteKey) return '';
      await loadTurnstile();
      if (tsToken) return tsToken;
      return new Promise(resolve => { tsWaiters.push(resolve); setTimeout(() => resolve(tsToken), 15000); });
    };
    const resetTurnstile = () => { tsToken = ''; if (tsWidget != null && window.turnstile) window.turnstile.reset(tsWidget); };

    const validate = () => {
      let ok = true;
      for (const [n, test] of Object.entries(required)) {
        const bad = !test(field(n).value);
        if (bad) ok = false;
        field(n).style.borderColor = tried && bad ? '#F91055' : '#CBD3DD';
        field(n).setAttribute('aria-invalid', String(tried && bad));
      }
      error.hidden = !tried || ok;
      return ok;
    };
    form.addEventListener('input', () => { if (tried) validate(); });

    const done = () => { form.hidden = true; sent.hidden = false; sent.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    const mailto = data => {
      const body = `${data.msg}\n\n— ${data.name}\n${data.email}${data.phone ? '\n' + data.phone : ''}${data.company ? '\n' + data.company : ''}\nI am a: ${data.who}`;
      return `mailto:${CFG.contactEmail}?subject=${encodeURIComponent(data.topic + ' – ' + data.name)}&body=${encodeURIComponent(body)}`;
    };
    const defaultError = error.textContent;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      tried = true;
      error.textContent = defaultError;
      if (!validate()) return;
      const data = Object.fromEntries(fields.map(n => [n, field(n).value]));
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.textContent;
      if (!CFG.contactEndpoint) { location.href = mailto(data); done(); return; }
      btn.disabled = true;
      btn.textContent = 'Sending…';
      let reason = '';
      try {
        const token = await turnstileToken();
        const payload = Object.assign({}, data, { website: form.elements.website.value, form_started: started, 'cf-turnstile-response': token });
        const r = await fetch(CFG.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
        const out = await r.json().catch(() => ({}));
        if (r.ok && out.ok) {
          if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_name: 'contact', topic: data.topic || '', visitor_type: data.who || '' });
          done();
          return;
        }
        reason = out.error || '';
        // A failed check or a field problem: let the visitor fix it and resend.
        if (r.status === 400 || r.status === 413 || (r.status === 403 && /verification/i.test(reason))) {
          resetTurnstile();
          btn.disabled = false;
          btn.textContent = label;
          error.textContent = reason;
          error.hidden = false;
          return;
        }
      } catch (err) { /* network error: fall back below */ }
      // The form service is down: open the visitor's email app with the message filled in.
      resetTurnstile();
      btn.disabled = false;
      btn.textContent = label;
      error.textContent = `Sorry, your message didn't go through. We opened your email app with your message instead, or call (210) 564-0147 or email ${CFG.contactEmail}.`;
      error.hidden = false;
      location.href = mailto(data);
    });
  }

  // FAQ: one answer open at a time.
  const qs = Array.from(document.querySelectorAll('button[data-click="toggle"]'));
  qs.forEach(btn => btn.addEventListener('click', () => {
    const willOpen = btn.getAttribute('aria-expanded') !== 'true';
    qs.forEach(b => {
      const open = b === btn && willOpen;
      b.setAttribute('aria-expanded', String(open));
      b.parentElement.querySelector('[data-faq-answer]').hidden = !open;
      b.querySelector('[data-faq-v]').style.display = open ? 'none' : '';
    });
  }));
})();

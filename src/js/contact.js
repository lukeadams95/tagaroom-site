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

    form.addEventListener('submit', async e => {
      e.preventDefault();
      tried = true;
      if (!validate()) return;
      const data = Object.fromEntries(fields.map(n => [n, field(n).value]));
      const btn = form.querySelector('button[type="submit"]');
      if (CFG.contactEndpoint) {
        // Any form backend that accepts JSON (Formspree, Basin, a serverless function…).
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
          const r = await fetch(CFG.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error(r.status);
          done();
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
          error.textContent = `Sorry, your message didn't go through. Please call (210) 564-0147 or email ${CFG.contactEmail}.`;
          error.hidden = false;
        }
        return;
      }
      // No form backend configured: hand the message to the visitor's email app.
      const body = `${data.msg}\n\n— ${data.name}\n${data.email}${data.phone ? '\n' + data.phone : ''}${data.company ? '\n' + data.company : ''}\nI am a: ${data.who}`;
      location.href = `mailto:${CFG.contactEmail}?subject=${encodeURIComponent(data.topic + ' – ' + data.name)}&body=${encodeURIComponent(body)}`;
      done();
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

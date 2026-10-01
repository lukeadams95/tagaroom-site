(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const menuToggle = $('[data-menu-toggle]');
  const mobileMenu = $('[data-mobile-menu]');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuToggle.setAttribute('aria-expanded', String(open));
    });

    // Only one sub-list open at a time
    const toggles = $$('[data-m-toggle]', mobileMenu);
    toggles.forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        const sub = t.nextElementSibling;
        const willOpen = sub.hidden;
        toggles.forEach(o => {
          o.nextElementSibling.hidden = true;
          o.setAttribute('aria-expanded', 'false');
        });
        sub.hidden = !willOpen;
        t.setAttribute('aria-expanded', String(willOpen));
      });
    });
  }

  /* ---------- Cart ---------- */
  let cart = 0;
  let qty = 1;
  const qtyEl = $('[data-qty]');
  const renderCart = () => $$('[data-cart-count]').forEach(el => { el.textContent = cart; });
  const renderQty = () => { if (qtyEl) qtyEl.textContent = qty; };
  $('[data-qty-up]')?.addEventListener('click', () => { qty += 1; renderQty(); });
  $('[data-qty-down]')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); renderQty(); });
  $('[data-add-to-cart]')?.addEventListener('click', () => {
    cart += qty;
    qty = 1;
    renderCart();
    renderQty();
  });

  /* ---------- Category search ---------- */
  const catGrid = $('[data-cat-grid]');
  const catSearch = $('[data-cat-search]');
  const catEmpty = $('[data-cat-empty]');
  if (catGrid && catSearch) {
    const tiles = $$('.cat-tile', catGrid);

    // Pad the last row with blank cells so the 1px grid lines stay complete.
    const updateFillers = () => {
      $$('.cat-filler', catGrid).forEach(f => f.remove());
      const visible = tiles.filter(t => !t.hidden).length;
      const cols = getComputedStyle(catGrid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      const missing = visible ? (cols - (visible % cols)) % cols : 0;
      for (let i = 0; i < missing; i++) {
        const f = document.createElement('div');
        f.className = 'cat-filler';
        f.setAttribute('aria-hidden', 'true');
        catGrid.appendChild(f);
      }
    };

    const filter = () => {
      const q = catSearch.value.trim().toLowerCase();
      let shown = 0;
      tiles.forEach(t => {
        const match = $('h3', t).textContent.toLowerCase().includes(q);
        t.hidden = !match;
        if (match) shown++;
      });
      catEmpty.hidden = shown !== 0;
      updateFillers();
    };

    catSearch.addEventListener('input', filter);
    window.addEventListener('resize', updateFillers);
    filter();
  }

  /* ---------- Testimonials ---------- */
  const revTrack = $('[data-rev-track]');
  if (revTrack) {
    const step = dir => () => revTrack.scrollBy({ left: dir * 424, behavior: reducedMotion ? 'auto' : 'smooth' });
    $('[data-rev-prev]')?.addEventListener('click', step(-1));
    $('[data-rev-next]')?.addEventListener('click', step(1));

    $$('[data-read-more]', revTrack).forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.review');
        const open = btn.getAttribute('aria-expanded') !== 'true';
        $('[data-short]', card).hidden = open;
        $('[data-full]', card).hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Show less' : 'Read more';
      });
    });
  }

  /* ---------- Logo marquee: endless drift, draggable, pauses on hover ---------- */
  const vp = $('[data-marquee]');
  const track = $('[data-marquee-track]');
  if (vp && track) {
    // Duplicate the set so the strip can wrap seamlessly.
    Array.from(track.children).forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    const SPEED = 0.05; // px per ms
    let x = 0;
    let dragging = false;
    let hover = false;
    let startX = 0;
    let startOffset = 0;
    let last = performance.now();

    const half = () => track.scrollWidth / 2;
    const wrap = () => { const h = half(); if (h > 0) x = ((x % h) + h) % h; };

    const tick = t => {
      const dt = Math.min(t - last, 50);
      last = t;
      if (!dragging && !hover && !reducedMotion) x += dt * SPEED;
      wrap();
      track.style.transform = 'translateX(' + (-x) + 'px)';
      requestAnimationFrame(tick);
    };

    vp.addEventListener('pointerdown', e => {
      dragging = true;
      startX = e.clientX;
      startOffset = x;
      vp.classList.add('is-dragging');
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', e => { if (dragging) x = startOffset - (e.clientX - startX); });
    const end = () => { dragging = false; vp.classList.remove('is-dragging'); };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('mouseenter', () => { hover = true; });
    vp.addEventListener('mouseleave', () => { hover = false; });
    vp.addEventListener('dragstart', e => e.preventDefault());

    requestAnimationFrame(tick);
  }
})();

// Homepage: inline Ecwid store view, featured product, reviews carousel, logo marquee.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Inline store ----------
     Shop links go to the shop pages. The hidden inline store still opens for
     old #!/ links and keeps the cart badge current. */
  const storeView = $('[data-store-view]');
  const homeView = $('[data-home-view]');
  const storeEl = $('#my-store-1805034');
  let mounted = null;
  const mount = () => mounted || (mounted = window.TAR.mountStore(storeEl));

  const showStore = on => {
    storeView.hidden = !on;
    homeView.hidden = on;
  };
  const openStore = route => {
    showStore(true);
    mount();
    if (route && location.hash !== route) location.hash = route;
    window.scrollTo({ top: 0 });
    // Ecwid measures its container; nudge it after the view becomes visible.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  };
  const closeStore = () => {
    showStore(false);
    history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: 0 });
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#!/"]');
    if (a) { e.preventDefault(); openStore(a.getAttribute('href')); return; }
    if (e.target.closest('[data-click="closeStore"]')) { e.preventDefault(); closeStore(); }
  });
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#!/')) { if (storeView.hidden) openStore(); }
    else if (!storeView.hidden) closeStore();
  });
  window.TAR.routeCartToCartPage();
  if (location.hash.startsWith('#!/')) openStore();

  // Category search: Enter searches the store on the All Products page.
  const search = $('[data-keydown="onSearchKey"]');
  if (search) search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const v = search.value.trim();
    location.href = 'shop/all-products.html' + (v ? '#!/~/search/keyword=' + encodeURIComponent(v) : '#store');
  });

  // Load the store quietly once the page is idle so the cart badge stays current.
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 2500));
  window.addEventListener('load', () => idle(() => { if (!mounted) window.TAR.loadEcwid().then(() => mount()).catch(() => {}); }));

  /* ---------- Moving tips videos ----------
     Thumbnails load with the page; the YouTube player only loads when clicked. */
  $$('[data-yt]').forEach(btn => btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
    f.title = btn.getAttribute('aria-label').replace('Play video: ', '');
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    f.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;border:0';
    btn.replaceWith(f);
  }));

  /* ---------- Reviews ---------- */
  const track = $('[data-rev-track]');
  if (track) {
    const step = d => () => track.scrollBy({ left: d * 424, behavior: reducedMotion ? 'auto' : 'smooth' });
    $('[data-click="prev"]')?.addEventListener('click', step(-1));
    $('[data-click="next"]')?.addEventListener('click', step(1));
    $$('[data-click="tog"]', track).forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
        const card = btn.closest('figure');
        const open = btn.getAttribute('aria-expanded') !== 'true';
        $('[data-short]', card).hidden = open;
        $('[data-full]', card).hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Show less' : 'Read more';
      });
    });
  }

  /* ---------- Logo marquee: endless drift, draggable, pauses on hover ----------
     The list is rendered twice so it can wrap seamlessly. */
  const vp = $('[data-marquee]');
  const tr = $('[data-marquee-track]');
  if (vp && tr) {
    let x = 0, drag = false, hover = false, sx = 0, sx0 = 0, last = performance.now();
    const wrap = () => { const h = tr.scrollWidth / 2; if (h > 0) x = ((x % h) + h) % h; };
    const tick = t => {
      const dt = Math.min(t - last, 50);
      last = t;
      if (!drag && !hover && !reducedMotion) x += dt * 0.05;
      wrap();
      tr.style.transform = `translateX(${-x}px)`;
      requestAnimationFrame(tick);
    };
    vp.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; sx0 = x; vp.style.cursor = 'grabbing'; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener('pointermove', e => { if (drag) x = sx0 - (e.clientX - sx); });
    const end = () => { drag = false; vp.style.cursor = 'grab'; };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('mouseenter', () => { hover = true; });
    vp.addEventListener('mouseleave', () => { hover = false; });
    vp.addEventListener('dragstart', e => e.preventDefault());
    requestAnimationFrame(tick);
  }
})();

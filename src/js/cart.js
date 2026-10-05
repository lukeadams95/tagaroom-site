// Cart page: the designed cart (Cart.dc.html) showing the visitor's real Ecwid cart.
// Ecwid stays the source of truth; checkout runs in Ecwid's secure checkout.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.TAR_CONFIG || {};
  const THRESHOLD = Number(CFG.freeShippingThreshold) || 75;
  const ROOT = window.TAR_ROOT || '';
  const NATIVE_CART = ROOT + 'shop/all-products.html?native-cart#!/~/cart';
  const money = n => '$' + (Number(n) || 0).toFixed(2);

  const full = $('[data-cart-full]');
  const empty = $('[data-cart-empty]');
  const cross = $('[data-cross]');
  const bar = $('[data-mobile-bar]');
  const countLabel = $('[data-count-label]');
  const tpl = $('[data-line-tpl]');
  const list = tpl.parentNode;
  const checkoutView = $('[data-checkout-view]');
  const storeEl = $('#my-store-1805034');

  countLabel.textContent = 'Loading your cart…';
  let Ecwid = null;
  let cart = { items: [] };
  let busy = false;
  const order = []; // stable display order across remove/re-add

  /* ---------- Rendering ---------- */
  const keyOf = it => it.product.id + '|' + JSON.stringify(it.options || {});
  const imageOf = p => p.imageUrl || p.thumbnailUrl || p.smallThumbnailUrl || p.hdThumbnailUrl || '';
  const variantOf = it => Object.values(it.options || {}).filter(Boolean).join(' · ') || it.product.sku || '';

  function render() {
    const items = (cart.items || []).map((it, index) => ({ it, index, key: keyOf(it) }));
    items.forEach(x => { if (!order.includes(x.key)) order.push(x.key); });
    items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    const count = items.reduce((n, x) => n + x.it.quantity, 0);
    const has = items.length > 0;

    full.hidden = !has;
    empty.hidden = has;
    countLabel.hidden = !has;
    countLabel.textContent = count + (count === 1 ? ' item' : ' items');
    window.TAR.setCount(count);

    $$('[data-line]', list).forEach(n => n.remove());
    items.forEach(({ it, index }, k) => {
      const p = it.product;
      const line = tpl.content.firstElementChild.cloneNode(true);
      line.setAttribute('data-line', '');
      line.style.borderTop = k ? '1px solid #E3E8EE' : '0 solid transparent';
      const pic = $('[role="img"]', line);
      pic.setAttribute('aria-label', p.name);
      pic.style.backgroundImage = imageOf(p) ? `url("${imageOf(p)}")` : 'none';
      const name = $('a', line);
      name.textContent = p.name;
      name.href = `${ROOT}shop/all-products.html?product=${p.id}`;
      const spans = $$('span', line);
      spans[0].textContent = variantOf(it);
      spans[0].hidden = !variantOf(it);
      spans[2].textContent = money(p.price) + ' each';
      $('[data-click="dec"] + span', line).textContent = it.quantity;
      spans[spans.length - 1].textContent = money(p.price * it.quantity);
      $('[data-click="dec"]', line).disabled = it.quantity <= 1;
      $('[data-click="inc"]', line).addEventListener('click', () => run(done => Ecwid.Cart.addProduct({ id: p.id, quantity: 1, options: it.options, callback: done })));
      $('[data-click="dec"]', line).addEventListener('click', () => run(done => Ecwid.Cart.removeProduct(index, () => Ecwid.Cart.addProduct({ id: p.id, quantity: it.quantity - 1, options: it.options, callback: done }))));
      $('[data-click="remove"]', line).addEventListener('click', () => run(done => Ecwid.Cart.removeProduct(index, done)));
      list.appendChild(line);
    });

    const sub = items.reduce((n, x) => n + x.it.product.price * x.it.quantity, 0);
    totals(sub);
    if (has && Ecwid.Cart.calculateTotal) Ecwid.Cart.calculateTotal(o => { if (o && typeof o.subtotal === 'number') totals(o.subtotal); });
    layout();
  }

  function totals(sub) {
    const unlocked = sub >= THRESHOLD;
    const pct = Math.min(100, (sub / THRESHOLD) * 100);
    $$('[data-ship-msg]').forEach(el => { el.textContent = unlocked ? '🎉 You\'ve unlocked FREE shipping!' : `You're ${money(THRESHOLD - sub)} away from FREE shipping!`; });
    $$('[data-ship-bar]').forEach(el => { el.style.width = pct + '%'; el.style.backgroundSize = (pct ? 10000 / pct : 100) + '% 100%'; });
    $$('[data-subtotal]').forEach(el => { el.textContent = money(sub); });
    $$('[data-total]').forEach(el => { el.textContent = money(sub); });
    const ship = $('[data-ship-val]');
    ship.textContent = unlocked ? 'FREE' : 'Calculated at next step';
    ship.style.color = unlocked ? '#1E9E1B' : '#6B7A8C';
  }

  // Mobile: sticky total + checkout bar (design: below 900px with items in the cart).
  function layout() {
    const mobile = window.innerWidth < 900;
    const show = mobile && !full.hidden && checkoutView.hidden;
    bar.hidden = !show;
    full.style.paddingBottom = mobile ? '96px' : '0px';
    cross.style.paddingBottom = show ? '112px' : '72px';
  }
  window.addEventListener('resize', layout);

  // Serialize cart edits; Ecwid fires OnCartChanged, which re-renders.
  function run(op) {
    if (busy || !Ecwid) return;
    busy = true;
    $$('[data-line] button').forEach(b => { b.disabled = true; });
    op(() => { busy = false; Ecwid.Cart.get(c => { cart = c; render(); }); });
  }

  /* ---------- Promo code (applied in Ecwid's checkout) ---------- */
  const promo = $('[data-promo]');
  const promoMsg = $('[data-promo-msg]');
  $('[data-click="togglePromo"]').addEventListener('click', () => { promo.hidden = !promo.hidden; });
  $('[data-click="applyPromo"]').addEventListener('click', () => {
    const v = $('[data-input="setPromo"]').value.trim();
    promoMsg.textContent = v ? `Code "${v}" will be applied at checkout.` : 'Enter a promo code.';
    promoMsg.hidden = false;
  });

  /* ---------- Checkout ---------- */
  $$('[data-checkout]').forEach(a => {
    a.href = NATIVE_CART; // works even if the script below can't run
    a.addEventListener('click', e => {
      if (!Ecwid) return;
      e.preventDefault();
      full.hidden = true;
      cross.hidden = true;
      bar.hidden = true;
      checkoutView.hidden = false;
      window.scrollTo({ top: 0 });
      Ecwid.Cart.gotoCheckout();
      // Ecwid measures its container; nudge it now that it is visible.
      setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    });
  });

  /* ---------- Load Ecwid ---------- */
  const fail = () => {
    if (Ecwid) return;
    countLabel.hidden = false;
    countLabel.innerHTML = `We couldn't load your cart here. <a href="${NATIVE_CART}" style="color:#fff;text-decoration:underline">Open it in the store</a>.`;
  };
  const timer = setTimeout(fail, 15000);
  window.TAR.mountStore(storeEl).then(api => {
    clearTimeout(timer);
    Ecwid = api;
    Ecwid.OnCartChanged.add(c => { if (!busy) { cart = c; render(); } });
    Ecwid.Cart.get(c => { cart = c; render(); });
  }).catch(fail);
})();

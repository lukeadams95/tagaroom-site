// Shop pages: Ecwid product browser, search, and the designed "Featured Products" cards.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.getElementById('my-store-1805034');
  if (!root) return;

  window.TAR.routeCartToCartPage();
  const ready = window.TAR.mountStore(root, { categoryId: Number(root.dataset.category) || 0 });

  // ?product=<id> (used by the cart page) opens that product.
  const productId = Number(new URLSearchParams(location.search).get('product'));
  if (productId) ready.then(Ecwid => Ecwid.openPage('product', { id: productId }));

  // Search box above the store: Enter runs an Ecwid search.
  const search = $('[data-keydown="onSearchKey"]');
  if (search) search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const v = search.value.trim();
    location.hash = v ? '#!/~/search/keyword=' + encodeURIComponent(v) : '#!/~/shop';
    root.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Featured products ----------
     When Ecwid shows its storefront's featured products, hide Ecwid's grid and
     show them as the design's large product cards instead (same as the design's scrape()). */
  const section = $('[data-featured]');
  const tpl = $('[data-featured-tpl]');
  let shown = '';

  const scrape = () => {
    const on = !!root.querySelector('.ec-page-title__featured-products');
    root.classList.toggle('hide-featured-grid', on);
    const items = on ? Array.from(root.querySelectorAll('.grid-product')).map(c => {
      const w = c.querySelector('[data-product-id]');
      const a = c.querySelector('a.grid-product__title');
      const im = c.querySelector('img.grid-product__picture');
      const p = c.querySelector('.grid-product__price-amount') || c.querySelector('.grid-product__price');
      return w && a ? { id: +w.dataset.productId, title: (c.querySelector('.grid-product__title-inner') || a).textContent.trim(), href: a.getAttribute('href'), img: im ? im.getAttribute('src') || '' : '', price: p ? p.textContent.trim() : '' } : null;
    }).filter(Boolean) : [];
    const key = items.map(i => i.id).join();
    if (key === shown) return;
    shown = key;
    render(items);
  };

  const render = items => {
    section.querySelectorAll('[data-featured-card]').forEach(n => n.remove());
    section.hidden = !items.length;
    items.forEach(f => {
      const card = tpl.content.firstElementChild.cloneNode(true);
      card.setAttribute('data-featured-card', '');
      const open = e => {
        e.preventDefault();
        location.hash = f.href.slice(f.href.indexOf('#'));
        window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 100 });
      };
      const pic = card.querySelector('a[role="img"]');
      pic.href = f.href;
      pic.setAttribute('aria-label', f.title);
      pic.style.backgroundImage = f.img ? `url("${f.img}")` : 'none';
      pic.addEventListener('click', open);
      const title = card.querySelector('h2 a');
      title.href = f.href;
      title.textContent = f.title;
      title.addEventListener('click', open);
      Array.from(card.querySelectorAll('div')).find(d => d.textContent === '__PRICE__').textContent = f.price;
      let qty = 1;
      const qtyEl = card.querySelector('[data-click="down"] + span');
      const setQty = n => { qty = Math.max(1, n); qtyEl.textContent = qty; };
      card.querySelector('[data-click="down"]').addEventListener('click', () => setQty(qty - 1));
      card.querySelector('[data-click="up"]').addEventListener('click', () => setQty(qty + 1));
      card.querySelector('[data-click="add"]').addEventListener('click', e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        ready.then(Ecwid => Ecwid.Cart.addProduct({ id: f.id, quantity: qty, callback: () => { btn.disabled = false; setQty(1); } }));
      });
      tpl.parentNode.appendChild(card);
    });
  };

  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(scrape, 250); }).observe(root, { childList: true, subtree: true });
})();

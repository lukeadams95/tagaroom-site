// Shared behavior for every page: mobile menu, cart badge, Ecwid loader.
(() => {
  'use strict';

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const CFG = window.TAR_CONFIG || {};
  const STORE_ID = CFG.ecwidStoreId || 1805034;
  const COUNT_KEY = 'tar_cart_count';

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    const subs = $$('[data-m-toggle]', menu);
    subs.forEach(t => t.addEventListener('click', e => {
      e.preventDefault();
      const willOpen = t.nextElementSibling.hidden;
      subs.forEach(o => { o.nextElementSibling.hidden = true; o.setAttribute('aria-expanded', 'false'); });
      t.nextElementSibling.hidden = !willOpen;
      t.setAttribute('aria-expanded', String(willOpen));
    }));
  }

  /* ---------- Cart badge ----------
     Ecwid owns the cart. Pages that load Ecwid publish the count here so pages
     without the store can still show it. */
  const read = () => { try { return parseInt(localStorage.getItem(COUNT_KEY), 10) || 0; } catch (e) { return 0; } };
  const paint = n => $$('[data-cart-count]').forEach(el => { el.textContent = n; });
  const setCount = n => { try { localStorage.setItem(COUNT_KEY, String(n)); } catch (e) {} paint(n); };
  paint(read());
  window.addEventListener('storage', e => { if (e.key === COUNT_KEY) paint(read()); });

  /* ---------- Ecwid ---------- */
  let loading = null;
  // Load the Ecwid storefront script once.
  function loadEcwid() {
    if (loading) return loading;
    window.ec = window.ec || {};
    window.ec.config = window.ec.config || {};
    window.ec.config.chameleon = {
      colors: { 'color-button': '#0169B8', 'color-price': '#0169B8', 'color-link': '#0169B8', 'color-title': '#111111', 'color-foreground': '#111111', 'color-background': '#FFFFFF' },
      font: { fontFamily: 'Archivo', fontFamilyCustom: 'Archivo' },
    };
    loading = new Promise((resolve, reject) => {
      if (window.xProductBrowser) return resolve();
      const s = document.createElement('script');
      s.setAttribute('data-cfasync', 'false');
      s.charset = 'utf-8';
      s.src = `https://app.ecwid.com/script.js?${STORE_ID}&data_platform=code`;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Ecwid failed to load'));
      document.body.appendChild(s);
    });
    return loading;
  }

  // Resolves with window.Ecwid once its JS API is ready, and keeps the badge in sync.
  let api = null;
  function onApi() {
    if (api) return api;
    api = new Promise(resolve => {
      const ready = () => {
        window.Ecwid.OnCartChanged.add(cart => setCount(cart.productsQuantity || 0));
        window.Ecwid.Cart.get(cart => setCount(cart.productsQuantity || 0));
        resolve(window.Ecwid);
      };
      const wait = () => (window.Ecwid && window.Ecwid.OnAPILoaded ? window.Ecwid.OnAPILoaded.add(ready) : setTimeout(wait, 50));
      wait();
    });
    return api;
  }

  // Mount the Ecwid product browser into `el` (same options as the designs).
  async function mountStore(el, { categoryId } = {}) {
    await loadEcwid();
    const args = ['categoriesPerRow=3', 'views=grid(20,3) list(60) table(60)', 'categoryView=grid', 'searchView=list'];
    if (categoryId) args.push('defaultCategoryId=' + categoryId);
    args.push('id=' + el.id);
    window.xProductBrowser.apply(null, args);
    return onApi();
  }

  // On store pages, Ecwid's own cart route opens the custom cart page instead.
  // cart.html links back with ?native-cart when it needs Ecwid's cart itself.
  function routeCartToCartPage() {
    const go = () => {
      if (/^#!\/~\/cart\b/.test(location.hash) && !/native-cart/.test(location.search)) {
        location.href = (window.TAR_ROOT || '') + 'cart.html';
      }
    };
    window.addEventListener('hashchange', go);
    go();
  }

  window.TAR = { loadEcwid, mountStore, onApi, setCount, routeCartToCartPage, config: CFG };
})();

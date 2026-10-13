// Audience pages: the live Ecwid products for the page's store category.
(() => {
  'use strict';
  const root = document.getElementById('my-store-1805034');
  if (!root) return;
  window.TAR.routeCartToCartPage();
  window.TAR.mountStore(root, { categoryId: Number(root.dataset.category) || 0 });
})();

// Gallery: lightbox with keyboard and arrow navigation.
(() => {
  'use strict';
  const lb = document.querySelector('[data-lightbox]');
  if (!lb) return;
  const thumbs = Array.from(document.querySelectorAll('button[data-click="open"]'));
  const photos = thumbs.map(b => b.querySelector('img').getAttribute('src'));
  const img = lb.querySelector('[data-lb-img]');
  const count = lb.querySelector('[data-lb-count]');
  let i = -1, opener = null;

  const show = k => {
    i = (k + photos.length) % photos.length;
    img.style.background = `url("${photos[i]}") center/contain no-repeat`;
    count.textContent = `${i + 1} / ${photos.length}`;
  };
  const close = () => { lb.hidden = true; i = -1; if (opener) opener.focus(); };

  thumbs.forEach((b, k) => b.addEventListener('click', () => { opener = b; show(k); lb.hidden = false; lb.querySelector('button[data-click="close"]').focus(); }));
  lb.addEventListener('click', e => {
    const a = e.target.closest('[data-click]');
    if (a && a.dataset.click === 'prev') { e.stopPropagation(); show(i - 1); }
    else if (a && a.dataset.click === 'next') { e.stopPropagation(); show(i + 1); }
    else close(); // like the design, a click anywhere else closes the viewer
  });
  window.addEventListener('keydown', e => {
    if (i < 0) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(i + 1);
    if (e.key === 'ArrowLeft') show(i - 1);
  });
})();

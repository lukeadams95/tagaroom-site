// Policy pages: table of contents (smooth scroll, active section), mobile
// "Jump to section", Back to top.
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduced ? 'auto' : 'smooth';
  const links = Array.from(document.querySelectorAll('[data-toc-link]'));
  const sections = Array.from(document.querySelectorAll('.pol-section[id]'));
  const jump = document.querySelector('.pol-jump');

  links.forEach(a => a.addEventListener('click', e => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    // Close the mobile dropdown first so the page doesn't shift after scrolling starts.
    if (jump && jump.contains(a)) jump.open = false;
    target.scrollIntoView({ behavior, block: 'start' });
    history.replaceState(null, '', '#' + target.id);
    target.querySelector('h2').setAttribute('tabindex', '-1');
    target.querySelector('h2').focus({ preventScroll: true });
  }));

  // Highlight the section currently being read.
  const setActive = id => links.forEach(a => {
    const on = a.getAttribute('href') === '#' + id;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  // The current section is the last one whose top has passed just below the header.
  const update = () => {
    let current = sections[0];
    for (const sec of sections) if (sec.getBoundingClientRect().top <= 140) current = sec;
    if (current) setActive(current.id);
  };
  if (links.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(update, { rootMargin: '-120px 0px -50% 0px', threshold: [0, 1] });
    sections.forEach(s => io.observe(s));
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  // Back to top appears after scrolling down.
  const top = document.querySelector('[data-back-to-top]');
  if (top) {
    const toggle = () => { top.hidden = window.scrollY < 600; };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    top.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior });
      document.querySelector('.pol-hero h1').setAttribute('tabindex', '-1');
      document.querySelector('.pol-hero h1').focus({ preventScroll: true });
    });
  }
})();

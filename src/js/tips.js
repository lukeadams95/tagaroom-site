// Moving Tips: category pills filter the video groups.
(() => {
  'use strict';
  const pills = Array.from(document.querySelectorAll('button[data-click="pick"]'));
  const groups = Array.from(document.querySelectorAll('[data-group]'));
  const pick = cat => {
    pills.forEach(p => {
      const on = p.textContent.trim() === cat;
      p.style.background = on ? '#0169B8' : '#fff';
      p.style.color = on ? '#fff' : '#0169B8';
      p.setAttribute('aria-pressed', String(on));
    });
    groups.forEach(g => { g.hidden = cat !== 'All' && g.dataset.group !== cat; });
  };
  pills.forEach(p => p.addEventListener('click', () => pick(p.textContent.trim())));
  pick('All');
})();

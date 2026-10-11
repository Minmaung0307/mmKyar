'use strict';
(function () {
  const links = window.KYAR_SITE_CONFIG?.links || {};
  const defaults = {privacy: './privacy.html', terms: './terms.html'};
  document.querySelectorAll('[data-footer-link]').forEach(link => {
    const configured = links[link.dataset.footerLink] || defaults[link.dataset.footerLink];
    let url;
    try {
      if (typeof configured === 'string' && configured.trim()) {
        const parsed = new URL(configured.trim(), location.href);
        if (['https:', 'http:'].includes(parsed.protocol)) url = parsed;
      }
    } catch {}
    if (url) {
      link.href = url.href;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
      if (url.origin !== location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('title', 'မကြာမီ ရနိုင်ပါမယ်');
    }
  });
  const year = document.getElementById('copyright-year');
  const updateYear = () => { year.textContent = new Date().getFullYear(); };
  updateYear();
  window.addEventListener('pageshow', updateYear);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateYear();
  });
})();

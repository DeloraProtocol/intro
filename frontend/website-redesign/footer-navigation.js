(() => {
 const root = document.documentElement;
 window.addEventListener('pageshow', () => root.classList.remove('footer-navigating'));
 document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const link = event.target instanceof Element ? event.target.closest('.site-footer a[href]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
  // Browsers with cross-document view transitions already animate the change.
  if ('onpageswap' in window) return;
  event.preventDefault();
  root.classList.add('footer-navigating');
  setTimeout(() => { location.href = url.href; }, 140);
 });
})();

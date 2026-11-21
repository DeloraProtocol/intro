(() => {
 if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const elements = document.querySelectorAll('.suite-intro, .d-dev-panel');
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   entry.target.classList.add('reveal-visible');
   observer.unobserve(entry.target);
  }
 }, {threshold: .12});
 for (const el of elements) {
  const rect = el.getBoundingClientRect();
  if (rect.top < innerHeight && rect.bottom > 0) continue;
  el.classList.add('reveal-ready');
  observer.observe(el);
 }
})();

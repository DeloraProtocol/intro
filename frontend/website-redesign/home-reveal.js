(() => {
 if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const elements = document.querySelectorAll('.flows-heading, .suite-intro, .faq-heading');
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   entry.target.classList.add('home-reveal-visible');
   observer.unobserve(entry.target);
  }
 }, {threshold: 0, rootMargin: '0px 0px -24px 0px'});
 for (const el of elements) {
  const rect = el.getBoundingClientRect();
  if (rect.top < innerHeight && rect.bottom > 0) continue;
  if (rect.top < 0) continue;
  el.classList.add('home-reveal-ready');
  observer.observe(el);
 }
})();

(() => {
 const root = document.querySelector('.performance');
 if (!root || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const cards = [...root.querySelectorAll('.performance-grid article')];
 if (!cards.length || typeof cards[0].animate !== 'function') return;
 const observer = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  observer.disconnect();
  cards.forEach((card, index) => {
   card.animate([
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
   ], { duration: 500, delay: index * 65, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  });
 }, { rootMargin: '0px 0px 80px 0px', threshold: 0 });
 observer.observe(root);
})();

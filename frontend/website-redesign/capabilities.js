// Animate only illustrations currently in view; the default artwork is complete.
const capabilityCards = document.querySelectorAll('.capability');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const capabilityObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('is-active', entry.isIntersecting);
 }), { threshold: .15 });
 capabilityCards.forEach(card => capabilityObserver.observe(card));
 document.addEventListener('visibilitychange', () => capabilityCards.forEach(card => card.classList.toggle('is-paused', document.hidden)));
}

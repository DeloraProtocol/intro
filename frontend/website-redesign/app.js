if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 document.documentElement.classList.add('js-motion');
 const scenes = document.querySelectorAll('.hero-stage, .card-stage');
 const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('motion-paused', !entry.isIntersecting)), {threshold: .05});
 scenes.forEach(el => motionObserver.observe(el));
 document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('motion-paused', document.hidden));
 const elements = document.querySelectorAll('.section-intro, .proof-items > div, .closing > *');
 const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }), {threshold: .08, rootMargin: '0px 0px -30px 0px'});
 elements.forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
}

// Count each metric once when its card first enters the viewport.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const metricCards = [...document.querySelectorAll('.proof-items > div')];
 const metrics = [
  { value: 18, format: value => `$${Math.round(value)}B+` },
  { value: 99.999, format: value => `>${value.toFixed(3)}%` },
  { value: 5, format: value => `<${Math.round(value)}s` }
 ];
 function animateMetric(card, index) {
  if (card.dataset.counted || !metrics[index]) return;
  card.dataset.counted = 'true';
  const number = card.querySelector('strong');
  const finalText = number.getAttribute('aria-label');
  const start = performance.now();
  const duration = 1400;
  function tick(now) {
   const progress = Math.min((now - start) / duration, 1);
   const eased = 1 - Math.pow(1 - progress, 3);
   number.textContent = progress === 1 ? finalText : metrics[index].format(metrics[index].value * eased);
   if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
 }
 if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) {
    animateMetric(entry.target, metricCards.indexOf(entry.target));
    counterObserver.unobserve(entry.target);
   }
  }), { threshold: .5 });
  metricCards.forEach((card, index) => {
   const number = card.querySelector('strong');
   if (!number || !metrics[index]) return;
   number.setAttribute('aria-label', number.textContent);
   number.textContent = metrics[index].format(0);
   counterObserver.observe(card);
  });
 }
}

// Animate the illustrative charts once, while leaving the complete data visible without JS.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const dashboard = document.querySelector('.dashboard-demo');
 if (dashboard) {
  dashboard.querySelectorAll('.chart-bars').forEach(chart => chart.querySelectorAll('.chart-bar').forEach((bar, index) => bar.style.setProperty('--bar-index', index)));
  const dashboardObserver = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('chart-enter'); dashboardObserver.unobserve(entry.target); }
  }), { threshold: .2 });
  dashboardObserver.observe(dashboard);
 }
}

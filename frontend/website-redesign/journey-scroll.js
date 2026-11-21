(() => {
 const items = [...document.querySelectorAll('.journey')];
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 if (!items.length) return;
 let scheduled = false;
 function update() {
  scheduled = false;
  if (reduced.matches || document.querySelector('.journeys.is-pinned')) {
   for (const item of items) { item.classList.remove('journey-scroll-active'); item.style.removeProperty('--journey-progress'); }
   return;
  }
  for (const item of items) {
   const top = item.getBoundingClientRect().top;
   const progress = Math.min(1, Math.max(0, (innerHeight * .90 - top) / (innerHeight * .62)));
   item.style.setProperty('--journey-progress', progress.toFixed(4));
   item.classList.add('journey-scroll-active');
  }
 }
 function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', schedule, {passive:true});
 reduced.addEventListener('change', schedule);
 update();
})();

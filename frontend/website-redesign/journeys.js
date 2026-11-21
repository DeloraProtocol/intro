(() => {
 const sections = [...document.querySelectorAll('.journey')];
 const links = [...document.querySelectorAll('.journeys-nav a')];
 if (!sections.length || !links.length) return;
 let scheduled = false;
 function update() {
  scheduled = false;
  if (document.querySelector('.journeys.is-pinned')) return;
  const marker = window.innerHeight * .5;
  let current = sections[0];
  for (const section of sections) {
   if (section.getBoundingClientRect().top <= marker) current = section;
  }
  for (const link of links) {
   const active = link.hash === '#' + current.id;
   link.classList.toggle('is-active', active);
   if (active) link.setAttribute('aria-current', 'true');
   else link.removeAttribute('aria-current');
  }
 }
 function schedule() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
 }
 window.addEventListener('scroll', schedule, { passive: true });
 window.addEventListener('resize', schedule, { passive: true });
 update();
})();

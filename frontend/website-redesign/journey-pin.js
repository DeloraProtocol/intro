(() => {
 const section = document.querySelector('.journeys');
 const layout = section?.querySelector('.journeys-layout');
 const list = layout?.querySelector('.journeys-list');
 const scenes = list ? [...list.querySelectorAll('.journey')] : [];
 const links = layout ? [...layout.querySelectorAll('.journeys-nav a')] : [];
 if (!section || !layout || scenes.length !== 3 || links.length !== scenes.length) return;
 const desktop = matchMedia('(min-width: 901px) and (hover: hover)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const stage = document.createElement('div');
 stage.className = 'journeys-stage';
 layout.before(stage);
 stage.append(layout);
 let enabled = false, frame = 0, active = -1, step = 0, top = 0, travel = 0;

 function setActive(index) {
  if (index === active) return;
  active = index;
  scenes.forEach((scene, i) => {
   const selected = i === index;
   scene.classList.toggle('is-current', selected);
   scene.toggleAttribute('inert', !selected);
   if (selected) scene.removeAttribute('aria-hidden');
   else scene.setAttribute('aria-hidden', 'true');
   links[i].classList.toggle('is-active', selected);
   if (selected) links[i].setAttribute('aria-current', 'true');
   else links[i].removeAttribute('aria-current');
  });
 }
 function update() {
  frame = 0;
  if (!enabled) return;
  const distance = Math.max(0, Math.min(travel, top - stage.getBoundingClientRect().top));
  setActive(Math.max(0, Math.min(scenes.length - 1, Math.floor((distance + step * .5) / step))));
 }
 function schedule() { if (!frame) frame = requestAnimationFrame(update); }
 function disable() {
  enabled = false;
  section.classList.remove('is-pinned');
  section.style.removeProperty('--journey-pin-top');
  stage.style.removeProperty('height');
  scenes.forEach(scene => { scene.classList.remove('is-current'); scene.removeAttribute('inert'); scene.removeAttribute('aria-hidden'); });
  active = -1;
  // Let the ordinary section navigation and reveal logic take over again.
  dispatchEvent(new Event('scroll'));
 }
 function configure() {
  if (!desktop.matches || reduced.matches || !CSS.supports('position', 'sticky')) { if (enabled) disable(); return; }
  section.classList.add('is-pinned');
  scenes.forEach(scene => { scene.classList.remove('journey-scroll-active'); scene.style.removeProperty('--journey-progress'); });
  top = Math.max(105, Math.min(150, innerHeight * .15));
  section.style.setProperty('--journey-pin-top', `${top}px`);
  // Do not pin when its full content cannot fit beneath the fixed header.
  if (layout.offsetHeight > innerHeight - top - 24) { disable(); return; }
  step = Math.max(620, Math.min(900, innerHeight * .9));
  const hold = Math.max(220, Math.min(420, innerHeight * .4));
  travel = step * (scenes.length - 1) + hold;
  stage.style.height = `${Math.ceil(layout.offsetHeight + travel)}px`;
  enabled = true;
  active = -1;
  update();
 }
 function goTo(index, smooth = true) {
  const destination = stage.getBoundingClientRect().top + scrollY - top + step * index;
  window.scrollTo({top:destination, behavior:smooth ? 'smooth' : 'instant'});
 }
 links.forEach((link, index) => link.addEventListener('click', event => {
  if (!enabled || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.replaceState(null, '', link.hash);
  goTo(index);
 }));
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', configure, {passive:true});
 if (desktop.addEventListener) desktop.addEventListener('change', configure);
 if (reduced.addEventListener) reduced.addEventListener('change', configure);
 configure();
 // Keep direct links to individual scenes working after the layout is enhanced.
 const initial = links.findIndex(link => link.hash === location.hash);
 if (enabled && initial >= 0) requestAnimationFrame(() => goTo(initial, false));
 addEventListener('hashchange', () => {
  if (!enabled) return;
  const index = links.findIndex(link => link.hash === location.hash);
  if (index >= 0) goTo(index, false);
 });
})();

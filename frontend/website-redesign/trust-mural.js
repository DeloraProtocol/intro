(() => {
 const section = document.getElementById('trust');
 if (!section) return;
 const flow = section.querySelector('.trust-flow');
 const band = section.querySelector('.trust-band');
 const visual = section.querySelector('.trust-visual');
 const sticky = section.querySelector('.trust-sticky');
 const list = section.querySelector('.trust-steps');
 const dock = section.querySelector('.trust-steps-dock');
 const windowEl = section.querySelector('.trust-steps-window');
 const steps = [...section.querySelectorAll('.trust-step')];
 if (!flow || !band || !visual || !sticky || !list || !dock || !windowEl || !steps.length) return;
 // On narrow screens the steps are stacked, so give each step its own
 // static decorative preview instead of relying on the desktop sticky scene.
 const scenes = [...visual.querySelectorAll('.trust-art')];
 if (scenes.length === steps.length) {
  steps.forEach((step, index) => {
   const preview = document.createElement('div');
   preview.className = 'trust-step-visual';
   preview.setAttribute('aria-hidden', 'true');
   preview.append(scenes[index].cloneNode(true));
   step.append(preview);
  });
  flow.classList.add('has-mobile-previews');
 }
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const desktop = matchMedia('(min-width: 901px)');
 let frame = 0;
 let sectionVisible = !('IntersectionObserver' in window);
 let entered = false;
 let previousOffset = '';

 function resetSteps() {
  list.style.removeProperty('transform');
  windowEl.style.removeProperty('height');
  flow.style.removeProperty('--trust-flow-height');
  section.style.removeProperty('--trust-exit-space');
  previousOffset = '';
  steps.forEach((step, index) => {
   step.classList.toggle('is-active', index === 0);
   step.classList.remove('is-past', 'is-next');
  });
  visual.dataset.active = '0';
 }
 function update() {
  frame = 0;
  if (!sectionVisible || !flow.classList.contains('is-interactive')) return;
  const distance = Math.max(300, Math.min(400, innerHeight * .4));
  const finalStep = distance * (steps.length - 1 - .15);
  const hold = Math.max(80, Math.min(120, innerHeight * .12));
  const bottomPadding = Number.parseFloat(getComputedStyle(flow).paddingBottom) || 0;
  const flowHeight = `${Math.ceil(finalStep + hold + sticky.offsetHeight + bottomPadding)}px`;
  if (flow.style.getPropertyValue('--trust-flow-height') !== flowHeight) flow.style.setProperty('--trust-flow-height', flowHeight);
  const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;
  // Keep one viewport of dark background when the last step arrives,
  // then leave about one ordinary wheel movement before the next section.
  const exitScroll = 96;
  const exitSpace = `${Math.max(0, Math.ceil(innerHeight + exitScroll - hold - sticky.offsetHeight - bottomPadding - stickyTop))}px`;
  if (section.style.getPropertyValue('--trust-exit-space') !== exitSpace) section.style.setProperty('--trust-exit-space', exitSpace);
  const dockTop = Number.parseFloat(getComputedStyle(dock).top) || 0;
  const height = `${Math.max(240, Math.round(sticky.offsetHeight - (dockTop - stickyTop)))}px`;
  if (windowEl.style.height !== height) windowEl.style.height = height;
  const traveled = Math.max(0, stickyTop - flow.getBoundingClientRect().top);
  const active = Math.min(steps.length - 1, Math.floor((traveled + distance * .15) / distance));
  const offset = `${steps[active].offsetTop}px`;
  if (offset !== previousOffset) {
   previousOffset = offset;
   list.style.transform = `translate3d(0, -${offset}, 0)`;
  }
  steps.forEach((step, index) => {
   step.classList.toggle('is-active', index === active);
   step.classList.toggle('is-next', index === active + 1);
   step.classList.toggle('is-past', index < active);
  });
  visual.dataset.active = String(active);
 }
 function schedule() { if (!frame) frame = requestAnimationFrame(update); }
 function applyMotionPreference() {
  const interactive = desktop.matches && !reduced.matches && 'IntersectionObserver' in window;
  flow.classList.toggle('is-interactive', interactive);
  if (!interactive) resetSteps();
  else previousOffset = '';
  if (reduced.matches) band.classList.remove('is-entering');
  schedule();
 }
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   sectionVisible = entries[0].isIntersecting;
   if (sectionVisible && !entered && !reduced.matches) { entered = true; band.classList.add('is-entering'); }
   schedule();
  }, {rootMargin:'120px 0px 120px 0px', threshold:0});
  observer.observe(section);
 }
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', () => { previousOffset = ''; schedule(); }, {passive:true});
 if (reduced.addEventListener) reduced.addEventListener('change', applyMotionPreference);
 else if (reduced.addListener) reduced.addListener(applyMotionPreference);
 if (desktop.addEventListener) desktop.addEventListener('change', applyMotionPreference);
 else if (desktop.addListener) desktop.addListener(applyMotionPreference);
 applyMotionPreference();
})();

(() => {
 const section = document.querySelector('.faq-section');
 const list = section?.querySelector('.faq-list');
 if (!list) return;
 const items = [...list.querySelectorAll('details')];
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');

 // Preserve the native grouped disclosure when animation is unavailable.
 if (!Element.prototype.animate) {
  if (!('name' in HTMLDetailsElement.prototype)) {
   list.addEventListener('click', event => {
    const summary = event.target instanceof Element ? event.target.closest('summary') : null;
    const selected = summary?.parentElement;
    if (!selected || selected.open || !list.contains(selected)) return;
    items.forEach(item => { if (item !== selected) item.open = false; });
   });
  }
  return;
 }

 const states = items.map(item => ({
  item,
  summary:item.querySelector('summary'),
  answer:item.querySelector('.faq-answer'),
  expanded:item.open,
  animation:null
 })).filter(state => state.summary && state.answer);
 if (!states.length) return;
 // Native grouping would immediately close the old answer before it can animate.
 states.forEach(state => state.item.removeAttribute('name'));
 section.classList.add('faq-motion-ready');
 states.forEach(state => { state.item.dataset.expanded = String(state.expanded); });

 function settle(state) {
  const animation = state.animation;
  state.animation = null;
  if (animation) animation.cancel();
  state.item.open = state.expanded;
  state.answer.style.removeProperty('overflow');
 }
 function setExpanded(state, expanded) {
  if (state.expanded === expanded) return;
  const fromHeight = state.item.open ? state.answer.getBoundingClientRect().height : 0;
  const fromOpacity = state.item.open ? Number.parseFloat(getComputedStyle(state.answer).opacity) : 0;
  if (state.animation) { state.animation.cancel(); state.animation = null; }
  state.expanded = expanded;
  state.item.dataset.expanded = String(expanded);
  if (reduced.matches) { settle(state); return; }
  if (expanded) state.item.open = true;
  state.answer.style.overflow = 'hidden';
  const toHeight = expanded ? state.answer.scrollHeight : 0;
  const duration = expanded ? 190 : 150;
  state.animation = state.answer.animate([
   {height:`${fromHeight}px`,opacity:Number.isFinite(fromOpacity) ? fromOpacity : 1},
   {height:`${toHeight}px`,opacity:expanded ? 1 : 0}
  ], {duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  const animation = state.animation;
  animation.onfinish = () => { if (state.animation === animation) settle(state); };
 }
 states.forEach(state => {
  state.summary.addEventListener('click', event => {
   event.preventDefault();
   const expand = !state.expanded;
   if (expand) states.forEach(other => { if (other !== state) setExpanded(other, false); });
   setExpanded(state, expand);
  });
 });
 if (reduced.addEventListener) reduced.addEventListener('change', () => {
  if (reduced.matches) states.forEach(settle);
 });
})();

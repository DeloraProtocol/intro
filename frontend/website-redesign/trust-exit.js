/* Make the final scene and its exit feel deliberate without affecting the rest of the page. */
(() => {
 const section = document.getElementById('trust');
 const flow = section?.querySelector('.trust-flow');
 const sticky = section?.querySelector('.trust-sticky');
 const steps = flow?.querySelectorAll('.trust-step');
 if (!section || !flow || !sticky || !steps?.length) return;
 const desktop = matchMedia('(min-width: 901px) and (hover: hover)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const trackSpeed = .45;

 function isNestedScroll(target) {
  for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
   if (el.matches('textarea,select,[contenteditable="true"]')) return true;
   if (el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return true;
  }
  return false;
 }
 function onWheel(event) {
  if (!desktop.matches || reduced.matches || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.deltaY <= 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (!flow.classList.contains('is-interactive')) return;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
  const amount = event.deltaY * unit;
  const current = scrollY;
  const distance = Math.max(300, Math.min(400, innerHeight * .4));
  const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;
  const trackStart = flow.getBoundingClientRect().top + current + distance * (steps.length - 1 - .15) - stickyTop;
  const sectionEnd = section.getBoundingClientRect().bottom + current;
  // Resistance ends as soon as the light section enters the viewport.
  const blackViewportEnd = sectionEnd - innerHeight;
  if (current >= blackViewportEnd || current + amount <= trackStart || blackViewportEnd <= trackStart || isNestedScroll(event.target)) return;

  let position = current, remaining = amount;
  function advance(to, speed) {
   if (remaining <= 0 || position >= to) return;
   const movement = Math.min(to - position, remaining * speed);
   position += movement;
   remaining -= movement / speed;
  }
  // A single wheel gesture may cross multiple zones: spend only the part of
  // the gesture inside each zone at that zone's speed, then resume normally.
  advance(trackStart, 1);
  advance(blackViewportEnd, trackSpeed);
  position += remaining;
  event.preventDefault();
  window.scrollBy({top:position - current,behavior:'instant'});
 }
 if ('IntersectionObserver' in window) {
  let listening = false;
  new IntersectionObserver(entries => {
   const visible = entries[0].isIntersecting;
   if (visible && !listening) { addEventListener('wheel', onWheel, {passive:false}); listening = true; }
   else if (!visible && listening) { removeEventListener('wheel', onWheel); listening = false; }
  }).observe(section);
 }
})();

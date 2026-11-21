/* Give the transitions between the three product scenes a little more weight. */
(() => {
 const section = document.querySelector('.journeys');
 const scenes = section ? [...section.querySelectorAll('.journey')] : [];
 if (!section || scenes.length < 2) return;
 const desktop = matchMedia('(min-width: 901px) and (hover: hover)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const speed = .55;

 function nestedScroll(target) {
  for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
   if (el.matches('textarea, select, [contenteditable="true"]')) return true;
   if (el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return true;
  }
  return false;
 }
 function onWheel(event) {
  if (!desktop.matches || reduced.matches || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY) || nestedScroll(event.target)) return;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
  const input = event.deltaY * unit;
  const direction = Math.sign(input);
  const current = scrollY;
  const bounds = section.getBoundingClientRect();
  const start = current + bounds.top;
  const end = current + bounds.bottom - innerHeight;
  if (end <= start) return;
  const zones = scenes.slice(1).map(scene => {
   const top = current + scene.getBoundingClientRect().top;
   return [Math.max(start, top - innerHeight * .9), Math.min(end, top - innerHeight * .25)];
  }).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
  // Merge overlaps so a small viewport cannot multiply resistance.
  const merged = [];
  for (const zone of zones) {
   const last = merged[merged.length - 1];
   if (last && zone[0] <= last[1]) last[1] = Math.max(last[1], zone[1]);
   else merged.push(zone);
  }
  let remaining = Math.abs(input), position = current, resisted = false;
  const ordered = direction > 0 ? merged : [...merged].reverse();
  for (const [a, b] of ordered) {
   if (!remaining) break;
   const entry = direction > 0 ? a : b;
   const exit = direction > 0 ? b : a;
   if ((direction > 0 && position >= b) || (direction < 0 && position <= a)) continue;
   const before = Math.max(0, (entry - position) * direction);
   const normal = Math.min(remaining, before);
   position += normal * direction;
   remaining -= normal;
   if (!remaining || (position - exit) * direction >= 0) continue;
   const distance = Math.min(Math.abs(exit - position), remaining * speed);
   if (distance > 0) resisted = true;
   position += distance * direction;
   remaining -= distance / speed;
  }
  if (!resisted) return;
  position += remaining * direction;
  event.preventDefault();
  window.scrollBy({top:position - current, behavior:'instant'});
 }
 let listening = false;
 function listen(visible) {
  if (visible && !listening) { addEventListener('wheel', onWheel, {passive:false}); listening = true; }
  else if (!visible && listening) { removeEventListener('wheel', onWheel); listening = false; }
 }
 if ('IntersectionObserver' in window) new IntersectionObserver(entries => listen(entries[0].isIntersecting)).observe(section);
 else listen(true);
})();

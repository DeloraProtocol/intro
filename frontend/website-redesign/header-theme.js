/* Keep the fixed navigation in step with the background beneath it. */
(() => {
 const header = document.querySelector('.header.mural-header');
 const darkSections = [...document.querySelectorAll('[data-header-theme="dark"]')];
 if (!header || !darkSections.length) return;
 const margin = 8;
 let dark = false;
 let frame = 0;
 let releaseSnap = 0;
 let previousY = scrollY;

 function covers(y) {
  return darkSections.some(section => {
   const bounds = section.getBoundingClientRect();
   return bounds.top <= y && bounds.bottom > y;
  });
 }
 function center() { return Math.min(header.getBoundingClientRect().height / 2, 42); }
 function desiredTheme() {
  const y = center();
  const upper = covers(y - margin);
  const lower = covers(y + margin);
  return dark ? upper || lower : upper && lower;
 }
 function apply(value, instant = false) {
  if (instant) {
   cancelAnimationFrame(releaseSnap);
   header.classList.add('theme-snap');
  }
  dark = value;
  header.classList.toggle('trust-theme-dark', value);
  if (instant) {
   releaseSnap = requestAnimationFrame(() => {
    releaseSnap = requestAnimationFrame(() => header.classList.remove('theme-snap'));
   });
  }
 }
 function update() {
  frame = 0;
  const next = desiredTheme();
  const scrollDistance = Math.abs(scrollY - previousY);
  previousY = scrollY;
  if (next === dark) return;
  const headerHeight = header.getBoundingClientRect().height;
  const fullyDark = covers(0) && covers(headerHeight);
  const fullyLight = !covers(0) && !covers(headerHeight);
  // A jump or fully crossed header must not wait for a colour transition.
  apply(next, scrollDistance > 80 || (next ? fullyDark : fullyLight));
 }
 function schedule() { if (!frame) frame = requestAnimationFrame(update); }
 apply(covers(center()), true);
 document.documentElement.classList.remove('header-theme-pending');
 addEventListener('scroll', () => { if (document.documentElement.classList.contains('header-theme-pending')) apply(covers(center()), true); else schedule(); }, {passive:true});
 addEventListener('resize', schedule, {passive:true});
 addEventListener('pageshow', () => { apply(covers(center()), true); requestAnimationFrame(() => { apply(covers(center()), true); document.documentElement.classList.remove('header-theme-pending'); schedule(); }); });
 addEventListener('load', () => { apply(covers(center()), true); schedule(); });
})();

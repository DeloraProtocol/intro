(() => {
 const form = document.querySelector('#demo-form');
 const select = form?.querySelector('.business-select');
 if (!select) return;
 const summary = select.querySelector('summary');
 const menu = select.querySelector('fieldset');
 const selected = select.querySelector('#business-selected');
 const placeholder = selected.textContent;
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 let animation = null;
 let wantsOpen = select.open;
 function setOpen(open) {
  wantsOpen = open;
  let current = null;
  if (animation) {
   const style = getComputedStyle(menu);
   current = { opacity: style.opacity, transform: style.transform };
   animation.cancel();
   animation = null;
  }
  if (open) select.open = true;
  menu.inert = !open;
  if (reduced.matches || !menu.animate) { select.open = open; return; }
  const visible = { opacity: 1, transform: 'translateY(0) scale(1)' };
  const hidden = { opacity: 0, transform: 'translateY(-6px) scale(.985)' };
  animation = menu.animate([current || (open ? hidden : visible), open ? visible : hidden], { duration: open ? 180 : 140, easing: open ? 'cubic-bezier(.2,.7,.2,1)' : 'ease-in', fill: 'both' });
  const active = animation;
  active.onfinish = () => { if (animation !== active) return; if (!wantsOpen) select.open = false; active.cancel(); animation = null; };
 }
 summary.addEventListener('click', event => { event.preventDefault(); setOpen(!wantsOpen); });
 select.addEventListener('change', event => {
  if (event.target.name !== 'businessType') return;
  selected.textContent = event.target.value;
  setOpen(false);
  summary.focus();
 });
 document.addEventListener('click', event => { if (wantsOpen && !select.contains(event.target)) setOpen(false); });
 select.addEventListener('keydown', event => { if (event.key === 'Escape' && wantsOpen) { setOpen(false); summary.focus(); event.preventDefault(); } });
 form.addEventListener('reset', () => setTimeout(() => { selected.textContent = placeholder; setOpen(false); }, 0));
})();

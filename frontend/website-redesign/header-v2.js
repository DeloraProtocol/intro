const header = document.querySelector('.mural-header');
if (header) {
 const menu = header.querySelector('.menu-button');
 const mobile = header.querySelector('.mobile-nav');
 const items = [...header.querySelectorAll('.nav-item')];
 const closeItems = () => {
  header.classList.remove('nav-expanded', 'nav-expanded-usecases');
  items.forEach(item => {
   item.classList.remove('is-open');
   item.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
  });
 };
 const links = header.querySelector('.mural-links');
 const sheet = header.querySelector('.mural-sheet');
 const measureLinks = () => {
  const width = links.getBoundingClientRect().width;
  const previous = Number.parseFloat(header.style.getPropertyValue('--links-width')) || 0;
  if (!width || Math.abs(width - previous) < .1) return;
  header.classList.add('nav-measuring');
  header.style.setProperty('--links-width', `${width}px`);
  if (sheet) void sheet.offsetWidth;
  header.classList.remove('nav-measuring');
 };
 const readyHeader = () => {
  measureLinks();
  if (sheet) void sheet.offsetWidth;
  header.classList.add('nav-ready');
 };
 measureLinks();
 if (document.fonts) document.fonts.ready.then(readyHeader, readyHeader);
 else requestAnimationFrame(readyHeader);
 // Do not delay navigation if the user interacts before a slow font loads.
 header.addEventListener('pointerover', readyHeader, {once:true});
 header.addEventListener('focusin', readyHeader, {once:true});
 if ('ResizeObserver' in window) new ResizeObserver(measureLinks).observe(links);
 // Size the backdrop to the active panel, including wrapped or added items.
 const measurePanel = () => {
  const panel = header.querySelector('.nav-item.is-open .nav-panel');
  const nav = header.querySelector('.mural-nav');
  if (!panel || !nav) return;
  const height = Math.ceil(panel.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 12);
  header.style.setProperty('--nav-expanded-height', `${Math.max(60, height)}px`);
 };
 if ('ResizeObserver' in window) {
  const panelObserver = new ResizeObserver(measurePanel);
  header.querySelectorAll('.nav-panel').forEach(panel => panelObserver.observe(panel));
 }
 const setMobile = open => {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobile.classList.toggle('is-open', open);
  mobile.setAttribute('aria-hidden', String(!open));
  mobile.inert = !open;
  document.body.classList.toggle('mobile-menu-open', open);
 };
 menu.addEventListener('click', () => setMobile(menu.getAttribute('aria-expanded') !== 'true'));
 mobile.addEventListener('click', event => { if (event.target.closest('a')) setMobile(false); });
 items.forEach(item => {
  const trigger = item.querySelector('.nav-trigger');
  const setItem = open => { closeItems(); if (open) { item.classList.add('is-open'); header.classList.add('nav-expanded'); header.classList.toggle('nav-expanded-usecases', trigger.getAttribute('aria-controls') === 'use-cases-menu'); trigger.setAttribute('aria-expanded', 'true'); measurePanel(); } };
  trigger.addEventListener('click', event => {
   const hoverClick = event.detail > 0 && window.matchMedia('(hover: hover)').matches;
   setItem(hoverClick || !item.classList.contains('is-open'));
  });
  item.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') setItem(true); });
 });
 header.querySelectorAll('.mural-links .nav-chip').forEach(link => {
  link.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') closeItems(); });
  link.addEventListener('focus', closeItems);
 });
 const insideExpandedPanel = event => {
  const bounds = header.querySelector('.mural-nav').getBoundingClientRect();
  const expandedHeight = parseFloat(getComputedStyle(header).getPropertyValue('--nav-expanded-height')) || 164;
  return event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.top + expandedHeight;
 };
 document.addEventListener('pointermove', event => {
  if (header.classList.contains('nav-expanded') && event.pointerType === 'mouse' && !insideExpandedPanel(event)) closeItems();
 });
 window.addEventListener('blur', closeItems);
 header.querySelectorAll('.nav-panel a').forEach(link => link.addEventListener('click', closeItems));
 document.addEventListener('pointerdown', event => { if (!header.contains(event.target) && !(header.classList.contains('nav-expanded') && insideExpandedPanel(event))) closeItems(); });
 document.addEventListener('keydown', event => {
  if (event.key === 'Tab' && menu.getAttribute('aria-expanded') === 'true') {
   const focusable = [menu, ...mobile.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length);
   const first = focusable[0], last = focusable[focusable.length - 1];
   if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Escape') { const expanded = header.querySelector('.nav-trigger[aria-expanded="true"]'); closeItems(); if (expanded) expanded.focus(); if (menu.getAttribute('aria-expanded') === 'true') { setMobile(false); menu.focus(); } }
 });
 window.addEventListener('resize', () => { if (window.innerWidth > 1190) setMobile(false); closeItems(); measureLinks(); });
}

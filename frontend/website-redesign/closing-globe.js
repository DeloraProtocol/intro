(() => {
 const shell = document.querySelector('.pv-close-globe, .closing-globe-wrap, .uc-close-globe');
 const canvas = shell?.querySelector('canvas');
 const ctx = canvas?.getContext('2d');
 if (!ctx) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const radians = Math.PI / 180;
 let points = [], width = 0, height = 0, phase = -0.25, frame = 0, last = 0, inView = false;
 function draw() {
  if (!width || !height || !points.length) return;
  ctx.clearRect(0, 0, width, height);
  const radius = Math.min(width, height) * .47, cx = width / 2, cy = height / 2;
  for (const [lon, lat] of points) {
   const a = lon * radians + phase, b = lat * radians;
   const z = Math.cos(b) * Math.cos(a);
   if (z <= 0) continue;
   const x = cx + Math.cos(b) * Math.sin(a) * radius;
   const y = cy - Math.sin(b) * radius * .96;
   ctx.fillStyle = `rgba(125, 142, 132, ${.25 + z * .35})`;
   ctx.beginPath(); ctx.arc(x, y, 1 + z * .6, 0, Math.PI * 2); ctx.fill();
  }
 }
 function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width; height = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
 }
 function tick(now) {
  frame = 0;
  if (!inView || document.hidden || reduced.matches) { last = 0; return; }
  if (last) phase += Math.min(now - last, 50) * .00008;
  last = now; draw(); frame = requestAnimationFrame(tick);
 }
 function start() { if (!frame && inView && !document.hidden && !reduced.matches && points.length) frame = requestAnimationFrame(tick); }
 fetch('earth-points.json').then(response => {
  if (!response.ok) throw new Error('Globe data unavailable');
  return response.json();
 }).then(data => {
  if (!Array.isArray(data) || !data.length) throw new Error('Globe data is empty');
  points = data; resize(); shell.classList.add('is-ready'); start();
 }).catch(() => {});
 if ('ResizeObserver' in window) new ResizeObserver(resize).observe(shell);
 else addEventListener('resize', resize);
 if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting; if (!inView) last = 0; start();
 }, {threshold: .01}).observe(shell);
 else inView = true;
 document.addEventListener('visibilitychange', () => { last = 0; start(); });
 reduced.addEventListener('change', () => { last = 0; draw(); start(); });
 resize();
})();

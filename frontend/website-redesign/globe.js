(() => {
 const canvas = document.getElementById('delora-globe');
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let pts = [], w = 0, h = 0, phase = -0.25, active = true, inView = true, frame = 0, last = 0;
 let elapsed = 0, nextRoute = 400, routes = [];
 const radians = Math.PI / 180;
 function resize() {
  const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  w = box.width; h = box.height; canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0); draw();
 }
 function project(lon,lat,angle,r,cx,cy) {
  const a = lon*radians+angle, b = lat*radians;
  const x = Math.cos(b)*Math.sin(a), y = Math.sin(b), z = Math.cos(b)*Math.cos(a);
  return [cx+x*r,cy-y*r*.96,z];
 }
 function vector(point) {
  const a=point[0]*radians, b=point[1]*radians;
  return [Math.cos(b)*Math.sin(a),Math.sin(b),Math.cos(b)*Math.cos(a)];
 }
 function routePoint(route,t,r,cx,cy) {
  const {a,b,angle,sine}=route;
  const left=Math.sin((1-t)*angle)/sine, right=Math.sin(t*angle)/sine;
  const x=a[0]*left+b[0]*right, y=a[1]*left+b[1]*right, z=a[2]*left+b[2]*right;
  const lift=1+.11*Math.sin(Math.PI*t), c=Math.cos(phase), s=Math.sin(phase);
  return [cx+(x*c+z*s)*r*lift,cy-y*r*.96*lift,z*c-x*s];
 }
 function chooseRoute(r,cx,cy) {
  if (pts.length < 2) return null;
  const canvasBox=canvas.getBoundingClientRect();
  const overlays=[...document.querySelectorAll('.globe-copy h2,.globe-copy a,.globe-reporter')].map(el=>el.getBoundingClientRect());
  const blocked=point=>{
   const x=canvasBox.left+point[0], y=canvasBox.top+point[1];
   return x<12 || x>innerWidth-12 || overlays.some(box=>x>box.left-12 && x<box.right+12 && y>box.top-12 && y<box.bottom+12);
  };
  // Project each point once, then choose from the already visible candidates.
  const candidates=[];
  for(const point of pts) {
   const projected=project(point[0],point[1],phase,r,cx,cy);
   if(projected[2]>=.42 && !blocked(projected)) candidates.push({point,projected});
  }
  if(candidates.length<2)return null;
  for(let attempt=0;attempt<80;attempt++) {
   const from=candidates[Math.floor(Math.random()*candidates.length)];
   const to=candidates[Math.floor(Math.random()*candidates.length)];
   const distance=Math.hypot(from.projected[0]-to.projected[0],from.projected[1]-to.projected[1]);
   if(distance<r*.22 || distance>r*.58)continue;
   const a=vector(from.point), b=vector(to.point);
   const angle=Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));
   const sine=Math.sin(angle); if(sine<.01)continue;
   const route={a,b,angle,sine,started:elapsed};
   if([.25,.5,.75].some(t=>blocked(routePoint(route,t,r,cx,cy))))continue;
   return route;
  }
  return null;
 }
 function drawRoute(route,r,cx,cy) {
  const age=elapsed-route.started, progress=Math.min(1,age/1050);
  const fade=age<1250?1:Math.max(0,1-(age-1250)/550);
  if(progress<=0 || fade<=0)return;
  const start=routePoint(route,0,r,cx,cy);
  const head=routePoint(route,progress,r,cx,cy);
  const destination=routePoint(route,1,r,cx,cy);
  const trail=ctx.createLinearGradient(start[0],start[1],head[0],head[1]);
  trail.addColorStop(0,`rgba(220,231,226,${.25*fade})`);
  trail.addColorStop(.7,`rgba(226,236,231,${.46*fade})`);
  trail.addColorStop(1,`rgba(238,245,241,${.7*fade})`);
  ctx.beginPath();
  for(let i=0;i<=36;i++) {
   const t=progress*i/36, p=routePoint(route,t,r,cx,cy);
   if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);
  }
  ctx.strokeStyle=trail;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  ctx.fillStyle=`rgba(239,246,242,${.76*fade})`;
  ctx.beginPath();ctx.arc(start[0],start[1],2.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(239,246,242,${(.35+.41*progress)*fade})`;
  ctx.beginPath();ctx.arc(destination[0],destination[1],2.6,0,Math.PI*2);ctx.fill();
 }
 function draw() {
  if (!w || !h) return;
  ctx.clearRect(0,0,w,h);
  const radius=Math.min(w*.45,h*.46), cx=w*.5, cy=h*.47;
  for(let i=0;i<pts.length;i++){
   const [x,y,z]=project(pts[i][0],pts[i][1],phase,radius,cx,cy);if(z<=0)continue;
   const alpha=.16+z*.42;ctx.fillStyle=`rgba(190,200,194,${alpha})`;
   ctx.beginPath();ctx.arc(x,y,.75+z*.55,0,Math.PI*2);ctx.fill();
  }
  if (!reduced.matches) routes.forEach(route=>drawRoute(route,radius,cx,cy));
 }
 function tick(time){
  if(!active || reduced.matches){frame=0;last=0;return}
  if(!last)last=time;
  if(time-last>=15){
   const delta=Math.min(50,time-last);elapsed+=delta;phase+=delta*.000036;last=time;
   if(elapsed>=nextRoute){
    const radius=Math.min(w*.45,h*.46), route=chooseRoute(radius,w*.5,h*.47);
    if(route)routes.push(route);
    nextRoute=elapsed+800+Math.random()*300;
   }
   routes=routes.filter(route=>elapsed-route.started<1800);draw();
  }
  frame=requestAnimationFrame(tick);
 }
 function start(){if(!frame&&active&&!reduced.matches)frame=requestAnimationFrame(tick)}
 fetch('earth-points.json').then(r=>r.ok?r.json():[]).then(data=>{pts=data;draw();start()}).catch(()=>draw());
 new ResizeObserver(resize).observe(canvas);
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;active=inView&&!document.hidden;if(active)start()},{threshold:.01}).observe(canvas)}
 document.addEventListener('visibilitychange',()=>{active=inView&&!document.hidden;if(active)start()});
 reduced.addEventListener('change',()=>{if(reduced.matches){routes=[];last=0}else nextRoute=elapsed+400;draw();start()});
 resize();
})();

(() => {
 const panel = document.querySelector('.globe-reporter');
 if (!panel) return;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const address = panel.querySelector('.globe-address');
 const amount = panel.querySelector('.globe-amount');
 // Examples use verified tokens in Delora's token catalog; these are illustrations, not live quotes.
 const examples = [
  ['Ethereum → Base','377 USDC → USDT'],
  ['Base → Arbitrum','1,250 USDS → USDC'],
  ['Optimism → Ethereum','840 USDT → DAI'],
  ['Polygon → Base','2,400 USDC → USDS'],
  ['Arbitrum → Optimism','615 DAI → USDC']
 ];
 let index=0, visible=false, changing=false;
 if ('IntersectionObserver' in window) new IntersectionObserver(e=>{visible=e[0].isIntersecting},{threshold:.1}).observe(panel); else visible=true;
 function changeLine(element, text, delay) {
  return new Promise(resolve => {
   if (reduce.matches || typeof element.animate !== 'function') { element.textContent=text; resolve(); return; }
   const out=element.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-5px)',opacity:0}],{duration:150,delay,easing:'ease-in',fill:'forwards'});
   out.onfinish=()=>{element.textContent=text;out.cancel();const incoming=element.animate([{transform:'translateY(5px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:240,easing:'ease-out'});incoming.onfinish=resolve;incoming.oncancel=resolve};
   out.oncancel=resolve;
  });
 }
 setInterval(async()=>{
  if(!visible || document.hidden || changing || reduce.matches)return;
  changing=true; index=(index+1)%examples.length;
  await Promise.all([changeLine(address,examples[index][0],0),changeLine(amount,examples[index][1],80)]);
  changing=false;
 },3000);
})();

(() => {
 const section = document.querySelector('.globe-stage');
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 if (!section || reduce.matches) return;
 let queued = false;
 function update() {
  queued = false;
  const rect = section.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight * .85)));
  section.style.setProperty('--globe-progress', progress.toFixed(4));
 }
 function schedule() { if (!queued) {queued = true; requestAnimationFrame(update);} }
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', schedule, {passive:true});
 addEventListener('pageshow', update);
 addEventListener('load', update);
 reduce.addEventListener('change', () => { if (reduce.matches) {section.classList.remove('globe-scroll-ready');section.style.removeProperty('--globe-progress');} else {section.classList.add('globe-scroll-ready');schedule();} });
 update();
 section.classList.add('globe-scroll-ready');
})();

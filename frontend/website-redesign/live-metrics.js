(() => {
 const root = document.querySelector('.case-metrics');
 if (!root) return;
 const ttl = 15 * 60 * 1000;
 const keys = {chains:'delora-public-chains-v1', tools:'delora-public-tools-v1', status:'delora-public-status-v1'};
 const fields = Object.fromEntries([...root.querySelectorAll('[data-live]')].map(el => [el.dataset.live, el]));
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 let inView = !('IntersectionObserver' in window), data = {}, pending = {};
 const failed = new Set();
 const readCache = key => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
 const saveCache = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} };
 function setNumber(el, number, suffix, decimals) {
  if (!el || !Number.isFinite(number)) return;
  const target = number.toFixed(decimals) + suffix;
  if (el.dataset.target === target && (el.dataset.animated || !inView || reduced)) return;
  el.dataset.target = target;
  el.setAttribute('aria-label', target);
  if (!inView || reduced || el.dataset.animated) { el.textContent = target; return; }
  el.dataset.animated = 'true';
  const start = performance.now();
  const frame = now => { const t = Math.min((now-start)/900,1), eased = 1-Math.pow(1-t,3); el.textContent = (number*eased).toFixed(decimals)+suffix; if (t<1) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
 }
 function render() {
  if (!data.chains) { fields.chains.textContent = '—'; delete fields.chains.dataset.target; fields.chains.removeAttribute('aria-label'); }
  if (!data.tools) { fields.tools.textContent = '—'; delete fields.tools.dataset.target; fields.tools.removeAttribute('aria-label'); }
  if (!data.status) { fields.uptime.textContent = '—'; delete fields.uptime.dataset.target; fields.uptime.removeAttribute('aria-label'); fields['uptime-label'].textContent = 'Uptime'; }
  if (data.chains) setNumber(fields.chains, data.chains.count, '', 0);
  if (data.tools) setNumber(fields.tools, data.tools.count, '', 0);
  if (data.status) {
   setNumber(fields.uptime, data.status.availability*100, '%', data.status.availability === 1 ? 0 : 3);
   fields['uptime-label'].textContent = 'Uptime · last ' + data.status.days + ' days';
   fields['uptime-label'].setAttribute('aria-label', 'API health monitor uptime over the last ' + data.status.days + ' days');
  }
  fields.updated.textContent = failed.size ? 'Some live metrics are unavailable.' : '';
 }
 async function load(kind, force = false) {
  if (pending[kind]) return pending[kind];
  const cached = readCache(keys[kind]);
  if (!force && cached && Date.now()-cached.at < ttl) { data[kind] = cached; render(); return; }
    pending[kind] = (async () => {
   try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try { response = await fetch(kind === 'chains' ? 'https://api.delora.build/v1/chains' : kind === 'tools' ? 'https://api.delora.build/v1/tools' : 'https://status.delora.build/index.json', {cache:'no-store',signal:controller.signal}); } finally { clearTimeout(timeout); }
    if (!response.ok) throw new Error('Unavailable');
    const json = await response.json(); let result;
    if (kind === 'chains') {
     if (!Array.isArray(json.chains) || !json.chains.length || !json.chains.every(c => c && c.id != null && typeof c.chainType === 'string')) throw new Error('Invalid network data');
     const chains = json.chains.filter(c => c.mainnet === true);
     const families = [...new Set(chains.map(c => c.chainType))].sort();
     if (!chains.length || !families.length) throw new Error('Empty network data');
     result = {count:new Set(chains.map(c => c.chainType + ':' + String(c.id))).size,families,at:Date.now()};
    } else if (kind === 'tools') {
     if (!Array.isArray(json.exchanges) || !Array.isArray(json.bridges)) throw new Error('Invalid integrations data');
     const tools = [...json.exchanges, ...json.bridges];
     if (!tools.length || !tools.every(t => t && typeof t.key === 'string' && t.key.length)) throw new Error('Invalid integrations data');
     result = {count:new Set(tools.map(t => t.key.toUpperCase())).size, at:Date.now()};
    } else {
     const resources = Array.isArray(json.included) ? json.included : [];
     const resource = resources.find(item => item.type === 'status_page_resource' && item.attributes?.public_name === 'api.delora.build/health');
     const value = resource?.attributes?.availability, history = resource?.attributes?.status_history;
     if (typeof value !== 'number' || value < 0 || value > 1 || !Array.isArray(history) || !history.length) throw new Error('Invalid monitor data');
     result = {availability:value,days:history.length,at:Date.now()};
    }
    data[kind] = result; failed.delete(kind); saveCache(keys[kind],result);
   } catch { delete data[kind]; failed.add(kind); /* Do not show stale figures without a visible timestamp. */ }
   finally { delete pending[kind]; render(); }
  })(); return pending[kind];
 }
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { inView=true; render(); observer.disconnect(); } },{threshold:.15});
  observer.observe(root);
 }
 load('chains'); load('tools'); load('status');
 setInterval(() => { if (!document.hidden) { load('chains'); load('tools'); load('status'); } },ttl);
 document.addEventListener('visibilitychange', () => { if (!document.hidden) { load('chains'); load('tools'); load('status'); } });
})();

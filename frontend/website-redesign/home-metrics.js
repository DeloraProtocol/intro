(() => {
 const fields = {chains: document.getElementById('home-chain-count'), uptime: document.getElementById('home-uptime'), pricingChains: document.getElementById('pricing-network-count')};
 if (!fields.chains && !fields.uptime && !fields.pricingChains) return;
 const key = 'delora-site-metrics-v2', hour = 60 * 60 * 1000;
 // A dedicated snapshot service can be configured after it is deployed. Until
 // then the bundled file keeps local previews and failed network requests safe.
 const configuredEndpoint = document.querySelector('meta[name="delora-metrics-endpoint"]')?.content;
 const endpoint = configuredEndpoint && /^https:\/\//.test(configuredEndpoint) ? configuredEndpoint : '/home-metrics.json';
 // Initial snapshot is used only if neither a saved nor a server snapshot is available.
 const fallback = {chains:{value:30,updatedAt:'2026-11-20T13:08:45.872686+00:00'},uptime:{value:100,updatedAt:'2026-11-20T13:08:45.872686+00:00',periodDays:90}};
 let saved; try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }
 if (!saved || typeof saved !== 'object') saved = {};
 let metrics = {...fallback}, checkedAt = Number(saved.checkedAt) || 0, pending = false;
 function valid(item, kind) { return item && Number.isFinite(item.value) && item.value >= 0 && (kind !== 'chains' || Number.isInteger(item.value) && item.value > 0) && (kind !== 'uptime' || item.value <= 100 && Number.isInteger(item.periodDays) && item.periodDays > 0) && Number.isFinite(Date.parse(item.updatedAt)); }
 for (const kind of ['chains','uptime']) if (valid(saved.metrics?.[kind],kind) && Date.parse(saved.metrics[kind].updatedAt) >= Date.parse(metrics[kind].updatedAt)) metrics[kind] = saved.metrics[kind];
 function render() {
  for (const kind of ['chains','uptime']) {
   const item = metrics[kind]; if (!valid(item,kind)) continue;
   const value = kind === 'uptime' ? `${item.value}%` : String(item.value);
   for (const el of kind === 'chains' ? [fields.chains,fields.pricingChains] : [fields.uptime]) if (el) {
    el.textContent = value; el.setAttribute('aria-label', value);
    el.title = 'Last updated: ' + new Date(item.updatedAt).toLocaleString();
   }
   if (kind === 'uptime' && fields.uptime) {
    const label = fields.uptime.closest('article')?.querySelector('.performance-detail p');
    if (label) label.textContent = `Service uptime · ${item.periodDays} days`;
   }
   for (const el of kind === 'chains' ? [fields.chains,fields.pricingChains] : [fields.uptime]) if (el) {
    const article = el.closest('article'); if (!article) continue;
    let note = article.querySelector('.metric-as-of');
    if (Date.now() - Date.parse(item.updatedAt) > 24 * hour) {
     if (!note) { note = document.createElement('small'); note.className = 'metric-as-of'; article.append(note); }
     note.textContent = 'As of ' + new Date(item.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    } else if (note) note.remove();
   }
  }
 }
 async function refresh() {
  if (pending || Date.now() - checkedAt < hour) return;
  pending = true; checkedAt = Date.now();
  try {
   const res = await fetch(endpoint, {cache:'no-cache'}); if (!res.ok) throw Error('unavailable');
   const next = await res.json();
   for (const kind of ['chains','uptime']) if (valid(next[kind],kind) && (!valid(metrics[kind],kind) || Date.parse(next[kind].updatedAt) >= Date.parse(metrics[kind].updatedAt))) metrics[kind] = next[kind];
  } catch {} finally {
   try { localStorage.setItem(key, JSON.stringify({metrics,checkedAt})); } catch {}
   pending = false; render();
  }
 }
 window.addEventListener('storage', event => { if (event.key !== key || !event.newValue) return; try { const other = JSON.parse(event.newValue); for (const kind of ['chains','uptime']) if (valid(other.metrics?.[kind],kind) && Date.parse(other.metrics[kind].updatedAt) > Date.parse(metrics[kind]?.updatedAt || 0)) metrics[kind] = other.metrics[kind]; checkedAt = Math.max(checkedAt,Number(other.checkedAt)||0); render(); } catch {} });
 render(); refresh(); setInterval(() => { if (!document.hidden) refresh(); }, hour);
 document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();

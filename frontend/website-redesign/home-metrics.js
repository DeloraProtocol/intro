(() => {
 const fields = {
  chains: [document.getElementById('home-chain-count'), document.getElementById('pricing-network-count')].filter(Boolean),
  uptime: [document.getElementById('home-uptime')].filter(Boolean)
 };
 if (!fields.chains.length && !fields.uptime.length) return;

 const day = 24 * 60 * 60 * 1000;
 const key = 'delora-site-live-metrics-v1';
 const urls = {chains:'https://api.delora.build/v1/chains', uptime:'https://status.delora.build/index.json'};
 let state = {};
 try { state = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch {}
 const pending = {};
 const valid = (kind, item) => item && Number.isFinite(item.value) && Number.isFinite(item.updatedAt) && item.updatedAt > 0 && item.updatedAt <= Date.now() &&
  (kind === 'chains' ? Number.isInteger(item.value) && item.value > 0 : item.value >= 0 && item.value <= 1 && Number.isInteger(item.periodDays) && item.periodDays > 0);
 function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }
 function render(kind) {
  const item = state[kind]?.data;
  const fresh = valid(kind, item) && Date.now() - item.updatedAt < day;
  const value = fresh ? (kind === 'chains' ? String(item.value) : (item.value === 1 ? '100' : String(Math.floor(item.value * 100000) / 1000)) + '%') : null;
  for (const el of fields[kind]) {
   el.textContent = value || (el.id === 'pricing-network-count' ? 'Supported' : '—');
   el.removeAttribute('title');
   if (value) el.setAttribute('aria-label', value); else el.removeAttribute('aria-label');
   const article = el.closest('article');
   article?.querySelector('.metric-as-of')?.remove();
   if (kind === 'uptime') {
    const label = article?.querySelector('.performance-detail p');
    if (label) label.textContent = fresh ? `API health uptime · ${item.periodDays} days` : 'API health uptime';
   }
  }
 }
 async function refresh(kind) {
  if (!fields[kind].length || pending[kind]) return;
  const lastAttempt = Number(state[kind]?.lastAttempt) || 0;
  if (lastAttempt <= Date.now() && Date.now() - lastAttempt < day) { render(kind); return; }
  state[kind] = {...state[kind], lastAttempt: Date.now()};
  save();
  pending[kind] = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
   const response = await fetch(urls[kind], {cache:'no-store', signal:controller.signal});
   if (!response.ok) throw new Error('Metric source unavailable');
   const json = await response.json();
   let data;
   if (kind === 'chains') {
    if (!Array.isArray(json.chains) || !json.chains.length || !json.chains.every(c => c && c.id != null && typeof c.chainType === 'string' && typeof c.mainnet === 'boolean')) throw new Error('Invalid chains');
    const chains = json.chains.filter(c => c.mainnet);
    data = {value:new Set(chains.map(c => `${c.chainType}:${c.id}`)).size, updatedAt:Date.now()};
   } else {
    const monitor = Array.isArray(json.included) && json.included.find(x => x.type === 'status_page_resource' && x.attributes?.public_name === 'api.delora.build/health');
    const attributes = monitor?.attributes;
    data = {value:attributes?.availability, periodDays:attributes?.status_history?.length, updatedAt:Date.now()};
   }
   if (!valid(kind, data)) throw new Error('Invalid metric');
   state[kind].data = data;
  } catch {} finally { clearTimeout(timeout); delete pending[kind]; save(); render(kind); }
 }
 function refreshAll() { for (const kind of ['chains','uptime']) { render(kind); refresh(kind); } }
 window.addEventListener('storage', event => {
  if (event.key !== key || !event.newValue) return;
  try {
   const other = JSON.parse(event.newValue);
   for (const kind of ['chains','uptime']) {
    if (valid(kind, other?.[kind]?.data) && (!valid(kind, state[kind]?.data) || other[kind].data.updatedAt > state[kind].data.updatedAt)) state[kind] = other[kind];
    render(kind);
   }
  } catch {}
 });
 refreshAll();
 setInterval(() => { if (!document.hidden) refreshAll(); }, 15 * 60 * 1000);
 document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAll(); });
})();

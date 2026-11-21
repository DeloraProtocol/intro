import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handle } from './handler.mjs';

const html = await readFile(new URL('../website-redesign/404.html', import.meta.url), 'utf8');
const request = (path, options = {}) => new Request(`https://delora.build${path}`, { headers: { accept: 'text/html', ...options.headers }, method: options.method || 'GET' });
const origin = (status = 404) => new Response('origin', { status, headers: { 'content-type': 'text/plain', 'content-encoding': 'gzip', 'etag': 'old', 'vary': 'Origin', 'x-frame-options': 'DENY' } });

test('HTML navigation gets branded body and real 404 with safe headers', async () => {
  const result = await handle(request('/missing'), async () => origin(), html);
  assert.equal(result.status, 404); assert.match(await result.text(), /Page not found/);
  assert.equal(result.headers.get('content-encoding'), null); assert.equal(result.headers.get('etag'), null);
  assert.equal(result.headers.get('vary'), 'Origin, Accept'); assert.equal(result.headers.get('x-frame-options'), 'DENY');
  assert.equal(result.headers.get('cache-control'), 'no-store');
});
test('HEAD returns the same status without a body', async () => {
  const result = await handle(request('/missing', { method: 'HEAD' }), async () => origin(), html);
  assert.equal(result.status, 404); assert.equal(await result.text(), '');
});
test('non-html, API, other hosts and non-GET requests pass through unchanged', async () => {
  const requests = [request('/missing.js', { headers: { accept: '*/*' } }), request('/api/missing'), request('/missing', { headers: { accept: 'application/json' } }), request('/missing', { headers: { accept: 'text/html;q=0' } }), request('/missing', { headers: { 'sec-fetch-dest': 'image' } }), request('/missing', { method: 'POST' }), new Request('https://docs.delora.build/missing', { headers: { accept: 'text/html' } })];
  for (const req of requests) { const source = origin(); assert.equal(await handle(req, async () => source, html), source); }
});
test('real content, redirects, forbidden and origin failures are not rewritten', async () => {
  for (const status of [200, 301, 403, 500, 503]) { const source = origin(status); assert.equal(await handle(request('/missing'), async () => source, html), source); }
});
test('origin fetch failures are not disguised as 404', async () => {
  await assert.rejects(() => handle(request('/missing'), async () => { throw Error('origin failed'); }, html), /origin failed/);
});

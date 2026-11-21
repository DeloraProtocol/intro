// Keep this handler independent of the Cloudflare runtime so it can be tested locally.
const SITE_HOST = 'delora.build';

function acceptsHtml(header) {
  return header.split(',').some((part) => {
    const [type, ...params] = part.trim().toLowerCase().split(';');
    if (type.trim() !== 'text/html') return false;
    const quality = params.find((param) => param.trim().startsWith('q='));
    if (!quality) return true;
    const value = Number(quality.trim().slice(2));
    return Number.isFinite(value) && value > 0 && value <= 1;
  });
}

export async function handle(request, fetchOrigin, errorHtml) {
  // Request passthrough preserves Render redirects, existing assets, and 5xx responses.
  const origin = await fetchOrigin(request);
  const url = new URL(request.url);
  const extension = url.pathname.split('/').pop().match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  const isDocumentPath = !extension || extension === 'html' || extension === 'htm';
  const destination = request.headers.get('sec-fetch-dest');
  if (url.hostname !== SITE_HOST || !['GET', 'HEAD'].includes(request.method) ||
      origin.status !== 404 || !isDocumentPath || /^\/api(?:\/|$)/.test(url.pathname) ||
      (destination && !['document', 'iframe'].includes(destination)) ||
      !acceptsHtml(request.headers.get('accept') || '')) return origin;

  const headers = new Headers(origin.headers);
  for (const name of ['content-length', 'content-encoding', 'transfer-encoding', 'etag', 'last-modified', 'digest', 'content-range']) headers.delete(name);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex');
  const vary = headers.get('vary');
  if (!vary) headers.set('vary', 'Accept');
  else if (vary !== '*' && !vary.toLowerCase().split(',').some((v) => v.trim() === 'accept')) headers.set('vary', `${vary}, Accept`);
  return new Response(request.method === 'HEAD' ? null : errorHtml, { status: 404, statusText: 'Not Found', headers });
}

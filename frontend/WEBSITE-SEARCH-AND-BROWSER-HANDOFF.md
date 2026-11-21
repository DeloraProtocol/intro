# Search and browser handoff

The update was prepared on `work/mobile-visual-refinements`. Google Search Console accepted the sitemap with 12 URLs. Being in a sitemap does not mean every page is indexed or guarantee rankings.

## Production routing issue to validate before changing Render

On 2026-11-21, `/product/` and `/use-cases/wallets/` returned their correct pages, while `/product` and `/use-cases/wallets` returned the homepage with HTTP 200. A nonexistent path also returned the homepage with HTTP 200. `/product.html` returned the legacy noindex HTML refresh, not a server-side redirect. The current wildcard Render rewrite is a likely contributor; Render rules are not controlled by the `_redirects` file in this deployment.

Before touching production, inventory live Render rules and legacy routes. Prepare a preview service with explicit 301 redirects for supported extensionless paths without trailing slash to their canonical paths, and existing legacy paths to their intended destinations. Remove the wildcard homepage rewrite only in the preview first and verify correct 200 responses for all 12 canonical pages, 301 responses for mapped aliases and real 404 responses for unknown paths and missing assets. Verify old HTML files do not take precedence over redirect rules before omitting them from the build. Test all existing Render rules in order and browser links, then apply and verify the same configuration in production during an approved release. Render may trigger a deployment when service settings change.

## Local verification

From `frontend`: `npm run build`, then `python3 tools/audit-website.py dist/frontend/browser`. The audit checks sitemap pages, titles, descriptions, canonical URLs, headings, JSON-LD syntax and local asset/link targets. It does not verify Google indexing, HTTP redirects, external links, accessibility, performance or browser/device compatibility.

Safari desktop: Wallets content and FAQ; demo form and business type selector. Chromium mobile viewport: navigation to Wallets. Physical iOS Safari, Firefox and Edge remain to be checked. On local hosts the demo form uses its email fallback, so this is not an end-to-end production submission test.

Bing Webmaster Tools was connected through the corporate Google Search Console with the owner’s permission; its sitemap was submitted and was processing on 2026-11-21. Do not assume the site is indexed there. ChatGPT search eligibility depends on crawler access and does not guarantee inclusion.

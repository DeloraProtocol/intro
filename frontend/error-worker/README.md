# 404 Worker experiment — local only

This is an undeployed fallback experiment. No route or account is configured. Prefer testing whether Render serves the root `404.html` automatically on a separate Render preview before considering a Worker.

The handler forwards each request to the origin first. Only 404 responses to HTML GET/HEAD navigations on `delora.build` are replaced; API paths, non-HTML resources, other statuses and origin errors pass through. It embeds the shared `website-redesign/404.html`. The rule is not a substitute for Render returning real 404s. Local tests: `node --test error-worker/handler.test.mjs`.

**Do not deploy without staging and a separate release decision.** In particular, verify Cloudflare proxied DNS, Worker route matching and precedence against existing Workers, origin redirects/headers, cache, security rules and request limits. The `global_fetch_private_origin` flag makes same-zone fetch go to origin rather than loop, but Cloudflare documents that the subrequest bypasses other Workers and Cloudflare security settings; check the complete initial-request security path on the actual configuration. `passThroughOnException` is not a guarantee against quota exhaustion or all outages. Verify HTML, JSON, missing JS/CSS, APIs, HEAD, redirects, 403, 5xx, retries and rollback in isolated staging. The only confirmed tests so far are local Node and an esbuild bundle; Wrangler/Cloudflare runtime and live routing have not been tested.

Sources: https://developers.cloudflare.com/workers/configuration/routing/routes/ ; https://developers.cloudflare.com/workers/configuration/compatibility-flags/#global-fetch-strictly-public ; https://developers.cloudflare.com/rules/custom-errors/ .

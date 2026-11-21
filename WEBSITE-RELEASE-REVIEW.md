# Website redesign: Render release preparation

Status: review / staging only. Do not merge or deploy until the gates below have passed. This branch was based on `DeloraProtocol/intro` main at `29497a23e8fdbe2f076059e04fc17b5cb87e08e4`, the revision shown as live on 21 November 2026. Re-check the branch and live revision before any release.

## Observed Render setup (21 November 2026)

- Production service: `INTRO-black-hole`, static site, domain `delora.build`.
- Source: `DeloraProtocol/intro`, branch `main`; root `./frontend`; current build `npx ng build --configuration=production`; publish directory `dist/frontend/browser` relative to root.
- Auto-deploy: On Commit (enabled on 21 November at user request). PR previews: Off. Any future commit to main affecting the root directory may trigger production deployment. Existing rule: `/*` → `/index.html` Rewrite. Render response-header configuration was empty. The public apex returned HTTPS 200 with `X-Content-Type-Options: nosniff`; www returned a 301 to the apex. Render reported www as Waiting for DNS even though the public HTTPS redirect worked at the time of the check; verify the ownership and origin configuration before changing DNS. Verify all again before touching settings.
- Render shows rollback actions for earlier deploys; verify availability of rollback for the precise current production revision before deploying. Do not use the similarly named Development service `DEV-INTRO-black-hole` as the Delora production site.

## Prepared artifact

`frontend/website-redesign/` contains the static redesign; `frontend/tools/build-website-redesign.mjs` copies it into the existing publish directory without overwriting a nonempty directory. From a clean `frontend` build directory run `node tools/build-website-redesign.mjs`. The Angular production build remains unchanged; this branch is not wired to automatic production publication. For staging, configure this command on an isolated preview service, not by editing production to experiment. Changing build settings on production may itself trigger a deployment; recheck Render behavior before doing so.

## Release gates

1. **Routes and rollback:** compare current live URL inventory (including `/community`, `/mediakit`, `/execution` and legal routes) with new destinations, agree and configure permanent redirects and test them on staging. Existing local `_redirects` is not a Render configuration. Old `.html` fallback files in the artifact may take precedence over Render redirect rules; decide whether to omit them in the release artifact only after matching rules have been installed and tested. Test clean URLs, trailing slashes, redirects, deep links and 404 behavior, including the existing catch-all rewrite. Verify a rollback to the live revision and the effect on both website and separate Worker.
2. **Lead form:** current local redesign expects the separate lead-intake Worker. It and its database/fields are not deployed by this PR. The local Worker requires a privacy-consent field for new requests, which breaks older clients; inventory clients and coordinate the rollout. Follow the existing lead-intake README for Airtable field names and D1 migrations, backup and staging. Confirm real positive Turnstile and browser-to-D1/Airtable/all intended Telegram recipients, plus retry, failure and recovery. Do not use real customer information for tests.
3. **Security and operations:** prepare and test appropriate Render headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`); design CSP against the actual page, scripts and Turnstile before enforcing it. Confirm scoped service access, former credential revocation where applicable, manual retention/deletion across services and backups, independent monitoring with verified recipients, and rollback ownership. Do not expose tokens or deploy-hook URLs in source, tickets or browser output.
4. **Metrics:** separately prepared metrics service is not deployed or connected. Confirm timestamps and semantics before displaying a current claim and configure monitoring if deployed.
5. **Final verification:** test isolated staging across mobile, desktop, Safari and Firefox; check forms, links, original legal text, response headers, robots, sitemap, canonical URLs and old addresses. Inspect PR diff and status checks; verify the live service and exact target commit again before deployment. Tests using mocks are not production evidence.

## Checks on 21 November 2026

Clean copy-build produced 165 files identical to the local redesign by SHA-256. The separate local lead/metrics suite passed 29 tests using mocks; these tests are not part of the current production deployment. This is not a penetration test, and a real end-to-end submission and Render staging are not yet verified.

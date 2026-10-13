# TenantReach landing page

Public static marketing site for https://tenantreach.net, published with GitHub Pages.

Run `npm ci` and `npm run build`. The `out/` directory is the complete static site. Backend actions link to the existing application at https://mercuryreach.net until the TenantReach app hostname is configured and verified. Pricing is the public catalog captured on October 13, 2026; update `app/plans.ts` when public plans change.

The page uses self-hosted Geist, the supplied TenantReach artwork, and the visitor's system color scheme. Native navigation and disclosures work without JavaScript. Optional motion respects reduced-motion preferences.

Run the browser checks against a local preview with `SITE_URL` set to its URL, then `npm test` (PowerShell: `$env:SITE_URL='http://127.0.0.1:3116'; npm test`). Install the Playwright Chromium browser first if it is unavailable. Evidence is saved under `.checks/`, or the directory supplied through `SITE_ARTIFACT_DIR`.

Publish only the generated `out/` contents to the `gh-pages` branch. Preserve `CNAME` and `.nojekyll`; source belongs on `main`. Validate the exported site before publishing, and record the previous `gh-pages` commit so its tree can be restored in a new commit if rollback is needed. Public DNS and GitHub Pages certificate issuance must be verified separately from a successful build.

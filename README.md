# TenantReach landing page

Public static marketing site for https://tenantreach.net, published with GitHub Pages.

Run `npm ci` and `npm run build`. The `out/` directory is the complete static site. Backend actions link to the existing application at https://mercuryreach.net until the TenantReach app hostname is configured and verified. Pricing is the public catalog captured on October 13, 2026; update `app/plans.ts` when public plans change.

The page uses self-hosted Geist, the supplied TenantReach artwork, and the visitor's system color scheme. Native navigation and disclosures work without JavaScript. Optional motion respects reduced-motion preferences.

The lead workspace preview is a 40-second caption-led Remotion walkthrough, with an actual application screenshot retained in the ReachAssist section. Both were captured from an isolated synthetic workspace. Live AI and provider delivery are disabled during capture. The video is silent and user-initiated, with English captions and a text transcript. Automatic Message Categorization is described as a workspace-enabled feature, without promising inclusion in every plan.

The reproducible video project and capture provenance are documented in `video/README.md`. Render with `cd video`, `npm ci`, `npm run check`, and `npm run render`; publish the checked MP4 under `public/media/tenantreach-reachassist-walkthrough.mp4`. Captures show a preview build of the ReachAssist rename; production app release is separate from publishing this marketing site.

Run the browser checks against a local preview with `SITE_URL` set to its URL, then `npm test` (PowerShell: `$env:SITE_URL='http://127.0.0.1:3116'; npm test`). Install the Playwright Chromium browser first if it is unavailable. Evidence is saved under `.checks/`, or the directory supplied through `SITE_ARTIFACT_DIR`.

Publish only the generated `out/` contents to the `gh-pages` branch. Preserve `CNAME` and `.nojekyll`; source belongs on `main`. Validate the exported site before publishing, and record the previous `gh-pages` commit so its tree can be restored in a new commit if rollback is needed. Public DNS and GitHub Pages certificate issuance must be verified separately from a successful build.

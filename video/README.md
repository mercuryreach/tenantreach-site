# TenantReach + ReachAssist walkthrough

A silent, caption-led Remotion walkthrough, rendered at 1920 × 1080, 30 fps, 40 seconds. It shows genuine application captures using a demo workspace with sample data. The video stops at review; no message is sent or presented as sent.

## Reproduce

From this directory, with Node.js 22 or newer:

```powershell
npm ci
npm run check
npm run stills
npm run render
```

`npm run studio` opens the editable composition. The renderer uses Remotion's supported Chromium download and writes only to `build/` and `out/`. The first render may require network access for Chromium. Dependencies are pinned in `package-lock.json`; no parent application packages are used.

The MP4 is `out/tenantreach-reachassist-walkthrough.mp4` (H.264, YUV420p, CRF 18). Seven PNG review frames and `render-manifest.json` are produced in `out/`. Publish only after checking the actual captures and rendered frames. Copying artifacts to the website is a separate release step.

## Capture contract

Provide these actual application viewport screenshots under `public/captures/`:

| File | Content |
| --- | --- |
| `workspace.png` | Workspace overview |
| `audience.png` | People or audience selection |
| `notice.png` | Notice composition |
| `inbox.png` | Incoming messages with automatic categories |
| `reachassist.png` | ReachAssist conversation requesting a notice |
| `review.png` | Actual notice composer Review step with an English-only notice and sample audience |

Use consistent desktop viewport dimensions, preferably 1600 × 900, at least 1280 × 720. Full screenshots are contained without cropping; do not supply long full-page captures. Use known synthetic data only and ensure the assistant visibly says ReachAssist. Do not alter captured interface text in an image editor. A permanent caption, “Demo workspace · sample data,” is present throughout the composition. The local Geist font and its OFL license are included under `public/fonts/`.

### Capture provenance

The October 14, 2026 captures show the actual current application at origin/main `5cf4bb1`, with the authorized ReachAssist display rename. They use a synthetic demo workspace and English-only sample notices. Categorization displays seeded sample shadow-classification results, not a live AI inference run. The ReachAssist capture shows an actual conversation, a user request, an identified sample recipient, and a pending send summary. The final review capture shows the notice composer's actual Review step after preflight, with a sample audience and English-only notice. No send action was confirmed and no real recipients were contacted. These are labeled demonstrations of application interfaces, not evidence of message delivery or live inference.

## Timing and transcript

| Time | Caption | Supporting caption |
| --- | --- | --- |
| 00:00–00:05 | Tenant communication, in one workspace | From your audience to a notice ready for review. |
| 00:05–00:11 | Choose who to reach | Start with the right people and property. |
| 00:11–00:17 | Draft a clear notice | Compose your message with the audience in view. |
| 00:17–00:24 | Automatic Message Categorization | Keep incoming messages organized by topic. |
| 00:24–00:29 | Talk to ReachAssist to message tenants | Describe the notice you want to prepare. |
| 00:29–00:34 | Review before sending | Check the message and recipients. You stay in control. |
| 00:34–00:40 | A clearer path from intent to notice. | Automatic Message Categorization. ReachAssist. Your review before sending. TenantReach.net. |

The website should supply accessible controls, a visible text transcript, and a static poster. Keep playback user-initiated. All essential narration is in the visible captions; there is no audio track.

## Design

The video inherits the app's Geist and monochrome design. A single full screenshot carries each scene, with a 0.8% restrained scale movement. Titles occupy a separate caption area. Flat paper surfaces, fine borders, compact corners, and a near-black closing frame keep attention on the product. No invented cursor clicks, simulated typing, or fabricated send confirmation are used.

Implementation follows the official [Remotion rendering API](https://www.remotion.dev/docs/renderer/render-media) and [local font loading API](https://www.remotion.dev/docs/fonts-api/load-font).

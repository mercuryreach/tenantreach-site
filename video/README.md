# TenantReach + ReachAssist walkthrough

A narrated Remotion walkthrough with ElevenLabs speech and an original Suno instrumental, rendered at 1920 × 1080, 30 fps, 40 seconds. It shows genuine application captures using a demo workspace with sample data. The video stops at review; no message is sent or presented as sent.

## Reproduce

From this directory, with Node.js 22 or newer:

```powershell
npm ci
npm run check
npm run stills
npm run render
```

`npm run studio` opens the editable composition. The renderer uses Remotion's supported Chromium download and writes only to `build/` and `out/`. The first render may require network access for Chromium. Dependencies are pinned in `package-lock.json`; no parent application packages are used.

The MP4 is `out/tenantreach-reachassist-walkthrough.mp4` (H.264, YUV420p, CRF 18, stereo AAC at 192 kbps). Seven PNG review frames and `render-manifest.json` are produced in `out/`. Publish only after checking the actual captures and rendered frames. Copying artifacts to the website is a separate release step.

The October 14 logo-refresh release was normalized with FFmpeg after Remotion's Chromium 157 renderer reported full-range `yuvj420p`, despite the requested `yuv420p`. The published file is verified as limited-range `yuv420p`. When reproducing with that renderer, normalize its output before publication:

```powershell
ffmpeg -i out/tenantreach-reachassist-walkthrough.mp4 -map 0:v:0 -map 0:a:0 -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset medium -crf 18 -c:a copy -movflags +faststart out/tenantreach-reachassist-walkthrough-web.mp4
Copy-Item out/tenantreach-reachassist-walkthrough-web.mp4 out/tenantreach-reachassist-walkthrough.mp4
```

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

The October 14, 2026 logo refresh uses actual application screenshots from preview commit `04070fd7aab49a74232727f35cfcbd4d9d010165`. That preview combines the [ReachAssist display rename (PR #104)](https://github.com/mercuryreach/MercuryReach/pull/104) and the [approved solid Send logo (PR #106)](https://github.com/mercuryreach/MercuryReach/pull/106), on application baseline `5cf4bb1ea51e1620272a5f36a0ef22a6c2d185e9`. Publishing these marketing captures does not deploy either application change.

The captures use a freshly seeded, isolated synthetic demo workspace and English-only sample notices. Categorization displays seeded sample shadow-classification results, not a live AI inference run. ReachAssist runs in deterministic mode and shows an actual conversation, an identified sample recipient, and a pending send summary. The final capture shows the notice composer's actual Review step after preflight. No send action was confirmed and no real recipients were contacted. Capture hashes and the source snapshot are recorded in `capture-manifest.json`. The audio edition preserves the visual story, timing, and delivery claims. Captions and the website transcript match its new narration.

## Audio production

The stock ElevenLabs Sarah voice uses the stable `eleven_multilingual_v2` model. Brand names are spoken as “Tenant Reach” and “Reach Assist.” `audio-plan.json` records the scene windows, narration, voice settings, and Suno instrumental prompt. The generated character timestamps align the speech to each scene without speeding it up.

`public/audio/walkthrough-soundtrack.wav` is the prepared 40-second, 48 kHz stereo master used directly by Remotion. Rendering the checked-in project does not call either audio service. `audio-manifest.json` records source provenance, hashes, and measured mix results. The Suno track is downloaded through its official menu under the paid plan; the ElevenLabs paid account was confirmed by the user.

To prepare a new mix from local source assets, place the original narration, character alignment, licensed music, and `voice-segments.json` in `.cache/audio/`, then run `node video/scripts/mix-audio.mjs --music video/.cache/audio/suno-music-40s.wav --out video/out/walkthrough-soundtrack.wav` from the site root. The cue source ranges are also retained in the checked-in master audit JSON. The script validates cue boundaries, normalizes speech and music separately, ducks music under the narrator, and applies gentle opening/closing fades. It refuses to overwrite an existing output or audit, and produces a new master plus an audit JSON. Source service credentials belong only in the environment and are never part of the render bundle.

This edition uses the officially unlocked MP3 of [TenantReach – Clear Path](https://suno.com/song/8ae53b53-9d44-4332-ae5a-647d17ae038c). Its 37.64-second source is pitch-preservingly stretched to 40 seconds before mixing (`atempo=0.941`), without looping. The seven spoken cues stay at their original speed. The published MP4 adds the soundtrack to the approved October 14 video with stream copying, preserving every original video frame:

```powershell
ffmpeg -i public/media/tenantreach-reachassist-walkthrough.mp4 -i video/public/audio/walkthrough-soundtrack.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 40 -movflags +faststart video/out/tenantreach-walkthrough-audio.mp4
```

`audio-manifest.json` records the actual preparation and final encoded-media measurements. Raw service responses and signed download links are kept out of the published assets.

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

The website should supply accessible controls, a visible text transcript, and a static poster. Keep playback user-initiated. The English caption track and website transcript contain the complete spoken narration. The on-screen scene headings and permanent sample-data footer remain visible.

## Design

The video inherits the app's Geist and monochrome design. A single full screenshot carries each scene, with a 0.8% restrained scale movement. Titles occupy a separate caption area. Flat paper surfaces, fine borders, compact corners, and a near-black closing frame keep attention on the product. No invented cursor clicks, simulated typing, or fabricated send confirmation are used.

Implementation follows the official [Remotion rendering API](https://www.remotion.dev/docs/renderer/render-media) and [local font loading API](https://www.remotion.dev/docs/fonts-api/load-font).

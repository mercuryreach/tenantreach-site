import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { checkAssets, projectRoot } from './check-assets.mjs';

const assets = checkAssets();
const output = path.join(projectRoot, 'out');
mkdirSync(output, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(projectRoot, 'src', 'index.ts'),
  outDir: path.join(projectRoot, 'build'),
  publicDir: path.join(projectRoot, 'public'),
});
const composition = await selectComposition({ serveUrl, id: 'TenantReachWalkthrough' });
if (process.argv.includes('--stills')) {
  for (const [name, frame] of [
    ['workspace', 75], ['audience', 240], ['notice', 420], ['inbox', 615],
    ['reachassist', 795], ['review', 945], ['closing', 1110],
  ]) {
    await renderStill({
      composition, serveUrl, frame,
      output: path.join(output, `${name}.png`), imageFormat: 'png',
    });
    console.log(`Rendered ${name}.png (frame ${frame})`);
  }
} else {
  let lastProgress = -1;
  await renderMedia({
    composition, serveUrl, codec: 'h264', pixelFormat: 'yuv420p', crf: 18,
    audioCodec: 'aac', audioBitrate: '192k', sampleRate: 48000,
    concurrency: 2,
    outputLocation: path.join(output, 'tenantreach-reachassist-walkthrough.mp4'),
    onProgress: ({ progress }) => {
      const step = Math.floor(progress * 10);
      if (step !== lastProgress) {
        console.log(`Rendering: ${step * 10}%`);
        lastProgress = step;
      }
    },
  });
}
writeFileSync(path.join(output, 'render-manifest.json'), JSON.stringify({
  composition: composition.id, width: composition.width, height: composition.height,
  fps: composition.fps, durationInFrames: composition.durationInFrames,
  durationSeconds: composition.durationInFrames / composition.fps,
  assets, mode: process.argv.includes('--stills') ? 'stills' : 'video',
}, null, 2));

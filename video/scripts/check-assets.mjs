import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const captureNames = ['workspace', 'audience', 'notice', 'inbox', 'reachassist', 'review'];

export function checkAssets() {
  const assets = captureNames.map((name) => {
    const bytes = readFileSync(path.join(projectRoot, 'public', 'captures', `${name}.png`));
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
      throw new Error(`${name}.png is not a PNG capture`);
    }
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (width < 1280 || height < 720 || width / height < 1.3 || width / height > 2.5) {
      throw new Error(`${name}.png must be a desktop viewport capture (at least 1280×720), received ${width}×${height}`);
    }
    return { name, width, height };
  });
  readFileSync(path.join(projectRoot, 'public', 'fonts', 'geist-latin-variable.woff2'));
  const soundtrack = readFileSync(path.join(projectRoot, 'public', 'audio', 'walkthrough-soundtrack.wav'));
  if (soundtrack.subarray(0, 4).toString() !== 'RIFF' || soundtrack.subarray(8, 12).toString() !== 'WAVE') {
    throw new Error('The prepared narration and music soundtrack must be a WAV file.');
  }
  return assets;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(checkAssets(), null, 2));
}

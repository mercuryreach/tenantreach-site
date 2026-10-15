#!/usr/bin/env node

/**
 * Prepare the timed walkthrough soundtrack without changing either source file.
 * Run from the site root so source paths in voice-segments.json resolve consistently.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const siteRoot = process.cwd();
const defaults = {
  segments: 'video/.cache/audio/voice-segments.json',
};

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--help' || option === '-h') {
      process.stdout.write('Usage: node video/scripts/mix-audio.mjs [--segments <path>] [--music <path>] [--out <path>]\n');
      process.exit(0);
    }
    if (!['--segments', '--music', '--out'].includes(option)) {
      fail(`Unknown option: ${option}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${option}`);
    options[option.slice(2)] = value;
    index += 1;
  }
  return options;
}

function resolveSitePath(value, label) {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty path`);
  return isAbsolute(value) ? value : resolve(siteRoot, value);
}

function readJson(pathname, label) {
  try {
    return JSON.parse(readFileSync(pathname, 'utf8'));
  } catch (error) {
    fail(`Could not read ${label} (${pathname}): ${error.message}`);
  }
}

function finiteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${label} must be a finite number`);
  return value;
}

function run(program, args, label) {
  const result = spawnSync(program, args, { encoding: 'utf8', shell: false, windowsHide: true });
  if (result.error) fail(`Could not run ${program} for ${label}: ${result.error.message}`);
  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || '').trim();
    fail(`${program} failed while ${label}${details ? `:\n${details}` : ''}`);
  }
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function probeAudio(pathname, label) {
  const raw = run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', pathname,
  ], `probing ${label}`);
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    fail(`ffprobe returned unreadable JSON for ${label}: ${error.message}`);
  }
  const duration = Number(data?.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) fail(`${label} has no usable audio duration`);
  if (!data?.streams?.some((stream) => stream.codec_type === 'audio')) fail(`${label} has no audio stream`);
  return duration;
}

function hashFile(pathname) {
  return createHash('sha256').update(readFileSync(pathname)).digest('hex');
}

function filterNumber(value) {
  return Number(value.toFixed(6)).toString();
}

function parseFinalLoudnorm(ffmpegOutput) {
  const objects = [...ffmpegOutput.matchAll(/\{\s*"input_i"[\s\S]*?\n\}/g)];
  const last = objects.at(-1)?.[0];
  if (!last) fail('ffmpeg did not print final loudnorm measurements');
  try {
    const measurement = JSON.parse(last);
    const integratedLoudness = Number(measurement.output_i);
    const truePeak = Number(measurement.output_tp);
    if (!Number.isFinite(integratedLoudness) || !Number.isFinite(truePeak)) {
      fail('ffmpeg printed incomplete final loudnorm measurements');
    }
    return { integratedLoudness, truePeak, raw: measurement };
  } catch (error) {
    fail(`Could not parse final loudnorm measurements: ${error.message}`);
  }
}

function validatePlan(plan, narrationDuration, musicDuration) {
  const durationSeconds = finiteNumber(plan.durationSeconds, 'durationSeconds');
  const sampleRate = finiteNumber(plan.sampleRate, 'sampleRate');
  if (durationSeconds !== 40) fail('durationSeconds must be exactly 40');
  if (sampleRate !== 48000) fail('sampleRate must be exactly 48000');
  if (!Array.isArray(plan.cues) || plan.cues.length === 0) fail('cues must be a non-empty array');
  if (musicDuration < durationSeconds) {
    fail(`music source is ${musicDuration.toFixed(3)}s; it must be at least ${durationSeconds}s and will not be repeated or padded`);
  }

  let priorEnd = 0;
  return plan.cues.map((cue, index) => {
    const prefix = `cues[${index}]`;
    if (!cue || typeof cue !== 'object') fail(`${prefix} must be an object`);
    if (typeof cue.id !== 'string' || cue.id.length === 0) fail(`${prefix}.id must be a non-empty string`);
    const start = finiteNumber(cue.start, `${prefix}.start`);
    const end = finiteNumber(cue.end, `${prefix}.end`);
    const sourceStart = finiteNumber(cue.sourceStart, `${prefix}.sourceStart`);
    const sourceEnd = finiteNumber(cue.sourceEnd, `${prefix}.sourceEnd`);
    const playbackRate = finiteNumber(cue.playbackRate, `${prefix}.playbackRate`);
    if (start < priorEnd - 1e-6) fail(`${prefix} overlaps the preceding cue`);
    if (start < 0 || end <= start || end > durationSeconds + 1e-6) fail(`${prefix} must stay within 0-${durationSeconds}s`);
    if (sourceStart < 0 || sourceEnd <= sourceStart || sourceEnd > narrationDuration + 1e-6) {
      fail(`${prefix} source range must stay within the ${narrationDuration.toFixed(3)}s narration source`);
    }
    if (playbackRate < 1 || playbackRate > 1.18) fail(`${prefix}.playbackRate must be between 1 and 1.18`);
    const sourceDuration = sourceEnd - sourceStart;
    const renderedDuration = sourceDuration / playbackRate;
    if (renderedDuration > end - start + 1e-4) {
      fail(`${prefix} renders for ${renderedDuration.toFixed(3)}s but its slot is only ${(end - start).toFixed(3)}s`);
    }
    if (cue.sourceDuration !== undefined && Math.abs(finiteNumber(cue.sourceDuration, `${prefix}.sourceDuration`) - sourceDuration) > 1e-4) {
      fail(`${prefix}.sourceDuration does not match sourceStart/sourceEnd`);
    }
    priorEnd = end;
    return { ...cue, start, end, sourceStart, sourceEnd, playbackRate, sourceDuration, renderedDuration };
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const segmentsPath = resolveSitePath(args.segments || defaults.segments, 'segments');
  const plan = readJson(segmentsPath, 'segments JSON');
  const narrationPath = resolveSitePath(plan.narrationSource, 'narrationSource');
  const musicPath = resolveSitePath(args.music || plan.musicSource, 'musicSource');
  const outputPath = resolveSitePath(args.out || plan.output, 'output');
  const auditPath = `${outputPath}.audit.json`;

  if (!existsSync(narrationPath)) fail(`Narration source does not exist: ${narrationPath}`);
  if (!existsSync(musicPath)) fail(`Music source does not exist: ${musicPath}`);
  if (existsSync(outputPath) || existsSync(auditPath)) {
    fail(`Refusing to overwrite existing output or audit file: ${outputPath}`);
  }

  const narrationDuration = probeAudio(narrationPath, 'narration source');
  const musicDuration = probeAudio(musicPath, 'music source');
  const cues = validatePlan(plan, narrationDuration, musicDuration);
  const durationSeconds = plan.durationSeconds;
  const sampleRate = plan.sampleRate;

  const filters = [];
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index];
    const tempo = cue.playbackRate === 1 ? '' : `,atempo=${filterNumber(cue.playbackRate)}`;
    const slotDuration = cue.end - cue.start;
    const trailingDuration = durationSeconds - cue.end;
    filters.push(
      `[0:a]atrim=start=${filterNumber(cue.sourceStart)}:end=${filterNumber(cue.sourceEnd)},asetpts=PTS-STARTPTS${tempo},` +
      `aresample=${sampleRate},aformat=channel_layouts=stereo,loudnorm=I=-18:TP=-2:LRA=7:print_format=summary,` +
      `aresample=${sampleRate},asetpts=PTS-STARTPTS,apad=whole_dur=${filterNumber(slotDuration)},atrim=end=${filterNumber(slotDuration)}[spoken${index}]`,
    );
    filters.push(
      `anullsrc=r=${sampleRate}:cl=stereo,atrim=end=${filterNumber(cue.start)}[pre${index}]`,
    );
    filters.push(
      `anullsrc=r=${sampleRate}:cl=stereo,atrim=end=${filterNumber(trailingDuration)}[post${index}]`,
    );
    filters.push(
      `[pre${index}][spoken${index}][post${index}]concat=n=3:v=0:a=1[v${index}]`,
    );
  }
  filters.push(
    `${cues.map((_, index) => `[v${index}]`).join('')}amix=inputs=${cues.length}:duration=longest:normalize=0,` +
    `atrim=end=${durationSeconds},asetpts=PTS-STARTPTS,apad=whole_dur=${durationSeconds},asplit=2[voiceDuck][voiceMix]`,
  );
  filters.push(
    `[1:a]atrim=end=${durationSeconds},asetpts=PTS-STARTPTS,aresample=${sampleRate},aformat=channel_layouts=stereo,` +
    `afade=t=in:st=0:d=0.8,afade=t=out:st=${filterNumber(durationSeconds - 1.2)}:d=1.2,` +
    `loudnorm=I=-27:TP=-3:LRA=7:print_format=summary[music]`,
  );
  filters.push('[music][voiceDuck]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[ducked]');
  filters.push(
    `[voiceMix][ducked]amix=inputs=2:duration=longest:normalize=0,apad=whole_dur=${durationSeconds},atrim=end=${durationSeconds},` +
    `loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json,aresample=${sampleRate},asetpts=PTS-STARTPTS,apad=pad_dur=1,atrim=end=${durationSeconds}[mix]`,
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  const tempDirectory = mkdtempSync(resolve(dirname(outputPath), '.mix-audio-'));
  const intermediatePath = resolve(tempDirectory, 'mixed-first-pass.wav');
  const temporaryOutputPath = resolve(tempDirectory, 'mixed-final.wav');
  let ffmpegOutput;
  let outputDuration;
  try {
    ffmpegOutput = run('ffmpeg', [
      '-hide_banner', '-nostdin', '-i', narrationPath, '-i', musicPath,
      '-filter_complex', filters.join(';'), '-map', '[mix]',
      '-ar', String(sampleRate), '-ac', '2', '-c:a', 'pcm_s16le', intermediatePath,
    ], 'mixing soundtrack');
    run('ffmpeg', [
      '-hide_banner', '-nostdin', '-i', intermediatePath,
      '-af', `apad=pad_dur=1,atrim=end=${durationSeconds},asetpts=PTS-STARTPTS`,
      '-ar', String(sampleRate), '-ac', '2', '-c:a', 'pcm_s16le', temporaryOutputPath,
    ], 'padding final soundtrack to its exact duration');
    outputDuration = probeAudio(temporaryOutputPath, 'mixed output');
    if (Math.abs(outputDuration - durationSeconds) > 1e-6) {
      fail(`Mixed output duration is ${outputDuration.toFixed(6)}s instead of ${durationSeconds}s`);
    }
    renameSync(temporaryOutputPath, outputPath);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
  const finalLoudnorm = parseFinalLoudnorm(ffmpegOutput);

  const ffmpegVersion = run('ffmpeg', ['-version'], 'reading ffmpeg version').split(/\r?\n/, 1)[0];
  const audit = {
    version: 1,
    output: relative(siteRoot, outputPath).replaceAll('\\', '/'),
    durationSeconds: outputDuration,
    sampleRate,
    channels: 2,
    codec: 'pcm_s16le',
    inputs: {
      narration: { path: relative(siteRoot, narrationPath).replaceAll('\\', '/'), sha256: hashFile(narrationPath), durationSeconds: narrationDuration },
      music: { path: relative(siteRoot, musicPath).replaceAll('\\', '/'), sha256: hashFile(musicPath), durationSeconds: musicDuration },
    },
    cues: cues.map((cue) => ({
      id: cue.id, start: cue.start, end: cue.end, sourceStart: cue.sourceStart, sourceEnd: cue.sourceEnd,
      playbackRate: cue.playbackRate, sourceDuration: cue.sourceDuration, renderedDuration: cue.renderedDuration,
    })),
    ffmpegVersion,
    outputSha256: hashFile(outputPath),
    finalLoudnorm: {
      target: { integratedLoudness: -16, truePeak: -1.5, loudnessRange: 7 },
      reportedIntegratedLoudness: finalLoudnorm.integratedLoudness,
      reportedTruePeak: finalLoudnorm.truePeak,
      raw: finalLoudnorm.raw,
    },
  };
  writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
  process.stdout.write(`Wrote ${relative(siteRoot, outputPath)} and ${relative(siteRoot, auditPath)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`mix-audio: ${error.message}\n`);
  process.exitCode = 1;
}

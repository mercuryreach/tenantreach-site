/**
 * Established world: local Geist, paper, near-black ink and fine rules.
 * Show one genuine app capture at a time; never fabricate interface actions.
 * A sample-data footer stays visible for every frame, including the close.
 * The story ends at draft review. No sent state or autonomous-send claim.
 */
import { loadFont } from '@remotion/fonts';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

loadFont({
  family: 'Geist',
  url: staticFile('fonts/geist-latin-variable.woff2'),
  weight: '100 900',
});

const paper = '#fafafa';
const ink = '#171717';
const muted = '#626262';
const rule = '#dedede';

type Scene = {
  from: number;
  frames: number;
  capture: string;
  title: string;
  description: string;
  reviewTitle?: string;
  reviewDescription?: string;
};

const scenes: Scene[] = [
  {
    from: 0,
    frames: 150,
    capture: 'workspace',
    title: 'Tenant communication, in one workspace',
    description: 'From your audience to a notice ready for review.',
  },
  {
    from: 150,
    frames: 180,
    capture: 'audience',
    title: 'Choose who to reach',
    description: 'Start with the right people and property.',
  },
  {
    from: 330,
    frames: 180,
    capture: 'notice',
    title: 'Draft a clear notice',
    description: 'Compose your message with the audience in view.',
  },
  {
    from: 510,
    frames: 210,
    capture: 'inbox',
    title: 'Automatic Message Categorization',
    description: 'Keep incoming messages organized by topic.',
  },
  {
    from: 720,
    frames: 300,
    capture: 'reachassist',
    title: 'Talk to ReachAssist to message tenants',
    description: 'Describe the notice you want to prepare.',
    reviewTitle: 'Review before sending',
    reviewDescription: 'Check the message and recipients. You stay in control.',
  },
];

const CaptureScene = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // Slow camera movement is limited to 0.8%; contain preserves the whole capture.
  const scale = interpolate(frame, [0, scene.frames - 1], [0.992, 1]);
  const review = Boolean(scene.reviewTitle) && frame >= 150;
  return (
    <AbsoluteFill style={{ opacity: entrance }}>
      <div style={{ position: 'absolute', top: 46, left: 88, right: 88 }}>
        <h1 style={{ margin: 0, fontSize: 52, fontWeight: 600, lineHeight: 1.16, letterSpacing: '-0.035em' }}>
          {review ? scene.reviewTitle : scene.title}
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 27, lineHeight: 1.4, color: muted }}>
          {review ? scene.reviewDescription : scene.description}
        </p>
      </div>
      <div style={{
        position: 'absolute', top: 191, left: 88, right: 88, height: 784,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        transform: `scale(${scale})`,
      }}>
        <Img src={staticFile(`captures/${review ? 'review' : scene.capture}.png`)} style={{
          maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
          border: `1px solid ${rule}`, borderRadius: 9,
        }} />
      </div>
    </AbsoluteFill>
  );
};

const Closing = () => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ background: ink, color: '#fff', justifyContent: 'center', padding: 120, opacity: entrance }}>
      <div style={{ transform: `translateY(${(1 - entrance) * 12}px)` }}>
        <h1 style={{ margin: 0, fontSize: 94, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
          A clearer path<br />from intent to notice.
        </h1>
        <p style={{ margin: '34px 0 0', fontSize: 34, lineHeight: 1.5, color: '#d4d4d4' }}>
          Automatic Message Categorization.<br />ReachAssist. Your review before sending.
        </p>
        <div style={{ marginTop: 68, paddingTop: 30, borderTop: '1px solid #555', fontSize: 46, fontWeight: 500, letterSpacing: '-0.025em' }}>
          TenantReach.net
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Walkthrough = () => {
  const frame = useCurrentFrame();
  const closing = frame >= 1020;
  return (
    <AbsoluteFill style={{ backgroundColor: paper, color: ink, fontFamily: 'Geist, sans-serif' }}>
      <Html5Audio src={staticFile('audio/walkthrough-soundtrack.wav')} />
      {scenes.map((scene) => (
        <Sequence key={scene.capture} from={scene.from} durationInFrames={scene.frames}>
          <CaptureScene scene={scene} />
        </Sequence>
      ))}
      <Sequence from={1020} durationInFrames={180}><Closing /></Sequence>
      <div style={{
        position: 'absolute', left: 88, right: 88, bottom: 27,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${closing ? '#555' : rule}`, paddingTop: 18,
        fontSize: 22, fontWeight: 500, color: closing ? '#e5e5e5' : muted,
      }}>
        <span>Demo workspace · sample data</span>
        <span>{closing ? 'A guided product walkthrough' : 'TenantReach.net'}</span>
      </div>
    </AbsoluteFill>
  );
};

import { Composition } from 'remotion';
import { Walkthrough } from './Walkthrough';

export const Root = () => (
  <Composition
    id="TenantReachWalkthrough"
    component={Walkthrough}
    durationInFrames={1200}
    fps={30}
    width={1920}
    height={1080}
  />
);

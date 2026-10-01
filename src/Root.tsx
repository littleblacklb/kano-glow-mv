import "./index.css";
import { Composition } from "remotion";
import { DURATION_IN_FRAMES, FPS, GlowMV } from "./GlowMV";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GlowMV"
    component={GlowMV}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

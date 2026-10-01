import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { boilFrame } from "../lib/draw";
import { envelope, skyAt, W } from "../data/timeline";

export const Sky: React.FC<{ t: number }> = ({ t }) => {
  const { top, bottom } = skyAt(t);
  return <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)` }} />;
};

// Kept off during the flat-red cover scenes so they match the jacket.
export const Vignette: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill
    style={{
      opacity: 1 - Math.max(envelope(t, W.character), envelope(t, W.outro)),
      background: "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(10,6,12,0.34) 100%)",
    }}
  />
);

// grain.jpg is the frame size plus this margin, so it can shift without showing an edge.
const GRAIN_MARGIN = 512;

// Paper grain, shifted to a new random offset every drawing.
export const Grain: React.FC<{ t: number }> = ({ t }) => {
  const b = boilFrame(t);
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "overlay", opacity: 0.22 }}>
      <Img
        src={staticFile("grain.jpg")}
        style={{
          position: "absolute",
          left: -Math.floor(random(`gx${b}`) * GRAIN_MARGIN),
          top: -Math.floor(random(`gy${b}`) * GRAIN_MARGIN),
        }}
      />
    </AbsoluteFill>
  );
};

export const FadeToBlack: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - envelope(t, W.fadeToBlack) }} />
);

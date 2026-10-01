import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { envelope, W } from "../data/timeline";

// kano.png is cut from the jacket by scripts/cutout.py (625×1295).
const ASPECT = 625 / 1295;

// The jacket character, only in the intro and outro, standing where the cover places her.
export const Character: React.FC<{ t: number; amp: number }> = ({ t, amp }) => {
  const { width, height } = useVideoConfig();
  const vis = Math.max(envelope(t, W.character), envelope(t, W.outro));
  if (vis === 0) return null;
  const h = height * 0.86;
  const w = h * ASPECT;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Img
        src={staticFile("kano.png")}
        style={{
          position: "absolute",
          width: w,
          height: h,
          left: width * 0.66 - w / 2,
          top: height * 0.955 - h,
          transformOrigin: "50% 100%",
          // slow breathing plus a faint sway with the strum
          scale: `1 ${1 + Math.sin((t / 3.6) * Math.PI * 2) * 0.005 + amp * 0.004}`,
          rotate: `${Math.sin((t / 5.3) * Math.PI * 2) * 0.45}deg`,
        }}
      />
    </AbsoluteFill>
  );
};

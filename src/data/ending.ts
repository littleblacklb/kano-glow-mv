import { Easing, interpolate } from "remotion";
import { envelope, W } from "./timeline";

// Cloud-gap light opens out once, then lingers. No growing sun or full-frame whiteout.
export const endingLightAt = (t: number) => {
  const spread = interpolate(t, [228, 256], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return {
    opacity: envelope(t, W.lightLeak) * 0.5,
    rx: 20 + spread * 18,
    ry: 12 + spread * 14,
    y: 42 + spread * 12,
  };
};

// Only the world softens; lyrics and the held figure stay readable.
export const endingAt = (t: number) => ({
  backgroundBlur: interpolate(t, [238, 250], [0, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  // Ease the last pose toward stillness rather than abruptly freezing its drawing.
  poseTime: t <= 238 ? t : 238 + 12 * (1 - Math.exp(-(t - 238) / 12)),
});

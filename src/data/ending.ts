import { interpolate } from "remotion";

// Only the world softens; lyrics and the held figure stay readable.
export const endingAt = (t: number) => ({
  backgroundBlur: interpolate(t, [238, 250], [0, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  // Ease the last pose toward stillness rather than abruptly freezing its drawing.
  poseTime: t <= 238 ? t : 238 + 12 * (1 - Math.exp(-(t - 238) / 12)),
});

import { Easing, interpolate } from "remotion";
import { envelope, W } from "./timeline";

// A single receding patch of dusk, not falling liquid or accumulated pigment.
export const afterglowAt = (t: number) => ({
  opacity: envelope(t, W.afterglow) * 0.2,
  y: interpolate(t, [203, 226], [0.27, 0.53], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  }),
});

import { Easing, interpolate } from "remotion";
import { envelope, W } from "./timeline";

// One continuous dusk source: established before the hand, gone as it leaves.
export const afterglowAt = (t: number) => {
  const strength = envelope(t, W.afterglow);
  return {
    handOpacity: strength * 0.88,
    skyOpacity: strength * 0.85,
  };
};

// Only a few upper-sky stars precede the hand. The rest emerge as dusk dies.
export const starRevealAt = (t: number, index: number) => {
  const night = interpolate(t, [204, 216], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return index % 9 === 0 ? 0.35 + night * 0.65 : night;
};

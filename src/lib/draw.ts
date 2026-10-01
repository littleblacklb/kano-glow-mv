import { noise2D } from "@remotion/noise";
import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";

export const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// Procedural layers animate "on threes" (12 drawings/s) so they read as hand-drawn.
export const DRAW_FPS = 12;
export const onThrees = (t: number) => Math.floor(t * DRAW_FPS) / DRAW_FPS;
// Index of the current drawing; feeds the line boil so outlines re-jitter each drawing.
export const boilFrame = (t: number) => Math.floor(t * DRAW_FPS);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const ramp = (t: number, from: number, to: number) =>
  interpolate(t, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const mix = (a: string, b: string, amount: number) => interpolateColors(amount, [0, 1], [a, b]);

// A closed circle whose radius jitters with noise, like a pen-drawn ring.
export const wobblyCircle = (
  cx: number,
  cy: number,
  r: number,
  seed: string,
  boil: number,
  amp = 3,
  steps = 56,
) => {
  const pts = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + noise2D(seed, Math.cos(a) * 1.3 + boil * 7.1, Math.sin(a) * 1.3) * amp;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
};

// A polyline through the given points with a little per-drawing jitter.
export const wobblyLine = (points: [number, number][], seed: string, boil: number, amp = 2) =>
  `M${points
    .map(([x, y], i) => {
      const jx = noise2D(seed, i * 0.37, boil * 3.3) * amp;
      const jy = noise2D(seed + "y", i * 0.37, boil * 3.3) * amp;
      return `${(x + jx).toFixed(1)},${(y + jy).toFixed(1)}`;
    })
    .join("L")}`;

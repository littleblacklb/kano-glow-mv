import { Easing, interpolate } from "remotion";
import { LYRIC_COLUMN_LEFT } from "./characterScenes";

// The wide shot's camera: everything behind the lyrics scales around this point (fractions of the frame).
// On the lyric columns' left edge, so pushing in only ever moves the scenery away from the lyrics.
export const CAMERA_ORIGIN: [number, number] = [LYRIC_COLUMN_LEFT, 0.86];

// Each pose gets a slow push-in while it holds (to 1.08), easing back while it crossfades into the next.
// ぎゅっとしがみついた closes in on her and the shadow 君 gathers into, and holds while the world fades to
// the cover red, where the camera can reset unseen.
export const PUSH: [number, number][] = [
  [30, 1], // rain
  [66, 1.08],
  [70, 1], // sunset
  [102, 1.08],
  [106, 1], // play
  [128, 1.08],
  [131, 1], // hug
  [164, 1.08],
  [168, 1], // night
  [200, 1.08],
  [203, 1], // fingertips
  [224, 1.08],
  [227, 1], // cling
  [238, 1.06],
  [250, 1.5],
  [262, 1.5],
  [263, 1],
];

export const MAX_PUSH = 1.08;

export const cameraAt = (t: number) => ({
  scale: interpolate(
    t,
    PUSH.map(([at]) => at),
    PUSH.map(([, s]) => s),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) },
  ),
});

// Where a frame point (px) lands once the camera has scaled the world.
export const throughCamera = (x: number, y: number, scale: number, width: number, height: number) => {
  const [ox, oy] = [CAMERA_ORIGIN[0] * width, CAMERA_ORIGIN[1] * height];
  return [ox + (x - ox) * scale, oy + (y - oy) * scale] as const;
};

import { Easing, interpolate } from "remotion";
import { LYRIC_COLUMN_LEFT } from "./characterScenes";
import { envelope } from "./timeline";

// The wide shot's camera: everything behind the lyrics scales around this point (fractions of the frame).
// On the lyric columns' left edge, so pushing in only ever moves the scenery away from the lyrics.
export const CAMERA_ORIGIN: [number, number] = [LYRIC_COLUMN_LEFT, 0.86];

// Each pose gets a slow push-in while it holds (to 1.08), easing back while it crossfades into the next;
// a close-up hides the reset when it cuts in.
// ぎゅっとしがみついた closes in on her and the shadow 君 gathers into, and holds while the world fades to
// the cover red, where the camera can reset unseen.
export const PUSH: [number, number][] = [
  [30, 1], // rain
  [66, 1.08],
  [70, 1], // sunset
  [102, 1.08],
  [106, 1], // play
  [128, 1.08],
  [131, 1], // hug, up to the cut to her face; reset behind it
  [150.1, 1.06],
  [150.5, 1],
  [158.8, 1],
  [164, 1.04],
  [168, 1], // night
  [200, 1.08],
  [203, 1], // fingertips, from behind the close-up of her hand
  [213.2, 1],
  [224, 1.06],
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

// Inserted shots at the song's peaks, drawn near full size over the whole frame (public/characters/<id>.png,
// cut off at the bottom edge). Lit like the wide pose they cut away from, left of the lyric columns.
export type CloseUp = {
  id: "close-face" | "close-hand";
  pose: string; // CHARACTER_SCENES id behind it: lends the tint, and is where the shot cuts back to
  aspect: number;
  window: [number, number, number, number];
  x: number; // center, fraction of the frame width
  h: number; // drawn height, fraction of the frame height
  bottom: number; // where the png's cut edge sits, fraction of the frame height (below the frame)
  push: number; // slow push-in across the shot, around the middle of its cut edge
  redraw?: [number, number]; // drawn back stroke by stroke over this range
};

export const CLOSE_UPS: CloseUp[] = [
  // どうして こんなにきつく抱きしめてるの?: a hard cut to her face on the line's first frame
  {
    id: "close-face",
    pose: "hug",
    aspect: 973 / 1342,
    window: [150.1, 150.13, 158.8, 160.2],
    x: 0.37,
    h: 0.92,
    bottom: 1.03,
    push: 1.05,
    // erased in the wide shot just before; こんなにきつく抱きしめてる draws her back
    redraw: [150.13, 154],
  },
  // 赤く染まる指先に / 零れ落ちそうな赤: her hand fades in out of the emptied night
  {
    id: "close-hand",
    pose: "fingertips",
    aspect: 812 / 762,
    window: [203.4, 204.2, 213.2, 214.2],
    x: 0.36,
    h: 0.82,
    bottom: 1.03,
    push: 1.06,
  },
];

// How much of the frame the close-ups cover (0–1); the wide shot's figures fade by it.
export const closeUpCover = (t: number) => Math.max(0, ...CLOSE_UPS.map((c) => envelope(t, c.window)));

// The shot's push-in at t: 1 → push from fade-in to fade-out.
export const closeUpPush = (c: CloseUp, t: number) =>
  interpolate(t, [c.window[0], c.window[3]], [1, c.push], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

import { interpolate, interpolateColors } from "remotion";

// All times are in seconds of the song. Section boundaries follow the LRC.
export const COVER_RED = "#C03437";
export const CREAM = "#FFF8DC";
export const INK = "#1A1414";

type SkyKey = { t: number; top: string; bottom: string };

// The color journey: cover red → cold rain → sunset → deep red → night → torn-cloud light → red.
const SKY: SkyKey[] = [
  { t: 0, top: COVER_RED, bottom: COVER_RED },
  { t: 22, top: COVER_RED, bottom: COVER_RED },
  { t: 31, top: "#26303E", bottom: "#4A5A6C" }, // 冷たい雨
  { t: 54, top: "#2A3444", bottom: "#56627A" },
  { t: 68, top: "#3A4058", bottom: "#8C6A70" }, // horizon warming
  { t: 78, top: "#6A3E4E", bottom: "#E0925E" },
  { t: 84, top: "#B0403C", bottom: "#F2A864" }, // 夕暮れの赤
  { t: 104, top: "#B8363A", bottom: "#E47A4A" },
  { t: 130, top: "#8A2430", bottom: "#C0463E" }, // 傷跡
  { t: 160, top: "#7E2230", bottom: "#B03C3C" },
  { t: 172, top: "#3A2646", bottom: "#78384E" },
  { t: 181, top: "#10152C", bottom: "#262B50" }, // 夜になるだけ
  { t: 201, top: "#10152C", bottom: "#2A2A52" },
  { t: 206, top: "#171833", bottom: "#554052" }, // a muted dusk reflection, not blood red
  { t: 214.2, top: "#181C37", bottom: "#39304D" }, // warmth recedes as the hand leaves
  { t: 226, top: "#1A1F3C", bottom: "#4A2846" },
  { t: 242, top: "#3C4270", bottom: "#E2A486" }, // 雲間
  { t: 256, top: "#6E5C7E", bottom: "#F4CCA4" },
  { t: 263, top: COVER_RED, bottom: COVER_RED },
  { t: 284, top: COVER_RED, bottom: COVER_RED },
];

const TS = SKY.map((k) => k.t);

export const skyAt = (t: number) => ({
  top: interpolateColors(t, TS, SKY.map((k) => k.top)),
  bottom: interpolateColors(t, TS, SKY.map((k) => k.bottom)),
});

// 0 → 1 over [a,b], held until c, back to 0 by d.
export const envelope = (t: number, [a, b, c, d]: [number, number, number, number]) =>
  interpolate(t, [a, b, c, d], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// When each layer is on screen: [fadeInStart, fullAt, fadeOutStart, goneAt].
export const W = {
  character: [0, 4, 22, 29],
  title: [14.5, 15.5, 22.5, 25],
  rain: [24, 32, 58, 72],
  inkBleed: [36, 40, 56, 64],
  horizon: [25, 32, 256, 262],
  sun: [70, 82, 165, 178],
  clouds: [100, 108, 130, 140],
  scars: [133, 134, 162, 170],
  stars: [174, 184, 228, 240],
  afterglow: [203, 206, 208.5, 226],
  tornClouds: [222, 228, 252, 258],
  lightLeak: [228, 240, 254, 262],
  outro: [258, 263, 283, 284],
  fadeToBlack: [-1, 1.2, 275, 282], // interpolate needs strictly increasing input
} satisfies Record<string, [number, number, number, number]>;

// Lyric lines sung inside these ranges melt away instead of fading.
export const MELT_RANGES: [number, number][] = [
  [37, 43],
  [78, 106],
  [191, 204],
  [203, 227],
];

// 君の声が遠くなる: the voice recedes, so do the lyrics.
export const DISTANT_RANGE: [number, number] = [180, 203];

// The character poses between the intro and outro, generated with gpt-image-2 (art/gen.sh)
// and cut out by scripts/key-characters.py into public/characters/<id>.png.
export type CharacterScene = {
  id: string;
  aspect: number; // width / height of the cut png
  window: [number, number, number, number]; // same shape as W in timeline.ts
  x: number; // center of her feet, fraction of the frame width
  h: number; // drawn height, fraction of the frame height
  tint: number; // 0–1, how far the sky color multiplies into her
  // Point of the png (fractions) that touches the ground; defaults to bottom center.
  // Needed when something drawn nearer the viewer (a guitar on the grass) hangs lower than she does.
  rest?: [number, number];
};

// Left edge of the widest lyric block (three vertical columns), fraction of the frame width.
export const LYRIC_COLUMN_LEFT = 0.74;

// Small on the horizon, between the second pole and the lyrics. Each pose fades out before the next fades in.
export const CHARACTER_SCENES: CharacterScene[] = [
  // 冷たい雨: standing in the rain, guitar hanging from one hand
  { id: "rain", aspect: 410 / 1184, window: [30, 36, 66, 70], x: 0.64, h: 0.36, tint: 0.5 },
  // 夕暮れの涙が出そうな赤: hugging her knees, facing the sun
  { id: "sunset", aspect: 826 / 890, window: [70, 76, 102, 106], x: 0.62, h: 0.24, tint: 0.4, rest: [0.15, 0.905] },
  // interlude: playing on the ground
  { id: "play", aspect: 783 / 946, window: [106, 110, 128, 131], x: 0.63, h: 0.26, tint: 0.4 },
  // 傷跡 / 抱きしめてる: eyes shut, holding the guitar tight
  { id: "hug", aspect: 541 / 1238, window: [131, 135, 164, 168], x: 0.64, h: 0.36, tint: 0.45 },
  // 君の声が遠くなる: looking up at the stars
  { id: "night", aspect: 434 / 1129, window: [168, 176, 200, 203], x: 0.64, h: 0.32, tint: 0.6 },
  // 赤く染まる指先: looking at her palm
  { id: "fingertips", aspect: 459 / 1259, window: [203, 206, 224, 227], x: 0.64, h: 0.36, tint: 0.55 },
  // 雲間 / しがみついた: clinging to the guitar, face to the light
  { id: "cling", aspect: 492 / 1288, window: [227, 232, 252, 258], x: 0.64, h: 0.36, tint: 0.35 },
];

// Feet sink a little into the ground line instead of balancing on its stroke.
export const FEET_SINK = 6;

// Where to draw a pose so its rest point sits on the ground directly under that point.
export const placeScene = (scene: CharacterScene, width: number, height: number, ground: (x: number) => number) => {
  const h = height * scene.h;
  const w = h * scene.aspect;
  const [rx, ry] = scene.rest ?? [0.5, 1];
  const left = width * scene.x - w / 2;
  return { left, top: ground(left + rx * w) - ry * h + FEET_SINK, w, h, origin: `${rx * 100}% ${ry * 100}%` };
};

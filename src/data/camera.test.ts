import { describe, expect, test } from "vitest";
import { cameraAt, MAX_PUSH, PUSH, throughCamera } from "./camera";
import { CHARACTER_SCENES, LYRIC_COLUMN_LEFT, placeScene } from "./characterScenes";
import { W } from "./timeline";

const [WIDTH, HEIGHT] = [1920, 1080];
const FPS = 30;

describe("cameraAt", () => {
  test("the cover scenes are never scaled", () => {
    for (let t = 0; t <= W.character[3]; t += 0.5) expect(cameraAt(t).scale, `t=${t}`).toBe(1);
    for (let t = W.outro[1]; t <= 284; t += 0.5) expect(cameraAt(t).scale, `t=${t}`).toBe(1);
  });

  test("every pose is pushed in slowly, and only ぎゅっとしがみついた closes in further", () => {
    for (let t = 0; t < 238; t += 0.25) expect(cameraAt(t).scale, `t=${t}`).toBeLessThanOrEqual(MAX_PUSH);
    expect(cameraAt(250).scale).toBeGreaterThan(1.4);
  });

  test("keys are strictly increasing", () => {
    for (let i = 1; i < PUSH.length; i++) expect(PUSH[i][0]).toBeGreaterThan(PUSH[i - 1][0]);
  });

  test("the camera drifts, it never jumps", () => {
    // the closing push peaks near 0.06 per second; the reset at 262–263 happens on flat cover red
    for (let f = 0; f < 262 * FPS; f++) {
      const d = Math.abs(cameraAt((f + 1) / FPS).scale - cameraAt(f / FPS).scale);
      expect(d * FPS, `t=${f / FPS}`).toBeLessThan(0.08);
    }
  });
});

describe("throughCamera", () => {
  test("pushing in never moves the scenery into the lyric columns", () => {
    const edge = LYRIC_COLUMN_LEFT * WIDTH;
    for (const s of [1, 1.08, 1.5])
      for (let x = 0; x < edge; x += 40)
        for (const y of [0, 500, 1080]) expect(throughCamera(x, y, s, WIDTH, HEIGHT)[0]).toBeLessThan(edge);
  });

  test("closed in at ぎゅっとしがみついた, she and her shadow stay in frame", () => {
    const cling = CHARACTER_SCENES.find((s) => s.id === "cling")!;
    const scale = cameraAt(250).scale;
    // the rolling ground stays within ±34px of 0.84H
    for (const g of [HEIGHT * 0.84 - 34, HEIGHT * 0.84 + 34]) {
      const her = placeScene(cling, WIDTH, HEIGHT, () => g);
      const [, top] = throughCamera(her.left, her.top, scale, WIDTH, HEIGHT);
      const [, shadowEnd] = throughCamera(her.left, g + her.h * cling.shadow.length, scale, WIDTH, HEIGHT);
      expect(top).toBeGreaterThan(0);
      expect(shadowEnd).toBeLessThan(HEIGHT);
    }
  });
});

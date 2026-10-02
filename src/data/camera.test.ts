import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { parseLrc } from "../lib/parseLrc";
import { cameraAt, CLOSE_UPS, closeUpCover, closeUpPush, MAX_PUSH, PUSH, throughCamera } from "./camera";
import { CHARACTER_SCENES, LYRIC_COLUMN_LEFT, placeScene } from "./characterScenes";
import { envelope, W } from "./timeline";

const [WIDTH, HEIGHT] = [1920, 1080];
const FPS = 30;

describe("cameraAt", () => {
  test("the opening cover is unscaled, the ending holds its framing", () => {
    for (let t = 0; t <= W.character[3]; t += 0.5) expect(cameraAt(t).scale, `t=${t}`).toBe(1);
    for (let t = 250; t <= 284; t += 0.5) expect(cameraAt(t).scale, `t=${t}`).toBe(1.5);
  });

  test("every pose is pushed in slowly, and only ぎゅっとしがみついた closes in further", () => {
    for (let t = 0; t < 238; t += 0.25) expect(cameraAt(t).scale, `t=${t}`).toBeLessThanOrEqual(MAX_PUSH);
    expect(cameraAt(250).scale).toBeGreaterThan(1.4);
  });

  test("keys are strictly increasing", () => {
    for (let i = 1; i < PUSH.length; i++) expect(PUSH[i][0]).toBeGreaterThan(PUSH[i - 1][0]);
  });

  test("the camera drifts, it never jumps where the wide shot can be seen", () => {
    // The closing push peaks near 0.06 per second and never resets during the tail.
    for (let f = 0; f < 284 * FPS; f++) {
      if (closeUpCover(f / FPS) === 1 && closeUpCover((f + 1) / FPS) === 1) continue;
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

describe("CLOSE_UPS", () => {
  const lyrics = parseLrc(readFileSync("public/glow.lrc", "utf8")).filter((l) => l.kind === "lyric");
  const firstFrame = (text: string) => Math.round((lyrics.find((l) => l.text.startsWith(text))!.startMs / 1000) * FPS);

  test("every window is strictly increasing", () => {
    for (const c of CLOSE_UPS) for (let i = 1; i < 4; i++) expect(c.window[i], c.id).toBeGreaterThan(c.window[i - 1]);
  });

  test("the cut to her face lands on the first frame of どうして", () => {
    const f = firstFrame("どうして");
    expect(closeUpCover((f - 1) / FPS)).toBe(0);
    expect(closeUpCover(f / FPS)).toBe(1);
  });

  test("her hand is in close-up while 赤く染まる指先に and 零れ落ちそうな赤 are sung", () => {
    expect(closeUpCover(firstFrame("赤く染まる指先に") / FPS + 1)).toBe(1);
    expect(closeUpCover(firstFrame("零れ落ちそうな赤") / FPS + 4)).toBe(1);
    expect(closeUpCover(firstFrame("私の中の君を奪ってしまう") / FPS)).toBe(0);
  });

  test("close-ups stay clear of the opening, final held pose and each other", () => {
    for (const c of CLOSE_UPS) {
      expect(c.window[0]).toBeGreaterThan(W.character[3]);
      expect(c.window[3]).toBeLessThan(227);
    }
    for (let i = 1; i < CLOSE_UPS.length; i++)
      expect(CLOSE_UPS[i].window[0]).toBeGreaterThan(CLOSE_UPS[i - 1].window[3]);
  });

  test("a close-up never reaches into the lyric columns, even pushed in", () => {
    for (const c of CLOSE_UPS) {
      const halfW = (c.h * HEIGHT * c.aspect * closeUpPush(c, c.window[3])) / 2;
      expect(c.x * WIDTH + halfW, c.id).toBeLessThan((LYRIC_COLUMN_LEFT - 0.02) * WIDTH);
    }
  });

  test("its cut edge stays below the frame and her head inside it", () => {
    for (const c of CLOSE_UPS) {
      expect(c.bottom, c.id).toBeGreaterThan(1);
      expect(c.bottom - c.h * closeUpPush(c, c.window[3]), c.id).toBeGreaterThan(0.03);
    }
  });

  test("erased in the wide shot, she is made whole only behind the close-up, which draws her back", () => {
    for (const scene of CHARACTER_SCENES.filter((s) => s.erase)) {
      const { from, to, until } = scene.erase!;
      expect(to, scene.id).toBeGreaterThan(from);
      expect(until, scene.id).toBeGreaterThan(to);
      expect(closeUpCover(until), scene.id).toBe(1);
      const shot = CLOSE_UPS.find((c) => c.pose === scene.id)!;
      expect(shot.redraw![0]).toBe(until);
      expect(shot.redraw![1]).toBeLessThan(shot.window[2]);
    }
  });

  test("the wide pose it cuts back to is already standing there", () => {
    for (const c of CLOSE_UPS) {
      const pose = CHARACTER_SCENES.find((s) => s.id === c.pose)!;
      for (let t = c.window[2]; t <= c.window[3]; t += 0.25) expect(envelope(t, pose.window), `${c.id} t=${t}`).toBe(1);
    }
  });
});

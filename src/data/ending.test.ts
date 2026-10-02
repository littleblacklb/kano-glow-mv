import { describe, expect, test } from "vitest";
import { endingAt, endingLightAt } from "./ending";
import { CHARACTER_SCENES } from "./characterScenes";
import { cameraAt } from "./camera";
import { envelope, skyAt, W } from "./timeline";

describe("unresolved lingering ending", () => {
  test("keeps the figure and horizon fully present until global black", () => {
    const cling = CHARACTER_SCENES.find((s) => s.id === "cling")!;
    for (let t = 238; t <= 282; t += 0.5) {
      expect(envelope(t, cling.window)).toBe(1);
      expect(envelope(t, W.horizon)).toBe(1);
      expect(envelope(t, W.character)).toBe(0);
      if (t >= 250) expect(cameraAt(t).scale).toBe(1.5);
    }
    expect(envelope(275, W.fadeToBlack)).toBe(1);
    expect(envelope(282, W.fadeToBlack)).toBe(0);
  });

  test("the sky warms once, then holds the glow and shadows instead of cooling to night", () => {
    const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    for (let t = 226; t < 256; t += 0.5) {
      for (const part of ["top", "bottom"] as const) {
        const before = channels(skyAt(t)[part]);
        channels(skyAt(t + 0.5)[part]).forEach((v, i) => expect(v).toBeGreaterThanOrEqual(before[i]));
      }
    }
    for (let t = 256; t <= 284; t += 0.5) {
      expect(skyAt(t)).toEqual(skyAt(256));
      expect(endingLightAt(t).opacity).toBe(t <= 283 ? 0.5 : (284 - t) * 0.5);
    }
    const { top, bottom } = skyAt(274);
    expect(Math.max(...channels(top))).toBeLessThan(100);
    expect(Math.max(...channels(bottom))).toBeLessThan(180);
    expect(channels(bottom)[0]).toBeGreaterThan(channels(bottom)[2]);
  });

  test("cloud-gap warmth spreads slowly within bounds and stops before the tail", () => {
    for (const t of [0, 172, 206, 226, 228, 284]) expect(endingLightAt(t).opacity).toBe(0);
    for (let t = 228; t < 256; t += 0.5) {
      const light = endingLightAt(t);
      const next = endingLightAt(t + 0.5);
      expect(light.opacity).toBeGreaterThanOrEqual(0);
      expect(light.opacity).toBeLessThanOrEqual(0.5);
      expect(next.rx).toBeGreaterThanOrEqual(light.rx);
      expect(next.ry).toBeGreaterThanOrEqual(light.ry);
      expect(next.rx - light.rx).toBeLessThan(0.6);
      expect(next.ry - light.ry).toBeLessThan(0.5);
    }
    expect(endingLightAt(256)).toEqual({ opacity: 0.5, rx: 38, ry: 26, y: 54 });
    expect(endingLightAt(274)).toEqual(endingLightAt(256));
  });

  test("softens only at the last lyric and gradually settles the pose clock", () => {
    expect(endingAt(237).backgroundBlur).toBe(0);
    expect(endingAt(237).poseTime).toBe(237);
    expect(endingAt(250).backgroundBlur).toBe(1.6);
    for (let t = 238; t < 284; t += 0.1) {
      const delta = endingAt(t + 0.1).poseTime - endingAt(t).poseTime;
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThan(0.1);
    }
    expect(endingAt(282).poseTime - endingAt(281).poseTime).toBeLessThan(0.03);
  });
});

import { describe, expect, test } from "vitest";
import { endingAt } from "./ending";
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

  test("distant light and sky only darken after the last lyric settles", () => {
    const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    for (let t = 248; t < 282; t += 0.5) {
      expect(envelope(t + 0.5, W.lightLeak)).toBeLessThanOrEqual(envelope(t, W.lightLeak));
      for (const part of ["top", "bottom"] as const) {
        const before = channels(skyAt(t)[part]);
        channels(skyAt(t + 0.5)[part]).forEach((v, i) => expect(v).toBeLessThanOrEqual(before[i]));
      }
    }
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

import { describe, expect, test } from "vitest";
import { envelope } from "./timeline";
import { CHARACTER_SCENES, LYRIC_COLUMN_LEFT } from "./characterScenes";

const ASPECT_16_9 = 1080 / 1920;

describe("CHARACTER_SCENES", () => {
  test("every window is strictly increasing", () => {
    for (const { id, window } of CHARACTER_SCENES) {
      for (let i = 1; i < 4; i++) expect(window[i], id).toBeGreaterThan(window[i - 1]);
    }
  });

  test("no figure reaches into the lyric columns", () => {
    for (const { id, x, h, aspect } of CHARACTER_SCENES) {
      const halfWidth = (h * aspect * ASPECT_16_9) / 2;
      expect(x + halfWidth, id).toBeLessThan(LYRIC_COLUMN_LEFT);
    }
  });

  // Two half-faded poses at the same spot read as a double exposure, so one leaves before the next arrives.
  test("scenes never overlap", () => {
    for (let t = 0; t < 284; t += 0.25) {
      const visible = CHARACTER_SCENES.filter((s) => envelope(t, s.window) > 0);
      expect(visible.length, `t=${t}`).toBeLessThanOrEqual(1);
    }
  });

  test("a figure is on screen through every sung section between intro and outro", () => {
    for (const t of [40, 80, 120, 150, 190, 215, 245]) {
      expect(Math.max(...CHARACTER_SCENES.map((s) => envelope(t, s.window))), `t=${t}`).toBe(1);
    }
  });
});

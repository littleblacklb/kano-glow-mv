import { describe, expect, test } from "vitest";
import { envelope } from "./timeline";
import { CHARACTER_SCENES, FEET_SINK, LYRIC_COLUMN_LEFT, kimiAt, placeScene, shadowMatrix } from "./characterScenes";

const ASPECT_16_9 = 1080 / 1920;

describe("placeScene", () => {
  // a slope steep enough that anchoring at the wrong x would show
  const ground = (x: number) => 900 - x * 0.05;

  test("the point she rests on lands on the ground under that point, not under her center", () => {
    for (const scene of CHARACTER_SCENES) {
      const { left, top, w, h } = placeScene(scene, 1920, 1080, ground);
      const [rx, ry] = scene.rest ?? [0.5, 1];
      expect(top + ry * h, scene.id).toBeCloseTo(ground(left + rx * w) + FEET_SINK);
    }
  });

  test("she breathes and sways around the point she rests on", () => {
    const sunset = CHARACTER_SCENES.find((s) => s.id === "sunset")!;
    const [rx, ry] = sunset.rest!;
    expect(placeScene(sunset, 1920, 1080, ground).origin).toBe(`${rx * 100}% ${ry * 100}%`);
  });
});

describe("shadowMatrix", () => {
  // [a, b, c, d] of a CSS matrix around the rest point: x' = a·x + c·y, y' = b·x + d·y
  const apply = ([a, b, c, d]: readonly number[], [x, y]: [number, number]) => [a * x + c * y, b * x + d * y];

  test("her head's shadow falls onto the ground in front of her, away from the light", () => {
    const [x, y] = apply(shadowMatrix({ skew: 45, length: 0.4, opacity: 0.3 }), [0, -100]);
    expect(y).toBeCloseTo(40); // below the rest point, squashed to 40%
    expect(x).toBeCloseTo(40); // leaning right, away from a light on the left
  });

  test("the point she rests on stays where it is", () => {
    expect(apply(shadowMatrix({ skew: 30, length: 0.3, opacity: 0.3 }), [0, 0])).toEqual([0, 0]);
  });
});

describe("CHARACTER_SCENES", () => {
  test("shadows lie on the ground: flattened, and never more than faint", () => {
    for (const { id, shadow } of CHARACTER_SCENES) {
      expect(shadow.length, id).toBeGreaterThan(0);
      expect(shadow.length, id).toBeLessThanOrEqual(0.6);
      expect(Math.abs(shadow.skew), id).toBeLessThan(75);
      expect(shadow.opacity, id).toBeLessThanOrEqual(0.45);
    }
  });

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

describe("kimiAt", () => {
  test("there is no 君 at night: no light, no shadow", () => {
    for (let t = 166; t <= 232; t += 0.5) expect(kimiAt(t).presence, `t=${t}`).toBe(0);
  });

  test("君 fades scene by scene while the sun is up", () => {
    expect(kimiAt(90).presence).toBe(1);
    expect(kimiAt(120).presence).toBeLessThan(1);
    expect(kimiAt(150).presence).toBeLessThan(kimiAt(120).presence);
  });

  test("君 returns blurred in the light through the clouds and gathers into her shadow", () => {
    expect(kimiAt(235).blur).toBeGreaterThan(0);
    let last = -1;
    for (let t = 236; t <= 250; t += 0.5) {
      expect(kimiAt(t).gather, `t=${t}`).toBeGreaterThanOrEqual(last);
      last = kimiAt(t).gather;
    }
    expect(kimiAt(248).gather).toBe(1);
    expect(kimiAt(252).presence).toBe(0);
  });
});

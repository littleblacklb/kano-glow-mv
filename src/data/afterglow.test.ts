import { describe, expect, test } from "vitest";
import { afterglowAt, starRevealAt } from "./afterglow";
import { skyAt } from "./timeline";

describe("extended fingertip twilight", () => {
  test("is absent before the approved dusk transition and after the hand", () => {
    for (const t of [0, 160, 172, 214.2, 226, 240, 284]) {
      expect(afterglowAt(t).handOpacity).toBe(0);
      expect(afterglowAt(t).skyOpacity).toBe(0);
    }
  });

  test("establishes the same dusk source before the hand instead of relighting night", () => {
    expect(afterglowAt(175).skyOpacity).toBeGreaterThan(0);
    expect(afterglowAt(181).skyOpacity).toBeCloseTo(0.85);
    expect(afterglowAt(201)).toEqual(afterglowAt(203.4));
    expect(afterglowAt(206).handOpacity).toBeGreaterThan(0.7);
  });

  test("recedes continuously while the hand is still visible", () => {
    for (let t = 204; t < 214.2; t += 0.1) {
      expect(afterglowAt(t + 0.1).handOpacity).toBeLessThanOrEqual(afterglowAt(t).handOpacity);
      expect(afterglowAt(t + 0.1).skyOpacity).toBeLessThanOrEqual(afterglowAt(t).skyOpacity);
      expect(afterglowAt(t).handOpacity / 0.88).toBeCloseTo(afterglowAt(t).skyOpacity / 0.85);
    }
    expect(afterglowAt(214.2).handOpacity).toBe(0);
  });

  test("limits early stars to a sparse faint subset, then reveals full night", () => {
    const early = Array.from({ length: 110 }, (_, i) => starRevealAt(201, i));
    expect(early.filter((v) => v > 0)).toHaveLength(13);
    expect(Math.max(...early)).toBeCloseTo(0.35);
    for (let i = 0; i < 110; i++) {
      expect(starRevealAt(210, i)).toBeGreaterThan(starRevealAt(204, i));
      expect(starRevealAt(216, i)).toBe(1);
    }
  });

  test("never brightens the base sky again during the hand entrance", () => {
    const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    for (const [a, b] of [[181, 201], [201, 206], [206, 214.2]]) {
      const before = channels(skyAt(a).bottom);
      const after = channels(skyAt(b).bottom);
      after.forEach((v, i) => expect(v).toBeLessThanOrEqual(before[i]));
    }
  });

  test("keeps the surrounding sky anchors unchanged", () => {
    expect(skyAt(172)).toEqual({ top: "rgba(58, 38, 70, 1)", bottom: "rgba(120, 56, 78, 1)" });
    expect(skyAt(226)).toEqual({ top: "rgba(26, 31, 60, 1)", bottom: "rgba(74, 40, 70, 1)" });
  });
});

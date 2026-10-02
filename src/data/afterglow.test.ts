import { describe, expect, test } from "vitest";
import { afterglowAt } from "./afterglow";
import { skyAt } from "./timeline";

describe("fingertip dusk light", () => {
  test("is absent outside the approved passage", () => {
    for (const t of [0, 180, 202.99, 226, 240, 284]) {
      expect(afterglowAt(t).opacity).toBe(0);
    }
  });

  test("arrives softly and stays restrained at the hand close-up", () => {
    expect(afterglowAt(203).opacity).toBe(0);
    expect(afterglowAt(204).opacity).toBeGreaterThan(0);
    expect(afterglowAt(206).opacity).toBeCloseTo(0.2);
    for (let t = 203; t <= 226; t += 0.1) {
      expect(afterglowAt(t).opacity).toBeLessThanOrEqual(0.2);
    }
  });

  test("drifts down and fades without looping or accumulating stains", () => {
    for (let t = 208.5; t < 226; t += 0.1) {
      expect(afterglowAt(t + 0.1).opacity).toBeLessThanOrEqual(afterglowAt(t).opacity);
      expect(afterglowAt(t + 0.1).y).toBeGreaterThanOrEqual(afterglowAt(t).y);
    }
    expect(afterglowAt(214.2).opacity).toBeGreaterThan(0);
    expect(afterglowAt(226).y).toBeCloseTo(0.53);
  });

  test("keeps the surrounding sky keyframes unchanged", () => {
    expect(skyAt(201)).toEqual({ top: "rgba(16, 21, 44, 1)", bottom: "rgba(42, 42, 82, 1)" });
    expect(skyAt(226)).toEqual({ top: "rgba(26, 31, 60, 1)", bottom: "rgba(74, 40, 70, 1)" });
  });
});

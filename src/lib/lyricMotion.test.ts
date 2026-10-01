import { describe, expect, test } from "vitest";
import { charMotion, displayDuration, MAX_HOLD_S } from "./lyricMotion";

describe("charMotion", () => {
  test("a character is invisible at the start of its line and fully shown once written in", () => {
    expect(charMotion({ lt: 0, dur: 6, index: 0, melt: false, seed: "a" }).opacity).toBe(0);
    const shown = charMotion({ lt: 2, dur: 6, index: 3, melt: false, seed: "a" });
    expect(shown).toMatchObject({ opacity: 1, dy: 0, blur: 0 });
  });

  test("later characters are written after earlier ones", () => {
    const first = charMotion({ lt: 0.3, dur: 6, index: 0, melt: false, seed: "a" });
    const later = charMotion({ lt: 0.3, dur: 6, index: 5, melt: false, seed: "a" });
    expect(first.opacity).toBeGreaterThan(later.opacity);
  });

  test("the line is gone by the end of its duration", () => {
    expect(charMotion({ lt: 6, dur: 6, index: 2, melt: false, seed: "a" }).opacity).toBe(0);
    expect(charMotion({ lt: 6, dur: 6, index: 2, melt: true, seed: "a" }).opacity).toBe(0);
  });

  test("melting lines drip downward and blur as they leave", () => {
    const m = charMotion({ lt: 5.8, dur: 6, index: 2, melt: true, seed: "a" });
    expect(m.dy).toBeGreaterThan(10);
    expect(m.blur).toBeGreaterThan(2);
  });
});

describe("displayDuration", () => {
  test("uses the gap to the next line, capped so lines don't linger through interludes", () => {
    expect(displayDuration(32.24, 37.457)).toBeCloseTo(5.217);
    expect(displayDuration(89.916, 105.17)).toBe(MAX_HOLD_S);
  });
});

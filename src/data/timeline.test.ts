import { describe, expect, test } from "vitest";
import { envelope, skyAt } from "./timeline";

// #C03437, the flat background of the 『one』 jacket
const COVER_RED_RGBA = "rgba(192, 52, 55, 1)";

describe("envelope", () => {
  test("is 0 before fade-in, 1 while held, 0 after fade-out", () => {
    expect(envelope(0, [10, 12, 20, 22])).toBe(0);
    expect(envelope(11, [10, 12, 20, 22])).toBe(0.5);
    expect(envelope(15, [10, 12, 20, 22])).toBe(1);
    expect(envelope(30, [10, 12, 20, 22])).toBe(0);
  });
});

describe("skyAt", () => {
  test("starts and ends on the cover red", () => {
    expect(skyAt(0).top).toBe(skyAt(283).top);
    expect(skyAt(0).top).toBe(COVER_RED_RGBA);
  });

  test("is dark indigo during the bridge (夜になるだけ)", () => {
    const [, r, g, b] = /rgba\((\d+), (\d+), (\d+)/.exec(skyAt(190).top)!.map(Number);
    expect(b).toBeGreaterThan(r);
    expect(r + g + b).toBeLessThan(150);
  });
});

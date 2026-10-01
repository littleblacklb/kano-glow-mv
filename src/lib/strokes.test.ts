import { describe, expect, test } from "vitest";
import { erasePolygons, revealPolygons, toClipPath } from "./strokes";

type Pt = [number, number];
const [W, H] = [150, 390];
const opts = { n: 7, seed: "test", boil: 3 };

// nonzero winding, like clip-path: path()
const inside = (polys: Pt[][], [x, y]: Pt) =>
  polys.some((poly) => {
    let wn = 0;
    for (let i = 0; i < poly.length; i++) {
      const [ax, ay] = poly[i];
      const [bx, by] = poly[(i + 1) % poly.length];
      const cross = (bx - ax) * (y - ay) - (x - ax) * (by - ay);
      if (ay <= y && by > y && cross > 0) wn++;
      else if (ay > y && by <= y && cross < 0) wn--;
    }
    return wn !== 0;
  });

const grid: Pt[] = [];
for (let x = 1; x < W; x += 7) for (let y = 1; y < H; y += 7) grid.push([x, y]);
const coverage = (polys: Pt[][]) => grid.filter((p) => inside(polys, p)).length / grid.length;

describe("revealPolygons", () => {
  test("nothing is drawn before the first stroke, all of her after the last", () => {
    expect(coverage(revealPolygons(0, W, H, opts))).toBe(0);
    expect(coverage(revealPolygons(1, W, H, opts))).toBe(1);
  });

  test("strokes only ever add", () => {
    let last = 0;
    for (let p = 0; p <= 1; p += 0.05) {
      const drawn = revealPolygons(p, W, H, opts);
      const c = coverage(drawn);
      expect(c, `p=${p}`).toBeGreaterThanOrEqual(last);
      last = c;
    }
  });

  test("one stroke at a time: halfway through, about half of her is back", () => {
    expect(coverage(revealPolygons(0.5, W, H, opts))).toBeCloseTo(0.5, 1);
  });
});

describe("erasePolygons", () => {
  test("she is whole before the first stroke and gone after the last", () => {
    expect(coverage(erasePolygons(0, W, H, opts))).toBe(1);
    expect(coverage(erasePolygons(1, W, H, opts))).toBe(0);
  });

  test("whatever the strokes haven't erased is still there", () => {
    for (const p of [0.1, 0.33, 0.5, 0.71, 0.9]) {
      const left = erasePolygons(p, W, H, opts);
      const swept = revealPolygons(p, W, H, opts);
      for (const pt of grid) expect(inside(left, pt) || inside(swept, pt), `p=${p} ${pt}`).toBe(true);
    }
  });
});

test("toClipPath hides everything when there are no strokes", () => {
  expect(toClipPath([])).toBe('path("M0,0Z")');
  expect(toClipPath(revealPolygons(1, W, H, opts))).toMatch(/^path\("M[\d.-]+,[\d.-]+L/);
});

import { noise2D } from "@remotion/noise";

// A figure erased or drawn back one stroke at a time: its box is cut into slanted bands with wobbly edges,
// and a round-tipped brush sweeps each band in turn, back and forth like a hand scribbling.
// Paths are in the element's own px (0..w, 0..h), for CSS clip-path: path().

type Pt = [number, number];

export type StrokeOpts = {
  n: number; // bands
  seed: string;
  boil: number; // drawing index: the band edges re-jitter a little each drawing
  angle?: number; // degrees, negative = rising to the right
};

const OVERLAP = 2; // px each band reaches into its neighbors, so no seam shows between them
const STEPS = 20; // points along each band edge

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const frame = (w: number, h: number, { n, seed, boil, angle = -14 }: StrokeOpts) => {
  const a = (angle * Math.PI) / 180;
  const [cu, su] = [Math.cos(a), Math.sin(a)];
  // band coordinates: u along the stroke, v across it
  const corners: Pt[] = [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ];
  const us = corners.map(([x, y]) => x * cu + y * su);
  const vs = corners.map(([x, y]) => -x * su + y * cu);
  const [vMin, vMax] = [Math.min(...vs), Math.max(...vs)];
  const thick = (vMax - vMin) / n;
  // the brush tip reaches thick/2 ahead of the sweep, so sweeps start and end that far outside the box
  const [u0, u1] = [Math.min(...us) - thick, Math.max(...us) + thick];
  const amp = thick * 0.14;
  // boundary k between bands k-1 and k; the outer two lie outside the box and stay straight
  const edge = (k: number, u: number) =>
    vMin +
    k * thick +
    (k === 0 || k === n
      ? (k === 0 ? -1 : 1) * OVERLAP
      : noise2D(`${seed}${k}`, u / (thick * 3), 0) * amp + noise2D(`${seed}b${k}`, u / thick, boil * 0.7) * amp * 0.3);
  const toXY = ([u, v]: Pt): Pt => [u * cu - v * su, u * su + v * cu];
  return { n, thick, u0, u1, edge, toXY };
};

type Frame = ReturnType<typeof frame>;

// Points of band i's top (forward) and bottom (backward) edges between u = from and u = to.
const edges = (f: Frame, i: number, from: number, to: number) => {
  const pts = (k: number, d: number) =>
    Array.from({ length: STEPS + 1 }, (_, s): Pt => {
      const u = from + ((to - from) * s) / STEPS;
      return [u, f.edge(k, u) + d];
    });
  return { top: pts(i, -OVERLAP), bottom: pts(i + 1, OVERLAP).reverse() };
};

// The round brush tip at u, from the top edge to the bottom edge of band i, bulging forward (dir = ±1).
const tip = (f: Frame, i: number, u: number, dir: number, fromTop: boolean) => {
  const [vt, vb] = [f.edge(i, u) - OVERLAP, f.edge(i + 1, u) + OVERLAP];
  const [mid, half] = [(vt + vb) / 2, (vb - vt) / 2];
  const pts = Array.from({ length: 9 }, (_, s): Pt => {
    const th = -Math.PI / 2 + (Math.PI * s) / 8;
    return [u + dir * Math.cos(th) * half, mid + Math.sin(th) * half];
  });
  return fromTop ? pts : pts.reverse();
};

// Band i, swept q (0–1) of its length: the swept part (drawn) or the rest (still there).
const bandPart = (f: Frame, i: number, q: number, swept: boolean): Pt[] => {
  // even bands sweep forward, odd ones back
  const dir = i % 2 === 0 ? 1 : -1;
  const [start, end] = dir === 1 ? [f.u0, f.u1] : [f.u1, f.u0];
  const at = start + (end - start) * q;
  if (swept) {
    const { top, bottom } = edges(f, i, start, at);
    return [...top, ...tip(f, i, at, dir, true), ...bottom];
  }
  const { top, bottom } = edges(f, i, at, end);
  return [...top, ...bottom, ...tip(f, i, at, dir, false)];
};

const area = (poly: Pt[]) =>
  poly.reduce((s, [x, y], i) => {
    const [nx, ny] = poly[(i + 1) % poly.length];
    return s + x * ny - nx * y;
  }, 0);

// All wound the same way, so overlaps add up under the nonzero rule instead of cancelling.
const oriented = (poly: Pt[]) => (area(poly) < 0 ? [...poly].reverse() : poly);

const polygons = (progress: number, w: number, h: number, opts: StrokeOpts, keep: "drawn" | "left") => {
  const f = frame(w, h, opts);
  const out: Pt[][] = [];
  for (let i = 0; i < f.n; i++) {
    const q = clamp01(progress * f.n - i);
    if (keep === "drawn" ? q === 0 : q === 1) continue;
    // an untouched band is left whole: the same as fully swept
    const band =
      keep === "drawn" || q === 0 ? bandPart(f, i, keep === "drawn" ? q : 1, true) : bandPart(f, i, q, false);
    out.push(oriented(band.map(f.toXY)));
  }
  return out;
};

// What has been drawn back after `progress` (0–1) of the strokes.
export const revealPolygons = (progress: number, w: number, h: number, opts: StrokeOpts) =>
  polygons(progress, w, h, opts, "drawn");

// What is left after `progress` (0–1) of the strokes have erased it.
export const erasePolygons = (progress: number, w: number, h: number, opts: StrokeOpts) =>
  polygons(progress, w, h, opts, "left");

export const toClipPath = (polys: Pt[][]) =>
  // an empty path() hides everything, which is what no strokes means
  `path("${polys.map((p) => `M${p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`).join("") || "M0,0Z"}")`;

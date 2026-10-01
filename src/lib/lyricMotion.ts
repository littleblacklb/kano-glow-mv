import { random } from "remotion";

// A line stays up until the next one starts, but never through a whole interlude.
export const MAX_HOLD_S = 10;
export const displayDuration = (startS: number, endS: number) => Math.min(endS - startS, MAX_HOLD_S);

const STAGGER_S = 0.07; // gap between characters being "written"
const MAX_STAGGER_S = 0.9;
const WRITE_S = 0.5;
const FADE_OUT_S = 0.6;
const MELT_LEAD_S = 1.4; // melting starts earlier and spreads out per character
const MELT_SPREAD_S = 0.5;
const MELT_S = 0.9;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Args = { lt: number; dur: number; index: number; melt: boolean; seed: string };

// Per-character motion for a lyric line. lt = seconds since the line started.
export const charMotion = ({ lt, dur, index, melt, seed }: Args) => {
  const write = clamp01((lt - Math.min(index * STAGGER_S, MAX_STAGGER_S)) / WRITE_S);
  const eased = 1 - (1 - write) ** 3;
  let opacity = eased;
  let dy = (eased - 1) * 14;
  let blur = (1 - eased) * 6;
  let stretch = 1;

  if (melt) {
    const r = random(`${seed}-${index}`);
    const e = clamp01((lt - (dur - MELT_LEAD_S) - r * MELT_SPREAD_S) / MELT_S);
    opacity *= 1 - e;
    dy += e * e * (28 + r * 50);
    blur += e * 9;
    stretch = 1 + e * 0.35;
  } else {
    // written as (lt - dur)/… + 1 so lt === dur lands on exactly 0
    opacity *= 1 - clamp01((lt - dur) / FADE_OUT_S + 1);
  }
  return { opacity, dy, blur, stretch };
};

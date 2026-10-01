import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, Easing, interpolate, random, useVideoConfig } from "remotion";
import { CREAM, envelope, W } from "../data/timeline";

const SCARS = 15;
const FIRST = 133.8;
const EVERY = 1.75;
const DRAW_S = 0.35;

// 私の体中 君の傷跡で: quick pen scratches accumulate across the left of the frame.
const scarPath = (i: number, width: number, height: number) => {
  const x = (0.04 + random(`kx${i}`) * 0.58) * width;
  const y = (0.12 + random(`ky${i}`) * 0.62) * height;
  const len = 120 + random(`kl${i}`) * 280;
  const a = (-35 + random(`ka${i}`) * 70) * (Math.PI / 180);
  const bend = (random(`kb${i}`) - 0.5) * len * 0.35;
  const ex = x + Math.cos(a) * len;
  const ey = y + Math.sin(a) * len;
  const mx = (x + ex) / 2 - Math.sin(a) * bend;
  const my = (y + ey) / 2 + Math.cos(a) * bend;
  return { d: `M${x},${y}Q${mx},${my} ${ex},${ey}`, dx: -Math.sin(a) * 7, dy: Math.cos(a) * 7 };
};

export const ScarLines: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.scars);
  if (vis === 0) return null;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={width} height={height}>
        {Array.from({ length: SCARS }, (_, i) => {
          const at = FIRST + i * EVERY;
          if (t < at) return null;
          const p = interpolate(t, [at, at + DRAW_S], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          const { d, dx, dy } = scarPath(i, width, height);
          const main = evolvePath(p, d);
          // The second, thinner stroke lags a little, like a pen going back over the cut.
          const echo = evolvePath(Math.max(0, p - 0.25) / 0.75, d);
          return (
            <g key={i} fill="none" stroke={CREAM} strokeLinecap="round">
              <path d={d} strokeWidth={4.5} strokeOpacity={0.9} {...main} />
              <path d={d} transform={`translate(${dx} ${dy})`} strokeWidth={1.8} strokeOpacity={0.6} {...echo} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

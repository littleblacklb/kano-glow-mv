import { AbsoluteFill, Easing, interpolate, random, useVideoConfig } from "remotion";
import { CREAM, envelope, W } from "../data/timeline";
import { afterglowAt, starRevealAt } from "../data/afterglow";
import { closeUpCover } from "../data/camera";
import { boilFrame, clamp01, onThrees, wobblyCircle } from "../lib/draw";

const RAIN_DROPS = 170;
const RAIN_SLANT = Math.tan((14 * Math.PI) / 180);

// 降り注いだ冷たい雨: slanted cream streaks, thinning out as dusk arrives.
export const Rain: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const intensity = envelope(t, W.rain);
  if (intensity === 0) return null;
  const tq = onThrees(t);
  const span = height * 1.3;

  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        {Array.from({ length: Math.round(RAIN_DROPS * intensity) }, (_, i) => {
          const speed = 1300 + random(`rs${i}`) * 900;
          const len = 36 + random(`rl${i}`) * 70;
          const y = ((tq * speed + random(`rp${i}`) * span) % span) - height * 0.15;
          const x = random(`rx${i}`) * width * 1.25 - y * RAIN_SLANT;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - len * RAIN_SLANT}
              y2={y + len}
              stroke={CREAM}
              strokeOpacity={0.16 + random(`ro${i}`) * 0.32}
              strokeWidth={1.4 + random(`rw${i}`) * 1.4}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// 青い傷を溶かしてった: watercolor blue blots that bloom where the rain lands.
const BLOTS = [
  { at: 37.5, x: 0.2, y: 0.34, r: 170 },
  { at: 39.2, x: 0.38, y: 0.58, r: 120 },
  { at: 41.0, x: 0.12, y: 0.66, r: 95 },
  { at: 43.4, x: 0.5, y: 0.28, r: 80 },
];

export const InkBleed: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.inkBleed);
  if (vis === 0) return null;
  const b = boilFrame(t);

  return (
    <AbsoluteFill style={{ opacity: vis, mixBlendMode: "screen" }}>
      <svg width={width} height={height}>
        <defs>
          <filter id="bleed" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={b % 3} />
            <feDisplacementMap in="SourceGraphic" scale={46} />
            <feGaussianBlur stdDeviation={5} />
          </filter>
        </defs>
        <g filter="url(#bleed)">
          {BLOTS.map((blot, i) => {
            const p = interpolate(t, [blot.at, blot.at + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            if (p === 0) return null;
            const cx = blot.x * width;
            const cy = blot.y * height;
            const r = blot.r * p;
            return (
              <g key={i}>
                <path d={wobblyCircle(cx, cy, r, `blot${i}`, 0, r * 0.18)} fill="#6F93C4" fillOpacity={0.42} />
                {/* pigment gathers at the drying edge */}
                <path
                  d={wobblyCircle(cx, cy, r, `blot${i}`, 0, r * 0.18)}
                  fill="none"
                  stroke="#9DB9E0"
                  strokeOpacity={0.55}
                  strokeWidth={6}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const STARS = 110;

// 夜になるだけ: a still night; stars twinkle a little harder when the guitar swells.
export const Stars: React.FC<{ t: number; amp: number }> = ({ t, amp }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.stars);
  if (vis === 0) return null;
  const tq = onThrees(t);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={width} height={height}>
        {Array.from({ length: STARS }, (_, i) => {
          const x = random(`sx${i}`) * width;
          const y = random(`sy${i}`) ** 1.4 * height * 0.72;
          // keep the lyric columns clear
          if (x > width * 0.74 && y > height * 0.08) return null;
          const tw = Math.abs(Math.sin(tq * (0.6 + random(`ss${i}`) * 1.6) + random(`sp${i}`) * 6.28));
          const big = i % 14 === 0;
          // Sparse points while the lower sky still holds dusk; no glittering full night yet.
          const reveal = starRevealAt(t, i);
          const o = clamp01(0.25 + tw * 0.6 + amp * 0.35) * reveal;
          if (big) {
            const s = 9 + tw * 5;
            return (
              <path
                key={i}
                d={`M${x},${y - s}Q${x},${y} ${x + s},${y}Q${x},${y} ${x},${y + s}Q${x},${y} ${x - s},${y}Q${x},${y} ${x},${y - s}Z`}
                fill={CREAM}
                opacity={o}
              />
            );
          }
          return <circle key={i} cx={x} cy={y} r={1.2 + random(`sr${i}`) * 2.2} fill={CREAM} opacity={o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// The last dusk light slips away: broad, translucent, with no drop or stain edges.
export const Afterglow: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const light = afterglowAt(t);
  const opacity = light.opacity * closeUpCover(t);
  if (opacity === 0) return null;

  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen", pointerEvents: "none" }}>
      <svg width={width} height={height}>
        <defs>
          <radialGradient id="dusk-afterglow">
            <stop offset="0" stopColor="#F07860" stopOpacity={0.95} />
            <stop offset="0.45" stopColor="#D96F67" stopOpacity={0.55} />
            <stop offset="1" stopColor="#D96F67" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={width * 0.36} cy={height * light.y} rx={width * 0.43} ry={height * 0.17} fill="url(#dusk-afterglow)" />
      </svg>
    </AbsoluteFill>
  );
};

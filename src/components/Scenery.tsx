import { noise2D } from "@remotion/noise";
import { AbsoluteFill, Easing, interpolate, random, useVideoConfig } from "remotion";
import { CREAM, envelope, INK, skyAt, W } from "../data/timeline";
import { boilFrame, mix, onThrees, wobblyCircle, wobblyLine } from "../lib/draw";

const HORIZON_Y = 0.84;

// 夕暮れ: the sun sinks from mid-sky behind the ground line; its halo breathes with the music.
export const Sun: React.FC<{ t: number; amp: number }> = ({ t, amp }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.sun);
  if (vis === 0) return null;
  const cx = width * 0.3;
  const cy = height * interpolate(t, [70, 105, 178], [0.52, 0.62, 0.98], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const halo = 1150 + amp * 260;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div
        style={{
          position: "absolute",
          left: cx - halo / 2,
          top: cy - halo / 2,
          width: halo,
          height: halo,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,232,186,0.62) 0%, rgba(255,176,120,0.28) 26%, rgba(255,140,100,0.08) 48%, transparent 66%)",
        }}
      />
      <svg width={width} height={height}>
        <path d={wobblyCircle(cx, cy, 128, "sun", boilFrame(t), 2.5)} fill="#FFE8C0" stroke={CREAM} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

// Height of the rolling ground line at x, before the per-drawing jitter.
export const groundY = (x: number, height: number) => height * HORIZON_Y + noise2D("hills", x * 0.0016, 0) * 34;

export const groundPoints = (width: number, height: number): [number, number][] =>
  Array.from({ length: 52 }, (_, i) => {
    const x = -20 + (i / 51) * (width + 40);
    return [x, groundY(x, height)];
  });

// Ground line with two utility poles: the corner of an evening sky (夕暮れ空のすみっこ).
export const Horizon: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.horizon);
  if (vis === 0) return null;
  const b = boilFrame(t);
  const ground = mix(skyAt(t).bottom, INK, 0.62);
  const pts = groundPoints(width, height);
  const line = wobblyLine(pts, "ground", b, 1.4);
  const pole = (x: number, top: number, w: number, k: string) => {
    const baseY = height * HORIZON_Y + 10;
    return (
      <g key={k} fill={ground}>
        <rect x={x - w / 2} y={top} width={w} height={baseY - top} />
        <rect x={x - w * 5} y={top + w * 2} width={w * 10} height={w * 0.9} />
        <rect x={x - w * 3.6} y={top + w * 5} width={w * 7.2} height={w * 0.8} />
      </g>
    );
  };
  const p1 = { x: width * 0.13, y: height * 0.3, w: 16 };
  const p2 = { x: width * 0.52, y: height * 0.55, w: 8 };
  const wires = [0, 1].map((k) => {
    const ay = p1.y + p1.w * 2 + k * p1.w * 3;
    const by = p2.y + p2.w * 2 + k * p2.w * 3;
    return (
      <g key={k} fill="none" stroke={ground} strokeWidth={2.4}>
        <path d={`M${p1.x - p1.w * 4.6},${ay}Q${(p1.x + p2.x) / 2},${(ay + by) / 2 + 70} ${p2.x + p2.w * 4.4},${by}`} />
        <path d={`M${p1.x - p1.w * 4.6},${ay}Q${p1.x * 0.5},${ay + 60} -40,${ay + 20}`} />
      </g>
    );
  });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={width} height={height}>
        {wires}
        {pole(p1.x, p1.y, p1.w, "p1")}
        {pole(p2.x, p2.y, p2.w, "p2")}
        <path d={`${line}L${width + 20},${height + 20}L-20,${height + 20}Z`} fill={ground} />
        <path d={line} fill="none" stroke={CREAM} strokeOpacity={0.75} strokeWidth={3} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

type Puff = [number, number, number]; // dx, dy, r

// Line-art cloud: ink-stroked circles underneath, fill on top, so only the outer outline remains.
const Cloud: React.FC<{ x: number; y: number; puffs: Puff[]; fill: string; stroke: string; seed: string; b: number }> = ({
  x,
  y,
  puffs,
  fill,
  stroke,
  seed,
  b,
}) => (
  <g>
    {puffs.map(([dx, dy, r], i) => (
      <path key={`s${i}`} d={wobblyCircle(x + dx, y + dy, r, `${seed}${i}`, b, 2)} fill={stroke} stroke={stroke} strokeWidth={7} />
    ))}
    {puffs.map(([dx, dy, r], i) => (
      <path key={`f${i}`} d={wobblyCircle(x + dx, y + dy, r, `${seed}${i}`, b, 2)} fill={fill} />
    ))}
  </g>
);

const PUFFS: Puff[] = [
  [0, 0, 62],
  [70, -28, 78],
  [150, -6, 66],
  [210, 14, 48],
  [-62, 18, 46],
  [96, 26, 58],
];

// [x, y] start positions as fractions of the frame, spaced so clouds never overlap.
const CLOUD_LANES: [number, number][] = [
  [-0.08, 0.3],
  [0.3, 0.12],
  [0.62, 0.36],
];

// Interlude after the first chorus: slow cream clouds crossing the red sky.
export const Clouds: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.clouds);
  if (vis === 0) return null;
  const tq = onThrees(t);
  const b = boilFrame(t);
  const fill = mix(CREAM, skyAt(t).top, 0.18);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={width} height={height}>
        {CLOUD_LANES.map(([lx, ly], i) => {
          const x = lx * width + (tq - 100) * (16 + i * 5);
          const y = ly * height;
          return <Cloud key={i} x={x} y={y} puffs={PUFFS} fill={fill} stroke={INK} seed={`c${i}`} b={b} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const BANK: Puff[] = Array.from({ length: 16 }, (_, i) => [
  i * 70 - 40,
  Math.sin(i * 1.7) * 28,
  70 + ((i * 37) % 50),
]);

// ちぎれてく雲間から: a cloud bank tears apart down the middle and light pours through.
export const TornClouds: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.tornClouds);
  if (vis === 0) return null;
  const b = boilFrame(t);
  const split = interpolate(onThrees(t), [228, 250], [0, width * 0.36], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const lit = interpolate(t, [222, 250], [0.12, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fill = mix(skyAt(t).top, CREAM, lit);
  const y = height * 0.4;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={width} height={height}>
        <g transform={`translate(${-split} ${-split * 0.08})`}>
          <Cloud x={-60} y={y} puffs={BANK} fill={fill} stroke={CREAM} seed="tl" b={b} />
        </g>
        {/* the right piece is narrow and only rises, so it never crosses the lyric columns */}
        <g transform={`translate(${split * 0.05} ${-split * 0.55})`} opacity={1 - (split / width) * 1.6}>
          <Cloud x={width * 0.5 + 40} y={y + 18} puffs={BANK.slice(0, 6)} fill={fill} stroke={CREAM} seed="tr" b={b} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const MOTES = 70;

// Warm light from the gap, with slow rays and motes drifting upward (溢れ出す涙).
export const LightLeak: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.lightLeak);
  if (vis === 0) return null;
  const tq = onThrees(t);
  const cx = width / 2;
  const cy = height * 0.42;
  const size = interpolate(t, [228, 252], [500, 2300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div
        style={{
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          mixBlendMode: "screen",
          background: "radial-gradient(circle, rgba(255,236,200,0.9) 0%, rgba(255,210,160,0.4) 22%, transparent 60%)",
        }}
      />
      <svg width={width} height={height} style={{ mixBlendMode: "screen" }}>
        <g transform={`rotate(${tq * 1.6} ${cx} ${cy})`}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const spread = 0.05;
            const L = width * 1.2;
            return (
              <path
                key={i}
                d={`M${cx},${cy}L${cx + Math.cos(a - spread) * L},${cy + Math.sin(a - spread) * L}L${cx + Math.cos(a + spread) * L},${cy + Math.sin(a + spread) * L}Z`}
                fill="#FFE6C4"
                opacity={0.07}
              />
            );
          })}
        </g>
        {Array.from({ length: MOTES }, (_, i) => {
          const period = 8 + random(`mp${i}`) * 7;
          const phase = random(`mo${i}`) * period;
          const p = ((tq + phase) % period) / period;
          const x = random(`mx${i}`) * width + Math.sin((tq + phase) * 0.9) * 18;
          const y = height * 1.05 - p * height * 1.15;
          return <circle key={i} cx={x} cy={y} r={1.6 + random(`mr${i}`) * 2.6} fill={CREAM} opacity={0.7 * Math.sin(p * Math.PI)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";
import { CREAM, envelope, W } from "../data/timeline";
import { JP_FONT, ZH_FONT } from "../lib/fonts";

const fadeUp = (t: number, at: number, dur = 0.9) =>
  interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

// Sits where the jacket has "one / 鹿乃", so the intro reads as the cover coming alive.
export const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, W.title);
  if (vis === 0) return null;
  const write = interpolate(t, [14.5, 16.0], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ opacity: vis, fontFamily: JP_FONT, color: CREAM }}>
      <div style={{ position: "absolute", left: width * 0.17, top: height * 0.27 }}>
        {/* left-to-right wipe stands in for the pen writing the word */}
        <div style={{ fontSize: 176, fontWeight: 600, lineHeight: 1, clipPath: `inset(-20% ${write}% -20% -5%)` }}>glow</div>
        <div
          style={{
            marginTop: 46,
            marginLeft: 150,
            fontSize: 72,
            letterSpacing: "0.3em",
            opacity: fadeUp(t, 15.6),
            translate: `0 ${(1 - fadeUp(t, 15.6)) * 14}px`,
          }}
        >
          鹿乃
        </div>
        <div style={{ marginTop: 64, fontSize: 26, lineHeight: 1.9, letterSpacing: "0.12em", opacity: 0.82 * fadeUp(t, 16.4, 1.4) }}>
          <div>原曲 keeno</div>
          <div>from『one』</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CREDITS: [string, string][] = [
  ["原曲", "glow ／ keeno"],
  ["歌", "鹿乃 —『one』ばんび～の (2017)"],
  ["插画", "『one』jacket"],
  ["MV", "fan-made · 非商用"],
];

export const Credits: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const vis = envelope(t, [262, 264, 274, 277]);
  if (vis === 0) return null;

  return (
    <AbsoluteFill style={{ opacity: vis, color: CREAM }}>
      <div style={{ position: "absolute", left: width * 0.14, top: height * 0.3 }}>
        <div style={{ fontFamily: JP_FONT, fontSize: 108, fontWeight: 600, opacity: fadeUp(t, 262.4, 1.4) }}>glow</div>
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "auto auto", columnGap: 36, rowGap: 16 }}>
          {CREDITS.map(([k, v], i) => {
            const o = fadeUp(t, 263.4 + i * 0.5);
            return [
              <div key={`k${i}`} style={{ fontFamily: ZH_FONT, fontSize: 24, opacity: 0.7 * o, letterSpacing: "0.2em" }}>
                {k}
              </div>,
              <div key={`v${i}`} style={{ fontFamily: JP_FONT, fontSize: 28, opacity: o, translate: `${(1 - o) * 12}px 0` }}>
                {v}
              </div>,
            ];
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

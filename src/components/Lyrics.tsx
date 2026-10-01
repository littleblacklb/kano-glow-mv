import { Fragment } from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { CREAM, DISTANT_RANGE, MELT_RANGES } from "../data/timeline";
import { ZH } from "../data/zh";
import { JP_FONT, ZH_FONT } from "../lib/fonts";
import { charMotion, displayDuration } from "../lib/lyricMotion";
import type { LyricLine } from "../lib/parseLrc";
import { phrases } from "../data/lyricLayout";

const inRange = (s: number, [a, b]: [number, number]) => s >= a && s < b;

const Line: React.FC<{ line: LyricLine; dur: number }> = ({ line, dur }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lt = frame / fps;
  const startS = line.startMs / 1000;
  const melt = MELT_RANGES.some((r) => inRange(startS, r));
  const distant = inRange(startS, DISTANT_RANGE);
  const zh = ZH[line.text] ?? "";
  let index = 0;

  // The translation enters a beat after the Japanese and leaves the same way it does.
  const zhMotion = charMotion({ lt: lt - 0.45, dur: dur - 0.45, index: 0, melt, seed: "zh" });

  return (
    <div
      style={{
        position: "absolute",
        right: width * 0.085,
        top: height * 0.11,
        height: height * 0.76,
        writingMode: "vertical-rl",
        color: CREAM,
        textShadow: "0 0 18px rgba(20,10,16,0.28)",
        transformOrigin: "100% 0%",
        scale: distant ? "0.86" : "1",
        opacity: distant ? 0.72 : 1,
      }}
    >
      <div style={{ fontFamily: JP_FONT, fontSize: 56, lineHeight: 1.6, letterSpacing: "0.14em" }}>
        {/* each phrase becomes its own vertical column */}
        {phrases(line.text).map((p, pi) => (
          <Fragment key={pi}>
            {pi > 0 && <br />}
            {[...p].map((ch) => {
              const m = charMotion({ lt, dur, index: index++, melt, seed: line.text });
              return (
                <span
                  key={index}
                  style={{
                    display: "inline-block",
                    opacity: m.opacity,
                    translate: `0 ${m.dy}px`,
                    scale: `1 ${m.stretch}`,
                    filter: m.blur > 0.05 ? `blur(${m.blur}px)` : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      {zh && (
        <div
          style={{
            fontFamily: ZH_FONT,
            fontSize: 30,
            lineHeight: 1.5,
            letterSpacing: "0.22em",
            marginBlockStart: 34,
            opacity: 0.78 * zhMotion.opacity,
            filter: zhMotion.blur > 0.05 ? `blur(${zhMotion.blur}px)` : undefined,
          }}
        >
          {phrases(zh).map((p, pi) => (
            <Fragment key={pi}>
              {pi > 0 && <br />}
              {p}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

// A faint shade along the right edge keeps cream lyrics legible over bright sky and clouds.
const Scrim: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to left, rgba(16,10,18,0.22) 0%, rgba(16,10,18,0.12) 22%, transparent 42%)",
    }}
  />
);

export const Lyrics: React.FC<{ lines: LyricLine[]; scrim: number }> = ({ lines, scrim }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: scrim }}>
        <Scrim />
      </div>
      {lines
        .filter((l) => l.kind === "lyric")
        .map((line) => {
          const dur = displayDuration(line.startMs / 1000, line.endMs / 1000);
          return (
            <Sequence
              key={line.startMs}
              name={line.text}
              from={Math.round((line.startMs / 1000) * fps)}
              durationInFrames={Math.round(dur * fps)}
            >
              <Line line={line} dur={dur} />
            </Sequence>
          );
        })}
    </>
  );
};

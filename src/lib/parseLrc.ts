export type LyricLine = {
  startMs: number;
  endMs: number;
  text: string;
  // "meta" = credits, the 「title」 card and 終わり; not sung.
  kind: "lyric" | "meta";
};

const LAST_LINE_MS = 5000;
const TIMESTAMP = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/;
const CREDIT = /^(作词|作曲|編曲|编曲|唄|歌)\s*[:：∶]/;

type Cue = { startMs: number; text: string; fromJson: boolean };

// NetEase exports prepend credit lines as {"t":ms,"c":[{"tx":"..."}]}.
const parseJsonLine = (raw: string): Cue | null => {
  try {
    const obj = JSON.parse(raw) as { t: number; c: { tx: string }[] };
    return { startMs: obj.t, text: obj.c.map((c) => c.tx).join(""), fromJson: true };
  } catch {
    return null;
  }
};

const parseLine = (raw: string): Cue | null => {
  if (raw.startsWith("{")) return parseJsonLine(raw);
  const m = TIMESTAMP.exec(raw);
  if (!m) return null;
  const startMs = Math.round((Number(m[1]) * 60 + Number(m[2])) * 1000);
  return { startMs, text: m[3].trim(), fromJson: false };
};

const isMeta = (cue: Cue) =>
  cue.fromJson || CREDIT.test(cue.text) || /^「.*」$/.test(cue.text) || cue.text === "終わり";

export const parseLrc = (src: string): LyricLine[] => {
  const cues = src
    .split(/\r?\n/)
    .map((l) => parseLine(l.trim()))
    .filter((c): c is Cue => c !== null);

  return cues.flatMap((cue, i) => {
    if (cue.text === "") return [];
    const next = cues[i + 1];
    return [
      {
        startMs: cue.startMs,
        endMs: next ? next.startMs : cue.startMs + LAST_LINE_MS,
        text: cue.text,
        kind: isMeta(cue) ? "meta" : "lyric",
      } satisfies LyricLine,
    ];
  });
};

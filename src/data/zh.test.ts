import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { parseLrc } from "../lib/parseLrc";
import { ZH } from "./zh";

test("every sung LRC line has a Chinese translation", () => {
  const lrc = readFileSync(new URL("../../public/glow.lrc", import.meta.url), "utf8");
  const missing = parseLrc(lrc)
    .filter((l) => l.kind === "lyric" && !ZH[l.text])
    .map((l) => l.text);
  expect(missing).toEqual([]);
});

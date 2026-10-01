import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { ZH } from "../data/zh";
import { displayText } from "../data/lyricLayout";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("the subset fonts contain every character the lyrics and translation use", () => {
  const glyphs = new Set(read("../../public/fonts/glyphs.txt"));
  const used = read("../../public/glow.lrc").replace(/\[[^\]]*\]|\{.*\}/g, "") + Object.values(ZH).join("");
  const missing = [...new Set(displayText(used))].filter((c) => !/\s/.test(c) && !glyphs.has(c));
  expect(missing).toEqual([]);
});

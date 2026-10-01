// Downloads Klee One / ZCOOL XiaoWei subset to only the glyphs the MV uses.
// Re-run (`npm run fonts`) after editing the LRC, zh.ts or on-screen credits.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

// Every string that can appear on screen; Titles.tsx text lives in EXTRA.
const EXTRA =
  "glowkeenofrom『』原曲歌插画MV鹿乃ばんび～の()2017—／・fan-madejacket非商用" +
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ？?!！、。…";
const text = [...new Set(read("public/glow.lrc") + read("src/data/zh.ts") + EXTRA)]
  .filter((c) => !/[\s{}"\[\]:;,=<>\\]/.test(c) || c === " ")
  .join("");
writeFileSync(new URL("public/fonts/glyphs.txt", root), text);

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const FONTS = [
  { family: "Klee One", weights: ["400", "600"], file: "klee-one" },
  { family: "ZCOOL XiaoWei", weights: ["400"], file: "zcool-xiaowei" },
];

for (const f of FONTS) {
  for (const w of f.weights) {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family)}:wght@${w}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
    const src = /url\((https:[^)]+)\)/.exec(css)?.[1];
    if (!src) throw new Error(`No font URL for ${f.family} ${w}:\n${css}`);
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    writeFileSync(new URL(`public/fonts/${f.file}-${w}.woff2`, root), buf);
    console.log(`${f.family} ${w}: ${buf.length} bytes`);
  }
}
console.log(`${text.length} glyphs`);

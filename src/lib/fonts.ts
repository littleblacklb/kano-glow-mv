import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Local glyph subsets from scripts/subset-fonts.mjs (`npm run fonts`), so renders
// make no network requests. Klee One: pen-written kana, close to the jacket lettering.
export const JP_FONT = "Klee One";
export const ZH_FONT = "ZCOOL XiaoWei";

loadFont({ family: JP_FONT, url: staticFile("fonts/klee-one-400.woff2"), weight: "400" });
loadFont({ family: JP_FONT, url: staticFile("fonts/klee-one-600.woff2"), weight: "600" });
loadFont({ family: ZH_FONT, url: staticFile("fonts/zcool-xiaowei-400.woff2"), weight: "400" });

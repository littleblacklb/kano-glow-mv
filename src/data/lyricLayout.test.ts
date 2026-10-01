import { expect, test } from "vitest";
import { displayText, phrases } from "./lyricLayout";

test("long lines break at the natural pause instead of wherever the column fills", () => {
  expect(phrases("少しずつ滲む君にぎゅっとしがみついた")).toEqual(["少しずつ滲む君に", "ぎゅっとしがみついた"]);
});

test("existing spaces stay phrase breaks and ? becomes full-width for vertical text", () => {
  expect(phrases("どうして こんなにきつく抱きしめてるの?")).toEqual(["どうして", "こんなにきつく", "抱きしめてるの？"]);
});

test("lines without an override are split only on spaces", () => {
  expect(phrases("降り注いだ冷たい雨")).toEqual(["降り注いだ冷たい雨"]);
});

test("displayText applies the same substitutions", () => {
  expect(displayText("の?")).toBe("の？");
});

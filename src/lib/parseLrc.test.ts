import { describe, expect, test } from "vitest";
import { parseLrc } from "./parseLrc";

describe("parseLrc", () => {
  test("converts [mm:ss.xxx] timestamps to milliseconds", () => {
    const [line] = parseLrc("[01:18.660]夕暮れの涙が出そうな赤\n[01:29.916]次");
    expect(line.startMs).toBe(78660);
    expect(line.text).toBe("夕暮れの涙が出そうな赤");
  });

  test("ends each line where the next timestamp begins", () => {
    const lines = parseLrc("[00:32.240]降り注いだ冷たい雨\n[00:37.457]青い傷を溶かしてった");
    expect(lines[0].endMs).toBe(37457);
  });

  test("drops empty lines but uses them as end boundaries", () => {
    const lines = parseLrc("[01:29.916]私の中の君を溶かしてしまえ\n[01:45.170]\n[02:13.582]私の体中");
    expect(lines.map((l) => l.text)).toEqual(["私の中の君を溶かしてしまえ", "私の体中"]);
    expect(lines[0].endMs).toBe(105170);
  });

  test("gives the final line a default 5s duration", () => {
    const [line] = parseLrc("[04:16.632]終わり");
    expect(line.endMs).toBe(256632 + 5000);
  });

  test("reads NetEase JSON header lines as meta", () => {
    const [line] = parseLrc('{"t":1000,"c":[{"tx":"作曲: "},{"tx":"keeno"}]}\n[00:14.498]「glow」');
    expect(line).toMatchObject({ startMs: 1000, endMs: 14498, text: "作曲: keeno", kind: "meta" });
  });

  test("marks credits, the 「title」 and 終わり as meta, sung lines as lyric", () => {
    const lines = parseLrc(
      "[00:14.498]「glow」\n[00:15.221]編曲∶kano\n[00:15.593]唄∶kano\n[00:32.240]降り注いだ冷たい雨\n[04:16.632]終わり",
    );
    expect(lines.map((l) => l.kind)).toEqual(["meta", "meta", "meta", "lyric", "meta"]);
  });

  test("ignores lines without a timestamp", () => {
    expect(parseLrc("garbage\n\n[00:01.000]a")).toHaveLength(1);
  });
});

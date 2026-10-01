// A vertical column fits ~13 characters. Longer phrases get a hand-placed break ("|")
// at the sung pause, so the column never wraps mid-word (e.g. ぎゅっ|と).
const BREAKS: Record<string, string> = {
  すみっこで笑う誰かがいた: "すみっこで笑う|誰かがいた",
  気付かないうちにオトナになって: "気付かないうちに|オトナになって",
  いろんな痛みを覚えてきたけど: "いろんな痛みを|覚えてきたけど",
  夕暮れの涙が出そうな赤: "夕暮れの涙が|出そうな赤",
  私の中の君を溶かしてしまえ: "私の中の君を|溶かしてしまえ",
  "どうして こんなにきつく抱きしめてるの?": "どうして こんなにきつく|抱きしめてるの?",
  "きっと このまま君を溶かして夜になるだけ": "きっと このまま君を溶かして|夜になるだけ",
  私の中の君を奪ってしまう: "私の中の君を|奪ってしまう",
  少しずつ滲む君にぎゅっとしがみついた: "少しずつ滲む君に|ぎゅっとしがみついた",
};

// Half-width ? lies sideways in vertical text.
export const displayText = (text: string) => text.replace(/\?/g, "？");

export const phrases = (text: string) =>
  displayText(BREAKS[text] ?? text)
    .split(/[ \u3000|]+/)
    .filter(Boolean);

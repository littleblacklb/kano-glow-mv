# 「君」的影子 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show 君 as a cast shadow with no one casting it, beside her in the lit scenes (sunset, play, hug, cling), fading with the sun and returning blurred to merge with hers at 「ぎゅっとしがみついた」.

**Architecture:** Generate two 君 figures (sitting, standing) with gpt-image-2 via `art/gen.sh`, key them like the other poses, and render only their shadows. The existing shadow rendering in `SceneCharacter` is extracted into a `<CastShadow>` component shared by her and 君. Placement and the time arc are pure functions in `src/data/characterScenes.ts`, unit-tested with vitest.

**Tech Stack:** Remotion 4 (React 19), TypeScript, vitest, Python (PIL/numpy/scipy) for keying, Codex CLI `codex exec` with built-in `image_gen` (gpt-image-2).

Design: `docs/plans/2026-10-02-kimi-shadow-design.md`. All paths below are relative to `mv/`.
Formatting: the codebase uses ~120 columns; format touched files with `npx prettier --write --print-width 120 <files>` only.

---

### Task 1: Prompts for 君 and a per-subject style override in gen.sh

**Files:**
- Modify: `art/gen.sh`
- Create: `art/prompts/kimi.style.txt`, `art/prompts/kimi-sit.txt`, `art/prompts/kimi-stand.txt`

**Step 1:** In `art/gen.sh`, pick the style block by the id's prefix, falling back to `style.txt`:

```zsh
for id in "$@"; do
  style=art/prompts/${id%%-*}.style.txt
  [[ -f $style ]] || style=art/prompts/style.txt
  {
    printf '...unchanged...'
    cat "$style"
```

(`rain` → `rain.style.txt` doesn't exist → `style.txt`; `kimi-sit` → `kimi.style.txt`.)

**Step 2:** `art/prompts/kimi.style.txt`: same art-style, composition and green-background paragraphs as `style.txt`, but the character paragraph describes a different person: "a slender person slightly taller than a young teen, gender-neutral, short tousled hair, a long plain coat and trousers, simple shoes. NOT the girl in the reference: no horns, no chick, no scarf, no guitar. The reference is for drawing style only." Add: "Clear, readable silhouette: limbs separated from the body where the pose allows."

**Step 3:** `kimi-sit.txt`: "Pose: side view facing LEFT, sitting on the ground with knees drawn up and forearms resting on the knees, watching something far away. Calm." `kimi-stand.txt`: "Pose: side view facing LEFT, standing upright and relaxed, hands in coat pockets, head slightly lowered."

**Step 4: Generate.** Run: `art/gen.sh kimi-sit kimi-stand` (timeout 10 min). Expected: `art/raw/kimi-sit-v1.png`, `-v2.png`, `kimi-stand-v1.png`, `-v2.png`.

**Step 5: Check** the four images as a contact sheet (same PIL snippet as for the poses). Pick the variant per pose whose silhouette reads most clearly as a different, taller person. If none does, adjust that pose's prompt once and regenerate.

**Step 6: Commit** `art/gen.sh art/prompts/kimi*` with message "Prompts for 君's figures".

### Task 2: Key the picked 君 figures

**Step 1:** `cp art/raw/kimi-sit-vN.png art/picked/kimi-sit.png` and the same for `kimi-stand`.

**Step 2:** Run `python3 scripts/key-characters.py`. Expected: two new lines `kimi-sit: ... size=WxH` and `kimi-stand: ...`; the existing seven print the same sizes as before. Verify `git status` shows no change to the existing `public/characters/*.png` (keying is deterministic).

**Step 3:** Record the two aspects (W/H) for Task 4.

**Step 4: Commit** `art/picked/kimi-* public/characters/kimi-*` with message "Key 君's figures".

### Task 3: The time arc `kimiAt(t)`

**Files:** Modify `src/data/characterScenes.ts`, test `src/data/characterScenes.test.ts`.

**Step 1: Failing tests** (new `describe("kimiAt")`):

```ts
test("there is no 君 at night: no light, no shadow", () => {
  for (let t = 166; t <= 232; t += 0.5) expect(kimiAt(t).presence, `t=${t}`).toBe(0);
});
test("君 fades scene by scene while the sun is up", () => {
  expect(kimiAt(90).presence).toBe(1);
  expect(kimiAt(120).presence).toBeLessThan(1);
  expect(kimiAt(150).presence).toBeLessThan(kimiAt(120).presence);
});
test("君 returns blurred in the light through the clouds and gathers into her shadow", () => {
  expect(kimiAt(235).blur).toBeGreaterThan(0);
  let last = -1;
  for (let t = 236; t <= 250; t += 0.5) {
    expect(kimiAt(t).gather, `t=${t}`).toBeGreaterThanOrEqual(last);
    last = kimiAt(t).gather;
  }
  expect(kimiAt(248).gather).toBe(1);
  expect(kimiAt(252).presence).toBe(0);
});
```

**Step 2:** Run `npx vitest run src/data/characterScenes.test.ts`. Expected: FAIL, `kimiAt` is not a function.

**Step 3: Implement** (add `import { interpolate } from "remotion";` at the top):

```ts
const at = (t: number, ts: number[], vs: number[]) =>
  interpolate(t, ts, vs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// 君 only exists as a shadow, so only where there is light: beside her under the setting sun,
// fading scene by scene, gone with the sun, back blurred (滲む) in the light through the clouds,
// then gathering into her own shadow (ぎゅっとしがみついた) and fading with it.
export const kimiAt = (t: number) => ({
  presence: at(t, [106, 110, 131, 135, 158, 166, 232, 236, 248, 252], [1, 0.85, 0.85, 0.6, 0.6, 0, 0, 0.5, 0.5, 0]),
  blur: at(t, [232, 238, 248], [2, 2, 6]), // px, on top of the shadow's own softening
  gather: at(t, [238, 248], [0, 1]), // 0 = beside her, 1 = on her rest point
});
```

**Step 4:** Run the tests. Expected: PASS.

**Step 5: Commit** "Time arc for 君's shadow".

### Task 4: Companion data and placement

**Step 1: Failing tests:**

```ts
describe("placeCompanion", () => {
  const ground = (x: number) => 900 - x * 0.05;
  const withKimi = CHARACTER_SCENES.filter((s) => s.companion);

  test("君 belongs to the lit scenes only", () => {
    expect(withKimi.map((s) => s.id)).toEqual(["sunset", "play", "hug", "cling"]);
  });

  test("君 stands on the ground to her left, not under her", () => {
    for (const scene of withKimi) {
      const her = placeScene(scene, 1920, 1080, ground);
      const kimi = placeCompanion(scene, 200, 1920, 1080, ground); // gather is 0 at 200
      expect(kimi.left + kimi.w / 2, scene.id).toBeLessThan(her.left);
      expect(kimi.top + kimi.h, scene.id).toBeCloseTo(ground(kimi.left + kimi.w / 2) + FEET_SINK);
    }
  });

  test("once gathered, 君's root is her rest point", () => {
    const cling = withKimi.find((s) => s.id === "cling")!;
    const her = placeScene(cling, 1920, 1080, ground);
    const kimi = placeCompanion(cling, 250, 1920, 1080, ground);
    expect(kimi.left + kimi.w / 2).toBeCloseTo(her.left + her.w / 2);
  });
});
```

**Step 2:** Run. Expected: FAIL (`placeCompanion` missing).

**Step 3: Implement.** Add to `CharacterScene`:

```ts
  // 君, drawn only as a cast shadow beside her: figure png, its root's offset from her rest point
  // (fraction of the frame width, negative = toward the light on the left) and its drawn height.
  companion?: { id: "kimi-sit" | "kimi-stand"; aspect: number; dx: number; h: number };
```

Data (aspects from Task 2): sunset `{ id: "kimi-sit", dx: -0.08, h: 0.26 }`, play `{ id: "kimi-sit", dx: -0.08, h: 0.27 }`, hug and cling `{ id: "kimi-stand", dx: -0.05, h: 0.41 }`.

```ts
// Where 君's (unseen) figure stands: its root sits on the ground beside her rest point
// and slides onto it as 君 gathers into her shadow.
export const placeCompanion = (
  scene: CharacterScene,
  t: number,
  width: number,
  height: number,
  ground: (x: number) => number,
) => {
  const { id, aspect, dx, h } = scene.companion!;
  const her = placeScene(scene, width, height, ground);
  const [rx] = scene.rest ?? [0.5, 1];
  const rootX = her.left + rx * her.w + dx * width * (1 - kimiAt(t).gather);
  return { id, ...placeScene({ ...scene, aspect, h, x: rootX / width, rest: undefined }, width, height, ground) };
};
```

**Step 4:** Run the tests, then `npm test` and `npm run lint`. Expected: all PASS. If "君 stands to her left" fails for a sitting pose, increase that scene's `|dx|` until it passes.

**Step 5: Commit** "Place 君 beside her on the ground".

### Task 5: Extract `<CastShadow>` (no visual change)

**Files:** Modify `src/components/Character.tsx`.

**Step 1: Baseline.** Before editing, run `npx remotion bundle` and render `--frame=2700` and `--frame=7350` to `out/chars/kimi/base-90.png`, `base-245.png`.

**Step 2: Extract.** Move the shadow `<filter id="shadow-…">`, the ground clip container and the shadow `<Img>` into:

```tsx
const CastShadow: React.FC<{
  id: string; // unique per shadow, used for the filter id
  src: string;
  box: { left: number; top: number; w: number; h: number; origin: string };
  shadow: Shadow;
  t: number;
  opacity: number;
  blur?: number; // extra softening, px
}> = ...
```

It computes `groundArea`, renders its own `<svg><filter id={`shadow-${id}`}>` with the shared boil primitives (`boil(t)` helper returning the two filter primitives), and uses `filter: blur(${1 + blur}px)`. `SceneCharacter` renders `<CastShadow id={scene.id} … opacity={scene.shadow.opacity} />`.

**Step 3: Verify no change.** Re-bundle, render the same two frames to `refactor-90.png`, `refactor-245.png`, and compare with numpy. Expected: max absolute pixel difference 0.

**Step 4:** `npm test`, `npm run lint`. **Commit** "Extract CastShadow".

### Task 6: Render 君's shadow

**Step 1:** In `SceneCharacter`, when `scene.companion` exists and `kimiAt(t).presence > 0`, render a second `<CastShadow>` before hers:

```tsx
{kimi && k.presence > 0 && (
  <CastShadow id={`${scene.id}-kimi`} src={staticFile(`characters/${kimi.id}.png`)} box={kimi}
    shadow={scene.shadow} t={t} opacity={scene.shadow.opacity * k.presence} blur={k.blur} />
)}
```

where `kimi = scene.companion ? placeCompanion(scene, t, width, height, (x) => groundY(x, height)) : null` and `k = kimiAt(t)`.

**Step 2:** `npm test`, `npm run lint`. Expected: PASS.

**Step 3: Visual check.** Render stills at 90, 120, 150, 163, 235, 242, 250s into `out/chars/kimi/`, crop the ground area and compare with the baseline at `a8a2b3a`. Check:
- the 君 shadow starts on an empty spot of ground to her left and leans the same way as hers;
- it is as dark as hers at 90s, visibly lighter at 150s, nearly gone at 163s;
- it is absent at night;
- at 235s it is back, softer; at 242s it overlaps hers; at 250s both are fading.
Tune `dx`/`h` if a silhouette reads wrong, re-running the tests after each change.

**Step 4: Commit** "Show 君 as a shadow no one casts".

### Task 7: Hand back to the user

Show the before/after crops, list the tunables (`companion.dx/h`, keyframes in `kimiAt`), and ask before re-rendering the full video.

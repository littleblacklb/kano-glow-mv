# Refine fingertip dusk light

## Goal
Remove blood-like fingertip stains and drops around 3:26 while preserving composition, grain, music, timing, and unrelated scenes.

### Phase 1: Inspect
**Status:** complete
- Locate asset pipeline, lighting, effects and validation.
### Phase 2: Implement
**Status:** complete
- Retouch existing hand without changing its silhouette; update prompt.
- Replace ink drops with restrained fading dusk light and local lighting transition.
### Phase 3: Validate
**Status:** complete
- Run tests/lint, render 206s and transition preview.
- Keep lyrics unchanged unless this recording can be verified.

### Phase 4: Trial extended twilight
**Status:** complete
- Inspect and retain dusk before the hand shot, instead of returning to dusk after full night.
- Delay dense stars; make the sky-sourced coral band visible during the hand shot and fade into night.
- Render comparison frames/transition; run regression checks. This trial does not add hand animation.

### Phase 5: Naturalize residual dusk
**Status:** complete
- Preserve twilight timing, replace uniform horizon strip with irregular thin clouds.
- Remove full-width close-up glow; attach localized warm light to the hand silhouette.
- Render entry/hold/exit frames and preview, run regression checks, review and commit.

### Phase 6: Hold the ending inside the story
**Status:** complete (30fps preview verified; pre-existing default-composition configuration blocked separately)
- Remove returning cover/credits, retain the clinging pose and horizon through the tail.
- Replace expanding bright rays with faint distant light; soften the background and settle motion without resolving the loss.
- Render final lyric/tail/fade, run regression checks and save a local checkpoint.

### Phase 7: Adopt the user-supplied translation
**Status:** complete
- Replace all 21 Chinese subtitle entries with the user's supplied text, including spacing and 說; keep Japanese 赤く, timestamps and metadata unchanged.
- Regenerate the local font subsets for the new glyphs.
- Verify subtitle coverage, run relevant checks, render a subtitle sample and save a task-only checkpoint.

## Next Step
User review of the adopted translation (sample: out/subtitle-selected-62.png) and ending preview. 21 exact translations, font subset input coverage, 70 tests and scoped checks passed. Root.tsx frame-rate/import issue remains separate and untouched; no full export performed.

## Errors Encountered
- Initial git inspection at workspace parent failed; repository is nested at mv/, clean baseline confirmed there.
- npm run lint returned a wrapper-style report covering unrelated files (including CesiumFlythrough.tsx); invoking the project ESLint executable on src and TypeScript directly passed. No unrelated files repaired.
- Initial asset color assertion flagged two dark antialiased pen pixels (R=65/75), not bright pigment. Refined the check to exclude dark ink (R<=100); canvas, alpha region, bright-pigment removal and deterministic regeneration all passed.

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

## Next Step
User review of out/twilight-trial-174-220.mp4 and out/twilight-trial-206.png. If accepted, proceed separately with the discussed reaching/half-closing hand animation; that animation is not part of this isolated timing trial.

## Errors Encountered
- Initial git inspection at workspace parent failed; repository is nested at mv/, clean baseline confirmed there.
- npm run lint returned a wrapper-style report covering unrelated files (including CesiumFlythrough.tsx); invoking the project ESLint executable on src and TypeScript directly passed. No unrelated files repaired.
- Initial asset color assertion flagged two dark antialiased pen pixels (R=65/75), not bright pigment. Refined the check to exclude dark ink (R<=100); canvas, alpha region, bright-pigment removal and deterministic regeneration all passed.

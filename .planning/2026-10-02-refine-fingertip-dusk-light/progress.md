# Progress

## Implementation
- Added deterministic local paint-over in scripts/retouch_hand.py, integrated with name-selective key-characters.py. Original picked art remains untouched; regenerated public hand preserves 812x762 canvas.
- Removed PNG liquid drop and red pigment, glazed continuous peach light over fingers/palm/cuff. Updated generation prompt.
- Replaced RedDrops with a single broad, low-opacity Afterglow; shared timing and tested trajectory. It sits above close-up and below lyrics; no liquid or particles.
- Muted 206s sky and added 214.2s cool return; hand tint relaxes slightly during warmth. Music, camera timing and lyrics untouched.

## Validation
- 62 tests passed across 10 files (including 4 new dusk tests).
- npm run lint returned an unexpected broad lint report (138 errors in unrelated files); direct project ESLint src and TypeScript both passed.
- Rendered and inspected out/hand-dusk-206.png: no drop/red caps, warm skin visible, linework and subtitle space preserved.
- Rendered out/hand-dusk-preview-200-228.mp4: 28.05s, 960x540, H.264 + AAC. Inspected contact-sheet samples at 202, 206, 210, 213.67, 216 and 225s: no drops/stains; hand crossfade and cool wide-shot return remain intact. This is sampled visual inspection, not audio listening or full real-time playback.
- Asset checks passed: unchanged dimensions, alpha differences confined to external drop region, no bright red pigment, byte-identical regeneration. Initial color assertion's two hits were dark ink antialiasing; excluded dark linework from the pigment check.
- Direct ESLint src, TypeScript and git diff --check passed. Reviewed task diff. Full MV not re-exported.
- Audio listening/transcription unavailable through current tools; actual 鹿乃 word remains unverified. Lyrics deliberately unchanged.

## Extended twilight trial
- User approved keeping the last dusk alive before/during the hand, then completing night. Trial isolates timing/color; new hand poses are not implemented yet.
- Dusk source now spans 172–214.2s, held through 204s then fades. Sky keeps a low coral band; the close-up reframes that same band at fingertip level. Base sky continuously darkens rather than warming back up at 206s.
- Early star subset limited to 13 of 110 at 35% strength; remaining stars emerge over 204–216s (overall existing star window still applies).
- Rendered and inspected out/twilight-trial-206.png: clearly visible coral band behind upper fingers, cool upper sky, subtitle region remains dark. This is a timing/color trial, not yet proof of the failed-grasp narrative.
- 64 tests passed; direct ESLint src, TypeScript and git diff --check passed. No failing checks in this trial; Remotion emits only Node's module.register deprecation warning.
- Rendered final out/twilight-trial-174-220.mp4 (46.06s, 960x540, H.264 + AAC). Inspected contact-sheet frames at 180, 196, 203.9, 206, 211, 216s: dusk persists before the hand, a framed version crosses the fingertips, then vanishes before the full-star wide shot. Wide/close-up band positions are separate to prevent the wide horizon sliding upward during the dissolve.
- Validation boundary: sampled rendered frames, not uninterrupted audiovisual playback. No full MV export, no lyric/audio changes, no new hand animation. User visual acceptance pending.

## Naturalized dusk refinement
- Preserved twilight/sky/star timing. Replaced the regular radial horizon strip with three unequal cloud silhouettes, vertical warm-edge shading, fixed-seed displacement and soft edges. No extra particles or liquid.
- Removed the close-up horizon strip and global screen-blended Afterglow layer. The hand now reflects an offscreen source: a co-transformed copy of its alpha PNG with a warm color matrix and soft local fingertip mask. Gaps, background and sleeve are not lit; ink/boil/breathing remain aligned. Warm reflection fades on the same envelope as the clouds.
- Added three pure component-tree tests for cloud geometry, absence of a second close-up horizon and the dusk window; updated shared-envelope tests. Initial use of react-dom/server passed Vitest but failed TypeScript due to missing declaration files. Replaced it with existing React element inspection, adding no dependencies. Final tests: 67 passed; ESLint src and TypeScript passed.
- Rendered out/twilight-refined-196.png and out/twilight-refined-206.png; inspected both. Rendered out/twilight-refined-196-218.mp4 (22.06s, 960x540, H.264 + AAC). Inspected contact-sheet frames at 196, 203.8, 204.2, 206, 211 and 216s: no second high horizon band, fingertip light is localized, warm tone recedes before the starry wide shot. The ordinary scene dissolve still briefly overlaps distant clouds and the translucent hand.
- Boundary: visual validation is sampled rendered frames, not uninterrupted audiovisual playback. No full MV export, new hand gesture, audio changes or lyric correction. Aesthetic acceptance remains with the user. Remotion only emitted the existing Node module.register deprecation warning.

## Lingering ending
- Removed rendered credits and returning cover character. Opening remains unchanged. Sky no longer returns to cover red; final cling pose and horizon remain fully present through the global fade at 275–282s, camera holds 1.5x without its former 263s reset.
- Replaced expanding light/rays/motes with faint distant warmth; dimmed cloud illumination. Background softens to 1.6px during the last lyric; figure sway gradually settles, lyrics and figure stay sharp. Source audio, duration constant and lyrics unchanged.
- Rendered out/ending-held-250.png and out/ending-held-236-283.mp4 (47.08s, 960x540, H.264 + AAC, explicit 30fps). Inspected samples at 239, 250, 263, 274, 279 and 282s: held embrace, distant warmth receding, no cover/credits, whole-frame fade reaches black. This is sampled inspection, not full realtime audiovisual playback; full MV not exported.
- 70 tests passed. Initial legacy test expected a return to cover red; updated to the approved ending. Removed task-owned unused random import after deleting light motes.
- Baseline boundary: src/Root.tsx was already modified before this task (fps=60 but total frames still calculated at 30fps; unused FPS import). Left untouched and out of commit. Full ESLint and normal tsc fail on that existing unused import. ESLint src excluding Root.tsx passed; tsc --noUnusedLocals false passed. Explicit --fps=30 render verifies this ending without silently altering user's frame-rate decision. Default composition's shortened runtime remains unresolved pending a 30/60fps decision.
- One attempted CLI help command had a duplicated path segment and failed MODULE_NOT_FOUND; corrected path used for all successful rendering. No dependency changes.

## User-selected translation
- Replaced all 21 Chinese entries in src/data/zh.ts with the user's supplied version verbatim, including 說 and double-space phrase separators. No semantic corrections imposed. Japanese LRC already matches the supplied sung text; kept 赤く, all timestamps and metadata unchanged, along with existing layout and audio.
- Regenerated glyphs.txt and all three local WOFF2 subsets using scripts/subset-fonts.mjs (334 characters).
- Exact-string check passed for all 21 supplied translations in LRC order; every sung cue has a translation and every translation character is in the font subset input. All 70 existing tests passed. ESLint src excluding pre-existing Root.tsx passed; TypeScript with noUnusedLocals disabled passed. Standard full checks were not repeated; the pre-existing Root FPS import/configuration issue remains separate and untouched.
- Rendered and inspected out/subtitle-selected-62.png with explicit 30fps: full Chinese line including 說 is visible, no missing-glyph boxes or clipping in this sample. No full video rerender or all-frame visual verification performed. Node emitted only module-type/deprecation warnings; no validation failures in this phase.

## Warm unresolved ending
- Revised only the final light/color passage: sky warms from the unchanged 226s anchor to a muted peach/mauve lower sky and shadowed upper sky at 256s, then holds that color through the tail. No return to cover, credits or a new dawn.
- Added endingLightAt(t): cloud-gap light eases once from 20%×12% to 38%×26% between 228–256s, capped at 0.5 layer opacity, then holds without rotating rays, particles or a whiteout. Source follows the cloud opening toward the lower sky; slightly increased cloud reflection to 0.32. Existing cloud split timing unchanged.
- Light no longer fades away ahead of the image: its envelope holds until 283s, after the unchanged global closing fade (275–282s) finishes. Held cling pose, camera, source audio, translation, Japanese lyrics and composition duration remain unchanged.
- 71 tests passed. Added bounded spread/hold regression assertions; updated sky expectations to require retained warm lower sky and dark upper sky. ESLint src excluding the pre-existing modified Root.tsx passed; TypeScript with noUnusedLocals disabled passed; diff whitespace checks passed. Full standard lint/tsc not repeated; known Root frame-rate/import mismatch remains untouched and out of commit.
- Rendered out/ending-warm-268.png and out/ending-warm-226-283.mp4 (57.088s, 960x540, 30fps, H.264 + AAC). Inspected the 268s still and contact-sheet samples at 233/239/250/268/279/282s: clouds open, subtitle area remains readable, warmth spreads then stays, figure and shadows persist, final whole-frame fade reaches black. Visual verification is sampled frames, not uninterrupted audiovisual playback; aesthetic acceptance remains with the user. No full MV export or 60fps runtime validation. Renderer emitted the existing Node deprecation warning only.

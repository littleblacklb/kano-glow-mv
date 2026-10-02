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

# 交接：glow MV 剩余工作

写于 2026-10-02，分支 `scene-characters`（HEAD `3a16de1`）。新会话从这里接着做。

## 项目速览
- Remotion 4 同人 MV，鹿乃「glow」，1920×1080 / 30fps / 283s。入口 `src/GlowMV.tsx`，时间轴与天空色 `src/data/timeline.ts`。
- 人物：片头片尾是封面抠图 `public/kano.png`（`scripts/cutout.py`）；中段 7 个姿势由 gpt-image-2 生成，
  数据在 `src/data/characterScenes.ts`（窗口、位置、高度、色调、`rest` 接地点、`shadow`、`companion`），
  渲染在 `src/components/Character.tsx`（`SceneCharacter`、共用的 `<CastShadow>`）。
- 「君」：只以影子出现（`companion` + `kimiAt(t)` + `placeCompanion`），设计见 `docs/plans/2026-10-02-kimi-shadow-design.md`。

## 工作流与约定
- 生成图片：`art/gen.sh <id>...`，通过 `codex exec` 调用内置 image_gen（gpt-image-2）。prompt 为
  `art/prompts/<前缀>.style.txt`（找不到就用 `style.txt`）加上 `art/prompts/<id>.txt`，参考图是 `public/cover.jpeg`。
  产出写到 `art/raw/<id>-v1/v2.png`（gitignore）。选中的版本复制到 `art/picked/<id>.png`，
  再运行 `python3 scripts/key-characters.py`（绿幕抠图）→ `public/characters/<id>.png`，并打印尺寸（aspect 填进代码）。
- 验证：`npm test`（vitest）、`npm run lint`（eslint + tsc）；静帧用
  `npx remotion bundle` 后 `npx remotion still build GlowMV out/x.png --frame=<秒*30>`；
  完整渲染用 `npx remotion render GlowMV out/<新文件名>.mp4`（约 10 分钟，不要覆盖旧文件）。
- 格式：代码库实际约 120 列，只对改动的文件运行 `npx prettier --write --print-width 120 <files>`。
- 用户偏好：不做子代理代码质量审查，只用测试、lint 和静帧验证结果；每项改进做完先给用户看前后对比，再提交、再做下一项。

## 待办（按建议顺序）

### 0. 先渲染一版完整视频
现有的 `out/glow-mv-characters.mp4` 是最早一版，不含以下改动：接地修正、投影、手绘抖动、君的影子。
建议渲染到 `out/glow-mv-v2.mp4`，确认 ① 在连贯播放中的节奏。

### ② 情绪高点换景别
问题：全片几乎是同一个侧面远景，副歌和桥段的景别与主歌相同。
- 「どうして こんなにきつく抱きしめてるの?」（≈150s）给脸部特写；
- 「赤く染まる指先」（≈203s）给手部特写；
- 最后「ぎゅっとしがみついた」（≈238s）慢慢推近；
- 全场景缓慢推镜（整体缩放约 1.0 → 1.08）。
需要用 gpt-image-2 另外生成高分辨率特写图，现有 1024×1536 的全身图放大后不够清楚。
要先 brainstorm：特写如何切入、切出（硬切还是推镜过渡），歌词列的位置是否要配合调整。

### ③ 桥段画出矛盾
「ねぇ 消えて 消してよ そう願っていたのに / どうして こんなにきつく抱きしめてるの?」（≈144–155s）。
唱到「消えて」时她的轮廓被一笔笔擦掉，唱到「抱きしめてる」时再画回来，用笔触表现"想抹去却抹不去"。
歌词已有的融化动效（`MELT_RANGES`）可以作参考。

### ④ 统一画风
生成姿势的线条更细、更精致，偏动画风；封面原画更稚拙。片头封面人物淡出、雨中人物出现时可能被注意到。
方向：给生成姿势加线宽或粗糙度处理（例如在 tint 滤镜里加形态学膨胀），或者调整 prompt 后重新生成。

### 其他未做
- 分支 `scene-characters` 还没合并到 `main`（`main` 只有模板初始提交，可以 fast-forward）。
- `docs/plans/2026-10-02-kimi-shadow.md` 和代码不一致：雲間的浓度文档里写 0.5，代码里是 0.9；
  任务 3 的测试清单少了「crisp under the sun」「leaves with the sun」两个测试。
- 之前讨论过但没选的选项：脚边草丛、下深上浅/逆光、雨中水花/红墨在脚边晕开、眨眼/拨弦两帧交替。

## 对作品的评价（7/10）
色彩叙事和歌词动效是强项。主要的缺口是"君"不在画面里（已用 ① 处理）、构图单一（②）、
桥段没有表现矛盾（③）。做完 ② ③ 预期可以到 8.5 以上。

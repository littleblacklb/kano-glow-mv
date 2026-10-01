# 交接：glow MV 剩余工作

写于 2026-10-02，分支 `scene-characters`，当晚又更新过一次（②③④ 已完成，见下文）。新会话从这里接着做。

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

## 已完成（2026-10-02 夜，未渲染完整视频，只用测试和静帧验证；对比图在 `out/compare/`）
- ④ 统一画风：`scripts/key-characters.py` 把 7 个姿势的墨线每侧加粗 1 个源像素（`INK_GROW`），
  在屏幕上约 1.3px，按人物高度的比例与封面一致；特写和君不加粗。对比图见 `out/compare/4-lines/compare.png`。
  试过渲染时用 feMorphology，但它只接受整数屏幕像素，1px 就会把脸和排线糊成一片。
- ② 推镜：`src/data/camera.ts` 的 `PUSH`。每个姿势推到 1.08，换姿势时退回；ぎゅっとしがみついた 推到 1.5。
  原点在歌词列左缘（`CAMERA_ORIGIN`）。对比图见 `out/compare/2-camera/`。
- ② 特写：`CLOSE_UPS`（camera.ts），图是 `public/characters/close-face.png` 和 `close-hand.png`，
  prompt 在 `art/prompts/close*.txt`。
  - 脸部特写在「どうして」的第一帧硬切进入，160.2s 淡回远景；
  - 手部特写在 203.4–214.2s；
  - RedDrops 放在特写层之下，因为它的晕染斑会叠在袖子上，像是脏点；
  - ScarLines 叠在脸部特写之上。
  静帧见 `out/compare/2-closeups/`。
- ③ 桥段：`src/lib/strokes.ts` 的笔触带遮罩。
  - hug 的 `erase`（characterScenes.ts）从 145.5s 到 149.6s 把她一笔笔擦掉，只留 `GHOST`=0.18 的残影，她的影子同步被擦；
  - 脸部特写的 `redraw` 从 150.13s 到 154s 把她画回来。
  时间是按歌词行内文字的比例估算的（混音太满，从能量包络里找不到乐句起点）。静帧见 `out/compare/3-bridge/`。
- 君的设计文档已和代码对齐。`main` 已 fast-forward 到本分支。

## 待办
### 0. 渲染一版完整视频（这次还没渲染）
`npx remotion render GlowMV out/glow-mv-v2.mp4`，在连贯播放中重点看：
- 推镜退回的速度：换姿势时 3–4s 内退 8%，觉得明显就降低 `PUSH` 里的 1.08，或者把退回拉长；
- 「どうして」硬切和「消えて」擦除与人声是否对齐：调 hug 的 `erase` 和脸部特写的 `redraw`、`window`；
- 笔触带的数量和粗细：`strokesClip` 调用处的 7/9，以及 strokes.ts 里的 angle 和 amp；
- 残影浓度 `GHOST`；
- ScarLines 叠在脸上会不会太乱。

### 其他未做
- 之前讨论过但没选的选项：脚边草丛、下深上浅/逆光、雨中水花/红墨在脚边晕开、眨眼/拨弦两帧交替。
- ④ 只处理了线宽。生成姿势本身的画法（比封面更精致）没有改，要改就得重新生成并重新调 `rest`、aspect 和影子。

## 对作品的评价（7/10，写于 ②③④ 之前）
色彩叙事和歌词动效是强项。主要的缺口是"君"不在画面里（已用 ① 处理）、构图单一（②）、
桥段没有表现矛盾（③）。做完 ② ③ 预期可以到 8.5 以上。

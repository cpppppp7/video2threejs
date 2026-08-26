---
name: video2threejs
description: Rebuild a room/scene from a reference VIDEO (AI-generated or filmed) as a code-only procedural Three.js diorama, 1:1 in layout, color, light, objects, characters and their motion timeline. Use when the user shares a video/tweet and asks to "复刻/还原/1:1 rebuild" it in three.js, or asks how to model a specific object (bedding, hair, lamps, rugs) procedurally. Built around live preview, multi-frame analysis, perspective solving, detail sculpting, research-when-unsure and screenshot-verified iteration.
---

# video2threejs — Video → procedural Three.js scene

把一段参考视频（Seedance/Sora/Veo 生成或实拍）还原成**纯代码、零外部模型**的 Three.js 立体场景，目标是 1:1：机位、每件物品的位置与尺寸、颜色、光、人物外形与**动作时间线**。

这是"reconstruction-by-code"，不是视频重建、NeRF 或下载资产包。参考同门的 [img2threejs](https://github.com/img2threejs/img2threejs)（单物件/角色）；本 skill 负责"整间房 + 多人物 + 时间线"。

本文件是常驻路由：只放顺序和硬规则，每条规则指向 `grimoire/` 里的契约，到该阶段再读。

## 硬规则（用户血泪换来的，违反即返工）

1. **边捏边看（live preview）**：任何建模开始前先跑 `vite` dev server 并把页面 `open` 给用户；按 STAGE 增量写文件，每个 STAGE 热更新可见；右下角放阶段标签。→ `grimoire/build/live_preview.md`
2. **先分析视频，再动手；分析要多角度**：抽帧 ≥8 张覆盖全时长；对"哪面墙/哪个角落"这种空间事实，画网格图逐格读，必要时请用户在截图上标红线。一张帧看不清的，换一帧。→ `grimoire/intake/multi_view_analysis.md`
3. **空间先于物件**：先确定墙面/墙角/相机，再摆东西。相机不靠手感，用物件在画面里的横坐标反解（`forge/solve_camera.py`）。→ `grimoire/space/perspective_solving.md`
4. **细节雕刻按物件逐个推进到 8 分**：每个物件有"参考特征清单"，做完用特写机位截图比对，再进下一个。豆腐块/乐高感 = 不合格。→ `grimoire/build/procedural_recipes.md`
5. **不知道怎么做就去调研**：搜 three.js 官方示例/论坛/同门 skill（如 img2threejs 的头发指南），把结论写进 `grimoire/research/`，不要瞎试。→ `grimoire/research/when_unsure.md`
6. **每次改动都截图验证**（headless Chrome，GPU 路径，几秒一张），和参考帧 `hstack` 并排；光的问题用"纯直射光诊断图"定位而不是猜。→ `grimoire/review/verification.md`
7. **颜色取自视频像素**，不要凭印象；`forge/sample_colors.sh`。
8. **用户说"不要"的东西记进 `grimoire/feedback/user_signals.md`，永久生效**（如：不要漂浮粒子、不要手画光斑、不要丝状发绺/马尾、不要乐高床品）。
9. **动作必须像人**：躺/趴/侧躺/坐用统一的欧拉序与关节约定，并逐幕截图核对；上床下床要绕行不穿模。→ `grimoire/build/characters.md`
10. 结束前做**自我 review 表**（逐物件打分 + 差距清单），交给用户决定下一批。→ `grimoire/review/self_review.md`

## 流程（顺序执行）

| 阶段 | 做什么 | 读 |
|---|---|---|
| 0 | 拿到视频：抓推文/下载 mp4（`forge/extract_frames.sh`）| `grimoire/intake/frame_extraction.md` |
| 1 | 多角度分析：布局、物件清单、色板、人物、动作时间线 | `grimoire/intake/multi_view_analysis.md` |
| 2 | 空间：墙面/墙角判定 → 坐标系 → 相机反解 → 布局契约 | `grimoire/space/*` |
| 3 | 起手：脚手架 + dev server + 分 STAGE 骨架（`templates/room.template.js`）| `grimoire/build/live_preview.md` |
| 4 | 光：实体墙 + 真实窗洞 + 只盖室内的屋顶 + 梯度底为 0 + 夕阳参数 | `grimoire/build/lighting.md` |
| 5 | 物件逐个雕刻（配方库）| `grimoire/build/procedural_recipes.md` |
| 6 | 人物与动作时间线 | `grimoire/build/characters.md`, `grimoire/build/motion_timeline.md` |
| 7 | 开场运镜 + 自由轨道 + 机位读取/持久化 | `grimoire/build/camera_ux.md` |
| 8 | 验证与自我 review，循环 | `grimoire/review/*` |
| 9 | 部署（从项目根目录！）+ 写项目 CLAUDE.md | `grimoire/review/handoff.md` |

## 安装

```bash
git clone <this repo> ~/video2threejs
ln -s ~/video2threejs ~/.claude/skills/video2threejs
```

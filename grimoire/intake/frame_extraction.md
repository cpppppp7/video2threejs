# 抽帧与取材

## 拿到视频
- 推文：用 X 抓取 API 拿 `extended_entities.media[].video_info.variants`，选 720p mp4 直链下载（不要 m3u8）。
- 记录：作者、说明文字（常写着生成模型/风格参照）、时长。

## 抽帧（`forge/extract_frames.sh <video> [n]`）
- 默认 8 帧均匀覆盖全时长（人物动作会变，物件不变）；再按需加密抽某段。
- 输出 `frame_01..N.jpg`（960 宽）+ `grid_01.jpg`（1280×720 加 80px 红网格）供逐格读位置。

## 取色（`forge/sample_colors.sh <frame> name x y ...`）
- 坐标按 1280×720 网格图读，脚本自动换算到原帧；7×7 均值。
- **先看网格图再定坐标**——盲猜坐标会采到天空/地毯阴影。
- 分"受光 / 阴影"两组采样同一物件，材质 base color 取两者之间偏亮的值。

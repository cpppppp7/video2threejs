# Frame extraction and sampling

## Getting the video
- Tweets: read `extended_entities.media[].video_info.variants` from an X data API and download the 720p mp4 (not the m3u8).
- Record author, caption (it often names the generator / style reference) and duration.

## Frames (`forge/extract_frames.sh <video> [n]`)
- Default 8 frames evenly spaced over the whole clip (people move, furniture does not); add denser frames for any moment that matters.
- Output `frame_01..N.jpg` (960 px wide) plus `grid_01.jpg` (1280×720 with an 80 px red grid) for reading positions and colours cell by cell.

## Colours (`forge/sample_colors.sh <frame> name x y ...`)
- Coordinates are read off the 1280×720 grid image; the script rescales to the frame and averages a 7×7 patch.
- **Look at the grid image before choosing coordinates** — guessed coordinates land on the sky or a rug shadow.
- Sample each object twice, lit and shaded; pick the material base colour between the two, leaning bright.

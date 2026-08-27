# Frame extraction and sampling

## Getting the video
- Tweets: `curl https://api.fxtwitter.com/status/<tweet_id>` returns `tweet.media.videos[].variants` for free (fallback: `https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a`); pick the 720p/1080p mp4, not the m3u8. Paid X data APIs are only needed for search/timelines.
- Record author, caption (it often names the generator / style reference) and duration.

## Frames (`forge/extract_frames.sh <video> [n]`)
- Default 8 frames evenly spaced over the whole clip (people move, furniture does not); add denser frames for any moment that matters.
- Output `frame_01..N.jpg` (960 px wide) plus `grid_01.jpg` (1280×720 with an 80 px red grid) for reading positions and colours cell by cell.

## Colours (`forge/sample_colors.sh <frame> name x y ...`)
- Coordinates are read off the 1280×720 grid image; the script rescales to the frame and averages a 7×7 patch.
- **Look at the grid image before choosing coordinates** — guessed coordinates land on the sky or a rug shadow.
- Sample each object twice, lit and shaded; pick the material base colour between the two, leaning bright.

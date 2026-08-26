#!/bin/bash
# usage: extract_frames.sh <video.mp4> [n=8] [outdir=.]
# -> frame_01..N.jpg (960w, evenly spaced) + grid_01.jpg (1280x720 with 80px red grid) for reading positions/colors
set -e
V="$1"; N="${2:-8}"; O="${3:-.}"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
ffmpeg -v error -y -i "$V" -vf "fps=$N/$DUR,scale=960:-1" -frames:v "$N" "$O/frame_%02d.jpg"
ffmpeg -v error -y -i "$O/frame_01.jpg" -vf "scale=1280:720,drawgrid=w=80:h=80:t=1:c=red@0.6" "$O/grid_01.jpg"
echo "duration ${DUR}s -> $N frames in $O (+ grid_01.jpg, 80px cells at 1280x720)"

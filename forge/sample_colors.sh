#!/bin/bash
# usage: sample_colors.sh <frame.jpg> name x y [name x y ...]   (x,y in 1280x720 grid coordinates)
# 7x7 mean colour at each point; frame is assumed 960 wide (scale 0.75).
F="$1"; shift
while [ $# -ge 3 ]; do
  x=$(( $2 * 3 / 4 )); y=$(( $3 * 3 / 4 ))
  v=$(ffmpeg -v error -i "$F" -vf "crop=7:7:$x:$y,scale=1:1" -f rawvideo -pix_fmt rgb24 - 2>/dev/null | xxd -p)
  printf "%-16s #%s\n" "$1" "$v"; shift 3
done

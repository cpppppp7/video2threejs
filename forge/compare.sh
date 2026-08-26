#!/bin/bash
# usage: compare.sh <reference.jpg> <render.png> <out.jpg>   -> side by side at 640x360 each
ffmpeg -v error -y -i "$1" -i "$2" -filter_complex "[0:v]scale=640:360[a];[1:v]scale=640:360[b];[a][b]hstack" "$3" && echo "$3"

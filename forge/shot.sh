#!/bin/bash
# usage: shot.sh <out.png> <url> [WxH=1600x808]
# headless Chrome on the GPU path (seconds). Do NOT add --disable-gpu/swiftshader (minutes) or a fresh --user-data-dir (hangs).
OUT="$1"; URL="$2"; SIZE="${3:-1600x808}"; W=${SIZE%x*}; H=${SIZE#*x}
CH="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CH" --headless=new --no-sandbox --no-first-run --hide-scrollbars --window-size=$W,$H --virtual-time-budget=2500 --screenshot="$OUT" "$URL" >/dev/null 2>&1
echo "$OUT $(wc -c < "$OUT") bytes"

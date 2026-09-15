#!/bin/bash
# Re-encode webm → smaller GIF for proposal embeds
WEBM="$1"
OUT="$2"
WIDTH="${3:-540}"
FPS="${4:-12}"
DUR="${5:-3.8}"
START="${6:-0}"

PALETTE="/tmp/palette-$$.png"
SCALE="scale=${WIDTH}:-2:flags=lanczos"

ffmpeg -y -ss "$START" -t "$DUR" -i "$WEBM" \
  -vf "${SCALE},fps=${FPS},palettegen=max_colors=96:stats_mode=diff" "$PALETTE" 2>/dev/null

ffmpeg -y -ss "$START" -t "$DUR" -i "$WEBM" -i "$PALETTE" \
  -lavfi "${SCALE},fps=${FPS} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 "$OUT" 2>/dev/null

rm -f "$PALETTE"
ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$OUT"
stat -c%s "$OUT"

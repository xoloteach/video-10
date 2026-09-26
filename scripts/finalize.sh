#!/bin/bash
set -e
cd /data/v2
V=final/video.mp4
A=narration/mix.wav
OUT=final/final.mp4
BR=1000k
echo "=== pass 1 ==="
ffmpeg -v error -y -i "$V" -c:v libx264 -b:v $BR -pass 1 -preset slow -g 60 -keyint_min 30 \
  -sc_threshold 40 -pix_fmt yuv420p -an -f mp4 /dev/null
echo "=== pass 2 ==="
ffmpeg -v error -y -i "$V" -i "$A" \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -b:v $BR -pass 2 -preset slow -g 60 -keyint_min 30 -sc_threshold 40 \
  -profile:v high -level 4.0 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ar 48000 -ac 2 \
  -movflags +faststart -shortest "$OUT"
rm -f ffmpeg2pass-*.log*
echo "=== done ==="
ls -la "$OUT"

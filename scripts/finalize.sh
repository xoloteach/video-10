#!/bin/bash
set -e
cd "/data/video 1"
ffmpeg -y -i final/motion-layer.mp4 -i final/final-mix.wav \
  -vf "ass=captions.ass:fontsdir=/tmp/wwb-fonts" \
  -r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart -shortest final/final.mp4 -loglevel error
echo "final.mp4 written"
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 final/final.mp4

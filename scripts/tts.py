import json, re, subprocess, time, urllib.request
from pathlib import Path
KEY = "1dd6519590c73e7e75e931ee70c0cabaf9cd4ca5"
URL = "https://api.deepgram.com/v2/speak?model=flux-cole-en&speed=1&expressivity=-1"
text = Path("narration-clean.txt").read_text(encoding="utf-8")
parts = re.split(r'(?<=[.!?])\s+', text)
chunks, cur = [], ""
for p in parts:
    if len(cur) + len(p) + 1 > 1200 and cur: chunks.append(cur.strip()); cur = p
    else: cur = (cur + " " + p).strip()
if cur: chunks.append(cur.strip())
print(f"{len(chunks)} TTS chunks", flush=True)
out = Path("narration"); out.mkdir(exist_ok=True); files = []
for i, ch in enumerate(chunks, 1):
    fp = out / f"chunk-{i:02d}.mp3"
    if fp.exists() and fp.stat().st_size > 1000: files.append(fp); continue
    body = json.dumps({"text": ch}).encode()
    for a in range(4):
        try:
            req = urllib.request.Request(URL, data=body, headers={"Authorization": f"Token {KEY}", "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=180) as r: data = r.read()
            assert len(data) > 1000
            fp.write_bytes(data); print(f"  chunk {i}/{len(chunks)} ok", flush=True); files.append(fp); break
        except Exception as e:
            print(f"  chunk {i} retry {a+1}: {e}", flush=True); time.sleep(3)
    else: raise SystemExit(f"chunk {i} failed")
sil = out / "gap.mp3"
subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t","0.30","-c:a","libmp3lame","-b:a","48k",str(sil)], check=True, capture_output=True)
lst = out / "concat.txt"
lst.write_text("\n".join(sum([[f"file '{f.resolve()}'", f"file '{sil.resolve()}'"] for f in files], [])), encoding="utf-8")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(lst),"-c","copy",str(out/"voiceover-raw.mp3")], check=True, capture_output=True)
print("raw concatenated")

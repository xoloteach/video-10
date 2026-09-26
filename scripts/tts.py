import json, re, subprocess, time, urllib.request, os
from pathlib import Path
KEY = "1dd6519590c73e7e75e931ee70c0cabaf9cd4ca5"
URL = "https://api.deepgram.com/v2/speak?model=flux-cole-en&speed=1&expressivity=-1"

raw = Path("repo/script.md").read_text(encoding="utf-8")
raw = re.sub(r'\[[A-Z]+:[^\]]*\]', '', raw)          # strip cue tags
text = re.sub(r'\s*\n\s*', ' ', raw)
text = re.sub(r'\s+', ' ', text).strip()
Path("narration/narration-clean.txt").write_text(text, encoding="utf-8")
print("chars", len(text), "words", len(text.split()))

parts = re.split(r'(?<=[.!?…])\s+', text)
chunks, cur = [], ""
for p in parts:
    if len(cur) + len(p) + 1 > 1200:
        chunks.append(cur.strip()); cur = p
    else:
        cur += " " + p
if cur.strip(): chunks.append(cur.strip())
print("chunks", len(chunks))

os.makedirs("narration/parts", exist_ok=True)
for i, c in enumerate(chunks):
    out = Path(f"narration/parts/{i:03d}.mp3")
    if out.exists() and out.stat().st_size > 2000: continue
    for attempt in range(5):
        try:
            req = urllib.request.Request(URL, data=c.encode("utf-8"),
                headers={"Authorization": f"Token {KEY}", "Content-Type": "text/plain"})
            with urllib.request.urlopen(req, timeout=180) as r:
                b = r.read()
            if len(b) < 2000: raise RuntimeError("short audio")
            out.write_bytes(b); break
        except Exception as e:
            print("retry", i, attempt, e, flush=True); time.sleep(3*(attempt+1))
    else:
        raise SystemExit(f"FAILED chunk {i}")
    print("chunk", i, len(b), flush=True)

with open("narration/list.txt","w") as f:
    for i in range(len(chunks)): f.write(f"file 'parts/{i:03d}.mp3'\n")
subprocess.run(["ffmpeg","-v","error","-f","concat","-safe","0","-i","narration/list.txt",
                "-ar","48000","-ac","1","-c:a","pcm_s16le","narration/raw.wav","-y"], check=True)
print("done")

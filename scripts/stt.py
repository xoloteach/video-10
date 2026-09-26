import json, urllib.request
from pathlib import Path
KEY="1dd6519590c73e7e75e931ee70c0cabaf9cd4ca5"
URL=("https://api.deepgram.com/v1/listen?model=nova-3&language=en&punctuate=true&smart_format=false&utterances=false&paragraphs=false")
audio = Path("narration/voiceover.mp3").read_bytes()
req = urllib.request.Request(URL, data=audio, headers={"Authorization": f"Token {KEY}", "Content-Type": "audio/mp3"})
with urllib.request.urlopen(req, timeout=600) as r: data = json.loads(r.read())
Path("voiceover.json").write_text(json.dumps(data), encoding="utf-8")
w = data["results"]["channels"][0]["alternatives"][0]["words"]
print("words:", len(w), "last end:", w[-1]["end"])

import json, urllib.request
from pathlib import Path
KEY="1dd6519590c73e7e75e931ee70c0cabaf9cd4ca5"
URL=("https://api.deepgram.com/v1/listen?model=nova-3&language=en&punctuate=true"
     "&smart_format=false&utterances=false&paragraphs=false")
audio=Path("narration/voice.mp3").read_bytes()
req=urllib.request.Request(URL,data=audio,headers={"Authorization":f"Token {KEY}","Content-Type":"audio/mpeg"})
with urllib.request.urlopen(req,timeout=600) as r: res=json.load(r)
w=res["results"]["channels"][0]["alternatives"][0]["words"]
json.dump(w,open("narration/words.json","w"))
print("words",len(w),"last end",w[-1]["end"])

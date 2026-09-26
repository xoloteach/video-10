import json
from pathlib import Path
def fat(s):
    h=int(s//3600); m=int((s%3600)//60); sec=int(s%60); c=int(round((s-int(s))*100))
    if c>=100: sec+=1; c=0
    return f"{h:01d}:{m:02d}:{sec:02d}.{c:02d}"
def cw(t): return t.replace("{","").replace("}","").replace("\\","").strip()
data = json.loads(Path("voiceover.json").read_text(encoding="utf-8"))
words = data["results"]["channels"][0]["alternatives"][0]["words"]
sentences, current, prev_end = [], [], None
for w in words:
    punc = w.get("punctuated_word", w.get("word","")).rstrip()
    if current and prev_end is not None and (w["start"]-prev_end) > 0.6: sentences.append(current); current=[]
    current.append(w); prev_end = w["end"]
    if punc.endswith((".","?","!",":",";")) or len(current) >= 6: sentences.append(current); current=[]
if current: sentences.append(current)
header = """[Script Info]
Title: Why We Become (Clean Steady Presentation Captions)
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: CleanSteady,Montserrat ExtraBold,72,&H00FFFFFF,&H00000000,&H00000000,&H90000000,-1,0,0,0,100,100,0.5,0,1,5.5,2.0,2,100,100,90,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
for si, s in enumerate(sentences):
    for i, tw_ in enumerate(s):
        t0 = tw_["start"]
        if i+1 < len(s): t1 = s[i+1]["start"]
        elif si+1 < len(sentences) and sentences[si+1]: t1 = min(tw_["end"]+0.35, sentences[si+1][0]["start"])
        else: t1 = tw_["end"]+0.45
        toks = []
        for j, w in enumerate(s):
            wt = cw(w.get("punctuated_word", w.get("word","")))
            tag = "\\c&H0024E0FF&\\fscx100\\fscy100" if j==i else ("\\c&H00FFFFFF&\\fscx100\\fscy100" if j<i else "\\c&H50CCCCCC&\\fscx100\\fscy100")
            toks.append("{"+tag+"}"+wt)
        ev.append(f"Dialogue: 0,{fat(t0)},{fat(t1)},CleanSteady,,0,0,0,,{' '.join(toks)}")
Path("captions.ass").write_text(header + "\n".join(ev) + "\n", encoding="utf-8")
print(f"captions: {len(ev)} events")

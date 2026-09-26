import json, math, re, difflib
from pathlib import Path
FPS = 30; DURATION = 657.816000
data = json.loads(Path("voiceover.json").read_text(encoding="utf-8"))
stt = data["results"]["channels"][0]["alternatives"][0]["words"]
def norm(w): return re.sub(r"[^a-z0-9']","",w.lower()).replace("'","")
sw=[norm(w) for w in Path("narration-clean.txt").read_text(encoding="utf-8").split()]
tw=[norm(w.get("punctuated_word", w.get("word",""))) for w in stt]
sm=difflib.SequenceMatcher(None,sw,tw,autojunk=False); m={}
for a,b,size in sm.get_matching_blocks():
    for k in range(size): m[a+k]=b+k
print(f"alignment ratio {sm.ratio():.4f}")
LAB={"STAT":"Key Finding","TERM":"Mechanism","ARROW":"","CHART":"Data"}
cues=[]
for c in json.loads(Path("cues.json").read_text(encoding="utf-8")):
    j = m.get(c["word_idx"])
    if j is None: j = min(range(len(tw)), key=lambda k: abs(k-c["word_idx"]))
    cues.append({"type":c["type"],"value":c["value"],"time":round(max(0.0, stt[j]["start"]-0.15),2),"label":LAB[c["type"]]})
def t_at(i, off=0.0):
    j=m.get(i)
    if j is None: j=min(range(len(tw)), key=lambda k: abs(k-i))
    return round(stt[j]["start"]+off,2)
pf = sorted(Path("frames").glob("p*.png"), key=lambda p:int(p.stem[1:])); n=len(pf); slot=DURATION/n
panels=[{"src":f"frames/{f.name}","start":round(i*slot,3),"duration":round(slot,3)} for i,f in enumerate(pf)]
papers=[
 {"src":"assets/external/paper-resolutions.png","time":t_at(136,2.0),"duration":7.5,
  "credit":"Source: Oscarsson et al. — PLOS ONE (2020) · New Year's resolution outcomes","highlightY":470,"highlightW":620},
 {"src":"assets/external/paper-habitformation.png","time":t_at(521,2.0),"duration":7.5,
  "credit":"Source: Gardner, Lally & Wardle — British Journal of General Practice (2012)","highlightY":470,"highlightW":620},
 {"src":"assets/external/paper-habits.png","time":t_at(1319,2.0),"duration":7.5,
  "credit":"Source: Wood, Quinn & Kashy — Journal of Personality & Social Psychology (2002)","highlightY":470,"highlightW":620}]
archival=[{"src":"assets/external/archive-brain.png","time":t_at(208,1.5),"duration":6.0,
  "credit":"Archive · Anatomical illustration, public domain"}]
props={"fps":FPS,"duration":DURATION,"durationInFrames":int(math.ceil(DURATION*FPS)),"panels":panels,"cues":cues,
 "papers":papers,"archival":archival,"endCardAt":round(DURATION-9.3,2),"endCardTitle":"Why We Become",
 "endCardLines":["Think deeper. Live better. Become more.","New explainer every week."]}
Path("remotion/src/data.json").write_text(json.dumps(props,indent=2),encoding="utf-8")
print("panels",n,"slot",round(slot,2),"cues",[(c["type"],c["value"],c["time"]) for c in cues])

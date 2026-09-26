import json, re, math
from pathlib import Path

FPS=30
LEAD=0.8                       # silence before narration
W=json.load(open("narration/words.json"))
for w in W: w["word"]=w.get("punctuated_word") or w["word"]
for w in W: w["start"]+=LEAD; w["end"]+=LEAD
NARR_END=W[-1]["end"]

def norm(s): return re.sub(r"[^a-z0-9 ]","",s.lower())
toks=[norm(w["word"]) for w in W]
joined=" ".join(toks)
# map char offset -> word index
off,charmap=0,[]
for i,t in enumerate(toks):
    charmap.append(off); off+=len(t)+1

def widx(phrase, occurrence=1):
    p=norm(phrase); start=0
    for _ in range(occurrence):
        k=joined.find(p,start)
        if k<0: return None
        start=k+1
    lo,hi=0,len(charmap)-1
    while lo<hi:
        m=(lo+hi)//2
        if charmap[m]<k: lo=m+1
        else: hi=m
    if charmap[lo]>k: lo-=1
    return lo

def T(phrase, occ=1, off=0.0):
    i=widx(phrase,occ)
    if i is None: 
        print("  !! phrase not found:", phrase); return None
    return round(W[i]["start"]+off,2)

# ---------- sentence boundaries ----------
sent_ends=[i for i,w in enumerate(W) if w["word"].strip().endswith((".","?","!"))]
def snap(t):
    """snap a time to the nearest sentence boundary start"""
    best=None;bd=1e9
    for i in sent_ends:
        if i+1>=len(W): continue
        tt=W[i+1]["start"]
        if abs(tt-t)<bd: bd=abs(tt-t); best=tt
    return round(best,2) if best is not None else round(t,2)

# ---------- panels: 48, snapped to sentence starts, each split into 2 camera moves ----------
span=NARR_END-LEAD
panels=[]
edges=[LEAD]+[snap(LEAD+span*(i/48)) for i in range(1,48)]+[NARR_END]
edges=sorted(set(edges))
while len(edges)<49: edges.append(NARR_END)
edges=edges[:49]
for i in range(48):
    s,e=edges[i],edges[i+1]
    if e-s<3.0: e=s+3.0
    panels.append({"src":f"panels/p{i+1:02d}.png","start":round(s,2),"end":round(e,2)})
panels[-1]["end"]=round(NARR_END+0.6,2)

# ---------- graphic beats ----------
def beat(kind,t,dur,**kw):
    if t is None: return None
    d={"kind":kind,"time":t,"dur":dur}; d.update(kw); return d

B=[]
add=lambda *a,**k: (lambda b: B.append(b) if b else None)(beat(*a,**k))

add("chapter", T("its monday morning"), 4.6, num="01", title="The Monday Loop")
add("checklist", T("youll wake up early"), 9.5,
    items=["Wake up early","Work out","Read","Stop scrolling","Be disciplined"])
add("streak", T("then you miss one day"), 8.0, mode="break")
add("loop", T("until another monday comes around"), 7.0)
add("compare", T("you might not have a problem with starting"), 8.5,
    left="STARTING", leftSub="feels exciting", right="CONTINUING", rightSub="feels ordinary")
add("stat", T("and you start again"), 7.5, value="40–46%", unit="",
    caption="of resolution-makers still on track at 6 months",
    source="Oscarsson et al. · PLOS ONE (2020)", count=46)
add("term", T("when you start something new"), 6.0, label="Mechanism", value="The Possibility Phase")
add("curve", T("but then reality begins"), 8.5,
    a="Motivation", b="Systems")
add("term", T("thats where most people struggle"), 6.0, label="Mechanism", value="The Repetition Wall")
add("wantcost", T("because we love transformation"), 10.0, pairs=[
    ["the body","the ordinary workouts"],["the skill","the boring practice"],
    ["the business","the quiet work"],["discipline","doing it anyway"]])
add("chapter", T("but theres another reason you keep starting over"), 4.6, num="02", title="The Perfect Plan Trap")
add("overload", T("five am"), 9.5, items=["5 AM","Workout 1h","Read 30p","Work 8h","New skill","Eat clean","No phone","Meditate","Journal","Sleep early"])
add("stat", T("one ordinary day"), 7.5, value="66", unit="days",
    caption="median time for a new habit to feel automatic",
    source="Lally et al. · Eur. J. Social Psychology (2010)", count=66)
add("term", T("this is an all or nothing mindset"), 6.0, label="Bias", value="All-or-Nothing Thinking")
add("switch", T("you miss one workout"), 7.0)
add("map", T("imagine youre walking somewhere"), 9.5)
add("term", T("the goal is to recover faster"), 6.0, label="Practice", value="Faster Recovery")
add("chapter", T("stop building routines for your best days"), 4.6, num="03", title="Build For Your Worst Day")
add("bars", T("maybe on your best days"), 9.0, rows=[
    ["Read","30 pages","1 page"],["Train","60 min","10 min walk"],["Work","3 hours","20 min"]])
add("term", T("but they create something incredibly important"), 6.0, label="Mechanism", value="Continuity")
add("chapter", T("but theres one more trap"), 4.6, num="04", title="Rearranging The Furniture")
add("term", T("but sometimes youre just rearranging the furniture"), 6.0, label="Trap", value="False Progress")
add("stat", T("part of your normal life"), 7.5, value="43%", unit="",
    caption="of daily behaviour is performed habitually, in the same context",
    source="Wood, Quinn & Kashy · JPSP (2002)", count=43)
add("meter", T("think about brushing your teeth"), 7.5, label="Automaticity")
add("friction", T("and this is why your environment matters too"), 9.0, items=[
    ["Phone by the bed","Phone in another room"],
    ["Kit in a drawer","Kit laid out"],
    ["Book out of sight","Book on the pillow"]])
add("chapter", T("and remember"), 4.6, num="05", title="Evidence, Not Identity")
add("evidence", T("through hundreds of small pieces of evidence"), 9.0)
add("term", T("the middle is where progress feels invisible"), 6.0, label="Mechanism", value="The Middle")
add("middle", T("the beginning is exciting"), 8.5)
add("term", T("momentum"), 6.0, label="Outcome", value="Momentum")
add("momentum", T("you stop needing to start over"), 8.0)
add("closing", T("you are not starting from zero"), 8.0)

B=[b for b in B if b]
B.sort(key=lambda b:b["time"])
# de-overlap: prefer shifting the later beat, only shrink as a last resort
GAP=0.8
for i in range(len(B)-1):
    need=B[i]["time"]+B[i]["dur"]+GAP
    if B[i+1]["time"] < need:
        shift=need-B[i+1]["time"]
        if shift <= 9.0:
            B[i+1]["time"]=round(need,2)
        else:
            B[i]["dur"]=max(4.5, round(B[i+1]["time"]-B[i]["time"]-GAP,2))
B=[b for b in B if b["time"]+b["dur"] < NARR_END-4.0 or b["kind"]=="closing"]
B.sort(key=lambda b:b["time"])

# ---------- kinetic emphasis words ----------
EMPH=["problem with continuing","starting feels exciting","continuing feels ordinary",
      "at the repetition","motivation is also temporary","youre not back to zero",
      "recover faster","build them for your worst days","i am someone who keeps going",
      "do i actually need a better plan","boring is exactly what consistency looks like",
      "make the first step ridiculously simple","you become someone who keeps one promise",
      "what can i continue","the middle is quiet","you simply continue",
      "just come back","you need the courage","maybe you just need to keep going"]
emph=[]
# ---- build sentence table for auto emphasis ----
sentences=[]
_s=0
for i,w in enumerate(W):
    if w["word"].strip().endswith((".","?","!")) or i==len(W)-1:
        txt=" ".join(x["word"] for x in W[_s:i+1])
        sentences.append({"start":W[_s]["start"],"end":W[i]["end"],"n":i+1-_s,"text":txt})
        _s=i+1

def beat_busy(t):
    return any(b["time"]-0.6 <= t <= b["time"]+b["dur"]+0.6 for b in B)
for p_ in EMPH:
    t=T(p_)
    if t is not None and not beat_busy(t) and not beat_busy(t+3.4):
        emph.append({"time":t,"text":p_,"dur":3.2})

# ---- auto-fill quiet stretches with kinetic sentence cards ----
STOP={"and","the","but","you","that","this","your","with","for","its","it's"}
def score(s):
    if not (3 <= s["n"] <= 9): return -1
    if s["end"]-s["start"] < 1.1: return -1
    words=[x.lower().strip(".,!?") for x in s["text"].split()]
    if words[0] in ("maybe","because","so","then","and"): return -1
    strong=sum(1 for x in words if x not in STOP and len(x)>3)
    return strong
def occupied(t,d=3.4):
    if beat_busy(t) or beat_busy(t+d): return True
    return any(abs(t-e["time"])<11.0 for e in emph)

for s in sentences:
    t=round(s["start"],2)
    if score(s) < 2: continue
    if occupied(t): continue
    dur=min(3.4, max(2.4, s["end"]-s["start"]+0.5))
    emph.append({"time":t,"text":s["text"].strip(),"dur":round(dur,2)})
emph.sort(key=lambda e:e["time"])

# ---------- chapter progress marks ----------
chapters=[b for b in B if b["kind"]=="chapter"]

props={
 "fps":FPS,"width":1920,"height":1080,
 "lead":LEAD,
 "narrEnd":round(NARR_END,2),
 "total":round(NARR_END+8.6,2),
 "durationInFrames":int(math.ceil((NARR_END+8.6)*FPS)),
 "panels":panels,
 "beats":B,
 "emphasis":emph,
 "words":[{"w":w["word"],"s":round(w["start"],3),"e":round(w["end"],3)} for w in W],
 "endCardAt":round(NARR_END-3.0,2),
}
json.dump(props,open("remotion/src/data.json","w"))
print("panels",len(panels),"beats",len(B),"emphasis",len(emph))
print("duration",props["total"],"frames",props["durationInFrames"])
from collections import Counter
print(Counter(b["kind"] for b in B))
cov=sum(b["dur"] for b in B)
print("graphic coverage: %.1f%%"%(100*cov/props["total"]))

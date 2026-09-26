import subprocess, sys, json
import cv2, numpy as np
from pathlib import Path
video = sys.argv[1] if len(sys.argv)>1 else "final/final.mp4"
cd = Path("critic-frames"); cd.mkdir(exist_ok=True)
for f in cd.glob("audit_*.png"): f.unlink()
subprocess.run(["ffmpeg","-y","-i",video,"-vf","fps=1/3",f"{cd}/audit_%04d.png","-loglevel","error"], check=True)
frames = sorted(cd.glob("audit_*.png")); print(f"audit frames: {len(frames)}")
rows=[]
for f in frames:
    im = cv2.imread(str(f))
    if im is None: continue
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    band = g[int(g.shape[0]*0.83):, :]
    rows.append((f.name, g.mean(), g.std(), cv2.Canny(g,60,160).mean(), float((band>200).mean())*100))
L=np.array([r[1] for r in rows]); C=np.array([r[2] for r in rows]); E=np.array([r[3] for r in rows]); S=np.array([r[4] for r in rows])
print(f"luma mean {L.mean():.1f} min {L.min():.1f} max {L.max():.1f}")
print(f"contrast mean {C.mean():.1f} min {C.min():.1f}")
print(f"edges mean {E.mean():.2f}")
print(f"subtitle-band bright %: mean {S.mean():.2f}  frames<0.5%: {int((S<0.5).sum())}")
black=[r[0] for r in rows if r[1]<8]; flat=[r[0] for r in rows if r[2]<6]
print("empty frames:", len(black), "flat frames:", len(flat))
sc_cl = 10.0 if E.mean()<40 else max(4.0, 10-(E.mean()-40)/8)
sc_co = min(10.0, C.mean()/5.5); sc_lu = max(0.0, 10-abs(L.mean()-150)/9)
sc_re = 10.0 if S.mean()>=2.6 else min(10.0,(S.mean()/2.6)*10)
sc_st = 10.0 if not black and not flat else 10.0-2.0*(len(black)+len(flat))
ov = float(np.mean([sc_cl,sc_co,sc_lu,sc_re,sc_st]))
print(json.dumps({"clutter_cleanliness":round(sc_cl,2),"contrast_richness":round(sc_co,2),"exposure":round(sc_lu,2),
 "subtitle_legibility":round(sc_re,2),"frame_stability":round(sc_st,2),"overall":round(ov,2),
 "gate":"PASS" if ov>=7.0 else "FAIL"}, indent=2))

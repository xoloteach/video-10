import numpy as np, json, wave
from pathlib import Path

SR = 48000
props = json.loads(Path("remotion/src/data.json").read_text())
DUR = props["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(7)
CH = [[110.00,261.63,329.63,164.81],[87.31,220.00,261.63,174.61],
      [130.81,329.63,392.00,196.00],[98.00,246.94,293.66,146.83]]
SEG, XF = 32.0, 8.0
LOOP = int(SEG*len(CH)*SR)

def pad_note(freqs, dur):
    n = int(dur*SR); t = np.arange(n, dtype=np.float32)/SR
    out = np.zeros(n, dtype=np.float32)
    for f in freqs:
        for d in (-0.0028, 0.0, 0.0028):
            ff = f*(1+d)
            for h, amp in ((1,1.0),(2,0.34),(3,0.13),(4,0.06),(5,0.03)):
                out += (amp*np.sin(2*np.pi*ff*h*t + rng.uniform(0,6.28))).astype(np.float32)
    a = int(7.0*SR); r = int(7.0*SR)
    out[:a] *= np.linspace(0,1,a,dtype=np.float32)**1.6
    out[-r:] *= np.linspace(1,0,r,dtype=np.float32)**1.6
    return out

loop = np.zeros(LOOP, dtype=np.float32)
for i, ch in enumerate(CH):
    note = pad_note(ch, SEG+XF)
    s = int(i*SEG*SR); e = min(LOOP, s+len(note)); loop[s:e] += note[:e-s]
loop /= (np.max(np.abs(loop))+1e-9); loop *= 0.30
print("loop", LOOP/SR, "s", flush=True)

CHUNK = 16*SR
def bgm_block(start, n):
    idx = (np.arange(start, start+n) % LOOP)
    b = loop[idx]
    t = (np.arange(start, start+n, dtype=np.float32))/SR
    b = b*(0.86 + 0.14*np.sin(2*np.pi*0.061*t)*np.sin(2*np.pi*0.023*t+1.1)).astype(np.float32)
    m = n//2000 + 2
    air = np.interp(np.arange(n), np.arange(m)*2000, rng.normal(0,1,m)).astype(np.float32)
    return (b + air*0.03).astype(np.float32)

with wave.open("scratch/bgm.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    pos = 0
    while pos < N:
        n = min(CHUNK, N-pos)
        blk = bgm_block(pos, n)
        w.writeframes((np.clip(blk,-1,1)*32767).astype(np.int16).tobytes())
        pos += n
print("bgm.wav written", flush=True)

def pop():
    n=int(0.22*SR); t=np.arange(n,dtype=np.float32)/SR
    f=520*np.exp(-9*t)+150
    x=np.sin(2*np.pi*np.cumsum(f,dtype=np.float32)/SR).astype(np.float32)*np.exp(-16*t)
    return ((x + rng.normal(0,1,n).astype(np.float32)*np.exp(-90*t)*0.35)*0.55).astype(np.float32)
def marker():
    n=int(0.62*SR); t=np.arange(n,dtype=np.float32)/SR
    X=np.fft.rfft(rng.normal(0,1,n)); frr=np.fft.rfftfreq(n,1/SR)
    X *= np.exp(-((frr-2600)/1900)**2)
    x=np.fft.irfft(X,n=n).astype(np.float32)
    env=(np.clip(np.sin(np.pi*np.clip(t/0.62,0,1))**0.6,0,1)*(0.7+0.3*np.sin(2*np.pi*11*t))).astype(np.float32)
    return x*env*3.2
def sub():
    n=int(2.2*SR); t=np.arange(n,dtype=np.float32)/SR
    return (np.sin(2*np.pi*45*t)*np.minimum(t/0.5,1.0)*np.exp(-t/0.75)*0.85).astype(np.float32)

sfx = np.zeros(N, dtype=np.float32)
def place(x, at, g=1.0):
    s=int(at*SR); e=min(N, s+len(x))
    if e>s: sfx[s:e] += x[:e-s]*g
P,M,S = pop(), marker(), sub()
for c in props["cues"]: place(P, c["time"]+0.10, 0.75 if c["type"]=="STAT" else 0.55)
for p in props["papers"]: place(M, p["time"]+0.55, 0.9)
for at in [c["time"] for c in props["cues"] if c["value"] in ("66 days","All-or-Nothing Thinking","43%")] + [props["endCardAt"]]:
    place(S, at, 0.7)
sfx /= (np.max(np.abs(sfx))+1e-9); sfx *= 0.5
with wave.open("scratch/sfx.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(sfx,-1,1)*32767).astype(np.int16).tobytes())
print("sfx.wav written", flush=True)

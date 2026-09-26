import numpy as np, json, subprocess
SR=48000
D=json.load(open("remotion/src/data.json"))
TOTAL=D["total"]; N=int(TOTAL*SR)

def note(f): return f
A=55.0
def hz(semi, oct=0): return A*(2**(semi/12.0))*(2**oct)

# ---- 32s chord loop: Am F C G (8s each) ----
LOOP=32.0; LN=int(LOOP*SR)
t=np.arange(LN,dtype=np.float32)/SR
loop=np.zeros(LN,dtype=np.float32)
chords={0:[0,3,7,12],1:[-4,0,5,12],2:[3,7,10,15],3:[-2,2,5,14]}   # Am, F, C, G (rel semitones)
for ci in range(4):
    s,e=int(ci*8*SR),int((ci+1)*8*SR)
    seg=np.zeros(e-s,dtype=np.float32)
    lt=np.arange(e-s,dtype=np.float32)/SR
    env=np.minimum(lt/1.8,1.0)*np.minimum((8.0-lt)/2.2,1.0)
    env=np.clip(env,0,1)**1.4
    for k,semi in enumerate(chords[ci]):
        f=hz(semi,2)
        for det in (-0.12,0.0,0.12):
            ph=2*np.pi*(f+det)*lt
            seg += (0.30/(k+1.6))*np.sin(ph).astype(np.float32)
            seg += (0.09/(k+1.6))*np.sin(2*ph).astype(np.float32)
    # sub
    seg += 0.22*np.sin(2*np.pi*hz(chords[ci][0],1)*lt).astype(np.float32)
    loop[s:e]=seg*env
# gentle one-pole lowpass
def lp(x,a):
    y=np.empty_like(x); acc=0.0
    # vectorised approximation via lfilter
    from scipy_stub import _  # placeholder
    return x
b=np.exp(-2*np.pi*900/SR)
y=np.zeros_like(loop); acc=0.0
# fast IIR using np (loop in C via np.frompyfunc is slow) -> use cumulative approach in chunks
import numpy.lib.stride_tricks as st
def onepole(x, cutoff):
    a=np.exp(-2*np.pi*cutoff/SR).astype(np.float32)
    out=np.empty_like(x); acc=np.float32(0)
    CH=1<<16
    for i in range(0,len(x),CH):
        c=x[i:i+CH]
        # sequential within chunk
        for j in range(len(c)):
            acc=a*acc+(1-a)*c[j]
            out[i+j]=acc
    return out
# too slow in python; use ffmpeg for filtering instead
loop/= (np.abs(loop).max()+1e-9)
loop*=0.9
# crossfade loop ends
xf=int(1.5*SR)
loop[-xf:]*=np.linspace(1,0,xf,dtype=np.float32)
loop[:xf]=loop[:xf]*np.linspace(0,1,xf,dtype=np.float32)+loop[-xf:][::-1]*0
reps=int(np.ceil(N/ (LN-xf)))
music=np.zeros(N+LN,dtype=np.float32)
pos=0
for r in range(reps):
    music[pos:pos+LN]+=loop
    pos+=LN-xf
music=music[:N]
# slow evolution
ev=0.75+0.25*np.sin(2*np.pi*np.arange(N,dtype=np.float32)/SR/97.0)
music*=ev
music*=0.5

# ---- SFX ----
sfx=np.zeros(N,dtype=np.float32)
rng=np.random.default_rng(3)
def place(arr, at, buf, gain=1.0):
    i=int(at*SR)
    if i<0 or i>=len(arr): return
    j=min(len(arr), i+len(buf))
    arr[i:j]+=buf[:j-i]*gain

def tick():
    L=int(0.09*SR); lt=np.arange(L,dtype=np.float32)/SR
    e=np.exp(-lt*46)
    return ((np.sin(2*np.pi*1750*lt)*0.5+rng.normal(0,0.25,L))*e).astype(np.float32)
def thump():
    L=int(0.55*SR); lt=np.arange(L,dtype=np.float32)/SR
    e=np.exp(-lt*6.2)
    f=np.linspace(112,52,L)
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*e).astype(np.float32)
def ding():
    L=int(0.9*SR); lt=np.arange(L,dtype=np.float32)/SR
    e=np.exp(-lt*4.0)
    return ((np.sin(2*np.pi*1320*lt)+0.5*np.sin(2*np.pi*1980*lt))*e*0.5).astype(np.float32)
def whoosh():
    L=int(0.45*SR); lt=np.arange(L,dtype=np.float32)/SR
    e=np.sin(np.pi*lt/lt[-1])**2
    return (rng.normal(0,1,L).astype(np.float32)*e*0.34)

TICK,THUMP,DING,WHOOSH=tick(),thump(),ding(),whoosh()
for b_ in D["beats"]:
    place(sfx,b_["time"],TICK,0.32)
    if b_["kind"]=="chapter": place(sfx,b_["time"],THUMP,0.62)
    if b_["kind"]=="stat":    place(sfx,b_["time"]+1.6,DING,0.30)
for e_ in D["emphasis"]:
    place(sfx,e_["time"],TICK,0.20)
for p_ in D["panels"][1:]:
    place(sfx,p_["start"]-0.25,WHOOSH,0.16)
place(sfx,D["endCardAt"],THUMP,0.55)

np.clip(music,-1,1,out=music); np.clip(sfx,-1,1,out=sfx)
(music*32767).astype(np.int16).tofile("narration/music.raw")
(sfx*32767).astype(np.int16).tofile("narration/sfx.raw")
print("music/sfx written", N/SR, "s")

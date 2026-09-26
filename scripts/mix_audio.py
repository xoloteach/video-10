import numpy as np, subprocess, wave
from pathlib import Path
SR = 48000
subprocess.run(["ffmpeg","-y","-i","narration/voiceover.mp3","-ar",str(SR),"-ac","1","-c:a","pcm_s16le","scratch/voice.wav","-loglevel","error"], check=True)
def rd(p):
    with wave.open(p,"rb") as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768.0
voice = rd("scratch/voice.wav"); bgm = rd("scratch/bgm.wav"); sfx = rd("scratch/sfx.wav")
N = len(voice); print("voice", N/SR, "s  bgm", len(bgm)/SR, "sfx", len(sfx)/SR)
def fit(a): return a[:N] if len(a)>=N else np.pad(a,(0,N-len(a)))
bgm = fit(bgm); sfx = fit(sfx)
B = 480; nb = N//B
env = np.abs(voice[:nb*B]).reshape(nb,B).max(axis=1)
e = np.empty(nb, dtype=np.float32); prev = 0.0
for i in range(nb):
    c = 0.55 if env[i] > prev else 0.06
    prev = prev + c*(env[i]-prev); e[i] = prev
e = np.clip(e/(np.percentile(e,97)+1e-6), 0, 1)
duck = (1.0 - 0.62*np.repeat(e, B)).astype(np.float32)
duck = np.pad(duck, (0, N-len(duck)))
mix = voice + bgm*duck*0.85 + sfx
mix = mix/max(float(np.max(np.abs(mix))),1.0)*0.95
with wave.open("scratch/mix_raw.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix,-1,1)*32767).astype(np.int16).tobytes())
print("mix_raw.wav written", N/SR, "s")

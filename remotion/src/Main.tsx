import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, Easing, continueRender, delayRender} from 'remotion';
import data from './data.json';
import {C, FONT, fontCss, ease} from './theme';
import {REGISTRY} from './Graphics';

const FPS = data.fps;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/* deterministic pseudo random */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- camera ---------- */
type Shot = {z0: number; z1: number; x0: number; x1: number; y0: number; y1: number};
const makeShots = (i: number): [Shot, Shot] => {
  const dir = i % 2 === 0 ? 1 : -1;
  const a: Shot = {
    z0: 1.06 + rnd(i, 1) * 0.05,
    z1: 1.15 + rnd(i, 2) * 0.06,
    x0: dir * (1.2 + rnd(i, 3) * 1.8),
    x1: dir * (-1.4 - rnd(i, 4) * 1.8),
    y0: -0.8 + rnd(i, 5) * 1.6,
    y1: 0.9 - rnd(i, 6) * 1.6,
  };
  const b: Shot = {
    z0: 1.22 + rnd(i, 7) * 0.08,
    z1: 1.11 + rnd(i, 8) * 0.06,
    x0: -dir * (2.6 + rnd(i, 9) * 2.0),
    x1: -dir * (0.6 + rnd(i, 10) * 1.2),
    y0: 1.6 - rnd(i, 11) * 2.4,
    y1: -1.2 + rnd(i, 12) * 2.0,
  };
  return [a, b];
};

const PanelLayer: React.FC<{p: any; i: number; f: number; push: number}> = ({p, i, f, push}) => {
  const s = p.start * FPS, e = p.end * FPS;
  const FADE = 18;
  if (f < s - FADE || f > e + 2) return null;
  const opacity = clamp01((f - (s - FADE)) / FADE);

  const [A, B] = makeShots(i);
  const len = e - s;
  const cut = s + len * 0.54;
  const inA = f < cut;
  const sh = inA ? A : B;
  const t0 = inA ? s : cut;
  const t1 = inA ? cut : e;
  const k = clamp01((f - t0) / Math.max(1, t1 - t0));
  const ez = Easing.bezier(0.33, 0, 0.25, 1)(k);

  let z = sh.z0 + (sh.z1 - sh.z0) * ez;
  let x = sh.x0 + (sh.x1 - sh.x0) * ez;
  const y = sh.y0 + (sh.y1 - sh.y0) * ez;
  z *= 1 + 0.17 * push;
  x -= 9.5 * push;
  // tiny settle on the sub-shot cut
  const settle = inA ? 1 : 1 + 0.016 * Math.exp(-(f - cut) / 7);

  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      <Img
        src={staticFile(p.src.replace('panels/', 'panels/'))}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${(z * settle).toFixed(4)}) translate(${x.toFixed(3)}%, ${y.toFixed(3)}%)`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- captions ---------- */
type Line = {s: number; e: number; words: {w: string; s: number; e: number}[]};
const buildLines = (): Line[] => {
  const out: Line[] = [];
  let cur: any[] = [];
  for (const w of data.words as any[]) {
    cur.push(w);
    const last = w.w.trim();
    const long = cur.length >= 7;
    const punct = /[.,!?;:]$/.test(last);
    const gapNext = false;
    if (long || (punct && cur.length >= 4)) {
      out.push({s: cur[0].s, e: cur[cur.length - 1].e, words: cur});
      cur = [];
    }
  }
  if (cur.length) out.push({s: cur[0].s, e: cur[cur.length - 1].e, words: cur});
  return out;
};

const Captions: React.FC<{f: number}> = ({f}) => {
  const lines = useMemo(buildLines, []);
  const t = f / FPS;
  const li = lines.findIndex((l) => t >= l.s - 0.08 && t <= l.e + 0.22);
  if (li < 0) return null;
  const L = lines[li];
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 74}}>
      <div style={{
        maxWidth: 1480, textAlign: 'center', lineHeight: 1.28,
        fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: -0.2,
        textShadow: '0 2px 10px rgba(255,255,255,0.85), 0 0 22px rgba(255,255,255,0.7), 0 1px 0 rgba(255,255,255,1)',
      }}>
        {L.words.map((w, i) => {
          const on = t >= w.s - 0.02 && t <= w.e + 0.03;
          return (
            <span key={i} style={{color: on ? C.accent : C.ink, marginRight: 13}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- kinetic emphasis ---------- */
const Emphasis: React.FC<{f: number; em: any}> = ({f, em}) => {
  const lt = f - em.time * FPS;
  const len = em.dur * FPS;
  const o = Math.min(seg(lt, 0, 7), 1 - seg(lt, len - 9, len));
  const k = ease(lt, FPS);
  const words = String(em.text).split(' ');
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{
        width: '100%', background: `rgba(247,244,238,${0.93 * o})`,
        borderTop: `1px solid rgba(34,32,28,${0.12 * o})`,
        borderBottom: `1px solid rgba(34,32,28,${0.12 * o})`,
        padding: '40px 90px', boxSizing: 'border-box',
      }}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px'}}>
          {words.map((w, i) => {
            const wk = ease(lt, FPS, i * 1.8);
            return (
              <span key={i} style={{
                fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.ink,
                textTransform: 'uppercase', letterSpacing: -1, lineHeight: 1.12,
                transform: `translateY(${(1 - wk) * 24}px)`, opacity: wk * o,
                display: 'inline-block',
              }}>{w}</span>
            );
          })}
        </div>
        <div style={{width: 200 * k, height: 4, background: C.accent, margin: '22px auto 0',
          opacity: o, borderRadius: 2}} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- chrome ---------- */
const Chrome: React.FC<{f: number; total: number}> = ({f, total}) => {
  const p = f / total;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(40,32,22,0.16) 100%)',
      }} />
      <AbsoluteFill style={{
        backgroundImage: `url(${staticFile('noise.png')})`,
        backgroundSize: '256px 256px', opacity: 0.05, mixBlendMode: 'multiply',
      }} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 5, width: `${p * 100}%`,
        background: C.accent, opacity: 0.85}} />
      <div style={{position: 'absolute', left: 54, top: 46, fontFamily: FONT, fontWeight: 800,
        fontSize: 19, letterSpacing: 4.5, color: 'rgba(34,32,28,0.42)'}}>WHY WE BECOME</div>
    </AbsoluteFill>
  );
};

/* ---------- end card ---------- */
const EndCard: React.FC<{f: number}> = ({f}) => {
  const s = data.endCardAt * FPS;
  if (f < s) return null;
  const lt = f - s;
  const k = ease(lt, FPS, 4);
  const o = seg(lt, 0, 20);
  return (
    <AbsoluteFill style={{background: `rgba(247,244,238,${o})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center', opacity: o}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 104, color: C.ink, letterSpacing: -2.5,
          transform: `translateY(${(1 - k) * 30}px)`}}>Why We Become</div>
        <div style={{width: 520 * k, height: 5, background: C.accent, margin: '26px auto', borderRadius: 3}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.inkSoft, letterSpacing: 6,
          opacity: seg(lt, 22, 46)}}>THINK DEEPER · LIVE BETTER · BECOME MORE</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- main ---------- */
export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / FPS;

  const beat = (data.beats as any[]).find((b) => t >= b.time && t <= b.time + b.dur);
  const Beat = beat ? REGISTRY[beat.kind] : null;
  const endActive = t >= data.endCardAt;

  const BIG = new Set(['stat','checklist','streak','loop','compare','curve','wantcost',
    'overload','switch','map','bars','meter','friction','evidence','middle','momentum']);
  const isBig = !!beat && BIG.has(beat.kind) && !endActive;
  const bt = beat ? f - beat.time * FPS : 0;
  const bl = beat ? beat.dur * FPS : 1;
  const push = isBig
    ? Math.min(ease(bt, FPS), 1 - seg(bt, bl - 16, bl))
    : 0;

  const em = beat || endActive
    ? null
    : (data.emphasis as any[]).find((x) => t >= x.time && t <= x.time + x.dur) || null;

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <style>{fontCss}</style>
      {(data.panels as any[]).map((p, i) => <PanelLayer key={i} p={p} i={i} f={f} push={push} />)}
      <Chrome f={f} total={durationInFrames} />
      {Beat && !endActive ? (
        isBig ? (
          <div style={{position: 'absolute', right: 0, top: 0, width: '54%', height: '100%',
            transform: 'scale(0.97)', transformOrigin: 'center center'}}>
            <Beat t={bt} len={bl} fps={FPS} b={beat} />
          </div>
        ) : (
          <Beat t={bt} len={bl} fps={FPS} b={beat} />
        )
      ) : null}
      {em ? <Emphasis f={f} em={em} /> : null}
      {!endActive && !em ? <Captions f={f} /> : null}
      <EndCard f={f} />
    </AbsoluteFill>
  );
};

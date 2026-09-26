import React from 'react';
import {interpolate, Easing, AbsoluteFill} from 'remotion';
import {C, FONT, Card, Label, Rule, ease, envelope} from './theme';

type P = {t: number; len: number; fps: number; b: any};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/* ---------------- CHAPTER ---------------- */
export const Chapter: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const up = ease(t, fps, 2);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: e}}>
      <div style={{background: 'rgba(247,244,238,0.90)', width: '100%', padding: '54px 0',
        borderTop: `1px solid rgba(34,32,28,0.12)`, borderBottom: `1px solid rgba(34,32,28,0.12)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 7,
          color: C.accent, marginBottom: 14, opacity: seg(t, 4, 16)}}>
          CHAPTER {b.num}
        </div>
        <div style={{overflow: 'hidden', height: 92}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 74, color: C.ink,
            letterSpacing: -1.5, transform: `translateY(${(1 - up) * 96}px)`}}>
            {b.title}
          </div>
        </div>
        <div style={{marginTop: 18}}>
          <Rule w={420} p={seg(t, 10, 34)} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- TERM ---------------- */
export const Term: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const s = ease(t, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', padding: 92}}>
      <Card style={{opacity: e, transform: `translateX(${(1 - s) * -46}px)`, marginBottom: 126}}>
        <Label>{b.label}</Label>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.paper, letterSpacing: -0.5}}>
          {b.value}
        </div>
        <div style={{marginTop: 14}}><Rule w={300} p={seg(t, 6, 26)} /></div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- STAT (count-up) ---------------- */
export const Stat: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const s = ease(t, fps);
  const p = interpolate(t, [6, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)});
  const n = Math.round(b.count * p);
  const shown = String(b.value).includes('–')
    ? `${Math.round(40 * p)}–${n}%`
    : String(b.value).includes('%') ? `${n}%` : `${n}`;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
      <Card p={40} style={{opacity: e, transform: `translateY(${(1 - s) * 34}px)`, maxWidth: 680}}>
        <Label>Key Finding</Label>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 118, color: C.gold,
            lineHeight: 1, letterSpacing: -3, fontVariantNumeric: 'tabular-nums'}}>{shown}</div>
          {b.unit ? <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.paper}}>{b.unit}</div> : null}
        </div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.paper,
          marginTop: 16, lineHeight: 1.35, opacity: seg(t, 16, 34)}}>{b.caption}</div>
        <div style={{marginTop: 16}}><Rule w={300} p={seg(t, 8, 30)} /></div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 17, color: 'rgba(247,244,238,0.62)',
          marginTop: 12, opacity: seg(t, 26, 44)}}>{b.source}</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- CHECKLIST ---------------- */
export const Checklist: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
      <Card style={{opacity: e, minWidth: 470}}>
        <Label>The Monday Plan</Label>
        {b.items.map((it: string, i: number) => {
          const a = 8 + i * 11;
          const on = seg(t, a, a + 9);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, margin: '14px 0',
              opacity: on, transform: `translateX(${(1 - on) * 26}px)`}}>
              <div style={{width: 30, height: 30, borderRadius: 7, border: `2px solid ${C.sage}`,
                background: on > 0.85 ? C.sage : 'transparent', display: 'flex',
                alignItems: 'center', justifyContent: 'center'}}>
                <div style={{color: C.card, fontWeight: 900, fontSize: 19,
                  opacity: seg(t, a + 6, a + 10)}}>✓</div>
              </div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.paper}}>{it}</div>
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- STREAK CALENDAR ---------------- */
export const Streak: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const N = 28, BREAK = 11;
  const fillEnd = 62;
  const greyP = seg(t, fillEnd + 16, fillEnd + 40);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={38}>
        <Label>The Streak</Label>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 62px)', gap: 11, marginTop: 6}}>
          {Array.from({length: N}).map((_, i) => {
            const a = 6 + i * 1.9;
            const on = seg(t, a, a + 6);
            const broken = i === BREAK;
            const after = i > BREAK;
            const base = broken ? C.red : C.sage;
            const grey = after ? 1 : greyP;
            const col = broken ? C.red : `rgba(126,148,120,${(1 - greyP) * 0.95 + 0.05})`;
            return (
              <div key={i} style={{
                width: 62, height: 46, borderRadius: 8,
                border: `2px solid rgba(247,244,238,0.18)`,
                background: after ? `rgba(90,85,76,${on * 0.5})` : col,
                opacity: on ? 1 : 0.18,
                transform: `scale(${0.8 + on * 0.2})`,
              }} />
            );
          })}
        </div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.red,
          marginTop: 22, opacity: seg(t, fillEnd, fillEnd + 12)}}>
          One missed day → "I already messed up."
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- MONDAY LOOP ---------------- */
export const Loop: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const rot = interpolate(t, [0, len], [0, 400], {easing: Easing.in(Easing.quad)});
  const R = 132;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={40}>
        <div style={{display: 'flex', alignItems: 'center', gap: 44}}>
          <svg width={330} height={330} viewBox="0 0 330 330">
            <circle cx={165} cy={165} r={R} fill="none" stroke="rgba(247,244,238,0.16)" strokeWidth={14} />
            <circle cx={165} cy={165} r={R} fill="none" stroke={C.accent} strokeWidth={14}
              strokeLinecap="round" strokeDasharray={2 * Math.PI * R}
              strokeDashoffset={2 * Math.PI * R * (1 - clamp01(t / 40))}
              transform="rotate(-90 165 165)" />
            <g transform={`rotate(${rot} 165 165)`}>
              <circle cx={165} cy={165 - R} r={17} fill={C.gold} />
            </g>
            <text x={165} y={158} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={34} fill={C.paper}>MON</text>
            <text x={165} y={196} textAnchor="middle" fontFamily={FONT} fontWeight={700}
              fontSize={20} fill="rgba(247,244,238,0.55)">start again</text>
          </svg>
          <div>
            {['New plan', 'New motivation', 'New version of you', 'Same result'].map((s, i) => {
              const a = 14 + i * 13;
              const on = seg(t, a, a + 10);
              return (
                <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 32,
                  color: i === 3 ? C.red : C.paper, opacity: on, margin: '12px 0',
                  transform: `translateX(${(1 - on) * 22}px)`}}>
                  {i === 3 ? '→ ' : '· '}{s}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- COMPARE ---------------- */
export const Compare: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const l = ease(t, fps, 2), r = ease(t, fps, 10);
  const box = (title: string, sub: string, k: number, col: string) => (
    <Card p={34} style={{width: 430, transform: `translateX(${(1 - k) * (col === C.accent ? -60 : 60)}px)`}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: col, letterSpacing: 1}}>{title}</div>
      <div style={{marginTop: 12}}><Rule w={200} p={k} color={col} /></div>
      <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 27, color: C.paper, marginTop: 14}}>{sub}</div>
    </Card>
  );
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: e}}>
      <div style={{display: 'flex', gap: 34, alignItems: 'center'}}>
        {box(b.left, b.leftSub, l, C.accent)}
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: 'rgba(34,32,28,0.45)'}}>vs</div>
        {box(b.right, b.rightSub, r, C.sage)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- DECAY CURVE ---------------- */
export const Curve: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const W = 620, H = 300;
  const p = seg(t, 8, 66);
  const path = (fn: (x: number) => number) => {
    let d = '';
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * W, y = H - fn(i / 60) * H;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    return d;
  };
  const mot = path((x) => 0.15 + 0.8 * Math.exp(-4.2 * x) * (x < 0.06 ? x / 0.06 : 1));
  const sys = path((x) => 0.18 + 0.42 * x);
  const L = 1400;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={40}>
        <Label>What actually happens</Label>
        <svg width={W} height={H + 30} viewBox={`0 0 ${W} ${H + 30}`}>
          <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(247,244,238,0.22)" strokeWidth={2} />
          <path d={mot} fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
          <path d={sys} fill="none" stroke={C.sage} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={L} strokeDashoffset={L * (1 - clamp01(p * 0.92))} />
          <text x={8} y={H + 24} fontFamily={FONT} fontWeight={700} fontSize={18}
            fill="rgba(247,244,238,0.5)">day 1</text>
          <text x={W - 64} y={H + 24} fontFamily={FONT} fontWeight={700} fontSize={18}
            fill="rgba(247,244,238,0.5)">day 60</text>
        </svg>
        <div style={{display: 'flex', gap: 28, marginTop: 10}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.accent}}>■ {b.a}</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.sage}}>■ {b.b}</div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- WANT / COST ---------------- */
export const WantCost: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={42}>
        <Label>The trade we avoid</Label>
        {b.pairs.map(([w, c]: [string, string], i: number) => {
          const a = 8 + i * 16;
          const on = seg(t, a, a + 10), on2 = seg(t, a + 8, a + 18);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 14, margin: '12px 0'}}>
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.paper,
                opacity: on, transform: `translateX(${(1 - on) * 20}px)`, display: 'inline-block'}}>
                We want {w}
              </span>
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.red, opacity: on2}}>
                without {c}
              </span>
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- OVERLOAD ---------------- */
export const Overload: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const collapse = seg(t, 150, 190);
  const shake = t > 140 && t < 195 ? Math.sin(t * 1.5) * 5 * (1 - collapse) : 0;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e, transform: `translateX(${shake}px)`, maxWidth: 900}} p={40}>
        <Label>Change everything, at once</Label>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8}}>
          {b.items.map((it: string, i: number) => {
            const a = 6 + i * 6;
            const on = seg(t, a, a + 6);
            return (
              <div key={i} style={{padding: '12px 20px', borderRadius: 999,
                border: `2px solid ${C.accent}`, background: 'rgba(200,98,60,0.14)',
                fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.paper,
                opacity: on * (1 - collapse * 0.85),
                transform: `scale(${0.7 + on * 0.3}) translateY(${collapse * 40}px)`}}>
                {it}
              </div>
            );
          })}
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.red, marginTop: 22,
          opacity: seg(t, 186, 206)}}>…then life happens.</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- ALL / NOTHING SWITCH ---------------- */
export const Switch: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const flips = [22, 48, 74, 96];
  const on = flips.filter((f) => t > f).length % 2 === 0;
  const k = ease(t, fps, 4);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e, transform: `scale(${0.94 + k * 0.06})`}} p={44}>
        <Label>All-or-nothing</Label>
        <div style={{display: 'flex', alignItems: 'center', gap: 32}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56,
            color: on ? C.sage : 'rgba(247,244,238,0.22)'}}>ALL</div>
          <div style={{width: 148, height: 68, borderRadius: 999, background: 'rgba(247,244,238,0.12)',
            border: `2px solid rgba(247,244,238,0.2)`, position: 'relative'}}>
            <div style={{position: 'absolute', top: 6, left: on ? 8 : 84, width: 52, height: 52,
              borderRadius: 999, background: on ? C.sage : C.red, transition: 'none'}} />
          </div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56,
            color: !on ? C.red : 'rgba(247,244,238,0.22)'}}>NOTHING</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: 'rgba(247,244,238,0.7)',
          marginTop: 18, textAlign: 'center'}}>There is no middle setting.</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- WRONG TURN MAP ---------------- */
export const MapTurn: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const main = 'M 40 250 C 150 250 190 150 300 150 C 390 150 420 90 520 90';
  const wrong = 'M 300 150 C 340 210 380 250 470 262';
  const fix = 'M 470 262 C 430 232 420 170 512 100';
  const p1 = seg(t, 6, 48), p2 = seg(t, 46, 78), p3 = seg(t, 92, 132);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={40}>
        <Label>You don't walk home</Label>
        <svg width={620} height={310} viewBox="-10 0 620 310">
          <path d={main} fill="none" stroke={C.sage} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={700} strokeDashoffset={700 * (1 - p1)} />
          <path d={wrong} fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={320} strokeDashoffset={320 * (1 - p2)} />
          <path d={fix} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={330} strokeDashoffset={330 * (1 - p3)} />
          <circle cx={40} cy={250} r={9} fill={C.paper} />
          <circle cx={520} cy={90} r={11} fill={C.gold} opacity={p1} />
          <text x={300} y={288} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22}
            fill={C.red} opacity={seg(t, 60, 80)}>wrong turn</text>
          <text x={470} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22}
            fill={C.gold} opacity={seg(t, 118, 140)}>correct, continue</text>
        </svg>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- BEST vs WORST BARS ---------------- */
export const Bars: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={42}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 18}}>
          <Label>Best day</Label><Label color={C.sage}>Worst day</Label>
        </div>
        {b.rows.map(([name, best, worst]: string[], i: number) => {
          const a = 8 + i * 18;
          const g1 = seg(t, a, a + 16), g2 = seg(t, a + 10, a + 28);
          return (
            <div key={i} style={{margin: '18px 0'}}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, color: 'rgba(247,244,238,0.6)',
                marginBottom: 8, letterSpacing: 2}}>{name.toUpperCase()}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
                <div style={{height: 34, width: 360 * g1, background: C.accent, borderRadius: 6}} />
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.paper, opacity: g1}}>{best}</div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{height: 34, width: 120 * g2, background: C.sage, borderRadius: 6}} />
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.paper, opacity: g2}}>{worst}</div>
              </div>
            </div>
          );
        })}
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 25, color: C.gold, marginTop: 10,
          opacity: seg(t, 70, 92)}}>The small version still counts.</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- AUTOMATICITY METER ---------------- */
export const Meter: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const p = interpolate(t, [8, 70], [0, 0.92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)});
  const ang = -90 + p * 180;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={40}>
        <Label>{b.label}</Label>
        <svg width={420} height={250} viewBox="0 0 420 250">
          <path d="M 40 210 A 170 170 0 0 1 380 210" fill="none"
            stroke="rgba(247,244,238,0.15)" strokeWidth={26} strokeLinecap="round" />
          <path d="M 40 210 A 170 170 0 0 1 380 210" fill="none" stroke={C.sage} strokeWidth={26}
            strokeLinecap="round" strokeDasharray={534} strokeDashoffset={534 * (1 - p)} />
          <g transform={`rotate(${ang} 210 210)`}>
            <line x1={210} y1={210} x2={210} y2={78} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
          </g>
          <circle cx={210} cy={210} r={14} fill={C.paper} />
          <text x={44} y={244} fontFamily={FONT} fontWeight={700} fontSize={19} fill="rgba(247,244,238,0.5)">effort</text>
          <text x={306} y={244} fontFamily={FONT} fontWeight={700} fontSize={19} fill="rgba(247,244,238,0.5)">automatic</text>
        </svg>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.paper, textAlign: 'center',
          opacity: seg(t, 46, 68)}}>You stop negotiating with yourself.</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- FRICTION ---------------- */
export const Friction: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={42}>
        <Label>Remove the friction</Label>
        {b.items.map(([bad, good]: [string, string], i: number) => {
          const a = 10 + i * 22;
          const g = seg(t, a, a + 12), h = seg(t, a + 12, a + 26);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, margin: '16px 0'}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 27, color: C.red, opacity: g,
                textDecoration: h > 0.5 ? 'line-through' : 'none', minWidth: 330}}>{bad}</div>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 27, color: C.gold, opacity: h}}>→</div>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 27, color: C.sage, opacity: h,
                transform: `translateX(${(1 - h) * 18}px)`}}>{good}</div>
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- EVIDENCE STACK ---------------- */
export const Evidence: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const N = 24;
  const shown = Math.min(N, Math.floor(seg(t, 8, 130) * N));
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={40}>
        <Label>Evidence stacking</Label>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 9, height: 190, marginTop: 10}}>
          {Array.from({length: N}).map((_, i) => {
            const on = i < shown ? 1 : 0;
            const h = 26 + i * 6.4;
            return <div key={i} style={{width: 22, height: h * on, background: i % 4 === 3 ? C.gold : C.sage,
              borderRadius: 4, opacity: on}} />;
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 20}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 58, color: C.gold,
            fontVariantNumeric: 'tabular-nums'}}>{shown}</div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 27, color: C.paper}}>
            kept promises → "I am someone who keeps going."</div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- THE MIDDLE ---------------- */
export const Middle: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const W = 760;
  const pos = interpolate(t, [10, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={42}>
        <div style={{position: 'relative', width: W, height: 92}}>
          <div style={{position: 'absolute', top: 38, width: W, height: 14, borderRadius: 8,
            background: 'rgba(247,244,238,0.14)'}} />
          <div style={{position: 'absolute', top: 38, left: W * 0.22, width: W * 0.56, height: 14,
            borderRadius: 8, background: 'rgba(200,98,60,0.55)', opacity: seg(t, 16, 40)}} />
          <div style={{position: 'absolute', top: 24, left: W * pos - 14, width: 42, height: 42,
            borderRadius: 999, background: C.gold, border: `4px solid ${C.card}`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', width: W}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.sage}}>BEGINNING<br/>
            <span style={{fontWeight: 600, fontSize: 19, color: 'rgba(247,244,238,0.55)'}}>exciting</span></div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.accent, textAlign: 'center'}}>
            THE MIDDLE<br/>
            <span style={{fontWeight: 600, fontSize: 19, color: 'rgba(247,244,238,0.55)'}}>quiet · invisible · where most leave</span></div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.sage, textAlign: 'right'}}>RESULT<br/>
            <span style={{fontWeight: 600, fontSize: 19, color: 'rgba(247,244,238,0.55)'}}>exciting</span></div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- MOMENTUM ---------------- */
export const Momentum: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const p = interpolate(t, [6, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad)});
  const W = 720;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{opacity: e}} p={42}>
        <Label>Momentum</Label>
        <div style={{position: 'relative', width: W, height: 86, marginTop: 8}}>
          <div style={{position: 'absolute', top: 34, width: W, height: 18, borderRadius: 10,
            background: 'rgba(247,244,238,0.13)'}} />
          <div style={{position: 'absolute', top: 34, width: W * p, height: 18, borderRadius: 10,
            background: C.sage}} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', top: 30 + i * 9,
              left: Math.max(0, W * p - 60 - i * 26), width: 46 - i * 10, height: 4, borderRadius: 3,
              background: C.gold, opacity: p > 0.12 ? 0.75 - i * 0.2 : 0}} />
          ))}
          <div style={{position: 'absolute', top: 16, left: W * p - 26, width: 54, height: 54,
            borderRadius: 999, background: C.gold, border: `5px solid ${C.card}`}} />
        </div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.paper, marginTop: 12}}>
          You stop needing to start over. You simply continue.
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------------- CLOSING ---------------- */
export const Closing: React.FC<P> = ({t, len, fps, b}) => {
  const e = envelope(t, len, fps);
  const k = ease(t, fps, 2);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: e}}>
      <div style={{textAlign: 'center'}}>
        <div style={{overflow: 'hidden', height: 108}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, color: C.ink,
            letterSpacing: -2, transform: `translateY(${(1 - k) * 112}px)`,
            textShadow: '0 2px 0 rgba(247,244,238,0.9)'}}>
            NOT FROM ZERO
          </div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.accent, marginTop: 10,
          opacity: seg(t, 18, 40)}}>from experience</div>
      </div>
    </AbsoluteFill>
  );
};

export const REGISTRY: Record<string, React.FC<P>> = {
  chapter: Chapter, term: Term, stat: Stat, checklist: Checklist, streak: Streak,
  loop: Loop, compare: Compare, curve: Curve, wantcost: WantCost, overload: Overload,
  switch: Switch, map: MapTurn, bars: Bars, meter: Meter, friction: Friction,
  evidence: Evidence, middle: Middle, momentum: Momentum, closing: Closing,
};

import React from 'react';
import {
  AbsoluteFill, Img, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

type CueType = 'STAT' | 'TERM' | 'ARROW' | 'CHART';
export type Cue = { type: CueType; value: string; time: number; label?: string };
export type Panel = { src: string; start: number; duration: number };
export type Paper = { src: string; time: number; duration: number; credit: string; highlightY: number; highlightW: number };
export type Archival = { src: string; time: number; duration: number; credit: string };
export type Props = {
  fps: number; durationInFrames: number; duration: number;
  panels: Panel[]; cues: Cue[]; papers: Paper[]; archival: Archival[];
  endCardAt: number; endCardTitle: string; endCardLines: string[];
};

const RUST = '#E05A2B';
const CYAN = '#00E5FF';
const GOLD = '#FFD000';
const INK = '#2B2D42';
const FONT = 'Montserrat, "Montserrat ExtraBold", sans-serif';
const FADE = 0.45;

const Grain: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      opacity,
      pointerEvents: 'none',
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.55'/></svg>\")",
      backgroundRepeat: 'repeat',
      mixBlendMode: 'multiply',
    }}
  />
);

const PanelLayer: React.FC<{ panels: Panel[] }> = ({ panels }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = panels.findIndex((p) => t >= p.start && t < p.start + p.duration);
  if (idx === -1) idx = t < panels[0].start ? 0 : panels.length - 1;
  const cur = panels[idx];
  const nxt = panels[idx + 1];

  const drift = (p: Panel, local: number) => {
    const prog = interpolate(local, [0, p.duration], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad),
    });
    return `scale(${1.0 + 0.045 * prog}) translate(${-20 * prog}px, ${10 * prog}px)`;
  };

  const outOpacity = nxt
    ? interpolate(t, [nxt.start - FADE, nxt.start], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#F8F5EE' }}>
      <AbsoluteFill style={{ opacity: outOpacity }}>
        <Img src={staticFile(cur.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: drift(cur, t - cur.start) }} />
      </AbsoluteFill>
      {nxt ? (
        <AbsoluteFill style={{ opacity: 1 - outOpacity }}>
          <Img src={staticFile(nxt.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: drift(nxt, 0) }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 260px rgba(43,45,66,0.20)', pointerEvents: 'none' }} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

const DotGrid: React.FC = () => (
  <div
    style={{
      position: 'absolute', inset: 0, opacity: 0.05,
      backgroundImage: `radial-gradient(${INK} 1.5px, transparent 1.5px)`,
      backgroundSize: '40px 40px', pointerEvents: 'none',
    }}
  />
);

const CueOverlay: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const DUR = 4.0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {cues.map((cue, idx) => {
        if (t < cue.time || t > cue.time + DUR) return null;
        const startFrame = cue.time * fps;
        const enter = spring({ frame: frame - startFrame, fps, config: { damping: 26, stiffness: 130 } });
        const exit = interpolate(frame, [startFrame + (DUR - 0.45) * fps, startFrame + DUR * fps], [1, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const opacity = enter * exit;
        const ty = (1 - enter) * 26;

        if (cue.type === 'STAT') {
          return (
            <div key={idx} style={{
              position: 'absolute', left: 120, bottom: 190, transform: `translateY(${ty}px)`, opacity,
              backgroundColor: 'rgba(17,19,24,0.94)', border: '1px solid rgba(255,255,255,0.12)',
              borderLeft: `5px solid ${RUST}`, boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              padding: '20px 34px', borderRadius: 6, fontFamily: FONT,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: RUST, letterSpacing: 2.5, textTransform: 'uppercase' }}>{cue.label || 'Key Finding'}</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#FFFFFF', marginTop: 4, letterSpacing: -1 }}>{cue.value}</div>
            </div>
          );
        }
        if (cue.type === 'TERM') {
          return (
            <div key={idx} style={{
              position: 'absolute', right: 120, top: 150, transform: `translateY(${-ty}px)`, opacity,
              backgroundColor: 'rgba(17,19,24,0.94)', border: '1px solid rgba(255,255,255,0.12)',
              borderRight: `5px solid ${CYAN}`, padding: '16px 30px', borderRadius: 6,
              fontFamily: FONT, color: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.30)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: CYAN, letterSpacing: 2, textTransform: 'uppercase' }}>Mechanism</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{cue.value}</div>
            </div>
          );
        }
        if (cue.type === 'ARROW') {
          const L = 300;
          return (
            <svg key={idx} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}>
              <path d="M 700 760 Q 960 690 1230 742" fill="none" stroke={GOLD} strokeWidth={5}
                strokeDasharray={L} strokeDashoffset={L * (1 - enter)} strokeLinecap="round" />
              <path d="M 1230 742 L 1190 716 M 1230 742 L 1186 764" fill="none" stroke={GOLD} strokeWidth={5}
                strokeLinecap="round" opacity={enter} />
              <circle cx={700} cy={760} r={7} fill={GOLD} opacity={enter} />
            </svg>
          );
        }
        return null;
      })}
    </AbsoluteFill>
  );
};

const PaperReveal: React.FC<{ papers: Paper[] }> = ({ papers }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {papers.map((p, idx) => {
        if (t < p.time || t > p.time + p.duration) return null;
        const local = frame - p.time * fps;
        const dur = p.duration * fps;
        const enter = spring({ frame: local, fps, config: { damping: 22, stiffness: 100 } });
        const exit = interpolate(local, [dur - 0.5 * fps, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const op = enter * exit;
        const hw = interpolate(local, [0.7 * fps, 1.7 * fps], [0, p.highlightW], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <AbsoluteFill key={idx} style={{ backgroundColor: 'rgba(10,11,14,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op }}>
            <div style={{
              width: 1340, height: 754, position: 'relative',
              transform: `perspective(1100px) rotateX(${7 * (1 - enter)}deg) rotateY(${-5 * (1 - enter)}deg) scale(${0.92 + 0.08 * enter})`,
              boxShadow: '0 40px 80px rgba(0,0,0,0.65)', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF',
            }}>
              <Img src={staticFile(p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              <div style={{ position: 'absolute', left: 120, top: p.highlightY, height: 34, width: hw, backgroundColor: 'rgba(255,225,0,0.42)', mixBlendMode: 'multiply', borderRadius: 3 }} />
            </div>
            <div style={{
              position: 'absolute', right: 90, bottom: 70, opacity: enter, backgroundColor: 'rgba(15,17,21,0.94)',
              borderLeft: `4px solid ${CYAN}`, padding: '12px 22px', borderRadius: 4, fontFamily: FONT,
              color: '#E8E8E8', fontSize: 17, letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: 700, maxWidth: 900,
            }}>{p.credit}</div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const ArchivalLayer: React.FC<{ items: Archival[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {items.map((a, idx) => {
        if (t < a.time || t > a.time + a.duration) return null;
        const local = frame - a.time * fps;
        const dur = a.duration * fps;
        const op = interpolate(local, [0, 0.5 * fps, dur - 0.5 * fps, dur], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const zoom = interpolate(local, [0, dur], [1.0, 1.07], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
        return (
          <AbsoluteFill key={idx} style={{ opacity: op }}>
            <Img src={staticFile(a.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
            <AbsoluteFill style={{ backgroundColor: 'rgba(20,18,14,0.34)' }} />
            <Grain opacity={0.16} />
            <div style={{
              position: 'absolute', left: 90, bottom: 220, backgroundColor: 'rgba(15,17,21,0.9)',
              borderLeft: `4px solid ${GOLD}`, padding: '10px 20px', borderRadius: 4, fontFamily: FONT,
              color: '#E8E8E8', fontSize: 16, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700,
            }}>{a.credit}</div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ at: number; title: string; lines: string[] }> = ({ at, title, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < at) return null;
  const local = frame - at * fps;
  const op = interpolate(local, [0, 0.7 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rise = (1 - interpolate(local, [0, 0.9 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })) * 22;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0D11', opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <DotGrid />
      <div style={{ textAlign: 'center', fontFamily: FONT, transform: `translateY(${rise}px)` }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: RUST, letterSpacing: 7, textTransform: 'uppercase' }}>Subscribe</div>
        <div style={{ fontSize: 104, fontWeight: 900, color: '#FFFFFF', letterSpacing: -2, marginTop: 14 }}>{title}</div>
        <div style={{ width: 120, height: 5, backgroundColor: RUST, margin: '30px auto 34px' }} />
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 34, fontWeight: 700, color: '#C9CDD6', letterSpacing: 1, marginTop: i ? 14 : 0 }}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const ExplainerVideo: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0D11' }}>
      <PanelLayer panels={props.panels} />
      <DotGrid />
      <CueOverlay cues={props.cues} />
      <ArchivalLayer items={props.archival} />
      <PaperReveal papers={props.papers} />
      <EndCard at={props.endCardAt} title={props.endCardTitle} lines={props.endCardLines} />
    </AbsoluteFill>
  );
};

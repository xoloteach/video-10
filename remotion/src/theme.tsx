import React from 'react';
import {interpolate, spring, Easing} from 'remotion';
import {staticFile} from 'remotion';

export const C = {
  paper: '#F7F4EE',
  ink: '#22201C',
  inkSoft: '#5A554C',
  accent: '#C8623C',
  sage: '#7E9478',
  gold: '#E8B33A',
  card: '#16150F',
  cardEdge: 'rgba(255,255,255,0.10)',
  red: '#B4462F',
};

export const FONT = 'Montserrat';

export const fontCss = `
@font-face{font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-600.ttf')}') format('truetype');font-weight:600;font-display:block}
@font-face{font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-700.ttf')}') format('truetype');font-weight:700;font-display:block}
@font-face{font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-800.ttf')}') format('truetype');font-weight:800;font-display:block}
@font-face{font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-900.ttf')}') format('truetype');font-weight:900;font-display:block}
`;

/** critically damped entrance 0->1 */
export const ease = (f: number, fps: number, delay = 0) =>
  spring({frame: f - delay, fps, config: {damping: 200, mass: 0.6, stiffness: 120}});

/** in/out envelope for a beat: t = frames since beat start, len = beat length in frames */
export const envelope = (t: number, len: number, fps: number) => {
  const inn = ease(t, fps);
  const out = interpolate(t, [len - 14, len], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  return Math.min(inn, out);
};

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  p?: number;
}> = ({children, style, p = 34}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.cardEdge}`,
      borderRadius: 18,
      padding: p,
      boxShadow: '0 18px 44px rgba(20,16,10,0.34)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = C.gold,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 19,
      letterSpacing: 3.2,
      textTransform: 'uppercase',
      color,
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

/** wipe-in rule */
export const Rule: React.FC<{w: number; p: number; color?: string; h?: number}> = ({
  w,
  p,
  color = C.accent,
  h = 3,
}) => <div style={{width: w * p, height: h, background: color, borderRadius: 2}} />;

import React from 'react';

// 手绘风格的基础图元：线条每秒"抖动"12 次（boil），让画面一直是活的
export const INK = '#2B2420';
export const PAL = {
  paper: '#F3EBDD',
  ground: '#E6D7BD',
  hillFar: '#E2DCCB',
  hillNear: '#D6DFC8',
  saver: '#E07B4F',
  biz: '#5B8FD9',
  gold: '#F2B33D',
  goldDark: '#B97F14',
  plus: '#3E9E73',
  wall: '#C9B497',
  roof: '#8E7462',
  window: '#5A4E45',
  light: '#FFD866',
  smoke: '#D3CABE',
  sweat: '#7FB7E8',
  heart: '#E5577A',
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const backOut = (t: number) => {
  const c1 = 1.9;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const boil = (frame: number) => Math.floor(frame / 2.5);

const jit = (seed: number, i: number, amp: number) => (hash(seed * 97.31 + i * 13.77) - 0.5) * 2 * amp;
const pathOf = (pts: [number, number][], seed: number, amp: number, close = true) =>
  'M' +
  pts.map(([x, y], i) => `${(x + jit(seed, i * 2, amp)).toFixed(1)},${(y + jit(seed, i * 2 + 1, amp)).toFixed(1)}`).join(' L') +
  (close ? ' Z' : '');

export const wobRect = (x: number, y: number, w: number, h: number, amp: number, seed: number) => {
  const nx = Math.max(2, Math.round(w / 28));
  const ny = Math.max(2, Math.round(h / 28));
  const pts: [number, number][] = [];
  for (let i = 0; i < nx; i++) pts.push([x + (w * i) / nx, y]);
  for (let i = 0; i < ny; i++) pts.push([x + w, y + (h * i) / ny]);
  for (let i = 0; i < nx; i++) pts.push([x + w - (w * i) / nx, y + h]);
  for (let i = 0; i < ny; i++) pts.push([x, y + h - (h * i) / ny]);
  return pathOf(pts, seed, amp);
};

export const wobEllipse = (cx: number, cy: number, rx: number, ry: number, amp: number, seed: number, n = 20) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pathOf(pts, seed, amp);
};

export const wobLine = (pts: [number, number][], amp: number, seed: number) => pathOf(pts, seed, amp, false);

// 一枚金币：flip 控制翻转（宽度随 cos 变化），plus 表示"回报"
export const Coin: React.FC<{x: number; y: number; r?: number; flip?: number; seed: number; plus?: boolean; frame: number}> = ({
  x,
  y,
  r = 26,
  flip = 0,
  seed,
  plus,
  frame,
}) => {
  const k = Math.max(0.18, Math.abs(Math.cos(flip)));
  const s = seed + boil(frame) * 7;
  return (
    <g transform={`translate(${x},${y}) scale(${k},1)`}>
      <path d={wobEllipse(0, 0, r, r, 1.2, s)} fill={PAL.gold} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={wobEllipse(0, 0, r * 0.62, r * 0.62, 1, s + 3)} fill="none" stroke={PAL.goldDark} strokeWidth={3} />
      {plus && (
        <path d={`M${-r * 0.3},0 L${r * 0.3},0 M0,${-r * 0.3} L0,${r * 0.3}`} stroke={PAL.plus} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

// 一堆叠起来的金币
export const Pile: React.FC<{x: number; y: number; n: number; frame: number; seed: number; pop?: number}> = ({x, y, n, frame, seed, pop = 0}) => {
  const items = [];
  for (let i = 0; i < n; i++) {
    const dx = (hash(seed + i) - 0.5) * 14;
    const top = i === n - 1;
    const sy = top ? 1 + 0.25 * pop : 1;
    items.push(
      <g key={i} transform={`translate(${x + dx},${y - 10 - i * 13}) scale(1,${sy})`}>
        <path d={wobEllipse(0, 0, 38, 12, 1.2, seed * 31 + i * 5 + boil(frame))} fill={PAL.gold} stroke={INK} strokeWidth={4} />
      </g>,
    );
  }
  return <g>{items}</g>;
};

export const Sparkle: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <path
    transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}
    d="M0,-20 Q3,-3 20,0 Q3,3 0,20 Q-3,3 -20,0 Q-3,-3 0,-20 Z"
    fill={PAL.light}
    stroke={INK}
    strokeWidth={3 / Math.max(s, 0.01)}
    strokeLinejoin="round"
  />
);

export const Heart: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <path
    transform={`translate(${x},${y}) scale(${s})`}
    d="M0,8 C-14,-4 -12,-16 -4,-16 C-1,-16 0,-13 0,-11 C0,-13 1,-16 4,-16 C12,-16 14,-4 0,8 Z"
    fill={PAL.heart}
    stroke={INK}
    strokeWidth={2.5 / Math.max(s, 0.01)}
  />
);

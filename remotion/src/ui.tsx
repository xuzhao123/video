import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FONT} from './font';

// 场景参数：cue[i] 为第 i 段配音开始的帧，len[i] 为其时长（帧）
export type SP = {duration: number; cue: number[]; len: number[]};

export const C = {
  bg: '#0B1220',
  panel: '#141E33',
  line: '#26334F',
  text: '#E8EDF5',
  muted: '#8A97AD',
  gold: '#F5B94A',
  bond: '#3CC8B4',
  stock: '#FF7A6B',
  blue: '#5B9BFF',
};

// 0→1 淡入，可选上移
export const useAppear = (start: number, dur = 18) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

export const usePop = (start: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - start, fps, config: {damping: 14, stiffness: 120}});
};

export const Appear: React.FC<{
  at: number;
  dy?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, dy = 30, style, children}) => {
  const p = useAppear(at);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * dy}px)`, ...style}}>{children}</div>;
};

// 场景外壳：统一背景、进出场淡化
export const Scene: React.FC<{duration: number; children: React.ReactNode}> = ({duration, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text, opacity}}>
      <AbsoluteFill style={{padding: '110px 140px 120px'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SceneTitle: React.FC<{no: string; children: React.ReactNode}> = ({no, children}) => {
  const p = useAppear(0, 20);
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 28, opacity: p, marginBottom: 50}}>
      <span style={{fontSize: 34, color: C.gold, fontWeight: 700, letterSpacing: 2}}>{no}</span>
      <span style={{fontSize: 64, fontWeight: 800}}>{children}</span>
    </div>
  );
};

// 底部字幕条
export const Caption: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color = C.gold}) => {
  const p = useAppear(at, 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        bottom: 120,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        fontSize: 40,
        fontWeight: 600,
        textAlign: 'center',
        padding: '22px 36px',
        borderRadius: 18,
        background: '#1A2236',
        border: `2px solid ${color}55`,
        color: C.text,
      }}
    >
      {children}
    </div>
  );
};

export const Hl: React.FC<{c?: string; children: React.ReactNode}> = ({c = C.gold, children}) => (
  <span style={{color: c, fontWeight: 800}}>{children}</span>
);

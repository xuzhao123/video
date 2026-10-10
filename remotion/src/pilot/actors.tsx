import React from 'react';
import {INK, PAL, Heart, Sparkle, backOut, boil, hash, prog, wobEllipse, wobLine, wobRect} from './draw';

export type Emo = 'neutral' | 'worried' | 'surprised' | 'happy' | 'excited';
export type Emote = 'sweat' | 'bang' | 'stars' | 'hearts' | null;

type BlobProps = {
  frame: number;
  x: number;
  y: number; // 脚底
  u: number; // 单位尺寸，身体 10u × 6u
  color: string;
  emo: Emo;
  look?: number; // -1 左看 … 1 右看
  sq?: number; // 挤压拉伸：<1 压扁，>1 拉长
  lift?: number; // 离地高度
  tilt?: number;
  armL?: number;
  armR?: number;
  seed: number;
  phase: number; // 呼吸、眨眼的相位，避免两个角色动作同步
  changes?: number[]; // 情绪切换的帧：切换时眨眼
  emote?: Emote;
  emoteAt?: number;
};

export const Blob: React.FC<BlobProps> = (p) => {
  const {frame, u, color, emo, look = 0, lift = 0, tilt = 0, armL = 0, armR = 0, seed, phase, changes = [], emote, emoteAt = 0} = p;
  const breathe = 1 + 0.03 * Math.sin(((frame + phase) / 30) * Math.PI * 2);
  const sq = (p.sq ?? 1) * breathe;
  const s = seed + boil(frame) * 11;
  const blink = (frame + phase * 3) % 84 < 4 || changes.some((c) => Math.abs(frame - c) < 3);
  const ex = look * 0.7 * u;
  const eyeY = -5.3 * u;
  const lw = 5;

  const eye = (cx: number, k: number) => {
    if (blink) return <path key={k} d={wobLine([[cx - 0.5 * u, eyeY], [cx + 0.5 * u, eyeY]], 1, s + k)} stroke={INK} strokeWidth={lw} strokeLinecap="round" />;
    switch (emo) {
      case 'happy':
        return <path key={k} d={`M${cx - 0.55 * u},${eyeY + 0.25 * u} Q${cx},${eyeY - 0.7 * u} ${cx + 0.55 * u},${eyeY + 0.25 * u}`} stroke={INK} strokeWidth={lw + 1} fill="none" strokeLinecap="round" />;
      case 'surprised':
        return (
          <g key={k}>
            <path d={wobEllipse(cx, eyeY, 0.62 * u, 0.62 * u, 0.8, s + k)} fill="#FFF8EC" stroke={INK} strokeWidth={4} />
            <circle cx={cx + look * 0.2 * u} cy={eyeY} r={0.26 * u} fill={INK} />
          </g>
        );
      case 'excited':
        return (
          <g key={k}>
            <rect x={cx - 0.35 * u} y={eyeY - 0.85 * u} width={0.7 * u} height={1.6 * u} rx={0.3 * u} fill={INK} />
            <circle cx={cx + 0.08 * u} cy={eyeY - 0.4 * u} r={0.16 * u} fill="#FFF8EC" />
          </g>
        );
      case 'worried':
        return (
          <g key={k}>
            <rect x={cx - 0.3 * u} y={eyeY - 0.4 * u} width={0.6 * u} height={1.0 * u} rx={0.25 * u} fill={INK} />
            <path d={`M${cx - 0.6 * u},${eyeY - 1.0 * u + (k ? -0.3 * u : 0.3 * u) * 0} L${cx + 0.6 * u},${eyeY - 1.0 * u + (k ? 0.35 : -0.35) * u}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      default:
        return <rect key={k} x={cx - 0.3 * u} y={eyeY - 0.65 * u} width={0.6 * u} height={1.3 * u} rx={0.25 * u} fill={INK} />;
    }
  };

  const mx = look * 0.45 * u;
  const my = -3.7 * u;
  let mouth: React.ReactNode;
  switch (emo) {
    case 'happy':
      mouth = <path d={`M${mx - 0.9 * u},${my - 0.2 * u} Q${mx},${my + 0.9 * u} ${mx + 0.9 * u},${my - 0.2 * u}`} stroke={INK} strokeWidth={lw} fill="none" strokeLinecap="round" />;
      break;
    case 'excited':
      mouth = <path d={`M${mx - 0.9 * u},${my - 0.3 * u} L${mx + 0.9 * u},${my - 0.3 * u} Q${mx},${my + 1.2 * u} ${mx - 0.9 * u},${my - 0.3 * u} Z`} fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
      break;
    case 'surprised':
      mouth = <path d={wobEllipse(mx, my + 0.1 * u, 0.4 * u, 0.55 * u, 0.6, s + 9)} fill={INK} />;
      break;
    case 'worried':
      mouth = <path d={`M${mx - 0.8 * u},${my} q${0.27 * u},${-0.35 * u} ${0.53 * u},0 t${0.53 * u},0 t${0.53 * u},0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
      break;
    default:
      mouth = <path d={wobLine([[mx - 0.5 * u, my], [mx + 0.5 * u, my]], 0.8, s + 9)} stroke={INK} strokeWidth={lw} strokeLinecap="round" />;
  }

  // 情绪符号：弹出 + 持续小动
  const et = prog(frame, emoteAt, emoteAt + 10);
  const pop = backOut(et);
  const ey = -8.6 * u;
  const exx = 4.4 * u;
  let em: React.ReactNode = null;
  if (emote && et > 0) {
    if (emote === 'sweat') {
      const slide = ((frame - emoteAt) % 40) / 40;
      em = <path transform={`translate(${exx},${ey + 1.5 * u + slide * 12}) scale(${pop})`} d="M0,-18 Q12,0 8,8 Q0,16 -8,8 Q-12,0 0,-18 Z" fill={PAL.sweat} stroke={INK} strokeWidth={3} />;
    } else if (emote === 'bang') {
      const wob = Math.sin(frame * 0.6) * 6;
      em = (
        <g transform={`translate(${exx},${ey}) rotate(${wob}) scale(${pop})`}>
          <path d="M-7,-34 L7,-34 L4,4 L-4,4 Z" fill="#E8603C" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={0} cy={16} r={7} fill="#E8603C" stroke={INK} strokeWidth={3} />
        </g>
      );
    } else if (emote === 'stars') {
      em = (
        <g>
          <Sparkle x={exx} y={ey} s={pop * (1 + 0.15 * Math.sin(frame * 0.4))} rot={frame * 2} />
          <Sparkle x={exx + 1.6 * u} y={ey + 1.4 * u} s={pop * 0.6 * (1 + 0.2 * Math.sin(frame * 0.5 + 1))} rot={-frame * 3} />
        </g>
      );
    } else if (emote === 'hearts') {
      em = (
        <g>
          {[0, 1].map((i) => {
            const t = ((frame - emoteAt) / 45 + i * 0.5) % 1;
            return <Heart key={i} x={exx + i * 1.4 * u + Math.sin(t * 6 + i) * 8} y={ey + 1.5 * u - t * 70} s={pop * (1.2 - 0.3 * t)} />;
          })}
        </g>
      );
    }
  }

  const legs = [-3.7, -1.3, 1.3, 3.7].map((lx, i) => (
    <path key={i} d={wobRect((lx - 0.45) * u, -1.8 * u, 0.9 * u, 1.8 * u, 1.2, s + 20 + i)} fill={color} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
  ));

  return (
    <g transform={`translate(${p.x},${p.y - lift})`}>
      {/* 影子：离地越高越小越淡 */}
      <ellipse cx={0} cy={lift + 4} rx={5.6 * u * (1 - Math.min(lift, 120) / 300)} ry={0.7 * u} fill={INK} opacity={0.12 * (1 - Math.min(lift, 120) / 200)} />
      <g transform={`rotate(${tilt}) scale(${1 / Math.sqrt(sq)},${sq})`}>
        {legs}
        <g transform={`translate(${-5 * u},${-4.6 * u}) rotate(${armL})`}>
          <path d={wobRect(-1.6 * u, -0.45 * u, 1.7 * u, 0.9 * u, 1, s + 30)} fill={color} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
        </g>
        <g transform={`translate(${5 * u},${-4.6 * u}) rotate(${armR})`}>
          <path d={wobRect(-0.1 * u, -0.45 * u, 1.7 * u, 0.9 * u, 1, s + 31)} fill={color} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
        </g>
        <path d={wobRect(-5 * u, -7.8 * u, 10 * u, 6.2 * u, 2, s)} fill={color} stroke={INK} strokeWidth={lw + 1} strokeLinejoin="round" />
        {/* 水彩感的高光 */}
        <path d={wobRect(-4.4 * u, -7.3 * u, 8.8 * u, 1.6 * u, 3, s + 40)} fill="#FFFFFF" opacity={0.14} />
        <path d={wobRect(-4.6 * u, -3.2 * u, 9.2 * u, 1.2 * u, 3, s + 41)} fill={INK} opacity={0.06} />
        {emo === 'happy' || emo === 'excited' ? (
          <>
            <ellipse cx={-3.4 * u + ex} cy={-4.2 * u} rx={0.7 * u} ry={0.35 * u} fill={PAL.heart} opacity={0.3} />
            <ellipse cx={3.4 * u + ex} cy={-4.2 * u} rx={0.7 * u} ry={0.35 * u} fill={PAL.heart} opacity={0.3} />
          </>
        ) : null}
        {eye(-2.2 * u + ex, 0)}
        {eye(2.2 * u + ex, 1)}
        {mouth}
      </g>
      {em}
    </g>
  );
};

// 工厂：lit 0→1 窗户依次亮起；smokeFrom 之后烟囱冒烟、齿轮转动
export const Factory: React.FC<{frame: number; x: number; y: number; lit: number; smokeFrom: number; seed: number; bump?: number}> = ({
  frame,
  x,
  y,
  lit,
  smokeFrom,
  seed,
  bump = 0,
}) => {
  const s = seed + boil(frame) * 13;
  const w = 400;
  const h = 290;
  const left = x - w / 2;
  const top = y - h;
  const running = frame > smokeFrom;
  const puffs = running
    ? [0, 1, 2, 3, 4, 5].map((i) => {
        const t = ((frame - smokeFrom) / 55 + i / 6) % 1;
        const age = (frame - smokeFrom) / 55 - i / 6;
        if (age < 0) return null;
        return (
          <path
            key={i}
            d={wobEllipse(x + 120 + t * 70 + Math.sin(t * 5 + i) * 10, top - 150 - t * 220, 20 + t * 46, 18 + t * 40, 2.5, s + i * 3)}
            fill={PAL.smoke}
            stroke={INK}
            strokeWidth={3}
            opacity={(1 - t) * 0.85}
          />
        );
      })
    : null;
  const gearRot = running ? (frame - smokeFrom) * 5 : 0;
  const teeth = Array.from({length: 8}, (_, i) => (
    <rect key={i} x={-7} y={-40} width={14} height={14} rx={2} fill={PAL.roof} stroke={INK} strokeWidth={3} transform={`rotate(${i * 45})`} />
  ));
  return (
    <g transform={`translate(${x},${y}) scale(${1 + 0.04 * bump},${1 - 0.04 * bump}) translate(${-x},${-y})`}>
      {puffs}
      <path d={wobRect(x + 95, top - 150, 52, 170, 1.5, s + 1)} fill={PAL.roof} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path
        d={wobLine(
          [
            [left, top],
            [left + 133, top - 70],
            [left + 133, top],
            [left + 266, top - 70],
            [left + 266, top],
            [left + w, top - 70],
            [left + w, top],
          ],
          1.5,
          s + 2,
        )}
        fill={PAL.roof}
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={wobRect(left, top, w, h, 2, s + 3)} fill={PAL.wall} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => {
        const on = Math.min(1, Math.max(0, lit * 3 - i));
        const wx = left + 40 + i * 120;
        return (
          <g key={i}>
            {on > 0 && <circle cx={wx + 45} cy={top + 80} r={70 * on} fill={PAL.light} opacity={0.25 * on} />}
            <path d={wobRect(wx, top + 45, 90, 72, 1.3, s + 10 + i)} fill={on > 0.5 ? PAL.light : PAL.window} stroke={INK} strokeWidth={5} />
            <path d={wobLine([[wx + 45, top + 45], [wx + 45, top + 117]], 1, s + 20 + i)} stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
      <path d={wobRect(x - 20, y - 120, 90, 120, 1.3, s + 30)} fill={PAL.roof} stroke={INK} strokeWidth={5} />
      <g transform={`translate(${left + 85},${y - 70}) rotate(${gearRot})`}>
        {teeth}
        <circle r={30} fill={PAL.roof} stroke={INK} strokeWidth={4} />
        <circle r={10} fill={PAL.wall} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

// 背景：纸张、远山、地面、飘动的小颗粒
export const Backdrop: React.FC<{frame: number; ground: number}> = ({frame, ground}) => {
  const s = boil(frame);
  const motes = Array.from({length: 18}, (_, i) => {
    const x = (hash(i) * 2100 + frame * (0.3 + hash(i + 50) * 0.5)) % 2100 - 90;
    const y = 120 + hash(i + 100) * 600 + Math.sin(frame / 40 + i) * 14;
    return <circle key={i} cx={x} cy={y} r={2 + hash(i + 7) * 3} fill={PAL.goldDark} opacity={0.18} />;
  });
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill={PAL.paper} />
      <path d={wobLine([[-200, ground - 120], [200, ground - 260], [560, ground - 170], [900, ground - 300], [1300, ground - 190], [1700, ground - 280], [2120, ground - 150], [2120, ground + 10], [-200, ground + 10]], 3, s + 500)} fill={PAL.hillFar} />
      <path d={wobLine([[-200, ground - 40], [380, ground - 140], [820, ground - 70], [1250, ground - 150], [1700, ground - 60], [2120, ground - 120], [2120, ground + 10], [-200, ground + 10]], 3, s + 600)} fill={PAL.hillNear} />
      <path d={wobLine([[-200, ground], [400, ground - 4], [960, ground + 3], [1500, ground - 3], [2120, ground], [2120, 1300], [-200, 1300]], 2, s + 700)} fill={PAL.ground} stroke={INK} strokeWidth={4} />
      {motes}
    </g>
  );
};

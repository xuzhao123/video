import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '../font';
import {FONT} from '../font';
import {Backdrop, Blob, Emo, Emote, Factory} from './actors';
import {Coin, INK, PAL, Pile, backOut, easeInOut, easeOut, lerp, prog, wobLine, boil} from './draw';
import timing from './timing.json';

// ---- 时间轴：由配音时长决定 ----
const LEAD = 14;
const GAP = 6;
const segs = timing[0];
const cue: number[] = [];
let t = LEAD;
for (const s of segs) {
  cue.push(t);
  t += s.frames + GAP;
}
const len = segs.map((s) => s.frames);
export const PILOT_FRAMES = t - GAP + 34;
const END = PILOT_FRAMES;

// ---- 场景布局 ----
const GROUND = 830;
const U = 19;
const SAVER = {x: 560, pile: 395};
const BIZ = {x: 1120, pile: 960};
const FAC = {x: 1560};
const handR = (x: number) => [x + 6.6 * U, GROUND - 4.6 * U] as const;

// ---- 三段金币飞行 ----
type Flight = {at: number; dur: number; from: readonly [number, number]; to: readonly [number, number]; h: number; plus?: boolean};
const tA = cue[0] + Math.round(len[0] * 0.42);
const A: Flight[] = [0, 1, 2, 3, 4].map((i) => ({at: tA + i * 6, dur: 24, from: handR(SAVER.x), to: [BIZ.pile, GROUND - 22 - i * 13], h: 230 + (i % 2) * 50}));
const tB = cue[1] + Math.round(len[1] * 0.3);
const B: Flight[] = [0, 1, 2, 3, 4].map((i) => ({at: tB + i * 5, dur: 18, from: [BIZ.pile, GROUND - 70], to: [FAC.x + 25, GROUND - 60], h: 150 + (i % 3) * 30}));
const tC = cue[2] + Math.round(len[2] * 0.15);
const C: Flight[] = Array.from({length: 8}, (_, i) => ({
  at: tC + i * 5,
  dur: 30,
  from: [FAC.x + 121, GROUND - 440],
  to: [SAVER.pile, GROUND - 22 - (1 + i) * 13],
  h: 260 + (i % 3) * 40,
  plus: true,
}));
const landed = (fs: Flight[], f: number) => fs.filter((x) => f >= x.at + x.dur).length;
const launched = (fs: Flight[], f: number) => fs.filter((x) => f >= x.at).length;
const lastLand = (fs: Flight[], f: number) => {
  const done = fs.filter((x) => f >= x.at + x.dur);
  return done.length ? done[done.length - 1].at + done[done.length - 1].dur : -999;
};

const Flights: React.FC<{fs: Flight[]; frame: number; seed: number}> = ({fs, frame, seed}) => (
  <g>
    {fs.map((c, i) => {
      const p = (frame - c.at) / c.dur;
      if (p < 0 || p >= 1) return null;
      const x = lerp(c.from[0], c.to[0], p);
      const y = lerp(c.from[1], c.to[1], p) - c.h * 4 * p * (1 - p);
      return <Coin key={i} x={x} y={y} flip={p * Math.PI * 3 + i} seed={seed + i * 17} plus={c.plus} frame={frame} />;
    })}
  </g>
);

// 跳跃：预备下蹲 → 腾空 → 落地挤压
const hop = (f: number, at: number, height = 70) => {
  const pre = prog(f, at - 7, at);
  const air = prog(f, at, at + 16);
  const land = prog(f, at + 16, at + 26);
  const lift = air > 0 && air < 1 ? height * 4 * air * (1 - air) : 0;
  let sq = 1;
  if (pre > 0 && air === 0) sq = 1 - 0.18 * Math.sin(pre * Math.PI * 0.5);
  if (air > 0 && air < 1) sq = 1 + 0.15 * Math.sin(air * Math.PI);
  if (land > 0 && land < 1) sq = 1 - 0.2 * Math.sin(land * Math.PI);
  return {lift, sq};
};

// 情绪时间表
const emoAt = (f: number, keys: [number, Emo][]) => keys.filter(([k]) => f >= k).pop()?.[1] ?? keys[0][1];

const Label: React.FC<{x: number; y: number; at: number; frame: number; text: string; color: string}> = ({x, y, at, frame, text, color}) => {
  const p = prog(frame, at, at + 12);
  if (p <= 0) return null;
  const draw = easeOut(prog(frame, at + 4, at + 20));
  return (
    <g transform={`translate(${x},${y}) scale(${backOut(p)}) rotate(-2)`}>
      <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK}>
        {text}
      </text>
      <path d={wobLine([[-110, 18], [-40, 22], [40, 16], [110, 20]], 2, boil(frame) + at)} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" strokeDasharray={240} strokeDashoffset={240 * (1 - draw)} />
    </g>
  );
};

export const Pilot: React.FC = () => {
  const f = useCurrentFrame();

  // 存钱的人
  const aThrow = launched(A, f);
  const saverPile = 6 - aThrow + landed(C, f);
  const firstReturn = C[0].at + C[0].dur;
  const sHop = hop(f, cue[3] + 8);
  const preThrow = prog(f, tA - 9, tA);
  const throwing = f >= tA && f < A[4].at + 10;
  const saverSq = (f < tA ? 1 - 0.14 * Math.sin(preThrow * Math.PI * 0.5) : 1) * sHop.sq;
  const saverArmR = throwing ? -55 + 25 * Math.sin((f - tA) * 0.9) : lerp(0, 20, preThrow);
  const saverEmo = emoAt(f, [
    [0, 'neutral'],
    [tA + 30, 'happy'],
    [firstReturn, 'surprised'],
    [firstReturn + 22, 'excited'],
  ]);
  const saverEmote: [Emote, number] = f >= firstReturn + 22 ? ['hearts', firstReturn + 22] : f >= firstReturn ? ['bang', firstReturn] : [null, 0];
  const saverLook = f < tA + 40 ? lerp(0, 0.8, easeInOut(prog(f, cue[0], cue[0] + 15))) : f < tC ? lerp(0.8, 0.3, prog(f, tA + 40, tA + 55)) : lerp(0.3, 1, easeInOut(prog(f, tC - 10, tC + 5)));

  // 需要钱的人
  const firstCatch = A[0].at + A[0].dur;
  const bizPile = landed(A, f) - launched(B, f);
  const bHop = hop(f, cue[3] + 14, 60);
  const catchBounce = Math.max(...A.map((c) => {
    const k = prog(f, c.at + c.dur, c.at + c.dur + 8);
    return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0;
  }));
  const bizSq = (1 - 0.12 * catchBounce) * bHop.sq;
  const bizEmo = emoAt(f, [
    [0, 'worried'],
    [firstCatch, 'surprised'],
    [cue[1], 'happy'],
    [tB + 30, 'excited'],
  ]);
  const bizEmote: [Emote, number] = f >= tB + 30 ? ['stars', tB + 30] : f >= firstCatch ? ['bang', firstCatch] : ['sweat', 6];
  const bizLook = f < cue[1] ? lerp(0.6, -0.9, easeInOut(prog(f, cue[0] + 10, cue[0] + 28))) : f < tC ? lerp(-0.9, 1, easeInOut(prog(f, cue[1], cue[1] + 14))) : lerp(1, -0.8, easeInOut(prog(f, tC + 10, tC + 25)));
  const bizThrow = f >= tB - 4 && f < B[4].at + 8;
  const bizArmR = bizThrow ? -50 + 25 * Math.sin((f - tB) * 0.9) : 0;

  // 工厂
  const lit = easeOut(prog(f, B[4].at + B[4].dur, B[4].at + B[4].dur + 36));
  const facBump = Math.max(...B.map((c) => {
    const k = prog(f, c.at + c.dur, c.at + c.dur + 8);
    return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0;
  }));
  const smokeFrom = B[4].at + B[4].dur + 10;

  // 镜头：开场缓推，结尾拉远
  const zoom = lerp(1.1, 1.0, easeInOut(prog(f, 0, cue[2]))) * lerp(1, 0.94, easeInOut(prog(f, cue[3], cue[3] + 40)));
  const panX = lerp(80, 0, easeInOut(prog(f, 0, cue[1] + 20))) + Math.sin(f / 70) * 6;
  const panY = lerp(30, 0, easeInOut(prog(f, cue[2], cue[3] + 30)));
  // 转场：圆形开合（以金币为中心）
  const irisIn = easeOut(prog(f, 0, 18));
  const irisOut = easeInOut(prog(f, END - 18, END));
  const irisR = 1250 * irisIn * (1 - irisOut) + 0.01;

  const title = prog(f, cue[3], cue[3] + 14);

  return (
    <AbsoluteFill style={{background: INK}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <clipPath id="iris">
            <circle cx={960} cy={560} r={irisR} />
          </clipPath>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={boil(f) % 7} />
            <feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.07 0" />
          </filter>
        </defs>
        <g clipPath="url(#iris)">
          <g transform={`translate(960,600) scale(${zoom}) translate(${-960 + panX},${-600 + panY})`}>
            <Backdrop frame={f} ground={GROUND} />
            <Factory frame={f} x={FAC.x} y={GROUND} lit={lit} smokeFrom={smokeFrom} seed={900} bump={facBump} />
            <Pile x={SAVER.pile} y={GROUND} n={saverPile} frame={f} seed={3} pop={prog(f, lastLand(C, f), lastLand(C, f) + 6) < 1 ? 1 - prog(f, lastLand(C, f), lastLand(C, f) + 6) : 0} />
            <Pile x={BIZ.pile} y={GROUND} n={Math.max(0, bizPile)} frame={f} seed={5} />
            <Blob
              frame={f}
              x={SAVER.x}
              y={GROUND}
              u={U}
              color={PAL.saver}
              emo={saverEmo}
              look={saverLook}
              sq={saverSq}
              lift={sHop.lift}
              armR={saverArmR}
              armL={f > firstReturn + 22 ? -20 + 15 * Math.sin(f * 0.4) : 10}
              seed={100}
              phase={0}
              changes={[tA + 30, firstReturn, firstReturn + 22]}
              emote={saverEmote[0]}
              emoteAt={saverEmote[1]}
            />
            <Blob
              frame={f}
              x={BIZ.x}
              y={GROUND}
              u={U}
              color={PAL.biz}
              emo={bizEmo}
              look={bizLook}
              sq={bizSq}
              lift={bHop.lift}
              tilt={bizEmo === 'worried' ? Math.sin(f / 9) * 2 : 0}
              armR={bizArmR}
              armL={bizEmo === 'excited' ? 25 * Math.sin(f * 0.35 + 1) : -10}
              seed={200}
              phase={13}
              changes={[firstCatch, cue[1], tB + 30]}
              emote={bizEmote[0]}
              emoteAt={bizEmote[1]}
            />
            <Flights fs={A} frame={f} seed={1000} />
            <Flights fs={B} frame={f} seed={2000} />
            <Flights fs={C} frame={f} seed={3000} />
            <Label x={SAVER.x - 60} y={GROUND + 110} at={cue[0] + 4} frame={f} text="有余钱的人" color={PAL.saver} />
            <Label x={BIZ.x - 40} y={GROUND + 110} at={cue[1] + 2} frame={f} text="需要钱的人" color={PAL.biz} />
          </g>
          {title > 0 && (
            <g transform={`translate(960,190) scale(${backOut(title)}) rotate(${-2 + Math.sin(f / 12)})`}>
              <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={INK}>
                金融 = 搬运钱
              </text>
              <path
                d={wobLine([[-330, 36], [-100, 44], [120, 34], [330, 42]], 3, boil(f))}
                stroke={PAL.gold}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={700}
                strokeDashoffset={700 * (1 - easeOut(prog(f, cue[3] + 8, cue[3] + 26)))}
              />
            </g>
          )}
          <rect width={1920} height={1080} filter="url(#grain)" />
        </g>
      </svg>
      {segs.map((s, i) => (
        <Sequence key={i} from={cue[i]} durationInFrames={s.frames}>
          <Audio src={staticFile(s.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

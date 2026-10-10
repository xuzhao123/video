import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '../font';
import {FONT} from '../font';
import {C, SP} from '../ui';
import {DebtVsEquity, Flow, Intro} from './scenes1';
import {Markets, Players, Rates} from './scenes2';
import {Quotes, Summary, WhyUS} from './scenes3';
import timing from './timing.json';

const components: React.FC<SP>[] = [Intro, Flow, DebtVsEquity, Markets, Players, Rates, WhyUS, Quotes, Summary];

const LEAD = 15; // 场景开始到第一段配音的间隔
const GAP = 10; // 段与段之间的停顿
const TAIL = 35; // 最后一段配音结束到切场

// 根据配音时长排出每个场景的时间轴
const scenes = components.map((Comp, s) => {
  const segs = timing[s];
  const cue: number[] = [];
  let t = LEAD;
  for (const seg of segs) {
    cue.push(t);
    t += seg.frames + GAP;
  }
  return {Comp, segs, cue, len: segs.map((x) => x.frames), duration: t - GAP + TAIL};
});

export const LESSON01_FRAMES = scenes.reduce((s, x) => s + x.duration, 0);
const INTRO_FRAMES = scenes[0].duration;

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const show = interpolate(frame, [INTRO_FRAMES, INTRO_FRAMES + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <div style={{position: 'absolute', top: 44, left: 140, fontFamily: FONT, fontSize: 26, color: C.muted, opacity: show, letterSpacing: 2}}>
        金融知识库 · 第 1 课 · 金融市场全景
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: C.gold}} />
    </>
  );
};

export const Lesson01: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 20%, #16223A 0%, ${C.bg} 60%)`}}>
    <Series>
      {scenes.map(({Comp, segs, cue, len, duration}, i) => (
        <Series.Sequence key={i} durationInFrames={duration}>
          <Comp duration={duration} cue={cue} len={len} />
          {segs.map((seg, j) => (
            <Sequence key={j} from={cue[j]} durationInFrames={seg.frames}>
              <Audio src={staticFile(seg.src)} />
            </Sequence>
          ))}
        </Series.Sequence>
      ))}
    </Series>
    <Chrome />
  </AbsoluteFill>
);

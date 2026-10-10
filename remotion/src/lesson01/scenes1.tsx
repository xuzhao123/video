import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Appear, C, Caption, Hl, Scene, SceneTitle, SP, useAppear, usePop} from '../ui';

// ① 片头
export const Intro: React.FC<SP> = ({duration}) => {
  const pop = usePop(5);
  const sub = useAppear(30, 24);
  const line = useAppear(60, 30);
  return (
    <Scene duration={duration}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontSize: 36, color: C.gold, letterSpacing: 8, opacity: pop}}>入门基础 · 第 1 课</div>
        <div style={{fontSize: 130, fontWeight: 900, marginTop: 20, transform: `scale(${0.8 + 0.2 * pop})`, opacity: pop}}>
          金融市场全景
        </div>
        <div style={{fontSize: 52, color: C.muted, marginTop: 24, opacity: sub}}>钱从哪里来，到哪里去</div>
        <div style={{width: 900 * line, height: 4, background: C.gold, marginTop: 60, borderRadius: 2}} />
      </div>
    </Scene>
  );
};

// ② 资金的“搬运”
const Party: React.FC<{title: string; items: string[]; color: string; at: number}> = ({title, items, color, at}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        width: 420,
        padding: '36px 40px',
        borderRadius: 28,
        background: C.panel,
        border: `3px solid ${color}`,
        transform: `scale(${p})`,
        textAlign: 'center',
      }}
    >
      <div style={{fontSize: 46, fontWeight: 800, color}}>{title}</div>
      {items.map((t) => (
        <div key={t} style={{fontSize: 34, color: C.muted, marginTop: 16}}>
          {t}
        </div>
      ))}
    </div>
  );
};

const Coins: React.FC<{start: number; reverse?: boolean; color: string; label: string}> = ({start, reverse, color, label}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const period = 75;
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = ((frame - start + i * 15) % period) / period;
        const x = reverse ? 1 - t : t;
        const op = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: '50%',
              width: 54,
              height: 54,
              marginLeft: -27,
              marginTop: -27,
              borderRadius: 27,
              background: color,
              opacity: op,
              color: C.bg,
              fontWeight: 900,
              fontSize: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {label}
          </div>
        );
      })}
    </>
  );
};

export const Flow: React.FC<SP> = ({duration, cue}) => {
  const mid = useAppear(cue[2]);
  return (
    <Scene duration={duration}>
      <SceneTitle no="01">金融的本质：资金的“搬运”</SceneTitle>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 30}}>
        <Party title="有余钱的人" items={['家庭存款', '养老金', '基金']} color={C.gold} at={cue[0]} />
        <div style={{flex: 1, position: 'relative', height: 360, margin: '0 30px'}}>
          <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontSize: 34, color: C.gold, opacity: mid}}>
            钱 →
          </div>
          <div style={{position: 'absolute', top: 90, left: 0, right: 0, height: 80, opacity: mid}}>
            <div style={{position: 'absolute', top: 38, left: 0, right: 0, height: 4, background: C.line}} />
            <Coins start={cue[2] + 10} color={C.gold} label="$" />
          </div>
          <div style={{position: 'absolute', top: 190, left: 0, right: 0, height: 80, opacity: useAppear(cue[3])}}>
            <div style={{position: 'absolute', top: 38, left: 0, right: 0, height: 4, background: C.line}} />
            <Coins start={cue[3] + 10} reverse color={C.bond} label="+" />
          </div>
          <div
            style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontSize: 34, color: C.bond, opacity: useAppear(cue[3])}}
          >
            ← 回报（利息、分红）
          </div>
        </div>
        <Party title="需要钱的人" items={['企业办厂', '政府修路', '家庭买房']} color={C.blue} at={cue[1]} />
      </div>
      <Appear at={cue[4]} style={{textAlign: 'center', marginTop: 40, fontSize: 36, color: C.muted}}>
        中间的“管道”：银行 · 交易所 · 券商 · 基金
      </Appear>
      <Caption at={cue[5]}>
        金融 = 把<Hl>暂时不用的钱</Hl>，交给<Hl c={C.blue}>需要钱做事的人</Hl>，并收取<Hl c={C.bond}>回报</Hl>
      </Caption>
    </Scene>
  );
};

// ③ 借钱 vs 入伙
const rows: [string, string, string][] = [
  ['你的身份', '债主', '股东（老板之一）'],
  ['回报', '固定利息，到期还本', '分享利润，不固定'],
  ['风险', '较低', '较高'],
  ['收益上限', '有（就是利息）', '理论上没有'],
  ['对应产品', '存款 · 债券 · 贷款', '股票'],
];

export const DebtVsEquity: React.FC<SP> = ({duration, cue, len}) => {
  const head = usePop(cue[0] + Math.round(len[0] * 0.4));
  const rowAt = [cue[1], cue[1] + Math.round(len[1] * 0.5), cue[2], cue[2] + Math.round(len[2] * 0.5), cue[3]];
  return (
    <Scene duration={duration}>
      <SceneTitle no="02">只有两种方式：借钱 vs 入伙</SceneTitle>
      <div style={{display: 'grid', gridTemplateColumns: '260px 1fr 1fr', columnGap: 30, rowGap: 12, fontSize: 36}}>
        <div />
        <div
          style={{transform: `scale(${head})`, background: C.bond, color: C.bg, borderRadius: 20, padding: '12px 0', textAlign: 'center', fontWeight: 900, fontSize: 48}}
        >
          借钱 = 债
        </div>
        <div
          style={{transform: `scale(${head})`, background: C.stock, color: C.bg, borderRadius: 20, padding: '12px 0', textAlign: 'center', fontWeight: 900, fontSize: 48}}
        >
          入伙 = 股
        </div>
        {rows.map(([k, a, b], i) => {
          const at = rowAt[i];
          return (
            <React.Fragment key={k}>
              <Appear at={at} dy={20} style={{color: C.muted, padding: '12px 0'}}>
                {k}
              </Appear>
              <Appear at={at + 8} dy={20} style={{background: C.panel, borderRadius: 14, padding: '12px 28px', borderLeft: `6px solid ${C.bond}`}}>
                {a}
              </Appear>
              <Appear at={at + 16} dy={20} style={{background: C.panel, borderRadius: 14, padding: '12px 28px', borderLeft: `6px solid ${C.stock}`}}>
                {b}
              </Appear>
            </React.Fragment>
          );
        })}
      </div>
      <Caption at={cue[4]}>
        几乎所有复杂的金融产品，都是用 <Hl c={C.bond}>债</Hl> 和 <Hl c={C.stock}>股</Hl> 这两块积木搭出来的
      </Caption>
    </Scene>
  );
};

import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {Appear, C, Caption, Hl, Scene, SceneTitle, SP, useAppear, usePop} from '../ui';

// ④ 六大市场
const markets = [
  {name: '股票市场', what: '公司的所有权份额', say: '买公司的一小块', c: C.stock},
  {name: '债券市场', what: '政府 / 公司的借条', say: '借钱出去收利息', c: C.bond},
  {name: '货币市场', what: '几天 ~ 1 年的借贷', say: '机构之间的短期周转', c: C.blue},
  {name: '外汇市场', what: '各国货币', say: '美元换人民币、欧元……', c: C.blue},
  {name: '大宗商品', what: '原油 · 黄金 · 铜 · 粮食', say: '实物资源的价格', c: C.gold},
  {name: '衍生品市场', what: '期货 · 期权', say: '基于上面这些的“合约”', c: C.muted},
];

export const Markets: React.FC<SP> = ({duration, cue, len}) => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [cue[3], cue[3] + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Scene duration={duration}>
      <SceneTitle no="03">主要的金融市场</SceneTitle>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30}}>
        {markets.map((m, i) => {
          const g = Math.floor(i / 2);
          const p = usePop(cue[g] + (i % 2) * Math.round(len[g] * (g === 0 ? 0.5 : 0.45)));
          const isBond = i === 1;
          const dim = isBond ? 1 : 1 - 0.65 * focus;
          return (
            <div
              key={m.name}
              style={{
                transform: `scale(${p * (isBond ? 1 + 0.06 * focus : 1)})`,
                opacity: dim,
                background: C.panel,
                borderRadius: 24,
                padding: '30px 34px',
                borderTop: `8px solid ${m.c}`,
                boxShadow: isBond ? `0 0 ${60 * focus}px ${C.bond}88` : 'none',
              }}
            >
              <div style={{fontSize: 46, fontWeight: 800, color: m.c}}>{m.name}</div>
              <div style={{fontSize: 32, marginTop: 14}}>{m.what}</div>
              <div style={{fontSize: 30, marginTop: 10, color: C.muted}}>{m.say}</div>
            </div>
          );
        })}
      </div>
      <Caption at={cue[3] + Math.round(len[3] * 0.5)} color={C.bond}>
        <Hl c={C.bond}>债券市场</Hl>的规模比股票市场还大 —— 所以新闻天天在说“<Hl c={C.bond}>美债收益率</Hl>”
      </Caption>
    </Scene>
  );
};

// ⑤ 市场里的角色
const roles = [
  {name: '个人投资者', note: '散户，就是我们', angle: -150},
  {name: '机构投资者', note: '基金 · 养老金 · 保险', angle: -30},
  {name: '企业', note: '发股票、发债券融资', angle: 150},
  {name: '政府', note: '发国债借钱', angle: 30},
];

export const Players: React.FC<SP> = ({duration, cue, len}) => {
  const frame = useCurrentFrame();
  const fed = usePop(cue[2] + Math.round(len[2] * 0.25));
  const roleAt = [cue[0] + Math.round(len[0] * 0.1), cue[0] + Math.round(len[0] * 0.4), cue[1], cue[1] + Math.round(len[1] * 0.5)];
  const cx = 820;
  const cy = 330;
  const rx = 560;
  const ry = 230;
  return (
    <Scene duration={duration}>
      <SceneTitle no="04">市场里的主要角色</SceneTitle>
      <div style={{position: 'relative', height: 620}}>
        <svg width={1640} height={620} style={{position: 'absolute', inset: 0}}>
          {roles.map((r, i) => {
            const a = (r.angle * Math.PI) / 180;
            const x = cx + rx * Math.cos(a);
            const y = cy + ry * Math.sin(a);
            const dash = ((frame * 2) % 40) - 40;
            return (
              <line
                key={r.name}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={C.gold}
                strokeWidth={4}
                strokeDasharray="14 26"
                strokeDashoffset={dash}
                opacity={fed * 0.8}
              />
            );
          })}
        </svg>
        {roles.map((r, i) => {
          const a = (r.angle * Math.PI) / 180;
          const p = usePop(roleAt[i]);
          return (
            <div
              key={r.name}
              style={{
                position: 'absolute',
                left: cx + rx * Math.cos(a) - 200,
                top: cy + ry * Math.sin(a) - 70,
                width: 400,
                height: 140,
                transform: `scale(${p})`,
                background: C.panel,
                border: `3px solid ${C.line}`,
                borderRadius: 22,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{fontSize: 42, fontWeight: 800}}>{r.name}</div>
              <div style={{fontSize: 30, color: C.muted, marginTop: 6}}>{r.note}</div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: cx - 150,
            top: cy - 150,
            width: 300,
            height: 300,
            borderRadius: 150,
            background: C.gold,
            color: C.bg,
            transform: `scale(${fed})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 80px ${C.gold}66`,
          }}
        >
          <div style={{fontSize: 30, fontWeight: 700}}>中央银行</div>
          <div style={{fontSize: 64, fontWeight: 900}}>美联储</div>
          <div style={{fontSize: 30, fontWeight: 700}}>Fed</div>
        </div>
      </div>
      <Caption at={cue[2] + Math.round(len[2] * 0.5)}>
        美联储决定“<Hl>钱的价格</Hl>”，是整个市场最重要的角色
      </Caption>
    </Scene>
  );
};

// ⑥ 利率
const Bar: React.FC<{label: string; value: number; color: string; text: string}> = ({label, value, color, text}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 34}}>
    <div style={{width: 360, fontSize: 38, color: C.muted, textAlign: 'right'}}>{label}</div>
    <div style={{flex: 1, height: 64, background: C.panel, borderRadius: 14, overflow: 'hidden'}}>
      <div style={{width: `${value * 100}%`, height: '100%', background: color, borderRadius: 14}} />
    </div>
    <div style={{width: 220, fontSize: 40, fontWeight: 800, color}}>{text}</div>
  </div>
);

export const Rates: React.FC<SP> = ({duration, cue, len}) => {
  const frame = useCurrentFrame();
  const panel = useAppear(cue[1], 20);
  // 利率 1% → 5% → 1%
  const r = interpolate(frame, [cue[1] + 60, cue[1] + Math.round(len[1] * 0.75), cue[2], cue[2] + Math.round(len[2] * 0.7)], [1, 5, 5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const n = (r - 1) / 4; // 0..1
  const high = r > 3;
  const eq = ['利率', '钱的价格', '借钱的成本', '不冒险就能拿到的回报'];
  return (
    <Scene duration={duration}>
      <SceneTitle no="05">最重要的一个变量：利率</SceneTitle>
      <div style={{display: 'flex', gap: 22, alignItems: 'center', fontSize: 44, fontWeight: 800, flexWrap: 'wrap'}}>
        {eq.map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 && (
              <Appear at={cue[0] + Math.round(len[0] * (0.35 + i * 0.17))} dy={0} style={{color: C.muted}}>
                =
              </Appear>
            )}
            <Appear at={cue[0] + Math.round(len[0] * (0.35 + i * 0.17))} dy={20} style={{color: i === 0 ? C.gold : C.text}}>
              {t}
            </Appear>
          </React.Fragment>
        ))}
      </div>
      <div style={{opacity: panel, marginTop: 60}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30, marginBottom: 40}}>
          <div style={{fontSize: 40, color: C.muted}}>假设利率是</div>
          <div style={{fontSize: 96, fontWeight: 900, color: C.gold, width: 260}}>{r.toFixed(1)}%</div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              padding: '8px 24px',
              borderRadius: 12,
              background: high ? `${C.stock}33` : `${C.bond}33`,
              color: high ? C.stock : C.bond,
            }}
          >
            {high ? '利率高' : '利率低'}
          </div>
        </div>
        <Bar label="存银行/买国债的回报" value={0.15 + 0.8 * n} color={C.bond} text={high ? '挺香' : '没啥意思'} />
        <Bar label="企业借钱的成本" value={0.15 + 0.8 * n} color={C.blue} text={high ? '变贵' : '便宜'} />
        <Bar label="股票的吸引力" value={0.95 - 0.8 * n} color={C.stock} text={high ? '下降' : '上升'} />
      </div>
      <Caption at={cue[3]}>
        利率一动，整个链条都会跟着动 —— 这就是一份就业数据能让股市大涨的原因
      </Caption>
    </Scene>
  );
};

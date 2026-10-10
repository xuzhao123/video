import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {Appear, C, Hl, Scene, SceneTitle, SP, useAppear, usePop} from '../ui';

// ⑦ 为什么关注美股
export const WhyUS: React.FC<SP> = ({duration, cue}) => {
  const frame = useCurrentFrame();
  const share = interpolate(frame, [cue[1], cue[1] + 80], [0, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const R = 190;
  const L = 2 * Math.PI * R;
  const points = [
    {t: '全球最大的经济体', s: '美元是全球主要的储备货币'},
    {t: '全球股市市值约一半在美国', s: '很多全球最大的科技公司都在这里上市'},
    {t: '美联储的决定影响全世界', s: '利率、汇率、资产价格，包括 A 股、港股'},
  ];
  return (
    <Scene duration={duration}>
      <SceneTitle no="06">为什么要关注美股？</SceneTitle>
      <div style={{display: 'flex', alignItems: 'center', gap: 100, flex: 1, paddingBottom: 60}}>
        <div style={{position: 'relative', width: 460, height: 460, flexShrink: 0}}>
          <svg width={460} height={460}>
            <circle cx={230} cy={230} r={R} stroke={C.panel} strokeWidth={50} fill="none" />
            <circle
              cx={230}
              cy={230}
              r={R}
              stroke={C.gold}
              strokeWidth={50}
              fill="none"
              strokeDasharray={`${L * share} ${L}`}
              transform="rotate(-90 230 230)"
            />
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: 92, fontWeight: 900, color: C.gold}}>≈{Math.round(share * 100)}%</div>
            <div style={{fontSize: 30, color: C.muted}}>全球股市市值</div>
          </div>
        </div>
        <div style={{flex: 1}}>
          {points.map((p, i) => (
            <Appear key={p.t} at={cue[i]} style={{marginBottom: 46, borderLeft: `6px solid ${C.gold}`, paddingLeft: 30}}>
              <div style={{fontSize: 46, fontWeight: 800}}>{p.t}</div>
              <div style={{fontSize: 34, color: C.muted, marginTop: 8}}>{p.s}</div>
            </Appear>
          ))}
        </div>
      </div>
    </Scene>
  );
};

// ⑧ 名家怎么说
const quotes = [
  {
    who: '曼昆',
    src: '《经济学原理》',
    q: '金融体系把储蓄者的钱配置给借款者；企业融资只有两种方式：发债和发股。',
    rel: '对应：金融就是“搬运钱”，只有债和股两种方式',
  },
  {
    who: '瑞·达利欧',
    src: '《经济机器是怎样运行的》',
    q: '一个人的支出，就是另一个人的收入。',
    rel: '对应：钱在流动，利率一动整个链条都动',
  },
  {
    who: '巴菲特',
    src: '1999 年《财富》杂志',
    q: '利率对资产估值的作用，就像重力对物体的作用。',
    rel: '对应：利率越高，往下拉估值的“重力”越大',
  },
];

export const Quotes: React.FC<SP> = ({duration, cue}) => {
  const frame = useCurrentFrame();
  return (
    <Scene duration={duration}>
      <SceneTitle no="07">名家怎么说</SceneTitle>
      <div style={{position: 'relative', flex: 1}}>
        {quotes.map((q, i) => {
          const s = cue[i] - 10;
          const each = (cue[i + 1] ?? duration) - 10 - s;
          const op = interpolate(frame, [s, s + 15, s + each - 12, s + each], [0, 1, 1, i === quotes.length - 1 ? 1 : 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const x = interpolate(frame, [s, s + 20], [60, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={q.who}
              style={{position: 'absolute', inset: 0, opacity: op, transform: `translateX(${x}px)`, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
            >
              <div style={{fontSize: 64, fontWeight: 800, lineHeight: 1.45, maxWidth: 1500, borderLeft: `10px solid ${C.gold}`, paddingLeft: 44}}>{q.q}</div>
              <div style={{fontSize: 40, marginTop: 40}}>
                —— <Hl>{q.who}</Hl> <span style={{color: C.muted}}>{q.src}</span>
              </div>
              <div style={{fontSize: 34, color: C.bond, marginTop: 50}}>{q.rel}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ⑨ 总结
export const Summary: React.FC<SP> = ({duration, cue, len}) => {
  const words = ['金融市场', '债', '股', '机构投资者', '中央银行', '利率'];
  const next = useAppear(cue[2]);
  return (
    <Scene duration={duration}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Appear at={Math.max(0, cue[0] - 10)} style={{fontSize: 36, color: C.gold, letterSpacing: 6}}>
          一句话总结
        </Appear>
        <Appear at={cue[0]} style={{fontSize: 60, fontWeight: 800, textAlign: 'center', lineHeight: 1.5, marginTop: 24, maxWidth: 1500}}>
          金融，就是把“暂时不用的钱”交给“需要钱做事的人”，并为此收取回报
        </Appear>
        <div style={{display: 'flex', gap: 24, marginTop: 70}}>
          {words.map((w, i) => {
            const p = usePop(cue[1] + Math.round(len[1] * (0.2 + i * 0.13)));
            const key = w === '利率';
            return (
              <div
                key={w}
                style={{
                  transform: `scale(${p})`,
                  fontSize: 38,
                  fontWeight: 700,
                  padding: '14px 30px',
                  borderRadius: 40,
                  background: key ? C.gold : C.panel,
                  color: key ? C.bg : C.text,
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
        <div style={{fontSize: 38, color: C.muted, marginTop: 80, opacity: next}}>
          下一课 → <span style={{color: C.text, fontWeight: 700}}>股票是什么</span>
        </div>
      </div>
    </Scene>
  );
};

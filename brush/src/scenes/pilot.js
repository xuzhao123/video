// pilot.js: 第 1 课样片「资金的搬运」，手绘水彩版（与 Remotion 版同一段配音、同一个剧情）。
//   一个镜头：有余钱的 Clawd 把金币抛给发愁的蓝色 Clawd → 蓝色 Clawd 把钱扔进工厂，工厂亮灯冒烟 →
//   烟囱飞出带"+"的回报金币落回橙色 Clawd 的钱堆 → 两人跳起，"金融 = 搬运钱"。圆形转场开、合。
// 时间点取自配音（finance-videos/src/pilot/timing.json，30fps 帧数换算成秒）。
(() => {
  const F = 30, LEAD = 14, GAP = 6;
  const SEGS = [106, 86, 80, 60];
  const cue = [], len = SEGS.map(f => f / F);
  { let t = LEAD; for (const f of SEGS) { cue.push(t / F); t += f + GAP; } }

  const G = 830, U = 19;
  const SAVER = { x: 560, pile: 395 }, BIZ = { x: 1120, pile: 960 }, FAC = { x: 1560 };
  const GOLD = '#F2B33D', GOLD_DK = '#B97F14', PLUS = '#3E9E73';
  const BLUE = { col: '#5B8FD9', dk: '#3E6AA8', lt: '#8DB4EE' };
  const handR = x => [x + 6.4 * U, G - 5 * U];

  // ---------- 三段金币飞行 ----------
  const tA = cue[0] + len[0] * .42;
  const A = [0, 1, 2, 3, 4].map(i => ({ at: tA + i * .2, dur: .8, from: handR(SAVER.x), to: [BIZ.pile, G - 22 - i * 13], h: 230 + (i % 2) * 50 }));
  const tB = cue[1] + len[1] * .3;
  const B = [0, 1, 2, 3, 4].map(i => ({ at: tB + i * .17, dur: .6, from: [BIZ.pile, G - 70], to: [FAC.x + 25, G - 60], h: 150 + (i % 3) * 30 }));
  const tC = cue[2] + len[2] * .15;
  const C = Array.from({ length: 8 }, (_, i) => ({ at: tC + i * .17, dur: 1, from: [FAC.x + 121, G - 440], to: [SAVER.pile, G - 22 - (1 + i) * 13], h: 260 + (i % 3) * 40, plus: true }));
  const landed = (fs, t) => fs.filter(c => t >= c.at + c.dur).length;
  const launched = (fs, t) => fs.filter(c => t >= c.at).length;
  const landTimes = fs => fs.map(c => c.at + c.dur);

  // ---------- 道具 ----------
  function coin(x, y, r, flip, plus, key) {
    boilSeed(key);
    const k = Math.max(.18, Math.abs(Math.cos(flip)));
    paint(ellPts(x, y, r * k, r, 16, 1), { wash: GOLD, ink: PAL.ink, sw: .8 });
    if (k > .45) inkLine(ellPts(x, y, r * .58 * k, r * .58, 12), .5, GOLD_DK, 'inkfine', .9);
    if (plus && k > .45) {
      inkLine([[x - r * .3 * k, y], [x + r * .3 * k, y]], 1, PLUS, 'ink', 0);
      inkLine([[x, y - r * .3], [x, y + r * .3]], 1, PLUS, 'ink', 0);
    }
  }
  function flights(fs, t, key) {
    fs.forEach((c, i) => {
      const p = (t - c.at) / c.dur;
      if (p < 0 || p >= 1) return;
      const [x, y] = arcPt(c.from, c.to, c.h, p);
      coin(x, y, 26, p * Math.PI * 3 + i, c.plus, key + i);
    });
  }
  function pile(x, n, key, pop = 0) {
    for (let i = 0; i < n; i++) {
      boilSeed(key + i);
      const top = i === n - 1, ry = 12 * (top ? 1 + .3 * pop : 1);
      paint(ellPts(x + (hash(i + key.length) - .5) * 14, G - 10 - i * 13, 38, ry, 16, 1), { wash: GOLD, ink: PAL.ink, sw: .8 });
    }
  }
  function factory(t, lit, smokeFrom, bump) {
    const x = FAC.x, w = 400, h = 290, L = x - w / 2, T0 = G - h;
    push(); translate(x, G); scale(1 + .05 * bump, 1 - .05 * bump); translate(-x, -G);
    if (t > smokeFrom) for (let i = 0; i < 5; i++) {
      const age = (t - smokeFrom) / 1.8 - i / 5; if (age < 0) continue;
      const k = frac((t - smokeFrom) / 1.8 + i / 5);
      boilSeed('smoke' + i);
      paint(ellPts(x + 121 + k * 70 + Math.sin(k * 5 + i) * 10, T0 - 150 - k * 220, 20 + k * 46, 18 + k * 40, 14, 3), { wash: '#DAD1C4', washOp: 255 * (1 - k) * .9, ink: PAL.ink, sw: .5 });
    }
    boilSeed('chimney'); paint(rectPts(x + 95, T0 - 150, 52, 170, 2), { wash: '#8E7462', ink: PAL.ink, sw: 1 });
    boilSeed('roof'); paint([[L, T0], [L + 133, T0 - 70], [L + 133, T0], [L + 266, T0 - 70], [L + 266, T0], [L + w, T0 - 70], [L + w, T0]], { wash: '#8E7462', ink: PAL.ink, sw: 1 });
    boilSeed('wall'); paint(rectPts(L, T0, w, h, 2), { wash: '#C9B497', ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 3; i++) {
      const on = clamp(lit * 3 - i), wx = L + 40 + i * 120;
      if (on > 0) glow(wx + 45, T0 + 80, 110 * on, '#FFD866', .7 * on);
      boilSeed('win' + i);
      paint(rectPts(wx, T0 + 45, 90, 72, 1.5), { wash: on > .5 ? '#FFD866' : '#5A4E45', ink: PAL.ink, sw: 1 });
      inkLine([[wx + 45, T0 + 45], [wx + 45, T0 + 117]], .6, PAL.ink, 'ink', 0);
    }
    boilSeed('door'); paint(rectPts(x - 20, G - 120, 90, 120, 1.5), { wash: '#8E7462', ink: PAL.ink, sw: 1 });
    const rot = t > smokeFrom ? (t - smokeFrom) * 2.6 : 0;
    boilSeed('gear');
    paint(starPts(L + 85, G - 70, 42, .72, 8, rot), { wash: '#8E7462', ink: PAL.ink, sw: .9 });
    paint(ellPts(L + 85, G - 70, 11, 11, 10), { wash: '#C9B497', ink: PAL.ink, sw: .6 });
    pop();
  }
  function world(t) {
    boilSeed('sky'); paint(rectPts(-400, -400, W + 800, H + 800), { wash: '#F1E6CF', ink: null });
    { boilSeed('cloud'); paint(ellPts(560, 260, 520, 120, 26, 12), { fill: '#E9D9BA', fillOp: 120, bleed: .25, tex: .5, ink: null }); }
    boilSeed('hillFar'); paint([[-300, G + 10], [-300, G - 120], [200, G - 260], [560, G - 170], [900, G - 300], [1300, G - 190], [1700, G - 280], [2220, G - 150], [2220, G + 10]], { wash: '#E0D5BD', ink: null });
    boilSeed('hillNear'); paint([[-300, G + 10], [-300, G - 40], [380, G - 140], [820, G - 70], [1250, G - 150], [1700, G - 60], [2220, G - 120], [2220, G + 10]], { wash: '#CFDABF', ink: null });
    boilSeed('ground'); paint(rectPts(-300, G, W + 600, 500, 3), { wash: '#E3D2B2', ink: null });
    inkLine([[-300, G], [500, G - 4], [1200, G + 3], [W + 300, G - 2]], 1, PAL.ink, 'ink', .5);
    for (let i = 0; i < 14; i++) {   // 地上的小草，随风摆
      boilSeed('tuft' + i);
      const x = hash(i + 40) * 2000 - 40, sw = wob(t, .5, hash(i) * 3) * 5;
      for (const k of [-1, 0, 1]) inkLine([[x + k * 7, G + 6], [x + k * 10 + sw, G - 14 - 8 * hash(i + k)]], .6, '#8FA77A', 'inkfine', .4);
    }
  }

  function label(txt, x, y, at, t, col) {
    const k = seg(t, at, at + .4); if (k <= 0) return;
    letter(txt, x, y, 44, col, { pop: k, rot: -.03, font: '900 44px "NotoSC"' });
    boilSeed('ul' + txt);
    const d = easeOut(seg(t, at + .15, at + .7));
    if (d > .02) inkLine([[x - 110, y + 36], [x - 110 + 220 * d, y + 34 + 4 * Math.sin(d * 5)]], 2.2, col, 'dry', .5);
  }

  // ---------- 唯一的镜头 ----------
  function main(t, lt, dur) {
    const zoom = lerp(1.1, 1, ease(seg(t, 0, cue[2]))) * lerp(1, .94, ease(seg(t, cue[3], cue[3] + 1.3)));
    const panX = lerp(80, 0, ease(seg(t, 0, cue[1] + .7))) + Math.sin(t / 2.3) * 6;
    const panY = lerp(30, 0, ease(seg(t, cue[2], cue[3] + 1)));
    camBegin(960 - panX, 600 - panY, zoom);
    world(t);

    const firstCatch = A[0].at + A[0].dur, firstReturn = C[0].at + C[0].dur;
    const bLast = B[4].at + B[4].dur;
    const lit = easeOut(seg(t, bLast, bLast + 1.2));
    const bump = Math.max(0, ...landTimes(B).map(e => { const k = seg(t, e, e + .27); return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; }));
    factory(t, lit, bLast + .33, bump);

    const lastC = landTimes(C).filter(e => t >= e).pop() ?? -9;
    pile(SAVER.pile, 6 - launched(A, t) + landed(C, t), 'sp', clamp(1 - seg(t, lastC, lastC + .2)) * (t > lastC ? 1 : 0));
    pile(BIZ.pile, Math.max(0, landed(A, t) - launched(B, t)), 'bp');

    // 橙色：先看向蓝色 → 蓄力抛钱 → 开心 → 回报落下，吃惊 → 爱心
    const mS = emotions(t, [[0, 'neutral', { lookX: .2 }], [cue[0] + .3, 'thinking', { lookX: .9 }], [tA + 1, 'happy'], [firstReturn, 'surprised', { lookX: -.8 }], [firstReturn + .7, 'love']]);
    const hopS = jump(t, cue[3] + .3, cue[3] + .85, 2.5);
    const wind = ease(seg(t, tA - .35, tA)), fling = t >= tA && t < A[4].at + .3;
    let aRs = mS.aR ?? .2;
    if (t >= tA - .35 && t < tA) aRs = lerp(aRs, -1.1, wind);
    else if (fling) aRs = .9 + .5 * Math.sin((t - tA) * 28);
    else if (t >= A[4].at + .3 && t < A[4].at + .8) aRs = lerp(1.2, mS.aR ?? .2, ease(seg(t, A[4].at + .3, A[4].at + .8)));
    clawd(SAVER.x, G, U, { ...mS, aR: aRs, sq: (mS.sq || 0) + hopS.sq + .15 * wind * (t < tA ? 1 : 0), dy: (mS.dy || 0) + hopS.dy, boilKey: 'saver' });

    // 蓝色：发愁 → 接到钱吃惊 → 转向工厂扔钱 → 兴奋
    const mB = emotions(t, [[0, 'nervous'], [firstCatch, 'surprised', { lookX: -.8 }], [cue[1], 'hopeful', { lookX: .9 }], [tB + 1, 'starstruck']]);
    const catchSq = ring(t, landTimes(A), 9, 22) * .12;
    const hopB = jump(t, cue[3] + .5, cue[3] + 1.05, 2.2);
    let aRb = mB.aR ?? .2;
    if (t >= tB - .25 && t < B[4].at + .25) aRb = t < tB ? lerp(aRb, -1, seg(t, tB - .25, tB)) : .8 + .5 * Math.sin((t - tB) * 30);
    clawd(BIZ.x, G, U, { ...mB, ...BLUE, aR: aRb, sq: (mB.sq || 0) + catchSq + hopB.sq, dy: (mB.dy || 0) + hopB.dy, boilKey: 'biz' });

    flights(A, t, 'a'); flights(B, t, 'b'); flights(C, t, 'c');

    label('有余钱的人', SAVER.x - 60, G + 110, cue[0] + .13, t, PAL.clayDk);
    label('需要钱的人', BIZ.x - 40, G + 110, cue[1] + .07, t, BLUE.dk);
    camEnd();

    const tk = seg(t, cue[3], cue[3] + .45);
    if (tk > 0) {
      letter('金融 = 搬运钱', 960, 190, 110, PAL.clay, { pop: tk, rot: -.03 + .015 * Math.sin(t * 2.5), font: '900 110px "NotoSC"', screen: true });
      boilSeed('titleLine');
      const d = easeOut(seg(t, cue[3] + .27, cue[3] + .87));
      if (d > .02) inkLine([[630, 262], [630 + 660 * d, 256 + 6 * Math.sin(d * 4)]], 4, PAL.ochre, 'dry', .5);
    }
    flushLetters();
    if (lt < .6) iris(960, 560, lerp(0, 1500, easeIn(lt / .6)));
    if (lt > dur - .7) iris(960, 560, lerp(1500, 0, easeIn(seg(lt, dur - .7, dur - .1))));
  }

  shots([[0, main]]);
})();

/* 十四亿分之一 · 理财：行情、分仓、定投、个人养老金、高息理财
 * economy.js 只有一个“理财”数和一种风格，每年按风格随机涨跌。这一份把它变成能玩的系统：
 *
 * 行情（每一世不同，同一世里固定）：
 *   投胎时定一个种子 mktSeed。按年份推出一条行情链：疯牛 boom、牛市 bull、震荡 calm、熊市 bear、股灾 crash，
 *   前后相连（牛市之后容易回调，股灾之后常有反弹）。CN.marketMood(g) 是今年的行情，CN.marketRet(g) 是今年大盘涨跌。
 *   行情换了，生平里记一行“行情”。midlife.js 的“行情急转直下”“好行情”两件意外，只在股灾、疯牛的年份发生。
 *
 * 分仓（记忆键 pf = { safe, fund, stock, gold, hy }，单位元）：
 *   safe 定期国债，每年 2.5%；fund 指数基金，跟大盘走七成半；stock 自己炒股，跟大盘走、学识高的人多赚一点、波动大；
 *   gold 黄金，和股市反着走一点；hy 高息理财，说好的年化 8%，熊市里容易暴雷。
 *   invest（总数）、investStyle（占比最大的那一种）照旧写着，老剧情读它们不受影响。CN.invest / CN.withdraw 换成分仓版本。
 *
 * 定投（dca = 收入的几成）：每年年底从存款里拿出这一份买指数基金（留够半年开销）。
 * 个人养老金（paYear）：每年存 ¥12,000 进账户（paAcct），按 3.5% 长；退休后每年领账户的二十分之一（economy.js 的 CN.income）。
 * 养老年金（annuity）：六十二岁时可以一次买下，退休后每年固定领一笔。
 * 一生理财赚了多少记在 finGain，墓志页和分享卡用。
 *
 * 抉择（都是人生主干，major: true）：三十一岁开不开个人养老金账户、三十九岁碰上高息理财、四十五岁盘家底、六十二岁退休前的钱；
 * 回响：高息理财的下场、定投的成果、个人养老金每月领多少。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const fmt = (x) => CN.fmt(x);
  const on = (g) => !!g.recall('money0');
  const cash = (g) => CN.cash(g);
  const w1 = (x) => Math.max(0, Math.round(x / 1000) * 1000);
  const hasKid = (g) => ['k1', 'k2', 'k3'].some((id) => JY.byId[id] && g.alive(id));
  const working = (g) => { const j = g.recall('job'); return !!j && j !== 'none' && j !== 'retired' && !g.recall('retired'); };

  /* ---------- 行情链 ---------- */
  const MOODS = ['boom', 'bull', 'calm', 'bear', 'crash'];
  const MOOD_T = { boom: '疯牛', bull: '牛市', calm: '震荡', bear: '熊市', crash: '股灾' };
  const RET = { boom: 0.35, bull: 0.14, calm: 0.04, bear: -0.13, crash: -0.32 };
  const NEXT = {
    calm: [['calm', 0.55], ['bull', 0.25], ['bear', 0.17], ['crash', 0.03]],
    bull: [['bull', 0.48], ['boom', 0.1], ['calm', 0.25], ['bear', 0.14], ['crash', 0.03]],
    boom: [['bear', 0.45], ['crash', 0.25], ['calm', 0.3]],
    bear: [['bear', 0.38], ['calm', 0.35], ['bull', 0.15], ['crash', 0.12]],
    crash: [['bull', 0.4], ['calm', 0.35], ['bear', 0.25]],
  };
  // 种子随机数（同一个种子推出同一条行情链）
  const prng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const CACHE = {};
  function chain(seed) {
    if (CACHE[seed]) return CACHE[seed];
    const r = prng(seed), out = {};
    let m = 'calm';
    for (let y = 2026; y <= 2140; y++) {
      const p = r(); let acc = 0;
      for (const [k, w] of NEXT[m]) { acc += w; if (p < acc) { m = k; break; } }
      out[y] = { m, r: RET[m] + (r() - 0.5) * 0.1 };
    }
    return (CACHE[seed] = out);
  }
  const seedOf = (g) => { let s = g.recall('mktSeed'); if (s == null) { s = Math.floor(Math.random() * 1e9); g.remember('mktSeed', s); } return s; };
  CN.marketMood = (g, Y) => chain(seedOf(g))[Y || g.Y].m;
  CN.marketRet = (g, Y) => chain(seedOf(g))[Y || g.Y].r;
  CN.moodName = (m) => MOOD_T[m] || '';
  // 投胎时就定下这一世的行情
  const gen = JY.GENERATE;
  JY.GENERATE = () => { const r = gen(); r.me.mem.mktSeed = Math.floor(Math.random() * 1e9); return r; };

  /* ---------- 分仓 ---------- */
  const BK = ['safe', 'fund', 'stock', 'gold', 'hy'];
  const BK_T = { safe: '定期国债', fund: '指数基金', stock: '股票', gold: '黄金', hy: '高息理财' };
  const sum = (pf) => BK.reduce((a, k) => a + (pf[k] || 0), 0);
  CN.pf = (g) => {
    let pf = Object.assign({}, g.recall('pf') || {});
    const inv = Number(g.recall('invest')) || 0;
    // 老剧情直接改过 invest（例如“行情急转直下”的 gain）：按占比最大的风格补齐
    if (Math.abs(sum(pf) - inv) > 1) {
      const d = inv - sum(pf), k = g.recall('investStyle') || 'fund';
      pf[k] = Math.max(0, (pf[k] || 0) + d);
    }
    return pf;
  };
  const setPf = (g, pf) => {
    BK.forEach((k) => { pf[k] = Math.max(0, Math.round(pf[k] || 0)); if (!pf[k]) delete pf[k]; });
    g.remember('pf', pf);
    const tot = sum(pf);
    g.remember('invest', tot);
    g.remember('investStyle', tot ? BK.slice().sort((a, b) => (pf[b] || 0) - (pf[a] || 0))[0] : '');
  };
  CN.invest = (g, yuan, style) => {
    if (!on(g)) return 0;
    const amt = Math.max(0, Math.min(yuan, Math.max(0, cash(g))));
    if (!amt) return 0;
    CN.pay(g, amt);
    const pf = CN.pf(g);
    const k = BK.includes(style) ? style : 'fund';
    pf[k] = (pf[k] || 0) + amt;
    setPf(g, pf);
    CN.pay(g, 0); // 同步“财富”
    return amt;
  };
  // 取出：不写 style 就全部取出
  CN.withdraw = (g, style) => {
    const pf = CN.pf(g);
    const ks = style ? [style] : BK;
    let got = 0;
    ks.forEach((k) => { got += pf[k] || 0; delete pf[k]; });
    setPf(g, pf);
    CN.earn(g, got);
    return got;
  };
  // 从一种换到另一种
  const move = (g, from, to, share) => {
    const pf = CN.pf(g);
    let amt = 0;
    [].concat(from).forEach((k) => { const a = Math.round((pf[k] || 0) * (share == null ? 1 : share)); pf[k] = (pf[k] || 0) - a; amt += a; });
    pf[to] = (pf[to] || 0) + amt;
    setPf(g, pf);
    return amt;
  };
  CN.pfText = (g) => {
    const pf = CN.pf(g);
    return BK.filter((k) => pf[k] > 0).map((k) => BK_T[k] + ' ' + fmt(pf[k])).join(' · ');
  };
  // 理财账户的总数（不含个人养老金账户）
  const inv = (g) => sum(CN.pf(g));
  const gainAll = (g) => Number(g.recall('finGain')) || 0;
  const addGain = (g, d) => g.remember('finGain', Math.round(gainAll(g) + d));

  /* 年底：定投、个人养老金、各仓涨跌、高息理财暴雷、行情换了记一行（economy.js 的 ledger 调用） */
  CN.pfYear = (g, age) => {
    const out = [];
    if (!on(g)) return out;
    const m = CN.marketMood(g), mr = CN.marketRet(g);
    const prev = CN.marketMood(g, g.Y - 1);
    const expense = Number(g.recall('expense')) || 40000;
    // 定投：收入的几成，留够半年开销
    const dca = Number(g.recall('dca')) || 0;
    if (dca && working(g)) {
      const a = w1(Math.min(CN.income(g) * dca, cash(g) - expense / 2));
      if (a >= 1000) { CN.invest(g, a, 'fund'); g.remember('dcaTotal', (Number(g.recall('dcaTotal')) || 0) + a); }
    }
    // 个人养老金：每年存一万二，存到退休
    if (g.recall('paYear') && age < 65 && working(g) && cash(g) >= 12000 + expense / 4) {
      CN.pay(g, 12000);
      g.remember('paAcct', Math.round((Number(g.recall('paAcct')) || 0) + 12000));
    }
    if (g.recall('paAcct') && age < 65) g.remember('paAcct', Math.round(Number(g.recall('paAcct')) * 1.035));
    // 各仓涨跌（这一年剧情里已经算过大涨大跌的，不再重复）
    const pf = CN.pf(g);
    const skip = g.since('crash') === 0 || g.since('boom') === 0;
    const xue = g.s('学识');
    const noise = () => (Math.random() - 0.5) * 2;
    const R = {
      safe: 0.025,
      fund: skip ? 0 : 0.02 + 0.75 * mr + noise() * 0.03,
      stock: skip ? 0 : mr * 1.15 + (xue - 60) / 500 + noise() * 0.12,
      gold: 0.035 - 0.25 * mr + noise() * 0.08,
      hy: 0.08,
    };
    let delta = 0;
    BK.forEach((k) => { if (pf[k]) { const d = pf[k] * R[k]; pf[k] += d; delta += d; } });
    // 高息理财暴雷
    if (pf.hy) {
      const p = { boom: 0.02, bull: 0.03, calm: 0.05, bear: 0.16, crash: 0.3 }[m];
      if (Math.random() < p) {
        const left = Math.round(pf.hy * (0.1 + Math.random() * 0.2));
        const lost = pf.hy - left;
        delta -= lost;
        delete pf.hy;
        CN.earn(g, left);
        g.remember('hyBlown', lost);
        out.push('那款“年化 8%”的理财暴雷了。平台的客服电话打不通，群里几百个人在问。最后只退回来 ' + fmt(left) + '，' + fmt(lost) + ' 没了。');
      }
    }
    setPf(g, pf);
    addGain(g, delta);
    if (inv(g) > 0 && m !== prev && ['boom', 'crash', 'bear', 'bull'].includes(m)) {
      const tot = inv(g);
      out.push('行情：这一年' + { boom: '股市疯涨，地铁里人人都在看行情', bull: '股市转暖，理财群里又热闹起来', bear: '股市一路往下走，理财群里没人说话', crash: '股市暴跌，新闻里天天在讲' }[m] + '。你的理财账户现在是 ' + fmt(tot) + (Math.abs(delta) >= 5000 ? '，这一年' + (delta >= 0 ? '赚了 ' : '亏了 ') + fmt(Math.abs(delta)) : '') + '。');
    }
    return out;
  };

  /* ---------- 抉择 ---------- */
  let A = 0, B = 0;
  const net = (g) => cash(g) + inv(g);
  JY.addLifeNodes([
    { id: 'f_pension', age: 31, t: '个人养老金', loc: 'office', major: true,
      cond: (g) => on(g) && working(g) && cash(g) >= 20000,
      text: (g) => '公司的 HR 在群里发通知：可以开个人养老金账户了。每年最多存 ¥12,000，退休以前取不出来，存进去的钱能少交一点税。你现在卡里有 ' + fmt(cash(g)) + '。',
      stake: '每年锁住一万二，换退休以后多一份收入。',
      choices: [
        { t: '开户，每年存满', dev: 20, hint: '每年少花 ¥12,000；退休后每年多领一笔，越早存越多',
          fx: (g) => { g.remember('paYear', true); g.stat('事业', 1); }, res: '你在手机上点了几下，账户开好了。第一笔一万二转进去，余额那一栏一下子瘦了。' },
        { t: '不开，钱放在手边踏实', canon: true, hint: '手头宽裕，退休只靠基本养老金',
          fx: (g) => { g.remember('paYear', false); g.stat('心情', 1); }, res: '你把通知划了过去。三十出头，退休还像是别人的事。' },
      ] },
    { id: 'f_hy', age: 39, t: '年化 8%', loc: 'office', major: true,
      cond: (g) => on(g) && cash(g) >= 100000,
      text: (g) => '一个老同学在饭桌上说起一款理财：年化 8%，“保本”，他买了两年，每个月利息准时到账。你卡里有 ' + fmt(cash(g)) + '，银行定期一年才 2% 多一点。',
      stake: '利息是定期的三倍。代价是什么，没人说得清。',
      choices: [
        { t: (g) => '拿一半存款买（' + fmt(w1(cash(g) / 2)) + '）', dev: 25, hint: '每年多拿一大笔利息；万一暴雷，这一半可能没了',
          fx: (g) => { A = CN.invest(g, w1(cash(g) / 2), 'hy'); g.remember('hy', 'half'); }, res: () => '你把 ' + fmt(A) + ' 转了过去。第一个月的利息到账时，你截图发给了' + '家里人看。' },
        { t: (g) => '买一点试试（' + fmt(w1(cash(g) * 0.15)) + '）', dev: 10, hint: '少赚一点，也少担心一点',
          fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.15), 'hy'); g.remember('hy', 'some'); }, res: () => '你只买了 ' + fmt(A) + '。老同学说你胆子太小。' },
        { t: '不碰，太高的利息都是坑', canon: true, hint: '少赚，睡得着觉', check: ['学识', 45],
          fx: (g) => { g.remember('hy', 'no'); g.stat('心情', 1); }, res: '你笑着说再看看。回家路上，你查了查那家平台的名字。',
          fail: { fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.15), 'hy'); g.remember('hy', 'some'); }, res: () => '你本想不碰，架不住老同学天天发收益截图，最后还是买了 ' + fmt(A) + '。' } },
      ] },
    { id: 'f_hy_echo', age: 44, t: '那款理财', auto: true,
      cond: (g) => !!g.recall('hy') && g.recall('hy') !== 'no',
      echoOf: 'f_hy',
      text: (g) => (g.recall('hyBlown') ? '那款理财暴雷以后，你再也没买过“保本高息”的东西。老同学也亏了，你们在群里谁也没提。' : '那款理财一直按时付利息。你还是有点不放心，每个月都打开看一眼。') },
    { id: 'f_review45', age: 45, t: '盘一盘家底', loc: 'home', major: true,
      cond: (g) => on(g) && net(g) >= 50000,
      text: (g) => {
        const pt = CN.pfText(g), gn = gainAll(g);
        return '年底，你把所有的账都翻出来算了一遍。存款 ' + fmt(cash(g)) + (pt ? '，理财：' + pt : '，理财账户里没钱') + '。' + (gn ? '这些年理财一共' + (gn >= 0 ? '赚了 ' : '亏了 ') + fmt(Math.abs(gn)) + '。' : '') + '今年的行情：' + CN.moodName(CN.marketMood(g)) + '。';
      },
      stake: '离退休还有二十年。往后这些钱，是求稳，还是让它多干点活。',
      choices: [
        { t: '照旧，不折腾', canon: true, hint: '怎么放的还怎么放', fx: (g) => { g.remember('review45', 'keep'); }, res: '你合上了本子。钱放在哪儿，日子照样过。' },
        { t: '求稳：股票、基金都换成定期和国债', dev: 15, cond: (g) => { const p = CN.pf(g); return (p.stock || 0) + (p.fund || 0) + (p.hy || 0) > 0; }, hint: '不怕熊市，每年稳拿 2.5%',
          fx: (g) => { A = move(g, ['stock', 'fund', 'hy'], 'safe'); g.remember('review45', 'safe'); }, res: () => '你把 ' + fmt(A) + ' 全换成了定期和国债。以后行情怎么走，都和你没多大关系了。' },
        { t: (g) => (g.recall('dca') ? '定投加到收入的两成' : '每年拿收入的一成定投指数基金'), dev: 15, hint: '每年自动买一点，涨跌都不管，越久越占便宜',
          fx: (g) => { g.remember('dca', g.recall('dca') ? 0.2 : 0.1); g.remember('review45', 'dca'); }, res: '你设好了自动扣款，然后把软件挪到了手机的最后一页。' },
        { t: (g) => '加仓股票，搏一把（' + fmt(w1(cash(g) * 0.4)) + '）', dev: 25, cond: (g) => cash(g) >= 50000, hint: '牛市翻倍，熊市腰斩；学识高的人胜算大一些',
          fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.4), 'stock'); g.remember('review45', 'stock'); }, res: () => '你买进了 ' + fmt(A) + ' 的股票。那天晚上，你看了三遍分时图。' },
      ] },
    { id: 'f_review_echo', age: 52, t: '七年以后', auto: true,
      cond: (g) => !!g.recall('review45') && on(g),
      echoOf: 'f_review45',
      text: (g) => {
        const r = g.recall('review45'), gn = gainAll(g);
        const head = { keep: '这些年你没怎么动过那些钱。', safe: '定期和国债一年一年地滚。', dca: '定投一直没停，扣款短信你早就不看了。', stock: '那次加仓以后，你学会了看财报，也学会了关掉软件。' }[r] || '';
        return head + '算下来，这辈子理财一共' + (gn >= 0 ? '赚了 ' : '亏了 ') + fmt(Math.abs(gn)) + '，账户里现在是 ' + fmt(inv(g)) + '。';
      } },
    { id: 'f_retire62', age: 62, t: '退休前的钱', loc: 'home', major: true,
      cond: (g) => on(g) && net(g) >= 80000,
      text: (g) => '还有三年退休。存款 ' + fmt(cash(g)) + (inv(g) ? '，理财 ' + fmt(inv(g)) : '') + (g.recall('paAcct') ? '，个人养老金账户里攒了 ' + fmt(g.recall('paAcct')) : '') + '。银行的经理说，到了这个年纪，钱要“稳”。',
      stake: '往后几十年没有工资了。这些钱要撑多久，你说了算。',
      choices: [
        { t: '全部换成定期和国债', canon: true, hint: '稳，涨得慢', fx: (g) => { A = move(g, ['stock', 'fund', 'hy', 'gold'], 'safe'); g.remember('retire62', 'safe'); }, res: () => (A ? '你把 ' + fmt(A) + ' 换成了定期。' : '') + '账户里的数字，以后只会慢慢地涨了。' },
        { t: (g) => '买一份养老年金（一次交 ' + fmt(w1(cash(g) * 0.5)) + '，活多久领多久）', dev: 20, cond: (g) => cash(g) >= 60000, hint: '活得越久越划算；走得早，钱就留在了保险公司',
          fx: (g) => { A = w1(cash(g) * 0.5); CN.pay(g, A); g.remember('annuity', Math.round(A / 14)); g.remember('retire62', 'annuity'); }, res: () => '你签了字，交了 ' + fmt(A) + '。从六十五岁起，每年能领 ' + fmt(Math.round(A / 14)) + '，领到走的那天。' },
        { t: (g) => '拿一笔给孩子（' + fmt(w1(net(g) * 0.3)) + '）', dev: 15, cond: (g) => hasKid(g), hint: '孩子手头宽裕，你手头紧一点',
          fx: (g) => { A = w1(Math.min(cash(g), net(g) * 0.3)); CN.pay(g, A); g.remember('retire62', 'kid'); g.stat('人缘', 4); }, res: () => '你把 ' + fmt(A) + ' 转给了孩子。孩子说不要，你说先拿着。' },
        { t: '留一部分在基金里，跟着行情走', dev: 10, cond: (g) => !hasKid(g) || cash(g) < 60000, hint: '多一点收益，也多一点起伏',
          fx: (g) => { A = move(g, ['stock', 'hy'], 'fund'); g.remember('retire62', 'fund'); }, res: '你留了一部分在基金里。退休以后，看行情成了你的一个消遣。' },
      ] },
    { id: 'f_pension_echo', age: 66, t: '养老金到账', auto: true,
      cond: (g) => !!(g.recall('paAcct') || g.recall('annuity') || g.recall('dca') || g.recall('retire62') === 'kid'),
      echoOf: ['f_pension', 'f_retire62', 'f_review45'],
      text: (g) => {
        const bits = [];
        const pa = Number(g.recall('paAcct')) || 0, an = Number(g.recall('annuity')) || 0;
        if (pa) bits.push('个人养老金账户里攒了 ' + fmt(pa) + '，每个月多领 ' + fmt(pa / 20 / 12));
        if (an) bits.push('养老年金每个月到账 ' + fmt(an / 12));
        if (g.recall('retire62') === 'kid') bits.push('三年前给孩子的那笔钱，孩子拿去付了首付，新家的钥匙给了你一把');
        if (g.recall('dca')) bits.push('定投一共投进去 ' + fmt(g.recall('dcaTotal') || 0) + '，账户里现在是 ' + fmt(inv(g)));
        return (pa || an ? '退休后的第一个月，几笔钱陆续到账。' : '退休了。') + bits.join('；') + '。你把这些数抄在了一张纸上，压在玻璃板底下。';
      } },
  ]);
})();

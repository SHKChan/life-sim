/* 由 share/tools/tr.js 从 data/finance.js 和 lang/en/tr/finance.json 生成，不要手改。 */
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
  const MOOD_T = { boom: 'Mania', bull: 'Bull market', calm: 'Choppy', bear: 'Bear market', crash: 'Crash' };
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
  const BK_T = { safe: 'Deposits & bonds', fund: 'Index funds', stock: 'Stocks', gold: 'Gold', hy: 'High-yield product' };
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
        out.push('That “8% a year” product collapsed. The platform’s hotline rang out, and hundreds of people were asking in the group chat. In the end only ' + fmt(left) + ', ' + fmt(lost) + ' was simply gone.');
      }
    }
    setPf(g, pf);
    addGain(g, delta);
    if (inv(g) > 0 && m !== prev && ['boom', 'crash', 'bear', 'bull'].includes(m)) {
      const tot = inv(g);
      out.push('Market: this year ' + { boom: 'stocks went wild; everyone on the subway was watching charts', bull: 'stocks warmed up and the investing group chats came alive again', bear: 'stocks slid all year; the investing group chats went quiet', crash: 'stocks crashed; it was on the news every day' }[m] + '. Your investment account now holds ' + fmt(tot) + (Math.abs(delta) >= 5000 ? '; this year you ' + (delta >= 0 ? 'gained ' : 'lost ') + fmt(Math.abs(delta)) : '') + '. ');
    }
    return out;
  };

  /* ---------- 抉择 ---------- */
  let A = 0, B = 0;
  const net = (g) => cash(g) + inv(g);
  JY.addLifeNodes([
    { id: 'f_pension', age: 31, t: 'Private pension', loc: 'office', major: true,
      cond: (g) => on(g) && working(g) && cash(g) >= 20000,
      text: (g) => 'HR posts in the work chat: you can now open a private pension account. Up to $1,700 a year, locked until retirement, and it lowers your tax a little. You have ' + fmt(cash(g)) + '. ',
      stake: 'Lock away $1,700 a year in exchange for extra income after you retire.',
      choices: [
        { t: 'Open it and pay in the maximum every year', dev: 20, hint: '$1,700 less to spend each year; a bigger payout in retirement the earlier you start',
          fx: (g) => { g.remember('paYear', true); g.stat('事业', 1); }, res: 'A few taps on your phone and the account is open. The first payment goes in and your balance looks suddenly thin.' },
        { t: 'Skip it; cash on hand feels safer', canon: true, hint: 'More cash now; only the basic state pension later',
          fx: (g) => { g.remember('paYear', false); g.stat('心情', 1); }, res: 'You swipe the message away. In your early thirties, retirement still feels like someone else’s problem.' },
      ] },
    { id: 'f_hy', age: 39, t: '8% a year', loc: 'office', major: true,
      cond: (g) => on(g) && cash(g) >= 100000,
      text: (g) => 'Over dinner an old classmate brags about a wealth product: 8% a year, “principal guaranteed”. He has held it two years and the interest arrives every month like clockwork. You have ' + fmt(cash(g)) + ' in the bank, where a fixed deposit pays barely over 2%.',
      stake: 'Three times the bank rate. Nobody can say what the catch is.',
      choices: [
        { t: (g) => 'Put in half your savings (' + fmt(w1(cash(g) / 2)) + ')', dev: 25, hint: 'A lot more interest every year; if it blows up, that half could vanish',
          fx: (g) => { A = CN.invest(g, w1(cash(g) / 2), 'hy'); g.remember('hy', 'half'); }, res: () => 'You moved ' + fmt(A) + ' over. When the first month’s interest arrived, you sent a screenshot to ' + 'the family.' },
        { t: (g) => 'Try a little (' + fmt(w1(cash(g) * 0.15)) + ')', dev: 10, hint: 'Earn a little less, worry a little less',
          fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.15), 'hy'); g.remember('hy', 'some'); }, res: () => 'You only put in ' + fmt(A) + '. Your classmate says you have no nerve.' },
        { t: 'Stay away; interest that high is a trap', canon: true, hint: 'Earn less, sleep well', check: ['学识', 45],
          fx: (g) => { g.remember('hy', 'no'); g.stat('心情', 1); }, res: 'You smile and say you will think about it. On the way home you look the platform up.',
          fail: { fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.15), 'hy'); g.remember('hy', 'some'); }, res: () => 'You meant to stay away, but your classmate kept posting screenshots of his returns, and in the end you bought ' + fmt(A) + '. ' } },
      ] },
    { id: 'f_hy_echo', age: 44, t: 'That product', auto: true,
      cond: (g) => !!g.recall('hy') && g.recall('hy') !== 'no',
      echoOf: 'f_hy',
      text: (g) => (g.recall('hyBlown') ? 'After that product collapsed you never touched anything “guaranteed, high-yield” again. Your classmate lost money too; neither of you ever mentioned it in the group chat.' : 'The product kept paying on time. You still felt uneasy and checked it every month.') },
    { id: 'f_review45', age: 45, t: 'Taking stock', loc: 'home', major: true,
      cond: (g) => on(g) && net(g) >= 50000,
      text: (g) => {
        const pt = CN.pfText(g), gn = gainAll(g);
        return 'At year end you go through every account. Savings ' + fmt(cash(g)) + (pt ? '; investments: ' + pt : '; nothing invested') + '. ' + (gn ? 'Over the years your investments have ' + (gn >= 0 ? 'gained ' : 'lost ') + fmt(Math.abs(gn)) + '. ' : '') + 'This year’s market: ' + CN.moodName(CN.marketMood(g)) + '. ';
      },
      stake: 'Twenty years to retirement. Play it safe with this money, or make it work harder?',
      choices: [
        { t: 'Leave it as it is', canon: true, hint: 'Nothing changes', fx: (g) => { g.remember('review45', 'keep'); }, res: 'You close the notebook. Wherever the money sits, life goes on.' },
        { t: 'Play safe: move stocks and funds into deposits and bonds', dev: 15, cond: (g) => { const p = CN.pf(g); return (p.stock || 0) + (p.fund || 0) + (p.hy || 0) > 0; }, hint: 'No fear of bear markets; a steady 2.5% a year',
          fx: (g) => { A = move(g, ['stock', 'fund', 'hy'], 'safe'); g.remember('review45', 'safe'); }, res: () => 'You moved ' + fmt(A) + ' into deposits and bonds. Whatever the market does now, it barely touches you.' },
        { t: (g) => (g.recall('dca') ? 'Raise your monthly index-fund buying to 20% of income' : 'Put 10% of your income into an index fund every year'), dev: 15, hint: 'Buy a little automatically, ignore the swings; time does the work',
          fx: (g) => { g.remember('dca', g.recall('dca') ? 0.2 : 0.1); g.remember('review45', 'dca'); }, res: 'You set up the automatic payments, then moved the app to the last screen of your phone.' },
        { t: (g) => 'Go big on stocks (' + fmt(w1(cash(g) * 0.4)) + ')', dev: 25, cond: (g) => cash(g) >= 50000, hint: 'Double in a bull market, halve in a bear; high Smarts improves your odds',
          fx: (g) => { A = CN.invest(g, w1(cash(g) * 0.4), 'stock'); g.remember('review45', 'stock'); }, res: () => 'You bought ' + fmt(A) + ' of stocks. That night you checked the intraday chart three times.' },
      ] },
    { id: 'f_review_echo', age: 52, t: 'Seven years on', auto: true,
      cond: (g) => !!g.recall('review45') && on(g),
      echoOf: 'f_review45',
      text: (g) => {
        const r = g.recall('review45'), gn = gainAll(g);
        const head = { keep: 'You barely touched that money over the years.', safe: 'The deposits and bonds rolled over year after year.', dca: 'The automatic buying never stopped; you stopped reading the debit texts long ago.', stock: 'After going big that time, you learned to read earnings reports, and to close the app.' }[r] || '';
        return head + 'All told, your investments have ' + (gn >= 0 ? 'gained ' : 'lost ') + fmt(Math.abs(gn)) + '; the account now holds ' + fmt(inv(g)) + '. ';
      } },
    { id: 'f_retire62', age: 62, t: 'Money before retirement', loc: 'home', major: true,
      cond: (g) => on(g) && net(g) >= 80000,
      text: (g) => 'Three years to retirement. Savings ' + fmt(cash(g)) + (inv(g) ? ', investments ' + fmt(inv(g)) : '') + (g.recall('paAcct') ? ', private pension ' + fmt(g.recall('paAcct')) : '') + '. The bank manager says at your age, money should be “safe”.',
      stake: 'No more paychecks for decades. How long this money lasts is up to you.',
      choices: [
        { t: 'Move everything into deposits and bonds', canon: true, hint: 'Safe, slow growth', fx: (g) => { A = move(g, ['stock', 'fund', 'hy', 'gold'], 'safe'); g.remember('retire62', 'safe'); }, res: () => (A ? 'You moved ' + fmt(A) + ' into fixed deposits. ' : '') + 'From now on the numbers will only creep up.' },
        { t: (g) => 'Buy a lifetime annuity (pay ' + fmt(w1(cash(g) * 0.5)) + ' once, get paid for as long as you live)', dev: 20, cond: (g) => cash(g) >= 60000, hint: 'The longer you live, the better the deal; die early and the insurer keeps it',
          fx: (g) => { A = w1(cash(g) * 0.5); CN.pay(g, A); g.remember('annuity', Math.round(A / 14)); g.remember('retire62', 'annuity'); }, res: () => 'You sign and pay ' + fmt(A) + '. From 65 you will receive ' + fmt(Math.round(A / 14)) + ' a year, until the day you go.' },
        { t: (g) => 'Give your child a sum (' + fmt(w1(net(g) * 0.3)) + ')', dev: 15, cond: (g) => hasKid(g), hint: 'Your child breathes easier; you, a bit less',
          fx: (g) => { A = w1(Math.min(cash(g), net(g) * 0.3)); CN.pay(g, A); g.remember('retire62', 'kid'); g.stat('人缘', 4); }, res: () => 'You moved ' + fmt(A) + ' to your child. They said no; you told them to take it anyway.' },
        { t: 'Keep some in funds and ride the market', dev: 10, cond: (g) => !hasKid(g) || cash(g) < 60000, hint: 'A bit more return, a bit more ups and downs',
          fx: (g) => { A = move(g, ['stock', 'hy'], 'fund'); g.remember('retire62', 'fund'); }, res: 'You leave some in funds. In retirement, watching the market becomes a hobby.' },
      ] },
    { id: 'f_pension_echo', age: 66, t: 'Pension day', auto: true,
      cond: (g) => !!(g.recall('paAcct') || g.recall('annuity') || g.recall('dca') || g.recall('retire62') === 'kid'),
      echoOf: ['f_pension', 'f_retire62', 'f_review45'],
      text: (g) => {
        const bits = [];
        const pa = Number(g.recall('paAcct')) || 0, an = Number(g.recall('annuity')) || 0;
        if (pa) bits.push('your private pension account holds ' + fmt(pa) + ', worth an extra monthly ' + fmt(pa / 20 / 12));
        if (an) bits.push('the annuity pays a monthly ' + fmt(an / 12));
        if (g.recall('retire62') === 'kid') bits.push('the money you gave your child three years ago became a down payment, and they gave you a key to the new place');
        if (g.recall('dca')) bits.push('your automatic investing put in ' + fmt(g.recall('dcaTotal') || 0) + '; the account now holds ' + fmt(inv(g)));
        return (pa || an ? 'In your first month of retirement, several payments arrive: ' : 'You retire: ') + bits.join('; ') + '. You copy the numbers onto a slip of paper and tuck it under the glass on your desk.';
      } },
  ]);
})();

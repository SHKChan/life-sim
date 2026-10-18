/* 十四亿分之一 · 钱、房子、和谁住在一起
 * 这一份不写剧情，只放每一世都要算的账和工具函数（都挂在 JY.CN 上，剧情文件直接用）。
 *
 * 钱（成年以后）：
 *   存款 cash（元）、理财 invest（元）、房子 houseVal（万）、欠款 debt（万，房贷、借的钱都算）。
 *   每年末按职业、城市、事业算收入，按家里几口人、住哪儿算开销，房贷按年还。
 *   属性“财富”从净资产换算出来（0–100），旧剧情里的 g.stat('财富', ±n) 会换算成一笔钱。
 *   未成年时“财富”表示家境，界面显示“家境 小康”这样的分档；十八岁（或开始工作）起才有自己的钱。
 *   钱都按 2026 年的物价算，不算通胀，读起来直观。
 *
 * 和谁住（household，记忆键 hh）：
 *   一个 id 列表。出生时是爸妈（留守儿童是爷爷奶奶）和哥哥姐姐；离家上学、工作、结婚、生孩子、
 *   接爸妈同住、孩子离家、住养老院，都会改它。场景画的人、场景下面那行字、家人卡里的“同住”都读它。
 *   剧情要写“一个人”“家里几口人”“要不要把爸妈接来”之前，先读 CN.livesWith / CN.alone / CN.hhCount。
 *
 * 剧情里常用的：
 *   CN.fmt(元)                     '¥3,200' / '¥12.5 万'，按界面语言换成美元
 *   CN.pay(g, 元) / CN.earn(g, 元)  花钱、进账（直接改存款）
 *   CN.cash(g) / CN.net(g)         存款、净资产（元）
 *   CN.income(g)                   今年全家的年收入（元）
 *   CN.price(g, tier)              一套普通住房的价格（万），tier 默认是现在住的城市
 *   CN.buyHouse(g, { tier, city, down })   买房：down 是首付比例（默认 0.3，1 表示全款）
 *   CN.sellHouse(g)                卖房，钱进存款，房贷还清
 *   CN.invest(g, 元, 'safe'|'fund'|'stock'|'gold') / CN.withdraw(g)   理财，每年按风险涨跌
 *   CN.liveWith(g, ['fa', 'mo'])   这些人搬来和你住；CN.moveOut(g, ['fa'])  搬走
 *   CN.livesWith(g, id)            是否同住；CN.alone(g) 一个人住；CN.hhCount(g) 家里几口人（含自己）
 *   CN.hhText(g)                   '和妻子、女儿住在一起' / '一个人住' / '住在学校宿舍'
 *   CN.who(g, id, age)             '你的爷爷王建国'，age 为真时加“（81 岁）”
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 数字 ---------- */
  // 年收入基数（元，按省会城市、事业 50 估）
  const INCOME = { none: 0, farmer: 30000, worker: 70000, rider: 80000, driver: 80000, shop: 70000, office: 100000, tech: 200000, civil: 110000, teacher: 100000, doctor: 160000, nurse: 90000, sales: 100000, boss: 180000, creator: 70000, soldier: 80000, freelance: 80000, retired: 0 };
  const TIER_INC = { 1: 1.5, 2: 1, 3: 0.8, 4: 0.65, 5: 0.5 };
  // 一个成年人一年的日常开销、一年房租（元），一套普通住房（万）
  const LIVE = { 1: 60000, 2: 45000, 3: 36000, 4: 28000, 5: 18000 };
  const RENT = { 1: 60000, 2: 30000, 3: 18000, 4: 12000, 5: 6000 };
  const PRICE = { 1: 600, 2: 200, 3: 90, 4: 55, 5: 25 };
  const PENSION = { high: 60000, mid: 40000, low: 3600, savings: 12000 };
  const STUDY = ['uni', 'college', 'repeat', 'grad', 'phd', 'abroad'];
  // 理财：期望年收益、波动
  const RISK = { safe: [0.025, 0], fund: [0.05, 0.15], stock: [0.06, 0.3], gold: [0.04, 0.12] };
  const RISK_T = { safe: '存定期和国债', fund: '买基金', stock: '炒股', gold: '买黄金' };
  // 成年时手里的钱：按家境
  const START = { rich: 300000, civil: 50000, white: 40000, smallbiz: 30000, worker: 12000, farmer: 6000, migrant: 6000 };

  const L_ = () => JY.engine.get().L;
  // 账上的数字（读记忆要写成字面的 g.recall('键')，后果检查才认得）
  const V = {
    cash: (g) => Number(g.recall('cash')) || 0,
    invest: (g) => Number(g.recall('invest')) || 0,
    houseVal: (g) => Number(g.recall('houseVal')) || 0,
    debt: (g) => Number(g.recall('debt')) || 0,
    loanBase: (g) => Number(g.recall('loanBase')) || 0,
    lastDebt: (g) => Number(g.recall('lastDebt')) || 0,
    lastBand: (g) => Number(g.recall('lastBand')) || 0,
    income: (g) => Number(g.recall('income')) || 0,
  };
  const tierOf = (g) => g.recall('tier') || 5;
  const rnd = () => Math.random();
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / Math.sqrt(0.5); };

  /* ---------- 钱的显示 ---------- */
  const USD = 7; // 其他语言按美元显示，一美元约七元
  CN.fmt = (yuan) => {
    const n = Math.round(Number(yuan) || 0);
    const neg = n < 0 ? '-' : '';
    const a = Math.abs(n);
    if ((JY.LANG || 'zh') !== 'zh') {
      const d = a / USD;
      if (d >= 1e6) return neg + '$' + (d / 1e6).toFixed(d >= 1e7 ? 0 : 1) + 'M';
      if (d >= 1e4) return neg + '$' + Math.round(d / 1e3) + 'K';
      return neg + '$' + Math.round(d).toLocaleString('en-US');
    }
    if (a >= 1e8) return neg + '¥' + (a / 1e8).toFixed(a >= 1e9 ? 0 : 1) + ' 亿';
    if (a >= 1e4) return neg + '¥' + (a >= 1e6 ? Math.round(a / 1e4) : (a / 1e4).toFixed(1).replace(/\.0$/, '')) + ' 万';
    return neg + '¥' + a.toLocaleString('en-US');
  };

  /* ---------- 账户 ---------- */
  const on = (g) => !!g.recall('money0');
  CN.cash = (g) => V.cash(g);
  CN.net = (g) => V.cash(g) + V.invest(g) + (V.houseVal(g) - V.debt(g)) * 1e4;
  const setCash = (g, v) => g.remember('cash', Math.round(v));
  CN.pay = (g, yuan) => { if (on(g)) { setCash(g, CN.cash(g) - Math.max(0, yuan)); syncWealth(g); } };
  CN.earn = (g, yuan) => { if (on(g)) { setCash(g, CN.cash(g) + Math.max(0, yuan)); syncWealth(g); } };
  CN.price = (g, tier) => PRICE[tier || tierOf(g)] || PRICE[3];

  // 净资产（万）换成 0–100 的“财富”：没钱 20 左右，十万 33，五十万 49，一百万 56，三百万 69，一千万 84
  const wealthOf = (net) => {
    const w = net / 1e4;
    return w < 0 ? Math.max(0, 20 + w / 3) : Math.min(100, 20 + 12 * Math.log(1 + w / 5));
  };
  function syncWealth(g) { if (on(g)) g.setStat('财富', wealthOf(CN.net(g))); }

  /* 今年的收入（元）：自己 + 配偶。学生、未成年、没工作的没有 */
  CN.income = (g) => {
    const age = g.age, job = g.recall('job') || 'none';
    let mine = 0;
    if (g.recall('retired') || job === 'retired') mine = PENSION[g.recall('pension')] || (g.recall('hukou') === 'rural' ? PENSION.low : PENSION.mid);
    else if (!(STUDY.includes(g.recall('lifePath')) && job === 'none')) {
      const base = INCOME[job] != null ? INCOME[job] : 60000;
      const career = 0.6 + g.s('事业') / 100 * 1.4;
      // 老板、博主看运气
      const luck = job === 'boss' || job === 'creator' ? 0.4 + rnd() * 1.4 : 1;
      mine = base * (TIER_INC[tierOf(g)] || 0.8) * career * luck;
      if (g.recall('side')) mine += 10000;
    }
    let sp = 0;
    if (g.recall('love') === 'married' && JY.byId.sp && g.alive('sp')) {
      const spAge = g.ageOf('sp');
      if (spAge >= 65) sp = PENSION.mid * 0.8;
      else if (g.recall('spWork') !== 'home') sp = (g.recall('hukou') === 'rural' && tierOf(g) >= 4 ? INCOME.worker : INCOME.office) * (TIER_INC[tierOf(g)] || 0.8) * 0.9;
    }
    return Math.round(mine + sp);
  };

  /* 今年的开销（元）：日常、孩子、房租、养老院 */
  function costs(g) {
    const t = tierOf(g), base = LIVE[t] || LIVE[3];
    const hh = CN.household(g);
    let c = base;
    if (g.recall('hhPlace') === 'nursing') return 60000;
    hh.forEach((id) => {
      if (/^k\d$/.test(id)) { const a = g.ageOf(id); c += a < 3 ? base * 0.6 : a < 18 ? base * 0.8 : base * 0.5; }
      else if (/^gk\d$/.test(id)) c += base * 0.3;
      else c += base * 0.6;
    });
    // 在外地读大学的孩子
    ['k1', 'k2', 'k3'].forEach((id) => { if (JY.byId[id] && g.alive(id) && !hh.includes(id)) { const a = g.ageOf(id); if (a >= 18 && a <= 21) c += 30000; } });
    const house = g.recall('house');
    const atParents = ['fa', 'mo'].some((id) => hh.includes(id)) && !g.recall('parentsIn');
    if (!atParents && (house === 'rent' || ((house === 'none' || !house) && g.recall('hhPlace') !== 'dorm'))) c += RENT[t] || RENT[3];
    // 钱少就省着花（最低省到一半），钱多就多花一点（人情、车、看病、旅行）
    const inc = CN.income(g);
    const spend = Math.max(c * 0.5, Math.min(c, inc * 0.7)) + Math.max(0, inc - c) * 0.45;
    return Math.round(spend);
  }

  CN.buyHouse = (g, o) => {
    o = o || {};
    const tier = o.tier || tierOf(g);
    const price = o.price || CN.price(g, tier);
    const down = o.down == null ? 0.3 : o.down;
    const pay = price * down * 1e4;
    const loan = Math.round(price * (1 - down));
    setCash(g, CN.cash(g) - pay);
    g.remember('houseVal', price);
    if (loan > 0) { g.remember('debt', V.debt(g) + loan); g.remember('loanBase', V.loanBase(g) + loan); }
    g.remember('house', loan > 0 ? 'mortgage' : 'own');
    if (o.city) { g.info('住处', o.city); g.move('home', o.city + ' · 新家'); }
    syncWealth(g);
  };
  CN.sellHouse = (g) => {
    const v = V.houseVal(g), d = V.debt(g);
    setCash(g, CN.cash(g) + (v - d) * 1e4);
    g.remember('houseVal', 0); g.remember('debt', 0); g.remember('loanBase', 0);
    g.remember('house', 'rent');
    syncWealth(g);
  };
  CN.invest = (g, yuan, style) => {
    const amt = Math.max(0, Math.min(yuan, Math.max(0, CN.cash(g))));
    setCash(g, CN.cash(g) - amt);
    g.remember('invest', V.invest(g) + amt);
    g.remember('investStyle', style || 'fund');
    syncWealth(g);
    return amt;
  };
  CN.withdraw = (g) => {
    setCash(g, CN.cash(g) + V.invest(g));
    g.remember('invest', 0);
    g.remember('investStyle', '');
    syncWealth(g);
  };
  CN.riskName = (style) => RISK_T[style] || '';

  /* ---------- 和谁住 ---------- */
  const ORDER = ['sp', 'k1', 'k2', 'k3', 'fa', 'mo', 'gp', 'gm', 'sib0', 'sib1', 'gk1', 'gk2', 'gk3'];
  const hhRaw = (g) => (g.recall('hh') || []).slice();
  CN.household = (g) => hhRaw(g).filter((id) => JY.byId[id] && g.alive(id))
    .sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
  CN.livesWith = (g, id) => CN.household(g).includes(id);
  CN.hhCount = (g) => CN.household(g).length + 1;
  CN.alone = (g) => !CN.household(g).length && g.recall('hhPlace') !== 'dorm' && g.recall('hhPlace') !== 'nursing';
  CN.liveWith = (g, ids) => {
    const hh = hhRaw(g);
    [].concat(ids).forEach((id) => { if (JY.byId[id] && g.alive(id) && !hh.includes(id)) hh.push(id); });
    g.remember('hh', hh);
    if ([].concat(ids).some((id) => id === 'fa' || id === 'mo') && g.age >= 18) g.remember('parentsIn', true);
    if (g.recall('hhPlace') === 'dorm') g.remember('hhPlace', '');
  };
  CN.moveOut = (g, ids) => {
    const out = [].concat(ids);
    g.remember('hh', hhRaw(g).filter((id) => !out.includes(id)));
    if (out.includes('fa') && out.includes('mo')) g.remember('parentsIn', false);
  };
  CN.who = (g, id, age) => g.who(id, age);
  const relOf = (g, id) => g.knows(id) || (JY.byId[id] ? JY.byId[id].name : '');
  CN.hhText = (g) => {
    const place = g.recall('hhPlace');
    if (place === 'nursing') return '住在养老院';
    if (place === 'dorm') return '住在宿舍';
    const hh = CN.household(g);
    if (!hh.length) return '一个人住';
    const names = hh.map((id) => relOf(g, id));
    return '和' + (names.length > 3 ? names.slice(0, 3).join('、') + '等 ' + names.length + ' 人' : names.join('、')) + '住在一起';
  };

  /* 每年对一遍：谁出生了、谁离家了、谁搬进来了 */
  function reconcile(g, age) {
    let hh = hhRaw(g).filter((id) => JY.byId[id] && g.alive(id));
    const has = (id) => hh.includes(id);
    const add = (id) => { if (JY.byId[id] && g.alive(id) && !has(id)) hh.push(id); };
    const del = (ids) => { hh = hh.filter((id) => !ids.includes(id)); };
    const PARENTS = ['fa', 'mo', 'gp', 'gm', 'sib0', 'sib1'];
    const notes = [];
    // 弟弟妹妹出生
    ['sib0', 'sib1'].forEach((id) => { const s = JY.byId[id]; if (s && s.born === g.Y && (has('fa') || has('mo') || has('gp'))) add(id); });
    // 留守儿童跟爸妈进城
    if (age < 18 && g.recall('migrated') && !g.recall('hhMigrated')) { add('fa'); add('mo'); g.remember('hhMigrated', true); }
    // 成年后离家：上大学、当兵、去外地工作
    const away = STUDY.includes(g.recall('lifePath')) || g.recall('lifePath') === 'army'
      || (age >= 16 && g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap'));
    if (age >= 16 && away && !g.recall('leftHome') && !g.recall('parentsIn')) {
      del(PARENTS);
      g.remember('leftHome', true);
      const study = STUDY.includes(g.recall('lifePath')) || g.recall('lifePath') === 'army';
      g.remember('hhPlace', study ? 'dorm' : '');
      notes.push(study ? '你收拾行李离开了家，住进了集体宿舍。' : '你离开家，在' + (g.recall('workCity') || '外地') + '租了一间房，开始一个人过。');
    }
    // 读完书，从宿舍搬出来
    if (g.recall('hhPlace') === 'dorm' && !STUDY.includes(g.recall('lifePath')) && g.recall('lifePath') !== 'army') g.remember('hhPlace', '');
    // 回老家：没自己的房子就住回爸妈家
    if (g.recall('leftHome') && !away && g.recall('love') !== 'married' && !['mortgage', 'own'].includes(g.recall('house')) && !has('fa') && !has('mo') && (g.alive('fa') || g.alive('mo'))) {
      add('fa'); add('mo');
      g.remember('leftHome', false);
      notes.push('你搬回了爸妈家，住回小时候那间屋子。');
    }
    // 结婚：配偶住进来；有了自己的房子，就和爸妈分开住
    if (g.recall('love') === 'married' && JY.byId.sp && g.alive('sp')) {
      if (!has('sp')) add('sp');
      if (['mortgage', 'own'].includes(g.recall('house')) && !g.recall('parentsIn') && (has('fa') || has('mo'))) { del(PARENTS); notes.push('你们搬进了自己的家，从爸妈那里分了出来。'); }
    } else if (has('sp')) del(['sp']);
    // 接爸妈来住（剧情里选了“接来同住”）
    if ((g.recall('parentsCare') === 'self' || g.recall('parentsNear') === 'with') && !g.recall('parentsIn') && (g.alive('fa') || g.alive('mo'))) {
      add('fa'); add('mo');
      g.remember('parentsIn', true);
    }
    // 孩子：未成年就跟你住。离婚后跟了对方、留在老家给老人带的不算
    const kidAway = g.recall('custody') === 'ex';
    ['k1', 'k2', 'k3'].forEach((id) => {
      if (!JY.byId[id] || !g.alive(id)) return;
      const a = g.ageOf(id);
      const left = g.recall('kidSchool') === 'left' && a >= 6 && a < 16;
      if (kidAway || left) del([id]);
      else if (a < 18 && !has(id)) add(id);
    });
    // 孩子长大离家（十八岁去读书或工作），晚年和孩子住的不算
    ['k1', 'k2', 'k3'].forEach((id) => {
      if (has(id) && g.ageOf(id) >= 18 && g.recall('liveWith') !== 'kids') {
        del([id]);
        notes.push(CN.who(g, id) + '十八岁，离开家去' + (g.rnd() < 0.7 ? '外地读书' : '外面闯') + '了。家里一下子空了一块。');
      }
    });
    // 晚年住哪儿
    const lw = g.recall('liveWith');
    if (lw === 'nursing') { hh = hh.filter((id) => id === 'sp'); g.remember('hhPlace', 'nursing'); }
    else if (g.recall('hhPlace') === 'nursing') g.remember('hhPlace', '');
    if (lw === 'kids') { ['k1', 'k2', 'k3'].forEach((id) => { if (g.alive(id) && (id === 'k1' || has(id))) add(id); }); ['gk1', 'gk2'].forEach(add); }
    g.remember('hh', hh);
    return notes;
  }

  /* 第一次有自己的钱（十八岁，或者更早开始工作） */
  function startMoney(g, age) {
    const job = g.recall('job');
    if (on(g) || (age < 18 && (!job || job === 'none'))) return '';
    const fam = g.recall('family') || 'worker';
    const gift = (START[fam] || 10000) * (0.5 + g.s('财富') / 100);
    g.remember('money0', true);
    setCash(g, gift);
    g.remember('lastBand', band(gift));
    syncWealth(g);
    const working = job && job !== 'none';
    return (working ? '你开始自己挣钱了。' : '你成年了，开始自己管钱。') + '手里有 ' + CN.fmt(gift) + '，' + (fam === 'rich' ? '大半是家里给的。' : '是这些年攒的压岁钱和家里给的。');
  }
  // 存款档位：用来报“第一次过了十万”
  const BANDS = [1e5, 5e5, 1e6, 5e6, 1e7];
  const band = (v) => BANDS.filter((b) => v >= b).length;

  /* 年末记账 */
  function ledger(g, age) {
    if (!on(g)) return [];
    const out = [];
    const inc = CN.income(g), cost = costs(g);
    const newLoan = Math.max(0, V.debt(g) - V.lastDebt(g)); // 今年剧情里新借的钱（房贷、彩礼……）
    let cash = CN.cash(g);
    // 读书期间家里给生活费，打点零工
    if (STUDY.includes(g.recall('lifePath')) && (g.recall('job') || 'none') === 'none') cash += 3000;
    else cash += inc - cost;
    // 欠款（房贷、借款）：每年还本金基数的 6.5%，利息按 3.5% 算
    let debt = V.debt(g);
    if (newLoan) g.remember('loanBase', V.loanBase(g) + newLoan);
    if (debt > 0) {
      const base = Math.max(V.loanBase(g), debt);
      const payW = Math.min(debt * 1.035, base * 0.065);
      cash -= payW * 1e4;
      debt = Math.max(0, debt * 1.035 - payW);
      if (debt < 0.5) {
        debt = 0;
        g.remember('loanBase', 0);
        if (g.recall('house') === 'mortgage') { g.remember('house', 'own'); out.push('最后一笔房贷还完了。房子从今天起，彻底是你的了。'); }
        else out.push('欠的钱终于还清了。');
      }
      g.remember('debt', Math.round(debt * 10) / 10);
    }
    g.remember('lastDebt', V.debt(g));
    // 房子：剧情里改成“背房贷”“全款”却没走 CN.buyHouse 的，按城市补上房价
    // 首付：今年新增的欠款就是贷款，房价减贷款是首付；存款不够的部分算家里凑的
    const house = g.recall('house');
    if (['mortgage', 'own', 'hometown'].includes(house) && !V.houseVal(g)) {
      const price = house === 'hometown' ? PRICE[4] : CN.price(g);
      const down = Math.max(0, price - newLoan) * 1e4;
      const mine = Math.min(down, Math.max(0, cash) * 0.8);
      cash -= mine;
      g.remember('houseVal', price);
      out.push('买房的首付 ' + CN.fmt(down) + (mine >= down ? '，全是你们自己攒的。' : '，你们出了 ' + CN.fmt(mine) + '，剩下的是家里凑的。'));
    }
    // 存款利息、理财涨跌
    if (cash > 0) cash *= 1.015;
    const inv = V.invest(g), style = g.recall('investStyle');
    if (inv > 0 && RISK[style]) {
      const r = RISK[style][0] + RISK[style][1] * gauss();
      const delta = inv * r;
      g.remember('invest', Math.max(0, Math.round(inv + delta)));
      if (Math.abs(r) >= 0.2 && Math.abs(delta) >= 20000) out.push((r > 0 ? '这一年行情好，你' + RISK_T[style] + '的钱涨了 ' : '这一年行情不好，你' + RISK_T[style] + '的钱跌了 ') + CN.fmt(Math.abs(delta)) + '。');
    }
    // 晚年钱不够，孩子接济
    if (cash < 0 && age >= 65 && ['k1', 'k2', 'k3'].some((id) => JY.byId[id] && g.alive(id))) {
      const help = Math.min(-cash + 20000, 60000);
      cash += help;
      if (!g.recall('kidHelp')) { g.remember('kidHelp', true); out.push('退休金不太够花。孩子每个月往你卡里打一笔钱，嘴上说是给你买水果的。'); }
    }
    if (cash < 0 && CN.cash(g) >= 0 && age < 65) out.push('这一年入不敷出，存款见底了。');
    setCash(g, cash);
    g.remember('income', inc);
    // 存款第一次过了一个整数关口
    const liquid = cash + V.invest(g);
    const b = band(liquid), lb = V.lastBand(g);
    if (b > lb) out.push('存款第一次过了 ' + CN.fmt(BANDS[b - 1]) + '。');
    g.remember('lastBand', Math.max(b, lb));
    syncWealth(g);
    return out;
  }

  /* 年度小结：这一年要是没什么事，写一行“家里怎么样” */
  function summary(g, age) {
    const L = L_();
    const lines = L.log.filter((e) => e.y === L.year && !/^(world|wmod)$/.test(e.k)).length;
    const decade = age >= 20 && age % 10 === 0 && on(g);
    if (!decade && (lines > 0 || g.rnd() < 0.5)) return '';
    const place = g.recall('hhPlace') ? '' : (g.recall('workCity') || g.recall('homeCap') || '').replace(/ · .*$/, '');
    const head = age < 3 ? '这一年，你还在襁褓里，' : '这一年，你' + (place ? '在' + place + '，' : '');
    let t = head + CN.hhText(g) + '。';
    if (on(g)) {
      const inc = V.income(g);
      t += (inc > 0 ? '家里一年进账 ' + CN.fmt(inc) + '，' : '') + '存款 ' + CN.fmt(CN.cash(g) + V.invest(g));
      if (V.houseVal(g)) t += '，房子值 ' + CN.fmt(V.houseVal(g) * 1e4);
      if (V.debt(g)) t += '，还欠 ' + CN.fmt(V.debt(g) * 1e4);
      t += '。';
    }
    return t;
  }

  /* ---------- 挂到引擎上（game.js 的 engine 钩子调用这些） ---------- */
  JY.ECON = {
    // 旧剧情的 g.stat('财富', n)：成年后换算成一笔钱。一点“财富”按全家年收入的 6% 算，最少五千
    onStat: (g, k, d) => {
      if (k !== '财富' || !on(g)) return true;
      const unit = Math.max(5000, CN.income(g) * 0.06);
      if (d < 0) CN.pay(g, -d * unit); else CN.earn(g, d * unit);
      return false;
    },
    yearEnd: (g, age) => {
      reconcile(g, age).forEach((t) => g.log(t, 'auto'));
      const first = startMoney(g, age);
      if (first) g.log(first, 'auto');
      ledger(g, age).forEach((t) => g.log(t, 'auto'));
      const s = summary(g, age);
      if (s) g.log(s, 'flavor');
    },
    deathLine: (g, id, cause) => {
      const c = JY.byId[id];
      if (!c) return '';
      const age = g.Y - c.born;
      const rel = g.knows(id);
      if (rel) return '你的' + rel + c.name + cause + '，享年 ' + age + ' 岁。';
      const L = L_();
      if (L && L.peers.includes(id)) return '和你同一年出生的' + c.name + '（' + c.origin + '）' + cause + '。';
      return '';
    },
    // 给 simulate.js 用的逻辑检查：t 是一行生平或抉择的正文，按此刻的状态看有没有矛盾。返回问题说明，没问题返回 ''
    lint: (g, t, kind) => {
      const age = g.age;
      const married = g.recall('love') === 'married' && !!JY.byId.sp && g.alive('sp');
      if (married && /孤身|孑然|一个人过|还是一个人|没有对象|没对象|找个伴|介绍(个|一个)?(对象|老伴)|给你介绍.{0,3}(对象|个人|一个人)|(去|再去|安排|劝你|催你)相亲/.test(t) && !/领了证|结婚了|婚礼/.test(t)) return '已婚却写成单身';
      if (kind === 'node' && (CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo')) && /(爸|妈|父母|父亲|母亲|老人)/.test(t) && /接(过来|来|到身边)|搬来.{0,4}住|接.{0,4}同住/.test(t)) return '已经和爸妈同住，还问要不要接来';
      if (!CN.alone(g) && /一个人住(?!进)|(?<!的)独居(?!老人)|一个人吃饭|空荡荡的家|家里只有你一个/.test(t)) return '有人同住却写成独居';
      if (age < 1 && /^(【[^】]*】)?你.{0,12}(说|开口|走|跑|追|学会)/.test(t)) return '还不满一岁';
      if (age < 3 && /吃了一碗|一碗.{0,4}面|牛肉面|热干面|臊子面|拉面|火锅|烧烤|撸串|泡馍|凉皮|冷面|小龙虾|臭豆腐|喝酒|抽烟|奶茶|咖啡|生煎|肉夹馍/.test(t)) return '三岁前吃喝大人的东西';
      if (age < 16 && /(你|自己).{0,6}(抽烟|喝醉|喝多了|去酒吧|结婚|还房贷|领工资|升职)/.test(t)) return '未成年做大人的事';
      if (age >= 85 && /广场舞|领舞|跑步|爬山|马拉松|骑车|打篮球|游泳|健身房/.test(t)) return '八十五岁以后还做剧烈运动';
      if (age >= 75 && /(你|你们).{0,6}(加班|上班|升职|跳槽|找工作|面试)/.test(t) && !/退休|以前|当年|那时|年轻/.test(t)) return '七十五岁以后还上班';
      return '';
    },
    party: (g) => CN.household(g).slice(0, 6),
    sceneCap: (g) => CN.hhText(g),
    wealthText: (L, g) => (on(g) ? CN.fmt(CN.cash(g) + V.invest(g)) : ''),
  };

  /* 投胎时定下一开始和谁住：爸妈、哥哥姐姐；留守儿童跟爷爷奶奶；农村一半人家三代同堂 */
  const gen = JY.GENERATE;
  JY.GENERATE = () => {
    const r = gen();
    const m = r.me.mem;
    const others = r.others;
    const older = others.filter((o) => /^sib\d$/.test(o.id) && o.born <= CN.NOW).map((o) => o.id);
    let hh = m.leftBehind ? ['gp', 'gm'] : ['fa', 'mo'];
    if (!m.leftBehind && m.hukou !== 'city' && Math.random() < (m.hukou === 'rural' ? 0.5 : 0.25)) hh = hh.concat(['gp', 'gm']);
    m.hh = hh.concat(older);
    return r;
  };
})();

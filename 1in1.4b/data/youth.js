/* 十四亿分之一 · 青年：18–34 岁
 * 高考和志愿、大学或打工、参军、毕业去向、第一份工资、存钱理财、借钱、副业、AI 替代、
 * 恋爱、彩礼、结婚、买房、买车、生孩子、谁带孩子、接不接爸妈、去不去大城市、回不回老家。
 * 读童年留下的 edu、school、hukou、family；给中年留下 edu、uni、major、job、workCity、tier、love、kids、house、debt。
 * 钱都走 economy.js 的 CN.pay / CN.earn / CN.invest / CN.buyHouse，文字里写出金额。
 * 新增的状态键名见文件末尾的说明。
 *
 * 一年最多一个抉择：用 dec() 注册的抉择节点，同一年龄里排在前面的先触发，触发过一个，同龄的其他就跳过。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const BY_AGE = {};
  // 抉择节点：同一年龄只出现一个（按本文件里的先后）
  const dec = (n) => {
    const ids = (BY_AGE[n.age] = BY_AGE[n.age] || []);
    ids.push(n.id);
    const own = n.cond;
    n.cond = (g) => {
      const L = JY.engine.get().L;
      if (L && ids.some((id) => id !== n.id && L.done[id])) return false;
      return !own || own(g);
    };
    return n;
  };
  const isMale = (g) => CN.sexOf(g) === '男';
  // 童年职高专业（childhood 的 vocMajor）对应的大专专业
  const VOC_MAJOR = { mech: '汽修', care: '护理', ecom: '电商', robot: '机器人维修' };
  const WHITE = ['office', 'tech', 'civil', 'teacher', 'doctor', 'sales'];
  const white = (g) => WHITE.includes(g.recall('job'));
  const AI_JOBS = ['office', 'tech', 'sales', 'worker', 'rider', 'driver'];
  const rural = (g) => g.recall('hukou') === 'rural';
  const county = (g) => g.recall('hukou') === 'county';
  const tierNow = (g) => g.recall('tier') || 5;
  const kidN = (g) => g.recall('kids') || 0;
  const loveIs = (g, v) => (g.recall('love') || 'single') === v;
  const married = (g) => loveIs(g, 'married') && !!JY.byId.sp && g.alive('sp');
  const single = (g) => loveIs(g, 'single') || loveIs(g, 'divorced');
  const home = (g) => g.recall('homeCap') || '老家';
  const here = (g) => g.recall('workCity') || home(g);
  const working = (g) => g.recall('lifePath') === 'work';
  const hasHouse = (g) => ['mortgage', 'own', 'hometown'].includes(g.recall('house'));
  const parentAlive = (g) => g.alive('fa') || g.alive('mo');
  const aliveParents = (g) => ['fa', 'mo'].filter((id) => g.alive(id));
  const withParents = (g) => CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo');
  const parentWord = (g) => (g.alive('fa') && g.alive('mo') ? '爸妈' : g.alive('fa') ? '爸' : g.alive('mo') ? '妈' : '家里');
  const debtW = (g) => Number(g.recall('debt')) || 0;
  const cash = (g) => CN.cash(g);
  const r1000 = (x) => Math.max(0, Math.round(x / 1000) * 1000);
  const r100 = (x) => Math.max(0, Math.round(x / 100) * 100);
  const wan = (x) => Math.round(x / 1e3) / 10; // 元换成万，保留一位
  // 本省省会
  const capital = (g) => {
    const P = CN.PROVS.find((p) => p[0] === g.recall('prov'));
    const c = P && (P[6].find((x) => x[1] <= 2) || P[6][0]);
    return c ? c[0] : '省城';
  };
  const bigCity = () => CN.pick(['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉']);
  // 县城：县城出身的回自己那个县城
  const toCounty = (g) => (county(g) ? CN.goCity(g, 4, home(g)) : CN.goCity(g, 4));
  // 回老家：场景、住处、城市等级、所在地都改成老家
  const goBack = (g) => {
    CN.goHome(g);
    const h = g.recall('hukou');
    g.remember('tier', h === 'city' ? g.recall('cityTier') || 3 : h === 'county' ? 4 : 5);
    g.remember('workCity', home(g));
    g.info('住处', home(g));
  };
  // 离开了老家，在外地
  const away = (g) => !!g.recall('workCity') && g.recall('workCity') !== home(g) && g.recall('workCity') !== g.recall('city');

  /* ---------- 钱 ---------- */
  // 和 economy.js 的 TIER_INC、RENT 一致：城市等级的工资系数、一个月的房租
  const TI = { 1: 1.5, 2: 1, 3: 0.8, 4: 0.65, 5: 0.5 };
  const RENT_M = { 1: 5000, 2: 2500, 3: 1500, 4: 1000, 5: 500 };
  const perMonth = (g) => r100(CN.income(g) / 12);
  const payWord = (g) => (married(g) ? '两个人每月加起来大概 ' : '每月到手大概 ') + CN.fmt(perMonth(g));
  // 爸妈能帮多少（元）：按家境，结了婚两边一起凑
  const HELP = { rich: 1500000, civil: 400000, white: 300000, smallbiz: 250000, worker: 120000, farmer: 50000, migrant: 80000 };
  // 去年全家的收入（老板、博主的 CN.income 每次算都带运气，判定可见选项要用稳定的数）
  const incStable = (g) => Number(g.recall('income')) || CN.income(g);
  const famHelp = (g) => r1000((HELP[g.recall('family')] || 100000) * (parentAlive(g) ? 1 : 0.3) * (married(g) ? 1.6 : 1));
  // 结果文字要用到的数，fx 里算好放在这里，res 紧接着读
  let last = {};

  /* 各行当一个月大概挣多少、稳不稳。数和 economy.js 的 INCOME 一致（按城市等级、事业算，不含配偶）。
   * 挂在 CN 上，中年、老年、意外的选项也用：CN.jobLine(g, 'tech', 1) → '约 ¥1.8 万/月，钱多，加班重……'
   * plus 是升职以后事业多出来的点数，用来写“升上去大概多少” */
  const INC = { none: 0, farmer: 30000, worker: 70000, rider: 80000, driver: 80000, shop: 70000, office: 100000, tech: 200000, civil: 110000, teacher: 100000, doctor: 160000, nurse: 90000, sales: 100000, boss: 180000, creator: 70000, soldier: 80000, freelance: 80000, retired: 0 };
  const RISK = {
    civil: '铁饭碗，几乎不会被裁', teacher: '稳定，有寒暑假，带班累', doctor: '稳定，夜班多，熬身体', nurse: '稳定，三班倒', soldier: '包吃住，规矩严',
    tech: '钱多，加班重，怕三十五岁和 AI', office: '不算累，被 AI 替代的风险高', sales: '底薪加提成，看业绩吃饭',
    worker: '累，机器人替代的风险高', rider: '多劳多得，风吹日晒，没有底薪', driver: '熬夜，无人驾驶迟早要来', shop: '看位置和运气，赔了算自己的',
    boss: '好年景翻几倍，差的时候血本无归', creator: '大起大落，平台一变就断粮', freelance: '有一单没一单', farmer: '看天吃饭，挣得少',
  };
  CN.jobPay = (g, job, t, plus) => r100((INC[job] != null ? INC[job] : 60000) * (TI[t || tierNow(g)] || 0.8) * (0.6 + Math.min(100, g.s('事业') + (plus || 0)) / 100 * 1.4) / 12);
  CN.jobRisk = (job) => RISK[job] || '';
  CN.jobLine = (g, job, t, plus) => {
    const m = CN.jobPay(g, job, t, plus);
    const pay = job === 'boss' || job === 'creator' ? '月入 ' + CN.fmt(r100(m * 0.4)) + '到 ' + CN.fmt(r100(m * 1.8)) + ' 不等' : '约 ' + CN.fmt(m) + '/月';
    return pay + '，' + CN.jobRisk(job);
  };
  // 受雇上班的（能升职）；自己干的（能扩张）
  const EMPLOYEE = ['office', 'tech', 'sales', 'civil', 'teacher', 'doctor', 'nurse', 'worker', 'rider', 'driver', 'soldier'];
  const hiEdu = (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu'));
  // 按年份固定的随机数：同一年里文字和结果读到的是同一个
  const lifeSeed = (g) => { const c = JY.byId[g.me]; const t = ((c && c.name) || '') + (g.recall('city') || ''); let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 1000003; return h; };
  const roll = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + lifeSeed(g) * 0.0137) * 43758.5453; return x - Math.floor(x); };
  const pk = (g, arr, salt) => arr[Math.floor(roll(g, salt) * arr.length)];
  const jobTitle = (g) => JY.engine.get().L.info['职业'] || '';
  // 本钱：手里的钱先用（留 ¥1 万应急），不够的找亲戚借（记进 debt）。返回借了多少元
  const fund = (g, cost) => {
    CN.withdraw(g);
    const mine = Math.min(cost, Math.max(0, cash(g) - 10000));
    const lend = r1000(cost - mine);
    if (lend > 0) { CN.earn(g, lend); g.remember('debt', debtW(g) + wan(lend)); }
    CN.pay(g, cost);
    return lend;
  };
  const FRANCHISE = { 1: 400000, 2: 300000, 3: 200000, 4: 150000, 5: 100000 };

  /* 一套房子的账：tier 城市等级，size 相对普通住房的大小。price 万，down/mine/fam/borrow 元 */
  const deal = (g, tier, size) => {
    const price = Math.max(10, Math.round(CN.price(g, tier) * size));
    const down = price * 0.3 * 1e4;
    const mine = Math.min(down, Math.max(0, cash(g) - Math.max(30000, incStable(g) * 0.3))); // 留一点应急的钱
    const fam = Math.min(down - mine, famHelp(g));
    const borrow = down - mine - fam;
    const loan = price * 0.7;
    return { tier, price, down, mine, fam, borrow, month: r100(loan * 1e4 * 0.065 / 12) };
  };
  const buyTier = (g) => Math.min(tierNow(g), 4);
  const buyPlace = (g) => (tierNow(g) <= 4 ? here(g) : g.recall('city') + '下面的县城');
  const dealRes = (g, d, head) => head + '总价 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '：'
    + (married(g) ? '你们' : '你') + '自己出了 ' + CN.fmt(d.mine)
    + (d.fam ? '，' + (married(g) ? '两边爸妈' : parentWord(g)) + '给了 ' + CN.fmt(d.fam) : '')
    + (d.borrow >= 1000 ? '，又找亲戚借了 ' + CN.fmt(d.borrow) : '') + '。每个月还贷 ' + CN.fmt(d.month) + '。';
  // 买房：先把爸妈的钱、借的钱进账，再按首付三成买
  const doBuy = (g, d, city) => {
    CN.earn(g, d.fam + d.borrow);
    if (d.borrow >= 1000) g.remember('debt', debtW(g) + wan(d.borrow));
    CN.buyHouse(g, { tier: d.tier, price: d.price, down: 0.3, city });
    // 自己的房子在住的城市：搬出爸妈家（接来同住的爸妈不算）
    if (city && !g.recall('parentsIn')) CN.moveOut(g, ['fa', 'mo', 'gp', 'gm', 'sib0', 'sib1']);
    last = d;
  };
  /* 买房的选项（27 岁结婚后、29 岁），sizeA 大一点的，sizeB 小一点的 */
  const houseChoices = (szA, szB, nmA, nmB) => {
    const sizeA = typeof szA === 'function' ? szA : () => szA;
    const sizeB = typeof szB === 'function' ? szB : () => szB;
    const nameA = nmA, nameB = nmB;
    // 首付凑得齐，月供不超过收入的一半
    const ok = (g, d, cap) => d.borrow <= cap && d.month * 12 <= Math.max(incStable(g), 30000) * 0.5;
    const showA = (g) => ok(g, deal(g, buyTier(g), sizeA(g)), 0);
    const showB = (g) => ok(g, deal(g, buyTier(g), sizeB(g)), 200000);
    const showC = (g) => tierNow(g) <= 3 && g.recall('hukou') !== 'city';
    return [
      { t: '一步到位，买' + nameA, dev: 10, cond: showA,
        fx: (g) => { const d = deal(g, buyTier(g), sizeA(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'big'); g.stat('心情', 4); },
        res: (g) => dealRes(g, last, '在' + buyPlace(g) + '买了' + nameA + '。') + '搬家那天，你在每个房间里都站了一会儿。' },
      { t: '凑一凑首付，先买' + nameB, canon: true, cond: showB,
        fx: (g) => { const d = deal(g, buyTier(g), sizeB(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'small'); g.stat('心情', 3); },
        res: (g) => dealRes(g, last, '在' + buyPlace(g) + '买了' + nameB + '。') + '交钥匙那天，屋里什么家具都没有，' + (married(g) ? '你们' : '你') + '坐在地板上吃了一顿外卖，觉得挺好。' },
      { t: '回老家县城买，便宜', dev: 15, cond: showC,
        fx: (g) => { const d = deal(g, 4, 1); doBuy(g, d); g.remember('backHome', 'house'); g.remember('houseSize', 'county'); },
        res: (g) => dealRes(g, last, '房子买在老家县城，') + '你们一年回去住几天，' + parentWord(g) + '帮着看房子。' },
      { t: '去城边的小城买，通勤远一点', dev: 15, cond: (g) => !showA(g) && !showB(g) && !showC(g),
        fx: (g) => { const d = deal(g, Math.min(4, buyTier(g) + 1), 0.8); doBuy(g, d, here(g) + '城边'); g.remember('houseSize', 'far'); g.stat('健康', -2); },
        res: (g) => dealRes(g, last, '房子在城边的小城。') + '每天来回三个小时，你在车上学会了站着睡觉。' },
      { t: '不买，接着租', dev: 20,
        fx: (g) => { g.remember('house', 'rent'); g.remember('rentForever', true); g.stat('心情', 1); },
        res: (g) => withParents(g) && !married(g) ? '你还住在' + parentWord(g) + '家，省下了房租。' + (g.alive('mo') ? '你妈说，家里又不缺你一张床。' : '') : (married(g) ? '你们' : '你') + '每个月交 ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + ' 房租，手里留着钱，心里也松快。' + (married(g) ? (isMale(g) ? '丈母娘' : '婆婆') + '那边很久没给好脸色。' : '') },
    ];
  };

  /* 婚事的账：彩礼、酒席。scale 用来打折（拖了一年，彩礼松了口） */
  const wedPlan = (g, scale) => {
    const h = g.recall('hukou');
    const north = ['华北', '东北', '西北'].includes(g.recall('region'));
    const caili = Math.round((h === 'rural' ? (north ? 180000 : 120000) : h === 'county' ? 80000 : 20000) * (scale || 1) / 1e4) * 1e4;
    const feast = h === 'rural' ? 60000 : h === 'county' ? 80000 : 100000;
    const net = feast * 0.4; // 份子钱能回来六成
    const need = isMale(g) ? caili + net : net;
    const fam = r1000(Math.min(famHelp(g) * 0.4, need * 0.6));
    const mine = r1000(Math.min(Math.max(0, cash(g) - 10000), need - fam));
    const borrow = Math.max(0, need - fam - mine);
    return { caili, feast, need, fam, mine, borrow, dowry: isMale(g) ? 0 : caili * 0.5 };
  };
  const wedPay = (g, w) => {
    CN.earn(g, w.fam + w.borrow + w.dowry);
    CN.pay(g, w.need);
    if (w.borrow >= 5000) g.remember('debt', debtW(g) + wan(w.borrow));
    last = w;
  };
  const wedRes = (g, w) => (isMale(g)
    ? '彩礼 ' + CN.fmt(w.caili) + '，酒席 ' + CN.fmt(w.feast) + '，份子钱回来大半。' + parentWord(g) + '出了 ' + CN.fmt(w.fam) + (w.borrow >= 5000 ? '，还找亲戚借了 ' + CN.fmt(w.borrow) : '') + '，剩下的是你自己攒的。'
    : '酒席 ' + CN.fmt(w.feast) + '，份子钱回来大半。男方给的彩礼 ' + CN.fmt(w.caili) + '，你爸妈留下一半，另一半当嫁妆给了你们的小家。');
  const wedText = (g) => {
    const w = wedPlan(g);
    if (rural(g) || county(g)) return isMale(g) ? '两家人坐下来谈彩礼。对方家里开口要 ' + CN.fmt(w.caili) + '，酒席还要另算。你卡里有 ' + CN.fmt(cash(g)) + '。'
      : '两家人坐下来谈婚事。男方家里说彩礼给 ' + CN.fmt(w.caili) + '，你妈觉得少了点，你爸说差不多就行。';
    return '对方问你，要不要把日子定下来。城里办一场婚礼，酒店一桌 ¥3,000，彩礼两家说好意思一下。';
  };

  /* 理财的选项（23 岁第一笔存款、33 岁）。amt 是拿出来的钱 */
  const moneyChoices = () => {
    const amt = (g) => r1000(cash(g) * 0.6);
    return [
      { t: '存定期，图个安心', canon: true,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'safe'); g.remember('money1', 'safe'); },
        res: (g) => '你去银行存了 ' + CN.fmt(last.amt) + ' 的三年定期。利息不多，晚上睡得着。' },
      { t: '买基金，听说比存银行强', dev: 10,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'fund'); g.remember('money1', 'fund'); },
        res: (g) => '你分几次买了 ' + CN.fmt(last.amt) + ' 的基金。头一个月就跌了一点，你忍住没看。' },
      { t: '开个户，自己炒股', dev: 20,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'stock'); g.remember('money1', 'stock'); g.stat('心情', -1); },
        res: (g) => '你往股票账户里转了 ' + CN.fmt(last.amt) + '。上班摸鱼的时候，手机上全是红红绿绿的线。' },
      { t: '拿一笔给家里用', dev: 15, cond: (g) => parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker'),
        fx: (g) => { last.amt = r1000(cash(g) * 0.4); CN.pay(g, last.amt); g.remember('money1', 'family'); g.stat('人缘', 4); },
        res: (g) => '你给' + parentWord(g) + '转了 ' + CN.fmt(last.amt) + '。' + (rural(g) ? '老家的房子漏雨好几年了，这回能翻修了。' : '你妈说给你存着，你说不用。') },
      { t: '先放着，想花就花', dev: 10, cond: (g) => !(parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker')),
        fx: (g) => { g.remember('money1', 'none'); g.stat('心情', 2); },
        res: '钱就放在卡里。你给自己买了一台好点的电脑。' },
    ];
  };
  const moneyAfter = (g) => {
    const m = g.recall('money1');
    const inv = Number(g.recall('invest')) || 0;
    if (m === 'family') return '老家的房子翻修好了。你妈在视频里举着手机，带你看了一圈新刷的墙。';
    if (m === 'none') return '卡里那笔钱，不知不觉花掉了一大半。你下载了一个记账软件，这回坚持下来了。';
    if (!inv) return '理财的钱你早就取出来花掉了。';
    return { safe: '定期到期了，连本带利 ', fund: '你买的基金涨涨跌跌，现在一共是 ', stock: '你炒股的账户，现在是 ' }[m] + CN.fmt(inv) + '。' + (m === 'stock' ? '你说再也不天天看盘了，第二天又看了。' : '数字不大，看着心里有底。');
  };

  /* 车的选项 */
  const carChoices = () => [
    { t: '不买，现在出门也够用', canon: true, fx: (g) => { g.remember('car', 'no'); g.stat('心情', 1); }, res: (g) => (tierNow(g) >= 4 ? '你换了一辆新电瓶车，¥3,000，县城哪儿都能去。' : '你算了一下，打车一年也花不到养车的一半。') },
    { t: '全款买一辆新能源车', dev: 10, cond: (g) => cash(g) >= 150000,
      fx: (g) => { CN.pay(g, 120000); g.remember('car', 'new'); g.stat('心情', 5); }, res: '落地 ¥12 万。提车那天，你在停车场里坐了很久，没舍得开走。' },
    { t: '首付三万，贷款买', dev: 15, cond: (g) => cash(g) >= 40000 && cash(g) < 150000,
      fx: (g) => { CN.pay(g, 30000); g.remember('debt', debtW(g) + 9); g.remember('car', 'loan'); g.stat('心情', 3); }, res: '首付 ¥3 万，剩下 ¥9 万分五年还，每个月 ¥1,700。车是新的，账也是新的。' },
    { t: '买一辆二手车，四万块', dev: 10,
      fx: (g) => { CN.pay(g, 40000); g.remember('car', 'used'); g.stat('心情', 3); }, res: '车是别人开了五年的，空调有点响。能跑就行。' },
  ];
  const carText = (g) => (tierNow(g) >= 4 ? '县城里的公交一个小时一趟。' : '周末出门，地铁要倒两趟。')
    + (kidN(g) ? '带着孩子去趟医院，抱着走到车站就一身汗。' : married(g) ? '回趟' + (g.alive('mo') ? '爸妈家' : '老家') + '，大包小包挤不上车。' : '同事们开始聊车了。')
    + '你卡里有 ' + CN.fmt(cash(g)) + '。';
  const carAfter = (g) => ({ new: '有了车，周末你常开出城去。' + (kidN(g) ? '孩子在后座睡着，嘴角挂着饼干渣。' : '后备箱里放着一顶帐篷。'), loan: '车贷还了一半。开车上班那二十分钟，是你一天里最安静的时候。', used: '那辆二手车修过两回，还是很争气。', no: tierNow(g) >= 4 ? '你还是骑电瓶车。下雨天穿上雨披，照样哪儿都去。' : '你还是没买车。地铁上你看完了好几本书，也省下了一笔钱。' }[g.recall('car')] || '');

  /* 高考档次：学识 + 学校 + 运气 */
  const gaokao = (g, bonus) => {
    const sc = { key: 12, normal: 0, weak: -8 }[g.recall('school')] || 0;
    const v = g.s('学识') + sc + (bonus || 0) + (g.rnd() * 20 - 10);
    // 童年结束时高中生的学识大多在 60–95；按真实比例：顶尖约 6%，好大学约 25%，普通本科约 40%，大专约 20%，落榜约 10%
    return v >= 100 ? 'top' : v >= 88 ? 'good' : v >= 74 ? 'normal' : v >= 62 ? 'college' : 'fail';
  };
  const UNI_T = { top: '一所顶尖大学', good: '一所好大学', normal: '一所普通本科' };
  // 进大学：档次、专业、城市。调用前先在选项里 g.remember('uni', …) 和 g.remember('major', …)
  const enroll = (g, city, tier) => {
    const uni = g.recall('uni');
    g.remember('lifePath', 'uni');
    g.info('学历', '本科在读');
    CN.goCity(g, tier, city);
    g.move('campus', city + ' · ' + UNI_T[uni]);
  };
  const fee = (g) => (rural(g) ? '学费一年 ¥5,000，你申请了助学贷款。' : '学费一年 ¥6,000，生活费一个月 ¥2,000，家里出。');

  /* 志愿：18 岁第一次高考，19 岁复读后的第二次，共用一套选项 */
  const zhiyuan = (id, age, cond) => dec({ id, age, t: '填志愿', loc: 'home', cond,
    text: (g) => {
      const gk = g.recall('gk');
      return (gk === 'top' ? '分数出来了，比你预想的高。班主任打电话来，声音都变了。' : gk === 'good' ? '分数不错，够得上一所好大学，挑不了最热门的专业。' : '分数刚过本科线。志愿书厚厚一本，你翻到半夜。')
        + parentWord(g) + '说你自己定，又说别离家太远。';
    },
    choices: [
      { t: '去大城市，报热门的计算机', canon: true,
        fx: (g) => { const gk = g.recall('gk'); const tier = gk === 'normal' ? 2 : 1; g.remember('uni', gk); g.remember('major', '计算机'); enroll(g, tier === 1 ? bigCity() : capital(g), tier); g.stat('心情', 2); },
        res: (g) => '录取通知书寄到了。' + g.recall('workCity') + '，你只在地图上见过。' + fee(g) },
      { t: '报师范或医学，图个稳当', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', g.rnd() < 0.5 ? '师范' : '医学'); enroll(g, capital(g), 2); g.stat('人缘', 2); },
        res: (g) => (g.recall('major') === '医学' ? '医学要读五年。你妈说，以后家里人看病就不求人了。' : '师范生有补助，毕业以后多半回来当老师。你爸挺满意。') },
      { t: '离家近，在本省读个好就业的专业', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', CN.pick(['会计', '机械', '电气', '中文', '法学'])); enroll(g, capital(g), 2); g.stat('人缘', 1); },
        res: (g) => '学校在' + g.recall('workCity') + '，坐车三个小时就能回家。专业是' + g.recall('major') + '。' + fee(g) },
      { t: '不甘心，复读一年', dev: 25, cond: (g) => g.recall('gk') !== 'top' && g.recall('lifePath') !== 'repeat',
        fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -6); g.move('school', home(g) + ' · 复读班'); },
        res: '复读班在县中学的后楼，一年学费 ¥8,000。第一天点名，你认识里面一半的人。' },
    ] });

  /* 升职（31 岁）：管理岗、专业路线、外调。ladder 记下走的哪条路，中年的升职读它 */
  const MGR = { tech: '技术组长', office: '部门主管', sales: '销售经理', civil: '副科长', teacher: '年级组长', doctor: '医疗组长', nurse: '护士长', worker: '车间主任', rider: '站点组长', driver: '车队调度', soldier: '副连长' };
  const EXPERT = { tech: '高级工程师', doctor: '主治医师', teacher: '一级教师', nurse: '主管护师', worker: '高级技工', office: '资深专员', civil: '主任科员' };
  const upMgr = (g) => { CN.setJob(g, g.recall('job'), MGR[g.recall('job')] || '主管'); g.remember('promoted', true); g.remember('ladder', 'mgr'); g.stat('事业', 10); g.stat('健康', -2); };
  const mgrRes = (g) => '你当上了' + jobTitle(g) + '，' + payWord(g).replace(/^.*?大概/, '现在每月大概') + '。第一件事，是学着不在群里说太多话。';
  const upFail = (g) => { g.remember('promoted', false); g.remember('ladder', 'stuck'); g.stat('心情', -4); };

  /* 自己干（29 岁）：小吃摊、网店、加盟店。biz 记下干的什么、头一年成没成，32 岁的回响兑现 */
  const bizText = (g) => pk(g, ['下班路过夜市，', '周末回家的路上，', '刷短视频的时候，'], 1)
    + pk(g, ['一个比你小的老乡说，他摆摊一个月挣一万多。', '你看见以前的同事开了家店，门口排着队。', '你算了算，给人打工到退休，也就是这么些钱。'], 2);
  const frKind = (g) => pk(g, ['奶茶店', '快餐店', '便利店', '洗衣店', '烘焙店'], 3);
  const frCost = (g) => FRANCHISE[tierNow(g)] || 200000;
  // 能叫来帮忙的家里人
  const helper = (g) => ['sib0', 'sib1'].find((id) => JY.byId[id] && g.alive(id) && g.ageOf(id) >= 18) || (g.alive('mo') ? 'mo' : g.alive('fa') ? 'fa' : '');

  JY.addFlags({
    ySavedWorker: '在工地上救下了一个从脚手架上摔下来的工友',
    yHometownShop: '回老家开了一家店，后来成了镇上的老字号',
  });

  JY.addLifeNodes([
    /* ================= 18 岁：衔接童年 ================= */
    { id: 'y_entry', age: 18, t: '十八岁', auto: true,
      fx: (g) => {
        // 童年没留下学历时兜底：按学识和出身估一个
        let e = g.recall('edu');
        if (!e) {
          const r = g.s('学识') + (rural(g) ? -8 : 4) + g.rnd() * 30;
          e = r >= 60 ? 'senior' : r >= 42 ? 'vocational' : 'junior';
          CN.setEdu(g, e, { senior: '高中', vocational: '职高', junior: '初中' }[e]);
        }
        if (e === 'primary') CN.setEdu(g, 'junior', '初中');
        // 童年写的是“高中在读”“职高在读”，十八岁毕业
        if (e === 'senior') CN.setEdu(g, 'senior', '高中');
        if (e === 'vocational') CN.setEdu(g, 'vocational', '职高');
        if ((e === 'junior' || e === 'primary') && (!g.recall('job') || g.recall('job') === 'none')) {
          CN.setJob(g, 'worker', '工厂工人');
          CN.goCity(g, CN.pick([1, 3, 3]));
          g.move('factory', g.recall('workCity') + ' · 电子厂');
        }
        if (e === 'junior' || e === 'primary') g.remember('lifePath', 'work');
        if (e === 'senior') g.remember('gk', gaokao(g));
      },
      text: (g) => (g.recall('edu') === 'senior' ? '六月，你走进考场。笔袋是透明的，手心全是汗。'
        : g.recall('edu') === 'vocational' ? '职高最后一年，你在实习的地方过了十八岁生日。'
        : '你十八岁了。在' + (g.recall('workCity') || '外地') + '的宿舍里，工友给你买了一个小蛋糕。') },
    { id: 'y_gaokao', age: 18, t: '高考放榜', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => ({ top: '你考了全县第一。门口放了一挂鞭炮，是邻居放的。', good: '你考得不错。班主任在群里点了你的名。', normal: '分数刚过本科线，不高不低。', college: '分数够不上本科，只够大专。', fail: '分数出来，你看了很久，关掉了网页。' }[g.recall('gk')]) },
    zhiyuan('y_zhiyuan', 18, (g) => ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_zhuanke', age: 18, t: '大专', loc: 'home', cond: (g) => g.recall('gk') === 'college',
      text: '能上的是一所大专，在省城边上，一年学费 ¥7,000。你妈说，大专也是大学。',
      choices: [
        { t: '去读，学个实用的专业', canon: true,
          fx: (g) => { const m = CN.pick(['护理', '汽修', '电商', '学前教育', '机电']); g.remember('major', m); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); },
          res: (g) => '专业是' + g.recall('major') + '。宿舍六个人，三个和你一样是第一次离家。' },
        { t: '复读一年，冲本科', dev: 20, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -5); g.move('school', home(g) + ' · 复读班'); }, res: '你把大专的录取通知书压在了抽屉最底下。' },
        { t: '不读了，出去挣钱', dev: 25,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工业园'); },
          res: (g) => '表哥在' + g.recall('workCity') + '的厂里当线长，说可以带你。包吃住，' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_luobang', age: 18, t: '落榜', loc: 'home', cond: (g) => g.recall('gk') === 'fail',
      text: '你没考上。家里没人提这件事，吃饭的时候特别安静。',
      choices: [
        { t: '复读', canon: true, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -4); g.move('school', home(g) + ' · 复读班'); }, res: '你又背上了书包。你妈把你爱吃的菜换着样做。' },
        { t: '去南方打工', dev: 10,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1, CN.pick(['深圳', '广州'])); g.move('factory', g.recall('workCity') + ' · 工业园'); },
          res: (g) => '高铁坐了八个小时。' + g.recall('workCity') + '的夏天比老家热。厂里' + payWord(g) + '。' },
        { t: '去当兵', dev: 20, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部队的路上'); g.stat('健康', 5); },
          res: '体检过了。走的那天，村口挂了横幅，写着你的名字。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 3); }, res: '体检没过，视力差了一点。你跟着同学去了市里的厂子。' } },
      ] }),
    dec({ id: 'y_voc18', age: 18, t: '职高毕业', loc: 'factory', cond: (g) => g.recall('edu') === 'vocational' && !g.recall('lifePath'),
      text: (g) => (g.recall('vocPlan') === 'college' ? '职教高考的成绩出来了，够上一所高职。' : '实习的厂子说可以留你，转正后一个月 ¥4,500。') + '老师说，读三年大专，出来路宽一点。',
      choices: [
        { t: '考高职，读大专', canon: true,
          fx: (g) => { g.remember('major', VOC_MAJOR[g.recall('vocMajor')] || CN.pick(['汽修', '数控', '护理', '电商', '烹饪'])); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); },
          res: (g) => '你考上了。学的还是' + g.recall('major') + '，只是学校大了。' },
        { t: (g) => '留在厂里转正（' + CN.jobLine(g, 'worker', 3) + '）', dev: 5,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 车间'); },
          res: (g) => '转正那天，班长让你自己带一台机器。' + payWord(g) + '。' },
        { t: (g) => '去当兵（' + CN.jobLine(g, 'soldier', 3) + '）', dev: 15, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部队的路上'); g.stat('健康', 5); },
          res: '你剃了平头，在火车站跟妈妈挥手。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); }, res: '体检没过。你回了实习的厂子。' } },
      ] }),
    dec({ id: 'y_work18', age: 18, t: '在外面', loc: 'factory', cond: (g) => working(g) && ['junior', 'primary'].includes(g.recall('edu')),
      text: (g) => '你在' + (g.recall('workCity') || '外地') + '已经干了两年，' + payWord(g) + '。' + (g.recall('workPlan') === 'study' ? '夜校的课快上完了。' : g.recall('workPlan') === 'city' ? '电动车换了第二辆。' : '流水线上的活闭着眼都会了。'),
      choices: [
        { t: '接着干，攒钱', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.5), 'safe'); g.stat('心情', -2); }, res: (g) => '你每个月往家里打一半工资。剩下的攒了攒，存了一张 ' + CN.fmt(last.amt) + ' 的定期。' },
        { t: (g) => '去大城市跑外卖（' + CN.jobLine(g, 'rider', 1) + '）', dev: 15,
          fx: (g) => { CN.setJob(g, 'rider', '外卖骑手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('健康', -2); },
          res: (g) => '在' + g.recall('workCity') + '，你租了一辆电动车，第一天跑了二十单。跑得勤的话，' + payWord(g) + '。' },
        { t: (g) => '跟师傅学门手艺（学徒 ¥2,500/月，出师后' + CN.jobLine(g, 'worker', null, 6) + '）', dev: 15,
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.setJob(g, 'worker', { cook: '学徒厨师', auto: '汽修学徒', hair: '理发学徒', elec: '电工学徒' }[s]); },
          res: '学徒一个月只有 ¥2,500，师傅脾气大。你每天最后一个走。' },
      ] }),

    /* ================= 19 岁 ================= */
    { id: 'y_firstleave', age: 18, t: '第一次离家', auto: true, cond: (g) => g.recall('lifePath') === 'uni' || g.recall('lifePath') === 'college',
      text: (g) => (rural(g) ? (g.alive('fa') ? '你爸扛着被子送你到宿舍楼下，没上楼，说楼梯太窄。' : '你自己扛着被子上了楼。室友的妈妈多给了你一个苹果。') : (g.alive('mo') ? '你妈帮你铺好床，又把柜子擦了一遍。走的时候她没回头。' : '你一个人铺好了床。晚上家里打来电话，问你吃饭了没有。')) },
    { id: 'y_repeat', age: 19, t: '第二次高考', auto: true, cond: (g) => g.recall('lifePath') === 'repeat',
      fx: (g) => { const r = gaokao(g, 8); g.remember('gk', r === 'fail' ? 'college' : r); },
      text: (g) => '复读这一年，你瘦了十斤。第二次放榜，你考到了' + ({ top: '全市前列', good: '一本线以上', normal: '本科线以上', college: '大专线' }[g.recall('gk')]) + '。' },
    zhiyuan('y_zhiyuan2', 19, (g) => g.recall('lifePath') === 'repeat' && ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_repeat_college', age: 19, t: '还是大专', loc: 'home', cond: (g) => g.recall('lifePath') === 'repeat' && g.recall('gk') === 'college',
      text: '复读一年，分数还是只够大专。',
      choices: [
        { t: '认了，去读', canon: true, fx: (g) => { g.remember('major', CN.pick(['护理', '汽修', '电商', '机电'])); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); }, res: '你比同学大一岁。没人知道。' },
        { t: '出去打工', dev: 10, fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工业园'); }, res: (g) => '你把复读的书都卖了，换了一张火车票。厂里' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_campus', age: 19, t: '大一', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '宿舍熄灯以后，走廊里还有人在打电话。大学和你想的不太一样，没人管你。',
      choices: [
        { t: '泡图书馆，卷绩点', canon: true, fx: (g) => { g.remember('campus', 'study'); g.stat('学识', 6); g.stat('心情', -2); CN.earn(g, 5000); }, res: '你拿了一等奖学金，¥5,000。室友说你没意思，让你请客。' },
        { t: '进社团，认识人', dev: 10, fx: (g) => { g.remember('campus', 'club'); g.stat('人缘', 6); g.stat('心情', 3); }, res: '你当上了社团的副部长，手机里多了两百个联系人。' },
        { t: '谈一场恋爱', dev: 10, check: ['人缘', 45],
          fx: (g) => { g.remember('campus', 'love'); g.remember('love', 'dating'); g.remember('loveFrom', 'campus'); g.info('婚姻', '恋爱中'); g.stat('心情', 8); },
          res: '你们在食堂门口第一次说上话。后来每天一起去上早八。',
          fail: { fx: (g) => { g.remember('campus', 'game'); g.stat('心情', -3); }, res: '表白被拒了。你在宿舍打了一个学期的游戏。' } },
      ] }),
    dec({ id: 'y_work19', age: 19, t: '城里', loc: 'metro', cond: (g) => working(g),
      text: (g) => '在' + (g.recall('workCity') || '城里') + '的第一个春节，你没回家，加班费是平时的三倍。厂里包了饺子，你吃了三个。',
      choices: [
        { t: '能省就省，钱存着', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.6), 'safe'); g.stat('心情', -2); }, res: (g) => '你去银行存了一张 ' + CN.fmt(last.amt) + ' 的定期。存单你夹在了身份证后面。' },
        { t: '跟工友出去玩，见见世面', dev: 10, fx: (g) => { g.remember('workStyle', 'fun'); CN.pay(g, 6000); g.stat('心情', 5); g.stat('人缘', 4); }, res: '你们去了海边，一趟花了 ¥6,000。你第一次见到海，站了很久。' },
        { t: '晚上去上夜校，考个证', dev: 15, fx: (g) => { g.remember('workStyle', 'study'); CN.pay(g, 4000); g.stat('学识', 6); g.stat('健康', -2); }, res: '学费 ¥4,000。下了班去上课，你常常在最后一排睡着。证考下来了。' },
      ] }),

    /* ================= 20 岁 ================= */
    dec({ id: 'y_army_back', age: 20, t: '退伍', loc: 'road', cond: (g) => g.recall('lifePath') === 'army',
      text: '两年兵役满了。指导员问你要不要留下转士官。退伍的话，能领一笔 ¥6 万左右的退役金。',
      choices: [
        { t: '留队，转士官', dev: 10, fx: (g) => { g.remember('army', 'stay'); CN.setJob(g, 'soldier', '士官'); g.stat('健康', 4); g.stat('事业', 6); }, res: '你肩上的牌子换了颜色。' },
        { t: '退伍，回老家考公', canon: true,
          fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); if (g.s('学识') >= 45 || g.rnd() < 0.5) { CN.setJob(g, 'civil', '基层公务员'); toCounty(g); } else { CN.setJob(g, 'driver', '司机'); CN.goCity(g, 3); } },
          res: (g) => '退役金 ¥6 万到了账。' + (g.recall('job') === 'civil' ? '退役军人有加分，你考上了县里的岗位，' : '考公没考上。你考了驾照，在市里给一家公司开车，') + payWord(g) + '。' },
        { t: '退伍，去大城市做物流', dev: 10, fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); CN.setJob(g, 'driver', '物流司机'); CN.goCity(g, 1); }, res: (g) => '物流公司喜欢当过兵的人。你开夜班车，' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_side', age: 20, t: '课余', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '大二了。身边的人有的去实习，有的在做兼职，有的在打游戏。',
      choices: [
        { t: '找家公司实习', canon: true, fx: (g) => { g.remember('uniSide', 'intern'); CN.earn(g, 6000); g.stat('事业', 5); g.stat('学识', 2); }, res: '实习一个月 ¥3,000，干了两个月。你学会了做表格，也学会了看领导脸色。' },
        { t: '做家教、送外卖挣生活费', dev: 10, fx: (g) => { g.remember('uniSide', 'money'); CN.earn(g, 15000); g.stat('学识', -1); }, res: '一年下来挣了 ¥1.5 万。你再没问家里要过生活费。' },
        { t: '和同学搞个小项目', dev: 20, check: ['学识', 72],
          fx: (g) => { g.remember('uniSide', 'project'); g.stat('事业', 4); g.stat('学识', 4); }, res: '你们做的小程序有了几千个用户。有人问你们要不要融资。',
          fail: { fx: (g) => { g.remember('uniSide', 'none'); g.stat('心情', -3); }, res: '项目做了一半，散伙了。散伙饭是你请的。' } },
      ] }),
    dec({ id: 'y_work20', age: 20, t: '换个活法', loc: 'factory', cond: (g) => working(g) && !g.recall('army'),
      text: (g) => (g.recall('workStyle') === 'study' ? '你考下来的证，让你有了换岗的机会。' : '厂里的订单越来越少，车间里多了几台机械臂。') + '你现在' + payWord(g) + '。',
      choices: [
        { t: (g) => '学门手艺，以后不靠流水线（拜师 ¥5,000，出师后' + CN.jobLine(g, 'worker', null, 4) + '）', canon: true, cond: (g) => !g.recall('skill'),
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.pay(g, 5000); CN.setJob(g, 'worker', { cook: '厨师', auto: '汽修工', hair: '理发师', elec: '电工' }[s]); g.stat('事业', 4); },
          res: '拜师交了 ¥5,000。半年后，师傅说你可以出师了。' },
        { t: (g) => '去跑外卖（' + CN.jobLine(g, 'rider', 1) + '）', dev: 10, cond: (g) => g.recall('job') !== 'rider',
          fx: (g) => { CN.setJob(g, 'rider', '外卖骑手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('健康', -3); },
          res: (g) => '你每天跑十二个小时，' + payWord(g) + '，膝盖开始疼。' },
        { t: (g) => '学着做直播（设备 ¥3,000，' + CN.jobLine(g, 'creator') + '）', dev: 20, check: ['人缘', 50],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, 'creator', '主播'); g.stat('心情', 3); }, res: '补光灯和声卡花了 ¥3,000。你拍的车间日常有人看，第一个月，打赏够交房租了。',
          fail: { fx: (g) => { CN.pay(g, 3000); g.stat('心情', -4); }, res: '设备花了 ¥3,000。直播间常常只有三个人，其中一个是你妈。' } },
        { t: (g) => '回老家，帮家里（' + CN.jobLine(g, rural(g) ? 'farmer' : 'shop', rural(g) ? 5 : 4) + '）', dev: 10,
          fx: (g) => { goBack(g); g.remember('backHome', 'early'); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '种地，农闲打零工' : '在家里的店帮忙'); g.stat('心情', 3); },
          res: '你回来那天，家门口的路刚修成水泥的。挣得少了，饭是热的。' },
      ] }),

    /* ================= 21 岁 ================= */
    dec({ id: 'y_plan', age: 21, t: '大三', loc: 'campus', cond: (g) => g.recall('lifePath') === 'uni',
      text: '大三下学期，宿舍里的人分成了几拨：考研的、考公的、找工作的。',
      choices: [
        { t: '找工作', canon: true, fx: (g) => { g.remember('plan', 'job'); g.stat('事业', 3); }, res: '你改了十几版简历。' },
        { t: '考研', dev: 10, fx: (g) => { g.remember('plan', 'grad'); g.stat('学识', 4); g.stat('心情', -3); }, res: '你在自习室占了一个靠窗的座位，一坐就是一年。' },
        { t: '考公', dev: 10, fx: (g) => { g.remember('plan', 'civil'); CN.pay(g, 3000); g.stat('学识', 3); }, res: '你报了一个 ¥3,000 的网课，又买了一摞行测和申论的书。' },
        { t: '出国读书', dev: 20, cond: (g) => ['rich', 'civil'].includes(g.recall('family')), fx: (g) => { g.remember('plan', 'abroad'); g.stat('学识', 3); }, res: '你考了语言成绩。家里拿出 ¥40 万，你妈说这是给你攒了很多年的。' },
      ] }),
    dec({ id: 'y_college_out', age: 21, t: '大专毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'college',
      text: (g) => '三年过得快。' + (g.recall('major') || '你的专业') + '的同学，大半已经签了工作。',
      choices: [
        { t: (g) => { const m = g.recall('major'); const j = { 护理: 'nurse', 学前教育: 'teacher', 机器人维修: 'worker', 电商: 'sales' }[m] || 'worker'; return '按专业找工作（' + CN.jobLine(g, j, ['机器人维修', '电商'].includes(m) ? 2 : 3) + '）'; }, canon: true,
          fx: (g) => {
            CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work');
            const m = g.recall('major');
            if (m === '护理') { CN.setJob(g, 'nurse', '护士'); CN.goCity(g, 3); g.move('hospital', g.recall('workCity') + ' · 市医院'); }
            else if (m === '学前教育') { CN.setJob(g, 'teacher', '幼儿园老师'); CN.goCity(g, 3); }
            else if (m === '机器人维修') { CN.setJob(g, 'worker', '机器人运维'); CN.goCity(g, 2); g.move('factory', g.recall('workCity') + ' · 自动化工厂'); }
            else if (m === '电商') { CN.setJob(g, 'sales', '电商运营'); CN.goCity(g, 2); g.move('office', g.recall('workCity') + ' · 电商园区'); }
            else { CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 车间'); }
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了，职位是' + (JY.engine.get().L.info['职业'] || '') + '，' + payWord(g) + '。' },
        { t: '专升本，再读两年', dev: 15, check: ['学识', 66],
          fx: (g) => { g.remember('lifePath', 'uni'); g.remember('uni', 'normal'); g.remember('plan', 'job'); g.info('学历', '本科在读'); g.stat('学识', 3); },
          res: '你考上了。毕业证上会写着“本科”两个字。',
          fail: { fx: (g) => { CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work'); CN.setJob(g, 'sales', '销售'); CN.goCity(g, 2); }, res: '差了几分。你拿着大专文凭去做了销售，底薪加提成。' } },
        { t: '回老家开店', dev: 20,
          fx: (g) => { CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work'); g.remember('backHome', 'early'); toCounty(g); CN.setJob(g, 'shop', '开小店'); CN.earn(g, 20000); CN.pay(g, 40000); g.stat('心情', 3); },
          res: (g) => '你在' + g.recall('workCity') + '的街上盘下一个门面。转让费加装修 ¥4 万，' + parentWord(g) + '出了一半。' },
      ] }),
    dec({ id: 'y_love21', age: 21, t: '有人', loc: 'metro', cond: (g) => working(g) && loveIs(g, 'single'),
      text: (g) => '同在' + (g.recall('workCity') || '城里') + '打拼的老乡里，有个人总是给你留饭。',
      choices: [
        { t: '处处看', canon: true, fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', '恋爱中'); g.stat('心情', 6); }, res: '你们下了班一起去吃麻辣烫，一人一碗，加一个蛋，两个人 ¥36。' },
        { t: '先顾自己，不想谈', dev: 10, fx: (g) => { g.remember('singleWay', 'self'); g.stat('事业', 2); }, res: '你把那份心思都放在了挣钱上。' },
      ] }),

    /* ================= 22 岁：毕业 ================= */
    { id: 'y_grad_result', age: 22, t: '毕业季', auto: true, cond: (g) => g.recall('lifePath') === 'uni',
      fx: (g) => {
        const p = g.recall('plan');
        const uniB = { top: 15, good: 6, normal: 0 }[g.recall('uni')] || 0;
        if (p === 'grad' && g.s('学识') + uniB + g.rnd() * 20 >= 88) { g.remember('lifePath', 'grad'); CN.setEdu(g, 'bachelor', '本科'); g.info('学历', '硕士在读'); g.move('campus', g.recall('workCity') + ' · 研究生院'); }
        else if (p === 'civil' && g.s('学识') + uniB + g.rnd() * 25 >= 90) { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'work'); CN.setJob(g, 'civil', '公务员'); CN.goCity(g, CN.pick([2, 3, 4])); g.move('office', g.recall('workCity') + ' · 机关大院'); }
        else if (p === 'abroad') { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'abroad'); g.info('学历', '在国外读硕士'); g.move('campus', '国外 · 一所大学'); }
        else { CN.setEdu(g, 'bachelor', '本科'); g.remember('gradFail', p === 'grad' || p === 'civil'); }
      },
      text: (g) => {
        const t = g.recall('lifePath');
        if (t === 'grad') return '你考上了研究生。拍毕业照那天，你知道自己还要在学校里待三年。';
        if (t === 'abroad') return '毕业典礼一结束，你就去了机场。';
        if (g.recall('job') === 'civil') return '你考上了。公示名单上，你的名字排在第三个。' + payWord(g) + '，不多，稳当。';
        return (g.recall('gradFail') ? '考试没上岸。' : '') + '毕业照上大家都在笑。散伙饭吃到凌晨，' + ({ love: '你和对象在操场上坐到天亮。', club: '社团的人哭成一片。', study: '你把笔记本送给了学弟。', game: '你们最后开了一局游戏。' }[g.recall('campus')] || '有人喝多了。');
      } },
    dec({ id: 'y_offer', age: 22, t: '第一份工作', loc: 'office', cond: (g) => g.recall('lifePath') === 'uni' && !g.recall('job'),
      text: (g) => '投了几十份简历，' + (g.recall('uniSide') === 'intern' ? '实习过的公司先给了你回复。' : '回音不多。') + '那一年，很多基础岗位被 AI 替代，招聘会上的人比岗位多。',
      choices: [
        { t: (g) => '去大城市，进一家大厂（' + CN.jobLine(g, g.recall('major') === '计算机' ? 'tech' : 'office', 1) + '）', dev: 10, check: ['学识', 84],
          fx: (g) => { CN.setJob(g, g.recall('major') === '计算机' ? 'tech' : 'office', g.recall('major') === '计算机' ? '程序员' : '大厂职员'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 写字楼'); g.remember('lifePath', 'work'); g.remember('offer22', 'big'); g.stat('健康', -3); },
          res: (g) => '你进了' + g.recall('workCity') + '的一家大厂，' + payWord(g) + '。工牌挂在脖子上，晚上十点地铁还很挤。',
          fail: { fx: (g) => { CN.setJob(g, 'office', '公司职员'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: (g) => '大厂没要你。你回了' + g.recall('workCity') + '，在一家小公司上班，' + payWord(g) + '。' } },
        { t: (g) => '回省城，找份稳定的工作（' + CN.jobLine(g, { 医学: 'doctor', 师范: 'teacher' }[g.recall('major')] || 'office', 2) + '）', canon: true,
          fx: (g) => {
            const m = g.recall('major');
            g.remember('offer22', 'stable');
            if (m === '医学') { CN.setJob(g, 'doctor', '住院医生'); g.move('hospital', capital(g) + ' · 省医院'); }
            else if (m === '师范') CN.setJob(g, 'teacher', '中学老师');
            else CN.setJob(g, 'office', '公司职员');
            CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work');
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了，' + payWord(g) + '。不算多，周末能回家。' },
        { t: (g) => '回老家，考编（' + CN.jobLine(g, g.recall('major') === '师范' ? 'teacher' : 'civil', 4) + '）', dev: 10,
          fx: (g) => { CN.setJob(g, g.recall('major') === '师范' ? 'teacher' : 'civil', g.recall('major') === '师范' ? '县中学老师' : '乡镇公务员'); toCounty(g); g.remember('backHome', 'early'); g.remember('lifePath', 'work'); g.remember('offer22', 'civil'); g.stat('心情', 3); },
          res: (g) => '编制考上了，' + payWord(g) + '。你妈在亲戚群里发了一个大红包。' },
        { t: (g) => '做自媒体，自己干（' + CN.jobLine(g, 'creator', 2) + '）', dev: 25, check: ['人缘', 55],
          fx: (g) => { CN.setJob(g, 'creator', '博主'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.remember('offer22', 'media'); g.stat('心情', 4); },
          res: '你拍的租房日常火了一条。半年后，接广告的钱够活了。',
          fail: { fx: (g) => { CN.setJob(g, 'freelance', '自由职业'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: '粉丝涨得很慢。你接了一些零活，勉强交上房租。' } },
      ] }),
    dec({ id: 'y_worker22', age: 22, t: '留下还是回去', loc: 'metro', cond: (g) => working(g) && !white(g) && !g.recall('army') && away(g),
      text: (g) => '过年回家，' + (g.recall('workStyle') === 'save' ? '你给' + parentWord(g) + '带了一个红包，鼓鼓的。' : '你兜里没剩几个钱。') + (g.alive('fa') ? '你爸' : '家里人') + '问你，打算在外面漂到什么时候。你在' + here(g) + payWord(g) + '，房租一个月 ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + '。',
      choices: [
        { t: '留在城里接着干', canon: true, fx: (g) => { g.remember('stayCity', true); g.stat('事业', 3); }, res: '正月初六，你又坐上了往外走的车。' },
        { t: '回老家开个店', dev: 20, cond: (g) => !!g.recall('skill') || g.recall('workStyle') === 'save',
          fx: (g) => { goBack(g); toCounty(g); g.remember('backHome', 'early'); CN.setJob(g, 'shop', { cook: '开小饭馆', auto: '开修车铺', hair: '开理发店', elec: '开五金店' }[g.recall('skill')] || '开小卖部'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.8, 60000)); CN.pay(g, last.amt); g.stat('心情', 5); },
          res: (g) => '门面一年租金加装修，花了 ' + CN.fmt(last.amt) + '。开张那天，你放了一挂鞭炮。第一个客人是你小学同学。' },
        { t: '去更远的城市闯', dev: 15, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { CN.goCity(g, 1, CN.pick(['上海', '深圳', '北京', '杭州'])); g.remember('stayCity', true); g.stat('心情', -2); },
          res: (g) => '你去了' + g.recall('workCity') + '。同样的活，' + payWord(g) + '，房租却要 ' + CN.fmt(RENT_M[1]) + '。地铁线路图你看了三天才看懂。' },
        { t: '跟着老乡去更大的厂', dev: 10, cond: (g) => tierNow(g) === 1,
          fx: (g) => { g.remember('stayCity', true); CN.setJob(g, 'worker', '大厂的线长'); g.stat('事业', 4); },
          res: '新厂包住，宿舍四个人一间。你当上了线长，管二十个人。' },
      ] }),
    dec({ id: 'y_credit22', age: 22, t: '先用后付', loc: 'home', cond: (g) => working(g) && !!g.recall('money0'),
      text: '手机用了四年，屏幕裂了一道。购物软件弹出来一行字：先用后付，免息分期，额度 ¥3 万。',
      choices: [
        { t: '不借，攒够了再买', canon: true, fx: (g) => { g.remember('credit', 'none'); CN.pay(g, 2000); }, res: '你花 ¥2,000 换了块屏。手机还能再用两年。' },
        { t: '分期买一部新手机', dev: 10, fx: (g) => { g.remember('credit', 'phone'); CN.pay(g, 6000); g.stat('心情', 3); }, res: '¥6,000 的手机，分十二期，每月 ¥500。拆盒子那天你挺高兴。' },
        { t: '开通额度，想买就买', dev: 20, fx: (g) => { g.remember('credit', 'loan'); g.remember('debt', debtW(g) + 3); g.stat('心情', 4); }, res: '新手机、新电脑、一副耳机，一个月就刷了 ¥3 万。账单上写着“最低还款”。' },
      ] }),

    /* ================= 23 岁 ================= */
    dec({ id: 'y_abroad', age: 23, t: '在国外', loc: 'campus', cond: (g) => g.recall('lifePath') === 'abroad',
      text: '硕士快毕业了。你在超市里找了很久，才找到一瓶像样的辣椒酱。',
      choices: [
        { t: '回国', canon: true, fx: (g) => { CN.setEdu(g, 'master', '海外硕士'); g.remember('lifePath', 'work'); CN.setJob(g, 'office', '外企职员'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 写字楼'); }, res: (g) => '你落地' + g.recall('workCity') + '，第一顿吃的是火锅。新工作' + payWord(g) + '。' },
        { t: '留在国外工作几年', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '海外硕士'); g.remember('lifePath', 'work'); g.remember('abroadStay', true); CN.setJob(g, 'office', '在海外工作'); g.move('office', '国外 · 一家公司'); g.info('住处', '国外'); g.stat('人缘', -4); }, res: '你和家里的视频，从每天变成了每周。' },
      ] }),
    dec({ id: 'y_grad23', age: 23, t: '研一', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '导师给你的第一个任务，是帮他报销发票。研究生补助一个月 ¥1,500。',
      choices: [
        { t: '跟着导师做项目', canon: true, fx: (g) => { g.remember('gradWay', 'lab'); g.stat('学识', 6); g.stat('心情', -2); }, res: '你在实验室过了两个春节。' },
        { t: '多出去实习', dev: 10, fx: (g) => { g.remember('gradWay', 'intern'); CN.earn(g, 20000); g.stat('事业', 6); }, res: '你在一家公司实习了一年，攒下 ¥2 万。走的时候主管说，毕业了来找我。' },
      ] }),
    dec({ id: 'y_rent', age: 23, t: '租房', loc: 'home', cond: (g) => working(g) && white(g) && tierNow(g) <= 3 && !g.recall('house') && !withParents(g) && !g.recall('abroadStay'),
      text: (g) => '在' + here(g) + '，' + payWord(g) + '。一个像样的一居室，月租 ' + CN.fmt(RENT_M[tierNow(g)]) + '，押一付三。',
      choices: [
        { t: '合租，省钱', canon: true, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'share'); CN.earn(g, RENT_M[tierNow(g)] * 5); g.stat('心情', -2); }, res: (g) => '一个单间 ' + CN.fmt(RENT_M[tierNow(g)] * 0.55) + '。你和三个陌生人共用一个卫生间，早上要排队。有个室友周末会做一大锅红烧肉，分你一碗。' },
        { t: '咬牙整租一个一居室', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'whole'); CN.pay(g, RENT_M[tierNow(g)] * 3); g.stat('心情', 4); }, res: '你买了一盆绿萝放在窗台上。下班回来，屋里亮着你自己开的灯。' },
        { t: '住到郊区，通勤两小时', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'far'); CN.earn(g, RENT_M[tierNow(g)] * 6); g.stat('健康', -3); }, res: (g) => '月租只要 ' + CN.fmt(RENT_M[tierNow(g)] * 0.5) + '。你在地铁上看完了很多本书。' },
      ] }),
    dec({ id: 'y_love23', age: 23, t: '相亲', loc: 'home', cond: (g) => working(g) && loveIs(g, 'single') && (rural(g) || county(g)),
      text: (g) => '过年回家，' + (g.alive('mo') ? '你妈' : '你姑') + '已经安排好了三场相亲，一天一场。',
      choices: [
        { t: '去见，看着合适就处', canon: true, check: ['人缘', 40],
          fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('心情', 4); }, res: '第二场的那个人话不多，走的时候把你送到了巷子口。',
          fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -3); }, res: '三场都没成。回去的路上，你给自己买了一串糖葫芦。' } },
        { t: '一个都不去', dev: 15, fx: (g) => { g.remember('singleWay', 'refuse'); g.stat('心情', 2); g.stat('人缘', -4); }, res: '家里人三天没跟你说话。第四天早上，桌上还是给你留了一碗面。' },
      ] }),
    dec({ id: 'y_save23', age: 23, t: '第一笔钱', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 15000 && !g.recall('abroadStay'),
      text: (g) => '工作这些年，卡里第一次有了 ' + CN.fmt(cash(g)) + '。午饭的时候，同事们在聊基金、聊股票，也有人说钱还是放银行踏实。',
      choices: moneyChoices() }),

    /* ================= 24 岁：AI 来了 ================= */
    dec({ id: 'y_ai24', age: 24, t: '被替代', loc: 'office', cond: (g) => working(g) && AI_JOBS.includes(g.recall('job')) && !g.recall('abroadStay'),
      text: (g) => ({ tech: '公司上了一套新的写代码的 AI，组里裁了三分之一。', office: '你做的报表，现在 AI 几秒钟就能出。', sales: '客户开始跟 AI 客服聊天了。', worker: '车间又进了一批机器人，一条线只要两个人看着。', rider: '小区里开始有无人车送外卖。', driver: '无人驾驶的货车上了高速。' }[g.recall('job')]) + '你的位置有点悬。',
      choices: [
        { t: '学新东西，跟着变', canon: true, check: ['学识', 70],
          fx: (g) => { g.remember('aiMove', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); g.stat('事业', 5); if (['worker', 'rider', 'driver'].includes(g.recall('job'))) CN.setJob(g, 'worker', '机器人运维'); },
          res: '你花 ¥5,000 报了一个培训班，熬了几个月的夜，学会了怎么跟机器打交道。你留下来了。',
          fail: { fx: (g) => { g.remember('aiMove', 'laid'); last.amt = r1000(perMonth(g) * 3); CN.earn(g, last.amt); g.stat('心情', -6); CN.setJob(g, 'freelance', '打零工'); }, res: (g) => '你还是被裁了。补偿 ' + CN.fmt(last.amt) + '，你在公司楼下坐了一下午。晚上，' + (married(g) ? '家里' : '朋友') + '给你煮了一碗面。' } },
        { t: (g) => '转行，去做 AI 训练师（' + CN.jobLine(g, 'tech') + '）', dev: 15, fx: (g) => { g.remember('aiMove', 'switch'); CN.setJob(g, 'tech', 'AI 训练师'); g.stat('事业', 3); }, res: (g) => '你的新工作是教机器说人话。听起来有点好笑，' + payWord(g) + '。' },
        { t: (g) => '换个机器干不了的活，去做护理（' + CN.jobLine(g, 'nurse') + '）', dev: 15,
          fx: (g) => { g.remember('aiMove', 'care'); CN.setJob(g, g.rnd() < 0.5 ? 'nurse' : 'freelance', g.rnd() < 0.5 ? '护工' : '家政'); g.stat('人缘', 5); },
          res: '你去照顾老人。他们记不住你的名字，记得你的声音。' },
      ] }),
    dec({ id: 'y_steady24', age: 24, t: '安稳', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay'),
      text: (g) => ({ civil: '单位里一眼能看到退休。', teacher: '你带的第一届学生毕业了。', doctor: '规培三年，你已经记不清上一次睡满八个小时是什么时候。', nurse: '夜班一个接一个。', shop: '店开了两年，生意不好不坏。', creator: '粉丝涨到了一个平台期。', soldier: '部队的日子很规律。', farmer: '村里年轻人越来越少。', freelance: '活有一阵没一阵。', boss: '你手下有了五个人。' }[g.recall('job')] || '日子一天天过。') + '你在' + here(g) + payWord(g) + '。你问自己，就这样了吗。',
      choices: [
        { t: '就这样，挺好', canon: true, fx: (g) => { g.remember('steady', 'stay'); g.stat('心情', 4); g.stat('事业', 2); }, res: (g) => (white(g) ? '你把办公桌收拾得很整齐，' : '你把手头的活安排得井井有条，') + '窗台上养了一盆多肉。' },
        { t: '往上走，争个位置', dev: 10, check: ['人缘', 50], fx: (g) => { g.remember('steady', 'up'); g.stat('事业', 8); g.stat('健康', -2); }, res: '你主动接了最难的活。年底，领导记住了你。', fail: { fx: (g) => { g.remember('steady', 'stuck'); g.stat('心情', -4); }, res: '位置给了别人。你在工位上坐了很久，下班去吃了一顿好的。' } },
        { t: '辞职，去更大的城市', dev: 20, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { g.remember('steady', 'move'); CN.goCity(g, tierNow(g) >= 3 ? 2 : 1, tierNow(g) >= 3 ? capital(g) : undefined); if (g.recall('job') !== 'tech') CN.setJob(g, 'office', '公司职员'); CN.pay(g, RENT_M[tierNow(g)] * 4); g.stat('心情', 3); },
          res: (g) => '你去了' + g.recall('workCity') + '。新工作' + payWord(g) + '，押一付三的房租一下交了 ' + CN.fmt(RENT_M[tierNow(g)] * 4) + '。没人认识你，这让你觉得轻松。' },
        { t: '辞职，回一座小一点的城市', dev: 15, cond: (g) => tierNow(g) <= 2,
          fx: (g) => { g.remember('steady', 'small'); CN.goCity(g, 3); if (!['civil', 'teacher', 'doctor', 'nurse'].includes(g.recall('job'))) CN.setJob(g, 'office', '公司职员'); g.stat('心情', 5); g.stat('健康', 2); },
          res: (g) => '你去了' + g.recall('workCity') + '。工资降到' + payWord(g).replace(/^.*?大概 /, '') + '，房租只要 ' + CN.fmt(RENT_M[3]) + '。下班的时候天还亮着。' },
      ] }),

    /* ================= 25 岁 ================= */
    dec({ id: 'y_grad_out', age: 25, t: '硕士毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '答辩完，导师问你要不要接着读博。',
      choices: [
        { t: '去工作', canon: true,
          fx: (g) => { CN.setEdu(g, 'master', '硕士'); g.remember('lifePath', 'work'); const m = g.recall('major'); CN.setJob(g, m === '计算机' ? 'tech' : m === '医学' ? 'doctor' : 'office', m === '计算机' ? '算法工程师' : m === '医学' ? '医生' : '研究员'); CN.goCity(g, g.recall('gradWay') === 'intern' ? 1 : 2); g.move('office', g.recall('workCity') + ' · 写字楼'); },
          res: (g) => (g.recall('gradWay') === 'intern' ? '实习时的主管兑现了承诺。' : '你投了二十份简历，拿到三个面试。') + '你在' + g.recall('workCity') + '上班了，' + payWord(g) + '。' },
        { t: '读博', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '硕士'); g.remember('lifePath', 'phd'); g.info('学历', '博士在读'); g.stat('学识', 6); }, res: '你又在学校留了下来，补助一个月 ¥3,500。同学们开始结婚了。' },
      ] }),
    dec({ id: 'y_dating25', age: 25, t: '见家长', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => ({ campus: '你们从大学走到现在，', work: '你们在城里互相照应了几年，', blind: '相亲认识一年多，', online: '从网上聊到线下，' }[g.recall('loveFrom')] || '在一起有一阵了，') + '对方说，该见见家长了。',
      choices: [
        { t: '带回家见爸妈', canon: true, cond: (g) => parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: (g) => '你们拎着 ¥3,000 的礼回了家。' + (g.alive('mo') ? '你妈做了一桌子菜。对方吃了三碗饭，你妈很高兴。' : '你爸下厨，菜咸了一点。对方吃得干干净净。') },
        { t: '去对方家里拜年', canon: true, cond: (g) => !parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: '你拎着礼去了对方家。对方的妈妈一直往你碗里夹菜，说以后这里也是你家。' },
        { t: '再等等，还没想好', dev: 10, fx: (g) => { g.remember('metParents', false); g.stat('心情', -2); if (g.rnd() < 0.4) { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); } }, res: (g) => (loveIs(g, 'single') ? '对方没再等。你们分开了。' : '对方没说什么，只是不太爱笑了。') },
      ] }),
    dec({ id: 'y_love25', age: 25, t: '一个人', loc: 'home', cond: (g) => loveIs(g, 'single') && g.recall('lifePath') !== 'phd',
      text: (g) => '朋友圈里，有人结婚，有人晒娃。' + (withParents(g) ? '你下班回家，你妈在饭桌上又提了一句隔壁家的孩子。' : '你下班回家，点了一份 ¥25 的外卖。'),
      choices: [
        { t: '让朋友介绍一个', canon: true, check: ['人缘', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('心情', 5); }, res: '朋友介绍的人很实在，第一次见面就聊到了房价。第二次见面，聊到了小时候。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '见了几个，都没下文。' } },
        { t: '在交友软件上碰碰运气', dev: 10, check: ['心情', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'online'); g.info('婚姻', '恋爱中'); g.stat('心情', 4); }, res: '你们聊了一个月才见面。见了以后，比照片好看。', fail: { fx: (g) => { g.remember('singleWay', 'app'); g.stat('心情', -4); }, res: '聊着聊着，对方开始推荐理财产品。你删了软件。' } },
        { t: '自己过也挺好', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 2000); g.stat('心情', 3); g.stat('事业', 2); }, res: '你花 ¥2,000 报了一个周末的陶艺课。第一只碗歪得厉害，你还是用它吃饭。' },
      ] }),

    /* ================= 26 岁：结婚 ================= */
    dec({ id: 'y_marry', age: 26, t: '结婚', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => wedText(g) + '你看着对方，没马上说话。',
      choices: [
        { t: '结婚，按老家的规矩办', canon: true,
          fx: (g) => { const w = wedPlan(g); CN.marry(g, { origin: { campus: '大学同学', work: '老乡', blind: '相亲认识', online: '网上认识' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 8); g.stat('人缘', 4); },
          res: (g) => '你和' + g.recall('spouse') + '结婚了。' + wedRes(g, last) },
        { t: '彩礼谈不拢，先缓缓', dev: 15, cond: (g) => rural(g) || county(g), fx: (g) => { g.remember('caili', 'stuck'); g.stat('心情', -5); }, res: '两家人不欢而散。那天晚上，对方还是给你发了一句“到家了吗”。' },
        { t: '旅行结婚，不办酒', dev: 15, fx: (g) => { CN.marry(g, { origin: '恋人' }); g.remember('caili', 'travel'); CN.pay(g, 15000); g.stat('人缘', -3); g.stat('心情', 6); }, res: '你们去了海边，一趟花了 ¥1.5 万，省下的钱存了起来。亲戚们说你们不懂事。' },
        { t: '分手', dev: 20, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); g.stat('心情', -10); }, res: '你删掉了相册里的照片，删到一半停下了。' },
      ] }),
    dec({ id: 'y_career26', age: 26, t: '跳槽', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay') && ['office', 'tech', 'sales', 'boss'].includes(g.recall('job')),
      text: (g) => '猎头打来电话。你现在' + payWord(g) + '，对方开的价，比这多三成。',
      choices: [
        { t: (g) => '跳（月薪多三成，到 ' + CN.fmt(r100(CN.jobPay(g, g.recall('job')) * 1.3)) + '左右；新公司试用期站不稳就得走）', dev: 10, check: ['事业', 30], fx: (g) => { g.remember('jumped', true); g.stat('事业', 8); }, res: (g) => '新公司的工位在二十八楼，能看见江。' + payWord(g) + '。', fail: { fx: (g) => { g.remember('jumped', false); g.stat('心情', -3); }, res: '面了三轮，没了下文。' } },
        { t: (g) => '不动，稳着（现在约 ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + '/月，熟门熟路）', canon: true, fx: (g) => { g.remember('jumped', false); g.stat('事业', 3); g.stat('心情', 1); }, res: '你谢绝了。下个月，组长的位置给了你。' },
      ] }),
    dec({ id: 'y_side26', age: 26, t: '下班以后', loc: 'metro', cond: (g) => working(g) && !g.recall('abroadStay') && ['worker', 'rider', 'driver', 'shop', 'freelance', 'creator', 'nurse', 'farmer'].includes(g.recall('job')),
      text: (g) => '你' + payWord(g) + '。' + (kidN(g) || married(g) ? '家里的开销一年比一年大。' : '房租、吃饭、给家里寄一点，月底剩不下多少。') + '身边有人下了班还在干点别的。',
      choices: [
        { t: '不折腾，下班就歇着', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('健康', 2); }, res: '晚上你去河边走一圈，回来早早睡了。' },
        { t: '晚上接点零活，跑车跑腿', dev: 10, fx: (g) => { g.remember('side', 'drive'); g.stat('健康', -3); }, res: '你每天晚上多干三个小时，一个月能多挣 ¥800 来块。' },
        { t: '周末去夜市摆摊', dev: 15, fx: (g) => { g.remember('side', 'stall'); CN.pay(g, 3000); g.stat('人缘', 3); }, res: '小推车和货花了 ¥3,000。你卖烤肠和手机壳，第一个晚上挣了 ¥160。' },
        { t: '学剪辑，接短视频的单子', dev: 15, check: ['学识', 50],
          fx: (g) => { g.remember('side', 'video'); CN.pay(g, 2000); g.stat('学识', 3); }, res: '网课 ¥2,000。三个月后，你接到了第一单，给一家饭馆剪宣传片。',
          fail: { fx: (g) => { CN.pay(g, 2000); g.stat('心情', -2); }, res: '网课 ¥2,000，看了一半就放下了。' } },
      ] }),

    dec({ id: 'y_car26', age: 26, t: '买车', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000 && !g.recall('abroadStay'),
      text: carText, choices: carChoices() }),
    /* ================= 27 岁：房子 ================= */
    dec({ id: 'y_house', age: 27, t: '买房', loc: 'home', cond: (g) => married(g) && !hasHouse(g) && !g.recall('abroadStay'),
      text: (g) => {
        const d = deal(g, buyTier(g), 0.7);
        return (g.recall('rentType') === 'share' ? '合租的日子过够了。' : '') + (isMale(g) ? '丈母娘' : '婆婆') + '那边说，没房子心里不踏实。'
          + '在' + buyPlace(g) + '，一套小两居总价 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '。你们手里有 ' + CN.fmt(cash(g)) + '，两边爸妈加起来能拿出 ' + CN.fmt(famHelp(g)) + '。';
      },
      choices: houseChoices(1.1, 0.7, '一套三居', '一套小两居') }),
    dec({ id: 'y_marry27', age: 27, t: '再想想', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => (g.recall('caili') === 'stuck' ? '彩礼的事拖了一年。对方家里松了口，说少要一些。' : '在一起好几年了。身边的人都在问什么时候办事。'),
      choices: [
        { t: '结婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: '处了好几年' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '结婚了。喜糖是你自己挑的。' + wedRes(g, last) },
        { t: '分开', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); g.stat('心情', -8); }, res: '你们分开得很平静，像两个累了的人。' },
      ] }),
    dec({ id: 'y_back27', age: 27, t: '回不回去', loc: 'metro', cond: (g) => tierNow(g) <= 2 && g.recall('hukou') !== 'city' && !g.recall('abroadStay') && parentAlive(g),
      text: (g) => '你在' + here(g) + '待了好几年，' + payWord(g) + '。' + parentWord(g) + '打电话越来越短，' + (g.alive('fa') ? CN.who(g, 'fa', true) + '的腰不好了。' : CN.who(g, 'mo', true) + '说一个人吃饭没意思。'),
      choices: [
        { t: '留下，再拼几年', canon: true, fx: (g) => { g.remember('backHome', 'no'); CN.pay(g, 3000); g.stat('事业', 4); g.stat('人缘', -2); }, res: (g) => '你给家里寄了一个 ¥3,000 的按摩椅。' + parentWord(g) + '在视频里坐上去，眯着眼说舒服。' },
        { t: '回老家', dev: 15, fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); if (!['civil', 'teacher', 'shop'].includes(g.recall('job'))) CN.setJob(g, 'office', '本地公司职员'); g.stat('心情', 5); g.stat('人缘', 4); }, res: (g) => '你回了' + g.recall('city') + '。工资降到' + payWord(g).replace(/^.*?大概 /, '') + '，晚饭是在家吃的。' },
      ] }),
    dec({ id: 'y_startup', age: 27, t: '创业', loc: 'office', cond: (g) => working(g) && (g.recall('uniSide') === 'project' || g.recall('family') === 'rich' || g.s('事业') >= 45),
      text: (g) => '一个老同学找到你，说有个想法，就差一个合伙人，要你拿出 ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + ' 入股。',
      choices: [
        { t: (g) => '辞职一起干（入股 ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + '；成了收入翻几倍，十家里活下来一两家）', dev: 25, check: ['事业', 50], fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'ok'); CN.setJob(g, 'boss', '创业公司合伙人'); g.stat('健康', -4); }, res: '第三年，公司拿到了融资。你请所有人吃了一顿烧烤。', fail: { fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'fail'); g.remember('debt', debtW(g) + 20); g.stat('心情', -8); }, res: '撑了两年，公司没了。入股的钱打了水漂，你还欠了 ¥20 万。老同学请你吃了一顿饭，两个人都没怎么说话。' } },
        { t: (g) => '算了，打工稳当（' + CN.jobLine(g, g.recall('job') || 'office') + '）', canon: true, fx: (g) => { g.remember('startup', 'no'); g.stat('心情', 1); }, res: '后来你在新闻里看到了那家公司的名字。' },
      ] }),
    dec({ id: 'y_burnout27', age: 27, t: '加班', loc: 'office', cond: (g) => ['tech', 'office', 'doctor', 'boss'].includes(g.recall('job')),
      text: '连续三个月，你没在十二点前睡过。体检报告上有好几个箭头。',
      choices: [
        { t: '扛着，过了这阵再说', canon: true, fx: (g) => { g.remember('burnout', 'push'); g.stat('健康', -8); g.stat('事业', 6); CN.earn(g, 20000); }, res: '项目上线了，奖金 ¥2 万。你在出租车上睡着了。' },
        { t: '降点要求，开始健身', dev: 15, fx: (g) => { g.remember('burnout', 'rest'); CN.pay(g, 3000); g.stat('健康', 6); g.stat('事业', -2); g.stat('心情', 3); }, res: '你办了一张 ¥3,000 的健身卡，这次真的去了。' },
      ] }),

    /* ================= 28 岁：孩子 ================= */
    dec({ id: 'y_kid', age: 28, t: '要孩子', loc: 'home', cond: (g) => married(g) && kidN(g) === 0,
      text: (g) => '结婚两年了。' + (g.alive('mo') ? '你妈每次打电话都要绕到这件事上。' : '') + (g.recall('house') === 'rent' ? '你们还租着房。' : '') + '你算了一笔账：生孩子自己要掏 ¥2 万左右，托育一个月 ¥3,000。',
      choices: [
        { t: '要一个，请老人帮忙带', canon: true, cond: (g) => parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'grand'); CN.haveKid(g); CN.pay(g, 20000); if (!withParents(g)) CN.liveWith(g, [g.alive('mo') ? 'mo' : 'fa']); g.stat('心情', 4); g.stat('健康', isMale(g) ? 0 : -4); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。' + CN.who(g, g.alive('mo') ? 'mo' : 'fa') + '搬来帮着带，家里一下子热闹了。你抱着' + CN.he(g, 'k1') + '，手都不知道往哪放。' },
        { t: '要一个，送托育', canon: true, cond: (g) => !parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'paid'); CN.haveKid(g); CN.pay(g, 20000 + 36000); g.stat('心情', 4); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。一岁起送了托育，一年 ¥3.6 万。老师每天发一张照片，你存了满满一相册。' },
        { t: '要一个，家里留一个人全职带', dev: 15,
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'home'); CN.haveKid(g); CN.pay(g, 20000); if (isMale(g)) g.remember('spWork', 'home'); else { g.remember('preKidJob', [g.recall('job'), JY.engine.get().L.info['职业'] || '上班']); CN.setJob(g, 'none', '全职妈妈'); } g.stat('心情', 3); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。' + (isMale(g) ? g.recall('spouse') + '辞了工作在家带孩子，家里只剩你一份工资。' : '你辞了工作在家带孩子，家里只剩' + g.recall('spouse') + '一份工资。') + '日子紧了，' + CN.he(g, 'k1') + '第一次笑出声那天，全家都在。' },
        { t: '再等两年', dev: 10, fx: (g) => { g.remember('kidPlan', 'wait'); g.stat('事业', 3); }, res: '你们说好了，等工作稳一点再说。' },
        { t: '不要孩子', dev: 25, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); g.stat('人缘', -5); }, res: '两边的老人都不说话了。你们养了一只猫。' },
      ] }),
    dec({ id: 'y_single28', age: 28, t: '被催', loc: 'home', cond: (g) => single(g),
      text: (g) => '过年回家，饭桌上七大姑八大姨轮着问。' + (g.recall('singleWay') === 'self' ? '你早就想好了怎么回答。' : '你低头吃菜。'),
      choices: [
        { t: '答应家里，再去相亲', canon: true, check: ['人缘', 40], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('人缘', 3); }, res: '这次的人还不错，知道你不吃香菜。你们约了第二次。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -4); }, res: '又没成。你妈说，不急，慢慢来。' } },
        { t: '不急，过好自己的日子', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 3); g.stat('人缘', -3); }, res: (g) => (away(g) ? '你初二就回了城，过了个清静年。' : '你初二就躲去朋友家喝茶，过了个清静年。') },
      ] }),

    /* ================= 29 岁 ================= */
    dec({ id: 'y_phd_out', age: 29, t: '博士毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'phd',
      text: '论文终于过了。你二十九岁，第一次领到一份正式工资之前，先看到了一张教职的招聘启事。',
      choices: [
        { t: '去高校当老师', canon: true, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'teacher', '大学讲师'); CN.goCity(g, 2); g.move('campus', g.recall('workCity') + ' · 一所大学'); g.stat('事业', 8); CN.earn(g, 100000); }, res: (g) => '学校给了 ¥10 万安家费。你分到一间和别人共用的办公室，' + payWord(g) + '。' },
        { t: '去企业做研发', dev: 10, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'tech', '研发工程师'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 研发中心'); }, res: (g) => payWord(g).replace(/^每月到手/, '月薪') + '，比你读博五年的补助加起来还多。' },
      ] }),
    dec({ id: 'y_marry29', age: 29, t: '定下来', loc: 'home', cond: (g) => loveIs(g, 'dating') && g.since('love') >= 1,
      text: (g) => '你们处了一年多。' + wedText(g),
      choices: [
        { t: '结婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.8); CN.marry(g, { origin: { campus: '大学同学', work: '同事', blind: '相亲认识', online: '网上认识' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '结婚了。' + wedRes(g, last) },
        { t: '领个证，不办酒', dev: 15, fx: (g) => { CN.marry(g, { origin: '处了一年多' }); g.remember('caili', 'travel'); CN.pay(g, 5000); g.stat('心情', 4); g.stat('人缘', -2); }, res: '领证那天你们吃了一顿 ¥500 的饭，拍了一张合照发在家族群里。' },
        { t: '分开', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); g.stat('心情', -6); }, res: '你们好好吃了最后一顿饭，各自回家。' },
      ] }),
    dec({ id: 'y_house29', age: 29, t: '要不要上车', loc: 'home', cond: (g) => !hasHouse(g) && !g.recall('abroadStay') && working(g) && (married(g) || cash(g) >= deal(g, buyTier(g), 0.45).down * 0.5),
      text: (g) => {
        const d = deal(g, buyTier(g), married(g) ? 0.7 : 0.45);
        return (married(g) ? '房东要卖房，让你们三个月内搬走。' : '一个人在' + here(g) + '，你攒下了 ' + CN.fmt(cash(g)) + '。中介说现在的价格是十年来最低的。')
          + (married(g) ? '一套小两居' : '一套一居室') + '总价 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '。';
      },
      choices: houseChoices((g) => (married(g) ? 1 : 0.7), (g) => (married(g) ? 0.7 : 0.45), '一套大一点的', '一套小的') }),
    dec({ id: 'y_parents29', age: 29, t: '爸妈', loc: 'home', cond: (g) => parentAlive(g) && !withParents(g) && !g.recall('parentsIn'),
      text: (g) => (g.alive('fa') ? CN.who(g, 'fa', true) + '体检查出了高血压。' : CN.who(g, 'mo', true) + '一个人在老家。') + '你看着视频里的' + (g.alive('fa') ? '他' : '她') + '，头发白了一大半。',
      choices: [
        { t: '多寄点钱，常打电话', canon: true, fx: (g) => { g.remember('parentsNear', 'far'); CN.pay(g, 12000); g.stat('人缘', 2); }, res: '你每个月给家里打 ¥1,000，又设了一个每周日晚上的闹钟，提醒自己打电话。' },
        { t: '把爸妈接到身边住', dev: 15,
          fx: (g) => { g.remember('parentsNear', 'with'); CN.liveWith(g, aliveParents(g)); if (!hasHouse(g)) CN.pay(g, (RENT_M[tierNow(g)] || 1500) * 6); g.stat('人缘', 5); g.stat('心情', -2); },
          res: (g) => (hasHouse(g) ? '' : '你换了一套大一点的房子，每个月多交 ' + CN.fmt((RENT_M[tierNow(g)] || 1500) / 2) + ' 房租。') + '家里多了' + (aliveParents(g).length > 1 ? '两个人' : '一个人') + '，饭桌上多了几盘菜，也多了一些争吵。' },
        { t: '辞了工作回去', dev: 25, cond: (g) => away(g),
          fx: (g) => { g.remember('parentsNear', 'back'); g.remember('backHome', 'parents'); goBack(g); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '回乡务农' : '在县城做点小生意'); g.stat('人缘', 6); g.stat('心情', 2); },
          res: (g) => '你回来那天，' + (g.alive('mo') ? '你妈' : '你爸') + '在村口等了一下午。挣得少了，你每天都能见到' + parentWord(g) + '。' },
      ] }),


    dec({ id: 'y_promo29', age: 29, t: '升职', loc: 'office', cond: (g) => working(g) && EMPLOYEE.includes(g.recall('job')),
      text: (g) => ({ civil: '科里空出一个副科的位置。', teacher: '学校要选一个年级组长。', doctor: '科里要定一个医疗组长。', nurse: '护士长要调走了。', worker: '车间主任要退休了。', rider: '站长问你要不要当个小组长。', driver: '车队要提一个调度。', soldier: '连里空出一个副职。', tech: '组长跳槽走了，位置空着。', sales: '大区经理的位子空出来了。' }[g.recall('job')] || '部门里空出一个小主管的位置。')
        + '你现在是' + jobTitle(g) + '，自己一个月约 ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + '。' + (hiEdu(g) ? '' : '一起竞争的人里，好几个学历比你高。'),
      choices: [
        { t: (g) => '争管理岗（升上去约 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + '/月，会多，背指标）', canon: true, cond: hiEdu, check: ['事业', 40], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: '没轮上你。你照常上班，只是话少了。' } },
        { t: (g) => '争管理岗（升上去约 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + '/月；学历吃亏，得拿业绩说话）', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 52], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: '位置给了一个研究生。你把业绩表又看了一遍，觉得自己不差。' } },
        { t: (g) => '走专业路线，考' + EXPERT[g.recall('job')] + '（考下来约 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 6)) + '/月，不用管人，要啃书）', dev: 10, cond: (g) => !!EXPERT[g.recall('job')], check: ['学识', 62],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, g.recall('job'), EXPERT[g.recall('job')]); g.remember('promoted', true); g.remember('ladder', 'expert'); g.stat('事业', 6); g.stat('学识', 3); },
          res: (g) => '报班、考试花了 ¥3,000。证书下来那天，你成了' + EXPERT[g.recall('job')] + '，' + payWord(g).replace(/^.*?大概/, '现在每月大概') + '。难办的活开始点名找你。',
          fail: { fx: (g) => { CN.pay(g, 3000); upFail(g); }, res: '考了两回，差一点。¥3,000 的报名费和书钱，你说就当交了学费。' } },
        { t: (g) => '去外地分部，升一级（约 ' + CN.fmt(CN.jobPay(g, g.recall('job'), tierNow(g) === 1 ? 2 : 1, 10)) + '/月，' + (married(g) ? '家里得跟着搬' : '人生地不熟') + '）', dev: 20, cond: (g) => ['office', 'tech', 'sales'].includes(g.recall('job')),
          fx: (g) => { const c = tierNow(g) === 1 ? CN.goCity(g, 2) : CN.goCity(g, 1, CN.pick(['上海', '深圳', '北京', '杭州', '广州'].filter((x) => x !== here(g)))); g.move('office', c + ' · 分部'); CN.setJob(g, g.recall('job'), '分部负责人'); g.remember('promoted', true); g.remember('ladder', 'move'); g.stat('事业', 10); g.stat('人缘', -2); },
          res: (g) => '你调去了' + here(g) + '，当上了分部负责人，' + payWord(g) + '。' + (married(g) ? g.recall('spouse') + '跟着辞了工作，在新城市重新找。' : '行李不多，一个箱子就装完了。') },
        { t: '让给别人，图个轻松', dev: 10, fx: (g) => { g.remember('promoted', false); g.remember('ladder', 'no'); g.stat('心情', 3); g.stat('健康', 2); }, res: (g) => '你准点下班，' + (kidN(g) && g.recall('custody') !== 'ex' ? '去幼儿园接孩子。' : '去公园走两圈。') },
      ] }),

    /* ================= 30 岁是人生关口，这里只写自动节点 ================= */
    { id: 'y_turn30', age: 30, t: '三十岁', auto: true,
      text: (g) => (married(g) ? (kidN(g) && g.alive('k1') && g.ageOf('k1') >= 2 ? g.name('k1') + '给你画了一张生日卡，你被画成了一个圆。' : '你和' + g.recall('spouse') + '吃了一顿火锅，算是过生日。')
        : withParents(g) ? (g.alive('mo') ? '三十岁生日，你妈给你煮了一碗长寿面，卧了两个蛋。' : '三十岁生日，你爸买了一个蛋糕，插错了蜡烛。')
        : '三十岁生日，你给自己煮了一碗长寿面。朋友们在群里发了一串红包，你一个个点开。') },

    /* ================= 31 岁 ================= */
    dec({ id: 'y_backwork31', age: 31, t: '回去上班', loc: 'home', cond: (g) => married(g) && g.recall('kidCare') === 'home' && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + '要上幼儿园了。' + (isMale(g) ? g.recall('spouse') + '在家带了几年孩子，' : '你在家带了几年孩子，') + '家里一年只进账 ' + CN.fmt(CN.income(g)) + '。',
      choices: [
        { t: '回去上班', canon: true,
          fx: (g) => { g.remember('kidCare', 'back'); if (isMale(g)) g.remember('spWork', ''); else { const p = g.recall('preKidJob') || ['office', '公司职员']; CN.setJob(g, p[0] === 'none' ? 'office' : p[0], p[1]); } },
          res: (g) => (isMale(g) ? g.recall('spouse') + '找了份工作，' : '你找回了工作，') + '两个人' + payWord(g).replace(/^.*?大概/, '每月加起来大概') + '。第一天上班前，' + g.name('k1') + '在门口挥了很久的手。' },
        { t: '再带几年', dev: 10, fx: (g) => { g.remember('kidCare', 'stay'); g.stat('心情', 2); }, res: '孩子小的时候就这几年。你们把账算得更细了，周末去公园，不去商场。' },
      ] }),
    dec({ id: 'y_kid31', age: 31, t: '孩子的事', loc: 'home', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') !== 'dink',
      text: (g) => (g.recall('kidPlan') === 'wait' ? '说好等两年，三年过去了。' : '结婚几年了，一直没有孩子。') + (isMale(g) ? '' : '医生说，年纪越大越不容易。'),
      choices: [
        { t: '要', canon: true, check: ['健康', 40], fx: (g) => { g.remember('kidPlan', 'now'); CN.haveKid(g); CN.pay(g, 20000); g.stat('心情', 4); }, res: (g) => '孩子出生了，叫' + g.name('k1') + '。住院加产检花了 ¥2 万。你在产房外面走了几百个来回。', fail: { fx: (g) => { g.remember('kidPlan', 'trying'); CN.pay(g, 10000); g.stat('心情', -6); }, res: '一直没怀上。你们去了几次医院，检查花了 ¥1 万。' } },
        { t: '算了，两个人过', dev: 20, fx: (g) => { g.remember('kidPlan', 'dink'); CN.pay(g, 12000); g.stat('心情', 2); g.stat('人缘', -3); }, res: '你们拿 ¥1.2 万报了一个旅行团，在雪山脚下拍了一张合影。' },
      ] }),
    dec({ id: 'y_crisis31', age: 31, t: '吵架', loc: 'home', cond: (g) => married(g) && g.since('love') >= 3,
      text: (g) => '你和' + g.recall('spouse') + '为了' + (kidN(g) ? '谁去开家长会' : g.recall('house') === 'mortgage' ? '房贷' : '一点小事') + '吵了一架，吵完各睡各的。',
      choices: [
        { t: '先低头，好好说', canon: true, fx: (g) => { g.remember('fight', 'talk'); g.stat('人缘', 4); g.stat('心情', 2); }, res: '第二天早上，你多煮了一个鸡蛋。' },
        { t: '冷着，谁也不理谁', dev: 10, fx: (g) => { g.remember('fight', 'cold'); g.stat('心情', -5); }, res: '冷了一个星期。后来也就过去了，只是有些话再没说过。' },
        { t: '这日子过不下去，离', dev: 25,
          fx: (g) => {
            g.remember('fight', 'split'); g.remember('love', 'divorced'); g.info('婚姻', '离异'); g.unrel(CN.sexOf(g) === '男' ? '妻子' : '丈夫');
            last.sold = ['mortgage', 'own'].includes(g.recall('house')); if (last.sold) CN.sellHouse(g);
            CN.withdraw(g); last.amt = r1000(Math.max(0, cash(g)) / 2); CN.pay(g, last.amt);
            if (kidN(g)) g.remember('custody', isMale(g) === (g.rnd() < 0.3) ? 'me' : 'ex');
            g.stat('心情', -8);
          },
          res: (g) => '民政局门口排着队。' + (last.sold ? '房子卖了，' : '') + '家里的钱一人一半，你给出去 ' + CN.fmt(last.amt) + '。' + (kidN(g) ? (g.recall('custody') === 'me' ? '孩子跟你。' : '孩子跟了对方。') : '') + '你们签完字，各走各的。' },
      ] }),

    /* ================= 32 岁 ================= */
    dec({ id: 'y_kid2', age: 32, t: '二胎', loc: 'home', cond: (g) => married(g) && kidN(g) === 1 && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + (g.ageOf('k1') >= 3 ? '上幼儿园了，' : '会说整句话了，') + '回来问你，别的小朋友都有弟弟妹妹，' + CN.he(g, 'k1') + '为什么没有。再养一个，一年要多花 ¥3 万上下。',
      choices: [
        { t: '一个就够了', canon: true, fx: (g) => { g.remember('kid2', 'no'); g.stat('心情', 1); }, res: '你们把全部的心思放在一个孩子身上。' },
        { t: '再要一个', dev: 15, fx: (g) => { g.remember('kid2', 'yes'); CN.haveKid(g); CN.pay(g, 20000); g.stat('健康', -3); g.stat('心情', 3); }, res: (g) => '老二出生了，叫' + g.name('k2') + '。家里从此没有安静的时候。' + g.name('k1') + '趴在床边看了很久，说要把玩具分给' + CN.he(g, 'k2') + '一半。' },
      ] }),
    dec({ id: 'y_marry32', age: 32, t: '在一起', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: '你们在一起有几年了。两个人都不年轻了，有天晚上散步，对方问你，要不要就这样过一辈子。',
      choices: [
        { t: '结婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: '处了好几年' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '结婚了。' + wedRes(g, last) },
        { t: '就这样谈着，不领证', dev: 20, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 2); }, res: '你们各自留着各自的房子，周末在一起吃饭。' },
      ] }),
    dec({ id: 'y_single32', age: 32, t: '三十二岁', loc: 'home', cond: (g) => single(g),
      text: (g) => (loveIs(g, 'divorced') ? '离婚一年了。' : '')
        + (CN.alone(g) ? '你一个人住。周末去菜市场，摊主已经认识你了，会给你多抓一把葱。'
          : withParents(g) ? '你还和' + parentWord(g) + '住在一起。晚饭桌上，' + parentWord(g) + '又提起了谁家的孩子结婚了。'
          : '你' + CN.hhText(g) + '。周末去菜市场，摊主已经认识你了。'),
      choices: [
        { t: '有人介绍，就见见', canon: true, check: ['人缘', 45], fx: (g) => { CN.marry(g, { origin: '朋友介绍' }); g.remember('lateMarry', 'match'); CN.pay(g, 30000); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '处了半年就结了婚，请两家人吃了几桌，花了 ¥3 万。两个人都不年轻了，没那么多讲究。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '没成。你也没太难过，回家给自己炒了两个菜。' } },
        { t: '就这样过，挺自在', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 3000); g.stat('心情', 4); }, res: '你花 ¥3,000 给自己买了一套好点的锅。' },
      ] }),
    dec({ id: 'y_biz32', age: 32, t: '自己干', loc: 'metro',
      cond: (g) => working(g) && !['boss', 'shop', 'creator', 'farmer'].includes(g.recall('job')) && g.recall('startup') !== 'ok' && !g.recall('abroadStay') && (cash(g) >= 20000 || !!g.recall('skill') || !!g.recall('side')),
      text: (g) => bizText(g) + '你现在是' + jobTitle(g) + '，' + payWord(g) + '，卡里有 ' + CN.fmt(cash(g)) + '。',
      choices: [
        { t: '晚上摆个小吃摊（本钱 ¥2 万，白天照常上班，挣多少看手艺和地段）', dev: 15, check: ['人缘', 45],
          fx: (g) => { last.lend = fund(g, 20000); g.remember('biz', 'stall'); g.remember('side', 'stall'); g.stat('健康', -2); },
          res: (g) => '推车、炉子、第一批货，一共 ¥2 万' + (last.lend ? '，其中 ' + CN.fmt(last.lend) + ' 是借的' : '') + '。你卖' + pk(g, ['烤冷面', '炸串', '手抓饼', '凉皮', '煎饼'], 4) + '，第一个月刨去成本挣了 ¥3,000 多。',
          fail: { fx: (g) => { last.lend = fund(g, 20000); CN.earn(g, 6000); g.remember('biz', 'stallFail'); g.stat('心情', -4); }, res: '摆了半年，赶上一个多雨的夏天，摊位又挪了两回。你把推车 ¥6,000 转给了别人，算下来亏了一万多。' } },
        { t: '开网店，做直播带货（本钱 ¥3 万，十家里能活下来两三家）', dev: 20, check: ['人缘', 55],
          fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'online'); g.stat('健康', -2); },
          res: (g) => '样品、补光灯、投流，先花了 ¥3 万' + (last.lend ? '，' + CN.fmt(last.lend) + ' 是借的' : '') + '。你卖' + pk(g, ['老家的土特产', '自己挑的童装', '小家电', '手工饰品'], 5) + '，下了班就开播，第三个月开始有回头客。',
          fail: { fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'onlineFail'); g.stat('心情', -4); }, res: '直播间常常只有十几个人。三个月后你停了播，¥3 万变成了阳台上的几箱货，送了一年亲戚朋友。' } },
        { t: (g) => '加盟一家连锁' + frKind(g) + '（加盟费、装修、押金一共 ' + CN.fmt(frCost(g)) + (cash(g) - 10000 < frCost(g) ? '，要借 ' + CN.fmt(r1000(frCost(g) - Math.max(0, cash(g) - 10000))) : '') + '，顺利的话两三年回本）', dev: 25,
          cond: (g) => cash(g) >= frCost(g) * 0.4, check: ['事业', 45],
          fx: (g) => { const k = frKind(g); last.lend = fund(g, frCost(g)); g.remember('bizKind', k); g.remember('biz', 'franchise'); CN.setJob(g, 'boss', k + '加盟店老板'); g.stat('心情', 3); },
          res: (g) => '你辞了工作，开了一家' + g.recall('bizKind') + '。' + (last.lend ? '借来的 ' + CN.fmt(last.lend) + ' 写了借条。' : '') + '头一年刨去房租和人工，你自己拿到手的，比上班时略多一点。',
          fail: { fx: (g) => { const k = frKind(g); const c = frCost(g); last.lend = fund(g, c); last.amt = r1000(c * 0.3); CN.earn(g, last.amt); g.remember('bizKind', k); g.remember('biz', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => '店开了十个月，门口的人流比总部说的少一半。你把店转了出去，只收回 ' + CN.fmt(last.amt) + '。' + (debtW(g) ? '还欠着 ' + CN.fmt(debtW(g) * 1e4) + '，' : '') + '你回去接着上班。' } },
        { t: '想想就算了，上班稳当', canon: true, fx: (g) => { g.remember('biz', 'no'); g.stat('心情', 1); }, res: '你在夜市买了一份烤冷面，边走边吃。挺好吃，你没再多想。' },
      ] }),

    /* ================= 33 岁 ================= */
    dec({ id: 'y_ivf33', age: 33, t: '医院', loc: 'hospital', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') === 'trying',
      text: '跑了两年医院。医生说，可以试试试管，一个周期大概 ¥4 万，不一定一次成。',
      choices: [
        { t: '做试管，再试一次', canon: true, check: ['健康', 45],
          fx: (g) => { CN.pay(g, 60000); CN.haveKid(g); g.remember('kidPlan', 'now'); g.stat('心情', 6); },
          res: (g) => '做了两个周期，花了 ¥6 万。孩子终于来了，叫' + g.name('k1') + '。你在医院走廊里哭了一场。',
          fail: { fx: (g) => { CN.pay(g, 40000); g.remember('kidPlan', 'dink'); g.stat('心情', -5); }, res: '花了 ¥4 万，没成。回家的路上，你们手拉着手，谁也没说话。后来你们说好了，两个人也是一家人。' } },
        { t: '不再去医院了，顺其自然', dev: 15, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); }, res: '你们把医院的单子收进了抽屉，周末去爬了一次山。' },
      ] }),
    dec({ id: 'y_debt33', age: 33, t: '还账', loc: 'home', cond: (g) => debtW(g) >= 40,
      text: (g) => '每个月一号，工资进卡，房贷出卡，中间只停留几分钟。你还欠着 ' + CN.fmt(debtW(g) * 1e4) + '。' + (g.recall('startup') === 'fail' ? '创业欠的钱还没还完。' : ''),
      choices: [
        { t: '咬牙还，什么都省', canon: true, fx: (g) => { g.remember('frugal', true); if (cash(g) >= 70000) { CN.pay(g, 50000); g.remember('debt', Math.max(0, debtW(g) - 5)); } g.stat('心情', -3); }, res: (g) => (cash(g) >= 20000 ? '你提前还了 ¥5 万。' : '') + '你不再点外卖，开始自己带饭。饭盒是你妈给的，用了很多年。' },
        { t: '晚上跑网约车多挣点', dev: 10, cond: (g) => g.recall('side') !== 'drive', fx: (g) => { g.remember('nightJob', true); g.remember('side', 'drive'); g.stat('健康', -5); }, res: '一个月多挣 ¥2,000 来块。你认识了城里凌晨两点的每一条路。' },
        { t: '卖了房，无债一身轻', dev: 20, cond: (g) => g.recall('house') === 'mortgage', fx: (g) => { CN.sellHouse(g); g.remember('soldHouse', true); g.stat('心情', 6); }, res: (g) => '房子卖了，还清贷款，手里剩下 ' + CN.fmt(cash(g)) + '。签完字那天，你睡了一个好觉。' },
      ] }),
    dec({ id: 'y_car33', age: 33, t: '买车', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000, text: carText, choices: carChoices() }),
    dec({ id: 'y_money33', age: 33, t: '闲钱', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 30000,
      text: (g) => '你卡里有 ' + CN.fmt(cash(g)) + '，一直放着没动。银行的客户经理打来第三个电话，说有几款产品适合你。',
      choices: moneyChoices() }),
    dec({ id: 'y_friend33', age: 33, t: '老朋友', loc: 'home', cond: (g) => true,
      text: (g) => (['uni', 'college', 'grad', 'phd'].includes(g.recall('lifePath')) || g.recall('uni') ? '大学' : '早年打工') + '时最好的朋友要结婚了，在离' + here(g) + '很远的地方。那天你也要加班。',
      choices: [
        { t: '请假去', canon: true, fx: (g) => { g.remember('oldFriend', 'went'); CN.pay(g, 4000); g.stat('人缘', 5); g.stat('事业', -1); }, res: '路费加份子钱 ¥4,000。婚礼上你哭了，比新人哭得还厉害。' },
        { t: '转个红包', dev: 10, fx: (g) => { g.remember('oldFriend', 'red'); CN.pay(g, 1000); g.stat('人缘', -2); }, res: '你转了 ¥1,000。对方回了一个“谢谢”。后来你们很少联系了。' },
      ] }),

    /* ================= 34 岁：三十五岁之前 ================= */
    dec({ id: 'y_last34', age: 34, t: '三十五岁之前', loc: 'office', cond: (g) => working(g) && !['civil', 'teacher', 'doctor', 'soldier', 'farmer', 'retired', 'none'].includes(g.recall('job')),
      text: (g) => '明年就三十五了。招聘启事上写着“三十五岁以下”。' + (g.recall('aiMove') === 'switch' ? '你转行做的这一行，年轻人越来越多。' : g.recall('promoted') ? '你带着一个小团队，也带着一份不安。' : '你在现在的位置上已经好几年了。'),
      choices: [
        { t: (g) => '考个编，求个稳（' + CN.jobLine(g, 'civil') + '）', dev: 10, check: ['学识', 80], fx: (g) => { g.remember('last34', 'civil'); CN.setJob(g, 'civil', '事业单位职员'); g.stat('心情', 4); }, res: (g) => '你考上了最后一年还能报的岗位。' + payWord(g) + '，比原来少，心里踏实。', fail: { fx: (g) => { g.remember('last34', 'stay'); g.stat('心情', -3); }, res: '差了两分。你回到工位上，把准考证收进了抽屉。' } },
        { t: '守住现在的位置', canon: true, fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 3); g.stat('健康', -2); }, res: '你比以前更早到公司，更晚走。' },
        { t: (g) => '自己出来单干（' + CN.jobLine(g, g.recall('skill') ? 'shop' : 'boss') + '）', dev: 20, fx: (g) => { g.remember('last34', 'own'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.6, 100000)); CN.pay(g, last.amt); CN.setJob(g, g.recall('skill') ? 'shop' : 'boss', g.recall('skill') ? '开店' : '个体老板'); g.stat('心情', 4); }, res: (g) => '你拿出 ' + CN.fmt(last.amt) + '，注册了一家小公司，法人代表写的是你的名字。' },
      ] }),
    dec({ id: 'y_last34b', age: 34, t: '回头看', loc: 'home', cond: (g) => true,
      text: '你翻到一张十八岁时的照片。那时候你以为三十四岁是很老的年纪。',
      choices: [
        { t: '日子是自己选的，接着过', canon: true, fx: (g) => { g.remember('look34', 'ok'); g.stat('心情', 3); }, res: '你把照片夹回了相册。' },
        { t: '想再学点东西', dev: 10, fx: (g) => { g.remember('look34', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); }, res: '你花 ¥5,000 报了一个周末的课。教室里大多是比你小的人。' },
      ] }),

    /* ================= 自动节点：让日子有血有肉 ================= */
    { id: 'y_firstpay', age: 22, t: '第一份工资', auto: true, cond: (g) => working(g) && g.since('job') === 0 && !g.recall('workStyle') && !g.recall('army') && !['farmer', 'soldier', 'none'].includes(g.recall('job') || 'none'),
      text: (g) => '第一个月的工资到账，' + CN.fmt(perMonth(g)) + '。你给' + (g.alive('mo') ? '妈' : '家里') + '转了一笔钱。' + (g.recall('uniSide') === 'money' ? '你早就习惯了自己挣钱。' : '对方回了一句“自己留着花”，又回了一句“谢谢宝贝”。') },
    { id: 'y_army_life', age: 19, t: '新兵连', auto: true, cond: (g) => g.recall('lifePath') === 'army',
      text: '新兵连三个月，你学会了三分钟叠好被子，学会了在雪地里站一个小时不动。' },
    { id: 'y_newyear24', age: 24, t: '过年', auto: true, cond: (g) => away(g) && !g.recall('abroadStay'),
      text: (g) => '春运抢票，你守着手机抢了一晚上。回到' + home(g) + '，' + (married(g) ? (kidN(g) ? '亲戚们抢着抱孩子。' : '亲戚们问你什么时候要孩子。') : loveIs(g, 'dating') ? '亲戚们问你什么时候结婚。' : '亲戚们问你有没有对象。') + (g.alive('mo') ? '你妈往你箱子里塞了两袋腊肠。' : '') },
    { id: 'y_wedding_day', age: 26, t: '婚礼', auto: true, cond: (g) => married(g) && g.since('love') === 0,
      text: (g) => (g.recall('caili') === 'paid' ? (g.alive('fa') ? '婚礼上，你爸喝多了，拉着亲家的手一直说“孩子交给你们了”。' : '婚礼上，你妈红着眼圈，给每一桌都敬了酒。') : g.recall('caili') === 'travel' ? '你们在海边拍了一张合影，就算是婚纱照。' : '婚礼很简单。你记得那天的风很大。') },
    { id: 'y_abroad_back', age: 28, t: '回国', auto: true, cond: (g) => !!g.recall('abroadStay'),
      fx: (g) => { g.remember('abroadStay', false); CN.goCity(g, 1); CN.setJob(g, 'office', '外企中层'); g.stat('人缘', 3); },
      text: (g) => '在国外待了几年，你还是回来了。落地' + g.recall('workCity') + '，空气里有一股熟悉的味道。新工作' + payWord(g) + '。' },
    { id: 'y_baby_night', age: 29, t: '夜里', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') <= 2 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + '夜里哭醒三次。你抱着' + CN.he(g, 'k1') + '在客厅里走，走到天亮。' + CN.he(g, 'k1') + '睡着的时候，攥着你的一根手指。' },
    { id: 'y_kid_school', age: 33, t: '上幼儿园', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') === 3 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + '第一天上幼儿园，哭着不撒手。你在门口站了一上午。放学的时候，' + CN.he(g, 'k1') + '举着一朵小红花跑出来。' },
    { id: 'y_grandparent', age: 25, t: '老人', auto: true, cond: (g) => !g.alive('gm') && !g.alive('gp'),
      text: (g) => (g.recall('leftBehind') ? '你小时候是爷爷奶奶带大的。他们都走了以后，老家的房子空着，院子里长满了草。' : '爷爷奶奶都不在了。过年回去，少了两个人催你吃饭。') },
    { id: 'y_rider_rain', age: 21, t: '暴雨', auto: true, cond: (g) => g.recall('job') === 'rider',
      fx: (g) => { if (g.rnd() < 0.08) { g.stat('健康', -20); g.remember('riderHurt', true); CN.pay(g, 5000); } },
      text: (g) => (g.recall('riderHurt') ? '暴雨天你摔了车，小腿缝了十几针，医药费 ¥5,000。站长说这单不算超时，还给你送了一箱牛奶。' : '暴雨天，单子翻了一倍。你在雨里跑了一天，挣了 ¥600，到家时鞋里能倒出水。') },
    { id: 'y_save_worker', age: 23, t: '脚手架', auto: true, cond: (g) => g.recall('job') === 'worker' && g.recall('stayCity'),
      fx: (g) => { if (g.rnd() < 0.15) g.set('ySavedWorker'); },
      text: (g) => (g.f('ySavedWorker') ? '工地上有人从脚手架上滑下来，你离得最近，一把拽住了他的衣领。他家里后来寄来一面锦旗。' : '这一年你换了三个工地。每个工地的饭都差不多，¥15 一份，两荤一素。') },
    { id: 'y_shop_good', age: 28, t: '小店', auto: true, cond: (g) => g.recall('job') === 'shop',
      fx: (g) => { if (g.s('人缘') >= 55 && g.rnd() < 0.5) { g.set('yHometownShop'); CN.earn(g, 60000); } },
      text: (g) => (g.f('yHometownShop') ? '你的店成了街上排队最长的一家，这一年多挣了 ¥6 万。镇上的人说起你，就说那家店。' : '小店的生意不温不火，一个月挣个 ¥5,000 上下。你认识了街上所有的人。') },
    { id: 'y_civil_life', age: 26, t: '单位', auto: true, cond: (g) => g.recall('job') === 'civil',
      text: (g) => (g.recall('army') === 'out' ? '单位里的人知道你当过兵，搬东西总叫你。' : '你写的材料，领导改了三遍，改回了第一版。') + '食堂午饭 ¥6，有鱼。' },
    { id: 'y_teacher_life', age: 27, t: '讲台', auto: true, cond: (g) => g.recall('job') === 'teacher',
      text: '你班上有个孩子，作文写的是你。你在办公室里看了两遍。' },
    { id: 'y_doctor_life', age: 27, t: '值班', auto: true, cond: (g) => ['doctor', 'nurse'].includes(g.recall('job')),
      text: '夜班来了一个出车祸的年轻人。你们抢救了四个小时，他活了下来。你在楼梯间吃了一个冷掉的包子。' },
    { id: 'y_creator_life', age: 25, t: '直播间', auto: true, cond: (g) => g.recall('job') === 'creator',
      fx: (g) => { if (g.rnd() < 0.3) { CN.earn(g, 80000); g.stat('事业', 6); g.remember('viral', true); } },
      text: (g) => (g.recall('viral') ? '你有一条视频火了，一夜之间涨了十万粉丝，接广告挣了 ¥8 万。你妈在村里走路都带风。' : '你每天播四个小时。镜头关掉以后，屋里特别安静。') },
    { id: 'y_jumped_after', age: 28, t: '新公司', auto: true, cond: (g) => g.recall('jumped') === true,
      text: '新公司的人比你想的还要拼。你开始想念以前那个组了，好在工资涨了，你给自己换了一把好椅子。' },
    { id: 'y_rent_whole', age: 25, t: '自己的屋子', auto: true, cond: (g) => g.recall('rentType') === 'whole' && CN.alone(g),
      text: '你在一居室里养了一只猫。下雨的晚上，猫趴在你腿上，你觉得这座城市是你的。' },
    { id: 'y_rent_far', age: 25, t: '通勤', auto: true, cond: (g) => g.recall('rentType') === 'far',
      text: '每天来回四个小时。你在地铁上学会了站着睡觉。' },
    { id: 'y_dink_life', age: 33, t: '两个人', auto: true, cond: (g) => g.recall('kidPlan') === 'dink' && married(g),
      text: (g) => '你和' + g.recall('spouse') + '去了很多地方。照片里永远是两个人，笑得都挺好看。' },
    { id: 'y_divorce_after', age: 33, t: '离婚以后', auto: true, cond: (g) => g.recall('fight') === 'split' && !married(g),
      text: (g) => (kidN(g) ? (g.recall('custody') === 'me' ? '孩子跟着你。每天早上你扎辫子、做早饭，送完孩子再去上班。累，也踏实。' : '孩子跟着对方。每个周末，你去接' + CN.he(g, 'k1') + '出来吃一顿饭。') : '离婚以后，东西少了一半，地方大了一半。你重新学着给自己做饭。') },
    { id: 'y_cold_after', age: 33, t: '饭桌', auto: true, cond: (g) => g.recall('fight') === 'cold' && married(g),
      text: (g) => '你和' + g.recall('spouse') + '在饭桌上说的话，大多是关于' + (kidN(g) ? '孩子' : '房子') + '和账单的。有一天对方给你夹了一筷子菜，你愣了一下。' },
    { id: 'y_parents_with', age: 32, t: '一家人', auto: true, cond: (g) => g.recall('parentsNear') === 'with' && withParents(g),
      text: (g) => (CN.livesWith(g, 'mo') ? '你妈每天早上五点起来给全家做早饭。' + (kidN(g) && g.alive('k1') ? g.name('k1') + '是奶奶带大的，最爱吃' + (isMale(g) ? '奶奶' : '外婆') + '包的饺子。' : '你说不用这么早，她不听。') : '你爸每天早上去公园遛弯，回来顺手把菜买好了。') },
    { id: 'y_kidcare_after', age: 34, t: '带孩子', auto: true, cond: (g) => !!g.recall('kidCare') && kidN(g) && g.alive('k1') && g.recall('custody') !== 'ex',
      text: (g) => ({ grand: (g.alive('mo') || g.alive('fa') ? '孩子是老人帮着带大的。' + g.name('k1') + '学会的第一首儿歌，是方言唱的。' : '帮着带孩子的老人不在了。' + g.name('k1') + '有时候还会提起。'), paid: '托育的老师换了两个，' + g.name('k1') + '都记得她们的名字。', home: '在家带孩子的这几年，账很紧。' + g.name('k1') + '记得每一个下午的公园。', stay: '在家带孩子的这几年，账很紧。' + g.name('k1') + '记得每一个下午的公园。', back: '两个人都上班以后，接送排成了一张表，贴在冰箱上。' }[g.recall('kidCare')]) },
    { id: 'y_back_life', age: 31, t: '老家的日子', auto: true, cond: (g) => ['late', 'parents', 'early'].includes(g.recall('backHome')) && !away(g),
      text: (g) => '回到' + (g.recall('backHome') === 'late' ? g.recall('city') : home(g)) + '以后，你胖了十斤。' + (parentAlive(g) ? '晚饭后跟着' + parentWord(g) + '去广场上走两圈。' : '晚饭后你一个人去河边走两圈，碰见的都是熟人。') },
    { id: 'y_night_driver', age: 34, t: '凌晨', auto: true, cond: (g) => !!g.recall('nightJob'),
      text: '凌晨跑车，你拉过加班的程序员、哭着的姑娘、喝多的老板。每个人下车时都说一声谢谢。' },
    { id: 'y_soldhouse', age: 34, t: '没有房子', auto: true, cond: (g) => !!g.recall('soldHouse'),
      text: '卖了房以后，你又租房住。月初不用盯着房贷，日子松了一口气。' },
    { id: 'y_friend_after', age: 34, t: '朋友', auto: true, cond: (g) => !!g.recall('oldFriend'),
      text: (g) => (g.recall('oldFriend') === 'went' ? '那个朋友的孩子出生了，认你做了干' + (isMale(g) ? '爹' : '妈') + '。' : '你在朋友圈看到老朋友的孩子满月。你点了个赞，想了想，又发了一句恭喜。') },
    { id: 'y_look34', age: 34, t: '周末', auto: true, cond: (g) => g.recall('look34') === 'learn' && !g.recall('last34'),
      text: '周末的课上完了。你发现自己还能学进去东西，这让你高兴了好几天。' },
    { id: 'y_single_after', age: 34, t: '自己的日子', auto: true, cond: (g) => single(g) && ['self', 'refuse'].includes(g.recall('singleWay')),
      text: '你把自己的日子过得井井有条。周末约朋友爬山，晚上看一部老电影。偶尔夜里醒来，会想一想以后老了谁陪你。' },
    // 第一份工作的风险兑现：大厂会裁员，自媒体会断流
    { id: 'y_offer_echo', age: 28, t: '当年的选择', auto: true,
      cond: (g) => working(g) && ((g.recall('offer22') === 'big' && ['tech', 'office'].includes(g.recall('job')) && tierNow(g) === 1) || (g.recall('offer22') === 'media' && g.recall('job') === 'creator')),
      fx: (g) => {
        const media = g.recall('offer22') === 'media';
        last.cut = g.rnd() < (media ? 0.45 : 0.3);
        const m = CN.jobPay(g, g.recall('job'));
        if (!last.cut) { last.amt = r1000(m * (media ? 5 : 3)); CN.earn(g, last.amt); g.stat('事业', 4); }
        else if (media) { CN.setJob(g, 'freelance', '接零活的剪辑师'); g.stat('心情', -5); }
        else { last.amt = r1000(m * 7); CN.earn(g, last.amt); CN.setJob(g, 'office', '小公司职员'); g.stat('事业', -4); g.stat('心情', -5); }
      },
      text: (g) => {
        const media = g.recall('offer22') === 'media';
        if (media) return last.cut ? '平台改了推荐规则，你的播放量一夜之间掉到原来的一成。撑了半年，你开始给别人剪视频，按条收钱。'
          : '你的账号熬过了好几次平台改版。今年接广告挣了 ' + CN.fmt(last.amt) + '，评论区有人叫你老师。';
        return last.cut ? '第三轮裁员，名单上有你。赔偿 N+1，一共 ' + CN.fmt(last.amt) + '。你抱着纸箱下楼，保安冲你点了点头。一个月后你去了一家小公司，钱少了，晚上七点能下班。'
          : '大厂这几年裁过两轮，你都留下了。年终奖 ' + CN.fmt(last.amt) + '，你在工位上愣了一会儿。你已经记不清上一次周末不开电脑是什么时候。';
      } },
    { id: 'y_biz_echo', age: 34, t: '那个摊子', auto: true, cond: (g) => ['stall', 'online', 'franchise'].includes(g.recall('biz')),
      fx: (g) => {
        const b = g.recall('biz');
        last.ok = g.rnd() < { stall: 0.55, online: 0.5, franchise: 0.65 }[b];
        last.who = helper(g);
        if (b === 'stall') {
          g.remember('side', '');
          if (last.ok) { CN.setJob(g, 'shop', '小吃店老板'); g.stat('事业', 6); g.stat('心情', 4); } else g.stat('健康', -2);
        } else if (b === 'online') {
          if (last.ok) { CN.setJob(g, 'boss', '网店老板'); g.stat('事业', 8); } else g.stat('心情', -3);
        } else if (last.ok) { last.amt = r1000(frCost(g) * 0.5); CN.earn(g, last.amt); g.stat('事业', 8); }
        else { last.amt = r1000(frCost(g) * 0.2); CN.earn(g, last.amt); CN.setJob(g, tierNow(g) >= 4 ? 'worker' : 'office', tierNow(g) >= 4 ? '工厂工人' : '公司职员'); g.stat('心情', -6); }
      },
      text: (g) => {
        const b = g.recall('biz');
        const hire = last.who ? '你把' + CN.who(g, last.who).replace(/^你的/, '') + '叫来帮忙，按月给' + (last.who === 'mo' || last.who === 'fa' ? '零花钱' : '工资') + '。' : '你雇了一个小工。';
        if (b === 'stall') return last.ok ? '摊子做出了名气，常有人排队。你辞了工作，盘下一个门面，开了家小吃店。' + hire + '现在' + payWord(g) + '。'
          : '摆了三年摊，腰受不了了。你把推车卖了，专心上班。那几年攒下的熟客，现在还会在路上跟你打招呼。';
        if (b === 'online') return last.ok ? '网店做起来了，仓库从阳台搬到了一间小厂房。你辞了工作，' + hire + '好的月份一个月能挣三四万，差的月份只够发工资。'
          : '平台改了规则，流量掉了一大半。你把网店关了，剩下的货在朋友圈清了。上班的钱少，可每个月都有。';
        return last.ok ? '这家' + g.recall('bizKind') + '回了本，这两年净挣了 ' + CN.fmt(last.amt) + '。你在隔壁街开了第二家，' + hire
          : '总部换了老板，加盟店一家家关门。你的' + g.recall('bizKind') + '撑到最后，转让只收回 ' + CN.fmt(last.amt) + '。' + (debtW(g) ? '欠的钱还剩 ' + CN.fmt(debtW(g) * 1e4) + '。' : '') + '你又找了份工作，' + payWord(g) + '。';
      } },
    { id: 'y_ladder_echo', age: 33, t: '这条路', auto: true, cond: (g) => ['expert', 'move', 'stuck'].includes(g.recall('ladder')) && working(g),
      fx: (g) => { const l = g.recall('ladder'); if (l === 'expert') { last.amt = r1000(CN.jobPay(g, g.recall('job')) * 2); CN.earn(g, last.amt); } if (l === 'move') g.stat('心情', married(g) ? -2 : 1); if (l === 'stuck') g.stat('事业', 2); },
      text: (g) => ({
        expert: '同行开会，有人点名请你去讲。讲一次给 ' + CN.fmt(last.amt) + ' 的课酬，你讲得磕磕巴巴，台下记得很认真。',
        move: '在' + here(g) + '的第二年，分部从五个人变成了二十个人。' + (married(g) ? '周末一家人去逛新城市，' + g.recall('spouse') + '说，这里的菜还是吃不惯。' : '你认得了楼下每一家早点铺。'),
        stuck: '那次没升上去以后，你把力气花在了手艺上。新来的人有不会的，都先来问你。',
      }[g.recall('ladder')]) },
    { id: 'y_broke_after', age: 28, t: '分手以后', auto: true, cond: (g) => g.recall('singleWay') === 'broke' && single(g),
      text: '分手以后，你很长一段时间没再谈。工作倒是做得更好了。' },
    { id: 'y_startup_after', age: 31, t: '公司', auto: true, cond: (g) => ['ok', 'fail'].includes(g.recall('startup')),
      text: (g) => (g.recall('startup') === 'ok' ? '公司有了五十个人。你开始学着记住每个人的名字。' : '你又回去打工了。面试官看到你的简历，问你创业失败学到了什么。你说，学会了算账。') },
    { id: 'y_promo_after', age: 33, t: '团队', auto: true, cond: (g) => g.recall('promoted') === true && g.recall('ladder') === 'mgr',
      text: '你带的人里，有一个跟你刚毕业时很像。你把自己的经验一条条告诉了他。' },
    { id: 'y_metparents_after', age: 26, t: '亲家', auto: true, cond: (g) => g.recall('metParents') === true && loveIs(g, 'dating'),
      text: '两家家长通了一次电话，聊了一个小时。你在旁边听着，有点尴尬，也有点高兴。' },
    { id: 'y_burnout_after', age: 31, t: '体检', auto: true, cond: (g) => !!g.recall('burnout'),
      fx: (g) => { if (g.recall('burnout') === 'push') g.stat('健康', -4); },
      text: (g) => (g.recall('burnout') === 'push' ? '今年的体检，箭头比去年多了两个。' : '坚持健身几年，你比二十五岁时还精神。') },
    { id: 'y_ai_after', age: 27, t: '机器', auto: true, cond: (g) => !!g.recall('aiMove'),
      text: (g) => ({ learn: '公司里会用 AI 的人越来越吃香。你庆幸当年熬了那几个月。', switch: '你训练过的模型上线了。你在新闻里认出了自己写的那些句子。', care: '你照顾的老人里，有一个总把你当成她的孙子，每次都塞给你一颗糖。', laid: '这几年你换了很多份零工，学会了不把鸡蛋放在一个篮子里。' }[g.recall('aiMove')]) },
    { id: 'y_steady_after', age: 28, t: '单位里', auto: true, cond: (g) => !!g.recall('steady'),
      text: (g) => ({ stay: '日子过得平平稳稳，你学会了泡茶。', up: '你成了单位里最年轻的骨干。', stuck: '你不再争了。下班后去学了游泳。', move: '新城市的生活慢慢有了样子。你有了常去的面馆，老板记得你不要葱。', small: '小城的日子慢。你下班后去菜市场，买一把青菜才 ¥3。' }[g.recall('steady')]) },
    { id: 'y_workstyle_after', age: 25, t: '攒下的', auto: true, cond: (g) => !!g.recall('workStyle') && !white(g) && !!g.recall('money0'),
      text: (g) => {
        const s = cash(g) + (Number(g.recall('invest')) || 0);
        return ({ save: '这几年你省吃俭用，', fun: '这几年钱没攒下多少，朋友倒是交了一堆。', study: '夜校考的证派上了用场，你调去了技术岗。' }[g.recall('workStyle')]) + '算下来手里有 ' + CN.fmt(s) + (s >= CN.price(g, 4) * 0.3e4 ? '，够在老家县城付个首付了。' : '，离老家县城一套房的首付还差一截。');
      } },
    { id: 'y_skill_after', age: 26, t: '手艺', auto: true, cond: (g) => !!g.recall('skill'),
      text: (g) => ({ cook: '你炒的回锅肉，老板说可以上招牌了。', auto: '什么车送来，你听声音就知道哪里不对。', hair: '有几个老顾客只找你剪。', elec: '你一个人能把一栋楼的线路查完。' }[g.recall('skill')]) + '手艺好，工资也跟着涨了一截。' },
    { id: 'y_army_stay', age: 26, t: '部队', auto: true, cond: (g) => g.recall('army') === 'stay',
      fx: (g) => { if (!g.recall('armyOut')) { g.remember('armyOut', true); g.remember('lifePath', 'work'); CN.earn(g, 150000); CN.setJob(g, 'civil', '转业到地方单位'); CN.goCity(g, 3); } },
      text: '在部队待了八年，你转业了，领了 ¥15 万转业费。分到地方的一个单位，脱下军装那天，你把它叠得整整齐齐。' },
    { id: 'y_gaokao_memory', age: 32, t: '高考', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => '又到高考。新闻里说今年考生是近几十年最少的。你想起自己那年' + ({ top: '考了全县第一', good: '考得不错', normal: '刚过本科线', college: '只够大专', fail: '没考上' }[g.recall('gk')]) + '。' },
    { id: 'y_side_after', age: 23, t: '学校里学的', auto: true, cond: (g) => g.recall('uniSide') === 'money' && working(g),
      text: '大学时打工攒下的钱，你拿来交了第一个月的房租和押金。' },
    { id: 'y_campus_after', age: 24, t: '同学', auto: true, cond: (g) => g.recall('campus') === 'club',
      text: '大学社团里认识的人，现在散在各个城市。你出差到哪儿，都有人请你吃饭。' },
    { id: 'y_grad_after', age: 27, t: '研究生的朋友', auto: true, cond: (g) => g.recall('gradWay') === 'lab',
      text: '实验室的师兄去了一家大公司，问你要不要过去。你说再看看。' },
    { id: 'y_rentforever', age: 32, t: '租房的人', auto: true, cond: (g) => !!g.recall('rentForever') && g.recall('house') === 'rent' && !withParents(g),
      text: '房东换了三个，你的绿萝还活着。' },
    { id: 'y_late_marry', age: 33, t: '晚婚', auto: true, cond: (g) => g.recall('lateMarry') === 'match' && married(g),
      text: (g) => '结婚以后，你和' + g.recall('spouse') + '有一种默契：谁先到家谁做饭。' },
    { id: 'y_kid2_life', age: 34, t: '两个孩子', auto: true, cond: (g) => g.recall('kid2') === 'yes' && g.alive('k2'),
      text: (g) => g.name('k1') + '和' + g.name('k2') + '为一个玩具吵了一下午。你在厨房里，听着听着笑了。' },
    { id: 'y_debt_paid', age: 34, t: '账', auto: true, cond: (g) => debtW(g) === 0 && !!g.recall('soldHouse'),
      text: '你算了一下，现在一分钱都不欠别人。这是你成年以后第一次。' },
    { id: 'y_frugal_after', age: 34, t: '省下的', auto: true, cond: (g) => !!g.recall('frugal'),
      text: (g) => '省了一年，你还欠着 ' + CN.fmt(debtW(g) * 1e4) + '。' + (debtW(g) < 40 ? '数字一天天往下走，你开始敢想想以后了。' : '路还长。你把每月还款的日子标在日历上，一格一格划掉。') },
    { id: 'y_credit_after', age: 24, t: '账单', auto: true, cond: (g) => !!g.recall('credit'),
      fx: (g) => { if (g.recall('credit') === 'loan' && debtW(g) >= 3) { CN.pay(g, 32000); g.remember('debt', Math.max(0, debtW(g) - 3)); } },
      text: (g) => ({ loan: '分期叠着分期，利息滚到了 ¥3.2 万。你咬牙用了半年工资才还清，把那几个软件都卸了。', phone: '手机的分期还完了。屏幕上贴着一张膜，一道划痕都没有。', none: '你的卡里一直留着三个月的工资。同事急用钱，第一个想到的是你。' }[g.recall('credit')]) },
    { id: 'y_money26', age: 26, t: '那笔钱', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') >= 2 && g.since('money1') <= 3, text: moneyAfter },
    { id: 'y_money34', age: 34, t: '那笔钱', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') === 1, text: moneyAfter },
    { id: 'y_car31', age: 31, t: '车', auto: true, cond: (g) => !!g.recall('car') && g.since('car') >= 2, text: carAfter },
    { id: 'y_car34', age: 34, t: '车', auto: true, cond: (g) => !!g.recall('car') && g.since('car') === 1, text: carAfter },
    { id: 'y_side29', age: 29, t: '副业', auto: true, cond: (g) => !!g.recall('side'),
      fx: (g) => { if (g.rnd() < 0.4) g.remember('sideEnd', true); },
      text: (g) => ({ drive: '晚上接零活的这几年，一年能多挣一万来块。', stall: '夜市的摊子摆了三年，熟客会专门绕过来找你。', video: '剪片子的单子越接越多，一年多挣一万来块。' }[g.recall('side')] || '') + (g.recall('sideEnd') ? '后来你实在累了，就停了。' : '你打算再干几年。') },
    { id: 'y_house_after', age: 30, t: '房子', auto: true, cond: (g) => !!g.recall('houseSize') && hasHouse(g),
      text: (g) => ({ big: '三居的房子，一间留给了将来的孩子，现在堆着纸箱和一辆自行车。', small: '小房子住得满满当当。阳台上晾着衣服，也种着葱和辣椒。', county: '老家县城的房子一年住不了几天。' + (parentAlive(g) ? parentWord(g) + '隔几天去开窗通风，说楼下新开了一家超市。' : '邻居帮你看着，过年回去给人家带了两瓶酒。'), far: '城边的房子离地铁站越来越近了，新线明年通车。' }[g.recall('houseSize')]) + (debtW(g) ? '还欠 ' + CN.fmt(debtW(g) * 1e4) + '，慢慢还。' : '') },
    { id: 'y_side_stop', age: 30, t: '歇一歇', auto: true, cond: (g) => !!g.recall('sideEnd') && !!g.recall('side'),
      fx: (g) => { g.remember('side', ''); },
      text: '你把副业停了。晚上的时间又回来了，你用它睡觉、做饭、发呆。' },
  ]);

  /* 新增的状态键名（青年，写进这一世的记忆）：
   * gk 高考档次 'top'|'good'|'normal'|'college'|'fail'；lifePath 当下在做什么 'uni'|'college'|'repeat'|'army'|'grad'|'phd'|'abroad'|'work'
   * campus 大一怎么过 'study'|'club'|'love'|'game'；uniSide 大二课余 'intern'|'money'|'project'|'none'；plan 大三打算 'job'|'grad'|'civil'|'abroad'
   * gradFail 考研考公没上岸；gradWay 研究生怎么读 'lab'|'intern'；army 'stay'|'out'；armyOut 已转业
   * workStyle 打工头几年 'save'|'fun'|'study'；skill 手艺 'cook'|'auto'|'hair'|'elec'；stayCity 留在城里
   * loveFrom 怎么认识的 'campus'|'work'|'blind'|'online'；singleWay 单身的原因 'self'|'refuse'|'blind'|'app'|'broke'；metParents
   * caili 彩礼 'paid'|'stuck'|'late'|'travel'|'none'；lateMarry 'match'（32 岁经人介绍结婚，和中年同义）；fight 31 岁大吵 'talk'|'cold'|'split'
   * rentType 'share'|'whole'|'far'；rentForever；soldHouse；nightJob；frugal；houseSize 'big'|'small'|'county'|'far'（30 岁的自动节点读）
   * backHome 'early'|'late'|'house'|'parents'|'no'
   * aiMove 'learn'|'switch'|'care'|'laid'；steady 'stay'|'up'|'stuck'|'move'|'small'；jumped；promoted；startup 'ok'|'fail'|'no'
   * kidPlan 'now'|'wait'|'dink'|'trying'；kid2 'yes'|'no'；kidCare 'grand'|'paid'|'home'|'back'|'stay'；preKidJob [职业键, 名帖写法]
   * spWork 'home'（配偶全职带孩子，economy.js 读）；custody 离婚时孩子跟谁 'me'|'ex'（和中年同义）
   * parentsNear 'far'|'with'|'back'；burnout 'push'|'rest'
   * credit 'none'|'phone'|'loan'；money1 第一次理财 'safe'|'fund'|'stock'|'family'|'none'；car 'no'|'new'|'loan'|'used'
   * side 副业 'drive'|'stall'|'video'，'' 表示停了（economy.js 读，每年多一万）；sideEnd
   * oldFriend 'went'|'red'；last34 'civil'|'stay'|'own'；look34 'ok'|'learn'；abroadStay；viral；riderHurt
   * offer22 第一份工作 'big'|'stable'|'civil'|'media'（28 岁回响：大厂裁员、自媒体断流）
   * ladder 29 岁升职走的路 'mgr'|'expert'|'move'|'no'|'stuck'（中年的升职、33 岁回响读）
   * biz 32 岁自己干 'stall'|'online'|'franchise'|'stallFail'|'onlineFail'|'franchiseFail'|'no'；bizKind 加盟店的种类（34 岁回响兑现成败）
   * 工具：CN.jobPay(g, 职业键, 城市等级, 事业加点) 月薪（元）、CN.jobRisk(职业键)、CN.jobLine(...) '约 ¥8,000/月，……'，中年、老年、意外都用
   */
})();

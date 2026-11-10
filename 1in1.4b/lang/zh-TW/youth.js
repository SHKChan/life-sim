/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const VOC_MAJOR = { mech: '汽修', care: '護理', ecom: '電商', robot: '機器人維修' };
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
  const parentWord = (g) => (g.alive('fa') && g.alive('mo') ? '爸媽' : g.alive('fa') ? '爸' : g.alive('mo') ? '媽' : '家裡');
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
  const bigCity = () => CN.pick(['北京', '上海', '廣州', '深圳', '杭州', '成都', '南京', '武漢']);
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
  const payWord = (g) => (married(g) ? '兩個人每月加起來大概 ' : '每月到手大概 ') + CN.fmt(perMonth(g));
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
    civil: '鐵飯碗，幾乎不會被裁', teacher: '穩定，有寒暑假，帶班累', doctor: '穩定，夜班多，熬身體', nurse: '穩定，三班倒', soldier: '包吃住，規矩嚴',
    tech: '錢多，加班重，怕三十五歲和 AI', office: '不算累，被 AI 替代的風險高', sales: '底薪加提成，看業績吃飯',
    worker: '累，機器人替代的風險高', rider: '多勞多得，風吹日曬，沒有底薪', driver: '熬夜，無人駕駛遲早要來', shop: '看位置和運氣，賠了算自己的',
    boss: '好年景翻幾倍，差的時候血本無歸', creator: '大起大落，平臺一變就斷糧', freelance: '有一單沒一單', farmer: '看天吃飯，掙得少',
  };
  CN.jobPay = (g, job, t, plus) => r100((INC[job] != null ? INC[job] : 60000) * (TI[t || tierNow(g)] || 0.8) * (0.6 + Math.min(100, g.s('事业') + (plus || 0)) / 100 * 1.4) / 12);
  CN.jobRisk = (job) => RISK[job] || '';
  CN.jobLine = (g, job, t, plus) => {
    const m = CN.jobPay(g, job, t, plus);
    const pay = job === 'boss' || job === 'creator' ? '月入 ' + CN.fmt(r100(m * 0.4)) + '到 ' + CN.fmt(r100(m * 1.8)) + ' 不等' : '約 ' + CN.fmt(m) + '/月';
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
  const buyPlace = (g) => (tierNow(g) <= 4 ? here(g) : g.recall('city') + '下面的縣城');
  const dealRes = (g, d, head) => head + '總價 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '：'
    + (married(g) ? '你們' : '你') + '自己出了 ' + CN.fmt(d.mine)
    + (d.fam ? '，' + (married(g) ? '兩邊爸媽' : parentWord(g)) + '給了 ' + CN.fmt(d.fam) : '')
    + (d.borrow >= 1000 ? '，又找親戚借了 ' + CN.fmt(d.borrow) : '') + '。每個月還貸 ' + CN.fmt(d.month) + '。';
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
      { t: '一步到位，買' + nameA, dev: 10, cond: showA,
        fx: (g) => { const d = deal(g, buyTier(g), sizeA(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'big'); g.stat('心情', 4); },
        res: (g) => dealRes(g, last, '在' + buyPlace(g) + '買了' + nameA + '。') + '搬家那天，你在每個房間裡都站了一會兒。' },
      { t: '湊一湊首付，先買' + nameB, canon: true, cond: showB,
        fx: (g) => { const d = deal(g, buyTier(g), sizeB(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'small'); g.stat('心情', 3); },
        res: (g) => dealRes(g, last, '在' + buyPlace(g) + '買了' + nameB + '。') + '交鑰匙那天，屋裡什麼傢俱都沒有，' + (married(g) ? '你們' : '你') + '坐在地板上吃了一頓外賣，覺得挺好。' },
      { t: '回老家縣城買，便宜', dev: 15, cond: showC,
        fx: (g) => { const d = deal(g, 4, 1); doBuy(g, d); g.remember('backHome', 'house'); g.remember('houseSize', 'county'); },
        res: (g) => dealRes(g, last, '房子買在老家縣城，') + '你們一年回去住幾天，' + parentWord(g) + '幫著看房子。' },
      { t: '去城邊的小城買，通勤遠一點', dev: 15, cond: (g) => !showA(g) && !showB(g) && !showC(g),
        fx: (g) => { const d = deal(g, Math.min(4, buyTier(g) + 1), 0.8); doBuy(g, d, here(g) + '城邊'); g.remember('houseSize', 'far'); g.stat('健康', -2); },
        res: (g) => dealRes(g, last, '房子在城邊的小城。') + '每天來回三個小時，你在車上學會了站著睡覺。' },
      { t: '不買，接著租', dev: 20,
        fx: (g) => { g.remember('house', 'rent'); g.remember('rentForever', true); g.stat('心情', 1); },
        res: (g) => withParents(g) && !married(g) ? '你還住在' + parentWord(g) + '家，省下了房租。' + (g.alive('mo') ? '你媽說，家裡又不缺你一張床。' : '') : (married(g) ? '你們' : '你') + '每個月交 ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + ' 房租，手裡留著錢，心裡也鬆快。' + (married(g) ? (isMale(g) ? '丈母孃' : '婆婆') + '那邊很久沒給好臉色。' : '') },
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
    ? '彩禮 ' + CN.fmt(w.caili) + '，酒席 ' + CN.fmt(w.feast) + '，份子錢回來大半。' + parentWord(g) + '出了 ' + CN.fmt(w.fam) + (w.borrow >= 5000 ? '，還找親戚借了 ' + CN.fmt(w.borrow) : '') + '，剩下的是你自己攢的。'
    : '酒席 ' + CN.fmt(w.feast) + '，份子錢回來大半。男方給的彩禮 ' + CN.fmt(w.caili) + '，你爸媽留下一半，另一半當嫁妝給了你們的小家。');
  const wedText = (g) => {
    const w = wedPlan(g);
    if (rural(g) || county(g)) return isMale(g) ? '兩家人坐下來談彩禮。對方家裡開口要 ' + CN.fmt(w.caili) + '，酒席還要另算。你卡里有 ' + CN.fmt(cash(g)) + '。'
      : '兩家人坐下來談婚事。男方家裡說彩禮給 ' + CN.fmt(w.caili) + '，你媽覺得少了點，你爸說差不多就行。';
    return '對方問你，要不要把日子定下來。城裡辦一場婚禮，酒店一桌 ¥3,000，彩禮兩家說好意思一下。';
  };

  /* 理财的选项（23 岁第一笔存款、33 岁）。amt 是拿出来的钱 */
  const moneyChoices = () => {
    const amt = (g) => r1000(cash(g) * 0.6);
    return [
      { t: '存定期，圖個安心', canon: true,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'safe'); g.remember('money1', 'safe'); },
        res: (g) => '你去銀行存了 ' + CN.fmt(last.amt) + ' 的三年定期。利息不多，晚上睡得著。' },
      { t: '買基金，聽說比存銀行強', dev: 10,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'fund'); g.remember('money1', 'fund'); },
        res: (g) => '你分幾次買了 ' + CN.fmt(last.amt) + ' 的基金。頭一個月就跌了一點，你忍住沒看。' },
      { t: '開個戶，自己炒股', dev: 20,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'stock'); g.remember('money1', 'stock'); g.stat('心情', -1); },
        res: (g) => '你往股票賬戶裡轉了 ' + CN.fmt(last.amt) + '。上班摸魚的時候，手機上全是紅紅綠綠的線。' },
      { t: '拿一筆給家裡用', dev: 15, cond: (g) => parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker'),
        fx: (g) => { last.amt = r1000(cash(g) * 0.4); CN.pay(g, last.amt); g.remember('money1', 'family'); g.stat('人缘', 4); },
        res: (g) => '你給' + parentWord(g) + '轉了 ' + CN.fmt(last.amt) + '。' + (rural(g) ? '老家的房子漏雨好幾年了，這回能翻修了。' : '你媽說給你存著，你說不用。') },
      { t: '先放著，想花就花', dev: 10, cond: (g) => !(parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker')),
        fx: (g) => { g.remember('money1', 'none'); g.stat('心情', 2); },
        res: '錢就放在卡里。你給自己買了一臺好點的電腦。' },
    ];
  };
  const moneyAfter = (g) => {
    const m = g.recall('money1');
    const inv = Number(g.recall('invest')) || 0;
    if (m === 'family') return '老家的房子翻修好了。你媽在影片裡舉著手機，帶你看了一圈新刷的牆。';
    if (m === 'none') return '卡里那筆錢，不知不覺花掉了一大半。你下載了一個記賬軟體，這回堅持下來了。';
    if (!inv) return '理財的錢你早就取出來花掉了。';
    return { safe: '定期到期了，連本帶利 ', fund: '你買的基金漲漲跌跌，現在一共是 ', stock: '你炒股的賬戶，現在是 ' }[m] + CN.fmt(inv) + '。' + (m === 'stock' ? '你說再也不天天看盤了，第二天又看了。' : '數字不大，看著心裡有底。');
  };

  /* 车的选项 */
  const carChoices = () => [
    { t: '不買，現在出門也夠用', canon: true, fx: (g) => { g.remember('car', 'no'); g.stat('心情', 1); }, res: (g) => (tierNow(g) >= 4 ? '你換了一輛新電瓶車，¥3,000，縣城哪兒都能去。' : '你算了一下，打車一年也花不到養車的一半。') },
    { t: '全款買一輛新能源車', dev: 10, cond: (g) => cash(g) >= 150000,
      fx: (g) => { CN.pay(g, 120000); g.remember('car', 'new'); g.stat('心情', 5); }, res: '落地 ¥12 萬。提車那天，你在停車場裡坐了很久，沒捨得開走。' },
    { t: '首付三萬，貸款買', dev: 15, cond: (g) => cash(g) >= 40000 && cash(g) < 150000,
      fx: (g) => { CN.pay(g, 30000); g.remember('debt', debtW(g) + 9); g.remember('car', 'loan'); g.stat('心情', 3); }, res: '首付 ¥3 萬，剩下 ¥9 萬分五年還，每個月 ¥1,700。車是新的，賬也是新的。' },
    { t: '買一輛二手車，四萬塊', dev: 10,
      fx: (g) => { CN.pay(g, 40000); g.remember('car', 'used'); g.stat('心情', 3); }, res: '車是別人開了五年的，空調有點響。能跑就行。' },
  ];
  const carText = (g) => (tierNow(g) >= 4 ? '縣城裡的公交一個小時一趟。' : '週末出門，地鐵要倒兩趟。')
    + (kidN(g) ? '帶著孩子去趟醫院，抱著走到車站就一身汗。' : married(g) ? '回趟' + (g.alive('mo') ? '爸媽家' : '老家') + '，大包小包擠不上車。' : '同事們開始聊車了。')
    + '你卡里有 ' + CN.fmt(cash(g)) + '。';
  const carAfter = (g) => ({ new: '有了車，週末你常開出城去。' + (kidN(g) ? '孩子在後座睡著，嘴角掛著餅乾渣。' : '後備箱裡放著一頂帳篷。'), loan: '車貸還了一半。開車上班那二十分鐘，是你一天裡最安靜的時候。', used: '那輛二手車修過兩回，還是很爭氣。', no: tierNow(g) >= 4 ? '你還是騎電瓶車。下雨天穿上雨披，照樣哪兒都去。' : '你還是沒買車。地鐵上你看完了好幾本書，也省下了一筆錢。' }[g.recall('car')] || '');

  /* 高考档次：学识 + 学校 + 运气 */
  const gaokao = (g, bonus) => {
    const sc = { key: 12, normal: 0, weak: -8 }[g.recall('school')] || 0;
    const v = g.s('学识') + sc + (bonus || 0) + (g.rnd() * 20 - 10);
    // 童年结束时高中生的学识大多在 60–95；按真实比例：顶尖约 6%，好大学约 25%，普通本科约 40%，大专约 20%，落榜约 10%
    return v >= 100 ? 'top' : v >= 88 ? 'good' : v >= 74 ? 'normal' : v >= 62 ? 'college' : 'fail';
  };
  const UNI_T = { top: '一所頂尖大學', good: '一所好大學', normal: '一所普通本科' };
  // 进大学：档次、专业、城市。调用前先在选项里 g.remember('uni', …) 和 g.remember('major', …)
  const enroll = (g, city, tier) => {
    const uni = g.recall('uni');
    g.remember('lifePath', 'uni');
    g.info('学历', '本科在讀');
    CN.goCity(g, tier, city);
    g.move('campus', city + ' · ' + UNI_T[uni]);
  };
  const fee = (g) => (rural(g) ? '學費一年 ¥5,000，你申請了助學貸款。' : '學費一年 ¥6,000，生活費一個月 ¥2,000，家裡出。');

  /* 志愿：18 岁第一次高考，19 岁复读后的第二次，共用一套选项 */
  const zhiyuan = (id, age, cond) => dec({ id, age, t: '填志願', loc: 'home', cond,
    text: (g) => {
      const gk = g.recall('gk');
      return (gk === 'top' ? '分數出來了，比你預想的高。班主任打電話來，聲音都變了。' : gk === 'good' ? '分數不錯，夠得上一所好大學，挑不了最熱門的專業。' : '分數剛過本科線。志願書厚厚一本，你翻到半夜。')
        + parentWord(g) + '說你自己定，又說別離家太遠。';
    },
    choices: [
      { t: '去大城市，報熱門的計算機', canon: true,
        fx: (g) => { const gk = g.recall('gk'); const tier = gk === 'normal' ? 2 : 1; g.remember('uni', gk); g.remember('major', '計算機'); enroll(g, tier === 1 ? bigCity() : capital(g), tier); g.stat('心情', 2); },
        res: (g) => '錄取通知書寄到了。' + g.recall('workCity') + '，你只在地圖上見過。' + fee(g) },
      { t: '報師範或醫學，圖個穩當', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', g.rnd() < 0.5 ? '師範' : '醫學'); enroll(g, capital(g), 2); g.stat('人缘', 2); },
        res: (g) => (g.recall('major') === '醫學' ? '醫學要讀五年。你媽說，以後家裡人看病就不求人了。' : '師範生有補助，畢業以後多半回來當老師。你爸挺滿意。') },
      { t: '離家近，在本省讀個好就業的專業', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', CN.pick(['會計', '機械', '電氣', '中文', '法學'])); enroll(g, capital(g), 2); g.stat('人缘', 1); },
        res: (g) => '學校在' + g.recall('workCity') + '，坐車三個小時就能回家。專業是' + g.recall('major') + '。' + fee(g) },
      { t: '不甘心，復讀一年', dev: 25, cond: (g) => g.recall('gk') !== 'top' && g.recall('lifePath') !== 'repeat',
        fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -6); g.move('school', home(g) + ' · 復讀班'); },
        res: '復讀班在縣中學的後樓，一年學費 ¥8,000。第一天點名，你認識裡面一半的人。' },
    ] });

  /* 升职（31 岁）：管理岗、专业路线、外调。ladder 记下走的哪条路，中年的升职读它 */
  const MGR = { tech: '技術組長', office: '部門主管', sales: '銷售經理', civil: '副科長', teacher: '年級組長', doctor: '醫療組長', nurse: '護士長', worker: '車間主任', rider: '站點組長', driver: '車隊排程', soldier: '副連長' };
  const EXPERT = { tech: '高階工程師', doctor: '主治醫師', teacher: '一級教師', nurse: '主管護師', worker: '高階技工', office: '資深專員', civil: '主任科員' };
  const upMgr = (g) => { CN.setJob(g, g.recall('job'), MGR[g.recall('job')] || '主管'); g.remember('promoted', true); g.remember('ladder', 'mgr'); g.stat('事业', 10); g.stat('健康', -2); };
  const mgrRes = (g) => '你當上了' + jobTitle(g) + '，' + payWord(g).replace(/^.*?大概/, '現在每月大概') + '。第一件事，是學著不在群裡說太多話。';
  const upFail = (g) => { g.remember('promoted', false); g.remember('ladder', 'stuck'); g.stat('心情', -4); };

  /* 自己干（29 岁）：小吃摊、网店、加盟店。biz 记下干的什么、头一年成没成，32 岁的回响兑现 */
  const bizText = (g) => pk(g, ['下班路過夜市，', '週末回家的路上，', '刷短影片的時候，'], 1)
    + pk(g, ['一個比你小的老鄉說，他擺攤一個月掙一萬多。', '你看見以前的同事開了家店，門口排著隊。', '你算了算，給人打工到退休，也就是這麼些錢。'], 2);
  const frKind = (g) => pk(g, ['奶茶店', '快餐店', '便利店', '洗衣店', '烘焙店'], 3);
  const frCost = (g) => FRANCHISE[tierNow(g)] || 200000;
  // 能叫来帮忙的家里人
  const helper = (g) => ['sib0', 'sib1'].find((id) => JY.byId[id] && g.alive(id) && g.ageOf(id) >= 18) || (g.alive('mo') ? 'mo' : g.alive('fa') ? 'fa' : '');

  JY.addFlags({
    ySavedWorker: '在工地上救下了一個從腳手架上摔下來的工友',
    yHometownShop: '回老家開了一家店，後來成了鎮上的老字號',
  });

  JY.addLifeNodes([
    /* ================= 18 岁：衔接童年 ================= */
    { id: 'y_entry', age: 18, t: '十八歲', auto: true,
      fx: (g) => {
        // 童年没留下学历时兜底：按学识和出身估一个
        let e = g.recall('edu');
        if (!e) {
          const r = g.s('学识') + (rural(g) ? -8 : 4) + g.rnd() * 30;
          e = r >= 60 ? 'senior' : r >= 42 ? 'vocational' : 'junior';
          CN.setEdu(g, e, { senior: '高中', vocational: '職高', junior: '初中' }[e]);
        }
        if (e === 'primary') CN.setEdu(g, 'junior', '初中');
        // 童年写的是“高中在读”“职高在读”，十八岁毕业
        if (e === 'senior') CN.setEdu(g, 'senior', '高中');
        if (e === 'vocational') CN.setEdu(g, 'vocational', '職高');
        if ((e === 'junior' || e === 'primary') && (!g.recall('job') || g.recall('job') === 'none')) {
          CN.setJob(g, 'worker', '工廠工人');
          CN.goCity(g, CN.pick([1, 3, 3]));
          g.move('factory', g.recall('workCity') + ' · 電子廠');
        }
        if (e === 'junior' || e === 'primary') g.remember('lifePath', 'work');
        if (e === 'senior') g.remember('gk', gaokao(g));
      },
      text: (g) => (g.recall('edu') === 'senior' ? '六月，你走進考場。筆袋是透明的，手心全是汗。'
        : g.recall('edu') === 'vocational' ? '職高最後一年，你在實習的地方過了十八歲生日。'
        : '你十八歲了。在' + (g.recall('workCity') || '外地') + '的宿舍裡，工友給你買了一個小蛋糕。') },
    { id: 'y_gaokao', age: 18, t: '高考放榜', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => ({ top: '你考了全縣第一。門口放了一掛鞭炮，是鄰居放的。', good: '你考得不錯。班主任在群裡點了你的名。', normal: '分數剛過本科線，不高不低。', college: '分數夠不上本科，只夠大專。', fail: '分數出來，你看了很久，關掉了網頁。' }[g.recall('gk')]) },
    zhiyuan('y_zhiyuan', 18, (g) => ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_zhuanke', age: 18, t: '大專', loc: 'home', cond: (g) => g.recall('gk') === 'college',
      text: '能上的是一所大專，在省城邊上，一年學費 ¥7,000。你媽說，大專也是大學。',
      choices: [
        { t: '去讀，學個實用的專業', canon: true,
          fx: (g) => { const m = CN.pick(['護理', '汽修', '電商', '學前教育', '機電']); g.remember('major', m); g.remember('lifePath', 'college'); g.info('学历', '大專在讀'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 職業技術學院'); },
          res: (g) => '專業是' + g.recall('major') + '。宿舍六個人，三個和你一樣是第一次離家。' },
        { t: '復讀一年，衝本科', dev: 20, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -5); g.move('school', home(g) + ' · 復讀班'); }, res: '你把大專的錄取通知書壓在了抽屜最底下。' },
        { t: '不讀了，出去掙錢', dev: 25,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工廠工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工業園'); },
          res: (g) => '表哥在' + g.recall('workCity') + '的廠裡當線長，說可以帶你。包吃住，' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_luobang', age: 18, t: '落榜', loc: 'home', cond: (g) => g.recall('gk') === 'fail',
      text: '你沒考上。家裡沒人提這件事，吃飯的時候特別安靜。',
      choices: [
        { t: '復讀', canon: true, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -4); g.move('school', home(g) + ' · 復讀班'); }, res: '你又背上了書包。你媽把你愛吃的菜換著樣做。' },
        { t: '去南方打工', dev: 10,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工廠工人'); CN.goCity(g, 1, CN.pick(['深圳', '廣州'])); g.move('factory', g.recall('workCity') + ' · 工業園'); },
          res: (g) => '高鐵坐了八個小時。' + g.recall('workCity') + '的夏天比老家熱。廠裡' + payWord(g) + '。' },
        { t: '去當兵', dev: 20, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部隊的路上'); g.stat('健康', 5); },
          res: '體檢過了。走的那天，村口掛了橫幅，寫著你的名字。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工廠工人'); CN.goCity(g, 3); }, res: '體檢沒過，視力差了一點。你跟著同學去了市裡的廠子。' } },
      ] }),
    dec({ id: 'y_voc18', age: 18, t: '職高畢業', loc: 'factory', cond: (g) => g.recall('edu') === 'vocational' && !g.recall('lifePath'),
      text: (g) => (g.recall('vocPlan') === 'college' ? '職教高考的成績出來了，夠上一所高職。' : '實習的廠子說可以留你，轉正後一個月 ¥4,500。') + '老師說，讀三年大專，出來路寬一點。',
      choices: [
        { t: '考高職，讀大專', canon: true,
          fx: (g) => { g.remember('major', VOC_MAJOR[g.recall('vocMajor')] || CN.pick(['汽修', '數控', '護理', '電商', '烹飪'])); g.remember('lifePath', 'college'); g.info('学历', '大專在讀'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 職業技術學院'); },
          res: (g) => '你考上了。學的還是' + g.recall('major') + '，只是學校大了。' },
        { t: (g) => '留在廠裡轉正（' + CN.jobLine(g, 'worker', 3) + '）', dev: 5,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技術工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 車間'); },
          res: (g) => '轉正那天，班長讓你自己帶一臺機器。' + payWord(g) + '。' },
        { t: (g) => '去當兵（' + CN.jobLine(g, 'soldier', 3) + '）', dev: 15, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部隊的路上'); g.stat('健康', 5); },
          res: '你剃了平頭，在火車站跟媽媽揮手。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技術工人'); CN.goCity(g, 3); }, res: '體檢沒過。你回了實習的廠子。' } },
      ] }),
    dec({ id: 'y_work18', age: 18, t: '在外面', loc: 'factory', cond: (g) => working(g) && ['junior', 'primary'].includes(g.recall('edu')),
      text: (g) => '你在' + (g.recall('workCity') || '外地') + '已經幹了兩年，' + payWord(g) + '。' + (g.recall('workPlan') === 'study' ? '夜校的課快上完了。' : g.recall('workPlan') === 'city' ? '電動車換了第二輛。' : '流水線上的活閉著眼都會了。'),
      choices: [
        { t: '接著幹，攢錢', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.5), 'safe'); g.stat('心情', -2); }, res: (g) => '你每個月往家裡打一半工資。剩下的攢了攢，存了一張 ' + CN.fmt(last.amt) + ' 的定期。' },
        { t: (g) => '去大城市跑外賣（' + CN.jobLine(g, 'rider', 1) + '）', dev: 15,
          fx: (g) => { CN.setJob(g, 'rider', '外賣騎手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('健康', -2); },
          res: (g) => '在' + g.recall('workCity') + '，你租了一輛電動車，第一天跑了二十單。跑得勤的話，' + payWord(g) + '。' },
        { t: (g) => '跟師傅學門手藝（學徒 ¥2,500/月，出師後' + CN.jobLine(g, 'worker', null, 6) + '）', dev: 15,
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.setJob(g, 'worker', { cook: '學徒廚師', auto: '汽修學徒', hair: '理髮學徒', elec: '電工學徒' }[s]); },
          res: '學徒一個月只有 ¥2,500，師傅脾氣大。你每天最後一個走。' },
      ] }),

    /* ================= 19 岁 ================= */
    { id: 'y_firstleave', age: 18, t: '第一次離家', auto: true, cond: (g) => g.recall('lifePath') === 'uni' || g.recall('lifePath') === 'college',
      text: (g) => (rural(g) ? (g.alive('fa') ? '你爸扛著被子送你到宿舍樓下，沒上樓，說樓梯太窄。' : '你自己扛著被子上了樓。室友的媽媽多給了你一個蘋果。') : (g.alive('mo') ? '你媽幫你鋪好床，又把櫃子擦了一遍。走的時候她沒回頭。' : '你一個人鋪好了床。晚上家裡打來電話，問你吃飯了沒有。')) },
    { id: 'y_repeat', age: 19, t: '第二次高考', auto: true, cond: (g) => g.recall('lifePath') === 'repeat',
      fx: (g) => { const r = gaokao(g, 8); g.remember('gk', r === 'fail' ? 'college' : r); },
      text: (g) => '復讀這一年，你瘦了十斤。第二次放榜，你考到了' + ({ top: '全市前列', good: '一本線以上', normal: '本科線以上', college: '大專線' }[g.recall('gk')]) + '。' },
    zhiyuan('y_zhiyuan2', 19, (g) => g.recall('lifePath') === 'repeat' && ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_repeat_college', age: 19, t: '還是大專', loc: 'home', cond: (g) => g.recall('lifePath') === 'repeat' && g.recall('gk') === 'college',
      text: '復讀一年，分數還是隻夠大專。',
      choices: [
        { t: '認了，去讀', canon: true, fx: (g) => { g.remember('major', CN.pick(['護理', '汽修', '電商', '機電'])); g.remember('lifePath', 'college'); g.info('学历', '大專在讀'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 職業技術學院'); }, res: '你比同學大一歲。沒人知道。' },
        { t: '出去打工', dev: 10, fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工廠工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工業園'); }, res: (g) => '你把復讀的書都賣了，換了一張火車票。廠裡' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_campus', age: 19, t: '大一', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '宿舍熄燈以後，走廊裡還有人在打電話。大學和你想的不太一樣，沒人管你。',
      choices: [
        { t: '泡圖書館，卷績點', canon: true, fx: (g) => { g.remember('campus', 'study'); g.stat('学识', 6); g.stat('心情', -2); CN.earn(g, 5000); }, res: '你拿了一等獎學金，¥5,000。室友說你沒意思，讓你請客。' },
        { t: '進社團，認識人', dev: 10, fx: (g) => { g.remember('campus', 'club'); g.stat('人缘', 6); g.stat('心情', 3); }, res: '你當上了社團的副部長，手機裡多了兩百個聯絡人。' },
        { t: '談一場戀愛', dev: 10, check: ['人缘', 45],
          fx: (g) => { g.remember('campus', 'love'); g.remember('love', 'dating'); g.remember('loveFrom', 'campus'); g.info('婚姻', '戀愛中'); g.stat('心情', 8); },
          res: '你們在食堂門口第一次說上話。後來每天一起去上早八。',
          fail: { fx: (g) => { g.remember('campus', 'game'); g.stat('心情', -3); }, res: '表白被拒了。你在宿舍打了一個學期的遊戲。' } },
      ] }),
    dec({ id: 'y_work19', age: 19, t: '城裡', loc: 'metro', cond: (g) => working(g),
      text: (g) => '在' + (g.recall('workCity') || '城裡') + '的第一個春節，你沒回家，加班費是平時的三倍。廠裡包了餃子，你吃了三個。',
      choices: [
        { t: '能省就省，錢存著', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.6), 'safe'); g.stat('心情', -2); }, res: (g) => '你去銀行存了一張 ' + CN.fmt(last.amt) + ' 的定期。存單你夾在了身份證後面。' },
        { t: '跟工友出去玩，見見世面', dev: 10, fx: (g) => { g.remember('workStyle', 'fun'); CN.pay(g, 6000); g.stat('心情', 5); g.stat('人缘', 4); }, res: '你們去了海邊，一趟花了 ¥6,000。你第一次見到海，站了很久。' },
        { t: '晚上去上夜校，考個證', dev: 15, fx: (g) => { g.remember('workStyle', 'study'); CN.pay(g, 4000); g.stat('学识', 6); g.stat('健康', -2); }, res: '學費 ¥4,000。下了班去上課，你常常在最後一排睡著。證考下來了。' },
      ] }),

    /* ================= 20 岁 ================= */
    dec({ id: 'y_army_back', age: 20, t: '退伍', loc: 'road', cond: (g) => g.recall('lifePath') === 'army',
      text: '兩年兵役滿了。指導員問你要不要留下轉士官。退伍的話，能領一筆 ¥6 萬左右的退役金。',
      choices: [
        { t: '留隊，轉士官', dev: 10, fx: (g) => { g.remember('army', 'stay'); CN.setJob(g, 'soldier', '士官'); g.stat('健康', 4); g.stat('事业', 6); }, res: '你肩上的牌子換了顏色。' },
        { t: '退伍，回老家考公', canon: true,
          fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); if (g.s('学识') >= 45 || g.rnd() < 0.5) { CN.setJob(g, 'civil', '基層公務員'); toCounty(g); } else { CN.setJob(g, 'driver', '司機'); CN.goCity(g, 3); } },
          res: (g) => '退役金 ¥6 萬到了賬。' + (g.recall('job') === 'civil' ? '退役軍人有加分，你考上了縣裡的崗位，' : '考公沒考上。你考了駕照，在市裡給一家公司開車，') + payWord(g) + '。' },
        { t: '退伍，去大城市做物流', dev: 10, fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); CN.setJob(g, 'driver', '物流司機'); CN.goCity(g, 1); }, res: (g) => '物流公司喜歡當過兵的人。你開夜班車，' + payWord(g) + '。' },
      ] }),
    dec({ id: 'y_side', age: 20, t: '課餘', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '大二了。身邊的人有的去實習，有的在做兼職，有的在打遊戲。',
      choices: [
        { t: '找家公司實習', canon: true, fx: (g) => { g.remember('uniSide', 'intern'); CN.earn(g, 6000); g.stat('事业', 5); g.stat('学识', 2); }, res: '實習一個月 ¥3,000，幹了兩個月。你學會了做表格，也學會了看領導臉色。' },
        { t: '做家教、送外賣掙生活費', dev: 10, fx: (g) => { g.remember('uniSide', 'money'); CN.earn(g, 15000); g.stat('学识', -1); }, res: '一年下來掙了 ¥1.5 萬。你再沒問家裡要過生活費。' },
        { t: '和同學搞個小專案', dev: 20, check: ['学识', 72],
          fx: (g) => { g.remember('uniSide', 'project'); g.stat('事业', 4); g.stat('学识', 4); }, res: '你們做的小程式有了幾千個使用者。有人問你們要不要融資。',
          fail: { fx: (g) => { g.remember('uniSide', 'none'); g.stat('心情', -3); }, res: '專案做了一半，散夥了。散夥飯是你請的。' } },
      ] }),
    dec({ id: 'y_work20', age: 20, t: '換個活法', loc: 'factory', cond: (g) => working(g) && !g.recall('army'),
      text: (g) => (g.recall('workStyle') === 'study' ? '你考下來的證，讓你有了換崗的機會。' : '廠裡的訂單越來越少，車間裡多了幾臺機械臂。') + '你現在' + payWord(g) + '。',
      choices: [
        { t: (g) => '學門手藝，以後不靠流水線（拜師 ¥5,000，出師後' + CN.jobLine(g, 'worker', null, 4) + '）', canon: true, cond: (g) => !g.recall('skill'),
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.pay(g, 5000); CN.setJob(g, 'worker', { cook: '廚師', auto: '汽修工', hair: '理髮師', elec: '電工' }[s]); g.stat('事业', 4); },
          res: '拜師交了 ¥5,000。半年後，師傅說你可以出師了。' },
        { t: (g) => '去跑外賣（' + CN.jobLine(g, 'rider', 1) + '）', dev: 10, cond: (g) => g.recall('job') !== 'rider',
          fx: (g) => { CN.setJob(g, 'rider', '外賣騎手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('健康', -3); },
          res: (g) => '你每天跑十二個小時，' + payWord(g) + '，膝蓋開始疼。' },
        { t: (g) => '學著做直播（裝置 ¥3,000，' + CN.jobLine(g, 'creator') + '）', dev: 20, check: ['人缘', 50],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, 'creator', '主播'); g.stat('心情', 3); }, res: '補光燈和音效卡花了 ¥3,000。你拍的車間日常有人看，第一個月，打賞夠交房租了。',
          fail: { fx: (g) => { CN.pay(g, 3000); g.stat('心情', -4); }, res: '裝置花了 ¥3,000。直播間常常只有三個人，其中一個是你媽。' } },
        { t: (g) => '回老家，幫家裡（' + CN.jobLine(g, rural(g) ? 'farmer' : 'shop', rural(g) ? 5 : 4) + '）', dev: 10,
          fx: (g) => { goBack(g); g.remember('backHome', 'early'); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '種地，農閒打零工' : '在家裡的店幫忙'); g.stat('心情', 3); },
          res: '你回來那天，家門口的路剛修成水泥的。掙得少了，飯是熱的。' },
      ] }),

    /* ================= 21 岁 ================= */
    dec({ id: 'y_plan', age: 21, t: '大三', loc: 'campus', cond: (g) => g.recall('lifePath') === 'uni',
      text: '大三下學期，宿舍裡的人分成了幾撥：考研的、考公的、找工作的。',
      choices: [
        { t: '找工作', canon: true, fx: (g) => { g.remember('plan', 'job'); g.stat('事业', 3); }, res: '你改了十幾版簡歷。' },
        { t: '考研', dev: 10, fx: (g) => { g.remember('plan', 'grad'); g.stat('学识', 4); g.stat('心情', -3); }, res: '你在自習室佔了一個靠窗的座位，一坐就是一年。' },
        { t: '考公', dev: 10, fx: (g) => { g.remember('plan', 'civil'); CN.pay(g, 3000); g.stat('学识', 3); }, res: '你報了一個 ¥3,000 的網課，又買了一摞行測和申論的書。' },
        { t: '出國讀書', dev: 20, cond: (g) => ['rich', 'civil'].includes(g.recall('family')), fx: (g) => { g.remember('plan', 'abroad'); g.stat('学识', 3); }, res: '你考了語言成績。家裡拿出 ¥40 萬，你媽說這是給你攢了很多年的。' },
      ] }),
    dec({ id: 'y_college_out', age: 21, t: '大專畢業', loc: 'campus', cond: (g) => g.recall('lifePath') === 'college',
      text: (g) => '三年過得快。' + (g.recall('major') || '你的專業') + '的同學，大半已經簽了工作。',
      choices: [
        { t: (g) => { const m = g.recall('major'); const j = { '護理': 'nurse', '學前教育': 'teacher', '機器人維修': 'worker', '電商': 'sales' }[m] || 'worker'; return '按專業找工作（' + CN.jobLine(g, j, ['機器人維修', '電商'].includes(m) ? 2 : 3) + '）'; }, canon: true,
          fx: (g) => {
            CN.setEdu(g, 'college', '大專'); g.remember('lifePath', 'work');
            const m = g.recall('major');
            if (m === '護理') { CN.setJob(g, 'nurse', '護士'); CN.goCity(g, 3); g.move('hospital', g.recall('workCity') + ' · 市醫院'); }
            else if (m === '學前教育') { CN.setJob(g, 'teacher', '幼兒園老師'); CN.goCity(g, 3); }
            else if (m === '機器人維修') { CN.setJob(g, 'worker', '機器人運維'); CN.goCity(g, 2); g.move('factory', g.recall('workCity') + ' · 自動化工廠'); }
            else if (m === '電商') { CN.setJob(g, 'sales', '電商運營'); CN.goCity(g, 2); g.move('office', g.recall('workCity') + ' · 電商園區'); }
            else { CN.setJob(g, 'worker', '技術工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 車間'); }
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了，職位是' + (JY.engine.get().L.info['职业'] || '') + '，' + payWord(g) + '。' },
        { t: '專升本，再讀兩年', dev: 15, check: ['学识', 66],
          fx: (g) => { g.remember('lifePath', 'uni'); g.remember('uni', 'normal'); g.remember('plan', 'job'); g.info('学历', '本科在讀'); g.stat('学识', 3); },
          res: '你考上了。畢業證上會寫著“本科”兩個字。',
          fail: { fx: (g) => { CN.setEdu(g, 'college', '大專'); g.remember('lifePath', 'work'); CN.setJob(g, 'sales', '銷售'); CN.goCity(g, 2); }, res: '差了幾分。你拿著大專文憑去做了銷售，底薪加提成。' } },
        { t: '回老家開店', dev: 20,
          fx: (g) => { CN.setEdu(g, 'college', '大專'); g.remember('lifePath', 'work'); g.remember('backHome', 'early'); toCounty(g); CN.setJob(g, 'shop', '開小店'); CN.earn(g, 20000); CN.pay(g, 40000); g.stat('心情', 3); },
          res: (g) => '你在' + g.recall('workCity') + '的街上盤下一個門面。轉讓費加裝修 ¥4 萬，' + parentWord(g) + '出了一半。' },
      ] }),
    dec({ id: 'y_love21', age: 21, t: '有人', loc: 'metro', cond: (g) => working(g) && loveIs(g, 'single'),
      text: (g) => '同在' + (g.recall('workCity') || '城裡') + '打拼的老鄉里，有個人總是給你留飯。',
      choices: [
        { t: '處處看', canon: true, fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', '戀愛中'); g.stat('心情', 6); }, res: '你們下了班一起去吃麻辣燙，一人一碗，加一個蛋，兩個人 ¥36。' },
        { t: '先顧自己，不想談', dev: 10, fx: (g) => { g.remember('singleWay', 'self'); g.stat('事业', 2); }, res: '你把那份心思都放在了掙錢上。' },
      ] }),

    /* ================= 22 岁：毕业 ================= */
    { id: 'y_grad_result', age: 22, t: '畢業季', auto: true, cond: (g) => g.recall('lifePath') === 'uni',
      fx: (g) => {
        const p = g.recall('plan');
        const uniB = { top: 15, good: 6, normal: 0 }[g.recall('uni')] || 0;
        if (p === 'grad' && g.s('学识') + uniB + g.rnd() * 20 >= 88) { g.remember('lifePath', 'grad'); CN.setEdu(g, 'bachelor', '本科'); g.info('学历', '碩士在讀'); g.move('campus', g.recall('workCity') + ' · 研究生院'); }
        else if (p === 'civil' && g.s('学识') + uniB + g.rnd() * 25 >= 90) { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'work'); CN.setJob(g, 'civil', '公務員'); CN.goCity(g, CN.pick([2, 3, 4])); g.move('office', g.recall('workCity') + ' · 機關大院'); }
        else if (p === 'abroad') { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'abroad'); g.info('学历', '在國外讀碩士'); g.move('campus', '國外 · 一所大學'); }
        else { CN.setEdu(g, 'bachelor', '本科'); g.remember('gradFail', p === 'grad' || p === 'civil'); }
      },
      text: (g) => {
        const t = g.recall('lifePath');
        if (t === 'grad') return '你考上了研究生。拍畢業照那天，你知道自己還要在學校裡待三年。';
        if (t === 'abroad') return '畢業典禮一結束，你就去了機場。';
        if (g.recall('job') === 'civil') return '你考上了。公示名單上，你的名字排在第三個。' + payWord(g) + '，不多，穩當。';
        return (g.recall('gradFail') ? '考試沒上岸。' : '') + '畢業照上大家都在笑。散夥飯吃到凌晨，' + ({ love: '你和物件在操場上坐到天亮。', club: '社團的人哭成一片。', study: '你把筆記本送給了學弟。', game: '你們最後開了一局遊戲。' }[g.recall('campus')] || '有人喝多了。');
      } },
    dec({ id: 'y_offer', age: 22, t: '第一份工作', loc: 'office', cond: (g) => g.recall('lifePath') === 'uni' && !g.recall('job'),
      text: (g) => '投了幾十份簡歷，' + (g.recall('uniSide') === 'intern' ? '實習過的公司先給了你回覆。' : '迴音不多。') + '那一年，很多基礎崗位被 AI 替代，招聘會上的人比崗位多。',
      choices: [
        { t: (g) => '去大城市，進一家大廠（' + CN.jobLine(g, g.recall('major') === '計算機' ? 'tech' : 'office', 1) + '）', dev: 10, check: ['学识', 84],
          fx: (g) => { CN.setJob(g, g.recall('major') === '計算機' ? 'tech' : 'office', g.recall('major') === '計算機' ? '程式設計師' : '大廠職員'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 寫字樓'); g.remember('lifePath', 'work'); g.remember('offer22', 'big'); g.stat('健康', -3); },
          res: (g) => '你進了' + g.recall('workCity') + '的一家大廠，' + payWord(g) + '。工牌掛在脖子上，晚上十點地鐵還很擠。',
          fail: { fx: (g) => { CN.setJob(g, 'office', '公司職員'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: (g) => '大廠沒要你。你回了' + g.recall('workCity') + '，在一家小公司上班，' + payWord(g) + '。' } },
        { t: (g) => '回省城，找份穩定的工作（' + CN.jobLine(g, { '醫學': 'doctor', '師範': 'teacher' }[g.recall('major')] || 'office', 2) + '）', canon: true,
          fx: (g) => {
            const m = g.recall('major');
            g.remember('offer22', 'stable');
            if (m === '醫學') { CN.setJob(g, 'doctor', '住院醫生'); g.move('hospital', capital(g) + ' · 省醫院'); }
            else if (m === '師範') CN.setJob(g, 'teacher', '中學老師');
            else CN.setJob(g, 'office', '公司職員');
            CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work');
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了，' + payWord(g) + '。不算多，週末能回家。' },
        { t: (g) => '回老家，考編（' + CN.jobLine(g, g.recall('major') === '師範' ? 'teacher' : 'civil', 4) + '）', dev: 10,
          fx: (g) => { CN.setJob(g, g.recall('major') === '師範' ? 'teacher' : 'civil', g.recall('major') === '師範' ? '縣中學老師' : '鄉鎮公務員'); toCounty(g); g.remember('backHome', 'early'); g.remember('lifePath', 'work'); g.remember('offer22', 'civil'); g.stat('心情', 3); },
          res: (g) => '編制考上了，' + payWord(g) + '。你媽在親戚群裡發了一個大紅包。' },
        { t: (g) => '做自媒體，自己幹（' + CN.jobLine(g, 'creator', 2) + '）', dev: 25, check: ['人缘', 55],
          fx: (g) => { CN.setJob(g, 'creator', '博主'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.remember('offer22', 'media'); g.stat('心情', 4); },
          res: '你拍的租房日常火了一條。半年後，接廣告的錢夠活了。',
          fail: { fx: (g) => { CN.setJob(g, 'freelance', '自由職業'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: '粉絲漲得很慢。你接了一些零活，勉強交上房租。' } },
      ] }),
    dec({ id: 'y_worker22', age: 22, t: '留下還是回去', loc: 'metro', cond: (g) => working(g) && !white(g) && !g.recall('army') && away(g),
      text: (g) => '過年回家，' + (g.recall('workStyle') === 'save' ? '你給' + parentWord(g) + '帶了一個紅包，鼓鼓的。' : '你兜裡沒剩幾個錢。') + (g.alive('fa') ? '你爸' : '家裡人') + '問你，打算在外面漂到什麼時候。你在' + here(g) + payWord(g) + '，房租一個月 ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + '。',
      choices: [
        { t: '留在城裡接著幹', canon: true, fx: (g) => { g.remember('stayCity', true); g.stat('事业', 3); }, res: '正月初六，你又坐上了往外走的車。' },
        { t: '回老家開個店', dev: 20, cond: (g) => !!g.recall('skill') || g.recall('workStyle') === 'save',
          fx: (g) => { goBack(g); toCounty(g); g.remember('backHome', 'early'); CN.setJob(g, 'shop', { cook: '開小飯館', auto: '開修車鋪', hair: '開理髮店', elec: '開五金店' }[g.recall('skill')] || '開小賣部'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.8, 60000)); CN.pay(g, last.amt); g.stat('心情', 5); },
          res: (g) => '門面一年租金加裝修，花了 ' + CN.fmt(last.amt) + '。開張那天，你放了一掛鞭炮。第一個客人是你小學同學。' },
        { t: '去更遠的城市闖', dev: 15, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { CN.goCity(g, 1, CN.pick(['上海', '深圳', '北京', '杭州'])); g.remember('stayCity', true); g.stat('心情', -2); },
          res: (g) => '你去了' + g.recall('workCity') + '。同樣的活，' + payWord(g) + '，房租卻要 ' + CN.fmt(RENT_M[1]) + '。地鐵線路圖你看了三天才看懂。' },
        { t: '跟著老鄉去更大的廠', dev: 10, cond: (g) => tierNow(g) === 1,
          fx: (g) => { g.remember('stayCity', true); CN.setJob(g, 'worker', '大廠的線長'); g.stat('事业', 4); },
          res: '新廠包住，宿舍四個人一間。你當上了線長，管二十個人。' },
      ] }),
    dec({ id: 'y_credit22', age: 22, t: '先用後付', loc: 'home', cond: (g) => working(g) && !!g.recall('money0'),
      text: '手機用了四年，螢幕裂了一道。購物軟體彈出來一行字：先用後付，免息分期，額度 ¥3 萬。',
      choices: [
        { t: '不借，攢夠了再買', canon: true, fx: (g) => { g.remember('credit', 'none'); CN.pay(g, 2000); }, res: '你花 ¥2,000 換了塊屏。手機還能再用兩年。' },
        { t: '分期買一部新手機', dev: 10, fx: (g) => { g.remember('credit', 'phone'); CN.pay(g, 6000); g.stat('心情', 3); }, res: '¥6,000 的手機，分十二期，每月 ¥500。拆盒子那天你挺高興。' },
        { t: '開通額度，想買就買', dev: 20, fx: (g) => { g.remember('credit', 'loan'); g.remember('debt', debtW(g) + 3); g.stat('心情', 4); }, res: '新手機、新電腦、一副耳機，一個月就刷了 ¥3 萬。賬單上寫著“最低還款”。' },
      ] }),

    /* ================= 23 岁 ================= */
    dec({ id: 'y_abroad', age: 23, t: '在國外', loc: 'campus', cond: (g) => g.recall('lifePath') === 'abroad',
      text: '碩士快畢業了。你在超市裡找了很久，才找到一瓶像樣的辣椒醬。',
      choices: [
        { t: '回國', canon: true, fx: (g) => { CN.setEdu(g, 'master', '海外碩士'); g.remember('lifePath', 'work'); CN.setJob(g, 'office', '外企職員'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 寫字樓'); }, res: (g) => '你落地' + g.recall('workCity') + '，第一頓吃的是火鍋。新工作' + payWord(g) + '。' },
        { t: '留在國外工作幾年', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '海外碩士'); g.remember('lifePath', 'work'); g.remember('abroadStay', true); CN.setJob(g, 'office', '在海外工作'); g.move('office', '國外 · 一家公司'); g.info('住处', '國外'); g.stat('人缘', -4); }, res: '你和家裡的影片，從每天變成了每週。' },
      ] }),
    dec({ id: 'y_grad23', age: 23, t: '研一', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '導師給你的第一個任務，是幫他報銷發票。研究生補助一個月 ¥1,500。',
      choices: [
        { t: '跟著導師做專案', canon: true, fx: (g) => { g.remember('gradWay', 'lab'); g.stat('学识', 6); g.stat('心情', -2); }, res: '你在實驗室過了兩個春節。' },
        { t: '多出去實習', dev: 10, fx: (g) => { g.remember('gradWay', 'intern'); CN.earn(g, 20000); g.stat('事业', 6); }, res: '你在一家公司實習了一年，攢下 ¥2 萬。走的時候主管說，畢業了來找我。' },
      ] }),
    dec({ id: 'y_rent', age: 23, t: '租房', loc: 'home', cond: (g) => working(g) && white(g) && tierNow(g) <= 3 && !g.recall('house') && !withParents(g) && !g.recall('abroadStay'),
      text: (g) => '在' + here(g) + '，' + payWord(g) + '。一個像樣的一居室，月租 ' + CN.fmt(RENT_M[tierNow(g)]) + '，押一付三。',
      choices: [
        { t: '合租，省錢', canon: true, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'share'); CN.earn(g, RENT_M[tierNow(g)] * 5); g.stat('心情', -2); }, res: (g) => '一個單間 ' + CN.fmt(RENT_M[tierNow(g)] * 0.55) + '。你和三個陌生人共用一個衛生間，早上要排隊。有個室友週末會做一大鍋紅燒肉，分你一碗。' },
        { t: '咬牙整租一個一居室', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'whole'); CN.pay(g, RENT_M[tierNow(g)] * 3); g.stat('心情', 4); }, res: '你買了一盆綠蘿放在窗臺上。下班回來，屋裡亮著你自己開的燈。' },
        { t: '住到郊區，通勤兩小時', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'far'); CN.earn(g, RENT_M[tierNow(g)] * 6); g.stat('健康', -3); }, res: (g) => '月租只要 ' + CN.fmt(RENT_M[tierNow(g)] * 0.5) + '。你在地鐵上看完了很多本書。' },
      ] }),
    dec({ id: 'y_love23', age: 23, t: '相親', loc: 'home', cond: (g) => working(g) && loveIs(g, 'single') && (rural(g) || county(g)),
      text: (g) => '過年回家，' + (g.alive('mo') ? '你媽' : '你姑') + '已經安排好了三場相親，一天一場。',
      choices: [
        { t: '去見，看著合適就處', canon: true, check: ['人缘', 40],
          fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '戀愛中'); g.stat('心情', 4); }, res: '第二場的那個人話不多，走的時候把你送到了巷子口。',
          fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -3); }, res: '三場都沒成。回去的路上，你給自己買了一串糖葫蘆。' } },
        { t: '一個都不去', dev: 15, fx: (g) => { g.remember('singleWay', 'refuse'); g.stat('心情', 2); g.stat('人缘', -4); }, res: '家裡人三天沒跟你說話。第四天早上，桌上還是給你留了一碗麵。' },
      ] }),
    dec({ id: 'y_save23', age: 23, t: '第一筆錢', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 15000 && !g.recall('abroadStay'),
      text: (g) => '工作這些年，卡里第一次有了 ' + CN.fmt(cash(g)) + '。午飯的時候，同事們在聊基金、聊股票，也有人說錢還是放銀行踏實。',
      choices: moneyChoices() }),

    /* ================= 24 岁：AI 来了 ================= */
    dec({ id: 'y_ai24', age: 24, t: '被替代', loc: 'office', cond: (g) => working(g) && AI_JOBS.includes(g.recall('job')) && !g.recall('abroadStay'),
      text: (g) => ({ tech: '公司上了一套新的寫程式碼的 AI，組裡裁了三分之一。', office: '你做的報表，現在 AI 幾秒鐘就能出。', sales: '客戶開始跟 AI 客服聊天了。', worker: '車間又進了一批機器人，一條線只要兩個人看著。', rider: '小區裡開始有無人車送外賣。', driver: '無人駕駛的貨車上了高速。' }[g.recall('job')]) + '你的位置有點懸。',
      choices: [
        { t: '學新東西，跟著變', canon: true, check: ['学识', 70],
          fx: (g) => { g.remember('aiMove', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); g.stat('事业', 5); if (['worker', 'rider', 'driver'].includes(g.recall('job'))) CN.setJob(g, 'worker', '機器人運維'); },
          res: '你花 ¥5,000 報了一個培訓班，熬了幾個月的夜，學會了怎麼跟機器打交道。你留下來了。',
          fail: { fx: (g) => { g.remember('aiMove', 'laid'); last.amt = r1000(perMonth(g) * 3); CN.earn(g, last.amt); g.stat('心情', -6); CN.setJob(g, 'freelance', '打零工'); }, res: (g) => '你還是被裁了。補償 ' + CN.fmt(last.amt) + '，你在公司樓下坐了一下午。晚上，' + (married(g) ? '家裡' : '朋友') + '給你煮了一碗麵。' } },
        { t: (g) => '轉行，去做 AI 訓練師（' + CN.jobLine(g, 'tech') + '）', dev: 15, fx: (g) => { g.remember('aiMove', 'switch'); CN.setJob(g, 'tech', 'AI 訓練師'); g.stat('事业', 3); }, res: (g) => '你的新工作是教機器說人話。聽起來有點好笑，' + payWord(g) + '。' },
        { t: (g) => '換個機器幹不了的活，去做護理（' + CN.jobLine(g, 'nurse') + '）', dev: 15,
          fx: (g) => { g.remember('aiMove', 'care'); CN.setJob(g, g.rnd() < 0.5 ? 'nurse' : 'freelance', g.rnd() < 0.5 ? '護工' : '家政'); g.stat('人缘', 5); },
          res: '你去照顧老人。他們記不住你的名字，記得你的聲音。' },
      ] }),
    dec({ id: 'y_steady24', age: 24, t: '安穩', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay'),
      text: (g) => ({ civil: '單位裡一眼能看到退休。', teacher: '你帶的第一屆學生畢業了。', doctor: '規培三年，你已經記不清上一次睡滿八個小時是什麼時候。', nurse: '夜班一個接一個。', shop: '店開了兩年，生意不好不壞。', creator: '粉絲漲到了一個平臺期。', soldier: '部隊的日子很規律。', farmer: '村裡年輕人越來越少。', freelance: '活有一陣沒一陣。', boss: '你手下有了五個人。' }[g.recall('job')] || '日子一天天過。') + '你在' + here(g) + payWord(g) + '。你問自己，就這樣了嗎。',
      choices: [
        { t: '就這樣，挺好', canon: true, fx: (g) => { g.remember('steady', 'stay'); g.stat('心情', 4); g.stat('事业', 2); }, res: (g) => (white(g) ? '你把辦公桌收拾得很整齊，' : '你把手頭的活安排得井井有條，') + '窗臺上養了一盆多肉。' },
        { t: '往上走，爭個位置', dev: 10, check: ['人缘', 50], fx: (g) => { g.remember('steady', 'up'); g.stat('事业', 8); g.stat('健康', -2); }, res: '你主動接了最難的活。年底，領導記住了你。', fail: { fx: (g) => { g.remember('steady', 'stuck'); g.stat('心情', -4); }, res: '位置給了別人。你在工位上坐了很久，下班去吃了一頓好的。' } },
        { t: '辭職，去更大的城市', dev: 20, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { g.remember('steady', 'move'); CN.goCity(g, tierNow(g) >= 3 ? 2 : 1, tierNow(g) >= 3 ? capital(g) : undefined); if (g.recall('job') !== 'tech') CN.setJob(g, 'office', '公司職員'); CN.pay(g, RENT_M[tierNow(g)] * 4); g.stat('心情', 3); },
          res: (g) => '你去了' + g.recall('workCity') + '。新工作' + payWord(g) + '，押一付三的房租一下交了 ' + CN.fmt(RENT_M[tierNow(g)] * 4) + '。沒人認識你，這讓你覺得輕鬆。' },
        { t: '辭職，回一座小一點的城市', dev: 15, cond: (g) => tierNow(g) <= 2,
          fx: (g) => { g.remember('steady', 'small'); CN.goCity(g, 3); if (!['civil', 'teacher', 'doctor', 'nurse'].includes(g.recall('job'))) CN.setJob(g, 'office', '公司職員'); g.stat('心情', 5); g.stat('健康', 2); },
          res: (g) => '你去了' + g.recall('workCity') + '。工資降到' + payWord(g).replace(/^.*?大概 /, '') + '，房租只要 ' + CN.fmt(RENT_M[3]) + '。下班的時候天還亮著。' },
      ] }),

    /* ================= 25 岁 ================= */
    dec({ id: 'y_grad_out', age: 25, t: '碩士畢業', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '答辯完，導師問你要不要接著讀博。',
      choices: [
        { t: '去工作', canon: true,
          fx: (g) => { CN.setEdu(g, 'master', '碩士'); g.remember('lifePath', 'work'); const m = g.recall('major'); CN.setJob(g, m === '計算機' ? 'tech' : m === '醫學' ? 'doctor' : 'office', m === '計算機' ? '演算法工程師' : m === '醫學' ? '醫生' : '研究員'); CN.goCity(g, g.recall('gradWay') === 'intern' ? 1 : 2); g.move('office', g.recall('workCity') + ' · 寫字樓'); },
          res: (g) => (g.recall('gradWay') === 'intern' ? '實習時的主管兌現了承諾。' : '你投了二十份簡歷，拿到三個面試。') + '你在' + g.recall('workCity') + '上班了，' + payWord(g) + '。' },
        { t: '讀博', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '碩士'); g.remember('lifePath', 'phd'); g.info('学历', '博士在讀'); g.stat('学识', 6); }, res: '你又在學校留了下來，補助一個月 ¥3,500。同學們開始結婚了。' },
      ] }),
    dec({ id: 'y_dating25', age: 25, t: '見家長', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => ({ campus: '你們從大學走到現在，', work: '你們在城裡互相照應了幾年，', blind: '相親認識一年多，', online: '從網上聊到線下，' }[g.recall('loveFrom')] || '在一起有一陣了，') + '對方說，該見見家長了。',
      choices: [
        { t: '帶回家見爸媽', canon: true, cond: (g) => parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: (g) => '你們拎著 ¥3,000 的禮回了家。' + (g.alive('mo') ? '你媽做了一桌子菜。對方吃了三碗飯，你媽很高興。' : '你爸下廚，菜鹹了一點。對方吃得乾乾淨淨。') },
        { t: '去對方家裡拜年', canon: true, cond: (g) => !parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: '你拎著禮去了對方家。對方的媽媽一直往你碗裡夾菜，說以後這裡也是你家。' },
        { t: '再等等，還沒想好', dev: 10, fx: (g) => { g.remember('metParents', false); g.stat('心情', -2); if (g.rnd() < 0.4) { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '單身'); } }, res: (g) => (loveIs(g, 'single') ? '對方沒再等。你們分開了。' : '對方沒說什麼，只是不太愛笑了。') },
      ] }),
    dec({ id: 'y_love25', age: 25, t: '一個人', loc: 'home', cond: (g) => loveIs(g, 'single') && g.recall('lifePath') !== 'phd',
      text: (g) => '朋友圈裡，有人結婚，有人曬娃。' + (withParents(g) ? '你下班回家，你媽在飯桌上又提了一句隔壁家的孩子。' : '你下班回家，點了一份 ¥25 的外賣。'),
      choices: [
        { t: '讓朋友介紹一個', canon: true, check: ['人缘', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '戀愛中'); g.stat('心情', 5); }, res: '朋友介紹的人很實在，第一次見面就聊到了房價。第二次見面，聊到了小時候。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '見了幾個，都沒下文。' } },
        { t: '在交友軟體上碰碰運氣', dev: 10, check: ['心情', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'online'); g.info('婚姻', '戀愛中'); g.stat('心情', 4); }, res: '你們聊了一個月才見面。見了以後，比照片好看。', fail: { fx: (g) => { g.remember('singleWay', 'app'); g.stat('心情', -4); }, res: '聊著聊著，對方開始推薦理財產品。你刪了軟體。' } },
        { t: '自己過也挺好', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 2000); g.stat('心情', 3); g.stat('事业', 2); }, res: '你花 ¥2,000 報了一個週末的陶藝課。第一隻碗歪得厲害，你還是用它吃飯。' },
      ] }),

    /* ================= 26 岁：结婚 ================= */
    dec({ id: 'y_marry', age: 26, t: '結婚', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => wedText(g) + '你看著對方，沒馬上說話。',
      choices: [
        { t: '結婚，按老家的規矩辦', canon: true,
          fx: (g) => { const w = wedPlan(g); CN.marry(g, { origin: { campus: '大學同學', work: '老鄉', blind: '相親認識', online: '網上認識' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 8); g.stat('人缘', 4); },
          res: (g) => '你和' + g.recall('spouse') + '結婚了。' + wedRes(g, last) },
        { t: '彩禮談不攏，先緩緩', dev: 15, cond: (g) => rural(g) || county(g), fx: (g) => { g.remember('caili', 'stuck'); g.stat('心情', -5); }, res: '兩家人不歡而散。那天晚上，對方還是給你發了一句“到家了嗎”。' },
        { t: '旅行結婚，不辦酒', dev: 15, fx: (g) => { CN.marry(g, { origin: '戀人' }); g.remember('caili', 'travel'); CN.pay(g, 15000); g.stat('人缘', -3); g.stat('心情', 6); }, res: '你們去了海邊，一趟花了 ¥1.5 萬，省下的錢存了起來。親戚們說你們不懂事。' },
        { t: '分手', dev: 20, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '單身'); g.stat('心情', -10); }, res: '你刪掉了相簿裡的照片，刪到一半停下了。' },
      ] }),
    dec({ id: 'y_career26', age: 26, t: '跳槽', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay') && ['office', 'tech', 'sales', 'boss'].includes(g.recall('job')),
      text: (g) => '獵頭打來電話。你現在' + payWord(g) + '，對方開的價，比這多三成。',
      choices: [
        { t: (g) => '跳（月薪多三成，到 ' + CN.fmt(r100(CN.jobPay(g, g.recall('job')) * 1.3)) + '左右；新公司試用期站不穩就得走）', dev: 10, check: ['事业', 30], fx: (g) => { g.remember('jumped', true); g.stat('事业', 8); }, res: (g) => '新公司的工位在二十八樓，能看見江。' + payWord(g) + '。', fail: { fx: (g) => { g.remember('jumped', false); g.stat('心情', -3); }, res: '面了三輪，沒了下文。' } },
        { t: (g) => '不動，穩著（現在約 ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + '/月，熟門熟路）', canon: true, fx: (g) => { g.remember('jumped', false); g.stat('事业', 3); g.stat('心情', 1); }, res: '你謝絕了。下個月，組長的位置給了你。' },
      ] }),
    dec({ id: 'y_side26', age: 26, t: '下班以後', loc: 'metro', cond: (g) => working(g) && !g.recall('abroadStay') && ['worker', 'rider', 'driver', 'shop', 'freelance', 'creator', 'nurse', 'farmer'].includes(g.recall('job')),
      text: (g) => '你' + payWord(g) + '。' + (kidN(g) || married(g) ? '家裡的開銷一年比一年大。' : '房租、吃飯、給家裡寄一點，月底剩不下多少。') + '身邊有人下了班還在乾點別的。',
      choices: [
        { t: '不折騰，下班就歇著', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('健康', 2); }, res: '晚上你去河邊走一圈，回來早早睡了。' },
        { t: '晚上接點零活，跑車跑腿', dev: 10, fx: (g) => { g.remember('side', 'drive'); g.stat('健康', -3); }, res: '你每天晚上多幹三個小時，一個月能多掙 ¥800 來塊。' },
        { t: '週末去夜市擺攤', dev: 15, fx: (g) => { g.remember('side', 'stall'); CN.pay(g, 3000); g.stat('人缘', 3); }, res: '小推車和貨花了 ¥3,000。你賣烤腸和手機殼，第一個晚上掙了 ¥160。' },
        { t: '學剪輯，接短影片的單子', dev: 15, check: ['学识', 50],
          fx: (g) => { g.remember('side', 'video'); CN.pay(g, 2000); g.stat('学识', 3); }, res: '網課 ¥2,000。三個月後，你接到了第一單，給一家飯館剪宣傳片。',
          fail: { fx: (g) => { CN.pay(g, 2000); g.stat('心情', -2); }, res: '網課 ¥2,000，看了一半就放下了。' } },
      ] }),

    dec({ id: 'y_car26', age: 26, t: '買車', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000 && !g.recall('abroadStay'),
      text: carText, choices: carChoices() }),
    /* ================= 27 岁：房子 ================= */
    dec({ id: 'y_house', age: 27, t: '買房', loc: 'home', cond: (g) => married(g) && !hasHouse(g) && !g.recall('abroadStay'),
      text: (g) => {
        const d = deal(g, buyTier(g), 0.7);
        return (g.recall('rentType') === 'share' ? '合租的日子過夠了。' : '') + (isMale(g) ? '丈母孃' : '婆婆') + '那邊說，沒房子心裡不踏實。'
          + '在' + buyPlace(g) + '，一套小兩居總價 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '。你們手裡有 ' + CN.fmt(cash(g)) + '，兩邊爸媽加起來能拿出 ' + CN.fmt(famHelp(g)) + '。';
      },
      choices: houseChoices(1.1, 0.7, '一套三居', '一套小兩居') }),
    dec({ id: 'y_marry27', age: 27, t: '再想想', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => (g.recall('caili') === 'stuck' ? '彩禮的事拖了一年。對方家裡鬆了口，說少要一些。' : '在一起好幾年了。身邊的人都在問什麼時候辦事。'),
      choices: [
        { t: '結婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: '處了好幾年' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '結婚了。喜糖是你自己挑的。' + wedRes(g, last) },
        { t: '分開', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '單身'); g.stat('心情', -8); }, res: '你們分開得很平靜，像兩個累了的人。' },
      ] }),
    dec({ id: 'y_back27', age: 27, t: '回不回去', loc: 'metro', cond: (g) => tierNow(g) <= 2 && g.recall('hukou') !== 'city' && !g.recall('abroadStay') && parentAlive(g),
      text: (g) => '你在' + here(g) + '待了好幾年，' + payWord(g) + '。' + parentWord(g) + '打電話越來越短，' + (g.alive('fa') ? CN.who(g, 'fa', true) + '的腰不好了。' : CN.who(g, 'mo', true) + '說一個人吃飯沒意思。'),
      choices: [
        { t: '留下，再拼幾年', canon: true, fx: (g) => { g.remember('backHome', 'no'); CN.pay(g, 3000); g.stat('事业', 4); g.stat('人缘', -2); }, res: (g) => '你給家裡寄了一個 ¥3,000 的按摩椅。' + parentWord(g) + '在影片裡坐上去，眯著眼說舒服。' },
        { t: '回老家', dev: 15, fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); if (!['civil', 'teacher', 'shop'].includes(g.recall('job'))) CN.setJob(g, 'office', '本地公司職員'); g.stat('心情', 5); g.stat('人缘', 4); }, res: (g) => '你回了' + g.recall('city') + '。工資降到' + payWord(g).replace(/^.*?大概 /, '') + '，晚飯是在家吃的。' },
      ] }),
    dec({ id: 'y_startup', age: 27, t: '創業', loc: 'office', cond: (g) => working(g) && (g.recall('uniSide') === 'project' || g.recall('family') === 'rich' || g.s('事业') >= 45),
      text: (g) => '一個老同學找到你，說有個想法，就差一個合夥人，要你拿出 ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + ' 入股。',
      choices: [
        { t: (g) => '辭職一起幹（入股 ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + '；成了收入翻幾倍，十家裡活下來一兩家）', dev: 25, check: ['事业', 50], fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'ok'); CN.setJob(g, 'boss', '創業公司合夥人'); g.stat('健康', -4); }, res: '第三年，公司拿到了融資。你請所有人吃了一頓燒烤。', fail: { fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'fail'); g.remember('debt', debtW(g) + 20); g.stat('心情', -8); }, res: '撐了兩年，公司沒了。入股的錢打了水漂，你還欠了 ¥20 萬。老同學請你吃了一頓飯，兩個人都沒怎麼說話。' } },
        { t: (g) => '算了，打工穩當（' + CN.jobLine(g, g.recall('job') || 'office') + '）', canon: true, fx: (g) => { g.remember('startup', 'no'); g.stat('心情', 1); }, res: '後來你在新聞裡看到了那家公司的名字。' },
      ] }),
    dec({ id: 'y_burnout27', age: 27, t: '加班', loc: 'office', cond: (g) => ['tech', 'office', 'doctor', 'boss'].includes(g.recall('job')),
      text: '連續三個月，你沒在十二點前睡過。體檢報告上有好幾個箭頭。',
      choices: [
        { t: '扛著，過了這陣再說', canon: true, fx: (g) => { g.remember('burnout', 'push'); g.stat('健康', -8); g.stat('事业', 6); CN.earn(g, 20000); }, res: '專案上線了，獎金 ¥2 萬。你在計程車上睡著了。' },
        { t: '降點要求，開始健身', dev: 15, fx: (g) => { g.remember('burnout', 'rest'); CN.pay(g, 3000); g.stat('健康', 6); g.stat('事业', -2); g.stat('心情', 3); }, res: '你辦了一張 ¥3,000 的健身卡，這次真的去了。' },
      ] }),

    /* ================= 28 岁：孩子 ================= */
    dec({ id: 'y_kid', age: 28, t: '要孩子', loc: 'home', cond: (g) => married(g) && kidN(g) === 0,
      text: (g) => '結婚兩年了。' + (g.alive('mo') ? '你媽每次打電話都要繞到這件事上。' : '') + (g.recall('house') === 'rent' ? '你們還租著房。' : '') + '你算了一筆賬：生孩子自己要掏 ¥2 萬左右，托育一個月 ¥3,000。',
      choices: [
        { t: '要一個，請老人幫忙帶', canon: true, cond: (g) => parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'grand'); CN.haveKid(g); CN.pay(g, 20000); if (!withParents(g)) CN.liveWith(g, [g.alive('mo') ? 'mo' : 'fa']); g.stat('心情', 4); g.stat('健康', isMale(g) ? 0 : -4); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。' + CN.who(g, g.alive('mo') ? 'mo' : 'fa') + '搬來幫著帶，家裡一下子熱鬧了。你抱著' + CN.he(g, 'k1') + '，手都不知道往哪放。' },
        { t: '要一個，送托育', canon: true, cond: (g) => !parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'paid'); CN.haveKid(g); CN.pay(g, 20000 + 36000); g.stat('心情', 4); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。一歲起送了托育，一年 ¥3.6 萬。老師每天發一張照片，你存了滿滿一相簿。' },
        { t: '要一個，家裡留一個人全職帶', dev: 15,
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'home'); CN.haveKid(g); CN.pay(g, 20000); if (isMale(g)) g.remember('spWork', 'home'); else { g.remember('preKidJob', [g.recall('job'), JY.engine.get().L.info['职业'] || '上班']); CN.setJob(g, 'none', '全職媽媽'); } g.stat('心情', 3); },
          res: (g) => '孩子出生了，叫' + g.name('k1') + '。' + (isMale(g) ? g.recall('spouse') + '辭了工作在家帶孩子，家裡只剩你一份工資。' : '你辭了工作在家帶孩子，家裡只剩' + g.recall('spouse') + '一份工資。') + '日子緊了，' + CN.he(g, 'k1') + '第一次笑出聲那天，全家都在。' },
        { t: '再等兩年', dev: 10, fx: (g) => { g.remember('kidPlan', 'wait'); g.stat('事业', 3); }, res: '你們說好了，等工作穩一點再說。' },
        { t: '不要孩子', dev: 25, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); g.stat('人缘', -5); }, res: '兩邊的老人都不說話了。你們養了一隻貓。' },
      ] }),
    dec({ id: 'y_single28', age: 28, t: '被催', loc: 'home', cond: (g) => single(g),
      text: (g) => '過年回家，飯桌上七大姑八大姨輪著問。' + (g.recall('singleWay') === 'self' ? '你早就想好了怎麼回答。' : '你低頭吃菜。'),
      choices: [
        { t: '答應家裡，再去相親', canon: true, check: ['人缘', 40], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '戀愛中'); g.stat('人缘', 3); }, res: '這次的人還不錯，知道你不吃香菜。你們約了第二次。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -4); }, res: '又沒成。你媽說，不急，慢慢來。' } },
        { t: '不急，過好自己的日子', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 3); g.stat('人缘', -3); }, res: (g) => (away(g) ? '你初二就回了城，過了個清靜年。' : '你初二就躲去朋友家喝茶，過了個清靜年。') },
      ] }),

    /* ================= 29 岁 ================= */
    dec({ id: 'y_phd_out', age: 29, t: '博士畢業', loc: 'campus', cond: (g) => g.recall('lifePath') === 'phd',
      text: '論文終於過了。你二十九歲，第一次領到一份正式工資之前，先看到了一張教職的招聘啟事。',
      choices: [
        { t: '去高校當老師', canon: true, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'teacher', '大學講師'); CN.goCity(g, 2); g.move('campus', g.recall('workCity') + ' · 一所大學'); g.stat('事业', 8); CN.earn(g, 100000); }, res: (g) => '學校給了 ¥10 萬安家費。你分到一間和別人共用的辦公室，' + payWord(g) + '。' },
        { t: '去企業做研發', dev: 10, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'tech', '研發工程師'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 研發中心'); }, res: (g) => payWord(g).replace(/^每月到手/, '月薪') + '，比你讀博五年的補助加起來還多。' },
      ] }),
    dec({ id: 'y_marry29', age: 29, t: '定下來', loc: 'home', cond: (g) => loveIs(g, 'dating') && g.since('love') >= 1,
      text: (g) => '你們處了一年多。' + wedText(g),
      choices: [
        { t: '結婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.8); CN.marry(g, { origin: { campus: '大學同學', work: '同事', blind: '相親認識', online: '網上認識' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '結婚了。' + wedRes(g, last) },
        { t: '領個證，不辦酒', dev: 15, fx: (g) => { CN.marry(g, { origin: '處了一年多' }); g.remember('caili', 'travel'); CN.pay(g, 5000); g.stat('心情', 4); g.stat('人缘', -2); }, res: '領證那天你們吃了一頓 ¥500 的飯，拍了一張合照發在家族群裡。' },
        { t: '分開', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '單身'); g.stat('心情', -6); }, res: '你們好好吃了最後一頓飯，各自回家。' },
      ] }),
    dec({ id: 'y_house29', age: 29, t: '要不要上車', loc: 'home', cond: (g) => !hasHouse(g) && !g.recall('abroadStay') && working(g) && (married(g) || cash(g) >= deal(g, buyTier(g), 0.45).down * 0.5),
      text: (g) => {
        const d = deal(g, buyTier(g), married(g) ? 0.7 : 0.45);
        return (married(g) ? '房東要賣房，讓你們三個月內搬走。' : '一個人在' + here(g) + '，你攢下了 ' + CN.fmt(cash(g)) + '。中介說現在的價格是十年來最低的。')
          + (married(g) ? '一套小兩居' : '一套一居室') + '總價 ' + CN.fmt(d.price * 1e4) + '，首付 ' + CN.fmt(d.down) + '。';
      },
      choices: houseChoices((g) => (married(g) ? 1 : 0.7), (g) => (married(g) ? 0.7 : 0.45), '一套大一點的', '一套小的') }),
    dec({ id: 'y_parents29', age: 29, t: '爸媽', loc: 'home', cond: (g) => parentAlive(g) && !withParents(g) && !g.recall('parentsIn'),
      text: (g) => (g.alive('fa') ? CN.who(g, 'fa', true) + '體檢查出了高血壓。' : CN.who(g, 'mo', true) + '一個人在老家。') + '你看著影片裡的' + (g.alive('fa') ? '他' : '她') + '，頭髮白了一大半。',
      choices: [
        { t: '多寄點錢，常打電話', canon: true, fx: (g) => { g.remember('parentsNear', 'far'); CN.pay(g, 12000); g.stat('人缘', 2); }, res: '你每個月給家裡打 ¥1,000，又設了一個每週日晚上的鬧鐘，提醒自己打電話。' },
        { t: '把爸媽接到身邊住', dev: 15,
          fx: (g) => { g.remember('parentsNear', 'with'); CN.liveWith(g, aliveParents(g)); if (!hasHouse(g)) CN.pay(g, (RENT_M[tierNow(g)] || 1500) * 6); g.stat('人缘', 5); g.stat('心情', -2); },
          res: (g) => (hasHouse(g) ? '' : '你換了一套大一點的房子，每個月多交 ' + CN.fmt((RENT_M[tierNow(g)] || 1500) / 2) + ' 房租。') + '家裡多了' + (aliveParents(g).length > 1 ? '兩個人' : '一個人') + '，飯桌上多了幾盤菜，也多了一些爭吵。' },
        { t: '辭了工作回去', dev: 25, cond: (g) => away(g),
          fx: (g) => { g.remember('parentsNear', 'back'); g.remember('backHome', 'parents'); goBack(g); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '回鄉務農' : '在縣城做點小生意'); g.stat('人缘', 6); g.stat('心情', 2); },
          res: (g) => '你回來那天，' + (g.alive('mo') ? '你媽' : '你爸') + '在村口等了一下午。掙得少了，你每天都能見到' + parentWord(g) + '。' },
      ] }),


    dec({ id: 'y_promo29', age: 29, t: '升職', loc: 'office', cond: (g) => working(g) && EMPLOYEE.includes(g.recall('job')),
      text: (g) => ({ civil: '科裡空出一個副科的位置。', teacher: '學校要選一個年級組長。', doctor: '科裡要定一個醫療組長。', nurse: '護士長要調走了。', worker: '車間主任要退休了。', rider: '站長問你要不要當個小組長。', driver: '車隊要提一個排程。', soldier: '連裡空出一個副職。', tech: '組長跳槽走了，位置空著。', sales: '大區經理的位子空出來了。' }[g.recall('job')] || '部門裡空出一個小主管的位置。')
        + '你現在是' + jobTitle(g) + '，自己一個月約 ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + '。' + (hiEdu(g) ? '' : '一起競爭的人裡，好幾個學歷比你高。'),
      choices: [
        { t: (g) => '爭管理崗（升上去約 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + '/月，會多，背指標）', canon: true, cond: hiEdu, check: ['事业', 40], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: '沒輪上你。你照常上班，只是話少了。' } },
        { t: (g) => '爭管理崗（升上去約 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + '/月；學歷吃虧，得拿業績說話）', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 52], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: '位置給了一個研究生。你把業績表又看了一遍，覺得自己不差。' } },
        { t: (g) => '走專業路線，考' + EXPERT[g.recall('job')] + '（考下來約 ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 6)) + '/月，不用管人，要啃書）', dev: 10, cond: (g) => !!EXPERT[g.recall('job')], check: ['学识', 62],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, g.recall('job'), EXPERT[g.recall('job')]); g.remember('promoted', true); g.remember('ladder', 'expert'); g.stat('事业', 6); g.stat('学识', 3); },
          res: (g) => '報班、考試花了 ¥3,000。證書下來那天，你成了' + EXPERT[g.recall('job')] + '，' + payWord(g).replace(/^.*?大概/, '現在每月大概') + '。難辦的活開始點名找你。',
          fail: { fx: (g) => { CN.pay(g, 3000); upFail(g); }, res: '考了兩回，差一點。¥3,000 的報名費和書錢，你說就當交了學費。' } },
        { t: (g) => '去外地分部，升一級（約 ' + CN.fmt(CN.jobPay(g, g.recall('job'), tierNow(g) === 1 ? 2 : 1, 10)) + '/月，' + (married(g) ? '家裡得跟著搬' : '人生地不熟') + '）', dev: 20, cond: (g) => ['office', 'tech', 'sales'].includes(g.recall('job')),
          fx: (g) => { const c = tierNow(g) === 1 ? CN.goCity(g, 2) : CN.goCity(g, 1, CN.pick(['上海', '深圳', '北京', '杭州', '廣州'].filter((x) => x !== here(g)))); g.move('office', c + ' · 分部'); CN.setJob(g, g.recall('job'), '分部負責人'); g.remember('promoted', true); g.remember('ladder', 'move'); g.stat('事业', 10); g.stat('人缘', -2); },
          res: (g) => '你調去了' + here(g) + '，當上了分部負責人，' + payWord(g) + '。' + (married(g) ? g.recall('spouse') + '跟著辭了工作，在新城市重新找。' : '行李不多，一個箱子就裝完了。') },
        { t: '讓給別人，圖個輕鬆', dev: 10, fx: (g) => { g.remember('promoted', false); g.remember('ladder', 'no'); g.stat('心情', 3); g.stat('健康', 2); }, res: (g) => '你準點下班，' + (kidN(g) && g.recall('custody') !== 'ex' ? '去幼兒園接孩子。' : '去公園走兩圈。') },
      ] }),

    /* ================= 30 岁是人生关口，这里只写自动节点 ================= */
    { id: 'y_turn30', age: 30, t: '三十歲', auto: true,
      text: (g) => (married(g) ? (kidN(g) && g.alive('k1') && g.ageOf('k1') >= 2 ? g.name('k1') + '給你畫了一張生日卡，你被畫成了一個圓。' : '你和' + g.recall('spouse') + '吃了一頓火鍋，算是過生日。')
        : withParents(g) ? (g.alive('mo') ? '三十歲生日，你媽給你煮了一碗長壽麵，臥了兩個蛋。' : '三十歲生日，你爸買了一個蛋糕，插錯了蠟燭。')
        : '三十歲生日，你給自己煮了一碗長壽麵。朋友們在群裡發了一串紅包，你一個個點開。') },

    /* ================= 31 岁 ================= */
    dec({ id: 'y_backwork31', age: 31, t: '回去上班', loc: 'home', cond: (g) => married(g) && g.recall('kidCare') === 'home' && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + '要上幼兒園了。' + (isMale(g) ? g.recall('spouse') + '在家帶了幾年孩子，' : '你在家帶了幾年孩子，') + '家裡一年只進賬 ' + CN.fmt(CN.income(g)) + '。',
      choices: [
        { t: '回去上班', canon: true,
          fx: (g) => { g.remember('kidCare', 'back'); if (isMale(g)) g.remember('spWork', ''); else { const p = g.recall('preKidJob') || ['office', '公司職員']; CN.setJob(g, p[0] === 'none' ? 'office' : p[0], p[1]); } },
          res: (g) => (isMale(g) ? g.recall('spouse') + '找了份工作，' : '你找回了工作，') + '兩個人' + payWord(g).replace(/^.*?大概/, '每月加起來大概') + '。第一天上班前，' + g.name('k1') + '在門口揮了很久的手。' },
        { t: '再帶幾年', dev: 10, fx: (g) => { g.remember('kidCare', 'stay'); g.stat('心情', 2); }, res: '孩子小的時候就這幾年。你們把賬算得更細了，週末去公園，不去商場。' },
      ] }),
    dec({ id: 'y_kid31', age: 31, t: '孩子的事', loc: 'home', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') !== 'dink',
      text: (g) => (g.recall('kidPlan') === 'wait' ? '說好等兩年，三年過去了。' : '結婚幾年了，一直沒有孩子。') + (isMale(g) ? '' : '醫生說，年紀越大越不容易。'),
      choices: [
        { t: '要', canon: true, check: ['健康', 40], fx: (g) => { g.remember('kidPlan', 'now'); CN.haveKid(g); CN.pay(g, 20000); g.stat('心情', 4); }, res: (g) => '孩子出生了，叫' + g.name('k1') + '。住院加產檢花了 ¥2 萬。你在產房外面走了幾百個來回。', fail: { fx: (g) => { g.remember('kidPlan', 'trying'); CN.pay(g, 10000); g.stat('心情', -6); }, res: '一直沒懷上。你們去了幾次醫院，檢查花了 ¥1 萬。' } },
        { t: '算了，兩個人過', dev: 20, fx: (g) => { g.remember('kidPlan', 'dink'); CN.pay(g, 12000); g.stat('心情', 2); g.stat('人缘', -3); }, res: '你們拿 ¥1.2 萬報了一個旅行團，在雪山腳下拍了一張合影。' },
      ] }),
    dec({ id: 'y_crisis31', age: 31, t: '吵架', loc: 'home', cond: (g) => married(g) && g.since('love') >= 3,
      text: (g) => '你和' + g.recall('spouse') + '為了' + (kidN(g) ? '誰去開家長會' : g.recall('house') === 'mortgage' ? '房貸' : '一點小事') + '吵了一架，吵完各睡各的。',
      choices: [
        { t: '先低頭，好好說', canon: true, fx: (g) => { g.remember('fight', 'talk'); g.stat('人缘', 4); g.stat('心情', 2); }, res: '第二天早上，你多煮了一個雞蛋。' },
        { t: '冷著，誰也不理誰', dev: 10, fx: (g) => { g.remember('fight', 'cold'); g.stat('心情', -5); }, res: '冷了一個星期。後來也就過去了，只是有些話再沒說過。' },
        { t: '這日子過不下去，離', dev: 25,
          fx: (g) => {
            g.remember('fight', 'split'); g.remember('love', 'divorced'); g.info('婚姻', '離異'); g.unrel(CN.sexOf(g) === '男' ? '妻子' : '丈夫');
            last.sold = ['mortgage', 'own'].includes(g.recall('house')); if (last.sold) CN.sellHouse(g);
            CN.withdraw(g); last.amt = r1000(Math.max(0, cash(g)) / 2); CN.pay(g, last.amt);
            if (kidN(g)) g.remember('custody', isMale(g) === (g.rnd() < 0.3) ? 'me' : 'ex');
            g.stat('心情', -8);
          },
          res: (g) => '民政局門口排著隊。' + (last.sold ? '房子賣了，' : '') + '家裡的錢一人一半，你給出去 ' + CN.fmt(last.amt) + '。' + (kidN(g) ? (g.recall('custody') === 'me' ? '孩子跟你。' : '孩子跟了對方。') : '') + '你們簽完字，各走各的。' },
      ] }),

    /* ================= 32 岁 ================= */
    dec({ id: 'y_kid2', age: 32, t: '二胎', loc: 'home', cond: (g) => married(g) && kidN(g) === 1 && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + (g.ageOf('k1') >= 3 ? '上幼兒園了，' : '會說整句話了，') + '回來問你，別的小朋友都有弟弟妹妹，' + CN.he(g, 'k1') + '為什麼沒有。再養一個，一年要多花 ¥3 萬上下。',
      choices: [
        { t: '一個就夠了', canon: true, fx: (g) => { g.remember('kid2', 'no'); g.stat('心情', 1); }, res: '你們把全部的心思放在一個孩子身上。' },
        { t: '再要一個', dev: 15, fx: (g) => { g.remember('kid2', 'yes'); CN.haveKid(g); CN.pay(g, 20000); g.stat('健康', -3); g.stat('心情', 3); }, res: (g) => '老二出生了，叫' + g.name('k2') + '。家裡從此沒有安靜的時候。' + g.name('k1') + '趴在床邊看了很久，說要把玩具分給' + CN.he(g, 'k2') + '一半。' },
      ] }),
    dec({ id: 'y_marry32', age: 32, t: '在一起', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: '你們在一起有幾年了。兩個人都不年輕了，有天晚上散步，對方問你，要不要就這樣過一輩子。',
      choices: [
        { t: '結婚', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: '處了好幾年' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '結婚了。' + wedRes(g, last) },
        { t: '就這樣談著，不領證', dev: 20, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 2); }, res: '你們各自留著各自的房子，週末在一起吃飯。' },
      ] }),
    dec({ id: 'y_single32', age: 32, t: '三十二歲', loc: 'home', cond: (g) => single(g),
      text: (g) => (loveIs(g, 'divorced') ? '離婚一年了。' : '')
        + (CN.alone(g) ? '你一個人住。週末去菜市場，攤主已經認識你了，會給你多抓一把蔥。'
          : withParents(g) ? '你還和' + parentWord(g) + '住在一起。晚飯桌上，' + parentWord(g) + '又提起了誰家的孩子結婚了。'
          : CN.youHh(g) + '。週末去菜市場，攤主已經認識你了。'),
      choices: [
        { t: '有人介紹，就見見', canon: true, check: ['人缘', 45], fx: (g) => { CN.marry(g, { origin: '朋友介紹' }); g.remember('lateMarry', 'match'); CN.pay(g, 30000); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '處了半年就結了婚，請兩家人吃了幾桌，花了 ¥3 萬。兩個人都不年輕了，沒那麼多講究。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '沒成。你也沒太難過，回家給自己炒了兩個菜。' } },
        { t: '就這樣過，挺自在', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 3000); g.stat('心情', 4); }, res: '你花 ¥3,000 給自己買了一套好點的鍋。' },
      ] }),
    dec({ id: 'y_biz32', age: 32, t: '自己幹', loc: 'metro',
      cond: (g) => working(g) && !['boss', 'shop', 'creator', 'farmer'].includes(g.recall('job')) && g.recall('startup') !== 'ok' && !g.recall('abroadStay') && (cash(g) >= 20000 || !!g.recall('skill') || !!g.recall('side')),
      text: (g) => bizText(g) + '你現在是' + jobTitle(g) + '，' + payWord(g) + '，卡里有 ' + CN.fmt(cash(g)) + '。',
      choices: [
        { t: '晚上擺個小吃攤（本錢 ¥2 萬，白天照常上班，掙多少看手藝和地段）', dev: 15, check: ['人缘', 45],
          fx: (g) => { last.lend = fund(g, 20000); g.remember('biz', 'stall'); g.remember('side', 'stall'); g.stat('健康', -2); },
          res: (g) => '推車、爐子、第一批貨，一共 ¥2 萬' + (last.lend ? '，其中 ' + CN.fmt(last.lend) + ' 是借的' : '') + '。你賣' + pk(g, ['烤冷麵', '炸串', '手抓餅', '涼皮', '煎餅'], 4) + '，第一個月刨去成本掙了 ¥3,000 多。',
          fail: { fx: (g) => { last.lend = fund(g, 20000); CN.earn(g, 6000); g.remember('biz', 'stallFail'); g.stat('心情', -4); }, res: '擺了半年，趕上一個多雨的夏天，攤位又挪了兩回。你把推車 ¥6,000 轉給了別人，算下來虧了一萬多。' } },
        { t: '開網店，做直播帶貨（本錢 ¥3 萬，十家裡能活下來兩三家）', dev: 20, check: ['人缘', 55],
          fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'online'); g.stat('健康', -2); },
          res: (g) => '樣品、補光燈、投流，先花了 ¥3 萬' + (last.lend ? '，' + CN.fmt(last.lend) + ' 是借的' : '') + '。你賣' + pk(g, ['老家的土特產', '自己挑的童裝', '小家電', '手工飾品'], 5) + '，下了班就開播，第三個月開始有回頭客。',
          fail: { fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'onlineFail'); g.stat('心情', -4); }, res: '直播間常常只有十幾個人。三個月後你停了播，¥3 萬變成了陽臺上的幾箱貨，送了一年親戚朋友。' } },
        { t: (g) => '加盟一家連鎖' + frKind(g) + '（加盟費、裝修、押金一共 ' + CN.fmt(frCost(g)) + (cash(g) - 10000 < frCost(g) ? '，要借 ' + CN.fmt(r1000(frCost(g) - Math.max(0, cash(g) - 10000))) : '') + '，順利的話兩三年回本）', dev: 25,
          cond: (g) => cash(g) >= frCost(g) * 0.4, check: ['事业', 45],
          fx: (g) => { const k = frKind(g); last.lend = fund(g, frCost(g)); g.remember('bizKind', k); g.remember('biz', 'franchise'); CN.setJob(g, 'boss', k + '加盟店老闆'); g.stat('心情', 3); },
          res: (g) => '你辭了工作，開了一家' + g.recall('bizKind') + '。' + (last.lend ? '借來的 ' + CN.fmt(last.lend) + ' 寫了借條。' : '') + '頭一年刨去房租和人工，你自己拿到手的，比上班時略多一點。',
          fail: { fx: (g) => { const k = frKind(g); const c = frCost(g); last.lend = fund(g, c); last.amt = r1000(c * 0.3); CN.earn(g, last.amt); g.remember('bizKind', k); g.remember('biz', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => '店開了十個月，門口的人流比總部說的少一半。你把店轉了出去，只收回 ' + CN.fmt(last.amt) + '。' + (debtW(g) ? '還欠著 ' + CN.fmt(debtW(g) * 1e4) + '，' : '') + '你回去接著上班。' } },
        { t: '想想就算了，上班穩當', canon: true, fx: (g) => { g.remember('biz', 'no'); g.stat('心情', 1); }, res: '你在夜市買了一份烤冷麵，邊走邊吃。挺好吃，你沒再多想。' },
      ] }),

    /* ================= 33 岁 ================= */
    dec({ id: 'y_ivf33', age: 33, t: '醫院', loc: 'hospital', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') === 'trying',
      text: '跑了兩年醫院。醫生說，可以試試試管，一個週期大概 ¥4 萬，不一定一次成。',
      choices: [
        { t: '做試管，再試一次', canon: true, check: ['健康', 45],
          fx: (g) => { CN.pay(g, 60000); CN.haveKid(g); g.remember('kidPlan', 'now'); g.stat('心情', 6); },
          res: (g) => '做了兩個週期，花了 ¥6 萬。孩子終於來了，叫' + g.name('k1') + '。你在醫院走廊裡哭了一場。',
          fail: { fx: (g) => { CN.pay(g, 40000); g.remember('kidPlan', 'dink'); g.stat('心情', -5); }, res: '花了 ¥4 萬，沒成。回家的路上，你們手拉著手，誰也沒說話。後來你們說好了，兩個人也是一家人。' } },
        { t: '不再去醫院了，順其自然', dev: 15, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); }, res: '你們把醫院的單子收進了抽屜，週末去爬了一次山。' },
      ] }),
    dec({ id: 'y_debt33', age: 33, t: '還賬', loc: 'home', cond: (g) => debtW(g) >= 40,
      text: (g) => '每個月一號，工資進卡，房貸出卡，中間只停留幾分鐘。你還欠著 ' + CN.fmt(debtW(g) * 1e4) + '。' + (g.recall('startup') === 'fail' ? '創業欠的錢還沒還完。' : ''),
      choices: [
        { t: '咬牙還，什麼都省', canon: true, fx: (g) => { g.remember('frugal', true); if (cash(g) >= 70000) { CN.pay(g, 50000); g.remember('debt', Math.max(0, debtW(g) - 5)); } g.stat('心情', -3); }, res: (g) => (cash(g) >= 20000 ? '你提前還了 ¥5 萬。' : '') + '你不再點外賣，開始自己帶飯。飯盒是你媽給的，用了很多年。' },
        { t: '晚上跑網約車多掙點', dev: 10, cond: (g) => g.recall('side') !== 'drive', fx: (g) => { g.remember('nightJob', true); g.remember('side', 'drive'); g.stat('健康', -5); }, res: '一個月多掙 ¥2,000 來塊。你認識了城裡凌晨兩點的每一條路。' },
        { t: '賣了房，無債一身輕', dev: 20, cond: (g) => g.recall('house') === 'mortgage', fx: (g) => { CN.sellHouse(g); g.remember('soldHouse', true); g.stat('心情', 6); }, res: (g) => '房子賣了，還清貸款，手裡剩下 ' + CN.fmt(cash(g)) + '。簽完字那天，你睡了一個好覺。' },
      ] }),
    dec({ id: 'y_car33', age: 33, t: '買車', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000, text: carText, choices: carChoices() }),
    dec({ id: 'y_money33', age: 33, t: '閒錢', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 30000,
      text: (g) => '你卡里有 ' + CN.fmt(cash(g)) + '，一直放著沒動。銀行的客戶經理打來第三個電話，說有幾款產品適合你。',
      choices: moneyChoices() }),
    dec({ id: 'y_friend33', age: 33, t: '老朋友', loc: 'home', cond: (g) => true,
      text: (g) => (['uni', 'college', 'grad', 'phd'].includes(g.recall('lifePath')) || g.recall('uni') ? '大學' : '早年打工') + '時最好的朋友要結婚了，在離' + here(g) + '很遠的地方。那天你也要加班。',
      choices: [
        { t: '請假去', canon: true, fx: (g) => { g.remember('oldFriend', 'went'); CN.pay(g, 4000); g.stat('人缘', 5); g.stat('事业', -1); }, res: '路費加份子錢 ¥4,000。婚禮上你哭了，比新人哭得還厲害。' },
        { t: '轉個紅包', dev: 10, fx: (g) => { g.remember('oldFriend', 'red'); CN.pay(g, 1000); g.stat('人缘', -2); }, res: '你轉了 ¥1,000。對方回了一個“謝謝”。後來你們很少聯絡了。' },
      ] }),

    /* ================= 34 岁：三十五岁之前 ================= */
    dec({ id: 'y_last34', age: 34, t: '三十五歲之前', loc: 'office', cond: (g) => working(g) && !['civil', 'teacher', 'doctor', 'soldier', 'farmer', 'retired', 'none'].includes(g.recall('job')),
      text: (g) => '明年就三十五了。招聘啟事上寫著“三十五歲以下”。' + (g.recall('aiMove') === 'switch' ? '你轉行做的這一行，年輕人越來越多。' : g.recall('promoted') ? '你帶著一個小團隊，也帶著一份不安。' : '你在現在的位置上已經好幾年了。'),
      choices: [
        { t: (g) => '考個編，求個穩（' + CN.jobLine(g, 'civil') + '）', dev: 10, check: ['学识', 80], fx: (g) => { g.remember('last34', 'civil'); CN.setJob(g, 'civil', '事業單位職員'); g.stat('心情', 4); }, res: (g) => '你考上了最後一年還能報的崗位。' + payWord(g) + '，比原來少，心裡踏實。', fail: { fx: (g) => { g.remember('last34', 'stay'); g.stat('心情', -3); }, res: '差了兩分。你回到工位上，把准考證收進了抽屜。' } },
        { t: '守住現在的位置', canon: true, fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 3); g.stat('健康', -2); }, res: '你比以前更早到公司，更晚走。' },
        { t: (g) => '自己出來單幹（' + CN.jobLine(g, g.recall('skill') ? 'shop' : 'boss') + '）', dev: 20, fx: (g) => { g.remember('last34', 'own'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.6, 100000)); CN.pay(g, last.amt); CN.setJob(g, g.recall('skill') ? 'shop' : 'boss', g.recall('skill') ? '開店' : '個體老闆'); g.stat('心情', 4); }, res: (g) => '你拿出 ' + CN.fmt(last.amt) + '，註冊了一家小公司，法人代表寫的是你的名字。' },
      ] }),
    dec({ id: 'y_last34b', age: 34, t: '回頭看', loc: 'home', cond: (g) => true,
      text: '你翻到一張十八歲時的照片。那時候你以為三十四歲是很老的年紀。',
      choices: [
        { t: '日子是自己選的，接著過', canon: true, fx: (g) => { g.remember('look34', 'ok'); g.stat('心情', 3); }, res: '你把照片夾回了相簿。' },
        { t: '想再學點東西', dev: 10, fx: (g) => { g.remember('look34', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); }, res: '你花 ¥5,000 報了一個週末的課。教室裡大多是比你小的人。' },
      ] }),

    /* ================= 自动节点：让日子有血有肉 ================= */
    { id: 'y_firstpay', age: 22, t: '第一份工資', auto: true, cond: (g) => working(g) && g.since('job') === 0 && !g.recall('workStyle') && !g.recall('army') && !['farmer', 'soldier', 'none'].includes(g.recall('job') || 'none'),
      text: (g) => '第一個月的工資到賬，' + CN.fmt(perMonth(g)) + '。你給' + (g.alive('mo') ? '媽' : '家裡') + '轉了一筆錢。' + (g.recall('uniSide') === 'money' ? '你早就習慣了自己掙錢。' : '對方回了一句“自己留著花”，又回了一句“謝謝寶貝”。') },
    { id: 'y_army_life', age: 19, t: '新兵連', auto: true, cond: (g) => g.recall('lifePath') === 'army',
      text: '新兵連三個月，你學會了三分鐘疊好被子，學會了在雪地裡站一個小時不動。' },
    { id: 'y_newyear24', age: 24, t: '過年', auto: true, cond: (g) => away(g) && !g.recall('abroadStay'),
      text: (g) => '春運搶票，你守著手機搶了一晚上。回到' + home(g) + '，' + (married(g) ? (kidN(g) ? '親戚們搶著抱孩子。' : '親戚們問你什麼時候要孩子。') : loveIs(g, 'dating') ? '親戚們問你什麼時候結婚。' : '親戚們問你有沒有物件。') + (g.alive('mo') ? '你媽往你箱子裡塞了兩袋臘腸。' : '') },
    { id: 'y_wedding_day', age: 26, t: '婚禮', auto: true, cond: (g) => married(g) && g.since('love') === 0,
      text: (g) => (g.recall('caili') === 'paid' ? (g.alive('fa') ? '婚禮上，你爸喝多了，拉著親家的手一直說“孩子交給你們了”。' : '婚禮上，你媽紅著眼圈，給每一桌都敬了酒。') : g.recall('caili') === 'travel' ? '你們在海邊拍了一張合影，就算是婚紗照。' : '婚禮很簡單。你記得那天的風很大。') },
    { id: 'y_abroad_back', age: 28, t: '回國', auto: true, cond: (g) => !!g.recall('abroadStay'),
      fx: (g) => { g.remember('abroadStay', false); CN.goCity(g, 1); CN.setJob(g, 'office', '外企中層'); g.stat('人缘', 3); },
      text: (g) => '在國外待了幾年，你還是回來了。落地' + g.recall('workCity') + '，空氣裡有一股熟悉的味道。新工作' + payWord(g) + '。' },
    { id: 'y_baby_night', age: 29, t: '夜裡', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') <= 2 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + '夜裡哭醒三次。你抱著' + CN.he(g, 'k1') + '在客廳裡走，走到天亮。' + CN.he(g, 'k1') + '睡著的時候，攥著你的一根手指。' },
    { id: 'y_kid_school', age: 33, t: '上幼兒園', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') === 3 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + '第一天上幼兒園，哭著不撒手。你在門口站了一上午。放學的時候，' + CN.he(g, 'k1') + '舉著一朵小紅花跑出來。' },
    { id: 'y_grandparent', age: 25, t: '老人', auto: true, cond: (g) => !g.alive('gm') && !g.alive('gp'),
      text: (g) => (g.recall('leftBehind') ? '你小時候是爺爺奶奶帶大的。他們都走了以後，老家的房子空著，院子裡長滿了草。' : '爺爺奶奶都不在了。過年回去，少了兩個人催你吃飯。') },
    { id: 'y_rider_rain', age: 21, t: '暴雨', auto: true, cond: (g) => g.recall('job') === 'rider',
      fx: (g) => { if (g.rnd() < 0.08) { g.stat('健康', -20); g.remember('riderHurt', true); CN.pay(g, 5000); } },
      text: (g) => (g.recall('riderHurt') ? '暴雨天你摔了車，小腿縫了十幾針，醫藥費 ¥5,000。站長說這單不算超時，還給你送了一箱牛奶。' : '暴雨天，單子翻了一倍。你在雨裡跑了一天，掙了 ¥600，到家時鞋裡能倒出水。') },
    { id: 'y_save_worker', age: 23, t: '腳手架', auto: true, cond: (g) => g.recall('job') === 'worker' && g.recall('stayCity'),
      fx: (g) => { if (g.rnd() < 0.15) g.set('ySavedWorker'); },
      text: (g) => (g.f('ySavedWorker') ? '工地上有人從腳手架上滑下來，你離得最近，一把拽住了他的衣領。他家裡後來寄來一面錦旗。' : '這一年你換了三個工地。每個工地的飯都差不多，¥15 一份，兩葷一素。') },
    { id: 'y_shop_good', age: 28, t: '小店', auto: true, cond: (g) => g.recall('job') === 'shop',
      fx: (g) => { if (g.s('人缘') >= 55 && g.rnd() < 0.5) { g.set('yHometownShop'); CN.earn(g, 60000); } },
      text: (g) => (g.f('yHometownShop') ? '你的店成了街上排隊最長的一家，這一年多掙了 ¥6 萬。鎮上的人說起你，就說那家店。' : '小店的生意不溫不火，一個月掙個 ¥5,000 上下。你認識了街上所有的人。') },
    { id: 'y_civil_life', age: 26, t: '單位', auto: true, cond: (g) => g.recall('job') === 'civil',
      text: (g) => (g.recall('army') === 'out' ? '單位裡的人知道你當過兵，搬東西總叫你。' : '你寫的材料，領導改了三遍，改回了第一版。') + '食堂午飯 ¥6，有魚。' },
    { id: 'y_teacher_life', age: 27, t: '講臺', auto: true, cond: (g) => g.recall('job') === 'teacher',
      text: '你班上有個孩子，作文寫的是你。你在辦公室裡看了兩遍。' },
    { id: 'y_doctor_life', age: 27, t: '值班', auto: true, cond: (g) => ['doctor', 'nurse'].includes(g.recall('job')),
      text: '夜班來了一個出車禍的年輕人。你們搶救了四個小時，他活了下來。你在樓梯間吃了一個冷掉的包子。' },
    { id: 'y_creator_life', age: 25, t: '直播間', auto: true, cond: (g) => g.recall('job') === 'creator',
      fx: (g) => { if (g.rnd() < 0.3) { CN.earn(g, 80000); g.stat('事业', 6); g.remember('viral', true); } },
      text: (g) => (g.recall('viral') ? '你有一條影片火了，一夜之間漲了十萬粉絲，接廣告掙了 ¥8 萬。你媽在村裡走路都帶風。' : '你每天播四個小時。鏡頭關掉以後，屋裡特別安靜。') },
    { id: 'y_jumped_after', age: 28, t: '新公司', auto: true, cond: (g) => g.recall('jumped') === true,
      text: '新公司的人比你想的還要拼。你開始想念以前那個組了，好在工資漲了，你給自己換了一把好椅子。' },
    { id: 'y_rent_whole', age: 25, t: '自己的屋子', auto: true, cond: (g) => g.recall('rentType') === 'whole' && CN.alone(g),
      text: '你在一居室裡養了一隻貓。下雨的晚上，貓趴在你腿上，你覺得這座城市是你的。' },
    { id: 'y_rent_far', age: 25, t: '通勤', auto: true, cond: (g) => g.recall('rentType') === 'far',
      text: '每天來回四個小時。你在地鐵上學會了站著睡覺。' },
    { id: 'y_dink_life', age: 33, t: '兩個人', auto: true, cond: (g) => g.recall('kidPlan') === 'dink' && married(g),
      text: (g) => '你和' + g.recall('spouse') + '去了很多地方。照片裡永遠是兩個人，笑得都挺好看。' },
    { id: 'y_divorce_after', age: 33, t: '離婚以後', auto: true, cond: (g) => g.recall('fight') === 'split' && !married(g),
      text: (g) => (kidN(g) ? (g.recall('custody') === 'me' ? '孩子跟著你。每天早上你扎辮子、做早飯，送完孩子再去上班。累，也踏實。' : '孩子跟著對方。每個週末，你去接' + CN.he(g, 'k1') + '出來吃一頓飯。') : '離婚以後，東西少了一半，地方大了一半。你重新學著給自己做飯。') },
    { id: 'y_cold_after', age: 33, t: '飯桌', auto: true, cond: (g) => g.recall('fight') === 'cold' && married(g),
      text: (g) => '你和' + g.recall('spouse') + '在飯桌上說的話，大多是關於' + (kidN(g) ? '孩子' : '房子') + '和賬單的。有一天對方給你夾了一筷子菜，你愣了一下。' },
    { id: 'y_parents_with', age: 32, t: '一家人', auto: true, cond: (g) => g.recall('parentsNear') === 'with' && withParents(g),
      text: (g) => (CN.livesWith(g, 'mo') ? '你媽每天早上五點起來給全家做早飯。' + (kidN(g) && g.alive('k1') ? g.name('k1') + '是奶奶帶大的，最愛吃' + (isMale(g) ? '奶奶' : '外婆') + '包的餃子。' : '你說不用這麼早，她不聽。') : '你爸每天早上去公園遛彎，回來順手把菜買好了。') },
    { id: 'y_kidcare_after', age: 34, t: '帶孩子', auto: true, cond: (g) => !!g.recall('kidCare') && kidN(g) && g.alive('k1') && g.recall('custody') !== 'ex',
      text: (g) => ({ grand: (g.alive('mo') || g.alive('fa') ? '孩子是老人幫著帶大的。' + g.name('k1') + '學會的第一首兒歌，是方言唱的。' : '幫著帶孩子的老人不在了。' + g.name('k1') + '有時候還會提起。'), paid: '托育的老師換了兩個，' + g.name('k1') + '都記得她們的名字。', home: '在家帶孩子的這幾年，賬很緊。' + g.name('k1') + '記得每一個下午的公園。', stay: '在家帶孩子的這幾年，賬很緊。' + g.name('k1') + '記得每一個下午的公園。', back: '兩個人都上班以後，接送排成了一張表，貼在冰箱上。' }[g.recall('kidCare')]) },
    { id: 'y_back_life', age: 31, t: '老家的日子', auto: true, cond: (g) => ['late', 'parents', 'early'].includes(g.recall('backHome')) && !away(g),
      text: (g) => '回到' + (g.recall('backHome') === 'late' ? g.recall('city') : home(g)) + '以後，你胖了十斤。' + (parentAlive(g) ? '晚飯後跟著' + parentWord(g) + '去廣場上走兩圈。' : '晚飯後你一個人去河邊走兩圈，碰見的都是熟人。') },
    { id: 'y_night_driver', age: 34, t: '凌晨', auto: true, cond: (g) => !!g.recall('nightJob'),
      text: '凌晨跑車，你拉過加班的程式設計師、哭著的姑娘、喝多的老闆。每個人下車時都說一聲謝謝。' },
    { id: 'y_soldhouse', age: 34, t: '沒有房子', auto: true, cond: (g) => !!g.recall('soldHouse'),
      text: '賣了房以後，你又租房住。月初不用盯著房貸，日子鬆了一口氣。' },
    { id: 'y_friend_after', age: 34, t: '朋友', auto: true, cond: (g) => !!g.recall('oldFriend'),
      text: (g) => (g.recall('oldFriend') === 'went' ? '那個朋友的孩子出生了，認你做了幹' + (isMale(g) ? '爹' : '媽') + '。' : '你在朋友圈看到老朋友的孩子滿月。你點了個贊，想了想，又發了一句恭喜。') },
    { id: 'y_look34', age: 34, t: '週末', auto: true, cond: (g) => g.recall('look34') === 'learn' && !g.recall('last34'),
      text: '週末的課上完了。你發現自己還能學進去東西，這讓你高興了好幾天。' },
    { id: 'y_single_after', age: 34, t: '自己的日子', auto: true, cond: (g) => single(g) && ['self', 'refuse'].includes(g.recall('singleWay')),
      text: '你把自己的日子過得井井有條。週末約朋友爬山，晚上看一部老電影。偶爾夜裡醒來，會想一想以後老了誰陪你。' },
    // 第一份工作的风险兑现：大厂会裁员，自媒体会断流
    { id: 'y_offer_echo', age: 28, t: '當年的選擇', auto: true,
      cond: (g) => working(g) && ((g.recall('offer22') === 'big' && ['tech', 'office'].includes(g.recall('job')) && tierNow(g) === 1) || (g.recall('offer22') === 'media' && g.recall('job') === 'creator')),
      fx: (g) => {
        const media = g.recall('offer22') === 'media';
        last.cut = g.rnd() < (media ? 0.45 : 0.3);
        const m = CN.jobPay(g, g.recall('job'));
        if (!last.cut) { last.amt = r1000(m * (media ? 5 : 3)); CN.earn(g, last.amt); g.stat('事业', 4); }
        else if (media) { CN.setJob(g, 'freelance', '接零活的剪輯師'); g.stat('心情', -5); }
        else { last.amt = r1000(m * 7); CN.earn(g, last.amt); CN.setJob(g, 'office', '小公司職員'); g.stat('事业', -4); g.stat('心情', -5); }
      },
      text: (g) => {
        const media = g.recall('offer22') === 'media';
        if (media) return last.cut ? '平臺改了推薦規則，你的播放量一夜之間掉到原來的一成。撐了半年，你開始給別人剪影片，按條收錢。'
          : '你的賬號熬過了好幾次平臺改版。今年接廣告掙了 ' + CN.fmt(last.amt) + '，評論區有人叫你老師。';
        return last.cut ? '第三輪裁員，名單上有你。賠償 N+1，一共 ' + CN.fmt(last.amt) + '。你抱著紙箱下樓，保安衝你點了點頭。一個月後你去了一家小公司，錢少了，晚上七點能下班。'
          : '大廠這幾年裁過兩輪，你都留下了。年終獎 ' + CN.fmt(last.amt) + '，你在工位上愣了一會兒。你已經記不清上一次週末不開電腦是什麼時候。';
      } },
    { id: 'y_biz_echo', age: 34, t: '那個攤子', auto: true, cond: (g) => ['stall', 'online', 'franchise'].includes(g.recall('biz')),
      fx: (g) => {
        const b = g.recall('biz');
        last.ok = g.rnd() < { stall: 0.55, online: 0.5, franchise: 0.65 }[b];
        last.who = helper(g);
        if (b === 'stall') {
          g.remember('side', '');
          if (last.ok) { CN.setJob(g, 'shop', '小吃店老闆'); g.stat('事业', 6); g.stat('心情', 4); } else g.stat('健康', -2);
        } else if (b === 'online') {
          if (last.ok) { CN.setJob(g, 'boss', '網店老闆'); g.stat('事业', 8); } else g.stat('心情', -3);
        } else if (last.ok) { last.amt = r1000(frCost(g) * 0.5); CN.earn(g, last.amt); g.stat('事业', 8); }
        else { last.amt = r1000(frCost(g) * 0.2); CN.earn(g, last.amt); CN.setJob(g, tierNow(g) >= 4 ? 'worker' : 'office', tierNow(g) >= 4 ? '工廠工人' : '公司職員'); g.stat('心情', -6); }
      },
      text: (g) => {
        const b = g.recall('biz');
        const hire = last.who ? '你把' + CN.who(g, last.who).replace(/^你的/, '') + '叫來幫忙，按月給' + (last.who === 'mo' || last.who === 'fa' ? '零花錢' : '工資') + '。' : '你僱了一個小工。';
        if (b === 'stall') return last.ok ? '攤子做出了名氣，常有人排隊。你辭了工作，盤下一個門面，開了家小吃店。' + hire + '現在' + payWord(g) + '。'
          : '擺了三年攤，腰受不了了。你把推車賣了，專心上班。那幾年攢下的熟客，現在還會在路上跟你打招呼。';
        if (b === 'online') return last.ok ? '網店做起來了，倉庫從陽臺搬到了一間小廠房。你辭了工作，' + hire + '好的月份一個月能掙三四萬，差的月份只夠發工資。'
          : '平臺改了規則，流量掉了一大半。你把網店關了，剩下的貨在朋友圈清了。上班的錢少，可每個月都有。';
        return last.ok ? '這家' + g.recall('bizKind') + '回了本，這兩年淨掙了 ' + CN.fmt(last.amt) + '。你在隔壁街開了第二家，' + hire
          : '總部換了老闆，加盟店一家家關門。你的' + g.recall('bizKind') + '撐到最後，轉讓只收回 ' + CN.fmt(last.amt) + '。' + (debtW(g) ? '欠的錢還剩 ' + CN.fmt(debtW(g) * 1e4) + '。' : '') + '你又找了份工作，' + payWord(g) + '。';
      } },
    { id: 'y_ladder_echo', age: 33, t: '這條路', auto: true, cond: (g) => ['expert', 'move', 'stuck'].includes(g.recall('ladder')) && working(g),
      fx: (g) => { const l = g.recall('ladder'); if (l === 'expert') { last.amt = r1000(CN.jobPay(g, g.recall('job')) * 2); CN.earn(g, last.amt); } if (l === 'move') g.stat('心情', married(g) ? -2 : 1); if (l === 'stuck') g.stat('事业', 2); },
      text: (g) => ({
        expert: '同行開會，有人點名請你去講。講一次給 ' + CN.fmt(last.amt) + ' 的課酬，你講得磕磕巴巴，臺下記得很認真。',
        move: '在' + here(g) + '的第二年，分部從五個人變成了二十個人。' + (married(g) ? '週末一家人去逛新城市，' + g.recall('spouse') + '說，這裡的菜還是吃不慣。' : '你認得了樓下每一家早點鋪。'),
        stuck: '那次沒升上去以後，你把力氣花在了手藝上。新來的人有不會的，都先來問你。',
      }[g.recall('ladder')]) },
    { id: 'y_broke_after', age: 28, t: '分手以後', auto: true, cond: (g) => g.recall('singleWay') === 'broke' && single(g),
      text: '分手以後，你很長一段時間沒再談。工作倒是做得更好了。' },
    { id: 'y_startup_after', age: 31, t: '公司', auto: true, cond: (g) => ['ok', 'fail'].includes(g.recall('startup')),
      text: (g) => (g.recall('startup') === 'ok' ? '公司有了五十個人。你開始學著記住每個人的名字。' : '你又回去打工了。面試官看到你的簡歷，問你創業失敗學到了什麼。你說，學會了算賬。') },
    { id: 'y_promo_after', age: 33, t: '團隊', auto: true, cond: (g) => g.recall('promoted') === true && g.recall('ladder') === 'mgr',
      text: '你帶的人裡，有一個跟你剛畢業時很像。你把自己的經驗一條條告訴了他。' },
    { id: 'y_metparents_after', age: 26, t: '親家', auto: true, cond: (g) => g.recall('metParents') === true && loveIs(g, 'dating'),
      text: '兩家家長通了一次電話，聊了一個小時。你在旁邊聽著，有點尷尬，也有點高興。' },
    { id: 'y_burnout_after', age: 31, t: '體檢', auto: true, cond: (g) => !!g.recall('burnout'),
      fx: (g) => { if (g.recall('burnout') === 'push') g.stat('健康', -4); },
      text: (g) => (g.recall('burnout') === 'push' ? '今年的體檢，箭頭比去年多了兩個。' : '堅持健身幾年，你比二十五歲時還精神。') },
    { id: 'y_ai_after', age: 27, t: '機器', auto: true, cond: (g) => !!g.recall('aiMove'),
      text: (g) => ({ learn: '公司裡會用 AI 的人越來越吃香。你慶幸當年熬了那幾個月。', switch: '你訓練過的模型上線了。你在新聞裡認出了自己寫的那些句子。', care: '你照顧的老人裡，有一個總把你當成她的孫子，每次都塞給你一顆糖。', laid: '這幾年你換了很多份零工，學會了不把雞蛋放在一個籃子裡。' }[g.recall('aiMove')]) },
    { id: 'y_steady_after', age: 28, t: '單位裡', auto: true, cond: (g) => !!g.recall('steady'),
      text: (g) => ({ stay: '日子過得平平穩穩，你學會了泡茶。', up: '你成了單位裡最年輕的骨幹。', stuck: '你不再爭了。下班後去學了游泳。', move: '新城市的生活慢慢有了樣子。你有了常去的麵館，老闆記得你不要蔥。', small: '小城的日子慢。你下班後去菜市場，買一把青菜才 ¥3。' }[g.recall('steady')]) },
    { id: 'y_workstyle_after', age: 25, t: '攢下的', auto: true, cond: (g) => !!g.recall('workStyle') && !white(g) && !!g.recall('money0'),
      text: (g) => {
        const s = cash(g) + (Number(g.recall('invest')) || 0);
        return ({ save: '這幾年你省吃儉用，', fun: '這幾年錢沒攢下多少，朋友倒是交了一堆。', study: '夜校考的證派上了用場，你調去了技術崗。' }[g.recall('workStyle')]) + '算下來手裡有 ' + CN.fmt(s) + (s >= CN.price(g, 4) * 0.3e4 ? '，夠在老家縣城付個首付了。' : '，離老家縣城一套房的首付還差一截。');
      } },
    { id: 'y_skill_after', age: 26, t: '手藝', auto: true, cond: (g) => !!g.recall('skill'),
      text: (g) => ({ cook: '你炒的回鍋肉，老闆說可以上招牌了。', auto: '什麼車送來，你聽聲音就知道哪裡不對。', hair: '有幾個老顧客只找你剪。', elec: '你一個人能把一棟樓的線路查完。' }[g.recall('skill')]) + '手藝好，工資也跟著漲了一截。' },
    { id: 'y_army_stay', age: 26, t: '部隊', auto: true, cond: (g) => g.recall('army') === 'stay',
      fx: (g) => { if (!g.recall('armyOut')) { g.remember('armyOut', true); g.remember('lifePath', 'work'); CN.earn(g, 150000); CN.setJob(g, 'civil', '轉業到地方單位'); CN.goCity(g, 3); } },
      text: '在部隊待了八年，你轉業了，領了 ¥15 萬轉業費。分到地方的一個單位，脫下軍裝那天，你把它疊得整整齊齊。' },
    { id: 'y_gaokao_memory', age: 32, t: '高考', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => '又到高考。新聞裡說今年考生是近幾十年最少的。你想起自己那年' + ({ top: '考了全縣第一', good: '考得不錯', normal: '剛過本科線', college: '只夠大專', fail: '沒考上' }[g.recall('gk')]) + '。' },
    { id: 'y_side_after', age: 23, t: '學校裡學的', auto: true, cond: (g) => g.recall('uniSide') === 'money' && working(g),
      text: '大學時打工攢下的錢，你拿來交了第一個月的房租和押金。' },
    { id: 'y_campus_after', age: 24, t: '同學', auto: true, cond: (g) => g.recall('campus') === 'club',
      text: '大學社團裡認識的人，現在散在各個城市。你出差到哪兒，都有人請你吃飯。' },
    { id: 'y_grad_after', age: 27, t: '研究生的朋友', auto: true, cond: (g) => g.recall('gradWay') === 'lab',
      text: '實驗室的師兄去了一家大公司，問你要不要過去。你說再看看。' },
    { id: 'y_rentforever', age: 32, t: '租房的人', auto: true, cond: (g) => !!g.recall('rentForever') && g.recall('house') === 'rent' && !withParents(g),
      text: '房東換了三個，你的綠蘿還活著。' },
    { id: 'y_late_marry', age: 33, t: '晚婚', auto: true, cond: (g) => g.recall('lateMarry') === 'match' && married(g),
      text: (g) => '結婚以後，你和' + g.recall('spouse') + '有一種默契：誰先到家誰做飯。' },
    { id: 'y_kid2_life', age: 34, t: '兩個孩子', auto: true, cond: (g) => g.recall('kid2') === 'yes' && g.alive('k2'),
      text: (g) => g.name('k1') + '和' + g.name('k2') + '為一個玩具吵了一下午。你在廚房裡，聽著聽著笑了。' },
    { id: 'y_debt_paid', age: 34, t: '賬', auto: true, cond: (g) => debtW(g) === 0 && !!g.recall('soldHouse'),
      text: '你算了一下，現在一分錢都不欠別人。這是你成年以後第一次。' },
    { id: 'y_frugal_after', age: 34, t: '省下的', auto: true, cond: (g) => !!g.recall('frugal'),
      text: (g) => '省了一年，你還欠著 ' + CN.fmt(debtW(g) * 1e4) + '。' + (debtW(g) < 40 ? '數字一天天往下走，你開始敢想想以後了。' : '路還長。你把每月還款的日子標在日曆上，一格一格劃掉。') },
    { id: 'y_credit_after', age: 24, t: '賬單', auto: true, cond: (g) => !!g.recall('credit'),
      fx: (g) => { if (g.recall('credit') === 'loan' && debtW(g) >= 3) { CN.pay(g, 32000); g.remember('debt', Math.max(0, debtW(g) - 3)); } },
      text: (g) => ({ loan: '分期疊著分期，利息滾到了 ¥3.2 萬。你咬牙用了半年工資才還清，把那幾個軟體都卸了。', phone: '手機的分期還完了。螢幕上貼著一張膜，一道劃痕都沒有。', none: '你的卡里一直留著三個月的工資。同事急用錢，第一個想到的是你。' }[g.recall('credit')]) },
    { id: 'y_money26', age: 26, t: '那筆錢', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') >= 2 && g.since('money1') <= 3, text: moneyAfter },
    { id: 'y_money34', age: 34, t: '那筆錢', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') === 1, text: moneyAfter },
    { id: 'y_car31', age: 31, t: '車', auto: true, cond: (g) => !!g.recall('car') && g.since('car') >= 2, text: carAfter },
    { id: 'y_car34', age: 34, t: '車', auto: true, cond: (g) => !!g.recall('car') && g.since('car') === 1, text: carAfter },
    { id: 'y_side29', age: 29, t: '副業', auto: true, cond: (g) => !!g.recall('side'),
      fx: (g) => { if (g.rnd() < 0.4) g.remember('sideEnd', true); },
      text: (g) => ({ drive: '晚上接零活的這幾年，一年能多掙一萬來塊。', stall: '夜市的攤子擺了三年，熟客會專門繞過來找你。', video: '剪片子的單子越接越多，一年多掙一萬來塊。' }[g.recall('side')] || '') + (g.recall('sideEnd') ? '後來你實在累了，就停了。' : '你打算再幹幾年。') },
    { id: 'y_house_after', age: 30, t: '房子', auto: true, cond: (g) => !!g.recall('houseSize') && hasHouse(g),
      text: (g) => ({ big: '三居的房子，一間留給了將來的孩子，現在堆著紙箱和一輛腳踏車。', small: '小房子住得滿滿當當。陽臺上晾著衣服，也種著蔥和辣椒。', county: '老家縣城的房子一年住不了幾天。' + (parentAlive(g) ? parentWord(g) + '隔幾天去開窗通風，說樓下新開了一家超市。' : '鄰居幫你看著，過年回去給人家帶了兩瓶酒。'), far: '城邊的房子離地鐵站越來越近了，新線明年通車。' }[g.recall('houseSize')]) + (debtW(g) ? '還欠 ' + CN.fmt(debtW(g) * 1e4) + '，慢慢還。' : '') },
    { id: 'y_side_stop', age: 30, t: '歇一歇', auto: true, cond: (g) => !!g.recall('sideEnd') && !!g.recall('side'),
      fx: (g) => { g.remember('side', ''); },
      text: '你把副業停了。晚上的時間又回來了，你用它睡覺、做飯、發呆。' },
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

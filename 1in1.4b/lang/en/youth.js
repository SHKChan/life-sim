/* 由 share/tools/tr.js 从 data/youth.js 和 lang/en/tr/youth.json 生成，不要手改。 */
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
  const VOC_MAJOR = { mech: 'auto repair', care: 'nursing', ecom: 'e-commerce', robot: 'robot repair' };
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
  const home = (g) => g.recall('homeCap') || 'Hometown';
  const here = (g) => g.recall('workCity') || home(g);
  const working = (g) => g.recall('lifePath') === 'work';
  const hasHouse = (g) => ['mortgage', 'own', 'hometown'].includes(g.recall('house'));
  const parentAlive = (g) => g.alive('fa') || g.alive('mo');
  const aliveParents = (g) => ['fa', 'mo'].filter((id) => g.alive(id));
  const withParents = (g) => CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo');
  const parentWord = (g) => (g.alive('fa') && g.alive('mo') ? 'Mom and Dad' : g.alive('fa') ? 'Dad' : g.alive('mo') ? 'Mom' : 'your family');
  const debtW = (g) => Number(g.recall('debt')) || 0;
  const cash = (g) => CN.cash(g);
  const r1000 = (x) => Math.max(0, Math.round(x / 1000) * 1000);
  const r100 = (x) => Math.max(0, Math.round(x / 100) * 100);
  const wan = (x) => Math.round(x / 1e3) / 10; // 元换成万，保留一位
  // 本省省会
  const capital = (g) => {
    const P = CN.PROVS.find((p) => p[0] === g.recall('prov'));
    const c = P && (P[6].find((x) => x[1] <= 2) || P[6][0]);
    return c ? c[0] : 'the provincial capital';
  };
  const bigCity = () => CN.pick(['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu', 'Nanjing', 'Wuhan']);
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
  const payWord = (g) => (married(g) ? ' with combined monthly take-home of about ' : ' with monthly take-home of about ') + CN.fmt(perMonth(g));
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
    civil: 'An iron rice bowl, almost never laid off', teacher: 'Stable, with winter and summer breaks, but running a class is tiring', doctor: 'Stable, but lots of night shifts wear you down', nurse: 'Stable, but rotating three shifts', soldier: 'Room and board included, strict rules',
    tech: 'Good money, heavy overtime, and the fear of turning 35 and of AI', office: 'Not too tiring, but a high risk of being replaced by AI', sales: 'Base pay plus commission, you live on your numbers',
    worker: 'Tiring, and a high risk of being replaced by robots', rider: 'The more you work the more you earn, but wind, sun and no base pay', driver: 'Late nights, and self-driving cars are coming sooner or later', shop: 'Depends on location and luck, and losses are yours',
    boss: 'Several times over in a good year, wiped out in a bad one', creator: 'Big ups and downs, and one platform change can cut off your income', freelance: 'Gigs come and go', farmer: 'Depends on the weather, and pays little',
  };
  CN.jobPay = (g, job, t, plus) => r100((INC[job] != null ? INC[job] : 60000) * (TI[t || tierNow(g)] || 0.8) * (0.6 + Math.min(100, g.s('事业') + (plus || 0)) / 100 * 1.4) / 12);
  CN.jobRisk = (job) => RISK[job] || '';
  CN.jobLine = (g, job, t, plus) => {
    const m = CN.jobPay(g, job, t, plus);
    const pay = job === 'boss' || job === 'creator' ? 'about ' + CN.fmt(r100(m * 0.4)) + ' to ' + CN.fmt(r100(m * 1.8)) + ' a month' : 'about ' + CN.fmt(m) + ' a month';
    return pay + ', ' + CN.jobRisk(job);
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
  const buyPlace = (g) => (tierNow(g) <= 4 ? here(g) : g.recall('city') + '’s outlying county town');
  const dealRes = (g, d, head) => head + 'Total price ' + CN.fmt(d.price * 1e4) + ', down payment ' + CN.fmt(d.down) + ': '
    + (married(g) ? 'You two' : 'You') + ' put in ' + CN.fmt(d.mine)
    + (d.fam ? ', ' + (married(g) ? 'both sets of parents' : parentWord(g)) + 'gave ' + CN.fmt(d.fam) : '')
    + (d.borrow >= 1000 ? ', and relatives lent you ' + CN.fmt(d.borrow) : '') + '. The mortgage payment is ' + CN.fmt(d.month) + '. ';
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
      { t: 'Go all in and buy ' + nameA, dev: 10, cond: showA,
        fx: (g) => { const d = deal(g, buyTier(g), sizeA(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'big'); g.stat('心情', 4); },
        res: (g) => dealRes(g, last, 'In ' + buyPlace(g) + ', you bought ' + nameA + '. ') + 'On moving day, you stood in every room for a while.' },
      { t: 'Scrape together a down payment and buy ' + nameB, canon: true, cond: showB,
        fx: (g) => { const d = deal(g, buyTier(g), sizeB(g)); doBuy(g, d, buyPlace(g)); g.remember('houseSize', 'small'); g.stat('心情', 3); },
        res: (g) => dealRes(g, last, 'In ' + buyPlace(g) + ', you bought ' + nameB + '. ') + 'When you got the keys, the place had no furniture at all. ' + (married(g) ? 'You two' : 'You') + ' sat on the floor eating takeout, and it felt pretty good.' },
      { t: 'Buy in your home county town, where it is cheaper', dev: 15, cond: showC,
        fx: (g) => { const d = deal(g, 4, 1); doBuy(g, d); g.remember('backHome', 'house'); g.remember('houseSize', 'county'); },
        res: (g) => dealRes(g, last, 'The flat is in your home county town. ') + 'You two only stay a few days a year. ' + parentWord(g) + ' will keep an eye on the house.' },
      { t: 'Buy in a smaller town on the edge of the city, with a longer commute', dev: 15, cond: (g) => !showA(g) && !showB(g) && !showC(g),
        fx: (g) => { const d = deal(g, Math.min(4, buyTier(g) + 1), 0.8); doBuy(g, d, here(g) + ' outskirts'); g.remember('houseSize', 'far'); g.stat('健康', -2); },
        res: (g) => dealRes(g, last, 'The flat is in a small town on the edge of the city. ') + 'The round trip takes three hours a day, and you learn to sleep standing up on the bus.' },
      { t: 'Do not buy, keep renting', dev: 20,
        fx: (g) => { g.remember('house', 'rent'); g.remember('rentForever', true); g.stat('心情', 1); },
        res: (g) => withParents(g) && !married(g) ? 'You still live at ' + parentWord(g) + '’s place, saving on rent.' + (g.alive('mo') ? ' Your mom says there is always a bed for you at home.' : '') : (married(g) ? 'You two' : 'You') + ' pay ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + ' a month in rent. The money stays in your hands, and your mind feels lighter.' + (married(g) ? (isMale(g) ? 'Your mother-in-law' : 'Your mother-in-law') + ' has not smiled at you in a long time.' : '') },
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
    ? 'Bride price ' + CN.fmt(w.caili) + ', banquet ' + CN.fmt(w.feast) + ', and most of the cash gifts from guests come back. ' + parentWord(g) + ' put in ' + CN.fmt(w.fam) + (w.borrow >= 5000 ? ', and relatives lent you ' + CN.fmt(w.borrow) : '') + ', and the rest is your own savings.'
    : 'Banquet ' + CN.fmt(w.feast) + ', and most of the cash gifts from guests come back. The groom’s family gave a bride price of ' + CN.fmt(w.caili) + ', your parents kept half, and the other half went to your new home as a dowry.');
  const wedText = (g) => {
    const w = wedPlan(g);
    if (rural(g) || county(g)) return isMale(g) ? 'The two families sit down to talk about the bride price. Her family asks for ' + CN.fmt(w.caili) + ', and the banquet is extra. You have ' + CN.fmt(cash(g)) + '. '
      : 'The two families sit down to talk about the wedding. His family says the bride price will be ' + CN.fmt(w.caili) + ', your mom thinks that is a bit low, and your dad says it is fine.';
    return 'Your partner asks whether you want to set a date. A wedding in the city means a hotel banquet at $430 a table, and the two families agree the bride price will be a token gesture.';
  };

  /* 理财的选项（23 岁第一笔存款、33 岁）。amt 是拿出来的钱 */
  const moneyChoices = () => {
    const amt = (g) => r1000(cash(g) * 0.6);
    return [
      { t: 'Put it in a fixed deposit for peace of mind', canon: true,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'safe'); g.remember('money1', 'safe'); },
        res: (g) => 'You go to the bank and put ' + CN.fmt(last.amt) + ' into a three-year fixed deposit. The interest is small, but you sleep well.' },
      { t: 'Buy funds, which supposedly beat the bank', dev: 10,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'fund'); g.remember('money1', 'fund'); },
        res: (g) => 'In a few rounds you bought ' + CN.fmt(last.amt) + ' worth of funds. They dip a little in the first month, and you manage not to look.' },
      { t: 'Open an account and trade stocks yourself', dev: 20,
        fx: (g) => { last.amt = CN.invest(g, amt(g), 'stock'); g.remember('money1', 'stock'); g.stat('心情', -1); },
        res: (g) => 'You top up your brokerage account with ' + CN.fmt(last.amt) + '. Slacking off at work, your phone is full of red and green lines.' },
      { t: 'Give some to the family', dev: 15, cond: (g) => parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker'),
        fx: (g) => { last.amt = r1000(cash(g) * 0.4); CN.pay(g, last.amt); g.remember('money1', 'family'); g.stat('人缘', 4); },
        res: (g) => 'You gave ' + parentWord(g) + ' ' + CN.fmt(last.amt) + '. ' + (rural(g) ? 'The house back home has leaked for years, and now it can finally be fixed up.' : 'Your mom says she will save it for you. You say there is no need.') },
      { t: 'Leave it alone and spend as you like', dev: 10, cond: (g) => !(parentAlive(g) && (rural(g) || county(g) || g.recall('family') === 'worker')),
        fx: (g) => { g.remember('money1', 'none'); g.stat('心情', 2); },
        res: 'The money just sits in your account. You buy yourself a better computer.' },
    ];
  };
  const moneyAfter = (g) => {
    const m = g.recall('money1');
    const inv = Number(g.recall('invest')) || 0;
    if (m === 'family') return 'The house back home is fixed up. On a video call, your mom holds her phone up and walks you around the freshly painted walls.';
    if (m === 'none') return 'Most of the money on your card disappeared without you noticing. You downloaded a budgeting app, and this time you stuck with it.';
    if (!inv) return 'You withdrew your investment money and spent it long ago.';
    return { safe: 'Your fixed deposit has matured. With interest it is now ', fund: 'Your funds have gone up and down, and altogether they are now worth ', stock: 'Your stock account now stands at ' }[m] + CN.fmt(inv) + '. ' + (m === 'stock' ? 'You say you will never check the market every day again, and the next day you check it again.' : 'It is not a big number, but it is reassuring to look at.');
  };

  /* 车的选项 */
  const carChoices = () => [
    { t: 'Do not buy; you get around fine without one', canon: true, fx: (g) => { g.remember('car', 'no'); g.stat('心情', 1); }, res: (g) => (tierNow(g) >= 4 ? 'You buy a new electric scooter for $430. It takes you anywhere in the county town.' : 'You do the math: a year of taxis costs less than half of running a car.') },
    { t: 'Pay cash for a new electric car', dev: 10, cond: (g) => cash(g) >= 150000,
      fx: (g) => { CN.pay(g, 120000); g.remember('car', 'new'); g.stat('心情', 5); }, res: '$17,000 on the road. On pickup day you sit in the parking lot for a long time, almost too attached to drive away.' },
    { t: 'Put $4,300 down and take a car loan', dev: 15, cond: (g) => cash(g) >= 40000 && cash(g) < 150000,
      fx: (g) => { CN.pay(g, 30000); g.remember('debt', debtW(g) + 9); g.remember('car', 'loan'); g.stat('心情', 3); }, res: '$4,300 down, and the other $13,000 over five years at $240 a month. The car is new, and so is the debt.' },
    { t: 'Buy a used car for $5,700', dev: 10,
      fx: (g) => { CN.pay(g, 40000); g.remember('car', 'used'); g.stat('心情', 3); }, res: 'The car was driven by someone else for five years, and the air conditioning rattles a bit. It runs, and that is enough.' },
  ];
  const carText = (g) => (tierNow(g) >= 4 ? 'The bus in the county town comes once an hour. ' : 'Going out on weekends takes two metro transfers. ')
    + (kidN(g) ? 'Taking your child to the hospital, you are drenched in sweat by the time you have carried them to the stop. ' : married(g) ? 'Heading to ' + (g.alive('mo') ? 'your parents’ place' : 'Hometown') + ', you cannot squeeze onto the bus with all your bags. ' : 'Your coworkers have started talking about cars. ')
    + 'You have ' + CN.fmt(cash(g)) + '. ';
  const carAfter = (g) => ({ new: 'Now that you have a car, you often drive out of town on weekends. ' + (kidN(g) ? 'Your child falls asleep in the back seat with cookie crumbs at the corner of their mouth.' : 'There is a tent in the trunk.'), loan: 'You have paid off half the car loan. The twenty-minute drive to work is the quietest part of your day.', used: 'The used car has been repaired twice and still holds up well.', no: tierNow(g) >= 4 ? 'You still ride the electric scooter. In the rain you put on a poncho and go everywhere just the same.' : 'You still have not bought a car. On the metro you have finished several books, and you have saved a pile of money.' }[g.recall('car')] || '');

  /* 高考档次：学识 + 学校 + 运气 */
  const gaokao = (g, bonus) => {
    const sc = { key: 12, normal: 0, weak: -8 }[g.recall('school')] || 0;
    const v = g.s('学识') + sc + (bonus || 0) + (g.rnd() * 20 - 10);
    // 童年结束时高中生的学识大多在 60–95；按真实比例：顶尖约 6%，好大学约 25%，普通本科约 40%，大专约 20%，落榜约 10%
    return v >= 100 ? 'top' : v >= 88 ? 'good' : v >= 74 ? 'normal' : v >= 62 ? 'college' : 'fail';
  };
  const UNI_T = { top: 'a top university', good: 'a good university', normal: 'an ordinary four-year university' };
  // 进大学：档次、专业、城市。调用前先在选项里 g.remember('uni', …) 和 g.remember('major', …)
  const enroll = (g, city, tier) => {
    const uni = g.recall('uni');
    g.remember('lifePath', 'uni');
    g.info('学历', 'Bachelor’s (in progress)');
    CN.goCity(g, tier, city);
    g.move('campus', city + ' · ' + UNI_T[uni]);
  };
  const fee = (g) => (rural(g) ? 'Tuition is $700 a year, and you apply for a student loan.' : 'Tuition is $860 a year, and living costs are $290 a month, paid by your family.');

  /* 志愿：18 岁第一次高考，19 岁复读后的第二次，共用一套选项 */
  const zhiyuan = (id, age, cond) => dec({ id, age, t: 'Choosing Where to Apply', loc: 'home', cond,
    text: (g) => {
      const gk = g.recall('gk');
      return (gk === 'top' ? 'Your score is out, higher than you expected. Your homeroom teacher calls, and her voice has changed.' : gk === 'good' ? 'Your score is good, enough for a good university, though not for the hottest majors.' : 'Your score barely clears the bachelor’s cutoff. The application guide is a thick book, and you flip through it until midnight.')
        + parentWord(g) + ' said it was up to you, and also not to go too far from home.';
    },
    choices: [
      { t: 'Go to a big city and apply for the hot major, computer science', canon: true,
        fx: (g) => { const gk = g.recall('gk'); const tier = gk === 'normal' ? 2 : 1; g.remember('uni', gk); g.remember('major', 'computer science'); enroll(g, tier === 1 ? bigCity() : capital(g), tier); g.stat('心情', 2); },
        res: (g) => 'Your admission letter arrives. The city is ' + g.recall('workCity') + ', a place you have only ever seen on a map. ' + fee(g) },
      { t: 'Apply for teaching or medicine, for the sake of stability', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', g.rnd() < 0.5 ? 'teaching' : 'medicine'); enroll(g, capital(g), 2); g.stat('人缘', 2); },
        res: (g) => (g.recall('major') === 'medicine' ? 'Medicine takes five years. Your mom says that from now on the family will not have to beg anyone for help when they are sick.' : 'Teacher-training students get subsidies, and after graduation you will most likely come back to teach. Your dad is quite pleased.') },
      { t: 'Stay close to home and study something employable in your own province', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', CN.pick(['accounting', 'mechanical engineering', 'electrical engineering', 'Chinese literature', 'law'])); enroll(g, capital(g), 2); g.stat('人缘', 1); },
        res: (g) => 'Your university is in ' + g.recall('workCity') + ', a three-hour ride from home. Your major is ' + g.recall('major') + '. ' + fee(g) },
      { t: 'Refuse to give up and repeat a year', dev: 25, cond: (g) => g.recall('gk') !== 'top' && g.recall('lifePath') !== 'repeat',
        fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -6); g.move('school', home(g) + ' · Repeat-year class'); },
        res: 'The repeat class is in the back building of the county high school, and a year costs $1,100 in tuition. At the first roll call, you know half the people in the room.' },
    ] });

  /* 升职（31 岁）：管理岗、专业路线、外调。ladder 记下走的哪条路，中年的升职读它 */
  const MGR = { tech: 'Tech Team Lead', office: 'Department Supervisor', sales: 'Sales Manager', civil: 'Deputy Section Chief', teacher: 'Grade Head', doctor: 'Medical Team Lead', nurse: 'Head Nurse', worker: 'Workshop Supervisor', rider: 'Station Team Lead', driver: 'Fleet Dispatcher', soldier: 'Deputy Company Commander' };
  const EXPERT = { tech: 'Senior Engineer', doctor: 'Attending Physician', teacher: 'First-Grade Teacher', nurse: 'Senior Nurse', worker: 'Senior Technician', office: 'Senior Specialist', civil: 'Principal Staff Member' };
  const upMgr = (g) => { CN.setJob(g, g.recall('job'), MGR[g.recall('job')] || 'Supervisor'); g.remember('promoted', true); g.remember('ladder', 'mgr'); g.stat('事业', 10); g.stat('健康', -2); };
  const mgrRes = (g) => 'You are promoted to ' + jobTitle(g) + ', ' + payWord(g).replace(/^.*?大概/, ' with monthly take-home of about ') + '. The first thing you learn is to not say too much in the group chat.';
  const upFail = (g) => { g.remember('promoted', false); g.remember('ladder', 'stuck'); g.stat('心情', -4); };

  /* 自己干（29 岁）：小吃摊、网店、加盟店。biz 记下干的什么、头一年成没成，32 岁的回响兑现 */
  const bizText = (g) => pk(g, ['Walking past the night market after work, ', 'On the way home one weekend, ', 'Scrolling through short videos, '], 1)
    + pk(g, ['a fellow villager younger than you says he makes over $1,400 a month running a stall. ', 'you see a former colleague who opened a shop, with a line out the door. ', 'you do the math: working for someone else until retirement adds up to about this much. '], 2);
  const frKind = (g) => pk(g, ['bubble tea shop', 'fast-food restaurant', 'convenience store', 'laundromat', 'bakery'], 3);
  const frCost = (g) => FRANCHISE[tierNow(g)] || 200000;
  // 能叫来帮忙的家里人
  const helper = (g) => ['sib0', 'sib1'].find((id) => JY.byId[id] && g.alive(id) && g.ageOf(id) >= 18) || (g.alive('mo') ? 'mo' : g.alive('fa') ? 'fa' : '');

  JY.addFlags({
    ySavedWorker: 'Saved a coworker who fell from scaffolding on a construction site',
    yHometownShop: 'Went home and opened a shop that later became a long-standing name in town',
  });

  JY.addLifeNodes([
    /* ================= 18 岁：衔接童年 ================= */
    { id: 'y_entry', age: 18, t: 'Eighteen', auto: true,
      fx: (g) => {
        // 童年没留下学历时兜底：按学识和出身估一个
        let e = g.recall('edu');
        if (!e) {
          const r = g.s('学识') + (rural(g) ? -8 : 4) + g.rnd() * 30;
          e = r >= 60 ? 'senior' : r >= 42 ? 'vocational' : 'junior';
          CN.setEdu(g, e, { senior: 'High school', vocational: 'Vocational school', junior: 'Middle school' }[e]);
        }
        if (e === 'primary') CN.setEdu(g, 'junior', 'Middle school');
        // 童年写的是“高中在读”“职高在读”，十八岁毕业
        if (e === 'senior') CN.setEdu(g, 'senior', 'High school');
        if (e === 'vocational') CN.setEdu(g, 'vocational', 'Vocational school');
        if ((e === 'junior' || e === 'primary') && (!g.recall('job') || g.recall('job') === 'none')) {
          CN.setJob(g, 'worker', 'Factory worker');
          CN.goCity(g, CN.pick([1, 3, 3]));
          g.move('factory', g.recall('workCity') + ' · Electronics factory');
        }
        if (e === 'junior' || e === 'primary') g.remember('lifePath', 'work');
        if (e === 'senior') g.remember('gk', gaokao(g));
      },
      text: (g) => (g.recall('edu') === 'senior' ? 'In June, you walk into the exam hall. Your pencil case is transparent, and your palms are sweaty.'
        : g.recall('edu') === 'vocational' ? 'In your last year of vocational school, you spend your eighteenth birthday at your internship.'
        : 'You turn eighteen. In the dorm in ' + (g.recall('workCity') || 'a faraway city') + ', a coworker buys you a small cake.') },
    { id: 'y_gaokao', age: 18, t: 'Gaokao Results', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => ({ top: 'You came first in the whole county. A string of firecrackers goes off at your door, set off by the neighbors.', good: 'You did well. Your homeroom teacher mentions you by name in the class chat.', normal: 'Your score just clears the bachelor’s cutoff, neither high nor low.', college: 'Your score is not enough for a bachelor’s degree, only for a junior college.', fail: 'When your score comes up, you look at it for a long time, then close the page.' }[g.recall('gk')]) },
    zhiyuan('y_zhiyuan', 18, (g) => ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_zhuanke', age: 18, t: 'Junior College', loc: 'home', cond: (g) => g.recall('gk') === 'college',
      text: 'The school you can get into is a junior college on the edge of the provincial capital, at $1,000 a year in tuition. Your mom says a junior college is still a college.',
      choices: [
        { t: 'Go, and study something practical', canon: true,
          fx: (g) => { const m = CN.pick(['nursing', 'auto repair', 'e-commerce', 'early-childhood education', 'mechatronics']); g.remember('major', m); g.remember('lifePath', 'college'); g.info('学历', 'Junior college (in progress)'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · Vocational and Technical College'); },
          res: (g) => 'Your major is ' + g.recall('major') + '. Six people share the dorm, and three of them, like you, are away from home for the first time.' },
        { t: 'Repeat a year and aim for a bachelor’s', dev: 20, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -5); g.move('school', home(g) + ' · Repeat-year class'); }, res: 'You press the junior college admission letter to the very bottom of a drawer.' },
        { t: 'Skip school and go earn money', dev: 25,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', 'High school'); CN.setJob(g, 'worker', 'Factory worker'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · Industrial park'); },
          res: (g) => 'Your older cousin is a line leader at a factory in ' + g.recall('workCity') + ' and says he can take you along. Room and board are included,' + payWord(g) + '. ' },
      ] }),
    dec({ id: 'y_luobang', age: 18, t: 'Failing the Gaokao', loc: 'home', cond: (g) => g.recall('gk') === 'fail',
      text: 'You did not get in. Nobody at home brings it up, and dinner is especially quiet.',
      choices: [
        { t: 'Repeat the year', canon: true, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -4); g.move('school', home(g) + ' · Repeat-year class'); }, res: 'You pick up your schoolbag again. Your mom cooks all your favorite dishes in turn.' },
        { t: 'Go south to work in a factory', dev: 10,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', 'High school'); CN.setJob(g, 'worker', 'Factory worker'); CN.goCity(g, 1, CN.pick(['Shenzhen', 'Guangzhou'])); g.move('factory', g.recall('workCity') + ' · Industrial park'); },
          res: (g) => 'The high-speed train takes eight hours. ' + g.recall('workCity') + '’s summers are hotter than back home. You start at the factory' + payWord(g) + '. ' },
        { t: 'Join the army', dev: 20, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setEdu(g, 'senior', 'High school'); CN.setJob(g, 'soldier', 'Soldier'); g.move('road', 'On the way to the base'); g.stat('健康', 5); },
          res: 'You pass the medical exam. On the day you leave, a banner with your name hangs at the village entrance.',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', 'High school'); CN.setJob(g, 'worker', 'Factory worker'); CN.goCity(g, 3); }, res: 'You fail the medical exam; your eyesight is a little off. You follow your classmates to a factory in the city.' } },
      ] }),
    dec({ id: 'y_voc18', age: 18, t: 'Vocational School Graduation', loc: 'factory', cond: (g) => g.recall('edu') === 'vocational' && !g.recall('lifePath'),
      text: (g) => (g.recall('vocPlan') === 'college' ? 'Your vocational college entrance exam results are out, enough for a higher vocational school. ' : 'The factory where you interned says it can keep you, at $640 a month once you are made permanent. ') + 'Your teacher says three years at a junior college will widen your path afterwards.',
      choices: [
        { t: 'Take the exam for a higher vocational school and study at a junior college', canon: true,
          fx: (g) => { g.remember('major', VOC_MAJOR[g.recall('vocMajor')] || CN.pick(['auto repair', 'CNC machining', 'nursing', 'e-commerce', 'cooking'])); g.remember('lifePath', 'college'); g.info('学历', 'Junior college (in progress)'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · Vocational and Technical College'); },
          res: (g) => 'You get in. You are still studying ' + g.recall('major') + ', just at a bigger school.' },
        { t: (g) => 'Stay at the factory and become permanent (' + CN.jobLine(g, 'worker', 3) + ')', dev: 5,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', 'Skilled worker'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · Workshop'); },
          res: (g) => 'On the day you are made permanent, the squad leader lets you run a machine on your own,' + payWord(g) + '. ' },
        { t: (g) => 'Join the army (' + CN.jobLine(g, 'soldier', 3) + ')', dev: 15, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setJob(g, 'soldier', 'Soldier'); g.move('road', 'On the way to the base'); g.stat('健康', 5); },
          res: 'You get a buzz cut and wave to your mom at the train station.',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', 'Skilled worker'); CN.goCity(g, 3); }, res: 'You fail the medical exam. You go back to the factory where you interned.' } },
      ] }),
    dec({ id: 'y_work18', age: 18, t: 'Away from Home', loc: 'factory', cond: (g) => working(g) && ['junior', 'primary'].includes(g.recall('edu')),
      text: (g) => 'You are in ' + (g.recall('workCity') || 'a faraway city') + ' and have worked for two years,' + payWord(g) + '. ' + (g.recall('workPlan') === 'study' ? 'The night school classes are nearly finished.' : g.recall('workPlan') === 'city' ? 'You are on your second electric scooter.' : 'You could do the assembly-line work with your eyes closed.'),
      choices: [
        { t: 'Keep working and save up', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.5), 'safe'); g.stat('心情', -2); }, res: (g) => 'Every month you send half your pay home. You scrape together what is left and open a fixed deposit worth ' + CN.fmt(last.amt) + '.' },
        { t: (g) => 'Go to a big city and deliver food (' + CN.jobLine(g, 'rider', 1) + ')', dev: 15,
          fx: (g) => { CN.setJob(g, 'rider', 'Delivery rider'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · Urban village'); g.stat('健康', -2); },
          res: (g) => 'In ' + g.recall('workCity') + ', you rent an electric scooter and run twenty orders on the first day. You hustle hard,' + payWord(g) + '. ' },
        { t: (g) => 'Learn a trade from a master (apprentice pay $360 a month; once qualified, ' + CN.jobLine(g, 'worker', null, 6) + ')', dev: 15,
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.setJob(g, 'worker', { cook: 'Apprentice cook', auto: 'Auto repair apprentice', hair: 'Hairdressing apprentice', elec: 'Electrician apprentice' }[s]); },
          res: 'An apprentice makes only $360 a month, and your master has a temper. You are the last to leave every day.' },
      ] }),

    /* ================= 19 岁 ================= */
    { id: 'y_firstleave', age: 18, t: 'First Time Away from Home', auto: true, cond: (g) => g.recall('lifePath') === 'uni' || g.recall('lifePath') === 'college',
      text: (g) => (rural(g) ? (g.alive('fa') ? 'Your dad carries your bedding to the foot of the dorm building. He does not come up, saying the stairs are too narrow.' : 'You carry your bedding up by yourself. A roommate’s mother gives you an extra apple.') : (g.alive('mo') ? 'Your mom makes your bed and wipes down the cupboard once more. When she leaves, she does not look back.' : 'You make your bed alone. That evening, home calls to ask if you have eaten.')) },
    { id: 'y_repeat', age: 19, t: 'The Gaokao, Again', auto: true, cond: (g) => g.recall('lifePath') === 'repeat',
      fx: (g) => { const r = gaokao(g, 8); g.remember('gk', r === 'fail' ? 'college' : r); },
      text: (g) => 'You lost about ten pounds during the repeat year. When the second results come out, your score puts you ' + ({ top: 'among the best in the city', good: 'above the first-tier cutoff', normal: 'above the bachelor’s cutoff', college: 'at the junior college cutoff' }[g.recall('gk')]) + '. ' },
    zhiyuan('y_zhiyuan2', 19, (g) => g.recall('lifePath') === 'repeat' && ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_repeat_college', age: 19, t: 'Junior College Again', loc: 'home', cond: (g) => g.recall('lifePath') === 'repeat' && g.recall('gk') === 'college',
      text: 'After a whole year of repeating, your score is still only enough for a junior college.',
      choices: [
        { t: 'Accept it and go', canon: true, fx: (g) => { g.remember('major', CN.pick(['nursing', 'auto repair', 'e-commerce', 'mechatronics'])); g.remember('lifePath', 'college'); g.info('学历', 'Junior college (in progress)'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · Vocational and Technical College'); }, res: 'You are a year older than your classmates. Nobody knows.' },
        { t: 'Go out and find work', dev: 10, fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', 'High school'); CN.setJob(g, 'worker', 'Factory worker'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · Industrial park'); }, res: (g) => 'You sell all your repeat-year books and trade them for a train ticket. You start at the factory' + payWord(g) + '. ' },
      ] }),
    dec({ id: 'y_campus', age: 19, t: 'Freshman Year', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: 'After lights-out in the dorm, someone is still on the phone in the corridor. College is not quite what you imagined, and no one is keeping an eye on you.',
      choices: [
        { t: 'Live in the library and grind for grades', canon: true, fx: (g) => { g.remember('campus', 'study'); g.stat('学识', 6); g.stat('心情', -2); CN.earn(g, 5000); }, res: 'You win a first-class scholarship, $700. Your roommates say you are no fun and make you treat them.' },
        { t: 'Join a club and meet people', dev: 10, fx: (g) => { g.remember('campus', 'club'); g.stat('人缘', 6); g.stat('心情', 3); }, res: 'You become a deputy head of the club, and your phone gains two hundred contacts.' },
        { t: 'Fall in love', dev: 10, check: ['人缘', 45],
          fx: (g) => { g.remember('campus', 'love'); g.remember('love', 'dating'); g.remember('loveFrom', 'campus'); g.info('婚姻', 'Dating'); g.stat('心情', 8); },
          res: 'You first talk to each other at the canteen door. After that, you go to the 8 a.m. class together every day.',
          fail: { fx: (g) => { g.remember('campus', 'game'); g.stat('心情', -3); }, res: 'You are turned down. You spend a whole semester playing games in your dorm.' } },
      ] }),
    dec({ id: 'y_work19', age: 19, t: 'The City', loc: 'metro', cond: (g) => working(g),
      text: (g) => 'In ' + (g.recall('workCity') || 'The City') + ', your first Spring Festival, you do not go home. Overtime pay is triple the usual, the factory makes dumplings, and you eat three.',
      choices: [
        { t: 'Save wherever you can and put the money away', canon: true, fx: (g) => { g.remember('workStyle', 'save'); last.amt = CN.invest(g, r1000(cash(g) * 0.6), 'safe'); g.stat('心情', -2); }, res: (g) => 'You go to the bank and put ' + CN.fmt(last.amt) + ' into a fixed deposit. You tuck the slip behind your ID card.' },
        { t: 'Go out with your coworkers and see something of the world', dev: 10, fx: (g) => { g.remember('workStyle', 'fun'); CN.pay(g, 6000); g.stat('心情', 5); g.stat('人缘', 4); }, res: 'You all go to the seaside, and the trip costs $860. It is the first time you have seen the sea, and you stand there for a long time.' },
        { t: 'Take night classes and earn a certificate', dev: 15, fx: (g) => { g.remember('workStyle', 'study'); CN.pay(g, 4000); g.stat('学识', 6); g.stat('健康', -2); }, res: 'Tuition is $570. After work you go to class and often fall asleep in the back row. You pass the exam.' },
      ] }),

    /* ================= 20 岁 ================= */
    dec({ id: 'y_army_back', age: 20, t: 'Discharge', loc: 'road', cond: (g) => g.recall('lifePath') === 'army',
      text: 'Your two years of service are up. The political instructor asks if you want to stay and become a sergeant. If you leave, you get a discharge payment of about $8,600.',
      choices: [
        { t: 'Stay on and become a sergeant', dev: 10, fx: (g) => { g.remember('army', 'stay'); CN.setJob(g, 'soldier', 'Sergeant'); g.stat('健康', 4); g.stat('事业', 6); }, res: 'The insignia on your shoulder changes color.' },
        { t: 'Leave the army and go home to take the civil service exam', canon: true,
          fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); if (g.s('学识') >= 45 || g.rnd() < 0.5) { CN.setJob(g, 'civil', 'Local civil servant'); toCounty(g); } else { CN.setJob(g, 'driver', 'Driver'); CN.goCity(g, 3); } },
          res: (g) => 'Your $8,600 discharge payment arrives. ' + (g.recall('job') === 'civil' ? 'Veterans get bonus points, and you pass the exam for a post in the county government' : 'You fail the civil service exam. You get a driver’s license and drive for a company in the city') + payWord(g) + '. ' },
        { t: 'Leave the army and go into logistics in a big city', dev: 10, fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.earn(g, 60000); CN.setJob(g, 'driver', 'Logistics driver'); CN.goCity(g, 1); }, res: (g) => 'Logistics companies like people who have served. You drive the night run' + payWord(g) + '. ' },
      ] }),
    dec({ id: 'y_side', age: 20, t: 'Spare Time', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: 'It is your second year. Some of the people around you are interning, some have part-time jobs, and some are playing games.',
      choices: [
        { t: 'Find a company to intern at', canon: true, fx: (g) => { g.remember('uniSide', 'intern'); CN.earn(g, 6000); g.stat('事业', 5); g.stat('学识', 2); }, res: 'The internship pays $430 a month, and you last two months. You learn to make spreadsheets, and you learn to read your boss’s face.' },
        { t: 'Tutor and deliver food to earn living costs', dev: 10, fx: (g) => { g.remember('uniSide', 'money'); CN.earn(g, 15000); g.stat('学识', -1); }, res: 'Over the year you earn $2,100. You never ask your family for living money again.' },
        { t: 'Start a small project with classmates', dev: 20, check: ['学识', 72],
          fx: (g) => { g.remember('uniSide', 'project'); g.stat('事业', 4); g.stat('学识', 4); }, res: 'The mini app you built has a few thousand users. Someone asks if you want to raise funding.',
          fail: { fx: (g) => { g.remember('uniSide', 'none'); g.stat('心情', -3); }, res: 'The project falls apart halfway. You pay for the farewell dinner.' } },
      ] }),
    dec({ id: 'y_work20', age: 20, t: 'A Different Way to Live', loc: 'factory', cond: (g) => working(g) && !g.recall('army'),
      text: (g) => (g.recall('workStyle') === 'study' ? 'The certificate you earned gives you a chance to switch jobs. ' : 'Orders at the factory are shrinking, and a few robotic arms have appeared on the shop floor. ') + 'Right now you are on the job' + payWord(g) + '. ',
      choices: [
        { t: (g) => 'Learn a trade so you do not depend on the assembly line (apprenticeship fee $700; once qualified, ' + CN.jobLine(g, 'worker', null, 4) + ')', canon: true, cond: (g) => !g.recall('skill'),
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.pay(g, 5000); CN.setJob(g, 'worker', { cook: 'Cook', auto: 'Auto mechanic', hair: 'Hairdresser', elec: 'Electrician' }[s]); g.stat('事业', 4); },
          res: 'You pay $700 to become an apprentice. Half a year later, your master says you can set up on your own.' },
        { t: (g) => 'Go and deliver food (' + CN.jobLine(g, 'rider', 1) + ')', dev: 10, cond: (g) => g.recall('job') !== 'rider',
          fx: (g) => { CN.setJob(g, 'rider', 'Delivery rider'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · Urban village'); g.stat('健康', -3); },
          res: (g) => 'You ride twelve hours a day,' + payWord(g) + ', and your knees start to ache.' },
        { t: (g) => 'Learn to livestream (equipment $430, ' + CN.jobLine(g, 'creator') + ')', dev: 20, check: ['人缘', 50],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, 'creator', 'Livestreamer'); g.stat('心情', 3); }, res: 'The ring light and sound card cost $430. People watch your videos of daily life at the factory, and in the first month the tips cover your rent.',
          fail: { fx: (g) => { CN.pay(g, 3000); g.stat('心情', -4); }, res: 'The equipment costs $430. Your livestream often has only three viewers, and one of them is your mom.' } },
        { t: (g) => 'Go home and help the family (' + CN.jobLine(g, rural(g) ? 'farmer' : 'shop', rural(g) ? 5 : 4) + ')', dev: 10,
          fx: (g) => { goBack(g); g.remember('backHome', 'early'); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? 'Farms, with odd jobs in the off season' : 'Helps out in the family shop'); g.stat('心情', 3); },
          res: 'The day you come back, the road outside the house has just been paved with concrete. You earn less, but the food is hot.' },
      ] }),

    /* ================= 21 岁 ================= */
    dec({ id: 'y_plan', age: 21, t: 'Junior Year', loc: 'campus', cond: (g) => g.recall('lifePath') === 'uni',
      text: 'In the second half of junior year, the people in your dorm split into groups: grad school exam, civil service exam, job hunting.',
      choices: [
        { t: 'Look for a job', canon: true, fx: (g) => { g.remember('plan', 'job'); g.stat('事业', 3); }, res: 'You revise your résumé a dozen times.' },
        { t: 'Take the grad school entrance exam', dev: 10, fx: (g) => { g.remember('plan', 'grad'); g.stat('学识', 4); g.stat('心情', -3); }, res: 'You claim a seat by the window in the study room and stay there for a year.' },
        { t: 'Take the civil service exam', dev: 10, fx: (g) => { g.remember('plan', 'civil'); CN.pay(g, 3000); g.stat('学识', 3); }, res: 'You sign up for a $430 online course and buy a stack of exam prep books.' },
        { t: 'Study abroad', dev: 20, cond: (g) => ['rich', 'civil'].includes(g.recall('family')), fx: (g) => { g.remember('plan', 'abroad'); g.stat('学识', 3); }, res: 'You take the language test. Your family puts up $57,000, which your mom says she has been saving for you for many years.' },
      ] }),
    dec({ id: 'y_college_out', age: 21, t: 'Junior College Graduation', loc: 'campus', cond: (g) => g.recall('lifePath') === 'college',
      text: (g) => 'Three years go by fast. Among the ' + (g.recall('major') || 'same-major') + ' classmates, most have already signed a job.',
      choices: [
        { t: (g) => { const m = g.recall('major'); const j = { 'nursing': 'nurse', 'early-childhood education': 'teacher', 'robot repair': 'worker', 'e-commerce': 'sales' }[m] || 'worker'; return 'Look for a job in your field (' + CN.jobLine(g, j, ['robot repair', 'e-commerce'].includes(m) ? 2 : 3) + ')'; }, canon: true,
          fx: (g) => {
            CN.setEdu(g, 'college', 'Junior College'); g.remember('lifePath', 'work');
            const m = g.recall('major');
            if (m === 'nursing') { CN.setJob(g, 'nurse', 'Nurse'); CN.goCity(g, 3); g.move('hospital', g.recall('workCity') + ' · City hospital'); }
            else if (m === 'early-childhood education') { CN.setJob(g, 'teacher', 'Kindergarten teacher'); CN.goCity(g, 3); }
            else if (m === 'robot repair') { CN.setJob(g, 'worker', 'Robot maintenance technician'); CN.goCity(g, 2); g.move('factory', g.recall('workCity') + ' · Automated factory'); }
            else if (m === 'e-commerce') { CN.setJob(g, 'sales', 'E-commerce operations'); CN.goCity(g, 2); g.move('office', g.recall('workCity') + ' · E-commerce park'); }
            else { CN.setJob(g, 'worker', 'Skilled worker'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · Workshop'); }
          },
          res: (g) => 'You are in ' + g.recall('workCity') + ' and have started work. Your job title is ' + (JY.engine.get().L.info['职业'] || '') + ', ' + payWord(g) + '. ' },
        { t: 'Upgrade to a bachelor’s with two more years', dev: 15, check: ['学识', 66],
          fx: (g) => { g.remember('lifePath', 'uni'); g.remember('uni', 'normal'); g.remember('plan', 'job'); g.info('学历', 'Bachelor’s (in progress)'); g.stat('学识', 3); },
          res: 'You pass. Your diploma will say “bachelor’s.”',
          fail: { fx: (g) => { CN.setEdu(g, 'college', 'Junior College'); g.remember('lifePath', 'work'); CN.setJob(g, 'sales', 'Salesperson'); CN.goCity(g, 2); }, res: 'You fall a few points short. With your junior college diploma, you go into sales, on base pay plus commission.' } },
        { t: 'Go home and open a shop', dev: 20,
          fx: (g) => { CN.setEdu(g, 'college', 'Junior College'); g.remember('lifePath', 'work'); g.remember('backHome', 'early'); toCounty(g); CN.setJob(g, 'shop', 'Runs a small shop'); CN.earn(g, 20000); CN.pay(g, 40000); g.stat('心情', 3); },
          res: (g) => 'You are in ' + g.recall('workCity') + ', where you take over a shopfront on the street. The transfer fee plus renovation comes to $5,700, and ' + parentWord(g) + ' paid half.' },
      ] }),
    dec({ id: 'y_love21', age: 21, t: 'Someone', loc: 'metro', cond: (g) => working(g) && loveIs(g, 'single'),
      text: (g) => 'Among the fellow villagers also working hard in ' + (g.recall('workCity') || 'The City') + ', there is one who always saves you a meal.',
      choices: [
        { t: 'Give it a try', canon: true, fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', 'Dating'); g.stat('心情', 6); }, res: 'After work you go for spicy hot pot together, a bowl each with an egg added, $5 for the two of you.' },
        { t: 'Look after yourself first; no dating for now', dev: 10, fx: (g) => { g.remember('singleWay', 'self'); g.stat('事业', 2); }, res: 'You put all that energy into earning money.' },
      ] }),

    /* ================= 22 岁：毕业 ================= */
    { id: 'y_grad_result', age: 22, t: 'Graduation Season', auto: true, cond: (g) => g.recall('lifePath') === 'uni',
      fx: (g) => {
        const p = g.recall('plan');
        const uniB = { top: 15, good: 6, normal: 0 }[g.recall('uni')] || 0;
        if (p === 'grad' && g.s('学识') + uniB + g.rnd() * 20 >= 88) { g.remember('lifePath', 'grad'); CN.setEdu(g, 'bachelor', 'Bachelor’s'); g.info('学历', 'Master’s (in progress)'); g.move('campus', g.recall('workCity') + ' · Graduate school'); }
        else if (p === 'civil' && g.s('学识') + uniB + g.rnd() * 25 >= 90) { CN.setEdu(g, 'bachelor', 'Bachelor’s'); g.remember('lifePath', 'work'); CN.setJob(g, 'civil', 'Civil servant'); CN.goCity(g, CN.pick([2, 3, 4])); g.move('office', g.recall('workCity') + ' · Government compound'); }
        else if (p === 'abroad') { CN.setEdu(g, 'bachelor', 'Bachelor’s'); g.remember('lifePath', 'abroad'); g.info('学历', 'Studying for a master’s abroad'); g.move('campus', 'Abroad · A university'); }
        else { CN.setEdu(g, 'bachelor', 'Bachelor’s'); g.remember('gradFail', p === 'grad' || p === 'civil'); }
      },
      text: (g) => {
        const t = g.recall('lifePath');
        if (t === 'grad') return 'You pass the graduate entrance exam. On the day of the graduation photo, you know you still have three more years at school.';
        if (t === 'abroad') return 'As soon as the graduation ceremony ends, you head to the airport.';
        if (g.recall('job') === 'civil') return 'You pass the exam. On the public list, your name is third,' + payWord(g) + ', not much, but steady.';
        return (g.recall('gradFail') ? 'You did not make the cut in the exam. ' : '') + 'Everyone is smiling in the graduation photo. The farewell dinner goes on until the small hours, and ' + ({ love: 'you and your partner sit on the sports field until dawn.', club: 'the club members cry together.', study: 'you give your notebooks to a junior student.', game: 'you all play one last game together.' }[g.recall('campus')] || 'someone has had too much to drink.');
      } },
    dec({ id: 'y_offer', age: 22, t: 'First Job', loc: 'office', cond: (g) => g.recall('lifePath') === 'uni' && !g.recall('job'),
      text: (g) => 'You send out dozens of résumés, ' + (g.recall('uniSide') === 'intern' ? 'and the company where you interned replies first. ' : 'and there are few replies. ') + 'That year, many entry-level jobs are replaced by AI, and there are more people at the job fairs than openings.',
      choices: [
        { t: (g) => 'Go to a big city and join a big tech company (' + CN.jobLine(g, g.recall('major') === 'computer science' ? 'tech' : 'office', 1) + ')', dev: 10, check: ['学识', 84],
          fx: (g) => { CN.setJob(g, g.recall('major') === 'computer science' ? 'tech' : 'office', g.recall('major') === 'computer science' ? 'Programmer' : 'Big-company employee'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · Office tower'); g.remember('lifePath', 'work'); g.remember('offer22', 'big'); g.stat('健康', -3); },
          res: (g) => 'You get into a big company in ' + g.recall('workCity') + ',' + payWord(g) + '. Your badge hangs around your neck, and the metro is still packed at 10 p.m.',
          fail: { fx: (g) => { CN.setJob(g, 'office', 'Company employee'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: (g) => 'The big company does not take you. You go back to ' + g.recall('workCity') + ', where you work at a small company,' + payWord(g) + '. ' } },
        { t: (g) => 'Go back to the provincial capital and find a stable job (' + CN.jobLine(g, { 'medicine': 'doctor', 'teaching': 'teacher' }[g.recall('major')] || 'office', 2) + ')', canon: true,
          fx: (g) => {
            const m = g.recall('major');
            g.remember('offer22', 'stable');
            if (m === 'medicine') { CN.setJob(g, 'doctor', 'Resident doctor'); g.move('hospital', capital(g) + ' · Provincial hospital'); }
            else if (m === 'teaching') CN.setJob(g, 'teacher', 'Middle school teacher');
            else CN.setJob(g, 'office', 'Company employee');
            CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work');
          },
          res: (g) => 'You are in ' + g.recall('workCity') + ' and have started work,' + payWord(g) + '. It is not a lot, but you can go home on weekends.' },
        { t: (g) => 'Go home and take the exam for a permanent post (' + CN.jobLine(g, g.recall('major') === 'teaching' ? 'teacher' : 'civil', 4) + ')', dev: 10,
          fx: (g) => { CN.setJob(g, g.recall('major') === 'teaching' ? 'teacher' : 'civil', g.recall('major') === 'teaching' ? 'County high school teacher' : 'Township civil servant'); toCounty(g); g.remember('backHome', 'early'); g.remember('lifePath', 'work'); g.remember('offer22', 'civil'); g.stat('心情', 3); },
          res: (g) => 'You pass the exam for a permanent post,' + payWord(g) + '. Your mom sends a big red envelope in the relatives’ chat.' },
        { t: (g) => 'Go independent as a content creator (' + CN.jobLine(g, 'creator', 2) + ')', dev: 25, check: ['人缘', 55],
          fx: (g) => { CN.setJob(g, 'creator', 'Blogger'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.remember('offer22', 'media'); g.stat('心情', 4); },
          res: 'One of your videos about renting goes viral. Half a year later, the ad money is enough to live on.',
          fail: { fx: (g) => { CN.setJob(g, 'freelance', 'Freelancer'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: 'Your followers grow slowly. You take odd jobs and just about scrape the rent together.' } },
      ] }),
    dec({ id: 'y_worker22', age: 22, t: 'Stay or Go Back', loc: 'metro', cond: (g) => working(g) && !white(g) && !g.recall('army') && away(g),
      text: (g) => 'You go home for the New Year. ' + (g.recall('workStyle') === 'save' ? 'You gave ' + parentWord(g) + ' a bulging red envelope.' : 'You have hardly any money left in your pockets. ') + (g.alive('fa') ? 'Your dad' : 'Your family') + ' asks when you plan to stop drifting around out there. You are in ' + here(g) + payWord(g) + ', and monthly rent is ' + CN.fmt(RENT_M[tierNow(g)] || 1500) + '. ',
      choices: [
        { t: 'Stay in the city and keep at it', canon: true, fx: (g) => { g.remember('stayCity', true); g.stat('事业', 3); }, res: 'On the sixth day of the new year, you board a bus heading out again.' },
        { t: 'Go home and open a shop', dev: 20, cond: (g) => !!g.recall('skill') || g.recall('workStyle') === 'save',
          fx: (g) => { goBack(g); toCounty(g); g.remember('backHome', 'early'); CN.setJob(g, 'shop', { cook: 'Runs a small restaurant', auto: 'Runs a car repair shop', hair: 'Runs a barber shop', elec: 'Runs a hardware store' }[g.recall('skill')] || 'Runs a corner shop'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.8, 60000)); CN.pay(g, last.amt); g.stat('心情', 5); },
          res: (g) => 'A year of rent plus renovation for the shopfront costs ' + CN.fmt(last.amt) + '. On opening day you set off a string of firecrackers. Your first customer is a primary-school classmate.' },
        { t: 'Try your luck in a farther city', dev: 15, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { CN.goCity(g, 1, CN.pick(['Shanghai', 'Shenzhen', 'Beijing', 'Hangzhou'])); g.remember('stayCity', true); g.stat('心情', -2); },
          res: (g) => 'You go to ' + g.recall('workCity') + '. The same job,' + payWord(g) + ', yet monthly rent is ' + CN.fmt(RENT_M[1]) + '. It takes you three days to make sense of the metro map.' },
        { t: 'Follow a fellow villager to a bigger factory', dev: 10, cond: (g) => tierNow(g) === 1,
          fx: (g) => { g.remember('stayCity', true); CN.setJob(g, 'worker', 'Line leader at a big factory'); g.stat('事业', 4); },
          res: 'The new factory provides housing, four to a dorm room. You become a line leader, in charge of twenty people.' },
      ] }),
    dec({ id: 'y_credit22', age: 22, t: 'Buy Now, Pay Later', loc: 'home', cond: (g) => working(g) && !!g.recall('money0'),
      text: 'Your phone is four years old, with a crack across the screen. A shopping app pops up a line: buy now, pay later, interest-free installments, credit limit $4,300.',
      choices: [
        { t: 'Do not borrow; save up first', canon: true, fx: (g) => { g.remember('credit', 'none'); CN.pay(g, 2000); }, res: 'You pay $290 to replace the screen. The phone is good for two more years.' },
        { t: 'Buy a new phone in installments', dev: 10, fx: (g) => { g.remember('credit', 'phone'); CN.pay(g, 6000); g.stat('心情', 3); }, res: 'An $860 phone, in twelve installments of $70 a month. You are pretty happy on unboxing day.' },
        { t: 'Open the credit line and buy what you like', dev: 20, fx: (g) => { g.remember('credit', 'loan'); g.remember('debt', debtW(g) + 3); g.stat('心情', 4); }, res: 'A new phone, a new computer, a pair of earbuds: you run up $4,300 in one month. The bill says “minimum payment.”' },
      ] }),

    /* ================= 23 岁 ================= */
    dec({ id: 'y_abroad', age: 23, t: 'Abroad', loc: 'campus', cond: (g) => g.recall('lifePath') === 'abroad',
      text: 'Your master’s is nearly done. You search the supermarket for a long time before finding a decent bottle of chili sauce.',
      choices: [
        { t: 'Return to China', canon: true, fx: (g) => { CN.setEdu(g, 'master', 'Master’s (overseas)'); g.remember('lifePath', 'work'); CN.setJob(g, 'office', 'Foreign-company employee'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · Office tower'); }, res: (g) => 'You land in ' + g.recall('workCity') + ', and your first meal is hotpot. The new job starts' + payWord(g) + '. ' },
        { t: 'Stay abroad and work for a few years', dev: 20, fx: (g) => { CN.setEdu(g, 'master', 'Master’s (overseas)'); g.remember('lifePath', 'work'); g.remember('abroadStay', true); CN.setJob(g, 'office', 'Working overseas'); g.move('office', 'Abroad · A company'); g.info('住处', 'abroad'); g.stat('人缘', -4); }, res: 'Your video calls with home go from daily to weekly.' },
      ] }),
    dec({ id: 'y_grad23', age: 23, t: 'First Year of Grad School', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: 'Your advisor’s first task for you is to help him claim reimbursements for receipts. The graduate stipend is $210 a month.',
      choices: [
        { t: 'Work on projects with your advisor', canon: true, fx: (g) => { g.remember('gradWay', 'lab'); g.stat('学识', 6); g.stat('心情', -2); }, res: 'You spend two Spring Festivals in the lab.' },
        { t: 'Do more internships', dev: 10, fx: (g) => { g.remember('gradWay', 'intern'); CN.earn(g, 20000); g.stat('事业', 6); }, res: 'You intern at a company for a year and save $2,900. When you leave, your manager says to come and find him after you graduate.' },
      ] }),
    dec({ id: 'y_rent', age: 23, t: 'Renting', loc: 'home', cond: (g) => working(g) && white(g) && tierNow(g) <= 3 && !g.recall('house') && !withParents(g) && !g.recall('abroadStay'),
      text: (g) => 'In ' + here(g) + ', ' + payWord(g) + '. A decent one-bedroom rents for ' + CN.fmt(RENT_M[tierNow(g)]) + ' a month, with one month’s deposit and three months’ rent paid up front. ',
      choices: [
        { t: 'Share a flat to save money', canon: true, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'share'); CN.earn(g, RENT_M[tierNow(g)] * 5); g.stat('心情', -2); }, res: (g) => 'A single room costs ' + CN.fmt(RENT_M[tierNow(g)] * 0.55) + '. You share a bathroom with three strangers and have to queue in the morning. On weekends one roommate makes a huge pot of braised pork and gives you a bowl.' },
        { t: 'Grit your teeth and rent a one-bedroom on your own', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'whole'); CN.pay(g, RENT_M[tierNow(g)] * 3); g.stat('心情', 4); }, res: 'You buy a pothos plant for the windowsill. Coming home from work, the lamp in the flat is one you switched on yourself.' },
        { t: 'Live in the suburbs with a two-hour commute', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'far'); CN.earn(g, RENT_M[tierNow(g)] * 6); g.stat('健康', -3); }, res: (g) => 'Monthly rent is only ' + CN.fmt(RENT_M[tierNow(g)] * 0.5) + '. You finish a lot of books on the metro.' },
      ] }),
    dec({ id: 'y_love23', age: 23, t: 'Blind Dates', loc: 'home', cond: (g) => working(g) && loveIs(g, 'single') && (rural(g) || county(g)),
      text: (g) => 'You go home for the New Year. ' + (g.alive('mo') ? 'Your mom' : 'Your aunt') + ' has lined up three blind dates, one a day.',
      choices: [
        { t: 'Go and meet them, and date if it feels right', canon: true, check: ['人缘', 40],
          fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', 'Dating'); g.stat('心情', 4); }, res: 'The second one does not say much, and walks you to the mouth of the alley when you leave.',
          fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -3); }, res: 'None of the three works out. On the way back, you buy yourself a candied hawthorn skewer.' } },
        { t: 'Go to none of them', dev: 15, fx: (g) => { g.remember('singleWay', 'refuse'); g.stat('心情', 2); g.stat('人缘', -4); }, res: 'No one at home speaks to you for three days. On the fourth morning, there is still a bowl of noodles left out for you on the table.' },
      ] }),
    dec({ id: 'y_save23', age: 23, t: 'First Savings', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 15000 && !g.recall('abroadStay'),
      text: (g) => 'For the first time in all your working years, your card holds ' + CN.fmt(cash(g)) + '. At lunch your coworkers talk about funds and stocks, and some say money is safest in the bank.',
      choices: moneyChoices() }),

    /* ================= 24 岁：AI 来了 ================= */
    dec({ id: 'y_ai24', age: 24, t: 'Replaced', loc: 'office', cond: (g) => working(g) && AI_JOBS.includes(g.recall('job')) && !g.recall('abroadStay'),
      text: (g) => ({ tech: 'The company has brought in a new AI that writes code, and the team has been cut by a third. ', office: 'The reports you make can now be produced by AI in a few seconds. ', sales: 'Customers have started chatting with AI customer service. ', worker: 'Another batch of robots has arrived on the shop floor, and one line now needs only two people watching it. ', rider: 'Driverless vehicles have started delivering takeout in the neighborhood. ', driver: 'Driverless freight trucks have hit the highway. ' }[g.recall('job')]) + 'Your position looks shaky.',
      choices: [
        { t: 'Learn new things and change with the times', canon: true, check: ['学识', 70],
          fx: (g) => { g.remember('aiMove', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); g.stat('事业', 5); if (['worker', 'rider', 'driver'].includes(g.recall('job'))) CN.setJob(g, 'worker', 'Robot maintenance technician'); },
          res: 'You pay $700 for a training course and stay up late for months, learning how to work with machines. You keep your job.',
          fail: { fx: (g) => { g.remember('aiMove', 'laid'); last.amt = r1000(perMonth(g) * 3); CN.earn(g, last.amt); g.stat('心情', -6); CN.setJob(g, 'freelance', 'Odd jobs'); }, res: (g) => 'You are laid off anyway. The severance pay is ' + CN.fmt(last.amt) + '. You sit outside the office building all afternoon. That evening, ' + (married(g) ? 'your family' : 'a friend') + ' cooks you a bowl of noodles.' } },
        { t: (g) => 'Switch careers and become an AI trainer (' + CN.jobLine(g, 'tech') + ')', dev: 15, fx: (g) => { g.remember('aiMove', 'switch'); CN.setJob(g, 'tech', 'AI trainer'); g.stat('事业', 3); }, res: (g) => 'Your new job is teaching machines to speak like humans. It sounds a bit funny,' + payWord(g) + '. ' },
        { t: (g) => 'Take up work that machines cannot do: caregiving (' + CN.jobLine(g, 'nurse') + ')', dev: 15,
          fx: (g) => { g.remember('aiMove', 'care'); CN.setJob(g, g.rnd() < 0.5 ? 'nurse' : 'freelance', g.rnd() < 0.5 ? 'Caregiver' : 'Housekeeper'); g.stat('人缘', 5); },
          res: 'You look after elderly people. They cannot remember your name, but they remember your voice.' },
      ] }),
    dec({ id: 'y_steady24', age: 24, t: 'Settled', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay'),
      text: (g) => ({ civil: 'In your unit, you can see all the way to retirement from where you sit. ', teacher: 'The first class you taught has graduated. ', doctor: 'After three years of residency training, you cannot remember the last time you slept a full eight hours. ', nurse: 'Night shifts come one after another. ', shop: 'The shop has been open two years, and business is neither good nor bad. ', creator: 'Your follower count has hit a plateau. ', soldier: 'Life in the army is very regular. ', farmer: 'There are fewer and fewer young people in the village. ', freelance: 'Work comes in fits and starts. ', boss: 'You now have five people working under you. ' }[g.recall('job')] || 'The days go by one after another. ') + 'You are in ' + here(g) + payWord(g) + '. You ask yourself: is this it?',
      choices: [
        { t: 'This is fine as it is', canon: true, fx: (g) => { g.remember('steady', 'stay'); g.stat('心情', 4); g.stat('事业', 2); }, res: (g) => (white(g) ? 'You keep your desk very tidy,' : 'You keep your workload well organized,') + ' and a succulent sits on the windowsill.' },
        { t: 'Move up and fight for a position', dev: 10, check: ['人缘', 50], fx: (g) => { g.remember('steady', 'up'); g.stat('事业', 8); g.stat('健康', -2); }, res: 'You volunteer for the hardest work. By year-end, your boss has noticed you.', fail: { fx: (g) => { g.remember('steady', 'stuck'); g.stat('心情', -4); }, res: 'The position goes to someone else. You sit at your desk for a long time, then go out for a good meal after work.' } },
        { t: 'Quit and move to a bigger city', dev: 20, cond: (g) => tierNow(g) >= 2,
          fx: (g) => { g.remember('steady', 'move'); CN.goCity(g, tierNow(g) >= 3 ? 2 : 1, tierNow(g) >= 3 ? capital(g) : undefined); if (g.recall('job') !== 'tech') CN.setJob(g, 'office', 'Company employee'); CN.pay(g, RENT_M[tierNow(g)] * 4); g.stat('心情', 3); },
          res: (g) => 'You go to ' + g.recall('workCity') + '. You start the new job' + payWord(g) + ', and paying a deposit plus three months’ rent up front costs you ' + CN.fmt(RENT_M[tierNow(g)] * 4) + '. Nobody knows you here, which feels like a relief.' },
        { t: 'Quit and move back to a smaller city', dev: 15, cond: (g) => tierNow(g) <= 2,
          fx: (g) => { g.remember('steady', 'small'); CN.goCity(g, 3); if (!['civil', 'teacher', 'doctor', 'nurse'].includes(g.recall('job'))) CN.setJob(g, 'office', 'Company employee'); g.stat('心情', 5); g.stat('健康', 2); },
          res: (g) => 'You go to ' + g.recall('workCity') + '. Pay drops, leaving you' + payWord(g).replace(/^.*?大概 /, '') + ', but monthly rent is only ' + CN.fmt(RENT_M[3]) + '. It is still light out when you get off work.' },
      ] }),

    /* ================= 25 岁 ================= */
    dec({ id: 'y_grad_out', age: 25, t: 'Master’s Graduation', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: 'After your defense, your advisor asks if you want to go on to a doctorate.',
      choices: [
        { t: 'Go to work', canon: true,
          fx: (g) => { CN.setEdu(g, 'master', 'Master’s'); g.remember('lifePath', 'work'); const m = g.recall('major'); CN.setJob(g, m === 'computer science' ? 'tech' : m === 'medicine' ? 'doctor' : 'office', m === 'computer science' ? 'Algorithm engineer' : m === 'medicine' ? 'Doctor' : 'Researcher'); CN.goCity(g, g.recall('gradWay') === 'intern' ? 1 : 2); g.move('office', g.recall('workCity') + ' · Office tower'); },
          res: (g) => (g.recall('gradWay') === 'intern' ? 'Your manager from the internship keeps his promise. ' : 'You send out twenty résumés and get three interviews. ') + 'You are in ' + g.recall('workCity') + ' and have started work,' + payWord(g) + '. ' },
        { t: 'Go for a PhD', dev: 20, fx: (g) => { CN.setEdu(g, 'master', 'Master’s'); g.remember('lifePath', 'phd'); g.info('学历', 'PhD (in progress)'); g.stat('学识', 6); }, res: 'You stay on at the university, on a stipend of $500 a month. Your classmates start getting married.' },
      ] }),
    dec({ id: 'y_dating25', age: 25, t: 'Meeting the Parents', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => ({ campus: 'You have been together since university, and ', work: 'You have looked after each other in the city for a few years, and ', blind: 'You met on a blind date more than a year ago, and ', online: 'You went from chatting online to meeting in person, and ' }[g.recall('loveFrom')] || 'You have been together for a while, and ') + 'your partner says it is time to meet each other’s parents.',
      choices: [
        { t: 'Take your partner home to meet Mom and Dad', canon: true, cond: (g) => parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: (g) => 'You carry $430 worth of gifts home. ' + (g.alive('mo') ? 'Your mom cooks a whole table of dishes. Your partner eats three bowls of rice, and your mom is delighted.' : 'Your dad does the cooking, and the dishes are a bit salty. Your partner cleans every plate.') },
        { t: 'Visit your partner’s family for the New Year', canon: true, cond: (g) => !parentAlive(g), fx: (g) => { g.remember('metParents', true); CN.pay(g, 3000); g.stat('人缘', 4); }, res: 'You bring gifts to your partner’s home. Your partner’s mother keeps putting food in your bowl and says that from now on this is your home too.' },
        { t: 'Wait a little; you are not sure yet', dev: 10, fx: (g) => { g.remember('metParents', false); g.stat('心情', -2); if (g.rnd() < 0.4) { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', 'Single'); } }, res: (g) => (loveIs(g, 'single') ? 'Your partner does not wait. You break up.' : 'Your partner says nothing, but smiles less.') },
      ] }),
    dec({ id: 'y_love25', age: 25, t: 'one person', loc: 'home', cond: (g) => loveIs(g, 'single') && g.recall('lifePath') !== 'phd',
      text: (g) => 'On social media, some people get married and some show off their babies. ' + (withParents(g) ? 'You come home from work, and your mom brings up the neighbors’ kid at the dinner table again.' : 'You come home from work and order a $4 takeout.'),
      choices: [
        { t: 'Ask a friend to introduce someone', canon: true, check: ['人缘', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', 'Dating'); g.stat('心情', 5); }, res: 'The person your friend introduces is down to earth. On the first meeting you talk about housing prices. On the second, you talk about your childhoods.', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: 'You meet a few people, and none of it goes anywhere.' } },
        { t: 'Try your luck on a dating app', dev: 10, check: ['心情', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'online'); g.info('婚姻', 'Dating'); g.stat('心情', 4); }, res: 'You chat for a month before meeting. In person, they look better than their photos.', fail: { fx: (g) => { g.remember('singleWay', 'app'); g.stat('心情', -4); }, res: 'Somewhere in the chat, your match starts recommending investment products. You delete the app.' } },
        { t: 'Being on your own is fine too', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 2000); g.stat('心情', 3); g.stat('事业', 2); }, res: 'You pay $290 for a weekend pottery class. Your first bowl is badly lopsided, and you still eat from it.' },
      ] }),

    /* ================= 26 岁：结婚 ================= */
    dec({ id: 'y_marry', age: 26, t: 'Marriage', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => wedText(g) + 'You look at your partner and do not answer right away.',
      choices: [
        { t: 'Get married, following the customs back home', canon: true,
          fx: (g) => { const w = wedPlan(g); CN.marry(g, { origin: { campus: 'university classmate', work: 'from your hometown', blind: 'met on a blind date', online: 'met online' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 8); g.stat('人缘', 4); },
          res: (g) => 'You and ' + g.recall('spouse') + ' got married. ' + wedRes(g, last) },
        { t: 'Cannot agree on the bride price; hold off for now', dev: 15, cond: (g) => rural(g) || county(g), fx: (g) => { g.remember('caili', 'stuck'); g.stat('心情', -5); }, res: 'The two families part on bad terms. That night, your partner still sends you a message: “Home yet?”' },
        { t: 'Marry on a trip, with no banquet', dev: 15, fx: (g) => { CN.marry(g, { origin: 'sweetheart' }); g.remember('caili', 'travel'); CN.pay(g, 15000); g.stat('人缘', -3); g.stat('心情', 6); }, res: 'You go to the seaside, the trip costs $2,100, and you save the money you would have spent on a banquet. Your relatives say you are being inconsiderate.' },
        { t: 'Break up', dev: 20, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', 'Single'); g.stat('心情', -10); }, res: 'You delete the photos from your album, and stop halfway through.' },
      ] }),
    dec({ id: 'y_career26', age: 26, t: 'Job Hop', loc: 'office', cond: (g) => working(g) && !g.recall('abroadStay') && ['office', 'tech', 'sales', 'boss'].includes(g.recall('job')),
      text: (g) => 'A headhunter calls. You are working' + payWord(g) + ', and their offer is thirty percent higher.',
      choices: [
        { t: (g) => 'Jump (thirty percent more a month, up to ' + CN.fmt(r100(CN.jobPay(g, g.recall('job')) * 1.3)) + ' or so; if you cannot hold your ground during probation at the new company, you have to leave)', dev: 10, check: ['事业', 30], fx: (g) => { g.remember('jumped', true); g.stat('事业', 8); }, res: (g) => 'Your desk at the new company is on the twenty-eighth floor, and you can see the river,' + payWord(g) + '. ', fail: { fx: (g) => { g.remember('jumped', false); g.stat('心情', -3); }, res: 'After three rounds of interviews, you never hear back.' } },
        { t: (g) => 'Stay put and play it safe (currently about ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + ' a month, and you know the ropes)', canon: true, fx: (g) => { g.remember('jumped', false); g.stat('事业', 3); g.stat('心情', 1); }, res: 'You decline. The following month, the team lead position goes to you.' },
      ] }),
    dec({ id: 'y_side26', age: 26, t: 'After Work', loc: 'metro', cond: (g) => working(g) && !g.recall('abroadStay') && ['worker', 'rider', 'driver', 'shop', 'freelance', 'creator', 'nurse', 'farmer'].includes(g.recall('job')),
      text: (g) => 'You' + payWord(g) + '. ' + (kidN(g) || married(g) ? 'Household expenses grow bigger every year. ' : 'Rent, food, and a bit sent home leave very little at the end of the month. ') + 'Some people around you work on something else after clocking off.',
      choices: [
        { t: 'Do not push yourself; rest after work', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('健康', 2); }, res: 'In the evening you walk by the river, then go to bed early.' },
        { t: 'Pick up odd jobs in the evening, driving or running errands', dev: 10, fx: (g) => { g.remember('side', 'drive'); g.stat('健康', -3); }, res: 'You work three extra hours every night and make about $110 more a month.' },
        { t: 'Set up a stall at the night market on weekends', dev: 15, fx: (g) => { g.remember('side', 'stall'); CN.pay(g, 3000); g.stat('人缘', 3); }, res: 'The cart and stock cost $430. You sell grilled sausages and phone cases, and make $23 the first night.' },
        { t: 'Learn video editing and take short-video jobs', dev: 15, check: ['学识', 50],
          fx: (g) => { g.remember('side', 'video'); CN.pay(g, 2000); g.stat('学识', 3); }, res: 'The online course costs $290. Three months later, you land your first job, editing a promo video for a restaurant.',
          fail: { fx: (g) => { CN.pay(g, 2000); g.stat('心情', -2); }, res: 'The online course costs $290, and you drop it halfway through.' } },
      ] }),

    dec({ id: 'y_car26', age: 26, t: 'Buying a Car', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000 && !g.recall('abroadStay'),
      text: carText, choices: carChoices() }),
    /* ================= 27 岁：房子 ================= */
    dec({ id: 'y_house', age: 27, t: 'Buying a Flat', loc: 'home', cond: (g) => married(g) && !hasHouse(g) && !g.recall('abroadStay'),
      text: (g) => {
        const d = deal(g, buyTier(g), 0.7);
        return (g.recall('rentType') === 'share' ? 'You have had enough of sharing a flat. ' : '') + (isMale(g) ? 'Your mother-in-law' : 'Your mother-in-law') + ' says she cannot feel at ease while you have no flat of your own. '
          + 'In ' + buyPlace(g) + ', a small two-bedroom flat has a total price of ' + CN.fmt(d.price * 1e4) + ', down payment ' + CN.fmt(d.down) + '. You two have ' + CN.fmt(cash(g)) + ', and both sets of parents together can come up with ' + CN.fmt(famHelp(g)) + '. ';
      },
      choices: houseChoices(1.1, 0.7, 'a three-bedroom flat', 'a small two-bedroom flat') }),
    dec({ id: 'y_marry27', age: 27, t: 'Think It Over', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => (g.recall('caili') === 'stuck' ? 'The bride price talks dragged on for a year. Your partner’s family has eased up and says they will ask for less.' : 'You have been together for several years. Everyone around you keeps asking when you will hold the wedding.'),
      choices: [
        { t: 'Marriage', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: 'together for several years' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => 'You and ' + g.recall('spouse') + ' got married. You picked out the wedding candy yourself. ' + wedRes(g, last) },
        { t: 'Break up', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', 'Single'); g.stat('心情', -8); }, res: 'You part calmly, like two tired people.' },
      ] }),
    dec({ id: 'y_back27', age: 27, t: 'Go Back or Not', loc: 'metro', cond: (g) => tierNow(g) <= 2 && g.recall('hukou') !== 'city' && !g.recall('abroadStay') && parentAlive(g),
      text: (g) => 'You are in ' + here(g) + ' and have been there for several years,' + payWord(g) + '. ' + parentWord(g) + '’s phone calls are getting shorter, ' + (g.alive('fa') ? CN.who(g, 'fa', true) + ' has been having back trouble.' : CN.who(g, 'mo', true) + ' says eating alone is no fun.'),
      choices: [
        { t: 'Stay and push on for a few more years', canon: true, fx: (g) => { g.remember('backHome', 'no'); CN.pay(g, 3000); g.stat('事业', 4); g.stat('人缘', -2); }, res: (g) => 'You sent home a $430 massage chair. ' + parentWord(g) + ' sat in it on the video call, squinting and saying it felt great.' },
        { t: 'Go back home', dev: 15, fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); if (!['civil', 'teacher', 'shop'].includes(g.recall('job'))) CN.setJob(g, 'office', 'Local company employee'); g.stat('心情', 5); g.stat('人缘', 4); }, res: (g) => 'You go back to ' + g.recall('city') + '. Pay drops, leaving you' + payWord(g).replace(/^.*?大概 /, '') + ', and you eat dinner at home.' },
      ] }),
    dec({ id: 'y_startup', age: 27, t: 'Startup', loc: 'office', cond: (g) => working(g) && (g.recall('uniSide') === 'project' || g.recall('family') === 'rich' || g.s('事业') >= 45),
      text: (g) => 'An old classmate comes to you with an idea and needs only a partner. They want you to put in ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + ' for a stake.',
      choices: [
        { t: (g) => 'Quit and join in (stake ' + CN.fmt(Math.min(100000, r1000(cash(g) * 0.7))) + '; if it works, your income multiplies several times over, but only one or two in ten survive)', dev: 25, check: ['事业', 50], fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'ok'); CN.setJob(g, 'boss', 'Startup partner'); g.stat('健康', -4); }, res: 'In the third year, the company gets funding. You treat everyone to barbecue.', fail: { fx: (g) => { CN.withdraw(g); CN.pay(g, Math.min(100000, r1000(cash(g) * 0.7))); g.remember('startup', 'fail'); g.remember('debt', debtW(g) + 20); g.stat('心情', -8); }, res: 'You hold on for two years, then the company is gone. The money you put in is lost, and you owe another $29,000. Your old classmate treats you to a meal, and neither of you says much.' } },
        { t: (g) => 'Forget it, working for someone else is safer (' + CN.jobLine(g, g.recall('job') || 'office') + ')', canon: true, fx: (g) => { g.remember('startup', 'no'); g.stat('心情', 1); }, res: 'Later you see the company’s name in the news.' },
      ] }),
    dec({ id: 'y_burnout27', age: 27, t: 'Overtime', loc: 'office', cond: (g) => ['tech', 'office', 'doctor', 'boss'].includes(g.recall('job')),
      text: 'For three months straight, you have not gone to bed before midnight. Your checkup report has several arrows on it.',
      choices: [
        { t: 'Push through and deal with it after this stretch', canon: true, fx: (g) => { g.remember('burnout', 'push'); g.stat('健康', -8); g.stat('事业', 6); CN.earn(g, 20000); }, res: 'The project launches and you get a $2,900 bonus. You fall asleep in the taxi.' },
        { t: 'Lower your expectations and start working out', dev: 15, fx: (g) => { g.remember('burnout', 'rest'); CN.pay(g, 3000); g.stat('健康', 6); g.stat('事业', -2); g.stat('心情', 3); }, res: 'You buy a $430 gym membership, and this time you actually go.' },
      ] }),

    /* ================= 28 岁：孩子 ================= */
    dec({ id: 'y_kid', age: 28, t: 'Having a Child', loc: 'home', cond: (g) => married(g) && kidN(g) === 0,
      text: (g) => 'You have been married for two years. ' + (g.alive('mo') ? 'Every time your mom calls, she steers the conversation back to this. ' : '') + (g.recall('house') === 'rent' ? 'You are still renting. ' : '') + 'You do the math: having a baby will cost you about $2,900 out of pocket, and childcare is $430 a month.',
      choices: [
        { t: 'Have one and ask the grandparents to help', canon: true, cond: (g) => parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'grand'); CN.haveKid(g); CN.pay(g, 20000); if (!withParents(g)) CN.liveWith(g, [g.alive('mo') ? 'mo' : 'fa']); g.stat('心情', 4); g.stat('健康', isMale(g) ? 0 : -4); },
          res: (g) => 'The baby is born and named ' + g.name('k1') + '. ' + CN.who(g, g.alive('mo') ? 'mo' : 'fa') + ' moves in to help with the baby, and the house is suddenly lively. You hold the baby, and ' + CN.he(g, 'k1') + ' is so small that you do not know where to put your hands.' },
        { t: 'Have one and send them to daycare', canon: true, cond: (g) => !parentAlive(g),
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'paid'); CN.haveKid(g); CN.pay(g, 20000 + 36000); g.stat('心情', 4); },
          res: (g) => 'The baby is born and named ' + g.name('k1') + '. From age one the baby goes to daycare, at $5,100 a year. The teachers send a photo every day, and you fill a whole album.' },
        { t: 'Have one and keep someone home full time', dev: 15,
          fx: (g) => { g.remember('kidPlan', 'now'); g.remember('kidCare', 'home'); CN.haveKid(g); CN.pay(g, 20000); if (isMale(g)) g.remember('spWork', 'home'); else { g.remember('preKidJob', [g.recall('job'), JY.engine.get().L.info['职业'] || 'Working']); CN.setJob(g, 'none', 'Full-time mom'); } g.stat('心情', 3); },
          res: (g) => 'The baby is born and named ' + g.name('k1') + '. ' + (isMale(g) ? g.recall('spouse') + ' quit work to take care of the baby at home, leaving yours as the only paycheck.' : 'You quit work to take care of the baby at home, leaving only ' + g.recall('spouse') + '’s paycheck. ') + 'Money is tight, but the day ' + CN.he(g, 'k1') + ' laughs out loud for the first time, the whole family is there.' },
        { t: 'Wait two more years', dev: 10, fx: (g) => { g.remember('kidPlan', 'wait'); g.stat('事业', 3); }, res: 'You agree to wait until work is steadier.' },
        { t: 'No children', dev: 25, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); g.stat('人缘', -5); }, res: 'The older generation on both sides falls silent. You get a cat.' },
      ] }),
    dec({ id: 'y_single28', age: 28, t: 'Under Pressure', loc: 'home', cond: (g) => single(g),
      text: (g) => 'Home for the New Year, the aunts and uncles at the dinner table take turns asking. ' + (g.recall('singleWay') === 'self' ? 'You worked out long ago how to answer.' : 'You keep your head down and eat.'),
      choices: [
        { t: 'Agree to your family and go on another blind date', canon: true, check: ['人缘', 40], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', 'Dating'); g.stat('人缘', 3); }, res: 'This one is decent, and knows you do not eat cilantro. You arrange a second date.', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -4); }, res: 'It does not work out again. Your mom says: no hurry, take your time.' } },
        { t: 'No hurry; just live your own life', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 3); g.stat('人缘', -3); }, res: (g) => (away(g) ? 'On the second day of the New Year you go back to the city and enjoy a quiet holiday.' : 'On the second day of the New Year you hide at a friend’s place drinking tea and enjoy a quiet holiday.') },
      ] }),

    /* ================= 29 岁 ================= */
    dec({ id: 'y_phd_out', age: 29, t: 'PhD Graduation', loc: 'campus', cond: (g) => g.recall('lifePath') === 'phd',
      text: 'Your thesis is finally approved. You are twenty-nine, and before you have drawn your first proper paycheck, you see a university job posting.',
      choices: [
        { t: 'Teach at a university', canon: true, fx: (g) => { CN.setEdu(g, 'phd', 'PhD'); g.remember('lifePath', 'work'); CN.setJob(g, 'teacher', 'University lecturer'); CN.goCity(g, 2); g.move('campus', g.recall('workCity') + ' · A university'); g.stat('事业', 8); CN.earn(g, 100000); }, res: (g) => 'The university gives you a $14,000 settling-in allowance. You are assigned an office shared with others,' + payWord(g) + '. ' },
        { t: 'Go into corporate R&D', dev: 10, fx: (g) => { CN.setEdu(g, 'phd', 'PhD'); g.remember('lifePath', 'work'); CN.setJob(g, 'tech', 'R&D engineer'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · R&D center'); }, res: (g) => payWord(g).replace(/^每月到手/, 'monthly salary') + ', more than all five years of your doctoral stipend put together.' },
      ] }),
    dec({ id: 'y_marry29', age: 29, t: 'Settling Down', loc: 'home', cond: (g) => loveIs(g, 'dating') && g.since('love') >= 1,
      text: (g) => 'You have been together for more than a year. ' + wedText(g),
      choices: [
        { t: 'Marriage', canon: true, fx: (g) => { const w = wedPlan(g, 0.8); CN.marry(g, { origin: { campus: 'university classmate', work: 'coworker', blind: 'met on a blind date', online: 'met online' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) || county(g) ? 'paid' : 'none'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => 'You and ' + g.recall('spouse') + ' got married. ' + wedRes(g, last) },
        { t: 'Register the marriage, with no banquet', dev: 15, fx: (g) => { CN.marry(g, { origin: 'together for over a year' }); g.remember('caili', 'travel'); CN.pay(g, 5000); g.stat('心情', 4); g.stat('人缘', -2); }, res: 'On the day you register, you have a $70 meal and take a photo together to post in the family chat.' },
        { t: 'Break up', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', 'Single'); g.stat('心情', -6); }, res: 'You have one last proper meal together, then each go home.' },
      ] }),
    dec({ id: 'y_house29', age: 29, t: 'Time to Buy?', loc: 'home', cond: (g) => !hasHouse(g) && !g.recall('abroadStay') && working(g) && (married(g) || cash(g) >= deal(g, buyTier(g), 0.45).down * 0.5),
      text: (g) => {
        const d = deal(g, buyTier(g), married(g) ? 0.7 : 0.45);
        return (married(g) ? 'Your landlord is selling the flat and tells you to move out within three months. ' : 'On your own in ' + here(g) + ', you have saved up ' + CN.fmt(cash(g)) + '. The agent says prices are the lowest in ten years. ')
          + (married(g) ? 'a small two-bedroom flat' : 'A one-bedroom flat: ') + 'Total price ' + CN.fmt(d.price * 1e4) + ', down payment ' + CN.fmt(d.down) + '. ';
      },
      choices: houseChoices((g) => (married(g) ? 1 : 0.7), (g) => (married(g) ? 0.7 : 0.45), 'a bigger one', 'a smaller one') }),
    dec({ id: 'y_parents29', age: 29, t: 'Mom and Dad', loc: 'home', cond: (g) => parentAlive(g) && !withParents(g) && !g.recall('parentsIn'),
      text: (g) => (g.alive('fa') ? CN.who(g, 'fa', true) + ' was found to have high blood pressure at a checkup. ' : CN.who(g, 'mo', true) + ' is all alone back home. ') + 'On the video call, you look at ' + (g.alive('fa') ? 'him' : 'her') + ', whose hair has gone mostly white.',
      choices: [
        { t: 'Send more money and call often', canon: true, fx: (g) => { g.remember('parentsNear', 'far'); CN.pay(g, 12000); g.stat('人缘', 2); }, res: 'Every month you send home $140, and you set an alarm for Sunday evenings to remind yourself to call.' },
        { t: 'Bring your parents to live with you', dev: 15,
          fx: (g) => { g.remember('parentsNear', 'with'); CN.liveWith(g, aliveParents(g)); if (!hasHouse(g)) CN.pay(g, (RENT_M[tierNow(g)] || 1500) * 6); g.stat('人缘', 5); g.stat('心情', -2); },
          res: (g) => (hasHouse(g) ? '' : 'You move to a bigger place, paying ' + CN.fmt((RENT_M[tierNow(g)] || 1500) / 2) + ' more in rent each month. ') + 'The household has gained ' + (aliveParents(g).length > 1 ? 'two people' : 'one person') + ', a few more dishes on the table, and a few more arguments.' },
        { t: 'Quit your job and go back', dev: 25, cond: (g) => away(g),
          fx: (g) => { g.remember('parentsNear', 'back'); g.remember('backHome', 'parents'); goBack(g); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? 'Goes back to farm' : 'Runs a small business in the county town'); g.stat('人缘', 6); g.stat('心情', 2); },
          res: (g) => 'You come home. ' + (g.alive('mo') ? 'Your mom' : 'Your dad') + ' waits at the village entrance all afternoon. You earn less, but every day you get to see ' + parentWord(g) + '. ' },
      ] }),


    dec({ id: 'y_promo29', age: 29, t: 'Promotion', loc: 'office', cond: (g) => working(g) && EMPLOYEE.includes(g.recall('job')),
      text: (g) => ({ civil: 'A deputy section chief post has opened up in your section. ', teacher: 'The school needs to pick a grade head. ', doctor: 'The department needs to name a medical team lead. ', nurse: 'The head nurse is about to be transferred. ', worker: 'The workshop supervisor is about to retire. ', rider: 'The station manager asks if you want to be a small team leader. ', driver: 'The fleet is promoting a dispatcher. ', soldier: 'A deputy post has opened up in your company. ', tech: 'The team lead has jumped ship, and the position is empty. ', sales: 'The regional manager position has opened up. ' }[g.recall('job')] || 'A small supervisor position has opened up in the department. ')
        + 'Your current title is ' + jobTitle(g) + ', and your monthly pay is about ' + CN.fmt(CN.jobPay(g, g.recall('job'))) + '. ' + (hiEdu(g) ? '' : 'Several of the people competing with you have higher degrees than you do.'),
      choices: [
        { t: (g) => 'Go for a management post (about ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + ' a month if promoted; more meetings, and you carry targets)', canon: true, cond: hiEdu, check: ['事业', 40], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: 'It does not come to you. You go to work as usual, just saying less.' } },
        { t: (g) => 'Go for a management post (about ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 10)) + ' a month if promoted; your degree is a handicap, so results have to speak for you)', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 52], fx: (g) => upMgr(g), res: (g) => mgrRes(g), fail: { fx: (g) => upFail(g), res: 'The position goes to someone with a master’s degree. You look over your performance sheet again and decide you are not bad at all.' } },
        { t: (g) => 'Take the specialist track and sit for ' + EXPERT[g.recall('job')] + ' (about ' + CN.fmt(CN.jobPay(g, g.recall('job'), null, 6)) + ' a month if you pass; you manage no one, but you have to hit the books)', dev: 10, cond: (g) => !!EXPERT[g.recall('job')], check: ['学识', 62],
          fx: (g) => { CN.pay(g, 3000); CN.setJob(g, g.recall('job'), EXPERT[g.recall('job')]); g.remember('promoted', true); g.remember('ladder', 'expert'); g.stat('事业', 6); g.stat('学识', 3); },
          res: (g) => 'The course and exam cost $430. The day your certificate arrives, you are named ' + EXPERT[g.recall('job')] + ', ' + payWord(g).replace(/^.*?大概/, ' with monthly take-home of about ') + '. The hard cases start asking for you by name.',
          fail: { fx: (g) => { CN.pay(g, 3000); upFail(g); }, res: 'You fail twice, by a small margin. You say the $430 in registration and book money was just tuition.' } },
        { t: (g) => 'Transfer to a branch in another city and move up a level (about ' + CN.fmt(CN.jobPay(g, g.recall('job'), tierNow(g) === 1 ? 2 : 1, 10)) + ' a month; ' + (married(g) ? 'your family has to move with you' : 'you will know no one there') + ')', dev: 20, cond: (g) => ['office', 'tech', 'sales'].includes(g.recall('job')),
          fx: (g) => { const c = tierNow(g) === 1 ? CN.goCity(g, 2) : CN.goCity(g, 1, CN.pick(['Shanghai', 'Shenzhen', 'Beijing', 'Hangzhou', 'Guangzhou'].filter((x) => x !== here(g)))); g.move('office', c + ' · Branch office'); CN.setJob(g, g.recall('job'), 'Branch head'); g.remember('promoted', true); g.remember('ladder', 'move'); g.stat('事业', 10); g.stat('人缘', -2); },
          res: (g) => 'You are transferred to ' + here(g) + ', where you become the branch head,' + payWord(g) + '. ' + (married(g) ? g.recall('spouse') + ' quits too and looks for a new job in the new city.' : 'You do not have much luggage; one suitcase holds it all.') },
        { t: 'Give it to someone else and take it easy', dev: 10, fx: (g) => { g.remember('promoted', false); g.remember('ladder', 'no'); g.stat('心情', 3); g.stat('健康', 2); }, res: (g) => 'You leave on time and ' + (kidN(g) && g.recall('custody') !== 'ex' ? 'pick up your child from kindergarten.' : 'take a couple of laps around the park.') },
      ] }),

    /* ================= 30 岁是人生关口，这里只写自动节点 ================= */
    { id: 'y_turn30', age: 30, t: 'Thirty', auto: true,
      text: (g) => (married(g) ? (kidN(g) && g.alive('k1') && g.ageOf('k1') >= 2 ? g.name('k1') + ' draws you a birthday card. You are a circle.' : 'You and ' + g.recall('spouse') + ' have hotpot together and call it a birthday.')
        : withParents(g) ? (g.alive('mo') ? 'On your thirtieth birthday, your mom cooks you a bowl of longevity noodles with two poached eggs on top.' : 'On your thirtieth birthday, your dad buys a cake and puts the candles on wrong.')
        : 'On your thirtieth birthday, you cook yourself a bowl of longevity noodles. Friends send a string of red envelopes in the group chat, and you open them one by one.') },

    /* ================= 31 岁 ================= */
    dec({ id: 'y_backwork31', age: 31, t: 'Go back to work', loc: 'home', cond: (g) => married(g) && g.recall('kidCare') === 'home' && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + ' is about to start kindergarten. ' + (isMale(g) ? g.recall('spouse') + ' has been at home with the child for a few years, ' : 'You have been at home with the child for a few years, ') + 'and the household brings in only this much a year: ' + CN.fmt(CN.income(g)) + '. ',
      choices: [
        { t: 'Go back to work', canon: true,
          fx: (g) => { g.remember('kidCare', 'back'); if (isMale(g)) g.remember('spWork', ''); else { const p = g.recall('preKidJob') || ['office', 'Company employee']; CN.setJob(g, p[0] === 'none' ? 'office' : p[0], p[1]); } },
          res: (g) => (isMale(g) ? g.recall('spouse') + ' found a job, so now it is ' : 'You found a job again, so now it is ') + 'two people' + payWord(g).replace(/^.*?大概/, 'with combined monthly take-home of about ') + '. Before the first day back at work, ' + g.name('k1') + ' stands at the door waving for a very long time.' },
        { t: 'Stay home a few more years', dev: 10, fx: (g) => { g.remember('kidCare', 'stay'); g.stat('心情', 2); }, res: 'A child is only small for these few years. You two budget more carefully, going to the park on weekends instead of the mall.' },
      ] }),
    dec({ id: 'y_kid31', age: 31, t: 'About Children', loc: 'home', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') !== 'dink',
      text: (g) => (g.recall('kidPlan') === 'wait' ? 'You agreed to wait two years, and three have gone by. ' : 'You have been married for several years and still have no child. ') + (isMale(g) ? '' : 'The doctor says it gets harder with age.'),
      choices: [
        { t: 'Have a child', canon: true, check: ['健康', 40], fx: (g) => { g.remember('kidPlan', 'now'); CN.haveKid(g); CN.pay(g, 20000); g.stat('心情', 4); }, res: (g) => 'The baby is born and named ' + g.name('k1') + '. The hospital stay and prenatal checkups cost $2,900. You pace hundreds of times outside the delivery room.', fail: { fx: (g) => { g.remember('kidPlan', 'trying'); CN.pay(g, 10000); g.stat('心情', -6); }, res: 'You cannot get pregnant. You go to the hospital several times, and the tests cost $1,400.' } },
        { t: 'Forget it; just the two of you', dev: 20, fx: (g) => { g.remember('kidPlan', 'dink'); CN.pay(g, 12000); g.stat('心情', 2); g.stat('人缘', -3); }, res: 'You spend $1,700 on a tour group and take a group photo at the foot of a snow mountain.' },
      ] }),
    dec({ id: 'y_crisis31', age: 31, t: 'A Fight', loc: 'home', cond: (g) => married(g) && g.since('love') >= 3,
      text: (g) => 'You and ' + g.recall('spouse') + ' had a fight over ' + (kidN(g) ? 'who goes to the parent-teacher meeting' : g.recall('house') === 'mortgage' ? 'the mortgage' : 'something small') + ', and afterwards each of you went to sleep apart.',
      choices: [
        { t: 'Be the first to back down and talk it through', canon: true, fx: (g) => { g.remember('fight', 'talk'); g.stat('人缘', 4); g.stat('心情', 2); }, res: 'The next morning, you boil an extra egg.' },
        { t: 'Give each other the cold shoulder', dev: 10, fx: (g) => { g.remember('fight', 'cold'); g.stat('心情', -5); }, res: 'The cold lasts a week. Eventually it passes, but some things are never said again.' },
        { t: 'This cannot go on; get a divorce', dev: 25,
          fx: (g) => {
            g.remember('fight', 'split'); g.remember('love', 'divorced'); g.info('婚姻', 'Divorced'); g.unrel(CN.sexOf(g) === '男' ? 'wife' : 'husband');
            last.sold = ['mortgage', 'own'].includes(g.recall('house')); if (last.sold) CN.sellHouse(g);
            CN.withdraw(g); last.amt = r1000(Math.max(0, cash(g)) / 2); CN.pay(g, last.amt);
            if (kidN(g)) g.remember('custody', isMale(g) === (g.rnd() < 0.3) ? 'me' : 'ex');
            g.stat('心情', -8);
          },
          res: (g) => 'A line stretches outside the civil affairs office. ' + (last.sold ? 'The flat is sold. ' : '') + 'The savings are split half and half, and you hand over ' + CN.fmt(last.amt) + '. ' + (kidN(g) ? (g.recall('custody') === 'me' ? 'The child stays with you. ' : 'The child goes with your ex. ') : '') + 'You sign, and each go your separate ways.' },
      ] }),

    /* ================= 32 岁 ================= */
    dec({ id: 'y_kid2', age: 32, t: 'A Second Child', loc: 'home', cond: (g) => married(g) && kidN(g) === 1 && g.alive('k1') && g.ageOf('k1') >= 2,
      text: (g) => g.name('k1') + (g.ageOf('k1') >= 3 ? ' has started kindergarten and ' : ' can speak in whole sentences now and ') + 'comes home to ask you why the other kids all have little brothers and sisters while ' + CN.he(g, 'k1') + ' does not. Another child would cost about $4,300 more a year.',
      choices: [
        { t: 'One is enough', canon: true, fx: (g) => { g.remember('kid2', 'no'); g.stat('心情', 1); }, res: 'You pour all your attention into the one child.' },
        { t: 'Have another', dev: 15, fx: (g) => { g.remember('kid2', 'yes'); CN.haveKid(g); CN.pay(g, 20000); g.stat('健康', -3); g.stat('心情', 3); }, res: (g) => 'The second child is born and named ' + g.name('k2') + '. The house is never quiet again. ' + g.name('k1') + ' leans over the bed for a long time, then says the toys are to be split, and that ' + CN.he(g, 'k2') + ' gets half.' },
      ] }),
    dec({ id: 'y_marry32', age: 32, t: 'Together', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: 'You have been together for several years. You are both not so young any more. One evening on a walk, your partner asks if you want to just spend your lives this way.',
      choices: [
        { t: 'Marriage', canon: true, fx: (g) => { const w = wedPlan(g, 0.6); CN.marry(g, { origin: 'together for several years' }); g.remember('caili', 'late'); wedPay(g, w); g.stat('心情', 6); }, res: (g) => 'You and ' + g.recall('spouse') + ' got married. ' + wedRes(g, last) },
        { t: 'Keep dating, without registering', dev: 20, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 2); }, res: 'You each keep your own flat and have dinner together on weekends.' },
      ] }),
    dec({ id: 'y_single32', age: 32, t: 'Thirty-Two', loc: 'home', cond: (g) => single(g),
      text: (g) => (loveIs(g, 'divorced') ? 'It has been a year since the divorce. ' : '')
        + (CN.alone(g) ? 'You live alone. At the weekend vegetable market, the stallholder knows you now and gives you an extra handful of scallions.'
          : withParents(g) ? 'You still lived with ' + parentWord(g) + '. At the dinner table, ' + parentWord(g) + ' mentioned again that someone’s child had gotten married.'
          : CN.youHh(g) + '. At the weekend market, the stallholder already knows you.'),
      choices: [
        { t: 'Meet whoever people introduce', canon: true, check: ['人缘', 45], fx: (g) => { CN.marry(g, { origin: 'introduced by a friend' }); g.remember('lateMarry', 'match'); CN.pay(g, 30000); g.stat('心情', 6); }, res: (g) => 'You and ' + g.recall('spouse') + ' dated for six months and then married, with a few banquet tables for both families costing $4,300. Neither of you is young any more, and you do not fuss over details.', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: 'It does not work out. You are not too upset, and go home and stir-fry two dishes for yourself.' } },
        { t: 'Carry on like this; it is quite comfortable', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); CN.pay(g, 3000); g.stat('心情', 4); }, res: 'You pay $430 to buy yourself a better set of pots.' },
      ] }),
    dec({ id: 'y_biz32', age: 32, t: 'Going Solo', loc: 'metro',
      cond: (g) => working(g) && !['boss', 'shop', 'creator', 'farmer'].includes(g.recall('job')) && g.recall('startup') !== 'ok' && !g.recall('abroadStay') && (cash(g) >= 20000 || !!g.recall('skill') || !!g.recall('side')),
      text: (g) => bizText(g) + 'Your current title is ' + jobTitle(g) + ', ' + payWord(g) + ', and your card holds ' + CN.fmt(cash(g)) + '. ',
      choices: [
        { t: 'Run a snack stall at night ($2,900 to start, keep your day job, earnings depend on skill and location)', dev: 15, check: ['人缘', 45],
          fx: (g) => { last.lend = fund(g, 20000); g.remember('biz', 'stall'); g.remember('side', 'stall'); g.stat('健康', -2); },
          res: (g) => 'A cart, a stove, and the first batch of stock come to $2,900 in all' + (last.lend ? ', of which ' + CN.fmt(last.lend) + ' was borrowed' : '') + '. You sell ' + pk(g, ['grilled cold noodles', 'fried skewers', 'hand-pulled flatbread', 'cold-skin noodles', 'jianbing crepes'], 4) + ', and after costs you clear over $430 in the first month.',
          fail: { fx: (g) => { last.lend = fund(g, 20000); CN.earn(g, 6000); g.remember('biz', 'stallFail'); g.stat('心情', -4); }, res: 'After half a year, a rainy summer comes along, and the stall’s spot is moved twice. You hand the cart over to someone else for $860, and in the end you are down more than $1,400.' } },
        { t: 'Open an online shop and sell by livestream ($4,300 to start; two or three in ten survive)', dev: 20, check: ['人缘', 55],
          fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'online'); g.stat('健康', -2); },
          res: (g) => 'Samples, a ring light, and ad spending cost you $4,300 up front' + (last.lend ? ', ' + CN.fmt(last.lend) + ' was borrowed' : '') + '. You sell ' + pk(g, ['specialties from back home', 'children’s clothes you pick yourself', 'small appliances', 'handmade jewelry'], 5) + ', going live right after work, and by the third month you have repeat customers.',
          fail: { fx: (g) => { last.lend = fund(g, 30000); g.remember('biz', 'onlineFail'); g.stat('心情', -4); }, res: 'Your livestream often has only a dozen or so viewers. After three months you stop, and the $4,300 turns into a few boxes of stock on the balcony, given away to relatives and friends over a year.' } },
        { t: (g) => 'Join a chain ' + frKind(g) + ' (franchise fee, renovation and deposit total ' + CN.fmt(frCost(g)) + (cash(g) - 10000 < frCost(g) ? ', and you need to borrow ' + CN.fmt(r1000(frCost(g) - Math.max(0, cash(g) - 10000))) : '') + ', and if all goes well it pays back in two or three years)', dev: 25,
          cond: (g) => cash(g) >= frCost(g) * 0.4, check: ['事业', 45],
          fx: (g) => { const k = frKind(g); last.lend = fund(g, frCost(g)); g.remember('bizKind', k); g.remember('biz', 'franchise'); CN.setJob(g, 'boss', k + ' franchise owner'); g.stat('心情', 3); },
          res: (g) => 'You quit your job and open a ' + g.recall('bizKind') + '. ' + (last.lend ? 'The ' + CN.fmt(last.lend) + ' you borrowed is covered by an IOU. ' : '') + 'In the first year, after rent and wages, what you take home yourself is only slightly more than when you had a regular job.',
          fail: { fx: (g) => { const k = frKind(g); const c = frCost(g); last.lend = fund(g, c); last.amt = r1000(c * 0.3); CN.earn(g, last.amt); g.remember('bizKind', k); g.remember('biz', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => 'The shop has been open ten months, and foot traffic is half what headquarters promised. You transfer the shop out and recover only ' + CN.fmt(last.amt) + '. ' + (debtW(g) ? 'You still owe ' + CN.fmt(debtW(g) * 1e4) + ', ' : '') + 'so you go back to work.' } },
        { t: 'On second thought, forget it; a regular job is steadier', canon: true, fx: (g) => { g.remember('biz', 'no'); g.stat('心情', 1); }, res: 'You buy some grilled cold noodles at the night market and eat them as you walk. They taste good, and you stop thinking about it.' },
      ] }),

    /* ================= 33 岁 ================= */
    dec({ id: 'y_ivf33', age: 33, t: 'The Hospital', loc: 'hospital', cond: (g) => married(g) && kidN(g) === 0 && g.recall('kidPlan') === 'trying',
      text: 'After two years of hospital visits, the doctor says you could try IVF. One cycle costs about $5,700, and it may not work the first time.',
      choices: [
        { t: 'Try IVF once more', canon: true, check: ['健康', 45],
          fx: (g) => { CN.pay(g, 60000); CN.haveKid(g); g.remember('kidPlan', 'now'); g.stat('心情', 6); },
          res: (g) => 'After two cycles costing $8,600, the child finally arrives, named ' + g.name('k1') + '. You cry in the hospital corridor.',
          fail: { fx: (g) => { CN.pay(g, 40000); g.remember('kidPlan', 'dink'); g.stat('心情', -5); }, res: 'It costs $5,700, and it does not work. On the way home you hold hands and neither of you says a word. Later you agree that two people are a family too.' } },
        { t: 'Stop going to the hospital and let nature take its course', dev: 15, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); }, res: 'You put the hospital paperwork in a drawer and go hiking on the weekend.' },
      ] }),
    dec({ id: 'y_debt33', age: 33, t: 'Paying Off Debts', loc: 'home', cond: (g) => debtW(g) >= 40,
      text: (g) => 'On the first of every month, your pay comes in and the mortgage goes out, staying in your account for only a few minutes. You still owe ' + CN.fmt(debtW(g) * 1e4) + '. ' + (g.recall('startup') === 'fail' ? 'The money you owe from the startup is still not paid off.' : ''),
      choices: [
        { t: 'Grit your teeth and pay it off, saving on everything', canon: true, fx: (g) => { g.remember('frugal', true); if (cash(g) >= 70000) { CN.pay(g, 50000); g.remember('debt', Math.max(0, debtW(g) - 5)); } g.stat('心情', -3); }, res: (g) => (cash(g) >= 20000 ? 'You repay $7,100 early. ' : '') + 'You stop ordering takeout and start bringing your own lunch. The lunch box came from your mom, and you have used it for many years.' },
        { t: 'Drive a ride-hailing car at night to earn more', dev: 10, cond: (g) => g.recall('side') !== 'drive', fx: (g) => { g.remember('nightJob', true); g.remember('side', 'drive'); g.stat('健康', -5); }, res: 'You earn about $290 more a month. You get to know every road in the city at two in the morning.' },
        { t: 'Sell the flat and be free of debt', dev: 20, cond: (g) => g.recall('house') === 'mortgage', fx: (g) => { CN.sellHouse(g); g.remember('soldHouse', true); g.stat('心情', 6); }, res: (g) => 'The flat is sold, the loan is cleared, and you are left with ' + CN.fmt(cash(g)) + '. The night you sign the papers, you sleep soundly.' },
      ] }),
    dec({ id: 'y_car33', age: 33, t: 'Buying a Car', loc: 'road', cond: (g) => working(g) && !g.recall('car') && cash(g) >= 50000, text: carText, choices: carChoices() }),
    dec({ id: 'y_money33', age: 33, t: 'Spare Cash', loc: 'home', cond: (g) => working(g) && !g.recall('money1') && cash(g) >= 30000,
      text: (g) => 'You have ' + CN.fmt(cash(g)) + ', untouched. The bank’s account manager calls for the third time to say a few products would suit you.',
      choices: moneyChoices() }),
    dec({ id: 'y_friend33', age: 33, t: 'Old Friend', loc: 'home', cond: (g) => true,
      text: (g) => (['uni', 'college', 'grad', 'phd'].includes(g.recall('lifePath')) || g.recall('uni') ? 'Your best friend from university' : 'Your best friend from your early working years') + ' is getting married, in a place far from ' + here(g) + '. You have to work overtime that day as well.',
      choices: [
        { t: 'Take leave and go', canon: true, fx: (g) => { g.remember('oldFriend', 'went'); CN.pay(g, 4000); g.stat('人缘', 5); g.stat('事业', -1); }, res: 'Travel plus the wedding gift comes to $570. At the wedding you cry harder than the newlyweds.' },
        { t: 'Send a digital red envelope', dev: 10, fx: (g) => { g.remember('oldFriend', 'red'); CN.pay(g, 1000); g.stat('人缘', -2); }, res: 'You send $140. Your friend replies, “Thanks.” After that, you rarely keep in touch.' },
      ] }),

    /* ================= 34 岁：三十五岁之前 ================= */
    dec({ id: 'y_last34', age: 34, t: 'Before Thirty-Five', loc: 'office', cond: (g) => working(g) && !['civil', 'teacher', 'doctor', 'soldier', 'farmer', 'retired', 'none'].includes(g.recall('job')),
      text: (g) => 'You turn thirty-five next year. Job postings say “under 35.” ' + (g.recall('aiMove') === 'switch' ? 'The field you switched into is getting more and more young people.' : g.recall('promoted') ? 'You lead a small team, and carry a bit of anxiety with it.' : 'You have been in your current position for several years.'),
      choices: [
        { t: (g) => 'Take the civil-service exam for stability (' + CN.jobLine(g, 'civil') + ')', dev: 10, check: ['学识', 80], fx: (g) => { g.remember('last34', 'civil'); CN.setJob(g, 'civil', 'Public institution staff'); g.stat('心情', 4); }, res: (g) => 'You pass the exam for a post you could still apply for in your final eligible year,' + payWord(g) + ', less than before, but you feel at ease.', fail: { fx: (g) => { g.remember('last34', 'stay'); g.stat('心情', -3); }, res: 'You miss it by two points. Back at your desk, you put your exam admission ticket away in a drawer.' } },
        { t: 'Hold on to your current position', canon: true, fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 3); g.stat('健康', -2); }, res: 'You get to the office earlier and leave later than before.' },
        { t: (g) => 'Strike out on your own (' + CN.jobLine(g, g.recall('skill') ? 'shop' : 'boss') + ')', dev: 20, fx: (g) => { g.remember('last34', 'own'); CN.withdraw(g); last.amt = r1000(Math.min(cash(g) * 0.6, 100000)); CN.pay(g, last.amt); CN.setJob(g, g.recall('skill') ? 'shop' : 'boss', g.recall('skill') ? 'Opens a shop' : 'Self-employed owner'); g.stat('心情', 4); }, res: (g) => 'You put up ' + CN.fmt(last.amt) + ', and register a small company with your name as the legal representative.' },
      ] }),
    dec({ id: 'y_last34b', age: 34, t: 'Looking Back', loc: 'home', cond: (g) => true,
      text: 'You come across a photo of yourself at eighteen. Back then, you thought thirty-four was very old.',
      choices: [
        { t: 'You chose this life yourself; keep going', canon: true, fx: (g) => { g.remember('look34', 'ok'); g.stat('心情', 3); }, res: 'You slip the photo back into the album.' },
        { t: 'Want to learn something more', dev: 10, fx: (g) => { g.remember('look34', 'learn'); CN.pay(g, 5000); g.stat('学识', 5); }, res: 'You pay $700 for a weekend course. Most of the people in the classroom are younger than you.' },
      ] }),

    /* ================= 自动节点：让日子有血有肉 ================= */
    { id: 'y_firstpay', age: 22, t: 'First Paycheck', auto: true, cond: (g) => working(g) && g.since('job') === 0 && !g.recall('workStyle') && !g.recall('army') && !['farmer', 'soldier', 'none'].includes(g.recall('job') || 'none'),
      text: (g) => 'Your first month’s pay arrives: ' + CN.fmt(perMonth(g)) + '. You send ' + (g.alive('mo') ? 'Mom' : 'your family') + ' some money.' + (g.recall('uniSide') === 'money' ? 'You were already used to earning your own money.' : 'The reply comes: “Keep it for yourself,” and then, “Thanks, sweetheart.”') },
    { id: 'y_army_life', age: 19, t: 'Boot Camp', auto: true, cond: (g) => g.recall('lifePath') === 'army',
      text: 'In three months of basic training, you learn to fold your quilt in three minutes and to stand motionless in the snow for an hour.' },
    { id: 'y_newyear24', age: 24, t: 'New Year', auto: true, cond: (g) => away(g) && !g.recall('abroadStay'),
      text: (g) => 'You spend a whole night glued to your phone fighting for a train ticket in the Spring Festival rush. Back in ' + home(g) + ', ' + (married(g) ? (kidN(g) ? 'your relatives scramble to hold the baby. ' : 'your relatives ask when you will have a child. ') : loveIs(g, 'dating') ? 'your relatives ask when you will get married. ' : 'your relatives ask whether you have a partner. ') + (g.alive('mo') ? 'Your mom stuffs two bags of cured sausage into your suitcase.' : '') },
    { id: 'y_wedding_day', age: 26, t: 'The Wedding', auto: true, cond: (g) => married(g) && g.since('love') === 0,
      text: (g) => (g.recall('caili') === 'paid' ? (g.alive('fa') ? 'At the wedding, your dad has too much to drink and holds the in-laws’ hands, saying again and again, “We are leaving our child with you.”' : 'At the wedding, your mom’s eyes are red, and she toasts every table.') : g.recall('caili') === 'travel' ? 'You take a photo together at the seaside and call it your wedding photo.' : 'The wedding is simple. What you remember is how windy it was that day.') },
    { id: 'y_abroad_back', age: 28, t: 'Return to China', auto: true, cond: (g) => !!g.recall('abroadStay'),
      fx: (g) => { g.remember('abroadStay', false); CN.goCity(g, 1); CN.setJob(g, 'office', 'Foreign-company middle manager'); g.stat('人缘', 3); },
      text: (g) => 'After several years abroad, you come back after all. You land in ' + g.recall('workCity') + ', and the air has a familiar smell. The new job starts' + payWord(g) + '. ' },
    { id: 'y_baby_night', age: 29, t: 'Night', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') <= 2 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + ' wakes up crying three times in the night. You pick the baby up, and ' + CN.he(g, 'k1') + ' rides in your arms around the living room until dawn. When ' + CN.he(g, 'k1') + ' finally falls asleep, a tiny hand is clutching one of your fingers.' },
    { id: 'y_kid_school', age: 33, t: 'Kindergarten', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') === 3 && g.recall('custody') !== 'ex',
      text: (g) => g.name('k1') + ' cries and will not let go on the first day of kindergarten. You stand at the gate all morning. When school lets out, ' + CN.he(g, 'k1') + ' comes running out holding a little red paper flower.' },
    { id: 'y_grandparent', age: 25, t: 'Grandparents', auto: true, cond: (g) => !g.alive('gm') && !g.alive('gp'),
      text: (g) => (g.recall('leftBehind') ? 'You were raised by your grandparents. Now that they are gone, the house back home sits empty, and the yard is overgrown with weeds.' : 'Both grandparents are gone. Going home for the New Year, there are two fewer people urging you to eat more.') },
    { id: 'y_rider_rain', age: 21, t: 'Rainstorm', auto: true, cond: (g) => g.recall('job') === 'rider',
      fx: (g) => { if (g.rnd() < 0.08) { g.stat('健康', -20); g.remember('riderHurt', true); CN.pay(g, 5000); } },
      text: (g) => (g.recall('riderHurt') ? 'In the rainstorm you crash your scooter and need a dozen or so stitches in your calf, and the medical bill is $710. The station manager says that order does not count as late, and even sends you a case of milk.' : 'In the rainstorm, orders double. You ride in the rain all day and make $86, and when you get home you can pour water out of your shoes.') },
    { id: 'y_save_worker', age: 23, t: 'Scaffolding', auto: true, cond: (g) => g.recall('job') === 'worker' && g.recall('stayCity'),
      fx: (g) => { if (g.rnd() < 0.15) g.set('ySavedWorker'); },
      text: (g) => (g.f('ySavedWorker') ? 'Someone slips from the scaffolding at the building site, and you are closest, grabbing him by the collar. His family later sends a silk banner of thanks.' : 'You change building sites three times this year. The food is much the same at each one: $2 a portion, two meat dishes and one vegetable.') },
    { id: 'y_shop_good', age: 28, t: 'The Little Shop', auto: true, cond: (g) => g.recall('job') === 'shop',
      fx: (g) => { if (g.s('人缘') >= 55 && g.rnd() < 0.5) { g.set('yHometownShop'); CN.earn(g, 60000); } },
      text: (g) => (g.f('yHometownShop') ? 'Your shop becomes the one with the longest line on the street, and you earn an extra $8,600 this year. When people in town talk about you, they say, “the one with that shop.”' : 'The shop does so-so, making around $700 a month. You get to know everyone on the street.') },
    { id: 'y_civil_life', age: 26, t: 'The Work Unit', auto: true, cond: (g) => g.recall('job') === 'civil',
      text: (g) => (g.recall('army') === 'out' ? 'The people at your unit know you served in the army, and always call on you to move things. ' : 'The documents you write are revised by your boss three times, then restored to the first draft. ') + 'Canteen lunch costs under $1, and there is fish.' },
    { id: 'y_teacher_life', age: 27, t: 'The Lectern', auto: true, cond: (g) => g.recall('job') === 'teacher',
      text: 'One of the kids in your class wrote an essay about you. You read it twice in the office.' },
    { id: 'y_doctor_life', age: 27, t: 'On Duty', auto: true, cond: (g) => ['doctor', 'nurse'].includes(g.recall('job')),
      text: 'A young man from a car accident is brought in on the night shift. You work to save him for four hours, and he lives. You eat a cold bun in the stairwell.' },
    { id: 'y_creator_life', age: 25, t: 'Livestream Room', auto: true, cond: (g) => g.recall('job') === 'creator',
      fx: (g) => { if (g.rnd() < 0.3) { CN.earn(g, 80000); g.stat('事业', 6); g.remember('viral', true); } },
      text: (g) => (g.recall('viral') ? 'One of your videos goes viral. You gain a hundred thousand followers overnight, and ad deals bring in $11,000. Your mom walks around the village with a spring in her step.' : 'You stream four hours a day. After the camera goes off, the room is very quiet.') },
    { id: 'y_jumped_after', age: 28, t: 'New Company', auto: true, cond: (g) => g.recall('jumped') === true,
      text: 'The people at the new company push even harder than you expected. You start to miss your old team, but your pay has gone up, and you buy yourself a good chair.' },
    { id: 'y_rent_whole', age: 25, t: 'A Place of Your Own', auto: true, cond: (g) => g.recall('rentType') === 'whole' && CN.alone(g),
      text: 'You keep a cat in your one-bedroom flat. On rainy nights, the cat lies on your lap, and you feel this city is yours.' },
    { id: 'y_rent_far', age: 25, t: 'Commute', auto: true, cond: (g) => g.recall('rentType') === 'far',
      text: 'The round trip takes four hours a day. You learn to sleep standing up on the metro.' },
    { id: 'y_dink_life', age: 33, t: 'two people', auto: true, cond: (g) => g.recall('kidPlan') === 'dink' && married(g),
      text: (g) => 'You and ' + g.recall('spouse') + ' go to many places. In the photos it is always the two of you, both smiling nicely.' },
    { id: 'y_divorce_after', age: 33, t: 'After the Divorce', auto: true, cond: (g) => g.recall('fight') === 'split' && !married(g),
      text: (g) => (kidN(g) ? (g.recall('custody') === 'me' ? 'The child stays with you. Every morning you do their hair and make breakfast, drop them off, and then go to work. It is tiring, but it feels solid.' : 'The child lives with your ex. Every weekend you go to get the child, and ' + CN.he(g, 'k1') + ' comes out to have a meal with you.') : 'After the divorce, you have half as many things and half again as much space. You learn to cook for yourself all over again.') },
    { id: 'y_cold_after', age: 33, t: 'The Dinner Table', auto: true, cond: (g) => g.recall('fight') === 'cold' && married(g),
      text: (g) => 'You and ' + g.recall('spouse') + ' mostly talk about ' + (kidN(g) ? 'the child' : 'the flat') + ' and the bills at the dinner table. One day your partner puts a piece of food in your bowl, and you freeze for a second.' },
    { id: 'y_parents_with', age: 32, t: 'One Family', auto: true, cond: (g) => g.recall('parentsNear') === 'with' && withParents(g),
      text: (g) => (CN.livesWith(g, 'mo') ? 'Your mom gets up at five every morning to make breakfast for the whole family. ' + (kidN(g) && g.alive('k1') ? g.name('k1') + ' was raised by grandma and loves the dumplings that ' + (isMale(g) ? 'grandma' : 'grandma') + ' makes.' : 'You say there is no need to get up so early, but she will not listen.') : 'Your dad goes for a stroll in the park every morning, and picks up the groceries on the way back.') },
    { id: 'y_kidcare_after', age: 34, t: 'Raising the Child', auto: true, cond: (g) => !!g.recall('kidCare') && kidN(g) && g.alive('k1') && g.recall('custody') !== 'ex',
      text: (g) => ({ grand: (g.alive('mo') || g.alive('fa') ? 'The child was raised with the grandparents’ help. ' + g.name('k1') + '’s first nursery rhyme was sung in dialect.' : 'The grandparent who helped raise the child is gone. ' + g.name('k1') + ' still mentions it sometimes.'), paid: 'The daycare teachers changed twice, and ' + g.name('k1') + ' remembers all their names.', home: 'The years at home with the child were tight on money. ' + g.name('k1') + ' remembers every afternoon at the park.', stay: 'The years at home with the child were tight on money. ' + g.name('k1') + ' remembers every afternoon at the park.', back: 'Once you both went back to work, the pick-ups and drop-offs were laid out in a chart stuck to the fridge.' }[g.recall('kidCare')]) },
    { id: 'y_back_life', age: 31, t: 'Life Back Home', auto: true, cond: (g) => ['late', 'parents', 'early'].includes(g.recall('backHome')) && !away(g),
      text: (g) => 'After going back to ' + (g.recall('backHome') === 'late' ? g.recall('city') : home(g)) + ', you put on about ten pounds. ' + (parentAlive(g) ? 'After dinner you go with ' + parentWord(g) + ' to the square for a couple of laps.' : 'After dinner you go by yourself to walk a couple of laps by the river, running into people you know.') },
    { id: 'y_night_driver', age: 34, t: 'Small Hours', auto: true, cond: (g) => !!g.recall('nightJob'),
      text: 'Driving in the small hours, you carry programmers working overtime, girls in tears, and bosses who have had too much to drink. Each of them says thank you as they get out.' },
    { id: 'y_soldhouse', age: 34, t: 'No Flat', auto: true, cond: (g) => !!g.recall('soldHouse'),
      text: 'After selling the flat, you rent again. At the start of the month you no longer watch the mortgage, and life lets out a breath.' },
    { id: 'y_friend_after', age: 34, t: 'a friend', auto: true, cond: (g) => !!g.recall('oldFriend'),
      text: (g) => (g.recall('oldFriend') === 'went' ? 'That friend’s child is born and takes you on as a godparent, which makes you a kind of ' + (isMale(g) ? 'Dad' : 'Mom') + '. ' : 'On social media, you see your old friend’s child’s first-month celebration. You tap like, think for a moment, and add a message of congratulations.') },
    { id: 'y_look34', age: 34, t: 'Weekends', auto: true, cond: (g) => g.recall('look34') === 'learn' && !g.recall('last34'),
      text: 'The weekend course is finished. You find that you can still learn, and it makes you happy for days.' },
    { id: 'y_single_after', age: 34, t: 'Your Own Days', auto: true, cond: (g) => single(g) && ['self', 'refuse'].includes(g.recall('singleWay')),
      text: 'You keep your own life in good order. On weekends you go hiking with friends, and in the evenings you watch an old film. Sometimes when you wake at night, you wonder who will keep you company when you are old.' },
    // 第一份工作的风险兑现：大厂会裁员，自媒体会断流
    { id: 'y_offer_echo', age: 28, t: 'The Choice You Made', auto: true,
      cond: (g) => working(g) && ((g.recall('offer22') === 'big' && ['tech', 'office'].includes(g.recall('job')) && tierNow(g) === 1) || (g.recall('offer22') === 'media' && g.recall('job') === 'creator')),
      fx: (g) => {
        const media = g.recall('offer22') === 'media';
        last.cut = g.rnd() < (media ? 0.45 : 0.3);
        const m = CN.jobPay(g, g.recall('job'));
        if (!last.cut) { last.amt = r1000(m * (media ? 5 : 3)); CN.earn(g, last.amt); g.stat('事业', 4); }
        else if (media) { CN.setJob(g, 'freelance', 'Freelance video editor'); g.stat('心情', -5); }
        else { last.amt = r1000(m * 7); CN.earn(g, last.amt); CN.setJob(g, 'office', 'Small-company employee'); g.stat('事业', -4); g.stat('心情', -5); }
      },
      text: (g) => {
        const media = g.recall('offer22') === 'media';
        if (media) return last.cut ? 'The platform changes its recommendation rules, and your views drop overnight to a tenth of what they were. You hold on for half a year, then start editing videos for other people, paid per clip.'
          : 'Your account has survived several platform overhauls. This year ad deals bring in ' + CN.fmt(last.amt) + ', and people in the comments call you “teacher.”';
        return last.cut ? 'You are on the list in the third round of layoffs. Severance is N+1, one month’s pay per year of service plus one, totaling ' + CN.fmt(last.amt) + '. You carry a cardboard box downstairs, and the security guard nods at you. A month later you join a small company, for less money, but you can leave at seven in the evening.'
          : 'The big company has had two rounds of layoffs in these years, and you stayed through both. Your year-end bonus is ' + CN.fmt(last.amt) + ', and you stare blankly at your desk for a moment. You can no longer remember the last weekend you did not open your computer.';
      } },
    { id: 'y_biz_echo', age: 34, t: 'That Stall', auto: true, cond: (g) => ['stall', 'online', 'franchise'].includes(g.recall('biz')),
      fx: (g) => {
        const b = g.recall('biz');
        last.ok = g.rnd() < { stall: 0.55, online: 0.5, franchise: 0.65 }[b];
        last.who = helper(g);
        if (b === 'stall') {
          g.remember('side', '');
          if (last.ok) { CN.setJob(g, 'shop', 'Snack shop owner'); g.stat('事业', 6); g.stat('心情', 4); } else g.stat('健康', -2);
        } else if (b === 'online') {
          if (last.ok) { CN.setJob(g, 'boss', 'Online shop owner'); g.stat('事业', 8); } else g.stat('心情', -3);
        } else if (last.ok) { last.amt = r1000(frCost(g) * 0.5); CN.earn(g, last.amt); g.stat('事业', 8); }
        else { last.amt = r1000(frCost(g) * 0.2); CN.earn(g, last.amt); CN.setJob(g, tierNow(g) >= 4 ? 'worker' : 'office', tierNow(g) >= 4 ? 'Factory worker' : 'Company employee'); g.stat('心情', -6); }
      },
      text: (g) => {
        const b = g.recall('biz');
        const hire = last.who ? 'You call in ' + CN.who(g, last.who).replace(/^你的/, '') + ' to help, giving a monthly ' + (last.who === 'mo' || last.who === 'fa' ? 'allowance' : 'wage') + '. ' : 'You hire a helper.';
        if (b === 'stall') return last.ok ? 'The stall makes a name for itself, and there is often a line. You quit your job, take over a shopfront, and open a snack shop. ' + hire + 'Now,' + payWord(g) + '. '
          : 'After three years at the stall, your back cannot take it. You sell the cart and concentrate on your job. The regulars you built up in those years still greet you on the street.';
        if (b === 'online') return last.ok ? 'The online shop takes off, and the warehouse moves from the balcony to a small workshop. You quit your job. ' + hire + 'In a good month you can make $4,300 to $5,700, and in a bad one only enough to pay wages.'
          : 'The platform changes its rules, and traffic falls by more than half. You shut down the shop and clear the remaining stock on your social feed. A regular job pays less, but it pays every month.';
        return last.ok ? 'This ' + g.recall('bizKind') + ' has paid back its cost, and over these two years you have netted ' + CN.fmt(last.amt) + '. You open a second one on the next street over. ' + hire
          : 'Headquarters changes hands and franchise stores close one by one. Your ' + g.recall('bizKind') + ' holds out to the end, and the transfer recovers only ' + CN.fmt(last.amt) + '. ' + (debtW(g) ? 'The debt still outstanding is ' + CN.fmt(debtW(g) * 1e4) + '. ' : '') + 'You find another job,' + payWord(g) + '. ';
      } },
    { id: 'y_ladder_echo', age: 33, t: 'This Road', auto: true, cond: (g) => ['expert', 'move', 'stuck'].includes(g.recall('ladder')) && working(g),
      fx: (g) => { const l = g.recall('ladder'); if (l === 'expert') { last.amt = r1000(CN.jobPay(g, g.recall('job')) * 2); CN.earn(g, last.amt); } if (l === 'move') g.stat('心情', married(g) ? -2 : 1); if (l === 'stuck') g.stat('事业', 2); },
      text: (g) => ({
        expert: 'At an industry gathering, someone asks you by name to give a talk. Each talk pays ' + CN.fmt(last.amt) + ' in fees. You stumble through it, but the audience takes careful notes.',
        move: 'In ' + here(g) + ', in your second year, the branch grows from five people to twenty. ' + (married(g) ? 'On weekends the family explores the new city, and ' + g.recall('spouse') + ' says the food here is still hard to get used to.' : 'You get to know every breakfast shop downstairs.'),
        stuck: 'After missing out on that promotion, you put your energy into your craft. When the new people get stuck, they come to you first.',
      }[g.recall('ladder')]) },
    { id: 'y_broke_after', age: 28, t: 'After the Breakup', auto: true, cond: (g) => g.recall('singleWay') === 'broke' && single(g),
      text: 'After the breakup, you do not date for a long time. At least your work gets better.' },
    { id: 'y_startup_after', age: 31, t: 'The Company', auto: true, cond: (g) => ['ok', 'fail'].includes(g.recall('startup')),
      text: (g) => (g.recall('startup') === 'ok' ? 'The company has fifty people now. You start trying to remember everyone’s name.' : 'You go back to working for someone else. When the interviewer sees your résumé, they ask what you learned from the failed startup. You say: how to do the accounts.') },
    { id: 'y_promo_after', age: 33, t: 'The Team', auto: true, cond: (g) => g.recall('promoted') === true && g.recall('ladder') === 'mgr',
      text: 'One of the people you manage is a lot like you were when you graduated. You pass your experience on to them, point by point.' },
    { id: 'y_metparents_after', age: 26, t: 'The In-Laws', auto: true, cond: (g) => g.recall('metParents') === true && loveIs(g, 'dating'),
      text: 'The two sets of parents have a phone call that lasts an hour. You listen from the side, a little awkward and a little happy.' },
    { id: 'y_burnout_after', age: 31, t: 'Checkup', auto: true, cond: (g) => !!g.recall('burnout'),
      fx: (g) => { if (g.recall('burnout') === 'push') g.stat('健康', -4); },
      text: (g) => (g.recall('burnout') === 'push' ? 'At this year’s checkup, there are two more arrows than last year.' : 'After years of keeping up your workouts, you feel more energetic than you did at twenty-five.') },
    { id: 'y_ai_after', age: 27, t: 'Machines', auto: true, cond: (g) => !!g.recall('aiMove'),
      text: (g) => ({ learn: 'People at the company who can use AI are increasingly in demand. You are glad you stayed up those months back then.', switch: 'The model you trained has launched. In the news, you recognize sentences you wrote yourself.', care: 'One of the elderly people you care for keeps mistaking you for her grandson, and every time slips you a candy.', laid: 'In these years you have worked many odd jobs, and you have learned not to put all your eggs in one basket.' }[g.recall('aiMove')]) },
    { id: 'y_steady_after', age: 28, t: 'At Work', auto: true, cond: (g) => !!g.recall('steady'),
      text: (g) => ({ stay: 'Life is calm and steady, and you learn to make tea.', up: 'You become the youngest mainstay at the unit.', stuck: 'You have stopped competing. After work, you go learn to swim.', move: 'Life in the new city gradually takes shape. You have a noodle shop you go to often, and the owner remembers that you do not want scallions.', small: 'Life in the small city is slow. After work you go to the vegetable market, where a bunch of greens costs less than fifty cents.' }[g.recall('steady')]) },
    { id: 'y_workstyle_after', age: 25, t: 'What You Saved', auto: true, cond: (g) => !!g.recall('workStyle') && !white(g) && !!g.recall('money0'),
      text: (g) => {
        const s = cash(g) + (Number(g.recall('invest')) || 0);
        return ({ save: 'In these years you have lived frugally. ', fun: 'In these years you have not saved much, but you have made a pile of friends. ', study: 'The certificate you earned at night school came in handy, and you moved to a technical post. ' }[g.recall('workStyle')]) + 'Altogether, you have ' + CN.fmt(s) + (s >= CN.price(g, 4) * 0.3e4 ? ', enough for a down payment on a flat in your home county town.' : ', still some way short of a down payment on a flat in your home county town.');
      } },
    { id: 'y_skill_after', age: 26, t: 'The Craft', auto: true, cond: (g) => !!g.recall('skill'),
      text: (g) => ({ cook: 'The boss says your twice-cooked pork could be the signature dish. ', auto: 'Whatever car comes in, you can tell by the sound what is wrong with it. ', hair: 'A few regular customers only want you to cut their hair. ', elec: 'You can check the wiring of a whole building by yourself. ' }[g.recall('skill')]) + 'Your skill is good, and your pay has gone up a notch with it.' },
    { id: 'y_army_stay', age: 26, t: 'The Army', auto: true, cond: (g) => g.recall('army') === 'stay',
      fx: (g) => { if (!g.recall('armyOut')) { g.remember('armyOut', true); g.remember('lifePath', 'work'); CN.earn(g, 150000); CN.setJob(g, 'civil', 'Transferred to a local government unit'); CN.goCity(g, 3); } },
      text: 'After eight years in the army you are demobilized with a $21,000 transfer allowance. You are assigned to a local unit, and on the day you take off the uniform you fold it neatly.' },
    { id: 'y_gaokao_memory', age: 32, t: 'Gaokao', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => 'It is gaokao time again. The news says this year has the fewest test takers in decades. You think of your own year, when you ' + ({ top: 'came first in the whole county', good: 'did well', normal: 'just cleared the bachelor’s cutoff', college: 'only made it into junior college', fail: 'did not get in' }[g.recall('gk')]) + '. ' },
    { id: 'y_side_after', age: 23, t: 'What School Taught You', auto: true, cond: (g) => g.recall('uniSide') === 'money' && working(g),
      text: 'The money you saved from part-time jobs in college you now use to pay the first month’s rent and deposit.' },
    { id: 'y_campus_after', age: 24, t: 'Classmates', auto: true, cond: (g) => g.recall('campus') === 'club',
      text: 'The people you met in college clubs are now scattered across different cities. Wherever you go on business trips, someone treats you to a meal.' },
    { id: 'y_grad_after', age: 27, t: 'Friends from Grad School', auto: true, cond: (g) => g.recall('gradWay') === 'lab',
      text: 'A senior from the lab has joined a big company and asks if you want to come over. You say you will think about it.' },
    { id: 'y_rentforever', age: 32, t: 'The Renter', auto: true, cond: (g) => !!g.recall('rentForever') && g.recall('house') === 'rent' && !withParents(g),
      text: 'You have gone through three landlords, and your pothos is still alive.' },
    { id: 'y_late_marry', age: 33, t: 'A Late Marriage', auto: true, cond: (g) => g.recall('lateMarry') === 'match' && married(g),
      text: (g) => 'After the wedding, you and ' + g.recall('spouse') + ' have an understanding: whoever gets home first cooks.' },
    { id: 'y_kid2_life', age: 34, t: 'Two Children', auto: true, cond: (g) => g.recall('kid2') === 'yes' && g.alive('k2'),
      text: (g) => g.name('k1') + ' and ' + g.name('k2') + ' argue over a toy all afternoon. In the kitchen, you listen and end up laughing.' },
    { id: 'y_debt_paid', age: 34, t: 'The Books', auto: true, cond: (g) => debtW(g) === 0 && !!g.recall('soldHouse'),
      text: 'You work it out: you do not owe anyone a single cent. It is the first time since you became an adult.' },
    { id: 'y_frugal_after', age: 34, t: 'Tightening the Belt', auto: true, cond: (g) => !!g.recall('frugal'),
      text: (g) => 'After a year of scrimping, you still owe ' + CN.fmt(debtW(g) * 1e4) + '. ' + (debtW(g) < 40 ? 'The number goes down day by day, and you start to dare to think about the future.' : 'The road is still long. You mark the monthly repayment days on the calendar and cross them off, one square at a time.') },
    { id: 'y_credit_after', age: 24, t: 'The Bill', auto: true, cond: (g) => !!g.recall('credit'),
      fx: (g) => { if (g.recall('credit') === 'loan' && debtW(g) >= 3) { CN.pay(g, 32000); g.remember('debt', Math.max(0, debtW(g) - 3)); } },
      text: (g) => ({ loan: 'Installment on top of installment, and the interest rolled up to $4,600. You grit your teeth and spend half a year of pay clearing it, then delete those apps.', phone: 'The installments on your phone are paid off. There is a screen protector on it, without a single scratch.', none: 'You always keep three months of pay in your account. When a coworker needs money in a hurry, you are the first person they think of.' }[g.recall('credit')]) },
    { id: 'y_money26', age: 26, t: 'That Money', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') >= 2 && g.since('money1') <= 3, text: moneyAfter },
    { id: 'y_money34', age: 34, t: 'That Money', auto: true, cond: (g) => !!g.recall('money1') && g.since('money1') === 1, text: moneyAfter },
    { id: 'y_car31', age: 31, t: 'The Car', auto: true, cond: (g) => !!g.recall('car') && g.since('car') >= 2, text: carAfter },
    { id: 'y_car34', age: 34, t: 'The Car', auto: true, cond: (g) => !!g.recall('car') && g.since('car') === 1, text: carAfter },
    { id: 'y_side29', age: 29, t: 'Side hustle', auto: true, cond: (g) => !!g.recall('side'),
      fx: (g) => { if (g.rnd() < 0.4) g.remember('sideEnd', true); },
      text: (g) => ({ drive: 'In the years you took odd jobs at night, you made an extra $1,400 or so a year. ', stall: 'You ran the stall at the night market for three years, and regulars would go out of their way to find you. ', video: 'The orders for video editing kept growing, and you made an extra $1,400 or so a year. ' }[g.recall('side')] || '') + (g.recall('sideEnd') ? 'Later you really got tired, and stopped.' : 'You plan to keep going a few more years.') },
    { id: 'y_house_after', age: 30, t: 'the flat', auto: true, cond: (g) => !!g.recall('houseSize') && hasHouse(g),
      text: (g) => ({ big: 'In the three-bedroom flat, one room is saved for a future child, and for now it is filled with cardboard boxes and a bicycle. ', small: 'The small flat is packed full. Clothes hang on the balcony, along with scallions and chilies growing there. ', county: 'The flat in your home county town is barely lived in a few days a year. ' + (parentAlive(g) ? parentWord(g) + ' would pop by every few days to open the windows, saying a new supermarket had opened downstairs. ' : 'A neighbor keeps an eye on it for you, and when you go back for the New Year, you bring them two bottles of liquor. '), far: 'The flat on the edge of the city is getting closer to a metro station, and a new line opens next year. ' }[g.recall('houseSize')]) + (debtW(g) ? 'You still owe ' + CN.fmt(debtW(g) * 1e4) + ', and you are paying it off slowly.' : '') },
    { id: 'y_side_stop', age: 30, t: 'Taking a Break', auto: true, cond: (g) => !!g.recall('sideEnd') && !!g.recall('side'),
      fx: (g) => { g.remember('side', ''); },
      text: 'You stop the side hustle. The evening hours come back, and you use them to sleep, cook and zone out.' },
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

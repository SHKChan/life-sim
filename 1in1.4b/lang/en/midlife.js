/* 由 share/tools/tr.js 从 data/midlife.js 和 lang/en/tr/midlife.json 生成，不要手改。 */
/* 十四亿分之一 · 中年：35–64 岁
 * 三十五岁的坎、第二波转行、房子和钱、体检、婚姻、孩子上学到成家、父母老去和离世、退休前的打算。
 * 读青年部分留下的状态（job、love、kids、house、tier、workCity……），缺了就按兜底的写法。
 * 钱一律用 economy.js 的工具函数（CN.pay / CN.earn / CN.buyHouse / CN.invest……），文字里写出金额。
 * 新增的状态键名见文件末尾的说明。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const OFFICE = ['office', 'tech', 'sales'];
  const STABLE = ['civil', 'teacher', 'doctor', 'nurse', 'soldier'];
  const LABOR = ['worker', 'rider', 'driver', 'farmer'];
  const OWN = ['boss', 'shop', 'creator', 'freelance'];
  const JOBT = { office: 'Office worker', tech: 'Programmer', sales: 'Salesperson', civil: 'Civil servant', teacher: 'Teacher', doctor: 'Doctor', nurse: 'Nurse', soldier: 'Soldier',
    worker: 'Factory worker', rider: 'Delivery rider', driver: 'Driver', farmer: 'Farmer', boss: 'Business owner', shop: 'Shop owner', creator: 'Content creator', freelance: 'Freelancer', none: 'None' };
  const job = (g) => g.recall('job') || 'none';
  const cat = (g) => {
    const j = job(g);
    if (OFFICE.includes(j)) return 'office';
    if (STABLE.includes(j)) return 'stable';
    if (LABOR.includes(j)) return 'labor';
    if (OWN.includes(j)) return 'own';
    return 'none';
  };
  const married = (g) => g.recall('love') === 'married' && !!JY.byId.sp && g.alive('sp');
  const spName = (g) => (JY.byId.sp ? g.name('sp') : 'your partner');
  const kidsN = (g) => g.recall('kids') || 0;
  const hasKid = (g) => kidsN(g) > 0 && !!JY.byId.k1 && g.alive('k1');
  const kAge = (g) => (JY.byId.k1 ? g.ageOf('k1') : -1);
  const kn = (g) => (JY.byId.k1 ? g.name('k1') : 'Child');
  const kWho = (g) => CN.who(g, 'k1', true);
  const kHe = (g) => CN.he(g, 'k1');
  const kidAway = (g) => g.recall('custody') === 'ex';
  const house = (g) => g.recall('house') || 'none';
  const tier = (g) => g.recall('tier') || (g.recall('hukou') === 'rural' ? 5 : g.recall('hukou') === 'county' ? 4 : 3);
  const where = (g) => g.recall('workCity') || g.recall('homeCap') || 'the city';
  const atHome = (g) => !!g.recall('homeCap') && where(g) === g.recall('homeCap');
  const sibs = (g) => (g.recall('sibs') || 0) > 0;

  /* 钱：金额都是元，房子和欠款是万 */
  const fmt = (y) => CN.fmt(y);
  const cash = (g) => CN.cash(g);
  const owe = (g) => Number(g.recall('debt')) || 0;
  const hv = (g) => Number(g.recall('houseVal')) || 0;
  const invested = (g) => Number(g.recall('invest')) || 0;
  const hinc = (g) => Math.max(36000, CN.income(g));
  const myInc = (g) => hinc(g) * (married(g) && g.recall('spWork') !== 'home' ? 0.55 : 1);
  const k1 = (x) => Math.max(1000, Math.round(x / 1000) * 1000);
  const w1 = (x) => Math.max(10000, Math.round(x / 1e4) * 1e4);
  const BIG = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'];
  const SHOP = { 1: 300000, 2: 200000, 3: 150000, 4: 100000, 5: 60000 };
  const CAR = { 1: 300000, 2: 250000, 3: 200000, 4: 150000, 5: 120000 };
  const TUTOR = { 1: 60000, 2: 40000, 3: 25000, 4: 15000, 5: 10000 };
  const RAISE = { 1: 1500000, 2: 800000, 3: 600000, 4: 450000, 5: 300000 };
  const AIDE = { 1: 96000, 2: 72000, 3: 60000, 4: 48000, 5: 36000 };
  const NURS = { 1: 72000, 2: 54000, 3: 45000, 4: 36000, 5: 30000 };
  const COMMUTE = { 1: 'an hour and a half each way by metro', 2: 'forty minutes by metro', 3: 'twenty minutes by car', 4: 'ten minutes by e-bike', 5: 'a few minutes on foot' };
  // 这次抉择算出来的金额，给结果文字用（res 在 fx 之后马上求值）
  let A = 0, B = 0, M = '';
  const borrow = (g, wan) => { if (wan > 0) g.remember('debt', Math.round((owe(g) + wan) * 10) / 10); };
  // 存款不够、变成负数的部分，算成找亲戚、银行借的。返回借了多少元
  // c0 是这笔开销之前的存款：之前就是负数的部分不算这次借的
  const cover = (g, c0) => { const c = cash(g); const need = Math.min(-c, (c0 == null ? 0 : c0) - c); if (c >= 0 || need <= 0) return 0; const w = Math.ceil(need / 1e4); borrow(g, w); CN.earn(g, w * 1e4); return w * 1e4; };
  // 背得起这笔贷款吗：每年还款（连旧贷款）不超过全家收入的四成
  const canLoan = (g, wan) => (wan + owe(g)) * 0.065e4 <= hinc(g) * 0.4;
  const spend = (g, yuan) => { const c0 = cash(g); CN.pay(g, yuan); return cover(g, c0); };
  // 提前还贷：按比例减少每年的还款
  const prepay = (g, yuan) => {
    const d = owe(g);
    if (d <= 0) return 0;
    const w = Math.min(d, Math.floor(yuan / 1e4));
    CN.pay(g, w * 1e4);
    const nd = Math.round((d - w) * 10) / 10;
    const base = Number(g.recall('loanBase')) || 0;
    if (nd < 0.5) { g.remember('debt', 0); g.remember('loanBase', 0); if (house(g) === 'mortgage') g.remember('house', 'own'); }
    else { g.remember('debt', nd); g.remember('loanBase', Math.round(base * nd / d * 10) / 10); }
    return w * 1e4;
  };
  // 再买一套：CN.buyHouse 会把房价覆盖掉，这里把旧房子的价值加回去
  const addHouse = (g, price, down) => {
    const old = hv(g), c0 = cash(g);
    CN.buyHouse(g, { price, down });
    if (old) g.remember('houseVal', old + price);
    return cover(g, c0);
  };
  // 理财涨跌：按比例改理财里的钱
  const gain = (g, r) => {
    const v = invested(g), s = g.recall('investStyle') || 'fund';
    if (!v) return 0;
    const d = Math.round(v * r);
    CN.withdraw(g);
    if (d >= 0) CN.earn(g, d); else CN.pay(g, -d);
    CN.invest(g, v + d, s);
    return d;
  };
  const rentIn = (g, years) => { const r = Number(g.recall('rental')) || 0; if (r) CN.earn(g, r * years); return r * years; };
  // 爸妈老房子的价值（万）
  const oldVal = (g) => { const h = g.recall('hukou'); return h === 'rural' ? 15 : h === 'county' ? 35 : Math.round(CN.price(g, g.recall('cityTier') || 3) * 0.5); };
  // 住进不用花钱得来的房子（继承的老房子）
  const settleOld = (g, price) => { CN.earn(g, price * 1e4); CN.buyHouse(g, { price, down: 1 }); };
  const kidTier = (g) => { const c = g.recall('kidCity'); return BIG.includes(c) ? 1 : !c || c === where(g) ? tier(g) : 2; };

  /* 爸妈 */
  const pAlive = (g, id) => !!JY.byId[id] && g.alive(id);
  const parents = (g) => ['fa', 'mo'].filter((id) => pAlive(g, id));
  const parentAlive = (g) => parents(g).length > 0;
  const parentOld = (g) => Math.max(0, ...parents(g).map((id) => g.ageOf(id)));
  const paWord = (g) => { const p = parents(g); return p.length > 1 ? 'Mom and Dad' : p[0] === 'fa' ? 'father' : 'mother'; };
  const paThey = (g) => (parents(g).length > 1 ? 'they' : CN.he(g, parents(g)[0]));
  const paWho = (g) => parents(g).map((id, i) => (i ? CN.who(g, id, true).replace(/^你的/, '') : CN.who(g, id, true))).join('Living with ');
  const withPa = (g) => parents(g).some((id) => CN.livesWith(g, id));
  const older = (g) => { const p = parents(g); return p.length > 1 ? (g.ageOf('fa') >= g.ageOf('mo') ? 'fa' : 'mo') : p[0]; };
  // 爸妈搬出去（养老院、兄弟姐妹家）：青年时选过“接来同住”的也一并改掉，免得每年又被接回来
  const sendOut = (g) => { if (g.recall('parentsNear') === 'with') g.remember('parentsNear', 'far'); };

  // 回老家：场景、住处、城市等级都跟着回去，老年部分按 workCity 判断住在哪
  const backHome = (g) => {
    CN.goHome(g);
    const h = g.recall('hukou');
    g.remember('tier', h === 'rural' ? 5 : h === 'county' ? 4 : (g.recall('cityTier') || 3));
    g.remember('workCity', g.recall('homeCap'));
    g.info('住处', g.recall('homeCap') || 'Hometown');
  };
  // 再婚：去世的前一位配偶也叫 sp，要先从死亡名单里拿掉，新配偶才算活着
  const remarry = (g, o) => {
    const W = JY.engine.get().W;
    const before = g.recall('love');
    if (W && W.dead && W.dead.sp) delete W.dead.sp;
    CN.marry(g, o);
    if (before === 'divorced' || before === 'widowed') g.info('婚姻', 'Remarried');
  };
  // 按年份固定的随机数：cond 一年里会被判断好几次，用 g.rnd() 会让概率变样
  const yearRoll = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + (g.me || '').split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7) * 3.7 /* 每一世不同 */) * 43758.5453; return x - Math.floor(x); };
  const deadThisYear = (g, id) => { const W = JY.engine.get().W; return !!(W && W.dead[id] && W.dead[id].y >= g.Y - 1); };
  const done = (g, id) => { const L = JY.engine.get().L; return !!(L && L.done && L.done[id]); };
  // 孩子的升学结果：补习、学区、亲子关系和运气
  const kidResult = (g) => {
    let s = g.rnd() * 60;
    const p = g.recall('kidPush');
    if (p === 'hard') s += 18; else if (p === 'self') s += 22; else if (p === 'easy') s += 6;
    if (g.recall('kidSchool') === 'district') s += 10;
    if (g.recall('kidSchool') === 'good') s += 6;
    if (g.recall('kidSchool') === 'left') s -= 8;
    if (g.recall('kidMove') === 'buy' || g.recall('kidMove') === 'rent') s += 6;
    if (g.recall('kidBond') === 'close') s += 6;
    s += g.s('学识') / 10;
    return s >= 72 ? 'top' : s >= 50 ? 'good' : s >= 28 ? 'normal' : 'none';
  };

  /* 这一年已经有中年的抉择了吗？孩子和父母的事（下面的意外）就让到下一年，免得一年弹两个抉择 */
  const DEC = [];
  const quiet = (g) => g.age !== 50 && !DEC.some((n) => n.age === g.age && (!n.cond || n.cond(g)));

  JY.addFlags({
    keptOldHouse: 'You kept the old family house, and the tree by the door is still there',
  });

  /* ================= 35–49 岁 ================= */
  const NODES = [
    { id: 'm_35_mirror', age: 35, t: 'Thirty-Five', auto: true,
      text: (g) => {
        const c = cat(g), j = job(g), h = house(g), t = tier(g);
        const JD = { teacher: 'Some of the first class you ever taught have jobs of their own now. ', doctor: 'You work four night shifts a month, and the morning after a shift the sun looks white. ', nurse: 'You work four night shifts a month, and the morning after a shift the sun looks white. ',
          civil: 'Under the glass on your desk is a group photo from ten years ago. ', soldier: 'In the army you count as a veteran now. ', rider: 'You are on your third e-bike. ', driver: 'The leather on your steering wheel has worn shiny. ',
          worker: 'Two robot arms were just installed on the shop floor. ', farmer: 'Half the work in the fields has gone to drones. ', creator: 'Your follower count has stopped growing. ', freelance: 'In the group chat where jobs get posted, the quotes get lower every year. ' };
        const a = c === 'office' ? (t <= 2 ? 'Every morning is ' + COMMUTE[t] + ', and you end up squeezed against the door. ' : '') + 'The new young hires call you “Teacher,” and you know it is not all politeness. '
          : c === 'stable' ? (JD[j] || '') + 'At work you can see the whole road ahead. Some days that feels like a blessing, some days it doesn’t. '
          : c === 'labor' ? (JD[j] || '') + 'Your back aches more easily than it used to. The youngest guy on the crew is fifteen years younger than you. '
          : c === 'own' ? (JD[j] || 'You could do the shop’s accounts with your eyes closed. The numbers just get smaller every year. ') : 'You are thirty-five. Life moves at an ordinary pace. ';
        const b = h === 'mortgage' && owe(g) > 0 ? 'You still owe ' + fmt(owe(g) * 1e4) + '. ' : h === 'rent' ? 'Your landlord called again about raising the rent. ' : h === 'own' ? 'The home is finally yours. ' : h === 'hometown' ? 'You live in the house back home. ' : '';
        const m = cash(g) > 0 ? 'Your bank card holds ' + fmt(cash(g)) + '. ' : 'There is hardly any money left on your card.';
        return a + b + m;
      } },
    { id: 'm_35_office', age: 35, t: 'The Cut List', loc: 'office', cond: (g) => cat(g) === 'office',
      text: (g) => (job(g) === 'tech' ? 'The new system can write its own code and test it. ' : job(g) === 'sales' ? 'Your old clients have started placing orders directly with an AI. ' : 'Reports, proposals, meeting minutes: the new system produces them in seconds. ')
        + 'The company wants to “cut costs and boost efficiency.” Your manager calls you in and asks what you plan to do. You have been working in ' + where(g) + ' for ten years already.',
      choices: [
        { t: (g) => 'Stay and accept a pay cut and transfer (down to about ' + fmt(k1(mPay(g, job(g)) * 0.7)) + '/month, and you could be on the next round’s list too)', canon: true, fx: (g) => { g.stat('事业', -8); g.stat('心情', -3); g.remember('crisis35', 'stay'); }, res: (g) => 'Your desk moved from the window to the door. Your pay dropped by thirty percent, and you didn’t give ' + (married(g) ? spName(g) : 'your family') + ' the details.' },
        { t: (g) => 'Take the severance and move to a small company (severance about ' + fmt(k1(myInc(g) / 12 * 11)) + ', small company about ' + fmt(mPay(g, job(g), null, -4)) + '/month, and it could fold any day)', dev: 15, fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); g.stat('事业', -4); g.remember('crisis35', 'small'); },
          res: () => 'You took ' + fmt(A) + ' in severance. The boss at the small company was eight years younger than you and very polite. In your first month, you relearned how to do everything.' },
        { t: (g) => 'Take the severance and open a small shop of your own (startup money ' + fmt(SHOP[tier(g)] || 150000) + ', ' + CN.jobLine(g, 'shop') + ')', dev: 25,
          fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); B = SHOP[tier(g)] || 150000; M = spend(g, B); CN.setJob(g, 'shop', 'Opened a small shop'); g.remember('crisis35', 'shop'); },
          res: () => 'Severance came to ' + fmt(A) + '. Finding a storefront, fitting it out and stocking it cost ' + fmt(B) + (M ? ', and the shortfall of ' + fmt(M) + ' was borrowed' : '') + '. On opening day, a former colleague sent a flower basket.' },
        { t: (g) => 'Go back to your hometown and sit the exam for a permanent government post (' + CN.jobLine(g, 'civil', 4) + ')', dev: 25, check: ['学识', 60], cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'civil', 'County public-sector job'); g.remember('crisis35', 'home'); g.stat('心情', 4); }, res: 'Thirty-five was the last year you could apply. You passed and moved back to your hometown.',
          fail: { fx: (g) => { backHome(g); CN.setJob(g, 'none', 'Between jobs'); g.remember('crisis35', 'idle'); g.stat('心情', -6); }, res: 'You missed by two points. You moved back to your hometown anyway and stayed home for a while.', dev: 10 } },
      ] },
    { id: 'm_35_stable', age: 35, t: 'Going for the Post', loc: 'office', cond: (g) => cat(g) === 'stable',
      text: (g) => ({ teacher: 'A grade-head post has opened up at the school. ', doctor: 'A deputy-director post has opened up in your department. ', nurse: 'A head-nurse post has opened up in your department. ', soldier: 'A deputy post has opened up in your unit. ' }[job(g)] || 'A deputy section-chief post has opened up at your office. ') + 'Your boss quietly asks whether you want to put your name down.',
      choices: [
        { t: 'Forget it, keep your head down and do your own job', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('stableRoute', 'steady'); },
          res: (g) => 'The list went up and your name wasn’t on it. After work you carried on as usual, ' + (hasKid(g) && kAge(g) < 12 && !kidAway(g) ? 'picking up your child.' : 'buying vegetables at the market.') },
        { t: 'Put your name down and compete for it', dev: 15, check: ['人缘', 55],
          fx: (g) => { g.stat('事业', 10); CN.setJob(g, job(g), JOBT[job(g)] + ' (middle management)'); g.remember('stableRoute', 'lead'); }, res: 'You got the post. At meetings you sat two rows closer to the front, and you left work two hours later.',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('stableRoute', 'lost'); }, res: 'You didn’t get it. The person who did is better with words. For the next few years, you nodded to each other in the corridor.', dev: 5 } },
        { t: (g) => 'Quit and try your luck outside (borrow $29,000 as startup money, ' + CN.jobRisk('boss') + ')', dev: 30, fx: (g) => { borrow(g, 20); CN.setJob(g, 'boss', 'Quit to go into business'); g.remember('stableRoute', 'quit'); }, res: 'Your family thought you had lost your mind. You handed in your resignation and borrowed $29,000 from relatives.' },
      ] },
    { id: 'm_35_labor', age: 35, t: 'The Day You Can’t Keep Going', cond: (g) => cat(g) === 'labor',
      text: (g) => (job(g) === 'farmer' ? 'More and more of the village’s land is being contracted out to big operators. ' : job(g) === 'rider' ? 'The platform has added a fleet of delivery robots. They don’t eat and they don’t take days off. ' : 'New robots have arrived at the factory and the depot. They don’t eat and they don’t take days off. ') + 'You work out how many more years you can keep doing this.',
      choices: [
        { t: 'Keep going and take on more work', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('事业', 5); g.remember('laborRoute', 'grind'); }, res: 'You get in an hour before everyone else every day. The money is better, but your back clicks when you turn over at night.' },
        { t: (g) => 'Learn to repair robots (tuition $850; once you qualify, ' + CN.jobLine(g, 'worker', null, 8) + ')', dev: 20, check: ['学识', 40],
          fx: (g) => { spend(g, 6000); CN.setJob(g, 'worker', 'Robot repair technician'); g.stat('事业', 8); g.remember('laborRoute', 'skill'); }, res: 'The training course cost $850. You went to class at night and got your certificate three months later. The machines that were taking over your job are now yours to repair.',
          fail: { fx: (g) => { spend(g, 6000); g.stat('心情', -3); g.remember('laborRoute', 'grind'); }, res: 'You couldn’t make sense of the wiring diagrams. The $850 in tuition was wasted, and you went back to your old trade.', dev: 5 } },
        { t: 'Go back to your hometown and stop grinding it out away from home', dev: 15, cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, g.recall('hukou') === 'rural' ? 'farmer' : 'shop', g.recall('hukou') === 'rural' ? 'Back home farming' : 'Runs a small shop back home'); g.remember('laborRoute', 'home'); g.stat('心情', 3); }, res: 'You packed up your bedding and rode through the night. Breakfast back home still tastes the same.' },
        { t: 'Try somewhere new and open a car repair shop in the county town', dev: 15, cond: (g) => atHome(g) && job(g) !== 'farmer',
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'shop', 'Opened a car repair shop'); g.remember('laborRoute', 'home'); }, res: () => 'Renting a space and buying tools cost $7,100' + (M ? ', and you borrowed ' + fmt(M) : '') + '. You painted the sign over the door yourself.' },
      ] },
    { id: 'm_35_own', age: 35, t: 'Business', cond: (g) => cat(g) === 'own',
      text: (g) => 'Someone comes to you and says now is the perfect time to expand, and asks if you want to open another location and put in more money. By your count, it would take ' + fmt(SHOP[tier(g)] || 150000) + '. ',
      choices: [
        { t: 'Keep it steady and don’t gamble', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('ownRoute', 'steady'); }, res: 'You see the person out and go back to wiping down your counter.' },
        { t: 'Borrow money to expand', dev: 20, check: ['事业', 45],
          fx: (g) => { B = SHOP[tier(g)] || 150000; M = spend(g, B); g.stat('事业', 10); g.remember('ownRoute', 'grow'); }, res: () => 'You put in ' + fmt(B) + (M ? ', of which ' + fmt(M) + ' was borrowed' : '') + '. The second shop opened, and you started learning to be a real boss.',
          fail: { fx: (g) => { borrow(g, Math.round((SHOP[tier(g)] || 150000) / 1e4)); g.stat('心情', -5); g.remember('ownRoute', 'debt'); }, res: (g) => 'The new shop was in the wrong place. It closed after half a year, leaving ' + fmt(SHOP[tier(g)] || 150000) + ' in debt.', dev: 10 } },
        { t: 'Close up and look for a regular job', dev: 15, fx: (g) => { CN.setJob(g, 'office', 'Office worker'); g.stat('心情', 2); g.remember('ownRoute', 'quit'); }, res: 'You handed the keys back to the landlord, bought two shirts, and went to interviews.' },
      ] },
    { id: 'm_35_none', age: 35, t: 'Finding Something to Do', cond: (g) => cat(g) === 'none',
      text: 'For years you haven’t had a proper job. When your family asks, you always say you’re still looking.',
      choices: [
        { t: 'Find some work and start earning', canon: true, fx: (g) => { CN.setJob(g, 'worker', CN.pick(['Warehouse stocker', 'Property security guard', 'Supermarket stocker', 'Cleaner'])); g.remember('noneRoute', 'work'); }, res: 'The pay isn’t high, but it comes every month. For the first time, you think having somewhere to go isn’t so bad.' },
        { t: 'Stay home and look after the whole family', dev: 10, cond: (g) => married(g) || hasKid(g) || parentAlive(g), fx: (g) => { g.info('职业', 'Stay-at-home'); g.stat('人缘', 4); g.remember('noneRoute', 'home'); }, res: 'Three meals a day, school runs, doctor visits: it is all you. Nobody pays you a salary, and nobody can do without you.' },
        { t: 'Learn a trade and take jobs on your own', dev: 20, check: ['学识', 35],
          fx: (g) => { spend(g, 8000); CN.setJob(g, 'freelance', CN.pick(['Renovation contractor', 'Appliance repairer', 'Cake maker', 'Video editor'])); g.stat('事业', 6); g.remember('noneRoute', 'craft'); }, res: 'Learning the trade cost $1,100. Half a year later, your name started getting passed around in a few group chats. “Call this one, the work is good.”',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('noneRoute', 'work'); CN.setJob(g, 'worker', 'Warehouse stocker'); }, res: 'After half a year you still hadn’t mastered it, and you ended up at the warehouse anyway.', dev: 5 } },
      ] },
    { id: 'm_36_parents', age: 36, t: 'Mom and Dad', auto: true, cond: (g) => parentAlive(g),
      text: (g) => {
        const two = parents(g).length > 1;
        const a = two ? 'Both your parents are past sixty. ' : CN.who(g, parents(g)[0], true) + (withPa(g) ? ' now has completely white hair. ' : ' stays on in the old home, and your other parent is gone. ');
        const b = withPa(g) ? paThey(g) + ' had moved in with you. By the time you head out in the morning, there is already noise in the kitchen. '
          : sibs(g) ? 'In the siblings’ group chat, people have started bringing up who goes home more and who goes less. ' : 'You are an only child, and you have known since you were small what that means. ';
        return a + b + (!withPa(g) && !atHome(g) && tier(g) <= 2 ? 'Your hometown is more than 500 kilometers away.' : '');
      } },
    { id: 'm_36_money', age: 36, t: 'Spare Cash', loc: 'home', cond: (g) => cash(g) >= 80000,
      text: (g) => 'At year-end you tally up, and your bank card holds ' + fmt(cash(g)) + '. ' + (house(g) === 'mortgage' && owe(g) > 0 ? 'You still owe ' + fmt(owe(g) * 1e4) + '. ' : '') + 'Your coworkers are all talking about funds, and ' + (married(g) ? spName(g) : pAlive(g, 'mo') ? 'your mom' : 'the bank teller') + ' says fixed-term deposits are the safest bet.',
      choices: [
        { t: 'Put it in a fixed-term deposit for emergencies', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.remember('money36', 'safe'); g.remember('inv36', A); }, res: () => 'You put ' + fmt(A) + ' into a three-year fixed deposit. The interest is small, but you sleep well.' },
        { t: 'Pay off part of the mortgage early', dev: 10, cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.remember('money36', 'prepay'); g.remember('inv36', A); },
          res: (g) => 'You paid off ' + fmt(A) + ' early. The monthly payment dropped, and that month you ' + (CN.hhCount(g) > 1 ? 'treated the whole family to hot pot.' : 'bought yourself a good pair of shoes.') },
        { t: 'Buy funds', dev: 10, fx: (g) => { A = w1(cash(g) * 0.5); CN.invest(g, A, 'fund'); g.remember('money36', 'fund'); g.remember('inv36', A); }, res: () => 'You bought ' + fmt(A) + ' worth across a few funds. There is now an app on your phone that you want to open every day.' },
        { t: 'Trade stocks yourself', dev: 20, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'stock'); g.remember('money36', 'stock'); g.remember('inv36', A); }, res: () => 'You opened an account and moved in ' + fmt(A) + '. At lunch you started watching the candlestick charts.' },
      ] },
    { id: 'm_37_crisis_echo', age: 37, t: 'Two Years Later', auto: true,
      cond: (g) => !!(g.recall('crisis35') || g.recall('stableRoute') || g.recall('laborRoute') || g.recall('ownRoute') || g.recall('noneRoute')),
      fx: (g) => {
        const r = g.recall('crisis35') || g.recall('stableRoute') || g.recall('laborRoute') || g.recall('ownRoute') || g.recall('noneRoute');
        A = 0;
        if (r === 'home' || r === 'steady') g.stat('心情', 3);
        if (r === 'grind') g.stat('健康', -3);
        if (r === 'debt') g.stat('心情', -4);
        if (r === 'lead' || r === 'skill' || r === 'craft') g.stat('事业', 4);
        if (r === 'grow') { A = w1(hinc(g) * 0.4); CN.earn(g, A); }
      },
      text: (g) => {
        const c = g.recall('crisis35');
        if (c === 'stay') return 'Since the pay cut and transfer, you have kept a low profile at the company. Another round of cuts came, and you were still not on the list. You started taking classes on weekends to learn something new.';
        if (c === 'small') return 'The small company didn’t last two years, and you moved to another one. You have gotten very good at changing jobs, and the new boss values you.';
        if (c === 'shop') return 'The shop does well some months and badly in others. The regulars know your name, and you know what they like.';
        if (c === 'home') return 'Working in the county, you are home by 5:30 every afternoon. You have started growing vegetables in the yard.';
        if (c === 'idle') return 'After going back home, you stayed in for over a year, then asked around and got a job managing a warehouse at a factory.';
        const s = g.recall('stableRoute');
        if (s === 'lead') return 'Since becoming middle management, your drinking capacity and your gray hairs have grown together.';
        if (s === 'lost') return 'You rarely think about not getting that post. As it turned out, the person who got it was transferred away first.';
        if (s === 'quit') return 'In the second year after striking out on your own, you finally stopped losing money. You pay back the loan on time every month.';
        if (s === 'steady') return 'You still sit at the same desk. The tree outside the window has grown taller.';
        const l = g.recall('laborRoute');
        if (l === 'skill') return 'You have become the most sought-after repairman at the factory, and people call you in the middle of the night.';
        if (l === 'home') return 'Since going back home, you earn less and you have put on weight.';
        if (l === 'grind') return 'You kept at it for two more years. Your checkup report has a few more flagged results, and your savings have a few more digits.';
        const o = g.recall('ownRoute');
        if (o === 'grow') return 'Two shops, and you run between them. The second shop has earned back ' + fmt(A) + ' over these two years, and the ledger has been replaced by a tablet.';
        if (o === 'debt') return 'The debt still hangs over you. You started taking small jobs you used to look down on, filling the hole back in bit by bit.';
        if (o === 'quit') return 'Since going back to a regular job, you wait for payday on the tenth of every month. You say you sleep better this way.';
        if (o === 'steady') return 'Your shop is still in the same place. Several others nearby have opened and closed, and you are still here.';
        const n = g.recall('noneRoute');
        if (n === 'home') return 'The whole household is in your hands. ' + (hasKid(g) ? 'Your child says you are the one the family can’t do without.' : 'Your family says they can’t manage without you.');
        if (n === 'craft') return 'People who want to hire you now have to book a month ahead.';
        return 'You stuck with that job. You leave on time every day and come home on time.';
      } },
    { id: 'm_37_kid2', age: 37, t: 'Have Another Baby', loc: 'home',
      cond: (g) => married(g) && kidsN(g) === 1 && hasKid(g) && kAge(g) >= 2 && g.recall('kidPlan') !== 'dink' && (CN.sexOf(g) === '女' ? g.age : g.ageOf('sp')) <= 40,
      text: (g) => kWho(g) + ' asks you whether you could have another baby, because ' + kHe(g) + ' wants a younger brother or sister. ' + (g.recall('kid2') === 'no' ? 'You two agreed back then to have only one. ' : '') + 'Raising one child in ' + where(g) + ' costs at least ' + fmt(RAISE[tier(g)] || 600000) + '. ',
      choices: [
        { t: 'One is enough', canon: true, fx: (g) => { g.remember('kid37', 'one'); g.stat('心情', 1); }, res: (g) => 'You packed up ' + kn(g) + '’s baby clothes and gave them to a relative.' },
        { t: 'Have Another Baby', dev: 15, check: ['健康', 45],
          fx: (g) => { CN.haveKid(g); g.remember('kid37', 'two'); g.stat('心情', 4); g.stat('健康', -3); }, res: (g) => 'Your second child was born, named ' + g.name('k2') + '. ' + kn(g) + ' leaned against the glass and watched the baby in the incubator for a long time.',
          fail: { fx: (g) => { g.remember('kid37', 'tried'); g.stat('心情', -2); }, res: 'You tried for over a year without success. In the end you stopped pushing it.', dev: 5 } },
      ] },

    /* 38 岁：婚姻 */
    { id: 'm_38_marriage', age: 38, t: 'Cold Silence', loc: 'home', cond: (g) => married(g),
      text: (g) => 'You and ' + spName(g) + ' haven’t had a real conversation in a long time. At the dinner table, each of you looks at your own phone.',
      choices: [
        { t: 'Just keep going like this', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('marriage', 'cold'); }, res: 'Life went on as usual. The house was quiet, as quiet as a hotel.' },
        { t: 'Find a time to have a real talk', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); g.remember('marriage', 'mended'); }, res: 'You sat at the barbecue stall downstairs until midnight. You talked it out, and you cried. On the walk home, you held hands.',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('marriage', 'cold'); }, res: 'Halfway through, it turned into an argument. After that, you talked even less.', dev: 3 } },
        { t: 'Get a divorce', dev: 25,
          fx: (g) => {
            const kid = hasKid(g);
            g.unrel('wife'); g.unrel('husband'); g.remember('love', 'divorced'); g.info('婚姻', 'Divorced'); g.remember('marriage', 'split');
            if (kid) g.remember('custody', g.rnd() < 0.5 ? 'me' : 'ex');
            A = 0; B = 0; M = '';
            if (hv(g) > 0 && g.recall('custody') === 'me') { A = Math.max(0, Math.round((hv(g) - owe(g)) / 2) * 1e4); B = spend(g, A); M = 'keep'; }
            else if (hv(g) > 0) { CN.sellHouse(g); M = 'sold'; }
            if (cash(g) > 0) CN.pay(g, cash(g) / 2);
            g.stat('心情', -6);
          },
          res: () => 'The paperwork went faster than you expected. ' + (M === 'keep' ? 'The house stayed with you and your child, and you paid the other side ' + fmt(A) + (B ? ', of which ' + fmt(B) + ' was borrowed' : '') + '. ' : M === 'sold' ? 'The house was sold and the money split in half. You were renting again. ' : 'The savings were split in half. ') + 'Outside the civil affairs office, you stood at the door for a moment, then each went your own way.' },
      ] },
    { id: 'm_38_single', age: 38, t: 'Thirty-Eight', cond: (g) => !married(g),
      text: (g) => (g.recall('love') === 'divorced' ? 'You have been divorced for several years. ' : g.recall('love') === 'widowed' ? 'Your spouse passed away several years ago. ' : 'You are thirty-eight and still on your own. ')
        + (parentAlive(g) ? paWord(g) + ' put it another way on the phone: “Find someone, so you’ll have someone to talk to when you’re old.”' : 'At the New Year gathering, your relatives put it another way: “Find someone, so you’ll have someone to talk to when you’re old.”'),
      choices: [
        { t: 'Listen to your family and go on blind dates', canon: true, fx: (g) => { A = w1(Math.min(80000, hinc(g) * 0.3)); remarry(g, { origin: 'met on a blind date' }); spend(g, A); g.remember('marry38', 'match'); g.stat('心情', 1); },
          res: (g) => 'The fifth person you met was ' + spName(g) + '. Neither of you said anything about love, only that you suited each other. Half a year later you registered your marriage and held a simple banquet of a few tables, which cost ' + fmt(A) + '. ' },
        { t: 'Being on your own is fine too', dev: 15, fx: (g) => { g.info('婚姻', g.recall('love') === 'divorced' ? 'Divorced, single' : g.recall('love') === 'widowed' ? 'Widowed' : 'Single'); g.stat('心情', 4); g.remember('marry38', 'alone'); },
          res: 'You bought yourself a better mattress and got a pothos plant that refuses to die.' },
        { t: 'Wait for someone you can really talk to', dev: 10, check: ['人缘', 50],
          fx: (g) => { remarry(g, { origin: 'introduced by a friend' }); spend(g, 30000); g.stat('心情', 6); g.remember('marry38', 'love'); }, res: (g) => 'At a friends’ get-together, ' + spName(g) + ' sat next to you. You talked from an old movie until dawn. The next year you registered your marriage and treated your friends to a meal.',
          fail: { fx: (g) => { g.stat('心情', -2); g.remember('marry38', 'alone'); }, res: 'That person never showed up. Eventually you stopped waiting, and life still had its flavor.', dev: 3 } },
      ] },
    { id: 'm_39_love_echo', age: 39, t: 'This Year', auto: true, cond: (g) => !!(g.recall('marriage') || g.recall('marry38')),
      fx: (g) => { const m = g.recall('marriage'); if (m === 'cold') g.stat('健康', -2); if (m === 'mended') g.stat('心情', 3); },
      text: (g) => {
        const m = g.recall('marriage');
        if (m === 'mended' && married(g)) return 'Since that long talk, you two go grocery shopping together on weekends. ' + spName(g) + ' remembers that you don’t eat cilantro.';
        if (m === 'cold' && married(g)) return 'You are still under one roof. You started having insomnia, and later learned to take a couple of laps downstairs before bed.';
        if (m === 'split') return g.recall('custody') === 'me' ? 'After the divorce, your child lives with you. You make two breakfasts in the morning and quiz vocabulary at night, one person doing the work of two. Your child says your egg fried rice is the best.' : g.recall('custody') === 'ex' ? 'After the divorce, your child went with the other parent. Every Saturday is yours, and you start planning where to go a week ahead.' : 'After the divorce, half your home sat empty. You filled the rest with books.';
        const l = g.recall('marry38');
        if (l === 'match' && married(g)) return 'Married life after the matchmade wedding is calmer than you expected. Each of you gives a little, and it works.';
        if (l === 'love' && married(g)) return 'You cherish this person all the more for meeting them a few years late.';
        if (!married(g)) return 'Your life is free. You hike on weekends, read in the evenings, and when you’re sick, friends bring you congee.';
        return 'The year passed quietly.';
      } },
    { id: 'm_39_money_echo', age: 39, t: 'That Money', auto: true, cond: (g) => !!g.recall('money36'),
      text: (g) => {
        const m = g.recall('money36'), p = Number(g.recall('inv36')) || 0, v = invested(g);
        if (m === 'prepay') return 'The ' + fmt(p) + ' you paid off early gives you a bit of breathing room every month. ' + (owe(g) > 0 ? 'The mortgage still stands at ' + fmt(owe(g) * 1e4) + '. ' : 'The mortgage is fully paid off.');
        if (m === 'safe') return 'The fixed deposit matured, and the ' + fmt(p) + ' earned a little interest. You put it away for another three years.';
        if (!v) return 'The ' + fmt(p) + ' you put in back then, you later withdrew entirely.';
        return (v >= p ? 'Three years on, the ' + fmt(p) + ' you put in back then is now ' + fmt(v) + '. You didn’t brag to anyone.' : 'Three years on, the ' + fmt(p) + ' you put in back then is down to ' + fmt(v) + '. You hardly open that app anymore.');
      } },

    /* 40 岁 */
    { id: 'm_40_nokid', age: 40, t: 'Child', loc: 'hospital', cond: (g) => married(g) && kidsN(g) === 0,
      text: 'You have been married for years and still have no children. Both sets of parents no longer ask to your face, they just sigh.',
      choices: [
        { t: 'Go to the hospital and try', canon: true, check: ['健康', 50],
          fx: (g) => { M = spend(g, 120000); CN.haveKid(g); g.stat('心情', 8); g.remember('nokid', 'ivf'); }, res: () => 'After over a year of hospital visits, it cost $17,000' + (M ? ', and you borrowed ' + fmt(M) : '') + '. The moment the baby cried out, you crouched in the corridor and wept.',
          fail: { fx: (g) => { spend(g, 90000); g.stat('心情', -6); g.remember('nokid', 'failed'); }, res: 'You tried three times at a cost of $13,000, and none worked. After the last one, neither of you said a word.', dev: 0 } },
        { t: 'Skip it and live as a couple', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('nokid', 'dink'); }, res: 'You turned the spare room into a study.' },
        { t: 'Adopt a child', dev: 25, fx: (g) => { spend(g, 20000); CN.haveKid(g, { born: g.Y - 3, origin: 'adopted child' }); g.stat('人缘', 4); g.remember('nokid', 'adopt'); }, res: 'The paperwork took most of a year. The first time the child called you that, it was in a tiny voice. You answered in a loud one.' },
      ] },
    { id: 'm_40_body', age: 40, t: 'Forty', cond: (g) => !(married(g) && kidsN(g) === 0),
      text: 'On your fortieth birthday you climbed three flights of stairs and were badly out of breath. In the mirror, the belly had arrived first.',
      choices: [
        { t: 'Carry on, deal with it after this busy spell', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('body40', 'ignore'); }, res: 'That busy spell never ended.' },
        { t: 'Start running', dev: 10, fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); g.remember('body40', 'run'); }, res: 'On the first day you ran one kilometer. On the second your legs hurt too much to take the stairs. On the third, you went again.' },
        { t: 'Treat yourself to a nice car', dev: 10, cond: (g) => cash(g) >= (CAR[tier(g)] || 200000) * 1.5,
          fx: (g) => { A = CAR[tier(g)] || 200000; spend(g, A); g.stat('心情', 5); g.remember('body40', 'car'); }, res: () => 'The new car cost ' + fmt(A) + ', and it sat parked downstairs. That night you went down to look at it several times.' },
      ] },
    { id: 'm_41_body_echo', age: 41, t: 'Your Body', auto: true, cond: (g) => !!(g.recall('body40') || g.recall('nokid') || g.recall('kid37')),
      fx: (g) => { if (g.recall('body40') === 'run') g.stat('健康', 3); if (g.recall('body40') === 'ignore') g.stat('健康', -2); },
      text: (g) => {
        const n = g.recall('nokid'), k = g.recall('kid37');
        if (n === 'ivf') return 'There is a little person in the house now, and you sleep half as much. Becoming a parent in your forties, your back clicks when you pick the baby up.';
        if (n === 'failed') return 'After that, you took a trip somewhere far away. When you came back, it felt as if you had put something down.';
        if (n === 'dink') return 'People your age all talk about tutoring classes. You two talk about where to go next.';
        if (n === 'adopt') return 'The child has slowly stopped being shy and rushes at you when you come home from work.';
        if (k === 'two') return 'The second child can walk now and toddles along behind ' + kn(g) + '. Household expenses went up a notch, and so did the laughter.';
        if (k === 'tried') return 'After that, you put all your attention on ' + kn(g) + '. On weekends the three of you go hiking.';
        const b = g.recall('body40');
        if (b === 'run') return 'After a year of running, you lost around fifteen pounds. The other runners in the neighborhood say hello when they see you.';
        if (b === 'car') return 'After a year with the new car, the trunk has gained ' + (hasKid(g) ? 'your child’s toys, ' : '') + (parentAlive(g) ? 'your parents’ medicine, ' : '') + 'and case after case of bottled water.';
        return 'Your checkup report has two more flagged results. You folded it up and shoved it in a drawer.';
      } },

    /* 42 岁：第二波 */
    { id: 'm_42_office', age: 42, t: 'The Second Decade', loc: 'office', cond: (g) => cat(g) === 'office',
      text: 'Your line of work has changed again. A lot of the work has gone to AI, and the people left either work with AI or are led around by it.',
      choices: [
        { t: 'Hang on and become middle management', canon: true, fx: (g) => { g.stat('事业', 5); g.stat('健康', -2); g.remember('career42', 'mid'); }, res: 'You now have a few people under you, and more meetings.' },
        { t: (g) => 'Switch to AI training (course $1,700, ' + CN.jobLine(g, 'tech', null, 8) + ')', dev: 20, check: ['学识', 55],
          fx: (g) => { spend(g, 12000); CN.setJob(g, 'tech', 'AI trainer'); g.stat('事业', 8); g.remember('career42', 'pivot'); }, res: 'The course cost $1,700. You taught the machine your years of industry experience. It learned fast, and you learned a lot too.',
          fail: { fx: (g) => { spend(g, 12000); g.stat('心情', -3); g.remember('career42', 'mid'); }, res: 'You failed the course assessment, and the $1,700 went down the drain. You returned to your old post and pretended you had never gone.', dev: 5 } },
        { t: (g) => 'Leave the big city and go back home (half the pay, about ' + fmt(mPay(g, 'office', 3)) + '/month, a ten-minute commute)', dev: 20, cond: (g) => tier(g) <= 2 && !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'office', 'Office worker back home'); g.stat('心情', 5); g.remember('career42', 'home'); }, res: 'You found a job back home that paid half as much. Your commute went from an hour and a half to ten minutes.' },
      ] },
    { id: 'm_42_stable', age: 42, t: 'A Transfer', cond: (g) => cat(g) === 'stable',
      text: 'Your unit is picking someone to spend three years helping out a remote county, with an allowance. Those who volunteer get priority for promotion when they return.',
      choices: [
        { t: 'Don’t go, your family needs you', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: (g) => 'You handed the sign-up form back. ' + (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? 'In those three years you didn’t miss a single parent-teacher meeting.' : 'In those three years you were there for every big and small thing at home.') },
        { t: 'Sign up and go', dev: 20, fx: (g) => { g.move('county', 'a remote mountain county'); g.stat('事业', 10); g.stat('人缘', -3); g.remember('career42', 'remote'); }, res: 'You went up into the mountains with two suitcases. At first you couldn’t understand how people there spoke.' },
        { t: (g) => 'Strike out on your own (startup money ' + fmt(w1((SHOP[tier(g)] || 150000) * 1.2)) + ', with the “iron rice bowl” (a secure job) gone, ' + CN.jobRisk('boss') + ')', dev: 25, cond: (g) => ['teacher', 'doctor', 'nurse'].includes(job(g)),
          fx: (g) => { A = w1((SHOP[tier(g)] || 150000) * 1.2); M = spend(g, A); CN.setJob(g, 'boss', job(g) === 'teacher' ? 'Runs own tutoring center' : 'Opened a clinic'); g.remember('career42', 'private'); },
          res: () => 'You gave up your iron rice bowl and put in ' + fmt(A) + (M ? ', of which ' + fmt(M) + ' was borrowed' : '') + '. On the day the sign went up, you stood at the door for a long time.' },
      ] },
    { id: 'm_42_labor', age: 42, t: 'A Different Way to Live', cond: (g) => cat(g) === 'labor',
      text: 'A fellow villager calls to say there is a storefront available and asks whether you want to go in together, $11,000 each. Another says there is a big construction site down south that pays in one month what you make here in two.',
      choices: [
        { t: 'Stay put and keep working', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('事业', 2); g.remember('career42', 'grind'); }, res: 'You are still in the same place. The breakfast sellers by the door have changed three times, and they all know you.' },
        { t: (g) => 'Open a shop with your fellow villager (put in $11,000, ' + CN.jobRisk('shop') + ')', dev: 15, cond: (g) => cash(g) >= 60000,
          fx: (g) => { M = spend(g, 80000); CN.setJob(g, 'shop', 'Co-owns a shop with a friend from home'); g.remember('career42', 'shop'); }, res: () => 'You put in $11,000' + (M ? ', and the shortfall of ' + fmt(M) + ' was borrowed' : '') + '. You opened a noodle restaurant, you in the kitchen and him on the books.' },
        { t: (g) => 'Go somewhere farther away (about ' + fmt(mPay(g, job(g), 1, 6)) + '/month, home once a year)', dev: 15, fx: (g) => { CN.goCity(g, 1); g.stat('事业', 6); g.stat('人缘', -4); g.remember('career42', 'far'); },
          res: (g) => 'You went to ' + g.recall('workCity') + '. You went home once a year, ' + (hasKid(g) && kAge(g) < 15 ? 'and your child had to pause for a second before recognizing you.' : 'and your family met you at the station and noticed how thin you had gotten.') },
      ] },
    { id: 'm_42_own', age: 42, t: 'A New Angle', cond: (g) => cat(g) === 'own',
      text: 'Your friends in business are all livestreaming, saying one evening can sell a month’s worth of your stock.',
      choices: [
        { t: 'Stick honestly to your old customers', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: 'Most of your customers have been with you for ten years. They say you’re the one they trust.' },
        { t: 'Go on camera and livestream yourself', dev: 15, check: ['人缘', 45],
          fx: (g) => { spend(g, 20000); g.stat('事业', 8); g.remember('career42', 'live'); }, res: 'Lights and equipment cost $2,900. On the first night only thirteen people watched. Three months later, someone recognized you on the street.',
          fail: { fx: (g) => { spend(g, 20000); g.stat('心情', -3); g.remember('career42', 'steady'); }, res: 'In front of the camera, you couldn’t string a sentence together. The $2,900 worth of equipment went into a cupboard.', dev: 5 } },
        { t: 'Hand it to your partner and rest for two years', dev: 15, fx: (g) => { g.stat('心情', 5); g.stat('事业', -5); g.remember('career42', 'rest'); }, res: 'For the first time you went to the park on a weekday morning. It turns out the park is full of people in the morning.' },
      ] },
    { id: 'm_42_none', age: 42, t: 'Getting Out and Doing Something', cond: (g) => cat(g) === 'none',
      text: 'The neighborhood posted a hiring notice: home elder-care aide, trained on the job, close to home.',
      choices: [
        { t: 'Stay home', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'stayhome'); }, res: 'You took a photo of the notice and sent it to a neighbor.' },
        { t: 'Sign up', dev: 15, fx: (g) => { CN.setJob(g, 'worker', 'Elder-care aide'); g.remember('career42', 'work'); }, res: 'Every day you visit a few elderly people at home, taking blood pressure and keeping them company. One old lady always calls you by her daughter’s name.' },
      ] },
    { id: 'm_43_career_echo', age: 43, t: 'Work', auto: true, cond: (g) => !!g.recall('career42'),
      fx: (g) => { const c = g.recall('career42'); A = 0; if (c === 'far') g.stat('人缘', -2); if (c === 'live' || c === 'pivot') g.stat('事业', 3); if (c === 'remote') { A = w1(myInc(g) * 0.3); CN.earn(g, A); } },
      text: (g) => ({
        mid: 'You are in more and more meetings. The code, proposals and reports all go to AI, and your job is to tell them, “No, do it again.”',
        pivot: 'In your year of AI training, every young person you meet calls you “senior.”',
        home: 'In your first year back home, you put on weight and started sleeping through the night.',
        steady: cat(g) === 'own' ? 'Another year at the shop. The old customers are still here, and some now bring their children.' : 'You spent another year at your old workplace, and everything was much like last year.',
        stayhome: 'You are still busy in and out of the house. Your neighbor took that job after all and often comes to tell you about the old people.',
        remote: 'On your assignment in the mountain county, you helped build a road and a new cafeteria for a primary school, and saved ' + fmt(A) + ' in allowances. When you left, someone stuffed two chickens into your car.',
        private: 'The first year on your own was the hardest. In the second, repeat customers started to increase.',
        grind: 'You worked another year. The crew turned over several times, you became the oldest, and the new hires all come to you for advice.',
        shop: 'The noodle shop’s sign has turned yellow from cooking smoke. At noon, there is a line at the door.',
        far: 'In your year away, you saved money, and also saved up ever shorter video calls with home.',
        live: 'More and more people in your livestream call you “big brother” or “big sis.” You can’t remember their names, but they remember yours.',
        rest: 'After a year off, you went back to look in on the shop. Your partner has run it reasonably well, which reassured you a little and let you down a little.',
        work: 'Caring for old people is not easy work. You often wonder who will knock on the door when you are old.',
      }[g.recall('career42')] || 'Work was steady this year.') },

    /* 44 岁：房子 */
    { id: 'm_44_buy', age: 44, t: 'The House', cond: (g) => ['none', 'rent'].includes(house(g)),
      text: (g) => 'In ' + where(g) + ', you have been renting for all these years. ' + (hasKid(g) && !kidAway(g) && kAge(g) >= 4 && kAge(g) < 18 ? kn(g) + ' asks you, “When are we going to have a home of our own?” ' : 'Your landlord says the place is being sold and asks you to think it over. ')
        + 'An ordinary flat here costs ' + fmt(CN.price(g) * 1e4) + ', and your card holds ' + fmt(Math.max(0, cash(g))) + '. ',
      choices: [
        { t: 'Keep renting and stay out of debt', canon: true, fx: (g) => { g.remember('house', 'rent'); g.stat('心情', 2); g.remember('house44', 'rent'); }, res: 'You switched to a place closer to work. With the money still in your hands, you felt at ease.' },
        { t: 'Move to a cheaper place and save for a down payment for two years', dev: 10, fx: (g) => { g.remember('house44', 'save'); g.stat('心情', -1); }, res: 'You moved to a complex farther out, and your rent dropped by a third. Every payday, you move a sum onto the home-buying card first.' },
        { t: 'Buy a place in your hometown county town', dev: 10, cond: (g) => tier(g) <= 3 && cash(g) >= CN.price(g, 4) * 0.3e4 && (cash(g) >= CN.price(g, 4) * 1.1e4 || canLoan(g, CN.price(g, 4) * 0.7)),
          fx: (g) => { const p = CN.price(g, 4); const down = cash(g) >= p * 1.1e4 ? 1 : 0.3; A = p * down * 1e4; CN.buyHouse(g, { tier: 4, price: p, down }); g.remember('house44', 'county'); },
          res: (g) => (house(g) === 'own' ? 'The county-town flat cost ' + fmt(A) + ', and you paid it all at once. ' : 'The down payment was ' + fmt(A) + ', and the rest was a loan. ') + 'With the keys in your hand, you sat in the empty living room all afternoon.' },
        { t: 'Buy right here and grit your teeth', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.2e4 && canLoan(g, CN.price(g) * 0.7),
          fx: (g) => { const c0 = cash(g); A = CN.price(g) * 0.3e4; CN.buyHouse(g, { down: 0.3 }); B = cover(g, c0); g.remember('house44', 'bought'); },
          res: () => 'The down payment was ' + fmt(A) + (B ? ', wiping out your savings, and you borrowed another ' + fmt(B) : ', wiping out your savings') + '. When the contract was signed, you did the math: the mortgage would run until you were in your sixties.' },
      ] },
    { id: 'm_44_loan', age: 44, t: 'The Mortgage', cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
      text: (g) => 'You still owe ' + fmt(owe(g) * 1e4) + ', and each year you have to repay ' + fmt((Number(g.recall('loanBase')) || owe(g)) * 0.065e4) + '. ' + (tier(g) <= 2 ? 'Home prices in the complex have fallen a bit since you bought. ' : '') + 'It is still deducted every month.',
      choices: [
        { t: 'Keep paying', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('house44', 'pay'); }, res: 'You set the payment date for the day after payday: out of sight, out of mind.' },
        { t: 'You’ve saved up some, so pay part of it off early', dev: 10, cond: (g) => cash(g) >= 150000,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.stat('心情', 4); g.remember('house44', 'early'); },
          res: (g) => 'You paid off ' + fmt(A) + ' early. The monthly payment dropped, and that month you ' + (CN.hhCount(g) > 1 ? 'treated the whole family to hot pot.' : 'bought yourself a good pair of shoes.') },
        { t: 'Sell and buy a smaller place', dev: 15, cond: (g) => hv(g) > 0,
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 0.6); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: cash(g) >= p * 1e4 ? 1 : 0.3 }); cover(g, c0); g.remember('house44', 'small'); },
          res: (g) => (house(g) === 'own' ? 'You bought a small two-bedroom, the mortgage was gone, and you felt twenty pounds lighter.' : 'You bought a small two-bedroom, and the mortgage was much smaller.') },
        { t: 'Sell the old place and buy a bigger one', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= hv(g) * 1.5 * 0.3e4 && canLoan(g, hv(g) * 1.05 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 1.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => 'You moved to a three-bedroom. ' + kn(g) + ' got a room to themselves, and the mortgage started again from the beginning' + (B ? ', and you also borrowed money from relatives: ' + fmt(B) : '') + '. ' },
      ] },
    { id: 'm_44_own', age: 44, t: 'About the House', cond: (g) => ['own', 'hometown'].includes(house(g)),
      text: (g) => 'The home is yours now' + (hv(g) ? ', worth ' + fmt(hv(g) * 1e4) : '') + '. Some people urge you to buy another one to rent out, others to trade up.',
      choices: [
        { t: 'Keep living in it, no fuss', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('house44', 'keep'); }, res: 'You turned the balcony into a little garden.' },
        { t: 'Buy a small one to rent out', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.7 * 0.3e4 && canLoan(g, CN.price(g) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g) * 0.7); A = p * 0.3e4; addHouse(g, p, 0.3); g.remember('rental', k1(p * 1e4 * 0.02)); g.remember('house44', 'second'); },
          res: (g) => 'You bought a small flat nearby with a down payment of ' + fmt(A) + '. The tenants were a young couple just out of college, and the monthly rent was ' + fmt((Number(g.recall('rental')) || 0) / 12) + '. ' },
        { t: 'Trade up to a bigger place', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && cash(g) + hv(g) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => 'You sold the old place and moved to a three-bedroom. ' + kn(g) + ' got a room to themselves, and you took on a mortgage again' + (B ? ', and you borrowed another ' + fmt(B) : '') + '. ' },
        { t: 'Transfer the house to your child', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 3); g.remember('house44', 'gift'); },
          res: (g) => (kAge(g) < 12 ? 'On the day of the transfer, your child was still small and didn’t understand what the paper was. You said, it’s your home.' : kn(g) + ' looked at their own name on the property certificate and said nothing for a long while.') },
        { t: 'Spend money renovating the house', dev: 10, cond: (g) => !hasKid(g),
          fx: (g) => { A = w1(Math.max(50000, hv(g) * 1e4 * 0.08)); spend(g, A); g.stat('心情', 4); g.remember('house44', 'renov'); }, res: () => 'The renovation cost ' + fmt(A) + '. You walked barefoot circuits across the new wooden floor.' },
      ] },
    { id: 'm_45_checkup', age: 45, t: 'The Checkup Report', loc: 'hospital',
      text: (g) => (cat(g) === 'labor' || cat(g) === 'own' || cat(g) === 'none' ? 'A free community checkup' : 'A workplace checkup') + ', and the report had a line in bold: ' + CN.pick(['thyroid nodule, follow-up recommended', 'high blood pressure', 'high blood sugar', 'fatty liver, moderate']) + '. ' + (g.recall('body40') === 'run' ? 'The doctor said it was lucky you exercise, or it would be worse.' : ''),
      choices: [
        { t: 'Get some medicine and take it', canon: true, fx: (g) => { g.stat('健康', 1); g.remember('check45', 'pills'); }, res: 'The pill box sits on the dining table: one in the morning, one at night.' },
        { t: 'Overhaul your daily routine', dev: 10, fx: (g) => { g.stat('健康', 6); g.stat('心情', -2); g.remember('check45', 'change'); }, res: 'You gave up late-night snacks and went to bed before eleven. For the first month, you went to sleep hungry every night.' },
        { t: 'Brush it off', dev: 10, fx: (g) => { g.stat('健康', -4); g.remember('check45', 'ignore'); }, res: 'You said everyone has a few things wrong with them. You photographed the report, saved it to your album, and never opened it again.' },
      ] },
    { id: 'm_46_house_echo', age: 46, t: 'Home', auto: true, cond: (g) => !!g.recall('house44'),
      fx: (g) => {
        const h = g.recall('house44');
        A = 0; M = '';
        if (h === 'bought') g.stat('心情', -1);
        if (h === 'second') A = rentIn(g, 2);
        if (h === 'save' && ['none', 'rent'].includes(house(g))) {
          if (cash(g) >= CN.price(g) * 0.33e4) { A = CN.price(g) * 0.3e4; CN.buyHouse(g, { down: 0.3 }); M = 'bought'; } else M = 'still';
        }
      },
      text: (g) => {
        const h = g.recall('house44');
        if (h === 'save') return M === 'bought' ? 'After two years of saving, the down payment of ' + fmt(A) + ' was finally together. You bought a small two-bedroom in ' + where(g) + ', and it drizzled on moving day.' : M === 'still' ? 'After two years of saving, you were still short on the down payment. You weren’t in a hurry; prices hadn’t gone up in those two years either.' : 'The money you saved was later put to other use.';
        return ({
          county: 'The county-town flat sits empty most of the time. Every year you go back for a few days to open the windows, mop the floor and air out the quilts.',
          rent: 'You moved again. Your belongings keep shrinking, and you say that suits you fine.',
          bought: 'On the day the mortgage comes out each month, you don’t want to spend a cent all day. But when you get home in the evening, it is your own lock that you open.',
          pay: 'Home prices shifted a bit again. You stopped checking and only look at how many installments remain.',
          early: 'The money you paid off early gives you a bit of breathing room every month.',
          small: 'The small place is quick to tidy. You realize that most of the big old place was just for storing things.',
          swap: 'The new home has more rooms, ' + (hasKid(g) ? 'and your child has taped a sign reading “Please knock” on the door.' : 'and you put a desk in the smallest one.'),
          keep: 'The flowers on the balcony bloom crop after crop.',
          second: 'The rental flat is on its second set of tenants. Over these two years the rent has totaled ' + fmt(A) + ', always arriving on time.',
          gift: 'The property certificate bears your child’s name. You feel that this was something you got done.',
          renov: 'The renovated home is comfortable to live in, and friends say it feels like a new home.',
        }[h] || '');
      } },
    { id: 'm_47_ai', age: 47, t: 'Another Wave', loc: 'office', cond: (g) => !['none', 'farmer', 'retired'].includes(job(g)),
      text: (g) => (cat(g) === 'stable' ? 'A new system has gone in at your workplace, and a lot of the work no longer needs people. Leadership talks about “streamlining.”' : cat(g) === 'own' ? 'A new unstaffed store has opened right next door, open twenty-four hours.' : 'The news says another batch of jobs has been taken over by robots and AI. Yours is on the edge of the list too.'),
      choices: [
        { t: 'Tough it out, even for less pay', canon: true, fx: (g) => { g.stat('事业', -5); g.stat('心情', -2); g.remember('ai47', 'hold'); }, res: 'Your income dropped another notch. You learned to think for three extra seconds before every expense.' },
        { t: 'Go learn something new', dev: 15, check: ['学识', 50],
          fx: (g) => { spend(g, 10000); g.stat('事业', 6); g.stat('学识', 3); g.remember('ai47', 'learn'); }, res: 'Tuition was $1,400. At forty-seven, you sat in the same class as twenty-year-olds. After class, they came to ask you questions.',
          fail: { fx: (g) => { spend(g, 10000); g.stat('心情', -3); g.remember('ai47', 'hold'); }, res: 'You sat through a few lessons, couldn’t keep up, and went back to holding down your old job.', dev: 3 } },
        { t: 'Quit and retire early', dev: 20, cond: (g) => owe(g) <= 20 && cash(g) + invested(g) >= 200000, fx: (g) => { CN.setJob(g, 'freelance', 'Retired early, takes odd jobs now and then'); g.stat('事业', -10); g.stat('心情', 4); g.remember('ai47', 'out'); }, res: 'You handed in your work badge. The next morning you didn’t know what to do, so you wandered through the vegetable market.' },
      ] },
    { id: 'm_47_land', age: 47, t: 'The Land', cond: (g) => job(g) === 'farmer' || (job(g) === 'none' && g.recall('hukou') === 'rural'),
      text: 'A cooperative has come to the village to join everyone’s plots into one big field and use drones to sow and harvest. If you lease out your land, they pay $115 per mu (about a sixth of an acre) a year.',
      choices: [
        { t: 'Lease out the land and collect rent', canon: true, fx: (g) => { CN.earn(g, 8000); g.stat('健康', 2); g.remember('land', 'rent'); }, res: 'Your family’s ten mu of land brought a first-year rent of $1,100 onto your card. In autumn, you stood at the edge of the field watching machines harvest the wheat.' },
        { t: 'Contract a big stretch yourself', dev: 20, check: ['事业', 30],
          fx: (g) => { borrow(g, 15); g.stat('事业', 10); CN.setJob(g, 'farmer', 'Large-scale grain farmer'); g.remember('land', 'big'); }, res: 'You took out a $21,000 loan for drones and learned to read soil data on your phone. The villagers call you the “big operator.”',
          fail: { fx: (g) => { borrow(g, 15); g.stat('心情', -4); g.remember('land', 'rent'); }, res: 'The first year hit a drought, and you lost money. The loan was still owed, and you leased the land out again.', dev: 5 } },
        { t: 'Go to the city and help your family', dev: 15, fx: (g) => { CN.goCity(g, 3); g.remember('land', 'city'); g.stat('人缘', 2); }, res: (g) => 'You locked the courtyard gate and went to ' + g.recall('workCity') + '. The buildings in the city were so tall that for days you couldn’t find your way home.' },
      ] },
    { id: 'm_48_check_echo', age: 48, t: 'Follow-Up', auto: true, loc: 'hospital', cond: (g) => !!g.recall('check45'),
      fx: (g) => { const c = g.recall('check45'); if (c === 'change') g.stat('健康', 3); if (c === 'ignore') g.stat('健康', -5); },
      text: (g) => ({
        pills: 'The follow-up results were no better and no worse. The doctor said to take your pills on time and not stay up late.',
        change: 'At the follow-up, the doctor flipped through your report from three years ago and said you have done things right these years.',
        ignore: 'You skipped last year’s follow-up and blacked out once this year. The doctor looked at your scan, and the expression was not a good one.',
      }[g.recall('check45')]) },
    { id: 'm_49_ai_echo', age: 49, t: 'Forty-Nine', auto: true, cond: (g) => !!(g.recall('ai47') || g.recall('land')),
      fx: (g) => { if (g.recall('ai47') === 'learn') g.stat('事业', 3); if (g.recall('land') === 'big') g.stat('事业', 4); },
      text: (g) => {
        const a = g.recall('ai47');
        if (a === 'learn') return 'The new things you learned are paying off. When young people hit a hard problem, they say, “Ask Old ' + CN.surOf(JY.byId[g.me].name) + '.”';
        if (a === 'out') return 'After retiring early, you learned to cook, you learned to nap, and you learned not to panic while other people are at work.';
        if (a === 'hold') return 'You are still in your old post. Of the people who joined at the same time as you, only two remain.';
        const l = g.recall('land');
        if (l === 'big') return 'The land you contracted had a bumper harvest this year. The buyers’ trucks lined up through half the village.';
        if (l === 'city') return 'After two years in the city, you secretly planted a few scallions in the empty lot downstairs, and the property management dug them up.';
        return 'The land rent lands on your card on time every year. With time on your hands, you started bringing water to the people fixing the village road.';
      } },

    /* ================= 50–64 岁 ================= */
    { id: 'm_51_parents', age: 51, t: 'A Few Years of Caring', cond: (g) => parentAlive(g) && !!g.recall('parentsCare'),
      text: (g) => {
        const p = g.recall('parentsCare'), w = paWord(g);
        return (p === 'self' && withPa(g) ? w + ' lived with you for a few years. Your back has gotten bad, and you can’t sleep through the night. '
          : p === 'nursing' ? w + ' lived in the care home for a few years. Every time you left, ' + paThey(g) + ' walked you to the door. '
          : p === 'sibling' ? 'Your siblings looked after ' + w + ' these past few years and recently said on the phone that they were struggling to cope. '
          : 'You looked after things from a thousand miles away for a few years. On every video call, ' + w + ' said everything was fine, but you were never at ease after hanging up. ') + 'Should you try a different approach?';
      },
      choices: [
        { t: 'Carry on as it is', canon: true, fx: (g) => { g.remember('care51', 'same'); g.stat('心情', -1); }, res: 'You gritted your teeth and said to hold on a little longer.' },
        { t: 'Send them to a care home', dev: 10, cond: (g) => g.recall('parentsCare') !== 'nursing',
          fx: (g) => { A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.remember('care51', 'changed'); g.stat('健康', 3); },
          res: () => 'You picked a nearby one, at ' + fmt(A) + ' a year. On the day you signed the contract, you sat in the car for a long time before driving off.' },
        { t: 'Bring them home to live with you', dev: 10, cond: (g) => g.recall('parentsCare') !== 'self' && !withPa(g),
          fx: (g) => { CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.remember('care51', 'changed'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => 'You got ' + paWord(g) + ' moved back into your home. At the first meal, ' + (pAlive(g, 'mo') ? 'your mother insisted on cooking.' : 'your father insisted on stir-frying you a couple of dishes.') },
        { t: 'Hire a caregiver to help out', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('paAide', true); g.remember('care51', 'aide'); g.stat('健康', 2); },
          res: () => 'The home caregiver costs ' + fmt(A) + ' a year. In her first week, you slept through the night a few times.' },
      ] },
    { id: 'm_52_care_echo', age: 52, t: 'Mom and Dad', auto: true, cond: (g) => !!g.recall('parentsCare') && parentAlive(g),
      fx: (g) => {
        const p = g.recall('parentsCare');
        A = 0;
        if (p === 'self') g.stat('健康', -2);
        if (p === 'far') g.stat('心情', -2);
        if (p === 'nursing') { A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); }
        else if (p === 'self' && g.recall('paAide') && withPa(g)) { A = AIDE[tier(g)] || 60000; spend(g, A); }
      },
      text: (g) => {
        const p = g.recall('parentsCare'), w = paWord(g), n = parents(g).filter((id) => CN.livesWith(g, id)).length;
        const pre = g.recall('care51') === 'changed' ? 'After the change, things were different. ' : '';
        if (p === 'self' && n) return pre + 'Living with ' + w + ', the dining table gained ' + (n > 1 ? 'two more pairs of' : 'one more pair of') + ' chopsticks, and a few more squabbles. When you got up at night to check the blankets, you thought about how, when you were small, ' + paThey(g) + ' used to tuck you in. Now ' + paThey(g) + ' had to be tucked in. ' + (A ? 'The caregiver cost another ' + fmt(A) + '. ' : '');
        if (p === 'nursing') return pre + 'The care home cost another ' + fmt(A) + '. The staff got to know you and would tell you about ' + w + '’s days one thing at a time. ' + w + ' gradually made new friends as well.';
        if (p === 'sibling') return 'Your siblings called to say ' + w + ' missed you. You said you’d definitely go back next month, and this time you really did.';
        return 'On the camera, ' + w + ' waved at the lens. ' + paThey(g) + ' knew you were watching.';
      } },
    { id: 'm_53_money', age: 53, t: 'Your Savings', loc: 'home', cond: (g) => cash(g) >= 150000,
      text: (g) => 'After all these years you have finally saved something, and your card holds ' + fmt(cash(g)) + (invested(g) > 0 ? ', and your investments are worth ' + fmt(invested(g)) : '') + '. Retirement is about ten years off, and you thought for a long time about how to use it.',
      choices: [
        { t: 'Save it for retirement', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.stat('心情', 2); g.remember('nest', 'save'); }, res: () => 'You split ' + fmt(A) + ' into several portions and put it in fixed deposits and government bonds.' },
        { t: 'Put some into funds', dev: 10, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'fund'); g.remember('nest', 'fund'); }, res: () => 'You bought ' + fmt(A) + ' in funds, promising yourself not to touch them for ten years.' },
        { t: 'Invest in a project a friend is pitching', dev: 15, check: ['学识', 50],
          fx: (g) => { A = w1(cash(g) * 0.3); CN.earn(g, A * 0.6); g.remember('nest', 'invest'); }, res: () => 'You invested ' + fmt(A) + ', and for once you read it right. Two years later the payout was sixty percent more than your principal.',
          fail: { fx: (g) => { A = w1(cash(g) * 0.3); spend(g, A); g.stat('心情', -5); g.remember('nest', 'lost'); }, res: () => 'You invested ' + fmt(A) + '. A “sure win” project, and the boss ran off. You spent half a year in the group chat for victims seeking their money back.', dev: 5 } },
        { t: 'Pay your child’s down payment', dev: 10, cond: (g) => hasKid(g) && kAge(g) >= 22 && g.recall('kidWed') !== 'paid',
          fx: (g) => { A = w1(Math.min(cash(g) * 0.5, CN.price(g, kidTier(g)) * 0.3e4)); spend(g, A); g.stat('人缘', 4); g.remember('nest', 'kid'); }, res: (g) => 'You transferred ' + fmt(A) + '. ' + kn(g) + ' took the card without a word and hugged you.' },
      ] },
    { id: 'm_54_nest_echo', age: 54, t: 'Money', auto: true, cond: (g) => !!g.recall('nest'),
      text: (g) => ({
        save: 'The money in fixed deposits has grown slowly and now stands at ' + fmt(invested(g)) + '. You did the math, and it is probably enough.',
        fund: 'The funds go up and down, and the account now holds ' + fmt(invested(g)) + '. You learned not to check every day.',
        invest: 'After making that one profit, you stopped. When friends came to pull you in again, you turned them all down.',
        lost: 'The money was never recovered. Afterward you told everyone: “Never believe in a sure win.” Fortunately, life at home was not badly affected.',
        kid: 'Your child moved into the new home and kept a room for you. You stayed two days and wanted to go back to your own place.',
      }[g.recall('nest')]) },
    { id: 'm_55_ill', age: 55, t: 'Illness', loc: 'hospital', cond: (g) => g.s('健康') < 45,
      text: (g) => 'At one examination, the doctor asked for a family member to come in alone. ' + (g.recall('check45') === 'ignore' ? 'You thought again about that report ten years ago that you brushed off. ' : '') + 'It was a condition that needed surgery. After insurance, you would have to pay about ' + fmt(g.recall('hukou') === 'rural' ? 60000 : 90000) + '. ',
      choices: [
        { t: 'Have surgery at a big hospital', canon: true, check: ['健康', 0], // 健康 15 以上成功率 95%
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; M = spend(g, A); g.stat('健康', 15); g.remember('ill55', 'surgery'); },
          res: (g) => 'The surgery took seven hours and cost ' + fmt(A) + (M ? ', and you borrowed ' + fmt(M) : '') + '. When you woke up, ' + (CN.alone(g) ? 'friends were keeping watch at your bedside.' : 'your family was all there.'),
          fail: { fx: (g) => { g.die('Did not wake up after the surgery'); }, res: 'The surgery did not succeed.', dev: 0 } },
        { t: 'Conservative treatment, no surgery', dev: 15, fx: (g) => { spend(g, 20000); g.stat('健康', -5); g.stat('心情', 2); g.remember('ill55', 'conservative'); }, res: 'You chose medication and rest, at $2,900 a year in drugs. The doctor said there was a way to live like this, too.' },
        { t: 'Hide it from your child and shoulder it alone', dev: 15, cond: (g) => hasKid(g) && kAge(g) >= 16,
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; spend(g, A); g.stat('心情', -5); g.stat('健康', 12); g.remember('ill55', 'hide'); },
          res: 'You said you were away on business for a few days, checked into the hospital alone and paid the surgery fees with your own card. When the nurse asked where your family was, you said they were on their way.' },
      ] },
    { id: 'm_55_hobby', age: 55, t: 'A Second Spring', cond: (g) => g.s('健康') >= 45,
      text: (g) => (hasKid(g) && kAge(g) >= 16 ? 'Your child is grown. ' : '') + 'You don’t have to push so hard at work anymore. People tell you to find something you like.',
      choices: [
        { t: 'Carry on, commuting to work and back', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('hobby55', 'none'); }, res: 'You said you would deal with it after retirement.' },
        { t: 'Take up photography, calligraphy and the like', dev: 10, fx: (g) => { spend(g, 5000); g.stat('心情', 5); g.stat('学识', 2); g.remember('hobby55', 'art'); }, res: 'You spent $700 on a secondhand camera. On weekends you take the bus out to the suburbs to photograph birds.' },
        { t: 'Start a small business with an old classmate', dev: 15, check: ['人缘', 50],
          fx: (g) => { M = spend(g, 80000); g.remember('hobby55', 'biz'); }, res: 'You put in $11,000. You opened a farmhouse restaurant (a “nongjiale,” a countryside guesthouse) in your classmate’s home village, and there are plenty of weekend guests.',
          fail: { fx: (g) => { spend(g, 50000); g.stat('人缘', -3); g.remember('hobby55', 'none'); }, res: 'The partnership fell apart in under two months. You lost $7,100, and you two barely keep in touch.', dev: 3 } },
      ] },
    { id: 'm_57_echo', age: 57, t: 'These Two Years', auto: true, cond: (g) => !!(g.recall('ill55') || g.recall('hobby55')),
      fx: (g) => { A = 0; if (g.recall('hobby55') === 'art') g.stat('心情', 3); if (g.recall('ill55') === 'hide') g.stat('人缘', -2); if (g.recall('hobby55') === 'biz') { A = 60000; CN.earn(g, A); } },
      text: (g) => {
        const i = g.recall('ill55');
        if (i === 'surgery') return 'It has been two years since the surgery, and every follow-up has been normal. You have learned to eat slowly and walk slowly.';
        if (i === 'conservative') return 'In these two years of conservative treatment, the illness neither got better nor worse. You have learned to live alongside it.';
        if (i === 'hide') return 'Your child found out anyway. ' + kn(g) + ' said through tears on the phone, “What gives you the right to carry this alone?” After that, ' + kHe(g) + ' called every week.';
        const h = g.recall('hobby55');
        if (h === 'art') return 'The community picked your photos for a small exhibition. You stood in front of your own pictures, pretending to be passing by.';
        if (h === 'biz') return 'The farmhouse restaurant has paid you ' + fmt(A) + ' over these two years. Your old classmate says that when they can’t keep going, they’ll hand it over to the young.';
        return 'Life is the same as ever, one step after another.';
      } },
    { id: 'm_58_work', age: 58, t: 'The Last Few Years', cond: (g) => !['none', 'retired'].includes(job(g)),
      text: 'Retirement is a few years away. The young people all think you should rest, and you think so too, but not entirely.',
      choices: [
        { t: 'Hang on until retirement', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('end58', 'stay'); }, res: 'You handed over your work piece by piece and taught two young people.' },
        { t: 'Switch to something lighter', dev: 10, fx: (g) => { g.stat('健康', 3); g.stat('事业', -6); g.remember('end58', 'easy'); }, res: 'You were moved to a less busy post, with a bit less pay. When you left work, it was still light out.' },
        { t: 'Push one more time', dev: 15, check: ['健康', 50],
          fx: (g) => { g.stat('事业', 8); CN.earn(g, w1(myInc(g) * 0.3)); g.remember('end58', 'push'); }, res: 'You took on a big project and got an extra bonus at year-end. The day it succeeded, you said it was your last all-nighter.',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('end58', 'easy'); }, res: 'Halfway through the project, you ended up in the hospital. After you were discharged, you stopped competing for anything.', dev: 5 } },
      ] },
    { id: 'm_58_home', age: 58, t: 'Family Matters', cond: (g) => ['none', 'retired'].includes(job(g)),
      text: 'Everything big and small in the family now comes to you for a decision.',
      choices: [
        { t: 'Keep running the household as before', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('end58', 'family'); }, res: 'Your phone stores the whole family’s checkup dates, birthdays and insurance card numbers.' },
        { t: 'Let go and take it easy', dev: 10, fx: (g) => { spend(g, 8000); g.stat('心情', 4); g.remember('end58', 'free'); }, res: 'You signed up for a $1,100 tour group and, for the first time, traveled far on your own.' },
      ] },
    { id: 'm_59_end_echo', age: 59, t: 'Fifty-Nine', auto: true, cond: (g) => !!g.recall('end58'),
      text: (g) => ({
        stay: 'At work, people have started calling you “Old” something. Of the two young people you trained, one can already take over your post.',
        easy: 'In your easier post you started learning to brew tea. The office plants are yours to look after.',
        push: 'That project put your name on the map in the industry. But you say what you are proudest of is not missing a single family dinner in those two years.',
        family: 'Your family says that with you around, the home can’t fall apart.',
        free: 'After that first long trip, you went twice more. You say that only now, this late in life, have you found out how much you like looking at the sea.',
      }[g.recall('end58')]) },
    { id: 'm_60_plan', age: 60, t: 'Where to Live Later', loc: 'home',
      text: (g) => 'You are sixty. Retirement is five years away, and you have begun to think about where to spend the later years. ' + (hasKid(g) && g.recall('kidCity') ? kn(g) + ' in ' + g.recall('kidCity') + '. ' : '') + (hv(g) ? 'Your home is now worth ' + fmt(hv(g) * 1e4) + '. ' : ''),
      choices: [
        { t: 'Stay where you live now', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('plan60', 'stay'); }, res: 'You know every vegetable stall here.' },
        { t: 'Go back to your hometown and fix up the old house', dev: 15, cond: (g) => !atHome(g) && !['sold', 'gave'].includes(g.recall('oldHouse')),
          fx: (g) => {
            A = 100000; spend(g, A);
            if (!hv(g)) settleOld(g, oldVal(g));
            backHome(g); g.remember('house', 'hometown');
            if (parentAlive(g)) CN.liveWith(g, parents(g));
            g.stat('心情', 4); g.remember('plan60', 'home');
          },
          res: (g) => 'You spent ' + fmt(A) + ', had the roof repaired and built a grape trellis in the yard. ' + (parentAlive(g) ? paWord(g) + ' sat under the grape trellis every day.' : '') },
        { t: 'Move to your child’s city', dev: 10, cond: (g) => hasKid(g) && !!g.recall('kidCity') && g.recall('kidCity') !== 'abroad' && g.recall('kidCity') !== where(g),
          fx: (g) => {
            const t = kidTier(g), p = Math.round(CN.price(g, t) * 0.5);
            M = '';
            if (hv(g) && cash(g) + (hv(g) - owe(g)) * 1e4 >= p * 1e4) { CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); M = 'buy'; }
            CN.goCity(g, t, g.recall('kidCity'));
            g.stat('人缘', 3); g.remember('plan60', 'kid');
          },
          res: (g) => (M === 'buy' ? 'You sold the old house and, in ' + g.recall('kidCity') + ', bought a small two-bedroom, fifteen minutes’ walk from your child.' : 'In ' + g.recall('kidCity') + ', you rented a place near your child, fifteen minutes on foot.') },
        { t: 'Move to a smaller place for more breathing room', dev: 10, cond: (g) => house(g) === 'own' && hv(g) >= 40,
          fx: (g) => { const p = Math.round(hv(g) * 0.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); A = p * 1e4; g.remember('plan60', 'down'); },
          res: () => 'The big place was sold and a small one bought, and the difference of ' + fmt(A) + ' was put into savings. It is on a low floor with an elevator, so you needn’t worry if your legs go later.' },
        { t: 'After retirement, spend winters in the south', dev: 10, cond: (g) => !(house(g) === 'own' && hv(g) >= 40),
          fx: (g) => { g.stat('心情', 3); g.remember('plan60', 'south'); }, res: 'On your phone you looked at the rents in several seaside towns, bookmarking one after another.' },
      ] },
    { id: 'm_61_plan_echo', age: 61, t: 'A New Chapter', auto: true, cond: (g) => !!g.recall('plan60'),
      text: (g) => ({
        stay: 'You spent another year in the same place. The security guard downstairs changed, and the new one already knows you.',
        home: 'In your first year back home, you recognized the tree you climbed as a child. It is shorter than you remember.',
        kid: 'You visit your child’s home twice a week with a pot of soup. Your child says, don’t bring it anymore, then says, bring more next time.',
        down: 'The small place is easy to keep tidy. With the extra money, you signed up for a preparatory class at the senior university.',
        south: 'In winter you spent a month in the south, in a rental where you opened the window to the sea. You came back a shade darker.',
      }[g.recall('plan60')]) },
    { id: 'm_63_sib', age: 63, t: 'Your Siblings', cond: (g) => sibs(g),
      text: (g) => 'One of your siblings calls to say they are ill and treatment will cost ' + fmt(w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000))) + ', and asks whether you can help.',
      choices: [
        { t: 'Lend the money', canon: true, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000)); spend(g, A); g.stat('人缘', 5); g.remember('sibLoan', 'yes'); }, res: () => 'You transferred ' + fmt(A) + ', saying there was no need to pay it back. On the other end of the phone, they cried.' },
        { t: 'Help find a hospital and lend half', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000) / 2); spend(g, A); g.stat('人缘', 2); g.remember('sibLoan', 'help'); }, res: () => 'You asked around and got them an appointment at a big hospital, and transferred ' + fmt(A) + '. They said they’d find a way for the other half.' },
        { t: 'Refuse', dev: 15, fx: (g) => { g.stat('人缘', -6); g.remember('sibLoan', 'no'); }, res: 'You said things were hard for you too. After hanging up, you stood on the balcony for a long time.' },
      ] },
    { id: 'm_63_only', age: 63, t: 'An Only Child’s Old Age', cond: (g) => !sibs(g),
      text: 'You have no siblings. You need to plan for the future yourself, and early.',
      choices: [
        { t: 'Leave it to your child', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 2); g.remember('selfCare', 'kid'); }, res: 'You told your child where the bankbook is and what the password is.' },
        { t: 'Buy yourself a retirement insurance plan', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.2, 30000), 300000)); spend(g, A); g.remember('selfCare', 'insure'); }, res: () => 'You paid the premium in one lump sum of ' + fmt(A) + '. The contract was thick, and you read it page by page.' },
        { t: 'Agree with old friends to look after each other', dev: 15, fx: (g) => { g.stat('人缘', 4); g.remember('selfCare', 'friends'); }, res: 'A few old friends made a group chat called the “Elder Care Mutual Aid Group.” Every morning, someone in the group has to say good morning.' },
      ] },
    { id: 'm_64_eve', age: 64, t: 'The Year Before Retirement', auto: true,
      fx: (g) => {
        if (g.recall('sibLoan') === 'yes' || g.recall('selfCare') === 'friends') g.stat('心情', 2);
        if (owe(g) > 0) g.stat('心情', -2);
      },
      text: (g) => {
        const bits = [];
        const s = g.recall('sibLoan');
        if (s === 'yes') bits.push('Your sibling recovered, and at New Year they came to see you with two chickens in hand. ');
        if (s === 'no') bits.push('Since you refused to lend money, few people reply to your messages in the siblings’ group chat. At New Year, you still sent them gifts. ');
        if (s === 'help') bits.push('Your sibling’s illness was cured. They paid back the loan little by little. ');
        const c = g.recall('selfCare');
        if (c === 'friends') bits.push('In the “mutual aid group” chat, someone says good morning every morning. ');
        if (c === 'insure') bits.push('You locked the insurance papers in a drawer. ');
        if (owe(g) > 0) bits.push('You still owe ' + fmt(owe(g) * 1e4) + ', and plan to pay it off slowly once your pension starts. ');
        else bits.push('All your debts are paid off' + (cash(g) + invested(g) > 0 ? ', and you are sitting on ' + fmt(cash(g) + invested(g)) : '') + '. You circled next year’s retirement day on the calendar. ');
        return bits.join('');
      } },
  ];

  /* ---------- 升职、自己干、当顾问：用到的数和称呼 ----------
   * 都写成下面的意外（排在最后，这一年没有别的事才轮到），一世里各只发生一次。
   * 工资用 youth.js 挂在 CN 上的 CN.jobPay / CN.jobLine（和 economy.js 的收入表一致）。 */
  const EMP = ['office', 'tech', 'sales', 'civil', 'teacher', 'doctor', 'nurse', 'worker', 'rider', 'driver', 'soldier'];
  const hiEdu = (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu'));
  const title = (g) => JY.engine.get().L.info['职业'] || JOBT[job(g)] || '';
  // 每一世不同、同一年里固定的随机数（yearRoll 只看年份，所有人同一年出生，各世会一样）
  const lifeSeed = (g) => { const c = JY.byId[g.me]; const t = ((c && c.name) || '') + (g.recall('city') || ''); let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 1000003; return h; };
  const lifeRoll = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + lifeSeed(g) * 0.0137) * 43758.5453; return x - Math.floor(x); };
  const pk = (g, arr, salt) => arr[Math.floor(lifeRoll(g, salt) * arr.length)];
  const mPay = (g, j, t, plus) => (CN.jobPay ? CN.jobPay(g, j, t, plus) : k1(myInc(g) / 12));
  const POST40 = { tech: 'Technical Director', office: 'Department Manager', sales: 'Regional Manager', civil: 'Section Chief', teacher: 'Dean of Studies', doctor: 'Deputy Department Head', nurse: 'Head Nurse of the Department', worker: 'Workshop Director', driver: 'Fleet Captain', rider: 'Station Manager', soldier: 'Battalion-Level Officer' };
  const EXPERT40 = { tech: 'Chief Engineer', doctor: 'Associate Chief Physician', teacher: 'Senior Teacher', nurse: 'Associate Chief Nurse', worker: 'Master Technician', office: 'Business Expert' };
  const TOP50 = { tech: 'Company Vice President', office: 'Branch General Manager', sales: 'Sales Vice President', civil: 'Deputy Division Chief', teacher: 'Vice Principal', doctor: 'Department Head', nurse: 'Director of Nursing', worker: 'Assistant Plant Manager', driver: 'Transport Manager', rider: 'Area Manager', soldier: 'Regiment-Level Officer' };
  const FR = { 1: 400000, 2: 300000, 3: 200000, 4: 150000, 5: 100000 };
  const frKind = (g) => pk(g, ['convenience store', 'fast-food shop', 'pharmacy', 'laundromat', 'bakery'], 31);
  const coopCrop = (g) => pk(g, { 西南: ['kiwifruit', 'tea', 'Sichuan pepper'], 华南: ['lychees', 'passion fruit', 'tea'], 华东: ['strawberries', 'tea', 'blueberries'], 华中: ['crayfish', 'navel oranges', 'lotus root'], 华北: ['apples', 'millet', 'greenhouse vegetables'], 东北: ['rice', 'wood ear mushrooms', 'blueberries'], 西北: ['apples', 'goji berries', 'beef and lamb'] }[g.recall('region')] || ['greenhouse vegetables', 'fruit'], 32);
  const onlineItem = (g) => pk(g, ['local specialties from your hometown', 'handicrafts you make yourself', 'tools and parts from your old line of work', 'clothing for middle-aged and older people'], 33);
  // 能叫来帮忙的家里人：兄弟姐妹、成年的孩子、配偶
  const helperM = (g) => ['sib0', 'sib1'].find((id) => pAlive(g, id) && g.ageOf(id) < 65) || (hasKid(g) && kAge(g) >= 20 ? 'k1' : married(g) ? 'sp' : '');
  const helpWho = (g, id) => CN.who(g, id).replace(/^你的/, '');

  /* ---------- 孩子、父母、配偶、行情：按他们的年纪或运气发生，用意外的形式（一世只发生一次） ----------
   * 抉择类的意外写 ok（基础条件），下面统一包成 cond：这一年没有中年的固定抉择，排在前面的意外也没轮上，才轮到它。 */
  const ENCS = [
    { id: 'e_m_parent_ill', y: [2026, 2200], minAge: 35, maxAge: 58, t: 'Your Parents Fall Ill', loc: 'hospital', always: true,
      ok: (g) => g.age <= 58 && parentAlive(g) && parentOld(g) >= 70 && !g.recall('parentsCare'),
      text: (g) => {
        const o = older(g);
        const bill = k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(o) * 300);
        return CN.who(g, o, true) + ' was hospitalized, and after insurance you paid out of pocket ' + fmt(bill) + '. After discharge, the doctor said someone had to be at their side at all times. '
          + (withPa(g) ? paThey(g) + ' already lived with you, but you work during the day.' : '');
      },
      choices: [
        { t: 'Bring them to live with you and care for them yourself', canon: true, cond: (g) => !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: 'You cleared out the study and installed handrails and a night light.' },
        { t: 'Take on more of the care yourself', canon: true, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => 'You got ' + paWord(g) + '’s room moved into the south-facing one, with handrails and a night light installed. After work you no longer stayed late.' },
        { t: 'Hire a caregiver to come to the home', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('parentsCare', 'self'); g.remember('paAide', true); },
          res: () => 'The home caregiver costs ' + fmt(A) + ' a year. The meals she cooked were a bit salty, and the family gradually got used to them.' },
        { t: 'Leave the care to your siblings and pay for it', dev: 10, cond: (g) => sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); spend(g, 24000); g.remember('parentsCare', 'sibling'); },
          res: 'You send $290 home every month and go back for the holidays.' },
        { t: 'Hire someone to look after them back in your hometown', dev: 10, cond: (g) => !sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[Math.max(4, tier(g))] || 40000; spend(g, A); g.remember('parentsCare', 'far'); },
          res: (g) => 'You hired a helper back in your hometown at ' + fmt(A) + ' a year, and installed a camera in the living room. Every night, you open the feed to look in on ' + paWord(g) + '. ' },
        { t: 'Send them to a care home', dev: 15,
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.stat('心情', -3); },
          res: (g) => 'You picked a nearby one, at ' + fmt(A) + ' a year. When you left, ' + paWord(g) + ' stood at the door to see you off, just as they once saw you off to school.' },
      ] },
    { id: 'e_m_sp_ill', y: [2026, 2200], minAge: 50, maxAge: 64, t: 'Your Spouse Falls Ill', loc: 'hospital', always: true,
      ok: (g) => g.age >= 50 && married(g) && !g.recall('spSick') && yearRoll(g, 7) < 0.05,
      text: (g) => CN.who(g, 'sp', true) + ' was diagnosed with a serious illness. The doctor said it can be treated, but it costs money and manpower.',
      choices: [
        { t: 'Spend everything on treatment', canon: true, fx: (g) => { A = w1(Math.max(100000, Math.min(cash(g) * 0.7, 400000))); M = spend(g, A); g.stat('健康', -3); g.remember('spSick', 'all'); },
          res: () => 'You went to every hospital you could, and in all spent ' + fmt(A) + (M ? ', and you borrowed ' + fmt(M) : '') + '. ' },
        { t: 'Keep working while caring for them', dev: 10, fx: (g) => { A = 80000; spend(g, A); g.stat('健康', -5); g.remember('spSick', 'both'); }, res: 'Out-of-pocket medical costs were $11,000. You worked by day and slept in a folding chair beside the hospital bed at night.' },
        { t: 'Hire caregivers and a companion robot', dev: 15, cond: (g) => cash(g) >= 150000, fx: (g) => { A = 150000; spend(g, A); g.remember('spSick', 'paid'); }, res: 'Treatment plus caregivers came to $21,000 in all. Every day after work you sat two hours at the hospital, keeping them company.' },
      ] },
    { id: 'e_m_pa_bill', y: [2026, 2200], minAge: 45, maxAge: 64, t: 'A New Treatment', loc: 'hospital', always: true,
      ok: (g) => g.age >= 45 && parentAlive(g) && parentOld(g) >= 76 && !!g.recall('parentsCare') && !g.recall('paBill') && yearRoll(g, 5) < 0.25,
      text: (g) => CN.who(g, older(g), true) + (yearRoll(g, 6) < 0.5 ? ' was found to have a heart problem' : ' took a fall and cracked a hip') + ', and was admitted to the hospital. The doctor said there is a new treatment that speeds recovery but isn’t covered by insurance. It costs ' + fmt(tier(g) <= 2 ? 200000 : 120000) + '. ',
      choices: [
        { t: 'Use the new treatment', canon: true, fx: (g) => { A = tier(g) <= 2 ? 200000 : 120000; M = spend(g, A); g.remember('paBill', 'best'); }, res: () => 'You signed and paid ' + fmt(A) + (M ? ', of which ' + fmt(M) + ' was borrowed' : '') + '. ' },
        { t: 'Go with the insurance-covered plan', dev: 10, fx: (g) => { A = k1((tier(g) <= 2 ? 200000 : 120000) * 0.15); spend(g, A); g.remember('paBill', 'basic'); }, res: () => 'The out-of-pocket part was ' + fmt(A) + '. The doctor said this could keep it under control, just with slower recovery.' },
        { t: 'Split it with your siblings', dev: 10, cond: (g) => sibs(g),
          fx: (g) => { A = w1((tier(g) <= 2 ? 200000 : 120000) / ((g.recall('sibs') || 0) + 1)); spend(g, A); g.remember('paBill', 'split'); }, res: () => 'Your siblings worked out the split in the group chat: ' + fmt(A) + ' each. The new treatment was used.' },
      ] },
    { id: 'e_m_kid_school', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Starting School', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 6 && kAge(g) <= 9 && !g.recall('kidSchool'),
      text: (g) => kWho(g) + ' is ready for primary school. ' + (tier(g) <= 3 ? 'The school near your home is mediocre, and an old flat beside a good school costs ' + fmt(CN.price(g) * 1.3e4) + '. ' : (tier(g) === 5 ? 'The village school has been merged into the town school, and ' : 'Among the county’s primary schools, ') + 'the better one is hard to get into without connections.'),
      choices: [
        { t: 'Go to the nearby public school', canon: true, fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', 1); }, res: 'On the first day of school, you stood at the school gate and watched that little backpack disappear into the crowd.' },
        { t: 'Sell your home and buy in a school district', dev: 15, cond: (g) => tier(g) <= 3 && ['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => 'An old, run-down, tiny flat of fifty square meters, half the size of your old home, with the mortgage starting over from scratch' + (B ? ', and you borrowed another ' + fmt(B) : '') + '. Your hand shook a little as you signed.' },
        { t: 'Grit your teeth and buy in a school district', dev: 15, cond: (g) => tier(g) <= 3 && ['none', 'rent'].includes(house(g)) && cash(g) >= CN.price(g) * 1.3 * 0.25e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); A = p * 0.3e4; CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => 'An old, run-down, tiny flat of forty square meters, with a down payment of ' + fmt(A) + (B ? ', and you borrowed ' + fmt(B) : '') + '. Your hand shook a little as you signed.' },
        { t: 'Use connections to get into a better school', dev: 10, check: ['人缘', 55],
          fx: (g) => { spend(g, 20000); g.remember('kidSchool', 'good'); }, res: 'You treated people to three meals and paid a $2,900 “sponsorship fee.” On the first day of school you looked at the school’s sign and let out a breath of relief.',
          fail: { fx: (g) => { spend(g, 5000); g.remember('kidSchool', 'public'); g.stat('心情', -2); }, res: 'The person you asked couldn’t make it happen, and the meals cost $700. Your child ended up at the school near home anyway.', dev: 0 } },
        { t: 'Send your child back home to be raised by the grandparents', dev: 15, cond: (g) => tier(g) <= 3 && !atHome(g) && parentAlive(g) && !withPa(g) && !(['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g))),
          fx: (g) => { g.remember('kidSchool', 'left'); g.stat('心情', -5); }, res: (g) => 'The day you sent ' + kn(g) + ' away, ' + kHe(g) + ' didn’t cry at all. Only after the car had driven far off did you cry.' },
      ] },
    { id: 'e_m_kid_move', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Moving to the City for School', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 9 && kAge(g) <= 13 && tier(g) >= 4 && !g.recall('kidMove') && g.recall('kidSchool') !== 'left',
      text: (g) => kWho(g) + ' is doing well in school. The ' + (tier(g) === 5 ? 'town' : 'county') + ' middle school is so-so. For the good middle schools in the city, you need either a home or a local hukou (household registration). A small flat in the city costs ' + fmt(Math.round(CN.price(g, 3) * 0.7) * 1e4) + '. ',
      choices: [
        { t: 'Keep your child in the local school', canon: true, fx: (g) => { g.remember('kidMove', 'stay'); }, res: 'You said a good kid can learn anywhere. You bought your child a new desk.' },
        { t: 'Buy a small flat in the city and move the family there', dev: 20, cond: (g) => cash(g) >= Math.round(CN.price(g, 3) * 0.7) * 0.3e4 && canLoan(g, CN.price(g, 3) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g, 3) * 0.7); A = p * 0.3e4; CN.goCity(g, 3); B = addHouse(g, p, 0.3); g.remember('kidMove', 'buy'); },
          res: (g) => 'The down payment was ' + fmt(A) + (B ? ', and you borrowed ' + fmt(B) : '') + '. You moved to ' + g.recall('workCity') + ', and you found new work near the new home.' },
        { t: 'Rent a place near the school and accompany your child', dev: 15,
          fx: (g) => { A = 18000 * 3; if (['own', 'mortgage', 'hometown'].includes(house(g))) spend(g, A); else A = 0; CN.goCity(g, 3); g.remember('kidMove', 'rent'); },
          res: (g) => 'You rented a room next to the school' + (A ? ', with three years of rent at ' + fmt(A) : '') + '. Every morning you got up at 5:30 to cook, and you came to know ' + where(g) + '’s morning market better than the locals do.' },
        { t: 'Send them to a boarding school in the city', dev: 10, fx: (g) => { A = 20000 * 3; spend(g, A); g.remember('kidMove', 'board'); }, res: () => 'Three years of boarding and meal fees came to ' + fmt(A) + '. Every Friday evening, you went to the station to bring your child home.' },
      ] },
    { id: 'e_m_kid_push', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Tutoring Classes', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 10 && kAge(g) <= 13 && !g.recall('kidPush'),
      text: (g) => 'The parents’ group chat posts tutoring class schedules every day, and a year of classes costs at least ' + fmt(TUTOR[tier(g)] || 25000) + '. ' + kn(g) + ' still plays downstairs on weekends.',
      choices: [
        { t: 'Sign up for a few classes', canon: true, fx: (g) => { const t = TUTOR[tier(g)] || 25000; M = cash(g) >= t * 3 ? 'three' : 'one'; A = M === 'three' ? t * 3 : t; spend(g, A); g.remember('kidPush', 'hard'); }, res: () => (M === 'three' ? 'The weekend schedule was packed. Over three years the classes cost ' + fmt(A) + '. ' : 'Money was tight, so you only signed up for math and English, at ' + fmt(A) + ' a year. On weekends you rode your e-bike back and forth between the two centers, dropping off and picking up your child.') },
        { t: 'Tutor your child yourself', dev: 10, check: ['学识', 50],
          fx: (g) => { g.remember('kidPush', 'self'); g.stat('人缘', 3); }, res: 'Every evening for an hour, you leaned over the same table. Your child said you explained things more clearly than the teacher.',
          fail: { fx: (g) => { A = (TUTOR[tier(g)] || 25000) * 2; spend(g, A); g.remember('kidPush', 'hard'); g.stat('心情', -3); }, res: () => 'You lost patience as you explained. In the end you signed up for classes anyway, and over two years they cost ' + fmt(A) + '. ', dev: 0 } },
        { t: 'Skip them and let your child play', dev: 15, fx: (g) => { g.remember('kidPush', 'easy'); g.stat('心情', 2); }, res: 'Your child played downstairs until dark, and you called from the balcony for dinner.' },
      ] },
    { id: 'e_m_kid_teen', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'The Teenage Years', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 14 && kAge(g) <= 17 && !g.recall('kidBond'),
      text: (g) => kWho(g) + (g.recall('kidMove') === 'board' ? ' comes home on weekends and shuts the bedroom door the moment they step in. ' : ' has started locking the bedroom door. ') + 'Grades have slipped, the phone never leaves their hand, and they say no more than three sentences to you.',
      choices: [
        { t: 'Be stricter', canon: true, fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -2); }, res: 'You took the phone. The door slammed loudly.' },
        { t: 'Find a chance to sit down and talk', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.remember('kidBond', 'close'); g.stat('人缘', 4); }, res: 'You sat at a late-night food stall for a long time. Your child told you things you had never known.',
          fail: { fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -3); }, res: 'The moment you opened your mouth, it was a lecture. Your child finished eating with head down and went back to their room.', dev: 0 } },
        { t: 'Let them be, they’ll grow out of it', dev: 10, fx: (g) => { g.remember('kidBond', 'loose'); }, res: 'You stopped asking. Sometimes you wonder whether you should ask.' },
      ] },
    { id: 'e_m_kid_gaokao', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Your Child’s Gaokao', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 18 && kAge(g) <= 20 && !g.recall('kidUni'),
      text: (g) => {
        // 文字每次渲染都会求值，分数只算一次
        if (!g.recall('kidScore')) g.remember('kidScore', kidResult(g));
        const r = g.recall('kidScore');
        return (kidAway(g) ? 'Your ex called: ' : '') + kn(g) + '’s gaokao (college entrance exam) score is out: ' + { top: 'good enough for a very good university. ', good: 'good enough for a decent four-year university. ', normal: 'enough for an ordinary school. ', none: 'a bit below the cutoff for a four-year university. ' }[r] + 'In the days of filling out the application choices, your light stayed on until midnight.';
      },
      choices: [
        { t: 'Let your child choose', canon: true, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'own'); g.stat('人缘', 2); }, res: 'Your child chose a major you had never heard of. You spent a whole night looking it up online.' },
        { t: 'Choose a safe option for your child', dev: 10, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'stable'); g.stat('人缘', -2); }, res: 'Teaching, medicine, the civil service exam: you made the call. Your child said nothing and pressed confirm.' },
        { t: 'Your child says they don’t want to study anymore and you go along', dev: 20, cond: (g) => g.recall('kidBond') === 'loose' || g.recall('kidScore') === 'none',
          fx: (g) => { g.remember('kidUni', 'none'); g.remember('kidPath', 'work'); }, res: 'Your child went off with a relative to learn a trade. On the day they left, they said you needn’t worry.' },
      ] },
    { id: 'e_m_kid_city', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Where Your Child Will Stay', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 22 && kAge(g) <= 26 && !g.recall('kidCity'),
      text: (g) => kn(g) + (g.recall('kidPath') === 'work' ? ' has finished learning a trade, ' : ' has graduated, ') + 'and calls to ask you: stay in the big city, or come back?',
      choices: [
        { t: 'Go try your luck in a big city', canon: true, fx: (g) => { g.remember('kidCity', g.recall('kidUni') === 'top' ? CN.pick(BIG) : CN.pick(['Hangzhou', 'Chengdu', 'Wuhan', 'Nanjing', 'Guangzhou', 'Xi\'an'])); g.stat('心情', -1); },
          res: (g) => kn(g) + ' went to ' + g.recall('kidCity') + '. You kept the room exactly as ' + kHe(g) + ' left it.' },
        { t: 'Persuade your child to come back', dev: 10, fx: (g) => { g.remember('kidCity', where(g)); g.stat('人缘', 3); }, res: 'Your child came back and found a job locally. They come home for dinner on weekends, smelling of a perfume you don’t recognize.' },
        { t: 'Study abroad for a master’s', dev: 20, cond: (g) => cash(g) >= 300000 || g.recall('kidUni') === 'top',
          fx: (g) => { A = 400000; M = spend(g, A); g.remember('kidCity', 'abroad'); g.stat('心情', -3); },
          res: () => 'Tuition and living costs came to ' + fmt(A) + (M ? ', and you borrowed ' + fmt(M) : '') + '. At the airport, your child passed security and turned back to wave. The time difference was eight hours.' },
      ] },
    { id: 'e_m_kid_wed', y: [2026, 2200], minAge: 40, maxAge: 64, t: 'Your Child Settles Down', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 27 && kAge(g) <= 34 && !g.recall('kidWed'),
      text: (g) => kWho(g) + ' brought someone home for dinner. After the meal, ' + kHe(g) + ' announced plans to marry. Money is the question: ' + (g.recall('kidCity') && g.recall('kidCity') !== 'abroad' ? ' in ' + g.recall('kidCity') + ', the down payment on a flat alone is ' + fmt(CN.price(g, kidTier(g)) * 0.3e4) + '. ' : 'housing, the banquet, everything costs money.'),
      choices: [
        { t: 'Use your savings to help with the down payment', canon: true, cond: (g) => cash(g) >= 100000,
          fx: (g) => { A = w1(Math.min(CN.price(g, kidTier(g)) * 0.3e4, cash(g) * 0.7)); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => 'You transferred ' + fmt(A) + '. At the wedding banquet you drank too much and talked the in-laws’ ears off about things from your youth.' },
        { t: 'Borrow money if you have to, and help', canon: true, cond: (g) => cash(g) < 100000,
          fx: (g) => { A = 100000; borrow(g, 10); CN.earn(g, A); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => 'You scraped together ' + fmt(A) + ' from relatives and pressed it into your child’s hands. At the banquet, you laughed louder than anyone.' },
        { t: 'Let them handle it, and give only a token', dev: 15, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.1, 20000), 100000)); spend(g, A); g.remember('kidWed', 'self'); },
          res: () => 'You put together a ' + fmt(A) + ' red envelope. The wedding was simple, at a small restaurant. When the couple raised their glasses, their smiles were genuine.' },
        { t: 'Your child doesn’t want a wedding and you go along with it', dev: 15, fx: (g) => { g.remember('kidWed', 'none'); }, res: 'They registered the marriage and posted a photo of the two of them in the family group chat. You looked at it many times.' },
      ] },
    { id: 'e_m_oldhouse', y: [2026, 2200], minAge: 35, maxAge: 64, t: 'The Old House', always: true,
      ok: (g) => !!JY.byId.fa && !parentAlive(g) && !g.recall('oldHouse'),
      text: (g) => 'Your parents are both gone. The old house back home stands empty, and the key is in your hand. ' + (sibs(g) ? 'Your siblings say it is up to you what to do with it. ' : '') + 'The agent says it could sell for about ' + fmt(oldVal(g) * 1e4) + ' or so.',
      choices: [
        { t: 'Keep it and visit on holidays', canon: true, fx: (g) => { g.remember('oldHouse', 'keep'); g.set('keptOldHouse'); g.stat('心情', 2); }, res: 'You hung your parents’ photo back in its old spot.' },
        { t: 'Sell it', dev: 10, fx: (g) => { A = Math.round(oldVal(g) * 1e4 / ((g.recall('sibs') || 0) + 1)); CN.earn(g, A); g.remember('oldHouse', 'sold'); g.stat('心情', -3); },
          res: (g) => 'The buyer was a young man who said he would turn it into a guesthouse. ' + (sibs(g) ? 'Your siblings split the money, and your share was ' : 'It sold for ') + fmt(A) + '. You took one last look at the marks on the door frame where your height was measured.' },
        { t: 'Give it to your siblings', dev: 10, cond: (g) => sibs(g), fx: (g) => { g.remember('oldHouse', 'gave'); g.stat('人缘', 5); }, res: 'You signed the agreement. Your siblings raised a glass to you at the dinner table.' },
        { t: 'Move back in', dev: 15, cond: (g) => atHome(g) && ['none', 'rent'].includes(house(g)),
          fx: (g) => { settleOld(g, oldVal(g)); g.remember('house', 'hometown'); g.remember('oldHouse', 'live'); }, res: 'You gave up your rental and moved back into the old house. No more rent to pay, and the pictures you stuck on the wall as a child are still there.' },
      ] },
    { id: 'e_m_crash', y: [2026, 2200], minAge: 28, maxAge: 72, t: 'The Market', always: true,
      ok: (g) => g.age >= 28 && g.age <= 72 && invested(g) >= 50000 && ['fund', 'stock'].includes(g.recall('investStyle')) && !g.recall('crash') && (CN.marketMood ? CN.marketMood(g) === 'crash' : yearRoll(g, 11) < 0.1),
      text: (g) => 'The market took a sharp turn this year. Your ' + CN.riskName(g.recall('investStyle')) + ', worth ' + fmt(invested(g)) + ', and in a single month it lost over a third. In the group chats, some people were cursing and some were buying the dip.',
      choices: [
        { t: 'Hold on and do nothing', canon: true, fx: (g) => { A = -gain(g, -0.35); g.remember('crash', 'hold'); }, res: () => 'On paper you were down ' + fmt(A) + '. You uninstalled the app: out of sight, out of mind.' },
        { t: 'Cut your losses and exit', dev: 10, fx: (g) => { A = -gain(g, -0.35); CN.withdraw(g); g.remember('crash', 'cut'); }, res: () => 'You lost ' + fmt(A) + ', pulled out everything that was left and put it in the bank. A smaller loss is a gain, you told yourself.' },
        { t: 'Buy a bit more while it’s down', dev: 20, cond: (g) => cash(g) >= 50000,
          fx: (g) => { gain(g, -0.35); A = CN.invest(g, w1(cash(g) * 0.3), g.recall('investStyle') || 'fund'); g.remember('crash', 'add'); }, res: () => 'You put in another ' + fmt(A) + '. ' + 'That night after buying, you hardly slept.' },
      ] },
    { id: 'e_m_boom', y: [2026, 2200], minAge: 28, maxAge: 72, t: 'A Good Market', always: true,
      ok: (g) => g.age >= 28 && g.age <= 72 && invested(g) >= 50000 && ['fund', 'stock', 'gold'].includes(g.recall('investStyle')) && !g.recall('boom') && (CN.marketMood ? CN.marketMood(g) === 'boom' : yearRoll(g, 13) < 0.07),
      text: (g) => 'The market was remarkably good this year. Your ' + CN.riskName(g.recall('investStyle')) + ' rose forty percent in half a year, and are now worth ' + fmt(invested(g) * 1.4) + '. ',
      choices: [
        { t: 'Hold on and see', canon: true, fx: (g) => { A = gain(g, 0.4); g.remember('boom', 'hold'); }, res: () => 'You made another ' + fmt(A) + ', and couldn’t bring yourself to sell.' },
        { t: 'Take the profit', dev: 10, fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); g.remember('boom', 'cash'); }, res: () => 'You pulled all the money out, netting ' + fmt(A) + '. The day after you sold, it rose a bit more, and you smiled.' },
        { t: 'Withdraw some and take the family on a trip', dev: 15,
          fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); B = w1(A * 0.2); spend(g, B); g.remember('boom', 'trip'); },
          res: (g) => 'You took out ' + fmt(B) + ', and took ' + (parentAlive(g) ? paWord(g) : CN.alone(g) ? 'yourself' : 'the whole family') + ' to see the sea. You put the rest in the bank.' },
      ] },

    /* 升职、自己干、当顾问：排在最后，这一年孩子、父母、行情都没有事才轮到 */
    { id: 'e_m_ladder', y: [2026, 2200], minAge: 38, maxAge: 44, t: 'One Step Up', loc: 'office', always: true,
      ok: (g) => g.age >= 38 && g.age <= 44 && EMP.includes(job(g)) && !!POST40[job(g)] && !g.recall('ladder40') && g.s('事业') >= 35,
      text: (g) => pk(g, ['Your old boss is about to retire, and the ', 'A new position has been created upstairs: the ', 'The person in charge was transferred away, and the '], 34) + POST40[job(g)] + ' post is open. Your current role is ' + title(g) + ', and your monthly pay is about ' + fmt(mPay(g, job(g))) + '. '
        + (hasKid(g) && !kidAway(g) && kAge(g) < 15 ? kn(g) + ' is still little. ' + (married(g) ? spName(g) + ' asks whether you will still come home for dinner at night.' : 'Someone has to pick them up after school.') : ''),
      choices: [
        { t: (g) => 'Compete for it (if you get it, about ' + fmt(mPay(g, job(g), null, 12)) + '/month, heavy responsibility, lots of overtime)', canon: true, cond: hiEdu, check: ['事业', 55],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => 'You became ' + title(g) + ', with a monthly pay of about ' + fmt(mPay(g, job(g))) + '. Your office moved to the end of the hall, ' + pk(g, ['and outside the window was a row of plane trees.', 'and a money tree plant now stood by the door.', 'and the phone on the desk rang dozens of times a day.'], 39),
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: 'The list was posted, and the first name wasn’t yours. You stood downstairs for a while, then went back up to work.', dev: 5 } },
        { t: (g) => 'Compete for it (if you get it, about ' + fmt(mPay(g, job(g), null, 12)) + '/month; your lack of a degree works against you, so it will rest on your record over the years)', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 65],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => 'You became ' + title(g) + '. Some people said behind your back that your education wasn’t enough, so you laid out the last few years of numbers on the table, and after that nobody said it.',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: 'The post went to a better-educated young person. On the first day in the job, the new head came to ask you for advice first.', dev: 5 } },
        { t: (g) => 'Take the expert track and go for ' + EXPERT40[job(g)] + ' (if you make it, about ' + fmt(mPay(g, job(g), null, 8)) + '/month, no managing people)', dev: 10, cond: (g) => !!EXPERT40[job(g)], check: ['学识', 70],
          fx: (g) => { CN.setJob(g, job(g), EXPERT40[job(g)]); g.stat('事业', 6); g.stat('学识', 2); g.remember('ladder40', 'expert'); },
          res: (g) => 'At the review meeting you spoke for twenty minutes. When the certificate came through, you became ' + title(g) + '. The hardest cases all came through you from then on.',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('ladder40', 'lost'); }, res: 'Your file was one paper short. You put the review form away and said you’d come back next year.', dev: 5 } },
        { t: (g) => 'Transfer out of town and move up a level (about ' + fmt(mPay(g, job(g), null, 14)) + '/month, ' + (married(g) || (hasKid(g) && !kidAway(g)) ? 'shuttling between two places' : 'starting over somewhere new') + ')', dev: 20, cond: (g) => ['office', 'tech', 'sales', 'civil'].includes(job(g)),
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)] + (job(g) === 'civil' ? ' (posted down)' : ' (posted away)')); g.move('office', job(g) === 'civil' ? 'a county down at the grassroots level' : 'a branch office out of town'); g.stat('事业', 12); g.stat('人缘', -3); g.remember('ladder40', 'away'); },
          res: (g) => (job(g) === 'civil' ? 'You went to a county down at the grassroots level. ' : 'You went to the branch office out of town. ') + (married(g) || (hasKid(g) && !kidAway(g)) ? 'Every Friday night you took the high-speed train home, and every Sunday night you took it back. You often booked the same seat number.' : 'The dorm room was small with its window facing east, and the sun woke you in the morning.') },
        { t: (g) => (married(g) || hasKid(g) || parentAlive(g) ? 'Don’t compete, save the time for your family' : 'Don’t compete, stay with the work you have'), dev: 15,
          fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); g.remember('ladder40', 'family'); },
          res: (g) => (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? 'In those years, ' + kn(g) + '’s parent-teacher meetings never once went without you.' : parentAlive(g) ? 'In those years, ' + paWord(g) + ' had you beside them at every follow-up visit.' : 'You left work on time and learned to cook a few new dishes.') },
      ] },
    { id: 'e_m_ladder2', y: [2026, 2200], minAge: 47, maxAge: 54, t: 'The Last Rung', loc: 'office', always: true,
      ok: (g) => g.age >= 47 && g.age <= 54 && EMP.includes(job(g)) && !!TOP50[job(g)] && !g.recall('ladder50') && (['head', 'expert', 'away'].includes(g.recall('ladder40')) || g.s('事业') >= 65),
      text: (g) => 'The next step up is ' + TOP50[job(g)] + '. ' + pk(g, ['Leadership will pick one person from middle management. ', 'An evaluation team has come to talk, and you are on the list. ', 'The boss quietly asks whether you have that ambition. '], 35) + 'Around fifty, some people push upward and others begin to let go. Your monthly pay right now is about ' + fmt(mPay(g, job(g))) + '. ',
      choices: [
        { t: (g) => 'Go for it (if you succeed, about ' + fmt(mPay(g, job(g), null, 15)) + '/month, lots of business dinners, and plenty of people’s health can’t take it)', dev: 15, check: ['事业', 70],
          fx: (g) => { CN.setJob(g, job(g), TOP50[job(g)]); g.stat('事业', 10); g.stat('健康', -4); g.remember('ladder50', 'top'); },
          res: (g) => 'The appointment came through, and you became ' + title(g) + '. You spent the evening replying to messages of congratulations. The next morning at seven, you were the first to arrive.',
          fail: { fx: (g) => { g.stat('心情', -5); g.remember('ladder50', 'lost'); }, res: 'In the final round you lost to someone parachuted in from outside. You took three days off and spent two nights in the countryside.', dev: 5 } },
        { t: 'Step back to the second line and mentor the young', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('人缘', 3); g.stat('事业', -2); g.remember('ladder50', 'mentor'); },
          res: 'You organized your notes from all these years into a folder and sent it to the young people on the team. Two of them read it carefully and kept chasing you with questions.' },
        { t: (g) => 'Step aside voluntarily for a quieter post (about ' + fmt(k1(mPay(g, job(g)) * 0.8)) + '/month)', dev: 10,
          fx: (g) => { CN.setJob(g, job(g), (JOBT[job(g)] || '') + ' (stepped back)'); g.stat('事业', -8); g.stat('健康', 3); g.remember('ladder50', 'easy'); },
          res: 'The new post has nothing urgent. You can nap for half an hour at noon and leave at 5:30 sharp.' },
      ] },
    { id: 'e_m_biz', y: [2026, 2200], minAge: 40, maxAge: 52, t: 'Starting Over on Your Own', always: true,
      ok: (g) => g.age >= 40 && g.age <= 52 && !['none', 'retired', 'boss', 'shop', 'creator'].includes(job(g)) && !g.recall('biz45') && g.recall('startup') !== 'ok'
        && !['stall', 'online', 'franchise'].includes(g.recall('biz')) && lifeRoll(g, 36) < 0.18 && (cash(g) >= 60000 || ['rural', 'county'].includes(g.recall('hukou'))),
      text: (g) => {
        const home = ['rural', 'county'].includes(g.recall('hukou'));
        const a = home && lifeRoll(g, 37) < 0.5 ? 'The village party secretary from back home called to say the village wants to set up a cooperative for ' + coopCrop(g) + ', and it needs someone who has seen the world and is willing to come back. '
          : lifeRoll(g, 37) < 0.75 ? 'An old friend has opened three branches of a ' + frKind(g) + ', and says that if you join the franchise, they’ll show you the ropes. ' : 'You see people your age selling ' + onlineItem(g) + ' online, with several thousand dollars in sales a month. ';
        return a + 'You are ' + g.age + ' years old, and your card holds ' + fmt(cash(g)) + '. ';
      },
      choices: [
        { t: (g) => 'Franchise a ' + frKind(g) + ' (startup money ' + fmt(FR[tier(g)] || 200000) + (cash(g) < (FR[tier(g)] || 200000) ? ', of which you’d need to borrow ' + fmt(w1((FR[tier(g)] || 200000) - Math.max(0, cash(g)))) : '') + ', and payback takes about three years)', dev: 20,
          cond: (g) => cash(g) >= (FR[tier(g)] || 200000) * 0.4, check: ['事业', 50],
          fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); g.remember('bizKind45', k); CN.setJob(g, 'boss', k + ' franchise owner'); g.remember('biz45', 'franchise'); g.stat('心情', 3); },
          res: (g) => 'You quit your job and opened a ' + g.recall('bizKind45') + '. In all you put in ' + fmt(A) + (M ? ', of which ' + fmt(M) + ' was borrowed' : '') + '. On opening day, ' + (married(g) ? spName(g) + ' stood behind the cash register, even more nervous than you.' : 'several old colleagues came and helped you hang the banner.'),
          fail: { fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); B = w1(A * 0.3); CN.earn(g, B); g.remember('bizKind45', k); g.remember('biz45', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => 'The shop was at the gate of a new housing complex that never filled up. A year later you sold the shop, and of the ' + fmt(A) + ' you invested, you recovered only ' + fmt(B) + '. ' + (owe(g) > 0 ? 'You still owed ' + fmt(owe(g) * 1e4) + '. ' : '') + 'Luckily your old workplace still wanted you, and you went back to work.', dev: 5 } },
        { t: (g) => 'Go home and set up a cooperative growing ' + coopCrop(g) + ' (startup money $21,000, working together with the villagers; the harvest depends on the weather and also on finding buyers)', dev: 25, cond: (g) => ['rural', 'county'].includes(g.recall('hukou')), check: ['人缘', 50],
          fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'boss', c + ' co-op leader'); g.remember('biz45', 'coop'); g.stat('人缘', 4); },
          res: (g) => 'You went back to ' + where(g) + '. Leasing land, building a cold store and buying seedlings came to $21,000' + (M ? ', and you borrowed ' + fmt(M) : '') + '. In the first year twelve households joined, and on the day the first truckload of ' + g.recall('crop45') + ' rolled out, everyone set off a string of firecrackers at the edge of the field.',
          fail: { fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); CN.earn(g, 50000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'farmer', 'Back home farming'); g.remember('biz45', 'coopFail'); g.stat('心情', -5); },
            res: (g) => 'In the first year a late cold snap hit, and the ' + g.recall('crop45') + ' harvest was cut by more than half, and half the member households pulled out. You sold the equipment at a discount for $7,100. You stayed at home and farmed your own few mu (a mu is about a sixth of an acre).', dev: 5 } },
        { t: (g) => 'Open an online shop after work, selling ' + onlineItem(g) + ' (startup money $7,100, no need to quit your job; two or three out of ten succeed)', dev: 15, check: ['人缘', 52],
          fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'online'); g.stat('健康', -2); },
          res: 'The $7,100 bought stock and paid for product photos. Every day after work you packed orders until eleven, and on weekends you ran to the courier station. In the third month, a customer sent you a thank-you letter.',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'onlineFail'); g.stat('心情', -3); }, res: 'You couldn’t photograph or talk up your products, and the shop got only a few views a day. After half a year you closed it, and the stock piled up at home until you handed it out to relatives at New Year.', dev: 5 } },
        { t: 'Forget it, at this age you want stability', canon: true, fx: (g) => { g.remember('biz45', 'no'); g.stat('心情', 1); }, res: 'You thought over what was said on the phone all night and went to work as usual the next day.' },
      ] },
    { id: 'e_m_consult', y: [2026, 2200], minAge: 55, maxAge: 63, t: 'Consultant', always: true,
      ok: (g) => g.age >= 55 && g.age <= 63 && ['office', 'tech', 'doctor', 'teacher', 'sales', 'boss', 'worker', 'nurse'].includes(job(g)) && g.s('健康') >= 45 && !g.recall('consult')
        && (g.s('学识') >= 80 || g.s('事业') >= 75 || (job(g) === 'worker' && !!g.recall('skill'))),
      text: (g) => ({ doctor: 'A private hospital', teacher: 'A training school', nurse: 'A nursing home', worker: 'A factory in another city', tech: 'A start-up company' }[job(g)] || 'A small company in your field') + ' has tracked you down through a contact and wants to hire you as a consultant. They say it is exactly the experience you have built up over the years that they want.',
      choices: [
        { t: (g) => 'Say yes and consult part-time on weekends (extra income per month: ' + fmt(k1(mPay(g, job(g)) * 0.25)) + ')', dev: 10,
          fx: (g) => { g.remember('consultPay', k1(mPay(g, job(g)) * 0.25)); g.remember('consult', 'part'); g.stat('健康', -1); g.stat('事业', 3); },
          res: (g) => 'Every Saturday you go for half a day, look at their difficulties and offer a few words. Each month you earn an extra ' + fmt(g.recall('consultPay')) + ', which you put on a separate card.' },
        { t: (g) => 'Quit your current job and open your own studio (startup money $7,100, ' + CN.jobRisk('boss') + ')', dev: 25, cond: (g) => job(g) !== 'boss', check: ['事业', 60],
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'boss', 'Opened own studio'); g.remember('consult', 'own'); g.stat('心情', 4); },
          res: 'You rented a small office and hung up a sign. The first order was referred by an old client.',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('consult', 'ownFail'); g.stat('心情', -4); }, res: 'After more than half a year, the studio didn’t bring in enough orders to cover the rent. You took the sign down, and the $7,100 counted as the price of a lesson. Your old workplace let you come back.', dev: 5 } },
        { t: 'Thanks, but you’ll keep things steady until retirement', canon: true, fx: (g) => { g.remember('consult', 'no'); }, res: 'You tucked the other party’s business card into your notebook.' },
      ] },

    /* 升职、自己干、当顾问的回响 */
    { id: 'e_m_ladder_echo', y: [2026, 2200], minAge: 41, maxAge: 64, t: 'These Years', auto: true, always: true,
      cond: (g) => !!g.recall('ladder40') && g.since('ladder40') >= 3,
      fx: (g) => { const l = g.recall('ladder40'); if (l === 'head') g.stat('健康', -2); if (l === 'away') { A = w1(myInc(g) * 0.2); CN.earn(g, A); if (POST40[job(g)]) CN.setJob(g, job(g), POST40[job(g)]); } if (l === 'family') g.stat('心情', 2); },
      text: (g) => ({
        head: 'In your years as ' + POST40[job(g)] + ', you learned to say less in meetings and make more calls after. Your checkup report has two more flagged results.',
        expert: 'Your name has entered the industry’s expert database. Every year a few young people come to see you specially, bringing questions and also specialties from their hometowns.',
        away: 'Your years on assignment away earned you ' + fmt(A) + ' in allowances. ' + (married(g) ? 'On the day you transferred back, ' + spName(g) + ' waited for you at the station and said you looked thin.' : (house(g) === 'rent' ? 'After coming back, you rented a south-facing place in your old neighborhood.' : 'After coming back, you repainted your home from top to bottom.')),
        lost: 'You made your peace with not winning that time. From your old position, you got a few things done that you wanted to do.',
        family: hasKid(g) && !kidAway(g) ? kn(g) + ' grew up, and one day suddenly said that you ate dinner at home every day in those years, and that ' + kHe(g) + ' remembered it.' : 'You didn’t move up in those years. The money you earned less bought you many evenings of getting home early.',
      }[g.recall('ladder40')]) },
    { id: 'e_m_ladder2_echo', y: [2026, 2200], minAge: 50, maxAge: 64, t: 'The Seat', auto: true, always: true,
      cond: (g) => !!g.recall('ladder50') && g.since('ladder50') >= 3,
      fx: (g) => { const l = g.recall('ladder50'); if (l === 'top') { g.stat('健康', -3); A = w1(myInc(g) * 0.25); CN.earn(g, A); } else g.stat('心情', 2); },
      text: (g) => ({
        top: 'Sitting in the ' + TOP50[job(g)] + ' seat, your bonus for the year is ' + fmt(A) + '. Your blood pressure pills went up to two a day.',
        lost: 'The person who was parachuted in left after two years. You didn’t compete again, and life went on all the same.',
        mentor: 'A young person you mentored got promoted and took you to dinner. They said, “Master, I remember everything you told me back then.”',
        easy: 'In these quiet years, you walked every park near home and met a group of people who do tai chi together.',
      }[g.recall('ladder50')]) },
    { id: 'e_m_biz_echo', y: [2026, 2200], minAge: 43, maxAge: 64, t: 'Business', auto: true, always: true,
      cond: (g) => ['franchise', 'coop', 'online'].includes(g.recall('biz45')) && g.since('biz45') >= 3,
      fx: (g) => {
        const b = g.recall('biz45');
        M = helperM(g);
        B = g.rnd() < { franchise: 0.65, coop: 0.6, online: 0.5 }[b] ? 1 : 0;
        if (B) { A = b === 'franchise' ? w1((FR[tier(g)] || 200000) * 0.6) : b === 'coop' ? w1(80000 + g.rnd() * 120000) : w1(60000 + g.rnd() * 60000); CN.earn(g, A); g.stat('事业', 6); if (b === 'online') CN.setJob(g, 'boss', 'Online shop owner'); }
        else if (b === 'franchise') { A = w1((FR[tier(g)] || 200000) * 0.2); CN.earn(g, A); CN.setJob(g, tier(g) >= 4 ? 'worker' : 'office', tier(g) >= 4 ? 'Factory worker' : 'Office worker'); g.stat('心情', -6); }
        else if (b === 'coop') { CN.setJob(g, 'farmer', 'Farmer'); g.stat('心情', -5); }
        else g.stat('心情', -2);
      },
      text: (g) => {
        const b = g.recall('biz45');
        const hire = M ? 'You got ' + helpWho(g, M) + ' to come help, ' + (b === 'coop' ? 'managing the warehouse and the books. ' : b === 'online' ? 'handling customer service and shipping. ' : 'running the register. ') : 'You hired two people from nearby. ';
        if (b === 'franchise') return B ? 'That ' + g.recall('bizKind45') + ' paid back its startup cost, and over these years you netted ' + fmt(A) + '. You opened another branch. ' + hire
          : 'Headquarters changed its approach, franchise fees went up, and customers dropped. You transferred the ' + g.recall('bizKind45') + ' to someone else, recovered ' + fmt(A) + ', and found another job. ' + (owe(g) > 0 ? 'The ' + fmt(owe(g) * 1e4) + ' you owe is being paid off monthly.' : '');
        if (b === 'coop') return B ? 'The cooperative now has more than thirty households. ' + g.recall('crop45') + ' now carry your village’s name, sell in other provinces, and last year paid out dividends of ' + fmt(A) + '. ' + hire
          : 'Two years of bad markets in a row, and ' + g.recall('crop45') + ' rotted in the fields by the batch. The cooperative broke up, you rented the cold store to someone else, and you went back to farming yourself.';
        return B ? 'The online shop stabilized, and over these years you netted ' + fmt(A) + '. You quit your job to focus on running it. ' + hire : 'The platform’s rules changed every year and the shop’s traffic kept shrinking. You closed it, leaving a room full of cardboard boxes and a few old customers you still stay in touch with.';
      } },
    { id: 'e_m_consult_echo', y: [2026, 2200], minAge: 57, maxAge: 64, t: 'The Consulting Years', auto: true, always: true,
      cond: (g) => ['part', 'own', 'ownFail'].includes(g.recall('consult')) && g.since('consult') >= 2,
      fx: (g) => { const c = g.recall('consult'); A = 0; if (c === 'part') { A = (Number(g.recall('consultPay')) || 0) * 24; CN.earn(g, A); } if (c === 'own') { A = w1(myInc(g) * (0.3 + g.rnd() * 0.6)); CN.earn(g, A); } },
      text: (g) => ({
        part: 'After two years of weekend consulting, that card has built up ' + fmt(A) + '. The ' + (job(g) === 'doctor' ? 'hospital' : job(g) === 'teacher' ? 'school' : 'company') + '’s young people all call you “Teacher” when they see you.',
        own: 'The studio has a few regular clients. Over these two years you earned an extra ' + fmt(A) + ', and you set yourself a rule: no phone calls after eight in the evening.',
        ownFail: 'The sign you took down is still on the balcony. Sometimes when you water the plants, you glance at it.',
      }[g.recall('consult')]) },

    /* 自动发生的回响和变故 */
    { id: 'e_m_kid_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: 'Child', auto: true, always: true,
      cond: (g) => !!g.recall('kidBond') && g.since('kidBond') >= 3 && hasKid(g),
      fx: (g) => { const b = g.recall('kidBond'); if (b === 'close') g.stat('心情', 3); if (b === 'strict') g.stat('人缘', -2); },
      text: (g) => {
        const b = g.recall('kidBond');
        const s = g.recall('kidSchool');
        const pre = s === 'left' ? 'Since your child came back to live with you, there has always been a layer between you. ' : s === 'district' ? (owe(g) > 0 ? 'The loan on the school-district flat is still being repaid, but it is worth it. ' : '') + 'The school really is a good one. ' : '';
        return pre + (b === 'close' ? 'Since that long talk, your child comes to ask you first when something comes up.' : b === 'strict' ? 'Your child has grown up and still speaks to you politely, the way they would to a teacher.' : 'Your child grew up on their own, into someone you hardly recognize and slightly admire.');
      } },
    { id: 'e_m_kid_move_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: 'In the City', auto: true, always: true,
      cond: (g) => !!g.recall('kidMove') && g.recall('kidMove') !== 'stay' && g.since('kidMove') >= 2 && hasKid(g),
      text: (g) => ({
        buy: 'Two years after moving to the city, your child’s grades have settled near the top of the class. You are slowly getting used to the city’s vegetable prices.',
        rent: 'In the two years of accompanying your child, you got to know a group of parents doing the same. When anyone’s kid did well on a test, everyone was happy together.',
        board: 'After two years of boarding, your child has learned to do laundry and manage money. On Fridays at home, they help you cook now.',
      }[g.recall('kidMove')]) },
    { id: 'e_m_kid_uni_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: 'Your Child’s Path', auto: true, always: true,
      cond: (g) => !!g.recall('kidPath') && g.since('kidPath') >= 3 && hasKid(g),
      text: (g) => {
        const p = g.recall('kidPath'), u = g.recall('kidUni');
        if (p === 'work') return 'The trade your child learned has paid off, and they opened a small studio of their own. When people ask, you say, “They made it on their own.”';
        if (p === 'stable') return (u === 'top' || u === 'good' ? 'Your child finished school on the path you chose and has a very stable job. ' : 'Your child finished school and took several years of exams before getting a permanent government post. ') + 'Once, after a few drinks, your child said it would have been better to have chosen for themselves that year.';
        return u === 'top' ? 'The good university your child attended became one of the few things you could talk about in front of relatives.' : 'The major your child chose for themselves actually led to a job in the field.';
      } },
    { id: 'e_m_kid_wed_echo', y: [2026, 2200], minAge: 42, maxAge: 64, t: 'The Young Couple', auto: true, always: true,
      cond: (g) => !!g.recall('kidWed') && g.since('kidWed') >= 2 && hasKid(g),
      text: (g) => ({
        paid: 'The young couple moved into their new home, with both their names on the property deed. ' + kn(g) + ' said they would pay the mortgage themselves and slowly repay the sum you contributed. You said there was no need.',
        self: 'The young couple rent a place, and life is tight but full of energy. They often come to your place for a free meal on weekends.',
        none: 'The couple who skipped the wedding saved the money and took a trip somewhere far away. When the photos came back, you set one as your phone’s wallpaper.',
      }[g.recall('kidWed')]) },
    { id: 'e_m_pa_bill_echo', y: [2026, 2200], minAge: 46, maxAge: 64, t: 'After Discharge', auto: true, always: true,
      cond: (g) => !!g.recall('paBill') && g.since('paBill') >= 1,
      text: (g) => {
        const b = g.recall('paBill');
        if (!parentAlive(g)) return 'After that hospital stay, your elderly parent stayed with you for a while longer. You don’t regret the decision you made.';
        if (b === 'best') return paWord(g) + ' recovered very well and can go downstairs for a stroll again. The neighbors all ask what medicine was used.';
        if (b === 'split') return paWord(g) + ' recovered well. Since you all pooled money, the siblings’ group chat has been much livelier.';
        return paWord(g) + '’s illness is under control, though walking now takes a cane. You installed a row of handrails in the stairwell.';
      } },
    { id: 'e_m_crash_echo', y: [2026, 2200], minAge: 30, maxAge: 74, t: 'Looking Back', auto: true, always: true,
      cond: (g) => !!g.recall('crash') && g.since('crash') >= 2,
      fx: (g) => { const c = g.recall('crash'); A = 0; if (c === 'hold') A = gain(g, 0.3); if (c === 'add') A = gain(g, 0.45); },
      text: (g) => {
        const c = g.recall('crash');
        if (c === 'cut') return 'The market slowly climbed back later. You were no longer on board, so you just watched the show. The money in the bank hadn’t lost a cent.';
        if (!invested(g)) return 'After that big drop, you never touched any of this again.';
        return (c === 'add' ? 'The amount you bought during the drop has gained quite a bit. ' : 'Two years later, the market has slowly recovered. ') + 'You open the app, and the account shows ' + fmt(invested(g)) + '. ';
      } },
    { id: 'e_m_boom_echo', y: [2026, 2200], minAge: 30, maxAge: 74, t: 'After the Surge', auto: true, always: true,
      cond: (g) => !!g.recall('boom') && g.since('boom') >= 2,
      fx: (g) => { if (g.recall('boom') === 'hold') gain(g, -0.15); },
      text: (g) => ({
        hold: 'After that wave of gains, it pulled back some. The account now holds ' + fmt(invested(g)) + ', still more than at the start.',
        cash: 'The money you cashed out then, you have kept saved for retirement.',
        trip: 'As for the photos from that trip, ' + (CN.alone(g) ? 'you had them printed and hung on the wall.' : 'your family has kept them up on the living room wall.'),
      }[g.recall('boom')]) },
    { id: 'e_m_fa_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Father Passes Away', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.fa && deadThisYear(g, 'fa'),
      fx: (g) => { g.stat('心情', -6); g.remember('lostFa', true); },
      text: (g) => {
        const p = g.recall('parentsCare');
        return p === 'self' && g.recall('parentsIn') ? 'Your father died in your home, and before he went, he called your childhood nickname.' : p === 'nursing' ? 'The care home called in the middle of the night. When you arrived, the aide said he had passed very peacefully.' : p === 'far' ? 'You rushed back to your hometown overnight and were still a step too late. On the camera, the last recording was of him watching TV.' : 'Your father has passed away. You kept vigil in the mourning hall for three nights, going over his whole life in your mind.';
      } },
    { id: 'e_m_mo_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Mother Passes Away', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.mo && deadThisYear(g, 'mo'),
      fx: (g) => { g.stat('心情', -7); },
      text: (g) => (g.recall('lostFa') ? 'Your mother has gone too. From now on, you have no parents.' : 'Your mother has passed away. ') + (g.recall('parentsCare') === 'self' && g.recall('parentsIn') ? 'You left her slippers where they were for a long time.' : 'Sorting through her things, you found an iron box, and inside it were your certificates of merit from childhood.') },
    { id: 'e_m_oldhouse_echo', y: [2026, 2200], minAge: 36, maxAge: 64, t: 'Hometown', auto: true, always: true,
      cond: (g) => !!g.recall('oldHouse') && g.since('oldHouse') >= 3,
      text: (g) => {
        const o = g.recall('oldHouse');
        if (o === 'keep' && g.f('keptOldHouse')) return 'At Qingming, the tomb-sweeping festival, you went back home and pushed open the door, with dust floating in the light. A neighbor said the tree by your door had grown thicker again.';
        if (o === 'sold') return 'You passed through your hometown. The house had become a guesthouse, with lanterns hanging at the door. You didn’t go in.';
        if (o === 'live') return 'In your years back in the old house, you cleaned up the yard and planted scallions and chilies. The neighbors often hand things over the wall.';
        return 'Your siblings renovated the old house. You went back for a night and slept in the same bed from your childhood.';
      } },
    { id: 'e_m_sp_ill_echo', y: [2026, 2200], minAge: 51, maxAge: 64, t: 'By the Hospital Bed', auto: true, always: true,
      cond: (g) => !!g.recall('spSick') && g.since('spSick') >= 1,
      fx: (g) => { if (married(g) && g.rnd() < (g.recall('spSick') === 'all' ? 0.2 : 0.35)) g.kill('sp', 'Died of illness', true); },
      text: (g) => (married(g) ? spName(g) + ' pulled through. On the day of discharge, you took a photo together at the hospital gate, both of you thinner by a size.' : 'You did all you could. ' + spName(g) + ' passed away anyway.') },
    { id: 'e_m_sp_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: 'Your Spouse Passes Away', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', 'Widowed'); g.stat('心情', -10); },
      text: (g) => spName(g) + ' passed away. ' + (g.recall('marriage') === 'mended' ? 'The decade or so after that long talk was the best time you two had.' : g.recall('marriage') === 'cold' ? 'You had been cold toward each other for so many years, and only at the end did you talk a lot again.' : 'You couldn’t bring yourself to throw away a single one of your spouse’s things at home.') },
  ];

  // 固定年龄的抉择登记到 DEC：同一年里一个选完，同龄的另一个就不再弹（选择可能让另一个的条件变成真）
  NODES.forEach((n) => { if (!n.auto) DEC.push(n); });
  DEC.forEach((n) => { const c = n.cond; n.cond = (g) => (!c || c(g)) && !DEC.some((m) => m !== n && m.age === n.age && done(g, m.id)); });
  // 抉择类意外：这一年没有固定抉择，排在前面、条件满足、还没发生的意外也让它先来
  const ED = ENCS.filter((e) => !e.auto);
  ED.forEach((e, i) => { const ok = e.ok; e.cond = (g) => ok(g) && quiet(g) && !ED.slice(0, i).some((b) => !done(g, b.id) && b.ok(g)); });
  JY.addLifeNodes(NODES);
  JY.addEncounters(ENCS);

  /* 新增的状态键名（中年，写进这一世的记忆）：
   * crisis35 'stay'|'small'|'shop'|'home'|'idle'（三十五岁坎，原来叫 crisis，和青年的 crisis 撞名）
   * stableRoute 'steady'|'lead'|'lost'|'quit'；laborRoute 'grind'|'skill'|'home'；ownRoute 'steady'|'grow'|'debt'|'quit'；noneRoute 'work'|'home'|'craft'
   * money36 'safe'|'prepay'|'fund'|'stock'；inv36 元（三十六岁那笔闲钱投了多少）
   * kid37 'one'|'two'|'tried'（三十七岁要不要再生一个）
   * marriage 'cold'|'mended'|'split'；custody 'me'|'ex'；marry38 'match'|'alone'|'love'（三十八岁晚婚、再婚，原来叫 lateMarry，和青年撞名）
   * nokid 'ivf'|'failed'|'dink'|'adopt'；body40 'ignore'|'run'|'car'；career42；check45 'pills'|'change'|'ignore'
   * house44 'rent'|'save'|'county'|'bought'|'pay'|'early'|'small'|'swap'|'keep'|'second'|'gift'|'renov'；rental 元/年（出租房的年租金）
   * ai47 'hold'|'learn'|'out'；land 'rent'|'big'|'city'
   * care51 'same'|'changed'|'aide'；paAide true（请了护工上门）；paBill 'best'|'basic'|'split'（老人用不用自费新疗法）
   * nest 'save'|'fund'|'invest'|'lost'|'kid'；ill55 'surgery'|'conservative'|'hide'；hobby55 'none'|'art'|'biz'
   * end58 'stay'|'easy'|'push'|'family'|'free'；plan60 'stay'|'home'|'kid'|'down'|'south'
   * sibLoan 'yes'|'help'|'no'；selfCare 'kid'|'insure'|'friends'；lostFa；spSick 'all'|'both'|'paid'
   * oldHouse 'keep'|'sold'|'gave'|'live'；crash 'hold'|'cut'|'add'；boom 'hold'|'cash'|'trip'
   * 孩子：kidSchool 'public'|'district'|'good'|'left'；kidMove 'stay'|'buy'|'rent'|'board'（县城、农村的孩子进城读初中）
   *       kidPush 'hard'|'self'|'easy'；kidBond 'strict'|'close'|'loose'
   * ladder40 'head'|'expert'|'away'|'family'|'lost'（38–44 岁往上一级）；ladder50 'top'|'mentor'|'easy'|'lost'（47–54 岁最后一级）
   * biz45 'franchise'|'coop'|'online'|'franchiseFail'|'coopFail'|'onlineFail'|'no'（40–52 岁另起炉灶）；bizKind45 加盟店种类；crop45 合作社种什么
   * consult 'part'|'own'|'ownFail'|'no'（55–63 岁当顾问）；consultPay 元/月（兼职顾问每月多挣的）
   *       kidScore/kidUni 'top'|'good'|'normal'|'none'；kidPath 'own'|'stable'|'work'；kidCity 城市名或 '国外'（老年部分读）；kidWed 'paid'|'self'|'none'
   */
})();

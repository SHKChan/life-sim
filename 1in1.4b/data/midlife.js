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
  const JOBT = { office: '公司职员', tech: '程序员', sales: '销售', civil: '公务员', teacher: '老师', doctor: '医生', nurse: '护士', soldier: '军人',
    worker: '工人', rider: '外卖骑手', driver: '司机', farmer: '种地', boss: '做生意', shop: '开店', creator: '做内容', freelance: '自由职业', none: '无' };
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
  const spName = (g) => (JY.byId.sp ? g.name('sp') : '那个人');
  const kidsN = (g) => g.recall('kids') || 0;
  const hasKid = (g) => kidsN(g) > 0 && !!JY.byId.k1 && g.alive('k1');
  const kAge = (g) => (JY.byId.k1 ? g.ageOf('k1') : -1);
  const kn = (g) => (JY.byId.k1 ? g.name('k1') : '孩子');
  const kWho = (g) => CN.who(g, 'k1', true);
  const kHe = (g) => CN.he(g, 'k1');
  const kidAway = (g) => g.recall('custody') === 'ex';
  const house = (g) => g.recall('house') || 'none';
  const tier = (g) => g.recall('tier') || (g.recall('hukou') === 'rural' ? 5 : g.recall('hukou') === 'county' ? 4 : 3);
  const where = (g) => g.recall('workCity') || g.recall('homeCap') || '这座城';
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
  const BIG = ['北京', '上海', '广州', '深圳'];
  const SHOP = { 1: 300000, 2: 200000, 3: 150000, 4: 100000, 5: 60000 };
  const CAR = { 1: 300000, 2: 250000, 3: 200000, 4: 150000, 5: 120000 };
  const TUTOR = { 1: 60000, 2: 40000, 3: 25000, 4: 15000, 5: 10000 };
  const RAISE = { 1: 1500000, 2: 800000, 3: 600000, 4: 450000, 5: 300000 };
  const AIDE = { 1: 96000, 2: 72000, 3: 60000, 4: 48000, 5: 36000 };
  const NURS = { 1: 72000, 2: 54000, 3: 45000, 4: 36000, 5: 30000 };
  const COMMUTE = { 1: '地铁单程一个半钟头', 2: '地铁四十分钟', 3: '开车二十分钟', 4: '骑电动车十分钟', 5: '走路几分钟' };
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
  const paWord = (g) => { const p = parents(g); return p.length > 1 ? '爸妈' : p[0] === 'fa' ? '父亲' : '母亲'; };
  const paThey = (g) => (parents(g).length > 1 ? '他们' : CN.he(g, parents(g)[0]));
  const paWho = (g) => parents(g).map((id, i) => (i ? CN.who(g, id, true).replace(/^你的/, '') : CN.who(g, id, true))).join('和');
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
    g.info('住处', g.recall('homeCap') || '老家');
  };
  // 再婚：去世的前一位配偶也叫 sp，要先从死亡名单里拿掉，新配偶才算活着
  const remarry = (g, o) => {
    const W = JY.engine.get().W;
    const before = g.recall('love');
    if (W && W.dead && W.dead.sp) delete W.dead.sp;
    CN.marry(g, o);
    if (before === 'divorced' || before === 'widowed') g.info('婚姻', '再婚');
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
    keptOldHouse: '老家的房子一直留着，门口那棵树还在',
  });

  /* ================= 35–49 岁 ================= */
  const NODES = [
    { id: 'm_35_mirror', age: 35, t: '三十五', auto: true,
      text: (g) => {
        const c = cat(g), j = job(g), h = house(g), t = tier(g);
        const JD = { teacher: '你带过的第一届学生，有的已经工作了。', doctor: '你一个月四个夜班，值完班的早上，看太阳是白的。', nurse: '你一个月四个夜班，值完班的早上，看太阳是白的。',
          civil: '你办公桌的玻璃板下面，压着十年前的合影。', soldier: '你在部队里已经算老兵了。', rider: '你的电动车换到第三辆了。', driver: '方向盘上的皮磨得发亮。',
          worker: '车间里新装了两台机械臂。', farmer: '地里的活，一半交给了无人机。', creator: '账号的粉丝涨不动了。', freelance: '接活的群里，报价一年比一年低。' };
        const a = c === 'office' ? (t <= 2 ? '早上' + COMMUTE[t] + '，你被挤在车门边。' : '') + '公司里新来的年轻人管你叫“老师”，你知道这不全是客气。'
          : c === 'stable' ? (JD[j] || '') + '单位里的日子一眼能看到头，你有时候觉得这是福气，有时候不觉得。'
          : c === 'labor' ? (JD[j] || '') + '腰比前几年容易酸了。最年轻的那个工友，比你小十五岁。'
          : c === 'own' ? (JD[j] || '店里的账你闭着眼都能算，就是算出来的数一年比一年小。') : '你三十五岁了。日子过得不快也不慢。';
        const b = h === 'mortgage' && owe(g) > 0 ? '房贷还欠 ' + fmt(owe(g) * 1e4) + '。' : h === 'rent' ? '房东又打电话说要涨租。' : h === 'own' ? '房子总算是自己的了。' : h === 'hometown' ? '你住在老家的房子里。' : '';
        const m = cash(g) > 0 ? '卡里存着 ' + fmt(cash(g)) + '。' : '卡里没剩什么钱。';
        return a + b + m;
      } },
    { id: 'm_35_office', age: 35, t: '优化名单', loc: 'office', cond: (g) => cat(g) === 'office',
      text: (g) => (job(g) === 'tech' ? '新上的系统能自己写代码、自己测。' : job(g) === 'sales' ? '老客户开始直接跟 AI 下单。' : '报表、方案、会议纪要，新系统几秒钟就出来了。')
        + '公司要“降本增效”。主管找你谈话，问你怎么打算。你在' + where(g) + '已经干了十年。',
      choices: [
        { t: (g) => '留下，接受降薪转岗（降到约 ' + fmt(k1(mPay(g, job(g)) * 0.7)) + '/月，下一轮还可能有你）', canon: true, fx: (g) => { g.stat('事业', -8); g.stat('心情', -3); g.remember('crisis35', 'stay'); }, res: (g) => '工位从靠窗挪到了靠门。工资少了三成，你没跟' + (married(g) ? spName(g) : '家里') + '细说。' },
        { t: (g) => '拿赔偿走人，去一家小公司（赔偿约 ' + fmt(k1(myInc(g) / 12 * 11)) + '，小公司约 ' + fmt(mPay(g, job(g), null, -4)) + '/月，说倒就倒）', dev: 15, fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); g.stat('事业', -4); g.remember('crisis35', 'small'); },
          res: () => '你拿了 ' + fmt(A) + ' 的赔偿。小公司的老板比你小八岁，说话很客气。头一个月，你重新学会了做所有的事。' },
        { t: (g) => '拿赔偿，自己开家小店（本钱 ' + fmt(SHOP[tier(g)] || 150000) + '，' + CN.jobLine(g, 'shop') + '）', dev: 25,
          fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); B = SHOP[tier(g)] || 150000; M = spend(g, B); CN.setJob(g, 'shop', '开了家小店'); g.remember('crisis35', 'shop'); },
          res: () => '赔偿 ' + fmt(A) + '。盘铺面、装修、进货一共花了 ' + fmt(B) + (M ? '，不够的 ' + fmt(M) + ' 是借的' : '') + '。开张那天，前同事送来一个花篮。' },
        { t: (g) => '回老家考个编制（' + CN.jobLine(g, 'civil', 4) + '）', dev: 25, check: ['学识', 60], cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'civil', '县里的事业编'); g.remember('crisis35', 'home'); g.stat('心情', 4); }, res: '三十五岁是报名的最后一年。你考上了，搬回了老家。',
          fail: { fx: (g) => { backHome(g); CN.setJob(g, 'none', '待业'); g.remember('crisis35', 'idle'); g.stat('心情', -6); }, res: '差了两分。你还是搬回了老家，先在家里待着。', dev: 10 } },
      ] },
    { id: 'm_35_stable', age: 35, t: '竞聘', loc: 'office', cond: (g) => cat(g) === 'stable',
      text: (g) => ({ teacher: '学校里空出一个年级主任的位子。', doctor: '科里空出一个副主任的位子。', nurse: '科里空出一个护士长的位子。', soldier: '队里空出一个副职。' }[job(g)] || '单位里空出一个副科的位子。') + '领导私下问你，要不要报个名。',
      choices: [
        { t: '算了，安安稳稳干自己的', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('stableRoute', 'steady'); },
          res: (g) => '名单贴出来，上面没有你。你下班照常去' + (hasKid(g) && kAge(g) < 12 && !kidAway(g) ? '接孩子。' : '菜市场买菜。') },
        { t: '报名去竞聘', dev: 15, check: ['人缘', 55],
          fx: (g) => { g.stat('事业', 10); CN.setJob(g, job(g), JOBT[job(g)] + '（中层）'); g.remember('stableRoute', 'lead'); }, res: '你上了。开会坐的位置往前挪了两排，下班也晚了两个钟头。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('stableRoute', 'lost'); }, res: '你没上。上的那个人比你会说话。之后几年，你们在走廊里碰见都点个头。', dev: 5 } },
        { t: (g) => '辞职，出去闯一闯（借 ¥20 万做本钱，' + CN.jobRisk('boss') + '）', dev: 30, fx: (g) => { borrow(g, 20); CN.setJob(g, 'boss', '辞职下海做生意'); g.remember('stableRoute', 'quit'); }, res: '家里人都觉得你疯了。你交了辞职信，找亲戚借了 ¥20 万。' },
      ] },
    { id: 'm_35_labor', age: 35, t: '干不动的那一天', cond: (g) => cat(g) === 'labor',
      text: (g) => (job(g) === 'farmer' ? '村里的地越来越多人包给大户了。' : job(g) === 'rider' ? '平台上多了一批送餐机器人，不吃饭，不请假。' : '厂里、站里新添了一批机器人，不吃饭，不请假。') + '你算了算，自己还能这么干几年。',
      choices: [
        { t: '接着干，多接点活', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('事业', 5); g.remember('laborRoute', 'grind'); }, res: '你每天比别人早来一个钟头。钱是多了，晚上翻身的时候腰会响。' },
        { t: (g) => '去学修机器人（学费 ¥6,000，学成' + CN.jobLine(g, 'worker', null, 8) + '）', dev: 20, check: ['学识', 40],
          fx: (g) => { spend(g, 6000); CN.setJob(g, 'worker', '机器人维修工'); g.stat('事业', 8); g.remember('laborRoute', 'skill'); }, res: '培训班学费 ¥6,000。你夜里去上课，三个月后拿到了证。以前顶替你的机器，现在归你修。',
          fail: { fx: (g) => { spend(g, 6000); g.stat('心情', -3); g.remember('laborRoute', 'grind'); }, res: '那些线路图你看不进去。¥6,000 的学费白交了，你又回去干老本行。', dev: 5 } },
        { t: '回老家，不在外面熬了', dev: 15, cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, g.recall('hukou') === 'rural' ? 'farmer' : 'shop', g.recall('hukou') === 'rural' ? '回乡种地' : '在老家开小卖部'); g.remember('laborRoute', 'home'); g.stat('心情', 3); }, res: '你把被褥打包，坐了一夜的车。老家的早饭还是那个味道。' },
        { t: '换个地方，去县城开个修车铺', dev: 15, cond: (g) => atHome(g) && job(g) !== 'farmer',
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'shop', '开修车铺'); g.remember('laborRoute', 'home'); }, res: () => '租铺面、买工具花了 ¥5 万' + (M ? '，借了 ' + fmt(M) : '') + '。门口的招牌是你自己刷的。' },
      ] },
    { id: 'm_35_own', age: 35, t: '生意', cond: (g) => cat(g) === 'own',
      text: (g) => '有人来找你，说现在正是扩张的好时候，问你要不要再开一家、多投一点。算下来，要 ' + fmt(SHOP[tier(g)] || 150000) + '。',
      choices: [
        { t: '稳着做，不折腾', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('ownRoute', 'steady'); }, res: '你把那人送走，接着擦你的柜台。' },
        { t: '借钱扩张', dev: 20, check: ['事业', 45],
          fx: (g) => { B = SHOP[tier(g)] || 150000; M = spend(g, B); g.stat('事业', 10); g.remember('ownRoute', 'grow'); }, res: () => '你投进去 ' + fmt(B) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。第二家店开起来了，你开始学着当老板。',
          fail: { fx: (g) => { borrow(g, Math.round((SHOP[tier(g)] || 150000) / 1e4)); g.stat('心情', -5); g.remember('ownRoute', 'debt'); }, res: (g) => '新店开在了不该开的地方。半年后关门，留下 ' + fmt(SHOP[tier(g)] || 150000) + ' 的账。', dev: 10 } },
        { t: '关了，去找份上班的工作', dev: 15, fx: (g) => { CN.setJob(g, 'office', '公司职员'); g.stat('心情', 2); g.remember('ownRoute', 'quit'); }, res: '你把钥匙交还房东，买了两件衬衫，去面试了。' },
      ] },
    { id: 'm_35_none', age: 35, t: '找点事做', cond: (g) => cat(g) === 'none',
      text: '这些年你没有一份正经工作。家里人问起来，你总说再看看。',
      choices: [
        { t: '找份活干，先挣着', canon: true, fx: (g) => { CN.setJob(g, 'worker', CN.pick(['仓库理货员', '物业保安', '超市理货员', '保洁'])); g.remember('noneRoute', 'work'); }, res: '工资不高，按月发。你第一次觉得，有个地方要去也挺好。' },
        { t: '在家照顾一家老小', dev: 10, cond: (g) => married(g) || hasKid(g) || parentAlive(g), fx: (g) => { g.info('职业', '全职在家'); g.stat('人缘', 4); g.remember('noneRoute', 'home'); }, res: '一日三餐、接送、看病，都是你。没人给你发工资，也没人能离得开你。' },
        { t: '学门手艺，自己接活', dev: 20, check: ['学识', 35],
          fx: (g) => { spend(g, 8000); CN.setJob(g, 'freelance', CN.pick(['装修师傅', '修家电的', '做蛋糕的', '剪辑师'])); g.stat('事业', 6); g.remember('noneRoute', 'craft'); }, res: '学手艺花了 ¥8,000。半年后，你的名字开始在几个群里被人转来转去。“找他，手艺好。”',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('noneRoute', 'work'); CN.setJob(g, 'worker', '仓库理货员'); }, res: '学了半年没学成，你还是去了仓库。', dev: 5 } },
      ] },
    { id: 'm_36_parents', age: 36, t: '爸妈', auto: true, cond: (g) => parentAlive(g),
      text: (g) => {
        const two = parents(g).length > 1;
        const a = two ? '爸妈都过了六十。' : CN.who(g, parents(g)[0], true) + (withPa(g) ? '的头发全白了。' : '守着老家的房子，另一半已经不在了。');
        const b = withPa(g) ? paThey(g) + '和你住在一起，早上你出门的时候，厨房里已经有了动静。'
          : sibs(g) ? '兄弟姐妹的群里，大家开始说起谁回家多、谁回家少。' : '你是独生子女，这件事你从小就知道意味着什么。';
        return a + b + (!withPa(g) && !atHome(g) && tier(g) <= 2 ? '老家离你一千多里。' : '');
      } },
    { id: 'm_36_money', age: 36, t: '闲钱', loc: 'home', cond: (g) => cash(g) >= 80000,
      text: (g) => '年底算账，卡里攒下了 ' + fmt(cash(g)) + '。' + (house(g) === 'mortgage' && owe(g) > 0 ? '房贷还欠 ' + fmt(owe(g) * 1e4) + '。' : '') + '同事都在聊基金，' + (married(g) ? spName(g) : pAlive(g, 'mo') ? '你妈' : '银行的柜员') + '说存定期最稳。',
      choices: [
        { t: '存定期，留着应急', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.remember('money36', 'safe'); g.remember('inv36', A); }, res: () => '你存了 ' + fmt(A) + ' 的三年定期。利息不多，晚上睡得着。' },
        { t: '提前还一部分房贷', dev: 10, cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.remember('money36', 'prepay'); g.remember('inv36', A); },
          res: (g) => '你提前还了 ' + fmt(A) + '。月供少了一截，那个月你' + (CN.hhCount(g) > 1 ? '请全家吃了顿火锅。' : '给自己买了一双好鞋。') },
        { t: '买基金', dev: 10, fx: (g) => { A = w1(cash(g) * 0.5); CN.invest(g, A, 'fund'); g.remember('money36', 'fund'); g.remember('inv36', A); }, res: () => '你分几只基金买了 ' + fmt(A) + '。手机上多了一个每天都想点开的软件。' },
        { t: '自己炒股', dev: 20, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'stock'); g.remember('money36', 'stock'); g.remember('inv36', A); }, res: () => '你开了户，转进去 ' + fmt(A) + '。午饭的时候，你开始看 K 线。' },
      ] },
    { id: 'm_37_crisis_echo', age: 37, t: '两年以后', auto: true,
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
        if (c === 'stay') return '那次降薪转岗以后，你在公司里一直很安静。又一轮优化，名单上还是没有你。你开始周末去学一门新东西。';
        if (c === 'small') return '小公司没撑过两年，你又换了一家。你发现自己已经很会换工作了，新老板很看重你。';
        if (c === 'shop') return '小店的生意时好时坏。熟客记得你的名字，你也记得他们爱吃什么。';
        if (c === 'home') return '在县里上班，下午五点半就到家了。你开始在院子里种菜。';
        if (c === 'idle') return '回老家以后，你在家待了一年多，后来托人进了一家厂里管仓库。';
        const s = g.recall('stableRoute');
        if (s === 'lead') return '当了中层以后，你的酒量和白头发一起长了。';
        if (s === 'lost') return '没竞聘上那件事，你后来很少想起。倒是那个人先调走了。';
        if (s === 'quit') return '下海的第二年，你总算没再赔钱。借的钱每个月按时在还。';
        if (s === 'steady') return '你还是坐在原来那张桌子前。窗外的树长高了一截。';
        const l = g.recall('laborRoute');
        if (l === 'skill') return '你成了厂里最吃香的维修工，半夜也有人打电话找你。';
        if (l === 'home') return '回老家以后，钱挣得少了，人胖了一圈。';
        if (l === 'grind') return '你又干了两年。体检单上多了几个箭头，存款也多了几位。';
        const o = g.recall('ownRoute');
        if (o === 'grow') return '两家店，你两头跑。第二家店这两年挣回了 ' + fmt(A) + '，账本换成了平板。';
        if (o === 'debt') return '那笔账还压着。你开始接一些以前看不上的小单，一笔一笔往回填。';
        if (o === 'quit') return '上班以后，你每个月十号等工资。你说这样睡得着觉。';
        if (o === 'steady') return '你的店还开在老地方。附近开开关关好几家，你还在。';
        const n = g.recall('noneRoute');
        if (n === 'home') return '家里的事全在你手上。' + (hasKid(g) ? '孩子说，家里最离不开的人是你。' : '家里人说，没你不行。');
        if (n === 'craft') return '找你干活的人要提前一个月排队了。';
        return '那份活你干下来了。每天准时出门，准时回家。';
      } },
    { id: 'm_37_kid2', age: 37, t: '再要一个', loc: 'home',
      cond: (g) => married(g) && kidsN(g) === 1 && hasKid(g) && kAge(g) >= 2 && g.recall('kidPlan') !== 'dink' && (CN.sexOf(g) === '女' ? g.age : g.ageOf('sp')) <= 40,
      text: (g) => kWho(g) + '问你，能不能给' + kHe(g) + '生个弟弟妹妹。' + (g.recall('kid2') === 'no' ? '当年你们说好只要一个。' : '') + '养大一个孩子，在' + where(g) + '少说要 ' + fmt(RAISE[tier(g)] || 600000) + '。',
      choices: [
        { t: '一个就够了', canon: true, fx: (g) => { g.remember('kid37', 'one'); g.stat('心情', 1); }, res: (g) => '你们把' + kn(g) + '小时候的衣服打包，送给了亲戚家。' },
        { t: '再要一个', dev: 15, check: ['健康', 45],
          fx: (g) => { CN.haveKid(g); g.remember('kid37', 'two'); g.stat('心情', 4); g.stat('健康', -3); }, res: (g) => '老二出生了，叫' + g.name('k2') + '。' + kn(g) + '趴在保温箱外面看了很久。',
          fail: { fx: (g) => { g.remember('kid37', 'tried'); g.stat('心情', -2); }, res: '试了一年多，没怀上。你们也就不强求了。', dev: 5 } },
      ] },

    /* 38 岁：婚姻 */
    { id: 'm_38_marriage', age: 38, t: '冷战', loc: 'home', cond: (g) => married(g),
      text: (g) => '你和' + spName(g) + '已经很久没好好说过话了。饭桌上，两个人各看各的手机。',
      choices: [
        { t: '就这么过吧', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('marriage', 'cold'); }, res: '日子照旧。家里很安静，安静得像一间旅馆。' },
        { t: '找个时间好好谈一次', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); g.remember('marriage', 'mended'); }, res: '你们在楼下的烧烤摊坐到半夜。说开了，也哭了。回家的路上，你们牵了手。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('marriage', 'cold'); }, res: '话说到一半就吵了起来。之后，你们更少说话了。', dev: 3 } },
        { t: '离婚', dev: 25,
          fx: (g) => {
            const kid = hasKid(g);
            g.unrel('妻子'); g.unrel('丈夫'); g.remember('love', 'divorced'); g.info('婚姻', '离异'); g.remember('marriage', 'split');
            if (kid) g.remember('custody', g.rnd() < 0.5 ? 'me' : 'ex');
            A = 0; B = 0; M = '';
            if (hv(g) > 0 && g.recall('custody') === 'me') { A = Math.max(0, Math.round((hv(g) - owe(g)) / 2) * 1e4); B = spend(g, A); M = 'keep'; }
            else if (hv(g) > 0) { CN.sellHouse(g); M = 'sold'; }
            if (cash(g) > 0) CN.pay(g, cash(g) / 2);
            g.stat('心情', -6);
          },
          res: () => '手续办得比想象中快。' + (M === 'keep' ? '房子留给你和孩子，你补给对方 ' + fmt(A) + (B ? '，其中 ' + fmt(B) + ' 是借的' : '') + '。' : M === 'sold' ? '房子卖了，钱一人一半。你又开始租房。' : '存款一人一半。') + '走出民政局，你们在门口站了一会儿，各自走了。' },
      ] },
    { id: 'm_38_single', age: 38, t: '三十八岁', cond: (g) => !married(g),
      text: (g) => (g.recall('love') === 'divorced' ? '离婚好几年了。' : g.recall('love') === 'widowed' ? '另一半走了好几年了。' : '三十八岁，你还是一个人。')
        + (parentAlive(g) ? paWord(g) + '在电话里换了个说法：“找个伴，老了有人说话。”' : '过年的时候，亲戚们换了个说法：“找个伴，老了有人说话。”'),
      choices: [
        { t: '听家里的，去相亲', canon: true, fx: (g) => { A = w1(Math.min(80000, hinc(g) * 0.3)); remarry(g, { origin: '相亲认识' }); spend(g, A); g.remember('marry38', 'match'); g.stat('心情', 1); },
          res: (g) => '见了第五个，是' + spName(g) + '。你们都没说爱不爱，只说合适。半年后领了证，酒席简单办了几桌，花了 ' + fmt(A) + '。' },
        { t: '一个人也挺好', dev: 15, fx: (g) => { g.info('婚姻', g.recall('love') === 'divorced' ? '离异，单身' : g.recall('love') === 'widowed' ? '丧偶' : '单身'); g.stat('心情', 4); g.remember('marry38', 'alone'); },
          res: '你给自己买了一个好一点的床垫，养了一盆不会死的绿萝。' },
        { t: '等一个聊得来的人', dev: 10, check: ['人缘', 50],
          fx: (g) => { remarry(g, { origin: '朋友介绍认识' }); spend(g, 30000); g.stat('心情', 6); g.remember('marry38', 'love'); }, res: (g) => '朋友聚会上，' + spName(g) + '坐在你旁边。你们从一部老电影聊到了天亮。第二年，你们领了证，请朋友们吃了顿饭。',
          fail: { fx: (g) => { g.stat('心情', -2); g.remember('marry38', 'alone'); }, res: '那个人一直没出现。后来你也不等了，日子照样过得有滋味。', dev: 3 } },
      ] },
    { id: 'm_39_love_echo', age: 39, t: '这一年', auto: true, cond: (g) => !!(g.recall('marriage') || g.recall('marry38')),
      fx: (g) => { const m = g.recall('marriage'); if (m === 'cold') g.stat('健康', -2); if (m === 'mended') g.stat('心情', 3); },
      text: (g) => {
        const m = g.recall('marriage');
        if (m === 'mended' && married(g)) return '那次长谈以后，你们周末会一起去买菜。' + spName(g) + '记得你不吃香菜。';
        if (m === 'cold' && married(g)) return '你们还在一个屋檐下。你开始失眠，后来学会了睡前去楼下走两圈。';
        if (m === 'split') return g.recall('custody') === 'me' ? '离婚以后，孩子跟你。早上做两份早饭，晚上听写单词，一个人顶两个人用。孩子说你做的蛋炒饭最好吃。' : g.recall('custody') === 'ex' ? '离婚以后，孩子跟了对方。每个周六是你的，你提前一周就想好去哪儿。' : '离婚以后，你的屋子空了一半。你把另一半堆满了书。';
        const l = g.recall('marry38');
        if (l === 'match' && married(g)) return '相亲结婚的日子，比你想的平静。两个人各让一步，也过得下去。';
        if (l === 'love' && married(g)) return '晚了几年遇见的人，你格外珍惜。';
        if (!married(g)) return '你的日子很自由。周末去爬山，晚上看书，生病了也有朋友来送粥。';
        return '这一年平平淡淡地过去了。';
      } },
    { id: 'm_39_money_echo', age: 39, t: '那笔钱', auto: true, cond: (g) => !!g.recall('money36'),
      text: (g) => {
        const m = g.recall('money36'), p = Number(g.recall('inv36')) || 0, v = invested(g);
        if (m === 'prepay') return '提前还的那 ' + fmt(p) + '，让你每个月多出一点喘气的空间。' + (owe(g) > 0 ? '房贷还剩 ' + fmt(owe(g) * 1e4) + '。' : '房贷已经还清了。');
        if (m === 'safe') return '定期到期了，' + fmt(p) + ' 多了一点利息。你又存了三年。';
        if (!v) return '当年投进去的 ' + fmt(p) + '，后来你都取了出来。';
        return (v >= p ? '三年过去，当年投进去的 ' + fmt(p) + '，现在是 ' + fmt(v) + '。你没跟别人炫耀。' : '三年过去，当年投进去的 ' + fmt(p) + '，现在只剩 ' + fmt(v) + '。你不怎么打开那个软件了。');
      } },

    /* 40 岁 */
    { id: 'm_40_nokid', age: 40, t: '孩子', loc: 'hospital', cond: (g) => married(g) && kidsN(g) === 0,
      text: '你们结婚好些年了，一直没有孩子。双方父母不再当面问，只是叹气。',
      choices: [
        { t: '去医院试试', canon: true, check: ['健康', 50],
          fx: (g) => { M = spend(g, 120000); CN.haveKid(g); g.stat('心情', 8); g.remember('nokid', 'ivf'); }, res: () => '跑了一年多医院，花了 ¥12 万' + (M ? '，借了 ' + fmt(M) : '') + '。孩子哭出声的那一刻，你蹲在走廊上哭了。',
          fail: { fx: (g) => { spend(g, 90000); g.stat('心情', -6); g.remember('nokid', 'failed'); }, res: '试了三次，花了 ¥9 万，都没成。最后一次出来，你们谁也没说话。', dev: 0 } },
        { t: '不要了，两个人过', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('nokid', 'dink'); }, res: '你们把多出来的那间屋改成了书房。' },
        { t: '领养一个', dev: 25, fx: (g) => { spend(g, 20000); CN.haveKid(g, { born: g.Y - 3, origin: '领养的孩子' }); g.stat('人缘', 4); g.remember('nokid', 'adopt'); }, res: '手续跑了大半年。孩子第一次叫你的时候，叫得很小声。你答应得很大声。' },
      ] },
    { id: 'm_40_body', age: 40, t: '四十', cond: (g) => !(married(g) && kidsN(g) === 0),
      text: '四十岁生日那天，你爬了三层楼，喘得厉害。镜子里的人，肚子先到了。',
      choices: [
        { t: '照旧，忙完这阵再说', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('body40', 'ignore'); }, res: '这一阵一直没忙完。' },
        { t: '开始跑步', dev: 10, fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); g.remember('body40', 'run'); }, res: '第一天跑了一公里。第二天腿疼得下不了楼，第三天你又去了。' },
        { t: '犒劳一下自己，买辆好车', dev: 10, cond: (g) => cash(g) >= (CAR[tier(g)] || 200000) * 1.5,
          fx: (g) => { A = CAR[tier(g)] || 200000; spend(g, A); g.stat('心情', 5); g.remember('body40', 'car'); }, res: () => '新车 ' + fmt(A) + '，停在楼下。那天晚上你下楼看了它好几次。' },
      ] },
    { id: 'm_41_body_echo', age: 41, t: '身体', auto: true, cond: (g) => !!(g.recall('body40') || g.recall('nokid') || g.recall('kid37')),
      fx: (g) => { if (g.recall('body40') === 'run') g.stat('健康', 3); if (g.recall('body40') === 'ignore') g.stat('健康', -2); },
      text: (g) => {
        const n = g.recall('nokid'), k = g.recall('kid37');
        if (n === 'ivf') return '家里多了一个小人，你的觉少了一半。四十多岁当爸妈，抱孩子的时候腰会响。';
        if (n === 'failed') return '那件事以后，你们去了一趟很远的地方。回来的时候，好像放下了一些。';
        if (n === 'dink') return '同龄人都在聊补习班。你们在聊下一次去哪儿。';
        if (n === 'adopt') return '孩子慢慢不怕生了，会在你下班的时候扑过来。';
        if (k === 'two') return '老二会走路了，跟在' + kn(g) + '后面跑。家里的开销多了一截，笑声也多了一截。';
        if (k === 'tried') return '那件事以后，你们把心思都放在' + kn(g) + '身上。周末三个人去爬山。';
        const b = g.recall('body40');
        if (b === 'run') return '跑了一年，你瘦了十几斤。小区里跑步的人见了你会打招呼。';
        if (b === 'car') return '新车开了一年，后备箱里多了' + (hasKid(g) ? '孩子的玩具、' : '') + (parentAlive(g) ? '老人的药、' : '') + '一箱一箱的矿泉水。';
        return '体检的箭头又多了两个。你把报告折起来塞进了抽屉。';
      } },

    /* 42 岁：第二波 */
    { id: 'm_42_office', age: 42, t: '第二个十年', loc: 'office', cond: (g) => cat(g) === 'office',
      text: '你所在的行当又变了样。很多活交给了 AI，剩下的人要么带着 AI 干活，要么被 AI 带着干活。',
      choices: [
        { t: '熬着，当个中层', canon: true, fx: (g) => { g.stat('事业', 5); g.stat('健康', -2); g.remember('career42', 'mid'); }, res: '你手下有了几个人，也有了更多的会。' },
        { t: (g) => '转去做 AI 训练（培训 ¥1.2 万，' + CN.jobLine(g, 'tech', null, 8) + '）', dev: 20, check: ['学识', 55],
          fx: (g) => { spend(g, 12000); CN.setJob(g, 'tech', 'AI 训练师'); g.stat('事业', 8); g.remember('career42', 'pivot'); }, res: '培训花了 ¥1.2 万。你把十几年的行业经验教给机器。它学得很快，你也学了不少。',
          fail: { fx: (g) => { spend(g, 12000); g.stat('心情', -3); g.remember('career42', 'mid'); }, res: '培训考核没过，¥1.2 万打了水漂。你回到原来的位置，假装没去过。', dev: 5 } },
        { t: (g) => '离开大城市，回老家（工资少一半，约 ' + fmt(mPay(g, 'office', 3)) + '/月，通勤十分钟）', dev: 20, cond: (g) => tier(g) <= 2 && !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'office', '老家的公司职员'); g.stat('心情', 5); g.remember('career42', 'home'); }, res: '你在老家找了一份工资少一半的工作。通勤从一个半钟头变成了十分钟。' },
      ] },
    { id: 'm_42_stable', age: 42, t: '调动', cond: (g) => cat(g) === 'stable',
      text: '单位要选人去偏远的县里帮扶三年，有补贴。报了名的，回来提拔优先。',
      choices: [
        { t: '不去，家里离不开', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: (g) => '你把报名表还了回去。' + (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? '那三年，你没错过孩子的一次家长会。' : '那三年，家里的大事小事都有你。') },
        { t: '报名去', dev: 20, fx: (g) => { g.move('county', '偏远的山区县'); g.stat('事业', 10); g.stat('人缘', -3); g.remember('career42', 'remote'); }, res: '你带着两个箱子上了山。那里的人说话你一开始听不懂。' },
        { t: (g) => '出来自己干（本钱 ' + fmt(w1((SHOP[tier(g)] || 150000) * 1.2)) + '，铁饭碗没了，' + CN.jobRisk('boss') + '）', dev: 25, cond: (g) => ['teacher', 'doctor', 'nurse'].includes(job(g)),
          fx: (g) => { A = w1((SHOP[tier(g)] || 150000) * 1.2); M = spend(g, A); CN.setJob(g, 'boss', job(g) === 'teacher' ? '自己办辅导班' : '开了一家诊所'); g.remember('career42', 'private'); },
          res: () => '你辞掉了铁饭碗，投进去 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。招牌挂上去那天，你在门口站了很久。' },
      ] },
    { id: 'm_42_labor', age: 42, t: '换个活法', cond: (g) => cat(g) === 'labor',
      text: '老乡打电话来，说有个铺面，问你要不要合伙，每人出 ¥8 万。另一个老乡说，南边有个大工地，一个月顶这里两个月。',
      choices: [
        { t: '哪儿也不去，接着干', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('事业', 2); g.remember('career42', 'grind'); }, res: '你还在老地方。门口卖早点的换了三拨人，都认得你。' },
        { t: (g) => '和老乡合伙开店（出 ¥8 万，' + CN.jobRisk('shop') + '）', dev: 15, cond: (g) => cash(g) >= 60000,
          fx: (g) => { M = spend(g, 80000); CN.setJob(g, 'shop', '和老乡合伙开店'); g.remember('career42', 'shop'); }, res: () => '你出了 ¥8 万' + (M ? '，差的 ' + fmt(M) + ' 是借的' : '') + '。你们开了一家面馆，你负责后厨，他负责算账。' },
        { t: (g) => '去更远的地方（约 ' + fmt(mPay(g, job(g), 1, 6)) + '/月，一年回一次家）', dev: 15, fx: (g) => { CN.goCity(g, 1); g.stat('事业', 6); g.stat('人缘', -4); g.remember('career42', 'far'); },
          res: (g) => '你去了' + g.recall('workCity') + '。一年回一次家，' + (hasKid(g) && kAge(g) < 15 ? '孩子见你要先愣一下。' : '家里人在车站接你，你瘦了一圈。') },
      ] },
    { id: 'm_42_own', age: 42, t: '新路子', cond: (g) => cat(g) === 'own',
      text: '做生意的朋友都在开直播，说一晚上能卖掉你一个月的货。',
      choices: [
        { t: '老老实实做老客户', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: '你的客户大多跟了你十年。他们说，就信你。' },
        { t: '自己上镜开直播', dev: 15, check: ['人缘', 45],
          fx: (g) => { spend(g, 20000); g.stat('事业', 8); g.remember('career42', 'live'); }, res: '买灯、买设备花了 ¥2 万。第一晚只有十三个人看。三个月后，有人在街上认出了你。',
          fail: { fx: (g) => { spend(g, 20000); g.stat('心情', -3); g.remember('career42', 'steady'); }, res: '对着镜头，你一句话也说不利索。¥2 万的设备收进了柜子。', dev: 5 } },
        { t: '交给合伙人，自己歇两年', dev: 15, fx: (g) => { g.stat('心情', 5); g.stat('事业', -5); g.remember('career42', 'rest'); }, res: '你第一次在工作日的上午去公园。原来上午的公园这么多人。' },
      ] },
    { id: 'm_42_none', age: 42, t: '出去做点事', cond: (g) => cat(g) === 'none',
      text: '社区里贴了招工启事：居家养老服务员，培训上岗，离家近。',
      choices: [
        { t: '还是在家', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'stayhome'); }, res: '你把启事拍下来发给了邻居。' },
        { t: '去报名', dev: 15, fx: (g) => { CN.setJob(g, 'worker', '养老服务员'); g.remember('career42', 'work'); }, res: '你每天去几户老人家里，量血压、陪着说话。有个老太太总把你叫成她女儿的名字。' },
      ] },
    { id: 'm_43_career_echo', age: 43, t: '工作', auto: true, cond: (g) => !!g.recall('career42'),
      fx: (g) => { const c = g.recall('career42'); A = 0; if (c === 'far') g.stat('人缘', -2); if (c === 'live' || c === 'pivot') g.stat('事业', 3); if (c === 'remote') { A = w1(myInc(g) * 0.3); CN.earn(g, A); } },
      text: (g) => ({
        mid: '你的会越开越多，代码、方案、报表都交给了 AI，你负责对它们说“不行，重来”。',
        pivot: '做 AI 训练的这一年，你见到的年轻人都管你叫前辈。',
        home: '回老家的第一年，你胖了，也睡得着了。',
        steady: cat(g) === 'own' ? '店里又过了一年。老客户还在，有的已经带着孩子来了。' : '你在原单位又过了一年，一切都和去年差不多。',
        stayhome: '你还是在家忙里忙外。那张招工启事，邻居后来去了，常来跟你讲那些老人的事。',
        remote: '山区县的帮扶，你带出了一条路、一所小学的新食堂，攒下 ' + fmt(A) + ' 的补贴。走的时候，有人往你车里塞了两只鸡。',
        private: '自己干的头一年最难。第二年，回头客多了起来。',
        grind: '你又干了一年。工友换了好几茬，你成了最老的那个，新人都找你请教。',
        shop: '面馆的招牌被油烟熏黄了。中午十二点，门口排队。',
        far: '在外地的一年，你攒下了钱，也攒下了和家里越来越短的视频通话。',
        live: '直播间里叫你“哥”“姐”的人越来越多，你记不住他们的名字，他们记得你的。',
        rest: '歇了一年，你重新回店里看了看。合伙人把店打理得还行，你有点放心，也有点失落。',
        work: '照顾老人的活不轻松。你常想，等自己老了，会是谁来敲门。',
      }[g.recall('career42')] || '工作上，这一年平平稳稳。') },

    /* 44 岁：房子 */
    { id: 'm_44_buy', age: 44, t: '房子', cond: (g) => ['none', 'rent'].includes(house(g)),
      text: (g) => '你在' + where(g) + '租房住了这么多年。' + (hasKid(g) && !kidAway(g) && kAge(g) >= 4 && kAge(g) < 18 ? kn(g) + '问你：我们什么时候有自己的家？' : '房东说要卖房，让你考虑一下。')
        + '这里一套普通的房子要 ' + fmt(CN.price(g) * 1e4) + '，你卡里有 ' + fmt(Math.max(0, cash(g))) + '。',
      choices: [
        { t: '接着租，不背债', canon: true, fx: (g) => { g.remember('house', 'rent'); g.stat('心情', 2); g.remember('house44', 'rent'); }, res: '你换了一套离单位近的。钱留在手里，你觉得踏实。' },
        { t: '换套便宜点的房子，攒两年首付', dev: 10, fx: (g) => { g.remember('house44', 'save'); g.stat('心情', -1); }, res: '你搬到了远一点的小区，房租省了三分之一。每个月发了工资，先往买房的卡里转一笔。' },
        { t: '回老家县城买一套', dev: 10, cond: (g) => tier(g) <= 3 && cash(g) >= CN.price(g, 4) * 0.3e4 && (cash(g) >= CN.price(g, 4) * 1.1e4 || canLoan(g, CN.price(g, 4) * 0.7)),
          fx: (g) => { const p = CN.price(g, 4); const down = cash(g) >= p * 1.1e4 ? 1 : 0.3; A = p * down * 1e4; CN.buyHouse(g, { tier: 4, price: p, down }); g.remember('house44', 'county'); },
          res: (g) => (house(g) === 'own' ? '县城的房子 ' + fmt(A) + '，你一次付清了。' : '首付 ' + fmt(A) + '，剩下的贷款。') + '钥匙拿到手，你在空荡荡的客厅里坐了一下午。' },
        { t: '就在这儿，咬牙买', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.2e4 && canLoan(g, CN.price(g) * 0.7),
          fx: (g) => { const c0 = cash(g); A = CN.price(g) * 0.3e4; CN.buyHouse(g, { down: 0.3 }); B = cover(g, c0); g.remember('house44', 'bought'); },
          res: () => '首付 ' + fmt(A) + (B ? '，掏空了积蓄，又找亲戚借了 ' + fmt(B) : '，掏空了积蓄') + '。合同签完，你算了算，房贷要还到六十多岁。' },
      ] },
    { id: 'm_44_loan', age: 44, t: '房贷', cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
      text: (g) => '房贷还欠 ' + fmt(owe(g) * 1e4) + '，一年要还 ' + fmt((Number(g.recall('loanBase')) || owe(g)) * 0.065e4) + '。' + (tier(g) <= 2 ? '小区的房价比你买的时候跌了一些。' : '') + '每个月照样扣。',
      choices: [
        { t: '接着还', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('house44', 'pay'); }, res: '你把扣款日设在发工资的第二天，眼不见心不烦。' },
        { t: '攒了一笔，提前还一部分', dev: 10, cond: (g) => cash(g) >= 150000,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.stat('心情', 4); g.remember('house44', 'early'); },
          res: (g) => '你提前还了 ' + fmt(A) + '。月供少了一截，那个月你' + (CN.hhCount(g) > 1 ? '请全家吃了顿火锅。' : '给自己买了一双好鞋。') },
        { t: '卖了，换一套小的', dev: 15, cond: (g) => hv(g) > 0,
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 0.6); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: cash(g) >= p * 1e4 ? 1 : 0.3 }); cover(g, c0); g.remember('house44', 'small'); },
          res: (g) => (house(g) === 'own' ? '换了一套小两室，房贷没了，你一下子轻了二十斤似的。' : '换了一套小两室，房贷少了一大半。') },
        { t: '卖了旧房，换一套大的', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= hv(g) * 1.5 * 0.3e4 && canLoan(g, hv(g) * 1.05 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 1.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => '你换了一套三室的。' + kn(g) + '有了自己的房间，房贷又从头算起' + (B ? '，还找亲戚借了 ' + fmt(B) : '') + '。' },
      ] },
    { id: 'm_44_own', age: 44, t: '房子的事', cond: (g) => ['own', 'hometown'].includes(house(g)),
      text: (g) => '房子是自己的了' + (hv(g) ? '，值 ' + fmt(hv(g) * 1e4) : '') + '。有人劝你再买一套收租，有人劝你换套大的。',
      choices: [
        { t: '留着自己住，不折腾', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('house44', 'keep'); }, res: '你把阳台改成了一个小花园。' },
        { t: '再买一套小的出租', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.7 * 0.3e4 && canLoan(g, CN.price(g) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g) * 0.7); A = p * 0.3e4; addHouse(g, p, 0.3); g.remember('rental', k1(p * 1e4 * 0.02)); g.remember('house44', 'second'); },
          res: (g) => '你在附近买了一套小户型，首付 ' + fmt(A) + '。租客是一对刚毕业的小夫妻，每月租金 ' + fmt((Number(g.recall('rental')) || 0) / 12) + '。' },
        { t: '换套大的', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && cash(g) + hv(g) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => '你卖了旧房，换了一套三室的。' + kn(g) + '有了自己的房间，你又背上了房贷' + (B ? '，还借了 ' + fmt(B) : '') + '。' },
        { t: '把房子过户给孩子', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 3); g.remember('house44', 'gift'); },
          res: (g) => (kAge(g) < 12 ? '过户那天，孩子还小，不明白这张纸是什么。你说，是你的家。' : kn(g) + '看着房产证上自己的名字，半天没说话。') },
        { t: '花钱把房子翻新一下', dev: 10, cond: (g) => !hasKid(g),
          fx: (g) => { A = w1(Math.max(50000, hv(g) * 1e4 * 0.08)); spend(g, A); g.stat('心情', 4); g.remember('house44', 'renov'); }, res: () => '翻新花了 ' + fmt(A) + '。新铺的木地板，你光脚走了好几圈。' },
      ] },
    { id: 'm_45_checkup', age: 45, t: '体检报告', loc: 'hospital',
      text: (g) => (cat(g) === 'labor' || cat(g) === 'own' || cat(g) === 'none' ? '社区免费体检' : '单位体检') + '，报告上有一行加粗的字：' + CN.pick(['甲状腺结节，建议复查', '血压偏高', '血糖偏高', '脂肪肝，中度']) + '。' + (g.recall('body40') === 'run' ? '医生说幸亏你在运动，不然更糟。' : ''),
      choices: [
        { t: '开点药吃着', canon: true, fx: (g) => { g.stat('健康', 1); g.remember('check45', 'pills'); }, res: '药盒子摆在餐桌上，早一粒，晚一粒。' },
        { t: '彻底改作息', dev: 10, fx: (g) => { g.stat('健康', 6); g.stat('心情', -2); g.remember('check45', 'change'); }, res: '你戒了夜宵，十一点前睡觉。头一个月，你天天饿着入睡。' },
        { t: '不当回事', dev: 10, fx: (g) => { g.stat('健康', -4); g.remember('check45', 'ignore'); }, res: '你说谁还没点毛病。报告拍照存进相册，就再没点开过。' },
      ] },
    { id: 'm_46_house_echo', age: 46, t: '家', auto: true, cond: (g) => !!g.recall('house44'),
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
        if (h === 'save') return M === 'bought' ? '攒了两年，首付 ' + fmt(A) + ' 凑齐了。你在' + where(g) + '买下一套小两居，搬家那天下着小雨。' : M === 'still' ? '攒了两年，首付还差一截。你没急，房价这两年也没涨。' : '攒下的那笔钱，后来派上了别的用场。';
        return ({
          county: '县城的房子大部分时间空着，你每年回去住几天，开窗、拖地、晒被子。',
          rent: '你又搬了一次家。家当越来越少，你说这样挺好。',
          bought: '每个月扣房贷的那天，你一整天都不想花钱。不过晚上回家，开门的是自己的锁。',
          pay: '房价又变了一点。你已经不看了，只看还剩多少期。',
          early: '提前还的那笔钱，让你每个月多出一点喘气的空间。',
          small: '小房子收拾起来很快。你发现以前那么大的房子，一大半是用来放东西的。',
          swap: '新家的房间多了，' + (hasKid(g) ? '孩子在门上贴了一张“请敲门”。' : '你在最小的那间放了一张书桌。'),
          keep: '阳台上的花开了一茬又一茬。',
          second: '出租的那套换了第二拨租客。这两年的房租一共 ' + fmt(A) + '，按时到账。',
          gift: '房产证上是孩子的名字。你觉得这件事，你办成了。',
          renov: '翻新过的房子住着舒服，朋友来了都说像新家。',
        }[h] || '');
      } },
    { id: 'm_47_ai', age: 47, t: '又一波', loc: 'office', cond: (g) => !['none', 'farmer', 'retired'].includes(job(g)),
      text: (g) => (cat(g) === 'stable' ? '单位里上了一套新系统，很多活不用人做了。领导说要“精简”。' : cat(g) === 'own' ? '新开的无人店就在你隔壁，二十四小时不关门。' : '新闻上说，又一批岗位被机器人和 AI 接手了。你的工作也在名单的边上。'),
      choices: [
        { t: '硬扛着，少拿点也干', canon: true, fx: (g) => { g.stat('事业', -5); g.stat('心情', -2); g.remember('ai47', 'hold'); }, res: '收入又少了一截。你学会了在每一笔开销前多想三秒。' },
        { t: '去学新东西', dev: 15, check: ['学识', 50],
          fx: (g) => { spend(g, 10000); g.stat('事业', 6); g.stat('学识', 3); g.remember('ai47', 'learn'); }, res: '学费 ¥1 万。四十七岁，你和二十岁的人坐在一个培训班里。下课的时候，他们来问你题。',
          fail: { fx: (g) => { spend(g, 10000); g.stat('心情', -3); g.remember('ai47', 'hold'); }, res: '你听了几节课，跟不上，又回去守着原来的活。', dev: 3 } },
        { t: '不干了，提前退下来', dev: 20, cond: (g) => owe(g) <= 20 && cash(g) + invested(g) >= 200000, fx: (g) => { CN.setJob(g, 'freelance', '提前退下来，偶尔接点零活'); g.stat('事业', -10); g.stat('心情', 4); g.remember('ai47', 'out'); }, res: '你交了工牌。第二天早上，你不知道该干什么，就去菜市场转了一圈。' },
      ] },
    { id: 'm_47_land', age: 47, t: '地', cond: (g) => job(g) === 'farmer' || (job(g) === 'none' && g.recall('hukou') === 'rural'),
      text: '村里来了合作社，要把各家的地连成一大片，用无人机播种、收割。流转出去，一亩一年给 ¥800。',
      choices: [
        { t: '把地流转出去，拿租金', canon: true, fx: (g) => { CN.earn(g, 8000); g.stat('健康', 2); g.remember('land', 'rent'); }, res: '你家十亩地，头一年的租金 ¥8,000 打到了卡上。秋天，你在地头看机器收麦子。' },
        { t: '自己承包一大片', dev: 20, check: ['事业', 30],
          fx: (g) => { borrow(g, 15); g.stat('事业', 10); CN.setJob(g, 'farmer', '种粮大户'); g.remember('land', 'big'); }, res: '你贷款 ¥15 万买了无人机，学会了看手机上的土壤数据。村里人叫你“大户”。',
          fail: { fx: (g) => { borrow(g, 15); g.stat('心情', -4); g.remember('land', 'rent'); }, res: '头一年赶上天旱，亏了。贷款还欠着，你把地又转了出去。', dev: 5 } },
        { t: '去城里，帮着家里人', dev: 15, fx: (g) => { CN.goCity(g, 3); g.remember('land', 'city'); g.stat('人缘', 2); }, res: (g) => '你锁上院门，去了' + g.recall('workCity') + '。城里的楼太高，你好几天找不到回家的路。' },
      ] },
    { id: 'm_48_check_echo', age: 48, t: '复查', auto: true, loc: 'hospital', cond: (g) => !!g.recall('check45'),
      fx: (g) => { const c = g.recall('check45'); if (c === 'change') g.stat('健康', 3); if (c === 'ignore') g.stat('健康', -5); },
      text: (g) => ({
        pills: '复查结果没变好，也没变坏。医生说，按时吃药，别熬夜。',
        change: '复查的时候，医生翻着你三年前的报告，说你这几年做对了。',
        ignore: '你去年没复查，今年晕了一回。医生看着你的片子，脸色不太好。',
      }[g.recall('check45')]) },
    { id: 'm_49_ai_echo', age: 49, t: '四十九', auto: true, cond: (g) => !!(g.recall('ai47') || g.recall('land')),
      fx: (g) => { if (g.recall('ai47') === 'learn') g.stat('事业', 3); if (g.recall('land') === 'big') g.stat('事业', 4); },
      text: (g) => {
        const a = g.recall('ai47');
        if (a === 'learn') return '学的那些新东西用上了。年轻人遇到难题，会说“问问老' + JY.byId[g.me].name[0] + '”。';
        if (a === 'out') return '提前退下来以后，你学会了做饭，学会了午睡，也学会了在别人上班的时候不心慌。';
        if (a === 'hold') return '你还在原来的岗位上。和你同期进来的人，只剩下两个。';
        const l = g.recall('land');
        if (l === 'big') return '你承包的地今年丰收。收购商的车排了半条村。';
        if (l === 'city') return '在城里住了两年，你在小区楼下的空地上偷偷种了几棵葱，被物业铲了。';
        return '地租每年准时打到卡上。你闲了，开始给村里修路的人送水。';
      } },

    /* ================= 50–64 岁 ================= */
    { id: 'm_51_parents', age: 51, t: '照顾了几年', cond: (g) => parentAlive(g) && !!g.recall('parentsCare'),
      text: (g) => {
        const p = g.recall('parentsCare'), w = paWord(g);
        return (p === 'self' && withPa(g) ? w + '和你住了几年。你的腰不好了，夜里也睡不整。'
          : p === 'nursing' ? w + '在养老院住了几年。每次你走，' + paThey(g) + '都送到门口。'
          : p === 'sibling' ? '兄弟姐妹照顾了' + w + '这几年，最近在电话里说，有点撑不住了。'
          : '隔着千里照看了几年，每次视频，' + w + '都说好，挂了电话你总不放心。') + '要不要换个法子？';
      },
      choices: [
        { t: '接着这样', canon: true, fx: (g) => { g.remember('care51', 'same'); g.stat('心情', -1); }, res: '你咬咬牙，说再坚持坚持。' },
        { t: '送去养老院', dev: 10, cond: (g) => g.recall('parentsCare') !== 'nursing',
          fx: (g) => { A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.remember('care51', 'changed'); g.stat('健康', 3); },
          res: () => '你挑了一家近的，一年 ' + fmt(A) + '。签合同的那天，你在车里坐了很久才开走。' },
        { t: '接回自己家', dev: 10, cond: (g) => g.recall('parentsCare') !== 'self' && !withPa(g),
          fx: (g) => { CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.remember('care51', 'changed'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => '你把' + paWord(g) + '接回了家。第一顿饭，' + (pAlive(g, 'mo') ? '母亲非要下厨。' : '父亲非要给你炒两个菜。') },
        { t: '请个护工搭把手', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('paAide', true); g.remember('care51', 'aide'); g.stat('健康', 2); },
          res: () => '护工阿姨一年 ' + fmt(A) + '。她来的第一个星期，你睡了几个整觉。' },
      ] },
    { id: 'm_52_care_echo', age: 52, t: '爸妈', auto: true, cond: (g) => !!g.recall('parentsCare') && parentAlive(g),
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
        const pre = g.recall('care51') === 'changed' ? '换了法子以后，' : '';
        if (p === 'self' && n) return pre + '和' + w + '住在一起的日子，饭桌上多了' + (n > 1 ? '两双' : '一双') + '筷子，也多了几次拌嘴。夜里起来给' + paThey(g) + '盖被子，你想起小时候' + paThey(g) + '也这样。' + (A ? '护工这一年又是 ' + fmt(A) + '。' : '');
        if (p === 'nursing') return pre + '养老院这一年又交了 ' + fmt(A) + '。护工跟你熟了，会把' + w + '的事一件件讲给你听。' + w + '慢慢也交了新朋友。';
        if (p === 'sibling') return '兄弟姐妹打电话来，说' + w + '想你了。你说下个月一定回去，这次真的回去了。';
        return '摄像头里，' + w + '对着镜头招手。' + paThey(g) + '知道你在看。';
      } },
    { id: 'm_53_money', age: 53, t: '攒下的钱', loc: 'home', cond: (g) => cash(g) >= 150000,
      text: (g) => '这些年总算攒下了一些，卡里有 ' + fmt(cash(g)) + (invested(g) > 0 ? '，理财里还有 ' + fmt(invested(g)) : '') + '。离退休还有十来年，怎么用，你想了很久。',
      choices: [
        { t: '存着养老', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.stat('心情', 2); g.remember('nest', 'save'); }, res: () => '你把 ' + fmt(A) + ' 分成几份，存了定期和国债。' },
        { t: '拿一部分买基金', dev: 10, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'fund'); g.remember('nest', 'fund'); }, res: () => '你买了 ' + fmt(A) + ' 的基金，说好十年不动。' },
        { t: '朋友拉你投一个项目', dev: 15, check: ['学识', 50],
          fx: (g) => { A = w1(cash(g) * 0.3); CN.earn(g, A * 0.6); g.remember('nest', 'invest'); }, res: () => '你投了 ' + fmt(A) + '，看准了一次。两年后分回来的钱，比本金多了六成。',
          fail: { fx: (g) => { A = w1(cash(g) * 0.3); spend(g, A); g.stat('心情', -5); g.remember('nest', 'lost'); }, res: () => '你投了 ' + fmt(A) + '。一个“稳赚”的项目，老板跑了。你在维权群里待了半年。', dev: 5 } },
        { t: '给孩子付首付', dev: 10, cond: (g) => hasKid(g) && kAge(g) >= 22 && g.recall('kidWed') !== 'paid',
          fx: (g) => { A = w1(Math.min(cash(g) * 0.5, CN.price(g, kidTier(g)) * 0.3e4)); spend(g, A); g.stat('人缘', 4); g.remember('nest', 'kid'); }, res: (g) => '你转了 ' + fmt(A) + '。' + kn(g) + '接过卡的时候没说话，抱了你一下。' },
      ] },
    { id: 'm_54_nest_echo', age: 54, t: '钱', auto: true, cond: (g) => !!g.recall('nest'),
      text: (g) => ({
        save: '定期里的钱慢慢长，现在是 ' + fmt(invested(g)) + '。你算了算，大概够了。',
        fund: '基金有涨有跌，账户里现在是 ' + fmt(invested(g)) + '。你学会了不天天看。',
        invest: '赚了那一笔以后，你收手了。朋友再来拉你，你都推了。',
        lost: '那笔钱没追回来。你后来跟谁都说：“稳赚的事，别信。”好在家里的日子没受大影响。',
        kid: '孩子搬进了新房，给你留了一间。你去住了两天，就想回自己家。',
      }[g.recall('nest')]) },
    { id: 'm_55_ill', age: 55, t: '病', loc: 'hospital', cond: (g) => g.s('健康') < 45,
      text: (g) => '一次检查，医生让家属单独进去。' + (g.recall('check45') === 'ignore' ? '十年前那张没当回事的报告，你又想起来了。' : '') + '是要动手术的病。医保报完，自己大概要掏 ' + fmt(g.recall('hukou') === 'rural' ? 60000 : 90000) + '。',
      choices: [
        { t: '去大医院做手术', canon: true, check: ['健康', 0], // 健康 15 以上成功率 95%
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; M = spend(g, A); g.stat('健康', 15); g.remember('ill55', 'surgery'); },
          res: (g) => '手术做了七个小时，花了 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。醒来的时候，' + (CN.alone(g) ? '朋友守在床边。' : '家里人都在。'),
          fail: { fx: (g) => { g.die('手术后没能醒过来'); }, res: '手术没能成功。', dev: 0 } },
        { t: '保守治疗，不开刀', dev: 15, fx: (g) => { spend(g, 20000); g.stat('健康', -5); g.stat('心情', 2); g.remember('ill55', 'conservative'); }, res: '你选了吃药、调养，一年药费 ¥2 万。医生说，这样也有这样的活法。' },
        { t: '瞒着孩子，自己扛', dev: 15, cond: (g) => hasKid(g) && kAge(g) >= 16,
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; spend(g, A); g.stat('心情', -5); g.stat('健康', 12); g.remember('ill55', 'hide'); },
          res: '你说出差几天，一个人住进了医院，手术费自己刷的卡。护士问家属呢，你说在路上。' },
      ] },
    { id: 'm_55_hobby', age: 55, t: '第二春', cond: (g) => g.s('健康') >= 45,
      text: (g) => (hasKid(g) && kAge(g) >= 16 ? '孩子大了，' : '') + '工作也不用再拼了。有人劝你找点自己喜欢的事。',
      choices: [
        { t: '照旧，上班下班', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('hobby55', 'none'); }, res: '你说等退休了再说。' },
        { t: '学摄影、书法这类东西', dev: 10, fx: (g) => { spend(g, 5000); g.stat('心情', 5); g.stat('学识', 2); g.remember('hobby55', 'art'); }, res: '你花 ¥5,000 买了一台二手相机。周末坐公交去郊外拍鸟。' },
        { t: '和老同学合伙做点小买卖', dev: 15, check: ['人缘', 50],
          fx: (g) => { M = spend(g, 80000); g.remember('hobby55', 'biz'); }, res: '你出了 ¥8 万。你们在老同学的老家开了一家农家乐，周末客人不少。',
          fail: { fx: (g) => { spend(g, 50000); g.stat('人缘', -3); g.remember('hobby55', 'none'); }, res: '合伙没两个月就散了，你赔了 ¥5 万，你们也不怎么联系了。', dev: 3 } },
      ] },
    { id: 'm_57_echo', age: 57, t: '这两年', auto: true, cond: (g) => !!(g.recall('ill55') || g.recall('hobby55')),
      fx: (g) => { A = 0; if (g.recall('hobby55') === 'art') g.stat('心情', 3); if (g.recall('ill55') === 'hide') g.stat('人缘', -2); if (g.recall('hobby55') === 'biz') { A = 60000; CN.earn(g, A); } },
      text: (g) => {
        const i = g.recall('ill55');
        if (i === 'surgery') return '手术两年了，复查都正常。你学会了慢慢吃饭，慢慢走路。';
        if (i === 'conservative') return '保守治疗的这两年，病没好，也没坏。你学会了和它一起过日子。';
        if (i === 'hide') return '孩子还是知道了。' + kn(g) + '在电话里哭着说：“你凭什么一个人扛？”那以后，' + kHe(g) + '每周都打电话来。';
        const h = g.recall('hobby55');
        if (h === 'art') return '你的照片被社区挑去办了个小展。你站在自己的照片前，假装是路过。';
        if (h === 'biz') return '农家乐这两年分了你 ' + fmt(A) + '。老同学说，等干不动了就交给年轻人。';
        return '日子还是那样，按部就班。';
      } },
    { id: 'm_58_work', age: 58, t: '最后几年', cond: (g) => !['none', 'retired'].includes(job(g)),
      text: '离退休还有几年。年轻人都觉得你该歇着了，你自己也这么觉得，又不完全这么觉得。',
      choices: [
        { t: '熬到退休', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('end58', 'stay'); }, res: '你把手头的活一件件交出去，教会了两个年轻人。' },
        { t: '换个轻松点的活', dev: 10, fx: (g) => { g.stat('健康', 3); g.stat('事业', -6); g.remember('end58', 'easy'); }, res: '你调去了不那么忙的岗位，钱少了一些。下班的时候，天还亮着。' },
        { t: '再拼一把', dev: 15, check: ['健康', 50],
          fx: (g) => { g.stat('事业', 8); CN.earn(g, w1(myInc(g) * 0.3)); g.remember('end58', 'push'); }, res: '你接下了一个大项目，年底多拿了一笔奖金。项目做成那天，你说这是你最后一次熬夜。',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('end58', 'easy'); }, res: '项目做到一半，你住进了医院。出院以后，你什么都不争了。', dev: 5 } },
      ] },
    { id: 'm_58_home', age: 58, t: '家里的事', cond: (g) => ['none', 'retired'].includes(job(g)),
      text: '家里的大事小事，现在都来找你拿主意。',
      choices: [
        { t: '照旧管着这个家', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('end58', 'family'); }, res: '你的手机里存着全家人的体检时间、生日和医保卡号。' },
        { t: '放手，让自己清闲点', dev: 10, fx: (g) => { spend(g, 8000); g.stat('心情', 4); g.remember('end58', 'free'); }, res: '你报了一个 ¥8,000 的旅行团，第一次自己出了远门。' },
      ] },
    { id: 'm_59_end_echo', age: 59, t: '五十九', auto: true, cond: (g) => !!g.recall('end58'),
      text: (g) => ({
        stay: '单位里开始有人叫你“老”什么。你带的两个年轻人，有一个已经能顶你的位置了。',
        easy: '轻松的岗位上，你开始学泡茶。办公室里的绿植是你在养。',
        push: '那个项目让你在行业里留了个名字。你却说，最得意的是那两年没错过一顿家里的晚饭。',
        family: '家里人说，有你在，家就乱不了。',
        free: '那次出远门回来以后，你又去了两次。你说，这辈子到现在才知道自己喜欢看海。',
      }[g.recall('end58')]) },
    { id: 'm_60_plan', age: 60, t: '以后住哪儿', loc: 'home',
      text: (g) => '六十岁了。离退休还有五年，你开始想以后的日子在哪里过。' + (hasKid(g) && g.recall('kidCity') ? kn(g) + '在' + g.recall('kidCity') + '。' : '') + (hv(g) ? '你的房子现在值 ' + fmt(hv(g) * 1e4) + '。' : ''),
      choices: [
        { t: '就在现在住的地方', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('plan60', 'stay'); }, res: '你熟悉这里的每一个菜摊。' },
        { t: '回老家，把老房子修一修', dev: 15, cond: (g) => !atHome(g) && !['sold', 'gave'].includes(g.recall('oldHouse')),
          fx: (g) => {
            A = 100000; spend(g, A);
            if (!hv(g)) settleOld(g, oldVal(g));
            backHome(g); g.remember('house', 'hometown');
            if (parentAlive(g)) CN.liveWith(g, parents(g));
            g.stat('心情', 4); g.remember('plan60', 'home');
          },
          res: (g) => '你花了 ' + fmt(A) + '，请人修了屋顶，在院子里搭了个葡萄架。' + (parentAlive(g) ? paWord(g) + '天天在葡萄架下坐着。' : '') },
        { t: '搬去孩子的城市', dev: 10, cond: (g) => hasKid(g) && !!g.recall('kidCity') && g.recall('kidCity') !== '国外' && g.recall('kidCity') !== where(g),
          fx: (g) => {
            const t = kidTier(g), p = Math.round(CN.price(g, t) * 0.5);
            M = '';
            if (hv(g) && cash(g) + (hv(g) - owe(g)) * 1e4 >= p * 1e4) { CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); M = 'buy'; }
            CN.goCity(g, t, g.recall('kidCity'));
            g.stat('人缘', 3); g.remember('plan60', 'kid');
          },
          res: (g) => (M === 'buy' ? '你卖了老房子，在' + g.recall('kidCity') + '买了一套小两居，离孩子走路十五分钟。' : '你在' + g.recall('kidCity') + '租了一套离孩子不远的房子，走路十五分钟。') },
        { t: '换套小房子，手头宽裕些', dev: 10, cond: (g) => house(g) === 'own' && hv(g) >= 40,
          fx: (g) => { const p = Math.round(hv(g) * 0.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); A = p * 1e4; g.remember('plan60', 'down'); },
          res: () => '大房子卖了，换了一套小的，差价 ' + fmt(A) + ' 存了起来。楼层低，有电梯，以后腿脚不好也不怕。' },
        { t: '退休以后，冬天去南方过', dev: 10, cond: (g) => !(house(g) === 'own' && hv(g) >= 40),
          fx: (g) => { g.stat('心情', 3); g.remember('plan60', 'south'); }, res: '你在手机上看了好几个海边小城的房租，收藏了一个又一个。' },
      ] },
    { id: 'm_61_plan_echo', age: 61, t: '新的日子', auto: true, cond: (g) => !!g.recall('plan60'),
      text: (g) => ({
        stay: '你在老地方又过了一年。楼下的保安换了，新来的那个已经认得你了。',
        home: '回老家的第一年，你认出了小时候爬过的那棵树。它比你记得的矮。',
        kid: '你每周去孩子家两次，带一锅汤。孩子说，以后别带了，又说，下次多带一点。',
        down: '小房子收拾起来不费劲。多出来的钱，你给自己报了个老年大学的预备班。',
        south: '冬天你去南边住了一个月，租的房子推开窗就是海。回来的时候，晒黑了一圈。',
      }[g.recall('plan60')]) },
    { id: 'm_63_sib', age: 63, t: '兄弟姐妹', cond: (g) => sibs(g),
      text: (g) => '你的兄弟姐妹来电话，说病了，治病要 ' + fmt(w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000))) + '，问你能不能帮一把。',
      choices: [
        { t: '借', canon: true, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000)); spend(g, A); g.stat('人缘', 5); g.remember('sibLoan', 'yes'); }, res: () => '你转了 ' + fmt(A) + '，说不用还。电话那头哭了。' },
        { t: '帮着找医院，钱借一半', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000) / 2); spend(g, A); g.stat('人缘', 2); g.remember('sibLoan', 'help'); }, res: () => '你托人挂到了大医院的号，转了 ' + fmt(A) + '。另一半说再想办法。' },
        { t: '不借', dev: 15, fx: (g) => { g.stat('人缘', -6); g.remember('sibLoan', 'no'); }, res: '你说你自己也难。挂了电话，你在阳台上站了很久。' },
      ] },
    { id: 'm_63_only', age: 63, t: '独生子女的晚年', cond: (g) => !sibs(g),
      text: '你没有兄弟姐妹。以后的事，你得早点自己打算。',
      choices: [
        { t: '交给孩子', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 2); g.remember('selfCare', 'kid'); }, res: '你把存折放在哪儿、密码是什么，都告诉了孩子。' },
        { t: '给自己买一份养老保险', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.2, 30000), 300000)); spend(g, A); g.remember('selfCare', 'insure'); }, res: () => '保费一次交了 ' + fmt(A) + '。合同很厚，你一页页看完了。' },
        { t: '和老朋友约好，互相照应', dev: 15, fx: (g) => { g.stat('人缘', 4); g.remember('selfCare', 'friends'); }, res: '你们几个老朋友拉了个群，叫“养老互助组”。每天早上，群里要有人说一声早。' },
      ] },
    { id: 'm_64_eve', age: 64, t: '退休前一年', auto: true,
      fx: (g) => {
        if (g.recall('sibLoan') === 'yes' || g.recall('selfCare') === 'friends') g.stat('心情', 2);
        if (owe(g) > 0) g.stat('心情', -2);
      },
      text: (g) => {
        const bits = [];
        const s = g.recall('sibLoan');
        if (s === 'yes') bits.push('兄弟姐妹的病好了，过年的时候，他们拎着两只鸡来看你。');
        if (s === 'no') bits.push('那次没借钱以后，兄弟姐妹的群里，你的消息很少有人回。过年时，你还是给他们寄了年货。');
        if (s === 'help') bits.push('兄弟姐妹的病治好了。借的钱，他们一点一点还给了你。');
        const c = g.recall('selfCare');
        if (c === 'friends') bits.push('“养老互助组”的群里，每天早上都有人说早。');
        if (c === 'insure') bits.push('保险的单子你锁在了抽屉里。');
        if (owe(g) > 0) bits.push('还欠着 ' + fmt(owe(g) * 1e4) + '，你打算退休金下来慢慢还。');
        else bits.push('欠的账都还清了' + (cash(g) + invested(g) > 0 ? '，手里攒着 ' + fmt(cash(g) + invested(g)) : '') + '。你在日历上圈出了明年退休的那一天。');
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
  const POST40 = { tech: '技术总监', office: '部门经理', sales: '大区经理', civil: '科长', teacher: '教导主任', doctor: '科室副主任', nurse: '科护士长', worker: '车间主任', driver: '车队队长', rider: '站长', soldier: '营职干部' };
  const EXPERT40 = { tech: '首席工程师', doctor: '副主任医师', teacher: '高级教师', nurse: '副主任护师', worker: '技师', office: '业务专家' };
  const TOP50 = { tech: '公司副总', office: '分公司总经理', sales: '销售副总', civil: '副处长', teacher: '副校长', doctor: '科室主任', nurse: '护理部主任', worker: '厂长助理', driver: '运输部经理', rider: '区域经理', soldier: '团职干部' };
  const FR = { 1: 400000, 2: 300000, 3: 200000, 4: 150000, 5: 100000 };
  const frKind = (g) => pk(g, ['便利店', '快餐店', '药店', '洗衣店', '烘焙店'], 31);
  const coopCrop = (g) => pk(g, { 西南: ['猕猴桃', '茶叶', '花椒'], 华南: ['荔枝', '百香果', '茶叶'], 华东: ['草莓', '茶叶', '蓝莓'], 华中: ['小龙虾', '脐橙', '莲藕'], 华北: ['苹果', '小米', '大棚蔬菜'], 东北: ['大米', '木耳', '蓝莓'], 西北: ['苹果', '枸杞', '牛羊肉'] }[g.recall('region')] || ['大棚蔬菜', '水果'], 32);
  const onlineItem = (g) => pk(g, ['家乡的特产', '自己做的手工', '老本行的工具配件', '中老年衣服'], 33);
  // 能叫来帮忙的家里人：兄弟姐妹、成年的孩子、配偶
  const helperM = (g) => ['sib0', 'sib1'].find((id) => pAlive(g, id) && g.ageOf(id) < 65) || (hasKid(g) && kAge(g) >= 20 ? 'k1' : married(g) ? 'sp' : '');
  const helpWho = (g, id) => CN.who(g, id).replace(/^你的/, '');

  /* ---------- 孩子、父母、配偶、行情：按他们的年纪或运气发生，用意外的形式（一世只发生一次） ----------
   * 抉择类的意外写 ok（基础条件），下面统一包成 cond：这一年没有中年的固定抉择，排在前面的意外也没轮上，才轮到它。 */
  const ENCS = [
    { id: 'e_m_parent_ill', y: [2026, 2200], minAge: 35, maxAge: 58, t: '爸妈病了', loc: 'hospital', always: true,
      ok: (g) => g.age <= 58 && parentAlive(g) && parentOld(g) >= 70 && !g.recall('parentsCare'),
      text: (g) => {
        const o = older(g);
        const bill = k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(o) * 300);
        return CN.who(g, o, true) + '住院了，医保报完，自己掏了 ' + fmt(bill) + '。出院以后，医生说身边不能离人。'
          + (withPa(g) ? paThey(g) + '本来就和你住，可你白天要上班。' : '');
      },
      choices: [
        { t: '接来同住，自己照顾', canon: true, cond: (g) => !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: '你把书房腾出来，装了扶手和夜灯。' },
        { t: '自己多担着点', canon: true, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => '你把' + paWord(g) + '的屋子挪到了朝南那间，装了扶手和夜灯。下班你不再加班了。' },
        { t: '请护工上门', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('parentsCare', 'self'); g.remember('paAide', true); },
          res: () => '护工阿姨一年 ' + fmt(A) + '。她做的饭偏咸，家里人慢慢也吃惯了。' },
        { t: '交给兄弟姐妹，你出钱', dev: 10, cond: (g) => sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); spend(g, 24000); g.remember('parentsCare', 'sibling'); },
          res: '你每个月打 ¥2,000 回去，过节回家。' },
        { t: '在老家请人照看', dev: 10, cond: (g) => !sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[Math.max(4, tier(g))] || 40000; spend(g, A); g.remember('parentsCare', 'far'); },
          res: (g) => '你在老家请了一位阿姨，一年 ' + fmt(A) + '，又在客厅装了摄像头。每天晚上，你点开看一眼' + paWord(g) + '。' },
        { t: '送去养老院', dev: 15,
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.stat('心情', -3); },
          res: (g) => '你挑了一家近的，一年 ' + fmt(A) + '。临走，' + paWord(g) + '站在门口送你，像当年送你上学。' },
      ] },
    { id: 'e_m_sp_ill', y: [2026, 2200], minAge: 50, maxAge: 64, t: '另一半病了', loc: 'hospital', always: true,
      ok: (g) => g.age >= 50 && married(g) && !g.recall('spSick') && yearRoll(g, 7) < 0.05,
      text: (g) => CN.who(g, 'sp', true) + '查出了大病。医生说，能治，就是费钱、费人。',
      choices: [
        { t: '倾尽所有去治', canon: true, fx: (g) => { A = w1(Math.max(100000, Math.min(cash(g) * 0.7, 400000))); M = spend(g, A); g.stat('健康', -3); g.remember('spSick', 'all'); },
          res: () => '你跑遍了能跑的医院，前前后后花了 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。' },
        { t: '一边上班一边陪护', dev: 10, fx: (g) => { A = 80000; spend(g, A); g.stat('健康', -5); g.remember('spSick', 'both'); }, res: '医药费自付 ¥8 万。白天上班，晚上睡在病床边的折叠椅上。' },
        { t: '请护工和陪护机器人', dev: 15, cond: (g) => cash(g) >= 150000, fx: (g) => { A = 150000; spend(g, A); g.remember('spSick', 'paid'); }, res: '治病加护工，一共 ¥15 万。你每天下班去医院坐两个钟头，陪着说话。' },
      ] },
    { id: 'e_m_pa_bill', y: [2026, 2200], minAge: 45, maxAge: 64, t: '新疗法', loc: 'hospital', always: true,
      ok: (g) => g.age >= 45 && parentAlive(g) && parentOld(g) >= 76 && !!g.recall('parentsCare') && !g.recall('paBill') && yearRoll(g, 5) < 0.25,
      text: (g) => CN.who(g, older(g), true) + (yearRoll(g, 6) < 0.5 ? '查出了心脏的毛病' : '摔了一跤，髋骨裂了') + '，住进了医院。医生说，有一种新疗法恢复得快，医保报不了，自费要 ' + fmt(tier(g) <= 2 ? 200000 : 120000) + '。',
      choices: [
        { t: '用新疗法', canon: true, fx: (g) => { A = tier(g) <= 2 ? 200000 : 120000; M = spend(g, A); g.remember('paBill', 'best'); }, res: () => '你签了字，交了 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。' },
        { t: '按医保的方案治', dev: 10, fx: (g) => { A = k1((tier(g) <= 2 ? 200000 : 120000) * 0.15); spend(g, A); g.remember('paBill', 'basic'); }, res: () => '自费部分 ' + fmt(A) + '。医生说，这样也能控制住，就是恢复得慢一些。' },
        { t: '兄弟姐妹一起出', dev: 10, cond: (g) => sibs(g),
          fx: (g) => { A = w1((tier(g) <= 2 ? 200000 : 120000) / ((g.recall('sibs') || 0) + 1)); spend(g, A); g.remember('paBill', 'split'); }, res: () => '兄弟姐妹在群里算好了账，一人 ' + fmt(A) + '。用的是新疗法。' },
      ] },
    { id: 'e_m_kid_school', y: [2026, 2200], minAge: 30, maxAge: 64, t: '上学', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 6 && kAge(g) <= 9 && !g.recall('kidSchool'),
      text: (g) => kWho(g) + '该上小学了。' + (tier(g) <= 3 ? '家门口的学校一般，好学校旁边的老房子，一套要 ' + fmt(CN.price(g) * 1.3e4) + '。' : (tier(g) === 5 ? '村小并到了镇上，' : '县里的小学，') + '好一点的那所要托人才进得去。'),
      choices: [
        { t: '就近上公立', canon: true, fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', 1); }, res: '开学那天，你站在校门口，看着那个小书包走进人群里。' },
        { t: '卖了现在的房子，换学区房', dev: 15, cond: (g) => tier(g) <= 3 && ['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => '老破小，五十平，比原来的家小了一半，房贷又从头算起' + (B ? '，还借了 ' + fmt(B) : '') + '。你签字的手有点抖。' },
        { t: '咬牙买学区房', dev: 15, cond: (g) => tier(g) <= 3 && ['none', 'rent'].includes(house(g)) && cash(g) >= CN.price(g) * 1.3 * 0.25e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); A = p * 0.3e4; CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => '老破小，四十平，首付 ' + fmt(A) + (B ? '，借了 ' + fmt(B) : '') + '。你签字的手有点抖。' },
        { t: '托人找关系，进一所好点的学校', dev: 10, check: ['人缘', 55],
          fx: (g) => { spend(g, 20000); g.remember('kidSchool', 'good'); }, res: '你请人吃了三顿饭，交了 ¥2 万的“赞助费”。开学那天，你看着那块校牌松了一口气。',
          fail: { fx: (g) => { spend(g, 5000); g.remember('kidSchool', 'public'); g.stat('心情', -2); }, res: '托的人没办成，饭钱花了 ¥5,000。孩子还是上了家门口的学校。', dev: 0 } },
        { t: '送回老家，让爷爷奶奶带', dev: 15, cond: (g) => tier(g) <= 3 && !atHome(g) && parentAlive(g) && !withPa(g) && !(['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g))),
          fx: (g) => { g.remember('kidSchool', 'left'); g.stat('心情', -5); }, res: (g) => '送走' + kn(g) + '那天，' + kHe(g) + '一直没哭。车开出好远，你才哭了。' },
      ] },
    { id: 'e_m_kid_move', y: [2026, 2200], minAge: 30, maxAge: 64, t: '进城读书', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 9 && kAge(g) <= 13 && tier(g) >= 4 && !g.recall('kidMove') && g.recall('kidSchool') !== 'left',
      text: (g) => kWho(g) + '的成绩不错。' + (tier(g) === 5 ? '镇上' : '县里') + '的初中一般，市里的好初中，要么有房，要么有户口。市里一套小房子 ' + fmt(Math.round(CN.price(g, 3) * 0.7) * 1e4) + '。',
      choices: [
        { t: '留在本地读', canon: true, fx: (g) => { g.remember('kidMove', 'stay'); }, res: '你说，好孩子在哪儿都能学好。你给孩子买了一张新书桌。' },
        { t: '在市里买套小房子，一家人搬过去', dev: 20, cond: (g) => cash(g) >= Math.round(CN.price(g, 3) * 0.7) * 0.3e4 && canLoan(g, CN.price(g, 3) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g, 3) * 0.7); A = p * 0.3e4; CN.goCity(g, 3); B = addHouse(g, p, 0.3); g.remember('kidMove', 'buy'); },
          res: (g) => '首付 ' + fmt(A) + (B ? '，借了 ' + fmt(B) : '') + '。你们搬到了' + g.recall('workCity') + '，你在新家附近重新找活干。' },
        { t: '租房陪读', dev: 15,
          fx: (g) => { A = 18000 * 3; if (['own', 'mortgage', 'hometown'].includes(house(g))) spend(g, A); else A = 0; CN.goCity(g, 3); g.remember('kidMove', 'rent'); },
          res: (g) => '你在学校旁边租了一间房' + (A ? '，三年房租 ' + fmt(A) : '') + '。每天早上五点半起来做饭，' + where(g) + '的早市你比本地人还熟。' },
        { t: '送去市里寄宿', dev: 10, fx: (g) => { A = 20000 * 3; spend(g, A); g.remember('kidMove', 'board'); }, res: () => '三年住宿费、伙食费，一共 ' + fmt(A) + '。每个周五傍晚，你去车站接孩子回家。' },
      ] },
    { id: 'e_m_kid_push', y: [2026, 2200], minAge: 30, maxAge: 64, t: '补习班', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 10 && kAge(g) <= 13 && !g.recall('kidPush'),
      text: (g) => '家长群里每天都在晒补习班的课表，一年少说 ' + fmt(TUTOR[tier(g)] || 25000) + '。' + kn(g) + '周末还在楼下玩。',
      choices: [
        { t: '报几个班', canon: true, fx: (g) => { const t = TUTOR[tier(g)] || 25000; M = cash(g) >= t * 3 ? 'three' : 'one'; A = M === 'three' ? t * 3 : t; spend(g, A); g.remember('kidPush', 'hard'); }, res: () => (M === 'three' ? '周末的日程排满了。三年下来，补习班一共花了 ' + fmt(A) + '。' : '钱紧，你只报了数学和英语，一年 ' + fmt(A) + '。周末你开着电动车在两个机构之间来回接送。') },
        { t: '自己辅导', dev: 10, check: ['学识', 50],
          fx: (g) => { g.remember('kidPush', 'self'); g.stat('人缘', 3); }, res: '每天晚上一个钟头，你们趴在一张桌子上。孩子说你讲得比老师清楚。',
          fail: { fx: (g) => { A = (TUTOR[tier(g)] || 25000) * 2; spend(g, A); g.remember('kidPush', 'hard'); g.stat('心情', -3); }, res: () => '你讲着讲着就急了。最后还是报了班，两年花了 ' + fmt(A) + '。', dev: 0 } },
        { t: '不报，让孩子玩', dev: 15, fx: (g) => { g.remember('kidPush', 'easy'); g.stat('心情', 2); }, res: '孩子在楼下玩到天黑，你在阳台上喊回家吃饭。' },
      ] },
    { id: 'e_m_kid_teen', y: [2026, 2200], minAge: 30, maxAge: 64, t: '青春期', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 14 && kAge(g) <= 17 && !g.recall('kidBond'),
      text: (g) => kWho(g) + (g.recall('kidMove') === 'board' ? '周末回家，进门就关上房门。' : '开始锁房门了。') + '成绩掉了一截，手机不离手，跟你说话不超过三句。',
      choices: [
        { t: '管严一点', canon: true, fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -2); }, res: '你收了手机。门摔得很响。' },
        { t: '找个机会坐下来聊', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.remember('kidBond', 'close'); g.stat('人缘', 4); }, res: '你们在夜宵摊坐了很久。孩子说了一些你从来不知道的事。',
          fail: { fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -3); }, res: '你一开口就是说教。孩子低着头吃完，回了房间。', dev: 0 } },
        { t: '随他去，长大就好了', dev: 10, fx: (g) => { g.remember('kidBond', 'loose'); }, res: '你不再过问。有时候你也想，是不是该问一问。' },
      ] },
    { id: 'e_m_kid_gaokao', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子高考', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 18 && kAge(g) <= 20 && !g.recall('kidUni'),
      text: (g) => {
        // 文字每次渲染都会求值，分数只算一次
        if (!g.recall('kidScore')) g.remember('kidScore', kidResult(g));
        const r = g.recall('kidScore');
        return (kidAway(g) ? '前任打来电话：' : '') + kn(g) + '高考的分数出来了：' + { top: '能上一所很好的大学。', good: '能上一所不错的本科。', normal: '能上一所普通的学校。', none: '离本科线差了一截。' }[r] + '填志愿的那几天，你的灯亮到半夜。';
      },
      choices: [
        { t: '让孩子自己选', canon: true, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'own'); g.stat('人缘', 2); }, res: '孩子选了一个你没听说过的专业。你上网查了一晚上。' },
        { t: '替孩子选个稳当的', dev: 10, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'stable'); g.stat('人缘', -2); }, res: '师范、医学、考公，你说了算。孩子没吭声，按了确认。' },
        { t: '孩子说不想读了，你随他', dev: 20, cond: (g) => g.recall('kidBond') === 'loose' || g.recall('kidScore') === 'none',
          fx: (g) => { g.remember('kidUni', 'none'); g.remember('kidPath', 'work'); }, res: '孩子跟着亲戚去学手艺了。走的那天说，不用你操心。' },
      ] },
    { id: 'e_m_kid_city', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子留在哪儿', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 22 && kAge(g) <= 26 && !g.recall('kidCity'),
      text: (g) => kn(g) + (g.recall('kidPath') === 'work' ? '学成了手艺，' : '毕业了，') + '打电话问你：留在大城市，还是回来？',
      choices: [
        { t: '去大城市闯', canon: true, fx: (g) => { g.remember('kidCity', g.recall('kidUni') === 'top' ? CN.pick(BIG) : CN.pick(['杭州', '成都', '武汉', '南京', '广州', '西安'])); g.stat('心情', -1); },
          res: (g) => kn(g) + '去了' + g.recall('kidCity') + '。你把' + kHe(g) + '的房间原样留着。' },
        { t: '劝回身边', dev: 10, fx: (g) => { g.remember('kidCity', where(g)); g.stat('人缘', 3); }, res: '孩子回来了，在本地找了份工作。周末回家吃饭，带着一身你不认识的香水味。' },
        { t: '出国读研', dev: 20, cond: (g) => cash(g) >= 300000 || g.recall('kidUni') === 'top',
          fx: (g) => { A = 400000; M = spend(g, A); g.remember('kidCity', '国外'); g.stat('心情', -3); },
          res: () => '学费加生活费，前后 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。机场送别，孩子过了安检，回头挥了挥手。时差八个钟头。' },
      ] },
    { id: 'e_m_kid_wed', y: [2026, 2200], minAge: 40, maxAge: 64, t: '孩子成家', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 27 && kAge(g) <= 34 && !g.recall('kidWed'),
      text: (g) => kWho(g) + '带了一个人回家吃饭。饭后，' + kHe(g) + '说想结婚了。' + (g.recall('kidCity') && g.recall('kidCity') !== '国外' ? '在' + g.recall('kidCity') + '，一套房子的首付就要 ' + fmt(CN.price(g, kidTier(g)) * 0.3e4) + '。' : '房子、酒席，样样要钱。'),
      choices: [
        { t: '掏积蓄帮着付首付', canon: true, cond: (g) => cash(g) >= 100000,
          fx: (g) => { A = w1(Math.min(CN.price(g, kidTier(g)) * 0.3e4, cash(g) * 0.7)); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => '你转了 ' + fmt(A) + '。酒席上，你喝多了，拉着亲家说了很多年轻时候的事。' },
        { t: '借钱也帮一把', canon: true, cond: (g) => cash(g) < 100000,
          fx: (g) => { A = 100000; borrow(g, 10); CN.earn(g, A); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => '你找亲戚凑了 ' + fmt(A) + '，塞到孩子手里。酒席上，你笑得比谁都大声。' },
        { t: '让他们自己来，你只出个心意', dev: 15, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.1, 20000), 100000)); spend(g, A); g.remember('kidWed', 'self'); },
          res: () => '你包了一个 ' + fmt(A) + ' 的红包。婚礼很简单，在一家小饭馆。新人敬酒的时候，笑得很真。' },
        { t: '孩子说不想办婚礼，你也依了', dev: 15, fx: (g) => { g.remember('kidWed', 'none'); }, res: '他们领了证，发了一张合照到家族群里。你看了好几遍。' },
      ] },
    { id: 'e_m_oldhouse', y: [2026, 2200], minAge: 35, maxAge: 64, t: '老房子', always: true,
      ok: (g) => !!JY.byId.fa && !parentAlive(g) && !g.recall('oldHouse'),
      text: (g) => '爸妈都不在了。老家的房子空着，钥匙在你手里。' + (sibs(g) ? '兄弟姐妹说，怎么处理听你的。' : '') + '中介说，能卖 ' + fmt(oldVal(g) * 1e4) + ' 左右。',
      choices: [
        { t: '留着，逢年过节回去看看', canon: true, fx: (g) => { g.remember('oldHouse', 'keep'); g.set('keptOldHouse'); g.stat('心情', 2); }, res: '你把爸妈的照片挂回了原来的位置。' },
        { t: '卖了', dev: 10, fx: (g) => { A = Math.round(oldVal(g) * 1e4 / ((g.recall('sibs') || 0) + 1)); CN.earn(g, A); g.remember('oldHouse', 'sold'); g.stat('心情', -3); },
          res: (g) => '买家是个年轻人，说要改成民宿。' + (sibs(g) ? '兄弟姐妹分了钱，你那份是 ' : '卖了 ') + fmt(A) + '。你最后看了一眼门框上量身高的刻痕。' },
        { t: '让给兄弟姐妹', dev: 10, cond: (g) => sibs(g), fx: (g) => { g.remember('oldHouse', 'gave'); g.stat('人缘', 5); }, res: '你在协议上签了字。兄弟姐妹在饭桌上敬了你一杯。' },
        { t: '搬回去住', dev: 15, cond: (g) => atHome(g) && ['none', 'rent'].includes(house(g)),
          fx: (g) => { settleOld(g, oldVal(g)); g.remember('house', 'hometown'); g.remember('oldHouse', 'live'); }, res: '你退了租的房子，搬回了老屋。不用再交房租，墙上还有你小时候贴的画。' },
      ] },
    { id: 'e_m_crash', y: [2026, 2200], minAge: 38, maxAge: 62, t: '行情', always: true,
      ok: (g) => g.age >= 38 && g.age <= 62 && invested(g) >= 50000 && ['fund', 'stock'].includes(g.recall('investStyle')) && !g.recall('crash') && yearRoll(g, 11) < 0.1,
      text: (g) => '这一年行情急转直下。你' + CN.riskName(g.recall('investStyle')) + '的 ' + fmt(invested(g)) + '，一个月里跌掉了三成多。群里有人在骂，有人在抄底。',
      choices: [
        { t: '拿着不动', canon: true, fx: (g) => { A = -gain(g, -0.35); g.remember('crash', 'hold'); }, res: () => '账面上少了 ' + fmt(A) + '。你卸载了软件，眼不见心不烦。' },
        { t: '割肉离场', dev: 10, fx: (g) => { A = -gain(g, -0.35); CN.withdraw(g); g.remember('crash', 'cut'); }, res: () => '你亏了 ' + fmt(A) + '，把剩下的钱全取了出来，存进了银行。少亏就是赚，你这么安慰自己。' },
        { t: '跌了再买一点', dev: 20, cond: (g) => cash(g) >= 50000,
          fx: (g) => { gain(g, -0.35); A = CN.invest(g, w1(cash(g) * 0.3), g.recall('investStyle') || 'fund'); g.remember('crash', 'add'); }, res: () => '你又投进去 ' + fmt(A) + '。' + '买完那天晚上，你没怎么睡着。' },
      ] },
    { id: 'e_m_boom', y: [2026, 2200], minAge: 38, maxAge: 62, t: '好行情', always: true,
      ok: (g) => g.age >= 38 && g.age <= 62 && invested(g) >= 50000 && ['fund', 'stock', 'gold'].includes(g.recall('investStyle')) && !g.recall('boom') && yearRoll(g, 13) < 0.07,
      text: (g) => '这一年行情好得出奇。你' + CN.riskName(g.recall('investStyle')) + '的钱，半年涨了四成，现在是 ' + fmt(invested(g) * 1.4) + '。',
      choices: [
        { t: '拿着再看看', canon: true, fx: (g) => { A = gain(g, 0.4); g.remember('boom', 'hold'); }, res: () => '你多赚了 ' + fmt(A) + '，没舍得卖。' },
        { t: '落袋为安', dev: 10, fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); g.remember('boom', 'cash'); }, res: () => '你把钱全取了出来，净赚 ' + fmt(A) + '。卖完第二天，又涨了一点，你笑了笑。' },
        { t: '取一部分，带家里人出去玩一趟', dev: 15,
          fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); B = w1(A * 0.2); spend(g, B); g.remember('boom', 'trip'); },
          res: (g) => '你拿出 ' + fmt(B) + '，带' + (parentAlive(g) ? paWord(g) : CN.alone(g) ? '自己' : '一家人') + '去看了一趟海。剩下的存进了银行。' },
      ] },

    /* 升职、自己干、当顾问：排在最后，这一年孩子、父母、行情都没有事才轮到 */
    { id: 'e_m_ladder', y: [2026, 2200], minAge: 38, maxAge: 44, t: '往上一级', loc: 'office', always: true,
      ok: (g) => g.age >= 38 && g.age <= 44 && EMP.includes(job(g)) && !!POST40[job(g)] && !g.recall('ladder40') && g.s('事业') >= 35,
      text: (g) => pk(g, ['老领导要退了，', '上面新设了一个位子，', '原来的负责人调走了，'], 34) + POST40[job(g)] + '的位置空着。你现在是' + title(g) + '，自己一个月约 ' + fmt(mPay(g, job(g))) + '。'
        + (hasKid(g) && !kidAway(g) && kAge(g) < 15 ? kn(g) + '还小，' + (married(g) ? spName(g) + '问你，以后晚上还回不回家吃饭。' : '放学要人接。') : ''),
      choices: [
        { t: (g) => '报名竞争（升上去约 ' + fmt(mPay(g, job(g), null, 12)) + '/月，担子重，加班多）', canon: true, cond: hiEdu, check: ['事业', 55],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => '你当上了' + title(g) + '，现在一个月约 ' + fmt(mPay(g, job(g))) + '。办公室换到了走廊尽头，' + pk(g, ['窗外是一排梧桐。', '门口多了一盆发财树。', '桌上的电话一天响几十遍。'], 39),
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: '名单公示了，第一个名字不是你。你在楼下站了一会儿，又上楼干活了。', dev: 5 } },
        { t: (g) => '报名竞争（升上去约 ' + fmt(mPay(g, job(g), null, 12)) + '/月；学历吃亏，要靠这些年的业绩）', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 65],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => '你当上了' + title(g) + '。有人背后说你学历不够，你把这几年的数据摊在桌上，后来就没人说了。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: '位置给了一个学历更高的年轻人。他第一天上班，先来请教你。', dev: 5 } },
        { t: (g) => '走专家路线，评' + EXPERT40[job(g)] + '（评上约 ' + fmt(mPay(g, job(g), null, 8)) + '/月，不用管人）', dev: 10, cond: (g) => !!EXPERT40[job(g)], check: ['学识', 70],
          fx: (g) => { CN.setJob(g, job(g), EXPERT40[job(g)]); g.stat('事业', 6); g.stat('学识', 2); g.remember('ladder40', 'expert'); },
          res: (g) => '评审会上你讲了二十分钟。证书下来，你成了' + title(g) + '。最难的那些活，从此都绕不开你。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('ladder40', 'lost'); }, res: '材料差一篇论文。你把评审表收好，说明年再来。', dev: 5 } },
        { t: (g) => '调去外地，升一级（约 ' + fmt(mPay(g, job(g), null, 14)) + '/月，' + (married(g) || (hasKid(g) && !kidAway(g)) ? '和家里两地跑' : '换个地方从头来') + '）', dev: 20, cond: (g) => ['office', 'tech', 'sales', 'civil'].includes(job(g)),
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)] + (job(g) === 'civil' ? '（下派）' : '（外派）')); g.move('office', job(g) === 'civil' ? '下面的一个县' : '外地的分公司'); g.stat('事业', 12); g.stat('人缘', -3); g.remember('ladder40', 'away'); },
          res: (g) => (job(g) === 'civil' ? '你去了下面的一个县。' : '你去了外地的分公司。') + (married(g) || (hasKid(g) && !kidAway(g)) ? '每个周五晚上坐高铁回家，周日晚上再坐回去。车上的座位号，你常常订同一个。' : '宿舍不大，窗户朝东，早上被太阳晒醒。') },
        { t: (g) => (married(g) || hasKid(g) || parentAlive(g) ? '不争，把时间留给家里' : '不争，守着现在的活'), dev: 15,
          fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); g.remember('ladder40', 'family'); },
          res: (g) => (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? '那几年，' + kn(g) + '的家长会你一次也没落下。' : parentAlive(g) ? '那几年，' + paWord(g) + '每次复查都是你陪着去的。' : '你准点下班，学会了做几道新菜。') },
      ] },
    { id: 'e_m_ladder2', y: [2026, 2200], minAge: 47, maxAge: 54, t: '最后一级', loc: 'office', always: true,
      ok: (g) => g.age >= 47 && g.age <= 54 && EMP.includes(job(g)) && !!TOP50[job(g)] && !g.recall('ladder50') && (['head', 'expert', 'away'].includes(g.recall('ladder40')) || g.s('事业') >= 65),
      text: (g) => '再往上，就是' + TOP50[job(g)] + '。' + pk(g, ['上面要从中层里挑一个。', '考察组来谈话，名单里有你。', '老板私下问你有没有这个心思。'], 35) + '五十岁上下，有人往上冲，有人开始往下放。你现在一个月约 ' + fmt(mPay(g, job(g))) + '。',
      choices: [
        { t: (g) => '冲一把（成了约 ' + fmt(mPay(g, job(g), null, 15)) + '/月，应酬多，身体吃不消的大有人在）', dev: 15, check: ['事业', 70],
          fx: (g) => { CN.setJob(g, job(g), TOP50[job(g)]); g.stat('事业', 10); g.stat('健康', -4); g.remember('ladder50', 'top'); },
          res: (g) => '任命下来了，你成了' + title(g) + '。祝贺的消息回了一晚上。第二天早上七点，你第一个到。',
          fail: { fx: (g) => { g.stat('心情', -5); g.remember('ladder50', 'lost'); }, res: '最后一轮，你输给了一个空降来的人。你请了三天假，去郊外住了两晚。', dev: 5 } },
        { t: '退居二线，带带年轻人', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('人缘', 3); g.stat('事业', -2); g.remember('ladder50', 'mentor'); },
          res: '你把这些年的笔记整理成了一个文件夹，发给了组里的年轻人。有两个人认真看了，追着你问。' },
        { t: (g) => '主动让位，换个清闲的岗位（约 ' + fmt(k1(mPay(g, job(g)) * 0.8)) + '/月）', dev: 10,
          fx: (g) => { CN.setJob(g, job(g), (JOBT[job(g)] || '') + '（二线）'); g.stat('事业', -8); g.stat('健康', 3); g.remember('ladder50', 'easy'); },
          res: '新岗位没什么要紧事。你中午能睡半个钟头，下午五点半准时走。' },
      ] },
    { id: 'e_m_biz', y: [2026, 2200], minAge: 40, maxAge: 52, t: '另起炉灶', always: true,
      ok: (g) => g.age >= 40 && g.age <= 52 && !['none', 'retired', 'boss', 'shop', 'creator'].includes(job(g)) && !g.recall('biz45') && g.recall('startup') !== 'ok'
        && !['stall', 'online', 'franchise'].includes(g.recall('biz')) && lifeRoll(g, 36) < 0.18 && (cash(g) >= 60000 || ['rural', 'county'].includes(g.recall('hukou'))),
      text: (g) => {
        const home = ['rural', 'county'].includes(g.recall('hukou'));
        const a = home && lifeRoll(g, 37) < 0.5 ? '老家的村支书打来电话，说村里想搞个' + coopCrop(g) + '合作社，缺一个见过世面、又肯回来的人。'
          : lifeRoll(g, 37) < 0.75 ? '一个老朋友开了三家' + frKind(g) + '，说你要加盟，他带着你。' : '你看见同龄人在网上卖' + onlineItem(g) + '，一个月流水好几万。';
        return a + '你今年' + g.age + '岁，卡里有 ' + fmt(cash(g)) + '。';
      },
      choices: [
        { t: (g) => '加盟一家' + frKind(g) + '（本钱 ' + fmt(FR[tier(g)] || 200000) + (cash(g) < (FR[tier(g)] || 200000) ? '，要借 ' + fmt(w1((FR[tier(g)] || 200000) - Math.max(0, cash(g)))) : '') + '，回本要三年左右）', dev: 20,
          cond: (g) => cash(g) >= (FR[tier(g)] || 200000) * 0.4, check: ['事业', 50],
          fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); g.remember('bizKind45', k); CN.setJob(g, 'boss', k + '加盟店老板'); g.remember('biz45', 'franchise'); g.stat('心情', 3); },
          res: (g) => '你辞了工作，开了一家' + g.recall('bizKind45') + '。前前后后投了 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。开业那天，' + (married(g) ? spName(g) + '站在收银台后面，比你还紧张。' : '老同事来了好几个，帮你挂了横幅。'),
          fail: { fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); B = w1(A * 0.3); CN.earn(g, B); g.remember('bizKind45', k); g.remember('biz45', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => '店开在一个新小区门口，小区一直没住满。一年后你把店转了，' + fmt(A) + ' 的本钱只收回 ' + fmt(B) + '。' + (owe(g) > 0 ? '账上还欠着 ' + fmt(owe(g) * 1e4) + '。' : '') + '好在原来的单位还要你，你又回去上班了。', dev: 5 } },
        { t: (g) => '回老家办合作社，种' + coopCrop(g) + '（本钱 ¥15 万，带着乡亲干；收成看天，也看销路）', dev: 25, cond: (g) => ['rural', 'county'].includes(g.recall('hukou')), check: ['人缘', 50],
          fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'boss', c + '合作社带头人'); g.remember('biz45', 'coop'); g.stat('人缘', 4); },
          res: (g) => '你回了' + where(g) + '。流转地、搭冷库、买苗，一共 ¥15 万' + (M ? '，借了 ' + fmt(M) : '') + '。头一年有十二户入了社，第一车' + g.recall('crop45') + '拉走那天，大家在地头放了一挂鞭。',
          fail: { fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); CN.earn(g, 50000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'farmer', '回乡种地'); g.remember('biz45', 'coopFail'); g.stat('心情', -5); },
            res: (g) => '头一年赶上倒春寒，' + g.recall('crop45') + '减产一大半，入社的人家退了一半。设备折价卖了 ¥5 万。你留在老家，种自己那几亩地。', dev: 5 } },
        { t: (g) => '下了班开网店，卖' + onlineItem(g) + '（本钱 ¥5 万，不用辞职；十家里成两三家）', dev: 15, check: ['人缘', 52],
          fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'online'); g.stat('健康', -2); },
          res: '¥5 万买了货、拍了样品。你每天下了班打包到十一点，周末跑快递站。第三个月，有个客户给你寄了一封感谢信。',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'onlineFail'); g.stat('心情', -3); }, res: '你不会拍、不会说，网店一天只有几个人看。半年后关了，货堆在家里，过年分给了亲戚。', dev: 5 } },
        { t: '算了，这个年纪求稳', canon: true, fx: (g) => { g.remember('biz45', 'no'); g.stat('心情', 1); }, res: '你把电话那头的话想了一晚上，第二天照常去上班。' },
      ] },
    { id: 'e_m_consult', y: [2026, 2200], minAge: 55, maxAge: 63, t: '顾问', always: true,
      ok: (g) => g.age >= 55 && g.age <= 63 && ['office', 'tech', 'doctor', 'teacher', 'sales', 'boss', 'worker', 'nurse'].includes(job(g)) && g.s('健康') >= 45 && !g.recall('consult')
        && (g.s('学识') >= 80 || g.s('事业') >= 75 || (job(g) === 'worker' && !!g.recall('skill'))),
      text: (g) => ({ doctor: '一家民营医院', teacher: '一家培训学校', nurse: '一家护理院', worker: '外地的一家工厂', tech: '一家刚起步的公司' }[job(g)] || '一家同行的小公司') + '托人找到你，想请你去当顾问。他们说，要的就是你这些年攒下的经验。',
      choices: [
        { t: (g) => '答应，周末去兼职（每月多 ' + fmt(k1(mPay(g, job(g)) * 0.25)) + '）', dev: 10,
          fx: (g) => { g.remember('consultPay', k1(mPay(g, job(g)) * 0.25)); g.remember('consult', 'part'); g.stat('健康', -1); g.stat('事业', 3); },
          res: (g) => '你每个周六去半天，看看他们的难处，说几句话。每月多出 ' + fmt(g.recall('consultPay')) + '，你单独存了一张卡。' },
        { t: (g) => '辞了现在的工作，开个自己的工作室（本钱 ¥5 万，' + CN.jobRisk('boss') + '）', dev: 25, cond: (g) => job(g) !== 'boss', check: ['事业', 60],
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'boss', '开工作室'); g.remember('consult', 'own'); g.stat('心情', 4); },
          res: '你租了一间小办公室，挂了块牌子。第一单是老客户介绍的。',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('consult', 'ownFail'); g.stat('心情', -4); }, res: '工作室开了大半年，单子不够交房租。你把牌子摘了，¥5 万算是买了个教训。原单位让你回去了。', dev: 5 } },
        { t: '谢了，安安稳稳干到退休', canon: true, fx: (g) => { g.remember('consult', 'no'); }, res: '你把对方的名片夹进了笔记本。' },
      ] },

    /* 升职、自己干、当顾问的回响 */
    { id: 'e_m_ladder_echo', y: [2026, 2200], minAge: 41, maxAge: 64, t: '这几年', auto: true, always: true,
      cond: (g) => !!g.recall('ladder40') && g.since('ladder40') >= 3,
      fx: (g) => { const l = g.recall('ladder40'); if (l === 'head') g.stat('健康', -2); if (l === 'away') { A = w1(myInc(g) * 0.2); CN.earn(g, A); if (POST40[job(g)]) CN.setJob(g, job(g), POST40[job(g)]); } if (l === 'family') g.stat('心情', 2); },
      text: (g) => ({
        head: '当' + POST40[job(g)] + '的这几年，你学会了在会上少说话，在会后多打电话。体检单上多了两个箭头。',
        expert: '你的名字进了行业里的专家库。每年有几个年轻人专门来找你，带着问题，也带着家乡的特产。',
        away: '外派那几年攒下了 ' + fmt(A) + ' 的补贴。' + (married(g) ? '你调回来那天，' + spName(g) + '在车站等你，说你瘦了。' : (house(g) === 'rent' ? '回来以后，你在老地方租了一套朝南的房子。' : '回来以后，你把家里重新粉刷了一遍。')),
        lost: '那次没争上，后来你也想开了。你在原来的位置上，做成了几件自己想做的事。',
        family: hasKid(g) && !kidAway(g) ? kn(g) + '长大了，有天突然说，那几年你每天都在家吃晚饭，' + kHe(g) + '记得。' : '那几年你没往上走。少挣的钱，换来了很多个早早回家的晚上。',
      }[g.recall('ladder40')]) },
    { id: 'e_m_ladder2_echo', y: [2026, 2200], minAge: 50, maxAge: 64, t: '位子', auto: true, always: true,
      cond: (g) => !!g.recall('ladder50') && g.since('ladder50') >= 3,
      fx: (g) => { const l = g.recall('ladder50'); if (l === 'top') { g.stat('健康', -3); A = w1(myInc(g) * 0.25); CN.earn(g, A); } else g.stat('心情', 2); },
      text: (g) => ({
        top: '坐在' + TOP50[job(g)] + '的位子上，你一年的奖金有 ' + fmt(A) + '。降压药换成了一天两片。',
        lost: '那个空降来的人干了两年就走了。你没再去争，日子也照样过。',
        mentor: '你带过的一个年轻人升了职，请你吃饭。他说，师父，你当年说的话我都记着。',
        easy: '清闲的这几年，你把家附近的公园走遍了，认识了一群一起打太极的人。',
      }[g.recall('ladder50')]) },
    { id: 'e_m_biz_echo', y: [2026, 2200], minAge: 43, maxAge: 64, t: '生意', auto: true, always: true,
      cond: (g) => ['franchise', 'coop', 'online'].includes(g.recall('biz45')) && g.since('biz45') >= 3,
      fx: (g) => {
        const b = g.recall('biz45');
        M = helperM(g);
        B = g.rnd() < { franchise: 0.65, coop: 0.6, online: 0.5 }[b] ? 1 : 0;
        if (B) { A = b === 'franchise' ? w1((FR[tier(g)] || 200000) * 0.6) : b === 'coop' ? w1(80000 + g.rnd() * 120000) : w1(60000 + g.rnd() * 60000); CN.earn(g, A); g.stat('事业', 6); if (b === 'online') CN.setJob(g, 'boss', '网店老板'); }
        else if (b === 'franchise') { A = w1((FR[tier(g)] || 200000) * 0.2); CN.earn(g, A); CN.setJob(g, tier(g) >= 4 ? 'worker' : 'office', tier(g) >= 4 ? '工厂工人' : '公司职员'); g.stat('心情', -6); }
        else if (b === 'coop') { CN.setJob(g, 'farmer', '种地'); g.stat('心情', -5); }
        else g.stat('心情', -2);
      },
      text: (g) => {
        const b = g.recall('biz45');
        const hire = M ? '你把' + helpWho(g, M) + '叫来帮忙，' + (b === 'coop' ? '管仓库和账本。' : b === 'online' ? '管客服和发货。' : '管收银。') : '你雇了两个附近的人。';
        if (b === 'franchise') return B ? '那家' + g.recall('bizKind45') + '回了本，这几年净挣了 ' + fmt(A) + '。你又开了一家分店，' + hire
          : '总部换了打法，加盟费涨了，客人却少了。你把' + g.recall('bizKind45') + '转了出去，收回 ' + fmt(A) + '，又找了份工作。' + (owe(g) > 0 ? '欠的 ' + fmt(owe(g) * 1e4) + '，按月还。' : '');
        if (b === 'coop') return B ? '合作社有了三十几户。' + g.recall('crop45') + '贴上了你们村的名字，卖到了外省，去年分红 ' + fmt(A) + '。' + hire
          : '连着两年行情不好，' + g.recall('crop45') + '烂在地里一批。合作社散了，你把冷库租给了别人，自己回去种地。';
        return B ? '网店做稳了，这几年净挣了 ' + fmt(A) + '。你辞了工作，专心打理。' + hire : '平台的规矩一年一变，网店的流量越来越少。你把它关了，留下一屋子纸箱和几个常联系的老客户。';
      } },
    { id: 'e_m_consult_echo', y: [2026, 2200], minAge: 57, maxAge: 64, t: '顾问这几年', auto: true, always: true,
      cond: (g) => ['part', 'own', 'ownFail'].includes(g.recall('consult')) && g.since('consult') >= 2,
      fx: (g) => { const c = g.recall('consult'); A = 0; if (c === 'part') { A = (Number(g.recall('consultPay')) || 0) * 24; CN.earn(g, A); } if (c === 'own') { A = w1(myInc(g) * (0.3 + g.rnd() * 0.6)); CN.earn(g, A); } },
      text: (g) => ({
        part: '周末当顾问这两年，那张卡里攒下了 ' + fmt(A) + '。那家' + (job(g) === 'doctor' ? '医院' : job(g) === 'teacher' ? '学校' : '公司') + '的年轻人，见了你都叫老师。',
        own: '工作室有了几个固定的客户。这两年多挣了 ' + fmt(A) + '，你给自己定了规矩：晚上八点以后不接电话。',
        ownFail: '那块摘下来的牌子，你一直放在阳台上。有时候浇花，会看它一眼。',
      }[g.recall('consult')]) },

    /* 自动发生的回响和变故 */
    { id: 'e_m_kid_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子', auto: true, always: true,
      cond: (g) => !!g.recall('kidBond') && g.since('kidBond') >= 3 && hasKid(g),
      fx: (g) => { const b = g.recall('kidBond'); if (b === 'close') g.stat('心情', 3); if (b === 'strict') g.stat('人缘', -2); },
      text: (g) => {
        const b = g.recall('kidBond');
        const s = g.recall('kidSchool');
        const pre = s === 'left' ? '接回身边以后，孩子跟你一直隔着一层。' : s === 'district' ? (owe(g) > 0 ? '学区房的贷款还在还，' : '') + '孩子的学校倒是真的好。' : '';
        return pre + (b === 'close' ? '那次长谈以后，孩子有事会先来问你。' : b === 'strict' ? '孩子长大了，跟你说话还是客客气气的，像跟老师。' : '孩子自己长大了，长成了你不太认得、又有点佩服的样子。');
      } },
    { id: 'e_m_kid_move_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '在市里', auto: true, always: true,
      cond: (g) => !!g.recall('kidMove') && g.recall('kidMove') !== 'stay' && g.since('kidMove') >= 2 && hasKid(g),
      text: (g) => ({
        buy: '搬到市里两年，孩子的成绩稳在了年级前面。你也慢慢习惯了城里的菜价。',
        rent: '陪读的两年，你认识了一群同样陪读的家长。谁家孩子考好了，大家一起高兴。',
        board: '寄宿两年，孩子学会了自己洗衣服、管钱。周五回家，会帮你做饭了。',
      }[g.recall('kidMove')]) },
    { id: 'e_m_kid_uni_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子的路', auto: true, always: true,
      cond: (g) => !!g.recall('kidPath') && g.since('kidPath') >= 3 && hasKid(g),
      text: (g) => {
        const p = g.recall('kidPath'), u = g.recall('kidUni');
        if (p === 'work') return '孩子学的手艺有了用处，自己开了个小工作室。逢人问起，你说：“孩子自己闯出来的。”';
        if (p === 'stable') return (u === 'top' || u === 'good' ? '孩子按你选的路读完了书，工作很稳。' : '孩子读完书，考了好几年才考上编。') + '有一次喝了酒，孩子说那年要是自己选就好了。';
        return u === 'top' ? '孩子读的那所好大学，成了你在亲戚面前少有的话题。' : '孩子自己选的专业，后来竟然真的找到了对口的工作。';
      } },
    { id: 'e_m_kid_wed_echo', y: [2026, 2200], minAge: 42, maxAge: 64, t: '小两口', auto: true, always: true,
      cond: (g) => !!g.recall('kidWed') && g.since('kidWed') >= 2 && hasKid(g),
      text: (g) => ({
        paid: '小两口搬进了新房，房本上写着他们俩的名字。' + kn(g) + '说，房贷他们自己还，你帮的那笔慢慢还你。你说不用。',
        self: '小两口租房住，日子过得紧，也过得有劲。周末常来你这儿蹭饭。',
        none: '没办婚礼的小两口，把钱攒下来，去了一趟很远的地方。照片发回来，你设成了手机屏保。',
      }[g.recall('kidWed')]) },
    { id: 'e_m_pa_bill_echo', y: [2026, 2200], minAge: 46, maxAge: 64, t: '出院以后', auto: true, always: true,
      cond: (g) => !!g.recall('paBill') && g.since('paBill') >= 1,
      text: (g) => {
        const b = g.recall('paBill');
        if (!parentAlive(g)) return '那次住院以后，老人又陪了你一段日子。你不后悔当时的决定。';
        if (b === 'best') return paWord(g) + '恢复得很好，又能下楼遛弯了。邻居都问用的什么药。';
        if (b === 'split') return paWord(g) + '恢复得不错。那次一起凑钱以后，兄弟姐妹的群里热闹了很多。';
        return paWord(g) + '的病控制住了，就是走路要拄拐了。你在楼道里装了一排扶手。';
      } },
    { id: 'e_m_crash_echo', y: [2026, 2200], minAge: 40, maxAge: 64, t: '回过头看', auto: true, always: true,
      cond: (g) => !!g.recall('crash') && g.since('crash') >= 2,
      fx: (g) => { const c = g.recall('crash'); A = 0; if (c === 'hold') A = gain(g, 0.3); if (c === 'add') A = gain(g, 0.45); },
      text: (g) => {
        const c = g.recall('crash');
        if (c === 'cut') return '后来行情慢慢涨回来了。你已经不在车上，就当看个热闹。存在银行里的钱，一分没少。';
        if (!invested(g)) return '那次大跌以后，你再没碰过这些。';
        return (c === 'add' ? '当年跌的时候买的那笔，涨了不少。' : '两年后，行情慢慢回来了。') + '你打开软件，账户里是 ' + fmt(invested(g)) + '。';
      } },
    { id: 'e_m_boom_echo', y: [2026, 2200], minAge: 40, maxAge: 64, t: '涨过之后', auto: true, always: true,
      cond: (g) => !!g.recall('boom') && g.since('boom') >= 2,
      fx: (g) => { if (g.recall('boom') === 'hold') gain(g, -0.15); },
      text: (g) => ({
        hold: '那一波涨完，又回调了一些。账户里现在是 ' + fmt(invested(g)) + '，比当初还是多。',
        cash: '那次落袋为安的钱，你一直存着，留着养老。',
        trip: '那次旅行的照片，' + (CN.alone(g) ? '你洗了出来挂在墙上。' : '家里人一直挂在客厅的墙上。'),
      }[g.recall('boom')]) },
    { id: 'e_m_fa_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '父亲走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.fa && deadThisYear(g, 'fa'),
      fx: (g) => { g.stat('心情', -6); g.remember('lostFa', true); },
      text: (g) => {
        const p = g.recall('parentsCare');
        return p === 'self' && g.recall('parentsIn') ? '父亲是在你家里走的，走之前喊了你的小名。' : p === 'nursing' ? '养老院半夜来了电话。你赶到的时候，护工说他走得很安静。' : p === 'far' ? '你连夜赶回老家，还是晚了一步。摄像头里，最后一段录像是他在看电视。' : '父亲走了。你在灵堂守了三夜，把他这辈子的事想了一遍。';
      } },
    { id: 'e_m_mo_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '母亲走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.mo && deadThisYear(g, 'mo'),
      fx: (g) => { g.stat('心情', -7); },
      text: (g) => (g.recall('lostFa') ? '母亲也走了。从此你就没有爸妈了。' : '母亲走了。') + (g.recall('parentsCare') === 'self' && g.recall('parentsIn') ? '她的那双拖鞋，你很久都没收起来。' : '收拾遗物的时候，你找到一个铁盒子，里面是你小时候的奖状。') },
    { id: 'e_m_oldhouse_echo', y: [2026, 2200], minAge: 36, maxAge: 64, t: '老家', auto: true, always: true,
      cond: (g) => !!g.recall('oldHouse') && g.since('oldHouse') >= 3,
      text: (g) => {
        const o = g.recall('oldHouse');
        if (o === 'keep' && g.f('keptOldHouse')) return '清明回老家，你推开那扇门，灰尘在光里飘。邻居说，你家门口那棵树又粗了一圈。';
        if (o === 'sold') return '你路过老家，那房子改成了民宿，门口挂着灯笼。你没进去。';
        if (o === 'live') return '住回老屋的这几年，你把院子收拾了出来，种了葱和辣椒。邻居常隔着墙递东西过来。';
        return '兄弟姐妹把老房子翻新了。你回去住了一晚，睡的还是小时候那张床。';
      } },
    { id: 'e_m_sp_ill_echo', y: [2026, 2200], minAge: 51, maxAge: 64, t: '病床边', auto: true, always: true,
      cond: (g) => !!g.recall('spSick') && g.since('spSick') >= 1,
      fx: (g) => { if (married(g) && g.rnd() < (g.recall('spSick') === 'all' ? 0.2 : 0.35)) g.kill('sp', '病逝', true); },
      text: (g) => (married(g) ? spName(g) + '熬过来了。出院那天，你们在医院门口拍了一张照片，两个人都瘦了一圈。' : '你尽了力。' + spName(g) + '还是走了。') },
    { id: 'e_m_sp_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '另一半走了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '丧偶'); g.stat('心情', -10); },
      text: (g) => spName(g) + '走了。' + (g.recall('marriage') === 'mended' ? '那次长谈以后的十几年，是你们最好的日子。' : g.recall('marriage') === 'cold' ? '你们冷了那么多年，到最后才又说了很多话。' : '家里的另一半东西，你一样也没舍得扔。') },
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

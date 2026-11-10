/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const JOBT = { office: '公司職員', tech: '程式設計師', sales: '銷售', civil: '公務員', teacher: '老師', doctor: '醫生', nurse: '護士', soldier: '軍人',
    worker: '工人', rider: '外賣騎手', driver: '司機', farmer: '種地', boss: '做生意', shop: '開店', creator: '做內容', freelance: '自由職業', none: '無' };
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
  const spName = (g) => (JY.byId.sp ? g.name('sp') : '那個人');
  const kidsN = (g) => g.recall('kids') || 0;
  const hasKid = (g) => kidsN(g) > 0 && !!JY.byId.k1 && g.alive('k1');
  const kAge = (g) => (JY.byId.k1 ? g.ageOf('k1') : -1);
  const kn = (g) => (JY.byId.k1 ? g.name('k1') : '孩子');
  const kWho = (g) => CN.who(g, 'k1', true);
  const kHe = (g) => CN.he(g, 'k1');
  const kidAway = (g) => g.recall('custody') === 'ex';
  const house = (g) => g.recall('house') || 'none';
  const tier = (g) => g.recall('tier') || (g.recall('hukou') === 'rural' ? 5 : g.recall('hukou') === 'county' ? 4 : 3);
  const where = (g) => g.recall('workCity') || g.recall('homeCap') || '這座城';
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
  const BIG = ['北京', '上海', '廣州', '深圳'];
  const SHOP = { 1: 300000, 2: 200000, 3: 150000, 4: 100000, 5: 60000 };
  const CAR = { 1: 300000, 2: 250000, 3: 200000, 4: 150000, 5: 120000 };
  const TUTOR = { 1: 60000, 2: 40000, 3: 25000, 4: 15000, 5: 10000 };
  const RAISE = { 1: 1500000, 2: 800000, 3: 600000, 4: 450000, 5: 300000 };
  const AIDE = { 1: 96000, 2: 72000, 3: 60000, 4: 48000, 5: 36000 };
  const NURS = { 1: 72000, 2: 54000, 3: 45000, 4: 36000, 5: 30000 };
  const COMMUTE = { 1: '地鐵單程一個半鐘頭', 2: '地鐵四十分鐘', 3: '開車二十分鐘', 4: '騎電動車十分鐘', 5: '走路幾分鐘' };
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
  const paWord = (g) => { const p = parents(g); return p.length > 1 ? '爸媽' : p[0] === 'fa' ? '父親' : '母親'; };
  const paThey = (g) => (parents(g).length > 1 ? '他們' : CN.he(g, parents(g)[0]));
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
    keptOldHouse: '老家的房子一直留著，門口那棵樹還在',
  });

  /* ================= 35–49 岁 ================= */
  const NODES = [
    { id: 'm_35_mirror', age: 35, t: '三十五', auto: true,
      text: (g) => {
        const c = cat(g), j = job(g), h = house(g), t = tier(g);
        const JD = { teacher: '你帶過的第一屆學生，有的已經工作了。', doctor: '你一個月四個夜班，值完班的早上，看太陽是白的。', nurse: '你一個月四個夜班，值完班的早上，看太陽是白的。',
          civil: '你辦公桌的玻璃板下面，壓著十年前的合影。', soldier: '你在部隊裡已經算老兵了。', rider: '你的電動車換到第三輛了。', driver: '方向盤上的皮磨得發亮。',
          worker: '車間裡新裝了兩臺機械臂。', farmer: '地裡的活，一半交給了無人機。', creator: '賬號的粉絲漲不動了。', freelance: '接活的群裡，報價一年比一年低。' };
        const a = c === 'office' ? (t <= 2 ? '早上' + COMMUTE[t] + '，你被擠在車門邊。' : '') + '公司裡新來的年輕人管你叫“老師”，你知道這不全是客氣。'
          : c === 'stable' ? (JD[j] || '') + '單位裡的日子一眼能看到頭，你有時候覺得這是福氣，有時候不覺得。'
          : c === 'labor' ? (JD[j] || '') + '腰比前幾年容易酸了。最年輕的那個工友，比你小十五歲。'
          : c === 'own' ? (JD[j] || '店裡的賬你閉著眼都能算，就是算出來的數一年比一年小。') : '你三十五歲了。日子過得不快也不慢。';
        const b = h === 'mortgage' && owe(g) > 0 ? '房貸還欠 ' + fmt(owe(g) * 1e4) + '。' : h === 'rent' ? '房東又打電話說要漲租。' : h === 'own' ? '房子總算是自己的了。' : h === 'hometown' ? '你住在老家的房子裡。' : '';
        const m = cash(g) > 0 ? '卡里存著 ' + fmt(cash(g)) + '。' : '卡里沒剩什麼錢。';
        return a + b + m;
      } },
    { id: 'm_35_office', age: 35, t: '最佳化名單', loc: 'office', cond: (g) => cat(g) === 'office',
      text: (g) => (job(g) === 'tech' ? '新上的系統能自己寫程式碼、自己測。' : job(g) === 'sales' ? '老客戶開始直接跟 AI 下單。' : '報表、方案、會議紀要，新系統幾秒鐘就出來了。')
        + '公司要“降本增效”。主管找你談話，問你怎麼打算。你在' + where(g) + '已經幹了十年。',
      choices: [
        { t: (g) => '留下，接受降薪轉崗（降到約 ' + fmt(k1(mPay(g, job(g)) * 0.7)) + '/月，下一輪還可能有你）', canon: true, fx: (g) => { g.stat('事业', -8); g.stat('心情', -3); g.remember('crisis35', 'stay'); }, res: (g) => '工位從靠窗挪到了靠門。工資少了三成，你沒跟' + (married(g) ? spName(g) : '家裡') + '細說。' },
        { t: (g) => '拿賠償走人，去一家小公司（賠償約 ' + fmt(k1(myInc(g) / 12 * 11)) + '，小公司約 ' + fmt(mPay(g, job(g), null, -4)) + '/月，說倒就倒）', dev: 15, fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); g.stat('事业', -4); g.remember('crisis35', 'small'); },
          res: () => '你拿了 ' + fmt(A) + ' 的賠償。小公司的老闆比你小八歲，說話很客氣。頭一個月，你重新學會了做所有的事。' },
        { t: (g) => '拿賠償，自己開家小店（本錢 ' + fmt(SHOP[tier(g)] || 150000) + '，' + CN.jobLine(g, 'shop') + '）', dev: 25,
          fx: (g) => { A = k1(myInc(g) / 12 * 11); CN.earn(g, A); B = SHOP[tier(g)] || 150000; M = spend(g, B); CN.setJob(g, 'shop', '開了家小店'); g.remember('crisis35', 'shop'); },
          res: () => '賠償 ' + fmt(A) + '。盤鋪面、裝修、進貨一共花了 ' + fmt(B) + (M ? '，不夠的 ' + fmt(M) + ' 是借的' : '') + '。開張那天，前同事送來一個花籃。' },
        { t: (g) => '回老家考個編制（' + CN.jobLine(g, 'civil', 4) + '）', dev: 25, check: ['学识', 60], cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'civil', '縣裡的事業編'); g.remember('crisis35', 'home'); g.stat('心情', 4); }, res: '三十五歲是報名的最後一年。你考上了，搬回了老家。',
          fail: { fx: (g) => { backHome(g); CN.setJob(g, 'none', '待業'); g.remember('crisis35', 'idle'); g.stat('心情', -6); }, res: '差了兩分。你還是搬回了老家，先在家裡待著。', dev: 10 } },
      ] },
    { id: 'm_35_stable', age: 35, t: '競聘', loc: 'office', cond: (g) => cat(g) === 'stable',
      text: (g) => ({ teacher: '學校裡空出一個年級主任的位子。', doctor: '科裡空出一個副主任的位子。', nurse: '科裡空出一個護士長的位子。', soldier: '隊裡空出一個副職。' }[job(g)] || '單位裡空出一個副科的位子。') + '領導私下問你，要不要報個名。',
      choices: [
        { t: '算了，安安穩穩幹自己的', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('stableRoute', 'steady'); },
          res: (g) => '名單貼出來，上面沒有你。你下班照常去' + (hasKid(g) && kAge(g) < 12 && !kidAway(g) ? '接孩子。' : '菜市場買菜。') },
        { t: '報名去競聘', dev: 15, check: ['人缘', 55],
          fx: (g) => { g.stat('事业', 10); CN.setJob(g, job(g), JOBT[job(g)] + '（中層）'); g.remember('stableRoute', 'lead'); }, res: '你上了。開會坐的位置往前挪了兩排，下班也晚了兩個鐘頭。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('stableRoute', 'lost'); }, res: '你沒上。上的那個人比你會說話。之後幾年，你們在走廊裡碰見都點個頭。', dev: 5 } },
        { t: (g) => '辭職，出去闖一闖（借 ¥20 萬做本錢，' + CN.jobRisk('boss') + '）', dev: 30, fx: (g) => { borrow(g, 20); CN.setJob(g, 'boss', '辭職下海做生意'); g.remember('stableRoute', 'quit'); }, res: '家裡人都覺得你瘋了。你交了辭職信，找親戚借了 ¥20 萬。' },
      ] },
    { id: 'm_35_labor', age: 35, t: '幹不動的那一天', cond: (g) => cat(g) === 'labor',
      text: (g) => (job(g) === 'farmer' ? '村裡的地越來越多人包給大戶了。' : job(g) === 'rider' ? '平臺上多了一批送餐機器人，不吃飯，不請假。' : '廠裡、站裡新添了一批機器人，不吃飯，不請假。') + '你算了算，自己還能這麼幹幾年。',
      choices: [
        { t: '接著幹，多接點活', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('事业', 5); g.remember('laborRoute', 'grind'); }, res: '你每天比別人早來一個鐘頭。錢是多了，晚上翻身的時候腰會響。' },
        { t: (g) => '去學修機器人（學費 ¥6,000，學成' + CN.jobLine(g, 'worker', null, 8) + '）', dev: 20, check: ['学识', 40],
          fx: (g) => { spend(g, 6000); CN.setJob(g, 'worker', '機器人維修工'); g.stat('事业', 8); g.remember('laborRoute', 'skill'); }, res: '培訓班學費 ¥6,000。你夜裡去上課，三個月後拿到了證。以前頂替你的機器，現在歸你修。',
          fail: { fx: (g) => { spend(g, 6000); g.stat('心情', -3); g.remember('laborRoute', 'grind'); }, res: '那些線路圖你看不進去。¥6,000 的學費白交了，你又回去幹老本行。', dev: 5 } },
        { t: '回老家，不在外面熬了', dev: 15, cond: (g) => !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, g.recall('hukou') === 'rural' ? 'farmer' : 'shop', g.recall('hukou') === 'rural' ? '回鄉種地' : '在老家開小賣部'); g.remember('laborRoute', 'home'); g.stat('心情', 3); }, res: '你把被褥打包，坐了一夜的車。老家的早飯還是那個味道。' },
        { t: '換個地方，去縣城開個修車鋪', dev: 15, cond: (g) => atHome(g) && job(g) !== 'farmer',
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'shop', '開修車鋪'); g.remember('laborRoute', 'home'); }, res: () => '租鋪面、買工具花了 ¥5 萬' + (M ? '，借了 ' + fmt(M) : '') + '。門口的招牌是你自己刷的。' },
      ] },
    { id: 'm_35_own', age: 35, t: '生意', cond: (g) => cat(g) === 'own',
      text: (g) => '有人來找你，說現在正是擴張的好時候，問你要不要再開一家、多投一點。算下來，要 ' + fmt(SHOP[tier(g)] || 150000) + '。',
      choices: [
        { t: '穩著做，不折騰', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('ownRoute', 'steady'); }, res: '你把那人送走，接著擦你的櫃檯。' },
        { t: '借錢擴張', dev: 20, check: ['事业', 45],
          fx: (g) => { B = SHOP[tier(g)] || 150000; M = spend(g, B); g.stat('事业', 10); g.remember('ownRoute', 'grow'); }, res: () => '你投進去 ' + fmt(B) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。第二家店開起來了，你開始學著當老闆。',
          fail: { fx: (g) => { borrow(g, Math.round((SHOP[tier(g)] || 150000) / 1e4)); g.stat('心情', -5); g.remember('ownRoute', 'debt'); }, res: (g) => '新店開在了不該開的地方。半年後關門，留下 ' + fmt(SHOP[tier(g)] || 150000) + ' 的賬。', dev: 10 } },
        { t: '關了，去找份上班的工作', dev: 15, fx: (g) => { CN.setJob(g, 'office', '公司職員'); g.stat('心情', 2); g.remember('ownRoute', 'quit'); }, res: '你把鑰匙交還房東，買了兩件襯衫，去面試了。' },
      ] },
    { id: 'm_35_none', age: 35, t: '找點事做', cond: (g) => cat(g) === 'none',
      text: '這些年你沒有一份正經工作。家裡人問起來，你總說再看看。',
      choices: [
        { t: '找份活幹，先掙著', canon: true, fx: (g) => { CN.setJob(g, 'worker', CN.pick(['倉庫理貨員', '物業保安', '超市理貨員', '保潔'])); g.remember('noneRoute', 'work'); }, res: '工資不高，按月發。你第一次覺得，有個地方要去也挺好。' },
        { t: '在家照顧一家老小', dev: 10, cond: (g) => married(g) || hasKid(g) || parentAlive(g), fx: (g) => { g.info('职业', '全職在家'); g.stat('人缘', 4); g.remember('noneRoute', 'home'); }, res: '一日三餐、接送、看病，都是你。沒人給你發工資，也沒人能離得開你。' },
        { t: '學門手藝，自己接活', dev: 20, check: ['学识', 35],
          fx: (g) => { spend(g, 8000); CN.setJob(g, 'freelance', CN.pick(['裝修師傅', '修家電的', '做蛋糕的', '剪輯師'])); g.stat('事业', 6); g.remember('noneRoute', 'craft'); }, res: '學手藝花了 ¥8,000。半年後，你的名字開始在幾個群裡被人轉來轉去。“找他，手藝好。”',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('noneRoute', 'work'); CN.setJob(g, 'worker', '倉庫理貨員'); }, res: '學了半年沒學成，你還是去了倉庫。', dev: 5 } },
      ] },
    { id: 'm_36_parents', age: 36, t: '爸媽', auto: true, cond: (g) => parentAlive(g),
      text: (g) => {
        const two = parents(g).length > 1;
        const a = two ? '爸媽都過了六十。' : CN.who(g, parents(g)[0], true) + (withPa(g) ? '的頭髮全白了。' : '守著老家的房子，另一半已經不在了。');
        const b = withPa(g) ? paThey(g) + '和你住在一起，早上你出門的時候，廚房裡已經有了動靜。'
          : sibs(g) ? '兄弟姐妹的群裡，大家開始說起誰回家多、誰回家少。' : '你是獨生子女，這件事你從小就知道意味著什麼。';
        return a + b + (!withPa(g) && !atHome(g) && tier(g) <= 2 ? '老家離你一千多里。' : '');
      } },
    { id: 'm_36_money', age: 36, t: '閒錢', loc: 'home', cond: (g) => cash(g) >= 80000,
      text: (g) => '年底算賬，卡里攢下了 ' + fmt(cash(g)) + '。' + (house(g) === 'mortgage' && owe(g) > 0 ? '房貸還欠 ' + fmt(owe(g) * 1e4) + '。' : '') + '同事都在聊基金，' + (married(g) ? spName(g) : pAlive(g, 'mo') ? '你媽' : '銀行的櫃員') + '說存定期最穩。',
      choices: [
        { t: '存定期，留著應急', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.remember('money36', 'safe'); g.remember('inv36', A); }, res: () => '你存了 ' + fmt(A) + ' 的三年定期。利息不多，晚上睡得著。' },
        { t: '提前還一部分房貸', dev: 10, cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.remember('money36', 'prepay'); g.remember('inv36', A); },
          res: (g) => '你提前還了 ' + fmt(A) + '。月供少了一截，那個月你' + (CN.hhCount(g) > 1 ? '請全家吃了頓火鍋。' : '給自己買了一雙好鞋。') },
        { t: '買基金', dev: 10, fx: (g) => { A = w1(cash(g) * 0.5); CN.invest(g, A, 'fund'); g.remember('money36', 'fund'); g.remember('inv36', A); }, res: () => '你分幾隻基金買了 ' + fmt(A) + '。手機上多了一個每天都想點開的軟體。' },
        { t: '自己炒股', dev: 20, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'stock'); g.remember('money36', 'stock'); g.remember('inv36', A); }, res: () => '你開了戶，轉進去 ' + fmt(A) + '。午飯的時候，你開始看 K 線。' },
      ] },
    { id: 'm_37_crisis_echo', age: 37, t: '兩年以後', auto: true,
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
        if (c === 'stay') return '那次降薪轉崗以後，你在公司裡一直很安靜。又一輪最佳化，名單上還是沒有你。你開始週末去學一門新東西。';
        if (c === 'small') return '小公司沒撐過兩年，你又換了一家。你發現自己已經很會換工作了，新老闆很看重你。';
        if (c === 'shop') return '小店的生意時好時壞。熟客記得你的名字，你也記得他們愛吃什麼。';
        if (c === 'home') return '在縣裡上班，下午五點半就到家了。你開始在院子裡種菜。';
        if (c === 'idle') return '回老家以後，你在家待了一年多，後來託人進了一家廠裡管倉庫。';
        const s = g.recall('stableRoute');
        if (s === 'lead') return '當了中層以後，你的酒量和白頭髮一起長了。';
        if (s === 'lost') return '沒競聘上那件事，你後來很少想起。倒是那個人先調走了。';
        if (s === 'quit') return '下海的第二年，你總算沒再賠錢。借的錢每個月按時在還。';
        if (s === 'steady') return '你還是坐在原來那張桌子前。窗外的樹長高了一截。';
        const l = g.recall('laborRoute');
        if (l === 'skill') return '你成了廠裡最吃香的維修工，半夜也有人打電話找你。';
        if (l === 'home') return '回老家以後，錢掙得少了，人胖了一圈。';
        if (l === 'grind') return '你又幹了兩年。體檢單上多了幾個箭頭，存款也多了幾位。';
        const o = g.recall('ownRoute');
        if (o === 'grow') return '兩家店，你兩頭跑。第二家店這兩年掙回了 ' + fmt(A) + '，賬本換成了平板。';
        if (o === 'debt') return '那筆賬還壓著。你開始接一些以前看不上的小單，一筆一筆往回填。';
        if (o === 'quit') return '上班以後，你每個月十號等工資。你說這樣睡得著覺。';
        if (o === 'steady') return '你的店還開在老地方。附近開開關關好幾家，你還在。';
        const n = g.recall('noneRoute');
        if (n === 'home') return '家裡的事全在你手上。' + (hasKid(g) ? '孩子說，家裡最離不開的人是你。' : '家裡人說，沒你不行。');
        if (n === 'craft') return '找你幹活的人要提前一個月排隊了。';
        return '那份活你幹下來了。每天準時出門，準時回家。';
      } },
    { id: 'm_37_kid2', age: 37, t: '再要一個', loc: 'home',
      cond: (g) => married(g) && kidsN(g) === 1 && hasKid(g) && kAge(g) >= 2 && g.recall('kidPlan') !== 'dink' && (CN.sexOf(g) === '女' ? g.age : g.ageOf('sp')) <= 40,
      text: (g) => kWho(g) + '問你，能不能給' + kHe(g) + '生個弟弟妹妹。' + (g.recall('kid2') === 'no' ? '當年你們說好只要一個。' : '') + '養大一個孩子，在' + where(g) + '少說要 ' + fmt(RAISE[tier(g)] || 600000) + '。',
      choices: [
        { t: '一個就夠了', canon: true, fx: (g) => { g.remember('kid37', 'one'); g.stat('心情', 1); }, res: (g) => '你們把' + kn(g) + '小時候的衣服打包，送給了親戚家。' },
        { t: '再要一個', dev: 15, check: ['健康', 45],
          fx: (g) => { CN.haveKid(g); g.remember('kid37', 'two'); g.stat('心情', 4); g.stat('健康', -3); }, res: (g) => '老二出生了，叫' + g.name('k2') + '。' + kn(g) + '趴在保溫箱外面看了很久。',
          fail: { fx: (g) => { g.remember('kid37', 'tried'); g.stat('心情', -2); }, res: '試了一年多，沒懷上。你們也就不強求了。', dev: 5 } },
      ] },

    /* 38 岁：婚姻 */
    { id: 'm_38_marriage', age: 38, t: '冷戰', loc: 'home', cond: (g) => married(g),
      text: (g) => '你和' + spName(g) + '已經很久沒好好說過話了。飯桌上，兩個人各看各的手機。',
      choices: [
        { t: '就這麼過吧', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('marriage', 'cold'); }, res: '日子照舊。家裡很安靜，安靜得像一間旅館。' },
        { t: '找個時間好好談一次', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); g.remember('marriage', 'mended'); }, res: '你們在樓下的燒烤攤坐到半夜。說開了，也哭了。回家的路上，你們牽了手。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('marriage', 'cold'); }, res: '話說到一半就吵了起來。之後，你們更少說話了。', dev: 3 } },
        { t: '離婚', dev: 25,
          fx: (g) => {
            const kid = hasKid(g);
            g.unrel('妻子'); g.unrel('丈夫'); g.remember('love', 'divorced'); g.info('婚姻', '離異'); g.remember('marriage', 'split');
            if (kid) g.remember('custody', g.rnd() < 0.5 ? 'me' : 'ex');
            A = 0; B = 0; M = '';
            if (hv(g) > 0 && g.recall('custody') === 'me') { A = Math.max(0, Math.round((hv(g) - owe(g)) / 2) * 1e4); B = spend(g, A); M = 'keep'; }
            else if (hv(g) > 0) { CN.sellHouse(g); M = 'sold'; }
            if (cash(g) > 0) CN.pay(g, cash(g) / 2);
            g.stat('心情', -6);
          },
          res: () => '手續辦得比想象中快。' + (M === 'keep' ? '房子留給你和孩子，你補給對方 ' + fmt(A) + (B ? '，其中 ' + fmt(B) + ' 是借的' : '') + '。' : M === 'sold' ? '房子賣了，錢一人一半。你又開始租房。' : '存款一人一半。') + '走出民政局，你們在門口站了一會兒，各自走了。' },
      ] },
    { id: 'm_38_single', age: 38, t: '三十八歲', cond: (g) => !married(g),
      text: (g) => (g.recall('love') === 'divorced' ? '離婚好幾年了。' : g.recall('love') === 'widowed' ? '另一半走了好幾年了。' : '三十八歲，你還是一個人。')
        + (parentAlive(g) ? paWord(g) + '在電話裡換了個說法：“找個伴，老了有人說話。”' : '過年的時候，親戚們換了個說法：“找個伴，老了有人說話。”'),
      choices: [
        { t: '聽家裡的，去相親', canon: true, fx: (g) => { A = w1(Math.min(80000, hinc(g) * 0.3)); remarry(g, { origin: '相親認識' }); spend(g, A); g.remember('marry38', 'match'); g.stat('心情', 1); },
          res: (g) => '見了第五個，是' + spName(g) + '。你們都沒說愛不愛，只說合適。半年後領了證，酒席簡單辦了幾桌，花了 ' + fmt(A) + '。' },
        { t: '一個人也挺好', dev: 15, fx: (g) => { g.info('婚姻', g.recall('love') === 'divorced' ? '離異，單身' : g.recall('love') === 'widowed' ? '喪偶' : '單身'); g.stat('心情', 4); g.remember('marry38', 'alone'); },
          res: '你給自己買了一個好一點的床墊，養了一盆不會死的綠蘿。' },
        { t: '等一個聊得來的人', dev: 10, check: ['人缘', 50],
          fx: (g) => { remarry(g, { origin: '朋友介紹認識' }); spend(g, 30000); g.stat('心情', 6); g.remember('marry38', 'love'); }, res: (g) => '朋友聚會上，' + spName(g) + '坐在你旁邊。你們從一部老電影聊到了天亮。第二年，你們領了證，請朋友們吃了頓飯。',
          fail: { fx: (g) => { g.stat('心情', -2); g.remember('marry38', 'alone'); }, res: '那個人一直沒出現。後來你也不等了，日子照樣過得有滋味。', dev: 3 } },
      ] },
    { id: 'm_39_love_echo', age: 39, t: '這一年', auto: true, cond: (g) => !!(g.recall('marriage') || g.recall('marry38')),
      fx: (g) => { const m = g.recall('marriage'); if (m === 'cold') g.stat('健康', -2); if (m === 'mended') g.stat('心情', 3); },
      text: (g) => {
        const m = g.recall('marriage');
        if (m === 'mended' && married(g)) return '那次長談以後，你們週末會一起去買菜。' + spName(g) + '記得你不吃香菜。';
        if (m === 'cold' && married(g)) return '你們還在一個屋簷下。你開始失眠，後來學會了睡前去樓下走兩圈。';
        if (m === 'split') return g.recall('custody') === 'me' ? '離婚以後，孩子跟你。早上做兩份早飯，晚上聽寫單詞，一個人頂兩個人用。孩子說你做的蛋炒飯最好吃。' : g.recall('custody') === 'ex' ? '離婚以後，孩子跟了對方。每個週六是你的，你提前一週就想好去哪兒。' : '離婚以後，你的屋子空了一半。你把另一半堆滿了書。';
        const l = g.recall('marry38');
        if (l === 'match' && married(g)) return '相親結婚的日子，比你想的平靜。兩個人各讓一步，也過得下去。';
        if (l === 'love' && married(g)) return '晚了幾年遇見的人，你格外珍惜。';
        if (!married(g)) return '你的日子很自由。週末去爬山，晚上看書，生病了也有朋友來送粥。';
        return '這一年平平淡淡地過去了。';
      } },
    { id: 'm_39_money_echo', age: 39, t: '那筆錢', auto: true, cond: (g) => !!g.recall('money36'),
      text: (g) => {
        const m = g.recall('money36'), p = Number(g.recall('inv36')) || 0, v = invested(g);
        if (m === 'prepay') return '提前還的那 ' + fmt(p) + '，讓你每個月多出一點喘氣的空間。' + (owe(g) > 0 ? '房貸還剩 ' + fmt(owe(g) * 1e4) + '。' : '房貸已經還清了。');
        if (m === 'safe') return '定期到期了，' + fmt(p) + ' 多了一點利息。你又存了三年。';
        if (!v) return '當年投進去的 ' + fmt(p) + '，後來你都取了出來。';
        return (v >= p ? '三年過去，當年投進去的 ' + fmt(p) + '，現在是 ' + fmt(v) + '。你沒跟別人炫耀。' : '三年過去，當年投進去的 ' + fmt(p) + '，現在只剩 ' + fmt(v) + '。你不怎麼開啟那個軟體了。');
      } },

    /* 40 岁 */
    { id: 'm_40_nokid', age: 40, t: '孩子', loc: 'hospital', cond: (g) => married(g) && kidsN(g) === 0,
      text: '你們結婚好些年了，一直沒有孩子。雙方父母不再當面問，只是嘆氣。',
      choices: [
        { t: '去醫院試試', canon: true, check: ['健康', 50],
          fx: (g) => { M = spend(g, 120000); CN.haveKid(g); g.stat('心情', 8); g.remember('nokid', 'ivf'); }, res: () => '跑了一年多醫院，花了 ¥12 萬' + (M ? '，借了 ' + fmt(M) : '') + '。孩子哭出聲的那一刻，你蹲在走廊上哭了。',
          fail: { fx: (g) => { spend(g, 90000); g.stat('心情', -6); g.remember('nokid', 'failed'); }, res: '試了三次，花了 ¥9 萬，都沒成。最後一次出來，你們誰也沒說話。', dev: 0 } },
        { t: '不要了，兩個人過', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('nokid', 'dink'); }, res: '你們把多出來的那間屋改成了書房。' },
        { t: '領養一個', dev: 25, fx: (g) => { spend(g, 20000); CN.haveKid(g, { born: g.Y - 3, origin: '領養的孩子' }); g.stat('人缘', 4); g.remember('nokid', 'adopt'); }, res: '手續跑了大半年。孩子第一次叫你的時候，叫得很小聲。你答應得很大聲。' },
      ] },
    { id: 'm_40_body', age: 40, t: '四十', cond: (g) => !(married(g) && kidsN(g) === 0),
      text: '四十歲生日那天，你爬了三層樓，喘得厲害。鏡子裡的人，肚子先到了。',
      choices: [
        { t: '照舊，忙完這陣再說', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('body40', 'ignore'); }, res: '這一陣一直沒忙完。' },
        { t: '開始跑步', dev: 10, fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); g.remember('body40', 'run'); }, res: '第一天跑了一公里。第二天腿疼得下不了樓，第三天你又去了。' },
        { t: '犒勞一下自己，買輛好車', dev: 10, cond: (g) => cash(g) >= (CAR[tier(g)] || 200000) * 1.5,
          fx: (g) => { A = CAR[tier(g)] || 200000; spend(g, A); g.stat('心情', 5); g.remember('body40', 'car'); }, res: () => '新車 ' + fmt(A) + '，停在樓下。那天晚上你下樓看了它好幾次。' },
      ] },
    { id: 'm_41_body_echo', age: 41, t: '身體', auto: true, cond: (g) => !!(g.recall('body40') || g.recall('nokid') || g.recall('kid37')),
      fx: (g) => { if (g.recall('body40') === 'run') g.stat('健康', 3); if (g.recall('body40') === 'ignore') g.stat('健康', -2); },
      text: (g) => {
        const n = g.recall('nokid'), k = g.recall('kid37');
        if (n === 'ivf') return '家裡多了一個小人，你的覺少了一半。四十多歲當爸媽，抱孩子的時候腰會響。';
        if (n === 'failed') return '那件事以後，你們去了一趟很遠的地方。回來的時候，好像放下了一些。';
        if (n === 'dink') return '同齡人都在聊補習班。你們在聊下一次去哪兒。';
        if (n === 'adopt') return '孩子慢慢不怕生了，會在你下班的時候撲過來。';
        if (k === 'two') return '老二會走路了，跟在' + kn(g) + '後面跑。家裡的開銷多了一截，笑聲也多了一截。';
        if (k === 'tried') return '那件事以後，你們把心思都放在' + kn(g) + '身上。週末三個人去爬山。';
        const b = g.recall('body40');
        if (b === 'run') return '跑了一年，你瘦了十幾斤。小區裡跑步的人見了你會打招呼。';
        if (b === 'car') return '新車開了一年，後備箱裡多了' + (hasKid(g) ? '孩子的玩具、' : '') + (parentAlive(g) ? '老人的藥、' : '') + '一箱一箱的礦泉水。';
        return '體檢的箭頭又多了兩個。你把報告折起來塞進了抽屜。';
      } },

    /* 42 岁：第二波 */
    { id: 'm_42_office', age: 42, t: '第二個十年', loc: 'office', cond: (g) => cat(g) === 'office',
      text: '你所在的行當又變了樣。很多活交給了 AI，剩下的人要麼帶著 AI 幹活，要麼被 AI 帶著幹活。',
      choices: [
        { t: '熬著，當個中層', canon: true, fx: (g) => { g.stat('事业', 5); g.stat('健康', -2); g.remember('career42', 'mid'); }, res: '你手下有了幾個人，也有了更多的會。' },
        { t: (g) => '轉去做 AI 訓練（培訓 ¥1.2 萬，' + CN.jobLine(g, 'tech', null, 8) + '）', dev: 20, check: ['学识', 55],
          fx: (g) => { spend(g, 12000); CN.setJob(g, 'tech', 'AI 訓練師'); g.stat('事业', 8); g.remember('career42', 'pivot'); }, res: '培訓花了 ¥1.2 萬。你把十幾年的行業經驗教給機器。它學得很快，你也學了不少。',
          fail: { fx: (g) => { spend(g, 12000); g.stat('心情', -3); g.remember('career42', 'mid'); }, res: '培訓考核沒過，¥1.2 萬打了水漂。你回到原來的位置，假裝沒去過。', dev: 5 } },
        { t: (g) => '離開大城市，回老家（工資少一半，約 ' + fmt(mPay(g, 'office', 3)) + '/月，通勤十分鐘）', dev: 20, cond: (g) => tier(g) <= 2 && !atHome(g),
          fx: (g) => { backHome(g); CN.setJob(g, 'office', '老家的公司職員'); g.stat('心情', 5); g.remember('career42', 'home'); }, res: '你在老家找了一份工資少一半的工作。通勤從一個半鐘頭變成了十分鐘。' },
      ] },
    { id: 'm_42_stable', age: 42, t: '調動', cond: (g) => cat(g) === 'stable',
      text: '單位要選人去偏遠的縣裡幫扶三年，有補貼。報了名的，回來提拔優先。',
      choices: [
        { t: '不去，家裡離不開', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: (g) => '你把報名表還了回去。' + (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? '那三年，你沒錯過孩子的一次家長會。' : '那三年，家裡的大事小事都有你。') },
        { t: '報名去', dev: 20, fx: (g) => { g.move('county', '偏遠的山區縣'); g.stat('事业', 10); g.stat('人缘', -3); g.remember('career42', 'remote'); }, res: '你帶著兩個箱子上了山。那裡的人說話你一開始聽不懂。' },
        { t: (g) => '出來自己幹（本錢 ' + fmt(w1((SHOP[tier(g)] || 150000) * 1.2)) + '，鐵飯碗沒了，' + CN.jobRisk('boss') + '）', dev: 25, cond: (g) => ['teacher', 'doctor', 'nurse'].includes(job(g)),
          fx: (g) => { A = w1((SHOP[tier(g)] || 150000) * 1.2); M = spend(g, A); CN.setJob(g, 'boss', job(g) === 'teacher' ? '自己辦輔導班' : '開了一家診所'); g.remember('career42', 'private'); },
          res: () => '你辭掉了鐵飯碗，投進去 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。招牌掛上去那天，你在門口站了很久。' },
      ] },
    { id: 'm_42_labor', age: 42, t: '換個活法', cond: (g) => cat(g) === 'labor',
      text: '老鄉打電話來，說有個鋪面，問你要不要合夥，每人出 ¥8 萬。另一個老鄉說，南邊有個大工地，一個月頂這裡兩個月。',
      choices: [
        { t: '哪兒也不去，接著幹', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('事业', 2); g.remember('career42', 'grind'); }, res: '你還在老地方。門口賣早點的換了三撥人，都認得你。' },
        { t: (g) => '和老鄉合夥開店（出 ¥8 萬，' + CN.jobRisk('shop') + '）', dev: 15, cond: (g) => cash(g) >= 60000,
          fx: (g) => { M = spend(g, 80000); CN.setJob(g, 'shop', '和老鄉合夥開店'); g.remember('career42', 'shop'); }, res: () => '你出了 ¥8 萬' + (M ? '，差的 ' + fmt(M) + ' 是借的' : '') + '。你們開了一家麵館，你負責後廚，他負責算賬。' },
        { t: (g) => '去更遠的地方（約 ' + fmt(mPay(g, job(g), 1, 6)) + '/月，一年回一次家）', dev: 15, fx: (g) => { CN.goCity(g, 1); g.stat('事业', 6); g.stat('人缘', -4); g.remember('career42', 'far'); },
          res: (g) => '你去了' + g.recall('workCity') + '。一年回一次家，' + (hasKid(g) && kAge(g) < 15 ? '孩子見你要先愣一下。' : '家裡人在車站接你，你瘦了一圈。') },
      ] },
    { id: 'm_42_own', age: 42, t: '新路子', cond: (g) => cat(g) === 'own',
      text: '做生意的朋友都在開直播，說一晚上能賣掉你一個月的貨。',
      choices: [
        { t: '老老實實做老客戶', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: '你的客戶大多跟了你十年。他們說，就信你。' },
        { t: '自己上鏡開直播', dev: 15, check: ['人缘', 45],
          fx: (g) => { spend(g, 20000); g.stat('事业', 8); g.remember('career42', 'live'); }, res: '買燈、買裝置花了 ¥2 萬。第一晚只有十三個人看。三個月後，有人在街上認出了你。',
          fail: { fx: (g) => { spend(g, 20000); g.stat('心情', -3); g.remember('career42', 'steady'); }, res: '對著鏡頭，你一句話也說不利索。¥2 萬的裝置收進了櫃子。', dev: 5 } },
        { t: '交給合夥人，自己歇兩年', dev: 15, fx: (g) => { g.stat('心情', 5); g.stat('事业', -5); g.remember('career42', 'rest'); }, res: '你第一次在工作日的上午去公園。原來上午的公園這麼多人。' },
      ] },
    { id: 'm_42_none', age: 42, t: '出去做點事', cond: (g) => cat(g) === 'none',
      text: '社群裡貼了招工啟事：居家養老服務員，培訓上崗，離家近。',
      choices: [
        { t: '還是在家', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'stayhome'); }, res: '你把啟事拍下來發給了鄰居。' },
        { t: '去報名', dev: 15, fx: (g) => { CN.setJob(g, 'worker', '養老服務員'); g.remember('career42', 'work'); }, res: '你每天去幾戶老人家裡，量血壓、陪著說話。有個老太太總把你叫成她女兒的名字。' },
      ] },
    { id: 'm_43_career_echo', age: 43, t: '工作', auto: true, cond: (g) => !!g.recall('career42'),
      fx: (g) => { const c = g.recall('career42'); A = 0; if (c === 'far') g.stat('人缘', -2); if (c === 'live' || c === 'pivot') g.stat('事业', 3); if (c === 'remote') { A = w1(myInc(g) * 0.3); CN.earn(g, A); } },
      text: (g) => ({
        mid: '你的會越開越多，程式碼、方案、報表都交給了 AI，你負責對它們說“不行，重來”。',
        pivot: '做 AI 訓練的這一年，你見到的年輕人都管你叫前輩。',
        home: '回老家的第一年，你胖了，也睡得著了。',
        steady: cat(g) === 'own' ? '店裡又過了一年。老客戶還在，有的已經帶著孩子來了。' : '你在原單位又過了一年，一切都和去年差不多。',
        stayhome: '你還是在家忙裡忙外。那張招工啟事，鄰居後來去了，常來跟你講那些老人的事。',
        remote: '山區縣的幫扶，你帶出了一條路、一所小學的新食堂，攢下 ' + fmt(A) + ' 的補貼。走的時候，有人往你車裡塞了兩隻雞。',
        private: '自己乾的頭一年最難。第二年，回頭客多了起來。',
        grind: '你又幹了一年。工友換了好幾茬，你成了最老的那個，新人都找你請教。',
        shop: '麵館的招牌被油煙燻黃了。中午十二點，門口排隊。',
        far: '在外地的一年，你攢下了錢，也攢下了和家裡越來越短的視訊通話。',
        live: '直播間裡叫你“哥”“姐”的人越來越多，你記不住他們的名字，他們記得你的。',
        rest: '歇了一年，你重新回店裡看了看。合夥人把店打理得還行，你有點放心，也有點失落。',
        work: '照顧老人的活不輕鬆。你常想，等自己老了，會是誰來敲門。',
      }[g.recall('career42')] || '工作上，這一年平平穩穩。') },

    /* 44 岁：房子 */
    { id: 'm_44_buy', age: 44, t: '房子', cond: (g) => ['none', 'rent'].includes(house(g)),
      text: (g) => '你在' + where(g) + '租房住了這麼多年。' + (hasKid(g) && !kidAway(g) && kAge(g) >= 4 && kAge(g) < 18 ? kn(g) + '問你：我們什麼時候有自己的家？' : '房東說要賣房，讓你考慮一下。')
        + '這裡一套普通的房子要 ' + fmt(CN.price(g) * 1e4) + '，你卡里有 ' + fmt(Math.max(0, cash(g))) + '。',
      choices: [
        { t: '接著租，不揹債', canon: true, fx: (g) => { g.remember('house', 'rent'); g.stat('心情', 2); g.remember('house44', 'rent'); }, res: '你換了一套離單位近的。錢留在手裡，你覺得踏實。' },
        { t: '換套便宜點的房子，攢兩年首付', dev: 10, fx: (g) => { g.remember('house44', 'save'); g.stat('心情', -1); }, res: '你搬到了遠一點的小區，房租省了三分之一。每個月發了工資，先往買房的卡里轉一筆。' },
        { t: '回老家縣城買一套', dev: 10, cond: (g) => tier(g) <= 3 && cash(g) >= CN.price(g, 4) * 0.3e4 && (cash(g) >= CN.price(g, 4) * 1.1e4 || canLoan(g, CN.price(g, 4) * 0.7)),
          fx: (g) => { const p = CN.price(g, 4); const down = cash(g) >= p * 1.1e4 ? 1 : 0.3; A = p * down * 1e4; CN.buyHouse(g, { tier: 4, price: p, down }); g.remember('house44', 'county'); },
          res: (g) => (house(g) === 'own' ? '縣城的房子 ' + fmt(A) + '，你一次付清了。' : '首付 ' + fmt(A) + '，剩下的貸款。') + '鑰匙拿到手，你在空蕩蕩的客廳裡坐了一下午。' },
        { t: '就在這兒，咬牙買', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.2e4 && canLoan(g, CN.price(g) * 0.7),
          fx: (g) => { const c0 = cash(g); A = CN.price(g) * 0.3e4; CN.buyHouse(g, { down: 0.3 }); B = cover(g, c0); g.remember('house44', 'bought'); },
          res: () => '首付 ' + fmt(A) + (B ? '，掏空了積蓄，又找親戚借了 ' + fmt(B) : '，掏空了積蓄') + '。合同簽完，你算了算，房貸要還到六十多歲。' },
      ] },
    { id: 'm_44_loan', age: 44, t: '房貸', cond: (g) => house(g) === 'mortgage' && owe(g) > 0,
      text: (g) => '房貸還欠 ' + fmt(owe(g) * 1e4) + '，一年要還 ' + fmt((Number(g.recall('loanBase')) || owe(g)) * 0.065e4) + '。' + (tier(g) <= 2 ? '小區的房價比你買的時候跌了一些。' : '') + '每個月照樣扣。',
      choices: [
        { t: '接著還', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('house44', 'pay'); }, res: '你把扣款日設在發工資的第二天，眼不見心不煩。' },
        { t: '攢了一筆，提前還一部分', dev: 10, cond: (g) => cash(g) >= 150000,
          fx: (g) => { A = prepay(g, w1(cash(g) * 0.6)); g.stat('心情', 4); g.remember('house44', 'early'); },
          res: (g) => '你提前還了 ' + fmt(A) + '。月供少了一截，那個月你' + (CN.hhCount(g) > 1 ? '請全家吃了頓火鍋。' : '給自己買了一雙好鞋。') },
        { t: '賣了，換一套小的', dev: 15, cond: (g) => hv(g) > 0,
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 0.6); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: cash(g) >= p * 1e4 ? 1 : 0.3 }); cover(g, c0); g.remember('house44', 'small'); },
          res: (g) => (house(g) === 'own' ? '換了一套小兩室，房貸沒了，你一下子輕了二十斤似的。' : '換了一套小兩室，房貸少了一大半。') },
        { t: '賣了舊房，換一套大的', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= hv(g) * 1.5 * 0.3e4 && canLoan(g, hv(g) * 1.05 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(hv(g) * 1.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => '你換了一套三室的。' + kn(g) + '有了自己的房間，房貸又從頭算起' + (B ? '，還找親戚借了 ' + fmt(B) : '') + '。' },
      ] },
    { id: 'm_44_own', age: 44, t: '房子的事', cond: (g) => ['own', 'hometown'].includes(house(g)),
      text: (g) => '房子是自己的了' + (hv(g) ? '，值 ' + fmt(hv(g) * 1e4) : '') + '。有人勸你再買一套收租，有人勸你換套大的。',
      choices: [
        { t: '留著自己住，不折騰', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('house44', 'keep'); }, res: '你把陽臺改成了一個小花園。' },
        { t: '再買一套小的出租', dev: 15, cond: (g) => cash(g) >= CN.price(g) * 0.7 * 0.3e4 && canLoan(g, CN.price(g) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g) * 0.7); A = p * 0.3e4; addHouse(g, p, 0.3); g.remember('rental', k1(p * 1e4 * 0.02)); g.remember('house44', 'second'); },
          res: (g) => '你在附近買了一套小戶型，首付 ' + fmt(A) + '。租客是一對剛畢業的小夫妻，每月租金 ' + fmt((Number(g.recall('rental')) || 0) / 12) + '。' },
        { t: '換套大的', dev: 15, cond: (g) => hasKid(g) && !kidAway(g) && cash(g) + hv(g) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('house44', 'swap'); },
          res: (g) => '你賣了舊房，換了一套三室的。' + kn(g) + '有了自己的房間，你又背上了房貸' + (B ? '，還借了 ' + fmt(B) : '') + '。' },
        { t: '把房子過戶給孩子', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 3); g.remember('house44', 'gift'); },
          res: (g) => (kAge(g) < 12 ? '過戶那天，孩子還小，不明白這張紙是什麼。你說，是你的家。' : kn(g) + '看著房產證上自己的名字，半天沒說話。') },
        { t: '花錢把房子翻新一下', dev: 10, cond: (g) => !hasKid(g),
          fx: (g) => { A = w1(Math.max(50000, hv(g) * 1e4 * 0.08)); spend(g, A); g.stat('心情', 4); g.remember('house44', 'renov'); }, res: () => '翻新花了 ' + fmt(A) + '。新鋪的木地板，你光腳走了好幾圈。' },
      ] },
    { id: 'm_45_checkup', age: 45, t: '體檢報告', loc: 'hospital',
      text: (g) => (cat(g) === 'labor' || cat(g) === 'own' || cat(g) === 'none' ? '社群免費體檢' : '單位體檢') + '，報告上有一行加粗的字：' + CN.pick(['甲狀腺結節，建議複查', '血壓偏高', '血糖偏高', '脂肪肝，中度']) + '。' + (g.recall('body40') === 'run' ? '醫生說幸虧你在運動，不然更糟。' : ''),
      choices: [
        { t: '開點藥吃著', canon: true, fx: (g) => { g.stat('健康', 1); g.remember('check45', 'pills'); }, res: '藥盒子擺在餐桌上，早一粒，晚一粒。' },
        { t: '徹底改作息', dev: 10, fx: (g) => { g.stat('健康', 6); g.stat('心情', -2); g.remember('check45', 'change'); }, res: '你戒了夜宵，十一點前睡覺。頭一個月，你天天餓著入睡。' },
        { t: '不當回事', dev: 10, fx: (g) => { g.stat('健康', -4); g.remember('check45', 'ignore'); }, res: '你說誰還沒點毛病。報告拍照存進相簿，就再沒點開過。' },
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
        if (h === 'save') return M === 'bought' ? '攢了兩年，首付 ' + fmt(A) + ' 湊齊了。你在' + where(g) + '買下一套小兩居，搬家那天下著小雨。' : M === 'still' ? '攢了兩年，首付還差一截。你沒急，房價這兩年也沒漲。' : '攢下的那筆錢，後來派上了別的用場。';
        return ({
          county: '縣城的房子大部分時間空著，你每年回去住幾天，開窗、拖地、曬被子。',
          rent: '你又搬了一次家。家當越來越少，你說這樣挺好。',
          bought: '每個月扣房貸的那天，你一整天都不想花錢。不過晚上回家，開門的是自己的鎖。',
          pay: '房價又變了一點。你已經不看了，只看還剩多少期。',
          early: '提前還的那筆錢，讓你每個月多出一點喘氣的空間。',
          small: '小房子收拾起來很快。你發現以前那麼大的房子，一大半是用來放東西的。',
          swap: '新家的房間多了，' + (hasKid(g) ? '孩子在門上貼了一張“請敲門”。' : '你在最小的那間放了一張書桌。'),
          keep: '陽臺上的花開了一茬又一茬。',
          second: '出租的那套換了第二撥租客。這兩年的房租一共 ' + fmt(A) + '，按時到賬。',
          gift: '房產證上是孩子的名字。你覺得這件事，你辦成了。',
          renov: '翻新過的房子住著舒服，朋友來了都說像新家。',
        }[h] || '');
      } },
    { id: 'm_47_ai', age: 47, t: '又一波', loc: 'office', cond: (g) => !['none', 'farmer', 'retired'].includes(job(g)),
      text: (g) => (cat(g) === 'stable' ? '單位裡上了一套新系統，很多活不用人做了。領導說要“精簡”。' : cat(g) === 'own' ? '新開的無人店就在你隔壁，二十四小時不關門。' : '新聞上說，又一批崗位被機器人和 AI 接手了。你的工作也在名單的邊上。'),
      choices: [
        { t: '硬扛著，少拿點也幹', canon: true, fx: (g) => { g.stat('事业', -5); g.stat('心情', -2); g.remember('ai47', 'hold'); }, res: '收入又少了一截。你學會了在每一筆開銷前多想三秒。' },
        { t: '去學新東西', dev: 15, check: ['学识', 50],
          fx: (g) => { spend(g, 10000); g.stat('事业', 6); g.stat('学识', 3); g.remember('ai47', 'learn'); }, res: '學費 ¥1 萬。四十七歲，你和二十歲的人坐在一個培訓班裡。下課的時候，他們來問你題。',
          fail: { fx: (g) => { spend(g, 10000); g.stat('心情', -3); g.remember('ai47', 'hold'); }, res: '你聽了幾節課，跟不上，又回去守著原來的活。', dev: 3 } },
        { t: '不幹了，提前退下來', dev: 20, cond: (g) => owe(g) <= 20 && cash(g) + invested(g) >= 200000, fx: (g) => { CN.setJob(g, 'freelance', '提前退下來，偶爾接點零活'); g.stat('事业', -10); g.stat('心情', 4); g.remember('ai47', 'out'); }, res: '你交了工牌。第二天早上，你不知道該幹什麼，就去菜市場轉了一圈。' },
      ] },
    { id: 'm_47_land', age: 47, t: '地', cond: (g) => job(g) === 'farmer' || (job(g) === 'none' && g.recall('hukou') === 'rural'),
      text: '村裡來了合作社，要把各家的地連成一大片，用無人機播種、收割。流轉出去，一畝一年給 ¥800。',
      choices: [
        { t: '把地流轉出去，拿租金', canon: true, fx: (g) => { CN.earn(g, 8000); g.stat('健康', 2); g.remember('land', 'rent'); }, res: '你家十畝地，頭一年的租金 ¥8,000 打到了卡上。秋天，你在地頭看機器收麥子。' },
        { t: '自己承包一大片', dev: 20, check: ['事业', 30],
          fx: (g) => { borrow(g, 15); g.stat('事业', 10); CN.setJob(g, 'farmer', '種糧大戶'); g.remember('land', 'big'); }, res: '你貸款 ¥15 萬買了無人機，學會了看手機上的土壤資料。村裡人叫你“大戶”。',
          fail: { fx: (g) => { borrow(g, 15); g.stat('心情', -4); g.remember('land', 'rent'); }, res: '頭一年趕上天旱，虧了。貸款還欠著，你把地又轉了出去。', dev: 5 } },
        { t: '去城裡，幫著家裡人', dev: 15, fx: (g) => { CN.goCity(g, 3); g.remember('land', 'city'); g.stat('人缘', 2); }, res: (g) => '你鎖上院門，去了' + g.recall('workCity') + '。城裡的樓太高，你好幾天找不到回家的路。' },
      ] },
    { id: 'm_48_check_echo', age: 48, t: '複查', auto: true, loc: 'hospital', cond: (g) => !!g.recall('check45'),
      fx: (g) => { const c = g.recall('check45'); if (c === 'change') g.stat('健康', 3); if (c === 'ignore') g.stat('健康', -5); },
      text: (g) => ({
        pills: '複查結果沒變好，也沒變壞。醫生說，按時吃藥，別熬夜。',
        change: '複查的時候，醫生翻著你三年前的報告，說你這幾年做對了。',
        ignore: '你去年沒複查，今年暈了一回。醫生看著你的片子，臉色不太好。',
      }[g.recall('check45')]) },
    { id: 'm_49_ai_echo', age: 49, t: '四十九', auto: true, cond: (g) => !!(g.recall('ai47') || g.recall('land')),
      fx: (g) => { if (g.recall('ai47') === 'learn') g.stat('事业', 3); if (g.recall('land') === 'big') g.stat('事业', 4); },
      text: (g) => {
        const a = g.recall('ai47');
        if (a === 'learn') return '學的那些新東西用上了。年輕人遇到難題，會說“問問老' + CN.surOf(JY.byId[g.me].name) + '”。';
        if (a === 'out') return '提前退下來以後，你學會了做飯，學會了午睡，也學會了在別人上班的時候不心慌。';
        if (a === 'hold') return '你還在原來的崗位上。和你同期進來的人，只剩下兩個。';
        const l = g.recall('land');
        if (l === 'big') return '你承包的地今年豐收。收購商的車排了半條村。';
        if (l === 'city') return '在城裡住了兩年，你在小區樓下的空地上偷偷種了幾棵蔥，被物業鏟了。';
        return '地租每年準時打到卡上。你閒了，開始給村裡修路的人送水。';
      } },

    /* ================= 50–64 岁 ================= */
    { id: 'm_51_parents', age: 51, t: '照顧了幾年', cond: (g) => parentAlive(g) && !!g.recall('parentsCare'),
      text: (g) => {
        const p = g.recall('parentsCare'), w = paWord(g);
        return (p === 'self' && withPa(g) ? w + '和你住了幾年。你的腰不好了，夜裡也睡不整。'
          : p === 'nursing' ? w + '在養老院住了幾年。每次你走，' + paThey(g) + '都送到門口。'
          : p === 'sibling' ? '兄弟姐妹照顧了' + w + '這幾年，最近在電話裡說，有點撐不住了。'
          : '隔著千里照看了幾年，每次影片，' + w + '都說好，掛了電話你總不放心。') + '要不要換個法子？';
      },
      choices: [
        { t: '接著這樣', canon: true, fx: (g) => { g.remember('care51', 'same'); g.stat('心情', -1); }, res: '你咬咬牙，說再堅持堅持。' },
        { t: '送去養老院', dev: 10, cond: (g) => g.recall('parentsCare') !== 'nursing',
          fx: (g) => { A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.remember('care51', 'changed'); g.stat('健康', 3); },
          res: () => '你挑了一家近的，一年 ' + fmt(A) + '。籤合同的那天，你在車裡坐了很久才開走。' },
        { t: '接回自己家', dev: 10, cond: (g) => g.recall('parentsCare') !== 'self' && !withPa(g),
          fx: (g) => { CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.remember('care51', 'changed'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => '你把' + paWord(g) + '接回了家。第一頓飯，' + (pAlive(g, 'mo') ? '母親非要下廚。' : '父親非要給你炒兩個菜。') },
        { t: '請個護工搭把手', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('paAide', true); g.remember('care51', 'aide'); g.stat('健康', 2); },
          res: () => '護工阿姨一年 ' + fmt(A) + '。她來的第一個星期，你睡了幾個整覺。' },
      ] },
    { id: 'm_52_care_echo', age: 52, t: '爸媽', auto: true, cond: (g) => !!g.recall('parentsCare') && parentAlive(g),
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
        const pre = g.recall('care51') === 'changed' ? '換了法子以後，' : '';
        if (p === 'self' && n) return pre + '和' + w + '住在一起的日子，飯桌上多了' + (n > 1 ? '兩雙' : '一雙') + '筷子，也多了幾次拌嘴。夜裡起來給' + paThey(g) + '蓋被子，你想起小時候' + paThey(g) + '也這樣。' + (A ? '護工這一年又是 ' + fmt(A) + '。' : '');
        if (p === 'nursing') return pre + '養老院這一年又交了 ' + fmt(A) + '。護工跟你熟了，會把' + w + '的事一件件講給你聽。' + w + '慢慢也交了新朋友。';
        if (p === 'sibling') return '兄弟姐妹打電話來，說' + w + '想你了。你說下個月一定回去，這次真的回去了。';
        return '攝像頭裡，' + w + '對著鏡頭招手。' + paThey(g) + '知道你在看。';
      } },
    { id: 'm_53_money', age: 53, t: '攢下的錢', loc: 'home', cond: (g) => cash(g) >= 150000,
      text: (g) => '這些年總算攢下了一些，卡里有 ' + fmt(cash(g)) + (invested(g) > 0 ? '，理財裡還有 ' + fmt(invested(g)) : '') + '。離退休還有十來年，怎麼用，你想了很久。',
      choices: [
        { t: '存著養老', canon: true, fx: (g) => { A = w1(cash(g) * 0.6); CN.invest(g, A, 'safe'); g.stat('心情', 2); g.remember('nest', 'save'); }, res: () => '你把 ' + fmt(A) + ' 分成幾份，存了定期和國債。' },
        { t: '拿一部分買基金', dev: 10, fx: (g) => { A = w1(cash(g) * 0.4); CN.invest(g, A, 'fund'); g.remember('nest', 'fund'); }, res: () => '你買了 ' + fmt(A) + ' 的基金，說好十年不動。' },
        { t: '朋友拉你投一個專案', dev: 15, check: ['学识', 50],
          fx: (g) => { A = w1(cash(g) * 0.3); CN.earn(g, A * 0.6); g.remember('nest', 'invest'); }, res: () => '你投了 ' + fmt(A) + '，看準了一次。兩年後分回來的錢，比本金多了六成。',
          fail: { fx: (g) => { A = w1(cash(g) * 0.3); spend(g, A); g.stat('心情', -5); g.remember('nest', 'lost'); }, res: () => '你投了 ' + fmt(A) + '。一個“穩賺”的專案，老闆跑了。你在維權群裡待了半年。', dev: 5 } },
        { t: '給孩子付首付', dev: 10, cond: (g) => hasKid(g) && kAge(g) >= 22 && g.recall('kidWed') !== 'paid',
          fx: (g) => { A = w1(Math.min(cash(g) * 0.5, CN.price(g, kidTier(g)) * 0.3e4)); spend(g, A); g.stat('人缘', 4); g.remember('nest', 'kid'); }, res: (g) => '你轉了 ' + fmt(A) + '。' + kn(g) + '接過卡的時候沒說話，抱了你一下。' },
      ] },
    { id: 'm_54_nest_echo', age: 54, t: '錢', auto: true, cond: (g) => !!g.recall('nest'),
      text: (g) => ({
        save: '定期裡的錢慢慢長，現在是 ' + fmt(invested(g)) + '。你算了算，大概夠了。',
        fund: '基金有漲有跌，賬戶裡現在是 ' + fmt(invested(g)) + '。你學會了不天天看。',
        invest: '賺了那一筆以後，你收手了。朋友再來拉你，你都推了。',
        lost: '那筆錢沒追回來。你後來跟誰都說：“穩賺的事，別信。”好在家裡的日子沒受大影響。',
        kid: '孩子搬進了新房，給你留了一間。你去住了兩天，就想回自己家。',
      }[g.recall('nest')]) },
    { id: 'm_55_ill', age: 55, t: '病', loc: 'hospital', cond: (g) => g.s('健康') < 45,
      text: (g) => '一次檢查，醫生讓家屬單獨進去。' + (g.recall('check45') === 'ignore' ? '十年前那張沒當回事的報告，你又想起來了。' : '') + '是要動手術的病。醫保報完，自己大概要掏 ' + fmt(g.recall('hukou') === 'rural' ? 60000 : 90000) + '。',
      choices: [
        { t: '去大醫院做手術', canon: true, check: ['健康', 0], // 健康 15 以上成功率 95%
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; M = spend(g, A); g.stat('健康', 15); g.remember('ill55', 'surgery'); },
          res: (g) => '手術做了七個小時，花了 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。醒來的時候，' + (CN.alone(g) ? '朋友守在床邊。' : '家裡人都在。'),
          fail: { fx: (g) => { g.die('手術後沒能醒過來'); }, res: '手術沒能成功。', dev: 0 } },
        { t: '保守治療，不開刀', dev: 15, fx: (g) => { spend(g, 20000); g.stat('健康', -5); g.stat('心情', 2); g.remember('ill55', 'conservative'); }, res: '你選了吃藥、調養，一年藥費 ¥2 萬。醫生說，這樣也有這樣的活法。' },
        { t: '瞞著孩子，自己扛', dev: 15, cond: (g) => hasKid(g) && kAge(g) >= 16,
          fx: (g) => { A = g.recall('hukou') === 'rural' ? 60000 : 90000; spend(g, A); g.stat('心情', -5); g.stat('健康', 12); g.remember('ill55', 'hide'); },
          res: '你說出差幾天，一個人住進了醫院，手術費自己刷的卡。護士問家屬呢，你說在路上。' },
      ] },
    { id: 'm_55_hobby', age: 55, t: '第二春', cond: (g) => g.s('健康') >= 45,
      text: (g) => (hasKid(g) && kAge(g) >= 16 ? '孩子大了，' : '') + '工作也不用再拼了。有人勸你找點自己喜歡的事。',
      choices: [
        { t: '照舊，上班下班', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('hobby55', 'none'); }, res: '你說等退休了再說。' },
        { t: '學攝影、書法這類東西', dev: 10, fx: (g) => { spend(g, 5000); g.stat('心情', 5); g.stat('学识', 2); g.remember('hobby55', 'art'); }, res: '你花 ¥5,000 買了一臺二手相機。週末坐公交去郊外拍鳥。' },
        { t: '和老同學合夥做點小買賣', dev: 15, check: ['人缘', 50],
          fx: (g) => { M = spend(g, 80000); g.remember('hobby55', 'biz'); }, res: '你出了 ¥8 萬。你們在老同學的老家開了一家農家樂，週末客人不少。',
          fail: { fx: (g) => { spend(g, 50000); g.stat('人缘', -3); g.remember('hobby55', 'none'); }, res: '合夥沒兩個月就散了，你賠了 ¥5 萬，你們也不怎麼聯絡了。', dev: 3 } },
      ] },
    { id: 'm_57_echo', age: 57, t: '這兩年', auto: true, cond: (g) => !!(g.recall('ill55') || g.recall('hobby55')),
      fx: (g) => { A = 0; if (g.recall('hobby55') === 'art') g.stat('心情', 3); if (g.recall('ill55') === 'hide') g.stat('人缘', -2); if (g.recall('hobby55') === 'biz') { A = 60000; CN.earn(g, A); } },
      text: (g) => {
        const i = g.recall('ill55');
        if (i === 'surgery') return '手術兩年了，複查都正常。你學會了慢慢吃飯，慢慢走路。';
        if (i === 'conservative') return '保守治療的這兩年，病沒好，也沒壞。你學會了和它一起過日子。';
        if (i === 'hide') return '孩子還是知道了。' + kn(g) + '在電話裡哭著說：“你憑什麼一個人扛？”那以後，' + kHe(g) + '每週都打電話來。';
        const h = g.recall('hobby55');
        if (h === 'art') return '你的照片被社群挑去辦了個小展。你站在自己的照片前，假裝是路過。';
        if (h === 'biz') return '農家樂這兩年分了你 ' + fmt(A) + '。老同學說，等幹不動了就交給年輕人。';
        return '日子還是那樣，按部就班。';
      } },
    { id: 'm_58_work', age: 58, t: '最後幾年', cond: (g) => !['none', 'retired'].includes(job(g)),
      text: '離退休還有幾年。年輕人都覺得你該歇著了，你自己也這麼覺得，又不完全這麼覺得。',
      choices: [
        { t: '熬到退休', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('end58', 'stay'); }, res: '你把手頭的活一件件交出去，教會了兩個年輕人。' },
        { t: '換個輕鬆點的活', dev: 10, fx: (g) => { g.stat('健康', 3); g.stat('事业', -6); g.remember('end58', 'easy'); }, res: '你調去了不那麼忙的崗位，錢少了一些。下班的時候，天還亮著。' },
        { t: '再拼一把', dev: 15, check: ['健康', 50],
          fx: (g) => { g.stat('事业', 8); CN.earn(g, w1(myInc(g) * 0.3)); g.remember('end58', 'push'); }, res: '你接下了一個大專案，年底多拿了一筆獎金。專案做成那天，你說這是你最後一次熬夜。',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('end58', 'easy'); }, res: '專案做到一半，你住進了醫院。出院以後，你什麼都不爭了。', dev: 5 } },
      ] },
    { id: 'm_58_home', age: 58, t: '家裡的事', cond: (g) => ['none', 'retired'].includes(job(g)),
      text: '家裡的大事小事，現在都來找你拿主意。',
      choices: [
        { t: '照舊管著這個家', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('end58', 'family'); }, res: '你的手機裡存著全家人的體檢時間、生日和醫保卡號。' },
        { t: '放手，讓自己清閒點', dev: 10, fx: (g) => { spend(g, 8000); g.stat('心情', 4); g.remember('end58', 'free'); }, res: '你報了一個 ¥8,000 的旅行團，第一次自己出了遠門。' },
      ] },
    { id: 'm_59_end_echo', age: 59, t: '五十九', auto: true, cond: (g) => !!g.recall('end58'),
      text: (g) => ({
        stay: '單位裡開始有人叫你“老”什麼。你帶的兩個年輕人，有一個已經能頂你的位置了。',
        easy: '輕鬆的崗位上，你開始學泡茶。辦公室裡的綠植是你在養。',
        push: '那個專案讓你在行業裡留了個名字。你卻說，最得意的是那兩年沒錯過一頓家裡的晚飯。',
        family: '家裡人說，有你在，家就亂不了。',
        free: '那次出遠門回來以後，你又去了兩次。你說，這輩子到現在才知道自己喜歡看海。',
      }[g.recall('end58')]) },
    { id: 'm_60_plan', age: 60, t: '以後住哪兒', loc: 'home',
      text: (g) => '六十歲了。離退休還有五年，你開始想以後的日子在哪裡過。' + (hasKid(g) && g.recall('kidCity') ? kn(g) + '在' + g.recall('kidCity') + '。' : '') + (hv(g) ? '你的房子現在值 ' + fmt(hv(g) * 1e4) + '。' : ''),
      choices: [
        { t: '就在現在住的地方', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('plan60', 'stay'); }, res: '你熟悉這裡的每一個菜攤。' },
        { t: '回老家，把老房子修一修', dev: 15, cond: (g) => !atHome(g) && !['sold', 'gave'].includes(g.recall('oldHouse')),
          fx: (g) => {
            A = 100000; spend(g, A);
            if (!hv(g)) settleOld(g, oldVal(g));
            backHome(g); g.remember('house', 'hometown');
            if (parentAlive(g)) CN.liveWith(g, parents(g));
            g.stat('心情', 4); g.remember('plan60', 'home');
          },
          res: (g) => '你花了 ' + fmt(A) + '，請人修了屋頂，在院子裡搭了個葡萄架。' + (parentAlive(g) ? paWord(g) + '天天在葡萄架下坐著。' : '') },
        { t: '搬去孩子的城市', dev: 10, cond: (g) => hasKid(g) && !!g.recall('kidCity') && g.recall('kidCity') !== '國外' && g.recall('kidCity') !== where(g),
          fx: (g) => {
            const t = kidTier(g), p = Math.round(CN.price(g, t) * 0.5);
            M = '';
            if (hv(g) && cash(g) + (hv(g) - owe(g)) * 1e4 >= p * 1e4) { CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); M = 'buy'; }
            CN.goCity(g, t, g.recall('kidCity'));
            g.stat('人缘', 3); g.remember('plan60', 'kid');
          },
          res: (g) => (M === 'buy' ? '你賣了老房子，在' + g.recall('kidCity') + '買了一套小兩居，離孩子走路十五分鐘。' : '你在' + g.recall('kidCity') + '租了一套離孩子不遠的房子，走路十五分鐘。') },
        { t: '換套小房子，手頭寬裕些', dev: 10, cond: (g) => house(g) === 'own' && hv(g) >= 40,
          fx: (g) => { const p = Math.round(hv(g) * 0.5); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 1 }); A = p * 1e4; g.remember('plan60', 'down'); },
          res: () => '大房子賣了，換了一套小的，差價 ' + fmt(A) + ' 存了起來。樓層低，有電梯，以後腿腳不好也不怕。' },
        { t: '退休以後，冬天去南方過', dev: 10, cond: (g) => !(house(g) === 'own' && hv(g) >= 40),
          fx: (g) => { g.stat('心情', 3); g.remember('plan60', 'south'); }, res: '你在手機上看了好幾個海邊小城的房租，收藏了一個又一個。' },
      ] },
    { id: 'm_61_plan_echo', age: 61, t: '新的日子', auto: true, cond: (g) => !!g.recall('plan60'),
      text: (g) => ({
        stay: '你在老地方又過了一年。樓下的保安換了，新來的那個已經認得你了。',
        home: '回老家的第一年，你認出了小時候爬過的那棵樹。它比你記得的矮。',
        kid: '你每週去孩子家兩次，帶一鍋湯。孩子說，以後別帶了，又說，下次多帶一點。',
        down: '小房子收拾起來不費勁。多出來的錢，你給自己報了個老年大學的預備班。',
        south: '冬天你去南邊住了一個月，租的房子推開窗就是海。回來的時候，曬黑了一圈。',
      }[g.recall('plan60')]) },
    { id: 'm_63_sib', age: 63, t: '兄弟姐妹', cond: (g) => sibs(g),
      text: (g) => '你的兄弟姐妹來電話，說病了，治病要 ' + fmt(w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000))) + '，問你能不能幫一把。',
      choices: [
        { t: '借', canon: true, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000)); spend(g, A); g.stat('人缘', 5); g.remember('sibLoan', 'yes'); }, res: () => '你轉了 ' + fmt(A) + '，說不用還。電話那頭哭了。' },
        { t: '幫著找醫院，錢借一半', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.25, 30000), 200000) / 2); spend(g, A); g.stat('人缘', 2); g.remember('sibLoan', 'help'); }, res: () => '你託人掛到了大醫院的號，轉了 ' + fmt(A) + '。另一半說再想辦法。' },
        { t: '不借', dev: 15, fx: (g) => { g.stat('人缘', -6); g.remember('sibLoan', 'no'); }, res: '你說你自己也難。掛了電話，你在陽臺上站了很久。' },
      ] },
    { id: 'm_63_only', age: 63, t: '獨生子女的晚年', cond: (g) => !sibs(g),
      text: '你沒有兄弟姐妹。以後的事，你得早點自己打算。',
      choices: [
        { t: '交給孩子', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 2); g.remember('selfCare', 'kid'); }, res: '你把存摺放在哪兒、密碼是什麼，都告訴了孩子。' },
        { t: '給自己買一份養老保險', dev: 10, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.2, 30000), 300000)); spend(g, A); g.remember('selfCare', 'insure'); }, res: () => '保費一次交了 ' + fmt(A) + '。合同很厚，你一頁頁看完了。' },
        { t: '和老朋友約好，互相照應', dev: 15, fx: (g) => { g.stat('人缘', 4); g.remember('selfCare', 'friends'); }, res: '你們幾個老朋友拉了個群，叫“養老互助組”。每天早上，群裡要有人說一聲早。' },
      ] },
    { id: 'm_64_eve', age: 64, t: '退休前一年', auto: true,
      fx: (g) => {
        if (g.recall('sibLoan') === 'yes' || g.recall('selfCare') === 'friends') g.stat('心情', 2);
        if (owe(g) > 0) g.stat('心情', -2);
      },
      text: (g) => {
        const bits = [];
        const s = g.recall('sibLoan');
        if (s === 'yes') bits.push('兄弟姐妹的病好了，過年的時候，他們拎著兩隻雞來看你。');
        if (s === 'no') bits.push('那次沒借錢以後，兄弟姐妹的群裡，你的訊息很少有人回。過年時，你還是給他們寄了年貨。');
        if (s === 'help') bits.push('兄弟姐妹的病治好了。借的錢，他們一點一點還給了你。');
        const c = g.recall('selfCare');
        if (c === 'friends') bits.push('“養老互助組”的群裡，每天早上都有人說早。');
        if (c === 'insure') bits.push('保險的單子你鎖在了抽屜裡。');
        if (owe(g) > 0) bits.push('還欠著 ' + fmt(owe(g) * 1e4) + '，你打算退休金下來慢慢還。');
        else bits.push('欠的賬都還清了' + (cash(g) + invested(g) > 0 ? '，手裡攢著 ' + fmt(cash(g) + invested(g)) : '') + '。你在日曆上圈出了明年退休的那一天。');
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
  const POST40 = { tech: '技術總監', office: '部門經理', sales: '大區經理', civil: '科長', teacher: '教導主任', doctor: '科室副主任', nurse: '科護士長', worker: '車間主任', driver: '車隊隊長', rider: '站長', soldier: '營職幹部' };
  const EXPERT40 = { tech: '首席工程師', doctor: '副主任醫師', teacher: '高階教師', nurse: '副主任護師', worker: '技師', office: '業務專家' };
  const TOP50 = { tech: '公司副總', office: '分公司總經理', sales: '銷售副總', civil: '副處長', teacher: '副校長', doctor: '科室主任', nurse: '護理部主任', worker: '廠長助理', driver: '運輸部經理', rider: '區域經理', soldier: '團職幹部' };
  const FR = { 1: 400000, 2: 300000, 3: 200000, 4: 150000, 5: 100000 };
  const frKind = (g) => pk(g, ['便利店', '快餐店', '藥店', '洗衣店', '烘焙店'], 31);
  const coopCrop = (g) => pk(g, { 西南: ['獼猴桃', '茶葉', '花椒'], 华南: ['荔枝', '百香果', '茶葉'], 华东: ['草莓', '茶葉', '藍莓'], 华中: ['小龍蝦', '臍橙', '蓮藕'], 华北: ['蘋果', '小米', '大棚蔬菜'], 东北: ['大米', '木耳', '藍莓'], 西北: ['蘋果', '枸杞', '牛羊肉'] }[g.recall('region')] || ['大棚蔬菜', '水果'], 32);
  const onlineItem = (g) => pk(g, ['家鄉的特產', '自己做的手工', '老本行的工具配件', '中老年衣服'], 33);
  // 能叫来帮忙的家里人：兄弟姐妹、成年的孩子、配偶
  const helperM = (g) => ['sib0', 'sib1'].find((id) => pAlive(g, id) && g.ageOf(id) < 65) || (hasKid(g) && kAge(g) >= 20 ? 'k1' : married(g) ? 'sp' : '');
  const helpWho = (g, id) => CN.who(g, id).replace(/^你的/, '');

  /* ---------- 孩子、父母、配偶、行情：按他们的年纪或运气发生，用意外的形式（一世只发生一次） ----------
   * 抉择类的意外写 ok（基础条件），下面统一包成 cond：这一年没有中年的固定抉择，排在前面的意外也没轮上，才轮到它。 */
  const ENCS = [
    { id: 'e_m_parent_ill', y: [2026, 2200], minAge: 35, maxAge: 58, t: '爸媽病了', loc: 'hospital', always: true,
      ok: (g) => g.age <= 58 && parentAlive(g) && parentOld(g) >= 70 && !g.recall('parentsCare'),
      text: (g) => {
        const o = older(g);
        const bill = k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(o) * 300);
        return CN.who(g, o, true) + '住院了，醫保報完，自己掏了 ' + fmt(bill) + '。出院以後，醫生說身邊不能離人。'
          + (withPa(g) ? paThey(g) + '本來就和你住，可你白天要上班。' : '');
      },
      choices: [
        { t: '接來同住，自己照顧', canon: true, cond: (g) => !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); CN.liveWith(g, parents(g)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: '你把書房騰出來，裝了扶手和夜燈。' },
        { t: '自己多擔著點', canon: true, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); },
          res: (g) => '你把' + paWord(g) + '的屋子挪到了朝南那間，裝了扶手和夜燈。下班你不再加班了。' },
        { t: '請護工上門', dev: 10, cond: (g) => withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[tier(g)] || 60000; spend(g, A); g.remember('parentsCare', 'self'); g.remember('paAide', true); },
          res: () => '護工阿姨一年 ' + fmt(A) + '。她做的飯偏鹹，家裡人慢慢也吃慣了。' },
        { t: '交給兄弟姐妹，你出錢', dev: 10, cond: (g) => sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); spend(g, 24000); g.remember('parentsCare', 'sibling'); },
          res: '你每個月打 ¥2,000 回去，過節回家。' },
        { t: '在老家請人照看', dev: 10, cond: (g) => !sibs(g) && !withPa(g),
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = AIDE[Math.max(4, tier(g))] || 40000; spend(g, A); g.remember('parentsCare', 'far'); },
          res: (g) => '你在老家請了一位阿姨，一年 ' + fmt(A) + '，又在客廳裝了攝像頭。每天晚上，你點開看一眼' + paWord(g) + '。' },
        { t: '送去養老院', dev: 15,
          fx: (g) => { spend(g, k1((g.recall('hukou') === 'rural' ? 20000 : 40000) + g.ageOf(older(g)) * 300)); A = (NURS[tier(g)] || 45000) * parents(g).length; spend(g, A); CN.moveOut(g, ['fa', 'mo']); sendOut(g); g.remember('parentsCare', 'nursing'); g.stat('心情', -3); },
          res: (g) => '你挑了一家近的，一年 ' + fmt(A) + '。臨走，' + paWord(g) + '站在門口送你，像當年送你上學。' },
      ] },
    { id: 'e_m_sp_ill', y: [2026, 2200], minAge: 50, maxAge: 64, t: '另一半病了', loc: 'hospital', always: true,
      ok: (g) => g.age >= 50 && married(g) && !g.recall('spSick') && yearRoll(g, 7) < 0.05,
      text: (g) => CN.who(g, 'sp', true) + '查出了大病。醫生說，能治，就是費錢、費人。',
      choices: [
        { t: '傾盡所有去治', canon: true, fx: (g) => { A = w1(Math.max(100000, Math.min(cash(g) * 0.7, 400000))); M = spend(g, A); g.stat('健康', -3); g.remember('spSick', 'all'); },
          res: () => '你跑遍了能跑的醫院，前前後後花了 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。' },
        { t: '一邊上班一邊陪護', dev: 10, fx: (g) => { A = 80000; spend(g, A); g.stat('健康', -5); g.remember('spSick', 'both'); }, res: '醫藥費自付 ¥8 萬。白天上班，晚上睡在病床邊的摺疊椅上。' },
        { t: '請護工和陪護機器人', dev: 15, cond: (g) => cash(g) >= 150000, fx: (g) => { A = 150000; spend(g, A); g.remember('spSick', 'paid'); }, res: '治病加護工，一共 ¥15 萬。你每天下班去醫院坐兩個鐘頭，陪著說話。' },
      ] },
    { id: 'e_m_pa_bill', y: [2026, 2200], minAge: 45, maxAge: 64, t: '新療法', loc: 'hospital', always: true,
      ok: (g) => g.age >= 45 && parentAlive(g) && parentOld(g) >= 76 && !!g.recall('parentsCare') && !g.recall('paBill') && yearRoll(g, 5) < 0.25,
      text: (g) => CN.who(g, older(g), true) + (yearRoll(g, 6) < 0.5 ? '查出了心臟的毛病' : '摔了一跤，髖骨裂了') + '，住進了醫院。醫生說，有一種新療法恢復得快，醫保報不了，自費要 ' + fmt(tier(g) <= 2 ? 200000 : 120000) + '。',
      choices: [
        { t: '用新療法', canon: true, fx: (g) => { A = tier(g) <= 2 ? 200000 : 120000; M = spend(g, A); g.remember('paBill', 'best'); }, res: () => '你簽了字，交了 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。' },
        { t: '按醫保的方案治', dev: 10, fx: (g) => { A = k1((tier(g) <= 2 ? 200000 : 120000) * 0.15); spend(g, A); g.remember('paBill', 'basic'); }, res: () => '自費部分 ' + fmt(A) + '。醫生說，這樣也能控制住，就是恢復得慢一些。' },
        { t: '兄弟姐妹一起出', dev: 10, cond: (g) => sibs(g),
          fx: (g) => { A = w1((tier(g) <= 2 ? 200000 : 120000) / ((g.recall('sibs') || 0) + 1)); spend(g, A); g.remember('paBill', 'split'); }, res: () => '兄弟姐妹在群裡算好了賬，一人 ' + fmt(A) + '。用的是新療法。' },
      ] },
    { id: 'e_m_kid_school', y: [2026, 2200], minAge: 30, maxAge: 64, t: '上學', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 6 && kAge(g) <= 9 && !g.recall('kidSchool'),
      text: (g) => kWho(g) + '該上小學了。' + (tier(g) <= 3 ? '家門口的學校一般，好學校旁邊的老房子，一套要 ' + fmt(CN.price(g) * 1.3e4) + '。' : (tier(g) === 5 ? '村小併到了鎮上，' : '縣裡的小學，') + '好一點的那所要託人才進得去。'),
      choices: [
        { t: '就近上公立', canon: true, fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', 1); }, res: '開學那天，你站在校門口，看著那個小書包走進人群裡。' },
        { t: '賣了現在的房子，換學區房', dev: 15, cond: (g) => tier(g) <= 3 && ['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g)),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); CN.sellHouse(g); CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => '老破小，五十平，比原來的家小了一半，房貸又從頭算起' + (B ? '，還借了 ' + fmt(B) : '') + '。你簽字的手有點抖。' },
        { t: '咬牙買學區房', dev: 15, cond: (g) => tier(g) <= 3 && ['none', 'rent'].includes(house(g)) && cash(g) >= CN.price(g) * 1.3 * 0.25e4 && canLoan(g, CN.price(g) * 0.91),
          fx: (g) => { const c0 = cash(g); const p = Math.round(CN.price(g) * 1.3); A = p * 0.3e4; CN.buyHouse(g, { price: p, down: 0.3 }); B = cover(g, c0); g.remember('kidSchool', 'district'); },
          res: () => '老破小，四十平，首付 ' + fmt(A) + (B ? '，借了 ' + fmt(B) : '') + '。你簽字的手有點抖。' },
        { t: '託人找關係，進一所好點的學校', dev: 10, check: ['人缘', 55],
          fx: (g) => { spend(g, 20000); g.remember('kidSchool', 'good'); }, res: '你請人吃了三頓飯，交了 ¥2 萬的“贊助費”。開學那天，你看著那塊校牌鬆了一口氣。',
          fail: { fx: (g) => { spend(g, 5000); g.remember('kidSchool', 'public'); g.stat('心情', -2); }, res: '託的人沒辦成，飯錢花了 ¥5,000。孩子還是上了家門口的學校。', dev: 0 } },
        { t: '送回老家，讓爺爺奶奶帶', dev: 15, cond: (g) => tier(g) <= 3 && !atHome(g) && parentAlive(g) && !withPa(g) && !(['own', 'mortgage'].includes(house(g)) && hv(g) > 0 && cash(g) + (hv(g) - owe(g)) * 1e4 >= CN.price(g) * 1.3 * 0.3e4 && canLoan(g, CN.price(g) * 0.91 - owe(g))),
          fx: (g) => { g.remember('kidSchool', 'left'); g.stat('心情', -5); }, res: (g) => '送走' + kn(g) + '那天，' + kHe(g) + '一直沒哭。車開出好遠，你才哭了。' },
      ] },
    { id: 'e_m_kid_move', y: [2026, 2200], minAge: 30, maxAge: 64, t: '進城讀書', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 9 && kAge(g) <= 13 && tier(g) >= 4 && !g.recall('kidMove') && g.recall('kidSchool') !== 'left',
      text: (g) => kWho(g) + '的成績不錯。' + (tier(g) === 5 ? '鎮上' : '縣裡') + '的初中一般，市裡的好初中，要麼有房，要麼有戶口。市裡一套小房子 ' + fmt(Math.round(CN.price(g, 3) * 0.7) * 1e4) + '。',
      choices: [
        { t: '留在本地讀', canon: true, fx: (g) => { g.remember('kidMove', 'stay'); }, res: '你說，好孩子在哪兒都能學好。你給孩子買了一張新書桌。' },
        { t: '在市裡買套小房子，一家人搬過去', dev: 20, cond: (g) => cash(g) >= Math.round(CN.price(g, 3) * 0.7) * 0.3e4 && canLoan(g, CN.price(g, 3) * 0.49),
          fx: (g) => { const p = Math.round(CN.price(g, 3) * 0.7); A = p * 0.3e4; CN.goCity(g, 3); B = addHouse(g, p, 0.3); g.remember('kidMove', 'buy'); },
          res: (g) => '首付 ' + fmt(A) + (B ? '，借了 ' + fmt(B) : '') + '。你們搬到了' + g.recall('workCity') + '，你在新家附近重新找活幹。' },
        { t: '租房陪讀', dev: 15,
          fx: (g) => { A = 18000 * 3; if (['own', 'mortgage', 'hometown'].includes(house(g))) spend(g, A); else A = 0; CN.goCity(g, 3); g.remember('kidMove', 'rent'); },
          res: (g) => '你在學校旁邊租了一間房' + (A ? '，三年房租 ' + fmt(A) : '') + '。每天早上五點半起來做飯，' + where(g) + '的早市你比本地人還熟。' },
        { t: '送去市裡寄宿', dev: 10, fx: (g) => { A = 20000 * 3; spend(g, A); g.remember('kidMove', 'board'); }, res: () => '三年住宿費、伙食費，一共 ' + fmt(A) + '。每個週五傍晚，你去車站接孩子回家。' },
      ] },
    { id: 'e_m_kid_push', y: [2026, 2200], minAge: 30, maxAge: 64, t: '補習班', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 10 && kAge(g) <= 13 && !g.recall('kidPush'),
      text: (g) => '家長群裡每天都在曬補習班的課表，一年少說 ' + fmt(TUTOR[tier(g)] || 25000) + '。' + kn(g) + '週末還在樓下玩。',
      choices: [
        { t: '報幾個班', canon: true, fx: (g) => { const t = TUTOR[tier(g)] || 25000; M = cash(g) >= t * 3 ? 'three' : 'one'; A = M === 'three' ? t * 3 : t; spend(g, A); g.remember('kidPush', 'hard'); }, res: () => (M === 'three' ? '週末的日程排滿了。三年下來，補習班一共花了 ' + fmt(A) + '。' : '錢緊，你只報了數學和英語，一年 ' + fmt(A) + '。週末你開著電動車在兩個機構之間來回接送。') },
        { t: '自己輔導', dev: 10, check: ['学识', 50],
          fx: (g) => { g.remember('kidPush', 'self'); g.stat('人缘', 3); }, res: '每天晚上一個鐘頭，你們趴在一張桌子上。孩子說你講得比老師清楚。',
          fail: { fx: (g) => { A = (TUTOR[tier(g)] || 25000) * 2; spend(g, A); g.remember('kidPush', 'hard'); g.stat('心情', -3); }, res: () => '你講著講著就急了。最後還是報了班，兩年花了 ' + fmt(A) + '。', dev: 0 } },
        { t: '不報，讓孩子玩', dev: 15, fx: (g) => { g.remember('kidPush', 'easy'); g.stat('心情', 2); }, res: '孩子在樓下玩到天黑，你在陽臺上喊回家吃飯。' },
      ] },
    { id: 'e_m_kid_teen', y: [2026, 2200], minAge: 30, maxAge: 64, t: '青春期', always: true,
      ok: (g) => hasKid(g) && !kidAway(g) && kAge(g) >= 14 && kAge(g) <= 17 && !g.recall('kidBond'),
      text: (g) => kWho(g) + (g.recall('kidMove') === 'board' ? '週末回家，進門就關上房門。' : '開始鎖房門了。') + '成績掉了一截，手機不離手，跟你說話不超過三句。',
      choices: [
        { t: '管嚴一點', canon: true, fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -2); }, res: '你收了手機。門摔得很響。' },
        { t: '找個機會坐下來聊', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.remember('kidBond', 'close'); g.stat('人缘', 4); }, res: '你們在夜宵攤坐了很久。孩子說了一些你從來不知道的事。',
          fail: { fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -3); }, res: '你一開口就是說教。孩子低著頭吃完，回了房間。', dev: 0 } },
        { t: '隨他去，長大就好了', dev: 10, fx: (g) => { g.remember('kidBond', 'loose'); }, res: '你不再過問。有時候你也想，是不是該問一問。' },
      ] },
    { id: 'e_m_kid_gaokao', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子高考', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 18 && kAge(g) <= 20 && !g.recall('kidUni'),
      text: (g) => {
        // 文字每次渲染都会求值，分数只算一次
        if (!g.recall('kidScore')) g.remember('kidScore', kidResult(g));
        const r = g.recall('kidScore');
        return (kidAway(g) ? '前任打來電話：' : '') + kn(g) + '高考的分數出來了：' + { top: '能上一所很好的大學。', good: '能上一所不錯的本科。', normal: '能上一所普通的學校。', none: '離本科線差了一截。' }[r] + '填志願的那幾天，你的燈亮到半夜。';
      },
      choices: [
        { t: '讓孩子自己選', canon: true, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'own'); g.stat('人缘', 2); }, res: '孩子選了一個你沒聽說過的專業。你上網查了一晚上。' },
        { t: '替孩子選個穩當的', dev: 10, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'stable'); g.stat('人缘', -2); }, res: '師範、醫學、考公，你說了算。孩子沒吭聲，按了確認。' },
        { t: '孩子說不想讀了，你隨他', dev: 20, cond: (g) => g.recall('kidBond') === 'loose' || g.recall('kidScore') === 'none',
          fx: (g) => { g.remember('kidUni', 'none'); g.remember('kidPath', 'work'); }, res: '孩子跟著親戚去學手藝了。走的那天說，不用你操心。' },
      ] },
    { id: 'e_m_kid_city', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子留在哪兒', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 22 && kAge(g) <= 26 && !g.recall('kidCity'),
      text: (g) => kn(g) + (g.recall('kidPath') === 'work' ? '學成了手藝，' : '畢業了，') + '打電話問你：留在大城市，還是回來？',
      choices: [
        { t: '去大城市闖', canon: true, fx: (g) => { g.remember('kidCity', g.recall('kidUni') === 'top' ? CN.pick(BIG) : CN.pick(['杭州', '成都', '武漢', '南京', '廣州', '西安'])); g.stat('心情', -1); },
          res: (g) => kn(g) + '去了' + g.recall('kidCity') + '。你把' + kHe(g) + '的房間原樣留著。' },
        { t: '勸回身邊', dev: 10, fx: (g) => { g.remember('kidCity', where(g)); g.stat('人缘', 3); }, res: '孩子回來了，在本地找了份工作。週末回家吃飯，帶著一身你不認識的香水味。' },
        { t: '出國讀研', dev: 20, cond: (g) => cash(g) >= 300000 || g.recall('kidUni') === 'top',
          fx: (g) => { A = 400000; M = spend(g, A); g.remember('kidCity', '國外'); g.stat('心情', -3); },
          res: () => '學費加生活費，前後 ' + fmt(A) + (M ? '，借了 ' + fmt(M) : '') + '。機場送別，孩子過了安檢，回頭揮了揮手。時差八個鐘頭。' },
      ] },
    { id: 'e_m_kid_wed', y: [2026, 2200], minAge: 40, maxAge: 64, t: '孩子成家', always: true,
      ok: (g) => hasKid(g) && kAge(g) >= 27 && kAge(g) <= 34 && !g.recall('kidWed'),
      text: (g) => kWho(g) + '帶了一個人回家吃飯。飯後，' + kHe(g) + '說想結婚了。' + (g.recall('kidCity') && g.recall('kidCity') !== '國外' ? '在' + g.recall('kidCity') + '，一套房子的首付就要 ' + fmt(CN.price(g, kidTier(g)) * 0.3e4) + '。' : '房子、酒席，樣樣要錢。'),
      choices: [
        { t: '掏積蓄幫著付首付', canon: true, cond: (g) => cash(g) >= 100000,
          fx: (g) => { A = w1(Math.min(CN.price(g, kidTier(g)) * 0.3e4, cash(g) * 0.7)); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => '你轉了 ' + fmt(A) + '。酒席上，你喝多了，拉著親家說了很多年輕時候的事。' },
        { t: '借錢也幫一把', canon: true, cond: (g) => cash(g) < 100000,
          fx: (g) => { A = 100000; borrow(g, 10); CN.earn(g, A); spend(g, A); g.stat('人缘', 3); g.remember('kidWed', 'paid'); },
          res: () => '你找親戚湊了 ' + fmt(A) + '，塞到孩子手裡。酒席上，你笑得比誰都大聲。' },
        { t: '讓他們自己來，你只出個心意', dev: 15, fx: (g) => { A = w1(Math.min(Math.max(cash(g) * 0.1, 20000), 100000)); spend(g, A); g.remember('kidWed', 'self'); },
          res: () => '你包了一個 ' + fmt(A) + ' 的紅包。婚禮很簡單，在一家小飯館。新人敬酒的時候，笑得很真。' },
        { t: '孩子說不想辦婚禮，你也依了', dev: 15, fx: (g) => { g.remember('kidWed', 'none'); }, res: '他們領了證，發了一張合照到家族群裡。你看了好幾遍。' },
      ] },
    { id: 'e_m_oldhouse', y: [2026, 2200], minAge: 35, maxAge: 64, t: '老房子', always: true,
      ok: (g) => !!JY.byId.fa && !parentAlive(g) && !g.recall('oldHouse'),
      text: (g) => '爸媽都不在了。老家的房子空著，鑰匙在你手裡。' + (sibs(g) ? '兄弟姐妹說，怎麼處理聽你的。' : '') + '中介說，能賣 ' + fmt(oldVal(g) * 1e4) + ' 左右。',
      choices: [
        { t: '留著，逢年過節回去看看', canon: true, fx: (g) => { g.remember('oldHouse', 'keep'); g.set('keptOldHouse'); g.stat('心情', 2); }, res: '你把爸媽的照片掛回了原來的位置。' },
        { t: '賣了', dev: 10, fx: (g) => { A = Math.round(oldVal(g) * 1e4 / ((g.recall('sibs') || 0) + 1)); CN.earn(g, A); g.remember('oldHouse', 'sold'); g.stat('心情', -3); },
          res: (g) => '買家是個年輕人，說要改成民宿。' + (sibs(g) ? '兄弟姐妹分了錢，你那份是 ' : '賣了 ') + fmt(A) + '。你最後看了一眼門框上量身高的刻痕。' },
        { t: '讓給兄弟姐妹', dev: 10, cond: (g) => sibs(g), fx: (g) => { g.remember('oldHouse', 'gave'); g.stat('人缘', 5); }, res: '你在協議上籤了字。兄弟姐妹在飯桌上敬了你一杯。' },
        { t: '搬回去住', dev: 15, cond: (g) => atHome(g) && ['none', 'rent'].includes(house(g)),
          fx: (g) => { settleOld(g, oldVal(g)); g.remember('house', 'hometown'); g.remember('oldHouse', 'live'); }, res: '你退了租的房子，搬回了老屋。不用再交房租，牆上還有你小時候貼的畫。' },
      ] },
    { id: 'e_m_crash', y: [2026, 2200], minAge: 28, maxAge: 72, t: '行情', always: true,
      ok: (g) => g.age >= 28 && g.age <= 72 && invested(g) >= 50000 && ['fund', 'stock'].includes(g.recall('investStyle')) && !g.recall('crash') && (CN.marketMood ? CN.marketMood(g) === 'crash' : yearRoll(g, 11) < 0.1),
      text: (g) => '這一年行情急轉直下。你' + CN.riskName(g.recall('investStyle')) + '的 ' + fmt(invested(g)) + '，一個月裡跌掉了三成多。群裡有人在罵，有人在抄底。',
      choices: [
        { t: '拿著不動', canon: true, fx: (g) => { A = -gain(g, -0.35); g.remember('crash', 'hold'); }, res: () => '賬面上少了 ' + fmt(A) + '。你解除安裝了軟體，眼不見心不煩。' },
        { t: '割肉離場', dev: 10, fx: (g) => { A = -gain(g, -0.35); CN.withdraw(g); g.remember('crash', 'cut'); }, res: () => '你虧了 ' + fmt(A) + '，把剩下的錢全取了出來，存進了銀行。少虧就是賺，你這麼安慰自己。' },
        { t: '跌了再買一點', dev: 20, cond: (g) => cash(g) >= 50000,
          fx: (g) => { gain(g, -0.35); A = CN.invest(g, w1(cash(g) * 0.3), g.recall('investStyle') || 'fund'); g.remember('crash', 'add'); }, res: () => '你又投進去 ' + fmt(A) + '。' + '買完那天晚上，你沒怎麼睡著。' },
      ] },
    { id: 'e_m_boom', y: [2026, 2200], minAge: 28, maxAge: 72, t: '好行情', always: true,
      ok: (g) => g.age >= 28 && g.age <= 72 && invested(g) >= 50000 && ['fund', 'stock', 'gold'].includes(g.recall('investStyle')) && !g.recall('boom') && (CN.marketMood ? CN.marketMood(g) === 'boom' : yearRoll(g, 13) < 0.07),
      text: (g) => '這一年行情好得出奇。你' + CN.riskName(g.recall('investStyle')) + '的錢，半年漲了四成，現在是 ' + fmt(invested(g) * 1.4) + '。',
      choices: [
        { t: '拿著再看看', canon: true, fx: (g) => { A = gain(g, 0.4); g.remember('boom', 'hold'); }, res: () => '你多賺了 ' + fmt(A) + '，沒捨得賣。' },
        { t: '落袋為安', dev: 10, fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); g.remember('boom', 'cash'); }, res: () => '你把錢全取了出來，淨賺 ' + fmt(A) + '。賣完第二天，又漲了一點，你笑了笑。' },
        { t: '取一部分，帶家裡人出去玩一趟', dev: 15,
          fx: (g) => { A = gain(g, 0.4); CN.withdraw(g); B = w1(A * 0.2); spend(g, B); g.remember('boom', 'trip'); },
          res: (g) => '你拿出 ' + fmt(B) + '，帶' + (parentAlive(g) ? paWord(g) : CN.alone(g) ? '自己' : '一家人') + '去看了一趟海。剩下的存進了銀行。' },
      ] },

    /* 升职、自己干、当顾问：排在最后，这一年孩子、父母、行情都没有事才轮到 */
    { id: 'e_m_ladder', y: [2026, 2200], minAge: 38, maxAge: 44, t: '往上一級', loc: 'office', always: true,
      ok: (g) => g.age >= 38 && g.age <= 44 && EMP.includes(job(g)) && !!POST40[job(g)] && !g.recall('ladder40') && g.s('事业') >= 35,
      text: (g) => pk(g, ['老領導要退了，', '上面新設了一個位子，', '原來的負責人調走了，'], 34) + POST40[job(g)] + '的位置空著。你現在是' + title(g) + '，自己一個月約 ' + fmt(mPay(g, job(g))) + '。'
        + (hasKid(g) && !kidAway(g) && kAge(g) < 15 ? kn(g) + '還小，' + (married(g) ? spName(g) + '問你，以後晚上還回不回家吃飯。' : '放學要人接。') : ''),
      choices: [
        { t: (g) => '報名競爭（升上去約 ' + fmt(mPay(g, job(g), null, 12)) + '/月，擔子重，加班多）', canon: true, cond: hiEdu, check: ['事业', 55],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => '你當上了' + title(g) + '，現在一個月約 ' + fmt(mPay(g, job(g))) + '。辦公室換到了走廊盡頭，' + pk(g, ['窗外是一排梧桐。', '門口多了一盆發財樹。', '桌上的電話一天響幾十遍。'], 39),
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: '名單公示了，第一個名字不是你。你在樓下站了一會兒，又上樓幹活了。', dev: 5 } },
        { t: (g) => '報名競爭（升上去約 ' + fmt(mPay(g, job(g), null, 12)) + '/月；學歷吃虧，要靠這些年的業績）', canon: true, cond: (g) => !hiEdu(g), check: ['事业', 65],
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)]); g.stat('事业', 10); g.stat('健康', -3); g.remember('ladder40', 'head'); },
          res: (g) => '你當上了' + title(g) + '。有人背後說你學歷不夠，你把這幾年的資料攤在桌上，後來就沒人說了。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('ladder40', 'lost'); }, res: '位置給了一個學歷更高的年輕人。他第一天上班，先來請教你。', dev: 5 } },
        { t: (g) => '走專家路線，評' + EXPERT40[job(g)] + '（評上約 ' + fmt(mPay(g, job(g), null, 8)) + '/月，不用管人）', dev: 10, cond: (g) => !!EXPERT40[job(g)], check: ['学识', 70],
          fx: (g) => { CN.setJob(g, job(g), EXPERT40[job(g)]); g.stat('事业', 6); g.stat('学识', 2); g.remember('ladder40', 'expert'); },
          res: (g) => '評審會上你講了二十分鐘。證書下來，你成了' + title(g) + '。最難的那些活，從此都繞不開你。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('ladder40', 'lost'); }, res: '材料差一篇論文。你把評審表收好，說明年再來。', dev: 5 } },
        { t: (g) => '調去外地，升一級（約 ' + fmt(mPay(g, job(g), null, 14)) + '/月，' + (married(g) || (hasKid(g) && !kidAway(g)) ? '和家裡兩地跑' : '換個地方從頭來') + '）', dev: 20, cond: (g) => ['office', 'tech', 'sales', 'civil'].includes(job(g)),
          fx: (g) => { CN.setJob(g, job(g), POST40[job(g)] + (job(g) === 'civil' ? '（下派）' : '（外派）')); g.move('office', job(g) === 'civil' ? '下面的一個縣' : '外地的分公司'); g.stat('事业', 12); g.stat('人缘', -3); g.remember('ladder40', 'away'); },
          res: (g) => (job(g) === 'civil' ? '你去了下面的一個縣。' : '你去了外地的分公司。') + (married(g) || (hasKid(g) && !kidAway(g)) ? '每個週五晚上坐高鐵回家，週日晚上再坐回去。車上的座位號，你常常訂同一個。' : '宿舍不大，窗戶朝東，早上被太陽曬醒。') },
        { t: (g) => (married(g) || hasKid(g) || parentAlive(g) ? '不爭，把時間留給家裡' : '不爭，守著現在的活'), dev: 15,
          fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); g.remember('ladder40', 'family'); },
          res: (g) => (hasKid(g) && !kidAway(g) && kAge(g) < 18 ? '那幾年，' + kn(g) + '的家長會你一次也沒落下。' : parentAlive(g) ? '那幾年，' + paWord(g) + '每次複查都是你陪著去的。' : '你準點下班，學會了做幾道新菜。') },
      ] },
    { id: 'e_m_ladder2', y: [2026, 2200], minAge: 47, maxAge: 54, t: '最後一級', loc: 'office', always: true,
      ok: (g) => g.age >= 47 && g.age <= 54 && EMP.includes(job(g)) && !!TOP50[job(g)] && !g.recall('ladder50') && (['head', 'expert', 'away'].includes(g.recall('ladder40')) || g.s('事业') >= 65),
      text: (g) => '再往上，就是' + TOP50[job(g)] + '。' + pk(g, ['上面要從中層裡挑一個。', '考察組來談話，名單裡有你。', '老闆私下問你有沒有這個心思。'], 35) + '五十歲上下，有人往上衝，有人開始往下放。你現在一個月約 ' + fmt(mPay(g, job(g))) + '。',
      choices: [
        { t: (g) => '衝一把（成了約 ' + fmt(mPay(g, job(g), null, 15)) + '/月，應酬多，身體吃不消的大有人在）', dev: 15, check: ['事业', 70],
          fx: (g) => { CN.setJob(g, job(g), TOP50[job(g)]); g.stat('事业', 10); g.stat('健康', -4); g.remember('ladder50', 'top'); },
          res: (g) => '任命下來了，你成了' + title(g) + '。祝賀的訊息回了一晚上。第二天早上七點，你第一個到。',
          fail: { fx: (g) => { g.stat('心情', -5); g.remember('ladder50', 'lost'); }, res: '最後一輪，你輸給了一個空降來的人。你請了三天假，去郊外住了兩晚。', dev: 5 } },
        { t: '退居二線，帶帶年輕人', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('人缘', 3); g.stat('事业', -2); g.remember('ladder50', 'mentor'); },
          res: '你把這些年的筆記整理成了一個資料夾，發給了組裡的年輕人。有兩個人認真看了，追著你問。' },
        { t: (g) => '主動讓位，換個清閒的崗位（約 ' + fmt(k1(mPay(g, job(g)) * 0.8)) + '/月）', dev: 10,
          fx: (g) => { CN.setJob(g, job(g), (JOBT[job(g)] || '') + '（二線）'); g.stat('事业', -8); g.stat('健康', 3); g.remember('ladder50', 'easy'); },
          res: '新崗位沒什麼要緊事。你中午能睡半個鐘頭，下午五點半準時走。' },
      ] },
    { id: 'e_m_biz', y: [2026, 2200], minAge: 40, maxAge: 52, t: '另起爐灶', always: true,
      ok: (g) => g.age >= 40 && g.age <= 52 && !['none', 'retired', 'boss', 'shop', 'creator'].includes(job(g)) && !g.recall('biz45') && g.recall('startup') !== 'ok'
        && !['stall', 'online', 'franchise'].includes(g.recall('biz')) && lifeRoll(g, 36) < 0.18 && (cash(g) >= 60000 || ['rural', 'county'].includes(g.recall('hukou'))),
      text: (g) => {
        const home = ['rural', 'county'].includes(g.recall('hukou'));
        const a = home && lifeRoll(g, 37) < 0.5 ? '老家的村支書打來電話，說村裡想搞個' + coopCrop(g) + '合作社，缺一個見過世面、又肯回來的人。'
          : lifeRoll(g, 37) < 0.75 ? '一個老朋友開了三家' + frKind(g) + '，說你要加盟，他帶著你。' : '你看見同齡人在網上賣' + onlineItem(g) + '，一個月流水好幾萬。';
        return a + '你今年' + g.age + '歲，卡里有 ' + fmt(cash(g)) + '。';
      },
      choices: [
        { t: (g) => '加盟一家' + frKind(g) + '（本錢 ' + fmt(FR[tier(g)] || 200000) + (cash(g) < (FR[tier(g)] || 200000) ? '，要借 ' + fmt(w1((FR[tier(g)] || 200000) - Math.max(0, cash(g)))) : '') + '，回本要三年左右）', dev: 20,
          cond: (g) => cash(g) >= (FR[tier(g)] || 200000) * 0.4, check: ['事业', 50],
          fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); g.remember('bizKind45', k); CN.setJob(g, 'boss', k + '加盟店老闆'); g.remember('biz45', 'franchise'); g.stat('心情', 3); },
          res: (g) => '你辭了工作，開了一家' + g.recall('bizKind45') + '。前前後後投了 ' + fmt(A) + (M ? '，其中 ' + fmt(M) + ' 是借的' : '') + '。開業那天，' + (married(g) ? spName(g) + '站在收銀臺後面，比你還緊張。' : '老同事來了好幾個，幫你掛了橫幅。'),
          fail: { fx: (g) => { const k = frKind(g); A = FR[tier(g)] || 200000; M = spend(g, A); B = w1(A * 0.3); CN.earn(g, B); g.remember('bizKind45', k); g.remember('biz45', 'franchiseFail'); g.stat('心情', -6); },
            res: (g) => '店開在一個新小區門口，小區一直沒住滿。一年後你把店轉了，' + fmt(A) + ' 的本錢只收回 ' + fmt(B) + '。' + (owe(g) > 0 ? '賬上還欠著 ' + fmt(owe(g) * 1e4) + '。' : '') + '好在原來的單位還要你，你又回去上班了。', dev: 5 } },
        { t: (g) => '回老家辦合作社，種' + coopCrop(g) + '（本錢 ¥15 萬，帶著鄉親幹；收成看天，也看銷路）', dev: 25, cond: (g) => ['rural', 'county'].includes(g.recall('hukou')), check: ['人缘', 50],
          fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'boss', c + '合作社帶頭人'); g.remember('biz45', 'coop'); g.stat('人缘', 4); },
          res: (g) => '你回了' + where(g) + '。流轉地、搭冷庫、買苗，一共 ¥15 萬' + (M ? '，借了 ' + fmt(M) : '') + '。頭一年有十二戶入了社，第一車' + g.recall('crop45') + '拉走那天，大家在地頭放了一掛鞭。',
          fail: { fx: (g) => { const c = coopCrop(g); M = spend(g, 150000); CN.earn(g, 50000); if (!atHome(g)) backHome(g); g.remember('crop45', c); CN.setJob(g, 'farmer', '回鄉種地'); g.remember('biz45', 'coopFail'); g.stat('心情', -5); },
            res: (g) => '頭一年趕上倒春寒，' + g.recall('crop45') + '減產一大半，入社的人家退了一半。裝置折價賣了 ¥5 萬。你留在老家，種自己那幾畝地。', dev: 5 } },
        { t: (g) => '下了班開網店，賣' + onlineItem(g) + '（本錢 ¥5 萬，不用辭職；十家裡成兩三家）', dev: 15, check: ['人缘', 52],
          fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'online'); g.stat('健康', -2); },
          res: '¥5 萬買了貨、拍了樣品。你每天下了班打包到十一點，週末跑快遞站。第三個月，有個客戶給你寄了一封感謝信。',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('biz45', 'onlineFail'); g.stat('心情', -3); }, res: '你不會拍、不會說，網店一天只有幾個人看。半年後關了，貨堆在家裡，過年分給了親戚。', dev: 5 } },
        { t: '算了，這個年紀求穩', canon: true, fx: (g) => { g.remember('biz45', 'no'); g.stat('心情', 1); }, res: '你把電話那頭的話想了一晚上，第二天照常去上班。' },
      ] },
    { id: 'e_m_consult', y: [2026, 2200], minAge: 55, maxAge: 63, t: '顧問', always: true,
      ok: (g) => g.age >= 55 && g.age <= 63 && ['office', 'tech', 'doctor', 'teacher', 'sales', 'boss', 'worker', 'nurse'].includes(job(g)) && g.s('健康') >= 45 && !g.recall('consult')
        && (g.s('学识') >= 80 || g.s('事业') >= 75 || (job(g) === 'worker' && !!g.recall('skill'))),
      text: (g) => ({ doctor: '一家民營醫院', teacher: '一家培訓學校', nurse: '一家護理院', worker: '外地的一家工廠', tech: '一家剛起步的公司' }[job(g)] || '一家同行的小公司') + '託人找到你，想請你去當顧問。他們說，要的就是你這些年攢下的經驗。',
      choices: [
        { t: (g) => '答應，週末去兼職（每月多 ' + fmt(k1(mPay(g, job(g)) * 0.25)) + '）', dev: 10,
          fx: (g) => { g.remember('consultPay', k1(mPay(g, job(g)) * 0.25)); g.remember('consult', 'part'); g.stat('健康', -1); g.stat('事业', 3); },
          res: (g) => '你每個週六去半天，看看他們的難處，說幾句話。每月多出 ' + fmt(g.recall('consultPay')) + '，你單獨存了一張卡。' },
        { t: (g) => '辭了現在的工作，開個自己的工作室（本錢 ¥5 萬，' + CN.jobRisk('boss') + '）', dev: 25, cond: (g) => job(g) !== 'boss', check: ['事业', 60],
          fx: (g) => { M = spend(g, 50000); CN.setJob(g, 'boss', '開工作室'); g.remember('consult', 'own'); g.stat('心情', 4); },
          res: '你租了一間小辦公室，掛了塊牌子。第一單是老客戶介紹的。',
          fail: { fx: (g) => { M = spend(g, 50000); g.remember('consult', 'ownFail'); g.stat('心情', -4); }, res: '工作室開了大半年，單子不夠交房租。你把牌子摘了，¥5 萬算是買了個教訓。原單位讓你回去了。', dev: 5 } },
        { t: '謝了，安安穩穩幹到退休', canon: true, fx: (g) => { g.remember('consult', 'no'); }, res: '你把對方的名片夾進了筆記本。' },
      ] },

    /* 升职、自己干、当顾问的回响 */
    { id: 'e_m_ladder_echo', y: [2026, 2200], minAge: 41, maxAge: 64, t: '這幾年', auto: true, always: true,
      cond: (g) => !!g.recall('ladder40') && g.since('ladder40') >= 3,
      fx: (g) => { const l = g.recall('ladder40'); if (l === 'head') g.stat('健康', -2); if (l === 'away') { A = w1(myInc(g) * 0.2); CN.earn(g, A); if (POST40[job(g)]) CN.setJob(g, job(g), POST40[job(g)]); } if (l === 'family') g.stat('心情', 2); },
      text: (g) => ({
        head: '當' + POST40[job(g)] + '的這幾年，你學會了在會上少說話，在會後多打電話。體檢單上多了兩個箭頭。',
        expert: '你的名字進了行業裡的專家庫。每年有幾個年輕人專門來找你，帶著問題，也帶著家鄉的特產。',
        away: '外派那幾年攢下了 ' + fmt(A) + ' 的補貼。' + (married(g) ? '你調回來那天，' + spName(g) + '在車站等你，說你瘦了。' : (house(g) === 'rent' ? '回來以後，你在老地方租了一套朝南的房子。' : '回來以後，你把家裡重新粉刷了一遍。')),
        lost: '那次沒爭上，後來你也想開了。你在原來的位置上，做成了幾件自己想做的事。',
        family: hasKid(g) && !kidAway(g) ? kn(g) + '長大了，有天突然說，那幾年你每天都在家吃晚飯，' + kHe(g) + '記得。' : '那幾年你沒往上走。少掙的錢，換來了很多個早早回家的晚上。',
      }[g.recall('ladder40')]) },
    { id: 'e_m_ladder2_echo', y: [2026, 2200], minAge: 50, maxAge: 64, t: '位子', auto: true, always: true,
      cond: (g) => !!g.recall('ladder50') && g.since('ladder50') >= 3,
      fx: (g) => { const l = g.recall('ladder50'); if (l === 'top') { g.stat('健康', -3); A = w1(myInc(g) * 0.25); CN.earn(g, A); } else g.stat('心情', 2); },
      text: (g) => ({
        top: '坐在' + TOP50[job(g)] + '的位子上，你一年的獎金有 ' + fmt(A) + '。降壓藥換成了一天兩片。',
        lost: '那個空降來的人幹了兩年就走了。你沒再去爭，日子也照樣過。',
        mentor: '你帶過的一個年輕人升了職，請你吃飯。他說，師父，你當年說的話我都記著。',
        easy: '清閒的這幾年，你把家附近的公園走遍了，認識了一群一起打太極的人。',
      }[g.recall('ladder50')]) },
    { id: 'e_m_biz_echo', y: [2026, 2200], minAge: 43, maxAge: 64, t: '生意', auto: true, always: true,
      cond: (g) => ['franchise', 'coop', 'online'].includes(g.recall('biz45')) && g.since('biz45') >= 3,
      fx: (g) => {
        const b = g.recall('biz45');
        M = helperM(g);
        B = g.rnd() < { franchise: 0.65, coop: 0.6, online: 0.5 }[b] ? 1 : 0;
        if (B) { A = b === 'franchise' ? w1((FR[tier(g)] || 200000) * 0.6) : b === 'coop' ? w1(80000 + g.rnd() * 120000) : w1(60000 + g.rnd() * 60000); CN.earn(g, A); g.stat('事业', 6); if (b === 'online') CN.setJob(g, 'boss', '網店老闆'); }
        else if (b === 'franchise') { A = w1((FR[tier(g)] || 200000) * 0.2); CN.earn(g, A); CN.setJob(g, tier(g) >= 4 ? 'worker' : 'office', tier(g) >= 4 ? '工廠工人' : '公司職員'); g.stat('心情', -6); }
        else if (b === 'coop') { CN.setJob(g, 'farmer', '種地'); g.stat('心情', -5); }
        else g.stat('心情', -2);
      },
      text: (g) => {
        const b = g.recall('biz45');
        const hire = M ? '你把' + helpWho(g, M) + '叫來幫忙，' + (b === 'coop' ? '管倉庫和賬本。' : b === 'online' ? '管客服和發貨。' : '管收銀。') : '你僱了兩個附近的人。';
        if (b === 'franchise') return B ? '那家' + g.recall('bizKind45') + '回了本，這幾年淨掙了 ' + fmt(A) + '。你又開了一家分店，' + hire
          : '總部換了打法，加盟費漲了，客人卻少了。你把' + g.recall('bizKind45') + '轉了出去，收回 ' + fmt(A) + '，又找了份工作。' + (owe(g) > 0 ? '欠的 ' + fmt(owe(g) * 1e4) + '，按月還。' : '');
        if (b === 'coop') return B ? '合作社有了三十幾戶。' + g.recall('crop45') + '貼上了你們村的名字，賣到了外省，去年分紅 ' + fmt(A) + '。' + hire
          : '連著兩年行情不好，' + g.recall('crop45') + '爛在地裡一批。合作社散了，你把冷庫租給了別人，自己回去種地。';
        return B ? '網店做穩了，這幾年淨掙了 ' + fmt(A) + '。你辭了工作，專心打理。' + hire : '平臺的規矩一年一變，網店的流量越來越少。你把它關了，留下一屋子紙箱和幾個常聯絡的老客戶。';
      } },
    { id: 'e_m_consult_echo', y: [2026, 2200], minAge: 57, maxAge: 64, t: '顧問這幾年', auto: true, always: true,
      cond: (g) => ['part', 'own', 'ownFail'].includes(g.recall('consult')) && g.since('consult') >= 2,
      fx: (g) => { const c = g.recall('consult'); A = 0; if (c === 'part') { A = (Number(g.recall('consultPay')) || 0) * 24; CN.earn(g, A); } if (c === 'own') { A = w1(myInc(g) * (0.3 + g.rnd() * 0.6)); CN.earn(g, A); } },
      text: (g) => ({
        part: '週末當顧問這兩年，那張卡里攢下了 ' + fmt(A) + '。那家' + (job(g) === 'doctor' ? '醫院' : job(g) === 'teacher' ? '學校' : '公司') + '的年輕人，見了你都叫老師。',
        own: '工作室有了幾個固定的客戶。這兩年多掙了 ' + fmt(A) + '，你給自己定了規矩：晚上八點以後不接電話。',
        ownFail: '那塊摘下來的牌子，你一直放在陽臺上。有時候澆花，會看它一眼。',
      }[g.recall('consult')]) },

    /* 自动发生的回响和变故 */
    { id: 'e_m_kid_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子', auto: true, always: true,
      cond: (g) => !!g.recall('kidBond') && g.since('kidBond') >= 3 && hasKid(g),
      fx: (g) => { const b = g.recall('kidBond'); if (b === 'close') g.stat('心情', 3); if (b === 'strict') g.stat('人缘', -2); },
      text: (g) => {
        const b = g.recall('kidBond');
        const s = g.recall('kidSchool');
        const pre = s === 'left' ? '接回身邊以後，孩子跟你一直隔著一層。' : s === 'district' ? (owe(g) > 0 ? '學區房的貸款還在還，' : '') + '孩子的學校倒是真的好。' : '';
        return pre + (b === 'close' ? '那次長談以後，孩子有事會先來問你。' : b === 'strict' ? '孩子長大了，跟你說話還是客客氣氣的，像跟老師。' : '孩子自己長大了，長成了你不太認得、又有點佩服的樣子。');
      } },
    { id: 'e_m_kid_move_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '在市裡', auto: true, always: true,
      cond: (g) => !!g.recall('kidMove') && g.recall('kidMove') !== 'stay' && g.since('kidMove') >= 2 && hasKid(g),
      text: (g) => ({
        buy: '搬到市裡兩年，孩子的成績穩在了年級前面。你也慢慢習慣了城裡的菜價。',
        rent: '陪讀的兩年，你認識了一群同樣陪讀的家長。誰家孩子考好了，大家一起高興。',
        board: '寄宿兩年，孩子學會了自己洗衣服、管錢。週五回家，會幫你做飯了。',
      }[g.recall('kidMove')]) },
    { id: 'e_m_kid_uni_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子的路', auto: true, always: true,
      cond: (g) => !!g.recall('kidPath') && g.since('kidPath') >= 3 && hasKid(g),
      text: (g) => {
        const p = g.recall('kidPath'), u = g.recall('kidUni');
        if (p === 'work') return '孩子學的手藝有了用處，自己開了個小工作室。逢人問起，你說：“孩子自己闖出來的。”';
        if (p === 'stable') return (u === 'top' || u === 'good' ? '孩子按你選的路讀完了書，工作很穩。' : '孩子讀完書，考了好幾年才考上編。') + '有一次喝了酒，孩子說那年要是自己選就好了。';
        return u === 'top' ? '孩子讀的那所好大學，成了你在親戚面前少有的話題。' : '孩子自己選的專業，後來竟然真的找到了對口的工作。';
      } },
    { id: 'e_m_kid_wed_echo', y: [2026, 2200], minAge: 42, maxAge: 64, t: '小兩口', auto: true, always: true,
      cond: (g) => !!g.recall('kidWed') && g.since('kidWed') >= 2 && hasKid(g),
      text: (g) => ({
        paid: '小兩口搬進了新房，房本上寫著他們倆的名字。' + kn(g) + '說，房貸他們自己還，你幫的那筆慢慢還你。你說不用。',
        self: '小兩口租房住，日子過得緊，也過得有勁。週末常來你這兒蹭飯。',
        none: '沒辦婚禮的小兩口，把錢攢下來，去了一趟很遠的地方。照片發回來，你設成了手機屏保。',
      }[g.recall('kidWed')]) },
    { id: 'e_m_pa_bill_echo', y: [2026, 2200], minAge: 46, maxAge: 64, t: '出院以後', auto: true, always: true,
      cond: (g) => !!g.recall('paBill') && g.since('paBill') >= 1,
      text: (g) => {
        const b = g.recall('paBill');
        if (!parentAlive(g)) return '那次住院以後，老人又陪了你一段日子。你不後悔當時的決定。';
        if (b === 'best') return paWord(g) + '恢復得很好，又能下樓遛彎了。鄰居都問用的什麼藥。';
        if (b === 'split') return paWord(g) + '恢復得不錯。那次一起湊錢以後，兄弟姐妹的群裡熱鬧了很多。';
        return paWord(g) + '的病控制住了，就是走路要拄拐了。你在樓道里裝了一排扶手。';
      } },
    { id: 'e_m_crash_echo', y: [2026, 2200], minAge: 30, maxAge: 74, t: '回過頭看', auto: true, always: true,
      cond: (g) => !!g.recall('crash') && g.since('crash') >= 2,
      fx: (g) => { const c = g.recall('crash'); A = 0; if (c === 'hold') A = gain(g, 0.3); if (c === 'add') A = gain(g, 0.45); },
      text: (g) => {
        const c = g.recall('crash');
        if (c === 'cut') return '後來行情慢慢漲回來了。你已經不在車上，就當看個熱鬧。存在銀行裡的錢，一分沒少。';
        if (!invested(g)) return '那次大跌以後，你再沒碰過這些。';
        return (c === 'add' ? '當年跌的時候買的那筆，漲了不少。' : '兩年後，行情慢慢回來了。') + '你開啟軟體，賬戶裡是 ' + fmt(invested(g)) + '。';
      } },
    { id: 'e_m_boom_echo', y: [2026, 2200], minAge: 30, maxAge: 74, t: '漲過之後', auto: true, always: true,
      cond: (g) => !!g.recall('boom') && g.since('boom') >= 2,
      fx: (g) => { if (g.recall('boom') === 'hold') gain(g, -0.15); },
      text: (g) => ({
        hold: '那一波漲完，又回撥了一些。賬戶裡現在是 ' + fmt(invested(g)) + '，比當初還是多。',
        cash: '那次落袋為安的錢，你一直存著，留著養老。',
        trip: '那次旅行的照片，' + (CN.alone(g) ? '你洗了出來掛在牆上。' : '家裡人一直掛在客廳的牆上。'),
      }[g.recall('boom')]) },
    { id: 'e_m_fa_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '父親走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.fa && deadThisYear(g, 'fa'),
      fx: (g) => { g.stat('心情', -6); g.remember('lostFa', true); },
      text: (g) => {
        const p = g.recall('parentsCare');
        return p === 'self' && g.recall('parentsIn') ? '父親是在你家裡走的，走之前喊了你的小名。' : p === 'nursing' ? '養老院半夜來了電話。你趕到的時候，護工說他走得很安靜。' : p === 'far' ? '你連夜趕回老家，還是晚了一步。攝像頭裡，最後一段錄影是他在看電視。' : '父親走了。你在靈堂守了三夜，把他這輩子的事想了一遍。';
      } },
    { id: 'e_m_mo_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '母親走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.mo && deadThisYear(g, 'mo'),
      fx: (g) => { g.stat('心情', -7); },
      text: (g) => (g.recall('lostFa') ? '母親也走了。從此你就沒有爸媽了。' : '母親走了。') + (g.recall('parentsCare') === 'self' && g.recall('parentsIn') ? '她的那雙拖鞋，你很久都沒收起來。' : '收拾遺物的時候，你找到一個鐵盒子，裡面是你小時候的獎狀。') },
    { id: 'e_m_oldhouse_echo', y: [2026, 2200], minAge: 36, maxAge: 64, t: '老家', auto: true, always: true,
      cond: (g) => !!g.recall('oldHouse') && g.since('oldHouse') >= 3,
      text: (g) => {
        const o = g.recall('oldHouse');
        if (o === 'keep' && g.f('keptOldHouse')) return '清明回老家，你推開那扇門，灰塵在光裡飄。鄰居說，你家門口那棵樹又粗了一圈。';
        if (o === 'sold') return '你路過老家，那房子改成了民宿，門口掛著燈籠。你沒進去。';
        if (o === 'live') return '住回老屋的這幾年，你把院子收拾了出來，種了蔥和辣椒。鄰居常隔著牆遞東西過來。';
        return '兄弟姐妹把老房子翻新了。你回去住了一晚，睡的還是小時候那張床。';
      } },
    { id: 'e_m_sp_ill_echo', y: [2026, 2200], minAge: 51, maxAge: 64, t: '病床邊', auto: true, always: true,
      cond: (g) => !!g.recall('spSick') && g.since('spSick') >= 1,
      fx: (g) => { if (married(g) && g.rnd() < (g.recall('spSick') === 'all' ? 0.2 : 0.35)) g.kill('sp', '病逝', true); },
      text: (g) => (married(g) ? spName(g) + '熬過來了。出院那天，你們在醫院門口拍了一張照片，兩個人都瘦了一圈。' : '你盡了力。' + spName(g) + '還是走了。') },
    { id: 'e_m_sp_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '另一半走了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '喪偶'); g.stat('心情', -10); },
      text: (g) => spName(g) + '走了。' + (g.recall('marriage') === 'mended' ? '那次長談以後的十幾年，是你們最好的日子。' : g.recall('marriage') === 'cold' ? '你們冷了那麼多年，到最後才又說了很多話。' : '家裡的另一半東西，你一樣也沒捨得扔。') },
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

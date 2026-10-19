/* 群侠 · 银两：装备、货物、黑市、铁匠铺钱庄镖局在哪，押镖遇劫、悬赏、赌坊、劫道。
 * 定价按“一天约值三两”。装备三格（兵器、护身、鞋）各三档：50、180、600 两，打一架磨一点，磨到头只剩一半的用处，找铁匠修。
 * 目标（tools/playtest.js 会打印）：一局总收入 1800–2800 两；八成以上的局买过装备；被抢的钱占花销一成以下。 */
(function () {
  'use strict';
  const QX = window.QX;

  QX.addText({
    买装备: '你花 {n} 两买下了{a}。', 旧装备折价: '旧的{a}折了 {n} 两。', 不用修: '这件东西还好好的，不用修。', 修装备: '铁匠花了一天，把{a}修得跟新的一样，收了 {n} 两。',
    存钱: '你在钱庄存了 {n} 两，折子上一共 {b} 两。', 取钱: '你从钱庄取了 {n} 两，折子上还剩 {b} 两。',
    货满了: '最多只能带 {n} 包货。', 进货: '你花 {n} 两进了 {k} 包{a}。', 出货: '你卖了 {k} 包{a}，得了 {n} 两。',
    声望不够押镖: '镖局只把镖交给有名有姓的人（声望 {n} 以上）。', 押镖去: '押镖去{a}，镖银 {n} 两', 接镖: '你接了一趟镖，送去{a}，镖银 {n} 两，限 {d} 天。',
    丢镖: '镖丢了。镖局要你赔一半的镖银，{n} 两。', 镖误期: '镖误了期，镖局要你赔 {n} 两。', 交镖: '镖平平安安送到了{a}，你拿到了 {n} 两镖银。',
    捐献: '你给{a}捐了 {n} 两银子。管账的记了一笔，门里的人看你的眼神不一样了。', 拜师礼: '拜师礼 {n} 两', 买黑货: '你在黑市买了{a}。卖的人是什么来路，你没敢问。',
  });

  /* ---------- 装备 ---------- */
  QX.addGear({
    gangjian: { name: '精钢剑', slot: '兵器', tier: 1, price: 50, bonus: { 攻击: 5 }, d: '铁匠铺里最常见的剑，结实。' },
    qinggang: { name: '青钢剑', slot: '兵器', tier: 2, price: 180, bonus: { 攻击: 12 }, d: '剑身泛着青光，吹毛能断。' },
    longquan: { name: '龙泉宝剑', slot: '兵器', tier: 3, price: 600, bonus: { 攻击: 22 }, d: '龙泉的老师傅一年只出三把。' },
    huxin: { name: '牛皮护心', slot: '护身', tier: 1, price: 50, bonus: { 防御: 3 }, d: '两层牛皮缝在一起，挡得住一刀。' },
    tengjia: { name: '软藤甲', slot: '护身', tier: 2, price: 180, bonus: { 防御: 8 }, d: '桐油泡过的老藤编的，又轻又韧。' },
    wujin: { name: '乌金丝甲', slot: '护身', tier: 3, price: 600, bonus: { 防御: 15 }, d: '乌金丝织的贴身软甲，刀剑难入。' },
    kuaixue: { name: '千层底快靴', slot: '鞋', tier: 1, price: 50, bonus: { 轻功: 2 }, d: '千层底，走山路不磨脚。' },
    lupi: { name: '鹿皮快靴', slot: '鞋', tier: 2, price: 180, bonus: { 轻功: 5 }, d: '鹿皮软底，落地没有声音。' },
    taxue: { name: '踏雪无痕靴', slot: '鞋', tier: 3, price: 600, bonus: { 轻功: 9 }, d: '据说穿着它在雪地上走，留不下脚印。' },
  });

  /* ---------- 货物：哪里便宜买、哪里贵了卖 ---------- */
  QX.addGoods({
    yaocai: { name: '西域药材', buy: { guangming: 8 }, sell: { lintan: 20, dadu: 18, xiangyang: 15 }, d: '昆仑山下收的雪参、红花，中原的药铺抢着要。' },
    pucha: { name: '普洱茶饼', buy: { dali: 6 }, sell: { dadu: 16, lintan: 13, xiangyang: 11 }, d: '大理的茶，越陈越香。' },
    haiyan: { name: '海盐', buy: { lintan: 5 }, sell: { guangming: 16, emei: 11, dali: 12 }, d: '东海边晒的盐，西边山里缺这个。' },
    sichou: { name: '杭州丝绸', buy: { lintan: 14 }, sell: { dadu: 26, guangming: 30, dali: 22 }, d: '临安城里织的绸缎，北边和西域的贵人喜欢。' },
  });

  /* ---------- 黑市货：买一次品德 -10 ---------- */
  QX.addItems({
    hanbing_pu: { name: '寒冰绵掌残页', type: '秘籍', price: 450, teaches: 'hanbing', black: true, d: '不知道从哪个明教弟子身上搜出来的几页纸。' },
    xuanming_pu: { name: '玄冥神掌抄本', type: '秘籍', price: 650, teaches: 'xuanming', black: true, d: '王府里流出来的抄本，纸上有股药味。' },
    tiyun_pu: { name: '梯云纵抄本', type: '秘籍', price: 400, teaches: 'tiyun', black: true, d: '武当的轻功，不知道是哪个弟子偷抄了卖的。' },
  });

  /* ---------- 地点：铁匠铺、钱庄、镖局、黑市 ---------- */
  QX.extendLocs({
    xiangyang: { smith: ['gangjian', 'huxin', 'kuaixue', 'qinggang', 'tengjia'], bank: true, escort: true },
    dadu: { smith: ['qinggang', 'tengjia', 'lupi', 'longquan', 'wujin'], bank: true, escort: true,
      shop: ['jinchuang', 'renshen', 'jiedu', 'qishang_pu', 'hanbing_pu', 'xuanming_pu'] },
    lintan: { smith: ['gangjian', 'huxin', 'kuaixue', 'lupi', 'taxue'], bank: true, escort: true,
      shop: ['jinchuang', 'renshen', 'jiedu', 'dengping_pu', 'taizu_pu', 'tuna_pu', 'tiyun_pu'] },
    dali: { smith: ['gangjian', 'huxin', 'kuaixue', 'lupi'], escort: true },
    shaolin: { escort: true },
  });

  /* ---------- 对手 ---------- */
  QX.addEnemies({
    jiebiao: { name: '劫镖的强人', hp: 130, atk: 20, def: 7, agi: 13, moves: [['朴刀', 1.1], ['绊马索', 1]], xp: 22, silver: [5, 20], scale: 36 },
    huwei: { name: '商队护卫', hp: 100, atk: 17, def: 6, agi: 12, moves: [['齐眉棍', 1], ['护院拳', 1.1]], xp: 14, silver: [10, 25], scale: 30 },
    guanbing: { name: '捕快', hp: 120, atk: 19, def: 8, agi: 14, moves: [['铁尺', 1.1], ['锁链', 1]], xp: 18, silver: [3, 10], scale: 34 },
  });

  const town = (g) => !!QX.LOCS[g.loc].inn;
  const cool = (g, k, n) => !(g.f(k) && g.day - g.f(k) < n);

  QX.addEvents([
    /* 押镖遇劫：引擎在押镖赶路时按四成的机会排进来 */
    { id: 'esc_rob', once: false, cond: (g) => g.escorting(), t: '劫镖',
      text: (g) => g.pick(['山道上横着一根绊马索，林子里跳出一伙人，领头的喊：“镖留下，人走！”', '天还没亮，一伙蒙面人摸到了镖车跟前。']),
      choices: [
        { t: '护镖', fight: { foes: ['jiebiao', 'jiebiao'], win: { fx: (g) => g.add('声望', 2), res: '强人丢下兵器跑了。镖车上的旗子还插得好好的。' },
          lose: { fx: (g) => g.escortLose(), res: '你被打倒在车辙里。醒来时，镖车已经不见了。' } } },
        { t: '拿一半镖银买路', fx: (g) => { const T = g.S.tasks.escort; T.pay = Math.round(T.pay / 2); g.add('声望', -1); }, res: '领头的掂了掂你许下的数，挥手让开了路。这趟镖白跑了一半。' },
        { t: '扔下镖车逃命', fx: (g) => g.escortLose(), res: '你跑掉了。镖局的人后来找到你，要你赔钱。' },
      ] },

    /* 悬赏榜：城镇的客店门口都有，揭一回榜歇二十天 */
    { id: 'bounty', anywhere: true, act: '看悬赏榜', once: false, cond: (g) => town(g) && cool(g, 'bountyDay', 20), t: '悬赏榜',
      text: (g) => '客店门口贴着几张榜。' + (g.at('dadu') ? '最新的一张盖着汝阳王府的印，悬赏捉拿明教反贼，赏格很高。' : '一张写着附近山里有一伙贼，抢了好几个村子。'),
      fx: (g) => g.set('bountyDay', g.day),
      choices: [
        { t: '揭榜，去抓那伙贼', fight: { foes: ['zeitou', 'shanzei'], win: { fx: (g) => { g.add('银两', 40 + Math.min(110, Math.round(g.st('声望')))); g.add('声望', 3); g.add('品德', 1); }, res: '你把贼头捆了送到衙门，领了赏钱。村里的人送了你一程。' },
          lose: { res: '贼头比榜上画的凶多了。你空着手回来了。' } } },
        { t: '揭王府的榜，去抓明教的人', cond: (g) => g.at('dadu'), fight: { foes: ['mjdizi', 'mjdizi'], win: { fx: (g) => { g.add('银两', 2 * (40 + Math.min(110, Math.round(g.st('声望'))))); g.add('品德', -8); g.like('zhaomin', 5); }, res: '你把两个明教的人押进了王府。赏钱是双份的，那两个人后来没再出来。' },
          lose: { res: '明教的人拼起命来，你没抓到人。' } } },
        { t: '看看就走', res: '你从榜前走开了。' },
      ] },

    /* 赌坊：押小押大，期望亏一成；出千期望赚三成，被识破要打一架 */
    { id: 'gamble', anywhere: true, act: '进赌坊', once: false, cond: (g) => ['lintan', 'dadu', 'xiangyang'].includes(g.loc), t: '赌坊',
      text: '赌坊里烟气熏人，骰子在碗里哗啦啦地转。庄家是个独眼的胖子。',
      choices: [
        { t: '押十两', cost: { 银两: 10 }, fx: (g) => { if (g.rnd() < 0.45) { g.add('银两', 20); g.log('骰子开出来，你赢了十两。'); } else g.log('骰子开出来，你输了。'); }, res: '你又看了几把，收手出了门。' },
        { t: '押五十两', cost: { 银两: 50 }, fx: (g) => { if (g.rnd() < 0.45) { g.add('银两', 100); g.log('你赢了五十两，旁边的人都在看你。'); } else g.log('五十两没了。庄家冲你笑了笑。'); }, res: '你出了赌坊，外面的风很冷。' },
        { t: '出千', cost: { 银两: 20 }, check: ['资质', '中'], fx: (g) => { g.add('银两', 78); g.add('品德', -3); }, res: '你手上换了一颗骰子，连赢了几把。庄家的独眼一直盯着你。',
          fail: { fx: (g) => g.add('品德', -3), res: '骰子从袖口掉了出来。几个打手围了上来。', next: 'gamble_caught' } },
        { t: '不赌', res: '你在门口看了一会儿，走了。' },
      ] },
    { id: 'gamble_caught', once: false, t: '被识破',
      text: '独眼庄家一拍桌子：“在老子的场子出千？”',
      choices: [
        { t: '打出去', fight: { foes: ['dipi', 'dipi', 'dipi'], win: { res: '你打翻了几个打手，从后窗跳了出去。这家赌坊你是进不去了。' }, lose: { res: '你被扔到了街上，身上的钱被搜走了一些。' } } },
        { t: '赔笑认罚', fx: (g) => g.rob(0.3, 60), res: '你把身上的钱掏了一大半，才被放了出去。' },
      ] },

    /* 劫道：在荒山里截商队，来钱快，品德掉，官府会盯上你 */
    { id: 'rob_road', anywhere: true, act: '在山道上截一支商队', once: false, cond: (g) => !town(g) && !QX.LOCS[g.loc].sea && g.st('品德') < 60 && cool(g, 'robDay', 30), t: '劫道',
      text: '山道上过来一支商队，十几匹骡子，驮着鼓鼓的货包。护卫只有两个。',
      choices: [
        { t: '蒙上脸冲出去', fight: { foes: ['huwei', 'huwei'], win: { fx: (g) => { g.add('银两', 20 + Math.round(g.rnd() * 40)); g.add('品德', -6); g.set('robDay', g.day); g.set('wanted'); }, res: '护卫跑了。你从货包里翻出一袋碎银子。赶骡子的老汉跪在地上，一直在抖。' },
          lose: { fx: (g) => g.set('robDay', g.day), res: '护卫比你想的硬。你捂着伤口逃进了林子。' } } },
        { t: '算了，放他们过去', fx: (g) => g.add('品德', 1), res: '商队的铃铛声慢慢远了。' },
      ] },
    /* 劫过道的人，路上会碰上捕快 */
    { id: 'rd_wanted', road: true, once: false, w: 3, cond: (g) => g.f('wanted'), t: '捕快',
      text: '路口站着几个捕快，手里拿着一张画像。画上的人，有几分像你。',
      choices: [
        { t: '拼了', fight: { foes: ['guanbing', 'guanbing'], win: { fx: (g) => g.add('品德', -2), res: '你打翻了捕快，夺路走了。画像上的人，从此更像你了。' }, lose: { fx: (g) => { g.days(20); g.rob(0.5, 100); g.unset('wanted'); }, res: '你被押进大牢关了二十天，钱都拿去打点了。出来以后，画像撕了。' } } },
        { t: '花钱打点', cost: { 银两: 60 }, fx: (g) => g.unset('wanted'), res: '领头的捕快收了银子，把画像揉成一团扔进了路沟。' },
        { t: '低着头混过去', check: ['资质', '中'], res: '捕快看了你两眼，挥手放你过去了。', fail: { fx: (g) => g.hurt(40), res: '一个捕快认出了你，你挨了一铁尺才跑掉。' } },
      ] },
  ]);
})();

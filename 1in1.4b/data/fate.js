/* 十四亿分之一 · 天赋、心愿、结局（v2.1）
 * 三样让每一世不一样、也让人想再来一世的东西，都只要点一下：
 *   1. 天赋（记忆键 gift）：周岁抓周，三样里抓一样。每样天赋让一类判定容易 12%，另有一点长期的好处。
 *      五样一开始就有，另外三样靠成就解锁（人生图鉴里记着）。
 *   2. 心愿（wishes、wishDone）：十六岁选了志向以后，写下三件想做的事。做到一件，生平里记一行，心情 +4。
 *      墓志页显示做到了几件（取代原来按公式算的“志向达成度”）。
 *   3. 结局（life.end）：命终时按这一生的样子给一个名字，一共 33 种，收进人生图鉴。
 *      另外按 data/rarity.js 的统计，写一句“家底超过了百分之几同样出身的人”。
 * 排在 tech.js 之后、spine.js 之前载入；墓志页、首页、分享卡由 legacy.js 调用 JY.FATE。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const L_ = () => JY.engine.get().L;
  const r1000 = (x) => Math.round(x / 1000) * 1000;
  const ALBUM_KEY = '1in1.4b.album.v1';
  const album = () => { try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || 'null') || {}; } catch (e) { return {}; } };

  /* ---------- 天赋 ---------- */
  // stat：这类判定容易 12%；need：要先解锁的成就（legacy.js 的成就 id）
  const GIFTS = [
    { k: 'book', t: '读书种子', stat: '学识', pick: '抓起那本书', hint: '学识的判定容易一成多；上学那些年学得更快',
      res: '你抓住书角不撒手。一屋子人都笑了，说这孩子以后是读书的料。', fx: (g) => g.stat('学识', 6) },
    { k: 'abacus', t: '会算账', stat: '财富', pick: '抓起算盘', hint: '财富的判定容易一成多；存款每年多生一点利息',
      res: '算盘珠子哗啦响了一声，你自己先吓了一跳。大人们说，以后是个会算账的。' },
    { k: 'seal', t: '坐得住', stat: '事业', pick: '抓起那枚印章', hint: '事业的判定容易一成多；事业能走得更高',
      res: '你攥着印章，谁来拿都不给。有长辈说，这孩子坐得住，以后能成事。' },
    { k: 'ball', t: '身子骨硬', stat: '健康', pick: '抱住那只皮球', hint: '健康的判定容易一成多；中年以后身体掉得慢',
      res: '你抱着球滚了半圈，没哭。大人们说，这孩子身子骨结实。', fx: (g) => g.stat('健康', 8) },
    { k: 'mic', t: '自来熟', stat: '人缘', pick: '抓起话筒', hint: '人缘的判定容易一成多；从小人缘就好',
      res: '你对着话筒啊了一声，把自己逗笑了。大人们说，以后到哪儿都不怯场。', fx: (g) => g.stat('人缘', 8) },
    { k: 'coin', t: '有财运', stat: '财富', need: 'tenmil', needT: '千万身家', pick: '抓起那串铜钱', hint: '成年时手里的钱多一倍；偶尔有一笔意外之财',
      res: '铜钱在你手里叮当响。大人们说，这孩子以后不缺钱花。' },
    { k: 'brush', t: '有灵气', stat: '心情', need: 'odd', needT: '走自己的路', pick: '抓起那支画笔', hint: '自己干（开店、自由职业、自媒体）挣得多两成半',
      res: '你拿笔在红布上划了一道。大人们说，这孩子手上有灵气。', fx: (g) => g.stat('心情', 5) },
    { k: 'sleep', t: '心宽', stat: '心情', need: 'plain', needT: '和大多数人一样', pick: '什么都没抓，趴着睡着了', hint: '心情好；再难的时候也缓得过来',
      res: '你爬了两步，趴在红布上睡着了。大人们笑了半天，说这孩子心宽。', fx: (g) => g.stat('心情', 10) },
  ];
  const giftOf = (g) => GIFTS.find((x) => x.k === g.recall('gift')) || null;
  const unlocked = () => { const ach = album().ach || {}; return GIFTS.filter((x) => !x.need || ach[x.need]); };
  // 这一世摆在面前的三样：按投胎时定的种子从已解锁的里面取，一世之内不变
  const prng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const seedOf = (g) => { let s = g.recall('zzSeed'); if (s == null) { s = Math.floor(Math.random() * 1e9); g.remember('zzSeed', s); } return s; };
  const laidOut = (g) => {
    const saved = g.recall('zzOpts');
    if (saved) return saved;
    const r = prng(seedOf(g)), pool = unlocked().map((x) => x.k);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const opts = pool.slice(0, 3);
    g.remember('zzOpts', opts);
    return opts;
  };
  const gen = JY.GENERATE;
  JY.GENERATE = () => { const r = gen(); r.me.mem.zzSeed = Math.floor(Math.random() * 1e9); return r; };

  // 判定：天赋对口的那一类容易 12%
  CN.giftOdds = (g, chk) => { const x = giftOf(g); return x && chk && chk[0] === x.stat ? 12 : 0; };
  // 事业的线：坐得住的人高 8
  CN.giftCareer = (g) => (g.recall('gift') === 'seal' ? 8 : 0);
  // 收入：有灵气的人自己干，多挣两成半
  const income = CN.income;
  CN.income = (g) => { const v = income(g); return g.recall('gift') === 'brush' && ['creator', 'freelance', 'shop'].includes(g.recall('job')) ? Math.round(v * 1.25) : v; };

  const GIFT12 = {
    book: '别人背三遍的课文，你看两遍就记住了。语文老师让你在班上领读。',
    abacus: '小卖部老板找错了钱，你一眼就看出来了。他多给了你一颗糖。',
    seal: '班主任让你当了纪律委员。自习课上你坐在讲台边，一节课没动过。',
    ball: '运动会上你跑了八百米，冲线的时候气都没怎么喘。',
    mic: '元旦晚会缺个报幕的，你举了手。台下几百个人，你一个字也没说错。',
    coin: '你在路边捡到二十块钱，交给了老师。第二天，你买的饮料瓶盖里中了再来一瓶。',
    brush: '黑板报是你画的。隔壁班的老师路过，站着看了好一会儿。',
    sleep: '期末考砸了，你回家照样吃了两碗饭。家里人说，这孩子心真大。',
  };
  const GIFT38 = {
    book: '家里新买的机器，说明书厚厚一本。你花了一个晚上看完，第二天谁不会用都来问你。',
    abacus: '年底你把家里一年的账理了一遍。哪笔该省，哪笔不能省，心里清清楚楚。',
    seal: '亲戚家办事，大事小事都来问你拿主意。你坐在那里，一条一条说得明明白白。',
    ball: '同龄人开始说腰疼、膝盖疼。你爬了六层楼，气还是匀的。',
    mic: '朋友的婚礼临时缺个主持，你上去说了二十分钟。散席的时候，好几个人来加你的联系方式。',
    coin: '商场抽奖，你随手一抽，抽中了一台电饭煲。',
    brush: '你给家里的墙刷了个颜色，又自己打了一个架子。来过的人都问是在哪儿买的。',
    sleep: '这一年事情不少。你每天还是沾枕头就睡着。',
  };
  JY.addLifeNodes([
    { id: 'c_zhuazhou', age: 1, t: '抓周', major: true,
      stake: '抓到什么，这一世就多一样天生的本事。',
      text: '周岁那天，家里人在床上铺了一块红布，摆了一圈东西，把你放在中间。大人们都不说话，看你往哪边爬。',
      choices: GIFTS.map((x) => ({
        t: x.pick, canon: true, hint: x.hint, cond: (g) => laidOut(g).includes(x.k),
        fx: (g) => { g.remember('gift', x.k); g.info('天赋', x.t); if (x.fx) x.fx(g); },
        res: x.res,
      })) },
    { id: 'c_gift12', age: 12, t: '天生的本事', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT12[g.recall('gift')],
      text: (g) => GIFT12[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
    { id: 'm_gift38', age: 38, t: '天生的本事', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT38[g.recall('gift')],
      text: (g) => GIFT38[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
  ]);

  // 每年的小好处
  const WINDFALL = ['发票刮中了奖', '一笔忘了的押金退回来了', '单位发了一笔没想到的奖金', '老同学还了一笔多年前借的钱', '买的彩票中了个小奖'];
  function giftYear(g, age) {
    const k = g.recall('gift');
    if (!k) return;
    if (k === 'book' && age >= 6 && age <= 22) g.stat('学识', 1);
    if (k === 'ball' && age >= 40 && g.rnd() < 0.3) g.stat('健康', 1);
    if (k === 'sleep' && g.s('心情') < 35) g.stat('心情', 3);
    if (!g.recall('money0')) return;
    if (k === 'abacus' && CN.cash(g) > 0) CN.earn(g, Math.min(40000, CN.cash(g) * 0.012));
    if (k === 'coin') {
      if (!g.recall('coinPaid')) { g.remember('coinPaid', true); const more = Math.max(0, CN.cash(g)); if (more > 0) { CN.earn(g, more); g.log('长辈说你从小有财运，又添了一份，手里的钱多了 ' + CN.fmt(more) + '。', 'auto'); } }
      else if (g.rnd() < 0.05) { const amt = r1000(Math.max(5000, CN.income(g) * 0.2)); CN.earn(g, amt); g.log('这一年你运气不错，' + CN.pick(WINDFALL) + '，多了 ' + CN.fmt(amt) + '。', 'auto'); }
    }
  }

  /* ---------- 心愿 ---------- */
  const liquid = (g) => CN.cash(g) + (Number(g.recall('invest')) || 0);
  const WISHES = {
    rich: [
      { k: 'w100', t: '存款过一百万', ok: (g) => liquid(g) >= 1e6 },
      { k: 'whouse', t: '有一套写着自己名字的房子', ok: (g) => ['own', 'mortgage'].includes(g.recall('house')) },
      { k: 'wboss', t: '自己当一回老板', ok: (g) => ['boss', 'shop'].includes(g.recall('job')) },
      { k: 'w500', t: '家底过五百万', ok: (g) => CN.net(g) >= 5e6 },
      { k: 'wfree', t: '四十岁以后不欠任何人的钱', ok: (g) => g.age >= 40 && !(Number(g.recall('debt')) > 0) && !!g.recall('money0') },
    ],
    proud: [
      { k: 'wuni', t: '考上本科', ok: (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu')) && g.age >= 18 && g.recall('lifePath') !== 'repeat' },
      { k: 'wcareer', t: '在自己那一行里说得上话', ok: (g) => g.s('事业') >= 70 },
      { k: 'wfamily', t: '成一个家', ok: (g) => g.recall('love') === 'married' },
      { k: 'wparents', t: '把爸妈接到身边住', ok: (g) => g.age >= 18 && !!g.recall('parentsIn') },
      { k: 'wkid', t: '让爸妈抱上孙辈', ok: (g) => (Number(g.recall('kids')) || 0) >= 1 },
    ],
    free: [
      { k: 'wcity', t: '去另一座城市生活', ok: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap') },
      { k: 'wpet', t: '养一只自己的猫或狗', ok: (g) => g.age >= 18 && !!g.recall('petNow') },
      { k: 'wown', t: '不给别人打工', ok: (g) => ['boss', 'shop', 'creator', 'freelance'].includes(g.recall('job')) && g.age >= 22 },
      { k: 'whappy', t: '六十岁的时候还挺开心', ok: (g) => g.age >= 60 && g.s('心情') >= 70 },
      { k: 'wodd', t: '少走几步别人都走的路', ok: (g) => g.age >= 40 && JY.engine.devOf(L_()) >= 30 },
    ],
    none: [
      { k: 'w80', t: '活到八十岁', ok: (g) => g.age >= 80 },
      { k: 'wmate', t: '六十岁的时候身边有个能说话的人', ok: (g) => g.age >= 60 && g.recall('love') === 'married' },
      { k: 'w50', t: '手里有五十万，心里不慌', ok: (g) => liquid(g) >= 5e5 },
      { k: 'wfriends', t: '到哪儿都有朋友', ok: (g) => g.s('人缘') >= 75 },
      { k: 'wgk', t: '见到孙辈', ok: (g) => !!JY.byId.gk1 },
    ],
  };
  const wishList = (g) => {
    const pool = WISHES[g.recall('aim')] || [];
    return (g.recall('wishes') || []).map((k) => pool.find((w) => w.k === k)).filter(Boolean);
  };
  function wishYear(g, age) {
    const aim = g.recall('aim');
    if (!aim || !WISHES[aim]) return;
    if (!g.recall('wishes')) {
      const pool = WISHES[aim].slice();
      const picked = [];
      while (picked.length < 3 && pool.length) picked.push(pool.splice(Math.floor(g.rnd() * pool.length), 1)[0]);
      g.remember('wishes', picked.map((w) => w.k));
      g.remember('wishDone', []);
      g.log('你在本子的最后一页写了三件这辈子想做到的事：' + picked.map((w) => w.t).join('；') + '。', 'auto');
      return;
    }
    const done = (g.recall('wishDone') || []).slice();
    wishList(g).forEach((w) => {
      if (done.includes(w.k)) return;
      let ok = false;
      try { ok = !!w.ok(g); } catch (e) { ok = false; }
      if (!ok) return;
      done.push(w.k);
      g.stat('心情', 4);
      g.log('十六岁写下的心愿，你做到了一件：' + w.t + '。' + (done.length === 3 ? '三件都做到了。' : ''), 'auto');
    });
    g.remember('wishDone', done);
  }

  // 接到每年的结算后面（game.js 的 engine.yearEnd 调 JY.ECON.yearEnd）
  const yearEnd = JY.ECON.yearEnd;
  JY.ECON.yearEnd = (g, age) => {
    yearEnd(g, age);
    if (L_().death) return;
    giftYear(g, age);
    wishYear(g, age);
  };

  /* ---------- 结局 ---------- */
  const POOR = ['farmer', 'worker', 'migrant'];
  const OWN = ['own', 'mortgage'];
  // 从上往下，第一条对上的就是这一生的结局
  const ENDS = [
    { k: 'century', t: '人瑞', d: '活过了一百岁。', ok: (s) => s.age >= 100 },
    { k: 'early', t: '流星', d: '走得太早，五十岁都没到。', ok: (s) => s.age < 50 },
    { k: 'debt', t: '负重前行', d: '到最后，账上还是欠着的。', ok: (s) => s.net < 0 },
    { k: 'tycoon', t: '白手起家', d: '普通人家出身，挣下了八百万以上的家底。', ok: (s) => POOR.includes(s.family) && s.net >= 8e6 },
    { k: 'heir', t: '守业', d: '富裕人家出身，把家底守住了，还添了一些。', ok: (s) => s.family === 'rich' && s.net >= 8e6 },
    { k: 'fall', t: '家道中落', d: '富裕人家出身，到最后家底不到一百万。', ok: (s) => s.family === 'rich' && s.net < 1e6 },
    { k: 'scholar', t: '小镇做题家', d: '从县城或农村考进了顶尖大学。', ok: (s) => s.hukou !== 'city' && (s.gk === 'top' || s.uni === 'top') },
    { k: 'phd', t: '读到头了', d: '一路读到了博士。', ok: (s) => s.edu === 'phd' },
    { k: 'founder', t: '创业者', d: '合伙创业，公司活了下来。', ok: (s) => s.startup === 'ok' },
    { k: 'remarry', t: '黄昏恋', d: '老伴走后，又找到了一个人。', ok: (s) => s.remarried },
    { k: 'solo', t: '一个人的一辈子', d: '没结婚，没孩子，自己把一辈子过完了。', ok: (s) => (!s.love || s.love === 'single' || s.love === 'dating') && !s.kids && s.age >= 50 },
    { k: 'dink', t: '两个人的一辈子', d: '结了婚，没要孩子。', ok: (s) => s.kidPlan === 'dink' && !s.kids && ['married', 'widowed'].includes(s.love) },
    { k: 'bigfam', t: '儿孙满堂', d: '养大了两个以上的孩子，活过了八十。', ok: (s) => s.kids >= 2 && s.age >= 80 },
    { k: 'lie', t: '躺平大师', d: '事业上没怎么使劲，也活到了六十多。', ok: (s) => s.st['事业'] <= 15 && s.age >= 60 },
    { k: 'firsttier', t: '在大城市扎了根', d: '外地出生，在北上广深有了自己的房子。', ok: (s) => s.tier === 1 && OWN.includes(s.house) && s.cityTier !== 1 },
    { k: 'drifter', t: '漂着', d: '在大城市过了一辈子，一直租房住。', ok: (s) => s.tier <= 2 && !OWN.includes(s.house) && s.house !== 'hometown' && s.age >= 60 && s.liveWith !== 'kids' },
    { k: 'homeward', t: '归园田居', d: '在外面闯过，最后回了老家。', ok: (s) => ['early', 'late', 'house', 'parents'].includes(s.backHome) || s.liveWith === 'hometown' },
    { k: 'boss', t: '小老板', d: '自己做生意，做了大半辈子。', ok: (s) => ['boss', 'shop'].includes(s.lastJob) },
    { k: 'creator', t: '靠流量吃饭', d: '做自媒体，做成了一份职业。', ok: (s) => s.lastJob === 'creator' },
    { k: 'civil', t: '上岸', d: '考上了编制，安安稳稳到退休。', ok: (s) => s.lastJob === 'civil' },
    { k: 'teacher', t: '教书匠', d: '站了一辈子讲台。', ok: (s) => s.lastJob === 'teacher' },
    { k: 'medic', t: '白大褂', d: '在医院里忙了一辈子。', ok: (s) => ['doctor', 'nurse'].includes(s.lastJob) },
    { k: 'coder', t: '和机器打交道', d: '在技术岗上干到了最后。', ok: (s) => s.lastJob === 'tech' },
    { k: 'farmer', t: '守着土地', d: '种了一辈子地。', ok: (s) => s.lastJob === 'farmer' },
    { k: 'worker', t: '手艺人', d: '靠一双手，干了一辈子活。', ok: (s) => ['worker', 'driver', 'rider'].includes(s.lastJob) && ['junior', 'vocational', 'primary', 'senior'].includes(s.edu) && s.st['事业'] >= 60 },
    { k: 'investor', t: '股神', d: '一辈子理财赚了八百万以上。', ok: (s) => s.finGain >= 8e6 },
    { k: 'chive', t: '交了学费', d: '理财亏了一百万以上，或者在暴雷里亏了三十万以上。', ok: (s) => s.finGain <= -1e6 || s.hyBlown >= 3e5 },
    { k: 'divorced', t: '重新来过', d: '离过婚，后半辈子自己过。', ok: (s) => s.love === 'divorced' },
    { k: 'rooted', t: '故土难离', d: '一辈子没离开出生的地方。', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { k: 'workaholic', t: '劳模', d: '事业走得很高，身体也搭进去不少。', ok: (s) => s.st['事业'] >= 88 },
    { k: 'happy', t: '知足常乐', d: '到老都挺开心。', ok: (s) => s.st['心情'] >= 85 },
    { k: 'longlife', t: '长寿', d: '活过了九十岁。', ok: (s) => s.age >= 90 },
    { k: 'plain', t: '平凡的一生', d: '上学、上班、成家、变老。大多数人都是这样过来的。', ok: () => true },
  ];
  const endOf = (s) => ENDS.find((e) => { try { return e.ok(s); } catch (err) { return false; } }) || ENDS[ENDS.length - 1];
  // 家底超过了百分之几同样出身的人（rarity.js 的 nq：每种出身的净资产 5%–95% 分位点，19 个）
  const beat = (s) => {
    const q = JY.RARITY && JY.RARITY.nq && JY.RARITY.nq[s.family];
    if (!q || !q.length) return null;
    return Math.round(100 * q.filter((x) => x < s.net).length / (q.length + 1));
  };

  JY.FATE = {
    GIFTS, ENDS, endOf,
    // 命终：legacy.js 的 onFinish 调用。s 是这一世的结果，al 是人生图鉴
    finish(g, life, s, al) {
      const L = L_();
      s.st = Object.assign({}, L.st);
      s.gift = g.recall('gift') || '';
      s.liveWith = g.recall('liveWith') || '';
      s.cityTier = g.recall('cityTier') || 0;
      const e = endOf(s);
      life.end = { k: e.k, t: e.t, d: e.d, beat: beat(s) };
      const ws = wishList(g), done = g.recall('wishDone') || [];
      if (ws.length) {
        life.wish = ws.map((w) => ({ t: w.t, ok: done.includes(w.k) }));
        const n = life.wish.filter((w) => w.ok).length;
        if (life.aim) life.aim.v = Math.round(100 * n / ws.length);
      }
      al.ends = al.ends || {};
      al.gifts = al.gifts || {};
      life.newEnd = !al.ends[e.k];
      al.ends[e.k] = (al.ends[e.k] || 0) + 1;
      if (s.gift) al.gifts[s.gift] = (al.gifts[s.gift] || 0) + 1;
      // 这一世新解锁的天赋
      life.newGifts = GIFTS.filter((x) => x.need && (life.newAch || []).includes(x.need)).map((x) => x.t);
    },
    // 墓志页最上面的两张卡：结局、心愿
    endCards(l, u) {
      const { esc, card } = u;
      let h = '';
      if (l.end) {
        const p = JY.RARITY && JY.RARITY.end ? JY.RARITY.end[l.end.k] : null;
        const g = GIFTS.find((x) => x.k === (l.snap || {}).gift);
        h += card('这一生的结局', l.newEnd ? '新结局' : '', '<div class="big-num"><div><b>' + esc(l.end.t) + '</b></div></div><p class="note">' + esc(l.end.d)
          + (p != null ? ' 大约 ' + (p < 1 ? '不到 1' : Math.round(p)) + '% 的人生是这个结局。' : '')
          + (l.end.beat != null ? ' 临终时的家底，超过了 <b>' + l.end.beat + '%</b> 同样出身的人。' : '')
          + (g ? ' 天赋：' + esc(g.t) + '。' : '') + '</p>'
          + (l.newGifts && l.newGifts.length ? '<p class="note">解锁了新的天赋：<b>' + esc(l.newGifts.join('、')) + '</b>。下一世抓周的时候可能摆在你面前。</p>' : ''), 'rare-card');
      }
      if (l.wish && l.wish.length) {
        const n = l.wish.filter((w) => w.ok).length;
        h += card('十六岁写下的心愿', '做到了 ' + n + ' / ' + l.wish.length, '<ul class="ach-list">' + l.wish.map((w) => '<li class="' + (w.ok ? 'new' : '') + '"><b>' + esc(w.t) + '</b><span>' + (w.ok ? '做到了' : '没做到') + '</span></li>').join('') + '</ul>');
      }
      return h;
    },
    // 首页人生图鉴里的两行
    homeRows(al, row) {
      const ends = Object.keys(al.ends || {}).length, open = unlocked().length;
      const locked = GIFTS.filter((x) => x.need && !(al.ach || {})[x.need]);
      return row('结局', ends, ENDS.length) + row('天赋', open, GIFTS.length)
        + (locked.length ? '<p class="note">还有 ' + locked.length + ' 样天赋没解锁：拿到成就“' + locked.map((x) => x.needT).join('”“') + '”，各解锁一样。</p>' : '');
    },
    badges(l) {
      const out = [];
      if (l.end) out.push('这一生的结局：' + l.end.t + (l.end.beat != null ? '（家底超过了 ' + l.end.beat + '% 同样出身的人）' : ''));
      if (l.wish && l.wish.length) out.push('十六岁写下的三个心愿，做到了 ' + l.wish.filter((w) => w.ok).length + ' 个');
      return out;
    },
  };
})();

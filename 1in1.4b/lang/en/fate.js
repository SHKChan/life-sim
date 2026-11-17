/* 由 share/tools/tr.js 从 data/fate.js 和 lang/en/tr/fate.json 生成，不要手改。 */
/* 十四亿分之一 · 天赋、心愿、结局（v2.1）
 * 三样让每一世不一样、也让人想再来一世的东西，都只要点一下：
 *   1. 天赋（记忆键 gift）：周岁抓周，三样里抓一样。每样天赋让一类判定容易 12%，另有一点长期的好处。
 *      五样一开始就有，另外三样靠成就解锁（人生图鉴里记着）。
 *   2. 心愿（wishes、wishDone）：十六岁选了志向以后，写下三件想做的事。做到一件，生平里记一行，心情 +4。
 *      墓志页显示做到了几件（取代原来按公式算的“志向达成度”）。
 *   3. 结局（life.end）：命终时按这一生的样子给一个名字，一共 33 种，收进人生图鉴。
 *      另外按 data/rarity.js 的统计，写一句“家底超过了百分之几同样出身的人”。
 *   4. 天赋专属的路：八个大事里各有一个选项，只有带着对应天赋的人看得到。
 *   5. 同命挑战：每一世的出身由一个种子定下（记忆键 seed）。分享出去的链接、二维码带着 ?s=种子，
 *      朋友点开后第一次投胎会生在同一个地方、同一个家里。
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
    { k: 'book', t: 'Born reader', stat: '学识', pick: 'Grab the book', hint: 'Knowledge checks are about 12% easier; you learn faster through your school years',
      res: 'You grab a corner of the book and will not let go. The whole room laughs and says this child is made for study.', fx: (g) => g.stat('学识', 6) },
    { k: 'abacus', t: 'Good with numbers', stat: '财富', pick: 'Grab the abacus', hint: 'Wealth checks are about 12% easier; your savings earn a little extra each year',
      res: 'The abacus beads clatter and you startle yourself. The grown-ups say you will be good with money.' },
    { k: 'seal', t: 'Steady', stat: '事业', pick: 'Grab the seal', hint: 'Career checks are about 12% easier; your career can climb higher',
      res: 'You clutch the seal and will not give it to anyone. An elder says this child can sit still and will get things done.' },
    { k: 'ball', t: 'Sturdy', stat: '健康', pick: 'Hug the ball', hint: 'Health checks are about 12% easier; your body declines more slowly after midlife',
      res: 'You roll half over with the ball in your arms and do not cry. The grown-ups say this child is sturdy.', fx: (g) => g.stat('健康', 8) },
    { k: 'mic', t: 'Easy with people', stat: '人缘', pick: 'Grab the microphone', hint: 'Social checks are about 12% easier; people like you from the start',
      res: 'You say "ah" into the microphone and make yourself laugh. The grown-ups say you will never be shy anywhere.', fx: (g) => g.stat('人缘', 8) },
    { k: 'coin', t: 'Lucky with money', stat: '财富', need: 'tenmil', needT: 'Multi-millionaire', pick: 'Grab the string of coins', hint: 'You start adult life with twice the money; now and then a windfall comes your way',
      res: 'The coins jingle in your hand. The grown-ups say this child will never be short of money.' },
    { k: 'brush', t: 'Gifted hands', stat: '心情', need: 'odd', needT: 'Own road', pick: 'Grab the paintbrush', hint: 'Working for yourself (a shop, freelancing, content) earns 25% more',
      res: 'You draw one line across the red cloth. The grown-ups say this child has gifted hands.', fx: (g) => g.stat('心情', 5) },
    { k: 'sleep', t: 'Easygoing', stat: '心情', need: 'plain', needT: 'Like most people', pick: 'Grab nothing and fall asleep', hint: 'A good mood; you recover even from the hardest times',
      res: 'You crawl two steps and fall asleep on the red cloth. The grown-ups laugh for a long while and say this child takes things easy.', fx: (g) => g.stat('心情', 10) },
  ];
  const giftOf = (g) => GIFTS.find((x) => x.k === g.recall('gift')) || null;
  const unlocked = () => { const ach = album().ach || {}; return GIFTS.filter((x) => !x.need || ach[x.need]); };
  // 这一世摆在面前的三样：按投胎时定的种子从已解锁的里面取，一世之内不变
  const prng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const seedOf = (g) => { let s = g.recall('zzSeed'); if (s == null) { s = Math.floor(Math.random() * 1e9); g.remember('zzSeed', s); } return s; };
  const laidOut = (g) => {
    const saved = g.recall('zzOpts');
    if (saved) return saved;
    // 朋友分享来的出身：只摆一开始就有的五样，免得各人解锁的不一样
    const r = prng(seedOf(g)), pool = (g.recall('seedFrom') ? GIFTS.filter((x) => !x.need) : unlocked()).map((x) => x.k);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const opts = pool.slice(0, 3);
    g.remember('zzOpts', opts);
    return opts;
  };
  /* 投胎：整个生成过程用一个种子（同一个种子生出同一个人、同一家人、同一条行情链） */
  const readSeed = () => {
    try {
      const m = /[?&]s=([0-9a-z]{1,8})(?:&|$)/.exec(location.search || '');
      const v = m ? parseInt(m[1], 36) : NaN;
      return Number.isFinite(v) && v >= 0 ? v : null;
    } catch (e) { return null; }
  };
  let pending = readSeed();
  const gen = JY.GENERATE;
  JY.GENERATE = () => {
    const friend = pending != null;
    const seed = friend ? pending : Math.floor(Math.random() * 2e9);
    const real = Math.random;
    let r;
    Math.random = prng(seed);
    try { r = gen(); r.me.mem.zzSeed = Math.floor(Math.random() * 1e9); } finally { Math.random = real; }
    r.me.mem.seed = seed;
    if (friend) {
      r.me.mem.seedFrom = true;
      pending = null;
      // 用过就把网址里的种子去掉，刷新页面不会再投到同一个出身
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* 忽略 */ }
    }
    return r;
  };
  JY.GAME.share.url = (l) => { const u = JY.siteUrl ? JY.siteUrl() : ''; return u && l && l.seed != null ? u + (u.includes('?') ? '&' : '?') + 's=' + Number(l.seed).toString(36) : ''; };

  // 判定：天赋对口的那一类容易 12%
  CN.giftOdds = (g, chk) => { const x = giftOf(g); return x && chk && chk[0] === x.stat ? 12 : 0; };
  // 事业的线：坐得住的人高 8
  CN.giftCareer = (g) => (g.recall('gift') === 'seal' ? 8 : 0);
  // 收入：有灵气的人自己干，多挣两成半
  const income = CN.income;
  CN.income = (g) => { const v = income(g); return g.recall('gift') === 'brush' && ['creator', 'freelance', 'shop'].includes(g.recall('job')) ? Math.round(v * 1.25) : v; };

  const GIFT12 = {
    book: 'A text others recite three times, you remember after two readings. The Chinese teacher has you lead the class reading.',
    abacus: 'The shopkeeper gives the wrong change and you spot it at once. He hands you an extra sweet.',
    seal: 'Your class teacher makes you the discipline monitor. In study hall you sit by the lectern and do not move for the whole period.',
    ball: 'You run the 800 meters at sports day and are hardly out of breath at the line.',
    mic: 'The New Year show needs an announcer and you raise your hand. Hundreds are watching and you do not miss a word.',
    coin: 'You find some money on the roadside and hand it to your teacher. The next day the cap of your drink wins you a free bottle.',
    brush: 'You drew the class blackboard display. A teacher from the next class stops and looks at it for a good while.',
    sleep: 'You flunk the final exam and still eat two bowls of rice at home. Your family says nothing gets to this child.',
  };
  const GIFT38 = {
    book: 'The new machine at home comes with a thick manual. You read it in one evening, and the next day everyone who is stuck comes to you.',
    abacus: 'At year\'s end you go through the household accounts. You know exactly what to cut and what not to.',
    seal: 'When relatives have something to arrange, they ask you to decide things big and small. You sit there and lay it out point by point.',
    ball: 'People your age start complaining about their backs and knees. You climb six floors and your breathing stays even.',
    mic: 'A friend\'s wedding is suddenly short of a host, and you get up and talk for twenty minutes. Afterwards several guests ask for your contact.',
    coin: 'At a mall prize draw you pull a ticket without thinking and win a rice cooker.',
    brush: 'You repaint a wall at home and build a shelf yourself. Every visitor asks where you bought it.',
    sleep: 'A lot happens this year. You still fall asleep the moment your head touches the pillow.',
  };
  JY.addLifeNodes([
    { id: 'c_zhuazhou', age: 1, t: 'First-birthday pick', major: true,
      stake: 'Whatever you grab becomes a talent you are born with in this life.',
      text: 'On your first birthday the family spreads a red cloth on the bed, lays objects in a circle and sets you in the middle. The grown-ups go quiet and watch which way you crawl.',
      choices: GIFTS.map((x) => ({
        t: x.pick, canon: true, hint: x.hint, cond: (g) => laidOut(g).includes(x.k),
        fx: (g) => { g.remember('gift', x.k); g.info('天赋', x.t); if (x.fx) x.fx(g); },
        res: x.res,
      })) },
    { id: 'c_gift12', age: 12, t: 'A born talent', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT12[g.recall('gift')],
      text: (g) => GIFT12[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
    { id: 'm_gift38', age: 38, t: 'A born talent', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT38[g.recall('gift')],
      text: (g) => GIFT38[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
  ]);

  /* 天赋专属的路：加到已有的大事里，只有带着这样天赋的人看得到（每个节点原来最多三个选项，加上以后最多四个） */
  const only = (id, k, ch) => {
    const n = JY.LIFE_NODES.find((x) => x.id === id);
    if (!n || !n.choices) return;
    const x = GIFTS.find((y) => y.k === k);
    ch.cond = (g) => g.recall('gift') === k;
    ch.hint = 'Only open to the gift "' + x.t + '". ' + ch.hint;
    n.choices.push(ch);
  };
  only('c_hs_track', 'book', { t: 'You can handle both, so you join the school\'s competition class', dev: 15, hint: 'Knowledge rises a lot and the gaokao looks less daunting; less time to play',
    fx: (g) => { g.remember('track', 'sci'); g.stat('学识', 6); g.stat('心情', -2); }, res: 'The competition class has an extra period at night. You work problems until the building lights go out, and you feel steady.' });
  only('c_xiaoshengchu', 'ball', { t: 'A sports-school coach notices you; get into the good school as an athlete', dev: 15, hint: 'A good middle school without the exam; early training every morning',
    fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'exam'); g.remember('talent', 'sport'); g.stat('健康', 3); }, res: 'You arrive an hour before everyone else and run laps around the field. You get to wear that good school\'s uniform too.' });
  only('f_pension', 'abacus', { t: 'Open the account, max it out, and put another $2,900 into funds', dev: 20, hint: 'The pension is funded and you have one more investment; money is tight for a while',
    fx: (g) => { g.remember('paYear', true); CN.invest(g, 20000, 'fund'); g.stat('事业', 1); }, res: 'You run the numbers all evening, open the account and put $2,900 into funds. You note on your phone which money can be touched and when.' });
  only('y_last34', 'seal', { t: 'Go nowhere; make yourself impossible to replace', dev: 10, hint: 'A big step up in career; no risk, and no chance of doubling your money either',
    fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 8); }, res: 'You take on the work nobody else wants. A year later it cannot run without you.' });
  only('y_love23', 'mic', { t: 'Set the matchmaking aside; you meet someone at a dinner on your own', dev: 15, hint: 'No luck needed; you start dating right away',
    fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', 'Dating'); g.stat('心情', 5); }, res: 'At a dinner a friend put together, you talk with the person beside you all evening. As everyone leaves, they ask for your contact.' });
  only('f_hy', 'coin', { t: 'Try it with just $1,400 for three months, then take the interest and get out', dev: 15, hint: 'Make a little and leave; you will not be caught in a blow-up',
    fx: (g) => { g.remember('hy', 'no'); CN.earn(g, 200); g.stat('心情', 2); }, res: 'You try it with $1,400 for three months, collect $30 in interest and withdraw every cent of the principal. Half a year later your old classmate stops mentioning the product.' });
  only('y_back27', 'brush', { t: 'Go home, clear out a room in the old house and take on your own commissions', dev: 25, hint: 'Back with family, living off your craft; income is shaky for the first few years',
    fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); CN.setJob(g, 'freelance', 'Self-employed craftsperson'); g.stat('心情', 6); g.stat('人缘', 3); },
    res: (g) => 'You move back to ' + g.recall('city') + ' and turn a room of the old house into a workshop. Work is thin for the first few months, and you eat dinner at home.' });
  only('y_crisis31', 'sleep', { t: 'Sleep on it', dev: 10, hint: 'The anger fades fast and nobody has to back down',
    fx: (g) => { g.remember('fight', 'talk'); g.stat('心情', 5); g.stat('人缘', 2); }, res: 'You sleep until morning. By the time you wake the anger is gone; the two of you share a small smile and neither brings it up again.' });

  // 每年的小好处
  const WINDFALL = ['a receipt lottery pays out', 'a forgotten deposit is refunded', 'work pays an unexpected bonus', 'an old classmate repays a loan from years ago', 'a lottery ticket wins a small prize'];
  function giftYear(g, age) {
    const k = g.recall('gift');
    if (!k) return;
    if (k === 'book' && age >= 6 && age <= 22) g.stat('学识', 1);
    if (k === 'ball' && age >= 40 && g.rnd() < 0.3) g.stat('健康', 1);
    if (k === 'sleep' && g.s('心情') < 35) g.stat('心情', 3);
    if (!g.recall('money0')) return;
    if (k === 'abacus' && CN.cash(g) > 0) CN.earn(g, Math.min(40000, CN.cash(g) * 0.012));
    if (k === 'coin') {
      if (!g.recall('coinPaid')) { g.remember('coinPaid', true); const more = Math.max(0, CN.cash(g)); if (more > 0) { CN.earn(g, more); g.log('The elders say you were always lucky with money and add a share of their own. You have an extra ' + CN.fmt(more) + '. ', 'auto'); } }
      else if (g.rnd() < 0.05) { const amt = r1000(Math.max(5000, CN.income(g) * 0.2)); CN.earn(g, amt); g.log('You are lucky this year: ' + CN.pick(WINDFALL) + ', worth ' + CN.fmt(amt) + '. ', 'auto'); }
    }
  }

  /* ---------- 心愿 ---------- */
  const liquid = (g) => CN.cash(g) + (Number(g.recall('invest')) || 0);
  const WISHES = {
    rich: [
      { k: 'w100', t: 'Save over $140K', ok: (g) => liquid(g) >= 1e6 },
      { k: 'whouse', t: 'Own a home in your own name', ok: (g) => ['own', 'mortgage'].includes(g.recall('house')) },
      { k: 'wboss', t: 'Be your own boss once', ok: (g) => ['boss', 'shop'].includes(g.recall('job')) },
      { k: 'w500', t: 'Be worth over $700K', ok: (g) => CN.net(g) >= 5e6 },
      { k: 'wfree', t: 'Owe nobody anything after forty', ok: (g) => g.age >= 40 && !(Number(g.recall('debt')) > 0) && !!g.recall('money0') },
    ],
    proud: [
      { k: 'wuni', t: 'Get into a bachelor\'s program', ok: (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu')) && g.age >= 18 && g.recall('lifePath') !== 'repeat' },
      { k: 'wcareer', t: 'Have a say in your own line of work', ok: (g) => g.s('事业') >= 70 },
      { k: 'wfamily', t: 'Start a family', ok: (g) => g.recall('love') === 'married' },
      { k: 'wparents', t: 'Bring your parents to live with you', ok: (g) => g.age >= 18 && !!g.recall('parentsIn') },
      { k: 'wkid', t: 'Give your parents a grandchild', ok: (g) => (Number(g.recall('kids')) || 0) >= 1 },
    ],
    free: [
      { k: 'wcity', t: 'Live in another city', ok: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap') },
      { k: 'wpet', t: 'Have a cat or dog of your own', ok: (g) => g.age >= 18 && !!g.recall('petNow') },
      { k: 'wown', t: 'Work for no one but yourself', ok: (g) => ['boss', 'shop', 'creator', 'freelance'].includes(g.recall('job')) && g.age >= 22 },
      { k: 'whappy', t: 'Still be happy at sixty', ok: (g) => g.age >= 60 && g.s('心情') >= 70 },
      { k: 'wodd', t: 'Take fewer of the roads everyone takes', ok: (g) => g.age >= 40 && JY.engine.devOf(L_()) >= 30 },
    ],
    none: [
      { k: 'w80', t: 'Live to eighty', ok: (g) => g.age >= 80 },
      { k: 'wmate', t: 'Have someone to talk to at sixty', ok: (g) => g.age >= 60 && g.recall('love') === 'married' },
      { k: 'w50', t: 'Have $70K in hand and no worry', ok: (g) => liquid(g) >= 5e5 },
      { k: 'wfriends', t: 'Have friends wherever you go', ok: (g) => g.s('人缘') >= 75 },
      { k: 'wgk', t: 'Meet a grandchild', ok: (g) => !!JY.byId.gk1 },
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
      g.log('On the last page of your notebook you write three things you want to do in this life: ' + picked.map((w) => w.t).join('; ') + '. ', 'auto');
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
      g.log('One of the wishes you wrote at sixteen has come true: ' + w.t + '. ' + (done.length === 3 ? 'That makes all three. ' : ''), 'auto');
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
    { k: 'century', t: 'Centenarian', d: 'Lived past a hundred. ', ok: (s) => s.age >= 100 },
    { k: 'early', t: 'Shooting star', d: 'Gone too soon, before fifty. ', ok: (s) => s.age < 50 },
    { k: 'debt', t: 'Carrying the load', d: 'In the end, the books were still in the red. ', ok: (s) => s.net < 0 },
    { k: 'tycoon', t: 'Self-made', d: 'From an ordinary family, built a fortune of over $1.1M. ', ok: (s) => POOR.includes(s.family) && s.net >= 8e6 },
    { k: 'heir', t: 'Keeper of the estate', d: 'Born wealthy, kept the fortune and added to it. ', ok: (s) => s.family === 'rich' && s.net >= 8e6 },
    { k: 'fall', t: 'Faded fortune', d: 'Born wealthy, ended with less than $140K. ', ok: (s) => s.family === 'rich' && s.net < 1e6 },
    { k: 'scholar', t: 'Small-town exam ace', d: 'Tested into a top university from a county town or village. ', ok: (s) => s.hukou !== 'city' && (s.gk === 'top' || s.uni === 'top') },
    { k: 'phd', t: 'Studied to the top', d: 'Studied all the way to a doctorate. ', ok: (s) => s.edu === 'phd' },
    { k: 'founder', t: 'Founder', d: 'Co-founded a company that survived. ', ok: (s) => s.startup === 'ok' },
    { k: 'remarry', t: 'Late love', d: 'Found someone again after losing a spouse. ', ok: (s) => s.remarried },
    { k: 'solo', t: 'A life of one', d: 'No marriage, no children; lived the whole life on your own terms. ', ok: (s) => (!s.love || s.love === 'single' || s.love === 'dating') && !s.kids && s.age >= 50 },
    { k: 'dink', t: 'A life of two', d: 'Married, and chose not to have children. ', ok: (s) => s.kidPlan === 'dink' && !s.kids && ['married', 'widowed'].includes(s.love) },
    { k: 'bigfam', t: 'A full house', d: 'Raised two or more children and lived past eighty. ', ok: (s) => s.kids >= 2 && s.age >= 80 },
    { k: 'lie', t: 'Master of lying flat', d: 'Never pushed hard at a career, and still made it past sixty. ', ok: (s) => s.st['事业'] <= 15 && s.age >= 60 },
    { k: 'firsttier', t: 'Rooted in the big city', d: 'Born elsewhere, owned a home in a first-tier city. ', ok: (s) => s.tier === 1 && OWN.includes(s.house) && s.cityTier !== 1 },
    { k: 'drifter', t: 'Drifting', d: 'Spent a lifetime in a big city, always renting. ', ok: (s) => s.tier <= 2 && !OWN.includes(s.house) && s.house !== 'hometown' && s.age >= 60 && s.liveWith !== 'kids' },
    { k: 'homeward', t: 'Back to the fields', d: 'Went out into the world and came home in the end. ', ok: (s) => ['early', 'late', 'house', 'parents'].includes(s.backHome) || s.liveWith === 'hometown' },
    { k: 'boss', t: 'Small-business owner', d: 'Ran your own business for most of your life. ', ok: (s) => ['boss', 'shop'].includes(s.lastJob) },
    { k: 'creator', t: 'Living on views', d: 'Turned content creation into a career. ', ok: (s) => s.lastJob === 'creator' },
    { k: 'civil', t: 'Made it ashore', d: 'Won a government post and stayed secure until retirement. ', ok: (s) => s.lastJob === 'civil' },
    { k: 'teacher', t: 'Teacher', d: 'Stood at the lectern for a lifetime. ', ok: (s) => s.lastJob === 'teacher' },
    { k: 'medic', t: 'White coat', d: 'Spent a busy lifetime in hospitals. ', ok: (s) => ['doctor', 'nurse'].includes(s.lastJob) },
    { k: 'coder', t: 'Working with machines', d: 'Stayed in a technical job to the end. ', ok: (s) => s.lastJob === 'tech' },
    { k: 'farmer', t: 'Keeping the land', d: 'Farmed for a lifetime. ', ok: (s) => s.lastJob === 'farmer' },
    { k: 'worker', t: 'Tradesperson', d: 'Worked a lifetime with your own two hands. ', ok: (s) => ['worker', 'driver', 'rider'].includes(s.lastJob) && ['junior', 'vocational', 'primary', 'senior'].includes(s.edu) && s.st['事业'] >= 60 },
    { k: 'investor', t: 'Market wizard', d: 'Made over $1.1M from investing. ', ok: (s) => s.finGain >= 8e6 },
    { k: 'chive', t: 'Paid your tuition', d: 'Lost over $140K investing, or over $43K in a blow-up. ', ok: (s) => s.finGain <= -1e6 || s.hyBlown >= 3e5 },
    { k: 'divorced', t: 'Starting over', d: 'Divorced, and lived the second half on your own. ', ok: (s) => s.love === 'divorced' },
    { k: 'rooted', t: 'Never left home', d: 'Never left the place you were born. ', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { k: 'workaholic', t: 'Model worker', d: 'Rose high at work, and paid for it with your health. ', ok: (s) => s.st['事业'] >= 88 },
    { k: 'happy', t: 'Content', d: 'Happy right into old age. ', ok: (s) => s.st['心情'] >= 85 },
    { k: 'longlife', t: 'Long life', d: 'Lived past ninety. ', ok: (s) => s.age >= 90 },
    { k: 'plain', t: 'An ordinary life', d: 'School, work, family, old age. Most people live this way. ', ok: () => true },
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
      if (g.recall('seed') != null) life.seed = g.recall('seed');
      life.seedFrom = !!g.recall('seedFrom');
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
        h += card('How this life turned out', l.newEnd ? 'New ending' : '', '<div class="big-num"><div><b>' + esc(l.end.t) + '</b></div></div><p class="note">' + esc(l.end.d)
          + (p != null ? ' About ' + (p < 1 ? 'under 1' : Math.round(p)) + '% of lives end this way. ' : '')
          + (l.end.beat != null ? ' Your net worth at the end beat <b>' + l.end.beat + '%</b> of people born into the same kind of family. ' : '')
          + (g ? ' Gift: ' + esc(g.t) + '. ' : '') + '</p>'
          + (l.seed != null ? '<p class="note">' + (l.seedFrom ? 'This life started from a birth a friend shared. ' : '') + 'Same-birth challenge: share this life, and a friend who opens the link or scans the code will be born in the same place and the same family on their first try.</p>' : '')
          + (l.newGifts && l.newGifts.length ? '<p class="note">New gift unlocked: <b>' + esc(l.newGifts.join(', ')) + '</b>. It may be laid out in front of you at your next first-birthday pick.</p>' : ''), 'rare-card');
      }
      if (l.wish && l.wish.length) {
        const n = l.wish.filter((w) => w.ok).length;
        h += card('Wishes written at sixteen', 'Done ' + n + ' / ' + l.wish.length, '<ul class="ach-list">' + l.wish.map((w) => '<li class="' + (w.ok ? 'new' : '') + '"><b>' + esc(w.t) + '</b><span>' + (w.ok ? 'Done' : 'Not done') + '</span></li>').join('') + '</ul>');
      }
      return h;
    },
    // 首页：网址里带着朋友分享的出身时，提示一句
    homeChallenge() {
      return pending == null ? '' : '<section class="album"><div class="section-h"><h2>Same-birth challenge</h2><span>A friend sent you a birth</span></div><div class="card"><p class="note">Press the button to be born, and you will start in the same place and the same family as your friend. Same starting point: see what you make of it.</p></div></section>';
    },
    // 首页人生图鉴里的两行
    homeRows(al, row) {
      const ends = Object.keys(al.ends || {}).length, open = unlocked().length;
      const locked = GIFTS.filter((x) => x.need && !(al.ach || {})[x.need]);
      return row('Endings', ends, ENDS.length) + row('天赋', open, GIFTS.length)
        + (locked.length ? '<p class="note">' + locked.length + ' gifts still locked: earn the achievements "' + locked.map((x) => x.needT).join('”“') + '" to unlock one each.</p>' : '');
    },
    badges(l) {
      const out = [];
      if (l.end) out.push('Ending: ' + l.end.t + (l.end.beat != null ? ' (net worth beat ' + l.end.beat + '% of people from the same background)' : ''));
      if (l.wish && l.wish.length) out.push('Of the three wishes written at sixteen, came true: ' + l.wish.filter((w) => w.ok).length + ' ');
      return out;
    },
  };
})();

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
  // 分享链接里朋友的结局：f=结局序号-享年-家底（万元，负数前面加 m），只在带出身种子时才读
  const readFriend = () => {
    try {
      const m = /[?&]f=([0-9a-z]{1,2}-\d{1,3}-m?\d{1,6})(?:&|$)/.exec(location.search || '');
      return m && readSeed() != null ? m[1] : null;
    } catch (e) { return null; }
  };
  const decodeFriend = (raw) => {
    const m = /^([0-9a-z]{1,2})-(\d{1,3})-(m?)(\d{1,6})$/.exec(String(raw || ''));
    const e = m && ENDS[parseInt(m[1], 36)];
    const age = m ? Number(m[2]) : -1;
    return e && age >= 0 && age <= 125 ? { k: e.k, t: e.t, age, net: (m[3] ? -1 : 1) * Number(m[4]) * 1e4 } : null;
  };
  const encodeFriend = (l) => {
    const i = l.end ? ENDS.findIndex((e) => e.k === l.end.k) : -1;
    if (i < 0) return '';
    const age = Math.max(0, Math.min(125, l.to - l.born));
    const w = Math.max(-999999, Math.min(999999, Math.round(((l.snap || {}).net || 0) / 1e4)));
    return i.toString(36) + '-' + age + '-' + (w < 0 ? 'm' : '') + Math.abs(w);
  };
  // 今日同命：用 UTC 日期做种子，全站当天投到同一个出身
  const dayKey = () => new Date().toISOString().slice(0, 10);
  const daySeed = (k) => { let h = 2166136261; const s = 'daily:' + k; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 2000000000; };
  const DAILY_KEY = '1in1.4b.daily.v1';
  const dailyRead = () => { try { return JSON.parse(localStorage.getItem(DAILY_KEY) || '{}') || {}; } catch (e) { return {}; } };
  const dailyWrite = (k, v) => { try { const d = dailyRead(); d[k] = v; Object.keys(d).sort().slice(0, -30).forEach((x) => { delete d[x]; }); localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch (e) { /* 存储不可用就算了 */ } };
  let pending = readSeed();
  let pendingF = readFriend();
  let pendingDaily = '';
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
      if (pendingF) r.me.mem.friend = pendingF;
      if (pendingDaily) r.me.mem.daily = pendingDaily;
      pending = null; pendingF = null; pendingDaily = '';
      // 用过就把网址里的种子去掉，刷新页面不会再投到同一个出身
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* 忽略 */ }
    }
    return r;
  };
  JY.GAME.share.url = (l) => {
    const u = JY.siteUrl ? JY.siteUrl() : '';
    if (!u || !l || l.seed == null) return '';
    const f = encodeFriend(l);
    return u + (u.includes('?') ? '&' : '?') + 's=' + Number(l.seed).toString(36) + (f ? '&f=' + f : '');
  };
  JY.GAME.onAction = (a, d, api) => {
    if (a !== 'daily') return;
    pending = daySeed(dayKey()); pendingF = null; pendingDaily = dayKey();
    api.start(null);
  };

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
      text: (g) => {
        const gift = g.recall('gift');
        if (gift === 'book' && ['vocational', 'junior', 'primary'].includes(g.recall('edu'))) return 'Your schooling didn\'t carry on all the way, but when you meet tool instructions you don\'t understand, you\'re still willing to turn to the last page and then ask someone.';
        if (gift === 'abacus' && Number(g.recall('debt')) > 0) return 'Being good with numbers didn\'t make the debt vanish. You note down each repayment date, which can wait and which can\'t, and slowly fit them in with the household\'s plans.';
        if (gift === 'seal' && ['none', 'retired'].includes(g.recall('job'))) return 'With no steady post at hand, you still list the things to do and cross them off one by one. That bit of patience for sitting still is still yours.';
        if (gift === 'ball' && g.s('健康') < 50) return 'The ball you hugged as a child is long gone. Your body isn\'t what it was, so you walk more slowly, sit when tired, and are still willing to move about.';
        if (gift === 'brush' && g.recall('house') === 'rent') return 'In the rented room, you paint flowers on an old cardboard box and set it by the window. A few small things that cost nothing slowly take on a character of their own.';
        if (gift === 'sleep' && (Number(g.recall('fatigue')) || 0) >= 6) return 'Even an easy-going heart has nights when exhaustion makes sleep restless. Waking at night, you take a sip of water and write down what simply must be done tomorrow.';
        return GIFT38[gift];
      }, fx: (g) => g.stat('心情', 2) },
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
      { k: 'w100', t: 'Savings above ¥1.2 million', ok: (g) => liquid(g) >= 1.2e6 },
      { k: 'whouse', t: 'Own a home in your own name', ok: (g) => ['own', 'mortgage'].includes(g.recall('house')) },
      { k: 'wboss', t: 'Be your own boss once', ok: (g) => (['boss', 'shop'].includes(g.recall('job')) || (!!g.recall('tradeOwn') && !g.recall('retired'))) },
      { k: 'w500', t: 'Net worth above ¥6 million before seventy', ok: (g) => g.age < 70 && CN.net(g) >= 6e6 },
      { k: 'wfree', t: 'Owe nobody anything after forty', ok: (g) => g.age >= 40 && !(Number(g.recall('debt')) > 0) && !!g.recall('money0') },
    ],
    proud: [
      { k: 'wuni', t: 'Get into a bachelor\'s program', ok: (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu')) && g.age >= 18 && g.recall('lifePath') !== 'repeat' },
      { k: 'wcareer', t: 'Become a top figure in your trade before fifty-five', ok: (g) => g.age < 55 && g.s('事业') >= 85 },
      { k: 'wfamily', t: 'Keep the family harmonious before fifty', ok: (g) => g.age < 50 && g.recall('love') === 'married' && g.since('love') >= 10 && g.s('心情') >= 85 && g.s('人缘') >= 75 },
      { k: 'wparents', t: 'Be able to let your parents enjoy their later years beside you', ok: (g) => g.age >= 35 && g.age < 60 && !!g.recall('parentsIn') && ['own', 'mortgage'].includes(g.recall('house')) && g.s('人缘') >= 80 && (CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo')) },
      { k: 'wkid', t: 'Give your parents a grandchild', ok: (g) => (Number(g.recall('kids')) || 0) >= 1 && (g.alive('fa') || g.alive('mo')) },
    ],
    free: [
      { k: 'wcity', t: 'Live in another city', ok: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap') },
      { k: 'wpet', t: 'Have a cat or dog of your own', ok: (g) => g.age >= 18 && !!g.recall('petNow') },
      { k: 'wown', t: 'Work for no one but yourself', ok: (g) => (['boss', 'shop', 'creator', 'freelance'].includes(g.recall('job')) || (!!g.recall('tradeOwn') && !g.recall('retired'))) && g.age >= 22 },
      { k: 'whappy', t: 'Still be happy at sixty', ok: (g) => g.age >= 60 && g.age < 65 && g.s('心情') >= 90 },
      { k: 'wodd', t: 'Find your own path before sixty-five', ok: (g) => g.age >= 40 && g.age < 65 && JY.engine.devOf(L_()) >= 40 },
    ],
    none: [
      { k: 'w80', t: 'Live to eighty', ok: (g) => g.age >= 80 },
      { k: 'wmate', t: 'Have someone to talk to at sixty', ok: (g) => g.age >= 60 && g.recall('love') === 'married' },
      { k: 'w50', t: 'Have ¥1.5 million by sixty', ok: (g) => g.age < 60 && liquid(g) >= 1.5e6 },
      { k: 'wfriends', t: 'Have friends everywhere by sixty', ok: (g) => g.age < 60 && g.s('人缘') >= 95 },
      { k: 'wgk', t: 'Meet a grandchild', ok: (g) => !!JY.byId.gk1 },
    ],
  };
  // 仅结算精简标题；游戏过程中的原文与年龄判定保留。
  const SHORT_WISH = {"Net worth above ¥6 million before seventy":"Build a ¥6 million nest egg","Owe nobody anything after forty":"Owe no one money","Become a top figure in your trade before fifty-five":"Become a top figure in your trade","Keep the family harmonious before fifty":"Keep the family harmonious","Still be happy at sixty":"Still be happy","Find your own path before sixty-five":"Find your own path","Have someone to talk to at sixty":"Have someone to talk to","Have ¥1.5 million by sixty":"Save ¥1.5 million","Have friends everywhere by sixty":"Have friends wherever you go"};
  const shortWish = (t) => SHORT_WISH[t] || t;
  const WISH_BY_ID = Object.fromEntries(Object.values(WISHES).flat().map((w) => [w.k, w]));
  const wishList = (g) => {
    return (g.recall('wishes') || []).map((k) => WISH_BY_ID[k]).filter(Boolean);
  };
  const deadline = { w500: 70, wcareer: 55, wfamily: 50, wparents: 60, whappy: 65, wodd: 65, w50: 60, wfriends: 60 };
  const wishStatus = (g, w) => deadline[w.k] && g.age >= deadline[w.k] ? 'Past the age you set'
    : ['wkid', 'wparents'].includes(w.k) && !g.alive('fa') && !g.alive('mo') ? 'A wish left in the past' : 'Still on your mind';
  // 只在原三十岁关口调整一次；候选来自眼下的经历，不从完整任务池挑容易的。
  const wishChangeOffer = (g) => {
    if (g.age !== 30 || g.recall('wishChange')) return null;
    const wishes = g.recall('wishes') || [], done = g.recall('wishDone') || [];
    if (wishes.length !== 3) return null;
    const to = Number(g.recall('debt')) > 0 ? 'wfree'
      : (Number(g.recall('kids')) > 0 || g.s('健康') < 60) ? 'whappy'
      : !g.alive('fa') && !g.alive('mo') ? 'w80' : null;
    const target = WISH_BY_ID[to];
    if (!target || wishes.includes(to) || done.includes(to) || target.ok(g)) return null;
    const unfinished = wishes.filter((k) => WISH_BY_ID[k] && !done.includes(k) && !WISH_BY_ID[k].ok(g));
    const from = unfinished.find((k) => ['wkid', 'wparents'].includes(k) && !g.alive('fa') && !g.alive('mo')) || unfinished[0];
    return from ? { from, to, age: g.age } : null;
  };
  const changeWish = (g) => {
    const offer = wishChangeOffer(g);
    if (!offer) return false;
    g.remember('wishes', g.recall('wishes').map((k) => k === offer.from ? offer.to : k));
    g.remember('wishChange', offer);
    return true;
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
      g.log((g.recall('wishChange') && g.recall('wishChange').to === w.k ? 'The wish you rewrote at thirty, you achieved: ' : 'One of the wishes you wrote at sixteen has come true: ') + w.t + '. ' + (done.length === 3 ? 'All three things on your mind now, you accomplished.' : ''), 'auto');
    });
    g.remember('wishDone', done);
  }

  const p30 = JY.PAUSES.find((n) => n.id === 'p30');
  if (p30) {
    const old = p30.choices[3], title = old.t, fx = old.fx;
    p30.choices[3] = Object.assign({}, old, {
      t: (g) => { const x = wishChangeOffer(g); return x ? 'Let go of “' + shortWish(WISH_BY_ID[x.from].t) + '” and change it to “' + shortWish(WISH_BY_ID[x.to].t) + '”' : title; },
      hint: (g) => wishChangeOffer(g) ? 'Change only one unfinished wish. The original wish stays on record, and letting go doesn\'t count as fulfilling it.' : '',
      fx: (g) => { changeWish(g); fx(g); },
      res: (g) => g.recall('wishChange') ? 'You don\'t tear out the old page; you just write beside it the life you want more now.' : 'You think for a while and decide to first live the days in front of you well.',
    });
  }
  const p50 = JY.PAUSES.find((n) => n.id === 'p50');
  if (p50) {
    const text = p50.text;
    p50.text = (g) => { const x = g.recall('wishChange'); return text(g) + (x && WISH_BY_ID[x.to] ? 'The “' + shortWish(WISH_BY_ID[x.to].t) + '” you rewrote at thirty, you still remember too.' : ''); };
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
    { k: 'boss', t: 'Small-business owner', d: 'You ran a business of your own, and your ledgers hold both busyness and worry.', ok: (s) => (['boss', 'shop'].includes(s.lastJob) || s.tradeOwn) },
    { k: 'creator', t: 'Living on views', d: 'Turned content creation into a career. ', ok: (s) => s.lastJob === 'creator' },
    { k: 'civil', t: 'Made it ashore', d: 'You stepped into a steady post and handled the work at hand with care.', ok: (s) => s.lastJob === 'civil' },
    { k: 'teacher', t: 'Teacher', d: 'You taught at the lectern and left behind a stretch of days filled with students.', ok: (s) => s.lastJob === 'teacher' },
    { k: 'medic', t: 'White coat', d: 'You were busy in a medical post and cared for real, individual people.', ok: (s) => ['doctor', 'nurse'].includes(s.lastJob) },
    { k: 'coder', t: 'Working with machines', d: 'Stayed in a technical job to the end. ', ok: (s) => s.lastJob === 'tech' },
    { k: 'farmer', t: 'Keeping the land', d: 'You lived off the land and fieldwork, through days of harvests.', ok: (s) => ['farmer', 'cooperative', 'livestock', 'grower'].includes(s.lastJob) },
    { k: 'worker', t: 'Tradesperson', d: 'With the skill in your hands, you gained a footing in your trade.', ok: (s) => ['worker', 'driver', 'rider', 'parcel', 'electrician', 'welder', 'cnc', 'renovation', 'mechanic', 'construction', 'beauty', 'restaurant', 'housekeeping', 'maternity', 'eldercare'].includes(s.lastJob) && ['junior', 'vocational', 'primary', 'senior'].includes(s.edu) && s.st['事业'] >= 60 },
    { k: 'investor', t: 'Market wizard', d: 'Made over $1.1M from investing. ', ok: (s) => s.finGain >= 8e6 },
    { k: 'chive', t: 'Paid your tuition', d: 'Lost over $140K investing, or over $43K in a blow-up. ', ok: (s) => s.finGain <= -1e6 || s.hyBlown >= 3e5 },
    { k: 'divorced', t: 'Starting over', d: 'Divorced, and lived the second half on your own. ', ok: (s) => s.love === 'divorced' },
    { k: 'rooted', t: 'Never left home', d: 'Never left the place you were born. ', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { k: 'workaholic', t: 'Model worker', d: 'Rose high at work, and paid for it with your health. ', ok: (s) => s.st['事业'] >= 88 },
    { k: 'happy', t: 'Content', d: 'Happy right into old age. ', ok: (s) => s.st['心情'] >= 85 },
    { k: 'longlife', t: 'Long life', d: 'Lived past ninety. ', ok: (s) => s.age >= 90 },
    { k: 'plain', t: 'An ordinary life', d: 'School, work, family, old age. Most people live this way. ', ok: () => true },
  ];
  const HINTS = {"century":"A Century Seen","early":"A Brief Light","debt":"The Last Page of the Ledger","tycoon":"Starting from an Ordinary Family","heir":"Taking Over the Family Business","fall":"The Gap in Family Means","scholar":"A Big Exam in a Small Town","phd":"Studying to the End","founder":"The First Day at the Company","remarry":"A New Meeting in Late Life","solo":"Living Alone","dink":"A Choice for Two","bigfam":"A Lively Home","lie":"Slow Can Still Go Far","firsttier":"Settling Far Away","drifter":"A Big-City Lease","homeward":"The Way Home","boss":"A Small Business of Your Own","creator":"Work in Front of the Lens","civil":"A Steady Post","teacher":"The Lectern","medic":"The Hospital Lights","coder":"Making a Living from Skill","farmer":"The Land","worker":"A Pair of Skilled Hands","investor":"Red Ink in the Investment Ledger","chive":"Tuition Paid to Investing","divorced":"Another Chapter of a Relationship","rooted":"The Road to Your Hometown","workaholic":"Work and Your Own Time","happy":"The Mood of Late Life","longlife":"Ninety Springs","plain":"The Weight of Ordinary Days"};
  ENDS.forEach((e) => { e.hint = HINTS[e.k]; });
  // 特定路线优先，寿命作为兜底；保留旧ID和已有图鉴记录。
  const endOf = (s) => {
    const matches = ENDS.filter((e) => { try { return e.ok(s); } catch (err) { return false; } });
    const general = ['century', 'longlife', 'plain'];
    return matches.find((e) => !general.includes(e.k)) || matches[0] || ENDS[ENDS.length - 1];
  };
  // 家底超过了百分之几同样出身的人（rarity.js 的 nq：每种出身的净资产 5%–95% 分位点，19 个）
  const beat = (s) => {
    const q = JY.RARITY && JY.RARITY.nq && JY.RARITY.nq[s.family];
    if (!q || !q.length) return null;
    return Math.round(100 * q.filter((x) => x < s.net).length / (q.length + 1));
  };

  JY.FATE = {
    GIFTS, ENDS, endOf, shortWish, wishList, wishChangeOffer, changeWish,
    // 命终：legacy.js 的 onFinish 调用。s 是这一世的结果，al 是人生图鉴
    finish(g, life, s, al) {
      const L = L_();
      s.st = Object.assign({}, L.st);
      s.gift = g.recall('gift') || '';
      s.liveWith = g.recall('liveWith') || '';
      s.cityTier = g.recall('cityTier') || 0;
      if (g.recall('seed') != null) life.seed = g.recall('seed');
      life.seedFrom = !!g.recall('seedFrom');
      life.friend = decodeFriend(g.recall('friend'));
      life.daily = g.recall('daily') || '';
      const e = endOf(s);
      life.end = { k: e.k, t: e.t, d: e.d, beat: beat(s) };
      if (life.daily) dailyWrite(life.daily, { k: e.k, t: e.t, age: life.to - life.born, net: Math.round((s.net || 0) / 1e4) });
      const ws = wishList(g), done = g.recall('wishDone') || [];
      if (ws.length) {
        life.wish = ws.map((w) => ({ t: w.t, ok: done.includes(w.k), status: done.includes(w.k) ? 'Done' : wishStatus(g, w) }));
        const n = life.wish.filter((w) => w.ok).length;
        if (life.aim) life.aim.v = Math.round(100 * n / ws.length);
      }
      const change = g.recall('wishChange');
      if (change && WISH_BY_ID[change.from] && WISH_BY_ID[change.to]) life.wishChange = Object.assign({}, change, { fromTitle: WISH_BY_ID[change.from].t, toTitle: WISH_BY_ID[change.to].t });
      al.ends = al.ends || {};
      al.gifts = al.gifts || {};
      life.newEnd = !al.ends[e.k];
      // 主结局只显示一个，符合的其他条目也收录，避免被判定顺序永久遮住。
      life.otherEnds = [];
      ENDS.forEach((item) => {
        let hit = false;
        try { hit = !!item.ok(s); } catch (err) { /* 不收录无法判定的条目 */ }
        if (!hit || (item.k === 'plain' && e.k !== 'plain')) return;
        const fresh = !al.ends[item.k];
        al.ends[item.k] = (al.ends[item.k] || 0) + 1;
        if (item.k !== e.k) life.otherEnds.push({ k: item.k, t: item.t, fresh });
      });
      if (s.gift) al.gifts[s.gift] = (al.gifts[s.gift] || 0) + 1;
      // 这一世新解锁的天赋
      life.newGifts = GIFTS.filter((x) => x.need && (life.newAch || []).includes(x.need)).map((x) => x.t);
    },
    // 墓志页最上面的两张卡：结局、心愿
    endCards(l, u) {
      const { esc, card } = u;
      let h = '';
      if (l.friend && l.end) {
        const f = l.friend, myAge = l.to - l.born, myNet = (l.snap || {}).net || 0, fm = (x) => JY.CN.fmt(x);
        const da = myAge - f.age;
        const ageLine = da >= 3 ? 'You outlived them by ' + da + ' years.' : da <= -3 ? 'They outlived you by ' + (-da) + ' years.' : 'You lived about as long as each other.';
        const dn = myNet - f.net;
        const netLine = Math.abs(dn) < Math.max(100000, Math.abs(f.net) * 0.15) ? 'Your net worth is about the same.' : dn > 0 ? 'Your net worth is higher by ' + fm(dn) + '. ' : 'Your net worth is lower by ' + fm(-dn) + '. ';
        h += card('The Same Birth as Your Friend', 'Same-Fate Challenge',
          '<p class="note">Friend: <b>' + esc(f.t) + '</b> · Died at ' + f.age + ' · Net worth ' + esc(fm(f.net)) + '</p>'
          + '<p class="note">You: <b>' + esc(l.end.t) + '</b> · Died at ' + myAge + ' · Net worth ' + esc(fm(myNet)) + '</p>'
          + '<p>' + esc(ageLine + netLine) + ' Same starting point, different lives.</p>');
      }
      if (l.end && !JY.GAME.endLayout) {
        const p = JY.RARITY && JY.RARITY.end ? JY.RARITY.end[l.end.k] : null;
        const g = GIFTS.find((x) => x.k === (l.snap || {}).gift);
        h += card('How this life turned out', l.newEnd ? 'New ending' : '', '<div class="big-num"><div><b>' + esc(l.end.t) + '</b></div></div><p class="note">' + esc(l.end.d)
          + (p != null ? ' About ' + (p < 1 ? 'under 1' : Math.round(p)) + '% of lives end this way. ' : '')
          + (l.end.beat != null ? ' Your net worth at the end beat <b>' + l.end.beat + '%</b> of people born into the same kind of family. ' : '')
          + (g ? ' Gift: ' + esc(g.t) + '. ' : '') + '</p>'
          + (l.otherEnds && l.otherEnds.length ? '<p class="note">Also recorded: ' + l.otherEnds.map((x) => esc(x.t) + (x.fresh ? ' (new)' : '')).join(', ') + '.</p>' : '')
          + (l.seed != null ? '<p class="note">' + (l.daily ? 'Daily Same-Fate · ' + esc(l.daily.slice(5)) + ': everyone on the site shares the same birth today.' : l.seedFrom ? 'This life started from a birth a friend shared. ' : '') + 'Same-Fate Challenge: share the same starting point and see how your friend lives.</p>' : '')
          + (l.newGifts && l.newGifts.length ? '<p class="note">New gift unlocked: <b>' + esc(l.newGifts.join(', ')) + '</b>. It may be laid out in front of you at your next first-birthday pick.</p>' : ''), 'rare-card');
      }
      if (JY.GAME.endLayout && l.end) {
        const more = (l.otherEnds || []).map((x) => x.t);
        h += card('Experiences & Records', '', '<p class="note">' + esc(more.length ? 'Also recorded: ' + more.join(', ') + '. ' : 'This life\'s ending has been added to your album.') + '</p>'
          + (l.newGifts && l.newGifts.length ? '<p class="note">Talent unlocked: ' + esc(l.newGifts.join(', ')) + '.</p>' : '')
          + (l.end.beat != null ? '<p class="note">Your net worth at death exceeded that of ' + l.end.beat + '% of people with the same background.</p>' : ''));
      }
      if (l.wish && l.wish.length) {
        const n = l.wish.filter((w) => w.ok).length;
        h += card('This Life\'s Wishes', JY.GAME.endLayout ? '' : 'Done ' + n + ' / ' + l.wish.length, '<ul class="ach-list">' + l.wish.map((w) => '<li class="' + (w.ok ? 'new' : '') + '"><b>' + esc(shortWish(w.t)) + '</b><span>' + esc(w.ok ? 'Done' : w.status || 'Unfinished') + '</span></li>').join('') + '</ul>'
          + (l.wishChange ? '<p class="note">' + esc(l.wishChange.age + '-year-old you let go of “' + l.wishChange.fromTitle + '” and wrote “' + l.wishChange.toTitle + '” in its place. The one you let go stays in that year and doesn\'t count as done.') + '</p>' : ''));
      }
      return h;
    },
    // 首页：网址里带着朋友分享的出身时，提示一句
    homeChallenge() {
      let h = '';
      if (pending != null) {
        h += '<section class="album"><div class="section-h"><h2>Same-Fate Challenge</h2><span>A friend sent you a birth</span></div><div class="card"><p class="note">Click "Be Born" and you\'ll be born in the same place and the same family as your friend.'
          + (pendingF ? ' Your friend has already lived out this life; the ending stays hidden until you finish yours and compare.' : 'Same starting point. See what kind of life you can make of it.') + '</p></div></section>';
      }
      const E0 = JY.engine && JY.engine.get && JY.engine.get();
      if (!(E0 && E0.L)) {
        const k = dayKey(), done = dailyRead()[k];
        h += '<section class="album"><details class="card daily-entry"><summary>Daily Same-Fate<span class="note">Optional · share a starting point with other players</span></summary><div class="album-content"><p class="note">' + k.slice(5).replace(/^(\d+)-(\d+)$/, '$1/$2') + ' · Same starting point, different choices.</p>'
          + (done ? '<p class="note">You\'ve already been born today: <b>' + done.t + '</b> · Died at ' + done.age + '. Try again and the birth is the same, but your choices can differ.</p>'
            : '<p class="note">Everyone gets the same birth for the child born today. Live out the life, then send the result to a friend to compare.</p>')
          + '<p><button class="b" id="h-daily" data-act="daily">' + (done ? 'Try today’s shared birth again' : 'Try today’s shared birth') + '</button></p></div></details></section>';
      }
      return h;
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
      if (l.wish && l.wish.length) out.push('Wishes completed in this life: ' + l.wish.filter((w) => w.ok).length + ' ');
      return out;
    },
  };
})();

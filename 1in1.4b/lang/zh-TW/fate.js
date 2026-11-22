/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
    { k: 'book', t: '讀書種子', stat: '学识', pick: '抓起那本書', hint: '學識的判定容易一成多；上學那些年學得更快',
      res: '你抓住書角不撒手。一屋子人都笑了，說這孩子以後是讀書的料。', fx: (g) => g.stat('学识', 6) },
    { k: 'abacus', t: '會算賬', stat: '财富', pick: '抓起算盤', hint: '財富的判定容易一成多；存款每年多生一點利息',
      res: '算盤珠子嘩啦響了一聲，你自己先嚇了一跳。大人們說，以後是個會算賬的。' },
    { k: 'seal', t: '坐得住', stat: '事业', pick: '抓起那枚印章', hint: '事業的判定容易一成多；事業能走得更高',
      res: '你攥著印章，誰來拿都不給。有長輩說，這孩子坐得住，以後能成事。' },
    { k: 'ball', t: '身子骨硬', stat: '健康', pick: '抱住那隻皮球', hint: '健康的判定容易一成多；中年以後身體掉得慢',
      res: '你抱著球滾了半圈，沒哭。大人們說，這孩子身子骨結實。', fx: (g) => g.stat('健康', 8) },
    { k: 'mic', t: '自來熟', stat: '人缘', pick: '抓起話筒', hint: '人緣的判定容易一成多；從小人緣就好',
      res: '你對著話筒啊了一聲，把自己逗笑了。大人們說，以後到哪兒都不怯場。', fx: (g) => g.stat('人缘', 8) },
    { k: 'coin', t: '有財運', stat: '财富', need: 'tenmil', needT: '千萬身家', pick: '抓起那串銅錢', hint: '成年時手裡的錢多一倍；偶爾有一筆意外之財',
      res: '銅錢在你手裡叮噹響。大人們說，這孩子以後不缺錢花。' },
    { k: 'brush', t: '有靈氣', stat: '心情', need: 'odd', needT: '走自己的路', pick: '抓起那支畫筆', hint: '自己幹（開店、自由職業、自媒體）掙得多兩成半',
      res: '你拿筆在紅布上劃了一道。大人們說，這孩子手上有靈氣。', fx: (g) => g.stat('心情', 5) },
    { k: 'sleep', t: '心寬', stat: '心情', need: 'plain', needT: '和大多數人一樣', pick: '什麼都沒抓，趴著睡著了', hint: '心情好；再難的時候也緩得過來',
      res: '你爬了兩步，趴在紅布上睡著了。大人們笑了半天，說這孩子心寬。', fx: (g) => g.stat('心情', 10) },
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
    book: '別人背三遍的課文，你看兩遍就記住了。語文老師讓你在班上領讀。',
    abacus: '小賣部老闆找錯了錢，你一眼就看出來了。他多給了你一顆糖。',
    seal: '班主任讓你當了紀律委員。自習課上你坐在講臺邊，一節課沒動過。',
    ball: '運動會上你跑了八百米，衝線的時候氣都沒怎麼喘。',
    mic: '元旦晚會缺個報幕的，你舉了手。臺下幾百個人，你一個字也沒說錯。',
    coin: '你在路邊撿到二十塊錢，交給了老師。第二天，你買的飲料瓶蓋裡中了再來一瓶。',
    brush: '黑板報是你畫的。隔壁班的老師路過，站著看了好一會兒。',
    sleep: '期末考砸了，你回家照樣吃了兩碗飯。家裡人說，這孩子心真大。',
  };
  const GIFT38 = {
    book: '家裡新買的機器，說明書厚厚一本。你花了一個晚上看完，第二天誰不會用都來問你。',
    abacus: '年底你把家裡一年的賬理了一遍。哪筆該省，哪筆不能省，心裡清清楚楚。',
    seal: '親戚家辦事，大事小事都來問你拿主意。你坐在那裡，一條一條說得明明白白。',
    ball: '同齡人開始說腰疼、膝蓋疼。你爬了六層樓，氣還是勻的。',
    mic: '朋友的婚禮臨時缺個主持，你上去說了二十分鐘。散席的時候，好幾個人來加你的聯絡方式。',
    coin: '商場抽獎，你隨手一抽，抽中了一臺電飯煲。',
    brush: '你給家裡的牆刷了個顏色，又自己打了一個架子。來過的人都問是在哪兒買的。',
    sleep: '這一年事情不少。你每天還是沾枕頭就睡著。',
  };
  JY.addLifeNodes([
    { id: 'c_zhuazhou', age: 1, t: '抓周', major: true,
      stake: '抓到什麼，這一世就多一樣天生的本事。',
      text: '週歲那天，家裡人在床上鋪了一塊紅布，擺了一圈東西，把你放在中間。大人們都不說話，看你往哪邊爬。',
      choices: GIFTS.map((x) => ({
        t: x.pick, canon: true, hint: x.hint, cond: (g) => laidOut(g).includes(x.k),
        fx: (g) => { g.remember('gift', x.k); g.info('天賦', x.t); if (x.fx) x.fx(g); },
        res: x.res,
      })) },
    { id: 'c_gift12', age: 12, t: '天生的本事', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT12[g.recall('gift')],
      text: (g) => GIFT12[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
    { id: 'm_gift38', age: 38, t: '天生的本事', auto: true, echoOf: 'c_zhuazhou', cond: (g) => !!GIFT38[g.recall('gift')],
      text: (g) => GIFT38[g.recall('gift')], fx: (g) => g.stat('心情', 2) },
  ]);

  /* 天赋专属的路：加到已有的大事里，只有带着这样天赋的人看得到（每个节点原来最多三个选项，加上以后最多四个） */
  const only = (id, k, ch) => {
    const n = JY.LIFE_NODES.find((x) => x.id === id);
    if (!n || !n.choices) return;
    const x = GIFTS.find((y) => y.k === k);
    ch.cond = (g) => g.recall('gift') === k;
    ch.hint = '天賦“' + x.t + '”才有的路。' + ch.hint;
    n.choices.push(ch);
  };
  only('c_hs_track', 'book', { t: '兩門都學得動，報了學校的競賽班', dev: 15, hint: '學識漲得多，高考更有底氣；少了玩的時間',
    fx: (g) => { g.remember('track', 'sci'); g.stat('学识', 6); g.stat('心情', -2); }, res: '競賽班晚上多上一節課。你做題做到教學樓熄燈，心裡是踏實的。' });
  only('c_xiaoshengchu', 'ball', { t: '體校的教練看上了你，走體育特長進那所好學校', dev: 15, hint: '不用考試就能進好初中；每天要早起訓練',
    fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'exam'); g.remember('talent', 'sport'); g.stat('健康', 3); }, res: '你每天比別人早到一個小時，繞著操場跑圈。那所好學校的校服，你也穿上了。' });
  only('f_pension', 'abacus', { t: '開戶存滿，再拿兩萬買基金', dev: 20, hint: '養老金照存，另外多一份理財；手頭會緊一陣',
    fx: (g) => { g.remember('paYear', true); CN.invest(g, 20000, 'fund'); g.stat('事业', 1); }, res: '你算了一晚上，開了戶，又拿 ¥2 萬買了基金。哪筆錢什麼時候能動，你記在了手機備忘錄裡。' });
  only('y_last34', 'seal', { t: '哪兒也不去，把手上的活做到沒人替得了', dev: 10, hint: '事業往上走一大截；不冒險，也沒有翻倍的機會',
    fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 8); }, res: '你把別人不願接的那攤事接了過來。一年以後，這攤事離了你轉不動。' });
  only('y_love23', 'mic', { t: '相親先放一放，自己在飯局上認識了一個人', dev: 15, hint: '不用碰運氣，直接處上了',
    fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', '戀愛中'); g.stat('心情', 5); }, res: '朋友攢的飯局上，你和鄰座聊了一晚上。散的時候，對方問你要了聯絡方式。' });
  only('f_hy', 'coin', { t: '只拿一萬塊試三個月，拿到利息就取出來', dev: 15, hint: '賺一點小錢就走，不會碰上暴雷',
    fx: (g) => { g.remember('hy', 'no'); CN.earn(g, 200); g.stat('心情', 2); }, res: '你拿 ¥1 萬試了三個月，利息到手 ¥200，本金一分不少地取了出來。半年後，老同學不再提這款理財了。' });
  only('y_back27', 'brush', { t: '回老家，把老房子收拾出一間，自己接活做', dev: 25, hint: '回到家人身邊，靠手藝吃飯；頭幾年收入不穩',
    fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); CN.setJob(g, 'freelance', '自己接活的手藝人'); g.stat('心情', 6); g.stat('人缘', 3); },
    res: (g) => '你回了' + g.recall('city') + '，把老房子的一間屋改成了工作間。頭幾個月活不多，晚飯是在家吃的。' });
  only('y_crisis31', 'sleep', { t: '先睡一覺再說', dev: 10, hint: '氣消得快，誰也不用低頭',
    fx: (g) => { g.remember('fight', 'talk'); g.stat('心情', 5); g.stat('人缘', 2); }, res: '你一覺睡到天亮。醒來的時候氣已經消了，兩個人對著笑了一下，誰也沒再提。' });

  // 每年的小好处
  const WINDFALL = ['發票刮中了獎', '一筆忘了的押金退回來了', '單位發了一筆沒想到的獎金', '老同學還了一筆多年前借的錢', '買的彩票中了個小獎'];
  function giftYear(g, age) {
    const k = g.recall('gift');
    if (!k) return;
    if (k === 'book' && age >= 6 && age <= 22) g.stat('学识', 1);
    if (k === 'ball' && age >= 40 && g.rnd() < 0.3) g.stat('健康', 1);
    if (k === 'sleep' && g.s('心情') < 35) g.stat('心情', 3);
    if (!g.recall('money0')) return;
    if (k === 'abacus' && CN.cash(g) > 0) CN.earn(g, Math.min(40000, CN.cash(g) * 0.012));
    if (k === 'coin') {
      if (!g.recall('coinPaid')) { g.remember('coinPaid', true); const more = Math.max(0, CN.cash(g)); if (more > 0) { CN.earn(g, more); g.log('長輩說你從小有財運，又添了一份，手裡的錢多了 ' + CN.fmt(more) + '。', 'auto'); } }
      else if (g.rnd() < 0.05) { const amt = r1000(Math.max(5000, CN.income(g) * 0.2)); CN.earn(g, amt); g.log('這一年你運氣不錯，' + CN.pick(WINDFALL) + '，多了 ' + CN.fmt(amt) + '。', 'auto'); }
    }
  }

  /* ---------- 心愿 ---------- */
  const liquid = (g) => CN.cash(g) + (Number(g.recall('invest')) || 0);
  const WISHES = {
    rich: [
      { k: 'w100', t: '存款過一百二十萬', ok: (g) => liquid(g) >= 1.2e6 },
      { k: 'whouse', t: '有一套寫著自己名字的房子', ok: (g) => ['own', 'mortgage'].includes(g.recall('house')) },
      { k: 'wboss', t: '自己當一回老闆', ok: (g) => (['boss', 'shop'].includes(g.recall('job')) || (!!g.recall('tradeOwn') && !g.recall('retired'))) },
      { k: 'w500', t: '七十歲前家底過六百萬', ok: (g) => g.age < 70 && CN.net(g) >= 6e6 },
      { k: 'wfree', t: '四十歲以後不欠任何人的錢', ok: (g) => g.age >= 40 && !(Number(g.recall('debt')) > 0) && !!g.recall('money0') },
    ],
    proud: [
      { k: 'wuni', t: '考上本科', ok: (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu')) && g.age >= 18 && g.recall('lifePath') !== 'repeat' },
      { k: 'wcareer', t: '五十五歲前成為行當裡的頂尖人物', ok: (g) => g.age < 55 && g.s('事业') >= 85 },
      { k: 'wfamily', t: '五十歲前把家過得和和氣氣', ok: (g) => g.age < 50 && g.recall('love') === 'married' && g.since('love') >= 10 && g.s('心情') >= 85 && g.s('人缘') >= 75 },
      { k: 'wparents', t: '有條件讓爸媽在身邊安享晚年', ok: (g) => g.age >= 35 && g.age < 60 && !!g.recall('parentsIn') && ['own', 'mortgage'].includes(g.recall('house')) && g.s('人缘') >= 80 && (CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo')) },
      { k: 'wkid', t: '讓爸媽抱上孫輩', ok: (g) => (Number(g.recall('kids')) || 0) >= 1 && (g.alive('fa') || g.alive('mo')) },
    ],
    free: [
      { k: 'wcity', t: '去另一座城市生活', ok: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap') },
      { k: 'wpet', t: '養一隻自己的貓或狗', ok: (g) => g.age >= 18 && !!g.recall('petNow') },
      { k: 'wown', t: '不給別人打工', ok: (g) => (['boss', 'shop', 'creator', 'freelance'].includes(g.recall('job')) || (!!g.recall('tradeOwn') && !g.recall('retired'))) && g.age >= 22 },
      { k: 'whappy', t: '六十歲時依然很開心', ok: (g) => g.age >= 60 && g.age < 65 && g.s('心情') >= 90 },
      { k: 'wodd', t: '六十五歲前走出自己的路', ok: (g) => g.age >= 40 && g.age < 65 && JY.engine.devOf(L_()) >= 40 },
    ],
    none: [
      { k: 'w80', t: '活到八十歲', ok: (g) => g.age >= 80 },
      { k: 'wmate', t: '六十歲的時候身邊有個能說話的人', ok: (g) => g.age >= 60 && g.recall('love') === 'married' },
      { k: 'w50', t: '六十歲前手裡有一百五十萬', ok: (g) => g.age < 60 && liquid(g) >= 1.5e6 },
      { k: 'wfriends', t: '六十歲前到哪兒都有朋友', ok: (g) => g.age < 60 && g.s('人缘') >= 95 },
      { k: 'wgk', t: '見到孫輩', ok: (g) => !!JY.byId.gk1 },
    ],
  };
  // 仅结算精简标题；游戏过程中的原文与年龄判定保留。
  const SHORT_WISH = {"七十歲前家底過六百萬":"攢下六百萬家底","四十歲以後不欠任何人的錢":"不欠任何人的錢","五十五歲前成為行當裡的頂尖人物":"成為行當裡的頂尖人物","五十歲前把家過得和和氣氣":"把家過得和和氣氣","六十歲時依然很開心":"依然很開心","六十五歲前走出自己的路":"走出自己的路","六十歲的時候身邊有個能說話的人":"身邊有個能說話的人","六十歲前手裡有一百五十萬":"攢下一百五十萬","六十歲前到哪兒都有朋友":"到哪兒都有朋友"};
  const shortWish = (t) => SHORT_WISH[t] || t;
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
      g.log('你在本子的最後一頁寫了三件這輩子想做到的事：' + picked.map((w) => w.t).join('；') + '。', 'auto');
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
      g.log('十六歲寫下的心願，你做到了一件：' + w.t + '。' + (done.length === 3 ? '三件都做到了。' : ''), 'auto');
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
    { k: 'century', t: '人瑞', d: '活過了一百歲。', ok: (s) => s.age >= 100 },
    { k: 'early', t: '流星', d: '走得太早，五十歲都沒到。', ok: (s) => s.age < 50 },
    { k: 'debt', t: '負重前行', d: '到最後，賬上還是欠著的。', ok: (s) => s.net < 0 },
    { k: 'tycoon', t: '白手起家', d: '普通人家出身，掙下了八百萬以上的家底。', ok: (s) => POOR.includes(s.family) && s.net >= 8e6 },
    { k: 'heir', t: '守業', d: '富裕人家出身，把家底守住了，還添了一些。', ok: (s) => s.family === 'rich' && s.net >= 8e6 },
    { k: 'fall', t: '家道中落', d: '富裕人家出身，到最後家底不到一百萬。', ok: (s) => s.family === 'rich' && s.net < 1e6 },
    { k: 'scholar', t: '小鎮做題家', d: '從縣城或農村考進了頂尖大學。', ok: (s) => s.hukou !== 'city' && (s.gk === 'top' || s.uni === 'top') },
    { k: 'phd', t: '讀到頭了', d: '一路讀到了博士。', ok: (s) => s.edu === 'phd' },
    { k: 'founder', t: '創業者', d: '合夥創業，公司活了下來。', ok: (s) => s.startup === 'ok' },
    { k: 'remarry', t: '黃昏戀', d: '老伴走後，又找到了一個人。', ok: (s) => s.remarried },
    { k: 'solo', t: '一個人的一輩子', d: '沒結婚，沒孩子，自己把一輩子過完了。', ok: (s) => (!s.love || s.love === 'single' || s.love === 'dating') && !s.kids && s.age >= 50 },
    { k: 'dink', t: '兩個人的一輩子', d: '結了婚，沒要孩子。', ok: (s) => s.kidPlan === 'dink' && !s.kids && ['married', 'widowed'].includes(s.love) },
    { k: 'bigfam', t: '兒孫滿堂', d: '養大了兩個以上的孩子，活過了八十。', ok: (s) => s.kids >= 2 && s.age >= 80 },
    { k: 'lie', t: '躺平大師', d: '事業上沒怎麼使勁，也活到了六十多。', ok: (s) => s.st['事业'] <= 15 && s.age >= 60 },
    { k: 'firsttier', t: '在大城市紮了根', d: '外地出生，在北上廣深有了自己的房子。', ok: (s) => s.tier === 1 && OWN.includes(s.house) && s.cityTier !== 1 },
    { k: 'drifter', t: '漂著', d: '在大城市過了一輩子，一直租房住。', ok: (s) => s.tier <= 2 && !OWN.includes(s.house) && s.house !== 'hometown' && s.age >= 60 && s.liveWith !== 'kids' },
    { k: 'homeward', t: '歸園田居', d: '在外面闖過，最後回了老家。', ok: (s) => ['early', 'late', 'house', 'parents'].includes(s.backHome) || s.liveWith === 'hometown' },
    { k: 'boss', t: '小老闆', d: '自己做生意，做了大半輩子。', ok: (s) => (['boss', 'shop'].includes(s.lastJob) || s.tradeOwn) },
    { k: 'creator', t: '靠流量吃飯', d: '做自媒體，做成了一份職業。', ok: (s) => s.lastJob === 'creator' },
    { k: 'civil', t: '上岸', d: '考上了編制，安安穩穩到退休。', ok: (s) => s.lastJob === 'civil' },
    { k: 'teacher', t: '教書匠', d: '站了一輩子講臺。', ok: (s) => s.lastJob === 'teacher' },
    { k: 'medic', t: '白大褂', d: '在醫院裡忙了一輩子。', ok: (s) => ['doctor', 'nurse'].includes(s.lastJob) },
    { k: 'coder', t: '和機器打交道', d: '在技術崗上幹到了最後。', ok: (s) => s.lastJob === 'tech' },
    { k: 'farmer', t: '守著土地', d: '種了一輩子地。', ok: (s) => s.lastJob === 'farmer' },
    { k: 'worker', t: '手藝人', d: '靠一雙手，幹了一輩子活。', ok: (s) => ['worker', 'driver', 'rider'].includes(s.lastJob) && ['junior', 'vocational', 'primary', 'senior'].includes(s.edu) && s.st['事业'] >= 60 },
    { k: 'investor', t: '股神', d: '一輩子理財賺了八百萬以上。', ok: (s) => s.finGain >= 8e6 },
    { k: 'chive', t: '交了學費', d: '理財虧了一百萬以上，或者在暴雷裡虧了三十萬以上。', ok: (s) => s.finGain <= -1e6 || s.hyBlown >= 3e5 },
    { k: 'divorced', t: '重新來過', d: '離過婚，後半輩子自己過。', ok: (s) => s.love === 'divorced' },
    { k: 'rooted', t: '故土難離', d: '一輩子沒離開出生的地方。', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { k: 'workaholic', t: '勞模', d: '事業走得很高，身體也搭進去不少。', ok: (s) => s.st['事业'] >= 88 },
    { k: 'happy', t: '知足常樂', d: '到老都挺開心。', ok: (s) => s.st['心情'] >= 85 },
    { k: 'longlife', t: '長壽', d: '活過了九十歲。', ok: (s) => s.age >= 90 },
    { k: 'plain', t: '平凡的一生', d: '上學、上班、成家、變老。大多數人都是這樣過來的。', ok: () => true },
  ];
  const HINTS = {"century":"看過一個世紀","early":"短暫的光","debt":"賬本的最後一頁","tycoon":"從普通人家起步","heir":"接過家業","fall":"家底的落差","scholar":"小地方的大考場","phd":"書讀到最後","founder":"公司的第一天","remarry":"晚年的新相遇","solo":"獨自生活","dink":"兩個人的選擇","bigfam":"熱鬧的家","lie":"慢一點也能走遠","firsttier":"在遠方安家","drifter":"大城市的租約","homeward":"回家的方向","boss":"自己的小生意","creator":"鏡頭裡的工作","civil":"穩定的崗位","teacher":"講臺","medic":"醫院的燈","coder":"技術這碗飯","farmer":"土地","worker":"一雙有本事的手","investor":"投資賬本的紅字","chive":"投資交過的學費","divorced":"關係的另一章","rooted":"故鄉的路","workaholic":"工作與自己的時間","happy":"晚年的心情","longlife":"九十個春天","plain":"普通日子的分量"};
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
      if (l.end) {
        const p = JY.RARITY && JY.RARITY.end ? JY.RARITY.end[l.end.k] : null;
        const g = GIFTS.find((x) => x.k === (l.snap || {}).gift);
        h += card('這一生的結局', l.newEnd ? '新結局' : '', '<div class="big-num"><div><b>' + esc(l.end.t) + '</b></div></div><p class="note">' + esc(l.end.d)
          + (p != null ? ' 大約 ' + (p < 1 ? '不到 1' : Math.round(p)) + '% 的人生是這個結局。' : '')
          + (l.end.beat != null ? ' 臨終時的家底，超過了 <b>' + l.end.beat + '%</b> 同樣出身的人。' : '')
          + (g ? ' 天賦：' + esc(g.t) + '。' : '') + '</p>'
          + (l.otherEnds && l.otherEnds.length ? '<p class="note">同時收錄：' + l.otherEnds.map((x) => esc(x.t) + (x.fresh ? '（新）' : '')).join('、') + '。</p>' : '')
          + (l.seed != null ? '<p class="note">' + (l.seedFrom ? '這一世是朋友分享來的出身。' : '') + '同命挑戰：分享同一起點，看看朋友怎麼活。</p>' : '')
          + (l.newGifts && l.newGifts.length ? '<p class="note">解鎖了新的天賦：<b>' + esc(l.newGifts.join('、')) + '</b>。下一世抓周的時候可能擺在你面前。</p>' : ''), 'rare-card');
      }
      if (l.wish && l.wish.length) {
        const n = l.wish.filter((w) => w.ok).length;
        h += card('這一生的心願', '完成 ' + n + ' / ' + l.wish.length, '<ul class="ach-list">' + l.wish.map((w) => '<li class="' + (w.ok ? 'new' : '') + '"><b>' + esc(shortWish(w.t)) + '</b><span>' + (w.ok ? '已完成' : '未完成') + '</span></li>').join('') + '</ul>');
      }
      return h;
    },
    // 首页：网址里带着朋友分享的出身时，提示一句
    homeChallenge() {
      return pending == null ? '' : '<section class="album"><div class="section-h"><h2>同命挑戰</h2><span>朋友發來了一個出身</span></div><div class="card"><p class="note">點“投胎”，你會生在和朋友同一個地方、同一個家裡。同一個起點，看你能活成什麼樣。</p></div></section>';
    },
    // 首页人生图鉴里的两行
    homeRows(al, row) {
      const ends = Object.keys(al.ends || {}).length, open = unlocked().length;
      const locked = GIFTS.filter((x) => x.need && !(al.ach || {})[x.need]);
      return row('結局', ends, ENDS.length) + row('天賦', open, GIFTS.length)
        + (locked.length ? '<p class="note">還有 ' + locked.length + ' 樣天賦沒解鎖：拿到成就“' + locked.map((x) => x.needT).join('”“') + '”，各解鎖一樣。</p>' : '');
    },
    badges(l) {
      const out = [];
      if (l.end) out.push('這一生的結局：' + l.end.t + (l.end.beat != null ? '（家底超過了 ' + l.end.beat + '% 同樣出身的人）' : ''));
      if (l.wish && l.wish.length) out.push('這一生的心願，完成了 ' + l.wish.filter((w) => w.ok).length + ' 個');
      return out;
    },
  };
})();

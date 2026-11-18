/* 江湖一梦 · 游戏设定
 * 共用代码（../share/）里所有和故事有关的文字、颜色、书名都从这里读。
 * 做新游戏时复制这个文件改内容即可。
 */
window.JY = window.JY || {};
window.JY.GAME = {
  id: 'jianghuyimeng',              // 存档键名前缀，每个游戏不同
  version: '2.5.9',                 // 显示在全站顶栏（打包时写进页面的 vg:version）；发布新内容时改
  title: '江湖一梦',
  titleHtml: '江湖<i>一</i>梦',      // 标题里 <i> 包住的字用品牌色
  brand: '#c8566a',                 // 品牌色：标题强调字、少量按钮
  intro: '射雕、神雕、倚天，三部书放进同一个江湖。你会重生成书里有名有姓的一个人，一年一年活到命终。你知道这个人原本的结局，可以照着走，也可以改。改掉的事会留在这个江湖里，下一世还看得到。',
  freshLine: '<b>一个新的江湖。</b>纪年从郭靖出生那年算起。',

  quietYearMs: 20000,               // 空白年（这一年只有闲笔）在 1× 下只走 20 秒；有事的年份仍是一分钟

  wakeAge: 10,                      // 默认从 10 岁醒来（之前的年份照原著过完）；首页可以勾“从出生开始”

  // 规则：寿限 = base + 根骨 × k。内功深的人老得慢（data/world.js 的 JY.CULTIVATE，每年末结算练功、内伤、走火入魔）
  engine: {
    lifespan: { base: 62, k: 0.4, rate: 0.025, decline: [[50, 1], [68, 1]] },
    hookDeathFirst: true,
    yearEnd: (g, age) => { if (window.JY.CULTIVATE) window.JY.CULTIVATE(g, age); },
    // 命终时算这一世的心愿（data/wishes.js）：life.wishes = [{ t, ok }]
    onFinish: (g, life) => { life.wishes = window.JY.wishList ? window.JY.wishList(g, life) : []; },
  },

  // 界面用词
  year: '纪年',                     // 年份前缀：纪年 18
  world: '江湖',                    // “这个江湖”“重开一个江湖”
  idcard: '江湖名帖',
  rumor: '江湖传闻',
  chronicle: '江湖大事记',
  changed: '江湖因你而变',
  changedMine: '江湖因我而变',
  canon: '原著',
  travelFocus: '行走江湖',          // 选这个年度重心时奇遇更多
  // 首页上的其他玩法
  modes: [{ t: '群侠模式', tag: '新', href: 'qunxia/', d: '倚天年间，做一个无名小卒：自由游历十二处江湖、拜师学艺、招募殷离赵敏等队友、回合制比武，收齐十四件信物。品德决定你是侠是魔。' }],
  howto: [
    ['一年一年过', '1× 时一年约一分钟，嫌慢就开 2×–16×。每年选一个重心：练功、读书、行走江湖……属性慢慢变化。'],
    ['遇到原著大事就停下', '弹出抉择。金色选项是原著走向，青色选项会改命。属性高，成功率就高。'],
    ['选过的事会回来', '这一世后面的剧情跟着你的选择走；你救下的人、拿走的剑，下一世重生到后面的年代还在。'],
    ['快捷键', '空格暂停，数字键 1–4 直接选，Esc 收起抉择先看看局面。'],
  ],
  lastWords: {
    happy: '这一生，值了。',
    sad: '若有来生，不入江湖。',
    plain: '江湖路远，就此别过。',
    changed: '原来命，是可以改的。',
    canon: '我这一生，大概就是书里写的那样。',
  },

  // 重心预告：未来 5 年内本人最近的一个带判定的原著节点（此刻 cond 成立），只说年头和属性，不剧透内容
  focusPreview: (L, g, age) => {
    const JY = window.JY, c = JY.byId[L.cid];
    if (!c || !c.arc) return '';
    const yr = (n) => (n.y != null ? n.y : c.born + n.age);
    let best = null;
    c.arc.nodes.forEach((n) => {
      const d = yr(n) - L.year;
      if (d < 1 || d > 5 || (L.done && L.done[n.id]) || n.auto) return;
      if (!n.choices || !n.choices.some((x) => x.canon) || !n.choices.some((x) => x.check)) return;
      if (n.cond && !n.cond(g)) return;
      if (!best || d < best.d) best = { d, n };
    });
    if (!best) return '';
    const stats = [];
    best.n.choices.forEach((x) => { if (x.check && stats.indexOf(x.check[0]) < 0) stats.push(x.check[0]); });
    const num = ['', '一', '两', '三', '四', '五'];
    const when = best.d === 1 ? '明年' : num[best.d] + '年后';
    return when + '有一场硬仗，看' + stats.slice(0, 2).join('或');
  },

  // 心愿（data/wishes.js）：名帖下面、醒来页列出，墓志页打勾，分享卡上写“心愿 2/3”
  sideCards: (c, u) => {
    const ws = (window.JY.WISHES || {})[c.id];
    if (!ws) return '';
    return u.card('这一世的心愿', '命终时算', '<ul class="ulist wish-list">' + ws.map((w) => '<li>' + u.esc(w.t) + '</li>').join('') + '</ul>', 'wish-card');
  },
  endCards: (l, u) => {
    if (!l.wishes || !l.wishes.length) return '';
    const n = l.wishes.filter((w) => w.ok).length;
    return u.card('这一世的心愿', n + ' / ' + l.wishes.length,
      '<ul class="ulist wish-list">' + l.wishes.map((w) => '<li class="' + (w.ok ? 'mod' : '') + '">' + (w.ok ? '✓ ' : '○ ') + u.esc(w.t) + '</li>').join('') + '</ul>', 'wish-card');
  },
  share: {
    // 第一行总数，后面每条心愿一行（分享图上每行只排一行字，写短一点）
    badges: (l) => (l.wishes && l.wishes.length
      ? [(l.end ? '结局“' + l.end.t + '” · ' : '') + '心愿 ' + l.wishes.filter((w) => w.ok).length + '/' + l.wishes.length].concat(l.wishes.map((w) => (w.ok ? '✓ ' : '○ ') + w.t))
      : []),
  },

  // 分享
  shareLead: '射雕三部曲同一个江湖，你会重生成谁？',
  cardFooter: '三部金庸，一个江湖。你会重生成谁？',

  // 书：名帖色条、分享图主色、短名、编码
  books: {
    '射雕英雄传': { short: '射雕', code: 'SDYX', color: '#c9a24a', ink: '#1a1412', card: '#a8822c' },
    '神雕侠侣': { short: '神雕', code: 'SDXL', color: '#4aa39a', ink: '#0e1a18', card: '#2a7d74' },
    '倚天屠龙记': { short: '倚天', code: 'YTTL', color: '#c8566a', ink: '#fff4f2', card: '#a3354c' },
  },
};

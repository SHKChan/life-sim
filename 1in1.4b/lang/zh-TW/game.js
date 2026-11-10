/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 十四亿分之一 · 游戏设定（共用代码 share/ 按这些字段名读取，改值不要改字段名） */
window.JY = window.JY || {};
JY.GAME = {
  id: '1in1.4b',                    // 存档前缀，必须唯一
  title: '十四億分之一',
  titleHtml: '十四億<i>分之</i>一',
  brand: '#d0473a',
  random: true,                     // 每一世随机投胎，不从名单里挑
  // 1× 时一年 12 秒（浮生录默认一分钟）：一生八十多年，1× 约二十分钟，2× 十分钟。大事停下来问，小事顺其自然（data/spine.js）
  yearMs: 12000,
  // 有剧情翻译的语言（lang/<语言>/）。网站上只开中文（share/i18n.js），itch 版打开语言切换。
  // langFiles：已经翻好的数据文件，没列出的照旧载入中文原文（翻译一个文件，加一个）
  langs: ['en', 'zh-TW'],
  langFiles: {
    en: ['world.js', 'economy.js', 'childhood.js', 'youth.js', 'midlife.js', 'oldage.js', 'events.js', 'finance.js', 'tech.js', 'spine.js', 'legacy.js'],
    // 繁体：share/tools/tw.py 从简体自动生成，全部文件都有
    'zh-TW': ['world.js', 'economy.js', 'childhood.js', 'youth.js', 'midlife.js', 'oldage.js', 'events.js', 'finance.js', 'tech.js', 'spine.js', 'legacy.js', 'rarity.js'],
  },
  intro: '今年，中國大約有九百萬個孩子出生。你是其中一個。省份、城鄉、家境都是隨機的，按真實的人口比例來。剩下的一生，由你來過。',
  freshLine: '還沒有投過胎。',
  year: '公元',
  world: '世界',
  idcard: '人生檔案',
  rumor: '新聞',
  chronicle: '世界大事',
  changed: '你留下的痕跡',
  changedMine: '我留下的痕跡',
  canon: '多數人',
  canonEvent: '人生大事',
  fateLabel: '和你一樣出身的大多數人',
  compareTitle: '你和大多數人',
  yourEnd: '你的一生',
  legend: ['隨大流', '走自己的路', '沒走成', '離世'],
  noChange: '你走的路，和大多數人差不多。這也沒什麼不好。',
  devName: '與眾不同',
  devShort: '不同',
  devTip: '這一生有多少選擇和大多數人不一樣',
  modTag: '少有人選',
  pauseTag: '人生關口',
  encTag: '意外',
  familyTitle: '家人',
  peersTitle: '同一年出生的人',
  peersSub: '散在全國各地<br>此刻',
  livesTitle: '投胎記錄',
  randomBtn: '投胎',
  beginBtn: '開始這一生',
  travelFocus: '出去走走',          // 选这个年度重心时，意外更多
  // 引擎设定：属性、寿命
  engine: {
    stats: ['健康', '学识', '心情', '人缘', '财富', '事业'],
    signedStats: [],
    healthStat: '健康',
    healthDeath: '久病不起，在醫院去世',
    naturalDeath: '壽終正寢',
    lifespan: { base: 70, k: 0.3, rate: 0.03, decline: [[52, 1], [75, 1]] },
    wakeBoost: [],
    endTitle: '離世',
    devMode: 'ratio',
    // 钱和同住的人在 data/economy.js 里算
    onStat: (g, k, d) => JY.ECON.onStat(g, k, d),
    yearEnd: (g, age) => JY.ECON.yearEnd(g, age),
    deathLine: (g, id, cause) => JY.ECON.deathLine(g, id, cause),
    flavorRepeat: true,
  },
  version: '2.0.0',                 // 显示在全站顶栏（打包时写进页面的 vg:version）；发布新内容时改
  // 名帖精简：不显示“现居”“时代”（场景下面已经写了住哪儿），也不显示这些字段
  profile: { liveIn: false, era: false, hide: ['子女', '心结', '心愿', '志向', '遗愿'] },
  // 场景框：在家画家和家里人（还有宠物）；出门、上班、看病的那一年画那个地方和陪着的人
  scene: (g) => JY.ECON.scene(g),
  // 场景里画哪些人、场景下面那行字：和你住在一起的人（scene 没给时用）
  party: (g) => JY.ECON.party(g),
  sceneCap: (g) => JY.ECON.sceneCap(g),
  relTag: (g, id) => (JY.CN.livesWith(g, id) ? '同住' : ''),
  // simulate.js 的逻辑检查（已婚写成单身、一岁吃牛肉面……），规则在 data/economy.js
  lint: (g, t, kind) => JY.ECON.lint(g, t, kind),
  // 这些函数会改“和谁住”“房子”，后果检查把它们当作有后果
  stateCalls: ['CN.marry', 'CN.haveKid', 'CN.goCity', 'CN.goHome', 'CN.setJob', 'CN.setEdu', 'CN.buyHouse', 'CN.sellHouse', 'CN.liveWith', 'CN.moveOut', 'CN.invest', 'CN.adoptPet'],
  // 属性怎么显示
  statsUI: {
    bars: [
      { k: '健康', cls: 'gen', tip: '身體底子。生病會掉，鍛鍊會回，五十歲後慢慢下降，降到 0 人就沒了。' },
      { k: '心情', cls: 'xin', tip: '過得開不開心。太低會生病，臨終的話也會苦。' },
      { k: '学识', cls: 'wu', tip: '讀書、學東西、看清局面的本事。考試和很多判定看它。' },
      { k: '人缘', cls: 'qing', tip: '和家人、朋友、同事的關係。求人、勸人、留人，看它。' },
    ],
    extras: [
      { k: '财富', tip: '成年前是家境；成年後是你的存款和理財，按人民幣顯示。房子和欠款在場景下面的小結裡。', tier: [[10, '貧困'], [25, '拮据'], [45, '溫飽'], [65, '小康'], [85, '寬裕'], [1e9, '富足']],
        label: (L, g) => (JY.ECON.wealthText(L, g) ? '存款' : '家境'), show: (L, g) => JY.ECON.wealthText(L, g) },
      // 下面几行只在电脑上的“状态”卡里显示（bar: false），没有就不显示（hideEmpty）
      { k: '财富', label: '年收入', show: (L, g) => JY.ECON.incomeText(L, g), hideEmpty: true, bar: false },
      { k: '财富', label: '年支出', show: (L, g) => JY.ECON.expenseText(L, g), hideEmpty: true, bar: false },
      { k: '财富', label: '房產', show: (L, g) => JY.ECON.houseText(L, g), hideEmpty: true, bar: false },
      { k: '财富', label: '理財', show: (L, g) => (JY.CN.pfText ? JY.CN.pfText(g) : ''), hideEmpty: true, bar: false },
      { k: '财富', label: '行情', show: (L, g) => (g.recall('money0') && JY.CN.marketMood ? JY.CN.moodName(JY.CN.marketMood(g)) : ''), hideEmpty: true, bar: false },
      { k: '财富', label: '欠款', show: (L, g) => JY.ECON.debtText(L, g), hideEmpty: true, bar: false },
      { k: '事业', tip: '工作上走到了哪一步', tier: [[10, '起步'], [30, '普通'], [55, '骨幹'], [80, '出色'], [1e9, '頂尖']] },
    ],
    mood: '心情',
  },
  howto: [
    ['隨機投胎', '省份、城鄉、家境按真實比例隨機。投到哪裡，就從哪裡開始。'],
    ['一年一年過', '1× 時一年約 12 秒，一生二十來分鐘；嫌慢就開 2×–16×。每年選一個重心：讀書、工作、陪家人、鍛鍊……重心攢下的屬性，會決定大事的成敗。'],
    ['只在大事上停下', '升學、工作、結婚、買房、孩子、錢、養老：彈出抉擇，寫明這一步賭的是什麼。小事順著你的性子自己過去。金色是大多數人的選擇，青色是少有人走的路。'],
    ['選過的事會回來', '讀什麼書、去哪座城、和誰過日子，後面的路都跟著變。幾年後的“迴響”會提醒你當年選了什麼。'],
    ['收集人生', '每一世都記進人生圖鑑：去過的省份、走過的路、解鎖的稀有人生。看看你這一生，在十四億人裡有多少見。'],
    ['快捷鍵', '空格暫停，數字鍵 1–4 直接選，Esc 收起抉擇先看看局面。'],
  ],
  lastWords: {
    happy: '這輩子，挺好的。',
    sad: '要是能重來，我想換個活法。',
    plain: '都散了吧，好好過日子。',
    changed: '我走的路，和別人不太一樣。',
    canon: '我這一輩子，和大多數人差不多。',
  },
  shareLead: '你也來投一次胎：',
  cardFooter: '十四億分之一 · 你會投胎到哪裡？',
  // 地区：名帖条颜色（color、ink）和分享图页眉的深色（card）
  sharePlaceholder: '例如：要是能重來，我還選這座城。',
  books: {
    '华北': { short: '华北', code: 'HB', color: '#c9a24a', ink: '#1b1408', card: '#8f6d22' },
    '东北': { short: '东北', code: 'DB', color: '#5b8fc9', ink: '#08121e', card: '#2f5f94' },
    '华东': { short: '华东', code: 'HD', color: '#4aa39a', ink: '#061614', card: '#2a7a72' },
    '华中': { short: '华中', code: 'HZ', color: '#c8566a', ink: '#1e070b', card: '#9a3348' },
    '华南': { short: '华南', code: 'HN', color: '#d98a3a', ink: '#1e1004', card: '#a85e1a' },
    '西南': { short: '西南', code: 'XN', color: '#6aa84f', ink: '#0b1806', card: '#3f7a2a' },
    '西北': { short: '西北', code: 'XB', color: '#b07a4f', ink: '#1a0f06', card: '#7d5230' },
  },
  // 分享卡和文字总结
  share: {
    sub: (l) => [l.book, l.sex, l.info && l.info['户籍']].filter(Boolean).join(' · '),
    fields: (l) => [
      ['出生於', l.birthplace || ''],
      ['学历', (l.info && l.info['学历']) || '無'],
      ['职业', (l.info && l.info['职业'] === '退休' && l.snap && JY.JOB_T && JY.JOB_T[l.snap.lastJob] ? '退休前：' + JY.JOB_T[l.snap.lastJob] : (l.info && l.info['职业']) || '無')],
      ['結局', l.cause, true],
    ],
    summary: (l) => {
      const age = l.to - l.born;
      const info = l.info || {};
      const out = [];
      out.push('【十四億分之一】這一世，我投胎成了' + l.birthplace + '的' + l.name + '。');
      out.push(l.born + '—' + l.to + ' 年，享年 ' + age + '，' + l.cause + '。');
      const bits = [info['学历'], info['职业'], info['婚姻'], info['住处']].filter(Boolean);
      if (bits.length) out.push('這一生：' + bits.join('，') + '。');
      out.push('和我一樣出身的大多數人：' + l.fateText);
      out.push('與眾不同 ' + l.dev + '%，親手做過 ' + l.picks.filter((p) => !p.auto).length + ' 個大抉擇。臨終一句：“' + l.words + '”');
      // 稀有度、成就、志向（data/legacy.js 的 share.badges）
      if (JY.GAME.share.badges) out.push(...JY.GAME.share.badges(l));
      return out;
    },
  },
};

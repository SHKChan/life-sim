/* 1 in 1.4 Billion · English words for the game (loaded after ../../game.js, see share/i18n.js).
 * Internal keys (stat names, focus names, memory keys, region keys) stay Chinese; only what the player reads is translated.
 * Stat names, focus names, life stages, profile fields and tier names are translated through JY.addI18n below. */
(function () {
  'use strict';
  const JY = window.JY;
  const G = JY.GAME;
  Object.assign(G, {
    title: '1 in 1.4 Billion',
    titleHtml: '1 in <i>1.4</i> Billion',
    intro: 'This year, about nine million babies are born in China. You are one of them. Your province, city or village, and your family are random, weighted by the real population. The rest of your life is up to you.',
    freshLine: 'Not born yet.',
    year: 'Year',
    world: 'world',
    idcard: 'Life record',
    rumor: 'News',
    chronicle: 'World events',
    changed: 'The marks you left',
    changedMine: 'The marks I left',
    canon: 'most people',
    canonEvent: 'Life event',
    fateLabel: 'Most people born where you were',
    compareTitle: 'You vs. most people',
    yourEnd: 'Your life',
    legend: ['Went with the crowd', 'Took your own road', 'Tried and failed', 'Died'],
    noChange: 'You walked much the same road as most people. Nothing wrong with that.',
    devName: 'Uniqueness',
    devShort: 'Unique',
    devTip: 'How many of your choices differed from what most people choose',
    modTag: 'Road less taken',
    pauseTag: 'Milestone',
    encTag: 'Surprise',
    familyTitle: 'Family',
    peersTitle: 'Born the same year',
    peersSub: 'Scattered across China<br>right now',
    livesTitle: 'Past lives',
    randomBtn: 'Be born',
    beginBtn: 'Begin this life',
    howto: [
      ['A random birth', 'Province, city or village, and family are drawn by real population shares. Wherever you land, that is where you start.'],
      ['Year by year', 'At 1× a year takes about 12 seconds, a whole life about twenty minutes; speed up to 2×–16× any time. Each year pick a focus: study, work, family, exercise… What you build up decides how the big moments go.'],
      ['Only the big moments stop you', 'School, work, marriage, a home, children, money, old age: a choice pops up and tells you what is at stake. Small things follow your temperament. Gold is what most people choose; teal is the road less taken.'],
      ['Choices come back', 'What you study, which city you move to, who you live with: everything after follows. Years later an “Echo” reminds you what you chose.'],
      ['Collect lives', 'Every life goes into your Life Album: provinces you were born in, roads you walked, rare lives unlocked. See how rare your life was among 1.4 billion.'],
      ['Shortcuts', 'Space pauses, number keys 1–4 choose, Esc folds the choice away so you can look around first.'],
    ],
    lastWords: {
      happy: 'It was a good life.',
      sad: 'If I could do it again, I would live differently.',
      plain: 'Go on home now. Live well.',
      changed: 'I took a road not many people take.',
      canon: 'My life was much like everyone else’s.',
    },
    shareLead: 'Be born once yourself: ',
    cardFooter: '1 in 1.4 Billion · Where would you be born?',
    qrCaption: 'Scan or open the link to live a life in China',
    sharePlaceholder: 'e.g. If I could do it again, I’d still pick this city.',
  });
  G.engine.healthDeath = 'died in hospital after a long illness';
  G.engine.naturalDeath = 'died peacefully of old age';
  G.engine.endTitle = 'The end';
  const BOOK_EN = { 华北: 'North China', 东北: 'Northeast', 华东: 'East China', 华中: 'Central China', 华南: 'South China', 西南: 'Southwest', 西北: 'Northwest' };
  Object.keys(BOOK_EN).forEach((k) => { if (G.books[k]) G.books[k].short = BOOK_EN[k]; });
  // Stat tips and labels
  const tips = {
    健康: 'Your body. Illness lowers it, exercise raises it; after fifty it slowly declines. At 0 you die.',
    心情: 'How happy you are. Too low and you get sick, and your last words turn bitter.',
    学识: 'Learning and good judgment. Exams and many checks use it.',
    人缘: 'Ties with family, friends and colleagues. Asking for help, persuading, keeping people close.',
  };
  G.statsUI.bars.forEach((b) => { if (tips[b.k]) b.tip = tips[b.k]; });
  G.statsUI.extras.forEach((x) => {
    if (x.k === '财富' && x.tier) x.tip = 'Before 18 this is your family’s means; after that it is your savings and investments. Housing and debts are in the summary under the scene.';
    if (x.k === '事业' && x.tier) x.tip = 'How far you have come at work';
  });
  const job = (l) => (JY.JOB_T && l.snap && JY.JOB_T[l.snap.lastJob]) || '';
  G.share = Object.assign(G.share, {
    sub: (l) => [BOOK_EN[l.book] || l.book, JY.t(l.sex), l.info && l.info['户籍']].filter(Boolean).join(' · '),
    fields: (l) => [
      ['Born in', l.birthplace || ''],
      ['Education', (l.info && l.info['学历']) || 'none'],
      ['Work', (l.info && /retired/i.test(l.info['职业'] || '') && job(l) ? 'Retired; was ' + job(l) : (l.info && l.info['职业']) || 'none')],
      ['How it ended', l.cause, true],
    ],
    summary: (l) => {
      const age = l.to - l.born;
      const info = l.info || {};
      const out = [];
      out.push('[1 in 1.4 Billion] This time I was born as ' + l.name + ' in ' + l.birthplace + '.');
      out.push(l.born + '–' + l.to + ', lived to ' + age + ', ' + l.cause + '.');
      const bits = [info['学历'], info['职业'], info['婚姻'], info['住处']].filter(Boolean);
      if (bits.length) out.push('My life: ' + bits.join(', ') + '.');
      out.push('Most people born where I was: ' + l.fateText);
      out.push('Uniqueness ' + l.dev + '%, ' + l.picks.filter((p) => !p.auto).length + ' big choices made. Last words: “' + l.words + '”');
      if (G.share.badges) out.push(...G.share.badges(l));
      return out;
    },
  });
  JY.addI18n('en', {
    // stats and labels
    健康: 'Health', 学识: 'Smarts', 心情: 'Mood', 人缘: 'Social', 财富: 'Wealth', 事业: 'Career',
    存款: 'Savings', 家境: 'Family means', 年收入: 'Income / yr', 年支出: 'Spending / yr', 房产: 'Property', 理财: 'Investments', 行情: 'Market', 欠款: 'Debt',
    贫困: 'Poor', 拮据: 'Tight', 温饱: 'Getting by', 小康: 'Comfortable', 宽裕: 'Well-off', 富足: 'Wealthy',
    起步: 'Starting out', 普通: 'Ordinary', 骨干: 'Core staff', 出色: 'Outstanding', 顶尖: 'Top',
    // profile fields
    户籍: 'Hukou', 家庭: 'Family', 学历: 'Education', 职业: 'Work', 婚姻: 'Marriage', 住处: 'Lives in', 子女: 'Children', 志向: 'Ambition', 心结: 'Weighs on you', 心愿: 'Hope', 遗愿: 'Last wish',
    同住: 'Lives with you',
    // life stages
    襁褓: 'Infant', 幼年: 'Toddler', 少年: 'Child', 青年: 'Young adult', 壮年: 'Adult', 中老年: 'Older adult', 暮年: 'Old age',
    // year focus (names are internal keys)
    懵懂: 'Little one', 用功读书: 'Study hard', 贪玩: 'Play', 帮家里干活: 'Help at home', 学个特长: 'Learn a skill', 埋头工作: 'Work hard', 学习充电: 'Keep learning',
    搞副业: 'Side hustle', 陪伴家人: 'Family time', 锻炼身体: 'Exercise', 躺平休息: 'Lie flat', 出去走走: 'Travel', 含饴弄孙: 'Grandkids',
    '还小，由大人照看。': 'Still little; the grown-ups look after you.',
    '学识 +2～3，心情会闷。中考、高考、考研都看学识。': 'Smarts +2–3, mood suffers. High-school and college entrance exams depend on Smarts.',
    '心情 +2、人缘 +1，学识会往下掉。': 'Mood +2, Social +1; Smarts slip.',
    '人缘、健康；人会早熟一些。': 'Social and Health; you grow up a little faster.',
    '学识，偶尔有意外收获；家里要花钱。': 'Smarts, sometimes a lucky break; costs your family money.',
    '事业 +3，年终多拿一笔；健康和心情慢慢掉。事业高，工资高、升职和创业更容易成。': 'Career +3 and a year-end bonus; Health and Mood slowly drop. High Career means higher pay and better odds for promotions and startups.',
    '学识；学识高时事业也会涨。': 'Smarts; with high Smarts, Career rises too.',
    '财富，看运气；累。': 'Money, if you are lucky; tiring.',
    '人缘 +2、心情 +1；工作上顾不过来，事业偶尔往下掉。': 'Social +2, Mood +1; work suffers a little, Career sometimes slips.',
    '健康回升。': 'Health recovers.',
    '心情 +2；事业往下掉，钱只出不进。': 'Mood +2; Career drops, money only goes out.',
    '心情、见识；意外多，花钱。': 'Mood and perspective; more surprises; costs money.',
    '人缘、心情；累一点。': 'Social and Mood; a bit tiring.',
    // sex
    男: 'male', 女: 'female',
  });
})();

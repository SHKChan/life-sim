/* 十四亿分之一 · 游戏设定（共用代码 share/ 按这些字段名读取，改值不要改字段名） */
window.JY = window.JY || {};
JY.GAME = {
  id: '1in1.4b',                    // 存档前缀，必须唯一
  title: '十四亿分之一',
  titleHtml: '十四亿<i>分之</i>一',
  brand: '#d0473a',
  random: true,                     // 每一世随机投胎，不从名单里挑
  intro: '今年，中国大约有九百万个孩子出生。你是其中一个。省份、城乡、家境都是随机的，按真实的人口比例来。剩下的一生，由你来过。',
  freshLine: '还没有投过胎。',
  year: '公元',
  world: '世界',
  idcard: '人生档案',
  rumor: '新闻',
  chronicle: '世界大事',
  changed: '你留下的痕迹',
  changedMine: '我留下的痕迹',
  canon: '多数人',
  canonEvent: '人生大事',
  fateLabel: '和你一样出身的大多数人',
  compareTitle: '你和大多数人',
  yourEnd: '你的一生',
  legend: ['随大流', '走自己的路', '没走成', '离世'],
  noChange: '你走的路，和大多数人差不多。这也没什么不好。',
  devName: '与众不同',
  devShort: '不同',
  devTip: '这一生有多少选择和大多数人不一样',
  modTag: '少有人选',
  pauseTag: '人生关口',
  encTag: '意外',
  familyTitle: '家人',
  peersTitle: '同一年出生的人',
  peersSub: '散在全国各地<br>此刻',
  livesTitle: '投胎记录',
  randomBtn: '投胎',
  beginBtn: '开始这一生',
  travelFocus: '出去走走',          // 选这个年度重心时，意外更多
  // 引擎设定：属性、寿命
  engine: {
    stats: ['健康', '学识', '心情', '人缘', '财富', '事业'],
    signedStats: [],
    healthStat: '健康',
    healthDeath: '久病不起，在医院去世',
    naturalDeath: '寿终正寝',
    lifespan: { base: 70, k: 0.3, rate: 0.03, decline: [[52, 1], [75, 1]] },
    wakeBoost: [],
    endTitle: '离世',
    devMode: 'ratio',
    // 钱和同住的人在 data/economy.js 里算
    onStat: (g, k, d) => JY.ECON.onStat(g, k, d),
    yearEnd: (g, age) => JY.ECON.yearEnd(g, age),
    deathLine: (g, id, cause) => JY.ECON.deathLine(g, id, cause),
    flavorRepeat: true,
  },
  // 场景里画哪些人、场景下面那行字：和你住在一起的人
  party: (g) => JY.ECON.party(g),
  sceneCap: (g) => JY.ECON.sceneCap(g),
  relTag: (g, id) => (JY.CN.livesWith(g, id) ? '同住' : ''),
  // simulate.js 的逻辑检查（已婚写成单身、一岁吃牛肉面……），规则在 data/economy.js
  lint: (g, t, kind) => JY.ECON.lint(g, t, kind),
  // 这些函数会改“和谁住”“房子”，后果检查把它们当作有后果
  stateCalls: ['CN.marry', 'CN.haveKid', 'CN.goCity', 'CN.goHome', 'CN.setJob', 'CN.setEdu', 'CN.buyHouse', 'CN.sellHouse', 'CN.liveWith', 'CN.moveOut', 'CN.invest'],
  // 属性怎么显示
  statsUI: {
    bars: [
      { k: '健康', cls: 'gen', tip: '身体底子。生病会掉，锻炼会回，五十岁后慢慢下降，降到 0 人就没了。' },
      { k: '心情', cls: 'xin', tip: '过得开不开心。太低会生病，临终的话也会苦。' },
      { k: '学识', cls: 'wu', tip: '读书、学东西、看清局面的本事。考试和很多判定看它。' },
      { k: '人缘', cls: 'qing', tip: '和家人、朋友、同事的关系。求人、劝人、留人，看它。' },
    ],
    extras: [
      { k: '财富', tip: '成年前是家境；成年后是你的存款和理财，按人民币显示。房子和欠款在场景下面的小结里。', tier: [[10, '贫困'], [25, '拮据'], [45, '温饱'], [65, '小康'], [85, '宽裕'], [1e9, '富足']],
        label: (L, g) => (JY.ECON.wealthText(L, g) ? '存款' : '家境'), show: (L, g) => JY.ECON.wealthText(L, g) },
      { k: '事业', tip: '工作上走到了哪一步', tier: [[10, '起步'], [30, '普通'], [55, '骨干'], [80, '出色'], [1e9, '顶尖']] },
    ],
    mood: '心情',
  },
  howto: [
    ['随机投胎', '省份、城乡、家境按真实比例随机。投到哪里，就从哪里开始。'],
    ['一年一年过', '1× 时一年约一分钟，嫌慢就开 2×–16×。每年选一个重心：读书、工作、陪家人、锻炼……'],
    ['遇到人生大事就停下', '弹出抉择。金色是大多数人的选择，青色是少有人走的路。属性高，成功率就高。'],
    ['选过的事会回来', '读什么书、去哪座城、和谁过日子，后面的路都跟着变。'],
    ['快捷键', '空格暂停，数字键 1–4 直接选，Esc 收起抉择先看看局面。'],
  ],
  lastWords: {
    happy: '这辈子，挺好的。',
    sad: '要是能重来，我想换个活法。',
    plain: '都散了吧，好好过日子。',
    changed: '我走的路，和别人不太一样。',
    canon: '我这一辈子，和大多数人差不多。',
  },
  shareLead: '你也来投一次胎：',
  cardFooter: '十四亿分之一 · 你会投胎到哪里？',
  // 地区：名帖条颜色（color、ink）和分享图页眉的深色（card）
  sharePlaceholder: '例如：要是能重来，我还选这座城。',
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
      ['出生于', l.birthplace || ''],
      ['学历', (l.info && l.info['学历']) || '无'],
      ['职业', (l.info && l.info['职业']) || '无'],
      ['结局', l.cause, true],
    ],
    summary: (l) => {
      const age = l.to - l.born;
      const info = l.info || {};
      const out = [];
      out.push('【十四亿分之一】这一世，我投胎成了' + l.birthplace + '的' + l.name + '。');
      out.push(l.born + '—' + l.to + ' 年，享年 ' + age + '，' + l.cause + '。');
      const bits = [info['学历'], info['职业'], info['婚姻'], info['住处']].filter(Boolean);
      if (bits.length) out.push('这一生：' + bits.join('，') + '。');
      out.push('和我一样出身的大多数人：' + l.fateText);
      out.push('与众不同 ' + l.dev + '%，做过 ' + l.picks.length + ' 个选择。临终一句：“' + l.words + '”');
      return out;
    },
  },
};

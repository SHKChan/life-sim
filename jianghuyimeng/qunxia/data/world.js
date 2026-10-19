/* 群侠 · 世界：地区、地点、出身、门派、物品、引擎用的固定句式、结局、通用的探索与路上遭遇。
 * 时间：倚天年间，江湖纪年 131 年正月起，到 138 年腊月止（见 ../docs/SPEC.md 的纪年表）。 */
(function () {
  'use strict';
  const QX = window.QX;

  /* ---------- 地区与地点 ----------
   * x、y 是地图上的位置（0–100，西→东、北→南），行程天数按距离算，轻功越高走得越快。
   * sea：海岛，要从 port（临安）坐船，fare 是船钱，needs 是必须带着的东西。clinic：医馆，治一层内伤要几两银子。
   * scene：像素场景，用 share/pixel.js 里已有的。 */
  QX.addRegions({
    zhongyuan: { name: '中原' }, xinan: { name: '西南' }, jiangnan: { name: '江南' }, donghai: { name: '东海' },
    xiyu: { name: '西域' }, zhongnan: { name: '终南山' }, xiangyang: { name: '襄阳' }, dadu: { name: '大都' },
  });
  QX.addLocs({
    shaolin: { name: '嵩山少林寺', short: '少林寺', region: 'zhongyuan', scene: 'temple', x: 63, y: 42, inn: 6, clinic: 30, shop: ['jinchuang', 'renshen', 'dahuan', 'taizu_pu'], work: true,
      desc: '少室山下是登封镇，山上是千年古刹。钟声一早就响，香客从镇上一直排到山门。',
      workText: ['你在登封镇的米铺扛了几天米。', '你帮香客挑担子上山，一趟一趟。'] },
    wudang: { name: '武当山', short: '武当山', region: 'zhongyuan', scene: 'temple', x: 53, y: 54, inn: 5,
      desc: '真武大殿在云雾里。山道两边是松树，道童挑着水一步一步往上走。张真人在山上，武当七侠也在。' },
    hudie: { name: '淮北 · 蝴蝶谷', short: '蝴蝶谷', region: 'zhongyuan', scene: 'valley', x: 72, y: 50,
      desc: '谷里花多，蝴蝶更多。几间草屋空着，门口晒药的竹匾早就朽了。这里曾住着“见死不救”胡青牛。' },
    emei: { name: '峨嵋山', short: '峨嵋山', region: 'xinan', scene: 'peaks', x: 35, y: 64, inn: 5, work: true,
      desc: '金顶上常年是云海。峨嵋派的女弟子三五成群，背着剑从石阶上走过，不太理会外人。',
      workText: ['你给山下的茶农摘了几天茶。', '你帮寺里的和尚劈了几天柴。'] },
    dali: { name: '大理', short: '大理', region: 'xinan', scene: 'waterfall', x: 23, y: 82, inn: 4, clinic: 20, shop: ['jinchuang', 'renshen', 'jiedu', 'tuna_pu'], work: true,
      desc: '苍山的雪，洱海的水。段氏早已不做皇帝，天龙寺的钟还在敲。城里的白族姑娘会唱很长的歌。',
      workText: ['你跟着马帮赶了几天骡子。', '你在洱海边帮渔家收了几天网。'] },
    lintan: { name: '临安', short: '临安', region: 'jiangnan', scene: 'watertown', x: 82, y: 64, inn: 8, clinic: 35, shop: ['jinchuang', 'renshen', 'jiedu', 'dengping_pu', 'taizu_pu', 'tuna_pu'], work: true, port: true,
      desc: '南宋亡了几十年，西湖还是西湖。城里有元人的衙门，也有说书的茶楼。码头上的船去东海诸岛。',
      workText: ['你在码头卸了几天货。', '你在茶楼里跑了几天堂。', '你帮绸缎庄送了几天货。'] },
    lingshe: { name: '东海 · 灵蛇岛', short: '灵蛇岛', region: 'donghai', scene: 'sea', x: 93, y: 72, sea: true, port: 'lintan', fare: 20,
      desc: '岛上多蛇，礁石是黑的。半山有一座木屋，住着一个拄拐杖、咳嗽不停的婆婆。' },
    binghuo: { name: '北海 · 冰火岛', short: '冰火岛', region: 'donghai', scene: 'icefire', x: 95, y: 6, sea: true, port: 'lintan', fare: 60, needs: 'haitu',
      desc: '极北的海上，冰原中间一座火山昼夜不熄。岛上只有熊和海豹，还有一个人。' },
    guangming: { name: '昆仑山 · 光明顶', short: '光明顶', region: 'xiyu', scene: 'peaks', x: 7, y: 38,
      desc: '明教总坛建在昆仑山的绝顶上。教主阳顶天失踪多年，四大法王散了，五散人和光明左使杨逍互不服气。' },
    zhongnan: { name: '终南山 · 重阳宫', short: '重阳宫', region: 'zhongnan', scene: 'temple', x: 47, y: 42,
      desc: '全真教的祖庭。王重阳、丘处机都已是百年前的人，宫里的道士照旧早课晚课，香火比当年冷清。' },
    xiangyang: { name: '襄阳', short: '襄阳', region: 'xiangyang', scene: 'citywall', x: 61, y: 59, inn: 5, clinic: 25, shop: ['jinchuang', 'renshen', 'taizu_pu'], work: true,
      desc: '六十年前城破，郭大侠夫妇殉城。如今城墙补过，城头挂的是元人的旗。丐帮在城西破庙里设了分舵。',
      workText: ['你在城外帮人修了几天城墙。', '你在汉水边拉了几天纤。'] },
    dadu: { name: '大都 · 汝阳王府', short: '大都', region: 'dadu', scene: 'palace', x: 70, y: 13, inn: 10, clinic: 40, shop: ['jinchuang', 'renshen', 'jiedu', 'qishang_pu'], work: true,
      desc: '元朝的都城，街比别处宽，马比别处多。汝阳王府占了半条街，门口的番僧比石狮子还高。',
      workText: ['你在大都的车马行喂了几天马。', '你给酒楼洗了几天碗。'] },
  });

  /* ---------- 出身：都是无名小卒 ---------- */
  QX.addOrigins([
    { id: 'farmer', name: '襄阳农家子', loc: 'xiangyang', st: { 根骨: 4, 银两: 0 }, arts: [], items: [['jinchuang', 1]],
      d: '城外种地的人家。根骨结实。',
      intro: (g) => '你生在襄阳城外的一户农家。爹娘种了一辈子地，你从小跟着下田，手上全是茧。十二岁那年，你把锄头放下，说要去学武。' },
    { id: 'fisher', name: '临安渔家子', loc: 'lintan', st: { 轻功: 4, 根骨: 2, 银两: 10 }, items: [['jinchuang', 1]],
      d: '在西湖上长大，水性好，腿脚快。',
      intro: '你在西湖的船上长大，会水，会撑篙，会在跳板上跑。爹说打鱼的没出息，你想看看外头的江湖。' },
    { id: 'beggar', name: '大都小乞儿', loc: 'dadu', st: { 资质: 6, 品德: -5, 银两: -18 }, items: [],
      d: '在大都街头讨饭长大。机灵，心思活，身上没钱。',
      intro: '你不记得爹娘。你在大都的街上讨饭，跟野狗抢过吃的，也偷过包子。你看过王府门口的番僧一掌拍碎石墩，从那天起你就想学武。' },
    { id: 'herb', name: '大理药铺学徒', loc: 'dali', st: { 资质: 8, 银两: 5 }, items: [['jinchuang', 2]],
      d: '认得草药，悟性好。',
      intro: '你在大理城一家药铺当学徒，认得几百种草药。掌柜说你记性好，可惜不安分。你攒了几两银子，辞了工。' },
    { id: 'orphan', name: '流民孤儿', loc: 'shaolin', st: { 根骨: 3, 品德: 8, 银两: -15 }, items: [],
      d: '逃荒到嵩山脚下，吃少林的粥长大。心地良善。',
      intro: '那年黄河决口，你跟着逃荒的人一路走到嵩山。爹娘死在路上。你在少林寺山门口喝了三年的粥，看和尚们在晨雾里打拳。' },
    { id: 'woodcutter', name: '峨嵋樵夫之子', loc: 'emei', st: { 根骨: 5, 攻击: 2, 银两: 0 }, items: [],
      d: '在峨嵋山砍柴长大，力气大。',
      intro: '你爹是峨嵋山下的樵夫。你从小上山砍柴，常看见峨嵋派的女弟子在林子里练剑。你学着她们比划，被你爹打了好几回。' },
  ]);

  /* ---------- 门派 ----------
   * home：门派所在地。arts：入门时会的武功。minDe：品德低于这个，回山时会被逐出师门（expel 事件）。
   * ranks：门中地位，c 是做够多少回门派差事，de 是品德要求。 */
  QX.addSects({
    quanzhen: { name: '全真教', home: 'zhongnan', arts: ['quanzhen_xinfa'], minDe: 40, expel: 'zn_expel',
      d: '终南山重阳宫。道家正宗，内功扎实，规矩多。',
      intro: '你拜在重阳宫门下，做了一个小道童。师父给你取了道号，你记不住，大家还是叫你的名字。',
      chore: (g) => g.pick(['你在重阳宫扫了十天落叶。', '你给三清殿抄了十天经。', '你跟着师兄去山下挑了十天水。']),
      ranks: [{ name: '记名弟子' }, { name: '入门弟子', c: 2 }, { name: '三代弟子', c: 6, de: 50, ev: 'zn_rank3' }, { name: '亲传弟子', c: 12, de: 60 }] },
    gaibang: { name: '丐帮', home: 'xiangyang', arts: ['lianhua'], minDe: 25, expel: 'gb_expel',
      d: '襄阳城西破庙的分舵。天下第一大帮，人多消息灵。',
      intro: '你在襄阳城西的破庙里磕了头，背上多了一只麻袋。丐帮的规矩是不许偷，不许欺负穷人。',
      chore: (g) => g.pick(['你在城里讨了十天饭，顺手打听了几条消息。', '你替分舵送了一封信，来回十天。', '你在破庙里守了十天夜。']),
      ranks: [{ name: '一袋弟子' }, { name: '二袋弟子', c: 2 }, { name: '四袋弟子', c: 6, de: 40, ev: 'gb_rank3' }, { name: '六袋弟子', c: 12, de: 50 }] },
    emei: { name: '峨嵋派', home: 'emei', arts: ['emei_jian'], minDe: 45, expel: 'em_expel',
      d: '郭襄祖师开创。剑法轻灵，掌门灭绝师太嫉恶如仇。',
      intro: '你在峨嵋金顶磕了头。灭绝师太只看了你一眼，把你交给大师姐静玄。从此你每天天不亮就上山练剑。',
      chore: (g) => g.pick(['你在金顶扫了十天雪。', '你替静玄师姐誊了十天门规。', '你守了十天山门，没放一个闲人进来。']),
      ranks: [{ name: '记名弟子' }, { name: '入门弟子', c: 2 }, { name: '入室弟子', c: 6, de: 55, ev: 'em_rank3' }, { name: '亲传弟子', c: 12, de: 65 }] },
    mingjiao: { name: '明教', home: 'guangming', arts: ['tuna'], minDe: 0,
      d: '光明顶。教众遍天下，朝廷叫它魔教。教主失踪，群龙无首。',
      intro: '你在光明顶的圣火前念了教规：“焚我残躯，熊熊圣火。”锐金旗掌旗使庄铮拍了拍你的肩膀，让你先去搬石头。',
      chore: (g) => g.pick(['你跟着锐金旗的兄弟在山上搬了十天石头。', '你给厨房挑了十天水。', '你在山口守了十天哨，什么也没看见。']),
      ranks: [{ name: '教众' }, { name: '锐金旗旗众', c: 2 }, { name: '旗中好手', c: 6, ev: 'mj_rank3' }, { name: '掌旗副使', c: 12 }] },
  });

  /* ---------- 物品 ----------
   * use：服用的效果（hp、mp、full 全满、inj 治几层内伤）。teaches：读了能学会的武功。
   * relic：十四件信物之一。bonus：带在身上加属性。holder0：开局时在谁手里（剧情里用 g.holder 读）。 */
  QX.addItems({
    jinchuang: { name: '金创药', type: '药', price: 12, use: { hp: 80 }, d: '止血生肌，回 80 点气血。' },
    renshen: { name: '老山参', type: '药', price: 25, use: { mp: 80 }, d: '补气，回 80 点内力。' },
    jiedu: { name: '解毒丹', type: '药', price: 18, use: { hp: 40, inj: 1 }, d: '解毒，回 40 点气血，治一层内伤。' },
    dahuan: { name: '少林大还丹', type: '药', price: 120, use: { full: true, inj: 2 }, d: '少林秘制。气血内力全满，治两层内伤。' },
    xuelian: { name: '天山雪莲', type: '药', price: 0, use: { full: true, inj: 9, mer: true }, d: '雪线上长的奇花。气血内力全满，内伤全好，断了的经脉也能接上。' },
    taizu_pu: { name: '太祖长拳谱', type: '秘籍', price: 15, teaches: 'taizu', d: '街头卖艺的都会几招。' },
    tuna_pu: { name: '吐纳法', type: '秘籍', price: 20, teaches: 'tuna', d: '最粗浅的呼吸吐纳。' },
    dengping_pu: { name: '登萍渡水', type: '秘籍', price: 90, teaches: 'dengping', d: '江南一路的轻功。' },
    qishang_pu: { name: '七伤拳谱', type: '秘籍', price: 260, teaches: 'qishang', d: '崆峒派流出来的抄本。先伤己，再伤人。' },
    haitu: { name: '北海海图', type: '杂', price: 0, d: '一张发黄的羊皮海图，画着极北的一座火山岛。' },
    // 十四件信物
    yitian: { name: '倚天剑', type: '信物', relic: true, holder0: 'miejue', bonus: { 攻击: 18 }, d: '“倚天不出，谁与争锋。”削铁如泥。带在身上攻击 +18。' },
    tulong: { name: '屠龙刀', type: '信物', relic: true, holder0: 'xiexun', bonus: { 攻击: 20 }, d: '“武林至尊，宝刀屠龙。”沉得压手。带在身上攻击 +20。' },
    jiuyang: { name: '九阳真经', type: '信物', relic: true, teaches: 'jiuyang', d: '油布包着的四卷经书，从白猿腹中取出。可以学九阳神功。' },
    qiankun: { name: '乾坤大挪移心法', type: '信物', relic: true, teaches: 'qiankun', d: '一张写满字的羊皮，明教历代教主才能练。可以学乾坤大挪移。' },
    shenghuo: { name: '圣火令', type: '信物', relic: true, holder0: 'bosi', teaches: 'shenghuo_wu', bonus: { 防御: 4 }, d: '黑黝黝的铁牌，刀剑砍不动，上面刻着波斯文字。可以学圣火令武功。' },
    wumu: { name: '武穆遗书', type: '信物', relic: true, bonus: { 防御: 6 }, d: '岳武穆的兵法。藏在屠龙刀里。带在身上防御 +6。' },
    jiuyin: { name: '九阴真经', type: '信物', relic: true, teaches: ['jiuyin_zhua', 'dafumo'], d: '藏在倚天剑里的经文。急功近利的人只学得会白骨爪。' },
    heiyu: { name: '黑玉断续膏', type: '信物', relic: true, holder0: 'asan', use: { hp: 200, inj: 9, mer: true }, combat: false, d: '西域金刚门的秘药，能接续断骨。用一点就能治好内伤，经脉断了也接得上。' },
    dagou: { name: '打狗棒', type: '信物', relic: true, holder0: 'shihuolong', bonus: { 攻击: 6 }, d: '碧绿的竹棒，丐帮帮主的信物。' },
    yijin: { name: '易筋经', type: '信物', relic: true, holder0: 'shaolin', teaches: 'yijin', d: '少林藏经阁的镇阁之宝，写在梵文的贝叶上，旁边有汉文注释。' },
    taiji: { name: '太极拳经', type: '信物', relic: true, holder0: 'zhangsanfeng', teaches: ['taiji_quan', 'taiji_jian'], d: '张三丰晚年悟出的拳理剑意，亲笔写下。' },
    yijing: { name: '胡青牛医经', type: '信物', relic: true, d: '“医仙”胡青牛一生的心得。带着它，住店时能给自己治一层内伤。' },
    yiyang: { name: '一阳指谱', type: '信物', relic: true, holder0: 'tianlong', teaches: 'yiyang', d: '大理段氏的家传指法，一灯大师一脉留下的手抄本。' },
    xiantian: { name: '先天功残篇', type: '信物', relic: true, holder0: 'quanzhen', teaches: 'xiantian', d: '王重阳的先天功，只剩前半部。' },
  });

  /* ---------- 引擎的固定句式 ---------- */
  QX.addText({
    无名: '无名氏', 学会: '你学会了{a}。', 得信物: '你得到了信物【{a}】。（{n}/{all}）', 得物品: '你得到了{a}×{n}。', 入队: '{a}与你同行。', 离队: '{a}离开了队伍。',
    已故: '此人已经不在人世。', 不和: '{a}不肯和{b}同行。', 不肯同行: '{a}现在不肯跟你走。', 队伍满了: '身边最多带 {n} 个同伴。',
    银两不够: '银两不够（要 {n} 两）。', 缺少: '缺少{a}。', 没成: '没有成功。', 拜师学: '学{a}', 请教: '请教{a}', 级: '{n} 级',
    邀请同行: '邀请同行', 告辞: '告辞', 学成: '你学会了{a}的入门功夫。', 指点: '对方指点了你十天{a}，长进 {n}。', 升级: '{a}练到了第 {n} 级。',
    一无所获: '你在附近转了几天，什么也没碰到。', 住不起: '住店要 {n} 两银子，你不够。', 住店: '你花 {n} 两银子住了一夜，睡得很沉。气血内力都满了。',
    打坐: '你找了个僻静处打坐了三天。', 做工: '挣了 {n} 两银子。', 门派差事: '你做了十天门派差事。', 升位: '你在门中升为{a}。', 等了一月: '你在这里住了一个月，看人来人往。',
    走火入魔: '你练{a}时急于求成，真气乱窜，走火入魔。功力倒退，昏迷了好几天。', 内伤: '你练{a}太猛，胸口一阵剧痛，受了内伤。', 练功: '你练了十天{a}，长进 {n}。',
    用药: '你用了{a}。', 读不懂: '{a}你还练不了：{why}。', 读秘籍: '你读了{a}，学会了{b}。', 都会了: '上面的功夫你都会了。', 已有: '你已经有一本了。', 买下: '你花 {n} 两买下了{a}。',
    送别: '你和{a}在路口分了手。', 要海图: '没有{a}，没有船家敢去。', 船钱不够: '船钱要 {n} 两。', 上路: '你从{a}动身，走了 {n} 天到了{b}。',
    开打: '{a}拦住了去路。', 内力不足: '内力不足', 拳脚: '拳脚', 不耗内力: '不耗内力', 运功: '运功', 回内力: '回内力', 逃走: '逃走', 成功率: '成功率 {p}%',
    重手: '这一下打在要害上！', 挪移: '你用乾坤大挪移把劲力挪了回去，{a}自己受了 {n} 点伤。', 出招: '{a}使出「{m}」，{t}受了 {n} 点伤。', 落空: '{a}的「{m}」被{t}躲开了。',
    倒下: '{t}倒下了。', 冻住: '{t}被寒气冻住，动作慢了下来。', 反伤: '{a}自己也受了 {n} 点反震。', 毒发: '{t}毒发，掉了 {n} 点气血。', 被冻: '{a}浑身发僵，这一回合动不了。',
    运功回气: '{a}运功调息，内力回了 {n}。', 服药: '{a}服下{b}。', 逃脱: '你抽身就走，逃了出去。', 没逃掉: '你想走，被拦了回来。', 罢手: '斗了许久分不出胜负，双方各自罢手。',
    赢了: '你赢了。历练 +{n}，银两 +{s}。', 逃了: '你逃走了。', 不了了之: '这一架不了了之。', 战死: '你倒在了地上，再也没有起来。', 败了: '你被打倒了，醒来时浑身是伤，身上少了 {n} 两银子。', 战罢: '这一架打完了。',
    // v2.2：判定门槛、内伤、医馆、快马、打听
    门槛以上: '{k} {n} 以上', 门槛以下: '{k} {n} 以下', 内力不够: '内力不够（要 {n} 点）。', 花银两: '{n} 两', 花内力: '内力 {n}',
    医经治伤: '你照着胡青牛医经给自己配了一服药，内伤好了一层。', 内伤未愈: '内伤还有 {n} 层，住店养不好，要找医馆或者吃药。',
    没病: '大夫搭了搭脉：“你没病。”', 医馆治不了经脉: '大夫摇头：“经脉断了，我治不了。去找张真人那样的高人，或者天山雪莲、黑玉断续膏那样的奇药。”',
    看不起病: '看病要 {n} 两银子，你不够。', 看病: '你花 {n} 两请大夫扎了针、开了药。内伤好了一层，还有 {k} 层。',
    经脉好了: '你的经脉接上了，内力又能走满全身。', 易筋经治经脉: '易筋经练到第三层，断了的经脉自己接上了。', 伤重不能冒进: '内伤 {n} 层，再冒进就要出人命了。',
    马钱不够: '马钱加船钱要 {n} 两。', 骑马上路: '你在{a}雇了一匹快马，走了 {n} 天到了{b}。',
    打听到: '你在客店里花钱打听到：', 打听不起: '打听消息要 {n} 两银子。', 打听人: '你打听到，{a}眼下在{b}。', 没打听到: '你请人喝了几碗酒，听了一肚子闲话，没有什么用得上的。',
    人已故: '这里的人说，{a}已经不在人世了。', 人去了: '{a}不在这里了。听说去了{b}。', 人不在: '{a}不在这里了，没人知道去了哪里。',
  });

  /* ---------- 判定的档位 ----------
   * 事件里写 check: ['轻功', '难']。属性正好到档位的数值时成功率 50%，每差 1 点增减 step 个百分点。
   * 数值按 300 局试玩的属性分布定（tools/playtest.js 会打印分布）：中档约是普通玩家的中间水平。平衡改了就调这张表。 */
  QX.addChecks({
    资质: { 易: 38, 中: 48, 难: 58, 极难: 70, step: 2.5 },
    根骨: { 易: 14, 中: 22, 难: 32, 极难: 45, step: 2.5 },
    轻功: { 易: 10, 中: 15, 难: 21, 极难: 28, step: 3 },
  });

  /* ---------- 改命标记的说明（结局里“江湖因你而变”会列出来） ---------- */
  QX.addFlags({
    savedZhuang: '庄铮没有死在光明顶', miejueLives: '灭绝师太从万安寺塔上被救下，没有死', xiaozhaoStays: '小昭没有去波斯',
    yuCured: '俞岱岩二十年后重新站了起来', chengkunExposed: '你当着天下英雄揭穿了成昆', fakeBangzhu: '你揭穿了丐帮的假帮主',
    weiCured: '韦一笑的寒毒被治好了', zhuangWudang: '你在武当山下挡住了王府的人', yinliFace: '殷离的脸好了',
    servedWang: '你替汝阳王府办过事', robbedShaolin: '你夜闯过少林藏经阁', robbedQuanzhen: '你偷过重阳宫的经书', dugGrave: '你挖开过胡青牛的坟',
    knowXiaozhaoMother: '你知道了小昭和金花婆婆是母女', xzReunion: '小昭和她娘在灵蛇岛上相认了', xiaozhaoOwe: '你把乾坤大挪移的羊皮留给了小昭',
    weiOwe: '你割过自己的血给韦一笑', weiBlood: '韦一笑在你身边喝过人血', joinedZhu: '你送常遇春去了濠州投军', cycGrave: '你陪常遇春给胡青牛磕过头',
    yinliSearch: '殷离去找她的阿牛哥了', yinliStay: '殷离没有去找张无忌，留在了你身边', zmFollowHeart: '你劝赵敏跟着心走', zmStayWang: '你劝赵敏留在王府',
    zdCalm: '你在光明顶上拦住了周颠', zdLoud: '你陪周颠在光明顶上骂了杨逍一个时辰', fakeLoyal: '你在王府当差时放走过明教的信使', cylOwe: '你替陈友谅偷过打狗棒',
    znDefended: '你帮重阳宫挡过番僧', miejueFavor: '灭绝师太亲手教过你截手九式', emeiDoubt: '你当面跟灭绝师太说过要先问是非',
    sawXiexunMonk: '你在少林地牢前见过出家的谢逊', heardGuojing: '你听老叫化讲过郭大侠守襄阳', zhouFriend: '你和年少的周芷若在溪边说过话',
  });

  /* ---------- 结局：按品德分侠、魔，按信物多少写不同的话 ---------- */
  const comps = (g) => g.S.party.map((p) => g.name(p)).join('、');
  const n14 = (g) => g.relics();
  QX.addEndings([
    { id: 'xia14', kind: 'xia', cond: (g) => n14(g) >= 14, t: '侠之大者',
      text: (g) => '十四件信物都在你手里。你没有拿它们去号令天下。倚天剑送回峨嵋，屠龙刀沉进了东海，经书各归其主。' + (g.S.party.length ? comps(g) + '送你到山口。' : '') + '江湖上从此有一个传说，说有个无名小卒走遍了天下，最后什么也没留下，只留下一个名字：' + g.name + '。' },
    { id: 'xia8', kind: 'xia', cond: (g) => n14(g) >= 8, t: '一代大侠',
      text: (g) => '你收齐了 ' + n14(g) + ' 件信物，剩下的你不去争了。你在' + QX.LOCS[g.loc].short + '住了下来，有人来求，你就出手。' + (g.f('chengkunExposed') ? '少林屠狮大会上你说的那番话，江湖上一直有人提起。' : '') + '多年后，说书人讲到这一段，叫你“' + g.name + '大侠”。' },
    { id: 'xia0', kind: 'xia', t: '江湖好汉',
      text: (g) => '你没做成什么惊天动地的事，只收了 ' + n14(g) + ' 件信物。可你走过的地方，有人记得你帮过他们。' + (g.f('yuCured') ? '武当山上的俞三侠能下地走路了，每年都托人给你捎一坛酒。' : '') + '你回到了出发的地方，过了平平常常的后半生。' },
    { id: 'mo14', kind: 'mo', cond: (g) => n14(g) >= 14, t: '武林至尊',
      text: (g) => '十四件信物都在你手里。屠龙刀在左，倚天剑在右，九阴九阳都刻在你的骨头里。没有人再敢叫你的名字，他们叫你“魔头”。' + (g.S.party.length ? comps(g) + '还跟着你，' : '') + '你坐在高处，四下里很冷。' },
    { id: 'mo8', kind: 'mo', cond: (g) => n14(g) >= 8, t: '一方枭雄',
      text: (g) => '你手里有 ' + n14(g) + ' 件信物。正派的人恨你，邪派的人怕你。' + (g.f('servedWang') ? '汝阳王府给过你官做，你没要，你要的是江湖。' : '') + '你在山里建了一座庄子，门口挂着人头。后来的事，江湖上众说纷纭。' },
    { id: 'mo0', kind: 'mo', t: '江湖败类',
      text: (g) => '你只收了 ' + n14(g) + ' 件信物，名声却坏透了。走到哪里都有人认出你，背后啐一口。有一年冬天你在路边喝醉了，没有人扶你。' },
  ]);

  /* ---------- 通用的探索：哪里都可能碰上（explore: '*'） ---------- */
  QX.addEvents([
    { id: 'ex_silver', explore: '*', once: false, w: 2, t: '路边',
      text: (g) => g.pick(['你在草丛里踢到一个破钱袋。', '你在旧庙的供桌下摸到几块碎银子。', '河边石头缝里卡着一个小布包。']),
      choices: [
        { t: '收下', fx: (g) => g.add('银两', 6 + Math.round(g.rnd() * 10)), res: '你把银子揣进怀里。' },
        { t: '在原地等失主', fx: (g) => { g.add('品德', 2); g.days(2); if (g.rnd() < 0.5) { g.add('声望', 2); g.add('银两', 3); g.log('来了个哭哭啼啼的老汉，硬塞给你几文钱谢你。'); } else g.log('没有人来找。你把钱袋挂在路边的树杈上，留给它的主人。'); }, res: '你在原地等了两天。' },
      ] },
    { id: 'ex_herb', explore: '*', once: false, w: 2, t: '草药',
      text: '你在山坡上看见几株认得的草药。',
      choices: [
        { t: '采下来自己配药', check: ['资质', '易'], fx: (g) => g.give('jinchuang', 1), res: '你把草药捣碎，配成了一份金创药。', fail: { res: '你配错了方子，药都糟蹋了。' } },
        { t: '采了去卖钱', fx: (g) => g.add('银两', 5), res: '药铺收了，给了五两。' },
      ] },
    { id: 'ex_oldbeggar', explore: '*', once: false, w: 1, cond: (g) => g.st('银两') >= 3, t: '老乞丐',
      text: '一个老乞丐坐在墙根下，三天没吃饭了，伸手向你讨一口吃的。',
      choices: [
        { t: '给他三两银子', cost: { 银两: 3 }, fx: (g) => { g.add('品德', 3); if (g.rnd() < 0.25) { g.add('资质', 1); g.log('老乞丐吃饱了，跟你讲了半夜的呼吸吐纳。你好像懂了一点什么。'); } }, res: '老乞丐朝你作了个揖。' },
        { t: '摇摇头走开', res: '你走远了。他还坐在那里。' },
        { t: '踢翻他的破碗', fx: (g) => g.add('品德', -5), res: '旁边的人看你的眼神变了。' },
      ] },
    { id: 'ex_injured', explore: '*', once: false, w: 1, t: '受伤的人',
      text: '路边躺着一个受伤的行商，腿上中了一刀，身边的包袱还在。',
      choices: [
        { t: '用一份金创药救他', cond: (g) => g.has('jinchuang'), fx: (g) => { g.take('jinchuang', 1); g.add('品德', 4); g.add('声望', 2); g.add('银两', 8); }, res: '他醒过来，非要把几两银子塞给你。“恩人贵姓？”' },
        { t: '背他到镇上', fx: (g) => { g.days(2); g.add('品德', 3); g.add('根骨', 0.5); }, res: '你背着他走了两天。到了镇上，他的家人跪在地上给你磕头。' },
        { t: '拿走他的包袱', fx: (g) => { g.add('品德', -8); g.add('银两', 25); }, res: '包袱里有二十几两银子。你没有回头。' },
      ] },
    { id: 'ex_bandit', explore: '*', once: false, w: 1.5, cond: (g) => !g.at('binghuo'), t: '强人',
      text: (g) => g.pick(['林子里窜出几个拿刀的汉子：“留下买路钱！”', '几个蒙面人围了上来，看样子盯你很久了。']),
      choices: [
        { t: '拔刀相向', fight: { foes: ['shanzei', 'shanzei'], win: { fx: (g) => g.add('声望', 2), res: '强人跑了，扔下了几两银子。' }, lose: { res: '你被打晕了，醒来时钱袋空了一半。' } } },
        { t: '交出一半银两', fx: (g) => g.add('银两', -Math.round(g.money() / 2)), res: '他们拿了钱，骂骂咧咧地走了。' },
        { t: '撒腿就跑', check: ['轻功', '易'], res: '你跑得比他们快。', fail: { fx: (g) => { g.hurt(30); g.add('银两', -Math.round(g.money() / 3)); }, res: '你没跑掉，挨了几刀，钱也被抢了。' } },
      ] },
    { id: 'ex_yuanbing', explore: '*', once: false, w: 1.5, cond: (g) => ['xiangyang', 'dadu', 'lintan', 'dali', 'shaolin'].includes(g.loc), t: '元兵',
      text: '几个元兵在街上抢一个老汉的鸡，老汉跪在地上求，被一脚踹开。',
      choices: [
        { t: '上前打抱不平', fight: { foes: ['yuanbing', 'yuanbing'], win: { fx: (g) => { g.add('品德', 4); g.add('声望', 4); }, res: '元兵抱着头跑了。老汉拉着你的手不放。' }, lose: { fx: (g) => g.add('品德', 2), res: '你被打得鼻青脸肿，老汉哭着给你上药。' } } },
        { t: '塞几两银子给元兵，求他们放过老汉', cost: { 银两: 5 }, fx: (g) => g.add('品德', 2), res: '元兵收了钱，把鸡也拎走了。老汉总算没再挨打。' },
        { t: '低头走开', res: '你走开了。身后传来老汉的哭声。' },
      ] },
    { id: 'ex_wolf', explore: '*', once: false, w: 1, cond: (g) => ['hudie', 'guangming', 'zhongnan', 'wudang', 'emei'].includes(g.loc), t: '狼',
      text: '天快黑了，林子里亮起几对绿眼睛。',
      choices: [
        { t: '背靠大树，跟它们拼', fight: { foes: ['lang', 'lang', 'lang'], win: { fx: (g) => g.add('银两', 8), res: '你剥了狼皮，拿到镇上卖了几两银子。' }, lose: { res: '你爬上了树，等到天亮才敢下来，身上全是牙印。' } } },
        { t: '点一把火，慢慢退走', check: ['资质', '易'], res: '狼怕火，没敢跟上来。', fail: { fx: (g) => g.hurt(25), res: '火把灭了，你被咬了一口才逃掉。' } },
      ] },
    { id: 'ex_view', explore: '*', once: false, w: 1, t: '登高',
      text: (g) => g.pick(['你爬到山顶，看了一夜的星星。', '你在溪边坐了半天，看鱼游来游去。', '你在破庙里躲了一夜的雨，听了一夜的雨声。']),
      choices: [
        { t: '静下心来想想练过的功夫', fx: (g) => { g.add('资质', 0.5); g.restMp(30); }, res: '有几处想不通的地方，好像通了。' },
        { t: '想想往后的路', fx: (g) => { g.add('品德', 1); }, res: '你想起了出门时说过的话。' },
      ] },
  ]);

  /* ---------- 路上的遭遇（road: true） ---------- */
  QX.addEvents([
    { id: 'rd_bandit', road: true, once: false, w: 3, t: '半路劫道',
      text: '山道拐弯处横着一棵树，树后站起来一伙强人。领头的扛着一把鬼头刀。',
      choices: [
        { t: '动手', fight: { foes: ['zeitou', 'shanzei'], win: { fx: (g) => { g.add('声望', 3); g.add('品德', 1); }, res: '你打跑了这伙强人，附近的村子请你吃了一顿饭。' }, lose: { res: '你被打倒在路边，过路的货郎把你扶上了车。' } } },
        { t: '交钱', fx: (g) => g.add('银两', -Math.round(g.money() * 0.4)), res: '你交了钱，他们让开了路。' },
        { t: '绕小路走', fx: (g) => g.days(4), res: '你多走了四天山路，鞋都磨破了。' },
      ] },
    { id: 'rd_refugee', road: true, once: false, w: 2, t: '流民',
      text: '路上全是逃荒的人，拖儿带女。一个妇人抱着孩子，孩子已经哭不出声了。',
      choices: [
        { t: '分一半银两给他们', cond: (g) => g.money() >= 4, fx: (g) => { g.add('银两', -Math.round(g.money() / 2)); g.add('品德', 6); g.add('声望', 1); }, res: '你把钱分了。那个妇人跪下来，你没让她跪。' },
        { t: '把干粮给那个孩子', fx: (g) => { g.add('品德', 3); g.hurt(10); }, res: '你饿了一天的肚子。孩子吃饱了，冲你笑了一下。' },
        { t: '加快脚步走过去', res: '你走过去了。' },
      ] },
    { id: 'rd_peddler', road: true, once: false, w: 2, t: '货郎',
      text: '一个挑担子的货郎跟你同路，担子里有药。',
      choices: [
        { t: '买两份金创药（15 两）', cost: { 银两: 15 }, fx: (g) => g.give('jinchuang', 2), res: '货郎算你便宜了几文。' },
        { t: '跟他聊一路江湖传闻', fx: (g) => g.add('声望', 1), res: '他说了一路，哪里有高人，哪里出了怪事。' },
      ] },
    { id: 'rd_rain', road: true, once: false, w: 1.5, t: '大雨',
      text: '连下了三天的大雨，河水涨了，渡船不开。',
      choices: [
        { t: '在河边的小庙里等', fx: (g) => { g.days(4); g.restMp(50); }, res: '你在庙里打坐了几天，雨停了。' },
        { t: '冒雨蹚水过河', check: ['根骨', '易'], res: '水没到胸口，你还是过去了。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '你被冲出去老远，呛了好几口水，着了凉。' } },
      ] },
    { id: 'rd_duel', road: true, once: false, w: 1.5, t: '比武',
      text: '路边茶棚里，一个背剑的年轻人盯着你看了半天，起身拱手：“看兄台也是练家子，切磋几招？”',
      choices: [
        { t: '点到为止', fight: { foes: ['jianke'], win: { fx: (g) => { g.add('声望', 4); }, res: '他收剑认输，请你喝了一碗茶，说要回去再练三年。' }, lose: { res: '他的剑在你喉咙前停住了。“承让。”' } } },
        { t: '推说身上有伤', res: '他有点失望，自顾自喝茶去了。' },
      ] },
    { id: 'rd_yuan', road: true, once: false, w: 2, cond: (g) => !g.f('servedWang'), t: '关卡',
      text: '官道上设了卡，元兵挨个搜身，说是在拿明教的反贼。',
      choices: [
        { t: '老老实实让他们搜', fx: (g) => g.add('银两', -Math.round(g.money() * 0.2)), res: '他们搜走了你一些银子，挥手让你过去了。' },
        { t: '闯过去', fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.add('声望', 5); g.add('品德', 2); }, res: '你闯过了关卡。这事传开了，说有个年轻人一个人打翻了一队元兵。' }, lose: { res: '你被元兵打了一顿，扔在了路边。' } } },
        { t: '绕远路', fx: (g) => g.days(5), res: '你多走了五天。' },
      ] },
  ]);
})();

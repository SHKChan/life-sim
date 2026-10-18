/* 江湖一梦 · 共用世界数据：年代、地点、年度重心、人生关口、共用人物、通用奇遇与闲笔 */
(function () {
  'use strict';
  const JY = window.JY;

  /* ---------- 年代：江湖纪年 1 年 = 郭靖出生那年 ---------- */
  JY.ERAS = [
    [34, '南宋 · 金国'],
    [76, '南宋 · 蒙古'],
    [143, '元'],
    [9999, '明'],
  ];

  /* ---------- 地点（scene 对应 js/pixel.js 里的场景画法） ---------- */
  JY.addLocs({
    niujia: { name: '临安牛家村', scene: 'village', desc: '一个江南小村' },
    grassland: { name: '蒙古草原', scene: 'grassland', desc: '一座蒙古包' },
    zhongdu: { name: '金国中都 · 赵王府', scene: 'palace', desc: '雕梁画栋的王府' },
    jiangnan: { name: '江南', scene: 'watertown', desc: '小桥流水' },
    jiaxing: { name: '嘉兴', scene: 'watertown', desc: '南湖烟雨楼' },
    zhangjiakou: { name: '张家口', scene: 'town', desc: '塞外边城' },
    taohua: { name: '东海桃花岛', scene: 'peach', desc: '落英缤纷' },
    guiyun: { name: '太湖归云庄', scene: 'lake', desc: '湖边庄园' },
    sea: { name: '东海', scene: 'sea', desc: '一条大船' },
    tiezhang: { name: '铁掌峰', scene: 'peaks', desc: '五指形的山峰' },
    yideng: { name: '大理 · 一灯隐居处', scene: 'waterfall', desc: '瀑布与禅院' },
    huashan: { name: '华山', scene: 'peaks', desc: '绝顶积雪' },
    zhongnan: { name: '终南山 · 全真教', scene: 'temple', desc: '重阳宫' },
    gumu: { name: '终南山 · 活死人墓', scene: 'tomb', desc: '古墓石门' },
    xiangyang: { name: '襄阳', scene: 'citywall', desc: '城头飘着宋旗' },
    jueqing: { name: '绝情谷', scene: 'valley', desc: '满谷情花' },
    jianzhong: { name: '襄阳郊外 · 剑冢', scene: 'cliff', desc: '深山绝壁' },
    westlands: { name: '西域 · 撒麻尔罕', scene: 'desert', desc: '黄沙与城堡' },
    shaolin: { name: '嵩山少林寺', scene: 'temple', desc: '千年古刹' },
    wudang: { name: '武当山', scene: 'temple', desc: '真武大殿' },
    emei: { name: '峨嵋山', scene: 'peaks', desc: '金顶云海' },
    fenglingdu: { name: '风陵渡', scene: 'river', desc: '黄河渡口' },
    binghuo: { name: '北海冰火岛', scene: 'icefire', desc: '冰原与火山' },
    wangpan: { name: '王盘山岛', scene: 'sea', desc: '海上孤岛' },
    kunlun: { name: '昆仑山 · 无名山谷', scene: 'valley', desc: '与世隔绝的山谷' },
    hudie: { name: '蝴蝶谷', scene: 'valley', desc: '满谷蝴蝶' },
    guangming: { name: '昆仑山 · 光明顶', scene: 'peaks', desc: '明教总坛' },
    dadu: { name: '大都', scene: 'palace', desc: '元朝都城' },
    lingshe: { name: '灵蛇岛', scene: 'sea', desc: '海上蛇岛' },
    haozhou: { name: '濠州', scene: 'town', desc: '义军城池' },
    hanshui: { name: '汉水', scene: 'river', desc: '江上小船' },
    baihua: { name: '百花谷', scene: 'valley', desc: '花开遍谷' },
    road: { name: '江湖路上', scene: 'road', desc: '一条官道' },
    hut: { name: '山野草庐', scene: 'village', desc: '几间草屋' },
    lintan: { name: '临安', scene: 'watertown', desc: '南宋都城' },
  });

  /* ---------- 年度重心 ---------- */
  JY.FOCUS = [
    { name: '襁褓', minAge: 0, maxAge: 5, d: '还小，由大人照看。性情在这几年慢慢定下来。', fx: (g) => { g.stat('心境', 1); if (g.rnd() < 0.3) g.stat('根骨', 1); } },
    { name: '读书识字', minAge: 6, maxAge: 15, d: '悟性慢慢长。', fx: (g) => { g.stat('悟性', 2); } },
    { name: '打熬筋骨', minAge: 6, maxAge: 15, d: '根骨和武学打底子。', fx: (g) => { g.stat('根骨', 1); g.stat('武学', 1); if (g.rnd() < 0.5) g.stat('武学', 1); } },
    { name: '玩耍交友', minAge: 6, maxAge: 15, d: '情义、心境。', fx: (g) => { g.stat('情义', 2); g.stat('心境', 1); } },
    { name: '帮衬家里', minAge: 6, maxAge: 15, d: '情义；人会早熟一些。', fx: (g) => { g.stat('情义', 1); g.stat('悟性', 1); } },
    { name: '闭关练功', minAge: 16, d: '武学涨得最快，心境会闷。', fx: (g) => { g.stat('武学', 2); if (g.rnd() < g.s('悟性') / 120) g.stat('武学', 1); if (g.rnd() < 0.3) g.stat('心境', -1); } },
    { name: '读书参悟', minAge: 16, d: '悟性；悟性高时武学也会涨。', fx: (g) => { g.stat('悟性', 1); if (g.rnd() < g.s('悟性') / 140) g.stat('武学', 1); } },
    { name: '行走江湖', minAge: 16, d: '声望、奇遇多，也容易受伤。', fx: (g) => { g.stat('声望', 2); if (g.rnd() < 0.5) g.stat('武学', 1); if (g.rnd() < 0.18) g.stat('根骨', -2); } },
    { name: '行侠仗义', minAge: 16, d: '正气、声望；常常受伤。', fx: (g) => { g.stat('正邪', 2); g.stat('声望', 1); if (g.rnd() < 0.25) g.stat('根骨', -2); } },
    { name: '儿女情长', minAge: 16, d: '情义、心境。', fx: (g) => { g.stat('情义', 2); g.stat('心境', 1); } },
    { name: '经营门派', minAge: 25, d: '声望、情义；武学停滞。', fx: (g) => { g.stat('声望', 2); g.stat('情义', 1); } },
    { name: '养伤修心', minAge: 16, d: '根骨、心境回升。', fx: (g) => { g.stat('根骨', 2); g.stat('心境', 1); } },
  ];

  /* ---------- 人生关口：15、30、50、70 岁 ----------
   * 答案写进名帖（志向、心结、心愿、遗愿），并记在这一世里，下一个关口会接着问。 */
  const AIM = { top: '天下第一的高手', good: '一个对得起良心的人', love: '和喜欢的人过一辈子', none: '' };
  JY.PAUSES = [
    { id: 'p15', age: 15, t: '十五岁', ask: '你想成为什么样的人？', text: '你十五岁了。你想成为什么样的人？', choices: [
      { t: '天下第一的高手', canon: true, fx: (g) => { g.info('志向', '天下第一'); g.stat('武学', 2); g.remember('aim', 'top'); } },
      { t: '一个对得起良心的人', canon: true, fx: (g) => { g.info('志向', '对得起良心'); g.stat('正邪', 5); g.remember('aim', 'good'); } },
      { t: '和喜欢的人过一辈子', canon: true, fx: (g) => { g.info('志向', '和喜欢的人过一辈子'); g.stat('情义', 3); g.remember('aim', 'love'); } },
      { t: '还没想过', canon: true, fx: (g) => { g.info('志向', '还没想过'); g.stat('心境', 3); g.remember('aim', 'none'); } },
    ] },
    { id: 'p30', age: 30, t: '三十岁', ask: '最放不下的是什么？',
      text: (g) => {
        const a = AIM[g.recall('aim')];
        const back = a ? '十五岁时，你想做' + a + '。' + (g.recall('aim') === 'top' ? (g.s('武学') >= 70 ? '如今江湖上已经很少有人是你的对手。' : '如今你知道了天外有天。') : g.recall('aim') === 'good' ? (g.s('正邪') >= 30 ? '这些年，你大体做到了。' : '这些年，你做过几件不敢回想的事。') : (g.s('情义') >= 70 ? '你身边有了放不下的人。' : '那个人还没有出现，或者已经走了。')) : '';
        return back + '三十而立。回头看这十五年，你最放不下的是什么？';
      }, choices: [
      { t: '一个人', canon: true, fx: (g) => { g.stat('情义', 3); g.info('心结', '一个人'); g.remember('knot', 'person'); } },
      { t: '一桩仇', canon: true, fx: (g) => { g.stat('正邪', -3); g.info('心结', '一桩仇'); g.remember('knot', 'feud'); } },
      { t: '一门没练成的功夫', canon: true, fx: (g) => { g.stat('武学', 2); g.info('心结', '没练成的功夫'); g.remember('knot', 'art'); } },
      { t: '没有放不下的', canon: true, fx: (g) => { g.stat('心境', 5); g.remember('knot', 'none'); } },
    ] },
    { id: 'p50', age: 50, t: '五十岁', ask: '希望江湖上怎么说你？',
      text: (g) => {
        const k = g.recall('knot');
        const back = k === 'person' ? '三十岁时你放不下一个人。二十年过去，' + (g.s('情义') >= 60 ? '那个人还在你心里。' : '你已经很少想起了。')
          : k === 'feud' ? '三十岁时你放不下一桩仇。二十年过去，' + (g.s('正邪') < 0 ? '那桩仇把你变成了另一个人。' : '你不再天天想着它。')
          : k === 'art' ? '三十岁时你放不下一门功夫。' + (g.s('武学') >= 75 ? '如今它已经成了。' : '如今它还是没成，大概这辈子也成不了。')
          : '';
        return back + '五十知天命。江湖上的人说起你，你希望他们说什么？';
      }, choices: [
      { t: '“是个好人。”', canon: true, fx: (g) => { g.stat('正邪', 3); g.info('心愿', '做个好人'); g.remember('fame', 'good'); } },
      { t: '“很能打。”', canon: true, fx: (g) => { g.stat('声望', 3); g.info('心愿', '武功留名'); g.remember('fame', 'strong'); } },
      { t: '“对得起朋友。”', canon: true, fx: (g) => { g.stat('情义', 3); g.info('心愿', '对得起朋友'); g.remember('fame', 'friend'); } },
      { t: '“那是谁？”', canon: true, fx: (g) => { g.stat('心境', 5); g.info('心愿', '不留名'); g.remember('fame', 'none'); } },
    ] },
    { id: 'p70', age: 70, t: '七十岁', ask: '如果能重来，回到哪一年？',
      text: (g) => {
        const f = g.recall('fame');
        const said = f === 'good' ? (g.s('正邪') >= 30 ? '江湖上说起你，都说是个好人。' : '江湖上说起你，好话不多。')
          : f === 'strong' ? (g.s('声望') >= 60 ? '江湖上说起你，先说你的武功。' : '江湖上已经没几个人记得你的武功。')
          : f === 'friend' ? (g.s('情义') >= 60 ? '你的朋友们，都说你够朋友。' : '你的朋友们，大多已经不在了。')
          : f === 'none' ? '江湖上已经没有人提起你，正合你意。' : '';
        return said + '人生七十古来稀。如果能回到某一年重来一次，你选哪一年？';
      }, choices: [
      { t: '十几岁，什么都还没发生的时候', canon: true, fx: (g) => g.info('遗愿', '回到少年时') },
      { t: '那个改变了一切的晚上', canon: true, fx: (g) => g.info('遗愿', '回到那个晚上') },
      { t: '回到某个人还活着的那一年', canon: true, fx: (g) => { g.stat('情义', 3); g.info('遗愿', '再见那个人一面'); } },
      { t: '不回去了，这一生就这样', canon: true, fx: (g) => g.stat('心境', 5) },
    ] },
  ];

  /* ---------- 槽位：原定的人不在，就由合适的人顶上 ---------- */
  JY.addSlots({
    '至尊': (g) => '屠龙刀',
    '丐帮帮主': (g) => {
      const Y = g.Y;
      if (Y < 20) return g.alive('hongqigong') ? '洪七公' : '鲁有脚';
      if (Y < 45 && g.alive('huangrong') && !g.f('jingrongApart')) return '黄蓉';
      if (Y < 100) return '鲁有脚的传人';
      return '史火龙';
    },
    '襄阳守将': (g) => (g.alive('guojing') && !g.f('jingStayMongol') && !g.f('guoLeftXiangyang') ? '郭靖' : '吕文焕'),
    '南帝': (g) => (g.alive('yideng') ? '一灯大师' : '一灯大师的弟子朱子柳'),
  });

  /* ---------- 改命标记的说明（用于“江湖因你而变”） ---------- */
  JY.addFlags({
    // 射雕
    jingStayMongol: '郭靖留在蒙古做了金刀驸马',
    jingrongApart: '郭靖和黄蓉没有走到一起',
    rongDied: '黄蓉死于铁掌之伤',
    yangkangLives: '杨康没有死在铁枪庙',
    yangkangTurned: '杨康认了生父，离开了金国',
    yangkangMarried: '杨康娶了穆念慈',
    qiguaiSaved: '江南五怪没有死在桃花岛',
    meiLives: '梅超风没有死',
    ouyangkeLives: '欧阳克没有死在杨康手里',
    lipingLives: '李萍没有在蒙古军营里自尽',
    tiexinLives: '杨铁心、包惜弱夫妇活了下来',
    munianciLives: '穆念慈没有早逝',
    // 神雕
    yangNoTomb: '杨过没有进古墓',
    yangArm: '杨过没有断臂',
    reunionEarly: '杨过和小龙女没有等满十六年',
    longStayed: '小龙女没有跳下断肠崖',
    yangKeepsSword: '玄铁重剑跟着杨过回了古墓',
    guoxiangNeedle: '郭襄留下了最后一枚金针',
    guoSurvive: '郭靖、黄蓉活着离开了襄阳',
    guoLeftXiangyang: '郭靖没有守襄阳',
    noBladeSecrets: '倚天剑、屠龙刀里没有藏东西',
    limochouLives: '李莫愁没有葬身情花火海',
    emeiLate: '峨嵋派晚立了二十年',
    jiuyangLost: '峨嵋九阳功失传',
    guofuGentle: '郭芙没有斩断杨过的手臂',
    // 倚天
    wujiNoJiuyang: '张无忌没有练九阳神功',
    mingjiaoCrushed: '明教在光明顶几乎被灭',
    miejueLives: '灭绝师太没有在万安寺跳塔',
    zhouMarried: '张无忌娶了周芷若',
    zhaominHome: '赵敏回到了蒙古',
    noWanan: '万安寺之围没有发生',
    mingjiaoKept: '张无忌没有让出明教教主之位',
    cuishanLives: '张翠山、殷素素没有在武当山自尽',
    zhouNoOath: '周芷若没有在万安寺发毒誓',
  });

  /* ---------- 共用人物（三部书都会出现的人） ---------- */
  JY.addChars([
    { id: 'hongqigong', name: '洪七公', book: '射雕英雄传', sex: '男', born: -35, origin: '丐帮帮主，人称北丐',
      death: (g) => ({ y: 38, cause: '在华山绝顶与欧阳锋比拼一夜，相拥大笑而逝' }),
      ms: [[-20, '丐帮帮主'], [-25, '第一次华山论剑，号称北丐'], [19, '收郭靖为徒，传降龙十八掌', (g) => !g.f('jingrongApart')], [19, '把丐帮帮主之位传给黄蓉', (g) => !g.f('jingrongApart') && !g.f('rongDied')], [22, '第二次华山论剑'], [30, '云游四方，四处找好吃的']] },
    { id: 'huangyaoshi', name: '黄药师', book: '射雕英雄传', sex: '男', born: -34, origin: '桃花岛主，人称东邪',
      death: { y: 72, cause: '在桃花岛去世' },
      ms: [[-25, '第一次华山论剑，号称东邪'], [4, '妻子冯蘅生下黄蓉后去世，从此隐居桃花岛'], [19, '桃花岛招亲'], [22, '第二次华山论剑'], [57, '第三次华山论剑，仍是东邪']] },
    { id: 'ouyangfeng', name: '欧阳锋', book: '射雕英雄传', sex: '男', born: -32, origin: '白驼山主，人称西毒',
      death: { y: 38, cause: '在华山绝顶与洪七公比拼一夜，相拥大笑而逝' },
      ms: [[-25, '第一次华山论剑，号称西毒'], [-24, '诈死时被王重阳一阳指所伤'], [19, '在铁枪庙杀了江南五怪'], [22, '练《九阴真经》练疯了'], [33, '在嘉兴认杨过做干儿子']] },
    { id: 'yideng', name: '一灯大师', book: '射雕英雄传', sex: '男', born: -36, origin: '大理皇帝段智兴，人称南帝',
      death: { y: 62, cause: '在百花谷圆寂' },
      ms: [[-25, '第一次华山论剑，号称南帝'], [-14, '没救瑛姑的孩子，出家为僧'], [19, '以一阳指救了黄蓉', (g) => !g.f('rongDied') && !g.f('jingrongApart')], [57, '第三次华山论剑，号称南僧']] },
    { id: 'zhoubotong', name: '周伯通', book: '射雕英雄传', sex: '男', born: -33, origin: '全真教主王重阳的师弟，人称老顽童',
      death: { y: 74, cause: '在百花谷无疾而终' },
      ms: [[-15, '和瑛姑生了一个孩子'], [4, '被黄药师困在桃花岛'], [19, '把左右互搏和空明拳教给了郭靖'], [57, '第三次华山论剑，号称中顽童'], [58, '与瑛姑、一灯在百花谷养蜂']] },
    { id: 'yinggu', name: '瑛姑', book: '射雕英雄传', sex: '女', born: -28, origin: '大理段皇爷的刘贵妃',
      death: { y: 66, cause: '在百花谷去世' },
      ms: [[-15, '孩子被裘千仞打伤，死在她怀里'], [-12, '在黑沼隐居，研习算学'], [58, '与周伯通在百花谷相守']] },
    { id: 'qiuchuji', name: '丘处机', book: '射雕英雄传', sex: '男', born: -38, origin: '全真七子之一，长春子',
      death: { y: 25, cause: '病逝于燕京长春宫' },
      ms: [[0, '在牛家村结识郭啸天、杨铁心'], [1, '与江南七怪立下十八年之约'], [18, '嘉兴烟雨楼赴约'], [21, '随成吉思汗西行']] },
    { id: 'chengjisihan', name: '成吉思汗', book: '射雕英雄传', sex: '男', born: -37, origin: '蒙古大汗铁木真',
      death: { y: 23, cause: '病逝于西征归途，临终问郭靖什么是英雄' },
      ms: [[6, '在草原上与王罕、桑昆争雄'], [12, '统一蒙古草原，称成吉思汗'], [18, '封郭靖为金刀驸马'], [20, '大军西征花剌子模']] },
    { id: 'kezhene', name: '柯镇恶', book: '射雕英雄传', sex: '男', born: -30, origin: '江南七怪之首，飞天蝙蝠',
      death: { y: 52, cause: '在嘉兴老家寿终' },
      ms: [[6, '在大漠找到郭靖，开始教他武功'], [18, '嘉兴烟雨楼赴约'], [19, '五个兄弟死在桃花岛，只剩他一个', (g) => !g.f('qiguaiSaved')], [33, '在嘉兴遇到小杨过']] },
    { id: 'zhangsanfeng', name: '张三丰', book: '倚天屠龙记', sex: '男', born: 44, origin: '少林寺觉远的徒弟张君宝',
      death: { y: 152, cause: '在武当山羽化，享年一百零八岁' },
      ms: [[57, '跟着觉远上华山，见到神雕大侠杨过'], [60, '被逐出少林，流落武当山'], [70, '在武当山自创太极'], [80, '开创武当派'], [124, '八十大寿'], [134, '武当派已是天下第一大派']] },
    { id: 'jueyuan', name: '觉远', book: '神雕侠侣', sex: '男', born: -20, origin: '少林藏经阁的书呆子和尚',
      death: { y: 60, cause: '在少林寺后山圆寂，临终念出《九阳真经》' },
      ms: [[40, '在藏经阁管书'], [57, '去华山找偷经的潇湘子'], [60, '为护经与少林反目']] },
    { id: 'fengling', name: '风陵师太', book: '倚天屠龙记', sex: '女', born: 66, origin: '郭襄的弟子', minor: true,
      death: { y: 120, cause: '在峨嵋金顶坐化' },
      ms: [[85, '拜在郭襄门下'], [110, '接任峨嵋掌门']] },
  ]);

  /* ---------- 大势：朝代更替不可改 ---------- */
  JY.addEvents([
    { y: 12, t: '铁木真统一蒙古草原，各部尊他为成吉思汗。' },
    { y: 35, t: '蒙古联宋灭金。金哀宗自缢，金国亡。' },
    { y: 36, t: '蒙古与南宋翻脸，兵锋转向江南。' },
    { y: 71, t: (g) => '襄阳城破。' + (g.f('guoSurvive') ? '郭靖、黄蓉没有死在城里，有人说是神雕大侠把他们带走的。' : '守城三十余年的郭靖、黄蓉夫妇殉城。') },
    { y: 77, t: '崖山海战，陆秀夫背着小皇帝投海。南宋亡，元朝一统天下。' },
    { y: 128, t: '黄河决口，民不聊生。各地明教教众揭竿而起。' },
    { y: 144, t: '朱元璋称帝，国号大明。元顺帝退回漠北。' },
  ]);

  /* ---------- 通用奇遇（任何人物都可能碰上） ----------
   * 选择用 g.remember 记在这一世里，几年后由下面的“回响”奇遇读到。
   * 回响是自动节点（auto + always），条件满足就会出现，让玩家看到当年那一下的后果。 */
  const isMale = (g) => g.me && JY.byId[g.me] && JY.byId[g.me].sex === '男';
  // 这些通用奇遇只在人间烟火处发生：古墓、海岛、冰火岛、昆仑山谷里碰不到；集市上的事只在城镇和路上
  const SECLUDED = ['gumu', 'binghuo', 'kunlun', 'taohua', 'sea', 'wangpan', 'lingshe'];
  const TOWNS = ['niujia', 'jiangnan', 'jiaxing', 'guiyun', 'lintan', 'zhongdu', 'zhangjiakou', 'dadu', 'fenglingdu', 'haozhou', 'xiangyang', 'hanshui', 'road', 'hut'];
  const outside = (g) => !SECLUDED.includes(g.loc);
  const inTown = (g) => TOWNS.includes(g.loc);
  JY.addEncounters([
    { id: 'e_jianghu_bandit', y: [-50, 200], minAge: 16, cond: (g) => inTown(g) && !['lintan', 'zhongdu', 'dadu', 'xiangyang'].includes(g.loc), t: '拦路', text: '山道上跳出几个强人，要你留下买路钱。领头的脸上有道疤，手里的刀豁了口。',
      choices: [
        { t: '给钱了事', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('bandit', 'paid'); }, res: '强人数着钱走了。领头的多看了你一眼，说你是个爽快人。' },
        { t: '动手', check: ['武学', 30], dev: 0, fx: (g) => { g.stat('声望', 3); g.stat('正邪', 2); g.remember('bandit', 'beaten'); }, res: '他们跑得比来的时候快。领头的回头看了你一眼，像是要记住你的脸。',
          fail: { fx: (g) => { g.stat('根骨', -8); g.remember('bandit', 'paid'); }, res: '你挨了一刀，钱也没保住。', dev: 0 } },
        { t: '打服他们，写封荐书让他们去投军', check: ['声望', 40], dev: 0, fx: (g) => { g.stat('声望', 5); g.stat('正邪', 4); g.remember('bandit', 'army'); }, res: '领头的跪下叫你大哥，揣着你的荐书往边关去了。',
          fail: { fx: (g) => { g.stat('根骨', -5); g.remember('bandit', 'beaten'); }, res: '他们不服，一哄而散，临走还砍了你一刀。', dev: 0 } },
      ] },
    { id: 'e_tavern_duel', y: [-50, 200], minAge: 16, cond: inTown, t: '酒楼比武', text: '酒楼上两个人争一个座位，眼看要拔刀。整层楼的人都看着你，因为那个座位是你的。',
      choices: [
        { t: '让给他们', canon: true, fx: (g) => g.stat('心境', 2), res: '你换了张桌子，菜一样好吃。' },
        { t: '一人一拳，打下楼去', check: ['武学', 45], dev: 0, fx: (g) => { g.stat('声望', 4); g.remember('tavern', 'fought'); }, res: '楼下的人以为下了一场人雨。其中一个人爬起来，袖口绣着帮派的记号。',
          fail: { fx: (g) => g.stat('根骨', -5), res: '他们先联手把你打下了楼。', dev: 0 } },
        { t: '请他们一起坐，再叫一坛酒', dev: 0, fx: (g) => { g.stat('情义', 4); g.stat('心境', 2); g.remember('tavern', 'drink'); }, res: '三个人喝到半夜。走的时候，他们争着替你付账，还问了你的名字。' },
      ] },
    { id: 'e_sick_child', y: [-50, 200], minAge: 16, cond: inTown, t: '病童', text: '路边一个妇人抱着发高烧的孩子，求过路的人给几个钱抓药。孩子的脸烧得通红。',
      choices: [
        { t: '把身上的钱都给她', canon: true, fx: (g) => { g.stat('正邪', 3); g.stat('情义', 2); g.remember('child', 'money'); }, res: '她磕了三个头，问你叫什么。你没说。' },
        { t: '背着孩子去最近的镇上找郎中', dev: 0, fx: (g) => { g.stat('根骨', -2); g.stat('情义', 4); g.remember('child', 'carried'); }, res: '你跑了二十里路。郎中说再晚一个时辰就救不回来了。孩子醒来，盯着你看了很久。' },
        { t: '赶路要紧', dev: 0, fx: (g) => { g.stat('心境', -3); g.remember('child', 'left'); }, res: '你走出很远，还能听见孩子的哭声。' },
      ] },
    { id: 'e_old_book', y: [-50, 200], minAge: 12, cond: inTown, t: '旧书摊', text: '旧书摊上有一本没有封皮的拳谱，摊主说是从一个死去的老镖师家里收来的。',
      choices: [
        { t: '买下来', canon: true, fx: (g) => { g.stat('悟性', 2); g.remember('book', 'bought'); }, res: '书里有几页被人用朱笔圈过。你看不懂，先收着。' },
        { t: '不买', canon: true, res: '摊主说你会后悔的。' },
        { t: '打听老镖师的家人，把书还回去', dev: 0, fx: (g) => { g.stat('情义', 4); g.stat('正邪', 3); g.remember('book', 'returned'); }, res: '老镖师的孙子接过书，说这是爷爷一辈子的心血。他记下了你的名字。' },
      ] },
    { id: 'e_mongol_patrol', y: [30, 143], minAge: 14, cond: (g) => outside(g) && !['grassland', 'dadu'].includes(g.loc) && !g.isMe('zhaomin'), t: '蒙古游骑', text: '一队蒙古游骑冲进了村子，要抓壮丁。',
      choices: [
        { t: '带着村民往山里跑', canon: true, fx: (g) => { g.stat('情义', 3); g.stat('根骨', -2); g.remember('patrol', 'fled'); }, res: '你们在山里躲了三天。回去时，村子只剩下一半。' },
        { t: '截住他们', check: ['武学', 55], dev: 0, fx: (g) => { g.stat('声望', 5); g.stat('正邪', 4); g.remember('patrol', 'fought'); }, res: '游骑跑了，丢下了两匹马。百夫长逃走前，让画师记下了你的样子。',
          fail: { fx: (g) => g.stat('根骨', -12), res: '你被射了一箭，躺了一个月。', dev: 0 } },
        { t: '夜里摸进营地，放走抓去的人', check: ['武学', 45], dev: 0, fx: (g) => { g.stat('正邪', 5); g.stat('声望', 3); g.remember('patrol', 'freed'); }, res: '天亮时营地里只剩下一地绳子。被你放走的人里，有个少年一直回头看你。',
          fail: { fx: (g) => g.stat('根骨', -10), res: '你被发现了，翻墙逃走时摔伤了腿。', dev: 0 } },
      ] },
    { id: 'e_flood', y: [-50, 200], minAge: 10, cond: inTown, t: '大水', text: '连下了一个月的雨，河堤要垮了。',
      choices: [
        { t: '去堤上扛沙袋', canon: true, fx: (g) => { g.stat('根骨', -2); g.stat('情义', 3); g.stat('正邪', 2); g.remember('flood', 'dike'); }, res: '堤保住了。你的肩膀疼了半年。' },
        { t: '收拾细软，先走', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('flood', 'fled'); }, res: '你走的时候，邻居们还在堤上。' },
        { t: '去县衙敲鼓，逼官府开仓放粮', check: ['声望', 45], dev: 0, fx: (g) => { g.stat('正邪', 4); g.stat('声望', 4); g.remember('flood', 'granary'); }, res: '县官被你堵在门口，只好开了仓。他临走看你的眼神，你记得。',
          fail: { fx: (g) => g.stat('心境', -4), res: '衙役把你轰了出来。仓到底没开。', dev: 0 } },
      ] },
    { id: 'e_beggar_teacher', y: [-50, 200], minAge: 8, maxAge: 30, cond: inTown, t: '老叫化', text: '一个老叫化子跟了你三条街，说你骨骼清奇，要教你一套“打狗”的功夫，只要一只鸡。',
      choices: [
        { t: '买只鸡给他', canon: true, fx: (g) => { g.stat('武学', 3); g.remember('beggar', 'chicken'); }, res: '他教了你三招，吃完鸡就不见了。' },
        { t: '买不起鸡，把自己的干粮分他一半', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('beggar', 'share'); }, res: '他嚼着干粮说你小气，眼睛却笑了。他什么也没教你，只问了你的名字。' },
        { t: '不理他', canon: true, res: '他骂骂咧咧地走了。' },
      ] },
    { id: 'e_fortune', y: [-50, 200], minAge: 16, cond: inTown, t: '算命', text: '一个瞎眼的算命先生拉住你，说你命里有一道坎，过了是福，过不了是命。',
      choices: [
        { t: '问他是什么坎', canon: true, fx: (g) => { g.remember('fortune', g.s('情义') > 60 ? '情' : g.s('武学') > 60 ? '剑' : '心'); }, res: (g) => '他摸了摸你的手：“' + g.recall('fortune') + '。”然后收了你十文钱。' },
        { t: '“我的命，我自己算。”', canon: true, fx: (g) => { g.stat('心境', 3); g.remember('fortune', 'self'); }, res: '他笑了，没收你钱。' },
        { t: '看他可怜，多给他一吊钱', dev: 0, fx: (g) => { g.stat('情义', 2); g.stat('正邪', 1); }, res: '他把钱揣进怀里，说你的坎会小一点。' },
      ] },
    { id: 'e_wounded_stranger', y: [-50, 200], minAge: 16, cond: inTown, t: '受伤的人', text: '破庙里躺着一个受了重伤的人，身边扔着一把缺口的鬼头刀。外面有人在找他。',
      choices: [
        { t: '把他藏起来', canon: true, fx: (g) => { g.stat('情义', 3); g.stat('正邪', 1); g.remember('stranger', 'hid'); }, res: '追兵走了。他说他欠你一条命，然后也走了。' },
        { t: '交给追兵', dev: 0, fx: (g) => { g.stat('正邪', -4); g.stat('声望', 1); g.remember('stranger', 'gave'); }, res: '追兵赏了你五两银子。你不知道他犯了什么事。' },
        { t: '先问清楚再说', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('悟性', 2); g.remember('stranger', 'hid'); }, res: '他是好人，追他的是仇家。你把他藏了起来。',
          fail: { res: '他说什么也不肯讲，天亮前自己走了。', dev: 0 } },
      ] },
    { id: 'e_wedding', y: [-50, 200], minAge: 16, cond: inTown, t: '喜酒', text: '村里有人办喜事，新郎说你是贵客，非要你喝三碗。',
      choices: [
        { t: '喝', canon: true, fx: (g) => { g.stat('心境', 4); g.stat('情义', 2); g.remember('wedding', 'drank'); }, res: '你喝了六碗，抱着新郎唱了半夜的歌。' },
        { t: '以茶代酒', canon: true, fx: (g) => g.stat('心境', 1), res: '新娘偷偷给你多夹了一块肉。' },
        { t: '给新人舞一段剑助兴', check: ['武学', 35], dev: 0, fx: (g) => { g.stat('声望', 3); g.stat('心境', 3); g.remember('wedding', 'sword'); }, res: '满院子的人叫好。小孩子们学了你一晚上。',
          fail: { fx: (g) => g.stat('心境', -2), res: '你一剑挑翻了喜桌。新郎说这叫红红火火。', dev: 0 } },
      ] },
    { id: 'e_plague', y: [-50, 200], minAge: 16, cond: inTown, t: '时疫', text: '你落脚的城里起了时疫，每天都有人抬出去。',
      choices: [
        { t: '留下帮郎中煎药', check: ['根骨', 50], dev: 0, fx: (g) => { g.stat('正邪', 5); g.stat('情义', 3); g.remember('plague', 'stay'); }, res: '你一直没染上。郎中说你命硬。',
          fail: { fx: (g) => { g.stat('根骨', -15); g.remember('plague', 'stay'); }, res: '你也病倒了，差一点没熬过来。', dev: 0 } },
        { t: '出城避一避', canon: true, fx: (g) => g.stat('心境', -2), res: '你在城外住了两个月。' },
        { t: '翻医书找方子', check: ['悟性', 65], dev: 0, fx: (g) => { g.stat('悟性', 3); g.stat('声望', 4); g.remember('plague', 'cure'); g.info('外号', '小郎中'); }, res: '你在一本旧医书里找到了治法。城里的人后来叫你“小郎中”。',
          fail: { fx: (g) => g.stat('心境', -3), res: '你翻了半个月的书，找到的方子都不管用。', dev: 0 } },
      ] },
    { id: 'e_chess', y: [-50, 200], minAge: 20, cond: (g) => outside(g) && !['xiangyang', 'dadu', 'zhongdu', 'lintan'].includes(g.loc), t: '残局', text: '松树下摆着一盘残局，一个老人说，解得开就送你一样东西。',
      choices: [
        { t: '试试', check: ['悟性', 65], dev: 0, fx: (g) => { g.stat('悟性', 2); g.remember('chess', 'solved'); }, res: '他送了你一句口诀。你念了几遍，没懂。',
          fail: { fx: (g) => g.stat('心境', 1), res: '你下了一个时辰，老人睡着了。', dev: 0 } },
        { t: '看看就好', canon: true, res: '你走的时候，老人还在等下一个人。' },
        { t: '掀了棋盘，看他怎么说', dev: 0, fx: (g) => { g.stat('心境', 2); g.remember('chess', 'flipped'); }, res: '老人大笑：“解法就是这个。”他什么也没送你。' },
      ] },
  ]);

  /* ---------- 回响：几年后读到上面那些选择 ---------- */
  // read 返回 [当年的选择, 过了几年]，写成字面的 g.recall('键')，检查工具才认得出
  const echo = (id, read, t, years, minAge, map) => ({
    id, y: [-50, 200], minAge, t, auto: true, always: true, kind: 'echo',
    cond: (g) => { const [v, n] = read(g); return !!map[v] && n >= years; },
    fx: (g) => { const m = map[read(g)[0]]; if (m.fx) m.fx(g); },
    text: (g) => { const m = map[read(g)[0]]; return m ? JY.val(m.t) : ''; },
  });
  JY.addEncounters([
    echo('e_echo_bandit', (g) => [g.recall('bandit'), g.since('bandit')], '旧账', 4, 20, {
      paid: { t: '你又走到那条山道。还是那伙强人，人多了一倍。领头的认出你，笑着让开了路：“爽快人，不收第二回。”他们今天要抢的是后面的商队。', fx: (g) => { g.stat('心境', -2); } },
      beaten: { t: (g) => (g.recall('banditRe') ? '当年被你打跑的疤脸头领，带着六个帮手在客店外堵你。你又赢了一回。这回他把刀扔在地上，说服了。' : '当年被你打跑的疤脸头领，带着六个帮手在客店外堵你。你身上添了三道疤，才脱了身。'),
        fx: (g) => { const win = g.s('武学') >= 50 || g.rnd() < 0.3; g.remember('banditRe', win); if (win) { g.stat('声望', 4); } else { g.stat('根骨', -12); } } },
      army: { t: '一队边军路过，领头的校尉下马给你行礼。是当年那个疤脸强人。他说营里的弟兄都记得你，往后在边关有事，报他的名字。', fx: (g) => { g.stat('声望', 3); g.rel('旧部', '边军校尉', '当年拦路的强人'); } },
    }),
    echo('e_echo_tavern', (g) => [g.recall('tavern'), g.since('tavern')], '酒楼旧事', 3, 19, {
      fought: { t: '当年被你打下酒楼的人，是一个大帮派的香主。这些年你走到哪里，都有人认得你，也有人在背后啐一口。', fx: (g) => { g.stat('声望', 4); g.stat('心境', -2); g.info('外号', '酒楼一拳'); } },
      drink: { t: '你病倒在一家客店里，钱也用光了。店家说有人替你付了三个月的房钱，还请了郎中。是当年酒楼上一起喝酒的那两个人。', fx: (g) => { g.stat('根骨', 10); g.stat('心境', 3); g.rel('酒友', '酒楼上结识的两兄弟'); } },
    }),
    echo('e_echo_child', (g) => [g.recall('child'), g.since('child')], '路边的孩子', 10, 26, {
      money: { t: '一个年轻人在路边认出了你，跪下磕了三个头。他说他就是当年那个发烧的孩子，娘让他记住了给钱的人。', fx: (g) => { g.stat('心境', 4); } },
      carried: { t: (g) => '一个年轻人找了你很多年。他说他就是当年你背去镇上的那个孩子，他学了医，这条命是你的。从此他叫你' + (isMale(g) ? '义父' : '义母') + '。',
        fx: (g) => { g.stat('情义', 4); g.stat('根骨', 4); g.rel('义子', '当年的病童', '学了医，常来看你'); } },
      left: { t: '你又路过那个地方。路边多了一座小坟，碑上没有名字。', fx: (g) => { g.stat('心境', -6); } },
    }),
    echo('e_echo_book', (g) => [g.recall('book'), g.since('book')], '拳谱', 5, 17, {
      bought: { t: '那本旧拳谱里朱笔圈过的几页，你今年忽然看懂了。老镖师一辈子的心得，原来就在那几个圈里。', fx: (g) => { g.stat('武学', 6); } },
      returned: { t: '老镖师的孙子开了一家镖局。他让人四处打听你，请你去镖局住了一冬，把那本拳谱一招一招演给你看。', fx: (g) => { g.stat('武学', 4); g.rel('故交', '镖局少东家', '老镖师的孙子'); } },
    }),
    echo('e_echo_patrol', (g) => [g.recall('patrol'), g.since('patrol')], '村子', 4, 18, {
      fled: { t: '那个村子后来还是被游骑烧了。逃进山里的人，在山那边重新盖了房子，村名还叫原来的名字。他们给你留了一间屋。', fx: (g) => { g.stat('情义', 3); } },
      fought: { t: '蒙古人的城门上贴出了一张画像，画的是你。赏银五十两。你在路上多了几分小心，也多了几分名气。', fx: (g) => { g.stat('声望', 5); g.stat('根骨', -3); g.info('悬赏', '蒙古官府五十两'); } },
      freed: { t: '当年被你从营地里放走的少年，后来投了义军。今年他托人捎来一句话：村里的人都还活着，他在等你一起做件大事。', fx: (g) => { g.stat('正邪', 3); g.rel('故人', '义军头目', '当年被你放走的少年'); } },
    }),
    echo('e_echo_flood', (g) => [g.recall('flood'), g.since('flood')], '河堤', 6, 16, {
      dike: { t: (g) => '那段你扛过沙袋的河堤，乡亲们叫它“' + g.name(g.me).slice(-1) + '公堤”。每年发大水，都有人站在上面念叨你。', fx: (g) => { g.stat('声望', 3); g.stat('心境', 2); } },
      fled: { t: '你回那个地方看过一次。邻居们没说什么，只是不再留你吃饭。', fx: (g) => { g.stat('情义', -3); g.stat('心境', -2); } },
      granary: { t: '那个被你堵在衙门口的县官，后来升了知府。你在他的地界上被找了个由头，关了半个月。出来时，城里的百姓在门口等你。', fx: (g) => { g.stat('根骨', -5); g.stat('声望', 4); } },
    }),
    echo('e_echo_beggar', (g) => [g.recall('beggar'), g.since('beggar')], '老叫化', 3, 12, {
      chicken: { t: '你又在一个镇上碰见那个老叫化。他啃着鸡腿说你上回那三招练歪了，又教了一遍。这回你看出来了，那是真功夫。', fx: (g) => { g.stat('武学', 5); } },
      share: { t: '一群叫化子在城门口拦住你，领头的递给你一根竹棍，说是一个老叫化托他们送的。从此丐帮弟子见了你都客客气气。', fx: (g) => { g.stat('声望', 2); g.rel('故人', '丐帮的老叫化', '分过你一半干粮'); } },
    }),
    echo('e_echo_fortune', (g) => [g.recall('fortune'), g.since('fortune')], '那个字', 8, 30, {
      '情': { t: '你想起那个算命先生说的“情”字。这些年你的坎，果然都在这个字上。', fx: (g) => { g.stat('悟性', 2); } },
      '剑': { t: '你想起那个算命先生说的“剑”字。这些年你的坎，果然都在刀剑上。', fx: (g) => { g.stat('悟性', 2); } },
      '心': { t: '你想起那个算命先生说的“心”字。这些年过不去的，都是自己。', fx: (g) => { g.stat('悟性', 2); } },
      self: { t: '又有一个算命先生拉住你。你摆摆手，他也笑了。这些年你确实没信过命，命也没把你怎样。', fx: (g) => { g.stat('心境', 3); } },
    }),
    echo('e_echo_stranger', (g) => [g.recall('stranger'), g.since('stranger')], '鬼头刀', 4, 20, {
      hid: { t: '你遇险的那一夜，有个人从暗处出手，替你挡了一刀，转身就走了。你认得他手里那把缺口的鬼头刀。', fx: (g) => { g.stat('根骨', 6); g.stat('情义', 2); } },
      gave: { t: '你听说当年破庙里那个受伤的人是被冤枉的，追他的是仇家。他死在了押解的路上。那五两银子，你一直没花。', fx: (g) => { g.stat('心境', -6); g.stat('正邪', -2); } },
    }),
    echo('e_echo_wedding', (g) => [g.recall('wedding'), g.since('wedding')], '喜酒那家', 8, 26, {
      drank: { t: (g) => '那家人的孩子长大了，非要认你做' + (isMale(g) ? '干爹' : '干娘') + '。说是爹娘讲过，成亲那天你喝了六碗。', fx: (g) => { g.stat('心境', 4); g.rel('干亲', '喜酒那家的孩子'); } },
      sword: { t: '那个村子的孩子们，至今还在学你那一段剑。有个孩子学得很像，后来进了门派，逢人便说剑是跟你学的。', fx: (g) => { g.stat('声望', 3); } },
    }),
    echo('e_echo_plague', (g) => [g.recall('plague'), g.since('plague')], '又一场时疫', 6, 22, {
      stay: { t: '又闹了一场时疫。你没有染上。郎中说你当年熬过的那一场，算是种过了。', fx: (g) => { g.stat('根骨', 3); } },
      cure: { t: '有人从几百里外来找“小郎中”。你治好了三个，没治好一个。那一个，你记了很久。', fx: (g) => { g.stat('声望', 3); g.stat('悟性', 2); } },
    }),
    echo('e_echo_chess', (g) => [g.recall('chess'), g.since('chess')], '口诀', 5, 25, {
      solved: { t: '那个老人送你的口诀，你今年才琢磨透。原来是一路剑法的总诀。', fx: (g) => { g.stat('武学', 7); } },
      flipped: { t: '你在一场打斗里被逼进了死角，忽然想起那盘被你掀翻的棋。你也掀了。对手没想到，你走了出来。', fx: (g) => { g.stat('武学', 3); g.stat('心境', 2); } },
    }),
  ]);

  /* ---------- 闲笔：没有大事的年份里会出现的句子 ---------- */
  JY.addFlavor('age:child', [
    '你学会了走路，第一步就摔了一跤，没有哭。',
    '你第一次叫“娘”，叫得很清楚。',
    '你生了一场病，烧了三天三夜。大人守着你没合眼。',
    '你喜欢趴在门口看外面走过的人。',
    '你开始问“为什么”。大人答不上来的时候，会说“长大了你就知道了”。',
    '你抓着一只小虫子玩了一个下午。',
    '有人给了你一块糖，你舍不得吃，攥化了。',
    '你学会了数数，数到十就会重新开始。',
    '你做了一个噩梦，醒来后记不得梦见了什么。',
    '你把饭碗打碎了，没人骂你。',
    '你第一次看见下雪，伸出舌头去接。',
    '你开始记事了。很多年后，你记得的第一件事是一盏灯。',
  ]);
  JY.addFlavor('age:young', [
    '你和别的孩子打了一架，打赢了，回家挨了骂。',
    '你在树上掏了一个鸟窝，又放了回去。',
    '你第一次一个人走夜路，一路上都在数自己的脚步声。',
    '你偷偷模仿大人练功的样子，被人看见了，笑了很久。',
    '你认识了一百个字，最喜欢的是“侠”。',
    '你说了一次谎，后来一直记着。',
    '你听说书人讲华山论剑，听到天黑才回家。',
    '你个子长得很快，去年的衣服穿不下了。',
    '你学会了游水，在河里待了一下午。',
    '你在夜里看了很久的星星，想知道天有多远。',
    '你第一次看见死人，好几天吃不下饭。',
    '你开始觉得大人说的话，也不全对。',
    '你把攒了很久的钱，买了一把木剑。',
    '有个比你小的孩子叫你“哥哥”或“姐姐”，你很高兴。',
  ]);
  JY.addFlavor('age:adult', [
    '这一年没什么大事。你在一个小镇上住了一阵，学会了做一道菜。',
    '你在路上帮人推了一回车，车上是一家人全部的家当。',
    { t: '你听说一个旧相识死了，喝了一夜的酒。', minAge: 22 },
    '你病了一场，好得很慢。',
    '你在一座破庙里避雨，庙里的菩萨缺了一只手。',
    '有人认出了你，请你喝酒。你记不起他是谁。',
    '你在江边看了一整天的船。',
    '你把一件旧衣裳补了又补，不舍得扔。',
    { t: '你开始在夜里想事情，想着想着天就亮了。', minAge: 25 },
    { t: '你发现自己有了第一根白头发。', minAge: 38 },
    '你在集市上看见一个卖艺的孩子，想起了小时候的自己。',
    '你给远方的人写了一封信，没有寄出去。',
    '你走过一个村子，村里的狗都不叫。',
    '这一年风调雨顺，路上的人脸上都有笑。',
    '这一年年景不好，路上饿死的人很多。',
    '你学会了一点医术，治好了自己的旧伤。',
    '你和人赌钱，输了，又赢回来，最后没输没赢。',
  ]);
  JY.addFlavor('age:old', [
    '你的眼睛开始花了，看书要拿得很远。',
    '你在院子里种了一棵树，知道自己看不到它长大。',
    '有年轻人来向你请教武功，你说的他们大多听不懂。',
    '你梦见了年轻时候的事，醒来时枕头湿了。',
    '你走路慢了，但是很稳。',
    '你开始把东西送人。',
    '你又送走了一个老朋友。',
    '晚辈们说起你年轻时候的事，有一半是编的。你没有纠正。',
    '你晒了一下午的太阳，什么也没想。',
    '你的牙掉了一颗。',
    '你记不清昨天吃了什么，却记得四十年前的一场雨。',
    '你把一生学的武功写成了一本小册子，不知道该给谁。',
  ]);
  JY.addFlavor('focus:闭关练功', [
    '你在山洞里闭关三个月，出关时胡子长了一寸。',
    '你练功时走岔了真气，吐了一口血，又慢慢调匀了。',
    '你对着一棵树练掌，一年后树死了。',
    '你忽然想通了一招，半夜起来练到天亮。',
  ]);
  JY.addFlavor('focus:读书参悟', [
    '你读了一部兵书，觉得武功和打仗是一回事。',
    '你把一本拳谱翻烂了，又抄了一本。',
    '你读到一句“上善若水”，想了一个月。',
    '你在书里夹着的一张纸上，看见了前人的批注。',
  ]);
  JY.addFlavor('focus:行走江湖', [
    '你走了三千里路，鞋底磨穿了四双。',
    '你在客栈里听人说起你，说的不全对。',
    '你结交了一个朋友，喝了三天酒，分别时没有留名字。',
    '你在渡口和人打了一架，船家看得忘了撑船。',
    '你第一次出关，看见了大漠。',
  ]);
  JY.addFlavor('focus:行侠仗义', [
    '你从恶霸手里救下了一个卖唱的姑娘。',
    '你替一个被冤枉的人出头，得罪了当地的官。',
    '你把一个贪官的银子分给了城外的灾民。',
    '你救了一个人，后来发现他不是什么好人。',
  ]);
  JY.addFlavor('focus:儿女情长', [
    '你和心上人在月下走了很久，谁也没说话。',
    '你们吵了一架，第二天又和好了。',
    '你学会了做她（他）喜欢吃的菜。',
    '你送了一样东西，被收下了。',
  ]);
  JY.addFlavor('focus:经营门派', [
    '门下多了几个弟子，有一个很有天分。',
    '你调停了两个弟子之间的争执，两边都不满意。',
    '你把门派的账目理了一遍，发现亏空不少。',
    '你给门派立了一条新规矩。',
  ]);
  JY.addFlavor('focus:养伤修心', [
    '你在山里住了一年，每天只是砍柴、挑水、打坐。',
    '旧伤在阴雨天还会疼，但比去年好些了。',
    '你学会了在心里数到一百，再决定要不要发火。',
  ]);
  JY.addFlavor('focus:读书识字', [
    '先生让你背书，你背得很快，忘得也很快。',
    '你学会了写自己的名字。',
    '你在书里看见一个不认识的字，问遍了周围的人。',
  ]);
  JY.addFlavor('focus:打熬筋骨', [
    '你每天天不亮就起来扎马步。',
    '你跑山路跑得比同龄的孩子都快。',
    '你练得手上全是茧。',
  ]);
  JY.addFlavor('focus:玩耍交友', [
    '你交了一个好朋友，你们发誓要做一辈子的兄弟。',
    '你们一群孩子在河边玩了一整天。',
    '你和朋友约好，长大了一起去闯江湖。',
  ]);
  JY.addFlavor('focus:帮衬家里', [
    '你帮家里放羊、砍柴、挑水。',
    '你第一次自己挣了钱，全交给了家里。',
    '家里有人病了，你守了好几个晚上。',
  ]);
  JY.addFlavor('loc:xiangyang', [
    '襄阳城头的风很大，城墙上的旗子一年要换好几面。',
    '城外的蒙古营帐又多了一片。',
    '襄阳城里的人都认得郭大侠。',
    '你在襄阳城下听见了号角声，一夜没睡。',
  ]);
  JY.addFlavor('loc:taohua', [
    '桃花岛上的桃花开了又落，岛上的路你还是走不全。',
    '岛上的哑仆们一句话也不说，饭却做得很好。',
    '夜里有人在海边吹箫，箫声顺着风传了很远。',
  ]);
  JY.addFlavor('loc:grassland', [
    '草原上的冬天很长，羊冻死了好几只。',
    '你在草原上看见一群狼追一只鹿。',
    '那达慕大会上，你看了一整天的摔跤。',
    '风把蒙古包吹得呼呼响。',
  ]);
  JY.addFlavor('loc:road', [
    '你在官道上走了一个月，看见的逃难的人比做买卖的多。',
    '你在一个路边茶摊上歇脚，茶很淡。',
    '路过一个被烧了的村子，只剩下一口井。',
  ]);
  JY.addFlavor('loc:shaolin', [
    '少林寺的钟声每天准时响起。',
    '藏经阁的灯，夜里总是亮着。',
  ]);
  JY.addFlavor('loc:wudang', [
    '武当山上云雾缭绕，道观里的钟声很远。',
    '你在紫霄宫外看见一个老道士在打一套很慢的拳。',
  ]);
  JY.addFlavor('loc:zhongnan', [
    '重阳宫里的道士们每天早上一起诵经。',
    '终南山的松树很高，风过的时候像海浪。',
  ]);
  JY.addFlavor('loc:gumu', [
    '古墓里没有白天和黑夜，只有一盏长明灯。',
    '墓里很冷。你睡在一张寒玉床上。',
    '玉蜂嗡嗡地飞，蜂蜜是墓里唯一的甜。',
  ]);
  JY.addFlavor('any', [
    '这一年下了一场很大的雪。',
    '这一年夏天特别热，井水都快干了。',
    '有一颗扫帚星划过天边，人们说要出大事。',
    '你听说了一个新出的江湖传说，主角的名字你没听过。',
    '这一年过得很快，你几乎不记得做了什么。',
    '你在梦里回到了小时候住过的地方。',
  ]);
})();

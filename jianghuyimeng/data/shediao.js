/* 江湖一梦 · 射雕英雄传
 * 可玩：郭靖、黄蓉、杨康、穆念慈
 * 配角：李萍、杨铁心、包惜弱、完颜洪烈、梅超风、陈玄风、欧阳克、拖雷、华筝、哲别、裘千仞、马钰
 */
(function () {
  'use strict';
  const JY = window.JY;
  const BOOK = '射雕英雄传';

  // 神雕的人物可能不在（单独测试时），运行时再判断
  const R = (id, nm) => (JY.byId[id] ? id : nm);
  const married = (g) => !g.f('jingrongApart') && !g.f('rongDied') && !g.f('jingStayMongol');
  const hasYG = (g) => !JY.byId.yangguo || g.alive('yangguo');
  const ygName = (g) => (g.f('yangkangLives') || g.f('yangkangTurned') ? '杨康的儿子杨过' : '杨康的遗孤杨过');
  // 原著：杨铁心、包惜弱在赵王府双双自尽
  const tiexinDie = (g) => {
    g.kill('yangtiexin', '在中都赵王府与妻子包惜弱一同自尽', true);
    g.kill('baoxiruo', '在中都赵王府随丈夫杨铁心自尽', true);
  };

  JY.addFlags({
    jingNoWarn: '郭靖没有向铁木真报信',
    jingrongNeverMet: '郭靖和黄蓉这辈子没有相识',
    xuanfengEscaped: '铜尸陈玄风没有死在大漠',
    guoDefected: '郭靖离开蒙古，回到了大宋',
    xianglongWudang: '降龙十八掌传到了武当',
    jingRefusedHua: '郭靖当着成吉思汗的面推掉了与华筝的婚约',
    jingWedHua: '郭靖娶了华筝公主',
    lipingSouth: '李萍跟着儿子南下，没有留在蒙古做人质',
    jingNoXianglong: '郭靖没有学全降龙十八掌',
    yidengFull: '一灯大师没有为救黄蓉耗去五年功力',
    samarkandMassacre: '撒麻尔罕被屠了城',
    poluXianglong: '郭破虏学全了降龙十八掌',
    xianglongBook: '郭靖把降龙十八掌写成了一本书，流落民间',
    zhouFreedEarly: '周伯通早早被放出了桃花岛的山洞',
    yangMengzhu: '杨过在大胜关被推为武林盟主',
    fuApologized: '郭芙给杨过磕头赔了罪',
    xiangTaughtByRong: '郭襄得了黄蓉的真传',
    rongMapXiangyang: '襄阳城头的石阵，是黄蓉寄去的阵图',
    honglieSpared: '完颜洪烈被放走，死在北方草原',
    spearSold: '杨铁心的铁枪被卖给了财主',
    meiHomesick: '有人提醒梅超风，桃花岛还记得她',
    yangguoRaisedByGuo: '杨过从小在郭靖身边长大',
    rongTaughtYang: '黄蓉把杨过当亲生孩子教',
    yangkangGaibang: '杨康没有在君山冒充丐帮帮主',
    rongEscaped: '郭靖断后，黄蓉带着孩子们逃出了襄阳',
    jingEscaped: '黄蓉断后，郭靖带着孩子们逃出了襄阳',
  });

  /* ================= 配角 ================= */
  JY.addChars([
    { id: 'liping', name: '李萍', book: BOOK, sex: '女', born: -20, origin: '郭啸天的妻子，郭靖的母亲',
      death: (g) => (g.f('lipingLives') ? { y: 50, cause: '在襄阳寿终', mod: true } : { y: 22, cause: '在蒙古军营中自尽，不让儿子为难' }),
      ms: [[0, '丈夫死在牛家村，一个人逃往北方'], [1, '在草原上生下郭靖'], [18, '送儿子南下'], [18, '跟着儿子南下，住在嘉兴', (g) => g.f('lipingSouth')], [22, '随郭靖逃回中原', (g) => g.f('lipingLives')], [36, '跟着儿子住在襄阳', (g) => g.f('lipingLives')]] },
    { id: 'yangtiexin', name: '杨铁心', book: BOOK, sex: '男', born: -24, origin: '杨家将后人，使一杆铁枪',
      death: (g) => (g.f('tiexinLives') ? { y: 46, cause: '在嘉兴寿终', mod: true } : { y: 18, cause: '在中都赵王府与妻子包惜弱一同自尽' }),
      ms: [[0, '牛家村遭难，与妻子失散'], [5, '化名穆易，收养了孤女穆念慈'], [18, '在中都街头为义女比武招亲'], [19, '与妻儿在嘉兴团聚', (g) => g.f('tiexinLives')]] },
    { id: 'baoxiruo', name: '包惜弱', book: BOOK, sex: '女', born: -22, origin: '杨铁心的妻子',
      death: (g) => (g.f('tiexinLives') ? { y: 44, cause: '在嘉兴病逝', mod: true } : { y: 18, cause: '在中都赵王府随丈夫杨铁心自尽' }),
      ms: [[0, '被完颜洪烈救走，带到金国'], [1, '生下杨康，做了赵王妃'], [10, '在王府里搭了一间江南农舍，一个人住'], [19, '随丈夫回了江南', (g) => g.f('tiexinLives')]] },
    { id: 'wanyanhonglie', name: '完颜洪烈', book: BOOK, sex: '男', born: -25, origin: '金国六王爷，赵王',
      death: (g) => (g.f('honglieSpared') ? { y: 30, cause: '被郭靖放走，在北方草原上病死', mod: true } : { y: 22, cause: '金国兵败时被郭靖追上，死于乱军之中' }),
      ms: [[0, '设计夜袭牛家村，夺走了包惜弱'], [1, '把杨康当亲生儿子养'], [18, '四处搜罗江湖高手'], [19, '想去临安盗《武穆遗书》']] },
    { id: 'meichaofeng', name: '梅超风', book: BOOK, sex: '女', born: -12, origin: '黄药师的叛徒弟子，黑风双煞之一',
      death: (g) => (g.f('meiLives') ? { y: 40, cause: '回到桃花岛，病逝在师父身边', mod: true } : { y: 19, cause: '替师父黄药师挡了欧阳锋一掌而死' }),
      ms: [[-8, '与师兄陈玄风偷了《九阴真经》下卷，叛出桃花岛'], [6, '在大漠失去了丈夫', (g) => !g.f('xuanfengEscaped')], [10, '双目已盲，躲在金国赵王府'], [19, '回到师父身边', (g) => g.f('meiLives')]] },
    { id: 'chenxuanfeng', name: '陈玄风', book: BOOK, sex: '男', born: -14, origin: '黑风双煞之一，人称铜尸',
      exists: (g) => g.f('xuanfengEscaped'),
      death: { y: 19, cause: '在桃花岛外被欧阳锋所杀', mod: true },
      ms: [[6, '在大漠被一个孩子刺伤，侥幸逃生'], [10, '与梅超风躲在金国'], [18, '黑风双煞重现江南']] },
    { id: 'ouyangke', name: '欧阳克', book: BOOK, sex: '男', born: -6, origin: '白驼山少主，欧阳锋的侄子（其实是儿子）',
      death: (g) => (g.f('ouyangkeLives') ? { y: 48, cause: '回白驼山做了山主，寿终', mod: true } : { y: 19, cause: '在牛家村被杨康一枪刺死' }),
      ms: [[18, '带着一群白衣姬妾游荡中原'], [19, '桃花岛招亲败给郭靖'], [19, '被压断双腿', (g) => true], [20, '回了白驼山', (g) => g.f('ouyangkeLives')]] },
    { id: 'tuolei', name: '拖雷', book: BOOK, sex: '男', born: 0, origin: '成吉思汗的四王子',
      death: { y: 33, cause: '病逝' },
      ms: [[9, '和郭靖结为安答'], [20, '随父西征'], [23, '监国']] },
    { id: 'huazheng', name: '华筝', book: BOOK, sex: '女', born: 2, origin: '成吉思汗的女儿',
      death: (g) => (g.f('jingWedHua') || (g.f('jingStayMongol') && !g.f('jingRefusedHua')) ? { y: 42, cause: '病逝，郭靖守在床边', mod: true } : { y: 42, cause: '在草原上病逝，至死未嫁' }),
      ms: [[9, '总跟在郭靖后面'], [18, '被许配给郭靖', (g) => !g.f('jingRefusedHua')], [18, '被郭靖当众推了婚约', (g) => g.f('jingRefusedHua')], [23, '嫁给了郭靖', (g) => g.f('jingWedHua')], [19, '嫁给了郭靖', (g) => g.f('jingStayMongol') && !g.f('jingRefusedHua')], [23, '回到草原，一辈子没有嫁人', (g) => !g.f('jingStayMongol') && !g.f('jingWedHua')]] },
    { id: 'zhebie', name: '哲别', book: BOOK, sex: '男', born: -25, origin: '蒙古神箭手',
      death: { y: 30, cause: '病逝于军中' },
      ms: [[6, '被一个汉人孩子救了一命'], [7, '教郭靖射箭'], [20, '随成吉思汗西征']] },
    { id: 'qiuqianren', name: '裘千仞', book: BOOK, sex: '男', born: -30, origin: '铁掌帮帮主，铁掌水上飘',
      death: { y: 41, cause: '在绝情谷外圆寂，法号慈恩' },
      ms: [[-15, '打伤了瑛姑的孩子'], [19, '在铁掌峰打伤黄蓉'], [22, '华山上被一灯大师点化，出家为僧'], [40, '法号慈恩，跟着一灯大师']] },
    { id: 'mayu', name: '马钰', book: BOOK, sex: '男', born: -42, origin: '全真七子之首，丹阳子', minor: true,
      death: { y: 25, cause: '在终南山仙逝' },
      ms: [[15, '在大漠悬崖上暗中传郭靖内功'], [18, '回到终南山']] },
  ]);

  /* ================= 郭靖 ================= */
  JY.addChars([{
    id: 'guojing', name: '郭靖', py: 'GUO<<JING', book: BOOK, sex: '男', born: 1,
    origin: '蒙古草原上长大的汉人孩子', birthplace: '蒙古草原', home: 'grassland', bg: 1,
    info: { 门派: '无', 身份: '牧民之子' },
    look: { hair: 'topknot', hairColor: '#231a12', robe: '#7a5236', accent: '#c9a45c' },
    family: [{ rel: '母亲', id: 'liping' }, { rel: '父亲', name: '郭啸天', note: '纪年 0 年死于牛家村' }],
    fateText: '学成降龙十八掌，与黄蓉结为夫妻，镇守襄阳三十余年。襄阳城破之日，与黄蓉一同殉城。',
    st: [80, 25, 70, 85, 3, 0, 60],
    death: (g) => {
      if (g.f('guoSurvive')) return { y: 88, cause: '隐居终南山下，寿终', mod: true };
      if (g.f('jingEscaped')) return { y: 84, cause: '带着孩子们逃出襄阳，在终南山下孤身终老', mod: true };
      if (g.f('jingStayMongol')) return { y: 66, cause: '在草原上寿终', mod: true };
      if (g.f('guoLeftXiangyang')) return { y: 80, cause: '在桃花岛寿终', mod: true };
      return { y: 71, cause: '襄阳城破，与黄蓉一同殉城' };
    },
    ms: [[1, '生于蒙古草原'], [6, '跟江南七怪学武'], [9, '和拖雷结为安答'], [18, '被封为金刀驸马'], [18, '南下中原', (g) => !g.f('jingStayMongol')],
      [18, '留在草原做了金刀驸马', (g) => g.f('jingStayMongol')], [19, '学会降龙十八掌', (g) => !g.f('jingrongApart')], [22, '第二次华山论剑'],
      [23, '与黄蓉成婚', married], [36, '镇守襄阳', (g) => !g.f('jingStayMongol') && !g.f('guoLeftXiangyang')], [36, '回了桃花岛', (g) => g.f('guoLeftXiangyang')],
      [39, '大胜关英雄大会上被推为武林盟主'], [57, '第三次华山论剑，号称北侠'], [72, '隐居终南山下', (g) => g.f('guoSurvive')]],
    arc: {
      focus: '打熬筋骨',
      intro: '你生在蒙古草原的一个冬天。母亲李萍一个人在雪地里生下你。你的名字是丘处机道长起的，叫郭靖，为的是不忘靖康之耻。',
      lastWords: '侠之大者，为国为民。',
      nodes: [
        { id: 'gj_y3', y: 4, auto: true, t: '三岁', text: '你三岁了，话还说不利索。母亲说你笨，可你放的羊一只也没丢过。', fx: (g) => g.stat('情义', 3) },
        { id: 'gj_zhebie', y: 6, t: '哲别', text: '一个受了箭伤的黑衣汉子逃到你家帐篷边，后面有铁木真的人在追。他看着你，没有求你。',
          choices: [
            { t: '把他藏进干草堆里', canon: true, fx: (g) => { g.stat('情义', 5); g.rel('箭术师父', 'zhebie'); }, res: '追兵走了。他叫哲别，伤好以后留下来教你射箭。' },
            { t: '把自己的马牵给他，让他快逃', dev: 15, fx: (g) => { g.stat('情义', 4); g.remember('zhebieGone'); }, res: '他骑马跑了，没来得及教你什么。你挨了母亲一顿打。往后拉弓射箭，只能自己摸索。' },
            { t: '指给追兵看', dev: 20, fx: (g) => { g.stat('正邪', -10); g.kill('zhebie', '被郭靖指给追兵，死在铁木真帐前'); }, res: '你得了一块糖。那天晚上你做了噩梦。草原上少了一个神箭手。' },
          ] },
        { id: 'gj_qiguai', y: 6, t: '黑风双煞', text: '七个从江南来的怪人找到了你，说要教你武功。当天夜里，黑风双煞来了。铜尸陈玄风一把抓住了你，你手里攥着一把短剑。',
          choices: [
            { t: '一剑刺进他的肚脐', canon: true, fx: (g) => { g.stat('武学', 3); g.stat('声望', 2); g.rel('师父', '江南七怪'); g.info('门派', '江南七怪'); }, res: '那是他练功的罩门。他倒下了。七师父韩小莹抱着你哭了很久。四师父张阿生也死在那一夜。' },
            { t: '大声喊七位师父', dev: 15, fx: (g) => { g.set('xuanfengEscaped'); g.rel('师父', '江南七怪'); g.info('门派', '江南七怪'); g.stat('情义', 3); }, res: '六师父全金发第一个赶到，挨了一爪。陈玄风抱着梅超风逃进了夜色里。四师父张阿生还是死在了那一夜。黑风双煞从此还在江湖上走动。' },
          ] },
        { id: 'gj_tuolei', y: 9, t: '安答', text: '铁木真的四儿子拖雷和你一般大，你们摔了一下午的跤。他说要和你结为安答，就是生死兄弟。',
          choices: [
            { t: '交换信物，结为安答', canon: true, fx: (g) => { g.stat('情义', 6); g.rel('安答', 'tuolei'); }, res: '你把母亲缝的汗巾给了他，他给了你一串狼牙。' },
            { t: '叫上华筝，三个人一起结拜', dev: 10, fx: (g) => { g.stat('情义', 6); g.rel('安答', 'tuolei'); g.rel('小伙伴', 'huazheng'); g.remember('withHuazheng'); }, res: '华筝不肯磕头，说女孩子不结安答。她从那天起总跟在你后面，一跟就是好些年。' },
            { t: '“我只是个放羊的。”', dev: 10, fx: (g) => { g.stat('情义', -4); g.remember('noAnda'); }, res: '拖雷愣了一下，骑马走了。往后在大营里，没有人替你说话。' },
          ] },
        { id: 'gj_warn', y: 12, t: '伏击', text: '你在山后放羊，听见桑昆和札木合商量，要在宴席上伏击铁木真。没有人知道你听见了。',
          choices: [
            { t: '连夜骑马去报信', canon: true, fx: (g) => { g.stat('声望', 8); g.info('身份', '铁木真的小英雄'); }, res: '铁木真躲过了伏击。他摸着你的头说，好孩子。他记住了你。' },
            { t: '大人的事，不关你的事', dev: 25, fx: (g) => { g.set('jingNoWarn'); g.stat('正邪', -5); }, res: '铁木真在宴席上受了重伤，养了一年才好。他始终不知道有人事先知情，也就不会记得一个放羊的孩子。' },
          ] },
        { id: 'gj_mayu', y: 15, t: '悬崖上的道士', text: '一个道士每晚在悬崖顶上等你，教你呼吸吐纳、爬崖的法子。他不许你告诉七位师父。',
          choices: [
            { t: '每晚爬上悬崖', canon: true, fx: (g) => { g.stat('武学', 10); g.stat('根骨', 6); g.rel('内功师父', 'mayu'); }, res: '两年后，你的内力比七位师父想的深得多。道士叫马钰。' },
            { t: '告诉七位师父', dev: 10, fx: (g) => { g.stat('武学', 3); g.stat('情义', 2); g.remember('noMayu'); }, res: '七位师父去找他，他已经走了。你的内功只能照七位师父的路子慢慢打底子，往后要用内力救人的时候，差的就是这一截。' },
          ] },
        { id: 'gj_jindao', y: 18, t: '金刀驸马', cond: (g) => !g.f('jingNoWarn'),
          text: (g) => (g.recall('zhebieGone') ? '你自己摸索了十年的箭术。' : g.alive('zhebie') ? '哲别教了你十年箭术。' : '') + '你一箭射下了两只黑雕。大汗大喜，把女儿华筝许给你，封你为金刀驸马。' + (g.recall('withHuazheng') ? '华筝在人群里看着你，像小时候那样。' : ''),
          choices: [
            { t: '谢过大汗', canon: true, fx: (g) => { g.info('身份', '金刀驸马'); g.rel('未婚妻', 'huazheng'); g.stat('声望', 10); }, res: '华筝红着脸跑开了。这门婚事，往后让你为难了很多年。' },
            { t: '当着大汗的面推辞', dev: 20, fx: (g) => { g.set('jingRefusedHua'); g.stat('声望', -5); g.stat('心境', 3); }, res: (g) => (g.recall('withHuazheng') ? '大汗没有生气，只是笑你傻。华筝哭着跑了，再没跟在你后面。' : '大汗没有生气，只是笑你傻。华筝把头扭到一边，没再看你。') },
          ] },
        { id: 'gj_south', y: 18, t: '十八年之约', text: '十八年之约到了。七位师父要带你南下嘉兴，和丘处机的徒弟比武。母亲说，你的父亲死在南边。',
          choices: [
            { t: '南下', canon: true, fx: (g) => { g.move('zhangjiakou'); g.stat('心境', 3); }, res: '你骑着小红马出发了。母亲留在大营里。' },
            { t: '带着母亲一起南下', dev: 25, check: ['情义', 70], fx: (g) => { g.move('zhangjiakou'); g.set('lipingSouth'); g.set('lipingLives'); g.stat('心境', 5); }, res: '母亲跟着你过了长城，在嘉兴住了下来。往后大汗想拿她逼你，已经办不到了。', fail: { fx: (g) => g.move('zhangjiakou'), res: '大汗不放人，说驸马的母亲要留在大营里享福。你只好一个人走。', dev: 3 } },
            { t: '留在草原', dev: 50, fx: (g) => { g.set('jingStayMongol'); g.set('jingrongApart'); g.set('jingrongNeverMet'); g.info('身份', '蒙古千夫长'); g.stat('声望', 12); }, res: '七位师父独自南下，输掉了赌约。你成了蒙古最年轻的千夫长。' },
          ] },
        { id: 'gj_mongol_marry', y: 19, auto: true, t: '大婚', cond: (g) => g.f('jingStayMongol') && g.alive('huazheng') && !g.f('jingRefusedHua'), text: '你娶了华筝公主。草原上摆了三天三夜的酒。母亲那天一直没有说话。', fx: (g) => { g.rel('妻子', 'huazheng'); g.unrel('未婚妻'); g.stat('心境', 5); } },
        { id: 'gj_rong', y: 18, t: '张家口', loc: 'zhangjiakou', cond: (g) => !g.f('jingStayMongol'), text: '张家口一家酒楼里，一个脏兮兮的小叫化点了一桌子菜，吃完了看着你，等你付账。',
          choices: [
            { t: '付账，再送他貂裘和小红马', canon: true, fx: (g) => { g.stat('情义', 8); g.stat('心境', 6); g.rel('知己', 'huangrong'); g.party(['huangrong']); }, res: '小叫化洗干净了脸，是个姑娘。她叫黄蓉。' },
            { t: '付了钱就走', dev: 40, fx: (g) => { g.set('jingrongApart'); g.set('jingrongNeverMet'); }, res: '你没再见过那个小叫化。往后没有人替你做菜换降龙掌，也没有人替你出主意。' },
          ] },
        { id: 'gj_bizhao', y: 18, t: '比武招亲', loc: 'zhongdu', cond: (g) => !g.f('jingStayMongol'), text: '中都街头，一个红衣姑娘比武招亲。一个锦衣公子上台赢了她，却笑着说不娶。姑娘的父亲站在一边发抖。',
          choices: [
            { t: '跳上台去替她讨个公道', canon: true, fx: (g) => { g.stat('正邪', 5); g.stat('声望', 4); g.stat('根骨', -3); g.rel('对头', 'yangkang'); }, res: '你和那公子打了一场，谁也没赢。他叫完颜康，是金国小王爷。那老汉一直盯着他看。' },
            { t: '先去找那姑娘的父亲问清楚', dev: 10, fx: (g) => { g.stat('悟性', 3); g.stat('情义', 3); g.remember('knowsTiexin'); }, res: '老汉说他叫穆易。你看见他枪头上刻着三个字：杨铁心。母亲说过这个名字，他是你爹的结义兄弟。' },
            { t: '不管闲事', dev: 10, fx: (g) => { g.stat('正邪', -3); g.remember('skipBizhao'); }, res: '你走出很远，还能听见围观的人在起哄。那天夜里赵王府出了事，你第二天才听说。' },
          ] },
        { id: 'gj_wangfu', y: 18, t: '赵王府', loc: 'zhongdu', cond: (g) => !g.recall('skipBizhao') && !g.f('jingStayMongol') && g.alive('yangtiexin') && g.alive('baoxiruo'),
          text: (g) => (g.recall('knowsTiexin') ? '杨铁心' : '比武招亲的穆老汉') + '夜闯赵王府，要找回被夺走十八年的妻子。王府的兵把他们夫妻围在了院子里。你翻墙跟了进去。',
          choices: [
            { t: '冲进去护着他们', canon: true, fx: (g) => { tiexinDie(g); g.stat('心境', -10); g.rel('义妹', 'munianci'); }, res: '他们还是在你面前自尽了。杨铁心临死前把穆姑娘托付给你，说她是你的义妹。' },
            { t: '背起杨夫人先走，让杨叔叔断后', dev: 35, check: ['武学', 30], fx: (g) => { g.set('tiexinLives'); g.stat('声望', 6); g.stat('根骨', -6); }, res: '你背着她翻过了三道墙。杨铁心浑身是血地追上来，三个人在城外的破庙里抱头大哭。他们回了江南。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -15); }, res: '你背着她冲到墙下，她挣开你，回到了丈夫身边。', dev: 5 } },
            { t: '去找那个小王爷，当面告诉他生父是谁', dev: 45, cond: (g) => g.recall('knowsTiexin') && g.alive('yangkang'), check: ['情义', 70], fx: (g) => { g.set('yangkangTurned'); g.set('tiexinLives'); g.rel('义弟', 'yangkang'); g.stat('情义', 8); }, res: '完颜康听完，脸色白了。他提剑冲进院子，挡在了父母前面。第二天，他改回了杨姓。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -15); }, res: '他把你赶出了府。院子里传出两声叹息。', dev: 5 } },
          ] },
        { id: 'gj_hong', y: 19, auto: true, t: '洪七公', loc: 'jiangnan', cond: (g) => !g.f('jingStayMongol') && !g.f('jingrongApart'),
          text: (g) => (g.f('jingNoXianglong') ? '一个馋嘴的老叫化闻着叫化鸡找来。蓉儿做了一桌好菜，换他教她打狗棒法。你只在边上学到了三掌。他是北丐洪七公。' : '一个馋嘴的老叫化闻着叫化鸡找来。蓉儿做了一桌好菜，换他教你降龙十八掌。他是北丐洪七公。'),
          fx: (g) => { g.stat('武学', g.f('jingNoXianglong') ? 6 : 20); g.rel('师父', 'hongqigong'); g.info('门派', '丐帮（洪七公弟子）'); } },
        { id: 'gj_hong_alone', y: 19, t: '老叫化', loc: 'jiangnan', cond: (g) => !g.f('jingStayMongol') && g.f('jingrongApart'), text: '酒楼里一个老叫化盯着别人桌上的鸡，口水都快流出来了。他背着一个红漆葫芦。',
          choices: [
            { t: '请他吃鸡', dev: 10, check: ['情义', 70], fx: (g) => { g.stat('武学', 12); g.rel('师父', 'hongqigong'); }, res: '他吃完了才说自己是洪七公。他住了半个月，一掌一掌教你降龙十八掌。',
              fail: { fx: (g) => g.set('jingNoXianglong'), res: '他吃完鸡，抹了抹嘴就走了。你后来才知道，那是北丐洪七公。', dev: 0 } },
            { t: '不理他', canon: true, fx: (g) => g.set('jingNoXianglong'), res: '他看了你一眼，走了。降龙十八掌，你这辈子没学到。' },
          ] },
        { id: 'gj_zhou', y: 19, t: '山洞里的老头', loc: 'taohua', cond: (g) => married(g) && !g.f('zhouFreedEarly'), text: '桃花岛的山洞里关着一个白胡子老头，他要和你结拜，还要教你一部经书，说背熟就行，不用懂。',
          choices: [
            { t: '结拜，把经书背熟', canon: true, fx: (g) => { g.stat('武学', 10); g.rel('结拜兄长', 'zhoubotong'); }, res: '他叫周伯通。你背的是《九阴真经》，你自己不知道。' },
            { t: '来路不明的经书，不背', dev: 15, fx: (g) => { g.stat('悟性', 2); g.rel('结拜兄长', 'zhoubotong'); g.remember('noJiuyin'); }, res: '周伯通很失望，只教了你左右互搏。经书里的疗伤法子，往后你也就不会了。' },
          ] },
        { id: 'gj_zhaoqin', y: 19, auto: true, t: '桃花岛招亲', loc: 'taohua', cond: married, text: (g) => '黄药师出了三道题。第三题是背一本书。' + (g.recall('noJiuyin') ? '那本书你没背过，靠蓉儿在旁边打手势才勉强过关。黄药师的脸色很难看。' : g.alive('ouyangke') ? '欧阳克背得结结巴巴，你一字不差。黄药师的脸色变了又变。' : '你一字不差地背了下来。'), fx: (g) => { g.stat('声望', 6); g.rel('未婚妻', 'huangrong'); } },
        { id: 'gj_wuguai', y: 19, t: '五位师父', cond: (g) => !g.f('jingStayMongol'),
          // 没和黄蓉相识时，师父们上桃花岛不是为了赔礼，是去找黄药师算梅超风的旧账
          text: (g) => (g.f('jingrongNeverMet') ? '你听说五位师父要去桃花岛，找黄岛主算梅超风当年的旧账。' : '你听说五位师父要去桃花岛向黄岛主赔礼。') + '你心里有一种说不出的不安。',
          choices: [
            { t: '让他们去，你随后就到', canon: true, fx: (g) => g.stat('心境', -20), res: '五位师父死在了桃花岛上。大师父柯镇恶说，是黄药师干的。' },
            { t: '跟着一起去', dev: 35, check: ['武学', 50], fx: (g) => { g.set('qiguaiSaved'); g.stat('声望', 6); g.stat('情义', 6); }, res: (g) => '你在岛上撞见了欧阳锋' + (g.alive('yangkang') && !g.f('yangkangTurned') ? '和杨康' : '') + '。五位师父活了下来，往后还能看着你成家。',
              fail: { fx: (g) => { g.stat('心境', -20); g.stat('根骨', -8); }, res: '你晚到了一步，自己还挨了欧阳锋一掌。', dev: 3 } },
            { t: '劝他们别去', dev: 20, check: ['情义', 80], fx: (g) => { g.set('qiguaiSaved'); g.stat('心境', 3); }, res: '大师父骂你没出息，可还是听了。他们在嘉兴多住了一个月，躲过了那一劫。',
              fail: { fx: (g) => g.stat('心境', -20), res: '大师父说，江南七怪说话算话。他们还是去了，没有回来。', dev: 3 } },
          ] },
        { id: 'gj_tiezhang', y: 19, t: '铁掌峰', loc: 'tiezhang', cond: married, text: '蓉儿在铁掌峰中了裘千仞一掌，脸色白得像纸。渔夫说，大理段皇爷能救她，上山要过渔樵耕读四关。',
          choices: [
            { t: '背着她上山闯关', canon: true, fx: (g) => { g.move('yideng'); g.stat('情义', 6); }, res: '一灯大师耗去五年功力，用一阳指救活了她。' },
            { t: '照经书上的法子，自己替她疗伤', dev: 45, cond: (g) => !g.recall('noJiuyin') && !g.recall('noMayu'), check: ['武学', 55], fx: (g) => { g.set('yidengFull'); g.stat('武学', -8); g.stat('情义', 8); }, res: '你用九阴真经里的疗伤篇，耗了七天七夜，把她从鬼门关拉了回来。一灯大师的功力，一分没少。',
              fail: { fx: (g) => { g.set('rongDied'); g.kill('huangrong', '中了裘千仞的铁掌，伤重不治'); g.stat('心境', -50); g.party([]); }, res: '你的内力不够。她死在你怀里，说的最后一句话是“靖哥哥，你别哭”。', dev: 45 } },
            { t: '回桃花岛求黄岛主', dev: 25, check: ['根骨', 60], fx: (g) => { g.set('yidengFull'); g.move('taohua'); g.stat('情义', 5); g.stat('根骨', -5); }, res: '你划了七天船。黄药师用九花玉露丸救了她，看你的眼神第一次软了一点。',
              fail: { fx: (g) => { g.set('rongDied'); g.kill('huangrong', '中了裘千仞的铁掌，死在回桃花岛的船上'); g.stat('心境', -50); g.party([]); }, res: '船到岛前一夜，她没有撑过去。', dev: 25 } },
          ] },
        { id: 'gj_tieqiang', y: 19, t: '铁枪庙', loc: 'jiaxing', cond: (g) => g.alive('yangkang') && !g.f('yangkangTurned') && married(g), text: '嘉兴铁枪庙。杨康一掌拍在蓉儿肩上，软猬甲上沾着欧阳锋的蛇毒。他倒在地上打滚，求欧阳锋给解药，欧阳锋只是笑。',
          choices: [
            { t: '不救', canon: true, fx: (g) => g.stat('心境', -8), res: (g) => (g.f('qiguaiSaved') ? '' : '他害死了五位师父。') + '杨康死在铁枪庙里。你把他葬了，碑上写着“义弟杨康之墓”。' },
            { t: '跪下来求欧阳锋', dev: 30, check: ['情义', 70], fx: (g) => { g.set('yangkangLives'); g.stat('正邪', 5); }, res: '欧阳锋扔给你一个瓶子：“傻小子，你欠我一条命。”杨康活了，从此不敢看你的眼睛。',
              fail: { res: '欧阳锋转身就走了。杨康死在你怀里。', dev: 3 } },
            { t: '扑上去抢解药', dev: 30, check: ['武学', 65], fx: (g) => { g.set('yangkangLives'); g.stat('根骨', -8); }, res: '你挨了欧阳锋一掌，瓶子抢到了手。杨康活了，你吐了三天血。',
              fail: { fx: (g) => g.stat('根骨', -12), res: '欧阳锋一掌把你拍出了庙门。杨康死了。', dev: 3 } },
          ] },
        { id: 'gj_west', y: 20, auto: true, t: '西征', loc: 'westlands', text: (g) => (g.f('lipingSouth') ? '大汗派人来催驸马回营。你把母亲托给师父们照看，北上随军西征。黄沙一眼望不到头。' : '大汗西征花剌子模，你领一个千人队随军。黄沙一眼望不到头。'), fx: (g) => { g.info('身份', '蒙古千夫长'); g.stat('武学', 3); } },
        { id: 'gj_samarkand', y: 21, t: '撒麻尔罕', loc: 'westlands', text: '撒麻尔罕城破了。大汗下令屠城。你立了头功，大汗问你要什么赏赐。',
          choices: [
            { t: '求大汗饶了满城百姓', canon: true, fx: (g) => { g.stat('正邪', 15); g.stat('声望', 10); }, res: '大汗很不高兴，但答应了。城里活下来几十万人。' },
            { t: '不求赏赐，带你的千人队连夜放百姓出城', dev: 25, check: ['声望', 40], fx: (g) => { g.stat('正邪', 18); g.remember('lostFavor'); }, res: '天亮前，几万人从西门走了。大汗知道是你，从此不再召你进帐。',
              fail: { fx: (g) => { g.set('samarkandMassacre'); g.stat('正邪', 10); g.stat('根骨', -10); g.remember('lostFavor'); }, res: '你的人被巡营的发现了。你挨了四十军棍，城门没能打开。那一夜城里的哭声，你记了一辈子。', dev: 5 } },
            { t: '什么也不要', dev: 20, fx: (g) => { g.set('samarkandMassacre'); g.stat('正邪', -20); g.stat('心境', -15); }, res: '那一夜城里的哭声，你记了一辈子。' },
          ] },
        { id: 'gj_liping', y: 22, t: '锦囊', loc: 'grassland', cond: (g) => !g.f('lipingSouth') && g.alive('liping'),
          text: (g) => (g.f('samarkandMassacre') ? '撒麻尔罕的哭声还在你耳朵里。' : '') + (g.f('jingStayMongol') ? '大汗命你领兵攻宋，拿你的母亲做人质。母亲把你叫进帐篷，她说她是汉人。' : (g.recall('lostFavor') ? '大汗早就不信你了。' : '') + '大汗给了你一个锦囊，命你领兵攻宋。你不肯，大汗把你的母亲扣在了营里。'),
          choices: [
            { t: '宁死不攻大宋', canon: true, fx: (g) => { g.kill('liping', '在蒙古军营中自尽，不让儿子为难', true); g.stat('心境', -30); g.stat('正邪', 10); if (g.f('jingStayMongol')) { g.set('jingStayMongol', false); g.set('guoDefected'); } }, res: '母亲在帐里自尽了。你抱着她冲出了蒙古大营，再也没有回去。' },
            { t: '背着母亲连夜出逃', dev: 35, check: ['武学', 65], fx: (g) => { g.set('lipingLives'); g.stat('情义', 10); if (g.f('jingStayMongol')) { g.set('jingStayMongol', false); g.set('guoDefected'); } }, res: '小红马跑了三天三夜。母亲在你背上睡着了，醒来时已经到了长城下。',
              fail: { fx: (g) => { g.kill('liping', '在蒙古军营中自尽，不让儿子为难', true); g.stat('心境', -35); if (g.f('jingStayMongol')) { g.set('jingStayMongol', false); g.set('guoDefected'); } }, res: '追兵太多。母亲不愿拖累你，在营门口自尽了。', dev: 5 } },
            { t: '去求拖雷安答', dev: 20, cond: (g) => !g.recall('noAnda') && g.alive('tuolei'), check: ['情义', 70], fx: (g) => { g.set('lipingLives'); g.stat('情义', 5); if (g.f('jingStayMongol')) { g.set('jingStayMongol', false); g.set('guoDefected'); } }, res: '拖雷连夜开了营门：“安答，走吧，别回头。”',
              fail: { fx: (g) => { g.kill('liping', '在蒙古军营中自尽，不让儿子为难', true); g.stat('心境', -30); }, res: '拖雷不敢违抗父汗。母亲在帐里自尽了。', dev: 5 } },
            { t: '领兵出征', dev: 25, cond: (g) => g.f('jingStayMongol'), fx: (g) => { g.stat('正邪', -30); g.kill('liping', '在儿子出征那天自尽'); }, res: '你出征那天，母亲自尽了。你还是蒙古的将军。' },
          ] },
        { id: 'gj_huashan', y: 22, auto: true, t: '华山论剑', loc: 'huashan', cond: (g) => !g.f('jingStayMongol'),
          text: (g) => (g.f('jingNoXianglong') ? '第二次华山论剑。你没学全降龙掌，只在山腰上远远看着。欧阳锋练九阴真经练疯了，倒立着走下山去。' : '第二次华山论剑。你和洪七公、黄药师各拆了三百招，没有输。欧阳锋练九阴真经练疯了，倒立着走下山去。'),
          fx: (g) => { g.stat('声望', g.f('jingNoXianglong') ? 4 : 18); g.stat('武学', 5); } },
        { id: 'gj_wed', y: 23, auto: true, t: '成亲', loc: 'taohua', cond: married,
          text: (g) => '你和蓉儿在桃花岛成了亲。' + (g.f('qiguaiSaved') ? '五位师父坐在上首，韩小莹哭得比新娘还凶。' : '大师父柯镇恶没有来。') + '洪七公喝醉了，黄药师吹了一夜的箫。',
          fx: (g) => { g.rel('妻子', 'huangrong'); g.unrel('未婚妻'); g.stat('心境', 20); g.party(['huangrong']); } },
        { id: 'gj_wed_alt', y: 23, t: '华筝', cond: (g) => g.f('jingrongApart') && !g.f('jingStayMongol') && g.alive('huazheng') && !g.f('jingRefusedHua'), text: '华筝公主从草原一路找到了中原。她问你，金刀驸马的婚约还算不算数。',
          choices: [
            { t: '劝她回草原', canon: true, fx: (g) => { g.unrel('未婚妻'); g.stat('心境', -6); }, res: '她哭着走了，一辈子没有嫁人。' },
            { t: '算数，娶她', dev: 20, fx: (g) => { g.set('jingWedHua'); g.rel('妻子', 'huazheng'); g.unrel('未婚妻'); g.stat('心境', 8); }, res: '你们在一座小城里成了亲。她学会了包饺子。' },
            { t: '带她回草原，一起过日子', dev: 25, fx: (g) => { g.set('jingWedHua'); g.rel('妻子', 'huazheng'); g.unrel('未婚妻'); g.move('grassland'); g.stat('心境', 6); }, res: '你回到了小时候放羊的地方。华筝说，这才是你该待的地方。' },
          ] },
        { id: 'gj_fu', y: 24, auto: true, t: '长女', cond: married, text: '蓉儿生了一个女儿，取名郭芙。她长得像她娘，脾气也像。', fx: (g) => { g.rel('长女', R('guofu', '郭芙')); g.stat('心境', 10); } },
        { id: 'gj_yangguo', y: 33, t: '杨过', loc: 'jiaxing', cond: hasYG, text: (g) => (g.f('yangguoRaisedByGuo') ? '杨过在你身边长到了十三岁，聪明，顽皮，从不服人。' : '你在嘉兴找到了' + ygName(g) + '。他十三岁，满嘴谎话，眼睛却亮得很。'),
          choices: [
            { t: '带他回桃花岛', canon: true, fx: (g) => { g.move('taohua'); g.rel('世侄', R('yangguo', '杨过')); g.stat('情义', 5); }, res: '岛上的孩子们都不喜欢他。芙儿尤其不喜欢。' },
            { t: '收他做徒弟，亲手教他', dev: 30, fx: (g) => { g.set('yangNoTomb'); g.set('yangguoRaisedByGuo'); g.rel('弟子', R('yangguo', '杨过')); g.stat('情义', 8); }, res: '你教得很慢，他学得很快。他没有去终南山，跟着你去了襄阳。' },
          ] },
        { id: 'gj_zhongnan', y: 34, t: '终南山', loc: 'zhongnan', cond: (g) => hasYG(g) && !g.f('yangNoTomb') && !g.f('jingStayMongol'),
          text: (g) => (married(g) ? '过儿在桃花岛闯了祸，蓉儿不肯教他武功。' : '过儿跟着你一年，闯了不少祸。你粗手笨脚，教不好他。') + '你决定送他上终南山，拜在全真教门下。',
          choices: [
            { t: '送他上山', canon: true, fx: (g) => g.stat('情义', 2), res: '你把他交给了赵志敬。后来你才知道，他在那里受尽了欺负，逃进了一座古墓。' },
            { t: '留在身边，自己教', dev: 30, fx: (g) => { g.set('yangNoTomb'); g.set('yangguoRaisedByGuo'); g.rel('弟子', R('yangguo', '杨过')); }, res: '你没有送他走。他跟着你去了襄阳。' },
            { t: '让他去襄阳，跟着丐帮历练', dev: 25, check: ['悟性', 30], fx: (g) => { g.set('yangNoTomb'); g.rel('世侄', R('yangguo', '杨过')); }, res: '丐帮的鲁有脚带着他跑了几年，他学会了打狗棒法里的三招。',
              fail: { res: '他在丐帮待不住，自己跑上了终南山。', dev: 3 } },
          ] },
        { id: 'gj_xiangyang', y: 36, t: '襄阳', cond: (g) => !g.f('jingStayMongol'),
          text: (g) => (g.f('guoDefected') ? '你从蒙古投奔回来，大宋的官员起初都不信你。' : '') + '蒙古和大宋翻脸了。襄阳是挡在蒙古铁骑前面最要紧的一座城。守城的吕文德派人来请你。',
          choices: [
            { t: '去襄阳，守城', canon: true, fx: (g) => { g.move('xiangyang'); g.info('身份', '襄阳守城的郭大侠'); g.stat('声望', 15); }, res: '你在襄阳一守就是三十多年。' },
            { t: '先去临安上书，请朝廷增兵', dev: 15, check: ['声望', 60], fx: (g) => { g.move('xiangyang'); g.remember('reinforced'); g.stat('声望', 12); g.info('身份', '襄阳守城的郭大侠'); }, res: '朝廷拨了三千兵。你带着他们去了襄阳。这三千人，后来守了你二十年。',
              fail: { fx: (g) => { g.move('xiangyang'); g.info('身份', '襄阳守城的郭大侠'); g.stat('心境', -6); }, res: '你在临安等了三个月，没人见你。你只好自己去了襄阳。', dev: 3 } },
            { t: '带家人回桃花岛', dev: 40, fx: (g) => { g.set('guoLeftXiangyang'); g.move('taohua'); g.stat('心境', 5); g.stat('正邪', -10); }, res: '你回了桃花岛。襄阳城由吕文焕守着，后来的消息都是坏消息。' },
          ] },
        { id: 'gj_mongol_war', y: 36, t: '南征', cond: (g) => g.f('jingStayMongol'), text: '大汗命你领兵南下攻宋，第一个目标是襄阳。你骑在马上，看着南边的天。',
          choices: [
            { t: '领兵出征', dev: 20, fx: (g) => { g.remember('attackedSong'); g.stat('正邪', -30); g.stat('声望', 10); }, res: '你在襄阳城下攻了三个月，没有攻下来。城头上的汉人骂你是汉奸，你听得懂。' },
            { t: '称病辞官', dev: 15, fx: (g) => { g.stat('心境', 5); g.info('身份', '草原上的老牧人'); }, res: '你回到了小时候放羊的那片草原。' },
            { t: '阵前倒戈，投奔襄阳', dev: 40, check: ['正邪', 40], fx: (g) => { g.set('jingStayMongol', false); g.set('guoDefected'); g.move('xiangyang'); g.info('身份', '襄阳守将'); }, res: '你带着一个千人队投了襄阳。守城的人起初不信你，后来都叫你郭将军。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -10); }, res: '你的部下不肯跟你走。你被押回了草原。', dev: 5 } },
          ] },
        { id: 'gj_dsg', y: 39, auto: true, t: '大胜关', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang',
          text: (g) => (g.f('yangMengzhu') ? '大胜关英雄大会，金轮法王来抢盟主，被杨过打退了。蓉儿把盟主之位推给了他。' : '大胜关英雄大会，群雄推你做武林盟主，你推给了蓉儿。' + (g.f('yangNoTomb') ? '金轮法王来抢盟主，被你亲手教出来的过儿打退了。' : '金轮法王来抢盟主，被一个叫杨过的少年和一个白衣姑娘搅了局。')),
          fx: (g) => g.stat('声望', 10) },
        { id: 'gj_twins', y: 40, auto: true, t: '龙凤胎', cond: married, text: '蓉儿在襄阳城外生下一对龙凤胎。女儿叫郭襄，儿子叫郭破虏。', fx: (g) => { g.rel('次女', R('guoxiang', '郭襄')); g.rel('幼子', R('guopolu', '郭破虏')); g.stat('心境', 10); } },
        { id: 'gj_arm', y: 40, t: '断臂', cond: (g) => married(g) && hasYG(g) && !g.f('yangArm') && !g.f('guofuGentle'), text: '芙儿以为过儿害了她妹妹，提着淑女剑去找他。你赶到时，剑已经举起来了。',
          choices: [
            { t: '没拦住', canon: true, fx: (g) => { g.stat('心境', -15); }, res: '过儿的右臂掉在地上。你举剑要砍芙儿的手臂抵偿，被蓉儿拦下了。' },
            { t: '扑上去夺剑', dev: 35, check: ['武学', 80], fx: (g) => { g.set('guofuGentle'); g.set('yangArm'); g.stat('情义', 6); }, res: '淑女剑被你一掌拍飞。过儿两条胳膊都在。芙儿哭了一夜，从此脾气收敛了许多。',
              fail: { fx: (g) => g.stat('心境', -18), res: '你差了一步。', dev: 3 } },
            { t: '挡在过儿身前', dev: 30, check: ['根骨', 60], fx: (g) => { g.set('guofuGentle'); g.set('yangArm'); g.stat('根骨', -12); }, res: '剑砍在你的肩上。芙儿哭着扔了剑。你的左肩从此抬不太高。',
              fail: { fx: (g) => { g.stat('根骨', -8); g.stat('心境', -15); }, res: '你挡住了第一剑，没挡住第二剑。', dev: 3 } },
          ] },
        { id: 'gj_war57', y: 57, auto: true, t: '襄阳大战', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang', text: (g) => '蒙古大汗蒙哥亲率大军攻城。' + (g.recall('reinforced') ? '当年朝廷拨来的三千兵只剩下几百，个个都是老兵。' : '') + (hasYG(g) ? '杨过一颗飞石打死了蒙哥，襄阳解围。' : '城守住了，死了很多人。'), fx: (g) => { g.stat('声望', 10); g.stat('根骨', -4); } },
        { id: 'gj_huashan3', y: 57, auto: true, t: '华山', cond: (g) => !g.f('jingStayMongol'), text: (g) => '第三次华山论剑。东邪、西狂、南僧、北侠、中顽童。' + (g.f('jingNoXianglong') ? '你没学全降龙掌，靠的是三十年守城的名声。' : '') + '江湖上从此叫你“北侠”。', fx: (g) => { g.stat('声望', 12); g.info('身份', '北侠'); } },
        { id: 'gj_old', y: 62, t: '传功', cond: (g) => g.loc === 'xiangyang' && !g.f('jingNoXianglong'), text: '你六十多岁了。降龙十八掌，你这辈子还没传给一个能把它练全的人。',
          choices: [
            { t: '传给丐帮的人', canon: true, fx: (g) => { g.stat('心境', 3); g.rel('降龙掌传人', '丐帮弟子'); }, res: '降龙十八掌留在了丐帮。一代一代传下去，总有几掌会丢。' },
            { t: '传给破虏', dev: 10, cond: married, fx: (g) => { g.set('poluXianglong'); g.stat('情义', 4); }, res: '破虏练得很苦。他说他要守一辈子襄阳，城在人在。' },
            { t: '写成一本书，留给后人', dev: 15, fx: (g) => { g.set('xianglongBook'); g.stat('悟性', 3); }, res: '你写了一年，写得很笨。蓉儿替你改了三遍。书后来不知流落到了哪里。' },
          ] },
        { id: 'gj_forge', y: 70, t: '铸剑', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang' && married(g) && !g.f('yangKeepsSword'), text: '蒙古人就要破城了。过儿留下的玄铁重剑在你手里。蓉儿想把它熔了，铸成一刀一剑，把《九阴真经》和《武穆遗书》藏进去。',
          choices: [
            { t: '照蓉儿说的办', canon: true, fx: (g) => g.stat('心境', 3), res: '倚天剑和屠龙刀铸成了。武林至尊，宝刀屠龙。号令天下，莫敢不从。倚天不出，谁与争锋。' },
            { t: '不藏了，把两部书交给襄儿带走', dev: 30, fx: (g) => { g.set('noBladeSecrets'); g.stat('情义', 4); }, res: '刀剑里什么也没有。将来人人都在抢屠龙刀，没人知道它是空的。' },
            { t: '把玄铁剑还给杨过', dev: 25, cond: hasYG, fx: (g) => { g.set('yangKeepsSword'); g.stat('情义', 4); }, res: '你让人把剑送去终南山。两部书交给了襄儿。刀剑的事，要等她自己去办了。' },
          ] },
        { id: 'gj_fall', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang',
          text: (g) => '城破了。蒙古兵从四面涌进来。' + (married(g) ? '蓉儿站在你身边，像五十年前在张家口那样看着你。' : '你站在城头，身边是跟了你几十年的老兵。') + (g.f('poluXianglong') ? '破虏在你身后打出了一掌亢龙有悔。' : ''),
          choices: [
            { t: '与城共存亡', canon: true, fatal: true, fx: (g) => g.die(married(g) ? '襄阳城破，与黄蓉一同殉城' : '襄阳城破，殉城而死'), res: '你守了襄阳三十五年。' },
            { t: '护着家人杀出去', dev: 40, check: ['武学', 85], fx: (g) => { g.set('guoSurvive'); g.move('hut'); g.stat('心境', -20); }, res: '你们杀出了襄阳。城没了，人还在。你们在终南山下搭了几间草屋。',
              fail: { fx: (g) => g.die('襄阳城破，力战而死'), res: '你杀到城门，回头看了一眼。', dev: 10 } },
            { t: '让蓉儿带孩子们走，你断后', dev: 30, fatal: true, cond: married, fx: (g) => { g.set('rongEscaped'); g.die('襄阳城破，断后力战而死'); }, res: '你守在城门口，直到看不见她们的背影。' },
          ] },
        { id: 'gj_fall_far', y: 71, auto: true, t: '城破', cond: (g) => g.f('guoLeftXiangyang') || g.f('jingStayMongol'), text: (g) => (g.recall('attackedSong') ? '消息传来，襄阳城破了。你当年在城下攻了三个月的那座城，终于没了。你一整天没有说话。' : '消息传来，襄阳城破了。你一整天没有说话。'), fx: (g) => g.stat('心境', -25) },
        { id: 'gj_wudang', y: 80, t: '张君宝', loc: 'hut', cond: (g) => g.f('guoSurvive') && g.alive('zhangsanfeng'), text: (g) => (married(g) ? '你和蓉儿' : '你') + '隐居在终南山下。那个常来听你讲守城旧事的年轻道士张君宝，要去武当山开宗立派了。他来问你，降龙十八掌能不能传给外人。',
          choices: [
            { t: '“降龙十八掌是丐帮的。”', canon: true, fx: (g) => g.rel('忘年交', 'zhangsanfeng'), res: '他点点头，说他自己琢磨出了一套慢拳。' },
            { t: '传给他', dev: 20, fx: (g) => { g.set('xianglongWudang'); g.rel('传人', 'zhangsanfeng'); g.stat('心境', 5); }, res: '武当派后来有一路掌法，刚猛得不像道家的功夫。' },
          ] },
      ],
    },
  }]);

  /* ================= 黄蓉 ================= */
  JY.addChars([{
    id: 'huangrong', name: '黄蓉', py: 'HUANG<<RONG', book: BOOK, sex: '女', born: 4,
    origin: '桃花岛主黄药师的独女', birthplace: '东海桃花岛', home: 'taohua', bg: 5,
    info: { 门派: '桃花岛', 身份: '岛主千金' },
    look: { hair: 'bun', hairColor: '#1b130e', robe: '#e7d9c4', accent: '#d6577d' },
    family: [{ rel: '父亲', id: 'huangyaoshi' }, { rel: '母亲', name: '冯蘅', note: '生下你不久就去世了' }],
    fateText: '嫁给郭靖，做了丐帮帮主，与丈夫镇守襄阳几十年。襄阳城破之日，与郭靖一同殉城。',
    st: [70, 95, 75, 60, 6, 5, 25],
    death: (g) => {
      if (g.f('rongDied')) return { y: 19, cause: '中了裘千仞的铁掌，伤重不治', mod: true };
      if (g.f('guoSurvive')) return { y: 86, cause: '隐居终南山下，寿终', mod: true };
      if (g.f('rongEscaped')) return { y: 83, cause: '带着孩子们逃出襄阳，在桃花岛终老', mod: true };
      if (g.f('guoLeftXiangyang')) return { y: 80, cause: '在桃花岛去世', mod: true };
      if (g.f('jingrongApart')) return { y: 70, cause: '在桃花岛去世，终身未嫁', mod: true };
      return { y: 71, cause: '襄阳城破，与郭靖一同殉城' };
    },
    ms: [[4, '生于桃花岛'], [18, '扮成小叫化离家出走'], [18, '在张家口遇见郭靖', (g) => !g.f('jingrongApart')], [19, '接任丐帮帮主', married],
      [23, '与郭靖成婚', married], [36, '随郭靖镇守襄阳', married], [39, '大胜关英雄大会'], [40, '生下郭襄、郭破虏', married], [72, '隐居终南山下', (g) => g.f('guoSurvive')]],
    arc: {
      focus: '读书识字',
      intro: '你生在东海桃花岛。母亲为了替父亲默写《九阴真经》，耗尽了心力，生下你不久就去世了。父亲给你取名黄蓉。',
      lastWords: '靖哥哥，这一辈子，我从没后悔过。',
      nodes: [
        { id: 'hr_y8', y: 8, auto: true, t: '桃花岛', text: '父亲教你奇门五行、琴棋书画。你学什么都快，学完了就去捉弄岛上的哑仆。', fx: (g) => { g.stat('悟性', 4); g.stat('武学', 3); } },
        { id: 'hr_zhou', y: 10, t: '山洞', text: '你在岛上一个山洞里发现了一个被关着的白胡子老头。他说他叫周伯通，被你爹关了好些年了。',
          choices: [
            { t: '告诉爹', canon: true, fx: (g) => g.stat('悟性', 1), res: '父亲说，别去管那个老顽童。你再去山洞，洞口多了一道你解不开的阵。' },
            { t: '偷偷给他送酒，听他讲故事', dev: 10, fx: (g) => { g.stat('情义', 5); g.stat('武学', 3); g.rel('忘年交', 'zhoubotong'); }, res: '他教了你一招空明拳，讲了一百个故事，有一半是编的。' },
            { t: '偷偷解开阵法，放他走', dev: 20, check: ['悟性', 60], fx: (g) => { g.set('zhouFreedEarly'); g.stat('悟性', 3); g.rel('忘年交', 'zhoubotong'); }, res: '他跳着出了洞，在海边翻了三个跟头，抱着一块木板游走了。爹气得三天没吃饭。将来要在洞里遇见他的人，再也遇不见了。',
              fail: { fx: (g) => g.stat('心境', -3), res: '你解错了一步，阵法反把你困了一夜。爹把你拎了回去。', dev: 0 } },
          ] },
        { id: 'hr_boat', y: 13, auto: true, t: '迷路的渔船', text: '一条迷路的渔船闯进了桃花岛的阵里。父亲让哑仆把船上的人送出阵去，说下次再来，就留下舌头。你知道他说的是真的。', fx: (g) => g.stat('悟性', 1) },
        { id: 'hr_mei', y: 15, auto: true, t: '叛徒', text: '父亲的书房墙上刻着几个名字。他说，陈玄风、梅超风偷了经书叛出师门，所以他把其余的徒弟也都赶走了。', fx: (g) => g.stat('悟性', 2) },
        { id: 'hr_run', y: 18, t: '离家', text: '父亲为了一件小事骂了你。你一赌气，想扮成小叫化，一个人离开桃花岛。',
          choices: [
            { t: '走', canon: true, fx: (g) => { g.move('zhangjiakou'); g.info('身份', '小叫化'); }, res: '你抹黑了脸，坐上了一条去北边的船。' },
            { t: '还是留下来', dev: 50, fx: (g) => { g.set('jingrongApart'); g.set('jingrongNeverMet'); g.stat('心境', -3); }, res: '你在岛上又住了五年。那个本该遇见的人，你一辈子都不知道他是谁。' },
          ] },
        { id: 'hr_zjk', y: 18, t: '张家口', loc: 'zhangjiakou', cond: (g) => !g.f('jingrongApart'), text: '张家口的酒楼里，你点了一桌子菜，想看看谁是冤大头。一个傻小子替你付了账，还把貂裘和小红马都送给了你。',
          choices: [
            { t: '跟着这个傻小子', canon: true, fx: (g) => { g.rel('知己', 'guojing'); g.party(['guojing']); g.stat('心境', 10); }, res: '他叫郭靖。你叫他靖哥哥。' },
            { t: '道声谢就走', dev: 40, fx: (g) => { g.set('jingrongApart'); g.set('jingrongNeverMet'); }, res: '你一个人走遍了江湖。那个傻小子后来怎么样了，你没打听过。' },
          ] },
        { id: 'hr_hong', y: 19, t: '叫化鸡', loc: 'jiangnan', cond: (g) => !g.f('jingrongApart'), text: '一个馋嘴的老叫化闻着你做的叫化鸡找来了。他是北丐洪七公，一辈子只爱吃。你做一道菜，他就肯教一招。',
          choices: [
            { t: '天天做菜，换他教靖哥哥降龙十八掌', canon: true, fx: (g) => { g.rel('师父', 'hongqigong'); g.stat('武学', 8); g.stat('情义', 6); }, res: '他教了靖哥哥十五掌，教了你逍遥游。' },
            { t: '换他教你自己', dev: 20, fx: (g) => { g.rel('师父', 'hongqigong'); g.set('jingNoXianglong'); g.stat('武学', 18); }, res: '你学了打狗棒法。靖哥哥只在边上学到了三掌。将来华山上，他就站不到前头去了。' },
          ] },
        { id: 'hr_guiyun', y: 19, auto: true, t: '归云庄', loc: 'guiyun', text: '太湖归云庄的庄主陆乘风是父亲的旧徒弟，双腿残废。他求你在父亲面前替他说句话。你答应了。', fx: (g) => g.stat('情义', 3) },
        { id: 'hr_tz', y: 19, t: '铁掌峰', loc: 'tiezhang', cond: (g) => !g.f('jingrongApart'), text: '铁掌峰上，你中了裘千仞一掌，胸口像压着一块冰。靖哥哥背着你，问你该去哪里。',
          choices: [
            { t: '去大理找南帝', canon: true, fx: (g) => { g.move('yideng'); g.stat('根骨', -5); g.stat('悟性', 2); }, res: '你一路猜谜、对对子，闯过了渔樵耕读四关。一灯大师耗去五年功力救了你。' },
            { t: '回桃花岛找爹', dev: 35, check: ['根骨', 60], fx: (g) => { g.set('yidengFull'); g.move('taohua'); g.stat('根骨', -20); }, res: '你在船上昏了七天。父亲用九花玉露丸把你救了回来，只是落下了病根。一灯大师的五年功力，留在了他自己身上。',
              fail: { fx: (g) => { g.set('rongDied'); g.die('中了裘千仞的铁掌，死在回桃花岛的船上'); }, res: '船还没到岛，你就撑不住了。', dev: 35 } },
            { t: '照九阴真经里的法子，自己疗伤', dev: 30, check: ['武学', 40], fx: (g) => { g.set('yidengFull'); g.stat('根骨', -15); g.stat('悟性', 4); }, res: '你在山洞里运了七天功，伤好了一大半，留下了一点病根。',
              fail: { fx: (g) => { g.set('rongDied'); g.die('中了裘千仞的铁掌，运功疗伤时走岔了气'); }, res: '真气走岔了。靖哥哥抱着你喊了一夜。', dev: 30 } },
          ] },
        { id: 'hr_wuguai', y: 19, t: '真凶', cond: (g) => !g.f('jingrongApart') && !g.f('qiguaiSaved'), text: '江南五怪死在桃花岛上，人人都说是你爹干的。靖哥哥不肯再见你。你知道不是。',
          choices: [
            { t: '在铁枪庙当众推出真凶', canon: true, fx: (g) => { g.move('jiaxing'); g.stat('声望', 10); g.stat('悟性', 2); }, res: '你一条一条说出来，真凶是欧阳锋。柯镇恶听完，跪在地上哭了。' },
            { t: '先去找柯镇恶单独说', dev: 20, check: ['情义', 60], fx: (g) => { g.remember('keForgave'); g.stat('情义', 6); g.stat('声望', 5); }, res: '他拿铁杖指着你。你一条一条说完，他放下了杖。靖哥哥是他带回来的。从那天起，大师父待你像待自己的女儿。',
              fail: { fx: (g) => { g.set('jingrongApart'); g.stat('心境', -15); }, res: '他不肯听。靖哥哥也跟着他走了。', dev: 10 } },
            { t: '不辩了，回桃花岛', dev: 35, fx: (g) => { g.set('jingrongApart'); g.move('taohua'); g.stat('心境', -20); }, res: '他没有来找你。你们之间，从此隔了五条人命。' },
          ] },
        { id: 'hr_yk', y: 19, t: '软猬甲', loc: 'jiaxing', cond: (g) => g.alive('yangkang') && !g.f('yangkangTurned') && !g.f('jingrongApart'), text: '杨康一掌拍在你肩上，软猬甲上沾着欧阳锋的蛇毒。他倒在地上，求欧阳锋给解药。你身上有父亲的九花玉露丸。',
          choices: [
            { t: '袖手旁观', canon: true, fx: (g) => g.stat('正邪', -2), res: '杨康死在了铁枪庙。' },
            { t: '给他一颗九花玉露丸', dev: 30, fx: (g) => { g.set('yangkangLives'); g.stat('正邪', 8); }, res: '杨康活了下来。他看你的眼神里，第一次没有算计。' },
            { t: '逼欧阳锋拿解药出来', dev: 25, check: ['悟性', 80], fx: (g) => { g.set('yangkangLives'); g.stat('声望', 4); }, res: '你说出他杀江南五怪的每一个细节。他恼羞成怒，扔下了解药，转身就走。',
              fail: { fx: (g) => g.stat('心境', -4), res: '他只是笑。杨康死了。', dev: 3 } },
          ] },
        { id: 'hr_mei_die', y: 19, t: '梅超风', cond: (g) => g.alive('meichaofeng') && !g.f('jingrongApart'),
          text: (g) => '欧阳锋一掌劈向父亲的后背。瞎眼的梅超风听见风声，扑了上去。' + (g.f('meiHomesick') ? '你听说过，她一直念着桃花岛。' : ''),
          choices: [
            { t: '来不及了', canon: true, fx: (g) => g.stat('心境', -5), res: '梅超风死在父亲怀里。父亲收回了逐她出门的话。' },
            { t: '用打狗棒挑开欧阳锋的手腕', dev: 25, check: ['武学', 50], fx: (g) => { g.set('meiLives'); g.stat('声望', 5); }, res: '欧阳锋的掌偏了三寸。梅超风跪在地上，叫了一声“师父”。父亲让她回了桃花岛。',
              fail: { res: '你的棒子慢了一步。', dev: 3 } },
            { t: '喊一声让爹回头', dev: 20, check: ['悟性', 60], fx: (g) => { g.set('meiLives'); g.stat('情义', 3); }, res: '爹侧身让过了那一掌。梅超风扑了个空，被爹扶住了。', fail: { fx: (g) => g.stat('心境', -5), res: '声音没有掌风快。', dev: 3 } },
          ] },
        { id: 'hr_junshan', y: 19, auto: true, t: '君山', cond: (g) => !g.f('jingrongApart') && g.alive('hongqigong'), text: (g) => '君山丐帮大会。' + (g.alive('yangkang') && !g.f('yangkangGaibang') && !g.f('yangkangTurned') ? '杨康拿着一根假打狗棒自称帮主，被你当众拆穿。' : '') + '洪七公把打狗棒交到你手里，你做了丐帮帮主。', fx: (g) => { g.info('门派', '丐帮'); g.info('身份', '丐帮帮主'); g.stat('声望', 20); } },
        { id: 'hr_hs', y: 22, auto: true, t: '华山', loc: 'huashan', cond: married, text: (g) => (g.f('jingNoXianglong') ? '第二次华山论剑。靖哥哥只学了三掌降龙，站在山腰上看。你有点后悔当初没让七公教他。' : '第二次华山论剑。靖哥哥和师父、爹爹各拆三百招。你在一边替他捏了一把汗，也替爹爹捏了一把汗。'), fx: (g) => g.stat('心境', 6) },
        { id: 'hr_wed', y: 23, auto: true, t: '成亲', loc: 'taohua', cond: married,
          text: (g) => '你和靖哥哥在桃花岛成了亲。' + (g.recall('keForgave') ? '柯大师父拄着铁杖来了，喝得比谁都多。' : '') + (g.f('meiLives') ? '梅师姐坐在角落里，听着爹的箫声流泪。' : '') + '爹爹吹了一夜的箫，箫声里没有一点不高兴。',
          fx: (g) => { g.rel('丈夫', 'guojing'); g.unrel('知己'); g.party(['guojing']); g.stat('心境', 20); } },
        { id: 'hr_alone', y: 23, t: '一个人', cond: (g) => g.f('jingrongApart'), text: '你一个人在江湖上走了五年，扮过书生，扮过渔婆，扮过老太太。父亲托人带话，问你要不要回桃花岛。',
          choices: [
            { t: '回去陪爹', canon: true, fx: (g) => { g.move('taohua'); g.stat('情义', 6); }, res: '父亲站在码头上等你，头发白了一半。' },
            { t: '去找那个傻小子', dev: 30, cond: (g) => g.alive('guojing') && !g.f('jingStayMongol') && !g.f('jingWedHua'), check: ['情义', 60], fx: (g) => { g.set('jingrongApart', false); g.set('jingrongNeverMet', false); g.rel('丈夫', 'guojing'); g.party(['guojing']); g.move('taohua'); g.stat('心境', 20); }, res: '你在嘉兴找到了他。他看了你半天，说：“我等了你五年。”那年秋天，你们在桃花岛成了亲。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你找了半年没找到。有人说他去了北边。', dev: 3 } },
            { t: '收几个女弟子，传桃花岛的功夫', dev: 15, fx: (g) => { g.stat('声望', 8); g.info('身份', '桃花岛的黄姑娘'); g.rel('弟子', '三个女徒弟'); }, res: '你收了三个徒弟，一个都不笨。' },
          ] },
        { id: 'hr_fu', y: 24, auto: true, t: '芙儿', cond: married, text: '你生了一个女儿，取名郭芙。她长得像你，脾气也像你，只是不如你聪明。', fx: (g) => { g.rel('长女', R('guofu', '郭芙')); g.stat('心境', 8); } },
        { id: 'hr_yangguo', y: 33, t: '杨过', loc: 'taohua', cond: (g) => married(g) && hasYG(g) && !g.f('yangguoRaisedByGuo'), text: (g) => '靖哥哥把' + ygName(g) + '带回了桃花岛。这孩子的眼神，和他爹一模一样。',
          choices: [
            { t: '只教他读书，不教武功', canon: true, fx: (g) => g.stat('正邪', -2), res: '他看出了你防着他，什么也没说。第二年，他被送上了终南山。' },
            { t: '把他当亲生孩子教', dev: 25, fx: (g) => { g.set('rongTaughtYang'); g.stat('情义', 10); g.rel('弟子', R('yangguo', '杨过')); }, res: '他学得比芙儿快十倍。他第一次叫你“郭伯母”的时候，眼睛红了。' },
            { t: '劝靖哥哥别送他走，留在身边', dev: 25, fx: (g) => { g.set('yangNoTomb'); g.set('yangguoRaisedByGuo'); g.rel('世侄', R('yangguo', '杨过')); }, res: '靖哥哥高兴得一夜没睡。过儿没有上终南山，跟着你们去了襄阳。' },
          ] },
        { id: 'hr_xy', y: 36, t: '守城', cond: married, text: '蒙古南下。靖哥哥要去守襄阳。你知道守下去是什么结局，他也知道。',
          choices: [
            { t: '陪他去', canon: true, fx: (g) => { g.move('xiangyang'); g.stat('情义', 8); }, res: '你替他出主意、排阵、管丐帮，在襄阳一住三十多年。' },
            { t: '劝他回桃花岛', dev: 40, check: ['悟性', 85], fx: (g) => { g.set('guoLeftXiangyang'); g.move('taohua'); g.stat('心境', 3); }, res: '你说了一夜。他终于点了头，可后来每年都要望着西边发呆。',
              fail: { fx: (g) => g.move('xiangyang'), res: '他听完了，说：“蓉儿，你自己也不信这些话。”你们还是去了襄阳。', dev: 0 } },
          ] },
        { id: 'hr_xy_alone', y: 36, t: '襄阳告急', cond: (g) => g.f('jingrongApart'), text: '襄阳告急。有人来请你去出谋划策，说守城的人里缺一个脑子好使的。',
          choices: [
            { t: '不去', canon: true, res: '你在桃花岛上看了一夜的海。' },
            { t: '去', dev: 10, fx: (g) => { g.move('xiangyang'); g.stat('声望', 10); }, res: '你在襄阳城头摆了一个阵，蒙古人三个月没攻进来。你在城里住了下来。' },
            { t: '画一张阵图，托人送去', dev: 10, fx: (g) => { g.set('rongMapXiangyang'); g.stat('悟性', 2); }, res: '三个月后，有人说襄阳城头多了一个石阵，守城的人都不知道是谁画的。' },
          ] },
        { id: 'hr_dsg', y: 39, t: '大胜关', loc: 'xiangyang', cond: married, text: '大胜关英雄大会。金轮法王带着蒙古高手来抢武林盟主。你手下能打的人不多，有一个叫杨过的少年，身边跟着一个白衣姑娘。',
          choices: [
            { t: '让杨过和那姑娘出手', canon: true, fx: (g) => { g.stat('声望', 6); g.info('身份', '丐帮帮主、武林盟主'); }, res: '他们赢了。群雄推靖哥哥做盟主，他推给了你。天下人议论的，却都是那对师徒。' },
            { t: '你亲自上场，用打狗棒对金轮', dev: 15, check: ['武学', 70], fx: (g) => { g.stat('声望', 15); g.info('身份', '丐帮帮主、武林盟主'); }, res: '金轮法王的五个轮子被你挑落了两个。盟主是你自己打下来的。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '你挡了十招，伤了肩膀。最后还是杨过上了。', dev: 3 } },
            { t: '赢了以后，推杨过做盟主', dev: 25, cond: hasYG, fx: (g) => { g.set('yangMengzhu'); g.stat('情义', 6); }, res: '群雄愣了，杨过也愣了。他做了三天盟主，就带着他师父走了。江湖上从此没人敢当面议论他们。' },
          ] },
        { id: 'hr_twins', y: 40, t: '龙凤胎', cond: married, text: '你在襄阳城外的荒野里生下一对龙凤胎。还没来得及看清女儿的脸，赤练仙子李莫愁就把她抢走了。',
          choices: [
            { t: '让杨过去追', canon: true, fx: (g) => { g.rel('次女', R('guoxiang', '郭襄')); g.rel('幼子', R('guopolu', '郭破虏')); }, res: '杨过把襄儿抱回来的时候，她已经喝了好些天的豹子奶。' },
            { t: '自己抱病去追', dev: 20, check: ['根骨', 50], fx: (g) => { g.stat('根骨', -15); g.rel('次女', R('guoxiang', '郭襄')); g.rel('幼子', R('guopolu', '郭破虏')); }, res: '你追回了襄儿，自己落下了病根。',
              fail: { fx: (g) => { g.stat('根骨', -10); g.rel('次女', R('guoxiang', '郭襄')); g.rel('幼子', R('guopolu', '郭破虏')); }, res: '你追不上。最后还是杨过把襄儿抱了回来。', dev: 3 } },
            { t: '叫丐帮封住所有的路', dev: 15, fx: (g) => { g.rel('次女', R('guoxiang', '郭襄')); g.rel('幼子', R('guopolu', '郭破虏')); g.stat('声望', 4); }, res: '李莫愁跑不出去。三天后，杨过把襄儿抱了回来。' },
          ] },
        { id: 'hr_arm', y: 40, t: '芙儿闯了祸', cond: (g) => married(g) && hasYG(g) && !g.f('yangArm') && !g.f('guofuGentle'), text: (g) => '芙儿一剑斩断了过儿的右臂。' + (g.f('yangMengzhu') ? '那是群雄推过的盟主。' : '') + '靖哥哥提着剑要砍芙儿一条手臂抵偿。',
          choices: [
            { t: '拦住他，让芙儿连夜出城', canon: true, fx: (g) => g.stat('心境', -10), res: (g) => (g.f('rongTaughtYang') ? '过儿是你手把手教大的。靖哥哥一夜没跟你说话，你也一夜没睡。' : '靖哥哥一夜没跟你说话。') },
            { t: '押着芙儿去给过儿磕头赔罪', dev: 20, fx: (g) => { g.set('fuApologized'); g.stat('情义', 8); g.stat('正邪', 5); }, res: '芙儿磕了头。过儿没有受，转身走了。芙儿哭了一夜，第二天说，她想明白了。' },
            { t: '亲自去给过儿上药', dev: 15, fx: (g) => { g.stat('情义', 5); g.rel('欠了一条胳膊的人', R('yangguo', '杨过')); }, res: '过儿闭着眼让你上药。走的时候他说：郭伯母，这不怪你。这句话你记了一辈子。' },
          ] },
        { id: 'hr_gaibang', y: 45, t: '帮主', cond: married, text: '你做了二十多年丐帮帮主，该把打狗棒传下去了。',
          choices: [
            { t: '传给鲁有脚', canon: true, fx: (g) => g.info('身份', '前丐帮帮主'), res: '鲁有脚做事稳当。打狗棒法你只传了他一半，另一半等他用得着了再说。' },
            { t: '传给女婿耶律齐', dev: 10, fx: (g) => g.info('身份', '前丐帮帮主'), res: '耶律齐是契丹人，帮里有人不服。你压下去了。' },
            { t: '先不传，再做几年', dev: 10, fx: (g) => { g.stat('声望', 6); g.stat('根骨', -6); g.remember('stillChief'); }, res: '你又做了好些年帮主，累出了一身病。' },
          ] },
        { id: 'hr_war57', y: 57, auto: true, t: '襄阳大战', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang' && married(g),
          text: (g) => '蒙哥亲率大军攻城。' + (g.recall('stillChief') ? '你还拄着打狗棒，在城头指挥叫化子们搬石头。' : '') + (hasYG(g) ? '杨过一颗飞石打死了蒙哥。那天夜里，襄儿十七岁生日，城头放了满天的烟花，都是杨过送的。' + (g.f('fuApologized') ? '芙儿站在城头，第一次冲他笑了笑。' : '') : '城守住了。'),
          fx: (g) => g.stat('心境', 8) },
        { id: 'hr_xiang', y: 60, t: '襄儿', cond: (g) => married(g) && (!JY.byId.guoxiang || g.alive('guoxiang')), text: '襄儿二十岁了，整天往外跑，说是要找一个人。你知道她找的是谁。',
          choices: [
            { t: '由她去', canon: true, fx: (g) => g.stat('心境', -3), res: '她走遍了天下。' },
            { t: '把你会的都教给她，再放她走', dev: 15, fx: (g) => { g.set('xiangTaughtByRong'); g.rel('传人', R('guoxiang', '郭襄')); g.stat('情义', 5); }, res: '奇门五行、打狗棒法、落英神剑掌，你教了她一年。她走的时候说，娘，我会回来的。' },
            { t: '把她留在襄阳，陪在身边', dev: 15, fx: (g) => { g.remember('xiangHome'); g.stat('情义', 3); g.stat('心境', 3); }, res: '她留了下来，每天在城头站一会儿，往北边看。你知道她在等谁，也知道等不到。' },
          ] },
        { id: 'hr_forge', y: 70, t: '铸剑', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang' && married(g) && !g.f('yangKeepsSword'),
          text: (g) => '城快守不住了。你想把杨过留下的玄铁重剑熔了，铸成一刀一剑，把《九阴真经》和《武穆遗书》藏进去，留给后人。' + (g.recall('xiangHome') ? '襄儿就在你身边看着炉火。' : '') + (g.f('xiangTaughtByRong') ? '襄儿学过你的本事，这些东西交给她，你放心。' : ''),
          choices: [
            { t: '藏进去', canon: true, fx: (g) => g.stat('悟性', 2), res: '刀剑铸成。剑给了襄儿，刀给了破虏。将来谁能把刀剑互斫，谁就能得到里面的东西。' },
            { t: '不藏了，交给襄儿亲手保管', dev: 30, fx: (g) => g.set('noBladeSecrets'), res: '刀剑是空的。两部书跟着襄儿去了峨嵋。' },
            { t: '把玄铁剑送还杨过', dev: 25, cond: hasYG, fx: (g) => { g.set('yangKeepsSword'); g.stat('情义', 4); }, res: '你让人把剑送去终南山。两部书交给了襄儿。刀剑的事，要等她自己去办了。' },
          ] },
        { id: 'hr_fall', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang' && married(g),
          text: (g) => '城破了。靖哥哥站在你身边。你身上还有最后一个主意没用。' + (g.recall('xiangHome') ? '襄儿也在城里。' : ''),
          choices: [
            { t: '陪他守到最后', canon: true, fatal: true, fx: (g) => g.die('襄阳城破，与郭靖一同殉城'), res: (g) => (g.recall('xiangHome') ? '你逼着襄儿从水门走了。然后你们死在了一起。' : '你们死在了一起。') },
            { t: '用你最后一个主意，带他突围', dev: 40, check: ['悟性', 90], fx: (g) => { g.set('guoSurvive'); g.move('hut'); g.stat('心境', -20); }, res: '你让人在城东放火，从城西的水门出去了。靖哥哥一路都在回头。',
              fail: { fx: (g) => g.die('襄阳城破，突围时战死'), res: '这一次，你的主意没有用。', dev: 10 } },
            { t: '让靖哥哥带孩子们走，你留下', dev: 30, fatal: true, fx: (g) => { g.set('jingEscaped'); g.die('襄阳城破，断后力战而死'); }, res: '他回头看了你一眼。你笑着冲他摆了摆手，像在张家口那天一样。' },
          ] },
        { id: 'hr_fall_alone', y: 71, auto: true, t: '城破', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang' && !married(g), text: '城破了。你在城头摆的石阵挡了蒙古兵半天，够城里的百姓从水门逃出去。你最后一个走，回头看了一眼城头。', fx: (g) => { g.move('taohua'); g.stat('声望', 10); g.stat('心境', -15); } },
        { id: 'hr_hermit', y: 75, auto: true, t: '终南山下', loc: 'hut', cond: (g) => g.f('guoSurvive'), text: '你们在终南山下搭了几间草屋。靖哥哥每天去山上砍柴，回来的时候总要往襄阳的方向看一眼。', fx: (g) => g.stat('心境', 8) },
        { id: 'hr_old', y: 80, auto: true, t: '旧事', cond: (g) => g.f('guoSurvive'), text: '一个叫张君宝的年轻道士常来草屋，听你讲华山论剑的旧事。你讲了三天，全是靖哥哥。他说，书里最笨的那个，原来最了不起。', fx: (g) => g.stat('心境', 5) },
      ],
    },
  }]);

  /* ================= 杨康 ================= */
  JY.addChars([{
    id: 'yangkang', name: '杨康', py: 'YANG<<KANG', book: BOOK, sex: '男', born: 1,
    origin: '金国赵王府的小王爷完颜康', birthplace: '金国中都', home: 'zhongdu', bg: 5,
    info: { 门派: '无', 身份: '金国小王爷' },
    look: { hair: 'topknot', hairColor: '#1a1410', robe: '#3e5f8a', accent: '#d8b45a' },
    family: [{ rel: '母亲', id: 'baoxiruo' }, { rel: '养父', id: 'wanyanhonglie' }, { rel: '生父', id: 'yangtiexin', note: '你还不知道' }],
    fateText: '认贼作父，不肯认生父杨铁心。在嘉兴铁枪庙掌击黄蓉，中了软猬甲上的蛇毒而死。',
    st: [72, 75, 75, 40, 4, 10, -5],
    death: (g) => {
      if (g.f('yangkangTurned')) return { y: 58, cause: '在嘉兴寿终', mod: true };
      if (g.f('yangkangLives')) return { y: 52, cause: '隐姓埋名，病逝于江南', mod: true };
      return { y: 19, cause: '在嘉兴铁枪庙中毒身亡' };
    },
    ms: [[1, '生于金国赵王府'], [8, '拜丘处机为师'], [14, '暗中跟梅超风学九阴白骨爪'], [18, '比武招亲赢了穆念慈却不娶'],
      [18, '认了生父，离开金国', (g) => g.f('yangkangTurned')], [19, '在君山冒充丐帮帮主', (g) => !g.f('yangkangTurned') && !g.f('yangkangGaibang')],
      [20, '在江南隐姓埋名', (g) => g.f('yangkangLives')], [20, '与穆念慈、杨过住在嘉兴', (g) => g.f('yangkangTurned')]],
    arc: {
      focus: '读书识字',
      intro: '你生在金国中都的赵王府，是六王爷完颜洪烈的独子，名叫完颜康。母亲包惜弱住的院子和王府别处都不一样，是一间江南农舍，屋里挂着一杆旧铁枪。',
      lastWords: '我姓杨，还是姓完颜？',
      nodes: [
        { id: 'yk_y3', y: 3, auto: true, t: '小王爷', text: '你两岁就有了自己的小马驹和四个嬷嬷。父王抱着你上朝，满朝的金国大臣都夸你。', fx: (g) => g.stat('声望', 3) },
        { id: 'yk_y5', y: 6, auto: true, t: '旧铁枪', text: '你问母亲，屋里那杆铁枪是谁的。母亲没有回答，只是摸了摸你的头，眼睛红了。', fx: (g) => g.stat('悟性', 2) },
        { id: 'yk_qiu', y: 8, t: '道士师父', text: '王府请来一个道士教你武功，他叫丘处机。他看你的眼神很奇怪，像在看一个故人的孩子。',
          choices: [
            { t: '拜他为师', canon: true, fx: (g) => { g.rel('师父', 'qiuchuji'); g.info('门派', '全真教（俗家）'); g.stat('武学', 5); }, res: '他教得很严，你学得很快。' },
            { t: '拜师，再追问他为什么这样看你', dev: 10, check: ['悟性', 70], fx: (g) => { g.rel('师父', 'qiuchuji'); g.info('门派', '全真教（俗家）'); g.stat('武学', 5); g.remember('suspects'); }, res: '他沉默了很久，说你像他一个故人。那个故人姓杨。这句话你一直没忘。',
              fail: { fx: (g) => { g.rel('师父', 'qiuchuji'); g.info('门派', '全真教（俗家）'); g.stat('武学', 4); }, res: '他说小孩子别问那么多。', dev: 0 } },
            { t: '小王爷不拜汉人道士', dev: 10, fx: (g) => { g.stat('武学', 2); g.stat('正邪', -5); g.rel('师父', '金国武师'); g.remember('noQiu'); }, res: '父王给你另请了一个金国武师，教的都是花架子。那个道士走的时候，回头看了你一眼。' },
          ] },
        { id: 'yk_mafu', y: 10, t: '马夫', text: '一个汉人马夫冲撞了你的马。你用鞭子把他抽得满地打滚。母亲在廊下看着，一句话也没说。',
          choices: [
            { t: '不当回事', canon: true, fx: (g) => g.stat('正邪', -6), res: '那天夜里，母亲的屋里一直亮着灯。' },
            { t: '去给马夫送药', dev: 10, fx: (g) => { g.stat('正邪', 8); g.stat('情义', 5); g.remember('kind'); }, res: '马夫吓得跪下磕头。母亲知道了，第一次抱着你哭了。' },
            { t: '问母亲为什么不说话', dev: 10, check: ['情义', 40], fx: (g) => { g.stat('悟性', 3); g.remember('suspects'); }, res: '母亲说：“他也是爹娘生的。你也是。”你那时候还不懂，她说的“也”是什么意思。', fail: { res: '母亲只是摇头。', dev: 0 } },
          ] },
        { id: 'yk_y12', y: 12, auto: true, t: '王府', text: '王府里来来往往的都是江湖高手：梁子翁、沙通天、彭连虎。他们都叫你小王爷，对你笑。', fx: (g) => g.stat('声望', 3) },
        { id: 'yk_fox', y: 13, auto: true, t: '白狐', text: '父王带你去围猎。你一箭射中了一只白狐，又补了一箭。父王说，这才是大金的儿郎。母亲听说了，那天没有吃饭。', fx: (g) => g.stat('武学', 2) },
        { id: 'yk_mei', y: 14, t: '瞎眼的女人', text: (g) => '父王请来一个瞎眼的女人，在王府后园教你一种爪功。' + (g.recall('noQiu') ? '' : '丘道长不知道。') + '她叫梅超风。',
          choices: [
            { t: '偷偷学', canon: true, fx: (g) => { g.stat('武学', 8); g.stat('正邪', -6); g.rel('暗中的师父', 'meichaofeng'); }, res: '你学会了九阴白骨爪。练功用的是活人的骨头，你没多问。' },
            { t: '不学这种邪门功夫', dev: 15, fx: (g) => { g.stat('正邪', 6); g.stat('悟性', 2); g.remember('noClaw'); }, res: '梅超风冷笑了一声，再没来过。你的手上，没沾过白骨爪的血。' },
          ] },
        { id: 'yk_war', y: 16, t: '大金将军', text: '父王说，大金迟早要南下灭宋，你将来要做大金的将军，把汉人都赶到海里去。',
          choices: [
            { t: '“孩儿愿为大金效死。”', canon: true, fx: (g) => { g.stat('声望', 4); g.stat('正邪', -4); g.info('志向', '做大金的将军'); }, res: '父王很高兴，赏了你一匹汗血马。' },
            { t: '回去问母亲：我们是金人还是汉人？', dev: 15, check: ['情义', 50], fx: (g) => { g.stat('悟性', 4); g.remember('suspects'); }, res: '母亲的茶碗掉在了地上。她说，你是娘的儿子。那一夜，你把屋里那杆铁枪看了很久。', fail: { res: '母亲说，别乱想。', dev: 3 } },
          ] },
        { id: 'yk_linan', y: 17, auto: true, t: '出使临安', loc: 'lintan', text: '父王派你随金国使团去临安。宋朝的官员见了你，一个个点头哈腰。你在西湖边住了一个月，觉得南人软弱。', fx: (g) => { g.stat('声望', 4); g.stat('正邪', -3); } },
        { id: 'yk_back', y: 18, auto: true, t: '回中都', loc: 'zhongdu', text: '你回到了中都。母亲问你江南怎么样，你说，湖很好看。她笑了，又哭了。', fx: (g) => g.stat('情义', 2) },
        { id: 'yk_bizhao', y: 18, t: '比武招亲', loc: 'zhongdu', text: '中都街头，一个叫穆念慈的姑娘比武招亲。你一时兴起下场，赢了她。她的父亲要你娶她。你是大金国的小王爷。',
          choices: [
            { t: '赢了就走，不认这门亲', canon: true, fx: (g) => { g.stat('正邪', -5); g.rel('心上人', 'munianci'); }, res: '一个从蒙古来的傻小子跳上台和你打了一场。那个姑娘一直看着你。' },
            { t: '认下这门亲', dev: 25, fx: (g) => { g.set('yangkangMarried'); g.rel('未婚妻', 'munianci'); g.stat('情义', 15); g.stat('心境', 8); }, res: '街上的人都在起哄。她红着脸，没有躲开你的手。' },
          ] },
        { id: 'yk_father', y: 18, t: '生父', loc: 'zhongdu',
          text: (g) => '那个比武招亲的老汉叫杨铁心，是你的亲生父亲。母亲要跟他走。父王带兵把他们围在了院子里。' + (g.recall('suspects') ? '你早就起过疑心，这一刻全对上了。' : '') + (g.recall('kind') ? '母亲看着你，像看那年给马夫送药的孩子。' : '') + (g.recall('noClaw') ? '你的手上干干净净，叫他一声爹，不用觉得脏。' : ''),
          choices: [
            { t: '站在父王身边', canon: true, fx: (g) => { tiexinDie(g); g.stat('心境', -25); }, res: '杨铁心和你母亲在你面前自尽了。你还是小王爷。' },
            { t: '护着生父生母杀出去', dev: 45, check: ['武学', 40], fx: (g) => { g.set('yangkangTurned'); g.set('tiexinLives'); g.info('身份', '杨铁心之子'); g.info('志向', ''); g.stat('正邪', 30); g.party(['yangtiexin', 'baoxiruo']); g.move('jiaxing'); }, res: '你杀出了王府，从此叫杨康，不再叫完颜康。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -35); g.stat('正邪', 10); }, res: '你挡住了前门，挡不住后门。他们还是死了。', dev: 10 } },
            { t: '跪下求父王放他们走', dev: 35, check: ['情义', 55], fx: (g) => { g.set('tiexinLives'); g.stat('情义', 8); g.stat('心境', -5); }, res: '父王看了你很久，挥手让兵退开了。他们走了。你还是小王爷，只是父王从此看你的眼神变了。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -30); }, res: '父王没有答应。他们在你面前自尽了。', dev: 5 } },
            { t: '当场跪下，叫他一声爹', dev: 45, cond: (g) => g.recall('suspects'), fx: (g) => { g.set('yangkangTurned'); g.set('tiexinLives'); g.info('身份', '杨铁心之子'); g.info('志向', ''); g.stat('正邪', 30); g.party(['yangtiexin', 'baoxiruo']); g.move('jiaxing'); }, res: '那个疑团，你心里放了很多年。父王看着你跪下去，手里的刀垂了下来，让开了路。' },
          ] },
        { id: 'yk_brother', y: 19, t: '结义', cond: (g) => g.f('yangkangTurned') && g.alive('guojing'),
          text: (g) => '你跟着生父去见郭靖。' + (g.recall('noQiu') ? '父亲说' : '丘道长说') + '，你们两家本是邻居，你们的名字是一起起的，靖康之耻，不能忘。',
          choices: [
            { t: '各走各的路', canon: true, fx: (g) => g.stat('心境', -3), res: '你们拱了拱手，就此别过。' },
            { t: '和郭靖结为兄弟', dev: 10, fx: (g) => { g.rel('义兄', 'guojing'); g.stat('情义', 10); }, res: '郭靖抱着你，像抱着一个失散多年的亲兄弟。' },
            { t: '拉上他去找完颜洪烈算账', dev: 25, check: ['武学', 45], fx: (g) => { g.kill('wanyanhonglie', '被养子杨康追到中都城外，死在他剑下'); g.rel('义兄', 'guojing'); g.stat('心境', -10); }, res: '你们在城外追上了他。他看着你，说：“康儿，你终究是来了。”你没让郭靖动手。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '王府的高手太多。郭靖背着你逃了出来，完颜洪烈跑了。', dev: 5 } },
          ] },
        { id: 'yk_ouyangke', y: 19, t: '牛家村', loc: 'niujia', cond: (g) => g.alive('ouyangke'), text: '牛家村，白驼山少主欧阳克被压断了双腿，却还在纠缠穆念慈。屋里只有你们三个人。',
          choices: [
            { t: '一枪刺死他', canon: true, fx: (g) => { g.kill('ouyangke', '在牛家村被杨康一枪刺死', true); g.stat('正邪', -3); }, res: '你知道欧阳锋迟早会来找你。' },
            { t: '放他走', dev: 20, fx: (g) => { g.set('ouyangkeLives'); g.stat('正邪', 3); }, res: '欧阳克被人抬走了。他说他会记得你，欧阳锋也会。' },
          ] },
        { id: 'yk_wumu', y: 19, t: '武穆遗书', cond: (g) => !g.f('yangkangTurned'), text: '父王说，岳飞的《武穆遗书》藏在临安皇宫里，得了它，大金就能灭宋。他要你带人去取。',
          choices: [
            { t: '去临安', canon: true, fx: (g) => { g.move('lintan'); g.stat('正邪', -5); }, res: '你们在皇宫里翻了三天，书不在了。' },
            { t: '把这个消息悄悄告诉郭靖', dev: 25, fx: (g) => { g.remember('tipped'); g.stat('正邪', 12); g.stat('情义', 5); }, res: '郭靖比你们先到一步。父王一直没想通，是谁走漏了风声。郭靖心里记下了这份情。' },
          ] },
        { id: 'yk_junshan', y: 19, t: '君山', cond: (g) => !g.f('yangkangTurned') && g.alive('hongqigong'), text: '你得了一根假的打狗棒。只要在君山丐帮大会上说洪七公临终把帮主传给了你，天下的叫化子就都是你的。',
          choices: [
            { t: '去君山', canon: true, fx: (g) => { g.stat('声望', -15); g.stat('正邪', -5); }, res: '一个叫黄蓉的姑娘当众拆穿了你，洪七公根本没死。' },
            { t: '把竹棒扔进洞庭湖', dev: 15, fx: (g) => { g.set('yangkangGaibang'); g.stat('正邪', 4); }, res: '你把那根竹棒扔进了洞庭湖。君山大会上，没人知道你来过。' },
            { t: '把假棒子交给丐帮的长老', dev: 15, fx: (g) => { g.set('yangkangGaibang'); g.remember('helpedGaibang'); g.stat('正邪', 8); g.stat('声望', 4); }, res: '长老们查出了是谁做的假。黄帮主托人带话，说丐帮欠你一个人情。' },
          ] },
        { id: 'yk_temple', y: 19, t: '铁枪庙', loc: 'jiaxing', cond: (g) => !g.f('yangkangTurned'), text: '嘉兴铁枪庙，你一掌拍在黄蓉肩上。她穿着软猬甲，甲上沾着欧阳锋的蛇毒。毒已经进了你的手掌。',
          choices: [
            { t: '求欧阳锋给解药', canon: true, fatal: true, fx: (g) => g.die('在嘉兴铁枪庙中毒身亡'), res: (g) => (g.alive('ouyangke') ? '欧阳锋冷冷地看着你，什么也没给。' : '欧阳锋笑了：“你杀了我的克儿，还想要解药？”') },
            { t: '一刀剜掉手上的肉', dev: 35, check: ['根骨', 70], fx: (g) => { g.set('yangkangLives'); g.stat('武学', -15); g.stat('根骨', -20); g.move('jiangnan'); }, res: '你活了下来，少了半只手掌。从那天起，你不再是小王爷了。',
              fail: { fx: (g) => g.die('在嘉兴铁枪庙中毒身亡'), res: '毒走得比刀快。', dev: 5 } },
            { t: '提醒欧阳锋：欧阳克的命是你留下的', dev: 30, cond: (g) => g.f('ouyangkeLives') && g.alive('ouyangke'), fx: (g) => { g.set('yangkangLives'); g.stat('正邪', 5); g.move('jiangnan'); }, res: '欧阳锋盯着你看了半天，扔下一个瓶子：“克儿的命，换你的命。两清了。”' },
            { t: '向郭靖、黄蓉求救', dev: 30, cond: (g) => (g.recall('tipped') || g.recall('helpedGaibang')) && g.alive('huangrong'), fx: (g) => { g.set('yangkangLives'); g.stat('正邪', 10); g.move('jiangnan'); }, res: (g) => (g.recall('tipped') ? '郭靖记得武穆遗书的事，跪着求黄蓉。' : '黄蓉记得那根假打狗棒是你交出来的。') + '一颗九花玉露丸塞进了你嘴里。你活了，从此不敢再看她的眼睛。' },
          ] },
        { id: 'yk_son', y: 20, t: '儿子', cond: (g) => g.alive('munianci'), text: (g) => (g.f('yangkangMarried') || g.f('yangkangTurned') ? '念慈在嘉兴生下了你的儿子。' : '你听说穆念慈在嘉兴一个破窑里生下了你的儿子。'),
          choices: [
            { t: '给他取名杨过，字改之', canon: true, fx: (g) => { g.rel('儿子', R('yangguo', '杨过')); g.rel('妻子', 'munianci'); g.stat('心境', 10); g.move('jiaxing'); }, res: '改之，改他父亲的过错。' },
            { t: '把他们母子接到身边，好好过日子', dev: 25, fx: (g) => { g.rel('儿子', R('yangguo', '杨过')); g.rel('妻子', 'munianci'); g.set('yangkangMarried'); g.stat('心境', 12); g.move('jiaxing'); }, res: '你在嘉兴买了一个小院。念慈说，这是她第一次有自己的家。' },
            { t: '不去见他们', dev: 20, fx: (g) => { g.stat('心境', -10); g.stat('情义', -10); g.remember('abandoned'); }, res: '你在江南的另一头，听人说那孩子很像你。你一次也没有去看。' },
          ] },
        { id: 'yk_hl', y: 22, t: '养父', cond: (g) => g.alive('wanyanhonglie'), text: '金国兵败，完颜洪烈被郭靖追得走投无路。他托人带信给你，说你是他唯一的儿子。',
          choices: [
            { t: '不去', canon: true, fx: (g) => g.stat('心境', -5), res: '他死在了乱军里。你在江南给他烧了一炷香。' },
            { t: '去求郭靖放他一条生路', dev: 20, cond: (g) => g.alive('guojing'), check: ['情义', 55], fx: (g) => { g.set('honglieSpared'); g.stat('情义', 6); }, res: '郭靖看了你很久，放了他。他骑着一匹瘦马往北去了，没有回头。',
              fail: { res: '你赶到时，他已经死了。', dev: 5 } },
            { t: '去送他最后一程', dev: 15, fx: (g) => { g.move('zhongdu'); g.stat('情义', 5); g.stat('正邪', -3); }, res: '你在乱军里找到了他。他说：“康儿，你终究是来了。”说完就闭上了眼。你在中都住了下来。' },
          ] },
        { id: 'yk_father2', y: 25, auto: true, t: '嘉兴', cond: (g) => g.f('tiexinLives') && g.alive('yangtiexin'), text: '父亲在院子里教孙子耍铁枪。母亲坐在门口剥豆子。你站在一边看，看了很久。', fx: (g) => g.stat('心境', 15) },
        { id: 'yk_quanzhen', y: 28, t: '全真教', cond: (g) => g.f('yangkangTurned') && !g.recall('noQiu') && !g.alive('qiuchuji'), text: '丘道长死了。全真教的道士们请你去终南山，说你是丘真人唯一的俗家弟子。',
          choices: [
            { t: '去终南山上香', canon: true, fx: (g) => { g.move('zhongnan'); g.stat('情义', 4); }, res: '你在重阳宫里跪了一夜。' },
            { t: '不去了', dev: 5, fx: (g) => g.stat('心境', 2), res: '你在院子里朝北边磕了三个头。' },
            { t: '去终南山，留下来做一年道士', dev: 15, fx: (g) => { g.move('zhongnan'); g.stat('心境', 6); g.info('门派', '全真教'); }, res: '你在重阳宫扫了一年地。走的时候，你学会了一套静坐的法子，咳嗽少了很多。' },
          ] },
        { id: 'yk_ill', y: 31, t: '念慈病了', cond: (g) => g.alive('munianci') && !g.f('munianciLives'), text: '念慈咳得越来越厉害，郎中说熬不过这个冬天。过儿才十一岁。',
          choices: [
            { t: '守着她', canon: true, fx: (g) => g.stat('心境', -15), res: '她走的时候，攥着你的手。' },
            { t: '背她去找一灯大师', dev: 25, check: ['情义', 60], fx: (g) => { g.set('munianciLives'); g.stat('情义', 8); }, res: '一灯大师替她调理了半年，她活了下来。', fail: { res: '她在路上走了。', dev: 5 } },
            { t: '去求黄蓉', dev: 25, cond: (g) => g.alive('huangrong'), check: ['声望', 30], fx: (g) => { g.set('munianciLives'); g.stat('心境', 4); }, res: '黄蓉送来了九花玉露丸，什么也没问。念慈熬过了冬天。',
              fail: { fx: (g) => g.stat('心境', -15), res: '你在丐帮的门口等了三天，没人通报。回来的时候她已经走了。', dev: 5 } },
          ] },
        { id: 'yk_guo', y: 33, t: '郭靖来了', cond: (g) => hasYG(g) && g.alive('guojing') && !g.recall('abandoned'), text: '郭靖找到了你家，说想把过儿接去桃花岛，教他读书做人。',
          choices: [
            { t: '让他去', canon: true, fx: (g) => g.stat('情义', 3), res: '过儿走的时候没有回头。' },
            { t: '自己教他', dev: 30, fx: (g) => { g.set('yangNoTomb'); g.stat('情义', 8); }, res: '你把丘处机教你的都教给了他，梅超风教你的那些没教。他没有去终南山。' },
            { t: '和郭靖一起去桃花岛', dev: 20, fx: (g) => { g.move('taohua'); g.stat('情义', 5); }, res: '黄药师看了你一眼，没有赶你走。过儿在岛上住得比你想的久。' },
          ] },
        { id: 'yk_guo2', y: 33, auto: true, t: '那个孩子', cond: (g) => hasYG(g) && g.recall('abandoned'), text: '你听说郭靖在嘉兴找到了一个叫杨过的孩子，带去了桃花岛。那孩子姓杨。你没有去认。', fx: (g) => g.stat('心境', -8) },
        { id: 'yk_jinwang', y: 35, t: '金亡', text: '蒙古灭金。你听说中都烧了三天，赵王府只剩下一片瓦砾。',
          choices: [
            { t: '不去了', canon: true, fx: (g) => g.stat('心境', 3), res: '你在院子里坐了一夜。' },
            { t: '北上，去看最后一眼', dev: 10, fx: (g) => { g.move('zhongdu'); g.stat('心境', -10); }, res: '你在废墟里找到了母亲那间农舍的门槛，上面刻着一个“杨”字。你在废墟边上搭了间屋子。' },
            { t: '收留从北边逃来的金人', dev: 20, fx: (g) => { g.remember('sheltered'); g.stat('正邪', 8); g.stat('声望', -4); }, res: '邻居说你是金人的走狗。你没解释，给他们每家分了一袋米。' },
          ] },
        { id: 'yk_xiangyang', y: 40, t: '襄阳', cond: (g) => g.alive('guojing') && g.loc !== 'xiangyang', text: '郭靖在襄阳守城，缺人手。他托人问你，愿不愿意来。',
          choices: [
            { t: '不去', canon: true, res: '你回信说，你不配。' },
            { t: '去', dev: 20, fx: (g) => { g.move('xiangyang'); g.info('身份', '襄阳城头的老兵'); g.stat('正邪', 15); g.stat('声望', 8); }, res: '你这个金国的小王爷，在宋朝的城头上守了下来。' },
            { t: '送去一批铁枪和钱粮', dev: 10, fx: (g) => { g.remember('sentSpears'); g.stat('正邪', 6); g.stat('声望', 3); }, res: '郭靖回信说，枪是好枪。' },
          ] },
        { id: 'yk_yangguo', y: 41, auto: true, t: '过儿', cond: (g) => hasYG(g) && !g.recall('abandoned'), text: (g) => (g.f('yangArm') ? '过儿来看你，身边跟着一只大雕。' : '过儿来看你，空着一条袖子。他说是芙妹砍的，他不怪她。'), fx: (g) => g.stat('心境', 5) },
        { id: 'yk_mongol', y: 45, auto: true, t: '蒙古', text: (g) => '蒙古人越打越近。' + (g.recall('sheltered') ? '你当年收留的金人，有一家的儿子投了蒙古兵，回来时给你磕了个头。' : '你在街上看见逃难的人，有金人，也有宋人。') + '你分不清自己算哪一边。', fx: (g) => g.stat('心境', -5) },
        { id: 'yk_old', y: 50, t: '旧枪',
          text: (g) => (g.f('spearSold') ? '父亲那杆铁枪，当年在江湖上卖给了财主。你托人找了好些年，终于赎了回来。' : '你把父亲那杆铁枪擦了又擦。') + '枪头上刻着“杨铁心”三个字。' + (g.recall('sentSpears') ? '襄阳城头也有几杆杨家的枪，是你送去的。' : ''),
          choices: [
            { t: '留给过儿', canon: true, fx: (g) => g.stat('情义', 3), res: (g) => (g.recall('abandoned') ? '你托人把枪送去了。过儿收下了，没有回信。' : '过儿拿着枪，说他会好好收着。') },
            { t: '带着枪去襄阳，交给郭靖', dev: 10, cond: (g) => g.alive('guojing') && g.loc !== 'xiangyang', fx: (g) => { g.move('xiangyang'); g.stat('情义', 5); }, res: '郭靖把枪挂在城楼上。他说，杨家的枪，该在这里。你没走，留下来守城。' },
            { t: '收一个徒弟，传杨家枪法', dev: 10, fx: (g) => { g.rel('徒弟', '放牛的孩子'); g.stat('情义', 4); g.stat('声望', 2); }, res: '你收了一个放牛的孩子。他学得很慢，很像郭靖小时候。' },
          ] },
        { id: 'yk_war57', y: 57, t: '西门', loc: 'xiangyang', cond: (g) => g.loc === 'xiangyang', text: '蒙古大汗蒙哥亲率大军攻城。你守的是西门，身边都是十几岁的新兵。你已经五十六岁了。',
          choices: [
            { t: '守到最后一刻', dev: 10, fatal: true, fx: (g) => g.die('襄阳大战，死在西门城头'), res: '那天襄阳守住了。你没有看到。' },
            { t: '把位置让给年轻人，回嘉兴去', dev: 5, fx: (g) => { g.move('jiaxing'); g.stat('心境', 5); }, res: '你回到嘉兴的那天，城里在放烟花，说是襄阳打了大胜仗。' },
          ] },
      ],
    },
  }]);

  /* ================= 穆念慈 ================= */
  JY.addChars([{
    id: 'munianci', name: '穆念慈', py: 'MU<<NIANCI', book: BOOK, sex: '女', born: 0,
    origin: '杨铁心收养的孤女', birthplace: '临安城外', home: 'road', bg: 1,
    info: { 门派: '无', 身份: '卖艺女' },
    look: { hair: 'bun', hairColor: '#21170f', robe: '#b0413e', accent: '#e3c98a' },
    family: [{ rel: '亲生父母', name: '穆氏夫妇', note: '死于瘟疫' }],
    fateText: '比武招亲爱上杨康，一生痴心。杨康死后在嘉兴破窑里生下杨过，独自抚养到十一岁，病逝。',
    st: [60, 55, 65, 85, 3, 0, 40],
    death: (g) => (g.f('munianciLives') ? { y: 64, cause: '在嘉兴寿终', mod: true } : { y: 31, cause: '在嘉兴病逝，留下十一岁的杨过' }),
    ms: [[0, '生于临安城外'], [5, '被杨铁心收养'], [12, '跟洪七公学了三招'], [18, '在中都比武招亲'], [19, '爱上了杨康'], [20, '生下杨过'], [32, '与杨过在嘉兴相依为命', (g) => g.f('munianciLives')]],
    arc: {
      focus: '帮衬家里',
      intro: '你生在临安城外一个穷人家。你还不会走路，一场瘟疫就把家里的人都带走了，只剩下你。',
      lastWords: '过儿，别学你爹。也别恨你爹。',
      nodes: [
        { id: 'mn_y2', y: 2, auto: true, t: '邻家', text: '邻家的婶子收留了你，给你一口饭吃。你不哭不闹，睡在灶台边上。', fx: (g) => g.stat('情义', 3) },
        { id: 'mn_adopt', y: 5, auto: true, t: '义父', text: '一个姓穆的汉子收养了你。他总带着一杆铁枪，不爱说话，夜里常常一个人坐着看北边。', fx: (g) => { g.rel('义父', 'yangtiexin'); g.info('身份', '穆易的义女'); g.move('road'); g.party(['yangtiexin']); } },
        { id: 'mn_north', y: 8, auto: true, t: '北边', text: '义父教你武功。练完了枪，他总坐在门口看北边。你给他端一碗热水，他接过去，一句话也不说。', fx: (g) => g.stat('情义', 3) },
        { id: 'mn_hawk', y: 10, auto: true, t: '小鹰', text: '你在路边捡到一只摔断了翅膀的小鹰。义父说养不活的。你还是养着，它活了，第二年春天飞走了。', fx: (g) => { g.stat('情义', 3); g.stat('心境', 3); } },
        { id: 'mn_hong', y: 12, t: '老叫化', text: '一个老叫化在你们落脚的破庙门口晕倒了。你们自己也只剩半碗饭。',
          choices: [
            { t: '把饭给他', canon: true, fx: (g) => { g.stat('武学', 8); g.rel('三招的师父', 'hongqigong'); }, res: '他吃完饭，教了你三招掌法，说够你防身了。他是洪七公。' },
            { t: '饿着肚子不好赶路，自己吃了', dev: 10, fx: (g) => { g.stat('根骨', 2); g.remember('noHong'); }, res: '他醒了，自己走了。你后来才知道，那是北丐洪七公。往后遇上坏人，你手里只有义父教的几下枪法。' },
          ] },
        { id: 'mn_rogue', y: 14, auto: true, t: '恶少', text: (g) => '你和义父在街头卖艺，一个恶少带着家丁来调戏你。' + (g.recall('noHong') ? '你挣不开，义父赶来用铁枪把家丁们挑翻了。你们连夜离开了那座城。' : '你用洪七公教的三招把他打得捂着脸跑了。义父看着你，第一次笑了。'), fx: (g) => (g.recall('noHong') ? g.stat('心境', -4) : g.stat('声望', 4)) },
        { id: 'mn_name15', y: 15, auto: true, t: '名字', text: '义父说，你的名字叫念慈，念的是他的妻子。你问他妻子叫什么，他说，包惜弱。', fx: (g) => g.stat('悟性', 2) },
        { id: 'mn_spear', y: 16, t: '铁枪', text: '有个财主出高价要买义父的铁枪，说是古物。你们已经三天没吃饱饭了。',
          choices: [
            { t: '什么也不说', canon: true, fx: (g) => g.stat('情义', 3), res: '义父把枪靠在墙上，出去打了一夜的短工。' },
            { t: '劝义父卖了', dev: 15, fx: (g) => { g.set('spearSold'); g.stat('根骨', 3); }, res: '义父看了你很久，把枪卖了。那天你们吃了一顿饱饭。夜里他坐在门口，手里空空的。' },
            { t: '问义父枪上为什么刻着别人的名字', dev: 10, check: ['情义', 60], fx: (g) => { g.stat('悟性', 4); g.remember('knowsTiexin'); }, res: '义父说：杨铁心就是我。他讲了牛家村那一夜，讲到天亮。你从那天起知道，他找的人在金国。',
              fail: { res: '他说，以后再告诉你。', dev: 0 } },
          ] },
        { id: 'mn_bizhao', y: 18, t: '比武招亲', loc: 'zhongdu', text: '义父在中都街头竖起“比武招亲”的旗子。一个锦衣公子上台，三招两式赢了你，却笑着说不娶。',
          choices: [
            { t: '心里认定了他', canon: true, fx: (g) => { g.rel('心上人', 'yangkang'); g.stat('情义', 8); }, res: '一个蒙古来的傻小子替你出头，和他打了一场。你一直看着那个锦衣公子。' },
            { t: '当众要他认账', dev: 25, check: ['情义', 75], fx: (g) => { g.set('yangkangMarried'); g.rel('未婚夫', 'yangkang'); }, res: '他看了你很久，说：“好，我认。”',
              fail: { fx: (g) => { g.rel('心上人', 'yangkang'); g.stat('心境', -6); }, res: '他笑着拱了拱手，走了。你还是忘不了他。', dev: 3 } },
          ] },
        { id: 'mn_wangfu', y: 18, t: '赵王府', loc: 'zhongdu', text: '义父在赵王府里找到了他的妻子包惜弱，原来那锦衣公子是他的亲生儿子。王府的兵把他们围在了院子里。',
          choices: [
            { t: '冲进去，和义父站在一起', canon: true, fx: (g) => { tiexinDie(g); g.stat('心境', -30); g.party([]); }, res: '义父和义母在你面前自尽了。他最后说：念慈，杨康是我的儿子。' },
            { t: '去求那个公子救他们', dev: 30, check: ['情义', 75], fx: (g) => { g.set('tiexinLives'); g.stat('情义', 8); }, res: '他犹豫了很久，开了后门。义父带着义母逃了出去。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -35); g.party([]); }, res: '他没有开门。', dev: 5 } },
            { t: '拿起铁枪，挡在门口', dev: 30, cond: (g) => !g.f('spearSold'), check: ['武学', 30], fx: (g) => { g.set('tiexinLives'); g.stat('根骨', -15); g.stat('声望', 5); }, res: '你挡了一盏茶的工夫，够义父带着义母翻墙出去了。你肩上中了一箭。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('根骨', -15); g.party([]); }, res: '你被打倒在门口，听见院子里两声叹息。', dev: 5 } },
            { t: '劝义父先走，日后再来接义母', dev: 20, cond: (g) => g.recall('knowsTiexin'), check: ['悟性', 50], fx: (g) => { g.set('tiexinLives'); g.stat('心境', -5); }, res: '你早知道他是谁，也知道他等这一天等了十八年。你跪下来求他先活着。半年后，他在嘉兴等到了义母。',
              fail: { fx: (g) => { tiexinDie(g); g.stat('心境', -30); g.party([]); }, res: '义父不肯走。', dev: 5 } },
          ] },
        { id: 'mn_home', y: 19, t: '回家', cond: (g) => g.f('tiexinLives') && g.alive('yangtiexin'), text: '义父带着义母回了江南。他问你，是跟他们回嘉兴，还是去找那个人。',
          choices: [
            { t: '跟义父义母回嘉兴', dev: 15, fx: (g) => { g.move('jiaxing'); g.rel('义母', 'baoxiruo'); g.unrel('心上人'); g.remember('home'); g.party(['yangtiexin', 'baoxiruo']); }, res: '义母给你做了一身新衣裳。那个锦衣公子，你慢慢不常想起了。' },
            { t: '去追杨康', dev: 10, fx: (g) => { g.move('jiangnan'); g.stat('情义', 3); }, res: '义父叹了口气，叫你自己小心。' },
          ] },
        { id: 'mn_follow', y: 19, t: '追', loc: 'jiangnan', cond: (g) => g.alive('yangkang') && !g.f('yangkangTurned') && !g.recall('home'), text: '你一路追着杨康到了江南。他说他会回心转意，只是现在还不能。',
          choices: [
            { t: '信他', canon: true, fx: (g) => g.stat('心境', -5), res: '你等了很久。' },
            { t: '逼他和你一起去见丘道长，当面认祖归宗', dev: 35, check: ['情义', 80], fx: (g) => { g.set('yangkangTurned'); g.stat('正邪', 10); }, res: '丘处机给他改回了杨姓。他跪在牛家村的老屋前磕了三个头。',
              fail: { fx: (g) => g.stat('心境', -10), res: '他甩开你的手，回了金国使团。', dev: 5 } },
            { t: '不再追了', dev: 20, fx: (g) => { g.stat('心境', 5); g.unrel('心上人'); g.remember('leftKang'); g.move('jiaxing'); }, res: '你在客栈里住了一个月，然后一个人去了嘉兴。铁枪庙的事，你后来才听说。' },
          ] },
        { id: 'mn_temple', y: 19, t: '铁枪庙', loc: 'jiaxing', cond: (g) => g.alive('yangkang') && !g.f('yangkangTurned') && !g.f('yangkangLives') && !g.recall('home') && !g.recall('leftKang'), text: '铁枪庙里，杨康中了蛇毒，在地上打滚。欧阳锋站在一边。你赶到的时候，他已经说不出话了。',
          choices: [
            { t: '抱着他', canon: true, fx: (g) => g.stat('心境', -30), res: '他死在你怀里。庙里供着的，是杨家祖上的铁枪。' },
            { t: '跪着求欧阳锋，拿什么换都行', dev: 35, check: ['情义', 75], fx: (g) => { g.set('yangkangLives'); g.stat('心境', 5); }, res: '欧阳锋看了你很久，扔下一个瓶子：“痴情的女娃娃。”',
              fail: { fx: (g) => g.stat('心境', -30), res: '欧阳锋走了。他死在你怀里。', dev: 5 } },
            { t: '替他吸毒', dev: 35, check: ['根骨', 60], fx: (g) => { g.set('yangkangLives'); g.stat('根骨', -25); }, res: '你吐出了三口黑血。他活了，你的身子从此弱了。',
              fail: { fx: (g) => { g.stat('根骨', -30); g.stat('心境', -30); }, res: '毒太深了。他死了，你也病了半年。', dev: 5 } },
          ] },
        { id: 'mn_birth', y: 20, auto: true, t: '杨过', loc: 'jiaxing', text: (g) => (g.recall('home') ? '你在嘉兴义父家里生下一个儿子。义父抱着孙子，手一直在抖。' : g.recall('leftKang') ? '你一个人在嘉兴生下一个儿子。你没有告诉他的父亲。' : g.alive('yangkang') ? '你在嘉兴生下一个儿子。杨康守在门外，进来的时候手在抖。' : '你在嘉兴城外一个破窑里生下了一个儿子。'), fx: (g) => { g.rel('儿子', R('yangguo', '杨过')); g.stat('心境', 10); } },
        { id: 'mn_name', y: 20, t: '取名', text: '你给孩子取名叫杨过。还要给他取个字。',
          choices: [
            { t: '字改之，改他父亲的过错', canon: true, fx: (g) => g.stat('正邪', 3), res: '杨过，杨改之。' },
            { t: '字思之，让他记着他爹', dev: 10, fx: (g) => { g.remember('sizhi'); g.stat('情义', 3); }, res: '杨过，杨思之。你说，不管他爹是什么人，总是他爹。' },
            { t: '带他去桃花岛，托付给郭靖', dev: 25, cond: (g) => g.alive('guojing') && married(g), fx: (g) => { g.set('yangguoRaisedByGuo'); g.move('taohua'); g.stat('情义', 5); }, res: '郭靖抱着孩子，说一定把他当亲生的养。你在岛上住了下来。' },
          ] },
        { id: 'mn_y22', y: 22, auto: true, t: '破窑', cond: (g) => !g.f('yangguoRaisedByGuo') && !g.recall('home'), text: (g) => (g.alive('yangkang') && !g.recall('leftKang') ? '杨康隔几个月来一次，每次待不了几天。' : '破窑里只有你和过儿。你在门口种了一排豆子。'), fx: (g) => g.stat('心境', -2) },
        { id: 'mn_poor', y: 25, t: '日子', cond: (g) => !g.f('yangguoRaisedByGuo'), text: (g) => (g.recall('home') ? '你和过儿住在义父家里。' : '你和过儿住在破窑里，靠替人缝补过日子。') + '过儿五岁了，和村里的孩子打架，从来不哭。',
          choices: [
            { t: '教他掌法', canon: true, fx: (g) => g.stat('情义', 4), res: '他学会了，第二天就把村里最大的孩子打哭了。' },
            { t: '带他进城找活干', dev: 10, fx: (g) => { g.move('jiaxing'); g.stat('根骨', 2); }, res: '你们在一家绣坊住了下来。他在后院学会了爬墙。' },
            { t: '教他认字，讲杨家将的故事', dev: 10, fx: (g) => { g.remember('knowsYang'); g.stat('悟性', 2); g.stat('情义', 3); }, res: '他最喜欢杨六郎。你告诉他，他也姓杨，就是那个杨。' },
          ] },
        { id: 'mn_lesson', y: 27, auto: true, t: '偷东西', cond: (g) => !g.f('yangguoRaisedByGuo'), text: (g) => '过儿偷了邻居家的一只鸡，被人揪着耳朵送了回来。' + (g.recall('knowsYang') ? '你问他，杨家将偷过鸡吗？他红着脸自己去赔了礼。' : '你带他去赔钱，一句话也没说。回来的路上，他拉住了你的手。'), fx: (g) => g.stat('情义', 3) },
        { id: 'mn_ill', y: 30, t: '病', text: '你病了，咳得越来越厉害。过儿十岁了，每天替你去抓药，钱不够就偷。',
          choices: [
            { t: '撑着，能撑一天是一天', canon: true, fx: (g) => g.stat('根骨', -20), res: '你把剩下的日子都用来教他认字。' },
            { t: '去大理求一灯大师', dev: 30, check: ['根骨', 40], fx: (g) => { g.set('munianciLives'); g.stat('根骨', 25); g.move('yideng'); }, res: '你走了三个月才到大理。一灯大师说，再晚半年就没救了。',
              fail: { fx: (g) => g.stat('根骨', -25), res: '你走到半路就走不动了，只好回来。', dev: 5 } },
            { t: '去求丐帮的黄帮主', dev: 25, cond: (g) => g.alive('huangrong') && married(g), check: ['情义', 60], fx: (g) => { g.set('munianciLives'); g.stat('根骨', 20); }, res: '黄蓉派人送来了药，还托人带话，说过儿可以去桃花岛。',
              fail: { fx: (g) => g.stat('根骨', -20), res: '你找不到她。', dev: 5 } },
            { t: '把过儿托付给郭靖，自己安心养病', dev: 20, cond: (g) => g.alive('guojing') && !g.f('yangguoRaisedByGuo'), fx: (g) => { g.set('yangguoRaisedByGuo'); g.stat('心境', 5); g.stat('根骨', -10); }, res: '郭靖来接走了过儿。你一个人在屋里，终于能好好睡一觉了。' },
          ] },
        { id: 'mn_end', y: 31, auto: true, t: '冬天', cond: (g) => !g.f('munianciLives'), text: '那年冬天特别冷。你把过儿叫到床前，告诉他，他的父亲叫杨康。', fx: (g) => g.die('在嘉兴病逝，留下十一岁的杨过') },
        { id: 'mn_feng', y: 33, t: '疯子', loc: 'jiaxing', cond: (g) => g.alive('ouyangfeng') && !g.f('yangguoRaisedByGuo'), text: '一个疯疯癫癫的白发老头出现在嘉兴，非要认过儿做干儿子，说要教他蛤蟆功。',
          choices: [
            { t: '由他去', canon: true, fx: (g) => g.stat('心境', 2), res: '过儿叫了他一声“爸爸”。老头高兴得在地上打滚。' },
            { t: '连夜带过儿搬走', dev: 15, fx: (g) => { g.move('road'); g.stat('情义', 3); }, res: '你们搬到了另一个镇子。老头在空屋门外喊了三天，走了。' },
            { t: '让过儿自己回答他', dev: 10, cond: (g) => g.recall('knowsYang'), fx: (g) => { g.rel('过儿的武功师父', 'ouyangfeng'); g.stat('情义', 3); }, res: '过儿说：我姓杨，我不认别人做爹。老头愣了半天，大笑着教了他蛤蟆功，说这孩子有骨气。' },
          ] },
        { id: 'mn_guo', y: 34, t: '郭靖', cond: (g) => g.alive('guojing') && !g.f('yangguoRaisedByGuo'), text: '郭靖找到了你们，说要把过儿接去桃花岛，好好教他。',
          choices: [
            { t: '让过儿跟他去', canon: true, fx: (g) => { g.stat('情义', 3); g.stat('心境', -5); }, res: '过儿走的那天，回头看了你三次。' },
            { t: '留在身边', dev: 25, fx: (g) => { g.set('yangNoTomb'); g.stat('心境', 6); }, res: '过儿留了下来。他没有去终南山，也就没有遇见古墓里的那个人。' },
            { t: '跟着一起去桃花岛', dev: 20, fx: (g) => { g.move('taohua'); g.stat('情义', 5); }, res: '黄蓉给你收拾了一间屋子。过儿每天早上都来敲你的门。' },
          ] },
        { id: 'mn_gugu', y: 39, t: '姑姑', cond: (g) => hasYG(g) && !g.f('yangNoTomb'), text: '过儿回来看你，身边跟着一个白衣姑娘，冷得像雪。他叫她“姑姑”，眼睛却一直跟着她。',
          choices: [
            { t: '拉着姑娘的手，说过儿就拜托你了', dev: 10, fx: (g) => { g.rel('儿媳', R('xiaolongnv', '小龙女')); g.stat('情义', 6); g.stat('心境', 8); }, res: '她愣了一下，点了点头。过儿在门外哭了。' },
            { t: '劝过儿守礼，师徒不能成亲', dev: 10, fx: (g) => { g.remember('opposed'); g.stat('情义', -4); }, res: '过儿笑了：“娘，你当年追着爹跑了半个天下。”他们第二天就走了。' },
          ] },
        { id: 'mn_sad', y: 41, auto: true, t: '断肠崖', cond: (g) => hasYG(g) && !g.f('yangNoTomb') && !g.f('longStayed') && !g.f('reunionEarly'), text: (g) => '你听说那个白衣姑娘在断肠崖上留了字，跳了下去。过儿一个人去了，说要等十六年。' + (g.recall('opposed') ? '你想起那天劝过儿的话，一夜没睡。' : ''), fx: (g) => g.stat('心境', -10) },
        { id: 'mn_hero', y: 57, auto: true, t: '神雕大侠', cond: (g) => hasYG(g), text: (g) => '过儿在襄阳城下打死了蒙古大汗。人们叫他神雕大侠。' + (g.recall('sizhi') ? '没有人知道他还有一个字，叫思之。' : '') + '你听人讲的时候，把手里的针扎进了指头。', fx: (g) => g.stat('心境', 12) },
        { id: 'mn_old', y: 60, t: '老屋', cond: (g) => g.f('munianciLives'), text: '你老了。过儿托人捎来银子，要接你去住。',
          choices: [
            { t: '留在嘉兴', canon: true, fx: (g) => g.stat('心境', 4), res: '你在嘉兴盖了两间瓦房，一间留给过儿。' },
            { t: '去找过儿', dev: 10, cond: hasYG, fx: (g) => { g.move('gumu'); g.stat('情义', 6); }, res: '古墓里很冷。那个白衣姑娘每天给你煮玉蜂浆。' },
            { t: '去襄阳，帮着守城', dev: 15, fx: (g) => { g.move('xiangyang'); g.stat('正邪', 6); }, res: '你在襄阳城里开了一间缝补铺子，专补守城兵的衣裳。' },
          ] },
      ],
    },
  }]);

  /* ================= 世界事件 ================= */
  JY.addEvents([
    { y: 0, t: '临安府牛家村，金兵与奸人段天德夜袭。郭啸天被杀，杨铁心下落不明，包惜弱被金国六王爷完颜洪烈“救”走，李萍一路北逃。' },
    { y: 1, t: '丘处机与江南七怪在嘉兴醉仙楼立下赌约：各寻郭、杨两家的遗孤，教十八年武功，到时比武定输赢。' },
    { y: 6, who: 'guojing', t: (g) => '江南七怪在大漠找到了六岁的郭靖。黑风双煞夜袭，' + (g.f('xuanfengEscaped') ? '铜尸陈玄风负伤逃走' : '郭靖一剑刺死了铜尸陈玄风') + '，张阿生死在那一夜。', mod: (g) => g.f('xuanfengEscaped') },
    { y: 12, who: 'guojing', t: (g) => (g.f('jingNoWarn') ? '铁木真在宴席上遭桑昆伏击，受了重伤。' : '一个汉人孩子冒死报信，铁木真躲过了桑昆、札木合的伏击。'), mod: (g) => g.f('jingNoWarn') },
    { y: 15, who: 'guojing', t: '全真教马钰来到大漠，在悬崖顶上暗中传郭靖内功。' },
    { y: 18, who: 'guojing', t: (g) => (g.f('jingStayMongol') ? '郭靖没有南下，十八年之约江南七怪不战而败。' : '郭靖被封为金刀驸马，随后南下中原。'), mod: (g) => g.f('jingStayMongol') },
    { y: 18, who: ['guojing', 'huangrong'], cond: (g) => !g.f('jingStayMongol') && !g.f('jingrongApart'), t: '张家口，郭靖遇见了扮成小叫化的黄蓉。' },
    { y: 18, who: ['yangkang', 'munianci', 'guojing'], t: '中都比武招亲。小王爷完颜康赢了穆念慈却不肯娶，郭靖出头，两人大打一场。' },
    { y: 18, who: ['yangkang', 'munianci'], cond: (g) => g.f('xuanfengEscaped'), t: '黑风双煞重现江南，铜尸陈玄风还活着。', mod: true },
    { y: 19, who: ['guojing', 'huangrong'], cond: (g) => !g.f('jingrongApart') && !g.f('jingStayMongol'), t: '洪七公为了黄蓉的菜，把降龙十八掌传给了郭靖。桃花岛招亲，郭靖胜了欧阳克。' },
    { y: 19, who: ['guojing', 'huangrong'], cond: (g) => !g.f('jingrongApart') && !g.f('rongDied') && !g.f('jingStayMongol'), t: '黄蓉在铁掌峰中了裘千仞一掌，一灯大师耗去五年功力救了她。' },
    { y: 19, who: ['guojing', 'huangrong'], cond: (g) => !g.f('qiguaiSaved') && !g.f('jingStayMongol'), t: '江南七怪中的五人死在桃花岛，只有柯镇恶逃了出来。江湖上都说是黄药师干的，真凶是欧阳锋和杨康。' },
    { y: 19, who: ['guojing', 'huangrong'], cond: (g) => g.f('jingStayMongol'), t: '江南七怪回了嘉兴，郭靖没有来。', mod: true },
    { y: 19, who: ['huangrong', 'yangkang'], cond: (g) => !g.f('jingrongApart') && !g.f('rongDied') && !g.f('jingStayMongol'), t: (g) => '君山丐帮大会，' + (g.f('yangkangTurned') ? '' : '杨康拿着假打狗棒自称帮主，被黄蓉当众拆穿。') + '洪七公把帮主之位传给了黄蓉。' },
    { y: 19, who: ['yangkang', 'munianci', 'guojing', 'huangrong'], cond: (g) => g.f('yangkangLives'), t: '杨康没有死在铁枪庙。有人说他剜掉了半只手掌，隐姓埋名去了江南。', mod: true },
    { y: 20, t: '蒙古大军西征花剌子模。' },
    { y: 20, who: ['munianci', 'yangkang'], t: '杨过生于嘉兴。' },
    { y: 21, who: 'guojing', t: '撒麻尔罕城破。郭靖以军功求成吉思汗饶了满城百姓。' },
    { y: 22, who: ['guojing', 'huangrong'], t: (g) => (g.f('jingStayMongol') ? '第二次华山论剑，少了一个郭靖。欧阳锋练《九阴真经》练疯了。' : '第二次华山论剑。欧阳锋练《九阴真经》练疯了，郭靖与洪七公、黄药师各拆三百招不败。'), mod: (g) => g.f('jingStayMongol') },
    { y: 22, who: 'guojing', cond: (g) => g.f('lipingLives'), t: '郭靖背着母亲逃出了蒙古大营。', mod: true },
    { y: 22, cond: (g) => g.alive('qiuqianren'), t: '华山上，裘千仞被一灯大师点化，出家为僧，法号慈恩。', fx: () => {} },
    { y: 23, who: ['guojing', 'huangrong'], cond: married, t: '郭靖与黄蓉在桃花岛成婚。' },
    { y: 24, who: ['guojing', 'huangrong'], cond: married, t: '郭芙出生。' },
    { y: 30, t: '江湖传言，蒙古与大宋约好了一起攻金。' },
    { y: 36, who: ['guojing', 'huangrong'], cond: (g) => !g.f('jingStayMongol') && !g.f('guoLeftXiangyang'), t: (g) => (married(g) ? '郭靖、黄蓉夫妇到襄阳助守。' : '郭靖到襄阳助守。') },
    { y: 36, who: ['guojing'], cond: (g) => g.f('guoLeftXiangyang'), t: '郭靖没有来襄阳。守城的是吕文焕。', mod: true },
  ]);

  /* ================= 奇遇 =================
   * 奇遇里出现的原著人物，玩家可能早就认识（原著关系网 relations.js，或这一世 g.rel 记下的）。
   * 所以每个奇遇都先问 g.knows('id')：不认识的写初遇，熟人写重逢，仇人另写或不出现。
   * 只在不认识时才 g.rel 记下新关系，免得把“外公”“师父”覆盖成“一个吹箫的老人”。 */
  const FOE = /仇|宿敌|对头|冤家|情敌/; // 仇人一类的称呼
  const KIN = /父亲|母亲|女儿|儿子|丈夫|妻子|外公|外孙|岳父|岳母|女婿|婆婆|儿媳/; // 至亲：不会在路上“偶遇”
  JY.addEncounters([
    { id: 'e_sd_hong', y: [-5, 37], minAge: 8, maxAge: 40, t: '红漆葫芦',
      cond: (g) => g.alive('hongqigong') && !['guojing', 'huangrong', 'munianci'].includes(g.me) && !FOE.test(g.knows('hongqigong')),
      text: (g) => {
        const k = g.knows('hongqigong');
        return k ? '灶台边又蹲着那个老叫化，' + k + '洪七公。他鼻子一抽一抽地闻你锅里的鸡，冲你挤了挤眼睛。'
          : '一个老叫化坐在你家灶台边，鼻子一抽一抽地闻你锅里的鸡。他背上挂着一个红漆葫芦。';
      },
      choices: [
        { t: '请他吃', dev: 0, fx: (g) => { g.stat('武学', 6); g.stat('心境', 3); g.remember('metHong'); if (!g.knows('hongqigong')) g.rel('吃过你一只鸡的老叫化', 'hongqigong'); },
          res: '他吃得满手是油，抹抹嘴，教了你一招“神龙摆尾”。他说丐帮的人往后见了你，会给你留一口饭。' },
        { t: '请他吃，求他正经教你几招', dev: 0, check: ['情义', 70], fx: (g) => { g.stat('武学', 10); g.remember('metHong'); g.rel('师父', 'hongqigong'); g.info('门派', '丐帮（洪七公记名弟子）'); }, res: '他吃完了，拿油手拍了拍你的头：“就冲这只鸡。”他在你家住了一个月。',
          fail: { fx: (g) => { g.stat('武学', 3); g.remember('metHong'); }, res: '他说他不收徒弟，收了个女徒弟就够头疼了。吃完鸡，他教了你一招才走。', dev: 0 } },
        { t: '把他赶走', canon: true, cond: (g) => !g.knows('hongqigong'), res: '他走的时候顺手拿走了一只鸡腿。' },
        { t: '陪他说说话，送他上路', canon: true, cond: (g) => !!g.knows('hongqigong'), fx: (g) => g.stat('心境', 3), res: '他说他又在找好吃的，听说岭南有一种蛇，他得去尝尝。' },
      ] },
    { id: 'e_sd_zhou', y: [10, 73], minAge: 8, t: '老顽童', cond: (g) => g.alive('zhoubotong') && g.me !== 'huangrong' && (g.Y >= 20 || g.f('zhouFreedEarly')) && !FOE.test(g.knows('zhoubotong')),
      text: (g) => {
        const k = g.knows('zhoubotong');
        if (k) return '你的' + k + '周伯通又找上门来了，一进门就嚷着闷坏了，非要跟你玩“左右互搏”：左手画圆，右手画方。';
        return (g.Y < 20 ? '一个从海上漂来的白胡子老头，说他刚从一个山洞里出来，闷坏了。' : '一个白头发白胡子的老头拦住你。') + '他非要跟你玩“左右互搏”：左手画圆，右手画方。';
      },
      choices: [
        { t: '试试', dev: 0, check: ['悟性', 55, 'low'], fx: (g) => { g.stat('武学', 8); g.stat('心境', 3); g.info('绝学', '左右互搏'); }, res: '你一下就画成了。老顽童说你是个天生的傻子，高兴得翻跟头，把左右互搏全教给了你。',
          fail: { fx: (g) => g.stat('心境', 3), res: '你画不出来。越聪明的人越画不出来，老顽童笑得在地上打滚。', dev: 0 } },
        { t: '请他讲讲华山论剑', dev: 0, fx: (g) => { g.stat('悟性', 3); if (!g.knows('zhoubotong')) g.rel('忘年交', 'zhoubotong'); }, res: '他讲了一下午，一半是他师兄，一半是他自己，全都是他赢。临走他说，下回还来找你玩。' },
        { t: '没空', canon: true, res: '他追了你三里地，才去找别人玩了。' },
      ] },
    { id: 'e_sd_ouyang', y: [22, 37], minAge: 10, t: '倒立的怪人',
      // 杨过的义父，另有杨过自己的剧情；其余认得他的人，看到的是一个疯了的老对头
      cond: (g) => g.alive('ouyangfeng') && !/义父|义子/.test(g.knows('ouyangfeng')),
      text: (g) => {
        const k = g.knows('ouyangfeng');
        if (!k) return '一个披头散发的怪人倒立着走路，嘴里念着：“我是谁？我是谁？”';
        return '一个披头散发的怪人倒立着走路。你认出来了，是' + (FOE.test(k) ? '你的仇人' : k) + '欧阳锋。他疯了，认不出你，嘴里只念着：“我是谁？我是谁？”';
      },
      choices: [
        { t: '告诉他：你是欧阳锋', dev: 0, check: ['悟性', 55], fx: (g) => { g.stat('武学', 6); g.info('绝学', '蛤蟆功（两招）'); }, res: '他愣了半天，教了你两招蛤蟆功，说是谢礼。',
          fail: { fx: (g) => g.stat('根骨', -10), res: '他大叫一声“胡说”，一掌把你拍进了河里。', dev: 0 } },
        { t: '给他一碗饭', dev: 0, fx: (g) => { g.stat('情义', 3); if (!g.knows('ouyangfeng')) g.rel('认得你的疯老头', 'ouyangfeng'); else g.remember('fedOuyang'); },
          res: (g) => (g.recall('fedOuyang') ? '他倒立着吃完了饭，把碗扣在头上走了。当年的仇，他一个字也不记得了。' : '他倒立着吃完了饭，把碗扣在头上走了。后来几年，他每回路过都来讨一碗。') },
        { t: '绕开走', canon: true, res: '他倒立着跟了你半条街，又忘了。' },
      ] },
    { id: 'e_sd_xiao', y: [0, 71], minAge: 12, t: '箫声', cond: (g) => g.alive('huangyaoshi') && g.me !== 'huangrong',
      text: (g) => {
        const k = g.knows('huangyaoshi');
        if (!k) return '海边有人吹箫，箫声忽高忽低。你听着听着，心跳也跟着乱了。';
        if (FOE.test(k)) return '海边有人吹箫，箫声里带着杀气。你听出来了，是黄药师。';
        return '海边有人吹《碧海潮生曲》，吹得很慢。你听出来了，是' + k + '黄药师。他背对着你，像是早就知道你会来。';
      },
      choices: [
        { t: '运功抵抗', dev: 0, check: ['武学', 45], cond: (g) => !g.knows('huangyaoshi') || FOE.test(g.knows('huangyaoshi')),
          fx: (g) => { g.stat('武学', 4); if (!g.knows('huangyaoshi')) g.rel('赏识你的青衫老者', 'huangyaoshi'); }, res: '箫声停了。吹箫的人冷冷地说：“还算有点定力。”',
          fail: { fx: (g) => g.stat('根骨', -6), res: '你吐了一口血，箫声才停。', dev: 0 } },
        { t: '吹一曲相和', dev: 0, check: ['悟性', 65], cond: (g) => !FOE.test(g.knows('huangyaoshi')),
          fx: (g) => { g.stat('悟性', 3); g.stat('心境', 4); g.info('绝学', '碧海潮生曲（半阙）'); }, res: '箫声停了。他听你吹完，把后半阙改了三个音，教给了你。',
          fail: { fx: (g) => g.stat('根骨', -4), res: '你吹走了调，被他的箫声震得耳鸣。', dev: 0 } },
        { t: '捂住耳朵跑', canon: true, cond: (g) => !g.knows('huangyaoshi') || FOE.test(g.knows('huangyaoshi')), res: '你跑了三里地，还觉得耳朵里有箫声。' },
        { t: '上前见礼，陪他看一夜海', canon: true, cond: (g) => !!g.knows('huangyaoshi') && !FOE.test(g.knows('huangyaoshi')),
          fx: (g) => { g.stat('心境', 6); g.stat('情义', 3); g.remember('xiaoNight'); },
          res: (g) => (/外公|岳父/.test(g.knows('huangyaoshi')) ? '他问起你娘，又问起家里。说到后来，他不说话了，只看着海。天亮时他说：“去吧，替我问她好。”' : '他问了你这些年的事。天亮时他说：“去吧。”') },
      ] },
    { id: 'e_sd_yideng', y: [0, 61], minAge: 16, t: '渔樵耕读', cond: (g) => g.alive('yideng') && !FOE.test(g.knows('yideng')),
      text: (g) => {
        const k = g.knows('yideng');
        const tail = (g.recall('yingguTalk') ? '你提起黑沼里那个摆算筹的女人，' + (k ? '大师低头念了一声佛。' : '书生的脸色变了。') : '') + (g.f('yidengFull') && g.Y > 19 ? '弟子们说，师父的功力没有损过，脾气也比从前好。' : '');
        if (k) return '大理山中，渔樵耕读四个弟子还守着那条山路。他们认得你，没有出题，直接领你上了山。' + tail;
        return '大理山中，一个渔夫、一个樵夫、一个农夫、一个书生拦着一条山路，说要见师父，得先过他们这关。' + tail;
      },
      choices: [
        { t: '对书生的对子', dev: 0, check: ['悟性', 70], cond: (g) => !g.knows('yideng'), fx: (g) => { g.stat('心境', 10); g.stat('悟性', 2); g.rel('替你解开心结的老僧', 'yideng'); }, res: '你见到了一灯大师。他摸了摸你的脉，说你心里有结，替你解了。',
          fail: { res: '书生摇着扇子笑你。你下山了。', dev: 0 } },
        { t: '跟樵夫一起砍柴，等他们放行', dev: 0, cond: (g) => !g.knows('yideng'), fx: (g) => { g.stat('心境', 4); g.stat('根骨', 2); g.remember('yidengWood', 'wood'); }, res: '你砍了三天柴。第四天，樵夫说师父请你上去喝茶。一灯大师说，以后身子不好，可以再来。' },
        { t: '回头', canon: true, cond: (g) => !g.knows('yideng'), res: '山路上的云很低。' },
        { t: '和大师说说这些年', dev: 0, cond: (g) => !!g.knows('yideng'), fx: (g) => { g.stat('心境', 8); g.remember('yidengWood', 'talk'); }, res: '你说了很久。他只是听，最后说：“以后身子不好，再来。”' },
        { t: '在山门外拜一拜就走', canon: true, cond: (g) => !!g.knows('yideng'), fx: (g) => g.stat('心境', 2), res: '你没有上去打扰。下山的时候，山上传来一声钟。' },
      ] },
    { id: 'e_sd_yideng2', y: [0, 61], minAge: 30, t: '再上大理', cond: (g) => g.alive('yideng') && g.recall('yidengWood') && g.since('yidengWood') >= 5 && g.s('根骨') < 60, always: true,
      text: (g) => (g.recall('yidengWood') === 'talk' ? '大理山中那条山路，你又走了一回。' : '你砍过柴的那条山路还在。') + (g.f('yidengFull') ? '一灯大师功力完满，' : '一灯大师老了，') + (g.knows('yideng') ? '见了你就叫出了你的名字，' : '他记得你，') + '问你这些年身子怎样。',
      choices: [
        { t: '请大师替你调理', dev: 0, fx: (g) => { g.stat('根骨', g.f('yidengFull') ? 15 : 8); g.stat('心境', 5); if (!g.knows('yideng')) g.rel('替你通过经脉的老僧', 'yideng'); else g.remember('yidengHealed'); }, res: (g) => (g.f('yidengFull') ? '他用一阳指替你通了经脉。下山的时候，你觉得自己年轻了十岁。' : '他替你推拿了三天，说他的功力不如从前，只能做到这里。') },
        { t: '只陪他下一盘棋', dev: 0, fx: (g) => { g.stat('心境', 8); if (!g.knows('yideng')) g.rel('故交', 'yideng'); else g.remember('yidengChess'); }, res: '你们下了一夜的棋。他说，下山吧，有的结要自己解。' },
      ] },
    { id: 'e_sd_yinggu', y: [0, 58], minAge: 14, t: '黑沼', cond: (g) => g.alive('yinggu') && !FOE.test(g.knows('yinggu')),
      text: (g) => (g.knows('yinggu') ? '黑沼深处那间茅屋还在。瑛姑对着满地算筹发呆，抬头认出了你，又低下头去：“这道题，还是没算出来。”'
        : '黑沼深处一间茅屋里，一个头发花白的女人对着满地算筹发呆，说这道题她算了十年。'),
      choices: [
        { t: '帮她算', dev: 0, check: ['悟性', 75], fx: (g) => { g.stat('悟性', 4); if (!g.knows('yinggu')) g.rel('忘年交', 'yinggu'); else g.remember('yingguSolved'); }, res: '你算出来了。她哭了，说她的孩子要是活着，也该这么大了。她送了你一张黑沼的地图。',
          fail: { res: '你算到天亮，没算出来。她说没关系，她也没算出来。', dev: 0 } },
        { t: '问她孩子的事', dev: 0, check: ['情义', 60], cond: (g) => !g.knows('yinggu'), fx: (g) => { g.stat('情义', 4); g.remember('yingguTalk'); }, res: '她讲了一夜。天亮的时候，她说，恨一个人恨了这么多年，人也累了。', fail: { res: '她冷冷地看了你一眼，叫你出去。', dev: 0 } },
        { t: '跟她说说老顽童的消息', dev: 0, cond: (g) => !!g.knows('yinggu') && g.alive('zhoubotong'), fx: (g) => { g.stat('情义', 3); g.remember('yingguTalk'); }, res: '她装作不在听，算筹却半天没动一下。你走的时候，她说：“他还是那样疯？”' },
        { t: '悄悄退出去', canon: true, res: '她没有发觉。' },
      ] },
    { id: 'e_sd_guoxy', y: [36, 70], minAge: 14, t: '城头搬石头的人',
      // 郭靖的至亲就在襄阳城里，不会“到了襄阳才见到他”；仇人另有自己的剧情
      cond: (g) => g.alive('guojing') && !['guojing', 'huangrong'].includes(g.me) && !g.f('jingStayMongol') && !g.f('guoLeftXiangyang') && !KIN.test(g.knows('guojing')) && !FOE.test(g.knows('guojing')),
      text: (g) => {
        const k = g.knows('guojing');
        const head = k ? '你到了襄阳。城头上搬石头的那个浓眉大眼的汉子，是' + k + '郭靖。他满身是灰，看见你，放下石头迎了上来。'
          : '你到了襄阳。城头上一个浓眉大眼的中年汉子在搬石头，和守城的士兵一样满身是灰。有人说，他就是郭大侠。';
        return head + (g.f('rongMapXiangyang') ? '城头摆着一个古怪的石阵，听说是一个姓黄的女人寄来的图。' : '') + (!k && g.recall('metRong') ? '他说蓉儿提起过你。' : '');
      },
      choices: [
        { t: '留下来帮他守城', dev: 0, fx: (g) => { g.move('xiangyang'); g.stat('正邪', 8); g.stat('声望', 5); if (!g.knows('guojing')) g.rel('一起守过城的人', 'guojing'); else g.remember('helpedGuoXY'); }, res: '他请你喝了一碗酒，拍着你的肩膀说：“好。”你在襄阳住了下来。' },
        { t: '跟他学一招', dev: 0, check: ['悟性', 50], fx: (g) => { g.stat('武学', 5); g.info('绝学', '亢龙有悔（起手式）'); }, res: '他教了你“亢龙有悔”的起手式，教得很慢，你学得很快。',
          fail: { fx: (g) => g.stat('武学', 2), res: '你学了一下午，只学会了站桩。他说这就够了。', dev: 0 } },
        { t: '只是路过', canon: true, res: (g) => (g.knows('guojing') ? '你们在城门口说了几句话。你出城的时候，他又去搬石头了。' : '你出城的时候，他还在搬石头。') },
      ] },
    { id: 'e_sd_rong', y: [19, 45], minAge: 14, t: '绿竹棒',
      cond: (g) => g.alive('huangrong') && !['guojing', 'huangrong'].includes(g.me) && !g.f('jingrongApart') && !g.f('rongDied') && !KIN.test(g.knows('huangrong')) && !FOE.test(g.knows('huangrong')),
      text: (g) => {
        const k = g.knows('huangrong');
        if (k) return '一个丐帮弟子说帮主想见你。帮主是' + k + '黄蓉，手里拿着绿竹棒，笑着问你这些年过得怎样，又问你肯不肯替丐帮做点事。';
        return '一个丐帮弟子说帮主想见你。帮主是个笑眯眯的年轻妇人，手里拿着一根绿竹棒，三句话就把你的来历猜了个七七八八。' + (g.recall('metHong') ? '她说七公提起过你，说你的鸡烧得不错。' : '');
      },
      choices: [
        { t: '加入丐帮', dev: 0, fx: (g) => { g.info('门派', '丐帮'); g.stat('声望', 5); g.stat('情义', 3); g.remember('metRong'); }, res: '你成了丐帮的弟子，衣服上打了补丁。往后走到哪里，都有叫化子给你递消息。' },
        { t: '替丐帮送一封信去襄阳', dev: 0, fx: (g) => { g.stat('声望', 4); g.remember('metRong'); if (!g.knows('huangrong')) g.rel('欠你人情的黄帮主', 'huangrong'); }, res: '信送到了。收信的是一个浓眉大眼的汉子，他看完信就笑了。' },
        { t: '婉拒', canon: true, res: '她笑了笑，送了你一包点心。' },
      ] },
    { id: 'e_sd_qiu', y: [0, 24], minAge: 10, t: '铜缸', cond: (g) => g.alive('qiuchuji') && !FOE.test(g.knows('qiuchuji')),
      text: (g) => {
        const k = g.knows('qiuchuji');
        if (k) return '酒楼里，' + k + '丘处机单手托着一口铜缸走进来，看见你，哈哈一笑，把缸往你桌上一放，要了十斤酒。';
        return '一个道士单手托着一口几百斤的铜缸，走进了酒楼，把缸往桌上一放，要了十斤酒。';
      },
      choices: [
        { t: '敬他一碗', dev: 0, fx: (g) => { g.stat('声望', 3); if (!g.knows('qiuchuji')) g.rel('一起喝过酒的道长', 'qiuchuji'); else g.remember('drankQiu'); },
          res: (g) => (g.recall('drankQiu') ? '他喝了你的酒，又把整层楼的账都付了，拍着桌子说起十八年前的赌约。' : '他说他叫丘处机，喝了你的酒，又把整层楼的账都付了。他说你要是去终南山，报他的名字。') },
        { t: '跟他比酒量', dev: 0, check: ['根骨', 70], fx: (g) => { g.stat('声望', 4); g.stat('根骨', -2); g.info('名号', '能和丘处机拼酒的人'); }, res: '你们喝到天亮。他说你是他这辈子遇到的第二个能喝的人，第一个是江南七怪里的韩宝驹。这件事第二天就传遍了半个江湖。',
          fail: { fx: (g) => g.stat('根骨', -4), res: '你三碗就倒了。他把你背回了客栈。', dev: 0 } },
        { t: '躲远点', canon: true, cond: (g) => !g.knows('qiuchuji'), res: '那天酒楼的楼板塌了一块。' },
        { t: '陪他喝两碗就告辞', canon: true, cond: (g) => !!g.knows('qiuchuji'), fx: (g) => g.stat('心境', 2), res: '他嫌你走得早，又灌了你一碗才放你走。' },
      ] },
    { id: 'e_sd_ke', y: [20, 51], minAge: 8, t: '瞎眼老头',
      // 铁枪庙之后（纪年 19），柯镇恶知道害死五个兄弟的是欧阳锋和杨康，骂的是他们
      cond: (g) => g.alive('kezhene') && g.me !== 'guojing' && !FOE.test(g.knows('kezhene')),
      text: (g) => {
        const k = g.knows('kezhene');
        if (k) return '嘉兴街头，' + k + '柯镇恶拄着铁杖在骂人，骂的是欧阳锋那个老毒物。他听出了你的脚步声，骂声停了，叫了你一声。';
        return '一个瞎眼老头拄着铁杖，在嘉兴街头骂人，骂的是一个叫欧阳锋的老毒物。';
      },
      choices: [
        { t: '扶他过桥', dev: 0, fx: (g) => { g.stat('情义', 5); g.info('暗器', '柯镇恶的毒菱'); }, res: '他骂了你一路。到了桥那头，塞给你一枚毒菱：“防身。”' },
        { t: '陪他喝酒，听他讲旧事', dev: 0, check: ['情义', 50], fx: (g) => { g.stat('悟性', 3); if (!g.knows('kezhene')) g.rel('酒友', 'kezhene'); else g.remember('drankKe'); },
          res: (g) => '他讲了桃花岛上五个兄弟的事，讲着讲着不骂了。' + (g.knows('guojing') ? '说起郭靖，他说那孩子是世上最傻的好人，你说你知道。' : '他说他有个徒弟叫郭靖，是世上最傻的好人。'),
          fail: { fx: (g) => g.stat('心境', -2), res: '他一杖打在你脚边：“关你什么事！”', dev: 0 } },
        { t: '绕开', canon: true, cond: (g) => !g.knows('kezhene'), res: '他的铁杖敲在石板上，叮叮当当响了一条街。' },
        { t: '陪他站一会儿', canon: true, cond: (g) => !!g.knows('kezhene'), fx: (g) => g.stat('情义', 2), res: '他骂累了，叹了口气，让你陪他去买一壶酒。' },
      ] },
    { id: 'e_sd_tuolei', y: [6, 22], minAge: 8, maxAge: 20, t: '蒙古少年', cond: (g) => g.alive('tuolei') && g.me !== 'guojing' && !g.knows('tuolei'),
      text: '一队蒙古商人路过，带着一个和你差不多大的蒙古少年。他说他叫拖雷，要跟你摔跤。',
      choices: [
        { t: '摔', dev: 0, fx: (g) => { g.stat('武学', 2); g.rel('摔跤的朋友', 'tuolei'); }, res: '你输了三跤赢了一跤。他说他的安答比你厉害，以后到草原上找他。' },
        { t: '跟他换一件东西', dev: 0, fx: (g) => { g.stat('情义', 4); g.info('信物', '拖雷的狼牙'); }, res: '你送了他一把小刀，他送了你一颗狼牙。他说蒙古人见了这颗牙，不会为难你。' },
        { t: '不摔', canon: true, res: '他耸耸肩，骑马走了。' },
      ] },
    { id: 'e_sd_jiuyin', y: [0, 60], minAge: 12, once: true, t: '残页', cond: (g) => !['guojing', 'zhouzhiruo'].includes(g.me),
      text: '一个快死的乞丐塞给你一张纸，上面写着几行看不懂的字：“摩诃波罗，揭谛古罗……”',
      choices: [
        { t: '收好', dev: 0, fx: (g) => { g.stat('悟性', 3); g.info('秘籍', '一页看不懂的梵文'); g.remember('jiuyinPage'); }, res: '你把它夹在贴身的衣服里。那个乞丐说，这张纸害死了好几个人。' },
        { t: '找人翻译', dev: 0, check: ['悟性', 65], fx: (g) => { g.stat('武学', 5); g.stat('悟性', 2); g.info('绝学', '九阴真经总纲（几句）'); }, res: '一个老和尚说这是梵文，念出来却是汉话的口诀。他念完就闭了眼，像是怕记住。',
          fail: { fx: (g) => { g.stat('悟性', 1); g.remember('jiuyinPage'); }, res: '没人看得懂。你一直夹在书里。', dev: 0 } },
        { t: '扔掉', canon: true, res: '风把它吹进了河里。' },
      ] },
    { id: 'e_sd_jiuyin2', y: [0, 70], minAge: 14, t: '夜里的人', cond: (g) => g.recall('jiuyinPage') && g.since('jiuyinPage') >= 2, always: true,
      text: '半夜里有人翻你的东西。灯一亮，是个蒙面人，手里攥着那页梵文。',
      choices: [
        { t: '扑上去抢', dev: 0, check: ['武学', 45], fx: (g) => { g.stat('武学', 3); g.stat('声望', 3); }, res: '你把纸抢了回来。蒙面人跳窗走了。你把那页纸烧了，烧之前背了下来。',
          fail: { fx: (g) => { g.stat('根骨', -10); g.info('秘籍', ''); }, res: '他一掌把你打倒，带着纸走了。你在床上躺了一个月。', dev: 0 } },
        { t: '让他拿走', dev: 0, fx: (g) => { g.info('秘籍', ''); g.stat('心境', 4); }, res: '他愣了一下，没想到这么容易。你睡了一个好觉，那张纸再也不关你的事了。' },
      ] },
    { id: 'e_sd_qiuqianzhang', y: [0, 40], minAge: 10, t: '水上飘', cond: (g) => g.alive('qiuqianren'),
      // 裘千丈是裘千仞的双胞胎哥哥，认得裘千仞的人一眼就看出不对
      text: (g) => '一个老头在河面上走，如履平地。走到河中间，他沉了下去，爬起来骂人。' + (g.knows('qiuqianren') ? '那张脸你认得，又不全像：这是裘千仞的双胞胎哥哥裘千丈，又在拿他兄弟的名头骗人。' : ''),
      choices: [
        { t: '戳穿他', dev: 0, check: ['悟性', 50], fx: (g) => { g.stat('声望', 3); g.info('名号', '看穿水上飘的人'); }, res: '你指着水底的木桩。围观的人哄堂大笑。他叫裘千丈，是铁掌帮主裘千仞的双胞胎哥哥。他记恨上了你。',
          fail: { res: '你没看出门道，他骂骂咧咧地走了。', dev: 0 } },
        { t: '拜他为师', dev: 0, fx: (g) => { g.stat('心境', 4); g.rel('骗子师父', '裘千丈'); }, res: '他教了你三天，全是嘴上功夫。你倒是学会了怎么在水里埋木桩。' },
        { t: '拉他上来', canon: true, fx: (g) => g.stat('情义', 2), res: '他吐了一口水，要收你做徒弟。你没答应。' },
      ] },
    { id: 'e_sd_mei', y: [6, 19], minAge: 12, t: '白骨', cond: (g) => g.alive('meichaofeng') && g.me !== 'huangrong' && !g.knows('meichaofeng'), // 认得梅超风的人（郭靖、杨康）各有自己的剧情
      text: '荒山上摆着九个白骨骷髅，排成一个奇怪的阵。远处有个瞎眼的女人在练爪功。',
      choices: [
        { t: '上前问路', dev: 0, check: ['武学', 40], fx: (g) => { g.stat('武学', 3); g.rel('放过你的瞎眼女人', 'meichaofeng'); }, res: '她抓了你一爪，你躲开了。她说：“还有点意思，滚吧。”',
          fail: { fx: (g) => g.stat('根骨', -12), res: '你肩上多了五个血洞。', dev: 0 } },
        { t: '远远喊一声“桃花岛还记得你”', dev: 0, check: ['悟性', 60], fx: (g) => { g.set('meiHomesick'); g.stat('悟性', 2); }, res: '她愣在那里，手里的骷髅掉在了地上。过了很久，她转身走了，没有回头。',
          fail: { fx: (g) => g.stat('根骨', -8), res: '她循声扑过来，你差点没跑掉。', dev: 0 } },
        { t: '悄悄退走', canon: true, fx: (g) => g.stat('悟性', 1), res: '你跑出很远，才敢回头。' },
      ] },
    { id: 'e_sd_xianglong', y: [63, 150], minAge: 14, once: true, t: '降龙残篇', cond: (g) => g.f('xianglongBook') || g.f('xianglongWudang') || g.f('poluXianglong'),
      text: (g) => (g.f('xianglongWudang') ? '武当山下，一个老道士在打一路掌法，刚猛得不像道家的功夫。他说这是一位守过襄阳的故人传的。' : g.f('xianglongBook') ? '旧书摊上有一本手抄的掌法，字写得很笨，旁边有人用娟秀的小字改过三遍。封面上写着：降龙十八掌。' : '一个独臂的老兵在襄阳城外的破庙里练掌。他说这是郭大侠的儿子当年在城头教他的。'),
      choices: [
        { t: '学', dev: 0, check: ['根骨', 55], fx: (g) => { g.stat('武学', 10); g.info('绝学', '降龙十八掌（残篇）'); }, res: '你练了一年，练会了七掌。掌力打出去，地上的石板裂了。',
          fail: { fx: (g) => { g.stat('武学', 3); g.stat('根骨', -4); }, res: '这掌法太刚，你练了三个月，震伤了自己的经脉。', dev: 0 } },
        { t: '送去丐帮', dev: 0, fx: (g) => { g.stat('声望', 6); g.info('身份', '丐帮的恩人'); }, res: '丐帮的长老们对着那几页纸哭了一场。他们说，降龙掌在帮里只剩九掌了。' },
        { t: '走开', canon: true, res: '你走出很远，还听得见掌风。' },
      ] },
  ]);

  /* ================= 地点闲笔 ================= */
  JY.addFlavor('loc:niujia', [
    '牛家村的老屋长满了青苔，门口两棵桑树还在。',
    '村口的酒店是曲三开的，酒不好，人很好。',
    '钱塘江的潮水晚上能听见，像远处有人在打鼓。',
    '村里的老人还记得那天晚上的火。',
    '田埂上的稻子黄了，风一吹沙沙地响。',
    '村里的孩子们在玩“郭杨两家”的游戏，一个扮郭，一个扮杨。',
  ]);
  JY.addFlavor('loc:grassland', [
    '草原上的天很大，大得让人想喊。',
    '你学会了骑在马上睡觉。',
    '牧民们围着火堆唱歌，歌里唱的是铁木真。',
    '你喝了马奶酒，醉了一整天。',
    '一只海东青从你头上飞过，抓走了一只兔子。',
    '冬天的白毛风刮了三天，帐篷里冷得像冰窖。',
  ]);
  JY.addFlavor('loc:zhongdu', [
    '中都的街上，金兵骑着马横冲直撞。',
    '王府里的灯笼一夜不灭。',
    '你在王府的花园里迷了路，走到了一间江南样式的农舍前。',
    '王府的厨子是汉人，做的菜是江南的味道。',
    '城门口贴着通缉“宋国奸细”的告示。',
    '中都的冬天，护城河冻得能跑马。',
  ]);
  JY.addFlavor('loc:jiangnan', [
    '江南的雨下了一个月，衣服都长了霉。',
    '船娘唱着小调从你身边划过去。',
    '你在桥头买了一碗馄饨，汤很鲜。',
    '茶馆里说书的在讲华山论剑，讲得像他亲眼见过一样。',
    '太湖边上的渔民说，湖里有一个会武功的庄主。',
    '你在一座寺里避雨，和尚请你喝了一碗茶。',
  ]);
  JY.addFlavor('loc:jiaxing', [
    '南湖上的烟雨楼，楼上总有人在喝酒。',
    '嘉兴的粽子，你一口气吃了四个。',
    '铁枪庙里供着一杆锈了的铁枪，香火不旺。',
    '醉仙楼的掌柜说，十八年前有一个道士在这里托着铜缸喝酒。',
    '城外的破窑里住着一对母子，母亲替人缝补。',
    '嘉兴的河道弯弯曲曲，你常常走着走着就回到了原地。',
  ]);
  JY.addFlavor('loc:zhangjiakou', [
    '张家口的风沙大，吃饭时碗里都是土。',
    '边城里蒙古人、汉人、金人混在一起做买卖。',
    '酒楼里的掌柜，见了穿得破的就赶。',
    '城外驼队排成一长串，铃铛响了一下午。',
    '你在集市上看见一匹红马，跑得像火。',
    '张家口的羊肉，比哪里的都香。',
  ]);
  JY.addFlavor('loc:taohua', [
    '岛上的桃林是一座阵，不会走的人进去就出不来。',
    '黄药师的书房里，有一半的书你看不懂。',
    '海边的礁石上，有人用指力刻了一首词。',
    '岛上的白雕，会帮人送信。',
    '你在桃林深处看见一座坟，坟前插着新鲜的花。',
    '岛上的夜很静，只有海浪和箫声。',
  ]);
  JY.addFlavor('loc:guiyun', [
    '归云庄的庄主陆乘风坐在轮椅上，书画却很好。',
    '太湖上的渔船成群结队，都听归云庄的号令。',
    '庄里的书房挂着一幅画，画的是一个青衫书生。',
    '湖上起了雾，庄子像漂在云里。',
    '庄里的少庄主陆冠英，练的是仙霞派的武功。',
    '你在庄里吃了一顿太湖三白。',
  ]);
  JY.addFlavor('loc:sea', [
    '海上的浪把船抬起来又摔下去，你吐了一天。',
    '船舱里有人在弹琴，琴声被海风吹散了。',
    '一群鲨鱼跟着船游了半天。',
    '夜里的海上满天都是星星，分不清哪是天哪是海。',
    '桅杆上的帆被风吹破了一个洞。',
    '你在海上漂了三天，才看见陆地。',
  ]);
  JY.addFlavor('loc:tiezhang', [
    '铁掌峰五座山峰并立，像一只手掌。',
    '山上的铁掌帮众，个个手掌粗大。',
    '中指峰上有铁掌帮历代帮主的坟。',
    '山下的百姓说，铁掌帮早就和金人勾结了。',
    '山路很陡，你走了一天才到半山腰。',
    '夜里山上有火光，像是在练什么功夫。',
  ]);
  JY.addFlavor('loc:yideng', [
    '瀑布的声音大得盖住了说话声。',
    '寺里的小和尚每天要挑二十担水。',
    '一灯大师的禅房里只有一张床、一盏灯。',
    '渔夫在溪边钓鱼，钓了一天一条也没钓到。',
    '樵夫唱着山歌，歌词是一首宋词。',
    '书生的对子，你想了三天还没想出下联。',
  ]);
  JY.addFlavor('loc:huashan', [
    '华山绝顶上的雪终年不化。',
    '山道窄得只能侧身走，下面就是万丈深渊。',
    '你在一块石头上看见了剑痕，不知道是哪年留下的。',
    '山顶的风大得能把人吹下去。',
    '华山的日出，你看了一次就再也忘不了。',
    '山上有一座小庙，庙里供着陈抟老祖。',
  ]);
  JY.addFlavor('loc:westlands', [
    '西域的太阳毒得能把人晒脱一层皮。',
    '撒麻尔罕的城墙是黄土夯的，城里的房子是圆顶。',
    '骆驼跪下来让你上去，站起来时把你甩了下来。',
    '大军走过的地方，只剩下白骨和黄沙。',
    '你在集市上买了一把弯刀，刀身上有花纹。',
    '西域的夜里冷得能冻死人。',
  ]);
  JY.addFlavor('loc:lintan', [
    '临安的西湖边上，歌舞一夜不停。',
    '宫墙很高，墙里的人不知道北边在打仗。',
    '临安城里卖的东西，哪里都比不上。',
    '你在钱塘江边看潮，潮头比城墙还高。',
    '断桥上没有雪，只有游人。',
    '城里的官说，金人打不过来的。',
  ]);

  /* ================= 人物闲笔 ================= */
  JY.addFlavor('char:guojing', [
    { t: '你学会了骑马，比学会走路还快。', maxAge: 6 },
    { t: '你帮母亲剪羊毛，剪得歪歪扭扭。', maxAge: 10 },
    { t: '哲别教你射箭。你练了一个冬天，终于射中了天上的大雁。', minAge: 7, maxAge: 14 },
    { t: '七位师父又吵架了，吵的是该教你什么。', minAge: 7, maxAge: 17 },
    { t: '华筝送了你一只小白雕。', minAge: 9, maxAge: 17 },
    { t: '你和拖雷在草原上比赛骑马，跑了整整一天。', minAge: 9, maxAge: 17 },
    { t: '你一招掌法练了一千遍，二师父说你终于练对了。', minAge: 10, maxAge: 18 },
    { t: '母亲给你讲你父亲的事。你记住了一句：做人要对得起良心。', maxAge: 18 },
    { t: '你背书背得很慢，可背下来的就再也不会忘。', minAge: 18 },
    { t: '蓉儿又在笑你笨，你也跟着笑。', minAge: 19, cond: married },
    { t: '你把降龙十八掌从头到尾打了一遍，院子里的树倒了三棵。', minAge: 20 },
    { t: '你在襄阳城头站了一夜，盯着城外的火光。', minAge: 36, cond: (g) => g.loc === 'xiangyang' },
    { t: '你教城里的少年们练武，教得很慢，他们学得也慢。', minAge: 36, cond: (g) => g.loc === 'xiangyang' },
    { t: '芙儿又闯了祸，你罚她抄书，蓉儿偷偷替她抄了一半。', minAge: 30, maxAge: 45, cond: married },
    { t: '你梦见了大漠，梦见了小红马。', minAge: 30 },
    { t: '你在城头上碰见一个十来岁的孩子，问他长大想做什么。他说想做郭大侠。', minAge: 40, cond: (g) => g.loc === 'xiangyang' },
    { t: '你头发白了一半，力气还和年轻时一样大。', minAge: 50 },
    { t: '你去城外给阵亡的兵士上坟，一块一块地念名字。', minAge: 45, cond: (g) => g.loc === 'xiangyang' },
    { t: '你给破虏讲当年西征的事。他听得很认真。', minAge: 50, cond: married },
    { t: '你把降龙十八掌的口诀写在纸上，又烧了。还是口传心授的好。', minAge: 55 },
    { t: '草原上的风吹了一辈子，你的脸像一块老羊皮。', minAge: 40, cond: (g) => g.f('jingStayMongol') },
    { t: '你偶尔会想起南边，想起一个没见过的小叫化。', minAge: 25, cond: (g) => g.f('jingrongApart') },
  ]);
  JY.addFlavor('char:huangrong', [
    { t: '你把岛上哑仆的饭碗都换成了机关碗，一端就漏。', maxAge: 12 },
    { t: '父亲吹箫，你在旁边跟着哼，跑了调。', maxAge: 12 },
    { t: '你偷看了父亲的《碧海潮生曲》谱子，没看懂。', minAge: 6, maxAge: 15 },
    { t: '你在桃林里布了一个小阵，把父亲困住了半刻钟。他很高兴。', minAge: 8, maxAge: 16 },
    { t: '你对着母亲的画像说话，说了一下午。', maxAge: 17 },
    { t: '你做的菜，父亲说比你娘做的还好吃。你知道他是骗你的。', minAge: 10, maxAge: 17 },
    { t: '你扮成小叫化，在街上骗了三个人的烧饼。', minAge: 18, maxAge: 19 },
    { t: '你一路给靖哥哥出主意，他一路说“好”。', minAge: 18, maxAge: 23, cond: married },
    { t: '你做了一道“好逑汤”，七公吃了三碗。', minAge: 18, maxAge: 23, cond: married },
    { t: '你把丐帮的账理了一遍，抓出了两个吃里扒外的长老。', minAge: 20, cond: married },
    { t: '靖哥哥又在城头站了一夜。你给他送了一碗面，面是他最爱吃的。', minAge: 33, cond: (g) => g.loc === 'xiangyang' },
    { t: '芙儿又哭着跑回来。你知道这孩子被你惯坏了。', minAge: 28, maxAge: 45, cond: married },
    { t: '你在襄阳城外摆了一个石阵，蒙古兵进去就绕不出来。', minAge: 33, cond: (g) => g.loc === 'xiangyang' },
    { t: '你梦见了桃花岛的海，醒来时身边是靖哥哥的鼾声。', minAge: 30, cond: married },
    { t: '你一个人回桃花岛，在母亲坟前坐了一夜。', minAge: 25 },
    { t: '你第一次发现自己的眼角有了细纹，对着铜镜看了很久。', minAge: 38 },
    { t: '襄儿跟你一点也不像，跟她外公倒很像。', minAge: 50, cond: married },
    { t: '你教破虏读兵书。他问你，城守得住吗？你说守得住。', minAge: 50, cond: married },
    { t: '你给靖哥哥补衣服，针脚还是年轻时那样密。', minAge: 45, cond: married },
    { t: '你扮成老太太在江湖上走，没有一个人认出来。', minAge: 20, cond: (g) => g.f('jingrongApart') },
    { t: '你开始给父亲梳头。他的头发全白了。', minAge: 40, cond: (g) => g.alive('huangyaoshi') },
  ]);
  JY.addFlavor('char:yangkang', [
    { t: '王府里的嬷嬷给你穿了三层锦缎，你热得直哭。', maxAge: 4 },
    { t: '你骑在父王的脖子上看灯。', maxAge: 7 },
    { t: '王府的武师们都让着你，你以为自己天下第一。', minAge: 6, maxAge: 14 },
    { t: '母亲教你唱一首江南的小调。父王听见了，脸色不好看。', maxAge: 12 },
    { t: '你学会了说汉话、女真话，还有几句蒙古话。', minAge: 6, maxAge: 15 },
    { t: '丘道长罚你在雪地里站了一个时辰，你没吭声。', minAge: 8, maxAge: 17 },
    { t: '你在王府里看见一个汉人奴仆偷偷哭，问他为什么。他说想家。', minAge: 8, maxAge: 17 },
    { t: '你读了一本岳飞的传，读到风波亭，把书扔了。', minAge: 12, maxAge: 18 },
    { t: '父王让你去临安出使，你在西湖边上住了一个月。', minAge: 16, maxAge: 18 },
    { t: '你穿着锦衣走在街上，人人都给你让路。', minAge: 14, maxAge: 19, cond: (g) => !g.f('yangkangTurned') },
    { t: '你练枪的时候，总觉得这杆枪本来就该是你的。', minAge: 19, cond: (g) => g.f('yangkangTurned') },
    { t: '你梦见母亲站在那间农舍门口叫你，叫的是“康儿”。', minAge: 18 },
    { t: '你在江南的集市上听人说起完颜康，说他已经死了。', minAge: 20, cond: (g) => g.f('yangkangLives') && !g.f('yangkangTurned') },
    { t: '你给过儿做了一把木枪。', minAge: 21, cond: (g) => g.alive('munianci') },
    { t: '你学会了种地，种得不好，念慈不笑你。', minAge: 22, cond: (g) => g.alive('munianci') },
    { t: '你断了的那只手，阴天时还会疼。', minAge: 20, cond: (g) => g.f('yangkangLives') && !g.f('yangkangTurned') },
    { t: '你去牛家村祭祖，碑上的字是你亲手刻的。', minAge: 22, cond: (g) => g.f('yangkangTurned') },
    { t: '有人认出了你，啐了你一口。你没有还手。', minAge: 20 },
    { t: '你听说中都又换了主人，心里不知道是什么滋味。', minAge: 35 },
    { t: '你对着镜子，越来越像那个叫杨铁心的人。', minAge: 40 },
    { t: '你跟过儿说，做人要堂堂正正。他问你，你堂堂正正吗？你没回答。', minAge: 30 },
  ]);
  // 奇遇里和熟人重逢之后，这一世偶尔会想起
  JY.addFlavor('any', [
    { t: '你又梦见了海边那一夜的箫声。', cond: (g) => !!g.recall('xiaoNight') },
    { t: '一灯大师当年替你推拿过的地方，阴天还会发热。', cond: (g) => !!g.recall('yidengHealed') },
    { t: '你摆了一盘棋，想起大理山上那一夜，一个人下完了。', cond: (g) => !!g.recall('yidengChess') },
    { t: '你收到一封没有落款的信，里面只有一道算好的题。你知道是黑沼来的。', cond: (g) => !!g.recall('yingguSolved') },
    { t: '襄阳那边来人，说郭大侠还记得你在城头搬过的那些石头。', cond: (g) => !!g.recall('helpedGuoXY') },
    { t: '嘉兴的朋友捎话来，说柯大侠又喝醉了，嘴里念着你的名字。', cond: (g) => !!g.recall('drankKe') },
  ]);

  JY.addFlavor('char:munianci', [
    { t: '你在邻居家的屋檐下睡了一个冬天。', maxAge: 4 },
    { t: '你跟着义父走了很多地方，学会了在马车上睡觉。', minAge: 5, maxAge: 15 },
    { t: '义父给你买了一根红头绳，你戴了三年。', minAge: 5, maxAge: 12 },
    { t: '你学会了翻跟头，在街头一翻就是二十个。', minAge: 7, maxAge: 17 },
    { t: '有人往卖艺的盘子里扔了一块银子，义父追上去还给了人家。', minAge: 6, maxAge: 17 },
    { t: '你学会了缝补，义父的衣服都是你补的。', minAge: 8, maxAge: 17 },
    { t: '你在庙会上看皮影戏，看的是杨家将。义父看哭了。', minAge: 6, maxAge: 17 },
    { t: '你们在一座城外露宿，你数着星星睡着了。', minAge: 5, maxAge: 17 },
    { t: '你把那三招掌法练得滚瓜烂熟。', minAge: 12, maxAge: 18 },
    { t: '你梦见那个锦衣公子，醒来脸红了。', minAge: 18, maxAge: 20 },
    { t: '你一个人走了很远的路，鞋底磨穿了。', minAge: 18, maxAge: 20 },
    { t: '过儿第一次叫“娘”。', minAge: 21, maxAge: 22 },
    { t: '你替人缝了一件嫁衣，缝着缝着停了下来。', minAge: 20 },
    { t: '过儿在外面打了架，回来不说。你替他洗了衣服上的血。', minAge: 26 },
    { t: '过儿问你，爹是什么样的人。你说，他很好看。', minAge: 24 },
    { t: '你把杨康送你的那根簪子收在枕头底下。', minAge: 20 },
    { t: '冬天的破窑很冷，你把被子都盖在过儿身上。', minAge: 21, cond: (g) => !g.f('yangguoRaisedByGuo') },
    { t: '你教过儿认字，第一个字是“杨”。', minAge: 24 },
    { t: '你去义父坟前上香，说过儿长高了。', minAge: 19, cond: (g) => !g.f('tiexinLives') },
    { t: '义父在院子里给过儿讲杨家将的故事。', minAge: 20, cond: (g) => g.f('tiexinLives') },
    { t: '你头发白了，过儿还是没有回来。', minAge: 45 },
  ]);
})();

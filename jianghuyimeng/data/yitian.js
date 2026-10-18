/* 江湖一梦 · 倚天屠龙记
 * 可玩：张无忌、赵敏、周芷若。纪年 80–190。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const B = '倚天屠龙记';

  JY.addLocs({
    lvliu: { name: '绿柳山庄', scene: 'lake', desc: '湖边山庄' },
  });

  JY.addFlags({
    wujiShaolin: '张无忌拜入了少林',
    huqingniuLives: '胡青牛没有死在金花婆婆手里',
    xiaozhaoStayed: '小昭没有去波斯',
    wujiSawThrough: '张无忌一开始就不信灵蛇岛的事是赵敏干的',
    xiexunForgave: '谢逊没有亲手废掉成昆',
    zhouExposed: '灵蛇岛上的事被赵敏当场揭穿',
    zhouNoJiuyin: '周芷若没有练九阴白骨爪',
    songqingshuLives: '宋青书没有死在武当山',
    zhaominFought: '赵敏在万安寺调兵死守',
    wujiToldIsland: '张无忌在武当山上说出了冰火岛',
    jiuyangBurned: '四本《九阳真经》被张无忌背熟后烧了',
    wujiPromise: '张无忌答应过谢逊，要回冰火岛接他',
    wujiStayIsland: '张无忌没有回中原，留在冰火岛陪谢逊长大',
    xiexunBackEarly: '谢逊跟着张无忌提前回了中原',
    wujiKnowsYuanzhen: '张无忌在少林撞见了圆真和玄冥二老的勾当',
    chengkunExposed: '成昆的真面目被提前揭穿',
    wujiHairpin: '周芷若一直戴着张无忌送的发簪',
    wujiChangyuchun: '常遇春记着汉水上那个孩子的话',
    wujiNoThreePromises: '张无忌没有答应赵敏三件事',
    yuDaiyanAvenged: '俞岱岩的仇在武当山上当场报了',
    yinliHealed: '殷离脸上的伤被张无忌治好了',
    wujiVisitedPersia: '张无忌去波斯看过小昭',
    wujiSonMartial: '张无忌的儿子练成了九阳神功',
    wujiSonWudang: '张无忌的儿子做了武当弟子',
    mingjiaoPardoned: '朱元璋放了牢里的明教弟子',
    mingjiaoHerbalists: '明教的残部在深山里种药行医',
    wujiMedicalBook: '张无忌把一辈子的医方写成了书',
    zhouLeftEmei: '周芷若嫁人后交出了峨嵋掌门',
    zhouSpared: '赵敏替周芷若瞒下了灵蛇岛的事',
    zhouDisgraced: '周芷若被逐出峨嵋，回了汉水',
    wangbaobaoSupplied: '赵敏给漠北的王保保送过粮草',
    zhaoZhouReconciled: '赵敏和周芷若坐在一张桌上吃过饭',
    zhaominMemoir: '赵敏写下了《汝阳王府旧事》',
    changyuchunOwesZhou: '周芷若在汉水上救过常遇春的命',
    zhouWroteSong: '周芷若给宋青书回过一封信',
    zhouMercyThrust: '光明顶上，周芷若那一剑刺偏了',
    zhouFollowedWuji: '周芷若没做掌门，下山跟在张无忌身边',
    zhouSparedYinli: '灵蛇岛上，殷离的脸没有被划伤',
    zhouToldWuji: '周芷若把师父的遗命告诉了张无忌',
    zhouJoinedRescue: '周芷若脱下嫁衣，和张无忌、赵敏一起去救谢逊',
    zhouFairFight: '屠狮大会上，周芷若没有用九阴白骨爪',
    zhouSavedXiexun: '周芷若在少林后山救过谢逊',
    zhouToldZhaomin: '周芷若把灵蛇岛的事只告诉了赵敏',
    songqingshuFled: '宋青书从峨嵋后山逃走了',
    zhouHanshuiVow: '周芷若和张无忌约了下辈子在汉水见',
    emeiCourt: '峨嵋派做了朝廷的门派',
    emeiJiuyinClaw: '九阴白骨爪在峨嵋传了下去',
    zhouApologized: '周芷若写信向赵敏认了错',
    zhouConfession: '周芷若写下了灵蛇岛那一夜',
    cuishanEmeiMove: '张翠山跟郭襄学过一招峨嵋剑法',
    sanfengGotNeedle: '张三丰收到了郭襄的一枚金针',
    xiexunSpared: '谢逊在破庙里被人劝住，少杀了几个人',
    xiexunKnowsShaolin: '谢逊早就知道成昆躲在少林',
    gaibangUnited: '分裂的丐帮又合到了一起',
    redScarfVillage: '一个村子的红巾军提前躲过了官兵',
    xuanmingScarred: '玄冥二老被一个路人打伤过',
    bosiFoundEarly: '波斯明教提早找到了灵蛇岛',
    bosiDelayed: '波斯明教来中原晚了一年',
    heZudaoBeaten: '昆仑三圣何足道输过一场剑',
    heZudaoFriend: '昆仑三圣何足道和人下了三天三夜棋',
  });

  /* ---------- 本书配角 ---------- */
  JY.addChars([
    { id: 'zhangcuishan', name: '张翠山', book: B, sex: '男', born: 92, origin: '武当七侠之五，人称银钩铁划',
      death: (g) => (g.f('cuishanLives') ? { y: 150, cause: '在武当山上寿终', mod: true } : { y: 124, cause: '在张三丰八十寿宴上自刎，以谢俞岱岩' }),
      ms: [[92, '生于武当山下'], [100, '拜张三丰为师'], [108, '在峨嵋跟郭襄学了一招剑法', (g) => g.f('cuishanEmeiMove')], [110, '武当七侠之五，书法与武功同样出名'], [113, '王盘山上被谢逊掳走，漂流冰火岛'], [114, '在冰火岛上生下儿子张无忌'], [124, '回到中原'], [125, '在武当山上教儿子写字', (g) => g.f('cuishanLives')]] },
    { id: 'yinsusu', name: '殷素素', book: B, sex: '女', born: 96, origin: '天鹰教教主殷天正之女',
      death: (g) => (g.f('cuishanLives') ? { y: 148, cause: '病逝于武当山下', mod: true } : { y: 124, cause: '抱着丈夫的尸身殉情' }),
      ms: [[96, '生于天鹰教'], [113, '王盘山上与张翠山一起被谢逊掳走'], [114, '生下张无忌'], [124, '回到中原']] },
    { id: 'xiexun', name: '谢逊', book: B, sex: '男', born: 84, origin: '明教四大护教法王之一，金毛狮王',
      death: { y: 150, cause: '在少林寺出家，圆寂于寺中' },
      ms: [[84, '生于江南'], [95, '拜成昆为师'], [102, (g) => (g.f('xiexunWarned') ? '有人提醒过他提防师父，他没信。全家被成昆所害' : '全家被成昆所害')],
        [108, (g) => (g.f('xiexunSpared') ? '在江湖上找成昆报仇，没有滥杀' : '在江湖上滥杀，处处留下成昆的名字')], [113, '夺得屠龙刀，漂流冰火岛，双目被殷素素射瞎'],
        [124, (g) => (g.f('wujiStayIsland') ? '和义子张无忌留在冰火岛' : '独自留在冰火岛')], [125, '冰火岛上来过几条找他的船，他一条也没放回去', (g) => g.f('wujiToldIsland')],
        [134, '跟着义子张无忌回到中原', (g) => g.f('xiexunBackEarly')], [135, '被接回中原', (g) => !g.f('xiexunBackEarly')],
        [136, (g) => (g.f('zhouSavedXiexun') ? '被周芷若和张无忌从少林后山救出，在少林寺拜渡厄为师' : '在少林寺拜渡厄为师')]] },
    { id: 'chengkun', name: '成昆', book: B, sex: '男', born: 74, origin: '混元霹雳手，化名圆真藏身少林',
      death: (g) => (g.f('xiexunForgave') ? { y: 140, cause: '在少林寺里郁郁而终', mod: true } : { y: 136, cause: '在屠狮大会上被谢逊废去武功、刺瞎双眼，不久死去' }),
      ms: [[74, '生于江南'], [102, '害死徒弟谢逊满门'], [105, '设计害死明教教主阳顶天'], [115, (g) => (g.f('xiexunKnowsShaolin') ? '化名圆真藏身少林。谢逊早就知道他在哪' : '化名圆真，藏身少林')], [134, '挑动六大派围攻光明顶'],
        [134, '光明顶上被张无忌揭穿，押回少林后山', (g) => g.f('chengkunExposed')]] },
    { id: 'yintianzheng', name: '殷天正', book: B, sex: '男', born: 65, origin: '白眉鹰王，天鹰教教主',
      death: { y: 140, cause: '病逝' },
      ms: [[65, '生于江南'], [95, '自立天鹰教'], [134, '光明顶上独战六大派'], [134, '天鹰教重归明教']] },
    { id: 'yangxiao', name: '杨逍', book: B, sex: '男', born: 95, origin: '明教光明左使',
      death: { y: 165, cause: '寿终' },
      ms: [[95, '生于西域'], [120, '明教光明左使'], [127, '得知纪晓芙为他而死'], [138, '接任明教教主', (g) => !g.f('mingjiaoKept')], [138, '辅佐教主张无忌', (g) => g.f('mingjiaoKept')]] },
    { id: 'songqingshu', name: '宋青书', book: B, sex: '男', born: 110, origin: '武当宋远桥之子',
      death: (g) => (g.f('songqingshuFled') ? { y: 165, cause: '隐姓埋名，死在一个没人认得他的地方', mod: true } : g.f('songqingshuLives') ? { y: 170, cause: '在峨嵋山下种了一辈子地', mod: true } : { y: 137, cause: '被押回武当，伤重而死' }),
      ms: [[110, '生于武当山'], [128, '武当第三代弟子中的翘楚'], [133, '怀里揣着周芷若回的一封信', (g) => g.f('zhouWroteSong')], [134, '随武当派围攻光明顶'], [136, '为了周芷若，害死师叔莫声谷'], [137, '从峨嵋后山逃走，武当找了他三年', (g) => g.f('songqingshuFled')]] },
    { id: 'yinli', name: '殷离', book: B, sex: '女', born: 115, origin: '殷野王之女，金花婆婆的徒弟',
      death: (g) => (g.f('yinliHealed') || g.f('zhouSparedYinli') ? { y: 178, cause: '在蝴蝶谷行医，终老谷中', mod: true } : { y: 175, cause: '独自远走，不知所终' }),
      ms: [[115, '生于天鹰教'], [124, '随金花婆婆学千蛛万毒手'], [126, '在蝴蝶谷咬了张无忌一口'], [135, (g) => (g.f('zhouSparedYinli') ? '灵蛇岛上那一夜，没有人伤她' : g.f('yinliHealed') ? '在灵蛇岛上被人划伤了脸，张无忌替她治好了' : '在灵蛇岛上被人划伤了脸')], [137, '说她心里只有那个小时候的张无忌，独自走了']] },
    { id: 'xiaozhao', name: '小昭', book: B, sex: '女', born: 117, origin: '波斯明教圣女之女',
      death: (g) => (g.f('xiaozhaoStayed') ? { y: 185, cause: '在中原终老', mod: true } : { y: 180, cause: '在波斯总教寿终' }),
      ms: [[117, '生于波斯'], [133, '扮成丑丫头潜入光明顶'], [134, '在秘道里陪张无忌找到乾坤大挪移'], [135, '去波斯做了明教教主', (g) => !g.f('xiaozhaoStayed')], [135, '留在张无忌身边', (g) => g.f('xiaozhaoStayed')],
        [134, '波斯明教的人早早找到了她', (g) => g.f('bosiFoundEarly')], [136, '波斯的船晚来了一年，她在中原多留了一年', (g) => g.f('bosiDelayed') && !g.f('xiaozhaoStayed')],
        [138, '张无忌从中原来波斯看过她一次', (g) => g.f('wujiVisitedPersia')]] },
    { id: 'ruyangwang', name: '汝阳王', book: B, sex: '男', born: 80, origin: '元朝汝阳王察罕特穆尔，赵敏之父',
      death: { y: 142, cause: '被降将刺杀于军中' },
      ms: [[80, '生于漠北'], [110, '封汝阳王，统领天下兵马'], [133, '派女儿收服中原武林'], [137, '与女儿决裂', (g) => !g.f('zhaominHome')]] },
    { id: 'wangbaobao', name: '王保保', book: B, sex: '男', born: 110, origin: '汝阳王世子库库特穆尔',
      death: { y: 151, cause: '病逝于漠北' },
      ms: [[110, '生于大都汝阳王府'], [130, '领兵镇压各地义军'], [144, '护着元顺帝退回漠北'], [146, '在漠北收拾残兵，与明军周旋'], [147, '收到妹妹送来的一车粮草，那个冬天没饿死一个兵', (g) => g.f('wangbaobaoSupplied')]] },
    { id: 'zhuyuanzhang', name: '朱元璋', book: B, sex: '男', born: 105, origin: '濠州贫农之子',
      death: { y: 174, cause: '在南京驾崩' },
      ms: [[105, '生于濠州'], [122, '在皇觉寺做和尚'], [128, '投奔明教义军'], [136, '濠州义军首领'], [138, '设计逼走张无忌', (g) => !g.f('mingjiaoKept')], [140, '攻下集庆'], [144, '称帝，国号大明'], [146, '下诏禁绝明教']] },
    { id: 'huqingniu', name: '胡青牛', book: B, sex: '男', born: 80, origin: '明教神医，人称蝶谷医仙、见死不救',
      death: (g) => (g.f('huqingniuLives') ? { y: 150, cause: '在蝴蝶谷寿终', mod: true } : { y: 127, cause: '与妻子王难姑一同被金花婆婆所杀' }),
      ms: [[80, '生于江西'], [110, '隐居蝴蝶谷，只救明教中人'], [126, '收留了身中寒毒的张无忌']] },
    { id: 'zhuchangling', name: '朱长龄', book: B, sex: '男', born: 85, origin: '昆仑山下红梅山庄庄主', minor: true,
      death: { y: 134, cause: '从昆仑山崖上摔下而死' },
      ms: [[85, '生于昆仑山下'], [129, '收留张无忌，想骗出谢逊的下落'], [130, '卡在山洞里，进退不得']] },
    { id: 'miejue', name: '灭绝师太', book: B, sex: '女', born: 89, origin: '峨嵋派掌门',
      death: (g) => (g.f('miejueLives') || g.f('noWanan') ? { y: 150, cause: '在峨嵋金顶病逝', mod: true } : { y: 135, cause: '在万安寺高塔上跳下而死' }),
      ms: [[89, '生于四川'], [135, '从万安寺塔上被人救下', (g) => g.f('miejueLives')], [100, '拜入峨嵋派'], [112, (g) => (g.f('emeiLate') ? '接任峨嵋第二代掌门' : '接任峨嵋第三代掌门')], [127, '一掌打死不肯杀杨逍的弟子纪晓芙'], [134, '率峨嵋围攻光明顶'], [135, '被赵敏囚于万安寺']] },
    { id: 'songyuanqiao', name: '宋远桥', book: B, sex: '男', born: 80, origin: '武当七侠之首',
      death: { y: 160, cause: '在武当山寿终' },
      ms: [[80, '生于湖北'], [88, '张三丰的第一个弟子'], [110, '武当七侠之首'], [137, '亲手送走儿子宋青书', (g) => !g.f('songqingshuLives')]] },
    { id: 'changyuchun', name: '常遇春', book: B, sex: '男', born: 106, origin: '明教弟子，后为明军大将',
      death: { y: 145, cause: '在军中暴病而死' },
      ms: [[106, '生于濠州'], [125, (g) => (g.f('changyuchunOwesZhou') ? '在汉水上落水，被船家女周芷若拖上了船' : '在汉水上被蒙古兵追杀，遇到张三丰和张无忌')], [126, '带张无忌去蝴蝶谷求医'], [136, '朱元璋手下大将'], [144, '率军攻入大都']] },
    { id: 'huangshan', name: '黄衫女子', book: B, sex: '女', born: 112, origin: '终南山古墓的传人，神雕侠杨过的后人',
      exists: (g) => !g.f('yangNoTomb') && !g.f('gumuNoHeir'),
      death: { y: 190, cause: '回到终南山古墓，再没有出来' },
      ms: [[112, '生于终南山古墓'], [130, '偶尔牵着一只白雕出没江湖'], [136, '在屠狮大会上以打狗棒法击退九阴白骨爪']] },
  ]);

  /* ---------- 张无忌 ---------- */
  // 张无忌有三支：原著（回中原、蝴蝶谷、昆仑山谷）、拜入少林、留在冰火岛。三支在光明顶会合。
  const zwMain = (g) => !g.f('wujiStayIsland') && !g.f('wujiShaolin');
  const zhangwuji = {
    id: 'zhangwuji', name: '张无忌', py: 'ZHANG<<WU<JI', book: B, sex: '男', born: 114,
    origin: '武当张翠山之子，金毛狮王的义子',
    birthplace: '北海冰火岛', home: 'binghuo', bg: 3,
    info: { 门派: '无', 身份: '武当张五侠之子' },
    look: { hair: 'topknot', hairColor: '#1d1611', robe: '#5d7f6a', accent: '#d8c27a' },
    family: [{ rel: '父亲', id: 'zhangcuishan' }, { rel: '母亲', id: 'yinsusu' }, { rel: '义父', id: 'xiexun' }],
    fateText: '在冰火岛长大，十岁回中原中了玄冥神掌。坠谷得《九阳真经》，光明顶上做了明教教主。在赵敏、周芷若之间犹豫半生，最后让出教主之位，和赵敏归隐，替她画眉。',
    st: [60, 65, 70, 85, 5, 0, 60],
    death: (g) => (g.f('zhouMarried') ? { y: 186, cause: '与周芷若在峨嵋山下终老', mod: true }
      : g.f('zhaominHome') ? { y: 180, cause: '独自终老海外', mod: true }
      : g.f('mingjiaoKept') ? { y: 178, cause: '在光明顶上病逝', mod: true }
      : { y: 188, cause: '与赵敏在塞外终老' }),
    ms: [[114, '生于北海冰火岛'], [124, '和义父谢逊留在冰火岛', (g) => g.f('wujiStayIsland')], [124, '回到中原，中了玄冥神掌', (g) => !g.f('wujiStayIsland')],
      [125, '拜入少林，做了小沙弥', (g) => g.f('wujiShaolin')], [126, '在蝴蝶谷跟胡青牛学医', (g) => !g.f('wujiStayIsland') && !g.f('wujiShaolin')], [129, '坠入昆仑山谷', (g) => !g.f('wujiStayIsland') && !g.f('wujiShaolin')],
      [133, '从冰火岛回到中原', (g) => g.f('wujiStayIsland')],
      [134, '光明顶上力挽狂澜，做了明教教主', (g) => !g.f('mingjiaoCrushed')], [134, '没有插手光明顶的事', (g) => g.f('mingjiaoCrushed')],
      [135, '在万安寺救出六大派', (g) => !g.f('noWanan')], [136, '在少林屠狮大会上救出义父'], [136, '娶了周芷若', (g) => g.f('zhouMarried')], [136, '和周芷若的婚事作罢', (g) => g.f('zhouExposed')],
      [137, '身边多了一个跟着他的周芷若', (g) => g.f('zhouFollowedWuji') && !g.f('zhouMarried')], [138, '去波斯看过小昭', (g) => g.f('wujiVisitedPersia')],
      [138, '让出教主之位，与赵敏归隐', (g) => !g.f('mingjiaoKept') && !g.f('zhouMarried') && !g.f('zhaominHome')], [138, '仍是明教教主', (g) => g.f('mingjiaoKept')]],
    arc: {
      focus: '读书参悟',
      intro: '你生在北海冰火岛上。四周全是冰，岛中间有一座终年喷火的火山。父亲张翠山是武当弟子，母亲殷素素是天鹰教的姑娘。还有一个瞎了眼的义父，金毛狮王谢逊。',
      lastWords: '太师父说，武功不是用来打人的。我花了一辈子才信。',
      nodes: [
        { id: 'zw_birth', age: 0, t: '冰火岛', loc: 'binghuo', auto: true,
          text: '你出生那天，义父的疯病正好发作，扑过来要杀你娘。你哭了第一声，他就停住了。他给你取名“无忌”，和他死去的儿子同名。',
          fx: (g) => { g.party(['zhangcuishan', 'yinsusu']); } },
        { id: 'zw_letters', age: 4, t: '认字', loc: 'binghuo',
          text: '父亲在冰上划字教你。母亲想教你打暗器，义父说要教你听风辨位。三个大人为这件事吵了一个下午。',
          choices: [
            { t: '跟父亲学写字', canon: true, fx: (g) => { g.stat('悟性', 4); g.remember('zw_child', 'brush'); }, res: '你学会的第一个字是“武”。父亲写给你看他那二十四个字，一笔连着一笔，像一套拳。' },
            { t: '跟母亲学打暗器', dev: 5, fx: (g) => { g.stat('武学', 4); g.remember('zw_child', 'darts'); }, res: '你一针钉住了一只海鸟的翅膀，又哭着把它放了。娘说，这手法以后能救命。' },
            { t: '跟义父学听声辨位', dev: 5, fx: (g) => { g.stat('悟性', 3); g.remember('zw_child', 'ear'); }, res: '义父蒙上你的眼睛，让你听雪落在冰上的声音。你听出了三种。这双耳朵，你用了一辈子。' },
          ] },
        { id: 'zw_koujue', age: 5, t: '背口诀', auto: true,
          text: '义父要你背一大堆武功口诀，说是天下各门各派的绝学，背错一个字就骂你。他说：“你现在不懂，以后会懂。”',
          fx: (g) => { g.stat('悟性', 3); g.stat('武学', 3); } },
        { id: 'zw_bear', age: 7, t: '白熊', auto: true,
          text: '一头白熊闯进了石洞。义父听声辨位，一掌把它打死了。那个冬天，你们吃了一个月的熊肉。',
          fx: (g) => g.stat('根骨', 3) },
        { id: 'zw_leave', age: 9, t: '木筏', loc: 'binghuo',
          text: '父亲扎了一只大木筏，说要回中原。义父不肯走，说他回去只会害了你们。',
          choices: [
            { t: '跪下给义父磕头', canon: true, fx: (g) => { g.stat('情义', 5); g.stat('心境', -5); g.rel('义父', 'xiexun', '留在冰火岛'); }, res: '义父把你的小手按在自己脸上摸了很久，然后转身走进了冰原。' },
            { t: '抱着他的腿，求他一起走', dev: 10, check: ['情义', 80], fx: (g) => { g.set('wujiPromise'); g.stat('情义', 6); g.rel('义父', 'xiexun', '约好十年后去接他'); }, res: '他摸着你的头说：“十年以后，你来接我。”你说好。这句话你记了十年。',
              fail: { fx: (g) => g.stat('心境', -8), res: '他把你的手一根一根掰开了。', dev: 0 } },
            { t: '说你要留下来陪义父', dev: 35, check: ['情义', 90], fx: (g) => { g.set('wujiStayIsland'); g.stat('情义', 6); g.party(['xiexun']); g.rel('义父', 'xiexun', '和你一起留在冰火岛'); },
              res: '父亲和母亲吵了一夜，最后答应了。木筏走的那天，义父把你扛在肩上，一直站到看不见帆。',
              fail: { fx: (g) => g.stat('心境', -6), res: '父亲把你抱上了木筏。你一路哭到看不见冰火岛。', dev: 0 } },
          ] },
        /* 留在冰火岛的一支 */
        { id: 'zw_isl_years', age: 11, t: '两个人的岛', loc: 'binghuo', auto: true, cond: (g) => g.f('wujiStayIsland'),
          text: '木筏走了以后，岛上只剩你和义父。他把一身武功拆开了教你：七伤拳、狮子吼，还有那些你背过的口诀。你没中过什么玄冥神掌，冷了就去火山口烤火。',
          fx: (g) => { g.stat('武学', 18); g.stat('根骨', 8); g.info('武学', '七伤拳'); g.rel('师父', 'xiexun'); } },
        { id: 'zw_isl_madness', age: 15, t: '疯病', loc: 'binghuo', cond: (g) => g.f('wujiStayIsland'),
          text: (g) => (g.recall('zw_child') === 'ear' ? '半夜，你听见义父的呼吸乱了。' : '半夜，义父忽然坐了起来。') + '他的疯病又犯了，把你当成了成昆，一掌劈了过来。',
          choices: [
            { t: '不躲，喊他一声“义父”', dev: 0, check: ['情义', 80], fx: (g) => { g.remember('zw_island', 'calm'); g.stat('情义', 5); }, res: '掌风停在你额前。他摸到你的脸，跪在冰上哭了。从那以后，他的疯病再没犯过。',
              fail: { fx: (g) => { g.remember('zw_island', 'mad'); g.stat('根骨', -20); }, res: '他没听见。你断了两根肋骨，在火山口躺了一个月。他醒过来以后，再不敢靠近你。', dev: 0 } },
            { t: '用七伤拳硬接这一掌', dev: 0, check: ['武学', 45], fx: (g) => { g.remember('zw_island', 'calm'); g.stat('武学', 6); }, res: '两掌相碰，他退了三步。他听出那是自己教的拳，一下子清醒了。',
              fail: { fx: (g) => { g.remember('zw_island', 'mad'); g.stat('根骨', -25); }, res: '你的七伤拳先伤了自己。他打完那一掌就跑进了冰原，三天后才回来。', dev: 0 } },
            { t: '跑进火山口的热泉里躲一夜', dev: 0, fx: (g) => { g.remember('zw_island', 'mad'); g.stat('心境', -6); }, res: '天亮时他找到你，问你昨晚去了哪里。他什么都不记得。你也没说。' },
          ] },
        { id: 'zw_isl_back', age: 19, t: '漂来的木板', loc: 'sea', cond: (g) => g.f('wujiStayIsland'),
          text: (g) => '海上漂来一块木板，上面刻着武当的记号。父亲母亲没有回来接你。' + (g.recall('zw_island') === 'calm' ? '义父说：“该回去了，我陪你。”' : '义父整夜坐在火山口，不跟你说话。'),
          choices: [
            { t: '扎一只木筏，带义父一起走', dev: 30, cond: (g) => g.recall('zw_island') === 'calm', fx: (g) => { g.set('xiexunBackEarly'); g.party(['xiexun']); g.move('road'); g.info('身份', '金毛狮王的义子') },
              res: (g) => '你们在海上漂了四个月。一上岸，义父就让你别说他是谁。' + (g.alive('zhangcuishan') ? '武当山上，父亲母亲抱着你哭了很久。' : '你这才知道，父亲母亲回中原那年就死了。') },
            { t: '一个人回去，答应义父再来接他', dev: 15, fx: (g) => { g.set('wujiPromise'); g.move('road'); g.info('身份', '冰火岛上回来的人'); },
              res: (g) => (g.alive('zhangcuishan') ? '你回到中原，在武当山下找到了父亲。他看着你，说你长得像你义父。' : '你回到中原才知道，父亲母亲回来那年就死了。你在武当山下磕了三个头，没敢上山。') },
            { t: '趁义父睡着，悄悄扎筏子走', dev: 15, fx: (g) => { g.remember('zw_island', 'left'); g.move('road'); g.info('身份', '冰火岛上回来的人'); g.stat('心境', -10); },
              res: '你走的时候回了一次头。火山口的烟还在冒，义父没有追出来。' },
          ] },
        /* 回中原 */
        { id: 'zw_shoudan', age: 10, t: '八十大寿', loc: 'wudang', cond: (g) => !g.f('wujiStayIsland'),
          text: '你们在海上漂了半年，回到中原。太师父张三丰八十大寿，少林、峨嵋、崆峒、华山、昆仑的人都来了，围着你父亲，逼他说出义父在哪里。父亲看着你，不说话。',
          choices: [
            { t: '什么也不说，紧紧拉着娘的手', canon: true, fx: (g) => { g.stat('心境', -35); g.stat('情义', 5); g.rel('太师父', 'zhangsanfeng'); },
              res: '父亲拔剑自刎了。母亲在你耳边说：“孩子，你长大了，要提防女人骗你。”然后她也倒了下去。' },
            { t: '大声说：“我义父早就死了！”', dev: 35, check: ['悟性', 60], fx: (g) => { g.set('cuishanLives'); g.stat('心境', 5); g.rel('太师父', 'zhangsanfeng'); },
              res: '你哭着说义父被大熊吃掉了。没人全信，可也没人能逼一个孩子说出真话。太师父站起来，拂袖送客。父亲和母亲都活了下来。',
              fail: { fx: (g) => { g.stat('心境', -35); g.rel('太师父', 'zhangsanfeng'); }, res: '你说得太急，被人一眼看穿。父亲叹了口气，拔出了剑。', dev: 3 } },
            { t: '说出义父在冰火岛', dev: 30, fx: (g) => { g.set('wujiToldIsland'); g.stat('心境', -30); g.stat('正邪', -10); g.rel('太师父', 'zhangsanfeng'); },
              res: '你话一出口，父亲的脸就白了。他对众人说：“是我教子无方。”然后拔出了剑。那年秋天，好几条船出海去找冰火岛。' },
          ] },
        { id: 'zw_xuanming', age: 10, t: '玄冥神掌', auto: true, cond: (g) => !g.f('wujiStayIsland'),
          text: (g) => (g.f('cuishanLives') ? '寿宴散后，一个蒙古王府的老者趁夜摸上武当，一掌拍在你背上。' : '混乱中，一个蒙古王府的老者把你掳走，一掌拍在你背上。') + '那是玄冥神掌。' + (g.f('xuanmingScarred') ? '他脸上有一道旧伤，是早年被人打的。' : '') + '寒毒钻进了你的骨头，太师父也化不掉。',
          fx: (g) => { g.stat('根骨', -35); g.stat('心境', -8); } },
        { id: 'zw_shaolin', age: 11, t: '少林求经', loc: 'shaolin', cond: (g) => !g.f('wujiStayIsland'),
          text: (g) => (g.f('cuishanLives') ? '父亲和太师父一起' : '太师父') + '抱着你上少林，求他们用《九阳真经》救你。方丈说，要传九阳功，你得先拜入少林。',
          choices: [
            { t: '不拜。武当的孩子不进少林', canon: true, fx: (g) => { g.stat('正邪', 3); g.move('road'); }, res: '太师父抱着你下了山。他一句话也没说，可你看见他的胡子在抖。' },
            { t: '拜入少林', dev: 35, fx: (g) => { g.set('wujiShaolin'); g.stat('根骨', 20); g.stat('武学', 8); g.info('门派', '少林派'); g.move('shaolin'); },
              res: '你剃了头，学了少林九阳功，寒毒压住了一半。太师父独自下了山，背影很老。' },
            { t: '偷偷记下僧人练功时念的经文', dev: 15, check: ['悟性', 70], fx: (g) => { g.remember('zw_verses'); g.stat('根骨', 6); g.move('road'); }, res: '你只记住了几段，却真压住了几天寒毒。太师父看出来了，没说你。这几段经文，后来在一个山谷里又碰上了。',
              fail: { fx: (g) => { g.stat('根骨', -3); g.move('road'); }, res: '你记混了，夜里练岔了气，冷得直发抖。', dev: 0 } },
          ] },
        /* 拜入少林的一支 */
        { id: 'zw_sl_monk', age: 13, t: '小沙弥', loc: 'shaolin', cond: (g) => g.f('wujiShaolin'),
          text: '你在少林做了两年小沙弥。夜里挑水时，你常看见一个叫圆真的和尚从后山的小门出去，天亮才回来。',
          choices: [
            { t: '专心念经练功', dev: 0, fx: (g) => { g.info('武学', '少林九阳功'); g.stat('根骨', 10); g.stat('武学', 15); }, res: '你把少林九阳功练到了第五层。寒毒还在，可已经要不了你的命。' },
            { t: '跟上去看看', dev: 15, check: ['悟性', 65], fx: (g) => { g.set('wujiKnowsYuanzhen'); g.stat('悟性', 4); g.stat('武学', 8); },
              res: '你看见他在山下见了两个老头，一个拿鹿杖，一个拿鹤笔。就是那两个人，当年在你背上拍了一掌。你把这件事记在了心里，谁也没告诉。',
              fail: { fx: (g) => { g.remember('zw_caught'); g.stat('根骨', -10); }, res: '你脚下一滑，踩响了枯枝。第二天，圆真笑着摸了摸你的头。你冷了一整夜。', dev: 0 } },
          ] },
        { id: 'zw_sl_leave', age: 17, t: '下山', loc: 'shaolin', cond: (g) => g.f('wujiShaolin'),
          text: (g) => '少林九阳功压住了寒毒，却除不了根。方丈说，你可以留下来受戒，也可以下山。' + (g.recall('zw_caught') ? '圆真师叔站在方丈身后，一直看着你。' : ''),
          choices: [
            { t: '下山去海边，等去冰火岛的船', dev: 10, fx: (g) => { g.remember('zw_sl_left', 'sea'); g.move('road'); g.info('门派', '少林俗家弟子'); g.stat('武学', 10); },
              res: '你在海边等了两年船，一边替渔民看病。没有一条船肯去北海。' },
            { t: '去武当山看太师父', dev: 10, fx: (g) => { g.remember('zw_sl_left', 'wudang'); g.move('wudang'); g.info('门派', '少林俗家弟子'); g.rel('太师父', 'zhangsanfeng'); g.stat('武学', 10); },
              res: '太师父看见你的光头，愣了一下，然后笑出了眼泪。他每天教你一招太极拳，不问你学了少林什么。' },
          ] },
        /* 原著一支 */
        { id: 'zw_hanshui', age: 11, t: '汉水', loc: 'hanshui', cond: zwMain,
          text: '汉水上，蒙古兵追杀一个叫常遇春的明教汉子。一个船家老汉中箭死了，他的女儿一边哭，一边一口一口喂你吃饭。她叫周芷若。',
          choices: [
            { t: '记住她的名字', canon: true, fx: (g) => { g.rel('故人', 'zhouzhiruo'); g.stat('情义', 4); }, res: '太师父把她送去了峨嵋。她回头看了你一眼。' },
            { t: '把娘留给你的一支发簪送给她', dev: 10, fx: (g) => { g.set('wujiHairpin'); g.rel('故人', 'zhouzhiruo', '戴着你送的发簪'); g.stat('情义', 6); }, res: '她把发簪攥在手里，没有哭。很多年后，她头上还插着它。' },
            { t: '对常遇春说，你要替她父亲报仇', dev: 10, fx: (g) => { g.set('wujiChangyuchun'); g.rel('故人', 'zhouzhiruo'); g.stat('正邪', 3); }, res: '常遇春拍着你的肩膀说：“好小子，这句话我记着。”他后来真的一直记着。' },
          ] },
        { id: 'zw_hudie', age: 12, t: '蝴蝶谷', loc: 'hudie', cond: zwMain,
          text: (g) => '常遇春带你去蝴蝶谷求见神医胡青牛。他外号“见死不救”，只救明教中人。' + (g.f('cuishanLives') ? '父亲在谷口等你，不肯进去。' : ''),
          choices: [
            { t: '不求他，自己翻他的医书', canon: true, fx: (g) => { g.stat('悟性', 10); g.stat('根骨', 6); g.rel('师父', 'huqingniu'); g.info('所长', '医术'); }, res: '胡青牛不救你，却由着你翻他的书。两年里，你把寒毒压住了三成，医术快赶上他了。' },
            { t: '替谷外来求医的人看病', dev: 15, fx: (g) => { g.remember('zw_doctor'); g.stat('悟性', 6); g.stat('声望', 6); g.rel('师父', 'huqingniu'); g.info('所长', '医术'); },
              res: '胡青牛见死不救，你就替他救。来求医的人都叫你“小神医”。这些人里，有好几个是明教的。' },
          ] },
        { id: 'zw_yinli', age: 12, t: '咬手', loc: 'hudie', auto: true, cond: zwMain,
          text: '谷里来了个小姑娘，脸上带着毒斑，要你跟她走。你不肯，她在你手背上狠狠咬了一口，牙印好多年都没消。她叫殷离，是你的表妹。',
          fx: (g) => g.rel('表妹', 'yinli') },
        { id: 'zw_jinhua', age: 13, t: '金花婆婆', loc: 'hudie', cond: zwMain,
          text: '金花婆婆找上门来，要杀胡青牛夫妇。峨嵋派的纪晓芙也死了，留下一个小女儿杨不悔，托你照顾。',
          choices: [
            { t: '带着小不悔逃走', canon: true, fx: (g) => { g.stat('情义', 6); g.rel('托付', '杨不悔'); }, res: '你答应纪姑姑，把小不悔送到昆仑山她父亲杨逍那里。身后的蝴蝶谷里，再没有人出来。' },
            { t: '留下来，跟金花婆婆讲她丈夫的病', dev: 20, check: ['悟性', 75], fx: (g) => { g.set('huqingniuLives'); g.stat('声望', 5); g.rel('托付', '杨不悔'); },
              res: '你说出她丈夫的病该怎么治。金花婆婆愣了很久，拄着拐杖走了。胡青牛拉着你的手，说欠你一条命。',
              fail: { fx: (g) => { g.stat('根骨', -8); g.rel('托付', '杨不悔'); }, res: '金花婆婆一杖把你打晕了。醒来时，蝴蝶谷里只剩你和小不悔两个活人。', dev: 3 } },
            { t: '用娘教的手法，一把银针打她的拐杖', dev: 20, cond: (g) => g.recall('zw_child') === 'darts', check: ['武学', 15], fx: (g) => { g.set('huqingniuLives'); g.stat('武学', 3); g.rel('托付', '杨不悔'); },
              res: '银针钉进了拐杖头。金花婆婆一愣，胡青牛夫妇已经从后山跑了。她骂了一声“殷家的手法”，没有追。',
              fail: { fx: (g) => { g.stat('根骨', -10); g.rel('托付', '杨不悔'); }, res: '针打偏了。她一杖扫过来，你飞出去很远。', dev: 3 } },
          ] },
        { id: 'zw_kunlun', age: 14, t: '万里送孤', loc: 'road', auto: true, cond: zwMain,
          text: (g) => '你背着杨不悔走了几千里，讨饭、躲狼、被人骗。' + (g.f('huqingniuLives') ? '胡青牛塞给你的药，一路上救了你们好几次。' : '') + '到了昆仑山，你把她交给了她爹杨逍。杨逍抱着女儿，看了你很久。',
          fx: (g) => { g.stat('情义', 6); g.stat('根骨', -3); g.unrel('托付'); } },
        { id: 'zw_zhuchangling', age: 15, t: '红梅山庄', loc: 'kunlun', cond: zwMain,
          text: '朱长龄收留了你，他的女儿朱九真对你很好。一天夜里，你听见朱长龄说，他养着你，是为了骗出谢逊的下落。',
          choices: [
            { t: '连夜逃走', canon: true, fx: (g) => { g.remember('zw_zcl', 'fled'); g.stat('心境', -5); }, res: '你跳下悬崖，落进一个与世隔绝的山谷。朱长龄追来，卡在了山洞里。' },
            { t: '将计就计，给他画一张假海图', dev: 25, check: ['悟性', 65], fx: (g) => { g.kill('zhuchangling', '照着一张假海图出海，再也没有回来'); g.stat('正邪', -3); },
              res: '朱长龄带人出海了，再也没有回来。你独自往西走，在雪地里滑了一跤，也掉进了那个山谷。',
              fail: { fx: (g) => { g.remember('zw_zcl', 'fled'); g.stat('根骨', -5); }, res: '他看穿了你。你逃到崖边，跳了下去。', dev: 3 } },
          ] },
        { id: 'zw_jiuyang', age: 15, t: '白猿', loc: 'kunlun', cond: zwMain,
          text: (g) => '山谷里有一只白猿，肚子上长着一个大疮。你替它开刀，从疮里取出一个油布包。里面是四本经书，《九阳真经》。' + (g.recall('zw_verses') ? '第一页上的几句，你在少林听和尚念过。' : ''),
          choices: [
            { t: '照着练', canon: true, fx: (g) => { g.stat('武学', 40); g.stat('根骨', 45); g.stat('悟性', 4); g.info('武学', '九阳神功'); },
              res: '五年后，寒毒尽去。你的内力，天下已经很少有人比得上。' },
            { t: '经书是少林的，等出去了还给他们', dev: 30, fx: (g) => { g.set('wujiNoJiuyang'); g.stat('正邪', 10); g.stat('根骨', 15); g.stat('武学', 12); },
              res: '你只看了第一页就合上了。你在谷里种菜、钓鱼，寒毒还在，人却越来越静。少林欠了你一个人情，只是他们还不知道。' },
            { t: '把经书背熟，然后烧掉', dev: 20, fx: (g) => { g.set('jiuyangBurned'); g.stat('根骨', 45); g.stat('武学', 38); g.stat('正邪', 3); g.info('武学', '九阳神功'); },
              res: '你说，经书留着，总有一天会让人抢破头。你练成了，世上再没有这四本《九阳真经》。' },
          ] },
        { id: 'zw_out', age: 20, t: '出谷', loc: 'road', auto: true, cond: zwMain,
          text: (g) => {
            let t = '你在谷里待了五年。';
            if (g.alive('zhuchangling')) t += (g.recall('zw_zcl') === 'fled' ? '你跳崖那天追来的朱长龄，还卡在洞口。' : '从山洞钻出去时，朱长龄还卡在洞口。') + '他扑过来抓你，两个人一起滚下了山崖。他摔死了，你没有。';
            if (g.f('wujiNoJiuyang')) t += '你先去了一趟少林，把油布包放在山门口，没留名字。';
            return t;
          },
          fx: (g) => { if (g.alive('zhuchangling')) g.kill('zhuchangling', '从昆仑山崖上摔下而死', true); } },
        /* 三支在光明顶会合 */
        { id: 'zw_guangming', age: 20, t: '光明顶', loc: 'guangming',
          text: (g) => {
            let t = g.f('wujiStayIsland') ? '你从冰火岛回来不到一年，就赶上了六大派围攻光明顶。' : g.f('wujiShaolin') ? '你是少林俗家弟子，认得围攻光明顶的每一个少林和尚。' : '';
            t += '明教高手死伤殆尽。灭绝师太手持倚天剑，要把剩下的人斩尽杀绝。你站了出来，说你叫曾阿牛。';
            if (g.f('huqingniuLives')) t += '人堆里，胡青牛正替明教的人裹伤，抬头看见了你。';
            if (g.f('wujiNoJiuyang')) t += '你没练过九阳神功，手心全是汗。';
            return t;
          },
          choices: [
            { t: '一个人挡下六大派', canon: true, check: ['武学', 55], fx: (g) => { g.info('门派', '明教'); g.info('身份', '明教教主'); g.stat('声望', 40); g.rel('属下', 'yangxiao'); },
              res: (g) => '你接下了少林的掌、武当的剑、昆仑的刀。' + (g.f('wujiHairpin') ? '周芷若那一剑刺来时，你看见她头上的发簪，剑尖偏了一寸。' : zwMain(g) ? '周芷若那一剑刺进你胸口时，你没有躲。' : '一个峨嵋女弟子奉师命刺了你一剑，剑尖发抖。后来你才知道她叫周芷若。') + '后来，明教上下跪了一地，拜你为教主。',
              fail: { fx: (g) => { g.set('mingjiaoCrushed'); g.stat('根骨', -20); }, res: '你挡住了三派，挡不住六派。明教几乎被灭了门。', dev: 3 } },
            { t: '这是他们的恩怨，不管', dev: 30, fx: (g) => { g.set('mingjiaoCrushed'); g.stat('心境', -10); }, res: '你转身下山。那一夜，光明顶的火烧了三天。明教从此没有教主。' },
            { t: '先替殷天正、杨逍他们疗伤，再出手', dev: 15, cond: (g) => !!g.recall('zw_doctor'), fx: (g) => { g.info('门派', '明教'); g.info('身份', '明教教主'); g.stat('声望', 35); g.rel('属下', 'yangxiao'); g.remember('zw_gm_healed'); },
              res: '有人认出你是蝴蝶谷的小神医。明教的人一个个站了起来，六大派不战而退。被你救活的人，后来都跟着你。' },
            { t: '当众说出圆真和玄冥二老的勾当', dev: 25, cond: (g) => g.f('wujiKnowsYuanzhen'), fx: (g) => { g.set('chengkunExposed'); g.info('门派', '明教'); g.info('身份', '明教教主'); g.stat('声望', 30); g.rel('属下', 'yangxiao'); },
              res: '少林的和尚都认得你。空闻方丈当场把圆真押回了少林。六大派各自收兵，明教拜你为教主。' },
          ] },
        { id: 'zw_wudang', age: 21, t: '太极', loc: 'wudang',
          text: (g) => (g.f('mingjiaoCrushed') ? '你回到武当，' : '') + '有人趁武当空虚，要上山杀太师父。你扮成小道童，挡在了真武大殿门口。' + (g.f('cuishanLives') ? '父亲站在你身后，手里握着判官笔。' : ''),
          choices: [
            { t: '请太师父现教你太极剑', canon: true, fx: (g) => { g.stat('武学', 8); g.info('武学', '太极剑'); },
              res: (g) => '太师父当着敌人的面教你太极剑，问你还记得几招。你说全忘了。他说，好。' + (g.recall('zw_child') === 'brush' || g.recall('zw_sl_left') === 'wudang' ? '这一套剑，你学得比谁都快。' : '') },
            { t: '请俞岱岩师伯认一认来人', dev: 15, check: ['悟性', 55], fx: (g) => { g.set('yuDaiyanAvenged'); g.stat('声望', 8); },
              res: '俞师伯一眼认出，二十年前折断他四肢的大力金刚指，就是来人里那个叫阿三的。你当着他的面废了那双手。俞师伯一夜没睡。',
              fail: { fx: (g) => g.stat('心境', -3), res: '俞师伯躺了二十年，看不清来人的脸。', dev: 0 } },
            { t: '和父亲一起守山门', dev: 10, cond: (g) => g.f('cuishanLives'), fx: (g) => { g.party(['zhangcuishan']); g.remember('zw_father_gate'); g.stat('情义', 6); },
              res: '父亲的判官笔写的是“倚天屠龙”，你的掌法接着他的笔画走。父子两个，从午时守到天黑。' },
          ] },
        { id: 'zw_lvliu', age: 21, t: '绿柳山庄', loc: 'lvliu',
          text: '绿柳山庄，一个穿男装的蒙古姑娘请你喝茶。她叫赵敏。茶里有毒，脚下有机关。',
          choices: [
            { t: '跟她一起掉进地牢，挠她脚心逼出解药', canon: true, fx: (g) => { g.rel('冤家', 'zhaomin'); g.stat('心境', 5); }, res: '她笑得眼泪都出来了。你们从地牢里爬出来，谁也说不清是谁赢了。' },
            { t: '不喝那杯茶，起身就走', dev: 15, fx: (g) => { g.rel('冤家', 'zhaomin'); g.remember('zw_tea'); g.stat('悟性', 3); }, res: '你走到门口，她在背后说：“张教主，你会回来求我的。”' },
          ] },
        { id: 'zw_promise3', age: 21, t: '黑玉断续膏', loc: 'dadu',
          text: (g) => (g.recall('zw_tea') ? '你果然回来了。' : '') + '俞师伯躺了二十年，只有赵敏手里的黑玉断续膏能接上他的骨头。她说药可以给你，你得答应她三件事。' + (g.f('yuDaiyanAvenged') ? '她还说：“你废了我的阿三，这笔账也算在里头。”' : ''),
          choices: [
            { t: '答应', canon: true, fx: (g) => { g.info('心事', '答应过赵敏三件事'); g.stat('情义', 3); }, res: '她没说是哪三件事。你拿着药走了很远，才想起来该问一句。' },
            { t: '只答应一件，不许违背侠义', dev: 10, check: ['情义', 70], fx: (g) => { g.remember('zw_three', 1); g.info('心事', '答应过赵敏一件事'); },
              res: '她想了很久，说：“一件就一件。”你后来才知道，她本来就只想要一件。',
              fail: { fx: (g) => g.info('心事', '答应过赵敏三件事'), res: '她说：“三件，少一件都不行。”你还是答应了。', dev: 0 } },
            { t: '不答应，夜里去王府偷药', dev: 25, check: ['悟性', 70], fx: (g) => { g.set('wujiNoThreePromises'); g.stat('正邪', -3); g.stat('声望', 4); },
              res: '你偷到了药。第二天，她派人送来一张字条：“药是我故意放在那里的。你不欠我什么。”这句话比三件事还难还。',
              fail: { fx: (g) => { g.stat('根骨', -10); g.info('心事', '答应过赵敏三件事'); }, res: '你中了她的机关，被吊在梁上。她笑着说：“现在是四件了，算你三件。”', dev: 3 } },
          ] },
        { id: 'zw_wanan', age: 21, t: '万安寺', loc: 'dadu', cond: (g) => !g.f('noWanan'),
          text: (g) => '六大派的高手被关在大都万安寺的塔上，每天被斩断一根手指。你带人放火救人。' + (g.f('yuDaiyanAvenged') ? '塔下守门的阿三，双手还吊在胸前。' : '') + '灭绝师太不肯让魔教的人救，站上了塔顶的栏杆。',
          choices: [
            { t: '先救其他人', canon: true, fx: (g) => g.stat('声望', 10), res: '灭绝师太跳了下去。你救出了其余的人。' },
            { t: '先去接住灭绝师太', dev: 25, check: ['武学', 70], fx: (g) => { g.set('miejueLives'); g.stat('声望', 12); }, res: '你接住了她。她骂了你一路，却再没说要死。峨嵋的掌门，还是她。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你扑了个空。塔下，周芷若跪着哭。', dev: 3 } },
            { t: '先去找赵敏要解药', dev: 15, check: ['情义', 60], fx: (g) => { g.remember('zw_antidote'); g.stat('声望', 12); }, res: '她把解药扔给你：“你欠我一次。”六大派的人自己运功冲出了塔。灭绝师太还是跳了。',
              fail: { fx: (g) => g.stat('根骨', -6), res: '你没找到她。火越烧越大，你只救下了一半人。', dev: 3 } },
          ] },
        { id: 'zw_lingshe', age: 21, t: '灵蛇岛', loc: 'lingshe',
          text: (g) => {
            let t;
            if (g.f('xiexunBackEarly')) t = '义父跟着你回了中原，又跟着你上了灵蛇岛。';
            else if (g.f('wujiPromise')) t = '你记着小时候的约定，在灵蛇岛上找到了义父。';
            else t = '你在灵蛇岛上找到了义父。';
            if (g.f('wujiToldIsland')) t += '他说，那些年冰火岛来过三条船，船上的人都死在他手里。他没问是谁说出去的。';
            if (g.recall('zw_island') === 'left') t += '他摸着你的脸，说：“你走那天，我醒着。”';
            if (g.f('bosiFoundEarly')) t += '波斯明教的人早就打听到了这里。';
            if (!zwMain(g)) t += '岛上还有金花婆婆的徒弟殷离，你第一次见她。她是你舅舅的女儿，你的表妹。';
            return t + '波斯明教的人要抓他回去。小昭是波斯圣女的女儿，她说她愿意去波斯做教主，换你们平安。';
          },
          choices: [
            { t: '让她走', canon: true, fx: (g) => { g.stat('心境', -8); g.rel('义父', 'xiexun'); }, res: '小昭的船走远了。她一直站在船尾，没有回头。' },
            { t: '跟波斯三使动手，不让她走', dev: 25, check: ['武学', 80], fx: (g) => { g.set('xiaozhaoStayed'); g.stat('声望', 6); g.rel('义父', 'xiexun'); },
              res: '你打退了波斯三使。小昭留了下来，从此在你身边端茶倒水，一句也不提波斯。',
              fail: { fx: (g) => { g.stat('根骨', -8); g.rel('义父', 'xiexun'); }, res: '三使联手的阵法你破不了。小昭还是上了船。', dev: 3 } },
          ] },
        { id: 'zw_frame', age: 21, t: '刀剑失踪', loc: 'lingshe',
          text: (g) => '一天早上醒来，倚天剑和屠龙刀都不见了，殷离满脸是血，赵敏不知去向。所有人都说，是赵敏干的。' + (g.recall('zw_antidote') ? '你想起万安寺里，她扔给你的那瓶解药。' : ''),
          choices: [
            { t: '信了，发誓要找赵敏问个明白', canon: true, fx: (g) => { g.stat('心境', -10); g.rel('冤家', 'zhaomin', '你以为她害了殷离'); }, res: '周芷若靠在你肩上哭。你没有看见她的手在发抖。' },
            { t: '不信', dev: 20, check: ['悟性', 70], fx: (g) => { g.set('wujiSawThrough'); g.stat('悟性', 4); }, res: '你说：“赵姑娘要杀殷离，不必等到今天。”周芷若低下了头。',
              fail: { fx: (g) => g.stat('心境', -6), res: '你想不通，只好先带着义父回中原。', dev: 3 } },
            { t: '说出那一夜你听见的脚步声', dev: 20, cond: (g) => g.recall('zw_child') === 'ear', fx: (g) => { g.set('wujiSawThrough'); g.stat('悟性', 3); },
              res: '那夜有人赤着脚走过你身边，步子很轻，是练过峨嵋轻功的人。你没说是谁，周芷若的脸却白了。' },
            { t: '先救殷离，别的以后再说', dev: 10, fx: (g) => { g.set('yinliHealed'); g.stat('情义', 6); }, res: (g) => '你替殷离敷了三个月药，她脸上的疤淡得快看不见了。' + (zwMain(g) ? '她醒过来，第一句话问的是那个小时候被她咬过的人。她不知道，那个人就是你。' : '她醒过来，拉着你的袖子叫你“阿牛哥”。你是她在岛上唯一信得过的人。') },
          ] },
        { id: 'zw_confront', age: 22, t: '心里的刺', loc: 'haozhou', cond: (g) => g.f('wujiSawThrough') && !g.f('zhouMarried') && !g.f('zhouExposed'),
          text: '义父做主，要你娶周芷若，婚期定在下个月。灵蛇岛那一夜，像一根刺扎在你心里。',
          choices: [
            { t: '当面问周芷若那一夜的事', dev: 25, check: ['情义', 60], fx: (g) => { g.set('zhouExposed'); g.stat('心境', -10); },
              res: '她哭着认了。刀剑、殷离的脸、十香软筋散，都是她。婚事没有人再提。你走的时候，她没有拦你。',
              fail: { fx: (g) => g.remember('zw_doubt'), res: '你刚开口，她就哭了。你说不下去，婚期照旧。', dev: 3 } },
            { t: '不问，照旧成亲', dev: 0, fx: (g) => { g.remember('zw_doubt'); g.stat('心境', -5); }, res: '你对自己说，是你多心了。' },
          ] },
        { id: 'zw_wedding', age: 22, t: '濠州', loc: 'haozhou', cond: (g) => !g.f('zhouMarried') && !g.f('zhouExposed'),
          text: (g) => (g.recall('zw_doubt') ? '你心里存着疑，还是和周芷若拜了堂。' : '你和周芷若在濠州成亲。') + (g.f('wujiHairpin') ? '她凤冠底下插着你送的那支发簪。' : '') + '拜堂拜到一半，赵敏闯进来，手里拿着义父的一缕金发。',
          choices: [
            { t: '跟赵敏走', canon: true, fx: (g) => { g.party(['zhaomin']); g.rel('冤家', 'zhaomin', '你跟着她出了喜堂'); }, res: '你抛下满堂宾客。身后，周芷若扯下了凤冠。' },
            { t: '继续拜堂', dev: 40, fx: (g) => { g.set('zhouMarried'); g.rel('妻子', 'zhouzhiruo'); g.party(['zhouzhiruo']); g.stat('心境', -6); },
              res: '赵敏站在门口看了很久，转身走了。义父的下落，你后来自己找到了。' },
          ] },
        { id: 'zw_tushi', age: 22, t: '屠狮大会', loc: 'shaolin',
          text: (g) => (g.f('chengkunExposed') ? '圆真早被关在少林后山。可义父也被少林三位老僧关着，天下英雄都来看他怎么死。' : '少林屠狮大会。义父被关在少林后山，三个老僧坐在三棵松树下守着。成昆就藏在少林寺里，法名圆真。') + (g.f('xiexunKnowsShaolin') ? '义父早就知道成昆在少林，他是自己走进来的。' : ''),
          choices: [
            { t: '用九阳神功破金刚伏魔圈', canon: true, check: ['武学', 70], fx: (g) => g.stat('声望', 20),
              res: '你救出了义父。他当着天下人的面废了成昆的武功，然后跪下拜了少林渡厄为师。',
              fail: { fx: (g) => { g.stat('根骨', -12); g.stat('声望', 5); }, res: '你被三条长索困了一夜，伤得不轻。天亮时，义父自己从地牢里走了出来。', dev: 3 } },
            { t: '劝义父放下仇恨', dev: 20, check: ['情义', 80], fx: (g) => { g.set('xiexunForgave'); g.stat('正邪', 8); },
              res: '义父说：“孩子，我知道了。”他把成昆交给了少林，没有动手。',
              fail: { fx: (g) => g.stat('心境', -3), res: '义父说：“三十年了，你让我放下？”他还是动了手。', dev: 3 } },
            { t: '当众揭穿圆真就是成昆', dev: 15, cond: (g) => !g.f('chengkunExposed'), check: ['声望', 60], fx: (g) => { g.set('chengkunExposed'); g.stat('声望', 15); },
              res: '你当着天下英雄说出圆真做过的事。空闻方丈脸色铁青，亲手拿下了他。',
              fail: { fx: (g) => g.stat('心境', -4), res: '没人信你。圆真笑着念了一声佛号。', dev: 3 } },
            { t: '请空闻方丈放人', dev: 20, cond: (g) => g.f('wujiNoJiuyang'), fx: (g) => { g.rel('义父', 'xiexun', '在少林出家'); g.stat('声望', 12); },
              res: '空闻方丈认出你，是五年前把《九阳真经》送回山门的那个人。他亲手打开了地牢，说少林不该欠你。' },
          ] },
        { id: 'zw_xiaozhao_letter', age: 23, t: '波斯来信', cond: (g) => !g.f('xiaozhaoStayed'),
          text: '一条波斯商船带来一封信，是小昭写的。信里只有一句话：“公子，你好吗？”',
          choices: [
            { t: '回信：“很好。”', canon: true, fx: (g) => { g.rel('远方', 'xiaozhao'); g.stat('情义', 3); }, res: '你写了很久，最后只写了两个字。' },
            { t: '搭那条商船，去波斯看她一次', dev: 25, fx: (g) => { g.set('wujiVisitedPersia'); g.move('westlands'); g.rel('远方', 'xiaozhao'); g.stat('心境', 6); },
              res: '你在路上走了半年。她穿着教主的袍子见你，说话还是“公子”。你住了三天就走了，她没有留。' },
          ] },
        { id: 'zw_zhu', age: 24, t: '让位', loc: 'haozhou', cond: (g) => !g.f('mingjiaoCrushed'),
          text: '朱元璋派人送来一封信，说是部下作乱，请教主定夺。你看出来了，他想要你走。',
          choices: [
            { t: '让出教主之位，归隐', canon: true, fx: (g) => { g.stat('心境', 20); g.info('身份', '归隐之人'); g.move(g.f('zhouMarried') ? 'emei' : 'hut'); },
              res: (g) => (g.f('zhouMarried') ? '你和周芷若回了峨嵋山下。' : '杨逍接任了教主。你去了塞外。') },
            { t: '留下来，和朱元璋争', dev: 40, check: ['悟性', 75], fx: (g) => { g.set('mingjiaoKept'); g.stat('声望', 15); g.move('guangming'); },
              res: '你留了下来。天下还是姓朱，可明教没有散。',
              fail: { fx: (g) => { g.stat('心境', -20); g.move('hut'); g.info('身份', '归隐之人'); }, res: '朱元璋设计害死了你身边的几个兄弟。你还是走了。', dev: 5 } },
            { t: '请常遇春当着众兄弟说句公道话', dev: 30, cond: (g) => g.f('wujiChangyuchun') && g.alive('changyuchun'), fx: (g) => { g.set('mingjiaoKept'); g.stat('声望', 10); g.move('guangming'); },
              res: '常遇春站起来说：“汉水上那个孩子说要替人报仇，他做到了。”朱元璋低下了头。明教没有散。' },
          ] },
        { id: 'zw_huamei', age: 25, t: '第三件事', cond: (g) => !g.f('zhouMarried') && !g.f('zhaominHome') && g.alive('zhaomin'),
          text: (g) => (g.f('wujiNoThreePromises') ? '你没欠赵敏什么。可她坐在镜子前，还是把眉笔递给了你。' : g.recall('zw_three') === 1 ? '你只答应过赵敏一件事。她坐在镜子前，把眉笔递给你，说就是这一件。' : '赵敏说，你答应过她三件事，前两件已经做了。她坐在镜子前，把眉笔递给你。'),
          choices: [
            { t: '替她画眉', canon: true, fx: (g) => { g.stat('心境', 25); g.rel('妻子', 'zhaomin'); g.party(['zhaomin']); }, res: '你画得一点也不好看。她说，以后每天都要画。' },
            { t: '画完眉，带她回冰火岛去住', dev: 20, fx: (g) => { g.stat('心境', 20); g.rel('妻子', 'zhaomin'); g.party(['zhaomin']); g.move('binghuo'); g.remember('zw_home', 'island'); },
              res: '你们在海上漂了三个月。她看见火山的时候说：“原来你是在这种地方长大的。”你们在那个石洞里住了下来。' },
          ] },
        { id: 'zw_married', age: 25, t: '峨嵋山下', loc: 'emei', cond: (g) => g.f('zhouMarried'),
          text: '你们在峨嵋山下住了下来。她还是峨嵋掌门，每天天不亮就上山，天黑才回来。',
          choices: [
            { t: '陪她守着峨嵋', dev: 0, fx: (g) => { g.info('身份', '峨嵋掌门的丈夫'); g.stat('心境', 4); }, res: '你在山门外开了一间药铺。峨嵋的弟子病了，都下山来找你。' },
            { t: '劝她把掌门之位传出去', dev: 15, check: ['情义', 70], fx: (g) => { g.set('zhouLeftEmei'); g.stat('心境', 10); },
              res: '她把铁指环交给了静玄师姐。那天晚上，她第一次睡到了天亮。',
              fail: { fx: (g) => g.stat('心境', -6), res: '她说：“师父的峨嵋，不能断在我手里。”你们很久没再提这件事。', dev: 3 } },
          ] },
        { id: 'zw_child', age: 28, t: '孩子', cond: (g) => !g.f('zhaominHome'),
          text: (g) => '你有了一个孩子。' + (g.recall('zw_home') === 'island' ? '他在冰火岛上长大，' : '') + '他三岁就会背医书，五岁就想学武功。',
          choices: [
            { t: '只教他医术', canon: true, fx: (g) => { g.stat('心境', 6); g.rel('儿子', '张家的孩子', '学医'); }, res: '你说，救人比打人难，也比打人好。' },
            { t: '教他九阳神功', dev: 10, cond: (g) => !g.f('wujiNoJiuyang'), fx: (g) => { g.set('wujiSonMartial'); g.rel('儿子', '张家的孩子', '练九阳神功'); }, res: '他学得很快。你看着他，想起义父背口诀的样子。' },
            { t: '送他上武当拜师', dev: 10, fx: (g) => { g.set('wujiSonWudang'); g.rel('儿子', '张家的孩子', '武当弟子'); }, res: '武当的师兄们教他太极。他每年回来一次，个子比你还高了。' },
          ] },
        { id: 'zw_ban', age: 32, t: '禁教',
          text: (g) => (g.f('mingjiaoKept') ? '朝廷下诏禁明教，派兵围了昆仑山。光明顶上的兄弟问你，打还是不打。' : g.f('mingjiaoCrushed') ? '朝廷下诏禁明教。光明顶上活下来的几个人，找到了你。' : '朝廷下诏禁明教。从前的兄弟逃到你隐居的地方，求你出山。'),
          choices: [
            { t: '不打，带兄弟们退到西域', canon: true, fx: (g) => { g.stat('心境', -6); g.move('westlands'); }, res: '明教的圣火，从此在西域烧。' },
            { t: '出山，为兄弟们讨个公道', dev: 25, check: ['声望', 70], fx: (g) => { g.set('mingjiaoPardoned'); g.stat('声望', 10); g.stat('根骨', -8); },
              res: '你一个人上了金陵城头。朱元璋终于松口，放了被抓的明教弟子。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -10); }, res: '朝廷的兵太多了。你救出了一半人，自己也受了伤。', dev: 5 } },
            { t: '把兄弟们藏进深山，教他们种药行医', dev: 15, fx: (g) => { g.set('mingjiaoHerbalists'); g.stat('情义', 5); },
              res: (g) => (g.recall('zw_gm_healed') ? '光明顶上被你救活的那些人，如今跟着你学认药。' : '') + '你们在深山里开了一片药田。十年后，没人记得他们是明教的了。' },
          ] },
        { id: 'zw_sanfeng_end', age: 39, t: '太师父', cond: (g) => !g.alive('zhangsanfeng'), auto: true,
          text: (g) => '太师父羽化了。你上武当山磕了三个头。' + (g.f('sanfengGotNeedle') ? '他枕头底下压着一枚生锈的金针，没人知道是谁送的。' : '') + '他留给你一句话：“无忌，你做得很好。”' },
        { id: 'zw_disciple', age: 45, t: '求学的少年',
          text: (g) => '一个少年找到你，跪在门口三天，说要学九阳神功，替全家报仇。' + (g.f('jiuyangBurned') ? '你想，世上的九阳真经只剩你脑子里这一部了。' : '') + (g.f('mingjiaoHerbalists') ? '药田里的老兄弟都劝你收下他。' : ''),
          choices: [
            { t: '教他医术，不教武功', canon: true, fx: (g) => { g.stat('心境', 4); g.rel('徒弟', '求学的少年', '学医'); }, res: '他恨了你很多年。后来他成了一个好大夫，又回来给你磕了一个头。' },
            { t: '教他武功', dev: 10, fx: (g) => { g.remember('zw_avenger'); g.rel('徒弟', '求学的少年', '学武'); g.stat('正邪', -3); }, res: '他学成下山那天，没有回头。' },
          ] },
        { id: 'zw_old', age: 60, t: '老了',
          text: (g) => {
            let t = g.f('zhouMarried') ? '周芷若的头发白了。' : g.f('zhaominHome') ? '你一个人在海外住了很多年。' : '你的手开始抖了，眉笔拿不稳。赵敏把笔接过去，说：“换我给你画。”';
            if (g.recall('zw_avenger')) t += '你听说那个学了你武功的少年报了仇，然后又被人报了仇。';
            if (g.f('wujiVisitedPersia')) t += '波斯那边，很久没有来信了。';
            if (g.f('wujiSonMartial') || g.f('wujiSonWudang')) t += '儿子在江湖上有了名字，人家叫他小张大侠。';
            if (g.recall('zw_father_gate')) t += '你常想起和父亲守山门的那一天。';
            if (g.f('wujiPromise') && !g.f('xiexunBackEarly')) t += '你记得，十岁那年答应过义父的事，晚了好几年才做到。';
            return t;
          },
          choices: [
            { t: '“这辈子，不后悔。”', canon: true, fx: (g) => g.stat('心境', 8), res: '这是真话。' },
            { t: '回冰火岛看一眼', dev: 10, fx: (g) => { g.move('binghuo'); g.stat('心境', 6); }, res: '火山还在冒烟。你在那个石洞里住了一个冬天，没有再回中原。' },
            { t: '把一辈子的医方写成一本书', dev: 10, fx: (g) => { g.set('wujiMedicalBook'); g.stat('悟性', 3); }, res: '你写了三年。书里一个字也没提武功。' },
          ] },
      ],
    },
  };

  /* ---------- 赵敏 ---------- */
  const zhaomin = {
    id: 'zhaomin', name: '赵敏', py: 'MINMIN<<TEMUR', book: B, sex: '女', born: 116,
    origin: '汝阳王之女，绍敏郡主',
    birthplace: '大都汝阳王府', home: 'dadu', bg: 5,
    info: { 门派: '无', 身份: '绍敏郡主' },
    look: { hair: 'bun', hairColor: '#17110d', robe: '#8a3b4a', accent: '#e0c068' },
    family: [{ rel: '父亲', id: 'ruyangwang' }, { rel: '哥哥', id: 'wangbaobao' }],
    fateText: '汝阳王之女，聪明绝顶。设计擒住六大派，却爱上了明教教主张无忌。为他背弃家国，最后要他替自己画一辈子的眉。',
    st: [65, 88, 75, 60, 10, 30, 0],
    death: (g) => (g.f('zhaominHome') ? { y: 180, cause: '在漠北病逝', mod: true }
      : g.f('zhouMarried') ? { y: 182, cause: '终身未嫁，病逝于塞外', mod: true }
      : { y: 186, cause: '与张无忌在塞外终老' }),
    ms: [[116, '生于大都汝阳王府'], [128, '跟着哥哥王保保学骑射'], [133, '奉父命收服中原武林'], [135, '在绿柳山庄设局', (g) => !g.f('noWanan')],
      [136, '闯进濠州喜堂', (g) => !g.f('zhouMarried')], [137, '与父兄决裂，跟张无忌走', (g) => !g.f('zhaominHome') && !g.f('zhouMarried')],
      [137, '回到了父兄身边', (g) => g.f('zhaominHome')], [139, '张无忌每天替她画眉', (g) => !g.f('zhaominHome') && !g.f('zhouMarried')],
      [137, '心里藏着周芷若告诉她的一件事', (g) => g.f('zhouToldZhaomin')], [150, '收到周芷若一封信，只有一句“当年对不住”', (g) => g.f('zhouApologized')],
      [150, '每年秋天，周芷若都来塞外坐一坐', (g) => g.f('zhaoZhouReconciled')]],
    arc: {
      focus: '读书参悟',
      intro: '你生在大都的汝阳王府。父亲是元朝的汝阳王，手握天下兵马；哥哥库库特穆尔，汉名王保保。你的蒙古名字叫敏敏特穆尔，皇帝封你为绍敏郡主。',
      lastWords: '我这一生，只做过一件不聪明的事。我不后悔。',
      nodes: [
        { id: 'zm_birth', age: 0, t: '郡主', loc: 'dadu', auto: true,
          text: '你出生那天，王府摆了三天宴。父亲抱着你说：“这个女儿，将来比儿子还强。”',
          fx: (g) => g.party(['ruyangwang']) },
        { id: 'zm_brother', age: 4, t: '哥哥', auto: true,
          text: '哥哥王保保比你大六岁，走到哪都背着你。他教你说的第一句汉话是“我不怕”。',
          fx: (g) => g.stat('情义', 4) },
        { id: 'zm_choose', age: 6, t: '马与书', loc: 'grassland',
          text: '哥哥带你去草原上骑马，府里的汉人先生在家等着教你读书。父亲说，你只能选一样先学。',
          choices: [
            { t: '先读书', canon: true, fx: (g) => { g.stat('悟性', 6); g.info('所长', '兵法'); }, res: '你读的第一本书是《孙子兵法》。先生说，郡主看书不像女孩子，像将军。' },
            { t: '先骑马', dev: 5, fx: (g) => { g.stat('根骨', 5); g.stat('武学', 3); g.remember('zm_rider'); g.info('所长', '骑射'); }, res: '你摔了三次，第四次骑得比哥哥还快。哥哥把他的小红马送给了你。' },
          ] },
        { id: 'zm_teacher', age: 9, t: '汉人先生', loc: 'dadu',
          text: '先生讲到一句：“得人心者得天下。”他说，蒙古人得了天下，没得人心。',
          choices: [
            { t: '记在心里，不告诉父亲', canon: true, fx: (g) => { g.stat('悟性', 5); g.remember('zm_teacher', 'kept'); }, res: '这句话你后来想了很多年。' },
            { t: '告诉父亲，先生说了不该说的话', dev: 10, fx: (g) => { g.stat('正邪', -6); g.remember('zm_teacher', 'told'); }, res: '先生被赶出了王府。他走的时候没有回头。' },
            { t: '求父亲减免王府佃户的租子', dev: 15, fx: (g) => { g.stat('正邪', 6); g.stat('声望', 2); g.remember('zm_teacher', 'rent'); }, res: '父亲笑着答应了，说女儿心善。第二年，王府的佃户少逃了一半。他们记得是郡主开的口。' },
          ] },
        { id: 'zm_xuanming', age: 12, t: '玄冥二老', auto: true,
          text: (g) => '父亲身边有两个老头，一个拿鹿杖，一个拿鹤笔，人称玄冥二老。' + (g.f('xuanmingScarred') ? '鹿杖客脸上有一道疤，说是早年在路上被一个无名小辈打的，不许人提。' : '') + '他们教了你几手，说郡主学得比徒弟还快。',
          fx: (g) => { g.stat('武学', 8); } },
        { id: 'zm_disguise', age: 14, t: '男装', loc: 'dadu',
          text: '你喜欢穿男装，扮成汉人公子溜出王府逛大都城。这一次，你在街上看见蒙古兵在打一个汉人老头。',
          choices: [
            { t: '亮出郡主的腰牌，喝退他们', canon: true, fx: (g) => { g.stat('正邪', 5); g.remember('zm_street', 'badge'); }, res: '兵丁们跪了一地。老头不敢谢你，一瘸一拐地走了。' },
            { t: '装作没看见', dev: 10, fx: (g) => { g.stat('正邪', -5); g.remember('zm_street', 'away'); }, res: '回府的路上，你一直在想那个老头的眼神。' },
            { t: '记下兵丁的腰牌，回去告诉哥哥', dev: 10, fx: (g) => { g.stat('情义', 3); g.remember('zm_street', 'brother'); }, res: '第二天，那几个兵挨了二十军棍。哥哥说你管得太宽，可还是替你管了。' },
          ] },
        { id: 'zm_wanyuan', age: 15, t: '养才', loc: 'dadu', auto: true,
          text: '父亲养了一大批西域番僧、中原败类，都听你调遣。你给每个人建了一本册子，写着他们的武功、弱点和想要的东西。',
          fx: (g) => { g.stat('悟性', 4); g.stat('声望', 6); } },
        { id: 'zm_mission', age: 17, t: '父命', loc: 'dadu',
          text: (g) => '父亲要你替朝廷收服中原武林。六大派正围攻光明顶，元气大伤，正是时候。' + (g.recall('zm_teacher') === 'kept' ? '你想起先生那句“得人心者得天下”。' : g.recall('zm_street') === 'away' ? '你想起大都街上那个老头的眼神。' : ''),
          choices: [
            { t: '想一个一网打尽的法子', canon: true, fx: (g) => { g.stat('声望', 15); g.stat('正邪', -10); g.info('身份', '统领江湖的郡主'); }, res: '你想到了西域的十香软筋散。' },
            { t: '劝父亲先别动武林，安抚民心', dev: 30, check: ['悟性', 80], fx: (g) => { g.set('noWanan'); g.stat('正邪', 10); }, res: '父亲听了你一半。六大派没有被关进万安寺，可也没有人领你的情。',
              fail: { fx: (g) => { g.stat('心境', -5); g.info('身份', '统领江湖的郡主'); }, res: '父亲说：“女孩子懂什么天下。”你还是去了。', dev: 3 } },
            { t: '亲自去光明顶山下，坐山观虎斗', dev: 20, check: ['悟性', 70], fx: (g) => { g.stat('声望', 12); g.info('身份', '统领江湖的郡主'); g.remember('zm_aniu'); },
              res: '你在山下看了三天，看见一个少年一个人挡下了六大派。你在册子上写下“曾阿牛”三个字，又划掉了，改成“张无忌”。',
              fail: { fx: (g) => { g.stat('声望', 5); g.info('身份', '统领江湖的郡主'); }, res: '你去晚了，只看见六大派收兵下山。', dev: 3 } },
          ] },
        { id: 'zm_wudang', age: 19, t: '武当山', loc: 'wudang', cond: (g) => !g.f('noWanan') && g.alive('zhangwuji'),
          text: (g) => '你派人上武当山，想趁张三丰闭关拿下武当。一个丑小道童挡在门口，用的是刚学的太极剑。' + (g.recall('zm_aniu') ? '你认出来了，是光明顶上那个曾阿牛。' : ''),
          choices: [
            { t: '撤', canon: true, fx: (g) => { g.stat('悟性', 3); g.remember('zm_wudang', 'retreat'); }, res: '你记住了那个道童的眼睛。' },
            { t: '亲自出手试他', dev: 10, check: ['武学', 60], fx: (g) => { g.stat('武学', 3); g.remember('zm_wudang', 'duel'); }, res: '你输了。他却放你走了，还把你掉的珠花还给了你。',
              fail: { fx: (g) => { g.stat('根骨', -5); g.remember('zm_wudang', 'duel'); }, res: '你还没出手，就被他夺了剑。他把剑还给了你。', dev: 0 } },
            { t: '递一张名帖给他，约日后再见', dev: 10, fx: (g) => { g.stat('情义', 3); g.remember('zm_wudang', 'card'); }, res: '他接过名帖，念出了上面的字：“汝阳王府，赵敏。”' },
          ] },
        { id: 'zm_lvliu', age: 19, t: '绿柳山庄', loc: 'lvliu', cond: (g) => g.alive('zhangwuji'),
          text: (g) => {
            if (g.f('mingjiaoCrushed')) return '光明顶之后，明教散了。江湖上只有一个叫张无忌的年轻人，还在替明教的残部奔走。你在绿柳山庄请他喝茶。茶里有毒，脚下有机关。';
            if (g.f('noWanan')) return '你在绿柳山庄请明教教主张无忌喝茶。你只是想看看，让天下人都怕的魔教教主，到底长什么样。';
            const w = g.recall('zm_wudang');
            return (w === 'card' ? '他拿着你的名帖来了。' : w === 'duel' ? '武当山上放你走的那个人来了。' : '') + '你在绿柳山庄设下宴席，请明教新教主张无忌喝茶。茶里有毒，脚下有机关。';
          },
          choices: [
            { t: '把他关进地牢', canon: true, fx: (g) => { g.rel('冤家', 'zhangwuji'); g.stat('心境', 6); },
              res: '你也掉了下去。他挠你的脚心，逼你交出解药。你笑得喘不过气。后来你想起来，那是你长这么大第一次被人欺负。' },
            { t: '放他走', dev: 15, fx: (g) => { g.rel('冤家', 'zhangwuji'); g.remember('zm_lvliu', 'free'); }, res: '他走的时候回头看了你一眼。你在亭子里坐到天黑。' },
            { t: '把机关的图纸摊开给他看', dev: 20, fx: (g) => { g.rel('冤家', 'zhangwuji'); g.remember('zm_lvliu', 'plans'); g.stat('悟性', 2); }, res: '你说：“我不屑用这个对付你。”他看了半天，说你的机关做得真好。你觉得这比赢了还高兴。' },
          ] },
        { id: 'zm_wanan', age: 19, t: '万安寺', loc: 'dadu', cond: (g) => !g.f('noWanan'),
          text: (g) => '六大派的高手被你关在万安寺塔上，每天斩断一个人的手指，逼他们投降。' + (g.alive('zhangwuji') ? '张无忌带人来救了。' : '没有人来救他们。父亲问你，这些人怎么处置。'),
          choices: [
            { t: '暗中让开一条路', canon: true, fx: (g) => { g.stat('情义', 6); g.stat('正邪', 5); }, res: '哥哥气得砸了一屋子东西。父亲什么也没说。' },
            { t: '调兵死守', dev: 25, check: ['悟性', 70], fx: (g) => { g.set('zhaominFought'); g.stat('情义', -10); g.stat('声望', 6); }, res: (g) => (g.alive('zhangwuji') ? '张无忌救走了大半的人，明教折了好几个兄弟。他看你的眼神变了。' : '塔上的人一个也没走脱。父亲夸你，你却一夜没睡。'),
              fail: { fx: (g) => g.stat('心境', -5), res: '你调兵晚了一步。塔上的火烧红了半边天。', dev: 3 } },
            { t: '把解药偷偷送给灭绝师太', dev: 20, check: ['悟性', 65], fx: (g) => { g.set('miejueLives'); g.stat('正邪', 6); }, res: '灭绝师太认出了你，冷着脸吃了药。那一夜，她没有跳塔。峨嵋的掌门，还是她。',
              fail: { fx: (g) => g.stat('心境', -4), res: '她把解药扔下了塔。', dev: 3 } },
          ] },
        { id: 'zm_ring', age: 19, t: '珠花', loc: 'dadu', cond: (g) => g.alive('zhangwuji'),
          text: (g) => (g.f('zhaominFought') ? '张无忌又来了，眼里带着恨。他死了好几个兄弟，' : g.recall('zm_lvliu') === 'free' ? '你放过他一次，他又来了。' : '张无忌又来了。') + '这回是来求你给俞岱岩治伤的黑玉断续膏。你知道，你开什么条件他都会答应。',
          choices: [
            { t: '要他答应你三件事', canon: true, fx: (g) => { g.stat('心境', 5); g.remember('zm_ring', 'three'); }, res: '他答应了。你没说是哪三件事。' },
            { t: '什么条件都不要，把药给他', dev: 15, fx: (g) => { g.stat('情义', 8); g.remember('zm_ring', 'free'); }, res: '他愣在那里，比答应你一百件事还不知所措。' },
            { t: '要他娶你', dev: 20, check: ['情义', 65], fx: (g) => { g.stat('心境', 10); g.remember('zm_ring', 'marry'); }, res: '他的脸红得像煮熟的虾：“这……这得等我想清楚。”你说你等。',
              fail: { fx: (g) => { g.stat('心境', -4); g.remember('zm_ring', 'three'); }, res: '他愣住了：“赵姑娘，别开玩笑。”你只好改口，要他答应三件事。', dev: 3 } },
          ] },
        { id: 'zm_lingshe', age: 19, t: '灵蛇岛', loc: 'lingshe', cond: (g) => g.alive('zhangwuji'),
          text: '你跟张无忌、周芷若、殷离、谢逊同在灵蛇岛上。夜里你闻到一股异香，醒来时，刀剑不见了，殷离满脸是血，所有人都说是你干的。',
          choices: [
            { t: '回中原，一个人查清楚', canon: true, fx: (g) => { g.stat('悟性', 5); g.stat('心境', -6); g.move('road'); }, res: '你一路追到少林，查到了谢逊的下落，也查到了下毒的人。' },
            { t: '当着张无忌的面，问周芷若十香软筋散是谁下的', dev: 25, check: ['悟性', 75], fx: (g) => { g.set('zhouExposed'); g.stat('声望', 4); }, res: '她答不上来。张无忌看着她，很久没有说话。濠州的婚事，没有人再提。',
              fail: { fx: (g) => g.stat('心境', -10), res: '她哭了。张无忌护着她，让你走。', dev: 3 } },
            { t: '留下来照顾殷离，等她醒', dev: 15, check: ['情义', 55], fx: (g) => { g.remember('zm_yinli'); g.stat('情义', 4); }, res: '殷离醒过来，迷迷糊糊地说，下手的人手很软，指甲上有峨嵋的凤仙花汁。她说，你要她作证，她就作证。',
              fail: { fx: (g) => g.stat('心境', -6), res: '殷离一看见你就尖叫。你只好走了。', dev: 3 } },
          ] },
        { id: 'zm_exposed', age: 20, t: '雨里', loc: 'road', cond: (g) => g.f('zhouExposed') && !g.f('zhouMarried'),
          text: '周芷若在你住的客栈外跪了一夜，雨一直没停。她求你别把灵蛇岛的事传出去，峨嵋的名声，比她的命要紧。',
          choices: [
            { t: '放过她，这件事到此为止', dev: 10, fx: (g) => { g.set('zhouSpared'); g.stat('情义', 6); g.stat('正邪', 4); }, res: '你扶她起来，替她擦了脸上的雨。你说：“我也骗过人。”从此江湖上没人知道那一夜的事。' },
            { t: '把她交给峨嵋处置', dev: 20, fx: (g) => { g.set('zhouDisgraced'); g.stat('正邪', -4); g.stat('声望', 6); }, res: '峨嵋的长老们关起门商量了三天。周芷若交出了铁指环，一个人下了山。' },
          ] },
        { id: 'zm_haozhou', age: 20, t: '喜堂', loc: 'haozhou', cond: (g) => !g.f('zhouMarried') && !g.f('zhouExposed') && g.alive('zhangwuji'),
          text: (g) => (g.recall('zm_ring') === 'marry' ? '他说过要想清楚。他想清楚了，娶的是周芷若。' : '张无忌今天在濠州娶周芷若。') + '你手里有谢逊的一缕金发。',
          choices: [
            { t: '闯进喜堂', canon: true, fx: (g) => { g.stat('心境', 10); g.party(['zhangwuji']); g.rel('心上人', 'zhangwuji'); g.unrel('冤家'); }, res: '他跟你走了。周芷若在你身后扯碎了凤冠。' },
            { t: '不去', dev: 40, fx: (g) => { g.set('zhouMarried'); g.stat('心境', -40); }, res: '你在城外的山坡上，听了一夜的鼓乐。' },
            { t: '带殷离进喜堂作证', dev: 25, cond: (g) => !!g.recall('zm_yinli'), fx: (g) => { g.set('zhouExposed'); g.party(['zhangwuji']); g.rel('心上人', 'zhangwuji'); g.unrel('冤家'); },
              res: '殷离当着满堂宾客，说出了灵蛇岛那一夜。周芷若没有辩，自己摘下了凤冠。张无忌跟你走的时候，回头看了她很久。' },
          ] },
        { id: 'zm_tushi', age: 20, t: '屠狮大会', loc: 'shaolin', cond: (g) => !g.f('zhouMarried') && g.alive('zhangwuji'), auto: true,
          text: (g) => '少林屠狮大会上，你陪着张无忌救出了谢逊。' + (g.f('zhouDisgraced') ? '峨嵋的席位上，没有周芷若。' : '周芷若当着天下人的面夺了第一，看你的眼神像刀子。'),
          fx: (g) => g.stat('声望', 5) },
        { id: 'zm_family', age: 21, t: '家与他', loc: 'road', cond: (g) => !g.f('zhouMarried') && g.alive('zhangwuji'),
          text: (g) => '哥哥王保保带兵来接你回去。父亲托他带了一句话：“你回来，什么都不追究。”' + (g.recall('zm_street') === 'brother' ? '哥哥说，那年你让他打那几个兵的事，他还记着。' : ''),
          choices: [
            { t: '跟张无忌走', canon: true, fx: (g) => { g.stat('心境', 10); g.rel('夫君', 'zhangwuji'); g.unrel('心上人'); g.info('身份', '张无忌之妻'); g.party(['zhangwuji']); },
              res: '你对哥哥说，你已经不是绍敏郡主了。他拔刀砍断了自己的马鞭。' },
            { t: '回去', dev: 40, fx: (g) => { g.set('zhaominHome'); g.move('dadu'); g.stat('心境', -15); g.party(['wangbaobao']); },
              res: '你回到了王府。父亲老了很多。从那天起，你再也没有穿过男装。' },
            { t: '跟哥哥约定，三年后回王府看父亲', dev: 20, check: ['情义', 65], fx: (g) => { g.remember('zm_home3'); g.rel('夫君', 'zhangwuji'); g.unrel('心上人'); g.info('身份', '张无忌之妻'); g.party(['zhangwuji']); },
              res: '哥哥收了刀：“三年。”他走的时候，把自己的马留给了你。',
              fail: { fx: (g) => { g.stat('心境', -5); g.rel('夫君', 'zhangwuji'); g.unrel('心上人'); g.party(['zhangwuji']); }, res: '哥哥说：“走了，就别回来。”', dev: 3 } },
          ] },
        { id: 'zm_alone', age: 21, t: '一个人', loc: 'road', cond: (g) => g.f('zhouMarried') || !g.alive('zhangwuji'),
          text: (g) => (g.alive('zhangwuji') ? '张无忌娶了周芷若。' : '万安寺的事过去一年了。江湖上没有出现一个能让你看得上眼的对手。') + '哥哥派人来接你回家。',
          choices: [
            { t: '回家', dev: 20, fx: (g) => { g.set('zhaominHome'); g.move('dadu'); }, res: '父亲什么也没问。' },
            { t: '一个人去江南走走', dev: 20, fx: (g) => { g.stat('心境', 5); g.move('lintan'); g.remember('zm_alone', 'south'); }, res: '你在西湖边住了下来，再也没穿过郡主的衣服。' },
            { t: '一个人往西走', dev: 20, fx: (g) => { g.stat('心境', 4); g.move('westlands'); g.remember('zm_alone', 'west'); }, res: '你一直走到了天山。雪很大，你第一次觉得天下这么大。' },
          ] },
        { id: 'zm_huamei', age: 23, t: '第三件事', cond: (g) => !g.f('zhaominHome') && !g.f('zhouMarried') && g.alive('zhangwuji'),
          text: (g) => (g.recall('zm_ring') === 'free' ? '你当年什么条件都没要。现在你想要一样东西了。' : g.f('wujiNoThreePromises') ? '他从没答应过你什么。你还是想要一样东西。' : '张无忌答应过你三件事，前两件已经做了。第三件，你想了很久。'),
          choices: [
            { t: '每天给我画眉', canon: true, fx: (g) => { g.stat('心境', 25); g.move('hut'); }, res: '他画得一点也不好看。你说，以后每天都要画。' },
            { t: '跟朱元璋争天下', dev: 40, check: ['悟性', 80], fx: (g) => { g.set('mingjiaoKept'); g.stat('声望', 15); g.move('guangming'); }, res: '天下还是姓朱，可明教在你手里没有散。',
              fail: { fx: (g) => { g.stat('心境', -10); g.move('hut'); }, res: '朱元璋比你想的更狠。你们还是走了。', dev: 5 } },
            { t: '陪我回一趟大都', dev: 20, fx: (g) => { g.stat('心境', 10); g.remember('zm_visit'); g.move('hut'); }, res: '他陪你在王府门外站了一夜。父亲没有开门，第二天门口多了一匹你小时候骑的马。' },
          ] },
        { id: 'zm_child', age: 25, t: '女儿', cond: (g) => !g.f('zhaominHome') && !g.f('zhouMarried') && g.alive('zhangwuji') && !g.recall('zm_alone'),
          text: '你生了一个女儿。张无忌问你，给她取汉人名字还是蒙古名字。',
          choices: [
            { t: '取一个汉人名字', canon: true, fx: (g) => { g.stat('心境', 6); g.rel('女儿', '张念'); }, res: '你给她取名叫“念”。没说念的是谁。' },
            { t: '取一个蒙古名字', dev: 5, fx: (g) => { g.rel('女儿', '张家的女儿', '有一个蒙古名字'); g.remember('zm_daughter', 'mongol'); }, res: '她长大后骑马骑得很好，像你的哥哥。' },
            { t: '用哥哥名字里的一个字', dev: 10, fx: (g) => { g.rel('女儿', '张保儿'); g.remember('zm_daughter', 'brother'); }, res: '你写信告诉哥哥。他回信说，这是他这辈子收到最好的一封信。' },
          ] },
        { id: 'zm_father', age: 27, t: '父亲', cond: (g) => !g.alive('ruyangwang'), auto: true,
          text: (g) => '你听说父亲被一个降将刺死在军中。' + (g.f('zhaominHome') ? '你在他灵前跪了三天。' : g.recall('zm_home3') || g.recall('zm_visit') ? '你回去过一次。他没见你，可让人把你小时候的衣裳都留着。' : '你朝着北方磕了三个头。'),
          fx: (g) => g.stat('心境', -10) },
        { id: 'zm_ming', age: 28, t: '大都城破', auto: true,
          text: (g) => (g.f('zhaominHome') ? '明军攻进大都。你跟着哥哥退回了漠北，回头看了一眼城墙，什么也没说。' : '明军攻进大都，元顺帝北逃。你在塞外听到消息，一夜没睡。') + (g.recall('zm_teacher') === 'rent' ? '后来听说，王府的佃户把府里没逃出去的老人藏了起来，说是郡主当年对他们好。' : ''),
          fx: (g) => { if (g.f('zhaominHome')) g.move('grassland'); } },
        { id: 'zm_brother_letter', age: 30, t: '哥哥的信',
          text: (g) => '哥哥王保保在漠北收拾残兵，写信要你劝张无忌出兵相助，一起打回中原。' + (g.recall('zm_daughter') === 'brother' ? '信的末尾问，保儿会骑马了没有。' : '') + (g.recall('zm_rider') ? '他说，你小时候那匹小红马，他还养着。' : ''),
          choices: [
            { t: '回信拒绝', canon: true, fx: (g) => { g.stat('心境', -4); g.stat('正邪', 3); }, res: '你写道：“哥哥，天下不是我们的了。”' },
            { t: '回漠北看看哥哥', dev: 20, fx: (g) => { g.stat('情义', 8); g.move('grassland'); g.remember('zm_saw_brother'); }, res: '哥哥瘦了很多。你们在草原上骑了一天马，谁也没提打仗的事。' },
            { t: '派人给哥哥送去一车粮草，不提打仗', dev: 15, fx: (g) => { g.set('wangbaobaoSupplied'); g.stat('正邪', -2); }, res: '哥哥收下了粮草。回信只有一个字：“谢。”那年冬天，他的部下没有饿死一个。' },
          ] },
        { id: 'zm_zhou', age: 34, t: '故人', cond: (g) => g.alive('zhouzhiruo'),
          text: (g) => (g.f('zhouDisgraced') ? '周芷若来找你。她早不是峨嵋掌门了，在汉水上撑船，头发白了一半。' : g.f('zhouSpared') ? '周芷若来找你。她是峨嵋掌门了。你替她瞒下的事，她一直记着。' : '周芷若来找你。她是峨嵋掌门了，头发白了一半。'),
          choices: [
            { t: '请她喝茶', canon: true, fx: (g) => { g.stat('心境', 6); g.rel('故人', 'zhouzhiruo'); }, res: '你们说了一下午，谁也没提那个人的名字。' },
            { t: '不见', dev: 10, fx: (g) => { g.stat('心境', -3); g.remember('zm_snub'); }, res: '她在门口站了一会儿，留下一包峨嵋的茶叶。' },
            { t: '留她吃饭', dev: 15, check: ['情义', 60], fx: (g) => { g.set('zhaoZhouReconciled'); g.stat('心境', 5); g.rel('故人', 'zhouzhiruo'); },
              res: (g) => (g.alive('zhangwuji') ? '三个人坐在一张桌子上吃饭，谁也不说话。她走的时候笑了一下，说以后每年都来。' : '两个人吃了一顿饭，说起汉水和大都，都觉得像上辈子的事。'),
              fail: { fx: (g) => g.remember('zm_snub'), res: '她说：“不必了。”', dev: 3 } },
          ] },
        { id: 'zm_brother_end', age: 36, t: '哥哥', cond: (g) => !g.alive('wangbaobao'), auto: true,
          text: (g) => '哥哥死在漠北。他的部下送来一把断了的马鞭。' + (g.recall('zm_saw_brother') ? '你庆幸那年回去看过他。' : '你最后一次见他，还是他来接你回家那天。'),
          fx: (g) => g.stat('心境', -8) },
        { id: 'zm_history', age: 50, t: '修史',
          text: (g) => '有人从金陵来，说新朝在修《元史》，问你愿不愿意讲讲汝阳王府的事。' + (g.recall('zm_teacher') === 'told' ? '来人姓王，说他父亲当年在王府教过书，被赶了出去。' : ''),
          choices: [
            { t: '讲', canon: true, fx: (g) => { g.stat('悟性', 3); g.info('身份', '前朝郡主'); }, res: '你讲了三天。他们只写了三行。' },
            { t: '不讲，自己写一本藏起来', dev: 10, fx: (g) => { g.set('zhaominMemoir'); g.stat('心境', 3); }, res: '你写了三年，写完压在箱底。封面上写着：汝阳王府旧事，不足为外人道。' },
          ] },
        { id: 'zm_old', age: 62, t: '眉笔',
          text: (g) => {
            let t = g.alive('zhangwuji') && !g.f('zhaominHome') && !g.f('zhouMarried') ? '张无忌老了，手抖得拿不稳眉笔。' : '你老了。镜子里的人，你有时候认不出来。';
            if (g.recall('zm_snub')) t += '你有点后悔那年没见周芷若。';
            if (g.f('zhaoZhouReconciled')) t += '周芷若每年秋天都来，今年还没到。';
            if (g.recall('zm_alone') === 'south') t += '西湖边的柳树，都是你来了以后栽的。';
            return t;
          },
          choices: [
            { t: '拿起眉笔', canon: true, fx: (g) => g.stat('心境', 10), res: (g) => (g.alive('zhangwuji') && !g.f('zhaominHome') && !g.f('zhouMarried') ? '你给他画。他说，你画得也不好看。你们都笑了。' : '你给自己画了一次。画歪了，你也没擦。') },
            { t: '再骑一次马', dev: 10, cond: (g) => !!g.recall('zm_rider') || g.recall('zm_daughter') === 'mongol', check: ['根骨', 40], fx: (g) => { g.stat('心境', 8); g.move('grassland'); }, res: '你在草原上跑了一里地，回来时腿软得下不了马。你说，就在这里住下吧。',
              fail: { fx: (g) => g.stat('根骨', -5), res: '你从马上摔下来，躺了半个月。', dev: 0 } },
            { t: '回大都城外看一眼', dev: 10, fx: (g) => { g.move('dadu'); g.stat('心境', 4); }, res: '王府早拆了，原地盖了一座衙门。你在门口的茶棚坐了一下午，没人认得你。' },
          ] },
      ],
    },
  };

  /* ---------- 周芷若 ---------- */
  // 汉水船上有没有那个发冷的小男孩：只有张无忌走原著那条路（没留冰火岛、没拜少林）而且还活着时才有
  const wujiOnBoat = (g) => g.alive('zhangwuji') && zwMain(g);
  // 光明顶上有没有那个替明教出头的少年
  const wujiDefends = (g) => g.alive('zhangwuji') && !g.f('mingjiaoCrushed');
  const zhouzhiruo = {
    id: 'zhouzhiruo', name: '周芷若', py: 'ZHOU<<ZHI<RUO', book: B, sex: '女', born: 115,
    origin: '汉水船家之女，峨嵋派弟子',
    birthplace: '汉水边一条渔船上', home: 'hanshui', bg: 1,
    info: { 门派: '无', 身份: '船家女' },
    look: { hair: 'bun', hairColor: '#120d0b', robe: '#c8ccd2', accent: '#5a7c9a' },
    family: [{ rel: '父亲', name: '周老船家', note: '撑船为生' }, { rel: '母亲', name: '周家娘子', note: '早逝' }],
    fateText: '汉水船家之女，被张三丰送上峨嵋。灭绝师太临终传她掌门，逼她发誓不嫁张无忌。她在灵蛇岛盗刀剑、练九阴白骨爪，濠州婚礼上被抛下，屠狮大会上夺了天下第一，最后一个人守着峨嵋。',
    st: [55, 85, 55, 60, 5, 5, 20],
    death: (g) => (g.f('zhouMarried') ? { y: 185, cause: '与张无忌在峨嵋山下终老', mod: true }
      : g.f('zhouDisgraced') ? { y: 170, cause: '在汉水上一条渔船里病逝', mod: true }
      : { y: 172, cause: '在峨嵋掌门任上病逝' }),
    ms: [[115, '生于汉水船家'], [125, '父亲死于蒙古兵箭下，被张三丰送上峨嵋'], [125, '头上插着张无忌送的发簪', (g) => g.f('wujiHairpin')], [134, '随灭绝师太围攻光明顶'],
      [134, '光明顶上那一剑刺偏了', (g) => g.f('zhouMercyThrust')], [135, '接任峨嵋掌门', (g) => !g.f('zhouNoOath')], [135, '没做掌门，下山跟着张无忌', (g) => g.f('zhouFollowedWuji')],
      [136, '屠狮大会上以九阴白骨爪夺魁', (g) => !g.f('zhouNoJiuyin') && !g.f('zhouFairFight') && !g.f('zhouDisgraced')], [136, '屠狮大会上用峨嵋剑法堂堂正正地打', (g) => g.f('zhouFairFight')],
      [136, '灵蛇岛的事被揭穿，赵敏替她瞒了下来', (g) => g.f('zhouSpared')], [136, '灵蛇岛的事被揭穿，交出铁指环，回了汉水', (g) => g.f('zhouDisgraced')],
      [136, '嫁给了张无忌', (g) => g.f('zhouMarried')], [139, '把掌门之位传给了静玄', (g) => g.f('zhouLeftEmei')],
      [140, '一个人守着峨嵋', (g) => !g.f('zhouMarried') && !g.f('zhouDisgraced') && !g.f('zhouNoOath')], [150, '每年秋天去塞外看赵敏', (g) => g.f('zhaoZhouReconciled')]],
    arc: {
      focus: '闭关练功',
      intro: '你生在汉水边一条渔船上。父亲撑船，母亲死得早。你从小就知道，水涨的时候鱼多，兵来的时候人少。',
      lastWords: '我这一辈子，都在跟一句誓言打架。',
      nodes: [
        { id: 'zz_birth', age: 0, t: '渔船', loc: 'hanshui', auto: true,
          text: '你是在船上生的。母亲生下你没几天就走了，父亲用一只鱼篓把你挂在船舱里。' },
        { id: 'zz_song', age: 3, t: '船歌', auto: true,
          text: '父亲撑船的时候唱一支汉水船歌，你听着就睡着了。这支歌你记了一辈子。',
          fx: (g) => g.stat('心境', 4) },
        { id: 'zz_river', age: 6, t: '撑船', loc: 'hanshui',
          text: '父亲教你撑船。他说，撑船的人要会看水，水底下有石头，水面上看不出来。岸上的私塾里，先生在念书。',
          choices: [
            { t: '学撑船', canon: true, fx: (g) => { g.stat('根骨', 4); g.remember('zz_river', 'pole'); }, res: '你八岁就能一个人把船撑过江。' },
            { t: '去岸上偷听私塾先生念书', dev: 5, fx: (g) => { g.stat('悟性', 6); g.remember('zz_river', 'school'); }, res: '先生发现了，没赶你，只是把窗子开大了一点。你认的字，比岸上的男孩子还多。' },
          ] },
        { id: 'zz_flood', age: 8, t: '大水', loc: 'hanshui',
          text: '汉水发大水，一家人抱着木盆从你们船边漂过去，孩子在哭。',
          choices: [
            { t: '叫父亲把船撑过去', canon: true, fx: (g) => { g.stat('情义', 5); g.remember('zz_flood', 'saved'); }, res: '你们救上来三个人，父亲的篙断了。那家的男人说，这条命记在周家账上。' },
            { t: '抓紧船舷，什么也不说', dev: 5, fx: (g) => { g.stat('心境', -5); g.remember('zz_flood', 'froze'); }, res: '那一家人漂远了。你很多年都梦见那个孩子。' },
            { t: '跳下水去拉那个孩子', dev: 15, check: ['根骨', 55], fx: (g) => { g.stat('情义', 6); g.remember('zz_flood', 'swam'); }, res: '你把孩子拖上了船。父亲揍了你一顿，又抱着你哭。从那天起，汉水上的人都说周家丫头水性好。',
              fail: { fx: (g) => { g.stat('根骨', -8); g.remember('zz_flood', 'froze'); }, res: '水太急了，父亲把你从水里捞了回来。那个孩子没有救上来。', dev: 0 } },
          ] },
        { id: 'zz_hanshui', age: 10, t: '汉水', loc: 'hanshui',
          text: (g) => '蒙古兵追着一个叫常遇春的明教汉子，一箭射死了你父亲。' + (g.recall('zz_river') === 'pole' ? '你接过竹篙，把船撑进了芦苇荡。' : '')
            + (wujiOnBoat(g) ? '船上还有一个老道士，抱着一个浑身发冷的小男孩。小男孩冷得吃不下饭。' : '船上还有一个白胡子老道士，独自赶路，替你挡下了好几支箭。'),
          choices: [
            { t: '一口一口喂他', canon: true, cond: wujiOnBoat, fx: (g) => { g.rel('故人', 'zhangwuji'); g.stat('情义', 6); g.stat('心境', -20); },
              res: (g) => '他叫张无忌。老道士叫张三丰，他说要给你找个好去处。' + (g.recall('zz_flood') === 'saved' ? '那年大水里救上来的那家人，划船赶来帮你埋了父亲。' : '') },
            { t: '跪下谢那个老道士', canon: true, cond: (g) => !wujiOnBoat(g), fx: (g) => { g.remember('zz_nowuji'); g.stat('情义', 4); g.stat('心境', -20); },
              res: (g) => '老道士说他叫张三丰，刚从少林回来，一个人。他说要给你找个好去处。' + (g.recall('zz_flood') === 'saved' ? '那年大水里救上来的那家人，划船赶来帮你埋了父亲。' : '') },
            { t: '只顾着抱着父亲哭', dev: 10, fx: (g) => { g.stat('心境', -25); if (wujiOnBoat(g)) g.remember('zz_nofeed'); else g.remember('zz_nowuji'); },
              res: (g) => (wujiOnBoat(g) ? '老道士叹了口气，替你喂了那个孩子。你一直没看清他的脸。' : '老道士在船头坐了一夜，天亮时替你把父亲葬在了岸上。') + (g.recall('zz_flood') === 'froze' ? '你想起大水那年，你也是这样什么都没做。' : '') },
            { t: '跳进汉水，把落水的常遇春拖上船', dev: 20, cond: (g) => g.recall('zz_flood') === 'swam', fx: (g) => { g.set('changyuchunOwesZhou'); if (wujiOnBoat(g)) g.rel('故人', 'zhangwuji'); else g.remember('zz_nowuji'); g.stat('心境', -15); },
              res: '常遇春吐了半天水，跪在船板上给你磕了个头：“姑娘，这条命是你的。”老道士看着你，点了点头。' },
          ] },
        { id: 'zz_emei', age: 10, t: '上峨嵋', loc: 'emei', auto: true,
          text: (g) => '张三丰写了一封信，把你送上峨嵋山。' + (g.f('emeiLate') ? '峨嵋派立派晚，门下的人不多。' : '') + '灭绝师太看完信，收你做了关门弟子。',
          fx: (g) => { g.info('门派', '峨嵋派'); g.info('身份', '峨嵋弟子'); g.rel('师父', 'miejue'); g.party([]); } },
        { id: 'zz_train', age: 12, t: '学艺', loc: 'emei',
          text: '师父的规矩又严又狠。师姐丁敏君嫌你是船家女，处处为难你。',
          choices: [
            { t: '忍着，练得比谁都狠', canon: true, fx: (g) => { g.stat('武学', 8); g.stat('心境', -5); g.info('武学', '峨嵋剑法'); }, res: '三年后，丁敏君打不过你了。她不再为难你，只是不再跟你说话。' },
            { t: '偷看丁敏君练剑，记下她的破绽', dev: 10, check: ['悟性', 60], fx: (g) => { g.stat('武学', 6); g.remember('zz_ding', 'beat'); g.info('武学', '峨嵋剑法'); }, res: '比剑那天，她输给了你，脸色铁青。她这辈子都记着这件事。',
              fail: { fx: (g) => { g.stat('根骨', 2); g.remember('zz_ding', 'beat'); }, res: '她发现了，罚你挑了一个月的水。从此她看你的眼神更冷了。', dev: 0 } },
            { t: '对她格外客气', dev: 10, fx: (g) => { g.stat('情义', 4); g.remember('zz_ding', 'friend'); }, res: '她嘴上还是刻薄，可再没在师父面前说过你的坏话。有一年你病了，是她半夜给你熬的药。' },
          ] },
        { id: 'zz_xiaofu', age: 12, t: '纪师姐', auto: true,
          text: '你听说纪晓芙师姐不肯去杀明教的杨逍，被师父一掌打死了。她留下一个女儿，叫杨不悔。你那天晚上没有睡着。',
          fx: (g) => { g.stat('心境', -5); g.stat('悟性', 2); } },
        { id: 'zz_yitianjian', age: 14, t: '倚天剑', loc: 'emei', auto: true,
          text: (g) => '师父第一次让你捧着倚天剑。剑很轻，削铁如泥。' + (g.f('yangKeepsSword') ? '师父说，这是祖师郭襄用一块玄铁亲手铸的，' : '师父说，这是郭大侠夫妇在襄阳城破前铸的，') + '是峨嵋的命根子。',
          fx: (g) => g.stat('悟性', 2) },
        { id: 'zz_jiuyang', age: 16, t: '峨嵋九阳功', loc: 'emei', cond: (g) => !g.f('jiuyangLost'),
          text: '师父传你峨嵋九阳功，说这是祖师郭襄从少林觉远大师临终时听来的。',
          choices: [
            { t: '用心练', canon: true, fx: (g) => { g.stat('武学', 8); g.stat('根骨', 5); g.info('内功', '峨嵋九阳功'); }, res: '你练到第三层，师父说，你是峨嵋百年来最好的苗子。' },
            { t: '偷偷去翻祖师留下的其他东西', dev: 10, fx: (g) => { g.stat('悟性', 5); g.remember('zz_note'); },
              res: (g) => '你在金顶一块石碑后面，看见祖师刻的一行小字：“风陵渡口初相遇，一见杨过误终身。”' + (g.recall('zz_river') === 'school' ? '你认得每一个字，也认得那一笔一画里的心事。' : '') },
          ] },
        { id: 'zz_jiuyang_lost', age: 16, t: '失传', cond: (g) => g.f('jiuyangLost'), auto: true,
          text: '峨嵋九阳功早就失传了。师父说，祖师当年只顾着照顾一个小和尚，没记全。她只能教你剑法。',
          fx: (g) => g.stat('武学', 4) },
        { id: 'zz_rival', age: 18, t: '宋青书', loc: 'emei',
          text: '武当派的宋青书来峨嵋送信，眼睛一直看着你。师姐们在背后笑。',
          choices: [
            { t: '不理他', canon: true, fx: (g) => { g.stat('心境', 2); g.rel('爱慕者', 'songqingshu'); }, res: '他在山门外站了很久。' },
            { t: '收下他的信，回一封', dev: 10, fx: (g) => { g.set('zhouWroteSong'); g.rel('爱慕者', 'songqingshu', '收着你的信'); }, res: '你只回了“已阅”两个字。他把那张纸收了很多年，揣在怀里。' },
            { t: '告诉师父', dev: 10, fx: (g) => { g.remember('zz_song_shamed'); g.stat('情义', -3); g.rel('爱慕者', 'songqingshu', '被灭绝师太赶下山'); }, res: '师父把宋青书赶下了山。他走的时候，回头看你的眼神，你很久以后才看懂。' },
          ] },
        { id: 'zz_guangming', age: 19, t: '光明顶', loc: 'guangming',
          text: (g) => (wujiDefends(g) ? '师父把倚天剑递给你，要你刺那个替明教出头的少年一剑。' + (g.recall('zz_nowuji') ? '那少年自称曾阿牛，你从没见过他。' : g.recall('zz_nofeed') ? '那少年看你的眼神，好像认得你。' : '你认出来了，他是汉水上的那个孩子。')
            : '明教的人一个个倒下了，没有人替他们出头。师父把倚天剑递给你，要你去刺一个受了伤、还在站着的明教老人。'),
          choices: [
            { t: '刺', canon: true, fx: (g) => { g.stat('心境', -15); g.stat('声望', 5); }, res: (g) => (wujiDefends(g) ? '剑刺进去，他没有躲。他看你的眼神，你一辈子都忘不了。' : '剑刺进去，老人倒了下去。你回到峨嵋，好几夜没睡着。') },
            { t: '刺偏三分', dev: 20, check: ['悟性', 60], fx: (g) => { g.set('zhouMercyThrust'); g.stat('心境', -5); }, res: (g) => (wujiDefends(g) ? '剑从他肋下穿过，伤得不重。师父没看出来，他看出来了。' : '剑从老人肋下穿过。他看了你一眼，被明教的人抬走了。'),
              fail: { fx: (g) => g.stat('心境', -15), res: '他忽然一动，剑还是刺进了胸口。', dev: 3 } },
            { t: '把剑扔在地上', dev: 30, fx: (g) => { g.remember('zz_dropped'); g.stat('声望', -15); g.stat('情义', 8); }, res: '倚天剑掉在石头上，当的一声。师父没有打你，只说：“回峨嵋再说。”' },
          ] },
        { id: 'zz_oath', age: 20, t: '铁指环', loc: 'dadu', cond: (g) => g.alive('miejue'),
          text: (g) => {
            const where = g.f('noWanan') ? '师父在峨嵋金顶上病倒了。' : g.f('miejueLives') ? '师父从万安寺塔上被人救了下来，躺在客栈里，一身是伤。' : '万安寺塔上，';
            const more = g.recall('zz_dropped') ? '她说，光明顶上你扔了剑，这一回，你得把命押上。' : '';
            const ding = g.recall('zz_ding') === 'friend' ? '丁敏君跪在一边，替你求了一句情，被师父喝住了。' : g.recall('zz_ding') === 'beat' ? '丁敏君在一边冷笑。' : '';
            const vow = g.alive('zhangwuji') && g.knows('zhangwuji') ? '不得与张无忌相爱' : '一生不与魔教中人往来';
            return where + '师父把掌门铁指环套在你手上，要你发誓：' + vow + '，否则她死不瞑目，你父母在九泉之下不得安宁。' + more + ding;
          },
          choices: [
            { t: '发誓', canon: true, fx: (g) => { g.info('身份', '峨嵋掌门'); g.stat('声望', 20); g.stat('心境', -10); },
              res: (g) => (g.f('noWanan') || g.f('miejueLives') ? '你发了誓。师父闭上眼睛，没有再说话。' : '你发了誓。师父站上栏杆，跳了下去。') },
            { t: '不发', dev: 35, fx: (g) => { g.set('zhouNoOath'); g.stat('心境', 5); g.stat('声望', -10); },
              res: (g) => (g.f('noWanan') || g.f('miejueLives') ? '师父看了你很久，把铁指环交给了静玄师姐。' : '师父看了你很久。掌门之位，她传给了静玄师姐。然后她跳了下去。') },
            { t: '发誓，心里另有打算', dev: 15, fx: (g) => { g.info('身份', '峨嵋掌门'); g.remember('zz_false_oath'); g.stat('声望', 20); g.stat('正邪', -5); }, res: '你发了誓。你想，这句誓是对师父发的，往后师父听不见了。' },
          ] },
        { id: 'zz_free', age: 20, t: '不做掌门', loc: 'emei', cond: (g) => g.f('zhouNoOath'),
          text: '静玄师姐做了掌门。你还是峨嵋弟子，可再没人盯着你。夜里你常站在金顶上，往东边看。',
          choices: [
            { t: '留在峨嵋，好好做弟子', dev: 0, fx: (g) => { g.info('身份', '峨嵋弟子'); g.stat('心境', 4); }, res: '你替静玄师姐管着新来的弟子。她们都说，周师姐最好说话。' },
            { t: '下山，去找张无忌', dev: 20, cond: (g) => g.alive('zhangwuji') && !!g.knows('zhangwuji'), fx: (g) => { g.set('zhouFollowedWuji'); g.move('road'); g.info('身份', '下山的峨嵋弟子'); },
              res: (g) => '你没跟谁告别。在大都城外，你追上了明教的人马。' + (g.recall('zz_nowuji') ? '他认出你是光明顶上刺他那一剑的人，愣了很久，说：“你来了。”' : '他看见你，愣了很久，说：“你来了。”') },
            { t: '下山，回汉水撑船', dev: 15, cond: (g) => !g.alive('zhangwuji'), fx: (g) => { g.move('hanshui'); g.info('身份', '下山的峨嵋弟子'); g.remember('zz_back_han'); g.stat('心境', 6); },
              res: '你撑着父亲那样的船，在汉水上来来回回。没人知道你是峨嵋的人。' },
          ] },
        { id: 'zz_jiuyin', age: 20, t: '九阴真经', loc: 'lingshe', cond: (g) => !g.f('zhouNoOath'),
          text: (g) => (g.f('noBladeSecrets') ? '师父临死前说，倚天剑和屠龙刀里什么都没有。祖师郭襄把《九阴真经》藏在峨嵋金顶。可是你现在在灵蛇岛上，刀剑就在手边，赵敏睡得很沉。'
            : '灵蛇岛上，倚天剑和屠龙刀都在你手边。师父说过，刀剑互斫，里面藏着《九阴真经》。赵敏睡得很沉。') + (g.recall('zz_false_oath') ? '你发过的誓，这时候在耳边响。' : ''),
          choices: [
            { t: '迷倒众人，盗走刀剑，嫁祸赵敏', canon: true, fx: (g) => { g.stat('武学', 30); g.stat('正邪', -30); g.stat('心境', -10); g.info('武学', '九阴白骨爪'); },
              res: (g) => (g.f('noBladeSecrets') ? '你划伤了殷离的脸，把赵敏丢在岛上。回到峨嵋，你在金顶打开了祖师的石匣。' : '你划伤了殷离的脸，把赵敏丢在岛上。刀剑互斫，掉出了一卷经书。') },
            { t: '只盗刀剑，不害旁人', dev: 15, fx: (g) => { g.set('zhouSparedYinli'); g.stat('武学', 30); g.stat('正邪', -15); g.info('武学', '九阴白骨爪'); }, res: '你一个人划着小船走了，没有动殷离，也没有动赵敏。第二天，所有人还是都说是赵敏干的。殷离的脸，好好的。' },
            { t: '不碰', dev: 30, fx: (g) => { g.set('zhouNoJiuyin'); g.stat('正邪', 10); }, res: '那一夜你没睡。刀剑后来被别人拿走了，你一直没学会九阴白骨爪。' },
            { t: '叫醒张无忌，把师父的话告诉他', dev: 30, cond: (g) => g.alive('zhangwuji'), fx: (g) => { g.set('zhouNoJiuyin'); g.set('zhouToldWuji'); g.stat('正邪', 10); g.stat('情义', 6); }, res: '他听完，把刀剑推到你面前：“这是峨嵋的东西。”你看着它们，忽然一点也不想要了。你们之间，从此没有瞒着的事。' },
          ] },
        { id: 'zz_wedding', age: 21, t: '濠州', loc: 'haozhou', cond: (g) => !g.f('zhouMarried') && !g.f('zhouExposed') && g.alive('zhangwuji'),
          text: (g) => {
            let t = g.f('zhouNoOath') ? '你没有发过誓，什么也不欠师父。' : g.recall('zz_false_oath') ? '你早就打算违这个誓。' : '你违了誓。';
            if (g.f('zhouFollowedWuji')) t += '你跟着他走了一年，';
            t += '今天你和张无忌在濠州成亲。';
            if (g.f('zhouMercyThrust')) t += '他说，他一直记得光明顶上你刺偏的那一剑。';
            if (g.f('zhouToldWuji')) t += '灵蛇岛上的事，他都知道。';
            return t + '拜堂拜到一半，赵敏闯了进来。';
          },
          choices: [
            { t: '一爪抓向赵敏', canon: true, cond: (g) => !g.f('zhouNoJiuyin'), fx: (g) => { g.stat('正邪', -10); g.stat('心境', -20); }, res: '你抓伤了她的肩膀。他回头看了你一眼，还是走了。' },
            { t: '扯下凤冠，让他走', dev: 25, fx: (g) => { g.remember('zz_let_go'); g.stat('心境', -10); g.stat('正邪', 5); }, res: '你说：“你走吧。”他走了。你坐在满堂红烛里，一直坐到天亮。' },
            { t: '拉住他：“你走出这道门，我就死在这里。”', dev: 35, check: ['情义', 70], fx: (g) => { g.set('zhouMarried'); g.rel('丈夫', 'zhangwuji'); g.party(['zhangwuji']); g.stat('心境', 5); },
              res: '他停住了。赵敏在门口站了很久，转身走了。',
              fail: { fx: (g) => g.stat('心境', -25), res: '他说：“芷若，对不起。”然后他还是走了。', dev: 3 } },
            { t: '脱下嫁衣，跟他一起去救谢逊', dev: 30, check: ['情义', 65], fx: (g) => { g.set('zhouJoinedRescue'); g.party(['zhangwuji', 'zhaomin']); }, res: '你们三个人一起上了路。赵敏看了你好几眼，谁也没说话。',
              fail: { fx: (g) => { g.remember('zz_let_go'); g.stat('心境', -20); }, res: '他说：“你留下，等我回来。”他没有回来。', dev: 3 } },
          ] },
        { id: 'zz_tushi', age: 21, t: '屠狮大会', loc: 'shaolin',
          text: (g) => (g.f('zhouNoOath') ? '少林屠狮大会。你不是掌门，只是峨嵋的一个弟子，可天下人都在看你。' : '少林屠狮大会。你是峨嵋掌门，要在天下英雄面前争一个第一。'),
          choices: [
            { t: '用九阴白骨爪连败群雄', canon: true, cond: (g) => !g.f('zhouNoJiuyin'), fx: (g) => { g.stat('声望', 30); g.stat('正邪', -5); },
              res: (g) => '你夺了天下第一。' + (g.alive('huangshan') ? '然后一个穿黄衫的女子用一根竹棒点了你三下，你认得那是打狗棒法。' : '') },
            { t: '用峨嵋剑法堂堂正正地打', dev: 20, check: ['武学', 60], fx: (g) => { g.set('zhouFairFight'); g.stat('声望', 15); g.stat('正邪', 5); }, res: '你打进了前三。没有人说峨嵋使的是邪功。',
              fail: { fx: (g) => { g.set('zhouFairFight'); g.stat('声望', -5); }, res: '你在第二场输给了丐帮的长老。可没人说峨嵋使的是邪功。', dev: 5 } },
            { t: '只为救谢逊出手', dev: 15, cond: (g) => !g.f('zhouJoinedRescue'), check: ['武学', 55], fx: (g) => { g.set('zhouSavedXiexun'); g.stat('声望', 10); },
              res: (g) => (g.alive('zhangwuji') ? '你和张无忌一起闯进了后山。' : '你一个人闯进了后山。') + (g.recall('zz_nowuji') ? '谢逊听了你的声音，问你是哪一派的。' : '谢逊认出了你的声音，叫你“汉水上的小丫头”。'),
              fail: { fx: (g) => g.stat('根骨', -8), res: '你被渡厄的长索扫中，吐了一口血。', dev: 3 } },
            { t: '和他们两个一起闯后山', dev: 15, cond: (g) => g.f('zhouJoinedRescue'), fx: (g) => { g.set('zhouSavedXiexun'); g.stat('声望', 10); g.stat('情义', 4); }, res: '三个人背靠着背，破了金刚伏魔圈。谢逊出来时，一手拉着张无忌，一手拉着你。' },
          ] },
        { id: 'zz_confess', age: 21, t: '心事', loc: 'shaolin', cond: (g) => !g.f('zhouToldWuji') && !g.f('zhouExposed') && g.alive('zhangwuji'),
          text: (g) => (g.f('zhouMarried') ? '你们成亲以后，他常常一个人发呆。灵蛇岛上的事，你憋了很久。' : '大会之后，张无忌来看你。灵蛇岛上的事，你憋了很久。'),
          choices: [
            { t: '都说出来', canon: true, fx: (g) => { g.stat('心境', 15); g.remember('zz_confess', 'all'); }, res: '你都说了。他没有骂你，只是很久很久没有说话。' },
            { t: '一个字也不说', dev: 20, fx: (g) => { g.stat('心境', -15); g.remember('zz_confess', 'none'); }, res: '灵蛇岛上的事，你打算带进坟墓。' },
            { t: '只告诉赵敏', dev: 15, fx: (g) => { g.set('zhouToldZhaomin'); g.stat('心境', 8); }, res: '赵敏听完说：“我早知道了。”她一直没告诉他。你们两个，从此多了一件只有彼此知道的事。' },
          ] },
        { id: 'zz_songqingshu', age: 22, t: '宋青书', cond: (g) => g.alive('songqingshu'),
          text: (g) => '宋青书为了你，害死了自己的师叔，背叛了武当。他浑身是伤，武当派的人要把他押回去。' + (g.f('zhouWroteSong') ? '他怀里掉出一张发黄的纸，上面是你写的“已阅”。' : g.recall('zz_song_shamed') ? '他说，那年被你师父赶下山，他就想过要做一件让你看得见的事。' : ''),
          choices: [
            { t: '让武当带走他', canon: true, fx: (g) => g.stat('心境', -6), res: '他死在了武当山上。你没有去送。' },
            { t: '替他求情', dev: 15, check: ['声望', 60], fx: (g) => { g.set('songqingshuLives'); g.stat('情义', 6); },
              res: '张三丰看了你很久，说：“让他去峨嵋山下种地吧。”',
              fail: { fx: (g) => g.stat('心境', -8), res: '宋远桥说，这是武当的家事。', dev: 3 } },
            { t: '打开后门，放他走', dev: 20, fx: (g) => { g.set('songqingshuLives'); g.set('songqingshuFled'); g.stat('正邪', -6); }, res: '他从后山走了。武当派找了他三年，没有找到。' },
          ] },
        { id: 'zz_promise', age: 22, t: '一件事', cond: (g) => !g.f('zhouMarried') && g.alive('zhangwuji'),
          text: (g) => (g.recall('zz_let_go') ? '是你自己在喜堂上放他走的。' : '') + '张无忌要走了，跟赵敏一起。他问你，还有什么要他做的。',
          choices: [
            { t: '“我要你答应我一件事。是什么，以后再说。”', canon: true, fx: (g) => { g.stat('心境', 5); g.rel('故人', 'zhangwuji', '还欠你一件事'); }, res: '他答应了。你一直没说是什么事。' },
            { t: '“没有。你走吧。”', dev: 15, fx: (g) => { g.remember('zz_no_ask'); g.stat('悟性', 3); }, res: '你转身回了峨嵋，一次也没有回头。' },
            { t: '“下辈子，早点来汉水找我。”', dev: 15, fx: (g) => { g.set('zhouHanshuiVow'); g.stat('心境', 3); }, res: '他愣了一下，说好。你知道这是一句空话，还是很高兴。' },
          ] },
        { id: 'zz_married', age: 24, t: '为人妻', loc: 'emei', cond: (g) => g.f('zhouMarried'),
          text: '你们在峨嵋山下住了下来。你还是峨嵋掌门，每天天不亮就上山，天黑才回来。他在山门外开了一间药铺。',
          choices: [
            { t: '两头都守着', dev: 0, fx: (g) => { g.info('身份', '峨嵋掌门'); g.stat('心境', -3); }, res: '你一个人当两个人用。他说你瘦了。' },
            { t: '把掌门之位传给静玄师姐', dev: 15, fx: (g) => { g.set('zhouLeftEmei'); g.info('身份', '张无忌之妻'); g.stat('心境', 10); }, res: '你把铁指环交了出去。那天晚上，你第一次睡到了天亮。' },
          ] },
        { id: 'zz_court', age: 30, t: '朝廷', loc: 'emei', cond: (g) => !g.f('zhouLeftEmei') && !g.f('zhouDisgraced'),
          text: '新朝初立，朝廷派人上峨嵋，请峨嵋派入朝，做官家的门派。牢里还关着一批不肯散的明教弟子。',
          choices: [
            { t: '不去', canon: true, fx: (g) => { g.stat('正邪', 5); g.remember('zz_court', 'no'); }, res: '你说，峨嵋是郭祖师的峨嵋，不是谁家的峨嵋。' },
            { t: '去', dev: 20, fx: (g) => { g.set('emeiCourt'); g.stat('声望', 10); g.stat('正邪', -10); }, res: '峨嵋派从此香火鼎盛，山门口多了一块御赐的匾。' },
            { t: '要朝廷先放了牢里的明教弟子', dev: 20, check: ['声望', 60], fx: (g) => { g.set('mingjiaoPardoned'); g.stat('正邪', 8); }, res: '来人愣住了，回去禀报。半年后，牢里放出了一批人。',
              fail: { fx: (g) => g.stat('心境', -3), res: '来人冷笑着走了。', dev: 3 } },
            { t: '请常遇春将军替明教弟子说句话', dev: 20, cond: (g) => g.f('changyuchunOwesZhou') && g.alive('changyuchun'), fx: (g) => { g.set('mingjiaoPardoned'); g.stat('正邪', 6); }, res: '常遇春接到信，第二天就进了宫。那批明教弟子出狱时，没人知道是汉水上一个船家女救的。' },
          ] },
        { id: 'zz_jinding', age: 28, t: '金顶', loc: 'emei', auto: true,
          text: (g) => '你在金顶的祖师殿里，看着郭襄祖师的画像。画里的姑娘拿着一枚金针，笑得像没有心事。' + (g.recall('zz_note') ? '你想起石碑后面那行小字。原来她也等过一个人。' : ''),
          fx: (g) => g.stat('悟性', 3) },
        { id: 'zz_disciple', age: 35, t: '弟子', loc: 'emei',
          text: (g) => '你收了一个弟子，眉眼有点像小时候的你。她问你，什么是峨嵋最厉害的武功。' + (g.f('emeiCourt') ? '山门口那块御赐的匾，她天天擦。' : g.recall('zz_court') === 'no' ? '她听说你当年把朝廷的人挡在了山门外。' : ''),
          choices: [
            { t: '只教她峨嵋剑法', canon: true, fx: (g) => { g.stat('正邪', 5); g.rel('弟子', '关门弟子', '学峨嵋剑法'); }, res: (g) => (g.f('zhouNoJiuyin') ? '她学得很慢，很稳。' : '那天夜里，你把九阴真经烧了。') },
            { t: '教她九阴白骨爪', dev: 10, cond: (g) => !g.f('zhouNoJiuyin'), fx: (g) => { g.set('emeiJiuyinClaw'); g.rel('弟子', '关门弟子', '学九阴白骨爪'); }, res: '她学得很快。你看着她，有点怕。' },
            { t: '把灵蛇岛上的事讲给她听', dev: 15, fx: (g) => { g.remember('zz_told_disciple'); g.rel('弟子', '关门弟子', '知道你的心事'); }, res: '她听完哭了。你说：“记住，别像我。”' },
          ] },
        { id: 'zz_zhaomin', age: 35, t: '故人', cond: (g) => g.alive('zhaomin') && !g.f('zhouMarried'),
          text: (g) => '你路过塞外，听说赵敏就住在附近。' + (g.f('zhouToldZhaomin') ? '那件只有你们两个知道的事，她守了十几年。' : ''),
          choices: [
            { t: '去看看她', canon: true, fx: (g) => { g.stat('心境', 8); g.rel('故人', 'zhaomin'); }, res: '你们说了一下午，谁也没提那个人的名字。临走她送了你一包草原上的奶茶。' },
            { t: '绕路走', dev: 10, fx: (g) => { g.remember('zz_avoid'); g.stat('心境', -3); }, res: '你在马上回头看了一眼，看见一缕炊烟。' },
            { t: '写一封信，不见面', dev: 10, fx: (g) => { g.set('zhouApologized'); g.stat('心境', 2); }, res: '信里只有一句：“当年对不住。”她回了一句：“早忘了。”' },
          ] },
        { id: 'zz_letter', age: 45, t: '来信', cond: (g) => g.alive('zhangwuji') && !g.f('zhouMarried'),
          text: (g) => '张无忌托人送来一封信，说他听说你病了，信里夹着一张药方。' + (g.recall('zz_no_ask') ? '你当年什么也没要他做，他还是记着你。' : '') + (g.recall('zz_avoid') ? '信是从你那年绕开的那片草原寄来的。' : ''),
          choices: [
            { t: '照方抓药', canon: true, fx: (g) => { g.stat('根骨', 6); g.stat('心境', 4); }, res: '病好了。药方你一直夹在经书里。' },
            { t: '把信烧了', dev: 10, fx: (g) => { g.remember('zz_letter', 'burn'); g.stat('心境', -4); }, res: '火苗舔着纸角，你看着那几个字一点一点没了。病拖了一冬才好。' },
            { t: '病好后去塞外当面谢他', dev: 15, fx: (g) => { g.remember('zz_letter', 'visit'); g.stat('根骨', 3); g.stat('情义', 3); }, res: '你们三个人坐在毡房外喝奶茶，像几个老朋友。' },
          ] },
        { id: 'zz_last', age: 55, t: '传位', loc: 'emei', cond: (g) => !g.f('zhouNoOath') && !g.f('zhouLeftEmei') && !g.f('zhouDisgraced'),
          text: (g) => {
            let t = '你病了。弟子们跪在床前，问你掌门之位传给谁。';
            if (g.recall('zz_told_disciple')) t += '你那个关门弟子一直握着你的手。';
            if (g.f('emeiJiuyinClaw')) t += '你想起教她白骨爪那天，心里一凉。';
            if (g.recall('zz_letter') === 'burn') t += '你忽然有点想念那封烧掉的信。';
            if (g.recall('zz_confess') === 'none') t += '灵蛇岛的事，到现在你还没对人说过。';
            return t;
          },
          choices: [
            { t: '传给最用功的弟子', canon: true, fx: (g) => { g.stat('心境', 5); g.info('身份', '峨嵋前任掌门'); }, res: '你把铁指环交了出去，手轻了很多。' },
            { t: '传给丁敏君的弟子', dev: 10, cond: (g) => g.recall('zz_ding') === 'friend', fx: (g) => { g.stat('情义', 5); g.info('身份', '峨嵋前任掌门'); }, res: '你说，当年她半夜给你熬过药。这个情，还给她的徒弟。' },
            { t: '不传了，带着铁指环回汉水', dev: 20, fx: (g) => { g.move('hanshui'); g.info('身份', '汉水上的老船家'); g.stat('心境', 8); }, res: '弟子们追到山下，你已经上了船。铁指环，你沉进了汉水里。' },
          ] },
        { id: 'zz_old', age: 60, t: '船歌',
          text: (g) => (g.f('zhouMarried') ? '你和他都老了。他每天还替你把脉。' : g.f('zhouDisgraced') ? '你在汉水上撑了几十年船，没人知道你做过峨嵋掌门。' : g.recall('zz_back_han') ? '你在汉水上撑了一辈子船，船歌唱得比父亲还好。' : '你老了，耳朵有点背了。') + (g.f('zhouHanshuiVow') ? '你常想起那句“下辈子，早点来汉水找我”。' : ''),
          choices: [
            { t: '回汉水撑一次船', dev: 5, fx: (g) => { g.move('hanshui'); g.stat('心境', 8); }, res: '你把船撑到江心，唱了一遍父亲的船歌。唱到一半，忘了词。' },
            { t: '把灵蛇岛那一夜写下来', dev: 10, cond: (g) => !g.f('zhouToldWuji'), fx: (g) => { g.set('zhouConfession'); g.stat('心境', 6); }, res: '你写了一夜，写完封好，压在祖师画像底下。上面写着：我死后再看。' },
            { t: '就这样坐着，看云', dev: 0, fx: (g) => g.stat('心境', 5), res: '云从金顶底下漫上来，一会儿就把什么都盖住了。' },
          ] },
      ],
    },
  };

  JY.addChars([zhangwuji, zhaomin, zhouzhiruo]);

  /* ---------- 世界事件：纪年 88–160 ---------- */
  JY.addEvents([
    { y: 88, t: '张三丰收宋远桥为第一个弟子。武当山上从此有了晨钟。' },
    { y: 104, t: '武当七侠到齐。俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷，一个比一个出名。' },
    { y: 102, t: (g) => '混元霹雳手成昆为夺师妹，害死徒弟谢逊满门。' + (g.f('xiexunWarned') ? '谢逊记得有个姑娘提醒过他提防师父。那一夜他赶回家，还是晚了一步。' : ''), mod: (g) => g.f('xiexunWarned') },
    { y: 106, cond: (g) => g.f('heZudaoBeaten') || g.f('heZudaoFriend'), mod: true,
      t: (g) => (g.f('heZudaoBeaten') ? '昆仑三圣何足道折了自己的剑，从此只称琴圣、棋圣，不再提剑。' : '昆仑三圣何足道逢人便说，他这辈子只服一个下棋的对手。') },
    { y: 105, t: '明教教主阳顶天在秘道中走火入魔而死，明教群龙无首，四分五裂。' },
    { y: 108, t: (g) => (g.f('xiexunSpared') ? '江湖上有人横死，现场留着一行字：“杀人者混元霹雳手成昆”。死的都是成昆的旧交，没有一个无辜的人。' : '江湖上接连有人横死，每一处都留下一行字：“杀人者混元霹雳手成昆”。'), mod: (g) => g.f('xiexunSpared') },
    { y: 113, t: (g) => '天鹰教在王盘山岛扬刀立威。金毛狮王谢逊夺走屠龙刀，挟持武当张翠山、天鹰教殷素素出海，从此不知下落。' + (g.f('cuishanEmeiMove') ? '张翠山在岛上用一招峨嵋剑法接住了谢逊一掌，谢逊才没有杀他。' : '') + (g.f('yangKeepsSword') ? '有人说，这把刀不是在襄阳铸的，是峨嵋祖师郭襄用杨过留下的玄铁打的。' : ''),
      mod: (g) => g.f('yangKeepsSword') || g.f('cuishanEmeiMove') },
    { y: 113, t: '武当俞岱岩护送屠龙刀途中，被人用大力金刚指折断四肢，从此瘫痪在床。' },
    { y: 114, who: 'zhangwuji', t: '北海冰火岛上，张翠山、殷素素生下一个男孩，取名张无忌。' },
    { y: 116, who: 'zhaomin', t: '大都汝阳王府生下一位郡主，蒙古名敏敏特穆尔。' },
    { y: 124, who: 'zhangwuji', cond: (g) => !g.f('cuishanLives'), t: (g) => (g.f('wujiStayIsland') ? '张翠山夫妇从海外回到中原，儿子没有跟回来。张三丰八十寿宴上，六大派逼问谢逊下落，张翠山自刎，殷素素殉情。' : '张翠山一家回到中原。张三丰八十寿宴上，六大派逼问谢逊下落，张翠山自刎，殷素素殉情。') },
    { y: 124, who: 'zhangwuji', cond: (g) => !g.f('wujiStayIsland'), t: '张翠山之子张无忌中了玄冥神掌，寒毒入骨，张三丰抱着他四处求医。' },
    { y: 125, who: ['zhouzhiruo', 'zhangwuji'], t: (g) => (g.f('changyuchunOwesZhou') ? '汉水上，蒙古兵追杀明教常遇春，船家周老汉中箭身亡。他的女儿跳进江里救起了常遇春，被张三丰送上了峨嵋。' : '汉水上，蒙古兵追杀明教常遇春，船家周老汉中箭身亡。张三丰把他的女儿周芷若送上了峨嵋。') },
    { y: 127, t: '峨嵋派纪晓芙不肯去杀杨逍，死在师父灭绝掌下。' },
    { y: 129, who: 'zhangwuji', cond: (g) => !g.f('wujiStayIsland') && !g.f('wujiShaolin'), t: '张无忌在昆仑山下被朱长龄逼落悬崖，下落不明。' },
    { y: 134, who: ['zhangwuji', 'zhouzhiruo'], cond: (g) => !g.f('mingjiaoCrushed'), t: (g) => '六大派围攻光明顶。一个自称曾阿牛的少年一人连败六派高手，随后被明教推为教主。他的真名叫张无忌。' + (g.f('chengkunExposed') ? '少林的圆真当场被揭穿，押回了少林。' : '') },
    { y: 134, who: ['zhangwuji', 'zhouzhiruo'], cond: (g) => g.f('mingjiaoCrushed'), mod: true, t: '六大派围攻光明顶，明教几乎被灭了门。' },
    { y: 135, who: ['zhaomin', 'zhangwuji', 'zhouzhiruo'], cond: (g) => !g.f('noWanan'), t: (g) => '汝阳王之女赵敏用十香软筋散擒住六大派高手，囚于大都万安寺。明教教主张无忌率众放火救人。' + (g.f('zhaominFought') ? '赵敏调兵死守，明教折了好几个兄弟。' : '') + (g.f('miejueLives') ? '峨嵋灭绝师太被人从塔上救下。' : ''), mod: (g) => g.f('zhaominFought') || g.f('miejueLives') },
    { y: 135, who: ['zhangwuji', 'zhaomin', 'zhouzhiruo'], cond: (g) => !g.f('xiaozhaoStayed'), t: (g) => (g.f('bosiDelayed') ? '波斯明教的船晚了一年才到，小昭在中原多留了一年。' : '波斯明教来人，小昭随船西去，接任波斯明教教主。') + '灵蛇岛上，倚天剑与屠龙刀同时失踪。' },
    { y: 136, who: ['zhangwuji', 'zhaomin', 'zhouzhiruo'], cond: (g) => !g.f('zhouMarried') && !g.f('zhouExposed'), t: '濠州，张无忌与周芷若成亲之日，赵敏闯入喜堂，张无忌随她而去。' },
    { y: 136, who: ['zhangwuji', 'zhouzhiruo'], t: (g) => (g.f('zhouFairFight') ? '少林屠狮大会，峨嵋派周芷若以峨嵋剑法力战群雄，没有使一招邪功。' : g.f('zhouDisgraced') ? '少林屠狮大会，峨嵋派换了掌门，没有争第一。' : '少林屠狮大会，峨嵋派周芷若以九阴白骨爪夺得天下第一。' + (g.alive('huangshan') ? '一位黄衫女子以打狗棒法将她击退，飘然而去。' : '')) + (g.f('zhouSavedXiexun') ? '周芷若和张无忌一起闯进后山，救出了谢逊。' : '张无忌救出谢逊。') + '谢逊废了成昆的武功，拜入少林。' },
    { y: 138, who: ['zhangwuji', 'zhaomin'], cond: (g) => !g.f('mingjiaoKept'), t: (g) => '张无忌让出明教教主之位，杨逍接任。' + (g.f('zhouMarried') ? '张无忌与周芷若回了峨嵋山下。' : '张无忌与赵敏不知所终。') },
    { y: 140, t: (g) => '明教义军朱元璋攻下集庆，改名应天府。' + (g.f('redScarfVillage') ? '打头阵的红巾军里，有一整个村子的人，当年被一个过路人报信救下。' : '') },
    { y: 146, t: (g) => (g.f('mingjiaoKept') ? '明太祖下诏禁明教。明教教主张无忌退守光明顶，与朝廷对峙。' : '明太祖下诏禁绝明教。明教从此转入地下，圣火在西域还烧着。'), mod: (g) => g.f('mingjiaoKept') },
    { y: 148, cond: (g) => g.f('mingjiaoPardoned'), mod: true, t: '朝廷放出了一批关在牢里的明教弟子，禁教的告示也不再四处张贴。' },
    { y: 150, t: (g) => '少林、武当、峨嵋三派重修旧好。屠龙刀的故事，渐渐只在说书人嘴里了。' + (g.f('emeiCourt') ? '峨嵋山门口挂着御赐的匾，江湖上的人不大去了。' : '') + (g.f('gaibangUnited') ? '丐帮又成了天下第一大帮。' : ''), mod: (g) => g.f('emeiCourt') || g.f('gaibangUnited') },
    { y: 158, t: (g) => (g.f('jiuyangBurned') ? '有人去昆仑山找《九阳真经》，白猿早死了，油布包里只剩一捧灰。' : '江湖上又有人说见到了《九阴真经》，人人都说自己见过，没有一个人练成。') + (g.f('emeiJiuyinClaw') ? '峨嵋有个年轻的师太，使出了九阴白骨爪。' : '') + (g.f('wujiSonMartial') ? '一个姓张的年轻人一掌震退了三个山贼，用的是九阳神功。' : ''),
      mod: (g) => g.f('jiuyangBurned') || g.f('emeiJiuyinClaw') || g.f('wujiSonMartial') },
    { y: 160, cond: (g) => g.f('wujiSonWudang') || g.f('mingjiaoHerbalists'), mod: true,
      t: (g) => (g.f('wujiSonWudang') ? '武当山上出了一个年轻的剑客，人家说他父亲做过明教教主。' : '') + (g.f('mingjiaoHerbalists') ? '深山里有一片药田，种药的人从不提自己的来历，只给穷人看病不收钱。' : '') },
    { y: 176, cond: (g) => g.f('wujiMedicalBook'), mod: true, t: '江湖上流传一本医书，叫《无忌医方》，里面一个字也没提武功。' },
    { y: 178, cond: (g) => g.f('zhaominMemoir') || g.f('zhouConfession'), mod: true,
      t: (g) => (g.f('zhaominMemoir') ? '有人在漠北一个箱底找到一本《汝阳王府旧事》，写书的是一位郡主。' : '') + (g.f('zhouConfession') ? '峨嵋祖师画像底下压着一封信，信封上写着：我死后再看。' : '') },
  ]);

  /* ---------- 奇遇 ---------- */
  JY.addEncounters([
    { id: 'e_yt_guoxiang_cuishan', y: [105, 112], once: true, cond: (g) => g.isMe('guoxiang') && g.alive('zhangcuishan'), always: true, t: '武当少年',
      text: '武当派一个少年弟子来峨嵋送信。他叫张翠山，字写得极好，说是师父张三丰让他来问候“郭女侠”。',
      choices: [
        { t: '托他带一句话给张三丰', canon: true, fx: (g) => g.stat('心境', 5), res: '你让他带回去一句话：“当年的小兄弟，胡子白了没有？”' },
        { t: '教他一招峨嵋剑法', dev: 10, fx: (g) => { g.set('cuishanEmeiMove'); g.stat('情义', 3); }, res: '他学得很快，说要把这一招化进自己的书法里。很多年后，这一招在海上救过他的命。' },
        { t: '托他带一枚金针给张三丰', dev: 10, fx: (g) => { g.set('sanfengGotNeedle'); g.stat('情义', 3); }, res: '你没写一个字，只包了一枚金针。少年答应一定亲手交到师父手里。' },
      ] },
    { id: 'e_yt_xiexun', y: [102, 112], minAge: 16, cond: (g) => g.alive('xiexun') && !g.isMe('xiexun'), t: '金毛汉子',
      text: (g) => '你在一座破庙里遇见一个金头发的高大汉子，抱着一坛酒，一个一个念着他全家人的名字。' + (g.knows('xiexun') ? '你认得他，是谢逊。他已经不认得你了。' : ''),
      choices: [
        { t: '陪他喝酒', canon: true, fx: (g) => g.stat('情义', 3), res: '他喝醉了说，他师父成昆杀了他全家。他要让天下人都知道成昆这个名字。' },
        { t: '劝他别滥杀无辜', dev: 10, check: ['悟性', 70], fx: (g) => { g.set('xiexunSpared'); g.stat('正邪', 4); }, res: '他把酒坛摔了，没说话。那几年，江湖上横死的人少了一些。',
          fail: { fx: (g) => g.stat('根骨', -6), res: '他一掌把你推出了庙门。', dev: 0 } },
        { t: '替他打听成昆的下落', dev: 10, check: ['悟性', 60], fx: (g) => { g.set('xiexunKnowsShaolin'); g.stat('正邪', -2); }, res: '你打听到成昆投了少林，法名圆真。他把这两个字记在心里，二十多年没忘。',
          fail: { fx: (g) => g.stat('心境', -2), res: '你什么也没打听到。', dev: 0 } },
      ] },
    { id: 'e_yt_sanfeng', y: [100, 150], minAge: 8, cond: (g) => g.alive('zhangsanfeng') && !g.isMe('zhangwuji'), t: '老道士',
      text: (g) => {
        const k = g.knows('zhangsanfeng');
        const tail = g.f('sanfengGotNeedle') ? '他手里转着一枚生锈的金针。' : '';
        if (g.isMe('guoxiang')) return '武当山下，一个白胡子老道坐在石头上晒太阳。你认出来了，是当年少林寺里那个挑水的少年张君宝。他也认出了你，站起来叫了一声“郭二姑娘”。' + tail;
        const arm = g.f('yangArm') ? '两条胳膊都在' : '只有一条胳膊';
        if (k) return '武当山下，' + k + '张三丰坐在石头上晒太阳。他又说起年轻时见过的神雕大侠杨过，' + arm + '，还有那个骑青驴的郭襄姑娘。' + tail;
        return '武当山下，一个白胡子老道坐在石头上晒太阳。他说他年轻时见过神雕大侠杨过，' + arm + '，还见过一个叫郭襄的姑娘，骑着一头青驴。' + tail;
      },
      choices: [
        { t: '听他讲完', canon: true, fx: (g) => g.stat('悟性', 4), res: (g) => (g.isMe('guoxiang') ? '你们从少林寺说到襄阳，又说到风陵渡。说到那个人的时候，两个人都不说话了。' : '他讲了一个下午。讲到郭襄的时候，他停了很久。') },
        { t: '请他教你一招', dev: 5, check: ['悟性', 60], fx: (g) => { g.stat('武学', 6); g.info('武学', '太极拳（一招揽雀尾）'); }, res: '他教你一招“揽雀尾”，说你学会了，就知道什么叫以柔克刚。',
          fail: { fx: (g) => g.stat('心境', 2), res: '他笑着说，你还太急。', dev: 0 } },
        { t: '求他收你为徒', dev: 15, cond: (g) => !g.isMe('guoxiang') && !g.knows('zhangsanfeng'), check: ['悟性', 72], fx: (g) => { g.info('门派', '武当派'); g.rel('师父', 'zhangsanfeng'); g.stat('武学', 8); }, res: '他看了你很久，说：“上山吧，先挑三年水。”你成了武当的弟子。',
          fail: { fx: (g) => g.stat('心境', -2), res: '他摇摇头：“你的路不在武当。”', dev: 0 } },
      ] },
    { id: 'e_yt_huangshan', y: [125, 160], minAge: 12, once: true, cond: (g) => g.alive('huangshan') && !g.isMe('yangguo') && !g.isMe('xiaolongnv'), t: '黄衫',
      text: (g) => {
        const k = g.knows('huangshan');
        const who = k === '仇人' ? '终南山脚下，你又碰见了屠狮大会上用打狗棒击退你的黄衫女子。她看见你，竹棒没有离手。'
          : k ? '终南山脚下，你又碰见了屠狮大会上那个黄衫女子。她冲你点了点头。'
          : '终南山脚下，一个穿黄衫的年轻女子牵着一只白色的大雕。';
        return who + '她说她家祖上有过一只更大的雕。' + (g.f('limochouLives') ? '她还说，古墓里有一位姓李的师伯祖，脾气很坏，活得很久。' : '');
      },
      choices: [
        { t: '问她祖上是谁', canon: true, fx: (g) => g.stat('悟性', 3), res: (g) => '她笑了，说：“一个只有一条胳膊、却比谁都快活的人。”' + (g.knows('yangguo') ? '你认得那个人。你没告诉她。' : '') },
        { t: '求她指点', dev: 5, check: ['悟性', 65], fx: (g) => { g.stat('武学', 6); g.info('武学', '古墓派身法（三步）'); }, res: '她拿竹棒点了你三下，你身上三处破绽，自己都没发现过。她又教了你三步走法。',
          fail: { fx: (g) => g.stat('心境', -2), res: '她摇摇头，牵着雕走了。', dev: 0 } },
        { t: '跟着她进终南山', dev: 15, check: ['情义', 60], fx: (g) => { g.move('zhongnan'); g.rel('知交', 'huangshan'); }, res: '她带你走到一块石碑前，说再往里你就进不去了。从那以后，每年春天她都会来山下看你一次。',
          fail: { fx: (g) => g.stat('心境', -2), res: '雕叫了一声，她就不见了。', dev: 0 } },
      ] },
    { id: 'e_yt_gaibang', y: [100, 150], minAge: 16, t: '丐帮长老',
      text: (g) => {
        const k = g.knows('huangrong');
        const head = '几个丐帮长老找上门来。帮主' + g.slot('丐帮帮主') + '多年不露面，帮里分成了好几派。';
        if (k === '母亲') return head + '他们知道你是黄帮主的女儿，说丐帮的打狗棒，你娘也拿过，不能断在他们手里。';
        if (k) return head + '他们知道你认得黄帮主，说丐帮的打狗棒，她也拿过，不能断在他们手里。';
        return head + '他们说，丐帮的降龙十八掌，是从洪七公、黄蓉、鲁有脚一路传下来的，不能断在他们手里。';
      },
      choices: [
        { t: '这是丐帮的家事', canon: true, fx: (g) => g.stat('心境', 2), res: '他们叹了口气，走了。' },
        { t: '替他们调停', dev: 15, check: ['声望', 50], fx: (g) => { g.set('gaibangUnited'); g.stat('声望', 6); }, res: '你劝了三天，他们答应先一起打鞑子，帮主的事以后再说。丐帮又成了一个丐帮。',
          fail: { fx: (g) => g.stat('心境', -2), res: '他们吵到半夜，各自散了。', dev: 0 } },
        { t: '拜进丐帮，替他们出力', dev: 10, fx: (g) => { g.info('门派', '丐帮'); g.stat('声望', 3); g.stat('正邪', 3); }, res: '你背上了一只麻袋。长老说，袋子是要一只一只挣的。' },
      ] },
    { id: 'e_yt_mingjiao', y: [120, 143], minAge: 16, cond: (g) => !g.isMe('zhaomin') && !(g.isMe('zhangwuji') && g.Y >= 134), t: '红巾',
      text: (g) => '几个头裹红巾的汉子在村口烧香，念着“焚我残躯，熊熊圣火”。' + (g.knows('changyuchun') ? '领头的说他们是常遇春常大哥的兵。' : '') + '他们问你，要不要入明教，一起打鞑子。',
      choices: [
        { t: '给他们些干粮', canon: true, fx: (g) => g.stat('正邪', 2), res: '他们说，等打下天下，请你喝酒。' },
        { t: '入教', dev: 10, fx: (g) => { g.stat('正邪', 4); g.info('门派', '明教'); }, res: '你在胳膊上绑了一条红巾。从此你有了一群兄弟，也有了一群仇人。' },
        { t: '告诉他们官兵明天要来', dev: 10, fx: (g) => { g.set('redScarfVillage'); g.stat('正邪', 3); }, res: '他们连夜转移，村子里一个人也没少。这些人后来都去了濠州。' },
      ] },
    { id: 'e_yt_xiangyang', y: [80, 160], minAge: 14, t: '襄阳旧城',
      text: (g) => {
        const k = g.knows('guojing');
        const head = k === '父亲' ? '你回到襄阳。这是你爹娘守了一辈子的城。城墙还剩一半，城头长满了草。'
          : '你路过襄阳。城墙还剩一半，城头长满了草。' + (k ? '你认得郭大侠夫妇，他们待你不薄。' : '');
        return head + (g.f('guoSurvive') ? '老人们说，郭大侠夫妇是活着出城的，有人在终南山下见过他们。' : '老人们说，郭大侠夫妇就是在这段城墙上战死的。');
      },
      choices: [
        { t: '去郭靖黄蓉的衣冠冢磕个头', canon: true, cond: (g) => g.knows('guojing') !== '父亲', fx: (g) => g.stat('正邪', 3), res: '冢前有人放了一碗酒，还是新的。' },
        { t: '去爹娘的衣冠冢磕头', canon: true, cond: (g) => g.knows('guojing') === '父亲', fx: (g) => { g.stat('心境', -4); g.info('心事', '襄阳城头的衣冠冢'); }, res: '冢前有人放了一碗酒，还是新的。你跪了很久，想不出是谁放的。' },
        { t: '向城里的老人打听郭襄的下落', dev: 5, cond: (g) => !g.isMe('guoxiang'), fx: (g) => { g.remember('yt_guoxiang_west'); g.stat('悟性', 2); }, res: '老人说，郭二小姐骑着青驴往西走了，一路打听一个人，后来上了峨嵋山。' },
        { t: '在襄阳住下来，帮着修城墙', dev: 10, fx: (g) => { g.move('xiangyang'); g.stat('情义', 3); }, res: '你知道修好了也守不住什么，还是每天搬砖。城里的孩子都叫你“砌墙的”。' },
      ] },
    { id: 'e_yt_tulong', y: [113, 140], minAge: 14, t: '屠龙刀',
      text: (g) => '酒楼里人人都在念：“武林至尊，宝刀屠龙。号令天下，莫敢不从。倚天不出，谁与争锋。”' + (g.knows('xiexun') ? '你知道刀在谢逊手里，一个字也没说。' : '') + (g.f('noBladeSecrets') ? '角落里一个老乞丐冷笑：“刀里什么都没有，郭大侠早把东西交给女儿了。”' : ''),
      choices: [
        { t: '打听刀在哪里', canon: true, fx: (g) => g.stat('声望', 2), res: '每个人说的都不一样。有人说在海外，有人说在一个瞎子手里。' },
        { t: '跟着几个寻刀的人出海', dev: 10, check: ['根骨', 50], fx: (g) => { g.move('sea'); g.stat('声望', 3); }, res: '你们在海上漂了一个月，什么也没找到，倒学会了看星星认路。',
          fail: { fx: (g) => { g.move('sea'); g.stat('根骨', -6); }, res: '船翻了。你抱着一块船板漂了三天，被渔船捞了上来。', dev: 0 } },
        { t: '去王盘山岛看看', dev: 5, fx: (g) => { g.move('wangpan'); g.stat('悟性', 2); }, res: '岛上的石头还是黑的，天鹰教扬刀立威的木台塌了一半。你在台下捡到半截断剑。' },
      ] },
    { id: 'e_yt_eagle', y: [80, 115], minAge: 10, once: true, cond: (g) => !g.f('yangNoTomb') && !g.isMe('yangguo') && !g.isMe('xiaolongnv'), t: '老雕',
      text: (g) => '深山里有一只很老很老的大雕，羽毛秃了一半，站在一座石冢前，一动不动。' + (g.knows('yangguo') ? '你认得它，是神雕侠杨过的那只雕。它老了，主人不在身边。' : ''),
      choices: [
        { t: '给它留一块肉', canon: true, fx: (g) => g.stat('情义', 3), res: '它看了你一眼，没有吃。第二天你再去，它不见了。' },
        { t: '看看石冢上刻了什么', dev: 5, check: ['悟性', 50], fx: (g) => { g.stat('悟性', 5); g.info('见闻', '见过独孤求败的剑冢'); }, res: '石上刻着“剑冢”两个字。旁边有人后来添了一行小字：杨过到此。',
          fail: { fx: (g) => g.stat('心境', -1), res: '石冢上的字被青苔盖住了，你看不清。', dev: 0 } },
        { t: '跟着它走', dev: 10, check: ['根骨', 50], fx: (g) => { g.move('jianzhong'); g.stat('武学', 6); g.info('武学', '剑冢石壁上的几招'); }, res: '它领你到一处山洞，石壁上全是剑痕。你在洞里住了一个月，出来时手上的剑沉了很多。',
          fail: { fx: (g) => g.stat('根骨', -4), res: '它飞上了悬崖，你爬不上去。', dev: 0 } },
      ] },
    { id: 'e_yt_xuanming', y: [118, 142], minAge: 14, cond: (g) => !g.isMe('zhaomin'), t: '鹿杖鹤笔',
      text: (g) => '两个老头，一个拿鹿杖，一个拿鹤笔，在路边抢一个汉人姑娘。' + (g.isMe('zhangwuji') && g.Y >= 124 && !g.f('wujiStayIsland') ? '就是当年在你背上拍了一掌的那两个人。' : ''),
      choices: [
        { t: '绕开', canon: true, fx: (g) => g.stat('心境', -4), res: '你走出很远，还能听见哭声。' },
        { t: '出手', dev: 15, check: ['武学', 70], fx: (g) => { g.set('xuanmingScarred'); g.stat('声望', 8); }, res: '你和他们拆了五十招，在鹿杖客脸上留了一道口子。他们骂骂咧咧地走了，那姑娘也跑了。',
          fail: { fx: (g) => { g.stat('根骨', -20); g.info('伤病', '玄冥寒毒'); }, res: '你挨了一掌玄冥神掌。寒毒在你骨头里待了很多年。', dev: 0 } },
        { t: '跟上去，等他们落单', dev: 10, check: ['悟性', 60], fx: (g) => { g.rel('救过的人', '一个汉人姑娘'); g.stat('正邪', 4); }, res: '夜里你摸进客栈，带着那个姑娘从后门跑了。她说她姓韩，以后要报答你。',
          fail: { fx: (g) => g.stat('根骨', -8), res: '鹤笔翁回头一笔，点中了你的肩膀。', dev: 0 } },
      ] },
    { id: 'e_yt_bosi', y: [130, 140], minAge: 16, t: '波斯船',
      text: (g) => '海边来了一条波斯大船，船上的人戴着高帽子，说中原话说得很怪，到处打听一个叫小昭的姑娘。' + (g.knows('xiaozhao') ? '你认得她。' : ''),
      choices: [
        { t: '说不知道', canon: true, fx: (g) => g.stat('心境', 1), res: '他们在海边等了三天，开船走了。' },
        { t: '帮他们打听', dev: 10, fx: (g) => { g.set('bosiFoundEarly'); g.stat('声望', 2); }, res: '你替他们问到了灵蛇岛。他们送了你一块西域的宝石，说是圣火令上掉下来的。' },
        { t: '劝他们别找了', dev: 10, check: ['悟性', 55], fx: (g) => { g.set('bosiDelayed'); g.stat('情义', 2); }, res: '领头的人想了很久，说回去禀报总教再来。他们这一走，晚了整整一年。',
          fail: { fx: (g) => g.stat('心境', -1), res: '他们听不懂你说什么。', dev: 0 } },
      ] },
    { id: 'e_yt_emei_portrait', y: [118, 170], minAge: 12, cond: (g) => !g.alive('guoxiang') && !g.isMe('zhouzhiruo'), t: '祖师画像',
      text: (g) => '峨嵋金顶上挂着祖师郭襄的画像，画里的姑娘拿着一枚金针。' + (g.knows('guoxiang') ? '画得不太像她，她笑起来比这个好看。' : '') + (g.recall('yt_guoxiang_west') ? '你想起襄阳的老人说过，她骑着青驴往西走了。' : '') + (g.f('emeiLate') ? '守殿的老尼说，祖师一辈子都在找一个人，峨嵋派是她的弟子风陵开的。' : '守殿的老尼说，祖师四十岁上峨嵋，再没下过山。'),
      choices: [
        { t: '上一炷香', canon: true, fx: (g) => g.stat('心境', 3), res: '香烟直直地往上走。' },
        { t: '求老尼引你拜入峨嵋', dev: 10, cond: (g) => g.s('正邪') >= 0, check: ['情义', 55], fx: (g) => { g.info('门派', '峨嵋派'); g.move('emei'); }, res: '老尼带你去见掌门。你在金顶住了下来，每天给祖师的画像擦一遍灰。',
          fail: { fx: (g) => g.stat('心境', -2), res: '老尼说峨嵋不收来历不明的人。', dev: 0 } },
        { t: '在殿前抄一遍祖师留下的剑谱', dev: 10, check: ['悟性', 60], fx: (g) => { g.stat('武学', 5); g.info('武学', '峨嵋剑法（抄本）'); }, res: '剑谱的最后一页，画着一只青驴。你照着抄了下来。',
          fail: { fx: (g) => g.stat('心境', -1), res: '老尼把剑谱收了回去。', dev: 0 } },
      ] },
    { id: 'e_yt_wudang7', y: [104, 125], minAge: 14, cond: (g) => g.alive('songyuanqiao'), t: '武当七侠',
      text: '一伙强盗正在烧村子，七个穿道袍的年轻人骑马赶到。领头的说：“武当宋远桥，请各位住手。”',
      choices: [
        { t: '帮着救火', canon: true, fx: (g) => { g.stat('正邪', 3); g.stat('情义', 2); }, res: '天亮时火灭了。七个人连名字都没留就走了，只有最年轻的那个回头冲你笑了笑。' },
        { t: '跟着他们去追强盗', dev: 10, check: ['武学', 40], fx: (g) => { g.rel('朋友', 'songyuanqiao'); g.stat('声望', 5); }, res: '你们追了一夜，把强盗头子送进了官府。宋远桥说，武当的门永远给你开着。',
          fail: { fx: (g) => g.stat('根骨', -5), res: '你的马跑不过他们的马。', dev: 0 } },
        { t: '问最年轻的那个叫什么', dev: 5, fx: (g) => { g.rel('故人', '莫声谷', '武当七侠之末'); g.stat('情义', 2); }, res: '他说他叫莫声谷。后来你听到他的消息，都会多问一句。' },
      ] },
    { id: 'e_yt_baihua', y: [88, 105], minAge: 30, cond: (g) => g.isMe('guoxiang') || g.isMe('yangguo') || g.isMe('xiaolongnv'), t: '昆仑三圣',
      text: '一个自称“昆仑三圣”的书生上门挑战，说要会会当年的神雕侠一脉，他琴、棋、剑都是天下第一。他叫何足道。',
      choices: [
        { t: '请他弹一曲', canon: true, fx: (g) => g.stat('心境', 5), res: '他弹得真好。你没告诉他你听不懂。' },
        { t: '跟他比剑', dev: 10, check: ['武学', 70], fx: (g) => { g.set('heZudaoBeaten'); g.stat('声望', 6); }, res: '他输了，把剑折成两段，说这辈子不再称剑圣。',
          fail: { fx: (g) => g.stat('心境', -3), res: '他赢了半招，开心得像个孩子，抱着琴走了。', dev: 0 } },
        { t: '跟他下一盘棋', dev: 10, check: ['悟性', 65], fx: (g) => { g.set('heZudaoFriend'); g.stat('悟性', 4); }, res: '你赢了。他把棋盘掀了，又摆好，说再来。下了三天三夜，你们成了朋友。',
          fail: { fx: (g) => g.stat('心境', -1), res: '他让你九子，你还是输了。', dev: 0 } },
      ] },
  ]);

  /* ---------- 地点闲笔 ---------- */
  JY.addFlavor('loc:binghuo', [
    '冰火岛上的太阳半年不落，半年不出。',
    '火山又喷了，岛上的冰化了一大片，第二天又冻上了。',
    '海边的冰面上躺着一群海豹，懒得动。',
    '义父坐在岩石上，对着大海吐纳，一坐就是一天。',
    '母亲用海豹皮给你缝了一件新袄。',
    '父亲在冰上写了一整天字，写完了又让雪盖住。',
    '你在火山口附近捡到一块温热的石头，揣在怀里过了一冬。',
  ]);
  JY.addFlavor('loc:wangpan', [
    '王盘山岛上到处是刀痕，石头上还有干了的血。',
    '岛上的海鸟不怕人。',
    '退潮的时候，沙滩上露出一截断了的旗杆。',
    '有人说，屠龙刀就是在这里第一次亮出来的。',
    '风很大，船帆都扯破了。',
    '岛上只有一口井，水是咸的。',
  ]);
  JY.addFlavor('loc:wudang', [
    '武当山的晨钟一响，满山的鸟都飞起来。',
    '紫霄宫前的银杏树黄了，落了一地。',
    '俞岱岩师伯躺在床上，一躺就是二十年。',
    '武当七侠轮流下山行侠，回来时总带着伤。',
    '太师父闭关了，山上静得能听见松针落地。',
    '山门口的石阶有一万多级，你一级一级数过。',
  ]);
  JY.addFlavor('loc:hudie', [
    '蝴蝶谷里的蝴蝶多得像下雪。',
    '胡青牛的药炉一年到头不熄。',
    '来求医的人在谷口跪着，胡青牛只看他们是不是明教的。',
    '你把一本《带脉论》翻烂了。',
    '谷里的草药，你认得的比胡青牛的徒弟还多。',
    '夜里谷中很静，只有药罐咕嘟咕嘟地响。',
  ]);
  JY.addFlavor('loc:hanshui', [
    '汉水上的船家唱着歌，一条船接一条船。',
    '江上起了雾，什么都看不见，只听见橹声。',
    '岸边的芦苇长得比人还高。',
    '鱼汛来了，满江都是网。',
    '蒙古兵的船在江上巡逻，船家都把头低着。',
    '下游漂来一具尸体，没有人去捞。',
  ]);
  JY.addFlavor('loc:kunlun', [
    '谷里四季如春，桃树一年开两次花。',
    '你给谷里的猴子都起了名字。',
    '瀑布下的水潭里有一条很大的鱼，你钓了三年没钓上来。',
    '谷外下雪的时候，谷里还是暖的。',
    '你在石壁上刻了一道又一道，数着过了多少天。',
    '白猿常常坐在你旁边，看你打坐。',
  ]);
  JY.addFlavor('loc:guangming', [
    '光明顶上的圣火日夜不熄。',
    '明教弟子见了你，都把右手按在胸口。',
    '秘道里的石壁上刻着波斯文字，没有人认得全。',
    '山风吹得火盆呼呼作响。',
    '五散人又吵起来了，吵完一起喝酒。',
    '杨逍在山顶吹箫，箫声顺着雪坡滚下去。',
  ]);
  JY.addFlavor('loc:dadu', [
    '大都的街上，蒙古人骑马，汉人走路。',
    '万安寺的塔很高，站在塔顶能看见整个大都。',
    '王府里的番僧念经，念得你头疼。',
    '城门口贴着通缉明教反贼的告示，画像一个也不像。',
    '冬天的大都风沙很大，出门要蒙着脸。',
    '宫里传出消息，皇帝又在修一座新的佛寺。',
  ]);
  JY.addFlavor('loc:lingshe', [
    '灵蛇岛上的蛇不咬人，据说是被金花婆婆养熟了。',
    '岛上的夜里海浪声很大，你睡不安稳。',
    '义父坐在海边，听着海浪说：“这声音跟冰火岛不一样。”',
    '岛上的石屋里堆着几个空酒坛。',
    '远处有船经过，没有靠岸。',
    '你在岸边捡到一块被海水磨圆的碎瓷片。',
  ]);
  JY.addFlavor('loc:haozhou', [
    '濠州城里到处是红巾军，街上卖烧饼的也系着红巾。',
    '朱元璋的大营里，每天都有人投奔。',
    '城外的田荒了一半，种田的人都去当兵了。',
    '有人在墙上写“驱逐胡虏，恢复中华”。',
    '你在濠州城的茶馆里听人说书，说的是明教教主的故事。',
    '濠州城的鼓楼每天敲三遍鼓。',
  ]);
  JY.addFlavor('loc:shaolin', [
    '少林后山有三棵松树，树下坐着三个老和尚，一坐就是几十年。',
    '藏经阁的门锁换了新的。',
    '少林寺的和尚们在晨练，拳风整齐得像一个人。',
    '少林寺外的小镇上，卖素斋的铺子一家挨着一家。',
  ]);
  JY.addFlavor('loc:emei', [
    '峨嵋金顶的云海一早一晚两个样子。',
    '山上的猴子会抢香客手里的东西。',
    '峨嵋弟子练剑的声音，在山谷里回响很久。',
    '下雪的时候，金顶上一片白，只有佛灯是黄的。',
    '师父的禅房里只有一张床、一盏灯、一把剑。',
    '你在峨嵋山的石阶上，数到了九百九十九级。',
    '祖师殿里供着郭襄的画像，香火从没断过。',
  ]);
  JY.addFlavor('loc:lvliu', [
    '绿柳山庄的柳树垂到水面上。',
    '山庄的地牢很深，墙上渗着水。',
    '亭子里摆着一盘没下完的棋。',
    '湖上有一只小船，船上没有人。',
    '庄子里的仆人走路都没有声音。',
    '花园里种着西域来的花，香得发闷。',
  ]);
  JY.addFlavor('loc:hut', [
    '草庐前有一棵老槐树，夏天在树下吃饭。',
    '你种的菜被兔子啃了一半。',
    '附近村子的人只知道你会看病，不知道你会武功。',
  ]);

  /* ---------- 人物闲笔 ---------- */
  JY.addFlavor('char:zhangwuji', [
    { t: '义父在冰上教你认北斗七星。他看不见，却每一颗都指得准。', maxAge: 9 },
    { t: '你问母亲，中原是什么样子。她说，人很多，坏人更多。', maxAge: 9 },
    { t: '你在冰洞里养了一只小海豹，冬天它跑了。', maxAge: 9 },
    { t: '父亲教你写“张”字，说这一笔要像剑。', maxAge: 9 },
    { t: '义父喝醉了，抱着你喊另一个孩子的名字。', maxAge: 9 },
    { t: '寒毒发作的时候，你冷得牙齿打战，盖三床被子也不管用。', minAge: 10, maxAge: 19, cond: (g) => zwMain(g) },
    { t: '你给自己扎针，扎得比大夫还准。', minAge: 12, maxAge: 19, cond: (g) => zwMain(g) },
    { t: '你想起父母，就在纸上写他们的名字，写完烧掉。', minAge: 10, maxAge: 19, cond: (g) => !g.f('cuishanLives') && !g.f('wujiStayIsland') },
    { t: '你梦见了冰火岛，义父在火山口向你招手。', minAge: 10, cond: (g) => !g.f('wujiStayIsland') || g.age >= 20 },
    { t: '义父背对着你坐在火山口，你知道他在想他死去的家人。', minAge: 10, maxAge: 19, cond: (g) => g.f('wujiStayIsland') },
    { t: '早课的钟声一响，你和师兄们一起爬起来挑水。', minAge: 12, maxAge: 17, cond: (g) => g.f('wujiShaolin') },
    { t: '有人问你是哪里人，你说不上来。', minAge: 14, maxAge: 30 },
    { t: '你又替一个不认识的人治好了病，没收钱。', minAge: 16 },
    { t: '你翻出母亲留下的一支金簪，想起她临死前那句话。', minAge: 16, maxAge: 40, cond: (g) => !g.f('cuishanLives') && !g.f('wujiStayIsland') },
    { t: '明教的兄弟叫你“教主”，你还是不习惯。', minAge: 20, maxAge: 24, cond: (g) => !g.f('mingjiaoCrushed') },
    { t: '你又在两个姑娘之间犹豫了一夜，什么也没想明白。', minAge: 21, maxAge: 22, cond: (g) => g.alive('zhaomin') && g.alive('zhouzhiruo') },
    { t: '赵敏又在你写的药方上改了一个字，说这样更好。她是对的。', minAge: 22, cond: (g) => !g.f('zhouMarried') && !g.f('zhaominHome') },
    { t: '周芷若练剑的时候，你在一旁煎药。', minAge: 22, cond: (g) => g.f('zhouMarried') },
    { t: '你写了一本医书，书名还没想好。', minAge: 30 },
    { t: '你去海边看了一天的海，想找冰火岛的方向。', minAge: 25 },
    { t: '你的九阳神功到了晚年，冬天也只穿一件单衣。', minAge: 50, cond: (g) => !g.f('wujiNoJiuyang') },
    { t: '有人跟你说起明教的旧事，你只是听，不说话。', minAge: 40 },
    { t: '你把乾坤大挪移的心法烧了，只留下了第一层。', minAge: 45 },
    { t: '你教村里的孩子认药草，他们叫你“张大夫”。', minAge: 35 },
  ]);
  JY.addFlavor('char:zhaomin', [
    { t: '哥哥教你射箭，你射中了一只野兔，又哭着要救它。', maxAge: 9 },
    { t: '父亲带你去看操练，十万大军，没有一个人说话。', maxAge: 12 },
    { t: '你把王府里的《资治通鉴》从头看到了尾。', minAge: 8, maxAge: 15 },
    { t: '你偷偷学汉人姑娘梳头，被嬷嬷说了一顿。', minAge: 8, maxAge: 15 },
    { t: '你给府里的每个武士都起了外号，他们都不敢有意见。', minAge: 10, maxAge: 18 },
    { t: '你和哥哥下象棋，从十二岁起他就没赢过。', minAge: 12, maxAge: 18 },
    { t: '你在大都的书铺里买了一本汉人的话本，看到半夜。', minAge: 12, maxAge: 19 },
    { t: '你想起绿柳山庄的地牢，自己一个人笑出了声。', minAge: 19, maxAge: 22, cond: (g) => !!g.knows('zhangwuji') },
    { t: '你穿男装的样子，比穿女装还像你自己。', minAge: 14, maxAge: 20 },
    { t: '你梦见父亲骑着马，在草原上越走越远。', minAge: 20 },
    { t: '张无忌又说错了话，你罚他给你剥一盘瓜子。', minAge: 21, cond: (g) => !g.f('zhaominHome') && !g.f('zhouMarried') },
    { t: '你在塞外教村里的女人认字。', minAge: 22, cond: (g) => !g.f('zhaominHome') },
    { t: '你在漠北的风雪里，想起大都的宫灯。', minAge: 22, cond: (g) => g.f('zhaominHome') },
    { t: '你给女儿讲故事，讲的都是你自己的事，只是名字换了。', minAge: 26 },
    { t: '你翻出一件旧男装，已经穿不下了。', minAge: 30 },
    { t: '你下棋时还是那么爱悔棋。', minAge: 25 },
    { t: '你骑马跑了一整天，回来腰疼了三天。', minAge: 45 },
    { t: '有人在你面前说汝阳王的坏话，你没有生气。', minAge: 30 },
    { t: '你听说大都的王府拆了，改成了一座寺庙。', minAge: 32 },
    { t: '你常常一个人站在草原上，朝南看，又朝北看。', minAge: 30 },
    { t: '你记起汉人先生说的那句话：得人心者得天下。', minAge: 40 },
  ]);
  JY.addFlavor('char:zhouzhiruo', [
    { t: '父亲在船头钓鱼，你在船尾数星星。', maxAge: 9 },
    { t: '你在船舷边洗衣裳，一只鱼跳到了你的盆里。', maxAge: 9 },
    { t: '你把攒的铜钱藏在船板缝里，被父亲发现了，他又悄悄放回去两枚。', maxAge: 9 },
    { t: '你想父亲了，在山崖边坐了一个下午。', minAge: 10, maxAge: 15 },
    { t: '峨嵋山上冬天很冷，你缩在被子里背剑诀。', minAge: 10, maxAge: 18 },
    { t: '师姐们嫌你话少。你只是不知道该说什么。', minAge: 10, maxAge: 18 },
    { t: '你在山泉边照了照自己，发现自己长大了。', minAge: 14, maxAge: 18 },
    { t: '你想起汉水上那个浑身发冷的男孩，不知道他还活着没有。', minAge: 11, maxAge: 19, cond: (g) => !g.recall('zz_nowuji') },
    { t: '你想起汉水上那个白胡子老道，他把你交给师父时，摸了摸你的头。', minAge: 11, maxAge: 19, cond: (g) => !!g.recall('zz_nowuji') },
    { t: '你的剑法，师父说比纪师姐当年还好。', minAge: 15, maxAge: 19 },
    { t: '你戴着掌门铁指环，手指总是冷的。', minAge: 20, cond: (g) => !g.f('zhouNoOath') },
    { t: '你夜里练九阴白骨爪，练完了把手泡在冷水里很久。', minAge: 20, maxAge: 35, cond: (g) => !g.f('zhouNoJiuyin') },
    { t: '你梦见师父站在塔顶，对你说：“你发过誓。”', minAge: 20, maxAge: 40, cond: (g) => !g.f('zhouNoOath') },
    { t: '你看见一对新人拜堂，转身走了。', minAge: 21, cond: (g) => !g.f('zhouMarried') },
    { t: '他煎药的时候，你在旁边练剑。', minAge: 21, cond: (g) => g.f('zhouMarried') },
    { t: '你给峨嵋派立了一条新规矩：弟子不得滥杀。', minAge: 25 },
    { t: '弟子们怕你。你知道，你也不想让她们不怕。', minAge: 25 },
    { t: '你在金顶看日出，看到太阳完全出来才下山。', minAge: 25 },
    { t: '你哼起了汉水船歌，弟子们问你唱的是什么。', minAge: 30 },
    { t: '你把那支发簪找出来看了看，又收了回去。', minAge: 22, cond: (g) => g.f('wujiHairpin') },
    { t: '有人在山下提起张无忌的名字，你停下了脚步。', minAge: 25, cond: (g) => !!g.knows('zhangwuji') },
    { t: '你的头发白了一半，弟子们说这样更像掌门。', minAge: 40 },
    { t: '你一个人坐着，想起那句话：“我要你答应我一件事。”', minAge: 30, cond: (g) => !g.f('zhouMarried') && !!g.knows('zhangwuji') },
  ]);
})();

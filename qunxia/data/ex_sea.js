/* 群侠 · 临安、灵蛇岛、冰火岛的探索补充，和按地区、年份分的路上遭遇（字段说明见 zhongyuan.js 开头）。
 * 标记的来龙去脉：
 *   临安：laSaltDock（断桥跟到城东盐仓）→ la_ex_saltdock；laSaltSold（告发盐仓）→ rd_ex_jn_tianying；
 *         seaWreckChart（码头的船板）→ 灵蛇岛 ls_ex_wreck；laTideInvite（帮弄潮儿补船）→ 八月踏潮；zhouTold（茶楼里说出周芷若）→ rd_ex_xn_emei。
 *   灵蛇岛：lsDaiLetter（蛇窟里的信）→ 给金花婆婆或小昭；lsHanGrave / lsGraveSwept / lsGraveRobbed（礁上的坟）→ ls_ex_hanstory；
 *         wreckLooted（沉船）→ 波斯船；lsChain（小昭的铁链）→ 托波斯船捎去。
 *   冰火岛：bhWallScript / bhRubbing（张翠山的石洞）→ 武当张三丰；bhOldShip（冻在冰里的旧船）→ 海上风浪。
 *   路上：rdWithLiupai / rdWarnedMing → 逃散的明教教众；savedMjFugitives / soldMjFugitives、fedRefugees / reportedPreacher、
 *         rdFreedConscripts（mongolFriend 帮你放人）→ 137 年的义军；foughtWithYijun / yijunDonor → 元军搜人；
 *         mabangFriend → 山寨猎手；readWfLetter → 武当报信；toldBosiWay → 人去岛空的灵蛇岛；taihuBeaten → 运河丝船。 */
(function () {
  'use strict';
  const QX = window.QX;
  const season = (g) => (g.m >= 3 && g.m <= 5 ? 'spring' : g.m >= 6 && g.m <= 8 ? 'summer' : g.m >= 9 && g.m <= 11 ? 'autumn' : 'winter');
  const tide = (g) => g.m >= 7 && g.m <= 9;

  QX.addEnemies({
    jn_shuifei: { name: '太湖水匪', hp: 75, atk: 15, def: 4, agi: 14, moves: [['分水刺', 1], ['撒网', 1.1]], xp: 10, silver: [4, 12], scale: 28 },
    sea_haikou: { name: '海寇', hp: 90, atk: 17, def: 5, agi: 13, moves: [['鬼头刀', 1.1], ['跳帮', 1]], xp: 14, silver: [6, 16], scale: 32 },
    sea_haikoutou: { name: '独眼海寇', hp: 170, atk: 25, def: 9, agi: 14, moves: [['双刀', 1.2], ['铁锚', 1.3]], xp: 32, silver: [20, 50], scale: 46, drops: [['jinchuang', 0.4]] },
    xn_lieshou: { name: '山寨猎手', hp: 70, atk: 16, def: 4, agi: 16, moves: [['毒箭', 1, 'poison'], ['柴刀', 1.1]], xp: 10, silver: [0, 4], scale: 28 },
  });

  QX.addFlags({
    zhouTold: '你在临安茶楼当众说出了灵蛇岛那夜的人', lsGraveSwept: '你给灵蛇岛礁上的银叶先生拔过坟草', bhWallTold: '你把冰火岛石洞里的字带给了张三丰',
    savedMjFugitives: '你在西域救过逃散的明教教众', soldMjFugitives: '你把逃散的明教教众交给了官府', rdFreedConscripts: '你放走过一串被元军拉夫的汉子',
    foughtWithYijun: '你跟明教义军一起打过元军的寨子', xzChainSent: '你托波斯船把小昭的铁链捎回了波斯', wreckReturned: '你把沉船里的波斯金币还给了波斯人',
  });

  /* ---------- 临安 ---------- */
  QX.addEvents([
    { id: 'la_ex_lotus', loc: 'lintan', explore: 'lintan', w: 3, t: '断桥', cond: (g) => g.before(136, 1) && !g.f('laSaltDock'),
      text: '夜里你在断桥边乘凉。一条小船贴着桥洞过来，船头的人往岸上一个挑担的手里塞了个蜡丸。挑担的低着头，往城东去了。',
      choices: [
        { t: '远远跟上去', check: ['轻功', '中'], fx: (g) => g.set('laSaltDock'), res: '他进了城东一座盐仓。守门的几个人，手背上都刺着一只鹰。',
          fail: { res: '他拐了几个弯，钻进巷子就不见了。' } },
        { t: '上前拦住他', fight: { foes: [{ id: 'mjdizi', name: '挑担的汉子' }], win: { fx: (g) => { g.set('laSaltDock'); g.add('品德', -1); }, res: '他倒在地上，担子里滚出几包盐。他咬着牙不说话，你在他腰牌上看见“城东”两个字。' },
          lose: { res: '他的扁担比刀还快。你醒来的时候，人和担子都不见了。' } } },
        { t: '不关你的事', res: '你回了客店。桥洞底下的水声响了一夜。' },
      ] },
    { id: 'la_ex_saltdock', loc: 'lintan', act: '去城东的盐仓', once: false, cond: (g) => g.f('laSaltDock') && !g.f('laSaltDone'), t: '盐仓',
      text: (g) => '盐仓里堆着一包一包的私盐，屋梁上挂着一面小旗，旗上是一只鹰。' + (g.f('tianyingFriend') ? '管事的认得你：“是替殷教主押过货的兄弟，进来坐。”' : '管事的把手按在刀上：“走错门了吧？”'),
      choices: [
        { t: '帮他们搬三天盐', fx: (g) => { g.set('laSaltDone'); g.days(3); g.add('银两', 15); g.like('yintianzheng', 8); if (g.before(134, 4)) g.set('tianyingFriend'); },
          res: '你扛了三天盐包，肩膀磨破了皮。管事的给了工钱，说要在教主面前提一提你。' },
        { t: '去衙门告发', fx: (g) => { g.set('laSaltDone'); g.set('laSaltSold'); g.add('银两', 40); g.add('品德', -8); g.like('yintianzheng', -20); },
          res: '第二天元兵封了盐仓，抓走了十几个人。衙门赏了你四十两。' },
        { t: '装作走错了门', res: '你退了出来。背后那几道目光，一直跟你到了街口。' },
      ] },
    { id: 'la_ex_wreck', loc: 'lintan', explore: 'lintan', w: 2, t: '船板', cond: (g) => !g.f('seaWreckChart'),
      text: '码头上几个渔夫围着一块刚捞上来的船板。木头是外国的，上面刻着弯弯曲曲的字。老渔夫说，前年有一条波斯大船在灵蛇岛外头沉了。',
      choices: [
        { t: '请老渔夫指个方位', cost: { 银两: 5 }, fx: (g) => g.set('seaWreckChart'), res: '他在你手心画了个圈：“灵蛇岛东边，退大潮的时候，能看见半截桅杆。”' },
        { t: '认认板上的字', check: ['资质', '中'], fx: (g) => g.set('seaWreckChart'), res: '你认出是波斯字，刻的是船名。板子背面有人用刀补刻了两个汉字：“岛东”。',
          fail: { res: '那些字像一条条小蛇，你一个也认不出。' } },
        { t: '看看就走', res: '渔夫们把船板劈了当柴烧。' },
      ] },
    { id: 'la_ex_tide', loc: 'lintan', explore: 'lintan', once: false, w: 2, t: '钱塘江',
      text: (g) => (tide(g) ? '八月前后，钱塘江的潮一天比一天大。江堤上挤满了人，几个弄潮儿光着膀子，手里举着红旗，站在潮头前面等。' : '江面很平。几个弄潮儿坐在堤下补船，说潮要到秋天才大。'),
      choices: [
        { t: '跟着弄潮儿去踏潮', cond: (g) => tide(g) && !g.f('laTideInvite'), check: ['轻功', '中'], fx: (g) => { if (!g.lv('dengping')) g.learn('dengping', 1); else g.add('轻功', 1); },
          res: '潮头像一堵白墙压过来。你踩着浪尖跑了十几步，翻身回到岸上，脚底下还是轻的。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '潮头把你拍进了江里。弄潮儿把你捞上来，你吐了半天的水，胸口一直疼。' } },
        { t: '叫上补过船的那个弄潮儿，一起下潮', cond: (g) => tide(g) && g.f('laTideInvite'), check: ['轻功', '易'], fx: (g) => { if (!g.lv('dengping')) g.learn('dengping', 1); else g.add('轻功', 1); },
          res: '他在前面领着，告诉你什么时候抬脚，什么时候伏身。你跟着他从潮头上踩了过去。', fail: { fx: (g) => g.hurt(30), res: '你慢了一步，被浪卷了一下。他一把把你拽了回来。' } },
        { t: '帮弄潮儿补两天船', cond: (g) => !tide(g), fx: (g) => { g.days(2); g.add('银两', 6); g.set('laTideInvite'); }, res: '你帮他们刷了两天桐油。领头的说，秋天潮大的时候来找他，带你下潮。' },
        { t: '站在堤上看', fx: (g) => g.restMp(30), res: '江风吹在脸上，你在堤上坐到了天黑。' },
      ] },
    { id: 'la_ex_sect', loc: 'lintan', explore: 'lintan', once: false, w: 2, t: '同门',
      text: (g) => ({
        quanzhen: '城门口有个全真道士在化缘，道袍上打着补丁。他说重阳宫在临安的下院缺灯油，师兄弟们三天没点灯了。',
        gaibang: '一个叫化子在巷口冲你比了个手势，是丐帮的暗号。他说临安分舵的两个兄弟被元人衙门抓了，说是偷了东西。',
        emei: '绸缎庄门口，两个峨嵋的师姐被几个元兵围着，元兵说她们的剑没有官府的文书。',
        mingjiao: g.before(134, 6) ? '茶楼里有人端着茶碗，用明教的暗语跟你搭话。他是天鹰教的人，问你光明顶上近来怎样。' : '茶楼里有人端着茶碗，用明教的暗语跟你搭话。他说张教主在淮北，各旗的兄弟都在往那边赶。',
      }[g.sect] || '武馆门口搭着擂台，馆主要招一个教头。谁打赢了馆里的师傅，月钱十两。'),
      choices: [
        { t: (g) => (g.sect === 'emei' ? '上前替师姐解围' : '去衙门后墙把人捞出来'), cond: (g) => g.sect === 'emei' || g.sect === 'gaibang',
          fight: { foes: ['yuanbing', 'yuanbing'], win: { fx: (g) => { g.addContrib(1); if (g.sect === 'emei') g.like('jingxuan', 5); else g.add('声望', 3); },
            res: (g) => (g.sect === 'emei' ? '元兵跑了。师姐收了剑，说回山会跟静玄师姐提你的名字。' : '你从后墙把两个兄弟背了出来。分舵的长老记了你一功。') },
          lose: { res: '元兵人多，你被打倒在街上。' } } },
        { t: (g) => (g.sect === 'quanzhen' ? '把身上的钱分他十两' : '对上暗语，把知道的说给他'), cond: (g) => (g.sect === 'quanzhen' && g.money() >= 10) || g.sect === 'mingjiao',
          fx: (g) => { g.addContrib(1); if (g.sect === 'quanzhen') { g.add('银两', -10); g.add('品德', 2); } else if (g.before(134, 6)) g.like('yintianzheng', 8); else g.like('zhangwuji', 5); },
          res: (g) => (g.sect === 'quanzhen' ? '道士打了个稽首。他说回山以后，会在功德簿上写你的名字。' : '他听完点点头，把茶钱一起付了：“兄弟的话，我带到。”') },
        { t: '上擂台露两手', cond: (g) => !g.sect, need: ['声望', 20],
          fight: { foes: [{ id: 'jianke', name: '武馆的师傅' }], win: { fx: (g) => { g.add('银两', 30); g.add('声望', 3); }, res: '馆主要请你留下，你没答应。他还是封了三十两的红包。' },
            lose: { res: '馆里的师傅拱拱手，把你扶下了台。' } } },
        { t: '走开', res: '你从人堆里挤了出去。' },
      ] },
    { id: 'la_ex_boatson', loc: 'lintan', explore: 'lintan', once: false, w: 2, t: '码头', cond: (g) => g.f('boatDone') && g.alive('laochuanfu'),
      text: (g) => (g.f('boatSonHome') ? '阿海在码头上撑起了渡船，老船夫坐在船头收钱。父子俩看见你，都站了起来。'
        : '老船夫一个人在补网。那块木牌挂在网上，背面又多刻了几道。' + (g.f('laBoatFund') ? '他说船钱快凑够了，开春就去接阿海。' : '')),
      choices: [
        { t: '请阿海带你去看桃花瓣漂来的那片海', cond: (g) => g.f('boatSonHome') && !g.known('taohua'), fx: (g) => { g.days(4); g.clue('taohua'); },
          res: '阿海把船撑到舟山东南，指着一排礁石说，这里的礁石排得古怪，老辈人都不敢靠近。礁石后面隐约有一片粉红。' },
        { t: '坐阿海的船游一回西湖', cond: (g) => g.f('boatSonHome'), fx: (g) => { g.heal(999); g.like('laochuanfu', 5); }, res: '阿海不收你的钱。老船夫在船尾温了一壶酒。' },
        { t: '给老船夫二十两，凑接儿子的船钱', cond: (g) => !g.f('boatSonHome') && !g.f('laBoatFund'), cost: { 银两: 20 }, fx: (g) => { g.set('laBoatFund'); g.like('laochuanfu', 15); g.add('品德', 3); },
          res: '老船夫推了几回，最后收下了。他把银子包在油布里，压在了木牌底下。' },
        { t: '跟他说几句话就走', fx: (g) => g.like('laochuanfu', 2), res: '他说今年的鱼少，又说起北边的海。' },
      ] },
    { id: 'la_ex_shuoshu', loc: 'lintan', explore: 'lintan', w: 3, t: '茶楼', cond: (g) => g.after(135, 7) && g.alive('shuoshu'),
      text: (g) => '茶楼里说书先生一拍醒木，讲的是灵蛇岛上的事。'
        + (g.f('xiaozhaoStays') ? '他说有个无名小卒跟三个波斯使者斗了一场，小昭姑娘才没被带走。底下有人往你这边看。' : '他说小昭姑娘为了救众人，随船去了波斯。讲到这里，底下几个妇人抹起了眼泪。')
        + '他又说倚天剑、屠龙刀一夜之间都没了，是赵郡主偷的。'
        + (g.f('xiexunAngry') ? '最后他讲到冰火岛，说有个年轻人抢了狮王的刀。茶客们骂了一声，你低头喝茶。' : ''),
      choices: [
        { t: '站起来，说出那一夜你看见的人', cond: (g) => g.f('knowZhouSecret'), fx: (g) => { g.set('zhouTold'); g.add('声望', 5); g.like('zhouzhiruo', -15); },
          res: '茶楼里一下子静了。说书先生的醒木停在半空。第二天，半个临安都在传峨嵋的周掌门。' },
        { t: '上去补几句那天的事', cond: (g) => g.f('xiaozhaoStays'), fx: (g) => { g.add('声望', 6); g.like('shuoshu', 10); }, res: '说书先生把你请到台上，让你从头讲。你讲完，茶客们把茶碗敲得叮当响。' },
        { t: '赏他几个钱', cost: { 银两: 2 }, fx: (g) => g.like('shuoshu', 5), res: '说书先生冲你拱了拱手，下一段讲得格外卖力。' },
        { t: '起身走了', res: '你走到街上，身后又响起了醒木。' },
      ] },
  ]);

  /* ---------- 灵蛇岛 ---------- */
  QX.addEvents([
    { id: 'ls_ex_cave', loc: 'lingshe', explore: 'lingshe', w: 3, t: '蛇窟', cond: (g) => !g.f('lsDaiLetter'),
      text: (g) => '岛西头的山洞里养着成百条蛇，一股腥气。洞底有一只樟木箱子，锁已经锈了。' + (g.here('jinhua') ? '半山木屋里的咳嗽声，一阵一阵传过来。' : ''),
      choices: [
        { t: '躲着蛇，摸过去撬开箱子', check: ['轻功', '中'], fx: (g) => g.set('lsDaiLetter'),
          res: '箱子里是一件紫色的旧衫子，叠得整整齐齐。底下压着一封信，一半是波斯字，一半是汉字，开头写着“我的女儿”。',
          fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '一条蛇从箱子后面窜出来，咬在你手腕上。你逃出洞口，整条胳膊都麻了。' } },
        { t: '刮几管蛇毒带走', fx: (g) => g.give('jiedu', 1), res: '你照药铺里学的法子，拿蛇毒配了一颗解毒丹。' },
        { t: '退出来', res: '你退出洞口，蛇没有跟出来。' },
      ] },
    { id: 'ls_ex_letter_jinhua', who: 'jinhua', act: '把樟木箱里的信还给她', cond: (g) => g.f('lsDaiLetter') && !g.f('daiLetterDone'), t: '旧信',
      text: '金花婆婆看见那封信，拐杖一下子攥紧了。她盯着你，咳嗽也停了。',
      choices: [
        { t: '双手递过去，什么也不问', fx: (g) => { g.set('daiLetterDone'); g.like('jinhua', 15); g.give('jiedu', 2); },
          res: '她把信揣进怀里，过了很久才说：“这信本来就送不出去。”她塞给你两颗解毒丹，转身回了屋。' },
        { t: '问她信里的女儿是谁', check: ['资质', '中'], fx: (g) => { g.set('daiLetterDone'); g.set('knowXiaozhaoMother'); g.set('jinhuaKnown'); g.like('jinhua', 5); },
          res: '她的腰慢慢直了起来，眼神像变了一个人。“她在光明顶上，叫小昭。”她说完这句，又弯下了腰。',
          fail: { fx: (g) => { g.set('daiLetterDone'); g.like('jinhua', -10); g.hurt(30); }, res: '一朵金花擦着你的耳朵飞过去，钉在门框上。“不该问的，别问。”' } },
      ] },
    { id: 'ls_ex_letter_xz', who: 'xiaozhao', act: '把灵蛇岛找到的信给她看', cond: (g) => g.f('lsDaiLetter') && !g.f('daiLetterDone') && g.alive('xiaozhao'), t: '旧信',
      text: '小昭认出了信上的波斯字，脸一下子白了。她伸出手，又缩了回去。',
      choices: [
        { t: '把信交给她', fx: (g) => { g.set('daiLetterDone'); g.set('knowXiaozhaoMother'); g.like('xiaozhao', 20); },
          res: '她把信贴在心口：“是我娘的字。”她求你别跟别人说，你点了头。' },
        { t: '收起来，说是认错了', fx: (g) => g.like('xiaozhao', -5), res: '你把信收了回去。小昭低着头，没有再问。' },
      ] },
    { id: 'ls_ex_islet', loc: 'lingshe', explore: 'lingshe', w: 2, t: '沙路', cond: (g) => !g.f('lsHanGrave'),
      text: '大退潮，岛东边露出一条沙路，通到一块小礁上。礁上有一座石坟，碑上刻着“银叶先生韩千叶之墓”。坟头的草有人拔过，那是很久以前了。',
      choices: [
        { t: '把坟上的草拔干净再走', fx: (g) => { g.set('lsHanGrave'); g.set('lsGraveSwept'); g.days(1); g.add('品德', 2); }, res: '你拔完草，潮水已经涨到了脚边。你蹚着水跑回来，衣裳湿到了腰。' },
        { t: '记下碑文就回', fx: (g) => g.set('lsHanGrave'), res: '你把碑上的字念了两遍，赶在涨潮前回了岛。' },
        { t: '翻翻坟边有没有陪葬', need: ['品德', '<', 35], fx: (g) => { g.set('lsHanGrave'); g.set('lsGraveRobbed'); g.add('银两', 15); g.add('品德', -5); }, res: '你在碑座底下摸到一个银叶子做的簪子，拿去换了十五两。' },
      ] },
    { id: 'ls_ex_hanstory', who: 'jinhua', act: '问她礁上那座坟', cond: (g) => g.f('lsHanGrave') && !g.f('hanStoryDone'), t: '银叶先生',
      text: (g) => (g.f('lsGraveRobbed') ? '金花婆婆的拐杖顿在地上：“礁上的坟，是你动的？”' : '金花婆婆半天没出声。海风把她的白头发吹乱了。'),
      choices: [
        { t: '说你替他拔过草', cond: (g) => g.f('lsGraveSwept'), fx: (g) => { g.set('hanStoryDone'); g.like('jinhua', 20); g.give('jiedu', 1); },
          res: '她说银叶先生是病死的。那年她求一个大夫救他，大夫说他是明教的仇人，不肯治。她说完这些，把一颗解毒丹放在你手里。' },
        { t: '只问坟里是谁', cond: (g) => !g.f('lsGraveSwept') && !g.f('lsGraveRobbed'), fx: (g) => { g.set('hanStoryDone'); g.like('jinhua', 5); }, res: '“我丈夫。”她只说了这三个字。' },
        { t: '认了，把钱赔给她', cond: (g) => g.f('lsGraveRobbed'), fx: (g) => { g.set('hanStoryDone'); g.add('银两', -Math.min(15, g.money())); g.like('jinhua', -5); }, res: '她把银子扔进了海里：“他用不着你的钱。滚。”' },
        { t: '抵赖', cond: (g) => g.f('lsGraveRobbed'), fight: { foes: ['jinhua'], win: { fx: (g) => { g.set('hanStoryDone'); g.add('品德', -3); g.like('jinhua', -20); }, res: '她退到礁石上，冷冷地看着你，没再追。' },
          lose: { fx: (g) => { g.set('hanStoryDone'); g.like('jinhua', -15); }, res: '金花打在你的膝盖上。你被扔回了船上。' } } },
      ] },
    { id: 'ls_ex_wreck', loc: 'lingshe', explore: 'lingshe', w: 4, t: '沉船', cond: (g) => g.f('seaWreckChart') && !g.f('wreckLooted'),
      text: '退大潮的时候，岛东边的海里露出半截桅杆，跟临安老渔夫说的一样。',
      choices: [
        { t: '一口气潜下去', check: ['根骨', '中'], fx: (g) => { g.set('wreckLooted'); g.add('银两', 40); g.give('jiedu', 2); },
          res: '舱里有一只铜箱，装着波斯金币和两瓶药。你抱着箱子浮上来，眼前全是金星。', fail: { fx: (g) => { g.hurt(50); g.injure(1); }, res: '舱门口有一股暗流，把你卷了出来。你浮上来，耳朵里嗡嗡响了好几天。' } },
        { t: '运起内力闭气，慢慢摸进船舱', cost: { 内力: 25 }, check: ['根骨', '中', 20], fx: (g) => { g.set('wreckLooted'); g.add('银两', 40); g.give('jiedu', 2); },
          res: '内力护着心口，你不慌不忙地摸进了舱。铜箱里是波斯金币和两瓶药。', fail: { fx: (g) => g.hurt(30), res: '舱里太黑，你摸了一圈什么也没找到，只好上来。' } },
        { t: '不去碰沉船', fx: (g) => g.add('品德', 1), res: '船上的人都死在下面了。你在岸上站了一会儿。' },
      ] },
    { id: 'ls_ex_season', loc: 'lingshe', explore: 'lingshe', once: false, w: 2, t: '海风',
      text: (g) => ({
        spring: '开春了，蛇都出了洞。礁石上、树杈上，到处挂着蜕下来的蛇皮。',
        summer: '天边的云压得很低，海鸟一群一群往岛里飞。岛上的人说，台风要来了。',
        autumn: '秋天的海鸟从北边飞来，在岛上歇一夜，第二天往西南飞走。',
        winter: '北风刮了三天，海面是灰的，船都不敢出。',
      }[season(g)]),
      choices: [
        { t: (g) => ({ spring: '收一些蛇蜕', summer: '帮岛上的人把船拖上高处', autumn: '跟着海鸟看潮水往哪边去', winter: '在背风的石洞里打坐' }[season(g)]),
          cond: (g) => season(g) !== 'autumn' || !g.known('taohua'),
          fx: (g) => { const s = season(g); if (s === 'spring') g.give('jiedu', 1); else if (s === 'summer') { g.hurt(20); if (g.here('jinhua')) g.like('jinhua', 8); } else if (s === 'autumn') g.clue('taohua'); else { g.restMp(999); g.add('内力', 0.5); } },
          res: (g) => ({ spring: '蛇蜕能入药。你配了一颗解毒丹。', summer: '你和岛上的哑仆拖了半夜的船，手掌磨出了血。台风过去，金花婆婆让人给你送了一碗鱼汤。',
            autumn: '海鸟落脚的地方，有一片礁石上开着桃花。那座岛离这里不远。', winter: '风在洞口呜呜地叫，你坐了一天一夜，心里很静。' }[season(g)]) },
        { t: '下海摸鲍鱼', check: ['根骨', '易'], fx: (g) => g.add('银两', 10), res: '你摸了半篓鲍鱼，回到临安能卖十两。', fail: { fx: (g) => g.hurt(30), res: '礁石把你的手划得全是口子。' } },
        { t: '躲进木屋歇着', fx: (g) => g.heal(999), res: '你睡了一大觉，醒来浑身松快。' },
      ] },
    { id: 'ls_ex_sect', loc: 'lingshe', explore: 'lingshe', w: 2, t: '岸边的人',
      cond: (g) => g.sect === 'emei' || g.sect === 'mingjiao' || (g.sect === 'gaibang' && g.after(135, 5) && g.before(135, 9)),
      text: (g) => ({
        emei: '两个峨嵋的师姐划着小船上了岛。她们说师父交代过，金花婆婆跟峨嵋有旧账，要来看看她的底细。',
        mingjiao: '礁石上刻着一个火焰的记号，是明教的暗记，旁边还有几行波斯字。刻痕很旧了。',
        gaibang: '礁石后面趴着两个丐帮弟子。他们说掌钵龙头派他们来盯着金毛狮王，一有动静就回去报信。',
      }[g.sect]),
      choices: [
        { t: (g) => ({ emei: '给师姐带路去木屋', mingjiao: '照教里的规矩，在旁边回一个记号', gaibang: '帮他们盯梢' }[g.sect]),
          fx: (g) => { g.addContrib(1); if (g.sect === 'emei') { g.like('jinhua', -15); g.like('jingxuan', 5); } else if (g.sect === 'mingjiao') g.like('jinhua', 10); else g.like('xiexun', -10); },
          res: (g) => ({ emei: '两个师姐摸到木屋外，看了半夜。回去的时候，她们说要把你的名字报给师父。', mingjiao: '第二天，你回的那个记号旁边多了一朵刻上去的小金花。',
            gaibang: '你们轮着盯了三天。谢逊在崖上坐了三天，一动也没动。' }[g.sect]) },
        { t: (g) => ({ emei: '说婆婆不在岛上，劝她们回去', mingjiao: '把暗记的事报给光明顶', gaibang: '去提醒谢逊' }[g.sect]),
          fx: (g) => { if (g.sect === 'emei') { g.addContrib(-1); g.like('jinhua', 5); } else if (g.sect === 'mingjiao') { g.addContrib(2); g.like('jinhua', -10); } else { g.addContrib(-1); g.like('xiexun', 10); } },
          res: (g) => ({ emei: '师姐们将信将疑地走了。半山的木屋里，有人咳了一声。', mingjiao: '光明顶回了信，说紫衫龙王当年叛教出走，叫你离她远一点。',
            gaibang: '谢逊听完，只说了一句：“丐帮的人，鼻子倒灵。”' }[g.sect]) },
        { t: '不管这事', res: '你转身走开了。' },
      ] },
    { id: 'ls_ex_xiexun', loc: 'lingshe', explore: 'lingshe', w: 3, t: '崖边', cond: (g) => g.here('xiexun') && g.alive('xiexun') && (g.f('xiexunTrust') || g.f('xiexunAngry')),
      text: (g) => (g.f('xiexunAngry') ? '谢逊坐在崖边。你的脚步一响，他就转过头来：“冰火岛上抢刀的，是你。”' : '谢逊坐在崖边吹海风。听见你的脚步，他拍了拍身边的石头。'),
      choices: [
        { t: '跪下认错', cond: (g) => g.f('xiexunAngry'), need: ['品德', 40], fx: (g) => { g.like('xiexun', 20); g.add('品德', 3); }, res: '谢逊听你说完，半天才哼了一声：“刀在谁手里，都一样。起来吧。”' },
        { t: '他已经扑过来了', cond: (g) => g.f('xiexunAngry'), fight: { foes: ['xiexun'], win: { fx: (g) => { g.add('声望', 5); g.like('xiexun', -10); }, res: '谢逊退了两步，喘着气笑了：“好小子。”他没再动手。' },
          lose: { fx: (g) => g.injure(1), res: '他一拳打在你胸口。你滚下崖边的沙坡，爬了半天才起来。' } } },
        { t: '陪他坐到天亮', cond: (g) => g.f('xiexunTrust') && !g.f('xiexunAngry'), fx: (g) => { g.like('xiexun', 10); g.restMp(999); },
          res: (g) => (g.f('knowChengkun') && !g.f('xiexunTold') ? '他问起成昆。你说那人在少林做了和尚，他的手在石头上抓出了五道印子。' : '他讲了很多冰火岛上的事，讲他那个义子小时候怎么拔他的胡子。') },
        { t: '悄悄走开', res: '海浪声盖住了你的脚步。' },
      ] },
    { id: 'ls_ex_after', loc: 'lingshe', explore: 'lingshe', w: 3, t: '人去岛空', cond: (g) => g.after(135, 8),
      text: (g) => '灵蛇岛上没有人了。木屋的门开着，灶是冷的。'
        + (g.f('toldBosiWay') ? '你想起来，那条波斯船是你给指的路。' : '')
        + (g.f('xiaozhaoGone') ? '码头边的礁石上丢着一段铁链，是小昭脚上那一副，被人用利器削断了。' : '')
        + (g.f('knowZhouSecret') && g.alive('yinli') ? '后山的沙地上有一个新坟，土翻开了，坟里是空的。木牌上写着“殷离”。' : ''),
      choices: [
        { t: '把那段铁链收起来', cond: (g) => g.f('xiaozhaoGone'), fx: (g) => g.set('lsChain'), res: '铁链很沉。你用布包好，放进了包袱。' },
        { t: '顺着沙上的脚印走', cond: (g) => g.f('knowZhouSecret') && g.alive('yinli'), fx: (g) => g.like('yinli', 10), res: '脚印歪歪扭扭，一直走到海边。坟里的人是自己爬出来的。你在海边站了很久，替她松了口气。' },
        { t: '把木屋里剩下的药收走', fx: (g) => g.give('jiedu', 2), res: '药柜里还有两颗解毒丹，是金花婆婆配的。' },
        { t: '在木屋里住一夜', fx: (g) => g.heal(999), res: '夜里只有海浪的声音。' },
      ] },
  ]);

  /* ---------- 冰火岛 ---------- */
  QX.addEvents([
    { id: 'bh_ex_cave', loc: 'binghuo', explore: 'binghuo', w: 3, t: '石洞', cond: (g) => !g.f('bhWallScript'),
      text: '火山背面有个石洞，洞口用石头垒过。里面有石床、石灶，墙上刻着字，一笔一画，像是教小孩认字。墙角刻着一道一道的横线，越往上越高，旁边刻着“无忌”。',
      choices: [
        { t: '用炭灰把墙上的字拓下来', check: ['资质', '易'], fx: (g) => { g.set('bhWallScript'); g.set('bhRubbing'); },
          res: '你把衣襟撕下一块，拓了一整面墙。字写得很好，笔笔像银钩，落款是“翠山”。', fail: { fx: (g) => g.set('bhWallScript'), res: '炭灰糊成了一片，你只记住了落款，是“翠山”两个字。' } },
        { t: '只看看就走', fx: (g) => g.set('bhWallScript'), res: '你在墙角那几道横线前站了很久。一个孩子在这里长到了十岁。' },
        { t: '在石床上歇一夜', fx: (g) => g.heal(999), res: '石床被火山烘得温温的。你睡得很沉。' },
      ] },
    { id: 'bh_ex_zsf_wall', who: 'zhangsanfeng', act: '说起冰火岛的石洞', cond: (g) => g.f('bhWallScript') && !g.f('bhWallTold') && g.alive('zhangsanfeng'), t: '翠山',
      text: '你说到石洞墙角那一道道刻痕，张三丰手里的拂尘停住了。',
      choices: [
        { t: '把拓下来的字给他', cond: (g) => g.f('bhRubbing'), fx: (g) => { g.set('bhWallTold'); g.like('zhangsanfeng', 20); g.add('品德', 2); g.add('声望', 5); },
          res: '张三丰把拓片铺在桌上，看了很久。他说翠山这孩子的字，到了海外反倒写开了。他让道童把拓片收进了自己的屋里。' },
        { t: '把看见的说给他听', fx: (g) => { g.set('bhWallTold'); g.like('zhangsanfeng', 10); }, res: '张三丰听完，只说了一句：“无忌那孩子，十岁以前是在那里长大的。”' },
      ] },
    { id: 'bh_ex_ship', loc: 'binghuo', explore: 'binghuo', w: 2, t: '旧船', cond: (g) => !g.f('bhOldShip'),
      text: '冰原边上冻着半条旧船，桅杆斜插在冰里。船头挂着一面烂旗，上面绣着一条鲸鱼。',
      choices: [
        { t: '劈开冰，钻进船舱', check: ['根骨', '中'], fx: (g) => { g.set('bhOldShip'); g.add('银两', 25); },
          res: '舱里冻着几只箱子，有一箱碎银子。舵台上压着一本航海日志，记着北海的风和云。', fail: { fx: (g) => g.hurt(40), res: '冰太硬，你劈得虎口开裂，只好作罢。' } },
        { t: '只在船外头翻翻', fx: (g) => g.set('bhOldShip'), res: '船帮上挂着一个油布包，里面是一本航海日志，记着北海什么样的云要起风。' },
        { t: '不去打扰船上的人', fx: (g) => g.add('品德', 1), res: '你对着那条船拜了一拜，走开了。' },
      ] },
    { id: 'bh_ex_aurora', loc: 'binghuo', explore: 'binghuo', once: false, w: 2, t: '天光',
      text: (g) => (g.m >= 11 || g.m <= 2 ? '极北的冬天，太阳整天不出来。半夜里，天上挂着一片绿光，像有人在天上抖一块绸子。'
        : g.m >= 5 && g.m <= 8 ? '到了夏天，太阳整夜不落。冰化了一些，海豹趴在岸边晒太阳。' : '海上的冰正在裂开，一夜一夜咔咔地响。'),
      choices: [
        { t: '对着那片光打坐', cond: (g) => g.m >= 11 || g.m <= 2, check: ['根骨', '中'],
          fx: (g) => { const id = Object.keys(g.S.arts).find((x) => QX.ARTS[x].type === '内功' && QX.atGate(x)); if (id) g.breakGate(id, '：冰火岛的极光底下，真气自己走过了关口'); else g.add('内力', 2); },
          res: '冷气从脚底往上爬，火山的热从背后烘过来。一夜下来，丹田里那股气粗了一圈。', fail: { fx: (g) => { g.injure(1); g.hurt(30); }, res: '寒气钻进了骨头。你冻得受了内伤，爬回火山脚下才缓过来。' } },
        { t: '下海边捉海豹', cond: (g) => g.m >= 5 && g.m <= 8, fight: { foes: [{ id: 'lang', name: '海豹', k: 1.5 }], win: { fx: (g) => { g.add('银两', 12); g.give('jinchuang', 1); }, res: '海豹油熬成膏，能抹伤口。皮子拿回中原也值几两银子。' },
          lose: { res: '海豹比看上去凶，一尾巴把你拍进了冰水里。' } } },
        { t: '踩着浮冰去对岸看看', cond: (g) => !(g.m >= 11 || g.m <= 2) && !(g.m >= 5 && g.m <= 8), check: ['轻功', '中'], fx: (g) => g.add('银两', 20),
          res: '对岸的冰里冻着一根长长的海象牙。你把它敲了下来。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '浮冰翻了，你掉进了海里。爬上来的时候，眉毛都结了冰。' } },
        { t: '回火山脚下烤火', fx: (g) => g.heal(999), res: '你烤着火，听冰原上的风。' },
      ] },
    { id: 'bh_ex_lion', loc: 'binghuo', explore: 'binghuo', w: 3, t: '长啸', cond: (g) => g.here('xiexun') && g.alive('xiexun') && !g.f('xiexunAngry'),
      text: '黄昏，谢逊站在冰崖上，对着海一声长啸。崖边的冰一块一块往下掉，你耳朵里嗡嗡作响。',
      choices: [
        { t: '高声报上自己是明教弟子', cond: (g) => g.sect === 'mingjiao', fx: (g) => g.like('xiexun', 15), res: '啸声停了。谢逊转过身来：“教里还有人记得金毛狮王。”他问了半天光明顶上的事。' },
        { t: '运起内力抵住啸声', check: ['根骨', '难'], fx: (g) => { g.add('内力', 2); g.like('xiexun', 5); },
          res: '你咬着牙站着，一步也没退。谢逊停下来，说了一声：“好定力。”', fail: { fx: (g) => { g.injure(1); g.hurt(40); }, res: '你眼前一黑，坐倒在冰上。胸口闷了好几天。' } },
        { t: '捂住耳朵跑回火山那边', fx: (g) => g.hurt(15), res: '你跑到火山脚下，耳朵还在响。' },
      ] },
    { id: 'bh_ex_empty', loc: 'binghuo', explore: 'binghuo', w: 3, t: '空屋', cond: (g) => g.after(135, 5),
      text: (g) => '谢逊的石屋空了。熊皮褥子还铺在石床上，炉子里的灰是冷的。'
        + (g.f('xiexunTold') ? '石壁上用刀刻着两个大字：少林。' : g.f('xiexunTrust') ? '石桌上压着一块石板，刻满了拳诀，底下刻着你的名字。' : '')
        + (g.f('xiexunAngry') ? '屋外的冰上还有一片发黑的血迹，是那天留下的。' : ''),
      choices: [
        { t: '收下石板上的拳诀', cond: (g) => g.f('xiexunTrust') && !g.f('xiexunTold') && !g.lv('qishang') && !g.has('qishang_pu'), fx: (g) => g.give('qishang_pu'),
          res: '是七伤拳。石板边上还刻着一行小字：内功不够，别练。' },
        { t: '在那片血迹前站一会儿', cond: (g) => g.f('xiexunAngry'), fx: (g) => { g.add('品德', 3); g.like('xiexun', 5); }, res: '你站了很久。风把血迹上的雪吹开，又盖上。' },
        { t: '翻翻屋里剩下的东西', fx: (g) => g.give('renshen', 1), res: '墙洞里有一只旧药箱，是当年张五侠夫妇留下的。里面还剩一支老山参。' },
        { t: '在石床上睡一夜', fx: (g) => { g.heal(999); g.restMp(999); }, res: '熊皮褥子很暖。你梦见有人在冰原上喊一个孩子的名字。' },
      ] },
    { id: 'bh_ex_ahai', loc: 'binghuo', explore: 'binghuo', w: 3, t: '阿海', cond: (g) => g.f('boatSonHome'),
      text: '这一趟是阿海撑船送你来的。他在岸边升了一堆火，望着海面：“冰一封海，船就出不去了。最多再等五天。”',
      choices: [
        { t: '听他的，马上走', fx: (g) => { g.move('lintan'); g.days(15); g.like('laochuanfu', 3); }, res: '你们赶在封海前出了冰原。半个月后，船靠上了临安的码头，老船夫在岸上等着。' },
        { t: '再留几天，在冰上练功', check: ['根骨', '中'], fx: (g) => g.add('内力', 2), res: '你在冰上站了五天桩。阿海说你是他见过最不怕冷的人。', fail: { fx: (g) => { g.injure(1); g.hurt(40); }, res: '第三天你冻伤了，是阿海把你背上的船。' } },
        { t: '让他把带来的米和药留下，自己先回', fx: (g) => { g.give('jinchuang', 2); g.like('laochuanfu', 5); }, res: '阿海不放心，还是走了。他说开春一定来接你，要你千万别死在这里。' },
      ] },
  ]);

  /* ---------- 路上的遭遇：西域 ---------- */
  QX.addEvents([
    { id: 'rd_ex_xy_liupai', road: ['xiyu'], w: 3, from: [133, 10], to: [134, 4], t: '六大派的营帐',
      text: (g) => '玉门关外的戈壁上扎着一片营帐，旗子上写着少林、武当、峨嵋、昆仑、崆峒、华山。六大派要西上光明顶。'
        + (g.sect === 'emei' ? '峨嵋的帐篷前，一个师姐看见了你：“你也来了？跟着走。”' : g.sect === 'mingjiao' ? '你赶紧把衣襟掩上，盖住了胸口的火焰纹。' : '巡营的弟子拦住你，问你是哪一派的。'),
      choices: [
        { t: '跟着他们走一程，帮着探路', need: ['品德', 50], fx: (g) => { g.set('rdWithLiupai'); g.add('声望', 3); if (g.sect === 'emei') g.addContrib(1); },
          res: '你带着一队昆仑弟子找到了水源。领头的说，到了光明顶，记你一功。' },
        { t: '连夜去光明顶报信', cond: (g) => g.sect === 'mingjiao' || g.f('helpedMing'), fx: (g) => { g.set('rdWarnedMing'); g.days(2); g.like('yangxiao', 10); },
          res: '你骑着骆驼跑了两夜。光明顶上的人听完，脸色都变了。' },
        { t: '绕开营地走', fx: (g) => g.days(3), res: '你多走了三天。夜里回头看，营火连成了一片。' },
      ] },
    { id: 'rd_ex_xy_fugitive', road: ['xiyu'], w: 3, from: [134, 6], to: [134, 12], t: '山沟里的人',
      text: (g) => '山沟里躲着几个明教教众，身上带着刀伤。光明顶那一仗以后，他们跟旗里的人走散了，正往东边老家去。'
        + (g.f('rdWarnedMing') ? '领头的认出了你：“是你连夜来报的信。”' : g.f('rdWithLiupai') ? '有人认出了你：“六大派营里那个带路的，就是他！”' : ''),
      choices: [
        { t: '他们拔刀了', cond: (g) => g.f('rdWithLiupai') && !g.f('rdWarnedMing'), fight: { foes: ['mjdizi', 'mjdizi'], win: { fx: (g) => g.add('声望', 2), res: '他们丢下刀，互相扶着跑了。' },
          lose: { res: '你被砍倒在山沟里，他们没有要你的命。' } } },
        { t: '把金创药分给他们', cost: { item: 'jinchuang' }, fx: (g) => { g.set('savedMjFugitives'); g.add('品德', 4); }, res: '一个年轻人咬着布条让你上药。临走，他问了你的名字。' },
        { t: '带他们绕过官道上的卡子', check: ['资质', '中'], fx: (g) => { g.set('savedMjFugitives'); g.add('品德', 3); }, res: '你领着他们走了两夜的小路。分手的时候，他们朝你抱了抱拳。',
          fail: { fx: (g) => g.hurt(30), res: '你们撞上了元兵的马队，各自逃散了。' } },
        { t: '去附近的卡子报官', need: ['品德', '<', 40], fx: (g) => { g.set('soldMjFugitives'); g.add('银两', 30); g.add('品德', -10); }, res: '元兵把他们一串拴走了。领赏的时候，你没敢看他们的脸。' },
      ] },
    { id: 'rd_ex_xy_sand', road: ['xiyu'], once: false, w: 2, t: '风沙',
      text: '戈壁上起了风沙，天一下子黄了。远处有一支胡商的驼队，正往一个土墩后面躲。',
      choices: [
        { t: '跟着驼队躲风', fx: (g) => { g.days(2); g.heal(60); }, res: '风刮了两天才停。胡商分给你一块馕和一把葡萄干。' },
        { t: '顶着风赶路', check: ['根骨', '中'], res: '你用布蒙着脸，一步一步走了出去。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '你迷了路，在沙窝里躺了一夜，喉咙里全是沙子。' } },
        { t: '帮胡商把跑散的骆驼找回来', check: ['轻功', '易'], fx: (g) => { g.give('renshen', 1); g.add('品德', 1); }, res: '你在沙梁后面找到了那峰骆驼。胡商谢了你一支雪参。', fail: { fx: (g) => g.days(2), res: '你找了两天，骆驼的影子也没见着。' } },
      ] },
    { id: 'rd_ex_xy_capture', road: ['xiyu', 'zhongyuan'], w: 3, from: [134, 6], to: [134, 7], t: '茶棚',
      text: '六大派从西域回来，队伍拖了好几里。路边的茶棚里坐着几个穿汉人衣裳的番僧，眼睛一直盯着队伍。有人给他们递了个纸包，纸包里有股甜香。',
      choices: [
        { t: '去提醒六大派', need: ['品德', 55], fx: (g) => { g.like('songyuanqiao', 10); g.add('声望', 2); }, res: '武当的宋大侠谢了你，别派的人笑你多事。三天以后，你听说六大派的人在路上一个一个不见了。' },
        { t: '收番僧的银子，替他们打听各派在哪里歇脚', fx: (g) => { g.set('servedWang'); g.add('银两', 40); g.add('品德', -8); g.like('zhaomin', 5); }, res: '番僧给了四十两。他们说，郡主会记得你。' },
        { t: '不管闲事', res: '你喝完茶，往别处去了。' },
      ] },
  ]);

  /* ---------- 路上的遭遇：江南水路、出海 ---------- */
  QX.addEvents([
    { id: 'rd_ex_jn_canal', road: ['jiangnan'], sea: false, once: false, w: 2, t: '太湖', cond: (g) => !g.f('taihuBeaten'),
      text: '船走到太湖边上，芦苇里撑出几条小船，船上的人拿着分水刺。“船上的，留下货钱！”',
      choices: [
        { t: '跟他们打', fight: { foes: ['jn_shuifei', 'jn_shuifei'], win: { fx: (g) => { g.set('taihuBeaten'); g.add('声望', 3); }, res: '你把两个水匪打下了水。他们游回芦苇里，再也没出来。' },
          lose: { res: '你被一网罩住，按在了船板上。' } } },
        { t: '让船家交钱', fx: (g) => g.rob(0.25, 40), res: '船家掏了钱，又找你分摊。水匪的船钻回了芦苇。' },
        { t: '跳下水游走', check: ['轻功', '易'], res: '你从船尾溜下水，游到了对岸。', fail: { fx: (g) => { g.hurt(30); g.rob(0.15, 30); }, res: '一根分水刺扎在你腿上，你被拖回了船。' } },
      ] },
    { id: 'rd_ex_jn_silk', road: ['jiangnan'], sea: false, once: false, w: 1.5, t: '闸口',
      text: (g) => '运河的闸口上，元人的税吏拦住了一条丝绸船，要抽三成。船家急得直跺脚。' + (g.f('taihuBeaten') ? '他认出了你：“太湖上打跑水匪的，就是这位！”' : ''),
      choices: [
        { t: '帮船家跟税吏讲理', need: ['声望', 25], fx: (g) => { g.add('品德', 2); g.add('银两', g.f('taihuBeaten') ? 20 : 10); }, res: '税吏听过你的名字，抽了一成就放了。船家硬塞给你一个红包。' },
        { t: '替船家把私货藏进你的包袱', fx: (g) => { g.add('银两', 25); g.add('品德', -3); if (g.rnd() < 0.4) { g.set('wanted'); g.log('闸口的税吏多看了你两眼，记下了你的样子。'); } }, res: '你背着两匹绸子从闸口走了过去。船家在下游等你，给了二十五两。' },
        { t: '塞几两银子给税吏', cost: { 银两: 8 }, fx: (g) => g.add('品德', 1), res: '税吏收了钱，挥手放了船。' },
      ] },
    { id: 'rd_ex_jn_tianying', road: ['jiangnan', 'donghai'], w: 2, to: [134, 3], t: '盐船',
      text: (g) => '钱塘江口，几条盐船被元人的水师追着跑。船尾插着一面小旗，旗上是一只鹰。'
        + (g.f('laSaltSold') ? '船上有人认出了你：“城东盐仓就是这小子告的密！”' : g.f('tianyingFriend') ? '船头的人朝你挥手：“自己人！”' : ''),
      choices: [
        { t: '跳上水师的船，拖住他们', cond: (g) => !g.f('laSaltSold'), fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.set('tianyingFriend'); g.like('yintianzheng', 10); g.add('声望', 4); }, res: '水师的船打着转停了下来。盐船上的人冲你喊，说殷教主会记得你。' },
          lose: { fx: (g) => g.hurt(20), res: '你被推下了水。好在盐船已经跑远了。' } } },
        { t: '盐船上的人冲你来了', cond: (g) => g.f('laSaltSold'), fight: { foes: [{ id: 'mjdizi', name: '天鹰教众' }, { id: 'mjdizi', name: '天鹰教众' }], win: { fx: (g) => g.like('yintianzheng', -5), res: '他们骂着跳回了船上。' },
          lose: { fx: (g) => g.rob(0.3, 50), res: '他们把你按在泥滩上，搜走了告密得来的银子。' } } },
        { t: '搭他们的船走一段', cond: (g) => g.f('tianyingFriend') && !g.f('laSaltSold'), fx: (g) => { g.heal(999); g.like('yintianzheng', 5); g.give('jiedu', 1); }, res: '他们甩开水师，把你送上了岸，还塞给你一颗解毒丹。' },
        { t: '站在岸上看', res: '盐船拐进了一条水汊，看不见了。' },
      ] },
    { id: 'rd_ex_sea_storm', road: true, sea: true, once: false, w: 2, t: '风浪',
      text: (g) => '船出了舟山，天边压过来一片黑云。浪一个比一个高，船家喊所有人下舱。' + (g.f('bhOldShip') ? '你想起冰火岛那条旧船上的日志，里面写过这种云。' : ''),
      choices: [
        { t: '照日志上的法子，劝船家往东南让一让', cond: (g) => g.f('bhOldShip'), fx: (g) => g.add('声望', 1), res: '船绕开了风头。船家说你像个跑了一辈子海的老水手。' },
        { t: '上甲板帮船家收帆', check: ['根骨', '中'], fx: (g) => { g.add('声望', 2); g.add('银两', 5); }, res: '你和船家拽着绳子熬了一夜。上岸的时候，船家退了你一半船钱。',
          fail: { fx: (g) => { g.hurt(50); g.injure(1); }, res: '一个浪打过来，你撞在桅杆上，半天喘不上气。' } },
        { t: '躲进船舱', fx: (g) => { g.hurt(20); g.days(3); }, res: '船在海上漂了三天才找到方向。你吐得什么也吃不下。' },
      ] },
    { id: 'rd_ex_sea_pirate', road: true, sea: true, once: false, w: 1.5, t: '海寇',
      text: (g) => '天快黑的时候，一条快船贴了上来，船头站着一排拿刀的海寇。' + (g.f('piratesBeaten') ? '领头的独眼看见你，脸色变了。上回就是你把他们打下了海。' : ''),
      choices: [
        { t: '跟他们打', fight: { foes: ['sea_haikoutou', 'sea_haikou'], win: { fx: (g) => { g.set('piratesBeaten'); g.add('银两', 20); g.add('声望', 4); }, res: '你把独眼的头目踹下了海。船上的客人凑了二十两谢你。' },
          lose: { res: '你被海寇打晕，扔在了船舱里。' } } },
        { t: '站到船头，让他看清你的脸', cond: (g) => g.f('piratesBeaten'), fx: (g) => g.add('声望', 2), res: '快船调了个头，一声不吭地走了。' },
        { t: '让船家交钱', fx: (g) => g.rob(0.3, 50), res: '海寇拿了钱，跳回了快船。' },
        { t: '跳海，游到附近的礁石上', check: ['轻功', '中'], fx: (g) => g.days(2), res: '你在礁石上等了两天，才搭上一条渔船。', fail: { fx: (g) => { g.hurt(40); g.rob(0.2, 30); }, res: '你没游多远就被捞了回去，挨了一顿打。' } },
      ] },
    { id: 'rd_ex_sea_persian', road: true, sea: true, once: false, w: 2, from: [135, 1], to: [137, 12], t: '波斯船',
      cond: (g) => (g.before(135, 6) && !g.f('toldBosiWay')) || (g.after(135, 7) && g.f('lsChain') && g.f('xiaozhaoGone') && !g.f('xzChainSent')) || (g.f('wreckLooted') && !g.f('wreckReturned')),
      text: (g) => '海上碰见一条高桅杆的大船，帆上画着火焰。船上的人戴着高帽，是波斯人。'
        + (g.before(135, 6) ? '他们打着手势，问你灵蛇岛往哪边走。' : g.f('xiaozhaoGone') ? '他们的中原话说得很怪：“我们的圣女，回波斯了。”' : '他们说，三位使者回去以后都挨了罚。')
        + (g.f('wreckLooted') && !g.f('wreckReturned') ? '有个人盯着你腰上的波斯金币，看了很久。' : ''),
      choices: [
        { t: '给他们指路', cond: (g) => g.before(135, 6) && !g.f('toldBosiWay'), fx: (g) => { g.set('toldBosiWay'); g.add('银两', 10); }, res: '他们谢了你，往东南去了。你后来才知道，他们是去岛上拿人的。' },
        { t: '托他们把那段铁链捎给小昭', cond: (g) => g.after(135, 7) && g.f('lsChain') && g.f('xiaozhaoGone') && !g.f('xzChainSent'),
          fx: (g) => { g.set('xzChainSent'); g.like('xiaozhao', 15); g.give('jiedu', 2); }, res: '船上的老人认出了铁链，用手按着心口行了个礼。他回赠了两瓶波斯的药。' },
        { t: '把沉船里捞的金币还给他们', cond: (g) => g.f('wreckLooted') && !g.f('wreckReturned'), fx: (g) => { g.set('wreckReturned'); g.add('银两', -Math.min(20, g.money())); g.add('品德', 4); g.give('renshen', 2); },
          res: '他们说那是一个死在海上的兄弟的船。领头的收下金币，送了你两支雪参。' },
        { t: '离他们远一点', res: '你让船家转了舵。' },
      ] },
    { id: 'rd_ex_sea_mirage', road: true, sea: true, once: false, w: 1.5, t: '海市', cond: (g) => !g.known('taohua'),
      text: '海上起了雾。雾散的时候，西南边的天上浮着一座岛，岛上开满了粉色的花。过了一会儿，又没了。',
      choices: [
        { t: '记下它出现的方位', check: ['资质', '易'], fx: (g) => g.clue('taohua'), res: '你对着太阳记下了方位。那座岛就在舟山东南。', fail: { res: '雾又起来了，你记混了东南西北。' } },
        { t: '问船家那是什么', res: '船家说是海市，看见了要倒霉，叫你别再看。' },
      ] },
  ]);

  /* ---------- 路上的遭遇：北方元军 ---------- */
  QX.addEvents([
    { id: 'rd_ex_bei_levy', road: ['dadu'], once: false, w: 2, t: '拉夫',
      text: (g) => '官道上一队元军在拉夫，绳子拴着一串年轻汉子，说是去修河堤。百夫长看见你，手一指：“这个也带走。”'
        + (g.f('mongolFriend') ? '押队的兵里有个蒙古少年，你认得，是雪地里那户牧民家的儿子。' : ''),
      choices: [
        { t: '亮出王府的腰牌', cond: (g) => g.f('servedWang'), fx: (g) => g.add('品德', -2), res: '百夫长的脸立刻堆了笑。那串汉子看你的眼神，跟看元兵一样。' },
        { t: '跟那个蒙古少年使个眼色', cond: (g) => g.f('mongolFriend'), fx: (g) => { g.set('rdFreedConscripts'); g.add('品德', 3); }, res: '夜里他割断了绳子，放走了你和那几个汉子。他说，这是还你救他弟弟的情。' },
        { t: '动手，把人都放了', fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.set('rdFreedConscripts'); g.add('品德', 5); g.add('声望', 4); }, res: '元军跑了。那几个汉子给你磕了头，说要去南边投义军。' },
          lose: { fx: (g) => { g.days(10); g.rob(0.3, 40); }, res: '你被拴在了队伍里，挖了十天的土才找到机会逃出来。' } } },
        { t: '塞钱给百夫长', cost: { 银两: 20 }, res: '他放了你。那串汉子还拴在绳子上，一步一回头。' },
      ] },
    { id: 'rd_ex_bei_post', road: ['dadu', 'zhongnan', 'zhongyuan'], w: 3, from: [134, 10], to: [135, 1], t: '驿站',
      text: '驿站里歇着一个王府的信差，马鞍上挂着一只封了火漆的皮筒。他喝多了，说这一趟是去给南下的番僧送令的。',
      choices: [
        { t: '半夜摸过去看信', check: ['轻功', '中'], fx: (g) => { g.set('readWfLetter'); g.rumor('王府的密令：番僧和武士二月要上武当山，找张三丰算账。', { loc: 'wudang', cred: '确凿' }); },
          res: '你挑开火漆看了一遍，又原样封好。信上写着，二月初上武当。', fail: { fx: (g) => g.hurt(30), res: '信差醒了，一刀劈过来。你撞开窗户逃了。' } },
        { t: '陪他喝酒，套他的话', check: ['根骨', '易'], fx: (g) => g.rumor('听说王府的人开春要往南边去，好像跟武当有关。', { loc: 'wudang' }), res: '他喝到第五碗，说漏了一句“武当”。', fail: { fx: (g) => g.hurt(20), res: '你先醉倒了，第二天头疼得抬不起来。' } },
        { t: '不管闲事', res: '你睡了一夜，天亮信差已经走了。' },
      ] },
    { id: 'rd_ex_zsf_letter', who: 'zhangsanfeng', act: '把王府的密信告诉张真人', cond: (g) => g.f('readWfLetter') && g.before(135, 2, 1), t: '密信',
      text: '张三丰听你说完信上的话，笑了一下：“老道活了一百岁，也该有人来找我算账了。”',
      choices: [
        { t: '说你二月会回山上来', fx: (g) => { g.like('zhangsanfeng', 15); g.add('声望', 5); }, res: '张三丰拍了拍你的肩：“好孩子。到时候别逞强。”' },
        { t: '劝他带着俞三侠暂避', fx: (g) => { g.like('yudaiyan', 10); g.like('zhangsanfeng', 5); }, res: '张三丰摇头说，武当是他的家。俞三侠在床上听见了，让人请你进去喝了一碗茶。' },
      ] },
    { id: 'rd_ex_bei_snow', road: ['dadu', 'zhongnan'], w: 2, t: '风雪', cond: (g) => g.m >= 11 || g.m <= 2,
      text: '北风卷着雪，官道看不见了。你摸到一顶蒙古包前。里面有个牧民的女人，抱着一个烧得发烫的孩子。',
      choices: [
        { t: '拿解毒丹给孩子退热', cost: { item: 'jiedu' }, fx: (g) => { g.set('mongolFriend'); g.add('品德', 4); }, res: '孩子出了一身汗，睡着了。牧民端上了最好的羊肉。他说大儿子在元军里当兵，叫你以后报他家的名字。' },
        { t: '用雪和烧酒给孩子擦身', check: ['资质', '易'], fx: (g) => g.set('mongolFriend'), res: '你照药铺里的土法子擦了一夜，天亮孩子退了热。牧民记下了你的样子。', fail: { res: '孩子到天亮还在烧。你留下几两银子，走了。' } },
        { t: '不进去，顶着雪赶路', check: ['根骨', '中'], res: '你在雪里走了两天，总算看见了人烟。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '你冻得手脚发黑，在驿站里躺了好几天。' } },
      ] },
  ]);

  /* ---------- 路上的遭遇：西南马帮、山民 ---------- */
  QX.addEvents([
    { id: 'rd_ex_xn_mabang', road: ['xinan'], w: 2, t: '茶马道', cond: (g) => !g.f('mabangFriend'),
      text: '茶马道上碰上一支马帮，几十匹骡子驮着茶饼。马锅头说前面是瘴气林子，单身客走不过去，问你要不要搭伙。',
      choices: [
        { t: '搭伙，帮着赶骡子', fx: (g) => { g.days(2); g.set('mabangFriend'); }, res: '你跟着马帮走了几天，学会了进林子前嚼什么草。马锅头说，往后在山里报他的名字。' },
        { t: '夜里帮他们赶走偷骡子的人', fight: { foes: ['shanzei', 'shanzei'], win: { fx: (g) => { g.set('mabangFriend'); g.add('银两', 15); }, res: '偷骡子的跑了。马锅头请你喝了一碗包谷酒，又给了十五两。' },
          lose: { res: '你被打倒在骡子堆里，丢了两匹骡子。马锅头没说什么。' } } },
        { t: '自己走', check: ['根骨', '中'], res: '你捂着鼻子穿过了林子。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '瘴气熏得你头昏眼花，走出林子就倒下了。' } },
      ] },
    { id: 'rd_ex_xn_shanmin', road: ['xinan'], once: false, w: 1.5, t: '竹桩',
      text: (g) => '山路被几根削尖的竹桩拦住了。寨子里的猎手从树上跳下来，弓都拉开了。他们不说汉话。' + (g.f('mabangFriend') ? '你想起了马锅头的话。' : ''),
      choices: [
        { t: '报马锅头的名字', cond: (g) => g.f('mabangFriend'), fx: (g) => g.give('jiedu', 1), res: '猎手们放下了弓，带你进寨子喝了一碗酒，送你一包他们自己配的蛇药。' },
        { t: '拿银子换路', cost: { 银两: 8 }, res: '领头的掂了掂银子，拔开了竹桩。' },
        { t: '硬闯', fight: { foes: ['xn_lieshou', 'xn_lieshou'], win: { fx: (g) => g.add('品德', -3), res: '你冲了过去。身后的寨子里响起了牛角号。' }, lose: { res: '一支毒箭擦过你的胳膊，你退了回来。' } } },
        { t: '退回去绕路', fx: (g) => g.days(4), res: '你多走了四天山路。' },
      ] },
    { id: 'rd_ex_xn_emei', road: ['xinan'], w: 4, t: '峨嵋山下', cond: (g) => g.f('zhouTold') && g.after(135, 8) && g.alive('zhouzhiruo'),
      text: '峨嵋山下的路口站着四个峨嵋弟子，剑都出了鞘。领头的说：“掌门有话，临安茶楼里坏她名声的人，不许上峨嵋。”',
      choices: [
        { t: '拔剑', fight: { foes: ['emdizi', 'emdizi'], win: { fx: (g) => { g.like('zhouzhiruo', -10); g.add('声望', 3); }, res: '她们收剑退了。领头的说，这事掌门会亲自来跟你算。' },
          lose: { res: '剑尖抵在你喉咙上。她们没下杀手，把你赶下了山路。' } } },
        { t: '说你只是讲了看见的事', need: ['声望', 40], fx: (g) => { g.like('zhouzhiruo', -5); g.add('声望', 3); }, res: '她们互相看了一眼，让开了路。' },
        { t: '赔个不是，绕开峨嵋走', fx: (g) => { g.like('zhouzhiruo', 5); g.add('品德', -1); g.days(3); }, res: '你绕了三天的路。后来听说，周掌门知道了，没再说什么。' },
      ] },
  ]);

  /* ---------- 路上的遭遇：中原逃荒、义军 ---------- */
  QX.addEvents([
    { id: 'rd_ex_zy_famine', road: ['zhongyuan', 'xiangyang'], w: 2, to: [137, 2], t: '明王出世',
      text: '黄河又决了口，路上全是逃荒的人。一个穿破袈裟的汉子站在土坡上喊：“明王出世，弥勒下生！”饿得发晕的人一圈一圈围着他。',
      choices: [
        { t: '拿十两银子买粮分给大家', cost: { 银两: 10 }, fx: (g) => { g.set('fedRefugees'); g.add('品德', 4); }, res: '你在镇上买了两车粗粮。有个后生帮你一碗一碗地分，分完了，问你叫什么。' },
        { t: '听他讲完', fx: (g) => { if (g.sect === 'mingjiao') { g.addContrib(1); g.add('声望', 2); } else g.add('资质', 0.3); }, res: (g) => (g.sect === 'mingjiao' ? '他讲完认出了你身上的火焰纹，拉着你的手说，天下要换主人了。' : '他说天下要换主人了。底下的人不哭了，眼睛都亮了起来。') },
        { t: '去附近的卡子报官', need: ['品德', '<', 40], fx: (g) => { g.set('reportedPreacher'); g.add('银两', 25); g.add('品德', -10); }, res: '元兵把那个汉子拖走了。逃荒的人散开，没人敢看你。' },
      ] },
    { id: 'rd_ex_zy_yijun', road: ['zhongyuan', 'xiangyang', 'jiangnan'], w: 4, from: [137, 3], t: '红巾',
      text: (g) => '路口立着一面红旗，几个头裹红巾的汉子拿着长矛盘问过路的人。是明教起兵的义军。'
        + (g.f('soldMjFugitives') || g.f('reportedPreacher') ? '一个汉子盯着你：“我认得你。你报过官。”'
          : g.f('savedMjFugitives') ? '有个汉子认出了你，是那年西域山沟里你救过的人。'
          : g.f('fedRefugees') ? '有个后生说，那年逃荒，是你买的粮。'
          : g.f('rdFreedConscripts') ? '有个汉子手腕上还有绳子勒的疤，冲你笑了笑。'
          : g.f('joinedZhu') ? '他们说常遇春将军就在前头。' : ''),
      choices: [
        { t: '跟他们去打一个元军的寨子', cond: (g) => !g.f('soldMjFugitives') && !g.f('reportedPreacher') && (g.f('savedMjFugitives') || g.f('fedRefugees') || g.f('rdFreedConscripts') || g.f('joinedZhu') || g.sect === 'mingjiao'),
          fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.set('foughtWithYijun'); g.add('声望', 8); g.add('品德', 3); g.add('银两', 20); }, res: '寨子破了。义军的头领把缴来的银子分了你一份，说你的名字他记下了。' },
            lose: { res: '你们被元军的马队冲散了。你逃回路口，红旗还立着。' } } },
        { t: '他们围上来了', cond: (g) => g.f('soldMjFugitives') || g.f('reportedPreacher'), fight: { foes: [{ id: 'mjdizi', name: '义军' }, { id: 'mjdizi', name: '义军' }], win: { fx: (g) => g.add('品德', -3), res: '你打倒了两个人，夺路跑了。身后有人喊：“记住他的脸。”' },
          lose: { fx: (g) => { g.hurt(30); g.rob(0.3, 50); }, res: '他们把你绑在旗杆下饿了两天，才扔出营去。' } } },
        { t: '说你只是过路的', check: ['资质', '易'], res: '他们看了看你的手，放你过去了。', fail: { fx: (g) => g.days(3), res: '他们把你扣了三天，问清楚了才放。' } },
        { t: '给义军捐些粮钱', cost: { 银两: 20 }, fx: (g) => { g.set('yijunDonor'); g.add('品德', 2); }, res: '管粮的把你的名字写进了一个本子。' },
      ] },
    { id: 'rd_ex_zy_patrol', road: ['zhongyuan', 'xiangyang', 'dadu', 'jiangnan'], once: false, w: 1.5, from: [137, 3], t: '搜红巾',
      text: (g) => '一队元军在路上搜人，见了年轻汉子就扒开衣领，看有没有藏着红巾。' + (g.f('foughtWithYijun') || g.f('yijunDonor') ? '领头的拿着一张名单念到一半，抬头看了你一眼。' : ''),
      choices: [
        { t: '名单上有你，先下手', cond: (g) => g.f('foughtWithYijun') || g.f('yijunDonor'), fight: { foes: ['yuanbing', 'baihu'], win: { fx: (g) => g.add('声望', 4), res: '你打翻了领头的，抢过名单撕了。' },
          lose: { fx: (g) => { g.days(10); g.rob(0.3, 50); }, res: '你被押进了牢里。十天以后，义军打下了县城，把你放了出来。' } } },
        { t: '亮出王府的腰牌', cond: (g) => g.f('servedWang'), fx: (g) => g.add('品德', -1), res: '领头的赶紧让开了路，还给你牵了马。' },
        { t: '让他们搜', fx: (g) => g.rob(0.2, 30), res: '他们没搜出红巾，顺手搜走了你一些银子。' },
        { t: '钻进路边的高粱地', check: ['轻功', '易'], res: '高粱比人还高，你从地那头钻了出去。', fail: { fx: (g) => g.hurt(30), res: '一支箭钉在你小腿上，你一瘸一拐地跑掉了。' } },
      ] },
  ]);
})();

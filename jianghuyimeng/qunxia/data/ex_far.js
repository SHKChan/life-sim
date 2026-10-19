/* 群侠 · 远处的探索：峨嵋、大理、光明顶，和三处秘地（桃花岛、绝情谷、古墓）。字段说明见 zhongyuan.js 开头。
 * 每处有“发现”（设标记，解锁一个按钮或别的事件）、按门派、品德、季节变的事，和兑现以前选择的“回响”。
 * 光明顶以 134 年五月的围攻为界：之前是明教总坛，之后是新坟和搬空的营房，135 年起只剩几个守殿的老教众。
 * 秘地是射雕、神雕年间的旧地，到倚天年间人去楼空，只写留下来的屋子、刻字、旧物和坟。 */
(function () {
  'use strict';
  const QX = window.QX;
  const winter = (g) => g.m >= 11 || g.m <= 2;
  const summer = (g) => g.m >= 6 && g.m <= 8;
  const again = (g, id) => g.done(id) > 1;
  const upright = (g) => ['emei', 'quanzhen', 'gaibang'].includes(g.sect);
  // 峨嵋弟子在山上的日子：134 年三月随师父西征，135 年五月才从万安寺回来
  const emeiHome = (g) => g.before(134, 3) || g.after(135, 5);
  const gateOf = (g, type) => Object.keys(g.S.arts).find((x) => QX.ARTS[x].type === type && QX.atGate(x));

  QX.addEvents([
    /* ---------- 峨嵋 ---------- */
    // 发现：舍身崖下的石洞
    { id: 'em_ex_cliff', loc: 'emei', explore: 'emei', once: false, w: 3, t: '舍身崖', cond: (g) => !g.f('emCave'),
      text: (g) => (again(g, 'em_ex_cliff') ? '你又来到舍身崖。崖壁半腰那个洞口还在，藤条在风里晃。' : '舍身崖边的老松树上挂着一只旧剑鞘，鞘上的铜扣绿了。往下看，崖壁半腰有一个黑洞洞的口子，藤条一直垂到洞口。'),
      choices: [
        { t: '顺着藤条攀下去', check: ['轻功', '中'], fx: (g) => g.set('emCave'), res: '洞口不大，里面是一间石室，石壁上刻满了字。你记下了路，先爬了上来。',
          fail: { fx: (g) => g.hurt(40), res: '藤条断了一根，你吊在半空里晃了半天。爬回崖顶，手上全是血口子。' } },
        { t: '把剑鞘取下来看看', cond: (g) => !g.f('emSheath'), fx: (g) => g.set('emSheath'), res: '鞘里塞着一张发黄的纸，写着“风陵”两个字。看殿的老尼说，风陵师太是郭襄祖师的徒弟，灭绝师太的师父。' },
        { t: '离崖边远一点', res: '风很大，你退了回去。' },
      ] },
    { id: 'em_ex_cave', loc: 'emei', act: '攀下舍身崖，进崖下的石洞', cond: (g) => g.f('emCave') && !g.f('emCaveDone'), once: false, t: '石洞',
      text: (g) => '石室里很干，地上铺着一层松针。石壁上的字是一个女子的手笔，写的是吐纳运气的口诀，末尾刻着一个“郭”字。'
        + (g.f('emSheath') ? '你想起崖上那只剑鞘。风陵师太大概也在这里坐过。' : ''),
      choices: [
        { t: '照着口诀打坐', check: ['资质', '中'], fx: (g) => { g.set('emCaveDone'); g.add('内力', 2); }, res: '你坐了一夜，丹田里像有一团温水在慢慢转。',
          great: { fx: (g) => g.learn('emei_jiuyang', 1), res: '口诀和你身上的气脉一处一处对上了。天亮的时候，你已经会了峨嵋九阳功的入门。' },
          fail: { fx: (g) => g.days(1), res: '口诀写得太简，你坐了一夜，腿麻了，什么也没悟出来。改天再来。' } },
        { t: '把刻字刮掉，只留在自己心里', fx: (g) => { g.set('emCaveDone'); g.set('emCaveScraped'); g.add('内力', 3); g.add('品德', -6); }, res: '你一边刮一边记。刮完了，石壁上只剩一片白印子。' },
        { t: '回金顶告诉静玄', cond: (g) => g.alive('jingxuan') && emeiHome(g),
          fx: (g) => { g.set('emCaveDone'); g.set('emCaveTold'); g.like('jingxuan', 8); g.add('品德', 2); if (g.sect === 'emei') g.addContrib(2); },
          res: '静玄跟你下去看了一回，出来时眼圈红了：“这是祖师的字。”她让人在崖上钉了一道铁链。' },
      ] },
    // 发现：后山的野茶
    { id: 'em_ex_tea', loc: 'emei', explore: 'emei', w: 2, t: '茶农',
      text: (g) => (g.f('emFarmerHelp') ? '山下那个茶农认出了你，非要请你喝茶。' : '山下的茶农歇脚时跟你闲聊。') + '他说后山有一片野茶，是几十年前一个老尼种的，长在云雾里，没人去采。',
      choices: [
        { t: '请他带路', fx: (g) => { g.days(1); g.set('emTea'); }, res: '茶农带你绕过两道溪，指着一面坡说就是这里。坡上的茶树比人还高。' },
        { t: '自己去找', check: ['资质', '易'], fx: (g) => g.set('emTea'), res: '你顺着溪水往上走，闻到了茶香。',
          fail: { fx: (g) => { g.days(2); g.set('emTea'); }, res: '你在后山转了两天，差点迷路，最后是跟着一只猴子找到的。' } },
      ] },
    { id: 'em_ex_teapick', loc: 'emei', act: '去后山采野茶', cond: (g) => g.f('emTea'), once: false, t: '野茶',
      text: (g) => (again(g, 'em_ex_teapick') ? '你又来到后山的茶坡。' : '你第一次来采这片野茶。')
        + (g.m >= 3 && g.m <= 4 ? '正是新茶的时候，芽尖嫩得透亮，一掐就是一股清香。' : winter(g) ? '冬天的茶树只剩老叶，冻得发硬。' : '新茶早过了，叶子老了，只能做粗茶。'),
      choices: [
        { t: '采一篓下山卖', fx: (g) => { g.days(2); g.add('银两', g.m >= 3 && g.m <= 4 ? 20 : 6); },
          res: (g) => (g.m >= 3 && g.m <= 4 ? '山下的茶庄抢着收，给了二十两。' : '粗茶不值钱，茶庄给了六两。') },
        { t: '炒一点自己喝', fx: (g) => { g.days(1); g.heal(60); g.restMp(999); if (g.m >= 3 && g.m <= 4) g.add('资质', 0.3); }, res: '茶汤清得能照见人。你喝了一下午，心里也清了。' },
        { t: '包一包送给静玄', cond: (g) => g.alive('jingxuan') && emeiHome(g) && !(g.f('emTeaGift') && g.day - g.f('emTeaGift') < 90),
          fx: (g) => { g.days(1); g.set('emTeaGift', g.day); g.like('jingxuan', 5); }, res: '静玄接过茶，闻了闻：“后山的野茶。”她难得笑了一下。' },
      ] },
    // 季节：金顶的天气
    { id: 'em_ex_weather', loc: 'emei', explore: 'emei', once: false, w: 2, t: '山里的天',
      text: (g) => (again(g, 'em_ex_weather') ? '山里的天又变了。' : '')
        + (winter(g) ? '大雪封了上金顶的石阶，台阶上结着一层冰，几个小尼姑拿着扫帚在扫。'
          : summer(g) ? '山里下起了雷雨。雷声在山谷里滚来滚去，石阶上的水流成了小溪。'
            : '山上起了大雾，十步之外看不见人。雾里有铃铛响，是挑夫在赶路。'),
      choices: [
        { t: (g) => (winter(g) ? '帮小尼姑们扫雪' : summer(g) ? '冒雨下山帮茶农抢收' : '跟着铃声去找那个挑夫'),
          fx: (g) => {
            if (winter(g)) { g.days(1); g.add('根骨', 0.5); if (g.sect === 'emei') g.addContrib(1); if (g.alive('jingxuan')) g.like('jingxuan', 3); }
            else if (summer(g)) { g.days(2); g.add('品德', 3); g.set('emFarmerHelp'); }
            else { g.add('品德', 2); g.give('jinchuang', 1); }
          },
          res: (g) => (winter(g) ? (g.sect === 'emei' ? '静玄从殿里出来，看见是你，点了点头。' : '小尼姑们谢了你，端来一碗热姜汤。')
            : summer(g) ? '你帮茶农把晒着的茶叶抢进了屋。他一身泥，拉着你的手说下回请你喝新茶。'
              : '挑夫在雾里走岔了路，脚崴了。你扶他下了山，他塞给你一包金创药。') },
        { t: (g) => (winter(g) ? '踩着冰往上爬，练脚力' : summer(g) ? '踩着湿滑的石阶往上跑' : '在雾里摸着石阶往上走'), check: ['轻功', '中'],
          fx: (g) => g.add('轻功', 0.5), res: '你一口气上了金顶，脚下稳了许多。',
          fail: { fx: (g) => { g.hurt(30); if (winter(g)) g.injure(1); }, res: '你脚下一滑，摔了一跤，滚下了好几级台阶。' } },
        { t: '回去歇着', res: '你等天好了再说。' },
      ] },
    // 门派、品德：林子里练剑的女弟子
    { id: 'em_ex_nuns', loc: 'emei', explore: 'emei', once: false, w: 3, t: '练剑', cond: (g) => emeiHome(g),
      text: (g) => (again(g, 'em_ex_nuns') ? '她们又在老地方练剑。' : '林子里有几个峨嵋女弟子在练剑，剑光一片一片地闪。')
        + (g.sect === 'emei' ? '领头的师姐看见你，招手叫你过去。' + (g.f('emCaveScraped') ? '静玄在一旁冷冷地说：“崖下石洞里祖师的字，被人刮了。”' : g.f('emCaveTold') ? '静玄说，崖下的石洞她又去过一回，祖师的字她抄了一份放在藏经阁。' : '')
          : g.sect === 'mingjiao' ? '有人认出了你衣襟上的火焰记号，剑尖齐齐转了过来。'
            : g.st('品德') >= 60 ? '静玄站在一旁看着，见了你，没有赶你走。'
              : g.st('品德') < 30 ? '一个女弟子看见你，脸色一沉：“又是你这种人。”' : '她们看了你一眼，没停手。'),
      choices: [
        { t: '跟师姐们一起练', cond: (g) => g.sect === 'emei',
          fx: (g) => { g.add('轻功', 0.3); if (g.lv('emei_jian')) { if (!g.breakGate('emei_jian', '：师姐们在一旁喂招，你卡住的那一处走通了')) g.S.arts.emei_jian.xp += 10; } if (g.alive('jingxuan')) g.like('jingxuan', 2); },
          res: '你跟着师姐们练了一个上午，手腕都酸了。' },
        { t: '站在一边看', cond: (g) => g.sect !== 'emei' && g.sect !== 'mingjiao', need: ['品德', 55],
          fx: (g) => { g.add('轻功', 0.5); if (g.alive('jingxuan')) g.like('jingxuan', 2); }, res: '你看了半天，记下了几步身法。静玄说：“看得懂，也是缘分。”' },
        { t: (g) => (g.sect === 'mingjiao' ? '拔剑迎上去' : g.sect === 'emei' ? '跟师姐过两招' : '上前讨教几招'),
          fight: { foes: ['emdizi', 'emdizi'],
            win: { fx: (g) => { g.add('声望', 3); if (g.sect === 'mingjiao') { g.like('jingxuan', -6); g.like('dingminjun', -4); } else g.like('jingxuan', 2); },
              res: (g) => (g.sect === 'mingjiao' ? '两个女弟子退开了，剑还指着你。你转身下了山，身后骂声一片。' : '两个女弟子收了剑，脸红红的，说你下手有分寸。') },
            lose: { res: '你被剑背拍在后背上，滚下了几级石阶。' } } },
        { t: '转身走开', fx: (g) => { if (g.sect === 'mingjiao' && g.alive('jingxuan')) g.like('jingxuan', 2); },
          res: (g) => (g.sect === 'mingjiao' ? '你没有拔剑，绕开了那片林子。后来听说静玄拦住了要追的师妹。' : '你绕开了那片林子。') },
      ] },
    // 回响：后殿的灵位（灭绝师太死在万安寺，或者被你救下）
    { id: 'em_ex_lamp', loc: 'emei', explore: 'emei', w: 4, t: '后殿', cond: (g) => g.after(135, 5),
      text: (g) => (g.f('miejueLives') ? '后殿多了一排新的长生牌位，写的是死在万安寺的峨嵋弟子。灭绝师太每天早晚来上一炷香，一句话也不说。' : '后殿供上了灭绝师太的灵位。灵前的香一直没断，墙上的剑架空着。')
        + (g.f('miejueFavor') ? '你想起她在这间屋子里教你截手九式的那个晚上。' : g.f('emeiDoubt') ? '你想起她跟你说过的那句话：“你会后悔的。”' : ''),
      choices: [
        { t: '上一炷香', fx: (g) => { g.add('品德', 2); if (g.alive('jingxuan')) g.like('jingxuan', 3); },
          res: (g) => (g.f('miejueLives') ? '灭绝师太看了你一眼，往旁边让了让。' : '静玄在门外站着，等你上完香才进来。') },
        { t: '在灵前把截手九式打一遍', cond: (g) => g.lv('jieshou') > 0,
          fx: (g) => { if (!g.breakGate('jieshou', g.f('miejueLives') ? '：师太在旁边看着，一句话点破了你卡住的那一处' : '：你在师父灵前打完了九式，忽然明白了她当年的意思')) g.add('攻击', 1); if (g.f('miejueLives')) g.like('miejue', 5); },
          res: (g) => (g.f('miejueLives') ? '你打完了，师太说：“第七式慢了。”她走过来，把你的手腕往下压了半寸。' : '你打完了九式，灵前的香灰落了一截。') },
        { t: (g) => (g.f('miejueLives') ? '问师太还恨不恨明教' : '问静玄，师父临走前说了什么'), cond: (g) => g.f('miejueLives') || g.alive('jingxuan'),
          fx: (g) => { g.set('emLastWords'); if (g.f('miejueLives')) g.like('miejue', 3); else g.like('jingxuan', 2); },
          res: (g) => (g.f('miejueLives') ? '她看着香头上的烟：“恨。可救我下塔的，也有他们的人。”'
            : g.f('emeiDoubt') ? '静玄说，师父在塔上提过你一句：“那个要先问是非的孩子，倒也没说错。”' : '静玄说，师父把掌门铁指环交给了周师妹，别的什么也没说。') },
        { t: '退出去', res: '你轻轻掩上了门。' },
      ] },
    // 回响：溪边，周掌门还记得当年的事
    { id: 'em_ex_stream', loc: 'emei', explore: 'emei', w: 4, t: '溪边',
      cond: (g) => g.after(135, 8) && g.alive('zhouzhiruo') && (g.f('zhouFriend') || g.f('zhouDoubt') || g.f('emZhouHelp')),
      text: (g) => '你走到当年周芷若洗剑的那条溪边。一个小尼姑跑过来，说周掌门请你去松树下说话。'
        + (g.f('zhouFriend') ? '周芷若站在松树下：“那个中了寒毒的孩子活着。你当年说对了。”她说完就不笑了。'
          : g.f('zhouDoubt') ? '周芷若背着手：“你当年问我想不想下山去找他。后来我找到了。”'
            : '她说起那年你蹲在溪边帮她洗衣裳，丁师姐气得三天没理她。')
        + (g.f('emLastWords') ? '她又说，听静玄讲，你在后殿问过师父的事。' : '')
        + (g.f('knowZhouSecret') ? '她看你的眼神里，有一点你看不懂的东西。' : ''),
      choices: [
        { t: '说些宽心的话', fx: (g) => { g.like('zhouzhiruo', 6); g.add('品德', 1); }, res: '她听完，点了点头：“峨嵋的门，你什么时候都能来。”' },
        { t: '问她灵蛇岛那一夜的事', cond: (g) => g.f('knowZhouSecret'), fx: (g) => g.like('zhouzhiruo', -10), res: '她的脸一下冷了：“你的记性太好了。”她转身走了，小尼姑跟在后面，不敢出声。' },
        { t: '只说是来看看风景', fx: (g) => g.like('zhouzhiruo', -2), res: '她淡淡地说：“那你慢慢看。”' },
      ] },

    /* ---------- 大理 ---------- */
    // 发现：三塔下的地宫
    { id: 'dl_ex_tower', loc: 'dali', explore: 'dali', once: false, w: 3, t: '三塔', cond: (g) => !g.f('dlCrypt'),
      text: (g) => (again(g, 'dl_ex_tower') ? '你又站在崇圣寺三塔底下。中间那座塔的塔基缝里，还是有凉风往外吹。'
        : '崇圣寺的三座塔立在苍山脚下，中间那座最高。你绕着塔走，塔基的一道缝里有凉风往外吹，带着一股陈年的香灰味。'),
      choices: [
        { t: '扒开砖缝看看', check: ['根骨', '易'], fx: (g) => g.set('dlCrypt'), res: '砖缝后面是一道石阶，往下通进黑暗里。看来塔底下另有一间屋子。',
          fail: { fx: (g) => g.hurt(20), res: '砖太沉，你搬了半天，手指磕破了。' } },
        { t: '去问寺里的和尚', need: ['品德', 50], fx: (g) => g.set('dlCrypt'), res: '和尚说塔下有地宫，是段家皇帝当年藏经供佛的地方。“施主心正，去看看也无妨。夜里去，别惊动了香客。”' },
        { t: '走开', res: '你看了一会儿塔顶的铜铃，走了。' },
      ] },
    { id: 'dl_ex_crypt', loc: 'dali', act: '夜里下三塔的地宫', cond: (g) => g.f('dlCrypt') && !g.f('dlCryptDone'), once: false, t: '地宫',
      text: (g) => '石阶下面是一间方方的石室，供着一尊金身佛像，佛前的油灯早就干了。四面墙上画着一个人点穴，一指一幅，画了几十幅。'
        + (g.f('dlDuanFriend') ? '你想起城隍庙前的段老汉说过，画上的是他家的老祖宗。' : ''),
      choices: [
        { t: '照着壁画比划', check: ['资质', '难'],
          fx: (g) => { g.set('dlCryptDone'); if (g.lv('yiyang')) { if (!g.breakGate('yiyang', '：三塔地宫的壁画，一幅一幅把指力的走法画全了')) g.add('攻击', 1); } else g.add('资质', 1); },
          res: '你比划到天亮，指尖一阵一阵发热。',
          great: { fx: (g) => { if (!g.lv('yiyang')) g.learn('yiyang', 1); else g.add('攻击', 1); }, res: '比划到第三十幅，你的指尖嗤的一声轻响，干了的灯芯上冒起一点火星。' },
          fail: { res: '画上的人一指一个样子，你越看越糊涂。改天再来。' } },
        { t: '剥下佛像上的金箔', fx: (g) => { g.set('dlCryptDone'); g.set('dlStoleGold'); g.add('品德', -10); g.add('银两', 60); }, res: '金箔装了你半个包袱。出来的时候，塔上的铃响了一夜。' },
        { t: '给佛前添上油，退出去', fx: (g) => { g.set('dlCryptDone'); g.add('品德', 3); g.restMp(999); }, res: '灯一亮，壁画上的人好像都动了起来。你在灯下坐了一会儿，心里很静。' },
      ] },
    // 发现：洱海里的小岛
    { id: 'dl_ex_fisher', loc: 'dali', explore: 'dali', w: 2, t: '老渔夫',
      text: '洱海边一个老渔夫在补网。他说海心有一座小岛，岛上有座观音阁，月亮好的晚上，他看见过有人坐在阁顶上。',
      choices: [
        { t: '帮他补完网，请他借条船', fx: (g) => { g.days(1); g.set('dlIsle'); }, res: '老渔夫说船随时借你。“八月十五去，月亮最好看。”' },
        { t: '自己找条船划过去', check: ['根骨', '易'], fx: (g) => g.set('dlIsle'), res: '你划了半天，靠上了小岛。认得路了。',
          fail: { fx: (g) => { g.hurt(30); g.set('dlIsle'); }, res: '风浪比你想的大。船翻了一回，你抱着船板漂到了岛边，总算认得了路。' } },
      ] },
    { id: 'dl_ex_isle', loc: 'dali', act: '划船去洱海的小岛', cond: (g) => g.f('dlIsle'), once: false, t: '小岛',
      text: (g) => (again(g, 'dl_ex_isle') ? '你又把船靠上了小岛。' : '观音阁很小，阁顶上能看见整片洱海和对岸的苍山。')
        + (g.m === 8 ? '八月里，月亮从东边的山后升起来，洱海里也有一个，比天上的还亮。' : winter(g) ? '冬天的风从下关吹过来，冷得刺骨。' : '水面上有几只白鹭，飞起来又落下。'),
      choices: [
        { t: '在阁顶上打坐', fx: (g) => { g.days(2); g.restMp(999); g.add('资质', g.m === 8 ? 1 : 0.3); const id = gateOf(g, '内功'); if (id && g.m === 8) g.breakGate(id, '：洱海月下，你的真气跟着水波走完了关口'); },
          res: (g) => (g.m === 8 ? '月亮落下去的时候，你身上的真气也像潮水一样退了，又涨了。' : '你坐了两天，听了两天的水声。') },
        { t: '唱一段洱海边学来的歌', cond: (g) => g.f('dlSong'), fx: (g) => { g.heal(60); g.add('声望', 1); }, res: '你的歌声在水面上散开。对岸有人跟着唱了一句。' },
        { t: '在阁里过一夜，看一夜的水', fx: (g) => { g.days(1); g.heal(999); if (g.m === 8 && g.inj() > 0) g.cure(1); }, res: (g) => (g.m === 8 ? '月光照了你一夜。早上醒来，胸口松了很多。' : '你睡得很沉，梦里都是水声。') },
      ] },
    // 季节：赶街、三月街、火把节
    { id: 'dl_ex_market', loc: 'dali', explore: 'dali', once: false, w: 3, t: '街子',
      text: (g) => (g.m === 3 ? '三月街开了。苍山脚下搭满了棚子，马帮、药材、茶叶、银器，十几个地方的人都来赶街。'
        : g.m === 6 ? '六月底是火把节。天一黑，家家门口点起了火把，年轻人举着火把在田埂上跑，一圈一圈绕着村子。'
          : g.m <= 2 ? '城里的茶花开了，红的白的，从墙头上垂下来。街上摆满了卖花的担子。'
            : (again(g, 'dl_ex_market') ? '又是街子天。' : '今天是街子天。') + '城门口摆满了摊子，卖什么的都有。'),
      choices: [
        { t: '去药材摊挑药', cost: { 银两: 20 }, fx: (g) => { if (g.m === 3) { g.give('renshen', 2); g.give('jiedu', 1); } else { g.give('jiedu', 1); g.give('jinchuang', 1); } },
          res: (g) => (g.m === 3 ? '三月街上的药又多又便宜，同样的钱，你多挑了一支山参。' : '药材摊的老板给你包了两样药。') },
        { t: (g) => (g.m === 3 ? '在擂台上跟人比武' : g.m === 6 ? '跟举火把的小伙子比划比划' : '跟耍把式的过两招'),
          fight: { foes: ['jianke'], win: { fx: (g) => { g.add('声望', 3); if (g.m === 3) g.add('银两', 15); }, res: (g) => (g.m === 3 ? '台下叫好声一片，擂主给了你十五两彩头。' : '围着看的人拍手叫好。') },
            lose: { res: '你被人一脚扫倒，围着的人哄笑起来。' } } },
        { t: (g) => (g.m === 6 ? '举着火把跟他们一起跑' : g.m <= 2 ? '买一枝茶花送给药铺掌柜' : '随便逛逛'),
          fx: (g) => { if (g.m === 6) { g.add('根骨', 0.5); g.set('dlTorch'); } else if (g.m <= 2) g.like('dali_yaogui', 5); else g.add('资质', 0.3); },
          res: (g) => (g.m === 6 ? '你跑了一夜，嗓子都喊哑了。' : g.m <= 2 ? '掌柜把茶花插在药柜上的瓶子里，嘴上说你乱花钱。' : '你逛了一天，听了满耳朵的白族话。') },
      ] },
    // 门派、品德：卖字画的段老汉
    { id: 'dl_ex_duan', loc: 'dali', explore: 'dali', w: 3, t: '段老汉',
      text: (g) => '城隍庙前有个老汉摆摊卖字画，画的都是苍山洱海。他说他姓段，祖上做过皇帝，“如今卖画，也不丢人。”'
        + (g.sect === 'quanzhen' ? '他听说你是全真教的，眼睛一亮：“当年王真人来过大理，跟我家老祖宗换过功夫。”'
          : g.sect === 'emei' ? '他听说你是峨嵋的，说郭襄女侠年轻时走遍天下找人，也到过大理。'
            : g.sect === 'mingjiao' ? '他瞧见你衣襟上的火焰记号，压低了声音：“这几年元人查得紧，你小心些。”' : ''),
      choices: [
        { t: '买他一幅画', cost: { 银两: 8 }, fx: (g) => { g.set('dlDuanFriend'); g.set('dlCrypt'); }, res: '他把画卷好递给你，又说了一句：“三塔底下那些画，才是我家真正的东西。”' },
        { t: '坐下来听他讲段家的旧事', need: ['品德', 55], fx: (g) => { g.days(1); g.set('dlDuanFriend'); g.set('dlCrypt'); g.add('资质', 0.5); },
          res: (g) => '他讲了一下午，从开国的段思平讲到出家的一灯大师。' + (g.sect === 'quanzhen' ? '讲到王重阳，他朝你拱了拱手。' : '') + '临走他说，三塔底下有个地宫，有空去看看。' },
        { t: '掀了他的摊子，看画轴里藏没藏东西', need: ['品德', '<', 35], fx: (g) => { g.add('品德', -6); g.add('银两', 5); g.set('dlDuanHurt'); }, res: '画轴里什么也没有。老汉蹲在地上捡画，一句话也没说。' },
        { t: '走开', res: '你看了两眼画，走了。' },
      ] },
    // 回响：天龙寺山下的田
    { id: 'dl_ex_fields', loc: 'dali', explore: 'dali', w: 4, t: '寺田', cond: (g) => g.after(133, 10),
      text: (g) => (g.f('tianlongHelped') ? '天龙寺山下的田里，稻子黄了。佃户们弯着腰割稻，看见你，有人直起身子喊了一声。老和尚坐在田埂上，给孩子们分麦芽糖。'
        : g.f('tianlongLost') ? '天龙寺山下的田换了主人。恶霸的家丁拿着鞭子在田埂上走，原来的佃户在给他们干活，工钱少了一半。'
          : '天龙寺山下是一片稻田，风一吹，稻浪一层一层的。')
        + (g.f('tianlongCaught') ? '老和尚看见你，跟没事一样，招手让你过去喝茶。' : '')
        + (g.f('dlStoleGold') ? '他说三塔地宫里佛像的金箔叫人剥了。说这话的时候，他没看你。' : '')
        + (g.f('dlDuanHurt') ? '他又说，城隍庙前的段老汉前些日子叫人掀了摊子，病了一场。' : ''),
      choices: [
        { t: '下田帮着割稻', cond: (g) => !g.f('tianlongLost'),
          fx: (g) => { g.days(2); g.add('根骨', 0.5); g.like('tianlong_seng', 6); },
          res: (g) => (g.f('tianlongHelped') ? '你割了两天稻。老和尚说：“那年你撕了那张文书，这些人今年才有饭吃。”' : '你割了两天稻，腰都直不起来了。老和尚给你送了两回粥。') },
        { t: '把恶霸的家丁赶走', cond: (g) => g.f('tianlongLost'),
          fight: { foes: ['tianlong_e', 'shanzei'], win: { fx: (g) => { g.set('dlFieldsBack'); g.add('品德', 5); g.add('声望', 4); g.like('tianlong_seng', 8); },
            res: '家丁跑了。佃户们说恶霸背后有元人的官府，明年还会来。可今年的稻子，是他们自己的了。' }, lose: { res: '你被家丁打倒在田埂上，佃户们偷偷把你抬回了寺里。' } } },
        { t: '给佃户们留一点银子', cost: { 银两: 20 }, fx: (g) => { g.add('品德', 3); g.like('tianlong_seng', 3); }, res: '你把银子交给老和尚，请他分给最穷的几家。' },
        { t: '把金箔的钱还给寺里', cond: (g) => g.f('dlStoleGold'), cost: { 银两: 60 }, fx: (g) => { g.add('品德', 6); g.like('tianlong_seng', 6); }, res: '老和尚收下银子，念了一声佛：“佛像不会怪你，你自己别怪自己就好。”' },
      ] },
    // 回响：洱海边的歌唱到了你
    { id: 'dl_ex_song', loc: 'dali', explore: 'dali', once: false, w: 2, t: '新歌', cond: (g) => g.done('dl_erhai') > 0,
      text: (g) => (again(g, 'dl_ex_song') ? '洱海边那个白族姑娘又在唱歌。' : '洱海边那个唱歌的白族姑娘换了一支新歌。')
        + (g.f('dlSongMine') ? '她唱的是你上回编的那一段，唱得比你好听多了。'
          : g.f('tianlongHelped') || g.f('dlFieldsBack') ? '新歌里唱一个外乡人，赶走了占寺田的恶霸。唱到这里，旁边的渔家都笑了。'
            : g.f('yaoDone') ? '新歌唱城南的孩子喝上了苍山的雪茶，送茶的人一文钱也没要。'
              : g.f('tianlongLost') ? '歌里唱天龙寺的田没了，老和尚扫着空院子。调子很慢。'
                : g.f('heardYideng') ? '她又唱起那个出家的皇帝。你听过一回，这回跟着哼了两句。' : '她唱苍山上的雪，一年到头化不完。')
        + (g.f('dlTorch') ? '她认出你是火把节那晚跑得最欢的那个，冲你挤了挤眼睛。' : ''),
      choices: [
        { t: '请她教你唱', cond: (g) => !g.f('dlSong'), fx: (g) => { g.set('dlSong'); g.add('资质', 0.3); }, res: '她教了你两段。白族话你学不像，她笑弯了腰。' },
        { t: '把你在江湖上的事编成一段，唱给她听', cond: (g) => g.f('dlSong') && !g.f('dlSongMine'), fx: (g) => { g.set('dlSongMine'); g.add('声望', 3); }, res: '你唱得磕磕绊绊。她听完，说这段她要了，以后唱给过路的人听。' },
        { t: '给她一点赏钱', cost: { 银两: 2 }, fx: (g) => g.add('品德', 1), res: '她冲你笑了笑，又唱了一段。' },
        { t: '听完就走', fx: (g) => g.restMp(30), res: '歌声跟着你走了很远。' },
      ] },

    /* ---------- 光明顶 ---------- */
    // 发现：山坳里的热泉
    { id: 'gm_ex_herder', loc: 'guangming', explore: 'guangming', w: 3, t: '牧民',
      text: '山腰上碰到一个赶羊的牧民，脸冻得通红。他说翻过东边的山坳，有一眼冒热气的泉，冬天也不结冰，羊病了就赶过去泡。',
      choices: [
        { t: '跟他去看看', fx: (g) => { g.days(1); g.set('gmSpring'); }, res: '山坳里白气腾腾，泉水烫手。牧民说，人泡了也好，骨头里的寒气能泡出来。' },
        { t: '拿一份金创药给他的羊', cond: (g) => g.has('jinchuang'), fx: (g) => { g.take('jinchuang', 1); g.add('品德', 2); g.set('gmSpring'); }, res: '他的羊前几天叫狼咬了。他千恩万谢，给你指了去热泉的路，又硬塞给你一碗奶茶。' },
        { t: '赶路要紧', res: '牧民赶着羊走远了。' },
      ] },
    { id: 'gm_ex_spring', loc: 'guangming', act: '去山坳里泡热泉', cond: (g) => g.f('gmSpring'), once: false, t: '热泉',
      text: (g) => (again(g, 'gm_ex_spring') ? '你又来到山坳里的热泉。' : '你第一次泡进热泉，烫得直吸气。')
        + (winter(g) || g.m === 3 ? '四面都是雪，只有这一眼泉冒着白气。' : '泉边的草长得很高，羊在不远处吃草。'),
      choices: [
        { t: '泡一整天',
          fx: (g) => { g.days(1); g.heal(999); g.restMp(999); if (g.inj() > 0 && !(g.f('gmSpringDay') && g.day - g.f('gmSpringDay') < 90)) { g.cure(1); g.set('gmSpringDay', g.day); g.log('骨头里的寒气泡出来了，内伤好了一层。'); } },
          res: '你泡到天黑，浑身都松透了。' },
        { t: '一会儿跳进雪里，一会儿泡回泉里', check: ['根骨', '中'], fx: (g) => { g.days(3); g.add('根骨', 0.5); }, res: '一冷一热，你的皮肉像被捶打过一样结实。',
          fail: { fx: (g) => { g.hurt(30); g.injure(1); }, res: '你冻得发抖，再泡进热水，心口一阵发闷。寒气进了身子。' } },
      ] },
    // 发现：冰壁后的石窟
    { id: 'gm_ex_crack', loc: 'guangming', explore: 'guangming', once: false, w: 2, t: '冰壁', cond: (g) => !g.f('gmMural'),
      text: (g) => (again(g, 'gm_ex_crack') ? '你又来到后山那道冰壁下。裂缝里的风声还在。' : '你在后山的冰壁下面发现一道裂缝，里面有风声。缝口的冰上，隐约刻着一团火焰。'),
      choices: [
        { t: '侧着身子挤进去', check: ['轻功', '中'], fx: (g) => g.set('gmMural'), res: '缝里是一个石窟，四壁画满了彩画。你没带火把，只看了个大概，记下了路。',
          fail: { fx: (g) => g.hurt(30), res: '冰太滑，你卡在缝里，好半天才退出来，脸上擦破了一块。' } },
        { t: '用兵器把冰凿开', fx: (g) => { g.days(2); g.hurt(20); g.set('gmMural'); }, res: '你凿了两天，虎口震得发麻，总算凿出一条能走人的道。' },
        { t: '回去', res: '天快黑了，你下了山。' },
      ] },
    { id: 'gm_ex_mural', loc: 'guangming', act: '举着火把进后山的石窟', cond: (g) => g.f('gmMural') && !g.f('gmMuralDone'), once: false, t: '石窟',
      text: (g) => '火把一照，四壁上画的是一个白袍老人在沙漠里教人练武，手里拿着几块黑铁牌。旁边写着弯弯曲曲的波斯字。'
        + (g.has('shenghuo') ? '你摸出怀里的圣火令一比，铁牌上的字和壁上的一模一样。' : ''),
      choices: [
        { t: '照着画上的身法练', check: ['资质', '中'],
          fx: (g) => { g.set('gmMuralDone'); if (g.lv('shenghuo_wu')) { if (!g.breakGate('shenghuo_wu', '：石窟壁画补全了你缺的那一步')) g.add('攻击', 1); } else g.add('轻功', 1); },
          res: '画上的人进退全不按中原的路数。你练了半夜，脚下多了几分古怪的灵动。', fail: { res: '画上的身法太怪，你练得头昏眼花。改天再来。' } },
        { t: '把波斯字一个一个描下来', fx: (g) => { g.set('gmMuralDone'); g.set('gmMuralCopy'); }, res: '你描了满满三张纸。一个字也不认得，可描得很仔细。' },
        { t: '在壁画前磕个头', fx: (g) => { g.set('gmMuralDone'); g.add('品德', 2); if (g.sect === 'mingjiao') g.addContrib(2); }, res: '你磕完头，火把正好烧到了头。你摸着黑退了出去。' },
      ] },
    // 季节：昆仑山的天
    { id: 'gm_ex_weather', loc: 'guangming', explore: 'guangming', once: false, w: 3, t: '昆仑的天',
      text: (g) => (again(g, 'gm_ex_weather') ? '昆仑山的天又变了。' : '')
        + (winter(g) || g.m === 3 ? '山上起了白毛风，雪片打在脸上像沙子，十步之外什么也看不见。'
          : summer(g) ? '雪线上的冰化了，山沟里的水一下子涨起来，轰隆隆往下冲，冲断了上山的栈道。'
            : '山上晴了，天蓝得发黑。远处的雪峰一座连着一座，太阳照得人睁不开眼。'),
      choices: [
        { t: (g) => (winter(g) || g.m === 3 ? '找个雪窝躲一夜' : summer(g) ? '帮山上的人修栈道' : '去雪线下找药'),
          fx: (g) => {
            if (winter(g) || g.m === 3) { g.days(2); g.hurt(20); }
            else if (summer(g)) { g.days(3); g.add('品德', 2); if (g.sect === 'mingjiao') g.addContrib(1); if (g.before(134, 5) && g.alive('zhuangzheng')) g.like('zhuangzheng', 3); }
            else g.give('renshen', 1);
          },
          res: (g) => (winter(g) || g.m === 3 ? '你缩在雪窝里熬了一夜，天亮时手脚都冻木了。'
            : summer(g) ? (g.before(134, 5) ? '栈道修好了。锐金旗的人扛着木头从你身边过，拍了拍你的肩膀。' : '栈道修好了。山上没剩几个人，修给谁走呢。你还是修完了。')
              : '你在石缝里挖到一支老山参。') },
        { t: (g) => (winter(g) || g.m === 3 ? '顶着风往上走' : summer(g) ? '从山沟边上攀过去' : '爬上最近的雪峰'), check: ['根骨', '中'],
          fx: (g) => g.add('根骨', 0.5), res: '你走到了地方，喘得像拉风箱。身子骨硬了一些。',
          fail: { fx: (g) => { g.hurt(50); g.injure(1); }, res: '你没撑住，一跤摔在冰上，胸口闷了好几天。' } },
        { t: '回去', res: '你等天好了再出门。' },
      ] },
    // 门派、大势：山腰的操练场（134 年五月围攻那个月不出）
    { id: 'gm_ex_drill', loc: 'guangming', explore: 'guangming', once: false, w: 3, t: '操练场', cond: (g) => !(g.after(134, 5) && g.before(134, 6)),
      text: (g) => (g.before(134, 5)
        ? (again(g, 'gm_ex_drill') ? '五行旗又在山腰操练。' : '山腰的平地上，五行旗的教众在操练。锐金旗的刀，巨木旗的木桩，喊声震得雪往下掉。')
          + (g.sect === 'mingjiao' ? '庄铮看见你，吼了一嗓子：“发什么愣，过来！”' : upright(g) ? '你身上门派的记号太扎眼，有人朝你这边指了指。' : g.st('品德') < 30 ? '一个旗众朝你招手：“兄弟面相凶，像咱们的人。”' : '')
        : g.before(135, 1)
          ? '山腰的平地上，明教的人在收拾东西，一车一车往山下运。听说新教主要带大伙往东去。' + (g.f('gmDrillSeen') ? '你想起当年在这里偷看过他们操练，那些人有一半不在了。' : '')
          : '山腰的平地空了。操练的木桩还立着，上面落满了雪。只有几个老教众守着圣火殿。'
            + (g.f('gmHelpedMove') ? '一个老教众认得你，说你帮大伙搬过家。' : g.f('gmTended') ? '一个老教众认得你，说你给兄弟们垒过坟。' : '')),
      choices: [
        { t: (g) => (g.before(134, 5) ? (g.sect === 'mingjiao' ? '跟着操练' : '帮他们扛木桩') : g.before(135, 1) ? '帮他们搬东西' : '给守殿的老教众送些吃的'), cond: (g) => !(g.before(134, 5) && upright(g)),
          fx: (g) => {
            if (g.before(134, 5)) { g.days(2); g.add('根骨', 0.5); if (g.sect === 'mingjiao') g.addContrib(1); if (g.alive('zhuangzheng')) g.like('zhuangzheng', g.sect === 'mingjiao' ? 4 : 2); }
            else if (g.before(135, 1)) { g.days(2); g.add('品德', 2); g.set('gmHelpedMove'); if (g.alive('yangxiao')) g.like('yangxiao', 3); }
            else { g.add('品德', 2); g.heal(40); }
          },
          res: (g) => (g.before(134, 5) ? '你扛了两天木桩，肩膀磨破了皮。庄铮说你是块料。'
            : g.before(135, 1) ? '你帮着搬了两天。临走一个旗众塞给你一包干粮：“到了中原，报锐金旗的名字。”'
              : '老教众把干粮掰成两半，一半放在圣火前。') },
        { t: '记下他们的阵法', cond: (g) => g.before(134, 5) && upright(g), check: ['资质', '中'],
          fx: (g) => { g.set('gmDrillSeen'); g.add('资质', 0.5); }, res: '你趴在雪坡后面看了一上午，五行旗怎么进怎么退，你画在了心里。',
          fail: { fx: (g) => g.hurt(40), res: '你被巡山的旗众发现了，挨了一顿打，被扔下了山坡。' } },
        { t: (g) => (g.sect === 'mingjiao' ? '替锐金旗当一回陪练' : '上前比划比划'), cond: (g) => g.before(134, 5),
          fight: { foes: ['mjdizi', 'mjdizi'], win: { fx: (g) => { g.add('声望', 3); if (g.alive('zhuangzheng')) g.like('zhuangzheng', upright(g) ? -3 : 3); },
            res: (g) => (upright(g) ? '两个旗众爬起来，瞪着你。庄铮在远处哼了一声。' : '两个旗众爬起来，哈哈大笑，非要拉你去喝酒。') },
            lose: { res: '你被摔了个嘴啃雪，旗众们哄笑起来。' } } },
        { t: (g) => (g.before(134, 5) ? '看一会儿就走' : '打听大伙去了哪里'),
          fx: (g) => { if (!g.before(134, 5)) g.rumor('光明顶的老教众说，明教的人马去了淮北的蝴蝶谷。', { loc: 'hudie' }); },
          res: (g) => (g.before(134, 5) ? '你看了一会儿，下山去了。' : '老教众朝东边指了指：“蝴蝶谷。教主在那里。”') },
      ] },
    // 回响：围攻以后的新坟
    { id: 'gm_ex_graves', loc: 'guangming', explore: 'guangming', w: 4, t: '新坟', cond: (g) => g.after(134, 6),
      text: (g) => '圣火殿后面的山坡上添了一片新坟，木牌上写着名字，有的只写了某某旗。'
        + (g.f('savedZhuang') ? '锐金旗的坟最多。庄铮活了下来，每座坟前的木牌都是他亲手削的。' : '最前面一座坟写着“锐金旗掌旗使庄铮”，坟前插着一把卷了刃的刀。')
        + (g.f('atGmd') ? (g.f('helpedMing') ? '那天你在圣火殿门口守过。有几座坟里的人，你认得脸。' : '那天你也在山上。你想起那些倒下的人，很多还是孩子。') : '你那时不在山上，只听人说起过。'),
      choices: [
        { t: '一座一座上香', fx: (g) => { g.days(1); g.add('品德', 3); g.set('gmTended'); }, res: '香不够，你折了松枝点着，插在剩下的坟前。' },
        { t: '帮守坟的教众把坟垒高', fx: (g) => { g.days(2); g.add('根骨', 0.5); g.set('gmTended'); if (g.alive('yangxiao')) g.like('yangxiao', 3); if (g.sect === 'mingjiao') g.addContrib(1); },
          res: (g) => (g.f('helpedMing') ? '一个老教众给你倒了一碗酒：“那天守门的就有你。明教记着。”' : '一个老教众看了你很久，最后给你倒了一碗酒。') },
        { t: '站一会儿就走', res: '风把纸钱吹到了雪线上。' },
      ] },
    // 回响：圣火殿下的秘道
    { id: 'gm_ex_midao', loc: 'guangming', explore: 'guangming', w: 4, t: '石砖',
      cond: (g) => g.after(134, 6) && (g.f('xiaozhaoTrust') || g.f('xiaozhaoTold') || g.f('buriedYang') || g.f('midaoDone')),
      text: (g) => '圣火殿里冷冷清清，地上有几块石砖是新换的。'
        + (g.f('xiaozhaoTold') ? '当年小昭数过的那块石砖，被人用铁水浇死了。杨逍做事一向这样。'
          : g.f('buriedYang') ? '你从那块松动的石砖钻下去，石室里阳教主的坟还在，碑前落了一层灰。'
            : g.f('xiaozhaoOwe') ? '那块松动的石砖还在。你想起小昭攥着羊皮说她欠你一回。'
              : g.f('midaoDone') ? '那块松动的石砖还在，底下的秘道你走过一回。'
                : '小昭说过的那条秘道，入口就在这些石砖底下。可她已经不在山上了。')
        + (g.after(135, 1) ? '明教的人都走了，殿里的长明灯却还点着。' : ''),
      choices: [
        { t: (g) => (g.f('xiaozhaoTold') ? '撬那块浇死的石砖' : '下秘道去看看'),
          fx: (g) => { if (g.f('xiaozhaoTold')) { g.add('品德', -2); g.hurt(30); } else { g.add('品德', 1); g.restMp(60); } },
          res: (g) => (g.f('xiaozhaoTold') ? '铁水浇得太死，你撬断了刀尖，手也震裂了。'
            : g.f('buriedYang') ? '你在碑前跪了一会儿，把灰擦干净了。' : '秘道里的两具骸骨已经被人收殓了，只剩墙上几行刻字。你认出一句：“阳顶天拜上”。') },
        { t: '把描下的波斯字压在石砖下，留给认得的人', cond: (g) => g.f('gmMuralCopy') && g.f('xiaozhaoTrust'),
          fx: (g) => { g.like('xiaozhao', 6); g.add('品德', 1); },
          res: (g) => (g.f('xiaozhaoGone') ? '小昭已经去了波斯。你还是把纸压了下去，说不定哪天有人认得。' : '你托守殿的老教众捎话：石砖下有她认得的字。后来听说，那几张纸不见了。') },
        { t: '给圣火添一勺油', fx: (g) => { g.add('品德', 1); if (g.sect === 'mingjiao') g.addContrib(1); if (g.alive('yangxiao')) g.like('yangxiao', 2); }, res: '火苗跳了一下，又稳住了。' },
        { t: '离开', res: '你把殿门掩上了。' },
      ] },

    /* ---------- 桃花岛（秘地） ---------- */
    // 发现：周伯通住过十五年的山洞
    { id: 'th_ex_cave', loc: 'taohua', explore: 'taohua', once: false, w: 3, t: '山洞', cond: (g) => g.f('thMaze') && !g.f('thHubo'),
      text: (g) => (again(g, 'th_ex_cave') ? '你又钻进林子东边那个山洞。洞壁上的圈和方块还在等你。'
        : '林子东边有一个山洞，洞口堆着一堆碎瓦罐。洞里的石壁被人用手指划满了圈和方块，左边一个圈，右边一个方块，一排一排划到了洞顶。'),
      choices: [
        { t: '左手画圆，右手画方，照着试', check: ['资质', '中'], fx: (g) => g.set('thHubo'), res: '你试了一百遍。第一百零一遍，左手的圆和右手的方都成了。你觉得两只手像是两个人。',
          fail: { res: '左手画出来是方的，右手画出来是圆的。你坐在地上笑了半天。' } },
        { t: '捡一片碎瓦罐看看', fx: (g) => g.add('资质', 0.3), res: '瓦罐底上刻着一行歪歪扭扭的字，说有个老顽童在这洞里住了十五年，问岛主放不放他走。' },
      ] },
    { id: 'th_ex_hubo', loc: 'taohua', act: '在山洞里练左右互搏', cond: (g) => g.f('thHubo'), once: false, t: '左右互搏',
      text: (g) => (again(g, 'th_ex_hubo') ? '你又坐进那个山洞。洞壁上的圈和方块，你闭着眼也画得出来了。' : '你坐在洞里，左手一套，右手一套，自己跟自己打。'),
      choices: [
        { t: '练上十天', fx: (g) => { g.days(10); if (g.done('th_ex_hubo') <= 3) { g.add('资质', 1); g.add('攻击', 1); } else g.add('攻击', 0.3); const id = gateOf(g, '拳掌'); if (id) g.breakGate(id, '：两只手各打各的，卡住的那一处自己通了'); },
          res: (g) => (g.done('th_ex_hubo') <= 3 ? '十天下来，你一个人打出了两个人的拳。' : '这门功夫你已经练到头了，剩下的只是熟。') },
        { t: '出洞', res: '外面的桃花落了一地。' },
      ] },
    // 回响：积翠亭和没下完的棋
    { id: 'th_ex_pavilion', loc: 'taohua', explore: 'taohua', w: 3, t: '亭子', cond: (g) => g.f('thMaze'),
      text: (g) => '竹林边有一座亭子，柱子上刻着一副对子，上联说桃花落了，下联说潮水涨了。石桌上摆着一盘没下完的棋，棋子上长了青苔。'
        + (g.f('thGrave') ? '你给花冢拔过草。亭边的桃树好像比别处开得早。' : '')
        + (g.f('heardGuojing') ? '你想起襄阳的老叫化讲过，郭大侠年轻时在这岛上住过。亭柱底下刻着一个小小的“靖”字，刻得很笨。' : '')
        + (g.lv('luoying') ? '对子上的“桃花影落”，正是你学过的那路掌法的名字。' : ''),
      choices: [
        { t: '把那盘棋下完', check: ['资质', '难'], fx: (g) => { g.add('资质', 1); g.set('thChess'); }, res: '你想了一夜，替不在了的人走完了最后几步。黑子赢了半目。',
          fail: { res: '你看不出这盘棋还能怎么走。' } },
        { t: '对着对子练一遍落英神剑掌', cond: (g) => g.lv('luoying') > 0, fx: (g) => { if (!g.breakGate('luoying', '：亭柱上的对子把掌法的意思说透了')) g.add('攻击', 1); }, res: '你一掌一掌打下去，亭边的桃花跟着往下落。' },
        { t: '坐在亭子里听潮', fx: (g) => g.restMp(999), res: '潮水一阵一阵，像有人在远处吹箫。' },
      ] },
    // 季节、回响：海边的小坟
    { id: 'th_ex_shore', loc: 'taohua', explore: 'taohua', once: false, w: 2, t: '海边',
      text: (g) => (g.m >= 2 && g.m <= 4 ? '三月的桃花岛，满岛都是花。海风一吹，花瓣落在沙滩上，一层粉一层白。'
        : summer(g) ? '夏天海上起了大风，浪打上礁石，水沫一直溅到林子边上。' : '秋冬的桃树光秃秃的，林子里的路反倒看得清了。')
        + (g.f('thShoreGrave') ? '沙滩上那排小坟的土是你培过的，还没塌。' : '沙滩上有一排小坟，木牌烂了，只看得出一个“仆”字。')
        + (g.f('thChess') ? '你想起积翠亭里那盘棋。下棋的人，大概也在这些坟里。' : ''),
      choices: [
        { t: '给小坟培一把土', fx: (g) => { g.add('品德', 2); g.set('thShoreGrave'); }, res: '你一座一座培了土。坟里的人一辈子没说过话，你也一句话没说。' },
        { t: '在礁石上练轻功', check: ['轻功', '难'], fx: (g) => g.add('轻功', g.done('th_ex_shore') <= 3 ? 1 : 0.3), res: '你在礁石间跳来跳去，浪追不上你。',
          fail: { fx: (g) => g.hurt(40), res: '一个浪打过来，把你拍在了礁石上。' } },
        { t: '沿着海边走走', fx: (g) => { if (g.m >= 2 && g.m <= 4) g.add('资质', 0.3); else g.restMp(40); }, res: (g) => (g.m >= 2 && g.m <= 4 ? '花瓣落在海里，一片一片漂远了。你看了很久。' : '你走了一圈，鞋里灌满了沙子。') },
      ] },

    /* ---------- 绝情谷（秘地） ---------- */
    // 回响、发现：断肠崖
    { id: 'jq_ex_cliff', loc: 'jueqing', explore: 'jueqing', w: 3, t: '断肠崖',
      text: (g) => '谷后有一座高崖，崖顶光秃秃的，风很大。崖边的石头上刻着两行字，字口里长了苔，说十六年后在这里相见，叫人别失信。'
        + (g.f('qinghuaPoison') ? '你手背上被情花刺过的地方，又隐隐疼了起来。' : '')
        + (g.f('jqSword') ? '你想起潭边拔出来的那柄君子剑。剑的主人，大概也在这崖上站过。' : ''),
      choices: [
        { t: '在崖边坐到天黑', fx: (g) => { g.add('资质', 0.5); g.restMp(999); }, res: '你想起了一个人。崖下的雾很深，看不见底。' },
        { t: '顺着崖壁往下探', check: ['轻功', '难'], fx: (g) => { g.set('jqCliffBottom'); g.add('轻功', 0.5); }, res: '崖下雾里是一个深潭，潭水底下透出一点光。你没敢再往下，记住了地方。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); }, res: '石头松了，你摔下去半丈，撞在一棵横出来的树上，才没掉下崖。' } },
        { t: '把自己的名字刻在旁边', fx: (g) => { g.add('声望', 1); g.add('品德', -1); }, res: '你刻完了，觉得刻得不好，又不好意思磨掉。' },
      ] },
    { id: 'jq_ex_pool', loc: 'jueqing', act: '潜进断肠崖下的寒潭', cond: (g) => g.f('jqCliffBottom'), t: '潭底',
      text: '你憋着气潜下去，潭底有一个洞口。钻过去，水面上是一个山洞，洞顶漏下天光。石床、石桌、一只破碗，墙上刻着一道一道的痕，密密麻麻。',
      choices: [
        { t: '数一数墙上的刻痕', fx: (g) => { g.add('品德', 2); g.add('资质', 0.5); }, res: '你数到后来数不清了。一道一天，少说也有五六千道。有人在这里等了很多年。' },
        { t: '在石床上打坐', check: ['根骨', '中'], fx: (g) => { g.add('内力', 2); const id = gateOf(g, '内功'); if (id) g.breakGate(id, '：潭底石洞里一个人也没有，你的心静到了底'); },
          res: '洞里没有一点声音。你坐了三天，内息走得又深又匀。', fail: { fx: (g) => g.hurt(40), res: '洞里太冷，你坐不住，牙齿一直打战。' } },
        { t: '从潭里捞几条白鱼烤了吃', fx: (g) => g.heal(999), res: '鱼是白的，没有眼睛。烤熟了很香。' },
      ] },
    // 发现：水仙庄的丹房
    { id: 'jq_ex_door', loc: 'jueqing', explore: 'jueqing', once: false, w: 3, t: '锁着的门', cond: (g) => !g.f('jqDan'),
      text: (g) => (again(g, 'jq_ex_door') ? '那间锁着的屋子还在厅堂后面。' : '水仙庄塌了一半的厅堂后面，有一间屋子的门还关着，门缝里飘出一股苦味。门上的锁锈死了。'),
      choices: [
        { t: '砸开锁', fx: (g) => { g.set('jqDan'); g.add('品德', -1); }, res: '屋里是一间丹房。药炉翻在地上，架子上还摆着几十个小瓷瓶，签子都糊了。' },
        { t: '翻窗进去', check: ['轻功', '易'], fx: (g) => g.set('jqDan'), res: '你从窗缝里钻了进去。屋里是一间丹房，架子上摆满了小瓷瓶。',
          fail: { fx: (g) => g.hurt(20), res: '窗框朽了，你连人带窗摔在地上，扎了一手的木刺。' } },
        { t: '不动它', res: '你绕开了那间屋子。' },
      ] },
    { id: 'jq_ex_dan', loc: 'jueqing', act: '去丹房翻找药瓶', cond: (g) => g.f('jqDan') && g.done('jq_ex_dan') < 3, once: false, t: '丹房',
      text: (g) => (again(g, 'jq_ex_dan') ? '丹房里的瓶子你翻过，剩下的不多了。' : '架子上的瓷瓶一排一排，有的空了，有的还有药。')
        + (g.f('qinghuaPoison') ? '一个瓶子的签子上，还认得出一个“绝”字。' : ''),
      choices: [
        { t: '挑几瓶闻得出是什么的', check: ['资质', '中'], fx: (g) => g.give('jiedu', 2), res: '你认出了两瓶解毒的药，用布包好了。',
          fail: { fx: (g) => { g.hurt(30); g.days(1); }, res: '你闻错了一瓶，头晕了一整天。' } },
        { t: '吞下签子上有“绝”字的那颗', cond: (g) => g.f('qinghuaPoison'), fx: (g) => { g.unset('qinghuaPoison'); g.cure(1); }, res: '丹药又黑又硬，苦得你直咧嘴。手背上的疼一下子没了。' },
        { t: '一瓶也不动', res: '你把门带上了。' },
      ] },
    // 季节：鳄鱼潭边的枣树
    { id: 'jq_ex_date', loc: 'jueqing', explore: 'jueqing', once: false, w: 2, t: '枣树',
      text: (g) => (again(g, 'jq_ex_date') ? '你又来到石窟上面。' : '鳄鱼潭边的石壁上有一个大窟窿，窟窿底下长着一棵老枣树，树根扎在石缝里。树下扔着一地枣核，枣核尖都磨得很利。')
        + (g.m >= 8 && g.m <= 9 ? '枣子熟了，红红地挂满了枝头。' : winter(g) ? '枣树光秃秃的，梢上挂着几个干瘪的枣子。' : '枣树开着细碎的黄花。')
        + (g.f('jqZaohe') ? '你上回捡的枣核还在怀里，磨得发亮。' : ''),
      choices: [
        { t: (g) => (g.m >= 8 && g.m <= 9 ? '爬下去打枣子吃' : '爬下去看看'), check: ['轻功', '中'],
          fx: (g) => { if (g.m >= 8 && g.m <= 9) { g.heal(999); g.restMp(60); } else g.add('资质', 0.3); },
          res: (g) => (g.m >= 8 && g.m <= 9 ? '枣子又甜又脆，你吃了一肚子。' : '窟窿底下有人住过，石壁上有手扒出来的印子。'),
          fail: { fx: (g) => g.hurt(40), res: '你脚下一滑，差点掉进鳄鱼潭，膝盖磕得青紫。' } },
        { t: '捡几枚枣核，练练暗器手法', fx: (g) => { g.set('jqZaohe'); g.add('攻击', g.done('jq_ex_date') <= 3 ? 0.5 : 0.2); }, res: '你对着树干弹了一下午，最后一枚钉进了树皮里。' },
        { t: '不下去', res: '你看了一会儿，走开了。' },
      ] },

    /* ---------- 古墓（秘地） ---------- */
    // 发现：玉蜂的蜂房
    { id: 'gm2_ex_bees', loc: 'gumu', explore: 'gumu', w: 3, t: '蜂房',
      text: '一间石室里嗡嗡作响。墙角挂着几个灰白色的蜂巢，玉蜂进进出出。巢下摆着几只陶罐，罐口用蜡封着。',
      choices: [
        { t: '打开一只陶罐', fx: (g) => { g.set('gmHoney'); g.heal(999); }, res: '罐里是半凝的蜂浆，又甜又凉。你喝了一口，身上的伤都不怎么疼了。蜂子没蜇你。' },
        { t: '学着墓里的人，用手势引蜂子', check: ['资质', '中'], fx: (g) => { g.set('gmHoney'); g.set('gmBeeCall'); g.add('资质', 0.5); }, res: '你比划了半天，几只蜂子跟着你的手绕了一圈，又落回了巢上。',
          fail: { fx: (g) => { g.hurt(30); g.set('gmHoney'); }, res: '蜂子蜇了你满脸。你捂着脸跑出去，记住了这间屋子。' } },
        { t: '别惊动它们', res: '你退了出去。' },
      ] },
    { id: 'gm2_ex_honey', loc: 'gumu', act: '去蜂房取玉蜂浆', cond: (g) => g.f('gmHoney') && !(g.f('gmHoneyDay') && g.day - g.f('gmHoneyDay') < 60), once: false, t: '玉蜂浆',
      text: (g) => (again(g, 'gm2_ex_honey') ? '你又来到蜂房。' : '你第一次来取蜂浆。') + (winter(g) ? '冬天蜂子都缩在巢里，蜜也少了。' : '蜂子正忙，巢里的蜜很多。'),
      choices: [
        { t: '装一罐带走', fx: (g) => { g.set('gmHoneyDay', g.day); g.give('jiedu', winter(g) ? 1 : 2); }, res: '蜂浆能解毒，也能治伤。你用蜡把罐口封好了。' },
        { t: (g) => (g.f('gmBeeCall') ? '引一群蜂子出来，练练手法' : '坐在蜂房里喝个够'),
          fx: (g) => { g.set('gmHoneyDay', g.day); if (g.f('gmBeeCall')) { g.add('资质', 0.5); g.add('轻功', 0.3); } else { g.heal(999); g.restMp(999); } },
          res: (g) => (g.f('gmBeeCall') ? '蜂子跟着你的手走，绕过石柱，又绕回来。你的手越来越稳。' : '你喝得满嘴是蜜，浑身暖洋洋的。') },
      ] },
    // 门派、品德：林朝英的画像
    { id: 'gm2_ex_portrait', loc: 'gumu', explore: 'gumu', w: 3, t: '画像',
      text: (g) => '一间石室的正墙上挂着一幅画，画上是两个女子，一个对着镜子梳头，一个丫鬟捧着盆。梳头的那个只画了背影。画边有一行小字：古墓派祖师林朝英。'
        + (g.sect === 'quanzhen' ? '全真教里有个老规矩，进了古墓要朝这幅画吐一口唾沫。师兄们当笑话讲过。'
          : g.sect === 'emei' ? '你想起后殿老尼说过，郭襄祖师年轻时也找过古墓里的人。' : ''),
      choices: [
        { t: '照全真的规矩，朝画像吐一口唾沫', cond: (g) => g.sect === 'quanzhen', fx: (g) => { g.add('品德', -2); g.set('gmSpat'); }, res: '你吐完了，石室里静得很。你有点后悔。' },
        { t: '在画像前磕三个头', fx: (g) => { g.add('品德', 2); g.set('gmBowed'); },
          res: (g) => (g.sect === 'quanzhen' ? '你没照规矩吐唾沫，磕了三个头。画上的背影好像动了一下。' : '你磕了三个头。墓里很冷，画上的人穿得很单。') },
        { t: '取下画看看背面', need: ['品德', 50], check: ['资质', '难'], fx: (g) => g.add('轻功', 1), res: '画背面写着几行小字，讲的是一门轻身的心法。你默记了下来，又把画挂了回去。',
          fail: { res: '背面的字写得太草，你一个也认不出。你把画挂了回去。' } },
      ] },
    // 回响：石室顶上的刻字
    { id: 'gm2_ex_carving', loc: 'gumu', explore: 'gumu', w: 3, t: '屋顶',
      text: (g) => '你在一间石室里抬头，看见屋顶上刻满了字和小人儿，一招一式。最上面一行大字，字迹苍劲，说全真的祖师这辈子没输给过谁。'
        + (g.f('gmCeiling') ? '你在石棺盖底下见过同一个人的字。' : '')
        + (g.lv('yunv') ? '屋顶上的招式，处处都在破你墙上学来的玉女剑法。' : '')
        + (g.f('gmSpat') ? '你想起在画像前吐的那口唾沫，脸上有点发烫。' : g.f('gmBowed') ? '你想起画像上那个看不清脸的背影。两个人斗了一辈子，到头来谁也没赢。' : '')
        + (g.f('sawGumu') ? '你在墓外的野花前站过一回，没想到墓里是这个样子。' : ''),
      choices: [
        { t: '踩着石桌，照屋顶上的招式练', check: ['资质', '难'],
          fx: (g) => { const id = gateOf(g, '兵器'); if (!(id && g.breakGate(id, '：屋顶上破剑法的招式，反过来点醒了你'))) g.add('攻击', 1); },
          res: '你仰着脖子练到半夜，脖子酸得转不动。可那些招式，你记住了。', fail: { res: '屋顶太高，字太小，你看得眼花。' } },
        { t: '拓下来，带给重阳宫守经楼的老道', fx: (g) => { g.days(1); g.like('qz_laodao', 6); g.add('品德', 1); }, res: '你用衣襟蘸着灰拓了一夜。守经楼的老道见了，一定认得这是谁的字。' },
        { t: '不看了', res: '你低下头，屋顶上的字还压在心里。' },
      ] },
  ]);
})();

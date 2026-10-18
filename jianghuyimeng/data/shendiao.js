/* 江湖一梦 · 神雕侠侣
 * 可玩：杨过、小龙女、郭芙、郭襄、李莫愁
 * 本书配角：孙婆婆、金轮法王、公孙止、公孙绿萼、耶律齐、郭破虏、陆无双、程英、武敦儒、武修文、赵志敬、蒙哥、霍都
 */
(function () {
  'use strict';
  const JY = window.JY;
  const BOOK = '神雕侠侣';

  /* ---------- 读别的书的结果 ---------- */
  // 人物没有被定义（只载入本书测试时）就按原著当作活着
  const live = (g, id) => !JY.byId[id] || g.alive(id);
  const dad = (g) => g.f('yangkangLives') && live(g, 'yangkang');
  const mom = (g) => (JY.byId.munianci ? g.alive('munianci') : g.Y < 31 || g.f('munianciLives'));
  const jing = (g) => !g.f('jingStayMongol') && live(g, 'guojing');
  const rong = (g) => !g.f('rongDied') && live(g, 'huangrong');
  const couple = (g) => jing(g) && rong(g) && !g.f('jingrongApart');
  const guoKids = (g) => !g.f('jingrongApart') && !g.f('rongDied');
  const inTomb = (g) => !g.f('yangNoTomb');
  // 杨过没进古墓时有三条路：被郭靖带在身边（射雕的选择）、在全真教熬下来（本书的选择）、被父母留在嘉兴（射雕的选择）
  const guoPath = (g) => !inTomb(g) && g.f('yangguoRaisedByGuo');
  const qzPath = (g) => !inTomb(g) && !g.f('yangguoRaisedByGuo') && g.f('ygQuanzhen');
  const homePath = (g) => !inTomb(g) && !g.f('yangguoRaisedByGuo') && !g.f('ygQuanzhen');
  const hero = (g) => inTomb(g) || guoPath(g); // 会去剑冢、拿玄铁、成神雕侠的杨过
  const inXY = (g) => jing(g) && !g.f('guoLeftXiangyang');
  const together = (g) => g.f('reunionEarly') || g.f('longStayed');
  const lmcVillain = (g) => live(g, 'limochou') && !g.f('mochouNoLu');
  const oneArm = (g) => (g.isMe('yangguo') ? g.f('ygOneArm') : hero(g) && g.exists('guofu') && !g.f('guofuGentle') && !g.f('yangArm'));
  const parents = (g) => (couple(g) ? '爹娘' : jing(g) ? '爹' : rong(g) ? '娘' : '家里人');
  // 杨过十三岁那年没上桃花岛：半路溜走被柯镇恶送去全真，或者父母尚在、留在嘉兴没跟郭靖走。这时他和郭芙、武氏兄弟没有一起长大
  const noTaohua = (g) => g.f('ygRanAway') || (g.f('yangNoTomb') && !g.f('yangguoRaisedByGuo') && !g.f('ygQuanzhen') && (g.f('yangkangLives') || g.f('munianciLives')));
  // 嘉兴陆家庄有没有被血洗（武三娘、陆家夫妇死于李莫愁之手）
  const lujiaKilled = (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared');

  JY.addFlags({
    mochouNoLu: '李莫愁没有爱上陆展元，世上没有赤练仙子',
    lujiaSpared: '嘉兴陆家庄没有被血洗',
    gumuNoHeir: '杨过、小龙女没有把古墓武功传给后人',
    yangAbsent57: '杨过没有去襄阳解围，蒙哥死在了钓鱼城下',
    xiexunWarned: '年轻的谢逊被郭襄提醒过要提防师父成昆',
    junbaoWithXiang: '少年张君宝跟着郭襄走了几年江湖',
    swordInTomb: '玄铁重剑在终南山古墓里多埋了十几年',
    guoxiangMarried: '郭襄嫁了人',
    gfKidsOut: '郭芙的孩子在城破前被送出了襄阳',
    xlSharedSister: '小龙女小时候把玉女心经偷偷教给了师姐李莫愁',
    xlWithYang: '小龙女和杨过一起下了终南山',
    jqSlipped: '杨过带小龙女连夜离开绝情谷，没有中情花毒',
    ygWedCheng: '杨过在江边娶了程英',
    ygNoReunion: '十六年之约，杨过没有去',
    ygLateTomb: '杨过在全真教熬到中年，还俗进了古墓',
  });

  /* ---------- 人物 ---------- */
  JY.addChars([
    /* ===================== 杨过 ===================== */
    {
      id: 'yangguo', name: '杨过', py: 'YANG<<GUO', book: BOOK, sex: '男', born: 20,
      origin: '杨康之子，嘉兴长大的孤儿',
      birthplace: '嘉兴', home: 'jiaxing', bg: 1,
      info: { 门派: '无', 身份: '孤儿' },
      look: { hair: 'long', hairColor: '#1f1a17', robe: '#5d6b5a', accent: '#c9c2a8' },
      family: [{ rel: '母亲', id: 'munianci', name: '穆念慈' }, { rel: '父亲', id: 'yangkang', name: '杨康', note: '你出生前死在嘉兴铁枪庙' }],
      fateText: '被郭芙斩断右臂，得独孤求败剑冢，人称神雕侠。与小龙女断肠崖一别十六年，重逢后飞石击毙蒙哥，与小龙女归隐古墓。',
      st: [72, 85, 50, 70, 5, 0, 10],
      death: (g) => {
        if (g.f('ygNoReunion')) return { y: 88, cause: '在江边的草庐里寿终', mod: true };
        if (inTomb(g)) return { y: 95, cause: '在终南山古墓无疾而终' };
        if (guoPath(g)) return g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 90, cause: '在桃花岛寿终', mod: true } : { y: 71, cause: '襄阳城破时与郭靖并肩战死', mod: true };
        if (qzPath(g)) return g.f('ygLateTomb') ? { y: 90, cause: '在终南山古墓里与小龙女一同终老', mod: true } : { y: 88, cause: '在重阳宫羽化', mod: true };
        return { y: 85, cause: '在嘉兴老家寿终', mod: true };
      },
      ms: [
        [20, '生于嘉兴'],
        [31, '母亲病逝，在嘉兴街头流浪', (g) => !g.f('munianciLives') && !dad(g) && !g.f('yangguoRaisedByGuo')],
        [33, '认欧阳锋做义父，学了蛤蟆功'],
        [33, '被郭靖带上桃花岛', (g) => jing(g) && !g.f('yangguoRaisedByGuo')],
        [33, '黄蓉把他当亲生孩子教', (g) => g.f('rongTaughtYang')],
        [33, '跟着郭靖学武', guoPath],
        [34, '在全真教受尽欺负', (g) => inTomb(g) || qzPath(g)],
        [34, '留在嘉兴家中', homePath],
        [34, '逃进古墓，拜小龙女为师', inTomb],
        [36, '在重阳宫做个规规矩矩的道士', qzPath],
        [36, '在襄阳城头帮郭靖守城', guoPath],
        [39, '大胜关上当众说要娶师父', inTomb],
        [39, '大胜关上打退金轮法王', guoPath],
        [40, '被郭芙斩断右臂', (g) => hero(g) && g.exists('guofu') && !g.f('guofuGentle') && !g.f('yangArm')],
        [40, '得了独孤求败的玄铁重剑', hero],
        [41, '与小龙女断肠崖一别，约定十六年', (g) => inTomb(g) && !together(g)],
        [41, '与小龙女隐居谷底', (g) => inTomb(g) && together(g)],
        [44, '人称神雕侠', (g) => hero(g) && !together(g)],
        [50, '做了全真教掌教', (g) => qzPath(g) && !g.f('ygLateTomb')],
        [50, '还俗，进了终南山古墓', (g) => g.f('ygLateTomb')],
        [51, '娶了程英', (g) => g.f('ygWedCheng')],
        [50, '在嘉兴开了一家武馆', homePath],
        [57, '与小龙女重逢，飞石击毙蒙哥', (g) => inTomb(g) && !g.f('yangAbsent57') && !g.f('ygNoReunion')],
        [57, '没有去赴十六年之约', (g) => g.f('ygNoReunion')],
        [57, '飞石击毙蒙哥', (g) => guoPath(g) && !g.f('yangAbsent57')],
        [57, '第三次华山论剑，号称西狂', hero],
        [58, '与小龙女归隐终南山古墓', inTomb],
      ],
      arc: {
        focus: '玩耍交友',
        intro: (g) => (dad(g)
          ? '纪年 20 年，你生在嘉兴。父亲杨康从铁枪庙捡回一条命，抱你的时候手在抖。母亲穆念慈给你取名杨过。'
          : '纪年 20 年，你生在嘉兴城外一座破窑里。你出生前，父亲杨康已经死在铁枪庙。母亲穆念慈抱着你，没有哭。'),
        lastWords: '龙儿，我先走一步。',
        nodes: [
          { id: 'yg_birth', age: 0, auto: true, t: '破窑', loc: 'jiaxing', text: (g) => (dad(g) ? '父母带着你住在嘉兴乡下。父亲很少出门，像在躲什么人。' : '母亲靠给人缝补度日。破窑漏雨，她把你裹在怀里。'),
            fx: (g) => { g.party(dad(g) ? ['munianci', 'yangkang'] : ['munianci']); if (dad(g)) g.rel('父亲', 'yangkang'); } },
          { id: 'yg_letters', age: 5, auto: true, t: '识字', text: (g) => (dad(g) ? '父亲教你写自己的名字，写到“杨”字时停了很久。' : '母亲教你认字。她说你单名一个“过”字，人总会有过错，要紧的是能改。你问她父亲是谁，她只说：“他是个可怜人。”'), fx: (g) => g.stat('悟性', 3) },
          // ---- 童年：知不知道父亲的事，决定了后来裘千尺那句话能不能挑动你 ----
          { id: 'yg_spear', age: 7, t: '铁枪', cond: dad, text: '父亲教你读书，却从不让你碰兵器。你在他箱底翻到一杆生了锈的铁枪。', choices: [
            { t: '问他这杆枪的来历', canon: true, fx: (g) => { g.stat('悟性', 2); g.stat('情义', 3); g.remember('ygHeardTruth'); }, res: '父亲沉默了很久，说那是你爷爷杨铁心的枪。那天夜里，他把牛家村、赵王府、铁枪庙的事都讲了。讲到最后，他说：“过儿，别学我。”' },
            { t: '求父亲教你杨家枪', dev: 15, check: ['情义', 50], fx: (g) => { g.stat('武学', 5); g.info('武功', '杨家枪'); g.remember('ygSpear'); }, res: '父亲犹豫了很久，还是教了你几路杨家枪。从此你夜里常在院子里练枪，练到他睡下。',
              fail: { fx: (g) => g.stat('心境', -3), res: '父亲把枪收了起来：“读书去。”', dev: 0 } },
          ] },
          { id: 'yg_box', age: 9, t: '木箱', cond: (g) => !dad(g), text: '母亲出门洗衣裳，你打开了她从不让你碰的木箱。箱底压着一块绣着字的手帕。', choices: [
            { t: '合上箱子，放回原处', canon: true, fx: (g) => g.stat('情义', 2), res: '你什么也没看见。母亲回来时，你在门口等她。' },
            { t: '展开手帕', dev: 10, fx: (g) => { g.stat('悟性', 3); g.stat('心境', -5); g.info('身世', '杨康之子'); g.remember('ygKnowsFather'); }, res: '手帕上绣着“杨康”两个字。你把这个名字记在心里，没跟任何人说。' },
            { t: '等母亲回来，直接问她', dev: 15, check: ['情义', 45], fx: (g) => { g.stat('情义', 4); g.info('身世', '杨康之子'); g.remember('ygHeardTruth'); }, res: '母亲沉默了很久，把铁枪庙的事告诉了你。你父亲认贼作父，最后是自己害死了自己。她说完就哭了。你记住了每一个字。',
              fail: { fx: (g) => { g.stat('心境', -4); g.remember('ygKnowsFather'); }, res: '母亲把箱子锁上了，只说了一句：“你爹姓杨，叫杨康。”', dev: 0 } },
          ] },
          { id: 'yg_mom', y: 31, auto: true, t: '母亲', cond: (g) => !g.f('munianciLives') && live(g, 'munianci'),
            text: (g) => (dad(g) ? '母亲病了一冬，没有熬过去。父亲守着她的坟，三天没说话。'
              : g.recall('ygHeardTruth') ? '母亲病了一冬，没有熬过去。临终前她拉着你的手：“你爹的事，你都知道了。别恨他，也别学他。”'
                : '母亲病了一冬，没有熬过去。临终前她拉着你的手说：“过儿，你爹……不是坏人。”'),
            fx: (g) => { g.kill('munianci', '在嘉兴病逝', true); g.stat('心境', -20); g.party(dad(g) ? ['yangkang'] : []); if (!dad(g)) g.info('身份', '流浪儿'); } },
          // ---- 十三岁：疯老头、银针、郭伯伯 ----
          { id: 'yg_oyf', y: 33, t: '疯老头', loc: 'jiaxing', cond: (g) => live(g, 'ouyangfeng'), text: '一个疯疯癫癫的白发老头倒立着走路，拦住你，非要你叫他“爸爸”，说叫了就教你天下第一的武功。', choices: [
            { t: '叫他“爸爸”', canon: true, fx: (g) => { g.stat('武学', 8); g.rel('义父', 'ouyangfeng'); g.info('武功', '蛤蟆功'); }, res: '他高兴得翻了三个跟头，教你蛤蟆功的口诀。他说他叫欧阳锋。' },
            { t: '告诉他：我爹叫杨康', cond: (g) => dad(g) || g.recall('ygKnowsFather') || g.recall('ygHeardTruth'), dev: 10, fx: (g) => { g.stat('武学', 6); g.rel('义父', 'ouyangfeng'); g.info('武功', '蛤蟆功'); g.remember('ygOyfKnew'); }, res: '他愣住了，抱着头喊了半天“克儿”。最后他说：“杨康的儿子，就是我的儿子。”他教你蛤蟆功，教得比谁都用心。' },
            { t: '拔腿就跑', dev: 15, fx: (g) => { g.stat('根骨', 1); g.stat('心境', -2); g.remember('ygNoToad'); }, res: '他倒立着追了你三条街，最后躺在地上数星星。你没学到他的功夫，也不欠他什么。' },
          ] },
          { id: 'yg_needle', y: 33, t: '冰魄银针', cond: lmcVillain, text: '陆家庄出了事，一个美貌道姑杀了满门，还掳走了陆家瘸腿的小女儿。你在路边捡到几枚亮晶晶的银针，手掌立刻黑了一片。', choices: [
            { t: '去求那个道姑给解药', canon: true, fx: (g) => { g.stat('根骨', -8); g.stat('悟性', 2); }, res: '道姑笑着说这毒只有她能解，然后丢下你走了。是那个疯老头追上来，替你逼出了毒。' },
            { t: '用布裹着手，把剩下的银针收起来', dev: 10, fx: (g) => { g.stat('根骨', -8); g.stat('正邪', -2); g.info('暗器', '冰魄银针'); g.remember('ygNeedles'); }, res: '你手里多了几枚银针。中毒的那只手，还是靠那个疯老头才保住。你记住了那道姑的脸。' },
            { t: '夜里跟上去，把陆家的小姑娘偷出来', dev: 20, check: ['悟性', 60], fx: (g) => { g.stat('根骨', -8); g.stat('声望', 3); g.rel('义妹', 'luwushuang'); g.remember('ygSavedLu'); }, res: '你趁道姑睡着，背着那个瘸腿的小姑娘跑了一夜。她叫陆无双，一路骂你傻蛋。你把她送到了她表姐程英那里。',
              fail: { fx: (g) => g.stat('根骨', -14), res: '道姑醒了。她看了你一眼，笑着把你扔进了河里。手上的毒，是那个疯老头替你逼出来的。', dev: 0 } },
          ] },
          { id: 'yg_guo', y: 33, t: '郭伯伯', cond: (g) => jing(g) && !g.f('yangguoRaisedByGuo'), text: (g) => (dad(g)
            ? '郭靖来嘉兴看你父亲。两个人喝了一夜酒，第二天父亲说，让郭伯伯带你去学武。'
            : couple(g) ? '一对夫妇在嘉兴找到了你。男的看着你的脸，眼圈红了：“你是杨康兄弟的孩子？”他叫郭靖，女的叫黄蓉。'
              : '一个憨厚的汉子在嘉兴找到了你，说他是你父亲的结义兄弟郭靖。'), choices: [
            { t: '跟他走', canon: true, fx: (g) => { g.rel('义伯', 'guojing'); g.move('taohua'); g.party(['guojing']); }, res: '他带你上了一条船。船往东开，开向一个叫桃花岛的地方。' },
            { t: '要他先说清楚，我爹是怎么死的', dev: 10, check: ['悟性', 55], fx: (g) => { g.stat('悟性', 3); g.rel('义伯', 'guojing'); g.move('taohua'); g.party(['guojing']); g.remember('ygHeardTruth'); }, res: '他想了很久，把铁枪庙的事说了。他说得很笨，一句也没替自己开脱。你信了，跟他上了船。',
              fail: { fx: (g) => { g.stat('心境', -4); g.rel('义伯', 'guojing'); g.move('taohua'); g.party(['guojing']); }, res: '他支支吾吾，你憋着一肚子疑问上了船。', dev: 0 } },
            { t: '不信他，半夜溜走', dev: 20, fx: (g) => { g.set('ygRanAway'); g.stat('心境', 2); }, res: '你没跑多远，就被一个瞎眼老头用铁杖拦住了。他叫柯镇恶，要把你送去终南山全真教。' },
          ] },
          { id: 'yg_ke', y: 33, auto: true, t: '柯镇恶', cond: (g) => !jing(g) && live(g, 'kezhene'),
            text: (g) => (g.f('jingStayMongol') ? '郭靖留在了蒙古。' : '郭靖已经不在人世。') + '一个瞎眼老头用铁杖拦住你，说他叫柯镇恶，是郭靖的师父。他要把你送上终南山全真教。',
            fx: (g) => g.rel('引路人', 'kezhene') },
          { id: 'yg_taohua', y: 33, t: '桃花岛', loc: 'taohua', cond: (g) => couple(g) && !g.f('ygRanAway'), text: '桃花岛上，郭芙和武家兄弟总找你的麻烦。这天，武修文一拳打在你脸上，郭芙在旁边拍手。', choices: [
            { t: '用蛤蟆功还他一掌', canon: true, cond: (g) => !g.recall('ygNoToad'), fx: (g) => { g.stat('武学', 3); g.stat('声望', -3); g.stat('心境', -3); }, res: '武修文飞了出去。郭伯母看你的眼神冷了。郭伯伯叹了口气，决定送你去全真教。' },
            { t: '抄起板凳砸回去', canon: true, cond: (g) => !!g.recall('ygNoToad'), fx: (g) => { g.stat('武学', 1); g.stat('声望', -3); g.stat('心境', -3); }, res: '板凳砸在武修文背上，碎成了两截。郭伯母看你的眼神冷了。郭伯伯叹了口气，决定送你去全真教。' },
            { t: '忍下这一拳', dev: 15, fx: (g) => { g.stat('情义', 3); g.stat('心境', -6); g.remember('ygSwallowed'); }, res: '你没有还手，也没有哭。郭芙不笑了，盯着你看了很久。郭伯伯还是决定送你去全真教学正经武功。' },
            { t: '对郭芙说“你笑起来真好看”', dev: 10, check: ['悟性', 55], fx: (g) => { g.stat('情义', 3); g.stat('心境', 4); g.remember('ygFlirtFu'); }, res: '郭芙脸红了，武家兄弟不知所措。郭伯母说这孩子太油滑，还是送去全真教。可郭芙送你上船时，塞给你一包点心。',
              fail: { fx: (g) => g.stat('心境', -4), res: '郭芙骂你流氓。武家兄弟又打了你一顿。', dev: 0 } },
          ] },
          { id: 'yg_books', y: 33, auto: true, t: '读书', cond: (g) => couple(g) && !g.f('ygRanAway'), text: (g) => (g.f('rongTaughtYang') ? '郭伯母把你当亲生孩子教，读书、练武，样样都教。你第一次觉得有人在等你长大。' : '郭伯母教你读书，从不教你武功。她教你《论语》，你背得很快，却总爱挑书里的毛病。'), fx: (g) => { g.stat('悟性', 4); if (g.f('rongTaughtYang')) g.stat('武学', 5); } },
          // ---- 十四岁：全真教还是古墓，一辈子的分岔 ----
          { id: 'yg_quanzhen', y: 34, t: '重阳宫', loc: 'zhongnan', cond: (g) => !g.f('yangNoTomb'), text: '全真教的赵志敬做了你的师父。他不教你武功，只让你背口诀。师兄鹿清笃天天拿你练拳。今天门内小较，他又冲你来了。', choices: [
            { t: '打翻鹿清笃，逃出重阳宫', canon: true, fx: (g) => { g.stat('武学', 2); g.stat('根骨', -5); g.info('门派', '全真教（叛出）'); }, res: '你逃进后山的林子，迷了路，被一群玉蜂追着蛰。一个老婆婆把你救进了一座古墓。' },
            { t: '忍下去，在全真教熬出个样子', dev: 40, fx: (g) => { g.set('yangNoTomb'); g.set('ygQuanzhen'); g.info('门派', '全真教'); g.rel('师父', 'zhaozhijing'); g.stat('武学', 4); g.stat('心境', -8); }, res: '你在重阳宫熬了下来。后山那座古墓，你一辈子没有进去过。' },
            { t: '去找掌教丘处机评理', dev: 30, check: ['悟性', 60], fx: (g) => { g.set('yangNoTomb'); g.set('ygQuanzhen'); g.info('门派', '全真教'); g.rel('师父', 'qiuchuji'); g.remember('ygQiuDisciple'); g.stat('武学', 6); g.stat('声望', 3); }, res: '丘处机听完，把赵志敬骂了一顿，当场收你做了亲传弟子。后山那座古墓，你后来只远远看过几眼。',
              fail: { fx: (g) => { g.stat('心境', -4); g.info('门派', '全真教（叛出）'); }, res: '丘处机在闭关，你连门都没进去。当晚你逃出重阳宫，在后山被一个老婆婆救进了一座古墓。', dev: 0 } },
          ] },
          { id: 'yg_sunpopo', y: 34, auto: true, t: '孙婆婆', loc: 'gumu', cond: inTomb,
            text: '救你的老婆婆姓孙。全真道士追到墓前，郝大通一掌误伤了她。她临死前求墓里的姑娘照顾你。那姑娘一身白衣，比你大四岁，叫小龙女。她让你睡在一张寒玉床上，说睡一年抵得上练十年。',
            fx: (g) => { g.kill('sunpopo', '被全真教郝大通误伤而死', true); g.rel('师父', 'xiaolongnv'); g.unrel('义伯'); g.info('门派', '古墓派'); g.info('身份', '古墓派弟子'); g.party(['xiaolongnv']); g.stat('武学', 6); g.stat('根骨', 3); } },
          { id: 'yg_gugu', y: 36, t: '姑姑', cond: inTomb, text: '姑姑教你捉麻雀、练玉女剑法。她说古墓派的人不能动情，可她看你的时候，眼神越来越软。', choices: [
            { t: '一辈子守着姑姑，不说出口', canon: true, fx: (g) => { g.stat('情义', 8); g.stat('武学', 4); }, res: '你在心里发了誓，没有说出口。' },
            { t: '告诉姑姑：我长大了要娶你', dev: 20, fx: (g) => { g.stat('情义', 6); g.stat('心境', 4); g.remember('ygConfessed'); }, res: '姑姑愣了很久，说：“古墓派的人不能动情。”那天夜里，你听见她在石室里翻来覆去。从此她看你的眼神，再也冷不回去了。' },
            { t: '劝姑姑跟你一起出墓看看', dev: 15, check: ['情义', 50], fx: (g) => { g.stat('心境', 4); g.set('xlWithYang'); }, res: '姑姑说外面的人都很坏。你说：“那我陪你一起看。”过了一年，她真的跟你一起下了终南山。',
              fail: { fx: (g) => g.stat('心境', -2), res: '姑姑摇了摇头，把墓门关得更紧了。', dev: 0 } },
          ] },
          { id: 'yg_qz1', y: 36, t: '全真弟子', cond: qzPath, text: (g) => (g.recall('ygQiuDisciple') ? '丘处机亲自教你。他脾气急，教得却毫无保留。' : '你在重阳宫熬了两年，赵志敬终于肯教你真功夫了。'), choices: [
            { t: '老老实实地学', canon: true, fx: (g) => { g.stat('武学', 8); g.stat('心境', -2); }, res: '你学会了全真剑法，也学会了不说话。' },
            { t: '夜里偷看藏经阁里的秘籍', dev: 10, check: ['悟性', 55], fx: (g) => { g.stat('武学', 10); g.stat('悟性', 3); g.remember('ygChongyangNotes'); }, res: '你在书架最顶上找到一本王重阳的手稿，后面几页写的竟是怎么破古墓派的武功。你把它抄了下来。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你被抓住了，罚面壁三个月。', dev: 0 } },
            { t: '去求郝大通师叔收你', cond: (g) => !g.recall('ygQiuDisciple'), dev: 15, check: ['声望', 15], fx: (g) => { g.stat('武学', 6); g.stat('心境', 3); g.rel('师父', '郝大通'); }, res: '郝师叔收了你。他话少，教得却实在。赵志敬从此不敢再为难你。',
              fail: { fx: (g) => g.stat('心境', -4), res: '赵志敬知道了，罚你挑了一个月的水。', dev: 0 } },
          ] },
          { id: 'yg_stone', y: 37, t: '断龙石', cond: (g) => inTomb(g) && lmcVillain(g) && !g.f('limochouLives'), text: '李莫愁带着徒弟闯进古墓，要抢《玉女心经》。姑姑放下了断龙石，墓门永远封死了。“过儿，我们一起死在这里。”', choices: [
            { t: '陪姑姑死在墓里', canon: true, fx: (g) => { g.stat('情义', 6); g.stat('悟性', 3); }, res: '你们在墓里摸索了几天，在一间石室顶上发现了王重阳留下的刻字，又找到一条出墓的暗河。' },
            { t: '对她说：陆展元的坟就在嘉兴，我带你去', dev: 25, check: ['情义', 55], fx: (g) => { g.set('limochouLives'); g.stat('情义', 5); }, res: '李莫愁的拂尘停在半空。她跟你出了墓，在陆展元的坟前坐了一夜。天亮时她说：“小子，你走吧。”江湖上从此少了一个赤练仙子。', chron: '杨过在古墓里劝退了李莫愁，带她去了陆展元的坟前。',
              fail: { fx: (g) => g.stat('根骨', -8), res: '她一拂尘把你扫到墙上：“你也配提他？”你们最后还是从暗河逃了出去。', dev: 5 } },
            { t: '用她自己的冰魄银针，逼她交出解药', cond: (g) => !!g.recall('ygNeedles'), dev: 15, check: ['武学', 45], fx: (g) => { g.stat('声望', 3); g.remember('ygNeedleCure'); }, res: '银针擦着她的脸飞过去。她第一次正眼看你，扔下一个小瓷瓶和一张方子，退出了古墓。方子你贴身收着。',
              fail: { fx: (g) => g.stat('根骨', -8), res: '银针被她的拂尘卷走了。你们最后还是从暗河逃了出去。', dev: 0 } },
          ] },
          { id: 'yg_qztomb', y: 38, t: '后山古墓', loc: 'zhongnan', cond: (g) => qzPath(g) && live(g, 'xiaolongnv'), text: '你在后山砍柴，看见古墓门口站着一个白衣姑娘。全真教规定，弟子不得靠近古墓。', choices: [
            { t: '转身走开', canon: true, fx: (g) => g.stat('心境', -3), res: '那以后你常去后山砍柴，再没见过她。' },
            { t: '走过去跟她说话', dev: 30, check: ['情义', 50], fx: (g) => { g.stat('情义', 8); g.rel('知己', 'xiaolongnv'); g.remember('ygMetLong'); }, res: '她问你外面的世界是什么样子。你说了一个下午。临走时她问：“你明天还来吗？”',
              fail: { res: '她看了你一眼，进墓去了。', dev: 0 } },
            { t: '回去向师父禀报', dev: 10, fx: (g) => { g.stat('正邪', 2); g.stat('情义', -3); g.stat('声望', 2); g.remember('ygReported'); }, res: '师父夸你守规矩。那以后，后山多了两个巡山的道士，古墓的门再也没开过。' },
          ] },
          { id: 'yg_huashan', y: 38, auto: true, t: '华山', loc: 'huashan', cond: (g) => live(g, 'hongqigong') && live(g, 'ouyangfeng'),
            text: (g) => (inTomb(g) ? (g.f('xlWithYang') ? '你陪姑姑下山看世界，' : '姑姑不告而别。你下山找她，') : qzPath(g) ? '你奉师命去华山采药，' : guoPath(g) ? '你替郭伯伯去华山送信，' : '你一个人去华山游历，')
              + '在华山绝顶看见两个老人在雪里比武：一个是西毒欧阳锋，一个是北丐洪七公。他们打了一夜，最后抱在一起大笑着死了。'
              + (g.recall('ygOyfKnew') ? '欧阳锋咽气前清醒了一刻，叫了你一声“杨康的儿子”。' : g.recall('ygNoToad') ? '那个疯老头没认出你。' : ''),
            fx: (g) => { g.stat('武学', 6); g.stat('心境', -5); g.info('武功', '打狗棒法招式'); g.move('road'); } },
          { id: 'yg_lu', y: 38, t: '傻蛋', cond: (g) => inTomb(g) && lmcVillain(g) && !g.f('limochouLives') && live(g, 'luwushuang') && !g.recall('ygSavedLu'),
            text: (g) => (g.f('xlWithYang') ? '你和姑姑在路上' : '路上你') + '遇见一个瘸腿姑娘，被赤练仙子追杀。她叫陆无双，骂你“傻蛋”。', choices: [
            { t: '扮成傻小子，一路护着她', canon: true, fx: (g) => { g.stat('情义', 4); g.stat('声望', 2); g.rel('义妹', 'luwushuang'); }, res: '你们一路吵着向北走。后来你们结拜成了兄妹。' },
            { t: '带她去找她表姐程英', dev: 10, fx: (g) => { g.stat('情义', 3); g.rel('义妹', 'luwushuang'); g.remember('ygMetCheng'); }, res: '你们在一座小庵里找到了程英。三个人在灯下吃了一顿饭。程英替你缝好了袖口，一句话也没多说。' },
          ] },
          // ---- 二十岁前后：大胜关、绝情谷、断臂 ----
          { id: 'yg_dsg', y: 39, t: '大胜关', loc: 'road', cond: (g) => inTomb(g) && live(g, 'xiaolongnv'),
            text: (g) => (g.f('xlWithYang') ? '你和姑姑一起来到大胜关。' : '你在大胜关找到了姑姑。') + '英雄大会上，你们打退了金轮法王。可天下英雄都知道了你们的事。' + (jing(g) ? '郭伯伯拍着桌子说：师徒相恋，天理不容。' : '全真教的道士们说：师徒相恋，天理不容。'), choices: [
            { t: '当着天下人说：“我偏要娶她。”', canon: true, fx: (g) => { g.stat('声望', -8); g.stat('情义', 5); g.stat('正邪', -3); }, res: '姑姑走了。她不想你为她跟全天下作对。' },
            { t: '握住姑姑的手：“我说过的话，再说一遍。”', cond: (g) => !!g.recall('ygConfessed'), dev: 25, fx: (g) => { g.set('xlStayed39'); g.stat('声望', -8); g.stat('情义', 6); }, res: '姑姑没有走。她在天下英雄面前握紧了你的手。你们一起走出大胜关，身后一片骂声。' },
            { t: '先认下“姑姑”两个字，以后再说', dev: 20, fx: (g) => { g.set('ygHid'); g.stat('心境', -5); }, res: '姑姑没有走。她只是很久没跟你说话。' },
            { t: '拉着姑姑的手，当场就走', dev: 20, check: ['情义', 60], fx: (g) => { g.set('xlStayed39'); g.stat('情义', 6); g.stat('声望', -5); }, res: '你们走出大胜关，身后一片骂声。那天夜里，姑姑靠着你睡着了。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你们走出大胜关，身后一片骂声。那天夜里，姑姑还是一个人走了。', dev: 0 } },
          ] },
          { id: 'yg_jueqing', y: 40, t: '绝情谷', loc: 'jueqing', cond: (g) => inTomb(g) && live(g, 'xiaolongnv'),
            text: (g) => (g.f('ygHid') || g.f('xlStayed39') ? '你们误入绝情谷。谷主公孙止看中了姑姑，三天后就要娶她。' : '你一路找到绝情谷，看见姑姑穿着嫁衣，要嫁给谷主公孙止。'), choices: [
            { t: '闯进婚堂', canon: true, fx: (g) => { g.set('ygPoison'); g.stat('根骨', -10); g.stat('声望', 3); }, res: '你在情花丛里滚了几滚，中了情花毒。从此一动情，心口就像针扎。' },
            { t: '先摸清谷里的机关，夜里带她走', dev: 20, check: ['悟性', 65], fx: (g) => { g.set('jqSlipped'); g.stat('悟性', 3); }, res: '你们半夜出了谷。公孙止追到谷口，扑了个空。你身上一根情花刺也没扎到。',
              fail: { fx: (g) => { g.set('ygPoison'); g.stat('根骨', -10); }, res: '你踩中了机关，跌进情花丛里。', dev: 0 } },
            { t: '求公孙绿萼帮你', cond: (g) => live(g, 'gongsunlve'), dev: 20, check: ['情义', 55], fx: (g) => { g.set('jqSlipped'); g.rel('知己', 'gongsunlve'); }, res: '绿萼偷偷给你画了一张谷里的地图。你们从后山出了谷。她站在山口，没有跟来。',
              fail: { fx: (g) => { g.set('ygPoison'); g.stat('根骨', -10); }, res: '绿萼没敢帮你。你闯婚堂时中了情花毒。', dev: 0 } },
          ] },
          { id: 'yg_baby', y: 40, t: '女婴', cond: (g) => g.exists('guoxiang') && lmcVillain(g) && !g.f('limochouLives') && hero(g), text: '郭伯母刚生下的女儿被李莫愁抢走。你从李莫愁手里夺回孩子，抱着她躲进山洞。孩子饿得直哭。', choices: [
            { t: '找一只母豹，挤奶喂她', canon: true, fx: (g) => { g.stat('情义', 6); g.stat('根骨', -3); g.rel('小友', 'guoxiang'); }, res: '孩子喝饱了，冲你笑。可等你抱她回去时，郭家的人都以为是你抢走了她。' },
            { t: '一刻不停，把孩子送回郭家', dev: 25, check: ['根骨', 50], fx: (g) => { g.set('yangArm'); g.stat('正邪', 4); g.stat('声望', 3); }, res: '你一路没停，把孩子交到郭伯母手里。郭芙看着你，咬着嘴唇说了声“谢谢”。后来江湖上的神雕侠，两条胳膊都在。', chron: '杨过从李莫愁手里抢回郭襄，连夜送回了郭家。',
              fail: { fx: (g) => { g.stat('根骨', -5); g.rel('小友', 'guoxiang'); }, res: '李莫愁追得太紧，你只好抱着孩子躲进山洞，找了一只母豹喂她。', dev: 0 } },
            { t: '抱着孩子去绝情谷，跟裘千尺换解药', cond: (g) => g.f('ygPoison'), dev: 15, fx: (g) => { g.stat('正邪', -8); g.stat('心境', -8); g.remember('ygBabyTrade'); }, res: '你走到谷口，孩子在你怀里睡着了。你转身回去了。这件事你一辈子没对人说过。' },
          ] },
          { id: 'yg_revenge', y: 40, t: '杀父之仇', cond: (g) => g.f('ygPoison') && jing(g) && !dad(g) && !g.recall('ygHeardTruth'),
            text: (g) => '裘千尺告诉你：拿郭靖、黄蓉的人头来，就给你绝情丹。' + (g.recall('ygKnowsFather') ? '你从小就知道父亲叫杨康，却从没人告诉你他是怎么死的。她说，' : '她还说，') + '你父亲就是死在他们手里。', choices: [
            { t: '夜里站在郭伯伯床前，终究下不了手', canon: true, fx: (g) => { g.stat('情义', 5); g.stat('正邪', 5); g.info('身世', '杨康之子'); }, res: '郭伯伯醒着。他什么也没问，只是让你坐下，跟你讲了一夜你父亲的事。' },
            { t: '动手', dev: 50, check: ['武学', 75], fx: (g) => { g.kill('guojing', '在襄阳被杨过夜里刺杀'); g.stat('正邪', -40); g.stat('心境', -30); }, res: '你得了绝情丹。可你从此夜里睡不着。', chron: '杨过在襄阳刺杀了郭靖。',
              fail: { fx: (g) => { g.stat('根骨', -10); g.stat('心境', -10); }, res: '剑还没出鞘，郭伯伯就醒了。他没有叫人，只是说：“你走吧。”', dev: 5 } },
            { t: '把裘千尺的话原原本本告诉郭伯伯', dev: 15, fx: (g) => { g.stat('情义', 6); g.stat('正邪', 6); g.remember('ygToldGuo'); }, res: '郭伯伯听完，叹了口气：“你爹的事，我该早点告诉你。”他讲到了天亮。从那以后，他有什么事都先跟你商量。' },
          ] },
          { id: 'yg_truth', y: 40, auto: true, t: '绝情丹', cond: (g) => g.f('ygPoison') && jing(g) && !dad(g) && !!g.recall('ygHeardTruth'),
            text: '裘千尺说，拿郭靖、黄蓉的人头来换绝情丹，你父亲就是死在他们手里。你笑了。铁枪庙的事，你早就知道。她骂你没出息，你转身就走。', fx: (g) => { g.stat('心境', 3); g.stat('正邪', 3); } },
          { id: 'yg_arm', y: 40, t: '断臂', cond: (g) => hero(g) && g.alive('guofu') && !g.f('guofuGentle') && !g.f('yangArm'),
            text: (g) => (g.recall('ygFlirtFu') ? '当年在桃花岛上被你哄红了脸的郭芙，' : '郭芙') + '以为你害了她刚出生的妹妹，抓起淑女剑向你挥来。', choices: [
            { t: '没有躲', canon: true, fx: (g) => { g.set('ygOneArm'); g.stat('武学', -10); g.stat('根骨', -12); g.stat('心境', -10); g.info('身份', '独臂'); }, res: '你的右臂掉在了地上。' },
            { t: '叫她一声：“芙妹。”', cond: (g) => !!g.recall('ygSwallowed'), dev: 25, fx: (g) => { g.set('yangArm'); g.stat('情义', 3); }, res: '剑停在你肩上。她想起了桃花岛上那个挨了打也不还手的孩子。剑落在了地上。' },
            { t: '侧身躲开', dev: 25, check: ['武学', 60], fx: (g) => { g.set('yangArm'); g.stat('声望', 3); }, res: '剑锋擦着你的肩膀过去了。你两条胳膊都还在。',
              fail: { fx: (g) => { g.set('ygOneArm'); g.stat('武学', -10); g.stat('根骨', -12); g.info('身份', '独臂'); }, res: '你躲慢了半步，右臂掉在了地上。', dev: 0 } },
            { t: '告诉她：孩子不是我抢走的', dev: 20, check: ['悟性', 60], fx: (g) => { g.set('yangArm'); g.stat('情义', 2); }, res: '郭芙的剑停在半空。她咬着嘴唇，把剑收了回去。',
              fail: { fx: (g) => { g.set('ygOneArm'); g.stat('武学', -10); g.stat('根骨', -12); g.info('身份', '独臂'); }, res: '你还没说完，剑就落了下来。', dev: 0 } },
          ] },
          { id: 'yg_jianzhong', y: 40, auto: true, t: '剑冢', loc: 'jianzhong', cond: hero,
            text: (g) => (g.f('ygOneArm') ? '你拖着断臂走进深山。' : '你追着一只大雕走进深山。') + '大雕领你找到一座剑冢，上面刻着“剑魔独孤求败”。冢里有一把黑沉沉的重剑，重八十一斤。',
            fx: (g) => { g.stat('武学', 18); g.info('武功', '玄铁剑法'); g.info('兵器', '玄铁重剑'); g.rel('良师', '神雕'); g.party([]); } },
          // ---- 断肠崖：十六年，还是不等 ----
          { id: 'yg_cure', y: 41, auto: true, t: '断肠草', cond: (g) => g.f('ygPoison'), text: (g) => '你在断肠崖下嚼了一把断肠草。以毒攻毒，情花毒竟慢慢解了。' + (g.recall('ygBabyTrade') ? '你想起那天在谷口转身的事，又多嚼了一把。' : ''), fx: (g) => g.stat('根骨', 6) },
          { id: 'yg_stay', y: 41, auto: true, t: '寒玉床', cond: (g) => inTomb(g) && g.f('longStayed'), text: '姑姑没有走。寒玉床和玉蜂浆压住了她体内的毒。你们回了古墓。', fx: (g) => { g.move('gumu'); g.party(['xiaolongnv']); g.stat('心境', 20); } },
          { id: 'yg_cliff', y: 41, t: '断肠崖', loc: 'jueqing', cond: (g) => inTomb(g) && live(g, 'xiaolongnv') && !g.f('longStayed'),
            text: (g) => (g.f('jqSlipped') ? '你们离开绝情谷时，姑姑替你挡了一枚冰魄银针。' : '混战里，姑姑中了一枚冰魄银针。') + '毒入经脉，无药可救。她在断肠崖上刻下一行字：“十六年后，在此重会，夫妻情深，勿失信约。”然后不见了。', choices: [
            { t: '相信这个十六年之约', canon: true, fx: (g) => { g.stat('心境', -25); g.stat('情义', 5); g.info('身份', '神雕侠'); g.party([]); }, res: '你一个人走了。江湖上从此多了一个神雕侠。' },
            { t: '拿出当年从李莫愁手里逼来的方子', cond: (g) => !!g.recall('ygNeedleCure'), dev: 40, fx: (g) => { g.set('longStayed'); g.stat('心境', 20); g.move('gumu'); g.party(['xiaolongnv']); }, res: '你在崖边找到了她。方子上的药，加上寒玉床，一个月后她的手不再发黑了。你们回了古墓。', chron: '杨过用李莫愁的解药方子救回了小龙女，她没有跳下断肠崖。' },
            { t: '当天就跳下去找她', dev: 45, check: ['根骨', 55], fx: (g) => { g.set('reunionEarly'); g.stat('心境', 20); g.party(['xiaolongnv']); }, res: '崖底是一个寒潭。你在潭边找到了她，她还活着。',
              fail: { fx: (g) => g.die('跳下断肠崖，死在谷底寒潭'), res: '潭水太冷了。', dev: 20 } },
            { t: '去大理求一灯大师', dev: 15, check: ['悟性', 60], fx: (g) => { g.stat('悟性', 3); g.info('身份', '神雕侠'); g.remember('ygKnowsAlive'); }, res: '一灯大师说，寒潭的冷气压得住这毒。你知道她多半还活着，只是不知道她在哪里等你。',
              fail: { fx: (g) => { g.stat('心境', -10); g.info('身份', '神雕侠'); }, res: '没人能解这个毒。你一个人走了，江湖上多了一个神雕侠。', dev: 0 } },
          ] },
          { id: 'yg_valley', y: 44, auto: true, t: '谷底', loc: 'jueqing', cond: (g) => g.f('reunionEarly'), text: '你和龙儿在谷底住了下来。寒潭里有鱼，崖上有玉蜂。外面的江湖，好像和你们没有关系了。', fx: (g) => g.stat('心境', 10) },
          { id: 'yg_sea', y: 48, t: '海潮', loc: 'sea', cond: (g) => hero(g) && !together(g), text: '神雕带你到海边，要你在涨潮时练剑。浪头一个比一个高。', choices: [
            { t: '每天在海潮里练剑', canon: true, fx: (g) => { g.stat('武学', 12); g.stat('根骨', 4); g.info('武功', '重剑无锋'); }, res: '几年后，你一剑挥出，能劈开浪头。重剑无锋，大巧不工。' },
            { t: '去东海找桃花岛主请教', dev: 15, check: ['悟性', 60], fx: (g) => { g.stat('武学', 8); g.stat('悟性', 3); g.rel('忘年交', 'huangyaoshi'); }, res: '黄药师跟你对了三天的掌，说你是他生平第二个看得上的年轻人。第一个是他自己。',
              fail: { fx: (g) => g.stat('武学', 4), res: '黄药师不在岛上。你在桃花阵里转了三天才出来。', dev: 0 } },
            { t: '练不下去，到处打听她的消息', cond: (g) => inTomb(g) && !g.recall('ygKnowsAlive'), dev: 15, check: ['悟性', 55], fx: (g) => { g.stat('情义', 4); g.remember('ygKnowsAlive'); }, res: '一个老顽童在百花谷捉了一群玉蜂，蜂翅上刻着细小的字：“我在绝情谷底”。你攥着那只蜂，一夜没睡。',
              fail: { fx: (g) => g.stat('心境', -4), res: '没有人见过一个穿白衣的姑娘。', dev: 0 } },
          ] },
          { id: 'yg_cheng', y: 50, t: '程英', cond: (g) => inTomb(g) && !together(g) && live(g, 'chengying'),
            text: (g) => (g.recall('ygMetCheng') || g.recall('ygSavedLu') ? '你又路过程英、陆无双结庐的地方。程英还是那样，替你补好了衣裳，什么也没问。' : '你路过江边一间草庐。屋里的姑娘叫程英，是陆无双的表姐。她替你补好了衣裳，什么也没问。'), choices: [
            { t: '住几天就走', canon: true, fx: (g) => { g.stat('情义', 3); g.rel('知己', 'chengying'); }, res: '你走的时候，她吹了一曲箫。' },
            { t: '留下来，不走了', cond: (g) => !g.recall('ygKnowsAlive'), dev: 40, fx: (g) => { g.set('ygWedCheng'); g.rel('妻子', 'chengying'); g.stat('心境', 15); }, res: '你在草庐里住了下来。程英什么也没说，第二天多烧了一个人的饭。过了一年，你们成了亲。断肠崖上那行字，你不敢再想。', chron: '神雕侠杨过娶了程英。' },
            { t: '告诉她：我要等的人还活着', cond: (g) => !!g.recall('ygKnowsAlive'), dev: 5, fx: (g) => { g.stat('心境', 3); g.rel('知己', 'chengying'); }, res: '程英笑了笑：“我知道。”她把那曲箫吹完，送你到了江边。' },
          ] },
          { id: 'yg_palm', y: 52, t: '黯然销魂', cond: (g) => inTomb(g) && !together(g) && !g.f('ygWedCheng'),
            text: (g) => (g.recall('ygKnowsAlive') ? '你知道她还活着，就在断肠崖下的某个地方。你想她想得发呆，掌下竟生出一股说不出的力道。' : '你想她想得发呆，忽然悟出一套掌法。心里越难过，掌力越强。'), choices: [
            { t: '把它叫作“黯然销魂掌”', canon: true, fx: (g) => { g.stat('武学', 10); g.info('武功', '黯然销魂掌'); }, res: '“黯然销魂者，唯别而已矣。”' },
            { t: '再下一次断肠崖，把谷底翻遍', cond: (g) => !g.recall('ygKnowsAlive'), dev: 30, check: ['根骨', 60], fx: (g) => { g.set('reunionEarly'); g.stat('心境', 25); g.party(['xiaolongnv']); g.move('jueqing'); }, res: '你潜进寒潭，顺着一股暗流游了很久。暗流尽头是一个山谷，谷里有一个白衣女子在养蜂。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '潭水太冷，你冻昏了过去，是神雕把你拖了上来。', dev: 0 } },
            { t: '照着蜂翅上的字，从寒潭潜下去找她', cond: (g) => !!g.recall('ygKnowsAlive'), dev: 30, check: ['根骨', 40], fx: (g) => { g.set('reunionEarly'); g.stat('心境', 25); g.party(['xiaolongnv']); g.move('jueqing'); }, res: '寒潭底下有一条暗流。暗流尽头的谷里，有一个白衣女子在养蜂。她回过头，手里的蜂箱掉在了地上。',
              fail: { fx: (g) => g.stat('根骨', -8), res: '你在潭底找不到路，憋得眼前发黑才浮上来。还要再等。', dev: 0 } },
          ] },
          // ---- 风陵渡、十六年、襄阳 ----
          { id: 'yg_fengling', y: 56, t: '风陵渡', loc: 'fenglingdu', cond: (g) => hero(g) && g.alive('guoxiang'), text: '风陵渡口，一个十六岁的小姑娘缠着要见神雕侠。她叫郭襄，就是你从李莫愁手里抢回来的那个婴儿。', choices: [
            { t: '送她三枚金针，答应替她做三件事', canon: true, fx: (g) => { g.stat('情义', 4); g.rel('小友', 'guoxiang'); }, res: '第一枚，她要看你的样子。第二枚，她要你来给她过生日。第三枚，她还没想好。' },
            { t: '摘下面具让她看一眼，然后走', dev: 15, fx: (g) => { g.stat('心境', 2); g.remember('ygNoNeedles'); }, res: '她看着你的背影，在渡口站了很久。她没有向你要什么，你也没有许过她什么。' },
          ] },
          { id: 'yg_bday', y: 57, auto: true, t: '生日大礼', cond: (g) => hero(g) && g.alive('guoxiang') && !g.recall('ygNoNeedles'),
            text: '郭襄十六岁生日，你送了三份大礼：烧了蒙古大军的粮草，揭穿了混进丐帮的霍都，在襄阳城外放了一夜的烟花。',
            fx: (g) => { g.stat('声望', 10); if (g.alive('huodu')) g.kill('huodu', '假扮丐帮弟子何师我，身份败露后被杀', true); } },
          { id: 'yg_reunion', y: 57, t: '十六年', loc: 'jueqing', cond: (g) => inTomb(g) && !together(g) && live(g, 'xiaolongnv'),
            text: (g) => (g.f('ygWedCheng') ? '十六年到了。程英替你收拾好了包袱，说：“去吧。”你在断肠崖上等了三天三夜，她没有来。' : '十六年到了。你在断肠崖上等了三天三夜，她没有来。'), choices: [
            { t: '跳下去', canon: true, fx: (g) => { g.stat('心境', 30); g.party(['xiaolongnv']); g.rel('妻子', 'xiaolongnv'); }, res: '崖下是一个寒潭。潭底有一条通道，通道尽头的谷里，有一个白衣女子在养蜂。' },
            { t: '再等一年', cond: (g) => !g.f('ygWedCheng'), dev: 10, fx: (g) => { g.stat('心境', 15); g.party(['xiaolongnv']); g.rel('妻子', 'xiaolongnv'); g.remember('ygWaitedYear'); }, res: '第二年的同一天，她从谷底爬了上来。她说：“我等不及了。”' },
            { t: '不跳了，回江边的草庐去', cond: (g) => g.f('ygWedCheng'), dev: 40, fx: (g) => { g.set('ygNoReunion'); g.stat('心境', -20); }, res: '你在崖上刻了一行字：“杨过负约。”然后回了江边的草庐。程英什么也没问。', chron: '十六年之约，杨过没有去。' },
          ] },
          { id: 'yg_grave', y: 57, auto: true, t: '十六年', cond: (g) => inTomb(g) && !together(g) && !live(g, 'xiaolongnv'), text: '十六年到了。你在断肠崖下找到了一座小小的坟。', fx: (g) => g.stat('心境', -40) },
          { id: 'yg_menge', y: 57, t: '襄阳大战', loc: 'xiangyang', cond: hero, text: '蒙古大汗蒙哥亲自攻城，襄阳危在旦夕。你站在城下，手里扣着一块石头。', choices: [
            { t: '飞石击毙蒙哥', canon: true, fx: (g) => { g.kill('menge', '在襄阳城下被杨过飞石击毙', true); g.stat('声望', 20); }, res: '蒙哥从马上栽了下来。蒙古大军退了。' },
            { t: '这是官军的事', dev: 25, fx: (g) => { g.set('yangAbsent57'); g.stat('声望', -5); }, res: '你没有出手。几天后传来消息：蒙哥在四川钓鱼城下中了炮石，死了。蒙古大军还是退了。' },
            { t: '夜闯蒙古大营，刺杀蒙哥', dev: 15, check: ['武学', 80], fx: (g) => { g.kill('menge', '在蒙古大营中被杨过刺杀'); g.stat('声望', 22); g.stat('根骨', -8); }, res: '你一剑刺穿了大汗的金帐。蒙古大军乱成一团，退了。', chron: '杨过夜闯蒙古大营，刺杀了蒙哥。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.kill('menge', '在襄阳城下被杨过飞石击毙', true); }, res: '你中了一箭，退回城下。第二天攻城时，你还是用一块石头了结了他。', dev: 0 } },
          ] },
          { id: 'yg_huashan3', y: 57, auto: true, t: '华山论剑', loc: 'huashan', cond: hero, text: '第三次华山论剑。大家推你做“西狂”。你笑了笑，说：“我算什么五绝。”', fx: (g) => { g.stat('声望', 15); g.info('身份', '西狂'); } },
          { id: 'yg_sword', y: 57, t: '玄铁剑', cond: (g) => hero(g) && jing(g), text: '临别前，郭伯伯问你：这把玄铁重剑，你带走，还是留在襄阳？', choices: [
            { t: '留给郭伯伯', canon: true, fx: (g) => { g.stat('情义', 3); g.info('兵器', '无'); }, res: '郭伯伯接过剑，掂了掂：“好重。”后来这块玄铁去了哪里，你没有再问。' },
            { t: '带走', dev: 25, fx: (g) => g.set('yangKeepsSword'), res: (g) => (g.f('ygNoReunion') ? '剑跟着你回了江边的草庐。' : '剑跟着你回了古墓。') },
          ] },
          { id: 'yg_sword2', y: 57, auto: true, t: '玄铁剑', cond: (g) => hero(g) && !jing(g), text: '郭伯伯已经不在了。你把玄铁重剑带走了。', fx: (g) => g.set('yangKeepsSword') },
          { id: 'yg_home', y: 58, auto: true, t: '归隐', loc: 'gumu', cond: (g) => inTomb(g) && live(g, 'xiaolongnv') && !g.f('ygNoReunion'),
            text: (g) => (g.recall('ygWaitedYear') ? '晚了一年，你和龙儿还是回到了终南山古墓。墓外的玉蜂还在。' : '你和龙儿回到了终南山古墓。墓外的玉蜂还在。'),
            fx: (g) => { g.stat('心境', 15); g.rel('妻子', 'xiaolongnv'); g.party(['xiaolongnv']); g.info('身份', '古墓主人'); } },
          { id: 'yg_heir', y: 62, t: '孩子', cond: (g) => inTomb(g) && live(g, 'xiaolongnv') && !g.f('gumuNoHeir') && !g.f('ygNoReunion'), text: '龙儿怀孕了。她问你，孩子生下来，要不要教她古墓派的武功。', choices: [
            { t: '教，什么都教', canon: true, fx: (g) => { g.stat('情义', 5); g.rel('女儿', '杨氏女'); }, res: '后来，江湖上偶尔会出现一个穿黄衫的女子，武功极高，来去无踪。' },
            { t: '不教，让她做个寻常人', dev: 15, fx: (g) => { g.set('gumuNoHeir'); g.stat('心境', 5); g.rel('女儿', '杨氏女'); }, res: '孩子长大后嫁到了山下。古墓派的武功，到你们这一代就断了。' },
          ] },
          { id: 'yg_71', y: 71, t: '城破', cond: (g) => inTomb(g) && inXY(g) && !g.f('guoSurvive'),
            text: (g) => '襄阳就要破了。' + (g.f('ygNoReunion') ? '消息传到江边的草庐，你在门口站了一夜。' : '消息传到古墓，你在墓门口站了一夜。'), choices: [
            { t: '不去了，这是郭伯伯自己的选择', canon: true, fx: (g) => g.stat('心境', -8), res: '你朝着襄阳的方向，磕了三个头。' },
            { t: '写信给郭伯伯：城可以破，人要活着', cond: (g) => !!g.recall('ygToldGuo'), dev: 35, check: ['情义', 55], fx: (g) => { g.set('guoSurvive'); g.stat('情义', 5); }, res: '郭伯伯一辈子没听过谁的劝。这一回，他听了你的。城破前一夜，郭家从水门出了城。', chron: '郭靖听了杨过的劝，城破前离开了襄阳。',
              fail: { fx: (g) => g.stat('心境', -8), res: '神雕带回一张字条：“襄阳在，郭靖在。”', dev: 0 } },
            { t: '骑雕赶去襄阳', dev: 45, check: ['武学', 80], fx: (g) => { g.set('guoSurvive'); g.stat('声望', 15); g.stat('根骨', -8); }, res: '你在城破那一刻冲进郭府，带着郭伯伯、郭伯母杀出了重围。郭伯伯骂了你一路。', chron: '杨过在襄阳城破时救出了郭靖、黄蓉。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -15); }, res: '你赶到时，城已经破了。你只抢回了郭伯伯的一面旗。', dev: 5 } },
            { t: '去汉水边接应逃出来的百姓', dev: 20, check: ['武学', 60], fx: (g) => { g.stat('正邪', 8); g.stat('声望', 8); g.stat('根骨', -6); g.remember('xyRefugees'); }, res: '你在汉水边守了三天，接走了几百个孩子。城里的郭伯伯，你没能救出来。',
              fail: { fx: (g) => g.stat('根骨', -12), res: '蒙古骑兵太多了。你只接到了几十个人。', dev: 5 } },
          ] },
          { id: 'yg_swordfate', y: 86, t: '玄铁', cond: (g) => g.f('yangKeepsSword') && hero(g), text: '你老了。身边那把玄铁重剑，总要有个去处。', choices: [
            { t: '让神雕把它送去峨嵋，交给郭襄', canon: true, fx: (g) => { g.stat('情义', 3); g.info('兵器', '无'); }, res: '神雕飞走了，再没有回来。' },
            { t: '留在身边，陪你入土', dev: 15, fx: (g) => g.set('swordInTomb'), res: '你把剑放在了床边。它跟着你，又在土里睡了许多年。' },
          ] },
          // ---- 被郭靖带在身边长大（前世的选择） ----
          { id: 'yg_gp_xy', y: 36, t: '襄阳城头', loc: 'xiangyang', cond: guoPath, text: '你跟着郭伯伯到了襄阳。他每天天不亮就上城头，你跟在后面，替他提着灯。', choices: [
            { t: '缠着郭伯伯教你降龙十八掌', canon: true, fx: (g) => { g.stat('武学', 8); g.rel('师父', 'guojing'); }, res: '他教得很慢，一招要讲三天。你学得很快，一天就学会了三招。' },
            { t: '跟郭伯母学打狗棒法', dev: 10, check: ['悟性', 55], fx: (g) => { g.stat('武学', 6); g.stat('悟性', 2); g.rel('师父', 'huangrong'); }, res: '郭伯母说你比靖哥哥学得快十倍。郭伯伯在旁边憨憨地笑。',
              fail: { fx: (g) => g.stat('武学', 3), res: '郭伯母教了三招就不教了，说你太聪明，得先学会笨。', dev: 0 } },
            { t: '在城里拉一帮少年，组成巡夜队', dev: 15, fx: (g) => { g.stat('情义', 5); g.stat('声望', 4); g.remember('ygNightWatch'); }, res: '你们每夜在城墙下巡逻，抓到过一个蒙古探子。这帮少年后来都叫你“杨大哥”。' },
          ] },
          { id: 'yg_gp_love', y: 45, t: '心事', cond: guoPath, text: '你二十五岁了，城里有好几户人家托人来说亲。郭伯母问你，心里有没有人。', choices: [
            { t: '“还没有。”', canon: true, fx: (g) => g.stat('心境', 2), res: '郭伯母笑了笑，没有再问。' },
            { t: '娶一个守城军户的女儿', dev: 15, fx: (g) => { g.rel('妻子', '军户之女'); g.stat('心境', 10); g.stat('情义', 5); g.remember('ygMarried'); }, res: '她不会武功，可是会做襄阳最好吃的牛肉饼。' },
            { t: '“有。终南山上有一座古墓，我想去看看。”', cond: (g) => live(g, 'xiaolongnv'), dev: 20, fx: (g) => { g.stat('情义', 3); g.remember('ygSeeksTomb'); }, res: '郭伯母看了你很久，说：“去吧。”' },
          ] },
          { id: 'yg_gp_tomb', y: 46, auto: true, t: '古墓', loc: 'zhongnan', cond: (g) => guoPath(g) && !!g.recall('ygSeeksTomb') && live(g, 'xiaolongnv'),
            text: '你上了终南山。墓门开着一条缝，一个白衣女子在门口养蜂。她问你是谁，你说你叫杨过。她说：“好像在哪里听过这个名字。”你在山下住了一个月，每天去墓门口坐一会儿。',
            fx: (g) => { g.rel('知己', 'xiaolongnv'); g.stat('心境', 8); } },
          { id: 'yg_gp71', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => guoPath(g) && inXY(g) && !g.f('guoSurvive'),
            text: (g) => '襄阳城破了。郭伯伯站在城头，不肯走。' + (g.recall('ygMarried') ? '你的妻子抱着孩子，在府里等你。' : '') + '你的重剑上全是血。', choices: [
            { t: '陪郭伯伯守到最后', canon: true, fatal: true, fx: (g) => g.die('襄阳城破时与郭靖并肩战死'), res: '你们一起倒在了城头上。' },
            { t: '把郭伯伯、郭伯母扛上大雕，杀出去', dev: 35, check: ['武学', 75], fx: (g) => { g.set('guoSurvive'); g.stat('根骨', -15); g.stat('声望', 10); g.move('taohua'); }, res: '你杀出了一条血路。郭伯伯在路上醒过来，骂了你三天，第四天抱着你哭了。', chron: '杨过在襄阳城破时带着郭靖、黄蓉杀了出来。',
              fail: { fx: (g) => g.die('襄阳城破时战死在城门口'), res: '城门口的人太多了。', dev: 10 } },
            { t: '叫上当年巡夜的兄弟，护着百姓从水门撤', cond: (g) => !!g.recall('ygNightWatch'), dev: 30, check: ['情义', 50], fx: (g) => { g.stat('正邪', 10); g.stat('声望', 8); g.move('road'); }, res: '当年那帮少年都已人到中年。他们认得每一条小巷，你们带着几千百姓出了水门。回头看时，城头的郭字大旗倒了。',
              fail: { fx: (g) => g.die('襄阳城破时死在水门口'), res: '水门外也是蒙古兵。', dev: 10 } },
            { t: '先把郭家的孩子送出城，再回来', dev: 30, check: ['根骨', 55], fx: (g) => { g.set('gfKidsOut'); g.stat('情义', 8); g.stat('根骨', -10); g.move('road'); }, res: '你把孩子们交给丐帮弟子，再杀回城里时，城已经破了。你活了下来，这件事背了一辈子。',
              fail: { fx: (g) => g.die('襄阳城破时为护送郭家孩子战死'), res: '孩子们出去了，你没有。', dev: 10 } },
          ] },
          { id: 'yg_gp_after', y: 75, auto: true, t: '江南', cond: (g) => guoPath(g) && g.f('gfKidsOut'), text: '你送出城的郭家孩子在江南长大了。他们叫你“杨伯伯”，每年清明都跟你一起朝北边烧一炷香。', fx: (g) => g.stat('心境', 5) },
          // ---- 被父母留在嘉兴（前世的选择） ----
          { id: 'yg_hm1', y: 36, t: '嘉兴', loc: 'jiaxing', cond: homePath,
            text: (g) => (dad(g) ? '父亲说，江湖不是好地方，要你读书考功名。' : '母亲说，江湖不是好地方，要你读书考功名。') + (g.recall('ygSpear') ? '你每天读半天书，夜里在院子里练杨家枪。' : '你每天读半天书，偷练半天武。'), choices: [
            { t: '好好读书', canon: true, fx: (g) => { g.stat('悟性', 6); g.info('身份', '书生'); g.remember('ygScholar'); }, res: '你考上了秀才。放榜那天，你在南湖边坐了一下午。' },
            { t: '偷偷去找江湖人学武', dev: 10, fx: (g) => { g.stat('武学', 8); g.info('身份', '武馆弟子'); }, res: '你拜了城里一个老镖师为师。他说你天分高得吓人。' },
          ] },
          { id: 'yg_hm2', y: 42, t: '投军', cond: homePath, text: '蒙古人打到了襄阳。嘉兴城里贴出告示，招募义勇北上。', choices: [
            { t: '留在家里', canon: true, fx: (g) => g.stat('情义', 4), res: '你送走了好几个同乡。有的回来了，有的没有。' },
            { t: '北上投军', dev: 20, check: ['根骨', 50], fx: (g) => { g.move('xiangyang'); g.stat('声望', 10); g.stat('正邪', 8); g.remember('ygSoldier'); }, res: '你留在了襄阳，一守就是许多年。守城的郭大侠拍着你的肩说：“你长得真像我一个兄弟。”',
              fail: { fx: (g) => { g.stat('根骨', -15); g.move('jiaxing'); }, res: '你中了一箭，被送回了嘉兴。', dev: 5 } },
            { t: '去临安上书，请朝廷发兵', cond: (g) => !!g.recall('ygScholar'), dev: 15, check: ['悟性', 60], fx: (g) => { g.info('身份', '临安小吏'); g.stat('声望', 6); }, res: '你的奏疏被人压了下来。主事的官员却记住了你的名字，给了你一个小官。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你在宫门外跪了三天，没人理你。你回了嘉兴。', dev: 0 } },
          ] },
          { id: 'yg_hm71', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => homePath(g) && !!g.recall('ygSoldier') && inXY(g) && !g.f('guoSurvive'), text: '你在襄阳城头守了将近三十年，头发都白了。城终于要破了。郭大侠站在城头，不肯走。', choices: [
            { t: '和郭大侠一起守到最后', canon: true, fatal: true, fx: (g) => g.die('襄阳城破时战死城头'), res: '你倒在了城头上。' },
            { t: '护着郭家的孩子出城', dev: 25, check: ['根骨', 45], fx: (g) => { g.set('gfKidsOut'); g.stat('情义', 8); g.move('road'); }, res: '你背着最小的那个孩子，从水门游了出去。郭大侠在城头看了你一眼，点了点头。',
              fail: { fx: (g) => g.die('襄阳城破时为护送郭家孩子战死'), res: '孩子们出去了，你没有。', dev: 10 } },
            { t: '带着手下的兵从水门突围', dev: 20, check: ['武学', 45], fx: (g) => { g.move('jiaxing'); g.stat('心境', -10); }, res: '你回到嘉兴时，身边只剩七个人。',
              fail: { fx: (g) => g.die('襄阳城破时死在突围的路上'), res: '水门外也是蒙古兵。', dev: 10 } },
          ] },
          // ---- 在全真教熬下来 ----
          { id: 'yg_qzhead', y: 50, t: '掌教', cond: qzPath,
            text: (g) => '全真教的老道们老的老、死的死。有人提议，让你做下一任掌教。' + (g.recall('ygReported') ? '后山古墓前的岗哨，还是你当年请来的。' : g.recall('ygMetLong') ? '你却总想起后山那个问你外面世界的白衣姑娘。' : ''), choices: [
            { t: '推辞', canon: true, fx: (g) => g.stat('心境', 3), res: '你继续在重阳宫里教小道士们练剑。' },
            { t: '接下来', dev: 20, fx: (g) => { g.info('身份', '全真教掌教'); g.stat('声望', 15); }, res: (g) => (g.recall('ygChongyangNotes') ? '你成了全真教掌教，把王重阳手稿里的功夫重新传了下去。重阳宫的规矩，你改了一半。' : '你成了全真教掌教。重阳宫的规矩，你改了一半。') },
            { t: '脱下道袍，去后山古墓', cond: (g) => !!g.recall('ygMetLong') && live(g, 'xiaolongnv'), dev: 40, fx: (g) => { g.set('ygLateTomb'); g.info('门派', '古墓派'); g.info('身份', '还俗道士'); g.rel('妻子', 'xiaolongnv'); g.party(['xiaolongnv']); g.move('gumu'); g.stat('心境', 25); }, res: '你把掌教的位子让给了师弟，脱下道袍，走进了后山那座古墓。她在门口等你，好像等了很多年。', chron: '全真教的杨过还俗，进了终南山古墓。' },
          ] },
          { id: 'yg_old', y: 90, auto: true, t: '暮年', cond: (g) => inTomb(g) || g.f('ygLateTomb'),
            text: (g) => (g.f('ygNoReunion') ? '你常坐在江边草庐前，听程英吹箫。崖下那个人，你不敢去想。' : live(g, 'xiaolongnv') ? '你常常坐在古墓外的树下，看玉蜂飞来飞去。龙儿的头发也白了。' : '你一个人坐在古墓外的树下，看玉蜂飞来飞去。')
              + (g.recall('xyRefugees') ? '当年从汉水边接出来的孩子，有人带着孙子来看你。' : ''),
            fx: (g) => g.stat('心境', 5) },
        ],
      },
    },

    /* ===================== 小龙女 ===================== */
    {
      id: 'xiaolongnv', name: '小龙女', py: 'XIAO<<LONGNV', book: BOOK, sex: '女', born: 16,
      origin: '古墓派传人，终南山古墓里长大',
      birthplace: '终南山重阳宫门外', home: 'gumu', bg: 2,
      info: { 门派: '古墓派', 身份: '弃婴' },
      look: { hair: 'long', hairColor: '#141414', robe: '#eef0ec', accent: '#9fb8c4' },
      family: [{ rel: '乳母', id: 'sunpopo', name: '孙婆婆' }, { rel: '师父', name: '古墓派上代掌门' }],
      fateText: '收杨过为徒，师徒相恋为天下不容。中冰魄银针之毒后在断肠崖刻下十六年之约，跳崖。十六年后与杨过重逢，归隐古墓。',
      st: [62, 85, 60, 35, 10, 0, 40],
      death: (g) => {
        if (g.f('ygLateTomb')) return { y: 90, cause: '与杨过在古墓里终老', mod: true };
        if (g.f('yangNoTomb')) return { y: 85, cause: '一个人老死在古墓里', mod: true };
        if (g.f('ygNoReunion')) return { y: 80, cause: '在绝情谷底独自老死', mod: true };
        return { y: 94, cause: '在终南山古墓无疾而终' };
      },
      ms: [
        [16, '被弃在重阳宫门外，孙婆婆抱进古墓'],
        [32, '师父去世，接任古墓派掌门'],
        [34, '收杨过为徒', inTomb],
        [34, '一个人守着古墓', (g) => !inTomb(g)],
        [39, '大胜关上与杨过并肩', inTomb],
        [41, '中冰魄银针之毒，跳下断肠崖', (g) => inTomb(g) && !together(g)],
        [41, '留在了杨过身边', (g) => g.f('longStayed')],
        [42, '在绝情谷底养蜂', (g) => inTomb(g) && !g.f('longStayed')],
        [50, '杨过还俗，进了古墓', (g) => g.f('ygLateTomb')],
        [57, '与杨过重逢', (g) => inTomb(g) && !g.f('ygNoReunion')],
        [57, '十六年之约，没有等到人', (g) => g.f('ygNoReunion')],
        [58, '与杨过归隐古墓', (g) => inTomb(g) && !g.f('ygNoReunion')],
      ],
      arc: {
        focus: '打熬筋骨',
        intro: '纪年 16 年，你被人丢在终南山重阳宫门外。全真教收不了女婴，墓里的孙婆婆把你抱了进去。古墓里没有白天黑夜，只有一盏长明灯。',
        lastWords: '过儿，你还在吗？',
        nodes: [
          { id: 'xl_birth', age: 0, auto: true, t: '古墓', loc: 'gumu', text: '孙婆婆用玉蜂浆喂你。师父抱着你看了很久，说这孩子不爱哭，是练我们这门功夫的料。',
            fx: (g) => { g.rel('乳母', 'sunpopo'); g.party(['sunpopo']); } },
          { id: 'xl_sister', age: 1, auto: true, t: '师姐', cond: (g) => live(g, 'limochou'), text: '墓里还有一个比你大六岁的师姐，叫李莫愁。她常常偷偷捏你的脸。', fx: (g) => g.rel('师姐', 'limochou') },
          { id: 'xl_sweet', age: 3, auto: true, t: '玉蜂', text: '你第一次自己掀开蜂箱，被蜇了三下，没有哭。孙婆婆给你抹了蜂浆，你尝到了甜味。', fx: (g) => g.stat('根骨', 3) },
          { id: 'xl_nocry', age: 6, t: '不哭', text: '师父说，古墓派的人不能哭、不能笑、不能动情。你在石阶上摔了一跤，膝盖流血了。', choices: [
            { t: '咬着嘴唇，不哭', canon: true, fx: (g) => { g.stat('武学', 2); g.stat('情义', -3); g.stat('心境', 2); g.info('性子', '不哭不笑'); }, res: '师父点了点头。你从那以后很少哭。' },
            { t: '哭出来', dev: 10, fx: (g) => { g.stat('情义', 4); g.stat('心境', -2); g.info('性子', '心事挂在脸上'); g.remember('xlCried'); }, res: '孙婆婆把你抱起来，偷偷给了你一块糖。师父看见了，叹了口气。从那以后，你心里的事总会挂在脸上。' },
          ] },
          { id: 'xl_bed', age: 8, auto: true, t: '寒玉床', text: '师父让你睡上寒玉床。床冷得刺骨，你一声不吭。', fx: (g) => { g.stat('武学', 5); g.stat('根骨', 3); } },
          // ---- 师姐：她走之前你做的事，决定了她回来时是敌是亲 ----
          { id: 'xl_jealous', age: 10, t: '师姐', cond: (g) => live(g, 'limochou'), text: '师父把玉女心经的前几页先教给了你。师姐在门外站了很久。', choices: [
            { t: '假装没看见', canon: true, fx: (g) => g.stat('武学', 3), res: '师姐那天晚上没有来捏你的脸。' },
            { t: '把学到的偷偷教给师姐', dev: 10, fx: (g) => { g.stat('情义', 5); g.set('xlSharedSister'); }, res: '师姐愣了一下，摸了摸你的头。那几页口诀，她背得比你还熟。' },
            { t: '去求师父，让师姐一起学', dev: 10, check: ['情义', 40], fx: (g) => { g.stat('情义', 4); g.set('xlSharedSister'); }, res: '师父说：“莫愁心太热，学不得。”可那天她还是让师姐进了石室。',
              fail: { fx: (g) => g.stat('心境', -2), res: '师父只说了一句：“这是古墓派的规矩。”', dev: 0 } },
          ] },
          { id: 'xl_sisterleave', y: 28, t: '下山', cond: (g) => live(g, 'limochou') && !g.f('mochouNoLu'),
            text: (g) => '师姐要下山了。师父说，下了山就不许再回来。她回头看了你一眼。' + (g.f('xlSharedSister') ? '她摸了摸你的头：“你教我的那几页，我记着。”' : ''), choices: [
            { t: '送她到墓门', canon: true, fx: (g) => g.stat('情义', 2), res: '墓门关上的时候，你听见她在外面笑。' },
            { t: '跟她约好：受了委屈，就回古墓来', dev: 15, fx: (g) => { g.stat('情义', 4); g.remember('xlSisterPromise'); }, res: '师姐笑了：“小师妹，等我回来。”她走的时候，回头看了你三次。' },
            { t: '跪在师父门前，求她把师姐留下', dev: 40, check: ['情义', 60], fx: (g) => { g.set('mochouNoLu'); g.stat('情义', 6); }, res: '你跪了一整夜。第二天，师父把师姐叫了回来，让她再住三年。三年后师姐下山时，那个姓陆的少年已经成了亲。她在墓门口站了一会儿，说：“那就算了。”', chron: '小龙女求师父留下了李莫愁。世上没有了赤练仙子。',
              fail: { fx: (g) => g.stat('心境', -3), res: '师父没有开门。天亮时，师姐已经走了。', dev: 0 } },
          ] },
          { id: 'xl_master', y: 32, t: '师父', text: (g) => (lmcVillain(g) ? '师父病重。师姐回来了，要抢《玉女心经》。师父临终把掌门之位传给了你。' : '师父病重，临终把掌门之位传给了你。'), choices: [
            { t: '守在师父床前', canon: true, fx: (g) => { g.info('身份', '古墓派掌门'); g.stat('心境', -5); }, res: '师父走了。你在她墓前坐了三天，没有流泪。' },
            { t: '运功替师父续命', dev: 15, check: ['武学', 35], fx: (g) => { g.info('身份', '古墓派掌门'); g.stat('根骨', -5); g.stat('情义', 4); g.remember('xlKnowsExit'); }, res: '你撑了她三天。第三天夜里，她告诉你古墓最深处有一条暗河，能通到山外。说完，她拍了拍你的手：“够了。”',
              fail: { fx: (g) => { g.info('身份', '古墓派掌门'); g.stat('根骨', -8); }, res: '你的内力太浅，反伤了自己。师父当夜就走了。', dev: 0 } },
            { t: '把回来的师姐领到师父床前', cond: (g) => lmcVillain(g) && !!g.recall('xlSisterPromise'), dev: 20, fx: (g) => { g.info('身份', '古墓派掌门'); g.stat('情义', 6); g.remember('xlSisterMourned'); }, res: '师姐跪在床前，哭得像个孩子。师父摸着她的头，什么也没说。那天夜里，师姐没有再提心经的事。' },
          ] },
          { id: 'xl_huodu', y: 34, auto: true, t: '十八岁', cond: (g) => live(g, 'huodu'), text: '你十八岁生日那天，蒙古王子霍都带人来终南山求亲，在墓外吹吹打打。你一言不发，放出玉蜂。他们被蜇得满头是包，落荒而逃。', fx: (g) => g.stat('声望', 3) },
          { id: 'xl_sun', y: 34, auto: true, t: '孙婆婆', cond: inTomb, text: '孙婆婆从后山救回一个被全真道士欺负的少年。道士们追到墓前，郝大通一掌误伤了她。她临死前求你照顾那孩子。', fx: (g) => { g.kill('sunpopo', '被全真教郝大通误伤而死', true); g.stat('心境', -10); } },
          // ---- 过儿：收不收他，决定了他这一生走哪条路 ----
          { id: 'xl_boy', y: 34, t: '少年', cond: (g) => inTomb(g) && live(g, 'yangguo'), text: '那少年叫杨过，比你小四岁，浑身是伤。古墓派的规矩，男人不能进来。', choices: [
            { t: '收他为徒', canon: true, fx: (g) => { g.rel('徒弟', 'yangguo'); g.party(['yangguo']); }, res: '他磕了头，叫你“姑姑”。' },
            { t: '送他回全真教', dev: 40, fx: (g) => { g.set('yangNoTomb'); g.set('ygQuanzhen'); g.party([]); }, res: '古墓里又只剩下你一个人。后来你听说，那个少年在重阳宫熬了下来。' },
            { t: '治好他的伤，送他去襄阳找郭靖', cond: jing, dev: 40, fx: (g) => { g.set('yangNoTomb'); g.set('yangguoRaisedByGuo'); g.party([]); }, res: '你把他送到襄阳城下。郭靖抱住他，眼圈红了。你转身回终南山，一路上没有回头。', chron: '小龙女没有收杨过，把他送到了郭靖身边。' },
          ] },
          { id: 'xl_yunv', y: 36, t: '玉女心经', cond: (g) => inTomb(g) && live(g, 'yangguo'), text: '《玉女心经》要两人一起练，互相照应。过儿睡寒玉床冻得发抖，练功却很快。', choices: [
            { t: '和过儿一起练', canon: true, fx: (g) => { g.stat('武学', 10); g.stat('情义', 5); g.info('武功', '玉女心经'); }, res: '你们隔着一丛花各练各的，功夫一日千里。' },
            { t: '只自己练，让过儿另练古墓的功夫', dev: 15, fx: (g) => { g.stat('武学', 5); g.remember('xlKeptDistance'); }, res: '你练得慢了很多。过儿在旁边看着，没有说话。你们之间，从此隔着一丛花。' },
          ] },
          { id: 'xl_stone', y: 37, t: '断龙石', cond: (g) => inTomb(g) && lmcVillain(g) && !g.f('limochouLives'), text: '李莫愁带着徒弟闯进古墓，要抢《玉女心经》。', choices: [
            { t: '放下断龙石，和过儿同死墓中', canon: true, fx: (g) => g.stat('情义', 5), res: (g) => (g.recall('xlKnowsExit') ? '断龙石落下。你记得师父说过的暗河，带着过儿摸了出去。' : '断龙石落下。你们在墓里摸索了几天，在石室顶上发现了王重阳的刻字，又从暗河出了墓。') },
            { t: '隔着石门喊她：“师姐，回家吧。”', cond: (g) => g.f('xlSharedSister') || !!g.recall('xlSisterPromise') || !!g.recall('xlSisterMourned'), dev: 25, fx: (g) => { g.set('limochouLives'); g.stat('情义', 8); }, res: '石门那边静了很久。然后你听见师姐在哭。她走了，没有带走心经。', chron: '李莫愁在古墓外听了师妹一句话，放下了拂尘。' },
            { t: '开门，把话跟师姐说开', dev: 25, check: ['情义', 55], fx: (g) => { g.set('limochouLives'); g.stat('情义', 8); }, res: '你把师父临终的话告诉了她。她哭了，那是你第一次看见师姐哭。她走了，没有带走心经。', chron: '小龙女在古墓里与师姐李莫愁把话说开了。',
              fail: { fx: (g) => g.stat('根骨', -8), res: '她不听。你们打了一场，你和过儿从暗河逃了出去。', dev: 5 } },
          ] },
          { id: 'xl_out', y: 38, t: '下山', cond: (g) => inTomb(g) && live(g, 'yangguo'), text: (g) => (g.recall('xlKeptDistance') ? '这几年你和过儿隔着一丛花练功。你想去墓外的世界看看。' : '你想去墓外的世界看看。'), choices: [
            { t: '一个人下山', canon: true, fx: (g) => { g.move('road'); g.party([]); }, res: '你没有告诉过儿。你想知道，离开他是什么滋味。' },
            { t: '带着过儿一起走', dev: 15, fx: (g) => { g.set('xlWithYang'); g.move('road'); g.party(['yangguo']); }, res: '过儿高兴得在山道上翻跟头。' },
          ] },
          { id: 'xl_alone', y: 40, auto: true, t: '古墓', cond: (g) => !inTomb(g), text: '古墓里只有你一个人。你把墓门关得很紧。', fx: (g) => g.stat('心境', -5) },
          // ---- 大胜关、绝情谷、断肠崖 ----
          { id: 'xl_dsg', y: 39, t: '大胜关', cond: (g) => inTomb(g) && live(g, 'yangguo'),
            text: (g) => (g.f('xlWithYang') ? '你和过儿一起到了大胜关。' : '你在大胜关找到了过儿。') + '英雄大会上，过儿当着天下人说要娶你。' + (jing(g) ? '郭靖说，师徒相恋，天理不容。' : '满座的人都说，师徒相恋，天理不容。'), choices: [
            { t: '一个人走', canon: true, fx: (g) => { g.stat('心境', -15); g.party([]); }, res: '你不想他为了你，跟全天下作对。' },
            { t: '当着天下人哭出来', cond: (g) => !!g.recall('xlCried'), dev: 20, fx: (g) => { g.set('xlStayed39'); g.stat('声望', -5); g.stat('心境', 10); g.party(['yangguo']); }, res: '你从来没在人前哭过。满座的人看着你，没有一个人再说话。郭靖叹了口气，挥手让你们走。' },
            { t: '牵起他的手', dev: 25, fx: (g) => { g.set('xlStayed39'); g.stat('心境', 15); g.stat('声望', -10); g.party(['yangguo']); }, res: '天下人骂你们，你们不在乎。' },
            { t: '拔剑逼退说闲话的人', dev: 20, check: ['武学', 50], fx: (g) => { g.set('xlStayed39'); g.stat('声望', 5); g.stat('正邪', -3); g.party(['yangguo']); }, res: '满座的人都闭了嘴。你拉着过儿走出了大胜关。',
              fail: { fx: (g) => { g.stat('心境', -15); g.party([]); }, res: '你一剑没能镇住全场。你转身走了，没有回头。', dev: 0 } },
          ] },
          { id: 'xl_gongsun', y: 40, t: '绝情谷', loc: 'jueqing', cond: (g) => inTomb(g) && live(g, 'gongsunzhi'),
            text: (g) => (g.f('xlStayed39') ? '你和过儿误入绝情谷。谷主公孙止对你殷勤备至，向你求婚。' : '你一个人走进了绝情谷。谷主公孙止救了你，向你求婚。'), choices: [
            { t: '答应他', canon: true, fx: (g) => g.stat('心境', -10), res: '你想，过儿也许不要你了。婚礼那天，他闯了进来，滚进了情花丛。' },
            { t: '拒绝，离开绝情谷', dev: 20, fx: (g) => { g.stat('心境', 5); g.move('road'); g.remember('xlLeftJq'); }, res: '公孙止的脸色变了。你走出谷口时，听见身后机关响动。过儿后来找到你时，身上一根情花刺也没扎到。' },
            { t: '假意答应，在婚堂上一剑刺死他', dev: 30, check: ['武学', 55], fx: (g) => { g.kill('gongsunzhi', '在婚堂上被小龙女一剑刺死'); g.stat('正邪', -5); g.stat('声望', 5); }, res: '红烛还没点完，他已经倒在了地上。绝情谷的弟子们跪了一地。', chron: '小龙女在婚堂上杀了绝情谷主公孙止。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '他早有防备。婚礼那天，过儿闯了进来，滚进了情花丛。', dev: 0 } },
          ] },
          { id: 'xl_lmclife', y: 40, t: '师姐', cond: (g) => inTomb(g) && g.f('limochouLives') && live(g, 'limochou'), text: '师姐托人带来一封信，说她在一座道观里住下了，问你过得好不好。', choices: [
            { t: '回信', canon: true, fx: (g) => { g.stat('情义', 4); g.rel('师姐', 'limochou', '在道观里住下了'); }, res: '你写了三行字，改了五遍。' },
            { t: '请她回古墓住几天', dev: 15, fx: (g) => { g.stat('情义', 5); g.remember('lmcGaveCure'); }, res: '她在寒玉床上坐了很久，说：“师父要是还在，该多好。”临走时，她把一个小瓷瓶塞进你手里：“我的银针，我的解药。”' },
          ] },
          { id: 'xl_needle', y: 41, auto: true, t: '冰魄银针', cond: (g) => inTomb(g) && !g.f('longStayed'),
            text: (g) => (g.recall('xlLeftJq') ? '你离开绝情谷时，谷外有人在混战。一枚冰魄银针打中了你。毒入经脉，无药可解。' : '混战中，一枚冰魄银针打中了你。毒入经脉，无药可解。'), fx: (g) => g.stat('根骨', -25) },
          { id: 'xl_cliff', y: 41, t: '断肠崖', loc: 'jueqing', cond: (g) => inTomb(g) && live(g, 'yangguo') && !g.f('longStayed'),
            text: (g) => (g.recall('xlLeftJq') ? '过儿没有中情花毒，可你中了冰魄银针。你不想让他看着你一天天死去。' : '过儿中了情花毒，只要你死了，他一定会跟着去死。') + '你在断肠崖边站了很久。', choices: [
            { t: '刻下十六年之约，跳下去', canon: true, fx: (g) => { g.party([]); g.info('身份', '谷底隐者'); }, res: '你在石壁上刻下：“十六年后，在此重会。”然后跳了下去。谷底有一个寒潭，潭边有玉蜂。你没有死。' },
            { t: '服下师姐给的解药', cond: (g) => !!g.recall('lmcGaveCure'), dev: 35, fx: (g) => { g.set('longStayed'); g.stat('心境', 20); g.move('gumu'); g.party(['yangguo']); }, res: '瓷瓶里的药很苦。三天后，你手心的黑气退了。你们回了古墓。', chron: '小龙女服了李莫愁的解药，没有跳下断肠崖。' },
            { t: '留在他身边，过完剩下的日子', dev: 40, check: ['根骨', 30], fx: (g) => { g.set('longStayed'); g.stat('心境', 25); g.move('gumu'); g.party(['yangguo']); }, res: '你们回了古墓。寒玉床和玉蜂浆压住了毒性，你一天天好了起来。',
              fail: { fx: (g) => g.die('冰魄银针毒发，死在杨过怀里'), res: '毒发得比你想的快。', dev: 20 } },
            { t: '把实情告诉过儿，让他一起拿主意', dev: 25, check: ['情义', 60], fx: (g) => { g.set('longStayed'); g.stat('心境', 20); g.move('gumu'); g.party(['yangguo']); }, res: '他说：“你在哪里，我就在哪里。”你们回了古墓。寒玉床压住了毒，你活了下来。',
              fail: { fx: (g) => { g.party([]); g.info('身份', '谷底隐者'); }, res: '他急得要陪你一起死。你只好刻下十六年之约，一个人跳了下去。谷底有寒潭，你没有死。', dev: 5 } },
          ] },
          { id: 'xl_valley', y: 42, auto: true, t: '谷底', cond: (g) => inTomb(g) && !together(g), text: '谷底寒潭里的冷气慢慢压住了你体内的毒。你吃潭里的鱼，喝玉蜂的蜜，一天一天地数日子。', fx: (g) => { g.stat('根骨', 18); g.stat('心境', 5); } },
          // ---- 谷底十六年：等，还是想办法让他知道 ----
          { id: 'xl_bees', y: 46, t: '蜂翅', cond: (g) => inTomb(g) && !together(g), text: '你想让外面的人知道你还活着。玉蜂每天都飞出谷去。', choices: [
            { t: '在蜂翅上刻字：“我在绝情谷底”', canon: true, fx: (g) => g.stat('悟性', 3), res: '蜂飞走了。后来有一个老顽童在百花谷里捉到了这些蜂，却没看懂。' },
            { t: '只刻“过儿”两个字，每天放一百只', dev: 25, check: ['悟性', 55], fx: (g) => { g.stat('情义', 3); g.remember('xlBeesSeen'); }, res: '蜂一群一群飞出谷去。你数着日子，一天也没停。',
              fail: { fx: (g) => g.stat('心境', -3), res: '蜂飞出去就没回来。你不知道它们去了哪里。', dev: 0 } },
            { t: '什么也不刻，一心等满十六年', dev: 5, fx: (g) => { g.stat('心境', 3); g.remember('xlWaitedFull'); }, res: '你想，他会来的。' },
          ] },
          { id: 'xl_found', y: 48, auto: true, t: '玉蜂', loc: 'jueqing', cond: (g) => inTomb(g) && !together(g) && !!g.recall('xlBeesSeen') && live(g, 'yangguo'),
            text: (g) => '一天，寒潭里冒出一个人。' + (oneArm(g) ? '他只剩一条胳膊，' : '他浑身湿透，') + '手里攥着一只翅上刻字的玉蜂。“龙儿，”他说，“我找了两年。”',
            fx: (g) => { g.set('reunionEarly'); g.stat('心境', 30); g.party(['yangguo']); g.rel('丈夫', 'yangguo'); g.chron('小龙女的玉蜂把杨过引到了绝情谷底，十六年之约提早了八年。', true); } },
          { id: 'xl_exit', y: 50, t: '暗流', cond: (g) => inTomb(g) && !together(g) && live(g, 'yangguo'),
            text: (g) => '你在谷底已经九年了。' + (g.recall('xlKnowsExit') ? '你想起师父临终说过的暗河。谷底这条暗流，和古墓里那条一样冷。' : '') + '你找到了一条通往外面的暗流。', choices: [
            { t: '等满十六年', canon: true, fx: (g) => g.stat('心境', -3), res: '你答应过他的。' },
            { t: '现在就出去找他', dev: 30, check: ['根骨', 50], fx: (g) => { g.set('reunionEarly'); g.stat('心境', 25); g.party(['yangguo']); g.move('road'); }, res: (g) => '你在一个小镇上找到了他。' + (oneArm(g) ? '他瘦了很多，只剩一条胳膊。' : '他瘦了很多。') + '他看着你，说不出话。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '暗流太急，你被冲了回来。', dev: 0 } },
            { t: '顺着暗流出去，远远看他一眼就回来', dev: 10, check: ['悟性', 50], fx: (g) => { g.stat('心境', 4); g.remember('xlSawYang'); }, res: '你在一个小镇的酒楼外看见了他。他正一个人喝酒。你在窗外站了一会儿，转身回了谷底。',
              fail: { fx: (g) => g.stat('根骨', -5), res: '你被水呛了一口，退了回来。', dev: 0 } },
          ] },
          { id: 'xl_meet', y: 57, auto: true, t: '十六年', loc: 'jueqing', cond: (g) => inTomb(g) && !together(g) && live(g, 'yangguo'),
            text: (g) => '十六年到了。一个人从崖上跳了下来，落进寒潭。你把他拉上来，他看着你，叫了一声“龙儿”。'
              + (g.recall('xlSawYang') ? '你没告诉他，你早就在酒楼窗外看过他一回。' : g.recall('xlWaitedFull') ? '你一只蜂也没放，就这样等满了十六年。' : ''),
            fx: (g) => { g.stat('心境', 40); g.party(['yangguo']); g.rel('丈夫', 'yangguo'); } },
          { id: 'xl_wait', y: 57, auto: true, t: '十六年', cond: (g) => inTomb(g) && !together(g) && !live(g, 'yangguo'), text: '十六年到了，没有人跳下来。你在谷口等到天黑，听过路的樵夫说，神雕侠早就死了。', fx: (g) => g.stat('心境', -40) },
          { id: 'xl_xy', y: 57, t: '襄阳', cond: (g) => inTomb(g) && live(g, 'yangguo'), text: '蒙古大汗蒙哥亲征襄阳。过儿说，郭伯伯一家有难，他得去。', choices: [
            { t: '跟他一起去', canon: true, fx: (g) => { g.move('xiangyang'); g.stat('声望', 10); }, res: '过儿一颗飞石，打死了蒙哥。你在城下用玉蜂浆救了几十个伤兵。' },
            { t: '劝他别去，你们才刚团聚', dev: 20, fx: (g) => { g.set('yangAbsent57'); g.stat('心境', 5); }, res: '他听了你的。后来传来消息，蒙哥死在了四川钓鱼城下。' },
            { t: '让他去，你回古墓等他', dev: 10, fx: (g) => { g.move('gumu'); g.stat('心境', -3); g.stat('情义', 2); }, res: '十天后他回来了，身上带着伤，说蒙哥死了。' },
          ] },
          { id: 'xl_home', y: 58, auto: true, t: '归隐', loc: 'gumu', cond: (g) => inTomb(g) && live(g, 'yangguo'), text: '你们回到了终南山古墓。墓门外，过儿种了一片花。', fx: (g) => { g.stat('心境', 15); g.rel('丈夫', 'yangguo'); g.party(['yangguo']); } },
          { id: 'xl_heir', y: 62, t: '孩子', cond: (g) => inTomb(g) && live(g, 'yangguo') && !g.f('gumuNoHeir'), text: '你有了身孕。过儿问你，孩子生下来，要不要教她古墓派的武功。', choices: [
            { t: '教', canon: true, fx: (g) => { g.stat('情义', 5); g.rel('女儿', '杨氏女'); }, res: '你们的后人里，后来出了一个穿黄衫的女子。' },
            { t: '不教了，让她做个寻常人', dev: 15, fx: (g) => { g.set('gumuNoHeir'); g.rel('女儿', '杨氏女'); }, res: '古墓派的武功，到你们这一代就断了。' },
          ] },
          { id: 'xl_lonely', y: 50, t: '墓门', cond: (g) => !inTomb(g),
            text: (g) => '你一个人在古墓里住了十几年。' + (qzPath(g) ? '有时候你会想，那个被你送回全真教的少年，是不是还在重阳宫。' : guoPath(g) ? '有时候你会想，那个被你送去襄阳的少年，现在是什么样子。' : '有时候你会想，外面的世界是什么样子。'), choices: [
            { t: '永远不出墓', canon: true, fx: (g) => g.stat('心境', -5), res: '墓门再也没有打开过。' },
            { t: '收一个女弟子，把古墓传下去', dev: 15, fx: (g) => { g.rel('徒弟', '古墓女弟子'); g.stat('情义', 5); g.stat('心境', 4); }, res: '她是山下猎户的女儿，不爱哭也不爱笑，跟你小时候一样。' },
            { t: '去重阳宫外，找那个少年', cond: (g) => qzPath(g) && live(g, 'yangguo'), dev: 35, check: ['情义', 45], fx: (g) => { g.set('ygLateTomb'); g.rel('丈夫', 'yangguo'); g.party(['yangguo']); g.stat('心境', 25); }, res: '你在重阳宫外等到黄昏。一个中年道士走出来，看见你，手里的剑掉在了地上。第二天，他脱下道袍，跟你回了古墓。', chron: '全真教的杨过还俗，进了终南山古墓。',
              fail: { fx: (g) => g.stat('心境', -5), res: '你在重阳宫外站了一天，没有看见他。你回了古墓。', dev: 0 } },
          ] },
          { id: 'xl_71', y: 71, t: '城破', cond: (g) => inTomb(g) && live(g, 'yangguo') && inXY(g) && !g.f('guoSurvive'), text: '襄阳要破了。过儿在墓门口站了一夜。', choices: [
            { t: '让他自己决定', canon: true, fx: (g) => g.stat('心境', -5), res: '他没有去。他朝着襄阳磕了三个头。' },
            { t: '“我们一起去。”', dev: 45, check: ['武学', 75], fx: (g) => { g.set('guoSurvive'); g.stat('声望', 15); }, res: '你们在城破那一刻冲进郭府，把郭靖、黄蓉带了出来。', chron: '杨过、小龙女在襄阳城破时救出了郭靖、黄蓉。',
              fail: { fx: (g) => g.stat('心境', -10), res: '你们赶到时，城已经破了。', dev: 5 } },
            { t: '你一个人去', dev: 35, check: ['武学', 80], fx: (g) => { g.set('guoSurvive'); g.stat('声望', 12); g.stat('根骨', -10); }, res: '你在城破之夜冲进郭府，用玉女剑法护着郭靖、黄蓉杀了出来。过儿在城外接应。', chron: '小龙女在襄阳城破时救出了郭靖、黄蓉。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -10); }, res: '你赶到时，城已经破了。你受了伤，被过儿背回了古墓。', dev: 5 } },
          ] },
          { id: 'xl_old', y: 88, auto: true, t: '暮年', cond: (g) => inTomb(g) || g.f('ygLateTomb'), text: (g) => (live(g, 'yangguo') ? '过儿的头发也白了。他还是叫你“龙儿”，有时候叫你“姑姑”。' : '你一个人坐在墓门口，看那片花开了又谢。'), fx: (g) => g.stat('心境', 5) },
        ],
      },
    },

    /* ===================== 郭芙 ===================== */
    {
      id: 'guofu', name: '郭芙', py: 'GUO<<FU', book: BOOK, sex: '女', born: 24,
      origin: '郭靖、黄蓉的长女',
      birthplace: '桃花岛', home: 'taohua', bg: 5,
      info: { 门派: '桃花岛', 身份: '郭大小姐' },
      look: { hair: 'twinbun', hairColor: '#2b1d14', robe: '#d27b8c', accent: '#f2d27a' },
      family: [{ rel: '父亲', id: 'guojing', name: '郭靖' }, { rel: '母亲', id: 'huangrong', name: '黄蓉' }, { rel: '外公', id: 'huangyaoshi', name: '黄药师' }],
      fateText: '娇纵任性，一剑斩断杨过右臂，又误发冰魄银针伤了小龙女。嫁耶律齐，随父母死守襄阳，城破殉难。',
      st: [65, 45, 75, 50, 5, 20, 20],
      exists: guoKids,
      death: (g) => (g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 88, cause: '在桃花岛寿终', mod: true } : { y: 71, cause: '襄阳城破时战死' }),
      ms: [
        [24, '生于桃花岛'],
        [33, '和武家兄弟一起欺负杨过', (g) => !g.f('gfKindYang')],
        [33, '护过杨过一回，被武家兄弟笑话', (g) => g.f('gfKindYang')],
        [36, '随父母移居襄阳'],
        [40, '一剑斩断杨过右臂', (g) => !g.f('guofuGentle') && inTomb(g)],
        [41, '嫁给耶律齐', (g) => !g.f('gfNoYelv')],
        [41, '嫁给武修文', (g) => g.f('gfWedWu')],
        [42, '没有嫁人，守着爹娘', (g) => g.f('gfSingle')],
        [57, '丈夫耶律齐做了丐帮帮主', (g) => !g.f('gfNoYelv') && !g.f('yelvNoGaibang') && !g.f('gfGaibang')],
        [57, '自己接了打狗棒，做了丐帮帮主', (g) => g.f('gfGaibang')],
        [72, '城破后去投奔妹妹郭襄', (g) => g.f('fuJoinsXiang')],
      ],
      arc: {
        focus: '玩耍交友',
        req: guoKids,
        intro: (g) => '纪年 24 年，你生在桃花岛上。' + (couple(g) ? '爹是郭靖，娘是黄蓉，' : '') + '外公是东邪黄药师。全岛的人都宠着你。',
        lastWords: '杨大哥，我欠你的，下辈子还。',
        nodes: [
          { id: 'gf_birth', age: 0, auto: true, t: '桃花岛', loc: 'taohua', text: '桃花开的时候，你出生了。外公说这孩子哭声太大，不像黄家的人。', fx: (g) => g.party(['guojing', 'huangrong']) },
          { id: 'gf_walk', age: 2, auto: true, t: '学步', text: '你在桃花阵里迷了路，哭了一个下午，最后是外公把你抱出来的。', fx: (g) => g.stat('心境', 2) },
          { id: 'gf_stance', age: 5, t: '马步', text: '爹教你扎马步。才一炷香，你的腿就抖了。', choices: [
            { t: '哭着跑去找娘', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('gf_soft'); }, res: '娘把你抱在怀里，回头瞪了爹一眼。从那以后，你一喊累，娘就心软。' },
            { t: '咬牙扎完', dev: 10, fx: (g) => { g.stat('武学', 3); g.stat('根骨', 3); g.remember('gf_diligent'); }, res: '爹高兴得把你举过了头顶。他说，这孩子肯吃苦，以后可以学真功夫。' },
            { t: '要外公教你别的功夫', dev: 10, fx: (g) => { g.stat('武学', 2); g.stat('悟性', 2); g.rel('师父', 'huangyaoshi'); g.remember('gf_taohua'); }, res: '外公教了你一招落英神剑掌，又教你怎么用指头弹石子。他说扎马步是你爹的笨法子。' },
          ] },
          { id: 'gf_vase', age: 7, t: '花瓶', text: '一个老哑仆打碎了你最喜欢的花瓶。他跪在地上，一片一片地捡。', choices: [
            { t: '发脾气，要外公罚他', canon: true, fx: (g) => { g.stat('正邪', -2); g.info('性子', '骄纵'); }, res: '外公没罚他，罚了你抄书。岛上的哑仆从此都躲着你。' },
            { t: '蹲下来帮他捡', dev: 10, fx: (g) => { g.stat('情义', 4); g.remember('gf_mute'); }, res: '你割破了手指，老哑仆急得直比划。第二天，他捏了一个泥瓶子给你，歪歪扭扭的。他从此把你当自己的孙女。' },
          ] },
          { id: 'gf_wu', y: 33, auto: true, t: '武家兄弟', cond: jing, text: (g) => '爹从嘉兴带回了两个男孩，武敦儒和武修文。' + (lujiaKilled(g) ? '他们的娘死在了李莫愁手里。' : '他们的爹疯疯癫癫，托爹教他们武功。') + '他们天天围着你转。', fx: (g) => { g.rel('玩伴', 'wuxiuwen'); } },
          { id: 'gf_yang', y: 33, t: '杨过', cond: (g) => jing(g) && live(g, 'yangguo') && !noTaohua(g), text: (g) => (g.f('yangguoRaisedByGuo') ? '杨过是爹的义侄，跟着爹学武，油嘴滑舌，偏偏爹最疼他。' : '爹又带回一个叫杨过的男孩，油嘴滑舌，还会一种像青蛙一样的功夫。') + '武家哥哥看他不顺眼，捋起袖子要揍他。', choices: [
            { t: '让武家哥哥教训他', canon: true, fx: (g) => { g.stat('正邪', -2); g.rel('冤家', 'yangguo'); }, res: (g) => (g.f('yangguoRaisedByGuo') ? '他把武修文打飞了。爹罚他跪了一夜，他看你的眼神从此冷了。' : '他把武修文打飞了。爹很生气，把他送去了全真教。他走的时候没看你。') },
            { t: '拉住武家哥哥', dev: 15, fx: (g) => { g.stat('情义', 4); g.set('gfKindYang'); }, res: (g) => '杨过冲你眨了眨眼，叫了你一声“芙妹”。' + (g.f('yangguoRaisedByGuo') ? '' : '可爹还是把他送去了全真教。') + '这一声，他记得，你也记得。' },
          ] },
          { id: 'gf_xy', y: 36, auto: true, t: '襄阳', loc: 'xiangyang', cond: inXY, text: '蒙古人要南下了。爹娘带着你们去了襄阳。', fx: (g) => g.info('身份', '郭大小姐（襄阳）') },
          { id: 'gf_study', y: 37, t: '学武', text: (g) => '娘要教你打狗棒法。' + (g.recall('gf_diligent') ? '你从小扎马步扎得稳，娘说可以学全套了。' : g.recall('gf_soft') ? '你喊了一声累，娘又心软了。' : '你嫌难。'), choices: [
            { t: '学了两招就去玩', canon: true, fx: (g) => { g.stat('武学', 2); g.stat('心境', 2); g.info('武功', '打狗棒法（两招）'); }, res: '娘叹了口气。往后你使棒，只会这两招。' },
            { t: '用心学全', dev: 15, fx: (g) => { g.stat('武学', 8); g.stat('悟性', 3); g.set('gfDogStick'); g.info('武功', '打狗棒法'); }, res: '你学了一整年，三十六路棒法都会了。娘说，丐帮里会这套棒法的，如今只有两个人。' },
            { t: '缠着爹学降龙十八掌', cond: (g) => g.recall('gf_diligent'), dev: 10, check: ['根骨', 50], fx: (g) => { g.stat('武学', 6); g.remember('gf_xianglong'); g.info('武功', '降龙十八掌（三掌）'); }, res: '爹教得认真，你学会了三掌。娘说这功夫不适合女孩子，你偏要练。', fail: { fx: (g) => g.stat('心境', -2), res: '你练了一个月，手掌肿了，一掌也没学会。', dev: 0 } },
          ] },
          { id: 'gf_two', y: 38, t: '武家兄弟', cond: (g) => live(g, 'wudunru') && live(g, 'wuxiuwen'), text: '武敦儒和武修文都喜欢你。他们为了你，已经好几天不说话了。', choices: [
            { t: '谁也不得罪', canon: true, fx: (g) => g.stat('心境', 2), res: '他们俩的脸色一天比一天难看。你装作没看见。' },
            { t: '当面说清楚，只当他们是哥哥', dev: 15, fx: (g) => { g.set('gfClear'); g.stat('情义', 3); }, res: '他们愣了一下，都松了口气。后来他们各自娶了妻。' },
            { t: '答应武修文', dev: 20, fx: (g) => { g.set('gfWedWu'); g.set('gfNoYelv'); g.rel('意中人', 'wuxiuwen'); g.stat('心境', 4); }, res: '武修文高兴得在院子里翻了三个跟头。武敦儒一个人去了大理，一年没有回来。' },
          ] },
          { id: 'gf_dsg', y: 39, auto: true, t: '大胜关', cond: (g) => hero(g) && live(g, 'yangguo'), text: (g) => (noTaohua(g) ? '大胜关英雄大会上，来了一个叫杨过的年轻人，爹说那是他结义兄弟的儿子，你从没见过。他' + (inTomb(g) ? '身边跟着一个白衣女子，' : '') + '一个人打退了金轮法王。' : (inTomb(g) ? '大胜关英雄大会上，杨过回来了，一身好武功，身边跟着一个白衣女子。' : '大胜关英雄大会上，杨过一个人打退了金轮法王。') + (g.f('gfKindYang') ? '他远远冲你笑了一下，还像小时候那样叫你“芙妹”。你脸红了。' : '他看都没看你。你看他的眼神有点乱。')), fx: (g) => g.stat('心境', -3) },
          { id: 'gf_duel', y: 40, t: '决斗', cond: (g) => !g.f('gfClear') && !g.f('gfWedWu') && live(g, 'wudunru') && live(g, 'wuxiuwen'), text: '武家兄弟要为你决斗，生死不论。', choices: [
            { t: '躲在房里不出来', canon: true, fx: (g) => g.stat('心境', -3), res: (g) => (inTomb(g) ? '杨过拦住了他们，骗他们说你心里喜欢的是他。他们才收了剑。' : '爹赶到，把两人各打了一顿。') },
            { t: '告诉他们：你谁也不嫁', dev: 15, fx: (g) => { g.set('gfClear'); g.stat('心境', 3); }, res: '两人看着你，剑都掉在了地上。后来他们各自娶了妻。' },
            { t: '冲出去拦在中间', dev: 10, check: ['武学', 25], fx: (g) => { g.set('gfClear'); g.stat('声望', 3); }, res: '剑尖停在你面前一寸。他们再也没提决斗的事。', fail: { fx: (g) => g.stat('根骨', -8), res: '你冲得太急，被剑风划破了胳膊。两人吓得扔了剑，可第二天又吵了起来。', dev: 0 } },
          ] },
          { id: 'gf_yelv', y: 40, t: '耶律齐', cond: (g) => live(g, 'yelvqi') && !g.f('gfWedWu'), text: '一个叫耶律齐的年轻人，武功好，人又稳重。他看你的时候，眼睛很亮。', choices: [
            { t: '心动了', canon: true, fx: (g) => { g.rel('意中人', 'yelvqi'); g.stat('心境', 5); }, res: '你回头看了他三次。' },
            { t: '不理他', dev: 20, fx: (g) => g.set('gfNoYelv'), res: '他走了。你有点后悔，又说不出后悔什么。' },
          ] },
          { id: 'gf_arm', y: 40, t: '断臂', cond: (g) => hero(g) && live(g, 'yangguo') && !g.f('yangArm'), text: '刚出生的妹妹不见了。你认定是杨过害的，抓起了淑女剑。', choices: [
            { t: '一剑挥过去', canon: true, fx: (g) => { g.stat('正邪', -10); g.stat('心境', -15); g.remember('gf_cut'); }, res: '杨过没有躲。他的右臂掉在了地上。你吓呆了。这一剑，你后来想了一辈子。' },
            { t: '剑停在半空', dev: 30, fx: (g) => { g.set('guofuGentle'); g.stat('正邪', 5); }, res: '他看着你，你看着他。后来你才知道，妹妹是他救回来的。', chron: '郭芙的剑停在了半空，杨过没有断臂。' },
            { t: '叫一声“杨大哥”，先问清楚', cond: (g) => g.f('gfKindYang'), dev: 30, fx: (g) => { g.set('guofuGentle'); g.stat('情义', 4); }, res: '他愣了一下，像小时候那样冲你眨眨眼：“芙妹，孩子在程英那里，好好的。”你的剑垂了下去。', chron: '郭芙叫了一声杨大哥，没有挥剑。' },
            { t: '先问他妹妹在哪里', cond: (g) => !g.f('gfKindYang'), dev: 25, check: ['悟性', 45], fx: (g) => { g.set('guofuGentle'); g.stat('悟性', 3); }, res: '他说孩子是他从李莫愁手里抢回来的，现在在程英那里。你的剑慢慢放了下来。', fail: { fx: (g) => { g.stat('正邪', -10); g.stat('心境', -15); g.remember('gf_cut'); }, res: '他还没开口，你的剑已经落了下去。他的右臂掉在了地上。', dev: 0 } },
          ] },
          { id: 'gf_needle', y: 41, t: '冰魄银针', cond: (g) => inTomb(g) && live(g, 'xiaolongnv') && !g.f('longStayed') && !g.f('reunionEarly'), text: '混战中，你抓起地上的冰魄银针，朝杨过掷去。', choices: [
            { t: '掷出去', canon: true, fx: (g) => { g.stat('正邪', -5); g.stat('心境', -10); g.remember('gf_threw'); }, res: '小龙女挡在了他身前。银针打在她身上。' },
            { t: '收手', dev: 35, fx: (g) => { g.set('longStayed'); g.stat('正邪', 5); }, res: '银针掉在地上。小龙女看了你一眼，扶着杨过走了。', chron: '郭芙没有掷出冰魄银针，小龙女没有跳下断肠崖。' },
            { t: '用外公教的指法，把针弹进土里', cond: (g) => g.recall('gf_taohua'), dev: 35, fx: (g) => { g.set('longStayed'); g.stat('武学', 3); }, res: '银针钻进了土里，只露出一点寒光。外公在人群里看了你一眼，点了点头。', chron: '郭芙用桃花岛的指法弹落了冰魄银针，小龙女没有跳下断肠崖。' },
          ] },
          { id: 'gf_wed', y: 41, auto: true, t: '出嫁', cond: (g) => !g.f('gfNoYelv') && live(g, 'yelvqi'), text: '你嫁给了耶律齐。爹喝醉了，娘一直在笑。', fx: (g) => { g.rel('丈夫', 'yelvqi'); g.unrel('意中人'); g.party(['yelvqi']); g.info('身份', '耶律夫人'); g.remember('gf_married'); } },
          { id: 'gf_wuwed', y: 41, auto: true, t: '出嫁', cond: (g) => g.f('gfWedWu') && live(g, 'wuxiuwen'), text: '你嫁给了武修文。他笨手笨脚地给你戴上簪子，扎疼了你的头皮。武敦儒从大理寄来一对玉镯，人没有来。', fx: (g) => { g.rel('丈夫', 'wuxiuwen'); g.unrel('意中人'); g.party(['wuxiuwen']); g.info('身份', '武夫人'); g.remember('gf_married'); } },
          { id: 'gf_wed2', y: 42, t: '婚事', cond: (g) => !g.f('gfWedWu') && (g.f('gfNoYelv') || !live(g, 'yelvqi')), text: '娘问你，到底想嫁给谁。', choices: [
            { t: '谁也不嫁', canon: true, fx: (g) => { g.set('gfSingle'); g.stat('心境', 3); g.info('身份', '郭大小姐'); }, res: '你守着爹娘，在襄阳过了一年又一年。' },
            { t: '嫁给武修文', cond: (g) => live(g, 'wuxiuwen'), dev: 10, fx: (g) => { g.set('gfWedWu'); g.rel('丈夫', 'wuxiuwen'); g.party(['wuxiuwen']); g.info('身份', '武夫人'); g.remember('gf_married'); }, res: '武敦儒喝了一夜的酒，第二天来给你们道喜。' },
            { t: '让娘做主', dev: 5, fx: (g) => { g.rel('丈夫', '守城将军之子'); g.info('身份', '将军夫人'); g.remember('gf_married'); }, res: '娘给你挑了一个守城将军的儿子，人老实，不会武功。日子过得也还好。' },
          ] },
          { id: 'gf_kids', y: 45, auto: true, t: '儿女', cond: (g) => g.recall('gf_married') && !g.f('gfSingle'), text: '你生了一儿一女。你抱着他们，忽然明白了娘当年为什么总护着你。', fx: (g) => { g.stat('情义', 8); g.rel('儿女', '一儿一女'); g.remember('gf_kids'); } },
          { id: 'gf_sis', y: 48, t: '妹妹', cond: (g) => g.alive('guoxiang'), text: '妹妹郭襄八岁了，整天往城外跑，跟乞丐、和尚、江湖汉子都能聊上半天。', choices: [
            { t: '骂她没规矩', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('gf_scold'); }, res: '她冲你做了个鬼脸，又跑了。她有什么心事，从来不跟你说。' },
            { t: '带她去城外玩', dev: 10, fx: (g) => { g.stat('情义', 4); g.stat('心境', 4); g.set('fuXiangClose'); }, res: '你们在汉水边玩到天黑，回去一起挨了娘的骂。从那以后，妹妹有什么事都先跑来告诉你。' },
          ] },
          { id: 'gf_city', y: 52, t: '守城', loc: 'xiangyang', cond: inXY, text: (g) => '蒙古兵又来攻城。爹在城头指挥，娘在城里调度。你站在城下，手里握着剑。' + (g.recall('gf_xianglong') ? '掌心发热，爹教你的那三掌还在。' : ''), choices: [
            { t: '跟着娘调度粮草', canon: true, fx: (g) => { g.stat('悟性', 3); g.info('差事', '调度粮草'); }, res: '你第一次知道，一座城一天要吃多少米。' },
            { t: '上城头杀敌', check: ['武学', 40], dev: 10, fx: (g) => { g.stat('声望', 8); g.remember('gf_soldier'); g.info('差事', '守西城'); }, res: '你砍翻了两个爬上城头的蒙古兵。西城的兵从此认你，叫你“郭将军”。',
              fail: { fx: (g) => g.stat('根骨', -10), res: '你中了一箭，被人抬了下去。', dev: 0 } },
            { t: '带丐帮弟子夜里出城烧营', cond: (g) => g.f('gfDogStick'), dev: 15, check: ['悟性', 50], fx: (g) => { g.stat('声望', 8); g.remember('gf_soldier'); g.info('差事', '带丐帮弟子守城'); }, res: '火烧了半夜。跟你出城的丐帮弟子，从此只听你的号令。', fail: { fx: (g) => g.stat('根骨', -8), res: '你们被蒙古兵发现了，退回城时少了三个人。', dev: 0 } },
            { t: '在城里挨家挨户发米', dev: 10, fx: (g) => { g.stat('情义', 4); g.remember('gf_rice'); }, res: '一个老太太拉着你的手说：“郭大小姐长大了。”城里的百姓都认得了你的脸。' },
          ] },
          { id: 'gf_fengling', y: 56, auto: true, t: '妹妹', cond: (g) => g.alive('guoxiang'), text: (g) => (g.f('fuXiangClose') ? '妹妹从风陵渡回来，拉着你说了一夜神雕侠。你听着听着，想起了一个人。' : g.recall('gf_scold') ? '妹妹从风陵渡回来，魂不守舍。她不跟你说，你是从娘那里听说“神雕侠”这三个字的。' : '妹妹从风陵渡回来，魂不守舍，整天念叨一个叫“神雕侠”的人。'), fx: (g) => g.stat('心境', -1) },
          { id: 'gf_sorry', y: 57, t: '杨过', cond: (g) => hero(g) && live(g, 'yangguo'), text: (g) => '襄阳大战，杨过救了' + (g.recall('gf_married') ? '你的丈夫' : '你') + '。' + (g.recall('gf_cut') ? '他空荡荡的右袖在风里飘。' : '') + (g.recall('gf_threw') ? '你想起断肠崖前那一针。' : '') + '你忽然明白，这么多年你一直在跟他赌气，是因为你心里有他。', choices: [
            { t: '心里明白，嘴上什么也没说', canon: true, fx: (g) => { g.stat('心境', -5); g.remember('gf_silent'); }, res: '他走了。你望着他的背影，眼泪流了下来。' },
            { t: '当面跟他道歉', dev: 15, fx: (g) => { g.set('gfApologized'); g.stat('心境', 10); g.stat('情义', 5); }, res: '他愣了一下，笑了：“郭大小姐，你也会道歉？”临走时他说，襄阳有事，放一支响箭，他的雕听得见。' },
          ] },
          { id: 'gf_gaibang', y: 57, t: '帮主', cond: (g) => !g.f('gfNoYelv') && live(g, 'yelvqi'), text: '丐帮推耶律齐做帮主。他问你的意思。', choices: [
            { t: '“你去吧。”', canon: true, fx: (g) => { g.stat('声望', 6); g.info('身份', '丐帮帮主夫人'); }, res: '他接了打狗棒。你替他缝了一件新衣裳。' },
            { t: '劝他别接', dev: 15, fx: (g) => { g.set('yelvNoGaibang'); g.stat('心境', 3); }, res: '他听了你的。丐帮的帮主之位落到了别人手里，那些长老跟郭家也渐渐疏远了。' },
            { t: '打狗棒法你也会，你来接', cond: (g) => g.f('gfDogStick'), dev: 25, check: ['声望', 35], fx: (g) => { g.set('gfGaibang'); g.info('身份', '丐帮帮主'); g.stat('声望', 10); }, res: '你当着八袋长老使了一遍打狗棒法。没人再说话。耶律齐在台下笑得比谁都高兴。', chron: '郭芙接了打狗棒，做了丐帮帮主。', fail: { fx: (g) => { g.stat('心境', -4); g.info('身份', '丐帮帮主夫人'); }, res: '长老们说，丐帮没有让大小姐当帮主的规矩。打狗棒还是交到了耶律齐手里。', dev: 0 } },
          ] },
          { id: 'gf_mid', y: 62, t: '娘', cond: rong, text: '娘年纪大了，城里的事越来越多。她想让你帮着管。', choices: [
            { t: '推给丈夫', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('gf_mid', 'husband'); }, res: '娘没说什么，只是眼角的皱纹又深了。' },
            { t: '接下来', dev: 10, fx: (g) => { g.stat('悟性', 4); g.stat('声望', 5); g.remember('gf_mid', 'me'); g.info('差事', '管城中户籍粮草'); }, res: '你学着娘的样子算账、派人、看地图。城里哪条巷子住着几个孩子，你心里都有数。' },
          ] },
          { id: 'gf_kidsout', y: 68, t: '孩子', cond: (g) => inXY(g) && g.recall('gf_kids'), text: (g) => '蒙古大军把襄阳围得水泄不通。爹娘决意死守。' + (g.f('yelvNoGaibang') ? '丈夫不是帮主，丐帮的人不大听你使唤。' : ''), choices: [
            { t: '留在城里，一家人在一起', canon: true, fx: (g) => { g.stat('情义', 3); g.remember('gf_kids_in'); }, res: '孩子们问你，蒙古人什么时候走。你说快了。' },
            { t: '趁夜把孩子送出城', check: ['悟性', 45], dev: 15, fx: (g) => { g.set('gfKidsOut'); g.stat('心境', 5); }, res: '孩子们被人带出了城，往南去了。你在城头站到天亮。',
              fail: { fx: (g) => { g.stat('心境', -10); g.remember('gf_kids_in'); }, res: '城外的蒙古兵太多，送孩子的人又退了回来。', dev: 0 } },
            { t: '托桃花岛的老哑仆来接', cond: (g) => g.recall('gf_mute'), dev: 15, fx: (g) => { g.set('gfKidsOut'); g.remember('gf_kids_taohua'); }, res: '老哑仆撑着一条小船从汉水上摸进来，把孩子们藏在船底的草席下。他冲你比划：放心。' },
            { t: '把城里的孩子都送走', cond: (g) => g.recall('gf_mid') === 'me', dev: 25, check: ['悟性', 55], fx: (g) => { g.set('gfKidsOut'); g.set('xyChildrenOut'); g.stat('声望', 8); }, res: '你照着户籍，一条巷子一条巷子地叫人。三个月里，三百多个孩子从水门出了城。', chron: '襄阳城破前，郭芙把城里三百多个孩子送出了城。', fail: { fx: (g) => { g.set('gfKidsOut'); g.stat('心境', -6); }, res: '只送出去一船。你自己的孩子在船上，别人家的没有。你不敢看那些母亲的眼睛。', dev: 5 } },
          ] },
          { id: 'gf_sword', y: 70, auto: true, t: '铸剑', cond: (g) => !g.f('yangKeepsSword') && jing(g), text: (g) => parents(g) + '把杨过留下的玄铁重剑熔了，铸成一刀一剑。剑给了妹妹，刀给了弟弟破虏。你问为什么没有你的，娘摸了摸你的头。', fx: (g) => g.stat('心境', -2) },
          { id: 'gf_fall', y: 71, t: '城破', cond: (g) => !g.f('guoSurvive') && inXY(g), text: (g) => '城破了。蒙古兵从四面涌进来。爹娘站在城头，没有走的意思。' + (g.f('gfKidsOut') ? '孩子们早已出城，你心里没有别的牵挂了。' : g.recall('gf_kids') ? '孩子们缩在你身后。' : '') + (g.recall('gf_mid') === 'husband' ? '丈夫在城门口喊你的名字。' : ''), choices: [
            { t: '守在爹娘身边，到最后', canon: true, fatal: true, fx: (g) => g.die('襄阳城破时战死'), res: '你终于像他们的女儿了。' },
            { t: '杀出去', check: ['武学', 50], dev: 30, fx: (g) => { g.stat('根骨', g.recall('gf_soldier') ? -10 : -15); g.stat('心境', -30); g.move('road'); g.party([]); }, res: (g) => (g.recall('gf_soldier') ? '跟你守过西城的兵围着你，硬是在西门撞开一条路。出城时，二十个人只剩了五个。' : '你杀出了城门。') + '回头看时，城头上已经换了旗。',
              fail: { fx: (g) => { if (g.recall('gf_soldier')) { g.stat('根骨', -25); g.move('road'); g.party([]); } else g.die('城破时突围不成，死在乱军中'); }, res: (g) => (g.recall('gf_soldier') ? '你倒在西门口。跟你守过城的兵把你扛了出去，他们自己没有出来。' : '城门口的人太多了。'), dev: 10 } },
            { t: '拉着爹娘一起走', cond: (g) => !(g.f('gfApologized') && live(g, 'yangguo')), dev: 30, check: ['情义', 75], fx: (g) => { g.set('guoSurvive'); g.stat('根骨', -12); g.stat('心境', -10); g.move('road'); }, res: '娘看着你，忽然笑了：“芙儿长大了。”爹叹了口气，跟着你们杀了出去。', chron: '郭芙在襄阳城破时劝动了父母，一家人杀了出来。', fail: { fx: (g) => g.die('襄阳城破时战死'), res: '爹说：“襄阳在，郭靖在。”你留了下来。', dev: 5 } },
            { t: '放出响箭，求杨过来接应', cond: (g) => g.f('gfApologized') && live(g, 'yangguo'), dev: 35, check: ['情义', 50], fx: (g) => { g.set('guoSurvive'); g.stat('心境', -5); g.move('road'); }, res: '响箭冲上了天。半个时辰后，一只大雕落在城头。杨过说：“郭大小姐，我来还你那声道歉。”爹娘被他和你一左一右架下了城。', chron: '郭芙放出响箭，杨过赶到襄阳，郭靖、黄蓉活着出了城。', fail: { fx: (g) => g.die('襄阳城破时战死'), res: '响箭飞了出去。雕没有来。你回到爹娘身边，握紧了剑。', dev: 5 } },
          ] },
          { id: 'gf_far', y: 71, auto: true, t: '城破', cond: (g) => g.f('guoLeftXiangyang') && !g.f('guoSurvive'), text: '消息传到桃花岛：襄阳城破了。爹在海边站了一夜。', fx: (g) => g.stat('心境', -15) },
          { id: 'gf_survive', y: 71, auto: true, t: '城破', cond: (g) => g.f('guoSurvive'), text: (g) => (g.f('gfApologized') ? '你们一家跟着杨过的雕，从北门杀了出去。' : '城破那一刻，你们一家杀出了重围。') + '爹回头看了襄阳很久。', fx: (g) => { g.stat('心境', -10); g.move('road'); } },
          { id: 'gf_kidslost', y: 72, auto: true, t: '孩子', cond: (g) => g.recall('gf_kids_in') && !g.f('gfKidsOut'), text: '你在难民里找了三个月，没有找到孩子。有人说看见他们跟着人群往南走了，有人说没有。你不敢再问。', fx: (g) => { g.stat('心境', -20); g.unrel('儿女'); } },
          { id: 'gf_after', y: 72, t: '去处', text: (g) => '襄阳没了。' + (g.f('xyChildrenOut') ? '路上有人认出你，说他家的孩子就是你送出城的。' : g.recall('gf_rice') ? '路上一个老太太塞给你一个饼，说当年吃过你发的米。' : '') + '你不知道该去哪里。', choices: [
            { t: '回桃花岛', canon: true, fx: (g) => { g.move('taohua'); g.stat('心境', 5); }, res: '岛上的桃花还在开。哑仆们老了，还认得你。' },
            { t: '去江南找孩子', cond: (g) => g.f('gfKidsOut'), dev: 10, fx: (g) => { g.move(g.recall('gf_kids_taohua') ? 'taohua' : 'jiangnan'); g.remember('gf_find_kids'); }, res: (g) => (g.recall('gf_kids_taohua') ? '老哑仆在码头上等你，身后站着你的两个孩子。' : '你沿着江一个镇一个镇地找。') },
            { t: '留在襄阳附近，收殓战死的人', dev: 10, fx: (g) => { g.stat('正邪', 8); g.stat('心境', -8); g.remember('gf_bury'); }, res: '你埋了很多人，有的叫得出名字，有的叫不出。' },
            { t: '去找妹妹', cond: (g) => g.alive('guoxiang'), dev: 15, fx: (g) => { g.move('road'); g.set('fuJoinsXiang'); g.stat('情义', 5); }, res: '你在江湖上找了她两年。见面时，她抱着你哭了，说这世上只剩你们姐妹俩了。' },
          ] },
          { id: 'gf_kidsback', y: 75, auto: true, t: '团聚', cond: (g) => g.f('gfKidsOut'), text: (g) => (g.recall('gf_find_kids') || g.recall('gf_kids_taohua') ? '孩子们长高了。儿子会撑船，女儿会摆桃花阵，她说是老哑仆教的。' : '一个丐帮弟子把你的孩子们送到了你面前。他们找了你三年。') + '你一手搂一个，谁也不放。', fx: (g) => { g.stat('心境', 15); g.stat('情义', 5); } },
          { id: 'gf_emei', y: 80, t: '峨嵋', cond: (g) => g.alive('guoxiang') && !g.f('emeiLate') && !g.f('fuJoinsXiang'), text: '妹妹在峨嵋开派了。她写信来，问你要不要上山住一阵。', choices: [
            { t: '不去，你怕山上冷', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('gf_letters'); }, res: '你回了一封信，写了很长。往后每年，你们都要写几封。' },
            { t: '上山去', dev: 10, fx: (g) => { g.move('emei'); g.stat('情义', 5); }, res: '你在峨嵋住了下来，教小尼姑们做桃花岛的点心。' },
            { t: '送女儿上峨嵋学艺', cond: (g) => g.f('gfKidsOut'), dev: 15, fx: (g) => { g.set('gfDaughterEmei'); g.stat('声望', 3); }, res: '女儿背着淑女剑上了山。妹妹回信说，这孩子的脾气，跟你小时候一模一样。' },
          ] },
          { id: 'gf_old', y: 84, auto: true, t: '暮年', text: (g) => '你常常梦见襄阳城头的风。' + (g.recall('gf_cut') ? '梦里那一剑总是落下去，你每次都惊醒。' : g.f('gfApologized') ? '梦里杨过还是那个油嘴滑舌的少年，冲你眨眼睛。' : g.recall('gf_silent') ? '梦里你终于把那句话说出了口。' : '梦里爹娘都还年轻。') + (g.recall('gf_bury') ? '你每年清明都回襄阳城外，给那些坟添土。' : '') + (g.f('gfDaughterEmei') ? '女儿从峨嵋寄来信，说她当了长老。' : g.recall('gf_letters') ? '妹妹的信你收了满满一箱。' : ''), fx: (g) => g.stat('心境', 3) },
        ],
      },
    },

    /* ===================== 郭襄 ===================== */
    {
      id: 'guoxiang', name: '郭襄', py: 'GUO<<XIANG', book: BOOK, sex: '女', born: 40,
      origin: '郭靖、黄蓉的小女儿，人称小东邪',
      birthplace: '襄阳', home: 'xiangyang', bg: 5,
      info: { 门派: '桃花岛', 身份: '郭二小姐' },
      look: { hair: 'twinbun', hairColor: '#20160f', robe: '#c9a14a', accent: '#6b8f5e' },
      family: [{ rel: '父亲', id: 'guojing', name: '郭靖' }, { rel: '母亲', id: 'huangrong', name: '黄蓉' }, { rel: '姐姐', id: 'guofu', name: '郭芙' }, { rel: '弟弟', id: 'guopolu', name: '郭破虏' }],
      fateText: '风陵渡口一见神雕侠，误了终身。走遍天下寻他不得，四十岁在峨嵋出家，开创峨嵋派。',
      st: [70, 80, 85, 85, 5, 20, 50],
      exists: guoKids,
      death: (g) => (g.f('emeiLate') ? { y: 112, cause: '在江湖上漂泊多年，死在一座小庙里', mod: true } : { y: 118, cause: '在峨嵋金顶坐化' }),
      ms: [
        [40, '生于襄阳，当夜被李莫愁抢走', (g) => lmcVillain(g) && !g.f('xiangNotStolen')],
        [40, '生于襄阳', (g) => !lmcVillain(g) || g.f('xiangNotStolen')],
        [54, '人称小东邪'],
        [56, '风陵渡口遇见神雕侠，得三枚金针', (g) => inTomb(g) && !g.f('gxNoMeet')],
        [58, '留在襄阳守城', (g) => g.f('gxStayXY')],
        [60, '在少林听觉远念出《九阳真经》', (g) => !g.f('gxStayXY')],
        [61, '走遍天下寻找杨过', (g) => !g.f('gxStayXY')],
        [66, '嫁给了一个少年剑客', (g) => g.f('guoxiangMarried')],
        [72, '和姐姐郭芙一起漂泊江湖', (g) => g.f('fuJoinsXiang')],
        [80, '在峨嵋出家，开创峨嵋派', (g) => !g.f('emeiLate') && !g.f('emeiLaywoman')],
        [80, '在峨嵋结庐收徒，开创峨嵋派', (g) => g.f('emeiLaywoman')],
        [80, '仍在江湖漂泊', (g) => g.f('emeiLate')],
        [110, '把掌门之位传给风陵'],
      ],
      arc: {
        focus: '玩耍交友',
        req: guoKids,
        intro: (g) => (inXY(g) ? '纪年 40 年，你生在襄阳。出生那天，城外正在打仗。' : '纪年 40 年，你生在桃花岛。爹没有去守襄阳，可他每天都望着西边。') + (lmcVillain(g) && !g.f('xiangNotStolen') ? '当夜，你被赤练仙子李莫愁抢走了。' : ''),
        lastWords: '我这一生，只想再见他一面。',
        nodes: [
          { id: 'gx_leopard', age: 0, auto: true, t: '豹奶', cond: (g) => lmcVillain(g) && hero(g) && !g.f('xiangNotStolen') && !g.f('mochouReturnedXiang'), text: '一个少年从李莫愁手里抢回了你，抱着你躲进山洞，找来一只母豹喂你奶。几天后你被送回了娘身边。', fx: (g) => { g.move(inXY(g) ? 'xiangyang' : 'taohua'); g.stat('根骨', 5); g.party(['guojing', 'huangrong']); } },
          { id: 'gx_returned', age: 0, auto: true, t: '回家', cond: (g) => lmcVillain(g) && !g.f('xiangNotStolen') && g.f('mochouReturnedXiang'), text: '李莫愁抱着你走了三天。第四天夜里，她把你放在郭府门口，敲了三下门，走了。娘抱起你，看见襁褓里塞着一包米糕。', fx: (g) => { g.move(inXY(g) ? 'xiangyang' : 'taohua'); g.party(['guojing', 'huangrong']); } },
          { id: 'gx_born', age: 0, auto: true, t: '出生', cond: (g) => !lmcVillain(g) || g.f('xiangNotStolen') || (!hero(g) && !g.f('mochouReturnedXiang')), text: '你和弟弟破虏是双胞胎。你比他早出来一刻。', fx: (g) => { g.move(inXY(g) ? 'xiangyang' : 'taohua'); g.party(['guojing', 'huangrong']); } },
          { id: 'gx_name', age: 1, auto: true, t: '取名', text: (g) => (jing(g) ? '爹给你取名郭襄，盼你记得襄阳。' : '娘给你取名郭襄，说是盼你记得襄阳。') },
          { id: 'gx_candy', age: 5, t: '糖', text: (g) => '娘给了你一包糖。' + (inXY(g) ? '城门口' : '码头上') + '蹲着几个和你一般大的小乞丐。', choices: [
            { t: '全都分给他们', canon: true, fx: (g) => { g.stat('情义', 5); g.remember('gx_beggars'); }, res: '他们以后见了你，都叫你“二小姐”。城里哪条水沟通哪里，他们都告诉你。' },
            { t: '拿糖换他们讲城外的故事', dev: 5, fx: (g) => { g.stat('悟性', 3); g.remember('gx_stories'); }, res: '一个小乞丐讲了一个独臂大侠骑着大雕的故事。你听了三遍，记了很多年。' },
          ] },
          { id: 'gx_wall', age: 8, auto: true, t: '城头', cond: inXY, text: '你偷偷爬上城头，看见城外的营帐一直连到天边。那天晚上你没睡着。', fx: (g) => g.stat('悟性', 2) },
          { id: 'gx_martial', age: 10, t: '学武', text: '娘教你落英神剑掌。你学得快，可总是学一半就跑出去玩。', choices: [
            { t: '学一半就跑', canon: true, fx: (g) => { g.stat('武学', 2); g.stat('心境', 3); g.remember('gx_roam'); }, res: '你在城外认识了一个说书的瞎子，一个打铁的老汉，还有一个会算命的和尚。' },
            { t: '耐着性子学完', dev: 10, fx: (g) => { g.stat('武学', 7); g.remember('gx_luoying'); g.info('武功', '落英神剑掌'); }, res: '娘说，你比你姐姐有天分。你的掌法里有了桃花岛的影子。' },
            { t: '缠着爹学降龙十八掌', dev: 10, check: ['根骨', 55], fx: (g) => { g.stat('武学', 5); g.remember('gx_xianglong'); g.info('武功', '降龙十八掌（两掌）'); }, res: '爹教了你两掌，说你比你姐姐有力气。', fail: { fx: (g) => g.stat('武学', 2), res: '你推了一下午木桩，木桩没动。', dev: 0 } },
          ] },
          { id: 'gx_grandpa', age: 12, t: '外公', cond: (g) => live(g, 'huangyaoshi'), text: '外公黄药师来襄阳看你。他说你性子像他，问你想不想跟他回桃花岛。', choices: [
            { t: '陪外公喝酒，不走', canon: true, fx: (g) => { g.stat('心境', 5); g.remember('gx_grandpa', 'wine'); }, res: '你喝了三杯，外公喝了三坛。他说：“好，有我黄老邪的样子。”' },
            { t: '跟外公去桃花岛住几年', dev: 15, fx: (g) => { g.move('taohua'); g.stat('悟性', 5); g.rel('师父', 'huangyaoshi'); g.remember('gx_grandpa', 'island'); }, res: '桃花阵你走了三遍就记住了。外公教你弹指神通、碧海潮生曲，说你比你娘小时候还快。' },
          ] },
          { id: 'gx_east', age: 14, auto: true, t: '小东邪', text: (g) => (g.recall('gx_grandpa') === 'island' ? '你从桃花岛回到襄阳，一身外公的脾气。' : '') + (g.recall('gx_roam') ? '你在城外跟各色人等称兄道弟，' : '你') + '喝酒、听书、打抱不平。' + (g.recall('gx_beggars') ? '当年那几个小乞丐如今都进了丐帮，见了你还叫二小姐。' : '') + '江湖上的人开始叫你“小东邪”。', fx: (g) => { g.info('身份', '小东邪'); g.stat('声望', 5); if (g.recall('gx_grandpa') === 'island') g.move(inXY(g) ? 'xiangyang' : 'taohua'); } },
          { id: 'gx_fengling', y: 56, t: '风陵渡', loc: 'fenglingdu', text: (g) => '风陵渡口下着大雪，一屋子人围着火堆，在讲一个叫“神雕侠”的人。他' + (oneArm(g) ? '断了一条胳膊，' : '') + '带着一只大雕，专管天下不平事。' + (g.knows('yangguo') ? '你听着听着笑了：他们说的是杨大哥。他这几年不常回家，原来在外面闯出了这么大的名头。' : g.recall('gx_stories') ? '你想起小时候小乞丐讲的那个故事，心怦怦地跳。' : ''), choices: [
            { t: '跟着去找他', canon: true, fx: (g) => { g.stat('心境', 5); g.info('心事', '神雕侠'); }, res: '你跟着一个叫大头鬼的怪人，走进了黑夜里。' },
            { t: '天亮了就回家', dev: 30, fx: (g) => { g.set('gxNoMeet'); g.move('xiangyang'); }, res: '你回了襄阳。很多年后你还在想，那天夜里要是去了，会怎么样。', chron: '郭襄在风陵渡没有去找神雕侠。' },
          ] },
          { id: 'gx_needles', y: 56, t: '三枚金针', cond: (g) => !g.f('gxNoMeet') && hero(g) && live(g, 'yangguo'), text: (g) => (g.knows('yangguo') ? '你在黑夜里找到了杨大哥。他吓了一跳，骂你一个姑娘家怎么跑这么远，骂完了又笑。' : '你见到了他。') + '他送你三枚金针，说凭一枚金针，他就替你做一件事。第一枚，你要看他的样子。第二枚，你要他来给你过生日。第三枚呢？', choices: [
            { t: '留到以后，求他不要自寻短见', canon: true, fx: (g) => { g.stat('情义', 5); g.info('金针', '三枚都用了'); }, res: '后来在绝情谷，你用掉了它。' },
            { t: '一直留着，不到最要紧的时候不用', dev: 20, fx: (g) => { g.set('guoxiangNeedle'); g.info('金针', '还剩一枚'); }, res: '你把最后一枚金针缝进了衣服里。他说，什么时候拿出来，他什么时候到。' },
            { t: '第三枚：请他收你为徒', dev: 15, fx: (g) => { g.stat('武学', 6); g.rel('师父', 'yangguo'); g.remember('gx_yang_pupil'); }, res: '他想了想，教了你三招剑法，说：“够你防身了。”他说他不收徒弟，可你一直管他叫师父。' },
          ] },
          { id: 'gx_noshow', y: 56, auto: true, t: '风陵渡', cond: (g) => !g.f('gxNoMeet') && !(hero(g) && live(g, 'yangguo')), text: '你找了很久，没找到传说中的神雕侠。也许根本就没有这个人。', fx: (g) => g.stat('心境', -3) },
          { id: 'gx_bday', y: 57, auto: true, t: '生日', cond: (g) => !g.f('gxNoMeet') && hero(g) && live(g, 'yangguo'), text: '你十六岁生日那天，他送了你三份大礼：烧了蒙古大军的粮草，揭穿了混进丐帮的霍都，在城外放了满天的烟花。全城的人都知道了你的名字。', fx: (g) => { g.stat('心境', 15); g.stat('声望', 10); } },
          { id: 'gx_jump', y: 57, t: '断肠崖', loc: 'jueqing', cond: (g) => !g.f('gxNoMeet') && inTomb(g) && live(g, 'yangguo') && !together(g), text: '十六年之约到了，小龙女没有来。他跳下了断肠崖。', choices: [
            { t: '跟着跳下去', canon: true, fx: (g) => { g.stat('根骨', -5); g.remember('gx_jumped', 'jump'); }, res: '你落进寒潭里。是他把你捞了上来，身边站着一个白衣女子。' },
            { t: '在崖上等', dev: 10, fx: (g) => { g.stat('心境', -5); g.remember('gx_jumped', 'wait'); }, res: '你在崖上等了一天一夜。他们一起上来了。他没有看见你哭过。' },
          ] },
          { id: 'gx_jinlun', y: 57, t: '金轮法王', cond: (g) => live(g, 'jinlun'), text: (g) => (g.recall('gx_luoying') ? '你使出娘教的落英神剑掌，还是被一个高大的藏僧一把抓住。' : '') + '金轮法王擒住了你，说你根骨奇佳，要收你做徒弟，把一身武功都传给你。', choices: [
            { t: '“我才不拜你这个坏和尚。”', canon: true, fx: (g) => { g.stat('正邪', 3); g.remember('gx_jinlun', 'no'); }, res: '他也不恼，天天在你耳边讲龙象般若功。' },
            { t: '假装答应，套他的功夫', check: ['悟性', 65], dev: 15, fx: (g) => { g.stat('武学', 8); g.set('gxLongxiang'); g.info('武功', '龙象般若功（两层）'); }, res: '你学了两层龙象般若功的口诀。他高兴得像个孩子。',
              fail: { fx: (g) => { g.stat('心境', -3); g.remember('gx_jinlun', 'no'); }, res: '他看穿了你，哈哈大笑：“小丫头，比我徒弟聪明。”', dev: 0 } },
            { t: '劝他别再替蒙古人卖命', dev: 25, check: ['悟性', 60], fx: (g) => { g.set('jinlunDoubt'); g.stat('情义', 4); }, res: '他听了很久，叹气说：“小丫头，你要是我女儿就好了。”那天夜里，他一个人坐到天亮。', fail: { fx: (g) => g.remember('gx_jinlun', 'no'), res: '他哈哈大笑：“小丫头懂什么。”', dev: 0 } },
          ] },
          { id: 'gx_fire', y: 57, auto: true, t: '高台', cond: (g) => live(g, 'jinlun') && !g.f('jinlunDoubt'), text: (g) => '蒙古人把你绑在城外的高台上，逼你爹投降。' + (g.recall('gx_jinlun') === 'no' ? '你骂了金轮法王一路，他只是笑。' : '') + '台下堆满了柴，点起了火。' + (g.recall('gx_xianglong') ? '你用爹教的掌法踢翻了一个举火把的兵，' : '') + (hero(g) && live(g, 'yangguo') ? '金轮法王扑上来护住了你。杨过的重剑到了。' : '金轮法王扑上来护住了你。爹冲上了高台。') + (g.f('gxLongxiang') ? '他临死前说，那两层口诀，你别忘了。' : ''),
            fx: (g) => { g.kill('jinlun', hero(g) && live(g, 'yangguo') ? '在襄阳城外高台上死于杨过剑下' : '在襄阳城外高台上为护郭襄而死', true); g.stat('根骨', -5); } },
          { id: 'gx_fire2', y: 57, auto: true, t: '高台', cond: (g) => live(g, 'jinlun') && g.f('jinlunDoubt'), text: '蒙古人要把你绑上高台逼你爹投降。那天夜里，金轮法王解开了你的绳子，亲手把你送到城下。他说他老了，要回西藏去了，再也不替谁打仗。', fx: (g) => { g.stat('心境', 8); g.stat('情义', 4); } },
          { id: 'gx_farewell', y: 57, auto: true, t: '华山', loc: 'huashan', cond: (g) => hero(g) && live(g, 'yangguo') && !g.f('gxNoMeet'), text: (g) => '华山之巅，他' + (inTomb(g) && live(g, 'xiaolongnv') ? '和小龙女' : '') + '向众人告别。' + (g.recall('gx_jumped') === 'jump' ? '他说那天在寒潭里，多亏你拉了他一把。' : g.recall('gx_jumped') === 'wait' ? '他说那天在崖上等的人，他知道是谁。' : '') + '你看着那背影，知道这一生再也不会见了。', fx: (g) => { g.stat('心境', -20); g.move('xiangyang'); } },
          { id: 'gx_search', y: 58, t: '寻人', text: '你十八岁了。家里给你说亲，你一个也不见。', choices: [
            { t: '离家，走遍天下去找他', canon: true, fx: (g) => { g.move('road'); g.stat('声望', 3); g.party([]); }, res: '你骑着一头青驴出了襄阳城。' },
            { t: '留在襄阳帮爹娘守城', dev: 25, fx: (g) => { g.set('gxStayXY'); g.stat('情义', 5); g.info('身份', '襄阳守城的郭二小姐'); }, res: '你把金针收进匣子，上了城头。少林寺、峨嵋山，这些地方你这辈子也许都不会去了。' },
            { t: '去终南山，在古墓外等', cond: (g) => inTomb(g) && live(g, 'yangguo') && !g.f('gxNoMeet'), dev: 10, fx: (g) => { g.move('zhongnan'); g.remember('gx_tomb'); }, res: '你在古墓外搭了个草棚，住了下来。' },
          ] },
          { id: 'gx_tomb', y: 59, auto: true, t: '古墓', cond: (g) => g.recall('gx_tomb'), text: '古墓的门一年里只开过一次。小龙女出来，给了你一罐玉蜂浆，说他在练剑，不见客。你在门口哭了一场，下了山。', fx: (g) => { g.move('road'); g.stat('心境', -6); g.stat('根骨', 4); } },
          { id: 'gx_jueyuan', y: 60, t: '九阳真经', loc: 'shaolin', cond: (g) => !g.f('gxStayXY'), text: '你在少林寺后山遇见了觉远和尚和他的徒弟张君宝。觉远快死了，嘴里念着一部经。', choices: [
            { t: '用心记下他念的经文', canon: true, fx: (g) => { g.stat('武学', 10); g.info('武功', '九阳功残篇'); }, res: '你记住了一部分。张君宝和无色禅师，各记住了另一部分。' },
            { t: '只顾着照顾哭成一团的张君宝', dev: 20, fx: (g) => { g.set('jiuyangLost'); g.stat('情义', 6); g.remember('gx_junbao_close'); }, res: '经念完了。你一句也没记住。峨嵋的九阳功，从此没有了来处。', chron: '觉远圆寂时，郭襄没有记下经文。峨嵋九阳功失传。' },
            { t: '借和尚的笔，一句一句写下来', dev: 15, check: ['悟性', 50], fx: (g) => { g.stat('武学', 12); g.info('武功', '九阳功（手抄）'); g.set('emeiJiuyangFull'); }, res: '你记了满满三页纸。后来这三页纸成了峨嵋的镇派之宝。', fail: { fx: (g) => { g.stat('武学', 6); g.info('武功', '九阳功残篇'); }, res: '他念得太快，你只写下了一页。', dev: 0 } },
          ] },
          { id: 'gx_nojiuyang', y: 60, auto: true, t: '少林', cond: (g) => g.f('gxStayXY'), text: '城里来的和尚说，少林寺藏经阁的觉远和尚圆寂了，临终念了一部经，只有他的小徒弟和一个老和尚听见。你那时在城头，什么也不知道。', fx: (g) => g.set('jiuyangLost') },
          { id: 'gx_junbao', y: 60, t: '张君宝', cond: (g) => live(g, 'zhangsanfeng') && !g.f('gxStayXY'), text: (g) => (g.recall('gx_junbao_close') ? '张君宝哭完了，跟在你后面。' : '') + '他被逐出了少林，无处可去。他才十六岁。', choices: [
            { t: '给他一只金镯子，让他去襄阳投奔你爹娘', canon: true, fx: (g) => { g.stat('情义', 3); g.remember('gx_bracelet'); }, res: '他没有去襄阳。他走到武当山，在山上住了下来。那只金镯子，他一直留着。' },
            { t: '带他一起走', dev: 20, fx: (g) => { g.set('junbaoWithXiang'); g.stat('情义', 6); g.party(['zhangsanfeng']); }, res: '他挑着担子跟在你的青驴后面，一走就是三年。' },
          ] },
          { id: 'gx_baihua', y: 63, auto: true, t: '百花谷', loc: 'baihua', cond: (g) => live(g, 'zhoubotong') && !g.f('gxStayXY'), text: '你在百花谷里住了一阵。老顽童教你左右互搏，你学不会，他说你心思太多。瑛姑在一旁摘花，一句话也不说。', fx: (g) => { g.stat('心境', 6); g.stat('武学', 3); } },
          { id: 'gx_junbao_part', y: 63, auto: true, t: '分别', cond: (g) => g.f('junbaoWithXiang'), text: '走到武当山下，君宝说想找个地方静一静。临别前他打了一套拳给你看，慢得像在写字。你笑他，他也笑。他上了山，没有回头。', fx: (g) => { g.party([]); g.stat('情义', 4); } },
          { id: 'gx_guard', y: 64, t: '西门', loc: 'xiangyang', cond: (g) => g.f('gxStayXY') && inXY(g), text: '爹让你带一队兵守西门。半夜，蒙古人在城墙下挖地道。', choices: [
            { t: '守在地道口，来一个打一个', fx: (g) => { g.stat('根骨', -8); g.stat('声望', 8); g.remember('gx_guard', 'hold'); }, dev: 10, res: '你在地道口守了三天三夜，手里的剑换了两把。西门的兵从此叫你“二将军”。' },
            { t: '放他们进来，在瓮城里关门打', dev: 15, check: ['悟性', 60], fx: (g) => { g.stat('声望', 15); g.remember('gx_guard', 'trap'); }, res: '三百个蒙古兵钻进了瓮城，一个也没出去。娘听说了，笑你像她。', fail: { fx: (g) => { g.stat('根骨', -15); g.remember('gx_guard', 'hurt'); }, res: '他们来的人比你想的多。你守住了门，自己挨了两刀。', dev: 0 } },
          ] },
          { id: 'gx_suitor', y: 66, t: '求亲', text: (g) => '你二十六岁了。' + (g.f('gxStayXY') ? '守城的一个年轻校尉' : '一个江湖上颇有名气的少年剑客') + '向你求亲，人品武功都好。', choices: [
            { t: '拒绝', canon: true, fx: (g) => { g.stat('心境', -3); g.remember('gx_refused'); }, res: '他走的时候问你，心里是不是有人。你没有回答。' },
            { t: '答应', dev: 30, fx: (g) => { g.set('guoxiangMarried'); g.stat('心境', 10); g.rel('丈夫', g.f('gxStayXY') ? '守城校尉' : '少年剑客'); }, res: '你嫁了人。可每次听见大雕的叫声，你还是会抬头。' },
            { t: '跟他比剑，输了就嫁', dev: 10, check: ['武学', 50], fx: (g) => { g.stat('声望', 5); g.rel('知己', g.f('gxStayXY') ? '守城校尉' : '少年剑客'); }, res: '你赢了。他笑着说，这辈子输给你，不冤。后来他成了你最好的朋友。', fail: { fx: (g) => { g.set('guoxiangMarried'); g.stat('心境', 8); g.rel('丈夫', g.f('gxStayXY') ? '守城校尉' : '少年剑客'); }, res: '你输了。你守了约，嫁给了他。', dev: 25 } },
          ] },
          { id: 'gx_sword', y: 70, auto: true, t: '倚天剑', cond: (g) => !g.f('yangKeepsSword') && (jing(g) || rong(g)), text: (g) => parents(g) + '把玄铁重剑熔了，铸成倚天剑和屠龙刀。' + (g.f('noBladeSecrets') ? '' : '剑里藏着《九阴真经》，刀里藏着《武穆遗书》。') + '倚天剑给了你，屠龙刀给了弟弟。',
            fx: (g) => g.info('兵器', '倚天剑') },
          { id: 'gx_books', y: 70, auto: true, t: '遗书', cond: (g) => g.f('yangKeepsSword') && (jing(g) || rong(g)), text: (g) => parents(g) + '手里没有玄铁。他们把《九阴真经》和《武穆遗书》交给你，嘱你好生收藏。', fx: (g) => g.info('秘籍', '九阴真经、武穆遗书') },
          { id: 'gx_fall', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => !g.f('guoSurvive') && inXY(g), text: (g) => '襄阳城破了。' + parents(g) + '要和城一起死，要你带着郭家的血脉走。' + (g.f('fuXiangClose') && g.alive('guofu') ? '姐姐攥着你的手，手心全是汗。' : ''), choices: [
            { t: '听他们的话，突围', canon: true, fx: (g) => { g.stat('心境', -30); g.move('road'); g.party([]); }, res: (g) => (g.f('gxLongxiang') ? '你用金轮法王教的口诀，一掌震开了城门口的人墙。' : '') + '你回头看了一眼。城头上，你爹还站着。' },
            { t: '用最后一枚金针，请他来', cond: (g) => g.f('guoxiangNeedle') && live(g, 'yangguo'), dev: 40, fx: (g) => { g.set('guoSurvive'); g.stat('心境', 10); g.move('road'); }, res: '三天后，一只大雕落在了襄阳城头。他来了，带着你们一家杀出了重围。', chron: '郭襄用最后一枚金针请来杨过，郭靖、黄蓉活着离开了襄阳。' },
            { t: '留下来，和他们一起死', dev: 25, fatal: true, fx: (g) => g.die('襄阳城破，与父母一同殉城'), res: '你握着倚天剑，站在了爹娘身边。' },
            { t: '带着百姓从水门出城', dev: 20, check: ['武学', 45], fx: (g) => { g.set('xyRefugees'); g.stat('心境', -25); g.move('road'); g.party([]); }, res: '你带着几百个百姓出了城。回头看时，城头上爹还站着。', chron: '襄阳城破时，郭襄带着百姓从水门逃了出来。',
              fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -25); g.move('road'); g.party([]); if (g.recall('gx_beggars') || g.recall('gx_guard')) g.set('xyRefugees'); }, res: (g) => (g.recall('gx_guard') ? '你受了伤，西门跟你守过城的兵抬着你开路，一千多个百姓跟着出了城。' : g.recall('gx_beggars') ? '你受了伤。当年那几个小乞丐如今是丐帮的汉子，他们知道哪条水沟通城外，背着你带百姓出了城。' : '你受了伤，被人背出了城。跟着你的百姓，散在了乱军里。'), dev: 10 } },
          ] },
          { id: 'gx_far', y: 71, auto: true, t: '城破', cond: (g) => g.f('guoLeftXiangyang') && !g.f('guoSurvive'), text: '消息传来：襄阳城破了。爹没有说话，只是把那面旧旗子从箱底翻了出来。', fx: (g) => g.stat('心境', -15) },
          { id: 'gx_drift', y: 74, auto: true, t: '漂泊', text: (g) => (g.f('xyRefugees') ? '跟你出城的百姓在江南落了脚，逢年过节就给你捎东西。' : '') + (g.f('fuJoinsXiang') ? '姐姐找到了你。你们一起走了几年，她嫌路远，你嫌她啰嗦。' : '你一个人走遍了大江南北。') + '每到一处，都有人在讲神雕侠的故事。你笑着听，从不插嘴。', fx: (g) => { g.stat('声望', 5); g.stat('悟性', 3); } },
          { id: 'gx_emei', y: 80, t: '峨嵋', loc: 'emei', text: (g) => '你四十岁了。' + (g.f('guoxiangMarried') ? '丈夫走了五年。' : '') + '峨嵋山上的云海很静，你在金顶上站了一整天。', choices: [
            { t: '剪了头发，在这里开宗立派', canon: true, fx: (g) => { g.info('门派', '峨嵋派'); g.info('身份', '峨嵋派开山祖师'); g.stat('心境', 15); g.stat('声望', 20); }, res: (g) => '你给这个门派取名“峨嵋”。' + (g.recall('gx_yang_pupil') ? '峨嵋剑法的头三招，是他当年教你的。' : '') + (g.f('gxLongxiang') ? '你还把龙象般若功的口诀改了改，传给了弟子。' : '') },
            { t: '下山，接着走', dev: 30, fx: (g) => { g.set('emeiLate'); g.move('road'); }, res: '你又上路了。峨嵋派要等你的弟子来开创了。' },
            { t: '结庐收徒，但不出家', dev: 15, fx: (g) => { g.set('emeiLaywoman'); g.info('门派', '峨嵋派'); g.info('身份', '峨嵋派开山祖师'); g.stat('心境', 10); g.stat('声望', 15); }, res: '你没有剪头发，却也收了徒弟。峨嵋派就这样立了起来，第一代掌门是个不出家的女侠。' },
          ] },
          { id: 'gx_disciple', y: 85, t: '弟子', cond: (g) => !g.f('emeiLate'), text: '一个叫风陵的小姑娘来峨嵋拜师。她说她是在风陵渡口出生的。', choices: [
            { t: '收下她', canon: true, fx: (g) => { g.rel('弟子', 'fengling'); g.stat('情义', 5); }, res: '你听到“风陵渡”三个字，愣了很久。' },
            { t: '让她先去江湖上走三年再来', dev: 10, fx: (g) => { g.rel('弟子', 'fengling'); g.remember('gx_fengling_roam'); }, res: '三年后她回来了，晒得黝黑，说话像个江湖人。你收下了她。' },
          ] },
          { id: 'gx_forge', y: 88, t: '玄铁', loc: 'emei', cond: (g) => g.f('yangKeepsSword') && !g.f('swordInTomb') && !g.f('emeiLate'), text: '一只大雕飞上金顶，爪子里抓着一把黑沉沉的重剑。你认得这把剑。', choices: [
            { t: '熔了它，铸成一刀一剑，把九阴真经和武穆遗书藏进去', canon: true, fx: (g) => { g.info('兵器', '倚天剑'); g.stat('心境', -5); }, res: '倚天剑留在峨嵋，屠龙刀不久便失落江湖。“武林至尊，宝刀屠龙。”江湖上开始传这句话。', chron: '郭襄在峨嵋用杨过的玄铁重剑铸成了倚天剑、屠龙刀。' },
            { t: '熔了它，铸成一刀一剑，什么也不藏', dev: 15, fx: (g) => { g.set('noBladeSecrets'); g.info('兵器', '倚天剑'); }, res: '你把经书留在了峨嵋的藏经楼里。刀剑只是刀剑。' },
            { t: '不熔，把重剑供在金顶', dev: 15, fx: (g) => { g.stat('心境', 5); g.info('兵器', '玄铁重剑'); }, res: '你把剑供在了金顶。你走后，徒孙们还是把它熔了，铸成了倚天剑和屠龙刀。' },
          ] },
          { id: 'gx_rule', y: 95, t: '门规', cond: (g) => !g.f('emeiLate'), text: (g) => '峨嵋的弟子越来越多。风陵问你，要给峨嵋立什么规矩。' + (g.recall('gx_fengling_roam') ? '她在江湖上走过三年，知道外面的人怎么看峨嵋。' : '') + (g.f('emeiJiuyangFull') ? '藏经楼里那三页九阳功，她说要定个规矩，只传掌门。' : ''), choices: [
            { t: '行侠仗义，不问出身', canon: true, fx: (g) => { g.stat('正邪', 5); g.info('门规', '行侠仗义，不问出身'); }, res: '峨嵋的弟子下山时，都背得出这八个字。' },
            { t: '见了蒙古人，格杀勿论', dev: 15, fx: (g) => { g.set('emeiHateMongol'); g.stat('正邪', -8); g.info('门规', '见了蒙古人，格杀勿论'); }, res: '峨嵋派从此跟蒙古人结下了死仇。' },
            { t: '峨嵋弟子不许嫁人', dev: 15, fx: (g) => { g.set('emeiNoMarry'); g.stat('情义', -4); g.info('门规', '弟子不许嫁人'); }, res: '风陵看了你一眼，没有问为什么。' },
          ] },
          { id: 'gx_xiexun_news', y: 102, auto: true, t: '金毛狮王', cond: (g) => g.f('xiexunWarned') || g.recall('gx_xiexun'), text: (g) => '消息传到峨嵋：成昆杀了谢逊满门。' + (g.f('xiexunWarned') ? '有人说，谢逊出事前几个月起了疑心，把妻儿送去了乡下，还是被成昆找到了。他逢人就说，峨嵋的郭女侠提醒过他，是他自己不信。' : '你想起那个来讨水喝的金发青年，在金顶上站了很久。'), fx: (g) => g.stat('心境', -5) },
          { id: 'gx_pass', y: 110, auto: true, t: '传位', cond: (g) => !g.f('emeiLate') && live(g, 'fengling'), text: '你把掌门之位传给了风陵。从此你只在金顶上看云。', fx: (g) => { g.info('身份', '峨嵋派祖师'); g.stat('心境', 8); } },
          { id: 'gx_last', y: 114, auto: true, t: '后悔', text: (g) => '一个小弟子问你，这一生有没有后悔过。' + (g.f('gxNoMeet') ? '你说，后悔那年在风陵渡没有跟着去。' : g.f('guoxiangMarried') ? '你说，不后悔嫁过人，也不后悔心里一直有个人。' : g.recall('gx_refused') ? '你笑而不答。小弟子以为你没听见。' : '你给她讲风陵渡口那一夜的雪。') + (g.recall('gx_wudang') ? '你还说起那年上武当山，喝的那壶茶。' : ''), fx: (g) => g.stat('心境', 5) },
        ],
      },
    },

    /* ===================== 李莫愁 ===================== */
    {
      id: 'limochou', name: '李莫愁', py: 'LI<<MOCHOU', book: BOOK, sex: '女', born: 10,
      origin: '古墓派弃徒，人称赤练仙子',
      birthplace: '终南山下', home: 'gumu', bg: 2,
      info: { 门派: '古墓派', 身份: '弃婴' },
      look: { hair: 'bun', hairColor: '#1a1414', robe: '#8b8f88', accent: '#b23a3a' },
      family: [{ rel: '师父', name: '古墓派上代掌门' }],
      fateText: '为陆展元所负，因爱成恨，血洗陆家庄，人称赤练仙子。最后身中情花之毒，在绝情谷唱着“问世间情为何物”走进火海。',
      st: [65, 75, 55, 70, 8, 0, 20],
      death: (g) => (g.f('limochouLives') || g.f('mochouNoLu') ? { y: 68, cause: '在一座小道观里病逝', mod: true } : { y: 41, cause: '在绝情谷唱着“问世间情为何物”走进情花火海' }),
      ms: [
        [10, '被古墓派收养'],
        [28, '下山，爱上陆展元', (g) => !g.f('mochouNoLu')],
        [29, '留在古墓里等陆展元来接', (g) => g.f('lmWaited')],
        [30, '陆展元另娶，她立誓杀他全家', (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared')],
        [30, '陆展元另娶，她祝他们白头，转身走了', (g) => !g.f('mochouNoLu') && g.f('lujiaSpared')],
        [31, '人称赤练仙子', (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared')],
        [33, '血洗嘉兴陆家庄', (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared')],
        [35, '做了古墓派掌门', (g) => g.f('mochouHeadGumu')],
        [37, '闯古墓抢《玉女心经》', (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared')],
        [40, '抢走襄阳郭家的女婴', (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared') && !g.f('xiangNotStolen')],
        [42, '在一座道观里住下', (g) => g.f('limochouLives') && !g.f('lmWithCheng')],
        [47, '和程英、陆无双在江边做了邻居', (g) => g.f('lmWithCheng')],
      ],
      arc: {
        focus: '读书识字',
        intro: '纪年 10 年，你被人丢在终南山下。古墓派的掌门把你抱进了墓里，给你取名莫愁。',
        lastWords: '问世间，情是何物，直教生死相许。',
        nodes: [
          { id: 'lm_birth', age: 0, auto: true, t: '古墓', loc: 'gumu', text: '墓里很冷。师父抱着你，孙婆婆给你熬米汤。', fx: (g) => { g.rel('乳母', 'sunpopo'); g.party(['sunpopo']); } },
          { id: 'lm_laugh', age: 4, auto: true, t: '笑', text: '你爱笑。师父说古墓派的人不能这样笑，你还是笑。', fx: (g) => g.stat('心境', 3) },
          { id: 'lm_nocry', age: 5, t: '不动情', text: '师父教你，古墓派的人不能哭、不能笑、不能动情。', choices: [
            { t: '学不会', canon: true, fx: (g) => { g.stat('情义', 4); g.remember('lm_heart', 'hot'); }, res: '师父叹了口气，说你性子太烈，将来要吃苦。' },
            { t: '学着把心收起来', dev: 15, fx: (g) => { g.stat('心境', 4); g.stat('情义', -3); g.remember('lm_heart', 'cold'); }, res: '你很久没有笑。师父说你进步了。你的心像墓里的寒玉床，凉凉的，静静的。' },
            { t: '问师父：为什么不能动情', dev: 5, check: ['悟性', 50], fx: (g) => { g.stat('悟性', 3); g.remember('lm_heart', 'asked'); }, res: '师父沉默了很久，讲了祖师婆婆林朝英和王重阳的事。你听完，更不懂了，可那个故事你记了一辈子。', fail: { fx: (g) => g.remember('lm_heart', 'hot'), res: '师父说：“长大了你就知道了。”', dev: 0 } },
          ] },
          { id: 'lm_peek', age: 8, t: '心经', text: '你看见师父把一卷《玉女心经》藏进石壁。', choices: [
            { t: '趁夜偷看', canon: true, fx: (g) => { g.stat('武学', 3); g.remember('lm_peek', 'peek'); }, res: '你只看了两行，就被师父抓住了。罚你面壁七天。那两行字，你记得清清楚楚。' },
            { t: '等师父教', dev: 10, fx: (g) => { g.stat('悟性', 2); g.remember('lm_peek', 'wait'); }, res: '你等了一年又一年。师父看你的眼神，比从前软了一些。' },
          ] },
          { id: 'lm_baby', y: 16, auto: true, t: '师妹', text: '师父抱回一个女婴，取名龙儿。你偷偷捏她的脸，她不哭。', fx: (g) => g.rel('师妹', 'xiaolongnv') },
          { id: 'lm_favor', y: 22, t: '偏心', text: (g) => '师父把玉女心经先教给了才六岁的师妹。你在门外站了很久。' + (g.recall('lm_heart') === 'hot' ? '你想起师父说过，你性子太烈。' : ''), choices: [
            { t: '心里不服', canon: true, fx: (g) => { g.stat('正邪', -3); g.stat('武学', 2); g.remember('lm_grudge'); }, res: '你开始偷偷练别的功夫。' },
            { t: '好好照顾师妹', dev: 15, fx: (g) => { g.stat('情义', 5); g.set('mochouSisterBond'); }, res: '你给龙儿梳头、熬粥、讲墓外的故事。龙儿第一次对你笑了。这一笑，她记了很多年。' },
            { t: '去问师父，为什么不先教你', cond: (g) => g.recall('lm_peek') === 'wait', dev: 10, check: ['情义', 50], fx: (g) => { g.stat('悟性', 2); g.remember('lm_master_word'); }, res: '师父说：“你心太热，学了会害了你。等你的心凉下来，我再教你。”这句话你记了很多年。', fail: { fx: (g) => { g.stat('心境', -3); g.remember('lm_grudge'); }, res: '师父没有回答，把门关上了。', dev: 0 } },
          ] },
          { id: 'lm_lu', y: 28, t: '陆展元', loc: 'road', text: '你下山采药，在山道上救了一个受伤的书生。他叫陆展元，说话很温柔。', choices: [
            { t: '爱上他', canon: true, fx: (g) => { g.rel('意中人', '陆展元'); g.stat('心境', 15); g.stat('情义', 5); }, res: '他说，等伤好了就来娶你。' },
            { t: '替他包好伤口就走', cond: (g) => g.recall('lm_heart') !== 'cold', dev: 40, check: ['心境', 55], fx: (g) => { g.set('mochouNoLu'); g.set('limochouLives'); g.stat('心境', 3); }, res: '你回了古墓。很多年后你才知道，那个书生后来娶了别人。你没有放在心上。', chron: '李莫愁下山时只是救了一个书生，转身就走了。世上没有了赤练仙子。', fail: { fx: (g) => { g.rel('意中人', '陆展元'); g.stat('心境', 12); }, res: '你走到山口，又折了回去。他说，等伤好了就来娶你。', dev: 0 } },
            { t: '心里静静的，只替他包好伤', cond: (g) => g.recall('lm_heart') === 'cold', dev: 40, fx: (g) => { g.set('mochouNoLu'); g.set('limochouLives'); g.stat('心境', 4); }, res: '他看你的眼神很热。你的心还是凉的。你送他到山口，就回去了。', chron: '李莫愁下山时只是救了一个书生，转身就走了。世上没有了赤练仙子。' },
            { t: '把他带回古墓养伤', dev: 15, fx: (g) => { g.rel('意中人', '陆展元'); g.stat('心境', 12); g.remember('lm_lu_tomb'); }, res: '你偷偷把他藏在外间的石室里，给他喂玉蜂浆。他说，等伤好了就来娶你。' },
          ] },
          { id: 'lm_leave', y: 29, t: '叛出', cond: (g) => !g.f('mochouNoLu'), text: (g) => (g.recall('lm_lu_tomb') ? '师父发现了石室里的书生，把他赶下了山，又把你叫到跟前。' : '') + '师父说，你要下山嫁人，就不许再回古墓。', choices: [
            { t: '走', canon: true, fx: (g) => { g.info('门派', '古墓派（叛出）'); g.move('road'); g.party([]); }, res: '你没有回头。' },
            { t: '留下，等他来接你', dev: 20, fx: (g) => { g.stat('心境', -5); g.set('lmWaited'); }, res: '你留在墓里，每天在墓门口站一会儿。他的信越来越少。' },
            { t: '求师父准你嫁了人还能回来', cond: (g) => !g.recall('lm_lu_tomb'), dev: 10, check: ['情义', 55], fx: (g) => { g.info('门派', '古墓派（下山）'); g.move('road'); g.party([]); g.remember('lm_door'); }, res: '师父说：“你走吧。想回来的时候，墓门不锁。”你没有回头，眼泪却掉了下来。', fail: { fx: (g) => { g.info('门派', '古墓派（叛出）'); g.move('road'); g.party([]); }, res: '师父背过身去。你走了。', dev: 0 } },
          ] },
          { id: 'lm_wedding', y: 30, t: '婚礼', loc: 'road', cond: (g) => !g.f('mochouNoLu'), text: (g) => (g.f('lmWaited') ? '消息传进古墓：陆展元娶了大理的何沅君。你冲下山，闯进了喜堂。' : '陆展元娶了大理的何沅君。你闯进了喜堂。') + (live(g, 'yideng') ? '一灯大师出面拦住了你。' : ''), choices: [
            { t: '发誓十年后杀他全家', canon: true, fx: (g) => { g.stat('正邪', -25); g.stat('心境', -20); g.info('身份', '赤练仙子'); g.info('门派', '古墓派（叛出）'); }, res: '你在陆家墙上印了九个血手印，一个手印，是一条命。' },
            { t: '扔下一句“祝你们白头”，转身走', dev: 40, fx: (g) => { g.set('limochouLives'); g.set('lujiaSpared'); g.stat('心境', -10); g.stat('正邪', 5); if (g.f('lmWaited')) g.move('gumu'); }, res: (g) => (g.f('lmWaited') ? '你回了古墓，把那身红衣裳压进了箱底。' : '你哭了一路。后来你没有再找过他。'), chron: '李莫愁放过了陆展元。嘉兴陆家庄没有被血洗。' },
          ] },
          { id: 'lm_poison', y: 31, auto: true, t: '赤练仙子', cond: (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared'), text: '你练成了五毒神掌和冰魄银针。江湖上开始叫你“赤练仙子”。死在你手里的人越来越多。', fx: (g) => { g.stat('武学', 15); g.stat('正邪', -15); g.stat('声望', 8); } },
          { id: 'lm_master', y: 32, t: '师父', loc: 'gumu', cond: (g) => !g.f('mochouNoLu'), text: (g) => (g.f('lmWaited') && g.f('lujiaSpared') ? '师父病重。你一直在墓里，守在她床前。' : '你听说师父病重。' + (g.recall('lm_door') ? '墓门果然没锁。' : '你回到古墓，') + '你想拿回本该属于你的《玉女心经》。') + (g.recall('lm_master_word') ? '你想起她说过，等你的心凉下来，她再教你。' : g.recall('lm_heart') === 'asked' ? '你想起她讲过的祖师婆婆。' : g.recall('lm_grudge') ? '你心里那口气，憋了十年。' : ''), choices: [
            { t: '向师父讨要《玉女心经》', canon: true, fx: (g) => { g.stat('正邪', -5); g.stat('心境', -5); g.remember('lm_rob'); }, res: '你没有拿到。师父看着你，眼里只有失望。不久她就去世了。' },
            { t: '跪在师父床前认错', dev: 20, fx: (g) => { g.set('lmReconciled'); g.stat('情义', 8); g.stat('心境', 5); }, res: '师父摸了摸你的头，说：“傻孩子。莫愁，莫愁。”她走的时候，你在身边。这两个字，后来拉住过你好几回。' },
          ] },
          { id: 'lm_lujia', y: 33, t: '陆家庄', loc: 'jiaxing', cond: (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared'), text: '十年到了。陆展元已经病死，你还是去了嘉兴陆家庄。', choices: [
            { t: '杀上门去', canon: true, fx: (g) => { g.stat('正邪', -20); g.stat('心境', -10); g.remember('lm_blood'); }, res: '陆家的人死了。你在陆展元的坟前站了一夜。' },
            { t: '只砸了他的坟', dev: 30, fx: (g) => { g.set('lujiaSpared'); g.stat('正邪', 10); }, res: '你砸烂了墓碑，又自己把它扶了起来。陆家的人躲在门后，一个也没死。', chron: '李莫愁到了陆家庄，只砸了陆展元的坟。' },
            { t: '在陆家门口站一夜，天亮就走', cond: (g) => g.f('lmReconciled'), dev: 30, fx: (g) => { g.set('lujiaSpared'); g.stat('心境', 5); g.stat('正邪', 10); }, res: '你一直在念师父那两个字。天亮时，陆家开门的老仆看见你，吓得跪了下来。你走了。', chron: '李莫愁在陆家庄门口站了一夜，走了。' },
          ] },
          { id: 'lm_wushuang', y: 33, t: '陆无双', cond: (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared') && live(g, 'luwushuang'), text: '陆家的小女儿躲在柴堆后面，瘸着一条腿，瞪着你。', choices: [
            { t: '带走她，当丫头使唤', canon: true, fx: (g) => { g.stat('正邪', -3); g.rel('丫头', 'luwushuang'); }, res: '她跟了你好几年，一直想着逃。' },
            { t: '放了她', dev: 15, fx: (g) => { g.set('wushuangFree'); g.stat('正邪', 5); }, res: '她一瘸一拐地跑了，跑了很远才敢回头。她记住了你的脸，也记住了你没有动手。' },
            { t: '收她做徒弟', dev: 15, fx: (g) => { g.set('wushuangPupil'); g.rel('徒弟', 'luwushuang'); g.stat('情义', 3); }, res: '你教她功夫，她学得很恨。可你病的时候，是她给你端的药。' },
          ] },
          { id: 'lm_hong', y: 35, auto: true, t: '徒弟', cond: (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared'), text: '你收了一个徒弟，叫洪凌波。你教她武功，也教她别信男人。', fx: (g) => g.rel('徒弟', '洪凌波') },
          { id: 'lm_choice', y: 32, t: '掌门', cond: (g) => g.f('mochouNoLu'), text: '师父去世了。古墓派的掌门之位，按说该是你的，可师父临终前叫的是师妹的名字。', choices: [
            { t: '让给师妹', canon: true, fx: (g) => { g.stat('情义', 5); g.remember('lm_head', 'sister'); }, res: '龙儿接了掌门，你教她做饭。' },
            { t: '争', dev: 15, fx: (g) => { g.set('mochouHeadGumu'); g.stat('正邪', -5); g.info('身份', '古墓派掌门'); }, res: '龙儿把掌门指环给了你，什么也没说。你拿着它，一点也不高兴。后来古墓里的规矩，都是你定的。' },
            { t: '让给师妹，自己下山', dev: 10, fx: (g) => { g.move('hut'); g.stat('心境', 4); g.remember('lm_head', 'down'); }, res: '你在山下住了下来，每个月给古墓送一次米。' },
          ] },
          { id: 'lm_tomb', y: 37, t: '闯墓', loc: 'gumu', cond: (g) => !g.f('mochouNoLu') && live(g, 'xiaolongnv') && !g.f('limochouLives'), text: (g) => '你带着徒弟闯进古墓，要抢《玉女心经》。' + (g.recall('lm_peek') === 'peek' ? '小时候偷看的那两行字，你到现在都没忘。' : '') + (g.recall('lm_rob') ? '师父临死都没给你，你今天要自己拿。' : '') + '师妹身边多了一个少年。', choices: [
            { t: '硬闯', canon: true, fx: (g) => { g.stat('武学', 3); g.stat('根骨', -5); g.remember('lm_tomb_storm'); }, res: '师妹放下了断龙石，把自己封死在墓里。你在外面等了三天，没有等到人出来。' },
            { t: '叫师妹出来，把话说开', cond: (g) => !(g.f('lmReconciled') || g.f('mochouSisterBond')), check: ['情义', 45], dev: 25, fx: (g) => { g.set('limochouLives'); g.stat('情义', 8); g.stat('心境', 10); g.move('road'); }, res: '师妹把师父临终的话告诉了你。你哭了，这是你很多年来第一次哭。你没有拿心经，走了。', chron: '李莫愁在古墓前与小龙女说开了旧事，从此不再作恶。',
              fail: { fx: (g) => { g.stat('心境', -5); g.remember('lm_tomb_storm'); }, res: '她不出来。断龙石落下了。', dev: 0 } },
            { t: '叫师妹出来，把话说开', cond: (g) => g.f('lmReconciled') || g.f('mochouSisterBond'), dev: 25, fx: (g) => { g.set('limochouLives'); g.stat('情义', 8); g.stat('心境', 10); g.move('road'); }, res: (g) => (g.f('mochouSisterBond') ? '龙儿听见你的声音，自己开了墓门。她说：“师姐，你从前给我梳过头。”' : '你把师父临终那两个字说给她听。龙儿开了墓门。') + '你们坐了一夜。你没有拿心经，走了。', chron: '李莫愁在古墓前与小龙女说开了旧事，从此不再作恶。' },
          ] },
          { id: 'lm_huang', y: 39, t: '东邪', cond: (g) => !g.f('mochouNoLu') && live(g, 'huangyaoshi') && !g.f('limochouLives'), text: '你追杀程英时，一个青衫老人挡在了前面。他是程英的师父，东邪黄药师。', choices: [
            { t: '逃', canon: true, fx: (g) => { g.stat('心境', -3); g.remember('lm_huang', 'fled'); }, res: '你跑得很快。他没有追。' },
            { t: '跟他斗', check: ['武学', 85], dev: 10, fx: (g) => { g.stat('声望', 15); g.info('声名', '接过东邪二十招'); }, res: '你接了他二十招。他说：“不错，可惜了。”',
              fail: { fx: (g) => g.stat('根骨', -20), res: '他一指弹在你肩上。你逃了出去，吐了三天血。', dev: 0 } },
            { t: '收手，向他行一个晚辈礼', dev: 15, fx: (g) => { g.stat('正邪', 3); g.remember('lm_huang', 'bow'); }, res: '他点了点头，扔给你一个小瓷瓶：“古墓派的人，还有点礼数。九花玉露丸，留着保命。”你走了。' },
          ] },
          { id: 'lm_steal', y: 40, t: '女婴', loc: 'xiangyang', cond: (g) => !g.f('mochouNoLu') && g.exists('guoxiang') && !g.f('limochouLives'), text: (g) => (g.recall('lm_tomb_storm') ? '古墓的断龙石落下后，你心里空了一块。' : '') + '襄阳郭家刚生下一个女婴。你听说那孩子身上有什么宝贝，摸进了郭府。', choices: [
            { t: '抱走', canon: true, fx: (g) => { g.stat('正邪', -5); g.remember('lm_stole'); }, res: '孩子在你怀里不哭了，看着你笑。' },
            { t: '看了一眼，放回摇篮', dev: 20, fx: (g) => { g.set('xiangNotStolen'); g.stat('正邪', 8); }, res: '孩子身上什么也没有，只有一块刻着“襄”字的金锁。你替她掖了掖被角，走了。', chron: '郭襄出生那夜，李莫愁摸进郭府，又空手走了。' },
          ] },
          { id: 'lm_raise', y: 40, t: '孩子', cond: (g) => g.recall('lm_stole'), text: '你抱着那孩子走了几天。她饿了就哭，你学着给她喂米汤。', choices: [
            { t: '想把她养大', canon: true, fx: (g) => { g.stat('情义', 6); g.remember('lm_raise'); }, res: (g) => (hero(g) && live(g, 'yangguo') ? (g.knows('yangguo') ? '杨过把孩子抢了回去。' : '一个少年把孩子抢了回去，后来你才知道他叫杨过。') : '丐帮的人把孩子抢回了郭家。') + '你追了三天，第一次觉得手里空了。' },
            { t: '把她送回郭家', dev: 20, fx: (g) => { g.set('mochouReturnedXiang'); g.stat('正邪', 10); }, res: '你把孩子放在郭府门口，敲了三下门，走了。黄蓉后来在江湖上放出话，郭家欠你一个人情。', chron: '李莫愁亲手把郭襄送回了郭家。' },
          ] },
          { id: 'lm_fire', y: 41, t: '情花', loc: 'jueqing', cond: (g) => !g.f('mochouNoLu') && !g.f('limochouLives'), text: (g) => '你在绝情谷中了情花之毒，浑身剧痛。四周烧起了大火。' + (g.recall('lm_raise') ? '你想起那个在你怀里笑的孩子。' : g.f('mochouReturnedXiang') ? '你想起郭府门口那三下敲门声。' : '') + (g.f('mochouAsked') ? '火光里，你想起很多年前有个人问你，为什么唱得这么伤心。' : ''), choices: [
            { t: '唱着歌，走进火里', canon: true, fatal: true, fx: (g) => g.die('在绝情谷唱着“问世间情为何物”走进情花火海'), res: '“问世间，情是何物，直教生死相许。”' },
            { t: '求程英、陆无双救你', check: ['情义', 45], dev: 40, fx: (g) => { g.set('limochouLives'); g.stat('根骨', -20); g.stat('正邪', 15); }, res: '程英把你拖出了火海。陆无双站在一旁，没有动手。你看着她们，说了一声“对不起”。', chron: '李莫愁没有葬身情花火海。',
              fail: { fx: (g) => { if (g.f('wushuangFree') || g.f('wushuangPupil')) { g.set('limochouLives'); g.stat('根骨', -25); } else g.die('在绝情谷葬身情花火海'); }, res: (g) => (g.f('wushuangPupil') ? '程英没有来。无双扑进火里，把你背了出来，一边哭一边骂你。' : g.f('wushuangFree') ? '程英没有来。无双犹豫了一下，还是冲进火里拉住了你的手：“那年你没有杀我。”' : '没有人来。'), dev: 20 } },
            { t: '冲出火海', dev: 30, check: ['武学', 60], fx: (g) => { g.set('limochouLives'); g.stat('根骨', -25); g.stat('正邪', 5); }, res: '你浑身是火地冲了出来，在溪水里滚了半天。你活了，脸上留了一道疤。', chron: '李莫愁从情花火海里冲了出来。', fail: { fx: (g) => g.die('在绝情谷葬身情花火海'), res: '火太大了。', dev: 10 } },
            { t: '吞下黄药师给的九花玉露丸', cond: (g) => g.recall('lm_huang') === 'bow', dev: 35, fx: (g) => { g.set('limochouLives'); g.stat('根骨', -10); g.stat('心境', 5); }, res: '药丸清凉，压住了情花的毒。你踉踉跄跄走出了火圈，回头看，绝情谷烧红了半边天。', chron: '李莫愁吞下黄药师给的九花玉露丸，走出了情花火海。' },
          ] },
          { id: 'lm_burn', y: 43, t: '锦帕', cond: (g) => g.f('limochouLives'), text: '你一直带着一块锦帕，上面绣着一朵红花。那是很多年前，那个书生送你的。', choices: [
            { t: '留着', canon: true, fx: (g) => { g.stat('情义', 2); g.remember('lm_pa', 'keep'); }, res: '你把它压在了箱底。' },
            { t: '烧了', dev: 10, fx: (g) => { g.stat('心境', 8); g.remember('lm_pa', 'burn'); }, res: '火光很小，一会儿就灭了。你夜里不再做那个桥上的梦。' },
            { t: '去嘉兴，埋在陆展元坟前', dev: 10, fx: (g) => { g.stat('心境', 6); g.move('jiaxing'); g.remember('lm_pa', 'bury'); }, res: '你埋完锦帕，在坟前坐了一会儿。坟上的草已经很长了。' },
          ] },
          { id: 'lm_marry', y: 45, t: '樵夫', cond: (g) => g.f('mochouNoLu'), text: (g) => '终南山下有个樵夫，每天给古墓送柴，从不多话。' + (g.f('mochouHeadGumu') ? '你是掌门，按规矩不能嫁人。' : g.recall('lm_head') === 'down' ? '他的草屋就在你家隔壁。' : ''), choices: [
            { t: '嫁给他', dev: 15, fx: (g) => { g.rel('丈夫', '终南山樵夫'); g.stat('心境', 12); g.move('hut'); }, res: '你们在山脚盖了三间草屋。' },
            { t: '一生不嫁', canon: true, fx: (g) => { g.stat('武学', 3); g.remember('lm_single'); }, res: '你在墓里练功，日子很长。他还是每天来送柴。' },
          ] },
          { id: 'lm_temple', y: 47, t: '道观', cond: (g) => g.f('limochouLives') || g.f('mochouNoLu'), text: '你走到一座破道观前。观里只有一个老道姑，问你要不要留下。', choices: [
            { t: '留下', canon: true, fx: (g) => { g.move('hut'); g.info('身份', '道姑'); g.stat('心境', 8); }, res: '你每天扫地、念经、种菜。夜里还会做噩梦，但越来越少了。' },
            { t: '回古墓', dev: 10, fx: (g) => { g.move('gumu'); g.remember('lm_gumu'); }, res: '古墓里没有人。寒玉床还在，凉得和小时候一样。你住了下来。' },
            { t: '去江边找程英、陆无双', cond: (g) => live(g, 'chengying'), dev: 15, fx: (g) => { g.set('lmWithCheng'); g.move('jiangnan'); g.stat('情义', 5); }, res: '程英给你沏了一杯茶，陆无双在旁边不说话。你在她们隔壁搭了间草庐，一住就是很多年。' },
          ] },
          { id: 'lm_orphan', y: 52, t: '孤女', cond: (g) => g.f('limochouLives') || g.f('mochouNoLu'), text: '门口有人放了一个女婴，篮子里没有留字。', choices: [
            { t: '收养她，不许她学武', canon: true, fx: (g) => { g.rel('养女', '门口的女婴'); g.stat('情义', 8); }, res: '你教她认字、种菜。她长大后嫁了个货郎，日子平平安安。' },
            { t: '收养她，把古墓的武功都教给她', dev: 15, fx: (g) => { g.set('lmHeir'); g.rel('养女', '门口的女婴'); g.stat('武学', 2); }, res: '她学得很快。你教她的第一句话是：别为男人哭。古墓的功夫，又多了一个传人。' },
            { t: '送到山下人家', dev: 5, fx: (g) => { g.stat('心境', -2); g.remember('lm_orphan_away'); }, res: '你常常下山去看她，从不进门。' },
          ] },
          { id: 'lm_sister', y: 58, t: '师妹', cond: (g) => (g.f('limochouLives') || g.f('mochouNoLu')) && live(g, 'xiaolongnv'), text: (g) => (g.recall('lm_gumu') ? '你在古墓里住了十年。这天墓门外有了脚步声：' : '你听说') + '师妹回了古墓，身边是那个少年，如今已是神雕大侠。', choices: [
            { t: '远远看一眼', canon: true, fx: (g) => { g.stat('心境', 3); g.remember('lm_sis_far'); }, res: (g) => (g.recall('lm_gumu') ? '你从暗道走了，把古墓让给了他们。' : '你在终南山下站了一会儿。墓门外种着一片花。') },
            { t: '上门相认', dev: 15, fx: (g) => { g.set('mochouSistersMet'); g.stat('情义', 8); g.stat('心境', 8); }, res: '龙儿给你倒了一杯玉蜂浆。她说：“师姐，你老了。”你说：“你也是。”从那以后，你每年都上山住几天。' },
          ] },
          { id: 'lm_revenge', y: 62, t: '寻仇', cond: (g) => g.f('limochouLives') && !g.f('lujiaSpared'), text: '一个年轻人找上门来，说他是当年被你杀了的人的儿子。', choices: [
            { t: '不还手', canon: true, fx: (g) => { g.stat('根骨', -20); g.stat('正邪', 10); g.remember('lm_rev', 'take'); }, res: '他砍了你一刀，看你不还手，扔下刀哭着走了。' },
            { t: '请他进来，把当年的事讲给他听', dev: 10, check: ['情义', 55], fx: (g) => { g.stat('正邪', 8); g.remember('lm_rev', 'talk'); }, res: '你讲了一夜。天亮时，他说他还是恨你，但他不杀你了。', fail: { fx: (g) => { g.stat('根骨', -15); g.remember('lm_rev', 'take'); }, res: '他不听，一刀砍了过来。', dev: 0 } },
            { t: '连夜搬走', dev: 5, fx: (g) => { g.move('road'); g.stat('心境', -5); g.remember('lm_rev', 'run'); }, res: '你又搬了一次家。你知道这样的人还会来。' },
          ] },
          { id: 'lm_old', y: 64, auto: true, t: '暮年', cond: (g) => g.f('limochouLives') || g.f('mochouNoLu'), text: (g) => '你老了。' + (g.recall('lm_blood') ? (g.recall('lm_rev') === 'talk' ? '陆家那个年轻人每年清明都来，不说话，坐一会儿就走。' : '陆家庄那一夜，你到老都没能忘掉。') : '')
              + (g.recall('lm_pa') === 'burn' ? '' : g.recall('lm_pa') === 'bury' ? '你偶尔还去嘉兴，看看那座坟。' : g.recall('lm_pa') === 'keep' ? '那块锦帕还在箱底。' : '')
              + (g.f('lmWithCheng') ? '程英吹箫，无双骂人，你在一旁剥豆子。' : '')
              + (g.f('lmHeir') ? '养女的功夫已经比你好了。' : g.recall('lm_orphan_away') ? '山下那户人家的女儿出嫁了，你在人群里看了一眼。' : '')
              + (g.f('mochouSistersMet') ? '龙儿托人送来一罐玉蜂蜜。' : g.recall('lm_sis_far') ? '你常常望着终南山的方向。' : '')
              + (g.f('mochouHeadGumu') ? '古墓的规矩还是你定的那些。' : g.recall('lm_single') ? '樵夫老了，柴还是每天送来。' : '')
              + '有时候你会哼起一支小时候在古墓里学的曲子，哼着哼着就忘了词。', fx: (g) => g.stat('心境', 4) },
        ],
      },
    },

    /* ===================== 本书配角 ===================== */
    { id: 'sunpopo', name: '孙婆婆', book: BOOK, sex: '女', born: -40, origin: '古墓派的老仆', minor: true,
      death: (g) => (g.f('yangNoTomb') ? { y: 45, cause: '在古墓中病逝', mod: true } : { y: 34, cause: '被全真教郝大通误伤而死' }),
      ms: [[-20, '在古墓里服侍林朝英的丫鬟'], [10, '在古墓里照看李莫愁'], [16, '把小龙女抱进古墓']] },
    { id: 'jinlun', name: '金轮法王', book: BOOK, sex: '男', born: -5, origin: '蒙古国师，龙象般若功',
      death: (g) => (g.f('jinlunDoubt') ? { y: 70, cause: '回到西藏，在寺中圆寂', mod: true } : { y: 57, cause: inTomb(g) ? '在襄阳城外高台上死于杨过剑下' : '在襄阳城外为护郭襄而死' }),
      ms: [[35, '被蒙古封为国师'], [39, '大胜关上争武林盟主不成'], [45, '练成龙象般若功第九层'], [57, '想收郭襄做徒弟'], [57, '放了郭襄，回西藏去了', (g) => g.f('jinlunDoubt')]] },
    { id: 'gongsunzhi', name: '公孙止', book: BOOK, sex: '男', born: -12, origin: '绝情谷谷主', minor: true,
      death: { y: 41, cause: '与裘千尺一同坠入绝情谷深渊' },
      ms: [[10, '绝情谷谷主'], [40, '想娶小龙女']] },
    { id: 'gongsunlve', name: '公孙绿萼', book: BOOK, sex: '女', born: 22, origin: '公孙止之女',
      death: (g) => (inTomb(g) && !g.f('jqSlipped') ? { y: 41, cause: '扑在父亲剑上，替杨过挡了一剑' } : { y: 80, cause: '在绝情谷终老', mod: true }),
      ms: [[22, '生于绝情谷'], [40, '偷偷喜欢上了闯谷的杨过', inTomb]] },
    { id: 'yelvqi', name: '耶律齐', book: BOOK, sex: '男', born: 18, origin: '蒙古丞相耶律楚材之子，周伯通的徒弟',
      death: (g) => (g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 86, cause: '在桃花岛寿终', mod: true } : { y: 71, cause: '襄阳城破时战死' }),
      ms: [[18, '生于漠北'], [35, '拜周伯通为师'], [41, '娶郭芙为妻', (g) => !g.f('gfNoYelv')], [57, '任丐帮帮主', (g) => !g.f('yelvNoGaibang') && !g.f('gfGaibang')], [57, '妻子郭芙做了丐帮帮主', (g) => g.f('gfGaibang')]] },
    { id: 'guopolu', name: '郭破虏', book: BOOK, sex: '男', born: 40, origin: '郭靖、黄蓉之子，郭襄的双胞胎弟弟',
      exists: guoKids,
      death: (g) => (g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 95, cause: '在江南寿终', mod: true } : { y: 71, cause: '襄阳城破时战死' }),
      ms: [[40, '生于襄阳'], [60, '随父守城'], [70, '得了屠龙刀', (g) => !g.f('yangKeepsSword')]] },
    { id: 'luwushuang', name: '陆无双', book: BOOK, sex: '女', born: 24, origin: '嘉兴陆家的小女儿，瘸了一条腿',
      death: { y: 90, cause: '在江南寿终' },
      ms: [[24, '生于嘉兴陆家庄'], [33, '被李莫愁掳走当丫头', (g) => lmcVillain(g) && !g.f('lujiaSpared') && !g.f('wushuangFree') && !g.f('wushuangPupil')], [33, '拜李莫愁为师', (g) => g.f('wushuangPupil')], [38, '逃出李莫愁之手', (g) => !g.f('wushuangFree')], [42, '与表姐程英结庐江边']] },
    { id: 'chengying', name: '程英', book: BOOK, sex: '女', born: 23, origin: '黄药师的关门弟子，陆无双的表姐',
      death: { y: 92, cause: '在江南寿终' },
      ms: [[23, '生于嘉兴'], [33, '拜黄药师为师'], [38, '暗中喜欢上了杨过'], [42, '与表妹陆无双结庐江边']] },
    { id: 'wudunru', name: '武敦儒', book: BOOK, sex: '男', born: 22, origin: '武三通之子，郭靖的徒弟', minor: true,
      death: (g) => (g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 85, cause: '在大理寿终', mod: true } : { y: 71, cause: '襄阳城破时战死' }),
      ms: [[33, '拜郭靖为师'], [40, '为郭芙与弟弟决斗', (g) => !g.f('gfClear') && !g.f('gfWedWu')], [41, '一个人去了大理', (g) => g.f('gfWedWu')], [42, '娶了耶律燕']] },
    { id: 'wuxiuwen', name: '武修文', book: BOOK, sex: '男', born: 23, origin: '武三通之子，郭靖的徒弟', minor: true,
      death: (g) => (g.f('guoSurvive') || g.f('guoLeftXiangyang') ? { y: 85, cause: '在大理寿终', mod: true } : { y: 71, cause: '襄阳城破时战死' }),
      ms: [[33, '拜郭靖为师'], [40, '为郭芙与哥哥决斗', (g) => !g.f('gfClear') && !g.f('gfWedWu')], [41, '娶了郭芙', (g) => g.f('gfWedWu')], [42, '娶了完颜萍', (g) => !g.f('gfWedWu')]] },
    { id: 'zhaozhijing', name: '赵志敬', book: BOOK, sex: '男', born: 5, origin: '全真教第三代弟子', minor: true,
      death: { y: 57, cause: '在重阳宫的乱战中死去' },
      ms: [[30, '全真教第三代弟子'], [34, '做了杨过的师父']] },
    { id: 'menge', name: '蒙哥', book: BOOK, sex: '男', born: 4, origin: '蒙古大汗，拖雷的长子',
      death: (g) => (g.f('yangNoTomb') || g.f('yangAbsent57') ? { y: 57, cause: '在四川钓鱼城下中炮石而死', mod: true } : { y: 57, cause: '在襄阳城下被杨过飞石击毙' }),
      ms: [[4, '生于漠北'], [45, '即蒙古大汗位'], [56, '亲征南宋']] },
    { id: 'huodu', name: '霍都', book: BOOK, sex: '男', born: 12, origin: '蒙古王子，金轮法王的徒弟',
      death: { y: 57, cause: '假扮丐帮弟子何师我，身份败露后被杀' },
      ms: [[34, '上终南山向小龙女求亲'], [39, '大胜关上败给朱子柳'], [45, '混入丐帮，化名何师我']] },
  ]);

  /* ---------- 本书世界事件 ---------- */
  JY.addEvents([
    { y: 33, who: ['yangguo', 'limochou'], cond: (g) => lmcVillain(g) && !g.f('lujiaSpared'), t: '赤练仙子李莫愁血洗嘉兴陆家庄，掳走了陆家的小女儿陆无双。' },
    { y: 33, who: ['yangguo', 'guofu'], cond: jing, t: (g) => (dad(g) ? '郭靖到嘉兴看望义弟杨康，把杨康的儿子杨过带回桃花岛学艺。' : '郭靖在嘉兴找到义弟杨康的遗孤杨过，带回了桃花岛。'), mod: dad },
    { y: 33, who: ['yangguo'], cond: (g) => !jing(g) && live(g, 'kezhene'), t: '柯镇恶把杨康的遗孤杨过送上了终南山全真教。', mod: true },
    { y: 34, who: ['yangguo', 'xiaolongnv'], cond: inTomb, t: '全真弟子杨过不堪欺辱，逃出重阳宫，被古墓派收留。' },
    { y: 34, who: ['xiaolongnv'], cond: (g) => live(g, 'huodu'), t: '蒙古王子霍都上终南山向小龙女求亲，被玉蜂蜇得落荒而逃。' },
    { y: 37, who: ['xiaolongnv', 'yangguo', 'limochou'], cond: (g) => lmcVillain(g) && inTomb(g) && !g.f('limochouLives'), t: '李莫愁闯入古墓抢夺《玉女心经》。小龙女放下断龙石，与杨过从暗河脱身。' },
    { y: 39, who: ['yangguo', 'xiaolongnv', 'guofu', 'guojing'], t: (g) => (guoPath(g) ? '大胜关英雄大会。跟着郭靖长大的杨过一人打退了金轮法王，' + (jing(g) ? '郭靖被推为武林盟主。' : '黄蓉主持大局。') : inTomb(g)
      ? '大胜关英雄大会。杨过、小龙女击退金轮法王，' + (jing(g) ? '郭靖被推为武林盟主。' : '黄蓉主持大局。') + '杨过当众说要娶师父为妻，天下哗然。'
      : '大胜关英雄大会。朱子柳以一手书法武功胜了霍都，' + (jing(g) ? '郭靖被推为武林盟主。' : '黄蓉主持大局。')), mod: (g) => !inTomb(g) },
    { y: 40, who: ['yangguo', 'xiaolongnv'], cond: (g) => inTomb(g) && live(g, 'gongsunzhi'), t: '绝情谷主公孙止要娶小龙女，杨过闯谷，中了情花之毒。' },
    { y: 40, who: ['guoxiang', 'guofu', 'limochou'], cond: (g) => g.exists('guoxiang'), t: (g) => '黄蓉在襄阳生下一对双胞胎，女儿取名郭襄，儿子取名郭破虏。' + (lmcVillain(g) && !g.f('xiangNotStolen') ? '女婴当夜被李莫愁抢走。' + (g.f('mochouReturnedXiang') ? '几天后，李莫愁又把她送回了郭府门口。' : '') : '') },
    { y: 40, who: ['yangguo', 'guofu'], cond: (g) => g.exists('guofu') && hero(g) && !g.f('guofuGentle') && !g.f('yangArm'), t: '郭芙一剑斩断了杨过的右臂。' },
    { y: 40, who: ['yangguo'], cond: hero, t: '杨过随神雕入深山，在独孤求败的剑冢里得了一把玄铁重剑。' },
    { y: 41, who: ['xiaolongnv', 'yangguo', 'guofu'], cond: (g) => inTomb(g) && !together(g), t: '小龙女身中冰魄银针之毒，在断肠崖刻下“十六年后，在此重会”，跳下深谷。' },
    { y: 44, who: ['yangguo'], cond: (g) => hero(g) && !together(g), t: (g) => '江湖上出现了一位' + (oneArm(g) ? '独臂的' : '') + '神雕大侠，行侠仗义，不留姓名。' },
    { y: 45, cond: (g) => live(g, 'jinlun'), t: '金轮法王回到漠北，闭关苦练龙象般若功。' },
    { y: 50, t: (g) => '蒙古攻打襄阳，' + g.slot('襄阳守将') + '率军民死守，城下尸积如山。' },
    { y: 56, who: ['guoxiang', 'yangguo'], cond: (g) => g.exists('guoxiang') && hero(g), t: '风陵渡口，郭襄遇见神雕侠，得了三枚金针。' },
    { y: 57, who: ['yangguo', 'xiaolongnv'], cond: (g) => inTomb(g) && !together(g) && live(g, 'xiaolongnv') && live(g, 'yangguo'), t: '十六年之约到期，杨过跳下断肠崖，与小龙女重逢。' },
    { y: 57, t: '蒙古大汗蒙哥一死，蒙古大军撤围北归，襄阳又守住了。' },
    { y: 57, t: (g) => {
      const five = [];
      if (live(g, 'huangyaoshi')) five.push('东邪黄药师');
      if (hero(g) && live(g, 'yangguo')) five.push('西狂杨过');
      if (live(g, 'yideng')) five.push('南僧一灯');
      if (jing(g)) five.push('北侠郭靖');
      if (live(g, 'zhoubotong')) five.push('中顽童周伯通');
      return '第三次华山论剑。' + (five.length ? '天下新五绝：' + five.join('、') + '。' : '') + (five.length < 5 ? '这一回的五绝凑不齐，有人说江湖老了。' : '');
    }, mod: (g) => !(live(g, 'huangyaoshi') && hero(g) && live(g, 'yangguo') && live(g, 'yideng') && jing(g) && live(g, 'zhoubotong')) },
    { y: 57, who: ['yangguo'], cond: (g) => !jing(g) && hero(g), fx: (g) => g.set('yangKeepsSword'), t: '郭靖已不在人世，杨过把玄铁重剑带回了古墓。', mod: true },
    { y: 58, who: ['yangguo', 'xiaolongnv'], cond: (g) => inTomb(g) && live(g, 'yangguo') && live(g, 'xiaolongnv'), t: '神雕侠杨过与小龙女归隐终南山古墓，从此不问江湖事。' },
    { y: 60, who: ['guoxiang'], cond: (g) => live(g, 'zhangsanfeng'), t: (g) => (g.f('gxStayXY') ? '觉远在少林后山圆寂，临终念出《九阳真经》。张君宝、无色禅师各记住了一部分，郭襄那时守在襄阳，没有听到。张君宝被逐出少林，流落武当山。' : '觉远在少林后山圆寂，临终念出《九阳真经》。郭襄、张君宝、无色禅师各记住了一部分。张君宝被逐出少林，流落武当山。') },
    { y: 60, cond: (g) => !hero(g), t: (g) => '一只大雕把' + (jing(g) ? '郭靖' : '一个上山砍柴的樵夫') + '引进襄阳郊外的深山。独孤求败剑冢里的那把玄铁重剑，就这样重见天日' + (jing(g) ? '。' : '，后来被樵夫卖进了襄阳城。'), mod: true },
    { y: 70, who: ['guojing', 'huangrong'], cond: (g) => !g.f('yangKeepsSword'), t: (g) => {
      const who = couple(g) ? '郭靖、黄蓉' : jing(g) ? '郭靖' : rong(g) ? '黄蓉' : '襄阳城里的铁匠';
      return who + '把玄铁重剑熔了，铸成倚天剑与屠龙刀。' + (g.f('noBladeSecrets') ? '刀剑里什么也没藏。' : '剑中藏《九阴真经》，刀中藏《武穆遗书》。') + '倚天剑给了郭襄，屠龙刀给了郭破虏。';
    }, mod: (g) => g.f('noBladeSecrets') || !couple(g) },
    { y: 70, who: ['guojing', 'huangrong'], cond: (g) => g.f('yangKeepsSword'), t: '郭靖、黄蓉手里没有玄铁。他们把《九阴真经》和《武穆遗书》交给了郭襄，嘱她好生收藏。', mod: true },
    { y: 80, who: ['guoxiang'], cond: (g) => g.alive('guoxiang') && !g.f('emeiLate'), t: '郭襄在峨嵋山出家，开创峨嵋派。' },
    { y: 88, who: ['guoxiang'], cond: (g) => g.f('yangKeepsSword') && !g.f('swordInTomb'), mod: true, t: (g) => (live(g, 'yangguo') ? '神雕把杨过的玄铁重剑送上了峨嵋。' : '杨过生前托神雕把玄铁重剑送上了峨嵋。') + (g.alive('guoxiang') ? '郭襄' : '峨嵋弟子') + '请名匠把它熔了，铸成倚天剑、屠龙刀，把《九阴真经》和《武穆遗书》藏在里面。倚天剑留在峨嵋，屠龙刀不久便失落江湖。' },
    { y: 97, cond: (g) => g.f('swordInTomb') && !g.alive('yangguo'), mod: true, t: '杨过死后，峨嵋弟子在终南山古墓里找到了那把玄铁重剑，带回峨嵋熔铸成倚天剑、屠龙刀，把《九阴真经》和《武穆遗书》藏在里面。' },
    { y: 100, cond: (g) => g.f('emeiLate'), t: '郭襄的弟子风陵在峨嵋山开派，奉郭襄为祖师。峨嵋派比原来晚立了二十年。', mod: true },
  ]);

  /* ---------- 郭芙、郭襄、李莫愁和本书奇遇用到的标记 ---------- */
  JY.addFlags({
    gfKindYang: '郭芙小时候护过杨过一回',
    gfClear: '郭芙早早跟武家兄弟说清楚了，他们没有为她决斗',
    gfNoYelv: '郭芙没有嫁给耶律齐',
    gfWedWu: '郭芙嫁给了武修文',
    gfSingle: '郭芙终身未嫁',
    gfDogStick: '郭芙学全了打狗棒法',
    gfGaibang: '郭芙接了打狗棒，做了丐帮帮主',
    yelvNoGaibang: '耶律齐没有做丐帮帮主',
    gfApologized: '郭芙当面向杨过道了歉',
    fuXiangClose: '郭芙和妹妹郭襄自小亲近',
    fuJoinsXiang: '襄阳城破后，郭芙去投奔了妹妹郭襄',
    xyChildrenOut: '襄阳城破前，城里三百多个孩子被送出了城',
    gfDaughterEmei: '郭芙的女儿上了峨嵋学艺',
    gxNoMeet: '郭襄那夜在风陵渡没有去找神雕侠',
    gxStayXY: '郭襄没有去找杨过，留在襄阳守城',
    gxLongxiang: '郭襄学了几层龙象般若功',
    jinlunDoubt: '金轮法王听了郭襄的话，不再替蒙古人打仗',
    emeiLaywoman: '郭襄没有出家，以俗家身份开了峨嵋派',
    emeiJiuyangFull: '峨嵋的九阳功是郭襄一句一句抄下来的，比原来完整',
    emeiHateMongol: '峨嵋门规：见了蒙古人，格杀勿论',
    emeiNoMarry: '峨嵋门规：弟子不许嫁人',
    xyRefugees: '襄阳城破时，郭襄带着百姓从水门逃了出来',
    emeiWudangFriends: '峨嵋、武当两派祖师约定互相照应',
    lmWaited: '李莫愁没有叛出古墓，留在墓里等陆展元',
    lmReconciled: '李莫愁在师父临终前认了错',
    mochouSisterBond: '李莫愁小时候真心照顾过师妹小龙女',
    wushuangFree: '陆无双没有被李莫愁掳走',
    wushuangPupil: '李莫愁收了陆无双做徒弟',
    xiangNotStolen: '郭襄出生那夜没有被李莫愁抢走',
    mochouReturnedXiang: '李莫愁亲手把郭襄送回了郭家',
    lmWithCheng: '李莫愁晚年和程英、陆无双做了邻居',
    lmHeir: '李莫愁把古墓武功传给了养女',
    mochouSistersMet: '李莫愁晚年和小龙女重归于好',
    mochouHeadGumu: '李莫愁做了古墓派掌门',
    mochouAsked: '有人问过李莫愁，为什么唱得这么伤心',
    jianzhongDug: '有人挖开过独孤求败的剑冢',
  });

  /* 上面这些标记带来的江湖传闻 */
  JY.addEvents([
    { y: 60, who: ['limochou'], cond: (g) => g.f('mochouSistersMet') && live(g, 'xiaolongnv'), t: '终南山古墓里常来一位白发道姑。杨过叫她师伯，她只是笑。', mod: true },
    { y: 72, cond: (g) => g.f('xyChildrenOut'), t: '襄阳城破前送出城的三百多个孩子，在江南各处被人收养。他们都记得郭大小姐。', mod: true },
    { y: 73, who: ['guoxiang'], cond: (g) => g.f('xyRefugees'), t: '跟着郭襄从襄阳水门逃出来的百姓，在江南落了脚，建了一座小庙供郭靖、黄蓉的牌位。', mod: true },
    { y: 90, cond: (g) => g.f('lmHeir'), t: '江湖上出现一个用冰魄银针的女子，出手狠，却从不伤无辜。有人说她是赤练仙子的养女。', mod: true },
    { y: 97, cond: (g) => g.f('emeiHateMongol'), t: '峨嵋弟子下山遇见蒙古兵，拔剑就杀。朝廷开始悬赏峨嵋派的人头。', mod: true },
    { y: 98, cond: (g) => g.f('emeiNoMarry'), t: '峨嵋派立下门规：弟子不许嫁人。有个女弟子为此哭着下了山。', mod: true },
    { y: 100, cond: (g) => g.f('emeiWudangFriends') && live(g, 'zhangsanfeng'), t: '峨嵋、武当两派弟子在江湖上相遇，照两位祖师的约定，互称师兄妹。', mod: true },
  ]);

  /* ---------- 本书奇遇 ---------- */
  /* 每个奇遇的选择都用 g.remember 记下，几年后由后面的“回响”自动节点读出来。 */
  JY.addEncounters([
    { id: 'e_sd_shendiao', y: [41, 95], minAge: 12, t: '独臂人', cond: (g) => hero(g) && live(g, 'yangguo') && !g.isMe('yangguo') && !g.isMe('xiaolongnv'),
      // 认识杨过的人（郭家、武氏兄弟、程英陆无双……）认得出他，写成重逢
      text: (g) => (g.knows('yangguo')
        ? '荒山溪边，一个' + (oneArm(g) ? '独臂的' : '') + '人带着一只丑陋的大雕在洗剑。你认出来了，是杨过。他也认出了你，点了点头，没有起身。'
        : '荒山里，一个' + (oneArm(g) ? '独臂的' : '') + '中年人带着一只丑陋的大雕，在溪边洗剑。那剑黑沉沉的，没有锋。') + (g.f('jianzhongDug') ? '他嘀咕说，前些年有人挖了剑冢，他去补过土。' : ''), choices: [
        { t: '上前请教', canon: true, fx: (g) => { g.stat('武学', 3); g.remember('sd_yang', 'learn'); }, res: '他看了你几招，只说了一句：“重剑无锋，大巧不工。”你没听懂，可记住了。' },
        { t: '请他喝酒', dev: 0, fx: (g) => { g.stat('情义', 4); g.remember('sd_yang', 'wine'); }, res: (g) => (g.knows('yangguo') ? '他喝了你一葫芦酒，说起旧事，只拣好笑的说。大雕吃了你一只鸡。' : '他喝了你一葫芦酒，大雕吃了你一只鸡。他们走了，没留名字。') },
        { t: '问他有没有见过一个穿白衣的女子', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('sd_yang', 'ask'); }, res: (g) => (g.knows('yangguo') ? '你问起龙姑娘。他的手停了一下，摇了摇头，转过身去，很久没有说话。' : '他的手停了一下：“你见过？”你摇头。他转过身去，很久没有说话。') },
      ] },
    { id: 'e_sd_shendiao_echo', y: [44, 120], always: true, auto: true, t: '重剑', cond: (g) => g.recall('sd_yang') && g.since('sd_yang') >= 3,
      text: (g) => { const who = g.knows('yangguo') ? '杨过' : '溪边那个洗剑的人'; return { learn: '你练剑时忽然想通了那句“重剑无锋，大巧不工”。剑招一下子慢了，也重了。', wine: '一只大雕落在你院子里，脚上绑着一坛酒，坛子上刻着一个“杨”字。', ask: together(g) ? '江湖上传说，神雕侠身边多了一个白衣女子。你想起' + who + '，笑了。' : '你又听人说起神雕侠，说他还在找一个人。你想起' + who + '转过身去的样子。' }[g.recall('sd_yang')]; },
      fx: (g) => { const k = g.recall('sd_yang'); if (k === 'learn') { g.stat('武学', 8); g.info('剑意', '重剑无锋'); } else if (k === 'wine') g.stat('心境', 6); else g.stat('情义', 3); } },

    // 写的是“初遇东邪”：女儿、外孙女、女婿、旧识都认得他，不该碰到
    { id: 'e_sdl_xiao', y: [25, 72], minAge: 10, t: '箫声', cond: (g) => live(g, 'huangyaoshi') && !g.knows('huangyaoshi') && !g.isMe('huangrong') && !g.isMe('guofu') && !g.isMe('guoxiang'),
      text: '海边有个青衫老人在吹箫。箫声时而像潮水，时而像女子哭泣。你听着听着，心跳乱了。', choices: [
        { t: '捂上耳朵跑开', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('sd_xiao', 'fled'); }, res: '你跑出很远，箫声还在耳边。' },
        { t: '运功守住心神，听完它', check: ['武学', 40], dev: 0, fx: (g) => { g.stat('悟性', 4); g.remember('sd_xiao', 'hold'); g.rel('海边听过他吹箫', 'huangyaoshi'); }, res: '老人放下箫，看了你一眼：“还行。”他是东邪黄药师。',
          fail: { fx: (g) => g.stat('根骨', -6), res: '你吐了一口血，昏了过去。醒来时老人已经走了，身边放着一颗药丸。', dev: 0 } },
        { t: '拿出笛子，跟他合一曲', check: ['悟性', 60], dev: 0, fx: (g) => { g.stat('心境', 4); g.remember('sd_xiao', 'duet'); g.rel('合过一曲的东邪', 'huangyaoshi'); }, res: '你吹乱了三处，他却停下来听你吹完：“有点意思。”他说他是东邪黄药师，问了你的名字。', fail: { fx: (g) => g.stat('根骨', -4), res: '你的笛声被箫声压住，胸口一闷，笛子掉在了沙滩上。', dev: 0 } },
      ] },
    { id: 'e_sdl_xiao_echo', y: [27, 90], always: true, auto: true, t: '箫声', cond: (g) => g.recall('sd_xiao') && g.since('sd_xiao') >= 2 && (g.recall('sd_xiao') !== 'duet' || live(g, 'huangyaoshi')),
      text: (g) => ({ fled: '你听见有人吹箫就心慌，绕路走开。', hold: '你打坐时，耳边又响起那天的箫声。这回你的心一下也没乱。', duet: '一个哑仆找到你，递上一支玉箫和一页曲谱，比划着说是' + (g.knows('huangyaoshi') ? '黄岛主' : '桃花岛主') + '让送的。' }[g.recall('sd_xiao')]),
      fx: (g) => { const k = g.recall('sd_xiao'); if (k === 'fled') g.stat('心境', -2); else if (k === 'hold') g.stat('武学', 4); else { g.rel('忘年交', 'huangyaoshi'); g.stat('悟性', 3); } } },

    { id: 'e_sd_bees', y: [58, 74], minAge: 10, t: '百花谷', cond: (g) => live(g, 'zhoubotong') && !g.isMe('guoxiang') && !g.knows('zhoubotong'),
      text: '你误入一座山谷，满谷都是花和玉蜂。一个白胡子老头抓着你，非要跟你玩左手画圆、右手画方。', choices: [
        { t: '陪他玩', check: ['悟性', 50, 'low'], dev: 0, fx: (g) => { g.stat('武学', 4); g.info('绝学', '左右互搏'); g.remember('sd_bees', 'hubo'); }, res: '你画成了。老头高兴得满地打滚：“傻人有傻福！”他是老顽童周伯通。',
          fail: { fx: (g) => { g.stat('心境', 3); g.remember('sd_bees', 'play'); }, res: '你怎么也画不成。老头说你心眼太多，又拉你去捉蜂。', dev: 0 } },
        { t: '偷偷溜走', canon: true, res: '你走出谷口，回头看见一个白发妇人在给他擦脸。' },
        { t: '帮他捉玉蜂', dev: 0, fx: (g) => { g.stat('根骨', -1); g.remember('sd_bees', 'honey'); }, res: '你被蜇了七下，捉住了一只。老头说你比他强，他被蜇了十七下。' },
      ] },
    { id: 'e_sd_bees_echo', y: [60, 90], always: true, auto: true, t: '百花谷', cond: (g) => g.recall('sd_bees') && g.since('sd_bees') >= 2,
      text: (g) => ({ hubo: '你一手使刀一手使鞭，对面的人看傻了。你想起百花谷里那个满地打滚的老头。', play: '你又试了一次左手画圆、右手画方，还是不成。你笑了。', honey: '老顽童托人送来一罐玉蜂浆，罐上画着一只被蜇肿的手。' }[g.recall('sd_bees')]),
      fx: (g) => { const k = g.recall('sd_bees'); if (k === 'hubo') g.stat('武学', 4); else if (k === 'honey') g.stat('根骨', 5); else g.stat('心境', 2); } },

    { id: 'e_sdl_yideng', y: [41, 62], minAge: 16, t: '老僧', cond: (g) => live(g, 'yideng') && g.s('根骨') < 65,
      text: (g) => (g.knows('yideng') ? '你在山寺里避雨，正遇见一灯大师。他还记得你，看了你一眼，说你身上又添了旧伤。' : '你在山寺里避雨，一个白眉老僧看了你一眼，说你身上有旧伤。'), choices: [
        { t: '请大师医治', canon: true, fx: (g) => { g.stat('根骨', 12); g.remember('sd_yideng', 'heal'); }, res: (g) => '他伸出一根手指，在你身上点了几下。你出了一身大汗，旧伤全好了。' + (g.knows('yideng') ? '他叹了口气，说你还是不爱惜自己。' : '他说他叫一灯。') },
        { t: '请大师讲经', dev: 0, fx: (g) => { g.stat('悟性', 4); g.remember('sd_yideng', 'sutra'); }, res: '他讲了一夜。你记住了一句：放下，便是。' },
        { t: '向大师请教一阳指', check: ['悟性', 60], dev: 0, fx: (g) => { g.stat('武学', 6); g.info('绝学', '一阳指（入门）'); }, res: '他教了你运气的法门，说这门功夫先养人，后伤人。', fail: { fx: (g) => g.stat('根骨', 6), res: '他笑了笑，只替你治了伤。', dev: 0 } },
      ] },
    { id: 'e_sdl_yideng_echo', y: [44, 90], always: true, auto: true, t: '旧事', cond: (g) => g.recall('sd_yideng') && g.since('sd_yideng') >= 3,
      text: (g) => (g.recall('sd_yideng') === 'heal' ? '那年山寺里' + (g.knows('yideng') ? '一灯大师' : '那个白眉老僧') + '点过的地方，再没疼过。' : '你发了一回大火，忽然想起那句“放下，便是”，火就灭了。'),
      fx: (g) => (g.recall('sd_yideng') === 'heal' ? g.stat('根骨', 3) : g.stat('心境', 6)) },

    { id: 'e_sd_junbao', y: [55, 62], minAge: 12, t: '挑水少年', cond: (g) => live(g, 'zhangsanfeng') && !g.isMe('guoxiang') && !g.knows('zhangsanfeng'),
      text: '少林寺山门外，一个十来岁的少年挑着两桶水，走得飞快，水一滴也不洒。他说他叫张君宝，是藏经阁觉远和尚的徒弟。', choices: [
        { t: '教他一招拳法', canon: true, fx: (g) => { g.stat('情义', 3); g.remember('sd_junbao', 'fist'); }, res: '他学得很认真，一遍一遍地打，打到天黑。' },
        { t: '送他一本你带着的拳谱', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('sd_junbao', 'book'); }, res: '他捧着拳谱，说要先去问师父能不能看。' },
        { t: '跟他比谁挑水快', check: ['根骨', 60], dev: 0, fx: (g) => { g.stat('根骨', 3); g.remember('sd_junbao', 'race'); }, res: '你赢了。他不服气，说明天再比。',
          fail: { fx: (g) => { g.stat('心境', 2); g.remember('sd_junbao', 'race'); }, res: '你输了。他挑着空桶等你，一脸憨笑。', dev: 0 } },
      ] },
    { id: 'e_sd_junbao_echo', y: [75, 152], always: true, auto: true, t: '武当来信', cond: (g) => g.recall('sd_junbao') && g.since('sd_junbao') >= 15 && live(g, 'zhangsanfeng'),
      text: (g) => ({ fist: '武当山的张真人派了个道童来，说当年山门外那一招拳，他记了一辈子，如今化进了武当长拳里。', book: '你在武当派的一本拳经里，看见了你当年送的那本拳谱，旁边批满了小字。', race: '武当山的张真人托人带话：挑水那场，明天再比。你笑出了声。' }[g.recall('sd_junbao')]),
      fx: (g) => { const k = g.recall('sd_junbao'); if (k === 'fist') g.stat('声望', 5); else if (k === 'book') g.stat('悟性', 3); else g.stat('心境', 5); } },

    { id: 'e_sd_cuishan', y: [90, 103], always: true, t: '武当来信', cond: (g) => g.isMe('guoxiang') && live(g, 'zhangsanfeng'),
      text: (g) => (g.f('junbaoWithXiang') ? '武当山来了一封信，是君宝亲笔。他说那三年一起走的路，他每一步都记得。' : g.recall('gx_bracelet') ? '武当山来了一封信，信上只有一句：“当年那只金镯，一直留着。”' : '武当山的张真人来了一封信，问候郭女侠。') + '落款是张三丰。', choices: [
        { t: '回一封短信，问他胡子白了没有', canon: true, fx: (g) => { g.stat('心境', 5); g.remember('gx_sanfeng'); }, res: '他回信说，白了。' },
        { t: '亲自去一趟武当山', dev: 10, fx: (g) => { g.move('wudang'); g.stat('心境', 6); g.remember('gx_wudang'); }, res: '他在山门口等你，胡子全白了。你们喝了一壶茶，谁也没提当年。' },
        { t: '回赠一部剑谱，约两派弟子互相照应', dev: 15, fx: (g) => { g.set('emeiWudangFriends'); g.stat('声望', 4); }, res: '他回了一部拳经。从此峨嵋、武当的弟子在江湖上遇见，都互称师兄妹。' },
      ] },
    { id: 'e_sd_cuishan_echo', y: [92, 120], always: true, auto: true, t: '武当', cond: (g) => g.recall('gx_sanfeng') && g.since('gx_sanfeng') >= 3,
      text: '武当山又来了信。这些年你们一年写一封，说的都是山上的花开了没有。', fx: (g) => g.stat('心境', 3) },

    { id: 'e_sd_xiexun', y: [96, 101], always: true, t: '金发少年', cond: (g) => g.isMe('guoxiang') && live(g, 'xiexun'),
      text: '一个金发碧眼的少年来讨水喝。他说他叫谢逊，拜在混元霹雳手成昆门下，师父待他如亲生儿子。', choices: [
        { t: '给他一碗水，什么也不说', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('gx_xiexun'); }, res: '他喝完水，向你作了个揖，下山去了。' },
        { t: '“小心你的师父。”', dev: 15, fx: (g) => { g.set('xiexunWarned'); g.stat('悟性', 2); }, res: '他愣了一下，哈哈大笑，说你多心了。可下山的时候，他回头看了好几次。' },
        { t: '问他师父到底待他好在哪里', dev: 10, check: ['悟性', 60], fx: (g) => { g.set('xiexunWarned'); g.stat('悟性', 2); }, res: '他说了很多，说着说着自己也皱起了眉。下山时，他回头看了好几次。', fail: { fx: (g) => g.remember('gx_xiexun'), res: '他说师父什么都好。你没有再问。', dev: 0 } },
      ] },

    { id: 'e_sd_song', y: [30, 41], minAge: 12, t: '道姑', cond: (g) => lmcVillain(g) && !g.f('limochouLives') && !g.isMe('limochou') && !g.knows('limochou'),
      text: '山道上走来一个美貌道姑，手持拂尘，一路唱着：“问世间，情是何物……”她路过的地方，草木都枯了。', choices: [
        { t: '躲在树后，等她过去', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('sd_song', 'hid'); }, res: '她走过的时候，朝你藏身的树笑了一下。' },
        { t: '问她为什么唱得这么伤心', check: ['情义', 60], dev: 10, fx: (g) => { g.set('mochouAsked'); g.stat('情义', 4); g.remember('sd_song', 'asked'); }, res: '她停下来看了你很久，说：“小孩子，等你长大就知道了。”她走了，没有再唱。',
          fail: { fx: (g) => { g.stat('根骨', -10); g.remember('sd_song', 'hurt'); }, res: '她拂尘一扫，你的脸肿了半个月。', dev: 0 } },
        { t: '拦住她，叫她别再杀人', check: ['武学', 70], dev: 10, fx: (g) => { g.stat('声望', 6); g.remember('sd_song', 'fought'); }, res: '你接了她三招。她收了拂尘，笑着说：“好俊的身手。”她绕开你走了。', fail: { fx: (g) => { g.stat('根骨', -20); g.remember('sd_song', 'hurt'); }, res: '你只接了一招。半边身子麻了一个月。', dev: 0 } },
      ] },
    { id: 'e_sd_song_echo', y: [32, 80], always: true, auto: true, t: '赤练仙子', cond: (g) => g.recall('sd_song') && g.since('sd_song') >= 2,
      text: (g) => ({ hid: g.alive('limochou') ? '你又听人说起赤练仙子。你想起那天她朝你藏身的树笑了一下，背上发凉。' : '你听说赤练仙子死在了绝情谷。你想起山道上那支歌。', asked: '江湖上有人说，赤练仙子近来唱那支歌时，会停下来想一会儿。', hurt: '你脸上被拂尘扫过的地方，到现在阴天还痒。', fought: '江湖上传说，有人在山道上接了赤练仙子三招。说的人不知道那是你。' }[g.recall('sd_song')]),
      fx: (g) => (g.recall('sd_song') === 'fought' ? g.stat('声望', 3) : g.stat('心境', 1)) },

    { id: 'e_sd_jinlun', y: [39, 57], minAge: 16, t: '藏僧', cond: (g) => live(g, 'jinlun') && !g.isMe('guoxiang') && !g.knows('jinlun'),
      text: '一个高大的藏僧拦住去路，手里托着五只轮子。他说要试试中原武人的成色。', choices: [
        { t: '拱手认输', canon: true, fx: (g) => { g.stat('心境', -3); g.remember('sd_jinlun', 'yield'); }, res: '他大笑着走了。那笑声你记了很久。' },
        { t: '接他一轮', check: ['武学', 70], dev: 0, fx: (g) => { g.stat('声望', 10); g.remember('sd_jinlun', 'won'); }, res: '你接住了。他收起轮子，说中原还有人。',
          fail: { fx: (g) => { g.stat('根骨', -15); g.remember('sd_jinlun', 'hurt'); }, res: '金轮砸在你胸口，你躺了三个月。', dev: 0 } },
        { t: '请他喝茶，套他的话', check: ['悟性', 60], dev: 0, fx: (g) => { g.stat('悟性', 3); g.remember('sd_jinlun', 'intel'); }, res: '他喝了你三壶茶，说漏了蒙古大军明年开春南下的事。', fail: { fx: (g) => g.stat('根骨', -8), res: '他看穿了你，一只金轮就飞了过来。', dev: 0 } },
      ] },
    { id: 'e_sd_jinlun_echo', y: [41, 70], always: true, auto: true, t: '金轮', cond: (g) => g.recall('sd_jinlun') && g.since('sd_jinlun') >= 2,
      text: (g) => ({ yield: '你苦练了两年，就为了忘掉那天的笑声。', won: '有人认出你就是接过金轮的人，请你上座。', hurt: '胸口那一轮的旧伤，阴雨天就疼。', intel: inXY(g) ? (g.knows('guojing') ? '你把打听来的军情送到了襄阳，交到郭靖手上。他认得你，拍着你的肩膀说，这一趟救了不少人。' : '你把打听来的军情送到了襄阳。郭靖亲笔回了一封谢信。') : '你打听来的军情送到了襄阳，守将收下了，没说什么。' }[g.recall('sd_jinlun')]),
      fx: (g) => { const k = g.recall('sd_jinlun'); if (k === 'yield') g.stat('武学', 6); else if (k === 'won') g.stat('声望', 4); else if (k === 'hurt') g.stat('根骨', -3); else g.stat('声望', 6); } },

    { id: 'e_sd_siege', y: [40, 70], minAge: 14, t: '募兵', cond: (g) => !g.isMe('guojing') && !g.isMe('huangrong'),
      text: (g) => '襄阳城门口贴着告示：' + g.slot('襄阳守将') + '招募义勇，守城抗元。排队的人里有老汉，也有孩子。', choices: [
        { t: '报名守城一年', canon: true, fx: (g) => { g.stat('声望', 5); g.stat('根骨', -4); g.move('xiangyang'); g.remember('sd_siege', 'guard'); }, res: '你在城头守了一年，学会了怎么往云梯上浇热油。' },
        { t: '捐些钱粮就走', dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('sd_siege', 'gave'); }, res: '收钱的书吏给你写了一张收条，字写得很认真。' },
        { t: '去城里帮郎中照看伤兵', dev: 0, fx: (g) => { g.stat('情义', 4); g.info('手艺', '接骨包扎'); g.remember('sd_siege', 'medic'); }, res: '你学会了接骨、包扎，闭着眼睛也能缝伤口。' },
      ] },
    { id: 'e_sd_siege_echo', y: [43, 90], always: true, auto: true, t: '襄阳', cond: (g) => g.recall('sd_siege') && g.since('sd_siege') >= 3,
      text: (g) => ({ guard: g.Y >= 71 ? '襄阳城破的消息传来。和你一起守过城头的弟兄，没有一个出来。' : '当年一起守城的弟兄托人捎信，说城还在。', gave: '襄阳又贴出了募兵的告示。你把那张收条翻出来看了看。', medic: '你在路上救了一个受伤的人，用的是在襄阳学的手艺。' }[g.recall('sd_siege')]),
      fx: (g) => { const k = g.recall('sd_siege'); if (k === 'medic') g.stat('情义', 4); else if (k === 'guard') g.stat('心境', g.Y >= 71 ? -8 : 3); else g.stat('正邪', 1); } },

    { id: 'e_sd_jianzhong', y: [41, 140], minAge: 16, once: true, t: '剑冢', cond: (g) => !g.isMe('yangguo'),
      text: '你追一只受伤的山鹿，误入深山。崖壁上刻着几行字：“剑魔独孤求败，纵横江湖三十余载……”下面一排石冢，埋着几把剑。', choices: [
        { t: '磕三个头，走', canon: true, fx: (g) => { g.stat('心境', 3); g.remember('sd_jz', 'bow'); }, res: '你下山时，听见一声雕鸣。' },
        { t: '在石冢前坐一夜，想剑意', check: ['悟性', 65], dev: 0, fx: (g) => { g.stat('武学', 10); g.info('剑意', '无剑胜有剑（一点）'); }, res: '天亮时你明白了一点：利剑不如重剑，重剑不如木剑，木剑不如无剑。',
          fail: { fx: (g) => { g.stat('心境', 2); g.remember('sd_jz', 'sat'); }, res: '你看了一夜，只觉得这个人很孤独。', dev: 0 } },
        { t: '挖开石冢，看看里面的剑', check: ['根骨', 50], dev: 10, fx: (g) => { g.stat('武学', 6); g.stat('正邪', -3); g.set('jianzhongDug'); }, res: '你挖出一把木剑，剑身已经朽了。你把它埋了回去，土却怎么也填不平。', fail: { fx: (g) => g.stat('根骨', -5), res: '一只大雕从天而降，把你赶下了山。', dev: 0 } },
      ] },
    { id: 'e_sd_jianzhong_echo', y: [44, 150], always: true, auto: true, t: '剑冢', cond: (g) => g.recall('sd_jz') && g.since('sd_jz') >= 3,
      text: (g) => (g.recall('sd_jz') === 'bow' ? '你梦见那排石冢，梦里有人在练剑，看不清脸。' : '你又想起剑冢上的字。这回，你想通了一点。'),
      fx: (g) => (g.recall('sd_jz') === 'bow' ? g.stat('悟性', 2) : g.stat('武学', 4)) },

    { id: 'e_sd_sisters', y: [42, 90], minAge: 16, t: '江边草庐', cond: (g) => live(g, 'chengying') && live(g, 'luwushuang') && !g.isMe('yangguo') && !g.knows('chengying') && !g.knows('luwushuang'),
      text: (g) => '江边有座草庐，住着一对姐妹。姐姐吹箫，妹妹瘸着一条腿，嘴很厉害。' + (g.f('lmWithCheng') ? '隔壁还住着一个白发道姑，不怎么说话。' : '') + '她们收留你住了一晚。', choices: [
        { t: '帮她们修屋顶', canon: true, fx: (g) => { g.stat('情义', 4); g.remember('sd_sis', 'roof'); }, res: '临走时，姐姐说：“若遇见一个独臂的人，替我们问声好。”' },
        { t: '跟她们学几招防身的功夫', dev: 0, fx: (g) => { g.stat('武学', 4); g.info('武功', '玉箫剑法（几招）'); }, res: '妹妹嫌你笨，姐姐教得很耐心。' },
        { t: '答应替她们给那个独臂人带句话', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('sd_sis', 'msg'); }, res: '姐姐想了很久，只说：“告诉他，我们都好。”' },
      ] },
    { id: 'e_sd_sisters_echo', y: [44, 95], always: true, auto: true, t: '江边', cond: (g) => g.recall('sd_sis') && g.since('sd_sis') >= 3,
      text: (g) => (g.recall('sd_sis') === 'roof' ? '江边草庐的姐妹托人送来一包新茶。' : g.recall('sd_yang') || g.knows('yangguo') ? '你遇见过那个独臂人。你替她们问了好，他沉默了很久，说：“替我谢谢她们。”' : '你一直没遇见那个独臂人。“我们都好”这四个字，你带了好多年。'),
      fx: (g) => g.stat('情义', 3) },

    { id: 'e_sd_kezhene', y: [33, 52], minAge: 8, t: '瞎眼老人', cond: (g) => live(g, 'kezhene') && !g.isMe('guofu') && !g.knows('kezhene'),
      text: (g) => '嘉兴酒楼上，一个瞎眼老人拄着铁杖喝酒，给你讲当年江南七怪和丘处机的十八年之约。' + (g.f('qiguaiSaved') ? '说到七个兄弟后来都老死在嘉兴，他笑了。' : '说到五个兄弟死在桃花岛，他停了很久。'), choices: [
        { t: '陪他喝到天亮', canon: true, fx: (g) => { g.stat('情义', 4); g.remember('sd_ke', 'drink'); }, res: '他说他有个傻徒弟叫郭靖，如今在守襄阳。' },
        { t: '向他讨教暗器', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('武学', 5); g.info('绝学', '听风辨器'); }, res: '他教了你听风辨器的法子。',
          fail: { fx: (g) => { g.stat('心境', 1); g.remember('sd_ke', 'drink'); }, res: '他说你耳朵太笨，又给你倒了一杯。', dev: 0 } },
        { t: '扶他回家', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('sd_ke', 'home'); }, res: '他家里空荡荡的，墙上挂着几件旧兵器。他摸着墙，一件一件讲给你听。' },
      ] },
    { id: 'e_sd_kezhene_echo', y: [36, 90], always: true, auto: true, t: '嘉兴', cond: (g) => g.recall('sd_ke') && g.since('sd_ke') >= 3 && (g.recall('sd_ke') !== 'home' || !g.alive('kezhene')),
      // 后来才知道那老人是谁的（例如上了桃花岛的杨过），改用称呼
      text: (g) => { const k = g.knows('kezhene'); return g.recall('sd_ke') === 'home' ? '你听说' + (k ? k + '柯镇恶' : '嘉兴那个瞎眼老人') + '死了。邻居说，他临终前还提起那个扶他回家的年轻人。' : '你在酒楼上又听人讲江南七怪，跟着讲了两句，满座都看你。' + (k ? '你没说那个瞎眼老人就是你的' + k + '。' : ''); },
      fx: (g) => (g.recall('sd_ke') === 'home' ? g.stat('情义', 4) : g.stat('声望', 2)) },

    { id: 'e_sd_guojing', y: [58, 70], minAge: 16, t: '城头老将', cond: (g) => inXY(g) && !g.isMe('guojing') && !g.isMe('huangrong') && !g.isMe('guofu') && !g.isMe('guoxiang') && !g.knows('guojing'),
      text: '你在襄阳城头遇见一个两鬓斑白的汉子在巡城。他看你身手不错，问你愿不愿意学几招掌法。', choices: [
        { t: '学', canon: true, fx: (g) => { g.stat('武学', 8); g.info('武功', '亢龙有悔'); }, res: '他教你“亢龙有悔”。他说，这一掌要留三分力，打出去还要收得回来。后来你才知道，他就是郭靖。' },
        { t: '求他收你为徒', check: ['正邪', 30], dev: 10, fx: (g) => { g.stat('武学', 6); g.rel('师父', 'guojing'); }, res: '他想了想说：“徒弟不收。你天天来城头，我教你。”你天天去了。', fail: { fx: (g) => g.stat('武学', 3), res: '他摇摇头，说你心里杂念太多，只教了你一招。', dev: 0 } },
        { t: '陪他巡一遍城', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('sd_gj', 'wall'); }, res: '他一路跟你讲，每一段城墙是哪一年修的，谁死在了哪里。' },
      ] },
    { id: 'e_sd_guojing_echo', y: [60, 90], always: true, auto: true, t: '城墙', cond: (g) => g.recall('sd_gj') && g.since('sd_gj') >= 2,
      text: (g) => (g.Y >= 71 ? '襄阳城破的消息传来。你想起那个陪你巡城的汉子，他说每一段城墙下都死过人。' : '你又想起城头那个两鬓斑白的汉子。你走过的每一座城，都会先去看看城墙。'),
      fx: (g) => g.stat('正邪', 3) },

    { id: 'e_sd_emeinun', y: [82, 118], minAge: 12, t: '峨嵋老尼', cond: (g) => g.alive('guoxiang') && !g.isMe('guoxiang') && !g.f('emeiLate') && !g.knows('guoxiang'),
      text: (g) => '峨嵋金顶上，一个' + (g.f('emeiLaywoman') ? '没有剃度、白发挽成髻的老妇人' : '老尼') + '在看云。她问你，有没有见过一只大雕。', choices: [
        { t: '“见过。”', canon: true, fx: (g) => { g.stat('情义', 3); g.remember('sd_nun', 'yes'); }, res: '她笑了，笑得像个十六岁的小姑娘。' },
        { t: '“没有。”', dev: 0, fx: (g) => { g.stat('心境', 2); g.remember('sd_nun', 'no'); }, res: '她点点头，又去看云了。' },
        { t: '陪她看一下午的云', dev: 0, fx: (g) => { g.stat('心境', 4); g.remember('sd_nun', 'cloud'); }, res: '她给你讲了一个风陵渡口下大雪的故事。你下山时，她还在看。' },
      ] },
    { id: 'e_sd_emeinun_echo', y: [83, 140], always: true, auto: true, t: '峨嵋', cond: (g) => g.recall('sd_nun') && !g.alive('guoxiang'),
      text: (g) => '峨嵋传出消息，郭祖师坐化了。' + ({ yes: '守殿的小尼姑说，祖师临走前笑着说，有人见过那只雕。', no: '你想起金顶上那个看云的老人。', cloud: '你想起那天的云海，还有她讲的那个下雪的渡口。' }[g.recall('sd_nun')]),
      fx: (g) => g.stat('心境', -2) },
  ]);

  /* ---------- 专属闲笔 ---------- */
  JY.addFlavor('char:yangguo', [
    { t: '你在破窑外捉蛐蛐，捉到一只最凶的，给它取名“大将军”。', maxAge: 12 },
    { t: '你学会了用树叶吹曲子。母亲说你吹得像你爹。', maxAge: 11 },
    { t: '你帮隔壁的老婆婆赶走了偷鸡的黄鼠狼，她给了你一个鸡蛋。', maxAge: 12 },
    { t: '你在河边看自己的影子，想知道父亲长什么样。', maxAge: 13 },
    { t: '你偷了一只烧鸡，分了一半给街角的瞎子。', minAge: 11, maxAge: 13 },
    { t: '你学会了倒立。倒着看世界，好像也没什么不同。', minAge: 13, maxAge: 16 },
    { t: '姑姑让你捉麻雀，八十一只，一只也不许飞出去。', minAge: 14, maxAge: 18, cond: inTomb },
    { t: '你给姑姑讲外面的事，她听得很认真，从不笑。', minAge: 14, maxAge: 18, cond: inTomb },
    { t: '你在古墓里睡寒玉床，梦见自己是一条鱼。', minAge: 14, maxAge: 18, cond: inTomb },
    { t: '你在重阳宫里扫了一年的地，扫帚换了三把。', minAge: 14, maxAge: 30, cond: (g) => !inTomb(g) },
    { t: '你学了一招“玉女素心剑”，觉得这名字太娘气，偷偷改成了“杨过素心剑”。', minAge: 15, maxAge: 19, cond: inTomb },
    { t: '你在路上学人说话，学谁像谁，把一群蒙古兵骗得团团转。', minAge: 18, maxAge: 30 },
    { t: '有姑娘对你笑，你也对她笑。笑完你就想起了姑姑。', minAge: 18, maxAge: 40 },
    { t: '神雕在前面走，你在后面跟着。它走路像个老头。', minAge: 21, maxAge: 56, cond: inTomb },
    { t: '你在一个小镇上听人讲神雕侠的故事，讲得比你做的还厉害。', minAge: 24, maxAge: 56, cond: inTomb },
    { t: '你戴着人皮面具喝酒，酒从面具边上流下来。', minAge: 24, maxAge: 56, cond: inTomb },
    { t: '你在断肠崖上刻了一行小字，又用剑削掉了。', minAge: 22, maxAge: 36, cond: (g) => inTomb(g) && !together(g) },
    { t: '你梦见姑姑在谷底养蜂，醒来时满脸是泪。', minAge: 22, maxAge: 36, cond: (g) => inTomb(g) && !together(g) },
    { t: '你一个人过了第十个年。神雕给你叼来一条鱼。', minAge: 30, maxAge: 36, cond: (g) => inTomb(g) && !together(g) },
    { t: '龙儿学会了做饭，第一顿做得很难吃，你吃了三碗。', minAge: 38, cond: (g) => inTomb(g) && live(g, 'xiaolongnv') },
    { t: '你在古墓外种了一片花，龙儿说太俗了，每天都去浇水。', minAge: 38, cond: (g) => inTomb(g) && live(g, 'xiaolongnv') },
    { t: '神雕老了，飞不高了。你陪它坐在墓门口晒太阳。', minAge: 50, cond: inTomb },
    { t: '有年轻人来终南山找神雕大侠，你说他早死了。', minAge: 50 },
    { t: '你教小道士们练剑，最笨的那个最像你小时候。', minAge: 35, cond: (g) => !inTomb(g) },
  ]);
  JY.addFlavor('char:xiaolongnv', [
    { t: '孙婆婆教你认蜂。你给每只蜂王都取了名字。', maxAge: 10 },
    { t: '你在墓里练轻功，把一只麻雀放在掌心，它飞不起来。', minAge: 8, maxAge: 20 },
    { t: '你一年说的话，不超过一百句。', minAge: 8, maxAge: 18 },
    { t: '师父教你弹琴，你弹得很准，却没有一点情绪。', minAge: 10, maxAge: 18 },
    { t: '你在墓门缝里看过一次日出，看了很久。', minAge: 10, maxAge: 18 },
    { t: '你把头发梳了又梳，墓里没有镜子，只有一潭水。', minAge: 12, maxAge: 20 },
    { t: '你很少想外面的事。墓里的日子很长，也很短。', minAge: 16, maxAge: 18 },
    { t: '过儿给你讲了一个笑话。你没笑，他自己笑得打滚。', minAge: 18, maxAge: 22, cond: inTomb },
    { t: '过儿又长高了，已经比你高了。', minAge: 19, maxAge: 22, cond: inTomb },
    { t: '你第一次被人叫“姑姑”，叫得你心里一动。', minAge: 18, maxAge: 19, cond: inTomb },
    { t: '你在山下第一次吃了一碗馄饨，觉得外面的东西也不全坏。', minAge: 22, maxAge: 24 },
    { t: '你一个人走在路上，男人们都回头看你。你不明白他们看什么。', minAge: 22, maxAge: 24 },
    { t: '谷底的寒潭里有一种白鱼，你每天抓一条。', minAge: 26, maxAge: 40, cond: (g) => inTomb(g) && !together(g) },
    { t: '你在谷底的石壁上刻了一道又一道，数着日子。', minAge: 26, maxAge: 40, cond: (g) => inTomb(g) && !together(g) },
    { t: '你梦见过儿还是十四岁，在墓里捉麻雀。', minAge: 26, maxAge: 40, cond: (g) => inTomb(g) && !together(g) },
    { t: '谷底的花开了，你摘了一朵插在头上，没有人看。', minAge: 26, maxAge: 40, cond: (g) => inTomb(g) && !together(g) },
    { t: '你学会了笑，是过儿教的。', minAge: 25, cond: (g) => inTomb(g) && together(g) },
    { t: '过儿在古墓外种了一片花，你每天都去浇。', minAge: 42, cond: inTomb },
    { t: '你给女儿梳头，想起孙婆婆当年给你梳头的样子。', minAge: 47, cond: (g) => inTomb(g) && !g.f('gumuNoHeir') },
    { t: '你的头发白了，过儿说还是很好看。', minAge: 60, cond: inTomb },
    { t: '墓里很静，你常常一个人坐很久。', minAge: 30, cond: (g) => !inTomb(g) },
  ]);
  JY.addFlavor('char:guofu', [
    { t: '外公给你做了一支玉箫，你吹不响，摔了。', maxAge: 9 },
    { t: '你在桃花岛的海边捡贝壳，捡了一篮子，全送给了娘。', maxAge: 10 },
    { t: '你骑在爹的脖子上，看他打了一套降龙掌。', maxAge: 8 },
    { t: '岛上的哑仆们都怕你，只有一个老哑仆敢不理你。', maxAge: 10 },
    { t: '武家哥哥给你捉了一只白兔，你养了三天就忘了喂。', minAge: 9, maxAge: 14 },
    { t: '你穿了一件新衣裳，在襄阳城里走了三圈。', minAge: 12, maxAge: 20 },
    { t: '你跟娘吵了一架，说她偏心妹妹。', minAge: 16 },
    { t: '城里的人都叫你“郭大小姐”。你喜欢这个称呼。', minAge: 12, maxAge: 30 },
    { t: '你发脾气砸了一个茶杯，又偷偷把碎片扫了。', minAge: 14, maxAge: 30 },
    { t: '你想起杨过，心里一阵烦，就去找武家兄弟的麻烦。', minAge: 15, maxAge: 33, cond: (g) => !!g.knows('yangguo') },
    { t: '你教女儿骑马，她摔下来没哭，你哭了。', minAge: 22 },
    { t: '你学着娘的样子算账，算错了三次。', minAge: 25 },
    { t: '你给丈夫缝衣裳，针脚很难看，他照样穿。', minAge: 18 },
    { t: '你站在城头，看见蒙古营里的炊烟，比去年又多了。', minAge: 20 },
    { t: '你梦见小时候的桃花岛，梦里爹娘都很年轻。', minAge: 30 },
    { t: '你第一次觉得，自己说话越来越像娘了。', minAge: 35 },
    { t: '你把那把淑女剑收进了箱底，再也没拿出来。', minAge: 17 },
    { t: '妹妹偷偷跑出城，你骑马追了一夜，追回来又骂了她一顿。', minAge: 30, maxAge: 40 },
    { t: '你给城里的伤兵送饭，有个小兵叫你“大姐”。', minAge: 20 },
    { t: '你给孩子讲桃花岛的故事，讲着讲着自己睡着了。', minAge: 25 },
    { t: '你回到桃花岛，桃花阵里的路，你还是走不全。', minAge: 48, cond: (g) => g.loc === 'taohua' },
  ]);
  JY.addFlavor('char:guoxiang', [
    { t: '你学会了说话，第一句是“爹”。', maxAge: 3 },
    { t: '你和弟弟破虏抢一个拨浪鼓，最后让给了他。', maxAge: 6 },
    { t: '你在城门口听说书人讲华山论剑，回家学着比划。', minAge: 6, maxAge: 14 },
    { t: '你偷了爹的酒喝，醉了一下午。', minAge: 10, maxAge: 16 },
    { t: '你交了一个乞丐朋友，教他认字。', minAge: 8, maxAge: 16 },
    { t: '你骑着一头青驴出城，驴不肯走，你跟它讲了半天道理。', minAge: 12 },
    { t: '你在城外救了一只受伤的鹰，养好了伤，放了。', minAge: 10, maxAge: 16 },
    { t: '姐姐又骂你没规矩。你冲她吐舌头。', minAge: 8, maxAge: 18 },
    { t: '你把三枚金针拿出来看，又收好。', minAge: 16, maxAge: 40 },
    { t: '你听见雕叫，就会抬头看天。', minAge: 16 },
    { t: '你在客栈的墙上看见有人写“神雕侠到此一游”，笑了半天。', minAge: 17, maxAge: 40 },
    { t: '你走过绝情谷，没有进去。', minAge: 18, maxAge: 40 },
    { t: '你在风陵渡口又住了一晚，那年的雪没有下。', minAge: 18, maxAge: 40 },
    { t: '你一个人喝酒，喝到第三杯，就会想起一个人。', minAge: 18 },
    { t: '你在江南听人唱“问世间情是何物”，在桥上站了很久。', minAge: 18, maxAge: 40 },
    { t: '你把头发剪短了，觉得轻快了很多。', minAge: 40 },
    { t: '峨嵋的小尼姑们怕你，又爱缠着你讲故事。', minAge: 42 },
    { t: '你在金顶上看云海，看得忘了敲钟。', minAge: 40 },
    { t: '你教弟子剑法，说到“以静制动”时，想起了一个人。', minAge: 45 },
    { t: '你梦见襄阳城头，爹在城上，娘在城下，你还是个小姑娘。', minAge: 32 },
    { t: '有人问你峨嵋派为什么叫峨嵋，你说因为这座山叫峨嵋。', minAge: 42 },
  ]);
  JY.addFlavor('char:limochou', [
    { t: '你在墓里偷偷养了一只老鼠，被师父发现了。', maxAge: 12 },
    { t: '你学会了用玉蜂浆做点心，孙婆婆夸你手巧。', maxAge: 14 },
    { t: '你在墓门缝里看见一只蝴蝶，看了一个下午。', maxAge: 15 },
    { t: '你帮师父梳头，偷偷数她有几根白发。', maxAge: 16 },
    { t: '你抱着小师妹哼歌，她睡着了。', minAge: 6, maxAge: 12 },
    { t: '你第一次下山，看见集市上的人那么多，有点害怕。', minAge: 16, maxAge: 18 },
    { t: '你在溪边照自己的影子，觉得自己很好看。', minAge: 14, maxAge: 20 },
    { t: '你绣了一块锦帕，上面是一朵红花。', minAge: 18, maxAge: 20, cond: (g) => !g.f('mochouNoLu') },
    { t: '你在路上看见一对夫妻吵架，看了很久。', minAge: 20 },
    { t: '你把一个调戏村女的恶霸毒死了，村女却吓得跑了。', minAge: 21, cond: (g) => !g.f('mochouNoLu') && !g.f('limochouLives') },
    { t: '你的拂尘上沾了血，洗了很多遍。', minAge: 21, cond: (g) => !g.f('mochouNoLu') && !g.f('limochouLives') },
    { t: '有人在背后叫你“赤练仙子”，你回头笑了一下，那人吓得腿软。', minAge: 21, cond: (g) => !g.f('mochouNoLu') && !g.f('lujiaSpared') && !g.f('limochouLives') },
    { t: '你教洪凌波梳头，想起了师父。', minAge: 25, cond: (g) => !g.f('mochouNoLu') },
    { t: '你梦见陆展元站在桥上，朝你招手。你醒来，把枕头扔了出去。', minAge: 20, cond: (g) => !g.f('mochouNoLu') },
    { t: '你在路边看见一个弃婴，抱起来，又放下了。', minAge: 22 },
    { t: '你一个人唱歌，唱到一半就停了。', minAge: 20 },
    { t: '你在道观里种了一棵桃树。', minAge: 33, cond: (g) => g.f('limochouLives') },
    { t: '你念经念到一半，想起了从前的事，又念了一遍。', minAge: 33, cond: (g) => g.f('limochouLives') || g.f('mochouNoLu') },
    { t: '养女学会了走路，摇摇晃晃地扑到你怀里。', minAge: 43, cond: (g) => g.f('limochouLives') || g.f('mochouNoLu') },
    { t: '你的手上全是老茧，再也没碰过冰魄银针。', minAge: 35, cond: (g) => g.f('limochouLives') },
    { t: '你给樵夫补衣裳，补着补着笑了。', minAge: 35, cond: (g) => g.f('mochouNoLu') },
  ]);

  /* ---------- 地点闲笔 ---------- */
  JY.addFlavor('loc:gumu', [
    '墓里的石室一间连着一间，你闭着眼也能走。',
    '长明灯的油快没了，你又添了一次。',
    '寒玉床上结了一层薄霜。',
    '墓顶的石缝里滴下一滴水，一个时辰一滴。',
    '你在石壁上看见前人刻的剑招，刻得很深。',
    '墓门外下了雪，墓里一点也感觉不到。',
  ]);
  JY.addFlavor('loc:zhongnan', [
    '重阳宫的道士们排成一排练剑，剑光像一片水。',
    '终南山下的村子里，人人都会念几句《道德经》。',
    '后山有一片林子，全真弟子都不敢进去。',
    '重阳宫的钟敲了一百零八下，你数错了。',
    '山上的雾很重，三步外看不见人。',
    '一个老道士在松下打坐，三天没动过。',
  ]);
  JY.addFlavor('loc:xiangyang', [
    '城里的米价又涨了，可没有人走。',
    '城头的箭垛上插满了蒙古人的箭，守军拔下来再射回去。',
    '郭府的灯每晚都亮到很晚。',
    '汉水上漂着几具浮尸，不知道是哪一边的。',
    '城里的孩子们玩打仗的游戏，没有人愿意扮蒙古兵。',
    '一个老兵在城门口晒太阳，他守了这座城三十年。',
  ]);
  JY.addFlavor('loc:jueqing', [
    '谷里的情花开得正艳，花刺上有毒。',
    '谷中的人不吃荤腥，一日三餐都是素的。',
    '断肠崖下的风很冷，吹得人睁不开眼。',
    '水仙山庄的门前，挂着一块“绝情”的匾。',
    '谷底的寒潭清得能看见鱼。',
    '谷里的人说话都很小声，像怕惊动什么。',
  ]);
  JY.addFlavor('loc:jianzhong', [
    '深山里只有风声和雕鸣。',
    '剑冢前的石头上长满了青苔。',
    '崖壁上的字，被风雨磨浅了。',
    '山洞里有一副白骨，旁边放着一柄木剑。',
    '你在山涧边练剑，剑气把水劈成两半。',
    '大雕站在崖顶，一动不动地看着你。',
  ]);
  JY.addFlavor('loc:fenglingdu', [
    '黄河结了冰，渡船过不去，客栈里挤满了人。',
    '渡口的老艄公说，他见过神雕侠。',
    '一群人围着火堆，你一言我一语地讲江湖上的事。',
    '风从河面上吹过来，像刀子一样。',
    '客栈的老板娘烫了一壶酒，说是请你的。',
    '渡口边的柳树上，系着一根红绳。',
  ]);
  JY.addFlavor('loc:baihua', [
    '谷里的花一年四季都开着。',
    '玉蜂在花丛里嗡嗡地飞，翅膀上好像刻着字。',
    '老顽童在谷里搭了一个秋千，荡得比树还高。',
    '谷口的溪水里，有人放了一只纸船。',
    '一个白发妇人在谷里种菜，种得整整齐齐。',
    '你在谷里迷了路，跟着蜂走了出来。',
  ]);
  JY.addFlavor('loc:emei', [
    '金顶上的云海翻涌，像要把山吞下去。',
    '峨嵋山的猴子抢了你的干粮。',
    '山上的庵堂里，小尼姑们在念早课。',
    '你看见了佛光，一圈一圈的，像彩虹。',
    '峨嵋山的雨说来就来，石阶上全是水。',
    '庵堂后面有一口井，井水很甜。',
  ]);
  JY.addFlavor('loc:shaolin', [
    '少林寺的和尚们在练罗汉拳，喊声震得树叶直掉。',
    '藏经阁的老和尚在晒书，一本一本地翻。',
    '山门外有个挑水的少年，走得飞快。',
    '少林寺的素斋很淡，可你吃了三碗。',
    '碑林里的字，有些已经看不清了。',
    '后山的塔林里，埋着历代的高僧。',
  ]);
  JY.addFlavor('loc:wudang', [
    '武当山上，道士们在练一种很慢的拳。',
    '紫霄宫的香火很旺。',
    '山涧边，一个老道士在看两只鸟打架，看得很入神。',
    '武当的道士们说话都慢条斯理的。',
    '山上的松树长得很直，像一排剑。',
    '你在山道上遇见几个年轻道士，个个都很有礼貌。',
  ]);
  JY.addFlavor('loc:jiaxing', [
    '南湖上的烟雨楼，雨天看最好。',
    '嘉兴的粽子很好吃，你一口气吃了四个。',
    '城外有座铁枪庙，破得只剩下半边。',
    '陆家庄的大门上，留着几个褪了色的手印。',
    '河边的船娘在唱歌，唱的是采莲。',
    '嘉兴城里的人都知道，十八年前有一场大比武。',
  ]);
})();

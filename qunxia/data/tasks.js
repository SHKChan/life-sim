/* 群侠 · 修炼小事与托付
 * 修炼小事：train: true，每练三次功碰上一件（牌堆轮着来），可以用 cond 限定武功、地点、门派。
 * 托付：重要人物托你办的事，用 who + act + minAff（要熟到哪一档）写成几段；g.task(id, 文字) 记下，g.taskDone(id, 文字) 办完。 */
(function () {
  'use strict';
  const QX = window.QX;

  /* ---------- 小工具：找你会的某一类武功、卡在关口上的那一门 ---------- */
  const mine = (g, type) => Object.keys(g.S.arts).filter((id) => QX.ARTS[id] && (!type || QX.ARTS[id].type === type));
  const hasType = (g, type, lv) => mine(g, type).some((id) => g.lv(id) >= (lv || 1));
  const gateArt = (g, type) => mine(g, type).find((id) => QX.atGate(id));
  const topArt = (g, type) => mine(g, type).sort((a, b) => g.lv(b) - g.lv(a))[0];
  // 卡在关口上就破关；没卡住就给练得最深的那一门添一截长进
  const push = (g, type, how, n) => {
    const id = gateArt(g, type);
    if (id && g.breakGate(id, how)) return true;
    const t = topArt(g, type);
    if (t && g.S.arts[t]) g.S.arts[t].xp += n || 12;
    return false;
  };
  const EVIL = ['jiuyin_zhua', 'xuanming', 'qianzhu'];
  const evilArt = (g) => EVIL.filter((id) => g.lv(id) >= 1).sort((a, b) => g.lv(b) - g.lv(a))[0];
  const HIGH = ['emei', 'wudang', 'zhongnan', 'guangming'];

  /* ---------- 修炼小事 ---------- */
  QX.addEvents([
    { id: 'tr_dawn', train: true, once: false, w: 2, t: '鸡叫',
      text: (g) => g.pick(['天还没亮，远处的鸡叫了头遍。你练完一趟，身上冒着白气。', '你练到半夜，月亮挪到了屋檐的另一头。']),
      choices: [
        { t: '接着练到日出', fx: (g) => { push(g, '', '：天亮的那一刻，你忽然想通了卡住的地方', 14); g.hurt(10); }, res: '太阳出来的时候，你的手脚都是热的。' },
        { t: '回去睡一觉', fx: (g) => g.restMp(40), res: '你睡得很沉，醒来时精神很好。' },
      ] },
    { id: 'tr_passer', train: true, once: false, w: 1.5, t: '过路人',
      text: '一个挑担子的老汉在路边歇脚，看你练了半天，忍不住笑出了声。',
      choices: [
        { t: '请他说说笑什么', check: ['资质', '中'], fx: (g) => { push(g, '', '：老汉一句“你脚跟没落地”，把你点醒了', 16); g.add('品德', 1); },
          res: '老汉说他年轻时在镖局走过镖，你这一招脚跟没落地。你照着改了，果然稳了。', fail: { fx: (g) => g.add('声望', -1), res: '老汉摆摆手，说他就是觉得好玩。你脸上有点挂不住。' } },
        { t: '不理他，接着练', fx: (g) => g.add('根骨', 0.3), res: '老汉挑起担子走了。你又练了一个时辰。' },
      ] },
    { id: 'tr_xinmo', train: true, once: false, t: '心魔', cond: (g) => g.st('品德') < 40,
      text: '你练到一半，眼前晃过几张脸，都是被你欺负过的人。心里有一股狠劲往上冒，手上的力气大得吓人。',
      choices: [
        { t: '由着那股狠劲练下去', fx: (g) => { push(g, '', '：你由着那股狠劲往前冲，关口竟被冲开了', 22); g.add('品德', -3); g.set('xinmoFed'); }, res: '你练得满身是汗，眼睛发红。那几张脸不见了，狠劲还在。' },
        { t: '停下来，坐到天亮', check: ['资质', '中'], fx: (g) => { g.add('品德', 3); g.restMp(30); }, res: '你坐了一夜。天亮的时候，那几张脸淡了，心里空出一块。',
          fail: { fx: (g) => { g.injure(1); g.hurt(30); }, res: '你越想压越压不住，一口气堵在胸口，吐了一口血。' } },
      ] },
    { id: 'tr_xinmo2', train: true, t: '心魔又来', cond: (g) => g.f('xinmoFed') && g.st('品德') < 45,
      text: '那股狠劲又来了，这回来得更早，更凶。你一拳打在树上，树皮掉了一大块，你却没觉得疼。',
      choices: [
        { t: '再顺着它一回', check: ['根骨', '难'], fx: (g) => { g.add('攻击', 2); g.add('内力', 2); g.add('品德', -4); }, res: '你顺着它一直练到力竭。醒来以后，出手比从前快了，下手也比从前狠了。',
          fail: { fx: (g) => { g.injure(2); g.hurt(60); g.add('品德', -2); }, res: '真气顺着狠劲乱走，你倒在地上，半天爬不起来。' } },
        { t: '扔下兵器，去镇上找人说说话', fx: (g) => { g.unset('xinmoFed'); g.add('品德', 5); g.days(3); }, res: '你在镇上的茶馆坐了三天，听人说家长里短。那股狠劲慢慢退了。' },
      ] },
    { id: 'tr_muren', train: true, once: false, t: '木人桩', cond: (g) => g.at('shaolin') && hasType(g, '拳掌'),
      text: '登封镇外有一片空地，立着几十根木人桩，桩上的漆早被打光了。少林的俗家弟子天不亮就来打桩。',
      choices: [
        { t: '跟着他们打桩', check: ['根骨', '中'], fx: (g) => { push(g, '拳掌', '：木人桩挨了你一千下，你也挨了它一千下，拳路通了', 18); g.add('根骨', 0.5); },
          res: '你的手背肿了三天。消肿以后，拳头落得又准又沉。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '桩臂转回来正撞在你胸口，你闷了好几天。' } },
        { t: '捐十两香火，请武僧拆一回桩给你看', cost: { 银两: 10 }, check: ['资质', '中', 12], fx: (g) => push(g, '拳掌', '：武僧拆了一回桩，你看出了他出拳前那一下沉肩', 18),
          res: '武僧拆得很慢，一招一招。你看出了门道。', fail: { res: '武僧拆得太快，你只看见满场的影子。' } },
        { t: '在一边看看就走', res: '你看了一会儿，回客店去了。' },
      ] },
    { id: 'tr_peek', train: true, t: '林子里的剑光', cond: (g) => g.at('emei') && g.sect !== 'emei',
      text: '你在后山的林子里练功，听见不远处有剑声。几个峨嵋女弟子在空地上对剑，剑光一闪一闪。',
      choices: [
        { t: '躲在松树后面看', check: ['轻功', '中'], fx: (g) => { g.add('攻击', 1); g.add('轻功', 0.5); g.add('品德', -2); g.set('peekEmei'); },
          res: '你看了一个时辰，记下了好几处脚步。走的时候踩断了一根枯枝，有人回头看了一眼。', fail: { fx: (g) => { g.hurt(30); g.add('声望', -2); }, res: '一柄剑贴着你的耳朵钉进了树干。“偷看峨嵋练剑，滚下山去。”' } },
        { t: '上前拱手讨教', need: ['品德', 55], fx: (g) => { g.add('声望', 2); g.like('jingxuan', 6); }, res: '领头的女弟子打量你半天，说峨嵋的剑不外传，可你这份坦荡她会告诉师姐。' },
        { t: '换个地方练', fx: (g) => g.add('品德', 1), res: '你往山下走了一里地，剑声听不见了。' },
      ] },
    { id: 'tr_peek_caught', loc: 'emei', arrive: true, cond: (g) => g.f('peekEmei') && g.sect !== 'emei', t: '被认出来',
      text: '你刚上石阶，几个峨嵋女弟子就围了过来。其中一个指着你：“那天在后山偷看的，就是他。”',
      choices: [
        { t: '认了，赔个不是', fx: (g) => { g.unset('peekEmei'); g.add('品德', 3); g.add('声望', -2); }, res: '她们骂了你半天，罚你在山门外站了一夜，这事就算了。' },
        { t: '不认，要走', fight: { foes: ['emdizi', 'emdizi'], win: { fx: (g) => { g.unset('peekEmei'); g.add('声望', 3); g.add('品德', -3); g.like('jingxuan', -10); }, res: '你夺路下了山。峨嵋从此记住了你的样子。' },
          lose: { fx: (g) => { g.unset('peekEmei'); g.add('声望', -3); }, res: '你被打倒在石阶上。她们没要你的命，只把你扔下了山。' } } },
      ] },
    { id: 'tr_rain', train: true, once: false, t: '雨中', cond: (g) => hasType(g, '兵器'),
      text: '练到一半下起了雨，雨越下越大，打在剑身上沙沙地响。',
      choices: [
        { t: '冒雨练到雨停', check: ['根骨', '易'], fx: (g) => push(g, '兵器', '：雨点打在剑上，你一剑一剑去挑，忽然看清了剑路', 16), res: '雨停的时候，你浑身湿透，剑却比来时听话了。',
          fail: { fx: (g) => { g.injure(1); g.hurt(25); }, res: '你着了凉，发了两天烧，寒气钻进了胸口。' } },
        { t: '躲到屋檐下看雨', fx: (g) => { g.add('资质', 0.5); g.restMp(30); }, res: '雨从檐角一串一串落下来。你看着看着，心静了。' },
      ] },
    { id: 'tr_zouhuo', train: true, once: false, t: '走火边缘', cond: (g) => hasType(g, '内功', 3) && g.inj() < 3,
      text: '你打坐到第三天，丹田里一股热气乱撞，一会儿往上冲，一会儿往下沉。再走错一步，就要走火入魔了。',
      choices: [
        { t: '顺着它冲关', check: ['根骨', '难'], fx: (g) => { push(g, '内功', '：那股热气撞开了关口，一下子走遍了全身', 20); g.add('内力', 2); },
          great: { fx: (g) => { push(g, '内功', '：那股热气撞开了关口，一下子走遍了全身', 30); g.add('内力', 5); }, res: '热气冲过关口，又绕了一个周天，回到丹田的时候稳稳的。你从没觉得这么清爽。' },
          res: '热气冲过关口，慢慢落回了丹田。你睁开眼，天已经黑了。', fail: { fx: (g) => { g.injure(2); g.hurt(60); }, res: '热气冲到胸口散开了。你喷出一口血，倒在蒲团上。' } },
        { t: '运足内力，引着它慢慢走一个周天', cost: { 内力: 30 }, check: ['根骨', '难', 15], fx: (g) => { push(g, '内功', '：你引着那股热气一寸一寸走完周天，关口自己开了', 20); g.add('内力', 1); },
          res: '你耗了大半的内力，热气总算被你引顺了。', fail: { fx: (g) => { g.injure(1); g.hurt(30); }, res: '内力接不上，热气在半路散了，你胸口闷了好几天。' } },
        { t: '散了这口气，不冒险', fx: (g) => g.add('内力', -1), res: '你慢慢把气散了。这几天算是白练了，可人还好好的。' },
      ] },
    { id: 'tr_waterfall', train: true, once: false, t: '瀑布', cond: (g) => g.at('dali') && hasType(g, '拳掌'),
      text: '苍山脚下有一道瀑布，水从十几丈高的崖上砸下来，潭边的石头都被砸出了坑。',
      choices: [
        { t: '站到瀑布底下对着水出掌', check: ['根骨', '中'], fx: (g) => { push(g, '拳掌', '：瀑布压在你肩上，你一掌一掌推回去，掌力透了出来', 18); g.add('根骨', 0.5); },
          res: '你在水底下站了半天，出来时浑身发紫。可那一掌推出去，水花炸开了一大片。', fail: { fx: (g) => { g.hurt(50); g.injure(1); }, res: '水把你砸倒在潭里，你呛了好几口水，胸口疼了好几天。' } },
        { t: '坐在潭边，想洱海边唱的那个皇帝', cond: (g) => g.f('heardYideng'), fx: (g) => { if (g.lv('yiyang')) push(g, '拳掌', '：你想起歌里那个皇帝的手指，一阳指的劲忽然顺了', 20); else g.add('资质', 1); g.add('品德', 1); },
          res: '歌里说，那个皇帝的手指一点，死人都能救活。你看着自己的手指，看了很久。' },
        { t: '在潭边打坐', fx: (g) => g.restMp(50), res: '水声很大，坐久了反倒听不见了。' },
      ] },
    { id: 'tr_newmove', train: true, t: '悟出一招', cond: (g) => hasType(g, '', 4) && !g.f('ownMove'),
      text: (g) => '你练' + QX.ARTS[topArt(g, '')].name + '练到一半，手上自己走出了一个招式里没有的变化。你停下来，又比划了一遍。',
      choices: [
        { t: '关起门来把这一招琢磨透', check: ['资质', '难'], fx: (g) => { g.set('ownMove'); g.add('攻击', 2); push(g, '', '：你把那个变化想透了，卡住的地方也跟着通了', 15); },
          res: '你琢磨了三天三夜，那个变化成了一招。这一招是你自己的，谁也没教过。', fail: { fx: (g) => g.add('资质', 0.5), res: '你想了三天，那个变化再也找不回来了。' } },
        { t: '找个人试试这一招', fight: { foes: ['jianke'], win: { fx: (g) => { g.set('ownMove'); g.add('声望', 3); }, res: '那个背剑的年轻人被你这一招逼退了三步，愣了半天：“这是哪一派的？”你说，是你自己的。' },
          lose: { res: '这一招还没练熟，被人一下就拆了。' } } },
        { t: '记在心里，以后再说', fx: (g) => g.add('资质', 0.5), res: '你把那个变化记下了，接着按老路子练。' },
      ] },
    { id: 'tr_teachkid', train: true, t: '看你练功的孩子', cond: (g) => g.f('ownMove'),
      text: '这几天总有个放牛的孩子蹲在田埂上看你练功。今天他终于走过来，问你那一招能不能教他。',
      choices: [
        { t: '教他', fx: (g) => { g.set('kidStudent'); g.add('品德', 3); g.add('声望', 1); g.days(3); }, res: '你教了他三天。他学得慢，可是一遍一遍地练，一声苦也没喊。' },
        { t: '收他几文钱再教', fx: (g) => { g.add('银两', 3); g.add('品德', -1); }, res: '孩子把攒了很久的几文钱给了你。你教了他半天，他就回去放牛了。' },
        { t: '打发他走', res: '孩子低着头走了，以后再没来过。' },
      ] },
    { id: 'tr_kid2', train: true, t: '那个孩子又来了', cond: (g) => g.f('kidStudent'),
      text: '那个放牛的孩子又来了，个子高了一截。他把你教的那一招打给你看，最后一下却拐了个弯，跟你教的不一样。',
      choices: [
        { t: '问他为什么拐弯', fx: (g) => { push(g, '', '：孩子那一拐，正好补上了你这一招的空门', 22); g.add('品德', 1); }, res: '孩子说，照你那样打，他的胳膊老是够不着。你想了一夜，发现你自己也一直够不着。' },
        { t: '收下他带来的东西', fx: (g) => { g.give('renshen', 1); g.add('品德', 1); }, res: '他从怀里摸出一支老山参，说是他爹上山挖的，让他一定带给师父。' },
      ] },
    { id: 'tr_cliff', train: true, once: false, t: '山崖', cond: (g) => HIGH.includes(g.loc) && hasType(g, '轻功'),
      text: '山上有两块大石，中间隔着一道山缝，底下看不见底。山里的猎户说，从前有人在这里练过轻功。',
      choices: [
        { t: '在两块石头之间来回纵跃', check: ['轻功', '中'], fx: (g) => { push(g, '轻功', '：你在山缝上空换了一口气，身子轻得像没有分量', 18); g.add('轻功', 0.5); },
          res: '跳到第三十趟，你落脚的时候一点声音也没有了。', fail: { fx: (g) => g.hurt(45), res: '你脚下一滑，抓着石缝上的老藤才没掉下去，手掌磨得全是血。' } },
        { t: '想想古墓前那片野花，静下心再跳', cond: (g) => g.f('sawGumu'), fx: (g) => { push(g, '轻功', '：心一静，身子就轻了', 18); g.add('品德', 1); }, res: '你想起终南山后那座古墓，想起墓前那片开得很好的野花。再跳的时候，心里没有了怕。' },
        { t: '算了，太险', res: '你看了一眼山缝，回去了。' },
      ] },
    { id: 'tr_inj', train: true, once: false, t: '带着伤', cond: (g) => g.inj() >= 1,
      text: '你身上的内伤还没好，练到一半，胸口一阵一阵地疼。',
      choices: [
        { t: '停下来运功疗伤', check: ['根骨', '中'], fx: (g) => { g.days(5); if (g.inj() > 2) g.cure(1); g.restMp(20); }, res: '你运功五天，胸口松了一些。伤重的那几层，还得找大夫。',
          fail: { fx: (g) => g.days(5), res: '你运了五天功，气血还是乱的。' } },
        { t: '咬着牙接着练', check: ['根骨', '难'], fx: (g) => push(g, '', '：疼到极处，你反倒看清了真气走的那条路', 20), res: '你练得满头冷汗。练完以后，伤还在，功夫却长了。',
          fail: { fx: (g) => { g.injure(1); g.hurt(40); }, res: '你眼前一黑，伤又重了一层。' } },
        { t: '煎大理药铺掌柜给的方子', cond: (g) => g.f('yaoFriend'), fx: (g) => { g.cure(1); g.days(3); }, res: '掌柜的方子苦得要命。喝了三天，胸口不那么闷了，内伤好了一层。' },
      ] },
    { id: 'tr_mer', train: true, once: false, t: '断了的经脉', cond: (g) => g.mer(),
      text: '真气走到胸口就断了，像水流到断崖边上。你试了好几回，都过不去。',
      choices: [
        { t: '运足内力，绕开断处，从别的经脉走', cost: { 内力: 25 }, check: ['资质', '极难', 15], fx: (g) => g.cureMer('你绕了七八条岔路，真气终于从另一头接上了。断了的经脉慢慢长好了。'),
          res: '你在地上躺了一天，起来的时候，真气又能走满全身了。', fail: { fx: (g) => { g.injure(1); g.hurt(40); }, res: '真气在岔路上撞了墙，你胸口一阵剧痛，内伤又重了。' } },
        { t: '照大理药铺掌柜说的，用艾灸慢慢通', cond: (g) => g.f('yaoFriend'), check: ['资质', '中'], fx: (g) => { g.days(15); g.cureMer('掌柜教的艾灸法子，你天天在胸口熏一回。半个月以后，断处有了一点暖意，经脉接上了。'); },
          res: '你身上全是艾草味。', fail: { fx: (g) => { g.days(15); g.cure(1); }, res: '艾灸了半个月，经脉还是断着，内伤倒是轻了一层。' } },
        { t: '不再硬冲，养着', fx: (g) => g.restMp(30), res: '你停了下来。断了的经脉，还得找高人或者奇药来接。' },
      ] },
    { id: 'tr_quanzhen', train: true, once: false, t: '早课', cond: (g) => g.sect === 'quanzhen' && g.at('zhongnan'),
      text: (g) => '重阳宫的早课是打坐，一坐就是一个时辰。' + (g.f('qzJoke') ? '监院走过你身边，低声说：“祖师爷老了，你可还年轻，坐直了。”' : '监院拿着戒尺在殿里走来走去。'),
      choices: [
        { t: '老老实实坐满一个时辰', fx: (g) => { g.add('内力', 2); push(g, '内功', '：坐到第一百天，全真心法的关口自己开了', 14); }, res: '你坐得腿都麻了。站起来的时候，丹田里暖洋洋的。' },
        { t: '溜到后山去把剑练快一点', check: ['资质', '中'], fx: (g) => { push(g, '兵器', '：快到极处，你忽然明白了全真剑为什么要慢', 16); }, res: '你把剑练得飞快，快到后来反倒慢了下来。',
          fail: { fx: (g) => { g.addContrib(-1); g.add('品德', -1); }, res: '监院在后山等着你。你抄了十天经，门中的功劳也记了一笔过。' } },
      ] },
    { id: 'tr_emei', train: true, once: false, t: '金顶夜寒', cond: (g) => g.sect === 'emei' && g.at('emei'),
      text: '金顶的夜里很冷，剑握在手里像握着一块冰。同门都睡了，你一个人在雪地上练剑。',
      choices: [
        { t: '照静玄师姐教的，一剑一剑求稳', fx: (g) => { push(g, '兵器', '：你把一招练了三百遍，稳到闭着眼也不偏', 16); g.add('防御', 0.5); }, res: '练到后半夜，你的剑尖一点也不抖了。' },
        { t: '照师父教的截手九式，练那股狠劲', cond: (g) => g.f('miejueFavor') && g.lv('jieshou') >= 1, fx: (g) => { push(g, '拳掌', '：你想着师父出手时那张脸，截手的劲终于透了出去', 18); g.add('品德', -1); }, res: '雪地上全是你的脚印，一圈套着一圈。' },
        { t: '回屋里暖和暖和', fx: (g) => g.restMp(30), res: '你搓着手回了屋。' },
      ] },
    { id: 'tr_gaibang', train: true, once: false, t: '讨饭的步子', cond: (g) => g.sect === 'gaibang',
      text: '你在城里讨饭，被一户大户人家的恶狗追了三条街。一个老叫化蹲在墙根下看着你，直乐。',
      choices: [
        { t: '回身用莲花掌赶狗', check: ['轻功', '易'], fx: (g) => push(g, '拳掌', '：赶了三条街的狗，掌法里多了几分活气', 14), res: '恶狗夹着尾巴跑了。老叫化说，丐帮的掌法，就是这么练出来的。',
          fail: { fx: (g) => g.hurt(25), res: '狗咬住了你的裤腿，扯下一大块。老叫化笑得更大声了。' } },
        { t: '请老叫化教你躲狗的步子', fx: (g) => { g.add('轻功', 1); g.add('品德', 1); }, res: '老叫化教你的步子歪歪扭扭，可狗再也扑不着你了。' },
      ] },
    { id: 'tr_mingjiao', train: true, once: false, t: '背石头', cond: (g) => g.sect === 'mingjiao' && g.at('guangming'),
      text: '锐金旗的兄弟每天背石头上山修墙。石头一块比一块大，山路一天比一天陡。',
      choices: [
        { t: '背最大的那块', check: ['根骨', '中'], fx: (g) => { g.add('根骨', 1); push(g, '拳掌', '：背了一个月的石头，拳头里有了石头的分量', 14); }, res: '你背着石头走了一个月，腰板硬了，拳头也沉了。',
          fail: { fx: (g) => { g.injure(1); g.hurt(40); }, res: '石头压得你闪了腰，躺了好几天。' } },
        { t: '请庄旗使看你打一趟拳', cond: (g) => g.alive('zhuangzheng') && g.here('zhuangzheng'), fx: (g) => { push(g, '拳掌', '：庄铮在你背上拍了一巴掌：“腰！”你一下就懂了', 18); g.like('zhuangzheng', 5); },
          res: '庄铮看完，只说了一个字：“腰。”你照着改了，拳头果然重了。' },
        { t: '坐在圣火前念一遍教规', fx: (g) => { g.add('品德', 1); g.restMp(40); }, res: '火光照在你脸上。你念完了，心里定了一些。' },
      ] },
    { id: 'tr_taiji', train: true, t: '那个圆', cond: (g) => g.f('sawTaiji'),
      text: '你又想起武当山上那一天。张真人一招一招地教，教完问记住了几招，记住的越少越好。',
      choices: [
        { t: '照着那天看见的，慢慢画一个圆', need: ['品德', 55], fx: (g) => { g.add('防御', 1); push(g, '', '：你画完了一个圆，卡住的地方被圆转了过去', 18); }, res: '你画了一个圆，又画了一个。画到后来，手里的力气不知道去了哪里，又不知道从哪里回来了。' },
        { t: '想不通，就不想了', fx: (g) => g.add('资质', 0.5), res: '你接着练自己的功夫。那个圆还在心里，慢慢地转。' },
      ] },
    { id: 'tr_evil', train: true, once: false, t: '指尖发黑', cond: (g) => !!evilArt(g),
      text: (g) => '你练' + QX.ARTS[evilArt(g)].name + '练到半夜，指尖一阵阵发痒，发黑。那门功夫像在催你，要你找点活的东西试一试。',
      choices: [
        { t: '去乱坟岗练到天亮', fx: (g) => { const id = evilArt(g); if (QX.atGate(id)) g.breakGate(id, '：乱坟岗上的一夜，你心里又冷了一分'); else g.S.arts[id].xp += 20; g.add('品德', -4); }, res: '天亮的时候，你的手不痒了。路过的樵夫看见你，绕了很远的路。' },
        { t: '把手泡进冷水里压住它', check: ['根骨', '中'], fx: (g) => g.add('品德', 2), res: '你泡了一夜，指尖的黑气退了。你想，这功夫是不是该少练些。',
          fail: { fx: (g) => { g.injure(1); g.hurt(30); }, res: '那股阴毒顺着手臂往里钻，你在冷水边疼得打滚。' } },
      ] },
    { id: 'tr_song_tiyun', train: true, t: '宋大侠指点', cond: (g) => g.at('wudang') && g.f('songHope') && hasType(g, '轻功') && g.alive('songyuanqiao') && g.here('songyuanqiao'),
      text: '你在武当山的松林里练轻功，宋远桥从山道上走过，停下来看了一会儿。他还记得你替他跑蝴蝶谷那一趟。',
      choices: [
        { t: '请宋大侠指点', fx: (g) => { push(g, '轻功', '：宋远桥只说了一句“气要在落地前换”', 22); g.like('songyuanqiao', 5); }, res: '宋远桥纵身一跃，在半空换了一口气，又高了一截。“看清了？”你看清了。' },
        { t: '不好意思打扰他', fx: (g) => g.add('资质', 0.5), res: '你远远行了个礼。宋远桥点点头，走了。你照着他走路的样子，练了一下午。' },
      ] },
  ]);

  /* ---------- 托付一：俞岱岩，打听当年折断他四肢的人 ---------- */
  QX.addEvents([
    { id: 'tk_yu1', who: 'yudaiyan', act: '听俞三侠说当年的事', minAff: '熟', cond: (g) => !g.f('yuCured') && !g.hasTask('tk_yu') && !g.f('knowAsan'), t: '二十年前',
      text: '俞岱岩说，二十年前他护送一把刀，在江边被人暗算。那人十根手指像铁打的，一根一根捏断了他的骨头。他没看清那人的脸，只记得那双手。',
      choices: [
        { t: '答应替他打听那个人', fx: (g) => { g.task('tk_yu', '替俞岱岩打听当年折断他四肢的人'); g.like('yudaiyan', 10); }, res: '俞岱岩看着你，眼睛里有一点光。“你小心。那人的指力，天下少有。”' },
        { t: '劝他别再想了', fx: (g) => g.like('yudaiyan', -3), res: '俞岱岩笑了笑，没有说话。他还是天天在想那双手。' },
      ] },
    { id: 'tk_yu2', loc: 'dadu', arrive: true, cond: (g) => g.hasTask('tk_yu') && !g.f('knowAsan') && g.alive('asan') && g.before(135, 4), t: '酒楼里的光头',
      text: '大都的酒楼里，一个光头大汉在捏核桃，一捏一个粉碎。他喝多了，拍着桌子跟人吹，说二十年前在江边捏碎过武当俞三侠的骨头。',
      choices: [
        { t: '凑过去陪他喝，套出他的来历', check: ['根骨', '中'], fx: (g) => { g.set('knowAsan'); g.set('asanHeiyu'); g.rumor('传闻：金刚门的阿三怀里揣着一盒黑玉断续膏，说是能接断骨。', { loc: 'dadu' }); },
          res: '他叫阿三，是西域金刚门的弟子，在汝阳王府吃饭。喝到第三坛，他拍着胸口说，怀里那盒黑玉断续膏，断了的骨头都接得上。', fail: { fx: (g) => { g.set('knowAsan'); g.hurt(20); }, res: '你先喝倒了。只记住了他的名字，阿三，汝阳王府的人。' } },
        { t: '当场站起来，替俞三侠讨个说法', fight: { foes: ['asan'], win: { fx: (g) => { g.set('knowAsan'); g.add('声望', 10); if (g.holder('heiyu') === 'asan') g.give('heiyu'); }, res: '阿三被你打翻在桌底下，怀里滚出一只黑盒子。酒楼的人说，他叫阿三，是金刚门的。' },
          lose: { fx: (g) => { g.set('knowAsan'); g.injure(1); }, res: '他的手指戳在你肩上，骨头咯咯地响。你知道了他是谁，代价是半个月抬不起胳膊。' } } },
      ] },
    { id: 'tk_yu2b', loc: 'dadu', arrive: true, cond: (g) => g.hasTask('tk_yu') && !g.f('knowAsan') && (!g.alive('asan') || g.after(135, 4)), t: '打听',
      text: '你在大都打听了好几天。酒楼的伙计说，从前王府里有个捏核桃的光头，叫阿三，常吹他捏断过武当俞三侠的骨头。万安寺那一夜以后，再没人见过他。',
      choices: [
        { t: '记下这个名字', fx: (g) => g.set('knowAsan'), res: '阿三。你把这两个字记在心里。' },
        { t: '再塞伙计几两银子，问细一些', cost: { 银两: 5 }, fx: (g) => { g.set('knowAsan'); g.set('asanHeiyu'); }, res: '伙计说，那人怀里总揣着一盒药，黑乎乎的，说是金刚门的接骨药。' },
      ] },
    { id: 'tk_yu3', who: 'yudaiyan', act: '把打听到的告诉俞三侠', cond: (g) => g.hasTask('tk_yu') && g.f('knowAsan'), t: '阿三',
      text: (g) => '你说出了阿三的名字，说他是西域金刚门的人，在汝阳王府吃饭。俞岱岩闭上眼睛，很久没有睁开。' + (g.f('asanHeiyu') ? '你又说起阿三怀里那盒黑玉断续膏。他的眼睛睁开了，亮了一下，又暗下去。' : ''),
      choices: [
        { t: '只把打听到的告诉他', fx: (g) => { g.taskDone('tk_yu', '你替俞岱岩打听到了当年的仇人。'); g.like('yudaiyan', 15); g.like('songyuanqiao', 8); g.add('品德', 2); }, res: '俞岱岩说：“二十年了，我总算知道他叫什么。”宋远桥在门外听见，进来向你行了个礼。' },
        { t: '答应替他讨回这个公道', cond: (g) => g.alive('asan') && g.before(135, 3), fx: (g) => { g.taskDone('tk_yu', '你替俞岱岩打听到了当年的仇人。'); g.task('tk_yu_asan', '去大都，替俞岱岩向阿三讨回公道'); g.like('yudaiyan', 20); },
          res: '俞岱岩说，别为他去拼命。你说你有分寸。他看着屋顶，眼泪顺着眼角流进了枕头。' },
      ] },
    { id: 'tk_yu4', who: 'asan', act: '替俞三侠讨个公道', cond: (g) => g.hasTask('tk_yu_asan'), t: '公道',
      text: '你站在阿三面前，说了俞岱岩的名字。阿三把核桃往地上一扔：“那个瘫子还活着？好，今天再捏一个。”',
      choices: [
        { t: '动手', fight: { foes: ['asan'], win: { fx: (g) => { g.set('asanCrippled'); g.taskDone('tk_yu_asan', '你替俞岱岩讨回了公道。'); g.add('声望', 12); g.add('品德', 3); if (g.holder('heiyu') === 'asan') g.give('heiyu'); },
          res: '你把他十根手指的骨节一一卸了下来，留了他一条命。他再也捏不碎核桃了。他怀里那只黑盒子，落在了你手里。' },
          lose: { res: '他的手指像铁钳一样。你退了出来，满嘴是血。这件事还没完。' } } },
        { t: '先回去，练好了再来', res: '阿三在背后大笑。你没有回头。' },
      ] },
    { id: 'tk_yu5', who: 'yudaiyan', act: '告诉俞三侠阿三的下场', cond: (g) => g.f('asanCrippled'), t: '那双手',
      text: '你说，阿三的十根手指废了。俞岱岩听完，没有笑，也没有哭。他说：“那双手，我不用再想了。”',
      choices: [
        { t: '把那盒黑玉断续膏拿出来', cond: (g) => g.has('heiyu') && !g.f('yuCured'), fx: (g) => g.like('yudaiyan', 10), res: '你打开盒子，药香满屋。', next: 'wd_yu_heiyu' },
        { t: '陪他坐一会儿', fx: (g) => { g.like('yudaiyan', 10); g.add('品德', 2); }, res: '你们坐到天黑，谁也没说话。临走他说，这一份情，武当记着。' },
      ] },
  ]);

  /* ---------- 托付二：史红石，查分舵里的内鬼 ---------- */
  QX.addEvents([
    { id: 'tk_shi1', who: 'shihongshi', act: '听她说分舵里的怪事', minAff: '熟', cond: (g) => !g.f('fakeBangzhu') && g.alive('shihuolong') && g.before(136, 5) && !g.hasTask('tk_shi') && !g.f('knowFake'), t: '怪事',
      text: (g) => '史红石说，她爹从前每天早上要打一趟降龙掌，现在不打了。她去给爹送饭，爹不认得她最爱吃的东西。' + (g.f('cylWary') ? '她小声说，陈友谅天天守在她爹身边，你那天没喝他的酒，她看见了。' : '她说这话的时候，一直盯着庙门口的陈友谅。'),
      choices: [
        { t: '答应替她查', fx: (g) => { g.task('tk_shi', '替史红石查襄阳分舵里是谁在弄鬼'); g.like('shihongshi', 10); }, res: '史红石没哭，只是点了点头：“你查到了，先告诉我。”' },
        { t: '劝她别多想', fx: (g) => g.like('shihongshi', -5), res: '史红石低下头，接着缝她的麻袋。' },
      ] },
    { id: 'tk_shi2', loc: 'xiangyang', explore: 'xiangyang', w: 5, cond: (g) => g.hasTask('tk_shi') && !g.f('knowFake') && g.alive('shihuolong') && g.alive('chenyouliang') && !g.f('cylDown'), t: '后门',
      text: '半夜，陈友谅从破庙后门溜了出去，往城外走。他手里提着一盏灯笼，灯笼没点。',
      choices: [
        { t: '远远跟着他', check: ['轻功', '中'], fx: (g) => { g.set('knowFake'); g.set('cylMonk'); },
          res: '城外的荒庙里，陈友谅跪在一个和尚面前，叫他师父。和尚说话很和气，手又白又细。他们说起了庙里那个帮主，说那个人只管装下去。', fail: { fx: (g) => { g.set('cylAlert'); g.hurt(20); }, res: '你踩翻了一块石头。陈友谅回头，灯笼一下子点亮了。你只好装成解手的，他看了你很久。' } },
        { t: '花二十两请个小叫化盯着他', cost: { 银两: 20 }, fx: (g) => g.set('knowFake'), res: '小叫化盯了三天，回来说，陈友谅跟帮主说话像是在吩咐下人。帮主一开口，是北边的口音。' },
        { t: '今晚算了', res: '你翻了个身，接着睡。' },
      ] },
    { id: 'tk_shi3', who: 'shihongshi', act: '把查到的告诉她', cond: (g) => g.hasTask('tk_shi') && g.f('knowFake'), t: '内鬼',
      text: (g) => '你说，坐在庙里的那个帮主是假的，陈友谅在后面牵着线。' + (g.f('cylMonk') ? '你还说，你看见陈友谅在城外给一个和尚磕头，那和尚的手又白又细。' : '') + '史红石咬着嘴唇，一个字一个字地听完。',
      choices: [
        { t: '告诉她，约好一起揭穿', fx: (g) => { g.taskDone('tk_shi', '你替史红石查清了分舵里的内鬼。'); g.like('shihongshi', 15); g.add('品德', 2); }, res: '史红石说：“我就知道。”她把麻袋针往桌上一插，“你说，什么时候。”' },
        { t: '先去告诉传功长老，替她找个靠山', cond: (g) => g.alive('gb_chuangong'), fx: (g) => { g.taskDone('tk_shi', '你替史红石查清了分舵里的内鬼。'); g.set('chuangongBacks'); g.like('gb_chuangong', 15); g.like('shihongshi', 8); },
          res: '传功长老听完，从草堆上坐了起来，眼睛也不眯了。“老叫化早看那胖子不顺眼。你要揭他，老叫化给你压阵。”' },
      ] },
    { id: 'tk_shi_ambush', loc: 'xiangyang', arrive: true, cond: (g) => g.f('cylAlert') && g.alive('chenyouliang') && !g.f('cylDown') && !g.f('fakeBangzhu'), t: '巷子里',
      text: '你刚进城，就被几个污衣帮众堵在了巷子里。领头的说：“陈长老问你，那天夜里出城做什么？”',
      choices: [
        { t: '动手', fight: { foes: ['egai', 'egai'], win: { fx: (g) => { g.unset('cylAlert'); g.add('声望', 3); g.set('knowFake'); }, res: '你打翻了他们。一个帮众躺在地上嘀咕：“假帮主的事，你知道又怎样。”他说漏了嘴。' },
          lose: { fx: (g) => { g.unset('cylAlert'); g.add('银两', -Math.round(g.money() / 3)); }, res: '你被打了一顿，钱袋也被抢了。他们说，再多管闲事，扔进汉水。' } } },
        { t: '喊传功长老', cond: (g) => g.f('chuangongBacks'), fx: (g) => { g.unset('cylAlert'); g.add('声望', 2); }, res: '巷子口传来一声咳嗽。传功长老拄着竹棍站在那里，几个帮众一声不吭地散了。' },
        { t: '翻墙跑', check: ['轻功', '易'], fx: (g) => g.unset('cylAlert'), res: '你翻过两道墙，甩掉了他们。', fail: { fx: (g) => { g.hurt(40); g.unset('cylAlert'); }, res: '你翻墙的时候挨了一棍，摔在别人家的院子里。' } },
      ] },
    { id: 'tk_shi_monk', loc: 'shaolin', arrive: true, cond: (g) => g.f('cylMonk') && g.f('heardChengkun') && !g.f('knowChengkun') && g.alive('yuanzhen') && g.here('yuanzhen'), t: '那双手',
      text: '你在少林寺的大殿前看见了圆真。他正在给香客讲经，双手合十，手又白又细。襄阳城外那座荒庙里的和尚，就是他。',
      choices: [
        { t: '把两件事连起来', fx: (g) => { g.set('knowChengkun'); g.add('资质', 0.5); }, res: '你听人说过成昆的手，陈友谅又管这双手叫师父。圆真就是成昆。你低下头，从他身边走了过去。' },
        { t: '也许看错了', fx: (g) => g.unset('cylMonk'), res: '天下手白的和尚多了。你没再想。' },
      ] },
  ]);

  /* ---------- 托付三：宋远桥，五弟的遗孤 ---------- */
  QX.addEvents([
    { id: 'tk_song1', who: 'songyuanqiao', act: '听宋大侠说五弟的事', minAff: '熟', cond: (g) => g.before(134, 6) && !g.hasTask('tk_song') && !g.f('wujiNews'), t: '五弟',
      text: (g) => (g.f('wdKind') ? '宋远桥说，山道上的小道童提起过你。' : '') + '他说起五弟张翠山，说得很慢。五弟死在师父的寿宴上，留下一个孩子叫无忌，身上中了寒毒。那年孩子跟着一个姓常的汉子去了淮北求医，以后就没了音信。',
      choices: [
        { t: '答应去蝴蝶谷打听', fx: (g) => { g.task('tk_song', '替宋远桥去蝴蝶谷打听五弟遗孤无忌的下落'); g.like('songyuanqiao', g.f('wdKind') ? 15 : 10); }, res: '宋远桥站起来，向你深深一揖。“有劳。师父嘴上不说，心里天天记着。”' },
        { t: '说你路不熟，怕误了事', res: '宋远桥说不妨，又去教小道童扎马步了。' },
      ] },
    { id: 'tk_song2', who: 'changyuchun', act: '问他当年那个姓张的孩子', cond: (g) => g.hasTask('tk_song') && !g.f('wujiNews'), t: '那个孩子',
      text: '常遇春听你说起武当，一下子站了起来。他说那孩子在谷里跟胡先生学了两年医，身上的寒毒没去根，后来带着一个小姑娘往西去了，去了昆仑。“那么小的孩子，走了几千里。”',
      choices: [
        { t: '记下，回武当报信', fx: (g) => g.set('wujiNews'), res: '常遇春说，你见了宋大侠，替他磕个头。他说那孩子是个好孩子。' },
        { t: '陪他给胡先生磕个头再走', fx: (g) => { g.set('wujiNews'); g.set('cycGrave'); g.like('changyuchun', 10); g.days(1); }, res: '你们在胡青牛的坟前磕了头。常遇春说，那孩子在这里的时候，天天给胡先生煎药。' },
      ] },
    { id: 'tk_song3', who: 'songyuanqiao', act: '把无忌的消息带回武当', cond: (g) => g.hasTask('tk_song') && g.f('wujiNews'), t: '消息',
      text: (g) => '你把常遇春的话一句一句说给宋远桥听。' + (g.after(134, 6) ? '宋远桥说，光明顶上那个曾阿牛，江湖上已经传开了，就是无忌。他听你说完小时候的事，眼睛红了。' : '宋远桥听到“往西去了”，半天没说话。'),
      choices: [
        { t: '照实说，孩子多半还活着', fx: (g) => { g.taskDone('tk_song', '你把无忌的消息带回了武当。'); g.set('songHope'); g.like('songyuanqiao', 20); g.add('声望', 5); }, res: '宋远桥说，活着就好。他转身去后山，把这话说给五弟的坟听。' },
        { t: '再替他捎一封信给无忌的外公', cond: (g) => g.alive('yintianzheng'), fx: (g) => { g.taskDone('tk_song', '你把无忌的消息带回了武当。'); g.set('songHope'); g.task('tk_song_yin', '把宋远桥的信交给天鹰教的殷天正'); g.like('songyuanqiao', 15); },
          res: '宋远桥沉吟了很久，写了一封信。“殷老爷子和我武当有心结。可孩子是两家的孩子。”' },
      ] },
    { id: 'tk_song4', who: 'yintianzheng', act: '把宋远桥的信交给他', cond: (g) => g.hasTask('tk_song_yin'), t: '一封信',
      text: '殷天正接过信，看了一遍，又看了一遍。他的白眉毛抖了一下：“武当的人，肯给老夫写信了。”',
      choices: [
        { t: '交了信，站着等他回话', fx: (g) => { g.taskDone('tk_song_yin', '你把宋远桥的信交到了殷天正手里。'); g.set('tianyingFriend'); g.like('yintianzheng', 20); g.add('声望', 5); }, res: '殷天正说：“回去告诉宋大侠，那孩子也是我殷家的骨肉。”他让人送你出门，送了很远。' },
        { t: '路上先拆开看过了', fx: (g) => { g.taskDone('tk_song_yin', '你把宋远桥的信交到了殷天正手里。'); g.like('yintianzheng', -10); g.add('品德', -4); }, res: '殷天正看了一眼信封上的折痕，冷冷地说：“信送到了，你可以走了。”' },
      ] },
  ]);

  /* ---------- 托付四：老船夫，灵蛇岛上的儿子 ---------- */
  QX.addEvents([
    { id: 'tk_boat1', who: 'laochuanfu', act: '问他网上挂的那块木牌', minAff: '熟', cond: (g) => !g.hasTask('tk_boat') && !g.f('boatDone'), t: '木牌',
      text: '老船夫的渔网上挂着一块木牌，刻着一个“海”字。他说那是他儿子阿海的。三年前阿海撑船去了灵蛇岛，送一船米，人和船都没回来。',
      choices: [
        { t: '答应上岛的时候替他找找', fx: (g) => { g.task('tk_boat', '去灵蛇岛找老船夫的儿子阿海'); g.like('laochuanfu', 10); }, res: '老船夫把木牌解下来塞给你。“他认得这个。”' },
        { t: '说灵蛇岛上蛇多，劝他别想了', res: '老船夫点点头，又低头补网去了。' },
      ] },
    { id: 'tk_boat2', loc: 'lingshe', explore: 'lingshe', w: 5, cond: (g) => g.hasTask('tk_boat') && !g.f('boatSonHome') && !g.f('boatToken'), t: '礁石后面',
      text: '岛的背面有一个小湾，一个晒得黝黑的年轻人在修船。你拿出那块木牌，他手里的锤子掉在了地上。他说婆婆不许岛上的人走，走了的都喂了蛇。',
      choices: [
        { t: '趁夜里带他划船走', check: ['轻功', '中'], fx: (g) => { g.set('boatSonHome'); if (g.alive('jinhua')) g.like('jinhua', -10); }, res: '你们摸黑推船下海，划到天亮，灵蛇岛只剩一个黑点。阿海坐在船头，哭得像个孩子。',
          fail: { fx: (g) => { g.set('boatToken'); g.hurt(40); }, res: '船刚下水，礁石上就亮起了火把。阿海把你推上了船，自己留下了。他喊：“告诉我爹，我还活着。”' } },
        { t: '去求金花婆婆放人', cond: (g) => g.alive('jinhua') && g.here('jinhua'), need: ['声望', 30], fx: (g) => { g.set('boatSonHome'); g.like('jinhua', 5); }, res: '金花婆婆咳了半天：“一个撑船的，也值得你来求？带走吧。”' },
        { t: '只带一句话回去', fx: (g) => g.set('boatToken'), res: '阿海在木牌背面刻了几道，说他爹看得懂。' },
      ] },
    { id: 'tk_boat3', who: 'laochuanfu', act: '告诉老船夫阿海的事', cond: (g) => g.hasTask('tk_boat') && (g.f('boatSonHome') || g.f('boatToken')), t: '阿海',
      text: (g) => (g.f('boatSonHome') ? '阿海跳上码头，跪在他爹面前。老船夫扔下渔网，一把抱住了他，半天没出声。' : '老船夫摸着木牌背面那几道刻痕，看了很久。“这是我们父子的暗号。他说他还活着。”'),
      choices: [
        { t: '收下他的谢礼', cond: (g) => g.f('boatSonHome'), fx: (g) => { g.taskDone('tk_boat', '你把阿海送回了他爹身边。'); g.set('boatDone'); if (!g.has('haitu')) g.give('haitu'); else g.add('银两', 30); g.like('laochuanfu', 15); },
          res: '老船夫把压箱底的东西塞给了你。他说，北边的海，往后有阿海给你撑船。' },
        { t: '什么也不要，喝一碗酒就走', cond: (g) => g.f('boatSonHome'), fx: (g) => { g.taskDone('tk_boat', '你把阿海送回了他爹身边。'); g.set('boatDone'); g.add('品德', 3); g.add('声望', 3); g.like('laochuanfu', 20); }, res: '父子俩陪你喝到半夜。码头上的人都知道了这件事。' },
        { t: '把木牌交还给他', cond: (g) => !g.f('boatSonHome'), fx: (g) => { g.taskDone('tk_boat', '你替阿海捎回了一句话。'); g.set('boatDone'); g.like('laochuanfu', 10); g.add('品德', 1); }, res: '老船夫把木牌挂回网上。他说，等他攒够了钱，自己去接。' },
        { t: '说阿海在岛上过得好，叫他放心', cond: (g) => !g.f('boatSonHome'), fx: (g) => { g.taskDone('tk_boat', '你替阿海捎回了一句话。'); g.set('boatDone'); g.like('laochuanfu', 12); g.add('品德', -1); }, res: '老船夫笑了，笑着笑着又不笑了。他知道你在骗他，可他愿意信。' },
      ] },
  ]);

  /* ---------- 托付五：大理药铺掌柜，苍山上的药 ---------- */
  QX.addEvents([
    { id: 'tk_yao1', who: 'dali_yaogui', act: '问掌柜为什么愁眉苦脸', minAff: '熟', cond: (g) => !g.hasTask('tk_yao') && !g.f('yaoDone'), t: '寒热',
      text: '掌柜说，城南这个月有十几个孩子发寒热，一阵冷一阵热。治这个病要苍山雪线上的一种草，叫雪茶。可上山的路被强人占了，采药的人上去就没下来。',
      choices: [
        { t: '答应替他上山采', fx: (g) => { g.task('tk_yao', '去苍山雪线上替药铺采雪茶'); g.like('dali_yaogui', 10); }, res: '掌柜给你画了一张草图，雪茶长在背阴的石缝里，叶子是白的。' },
        { t: '说你身上还有事', res: '掌柜叹了口气，接着称药。' },
      ] },
    { id: 'tk_yao2', loc: 'dali', explore: 'dali', w: 5, cond: (g) => g.hasTask('tk_yao') && !g.f('yaoHerb'), t: '雪线',
      text: '苍山的山道上横着一根木头，木头后面有个草棚，几个拿刀的汉子在烤火。雪线就在他们头顶上。',
      choices: [
        { t: '从山道上硬闯过去', fight: { foes: ['zeitou', 'shanzei'], win: { fx: (g) => { g.set('yaoHerb'); g.add('声望', 3); }, res: '强人跑了。你在雪线的石缝里采了满满一包雪茶。' }, lose: { res: '你被打下了山。草图还在怀里。' } } },
        { t: '绕到后山，攀崖上去', check: ['轻功', '中'], fx: (g) => g.set('yaoHerb'), res: '你攀了半天崖，手指冻得没了知觉，总算摸到了雪线。石缝里的雪茶，叶子是白的。',
          fail: { fx: (g) => g.hurt(45), res: '崖上结了冰，你滑下来好几丈，摔得浑身是伤。' } },
      ] },
    { id: 'tk_yao3', who: 'dali_yaogui', act: '把雪茶交给掌柜', cond: (g) => g.hasTask('tk_yao') && g.f('yaoHerb'), t: '雪茶',
      text: '掌柜打开那包雪茶，闻了闻，手都在抖。当天下午，药铺门口排起了长队，抱着孩子的妇人一直排到了街口。',
      choices: [
        { t: '一文钱也不要', fx: (g) => { g.taskDone('tk_yao', '城南的孩子喝上了雪茶。'); g.set('yaoDone'); g.set('yaoFriend'); g.add('品德', 4); g.add('声望', 4); g.like('dali_yaogui', 15); },
          res: '掌柜说，那他教你几个方子。治内伤的，通经脉的，都是他压箱底的东西。“往后你练功伤了，照着煎。”' },
        { t: '收下谢银', fx: (g) => { g.taskDone('tk_yao', '城南的孩子喝上了雪茶。'); g.set('yaoDone'); g.add('银两', 40); g.like('dali_yaogui', 5); }, res: '掌柜给了你四十两。你出门的时候，一个妇人抱着孩子给你鞠了个躬。' },
      ] },
  ]);

  /* ---------- 托付六：说书先生，屠龙刀背后的真事 ---------- */
  QX.addEvents([
    { id: 'tk_shuo1', who: 'shuoshu', act: '说书先生请你喝茶', minAff: '熟', cond: (g) => !g.hasTask('tk_shuo') && !g.f('shuoTold'), t: '新书',
      text: '说书先生给你倒了一杯茶。他说屠龙刀那一段他讲了二十年，听的人都会背了。“你在江湖上走，替我听一点真事回来。真的东西，才压得住场子。”',
      choices: [
        { t: '答应替他听', fx: (g) => { g.task('tk_shuo', '替说书先生打听屠龙刀背后的真事'); g.like('shuoshu', 8); }, res: '说书先生一拍醒木：“好。茶钱，先记我账上。”' },
        { t: '说你只爱听，不会讲', res: '说书先生哈哈一笑，又上台去了。' },
      ] },
    { id: 'tk_shuo2', who: 'shuoshu', act: '把听来的讲给他', cond: (g) => g.hasTask('tk_shuo') && (g.f('heardGuojing') || g.f('xiexunTrust')), t: '真事',
      text: '说书先生关上了茶楼的门，铺开纸，研好了墨。“你说，我记。”',
      choices: [
        { t: '讲郭大侠夫妇守襄阳', cond: (g) => g.f('heardGuojing'), fx: (g) => { g.taskDone('tk_shuo', '说书先生把你讲的写成了新书。'); g.set('shuoTold'); g.add('声望', 6); g.add('品德', 1); g.rumor('传闻：临安茶楼的说书先生开了一部新书，讲郭大侠夫妇守襄阳，场场满座。', { loc: 'lintan' }); },
          res: '你把襄阳老叫化的话一句一句说出来。说书先生写到郭大侠战死那一段，停了笔，揉了揉眼睛。' },
        { t: '讲冰火岛上的狮王，只是不说岛在哪里', cond: (g) => g.f('xiexunTrust'), fx: (g) => { g.taskDone('tk_shuo', '说书先生把你讲的写成了新书。'); g.set('shuoTold'); g.set('shuoHid'); g.add('品德', 3); g.like('shuoshu', 10); },
          res: '你讲了一个瞎眼的狮王，在冰上坐了二十年，等一个人。说书先生问岛在哪里，你说你忘了。他看了你一眼，没再问。' },
        { t: '把狮王在哪里也说了，换他的润笔', cond: (g) => g.f('xiexunTrust'), fx: (g) => { g.taskDone('tk_shuo', '说书先生把你讲的写成了新书。'); g.set('shuoTold'); g.add('银两', 40); g.add('品德', -6); g.rumor('传闻：临安茶楼里说，金毛狮王谢逊就在极北海上的冰火岛，有人已经在雇船了。', { loc: 'binghuo' }); },
          res: '说书先生给了你四十两。第二天，茶楼里挤满了带刀的人。' },
        { t: '还没打听到，下回再说', res: '说书先生把笔搁下了。“不急，真事慢慢来。”' },
      ] },
    { id: 'tk_shuo3', who: 'shuoshu', act: '说书先生压低了声音', cond: (g) => g.f('shuoTold') && g.f('xiexunAsk') && !g.f('heardChengkun'), t: '混元霹雳手',
      text: (g) => (g.f('shuoHid') ? '说书先生说，你那天没把狮王的下落卖给他，他敬你。' : '说书先生收起了笑。') + '他说二十多年前有个混元霹雳手成昆，杀了谢家满门以后就不见了。前几年有个香客在嵩山脚下见过一个和尚，像他。那和尚笑起来很和气，一双手又白又细。',
      choices: [
        { t: '记下，等回冰火岛告诉狮王', fx: (g) => { g.set('heardChengkun'); g.add('资质', 0.5); }, res: '你把那双手记在心里。谢逊等的那个人，也许就在少林。' },
        { t: '请他别再对别人讲这件事', fx: (g) => { g.set('heardChengkun'); g.like('shuoshu', 5); g.add('品德', 1); }, res: '说书先生点点头：“这一段，我不上台讲。讲了，我这条命就没了。”' },
      ] },
  ]);
})();

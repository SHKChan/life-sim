/* 江湖一梦 · 更多通用奇遇与贵人
 * 按年代、地方、门派、武功、正邪、男女、年纪分开，让每一世碰到的人和事不一样。
 * 每个奇遇的选择用 g.remember 记在这一世，几年后由对应的回响（e_echo_*）兑现。
 * 文中的细节（地名、兵器、来人）用 pk 在这一世第一次读到时随机定下，之后同一世里不变，回响里读到的也是同一个。 */
(function () {
  'use strict';
  const JY = window.JY;

  /* ---------- 工具 ---------- */
  // 这一世里随机定下一个细节：同一个 key 在同一世里总是同一个值
  const pk = (g, key, arr) => {
    const S = JY.engine && JY.engine.get(), L = S && S.L;
    if (!L) return arr[0];
    const m = (L.mem = L.mem || {}), k = '~' + key;
    if (!m[k] || typeof m[k].v !== 'number' || m[k].v >= arr.length) m[k] = { v: Math.floor(g.rnd() * arr.length), y: L.year };
    return arr[m[k].v];
  };
  const info = (k) => { const S = JY.engine && JY.engine.get(); return (S && S.L && S.L.info && S.L.info[k]) || ''; };
  const sect = () => info('门派');
  const noSect = () => !sect() || sect() === '无';
  const isF = (g) => !!(g.me && JY.byId[g.me] && JY.byId[g.me].sex === '女');
  const R = {
    south: ['niujia', 'jiangnan', 'jiaxing', 'guiyun', 'lintan'],
    north: ['zhongdu', 'zhangjiakou', 'dadu', 'fenglingdu', 'haozhou'],
    xy: ['xiangyang', 'hanshui'],
    mount: ['zhongnan', 'gumu', 'shaolin', 'wudang', 'emei', 'huashan', 'tiezhang', 'yideng', 'kunlun', 'guangming', 'jianzhong', 'jueqing', 'baihua', 'hudie'],
    isle: ['taohua', 'sea', 'binghuo', 'wangpan', 'lingshe'],
    grass: ['grassland'],
    west: ['westlands'],
    road: ['road', 'hut'],
  };
  const at = (g, ...rs) => rs.some((r) => R[r].includes(g.loc));
  const town = (g) => at(g, 'south', 'north', 'xy', 'road');
  const SECLUDED = ['gumu', 'binghuo', 'kunlun', 'taohua', 'sea', 'wangpan', 'lingshe'];
  const out = (g) => !SECLUDED.includes(g.loc);
  const noble = (g) => ['yangkang', 'zhaomin'].includes(g.me);
  const era = (g) => (g.Y <= 34 ? 'jin' : g.Y <= 76 ? 'meng' : g.Y <= 143 ? 'yuan' : 'ming');

  // 回响：自动节点，记下的选择过了 years 年后兑现。read 里写字面的 g.recall('键')，检查工具才认得
  const echo = (id, read, t, years, minAge, map, extra) => ({
    id, y: [-50, 200], minAge, t, auto: true, always: true, kind: 'echo',
    cond: (g) => { const [v, n] = read(g); return !!map[v] && n >= (typeof years === 'function' ? years(v) : years) && (!extra || extra(g)); },
    fx: (g) => { const m = map[read(g)[0]]; if (m.fx) m.fx(g); },
    text: (g) => { const m = map[read(g)[0]]; return m ? JY.val(m.t) : ''; },
  });

  JY.addFlags({
    zhuFed: '朱元璋少年时在外讨饭，有人给过他一碗饭。他当了皇帝，记着这份恩',
  });

  /* ---------- 贵人：每一世碰到的人不一样 ---------- */
  const QZ = (g) => pk(g, 'qzWho', isF(g)
    ? [{ n: '孙不二', p: '她', look: '她是个中年道姑，背着一口长剑，眉目冷峻。', art: '剑诀' }, { n: '王处一', p: '他', look: '他一只脚站在石墩上，身子纹丝不动。', art: '金雁功' }, { n: '刘处玄', p: '他', look: '他身形瘦长，走起路来像飘着。', art: '吐纳' }]
    : [{ n: '王处一', p: '他', look: '他一只脚站在石墩上，身子纹丝不动。', art: '金雁功' }, { n: '刘处玄', p: '他', look: '他身形瘦长，走起路来像飘着。', art: '吐纳' }, { n: '孙不二', p: '她', look: '她是个中年道姑，背着一口长剑，眉目冷峻。', art: '剑诀' }]);
  const QZ_SAY = ['底子不坏，可惜练歪了', '气息太浮', '下盘太虚', '出手太急'];
  const DOC = (g) => pk(g, 'docWho', ['一个摇着串铃的走方郎中', '一个背着药篓的白胡子郎中', '一个跛脚的女郎中', '一个满手药渣的年轻郎中']);
  const DOC_ART = (g) => pk(g, 'docArt', ['针灸', '接骨', '解毒']);
  const BIAO = (g) => pk(g, 'biaoJu', ['威远镖局', '长风镖局', '龙门镖局', '振远镖局']);
  const BIAO_MAN = (g) => pk(g, 'biaoMan', ['姓马', '姓周', '姓雷', '姓韩']);
  const BIAO_RD = (g) => pk(g, 'biaoRd', ['过太行山', '走潼关', '下荆襄', '走两淮']);
  const FENG_W = (g) => pk(g, 'fengW', ['一柄短刀', '一根铁杖', '一口长剑', '一对铁护腕']);
  const VET = (g) => ({
    jin: { who: '一个独臂老汉', past: '他爹当年在岳家军里扛过大旗', art: '几路岳家枪法' },
    meng: { who: '一个从襄阳城头退下来的老兵', past: '他在城头守了十年，少了三根手指', art: '守城用的刀法' },
    yuan: { who: '一个从南边流落来的老卒', past: g.Y < 110 ? '他说崖山那一仗，他在海里泡了一夜才爬上岸' : '他爹在崖山海里泡了一夜才爬上岸，他从小听到大', art: '船上用的短刀' },
    ming: { who: '一个刚解甲的老卒', past: '他跟着义军打过鄱阳湖，脸上还有火燎的疤', art: '长枪的路数' },
  })[era(g)];
  const PUPIL = (g) => pk(g, 'pupil', ['一个姓石的少年', '一个铁匠家的儿子', '一个被师门赶出来的少年', '一个不爱说话的小姑娘']);
  const RIVAL = (g) => pk(g, 'rival', ['一个背着双刀的年轻人', '一个自称打遍两淮无敌手的胖子', '一个蒙着面纱的女子', '一个独眼的老剑客']);
  const BULLY = (g) => pk(g, 'bully', ['一个卖肉的屠户', '一个镇上的泼皮', '一个财主家的恶仆', '一个挂着腰刀的衙役']);
  const MJ = (g) => pk(g, 'mjWho', [{ n: '彭莹玉', d: '一个胖大和尚' }, { n: '说不得', d: '一个背着大布袋的和尚' }, { n: '周颠', d: '一个说话颠三倒四的汉子' }]);
  const EVIL = (g) => pk(g, 'evil', [{ n: '一只吊睛白额的大虫', k: 'tiger' }, { n: '镇上横行的恶霸', k: 'tyrant' }, { n: '一伙占了山寨的马贼', k: 'bandits' }]);
  const HU_ITEM = (g) => pk(g, 'huItem', ['一柄波斯弯刀', '一包西域的香料', '一张画着雪山的旧地图']);

  JY.addEncounters([
    // 全真道人：射雕年间，北方、江南、路上
    { id: 'e_gr_quanzhen', y: [0, 45], minAge: 8, maxAge: 32, t: '道人',
      cond: (g) => !['yangguo', 'xiaolongnv', 'limochou'].includes(g.me) && (g.Y < 18 || !['guojing', 'yangkang', 'munianci', 'huangrong'].includes(g.me)) && !/全真/.test(sect()) && at(g, 'north', 'xy', 'road', 'south'),
      text: (g) => '一个道人路过' + pk(g, 'qzPlace', ['镇口的茶棚', '镇外的破庙', '渡口', '山道边的凉亭']) + '，见你' + (g.age < 16 ? '在空地上比划拳脚' : '练功') + '，停下来看了半天。' + QZ(g).look + QZ(g).p + '自称全真教' + QZ(g).n + '，说你' + pk(g, 'qzSay', QZ_SAY) + '。',
      choices: [
        { t: (g) => '跟' + QZ(g).p + '学三个月吐纳', canon: true, fx: (g) => { g.stat('根骨', 3); g.remember('w_qz', 'breath'); }, res: (g) => QZ(g).n + '每天天不亮就叫你起来打坐。三个月后' + QZ(g).p + '走了，只留下一句：“气沉丹田，别急。”' },
        { t: (g) => '求' + QZ(g).p + '引你入全真教', cond: (g) => noSect() && g.age <= 22, check: ['悟性', 45], dev: 2,
          fx: (g) => { g.info('门派', '全真教（俗家）'); g.rel('全真引路人', QZ(g).n, '在路上指点你入门'); g.remember('w_qz', 'disciple'); }, res: (g) => QZ(g).n + '点了点头，写了一封书信让你收好，说拿着它上终南山，重阳宫的门为你开着。',
          fail: { fx: (g) => g.remember('w_qz', 'refused'), res: (g) => QZ(g).n + '摇头，说你尘缘未了，过几年再说。', dev: 0 } },
        { t: (g) => '请' + QZ(g).p + '指点你自己的功夫', dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_qz', 'advice'); }, res: (g) => QZ(g).p + '只说了一句“' + pk(g, 'qzSay', QZ_SAY) + '”，就再不肯多讲。你琢磨了一路。' },
      ] },
    // 走方郎中：任何年代，城镇
    { id: 'e_gr_doctor', y: [-50, 200], minAge: 12, t: '郎中', cond: (g) => town(g),
      text: (g) => DOC(g) + '在' + pk(g, 'docPlace', ['集市边', '城隍庙前', '客店门口', '渡口的柳树下']) + '给人看病。不收钱，只收一碗饭。听人说，' + (DOC(g).includes('女') ? '她' : '他') + '最拿手的是' + DOC_ART(g) + '。',
      choices: [
        { t: '请郎中也给你看看', canon: true, fx: (g) => { g.stat('根骨', 3); g.remember('w_doc', 'seen'); }, res: (g) => '郎中按了你的脉，说你' + pk(g, 'docSay', ['肝火太旺', '早年受过寒', '睡得太少', '底子还算结实']) + '，给了你一包药。' },
        { t: (g) => '跟郎中学几手' + DOC_ART(g), check: ['悟性', 40], dev: 0, fx: (g) => { g.stat('悟性', 2); g.remember('w_doc', 'learned'); }, res: '郎中教了你三天，临走把一本手抄的方子塞给了你。',
          fail: { fx: (g) => g.remember('w_doc', 'seen'), res: '你学了三天，穴位还是认不全。郎中笑着给了你一包药，叫你别学了。', dev: 0 } },
        { t: '替郎中背了一路药篓', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('w_doc', 'walked'); }, res: '你们走了两天山路。分手时郎中问了你的名字，说记下了。' },
      ] },
    // 老镖头：江南、北方、路上
    { id: 'e_gr_biaotou', y: [-50, 200], minAge: 15, t: '走镖', cond: (g) => town(g) && !noble(g),
      text: (g) => BIAO(g) + '一个' + BIAO_MAN(g) + '的老镖头押着一趟镖' + BIAO_RD(g) + '，人手不够。他上下打量你，问你敢不敢跟着走一趟，管吃管住，到了地头另有谢银。',
      choices: [
        { t: '推辞，江湖险恶', canon: true, fx: (g) => g.remember('w_biao', 'no'), res: '老镖头没再勉强，拱拱手走了。' },
        { t: '跟着走一趟', check: ['武学', 30], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_biao', 'rode'); }, res: '一路有惊无险。到了地头，老镖头多给了你一两银子，说你眼尖。',
          fail: { fx: (g) => { g.stat('根骨', -8); g.remember('w_biao', 'hurt'); }, res: '半路遇上劫镖的，你挨了一刀。镖保住了，你躺了一个月。', dev: 0 } },
        { t: '半夜劫镖的来了，你一个人把他们引开', check: ['武学', 50], dev: 0, fx: (g) => { g.stat('声望', 4); g.remember('w_biao', 'decoy'); }, res: '你把他们引进了山沟，天亮才绕回来。镖车一辆没少。',
          fail: { fx: (g) => { g.stat('根骨', -10); g.remember('w_biao', 'hurt'); }, res: '你被他们追上了，滚下山坡才脱身。', dev: 0 } },
      ] },
    // 少林游僧：少林一直都在
    { id: 'e_gr_monk', y: [10, 200], minAge: 10, t: '游僧', cond: (g) => (at(g, 'xy', 'north', 'road') || g.loc === 'shaolin') && !/少林/.test(sect()),
      text: (g) => pk(g, 'monkWho', ['一个白眉老僧', '一个瘦得像竹竿的游方和尚', '一个挑着两筐经书的和尚']) + '在路边化缘，钵里只有半个馒头。他说自己从嵩山少林寺出来，要走到' + pk(g, 'monkTo', ['五台山', '九华山', '普陀山', '峨嵋山']) + '去。',
      choices: [
        { t: '施舍一碗斋饭', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('w_monk', 'alms'); }, res: '和尚吃得很慢，一粒米也没剩。他合十谢你，没说别的。' },
        { t: '请他教你一套强身的拳', check: ['根骨', 35], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_monk', 'fist'); }, res: '他教了你一套罗汉拳，说少林寺的小沙弥都练这个。',
          fail: { fx: (g) => g.remember('w_monk', 'alms'), res: '他看了看你，说你身子还没长开，先吃饱饭再说。', dev: 0 } },
        { t: '替他挑一程经书', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('w_monk', 'carry'); }, res: '你挑了三十里。和尚问了你的名字，说回寺时要跟知客僧提一句。' },
      ] },
    // 小庵老尼
    { id: 'e_gr_nun', y: [-50, 200], minAge: 12, t: '小庵', cond: (g) => at(g, 'south', 'road') || g.loc === 'emei',
      text: '你在山下避雨，躲进一座小庵。庵里只有一个老尼，就着油灯缝补衣裳。她看你湿透了，给你烧了一壶姜茶。墙上挂着一幅褪了色的画，画的是一个人在舞剑。',
      choices: [
        { t: '谢过她，雨停就走', canon: true, fx: (g) => g.remember('w_nun', 'tea'), res: '雨停的时候，老尼已经睡着了。你把门轻轻带上。' },
        { t: '替她修好漏雨的屋顶', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('w_nun', 'roof'); }, res: '你在屋顶上忙了半天。老尼在下面念了一下午的经。' },
        { t: '问她墙上那幅画是谁画的', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_nun', 'sword'); }, res: '老尼说是年轻时一个朋友画的。你盯着画看到半夜，看出了几分剑意。',
          fail: { fx: (g) => g.remember('w_nun', 'tea'), res: '老尼笑而不答，给你又倒了一碗姜茶。', dev: 0 } },
      ] },
    // 山中高人：武学有点底子的人才会被看出破绽
    { id: 'e_gr_hermit', y: [-50, 200], minAge: 16, t: '山中人', cond: (g) => (at(g, 'mount', 'road') && g.loc !== 'gumu') && g.s('武学') >= 35,
      text: (g) => '你在山里练功，' + pk(g, 'herWho', ['一个砍柴的老人', '一个钓鱼的老翁', '一个在崖边晒药的中年人']) + '在旁边看了半天，忽然说：“第' + pk(g, 'herN', ['三', '七', '十一']) + '招，慢了。”',
      choices: [
        { t: '笑笑，不理他', canon: true, fx: (g) => g.remember('w_her', 'ignore'), res: '那人也笑笑，背起东西走了。' },
        { t: '请他指点', check: ['悟性', 45], dev: 0, fx: (g) => { g.stat('武学', 3); g.remember('w_her', 'taught'); }, res: '他拿一根树枝比划了两下。你看懂了一半。',
          fail: { fx: (g) => g.remember('w_her', 'ignore'), res: '他比划了两下，你没看懂。他摇摇头走了。', dev: 0 } },
        { t: '“慢了？你来试试。”', check: ['武学', 55], dev: 0, fx: (g) => { g.stat('声望', 1); g.remember('w_her', 'duelWon'); }, res: '你们过了十几招。他收手大笑，说你脾气不好，功夫倒还行。',
          fail: { fx: (g) => { g.stat('根骨', -4); g.remember('w_her', 'duelLost'); }, res: '他只用一根树枝，三招就把你点倒在地上。', dev: 0 } },
      ] },
    // 陆乘风：射雕年间，太湖一带
    { id: 'e_gr_lu', y: [0, 40], minAge: 12, t: '归云庄', cond: (g) => at(g, 'south', 'road') && !['guojing', 'huangrong', 'yangkang'].includes(g.me),
      text: '太湖边的归云庄，庄主陆乘风双腿废了，坐着待客，眼神却很亮。他看过你的手掌，说你练过几天功夫，留你喝茶。说起他当年的师父，他的眼圈红了。',
      choices: [
        { t: '喝过茶就告辞', canon: true, fx: (g) => g.remember('w_lu', 'tea'), res: '陆庄主送你到门口，让少庄主陆冠英牵马。' },
        { t: '在庄上住下，请他指点腿法', check: ['悟性', 45], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_lu', 'leg'); }, res: '他腿不能动，就让陆冠英一招一招演给你看。你住了一个月。',
          fail: { fx: (g) => g.remember('w_lu', 'tea'), res: '你住了半个月，看得眼花缭乱，一招也没学会。', dev: 0 } },
        { t: '说你愿意替他往东海送一封信', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('w_lu', 'letter'); }, res: '陆庄主写了一夜，信封上只写了“恩师”两个字。' },
      ] },
    // 冯默风：神雕前后，襄阳一带的瘸腿铁匠
    { id: 'e_gr_feng', y: [25, 39], minAge: 14, t: '铁匠', cond: (g) => at(g, 'xy', 'road', 'north') && !['guojing', 'huangrong', 'guofu', 'guoxiang', 'yangguo'].includes(g.me),
      text: (g) => pk(g, 'fengPlace', ['城外', '镇口', '官道边']) + '有个瘸腿铁匠，打的农具结实，从不多说一句话。你看见他抡锤的间隙，左手两指一弹，把一颗火星弹进了一丈外的水桶。',
      choices: [
        { t: '请他打一件趁手的家伙', canon: true, fx: (g) => g.remember('w_feng', 'blade'), res: (g) => '他打了三天，给你' + FENG_W(g) + '。收钱的时候，他只要了一半。' },
        { t: '跟他拉一冬风箱', dev: 0, fx: (g) => { g.stat('根骨', 3); g.remember('w_feng', 'bellows'); }, res: '一冬下来，你的两条胳膊粗了一圈。铁匠没教你什么，只是常常看着你出神。' },
        { t: '问他那一弹是什么功夫', check: ['悟性', 55], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_feng', 'secret'); }, res: '他沉默了很久，说是年轻时一个师父教的，那个师父不要他了。他教了你两下。',
          fail: { fx: (g) => g.remember('w_feng', 'shut'), res: '他把锤子一放，说你看错了。第二天铺子就关了门。', dev: 0 } },
      ] },
    // 朱元璋少年讨饭：元末
    { id: 'e_gr_zhu', y: [118, 128], minAge: 10, t: '小和尚', cond: (g) => g.alive('zhuyuanzhang') && !g.knows('zhuyuanzhang') && out(g) && !g.isMe('zhaomin'),
      text: '一个瘦高的小和尚托着破钵讨饭，下巴长得出奇，眼睛却很亮。他说皇觉寺里没米了，师父们打发他出来化缘，走到哪算哪。',
      choices: [
        { t: '给他一碗饭', canon: true, fx: (g) => { g.stat('情义', 2); g.set('zhuFed'); g.remember('w_zhu', 'fed'); }, res: '他蹲在门槛上吃完，把碗舔得干干净净，问了你的名字，说以后要还。' },
        { t: '让他帮你干半天活，换两个馒头', dev: 0, fx: (g) => { g.stat('悟性', 1); g.remember('w_zhu', 'work'); }, res: '他劈柴挑水，干得比谁都快。拿了馒头，他说你这人公道。' },
        { t: '“和尚也来抢饭吃？”把他赶走', dev: 0, fx: (g) => { g.stat('正邪', -2); g.remember('w_zhu', 'chased'); }, res: '他没吭声，回头看了你一眼，把你家的门牌记住了。' },
      ] },
    // 韦一笑：元末，寒毒发作的夜里
    { id: 'e_gr_wei', y: [110, 132], minAge: 14, t: '青袍人', cond: (g) => out(g) && !at(g, 'grass'),
      text: (g) => '夜里你歇在' + pk(g, 'weiPlace', ['城隍庙', '废弃的驿站', '荒村的空屋']) + '。一个青袍瘦子缩在墙角发抖，嘴唇乌青。他抬头看你，眼里发绿：“走，快走。”',
      choices: [
        { t: '听他的，连夜走', canon: true, fx: (g) => g.remember('w_wei', 'fled'), res: '你走出很远，背后的风里像有人在笑，又像在哭。' },
        { t: '生一堆火，把烈酒给他灌下去', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('w_wei', 'fire'); }, res: '他喝了半囊酒，抖得轻了些。天亮时人不见了，地上留着一片青色的衣角。' },
        { t: '拔刀，先下手为强', check: ['武学', 75], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_wei', 'fought'); }, res: '他身法快得像鬼。你们过了几十招，他一声长笑，从屋顶走了。',
          fail: { fx: (g) => { g.stat('根骨', -15); g.remember('w_wei', 'bitten'); }, res: '你还没看清，颈上一凉。醒来时天已经亮了，你浑身发冷。', dev: 0 } },
      ] },
    // 明教五散人：元末，粥棚
    { id: 'e_gr_mingjiao', y: [108, 133], minAge: 14, t: '粥棚', cond: (g) => out(g) && !/明教/.test(sect()) && !g.isMe('zhangwuji'),
      text: (g) => MJ(g).d + '在' + pk(g, 'mjPlace', ['城门外', '河滩上', '庙前']) + '给穷人分粥，粥棚上插着一面画着火焰的小旗。他自称' + MJ(g).n + '，说明王出世，穷人有饭吃的日子快到了。' + (g.isMe('zhaomin') ? '你身边的侍卫已经按住了刀柄。' : ''),
      choices: [
        { t: '捐一袋米，别的不问', canon: true, fx: (g) => { g.stat('情义', 2); g.remember('w_mj', 'grain'); }, res: (g) => MJ(g).n + '收了米，冲你咧嘴一笑，在你手心里画了一朵火。' },
        { t: '跟着他入明教', cond: (g) => noSect() && !g.isMe('zhaomin'), dev: 2, fx: (g) => { g.info('门派', '明教'); g.rel('明教引路人', MJ(g).n, '五散人之一'); g.remember('w_mj', 'join'); }, res: '你在火焰旗下念了一段经文，从此是明教的人了。' },
        { t: (g) => (g.isMe('zhaomin') ? '让侍卫拿人' : '去报官'), dev: 0, fx: (g) => { g.stat('正邪', -3); g.remember('w_mj', 'report'); }, res: (g) => '官兵来时，粥棚已经空了。' + MJ(g).n + '临走踢翻了粥锅。' },
      ] },
    // 胡青牛：元朝，病重求医
    { id: 'e_gr_hu', y: [100, 127], minAge: 14, t: '蝶谷医仙', cond: (g) => g.alive('huqingniu') && !g.knows('huqingniu') && g.s('根骨') < 55 && out(g),
      text: '你病了一场，总不见好。有人告诉你，蝴蝶谷里住着“医仙”胡青牛，天下没有他治不好的病。只是他只治明教中人，外人死在谷口也不管。',
      choices: [
        { t: '不去求他', canon: true, fx: (g) => g.remember('w_hu', 'no'), res: '你喝着镇上郎中开的药，慢慢熬。' },
        { t: '冒充明教弟子进谷', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('根骨', 12); g.remember('w_hu', 'lied'); }, res: '胡青牛盯着你看了半天，还是给你扎了针。你在谷里住了一个月，病好了。',
          fail: { fx: (g) => { g.stat('心境', -3); g.remember('w_hu', 'no'); }, res: '你说错了一句教中的切口，被药童拿扫帚赶了出来。', dev: 0 } },
        { t: '在谷口跪着等', dev: 0, fx: (g) => { g.stat('情义', 1); g.remember('w_hu', 'knelt'); }, res: '你跪了三天，谷里的门一直没开。' },
        { t: '亮出明教的身份', cond: () => /明教/.test(sect()), dev: 0, fx: (g) => { g.stat('根骨', 15); g.remember('w_hu', 'member'); }, res: '胡青牛看过你的令牌，二话不说就给你下了针。' },
      ] },
    // 老兵：每个年代的老兵不一样
    { id: 'e_gr_veteran', y: [-10, 200], minAge: 10, maxAge: 40, t: '老兵', cond: (g) => out(g) && !at(g, 'grass', 'west'),
      text: (g) => VET(g).who + '在' + pk(g, 'vetPlace', ['村口晒太阳', '酒肆里赊酒', '城门洞下补草鞋']) + '。' + VET(g).past + '。他看你半天，说想把' + VET(g).art + '传给个年轻人，免得带进土里。',
      choices: [
        { t: '听他讲完打仗的事', canon: true, fx: (g) => { g.stat('悟性', 2); g.remember('w_vet', 'story'); }, res: '他讲了一下午，讲到死去的弟兄，就停下来喝一口酒。' },
        { t: (g) => '跟他学' + VET(g).art, check: ['根骨', 35], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_vet', 'art'); }, res: '他教得很凶，说战场上没有第二次。你学了一个夏天。',
          fail: { fx: (g) => g.remember('w_vet', 'story'), res: '你练了三天就扭了腰。他叹口气，说那就听我讲讲吧。', dev: 0 } },
        { t: '把他接到家里养老', dev: 0, fx: (g) => { g.stat('情义', 4); g.rel('老兵', VET(g).who.replace(/^一个/, ''), '你接他回家养老'); g.remember('w_vet', 'care'); }, res: '他推辞了三回，最后背着一个布包跟你走了。' },
      ] },
    // 收徒：武学够高才会有人来拜
    { id: 'e_gr_pupil', y: [-50, 200], minAge: 30, t: '拜师', cond: (g) => g.s('武学') >= 60 && g.s('声望') >= 25 && out(g),
      text: (g) => PUPIL(g) + '在你门口跪了一夜，说只想跟你学武。天亮时那孩子还跪着，' + pk(g, 'pupilSeason', ['膝下的雪化了一圈', '衣裳被露水打透了', '嘴唇冻得发紫']) + '。',
      choices: [
        { t: '收下', dev: 0, fx: (g) => { g.rel('门下弟子', PUPIL(g).replace(/^一个/, ''), '在你门口跪了一夜'); g.remember('w_tu', 'took'); }, res: '那孩子磕了三个头，额头上全是土。' },
        { t: '不收，指点他去投个正经门派', canon: true, fx: (g) => g.remember('w_tu', 'sent'), res: '你写了一封荐书。孩子揣着它走了，走几步回一次头。' },
        { t: '教他三招，让他自己去闯', dev: 0, fx: (g) => { g.stat('声望', 1); g.remember('w_tu', 'three'); }, res: '三招教了三天。他说这辈子就靠这三招了。' },
      ] },
    // 挑战：成名之后
    { id: 'e_gr_rival', y: [-50, 200], minAge: 25, t: '挑战', cond: (g) => g.s('武学') >= 65 && g.s('声望') >= 30 && out(g),
      text: (g) => RIVAL(g) + '找上门来，说听过你的名头，要和你比一场。门外已经围了一圈看热闹的人。',
      choices: [
        { t: '应战', check: ['武学', 70], dev: 0, fx: (g) => { g.stat('声望', 4); g.remember('w_duel', 'won'); }, res: '你赢了半招。对方收起兵器，深深看了你一眼。',
          fail: { fx: (g) => { g.stat('根骨', -8); g.stat('声望', -3); g.remember('w_duel', 'lost'); }, res: '你输了半招。围观的人散得很快。', dev: 0 } },
        { t: '说你早就不和人动手了', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('w_duel', 'declined'); }, res: '对方骂了几句，没趣地走了。' },
        { t: '约他十年后再比', dev: 0, fx: (g) => g.remember('w_duel', 'later'), res: '他想了想，答应了。你们在门柱上各划了一道。' },
      ] },
    // 被欺负：武功还不行的少年时
    { id: 'e_gr_bully', y: [-50, 200], minAge: 10, maxAge: 22, t: '欺负', cond: (g) => g.s('武学') < 30 && town(g) && !noble(g),
      text: (g) => BULLY(g) + '在街上拦住你，要你' + pk(g, 'bullyWant', ['从他胯下钻过去', '把身上的钱都掏出来', '跪下叫一声爷']) + '。旁边的人都低着头走过去。',
      choices: [
        { t: '忍了', canon: true, fx: (g) => { g.stat('心境', -2); g.remember('w_bully', 'bear'); }, res: '你照做了。那天晚上你没吃饭。' },
        { t: '扑上去拼命', check: ['根骨', 40], dev: 0, fx: (g) => { g.stat('声望', 1); g.remember('w_bully', 'fought'); }, res: '你咬住他的手不放，最后是他先求饶。',
          fail: { fx: (g) => { g.stat('根骨', -5); g.remember('w_bully', 'beaten'); }, res: '你被打得爬不起来，在墙根躺到天黑。', dev: 0 } },
        { t: '记住他的脸，回去苦练', dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_bully', 'train'); }, res: '你转身就走，一路走一路攥着拳头。' },
      ] },
    // 征粮加税：金国年间
    { id: 'e_ev_levy', y: [-10, 34], minAge: 12, t: '征粮', cond: (g) => town(g) && !noble(g) && g.loc !== 'haozhou',
      text: (g) => (at(g, 'north') ? '金兵进村征粮，每户三石，交不出就拉人去修城。' : '官府说要给金国纳岁币，又加了一道税。差役挨家挨户收，交不出就拿人。'),
      choices: [
        { t: '交', canon: true, fx: (g) => g.remember('w_levy', 'paid'), res: '粮缸见了底。你娘一夜没睡。' },
        { t: '把粮藏进后山的山洞', check: ['悟性', 40], dev: 0, fx: (g) => g.remember('w_levy', 'hid'), res: '差役翻遍了屋子，什么也没找到。',
          fail: { fx: (g) => { g.stat('根骨', -5); g.remember('w_levy', 'caught'); }, res: '藏粮的事被邻居说了出去，你被拉走了。', dev: 0 } },
        { t: '带着乡亲们堵在村口', check: ['声望', 40], dev: 0, fx: (g) => { g.stat('正邪', 3); g.stat('声望', 3); g.remember('w_levy', 'led'); }, res: '差役看人多，骂骂咧咧地退了。',
          fail: { fx: (g) => { g.stat('根骨', -5); g.remember('w_levy', 'caught'); }, res: '乡亲们一哄而散，只剩你一个站在村口。', dev: 0 } },
      ] },
    // 元朝禁兵器
    { id: 'e_ev_blade', y: [78, 143], minAge: 14, t: '禁刀', cond: (g) => town(g) && !g.isMe('zhaomin'),
      text: '官府贴出告示：汉人、南人不许私藏兵器，十户共用一把菜刀，拴在井边。差役挨家挨户地搜。',
      choices: [
        { t: '把刀剑交出去', canon: true, fx: (g) => g.remember('w_blade', 'gave'), res: '差役把你的兵器扔进麻袋，叮当一响。' },
        { t: '把兵器包上油布，埋在后院', dev: 0, fx: (g) => g.remember('w_blade', 'buried'), res: '你半夜挖了个坑，埋好，在上面种了一棵葱。' },
        { t: '把差役打出门去', check: ['武学', 50], dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('w_blade', 'fought'); }, res: '三个差役滚出了门，帽子都没捡。',
          fail: { fx: (g) => { g.stat('根骨', -6); g.remember('w_blade', 'jailed'); }, res: '来的人比你想的多。你被锁走了。', dev: 0 } },
      ] },
    // 黄河石人：元末
    { id: 'e_ev_stoneman', y: [126, 136], minAge: 14, t: '石人', cond: (g) => out(g) && !g.isMe('zhaomin'),
      text: '官府征了十几万民夫修黄河。你路过工地，人群忽然炸开了：有人从河底挖出一个石人，只有一只眼睛。河工们都在念一句话：“石人一只眼，挑动黄河天下反。”',
      choices: [
        { t: '挤进去看一眼，就走', canon: true, fx: (g) => g.remember('w_stone', 'saw'), res: '石人的那只眼睛像在看你。你没敢多待。' },
        { t: '跟着河工们一起反了', dev: 2, fx: (g) => { g.stat('正邪', 3); g.rel('义军兄弟', '黄河边的河工', '一起反了的'); g.remember('w_stone', 'rose'); }, res: '当天夜里，工地上点起了火把。你头上扎了一条红巾。' },
        { t: '劝大家散了，别去送死', dev: 0, fx: (g) => { g.stat('心境', 1); g.remember('w_stone', 'calm'); }, res: '有一半人听了你的，扛着锹回了家。' },
      ] },
    // 明初清查明教
    { id: 'e_ev_purge', y: [146, 200], minAge: 20, t: '名册', cond: (g) => out(g),
      text: (g) => '新朝坐稳了江山，开始清查明教余党。县里的差役拿着一本名册上门，要你指认几个人，说指认一个，免一年徭役。' + (/明教/.test(sect()) || g.isMe('zhangwuji') ? '名册上有你认得的名字，也许还有你自己的。' : '') + (g.f('zhuFed') ? '你听人说，当今皇上年轻时讨过饭，最记恩，也最记仇。' : ''),
      choices: [
        { t: '说不认得', canon: true, fx: (g) => g.remember('w_purge', 'silent'), res: '差役冷笑一声，在名册上你家那一栏点了个点。' },
        { t: '半夜去县衙把名册烧了', check: ['武学', 40], dev: 0, fx: (g) => { g.stat('正邪', 3); g.remember('w_purge', 'burned'); }, res: '县衙的后院起了火。没人看见你。',
          fail: { fx: (g) => { g.stat('根骨', -6); g.remember('w_purge', 'jailed'); }, res: '你翻墙时被巡夜的抓住了。', dev: 0 } },
        { t: '带着家人搬进深山', dev: 0, fx: (g) => { g.move('hut'); g.remember('w_purge', 'left'); }, res: '你们走了七天，在一条山沟里停下来。' },
      ] },
    // 襄阳难民：神雕年间
    { id: 'e_ev_refugee', y: [36, 71], minAge: 14, t: '难民', cond: (g) => at(g, 'xy') && !['guojing', 'huangrong'].includes(g.me),
      text: (g) => '北边逃来的难民挤满了' + pk(g, 'refGate', ['襄阳西门', '樊城渡口', '城南的粥棚']) + '。一个' + pk(g, 'refAge', ['五', '六', '七']) + '岁的孩子拽住你的衣角，说找不到娘了。',
      choices: [
        { t: '把孩子交给城里的粥棚', canon: true, fx: (g) => g.remember('w_ref', 'booth'), res: '粥棚的人接过孩子，在他手腕上系了一根红绳。' },
        { t: '领回家养着', dev: 0, fx: (g) => { g.stat('情义', 3); g.rel('收养的孩子', '襄阳城门口捡来的孩子'); g.remember('w_ref', 'adopt'); }, res: '孩子一路攥着你的手，一句话也不说。' },
        { t: '带着他在难民里找了一天一夜', dev: 0, fx: (g) => { g.stat('情义', 3); g.remember('w_ref', 'search'); }, res: '天亮的时候，一个妇人扑过来，抱着孩子哭不出声。' },
      ] },
    // 襄阳细作
    { id: 'e_ev_spy', y: [40, 70], minAge: 16, t: '卖炭人', cond: (g) => at(g, 'xy') && !['guojing', 'huangrong'].includes(g.me),
      text: '你在城头巡夜，看见一个卖炭的汉子蹲在垛口下，借着月光往一张纸上画什么。',
      choices: [
        { t: '去报给守将', canon: true, fx: (g) => g.remember('w_spy', 'told'), res: (g) => { const s = g.slot('襄阳守将'); return '你一路跑下城去报给' + (s === '郭靖' && g.knows('guojing') ? '你' + g.knows('guojing') : s) + '。回来时，那人已经不见了。'; } },
        { t: '扑上去拿下', check: ['武学', 45], dev: 0, fx: (g) => { g.stat('声望', 3); g.remember('w_spy', 'caught'); }, res: '那人身手不弱，还是被你按在了垛口上。',
          fail: { fx: (g) => { g.stat('根骨', -4); g.remember('w_spy', 'escaped'); }, res: '他甩出一把炭灰，翻下城墙跑了。', dev: 0 } },
        { t: '不动声色，跟着他出城', check: ['悟性', 55], dev: 0, fx: (g) => g.remember('w_spy', 'tailed'), res: '你远远跟着他，出了城，往北走。',
          fail: { fx: (g) => g.remember('w_spy', 'escaped'), res: '跟到城外，他忽然拐进芦苇荡，不见了。', dev: 0 } },
      ] },
    // 桃花岛：落水的人
    { id: 'e_pl_wreck', y: [4, 75], minAge: 8, t: '落水的人', cond: (g) => g.loc === 'taohua',
      text: (g) => '一场大风过后，桃花岛的礁石上趴着一个落水的人，还有气。他穿着' + pk(g, 'wreckWho', ['商人', '渔夫', '海客']) + '的衣裳，怀里紧紧抱着一个油布包。',
      choices: [
        { t: '交给岛上的哑仆', canon: true, fx: (g) => g.remember('w_wreck', 'servant'), res: '哑仆们把他抬走了，一句话也没问。' },
        { t: '偷偷给他一条小船，指给他出岛的水路', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('w_wreck', 'boat'); }, res: '他在船上冲你磕了个头，划走了。' },
        { t: '把他引进桃林，看他能不能自己走出来', dev: 0, fx: (g) => { g.stat('正邪', -1); g.remember('w_wreck', 'maze'); }, res: '你站在高处看他转圈，看了一下午。' },
      ] },
    // 终南山：迷路的樵夫
    { id: 'e_pl_woodcutter', y: [-10, 110], minAge: 8, t: '樵夫', cond: (g) => ['gumu', 'zhongnan'].includes(g.loc),
      text: (g) => '一个樵夫在终南山后山迷了路，被' + (/古墓/.test(sect()) ? '玉蜂' : '一群白色的野蜂') + '蜇得满头是包，倒在' + pk(g, 'woodPlace', ['林子边', '溪水旁', '一块大石下']) + '。',
      choices: [
        { t: '用玉蜂浆替他消肿', cond: () => /古墓/.test(sect()), dev: 0, fx: (g) => g.remember('w_wood', 'honey'), res: '他喝下那一小瓶浆，一会儿就消了肿，瞪着你像看见了神仙。' },
        { t: '把他背到山下大路边', canon: true, fx: (g) => { g.stat('情义', 2); g.remember('w_wood', 'carried'); }, res: '他在你背上一直念叨，说回去要给你家送柴。' },
        { t: '远远看着，等他自己走', dev: 0, fx: (g) => { g.stat('心境', 1); g.remember('w_wood', 'watch'); }, res: '他爬了半天，总算爬出了林子。' },
      ] },
    // 峨嵋山：抢东西的猴子
    { id: 'e_pl_monkey', y: [80, 200], minAge: 8, t: '猴子', cond: (g) => g.loc === 'emei',
      text: (g) => '金顶下的一群猴子抢了你的' + pk(g, 'monkeyItem', ['剑穗', '一卷经书', '干粮袋', '发簪']) + '，蹲在崖边的松树上冲你龇牙。',
      choices: [
        { t: '追上去', check: ['根骨', 45], dev: 0, fx: (g) => { g.stat('根骨', 1); g.remember('w_monkey', 'cave'); }, res: '你追着猴子钻进了一个山洞。洞壁上刻满了字。',
          fail: { fx: (g) => { g.stat('根骨', -5); g.remember('w_monkey', 'fell'); }, res: '你脚下一滑，从石阶上滚了下去。', dev: 0 } },
        { t: '拿干粮跟它换', dev: 0, fx: (g) => g.remember('w_monkey', 'trade'), res: '老猴子接过干粮，把东西往你脚下一扔。' },
        { t: '由它去', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('w_monkey', 'let'); }, res: '你笑了笑，回山去了。' },
      ] },
    // 草原：那达慕
    { id: 'e_pl_naadam', y: [-10, 150], minAge: 8, maxAge: 30, t: '那达慕', cond: (g) => at(g, 'grass'),
      text: '草原上办那达慕，各部的好汉都来了。赛马、射箭、摔跤，赢了的人能牵走一匹好马。',
      choices: [
        { t: '下场摔跤', check: ['根骨', 45], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_naadam', 'wrestle'); }, res: '你摔倒了三个人，第四个把你摔进了泥里，也算赢了一匹马。',
          fail: { fx: (g) => g.remember('w_naadam', 'lost'), res: '第一个上来的壮汉就把你摔了出去。', dev: 0 } },
        { t: '去射箭', check: ['武学', 35], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_naadam', 'arrow'); }, res: '你三箭都中了靶心，牵走了一匹黄骠马。',
          fail: { fx: (g) => g.remember('w_naadam', 'lost'), res: '你的箭全偏了，引得一阵哄笑。', dev: 0 } },
        { t: '在场边看热闹', canon: true, fx: (g) => g.remember('w_naadam', 'watch'), res: '你看了一整天，把摔跤手的步子都记在心里。' },
      ] },
    // 草原、塞外：狼群
    { id: 'e_pl_wolves', y: [-50, 200], minAge: 8, t: '狼群', cond: (g) => at(g, 'grass') || g.loc === 'zhangjiakou',
      text: '冬夜里狼群围住了羊圈，头狼的眼睛在雪地里发绿。',
      choices: [
        { t: '点起火把，守到天亮', canon: true, fx: (g) => g.remember('w_wolf', 'fire'), res: '狼群在火光外转了一夜，天亮时散了。' },
        { t: '去追头狼', check: ['武学', 40], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_wolf', 'alpha'); }, res: '你在雪地里追了十里，把头狼拖了回来。',
          fail: { fx: (g) => { g.stat('根骨', -6); g.remember('w_wolf', 'bitten'); }, res: '头狼回身咬住了你的腿。你拼命挣脱，一瘸一拐地回来了。', dev: 0 } },
        { t: '在狼窝里捡回一只狼崽', dev: 0, fx: (g) => g.remember('w_wolf', 'cub'), res: '狼崽在你怀里咬了你一口，然后睡着了。' },
      ] },
    // 大都：勾栏杂剧
    { id: 'e_pl_opera', y: [78, 143], minAge: 12, t: '勾栏', cond: (g) => at(g, 'north'),
      text: '勾栏里在演一出新杂剧，台上的县官又贪又蠢，台下笑成一片。演到一半，官差冲进来，要拿写戏的人。',
      choices: [
        { t: '跟着人群散了', canon: true, fx: (g) => g.remember('w_opera', 'left'), res: '你挤出门时，听见后台有人在哭。' },
        { t: '把写戏的书生拉进后台藏好', dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('w_opera', 'hid'); }, res: '你把他塞进装戏服的箱子。官差翻了一圈，走了。' },
        { t: '跳上台接着演', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_opera', 'acted'); }, res: '你把县官改成了一个好官，台下笑得更响了。官差站在门口，不知道该抓谁。',
          fail: { fx: (g) => { g.stat('根骨', -3); g.remember('w_opera', 'jailed'); }, res: '你一开口就忘了词。官差把你也拖了下去。', dev: 0 } },
      ] },
    // 海沙派私盐：倚天年间，海边
    { id: 'e_pl_haisha', y: [95, 130], minAge: 14, t: '私盐', cond: (g) => at(g, 'south') || ['sea', 'wangpan', 'lingshe'].includes(g.loc),
      text: '海沙派的人在码头上贩私盐，雇人押船，一趟给五两银子。领头的说，碰上官船，只管往盐包里抓一把毒盐撒出去。',
      choices: [
        { t: '上船', dev: 0, fx: (g) => { g.stat('正邪', -3); g.remember('w_salt', 'join'); }, res: '你押了三趟船。银子拿到了，手上的皮被毒盐咬掉一块。' },
        { t: '去盐课司告发', dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('w_salt', 'report'); }, res: '盐课司的官老爷听完，慢吞吞地说知道了。' },
        { t: '装没看见', canon: true, fx: (g) => g.remember('w_salt', 'ignore'), res: '你转过身，码头上的人也都转过身。' },
      ] },
    // 江南：老渔夫
    { id: 'e_pl_fisher', y: [-50, 200], minAge: 8, t: '渔夫', cond: (g) => at(g, 'south') || g.loc === 'hanshui',
      text: (g) => '一个老渔夫在' + pk(g, 'fishPlace', ['湖边', '江边', '桥头']) + '补网，看你在水边站了半天，问你会不会水。',
      choices: [
        { t: '请他教你水性', dev: 0, fx: (g) => { g.stat('根骨', 2); g.remember('w_fish', 'swim'); }, res: '他把你推下水，说淹不死就会了。你喝了半肚子水，学会了。' },
        { t: '帮他补网', canon: true, fx: (g) => { g.stat('情义', 2); g.remember('w_fish', 'net'); }, res: '你们补到天黑。他送了你两条鱼。' },
        { t: '跟他夜里出湖，去看水寇的窝', check: ['武学', 30], dev: 0, fx: (g) => g.remember('w_fish', 'pirate'), res: '你们在芦苇里趴了半夜，记下了水寇藏船的地方。',
          fail: { fx: (g) => { g.stat('根骨', -3); g.remember('w_fish', 'net'); }, res: '船翻了，你们抱着一块船板漂回了岸。', dev: 0 } },
      ] },
    // 西域胡商
    { id: 'e_pl_merchant', y: [-50, 200], minAge: 14, t: '胡商', cond: (g) => at(g, 'west', 'north'),
      text: (g) => '一个高鼻深目的胡商在集上摆摊，卖' + HU_ITEM(g) + '，要价极高。几个地痞在摊子边转来转去。',
      choices: [
        { t: '买下来', dev: 0, fx: (g) => g.remember('w_hu2', 'bought'), res: '你掏空了钱袋。胡商用生硬的汉话说，你识货。' },
        { t: '替他赶走那几个地痞', check: ['武学', 35], dev: 0, fx: (g) => { g.stat('声望', 1); g.remember('w_hu2', 'saved'); }, res: '地痞们跑了。胡商拉着你的手说了一串你听不懂的话。',
          fail: { fx: (g) => { g.stat('根骨', -4); g.remember('w_hu2', 'saved'); }, res: '你被打了一顿，地痞们也没占到便宜，骂着走了。胡商扶起了你。', dev: 0 } },
        { t: '看看就走', canon: true, fx: (g) => g.remember('w_hu2', 'none'), res: '你走出很远，回头看，胡商还在冲你招手。' },
      ] },
    // 黑道拉拢：心术偏了的人才会被找上
    { id: 'e_al_dark', y: [-50, 200], minAge: 18, t: '买卖', cond: (g) => g.s('正邪') <= -10 && out(g),
      text: (g) => '一个黑道上的头目请你喝酒，说' + pk(g, 'darkTarget', ['城里的钱庄', '路过的一趟官银', '一个告老还乡的知府']) + '肥得流油，干完这一票，三七分账。',
      choices: [
        { t: '入伙', dev: 0, fx: (g) => { g.stat('正邪', -5); g.remember('w_dark', 'join'); }, res: '他拍着你的肩膀，叫你兄弟。' },
        { t: '推辞', canon: true, fx: (g) => g.remember('w_dark', 'no'), res: '他也不恼，把酒喝完就走了。' },
        { t: '假意答应，转头报官', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('正邪', 5); g.remember('w_dark', 'trap'); }, res: '你把他们约好的时辰、路线，都写在一张纸上，塞进了县衙的门缝。',
          fail: { fx: (g) => { g.stat('根骨', -8); g.remember('w_dark', 'exposed'); }, res: '你去县衙的路上，被他们的人看见了。', dev: 0 } },
      ] },
    // 乡民求助：有侠名的人
    { id: 'e_al_hero', y: [-50, 200], minAge: 18, t: '除害', cond: (g) => g.s('正邪') >= 25 && g.s('武学') >= 35 && out(g),
      text: (g) => pk(g, 'heroPlace', ['山脚的村子', '河湾的渔村', '城外的庄子']) + '里的乡亲凑了二两银子，找到你，求你除了' + EVIL(g).n + '。',
      choices: [
        { t: '答应下来', check: ['武学', 45], dev: 0, fx: (g) => { g.stat('声望', 4); g.remember('w_hero', 'slew'); }, res: '你去了三天。回来时，乡亲们在村口放了一挂鞭炮。',
          fail: { fx: (g) => { g.stat('根骨', -10); g.remember('w_hero', 'hurt'); }, res: '你受了重伤，是乡亲们用门板把你抬回来的。', dev: 0 } },
        { t: '先去讲道理', cond: (g) => EVIL(g).k !== 'tiger', check: ['声望', 45], dev: 0, fx: (g) => { g.stat('悟性', 1); g.remember('w_hero', 'talked'); }, res: '你一个人上门，说了一个时辰。对方答应收手。',
          fail: { fx: (g) => { g.stat('根骨', -10); g.remember('w_hero', 'hurt'); }, res: '话没说完，他们就动了手。', dev: 0 } },
        { t: '把银子还给他们，说你管不了', canon: true, fx: (g) => g.remember('w_hero', 'no'), res: '领头的老人接过银子，什么也没说。' },
      ] },
    // 绣坊老婆婆：女子
    { id: 'e_sx_needle', y: [-50, 200], minAge: 10, maxAge: 40, t: '绣坊', cond: (g) => isF(g) && town(g),
      text: '绣坊里一个眼睛快瞎了的老婆婆，穿针却一下就中。她见你盯着看，笑着说：“针能绣花，也能打人。”',
      choices: [
        { t: '跟她学飞针', check: ['悟性', 40], dev: 0, fx: (g) => { g.stat('武学', 2); g.remember('w_needle', 'needle'); }, res: '你扎烂了三块木板，终于能在三步外钉住一只苍蝇。',
          fail: { fx: (g) => g.remember('w_needle', 'sew'), res: '你的针总是飞歪。老婆婆说那就先学绣花吧。', dev: 0 } },
        { t: '跟她学绣花', canon: true, fx: (g) => { g.stat('心境', 2); g.remember('w_needle', 'sew'); }, res: '你绣了一冬，绣出一对歪歪扭扭的鸳鸯。' },
        { t: '帮她把绣品挑到城里卖了', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('w_needle', 'sell'); }, res: '你卖了个好价钱。老婆婆数了三遍，分了你一半。' },
      ] },
    // 比武招亲擂台：男子
    { id: 'e_sx_leitai', y: [-50, 200], minAge: 16, maxAge: 35, t: '擂台', cond: (g) => !isF(g) && town(g) && !g.isMe('yangkang'),
      text: (g) => '镇上的' + pk(g, 'leiHost', ['刘员外', '孙大户', '王老财']) + '摆下擂台比武招亲。台上的姑娘一身红衣，连赢了七场，台下没人再敢上。',
      choices: [
        { t: '在台下看热闹', canon: true, fx: (g) => g.remember('w_lei', 'watch'), res: '姑娘站在台上等了半天，自己跳下来走了。' },
        { t: '上台', check: ['武学', 45], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_lei', 'won'); }, res: '你赢了，却当着全镇的人说自己另有心事，把绣球还了回去。姑娘愣了一下，笑了。',
          fail: { fx: (g) => g.remember('w_lei', 'lost'), res: '你被那姑娘一脚踢下了台。', dev: 0 } },
        { t: '看出员外是拿女儿收聘礼，当众揭穿', check: ['悟性', 50], dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('w_lei', 'expose'); }, res: '台下一片哗然。员外的脸涨成了猪肝色。',
          fail: { fx: (g) => g.remember('w_lei', 'lost'), res: '员外的家丁把你架了出去。', dev: 0 } },
      ] },
    // 私塾：小孩子
    { id: 'e_ch_school', y: [-50, 200], minAge: 6, maxAge: 12, t: '私塾', cond: (g) => town(g) && !noble(g),
      text: '镇上私塾的老先生看你天天趴在窗外，招手叫你进去，说不收束脩。',
      choices: [
        { t: '进去念书', canon: true, fx: (g) => { g.stat('悟性', 3); g.remember('w_school', 'study'); }, res: '你认的第一个字是“人”。' },
        { t: '还是趴在窗外听', dev: 0, fx: (g) => { g.stat('悟性', 1); g.remember('w_school', 'window'); }, res: '你脸皮薄，不肯进去。老先生把窗子开大了一些。' },
        { t: '跑去河边摸鱼', dev: 0, fx: (g) => { g.stat('心境', 2); g.remember('w_school', 'fish'); }, res: '你摸了一下午，摸到两条泥鳅。' },
      ] },
    // 庙会走失：更小的孩子
    { id: 'e_ch_fair', y: [-50, 200], minAge: 5, maxAge: 10, t: '庙会', cond: (g) => town(g) && !noble(g),
      text: (g) => '庙会上人山人海，你和大人走散了。一个' + pk(g, 'fairArt', ['耍猴的', '耍飞刀的', '顶缸的']) + '艺人蹲下来，问你家在哪儿。',
      choices: [
        { t: '站在原地等', canon: true, fx: (g) => g.remember('w_fair', 'wait'), res: '你等到天快黑，大人终于找来了。' },
        { t: '跟着艺人走', dev: 0, fx: (g) => g.remember('w_fair', 'troupe'), res: '你跟着艺人班子走了半天，看了三场把戏，才被送回家。' },
        { t: '自己找路回家', dev: 0, fx: (g) => { g.stat('悟性', 1); g.remember('w_fair', 'self'); }, res: '你认着街口的大槐树，一路摸回了家。' },
      ] },
    // 故人托孤：老年
    { id: 'e_old_letter', y: [-50, 200], minAge: 55, t: '故人来信', cond: (g) => out(g),
      text: '一个年轻人背着包袱找上门来，递给你一封信。信是一个故人写的，你想了很久才想起他是谁。信上说，他走了，孩子托付给你。',
      choices: [
        { t: '把孩子留下', dev: 0, fx: (g) => { g.rel('故人之子', '故人托付的孩子'); g.remember('w_letter', 'kept'); }, res: '年轻人放下包袱，四下看了看，去院子里劈柴了。' },
        { t: '给他一笔盘缠，送他去投亲', canon: true, fx: (g) => g.remember('w_letter', 'money'), res: '他拿了盘缠，给你磕了个头。' },
        { t: '问清那位故人的事', dev: 0, fx: (g) => { g.stat('悟性', 1); g.remember('w_letter', 'ask'); }, res: '年轻人讲了一夜。你听着听着，想起了很多年前的事。' },
      ] },
    // 写笔记的书生：晚年
    { id: 'e_old_memoir', y: [-50, 200], minAge: 60, t: '笔记', cond: (g) => out(g),
      text: '一个落第书生找到你，说要写一本江湖人物的笔记，想把你的事也写进去。他已经磨好了墨。',
      choices: [
        { t: '照实讲', dev: 0, fx: (g) => g.remember('w_memoir', 'true'), res: '你讲了三天。有几件事，你讲着讲着就停下了。' },
        { t: '挑好听的讲', dev: 0, fx: (g) => g.remember('w_memoir', 'nice'), res: '书生写得飞快，说这一篇一定好卖。' },
        { t: '“没什么好写的。”', canon: true, fx: (g) => g.remember('w_memoir', 'none'), res: '书生在门口站了一会儿，把笔收了起来。' },
      ] },
    // 门派：丐帮
    { id: 'e_sect_gaibang', y: [0, 150], minAge: 14, t: '净衣污衣', cond: (g) => /丐帮/.test(sect()) && !g.isMe('huangrong'),
      text: '丐帮的净衣派和污衣派又在分舵里吵起来了。净衣派说讨饭丢人，污衣派说不讨饭还叫什么丐帮。两边都拉你表态。',
      choices: [
        { t: '站污衣派', dev: 0, fx: (g) => g.remember('w_gb', 'dirty'), res: '污衣派的长老拍了拍你满是泥的肩膀。' },
        { t: '站净衣派', dev: 0, fx: (g) => g.remember('w_gb', 'clean'), res: '净衣派的人当晚就请你去酒楼吃了一顿。' },
        { t: '两边都不站', canon: true, fx: (g) => g.remember('w_gb', 'none'), res: '两边都瞪了你一眼。' },
      ] },
    // 门派：全真
    { id: 'e_sect_quanzhen', y: [0, 150], minAge: 12, maxAge: 40, t: '考校', cond: (g) => /全真/.test(sect()) && !g.isMe('yangguo'),
      text: (g) => '全真教考校弟子，你被分去和一个师兄过招。他偷偷递话：让他赢，他就在师父面前替你说好话。',
      choices: [
        { t: '照规矩比', check: ['武学', 40], dev: 0, fx: (g) => g.remember('w_qzk', 'won'), res: '你赢了。师兄的脸白了一下。',
          fail: { fx: (g) => g.remember('w_qzk', 'lost'), res: '你输了，输得心服。', dev: 0 } },
        { t: '让他赢', canon: true, fx: (g) => g.remember('w_qzk', 'let'), res: '你故意慢了一拍。师兄朝你眨了眨眼。' },
        { t: '当众把他的话说出来', dev: 0, fx: (g) => { g.stat('正邪', 2); g.remember('w_qzk', 'told'); }, res: '满殿的人都看着你们两个。' },
      ] },
    // 门派：明教
    { id: 'e_sect_mingjiao', y: [100, 150], minAge: 16, t: '俘虏', cond: (g) => /明教/.test(sect()) && !g.isMe('zhangwuji'),
      text: '分坛的兄弟抓了一个蒙古百户，要按教规把他处死祭火。百户被绑在柱子上，一声不吭。',
      choices: [
        { t: '依教规办', canon: true, fx: (g) => g.remember('w_mjp', 'burned'), res: '火堆点起来，你转过脸去。' },
        { t: '半夜放了他', dev: 0, fx: (g) => { g.stat('情义', 2); g.remember('w_mjp', 'freed'); }, res: '你割断绳子，他看了你一眼，钻进了黑夜。' },
        { t: '拿他去换被元兵抓走的兄弟', check: ['悟性', 45], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_mjp', 'swap'); }, res: '你托人带话过去。三天后，河滩上一边放一个人。',
          fail: { fx: (g) => g.remember('w_mjp', 'freed'), res: '元兵不肯换。最后你还是把他放了。', dev: 0 } },
      ] },
    // 门派：峨嵋
    { id: 'e_sect_emei', y: [80, 200], minAge: 12, t: '山下米铺', cond: (g) => /峨嵋/.test(sect()) && !g.isMe('guoxiang'),
      text: '你奉命下山采买。山脚米铺的老板被几个地痞堵着要“保护钱”，他认得你的衣裳，偷偷朝你使眼色。',
      choices: [
        { t: '按门规，不在山下惹事，回山禀报', canon: true, fx: (g) => g.remember('w_em', 'report'), res: '你背着米上山，一路上走得很快。' },
        { t: '出手教训他们', check: ['武学', 35], dev: 0, fx: (g) => { g.stat('声望', 2); g.remember('w_em', 'fought'); }, res: '三个地痞被你摔进了米缸。',
          fail: { fx: (g) => { g.stat('根骨', -4); g.remember('w_em', 'hurt'); }, res: '你一个人打不过三个，挨了一棍。', dev: 0 } },
        { t: '替老板付了这回的钱，再打听地痞的来历', dev: 0, fx: (g) => g.remember('w_em', 'paid'), res: '地痞拿了钱走了。你记下了他们的去向。' },
      ] },
  ]);

  /* ---------- 回响 ---------- */
  JY.addEncounters([
    echo('e_echo_gr_qz', (g) => [g.recall('w_qz'), g.since('w_qz')], '道人', 4, 12, {
      breath: { t: (g) => '你受了一回重伤，躺在床上提不起气。你想起' + QZ(g).n + '那句“别急”，照着吐纳了一夜。第二天你能下床了。', fx: (g) => g.stat('根骨', 8) },
      disciple: { t: (g) => '重阳宫来了一个小道士，送来一本抄好的入门心法，说是' + QZ(g).n + '嘱咐的。全真弟子在外面遇到你，都叫你一声' + (isF(g) ? '师姐' : '师兄') + '。', fx: (g) => { g.stat('武学', 4); g.stat('声望', 2); } },
      refused: { t: (g) => '你又碰到' + QZ(g).n + '。' + QZ(g).p + '看了看你，说这几年你心静多了，传了你一段' + QZ(g).art + '的口诀。', fx: (g) => g.stat('武学', 4) },
      advice: { t: (g) => '你照着' + QZ(g).n + '那句“' + pk(g, 'qzSay', QZ_SAY) + '”改了几年，今年忽然觉得通了。', fx: (g) => g.stat('武学', 5) },
    }),
    echo('e_echo_gr_doc', (g) => [g.recall('w_doc'), g.since('w_doc')], '郎中', 5, 16, {
      seen: { t: '那包药你一直没吃完。今年你病倒在客店里，翻出来吃了，第三天就好了。', fx: (g) => g.stat('根骨', 4) },
      learned: { t: (g) => '那年跟郎中学的' + DOC_ART(g) + '，今年在路上救了一个人。那人的家里人追了你三里地，非要送你一头驴。', fx: (g) => { g.stat('声望', 3); g.stat('悟性', 2); } },
      walked: { t: '那个郎中托人捎来一张方子，上面写着：“治你这身老伤。”你照方吃了一个月，夜里睡得安稳多了。', fx: (g) => { g.stat('根骨', 6); g.rel('郎中朋友', '走方郎中', '你替他背过药篓'); } },
    }),
    echo('e_echo_gr_biao', (g) => [g.recall('w_biao'), g.since('w_biao')], '镖旗', 4, 18, {
      no: { t: (g) => '你听说' + BIAO(g) + '那趟镖在半路被劫了，老镖头断了一条胳膊。', fx: (g) => g.stat('心境', -2) },
      rode: { t: (g) => BIAO(g) + '的老镖头告老了，托人送来一面小镖旗。他说往后你' + BIAO_RD(g) + '，亮出这面旗，没人为难你。', fx: (g) => { g.stat('声望', 3); g.rel('镖局旧识', BIAO(g) + '的老镖头'); } },
      decoy: { t: (g) => BIAO(g) + '在大门口挂了一块匾，写着你的名字。走镖的人传来传去，你的名字也传开了。', fx: (g) => g.stat('声望', 6) },
      hurt: { t: '那年走镖落下的刀伤，每逢阴天就疼。你摸着那道疤，想起山沟里的那一夜。', fx: (g) => { g.stat('根骨', -2); g.stat('心境', 1); } },
    }),
    echo('e_echo_gr_monk', (g) => [g.recall('w_monk'), g.since('w_monk')], '念珠', 5, 14, {
      alms: { t: '一个小沙弥找到你，说师父圆寂前念叨过一碗斋饭，托他送来一串念珠。', fx: (g) => g.stat('心境', 4) },
      fist: { t: '那套罗汉拳你练了几年。今年和人动手，你忽然发觉自己的下盘稳了很多。', fx: (g) => g.stat('武学', 5) },
      carry: { t: '你路过嵩山脚下，少林寺的知客僧听说了你的名字，留你住了三天，带你在藏经阁外的松树下坐了一个下午。', fx: (g) => g.stat('悟性', 4) },
    }),
    echo('e_echo_gr_nun', (g) => [g.recall('w_nun'), g.since('w_nun')], '小庵', 4, 14, {
      tea: { t: '你又路过那座小庵。庵门锁着，门上落满了灰。你在门口站了一会儿。', fx: (g) => g.stat('心境', -1) },
      roof: { t: '兵荒马乱的一年，那座小庵收留了一群逃难的妇孺。老尼托人捎话给你：屋顶没漏，一个孩子都没淋着。', fx: (g) => { g.stat('心境', 4); g.stat('正邪', 2); } },
      sword: { t: '那幅画上的剑意，你这些年慢慢想明白了。画画的人是谁，老尼到死都没说。', fx: (g) => g.stat('武学', 5) },
    }),
    echo('e_echo_gr_her', (g) => [g.recall('w_her'), g.since('w_her')], '山中人', 4, 20, {
      ignore: { t: (g) => '你和人比武，输在第' + pk(g, 'herN', ['三', '七', '十一']) + '招上。你想起山里那个人说的话。', fx: (g) => { g.stat('悟性', 3); g.stat('心境', -2); } },
      taught: { t: '你又上那座山找他，只找到一间空屋。墙上用炭写着几行字，是那路功夫后半截的改法。', fx: (g) => g.stat('武学', 6) },
      duelWon: { t: '那人托樵夫送来一柄旧剑，说你赢得干净。剑身上刻着两个小字，是一个你没听过的名字。', fx: (g) => { g.stat('声望', 3); g.stat('武学', 2); } },
      duelLost: { t: '你在山里又碰到那个人。他说那天下手重了，赔你三招。', fx: (g) => g.stat('武学', 5) },
    }),
    echo('e_echo_gr_lu', (g) => [g.recall('w_lu'), g.since('w_lu')], '归云庄', 3, 15, {
      tea: { t: '你听人说，归云庄的少庄主陆冠英带着庄丁剿了太湖上的一伙水寇。你想起那杯茶。', fx: (g) => g.stat('心境', 1) },
      leg: { t: '你和人动手时用出一记扫腿，对方连人带凳翻了出去。那是归云庄学来的。', fx: (g) => g.stat('武学', 5) },
      letter: { t: (g) => (g.Y >= 19 && g.alive('huangyaoshi') ? '你听说桃花岛主到过归云庄，把旋风扫叶腿的口诀还给了陆庄主。陆庄主逢人便说，那封信没有白写。' : '你托东海的渔夫把信送上了桃花岛。信有没有人看，你不知道。陆庄主却从此把你当自家人。'),
        fx: (g) => { g.stat('情义', 3); g.rel('归云庄', '陆乘风', '你替他送过信'); } },
    }),
    echo('e_echo_gr_feng', (g) => [g.recall('w_feng'), g.since('w_feng')], '铁匠', 3, 16, {
      blade: { t: (g) => '你被人堵在巷子里，' + FENG_W(g) + '磕飞了第一把刀。那个瘸腿铁匠打的东西，果然结实。', fx: (g) => { g.stat('根骨', 3); g.stat('声望', 2); } },
      bellows: { t: '那一冬拉风箱练出来的两条胳膊，今年救了你一回。你从崖上滑下去，硬是抓住了一截树根。', fx: (g) => g.stat('根骨', 5) },
      secret: { t: '铁匠那晚说漏了一句，他姓冯，是桃花岛出来的。后来他离了铁匠铺，再没回来，有人说他去了蒙古大营。他教你的那两下指法，你一直记着。', fx: (g) => g.stat('武学', 5) },
      shut: { t: '你又去那间铁匠铺，炉子早就冷了。邻居说铁匠是半夜走的，一句话也没留。', fx: (g) => g.stat('心境', -2) },
    }),
    echo('e_echo_gr_zhu', (g) => [g.recall('w_zhu'), g.since('w_zhu')], '新皇', 15, 20, {
      fed: { t: (g) => '新朝的皇帝登基了。告示上说他年轻时当过和尚，讨过饭。' + (g.knows('zhuyuanzhang') ? '你早就认得他，今年才想起来，当年那个讨饭的小和尚就是他。' : '你想起那个下巴很长的小和尚。') + '那碗饭你记得，他大概也记得。', fx: (g) => g.stat('心境', 3) },
      work: { t: (g) => '新朝的皇帝登基了。听说他年轻时讨过饭，最恨白吃白喝的人。' + (g.knows('zhuyuanzhang') ? '你认得他好些年，' : '') + '你想起那个替你干了半天活的小和尚，干活倒是卖力。', fx: (g) => g.stat('悟性', 2) },
      chased: { t: (g) => '新朝的皇帝登基了。听说他年轻时当过和尚，被人赶来赶去。' + (g.knows('zhuyuanzhang') ? '你认得他好些年，今年才想起那张脸。' : '') + '你想起那个被你赶走的小和尚，后背凉了一阵。', fx: (g) => g.stat('心境', -3) },
    }, (g) => g.Y >= 144 && g.alive('zhuyuanzhang')),
    echo('e_echo_gr_wei', (g) => [g.recall('w_wei'), g.since('w_wei')], '青翼', 3, 16, {
      fled: { t: '你听说那一带后来死了几个过路的人，脖子上都有两个牙印。你庆幸那晚走得快。', fx: (g) => g.stat('心境', -2) },
      fire: { t: '一天夜里窗外刮过一阵风，桌上多了一个布包，里面是一包金叶子和一张字条：“谢你那囊酒。青翼蝠王。”', fx: (g) => g.stat('心境', 3) },
      fought: { t: '江湖上传言，青翼蝠王那年吃了一回亏。没人知道是谁干的，你也没说。', fx: (g) => { g.stat('武学', 3); g.stat('声望', 2); } },
      bitten: { t: '你颈上那两个牙印一直没消，每到冬天就发冷。', fx: (g) => g.stat('根骨', -4) },
    }),
    echo('e_echo_gr_mj', (g) => [g.recall('w_mj'), g.since('w_mj')], '火焰', 4, 16, {
      grain: { t: '你在路上被一伙红巾拦住。领头的看了看你的手心，挥手放行，说你是给过米的人。', fx: (g) => g.stat('情义', 2) },
      join: { t: '明教的兄弟找上门来，交给你一个分坛的差事。粥棚、药铺、递信，你都干过。', fx: (g) => { g.stat('声望', 3); g.stat('情义', 2); } },
      report: { t: (g) => (g.isMe('zhaomin') ? '王府的侍卫去拿' : '官兵去拿') + MJ(g).n + '，扑了个空，粥棚被一把火烧了。那一带的穷人见了你，都绕着走。', fx: (g) => { g.stat('正邪', -2); g.stat('声望', -2); } },
    }),
    echo('e_echo_gr_hu', (g) => [g.recall('w_hu'), g.since('w_hu')], '蝴蝶谷', 3, 16, {
      no: { t: '那场病拖了一年才好，落下了咳嗽的毛病。', fx: (g) => g.stat('根骨', -3) },
      lied: { t: (g) => (g.alive('huqingniu') ? '胡青牛托人捎来一句话：“下回别装了，明教弟子没你这么斯文。”你那病再没犯过。' : '你听说蝴蝶谷出了事，胡青牛死了。你想起他给你扎针时说的话：“下回别装了，明教弟子没你这么斯文。”'), fx: (g) => g.stat('根骨', 3) },
      knelt: { t: '跪到第三天，谷里出来一个小药童，塞给你一包药，说是谷主扔在门口不要的。你吃了，病好了大半。', fx: (g) => g.stat('根骨', 8) },
      member: { t: '你在蝴蝶谷养好了病。胡青牛还给你开了一张调理的方子，说明教的兄弟命贱，更要省着用。', fx: (g) => g.stat('根骨', 4) },
    }),
    echo('e_echo_gr_vet', (g) => [g.recall('w_vet'), g.since('w_vet')], '老兵', 5, 15, {
      story: { t: '你在一场混战里想起老兵说过的话：“先看退路。”那天你是少数走出来的人。', fx: (g) => { g.stat('根骨', 2); g.stat('悟性', 3); } },
      art: { t: (g) => '老兵传你的' + VET(g).art + '，你练熟了。今年有人见你使出来，问你在哪个营里当过兵。', fx: (g) => g.stat('武学', 5) },
      care: { t: (g) => '老兵过世了。走前他把一个布包塞给你，里面是一面褪了色的旧旗。', fx: (g) => { g.stat('情义', 3); g.rel('老兵', VET(g).who.replace(/^一个/, ''), '已过世，留给你一面旧旗'); } },
    }),
    echo('e_echo_gr_tu', (g) => [g.recall('w_tu'), g.since('w_tu')], '弟子', 6, 36, {
      took: { t: (g) => (pk(g, 'tuFate', ['good', 'bad']) === 'good' ? '你那个弟子出师了，第一次下山就替一个村子赶走了马贼。回来时，他在你门口又跪了一夜，这回是谢师。' : '你那个弟子在外面闯了祸，伤了一个大户的儿子。人家找上门来，你赔了一年的积蓄，才把人领回来。'),
        fx: (g) => { if (pk(g, 'tuFate', ['good', 'bad']) === 'good') { g.stat('声望', 4); g.stat('心境', 3); } else { g.stat('心境', -3); g.stat('情义', 2); } } },
      sent: { t: '那个孩子进了门派，学得很好。他师父来信说，孩子常提起你，说是你给他指的路。', fx: (g) => g.stat('声望', 2) },
      three: { t: '江湖上出了个后生，凭三招闯出了名号。有人认出那三招的来历，一路找到了你门口。', fx: (g) => g.stat('声望', 4) },
    }),
    echo('e_echo_gr_duel', (g) => [g.recall('w_duel'), g.since('w_duel')], '再会', (v) => (v === 'later' ? 10 : 3), 28, {
      won: { t: '那个输给你的人回去苦练了三年，又来了。这回他没带兵器，提着两坛酒，说要和你结拜。', fx: (g) => g.stat('情义', 3) },
      lost: { t: '你输给那个人的事传开了。你闭门练了一年，再出门时，没人再提这件事。', fx: (g) => g.stat('武学', 4) },
      declined: { t: '江湖上开始有人说你老了。你听见了，笑了笑。', fx: (g) => g.stat('心境', 3) },
      later: { t: '十年之约到了。那个人如约而来，鬓边也有了白发。你们比了一百招，没分胜负，然后一起喝了一夜的酒。', fx: (g) => { g.stat('武学', 3); g.stat('情义', 3); } },
    }),
    echo('e_echo_gr_bully', (g) => [g.recall('w_bully'), g.since('w_bully')], '旧怨', 4, 14, {
      bear: { t: (g) => '你又遇见了' + BULLY(g).replace(/^一个/, '那个') + '。他老了，被几个更年轻的人欺负。你看了一会儿，走开了。', fx: (g) => g.stat('心境', 2) },
      fought: { t: (g) => '自那天起，' + BULLY(g).replace(/^一个/, '那个') + '见了你就绕道走。镇上的孩子都跟在你身后。', fx: (g) => { g.stat('声望', 2); g.stat('情义', 2); } },
      beaten: { t: '那顿打让你明白了一件事。你开始每天天不亮就起来扎马步。', fx: (g) => g.stat('武学', 3) },
      train: { t: (g) => '你回到那个镇子，' + BULLY(g).replace(/^一个/, '那个') + '还在街上横着走。你只出了一招，他就跪下了。你没有再打第二下。', fx: (g) => { g.stat('武学', 2); g.stat('声望', 3); } },
    }),
    echo('e_echo_ev_levy', (g) => [g.recall('w_levy'), g.since('w_levy')], '荒年', 3, 15, {
      paid: { t: '那年冬天，村里饿死了两个老人。你家的粮缸见了底，靠挖野菜熬到开春。', fx: (g) => { g.stat('根骨', -2); g.stat('心境', -2); } },
      hid: { t: '那一洞粮食，让半个村子熬过了开春。乡亲们见了你，都多叫一声。', fx: (g) => g.stat('情义', 3) },
      caught: { t: '你被拉去修了半年城墙。回来那天，村里人凑了一锅肉给你接风。', fx: (g) => { g.stat('根骨', -2); g.stat('情义', 2); } },
      led: { t: '那个村子后来再没人来收第二回。邻村的人遇上事，也跑来找你出主意。', fx: (g) => g.stat('声望', 3) },
    }),
    echo('e_echo_ev_blade', (g) => [g.recall('w_blade'), g.since('w_blade')], '那把刀', 5, 16, {
      gave: { t: '有一夜贼人进了村。你摸遍了屋子，只找到一根擀面杖。', fx: (g) => { g.stat('根骨', -3); g.stat('心境', -2); } },
      buried: { t: (g) => '你挖开后院那棵葱底下，油布里的兵器一点没锈。' + (g.Y >= 128 ? '各地都在起事，用得上了。' : '你看了看，又埋了回去，埋得更深。'), fx: (g) => g.stat('心境', 2) },
      fought: { t: '那几个差役再没敢来。你家后院成了村里人藏刀的地方。', fx: (g) => { g.stat('声望', 3); g.stat('正邪', 1); } },
      jailed: { t: '你在牢里关了半年。出来时，告示又换了一张，搜得更紧了。', fx: (g) => g.stat('心境', -3) },
    }),
    echo('e_echo_ev_stone', (g) => [g.recall('w_stone'), g.since('w_stone')], '红巾', 4, 16, {
      saw: { t: '石人的话传遍了天下。那天你看到的，后来人人都说自己看到过。', fx: (g) => g.stat('悟性', 2) },
      rose: { t: '那一伙河工编进了红巾军，打下了好几座城。领头的托人给你捎来一条红巾，说当年第一把火有你一份。', fx: (g) => { g.stat('声望', 4); g.stat('正邪', 2); } },
      calm: { t: '那天听了你的劝、回了家的河工，后来又被官府抓回去修河。没散的那一半，有的死了，有的当了将军。', fx: (g) => { g.stat('心境', -2); g.stat('悟性', 2); } },
    }),
    echo('e_echo_ev_purge', (g) => [g.recall('w_purge'), g.since('w_purge')], '名册', 3, 22, {
      silent: { t: '差役又来了两回，你都说不认得。第三回他们没来。你听说邻县有人指认了十几个，换了一顶官帽。', fx: (g) => g.stat('心境', -1) },
      burned: { t: '县衙的名册烧了，重抄要半年。名册上的人，有一半趁这半年走了。', fx: (g) => { g.stat('正邪', 4); g.stat('声望', 2); } },
      jailed: { t: (g) => '你在县牢里被审了三个月。' + (g.f('zhuFed') ? '放你那天，县官说上头传下话来，早年施过皇上一碗饭的乡里，一律宽待。你们这一乡，有人当年给过他一碗饭。' : '放出来时，你瘦得只剩一把骨头。'), fx: (g) => g.stat('根骨', -3) },
      left: { t: '你在山沟里搭了几间草屋。消息传来，原先住的村子被抄了一半。', fx: (g) => g.stat('心境', 1) },
    }),
    echo('e_echo_ev_ref', (g) => [g.recall('w_ref'), g.since('w_ref')], '那个孩子', 5, 18, {
      booth: { t: '粥棚里的孩子后来大多被送去了城南的义庄。那个拽你衣角的孩子，你再没见过。', fx: (g) => g.stat('心境', -2) },
      adopt: { t: (g) => '那个孩子长大了，' + pk(g, 'refGrow', ['跟着城里的铁匠当了学徒', '进了襄阳的守军', '学会了认字，替你记账']) + '。他叫你' + (isF(g) ? '娘' : '爹') + '，叫得很自然。', fx: (g) => { g.stat('情义', 4); g.stat('心境', 3); } },
      search: { t: '那孩子的娘后来在城里摆了个馄饨摊。你去吃，她从来不收钱。', fx: (g) => { g.stat('情义', 2); g.stat('心境', 3); } },
    }),
    echo('e_echo_ev_spy', (g) => [g.recall('w_spy'), g.since('w_spy')], '城防图', 2, 18, {
      told: { t: '守军搜了一夜，在一个炭筐底下找到一张画了一半的城防图。', fx: (g) => g.stat('声望', 1) },
      caught: { t: '那张纸上画的是襄阳的水门。守军连夜改了水门的闸。', fx: (g) => { g.stat('声望', 3); g.stat('正邪', 2); } },
      tailed: { t: '你跟着那人摸到城外一座破窑，里面藏着十几个蒙古细作。你回城报信，守军一网打尽。', fx: (g) => g.stat('声望', 5) },
      escaped: { t: '那个卖炭的跑了。第二年蒙古人攻城，专挑水门打。', fx: (g) => g.stat('心境', -3) },
    }),
    echo('e_echo_pl_wreck', (g) => [g.recall('w_wreck'), g.since('w_wreck')], '油布包', 3, 10, {
      servant: { t: '那个落水的人养好了伤，被哑仆们送上了回大陆的船。他留下了那个油布包，里面是一张东海的海图。', fx: (g) => g.stat('悟性', 2) },
      boat: { t: '一年后，一条渔船在岛外放下一篓鲜鱼和一封信。那个人说他回了家，给你立了个长生牌位。', fx: (g) => { g.stat('心境', 3); g.stat('情义', 2); } },
      maze: { t: (g) => '那个人在桃林里转了三天，出来时头发白了一半。' + (g.alive('huangyaoshi') && g.knows('huangyaoshi') ? '你' + g.knows('huangyaoshi') + '知道了，罚你在桃林里抄了一个月的阵图。' : '没有人罚你。你自己在桃林边坐了一夜。'), fx: (g) => { g.stat('悟性', 4); g.stat('心境', -2); } },
    }),
    echo('e_echo_pl_wood', (g) => [g.recall('w_wood'), g.since('w_wood')], '山下人', 3, 10, {
      honey: { t: '那个樵夫逢人便说，终南山后山住着神仙，一小瓶蜂浆就能治百病。来求蜜的人都被林子挡了回去。', fx: (g) => g.stat('心境', 1) },
      carried: { t: '每年冬天，你住处外的大石上都会多一捆干柴，一串风干的野兔。', fx: (g) => { g.stat('情义', 2); g.stat('心境', 2); } },
      watch: { t: '樵夫后来自己爬了出去。山下的人说后山有鬼，再没人往这边砍柴。', fx: (g) => g.stat('心境', 2) },
    }),
    echo('e_echo_pl_monkey', (g) => [g.recall('w_monkey'), g.since('w_monkey')], '金顶', 3, 10, {
      cave: { t: '那个山洞的石壁上刻满了剑招，刻的人不知是谁。你这几年常去，一招一招描了下来。', fx: (g) => g.stat('武学', 5) },
      fell: { t: '那一跤摔伤的腿，阴天还会疼。那群猴子倒是常来，蹲在墙头看你。', fx: (g) => { g.stat('根骨', -1); g.stat('心境', 2); } },
      trade: { t: '那只老猴子常来找你，有时叼来几颗野果，有时是一块碎银子，不知从哪个香客那里偷的。', fx: (g) => g.stat('心境', 3) },
      let: { t: (g) => '过了两年，你在崖边的松树杈上找到了你的' + pk(g, 'monkeyItem', ['剑穗', '一卷经书', '干粮袋', '发簪']).replace(/^一卷/, '') + '，已经被风吹得发白。', fx: (g) => g.stat('心境', 2) },
    }),
    echo('e_echo_pl_naadam', (g) => [g.recall('w_naadam'), g.since('w_naadam')], '草原', 3, 10, {
      wrestle: { t: '那达慕上把你摔进泥里的那个壮汉，后来当了千夫长。他见了你，总要拉你再摔一跤。', fx: (g) => { g.stat('根骨', 3); g.stat('情义', 2); } },
      arrow: { t: '那年射箭赢来的黄骠马，驮着你走了很多年的路。', fx: (g) => { g.stat('根骨', 2); g.stat('心境', 2); } },
      lost: { t: '你输了以后，第二年又去，又输了。草原上的人都说你是最不服输的那个。', fx: (g) => { g.stat('心境', 1); g.stat('声望', 1); } },
      watch: { t: '那天记下的摔跤步子，你后来和人动手时用上了。', fx: (g) => g.stat('武学', 2) },
    }),
    echo('e_echo_pl_wolf', (g) => [g.recall('w_wolf'), g.since('w_wolf')], '狼', 4, 12, {
      fire: { t: '那一夜之后，你守夜再也不怕黑了。', fx: (g) => g.stat('心境', 2) },
      alpha: { t: '头狼的皮你铺在床上。草原上的人见了你，都叫你“杀狼的”。', fx: (g) => g.stat('声望', 2) },
      bitten: { t: '腿上那道狼咬的疤，成了你给孩子们讲故事的开头。', fx: (g) => g.stat('心境', 1) },
      cub: { t: '那只狼崽长大了，跟了你一年，有一夜走了，再没回来。后来你在野地里听见狼嚎，会停下来听一会儿。', fx: (g) => g.stat('心境', 3) },
    }),
    echo('e_echo_pl_opera', (g) => [g.recall('w_opera'), g.since('w_opera')], '新戏', 4, 14, {
      left: { t: '那出戏后来再没人敢演。你偶尔还能哼出两句。', fx: (g) => g.stat('心境', 1) },
      hid: { t: '那个写戏的书生又写了一出新戏，戏里有个仗义的过路人，名字和你只差一个字。', fx: (g) => { g.stat('声望', 3); g.stat('心境', 2); } },
      acted: { t: '那天你在台上胡编的几句词，被人抄去传唱。满街的孩子都在唱。', fx: (g) => g.stat('声望', 3) },
      jailed: { t: '你挨了二十板子。养伤那几天，戏班的人轮流来看你，给你演了一出又一出。', fx: (g) => { g.stat('根骨', -3); g.stat('情义', 3); } },
    }),
    echo('e_echo_pl_salt', (g) => [g.recall('w_salt'), g.since('w_salt')], '毒盐', 4, 16, {
      join: { t: (g) => (g.Y >= 114 ? '王盘山岛上一场扬刀大会，海沙派死伤大半。当年一起押船的人，没剩几个。你庆幸早早下了船。' : '海沙派的人又来找你，说你押船押得稳，要你入派。你推了，从此码头上总有人跟着你。'), fx: (g) => g.stat('心境', -2) },
      report: { t: '盐课司查了半年，抓了几个小喽啰。海沙派放话要你一只手，你在那一带少走了几年。', fx: (g) => { g.stat('正邪', 2); g.stat('声望', 2); } },
      ignore: { t: '码头上那几个押船的人，后来有一个死在官船上。毒盐被风吹回了他自己脸上。', fx: (g) => g.stat('心境', -1) },
    }),
    echo('e_echo_pl_fish', (g) => [g.recall('w_fish'), g.since('w_fish')], '水上', 4, 12, {
      swim: { t: '你坐的船翻在江心，同船的人都慌了。你游上了岸，还拖回来一个。', fx: (g) => { g.stat('根骨', 2); g.stat('声望', 2); } },
      net: { t: '老渔夫过世了。他的儿子把那张补过的网送给你，说是爹交代的。', fx: (g) => { g.stat('心境', 2); g.stat('情义', 2); } },
      pirate: { t: '那一夜记下的水寇窝，你后来带着官兵去端了。湖上的渔家都认得你。', fx: (g) => g.stat('声望', 4) },
    }),
    echo('e_echo_pl_merchant', (g) => [g.recall('w_hu2'), g.since('w_hu2')], '西域来的东西', 4, 16, {
      bought: { t: (g) => ({ '一柄波斯弯刀': '那柄波斯弯刀削铁如泥。今年和人动手，对方的刀被你一下削成了两截。', '一包西域的香料': '那包香料原来是一味奇药。你用它敷了旧伤，三天就消了肿。', '一张画着雪山的旧地图': '你照着那张旧地图进了一回雪山，找到一座废弃的石屋，墙上画着半套胡人的拳法。' })[HU_ITEM(g)],
        fx: (g) => { const it = HU_ITEM(g); if (it === '一柄波斯弯刀') g.stat('武学', 3); else if (it === '一包西域的香料') g.stat('根骨', 5); else g.stat('悟性', 3); } },
      saved: { t: '那个胡商又来了中原，带着一队驼马。他四处打听你，要请你做商队的护卫头领。', fx: (g) => { g.stat('声望', 2); g.rel('胡商朋友', '西域胡商', '你替他赶走过地痞'); } },
      none: { t: '你后来在别处见过一样的东西，价钱只要当年的一半。', fx: (g) => g.stat('心境', 1) },
    }),
    echo('e_echo_al_dark', (g) => [g.recall('w_dark'), g.since('w_dark')], '那一票', 3, 20, {
      join: { t: '那一票干成了。分到手的银子你花得很快，追查的捕快却慢慢查到了你门口。', fx: (g) => { g.stat('声望', -3); g.stat('心境', -2); } },
      no: { t: '那伙人后来被官兵一锅端了。你庆幸那杯酒只喝了一口。', fx: (g) => g.stat('心境', 2) },
      trap: { t: '那伙人在半路被官兵截住，一个也没跑掉。黑道上开始有人悄悄打听你的名字。', fx: (g) => { g.stat('正邪', 3); g.stat('声望', 2); } },
      exposed: { t: '你报官的事漏了风。一个雨夜，那伙人堵住了你，你身上多了三道刀疤。', fx: (g) => g.stat('根骨', -3) },
    }),
    echo('e_echo_al_hero', (g) => [g.recall('w_hero'), g.since('w_hero')], '乡亲', 4, 20, {
      slew: { t: (g) => '乡亲们在村口立了一块碑，刻的是你除掉' + EVIL(g).n.replace(/^一只|^一伙/, '') + '的事。路过的人念着念着，把你念成了一个传说。', fx: (g) => { g.stat('声望', 3); g.stat('心境', 2); } },
      hurt: { t: '你那次落下的伤，乡亲们一直记着。每年秋收，都有人挑着粮食来看你。', fx: (g) => g.stat('情义', 3) },
      talked: { t: (g) => EVIL(g).n.replace(/^一伙/, '那伙') + '后来真的收了手。也有人说，只是换了个地方作恶。', fx: (g) => g.stat('悟性', 2) },
      no: { t: '你听说乡亲们后来又凑了二两银子，请了别人。那个人没有回来。', fx: (g) => g.stat('心境', -3) },
    }),
    echo('e_echo_sx_needle', (g) => [g.recall('w_needle'), g.since('w_needle')], '针', 4, 12, {
      needle: { t: '你被人拦在巷口。袖中一枚绣花针飞出去，正钉在对方的手腕上。老婆婆教的，你没忘。', fx: (g) => { g.stat('武学', 3); g.stat('声望', 2); } },
      sew: { t: '你绣的一方帕子被人高价买走，说针脚里有股劲。', fx: (g) => g.stat('心境', 3) },
      sell: { t: '老婆婆去世前，把绣坊托付给了你。绣坊不大，养活了五六个寡妇。', fx: (g) => { g.stat('情义', 3); g.rel('绣坊', '绣坊的老婆婆', '把绣坊托付给你'); } },
    }),
    echo('e_echo_sx_lei', (g) => [g.recall('w_lei'), g.since('w_lei')], '红衣', 4, 20, {
      watch: { t: '那个红衣姑娘后来嫁了个镖师，夫妻俩一起走镖。江湖上多了一对“红衣双刀”。', fx: (g) => g.stat('心境', 1) },
      won: { t: '那个红衣姑娘没有怪你。她后来投了一个门派，见了你还叫你一声大哥。', fx: (g) => g.stat('情义', 3) },
      lost: { t: '你被一个姑娘踢下擂台的事，你没跟任何人讲，却被别人讲了很多年。', fx: (g) => { g.stat('心境', 2); g.stat('声望', -1); } },
      expose: { t: '员外的擂台拆了。那个红衣姑娘离了家，托人带话来谢你。', fx: (g) => { g.stat('正邪', 3); g.stat('声望', 2); } },
    }),
    echo('e_echo_ch_school', (g) => [g.recall('w_school'), g.since('w_school')], '先生', 5, 11, {
      study: { t: '老先生病重，叫你去床前，把一箱子书留给了你。', fx: (g) => g.stat('悟性', 4) },
      window: { t: '你在窗外听了几年，比屋里的学生背得还熟。老先生知道，一直没说破。', fx: (g) => g.stat('悟性', 3) },
      fish: { t: '那几年摸鱼练出来的水性，今年救了你一命。你掉进河里，自己游上了岸。', fx: (g) => g.stat('根骨', 3) },
    }),
    echo('e_echo_ch_fair', (g) => [g.recall('w_fair'), g.since('w_fair')], '庙会', 4, 9, {
      wait: { t: '你一直记得那天站在人群里等的滋味。后来不管走到哪里，你都先记路。', fx: (g) => g.stat('悟性', 2) },
      troupe: { t: (g) => '那个' + pk(g, 'fairArt', ['耍猴的', '耍飞刀的', '顶缸的']) + '艺人又来了一回，教你翻跟头。你翻得比他还好。', fx: (g) => g.stat('根骨', 3) },
      self: { t: '那天你自己走回了家，天已经黑了。从那以后，大人都说你胆子大。', fx: (g) => g.stat('心境', 2) },
    }),
    echo('e_echo_old_letter', (g) => [g.recall('w_letter'), g.since('w_letter')], '故人之子', 4, 58, {
      kept: { t: '故人的孩子在你家住了几年，挑水、劈柴、替你读信。你病倒的那一冬，是他守着你。', fx: (g) => { g.stat('根骨', 3); g.stat('情义', 3); } },
      money: { t: '那个孩子托人捎来一包家乡的茶叶。信上说，他在亲戚家过得好。', fx: (g) => g.stat('心境', 2) },
      ask: { t: '你从那封信里想起很多年前的一个晚上。你和那个人一起喝酒，说过要做一件大事。那件事你们都没做成。', fx: (g) => { g.stat('悟性', 2); g.stat('心境', -1); } },
    }),
    echo('e_echo_old_memoir', (g) => [g.recall('w_memoir'), g.since('w_memoir')], '书里的你', 3, 62, {
      true: { t: (g) => '那本笔记刻印出来了。写你的那一篇不长，好事坏事都在。' + (g.s('正邪') >= 20 ? '读过的人说你是条汉子。' : '读过的人对你褒贬不一。'), fx: (g) => g.stat('声望', 2) },
      nice: { t: '那本笔记刻印出来了。书里的你比你本人好得多，你读了两遍，有点脸红。', fx: (g) => { g.stat('声望', 3); g.stat('心境', -1); } },
      none: { t: '那本笔记刻印出来了，没有你的名字。你翻了翻，里面写的好几个人你都认得。', fx: (g) => g.stat('心境', 2) },
    }),
    echo('e_echo_sect_gb', (g) => [g.recall('w_gb'), g.since('w_gb')], '分舵', 3, 16, {
      dirty: { t: '污衣派的长老记着你。分舵里有了好差事，总先想到你。', fx: (g) => { g.stat('声望', 2); g.stat('情义', 2); } },
      clean: { t: '自从那顿酒，污衣派的兄弟见了你都扭过头去。净衣派的人倒常来请你。', fx: (g) => { g.stat('声望', 1); g.stat('情义', -2); } },
      none: { t: (g) => '两派后来打了一架，都骂你是墙头草。' + g.slot('丐帮帮主') + '听说了，倒说你做得对。', fx: (g) => g.stat('心境', 2) },
    }),
    echo('e_echo_sect_qz', (g) => [g.recall('w_qzk'), g.since('w_qzk')], '藏经阁', 3, 14, {
      won: { t: '你赢的那一场，被掌教记了名字，许你进藏经阁抄经。', fx: (g) => { g.stat('悟性', 3); g.stat('武学', 2); } },
      lost: { t: '那个师兄后来常来找你练剑。你们谁也不提那一场。', fx: (g) => { g.stat('武学', 2); g.stat('情义', 2); } },
      let: { t: '那个师兄果然替你说了好话。可那一场是怎么输的，你自己知道，好几年都不痛快。', fx: (g) => { g.stat('心境', -3); g.stat('声望', 2); } },
      told: { t: '师父罚了那个师兄，也罚了你，说同门不该当众揭短。可从那以后，再没人找你说那种话。', fx: (g) => g.stat('正邪', 3) },
    }),
    echo('e_echo_sect_mj', (g) => [g.recall('w_mjp'), g.since('w_mjp')], '百户', 4, 18, {
      burned: { t: '那个百户的弟弟带兵来报仇，烧了分坛所在的村子。', fx: (g) => g.stat('心境', -3) },
      freed: { t: '你后来被元兵抓住，审你的正是那个百户。他看了你很久，夜里把牢门的锁打开了。', fx: (g) => { g.stat('根骨', 2); g.stat('情义', 3); } },
      swap: { t: '换回来的那个兄弟，后来当了义军的统领。他逢人就说，他的命是你换回来的。', fx: (g) => g.stat('声望', 3) },
    }),
    echo('e_echo_sect_em', (g) => [g.recall('w_em'), g.since('w_em')], '米铺', 3, 14, {
      report: { t: '师门派了两位师姐下山，把那伙地痞赶走了。米铺老板逢年过节都往山上送米。', fx: (g) => g.stat('心境', 2) },
      fought: { t: '那伙地痞再没来过。山下的人都说，峨嵋派出了个厉害的弟子。', fx: (g) => g.stat('声望', 3) },
      hurt: { t: '你挨了一棍，回山被罚面壁。第二天，那伙地痞的头目被人捆在山门外的树上，没人承认是谁干的。', fx: (g) => g.stat('心境', 2) },
      paid: { t: '你打听到那伙地痞是城里一家武馆的人。武馆后来关了门，馆主托人送来一封赔罪的信。', fx: (g) => g.stat('悟性', 2) },
    }),
  ]);
})();

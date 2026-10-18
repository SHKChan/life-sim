/* 群侠 · 西南：峨嵋山、大理（字段说明见 zhongyuan.js 开头） */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEvents([
    /* ---------- 峨嵋 ---------- */
    { id: 'em_join', who: 'jingxuan', act: '求拜入峨嵋', cond: (g) => !g.sect && g.before(134, 2), once: false, t: '拜师',
      text: '静玄看了你半天：“峨嵋收弟子，先看品行，再看根骨。你为什么要学剑？”',
      choices: [
        { t: '为了行侠仗义', check: ['品德', 50], fx: (g) => { g.setSect('emei'); g.learn('emei_jian', 1); g.add('品德', 2); }, res: '静玄带你去见了灭绝师太。师太说：“记住你今天的话。”你成了峨嵋弟子。', fail: { res: '静玄说：“行侠仗义，说说容易。你先回去吧。”' } },
        { t: '为了不再受人欺负', check: ['根骨', 18], fx: (g) => { g.setSect('emei'); g.learn('emei_jian', 1); }, res: '静玄说这个理由实在。你成了峨嵋弟子。', fail: { res: '静玄捏了捏你的胳膊，摇了摇头。' } },
        { t: '算了', res: '你下山去了。' },
      ] },
    { id: 'em_rank3', t: '师父的话',
      text: '灭绝师太把你叫到后殿：“你入了内门。我问你：将来遇见魔教的人，你怎么做？”',
      choices: [
        { t: '照师父的规矩，一个也不放过', fx: (g) => { g.add('品德', -3); g.set('miejueFavor'); g.learn('jieshou', 1); }, res: '师太点了点头。当晚她亲自教了你截手九式的头几招。' },
        { t: '先问清是非，再动手', fx: (g) => { g.add('品德', 4); g.set('emeiDoubt'); }, res: '师太看了你很久：“你会后悔的。”静玄在门外听见，叹了一口气。' },
      ] },
    { id: 'em_expel', t: '逐出师门',
      text: '你一上金顶，静玄就拦住了你：“你在山下做的事，师父都知道了。”',
      choices: [
        { t: '跪下认错', check: ['品德', 40], fx: (g) => { g.add('品德', 5); g.days(30); }, res: '你面壁一个月。静玄说，再有下次，谁也保不了你。', fail: { fx: (g) => g.setSect(''), res: '静玄没有让你进门。你从此不是峨嵋弟子了。' } },
        { t: '转身下山', fx: (g) => g.setSect(''), res: '你把峨嵋的剑穗解下来，挂在了山门上。' },
      ] },
    { id: 'em_jinding', loc: 'emei', explore: 'emei', once: false, w: 3, t: '金顶',
      text: '天没亮你就上了金顶。太阳从云海里升起来，云上有一圈七彩的光，光里有一个影子，就是你自己。',
      choices: [
        { t: '对着佛光打坐', fx: (g) => { g.add('资质', 0.5); g.restMp(60); }, res: '光散了，你心里亮了一块。' },
        { t: '对着佛光练剑', fx: (g) => g.add('轻功', 0.5), res: '你的影子在云上跟着你动。' },
      ] },
    { id: 'em_monkey', loc: 'emei', explore: 'emei', once: false, w: 2, t: '猴子',
      text: '一只大猴子从树上跳下来，抓起你的包袱就跑。',
      choices: [
        { t: '追', check: ['轻功', 30], fx: (g) => g.add('轻功', 1), res: '你追了它三个山头，它扔下包袱跑了。你脚下轻了不少。', fail: { fx: (g) => g.add('银两', -Math.round(g.money() * 0.2)), res: '猴子钻进了林子。包袱后来在山涧边找到了，银子少了一些。' } },
        { t: '扔一个果子给它换', fx: (g) => g.add('品德', 1), res: '猴子接了果子，把包袱扔了回来。' },
      ] },
    { id: 'em_zhou_young', who: 'zhouzhiruo', act: '陪她洗剑', cond: (g) => g.before(134, 2), t: '溪边',
      text: '周芷若说，她小时候在汉水边，有个中了寒毒的男孩子，她喂过他一碗饭。“不知道他还活着没有。”',
      choices: [
        { t: '说他一定还活着', fx: (g) => { g.set('zhouFriend'); g.add('品德', 1); }, res: '她笑了一下：“借你吉言。”后来她见了你，总会点一点头。' },
        { t: '问她想不想下山去找', fx: (g) => g.set('zhouDoubt'), res: '她低下头：“师父不许。”说完就拿着剑走了。' },
      ] },
    { id: 'em_zhou_sword', who: 'zhouzhiruo', act: '向周掌门讨倚天剑', cond: (g) => g.after(135, 8) && g.holder('yitian') === 'zhouzhiruo' && !g.has('yitian'), once: false, t: '倚天剑',
      text: '周芷若坐在掌门的位子上，倚天剑横在膝前。“这是峨嵋祖师的剑。你凭什么要？”',
      choices: [
        { t: '说出灵蛇岛那一夜你看见的事', cond: (g) => g.f('knowZhouSecret'), check: ['资质', 50],
          fx: (g) => { g.give('yitian'); g.give('jiuyin'); g.add('品德', -6); }, res: '她的脸一下白了。过了很久，她把剑和一卷经文推到你面前：“拿走。你今天没来过峨嵋。”',
          fail: { res: '她冷笑一声：“你看错了。”' } },
        { t: '按江湖规矩，比一场', fight: { foes: ['zhouzhiruo'], win: { fx: (g) => { g.give('yitian'); g.give('jiuyin'); g.add('品德', -10); g.add('声望', 15); }, res: '你赢了。她把剑递过来的时候手很稳，眼睛很冷。剑柄里藏着一卷九阴真经。' }, lose: { res: '她的指尖在你喉咙前停住了。“下山去。”' } } },
        { t: '告辞', res: '你退了出去。' },
      ] },
    { id: 'em_miejue_after', who: 'miejue', act: '去后山看望师太', cond: (g) => g.f('miejueLives'), t: '后山',
      text: '灭绝师太坐在后山的石头上看云。她说她一辈子恨魔教，到头来是魔教的人和你救了她。',
      choices: [
        { t: '陪她坐一会儿', fx: (g) => { g.add('品德', 3); g.learn('emei_jiuyang', 1); }, res: '她说了很多郭襄祖师的事。临走，她把峨嵋九阳功的口诀念给你听了一遍。' },
        { t: '问她倚天剑里藏着什么', fx: (g) => g.set('heardSwordSecret'), res: '她沉默了很久：“刀剑互斫，才见真经。这话我只跟两个人说过。”' },
      ] },

    /* ---------- 大理 ---------- */
    { id: 'dl_herb_home', loc: 'dali', arrive: true, cond: (g) => g.S.origin === 'herb' && g.day > 30, t: '药铺',
      text: '你回到了当学徒的药铺。掌柜正在称药，抬头看见你，戥子差点掉了。',
      choices: [
        { t: '给掌柜磕个头', fx: (g) => { g.give('jinchuang', 2); g.add('品德', 2); }, res: '掌柜嘴上骂你没良心，转身塞给你两包金创药。' },
        { t: '帮他看几天铺子', fx: (g) => { g.days(5); g.add('资质', 1); g.add('银两', 10); }, res: '你又抓了五天药。几百个药名，一个也没忘。' },
      ] },
    { id: 'dl_temple', loc: 'dali', act: '天龙寺门口的争吵', cond: (g) => !g.f('tianlongHelped'), once: false, t: '天龙寺',
      text: '几个恶霸拿着官府的文书，说天龙寺的田归他们了。老和尚拦在门口，被推了一个跟头。',
      choices: [
        { t: '把恶霸赶走', fight: { foes: ['tianlong_e', 'shanzei'], win: { fx: (g) => { g.set('tianlongHelped'); g.add('品德', 6); g.add('声望', 5); }, res: '恶霸跑了，文书也被你撕了。老和尚扶着门框，向你合十。' }, lose: { res: '你被打倒在台阶下。老和尚替你敷了药。' } } },
        { t: '替寺里出一百二十两赎田', cost: { 银两: 120 }, fx: (g) => { g.set('tianlongHelped'); g.add('品德', 4); }, res: '恶霸拿了钱，把文书扔在地上。老和尚捡起来，当着你的面烧了。' },
        { t: '不管闲事', res: '你走开了。身后的争吵声越来越大。' },
      ] },
    { id: 'dl_yiyang_gift', who: 'tianlong_seng', act: '请教一阳指的来历', cond: (g) => g.f('tianlongHelped') && !g.has('yiyang') && g.holder('yiyang') === 'tianlong', t: '一阳指',
      text: '老和尚从经柜最底下取出一本薄薄的册子：“段家的一阳指，寺里留着这一本抄本。几十年没人翻过了。”',
      choices: [
        { t: '收下，答应只用来救人', cond: (g) => g.st('品德') >= 55, fx: (g) => { g.give('yiyang'); g.add('品德', 2); }, res: '老和尚把册子交到你手里：“一阳指，指的是一点善念。”' },
        { t: '请他亲口教', fx: (g) => { g.learn('yiyang', 1); g.add('声望', 3); }, res: '老和尚点了你三处穴道，又解开。“就是这个劲。”册子他收回去了。' },
        { t: '不敢收', fx: (g) => g.add('品德', 2), res: '老和尚把册子放回经柜：“想要的时候再来。”' },
      ] },
    { id: 'dl_steal', loc: 'dali', act: '夜里翻进天龙寺经房', cond: (g) => !g.has('yiyang') && g.holder('yiyang') === 'tianlong' && !g.f('tianlongCaught'), t: '经房',
      text: '天龙寺的经房没有上锁。经柜最底层有一本册子，封面写着“一阳指”三个字。',
      choices: [
        { t: '拿走', check: ['轻功', 45], fx: (g) => { g.give('yiyang'); g.add('品德', -15); }, res: '你翻墙出来，寺里一点动静也没有。第二天你在街上看见老和尚，他在扫地，没看你。', fail: { fx: (g) => { g.set('tianlongCaught'); g.add('品德', -5); }, res: '老和尚就坐在经柜前，像是等了你很久。“拿去看吧，看完放回来。”你放下册子跑了。' } },
        { t: '放回去', fx: (g) => g.add('品德', 2), res: '你把经房的门掩上了。' },
      ] },
    { id: 'dl_erhai', loc: 'dali', explore: 'dali', once: false, w: 3, t: '洱海',
      text: '洱海边的白族姑娘在唱歌，唱的是一个皇帝出家当和尚的故事。',
      choices: [
        { t: '坐下听完', fx: (g) => { g.add('资质', 0.5); g.set('heardYideng'); }, res: '那个皇帝后来成了一灯大师。歌里说，他的手指一点，死人都能救活。' },
        { t: '给她一点赏钱', cond: (g) => g.money() >= 2, fx: (g) => { g.add('银两', -2); g.add('品德', 1); }, res: '她冲你笑了笑，又唱了一段。' },
      ] },
    { id: 'dl_cangshan', loc: 'dali', explore: 'dali', once: false, w: 2, t: '苍山',
      text: '苍山半腰有一片药田，几个强人占了山洞，见人就抢。',
      choices: [
        { t: '上山打跑他们', fight: { foes: ['zeitou', 'shanzei'], win: { fx: (g) => { g.give('renshen', 2); g.add('声望', 3); g.add('品德', 2); }, res: '强人跑了。洞里堆着他们抢来的山参，你拿了两支，剩下的还给了采药人。' }, lose: { res: '你被打下了山，滚了一身泥。' } } },
        { t: '绕开走', res: '你绕了一条远路。' },
      ] },
    { id: 'dl_mabang', loc: 'dali', explore: 'dali', once: false, w: 2, t: '马帮',
      text: '一支马帮要去川西，缺一个护路的人，给三十两银子。',
      choices: [
        { t: '接了这趟活', fx: (g) => { g.days(15); g.add('银两', 30); g.add('根骨', 0.5); }, res: '你跟着马帮走了半个月。一路平安，赶马的人请你喝了酥油茶。' },
        { t: '不去', res: '马帮的人另找了人。' },
      ] },
  ]);
})();

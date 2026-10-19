/* 群侠 · 中原与北方的探索事件：少林、武当、蝴蝶谷、襄阳、大都、终南山（字段说明见 zhongyuan.js 开头）
 * 每处有两件“发现”（打开新的行动），按门派、品德、季节变化的事，和兑现以前选择的“回响”。
 * 季节按 g.m（月份）：3–5 春，6–8 夏，9–11 秋，12–2 冬。 */
(function () {
  'use strict';
  const QX = window.QX;
  const ssn = (g) => (g.m >= 3 && g.m <= 5 ? 0 : g.m >= 6 && g.m <= 8 ? 1 : g.m >= 9 && g.m <= 11 ? 2 : 3);
  const winter = (g) => ssn(g) === 3;
  // 已学的武功里，有没有卡在关口上的（按类型）
  const gateArt = (g, types) => Object.keys(g.S.arts).find((x) => QX.ARTS[x] && types.includes(QX.ARTS[x].type) && QX.atGate(x));
  const addXp = (g, art, n) => { if (g.lv(art)) { g.S.arts[art].xp += n; return true; } return false; };

  QX.addEvents([
    /* ==================== 少林 ==================== */
    // 发现：塔林后的小路通到后山三棵松树
    { id: 'sl_ex_talin', loc: 'shaolin', explore: 'shaolin', once: false, w: 3, cond: (g) => !g.f('slPines'), t: '塔林',
      text: (g) => (g.done('sl_ex_talin') > 1 ? '你又走到塔林。扫地的火工头陀还在，朝后山那条小路努了努嘴。'
        : '寺西的塔林里立着几百座石塔，都是历代高僧的骨塔。一个火工头陀在扫落叶。他说塔林后头有条小路通后山，山上三棵松树底下坐着三个老和尚，坐了快三十年了。'),
      choices: [
        { t: '顺着小路摸上去', check: ['轻功', '易'], fx: (g) => g.set('slPines'),
          res: '小路在乱石里绕来绕去。尽头是一片空地，三棵老松呈品字形长着，每棵树下坐着一个枯瘦的老僧。你没敢走近，记下了路。',
          fail: { fx: (g) => g.hurt(20), res: '你在乱石坡上踩空，一路滚了下来。火工头陀笑着把你扶起来：“改天再去吧。”' } },
        { t: '帮火工头陀把落叶扫完', fx: (g) => { g.days(1); g.add('品德', 1); if (g.done('sl_ex_talin') <= 2) g.give('jinchuang', 1); },
          res: (g) => (g.done('sl_ex_talin') <= 2 ? '扫完了，头陀从怀里摸出一包药塞给你：“寺里配的，比外头的好。”' : '你们扫了一天。头陀话不多，扫帚倒是一下一下很匀。') },
      ] },
    { id: 'sl_ex_pines', loc: 'shaolin', act: '去后山三棵松树下', once: false, cond: (g) => g.f('slPines'), t: '三棵松',
      text: (g) => {
        let t;
        if (g.after(136, 6)) t = '谢逊剃了光头，坐在三棵松树中间，跟三个老僧一起念经。' + (g.f('sawXiexunMonk') ? '他听出了你的脚步，点了点头。' : '');
        else if (g.after(135, 10)) t = '三棵松树围着一个山洞，洞口压着大石，里面关着金毛狮王谢逊。三个老僧手里各握着一条黑索，眼睛闭着，耳朵却竖着。';
        else t = '三个老僧坐在松树底下，一动不动，身上落满了松针。每人手边盘着一条黑索。';
        return t + (g.f('slDuNod') ? '上回弹你松针的那位老僧，眼皮动了一下。' : '');
      },
      choices: [
        { t: '远远坐下，跟着他们的呼吸吐纳', check: ['根骨', '中'],
          fx: (g) => { g.days(3); g.add('内力', 1); g.restMp(60); const id = gateArt(g, ['内功']); if (id) g.breakGate(id, '：你跟着三个老僧的呼吸坐了三天，卡住的那口气自己走通了'); },
          res: '三个人的呼吸慢得出奇，一呼一吸要数到几十。你跟了三天，丹田里暖烘烘的。',
          fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '你的呼吸乱了一下。一条黑索从松树下飞出来，抽在你胸口，你倒退了好几步。' } },
        { t: '上前合十，求老僧指点', cond: (g) => !g.f('slDuNod'), need: ['品德', 60], fx: (g) => { g.set('slDuNod'); g.cure(1); g.add('资质', 1); },
          res: '中间那位老僧睁开一只眼，看了你很久。他手指一弹，一枚松针打在你胸口。你憋了很久的一口气，忽然顺了。“回去吧。”' },
        { t: '绕到洞口背后，跟谢逊说几句话', cond: (g) => g.after(135, 10) && g.before(136, 6) && g.here('xiexun'), check: ['轻功', '难'], fx: (g) => g.like('xiexun', 8),
          res: '谢逊听出你不是少林的人，压低嗓子问外头是哪一年了。你告诉了他。他很久没说话。',
          fail: { fx: (g) => g.hurt(50), res: '黑索比你快。你还没靠近洞口，就被抽回了松树外。' } },
        { t: '悄悄退走', res: '你退回了塔林。松树底下的人，好像从来没动过。' },
      ] },
    // 发现：五乳峰上的达摩洞
    { id: 'sl_ex_wuru', loc: 'shaolin', explore: 'shaolin', once: false, w: 2, cond: (g) => !g.f('slDamo'), t: '五乳峰',
      text: (g) => (g.done('sl_ex_wuru') > 1 ? '你又爬上五乳峰的半山腰。那块大石头还在，石头后面的缝里透着风。'
        : '少林后面是五乳峰。你爬到半山腰，一块大石头挡着路，石头后面有风透出来。山下的老和尚说，达摩祖师当年在峰上一个洞里面壁了九年。'),
      choices: [
        { t: '挤过石缝看看', check: ['根骨', '易'], fx: (g) => g.set('slDamo'),
          res: '石缝后面是一个浅浅的石洞，地上铺着一层干草。洞壁上有一片暗影，像一个人盘腿坐着。这就是达摩洞。',
          fail: { fx: (g) => g.hurt(25), res: '石缝太窄，你挤了半天，蹭破了一身皮，只好退出来。' } },
        { t: '在大石前磕个头下山', fx: (g) => { g.add('品德', 1); g.restMp(20); }, res: '你磕了个头。山风吹得衣服哗哗响。' },
      ] },
    { id: 'sl_ex_damo', loc: 'shaolin', act: '去五乳峰达摩洞面壁', once: false, cond: (g) => g.f('slDamo'), t: '达摩洞',
      text: (g) => (g.done('sl_ex_damo') > 1 ? '你又坐进达摩洞。洞壁上那个影子，看久了好像在动。'
        : '洞里很静，只听得见山风。洞壁上的影子是一个人盘腿坐着的样子。传说达摩祖师面壁九年，把影子印进了石头里。')
        + (g.f('robbedShaolin') && !g.f('slAtoned') ? '你想起藏经阁那一夜，心里不太踏实。' : ''),
      choices: [
        { t: '面壁十天', check: ['资质', '中'],
          fx: (g) => { g.days(10); const id = gateArt(g, ['拳掌', '内功']); if (id) g.breakGate(id, '：你对着石壁坐了十天，脑子里那一招忽然想通了'); else g.add('资质', 1); },
          res: '你对着石壁坐了十天。下山的时候，看什么都清楚了一些。',
          fail: { fx: (g) => g.days(4), res: '坐到第四天，你满脑子都是山下的馒头。你叹了口气，下山去了。' } },
        { t: '在洞口拜一拜', fx: (g) => { g.add('品德', 1); g.restMp(30); }, res: '你拜了一拜。洞里的影子不说话。' },
      ] },
    // 门派、品德
    { id: 'sl_ex_jiangjing', loc: 'shaolin', explore: 'shaolin', once: false, w: 3, t: '讲经',
      text: (g) => (g.done('sl_ex_jiangjing') > 1 ? '讲经的老和尚还在银杏树下，今天讲的是另一段。' : '大雄宝殿旁边的银杏树下，一个老和尚在给香客讲经。讲到一半，他停下来，给一个哭着的妇人倒了一碗水。')
        + (g.sect === 'mingjiao' ? '两个武僧听说你是从光明顶来的，脸色就变了。' : g.sect === 'emei' ? '老和尚看见你背上的峨嵋剑，点点头：“郭祖师的门下。”'
          : g.sect === 'gaibang' ? '老和尚看见你背上的麻袋，让小沙弥给你端了一碗粥。' : g.sect === 'quanzhen' ? '老和尚看你一身道袍，笑了：“道长也来听经？”' : ''),
      choices: [
        { t: '坐下听完', fx: (g) => { g.add('品德', 1); g.add('资质', 0.3); }, res: (g) => (g.done('sl_ex_jiangjing') > 1 ? '今天讲的是放下。你还放不下。' : '讲的是因果。你听不太懂，可心里静了些。') },
        { t: '留下吃斋，帮着洗碗', need: ['品德', 55], fx: (g) => { g.days(1); g.like('slzhike', 6); }, res: '斋堂里的和尚洗碗不说话，你也不说话。知客僧走过来看了你一眼，脸上有了笑。' },
        { t: '站起来跟武僧辩一辩明教', cond: (g) => g.sect === 'mingjiao', fx: (g) => { g.like('slzhike', -6); g.add('声望', 2); },
          res: '你说明教的人也救穷人。武僧说魔教杀人放火。吵到最后，老和尚把你们都请了出去。' },
        { t: '跟老和尚说起郭襄祖师', cond: (g) => g.sect === 'emei', fx: (g) => { g.like('slzhike', 4); g.add('声望', 1); },
          res: '老和尚说，郭祖师年轻时来过少林，在山门外等了一天，不肯走。后来她去了峨嵋。' },
      ] },
    // 季节
    { id: 'sl_ex_season', loc: 'shaolin', explore: 'shaolin', once: false, w: 2, t: (g) => ['春茶', '山洪', '柿子', '扫雪'][ssn(g)],
      text: (g) => ['少室山上的茶树发了新芽，几个小沙弥背着竹篓在山坡上采茶。', '一场暴雨下了半夜，山洪冲垮了寺前的一段石阶。武僧们扛着石头在泥里干活。',
        '寺后的柿子树结满了果子，红得像灯笼。小沙弥够不着，拿竹竿打，打一个摔烂一个。', '大雪封了山门。武僧们赤着膊扫雪，扫完了就在雪地上练拳，身上冒着白气。'][ssn(g)]
        + (g.done('sl_ex_season') > 1 ? '你在少林来来去去，和尚们见了你会点头。' : ''),
      choices: [
        { t: '帮着干活', fx: (g) => { g.days(2); g.like('slzhike', 3); g.add('根骨', 0.3); },
          res: (g) => ['你采了两天茶，手指染得发绿。', '你扛了两天石头，肩膀磨破了皮。', '你爬上树摘了两天柿子，一个也没摔。', '你扫了两天雪，手冻得像胡萝卜。'][ssn(g)] },
        { t: '下场跟武僧过几招', cond: winter,
          fight: { foes: ['slwuseng'], win: { fx: (g) => { g.add('声望', 2); if (!addXp(g, 'luohan', 20)) g.add('攻击', 0.5); }, res: '武僧收了拳，朝你合十：“施主好拳。”' },
            lose: { res: '你被摔进雪堆里。武僧把你拉起来，拍掉你身上的雪。' } } },
        { t: '在山门外摆个茶摊', cond: (g) => !winter(g), fx: (g) => { g.days(2); g.add('银两', 6); }, res: '香客走累了，一碗茶几文钱。两天下来，你攒了六两。' },
        { t: '看一会儿就走', res: '你看了一会儿，走开了。' },
      ] },
    // 回响：夜闯藏经阁
    { id: 'sl_ex_wanted', loc: 'shaolin', explore: 'shaolin', once: false, w: 3, cond: (g) => g.f('robbedShaolin') || g.f('watchSl'), t: '山门',
      text: (g) => (g.f('slAtoned') ? '武僧们还记得你，可看你的眼神松了。戒律院那三十棍，他们都听说了。'
        : g.f('robbedShaolin') ? '山门外的墙上贴着一张画像，画的人有几分像你，底下写着“盗经贼”。两个武僧站在画像底下，挨个看上山的香客。'
          : '巡山的武僧认出了你，就是那天夜里在藏经阁外被围住的人。他们没说话，一直跟在你身后。'),
      choices: [
        { t: '去戒律院认罪，领罚', cond: (g) => !g.f('slAtoned'), fx: (g) => { g.hurt(80); g.days(10); g.add('品德', 8); g.set('slAtoned'); g.like('slzhike', 10); },
          res: (g) => (g.has('yijin') ? '你挨了三十棍，跪着把经过说了一遍。戒律院的首座沉默了很久：“经书在你手里，就替少林好好护着。护不住，佛祖看着。”' : '你挨了三十棍，在戒律院跪了十天。放你下山那天，首座说：“过去了。”') },
        { t: '压低斗笠，混在香客里走开', cond: (g) => !g.f('slAtoned'), check: ['资质', '易'], res: '你跟着一群香客下了山，没人多看你一眼。',
          fail: { fx: (g) => g.hurt(40), res: '一个武僧伸手拦住你，掀开了你的斗笠。你推开他就跑，背上挨了一棍。' } },
        { t: '跟武僧点点头，进寺上香', cond: (g) => g.f('slAtoned'), fx: (g) => { g.add('品德', 1); g.like('slzhike', 2); }, res: '武僧也朝你点了点头。' },
        { t: '转身下山', cond: (g) => g.f('slAtoned'), res: '你下山去了。' },
      ] },
    // 回响：屠狮大会以后
    { id: 'sl_ex_after', loc: 'shaolin', explore: 'shaolin', once: false, w: 3, from: [136, 6], t: '高台',
      text: (g) => (g.done('sl_ex_after') > 1 ? '山门前的高台已经拆完了，地上还留着一个一个的柱子坑。' : '屠狮大会散了，山门前的高台拆了一半，木头堆在路边。')
        + (g.f('chengkunExposed') ? '几个小沙弥看见你，交头接耳：“那天就是他，当着天下英雄说破了圆真。”' : '香客们还在说那天的事，说是明教的张教主揭穿了圆真。')
        + (g.f('fakeBangzhu') ? '丐帮的人路过，有人朝你抱拳。' : ''),
      choices: [
        { t: '帮着拆台、搬木头', fx: (g) => { g.days(1); g.add('根骨', 0.3); g.like('slzhike', 3); }, res: '你搬了一天木头。知客僧端来一碗茶，说辛苦。' },
        { t: '去圆真住过的禅房看看', cond: (g) => g.f('chengkunExposed') && !g.f('slChengkunNote'), fx: (g) => g.set('slChengkunNote'),
          res: '禅房封了。你从窗缝里看见床板底下压着一叠信，抽出来一看，是写给汝阳王府的，落款一个“昆”字。你把信揣进了怀里。' },
        { t: '去后山听谢逊念经', cond: (g) => g.f('sawXiexunMonk') && g.here('xiexun'), fx: (g) => { g.add('品德', 2); g.like('xiexun', 6); g.restMp(60); },
          res: '谢逊念经的声音很低，跟当年在冰火岛上吼的不一样了。你坐在松树外听了半天。' },
        { t: '下山', res: '你下山去了。' },
      ] },

    /* ==================== 武当 ==================== */
    // 发现：南岩石台
    { id: 'wd_ex_cliff', loc: 'wudang', explore: 'wudang', once: false, w: 3, cond: (g) => !g.f('wdNanyan'), t: '南岩',
      text: (g) => (g.done('wd_ex_cliff') > 1 ? '你又走到那条采药的小路。云散了一半，能看见对面的石台。'
        : '采药的小路一直往南，尽头是一面悬崖。云开的时候，你看见崖腰上伸出一块石台，台上有一棵歪脖子松。道童说，那是南岩，张真人年轻时常在那里坐。'),
      choices: [
        { t: '攀着藤条下到石台', check: ['轻功', '易'], fx: (g) => g.set('wdNanyan'),
          res: '石台比看上去大，能坐好几个人。石面被人坐出了一个浅坑。往下看，云在脚底下走。',
          fail: { fx: (g) => g.hurt(30), res: '藤条断了一根。你吊在半空晃了半天，才爬回小路上。' } },
        { t: '远远看一会儿', fx: (g) => g.restMp(30), res: '云又合上了。' },
      ] },
    { id: 'wd_ex_nanyan', loc: 'wudang', act: '去南岩石台上坐坐', once: false, cond: (g) => g.f('wdNanyan'), t: '南岩',
      text: (g) => (g.done('wd_ex_nanyan') > 1 ? '你又坐在南岩的石台上。' : '你在石台上坐下。')
        + ['崖下的草里有一条蛇，一只喜鹊在它头顶扑来扑去。蛇不躲，身子一圈一圈地转，喜鹊总啄不着。', '崖下的草里有一条蛇，一只喜鹊在它头顶扑来扑去。蛇不躲，身子一圈一圈地转，喜鹊总啄不着。',
          '满山的红叶，风一吹，一层一层地往下落。', '崖上结了冰，松针上挂着雪，云冻住了一样不动。'][ssn(g)],
      choices: [
        { t: '静坐看着', check: ['资质', '中'],
          fx: (g) => { const id = gateArt(g, ['拳掌', '兵器', '轻功']); if (id) g.breakGate(id, '：你在南岩坐了一天，看懂了一个圆'); else g.add('资质', 0.5); addXp(g, 'taiji_quan', 20); },
          great: { fx: (g) => g.add('资质', 1), res: '你看到太阳落山。那一圈一圈的，你好像全看懂了。' },
          res: '你看了一整天。下石台的时候，你觉得手脚里多了一样东西，说不出是什么。',
          fail: { res: '你看了一天，只看见一条蛇和一只鸟。' } },
        { t: '贴着崖壁练轻身的功夫', check: ['轻功', '中'], fx: (g) => g.add('轻功', 0.5), res: '你在崖壁上来回挪了半天，脚下越来越稳。',
          fail: { fx: (g) => g.hurt(40), res: '你一脚踩空，抱着歪脖子松才没掉下去。' } },
        { t: '在石台上打坐', fx: (g) => g.restMp(60), res: '你坐到天黑，心里一点杂念也没有。' },
      ] },
    // 发现：紫霄宫后的药圃
    { id: 'wd_ex_wall', loc: 'wudang', explore: 'wudang', once: false, w: 3, cond: (g) => !g.f('wdGarden'), t: '药圃',
      text: (g) => (g.done('wd_ex_wall') > 1 ? '紫霄宫后那道矮墙还在，墙那边又飘来药香。' : '紫霄宫后面有一道矮墙，墙那边飘来一股药香。你踮脚一看，是一片药圃，一个驼背的老道人蹲在地里拔草。'),
      choices: [
        { t: '翻过去帮他拔草', fx: (g) => { g.set('wdGarden'); g.days(1); g.add('品德', 1); }, res: '老道人看了你一眼，没赶你。拔完草，他说：“明天还来不来？我这把老骨头，一个人忙不过来。”' },
        { t: '隔着墙问他种的是什么药', check: ['资质', '易'], fx: (g) => g.set('wdGarden'), res: '你报出了几样药名，老道人抬起头：“认得药？进来吧。”',
          fail: { res: '你一样也认不出来。老道人嘟囔了一句，不理你了。' } },
        { t: '不去打扰', res: '你走开了。' },
      ] },
    { id: 'wd_ex_garden', loc: 'wudang', act: '去紫霄宫后的药圃', once: false, cond: (g) => g.f('wdGarden'), t: '药圃',
      text: (g) => (g.done('wd_ex_garden') > 1 ? '驼背的老道人见你来了，把锄头递给你。' : '药圃里种着几十样药，一畦一畦，地边插着木牌。老道人说，武当上下谁磕了碰了，都到他这里来。')
        + (winter(g) ? '地冻硬了，老道人在屋里熬药，满屋子苦味。' : '') + (g.f('wdGraveTended') ? '他说听小道童讲了，张五侠的坟是你扫的。' : ''),
      choices: [
        { t: '干五天活，请他治伤', cond: (g) => g.inj() > 0, fx: (g) => { g.days(5); g.cure(1); }, res: '老道人给你扎了五天针，喝了五天药。胸口那块疼，轻了。' },
        { t: '干五天活，换几包药', cond: (g) => g.inj() === 0, fx: (g) => { g.days(5); g.give('jinchuang', 2); }, res: '你干了五天活。老道人包了两包金创药给你：“省着点用。”' },
        { t: '跟老道人学认几味药', cond: (g) => g.f('wdGraveTended'), fx: (g) => { g.add('资质', 0.5); g.give('jiedu', 1); }, res: '他教你认了几味解毒的草，又塞给你一颗解毒丹。' },
        { t: '坐着陪他说说话', fx: (g) => g.restMp(30), res: '老道人说他年轻时也想下山闯江湖，后来想想，还是种药好。' },
      ] },
    // 门派、品德
    { id: 'wd_ex_zaoke', loc: 'wudang', explore: 'wudang', once: false, w: 3, t: '早课',
      text: (g) => (g.done('wd_ex_zaoke') > 1 ? '天还没亮，紫霄殿前又站满了道士。' : '天还没亮，紫霄殿前的广场上站满了道士，一齐打着一套拳，慢得像水在流。')
        + (g.after(134, 3) && g.before(135, 4) ? '宋大侠他们几个都不在。听说跟着六大派去了西域，到现在还没回来。' : '')
        + (g.sect === 'quanzhen' ? '一个中年道士看你穿着全真的道袍，过来稽首。' : g.sect === 'mingjiao' ? '有个道士小声说，张五侠的夫人，当年就是天鹰教的。'
          : g.sect === 'emei' ? (g.f('xyZhouStory') ? '你想起汉水边的老船家说过，周家的小丫头是一个老道士带走的。原来就是这里的张真人。' : '道士们看你背着峨嵋的剑，都客客气气的。') : ''),
      choices: [
        { t: '站在殿外跟着打一遍', fx: (g) => { g.add('根骨', 0.3); g.restMp(30); }, res: (g) => (g.done('wd_ex_zaoke') > 1 ? '这一回你跟上了大半。' : '你跟着比划，比划到一半就乱了。') },
        { t: '请道长让你一起做早课', need: ['品德', 60], fx: (g) => { g.add('品德', 1); if (g.here('songyuanqiao')) g.like('songyuanqiao', 6); else g.like('yudaiyan', 3); },
          res: (g) => (g.here('songyuanqiao') ? '宋远桥站在最前头，回头看了你一眼，让人给你让出一个位子。' : '一个老道士给你让了位子。早课散了，他说要去俞三侠房里，跟他说说今天来了个外人。') },
        { t: '跟那个道士印证一回内功', cond: (g) => g.sect === 'quanzhen', fx: (g) => { addXp(g, 'quanzhen_xinfa', 20); g.add('声望', 1); },
          res: '他说全真和武当，都在一个“慢”字上。你们坐在台阶上说到太阳出来。' },
        { t: '问他张五侠的事', cond: (g) => g.sect === 'mingjiao', fx: (g) => { g.set('wdKnowZhang5'); g.add('资质', 0.3); },
          res: '道士说，张五侠夫妇死在紫霄殿上，就在六大派面前。他说到这里，就不肯往下说了。' },
      ] },
    // 季节
    { id: 'wd_ex_tianzhu', loc: 'wudang', explore: 'wudang', once: false, w: 2, t: '天柱峰',
      text: (g) => ['山道两边开满了杜鹃，红一片，白一片。', '金顶上的云海翻来翻去，太阳晒得石阶发烫。', '满山的红叶，天柱峰顶的铜殿在太阳底下闪着光。', '天柱峰的石阶结了冰，铁链上挂着冰凌，没人敢上去。'][ssn(g)]
        + (g.after(135, 1) && g.before(135, 2) ? '从山上往下看，官道上有一队人马正往武当来，打着王府的旗。' : ''),
      choices: [
        { t: '爬上金顶', cond: (g) => !winter(g), check: ['轻功', '中'], fx: (g) => { g.add('轻功', 0.5); g.restMp(40); }, res: '你站在铜殿前，四下里的山都矮了一截。',
          fail: { fx: (g) => g.hurt(20), res: '爬到一半腿就软了，你坐在石阶上喘了半天。' } },
        { t: '抓着铁链，踩着冰爬上金顶', cond: winter, check: ['轻功', '难'], fx: (g) => { g.add('轻功', 1); g.add('声望', 1); },
          res: '你爬上去的时候，看殿的老道瞪着你像看一个疯子。他给你煮了一碗姜汤。',
          fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '你脚下一滑，抱着铁链荡了半圈，手心的皮全撕掉了。' } },
        { t: '下山去紫霄宫报信', cond: (g) => g.after(135, 1) && g.before(135, 2) && !g.f('wdWarned'), fx: (g) => { g.set('wdWarned'); g.add('品德', 2); },
          res: '道童们听了，脸都白了。宋大侠他们还没回来，山上只剩些小辈。一个道童飞跑着去后山敲张真人的门。' },
        { t: '在半山的亭子里歇脚', fx: (g) => g.restMp(40), res: '你在亭子里坐到太阳偏西。' },
      ] },
    // 回响：俞三侠、小道童、万安寺、报信
    { id: 'wd_ex_road', loc: 'wudang', explore: 'wudang', once: false, w: 3,
      cond: (g) => g.f('yuCured') || g.f('wdKind') || g.f('zhuangWudang') || g.f('ddFedPrisoners') || g.f('wdWarned'), t: '山道上',
      text: (g) => {
        const p = [];
        if (g.f('yuCured') && g.alive('yudaiyan')) p.push('俞三侠拄着一根竹杖，在山道上一步一步地走，两个道童在旁边扶着。他看见你，竹杖往地上一顿，站直了。');
        else if (g.f('wdKind')) p.push('当年你帮过的那个小道童长高了一截，在山道上认出了你，远远就喊。');
        else p.push('几个武当弟子在山道上碰见你，停下来行礼。');
        if (g.f('zhuangWudang')) p.push('他们说那天在真武殿前，你也站在武当这边。');
        if (g.f('wdWarned')) p.push('王府的人来之前，是你从金顶上下来报的信，山上的人都记得。');
        if (g.f('ddFedPrisoners') && g.here('songyuanqiao')) p.push('宋远桥也在。他说在万安寺的塔里，吃过你送的饭。');
        return p.join('');
      },
      choices: [
        { t: '陪俞三侠走一段山路', cond: (g) => g.f('yuCured') && g.alive('yudaiyan'), fx: (g) => { g.like('yudaiyan', 8); g.add('品德', 1); },
          res: '你们走得很慢。他说二十年没自己走过这条路了，路边的松树都长粗了。' },
        { t: '看小道童比划新学的步法', cond: (g) => g.f('wdKind') && !(g.f('yuCured') && g.alive('yudaiyan')), fx: (g) => { g.add('轻功', 0.5); if (g.here('songyuanqiao')) g.like('songyuanqiao', 3); },
          res: '他说是宋师伯教的。走得还不稳，可看得出门道。你跟着走了几步，脚下轻了些。' },
        { t: '跟宋远桥说说万安寺那些天', cond: (g) => g.f('ddFedPrisoners') && g.here('songyuanqiao'), fx: (g) => { g.like('songyuanqiao', 10); g.add('声望', 2); },
          res: '宋远桥说，那几天塔里的人都以为要死了。你送去的那碗饭，他记一辈子。' },
        { t: '问他们山上最近怎样', fx: (g) => { g.like('yudaiyan', 2); if (g.f('zhuangWudang')) g.give('jinchuang', 1); },
          res: (g) => (g.before(135, 2) ? '他们说张真人还在闭关。' : '他们说张真人这些天心情好，天天在松树下打拳。') + (g.f('zhuangWudang') ? '一个弟子追上来，塞给你一包伤药。' : '') },
      ] },
    // 回响：张五侠的坟
    { id: 'wd_ex_grave', loc: 'wudang', explore: 'wudang', once: false, w: 2, t: '张五侠的坟',
      text: (g) => (g.done('wd_ex_grave') > 1 ? '你又走到后山那两座坟前。' : '后山的松林里有两座坟，碑上写着“张翠山”“殷素素”。坟前的香炉里插着半截残香。')
        + (g.f('wdKnowZhang5') ? '你想起早课时那个道士说的话，他们就死在紫霄殿上。' : '')
        + (g.after(135, 2) ? '坟前摆着新鲜的果子。道童说，新任明教教主前些日子来过，在这里跪了一夜。' : '')
        + (g.f('servedWang') && !g.f('wdGraveTended') ? '守坟的道童认得你在王府门口当过差，拦在前头不让你近前。' : ''),
      choices: [
        { t: '拔草，上一炷香', cond: (g) => !g.f('servedWang') || g.f('wdGraveTended'), fx: (g) => { g.set('wdGraveTended'); g.add('品德', 1); }, res: '你把坟上的草拔干净，插上一炷香。松林里的风很轻。' },
        { t: '跟道童说你早就不替王府做事了', cond: (g) => g.f('servedWang') && !g.f('wdGraveTended'), need: ['品德', 50], fx: (g) => { g.set('wdGraveTended'); g.like('songyuanqiao', 3); },
          res: '道童看了你半天，让开了。你上完香，他在背后小声说了句谢谢。' },
        { t: '推开他', cond: (g) => g.f('servedWang') && !g.f('wdGraveTended'), fx: (g) => { g.add('品德', -3); g.like('yudaiyan', -6); }, res: '道童摔在地上，哭着跑了。山上的人很快都知道了。' },
        { t: '站一会儿就走', res: '你站了一会儿，走了。' },
      ] },

    /* ==================== 蝴蝶谷 ==================== */
    // 发现：谷后的药洞（王难姑的毒经残页给绝情谷的线索）
    { id: 'hd_ex_vine', loc: 'hudie', explore: 'hudie', once: false, w: 3, cond: (g) => !g.f('hdCave'), t: '藤后',
      text: (g) => (g.done('hd_ex_vine') > 1 ? '谷后那片爬满藤的山壁又出现在你眼前。藤后面凉飕飕的。' : '谷后的山壁上爬满了藤。你拨开一看，藤后面有个洞口，一股草药混着霉味的气息扑出来。'),
      choices: [
        { t: '钻进去看看', fx: (g) => { g.set('hdCave'); if (!g.known('jueqing')) g.clue('jueqing'); },
          res: '洞里摆着几排石架，架上全是瓦罐，有的写着药名，有的画着骷髅。石桌上压着几页纸，字迹娟秀，是王难姑的手笔。有一页写着：“情花刺人，动情则痛。生于武关之南深谷，左近必有断肠草。”' },
        { t: '把洞口的藤割下来，拿去镇上卖', fx: (g) => { g.add('银两', 3); g.days(1); }, res: '老藤能编筐，镇上的篾匠给了你三两。洞口亮了一些，你没进去。' },
      ] },
    { id: 'hd_ex_cave', loc: 'hudie', act: '去谷后的药洞', once: false, cond: (g) => g.f('hdCave'), t: '药洞',
      text: (g) => (g.done('hd_ex_cave') > 1 ? '药洞里还是那股味道。你把石架上的瓦罐又翻了一遍。' : '石架上的瓦罐一排一排。胡青牛的药，王难姑的毒，隔着一条过道放着，谁也不挨着谁。'),
      choices: [
        { t: '照着罐子上的字配金创药', check: ['资质', '易'], fx: (g) => { g.days(2); g.give('jinchuang', 2); }, res: '你配了两天，配出两份金创药，颜色比铺子里卖的深。',
          fail: { fx: (g) => g.days(2), res: '你配错了一味，药糊成一锅黑水。' } },
        { t: '照着胡青牛的医经配解毒丹', cond: (g) => g.has('yijing'), fx: (g) => { g.days(2); g.give('jiedu', 2); }, res: '医经上写得清清楚楚，一味一钱都不差。你配出了两颗解毒丹。' },
        { t: '把王难姑的毒药抹在兵器上', need: ['品德', '<', 40], fx: (g) => { g.add('攻击', 1); g.add('品德', -4); }, res: '你把一罐黑乎乎的药膏抹在刃口上。刃口泛着蓝光，你自己都不敢碰。' },
        { t: '把翻乱的罐子摆回原处', fx: (g) => g.add('品德', 1), res: '你把罐子一个一个摆好，药归药，毒归毒。' },
      ] },
    // 发现：谷外的村子
    { id: 'hd_ex_patient', loc: 'hudie', explore: 'hudie', once: false, w: 3, cond: (g) => !g.f('hdVillage'), t: '求医的人',
      text: (g) => (g.done('hd_ex_patient') > 1 ? '谷口又来了求医的人，坐在胡青牛的草屋前不肯走。' : '谷口坐着一个老汉，背上背着个发烧的孩子。他说他从谷外的村子来，走了一天一夜。“胡先生不在了？那可怎么办。”'),
      choices: [
        { t: '看看孩子的病', check: ['资质', '易'], fx: (g) => { g.set('hdVillage'); g.add('品德', 3); },
          res: '你照着草屋药柜上的字条找了几味退热的草，熬了一碗喂下去。孩子半夜出了一身汗，烧退了。老汉说村里还有好几个病人，问你肯不肯去看看。',
          fail: { fx: (g) => g.add('品德', 1), res: '你翻遍了药柜，不知道该用哪一味。老汉背着孩子往镇上去了。' } },
        { t: '给他一颗解毒丹', cond: (g) => g.has('jiedu'), fx: (g) => { g.take('jiedu', 1); g.set('hdVillage'); g.add('品德', 3); }, res: '孩子吃了药，脸色好了些。老汉说村里还有病人，问你能不能去看看。' },
        { t: '指给他去镇上的路', res: '老汉谢了你，背着孩子走了。' },
      ] },
    { id: 'hd_ex_village', loc: 'hudie', act: '去谷外的村子看病', once: false, cond: (g) => g.f('hdVillage'), t: '村子',
      text: (g) => (g.done('hd_ex_village') > 1 ? '村口的狗认得你了，不叫了。' : '谷外的村子不大，十几户人家。胡青牛在的时候，村里人看病不花钱。他死了以后，病了就只能硬扛。')
        + (g.after(134, 10) && g.before(136, 6) ? '明教的人住进谷里以后，村里多了些伤兵，躺在祠堂里。' : ''),
      choices: [
        { t: '挨家挨户看病', check: ['资质', '中'], fx: (g) => { g.days(3); g.add('品德', 2); g.add('声望', 1); g.add('银两', 3); },
          res: '你看了三天病。有人给你几个鸡蛋，有人给你一只鸡，你只收了几文钱。',
          great: { fx: (g) => g.add('声望', 2), res: '有个瘫了半年的老太太，你给她扎了几针，她自己坐起来了。村里人跪了一地。' },
          fail: { fx: (g) => g.days(3), res: '有两个病人你看不明白，只好让他们去镇上。' } },
        { t: '照着医经开方子', cond: (g) => g.has('yijing'), fx: (g) => { g.days(3); g.add('品德', 3); g.add('声望', 2); }, res: '医经上什么病都有写。三天下来，村里的病人好了一大半。' },
        { t: '去祠堂照看明教的伤兵', cond: (g) => g.after(134, 10) && g.before(136, 6), fx: (g) => { g.days(3); g.set('helpedMing'); if (g.alive('changyuchun')) g.like('changyuchun', 4); },
          res: '伤兵大多是被元兵砍的。你换了三天药，有个小伙子说，等伤好了，要跟着常大哥去打仗。' },
        { t: '歇一天再说', fx: (g) => g.restMp(30), res: '你在村口的槐树下睡了一觉。' },
      ] },
    // 季节
    { id: 'hd_ex_season', loc: 'hudie', explore: 'hudie', once: false, w: 2, t: (g) => ['花开', '溪边', '秋草', '冬谷'][ssn(g)],
      text: (g) => ['谷里的花一夜之间全开了，蝴蝶成群地飞起来，遮得太阳都暗了。', '天热，蝴蝶聚在溪边喝水，一片一片落在湿石头上，像铺了一层花。',
        '花谢了，蝴蝶少了。草黄了半截，溪水凉了。石缝里有蛇在找过冬的窝。', '谷里没有一只蝴蝶。枯枝上结着霜，石缝里有蛇在冬眠。'][ssn(g)]
        + (g.done('hd_ex_season') > 1 ? '这样的光景，你在谷里看过不止一回了。' : ''),
      choices: [
        { t: '采些开花的药草', cond: (g) => ssn(g) <= 1, fx: (g) => g.give('jinchuang', 1), res: '你采了一篓草，捣成一份药膏。' },
        { t: '去石缝里掏蛇取胆', cond: (g) => ssn(g) >= 2,
          fight: { foes: ['dushe'], win: { fx: (g) => g.give('jiedu', 1), res: '蛇胆苦得很，配进药里能解毒。' }, lose: { res: '蛇醒了。你被咬了一口，手肿了好几天。' } } },
        { t: '坐在溪边发呆', fx: (g) => { g.restMp(40); g.add('资质', 0.3); }, res: '你坐到天黑。' },
      ] },
    // 门派、品德：谷口的岗哨
    { id: 'hd_ex_gangshao', loc: 'hudie', explore: 'hudie', once: false, w: 3, from: [134, 10], t: '岗哨',
      text: (g) => (g.f('hdCampFriend') ? '守岗的人老远就朝你招手，没盘问。' : g.done('hd_ex_gangshao') > 1 ? '谷口的岗哨又换了一拨人。' : '谷口搭起了木栅，两个明教的人拿着刀守着，见了生人就盘问。')
        + (g.sect === 'emei' ? '他们看见你背上的峨嵋剑，手按到了刀柄上。' : g.sect === 'mingjiao' ? '一个守岗的看你面熟，咧嘴笑了。' : ''),
      choices: [
        { t: '报上旗号', cond: (g) => g.sect === 'mingjiao', fx: (g) => { g.add('声望', 1); g.give('jinchuang', 1); g.set('hdCampFriend'); }, res: '“自家兄弟！”他们把你让进去，分了你一碗羊肉汤，又塞给你一包伤药。' },
        { t: '报上峨嵋的名号', cond: (g) => g.sect === 'emei',
          fight: { foes: ['mjdizi', 'mjdizi'], win: { fx: (g) => g.add('声望', 3), res: '你打翻了两个守岗的。里头出来一个年轻人，喝住了所有人，给你赔了不是。' },
            lose: { res: '你被按在地上。里头出来一个年轻人，叫人把你放了：“峨嵋的朋友，请回吧。”' } } },
        { t: '说明来意，帮着照看伤员', need: ['品德', 55], fx: (g) => { g.set('hdCampFriend'); g.add('品德', 2); g.days(3); }, res: '你在谷里帮了三天忙。临走时，守岗的人说，以后来了不用盘问。' },
        { t: '绕开岗哨', res: '你绕到谷后，从溪边进去了。' },
      ] },
    // 回响：胡青牛夫妇的坟
    { id: 'hd_ex_grave', loc: 'hudie', explore: 'hudie', once: false, w: 3, cond: (g) => g.f('graveTended') || g.f('dugGrave'), t: '两座坟',
      text: (g) => (g.f('hdAtoned') ? '坟上的土是你重新培过的，草长得齐齐整整。' : g.f('dugGrave') ? '坟上的土还是你翻过的样子，草长得稀稀拉拉。木牌歪在一边，没人扶。'
        : g.f('jinhuaDug') ? '被金花婆婆挖开的坟，你填好了。新土上已经长出了一层草。' : '坟上的草比别处短，有人常来拔。')
        + (g.here('changyuchun') ? (g.f('cycAngry') ? '常遇春坐在坟前烧纸，看见你，把刀抽出了半截。' : '常遇春坐在坟前烧纸，朝你点了点头。') : ''),
      choices: [
        { t: '把坟重新培好，跪下认错', cond: (g) => g.f('dugGrave') && !g.f('hdAtoned'),
          fx: (g) => { g.set('hdAtoned'); g.add('品德', 6); g.days(1); if (g.here('changyuchun')) { g.like('changyuchun', 15); g.unset('cycAngry'); } },
          res: (g) => (g.here('changyuchun') ? '常遇春看着你培了一下午的土，最后把刀插了回去：“胡先生要是在，也不会跟你计较。”' : '你培了一下午的土，把木牌扶正，在坟前跪了很久。') },
        { t: '添一把新土，摆上野花', cond: (g) => g.f('graveTended'), fx: (g) => { g.add('品德', 1); if (g.here('changyuchun')) g.like('changyuchun', 5); }, res: '蝴蝶落在野花上，翅膀一开一合。' },
        { t: '磕个头', fx: (g) => g.restMp(20), res: '你磕了一个头。' },
        { t: '走开', res: '你走开了。' },
      ] },
    // 回响：锐金旗（光明顶上救没救下庄铮）
    { id: 'hd_ex_ruijin', loc: 'hudie', explore: 'hudie', once: false, w: 3, from: [135, 1], t: '锐金旗',
      text: (g) => (g.f('savedZhuang') && g.alive('zhuangzheng') ? '谷里的空地上，庄铮光着膀子操练锐金旗的兄弟。他胸口那道疤还红着，一嗓子喊得山响。'
        : '锐金旗的人在谷里立了一块木牌，写着“锐金旗掌旗使庄铮之位”。几个汉子坐在牌前喝闷酒。')
        + (g.f('hdCampFriend') ? '有人认得你，招呼你过去。' : '') + (g.f('helpedMing') ? '“这位朋友帮过咱们。”' : ''),
      choices: [
        { t: '跟庄铮练一趟长拳', cond: (g) => g.f('savedZhuang') && g.alive('zhuangzheng'), fx: (g) => { if (!addXp(g, 'taizu', 30)) g.learn('taizu', 1); g.like('zhuangzheng', 6); },
          res: '庄铮的拳没有花样，一拳是一拳。练完了，他拍着你的肩膀：“那天要不是你，我这条命就交代了。”' },
        { t: '在牌位前敬一碗酒', cond: (g) => !(g.f('savedZhuang') && g.alive('zhuangzheng')), fx: (g) => { g.add('品德', 1); if (g.alive('yangxiao')) g.like('yangxiao', 3); },
          res: '汉子们看你敬了酒，有一个哭了出来。杨左使从帐篷里出来，看了你一眼。' },
        { t: '坐下来跟他们喝酒', cond: (g) => g.f('helpedMing') || g.f('hdCampFriend'), fx: (g) => { g.give('jinchuang', 1); g.restMp(30); g.add('声望', 1); },
          res: '他们说起光明顶那一仗，说起万安寺的火。喝到半夜，有人塞给你一包伤药。' },
        { t: '看一会儿', res: '你看了一会儿，走开了。' },
      ] },

    /* ==================== 襄阳 ==================== */
    // 发现：郭府旧宅
    { id: 'xy_ex_lane', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 3, cond: (g) => !g.f('xyGuofu'), t: '旧宅',
      text: (g) => (g.done('xy_ex_lane') > 1 ? '你又走到城东那条巷子。巷子尽头的大门半掩着。' : '城东一条巷子尽头，有一座塌了半边的大宅子，门楼上的匾早没了，只剩两个钉眼。卖菜的老妇说，那是郭大侠的府上。'),
      choices: [
        { t: '推门进去', fx: (g) => g.set('xyGuofu'), res: '院子里长满了蒿草，比人还高。正厅塌了，后头的练武场倒还平整，青砖缝里长着青苔。' },
        { t: '在门口拜三拜', fx: (g) => { g.add('品德', 1); g.add('声望', 1); }, res: '你拜了三拜。卖菜的老妇看着你，点了点头。' },
      ] },
    { id: 'xy_ex_guofu', loc: 'xiangyang', act: '去郭府旧宅', once: false, cond: (g) => g.f('xyGuofu'), t: '郭府',
      text: (g) => (g.done('xy_ex_guofu') > 1 ? '你又进了郭府的旧宅。蒿草被你踩出了一条路。' : '郭府的旧宅里静悄悄的。')
        + (g.f('heardGuojing') ? '老叫化说过，城破那天，郭大侠就是从这里上的城墙。' : ''),
      choices: [
        { t: '在练武场上打一趟拳', fx: (g) => { if (!addXp(g, 'taizu', 20)) g.add('攻击', 0.5); g.add('根骨', 0.3); },
          res: '青砖上有一圈一圈浅浅的坑，是当年有人一掌一掌拍出来的。你照着坑的位置走了一遍，掌心发热。' },
        { t: '去后园看看', cond: (g) => !g.known('taohua') && !g.f('xyGuofuPeach'), check: ['资质', '中'], fx: (g) => { g.set('xyGuofuPeach'); g.clue('taohua'); },
          res: '后园的假山是照阵法摆的，你绕了三圈才走进去。假山中间的石桌上刻着一枝桃花，旁边四个小字：“桃花岛主”。',
          fail: { res: '后园的假山怎么走都走回原处。你绕得头晕，只好出来。' } },
        { t: '打扫正厅，给郭大侠夫妇上香', fx: (g) => { g.add('品德', 2); if (g.done('xy_ex_guofu') === 1) g.add('声望', 1); }, res: '你扫出一块干净地方，插了三炷香。风从塌了的屋顶灌进来，香烟歪向城墙那边。' },
      ] },
    // 发现：汉水渡船（绝情谷的线索、周家的旧事）
    { id: 'xy_ex_river', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 3, cond: (g) => !g.f('xyFerry'), t: '汉水',
      text: (g) => (g.done('xy_ex_river') > 1 ? '你又走到汉水边。那只破船还拴在柳树上，船家在船头打盹。' : '出了北门就是汉水。江边拴着一只破船，船头坐着个老船家，一边补帆一边哼小曲。他说过江去樊城，几文钱一趟。'),
      choices: [
        { t: '跟他聊几句', fx: (g) => g.set('xyFerry'), res: '老船家说他在汉水上撑了四十年船，两岸的事他都知道。“想过江，随时来找我。”' },
        { t: '在江边洗把脸就走', fx: (g) => g.restMp(20), res: '江水很凉，你清醒了些。' },
      ] },
    { id: 'xy_ex_ferry', loc: 'xiangyang', act: '坐老船家的渡船', once: false, cond: (g) => g.f('xyFerry'), t: '渡船',
      text: (g) => (g.done('xy_ex_ferry') > 1 ? '老船家见是你，把篙一撑，船离了岸。' : '船在江心晃着，老船家一边撑篙一边说话。')
        + (ssn(g) === 1 ? '夏天涨水，江面宽了一倍，浪头打到船舷上。' : winter(g) ? '江风刮得脸疼，船舱里结了一层薄冰。' : ''),
      choices: [
        { t: '问他两岸有什么怪事', cond: (g) => !g.known('jueqing') && !g.f('xyFerryClue'), fx: (g) => { g.set('xyFerryClue'); g.clue('jueqing'); },
          res: '老船家说，往北过了江，再往西进山，有一处山谷，谷口的花树会扎人。他年轻时送一个采药的过去，那人回来的时候半边身子都是紫的。' },
        { t: '问他为什么总看着对岸', cond: (g) => !g.f('xyZhouStory'), fx: (g) => { g.set('xyZhouStory'); g.add('资质', 0.3); },
          res: '老船家叹了口气。他说对岸以前住着一户姓周的船家，被元兵杀了，留下一个小丫头，让一个老道士带走了。“听说后来上了峨嵋。”' },
        { t: '帮他撑一趟篙', fx: (g) => { g.add('银两', 3); g.add('根骨', 0.3); if (ssn(g) === 1) g.hurt(15); },
          res: (g) => (ssn(g) === 1 ? '水急，篙子差点被冲走，你虎口都震裂了。老船家把一天的船钱分了你一半，三两。' : '你撑了一趟来回，手掌磨出了泡。老船家把一天的船钱分了你一半，三两。') },
        { t: '靠在船头歇一会儿', fx: (g) => g.restMp(40), res: '船晃着晃着，你睡着了。' },
      ] },
    // 门派、品德：城西破庙
    { id: 'xy_ex_temple', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 3, t: '城西破庙',
      text: (g) => (g.done('xy_ex_temple') > 1 ? '破庙门口又坐了一排叫化。' : '城西破庙门口坐着一排叫化，有的捉虱子，有的打盹。')
        + (g.sect === 'gaibang' ? '他们见了你背上的麻袋，往旁边挪了挪，给你让出一块晒得着太阳的地方。' : g.sect === 'mingjiao' ? '有个叫化听说你是明教的，往地上啐了一口：“魔教的人，来襄阳做什么？”'
          : g.st('品德') >= 60 ? '他们听说过你，有人朝你拱了拱手。' : '他们瞟了你一眼，没人理你。'),
      choices: [
        { t: '坐下来跟兄弟们分一个馒头', cond: (g) => g.sect === 'gaibang', fx: (g) => { g.like('gb_zhangbang', 4); g.add('声望', 1); },
          res: '一个老叫化一边嚼一边说，近来王府的人在城里转得勤，大家留点神。' },
        { t: '跟那个叫化理论', cond: (g) => g.sect === 'mingjiao',
          fight: { foes: ['egai'], win: { fx: (g) => { g.add('声望', 2); g.like('gb_zhangbang', -4); }, res: '你把他按在地上。掌棒龙头出来骂了一顿，骂的是那个叫化，可他看你的眼神也不太好。' },
            lose: { res: '你被一群叫化围着揍了一顿。' } } },
        { t: '买几个烧饼分给他们', need: ['品德', 50], cost: { 银两: 4 }, fx: (g) => { g.like('gb_chuangong', 5); g.add('品德', 1); },
          res: '传功长老从庙里探出头，眯着眼睛看了你一会儿，又缩了回去。后来他跟人说，这个后生还行。' },
        { t: '走开', res: '你走开了。' },
      ] },
    // 季节
    { id: 'xy_ex_season', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 2, t: (g) => ['桃花汛', '城头', '催粮', '冬夜'][ssn(g)],
      text: (g) => ['汉水涨了桃花汛，江边的码头上挤满了等船的人，货堆得像小山。', '日头毒，城头上的元兵躲在箭楼里乘凉。城根下有人支起摊子卖凉茶。',
        '收了秋粮，元兵挨家挨户催粮。一户人家交不够，男人被绑在了门口的树上。', '下了一夜的雪，城墙根下缩着十几个逃荒的人，有个老人已经不动了。'][ssn(g)],
      choices: [
        { t: (g) => (ssn(g) === 0 ? '帮码头的人搬货' : '给卖凉茶的挑水'), cond: (g) => ssn(g) <= 1, fx: (g) => { g.days(2); g.add('银两', 5); }, res: '你干了两天活，挣了五两。' },
        { t: (g) => (ssn(g) === 2 ? '替那户人家把粮交上' : '给逃荒的人买几担柴'), cond: (g) => ssn(g) >= 2, cost: { 银两: 8 }, fx: (g) => { g.add('品德', 4); g.add('声望', 1); },
          res: (g) => (ssn(g) === 2 ? '元兵收了钱，把人放了。那家的女人抱着孩子，一直磕头。' : '你买了两担柴，在城墙根下生了一堆火。有人慢慢地挪了过来。') },
        { t: '把催粮的元兵打跑', cond: (g) => ssn(g) === 2,
          fight: { foes: ['yuanbing', 'yuanbing'], win: { fx: (g) => { g.add('品德', 3); g.add('声望', 3); }, res: '元兵跑了。可你知道，他们明天还会来。' },
            lose: { res: '你被打倒了，那户人家的粮还是被抢走了。' } } },
        { t: '去城头看汉水', fx: (g) => { g.add('资质', 0.3); g.restMp(30); }, res: '汉水从西边来，往东边去。六十年前，蒙古人的船就是从那边来的。' },
      ] },
    // 回响：陈友谅
    { id: 'xy_ex_wuyi', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 3, cond: (g) => g.f('cylFriend') || g.f('cylOwe') || g.f('knowCylTrap'), t: '污衣叫化',
      text: (g) => {
        const down = g.f('cylDown') || !g.alive('chenyouliang');
        if (down && g.f('fakeBangzhu')) return '几个污衣叫化在巷口拦住你。领头的说，陈长老跑了，这笔账要算在你头上。';
        if (down) return '一个污衣叫化塞给你一张纸条。陈友谅跑了，纸条上说他在江北等你，要做大事。';
        if (g.f('xyCylDeal')) return '那个污衣叫化又凑过来了。他说陈长老问，传功长老那边，你盯得怎么样了。';
        if (g.f('cylOwe')) return '一个污衣叫化凑过来，笑嘻嘻地说：“打狗棒那件事，陈长老记着你的好。他说还有一件事要你办。”';
        if (g.f('knowCylTrap')) return '几个污衣叫化跟了你两条街。你停下，他们也停下。破窑那天的事，他们没忘。';
        return '一个污衣叫化凑过来：“陈长老请你今晚去城外喝酒。”';
      },
      choices: [
        { t: '去赴约', cond: (g) => !(g.f('cylDown') || !g.alive('chenyouliang')) && (g.f('cylFriend') || g.f('cylOwe')) && !g.f('xyCylDeal'),
          fx: (g) => { g.add('银两', 30); g.add('品德', -4); g.set('xyCylDeal'); }, res: '陈友谅请你喝了一顿好酒，塞给你三十两，让你替他盯着传功长老。你收了钱。' },
        { t: '去找传功长老说清楚', cond: (g) => g.alive('gb_chuangong'), fx: (g) => { g.like('gb_chuangong', 8); g.set('xyToldChuangong'); g.unset('cylFriend'); g.set('cylWary'); },
          res: '传功长老听完，半天没说话。“陈友谅那小子，我早看他不对。你肯来说，这份情丐帮记着。”' },
        { t: '动手', cond: (g) => (g.f('fakeBangzhu') && (g.f('cylDown') || !g.alive('chenyouliang'))) || g.f('knowCylTrap'),
          fight: { foes: ['egai', 'egai'], win: { fx: (g) => g.add('声望', 3), res: '你打跑了他们。领头的边跑边骂。' }, lose: { res: '你被一顿棍子打倒在巷子里。' } } },
        { t: '不理他们', res: '你转身走了。身后有人冷笑了一声。' },
      ] },
    // 回响：史红石
    { id: 'xy_ex_hongshi', loc: 'xiangyang', explore: 'xiangyang', once: false, w: 3, from: [134, 1], cond: (g) => g.alive('shihongshi') && g.here('shihongshi'), t: '史红石',
      text: (g) => {
        const boss = g.f('fakeBangzhu') || g.after(136, 6);
        let t = boss ? '史红石坐在破庙正中，个子还是小，腰板挺得笔直。长老们站在两边听她说话。' : '史红石在破庙后面缝麻袋，针脚歪歪扭扭的。';
        if (g.f('fakeBangzhu')) t += '她看见你，站起来叫了一声：“恩人。”';
        else if (g.f('gbHongFriend')) t += '她看见你，扔下手里的活就跑过来，要你再陪她练竹竿。';
        if (g.f('xyCylDeal')) t += '她听说你收过陈友谅的钱，脸一下子冷了。';
        else if (g.f('xyToldChuangong')) t += '传功长老跟她说过，是你去报的信。';
        return t;
      },
      choices: [
        { t: '陪她练一会儿棒法', fx: (g) => { g.like('shihongshi', g.f('xyCylDeal') ? 2 : 6); g.add('轻功', 0.3); },
          res: (g) => (g.f('fakeBangzhu') || g.after(136, 6) ? '她使的是打狗棒法的入门几招，一板一眼。你陪她拆了一下午，她额头上全是汗。' : '她拿一根竹竿当打狗棒，你拿一根树枝陪她比划。') },
        { t: '跟她说你收钱是假，想摸陈友谅的底', cond: (g) => g.f('xyCylDeal'), need: ['品德', 50], fx: (g) => { g.like('shihongshi', 6); g.unset('xyCylDeal'); },
          res: '史红石盯着你看了很久：“那你摸到了什么？”你把陈友谅说的话都告诉了她。' },
        { t: '问她丐帮往后怎么办', cond: (g) => g.f('fakeBangzhu') || g.after(136, 6), fx: (g) => { g.like('gb_chuangong', 3); g.add('声望', 1); },
          res: '她说，先把净衣污衣的架子拆了，要饭的就是要饭的。说完自己先笑了。' },
        { t: '不打扰她', res: '你没有过去。' },
      ] },

    /* ==================== 大都 ==================== */
    // 发现：万安寺
    { id: 'dd_ex_tower', loc: 'dadu', explore: 'dadu', once: false, w: 3, cond: (g) => !g.f('ddWansi'), t: '白塔',
      text: (g) => (g.after(135, 4, 10) ? '城西的万安寺烧塌了一半，白塔熏得黑乎乎的。' : g.done('dd_ex_tower') > 1 ? '你又走到城西。那座十三层的白塔，远远就看得见。'
        : '城西有一座喇嘛庙，庙里一座白塔有十三层高，塔尖上挂着铜铃。路人说那是万安寺，王府的番僧都住在里头。'),
      choices: [
        { t: '绕到寺后看看', fx: (g) => g.set('ddWansi'), res: (g) => (g.after(135, 4, 10) ? '寺后的院墙塌了一个口子，能钻进去。' : '寺后有一道小门，送菜的伙夫从这里进出，门口的番僧只看车，不看人。') },
        { t: '在寺前的茶摊上坐坐', fx: (g) => { g.add('银两', -1); g.add('资质', 0.3); }, res: '茶摊老板说，塔上的铜铃一响，就是起风了。他在这里坐了二十年，听得出是哪一层的铃。' },
      ] },
    { id: 'dd_ex_wansi', loc: 'dadu', act: '去万安寺', once: false, cond: (g) => g.f('ddWansi'), t: '万安寺',
      text: (g) => {
        if (g.after(135, 4, 10)) return (g.done('dd_ex_wansi') > 1 ? '你又钻进万安寺的废墟。' : '万安寺的大殿烧成了一片黑炭，白塔还立着，塔门上的铁链断成两截。') + (g.f('ddFedPrisoners') ? '你想起那些天从后门送进去的饭。' : '');
        if (g.after(134, 7)) return '塔下多了很多番僧和武士，日夜有人巡逻。听说六大派的掌门和高手都关在塔里，每天有人被斩断一根手指。';
        return '寺里的番僧在院子里练功，一掌拍在石墩上，石墩就裂了。塔上的铜铃叮叮当当地响。';
      },
      choices: [
        { t: '扮成送饭的伙夫混进塔里', cond: (g) => g.after(134, 7) && g.before(135, 4, 10), check: ['资质', '中'], fx: (g) => { g.set('ddFedPrisoners'); g.add('品德', 4); },
          res: '你推着饭车进了塔，一层一层送上去，每一层都有人抬头看你。你在一个武当道士的碗底下多压了一个馒头。',
          fail: { fx: (g) => g.hurt(50), res: '一个番僧掀开饭桶看了一眼，一掌把你推下了台阶。' } },
        { t: '花三十两买通看门的番僧', cond: (g) => g.after(134, 7) && g.before(135, 4, 10), cost: { 银两: 30 }, fx: (g) => { g.set('ddFedPrisoners'); g.add('品德', 3); },
          res: '番僧收了钱，放你送了一回饭。塔里的人饿得眼睛发直，碗一递进去就空了。' },
        { t: (g) => (g.after(135, 4, 10) ? '在废墟里翻一翻' : '在墙外看番僧练功'), cond: (g) => !(g.after(134, 7) && g.before(135, 4, 10)),
          fx: (g) => { if (g.after(135, 4, 10)) { if (g.done('dd_ex_wansi') <= 2) g.add('银两', 12); } else g.add('攻击', 0.3); },
          res: (g) => (g.after(135, 4, 10) ? (g.done('dd_ex_wansi') <= 2 ? '你在烧黑的木头底下摸到几块化了的银子，还有半截断剑。' : '只剩些烧黑的木头了。') : '番僧的掌力是从脚底下起来的。你记住了他们出掌前那一下蹲。') },
        { t: '离开', res: '你离开了万安寺。' },
      ] },
    // 发现：街口的孩子
    { id: 'dd_ex_street', loc: 'dadu', explore: 'dadu', once: false, w: 3, cond: (g) => !g.f('ddKids'), t: '街口的孩子',
      text: (g) => (g.done('dd_ex_street') > 1 ? '那群孩子又在街口，冲你挤眉弄眼。' : g.S.origin === 'beggar' ? '你当年讨饭的那条街口，又蹲着一群孩子。他们不认得你了。'
        : '街口蹲着一群脏兮兮的孩子，眼睛滴溜溜地转。谁从王府出来、谁进了哪家酒楼，他们都看在眼里。'),
      choices: [
        { t: '买一笼包子分给他们', cost: { 银两: 3 }, fx: (g) => { g.set('ddKids'); g.add('品德', 1); },
          res: '包子一眨眼就没了。最大的那个孩子抹抹嘴：“你要打听什么，来找我们。大都城里没有我们不知道的事。”' },
        { t: '教他们几招拳脚', fx: (g) => { g.set('ddKids'); g.set('ddKidsFist'); g.days(1); }, res: '他们学得很认真。最大的那个说，以后你要打听什么，来街口找他们。' },
        { t: '不理他们', res: '你走过去了。' },
      ] },
    { id: 'dd_ex_kids', loc: 'dadu', act: '找街口的孩子们打听', once: false, cond: (g) => g.f('ddKids'), t: '孩子们',
      text: (g) => (g.done('dd_ex_kids') > 1 ? '孩子们看见你，一窝蜂围了上来。' : '孩子们把你拉到墙角，七嘴八舌。')
        + (g.f('ddKidsFist') ? '最小的那个还在比划你教的那几招。' : '') + (g.f('ddExtort') ? '有两个孩子躲在后头，不敢靠近。他们看见过你跟着元兵敲诈。' : ''),
      choices: [
        { t: '请他们吃包子，问认得的人去了哪里', cost: { 银两: 3 },
          fx: (g) => {
            const ps = Object.keys(g.S.met).filter((p) => QX.PEOPLE[p] && g.alive(p) && QX.where(p) && QX.where(p) !== 'party' && QX.where(p) !== g.loc);
            if (ps.length) { const p = g.pick(ps), w = QX.where(p); g.rumor('街口的孩子说，' + g.name(p) + '眼下在' + QX.LOCS[w].short + '。', { loc: w }); }
            else g.rumor('街口的孩子说，王府最近天天有番僧进进出出，不知道在忙什么。', { loc: 'dadu' });
          },
          res: '孩子们吃着包子，你一句我一句，把听来的都说了。' },
        { t: '问王府里最近有什么动静', cost: { 银两: 3 },
          fx: (g) => g.rumor(g.holder('yitian') === 'zhaomin' && !g.has('yitian') ? '街口的孩子说，郡主书房墙上挂着一把剑，夜里有两个白头发的老头守着。'
            : g.after(134, 7) && g.before(135, 3) ? '街口的孩子说，万安寺天天往塔上送饭，送饭的伙夫都是从城外雇的。' : '街口的孩子说，王府的世子天天在城外练兵，马蹄声半夜都听得见。', { loc: 'dadu' }),
          res: '最大的那个孩子压低了嗓子，说得有板有眼。' },
        { t: '教他们几招拳脚', fx: (g) => { g.set('ddKidsFist'); g.add('品德', 1); g.days(1); }, res: '他们学得很认真。你说，学会了别去欺负人。' },
        { t: '走', res: '孩子们跟了你半条街，才散了。' },
      ] },
    // 季节
    { id: 'dd_ex_season', loc: 'dadu', explore: 'dadu', once: false, w: 2, t: (g) => ['风沙', '摔跤', '秋猎', '大雪'][ssn(g)],
      text: (g) => ['刮了三天的黄风，满城的人都蒙着脸走路，门缝里都是沙子。', '城外草地上搭了台子，蒙古人在摔跤。赢的人披上红绸，输的人也笑。谁都可以上去试试。',
        '王府的世子带着人马出城秋猎，街上的人跪了一地。马蹄扬起的土落了你一身。', '大都的冬天冷得吓人。早上起来，桥洞底下冻死了两个讨饭的。'][ssn(g)],
      choices: [
        { t: '上台摔一跤', cond: (g) => ssn(g) === 1, check: ['根骨', '中'], fx: (g) => { g.add('银两', 20); g.add('声望', 2); },
          res: '你把一个蒙古大汉摔下了台。他爬起来哈哈大笑，把红绸系在你身上，赏钱也归了你。',
          fail: { fx: (g) => g.hurt(30), res: '你被一个蒙古大汉扛起来扔下了台，摔得半天爬不起来。' } },
        { t: '给桥洞底下的人买几件旧棉袄', cond: winter, cost: { 银两: 10 }, fx: (g) => { g.add('品德', 4); g.add('声望', 1); },
          res: '你买了五件旧棉袄。有个孩子穿上以后，袖子长得拖到了地上。' },
        { t: (g) => (ssn(g) === 0 ? '帮街坊扫门口的沙子' : '站着不跪'), cond: (g) => ssn(g) === 0 || ssn(g) === 2,
          fx: (g) => { if (ssn(g) === 0) { g.add('品德', 1); g.add('根骨', 0.3); g.days(1); } else { g.hurt(20); g.like('wangbaobao', 3); g.add('声望', 1); } },
          res: (g) => (ssn(g) === 0 ? '你扫了一天沙子，街坊请你喝了一碗羊汤。' : '一个亲兵抽了你一鞭子。马上的王保保回头看了你一眼，摆了摆手，马队过去了。') },
        { t: '找个茶馆躲一躲', fx: (g) => g.restMp(20), res: '你躲进一家茶馆，喝了一下午的茶。' },
      ] },
    // 门派、品德：街口盘查
    { id: 'dd_ex_guanka', loc: 'dadu', explore: 'dadu', once: false, w: 3, t: '盘查',
      text: (g) => (g.done('dd_ex_guanka') > 1 ? '又碰上元兵在街口盘查。' : '街口设了卡，元兵挨个盘问，说是城里混进了明教的奸细。')
        + (g.f('ddKnown') ? '有个官差看了你一眼，跟旁边的人嘀咕：“酒楼里那个……”' : ''),
      choices: [
        { t: '亮出王府的腰牌，顺手把被扣的货郎要出来', cond: (g) => g.f('servedWang'), fx: (g) => { g.add('品德', 2); g.give('jinchuang', 1); },
          res: '元兵见了腰牌，腰都弯了。你指着被扣在一边的货郎说是你的人，他们就把人放了。货郎塞给你一包药，头也不回地走了。' },
        { t: '把袖子里的铁焰令藏好，硬着头皮过去', cond: (g) => g.sect === 'mingjiao' && !g.f('servedWang'), check: ['资质', '易'], res: '元兵翻了翻你的包袱，挥手让你过去。',
          fail: { fx: (g) => { g.rob(0.3, 40); g.hurt(30); }, res: '一个元兵摸到了你袖子里的东西。你撞开他就跑，身上的银子散了一地。' } },
        { t: '跟着元兵一起敲诈过路的商贩', need: ['品德', '<', 35], fx: (g) => { g.add('银两', 15); g.add('品德', -5); g.set('ddExtort'); },
          res: '你帮元兵吓唬了几个商贩，分到十五两。街口的孩子远远看着你。' },
        { t: '老老实实让他们搜', fx: (g) => g.rob(0.2, 30), res: '他们搜走了你一些碎银子，挥手放你过去。存在钱庄的，他们拿不走。' },
      ] },
    // 回响：截下还是放走明教的信使
    { id: 'dd_ex_xinshi', loc: 'dadu', explore: 'dadu', once: false, w: 3,
      cond: (g) => (g.f('wangTrust') && !g.f('ddWidowHelped')) || (g.f('fakeLoyal') && !g.f('ddLetterGift')), t: '信使',
      text: (g) => (g.f('wangTrust') ? '王府门口跪着一个妇人，抱着个孩子。她男人就是你截下的那个明教信使，关在大牢里，秋后问斩。'
        : '一个挑担的汉子在街上跟你擦肩而过，往你手里塞了一样东西。是一包药，包药的纸上画着一团火。你放走的那个信使，没忘了你。'),
      choices: [
        { t: '塞给她二十两银子', cond: (g) => g.f('wangTrust'), cost: { 银两: 20 }, fx: (g) => { g.set('ddWidowHelped'); g.add('品德', 3); }, res: '她不肯要，你放下就走了。' },
        { t: '夜里去大牢救人', cond: (g) => g.f('wangTrust'), check: ['轻功', '难'], fx: (g) => { g.set('ddWidowHelped'); g.set('helpedMing'); g.add('品德', 6); },
          res: '你翻进大牢，砍断了他的锁。他认出了你，愣了一下，什么也没说，背起老婆孩子出了城。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); }, res: '牢头敲起了锣。你逃出来的时候，背上中了一刀。' } },
        { t: '收下', cond: (g) => g.f('fakeLoyal'), fx: (g) => { g.give('renshen', 2); g.set('ddLetterGift'); }, res: '里面是两支老山参，还有一张纸条：“光明顶记着。”' },
        { t: '追上去还给他', cond: (g) => g.f('fakeLoyal'), fx: (g) => { g.set('ddLetterGift'); g.add('品德', 1); g.rumor('那个信使说，王府里有个不说话的头陀，是自己人。有事可以找他。', { loc: 'dadu' }); },
          res: '他摆摆手不肯收，压低声音跟你说了一句话，转身钻进了人群。' },
      ] },
    // 回响：酒楼里讲的是你的事
    { id: 'dd_ex_jiulou', loc: 'dadu', explore: 'dadu', once: false, w: 3,
      cond: (g) => g.f('chengkunExposed') || g.f('fakeBangzhu') || g.f('miejueLives') || g.f('yuCured') || g.f('savedZhuang'), t: '酒楼',
      text: (g) => {
        const d = [];
        if (g.f('chengkunExposed')) d.push('屠狮大会上有人说破了少林圆真的真面目');
        if (g.f('fakeBangzhu')) d.push('襄阳有人揭穿了丐帮的假帮主');
        if (g.f('miejueLives')) d.push('万安寺塔顶有人接住了跳下来的灭绝师太');
        if (g.f('yuCured')) d.push('武当俞三侠二十年后站了起来');
        if (g.f('savedZhuang')) d.push('光明顶上有人替锐金旗的庄铮挡了一剑');
        return (g.done('dd_ex_jiulou') > 1 ? '酒楼里的说书人又在讲。' : '大都最大的酒楼里，说书人拍着醒木，讲这几年江湖上的事。')
          + '他说' + d.slice(0, 2).join('，又说') + '。说得有名有姓，就是名字说错了。' + (g.f('slChengkunNote') && !g.f('ddNoteRead') ? '你摸了摸怀里成昆的那叠信。' : '');
      },
      choices: [
        { t: '站起来说，那个人就是你', fx: (g) => { g.add('声望', 5); g.set('ddKnown'); }, res: '满楼的人都回过头来。有人不信，有人举起了酒碗。角落里两个王府的武士放下筷子，出去了。' },
        { t: '低头喝酒', fx: (g) => g.add('品德', 1), res: '你听完了，付了酒钱。说书人讲得比真的好听。' },
        { t: '把成昆写给王府的信念给满楼的人听', cond: (g) => g.f('slChengkunNote') && !g.f('ddNoteRead'), fx: (g) => { g.set('ddNoteRead'); g.set('wanted'); g.add('声望', 8); g.add('品德', 2); },
          res: '你念到一半，楼下就来了官差。你从后窗跳了出去。第二天满大都都在传，汝阳王府跟少林的叛僧早有勾结。路上的捕快开始找你了。' },
      ] },

    /* ==================== 终南山 ==================== */
    // 发现：北斗石阵
    { id: 'zn_ex_stones', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 3, cond: (g) => !g.f('znBeidou'), t: '七块石头',
      text: (g) => (g.done('zn_ex_stones') > 1 ? '你又走到后山那片松林边上。林子那头的空地上，七块石头还在。' : '后山的松林中间有一片空地，七块大石头一块一块排开，弯弯曲曲，像天上的北斗。石头顶上都被踩得发亮。'),
      choices: [
        { t: '踩上去走一遍', fx: (g) => g.set('znBeidou'), res: '你从第一块跳到第七块，脚下的位置一换，身子跟着就转了过去。这是排好的阵。你想起来，全真七子当年练的就是天罡北斗阵。' },
        { t: '数数石头上的脚印', check: ['资质', '易'], fx: (g) => { g.set('znBeidou'); g.add('轻功', 0.3); }, res: '脚印一块比一块深，踩的人都是转着身子落脚的。你照着转了一圈，身子轻了。',
          fail: { res: '脚印叠着脚印，你数乱了。' } },
      ] },
    { id: 'zn_ex_beidou', loc: 'zhongnan', act: '去后山的北斗石阵', once: false, cond: (g) => g.f('znBeidou'), t: '北斗石阵',
      text: (g) => (g.done('zn_ex_beidou') > 1 ? '七块石头在松林里静静地排着。' : '你站在第一块石头上。七块石头，七个方位，一步错了，后面就全乱了。') + (winter(g) ? '石头上结了霜，滑得站不住脚。' : ''),
      choices: [
        { t: '踩着七块石头走步法', check: ['轻功', '中'], fx: (g) => { g.add('轻功', 0.5); const id = gateArt(g, ['轻功']); if (id) g.breakGate(id, '：你在北斗石上走了一整天，脚下忽然通了'); },
          great: { fx: (g) => g.add('轻功', 1), res: '走到第三十遍，你闭着眼睛也不会踩错了。' },
          res: '你走到天黑，七块石头在你脚底下像是活的。', fail: { fx: (g) => g.hurt(20), res: '你在第五块石头上滑了一跤，摔进了松针堆里。' } },
        { t: '拉六个师兄弟摆一回北斗阵', cond: (g) => g.sect === 'quanzhen', fx: (g) => { g.days(2); g.addContrib(1); g.like('qz_jianyuan', 3); addXp(g, 'quanzhen_jian', 20); },
          res: '七个人一摆开，你才知道这个阵的厉害。监院路过，站着看了半天，嘴角动了动。' },
        { t: '坐在天枢石上打坐', fx: (g) => g.restMp(60), res: '松风吹过来，你一坐就是一下午。' },
      ] },
    // 发现：养蜂的老汉（古墓的线索）
    { id: 'zn_ex_hives', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 3, cond: (g) => !g.f('znBeeman'), t: '蜂箱',
      text: (g) => (g.done('zn_ex_hives') > 1 ? '山坳里又飘来蜂蜜的甜味。' : '山坳里有几间草房，房前摆着一排蜂箱。一个白胡子老汉戴着纱罩，在蜂箱前忙活。蜂子是白色的。'),
      choices: [
        { t: '上前打个招呼', fx: (g) => g.set('znBeeman'), res: '老汉摘下纱罩，说他在这里养了一辈子蜂。“这蜂子是我爹从后山捉来的，别处没有。”' },
        { t: '掀开一只蜂箱看看', fx: (g) => { g.set('znBeeman'); g.hurt(20); }, res: '你被蜇了好几下，脸肿了半边。老汉跑过来骂你，骂完了还是请你进屋擦药。' },
      ] },
    { id: 'zn_ex_bee', loc: 'zhongnan', act: '去山坳里找养蜂的老汉', once: false, cond: (g) => g.f('znBeeman'), t: '养蜂的老汉',
      text: (g) => (g.done('zn_ex_bee') > 1 ? '老汉见你来了，笑着搬出一张板凳。' : '老汉的屋里摆满了蜜罐。他说这蜂蜜涂在伤口上比金创药还管用，吃下去能解毒。')
        + (winter(g) ? '冬天蜂子不出箱，老汉守着炉子打盹。' : ''),
      choices: [
        { t: '买一罐蜂蜜', cost: { 银两: 8 }, fx: (g) => g.give('jiedu', 1), res: '蜂蜜是淡金色的，又香又凉。' },
        { t: '帮他割两天蜜', cond: (g) => !winter(g), fx: (g) => { g.days(2); g.give('jiedu', 1); g.add('根骨', 0.2); }, res: '你被蜇了几下，慢慢地也不怕了。老汉送了你一罐蜜。' },
        { t: '问他这蜂子是从后山哪里捉来的', cond: (g) => !g.known('gumu') && !g.f('znBeeClue'), fx: (g) => { g.set('znBeeClue'); g.clue('gumu'); },
          res: '老汉说，他爹年轻时在后山一个冒寒气的潭边捉到的。潭后面有块大石头，石头上刻着字，他爹不识字。蜂子都往石缝里钻。' },
        { t: '陪他坐坐', fx: (g) => g.restMp(30), res: '老汉说他爹见过一个断了胳膊的人，骑着一只大鸟。没人信，他信。' },
      ] },
    // 门派、品德
    { id: 'zn_ex_lundao', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 3, t: '论道',
      text: (g) => (g.done('zn_ex_lundao') > 1 ? '三清殿前的台阶上，几个道士又在争。' : '三清殿前的台阶上，几个年轻道士在争一句经文，争得脸红脖子粗。')
        + (g.sect === 'quanzhen' ? '一个师兄看见你，招手让你过去评理。' : g.sect === 'mingjiao' ? '有个道士听说你是明教的，压低了声音：“魔教的人也来重阳宫？”'
          : g.sect === 'emei' ? '有个道士说，郭襄祖师的爹娘，当年和全真教也有交情。' : ''),
      choices: [
        { t: '替师兄评理', cond: (g) => g.sect === 'quanzhen', check: ['资质', '中'], fx: (g) => { g.addContrib(1); g.like('qz_jianyuan', 3); },
          res: '你把那句经文前后讲了一遍，两个师兄都不说话了。监院在殿里听见了，咳了一声。',
          fail: { fx: (g) => g.like('qz_jianyuan', -2), res: '你讲到一半自己也绕糊涂了。两个师兄一起笑你。' } },
        { t: '跟他说明教敬的是光明', cond: (g) => g.sect === 'mingjiao', fx: (g) => { g.add('品德', 1); g.like('qz_laodao', 3); },
          res: '他跟你争了半天，最后说：“你们那个光明，跟我们的道，也差不了多少。”守经楼的老道在楼上听见了，笑出了声。' },
        { t: '帮他们抄一段经', need: ['品德', 50], fx: (g) => { g.days(1); g.add('资质', 0.5); g.like('qz_laodao', 4); }, res: '你抄了一天经，字写得歪歪扭扭。守经楼的老道摸着纸，说字丑，心是正的。' },
        { t: '听一会儿', fx: (g) => g.add('资质', 0.2), res: '你听了半天，觉得两边都有理。' },
      ] },
    // 季节
    { id: 'zn_ex_season', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 2, t: (g) => ['山花', '暴雨', '登高', '封山'][ssn(g)],
      text: (g) => ['终南山的杜鹃开了，道士们挑着竹篓下山去换盐。', '一连几天暴雨，山涧里的水漫过了石桥，挑水的道童过不去。',
        '秋高气爽，从重阳宫的后山顶上，能看见八百里秦川。', '大雪封山，重阳宫里的道士都不出门，只有钟声照常响。'][ssn(g)],
      choices: [
        { t: '把挑水的道童背过石桥', cond: (g) => ssn(g) === 1, check: ['根骨', '易'], fx: (g) => { g.add('品德', 2); g.like('qz_jianyuan', 2); }, res: '水没到你的大腿，你背着道童一步一步挪了过去。',
          fail: { fx: (g) => g.hurt(30), res: '你脚下一滑，两个人都掉进了水里。好在道童会水，把你拖上了岸。' } },
        { t: '在雪地里练一趟剑', cond: winter, check: ['根骨', '中'], fx: (g) => g.add('根骨', 0.5), res: '雪落在剑上就化了。练完一趟，你身上冒着白气。',
          fail: { fx: (g) => { g.hurt(30); g.injure(1); }, res: '寒气钻进了骨头，你回屋烤了半天火还在发抖。' } },
        { t: (g) => (ssn(g) === 0 ? '帮道士们挑一趟盐' : '爬上后山顶看秦川'), cond: (g) => ssn(g) === 0 || ssn(g) === 2,
          fx: (g) => { if (ssn(g) === 0) { g.days(2); g.like('qz_jianyuan', 2); g.add('根骨', 0.2); } else { g.add('资质', 0.5); g.restMp(40); } },
          res: (g) => (ssn(g) === 0 ? '你挑了两天盐，肩膀压出了两道红印。' : '秦川平得像一张纸，渭水在上面画了一道线。') },
        { t: '回屋歇着', fx: (g) => g.restMp(30), res: '你在屋里待了一天。' },
      ] },
    // 回响：守经楼的老道（番僧上山那天）
    { id: 'zn_ex_laodao', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 3,
      cond: (g) => g.f('znDefended') || (g.f('robbedQuanzhen') && !g.f('znAtoned')) || (g.f('xiantianLost') && !g.f('znJingBack') && (g.has('xiantian') || !g.hasTask('zn_ex_jing'))), t: '老道',
      text: (g) => {
        if (g.f('robbedQuanzhen') && !g.f('znAtoned')) return '守经楼的老道坐在台阶上，听见你的脚步，脸就沉了。“偷经的人，还敢回来。”';
        if (g.f('xiantianLost') && !g.f('znJingBack')) return g.has('xiantian') ? '守经楼的老道看见你怀里露出来的经卷一角，眼睛一下子亮了。' : '守经楼的老道坐在空了一格的经架前，看见你，叹了口气：“经被番僧抢去大都了。我老了，走不动了。”';
        return '守经楼的老道坐在石碑前晒太阳。他听出了你的脚步，笑了：“挡番僧的那个娃娃来了。”';
      },
      choices: [
        { t: '在他面前跪下认错', cond: (g) => g.f('robbedQuanzhen') && !g.f('znAtoned'), fx: (g) => { g.set('znAtoned'); g.add('品德', 6); g.like('qz_laodao', 12); g.days(3); },
          res: '你跪了三天。第三天老道让人扶你起来：“经你拿去了，就好好学。学坏了，祖师爷不饶你。”' },
        { t: (g) => (g.has('xiantian') ? '把讨回来的经给老道看' : '答应替他把经讨回来'), cond: (g) => g.f('xiantianLost') && !g.f('znJingBack') && (g.has('xiantian') || !g.hasTask('zn_ex_jing')),
          fx: (g) => {
            if (g.has('xiantian')) { g.set('znJingBack'); g.taskDone('zn_ex_jing', '你把先天功从大都带回了终南山。'); g.like('qz_laodao', 15); g.add('声望', 5); g.add('品德', 3); }
            else { g.task('zn_ex_jing', '替守经楼的老道把先天功残篇从大都汝阳王府讨回来'); g.like('qz_laodao', 5); }
          },
          res: (g) => (g.f('znJingBack') ? '老道摸着经卷，手直抖。他说经回来了就好，放在楼上还会有人来抢，让你贴身带着。' : '老道拉着你的手：“经在王府的书库里，番僧守着。你别硬拼。”') },
        { t: '听他讲番僧上山那天的事', cond: (g) => g.f('znDefended'), fx: (g) => { g.like('qz_laodao', 4); g.add('声望', 1); }, res: '老道又讲了一遍番僧上山那天的事，讲到你那一下，比上回又厉害了几分。' },
        { t: (g) => (g.f('robbedQuanzhen') && !g.f('znAtoned') ? '转身走开' : '帮他把经楼扫一扫'),
          fx: (g) => { if (!(g.f('robbedQuanzhen') && !g.f('znAtoned'))) { g.add('品德', 1); g.like('qz_laodao', 2); } },
          res: (g) => (g.f('robbedQuanzhen') && !g.f('znAtoned') ? '你走了。老道在背后哼了一声。' : '你扫了一下午。楼上的经架擦得发亮。') },
      ] },
    // 回响：武当来客
    { id: 'zn_ex_guest', loc: 'zhongnan', explore: 'zhongnan', once: false, w: 2, cond: (g) => g.f('qzWudangHelp') || g.f('zhuangWudang') || g.f('yuCured'), t: '武当来客',
      text: (g) => (g.done('zn_ex_guest') > 1 ? '武当又来了人，' : '两个武当弟子背着包袱上了山，')
        + (g.f('yuCured') ? '说是替俞三侠来重阳宫还愿。俞三侠能走路以后，许过愿要给天下的道观都上一炷香。' : g.f('qzWudangHelp') ? '说是来回礼的。上回重阳宫的信，是你送去的。' : '说是来跟监院说说王府的动静。')
        + (g.f('zhuangWudang') ? '他们认出你是那天在真武殿前一起挡人的。' : ''),
      choices: [
        { t: '陪他们喝茶说话', fx: (g) => { if (g.alive('songyuanqiao')) g.like('songyuanqiao', 4); g.like('qz_jianyuan', 2); }, res: '他们说武当山上的事，你说重阳宫的事。说到天黑，两边都笑了。' },
        { t: '请他们指点几招', check: ['资质', '中'], fx: (g) => { g.add('轻功', 0.5); addXp(g, 'tiyun', 20); }, res: '他们教了你几步身法，说是梯云纵的根基。走起来身子轻飘飘的。',
          fail: { res: '他们比划了半天，你一招也没看明白。' } },
        { t: '送他们下山', fx: (g) => { g.add('品德', 1); g.days(1); if (g.f('yuCured')) g.like('yudaiyan', 3); }, res: '你送到山脚。他们说，下回上武当，一定来找你喝酒。' },
      ] },
  ]);
})();

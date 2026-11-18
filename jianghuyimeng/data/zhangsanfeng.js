/* 江湖一梦 · 张君宝（张三丰）
 * 把世界里的配角张三丰升为可玩人物。纪年 44–152，活 108 岁，把神雕和倚天连起来。
 * 三处分叉：被逐出少林后去不去襄阳（sfXiangyang）、开不开武当派（sfNoSect）、八十寿宴上救不救张翠山（cuishanLives）。
 * 这个文件只改张三丰这个人物对象，再给别人的几个节点补“读他的改命”的一句话，不新开别人的节点。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const B = '倚天屠龙记';
  const me = JY.byId.zhangsanfeng;
  if (!me) throw new Error('sanfeng.js: 世界里没有张三丰');

  JY.addFlags({
    sfXiangyang: '张君宝被逐出少林后去了襄阳，投了郭靖黄蓉',
    sfNoSect: '张三丰没有开创武当派，只收徒不立派',
    sfJiuyangFull: '张君宝在觉远圆寂时记全了两卷《九阳真经》',
    sfYuHealed: '张三丰用真气替俞岱岩续上了一部分筋骨',
    sfPureYang: '张三丰用纯阳无极功给中了寒毒的张无忌续过命',
    sfWujiTaught: '张三丰在张无忌上武当之前，就已经教过他太极的心法',
  });

  /* ---------- 人物 ---------- */
  Object.assign(me, {
    py: 'ZHANG<<JUNBAO', book: B, sex: '男',
    origin: '少林寺觉远的徒弟张君宝，后来的武当祖师',
    birthplace: '辽东', home: 'shaolin', bg: 1,
    info: { 门派: '少林寺（挂单）', 身份: '觉远的徒弟' },
    look: { hair: 'topknot', hairColor: '#2a1d14', robe: '#6d7b8d', accent: '#c9a45c' },
    family: [{ rel: '师父', id: 'jueyuan' }],
    fateText: '原著命数：少林藏经阁的小徒弟，亲耳听过觉远念《九阳真经》，被逐出少林后流落武当山，自创太极拳剑，开创武当派。活过一百岁，临终前还在替徒孙张无忌担心。',
    st: [68, 82, 72, 66, 5, 3, 20],
    lifeBonus: 22, // 原著百岁以上：寿限比别人多二十来年
    death: (g) => (g.f('sfNoSect') ? { y: 152, cause: '在山中静坐羽化，享年一百零八岁', mod: true } : { y: 152, cause: '在武当山羽化，享年一百零八岁' }),
    ms: [[50, '被送进少林寺，跟着觉远在藏经阁挑水'], [57, '跟着觉远上华山，见到神雕大侠杨过'],
      [60, '觉远圆寂，被逐出少林，流落武当山', (g) => !g.f('sfXiangyang')], [60, '觉远圆寂，被逐出少林，去了襄阳', (g) => g.f('sfXiangyang')],
      [70, '在武当山自创太极', (g) => !g.f('sfXiangyang')], [71, '襄阳城破，辗转回到武当', (g) => g.f('sfXiangyang')],
      [80, '开创武当派', (g) => !g.f('sfNoSect')], [80, '在武当山上收徒，没有立派', (g) => g.f('sfNoSect')],
      [124, '八十大寿'], [134, '武当派已是天下第一大派', (g) => !g.f('sfNoSect')], [134, '武当山上的人，天下都知道，只是没有山门的匾', (g) => g.f('sfNoSect')]],
    arc: {
      focus: '读书参悟',
      intro: '你是辽东人，家里穷，六岁被送进少林寺，跟着藏经阁的觉远和尚挑水扫地。你叫张君宝。',
      lastWords: '一百零八年了。我这一辈子，只悟出一个道理：以柔克刚。',
      nodes: [
        { id: 'sf_birth', age: 0, t: '辽东', loc: 'road', auto: true,
          text: '你生在辽东的一户穷人家，生下来哭声很大。接生的老婆婆说，这孩子将来要出远门。' },
        { id: 'sf_poor', age: 5, t: '家里', auto: true,
          text: '家里养不活这么多孩子。爹把你的衣服补了又补，说少林寺管饭。',
          fx: (g) => { g.stat('心境', -3); g.stat('情义', 3); } },
        { id: 'sf_enter', age: 6, t: '少林寺', loc: 'shaolin',
          text: '爹把你送到嵩山脚下。一个瘦瘦的和尚在山门口接你，他叫觉远，管着藏经阁。他问你：“想学什么？”',
          choices: [
            { t: '“我想吃饱饭。”', canon: true, fx: (g) => { g.remember('sf_enter', 'eat'); g.rel('师父', 'jueyuan'); }, res: '觉远笑了，说藏经阁里管饭，也管活。你从那天起开始挑水。' },
            { t: '“我想学武功。”', dev: 10, fx: (g) => { g.remember('sf_enter', 'kungfu'); g.rel('师父', 'jueyuan'); g.stat('武学', 3); }, res: '觉远说，藏经阁里没有武功，只有书。你信了半年，后来才明白他是在逗你。' },
            { t: '“我想回家。”', dev: 10, fx: (g) => { g.remember('sf_enter', 'home'); g.stat('心境', -4); }, res: '觉远没有拦你。你走到山脚，又自己走了回来。' },
          ] },
        { id: 'sf_water', age: 8, t: '挑水', loc: 'shaolin',
          text: '你每天要挑四十担水，从山下的泉眼一直挑到藏经阁。别的小沙弥都在偷懒，只有你一担不少。',
          choices: [
            { t: '一担一担挑，不数数', canon: true, fx: (g) => { g.stat('根骨', 4); g.remember('sf_water', 'steady'); }, res: '你的肩膀磨出了茧子。觉远看了一眼，什么也没说。' },
            { t: '边挑边琢磨，怎么才能走得更省力', dev: 10, check: ['悟性', 60], fx: (g) => { g.stat('悟性', 4); g.stat('根骨', 3); g.remember('sf_water', 'think'); }, res: '你发现腰放松了，水就不洒。你后来的拳法里，一直带着这个习惯。', fail: { fx: (g) => { g.remember('sf_water', 'think'); }, res: '你想得太多，一桶水全洒了。觉远罚你多挑二十担。', dev: 0 } },
            { t: '和别的小沙弥一样，偷偷歇一会儿', dev: 10, fx: (g) => { g.stat('心境', 3); g.remember('sf_water', 'rest'); }, res: '你们蹲在树荫下，笑得很大声，被知客僧罚去擦了三天佛像。' },
          ] },
        { id: 'sf_scripts', age: 10, t: '藏经阁', loc: 'shaolin',
          text: '藏经阁里的经书堆到房梁。觉远叫你擦书架，说擦的时候不许翻。你每次擦到一本书，都想打开看一眼。',
          choices: [
            { t: '守规矩，一本也不翻', canon: true, fx: (g) => { g.stat('心境', 4); g.remember('sf_scripts', 'obey'); }, res: '觉远知道。有一天他自己把一本书递给你，说：“现在可以看了。”' },
            { t: '夜里偷偷翻看', dev: 15, check: ['悟性', 55], fx: (g) => { g.stat('悟性', 6); g.remember('sf_scripts', 'peek'); g.info('所长', '识字读经'); }, res: '你借着月光读完了一卷《金刚经》，字字都记得。觉远第二天什么也没问，只是多给你留了一盏灯。', fail: { fx: (g) => { g.stat('心境', -3); g.remember('sf_scripts', 'peek'); }, res: '你被知客僧撞见，挨了十下戒尺。觉远替你求了情。', dev: 0 } },
            { t: '直接问觉远，能不能教我', dev: 10, fx: (g) => { g.remember('sf_scripts', 'ask'); g.stat('情义', 4); }, res: '觉远想了很久，说：“能。但你得先学会不急。”' },
          ] },
        { id: 'sf_fist', age: 12, t: '拳', loc: 'shaolin',
          text: '觉远不是武僧，他教你的东西只有一样：站着，慢慢打一套拳，慢到一天只能打一遍。他说拳要打得像水。',
          choices: [
            { t: '照着打，一遍一遍', canon: true, fx: (g) => { g.stat('武学', 8); g.stat('根骨', 3); g.remember('sf_fist', 'follow'); }, res: '你不明白为什么要这么慢。过了很多年，你才明白。' },
            { t: '嫌太慢，偷偷加快', dev: 10, fx: (g) => { g.stat('武学', 5); g.remember('sf_fist', 'fast'); }, res: '你打快了，觉远只是看着你，一言不发，你自己先红了脸。' },
            { t: '边打边问为什么', dev: 15, check: ['悟性', 65], fx: (g) => { g.stat('悟性', 6); g.stat('武学', 6); g.remember('sf_fist', 'ask'); }, res: '觉远说：“你问得对。慢，是为了听清自己身体里的话。”', fail: { fx: (g) => { g.stat('心境', -2); g.remember('sf_fist', 'ask'); }, res: '觉远说：“你自己想。”你想了三个月，没想出来。', dev: 0 } },
          ] },
        { id: 'sf_huashan', age: 13, t: '华山', loc: 'huashan',
          text: '觉远带着你上了华山。第三次华山论剑，五个人站在绝顶，其中一个独臂的中年人，是神雕大侠杨过。你站在山脚下仰着头，什么也看不清。',
          choices: [
            { t: '站在一旁，看着不说话', canon: true, fx: (g) => { g.rel('晚辈', 'yangguo'); g.remember('sf_huashan', 'watch'); }, res: '觉远回头看你，你说：“师父，那个独臂的人，比天还高。”' },
            { t: '鼓起勇气，向神雕大侠请教一句', dev: 15, check: ['悟性', 60], fx: (g) => { g.rel('指点过我的人', 'yangguo'); g.stat('武学', 6); g.remember('sf_huashan', 'ask'); }, res: '他低头看了你一眼，说：“剑要放得下，拳也一样。”你记了一辈子。', fail: { fx: (g) => { g.rel('晚辈', 'yangguo'); g.remember('sf_huashan', 'ask'); }, res: '你的声音太小，他没有听见。', dev: 0 } },
            { t: '悄悄记下几位高手的步法', dev: 10, fx: (g) => { g.stat('悟性', 5); g.remember('sf_huashan', 'steps'); }, res: '你回少林后，把看到的步子在地上画了一遍又一遍。' },
          ] },
        { id: 'sf_ill', age: 15, t: '觉远', loc: 'shaolin', auto: true,
          text: '觉远从华山回来以后，一天比一天瘦。他不说，你每天替他煎药。冬天，他开始咳血。',
          fx: (g) => { g.stat('心境', -4); g.stat('情义', 4); } },
        { id: 'sf_jueyuan', age: 16, t: '觉远圆寂', loc: 'shaolin',
          text: '觉远靠在藏经阁的墙上，嘴唇一张一合，念着一部你从没听过的经。他说这是他一生读过的所有经书里，最好的一部。你和另外两个人守在他身边，一个是峨嵋的郭襄姑娘，一个是少林的无色禅师。',
          choices: [
            { t: '一字一句默记下来', canon: true, fx: (g) => { g.stat('悟性', 4); g.remember('sf_jueyuan', 'memory'); g.info('武功', '九阳功残篇'); }, res: '你记住了一部分。另外两部分，被郭襄和无色记住了。' },
            { t: '什么也记不下，只扶着师父哭', dev: 15, fx: (g) => { g.stat('情义', 8); g.stat('心境', -6); g.remember('sf_jueyuan', 'cry'); }, res: '经念完了，觉远笑了一下，就没有气了。你一句也没记住。' },
            { t: '拼命记，两卷都要记全', dev: 30, check: ['悟性', 65], fx: (g) => { g.set('sfJiuyangFull'); g.stat('悟性', 8); g.stat('武学', 12); g.remember('sf_jueyuan', 'full'); g.info('武功', '九阳功（两卷）'); }, res: '你记了两卷。你只有十六岁，那天夜里你一个字都没睡。', fail: { fx: (g) => { g.stat('心境', -6); g.remember('sf_jueyuan', 'cry'); }, res: '你越急越乱，最后什么也没记全。', dev: 3 } },
          ] },
        { id: 'sf_bracelet', age: 16, t: '金镯', loc: 'shaolin', cond: (g) => !g.f('gxStayXY'),
          text: (g) => '少林寺的和尚说你不该学师父的本事，要赶你走。郭襄姑娘在山门外追上你，从手腕上摘下一只金镯。' + (g.recall('sf_jueyuan') === 'cry' ? '她红着眼睛，说你哭得比她还凶。' : ''),
          choices: [
            { t: '收下金镯，谢谢她', canon: true, fx: (g) => { g.rel('赠我金镯的人', 'guoxiang'); g.remember('sf_bracelet', 'keep'); }, res: '她让你拿着这只镯子，去襄阳找她的爹娘。你把它缠在手腕里，一直留着。' },
            { t: '谢绝，说自己不能收', dev: 10, fx: (g) => { g.rel('故人', 'guoxiang'); g.remember('sf_bracelet', 'refuse'); g.stat('心境', 3); }, res: '她笑了笑，把镯子收回去。你走了很远，才回头看一眼。' },
            { t: '请她带你一起走', dev: 20, fx: (g) => { g.set('junbaoWithXiang'); g.rel('同行的人', 'guoxiang'); g.party(['guoxiang']); g.stat('情义', 6); g.remember('sf_bracelet', 'together'); }, res: '她想了想，点点头。你挑着担子跟在她的青驴后面，一走就是三年。' },
          ] },
        { id: 'sf_nobracelet', age: 16, t: '山门', loc: 'shaolin', cond: (g) => g.f('gxStayXY'), auto: true,
          text: '少林寺的和尚说你不该学师父的本事，要赶你走。你收拾包袱，一个人站在山门外。',
          fx: (g) => { g.stat('心境', -5); g.remember('sf_bracelet', 'none'); } },
        { id: 'sf_expelled', age: 16, t: '去哪儿', loc: 'road',
          text: '你十六岁，被逐出少林，口袋里只有几个铜板和一个布包。觉远的坟还没有长草。你要去哪儿？',
          choices: [
            { t: '去武当山，找一个清静的地方', canon: true, fx: (g) => { g.move('wudang'); g.info('门派', '无'); g.remember('sf_expelled', 'wudang'); }, res: '你一路走，一路用学来的呼吸法暖着身子。在武当山脚，你抬头看了很久。' },
            { t: '去襄阳，投郭靖大侠', dev: 40, fx: (g) => { g.set('sfXiangyang'); g.move('xiangyang'); g.info('身份', '襄阳城里的年轻人'); g.remember('sf_expelled', 'xiangyang'); }, res: '你听说襄阳在打仗，守城的郭大侠是个好人。你走了两个月，才看见那座城。' },
            { t: '先守在觉远坟前，三年再说', dev: 15, fx: (g) => { g.move('shaolin'); g.stat('心境', 4); g.stat('情义', 6); g.remember('sf_expelled', 'grave'); }, res: '你在山门外搭了一间草棚，每天给坟头扫一遍落叶。三年后，才起身。' },
          ] },

        /* ----- 去襄阳（sfXiangyang）----- */
        { id: 'sf_xy_arrive', y: 61, t: '襄阳', loc: 'xiangyang', cond: (g) => g.f('sfXiangyang'),
          text: '襄阳城里的人看你一身破衣，以为你是逃难的。守城的是个中年大汉，他叫郭靖，旁边有个聪明的妇人，叫黄蓉。他们问你会做什么。',
          choices: [
            { t: '“我会挑水，扫地，也会打一点拳。”', canon: true, fx: (g) => { g.rel('郭大哥', 'guojing'); g.rel('黄姐姐', 'huangrong'); g.remember('sf_xy_arrive', 'work'); }, res: '郭靖让你去城头送水。守城的兵都说，这小子的水桶，从来不洒。' },
            { t: '“我是少林寺觉远的徒弟。”', dev: 10, fx: (g) => { g.rel('郭大哥', 'guojing'); g.rel('黄姐姐', 'huangrong'); g.remember('sf_xy_arrive', 'shaolin'); g.stat('声望', 3); }, res: '黄蓉想了想：“觉远，是华山上那位大师么？”你说是。她看了你很久，说留下吧。' },
            { t: '拿出郭襄的金镯，说是她让我来的', dev: 15, cond: (g) => g.recall('sf_bracelet') === 'keep', fx: (g) => { g.rel('郭大哥', 'guojing'); g.rel('黄姐姐', 'huangrong'); g.remember('sf_xy_arrive', 'bracelet'); g.stat('情义', 5); }, res: '黄蓉一眼就认出了那只镯子，眼圈红了：“襄儿让你来的？那你就是自家人。”' },
          ] },
        { id: 'sf_xy_learn', y: 64, t: '城头', loc: 'xiangyang', cond: (g) => g.f('sfXiangyang'),
          text: '你在襄阳住了三年。守城的兵里有个独臂老兵，有个打狗棒法耍得极好的叫花子。你每天从他们身边路过，眼睛一直盯着。',
          choices: [
            { t: '跟黄蓉学兵法和阵图', canon: true, fx: (g) => { g.stat('悟性', 6); g.remember('sf_xy_learn', 'book'); g.info('所长', '兵法'); }, res: '黄蓉教你的不是招数，是怎么看一座城、一个人、一件事。' },
            { t: '求郭靖指点一掌', dev: 15, fx: (g) => { g.stat('武学', 8); g.remember('sf_xy_learn', 'palm'); g.info('武功', '降龙掌法（皮毛）'); }, res: '郭靖说：“降龙十八掌我不能教你。但我可以教你，怎么把一掌打得扎实。”' },
            { t: '每天夜里去城墙上站岗，看着蒙古人的营火', dev: 20, fx: (g) => { g.stat('心境', 6); g.stat('根骨', 4); g.remember('sf_xy_learn', 'night'); }, res: '你在城头站了一千多个晚上。别人说你傻，郭靖说，这是在养气。' },
          ] },
        { id: 'sf_xy_fall', y: 71, t: '城破', loc: 'xiangyang', cond: (g) => g.f('sfXiangyang'),
          text: '襄阳城破了。蒙古兵从西门涌进来，郭靖、黄蓉带着剩下的人守在东门。你站在城墙上，手里只有一根扁担。',
          choices: [
            { t: '领着百姓从水门逃出去', canon: true, fx: (g) => { g.stat('情义', 6); g.stat('心境', -8); g.remember('sf_xy_fall', 'flee'); g.info('身份', '襄阳逃难的人'); }, res: '你带着一百多个人，划着小船出了水门。回头看，城里的火烧红了半边天。' },
            { t: '留在东门，替郭靖断后', dev: 35, fatal: true, check: ['武学', 55], hint: '有性命之险：败了就留在城里', fx: (g) => { g.set('sfJoinedXY'); g.stat('声望', 12); g.remember('sf_xy_fall', 'stay'); }, res: '你一根扁担，挡住了东门的蒙古兵，直到郭靖、黄蓉的背影看不见。', fail: { fx: (g) => { g.die('襄阳城破，在东门断后而死'); }, res: '你倒在东门，扁担断成了两截。', dev: 8 } },
            { t: '背起一个受伤的老兵，往城外跑', dev: 25, check: ['根骨', 60], fx: (g) => { g.stat('情义', 8); g.stat('根骨', -4); g.remember('sf_xy_fall', 'carry'); }, res: '老兵趴在你背上，一路说：“小子，你叫什么？”你说：“张君宝。”他说：“我记住了。”', fail: { fx: (g) => { g.stat('根骨', -10); g.remember('sf_xy_fall', 'carry'); g.remember('ns', Math.max(1, g.recall('ns') || 0)); }, res: '你们逃出了城，你一条腿再也没好利索。', dev: 3 } },
          ] },
        { id: 'sf_xy_after', y: 73, t: '回山', loc: 'road', cond: (g) => g.f('sfXiangyang'),
          text: '城破以后，你一个人在南方走了两年。你想起觉远的话，想起守城的日子，也想起觉远教你的那套慢拳。你该去哪儿？',
          choices: [
            { t: '去武当山，把这些东西都理一理', canon: true, fx: (g) => { g.move('wudang'); g.remember('sf_xy_after', 'wudang'); g.stat('悟性', 4); }, res: '你上了武当山。山上有一座荒废的道观，你住了进去。' },
            { t: '回襄阳旧址，替死去的人立块碑', dev: 20, fx: (g) => { g.stat('情义', 8); g.stat('声望', 4); g.remember('sf_xy_after', 'tomb'); }, res: '你在废墟里找到了郭靖的剑鞘，埋在土里，立了一块没有字的石头。' },
            { t: '在江南找一座寺庙，当一个行脚僧', dev: 15, fx: (g) => { g.stat('心境', 5); g.remember('sf_xy_after', 'monk'); g.info('身份', '行脚僧'); }, res: '你做了五年和尚，又把头发留了起来，因为你总觉得自己不该只做一件事。' },
          ] },

        /* ----- 原著：直接上武当 ----- */
        { id: 'sf_wd_arrive', y: 62, t: '武当山', loc: 'wudang', cond: (g) => !g.f('sfXiangyang'),
          text: (g) => (g.recall('sf_expelled') === 'grave' ? '你三年后才上山。' : '') + '武当山上有一座荒废的道观，檐下积了一层灰。山里有泉水，有野果，没有人。',
          choices: [
            { t: '修好道观，住下', canon: true, fx: (g) => { g.stat('根骨', 3); g.remember('sf_wd_arrive', 'repair'); g.info('身份', '武当山上的年轻道士'); }, res: '你修了三个月屋顶，每天夜里数星星。山里很静。' },
            { t: '在山洞里住，不进道观', dev: 10, fx: (g) => { g.stat('心境', 5); g.remember('sf_wd_arrive', 'cave'); }, res: '你在山洞里躺了一个月，听风过松林的声音，渐渐睡得很沉。' },
            { t: '下山采药，卖给山下的人', dev: 15, fx: (g) => { g.stat('情义', 4); g.remember('sf_wd_arrive', 'herb'); g.info('所长', '识药'); }, res: '山下的村民很快认识了你。有人病了，先想到的就是那个会采药的小道士。' },
          ] },
        { id: 'sf_wd_years', y: 66, t: '山中岁月', loc: 'wudang', cond: (g) => !g.f('sfXiangyang'), auto: true,
          text: '你在山上住了四年。每天早上起来打觉远教的那套慢拳，晚上看云。有一天你突然发现，你已经想不起来这套拳的名字了。',
          fx: (g) => { g.stat('武学', 8); g.stat('心境', 6); } },
        { id: 'sf_snake', y: 70, t: '蛇雀', loc: 'wudang',
          text: (g) => '一天清晨，你坐在山涧边，看见一条蛇和一只雀在斗。雀飞得快，蛇绕得慢，雀每次扑下来，蛇的身子就一弯，雀的嘴落了空。' + (g.recall('sf_xy_learn') === 'palm' ? '你想起郭靖说的，一掌要打得扎实。' : g.recall('sf_fist') === 'ask' ? '你想起觉远说的，慢，是为了听清自己。' : ''),
          choices: [
            { t: '坐着看完，一动不动', canon: true, fx: (g) => { g.stat('悟性', 10); g.stat('武学', 10); g.remember('sf_snake', 'watch'); g.info('武功', '太极拳（雏形）'); }, res: '蛇和雀斗了一个时辰。你回去的路上，一路比划，比划到天黑。' },
            { t: '起身，跟着蛇和雀一起比划', dev: 20, check: ['悟性', 70], fx: (g) => { g.stat('悟性', 12); g.stat('武学', 15); g.remember('sf_snake', 'practice'); g.info('武功', '太极拳（成形）'); }, res: '你在涧边摆了一个下午的架势，晚上回到道观，一口气打了一套全新的拳。', fail: { fx: (g) => { g.stat('心境', -3); g.remember('sf_snake', 'practice'); }, res: '你一起身，蛇雀都散了。你坐了很久，没有再悟出什么。', dev: 3 } },
            { t: '赶走雀，护住蛇', dev: 10, fx: (g) => { g.stat('情义', 4); g.stat('正邪', 5); g.remember('sf_snake', 'save'); }, res: '雀飞走了，蛇钻进了草里。你坐在原地，什么也没有悟到，却觉得今天做对了一件事。' },
          ] },

        /* ----- 两条路合流 ----- */
        { id: 'sf_taiji', y: 75, t: '拳意', loc: 'wudang',
          text: (g) => '你在山上又住了几年，把一路拳反复打了几千遍。' + (g.f('sfXiangyang') ? '襄阳的守城、断后、逃难，都化进了这套拳里。' : '山里的蛇雀、泉水、风，都化进了这套拳里。') + '有一天，山下的猎户上来借宿，看你打拳，问：“这是什么拳？”',
          choices: [
            { t: '“还没有名字。”', canon: true, fx: (g) => { g.stat('悟性', 4); g.remember('sf_taiji', 'noname'); }, res: '猎户说，那就先叫“太极”吧，看着像一个圈。你笑了，说好。' },
            { t: '把拳法教给猎户', dev: 15, fx: (g) => { g.stat('情义', 6); g.stat('声望', 4); g.remember('sf_taiji', 'teach'); }, res: '猎户学了三天，回去教了家里的孩子。后来山下有些人会这几招。' },
            { t: '不教，说这拳是自己的', dev: 10, fx: (g) => { g.stat('心境', -3); g.remember('sf_taiji', 'keep'); }, res: '猎户走了，你一个人在山上，把拳又打了一遍。你觉得有点孤单。' },
          ] },
        { id: 'sf_found', y: 80, t: '开山', loc: 'wudang',
          text: (g) => '山下的村民越来越多，有人上山求学，有人上山避难。有一天，山脚来了十几个年轻人，说想拜你为师。' + (g.f('sfXiangyang') ? '你想起襄阳城里的那些人。' : '你想起觉远。') + '他们问你，武当山，是不是该有一个名字？',
          choices: [
            { t: '“开山立派，叫武当。”', canon: true, fx: (g) => { g.stat('声望', 12); g.info('门派', '武当派（祖师）'); g.info('身份', '武当派祖师'); g.remember('sf_found', 'sect'); }, res: '你在道观门口挂了一块匾。第二天，山下的人都来看。' },
            { t: '“不立派，只收几个徒弟。”', dev: 40, fx: (g) => { g.set('sfNoSect'); g.stat('心境', 8); g.info('门派', '无'); g.info('身份', '山中隐士'); g.remember('sf_found', 'nosect'); }, res: '你说，我这拳是给人活命的，不是给人立门户的。他们愣了一会儿，还是留了下来。' },
            { t: '“只收一个，剩下的去山下的武馆。”', dev: 20, fx: (g) => { g.stat('声望', 6); g.remember('sf_found', 'one'); g.rel('第一个徒弟', 'songyuanqiao'); }, res: '你挑了一个最老实的。其他人下山，隔几年回来一趟，给你捎些山下的东西。' },
          ] },
        { id: 'sf_first', y: 88, t: '宋远桥', loc: 'wudang',
          text: (g) => '山下来了个二十出头的年轻人，说他叫宋远桥，听说山上有位真人，特地来拜师。他站在道观门口，等了三天三夜。' + (g.f('sfNoSect') ? '你说你不收徒。' : ''),
          choices: [
            { t: '收他为第一个弟子', canon: true, fx: (g) => { g.rel('大弟子', 'songyuanqiao'); g.stat('情义', 6); g.remember('sf_first', 'take'); }, res: '你把他扶起来，说你先去吃饭。他后来成了武当七侠之首。' },
            { t: '让他再等三年，看看心性', dev: 15, fx: (g) => { g.rel('大弟子', 'songyuanqiao'); g.stat('悟性', 3); g.remember('sf_first', 'wait'); }, res: '他又在山下住了三年。第三年冬天，你自己下山去叫他。' },
            { t: '不收，让他去少林', dev: 20, fx: (g) => { g.stat('心境', 3); g.remember('sf_first', 'refuse'); g.rel('求过师的人', 'songyuanqiao'); }, res: '他在山门磕了三个头，走了。你后来听说，他又回来了，在山下的村子里住下，没有走。' },
          ] },
        { id: 'sf_cuishan', y: 100, t: '张翠山', loc: 'wudang',
          text: '山下一个七八岁的孩子，跟着父亲上山拜年。他看见你打拳，站在一旁一遍一遍地学，学得有模有样。他父亲问：“真人，我儿子行不行？”这孩子叫张翠山。',
          choices: [
            { t: '亲自教他，从站桩开始', canon: true, fx: (g) => { g.rel('弟子', 'zhangcuishan'); g.stat('情义', 5); g.remember('sf_cuishan', 'teach'); }, res: '你教了他三年。他字写得好，拳也打得好，你有点偏心他。' },
            { t: '让宋远桥先教，自己在旁边看', dev: 15, fx: (g) => { g.rel('徒孙', 'zhangcuishan'); g.remember('sf_cuishan', 'delegate'); }, res: '宋远桥教得很认真。你每隔几天过去看一眼，也不多说。' },
            { t: '让他自己悟，什么也不教', dev: 20, fx: (g) => { g.rel('弟子', 'zhangcuishan'); g.stat('悟性', 3); g.remember('sf_cuishan', 'free'); }, res: '他在山里野了三年，居然自己悟出了一招“银钩”。你看到时，笑了很久。' },
          ] },
        { id: 'sf_seven', y: 104, t: '七个弟子', loc: 'wudang',
          text: '武当山下来的年轻人越来越多，到今年，七个最出色的弟子已经长大了：宋远桥、俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷。有一天，他们围在你身边，问你：武当到底要走哪条路？',
          choices: [
            { t: '一视同仁，每个人都教一样的东西', canon: true, fx: (g) => { g.stat('声望', 6); g.remember('sf_seven', 'equal'); }, res: '七个人各有各的长处，到了山下，江湖上叫他们“武当七侠”。' },
            { t: '偏爱一个，把心法单独传给他', dev: 25, fx: (g) => { g.stat('情义', -3); g.remember('sf_seven', 'favor'); g.rel('偏爱的弟子', 'zhangcuishan'); }, res: '你把压箱底的心法单独传给了翠山。别的弟子什么也没说，只是后来吃饭的时候，不和他坐一桌了。' },
            { t: '让他们各自下山闯荡，三年后再回来', dev: 20, fx: (g) => { g.stat('心境', 4); g.remember('sf_seven', 'send'); }, res: '七个人各奔东西。三年后回来的只有六个，另一个在路上，替人挡了一刀。' },
          ] },
        { id: 'sf_yudaiyan', y: 113, t: '俞岱岩', loc: 'wudang',
          text: '三弟子俞岱岩护送屠龙刀途中，被人用大力金刚指折断了四肢。他被抬回武当山，躺在床上，睁着眼睛看着你，一句话也说不出来。',
          choices: [
            { t: '日夜陪着他，请遍天下名医', canon: true, fx: (g) => { g.stat('情义', 8); g.stat('心境', -6); g.remember('sf_yudaiyan', 'doctor'); }, res: '你找了十几位大夫，都摇头。你自己睡在他床边，睡了三个月。' },
            { t: '以纯阳之气，替他一寸一寸续骨', dev: 30, check: ['武学', 60], fx: (g) => { g.set('sfYuHealed'); g.stat('武学', 6); g.stat('根骨', -5); g.remember('sf_yudaiyan', 'heal'); }, res: '你坐在床边，三个月没动。他的手指，终于能动了一下。', fail: { fx: (g) => { g.stat('根骨', -8); g.stat('心境', -6); g.remember('sf_yudaiyan', 'heal'); g.remember('ns', Math.max(1, g.recall('ns') || 0)); }, res: '你耗尽了真气，他的伤没有好，你自己躺了一个月。', dev: 5 } },
            { t: '下山追查，找到那只手的主人', dev: 25, fx: (g) => { g.stat('声望', 5); g.stat('正邪', -3); g.remember('sf_yudaiyan', 'avenge'); }, res: '你一个人走了半年，没有查到。回来时，你的胡子白了一半。' },
          ] },
        { id: 'sf_old', y: 118, t: '胡子', loc: 'wudang', auto: true,
          text: '你过了七十岁，头发全白，每天还是在院子里打拳。徒弟们劝你多歇歇，你说，打拳是为了歇。',
          fx: (g) => { g.stat('心境', 4); g.stat('武学', 3); } },
        { id: 'sf_birthday', y: 124, t: '八十大寿', loc: 'wudang',
          text: (g) => '你八十岁，山下来了几千人，都是来拜寿的。张翠山一家从海外回到了中原。他带着妻子殷素素，还有一个十岁的孩子。' + (g.recall('sf_seven') === 'favor' ? '你看见翠山，想起自己偏爱他的那些年。' : '') + '宴席上，有人问起俞岱岩的事。翠山忽然拔出剑，横在脖子上。',
          choices: [
            { t: '来不及，只能看着', canon: true, fx: (g) => { g.stat('心境', -20); g.stat('情义', 6); g.remember('sf_birthday', 'late'); }, res: '你抢上去，已经晚了。殷素素抱着丈夫，也跟着去了。你一生没有这样无力过。' },
            { t: '一指点住他的手腕，夺下剑', dev: 40, check: ['武学', 70], fx: (g) => { g.set('cuishanLives'); g.stat('武学', 5); g.stat('情义', 10); g.stat('心境', 5); g.remember('sf_birthday', 'save'); }, res: '你的手指落在他腕上，他的手一松，剑落在地上。他跪下去，哭得说不出话。', fail: { fx: (g) => { g.stat('心境', -20); g.remember('sf_birthday', 'late'); }, res: '你的指风慢了半步。剑已经划过去了。', dev: 8 } },
            { t: '喝住他：“你死了，岱岩会好吗？”', dev: 30, check: ['声望', 40], fx: (g) => { g.set('cuishanLives'); g.stat('声望', 4); g.stat('情义', 8); g.remember('sf_birthday', 'shout'); }, res: '满堂的人都愣住了。翠山握着剑，站了很久，终于松了手。', fail: { fx: (g) => { g.stat('心境', -20); g.remember('sf_birthday', 'late'); }, res: '你的话没有拦住他。', dev: 8 } },
          ] },
        { id: 'sf_wuji', y: 124, t: '寒毒', loc: 'wudang',
          text: (g) => (g.f('cuishanLives') ? '寿宴散后' : '寿宴之后') + '，一个蒙古王府的老者趁乱，一掌拍在翠山的儿子背上。孩子倒下去，脸色发青，浑身发冷。他叫张无忌。你抱着他，摸到了一股阴寒的内力。',
          choices: [
            { t: '抱着他去少林，求他们用《九阳真经》救命', canon: true, fx: (g) => { g.stat('情义', 6); g.remember('sf_wuji', 'shaolin'); g.rel('太师父', 'zhangwuji'); }, res: '少林方丈说，那部经，我们没有。你抱着孩子回来，一路上说不出话。' },
            { t: '用纯阳无极功给他续命', dev: 30, check: ['武学', 65], fx: (g) => { g.set('sfPureYang'); g.stat('武学', 3); g.stat('根骨', -6); g.remember('sf_wuji', 'pure'); g.rel('太师父', 'zhangwuji'); }, res: '你坐了三天三夜，他的脸色终于有了一点红。寒毒没有除，只是不再往里走。', fail: { fx: (g) => { g.stat('根骨', -10); g.remember('sf_wuji', 'pure'); g.rel('太师父', 'zhangwuji'); g.remember('ns', Math.max(1, g.recall('ns') || 0)); }, res: '你的内力太弱，压不住那股寒气，自己反而伤了元气。', dev: 5 } },
            { t: '先留他在武当，教他最基本的心法', dev: 20, fx: (g) => { g.set('sfWujiTaught'); g.stat('情义', 6); g.remember('sf_wuji', 'teach'); g.rel('太师父', 'zhangwuji'); }, res: '你教他呼吸，教他站桩，教他不去想疼。他是个听话的孩子。' },
          ] },
        { id: 'sf_taiji_wuji', y: 135, t: '太极', loc: 'wudang',
          text: (g) => (g.f('sfWujiTaught') ? '张无忌从光明顶回来，在你面前站了一会儿。他的底子比你想的还好。' : '张无忌上了武当山。他是明教的教主了。') + '赵敏在山脚下派人，要夺你的性命。他问：“太师父，有没有一种功夫，能在敌人面前，不伤他，也不伤自己？”',
          choices: [
            { t: '当场教他太极拳剑，讲一遍，打一遍', canon: true, fx: (g) => { g.stat('声望', 6); g.remember('sf_taiji_wuji', 'teach'); g.stat('悟性', 4); }, res: '你打了一遍，他看了一遍。他说：“记住了。”你说：“再看一遍。”他说：“忘了。”你笑了。' },
            { t: '只教他心法，不教招式', dev: 20, fx: (g) => { g.stat('悟性', 4); g.remember('sf_taiji_wuji', 'heart'); }, res: '你说，招式是死的，心法是活的。他似懂非懂，回去想了三天，一个晚上全明白了。' },
            { t: '让他自己和你过招，打到他明白为止', dev: 30, check: ['武学', 70], fx: (g) => { g.stat('武学', 6); g.stat('根骨', -3); g.remember('sf_taiji_wuji', 'duel'); }, res: '你们从午后打到日落。最后他站在原地，一动不动，你的拳打在他身上，像打在水里。', fail: { fx: (g) => { g.stat('根骨', -6); g.remember('sf_taiji_wuji', 'duel'); }, res: '你毕竟老了，打到一半，腰上闪了一下。他连忙扶着你。', dev: 3 } },
          ] },
        { id: 'sf_song', y: 137, t: '宋青书', loc: 'wudang', cond: (g) => g.alive('songqingshu') || g.f('songqingshuLives'),
          text: '宋远桥的儿子宋青书，一个人在山后练了一路邪门的功夫。他杀了莫声谷。他跪在你面前，说他爱一个人，爱到发疯。',
          choices: [
            { t: '依门规处置，把他逐出武当', canon: true, fx: (g) => { g.stat('心境', -8); g.remember('sf_song', 'expel'); g.rel('孙徒', 'songqingshu'); }, res: '宋远桥跪下来求情，你没有松口。那天夜里，你一个人在后山站了很久。' },
            { t: '废了他的功夫，留在山上', dev: 40, check: ['声望', 60], fx: (g) => { g.set('songqingshuLives'); g.stat('情义', 8); g.stat('声望', 5); g.remember('sf_song', 'keep'); g.rel('孙徒', 'songqingshu'); }, res: '你一掌按在他丹田，他昏了过去。醒来时，他的功夫没了，人还在。宋远桥给你磕了三个头。', fail: { fx: (g) => { g.stat('心境', -6); g.remember('sf_song', 'expel'); g.rel('孙徒', 'songqingshu'); }, res: '山上的人不服，你只能照门规办。', dev: 5 } },
            { t: '陪他下山，让他去给莫声谷的坟前磕头', dev: 30, fx: (g) => { g.stat('情义', 8); g.stat('心境', -3); g.remember('sf_song', 'grave'); g.rel('孙徒', 'songqingshu'); }, res: '你陪他走了两天，他在坟前磕得额头流血。你站在一边，没有说话。' },
          ] },
        { id: 'sf_ming', y: 144, t: '朱元璋', loc: 'wudang',
          text: (g) => '朱元璋做了皇帝，派人来请你去金陵。送信的人说，皇上记得当年明教里，有一位姓张的教主，是你的徒孙。' + (g.f('sfNoSect') ? '来人看着空荡荡的山门，没有找到匾。' : ''),
          choices: [
            { t: '婉拒，说自己是山里人', canon: true, fx: (g) => { g.stat('心境', 4); g.remember('sf_ming', 'refuse'); g.rel('故人', 'zhuyuanzhang'); }, res: '送信的人下山时，你送他到山门口，什么也没说。' },
            { t: '派大弟子去金陵，替武当说话', dev: 15, fx: (g) => { g.stat('声望', 6); g.remember('sf_ming', 'send'); g.rel('故人', 'zhuyuanzhang'); }, res: '宋远桥去了一趟，回来说，皇上很客气，但话里话外，都在防着我们。' },
            { t: '亲自去一趟，把话讲明白', dev: 25, fx: (g) => { g.stat('声望', 8); g.stat('根骨', -4); g.remember('sf_ming', 'go'); g.rel('故人', 'zhuyuanzhang'); }, res: '你一个一百岁的老头，走了三个月。朱元璋站在阶下接你。你什么也没求，只说：“天下太平，就好。”' },
          ] },
        { id: 'sf_end', y: 150, t: '羽化', loc: 'wudang',
          text: (g) => '你一百零六岁了。' + (g.recall('sf_birthday') === 'save' ? '翠山一家就在山下，你每天听着他们说话。' : g.f('cuishanLives') ? '翠山一家就在山下，你每天听着他们说话。' : '翠山夫妇的坟，就在山后。') + (g.recall('sf_jueyuan') === 'full' ? '觉远的两卷经，你从没有忘过。' : '') + '一个孩子跑上来，问你：“真人，您是怎么活这么久的？”',
          choices: [
            { t: '“我只是没有急。”', canon: true, fx: (g) => { g.stat('心境', 10); g.info('所长', '以柔克刚'); }, res: '孩子没听懂，你也没解释。你们一起坐着晒太阳。' },
            { t: '“我欠一些人，还没还完。”', dev: 15, fx: (g) => { g.stat('情义', 8); g.rel('一直惦记的人', 'guoxiang'); }, res: '孩子问欠谁。你说，欠觉远一个，欠襄儿一个，欠很多人一个。' },
            { t: '把最后一套拳教给他', dev: 20, fx: (g) => { g.stat('声望', 4); g.stat('悟性', 3); g.info('身份', '武当祖师'); g.info('所长', '太极拳剑'); }, res: '孩子学得很认真，学到最后，你打了一个很轻的圈，说，就是这样。' },
          ] },
      ],
    },
  });

  /* ---------- 专属闲笔（分年龄段） ---------- */
  JY.addFlavor('char:zhangsanfeng', [
    { t: '你挑水挑得比别人快，肩膀上一直有一道印子。', maxAge: 12 },
    { t: '师父教你写字，你把“人”字写得歪歪扭扭，他说，歪也是人。', maxAge: 12 },
    { t: '知客僧说你吃饭不挑嘴，是个好养活的孩子。', maxAge: 12 },
    { t: '你在藏经阁的窗台上养了一盆草，不浇水也活得好好的。', maxAge: 14 },
    { t: '山门外的野猫认得你，每次挑水回来都蹲在台阶上等。', maxAge: 15 },
    { t: '师父做饭很难吃，你从来没有告诉过他。', maxAge: 15, cond: (g) => g.alive('jueyuan') },
    { t: '你一个人在山里走了一整天，回来时脚底磨出了泡，心里很快活。', minAge: 16, maxAge: 40 },
    { t: '你把觉远的话抄在一块木板上，挂在床头。', minAge: 16, maxAge: 40 },
    { t: '山里下雨了，你站在檐下听了一个时辰，发现自己没有想任何事。', minAge: 16, maxAge: 40 },
    { t: '你在山涧里洗脚，水很凉，凉得你想起少林的泉。', minAge: 16, maxAge: 40 },
    { t: '有一天你在泥地上写了一个“静”字，又用脚抹掉了。', minAge: 16, maxAge: 40 },
    { t: '你一个人打拳，打到一半停下，因为你忽然不想打了。', minAge: 18, maxAge: 60 },
    { t: '山下的孩子送来一篮鸡蛋，你回了一包草药。', minAge: 30 },
    { t: '徒弟们在院子里争论哪一招更好，你坐在一旁，笑而不语。', minAge: 40, cond: (g) => g.f('sfNoSect') !== true },
    { t: '你坐在山门口晒太阳，一个小道童跑过来给你加了一件衣服。', minAge: 55 },
    { t: '你的徒弟们都比你显老，他们说你是妖怪，你说你只是比较懒。', minAge: 55 },
    { t: '你一早起来，院子里落了一地花。你扫得很慢。', minAge: 60 },
    { t: '山下的茶铺老板说，武当山上的老道士，听说活了一百多岁。他不知道你就坐在对面。', minAge: 65 },
    { t: '你用一根树枝在地上画了一个圈，又画了一个，大圈套着小圈。', minAge: 70 },
    { t: '你的手比以前抖了，打拳的时候，拳也跟着慢了半拍。你觉得这样更好。', minAge: 80 },
    { t: '你梦见觉远在藏经阁里念经，醒来时，窗外正好有人挑水路过。', minAge: 85 },
    { t: '你把一只旧金镯放在窗台上，让阳光晒着。', minAge: 70, cond: (g) => g.recall('sf_bracelet') === 'keep' },
    { t: '你一个人坐着，看日头从山这边落到山那边。', minAge: 90 },
  ]);

  /* ---------- 别的人物节点里，读他的改命 ---------- */
  const by = {};
  JY.CHARS.forEach((c) => { if (c.arc) c.arc.nodes.forEach((n) => { by[n.id] = n; }); });
  JY.ENCOUNTERS.forEach((e) => { by[e.id] = e; });
  const SELF = {
    sf_water: (g) => (g.recall('sf_enter') === 'kungfu' ? '你还记得刚进寺时说过想学武功，那话现在想起来有点好笑。' : g.recall('sf_enter') === 'home' ? '你偶尔还会想起山脚下那条回家的路。' : ''),
    sf_fist: (g) => (g.recall('sf_water') === 'think' ? '你挑水时养成的松腰习惯，让你站桩比别人稳。' : g.recall('sf_water') === 'rest' ? '你挑水时偷懒的毛病，被觉远一眼看穿。' : ''),
    sf_jueyuan: (g) => (g.recall('sf_scripts') === 'peek' ? '觉远念的几个字，你认得，是你夜里偷看过的那几卷里写的。' : g.recall('sf_scripts') === 'ask' ? '师父教你的那些，你都还记得。' : ''),
    sf_xy_fall: (g) => (g.recall('sf_xy_arrive') === 'work' ? '你每天在城头送水，认得的人比谁都多。' : g.recall('sf_xy_arrive') === 'bracelet' ? '你手腕里的金镯，被黄蓉看了一次又一次。' : ''),
    sf_xy_after: (g) => (g.f('sfJoinedXY') ? '你在东门断过后，活了下来，那一身伤到现在阴天还疼。' : g.recall('sf_xy_fall') === 'carry' ? '那个老兵后来再没有消息。' : ''),
    sf_snake: (g) => (g.recall('sf_wd_arrive') === 'cave' ? '你在山洞里住惯了，对山里的动静很熟。' : g.recall('sf_wd_arrive') === 'herb' ? '你采药时走过很多山路，眼睛认得每一种鸟。' : ''),
    sf_taiji: (g) => [g.recall('sf_snake') === 'practice' ? '蛇雀的架势，你还记得。' : '', g.recall('sf_huashan') === 'ask' ? '神雕大侠那句“拳也要放得下”，你一直放在心里。' : '', g.recall('sf_xy_after') === 'tomb' ? '襄阳旧址那块无字的石头，你每年都去看一眼。' : g.recall('sf_xy_after') === 'monk' ? '你做过五年和尚，打坐比别人久。' : ''].filter(Boolean).join(''),
    sf_found: (g) => (g.recall('sf_taiji') === 'teach' ? '山下已经有不少人会你的几招拳。' : g.recall('sf_taiji') === 'keep' ? '你一直不肯把拳教给别人。' : ''),
    sf_first: (g) => (g.recall('sf_found') === 'sect' ? '武当山已经有了名字，求师的人多了。' : g.recall('sf_found') === 'one' ? '你只收一个徒弟的规矩，早传出去了。' : ''),
    sf_seven: (g) => (g.recall('sf_first') === 'wait' ? '宋远桥等了三年，如今是七个人里最稳的一个。' : g.recall('sf_cuishan') === 'free' ? '翠山自己悟出的那招银钩，大家都学。' : ''),
    sf_birthday: (g) => [g.recall('sf_cuishan') === 'teach' ? '翠山是你亲手带大的。' : '', g.recall('sf_yudaiyan') === 'heal' ? '岱岩躺着，手指能动，却一直说不出话。' : g.recall('sf_yudaiyan') === 'avenge' ? '你一直没有查出那只手的主人。' : ''].filter(Boolean).join(''),
    sf_taiji_wuji: (g) => (g.recall('sf_wuji') === 'pure' ? '他脸上还留着当年你给他续命时的那一点红。' : g.recall('sf_wuji') === 'shaolin' ? '他记得你抱着他去少林的那一路。' : ''),
    sf_ming: (g) => (g.recall('sf_taiji_wuji') === 'heart' ? '你想起无忌那个晚上想明白的样子。' : g.recall('sf_taiji_wuji') === 'duel' ? '你的腰到现在还有点酸。' : ''),
    sf_end: (g) => [g.recall('sf_song') === 'keep' ? '青书废了功夫，却一直在山上。' : g.recall('sf_song') === 'grave' ? '青书每年清明去莫声谷的坟前磕头。' : '', g.recall('sf_ming') === 'go' ? '金陵那一趟，你谁也没提过。' : ''].filter(Boolean).join(''),
  };
  const READ = {
    gj_fall: (g) => (g.f('sfXiangyang') ? '城里有个从少林逐出来的年轻人，叫张君宝，守在东门，一根扁担，没退。' : ''),
    hr_fall: (g) => (g.f('sfXiangyang') ? '你认得那个守在东门的年轻人，他是少林寺来的，叫君宝。' : ''),
    gx_fall: (g) => (g.f('sfXiangyang') ? '城里有个叫君宝的年轻人，替你们守着东门。' : ''),
    zw_wudang: (g) => [g.f('sfWujiTaught') ? '太师父早就教过你心法，所以你一上手就懂。' : '', g.f('sfJiuyangFull') ? '太师父还说，他年轻时听过两卷九阳，能帮你对一对。' : ''].filter(Boolean).join(''),
    zw_promise3: (g) => (g.f('sfYuHealed') ? '你想起太师父早年替俞师伯续过一部分筋骨，现在只差这一帖药。' : ''),
    zw_hudie: (g) => (g.f('sfPureYang') ? '你想起太师父当年用纯阳无极功给你续过命，所以你的寒毒，比书上说的轻一些。' : ''),
    e_yt_wudang7: (g) => (g.f('sfNoSect') ? '山门上没有匾，只有一块石头刻着“真武”二字。' : ''),
  };
  Object.keys(SELF).forEach((id) => {
    const n = by[id];
    if (!n) throw new Error('sanfeng.js: 找不到自己的节点 ' + id);
    const orig = n.text;
    n.text = (g) => (typeof orig === 'function' ? orig(g) : orig) + SELF[id](g);
  });
  Object.keys(READ).forEach((id) => {
    const n = by[id];
    if (!n) throw new Error('sanfeng.js: 找不到节点 ' + id);
    const orig = n.text;
    n.text = (g) => (typeof orig === 'function' ? orig(g) : orig) + READ[id](g);
  });

  // 玩家就是张三丰时，下面这些把张三丰当配角写的奇遇不该再出现
  ['e_yt_sanfeng', 'e_sd_junbao', 'e_sd_xianglong', 'e_yt_wudang7'].forEach((id) => {
    const e = by[id];
    if (!e) throw new Error('sanfeng.js: 找不到奇遇 ' + id);
    const orig = e.cond;
    e.cond = (g) => !g.isMe('zhangsanfeng') && (!orig || orig(g));
  });
  /* ---------- 人物关系（他当玩家时用到的） ---------- */
  JY.addRelations([
    { a: 'zhangsanfeng', b: 'yangguo', ab: '神雕大侠', ba: '小师弟', y: 57, cond: (g) => g.isMe('zhangsanfeng') },
    { a: 'zhangsanfeng', b: 'guojing', ab: '郭大哥', ba: '君宝兄弟', y: 61, cond: (g) => g.f('sfXiangyang') },
    { a: 'zhangsanfeng', b: 'huangrong', ab: '黄姐姐', ba: '君宝兄弟', y: 61, cond: (g) => g.f('sfXiangyang') },
    { a: 'zhangsanfeng', b: 'songqingshu', ab: '孙徒', ba: '师祖', y: 110 },
    { a: 'zhangsanfeng', b: 'yinsusu', ab: '徒孙媳', ba: '师祖', y: 124 },
    { a: 'zhangsanfeng', b: 'zhuyuanzhang', ab: '皇帝', ba: '张真人', y: 144 },
  ]);
  /* ---------- 心愿和结局（data/wishes.js、data/legacy.js 的格式） ---------- */
  JY.WISHES.zhangsanfeng = [
    { id: 'sf1', t: '开创武当派，七个弟子到齐', done: (g, life) => !g.f('sfNoSect') && life.to >= 104 },
    { id: 'sf2', t: '救下张翠山', done: (g) => g.f('cuishanLives') },
    { id: 'sf3', t: '活过一百岁，教会张无忌太极', done: (g, life) => life.to - life.born >= 100 && !!g.recall('sf_taiji_wuji') },
  ];
  JY.ENDINGS.zhangsanfeng = [
    { id: 'sf_xy', t: '襄阳城头的少年', d: '你在襄阳守过城，后来才上了武当。', when: (g) => g.f('sfXiangyang') },
    { id: 'sf_nosect', t: '山中无派', d: '武当山上没有匾，只有一块石头。', when: (g) => g.f('sfNoSect') },
    { id: 'sf_cuishan', t: '救下了翠山', d: '八十岁那年，你没有来晚。', when: (g) => g.f('cuishanLives') },
    { id: 'sf_jiuyang', t: '记全了两卷九阳', d: '觉远的经，没有断在你手里。', when: (g) => g.f('sfJiuyangFull') },
    { id: 'sf_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
  ];
})();

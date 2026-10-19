/* 群侠 · 秘地：桃花岛、绝情谷、古墓。地点写 hidden: '标记'，攒够三条线索（g.clue('taohua' | 'jueqing' | 'gumu')）才出现在地图上。
 * 都是射雕、神雕年间的旧地，到倚天年间人去楼空：只留下屋子、坟、刻在石头上的字和没人认领的东西。
 * 这里写了每处秘地的三条线索（一定碰得到的探索事件），别的文件也可以再加线索。 */
(function () {
  'use strict';
  const QX = window.QX;

  QX.addLocs({
    taohua: { name: '东海 · 桃花岛', short: '桃花岛', region: 'donghai', scene: 'peach', x: 89, y: 56, sea: true, port: 'lintan', fare: 30, hidden: 'knowTaohua',
      desc: '岛上的桃树没人修剪，长成了一片林子。林子里的路绕来绕去，走着走着又回到原处。黄药师的旧居就在林子深处。' },
    jueqing: { name: '武关南 · 绝情谷', short: '绝情谷', region: 'xiangyang', scene: 'valley', x: 55, y: 50, hidden: 'knowJueqing',
      desc: '谷口长满了一种开花带刺的树，花很香。谷里的房子塌了一半，水仙庄的匾额斜挂在门上。' },
    gumu: { name: '终南山 · 古墓', short: '古墓', region: 'zhongnan', scene: 'tomb', x: 43, y: 45, hidden: 'knowGumu',
      desc: '石门封死了，山后的寒潭底下另有一条水道。墓里很冷，石室一间连着一间，墙上点过的灯台积了厚厚的灰。' },
  });
  QX.addSecrets({
    taohua: { loc: 'taohua', t: '你把几条线索合在一起，弄明白了：东海上有一座桃花岛，是东邪黄药师当年住的地方。从临安坐船就能去。' },
    jueqing: { loc: 'jueqing', t: '你把几条线索合在一起，弄明白了：武关往南的深山里有一座绝情谷，谷口长满带刺的花，几十年没人进去过。' },
    gumu: { loc: 'gumu', t: '你把几条线索合在一起，弄明白了：终南山古墓的石门进不去，可山后寒潭的水底下有一条水道，能潜进墓里。' },
  });
  // 寒玉床：在古墓练内功能破瓶颈
  QX.GATE_LOCS.内功.push('gumu');

  QX.addText({ 线索: '你又知道了一点{a}的事。（线索 {n}/{m}）' });
  QX.addArts({
    luoying: { name: '落英神剑掌', type: '拳掌', pow: 9, mp: 6, diff: 1.2, grow: { 攻击: 2, 轻功: 0.5 }, moves: [[1, '落英缤纷', 1], [5, '桃花影落', 1.25], [9, '落英神剑', 1.4]], src: '桃花岛', d: '黄药师的掌法，掌影纷纷，像桃花落了一地。' },
    yunv: { name: '玉女剑法', type: '兵器', pow: 10, mp: 6, diff: 1.2, grow: { 攻击: 2, 轻功: 1 }, moves: [[1, '浪迹天涯', 1], [5, '花前月下', 1.25], [9, '清饮小酌', 1.4]], src: '古墓', d: '古墓派的剑法，一招一式都轻得像在跳舞。' },
  });
  QX.addEnemies({
    eyu: { name: '潭里的鳄鱼', hp: 260, atk: 30, def: 18, agi: 10, moves: [['咬', 1.2], ['甩尾', 1.1]], xp: 40, silver: [0, 0], scale: 50 },
  });
  QX.addGear({
    junzi: { name: '君子剑', slot: '兵器', tier: 3, price: 600, bonus: { 攻击: 20 }, dur: 30, d: '绝情谷里留下的一柄剑，剑身上刻着“君子”两个字。' },
  });

  QX.addEvents([
    /* ---------- 线索 ---------- */
    { id: 'cl_th_sailor', loc: 'lintan', explore: 'lintan', w: 3, t: '老水手', cond: (g) => !g.known('taohua'),
      text: '码头上一个老水手在晒网。他说年轻时船被风吹偏了，看见过一座开满桃花的岛，岛上有人吹箫。',
      choices: [
        { t: '请他喝碗酒，细问', cost: { 银两: 3 }, fx: (g) => g.clue('taohua'), res: '他说那岛在舟山东南，岛边的礁石排得像阵法，船不敢靠。' },
        { t: '当个故事听', res: '你听完就走了。' },
      ] },
    { id: 'cl_th_petal', loc: 'lingshe', explore: 'lingshe', w: 3, t: '花瓣', cond: (g) => !g.known('taohua'),
      text: '涨潮的时候，礁石缝里漂来一片一片的桃花瓣。可这里是海上，三月早过了。',
      choices: [
        { t: '看潮水是从哪边来的', check: ['资质', '易'], fx: (g) => g.clue('taohua'), res: '潮水从西北来。那边的海上，一定有一座开花的岛。', fail: { res: '你看了半天潮水，没看出什么。' } },
        { t: '捞几片起来闻闻', fx: (g) => g.add('资质', 0.3), res: '花瓣是咸的，泡过很久的海水。' },
      ] },
    { id: 'cl_th_book', loc: 'xiangyang', explore: 'xiangyang', w: 2, t: '旧书摊', cond: (g) => !g.known('taohua'),
      text: '城门口的旧书摊上压着一本残破的《奇门遁甲》，扉页上画着一座岛，岛上画满了桃树。',
      choices: [
        { t: '花五两买下', cost: { 银两: 5 }, fx: (g) => g.clue('taohua'), res: '扉页角上有一行小字：“桃花岛主旧藏”。书摊老板说是郭大侠府上流出来的。' },
        { t: '翻两页放下', res: '你看不懂，放下了。' },
      ] },
    { id: 'cl_jq_woodman', loc: 'xiangyang', explore: 'xiangyang', w: 2, t: '老樵夫', cond: (g) => !g.known('jueqing'),
      text: '一个老樵夫挑着柴进城，腿上一道一道的血痕。他说是在武关南边的山里被一种花树刺的，到现在还疼。',
      choices: [
        { t: '问他那片花在哪里', fx: (g) => g.clue('jueqing'), res: '他说那山谷里的花刺了人，心里想什么事就疼得厉害。他再也不去了。' },
        { t: '给他一份金创药', cond: (g) => g.has('jinchuang'), fx: (g) => { g.take('jinchuang', 1); g.add('品德', 2); g.clue('jueqing'); }, res: '老樵夫谢了你，跟你说了那条山路怎么走。' },
      ] },
    { id: 'cl_jq_herb', loc: 'wudang', explore: 'wudang', w: 2, t: '采药人', cond: (g) => !g.known('jueqing'),
      text: '后山遇到一个采药人，篓子里有一株开紫花的草。他说这是断肠草，长在一处山谷里，旁边总长着一种毒花。',
      choices: [
        { t: '问那山谷在哪', fx: (g) => g.clue('jueqing'), res: '他说往北过了汉水，再往西进山。谷口有一座塌了的庄子。' },
        { t: '不多问', res: '采药人背着篓子走远了。' },
      ] },
    { id: 'cl_jq_note', loc: 'hudie', explore: 'hudie', w: 2, t: '药方', cond: (g) => !g.known('jueqing') && g.f('graveTended'),
      text: '草屋的墙缝里塞着一张药方，是胡青牛的字：“情花之毒，以断肠草解之。二物同生于一谷。”',
      choices: [
        { t: '收起药方', fx: (g) => g.clue('jueqing'), res: '药方背面画了一个山谷的样子，标着“武关南”。' },
        { t: '塞回去', res: '你把药方塞回了墙缝。' },
      ] },
    { id: 'cl_gm_pool', loc: 'zhongnan', explore: 'zhongnan', w: 3, t: '寒潭', cond: (g) => !g.known('gumu'),
      text: '重阳宫后山有一个小潭，大热天水面上也冒着寒气。潭底黑沉沉的，看不见底。',
      choices: [
        { t: '潜下去看看', check: ['根骨', '易'], fx: (g) => g.clue('gumu'), res: '潭底有一个洞口，一股冷水从里面往外涌。洞口的石头被人凿过。', fail: { fx: (g) => g.hurt(30), res: '水冷得刺骨，你没潜到底就浮了上来。' } },
        { t: '在潭边坐一会儿', fx: (g) => g.restMp(30), res: '寒气扑在脸上，你心里清醒了很多。' },
      ] },
    { id: 'cl_gm_bee', loc: 'zhongnan', explore: 'zhongnan', w: 2, t: '玉蜂', cond: (g) => !g.known('gumu'),
      text: '几只白色的蜂子绕着你飞，嗡嗡的声音很轻。守经楼的老道说，这种玉蜂只有古墓里的人才养。',
      choices: [
        { t: '跟着蜂子走', check: ['轻功', '易'], fx: (g) => g.clue('gumu'), res: '蜂子飞到山后的一片乱石前，钻进石缝里不见了。', fail: { res: '蜂子飞得太快，你跟丢了。' } },
        { t: '赶开它们', res: '蜂子飞走了。' },
      ] },
    { id: 'cl_gm_guoxiang', loc: 'emei', explore: 'emei', w: 2, t: '祖师画像', cond: (g) => !g.known('gumu'),
      text: '后殿挂着郭襄祖师的画像。看殿的老尼说，祖师年轻时找一个人找了很多年，去过终南山的古墓。',
      choices: [
        { t: '问祖师找的是谁', fx: (g) => g.clue('gumu'), res: '老尼说，是一个断了一条胳膊的大侠。古墓的门封了，祖师在山后的寒潭边坐了三天。' },
        { t: '上一炷香', fx: (g) => g.add('品德', 1), res: '画像上的人眉眼带笑，看不出等过谁。' },
      ] },

    /* ---------- 桃花岛 ---------- */
    { id: 'th_maze', loc: 'taohua', arrive: true, t: '桃花阵', text: '一上岸就是桃花林。你走了半天，又看见了岸边那块礁石。',
      choices: [
        { t: '照着奇门的路数走', check: ['资质', '中'], fx: (g) => g.set('thMaze'), res: '你数着树，左三右五，林子忽然开了。前面是一片竹林，竹林里有几间屋子。', fail: { fx: (g) => g.days(3), res: '你在林子里转了三天，才摸到屋子跟前。' } },
        { t: '一路折断桃枝做记号', fx: (g) => { g.days(2); g.set('thMaze'); g.add('品德', -1); }, res: '你折了一路的桃枝，走了两天，总算出来了。' },
      ] },
    { id: 'th_study', loc: 'taohua', explore: 'taohua', w: 4, t: '书房', cond: (g) => !g.lv('luoying') && g.f('thMaze'),
      text: '竹屋里的书架倒了一半，满地都是发霉的书。墙上挂着一幅画，画上的人一身青衣，手里拿着一支玉箫。',
      choices: [
        { t: '在残卷里找武功', check: ['资质', '中'], fx: (g) => g.learn('luoying', 1), res: '一卷掌谱夹在《易经》里，墨迹还清楚。你照着比划，掌影一片一片落下来。',
          great: { fx: (g) => { g.learn('luoying', 3); g.add('资质', 1); }, res: '你在一夜之间把那卷掌谱看了三遍，手上的掌影已经像桃花一样落了满地。' },
          fail: { res: '那些书不是讲阵法就是讲算学，你一本也看不懂。' } },
        { t: '把倒了的书架扶起来', fx: (g) => { g.add('品德', 2); g.days(1); }, res: '你把书一本一本摆回去。画上的人好像在看你。' },
      ] },
    { id: 'th_grave', loc: 'taohua', explore: 'taohua', w: 3, t: '花冢', text: '林子深处有一座坟，墓碑上写着“桃花岛女主冯氏埋香之冢”。坟边的花开得最好。',
      choices: [
        { t: '拔草上香', fx: (g) => { g.add('品德', 2); g.set('thGrave'); }, res: '你拔了草，折了一枝桃花放在碑前。' },
        { t: '看看墓门', cond: (g) => !g.f('thGrave'), check: ['资质', '难'], fx: (g) => { g.add('内力', 2); g.restMp(999); }, res: '墓门上刻着一首曲谱，是碧海潮生曲。你默记着，内息跟着曲子起伏。', fail: { res: '墓门关得严严实实。' } },
      ] },

    /* ---------- 绝情谷 ---------- */
    { id: 'jq_flowers', loc: 'jueqing', arrive: true, t: '情花', text: '谷口的花树密密麻麻，花香让人发昏。树枝上的刺又细又长。',
      choices: [
        { t: '小心穿过去', check: ['轻功', '易'], res: '你侧着身子一步一步挪过去，一根刺也没碰到。', fail: { fx: (g) => { g.hurt(40); g.injure(1); g.set('qinghuaPoison'); }, res: '一根刺扎进了手背。你想起一个人的时候，那里疼得钻心。' } },
        { t: '劈开一条路', fx: (g) => { g.days(1); g.hurt(15); }, res: '你劈了一整天，手上全是小口子。' },
      ] },
    { id: 'jq_herb', loc: 'jueqing', explore: 'jueqing', w: 3, t: '断肠草', cond: (g) => g.f('qinghuaPoison') || g.inj() > 0,
      text: '花树底下长着一丛开紫花的草，叶子是断的。胡青牛的药方上说，情花的毒，要用它来解。',
      choices: [
        { t: '嚼一片', fx: (g) => { g.unset('qinghuaPoison'); g.cure(2); g.hurt(20); }, res: '苦得你直掉眼泪。手背上的疼慢慢散了，胸口也松了。' },
        { t: '采几株带走', fx: (g) => g.give('jiedu', 2), res: '你用布包好，回头能配成解毒的药。' },
      ] },
    { id: 'jq_pool', loc: 'jueqing', explore: 'jueqing', w: 3, t: '深潭', cond: (g) => !g.f('jqSword'),
      text: '谷底有一个深潭，水面上漂着几根枯木。枯木动了一下，是鳄鱼。潭边的石壁上插着一柄剑，只露出半截剑柄。',
      choices: [
        { t: '跟鳄鱼打一架，去拔那柄剑', fight: { foes: ['eyu', 'eyu'], win: { fx: (g) => { g.set('jqSword'); g.S.gear.兵器 = { id: 'junzi', wear: 0 }; g.log('你拔出了那柄剑，剑身上刻着“君子”两个字。'); g.add('声望', 5); }, res: '鳄鱼沉回了潭底。你拔出那柄剑，剑光映着水，冷得发青。' },
          lose: { res: '鳄鱼一尾巴把你扫进了潭里，你好不容易才爬上岸。' } } },
        { t: '从石壁上绕过去', check: ['轻功', '难'], fx: (g) => { g.set('jqSword'); g.S.gear.兵器 = { id: 'junzi', wear: 0 }; g.log('你拔出了那柄剑，剑身上刻着“君子”两个字。'); }, res: '你贴着石壁挪过去，鳄鱼在底下张着嘴。你拔出剑，又贴着石壁挪了回来。', fail: { fx: (g) => g.hurt(60), res: '你脚下一滑，掉进潭里，差点被咬掉一条腿。' } },
        { t: '不去惹它', res: '你看了那剑柄很久，转身走了。' },
      ] },

    /* ---------- 古墓 ---------- */
    { id: 'gm2_water', loc: 'gumu', arrive: true, t: '水道', text: '你憋着一口气潜进寒潭，水道又窄又长，冷得骨头都在疼。',
      choices: [
        { t: '一口气游过去', check: ['根骨', '中'], res: '你从另一头的石池里冒出来，眼前是一间石室。', fail: { fx: (g) => { g.hurt(50); g.injure(1); }, res: '游到一半气就不够了。你爬上石池，吐了半天的水，胸口一直疼。' } },
        { t: '运足内力，闭气慢慢摸过去', cost: { 内力: 20 }, res: '内力护着心口，你不慌不忙地摸了过去。' },
      ] },
    { id: 'gm2_bed', loc: 'gumu', explore: 'gumu', w: 4, t: '寒玉床', text: '一间石室里摆着一张白玉床，人还没走近，寒气就扑到了脸上。听说在这床上练内功，一年抵得上十年。',
      choices: [
        { t: '躺上去运功', check: ['根骨', '中'], fx: (g) => { g.add('内力', 3); g.days(10); const id = Object.keys(g.S.arts).find((x) => QX.ARTS[x].type === '内功' && QX.atGate(x)); if (id) g.breakGate(id, '：寒玉床上的寒气逼着真气走完了关口'); },
          great: { fx: (g) => { g.add('内力', 6); g.add('根骨', 1); }, res: '寒气和真气在你身上转了十天，你下床的时候浑身轻得像要飘起来。' },
          res: '你在床上躺了十天，冻得牙齿打战。可十天下来，内力粗了一圈。', fail: { fx: (g) => { g.hurt(40); g.injure(1); }, res: '寒气钻进了骨头，你冻得受了内伤，只好爬下来。' } },
        { t: '摸一摸就走', res: '玉床冰得你手指发麻。' },
      ] },
    { id: 'gm2_ceiling', loc: 'gumu', explore: 'gumu', w: 3, t: '石棺', cond: (g) => !g.f('gmCeiling'),
      text: '最里面一间石室摆着几口石棺。有一口没合严，棺盖底下刻着密密麻麻的字，开头写着“九阴真经”。',
      choices: [
        { t: '照着学正宗的拳法', need: ['品德', 55], fx: (g) => { g.set('gmCeiling'); g.learn('dafumo', 1); }, res: '你认出了一路堂堂正正的拳法，一招一招记在心里。' },
        { t: '只挑速成的爪功', fx: (g) => { g.set('gmCeiling'); g.learn('jiuyin_zhua', 1); g.add('品德', -4); }, res: '你挑了最快的那一路学。学完了，手指冷得像冰。' },
        { t: '合上棺盖', fx: (g) => { g.set('gmCeiling'); g.add('品德', 3); }, res: '你把棺盖推严，退了出去。死人的东西，留给死人。' },
      ] },
    { id: 'gm2_sword', loc: 'gumu', explore: 'gumu', w: 3, t: '剑谱', cond: (g) => !g.lv('yunv'),
      text: '一间石室的墙上画着一男一女对剑的图，一招一式，旁边写着字。',
      choices: [
        { t: '照着墙上的图练', check: ['轻功', '中'], fx: (g) => g.learn('yunv', 1), res: '你练到天亮，身子轻得像墙上画的人。',
          great: { fx: (g) => { g.learn('yunv', 3); g.add('轻功', 1); }, res: '你一夜之间就把墙上的剑招走顺了，脚下像踩着风。' },
          fail: { res: '墙上的人转得太快，你跟不上。' } },
        { t: '只看看', fx: (g) => g.add('资质', 0.5), res: '那个女人的剑总是护着那个男人的背。' },
      ] },
  ]);
})();

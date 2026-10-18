/* 十四亿分之一 · 中年：35–64 岁
 * 三十五岁的坎、第二波转行、房子、体检、婚姻、孩子上学到成家、父母老去和离世、退休前的打算。
 * 读青年部分留下的状态（job、love、kids、house、tier、workCity……），缺了就按兜底的写法。
 * 新增的状态键名见文件末尾的说明，也写进了 docs/SPEC.md 的表。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const OFFICE = ['office', 'tech', 'sales'];
  const STABLE = ['civil', 'teacher', 'doctor', 'nurse', 'soldier'];
  const LABOR = ['worker', 'rider', 'driver', 'farmer'];
  const OWN = ['boss', 'shop', 'creator', 'freelance'];
  const JOBT = { office: '公司职员', tech: '程序员', sales: '销售', civil: '公务员', teacher: '老师', doctor: '医生', nurse: '护士', soldier: '军人',
    worker: '工人', rider: '外卖骑手', driver: '司机', farmer: '种地', boss: '做生意', shop: '开店', creator: '做内容', freelance: '自由职业', none: '无' };
  const job = (g) => g.recall('job') || 'none';
  const cat = (g) => {
    const j = job(g);
    if (OFFICE.includes(j)) return 'office';
    if (STABLE.includes(j)) return 'stable';
    if (LABOR.includes(j)) return 'labor';
    if (OWN.includes(j)) return 'own';
    return 'none';
  };
  const married = (g) => g.recall('love') === 'married' && !!JY.byId.sp && g.alive('sp');
  const spName = (g) => (JY.byId.sp ? g.name('sp') : '那个人');
  const kidsN = (g) => g.recall('kids') || 0;
  const hasKid = (g) => kidsN(g) > 0 && !!JY.byId.k1 && g.alive('k1');
  const kAge = (g) => (JY.byId.k1 ? g.ageOf('k1') : -1);
  const kn = (g) => (JY.byId.k1 ? g.name('k1') : '孩子');
  const kHe = (g) => CN.he(g, 'k1');
  const house = (g) => g.recall('house') || 'none';
  const tier = (g) => g.recall('tier') || (g.recall('hukou') === 'rural' ? 5 : g.recall('hukou') === 'county' ? 4 : 3);
  const where = (g) => g.recall('workCity') || g.recall('homeCap') || '这座城';
  const parentAlive = (g) => (!!JY.byId.fa && g.alive('fa')) || (!!JY.byId.mo && g.alive('mo'));
  const parentOld = (g) => Math.max(JY.byId.fa && g.alive('fa') ? g.ageOf('fa') : 0, JY.byId.mo && g.alive('mo') ? g.ageOf('mo') : 0);
  const debt = (g, n) => g.remember('debt', Math.max(0, (g.recall('debt') || 0) + n));
  // 回老家：场景、住处、城市等级都跟着回去，老年部分按 workCity 判断住在哪
  const backHome = (g) => {
    CN.goHome(g);
    const h = g.recall('hukou');
    g.remember('tier', h === 'rural' ? 5 : h === 'county' ? 4 : (g.recall('cityTier') || 3));
    g.remember('workCity', g.recall('homeCap'));
    g.info('住处', g.recall('homeCap') || '老家');
  };
  // 按年份固定的随机数：意外的 cond 一年里会被判断两次，用 g.rnd() 会让概率变成平方
  const yearRoll = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + (g.me || '').length * 3.7) * 43758.5453; return x - Math.floor(x); };
  const deadThisYear = (g, id) => { const W = JY.engine.get().W; return !!(W && W.dead[id] && W.dead[id].y >= g.Y - 1); };
  // 孩子的升学结果：补习、学区、亲子关系和运气
  const kidResult = (g) => {
    let s = g.rnd() * 60;
    const p = g.recall('kidPush');
    if (p === 'hard') s += 18; else if (p === 'self') s += 22; else if (p === 'easy') s += 6;
    if (g.recall('kidSchool') === 'district') s += 10;
    if (g.recall('kidSchool') === 'good') s += 6;
    if (g.recall('kidSchool') === 'left') s -= 8;
    if (g.recall('kidBond') === 'close') s += 6;
    s += g.s('学识') / 10;
    return s >= 72 ? 'top' : s >= 50 ? 'good' : s >= 28 ? 'normal' : 'none';
  };

  /* 这一年已经有中年的抉择了吗？孩子和父母的事（下面的意外）就让到下一年，免得一年弹两个抉择 */
  const DEC = [];
  const quiet = (g) => g.age !== 50 && !DEC.some((n) => n.age === g.age && (!n.cond || n.cond(g)));

  JY.addFlags({
    keptOldHouse: '老家的房子一直留着，门口那棵树还在',
  });

  /* ================= 35–49 岁 ================= */
  const NODES = [
    { id: 'm_35_mirror', age: 35, t: '三十五', auto: true,
      text: (g) => {
        const c = cat(g);
        const h = house(g);
        const a = c === 'office' ? '公司里新来的年轻人管你叫“老师”，你知道这不全是客气。' : c === 'stable' ? '单位里的日子一眼能看到头，你有时候觉得这是福气，有时候不觉得。'
          : c === 'labor' ? '腰比前几年容易酸了。工友里最年轻的那个，比你小十五岁。' : c === 'own' ? '店里的账你闭着眼都能算，就是算出来的数一年比一年小。' : '你三十五岁了。日子过得不快也不慢。';
        const b = h === 'mortgage' ? '房贷还有二十多年。' : h === 'rent' ? '房东又打电话说要涨租。' : h === 'own' ? '房子总算是自己的了。' : '';
        return a + b;
      } },
    { id: 'm_35_office', age: 35, t: '优化名单', loc: 'office', cond: (g) => cat(g) === 'office',
      text: (g) => '公司要“降本增效”。主管找你谈话，说新的系统能顶掉半个组，问你怎么打算。你在' + where(g) + '已经干了十年。',
      choices: [
        { t: '留下，接受降薪转岗', canon: true, fx: (g) => { g.stat('财富', -4); g.stat('心情', -3); g.remember('crisis', 'stay'); }, res: '工位从靠窗挪到了靠门。工资少了三成，你没跟家里细说。' },
        { t: '拿赔偿走人，去一家小公司', dev: 15, fx: (g) => { g.stat('财富', 5); g.stat('事业', -6); g.remember('crisis', 'small'); }, res: '小公司的老板比你小八岁，说话很客气。头一个月，你重新学会了做所有的事。' },
        { t: '拿赔偿，自己开家小店', dev: 25, fx: (g) => { g.stat('财富', -6); CN.setJob(g, 'shop', '开了家小店'); g.remember('crisis', 'shop'); }, res: '你在小区门口盘下一间铺面。开张那天，前同事送来一个花篮。' },
        { t: '回老家考个编制', dev: 25, check: ['学识', 60],
          fx: (g) => { backHome(g); CN.setJob(g, 'civil', '县里的事业编'); g.remember('crisis', 'home'); g.stat('心情', 4); }, res: '三十五岁是报名的最后一年。你考上了，搬回了老家。',
          fail: { fx: (g) => { backHome(g); CN.setJob(g, 'none', '待业'); g.remember('crisis', 'idle'); g.stat('心情', -6); }, res: '差了两分。你还是搬回了老家，先在家里待着。', dev: 10 } },
      ] },
    { id: 'm_35_stable', age: 35, t: '竞聘', loc: 'office', cond: (g) => cat(g) === 'stable',
      text: '单位里空出一个副职。领导私下问你，要不要报个名。',
      choices: [
        { t: '算了，安安稳稳干自己的', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('stableRoute', 'steady'); }, res: '名单贴出来，上面没有你。你下班照常去接孩子。' },
        { t: '报名去竞聘', dev: 15, check: ['人缘', 55],
          fx: (g) => { g.stat('事业', 10); CN.setJob(g, job(g), JOBT[job(g)] + '（中层）'); g.remember('stableRoute', 'lead'); }, res: '你上了。开会坐的位置往前挪了两排，下班也晚了两个钟头。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('stableRoute', 'lost'); }, res: '你没上。上的那个人比你会说话。之后几年，你们在走廊里碰见都点个头。', dev: 5 } },
        { t: '辞职，出去闯一闯', dev: 30, fx: (g) => { g.stat('财富', -8); debt(g, 20); CN.setJob(g, 'boss', '辞职下海做生意'); g.remember('stableRoute', 'quit'); }, res: '家里人都觉得你疯了。你交了辞职信，借了二十万。' },
      ] },
    { id: 'm_35_labor', age: 35, t: '干不动的那一天', cond: (g) => cat(g) === 'labor',
      text: (g) => (job(g) === 'farmer' ? '村里的地越来越多人包给大户了。' : '厂里、站里新添了一批机器人，不吃饭，不请假。') + '你算了算，自己还能这么干几年。',
      choices: [
        { t: '接着干，多接点活', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('财富', 4); g.remember('laborRoute', 'grind'); }, res: '你每天比别人早来一个钟头。钱是多了，晚上翻身的时候腰会响。' },
        { t: '去学修机器人', dev: 20, check: ['学识', 40],
          fx: (g) => { CN.setJob(g, 'worker', '机器人维修工'); g.stat('事业', 8); g.remember('laborRoute', 'skill'); }, res: '你夜里去上培训班，三个月后拿到了证。以前顶替你的机器，现在归你修。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('laborRoute', 'grind'); }, res: '那些线路图你看不进去。学了两个月，你又回去干老本行。', dev: 5 } },
        { t: '回老家，不在外面熬了', dev: 15, fx: (g) => { backHome(g); CN.setJob(g, g.recall('hukou') === 'rural' ? 'farmer' : 'shop', g.recall('hukou') === 'rural' ? '回乡种地' : '在老家开小卖部'); g.remember('laborRoute', 'home'); g.stat('心情', 3); }, res: '你把被褥打包，坐了一夜的车。老家的早饭还是那个味道。' },
      ] },
    { id: 'm_35_own', age: 35, t: '生意', cond: (g) => cat(g) === 'own',
      text: '有人来找你，说现在正是扩张的好时候，问你要不要再开一家、多投一点。',
      choices: [
        { t: '稳着做，不折腾', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('ownRoute', 'steady'); }, res: '你把那人送走，接着擦你的柜台。' },
        { t: '借钱扩张', dev: 20, check: ['事业', 45],
          fx: (g) => { g.stat('财富', 12); g.stat('事业', 8); g.remember('ownRoute', 'grow'); }, res: '第二家店开起来了，第一年就回了本。你开始学着当老板，而不是当店员。',
          fail: { fx: (g) => { g.stat('财富', -12); debt(g, 30); g.remember('ownRoute', 'debt'); }, res: '新店开在了不该开的地方。半年后关门，留下三十万的账。', dev: 10 } },
        { t: '关了，去找份上班的工作', dev: 15, fx: (g) => { CN.setJob(g, 'office', '公司职员'); g.stat('心情', 2); g.remember('ownRoute', 'quit'); }, res: '你把钥匙交还房东，买了两件衬衫，去面试了。' },
      ] },
    { id: 'm_35_none', age: 35, t: '找点事做', cond: (g) => cat(g) === 'none',
      text: '这些年你没有一份正经工作。家里人问起来，你总说再看看。',
      choices: [
        { t: '找份活干，先挣着', canon: true, fx: (g) => { CN.setJob(g, 'worker', CN.pick(['仓库理货员', '物业保安', '超市理货员', '保洁'])); g.stat('财富', 4); g.remember('noneRoute', 'work'); }, res: '工资不高，按月发。你第一次觉得，有个地方要去也挺好。' },
        { t: '在家照顾一家老小', dev: 10, cond: (g) => married(g) || hasKid(g) || parentAlive(g), fx: (g) => { g.info('职业', '全职在家'); g.stat('人缘', 4); g.remember('noneRoute', 'home'); }, res: '一日三餐、接送、看病，都是你。没人给你发工资，也没人能离得开你。' },
        { t: '学门手艺，自己接活', dev: 20, check: ['学识', 35],
          fx: (g) => { CN.setJob(g, 'freelance', CN.pick(['装修师傅', '修家电的', '做蛋糕的', '剪辑师'])); g.stat('事业', 6); g.remember('noneRoute', 'craft'); }, res: '你的名字开始在几个群里被人转来转去。“找他，手艺好。”',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('noneRoute', 'work'); CN.setJob(g, 'worker', '仓库理货员'); }, res: '学了半年没学成，你还是去了仓库。', dev: 5 } },
      ] },
    { id: 'm_36_parents', age: 36, t: '爸妈', auto: true, cond: (g) => parentAlive(g),
      text: (g) => '爸妈都过了六十。' + (g.recall('sibs') ? '兄弟姐妹的群里，大家开始说起谁回家多、谁回家少。' : '你是独生子女，这件事你从小就知道意味着什么。') + (tier(g) <= 3 && g.recall('hukou') !== 'city' ? '老家离你一千多里。' : '') },
    { id: 'm_37_crisis_echo', age: 37, t: '两年以后', auto: true,
      cond: (g) => !!(g.recall('crisis') || g.recall('stableRoute') || g.recall('laborRoute') || g.recall('ownRoute') || g.recall('noneRoute')),
      fx: (g) => {
        const r = g.recall('crisis') || g.recall('stableRoute') || g.recall('laborRoute') || g.recall('ownRoute') || g.recall('noneRoute');
        if (r === 'home' || r === 'steady') g.stat('心情', 3);
        if (r === 'grind') g.stat('健康', -3);
        if (r === 'debt') g.stat('心情', -4);
        if (r === 'grow' || r === 'lead' || r === 'skill' || r === 'craft') g.stat('事业', 4);
      },
      text: (g) => {
        const c = g.recall('crisis');
        if (c === 'stay') return '那次降薪转岗以后，你在公司里一直很安静。又一轮优化，名单上还是没有你。你说不清这是运气还是什么。';
        if (c === 'small') return '小公司没撑过两年，你又换了一家。你发现自己已经很会换工作了。';
        if (c === 'shop') return '小店的生意时好时坏。熟客记得你的名字，你也记得他们爱吃什么。';
        if (c === 'home') return '在县里上班，下午五点半就到家了。你开始在院子里种菜。';
        if (c === 'idle') return '回老家以后，你在家待了一年多，后来托人进了一家厂里管仓库。';
        const s = g.recall('stableRoute');
        if (s === 'lead') return '当了中层以后，你的酒量和白头发一起长了。';
        if (s === 'lost') return '没竞聘上那件事，你后来很少想起。倒是那个人先调走了。';
        if (s === 'quit') return '下海的第二年，你总算没再赔钱。借的二十万还了一半。';
        if (s === 'steady') return '你还是坐在原来那张桌子前。窗外的树长高了一截。';
        const l = g.recall('laborRoute');
        if (l === 'skill') return '你成了厂里最吃香的维修工，半夜也有人打电话找你。';
        if (l === 'home') return '回老家以后，钱挣得少了，人胖了一圈。';
        if (l === 'grind') return '你又干了两年。体检单上多了几个箭头。';
        const o = g.recall('ownRoute');
        if (o === 'grow') return '两家店，你两头跑。账本换成了平板，数字越来越长。';
        if (o === 'debt') return '那三十万的账还压着。你开始接一些以前看不上的小单。';
        if (o === 'quit') return '上班以后，你每个月十号等工资。你说这样睡得着觉。';
        if (o === 'steady') return '你的店还开在老地方。附近开开关关好几家，你还在。';
        const n = g.recall('noneRoute');
        if (n === 'home') return '家里的事全在你手上。孩子说，家里最离不开的人是你。';
        if (n === 'craft') return '找你干活的人要提前一个月排队了。';
        return '那份活你干下来了。每天准时出门，准时回家。';
      } },

    /* 38 岁：婚姻 */
    { id: 'm_38_marriage', age: 38, t: '冷战', loc: 'home', cond: (g) => married(g),
      text: (g) => '你和' + spName(g) + '已经很久没好好说过话了。饭桌上，两个人各看各的手机。',
      choices: [
        { t: '就这么过吧', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('marriage', 'cold'); }, res: '日子照旧。家里很安静，安静得像一间旅馆。' },
        { t: '找个时间好好谈一次', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); g.remember('marriage', 'mended'); }, res: '你们在楼下的烧烤摊坐到半夜。说开了，也哭了。回家的路上，' + '你们牵了手。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('marriage', 'cold'); }, res: '话说到一半就吵了起来。之后，你们更少说话了。', dev: 3 } },
        { t: '离婚', dev: 25,
          fx: (g) => { g.unrel('妻子'); g.unrel('丈夫'); g.remember('love', 'divorced'); g.info('婚姻', '离异'); g.stat('财富', -10); g.stat('心情', -6); g.remember('marriage', 'split'); if (hasKid(g)) g.remember('custody', g.rnd() < 0.5 ? 'me' : 'ex'); }, res: '手续办得比想象中快。走出民政局，你们在门口站了一会儿，各自走了。' },
      ] },
    { id: 'm_38_single', age: 38, t: '一个人', cond: (g) => !married(g),
      text: (g) => (g.recall('love') === 'divorced' ? '离婚好几年了。' : g.recall('love') === 'widowed' ? '一个人过了好几年。' : '三十八岁，你还是一个人。') + '过年回家，亲戚们换了个说法：“找个伴，老了有人说话。”',
      choices: [
        { t: '听家里的，去相亲', canon: true, fx: (g) => { CN.marry(g, { origin: '相亲认识' }); g.remember('lateMarry', 'match'); g.stat('心情', 1); }, res: (g) => '见了第五个，是' + spName(g) + '。你们都没说爱不爱，只说合适。半年后领了证。' },
        { t: '一个人也挺好', dev: 15, fx: (g) => { g.info('婚姻', g.recall('love') === 'divorced' ? '离异，单身' : '单身'); g.stat('心情', 4); g.remember('lateMarry', 'alone'); }, res: '你给自己买了一个好一点的床垫，养了一盆不会死的绿萝。' },
        { t: '等一个聊得来的人', dev: 10, check: ['人缘', 50],
          fx: (g) => { CN.marry(g, { origin: '朋友介绍认识' }); g.stat('心情', 6); g.remember('lateMarry', 'love'); }, res: (g) => '朋友聚会上，' + spName(g) + '坐在你旁边。你们从一部老电影聊到了天亮。',
          fail: { fx: (g) => { g.stat('心情', -2); g.remember('lateMarry', 'alone'); g.info('婚姻', '单身'); }, res: '那个人一直没出现。后来你也不等了。', dev: 3 } },
      ] },
    { id: 'm_39_love_echo', age: 39, t: '这一年', auto: true, cond: (g) => !!(g.recall('marriage') || g.recall('lateMarry')),
      fx: (g) => { const m = g.recall('marriage'); if (m === 'cold') g.stat('健康', -2); if (m === 'mended') g.stat('心情', 3); },
      text: (g) => {
        const m = g.recall('marriage');
        if (m === 'mended') return '那次长谈以后，你们周末会一起去买菜。' + spName(g) + '记得你不吃香菜。';
        if (m === 'cold') return '你们还在一个屋檐下。你开始失眠，凌晨三点盯着天花板。';
        if (m === 'split') return g.recall('custody') === 'me' ? '离婚以后，孩子跟你。早上做两份早饭，晚上听写单词，一个人顶两个人用。' : g.recall('custody') === 'ex' ? '离婚以后，孩子跟了对方。每个周六是你的，你提前一周就想好去哪儿。' : '离婚以后，你的房间空了一半。你把另一半堆满了书。';
        const l = g.recall('lateMarry');
        if (l === 'match') return '相亲结婚的日子，比你想的平静。两个人各让一步，也过得下去。';
        if (l === 'love') return '晚了几年遇见的人，你格外珍惜。';
        return '一个人的日子很自由。生病的那一周，你一个人去医院挂了号。';
      } },

    /* 40 岁 */
    { id: 'm_40_nokid', age: 40, t: '孩子', loc: 'hospital', cond: (g) => married(g) && kidsN(g) === 0,
      text: '你们结婚好些年了，一直没有孩子。双方父母不再当面问，只是叹气。',
      choices: [
        { t: '去医院试试', canon: true, check: ['健康', 50],
          fx: (g) => { CN.haveKid(g); g.stat('心情', 8); g.stat('财富', -8); g.remember('nokid', 'ivf'); }, res: '跑了一年多医院，打了不知道多少针。孩子哭出声的那一刻，你蹲在走廊上哭了。',
          fail: { fx: (g) => { g.stat('心情', -6); g.stat('财富', -8); g.remember('nokid', 'failed'); }, res: '试了三次，都没成。最后一次出来，你们谁也没说话。', dev: 0 } },
        { t: '不要了，两个人过', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('nokid', 'dink'); }, res: '你们把多出来的那间屋改成了书房。' },
        { t: '领养一个', dev: 25, fx: (g) => { CN.haveKid(g, { born: g.Y - 3, origin: '领养的孩子' }); g.stat('人缘', 4); g.remember('nokid', 'adopt'); }, res: '孩子第一次叫你的时候，叫得很小声。你答应得很大声。' },
      ] },
    { id: 'm_40_body', age: 40, t: '四十', cond: (g) => !(married(g) && kidsN(g) === 0),
      text: '四十岁生日那天，你爬了三层楼，喘得厉害。镜子里的人，肚子先到了。',
      choices: [
        { t: '照旧，忙完这阵再说', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('body40', 'ignore'); }, res: '这一阵一直没忙完。' },
        { t: '开始跑步', dev: 10, fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); g.remember('body40', 'run'); }, res: '第一天跑了一公里。第二天腿疼得下不了楼，第三天你又去了。' },
        { t: '犒劳一下自己，买辆好车', dev: 10, cond: (g) => g.s('财富') >= 50, fx: (g) => { g.stat('财富', -8); g.stat('心情', 5); g.remember('body40', 'car'); }, res: '新车停在楼下，你下楼看了它好几次。' },
      ] },
    { id: 'm_41_body_echo', age: 41, t: '身体', auto: true, cond: (g) => !!(g.recall('body40') || g.recall('nokid')),
      fx: (g) => { if (g.recall('body40') === 'run') g.stat('健康', 3); if (g.recall('body40') === 'ignore') g.stat('健康', -2); },
      text: (g) => {
        const n = g.recall('nokid');
        if (n === 'ivf') return '家里多了一个小人，你的觉少了一半。四十多岁当爸妈，抱孩子的时候腰会响。';
        if (n === 'failed') return '那件事以后，你们去了一趟很远的地方。回来的时候，好像放下了一些。';
        if (n === 'dink') return '同龄人都在聊补习班。你们在聊下一次去哪儿。';
        if (n === 'adopt') return '孩子慢慢不怕生了，会在你下班的时候扑过来。';
        const b = g.recall('body40');
        if (b === 'run') return '跑了一年，你瘦了十几斤。小区里跑步的人见了你会打招呼。';
        if (b === 'car') return '新车开了一年，后备箱里多了孩子的玩具、老人的药、一箱一箱的矿泉水。';
        return '体检的箭头又多了两个。你把报告折起来塞进了抽屉。';
      } },

    /* 42 岁：第二波 */
    { id: 'm_42_office', age: 42, t: '第二个十年', loc: 'office', cond: (g) => cat(g) === 'office',
      text: '你所在的行当又变了样。很多活交给了 AI，剩下的人要么带着 AI 干活，要么被 AI 带着干活。',
      choices: [
        { t: '熬着，当个中层', canon: true, fx: (g) => { g.stat('事业', 5); g.stat('健康', -2); g.remember('career42', 'mid'); }, res: '你手下有了几个人，也有了更多的会。' },
        { t: '转去做 AI 训练', dev: 20, check: ['学识', 55],
          fx: (g) => { CN.setJob(g, 'tech', 'AI 训练师'); g.stat('事业', 8); g.remember('career42', 'pivot'); }, res: '你把十几年的行业经验教给机器。它学得很快，你也学了不少。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('career42', 'mid'); }, res: '培训考核没过。你回到原来的位置，假装没去过。', dev: 5 } },
        { t: '离开大城市', dev: 20, cond: (g) => tier(g) <= 2,
          fx: (g) => { backHome(g); CN.setJob(g, 'office', '老家的公司职员'); g.stat('心情', 5); g.stat('财富', -4); g.remember('career42', 'home'); }, res: '你在老家找了一份工资少一半的工作。通勤从一个半钟头变成了十分钟。' },
      ] },
    { id: 'm_42_stable', age: 42, t: '调动', cond: (g) => cat(g) === 'stable',
      text: '单位要选人去偏远的县里帮扶三年。报了名的，回来提拔优先。',
      choices: [
        { t: '不去，家里离不开', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: '你把报名表还了回去。那三年，你没错过孩子的一次家长会。' },
        { t: '报名去', dev: 20, fx: (g) => { g.move('county', '偏远的山区县'); g.stat('事业', 10); g.stat('人缘', -3); g.remember('career42', 'remote'); }, res: '你带着两个箱子上了山。那里的人说话你一开始听不懂。' },
        { t: '出来自己干', dev: 25, cond: (g) => ['teacher', 'doctor', 'nurse'].includes(job(g)),
          fx: (g) => { CN.setJob(g, 'boss', job(g) === 'teacher' ? '自己办辅导班' : '开了一家诊所'); g.stat('财富', 6); g.remember('career42', 'private'); }, res: '你辞掉了铁饭碗。招牌挂上去那天，你在门口站了很久。' },
      ] },
    { id: 'm_42_labor', age: 42, t: '换个活法', cond: (g) => cat(g) === 'labor',
      text: '老乡打电话来，说有个铺面，问你要不要合伙。另一个老乡说，南边有个大工地，一个月顶这里两个月。',
      choices: [
        { t: '哪儿也不去，接着干', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('财富', 2); g.remember('career42', 'grind'); }, res: '你还在老地方。门口卖早点的换了三拨人。' },
        { t: '和老乡合伙开店', dev: 15, check: ['财富', 30],
          fx: (g) => { CN.setJob(g, 'shop', '和老乡合伙开店'); g.stat('财富', 4); g.remember('career42', 'shop'); }, res: '你们开了一家面馆。你负责后厨，他负责算账。',
          fail: { fx: (g) => { debt(g, 10); g.stat('心情', -4); g.remember('career42', 'grind'); }, res: '钱凑不齐，铺面让别人租走了。你还欠了老乡十万的人情。', dev: 5 } },
        { t: '去更远的地方，挣得多', dev: 15, fx: (g) => { CN.goCity(g, 1); g.stat('财富', 6); g.stat('人缘', -4); g.remember('career42', 'far'); }, res: (g) => '你去了' + g.recall('workCity') + '。一年回一次家，孩子见你要先愣一下。' },
      ] },
    { id: 'm_42_own', age: 42, t: '新路子', cond: (g) => cat(g) === 'own',
      text: '做生意的朋友都在开直播，说一晚上能卖掉你一个月的货。',
      choices: [
        { t: '老老实实做老客户', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'steady'); }, res: '你的客户大多跟了你十年。他们说，就信你。' },
        { t: '自己上镜开直播', dev: 15, check: ['人缘', 45],
          fx: (g) => { g.stat('财富', 8); g.stat('事业', 5); g.remember('career42', 'live'); }, res: '第一晚只有十三个人看。三个月后，有人在街上认出了你。',
          fail: { fx: (g) => { g.stat('财富', -5); g.stat('心情', -3); g.remember('career42', 'steady'); }, res: '对着镜头，你一句话也说不利索。直播间里只有你自己的回声。', dev: 5 } },
        { t: '交给合伙人，自己歇两年', dev: 15, fx: (g) => { g.stat('心情', 5); g.stat('事业', -5); g.remember('career42', 'rest'); }, res: '你第一次在工作日的上午去公园。原来上午的公园这么多人。' },
      ] },
    { id: 'm_42_none', age: 42, t: '出去做点事', cond: (g) => cat(g) === 'none',
      text: '社区里贴了招工启事：居家养老服务员，培训上岗，离家近。',
      choices: [
        { t: '还是在家', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('career42', 'home'); }, res: '你把启事拍下来发给了邻居。' },
        { t: '去报名', dev: 15, fx: (g) => { CN.setJob(g, 'worker', '养老服务员'); g.stat('财富', 4); g.remember('career42', 'work'); }, res: '你每天去几户老人家里，量血压、陪着说话。有个老太太总把你叫成她女儿的名字。' },
      ] },
    { id: 'm_43_career_echo', age: 43, t: '工作', auto: true, cond: (g) => !!g.recall('career42'),
      fx: (g) => { const c = g.recall('career42'); if (c === 'far') g.stat('人缘', -2); if (c === 'live' || c === 'pivot') g.stat('财富', 3); if (c === 'remote') g.stat('事业', 3); },
      text: (g) => ({
        mid: '你的会越开越多，代码、方案、报表都交给了 AI，你负责对它们说“不行，重来”。',
        pivot: '做 AI 训练的这一年，你见到的年轻人都管你叫前辈。',
        home: '回老家的第一年，你胖了，也睡得着了。',
        steady: '你在原单位又过了一年，一切都和去年差不多。',
        remote: '山区县的帮扶，你带出了一条路、一所小学的新食堂。走的时候，有人往你车里塞了两只鸡。',
        private: '自己干的头一年最难。第二年，回头客多了起来。',
        grind: '你又干了一年。工友换了好几茬，你成了最老的那个。',
        shop: '面馆的招牌被油烟熏黄了。中午十二点，门口排队。',
        far: '在外地的一年，你攒下了钱，也攒下了和家里越来越短的视频通话。',
        live: '直播间里叫你“哥”“姐”的人越来越多，你记不住他们的名字，他们记得你的。',
        rest: '歇了一年，你重新回店里看了看。合伙人把店打理得还行，你有点放心，也有点失落。',
        work: '照顾老人的活不轻松。你常想，等自己老了，会是谁来敲门。',
      }[g.recall('career42')] || '工作上，这一年平平稳稳。') },

    /* 44 岁：房子 */
    { id: 'm_44_buy', age: 44, t: '房子', cond: (g) => ['none', 'rent'].includes(house(g)),
      text: (g) => '你在' + where(g) + '租房子住了这么多年。' + (hasKid(g) ? kn(g) + '问你：我们什么时候有自己的家？' : '房东说要卖房，让你考虑一下。'),
      choices: [
        { t: '回老家县城买一套', canon: true, fx: (g) => { g.remember('house', 'own'); g.stat('财富', -14); g.remember('house44', 'county'); }, res: '县城的房子不贵，你一次付清了。钥匙拿到手，你在空荡荡的客厅里坐了一下午。' },
        { t: '接着租，不背债', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.stat('心情', 2); g.remember('house44', 'rent'); }, res: '你换了一套离单位近的。钱留在手里，你觉得踏实。' },
        { t: '在这儿咬牙买', dev: 15, cond: (g) => g.s('财富') >= 50,
          fx: (g) => { g.remember('house', 'mortgage'); debt(g, 100); g.stat('财富', -20); g.remember('house44', 'bought'); }, res: '首付掏空了所有的积蓄。合同签完，你算了算，房贷还完那年你七十岁。' },
      ] },
    { id: 'm_44_loan', age: 44, t: '房贷', cond: (g) => house(g) === 'mortgage',
      text: '你小区的房价比你买的时候跌了两成。房贷还剩一大半，每个月照样扣。',
      choices: [
        { t: '接着还', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('house44', 'pay'); }, res: '你把扣款日设在发工资的第二天，眼不见心不烦。' },
        { t: '攒了一笔，提前还一部分', dev: 10, check: ['财富', 50],
          fx: (g) => { debt(g, -40); g.stat('财富', -10); g.stat('心情', 4); g.remember('house44', 'early'); }, res: '月供少了一千多。那个月你请全家吃了顿火锅。',
          fail: { fx: (g) => { g.stat('心情', -2); g.remember('house44', 'pay'); }, res: '钱还没攒够，你又放了回去。', dev: 0 } },
        { t: '卖了，换一套小的', dev: 15, fx: (g) => { g.remember('house', 'own'); g.remember('debt', 0); g.stat('财富', 4); g.remember('house44', 'sold'); }, res: '亏着卖掉了。换了一套小两室，房贷没了，你一下子轻了二十斤似的。' },
      ] },
    { id: 'm_44_own', age: 44, t: '房子的事', cond: (g) => ['own', 'hometown'].includes(house(g)),
      text: '房子是自己的了。有人劝你再买一套收租，有人劝你趁早把房子过户给孩子。',
      choices: [
        { t: '留着自己住，不折腾', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('house44', 'keep'); }, res: '你把阳台改成了一个小花园。' },
        { t: '再买一套出租', dev: 15, check: ['财富', 60],
          fx: (g) => { g.stat('财富', 6); g.remember('house44', 'second'); }, res: '租客是一对刚毕业的小夫妻。每月租金到账，你像看见了当年的自己。',
          fail: { fx: (g) => { g.stat('财富', -6); g.remember('house44', 'keep'); }, res: '首付差一截，你算了几个晚上，作罢了。', dev: 3 } },
        { t: '把房子过户给孩子', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 3); g.remember('house44', 'gift'); }, res: '过户那天，孩子还小，不明白这张纸是什么。你说，是你的家。' },
      ] },
    { id: 'm_45_checkup', age: 45, t: '体检报告', loc: 'hospital',
      text: (g) => '单位体检，报告上有一行加粗的字：' + CN.pick(['甲状腺结节，建议复查', '血压偏高', '血糖偏高', '脂肪肝，中度']) + '。' + (g.recall('body40') === 'run' ? '医生说幸亏你在运动，不然更糟。' : ''),
      choices: [
        { t: '开点药吃着', canon: true, fx: (g) => { g.stat('健康', 1); g.remember('check45', 'pills'); }, res: '药盒子摆在餐桌上，早一粒，晚一粒。' },
        { t: '彻底改作息', dev: 10, fx: (g) => { g.stat('健康', 6); g.stat('心情', -2); g.remember('check45', 'change'); }, res: '你戒了夜宵，十一点前睡觉。头一个月，你天天饿着入睡。' },
        { t: '不当回事', dev: 10, fx: (g) => { g.stat('健康', -4); g.remember('check45', 'ignore'); }, res: '你说谁还没点毛病。报告拍照存进相册，就再没点开过。' },
      ] },
    { id: 'm_46_house_echo', age: 46, t: '家', auto: true, cond: (g) => !!g.recall('house44'),
      fx: (g) => { const h = g.recall('house44'); if (h === 'second') g.stat('财富', 3); if (h === 'bought') g.stat('心情', -2); },
      text: (g) => ({
        county: '县城的房子大部分时间空着，你每年回去住几天，开窗、拖地、晒被子。',
        rent: '你又搬了一次家。家当越来越少，你说这样挺好。',
        bought: '每个月扣房贷的那天，你一整天都不想花钱。',
        pay: '房价又跌了一点。你已经不看了。',
        early: '提前还的那笔钱，让你每个月多出一点喘气的空间。',
        sold: '小房子收拾起来很快。你发现以前那么大的房子，一大半是用来放东西的。',
        keep: '阳台上的花开了一茬又一茬。',
        second: '出租的那套换了第三拨租客。房租不多，但按时到。',
        gift: '房产证上是孩子的名字。你觉得这件事，你办成了。',
      }[g.recall('house44')] || '') },
    { id: 'm_47_ai', age: 47, t: '又一波', loc: 'office', cond: (g) => !['none', 'farmer', 'retired'].includes(job(g)),
      text: '新闻上说，又一批岗位被机器人和 AI 接手了。你的工作也在名单的边上。',
      choices: [
        { t: '硬扛着，少拿点也干', canon: true, fx: (g) => { g.stat('财富', -3); g.stat('心情', -2); g.remember('ai47', 'hold'); }, res: '工资又少了一截。你学会了在每一笔开销前多想三秒。' },
        { t: '去学新东西', dev: 15, check: ['学识', 50],
          fx: (g) => { g.stat('事业', 6); g.stat('学识', 3); g.remember('ai47', 'learn'); }, res: '四十七岁，你和二十岁的人坐在一个培训班里。下课的时候，他们来问你题。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('ai47', 'hold'); }, res: '你听了几节课，跟不上，又回去守着原来的活。', dev: 3 } },
        { t: '不干了，提前退下来', dev: 20, fx: (g) => { CN.setJob(g, job(g), (JOBT[job(g)] || '原来的工作') + '（提前退下来）'); g.stat('心情', 4); g.stat('财富', -6); g.remember('ai47', 'out'); }, res: '你交了工牌。第二天早上，你不知道该干什么，就去菜市场转了一圈。' },
      ] },
    { id: 'm_47_land', age: 47, t: '地', cond: (g) => job(g) === 'farmer' || (job(g) === 'none' && g.recall('hukou') === 'rural'),
      text: '村里来了合作社，要把各家的地连成一大片，用无人机播种、收割。',
      choices: [
        { t: '把地流转出去，拿租金', canon: true, fx: (g) => { g.stat('财富', 3); g.stat('健康', 2); g.remember('land', 'rent'); }, res: '你家的地连同邻居的地，一起翻成了一大片。秋天，你在地头看机器收麦子。' },
        { t: '自己承包一大片', dev: 20, check: ['财富', 30],
          fx: (g) => { g.stat('财富', 8); g.stat('事业', 8); CN.setJob(g, 'farmer', '种粮大户'); g.remember('land', 'big'); }, res: '你贷款买了无人机，学会了看手机上的土壤数据。村里人叫你“大户”。',
          fail: { fx: (g) => { debt(g, 15); g.stat('心情', -4); g.remember('land', 'rent'); }, res: '头一年赶上天旱，亏了。你把地又转了出去。', dev: 5 } },
        { t: '去城里，帮着家里人', dev: 15, fx: (g) => { CN.goCity(g, 3); g.remember('land', 'city'); g.stat('人缘', 2); }, res: (g) => '你锁上院门，去了' + g.recall('workCity') + '。城里的楼太高，你好几天找不到回家的路。' },
      ] },
    { id: 'm_48_check_echo', age: 48, t: '复查', auto: true, loc: 'hospital', cond: (g) => !!g.recall('check45'),
      fx: (g) => { const c = g.recall('check45'); if (c === 'change') g.stat('健康', 3); if (c === 'ignore') g.stat('健康', -5); },
      text: (g) => ({
        pills: '复查结果没变好，也没变坏。医生说，按时吃药，别熬夜。',
        change: '复查的时候，医生翻着你三年前的报告，说你这几年做对了。',
        ignore: '你去年没复查，今年在单位晕了一回。医生看着你的片子，脸色不太好。',
      }[g.recall('check45')]) },
    { id: 'm_49_ai_echo', age: 49, t: '四十九', auto: true, cond: (g) => !!(g.recall('ai47') || g.recall('land')),
      fx: (g) => { if (g.recall('ai47') === 'learn') g.stat('事业', 3); if (g.recall('land') === 'big') g.stat('财富', 4); },
      text: (g) => {
        const a = g.recall('ai47');
        if (a === 'learn') return '学的那些新东西用上了。公司里的年轻人遇到难题，会说“问问老' + JY.byId[g.me].name[0] + '”。';
        if (a === 'out') return '提前退下来以后，你学会了做饭，学会了午睡，也学会了在别人上班的时候不心慌。';
        if (a === 'hold') return '你还在原来的岗位上。和你同期进来的人，只剩下两个。';
        const l = g.recall('land');
        if (l === 'big') return '你承包的地今年丰收。收购商的车排了半条村。';
        if (l === 'city') return '在城里住了两年，你在小区楼下的空地上偷偷种了几棵葱，被物业铲了。';
        return '地租每年准时打到卡上。你闲了，开始给村里修路的人送水。';
      } },

    /* ================= 50–64 岁 ================= */
    { id: 'm_51_parents', age: 51, t: '照顾了几年', cond: (g) => parentAlive(g) && !!g.recall('parentsCare'),
      text: (g) => {
        const p = g.recall('parentsCare');
        return (p === 'self' ? '爸妈和你住了几年。你的腰不好了，夜里也睡不整。' : p === 'nursing' ? '爸妈在养老院住了几年。每次你走，他们都送到门口。' : p === 'far' ? '隔着千里照看了几年，每次视频，爸妈都说好，挂了电话你总不放心。' : '兄弟姐妹照顾了这几年，最近在电话里说，有点撑不住了。') + '要不要换个法子？';
      },
      choices: [
        { t: '接着这样', canon: true, fx: (g) => { g.remember('care51', 'same'); g.stat('心情', -1); }, res: '你咬咬牙，说再坚持坚持。' },
        { t: '送去养老院', dev: 10, cond: (g) => g.recall('parentsCare') !== 'nursing', fx: (g) => { g.remember('parentsCare', 'nursing'); g.remember('care51', 'changed'); g.stat('财富', -6); g.stat('健康', 3); }, res: '你挑了一家近的。签合同的那天，你在车里坐了很久才开走。' },
        { t: '接回自己家', dev: 10, cond: (g) => g.recall('parentsCare') !== 'self', fx: (g) => { g.remember('parentsCare', 'self'); g.remember('care51', 'changed'); g.stat('人缘', 4); g.stat('健康', -3); }, res: '你把爸妈接回了家。第一顿饭，母亲非要下厨。' },
      ] },
    { id: 'm_51_house', age: 51, t: '老房子', cond: (g) => !parentAlive(g) && !g.recall('oldHouse'),
      text: '爸妈都不在了。老家的房子空着，钥匙在你手里。',
      choices: [
        { t: '留着，逢年过节回去看看', canon: true, fx: (g) => { g.remember('oldHouse', 'keep'); g.set('keptOldHouse'); g.stat('心情', 2); }, res: '你把爸妈的照片挂回了原来的位置。' },
        { t: '卖了', dev: 10, fx: (g) => { g.remember('oldHouse', 'sold'); g.stat('财富', 6); g.stat('心情', -3); }, res: '买家是个年轻人，说要改成民宿。你最后看了一眼门框上量身高的刻痕。' },
        { t: '让给兄弟姐妹', dev: 10, cond: (g) => (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('oldHouse', 'gave'); g.stat('人缘', 5); }, res: '你在协议上签了字。兄弟姐妹在饭桌上敬了你一杯。' },
      ] },
    { id: 'm_52_care_echo', age: 52, t: '爸妈', auto: true, cond: (g) => !!g.recall('parentsCare') && parentAlive(g),
      fx: (g) => { const p = g.recall('parentsCare'); if (p === 'self') g.stat('健康', -2); if (p === 'far') g.stat('心情', -2); },
      text: (g) => (g.recall('care51') === 'changed' ? '换了法子以后，' : '') + ({
        self: '和爸妈住在一起的日子，饭桌上多了两双筷子，也多了几次吵架。夜里起来给他们盖被子，你想起小时候他们也这样。',
        sibling: '兄弟姐妹打电话来，说爸妈想你了。你说下个月一定回去。',
        nursing: '养老院的护工跟你熟了，会把爸妈的事一件件讲给你听。爸妈慢慢也交了新朋友。',
        far: '摄像头里，爸妈对着镜头招手。他们知道你在看。',
      }[g.recall('parentsCare')] || '') },
    { id: 'm_53_money', age: 53, t: '攒下的钱', cond: (g) => g.s('财富') >= 25,
      text: '这些年总算攒下了一些。怎么用，你想了很久。',
      choices: [
        { t: '存着养老', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('nest', 'save'); }, res: '你把钱分成几份，存了定期。' },
        { t: '给孩子付首付', dev: 10, cond: (g) => hasKid(g) && kAge(g) >= 22, fx: (g) => { g.stat('财富', -15); g.stat('人缘', 4); g.remember('nest', 'kid'); }, res: (g) => kn(g) + '接过卡的时候没说话，抱了你一下。' },
        { t: '拿去投资', dev: 15, check: ['学识', 50],
          fx: (g) => { g.stat('财富', 10); g.remember('nest', 'invest'); }, res: '你看准了一次。账户上的数字翻了一番，你却比以前更睡不着了。',
          fail: { fx: (g) => { g.stat('财富', -12); g.stat('心情', -5); g.remember('nest', 'lost'); }, res: '一个“稳赚”的项目，老板跑了。你在维权群里待了半年。', dev: 5 } },
      ] },
    { id: 'm_54_nest_echo', age: 54, t: '钱', auto: true, cond: (g) => !!g.recall('nest'),
      text: (g) => ({
        save: '存折上的数字慢慢长。你算了算，大概够了。',
        kid: '孩子搬进了新房，给你留了一间。你去住了两天，就想回自己家。',
        invest: '赚了那一笔以后，你收手了。朋友再来拉你，你都推了。',
        lost: '那笔钱没追回来。你后来跟谁都说：“稳赚的事，别信。”',
      }[g.recall('nest')]) },
    { id: 'm_55_ill', age: 55, t: '病', loc: 'hospital', cond: (g) => g.s('健康') < 45,
      text: (g) => '一次检查，医生让家属单独进去。' + (g.recall('check45') === 'ignore' ? '十年前那张没当回事的报告，你又想起来了。' : '') + '是要动手术的病。',
      choices: [
        { t: '去大医院做手术', canon: true, check: ['健康', 0], // 健康 15 以上成功率 95%
          fx: (g) => { g.stat('健康', 15); g.stat('财富', -12); g.remember('ill55', 'surgery'); }, res: '手术做了七个小时。醒来的时候，家里人都在。',
          fail: { fx: (g) => { g.die('手术后没能醒过来'); }, res: '手术没能成功。', dev: 0 } },
        { t: '保守治疗，不开刀', dev: 15, fx: (g) => { g.stat('健康', -5); g.stat('心情', 2); g.remember('ill55', 'conservative'); }, res: '你选了吃药、调养。医生说，这样也有这样的活法。' },
        { t: '瞒着孩子，自己扛', dev: 15, cond: (g) => hasKid(g), fx: (g) => { g.stat('心情', -5); g.stat('健康', 4); g.remember('ill55', 'hide'); }, res: '你说出差几天，一个人住进了医院。护士问家属呢，你说在路上。' },
      ] },
    { id: 'm_55_hobby', age: 55, t: '第二春', cond: (g) => g.s('健康') >= 45,
      text: '孩子大了，工作也不用再拼了。有人劝你找点自己喜欢的事。',
      choices: [
        { t: '照旧，上班下班', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('hobby55', 'none'); }, res: '你说等退休了再说。' },
        { t: '学摄影、书法这类东西', dev: 10, fx: (g) => { g.stat('心情', 5); g.stat('学识', 2); g.remember('hobby55', 'art'); }, res: '你买了一台二手相机。周末一个人坐公交去郊外拍鸟。' },
        { t: '和老同学合伙做点小买卖', dev: 15, check: ['人缘', 50],
          fx: (g) => { g.stat('财富', 6); g.remember('hobby55', 'biz'); }, res: '你们在老同学的老家开了一家农家乐。周末客人不少。',
          fail: { fx: (g) => { g.stat('财富', -5); g.stat('人缘', -3); g.remember('hobby55', 'none'); }, res: '合伙没两个月就散了，你们也不怎么联系了。', dev: 3 } },
      ] },
    { id: 'm_57_echo', age: 57, t: '这两年', auto: true, cond: (g) => !!(g.recall('ill55') || g.recall('hobby55')),
      fx: (g) => { if (g.recall('hobby55') === 'art') g.stat('心情', 3); if (g.recall('ill55') === 'hide') g.stat('人缘', -2); },
      text: (g) => {
        const i = g.recall('ill55');
        if (i === 'surgery') return '手术两年了，复查都正常。你学会了慢慢吃饭，慢慢走路。';
        if (i === 'conservative') return '保守治疗的这两年，病没好，也没坏。你学会了和它一起过日子。';
        if (i === 'hide') return '孩子还是知道了。' + kn(g) + '在电话里哭着说：“你凭什么一个人扛？”你说不出话。';
        const h = g.recall('hobby55');
        if (h === 'art') return '你的照片被社区挑去办了个小展。你站在自己的照片前，假装是路过。';
        if (h === 'biz') return '农家乐的生意不错。老同学说，等干不动了就交给年轻人。';
        return '日子还是那样，按部就班。';
      } },
    { id: 'm_58_work', age: 58, t: '最后几年', cond: (g) => !['none', 'retired'].includes(job(g)),
      text: '离退休还有几年。年轻人都觉得你该歇着了，你自己也这么觉得，又不完全这么觉得。',
      choices: [
        { t: '熬到退休', canon: true, fx: (g) => { g.stat('事业', 2); g.remember('end58', 'stay'); }, res: '你把手头的活一件件交出去，教会了两个年轻人。' },
        { t: '换个轻松点的活', dev: 10, fx: (g) => { g.stat('健康', 3); g.stat('财富', -3); g.remember('end58', 'easy'); }, res: '你调去了不那么忙的岗位。下班的时候，天还亮着。' },
        { t: '再拼一把', dev: 15, check: ['健康', 50],
          fx: (g) => { g.stat('事业', 8); g.stat('财富', 5); g.remember('end58', 'push'); }, res: '你接下了一个大项目。项目做成那天，你说这是你最后一次熬夜。',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('end58', 'easy'); }, res: '项目做到一半，你住进了医院。出院以后，你什么都不争了。', dev: 5 } },
      ] },
    { id: 'm_58_home', age: 58, t: '家里的事', cond: (g) => ['none', 'retired'].includes(job(g)),
      text: '家里的大事小事，现在都来找你拿主意。',
      choices: [
        { t: '照旧管着这个家', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('end58', 'family'); }, res: '你的手机里存着全家人的体检时间、生日和医保卡号。' },
        { t: '放手，让自己清闲点', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('end58', 'free'); }, res: '你报了一个旅行团，第一次一个人出了远门。' },
      ] },
    { id: 'm_59_end_echo', age: 59, t: '五十九', auto: true, cond: (g) => !!g.recall('end58'),
      text: (g) => ({
        stay: '单位里开始有人叫你“老”什么。你带的两个年轻人，有一个已经能顶你的位置了。',
        easy: '轻松的岗位上，你开始学泡茶。办公室里的绿植是你在养。',
        push: '那个项目让你在行业里留了个名字。你却说，最得意的是那两年没错过一顿家里的晚饭。',
        family: '家里人说，有你在，家就乱不了。',
        free: '一个人出远门回来以后，你又去了两次。你说，这辈子到现在才知道自己喜欢看海。',
      }[g.recall('end58')]) },
    { id: 'm_60_plan', age: 60, t: '以后住哪儿', loc: 'home',
      text: (g) => '六十岁了。离退休还有五年，你开始想以后的日子在哪里过。' + (g.recall('kidCity') ? kn(g) + '在' + g.recall('kidCity') + '。' : ''),
      choices: [
        { t: '就在现在住的地方', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('plan60', 'stay'); }, res: '你熟悉这里的每一个菜摊。' },
        { t: '回老家，把老房子修一修', dev: 15, fx: (g) => { backHome(g); g.remember('house', 'hometown'); g.stat('财富', -5); g.stat('心情', 4); g.remember('plan60', 'home'); }, res: '你请人修了屋顶，在院子里搭了个葡萄架。' },
        { t: '搬去孩子的城市', dev: 10, cond: (g) => hasKid(g) && !!g.recall('kidCity') && g.recall('kidCity') !== '国外',
          fx: (g) => { CN.goCity(g, 2, g.recall('kidCity')); g.stat('人缘', 3); g.remember('plan60', 'kid'); }, res: (g) => '你在' + g.recall('kidCity') + '租了一套离孩子不远的房子，走路十五分钟。' },
      ] },
    { id: 'm_61_plan_echo', age: 61, t: '新的日子', auto: true, cond: (g) => !!g.recall('plan60'),
      text: (g) => ({
        stay: '你在老地方又过了一年。楼下的保安换了，新来的那个已经认得你了。',
        home: '回老家的第一年，你认出了小时候爬过的那棵树。它比你记得的矮。',
        kid: '你每周去孩子家两次，带一锅汤。孩子说，以后别带了，又说，下次多带一点。',
      }[g.recall('plan60')]) },
    { id: 'm_63_sib', age: 63, t: '兄弟姐妹', cond: (g) => (g.recall('sibs') || 0) > 0,
      text: '你的兄弟姐妹来电话，说病了，要一大笔钱治病。',
      choices: [
        { t: '借', canon: true, fx: (g) => { g.stat('财富', -8); g.stat('人缘', 5); g.remember('sibLoan', 'yes'); }, res: '你转了钱，说不用还。电话那头哭了。' },
        { t: '帮着找医院，钱借一半', dev: 10, fx: (g) => { g.stat('财富', -4); g.stat('人缘', 2); g.remember('sibLoan', 'help'); }, res: '你托人挂到了大医院的号。钱借了一半，另一半说再想办法。' },
        { t: '不借', dev: 15, fx: (g) => { g.stat('人缘', -6); g.remember('sibLoan', 'no'); }, res: '你说你自己也难。挂了电话，你一个人在阳台上站了很久。' },
      ] },
    { id: 'm_63_only', age: 63, t: '独生子女的晚年', cond: (g) => !(g.recall('sibs') > 0),
      text: '你没有兄弟姐妹。以后的事，你得早点自己打算。',
      choices: [
        { t: '交给孩子', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 2); g.remember('selfCare', 'kid'); }, res: '你把存折放在哪儿、密码是什么，都告诉了孩子。' },
        { t: '给自己买一份养老保险', dev: 10, fx: (g) => { g.stat('财富', -5); g.remember('selfCare', 'insure'); }, res: '合同很厚，你一页页看完了。' },
        { t: '和老朋友约好，互相照应', dev: 15, fx: (g) => { g.stat('人缘', 4); g.remember('selfCare', 'friends'); }, res: '你们几个老朋友拉了个群，叫“养老互助组”。每天早上，群里要有人说一声早。' },
      ] },
    { id: 'm_64_eve', age: 64, t: '退休前一年', auto: true,
      fx: (g) => {
        if (g.recall('sibLoan') === 'yes' || g.recall('selfCare') === 'friends') g.stat('心情', 2);
        if ((g.recall('debt') || 0) > 0) g.stat('心情', -2);
      },
      text: (g) => {
        const bits = [];
        const s = g.recall('sibLoan');
        if (s === 'yes') bits.push('兄弟姐妹的病好了，过年的时候，他们拎着两只鸡来看你。');
        if (s === 'no') bits.push('那次没借钱以后，兄弟姐妹的群里，你的消息很少有人回。');
        if (s === 'help') bits.push('兄弟姐妹的病治好了。剩下的钱，他们一点一点还给了你。');
        const c = g.recall('selfCare');
        if (c === 'friends') bits.push('“养老互助组”的群里，每天早上都有人说早。');
        if (c === 'insure') bits.push('保险的单子你锁在了抽屉里。');
        if ((g.recall('debt') || 0) > 0) bits.push('还有一些账没还清，你打算退休金下来慢慢还。');
        else bits.push('欠的账都还清了。你在日历上圈出了明年退休的那一天。');
        return bits.join('');
      } },
  ];

  /* ---------- 孩子、父母、配偶：按他们的年纪发生，用意外的形式（一世只发生一次） ---------- */
  const careChoices = [
    { t: '自己照顾，接来同住', canon: true, fx: (g) => { g.remember('parentsCare', 'self'); g.stat('人缘', 4); g.stat('健康', -3); }, res: '你把书房腾出来，装了扶手和夜灯。' },
    { t: '交给兄弟姐妹', dev: 10, cond: (g) => (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('parentsCare', 'sibling'); g.stat('财富', -4); }, res: '你每个月打钱回去，过节回家。' },
    { t: '送去养老院', dev: 15, fx: (g) => { g.remember('parentsCare', 'nursing'); g.stat('财富', -6); g.stat('心情', -3); }, res: '你挑了一家近的。临走，爸妈站在门口送你，像当年送你上学。' },
  ];
  const ENCS = [
    { id: 'e_m_kid_school', y: [2026, 2200], minAge: 30, maxAge: 64, t: '上学', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 6 && kAge(g) <= 8 && !g.recall('kidSchool') && quiet(g),
      text: (g) => kn(g) + '该上小学了。家门口的学校一般，好学校的学区房贵得吓人。',
      choices: [
        { t: '就近上公立', canon: true, fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', 1); }, res: '开学那天，你站在校门口，看' + '着那个小书包走进人群里。' },
        { t: '咬牙买学区房', dev: 15, check: ['财富', 50], cond: (g) => house(g) !== 'hometown',
          fx: (g) => { g.remember('kidSchool', 'district'); g.remember('house', 'mortgage'); debt(g, 80); g.stat('财富', -15); }, res: '老破小，四十平，价格是你家的两倍。你签字的手有点抖。',
          fail: { fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', -3); }, res: '差得太远了。孩子还是上了家门口的学校。', dev: 0 } },
        { t: '托人找关系，进一所好点的学校', dev: 10, check: ['人缘', 55],
          fx: (g) => { g.remember('kidSchool', 'good'); g.stat('财富', -3); }, res: '你请人吃了三顿饭，送了两次礼。开学那天，你看着那块校牌松了一口气。',
          fail: { fx: (g) => { g.remember('kidSchool', 'public'); g.stat('心情', -2); }, res: '托的人没办成。孩子还是上了家门口的学校。', dev: 0 } },
        { t: '送回老家，让爷爷奶奶带', dev: 15, cond: (g) => tier(g) <= 3 && parentAlive(g),
          fx: (g) => { g.remember('kidSchool', 'left'); g.stat('心情', -5); g.stat('财富', 3); }, res: (g) => '送走' + kn(g) + '那天，' + kHe(g) + '一直没哭。车开出好远，你才哭了。' },
      ] },
    { id: 'e_m_kid_push', y: [2026, 2200], minAge: 30, maxAge: 64, t: '补习班', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 10 && kAge(g) <= 12 && !g.recall('kidPush') && quiet(g),
      text: '家长群里每天都在晒补习班的课表。你家孩子周末还在楼下玩。',
      choices: [
        { t: '报几个班', canon: true, fx: (g) => { g.remember('kidPush', 'hard'); g.stat('财富', -5); }, res: '周末的日程排满了。你开车在几个机构之间来回接送。' },
        { t: '自己辅导', dev: 10, check: ['学识', 50],
          fx: (g) => { g.remember('kidPush', 'self'); g.stat('人缘', 3); }, res: '每天晚上一个钟头，你们趴在一张桌子上。孩子说你讲得比老师清楚。',
          fail: { fx: (g) => { g.remember('kidPush', 'hard'); g.stat('心情', -3); }, res: '你讲着讲着就急了。最后还是报了班。', dev: 0 } },
        { t: '不报，让孩子玩', dev: 15, fx: (g) => { g.remember('kidPush', 'easy'); g.stat('心情', 2); }, res: '孩子在楼下玩到天黑，你在阳台上喊回家吃饭。' },
      ] },
    { id: 'e_m_kid_teen', y: [2026, 2200], minAge: 30, maxAge: 64, t: '青春期', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 14 && kAge(g) <= 16 && !g.recall('kidBond') && quiet(g),
      text: (g) => kn(g) + '开始锁房门了。成绩掉了一截，手机不离手，跟你说话不超过三句。',
      choices: [
        { t: '管严一点', canon: true, fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -2); }, res: '你收了手机。门摔得很响。' },
        { t: '找个机会坐下来聊', dev: 10, check: ['人缘', 50],
          fx: (g) => { g.remember('kidBond', 'close'); g.stat('人缘', 4); }, res: '你们在夜宵摊坐了很久。' + '孩子说了一些你从来不知道的事。',
          fail: { fx: (g) => { g.remember('kidBond', 'strict'); g.stat('心情', -3); }, res: '你一开口就是说教。孩子低着头吃完，回了房间。', dev: 0 } },
        { t: '随他去，长大就好了', dev: 10, fx: (g) => { g.remember('kidBond', 'loose'); }, res: '你不再过问。有时候你也想，是不是该问一问。' },
      ] },
    { id: 'e_m_kid_gaokao', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子高考', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 18 && kAge(g) <= 20 && !g.recall('kidUni') && quiet(g),
      text: (g) => {
        // 文字每次渲染都会求值，分数只算一次
        if (!g.recall('kidScore')) g.remember('kidScore', kidResult(g));
        const r = g.recall('kidScore');
        return kn(g) + '高考的分数出来了：' + { top: '能上一所很好的大学。', good: '能上一所不错的本科。', normal: '能上一所普通的学校。', none: '离本科线差了一截。' }[r] + '填志愿的那几天，家里的灯亮到半夜。';
      },
      choices: [
        { t: '让孩子自己选', canon: true, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'own'); g.stat('人缘', 2); }, res: '孩子选了一个你没听说过的专业。你上网查了一晚上。' },
        { t: '替孩子选个稳当的', dev: 10, fx: (g) => { g.remember('kidUni', g.recall('kidScore') || 'normal'); g.remember('kidPath', 'stable'); g.stat('人缘', -2); }, res: '师范、医学、考公，你说了算。孩子没吭声，按了确认。' },
        { t: '孩子说不想读了，你随他', dev: 20, cond: (g) => g.recall('kidBond') === 'loose' || g.recall('kidScore') === 'none',
          fx: (g) => { g.remember('kidUni', 'none'); g.remember('kidPath', 'work'); }, res: '孩子跟着亲戚去学手艺了。走的那天说，不用你操心。' },
      ] },
    { id: 'e_m_kid_city', y: [2026, 2200], minAge: 30, maxAge: 64, t: '孩子留在哪儿', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 22 && kAge(g) <= 25 && !g.recall('kidCity') && quiet(g),
      text: (g) => kn(g) + (g.recall('kidPath') === 'work' ? '学成了手艺，' : '毕业了，') + '打电话问你：留在大城市，还是回来？',
      choices: [
        { t: '去大城市闯', canon: true, fx: (g) => { g.remember('kidCity', g.recall('kidUni') === 'top' ? CN.pick(['北京', '上海', '深圳']) : CN.pick(['杭州', '成都', '武汉', '南京', '广州', '西安'])); g.stat('心情', -1); }, res: (g) => kn(g) + '去了' + g.recall('kidCity') + '。你把' + kHe(g) + '的房间原样留着。' },
        { t: '劝回身边', dev: 10, fx: (g) => { g.remember('kidCity', where(g)); g.stat('人缘', 3); }, res: '孩子回来了，在本地找了份工作。周末回家吃饭，带着一身你不认识的香水味。' },
        { t: '出国', dev: 20, cond: (g) => g.s('财富') >= 60 || g.recall('kidUni') === 'top', fx: (g) => { g.remember('kidCity', '国外'); g.stat('财富', -8); g.stat('心情', -3); }, res: '机场送别。孩子过了安检，回头挥了挥手。时差八个钟头。' },
      ] },
    { id: 'e_m_kid_wed', y: [2026, 2200], minAge: 40, maxAge: 64, t: '孩子成家', always: true,
      cond: (g) => hasKid(g) && kAge(g) >= 27 && kAge(g) <= 33 && !g.recall('kidWed') && quiet(g),
      text: (g) => kn(g) + '带了一个人回家吃饭。饭后，' + kHe(g) + '说想结婚了，只是房子、彩礼、酒席，样样要钱。',
      choices: [
        { t: '掏积蓄帮着办', canon: true, fx: (g) => { g.stat('财富', -15); g.stat('人缘', 3); g.remember('kidWed', 'paid'); }, res: '酒席上，你喝多了，拉着亲家说了很多年轻时候的事。' },
        { t: '让他们自己来，你只出个心意', dev: 15, fx: (g) => { g.stat('财富', -3); g.remember('kidWed', 'self'); }, res: '婚礼很简单，在一家小饭馆。新人敬酒的时候，笑得很真。' },
        { t: '孩子说不想办婚礼，你也依了', dev: 15, fx: (g) => { g.remember('kidWed', 'none'); g.stat('心情', -1); }, res: '他们领了证，发了一张合照到家族群里。你看了好几遍。' },
      ] },
    { id: 'e_m_kid_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子', auto: true, always: true,
      cond: (g) => !!g.recall('kidBond') && g.since('kidBond') >= 3 && hasKid(g),
      fx: (g) => { const b = g.recall('kidBond'); if (b === 'close') g.stat('心情', 3); if (b === 'strict') g.stat('人缘', -2); },
      text: (g) => {
        const b = g.recall('kidBond');
        const s = g.recall('kidSchool');
        const pre = s === 'left' ? '接回城里以后，孩子跟你一直隔着一层。' : s === 'district' ? '学区房的贷款还在还，孩子的学校倒是真的好。' : '';
        return pre + (b === 'close' ? '那次长谈以后，孩子有事会先来问你。' : b === 'strict' ? '孩子长大了，跟你说话还是客客气气的，像跟老师。' : '孩子自己长大了，长成了你不太认得、又有点佩服的样子。');
      } },
    { id: 'e_m_kid_uni_echo', y: [2026, 2200], minAge: 35, maxAge: 64, t: '孩子的路', auto: true, always: true,
      cond: (g) => !!g.recall('kidPath') && g.since('kidPath') >= 3 && hasKid(g),
      text: (g) => {
        const p = g.recall('kidPath'), u = g.recall('kidUni');
        if (p === 'work') return '孩子学的手艺有了用处，自己开了个小工作室。逢人问起，你说：“孩子自己闯出来的。”';
        if (p === 'stable') return (u === 'top' || u === 'good' ? '孩子按你选的路读完了书，工作很稳。' : '孩子读完书，考了好几年才考上编。') + '有一次喝了酒，孩子说那年要是自己选就好了。';
        return u === 'top' ? '孩子读的那所好大学，成了你在亲戚面前少有的话题。' : '孩子自己选的专业，后来竟然真的找到了对口的工作。';
      } },
    { id: 'e_m_parent_ill', y: [2026, 2200], minAge: 35, maxAge: 50, t: '爸妈病了', loc: 'hospital', always: true,
      cond: (g) => parentAlive(g) && parentOld(g) >= 70 && !g.recall('parentsCare') && quiet(g),
      text: (g) => (JY.byId.mo && g.alive('mo') ? '母亲' : '父亲') + '住院了。出院以后，医生说身边不能离人。',
      choices: careChoices },
    { id: 'e_m_fa_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '父亲走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.fa && deadThisYear(g, 'fa'),
      fx: (g) => { g.stat('心情', -6); g.remember('lostFa', true); },
      text: (g) => {
        const p = g.recall('parentsCare');
        return p === 'self' ? '父亲是在你家里走的，走之前喊了你的小名。' : p === 'nursing' ? '养老院半夜来了电话。你赶到的时候，护工说他走得很安静。' : p === 'far' ? '你连夜赶回老家，还是晚了一步。摄像头里，最后一段录像是他在看电视。' : '父亲走了。你在灵堂守了三夜，把他这辈子的事想了一遍。';
      } },
    { id: 'e_m_mo_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '母亲走了', auto: true, always: true, kind: 'death',
      cond: (g) => !!JY.byId.mo && deadThisYear(g, 'mo'),
      fx: (g) => { g.stat('心情', -7); },
      text: (g) => (g.recall('lostFa') ? '母亲也走了。从此你就没有爸妈了。' : '母亲走了。') + (g.recall('parentsCare') === 'self' ? '她的那双拖鞋，你很久都没收起来。' : '收拾遗物的时候，你找到一个铁盒子，里面是你小时候的奖状。') },
    { id: 'e_m_oldhouse', y: [2026, 2200], minAge: 35, maxAge: 64, t: '老房子', always: true,
      cond: (g) => !!JY.byId.fa && !parentAlive(g) && !g.recall('oldHouse') && quiet(g),
      text: '爸妈都不在了。老家的房子空着，钥匙在你手里。',
      choices: [
        { t: '留着，逢年过节回去看看', canon: true, fx: (g) => { g.remember('oldHouse', 'keep'); g.set('keptOldHouse'); }, res: '你把爸妈的照片挂回了原来的位置。' },
        { t: '卖了', dev: 10, fx: (g) => { g.remember('oldHouse', 'sold'); g.stat('财富', 6); g.stat('心情', -3); }, res: '你最后看了一眼门框上量身高的刻痕。' },
        { t: '让给兄弟姐妹', dev: 10, cond: (g) => (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('oldHouse', 'gave'); g.stat('人缘', 5); }, res: '兄弟姐妹在饭桌上敬了你一杯。' },
      ] },
    { id: 'e_m_oldhouse_echo', y: [2026, 2200], minAge: 36, maxAge: 64, t: '老家', auto: true, always: true,
      cond: (g) => !!g.recall('oldHouse') && g.since('oldHouse') >= 3,
      text: (g) => (g.f('keptOldHouse') && g.recall('oldHouse') === 'keep' ? '清明回老家，你推开那扇门，灰尘在光里飘。邻居说，你家门口那棵树又粗了一圈。' : g.recall('oldHouse') === 'sold' ? '你路过老家，那房子改成了民宿，门口挂着灯笼。你没进去。' : '兄弟姐妹把老房子翻新了。你回去住了一晚，睡的还是小时候那张床。') },
    { id: 'e_m_sp_ill', y: [2026, 2200], minAge: 50, maxAge: 64, t: '另一半病了', loc: 'hospital', always: true,
      cond: (g) => married(g) && !g.recall('spSick') && yearRoll(g, 7) < 0.05 && quiet(g),
      text: (g) => spName(g) + '查出了大病。医生说，能治，就是费钱、费人。',
      choices: [
        { t: '倾尽所有去治', canon: true, fx: (g) => { g.stat('财富', -15); g.stat('健康', -3); g.remember('spSick', 'all'); }, res: '你卖了车，跑遍了能跑的医院。' },
        { t: '一边上班一边陪护', dev: 10, fx: (g) => { g.stat('健康', -5); g.stat('财富', -6); g.remember('spSick', 'both'); }, res: '白天上班，晚上睡在病床边的折叠椅上。' },
        { t: '请护工和陪护机器人', dev: 15, check: ['财富', 45], fx: (g) => { g.stat('财富', -10); g.remember('spSick', 'paid'); }, res: '你每天下班去医院坐两个钟头，陪着说话。',
          fail: { fx: (g) => { g.stat('健康', -5); g.remember('spSick', 'both'); }, res: '你问了价钱，回来自己挽起了袖子。', dev: 0 } },
      ] },
    { id: 'e_m_sp_ill_echo', y: [2026, 2200], minAge: 51, maxAge: 64, t: '病床边', auto: true, always: true,
      cond: (g) => !!g.recall('spSick') && g.since('spSick') >= 1,
      fx: (g) => { if (married(g) && g.rnd() < (g.recall('spSick') === 'all' ? 0.2 : 0.35)) g.kill('sp', '病逝', true); },
      text: (g) => (married(g) ? spName(g) + '熬过来了。出院那天，你们在医院门口拍了一张照片，两个人都瘦了一圈。' : '你尽了力。' + spName(g) + '还是走了。') },
    { id: 'e_m_sp_gone', y: [2026, 2200], minAge: 30, maxAge: 64, t: '一个人了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '丧偶'); g.stat('心情', -10); },
      text: (g) => spName(g) + '走了。' + (g.recall('marriage') === 'mended' ? '那次长谈以后的十几年，是你们最好的日子。' : g.recall('marriage') === 'cold' ? '你们冷了那么多年，到最后才又说了很多话。' : '家里的另一半东西，你一样也没舍得扔。') },
  ];

  // 抉择节点登记到 DEC，供 quiet() 判断这一年是否已经有中年的抉择
  NODES.forEach((n) => { if (!n.auto) DEC.push(n); });
  JY.addLifeNodes(NODES);
  JY.addEncounters(ENCS);

  /* 新增的状态键名（中年，写进这一世的记忆）：
   * care51 'same'|'changed'
   * crisis 'stay'|'small'|'shop'|'home'|'idle'；stableRoute 'steady'|'lead'|'lost'|'quit'；laborRoute 'grind'|'skill'|'home'
   * ownRoute 'steady'|'grow'|'debt'|'quit'；noneRoute 'work'|'home'|'craft'；career42；marriage 'cold'|'mended'|'split'；custody 'me'|'ex'
   * lateMarry 'match'|'alone'|'love'；nokid 'ivf'|'failed'|'dink'|'adopt'；body40 'ignore'|'run'|'car'；house44；check45 'pills'|'change'|'ignore'
   * ai47 'hold'|'learn'|'out'；land 'rent'|'big'|'city'；oldHouse 'keep'|'sold'|'gave'；nest 'save'|'kid'|'invest'|'lost'
   * ill55 'surgery'|'conservative'|'hide'；hobby55 'none'|'art'|'biz'；end58 'stay'|'easy'|'push'|'family'|'free'；plan60 'stay'|'home'|'kid'
   * sibLoan 'yes'|'help'|'no'；selfCare 'kid'|'insure'|'friends'；lostFa；spSick 'all'|'both'|'paid'
   * 孩子：kidSchool 'public'|'district'|'good'|'left'；kidPush 'hard'|'self'|'easy'；kidBond 'strict'|'close'|'loose'
   *       kidScore/kidUni 'top'|'good'|'normal'|'none'；kidPath 'own'|'stable'|'work'；kidCity 城市名或 '国外'（老年部分读）；kidWed 'paid'|'self'|'none'
   */
})();

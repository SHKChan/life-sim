/* 十四亿分之一 · 老年：65 岁到离世
 * 退休和退休金、住哪里、带孙辈、老伴、爱好、慢性病、养老、遗嘱、临终安排、回望。
 * 读前面各阶段留下的状态（job、edu、house、love、kids、workCity……），缺了就按兜底的写法。
 * 新增的状态键名见文件末尾的说明，也写进了 docs/SPEC.md 的表（由协调者合并）。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const FORMAL = ['civil', 'teacher', 'doctor', 'nurse', 'soldier', 'office', 'tech', 'sales', 'worker', 'driver'];
  const kidsN = (g) => g.recall('kids') || 0;
  const hasKid = (g) => kidsN(g) > 0 && g.alive('k1');
  const hasSp = (g) => !!JY.byId.sp && g.alive('sp');
  const spName = (g) => (JY.byId.sp ? g.name('sp') : '老伴');
  const kidName = (g) => (JY.byId.k1 ? g.name('k1') : '孩子');
  const isMale = (g) => CN.sexOf(g) === '男';
  // 现在住哪儿，场景跟着走
  const stayHome = (g) => {
    const lw = g.recall('liveWith');
    if (lw === 'hometown') CN.goHome(g);
    else if (lw === 'nursing') g.move('home', '养老院');
    else if (lw === 'kids') g.move('home', (g.recall('kidCity') || '孩子那边') + ' · 孩子家');
    else if ((g.recall('tier') || 5) >= 5 && !g.recall('workCity')) CN.goHome(g);
    else g.move('home', g.recall('workCity') || g.recall('homeCap') || '家');
  };
  // 生一个孙辈：id gk1、gk2；儿子的孩子叫孙子孙女，女儿的孩子叫外孙外孙女
  const addGrandkid = (g, kidId) => {
    const kid = JY.byId[kidId];
    if (!kid) return null;
    const n = (g.recall('grandkids') || 0) + 1;
    const fromSon = kid.sex === '男';
    const gk = CN.person({ id: 'gk' + n, born: g.Y, surname: fromSon ? kid.name[0] : undefined, origin: kid.name + '的孩子' });
    g.spawn(gk);
    const label = (fromSon ? '' : '外') + (gk.sex === '男' ? '孙子' : '孙女');
    g.rel(n === 1 ? label : '小' + label, gk.id, kid.name + '的孩子');
    g.remember('grandkids', n);
    return gk;
  };

  JY.addFlags({
    donatedHouse: '把房子捐给了老家的学校，后来那里多了一间图书室',
    oldStoryteller: '晚年给村里的孩子讲了很多年的老故事',
  });

  JY.addLifeNodes([
    /* ================= 65 岁：退休 ================= */
    { id: 'o_pension', age: 65, t: '退休', auto: true,
      fx: (g) => {
        const job = g.recall('job') || 'none';
        g.remember('preJob', job);
        let p;
        if (['civil', 'teacher', 'doctor', 'nurse', 'soldier'].includes(job)) p = 'high';
        else if (['office', 'tech', 'sales', 'worker', 'driver'].includes(job)) p = 'mid';
        else if (job === 'boss' && g.s('财富') >= 60) p = 'savings';
        else if (job === 'none' || job === 'retired') p = g.recall('hukou') === 'rural' ? 'low' : 'mid';
        else p = 'low';
        g.remember('pension', p);
        g.remember('retired', true);
        CN.setJob(g, 'retired', '退休');
        g.info('退休金', { high: '稳当', mid: '够用', low: '微薄', savings: '靠积蓄' }[p]);
        if (p === 'high') g.stat('财富', 4);
        if (p === 'low') g.stat('心情', -2);
      },
      text: (g) => {
        const p = g.recall('pension');
        if (p === 'high') return '六十五岁，你办了退休手续。单位给你开了个小会，送了一束花。退休金每月按时到账，够花，还能贴补孩子。';
        if (p === 'mid') return '六十五岁，你领到了第一笔养老金。数目不多不少，房贷要是还完了，日子过得去。';
        if (p === 'savings') return '六十五岁，没有谁给你办退休。你自己给自己放了个假，看了看账户上的数字，觉得够了。';
        return '六十五岁，你领到了第一笔养老金，数目很小，买菜够，看病不够。你没觉得自己退休了，只是老了。';
      } },
    { id: 'o_after_retire', age: 65, t: '退休以后', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')),
      text: '交完工牌的第二天，你还是六点就醒了。原单位打电话来，问你愿不愿意返聘回去，带带新人。',
      choices: [
        { t: '彻底歇下来', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('afterRetire', 'rest'); }, res: '你挂了电话，去菜市场转了一圈。原来上午的菜这么新鲜。' },
        { t: '返聘回去，再干几年', dev: 15, fx: (g) => { g.stat('财富', 5); g.stat('健康', -2); g.remember('afterRetire', 'rehire'); g.info('职业', '退休返聘'); }, res: '你又有了工牌，只是上面多了“顾问”两个字。年轻人叫你老师。' },
        { t: '去学一样年轻时没空学的东西', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: '你报了老年大学。开学那天，你比谁到得都早。' },
      ] },
    { id: 'o_keep_working', age: 65, t: '还干不干', loc: 'home',
      cond: (g) => !FORMAL.includes(g.recall('preJob')),
      text: (g) => {
        const j = g.recall('preJob');
        if (j === 'farmer') return '地还在那儿，你的腰一年比一年弯。村里年轻人都走了，地租出去也没几个钱。';
        if (j === 'shop' || j === 'boss') return '店里的事，你一天不在就有人打电话问。孩子们说你该歇歇了。';
        if (j === 'rider' || j === 'driver' || j === 'creator' || j === 'freelance') return '没有单位给你办退休。你的手机里还开着接单的软件，单子越来越少。';
        return '你到了这个岁数，身边的人都说该享福了。可是每个月的钱，算来算去总差一点。';
      },
      choices: [
        { t: '接着干，干不动再说', canon: true, fx: (g) => { g.stat('财富', 4); g.stat('健康', -3); g.remember('afterRetire', 'work'); }, res: '你照旧早出晚归。有人说你闲不住，你说是闲不起。' },
        { t: (g) => (kidsN(g) > 0 ? '交给孩子，自己退到后面' : '把活儿盘出去，换一笔钱'), fx: (g) => { g.stat('心情', 3); g.remember('afterRetire', 'handover'); }, dev: 10, res: (g) => (kidsN(g) > 0 ? '交接那天你说了很多，孩子听了一半。你也就不说了。' : '钱不多，你存进了银行，每个月取一点。') },
        { t: '彻底歇了，紧着过', dev: 15, fx: (g) => { g.stat('财富', -3); g.stat('心情', 2); g.remember('afterRetire', 'rest'); }, res: '你把闹钟关了。省一点，日子也过得下去。' },
      ] },

    /* ================= 66 岁：住哪儿 ================= */
    { id: 'o_first_morning', age: 66, t: '不用上班的早上', auto: true,
      fx: (g) => { if (g.recall('afterRetire') === 'work') g.stat('健康', -1); else g.stat('心情', 2); },
      text: (g) => {
        const a = g.recall('afterRetire');
        if (a === 'rehire') return '返聘的这一年，你发现自己说的话年轻人不太听了。你开始提前一站下车，走一段路回家。';
        if (a === 'learn') return '老年大学的课表贴在冰箱上。你第一次觉得一周七天不够用。';
        if (a === 'work') return '六十六岁，你还在干活。有天收工，你坐在台阶上歇了很久，才站起来。';
        if (a === 'handover') return '交出去以后，你每天去转一圈，看一眼就走。后来隔一天去一次。';
        return '你学会了睡懒觉。早上的阳光照到床上，你才想起来今天不用去任何地方。';
      } },
    { id: 'o_gk_born', age: 66, t: '当了长辈', auto: true,
      cond: (g) => hasKid(g) && g.ageOf('k1') >= 24 && !g.recall('grandkids'),
      fx: (g) => { if (g.rnd() < 0.75) { addGrandkid(g, 'k1'); g.stat('心情', 6); } else g.remember('grandkids', 0); },
      text: (g) => (g.recall('grandkids') ? kidName(g) + '有孩子了。你在医院走廊里等了一夜，抱着那个小东西的时候，手直抖。' : kidName(g) + '说暂时不打算要孩子。你张了张嘴，没说什么。') },
    { id: 'o_where', age: 66, t: '去孩子那边吗', loc: 'home',
      cond: (g) => hasKid(g),
      text: (g) => kidName(g) + '打电话来，说城里的房子有空房间，' + (g.recall('grandkids') ? '孩子也没人带，' : '') + '让你过去一起住。',
      choices: [
        { t: '收拾东西，搬过去', canon: true,
          fx: (g) => { const city = g.recall('workCity') && g.rnd() < 0.5 ? g.recall('workCity') : CN.pick(['北京', '上海', '深圳', '杭州', '成都', '武汉', '南京', '西安']); g.remember('kidCity', city); g.remember('liveWith', 'kids'); g.info('住处', city + '，和孩子一起'); g.stat('人缘', 3); g.stat('心情', -1); stayHome(g); },
          res: '你带了两箱衣服，一袋老家的米。新家很干净，你一时不知道该把手放哪儿。' },
        { t: '不去，留在自己家', dev: 10, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 2); }, res: '你说你住惯了。挂了电话，屋里很安静。' },
        { t: '谁也不跟，回老家去', dev: 20, fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家的房子落满了灰。你扫了一整天，夜里听见了几十年没听过的虫叫。' },
      ] },
    { id: 'o_where_nokid', age: 66, t: '往后住哪儿', loc: 'home',
      cond: (g) => !hasKid(g),
      text: (g) => (hasSp(g) ? '没有孩子在身边，你和' + spName(g) + '商量往后怎么过。' : '你一个人住了好些年。社区来登记独居老人，问你往后有什么打算。'),
      choices: [
        { t: '就在这儿，照常过', canon: true, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 1); }, res: '你在门口装了一个能报警的门铃，别的照旧。' },
        { t: '回老家去', dev: 15, fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家还有几个老邻居。他们记得你小时候的外号。' },
        { t: '住进养老社区', dev: 20, check: ['财富', 50],
          fx: (g) => { g.remember('liveWith', 'nursing'); g.info('住处', '养老社区'); stayHome(g); g.stat('健康', 2); }, res: '社区里有食堂、有医生，楼下有一群人等你打牌。',
          fail: { fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', -2); }, res: '你去看了一圈，价目表看得你直摇头。还是住在原来的地方。', dev: 0 } },
      ] },

    /* ================= 67 岁：孙辈或者别的牵挂 ================= */
    { id: 'o_grandcare', age: 67, t: '带孩子', loc: 'home',
      cond: (g) => (g.recall('grandkids') || 0) >= 1,
      text: (g) => '孙辈' + (JY.byId.gk1 ? g.name('gk1') : '') + '一岁了，' + (g.recall('liveWith') === 'kids' ? '就睡在你隔壁屋。' : '父母上班都忙。') + '谁来带，成了家里的大事。',
      choices: [
        { t: '我来带，全天', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('人缘', 4); g.remember('gkCare', 'full'); }, res: '你又学了一遍换尿布、冲奶粉。只是腰比当年硬多了。' },
        { t: '白天帮着接送，晚上还给他们', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('gkCare', 'part'); }, res: '你每天按点出门，按点回家。中间那几个小时是你自己的。' },
        { t: '不带，各过各的', dev: 25, fx: (g) => { g.stat('心情', 3); g.stat('人缘', -3); g.remember('gkCare', 'none'); }, res: '你把话说在前头。家里冷了一阵，后来请了阿姨。' },
      ] },
    { id: 'o_pet', age: 67, t: '养点什么', loc: 'home',
      cond: (g) => !((g.recall('grandkids') || 0) >= 1),
      text: '屋子太安静。楼下的老邻居说，养点活物，日子就有了响动。',
      choices: [
        { t: '种一阳台的花', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('pet', 'plants'); }, res: '你买了十几个花盆。第一个月死了一半。' },
        { t: '养一条狗', dev: 10, fx: (g) => { g.stat('健康', 2); g.stat('心情', 3); g.remember('pet', 'dog'); }, res: '它每天早上六点叫你起来遛它。你没法再睡懒觉了。' },
        { t: '什么也不养，清净', dev: 10, fx: (g) => { g.remember('pet', 'none'); g.stat('心情', -1); }, res: '你说不想再操心任何东西。' },
      ] },

    /* ================= 68 岁：爱好 ================= */
    { id: 'o_hobby', age: 68, t: '找点事做',
      cond: (g) => g.recall('afterRetire') !== 'learn',
      text: '傍晚的广场上放着音乐，公园里有人下棋，社区门口贴着老年大学招生的海报。',
      choices: [
        { t: '跟着跳广场舞', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('人缘', 3); g.remember('hobby', 'dance'); }, res: '你站在最后一排，跟错了好几拍。第三天，领舞的大姐给你留了个位置。' },
        { t: '报老年大学', dev: 10, fx: (g) => { g.stat('学识', 3); g.remember('hobby', 'college'); }, res: '你选了书法。毛笔握在手里，比想象的重。' },
        { t: '跟团出去旅游', dev: 15, check: ['财富', 35], fx: (g) => { g.stat('心情', 5); g.remember('hobby', 'travel'); g.move('coast', '海边 · 旅游团'); }, res: '你第一次看见海。导游催了三次，你才回车上。',
          fail: { fx: (g) => { g.remember('hobby', 'screen'); }, res: '报名费不便宜。你把宣传单折起来，夹进了日历里。', dev: 0 } },
        { t: '在家看看短视频', dev: 5, fx: (g) => { g.stat('心情', 1); g.stat('健康', -1); g.remember('hobby', 'screen'); }, res: '一刷就是一下午。有的视频你点了好几遍赞。' },
      ] },
    { id: 'o_learn_what', age: 68, t: '老年大学',
      cond: (g) => g.recall('afterRetire') === 'learn',
      text: '老年大学第二年，可以选专业课了。',
      choices: [
        { t: '书法国画', canon: true, fx: (g) => { g.stat('心情', 3); g.remember('learnWhat', 'art'); }, res: '你临了一年帖，字慢慢有了样子。' },
        { t: '学编程，跟机器人说话', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('learnWhat', 'code'); }, res: '班上年纪最大的是你。你让家里的机器人学会了用方言叫你吃饭。' },
        { t: '学一样乐器', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('learnWhat', 'music'); }, res: '你挑了二胡。邻居们有一个月没睡好。' },
      ] },

    /* ================= 69 岁：体检 ================= */
    { id: 'o_checkup', age: 69, t: '体检报告', loc: 'hospital',
      text: (g) => (g.s('健康') >= 60 ? '体检报告上，三个箭头朝上：血压、血糖、血脂。医生说不算严重，得管。' : '体检报告翻了三页才翻完。医生指着几行字，说你这身体，得好好养着了。'),
      choices: [
        { t: '按时吃药，管住嘴', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('心情', -1); g.remember('chronic', 'control'); stayHome(g); }, res: '你买了一个分七格的药盒，周日晚上把一周的药分好。' },
        { t: '戴上健康手环，让 AI 管着', dev: 10, fx: (g) => { g.stat('健康', 2); g.stat('财富', -2); g.remember('chronic', 'ai'); stayHome(g); }, res: '手环一到饭点就提醒你少吃一口。你骂了它几回，它照样提醒。' },
        { t: '不当回事，该吃吃该喝喝', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('chronic', 'ignore'); stayHome(g); }, res: '你说活到这个岁数，想吃点什么还要看指标，那多没意思。' },
      ] },

    /* ================= 70 岁 ================= */
    { id: 'o_seventy', age: 70, t: '七十大寿', auto: true,
      fx: (g) => { stayHome(g); g.stat('心情', 2); },
      text: (g) => {
        const bits = [];
        if (hasSp(g)) bits.push(spName(g) + '给你煮了一碗长寿面');
        if (g.recall('grandkids')) bits.push('孙辈在视频里给你唱了生日歌');
        else if (hasKid(g)) bits.push(kidName(g) + '订了一个蛋糕');
        if (g.recall('liveWith') === 'nursing') bits.push('养老社区给这个月过生日的人一起办了一场');
        if (!bits.length) bits.push('你给自己买了一块小蛋糕，插了一根蜡烛');
        return '七十岁生日。' + bits.join('，') + '。';
      } },

    /* ================= 71 岁：老伴生病，或者老朋友 ================= */
    { id: 'o_sp_sick', age: 71, t: '老伴病了', loc: 'hospital',
      cond: (g) => hasSp(g),
      text: (g) => spName(g) + '半夜起来上厕所，摔在了卫生间。查出来是轻度中风，往后要人照顾。',
      choices: [
        { t: '我自己伺候', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('人缘', 3); g.remember('spCare', 'self'); stayHome(g); }, res: '你学会了翻身、擦洗、喂饭。夜里每隔两小时醒一次，成了习惯。' },
        { t: '请护工或者陪护机器人', dev: 10, check: ['财富', 40],
          fx: (g) => { g.stat('心情', 1); g.remember('spCare', 'paid'); stayHome(g); }, res: '陪护机器人比你力气大，也不嫌烦。你负责陪' + '着说话。',
          fail: { fx: (g) => { g.stat('健康', -4); g.remember('spCare', 'self'); stayHome(g); }, res: '你问了价钱，回来自己挽起了袖子。', dev: 0 } },
        { t: '打电话叫孩子回来', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', -1); g.remember('spCare', 'kids'); stayHome(g); }, res: kidName + '请了长假回来。一个月后，又回去上班了。' },
      ] },
    { id: 'o_old_friend', age: 71, t: '同学聚会',
      cond: (g) => !hasSp(g),
      text: '中学同学群里有人张罗聚会，说再不聚，就凑不齐了。',
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('reunion', 'went'); }, res: '一桌人，你认出了一半。说起当年的老师，大家都笑了。' },
        { t: '不去', dev: 10, fx: (g) => { g.remember('reunion', 'no'); }, res: '你在群里发了个红包，说身体不方便。' },
      ] },
    { id: 'o_spcare_echo', age: 73, t: '病床边', auto: true,
      cond: (g) => !!g.recall('spCare'),
      fx: (g) => { if (g.recall('spCare') === 'self') g.stat('健康', -2); },
      text: (g) => {
        const c = g.recall('spCare');
        const alive = hasSp(g);
        if (c === 'self') return alive ? '你伺候' + spName(g) + '两年了。有天你喂完饭，' + spName(g) + '拉着你的手说，辛苦你了。这是两年里说得最清楚的一句话。' : '你伺候了一场，人还是走了。你把那个七格药盒收进了抽屉。';
        if (c === 'paid') return alive ? '陪护机器人记住了' + spName(g) + '爱听的戏。你们俩靠在床头听，一听一下午。' : '机器人被收回去那天，你在门口站了很久。';
        return kidName(g) + '每个周末都打视频回来，问爸妈今天怎么样。你总说挺好。';
      } },
    { id: 'o_reunion_echo', age: 73, t: '同学', auto: true,
      cond: (g) => !!g.recall('reunion'),
      text: (g) => (g.recall('reunion') === 'went' ? '聚会以后，群里热闹了一阵。今年冬天，群里又少了两个头像。' : '你没去的那次聚会，是最后一次。后来再没人张罗。') },

    /* ================= 72 岁 ================= */
    { id: 'o_robot_era', age: 72, t: '家里的机器人', auto: true,
      fx: (g) => { if (g.s('财富') >= 45) g.stat('健康', 2); },
      text: (g) => (g.s('财富') >= 45 ? '家里添了一台陪护机器人，会做饭、会扶你起床、会在你忘了吃药时念叨。你给它起了个小名。' : '社区给独居和高龄老人配了一台公用的陪护机器人，一个星期来你家两次。它每次走的时候都说：“下周见。”') },
    { id: 'o_pet_echo', age: 72, t: '活物', auto: true,
      cond: (g) => !!g.recall('pet'),
      fx: (g) => { if (g.recall('pet') === 'dog') g.stat('健康', 2); },
      text: (g) => {
        const p = g.recall('pet');
        if (p === 'dog') return '那条狗老了，你也老了。你们遛弯的速度刚好一样。';
        if (p === 'plants') return '阳台上的花活下来的那一半，今年开得特别好。楼下的人抬头看，问你怎么养的。';
        return '你说不养东西清净。可是有天下午，你对着窗台说了半天话。';
      } },
    { id: 'o_gk2', age: 72, t: '又一个孙辈', auto: true,
      cond: (g) => kidsN(g) >= 2 && g.alive('k2') && g.ageOf('k2') >= 25 && (g.recall('grandkids') || 0) < 2,
      fx: (g) => { if (g.rnd() < 0.6) { addGrandkid(g, 'k2'); g.stat('心情', 4); } },
      text: (g) => (g.recall('grandkids') >= 2 ? g.name('k2') + '也有孩子了。全家第一次凑齐拍了张合影，你坐在正中间。' : g.name('k2') + '还没成家。你说不急，心里有点急。') },

    /* ================= 73 岁：骗子 ================= */
    { id: 'o_scam', age: 73, t: '一通电话',
      text: '电话那头的人很热情，叫你“叔叔阿姨”，说有个讲座免费送鸡蛋，还能领一台按摩椅。',
      choices: [
        { t: '挂掉，告诉孩子', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: '孩子在电话里夸了你。你有点得意。' },
        { t: '去领鸡蛋，别的不买', dev: 10, check: ['学识', 45], fx: (g) => { g.stat('心情', 2); g.remember('scam', 'eggs'); }, res: '你领了两盒鸡蛋，讲座讲到一半你就走了。',
          fail: { fx: (g) => { g.stat('财富', -8); g.remember('scam', 'cheated'); }, res: '你本来只想领鸡蛋。出门的时候，手里多了一箱“能降三高”的保健品，账户上少了一大笔钱。', dev: 0 } },
        { t: '跟他聊聊，问问他的生活', dev: 20, fx: (g) => { g.stat('心情', 2); g.remember('scam', 'talked'); }, res: '你问他多大了，家是哪儿的。他愣了一下，挂了电话。' },
      ] },

    /* ================= 74 岁：摔跤，或者运动会 ================= */
    { id: 'o_fall', age: 74, t: '摔了一跤', loc: 'hospital',
      cond: (g) => g.s('健康') < 55,
      text: '下雨天，你在小区门口滑了一下。片子出来，股骨颈骨折。',
      choices: [
        { t: '做手术，换关节', canon: true, fx: (g) => { g.stat('健康', 5); g.stat('财富', -6); g.remember('fall', 'surgery'); }, res: '手术很顺利。三个月后，你扶着助行器下了楼。' },
        { t: '保守治疗，躺着养', dev: 10, fx: (g) => { g.stat('健康', -6); g.remember('fall', 'rest'); }, res: '你在床上躺了半年。起来的时候，腿细了一圈。' },
        { t: '装一副外骨骼', dev: 20, check: ['财富', 55], fx: (g) => { g.stat('健康', 8); g.stat('财富', -8); g.remember('fall', 'exo'); }, res: '外骨骼咔哒咔哒地响，你走得比摔之前还稳。',
          fail: { fx: (g) => { g.stat('健康', -6); g.remember('fall', 'rest'); }, res: '医保不报，你算了算，还是躺着养吧。', dev: 0 } },
      ] },
    { id: 'o_sports', age: 74, t: '老年运动会',
      cond: (g) => g.s('健康') >= 55 && !g.recall('fall'),
      text: '社区办老年运动会，有门球、太极拳、健步走。',
      choices: [
        { t: '报个太极拳', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('sports', 'taichi'); }, res: '你打得不算好，但一招没忘。' },
        { t: '报健步走，冲个名次', dev: 15, check: ['健康', 65], fx: (g) => { g.stat('心情', 5); g.remember('sports', 'medal'); }, res: '你拿了第三名。奖品是一口锅，你用了很多年。',
          fail: { fx: (g) => { g.stat('健康', -3); g.remember('sports', 'hurt'); }, res: '走到一半，你的膝盖不答应了。你是被扶下来的。', dev: 0 } },
        { t: '在旁边看', dev: 5, fx: (g) => { g.remember('sports', 'watch'); }, res: '你在场边嗑了一下午瓜子，比谁喊得都响。' },
      ] },

    /* ================= 75 岁：回声 ================= */
    { id: 'o_hobby_echo', age: 75, t: '这些年的爱好', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      fx: (g) => { const h = g.recall('hobby'); if (h === 'dance') g.stat('健康', 2); if (h === 'screen') g.stat('健康', -2); },
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return '你的字在老年大学的展览上挂了出来。' + (hasKid(g) ? kidName(g) + '拍了照片发到网上。' : '你在那幅字前面站了很久。');
        if (w === 'code') return '你写的小程序能帮楼里的老人叫车、挂号。有人叫你“技术顾问”。';
        if (w === 'music') return '你的二胡能拉一整首曲子了。邻居们开始点歌。';
        const h = g.recall('hobby');
        if (h === 'dance') return '跳了七年广场舞，你成了领舞。队里新来的人叫你老师。';
        if (h === 'college') return '老年大学的同学，成了你这个岁数最常见面的人。';
        if (h === 'travel') return '这几年你跟团去了十几个地方。照片存满了一张卡，你一张也舍不得删。';
        return '短视频刷了好几年。你最常看的，是别人家的老人在干什么。';
      } },
    { id: 'o_scam_echo', age: 75, t: '那通电话以后', auto: true,
      cond: (g) => !!g.recall('scam'),
      text: (g) => {
        const s = g.recall('scam');
        if (s === 'cheated') return '那箱保健品还在柜子里。你不再接陌生电话了，' + (hasKid(g) ? kidName(g) + '给你的手机装了拦截。' : '谁打来你都先问三遍。');
        if (s === 'talked') return '你后来又接到过几次那样的电话。你还是问人家多大了、家是哪儿的。有一个人跟你聊了二十分钟，没提鸡蛋。';
        if (s === 'eggs') return '社区里有几个老伙计被骗了钱。你把领鸡蛋的经验讲给他们听，他们说你贼精。';
        return '小区里贴了防诈骗的海报，上面写的那种电话，你早就接过了。';
      } },

    /* ================= 76 岁：以后谁照顾 ================= */
    { id: 'o_care_plan', age: 76, t: '往后谁照顾你',
      cond: (g) => g.recall('liveWith') !== 'nursing',
      text: '你开始觉得，有些事一个人做不动了。拧瓶盖，换灯泡，夜里起来。',
      choices: [
        { t: '请一台陪护机器人住家', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('财富', -4); g.remember('robot', 'home'); }, res: '它会在你起夜时把灯打开，会在你说话时回话。' },
        { t: '住进养老院', dev: 15, fx: (g) => { g.remember('liveWith', 'nursing'); g.info('住处', '养老院'); stayHome(g); g.stat('人缘', 2); }, res: '你挑了一家离老房子不远的。窗户朝南。' },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && g.recall('liveWith') !== 'kids', fx: (g) => { g.remember('liveWith', 'kids'); if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') || '省城'); g.info('住处', '和孩子一起'); stayHome(g); }, res: '孩子把书房腾出来给你。你听见他们夫妻俩小声商量过。' },
        { t: '守着自己的房子', dev: 10, fx: (g) => { g.remember('robot', 'none'); g.stat('心情', 2); }, res: '你说这屋子里的每样东西你都知道在哪儿。这就够了。' },
      ] },

    /* ================= 77 岁 ================= */
    { id: 'o_chronic_echo', age: 77, t: '老毛病', auto: true,
      cond: (g) => !!g.recall('chronic'),
      fx: (g) => { const c = g.recall('chronic'); if (c === 'ignore') g.stat('健康', -8); else if (c === 'ai') g.stat('健康', 3); else g.stat('健康', 2); },
      text: (g) => {
        const c = g.recall('chronic');
        if (c === 'ignore') return '那几个箭头，你一直没当回事。今年春天，你因为心梗进了一次医院，抢救了过来。医生说，再晚半小时就难说了。';
        if (c === 'ai') return '手环管了你八年。医生翻着你的记录说，这些年控制得比大多数人都好。';
        return '七格药盒换了第三个。血压一直稳着，你的指标比同龄人好看。';
      } },
    { id: 'o_fall_echo', age: 77, t: '腿脚', auto: true,
      cond: (g) => !!g.recall('fall') || !!g.recall('sports'),
      text: (g) => {
        const f = g.recall('fall');
        if (f === 'exo') return '外骨骼换了新一代，轻了一半。你穿着它去菜市场，小孩子跟在后面看。';
        if (f === 'surgery') return '换过的那条腿，阴天会疼。你比天气预报准。';
        if (f === 'rest') return '那一跤以后，你出门少了。楼下的长椅，成了你走得最远的地方。';
        const s = g.recall('sports');
        if (s === 'medal') return '那口奖品锅，你一直用着。谁来家里吃饭，你都要提一句。';
        if (s === 'taichi') return '每天早上那一套太极拳，你打了三年没断过。';
        if (s === 'hurt') return '那次健步走伤了膝盖，以后你只在场边看。';
        return '你还是喜欢在场边看别人动，自己坐着。';
      } },
    { id: 'o_look_back_edu', age: 77, t: '想起读书的时候', auto: true,
      text: (g) => {
        const e = g.recall('edu');
        const u = g.recall('uni');
        const where = g.recall('hukou') === 'rural' ? '村里' : g.recall('hukou') === 'county' ? '县城' : '城里';
        if (e === 'phd' || e === 'master') return '你常想起读研的那几年，实验室的灯、食堂的夜宵。那时候觉得前途是一条很长的路。';
        if (e === 'bachelor' || e === 'college') return '大学宿舍的上铺，你早就记不清名字了。可是' + (u === 'top' ? '那座有名的校门' : '学校门口那家小饭馆') + '的样子，你闭着眼都能想起来。';
        if (e === 'vocational') return '你常想起职校实训车间里那股机油味。那时候你学会的手艺，养了你大半辈子。';
        if (e === 'senior') return '你常想起高考那两天，' + where + '的考场外面站满了家长。';
        return '你读书不多。可是' + where + '那所小学的钟声，你到老都记得。';
      } },

    /* ================= 78 岁：遗嘱 ================= */
    { id: 'o_will', age: 78, t: '家底留给谁',
      text: (g) => {
        const h = g.recall('house');
        const what = h === 'own' || h === 'mortgage' ? '那套房子' : h === 'hometown' ? '老家的房子' : '攒下的那点钱';
        return '你找人立遗嘱。律师问你，' + what + '打算留给谁。';
      },
      choices: [
        { t: (g) => (kidsN(g) >= 2 ? '孩子们平分' : '留给孩子'), canon: true, cond: (g) => kidsN(g) > 0, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: '你签了字，心里一块石头落了地。' },
        { t: '留给老伴', dev: 10, cond: (g) => hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: '你说，先顾着活着的那个。' },
        { t: '卖了，自己花', dev: 25, fx: (g) => { g.remember('will', 'sell'); g.stat('财富', 10); g.stat('心情', 4); }, res: '律师抬头看了你一眼。你说，钱是给人花的。' },
        { t: '捐给老家的学校', dev: 35, fx: (g) => { g.remember('will', 'donate'); g.set('donatedHouse'); g.stat('心情', 3); }, res: '你想起小时候那间漏雨的教室。' },
      ] },

    /* ================= 79 岁 ================= */
    { id: 'o_look_back_work', age: 79, t: '想起干活的那些年', auto: true,
      text: (g) => {
        const j = g.recall('preJob');
        const c = g.recall('workCity');
        const at = c ? '在' + c : '';
        const m = {
          civil: '你常梦见单位的那间办公室，桌上堆着文件，窗外是一棵梧桐。',
          teacher: '你教过的学生，有的已经当了爷爷奶奶。过年还有人给你发消息，叫你老师。',
          doctor: '你在医院里过了大半辈子的夜班。现在听到救护车的声音，还会下意识看一眼表。',
          nurse: '你扎过的针，大概有几十万次。现在你的手还是稳的。',
          tech: '你写过的代码，早就没人用了。你偶尔在新闻里看见当年那家公司的名字。',
          office: '你' + at + '坐了几十年格子间。电梯里的那些脸，你一张也想不起来了。',
          worker: '你在流水线上站了半辈子。现在听到机器的嗡嗡声，手指头还会跟着动。',
          rider: '你' + at + '送过的外卖，能绕地球好几圈。你记得每一个难找的小区。',
          driver: '你开了几十年车，' + at + '的每一条近路你都知道。',
          farmer: '你种了一辈子地。现在下雨，你第一个想的还是地里的庄稼。',
          shop: '你开的那家店早就换了招牌。你路过时，还会往里看一眼。',
          boss: '你做过的生意，赚过，也赔过。现在想起来，赔的那几次记得更清楚。',
          creator: '你拍过的视频，还挂在网上。有时候会有新的点赞，你也不知道是谁。',
        };
        return m[j] || ('你这辈子换过好几份活。' + (c ? c + '的那些年' : '那些年') + '，现在想起来，就像别人的事。');
      } },
    { id: 'o_care_echo', age: 79, t: '日子', auto: true,
      cond: (g) => !!g.recall('liveWith'),
      fx: (g) => { const l = g.recall('liveWith'); if (l === 'kids') g.stat('人缘', 2); if (l === 'alone' && g.recall('robot') === 'none') g.stat('心情', -2); stayHome(g); },
      text: (g) => {
        const l = g.recall('liveWith');
        if (l === 'nursing') return '养老院里，你有了固定的牌搭子。每天下午三点，雷打不动。';
        if (l === 'kids') return '和孩子住了这些年，你学会了少说话。可是' + (g.recall('gkCare') === 'full' ? '孙辈放学回来，第一个喊的是你。' : '晚饭桌上，大家会问你今天怎么样。');
        if (l === 'hometown') return '回老家住了这些年，村里的路修好了，人却越来越少。你成了村里最常坐在门口的那个人。';
        if (g.recall('robot') === 'home') return '家里那台机器人跟了你三年，它记得你所有的习惯，比你自己记得还清楚。';
        return '一个人住，你给自己定了规矩：每天出门一次，跟一个人说话。';
      } },

    /* ================= 80 岁：老家 ================= */
    { id: 'o_back_home', age: 80, t: '回老家看看',
      cond: (g) => g.recall('liveWith') !== 'hometown',
      text: (g) => '你梦见了' + (g.recall('homeCap') || '老家') + '。醒来以后，那条路的样子一直在眼前。',
      choices: [
        { t: '让孩子视频连线，看一眼就好', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.remember('wentHome', 'video'); }, res: '镜头里的老房子换了门。你说，就是这儿。' },
        { t: '回去住一个月', dev: 10, fx: (g) => { g.remember('wentHome', 'month'); g.stat('心情', 6); g.stat('健康', -2); CN.goHome(g); }, res: '你走了一遍小时候上学的路。比记忆里短得多。' },
        { t: '不回了，那边没人了', dev: 5, fx: (g) => { g.remember('wentHome', 'no'); g.stat('心情', -2); }, res: '你翻了个身，又睡着了。' },
      ] },
    { id: 'o_village_kids', age: 80, t: '村里的孩子',
      cond: (g) => g.recall('liveWith') === 'hometown',
      text: '暑假，村里留下来的几个孩子总在你家门口转。有一个问你，以前的人是怎么过日子的。',
      choices: [
        { t: '搬个小板凳，讲给他们听', dev: 15, fx: (g) => { g.remember('storyteller', true); g.set('oldStoryteller'); g.stat('心情', 5); g.stat('人缘', 3); }, res: '你讲了一下午，孩子们没一个走的。' },
        { t: '给他们拿点吃的，打发走', canon: true, fx: (g) => { g.remember('storyteller', false); g.stat('人缘', 1); }, res: '他们抓了糖就跑了。你在门口坐到天黑。' },
      ] },

    /* ================= 81 岁 ================= */
    { id: 'o_will_echo', age: 81, t: '遗嘱以后', auto: true,
      cond: (g) => !!g.recall('will'),
      text: (g) => {
        const w = g.recall('will');
        if (w === 'donate' && g.f('donatedHouse')) return '老家的学校来了一封信，说图书室盖好了，门口挂着你的名字。你让人把信念了两遍。';
        if (w === 'sell') return '卖房子的钱，你花在了这些年的旅行、护工和几顿好饭上。你一点也不后悔。';
        if (w === 'spouse') return '遗嘱写的是留给老伴。签字那天，你们俩都没说话，后来一起去吃了碗面。';
        return '遗嘱的事，孩子们知道了。' + (kidsN(g) >= 2 ? '有一阵子，几个孩子来得一样勤。' : '谁也没再提起。');
      } },
    { id: 'o_icu_talk', age: 82, t: '那一天到了怎么办', loc: 'hospital',
      text: '社区医生来做预立医嘱的登记，问你：要是哪天不行了，抢不抢救，插不插管。',
      choices: [
        { t: '能救就救，插管也要救', canon: true, fx: (g) => { g.remember('icu', 'yes'); stayHome(g); }, res: '你说你还想多看几年。医生在表上打了一个勾。' },
        { t: '不插管，不进 ICU，不受那个罪', dev: 20, fx: (g) => { g.remember('icu', 'no'); g.stat('心情', 3); stayHome(g); }, res: '你签字的时候手很稳。' },
        { t: '交给孩子们决定', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: '你说，到时候他们比你清楚。' },
      ] },

    /* ================= 83 岁 ================= */
    { id: 'o_kids_visit', age: 83, t: '谁常来', auto: true,
      cond: (g) => hasKid(g),
      fx: (g) => { if (g.recall('liveWith') === 'kids' || g.s('人缘') >= 60) g.stat('心情', 3); else g.stat('心情', -2); },
      text: (g) => {
        if (g.recall('liveWith') === 'kids') return '孩子每天下班回来，先进你屋看一眼。你装作睡着了。';
        if (g.recall('icu') === 'kids') return kidName(g) + '知道了预立医嘱的事，那个周末专门回来，陪你坐了一下午。两个人谁也没提。';
        if (g.s('人缘') >= 60) return kidName(g) + '每个周末都回来，带着吃的，走的时候冰箱是满的。';
        return kidName(g) + '工作忙，一个月回来一次。你把攒了一个月的话，在饭桌上一口气说完了。';
      } },
    { id: 'o_hometown_echo', age: 83, t: '老家', auto: true,
      cond: (g) => !!g.recall('wentHome') || g.recall('storyteller') != null,
      text: (g) => {
        if (g.f('oldStoryteller')) return '你讲的那些故事，有个孩子写进了作文，拿了县里的奖。他跑来给你看，奖状上有你的名字。';
        if (g.recall('storyteller') === false) return '那几个孩子长大了，去了城里。村口只剩你和几只狗。';
        const w = g.recall('wentHome');
        if (w === 'month') return '那一个月，你在老家认出了小时候的同桌。他也老了，坐在同一棵树下。';
        if (w === 'video') return '那次视频以后，孩子把老房子的照片打印出来，挂在你床头。';
        return '老家是什么样，你已经只能靠想了。';
      } },

    /* ================= 84 岁：记性 ================= */
    { id: 'o_memory', age: 84, t: '记性',
      text: '你开始叫错人的名字。有天出门，站在楼下想了半天要去哪儿。',
      choices: [
        { t: '去医院查查', canon: true, fx: (g) => { g.remember('memory', 'doctor'); g.stat('健康', 2); }, res: '医生说是轻度认知障碍，开了药，让你多动脑子。' },
        { t: '每天写日记', dev: 15, fx: (g) => { g.remember('memory', 'diary'); g.stat('学识', 2); }, res: '你买了一个厚本子，第一页写的是自己的名字和住址。' },
        { t: '让 AI 帮你记着', dev: 10, fx: (g) => { g.remember('memory', 'ai'); }, res: '你对着它说：“我把钥匙放哪儿了？”它告诉你，在你左边口袋里。' },
      ] },
    { id: 'o_eighty_five', age: 85, t: '八十五', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => (g.s('健康') >= 40 ? '八十五岁，你还能自己下楼。同一年出生的人里，能做到的不多了。' : '八十五岁，你大半天都坐在窗边。阳光从左边挪到右边，一天就过去了。') },

    /* ================= 86 岁：寿宴 ================= */
    { id: 'o_birthday', age: 86, t: '大寿',
      text: '家里人说，八十六了，该好好过个生日。',
      choices: [
        { t: '大办一场，把亲戚都请来', canon: true, fx: (g) => { g.remember('bday', 'big'); g.stat('人缘', 4); g.stat('健康', -2); }, res: '摆了八桌。很多人你叫不出名字，可是他们都叫得出你。' },
        { t: '一家人吃顿饭就好', dev: 5, fx: (g) => { g.remember('bday', 'small'); g.stat('心情', 3); }, res: '一桌人，你吃了半碗面，看了一晚上他们。' },
        { t: '谁也不叫，去看一次海', dev: 25, cond: (g) => g.s('健康') >= 30, fx: (g) => { g.remember('bday', 'sea'); g.stat('心情', 6); g.move('coast', '海边'); }, res: '你在沙滩上坐了一下午。浪一层一层地上来，又下去。' },
      ] },
    { id: 'o_memory_echo', age: 87, t: '忘了，记着', auto: true,
      cond: (g) => !!g.recall('memory'),
      fx: (g) => { const m = g.recall('memory'); if (m === 'diary') g.stat('心情', 3); stayHome(g); },
      text: (g) => {
        const m = g.recall('memory');
        if (m === 'diary') return '日记写满了三本。有些事你忘了，翻开本子，它们又回来了。';
        if (m === 'ai') return 'AI 替你记着所有人的生日。它提醒你给孙辈打电话的时候，你总是假装是自己想起来的。';
        return '药一直吃着。你还认得家里的每一个人，这就够了。';
      } },
    { id: 'o_bday_echo', age: 87, t: '那次生日', auto: true,
      cond: (g) => !!g.recall('bday'),
      text: (g) => {
        const b = g.recall('bday');
        if (b === 'big') return '那八桌寿宴的照片，被亲戚们转了很多遍。你在照片里笑得很开。';
        if (b === 'sea') return '你常说起那次看海。说着说着，就睡着了。';
        return '那顿生日饭吃的什么，你记不清了。只记得一桌人都在。';
      } },

    /* ================= 88 岁：最后想去的地方 ================= */
    { id: 'o_last_place', age: 88, t: '还想去一个地方', loc: 'home',
      text: '你跟家里人说，趁还走得动，想再去一个地方。',
      choices: [
        { t: '哪儿也不去，在家挺好', canon: true, fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('心情', 1); }, res: '你说说而已。窗外的树，你也看了好些年了。' },
        { t: '回出生的地方', dev: 15, cond: (g) => g.recall('liveWith') !== 'hometown', fx: (g) => { g.remember('lastTrip', 'birth'); g.stat('心情', 5); g.stat('健康', -3); CN.goHome(g); }, res: '你站在出生的那条街上，已经认不出来了。可是风的味道没变。' },
        { t: '去年轻时打拼的那座城市', dev: 15, cond: (g) => !!g.recall('workCity'), fx: (g) => { g.remember('lastTrip', 'work'); g.stat('心情', 4); g.stat('健康', -3); g.move('metro', g.recall('workCity')); }, res: '你坐在当年住过的楼下。楼还在，窗户换了。' },
        { t: '去一个从没去过的地方', dev: 30, check: ['健康', 35], fx: (g) => { g.remember('lastTrip', 'new'); g.stat('心情', 7); g.stat('健康', -4); g.move('road', '路上'); }, res: '八十八岁，你第一次看见雪山。',
          fail: { fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('健康', -3); }, res: '走到半路，身体不答应了。你在车上睡着了，醒来已经在回家的路上。', dev: 0 } },
      ] },
    { id: 'o_gk_grown', age: 89, t: '孙辈长大了', auto: true,
      cond: (g) => (g.recall('grandkids') || 0) >= 1,
      fx: (g) => { if (g.recall('gkCare') === 'full') g.stat('心情', 4); },
      text: (g) => {
        const c = g.recall('gkCare');
        const n = JY.byId.gk1 ? g.name('gk1') : '孙辈';
        if (c === 'full') return n + '二十二岁了，大学毕业。毕业照里，' + n + '把你也拉进了镜头，说是你带大的。';
        if (c === 'none') return n + '二十二岁了。你们见面不多，每次见，' + n + '都客客气气地叫你。';
        return n + '二十二岁了。小时候你接送过的那条路，' + n + '还记得。';
      } },
    { id: 'o_ninety', age: 90, t: '九十', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => (hasSp(g) ? '九十岁。你和' + spName(g) + '还在一起，社区上门来拍了张金婚还是钻石婚的照片，你们俩算了半天也没算清结婚多少年了。' : '九十岁。和你同一年出生的那些人，已经走了一大半。') },
    { id: 'o_letter', age: 91, t: '留几句话',
      text: '你想给后来的人留几句话。',
      choices: [
        { t: '写信，一人一封', canon: true, fx: (g) => { g.remember('legacy', 'letters'); g.stat('心情', 3); }, res: '你的字抖得厉害，一封信写了三天。' },
        { t: '对着手机录一段视频', dev: 10, fx: (g) => { g.remember('legacy', 'video'); g.stat('心情', 2); }, res: '录了十几遍。最后那一遍，你笑着说了句“就这样吧”。' },
        { t: '不留了，该说的都说过', dev: 10, fx: (g) => { g.remember('legacy', 'none'); }, res: '你说，话说多了，记得的人反而累。' },
      ] },
    { id: 'o_trip_echo', age: 92, t: '那一趟', auto: true,
      cond: (g) => !!g.recall('lastTrip'),
      fx: (g) => stayHome(g),
      text: (g) => {
        const t = g.recall('lastTrip');
        if (t === 'birth') return '你常说起回出生地的那一趟。说的次数多了，细节一次比一次多。';
        if (t === 'work') return '你常说起回去看的那座城市。那些年的苦，说出来都成了好玩的事。';
        if (t === 'new') return '那座雪山的照片，你设成了手机屏幕。';
        return '你哪儿也没去。不过这些年，窗外那棵树你看得比谁都熟。';
      } },
    { id: 'o_legacy_echo', age: 93, t: '后来的人', auto: true,
      cond: (g) => !!g.recall('legacy'),
      text: (g) => {
        const l = g.recall('legacy');
        if (l === 'letters') return '你写的信，有人当场拆开读了，有人说要留到以后。';
        if (l === 'video') return '那段视频，家里人存在了好几个地方。孩子说，想你的时候就看看。';
        return '你没留什么话。可是家里人吃饭时，常学着你说话的口气。';
      } },
    { id: 'o_last_wish', age: 94, t: '想要什么',
      cond: (g) => g.s('健康') > 10,
      text: '家里人问你，现在最想要什么。',
      choices: [
        { t: '想吃一口小时候的饭', canon: true, fx: (g) => { g.remember('lastWish', 'food'); g.stat('心情', 4); }, res: '他们照着你说的做了。味道不太对，你还是吃完了。' },
        { t: '想见一个很久没见的人', dev: 15, fx: (g) => { g.remember('lastWish', 'person'); g.stat('人缘', 3); }, res: '他们打了好多电话，找到了。' },
        { t: '什么都不想要，挺好', dev: 5, fx: (g) => { g.remember('lastWish', 'none'); g.stat('心情', 2); }, res: '你说，人老了，想要的东西就少了。' },
      ] },
    { id: 'o_lastwish_echo', age: 95, t: '愿望', auto: true,
      cond: (g) => !!g.recall('lastWish'),
      text: (g) => {
        const w = g.recall('lastWish');
        if (w === 'person') return '那个很久没见的人坐着轮椅来了。你们两个老人拉着手，半天说不出话，后来一起笑了。';
        if (w === 'food') return '那顿饭以后，家里人学会了做。每次端上来，你都说比上回像了。';
        return '你说什么都不要。家里人还是每天多陪你坐一会儿。';
      } },
    { id: 'o_slow', age: 96, t: '慢', auto: true,
      text: '你说话越来越慢，睡得越来越多。醒来的时候，常常要想一想今年是哪一年。' },
    { id: 'o_hundred', age: 100, t: '一百岁', auto: true,
      fx: (g) => g.stat('心情', 5),
      text: '一百岁。社区送来了一块“百岁寿星”的牌子，记者来拍照。你问他们，今天是什么好日子。' },
  ]);

  /* ---------- 老伴走了、最后一次住院：哪一年发生不一定，用必定触发的意外 ---------- */
  JY.addEncounters([
    { id: 'e_o_widowed', y: [2026, 2200], minAge: 65, t: '一个人了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '丧偶'); g.stat('心情', -12); g.stat('健康', -3); },
      text: (g) => spName(g) + '走了以后，你还是每天做两个人的饭。做好了，才想起来。' },
    { id: 'e_o_after_widow', y: [2026, 2200], minAge: 66, t: '往后的日子', always: true,
      cond: (g) => g.recall('love') === 'widowed' && g.since('love') >= 1,
      text: (g) => (g.since('love') >= 5 ? '你一个人过了好些年。有人给你介绍一个老伴，说两个人搭个伴，有个照应。' : '老伴走了一年多。家里人轮流来劝你，往后的日子，得有个打算。'),
      choices: [
        { t: '一个人过', canon: true, fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', 1); }, res: '你把' + '老伴的照片擦干净，摆在饭桌上。' },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && g.recall('liveWith') !== 'kids', fx: (g) => { g.remember('afterWidow', 'kids'); g.remember('liveWith', 'kids'); if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') || '省城'); g.info('住处', '和孩子一起'); stayHome(g); }, res: '你只带走了一个相框和一件旧毛衣。' },
        { t: '再找个老伴', dev: 30, check: ['人缘', 50],
          fx: (g) => { g.remember('remarried', true); g.remember('afterWidow', 'remarry'); const p = CN.person({ id: 'sp2', sex: isMale(g) ? '女' : '男', born: g.Y - g.age + CN.ri(-4, 4), origin: '老年大学认识的' }); g.spawn(p); g.rel('老伴', 'sp2', '晚年再婚'); g.info('婚姻', '再婚'); g.stat('心情', 8); },
          res: '你们没办酒席，只请两边的孩子吃了顿饭。有人背后说闲话，你装作没听见。',
          fail: { fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', -2); }, res: '见了两回，对方的孩子不同意。这事就散了。', dev: 0 } },
      ] },
    { id: 'e_o_remarry_echo', y: [2026, 2200], minAge: 68, t: '搭伴过日子', auto: true, always: true,
      cond: (g) => g.recall('remarried') === true && g.since('remarried') >= 2,
      fx: (g) => g.stat('健康', 2),
      text: (g) => (g.alive('sp2') ? '再婚两年，你们俩每天一起买菜、散步，为放多少盐吵嘴。孩子们说，你气色好多了。' : '晚年找的那个伴，陪了你没几年，也走了。你不后悔。') },
    { id: 'e_o_alone_echo', y: [2026, 2200], minAge: 68, t: '一个人的日子', auto: true, always: true,
      cond: (g) => !!g.recall('afterWidow') && g.recall('afterWidow') !== 'remarry' && g.since('afterWidow') >= 3,
      text: (g) => (g.recall('afterWidow') === 'kids' ? '在孩子家住久了，你的东西也一点点多起来。那件旧毛衣，你一直没舍得穿。' : '一个人过了几年，你学会了跟照片说话。说完今天吃了什么，就关灯睡觉。') },
    { id: 'e_o_last_hospital', y: [2026, 2200], minAge: 78, t: '又进了医院', loc: 'hospital', always: true,
      cond: (g) => g.s('健康') <= 22,
      text: (g) => {
        const i = g.recall('icu');
        const pre = i === 'no' ? '你早就签过字：不插管，不进 ICU。' : i === 'yes' ? '你早就说过：能救就救。' : i === 'kids' ? '你说过，到时候让孩子们决定。' : '';
        return '你又一次被送进了医院。医生把家里人叫到走廊上。' + pre;
      },
      choices: [
        { t: '进 ICU，插管，接着治', canon: true, fx: (g) => { g.stat('健康', 14); g.stat('心情', -8); g.remember('lastCall', 'icu'); }, res: '你在 ICU 里躺了十几天，又被推了出来。' },
        { t: '回家，不受这个罪', dev: 20, fatal: true, fx: (g) => { g.die((g.recall('icu') === 'no' ? '照着自己当年签的字，' : '') + '在家里，在睡梦中离世'); }, res: '家里人把你接回了家。那天晚上，屋里的灯一直开着。' },
        { t: '听孩子们的', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('lastCall', 'kids'); if (g.rnd() < 0.5) g.stat('健康', 12); else g.die('在医院里，家人陪在身边离世'); }, res: (g) => (g.recall('lastCall') === 'kids' ? '孩子们商量了一夜。' : '') },
      ] },
    { id: 'e_o_after_icu', y: [2026, 2200], minAge: 78, t: '出院以后', auto: true, always: true,
      cond: (g) => !!g.recall('lastCall') && g.since('lastCall') >= 1,
      text: (g) => (g.recall('lastCall') === 'icu' ? '从 ICU 出来以后，你瘦了一大圈。你说，多活的每一天都是赚的。' : '孩子们替你拿了主意。你后来跟他们说，你们拿得对。') },
  ]);

  /* 新增的状态键名（老年，写进这一世的记忆）：
   * preJob 退休前的职业；pension 'high'|'mid'|'low'|'savings'；afterRetire 'rest'|'rehire'|'learn'|'work'|'handover'
   * liveWith 'kids'|'alone'|'hometown'|'nursing'；kidCity 孩子住的城市；grandkids 孙辈个数（孙辈 id gk1、gk2）
   * gkCare 'full'|'part'|'none'；pet；hobby；learnWhat；chronic 'control'|'ai'|'ignore'；spCare；reunion
   * scam；fall；sports；robot 'home'|'none'；will 'kids'|'spouse'|'sell'|'donate'；wentHome；storyteller
   * icu 'yes'|'no'|'kids'；memory；bday；lastTrip；legacy；lastWish；afterWidow；remarried；lastCall
   */
  // 退休以后的日子（读 retired）
  JY.addFlavor('any', [
    { t: '退休以后，你每天醒得比上班时还早。', cond: (g) => g.recall('retired') === true },
    { t: '你翻出以前上班的工牌看了一会儿，又放回抽屉。', cond: (g) => g.recall('retired') === true },
  ]);
})();

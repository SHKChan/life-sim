/* 十四亿分之一 · 老年：65 岁到离世
 * 退休和退休金、住哪里、带孙辈、老伴、爱好、慢性病、养老、遗嘱、临终安排、回望，一直写到一百多岁。
 * 读前面各阶段留下的状态（job、edu、house、love、kids、workCity、kidCity、plan60……），缺了就按兜底的写法。
 * 钱用 economy.js 的 CN.pay / CN.earn / CN.cash / CN.net；和谁住用 CN.liveWith / CN.moveOut / CN.livesWith / CN.alone。
 * 晚年住哪儿记在 liveWith（'alone' 守着自己家，可能和老伴一起；'kids' 和孩子住；'hometown' 回老家；'nursing' 养老院），
 * economy.js 每年按它对一遍同住的人。
 * 一年最多一个抉择：抉择节点在 65、66、67、68、69、71、73、74、76、78、80、82、84、86、88、91、94 岁；
 * 两个必定触发的抉择意外（丧偶以后、最后一次住院）只在其他年份出现（DECIDE）。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const FORMAL = ['civil', 'teacher', 'doctor', 'nurse', 'soldier', 'office', 'tech', 'sales', 'worker', 'driver'];
  const DECIDE = [65, 66, 67, 68, 69, 71, 73, 74, 76, 78, 80, 82, 84, 86, 88, 91, 94];
  const freeYear = (g) => !DECIDE.includes(g.age);
  // 退休金（元/年），和 economy.js 的 PENSION 一致，只用来显示每月多少
  const PEN = { high: 60000, mid: 40000, low: 3600, savings: 12000 };
  // 还活着的孩子、孙辈
  const kidIds = (g) => ['k1', 'k2', 'k3'].filter((id) => JY.byId[id] && g.alive(id));
  const kidsN = (g) => kidIds(g).length;
  const hasKid = (g) => kidsN(g) > 0;
  const kid1 = (g) => kidIds(g)[0];
  const kidName = (g) => (kid1(g) ? g.name(kid1(g)) : '孩子');
  const gkIds = (g) => ['gk1', 'gk2', 'gk3'].filter((id) => JY.byId[id] && g.alive(id));
  const hasGk = (g) => gkIds(g).length > 0;
  // 老伴：原配还在，或者晚年再婚的那个
  const partner = (g) => {
    if (g.recall('love') === 'married' && JY.byId.sp && g.alive('sp')) return 'sp';
    if (g.recall('remarried') === true && JY.byId.sp2 && g.alive('sp2')) return 'sp2';
    return null;
  };
  const hasSp = (g) => !!partner(g);
  const spName = (g) => (partner(g) ? g.name(partner(g)) : '老伴');
  const isMale = (g) => CN.sexOf(g) === '男';
  const lw = (g) => g.recall('liveWith');
  // 住在老家：回了老家，或者老家有房子、自己没跟孩子走也没进养老院
  const atHometown = (g) => lw(g) === 'hometown' || (g.recall('house') === 'hometown' && lw(g) !== 'kids' && lw(g) !== 'nursing');
  // 房子：手里有一套值钱的房子
  const houseW = (g) => (['own', 'mortgage', 'hometown'].includes(g.recall('house')) ? Number(g.recall('houseVal')) || 0 : 0);
  const debtW = (g) => Number(g.recall('debt')) || 0;
  // 能动用的钱：净资产减去房子
  const liquid = (g) => Math.max(0, Math.round(CN.net(g) - (houseW(g) - debtW(g)) * 1e4));
  // 花钱，最多花到存款见底；返回实际花了多少（res 里用 paid 读）
  let paid = 0;
  const spend = (g, x) => { paid = Math.max(0, Math.min(Math.round(x), Math.max(0, CN.cash(g)))); CN.pay(g, paid); return paid; };
  const round1k = (x) => Math.round(x / 1000) * 1000;
  const family = (g) => hasKid(g) || hasSp(g);
  const famWord = (g) => (family(g) ? '家里人' : '社区的志愿者');
  // 返聘：只请有真本事、身体也还行的人。学识、事业够高，或者是医生、老师、技术、有手艺的工人
  const SKILLED = ['doctor', 'teacher', 'nurse', 'tech'];
  const ableToRehire = (g) => g.s('健康') >= 50 && (g.s('学识') >= 72 || g.s('事业') >= 65
    || (SKILLED.includes(g.recall('preJob')) && g.s('学识') >= 55) || (g.recall('preJob') === 'worker' && !!g.recall('skill'))
    || g.recall('consult') === 'part' || g.recall('ladder40') === 'expert');
  const rehireMonth = (g) => round1k(Math.max(3000, (CN.jobPay ? CN.jobPay(g, g.recall('preJob') || 'office', null) : 8000) * 0.5));
  const REHIRE = { doctor: '原来的医院请你回去坐诊，一周三个半天。', teacher: '学校缺有经验的老教师，请你回去带新老师。', nurse: '医院的护理部请你回去带实习生。',
    tech: '原来的公司有一套老系统，只有你摸得透，请你回去当顾问。', worker: '厂里新上的设备出了毛病，老师傅里只有你会修，请你回去带徒弟。',
    civil: '单位请你回去帮着带新人、整理多年的材料。', soldier: '武装部请你回去给新兵讲课。' };
  // 能不能住得起养老院（一年约 ¥6 万）
  const canNursing = (g) => liquid(g) >= 150000 || CN.income(g) >= 50000 || hasKid(g);
  // 现在住哪儿，场景跟着走
  const stayHome = (g) => {
    const l = lw(g);
    if (l === 'hometown') CN.goHome(g);
    else if (l === 'nursing') g.move('home', '养老院');
    else if (l === 'kids') g.move('home', (g.recall('kidCity') || '孩子那边') + ' · 孩子家');
    else if (g.recall('house') === 'hometown' || ((g.recall('tier') || 5) >= 5 && !g.recall('workCity'))) CN.goHome(g);
    else g.move('home', g.recall('workCity') || g.recall('homeCap') || '家');
  };
  // 搬去和孩子住
  const toKids = (g) => {
    if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') || '省城');
    g.remember('liveWith', 'kids');
    CN.liveWith(g, [kid1(g)].concat(gkIds(g)));
    g.info('住处', (g.recall('kidCity') === '国外' ? '国外' : g.recall('kidCity')) + '，和孩子一起');
    stayHome(g);
  };
  // 住进养老院：只有老伴跟着
  const toNursing = (g, cap) => {
    g.remember('liveWith', 'nursing');
    CN.moveOut(g, kidIds(g).concat(gkIds(g), ['fa', 'mo', 'sib0', 'sib1']));
    g.info('住处', cap || '养老院');
    stayHome(g);
  };
  // 生一个孙辈：id gk1、gk2；儿子的孩子叫孙子孙女，女儿的孩子叫外孙外孙女
  const addGrandkid = (g, kidId) => {
    const kid = JY.byId[kidId];
    if (!kid) return null;
    const n = (g.recall('grandkids') || 0) + 1;
    const fromSon = kid.sex === '男';
    const gk = CN.person({ id: 'gk' + n, born: g.Y, surname: fromSon ? kid.name[0] : undefined, origin: kid.name + '的孩子' });
    g.spawn(gk);
    const label = fromSon ? (gk.sex === '男' ? '孙子' : '孙女') : (gk.sex === '男' ? '外孙' : '外孙女');
    g.rel(n === 1 ? label : '小' + label, gk.id, kid.name + '的孩子');
    g.remember('grandkids', n);
    if (lw(g) === 'kids' && CN.livesWith(g, kidId)) CN.liveWith(g, [gk.id]);
    return gk;
  };
  // 一句“身边有谁”
  const company = (g) => {
    if (lw(g) === 'nursing') return hasSp(g) ? '你和' + spName(g) + '住在养老院的同一间屋里' : '你住在养老院，护工每天来几趟';
    if (CN.alone(g)) return '你一个人住，社区的人每天来敲一次门';
    return '你' + CN.hhText(g);
  };

  JY.addFlags({
    donatedHouse: '把家产留给了老家的学校，那里后来多了一间图书室',
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
        else p = g.recall('hukou') === 'rural' ? 'low' : 'mid';
        g.remember('pension', p);
        g.remember('retired', true);
        CN.setJob(g, 'retired', '退休');
        g.info('退休金', { high: '稳当', mid: '够用', low: '微薄', savings: '靠积蓄' }[p]);
        if (p === 'low') g.stat('心情', -2);
      },
      text: (g) => {
        const p = g.recall('pension');
        const month = CN.fmt(PEN[p] / 12);
        const debt = debtW(g) > 0 ? '房贷还剩 ' + CN.fmt(debtW(g) * 1e4) + '，得接着还。' : '';
        const save = '存款 ' + CN.fmt(liquid(g)) + '。';
        if (p === 'high') return '六十五岁，你办了退休手续。单位开了个小会，送了你一束花。每月退休金 ' + month + '，按时到账，够花，还能贴补孩子。' + save + debt;
        if (p === 'mid') return '六十五岁，你领到了第一笔养老金，每月 ' + month + '。数目不多不少，过日子够了。' + save + debt;
        if (p === 'savings') return '六十五岁，没有谁给你办退休。每月的养老金只有 ' + month + '，你看了看账户上的 ' + CN.fmt(liquid(g)) + '，觉得够了。' + debt;
        return '六十五岁，你领到了第一笔养老金，每月 ' + month + '。买菜够，看病不够。' + save + '你没觉得自己退休了，只是老了。' + debt;
      } },
    { id: 'o_after_retire', age: 65, t: '退休以后', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && ableToRehire(g),
      text: (g) => '交完工牌的第二天，你还是六点就醒了。' + (REHIRE[g.recall('preJob')] || '原单位打电话来，问你愿不愿意返聘回去当顾问，带带新人。'),
      choices: [
        { t: '彻底歇下来', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('afterRetire', 'rest'); }, res: '你挂了电话，去菜市场转了一圈。原来上午的菜这么新鲜。' },
        { t: (g) => '返聘回去，再干几年（每月多 ' + CN.fmt(rehireMonth(g)) + '，干到七十岁）', dev: 15, fx: (g) => { g.stat('健康', -2); g.remember('rehirePay', rehireMonth(g)); g.remember('afterRetire', 'rehire'); g.info('职业', '退休返聘'); },
          res: (g) => '你又有了工牌，只是上面多了“顾问”两个字。每月多 ' + CN.fmt(g.recall('rehirePay')) + '，年轻人叫你老师。' },
        { t: '去学一样年轻时没空学的东西', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: '你报了老年大学，一学期 ¥800。开学那天，你比谁到得都早。' },
      ] },
    { id: 'o_retire_plain', age: 65, t: '退休以后', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && !ableToRehire(g),
      text: (g) => '交完工牌，单位里没再打电话来。你在家待了一个月，手不知道往哪儿放。' + (g.s('健康') < 50 ? '腰和膝盖都在提醒你，该歇了。' : '楼下超市贴着招工的条子，招理货员和夜班保安。'),
      choices: [
        { t: '在家歇着，买菜做饭', canon: true, fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); g.remember('afterRetire', 'rest'); }, res: (g) => '你把菜市场摸熟了，哪家的豆腐嫩、哪家的秤准，你都知道。' + (CN.alone(g) ? '' : '家里的饭点比以前准了。') },
        { t: '找点零活，挣个零花（每月约 ¥2,000）', dev: 10, cond: (g) => g.s('健康') >= 40,
          fx: (g) => { g.stat('健康', -1); g.stat('人缘', 2); g.remember('afterRetire', 'odd'); g.info('职业', '退休，打点零工'); },
          res: (g) => '你在' + CN.pick(['小区门口当门卫', '超市里理货', '菜市场帮人看摊', '附近的学校看大门']) + '，一个月 ¥2,000 左右。活不累，能和人说说话。' },
        { t: '报个老年大学，学点没学过的', dev: 10, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: '老年大学一学期 ¥800。你报了书法和手机摄影，开学那天比谁到得都早。' },
      ] },
    { id: 'o_keep_working', age: 65, t: '还干不干', loc: 'home',
      cond: (g) => !FORMAL.includes(g.recall('preJob')),
      text: (g) => {
        const j = g.recall('preJob');
        const m = '每月的养老金是 ' + CN.fmt(PEN[g.recall('pension')] / 12) + '。';
        if (j === 'farmer') return '地还在那儿，你的腰一年比一年弯。村里年轻人都走了，地租出去也没几个钱。' + m;
        if (j === 'shop' || j === 'boss') return '店里的事，你一天不在就有人打电话问。孩子们说你该歇歇了。' + m;
        if (j === 'rider' || j === 'driver' || j === 'creator' || j === 'freelance') return '没有单位给你办退休。你的手机里还开着接单的软件，单子越来越少。' + m;
        return '你到了这个岁数，身边的人都说该享福了。可是每个月的钱，算来算去总差一点。' + m;
      },
      choices: [
        { t: '接着干，干不动再说', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('afterRetire', 'work'); }, res: '你照旧早出晚归。有人说你闲不住，你说是闲不起。' },
        { t: '交给孩子，自己退到后面', dev: 10, cond: (g) => hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob')),
          fx: (g) => { g.stat('心情', 3); g.remember('afterRetire', 'handover'); }, res: '交接那天你说了很多，孩子听了一半。你也就不说了。' },
        { t: '把活儿盘出去，换一笔钱', dev: 10, cond: (g) => !(hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob'))),
          fx: (g) => { const x = g.recall('preJob') === 'boss' ? 200000 : g.recall('preJob') === 'shop' ? 60000 : 20000; CN.earn(g, x); paid = x; g.stat('心情', 3); g.remember('afterRetire', 'handover'); },
          res: () => '换了 ' + CN.fmt(paid) + '。你存进了银行，每个月取一点。' },
        { t: '彻底歇了，紧着过', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('afterRetire', 'rest'); }, res: '你把闹钟关了。省一点，日子也过得下去。' },
      ] },

    /* ================= 66 岁：住哪儿 ================= */
    { id: 'o_first_morning', age: 66, t: '不用上班的早上', auto: true,
      fx: (g) => {
        const a = g.recall('afterRetire');
        if (a === 'rehire') CN.earn(g, 50000);
        else if (a === 'work') { CN.earn(g, g.recall('preJob') === 'farmer' ? 12000 : 30000); g.stat('健康', -1); }
        else g.stat('心情', 2);
      },
      text: (g) => {
        const a = g.recall('afterRetire');
        if (a === 'rehire') return '返聘这一年，你多挣了 ' + CN.fmt(50000) + '。你发现自己说的话年轻人不太听了，就提前一站下车，走一段路回家。';
        if (a === 'learn') return '老年大学的课表贴在冰箱上。你第一次觉得一周七天不够用。';
        if (a === 'work') return '六十六岁，你还在干活，这一年挣了 ' + CN.fmt(g.recall('preJob') === 'farmer' ? 12000 : 30000) + '。有天收工，你坐在台阶上歇了很久，才站起来。';
        if (a === 'handover') return '交出去以后，你每天去转一圈，看一眼就走。后来隔一天去一次。';
        return '你学会了睡懒觉。早上的阳光照到床上，你才想起来今天不用去任何地方。';
      } },
    { id: 'o_gk_born', age: 66, t: '当了长辈', auto: true,
      cond: (g) => hasKid(g) && g.ageOf(kid1(g)) >= 24 && !g.recall('grandkids'),
      fx: (g) => { if (g.rnd() < 0.75) { addGrandkid(g, kid1(g)); g.stat('心情', 6); } else g.remember('grandkids', 0); },
      text: (g) => (g.recall('grandkids') ? CN.who(g, kid1(g), true) + '有孩子了。你在医院走廊里等了一夜，抱着那个小东西的时候，手直抖。' : CN.who(g, kid1(g), true) + '说暂时不打算要孩子。你张了张嘴，没说什么。') },
    { id: 'o_where', age: 66, t: '去孩子那边吗', loc: 'home',
      cond: (g) => hasKid(g),
      text: (g) => {
        const c = g.recall('kidCity');
        const who = CN.who(g, kid1(g), true);
        const gk = hasGk(g) ? '孩子也没人带，' : '';
        if (c === '国外') return who + '在国外安了家，视频里说那边的房子大，' + gk + '想接你过去一起住。';
        if (g.recall('plan60') === 'kid') return '你搬到' + c + '已经好几年，住得离孩子不远。' + who + '说，' + gk + '干脆搬到一起住吧。';
        return who + '打电话来，说' + (c ? c + '的' : '城里的') + '房子有空房间，' + gk + '让你' + (hasSp(g) ? '们' : '') + '过去一起住。';
      },
      choices: [
        { t: '收拾东西，搬过去', canon: true,
          fx: (g) => { if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') && g.rnd() < 0.5 ? g.recall('workCity') : CN.pick(['北京', '上海', '深圳', '杭州', '成都', '武汉', '南京', '西安'])); toKids(g); g.stat('人缘', 3); g.stat('心情', -1); },
          res: (g) => (g.recall('kidCity') === '国外' ? '你带了两箱衣服，一袋老家的米。下了飞机，满街的字你一个也不认识。' : '你带了两箱衣服，一袋老家的米。新家很干净，你一时不知道该把手放哪儿。') },
        { t: '不去，留在自己家', dev: 10, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 2); stayHome(g); },
          res: (g) => (CN.alone(g) ? '你说你住惯了。挂了电话，屋里很安静。' : '你说你们住惯了。挂了电话，' + spName(g) + '说，这样也好，各过各的，见面才亲。') },
        { t: '谁也不跟，回老家去', dev: 20, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家的房子落满了灰。你扫了一整天，夜里听见了几十年没听过的虫叫。' },
      ] },
    { id: 'o_where_nokid', age: 66, t: '往后住哪儿', loc: 'home',
      cond: (g) => !hasKid(g),
      text: (g) => {
        if (hasSp(g)) return '没有孩子在身边，你和' + spName(g) + '商量往后怎么过。';
        if (CN.alone(g)) return '你一个人住了好些年。社区来登记独居老人，问你往后有什么打算。';
        return '你' + CN.hhText(g) + '。社区来登记老人的情况，问你往后有什么打算。';
      },
      choices: [
        { t: '就在这儿，照常过', canon: true, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 1); stayHome(g); }, res: '你在门口装了一个能报警的门铃，别的照旧。' },
        { t: '回老家去', dev: 15, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家还有几个老邻居。他们记得你小时候的外号。' },
        { t: '住进养老社区，每月 ¥5,000', dev: 20, cond: (g) => liquid(g) >= 150000 || CN.income(g) >= 50000,
          fx: (g) => { toNursing(g, '养老社区'); g.stat('健康', 2); }, res: '社区里有食堂、有医生，楼下有一群人等你打牌。' },
        { t: '去看看养老院，先打听价钱', dev: 10, cond: (g) => !(liquid(g) >= 150000 || CN.income(g) >= 50000),
          fx: (g) => { g.remember('liveWith', 'alone'); g.remember('robot', 'none'); g.stat('心情', -1); stayHome(g); }, res: '一个月五千，你的养老金不够零头。你回来把家里的门槛都拆了，免得哪天绊倒。' },
      ] },

    /* ================= 67 岁：孙辈或者别的牵挂 ================= */
    { id: 'o_grandcare', age: 67, t: '带孩子', loc: 'home',
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (CN.livesWith(g, gkIds(g)[0]) ? '就睡在你隔壁屋。' : '的爸妈上班都忙。') + '谁来带，成了家里的大事。',
      choices: [
        { t: '我来带，全天', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('人缘', 4); g.remember('gkCare', 'full'); }, res: '你又学了一遍换尿布、冲奶粉。只是腰比当年硬多了。' },
        { t: '白天帮着接送，晚上还给他们', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('gkCare', 'part'); }, res: '你每天按点出门，按点回家。中间那几个小时是你自己的。' },
        { t: '出钱请个阿姨，自己搭把手', dev: 15, cond: (g) => liquid(g) >= 80000,
          fx: (g) => { spend(g, 48000); g.remember('gkCare', 'paid'); g.stat('人缘', 2); }, res: () => '一年 ' + CN.fmt(paid) + '，你出了。阿姨干活，你在旁边看着，偶尔抱一抱。' },
        { t: '不带，各过各的', dev: 25, fx: (g) => { g.stat('心情', 3); g.stat('人缘', -3); g.remember('gkCare', 'none'); }, res: '你把话说在前头。家里冷了一阵，后来他们请了阿姨。' },
      ] },
    { id: 'o_pet', age: 67, t: '养点什么', loc: 'home',
      cond: (g) => !hasGk(g) && !CN.pet(g) && lw(g) !== 'nursing',
      text: (g) => (CN.alone(g) ? '屋子太安静。楼下的老邻居说，养点活物，日子就有了响动。' : '白天家里没什么响动。楼下的老邻居说，养点活物，日子就热闹了。'),
      choices: [
        { t: '种一阳台的花', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('pet', 'plants'); }, res: '你买了十几个花盆。第一个月死了一半。' },
        { t: (g) => ((g.recall('tier') || 5) <= 3 ? '养一条狗（宠物店的小狗 ¥3,000，打针、狗粮一年 ¥4,000）' : '养一条狗（邻居家的狗崽，白给）'), dev: 10,
          fx: (g) => { if ((g.recall('tier') || 5) <= 3) CN.pay(g, 3000); CN.adoptPet(g, 'dog'); g.stat('健康', 2); g.stat('心情', 3); g.remember('pet', 'dog'); },
          res: (g) => '它叫' + CN.pet(g).name + '。每天早上六点，它叫你起来遛它。你没法再睡懒觉了。' },
        { t: '去救助站领一只没人要的老猫', dev: 15,
          fx: (g) => { CN.pay(g, 500); CN.adoptPet(g, 'cat', CN.pick(['老黄', '阿灰', '团团', '花姐'])); g.stat('心情', 3); g.remember('pet', 'cat'); },
          res: (g) => '救助站说它八岁了，没人愿意领。你交了 ¥500 的体检费，把' + CN.pet(g).name + '抱回了家。它头一个星期躲在床底下，第二个星期就睡到了你脚边。' },
        { t: '什么也不养，清净', dev: 10, fx: (g) => { g.remember('pet', 'none'); g.stat('心情', -1); }, res: '你说不想再操心任何东西。' },
      ] },

    /* ================= 68 岁：爱好 ================= */
    { id: 'o_hobby', age: 68, t: '找点事做',
      cond: (g) => g.recall('afterRetire') !== 'learn',
      text: '傍晚的广场上放着音乐，公园里有人下棋，社区门口贴着老年大学招生的海报。',
      choices: [
        { t: '跟着跳广场舞', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('人缘', 3); g.remember('hobby', 'dance'); }, res: '你站在最后一排，跟错了好几拍。第三天，领舞的大姐给你留了个位置。' },
        { t: '报老年大学', dev: 10, fx: (g) => { g.stat('学识', 3); g.remember('hobby', 'college'); }, res: '你选了书法。毛笔握在手里，比想象的重。' },
        { t: '跟团出去旅游', dev: 15, cond: (g) => liquid(g) >= 30000,
          fx: (g) => { spend(g, 12000); g.stat('心情', 5); g.remember('hobby', 'travel'); g.move('coast', '海边 · 旅游团'); }, res: () => '团费 ' + CN.fmt(paid) + '。你第一次看见海，导游催了三次，你才回车上。' },
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
        { t: '戴上健康手环，让 AI 管着', dev: 10, fx: (g) => { spend(g, 2000); g.stat('健康', 2); g.remember('chronic', 'ai'); stayHome(g); }, res: '手环 ¥2,000。一到饭点它就提醒你少吃一口。你骂了它几回，它照样提醒。' },
        { t: '不当回事，该吃吃该喝喝', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('chronic', 'ignore'); stayHome(g); }, res: '你说活到这个岁数，想吃点什么还要看指标，那多没意思。' },
      ] },

    /* ================= 70 岁 ================= */
    { id: 'o_seventy', age: 70, t: '七十大寿', auto: true,
      fx: (g) => { stayHome(g); g.stat('心情', 2); },
      text: (g) => {
        const bits = [];
        if (hasSp(g)) bits.push(spName(g) + '给你煮了一碗长寿面');
        if (hasGk(g)) bits.push(CN.livesWith(g, gkIds(g)[0]) ? '孙辈趴在桌边，抢着吹蜡烛' : '孙辈在视频里给你唱了生日歌');
        else if (hasKid(g)) bits.push(kidName(g) + '订了一个蛋糕');
        if (lw(g) === 'nursing') bits.push('养老社区给这个月过生日的人一起办了一场');
        if (!bits.length) bits.push('楼下的老邻居拎来一块小蛋糕，你们俩插了一根蜡烛');
        return '七十岁生日。' + bits.join('，') + '。';
      } },
    { id: 'o_rehire_end', age: 70, t: '交了工牌', auto: true,
      cond: (g) => g.recall('afterRetire') === 'rehire',
      fx: (g) => { paid = (Number(g.recall('rehirePay')) || 2500) * 12 * 5; CN.earn(g, paid); g.info('职业', '退休'); },
      text: () => '七十岁，你把顾问的工牌也交了。返聘这几年又多挣了 ' + CN.fmt(paid) + '。最后一天，年轻人凑钱给你买了一束花。' },
    { id: 'o_odd_end', age: 70, t: '不干了', auto: true,
      cond: (g) => g.recall('afterRetire') === 'odd',
      fx: (g) => { paid = 2000 * 12 * 5; CN.earn(g, paid); g.info('职业', '退休'); g.stat('心情', 2); },
      text: () => '七十岁，你把零活辞了。这几年零零碎碎挣了 ' + CN.fmt(paid) + '。最后一天，常来的几个人跟你说，以后常回来坐坐。' },

    /* ================= 71 岁：老伴生病，或者老朋友 ================= */
    { id: 'o_sp_sick', age: 71, t: '老伴病了', loc: 'hospital',
      cond: (g) => hasSp(g),
      text: (g) => spName(g) + '半夜起来上厕所，摔在了卫生间。查出来是轻度中风，往后要人照顾。',
      choices: [
        { t: '我自己伺候', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('人缘', 3); g.remember('spCare', 'self'); stayHome(g); }, res: '你学会了翻身、擦洗、喂饭。夜里每隔两小时醒一次，成了习惯。' },
        { t: '请护工或者陪护机器人', dev: 10, cond: (g) => liquid(g) >= 60000,
          fx: (g) => { spend(g, 50000); g.stat('心情', 1); g.remember('spCare', 'paid'); stayHome(g); }, res: () => '一年下来花了 ' + CN.fmt(paid) + '。陪护机器人比你力气大，也不嫌烦。你负责陪着说话。' },
        { t: '送去康复医院住一阵', dev: 10,
          fx: (g) => { spend(g, 15000); g.remember('spCare', 'rehab'); stayHome(g); }, res: () => (paid ? '自费 ' + CN.fmt(paid) + '。' : '医保报了大头。') + '你每天坐公交去送饭，一来一回两个钟头。' },
        { t: '打电话叫孩子回来', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', -1); g.remember('spCare', 'kids'); stayHome(g); }, res: (g) => kidName(g) + '请了长假回来。一个月后，又回去上班了。' },
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
        const n = spName(g);
        if (c === 'self') return alive ? '你伺候' + n + '两年了。有天你喂完饭，' + n + '拉着你的手说，辛苦你了。这是两年里说得最清楚的一句话。' : '你伺候了一场，人还是走了。你把那个七格药盒收进了抽屉。';
        if (c === 'paid') return alive ? '陪护机器人记住了' + n + '爱听的戏。你们俩靠在床头听，一听一下午。' : '机器人被收回去那天，你在门口站了很久。';
        if (c === 'rehab') return alive ? n + '从康复医院出来，能拄着拐走到楼下了。你们在长椅上坐着，看小孩子放风筝。' : '康复医院的护士给你寄来一张卡片，说' + n + '在那儿的时候，天天念叨你。';
        return hasKid(g) ? kidName(g) + '每个周末都打视频回来，问爸妈今天怎么样。你总说挺好。' : '那一场病过去了。你们俩说起那阵子，都说多亏了孩子。';
      } },
    { id: 'o_reunion_echo', age: 73, t: '同学', auto: true,
      cond: (g) => !!g.recall('reunion'),
      text: (g) => (g.recall('reunion') === 'went' ? '聚会以后，群里热闹了一阵。几个住得近的老同学，每个月约着喝一回早茶。' : '你没去的那次聚会，后来有人把合影发到群里。你放大了看，一个一个认，认出来七八个。') },

    /* ================= 72 岁 ================= */
    { id: 'o_robot_era', age: 72, t: '家里的机器人', auto: true,
      fx: (g) => { if (liquid(g) >= 60000 && lw(g) !== 'nursing') { spend(g, 30000); g.remember('robotBuy', true); g.stat('健康', 2); } },
      text: (g) => {
        if (lw(g) === 'nursing') return '养老院添了几台机器人，会推轮椅、会陪人下棋。你下赢过它一回，高兴了一整天。';
        if (g.recall('robotBuy')) return '你花 ' + CN.fmt(30000) + ' 买了一台做家务的机器人，会做饭、会拖地、会在你忘了吃药时念叨。你给它起了个小名。';
        return '社区给高龄老人配了一台公用的陪护机器人，一个星期来你家两次。它每次走的时候都说：“下周见。”';
      } },
    { id: 'o_work_stop', age: 72, t: '歇了', auto: true,
      cond: (g) => g.recall('afterRetire') === 'work',
      fx: (g) => { CN.earn(g, g.recall('preJob') === 'farmer' ? 50000 : 120000); g.info('职业', '退休'); g.stat('心情', 2); },
      text: (g) => '七十二岁，你终于把活儿停了。这几年又挣了 ' + CN.fmt(g.recall('preJob') === 'farmer' ? 50000 : 120000) + '，够你踏踏实实歇着。' + (g.recall('preJob') === 'farmer' ? '你把锄头挂在墙上，擦得锃亮。' : '你把接单的软件删了，手机一下子安静了。') },
    { id: 'o_pet_echo', age: 72, t: '活物', auto: true,
      cond: (g) => !!g.recall('pet'),
      fx: (g) => { if (g.recall('pet') === 'dog') g.stat('健康', 2); },
      text: (g) => {
        const p = g.recall('pet');
        if (p === 'dog') return '那条狗老了，你也老了。你们遛弯的速度刚好一样。';
        if (p === 'cat') return CN.pet(g) ? '那只老猫每天下午趴在窗台上晒太阳。你看报纸，它看你。' : '那只老猫陪了你几年，走的那天是个晴天。你把它的垫子洗干净，收进了柜子。';
        if (p === 'plants') return '阳台上的花活下来的那一半，今年开得特别好。楼下的人抬头看，问你怎么养的。';
        return '你说不养东西清净。可是有天下午，你对着窗台说了半天话。';
      } },
    { id: 'o_gk2', age: 72, t: '又一个孙辈', auto: true,
      cond: (g) => JY.byId.k2 && g.alive('k2') && g.ageOf('k2') >= 25 && (g.recall('grandkids') || 0) < 2,
      fx: (g) => { if (g.rnd() < 0.6) { addGrandkid(g, 'k2'); g.stat('心情', 4); } else g.remember('gk2No', true); },
      text: (g) => (g.recall('gk2No') ? CN.who(g, 'k2', true) + '还没成家。你说不急，心里有点急。' : CN.who(g, 'k2', true) + '也有孩子了。全家凑齐拍了张合影，你坐在正中间。') },

    /* ================= 73 岁：骗子 ================= */
    { id: 'o_scam', age: 73, t: '一通电话',
      text: '电话那头的人很热情，叫你“叔叔阿姨”，说有个讲座免费送鸡蛋，还能领一台按摩椅。',
      choices: [
        { t: '挂掉，告诉孩子', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: '孩子在电话里夸了你。你有点得意。' },
        { t: '挂掉，告诉社区', canon: true, cond: (g) => !hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: '社区的小姑娘把你的事讲给楼里的老人听，说要向你学习。' },
        { t: '去领鸡蛋，别的不买', dev: 10, check: ['学识', 45], fx: (g) => { g.stat('心情', 2); g.remember('scam', 'eggs'); }, res: '你领了两盒鸡蛋，讲座讲到一半你就走了。',
          fail: { fx: (g) => { const x = Math.min(50000, Math.max(3000, round1k(CN.cash(g) * 0.2))); g.remember('scamLoss', spend(g, x)); g.remember('scam', 'cheated'); }, res: (g) => '你本来只想领鸡蛋。出门的时候，手里多了一箱“能降三高”的保健品，账户上少了 ' + CN.fmt(g.recall('scamLoss')) + '。', dev: 0 } },
        { t: '跟他聊聊，问问他的生活', dev: 20, fx: (g) => { g.stat('心情', 2); g.remember('scam', 'talked'); }, res: '你问他多大了，家是哪儿的。他愣了一下，挂了电话。' },
      ] },
    { id: 'o_gk_school', age: 73, t: '孙辈上学', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 6,
      fx: (g) => { if (liquid(g) >= 50000) { spend(g, 10000); g.remember('gkGift', true); } },
      text: (g) => (g.recall('gkGift') ? CN.who(g, gkIds(g)[0], true) + '上小学了。你包了一个 ' + CN.fmt(10000) + ' 的红包，说是买书包的，其实够买一百个书包。' : CN.who(g, gkIds(g)[0], true) + '上小学了。你连夜给书包缝了个名字，针脚歪歪扭扭的。') },

    /* ================= 74 岁：摔跤，或者运动会 ================= */
    { id: 'o_fall', age: 74, t: '摔了一跤', loc: 'hospital',
      cond: (g) => g.s('健康') < 48,
      text: '下雨天，你在小区门口滑了一下。片子出来，股骨颈骨折。',
      choices: [
        { t: '做手术，换关节', canon: true, fx: (g) => { spend(g, 30000); g.stat('健康', 5); g.remember('fall', 'surgery'); }, res: () => (paid ? '医保报了一半，自费 ' + CN.fmt(paid) + '。' : '医保报了一大半，剩下的' + '凑一凑也够了。') + '三个月后，你扶着助行器下了楼。' },
        { t: '保守治疗，躺着养', dev: 10, fx: (g) => { g.stat('健康', -6); g.remember('fall', 'rest'); }, res: '你在床上躺了半年。起来的时候，腿细了一圈。' },
        { t: '装一副外骨骼', dev: 20, cond: (g) => liquid(g) >= 150000, fx: (g) => { spend(g, 120000); g.stat('健康', 8); g.remember('fall', 'exo'); }, res: () => '医保不报，花了 ' + CN.fmt(paid) + '。外骨骼咔哒咔哒地响，你走得比摔之前还稳。' },
      ] },
    { id: 'o_sports', age: 74, t: '老年运动会',
      cond: (g) => g.s('健康') >= 48 && !g.recall('fall'),
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
        if (h === 'dance') return g.s('健康') >= 50 ? '跳了七年广场舞，你成了领舞。队里新来的人叫你老师。' : '跳了七年广场舞，你的膝盖开始抗议。你退到最后一排，跟着比划，照样开心。';
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
      cond: (g) => lw(g) !== 'nursing',
      text: (g) => {
        if (hasSp(g)) return '你和' + spName(g) + '都上了年纪。拧瓶盖、换灯泡、夜里起来，都得两个人商量着来。';
        if (CN.alone(g)) return '你开始觉得，有些事一个人做不动了。拧瓶盖，换灯泡，夜里起来。';
        return '白天家里人都出门了。有些事你一个人做不动了：拧瓶盖，换灯泡，弯腰捡东西。';
      },
      choices: [
        { t: '请一台能护理的陪护机器人', canon: true, fx: (g) => { spend(g, 40000); g.stat('健康', 3); g.remember('robot', 'home'); }, res: () => (paid >= 40000 ? '花了 ' + CN.fmt(paid) + '。' : '钱不够，社区补贴了一部分。') + '它会在你起夜时把灯打开，会在你说话时回话。' },
        { t: '住进养老院，每月 ¥5,000', dev: 15, cond: (g) => canNursing(g), fx: (g) => { toNursing(g); g.stat('人缘', 2); }, res: (g) => '你挑了一家离老房子不远的。窗户朝南。' + (hasSp(g) ? spName(g) + '跟你住一间。' : '') },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { toKids(g); }, res: '孩子把书房腾出来给你。你听见他们夫妻俩小声商量过。' },
        { t: '就这样过，不添麻烦', dev: 10, fx: (g) => { g.remember('robot', 'none'); g.stat('心情', 2); }, res: (g) => (lw(g) === 'kids' ? '你说你还能动。孩子在你屋里装了扶手和夜灯。' : '你说这屋子里的每样东西你都知道在哪儿。这就够了。') },
      ] },

    /* ================= 77 岁 ================= */
    { id: 'o_chronic_echo', age: 77, t: '老毛病', auto: true,
      cond: (g) => !!g.recall('chronic'),
      fx: (g) => { const c = g.recall('chronic'); if (c === 'ignore') { g.stat('健康', -8); spend(g, 40000); g.remember('heartBill', paid); } else if (c === 'ai') g.stat('健康', 3); else g.stat('健康', 2); },
      text: (g) => {
        const c = g.recall('chronic');
        if (c === 'ignore') return '那几个箭头，你一直没当回事。今年春天，你因为心梗进了一次医院，抢救了过来。' + (g.recall('heartBill') ? '自费 ' + CN.fmt(g.recall('heartBill')) + '。' : '') + '医生说，再晚半小时就难说了。';
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
        const hv = houseW(g), cash = liquid(g);
        const list = [];
        if (hv) list.push((g.recall('house') === 'hometown' ? '老家的一处房子' : '一套房子') + '，值 ' + CN.fmt(hv * 1e4));
        if (hv && debtW(g) > 0) list.push('房贷还剩 ' + CN.fmt(debtW(g) * 1e4));
        list.push(cash >= 1000 ? '存款 ' + CN.fmt(cash) : '存款几乎没有');
        if (!hv) list.push('没有自己的房子');
        return '你找人立遗嘱。律师把你的家底列成一张单子：' + list.join('，') + '。他问你，这些打算留给谁。';
      },
      choices: [
        { t: '孩子们平分', canon: true, cond: (g) => kidsN(g) >= 2, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: '你签了字，心里一块石头落了地。' },
        { t: '留给孩子', canon: true, cond: (g) => kidsN(g) === 1, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: '你签了字，心里一块石头落了地。' },
        { t: '都留给老伴', canon: true, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: '你说，先顾着活着的那个。' },
        { t: '留给兄弟姐妹家的孩子', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('will', 'kin'); }, res: '你想起他们小时候喊你的样子。律师写下了几个名字。' },
        { t: '留给这些年照看你的人', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && !((g.recall('sibs') || 0) > 0), fx: (g) => { g.remember('will', 'carer'); }, res: '你报了几个名字：楼下的邻居，社区的小姑娘。律师一个一个记下。' },
        { t: '先留给老伴，以后再给孩子', dev: 10, cond: (g) => hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: '你说，先顾着活着的那个。' },
        { t: '把房子卖了，钱留着自己花', dev: 25, cond: (g) => houseW(g) > 0,
          fx: (g) => { const x = Math.max(0, (houseW(g) - debtW(g)) * 1e4); CN.sellHouse(g); g.remember('willAmt', x); g.remember('will', 'sell'); g.stat('心情', 4); if (lw(g) === 'alone' || lw(g) === 'hometown') g.info('住处', '租的小房子'); },
          res: (g) => '房子卖了 ' + CN.fmt(g.recall('willAmt')) + '。律师抬头看了你一眼。你说，钱是给人花的。' + (lw(g) === 'alone' || lw(g) === 'hometown' ? '你租了一套带电梯的小房子，比原来那套好走。' : '') },
        { t: '钱留着自己花，不给谁留', dev: 20, cond: (g) => !houseW(g) && liquid(g) >= 50000, fx: (g) => { g.remember('will', 'spend'); g.stat('心情', 3); }, res: '律师合上本子。你说，花完了正好，谁也不用分。' },
        { t: '房子捐给老家的学校', dev: 35, cond: (g) => houseW(g) > 0, fx: (g) => { g.remember('will', 'donate'); g.remember('willAmt', 0); g.set('donatedHouse'); g.stat('心情', 3); }, res: '你想起小时候那间漏雨的教室。律师把“捐赠”两个字写得很工整。' },
        { t: '拿出一笔钱，捐给老家的学校', dev: 30, cond: (g) => !houseW(g) && liquid(g) >= 20000,
          fx: (g) => { g.remember('willAmt', spend(g, round1k(liquid(g) * 0.3))); g.remember('will', 'donate'); g.set('donatedHouse'); g.stat('心情', 3); }, res: (g) => '你当场转了 ' + CN.fmt(g.recall('willAmt')) + '。你想起小时候那间漏雨的教室。' },
        { t: '不立了，没什么可分的', dev: 10, cond: (g) => !houseW(g) && liquid(g) < 50000, fx: (g) => { g.remember('will', 'none'); }, res: '律师说，这样也行。你请他喝了杯茶，算是谢谢他跑一趟。' },
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
      cond: (g) => !!lw(g),
      fx: (g) => { const l = lw(g); if (l === 'kids') g.stat('人缘', 2); if (CN.alone(g) && g.recall('robot') === 'none') g.stat('心情', -1); stayHome(g); },
      text: (g) => {
        const l = lw(g);
        if (l === 'nursing') return '养老院里，你有了固定的牌搭子。每天下午三点，雷打不动。';
        if (l === 'kids') return '和孩子住了这些年，你学会了少说话。可是' + (g.recall('gkCare') === 'full' ? '孙辈放学回来，第一个喊的是你。' : '晚饭桌上，大家会问你今天怎么样。');
        if (l === 'hometown') return '回老家住了这些年，村里的路修好了，人却越来越少。你成了村里最常坐在门口的那个人。';
        if (g.recall('robot') === 'home') return '家里那台陪护机器人跟了你三年，它记得你所有的习惯，比你自己记得还清楚。';
        if (hasSp(g)) return '你和' + spName(g) + '守着老房子。一个耳朵背，一个眼睛花，凑在一起刚好过日子。';
        if (CN.alone(g)) return '一个人住，你给自己定了规矩：每天出门一次，跟一个人说话。';
        return '你' + CN.hhText(g) + '。每天早上谁先起床，谁就烧一壶水。';
      } },

    /* ================= 80 岁：老家 ================= */
    { id: 'o_back_home', age: 80, t: '回老家看看',
      cond: (g) => !atHometown(g),
      text: (g) => '你梦见了' + (g.recall('homeCap') || '老家') + '。醒来以后，那条路的样子一直在眼前。',
      choices: [
        { t: '让孩子视频连线，看一眼就好', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.remember('wentHome', 'video'); }, res: '镜头里的老房子换了门。你说，就是这儿。' },
        { t: '回去住一个月', dev: 10, fx: (g) => { g.remember('wentHome', 'month'); g.stat('心情', 6); g.stat('健康', -2); CN.goHome(g); }, res: (g) => (hasKid(g) ? kidName(g) + '请了假陪你回去。' : '老邻居家的孙子开车来接你。') + '你走了一遍小时候上学的路，比记忆里短得多。' },
        { t: '不回了，那边没人了', dev: 5, fx: (g) => { g.remember('wentHome', 'no'); g.stat('心情', -2); }, res: '你翻了个身，又睡着了。' },
      ] },
    { id: 'o_village_kids', age: 80, t: '村里的孩子',
      cond: (g) => atHometown(g),
      text: '暑假，村里留下来的几个孩子总在你家门口转。有一个问你，以前的人是怎么过日子的。',
      choices: [
        { t: '搬个小板凳，讲给他们听', dev: 15, fx: (g) => { g.remember('storyteller', true); g.set('oldStoryteller'); g.stat('心情', 5); g.stat('人缘', 3); }, res: '你讲了一下午，孩子们没一个走的。' },
        { t: '给他们拿点吃的，打发走', canon: true, fx: (g) => { g.remember('storyteller', false); g.stat('人缘', 1); }, res: '他们抓了糖就跑了。你在门口坐到天黑。' },
      ] },

    /* ================= 81 岁 ================= */
    { id: 'o_will_echo', age: 81, t: '遗嘱以后', auto: true,
      cond: (g) => !!g.recall('will'),
      fx: (g) => {
        const w = g.recall('will');
        if (w === 'sell') g.remember('willSpent', spend(g, Math.min(150000, (g.recall('willAmt') || 0) * 0.3)));
        else if (w === 'spend') g.remember('willSpent', spend(g, Math.min(100000, liquid(g) * 0.25)));
        g.stat('心情', 2);
      },
      text: (g) => {
        const w = g.recall('will');
        if (w === 'donate' && g.f('donatedHouse')) {
          if (g.recall('willAmt')) return '你捐的 ' + CN.fmt(g.recall('willAmt')) + ' 用上了。老家的学校来了一封信，说图书室盖好了，书架上贴着你的名字。你让人把信念了两遍。';
          return '老家学校的校长带着两个学生来看你。他们说，那套房子以后归学校，要拿它办一间图书室，门口挂你的名字。你让孩子们一人给你写一封信。';
        }
        if (w === 'sell') return '卖房的钱，这几年你花了 ' + CN.fmt(g.recall('willSpent')) + '，花在了几趟短途旅行、一个好护工和很多顿好饭上。你一点也不后悔。';
        if (w === 'spend') return '这几年你没亏待自己，花了 ' + CN.fmt(g.recall('willSpent')) + '：换了一张好床，配了一副好助听器，常请老邻居下馆子。';
        if (w === 'spouse') return hasSp(g) ? '遗嘱写的是留给老伴。签字那天，你们俩都没说话，后来一起去吃了碗面。' : '遗嘱写的是留给老伴。老伴先走了一步，你又去改了一回，改完在律师楼下坐了很久。';
        if (w === 'kin') return '侄子外甥知道了遗嘱的事，过年来得勤了些。你心里有数，红包照样包。';
        if (w === 'carer') return '楼下的邻居知道了遗嘱的事，红着眼说不要。你说，就当是谢谢这些年的饺子。';
        if (w === 'none') return '你没立遗嘱，也没人问。家里那点东西，你一样一样送给了喜欢它们的人。';
        return '遗嘱的事，孩子们知道了。' + (kidsN(g) >= 2 ? '有一阵子，几个孩子来得一样勤。' : '谁也没再提起。');
      } },
    { id: 'o_hometown_echo', age: 81, t: '老家', auto: true,
      cond: (g) => !!g.recall('wentHome') || g.recall('storyteller') != null,
      text: (g) => {
        if (g.f('oldStoryteller')) return '你讲的那些故事，有个孩子写进了作文，拿了县里的奖。他跑来给你看，奖状上有你的名字。';
        if (g.recall('storyteller') === false) return '那几个孩子放了学，还是常在你门口玩。你每回都多备一把糖。';
        const w = g.recall('wentHome');
        if (w === 'month') return '那一个月，你在老家认出了小时候的同桌。他也老了，坐在同一棵树下。你们约好明年再见。';
        if (w === 'video') return '那次视频以后，孩子把老房子的照片打印出来，挂在你床头。';
        return '老家是什么样，你已经只能靠想了。想着想着，嘴里就哼起了小时候的歌。';
      } },
    { id: 'o_icu_talk', age: 82, t: '那一天到了怎么办', loc: 'hospital',
      text: '社区医生来做预立医嘱的登记，问你：要是哪天不行了，抢不抢救，插不插管。',
      choices: [
        { t: '能救就救，插管也要救', canon: true, fx: (g) => { g.remember('icu', 'yes'); stayHome(g); }, res: '你说你还想多看几年。医生在表上打了一个勾。' },
        { t: '不插管，不进 ICU，不受那个罪', dev: 20, fx: (g) => { g.remember('icu', 'no'); g.stat('心情', 3); stayHome(g); }, res: '你签字的时候手很稳。' },
        { t: '交给孩子们决定', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: '你说，到时候他们比你清楚。' },
        { t: '交给老伴决定', dev: 5, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: (g) => '你说，到时候听' + spName(g) + '的。' },
      ] },

    /* ================= 83 岁 ================= */
    { id: 'o_kids_visit', age: 83, t: '谁常来', auto: true,
      cond: (g) => hasKid(g),
      fx: (g) => { if (lw(g) === 'kids' || g.s('人缘') >= 60) g.stat('心情', 3); else g.stat('心情', -1); },
      text: (g) => {
        const k = CN.who(g, kid1(g), true);
        if (CN.livesWith(g, kid1(g))) return kidName(g) + '每天回来，先进你屋看一眼。你装作睡着了，等门关上才笑。';
        if (g.recall('icu') === 'kids') return k + '知道了预立医嘱的事，那个周末专门回来，陪你坐了一下午。两个人谁也没提。';
        if (g.s('人缘') >= 60) return k + '每个周末都回来，带着吃的，走的时候冰箱是满的。';
        if (g.recall('kidCity') === '国外') return k + '在国外，每天晚上八点准时打视频。时差你算不清，可是八点你记得。';
        return k + '工作忙，一个月回来一次。你把攒了一个月的话，在饭桌上一口气说完了。';
      } },
    { id: 'o_gk_teen', age: 83, t: '孙辈', auto: true,
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (g.recall('gkCare') === 'full' ? '放了暑假，第一件事是来看你，给你讲学校里的事。讲到一半，你已经睡着了，' + '孩子给你盖了条毯子。' : '教你用新出的手机。你学得慢，孩子教得也不急。') },

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
    { id: 'o_hobby_late', age: 85, t: '老了的爱好', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return '毛笔字你还在写，只是字越写越大。一张纸写四个字，挂在墙上，来的人都说好。';
        if (w === 'code') return '你写的那些小程序，早有年轻人接手了。他们每次更新，还在说明里写一句谢谢你。';
        if (w === 'music') return '二胡拉不动整首了。你拉一段，歇一会儿，再拉一段。';
        const h = g.recall('hobby');
        if (h === 'dance') return '以前一起跳舞的' + (isMale(g) ? '老伙计' : '老姐妹') + '，如今剩下三四个。傍晚你们坐在场边的长椅上，听着音乐打拍子。';
        if (h === 'college') return '老年大学你不去了，同学们还常来家里坐。一屋子白头发，说的都是几十年前的事。';
        if (h === 'travel') return '你出不了远门了。你把这些年的旅行照片一张张翻，翻到哪儿，就讲哪儿。';
        return '短视频你还在看。字太小，就让机器人念给你听。';
      } },

    /* ================= 86 岁：寿宴 ================= */
    { id: 'o_birthday', age: 86, t: '大寿',
      text: (g) => famWord(g) + '说，八十六了，该好好过个生日。',
      choices: [
        { t: '大办一场，把亲戚朋友都请来', canon: true, fx: (g) => { spend(g, 16000); g.remember('bday', 'big'); g.stat('人缘', 4); g.stat('健康', -2); }, res: '摆了八桌。很多人你叫不出名字，可是他们都叫得出你。' },
        { t: '几个亲近的人吃顿饭就好', dev: 5, fx: (g) => { g.remember('bday', 'small'); g.stat('心情', 3); }, res: '一桌人，你吃了半碗面，看了一晚上他们。' },
        { t: '谁也不叫，去看一次海', dev: 25, cond: (g) => g.s('健康') >= 30, fx: (g) => { spend(g, 6000); g.remember('bday', 'sea'); g.stat('心情', 6); g.move('coast', '海边'); }, res: (g) => (family(g) ? '家里人推着轮椅陪你去了。' : '养老服务站的小伙子陪你去了。') + '你在沙滩上坐了一下午。浪一层一层地上来，又下去。' },
      ] },
    { id: 'o_memory_echo', age: 87, t: '忘了，记着', auto: true,
      cond: (g) => !!g.recall('memory'),
      fx: (g) => { const m = g.recall('memory'); if (m === 'diary') g.stat('心情', 3); stayHome(g); },
      text: (g) => {
        const m = g.recall('memory');
        if (m === 'diary') return '日记写满了三本。有些事你忘了，翻开本子，它们又回来了。';
        if (m === 'ai') return 'AI 替你记着所有人的生日。它提醒你给' + (family(g) ? '家里人' : '老朋友') + '打电话的时候，你总是假装是自己想起来的。';
        return '药一直吃着。你还认得身边的每一个人，这就够了。';
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
      text: (g) => '你跟' + famWord(g) + '说，趁还能出门，想再去一个地方。',
      choices: [
        { t: '哪儿也不去，在家挺好', canon: true, fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('心情', 1); }, res: '你说说而已。窗外的树，你也看了好些年了。' },
        { t: '回出生的地方', dev: 15, cond: (g) => !atHometown(g), fx: (g) => { g.remember('lastTrip', 'birth'); g.stat('心情', 5); g.stat('健康', -3); CN.goHome(g); }, res: '有人推着轮椅陪你。你停在出生的那条街上，已经认不出来了。可是风的味道没变。' },
        { t: '去年轻时打拼的那座城市', dev: 15, cond: (g) => !!g.recall('workCity'), fx: (g) => { g.remember('lastTrip', 'work'); g.stat('心情', 4); g.stat('健康', -3); g.move('metro', g.recall('workCity')); }, res: '你坐在当年住过的楼下。楼还在，窗户换了。' },
        { t: '去一个从没去过的地方', dev: 30, check: ['健康', 35], fx: (g) => { g.remember('lastTrip', 'new'); g.stat('心情', 7); g.stat('健康', -4); g.move('road', '路上'); }, res: (g) => (family(g) ? '家里人轮流推着轮椅。' : '你跟着一个有医生随行的老年团。') + '八十八岁，你第一次看见雪山。',
          fail: { fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('健康', -3); }, res: '走到半路，身体不答应了。你在车上睡着了，醒来已经在回家的路上。', dev: 0 } },
      ] },
    { id: 'o_gk_grown', age: 89, t: '孙辈长大了', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 20,
      fx: (g) => { if (g.recall('gkCare') === 'full') g.stat('心情', 4); },
      text: (g) => {
        const c = g.recall('gkCare');
        const id = gkIds(g)[0];
        const n = g.name(id);
        if (c === 'full') return CN.who(g, id, true) + '大学毕业了。毕业照里，' + n + '把你也拉进了镜头，说是你带大的。';
        if (c === 'none') return CN.who(g, id, true) + '大学毕业了。你们见面不多，每次见，' + n + '都客客气气地叫你。';
        return CN.who(g, id, true) + '长大了。小时候你接送过的那条路，' + n + '还记得。';
      } },
    { id: 'o_ninety', age: 90, t: '九十', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => {
        const p = partner(g);
        if (p === 'sp') { const y = g.since('spouse'); return '九十岁。你和' + spName(g) + '还在一起' + (y >= 55 ? '，结婚 ' + y + ' 年了。社区上门来给你们拍了张' + (y >= 60 ? '钻石婚' : '结婚纪念') + '的照片。' : '。社区上门来给你们拍了张合影。') + '你们俩谁也不肯先看镜头。'; }
        if (p === 'sp2') return '九十岁。晚年搭伴的' + spName(g) + '给你剥了一碗花生，一颗一颗放在你手心里。';
        return '九十岁。和你同一年出生的那些人，已经走了一大半。' + (hasKid(g) ? kidName(g) + '也满头白发了，' + '给你切蛋糕的时候手有点抖。' : '社区的人给你送来一碗长寿面，还冒着热气。');
      } },
    { id: 'o_letter', age: 91, t: '留几句话',
      text: (g) => (family(g) ? '你想给家里人留几句话。' : '你想给后来的人留几句话。'),
      choices: [
        { t: '写信，一人一封', canon: true, fx: (g) => { g.remember('legacy', 'letters'); g.stat('心情', 3); }, res: '你的字抖得厉害，一封信写了三天。' },
        { t: '对着手机录一段视频', dev: 10, fx: (g) => { g.remember('legacy', 'video'); g.stat('心情', 2); }, res: '录了十几遍。最后那一遍，你笑着说了句“就这样吧”。' },
        { t: '不留了，该说的都说过', dev: 10, fx: (g) => { g.remember('legacy', 'none'); }, res: '你说，话说多了，记得的人反而累。' },
      ] },

    /* ================= 92–100 岁：慢下来的日子 ================= */
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
    { id: 'o_92_day', age: 92, t: '一天', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        if (lw(g) === 'nursing') return '养老院的一天从量血压开始。上午晒太阳，下午听人读报，晚上七点熄灯。' + (hasSp(g) ? spName(g) + '的床就挨着你的，夜里伸手就够得着。' : '护工小姑娘叫你“老宝贝”，你假装不高兴。');
        if (lw(g) === 'kids' || hasKid(g) && CN.livesWith(g, kid1(g))) return '早上' + kidName(g) + '给你泡好一杯麦片，出门前把电视调到你爱看的台。你看着看着就睡了，醒来正好吃午饭。';
        if (hasSp(g)) return '你和' + spName(g) + '每天的事就是互相提醒吃药。谁先忘了，另一个就得意一整天。';
        if (g.recall('robot') === 'home' || g.recall('robotBuy')) return '机器人每天七点拉开窗帘，跟你报天气。你回它一句“知道了”，一天就开始了。';
        return '社区的网格员每天上午来敲一次门。你早早就坐在门口等着，好像等的是客人。';
      } },
    { id: 'o_legacy_echo', age: 93, t: '后来的人', auto: true,
      cond: (g) => !!g.recall('legacy'),
      text: (g) => {
        const l = g.recall('legacy');
        if (l === 'letters') return '你写的信，有人当场拆开读了，有人说要留到以后。';
        if (l === 'video') return hasKid(g) ? '那段视频，家里人存在了好几个地方。孩子说，想你的时候就看看。' : '那段视频，' + (hasSp(g) ? spName(g) + '看了一遍又一遍。' : '社区的人帮你存进了“老人口述”的档案里。');
        return '你没留什么话。可是身边的人说话时，常学着你的口气。';
      } },
    { id: 'o_93_money', age: 93, t: '账', auto: true,
      fx: (g) => { if (liquid(g) >= 100000 && lw(g) !== 'nursing') { spend(g, 60000); g.remember('oldNanny', true); } },
      text: (g) => {
        const m = '每月退休金 ' + CN.fmt(PEN[g.recall('pension')] / 12) + '，存款还有 ' + CN.fmt(liquid(g)) + '。';
        if (g.recall('oldNanny')) return '你请了一个住家保姆，一年 ' + CN.fmt(60000) + '。她做的菜偏咸，你没说，她也慢慢改淡了。' + m;
        if (lw(g) === 'nursing') return '养老院的账每月一结。' + m + '你说够花，护工说你是院里最会算账的人。';
        if (g.recall('kidHelp')) return '孩子每个月往你卡里打钱，你一分没动，攒着给孙辈。' + m;
        return '你还是自己管钱，一笔一笔记在本子上。' + m + '够吃够用。';
      } },
    { id: 'o_last_wish', age: 94, t: '想要什么',
      text: (g) => famWord(g) + '问你，现在最想要什么。',
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
        if (w === 'food') return '那顿饭以后，身边的人学会了做。每次端上来，你都说比上回像了。';
        return '你说什么都不要。身边的人还是每天多陪你坐一会儿。';
      } },
    { id: 'o_95_spring', age: 95, t: '春天', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.s('健康') >= 25 ? '九十五岁的春天，你让人扶着在楼下走了二十步。玉兰开了，你站着看了很久。' : '九十五岁的春天，你下不了楼了。' + (family(g) ? '家里人' : '护工') + '折了一枝玉兰插在你床头的瓶子里。') },
    { id: 'o_slow', age: 96, t: '慢', auto: true,
      text: (g) => '你说话越来越慢，睡得越来越多。醒来的时候，常常要想一想今年是哪一年。' + (g.recall('memory') === 'diary' ? '床头那几本日记，有人每天念一页给你听。' : (hasSp(g) ? spName(g) + '就告诉你，又过了一年。' : '可是窗外的鸟叫，你一听就知道是早上。')) },
    { id: 'o_great_gk', age: 97, t: '四代人', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28,
      fx: (g) => g.stat('心情', 5),
      text: (g) => CN.who(g, gkIds(g)[0], true) + '抱着刚满月的孩子来看你。你成了太' + (isMale(g) ? '爷爷' : '奶奶') + '。四代人挤在一张照片里，你在最中间，手里攥着那只小脚。' },
    { id: 'o_97_sun', age: 97, t: '晒太阳', auto: true,
      cond: (g) => !(hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28),
      text: (g) => company(g) + '。午后的太阳照进来，你把手伸到光里，看了好一会儿。' },
    { id: 'o_98', age: 98, t: '九十八', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        const who = hasKid(g) ? kidName(g) + '在蛋糕上插了两根数字蜡烛，9 和 8。' : '社区送来一个小蛋糕，插着 9 和 8 两根数字蜡烛。';
        return '九十八岁生日。' + who + (g.s('健康') >= 20 ? '你一口气吹灭了，大家都鼓掌。' : '你吹了两回，旁边的人帮你吹了第三口。');
      } },
    { id: 'o_99', age: 99, t: '梦', auto: true,
      text: (g) => '你开始分不清梦和醒。梦里你还' + (g.recall('hukou') === 'rural' ? '在村口的河边，水很凉' : '在小时候住的楼下，有人喊你回家吃饭') + '。醒来，' + (CN.alone(g) ? '屋里的灯亮着，' + '机器人在床边守着。' : '有人握着你的手。') },
    { id: 'o_hundred', age: 100, t: '一百岁', auto: true,
      fx: (g) => g.stat('心情', 5),
      text: (g) => '一百岁。社区送来了一块“百岁寿星”的牌子，记者来拍照。你问他们，今天是什么好日子。' + (hasGk(g) ? '孙辈们抢着跟你合影。' : hasKid(g) ? kidName(g) + '在旁边替你回答。' : '护工替你把牌子挂在了床头。') },
  ]);

  /* ---------- 一百岁以后：每年一句 ---------- */
  const LATE = [
    (g) => '一百零一岁。你每天醒来，先看一眼窗外，再看一眼床头的照片。',
    (g) => '一百零二岁。' + company(g) + '。有人给你读新闻，你听一会儿，说：“还是老样子。”',
    (g) => '一百零三岁。你还记得自己的名字，也记得' + (hasKid(g) ? kidName(g) + '小时候的样子。' : '小时候家门口那棵树。'),
    (g) => '一百零四岁。你吃得很少，一碗粥能喝一上午。喝完了，你会说一声“好”。',
    (g) => '一百零五岁。来看你的人换了一茬又一茬。他们说，你是这一带年纪最大的人。',
    (g) => '一百零六岁。你大多数时候在睡。醒着的时候，你在笑。',
    (g) => '一百零七岁。窗外的鸟换了好几代了。你还认得它们的叫声。',
    (g) => '一百零八岁。有人问你长寿的秘诀，你想了很久，说：“吃饭，睡觉。”',
  ];
  JY.addLifeNodes(LATE.map((f, i) => ({ id: 'o_late_' + (101 + i), age: 101 + i, t: '又一年', auto: true, text: f })));

  /* ---------- 老伴走了、最后一次住院：哪一年发生不一定，用必定触发的意外 ---------- */
  JY.addEncounters([
    { id: 'e_o_widowed', y: [2026, 2200], minAge: 65, t: '一个人了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '丧偶'); g.stat('心情', -12); g.stat('健康', -3); },
      text: (g) => {
        const n = JY.byId.sp ? g.name('sp') : '老伴';
        if (lw(g) === 'nursing') return n + '走了以后，养老院那间屋里空了一张床。你还是每天把' + n + '的杯子洗干净。';
        if (CN.alone(g)) return n + '走了以后，你还是每天做两个人的饭。做好了，才想起来。';
        return n + '走了以后，你吃饭时还是给' + n + '留一个位子。家里人看见了，谁也没说。';
      } },
    { id: 'e_o_after_widow', y: [2026, 2200], minAge: 66, t: '往后的日子', always: true,
      cond: (g) => g.recall('love') === 'widowed' && g.since('love') >= 1 && freeYear(g) && g.s('健康') > 22,
      text: (g) => {
        if (g.since('love') >= 5) return (CN.alone(g) ? '你一个人过了好些年。' : '老伴走了好些年了。') + '有人给你介绍一个老伴，说两个人搭个伴，有个照应。';
        return '老伴走了一年多。' + (hasKid(g) ? '孩子们轮流来劝你' : '老邻居们来劝你') + '，往后的日子，得有个打算。';
      },
      choices: [
        { t: '就这样过', canon: true, fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', 1); }, res: '你把老伴的照片擦干净，摆在饭桌上。' },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { g.remember('afterWidow', 'kids'); toKids(g); }, res: '你只带走了一个相框和一件旧毛衣。' },
        { t: '住进养老院，图个热闹', dev: 15, cond: (g) => !hasKid(g) && lw(g) !== 'nursing' && canNursing(g), fx: (g) => { g.remember('afterWidow', 'nursing'); toNursing(g); }, res: '你挑了一家有花园的。第一天晚饭，同桌的老太太就问你会不会打牌。' },
        { t: '再找个老伴', dev: 30, check: ['人缘', 50],
          fx: (g) => { g.remember('remarried', true); g.remember('afterWidow', 'remarry'); const p = CN.person({ id: 'sp2', sex: isMale(g) ? '女' : '男', born: g.Y - g.age + CN.ri(-4, 4), origin: '老年大学认识的' }); g.spawn(p); g.rel('老伴', 'sp2', '晚年再婚'); CN.liveWith(g, ['sp2']); g.info('婚姻', '再婚'); g.stat('心情', 8); },
          res: '你们没办酒席，只请两边的孩子吃了顿饭。有人背后说闲话，你装作没听见。',
          fail: { fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', -2); }, res: '见了两回，对方的孩子不同意。这事就散了。你们后来还常在公园碰见，点点头。', dev: 0 } },
      ] },
    { id: 'e_o_remarry_echo', y: [2026, 2200], minAge: 68, t: '搭伴过日子', auto: true, always: true,
      cond: (g) => g.recall('remarried') === true && g.since('remarried') >= 2,
      fx: (g) => g.stat('健康', 2),
      text: (g) => (JY.byId.sp2 && g.alive('sp2') ? '再婚两年，你们俩每天一起买菜、散步，为放多少盐吵嘴。孩子们说，你气色好多了。' : '晚年找的那个伴，陪了你没几年，也走了。你不后悔。') },
    { id: 'e_o_alone_echo', y: [2026, 2200], minAge: 68, t: '这几年', auto: true, always: true,
      cond: (g) => !!g.recall('afterWidow') && g.recall('afterWidow') !== 'remarry' && g.since('afterWidow') >= 3,
      text: (g) => {
        const a = g.recall('afterWidow');
        if (a === 'kids') return '在孩子家住久了，你的东西也一点点多起来。那件旧毛衣，你一直没舍得穿。';
        if (a === 'nursing' || lw(g) === 'nursing') return '养老院里，你有了几个老伙伴。谁过生日，大家就凑钱买一个小蛋糕。';
        if (CN.alone(g)) return '一个人过了几年，你学会了跟照片说话。说完今天吃了什么，就关灯睡觉。';
        return '老伴走了几年，你' + CN.hhText(g) + '。你每天吃完饭，跟照片说一声“吃过了”。';
      } },
    { id: 'e_o_last_hospital', y: [2026, 2200], minAge: 78, t: '又进了医院', loc: 'hospital', always: true,
      cond: (g) => g.s('健康') <= 22 && freeYear(g),
      text: (g) => {
        const i = g.recall('icu');
        const pre = i === 'no' ? '你早就签过字：不插管，不进 ICU。' : i === 'yes' ? '你早就说过：能救就救。' : i === 'kids' ? '你说过，到时候让家里人决定。' : '';
        return '你又一次被送进了医院。医生把' + (family(g) ? '家里人' : '社区的人') + '叫到走廊上。' + pre;
      },
      choices: [
        { t: '进 ICU，插管，接着治', canon: true, fx: (g) => { spend(g, 60000); g.stat('健康', 14); g.stat('心情', -8); g.remember('lastCall', 'icu'); }, res: () => '你在 ICU 里躺了十几天，又被推了出来。' + (paid ? '医保报完，自费 ' + CN.fmt(paid) + '。' : '医保和救助兜了底。') },
        { t: '回家，不受这个罪', dev: 20, fatal: true, fx: (g) => { g.die((g.recall('icu') === 'no' ? '照着自己当年签的字，' : '') + '在家里，在睡梦中离世'); }, res: (g) => (family(g) ? '家里人把你接回了家。' : '社区的人把你送回了家。') + '那天晚上，屋里的灯一直开着。' },
        { t: '听孩子们的', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('lastCall', 'kids'); if (g.rnd() < 0.5) g.stat('健康', 12); else g.die('在医院里，家人陪在身边离世'); }, res: '孩子们商量了一夜。' },
      ] },
    { id: 'e_o_after_icu', y: [2026, 2200], minAge: 78, t: '出院以后', auto: true, always: true,
      cond: (g) => !!g.recall('lastCall') && g.since('lastCall') >= 1,
      text: (g) => (g.recall('lastCall') === 'icu' ? '从 ICU 出来以后，你瘦了一大圈。你说，多活的每一天都是赚的。' : '孩子们替你拿了主意。你后来跟他们说，你们拿得对。') },
  ]);

  /* 新增的状态键名（老年，写进这一世的记忆）：
   * preJob 退休前的职业；pension 'high'|'mid'|'low'|'savings'；afterRetire 'rest'|'rehire'|'learn'|'work'|'handover'|'odd'（没人返聘，打点零工，七十岁歇）；rehirePay 返聘每月多挣的（元，七十岁结账）
   * 返聘只给有本事的人（ableToRehire：学识、事业够高，医生老师护士技术员，有手艺的工人，中年当过顾问或评过专家），其他人走 o_retire_plain
   * liveWith 'kids'|'alone'（守着自己家，可能和老伴住）|'hometown'|'nursing'；kidCity 孩子住的城市；grandkids 孙辈个数（孙辈 id gk1、gk2）
   * gkCare 'full'|'part'|'paid'|'none'；gkGift 给孙辈包过大红包；gk2No 二孩没要孩子；pet 'plants'|'dog'|'cat'|'none'（六十七岁养点什么，宠物用 CN.adoptPet）；hobby；learnWhat；chronic 'control'|'ai'|'ignore'
   * heartBill 心梗自费多少（元）；spCare 'self'|'paid'|'rehab'|'kids'；reunion；robotBuy 买了家务机器人
   * scam；scamLoss 被骗多少（元）；fall；sports；robot 'home'|'none'
   * will 'kids'|'spouse'|'kin'|'carer'|'sell'|'spend'|'donate'|'none'；willAmt 卖房所得或捐出的钱（元，捐房为 0）；willSpent 81 岁时花掉多少
   * wentHome；storyteller；icu 'yes'|'no'|'kids'；memory；bday；lastTrip；legacy；oldNanny 九十三岁请了住家保姆；lastWish
   * afterWidow 'alone'|'kids'|'nursing'|'remarry'；remarried（晚年再婚，老伴 id sp2，和你同住）；lastCall
   */
  // 退休以后的日子（读 retired）
  JY.addFlavor('any', [
    { t: '退休以后，你每天醒得比上班时还早。', cond: (g) => g.recall('retired') === true && g.age < 80 },
    { t: '你翻出以前上班的工牌看了一会儿，又放回抽屉。', cond: (g) => g.recall('retired') === true },
    { t: '菜市场的摊主给你多抓了一把葱，说老主顾了。', cond: (g) => g.recall('retired') === true && g.age < 85 && lw(g) !== 'nursing' },
    { t: '你在楼下的长椅上坐了一下午，和路过的每只猫打了招呼。', cond: (g) => g.recall('retired') === true && g.age >= 75 },
    { t: '天气好，有人推你出去转了一圈。路边的月季开得正旺。', cond: (g) => g.recall('retired') === true && g.age >= 88 },
    { t: '你把年轻时的照片翻出来，指着其中一张说，这个人是我。', cond: (g) => g.recall('retired') === true && g.age >= 85 },
  ]);
})();

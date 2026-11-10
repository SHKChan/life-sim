/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const famWord = (g) => (family(g) ? '家裡人' : '社群的志願者');
  // 返聘：只请有真本事、身体也还行的人。学识、事业够高，或者是医生、老师、技术、有手艺的工人
  const SKILLED = ['doctor', 'teacher', 'nurse', 'tech'];
  const ableToRehire = (g) => g.s('健康') >= 50 && (g.s('学识') >= 72 || g.s('事业') >= 65
    || (SKILLED.includes(g.recall('preJob')) && g.s('学识') >= 55) || (g.recall('preJob') === 'worker' && !!g.recall('skill'))
    || g.recall('consult') === 'part' || g.recall('ladder40') === 'expert');
  const rehireMonth = (g) => round1k(Math.max(3000, (CN.jobPay ? CN.jobPay(g, g.recall('preJob') || 'office', null) : 8000) * 0.5));
  const REHIRE = { doctor: '原來的醫院請你回去坐診，一週三個半天。', teacher: '學校缺有經驗的老教師，請你回去帶新老師。', nurse: '醫院的護理部請你回去帶實習生。',
    tech: '原來的公司有一套老系統，只有你摸得透，請你回去當顧問。', worker: '廠裡新上的裝置出了毛病，老師傅裡只有你會修，請你回去帶徒弟。',
    civil: '單位請你回去幫著帶新人、整理多年的材料。', soldier: '武裝部請你回去給新兵講課。' };
  // 能不能住得起养老院（一年约 ¥6 万）
  const canNursing = (g) => liquid(g) >= 150000 || CN.income(g) >= 50000 || hasKid(g);
  // 现在住哪儿，场景跟着走
  const stayHome = (g) => {
    const l = lw(g);
    if (l === 'hometown') CN.goHome(g);
    else if (l === 'nursing') g.move('home', '養老院');
    else if (l === 'kids') g.move('home', (g.recall('kidCity') || '孩子那邊') + ' · 孩子家');
    else if (g.recall('house') === 'hometown' || ((g.recall('tier') || 5) >= 5 && !g.recall('workCity'))) CN.goHome(g);
    else g.move('home', g.recall('workCity') || g.recall('homeCap') || '家');
  };
  // 搬去和孩子住
  const toKids = (g) => {
    if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') || '省城');
    g.remember('liveWith', 'kids');
    CN.liveWith(g, [kid1(g)].concat(gkIds(g)));
    g.info('住处', (g.recall('kidCity') === '國外' ? '國外' : g.recall('kidCity')) + '，和孩子一起');
    stayHome(g);
  };
  // 住进养老院：只有老伴跟着
  const toNursing = (g, cap) => {
    g.remember('liveWith', 'nursing');
    CN.moveOut(g, kidIds(g).concat(gkIds(g), ['fa', 'mo', 'sib0', 'sib1']));
    g.info('住处', cap || '養老院');
    stayHome(g);
  };
  // 生一个孙辈：id gk1、gk2；儿子的孩子叫孙子孙女，女儿的孩子叫外孙外孙女
  const addGrandkid = (g, kidId) => {
    const kid = JY.byId[kidId];
    if (!kid) return null;
    const n = (g.recall('grandkids') || 0) + 1;
    const fromSon = kid.sex === '男';
    const gk = CN.person({ id: 'gk' + n, born: g.Y, surname: fromSon ? CN.surOf(kid.name) : undefined, origin: kid.name + '的孩子' });
    g.spawn(gk);
    const label = fromSon ? (gk.sex === '男' ? '孫子' : '孫女') : (gk.sex === '男' ? '外孫' : '外孫女');
    g.rel(n === 1 ? label : '小' + label, gk.id, kid.name + '的孩子');
    g.remember('grandkids', n);
    if (lw(g) === 'kids' && CN.livesWith(g, kidId)) CN.liveWith(g, [gk.id]);
    return gk;
  };
  // 一句“身边有谁”
  const company = (g) => {
    if (lw(g) === 'nursing') return hasSp(g) ? '你和' + spName(g) + '住在養老院的同一間屋裡' : '你住在養老院，護工每天來幾趟';
    if (CN.alone(g)) return '你一個人住，社群的人每天來敲一次門';
    return CN.youHh(g);
  };

  JY.addFlags({
    donatedHouse: '把家產留給了老家的學校，那裡後來多了一間圖書室',
    oldStoryteller: '晚年給村裡的孩子講了很多年的老故事',
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
        g.info('退休金', { high: '穩當', mid: '夠用', low: '微薄', savings: '靠積蓄' }[p]);
        if (p === 'low') g.stat('心情', -2);
      },
      text: (g) => {
        const p = g.recall('pension');
        const month = CN.fmt(PEN[p] / 12);
        const debt = debtW(g) > 0 ? '房貸還剩 ' + CN.fmt(debtW(g) * 1e4) + '，得接著還。' : '';
        const save = '存款 ' + CN.fmt(liquid(g)) + '。';
        if (p === 'high') return '六十五歲，你辦了退休手續。單位開了個小會，送了你一束花。每月退休金 ' + month + '，按時到賬，夠花，還能貼補孩子。' + save + debt;
        if (p === 'mid') return '六十五歲，你領到了第一筆養老金，每月 ' + month + '。數目不多不少，過日子夠了。' + save + debt;
        if (p === 'savings') return '六十五歲，沒有誰給你辦退休。每月的養老金只有 ' + month + '，你看了看賬戶上的 ' + CN.fmt(liquid(g)) + '，覺得夠了。' + debt;
        return '六十五歲，你領到了第一筆養老金，每月 ' + month + '。買菜夠，看病不夠。' + save + '你沒覺得自己退休了，只是老了。' + debt;
      } },
    { id: 'o_after_retire', age: 65, t: '退休以後', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && ableToRehire(g),
      text: (g) => '交完工牌的第二天，你還是六點就醒了。' + (REHIRE[g.recall('preJob')] || '原單位打電話來，問你願不願意返聘回去當顧問，帶帶新人。'),
      choices: [
        { t: '徹底歇下來', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('afterRetire', 'rest'); }, res: '你掛了電話，去菜市場轉了一圈。原來上午的菜這麼新鮮。' },
        { t: (g) => '返聘回去，再幹幾年（每月多 ' + CN.fmt(rehireMonth(g)) + '，幹到七十歲）', dev: 15, fx: (g) => { g.stat('健康', -2); g.remember('rehirePay', rehireMonth(g)); g.remember('afterRetire', 'rehire'); g.info('职业', '退休返聘'); },
          res: (g) => '你又有了工牌，只是上面多了“顧問”兩個字。每月多 ' + CN.fmt(g.recall('rehirePay')) + '，年輕人叫你老師。' },
        { t: '去學一樣年輕時沒空學的東西', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: '你報了老年大學，一學期 ¥800。開學那天，你比誰到得都早。' },
      ] },
    { id: 'o_retire_plain', age: 65, t: '退休以後', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && !ableToRehire(g),
      text: (g) => '交完工牌，單位裡沒再打電話來。你在家待了一個月，手不知道往哪兒放。' + (g.s('健康') < 50 ? '腰和膝蓋都在提醒你，該歇了。' : '樓下超市貼著招工的條子，招理貨員和夜班保安。'),
      choices: [
        { t: '在家歇著，買菜做飯', canon: true, fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); g.remember('afterRetire', 'rest'); }, res: (g) => '你把菜市場摸熟了，哪家的豆腐嫩、哪家的秤準，你都知道。' + (CN.alone(g) ? '' : '家裡的飯點比以前準了。') },
        { t: '找點零活，掙個零花（每月約 ¥2,000）', dev: 10, cond: (g) => g.s('健康') >= 40,
          fx: (g) => { g.stat('健康', -1); g.stat('人缘', 2); g.remember('afterRetire', 'odd'); g.info('职业', '退休，打點零工'); },
          res: (g) => '你在' + CN.pick(['小區門口當門衛', '超市裡理貨', '菜市場幫人看攤', '附近的學校看大門']) + '，一個月 ¥2,000 左右。活不累，能和人說說話。' },
        { t: '報個老年大學，學點沒學過的', dev: 10, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: '老年大學一學期 ¥800。你報了書法和手機攝影，開學那天比誰到得都早。' },
      ] },
    { id: 'o_keep_working', age: 65, t: '還幹不幹', loc: 'home',
      cond: (g) => !FORMAL.includes(g.recall('preJob')),
      text: (g) => {
        const j = g.recall('preJob');
        const m = '每月的養老金是 ' + CN.fmt(PEN[g.recall('pension')] / 12) + '。';
        if (j === 'farmer') return '地還在那兒，你的腰一年比一年彎。村裡年輕人都走了，地租出去也沒幾個錢。' + m;
        if (j === 'shop' || j === 'boss') return '店裡的事，你一天不在就有人打電話問。孩子們說你該歇歇了。' + m;
        if (j === 'rider' || j === 'driver' || j === 'creator' || j === 'freelance') return '沒有單位給你辦退休。你的手機裡還開著接單的軟體，單子越來越少。' + m;
        return '你到了這個歲數，身邊的人都說該享福了。可是每個月的錢，算來算去總差一點。' + m;
      },
      choices: [
        { t: '接著幹，幹不動再說', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('afterRetire', 'work'); }, res: '你照舊早出晚歸。有人說你閒不住，你說是閒不起。' },
        { t: '交給孩子，自己退到後面', dev: 10, cond: (g) => hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob')),
          fx: (g) => { g.stat('心情', 3); g.remember('afterRetire', 'handover'); }, res: '交接那天你說了很多，孩子聽了一半。你也就不說了。' },
        { t: '把活兒盤出去，換一筆錢', dev: 10, cond: (g) => !(hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob'))),
          fx: (g) => { const x = g.recall('preJob') === 'boss' ? 200000 : g.recall('preJob') === 'shop' ? 60000 : 20000; CN.earn(g, x); paid = x; g.stat('心情', 3); g.remember('afterRetire', 'handover'); },
          res: () => '換了 ' + CN.fmt(paid) + '。你存進了銀行，每個月取一點。' },
        { t: '徹底歇了，緊著過', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('afterRetire', 'rest'); }, res: '你把鬧鐘關了。省一點，日子也過得下去。' },
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
        if (a === 'rehire') return '返聘這一年，你多掙了 ' + CN.fmt(50000) + '。你發現自己說的話年輕人不太聽了，就提前一站下車，走一段路回家。';
        if (a === 'learn') return '老年大學的課表貼在冰箱上。你第一次覺得一週七天不夠用。';
        if (a === 'work') return '六十六歲，你還在幹活，這一年掙了 ' + CN.fmt(g.recall('preJob') === 'farmer' ? 12000 : 30000) + '。有天收工，你坐在臺階上歇了很久，才站起來。';
        if (a === 'handover') return '交出去以後，你每天去轉一圈，看一眼就走。後來隔一天去一次。';
        return '你學會了睡懶覺。早上的陽光照到床上，你才想起來今天不用去任何地方。';
      } },
    { id: 'o_gk_born', age: 66, t: '當了長輩', auto: true,
      cond: (g) => hasKid(g) && g.ageOf(kid1(g)) >= 24 && !g.recall('grandkids'),
      fx: (g) => { if (g.rnd() < 0.75) { addGrandkid(g, kid1(g)); g.stat('心情', 6); } else g.remember('grandkids', 0); },
      text: (g) => (g.recall('grandkids') ? CN.who(g, kid1(g), true) + '有孩子了。你在醫院走廊裡等了一夜，抱著那個小東西的時候，手直抖。' : CN.who(g, kid1(g), true) + '說暫時不打算要孩子。你張了張嘴，沒說什麼。') },
    { id: 'o_where', age: 66, t: '去孩子那邊嗎', loc: 'home',
      cond: (g) => hasKid(g),
      text: (g) => {
        const c = g.recall('kidCity');
        const who = CN.who(g, kid1(g), true);
        const gk = hasGk(g) ? '孩子也沒人帶，' : '';
        if (c === '國外') return who + '在國外安了家，影片裡說那邊的房子大，' + gk + '想接你過去一起住。';
        if (g.recall('plan60') === 'kid') return '你搬到' + c + '已經好幾年，住得離孩子不遠。' + who + '說，' + gk + '乾脆搬到一起住吧。';
        return who + '打電話來，說' + (c ? c + '的' : '城裡的') + '房子有空房間，' + gk + '讓你' + (hasSp(g) ? '們' : '') + '過去一起住。';
      },
      choices: [
        { t: '收拾東西，搬過去', canon: true,
          fx: (g) => { if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') && g.rnd() < 0.5 ? g.recall('workCity') : CN.pick(['北京', '上海', '深圳', '杭州', '成都', '武漢', '南京', '西安'])); toKids(g); g.stat('人缘', 3); g.stat('心情', -1); },
          res: (g) => (g.recall('kidCity') === '國外' ? '你帶了兩箱衣服，一袋老家的米。下了飛機，滿街的字你一個也不認識。' : '你帶了兩箱衣服，一袋老家的米。新家很乾淨，你一時不知道該把手放哪兒。') },
        { t: '不去，留在自己家', dev: 10, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 2); stayHome(g); },
          res: (g) => (CN.alone(g) ? '你說你住慣了。掛了電話，屋裡很安靜。' : '你說你們住慣了。掛了電話，' + spName(g) + '說，這樣也好，各過各的，見面才親。') },
        { t: '誰也不跟，回老家去', dev: 20, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家的房子落滿了灰。你掃了一整天，夜裡聽見了幾十年沒聽過的蟲叫。' },
      ] },
    { id: 'o_where_nokid', age: 66, t: '往後住哪兒', loc: 'home',
      cond: (g) => !hasKid(g),
      text: (g) => {
        if (hasSp(g)) return '沒有孩子在身邊，你和' + spName(g) + '商量往後怎麼過。';
        if (CN.alone(g)) return '你一個人住了好些年。社群來登記獨居老人，問你往後有什麼打算。';
        return CN.youHh(g) + '。社群來登記老人的情況，問你往後有什麼打算。';
      },
      choices: [
        { t: '就在這兒，照常過', canon: true, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 1); stayHome(g); }, res: '你在門口裝了一個能報警的門鈴，別的照舊。' },
        { t: '回老家去', dev: 15, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', '回了老家'); stayHome(g); }, res: '老家還有幾個老鄰居。他們記得你小時候的外號。' },
        { t: '住進養老社群，每月 ¥5,000', dev: 20, cond: (g) => liquid(g) >= 150000 || CN.income(g) >= 50000,
          fx: (g) => { toNursing(g, '養老社群'); g.stat('健康', 2); }, res: '社群裡有食堂、有醫生，樓下有一群人等你打牌。' },
        { t: '去看看養老院，先打聽價錢', dev: 10, cond: (g) => !(liquid(g) >= 150000 || CN.income(g) >= 50000),
          fx: (g) => { g.remember('liveWith', 'alone'); g.remember('robot', 'none'); g.stat('心情', -1); stayHome(g); }, res: '一個月五千，你的養老金不夠零頭。你回來把家裡的門檻都拆了，免得哪天絆倒。' },
      ] },

    /* ================= 67 岁：孙辈或者别的牵挂 ================= */
    { id: 'o_grandcare', age: 67, t: '帶孩子', loc: 'home',
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (CN.livesWith(g, gkIds(g)[0]) ? '就睡在你隔壁屋。' : '的爸媽上班都忙。') + '誰來帶，成了家裡的大事。',
      choices: [
        { t: '我來帶，全天', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('人缘', 4); g.remember('gkCare', 'full'); }, res: '你又學了一遍換尿布、衝奶粉。只是腰比當年硬多了。' },
        { t: '白天幫著接送，晚上還給他們', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('gkCare', 'part'); }, res: '你每天按點出門，按點回家。中間那幾個小時是你自己的。' },
        { t: '出錢請個阿姨，自己搭把手', dev: 15, cond: (g) => liquid(g) >= 80000,
          fx: (g) => { spend(g, 48000); g.remember('gkCare', 'paid'); g.stat('人缘', 2); }, res: () => '一年 ' + CN.fmt(paid) + '，你出了。阿姨幹活，你在旁邊看著，偶爾抱一抱。' },
        { t: '不帶，各過各的', dev: 25, fx: (g) => { g.stat('心情', 3); g.stat('人缘', -3); g.remember('gkCare', 'none'); }, res: '你把話說在前頭。家裡冷了一陣，後來他們請了阿姨。' },
      ] },
    { id: 'o_pet', age: 67, t: '養點什麼', loc: 'home',
      cond: (g) => !hasGk(g) && !CN.pet(g) && lw(g) !== 'nursing',
      text: (g) => (CN.alone(g) ? '屋子太安靜。樓下的老鄰居說，養點活物，日子就有了響動。' : '白天家裡沒什麼響動。樓下的老鄰居說，養點活物，日子就熱鬧了。'),
      choices: [
        { t: '種一陽臺的花', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('pet', 'plants'); }, res: '你買了十幾個花盆。第一個月死了一半。' },
        { t: (g) => ((g.recall('tier') || 5) <= 3 ? '養一條狗（寵物店的小狗 ¥3,000，打針、狗糧一年 ¥4,000）' : '養一條狗（鄰居家的狗崽，白給）'), dev: 10,
          fx: (g) => { if ((g.recall('tier') || 5) <= 3) CN.pay(g, 3000); CN.adoptPet(g, 'dog'); g.stat('健康', 2); g.stat('心情', 3); g.remember('pet', 'dog'); },
          res: (g) => '它叫' + CN.pet(g).name + '。每天早上六點，它叫你起來遛它。你沒法再睡懶覺了。' },
        { t: '去救助站領一隻沒人要的老貓', dev: 15,
          fx: (g) => { CN.pay(g, 500); CN.adoptPet(g, 'cat', CN.pick(['老黃', '阿灰', '團團', '花姐'])); g.stat('心情', 3); g.remember('pet', 'cat'); },
          res: (g) => '救助站說它八歲了，沒人願意領。你交了 ¥500 的體檢費，把' + CN.pet(g).name + '抱回了家。它頭一個星期躲在床底下，第二個星期就睡到了你腳邊。' },
        { t: '什麼也不養，清淨', dev: 10, fx: (g) => { g.remember('pet', 'none'); g.stat('心情', -1); }, res: '你說不想再操心任何東西。' },
      ] },

    /* ================= 68 岁：爱好 ================= */
    { id: 'o_hobby', age: 68, t: '找點事做',
      cond: (g) => g.recall('afterRetire') !== 'learn',
      text: '傍晚的廣場上放著音樂，公園裡有人下棋，社群門口貼著老年大學招生的海報。',
      choices: [
        { t: '跟著跳廣場舞', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('人缘', 3); g.remember('hobby', 'dance'); }, res: '你站在最後一排，跟錯了好幾拍。第三天，領舞的大姐給你留了個位置。' },
        { t: '報老年大學', dev: 10, fx: (g) => { g.stat('学识', 3); g.remember('hobby', 'college'); }, res: '你選了書法。毛筆握在手裡，比想象的重。' },
        { t: '跟團出去旅遊', dev: 15, cond: (g) => liquid(g) >= 30000,
          fx: (g) => { spend(g, 12000); g.stat('心情', 5); g.remember('hobby', 'travel'); g.move('coast', '海邊 · 旅遊團'); }, res: () => '團費 ' + CN.fmt(paid) + '。你第一次看見海，導遊催了三次，你才回車上。' },
        { t: '在家看看短影片', dev: 5, fx: (g) => { g.stat('心情', 1); g.stat('健康', -1); g.remember('hobby', 'screen'); }, res: '一刷就是一下午。有的影片你點了好幾遍贊。' },
      ] },
    { id: 'o_learn_what', age: 68, t: '老年大學',
      cond: (g) => g.recall('afterRetire') === 'learn',
      text: '老年大學第二年，可以選專業課了。',
      choices: [
        { t: '書法國畫', canon: true, fx: (g) => { g.stat('心情', 3); g.remember('learnWhat', 'art'); }, res: '你臨了一年帖，字慢慢有了樣子。' },
        { t: '學程式設計，跟機器人說話', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('learnWhat', 'code'); }, res: '班上年紀最大的是你。你讓家裡的機器人學會了用方言叫你吃飯。' },
        { t: '學一樣樂器', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('learnWhat', 'music'); }, res: '你挑了二胡。鄰居們有一個月沒睡好。' },
      ] },

    /* ================= 69 岁：体检 ================= */
    { id: 'o_checkup', age: 69, t: '體檢報告', loc: 'hospital',
      text: (g) => (g.s('健康') >= 60 ? '體檢報告上，三個箭頭朝上：血壓、血糖、血脂。醫生說不算嚴重，得管。' : '體檢報告翻了三頁才翻完。醫生指著幾行字，說你這身體，得好好養著了。'),
      choices: [
        { t: '按時吃藥，管住嘴', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('心情', -1); g.remember('chronic', 'control'); stayHome(g); }, res: '你買了一個分七格的藥盒，週日晚上把一週的藥分好。' },
        { t: '戴上健康手環，讓 AI 管著', dev: 10, fx: (g) => { spend(g, 2000); g.stat('健康', 2); g.remember('chronic', 'ai'); stayHome(g); }, res: '手環 ¥2,000。一到飯點它就提醒你少吃一口。你罵了它幾回，它照樣提醒。' },
        { t: '不當回事，該吃吃該喝喝', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('chronic', 'ignore'); stayHome(g); }, res: '你說活到這個歲數，想吃點什麼還要看指標，那多沒意思。' },
      ] },

    /* ================= 70 岁 ================= */
    { id: 'o_seventy', age: 70, t: '七十大壽', auto: true,
      fx: (g) => { stayHome(g); g.stat('心情', 2); },
      text: (g) => {
        const bits = [];
        if (hasSp(g)) bits.push(spName(g) + '給你煮了一碗長壽麵');
        if (hasGk(g)) bits.push(CN.livesWith(g, gkIds(g)[0]) ? '孫輩趴在桌邊，搶著吹蠟燭' : '孫輩在影片裡給你唱了生日歌');
        else if (hasKid(g)) bits.push(kidName(g) + '訂了一個蛋糕');
        if (lw(g) === 'nursing') bits.push('養老社群給這個月過生日的人一起辦了一場');
        if (!bits.length) bits.push('樓下的老鄰居拎來一塊小蛋糕，你們倆插了一根蠟燭');
        return '七十歲生日。' + bits.join('，') + '。';
      } },
    { id: 'o_rehire_end', age: 70, t: '交了工牌', auto: true,
      cond: (g) => g.recall('afterRetire') === 'rehire',
      fx: (g) => { paid = (Number(g.recall('rehirePay')) || 2500) * 12 * 5; CN.earn(g, paid); g.info('职业', '退休'); },
      text: () => '七十歲，你把顧問的工牌也交了。返聘這幾年又多掙了 ' + CN.fmt(paid) + '。最後一天，年輕人湊錢給你買了一束花。' },
    { id: 'o_odd_end', age: 70, t: '不幹了', auto: true,
      cond: (g) => g.recall('afterRetire') === 'odd',
      fx: (g) => { paid = 2000 * 12 * 5; CN.earn(g, paid); g.info('职业', '退休'); g.stat('心情', 2); },
      text: () => '七十歲，你把零活辭了。這幾年零零碎碎掙了 ' + CN.fmt(paid) + '。最後一天，常來的幾個人跟你說，以後常回來坐坐。' },

    /* ================= 71 岁：老伴生病，或者老朋友 ================= */
    { id: 'o_sp_sick', age: 71, t: '老伴病了', loc: 'hospital',
      cond: (g) => hasSp(g),
      text: (g) => spName(g) + '半夜起來上廁所，摔在了衛生間。查出來是輕度中風，往後要人照顧。',
      choices: [
        { t: '我自己伺候', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('人缘', 3); g.remember('spCare', 'self'); stayHome(g); }, res: '你學會了翻身、擦洗、餵飯。夜裡每隔兩小時醒一次，成了習慣。' },
        { t: '請護工或者陪護機器人', dev: 10, cond: (g) => liquid(g) >= 60000,
          fx: (g) => { spend(g, 50000); g.stat('心情', 1); g.remember('spCare', 'paid'); stayHome(g); }, res: () => '一年下來花了 ' + CN.fmt(paid) + '。陪護機器人比你力氣大，也不嫌煩。你負責陪著說話。' },
        { t: '送去康復醫院住一陣', dev: 10,
          fx: (g) => { spend(g, 15000); g.remember('spCare', 'rehab'); stayHome(g); }, res: () => (paid ? '自費 ' + CN.fmt(paid) + '。' : '醫保報了大頭。') + '你每天坐公交去送飯，一來一回兩個鐘頭。' },
        { t: '打電話叫孩子回來', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', -1); g.remember('spCare', 'kids'); stayHome(g); }, res: (g) => kidName(g) + '請了長假回來。一個月後，又回去上班了。' },
      ] },
    { id: 'o_old_friend', age: 71, t: '同學聚會',
      cond: (g) => !hasSp(g),
      text: '中學同學群裡有人張羅聚會，說再不聚，就湊不齊了。',
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('reunion', 'went'); }, res: '一桌人，你認出了一半。說起當年的老師，大家都笑了。' },
        { t: '不去', dev: 10, fx: (g) => { g.remember('reunion', 'no'); }, res: '你在群裡發了個紅包，說身體不方便。' },
      ] },

    { id: 'o_spcare_echo', age: 73, t: '病床邊', auto: true,
      cond: (g) => !!g.recall('spCare'),
      fx: (g) => { if (g.recall('spCare') === 'self') g.stat('健康', -2); },
      text: (g) => {
        const c = g.recall('spCare');
        const alive = hasSp(g);
        const n = spName(g);
        if (c === 'self') return alive ? '你伺候' + n + '兩年了。有天你喂完飯，' + n + '拉著你的手說，辛苦你了。這是兩年裡說得最清楚的一句話。' : '你伺候了一場，人還是走了。你把那個七格藥盒收進了抽屜。';
        if (c === 'paid') return alive ? '陪護機器人記住了' + n + '愛聽的戲。你們倆靠在床頭聽，一聽一下午。' : '機器人被收回去那天，你在門口站了很久。';
        if (c === 'rehab') return alive ? n + '從康復醫院出來，能拄著拐走到樓下了。你們在長椅上坐著，看小孩子放風箏。' : '康復醫院的護士給你寄來一張卡片，說' + n + '在那兒的時候，天天唸叨你。';
        return hasKid(g) ? kidName(g) + '每個週末都打影片回來，問爸媽今天怎麼樣。你總說挺好。' : '那一場病過去了。你們倆說起那陣子，都說多虧了孩子。';
      } },
    { id: 'o_reunion_echo', age: 73, t: '同學', auto: true,
      cond: (g) => !!g.recall('reunion'),
      text: (g) => (g.recall('reunion') === 'went' ? '聚會以後，群裡熱鬧了一陣。幾個住得近的老同學，每個月約著喝一回早茶。' : '你沒去的那次聚會，後來有人把合影發到群裡。你放大了看，一個一個認，認出來七八個。') },

    /* ================= 72 岁 ================= */
    { id: 'o_robot_era', age: 72, t: '家裡的機器人', auto: true,
      fx: (g) => { if (liquid(g) >= 60000 && lw(g) !== 'nursing') { spend(g, 30000); g.remember('robotBuy', true); g.stat('健康', 2); } },
      text: (g) => {
        if (lw(g) === 'nursing') return '養老院添了幾臺機器人，會推輪椅、會陪人下棋。你下贏過它一回，高興了一整天。';
        if (g.recall('robotBuy')) return '你花 ' + CN.fmt(30000) + ' 買了一臺做家務的機器人，會做飯、會拖地、會在你忘了吃藥時唸叨。你給它起了個小名。';
        return '社群給高齡老人配了一臺公用的陪護機器人，一個星期來你家兩次。它每次走的時候都說：“下週見。”';
      } },
    { id: 'o_work_stop', age: 72, t: '歇了', auto: true,
      cond: (g) => g.recall('afterRetire') === 'work',
      fx: (g) => { CN.earn(g, g.recall('preJob') === 'farmer' ? 50000 : 120000); g.info('职业', '退休'); g.stat('心情', 2); },
      text: (g) => '七十二歲，你終於把活兒停了。這幾年又掙了 ' + CN.fmt(g.recall('preJob') === 'farmer' ? 50000 : 120000) + '，夠你踏踏實實歇著。' + (g.recall('preJob') === 'farmer' ? '你把鋤頭掛在牆上，擦得鋥亮。' : '你把接單的軟體刪了，手機一下子安靜了。') },
    { id: 'o_pet_echo', age: 72, t: '活物', auto: true,
      cond: (g) => !!g.recall('pet'),
      fx: (g) => { if (g.recall('pet') === 'dog') g.stat('健康', 2); },
      text: (g) => {
        const p = g.recall('pet');
        if (p === 'dog') return '那條狗老了，你也老了。你們遛彎的速度剛好一樣。';
        if (p === 'cat') return CN.pet(g) ? '那隻老貓每天下午趴在窗臺上曬太陽。你看報紙，它看你。' : '那隻老貓陪了你幾年，走的那天是個晴天。你把它的墊子洗乾淨，收進了櫃子。';
        if (p === 'plants') return '陽臺上的花活下來的那一半，今年開得特別好。樓下的人抬頭看，問你怎麼養的。';
        return '你說不養東西清淨。可是有天下午，你對著窗臺說了半天話。';
      } },
    { id: 'o_gk2', age: 72, t: '又一個孫輩', auto: true,
      cond: (g) => JY.byId.k2 && g.alive('k2') && g.ageOf('k2') >= 25 && (g.recall('grandkids') || 0) < 2,
      fx: (g) => { if (g.rnd() < 0.6) { addGrandkid(g, 'k2'); g.stat('心情', 4); } else g.remember('gk2No', true); },
      text: (g) => (g.recall('gk2No') ? CN.who(g, 'k2', true) + '還沒成家。你說不急，心裡有點急。' : CN.who(g, 'k2', true) + '也有孩子了。全家湊齊拍了張合影，你坐在正中間。') },

    /* ================= 73 岁：骗子 ================= */
    { id: 'o_scam', age: 73, t: '一通電話',
      text: '電話那頭的人很熱情，叫你“叔叔阿姨”，說有個講座免費送雞蛋，還能領一臺按摩椅。',
      choices: [
        { t: '掛掉，告訴孩子', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: '孩子在電話裡誇了你。你有點得意。' },
        { t: '掛掉，告訴社群', canon: true, cond: (g) => !hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: '社群的小姑娘把你的事講給樓裡的老人聽，說要向你學習。' },
        { t: '去領雞蛋，別的不買', dev: 10, check: ['学识', 45], fx: (g) => { g.stat('心情', 2); g.remember('scam', 'eggs'); }, res: '你領了兩盒雞蛋，講座講到一半你就走了。',
          fail: { fx: (g) => { const x = Math.min(50000, Math.max(3000, round1k(CN.cash(g) * 0.2))); g.remember('scamLoss', spend(g, x)); g.remember('scam', 'cheated'); }, res: (g) => '你本來只想領雞蛋。出門的時候，手裡多了一箱“能降三高”的保健品，賬戶上少了 ' + CN.fmt(g.recall('scamLoss')) + '。', dev: 0 } },
        { t: '跟他聊聊，問問他的生活', dev: 20, fx: (g) => { g.stat('心情', 2); g.remember('scam', 'talked'); }, res: '你問他多大了，家是哪兒的。他愣了一下，掛了電話。' },
      ] },
    { id: 'o_gk_school', age: 73, t: '孫輩上學', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 6,
      fx: (g) => { if (liquid(g) >= 50000) { spend(g, 10000); g.remember('gkGift', true); } },
      text: (g) => (g.recall('gkGift') ? CN.who(g, gkIds(g)[0], true) + '上小學了。你包了一個 ' + CN.fmt(10000) + ' 的紅包，說是買書包的，其實夠買一百個書包。' : CN.who(g, gkIds(g)[0], true) + '上小學了。你連夜給書包縫了個名字，針腳歪歪扭扭的。') },

    /* ================= 74 岁：摔跤，或者运动会 ================= */
    { id: 'o_fall', age: 74, t: '摔了一跤', loc: 'hospital',
      cond: (g) => g.s('健康') < 48,
      text: '下雨天，你在小區門口滑了一下。片子出來，股骨頸骨折。',
      choices: [
        { t: '做手術，換關節', canon: true, fx: (g) => { spend(g, 30000); g.stat('健康', 5); g.remember('fall', 'surgery'); }, res: () => (paid ? '醫保報了一半，自費 ' + CN.fmt(paid) + '。' : '醫保報了一大半，剩下的' + '湊一湊也夠了。') + '三個月後，你扶著助行器下了樓。' },
        { t: '保守治療，躺著養', dev: 10, fx: (g) => { g.stat('健康', -6); g.remember('fall', 'rest'); }, res: '你在床上躺了半年。起來的時候，腿細了一圈。' },
        { t: '裝一副外骨骼', dev: 20, cond: (g) => liquid(g) >= 150000, fx: (g) => { spend(g, 120000); g.stat('健康', 8); g.remember('fall', 'exo'); }, res: () => '醫保不報，花了 ' + CN.fmt(paid) + '。外骨骼咔噠咔噠地響，你走得比摔之前還穩。' },
      ] },
    { id: 'o_sports', age: 74, t: '老年運動會',
      cond: (g) => g.s('健康') >= 48 && !g.recall('fall'),
      text: '社群辦老年運動會，有門球、太極拳、健步走。',
      choices: [
        { t: '報個太極拳', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('sports', 'taichi'); }, res: '你打得不算好，但一招沒忘。' },
        { t: '報健步走，衝個名次', dev: 15, check: ['健康', 65], fx: (g) => { g.stat('心情', 5); g.remember('sports', 'medal'); }, res: '你拿了第三名。獎品是一口鍋，你用了很多年。',
          fail: { fx: (g) => { g.stat('健康', -3); g.remember('sports', 'hurt'); }, res: '走到一半，你的膝蓋不答應了。你是被扶下來的。', dev: 0 } },
        { t: '在旁邊看', dev: 5, fx: (g) => { g.remember('sports', 'watch'); }, res: '你在場邊嗑了一下午瓜子，比誰喊得都響。' },
      ] },

    /* ================= 75 岁：回声 ================= */
    { id: 'o_hobby_echo', age: 75, t: '這些年的愛好', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      fx: (g) => { const h = g.recall('hobby'); if (h === 'dance') g.stat('健康', 2); if (h === 'screen') g.stat('健康', -2); },
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return '你的字在老年大學的展覽上掛了出來。' + (hasKid(g) ? kidName(g) + '拍了照片發到網上。' : '你在那幅字前面站了很久。');
        if (w === 'code') return '你寫的小程式能幫樓裡的老人叫車、掛號。有人叫你“技術顧問”。';
        if (w === 'music') return '你的二胡能拉一整首曲子了。鄰居們開始點歌。';
        const h = g.recall('hobby');
        if (h === 'dance') return g.s('健康') >= 50 ? '跳了七年廣場舞，你成了領舞。隊裡新來的人叫你老師。' : '跳了七年廣場舞，你的膝蓋開始抗議。你退到最後一排，跟著比劃，照樣開心。';
        if (h === 'college') return '老年大學的同學，成了你這個歲數最常見面的人。';
        if (h === 'travel') return '這幾年你跟團去了十幾個地方。照片存滿了一張卡，你一張也捨不得刪。';
        return '短影片刷了好幾年。你最常看的，是別人家的老人在幹什麼。';
      } },
    { id: 'o_scam_echo', age: 75, t: '那通電話以後', auto: true,
      cond: (g) => !!g.recall('scam'),
      text: (g) => {
        const s = g.recall('scam');
        if (s === 'cheated') return '那箱保健品還在櫃子裡。你不再接陌生電話了，' + (hasKid(g) ? kidName(g) + '給你的手機裝了攔截。' : '誰打來你都先問三遍。');
        if (s === 'talked') return '你後來又接到過幾次那樣的電話。你還是問人家多大了、家是哪兒的。有一個人跟你聊了二十分鐘，沒提雞蛋。';
        if (s === 'eggs') return '社群裡有幾個老夥計被騙了錢。你把領雞蛋的經驗講給他們聽，他們說你賊精。';
        return '小區裡貼了防詐騙的海報，上面寫的那種電話，你早就接過了。';
      } },

    /* ================= 76 岁：以后谁照顾 ================= */
    { id: 'o_care_plan', age: 76, t: '往後誰照顧你',
      cond: (g) => lw(g) !== 'nursing',
      text: (g) => {
        if (hasSp(g)) return '你和' + spName(g) + '都上了年紀。擰瓶蓋、換燈泡、夜裡起來，都得兩個人商量著來。';
        if (CN.alone(g)) return '你開始覺得，有些事一個人做不動了。擰瓶蓋，換燈泡，夜裡起來。';
        return '白天家裡人都出門了。有些事你一個人做不動了：擰瓶蓋，換燈泡，彎腰撿東西。';
      },
      choices: [
        { t: '請一臺能護理的陪護機器人', canon: true, fx: (g) => { spend(g, 40000); g.stat('健康', 3); g.remember('robot', 'home'); }, res: () => (paid >= 40000 ? '花了 ' + CN.fmt(paid) + '。' : '錢不夠，社群補貼了一部分。') + '它會在你起夜時把燈開啟，會在你說話時回話。' },
        { t: '住進養老院，每月 ¥5,000', dev: 15, cond: (g) => canNursing(g), fx: (g) => { toNursing(g); g.stat('人缘', 2); }, res: (g) => '你挑了一家離老房子不遠的。窗戶朝南。' + (hasSp(g) ? spName(g) + '跟你住一間。' : '') },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { toKids(g); }, res: '孩子把書房騰出來給你。你聽見他們夫妻倆小聲商量過。' },
        { t: '就這樣過，不添麻煩', dev: 10, fx: (g) => { g.remember('robot', 'none'); g.stat('心情', 2); }, res: (g) => (lw(g) === 'kids' ? '你說你還能動。孩子在你屋裡裝了扶手和夜燈。' : '你說這屋子裡的每樣東西你都知道在哪兒。這就夠了。') },
      ] },

    /* ================= 77 岁 ================= */
    { id: 'o_chronic_echo', age: 77, t: '老毛病', auto: true,
      cond: (g) => !!g.recall('chronic'),
      fx: (g) => { const c = g.recall('chronic'); if (c === 'ignore') { g.stat('健康', -8); spend(g, 40000); g.remember('heartBill', paid); } else if (c === 'ai') g.stat('健康', 3); else g.stat('健康', 2); },
      text: (g) => {
        const c = g.recall('chronic');
        if (c === 'ignore') return '那幾個箭頭，你一直沒當回事。今年春天，你因為心梗進了一次醫院，搶救了過來。' + (g.recall('heartBill') ? '自費 ' + CN.fmt(g.recall('heartBill')) + '。' : '') + '醫生說，再晚半小時就難說了。';
        if (c === 'ai') return '手環管了你八年。醫生翻著你的記錄說，這些年控制得比大多數人都好。';
        return '七格藥盒換了第三個。血壓一直穩著，你的指標比同齡人好看。';
      } },
    { id: 'o_fall_echo', age: 77, t: '腿腳', auto: true,
      cond: (g) => !!g.recall('fall') || !!g.recall('sports'),
      text: (g) => {
        const f = g.recall('fall');
        if (f === 'exo') return '外骨骼換了新一代，輕了一半。你穿著它去菜市場，小孩子跟在後面看。';
        if (f === 'surgery') return '換過的那條腿，陰天會疼。你比天氣預報準。';
        if (f === 'rest') return '那一跤以後，你出門少了。樓下的長椅，成了你走得最遠的地方。';
        const s = g.recall('sports');
        if (s === 'medal') return '那口獎品鍋，你一直用著。誰來家裡吃飯，你都要提一句。';
        if (s === 'taichi') return '每天早上那一套太極拳，你打了三年沒斷過。';
        if (s === 'hurt') return '那次健步走傷了膝蓋，以後你只在場邊看。';
        return '你還是喜歡在場邊看別人動，自己坐著。';
      } },
    { id: 'o_look_back_edu', age: 77, t: '想起讀書的時候', auto: true,
      text: (g) => {
        const e = g.recall('edu');
        const u = g.recall('uni');
        const where = g.recall('hukou') === 'rural' ? '村裡' : g.recall('hukou') === 'county' ? '縣城' : '城裡';
        if (e === 'phd' || e === 'master') return '你常想起讀研的那幾年，實驗室的燈、食堂的夜宵。那時候覺得前途是一條很長的路。';
        if (e === 'bachelor' || e === 'college') return '大學宿舍的上鋪，你早就記不清名字了。可是' + (u === 'top' ? '那座有名的校門' : '學校門口那家小飯館') + '的樣子，你閉著眼都能想起來。';
        if (e === 'vocational') return '你常想起職校實訓車間裡那股機油味。那時候你學會的手藝，養了你大半輩子。';
        if (e === 'senior') return '你常想起高考那兩天，' + where + '的考場外面站滿了家長。';
        return '你讀書不多。可是' + where + '那所小學的鐘聲，你到老都記得。';
      } },

    /* ================= 78 岁：遗嘱 ================= */
    { id: 'o_will', age: 78, t: '家底留給誰',
      text: (g) => {
        const hv = houseW(g), cash = liquid(g);
        const list = [];
        if (hv) list.push((g.recall('house') === 'hometown' ? '老家的一處房子' : '一套房子') + '，值 ' + CN.fmt(hv * 1e4));
        if (hv && debtW(g) > 0) list.push('房貸還剩 ' + CN.fmt(debtW(g) * 1e4));
        list.push(cash >= 1000 ? '存款 ' + CN.fmt(cash) : '存款幾乎沒有');
        if (!hv) list.push('沒有自己的房子');
        return '你找人立遺囑。律師把你的家底列成一張單子：' + list.join('，') + '。他問你，這些打算留給誰。';
      },
      choices: [
        { t: '孩子們平分', canon: true, cond: (g) => kidsN(g) >= 2, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: '你簽了字，心裡一塊石頭落了地。' },
        { t: '留給孩子', canon: true, cond: (g) => kidsN(g) === 1, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: '你簽了字，心裡一塊石頭落了地。' },
        { t: '都留給老伴', canon: true, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: '你說，先顧著活著的那個。' },
        { t: '留給兄弟姐妹家的孩子', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('will', 'kin'); }, res: '你想起他們小時候喊你的樣子。律師寫下了幾個名字。' },
        { t: '留給這些年照看你的人', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && !((g.recall('sibs') || 0) > 0), fx: (g) => { g.remember('will', 'carer'); }, res: '你報了幾個名字：樓下的鄰居，社群的小姑娘。律師一個一個記下。' },
        { t: '先留給老伴，以後再給孩子', dev: 10, cond: (g) => hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: '你說，先顧著活著的那個。' },
        { t: '把房子賣了，錢留著自己花', dev: 25, cond: (g) => houseW(g) > 0,
          fx: (g) => { const x = Math.max(0, (houseW(g) - debtW(g)) * 1e4); CN.sellHouse(g); g.remember('willAmt', x); g.remember('will', 'sell'); g.stat('心情', 4); if (lw(g) === 'alone' || lw(g) === 'hometown') g.info('住处', '租的小房子'); },
          res: (g) => '房子賣了 ' + CN.fmt(g.recall('willAmt')) + '。律師抬頭看了你一眼。你說，錢是給人花的。' + (lw(g) === 'alone' || lw(g) === 'hometown' ? '你租了一套帶電梯的小房子，比原來那套好走。' : '') },
        { t: '錢留著自己花，不給誰留', dev: 20, cond: (g) => !houseW(g) && liquid(g) >= 50000, fx: (g) => { g.remember('will', 'spend'); g.stat('心情', 3); }, res: '律師合上本子。你說，花完了正好，誰也不用分。' },
        { t: '房子捐給老家的學校', dev: 35, cond: (g) => houseW(g) > 0, fx: (g) => { g.remember('will', 'donate'); g.remember('willAmt', 0); g.set('donatedHouse'); g.stat('心情', 3); }, res: '你想起小時候那間漏雨的教室。律師把“捐贈”兩個字寫得很工整。' },
        { t: '拿出一筆錢，捐給老家的學校', dev: 30, cond: (g) => !houseW(g) && liquid(g) >= 20000,
          fx: (g) => { g.remember('willAmt', spend(g, round1k(liquid(g) * 0.3))); g.remember('will', 'donate'); g.set('donatedHouse'); g.stat('心情', 3); }, res: (g) => '你當場轉了 ' + CN.fmt(g.recall('willAmt')) + '。你想起小時候那間漏雨的教室。' },
        { t: '不立了，沒什麼可分的', dev: 10, cond: (g) => !houseW(g) && liquid(g) < 50000, fx: (g) => { g.remember('will', 'none'); }, res: '律師說，這樣也行。你請他喝了杯茶，算是謝謝他跑一趟。' },
      ] },

    /* ================= 79 岁 ================= */
    { id: 'o_look_back_work', age: 79, t: '想起幹活的那些年', auto: true,
      text: (g) => {
        const j = g.recall('preJob');
        const c = g.recall('workCity');
        const at = c ? '在' + c : '';
        const m = {
          civil: '你常夢見單位的那間辦公室，桌上堆著檔案，窗外是一棵梧桐。',
          teacher: '你教過的學生，有的已經當了爺爺奶奶。過年還有人給你發訊息，叫你老師。',
          doctor: '你在醫院裡過了大半輩子的夜班。現在聽到救護車的聲音，還會下意識看一眼表。',
          nurse: '你扎過的針，大概有幾十萬次。現在你的手還是穩的。',
          tech: '你寫過的程式碼，早就沒人用了。你偶爾在新聞裡看見當年那家公司的名字。',
          office: '你' + at + '坐了幾十年格子間。電梯裡的那些臉，你一張也想不起來了。',
          worker: '你在流水線上站了半輩子。現在聽到機器的嗡嗡聲，手指頭還會跟著動。',
          rider: '你' + at + '送過的外賣，能繞地球好幾圈。你記得每一個難找的小區。',
          driver: '你開了幾十年車，' + at + '的每一條近路你都知道。',
          farmer: '你種了一輩子地。現在下雨，你第一個想的還是地裡的莊稼。',
          shop: '你開的那家店早就換了招牌。你路過時，還會往裡看一眼。',
          boss: '你做過的生意，賺過，也賠過。現在想起來，賠的那幾次記得更清楚。',
          creator: '你拍過的影片，還掛在網上。有時候會有新的點贊，你也不知道是誰。',
        };
        return m[j] || ('你這輩子換過好幾份活。' + (c ? c + '的那些年' : '那些年') + '，現在想起來，就像別人的事。');
      } },
    { id: 'o_care_echo', age: 79, t: '日子', auto: true,
      cond: (g) => !!lw(g),
      fx: (g) => { const l = lw(g); if (l === 'kids') g.stat('人缘', 2); if (CN.alone(g) && g.recall('robot') === 'none') g.stat('心情', -1); stayHome(g); },
      text: (g) => {
        const l = lw(g);
        if (l === 'nursing') return '養老院裡，你有了固定的牌搭子。每天下午三點，雷打不動。';
        if (l === 'kids') return '和孩子住了這些年，你學會了少說話。可是' + (g.recall('gkCare') === 'full' ? '孫輩放學回來，第一個喊的是你。' : '晚飯桌上，大家會問你今天怎麼樣。');
        if (l === 'hometown') return '回老家住了這些年，村裡的路修好了，人卻越來越少。你成了村裡最常坐在門口的那個人。';
        if (g.recall('robot') === 'home') return '家裡那臺陪護機器人跟了你三年，它記得你所有的習慣，比你自己記得還清楚。';
        if (hasSp(g)) return '你和' + spName(g) + '守著老房子。一個耳朵背，一個眼睛花，湊在一起剛好過日子。';
        if (CN.alone(g)) return '一個人住，你給自己定了規矩：每天出門一次，跟一個人說話。';
        return CN.youHh(g) + '。每天早上誰先起床，誰就燒一壺水。';
      } },

    /* ================= 80 岁：老家 ================= */
    { id: 'o_back_home', age: 80, t: '回老家看看',
      cond: (g) => !atHometown(g),
      text: (g) => '你夢見了' + (g.recall('homeCap') || '老家') + '。醒來以後，那條路的樣子一直在眼前。',
      choices: [
        { t: '讓孩子影片連線，看一眼就好', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.remember('wentHome', 'video'); }, res: '鏡頭裡的老房子換了門。你說，就是這兒。' },
        { t: '回去住一個月', dev: 10, fx: (g) => { g.remember('wentHome', 'month'); g.stat('心情', 6); g.stat('健康', -2); CN.goHome(g); }, res: (g) => (hasKid(g) ? kidName(g) + '請了假陪你回去。' : '老鄰居家的孫子開車來接你。') + '你走了一遍小時候上學的路，比記憶裡短得多。' },
        { t: '不回了，那邊沒人了', dev: 5, fx: (g) => { g.remember('wentHome', 'no'); g.stat('心情', -2); }, res: '你翻了個身，又睡著了。' },
      ] },
    { id: 'o_village_kids', age: 80, t: '村裡的孩子',
      cond: (g) => atHometown(g),
      text: '暑假，村裡留下來的幾個孩子總在你家門口轉。有一個問你，以前的人是怎麼過日子的。',
      choices: [
        { t: '搬個小板凳，講給他們聽', dev: 15, fx: (g) => { g.remember('storyteller', true); g.set('oldStoryteller'); g.stat('心情', 5); g.stat('人缘', 3); }, res: '你講了一下午，孩子們沒一個走的。' },
        { t: '給他們拿點吃的，打發走', canon: true, fx: (g) => { g.remember('storyteller', false); g.stat('人缘', 1); }, res: '他們抓了糖就跑了。你在門口坐到天黑。' },
      ] },

    /* ================= 81 岁 ================= */
    { id: 'o_will_echo', age: 81, t: '遺囑以後', auto: true,
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
          if (g.recall('willAmt')) return '你捐的 ' + CN.fmt(g.recall('willAmt')) + ' 用上了。老家的學校來了一封信，說圖書室蓋好了，書架上貼著你的名字。你讓人把信念了兩遍。';
          return '老家學校的校長帶著兩個學生來看你。他們說，那套房子以後歸學校，要拿它辦一間圖書室，門口掛你的名字。你讓孩子們一人給你寫一封信。';
        }
        if (w === 'sell') return '賣房的錢，這幾年你花了 ' + CN.fmt(g.recall('willSpent')) + '，花在了幾趟短途旅行、一個好護工和很多頓好飯上。你一點也不後悔。';
        if (w === 'spend') return '這幾年你沒虧待自己，花了 ' + CN.fmt(g.recall('willSpent')) + '：換了一張好床，配了一副好助聽器，常請老鄰居下館子。';
        if (w === 'spouse') return hasSp(g) ? '遺囑寫的是留給老伴。簽字那天，你們倆都沒說話，後來一起去吃了碗麵。' : '遺囑寫的是留給老伴。老伴先走了一步，你又去改了一回，改完在律師樓下坐了很久。';
        if (w === 'kin') return '侄子外甥知道了遺囑的事，過年來得勤了些。你心裡有數，紅包照樣包。';
        if (w === 'carer') return '樓下的鄰居知道了遺囑的事，紅著眼說不要。你說，就當是謝謝這些年的餃子。';
        if (w === 'none') return '你沒立遺囑，也沒人問。家裡那點東西，你一樣一樣送給了喜歡它們的人。';
        return '遺囑的事，孩子們知道了。' + (kidsN(g) >= 2 ? '有一陣子，幾個孩子來得一樣勤。' : '誰也沒再提起。');
      } },
    { id: 'o_hometown_echo', age: 81, t: '老家', auto: true,
      cond: (g) => !!g.recall('wentHome') || g.recall('storyteller') != null,
      text: (g) => {
        if (g.f('oldStoryteller')) return '你講的那些故事，有個孩子寫進了作文，拿了縣裡的獎。他跑來給你看，獎狀上有你的名字。';
        if (g.recall('storyteller') === false) return '那幾個孩子放了學，還是常在你門口玩。你每回都多備一把糖。';
        const w = g.recall('wentHome');
        if (w === 'month') return '那一個月，你在老家認出了小時候的同桌。他也老了，坐在同一棵樹下。你們約好明年再見。';
        if (w === 'video') return '那次影片以後，孩子把老房子的照片列印出來，掛在你床頭。';
        return '老家是什麼樣，你已經只能靠想了。想著想著，嘴裡就哼起了小時候的歌。';
      } },
    { id: 'o_icu_talk', age: 82, t: '那一天到了怎麼辦', loc: 'hospital',
      text: '社群醫生來做預立醫囑的登記，問你：要是哪天不行了，搶不搶救，插不插管。',
      choices: [
        { t: '能救就救，插管也要救', canon: true, fx: (g) => { g.remember('icu', 'yes'); stayHome(g); }, res: '你說你還想多看幾年。醫生在表上打了一個勾。' },
        { t: '不插管，不進 ICU，不受那個罪', dev: 20, fx: (g) => { g.remember('icu', 'no'); g.stat('心情', 3); stayHome(g); }, res: '你簽字的時候手很穩。' },
        { t: '交給孩子們決定', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: '你說，到時候他們比你清楚。' },
        { t: '交給老伴決定', dev: 5, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: (g) => '你說，到時候聽' + spName(g) + '的。' },
      ] },

    /* ================= 83 岁 ================= */
    { id: 'o_kids_visit', age: 83, t: '誰常來', auto: true,
      cond: (g) => hasKid(g),
      fx: (g) => { if (lw(g) === 'kids' || g.s('人缘') >= 60) g.stat('心情', 3); else g.stat('心情', -1); },
      text: (g) => {
        const k = CN.who(g, kid1(g), true);
        if (CN.livesWith(g, kid1(g))) return kidName(g) + '每天回來，先進你屋看一眼。你裝作睡著了，等門關上才笑。';
        if (g.recall('icu') === 'kids') return k + '知道了預立醫囑的事，那個週末專門回來，陪你坐了一下午。兩個人誰也沒提。';
        if (g.s('人缘') >= 60) return k + '每個週末都回來，帶著吃的，走的時候冰箱是滿的。';
        if (g.recall('kidCity') === '國外') return k + '在國外，每天晚上八點準時打影片。時差你算不清，可是八點你記得。';
        return k + '工作忙，一個月回來一次。你把攢了一個月的話，在飯桌上一口氣說完了。';
      } },
    { id: 'o_gk_teen', age: 83, t: '孫輩', auto: true,
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (g.recall('gkCare') === 'full' ? '放了暑假，第一件事是來看你，給你講學校裡的事。講到一半，你已經睡著了，' + '孩子給你蓋了條毯子。' : '教你用新出的手機。你學得慢，孩子教得也不急。') },

    /* ================= 84 岁：记性 ================= */
    { id: 'o_memory', age: 84, t: '記性',
      text: '你開始叫錯人的名字。有天出門，站在樓下想了半天要去哪兒。',
      choices: [
        { t: '去醫院查查', canon: true, fx: (g) => { g.remember('memory', 'doctor'); g.stat('健康', 2); }, res: '醫生說是輕度認知障礙，開了藥，讓你多動腦子。' },
        { t: '每天寫日記', dev: 15, fx: (g) => { g.remember('memory', 'diary'); g.stat('学识', 2); }, res: '你買了一個厚本子，第一頁寫的是自己的名字和住址。' },
        { t: '讓 AI 幫你記著', dev: 10, fx: (g) => { g.remember('memory', 'ai'); }, res: '你對著它說：“我把鑰匙放哪兒了？”它告訴你，在你左邊口袋裡。' },
      ] },
    { id: 'o_eighty_five', age: 85, t: '八十五', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => (g.s('健康') >= 40 ? '八十五歲，你還能自己下樓。同一年出生的人裡，能做到的不多了。' : '八十五歲，你大半天都坐在窗邊。陽光從左邊挪到右邊，一天就過去了。') },
    { id: 'o_hobby_late', age: 85, t: '老了的愛好', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return '毛筆字你還在寫，只是字越寫越大。一張紙寫四個字，掛在牆上，來的人都說好。';
        if (w === 'code') return '你寫的那些小程式，早有年輕人接手了。他們每次更新，還在說明裡寫一句謝謝你。';
        if (w === 'music') return '二胡拉不動整首了。你拉一段，歇一會兒，再拉一段。';
        const h = g.recall('hobby');
        if (h === 'dance') return '以前一起跳舞的' + (isMale(g) ? '老夥計' : '老姐妹') + '，如今剩下三四個。傍晚你們坐在場邊的長椅上，聽著音樂打拍子。';
        if (h === 'college') return '老年大學你不去了，同學們還常來家裡坐。一屋子白頭髮，說的都是幾十年前的事。';
        if (h === 'travel') return '你出不了遠門了。你把這些年的旅行照片一張張翻，翻到哪兒，就講哪兒。';
        return '短影片你還在看。字太小，就讓機器人念給你聽。';
      } },

    /* ================= 86 岁：寿宴 ================= */
    { id: 'o_birthday', age: 86, t: '大壽',
      text: (g) => famWord(g) + '說，八十六了，該好好過個生日。',
      choices: [
        { t: '大辦一場，把親戚朋友都請來', canon: true, fx: (g) => { spend(g, 16000); g.remember('bday', 'big'); g.stat('人缘', 4); g.stat('健康', -2); }, res: '擺了八桌。很多人你叫不出名字，可是他們都叫得出你。' },
        { t: '幾個親近的人吃頓飯就好', dev: 5, fx: (g) => { g.remember('bday', 'small'); g.stat('心情', 3); }, res: '一桌人，你吃了半碗麵，看了一晚上他們。' },
        { t: '誰也不叫，去看一次海', dev: 25, cond: (g) => g.s('健康') >= 30, fx: (g) => { spend(g, 6000); g.remember('bday', 'sea'); g.stat('心情', 6); g.move('coast', '海邊'); }, res: (g) => (family(g) ? '家裡人推著輪椅陪你去了。' : '養老服務站的小夥子陪你去了。') + '你在沙灘上坐了一下午。浪一層一層地上來，又下去。' },
      ] },
    { id: 'o_memory_echo', age: 87, t: '忘了，記著', auto: true,
      cond: (g) => !!g.recall('memory'),
      fx: (g) => { const m = g.recall('memory'); if (m === 'diary') g.stat('心情', 3); stayHome(g); },
      text: (g) => {
        const m = g.recall('memory');
        if (m === 'diary') return '日記寫滿了三本。有些事你忘了，翻開本子，它們又回來了。';
        if (m === 'ai') return 'AI 替你記著所有人的生日。它提醒你給' + (family(g) ? '家裡人' : '老朋友') + '打電話的時候，你總是假裝是自己想起來的。';
        return '藥一直吃著。你還認得身邊的每一個人，這就夠了。';
      } },
    { id: 'o_bday_echo', age: 87, t: '那次生日', auto: true,
      cond: (g) => !!g.recall('bday'),
      text: (g) => {
        const b = g.recall('bday');
        if (b === 'big') return '那八桌壽宴的照片，被親戚們轉了很多遍。你在照片裡笑得很開。';
        if (b === 'sea') return '你常說起那次看海。說著說著，就睡著了。';
        return '那頓生日飯吃的什麼，你記不清了。只記得一桌人都在。';
      } },

    /* ================= 88 岁：最后想去的地方 ================= */
    { id: 'o_last_place', age: 88, t: '還想去一個地方', loc: 'home',
      text: (g) => '你跟' + famWord(g) + '說，趁還能出門，想再去一個地方。',
      choices: [
        { t: '哪兒也不去，在家挺好', canon: true, fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('心情', 1); }, res: '你說說而已。窗外的樹，你也看了好些年了。' },
        { t: '回出生的地方', dev: 15, cond: (g) => !atHometown(g), fx: (g) => { g.remember('lastTrip', 'birth'); g.stat('心情', 5); g.stat('健康', -3); CN.goHome(g); }, res: '有人推著輪椅陪你。你停在出生的那條街上，已經認不出來了。可是風的味道沒變。' },
        { t: '去年輕時打拼的那座城市', dev: 15, cond: (g) => !!g.recall('workCity'), fx: (g) => { g.remember('lastTrip', 'work'); g.stat('心情', 4); g.stat('健康', -3); g.move('metro', g.recall('workCity')); }, res: '你坐在當年住過的樓下。樓還在，窗戶換了。' },
        { t: '去一個從沒去過的地方', dev: 30, check: ['健康', 35], fx: (g) => { g.remember('lastTrip', 'new'); g.stat('心情', 7); g.stat('健康', -4); g.move('road', '路上'); }, res: (g) => (family(g) ? '家裡人輪流推著輪椅。' : '你跟著一個有醫生隨行的老年團。') + '八十八歲，你第一次看見雪山。',
          fail: { fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('健康', -3); }, res: '走到半路，身體不答應了。你在車上睡著了，醒來已經在回家的路上。', dev: 0 } },
      ] },
    { id: 'o_gk_grown', age: 89, t: '孫輩長大了', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 20,
      fx: (g) => { if (g.recall('gkCare') === 'full') g.stat('心情', 4); },
      text: (g) => {
        const c = g.recall('gkCare');
        const id = gkIds(g)[0];
        const n = g.name(id);
        if (c === 'full') return CN.who(g, id, true) + '大學畢業了。畢業照裡，' + n + '把你也拉進了鏡頭，說是你帶大的。';
        if (c === 'none') return CN.who(g, id, true) + '大學畢業了。你們見面不多，每次見，' + n + '都客客氣氣地叫你。';
        return CN.who(g, id, true) + '長大了。小時候你接送過的那條路，' + n + '還記得。';
      } },
    { id: 'o_ninety', age: 90, t: '九十', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => {
        const p = partner(g);
        if (p === 'sp') { const y = g.since('spouse'); return '九十歲。你和' + spName(g) + '還在一起' + (y >= 55 ? '，結婚 ' + y + ' 年了。社群上門來給你們拍了張' + (y >= 60 ? '鑽石婚' : '結婚紀念') + '的照片。' : '。社群上門來給你們拍了張合影。') + '你們倆誰也不肯先看鏡頭。'; }
        if (p === 'sp2') return '九十歲。晚年搭伴的' + spName(g) + '給你剝了一碗花生，一顆一顆放在你手心裡。';
        return '九十歲。和你同一年出生的那些人，已經走了一大半。' + (hasKid(g) ? kidName(g) + '也滿頭白髮了，' + '給你切蛋糕的時候手有點抖。' : '社群的人給你送來一碗長壽麵，還冒著熱氣。');
      } },
    { id: 'o_letter', age: 91, t: '留幾句話',
      text: (g) => (family(g) ? '你想給家裡人留幾句話。' : '你想給後來的人留幾句話。'),
      choices: [
        { t: '寫信，一人一封', canon: true, fx: (g) => { g.remember('legacy', 'letters'); g.stat('心情', 3); }, res: '你的字抖得厲害，一封信寫了三天。' },
        { t: '對著手機錄一段影片', dev: 10, fx: (g) => { g.remember('legacy', 'video'); g.stat('心情', 2); }, res: '錄了十幾遍。最後那一遍，你笑著說了句“就這樣吧”。' },
        { t: '不留了，該說的都說過', dev: 10, fx: (g) => { g.remember('legacy', 'none'); }, res: '你說，話說多了，記得的人反而累。' },
      ] },

    /* ================= 92–100 岁：慢下来的日子 ================= */
    { id: 'o_trip_echo', age: 92, t: '那一趟', auto: true,
      cond: (g) => !!g.recall('lastTrip'),
      fx: (g) => stayHome(g),
      text: (g) => {
        const t = g.recall('lastTrip');
        if (t === 'birth') return '你常說起回出生地的那一趟。說的次數多了，細節一次比一次多。';
        if (t === 'work') return '你常說起回去看的那座城市。那些年的苦，說出來都成了好玩的事。';
        if (t === 'new') return '那座雪山的照片，你設成了手機螢幕。';
        return '你哪兒也沒去。不過這些年，窗外那棵樹你看得比誰都熟。';
      } },
    { id: 'o_92_day', age: 92, t: '一天', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        if (lw(g) === 'nursing') return '養老院的一天從量血壓開始。上午曬太陽，下午聽人讀報，晚上七點熄燈。' + (hasSp(g) ? spName(g) + '的床就挨著你的，夜裡伸手就夠得著。' : '護工小姑娘叫你“老寶貝”，你假裝不高興。');
        if (lw(g) === 'kids' || hasKid(g) && CN.livesWith(g, kid1(g))) return '早上' + kidName(g) + '給你泡好一杯麥片，出門前把電視調到你愛看的臺。你看著看著就睡了，醒來正好吃午飯。';
        if (hasSp(g)) return '你和' + spName(g) + '每天的事就是互相提醒吃藥。誰先忘了，另一個就得意一整天。';
        if (g.recall('robot') === 'home' || g.recall('robotBuy')) return '機器人每天七點拉開窗簾，跟你報天氣。你回它一句“知道了”，一天就開始了。';
        return '社群的網格員每天上午來敲一次門。你早早就坐在門口等著，好像等的是客人。';
      } },
    { id: 'o_legacy_echo', age: 93, t: '後來的人', auto: true,
      cond: (g) => !!g.recall('legacy'),
      text: (g) => {
        const l = g.recall('legacy');
        if (l === 'letters') return '你寫的信，有人當場拆開讀了，有人說要留到以後。';
        if (l === 'video') return hasKid(g) ? '那段影片，家裡人存在了好幾個地方。孩子說，想你的時候就看看。' : '那段影片，' + (hasSp(g) ? spName(g) + '看了一遍又一遍。' : '社群的人幫你存進了“老人口述”的檔案裡。');
        return '你沒留什麼話。可是身邊的人說話時，常學著你的口氣。';
      } },
    { id: 'o_93_money', age: 93, t: '賬', auto: true,
      fx: (g) => { if (liquid(g) >= 100000 && lw(g) !== 'nursing') { spend(g, 60000); g.remember('oldNanny', true); } },
      text: (g) => {
        const m = '每月退休金 ' + CN.fmt(PEN[g.recall('pension')] / 12) + '，存款還有 ' + CN.fmt(liquid(g)) + '。';
        if (g.recall('oldNanny')) return '你請了一個住家保姆，一年 ' + CN.fmt(60000) + '。她做的菜偏鹹，你沒說，她也慢慢改淡了。' + m;
        if (lw(g) === 'nursing') return '養老院的賬每月一結。' + m + '你說夠花，護工說你是院裡最會算賬的人。';
        if (g.recall('kidHelp')) return '孩子每個月往你卡里打錢，你一分沒動，攢著給孫輩。' + m;
        return '你還是自己管錢，一筆一筆記在本子上。' + m + '夠吃夠用。';
      } },
    { id: 'o_last_wish', age: 94, t: '想要什麼',
      text: (g) => famWord(g) + '問你，現在最想要什麼。',
      choices: [
        { t: '想吃一口小時候的飯', canon: true, fx: (g) => { g.remember('lastWish', 'food'); g.stat('心情', 4); }, res: '他們照著你說的做了。味道不太對，你還是吃完了。' },
        { t: '想見一個很久沒見的人', dev: 15, fx: (g) => { g.remember('lastWish', 'person'); g.stat('人缘', 3); }, res: '他們打了好多電話，找到了。' },
        { t: '什麼都不想要，挺好', dev: 5, fx: (g) => { g.remember('lastWish', 'none'); g.stat('心情', 2); }, res: '你說，人老了，想要的東西就少了。' },
      ] },
    { id: 'o_lastwish_echo', age: 95, t: '願望', auto: true,
      cond: (g) => !!g.recall('lastWish'),
      text: (g) => {
        const w = g.recall('lastWish');
        if (w === 'person') return '那個很久沒見的人坐著輪椅來了。你們兩個老人拉著手，半天說不出話，後來一起笑了。';
        if (w === 'food') return '那頓飯以後，身邊的人學會了做。每次端上來，你都說比上回像了。';
        return '你說什麼都不要。身邊的人還是每天多陪你坐一會兒。';
      } },
    { id: 'o_95_spring', age: 95, t: '春天', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.s('健康') >= 25 ? '九十五歲的春天，你讓人扶著在樓下走了二十步。玉蘭開了，你站著看了很久。' : '九十五歲的春天，你下不了樓了。' + (family(g) ? '家裡人' : '護工') + '折了一枝玉蘭插在你床頭的瓶子裡。') },
    { id: 'o_slow', age: 96, t: '慢', auto: true,
      text: (g) => '你說話越來越慢，睡得越來越多。醒來的時候，常常要想一想今年是哪一年。' + (g.recall('memory') === 'diary' ? '床頭那幾本日記，有人每天念一頁給你聽。' : (hasSp(g) ? spName(g) + '就告訴你，又過了一年。' : '可是窗外的鳥叫，你一聽就知道是早上。')) },
    { id: 'o_great_gk', age: 97, t: '四代人', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28,
      fx: (g) => g.stat('心情', 5),
      text: (g) => CN.who(g, gkIds(g)[0], true) + '抱著剛滿月的孩子來看你。你成了太' + (isMale(g) ? '爺爺' : '奶奶') + '。四代人擠在一張照片裡，你在最中間，手裡攥著那隻小腳。' },
    { id: 'o_97_sun', age: 97, t: '曬太陽', auto: true,
      cond: (g) => !(hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28),
      text: (g) => company(g) + '。午後的太陽照進來，你把手伸到光裡，看了好一會兒。' },
    { id: 'o_98', age: 98, t: '九十八', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        const who = hasKid(g) ? kidName(g) + '在蛋糕上插了兩根數字蠟燭，9 和 8。' : '社群送來一個小蛋糕，插著 9 和 8 兩根數字蠟燭。';
        return '九十八歲生日。' + who + (g.s('健康') >= 20 ? '你一口氣吹滅了，大家都鼓掌。' : '你吹了兩回，旁邊的人幫你吹了第三口。');
      } },
    { id: 'o_99', age: 99, t: '夢', auto: true,
      text: (g) => '你開始分不清夢和醒。夢裡你還' + (g.recall('hukou') === 'rural' ? '在村口的河邊，水很涼' : '在小時候住的樓下，有人喊你回家吃飯') + '。醒來，' + (CN.alone(g) ? '屋裡的燈亮著，' + '機器人在床邊守著。' : '有人握著你的手。') },
    { id: 'o_hundred', age: 100, t: '一百歲', auto: true,
      fx: (g) => g.stat('心情', 5),
      text: (g) => '一百歲。社群送來了一塊“百歲壽星”的牌子，記者來拍照。你問他們，今天是什麼好日子。' + (hasGk(g) ? '孫輩們搶著跟你合影。' : hasKid(g) ? kidName(g) + '在旁邊替你回答。' : '護工替你把牌子掛在了床頭。') },
  ]);

  /* ---------- 一百岁以后：每年一句 ---------- */
  const LATE = [
    (g) => '一百零一歲。你每天醒來，先看一眼窗外，再看一眼床頭的照片。',
    (g) => '一百零二歲。' + company(g) + '。有人給你讀新聞，你聽一會兒，說：“還是老樣子。”',
    (g) => '一百零三歲。你還記得自己的名字，也記得' + (hasKid(g) ? kidName(g) + '小時候的樣子。' : '小時候家門口那棵樹。'),
    (g) => '一百零四歲。你吃得很少，一碗粥能喝一上午。喝完了，你會說一聲“好”。',
    (g) => '一百零五歲。來看你的人換了一茬又一茬。他們說，你是這一帶年紀最大的人。',
    (g) => '一百零六歲。你大多數時候在睡。醒著的時候，你在笑。',
    (g) => '一百零七歲。窗外的鳥換了好幾代了。你還認得它們的叫聲。',
    (g) => '一百零八歲。有人問你長壽的秘訣，你想了很久，說：“吃飯，睡覺。”',
  ];
  JY.addLifeNodes(LATE.map((f, i) => ({ id: 'o_late_' + (101 + i), age: 101 + i, t: '又一年', auto: true, text: f })));

  /* ---------- 老伴走了、最后一次住院：哪一年发生不一定，用必定触发的意外 ---------- */
  JY.addEncounters([
    { id: 'e_o_widowed', y: [2026, 2200], minAge: 65, t: '一個人了', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', '喪偶'); g.stat('心情', -12); g.stat('健康', -3); },
      text: (g) => {
        const n = JY.byId.sp ? g.name('sp') : '老伴';
        if (lw(g) === 'nursing') return n + '走了以後，養老院那間屋裡空了一張床。你還是每天把' + n + '的杯子洗乾淨。';
        if (CN.alone(g)) return n + '走了以後，你還是每天做兩個人的飯。做好了，才想起來。';
        return n + '走了以後，你吃飯時還是給' + n + '留一個位子。家裡人看見了，誰也沒說。';
      } },
    { id: 'e_o_after_widow', y: [2026, 2200], minAge: 66, t: '往後的日子', always: true,
      cond: (g) => g.recall('love') === 'widowed' && g.since('love') >= 1 && freeYear(g) && g.s('健康') > 22,
      text: (g) => {
        if (g.since('love') >= 5) return (CN.alone(g) ? '你一個人過了好些年。' : '老伴走了好些年了。') + '有人給你介紹一個老伴，說兩個人搭個伴，有個照應。';
        return '老伴走了一年多。' + (hasKid(g) ? '孩子們輪流來勸你' : '老鄰居們來勸你') + '，往後的日子，得有個打算。';
      },
      choices: [
        { t: '就這樣過', canon: true, fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', 1); }, res: '你把老伴的照片擦乾淨，擺在飯桌上。' },
        { t: '搬去和孩子住', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { g.remember('afterWidow', 'kids'); toKids(g); }, res: '你只帶走了一個相框和一件舊毛衣。' },
        { t: '住進養老院，圖個熱鬧', dev: 15, cond: (g) => !hasKid(g) && lw(g) !== 'nursing' && canNursing(g), fx: (g) => { g.remember('afterWidow', 'nursing'); toNursing(g); }, res: '你挑了一家有花園的。第一天晚飯，同桌的老太太就問你會不會打牌。' },
        { t: '再找個老伴', dev: 30, check: ['人缘', 50],
          fx: (g) => { g.remember('remarried', true); g.remember('afterWidow', 'remarry'); const p = CN.person({ id: 'sp2', sex: isMale(g) ? '女' : '男', born: g.Y - g.age + CN.ri(-4, 4), origin: '老年大學認識的' }); g.spawn(p); g.rel('老伴', 'sp2', '晚年再婚'); CN.liveWith(g, ['sp2']); g.info('婚姻', '再婚'); g.stat('心情', 8); },
          res: '你們沒辦酒席，只請兩邊的孩子吃了頓飯。有人背後說閒話，你裝作沒聽見。',
          fail: { fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', -2); }, res: '見了兩回，對方的孩子不同意。這事就散了。你們後來還常在公園碰見，點點頭。', dev: 0 } },
      ] },
    { id: 'e_o_remarry_echo', y: [2026, 2200], minAge: 68, t: '搭伴過日子', auto: true, always: true,
      cond: (g) => g.recall('remarried') === true && g.since('remarried') >= 2,
      fx: (g) => g.stat('健康', 2),
      text: (g) => (JY.byId.sp2 && g.alive('sp2') ? '再婚兩年，你們倆每天一起買菜、散步，為放多少鹽吵嘴。孩子們說，你氣色好多了。' : '晚年找的那個伴，陪了你沒幾年，也走了。你不後悔。') },
    { id: 'e_o_alone_echo', y: [2026, 2200], minAge: 68, t: '這幾年', auto: true, always: true,
      cond: (g) => !!g.recall('afterWidow') && g.recall('afterWidow') !== 'remarry' && g.since('afterWidow') >= 3,
      text: (g) => {
        const a = g.recall('afterWidow');
        if (a === 'kids') return '在孩子家住久了，你的東西也一點點多起來。那件舊毛衣，你一直沒捨得穿。';
        if (a === 'nursing' || lw(g) === 'nursing') return '養老院裡，你有了幾個老夥伴。誰過生日，大家就湊錢買一個小蛋糕。';
        if (CN.alone(g)) return '一個人過了幾年，你學會了跟照片說話。說完今天吃了什麼，就關燈睡覺。';
        return '老伴走了幾年，你' + CN.hhText(g) + '。你每天吃完飯，跟照片說一聲“吃過了”。';
      } },
    { id: 'e_o_last_hospital', y: [2026, 2200], minAge: 78, t: '又進了醫院', loc: 'hospital', always: true,
      cond: (g) => g.s('健康') <= 22 && freeYear(g),
      text: (g) => {
        const i = g.recall('icu');
        const pre = i === 'no' ? '你早就簽過字：不插管，不進 ICU。' : i === 'yes' ? '你早就說過：能救就救。' : i === 'kids' ? '你說過，到時候讓家裡人決定。' : '';
        return '你又一次被送進了醫院。醫生把' + (family(g) ? '家裡人' : '社群的人') + '叫到走廊上。' + pre;
      },
      choices: [
        { t: '進 ICU，插管，接著治', canon: true, fx: (g) => { spend(g, 60000); g.stat('健康', 14); g.stat('心情', -8); g.remember('lastCall', 'icu'); }, res: () => '你在 ICU 裡躺了十幾天，又被推了出來。' + (paid ? '醫保報完，自費 ' + CN.fmt(paid) + '。' : '醫保和救助兜了底。') },
        { t: '回家，不受這個罪', dev: 20, fatal: true, fx: (g) => { g.die((g.recall('icu') === 'no' ? '照著自己當年籤的字，' : '') + '在家裡，在睡夢中離世'); }, res: (g) => (family(g) ? '家裡人把你接回了家。' : '社群的人把你送回了家。') + '那天晚上，屋裡的燈一直開著。' },
        { t: '聽孩子們的', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('lastCall', 'kids'); if (g.rnd() < 0.5) g.stat('健康', 12); else g.die('在醫院裡，家人陪在身邊離世'); }, res: '孩子們商量了一夜。' },
      ] },
    { id: 'e_o_after_icu', y: [2026, 2200], minAge: 78, t: '出院以後', auto: true, always: true,
      cond: (g) => !!g.recall('lastCall') && g.since('lastCall') >= 1,
      text: (g) => (g.recall('lastCall') === 'icu' ? '從 ICU 出來以後，你瘦了一大圈。你說，多活的每一天都是賺的。' : '孩子們替你拿了主意。你後來跟他們說，你們拿得對。') },
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
    { t: '退休以後，你每天醒得比上班時還早。', cond: (g) => g.recall('retired') === true && g.age < 80 },
    { t: '你翻出以前上班的工牌看了一會兒，又放回抽屜。', cond: (g) => g.recall('retired') === true },
    { t: '菜市場的攤主給你多抓了一把蔥，說老主顧了。', cond: (g) => g.recall('retired') === true && g.age < 85 && lw(g) !== 'nursing' },
    { t: '你在樓下的長椅上坐了一下午，和路過的每隻貓打了招呼。', cond: (g) => g.recall('retired') === true && g.age >= 75 },
    { t: '天氣好，有人推你出去轉了一圈。路邊的月季開得正旺。', cond: (g) => g.recall('retired') === true && g.age >= 88 },
    { t: '你把年輕時的照片翻出來，指著其中一張說，這個人是我。', cond: (g) => g.recall('retired') === true && g.age >= 85 },
  ]);
})();

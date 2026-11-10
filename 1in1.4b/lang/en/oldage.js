/* 由 share/tools/tr.js 从 data/oldage.js 和 lang/en/tr/oldage.json 生成，不要手改。 */
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
  const kidName = (g) => (kid1(g) ? g.name(kid1(g)) : 'your child');
  const gkIds = (g) => ['gk1', 'gk2', 'gk3'].filter((id) => JY.byId[id] && g.alive(id));
  const hasGk = (g) => gkIds(g).length > 0;
  // 老伴：原配还在，或者晚年再婚的那个
  const partner = (g) => {
    if (g.recall('love') === 'married' && JY.byId.sp && g.alive('sp')) return 'sp';
    if (g.recall('remarried') === true && JY.byId.sp2 && g.alive('sp2')) return 'sp2';
    return null;
  };
  const hasSp = (g) => !!partner(g);
  const spName = (g) => (partner(g) ? g.name(partner(g)) : 'late-life partner');
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
  const famWord = (g) => (family(g) ? 'Family' : 'The volunteer');
  // 返聘：只请有真本事、身体也还行的人。学识、事业够高，或者是医生、老师、技术、有手艺的工人
  const SKILLED = ['doctor', 'teacher', 'nurse', 'tech'];
  const ableToRehire = (g) => g.s('健康') >= 50 && (g.s('学识') >= 72 || g.s('事业') >= 65
    || (SKILLED.includes(g.recall('preJob')) && g.s('学识') >= 55) || (g.recall('preJob') === 'worker' && !!g.recall('skill'))
    || g.recall('consult') === 'part' || g.recall('ladder40') === 'expert');
  const rehireMonth = (g) => round1k(Math.max(3000, (CN.jobPay ? CN.jobPay(g, g.recall('preJob') || 'office', null) : 8000) * 0.5));
  const REHIRE = { doctor: 'Your old hospital asks you to come back and see patients, three half-days a week.', teacher: 'The school is short of experienced teachers and asks you to come back and coach the new ones.', nurse: 'The hospital’s nursing department asks you to come back and train the interns.',
    tech: 'Your old company still runs a legacy system that only you fully understand, and it asks you to come back as a consultant.', worker: 'The new equipment at the factory has broken down, and of all the old masters only you can fix it. They ask you to come back and train apprentices.',
    civil: 'Your old office asks you to come back to help train newcomers and sort through years of files.', soldier: 'The local military office asks you to come back and give talks to new recruits.' };
  // 能不能住得起养老院（一年约 ¥6 万）
  const canNursing = (g) => liquid(g) >= 150000 || CN.income(g) >= 50000 || hasKid(g);
  // 现在住哪儿，场景跟着走
  const stayHome = (g) => {
    const l = lw(g);
    if (l === 'hometown') CN.goHome(g);
    else if (l === 'nursing') g.move('home', 'Nursing home');
    else if (l === 'kids') g.move('home', (g.recall('kidCity') || 'your child’s place') + ' · Child’s home');
    else if (g.recall('house') === 'hometown' || ((g.recall('tier') || 5) >= 5 && !g.recall('workCity'))) CN.goHome(g);
    else g.move('home', g.recall('workCity') || g.recall('homeCap') || 'Home');
  };
  // 搬去和孩子住
  const toKids = (g) => {
    if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') || 'the provincial capital');
    g.remember('liveWith', 'kids');
    CN.liveWith(g, [kid1(g)].concat(gkIds(g)));
    g.info('住处', (g.recall('kidCity') === 'abroad' ? 'abroad' : g.recall('kidCity')) + ', with your child');
    stayHome(g);
  };
  // 住进养老院：只有老伴跟着
  const toNursing = (g, cap) => {
    g.remember('liveWith', 'nursing');
    CN.moveOut(g, kidIds(g).concat(gkIds(g), ['fa', 'mo', 'sib0', 'sib1']));
    g.info('住处', cap || 'Nursing home');
    stayHome(g);
  };
  // 生一个孙辈：id gk1、gk2；儿子的孩子叫孙子孙女，女儿的孩子叫外孙外孙女
  const addGrandkid = (g, kidId) => {
    const kid = JY.byId[kidId];
    if (!kid) return null;
    const n = (g.recall('grandkids') || 0) + 1;
    const fromSon = kid.sex === '男';
    const gk = CN.person({ id: 'gk' + n, born: g.Y, surname: fromSon ? CN.surOf(kid.name) : undefined, origin: kid.name + '’s child' });
    g.spawn(gk);
    const label = fromSon ? (gk.sex === '男' ? 'grandson' : 'granddaughter') : (gk.sex === '男' ? 'grandson' : 'granddaughter');
    g.rel(n === 1 ? label : 'little ' + label, gk.id, kid.name + '’s child');
    g.remember('grandkids', n);
    if (lw(g) === 'kids' && CN.livesWith(g, kidId)) CN.liveWith(g, [gk.id]);
    return gk;
  };
  // 一句“身边有谁”
  const company = (g) => {
    if (lw(g) === 'nursing') return hasSp(g) ? 'You and ' + spName(g) + ' share a room at the nursing home' : 'You live in the nursing home, and a care aide comes by several times a day';
    if (CN.alone(g)) return 'You live alone, and someone from the neighborhood committee knocks on your door once a day';
    return CN.youHh(g);
  };

  JY.addFlags({
    donatedHouse: 'Left your property to your hometown school, which later gained a library room',
    oldStoryteller: 'Told the village children old stories for many years in your later life',
  });

  JY.addLifeNodes([
    /* ================= 65 岁：退休 ================= */
    { id: 'o_pension', age: 65, t: 'Retired', auto: true,
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
        CN.setJob(g, 'retired', 'Retired');
        g.info('Pension', { high: 'Steady', mid: 'Enough', low: 'Meager', savings: 'Living on savings' }[p]);
        if (p === 'low') g.stat('心情', -2);
      },
      text: (g) => {
        const p = g.recall('pension');
        const month = CN.fmt(PEN[p] / 12);
        const debt = debtW(g) > 0 ? 'Remaining mortgage: ' + CN.fmt(debtW(g) * 1e4) + ', so the payments go on. ' : '';
        const save = 'Savings: ' + CN.fmt(liquid(g)) + '. ';
        if (p === 'high') return 'At sixty-five, you filed your retirement papers. Your workplace held a short meeting and gave you a bouquet. Your monthly pension is ' + month + ' a month, paid on time. It covers your needs, with a little left over to help your kids. ' + save + debt;
        if (p === 'mid') return 'At sixty-five, you collected your first pension payment: ' + month + ' a month. It is not much and not little, but enough to get by. ' + save + debt;
        if (p === 'savings') return 'At sixty-five, nobody arranged a retirement for you. Your pension is only ' + month + ' a month. You glanced at the ' + CN.fmt(liquid(g)) + ' in your account and decided it was enough. ' + debt;
        return 'At sixty-five, you collected your first pension payment: ' + month + ' a month. It covers groceries but not doctors. ' + save + 'You did not feel retired, only old. ' + debt;
      } },
    { id: 'o_after_retire', age: 65, t: 'After retirement', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && ableToRehire(g),
      text: (g) => 'The morning after you handed in your work badge, you still woke up at six.' + (REHIRE[g.recall('preJob')] || 'Your old workplace phones to ask whether you would come back on a rehire contract as an advisor and help train the new people.'),
      choices: [
        { t: 'Rest completely', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('afterRetire', 'rest'); }, res: 'You hung up and took a stroll through the produce market. So this is how fresh the vegetables are in the morning.' },
        { t: (g) => 'Go back on a rehire contract for a few more years (an extra ' + CN.fmt(rehireMonth(g)) + ' a month, until you are seventy)', dev: 15, fx: (g) => { g.stat('健康', -2); g.remember('rehirePay', rehireMonth(g)); g.remember('afterRetire', 'rehire'); g.info('职业', 'Retired, rehired part-time'); },
          res: (g) => 'You had a work badge again, only now it said “Advisor.” You earned an extra ' + CN.fmt(g.recall('rehirePay')) + ' a month, and the young people called you teacher.' },
        { t: 'Learn something you never had time for when you were young', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: 'You signed up for the senior university, $115 a term. On the first day, you were there before anyone else.' },
      ] },
    { id: 'o_retire_plain', age: 65, t: 'After retirement', loc: 'home',
      cond: (g) => FORMAL.includes(g.recall('preJob')) && !ableToRehire(g),
      text: (g) => 'After you handed in your badge, your old workplace did not call again. You stayed home for a month, and your hands never knew where to go.' + (g.s('健康') < 50 ? 'Your back and knees were telling you it was time to rest.' : 'The supermarket downstairs had a notice up, hiring shelf stockers and night security guards.'),
      choices: [
        { t: 'Stay home, shop and cook', canon: true, fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); g.remember('afterRetire', 'rest'); }, res: (g) => 'You got to know the market well: whose tofu was tender, whose scale was honest.' + (CN.alone(g) ? '' : 'Mealtimes at home were more regular than before.') },
        { t: 'Pick up odd jobs for pocket money (about $285 a month)', dev: 10, cond: (g) => g.s('健康') >= 40,
          fx: (g) => { g.stat('健康', -1); g.stat('人缘', 2); g.remember('afterRetire', 'odd'); g.info('职业', 'Retired, doing odd jobs'); },
          res: (g) => 'You worked ' + CN.pick(['as a gatekeeper at the compound entrance', 'stocking shelves at a supermarket', 'minding stalls at the produce market', 'as a watchman at a nearby school']) + ', for about $285 a month. The work was light, and you got to talk to people.' },
        { t: 'Sign up for the senior university and learn something new', dev: 10, fx: (g) => { g.stat('学识', 3); g.stat('心情', 3); g.remember('afterRetire', 'learn'); g.remember('hobby', 'college'); }, res: 'The senior university costs $115 a term. You signed up for calligraphy and phone photography, and on the first day you were there before anyone else.' },
      ] },
    { id: 'o_keep_working', age: 65, t: 'Keep working?', loc: 'home',
      cond: (g) => !FORMAL.includes(g.recall('preJob')),
      text: (g) => {
        const j = g.recall('preJob');
        const m = 'Your monthly pension is ' + CN.fmt(PEN[g.recall('pension')] / 12) + '. ';
        if (j === 'farmer') return 'The land is still there, and your back bends a little more every year. The young people in the village have all left, and renting the land out would not bring in much.' + m;
        if (j === 'shop' || j === 'boss') return 'If you are away from the shop for a day, someone calls to ask about it. Your children say you should rest.' + m;
        if (j === 'rider' || j === 'driver' || j === 'creator' || j === 'freelance') return 'No employer arranged a retirement for you. The order-taking app is still open on your phone, and the orders keep getting fewer.' + m;
        return 'At your age, everyone around you says it is time to enjoy life. But no matter how you work out each month’s money, it always comes up a little short.' + m;
      },
      choices: [
        { t: 'Keep working until you cannot', canon: true, fx: (g) => { g.stat('健康', -3); g.remember('afterRetire', 'work'); }, res: 'You kept the same early starts and late returns. Some people said you could not sit still. You said you could not afford to.' },
        { t: 'Hand it over to your child and step back', dev: 10, cond: (g) => hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob')),
          fx: (g) => { g.stat('心情', 3); g.remember('afterRetire', 'handover'); }, res: 'On the day of the handover, you said a lot, and your child listened to half of it. So you stopped talking.' },
        { t: 'Sell off the business for a lump sum', dev: 10, cond: (g) => !(hasKid(g) && ['shop', 'boss', 'farmer'].includes(g.recall('preJob'))),
          fx: (g) => { const x = g.recall('preJob') === 'boss' ? 200000 : g.recall('preJob') === 'shop' ? 60000 : 20000; CN.earn(g, x); paid = x; g.stat('心情', 3); g.remember('afterRetire', 'handover'); },
          res: () => 'It fetched ' + CN.fmt(paid) + '. You put it in the bank and drew out a little every month.' },
        { t: 'Stop completely and live frugally', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('afterRetire', 'rest'); }, res: 'You switched off your alarm clock. If you saved a little, life could still go on.' },
      ] },

    /* ================= 66 岁：住哪儿 ================= */
    { id: 'o_first_morning', age: 66, t: 'A morning with no work', auto: true,
      fx: (g) => {
        const a = g.recall('afterRetire');
        if (a === 'rehire') CN.earn(g, 50000);
        else if (a === 'work') { CN.earn(g, g.recall('preJob') === 'farmer' ? 12000 : 30000); g.stat('健康', -1); }
        else g.stat('心情', 2);
      },
      text: (g) => {
        const a = g.recall('afterRetire');
        if (a === 'rehire') return 'In your year on the rehire contract, you earned an extra ' + CN.fmt(50000) + '. You noticed the young people did not listen much to what you said, so you started getting off one stop early and walking part of the way home.';
        if (a === 'learn') return 'The senior university’s class schedule was stuck on the fridge. For the first time, you felt that seven days a week were not enough.';
        if (a === 'work') return 'At sixty-six, you were still working, and you earned ' + CN.fmt(g.recall('preJob') === 'farmer' ? 12000 : 30000) + ' this year. One day after work you sat on the steps for a long time before you could stand up.';
        if (a === 'handover') return 'After you handed it over, you went by every day for a look and then left. Later you went every other day.';
        return 'You learned to sleep in. Only when the morning sun reached your bed did you remember there was nowhere you had to go today.';
      } },
    { id: 'o_gk_born', age: 66, t: 'Becoming an elder', auto: true,
      cond: (g) => hasKid(g) && g.ageOf(kid1(g)) >= 24 && !g.recall('grandkids'),
      fx: (g) => { if (g.rnd() < 0.75) { addGrandkid(g, kid1(g)); g.stat('心情', 6); } else g.remember('grandkids', 0); },
      text: (g) => (g.recall('grandkids') ? CN.who(g, kid1(g), true) + ' has a baby. You waited all night in the hospital corridor, and when you held the little one, your hands shook.' : CN.who(g, kid1(g), true) + ' says there are no plans for children for now. You opened your mouth and said nothing.') },
    { id: 'o_where', age: 66, t: 'Move in with your child?', loc: 'home',
      cond: (g) => hasKid(g),
      text: (g) => {
        const c = g.recall('kidCity');
        const who = CN.who(g, kid1(g), true);
        const gk = hasGk(g) ? 'there is nobody to mind the baby either, ' : '';
        if (c === 'abroad') return who + ' has settled abroad and says on video calls that the houses there are big, ' + gk + 'and wants you to come over and live together.';
        if (g.recall('plan60') === 'kid') return 'You moved to ' + c + ' several years ago and live not far from your child. ' + who + ' says, ' + gk + 'why not just move in together.';
        return who + ' calls to say the apartment in ' + (c ? c + ' ' : 'the city ') + 'has a spare room, ' + gk + 'and wants you' + (hasSp(g) ? ' both' : '') + ' to come and live together.';
      },
      choices: [
        { t: 'Pack up and move over', canon: true,
          fx: (g) => { if (!g.recall('kidCity')) g.remember('kidCity', g.recall('workCity') && g.rnd() < 0.5 ? g.recall('workCity') : CN.pick(['Beijing', 'Shanghai', 'Shenzhen', 'Hangzhou', 'Chengdu', 'Wuhan', 'Nanjing', 'Xi\'an'])); toKids(g); g.stat('人缘', 3); g.stat('心情', -1); },
          res: (g) => (g.recall('kidCity') === 'abroad' ? 'You brought two suitcases of clothes and a bag of rice from home. After the plane landed, you could not read a single character on the signs along the streets.' : 'You brought two suitcases of clothes and a bag of rice from home. The new home was very clean, and you did not know where to put your hands.') },
        { t: 'No, stay in your own home', dev: 10, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 2); stayHome(g); },
          res: (g) => (CN.alone(g) ? 'You said you were used to your place. After you hung up, the apartment was very quiet.' : 'You said you were both used to your place. After you hung up, ' + spName(g) + ' said that was just as well: live apart, and the visits mean more.') },
        { t: 'Follow nobody, go back to your hometown', dev: 20, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', 'Moved back to your hometown'); stayHome(g); }, res: 'The house in your hometown was covered in dust. You swept all day, and at night you heard insects you had not heard in decades.' },
      ] },
    { id: 'o_where_nokid', age: 66, t: 'Where to live from here', loc: 'home',
      cond: (g) => !hasKid(g),
      text: (g) => {
        if (hasSp(g)) return 'With no children nearby, you and ' + spName(g) + ' talk over how to live from here on.';
        if (CN.alone(g)) return 'You have lived alone for years. The neighborhood committee is registering elderly people who live alone and asks what you plan to do from here.';
        return CN.youHh(g) + '. The neighborhood committee is registering the elderly and asks what you plan to do from here.';
      },
      choices: [
        { t: 'Stay right here and carry on', canon: true, fx: (g) => { g.remember('liveWith', 'alone'); g.stat('心情', 1); stayHome(g); }, res: 'You installed a doorbell at the door that can call for help. Everything else stayed the same.' },
        { t: 'Go back to your hometown', dev: 15, cond: (g) => g.recall('house') !== 'hometown', fx: (g) => { g.remember('liveWith', 'hometown'); g.info('住处', 'Moved back to your hometown'); stayHome(g); }, res: 'A few old neighbors are still there. They remember the nickname you had as a child.' },
        { t: 'Move into a retirement community ($700 a month)', dev: 20, cond: (g) => liquid(g) >= 150000 || CN.income(g) >= 50000,
          fx: (g) => { toNursing(g, 'Retirement community'); g.stat('健康', 2); }, res: 'The community has a canteen and a doctor, and downstairs a group of people wait for you to play cards.' },
        { t: 'Go look at nursing homes and ask about prices first', dev: 10, cond: (g) => !(liquid(g) >= 150000 || CN.income(g) >= 50000),
          fx: (g) => { g.remember('liveWith', 'alone'); g.remember('robot', 'none'); g.stat('心情', -1); stayHome(g); }, res: 'It costs $700 a month, and your pension does not cover even a fraction of that. You went home and removed every raised threshold in the apartment so you would not trip one day.' },
      ] },

    /* ================= 67 岁：孙辈或者别的牵挂 ================= */
    { id: 'o_grandcare', age: 67, t: 'Looking after the little ones', loc: 'home',
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (CN.livesWith(g, gkIds(g)[0]) ? ' sleeps in the room next to yours. ' : '’s parents are both busy at work. ') + 'Who will look after the child has become a big family question.',
      choices: [
        { t: 'I will take care of the child, all day', canon: true, fx: (g) => { g.stat('健康', -3); g.stat('人缘', 4); g.remember('gkCare', 'full'); }, res: 'You learned to change diapers and mix formula all over again. Only your back was a lot stiffer than back then.' },
        { t: 'Help with school runs by day, hand the child back to them at night', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('gkCare', 'part'); }, res: 'Every day you left on time and came home on time. The hours in between were your own.' },
        { t: 'Pay for a helper (an “ayi”) and lend a hand yourself', dev: 15, cond: (g) => liquid(g) >= 80000,
          fx: (g) => { spend(g, 48000); g.remember('gkCare', 'paid'); g.stat('人缘', 2); }, res: () => 'It cost ' + CN.fmt(paid) + ' a year, and you paid it. The helper did the work while you watched from the side and held the child now and then.' },
        { t: 'Don’t help, everyone lives their own life', dev: 25, fx: (g) => { g.stat('心情', 3); g.stat('人缘', -3); g.remember('gkCare', 'none'); }, res: 'You made it clear from the start. The family was cold with you for a while, and then they hired a helper.' },
      ] },
    { id: 'o_pet', age: 67, t: 'Get something to look after', loc: 'home',
      cond: (g) => !hasGk(g) && !CN.pet(g) && lw(g) !== 'nursing',
      text: (g) => (CN.alone(g) ? 'The apartment is too quiet. An old neighbor from downstairs says that if you keep something alive, your days will have some sound in them.' : 'The house is quiet during the day. An old neighbor from downstairs says that if you keep something alive, your days will be livelier.'),
      choices: [
        { t: 'Fill the balcony with flowers', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('pet', 'plants'); }, res: 'You bought a dozen or so flowerpots. In the first month, half of them died.' },
        { t: (g) => ((g.recall('tier') || 5) <= 3 ? 'Get a dog (a pet-shop puppy for $430, plus $570 a year for shots and dog food)' : 'Get a dog (a puppy from a neighbor, free)'), dev: 10,
          fx: (g) => { if ((g.recall('tier') || 5) <= 3) CN.pay(g, 3000); CN.adoptPet(g, 'dog'); g.stat('健康', 2); g.stat('心情', 3); g.remember('pet', 'dog'); },
          res: (g) => 'It was called ' + CN.pet(g).name + '. Every morning at six, it woke you up for its walk. You could not sleep in anymore.' },
        { t: 'Adopt an old cat nobody wants from the rescue center', dev: 15,
          fx: (g) => { CN.pay(g, 500); CN.adoptPet(g, 'cat', CN.pick(['Old Yellow', 'Smokey', 'Tuantuan', 'Miss Calico'])); g.stat('心情', 3); g.remember('pet', 'cat'); },
          res: (g) => 'The rescue center said it was eight years old and nobody wanted it. You paid a $70 checkup fee and took ' + CN.pet(g).name + ' home. In the first week it hid under the bed, and by the second week it was sleeping at your feet.' },
        { t: 'Keep nothing, enjoy the quiet', dev: 10, fx: (g) => { g.remember('pet', 'none'); g.stat('心情', -1); }, res: 'You said you did not want to worry about anything else.' },
      ] },

    /* ================= 68 岁：爱好 ================= */
    { id: 'o_hobby', age: 68, t: 'Find something to do',
      cond: (g) => g.recall('afterRetire') !== 'learn',
      text: 'In the evening the square plays music, people play chess in the park, and a poster for the senior university’s enrollment hangs at the neighborhood center.',
      choices: [
        { t: 'Join the square dancing', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('人缘', 3); g.remember('hobby', 'dance'); }, res: 'You stood in the back row, missing several beats. On the third day, the lady leading the dance saved you a spot.' },
        { t: 'Sign up for the senior university', dev: 10, fx: (g) => { g.stat('学识', 3); g.remember('hobby', 'college'); }, res: 'You chose calligraphy. The brush felt heavier in your hand than you had imagined.' },
        { t: 'Go on a group tour', dev: 15, cond: (g) => liquid(g) >= 30000,
          fx: (g) => { spend(g, 12000); g.stat('心情', 5); g.remember('hobby', 'travel'); g.move('coast', 'Seaside · Tour group'); }, res: () => 'The tour cost ' + CN.fmt(paid) + '. You saw the sea for the first time, and the guide had to call you three times before you went back to the bus.' },
        { t: 'Watch short videos at home', dev: 5, fx: (g) => { g.stat('心情', 1); g.stat('健康', -1); g.remember('hobby', 'screen'); }, res: 'Once you started scrolling, a whole afternoon was gone. Some videos you liked again and again.' },
      ] },
    { id: 'o_learn_what', age: 68, t: 'Senior university',
      cond: (g) => g.recall('afterRetire') === 'learn',
      text: 'In your second year at the senior university, you could choose specialized courses.',
      choices: [
        { t: 'Calligraphy and ink painting', canon: true, fx: (g) => { g.stat('心情', 3); g.remember('learnWhat', 'art'); }, res: 'You copied model scripts for a year, and your characters slowly took shape.' },
        { t: 'Learn programming, and talk to robots', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('learnWhat', 'code'); }, res: 'You were the oldest in the class. You taught the robot at home to call you to dinner in your dialect.' },
        { t: 'Learn a musical instrument', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('learnWhat', 'music'); }, res: 'You picked the erhu (a two-stringed fiddle). The neighbors did not sleep well for a month.' },
      ] },

    /* ================= 69 岁：体检 ================= */
    { id: 'o_checkup', age: 69, t: 'Checkup report', loc: 'hospital',
      text: (g) => (g.s('健康') >= 60 ? 'Three arrows pointed up on the checkup report: blood pressure, blood sugar, cholesterol. The doctor said it was not serious but needed managing.' : 'It took three pages to flip through the checkup report. The doctor pointed at a few lines and said your body now needed real looking after.'),
      choices: [
        { t: 'Take your pills on time and watch what you eat', canon: true, fx: (g) => { g.stat('健康', 3); g.stat('心情', -1); g.remember('chronic', 'control'); stayHome(g); }, res: 'You bought a pill box with seven compartments and sorted the week’s pills every Sunday night.' },
        { t: 'Wear a health band and let an AI keep watch', dev: 10, fx: (g) => { spend(g, 2000); g.stat('健康', 2); g.remember('chronic', 'ai'); stayHome(g); }, res: 'The band cost $285. At every mealtime it reminded you to eat a bit less. You scolded it several times, and it kept reminding you anyway.' },
        { t: 'Don’t make a fuss, eat and drink as you like', dev: 15, fx: (g) => { g.stat('心情', 3); g.remember('chronic', 'ignore'); stayHome(g); }, res: 'You said that at your age, having to check the numbers before eating anything would be no fun at all.' },
      ] },

    /* ================= 70 岁 ================= */
    { id: 'o_seventy', age: 70, t: 'Seventieth birthday', auto: true,
      fx: (g) => { stayHome(g); g.stat('心情', 2); },
      text: (g) => {
        const bits = [];
        if (hasSp(g)) bits.push(spName(g) + ' cooked you a bowl of longevity noodles');
        if (hasGk(g)) bits.push(CN.livesWith(g, gkIds(g)[0]) ? 'your grandchildren leaned over the table, fighting to blow out the candles' : 'your grandchildren sang you happy birthday over a video call');
        else if (hasKid(g)) bits.push(kidName(g) + ' ordered a cake');
        if (lw(g) === 'nursing') bits.push('the retirement community held a party for everyone with a birthday this month');
        if (!bits.length) bits.push('an old neighbor from downstairs brought a small cake, and the two of you stuck in one candle');
        return 'Your seventieth birthday. ' + bits.join(', ') + '. ';
      } },
    { id: 'o_rehire_end', age: 70, t: 'Handed in the badge', auto: true,
      cond: (g) => g.recall('afterRetire') === 'rehire',
      fx: (g) => { paid = (Number(g.recall('rehirePay')) || 2500) * 12 * 5; CN.earn(g, paid); g.info('职业', 'Retired'); },
      text: () => 'At seventy, you handed in your advisor’s badge too. The rehire years brought in another ' + CN.fmt(paid) + '. On your last day, the young people chipped in and bought you a bouquet.' },
    { id: 'o_odd_end', age: 70, t: 'Done working', auto: true,
      cond: (g) => g.recall('afterRetire') === 'odd',
      fx: (g) => { paid = 2000 * 12 * 5; CN.earn(g, paid); g.info('职业', 'Retired'); g.stat('心情', 2); },
      text: () => 'At seventy, you quit the odd jobs. Over those years you earned ' + CN.fmt(paid) + ' bit by bit. On your last day, the regulars told you to drop by and sit with them often.' },

    /* ================= 71 岁：老伴生病，或者老朋友 ================= */
    { id: 'o_sp_sick', age: 71, t: 'Your spouse falls ill', loc: 'hospital',
      cond: (g) => hasSp(g),
      text: (g) => spName(g) + ' got up in the night to use the toilet and fell in the bathroom. It turned out to be a mild stroke, and from now on needs looking after.',
      choices: [
        { t: 'Care for them myself', canon: true, fx: (g) => { g.stat('健康', -4); g.stat('人缘', 3); g.remember('spCare', 'self'); stayHome(g); }, res: 'You learned to turn them over, wash them, and feed them. Waking every two hours at night became a habit.' },
        { t: 'Hire a caregiver or a care robot', dev: 10, cond: (g) => liquid(g) >= 60000,
          fx: (g) => { spend(g, 50000); g.stat('心情', 1); g.remember('spCare', 'paid'); stayHome(g); }, res: () => 'Over the year it cost ' + CN.fmt(paid) + '. The care robot was stronger than you and never minded the chores. Your job was to keep company and talk.' },
        { t: 'Send them to a rehabilitation hospital for a while', dev: 10,
          fx: (g) => { spend(g, 15000); g.remember('spCare', 'rehab'); stayHome(g); }, res: () => (paid ? 'Out of pocket: ' + CN.fmt(paid) + '. ' : 'Insurance covered most of it. ') + 'You took the bus every day to bring meals, two hours there and back.' },
        { t: 'Call your child to come home', dev: 10, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', -1); g.remember('spCare', 'kids'); stayHome(g); }, res: (g) => kidName(g) + ' took extended leave and came home. A month later, back to work again.' },
      ] },
    { id: 'o_old_friend', age: 71, t: 'Classmate reunion',
      cond: (g) => !hasSp(g),
      text: 'Someone in the middle school classmates’ group chat is organizing a reunion, saying that if you do not get together soon, there will not be enough people.',
      choices: [
        { t: 'Go', canon: true, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('reunion', 'went'); }, res: 'Around one table, you recognized half of them. When the talk turned to your teachers back then, everyone laughed.' },
        { t: 'Don’t go', dev: 10, fx: (g) => { g.remember('reunion', 'no'); }, res: 'You sent a red envelope to the group chat and said you were not up to it.' },
      ] },

    { id: 'o_spcare_echo', age: 73, t: 'At the bedside', auto: true,
      cond: (g) => !!g.recall('spCare'),
      fx: (g) => { if (g.recall('spCare') === 'self') g.stat('健康', -2); },
      text: (g) => {
        const c = g.recall('spCare');
        const alive = hasSp(g);
        const n = spName(g);
        if (c === 'self') return alive ? 'You had cared for ' + n + ' for two years. One day after you fed them, ' + n + ' took your hand and said, “Thank you for all your trouble.” It was the clearest thing they had said in two years.' : 'You nursed them through the illness, and they passed away all the same. You put the seven-compartment pill box away in a drawer.';
        if (c === 'paid') return alive ? 'The care robot remembered the operas ' + n + ' liked. The two of you leaned against the headboard and listened, a whole afternoon at a time.' : 'The day the robot was taken back, you stood in the doorway for a long time.';
        if (c === 'rehab') return alive ? n + ' came out of the rehab hospital and could walk downstairs with a cane. The two of you sat on a bench and watched children fly kites.' : 'A nurse from the rehab hospital sent you a card, saying that when ' + n + ' was there, they talked about you every day.';
        return hasKid(g) ? kidName(g) + ' video-calls every weekend to ask how Mom and Dad are doing. You always say fine.' : 'That illness passed. When the two of you talk about that time, you both say you owe it to the children.';
      } },
    { id: 'o_reunion_echo', age: 73, t: 'Classmates', auto: true,
      cond: (g) => !!g.recall('reunion'),
      text: (g) => (g.recall('reunion') === 'went' ? 'After the reunion, the group chat was lively for a while. A few old classmates who lived nearby arranged to meet once a month for morning tea.' : 'Someone later posted a group photo from the reunion you missed. You zoomed in and went through the faces one by one, and recognized seven or eight.') },

    /* ================= 72 岁 ================= */
    { id: 'o_robot_era', age: 72, t: 'The robot at home', auto: true,
      fx: (g) => { if (liquid(g) >= 60000 && lw(g) !== 'nursing') { spend(g, 30000); g.remember('robotBuy', true); g.stat('健康', 2); } },
      text: (g) => {
        if (lw(g) === 'nursing') return 'The nursing home added a few robots that push wheelchairs and play chess with residents. You beat one once and were happy all day.';
        if (g.recall('robotBuy')) return 'You spent ' + CN.fmt(30000) + ' on a housework robot that cooks, mops, and nags you when you forget your pills. You gave it a pet name.';
        return 'The neighborhood committee assigned a shared care robot to the very elderly, and it visits your home twice a week. Every time it leaves, it says, “See you next week.”';
      } },
    { id: 'o_work_stop', age: 72, t: 'Done', auto: true,
      cond: (g) => g.recall('afterRetire') === 'work',
      fx: (g) => { CN.earn(g, g.recall('preJob') === 'farmer' ? 50000 : 120000); g.info('职业', 'Retired'); g.stat('心情', 2); },
      text: (g) => 'At seventy-two, you finally stopped working. Those years brought in another ' + CN.fmt(g.recall('preJob') === 'farmer' ? 50000 : 120000) + ', enough for you to rest in peace.' + (g.recall('preJob') === 'farmer' ? 'You hung your hoe on the wall and polished it until it gleamed.' : 'You deleted the order-taking app, and your phone went quiet all at once.') },
    { id: 'o_pet_echo', age: 72, t: 'Living things', auto: true,
      cond: (g) => !!g.recall('pet'),
      fx: (g) => { if (g.recall('pet') === 'dog') g.stat('健康', 2); },
      text: (g) => {
        const p = g.recall('pet');
        if (p === 'dog') return 'The dog has grown old, and so have you. Your walking pace is exactly the same now.';
        if (p === 'cat') return CN.pet(g) ? 'The old cat lies on the windowsill in the afternoon sun. You read the paper, and it watches you.' : 'The old cat kept you company for a few years and died on a sunny day. You washed its cushion and put it away in the cupboard.';
        if (p === 'plants') return 'The half of the flowers on the balcony that survived are blooming especially well this year. People downstairs look up and ask how you grow them.';
        return 'You said you wanted no pets for the quiet. But one afternoon you talked to the windowsill for a long while.';
      } },
    { id: 'o_gk2', age: 72, t: 'Another grandchild', auto: true,
      cond: (g) => JY.byId.k2 && g.alive('k2') && g.ageOf('k2') >= 25 && (g.recall('grandkids') || 0) < 2,
      fx: (g) => { if (g.rnd() < 0.6) { addGrandkid(g, 'k2'); g.stat('心情', 4); } else g.remember('gk2No', true); },
      text: (g) => (g.recall('gk2No') ? CN.who(g, 'k2', true) + ' has not started a family yet. You say there is no hurry, but you are a little anxious.' : CN.who(g, 'k2', true) + ' has a child too. The whole family got together for a photo, and you sat in the middle.') },

    /* ================= 73 岁：骗子 ================= */
    { id: 'o_scam', age: 73, t: 'A phone call',
      text: 'The person on the line was very warm and called you “Auntie and Uncle.” They said a lecture was giving away free eggs, and you could also get a massage chair.',
      choices: [
        { t: 'Hang up and tell your child', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: 'Your child praised you over the phone. You felt a little proud.' },
        { t: 'Hang up and tell the neighborhood committee', canon: true, cond: (g) => !hasKid(g), fx: (g) => { g.stat('人缘', 1); g.remember('scam', 'hungup'); }, res: 'The young woman at the committee told the elderly in the building about you and said they should learn from you.' },
        { t: 'Go get the eggs, but buy nothing else', dev: 10, check: ['学识', 45], fx: (g) => { g.stat('心情', 2); g.remember('scam', 'eggs'); }, res: 'You took two cartons of eggs and left halfway through the lecture.',
          fail: { fx: (g) => { const x = Math.min(50000, Math.max(3000, round1k(CN.cash(g) * 0.2))); g.remember('scamLoss', spend(g, x)); g.remember('scam', 'cheated'); }, res: (g) => 'You had only meant to pick up eggs. When you walked out, you were holding a box of “lowers all three highs” health supplements, and your account was down ' + CN.fmt(g.recall('scamLoss')) + '. ', dev: 0 } },
        { t: 'Chat with them and ask about their life', dev: 20, fx: (g) => { g.stat('心情', 2); g.remember('scam', 'talked'); }, res: 'You asked how old he was and where his home was. He froze for a moment, then hung up.' },
      ] },
    { id: 'o_gk_school', age: 73, t: 'A grandchild starts school', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 6,
      fx: (g) => { if (liquid(g) >= 50000) { spend(g, 10000); g.remember('gkGift', true); } },
      text: (g) => (g.recall('gkGift') ? CN.who(g, gkIds(g)[0], true) + ' started primary school. You put ' + CN.fmt(10000) + ' in a red envelope, saying it was for a school bag, though it would buy a hundred school bags.' : CN.who(g, gkIds(g)[0], true) + ' started primary school. You stayed up all night sewing a name into the school bag, the stitches crooked.') },

    /* ================= 74 岁：摔跤，或者运动会 ================= */
    { id: 'o_fall', age: 74, t: 'A fall', loc: 'hospital',
      cond: (g) => g.s('健康') < 48,
      text: 'On a rainy day you slipped at the gate of the compound. The scan showed a broken femoral neck.',
      choices: [
        { t: 'Have surgery and get a joint replacement', canon: true, fx: (g) => { spend(g, 30000); g.stat('健康', 5); g.remember('fall', 'surgery'); }, res: () => (paid ? 'Insurance covered half, and you paid ' + CN.fmt(paid) + '. ' : 'Insurance covered most of it, and the rest ' + 'was easy enough to scrape together. ') + 'Three months later, you went downstairs with a walker.' },
        { t: 'Conservative treatment, rest in bed', dev: 10, fx: (g) => { g.stat('健康', -6); g.remember('fall', 'rest'); }, res: 'You lay in bed for half a year. When you got up, your leg was a size thinner.' },
        { t: 'Get an exoskeleton', dev: 20, cond: (g) => liquid(g) >= 150000, fx: (g) => { spend(g, 120000); g.stat('健康', 8); g.remember('fall', 'exo'); }, res: () => 'Insurance did not cover it, and it cost ' + CN.fmt(paid) + '. The exoskeleton clicked as you walked, and you were steadier than before the fall.' },
      ] },
    { id: 'o_sports', age: 74, t: 'Senior games',
      cond: (g) => g.s('健康') >= 48 && !g.recall('fall'),
      text: 'The neighborhood held a senior games, with gateball, tai chi and power walking.',
      choices: [
        { t: 'Sign up for tai chi', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('sports', 'taichi'); }, res: 'You were not very good, but you did not forget a single move.' },
        { t: 'Sign up for the power walk and go for a place', dev: 15, check: ['健康', 65], fx: (g) => { g.stat('心情', 5); g.remember('sports', 'medal'); }, res: 'You came third. The prize was a cooking pot, which you used for many years.',
          fail: { fx: (g) => { g.stat('健康', -3); g.remember('sports', 'hurt'); }, res: 'Halfway through, your knees refused to go on. You were helped off the course.', dev: 0 } },
        { t: 'Watch from the side', dev: 5, fx: (g) => { g.remember('sports', 'watch'); }, res: 'You cracked sunflower seeds on the sidelines all afternoon, cheering louder than anyone.' },
      ] },

    /* ================= 75 岁：回声 ================= */
    { id: 'o_hobby_echo', age: 75, t: 'Hobbies over the years', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      fx: (g) => { const h = g.recall('hobby'); if (h === 'dance') g.stat('健康', 2); if (h === 'screen') g.stat('健康', -2); },
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return 'Your calligraphy was hung in the senior university’s exhibition. ' + (hasKid(g) ? kidName(g) + ' took a photo and posted it online.' : 'You stood in front of the piece for a long time.');
        if (w === 'code') return 'The little program you wrote helps old people in the building call rides and book doctors. Some call you the “tech advisor.”';
        if (w === 'music') return 'Your erhu can play a whole piece now. The neighbors have started making requests.';
        const h = g.recall('hobby');
        if (h === 'dance') return g.s('健康') >= 50 ? 'After seven years of square dancing, you became the lead dancer. The newcomers call you teacher.' : 'After seven years of square dancing, your knees have started to protest. You moved to the back row and followed along with gestures, happy all the same.';
        if (h === 'college') return 'Your senior university classmates have become the people you see most at your age.';
        if (h === 'travel') return 'In these years you joined tours to a dozen or more places. The photos filled a whole memory card, and you cannot bear to delete one.';
        return 'You have scrolled through short videos for years. What you watch most is what other people’s old folks are up to.';
      } },
    { id: 'o_scam_echo', age: 75, t: 'After that phone call', auto: true,
      cond: (g) => !!g.recall('scam'),
      text: (g) => {
        const s = g.recall('scam');
        if (s === 'cheated') return 'That box of supplements is still in the cabinet. You stopped taking calls from strangers. ' + (hasKid(g) ? kidName(g) + ' installed a call blocker on your phone.' : 'Whoever calls, you ask them three times first.');
        if (s === 'talked') return 'You have taken a few more calls like that since. You still ask people how old they are and where their home is. One of them talked with you for twenty minutes and never mentioned eggs.';
        if (s === 'eggs') return 'A few old pals in the community were cheated out of money. You told them about your egg-collecting experience, and they said you were sharp as a tack.';
        return 'A poster against scams went up in the compound. The kind of call it described, you took long ago.';
      } },

    /* ================= 76 岁：以后谁照顾 ================= */
    { id: 'o_care_plan', age: 76, t: 'Who will look after you',
      cond: (g) => lw(g) !== 'nursing',
      text: (g) => {
        if (hasSp(g)) return 'You and ' + spName(g) + ' are both getting on in years. Twisting off jar lids, changing light bulbs, getting up at night: all of it has to be worked out between the two of you.';
        if (CN.alone(g)) return 'You are starting to feel that some things are too much to do alone: twisting off jar lids, changing light bulbs, getting up at night.';
        return 'In the daytime everyone in the house is out. Some things you can no longer do alone: twisting off jar lids, changing light bulbs, bending to pick things up.';
      },
      choices: [
        { t: 'Get a care robot that can do nursing', canon: true, fx: (g) => { spend(g, 40000); g.stat('健康', 3); g.remember('robot', 'home'); }, res: () => (paid >= 40000 ? 'It cost ' + CN.fmt(paid) + '. ' : 'You were short of money, and the neighborhood committee covered part of it. ') + 'It switched on the light when you got up at night, and answered when you spoke to it.' },
        { t: 'Move into a nursing home ($700 a month)', dev: 15, cond: (g) => canNursing(g), fx: (g) => { toNursing(g); g.stat('人缘', 2); }, res: (g) => 'You picked one not far from the old home. The window faced south. ' + (hasSp(g) ? spName(g) + ' shared a room with you.' : '') },
        { t: 'Move in with your child', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { toKids(g); }, res: 'Your child cleared the study for you. You heard the couple whispering about it.' },
        { t: 'Carry on as you are, no trouble to anyone', dev: 10, fx: (g) => { g.remember('robot', 'none'); g.stat('心情', 2); }, res: (g) => (lw(g) === 'kids' ? 'You said you could still get around. Your child installed handrails and night lights in your room.' : 'You said you knew where everything in the house was. That was enough.') },
      ] },

    /* ================= 77 岁 ================= */
    { id: 'o_chronic_echo', age: 77, t: 'Old ailments', auto: true,
      cond: (g) => !!g.recall('chronic'),
      fx: (g) => { const c = g.recall('chronic'); if (c === 'ignore') { g.stat('健康', -8); spend(g, 40000); g.remember('heartBill', paid); } else if (c === 'ai') g.stat('健康', 3); else g.stat('健康', 2); },
      text: (g) => {
        const c = g.recall('chronic');
        if (c === 'ignore') return 'You never took those arrows seriously. This spring, a heart attack put you in the hospital, and they pulled you through. ' + (g.recall('heartBill') ? 'Out of pocket: ' + CN.fmt(g.recall('heartBill')) + '. ' : '') + 'The doctor said another half hour and it would have been hard to say.';
        if (c === 'ai') return 'The band has looked after you for eight years. The doctor flipped through your records and said you had kept things better controlled than most people these years.';
        return 'You are on your third seven-compartment pill box. Your blood pressure has stayed steady, and your numbers look better than your peers’.';
      } },
    { id: 'o_fall_echo', age: 77, t: 'Legs and feet', auto: true,
      cond: (g) => !!g.recall('fall') || !!g.recall('sports'),
      text: (g) => {
        const f = g.recall('fall');
        if (f === 'exo') return 'The exoskeleton has been upgraded to a new generation, half the weight. You wear it to the produce market, and small children follow along to watch.';
        if (f === 'surgery') return 'The leg that was replaced aches on cloudy days. You are more accurate than the weather forecast.';
        if (f === 'rest') return 'After that fall, you went out less. The bench downstairs became the farthest you went.';
        const s = g.recall('sports');
        if (s === 'medal') return 'You still use that prize pot. Whoever comes to eat at your home, you bring it up.';
        if (s === 'taichi') return 'Every morning you do that set of tai chi, and you have not missed a day in three years.';
        if (s === 'hurt') return 'That power walk hurt your knees, and since then you only watch from the sidelines.';
        return 'You still like watching other people move from the sidelines, sitting down yourself.';
      } },
    { id: 'o_look_back_edu', age: 77, t: 'Remembering school days', auto: true,
      text: (g) => {
        const e = g.recall('edu');
        const u = g.recall('uni');
        const where = g.recall('hukou') === 'rural' ? 'the village' : g.recall('hukou') === 'county' ? 'the county seat' : 'the city';
        if (e === 'phd' || e === 'master') return 'You often think of your graduate school years, the lab lights, the late-night snacks at the canteen. Back then, the future felt like a very long road.';
        if (e === 'bachelor' || e === 'college') return 'You can no longer remember the name of the person in the upper bunk of your college dorm. But what ' + (u === 'top' ? 'the famous campus gate' : 'the little restaurant outside the school gate') + ' looked like, you can recall with your eyes closed.';
        if (e === 'vocational') return 'You often think of the smell of machine oil in the vocational school workshop. The trade you learned there fed you for most of your life.';
        if (e === 'senior') return 'You often remember the two days of the gaokao (the college entrance exam), when the area outside the exam site in ' + where + ' was packed with waiting parents.';
        return 'You did not read much. But in ' + where + ', you remember the bell of that primary school to this day.';
      } },

    /* ================= 78 岁：遗嘱 ================= */
    { id: 'o_will', age: 78, t: 'Who gets what you own',
      text: (g) => {
        const hv = houseW(g), cash = liquid(g);
        const list = [];
        if (hv) list.push((g.recall('house') === 'hometown' ? 'A house in your hometown' : 'An apartment') + ', worth ' + CN.fmt(hv * 1e4));
        if (hv && debtW(g) > 0) list.push('Remaining mortgage: ' + CN.fmt(debtW(g) * 1e4));
        list.push(cash >= 1000 ? 'Savings: ' + CN.fmt(cash) : 'Savings: almost none');
        if (!hv) list.push('No home of your own');
        return 'You went to have a will drawn up. The lawyer listed what you own on a sheet. ' + list.join(', ') + '. He asked you who you meant to leave all this to.';
      },
      choices: [
        { t: 'Split equally among the children', canon: true, cond: (g) => kidsN(g) >= 2, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: 'You signed, and a stone dropped from your heart.' },
        { t: 'Leave it to your child', canon: true, cond: (g) => kidsN(g) === 1, fx: (g) => { g.remember('will', 'kids'); g.stat('人缘', 2); }, res: 'You signed, and a stone dropped from your heart.' },
        { t: 'Leave everything to your spouse', canon: true, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: 'You said, look after the one still living first.' },
        { t: 'Leave it to the children of your brothers and sisters', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && (g.recall('sibs') || 0) > 0, fx: (g) => { g.remember('will', 'kin'); }, res: 'You remembered how they called out to you when they were little. The lawyer wrote down a few names.' },
        { t: 'Leave it to the people who have looked after you all these years', canon: true, cond: (g) => !hasKid(g) && !hasSp(g) && !((g.recall('sibs') || 0) > 0), fx: (g) => { g.remember('will', 'carer'); }, res: 'You gave a few names: the neighbor downstairs, the young woman at the neighborhood committee. The lawyer wrote them down one by one.' },
        { t: 'Leave it to your spouse first, then to the children later', dev: 10, cond: (g) => hasKid(g) && hasSp(g), fx: (g) => { g.remember('will', 'spouse'); }, res: 'You said, look after the one still living first.' },
        { t: 'Sell the house and keep the money to spend yourself', dev: 25, cond: (g) => houseW(g) > 0,
          fx: (g) => { const x = Math.max(0, (houseW(g) - debtW(g)) * 1e4); CN.sellHouse(g); g.remember('willAmt', x); g.remember('will', 'sell'); g.stat('心情', 4); if (lw(g) === 'alone' || lw(g) === 'hometown') g.info('住处', 'A small rented apartment'); },
          res: (g) => 'The house sold for ' + CN.fmt(g.recall('willAmt')) + '. The lawyer looked up at you. You said money is for people to spend.' + (lw(g) === 'alone' || lw(g) === 'hometown' ? 'You rented a small apartment with an elevator, easier to get around than the old one.' : '') },
        { t: 'Keep the money to spend yourself, leave nothing to anyone', dev: 20, cond: (g) => !houseW(g) && liquid(g) >= 50000, fx: (g) => { g.remember('will', 'spend'); g.stat('心情', 3); }, res: 'The lawyer closed his notebook. You said if it is all spent, so much the better, and nobody has to divide anything.' },
        { t: 'Donate the house to your hometown school', dev: 35, cond: (g) => houseW(g) > 0, fx: (g) => { g.remember('will', 'donate'); g.remember('willAmt', 0); g.set('donatedHouse'); g.stat('心情', 3); }, res: 'You thought of the leaky classroom of your childhood. The lawyer wrote the word “donation” very neatly.' },
        { t: 'Set aside a sum and donate it to your hometown school', dev: 30, cond: (g) => !houseW(g) && liquid(g) >= 20000,
          fx: (g) => { g.remember('willAmt', spend(g, round1k(liquid(g) * 0.3))); g.remember('will', 'donate'); g.set('donatedHouse'); g.stat('心情', 3); }, res: (g) => 'You transferred ' + CN.fmt(g.recall('willAmt')) + ' on the spot. You thought of the leaky classroom of your childhood.' },
        { t: 'Don’t make one, there is nothing to divide', dev: 10, cond: (g) => !houseW(g) && liquid(g) < 50000, fx: (g) => { g.remember('will', 'none'); }, res: 'The lawyer said that was fine too. You offered him a cup of tea as thanks for the trip.' },
      ] },

    /* ================= 79 岁 ================= */
    { id: 'o_look_back_work', age: 79, t: 'Remembering the working years', auto: true,
      text: (g) => {
        const j = g.recall('preJob');
        const c = g.recall('workCity');
        const at = c ? ' in ' + c : '';
        const m = {
          civil: 'You often dream of your old office: files piled on the desk, a plane tree outside the window.',
          teacher: 'Some of the students you taught are grandparents now. At New Year a few still message you and call you teacher.',
          doctor: 'You spent most of your life on night shifts in the hospital. Now, when you hear an ambulance, you still glance at your watch without thinking.',
          nurse: 'You have given maybe several hundred thousand injections. Your hands are still steady.',
          tech: 'Nobody has used the code you wrote for ages. Once in a while you see that old company’s name in the news.',
          office: 'You ' + at + ' spent decades in a cubicle farm. The faces in the elevator, you cannot recall a single one.',
          worker: 'You stood on the assembly line for half your life. When you hear the hum of machines now, your fingers still move along.',
          rider: 'You ' + at + ' delivered enough orders to circle the Earth several times. You remember every compound that was hard to find.',
          driver: 'You drove for decades, so' + at + ' you know every shortcut.',
          farmer: 'You farmed all your life. When it rains now, your first thought is still the crops in the field.',
          shop: 'The shop you ran changed its sign long ago. When you walk past, you still glance inside.',
          boss: 'The businesses you ran made money and lost money. Looking back now, you remember the losses more clearly.',
          creator: 'The videos you made are still online. Sometimes a new like appears, and you do not know who from.',
        };
        return m[j] || ('You changed jobs several times in your life. ' + (c ? c + ' years' : 'Those years') + ', looking back now, feel like someone else’s story.');
      } },
    { id: 'o_care_echo', age: 79, t: 'The days', auto: true,
      cond: (g) => !!lw(g),
      fx: (g) => { const l = lw(g); if (l === 'kids') g.stat('人缘', 2); if (CN.alone(g) && g.recall('robot') === 'none') g.stat('心情', -1); stayHome(g); },
      text: (g) => {
        const l = lw(g);
        if (l === 'nursing') return 'At the nursing home, you have regular card partners. Every afternoon at three, without fail.';
        if (l === 'kids') return 'After all these years living with your child, you have learned to say less. But ' + (g.recall('gkCare') === 'full' ? 'when the grandchildren come home from school, yours is the first name they call.' : 'at the dinner table, everyone asks how your day was.');
        if (l === 'hometown') return 'After all these years back in your hometown, the village roads have been repaired, but there are fewer and fewer people. You have become the one who sits in the doorway most.';
        if (g.recall('robot') === 'home') return 'The care robot at home has been with you three years. It remembers all your habits better than you do yourself.';
        if (hasSp(g)) return 'You and ' + spName(g) + ' keep the old house together. One of you is hard of hearing and the other’s eyes are failing, and together you manage just fine.';
        if (CN.alone(g)) return 'Living alone, you made yourself a rule: go out once a day and talk to one person.';
        return CN.youHh(g) + '. Whoever gets up first in the morning boils the kettle.';
      } },

    /* ================= 80 岁：老家 ================= */
    { id: 'o_back_home', age: 80, t: 'A visit to your hometown',
      cond: (g) => !atHometown(g),
      text: (g) => 'You dreamed of ' + (g.recall('homeCap') || 'your hometown') + '. After you woke, the look of that road stayed in front of your eyes.',
      choices: [
        { t: 'Have your child video-call, just a look', canon: true, cond: (g) => hasKid(g), fx: (g) => { g.remember('wentHome', 'video'); }, res: 'On the screen the old house had a new door. You said, that’s the place.' },
        { t: 'Go back and stay for a month', dev: 10, fx: (g) => { g.remember('wentHome', 'month'); g.stat('心情', 6); g.stat('健康', -2); CN.goHome(g); }, res: (g) => (hasKid(g) ? kidName(g) + ' took leave to go back with you. ' : 'A grandson of an old neighbor drove over to pick you up. ') + 'You walked the road you took to school as a child. It was much shorter than in your memory.' },
        { t: 'Don’t go back, nobody is left there', dev: 5, fx: (g) => { g.remember('wentHome', 'no'); g.stat('心情', -2); }, res: 'You rolled over and went back to sleep.' },
      ] },
    { id: 'o_village_kids', age: 80, t: 'The village children',
      cond: (g) => atHometown(g),
      text: 'In the summer vacation, the few children left in the village kept hanging around your door. One asked how people used to live.',
      choices: [
        { t: 'Set out a small stool and tell them stories', dev: 15, fx: (g) => { g.remember('storyteller', true); g.set('oldStoryteller'); g.stat('心情', 5); g.stat('人缘', 3); }, res: 'You talked all afternoon, and not one child left.' },
        { t: 'Give them some snacks and send them off', canon: true, fx: (g) => { g.remember('storyteller', false); g.stat('人缘', 1); }, res: 'They grabbed the candy and ran. You sat at the door until dark.' },
      ] },

    /* ================= 81 岁 ================= */
    { id: 'o_will_echo', age: 81, t: 'After the will', auto: true,
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
          if (g.recall('willAmt')) return 'The ' + CN.fmt(g.recall('willAmt')) + ' you donated has been put to use. A letter came from your hometown school saying the library was built, with your name on the shelf. You had someone read the letter to you twice.';
          return 'The principal of your hometown school came to see you with two students. They said the house would belong to the school, to be turned into a library, with your name on the door. You asked each of the children to write you a letter.';
        }
        if (w === 'sell') return 'Of the money from selling the house, you have spent ' + CN.fmt(g.recall('willSpent')) + ' over these years, on short trips, a good caregiver and a lot of good meals. You have no regrets at all.';
        if (w === 'spend') return 'In these years you did not shortchange yourself, spending ' + CN.fmt(g.recall('willSpent')) + ': a good bed, a good pair of hearing aids, and frequent restaurant meals with old neighbors.';
        if (w === 'spouse') return hasSp(g) ? 'Your will leaves everything to your spouse. On the day you signed, neither of you said a word, and afterward you went for a bowl of noodles together.' : 'Your will leaves everything to your spouse. Your spouse went first, so you went back and changed it, and afterward sat for a long time downstairs from the lawyer’s office.';
        if (w === 'kin') return 'Your nephews and nieces heard about the will and have been visiting more often at New Year. You know what is going on, and still hand out the red envelopes.';
        if (w === 'carer') return 'The neighbor downstairs heard about the will and said, eyes red, that they did not want it. You said, think of it as thanks for all the dumplings over the years.';
        if (w === 'none') return 'You never made a will, and nobody asked. The few things in the house, you gave away one by one to people who liked them.';
        return 'Your children found out about the will. ' + (kidsN(g) >= 2 ? 'For a while, they all visited equally often.' : 'Nobody mentioned it again.');
      } },
    { id: 'o_hometown_echo', age: 81, t: 'your hometown', auto: true,
      cond: (g) => !!g.recall('wentHome') || g.recall('storyteller') != null,
      text: (g) => {
        if (g.f('oldStoryteller')) return 'One of the children wrote your stories into a school essay and won a county prize. He ran over to show you, and your name was on the certificate.';
        if (g.recall('storyteller') === false) return 'The children still play at your door after school. Each time, you keep a few more sweets on hand.';
        const w = g.recall('wentHome');
        if (w === 'month') return 'That month, you recognized your childhood desk-mate in your hometown. He had grown old too, and sat under the same tree. You agreed to meet again next year.';
        if (w === 'video') return 'After that video call, your child printed out photos of the old house and hung them by your bed.';
        return 'What your hometown looks like, you can only imagine now. Imagining it, you found yourself humming songs from your childhood.';
      } },
    { id: 'o_icu_talk', age: 82, t: 'What if that day comes', loc: 'hospital',
      text: 'The neighborhood doctor came to register advance medical directives and asked: if one day you were failing, should they resuscitate, should they intubate?',
      choices: [
        { t: 'Save me if you can, even with a tube', canon: true, fx: (g) => { g.remember('icu', 'yes'); stayHome(g); }, res: 'You said you wanted to see a few more years. The doctor ticked a box on the form.' },
        { t: 'No tube, no ICU, no suffering like that', dev: 20, fx: (g) => { g.remember('icu', 'no'); g.stat('心情', 3); stayHome(g); }, res: 'Your hand was steady when you signed.' },
        { t: 'Leave it to the children to decide', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: 'You said they would know better than you by then.' },
        { t: 'Leave it to your spouse to decide', dev: 5, cond: (g) => !hasKid(g) && hasSp(g), fx: (g) => { g.remember('icu', 'kids'); stayHome(g); }, res: (g) => 'You said, when the time comes, go with what ' + spName(g) + ' decides.' },
      ] },

    /* ================= 83 岁 ================= */
    { id: 'o_kids_visit', age: 83, t: 'Who visits', auto: true,
      cond: (g) => hasKid(g),
      fx: (g) => { if (lw(g) === 'kids' || g.s('人缘') >= 60) g.stat('心情', 3); else g.stat('心情', -1); },
      text: (g) => {
        const k = CN.who(g, kid1(g), true);
        if (CN.livesWith(g, kid1(g))) return kidName(g) + ' came home every day and looked in on you first. You pretended to be asleep and smiled only after the door closed.';
        if (g.recall('icu') === 'kids') return k + ' heard about the advance directive and came home that weekend especially, sitting with you all afternoon. Neither of you mentioned it.';
        if (g.s('人缘') >= 60) return k + ' comes home every weekend with food, and the fridge is full when they leave.';
        if (g.recall('kidCity') === 'abroad') return k + ' is abroad and video-calls at eight every evening on the dot. You can never work out the time difference, but you remember eight.';
        return k + ' is busy with work and comes home once a month. You said everything you had saved up for the month at the dinner table in one breath.';
      } },
    { id: 'o_gk_teen', age: 83, t: 'Grandchild', auto: true,
      cond: (g) => hasGk(g),
      text: (g) => CN.who(g, gkIds(g)[0], true) + (g.recall('gkCare') === 'full' ? ' came to see you first thing when the summer vacation began and told you about school. Halfway through, you had fallen asleep, and ' + 'the child covered you with a blanket.' : ' taught you how to use the new phone. You learned slowly, and the child was in no hurry.') },

    /* ================= 84 岁：记性 ================= */
    { id: 'o_memory', age: 84, t: 'Memory',
      text: 'You started calling people by the wrong names. One day you went out and stood downstairs for a long time, trying to remember where you were going.',
      choices: [
        { t: 'Go to the hospital for a checkup', canon: true, fx: (g) => { g.remember('memory', 'doctor'); g.stat('健康', 2); }, res: 'The doctor said it was mild cognitive impairment, prescribed medicine, and told you to use your brain more.' },
        { t: 'Write a diary every day', dev: 15, fx: (g) => { g.remember('memory', 'diary'); g.stat('学识', 2); }, res: 'You bought a thick notebook, and on the first page you wrote your own name and address.' },
        { t: 'Let an AI remember for you', dev: 10, fx: (g) => { g.remember('memory', 'ai'); }, res: 'You said to it, “Where did I put my keys?” It told you they were in your left pocket.' },
      ] },
    { id: 'o_eighty_five', age: 85, t: 'Eighty-five', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => (g.s('健康') >= 40 ? 'At eighty-five, you could still go downstairs by yourself. Few of the people born the same year as you still can.' : 'At eighty-five, you spent most of the day sitting by the window. The sunlight moved from left to right, and the day was gone.') },
    { id: 'o_hobby_late', age: 85, t: 'Hobbies in old age', auto: true,
      cond: (g) => !!g.recall('hobby') || !!g.recall('learnWhat'),
      text: (g) => {
        const w = g.recall('learnWhat');
        if (w === 'art') return 'You still write with a brush, though your characters keep getting bigger. Four characters fill a sheet, and when it hangs on the wall, every visitor praises it.';
        if (w === 'code') return 'The little programs you wrote were taken over by young people long ago. Every time they update them, they still write a thank-you to you in the notes.';
        if (w === 'music') return 'You cannot play a whole piece on the erhu anymore. You play a bit, rest, and play a bit more.';
        const h = g.recall('hobby');
        if (h === 'dance') return 'Of your old dance ' + (isMale(g) ? 'pals' : 'sisters') + ', only three or four are left. In the evening you sit on the bench by the square and keep time to the music.';
        if (h === 'college') return 'You no longer go to the senior university, but your classmates still come to sit in your home. A roomful of white hair, talking about things from decades ago.';
        if (h === 'travel') return 'You cannot travel far anymore. You flip through your travel photos from these years one by one, and wherever you stop, you tell the story.';
        return 'You still watch short videos. The text is too small, so you have the robot read it aloud to you.';
      } },

    /* ================= 86 岁：寿宴 ================= */
    { id: 'o_birthday', age: 86, t: 'A big birthday',
      text: (g) => famWord(g) + ' says you are eighty-six now, and it is time for a proper birthday.',
      choices: [
        { t: 'Throw a big party and invite all your relatives and friends', canon: true, fx: (g) => { spend(g, 16000); g.remember('bday', 'big'); g.stat('人缘', 4); g.stat('健康', -2); }, res: 'Eight tables were set. You could not name many of the people, but all of them could name you.' },
        { t: 'Just a meal with a few close people', dev: 5, fx: (g) => { g.remember('bday', 'small'); g.stat('心情', 3); }, res: 'Around one table, you ate half a bowl of noodles and spent the evening looking at them.' },
        { t: 'Invite no one, go see the sea once', dev: 25, cond: (g) => g.s('健康') >= 30, fx: (g) => { spend(g, 6000); g.remember('bday', 'sea'); g.stat('心情', 6); g.move('coast', 'Seaside'); }, res: (g) => (family(g) ? 'Your family went with you, pushing the wheelchair. ' : 'The young man from the senior care station went with you. ') + 'You sat on the beach all afternoon. The waves came up layer by layer, and went back down.' },
      ] },
    { id: 'o_memory_echo', age: 87, t: 'Forgotten, but remembered', auto: true,
      cond: (g) => !!g.recall('memory'),
      fx: (g) => { const m = g.recall('memory'); if (m === 'diary') g.stat('心情', 3); stayHome(g); },
      text: (g) => {
        const m = g.recall('memory');
        if (m === 'diary') return 'You filled three diaries. Some things you forgot, and when you opened the notebook, they came back.';
        if (m === 'ai') return 'The AI remembers everyone’s birthday. When it reminds you to call ' + (family(g) ? 'Family' : 'old friends') + ', you always pretend it was your own idea.';
        return 'You kept taking the pills. You still recognized everyone around you, and that was enough.';
      } },
    { id: 'o_bday_echo', age: 87, t: 'That birthday', auto: true,
      cond: (g) => !!g.recall('bday'),
      text: (g) => {
        const b = g.recall('bday');
        if (b === 'big') return 'The photos from the eight-table banquet were forwarded many times by your relatives. You are laughing broadly in them.';
        if (b === 'sea') return 'You often talk about that trip to the sea. Partway through, you fall asleep.';
        return 'What was served at that birthday meal, you cannot remember. You only remember that everyone was there.';
      } },

    /* ================= 88 岁：最后想去的地方 ================= */
    { id: 'o_last_place', age: 88, t: 'One more place', loc: 'home',
      text: (g) => 'You told ' + famWord(g) + ' that you wanted to go somewhere once more while you still could get out.',
      choices: [
        { t: 'Go nowhere, home is fine', canon: true, fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('心情', 1); }, res: 'You were only talking. You had been looking at the tree outside the window for years too.' },
        { t: 'Go back to the place you were born', dev: 15, cond: (g) => !atHometown(g), fx: (g) => { g.remember('lastTrip', 'birth'); g.stat('心情', 5); g.stat('健康', -3); CN.goHome(g); }, res: 'Someone pushed your wheelchair. You stopped on the street where you were born and no longer recognized it. But the smell of the wind had not changed.' },
        { t: 'Go to the city where you worked hard when you were young', dev: 15, cond: (g) => !!g.recall('workCity'), fx: (g) => { g.remember('lastTrip', 'work'); g.stat('心情', 4); g.stat('健康', -3); g.move('metro', g.recall('workCity')); }, res: 'You sat downstairs from the building where you once lived. The building was still there, but the windows had been replaced.' },
        { t: 'Go somewhere you have never been', dev: 30, check: ['健康', 35], fx: (g) => { g.remember('lastTrip', 'new'); g.stat('心情', 7); g.stat('健康', -4); g.move('road', 'On the road'); }, res: (g) => (family(g) ? 'Your family took turns pushing the wheelchair. ' : 'You joined a senior tour group with a doctor along. ') + 'At eighty-eight, you saw snow-capped mountains for the first time.',
          fail: { fx: (g) => { g.remember('lastTrip', 'stay'); g.stat('健康', -3); }, res: 'Halfway there, your body gave out. You fell asleep in the car and woke up already on the way home.', dev: 0 } },
      ] },
    { id: 'o_gk_grown', age: 89, t: 'The grandchildren grow up', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 20,
      fx: (g) => { if (g.recall('gkCare') === 'full') g.stat('心情', 4); },
      text: (g) => {
        const c = g.recall('gkCare');
        const id = gkIds(g)[0];
        const n = g.name(id);
        if (c === 'full') return CN.who(g, id, true) + ' graduated from university. In the graduation photo, ' + n + ' pulled you into the shot too, saying you were the one who raised them.';
        if (c === 'none') return CN.who(g, id, true) + ' graduated from university. You do not see each other much, and each time, ' + n + ' addresses you politely.';
        return CN.who(g, id, true) + ' has grown up. The road you used to walk them along to school when they were little, ' + n + ' still remembers.';
      } },
    { id: 'o_ninety', age: 90, t: 'Ninety', auto: true,
      fx: (g) => stayHome(g),
      text: (g) => {
        const p = partner(g);
        if (p === 'sp') { const y = g.since('spouse'); return 'At ninety. You and ' + spName(g) + ' are still together' + (y >= 55 ? ', married ' + y + ' years now. The neighborhood committee came by to take a ' + (y >= 60 ? 'diamond wedding' : 'wedding anniversary') + ' photo of the two of you.' : '. The neighborhood committee came by to take a photo of the two of you together.') + ' Neither of you would look at the camera first.'; }
        if (p === 'sp2') return 'At ninety. The companion of your late years, ' + spName(g) + ' peeled you a bowl of peanuts and set them one by one in your palm.';
        return 'At ninety. More than half the people born the same year as you are gone. ' + (hasKid(g) ? kidName(g) + ' has a head of white hair too, ' + 'and the hand shook a little cutting your cake.' : 'Someone from the neighborhood committee brought you a bowl of longevity noodles, still steaming.');
      } },
    { id: 'o_letter', age: 91, t: 'A few words to leave',
      text: (g) => (family(g) ? 'You wanted to leave a few words for your family.' : 'You wanted to leave a few words for those who come after.'),
      choices: [
        { t: 'Write letters, one for each person', canon: true, fx: (g) => { g.remember('legacy', 'letters'); g.stat('心情', 3); }, res: 'Your handwriting shook badly, and one letter took three days.' },
        { t: 'Record a video on your phone', dev: 10, fx: (g) => { g.remember('legacy', 'video'); g.stat('心情', 2); }, res: 'You recorded it a dozen times. On the last take, you smiled and said, “That’s it, then.”' },
        { t: 'Leave nothing, everything has been said', dev: 10, fx: (g) => { g.remember('legacy', 'none'); }, res: 'You said, if you say too much, those who remember only get tired.' },
      ] },

    /* ================= 92–100 岁：慢下来的日子 ================= */
    { id: 'o_trip_echo', age: 92, t: 'That trip', auto: true,
      cond: (g) => !!g.recall('lastTrip'),
      fx: (g) => stayHome(g),
      text: (g) => {
        const t = g.recall('lastTrip');
        if (t === 'birth') return 'You often talk about the trip back to where you were born. The more you tell it, the more details each telling has.';
        if (t === 'work') return 'You often talk about the city you went back to see. The hardships of those years have turned into funny stories in the telling.';
        if (t === 'new') return 'You set the photo of that snow-capped mountain as your phone’s wallpaper.';
        return 'You went nowhere. But in these years, nobody knows the tree outside your window better than you do.';
      } },
    { id: 'o_92_day', age: 92, t: 'A day', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        if (lw(g) === 'nursing') return 'A day at the nursing home begins with a blood pressure check. Sun in the morning, someone reads the paper aloud in the afternoon, lights out at seven. ' + (hasSp(g) ? spName(g) + '’s bed is right next to yours, within reach in the night.' : 'The young care aide calls you “old treasure,” and you pretend to be annoyed.');
        if (lw(g) === 'kids' || hasKid(g) && CN.livesWith(g, kid1(g))) return 'In the morning, ' + kidName(g) + ' makes you a cup of oatmeal and tunes the TV to your favorite channel before leaving. You fall asleep watching, and wake up just in time for lunch.';
        if (hasSp(g)) return 'You and ' + spName(g) + ' spend every day reminding each other to take their pills. Whoever forgets first, the other gloats all day.';
        if (g.recall('robot') === 'home' || g.recall('robotBuy')) return 'The robot opens the curtains at seven every day and tells you the weather. You answer, “Got it,” and the day begins.';
        return 'The neighborhood grid worker knocks on your door every morning. You are already sitting at the door, waiting as if for a guest.';
      } },
    { id: 'o_legacy_echo', age: 93, t: 'Those who come after', auto: true,
      cond: (g) => !!g.recall('legacy'),
      text: (g) => {
        const l = g.recall('legacy');
        if (l === 'letters') return 'Some people opened the letters you wrote and read them on the spot, and some said they would keep theirs for later.';
        if (l === 'video') return hasKid(g) ? 'Your family saved that video in several places. Your child says, when I miss you, I watch it.' : 'As for that video, ' + (hasSp(g) ? spName(g) + ' watched it over and over.' : 'the neighborhood committee saved it for you in the “elders’ oral history” archive.');
        return 'You left no words. But the people around you often copy your tone when they talk.';
      } },
    { id: 'o_93_money', age: 93, t: 'The accounts', auto: true,
      fx: (g) => { if (liquid(g) >= 100000 && lw(g) !== 'nursing') { spend(g, 60000); g.remember('oldNanny', true); } },
      text: (g) => {
        const m = 'Your monthly pension is ' + CN.fmt(PEN[g.recall('pension')] / 12) + ', and your savings come to ' + CN.fmt(liquid(g)) + '. ';
        if (g.recall('oldNanny')) return 'You hired a live-in helper, at ' + CN.fmt(60000) + ' a year. Her cooking ran salty, you said nothing, and she slowly made it lighter. ' + m;
        if (lw(g) === 'nursing') return 'The nursing home bills monthly. ' + m + 'You said it was enough, and the care aide said you were the best at accounts in the whole home.';
        if (g.recall('kidHelp')) return 'Your child puts money into your card every month. You have not touched a cent, saving it for the grandchildren. ' + m;
        return 'You still manage your own money, writing down each item in a notebook. ' + m + 'Enough to eat and enough to use.';
      } },
    { id: 'o_last_wish', age: 94, t: 'What do you want',
      text: (g) => famWord(g) + ' asks what you want most right now.',
      choices: [
        { t: 'A taste of the food from your childhood', canon: true, fx: (g) => { g.remember('lastWish', 'food'); g.stat('心情', 4); }, res: 'They made it the way you described. It did not taste quite right, but you finished it.' },
        { t: 'To see someone you have not seen in a long time', dev: 15, fx: (g) => { g.remember('lastWish', 'person'); g.stat('人缘', 3); }, res: 'They made many phone calls and found them.' },
        { t: 'Nothing, it’s fine', dev: 5, fx: (g) => { g.remember('lastWish', 'none'); g.stat('心情', 2); }, res: 'You said, when people get old, they want fewer things.' },
      ] },
    { id: 'o_lastwish_echo', age: 95, t: 'The wish', auto: true,
      cond: (g) => !!g.recall('lastWish'),
      text: (g) => {
        const w = g.recall('lastWish');
        if (w === 'person') return 'The person you had not seen in so long came in a wheelchair. The two of you old people held hands and could not speak for a long while, and then laughed together.';
        if (w === 'food') return 'After that meal, the people around you learned to cook it. Every time it was served, you said it was closer than the last.';
        return 'You said you wanted nothing. The people around you still sat with you a little longer every day.';
      } },
    { id: 'o_95_spring', age: 95, t: 'Spring', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.s('健康') >= 25 ? 'In the spring of ninety-five, held up by someone, you walked twenty steps downstairs. The magnolias were in bloom, and you stood looking at them for a long time.' : 'In the spring of ninety-five, you could no longer go downstairs. ' + (family(g) ? 'Family' : 'The caregiver') + ' broke off a sprig of magnolia and put it in the bottle by your bed.') },
    { id: 'o_slow', age: 96, t: 'Slow', auto: true,
      text: (g) => 'You speak more and more slowly and sleep more and more. When you wake, you often have to think what year it is.' + (g.recall('memory') === 'diary' ? 'Someone reads you a page from the diaries by your bed every day.' : (hasSp(g) ? spName(g) + ' tells you another year has passed.' : 'But when you hear the birds outside the window, you know it is morning.')) },
    { id: 'o_great_gk', age: 97, t: 'Four generations', auto: true,
      cond: (g) => hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28,
      fx: (g) => g.stat('心情', 5),
      text: (g) => CN.who(g, gkIds(g)[0], true) + ' came to see you carrying a baby one month old. You became a great-' + (isMale(g) ? 'grandpa' : 'grandma') + '. Four generations squeezed into one photo, you in the very middle, clutching that little foot.' },
    { id: 'o_97_sun', age: 97, t: 'Sunning', auto: true,
      cond: (g) => !(hasGk(g) && g.ageOf(gkIds(g)[0]) >= 28),
      text: (g) => company(g) + '. The afternoon sun came in, and you held your hand out into the light and looked at it for a good while.' },
    { id: 'o_98', age: 98, t: 'Ninety-eight', auto: true,
      fx: (g) => g.stat('心情', 2),
      text: (g) => {
        const who = hasKid(g) ? kidName(g) + ' put two number candles on the cake, a 9 and an 8. ' : 'The neighborhood committee brought a small cake with two number candles, a 9 and an 8. ';
        return 'Your ninety-eighth birthday. ' + who + (g.s('健康') >= 20 ? 'You blew them out in one breath, and everyone clapped.' : 'You blew twice, and the person beside you helped with a third breath.');
      } },
    { id: 'o_99', age: 99, t: 'A dream', auto: true,
      text: (g) => 'You began to lose track of dreaming and waking. In your dream you were still ' + (g.recall('hukou') === 'rural' ? 'at the river by the village entrance, the water cold' : 'downstairs where you lived as a child, someone calling you home to eat') + '. When you woke, ' + (CN.alone(g) ? 'the light in the room was on, ' + 'and the robot kept watch by the bed.' : 'someone was holding your hand.') },
    { id: 'o_hundred', age: 100, t: 'A hundred years old', auto: true,
      fx: (g) => g.stat('心情', 5),
      text: (g) => 'A hundred years old. The neighborhood committee brought a “Centenarian” plaque, and reporters came to take photos. You asked them what the special occasion was today. ' + (hasGk(g) ? 'Your grandchildren fought to take photos with you.' : hasKid(g) ? kidName(g) + ' stood beside you and answered for you.' : 'The caregiver hung the plaque on your bedhead for you.') },
  ]);

  /* ---------- 一百岁以后：每年一句 ---------- */
  const LATE = [
    (g) => 'A hundred and one. Every day when you wake, you first look out the window, then at the photo by your bed.',
    (g) => 'A hundred and two. ' + company(g) + '. Someone reads you the news, you listen a while, and say, “Same as ever.”',
    (g) => 'A hundred and three. You still remember your own name, and also ' + (hasKid(g) ? kidName(g) + ' as a small child.' : 'the tree by the door of your childhood home.'),
    (g) => 'A hundred and four. You eat very little, and a bowl of porridge lasts all morning. When you finish, you say, “Good.”',
    (g) => 'A hundred and five. The people who come to see you change generation after generation. They say you are the oldest person in the area.',
    (g) => 'A hundred and six. You sleep most of the time. When you are awake, you are smiling.',
    (g) => 'A hundred and seven. The birds outside the window have changed through many generations. You still know their calls.',
    (g) => 'A hundred and eight. Someone asked the secret of your long life. You thought for a long time and said, “Eat, sleep.”',
  ];
  JY.addLifeNodes(LATE.map((f, i) => ({ id: 'o_late_' + (101 + i), age: 101 + i, t: 'Another year', auto: true, text: f })));

  /* ---------- 老伴走了、最后一次住院：哪一年发生不一定，用必定触发的意外 ---------- */
  JY.addEncounters([
    { id: 'e_o_widowed', y: [2026, 2200], minAge: 65, t: 'Alone now', auto: true, always: true, kind: 'death',
      cond: (g) => g.recall('love') === 'married' && !!JY.byId.sp && !g.alive('sp'),
      fx: (g) => { g.remember('love', 'widowed'); g.info('婚姻', 'Widowed'); g.stat('心情', -12); g.stat('健康', -3); },
      text: (g) => {
        const n = JY.byId.sp ? g.name('sp') : 'late-life partner';
        if (lw(g) === 'nursing') return n + ' passed away, and one bed in your room at the nursing home is empty. You still wash ' + n + '’s cup clean every day.';
        if (CN.alone(g)) return n + ' passed away, and you still cook for two every day. Only when it is ready do you remember.';
        return n + ' passed away, and at meals you still leave a seat for ' + n + '. The family saw it, and nobody said a word.';
      } },
    { id: 'e_o_after_widow', y: [2026, 2200], minAge: 66, t: 'The days ahead', always: true,
      cond: (g) => g.recall('love') === 'widowed' && g.since('love') >= 1 && freeYear(g) && g.s('健康') > 22,
      text: (g) => {
        if (g.since('love') >= 5) return (CN.alone(g) ? 'You have lived alone for years. ' : 'Your spouse has been gone for years. ') + 'Someone suggested a new partner, saying two people could keep each other company and look after each other.';
        return 'Your spouse has been gone for a year or more. ' + (hasKid(g) ? 'Your children take turns urging you' : 'Your old neighbors came to urge you') + ', saying you need to make some plans for the days ahead.';
      },
      choices: [
        { t: 'Carry on as you are', canon: true, fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', 1); }, res: 'You wiped your spouse’s photo clean and set it on the dining table.' },
        { t: 'Move in with your child', dev: 10, cond: (g) => hasKid(g) && lw(g) !== 'kids', fx: (g) => { g.remember('afterWidow', 'kids'); toKids(g); }, res: 'You took only a picture frame and an old sweater.' },
        { t: 'Move into a nursing home, for the company', dev: 15, cond: (g) => !hasKid(g) && lw(g) !== 'nursing' && canNursing(g), fx: (g) => { g.remember('afterWidow', 'nursing'); toNursing(g); }, res: 'You picked one with a garden. At the first dinner, the old lady at your table asked if you played cards.' },
        { t: 'Find a new partner', dev: 30, check: ['人缘', 50],
          fx: (g) => { g.remember('remarried', true); g.remember('afterWidow', 'remarry'); const p = CN.person({ id: 'sp2', sex: isMale(g) ? '女' : '男', born: g.Y - g.age + CN.ri(-4, 4), origin: 'Met at the senior university' }); g.spawn(p); g.rel('late-life partner', 'sp2', 'Remarried in later life'); CN.liveWith(g, ['sp2']); g.info('婚姻', 'Remarried'); g.stat('心情', 8); },
          res: 'You held no banquet, only a meal for the children of both sides. Some people gossiped behind your backs, and you pretended not to hear.',
          fail: { fx: (g) => { g.remember('afterWidow', 'alone'); g.stat('心情', -2); }, res: 'After two meetings, the other person’s children objected, and that was the end of it. Afterward you still ran into each other in the park and nodded.', dev: 0 } },
      ] },
    { id: 'e_o_remarry_echo', y: [2026, 2200], minAge: 68, t: 'Keeping each other company', auto: true, always: true,
      cond: (g) => g.recall('remarried') === true && g.since('remarried') >= 2,
      fx: (g) => g.stat('健康', 2),
      text: (g) => (JY.byId.sp2 && g.alive('sp2') ? 'Two years into the remarriage, the two of you shop and take walks together every day and argue over how much salt to use. The children say you look much better.' : 'The companion you found late in life kept you company only a few years before passing too. You do not regret it.') },
    { id: 'e_o_alone_echo', y: [2026, 2200], minAge: 68, t: 'These years', auto: true, always: true,
      cond: (g) => !!g.recall('afterWidow') && g.recall('afterWidow') !== 'remarry' && g.since('afterWidow') >= 3,
      text: (g) => {
        const a = g.recall('afterWidow');
        if (a === 'kids') return 'After living so long at your child’s home, your belongings have slowly piled up. That old sweater, you have never been able to bring yourself to wear.';
        if (a === 'nursing' || lw(g) === 'nursing') return 'At the nursing home, you have a few old companions. When someone has a birthday, everyone chips in for a small cake.';
        if (CN.alone(g)) return 'After a few years alone, you learned to talk to the photograph. After telling it what you ate today, you turn off the light and go to sleep.';
        return 'Your spouse has been gone for some years, and you ' + CN.hhText(g) + '. After every meal, you tell the photograph, “Eaten.”';
      } },
    { id: 'e_o_last_hospital', y: [2026, 2200], minAge: 78, t: 'Back in the hospital', loc: 'hospital', always: true,
      cond: (g) => g.s('健康') <= 22 && freeYear(g),
      text: (g) => {
        const i = g.recall('icu');
        const pre = i === 'no' ? 'You signed long ago: no intubation, no ICU. ' : i === 'yes' ? 'You said long ago: save me if you can. ' : i === 'kids' ? 'You said that when the time came, your family would decide. ' : '';
        return 'You were taken to the hospital once again. The doctor called ' + (family(g) ? 'Family' : 'someone from the neighborhood committee') + ' out into the corridor. ' + pre;
      },
      choices: [
        { t: 'Go into the ICU, get intubated, and keep treating', canon: true, fx: (g) => { spend(g, 60000); g.stat('健康', 14); g.stat('心情', -8); g.remember('lastCall', 'icu'); }, res: () => 'You lay in the ICU for a dozen or so days, then were wheeled out. ' + (paid ? 'After insurance, you paid ' + CN.fmt(paid) + '. ' : 'Insurance and aid covered the rest.') },
        { t: 'Go home, don’t suffer through this', dev: 20, fatal: true, fx: (g) => { g.die((g.recall('icu') === 'no' ? 'following the directive you signed years earlier, ' : '') + 'passed away at home, asleep'); }, res: (g) => (family(g) ? 'Your family brought you home. ' : 'Someone from the neighborhood committee took you home. ') + 'That night, the light in the room stayed on.' },
        { t: 'Go with your children’s decision', dev: 5, cond: (g) => hasKid(g), fx: (g) => { g.remember('lastCall', 'kids'); if (g.rnd() < 0.5) g.stat('健康', 12); else g.die('passed away in the hospital, with family at the bedside'); }, res: 'The children talked it over all night.' },
      ] },
    { id: 'e_o_after_icu', y: [2026, 2200], minAge: 78, t: 'After leaving the hospital', auto: true, always: true,
      cond: (g) => !!g.recall('lastCall') && g.since('lastCall') >= 1,
      text: (g) => (g.recall('lastCall') === 'icu' ? 'After coming out of the ICU, you were much thinner. You said every extra day is a bonus.' : 'Your children made the decision for you. Later you told them they had decided right.') },
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
    { t: 'Since retiring, you wake up even earlier than you did when you worked.', cond: (g) => g.recall('retired') === true && g.age < 80 },
    { t: 'You dug out your old work badge, looked at it for a while, and put it back in the drawer.', cond: (g) => g.recall('retired') === true },
    { t: 'The vendor at the produce market gave you an extra handful of scallions, saying, a regular customer.', cond: (g) => g.recall('retired') === true && g.age < 85 && lw(g) !== 'nursing' },
    { t: 'You sat on the bench downstairs all afternoon and said hello to every cat that passed by.', cond: (g) => g.recall('retired') === true && g.age >= 75 },
    { t: 'On a fine day, someone pushed you out for a spin. The roses by the road were in full bloom.', cond: (g) => g.recall('retired') === true && g.age >= 88 },
    { t: 'You dug out photos from your youth and pointed at one, saying, that person is me.', cond: (g) => g.recall('retired') === true && g.age >= 85 },
  ]);
})();

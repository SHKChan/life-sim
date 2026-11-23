/* 十四亿分之一 · 家庭的后半句话。沿用孩子的学校、志愿和城市，不另起一套成长线。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const Y = [2026, 2165];
  const kid = (g) => !!JY.byId.k1 && g.alive('k1');
  const ka = (g) => g.ageOf('k1');
  const kw = (g) => CN.who(g, 'k1', true);
  const together = (g) => CN.livesWith(g, 'k1');
  const spouse = (g) => g.recall('love') === 'married' && !!JY.byId.sp && g.alive('sp');
  const sibling = (g) => ['sib0', 'sib1'].find((id) => !!JY.byId[id] && g.alive(id));
  const hasCash = (g, x) => Math.max(0, CN.cash(g)) >= x;

  // 住所只解释眼前日子，不再收取一次房租或照护费。
  CN.homeLifeContext = (g) => {
    if (['nursing', 'dorm'].includes(g.recall('hhPlace'))) return '';
    if (['fa', 'mo'].some((id) => JY.byId[id] && g.alive(id) && CN.livesWith(g, id))) return '老人也在这屋里住，饭点和休息的时间要一起商量，谁出门前都多问一句。';
    const house = g.recall('house');
    const back = house === 'hometown' || g.recall('liveWith') === 'hometown'
      || (g.recall('backHome') && [g.recall('city'), g.recall('homeCap')].includes(g.recall('workCity')));
    if (back) return '回到老家住下以后，家里的事近了，自己的安排也要重新留出空当。';
    if (g.recall('tier') <= 2 && house === 'rent') return '住处还租着，屋里的东西照样按自己的习惯摆，手头的钱也给房租和急用各留一份。';
    if (g.recall('tier') >= 3 && ['own', 'mortgage'].includes(house)) return house === 'mortgage' ? '这座小城的家安顿下来，还款日仍记在本子上，留给家里的时间也得一起算。' : '这座小城的家住惯了，少了一笔还款，家里的安排仍要一件件商量。';
    return '';
  };
  ['m_46_house_echo', 'm_52_care_echo', 'm_61_plan_echo'].forEach((id) => {
    const n = JY.LIFE_NODES.find((x) => x.id === id);
    if (!n) return;
    const text = n.text;
    n.text = (g) => (typeof text === 'function' ? text(g) : text || '') + CN.homeLifeContext(g);
  });

  // 真正不婚的支线：不再接“孩子想结婚”和第一胎孙辈。二孩原有的成长不受影响。
  ['e_m_kid_wed', 'o_gk_born'].forEach((id) => {
    const n = JY.ENCOUNTERS.concat(JY.LIFE_NODES).find((n) => n.id === id);
    if (!n) return;
    const cond = n.cond;
    n.cond = (g) => !g.recall('kidNoWed') && (!cond || cond(g));
  });

  JY.addEncounters([
    { id: 'e_family_teen_repair', y: Y, minAge: 35, maxAge: 64, t: '门没关紧', always: true,
      cond: (g) => kid(g) && ka(g) === 16 && together(g) && ['strict', 'loose'].includes(g.recall('kidBond')) && g.since('kidBond') >= 1,
      text: (g) => kw(g) + '的房门留了一条缝。桌上摆着一张没交的社团报名表。' + (g.recall('kidBond') === 'strict' ? '上回收手机以后，你们已经很久没好好说话了。' : '你一直说让孩子自己来，这次才发现连孩子喜欢什么都说不上来。'),
      choices: [
        { t: '敲门，先听孩子讲完', canon: true, fx: (g) => { g.remember('familyTeen', 'listen'); g.remember('kidBond', 'close'); g.stat('人缘', 2); }, res: '你在床沿坐了半个钟头，没提成绩。报名表第二天交了上去。' },
        { t: '等考试完了再说', dev: 10, fx: (g) => { g.remember('familyTeen', 'later'); g.stat('心情', -1); }, res: '你把门轻轻带上。那张表后来夹在课本里，一直没交。' },
      ] },
    { id: 'e_family_teen_echo', y: Y, minAge: 36, maxAge: 67, t: '有话慢慢说', auto: true, always: true, echoOf: 'e_family_teen_repair',
      cond: (g) => kid(g) && !!g.recall('familyTeen') && g.since('familyTeen') >= 2,
      fx: (g) => { if (g.recall('familyTeen') === 'listen') g.stat('心情', 2); else g.stat('人缘', -1); },
      text: (g) => g.recall('familyTeen') === 'listen' ? '孩子遇到拿不定主意的事，会先发消息问你。你学会了看完再回，不急着给答案。' : '孩子说起学校里的事，你总要追问好几句才听明白。你把“等忙完”这三个字咽了回去。' },

    { id: 'e_family_exam', y: Y, minAge: 35, maxAge: 64, t: '考前的夜里', always: true,
      cond: (g) => kid(g) && ka(g) === 17 && together(g) && !!g.recall('kidSchool') && !g.recall('kidUni'),
      text: (g) => kw(g) + '把模拟卷铺了一桌。' + (g.recall('kidSchool') === 'district' ? '当年为了这所学校背的那笔账，你没再提。' : g.recall('kidSchool') === 'left' ? '回到你身边以后，孩子一直很用功。' : '晚饭热过两回，孩子还是没动筷子。') + '明年就要高考了。',
      choices: [
        { t: '端碗热汤，让孩子早点睡', canon: true, fx: (g) => { g.remember('familyExam', 'rest'); g.stat('人缘', 2); }, res: '你没问排名。孩子喝完汤，把台灯关了。' },
        { t: '一起把错题分分类', dev: 10, fx: (g) => { g.remember('familyExam', 'sort'); g.stat('学识', 1); }, res: '会的你讲，不会的圈起来问老师。你们分出三摞，桌面终于空了一块。' },
        { t: '报一轮考前小班（¥3,000）', dev: 10, cond: (g) => hasCash(g, 3000), fx: (g) => { CN.pay(g, 3000); g.remember('familyExam', 'class'); g.stat('心情', -1); }, res: '周末多了一趟接送。你在校门口等着，保温杯里的水喝凉了。' },
      ] },
    { id: 'e_family_exam_echo', y: Y, minAge: 36, maxAge: 67, t: '填完志愿', auto: true, always: true, echoOf: ['e_family_exam', 'e_m_kid_gaokao'],
      cond: (g) => kid(g) && !!g.recall('familyExam') && !!g.recall('kidUni') && g.since('kidUni') >= 1,
      fx: (g) => { if (g.recall('familyExam') === 'rest') g.stat('人缘', 2); if (g.recall('familyExam') === 'sort') g.stat('心情', 2); },
      text: (g) => {
        const p = g.recall('familyExam'), u = g.recall('kidUni'), way = g.recall('kidPath');
        const result = u === 'none' ? '孩子走上了学手艺的路。' : way === 'stable' ? '录取通知书上的专业是你选的。' : '孩子在自己选的学校安顿下来。';
        return result + (p === 'rest' ? '有天孩子说，考前那晚终于睡了个好觉。你记得那碗汤。' : p === 'sort' ? '那三摞错题本留在了书架上。孩子说想带走一本，留作纪念。' : '你收起了小班的缴费单。钱换来过一点安心，后来那条路还得孩子自己走。');
      } },

    { id: 'e_family_first_work', y: Y, minAge: 40, maxAge: 64, t: '孩子第一份工资', always: true,
      cond: (g) => kid(g) && ka(g) >= 23 && ka(g) <= 26 && !!g.recall('kidUni') && !!g.recall('kidCity') && g.recall('kidCity') !== '国外' && g.since('kidCity') >= 1,
      text: (g) => kw(g) + '发来一张工资单。' + (g.recall('kidUni') === 'none' ? '学徒期刚过，工具箱还没攒齐。' : '试用期的工资扣完房租，只剩下一点。') + '孩子说想再试半年，你看着转账页面想了一会儿。',
      choices: [
        { t: '先听计划，帮着算一遍账', canon: true, fx: (g) => { g.remember('familyWork', 'budget'); g.stat('人缘', 2); }, res: '房租、吃饭、坐车，一项项写下来。最后你们约好每月聊一回，先把日子过稳。' },
        { t: '转 ¥6,000，给半年缓冲', dev: 10, cond: (g) => hasCash(g, 6000), fx: (g) => { CN.pay(g, 6000); g.remember('familyWork', 'support'); }, res: '你在转账备注里写“吃好点”。孩子隔了一会儿回了一个“好”。' },
        { t: '让孩子先自己撑着', dev: 10, fx: (g) => { g.remember('familyWork', 'alone'); g.stat('人缘', -1); }, res: '你说年轻时都这样。挂了电话，又查了那座城今天的天气。' },
      ] },
    { id: 'e_family_work_echo', y: Y, minAge: 41, maxAge: 67, t: '熬过试用期', auto: true, always: true, echoOf: 'e_family_first_work',
      cond: (g) => kid(g) && !!g.recall('familyWork') && g.since('familyWork') >= 2,
      fx: (g) => { if (g.recall('familyWork') !== 'alone') g.stat('心情', 2); },
      text: (g) => ({ budget: '孩子换了间便宜一点的房，第一次攒下了应急的钱。现在轮到孩子催你，也给自己留一笔。', support: '孩子把 ¥6,000 转了回来，还多寄了一盒当地的点心。你没退回去，认真吃完了。', alone: '孩子后来把日子过稳了，却很少再跟你说难处。你主动打了一次电话，问最近吃得怎么样。' }[g.recall('familyWork')]) },

    { id: 'e_family_no_wedding', y: Y, minAge: 40, maxAge: 64, t: '孩子的打算', always: true,
      cond: (g) => kid(g) && ka(g) === 26 && !g.recall('kidWed') && !g.recall('grandkids') && !!g.recall('kidCity') && (Number(g.recall('seed')) || 0) % 4 === 0,
      text: (g) => kw(g) + (g.recall('kidCity') === '国外' ? '在视频里' : '在电话里') + '说，往后不打算结婚，也不打算要孩子了。工作、住处和养老，孩子列了一张自己的清单。你听完，饭已经凉了。',
      choices: [
        { t: '尊重孩子的打算', canon: true, fx: (g) => { g.remember('kidNoWed', 'respect'); g.stat('人缘', 2); }, res: '你说，想好了就把自己的日子照顾好。下次通话，你先问工作顺不顺。' },
        { t: '一起把往后的照应谈清楚', dev: 10, fx: (g) => { g.remember('kidNoWed', 'plan'); g.stat('人缘', 1); }, res: '生病找谁、急事联系谁，你们各自写了一份。你把孩子的备用联系人存进了手机。' },
        { t: '还是劝孩子再考虑', dev: 10, fx: (g) => { g.remember('kidNoWed', 'press'); g.stat('人缘', -2); }, res: '你讲了很久。孩子说已经考虑过了。那通电话结束得比平常早。' },
      ] },
    { id: 'e_family_no_wedding_echo', y: Y, minAge: 43, maxAge: 75, t: '另一种日子', auto: true, always: true, echoOf: 'e_family_no_wedding',
      cond: (g) => kid(g) && !!g.recall('kidNoWed') && g.since('kidNoWed') >= 4,
      fx: (g) => { if (g.recall('kidNoWed') === 'press') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => '孩子仍然没有结婚，也没有要孩子。' + ({ respect: '电话里会讲工作和朋友的事。你慢慢习惯了不再等一场婚礼。', plan: '那张互相照应的清单更新过两次。孩子也给你留好了医院和邻居的电话。', press: '亲戚再问起，你说孩子有自己的安排。那年过节，你终于没有再催。' }[g.recall('kidNoWed')]) },

    { id: 'e_family_partner', y: Y, minAge: 46, maxAge: 54, t: '两个人的晚饭', always: true,
      cond: (g) => spouse(g) && CN.livesWith(g, 'sp') && !!g.recall('marriage') && g.since('marriage') >= 6,
      text: (g) => '你和' + g.name('sp') + '吃着晚饭，说了半天账单和家里的事，忽然发现已经很久没问对方过得怎么样。' + (g.recall('marriage') === 'mended' ? '当年谈开过一次，有些话还是又省略了。' : '桌上的汤凉了一层，你们谁也没起身。'),
      choices: [
        { t: '收起手机，饭后慢慢聊', canon: true, fx: (g) => { g.remember('familyPartner', 'talk'); g.stat('人缘', 2); }, res: '你们绕小区走了一圈。聊到年轻时候，走过了自家楼门才想起来。' },
        { t: '每周留一个晚上各做喜欢的事', dev: 10, fx: (g) => { g.remember('familyPartner', 'space'); g.stat('心情', 2); }, res: '你们在日历上圈了一个晚上。有人去上课，有人去会老友，回来有了新鲜话。' },
        { t: '先把眼前的事忙完', dev: 10, fx: (g) => { g.remember('familyPartner', 'busy'); g.stat('心情', -1); }, res: '你又打开了手机。洗碗的水声响了很久。' },
      ] },
    { id: 'e_family_partner_echo', y: Y, minAge: 48, maxAge: 58, t: '桌边的空当', auto: true, always: true, echoOf: 'e_family_partner',
      cond: (g) => spouse(g) && !!g.recall('familyPartner') && g.since('familyPartner') >= 2,
      fx: (g) => { if (g.recall('familyPartner') === 'busy') g.stat('心情', -2); else g.stat('人缘', 2); },
      text: (g) => ({ talk: '你们养成了饭后说说话的习惯。有时只聊菜价，聊着也踏实。', space: '各自有点喜欢的事，家里的话反倒多了。对方带回来一张活动照，让你挑哪张好看。', busy: '你们仍然把家里的事安排得井井有条。对方说累的时候，你这次放下手机听了。' }[g.recall('familyPartner')]) },

    { id: 'e_family_sibling', y: Y, minAge: 48, maxAge: 56, t: '兄弟姐妹的账本', always: true,
      cond: (g) => !!sibling(g) && !!g.recall('parentsCare') && (g.alive('fa') || g.alive('mo')) && g.since('parentsCare') >= 3,
      text: (g) => '照顾老人的日子久了，' + CN.who(g, sibling(g), true) + '给你发来一张手写的账。车费、药费，还有谁请过几天假。你看见最后一行写着：找一天一起商量。',
      choices: [
        { t: '把钱和轮班一起摊开说', canon: true, fx: (g) => { g.remember('familySibling', 'share'); g.stat('人缘', 2); }, res: '你们在饭桌上排出下个月的时间。有人多出钱，有人多跑腿，终于都知道对方做了什么。' },
        { t: '先认下对方辛苦，自己多跑几趟', dev: 10, fx: (g) => { g.remember('familySibling', 'time'); g.stat('健康', -1); g.stat('人缘', 2); }, res: '你把几件事挪开，替了两个周末。兄弟姐妹说，终于能睡个整觉。' },
        { t: '各管各的，先不翻旧账', dev: 10, fx: (g) => { g.remember('familySibling', 'apart'); g.stat('人缘', -2); }, res: '那张账没再往下算。群里只剩下收据和“收到”。' },
      ] },
    { id: 'e_family_sibling_echo', y: Y, minAge: 50, maxAge: 60, t: '群里的消息', auto: true, always: true, echoOf: 'e_family_sibling',
      cond: (g) => !!sibling(g) && !!g.recall('familySibling') && g.since('familySibling') >= 2,
      fx: (g) => { if (g.recall('familySibling') === 'apart') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => ({ share: '兄弟姐妹群里的轮班表换了很多版。有人临时有事，另一个会接上。年节的饭终于又能坐齐。', time: '你上回替班以后，兄弟姐妹也替你担过一次急事。那句“你歇一歇”听着很近。', apart: '有件急事你们还是一起办了。回程的车上，你先问对方最近身体怎么样，话才慢慢多起来。' }[g.recall('familySibling')]) },
  ]);
})();

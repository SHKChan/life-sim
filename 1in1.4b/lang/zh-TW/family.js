/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
    if (g.recall('hhPlace') === 'nursing' || g.recall('liveWith') === 'nursing') return '住在養老社群，作息有了安排，你也把自己習慣的飯點和需要安靜的時候說清楚。';
    if (g.recall('hhPlace') === 'dorm') return '宿舍的空間有限，東西收在自己的位置，晚歸和休息也得顧著同屋的人。';
    if (g.recall('liveWith') === 'kids' && ['k1', 'k2', 'k3'].some((id) => JY.byId[id] && g.alive(id) && CN.livesWith(g, id))) return '住進孩子家，吃飯和休息的習慣慢慢商量，你也給自己留一點不被打擾的時間。';
    if (['fa', 'mo'].some((id) => JY.byId[id] && g.alive(id) && CN.livesWith(g, id))) return '老人也在這屋裡住，飯點和休息的時間要一起商量，誰出門前都多問一句。';
    const house = g.recall('house');
    const back = house === 'hometown' || g.recall('liveWith') === 'hometown'
      || (g.recall('backHome') && [g.recall('city'), g.recall('homeCap')].includes(g.recall('workCity')));
    if (back) return '回到老家住下以後，家裡的事近了，自己的安排也要重新留出空當。';
    if (g.recall('tier') <= 2 && house === 'rent') return '住處還租著，屋裡的東西照樣按自己的習慣擺，手頭的錢也給房租和急用各留一份。';
    if (g.recall('tier') >= 3 && ['own', 'mortgage'].includes(house)) return house === 'mortgage' ? '這座小城的家安頓下來，還款日仍記在本子上，留給家裡的時間也得一起算。' : '這座小城的家住慣了，少了一筆還款，家裡的安排仍要一件件商量。';
    if (house === 'rent') return '住處還租著，續租和家裡的安排一起記著，熟悉的日常也在這間屋子裡慢慢積下來。';
    if (['own', 'mortgage'].includes(house)) return house === 'mortgage' ? '在這座城市有了自己的家，還款和急用的錢各留一份，往後的安排也多想一步。' : '在這座城市有了住慣的家，不用再惦記續租，日常的照應仍要慢慢安排。';
    return '';
  };

  // 真正不婚的支线：不再接“孩子想结婚”和第一胎孙辈。二孩原有的成长不受影响。
  ['e_m_kid_wed', 'o_gk_born'].forEach((id) => {
    const n = JY.ENCOUNTERS.concat(JY.LIFE_NODES).find((n) => n.id === id);
    if (!n) return;
    const cond = n.cond;
    n.cond = (g) => !g.recall('kidNoWed') && (!cond || cond(g));
  });

  JY.addEncounters([
    { id: 'e_family_teen_repair', y: Y, minAge: 35, maxAge: 64, t: '門沒關緊', always: true,
      cond: (g) => kid(g) && ka(g) === 16 && together(g) && ['strict', 'loose'].includes(g.recall('kidBond')) && g.since('kidBond') >= 1,
      text: (g) => kw(g) + '的房門留了一條縫。桌上擺著一張沒交的社團報名表。' + (g.recall('kidBond') === 'strict' ? '上回收手機以後，你們已經很久沒好好說話了。' : '你一直說讓孩子自己來，這次才發現連孩子喜歡什麼都說不上來。'),
      choices: [
        { t: '敲門，先聽孩子講完', canon: true, fx: (g) => { g.remember('familyTeen', 'listen'); g.remember('kidBond', 'close'); g.stat('人缘', 2); }, res: '你在床沿坐了半個鐘頭，沒提成績。報名表第二天交了上去。' },
        { t: '等考試完了再說', dev: 10, fx: (g) => { g.remember('familyTeen', 'later'); g.stat('心情', -1); }, res: '你把門輕輕帶上。那張表後來夾在課本里，一直沒交。' },
      ] },
    { id: 'e_family_teen_echo', y: Y, minAge: 36, maxAge: 67, t: '有話慢慢說', auto: true, always: true, echoOf: 'e_family_teen_repair',
      cond: (g) => kid(g) && !!g.recall('familyTeen') && g.since('familyTeen') >= 2,
      fx: (g) => { if (g.recall('familyTeen') === 'listen') g.stat('心情', 2); else g.stat('人缘', -1); },
      text: (g) => g.recall('familyTeen') === 'listen' ? '孩子遇到拿不定主意的事，會先發訊息問你。你學會了看完再回，不急著給答案。' : '孩子說起學校裡的事，你總要追問好幾句才聽明白。你把“等忙完”這三個字嚥了回去。' },

    { id: 'e_family_exam', y: Y, minAge: 35, maxAge: 64, t: '考前的夜裡', always: true,
      cond: (g) => kid(g) && ka(g) === 17 && together(g) && !!g.recall('kidSchool') && !g.recall('kidUni'),
      text: (g) => kw(g) + '把模擬卷鋪了一桌。' + (g.recall('kidSchool') === 'district' ? '當年為了這所學校背的那筆賬，你沒再提。' : g.recall('kidSchool') === 'left' ? '回到你身邊以後，孩子一直很用功。' : '晚飯熱過兩回，孩子還是沒動筷子。') + '明年就要高考了。',
      choices: [
        { t: '端碗熱湯，讓孩子早點睡', canon: true, fx: (g) => { g.remember('familyExam', 'rest'); g.stat('人缘', 2); }, res: '你沒問排名。孩子喝完湯，把檯燈關了。' },
        { t: '一起把錯題分分類', dev: 10, fx: (g) => { g.remember('familyExam', 'sort'); g.stat('学识', 1); }, res: '會的你講，不會的圈起來問老師。你們分出三摞，桌面終於空了一塊。' },
        { t: '報一輪考前小班（¥3,000）', dev: 10, cond: (g) => hasCash(g, 3000), fx: (g) => { CN.pay(g, 3000); g.remember('familyExam', 'class'); g.stat('心情', -1); }, res: '週末多了一趟接送。你在校門口等著，保溫杯裡的水喝涼了。' },
      ] },
    { id: 'e_family_exam_echo', y: Y, minAge: 36, maxAge: 67, t: '填完志願', auto: true, always: true, echoOf: ['e_family_exam', 'e_m_kid_gaokao'],
      cond: (g) => kid(g) && !!g.recall('familyExam') && !!g.recall('kidUni') && g.since('kidUni') >= 1,
      fx: (g) => { if (g.recall('familyExam') === 'rest') g.stat('人缘', 2); if (g.recall('familyExam') === 'sort') g.stat('心情', 2); },
      text: (g) => {
        const p = g.recall('familyExam'), u = g.recall('kidUni'), way = g.recall('kidPath');
        const result = u === 'none' ? '孩子走上了學手藝的路。' : way === 'stable' ? '錄取通知書上的專業是你選的。' : '孩子在自己選的學校安頓下來。';
        return result + (p === 'rest' ? '有天孩子說，考前那晚終於睡了個好覺。你記得那碗湯。' : p === 'sort' ? '那三摞錯題本留在了書架上。孩子說想帶走一本，留作紀念。' : '你收起了小班的繳費單。錢換來過一點安心，後來那條路還得孩子自己走。');
      } },

    { id: 'e_family_first_work', y: Y, minAge: 40, maxAge: 64, t: '孩子第一份工資', always: true,
      cond: (g) => kid(g) && ka(g) >= 23 && ka(g) <= 26 && !!g.recall('kidUni') && !!g.recall('kidCity') && g.recall('kidCity') !== '國外' && g.since('kidCity') >= 1,
      text: (g) => kw(g) + '發來一張工資單。' + (g.recall('kidUni') === 'none' ? '學徒期剛過，工具箱還沒攢齊。' : '試用期的工資扣完房租，只剩下一點。') + '孩子說想再試半年，你看著轉賬頁面想了一會兒。',
      choices: [
        { t: '先聽計劃，幫著算一遍賬', canon: true, fx: (g) => { g.remember('familyWork', 'budget'); g.stat('人缘', 2); }, res: '房租、吃飯、坐車，一項項寫下來。最後你們約好每月聊一回，先把日子過穩。' },
        { t: '轉 ¥6,000，給半年緩衝', dev: 10, cond: (g) => hasCash(g, 6000), fx: (g) => { CN.pay(g, 6000); g.remember('familyWork', 'support'); }, res: '你在轉賬備註裡寫“吃好點”。孩子隔了一會兒回了一個“好”。' },
        { t: '讓孩子先自己撐著', dev: 10, fx: (g) => { g.remember('familyWork', 'alone'); g.stat('人缘', -1); }, res: '你說年輕時都這樣。掛了電話，又查了那座城今天的天氣。' },
      ] },
    { id: 'e_family_work_echo', y: Y, minAge: 41, maxAge: 67, t: '熬過試用期', auto: true, always: true, echoOf: 'e_family_first_work',
      cond: (g) => kid(g) && !!g.recall('familyWork') && g.since('familyWork') >= 2,
      fx: (g) => { if (g.recall('familyWork') !== 'alone') g.stat('心情', 2); },
      text: (g) => ({ budget: '孩子換了間便宜一點的房，第一次攢下了應急的錢。現在輪到孩子催你，也給自己留一筆。', support: '孩子把 ¥6,000 轉了回來，還多寄了一盒當地的點心。你沒退回去，認真吃完了。', alone: '孩子後來把日子過穩了，卻很少再跟你說難處。你主動打了一次電話，問最近吃得怎麼樣。' }[g.recall('familyWork')]) },

    { id: 'e_family_no_wedding', y: Y, minAge: 40, maxAge: 64, t: '孩子的打算', always: true,
      cond: (g) => kid(g) && ka(g) === 26 && !g.recall('kidWed') && !g.recall('grandkids') && !!g.recall('kidCity') && (Number(g.recall('seed')) || 0) % 4 === 0,
      text: (g) => kw(g) + (g.recall('kidCity') === '國外' ? '在影片裡' : '在電話裡') + '說，往後不打算結婚，也不打算要孩子了。工作、住處和養老，孩子列了一張自己的清單。你聽完，飯已經涼了。',
      choices: [
        { t: '尊重孩子的打算', canon: true, fx: (g) => { g.remember('kidNoWed', 'respect'); g.stat('人缘', 2); }, res: '你說，想好了就把自己的日子照顧好。下次通話，你先問工作順不順。' },
        { t: '一起把往後的照應談清楚', dev: 10, fx: (g) => { g.remember('kidNoWed', 'plan'); g.stat('人缘', 1); }, res: '生病找誰、急事聯絡誰，你們各自寫了一份。你把孩子的備用聯絡人存進了手機。' },
        { t: '還是勸孩子再考慮', dev: 10, fx: (g) => { g.remember('kidNoWed', 'press'); g.stat('人缘', -2); }, res: '你講了很久。孩子說已經考慮過了。那通電話結束得比平常早。' },
      ] },
    { id: 'e_family_no_wedding_echo', y: Y, minAge: 43, maxAge: 75, t: '另一種日子', auto: true, always: true, echoOf: 'e_family_no_wedding',
      cond: (g) => kid(g) && !!g.recall('kidNoWed') && g.since('kidNoWed') >= 4,
      fx: (g) => { if (g.recall('kidNoWed') === 'press') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => '孩子仍然沒有結婚，也沒有要孩子。' + ({ respect: '電話裡會講工作和朋友的事。你慢慢習慣了不再等一場婚禮。', plan: '那張互相照應的清單更新過兩次。孩子也給你留好了醫院和鄰居的電話。', press: '親戚再問起，你說孩子有自己的安排。那年過節，你終於沒有再催。' }[g.recall('kidNoWed')]) },

    { id: 'e_family_partner', y: Y, minAge: 46, maxAge: 54, t: '兩個人的晚飯', always: true,
      cond: (g) => spouse(g) && CN.livesWith(g, 'sp') && !!g.recall('marriage') && g.since('marriage') >= 6,
      text: (g) => '你和' + g.name('sp') + '吃著晚飯，說了半天賬單和家裡的事，忽然發現已經很久沒問對方過得怎麼樣。' + (g.recall('marriage') === 'mended' ? '當年談開過一次，有些話還是又省略了。' : '桌上的湯涼了一層，你們誰也沒起身。'),
      choices: [
        { t: '收起手機，飯後慢慢聊', canon: true, fx: (g) => { g.remember('familyPartner', 'talk'); g.stat('人缘', 2); }, res: '你們繞小區走了一圈。聊到年輕時候，走過了自家樓門才想起來。' },
        { t: '每週留一個晚上各做喜歡的事', dev: 10, fx: (g) => { g.remember('familyPartner', 'space'); g.stat('心情', 2); }, res: '你們在日曆上圈了一個晚上。有人去上課，有人去會老友，回來有了新鮮話。' },
        { t: '先把眼前的事忙完', dev: 10, fx: (g) => { g.remember('familyPartner', 'busy'); g.stat('心情', -1); }, res: '你又開啟了手機。洗碗的水聲響了很久。' },
      ] },
    { id: 'e_family_partner_echo', y: Y, minAge: 48, maxAge: 58, t: '桌邊的空當', auto: true, always: true, echoOf: 'e_family_partner',
      cond: (g) => spouse(g) && !!g.recall('familyPartner') && g.since('familyPartner') >= 2,
      fx: (g) => { if (g.recall('familyPartner') === 'busy') g.stat('心情', -2); else g.stat('人缘', 2); },
      text: (g) => ({ talk: '你們養成了飯後說說話的習慣。有時只聊菜價，聊著也踏實。', space: '各自有點喜歡的事，家裡的話反倒多了。對方帶回來一張活動照，讓你挑哪張好看。', busy: '你們仍然把家裡的事安排得井井有條。對方說累的時候，你這次放下手機聽了。' }[g.recall('familyPartner')]) },

    { id: 'e_family_sibling', y: Y, minAge: 48, maxAge: 56, t: '兄弟姐妹的賬本', always: true,
      cond: (g) => !!sibling(g) && !!g.recall('parentsCare') && (g.alive('fa') || g.alive('mo')) && g.since('parentsCare') >= 3,
      text: (g) => '照顧老人的日子久了，' + CN.who(g, sibling(g), true) + '給你發來一張手寫的賬。車費、藥費，還有誰請過幾天假。你看見最後一行寫著：找一天一起商量。',
      choices: [
        { t: '把錢和輪班一起攤開說', canon: true, fx: (g) => { g.remember('familySibling', 'share'); g.stat('人缘', 2); }, res: '你們在飯桌上排出下個月的時間。有人多出錢，有人多跑腿，終於都知道對方做了什麼。' },
        { t: '先認下對方辛苦，自己多跑幾趟', dev: 10, fx: (g) => { g.remember('familySibling', 'time'); g.stat('健康', -1); g.stat('人缘', 2); }, res: '你把幾件事挪開，替了兩個週末。兄弟姐妹說，終於能睡個整覺。' },
        { t: '各管各的，先不翻舊賬', dev: 10, fx: (g) => { g.remember('familySibling', 'apart'); g.stat('人缘', -2); }, res: '那張賬沒再往下算。群裡只剩下收據和“收到”。' },
      ] },
    { id: 'e_family_sibling_echo', y: Y, minAge: 50, maxAge: 60, t: '群裡的訊息', auto: true, always: true, echoOf: 'e_family_sibling',
      cond: (g) => !!sibling(g) && !!g.recall('familySibling') && g.since('familySibling') >= 2,
      fx: (g) => { if (g.recall('familySibling') === 'apart') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => ({ share: '兄弟姐妹群裡的輪班表換了很多版。有人臨時有事，另一個會接上。年節的飯終於又能坐齊。', time: '你上回替班以後，兄弟姐妹也替你擔過一次急事。那句“你歇一歇”聽著很近。', apart: '有件急事你們還是一起辦了。回程的車上，你先問對方最近身體怎麼樣，話才慢慢多起來。' }[g.recall('familySibling')]) },
  ]);

  // 沿用原节点和结算；住所与习惯的补充各只加一句，不增加日志条数。
  const housing = ['m_46_house_echo', 'm_52_care_echo', 'm_61_plan_echo', 'm_43_career_echo', 'm_54_nest_echo', 'e_family_partner_echo', 'e_family_work_echo', 'o_first_morning', 'o_care_echo'];
  const habits = ['m_43_career_echo', 'm_48_check_echo', 'e_h_injury_echo', 'e_family_partner_echo', 'o_first_morning', 'o_hobby_echo', 'o_chronic_echo'];
  [...new Set(housing.concat(habits))].forEach((id) => {
    const n = JY.LIFE_NODES.concat(JY.ENCOUNTERS).find((x) => x.id === id);
    if (!n) return;
    const text = n.text;
    n.text = (g) => (typeof text === 'function' ? text(g) : text || '')
      + (housing.includes(id) ? CN.homeLifeContext(g) : '')
      + (habits.includes(id) && CN.focusMemory ? CN.focusMemory(g) : '');
  });
  const spending = { y_house: null, y_house29: null, m_44_buy: null, m_55_ill: null, f_pension: 12000, f_review45: null, f_retire62: null, e_family_first_work: 6000 };
  Object.keys(spending).forEach((id) => {
    const n = JY.LIFE_NODES.concat(JY.ENCOUNTERS).find((x) => x.id === id);
    if (!n) return;
    const text = n.text;
    n.text = (g) => (typeof text === 'function' ? text(g) : text || '') + (CN.moneyRoom ? CN.moneyRoom(g, spending[id]) : '');
  });
})();

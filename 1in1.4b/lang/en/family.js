/* 由 share/tools/tr.js 从 data/family.js 和 lang/en/tr/family.json 生成，不要手改。 */
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
    if (g.recall('hhPlace') === 'nursing' || g.recall('liveWith') === 'nursing') return 'Living in a retirement community, your routine has a structure, and you make clear your usual mealtimes and when you need quiet.';
    if (g.recall('hhPlace') === 'dorm') return 'Dorm space is limited, so you keep your things in your own spot and consider your roommates when coming back late or resting.';
    if (g.recall('liveWith') === 'kids' && ['k1', 'k2', 'k3'].some((id) => JY.byId[id] && g.alive(id) && CN.livesWith(g, id))) return 'Living in your child\'s home, you work out eating and resting habits gradually, and keep a little undisturbed time for yourself.';
    if (['fa', 'mo'].some((id) => JY.byId[id] && g.alive(id) && CN.livesWith(g, id))) return 'The elders live here too, so mealtimes and rest times have to be settled together, and everyone asks one more question before going out.';
    const house = g.recall('house');
    const back = house === 'hometown' || g.recall('liveWith') === 'hometown'
      || (g.recall('backHome') && [g.recall('city'), g.recall('homeCap')].includes(g.recall('workCity')));
    if (back) return 'Having settled back in your hometown, family matters are close at hand, and you need to make room again in your own schedule.';
    if (g.recall('tier') <= 2 && house === 'rent') return 'You\'re still renting, arranging things in the flat as you like, and setting aside money for both rent and emergencies.';
    if (g.recall('tier') >= 3 && ['own', 'mortgage'].includes(house)) return house === 'mortgage' ? 'With your home settled in this small city, the repayment date is still written in your notebook, and the time you leave for family has to be counted in too.' : 'You\'re used to your home in this small city, with one repayment fewer, but family arrangements still have to be talked through one by one.';
    if (house === 'rent') return 'You\'re still renting, keeping track of renewals alongside family plans, and familiar daily routines slowly accumulate in this room.';
    if (['own', 'mortgage'].includes(house)) return house === 'mortgage' ? 'With a home of your own in this city, you set aside money for repayments and emergencies, and think one step further ahead.' : 'You have a home you\'re used to in this city and no longer worry about lease renewal, though day-to-day care still has to be arranged slowly.';
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
    { id: 'e_family_teen_repair', y: Y, minAge: 35, maxAge: 64, t: 'The Door Not Quite Shut', always: true,
      cond: (g) => kid(g) && ka(g) === 16 && together(g) && ['strict', 'loose'].includes(g.recall('kidBond')) && g.since('kidBond') >= 1,
      text: (g) => kw(g) + '\'s door is left ajar. On the desk lies a club sign-up form that hasn\'t been handed in.' + (g.recall('kidBond') === 'strict' ? 'Since you took the phone away last time, the two of you haven\'t had a proper talk in a long while.' : 'You\'ve always said to let the child do things on their own, and only now realise you can\'t even say what your child likes.'),
      choices: [
        { t: 'Knock, and hear the child out first', canon: true, fx: (g) => { g.remember('familyTeen', 'listen'); g.remember('kidBond', 'close'); g.stat('人缘', 2); }, res: 'You sit on the edge of the bed for half an hour without mentioning grades. The sign-up form is handed in the next day.' },
        { t: 'Wait until exams are over', dev: 10, fx: (g) => { g.remember('familyTeen', 'later'); g.stat('心情', -1); }, res: 'You pull the door gently shut. The form ends up tucked in a textbook and is never handed in.' },
      ] },
    { id: 'e_family_teen_echo', y: Y, minAge: 36, maxAge: 67, t: 'Take Your Time Talking', auto: true, always: true, echoOf: 'e_family_teen_repair',
      cond: (g) => kid(g) && !!g.recall('familyTeen') && g.since('familyTeen') >= 2,
      fx: (g) => { if (g.recall('familyTeen') === 'listen') g.stat('心情', 2); else g.stat('人缘', -1); },
      text: (g) => g.recall('familyTeen') === 'listen' ? 'When the child can\'t decide something, they message you first. You\'ve learned to read it through before replying, with no rush to give an answer.' : 'When the child talks about school, you have to ask several follow-up questions before you understand. You swallow back the words "when I\'m done being busy".' },

    { id: 'e_family_exam', y: Y, minAge: 35, maxAge: 64, t: 'The Night Before the Exam', always: true,
      cond: (g) => kid(g) && ka(g) === 17 && together(g) && !!g.recall('kidSchool') && !g.recall('kidUni'),
      text: (g) => kw(g) + ' has spread mock papers over the whole desk.' + (g.recall('kidSchool') === 'district' ? 'The debt you took on for this school back then, you no longer bring up.' : g.recall('kidSchool') === 'left' ? 'Since coming back to live with you, the child has worked very hard.' : 'The dinner has been reheated twice and the child still hasn\'t touched their chopsticks.') + 'The college entrance exam is next year.',
      choices: [
        { t: 'Bring a bowl of hot soup and send the child to bed early', canon: true, fx: (g) => { g.remember('familyExam', 'rest'); g.stat('人缘', 2); }, res: 'You don\'t ask about rankings. The child finishes the soup and turns off the desk lamp.' },
        { t: 'Sort out the wrong answers together', dev: 10, fx: (g) => { g.remember('familyExam', 'sort'); g.stat('学识', 1); }, res: 'You explain what you can, and circle the rest to ask the teacher. You sort them into three piles, and a patch of the desk is finally clear.' },
        { t: 'Sign up for a pre-exam small class (¥3,000)', dev: 10, cond: (g) => hasCash(g, 3000), fx: (g) => { CN.pay(g, 3000); g.remember('familyExam', 'class'); g.stat('心情', -1); }, res: 'The weekends now include an extra pick-up run. You wait at the school gate, and the water in your thermos goes cold.' },
      ] },
    { id: 'e_family_exam_echo', y: Y, minAge: 36, maxAge: 67, t: 'After Filling in Applications', auto: true, always: true, echoOf: ['e_family_exam', 'e_m_kid_gaokao'],
      cond: (g) => kid(g) && !!g.recall('familyExam') && !!g.recall('kidUni') && g.since('kidUni') >= 1,
      fx: (g) => { if (g.recall('familyExam') === 'rest') g.stat('人缘', 2); if (g.recall('familyExam') === 'sort') g.stat('心情', 2); },
      text: (g) => {
        const p = g.recall('familyExam'), u = g.recall('kidUni'), way = g.recall('kidPath');
        const result = u === 'none' ? 'The child sets off down the road of learning a trade.' : way === 'stable' ? 'The major on the admission letter is one you chose.' : 'The child settles into the school they chose themselves.';
        return result + (p === 'rest' ? 'One day the child says they finally got a good night\'s sleep the night before the exam. You remember that bowl of soup.' : p === 'sort' ? 'Those three piles of mistake notebooks stay on the shelf. The child says they\'d like to take one along as a keepsake.' : 'You put away the class payment slip. The money bought a little peace of mind, but the child still has to walk the road alone.');
      } },

    { id: 'e_family_first_work', y: Y, minAge: 40, maxAge: 64, t: 'The Child\'s First Paycheck', always: true,
      cond: (g) => kid(g) && ka(g) >= 23 && ka(g) <= 26 && !!g.recall('kidUni') && !!g.recall('kidCity') && g.recall('kidCity') !== 'abroad' && g.since('kidCity') >= 1,
      text: (g) => kw(g) + ' sends you a pay slip.' + (g.recall('kidUni') === 'none' ? 'The apprenticeship has just ended and the toolbox isn\'t complete yet.' : 'After rent comes out of the probation-period wage, only a little is left.') + 'The child says they want to try another half year, and you stare at the transfer page for a while.',
      choices: [
        { t: 'Hear the plan first and help work out the numbers', canon: true, fx: (g) => { g.remember('familyWork', 'budget'); g.stat('人缘', 2); }, res: 'Rent, food, transport: you write them down one by one. In the end you agree to talk once a month and get life steady first.' },
        { t: 'Transfer ¥6,000 as a half-year cushion', dev: 10, cond: (g) => hasCash(g, 6000), fx: (g) => { CN.pay(g, 6000); g.remember('familyWork', 'support'); }, res: 'In the transfer note you write "eat well". After a moment, the child replies with a single "OK".' },
        { t: 'Let the child manage alone first', dev: 10, fx: (g) => { g.remember('familyWork', 'alone'); g.stat('人缘', -1); }, res: 'You say everyone\'s like this when young. After hanging up, you check that city\'s weather for today.' },
      ] },
    { id: 'e_family_work_echo', y: Y, minAge: 41, maxAge: 67, t: 'Getting Through the Probation Period', auto: true, always: true, echoOf: 'e_family_first_work',
      cond: (g) => kid(g) && !!g.recall('familyWork') && g.since('familyWork') >= 2,
      fx: (g) => { if (g.recall('familyWork') !== 'alone') g.stat('心情', 2); },
      text: (g) => ({ budget: 'The child moves to a cheaper room and for the first time saves emergency money. Now it\'s the child\'s turn to urge you to set a little aside for yourself.', support: 'The child transfers the ¥6,000 back and sends a box of local snacks as well. You don\'t send it back, and eat every bite with care.', alone: 'The child later gets life steady, but seldom tells you about difficulties now. You take the initiative to call and ask how well they\'ve been eating lately.' }[g.recall('familyWork')]) },

    { id: 'e_family_no_wedding', y: Y, minAge: 40, maxAge: 64, t: 'The Child\'s Plan', always: true,
      cond: (g) => kid(g) && ka(g) === 26 && !g.recall('kidWed') && !g.recall('grandkids') && !!g.recall('kidCity') && (Number(g.recall('seed')) || 0) % 4 === 0,
      text: (g) => kw(g) + (g.recall('kidCity') === 'abroad' ? ' says on a video call that' : ' says on the phone that') + ' they no longer plan to marry or have children. They\'ve drawn up their own list covering work, housing and old age. By the time you\'ve heard it all, the meal has gone cold.',
      choices: [
        { t: 'Respect the child\'s plan', canon: true, fx: (g) => { g.remember('kidNoWed', 'respect'); g.stat('人缘', 2); }, res: 'You say that once they\'ve thought it through, they should look after their own life well. On the next call, you ask first whether work is going smoothly.' },
        { t: 'Talk through future mutual care together', dev: 10, fx: (g) => { g.remember('kidNoWed', 'plan'); g.stat('人缘', 1); }, res: 'Who to turn to when ill and who to contact in an emergency: each of you writes a list. You save the child\'s backup contact in your phone.' },
        { t: 'Still urge the child to reconsider', dev: 10, fx: (g) => { g.remember('kidNoWed', 'press'); g.stat('人缘', -2); }, res: 'You talk for a long time. The child says they\'ve already considered it. The call ends earlier than usual.' },
      ] },
    { id: 'e_family_no_wedding_echo', y: Y, minAge: 43, maxAge: 75, t: 'A Different Kind of Life', auto: true, always: true, echoOf: 'e_family_no_wedding',
      cond: (g) => kid(g) && !!g.recall('kidNoWed') && g.since('kidNoWed') >= 4,
      fx: (g) => { if (g.recall('kidNoWed') === 'press') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => 'The child still hasn\'t married or had children.' + ({ respect: 'On the phone they talk about work and friends. You slowly get used to no longer waiting for a wedding.', plan: 'That list of mutual care has been updated twice. The child has also left you the hospital\'s and the neighbours\' phone numbers.', press: 'When relatives ask again, you say the child has their own plans. That festival, you finally don\'t press them.' }[g.recall('kidNoWed')]) },

    { id: 'e_family_partner', y: Y, minAge: 46, maxAge: 54, t: 'Dinner for Two', always: true,
      cond: (g) => spouse(g) && CN.livesWith(g, 'sp') && !!g.recall('marriage') && g.since('marriage') >= 6,
      text: (g) => 'You and ' + g.name('sp') + ' are eating dinner, talking for ages about bills and household matters, and suddenly realise you haven\'t asked how the other is doing in a long time.' + (g.recall('marriage') === 'mended' ? 'You talked things through once, but some words have been left unsaid again.' : 'A skin has formed on the cooling soup, and neither of you gets up.'),
      choices: [
        { t: 'Put away the phones and talk slowly after dinner', canon: true, fx: (g) => { g.remember('familyPartner', 'talk'); g.stat('人缘', 2); }, res: 'You walk a lap around the compound. Talking about your younger days, you walk right past your own building before remembering.' },
        { t: 'Reserve one evening a week for what each of you enjoys', dev: 10, fx: (g) => { g.remember('familyPartner', 'space'); g.stat('心情', 2); }, res: 'You circle one evening on the calendar. One goes to class, the other meets old friends, and both come back with fresh things to say.' },
        { t: 'Finish what\'s in front of you first', dev: 10, fx: (g) => { g.remember('familyPartner', 'busy'); g.stat('心情', -1); }, res: 'You open your phone again. The sound of running water from the dishes goes on for a long time.' },
      ] },
    { id: 'e_family_partner_echo', y: Y, minAge: 48, maxAge: 58, t: 'The Gap at the Table', auto: true, always: true, echoOf: 'e_family_partner',
      cond: (g) => spouse(g) && !!g.recall('familyPartner') && g.since('familyPartner') >= 2,
      fx: (g) => { if (g.recall('familyPartner') === 'busy') g.stat('心情', -2); else g.stat('人缘', 2); },
      text: (g) => ({ talk: 'You\'ve formed the habit of talking after dinner. Sometimes it\'s only vegetable prices, but it feels reassuring all the same.', space: 'With each having a few things you enjoy, there\'s actually more to talk about at home. The other brings back an event photo and asks you to pick which looks best.', busy: 'You still keep household matters in good order. When the other says they\'re tired, this time you put down your phone and listen.' }[g.recall('familyPartner')]) },

    { id: 'e_family_sibling', y: Y, minAge: 48, maxAge: 56, t: 'The Siblings\' Ledger', always: true,
      cond: (g) => !!sibling(g) && !!g.recall('parentsCare') && (g.alive('fa') || g.alive('mo')) && g.since('parentsCare') >= 3,
      text: (g) => 'After a long time caring for your parents, ' + CN.who(g, sibling(g), true) + ' sends you a handwritten account: fares, medicine costs, and who took how many days off. You see the last line reads: find a day to talk it over together.',
      choices: [
        { t: 'Lay out the money and the shifts together', canon: true, fx: (g) => { g.remember('familySibling', 'share'); g.stat('人缘', 2); }, res: 'At the dinner table you work out next month\'s schedule. Some pay more, some run more errands, and at last everyone knows what the others have done.' },
        { t: 'Acknowledge their hard work and take on more trips yourself', dev: 10, fx: (g) => { g.remember('familySibling', 'time'); g.stat('健康', -1); g.stat('人缘', 2); }, res: 'You move a few things aside and cover two weekends. Your sibling says they can finally sleep a whole night.' },
        { t: 'Each handle their own part and leave old accounts alone', dev: 10, fx: (g) => { g.remember('familySibling', 'apart'); g.stat('人缘', -2); }, res: 'That ledger isn\'t added up any further. The group chat is left with only receipts and "received".' },
      ] },
    { id: 'e_family_sibling_echo', y: Y, minAge: 50, maxAge: 60, t: 'Messages in the Group Chat', auto: true, always: true, echoOf: 'e_family_sibling',
      cond: (g) => !!sibling(g) && !!g.recall('familySibling') && g.since('familySibling') >= 2,
      fx: (g) => { if (g.recall('familySibling') === 'apart') g.stat('人缘', -1); else g.stat('心情', 2); },
      text: (g) => ({ share: 'The shift schedule in the siblings\' group chat has had many versions. When someone has something come up, another steps in. The festival meal can finally be sat at in full again.', time: 'After you covered a shift last time, your sibling in turn took on an emergency for you. The words "take a rest" sounded very close.', apart: 'You still handled one urgent matter together. On the ride back, you first ask how the other has been keeping, and slowly the conversation picks up.' }[g.recall('familySibling')]) },
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

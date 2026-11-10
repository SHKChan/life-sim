/* 由 share/tools/tr.js 从 data/spine.js 和 lang/en/tr/spine.json 生成，不要手改。 */
/* 十四亿分之一 · 人生主干（节奏和掌控感）
 * 一生大约八十多年，原来几乎一年一个抉择，太密。这一份决定：
 *   1. 哪些抉择停下来问玩家（MAJOR：升学、去向、工作、感情、房子、孩子、钱、养老这些大事，再加四个人生关口）；
 *      其余的小事“顺其自然”，引擎按这一生的性子自动选（share/engine.js 的 E.autoIndex），生平里照样记一行。
 *   2. 给大事加上 stake（这一步决定什么，弹框里一行）和选项的 hint（代价和好处，选项下面一行小字），
 *      让玩家知道自己在赌什么。
 *   3. 回响节点写 echoOf：弹框里提一句“你 xx 岁时选了……”，让后果看得见。
 * 意外（奇遇）里，带判定或会出人命的，隔十二年以上才让玩家亲自选一次；其余顺其自然。
 * 只按 id 给已有节点加字段，不改剧情本身。新增的节点（finance.js、tech.js）自己写 major: true。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const MAJOR = [
    // 童年：升学的几道坎
    'c_xiaoshengchu', 'c_zhongkao', 'c_hs_track', 'c_voc_major', 'c_first_job', 'c_hs_path', 'c_voc_intern', 'c_work_17',
    // 青年：高考志愿、第一份工作、感情、房子、孩子、钱
    'y_zhiyuan', 'y_zhuanke', 'y_luobang', 'y_voc18', 'y_work18', 'y_offer', 'y_worker22', 'y_college_out', 'y_ai24',
    'y_love23', 'y_love25', 'y_dating25', 'y_marry', 'y_car26', 'y_house', 'y_house29', 'y_back27', 'y_startup', 'y_biz32',
    'y_kid', 'y_kid2', 'y_crisis31', 'y_last34', 'y_save23', 'y_money33',
    // 中年：三十五岁、婚姻、四十二岁转行、房贷、AI、父母、钱、大病、退休去哪
    'm_35_office', 'm_35_stable', 'm_35_labor', 'm_35_own', 'm_35_none', 'm_36_money', 'm_38_marriage',
    'm_42_office', 'm_42_stable', 'm_42_labor', 'm_42_own', 'm_42_none', 'm_44_buy', 'm_44_loan', 'm_44_own',
    'm_47_ai', 'm_51_parents', 'm_53_money', 'm_55_ill', 'm_60_plan',
    // 老年：还干不干、住哪儿、谁照顾、遗嘱、临终
    'o_keep_working', 'o_where', 'o_where_nokid', 'o_care_plan', 'o_will', 'o_icu_talk', 'o_last_place',
    // 行情：股灾、疯牛的年份（finance.js 的行情链决定）
    'e_m_crash', 'e_m_boom',
  ];
  const SET = new Set(MAJOR);
  const byId = (id) => JY.LIFE_NODES.find((n) => n.id === id) || JY.ENCOUNTERS.find((n) => n.id === id);
  JY.LIFE_NODES.concat(JY.ENCOUNTERS).forEach((n) => { if (SET.has(n.id)) n.major = true; });

  /* stake：这一步决定什么；hints：按选项在 choices 里的位置（下标），写代价和好处 */
  const PATCH = {
    c_xiaoshengchu: { stake: 'How good your middle school is will decide how you do in the high-school entrance exam three years from now.', hints: { 1: 'Get in and your Smarts and exam prospects jump' , 2: 'Fees of several thousand dollars a year, paid by your family' } },
    c_zhongkao: { stake: 'This decides whether you head for academic high school and university, or learn a trade and start earning early.', hints: { 0: 'Best shot at the college entrance exam', 2: 'Saves money; a weaker school', 3: 'Working in three years', 6: 'Earn now; education stops at middle school' } },
    c_hs_track: { stake: 'Your subject track decides which university majors you can apply for.', hints: { 0: 'More majors to choose from, higher pay later', 1: 'Happier; fewer majors open to you', 2: 'Your parents are pleased; a better shot at the civil-service exam' } },
    c_voc_major: { stake: 'Your vocational major will likely be your living for the next ten-plus years.', hints: { 0: 'Factories and garages always need people', 1: 'Care homes and kindergartens are always hiring', 2: 'Income depends on luck; the good ones do very well', 3: 'A new trade; the more robots, the more you are needed' } },
    c_first_job: { stake: 'Working at sixteen: pay, skills and how far you can go all branch from here.', hints: { 0: 'Paid right away; hard work', 1: 'Apprentice pay is low; you end up with a skill', 2: 'Learn from a master: slow, but steady' } },
    c_hs_path: { stake: 'How you push in the final year feeds straight into your college entrance score.', hints: { 0: 'Steady', 1: 'Paid tutoring lifts your score', 4: 'Only with high Smarts; win and you skip the exam' } },
    c_voc_intern: { stake: 'After the internship: start working now, or three more years at college.', hints: { 0: 'Earn early; stop at a vocational diploma', 1: 'Three more years, a higher starting salary' } },
    c_work_17: { stake: 'A year of work behind you: keep saving, or find a way up?', hints: { 0: 'Your first savings', 1: 'Night classes now, a better job later', 2: 'Big-city pay is higher; so are the costs' } },
    y_zhiyuan: { stake: 'Which city and which major decide where your first job is and what it pays.', hints: { 0: 'More chances in a big city; pricier homes too', 1: 'Stable, mid-level pay, little fear of layoffs', 2: 'Close to home, a bit less pay, easy to look after family' } },
    y_zhuanke: { stake: 'College, a repeat year, or straight to work.', hints: { 0: 'Easy to find work in three years', 1: 'Bet another year on a university place', 2: 'Earn early; education stops at high school' } },
    y_luobang: { stake: 'You did not get in. What now?', hints: { 0: 'Try again next year', 1: 'Paid right away; hard work', 2: 'Must pass the medical; good placement after service' } },
    y_offer: { stake: 'Your first job largely decides, until thirty, which city you live in, what you earn and how tired you are.', hints: { 0: 'Only with high Smarts; best pay, most overtime', 1: 'Safe; hard to lay off', 2: 'An exam to pass; pass and you are set for life', 3: 'Needs Social to take off; income depends on luck' } },
    y_ai24: { stake: 'AI has arrived and there is less work for you. Adapt, or switch to work machines cannot do?', hints: { 0: 'With enough Smarts you stay, same pay', 1: 'A new field; slow start, good prospects', 2: 'Modest pay, but no machine can replace you' } },
    y_love23: { stake: 'This affects when you settle down, and with whom.', hints: { 0: 'Easier with high Social', 1: 'Happier, but your family will keep nagging' } },
    y_love25: { stake: 'Stay single, or start looking.', hints: { 0: 'Through friends; reliable', 1: 'Pure luck; a good Mood helps you meet the right person', 2: 'Freedom; perhaps lonelier in old age' } },
    y_dating25: { stake: 'Meeting the parents means heading for marriage.', hints: { 2: 'Wait: maybe something better comes, maybe it falls apart' } },
    y_marry: { stake: 'A wedding costs a fortune, and decides who you spend the next decades with.', hints: { 0: 'Bride price plus banquet: the most expensive option', 2: 'Saves money; the elders may grumble', 3: 'Start over alone' } },
    y_car26: { stake: 'Whether to buy a car, and which: yearly costs versus convenience.', hints: { 1: 'An EV: cheap to charge, saves hundreds a year on fuel', 2: 'Years of car loan payments', 3: 'Cheap; expensive repairs' } },
    y_house: { stake: 'The biggest bill of your life: the down payment, a thirty-year mortgage, where you live, where your kids go to school.', hints: { 0: 'Most comfortable home, heaviest mortgage', 1: 'Less pressure; you may need to move later', 2: 'Cheap; far from work', 3: 'Low prices; a commute of over an hour', 4: 'No mortgage, money free to invest; rent forever' } },
    y_house29: { stake: 'The biggest bill of your life: the down payment, a thirty-year mortgage, where you live, where your kids go to school.', hints: { 0: 'Most comfortable home, heaviest mortgage', 1: 'Less pressure; you may need to move later', 2: 'Cheap; far from work', 3: 'Low prices; a commute of over an hour', 4: 'No mortgage, money free to invest; rent forever' } },
    y_back27: { stake: 'Stay in the big city, or go back to your parents.', hints: { 0: 'Higher income, far from home', 1: 'Less income, family nearby, cheap housing' } },
    y_startup: { stake: 'A chance that could change your life, or lose you everything.', hints: { 0: 'Odds rise with Career; success multiplies your income', 1: 'Keep your salary' } },
    y_biz32: { stake: 'Start something of your own?', hints: { 3: 'Keep your salary' } },
    y_kid: { stake: 'Whether to have a child, and who raises them, shapes your money and time for twenty years, and who is by your side in old age.', hints: { 0: 'Cheap; tiring for the grandparents', 1: 'Childcare costs hundreds a month', 2: 'One less income in the house', 3: 'Save up a bit more first', 4: 'More money; you must plan your own old age' } },
    y_kid2: { stake: 'Another child: double the cost, one more person to lean on later.', hints: { 0: 'More money and time', 1: 'Another decade-plus of money and energy' } },
    y_crisis31: { stake: 'How this fight ends becomes the shape of your marriage.', hints: { 0: 'Social and Mood both improve', 1: 'It cools, and gets harder to talk later', 2: 'Split the assets, split custody, start over' } },
    y_last34: { stake: 'Your last chance to change lanes before thirty-five.', hints: { 0: 'Needs high Smarts to pass; once in, no fear of layoffs', 1: 'No risk', 2: 'Income depends on luck; could double, could lose' } },
    m_35_office: { stake: 'At thirty-five, your company is “optimizing” staff.', hints: { 0: '30% less pay, but still a job' } },
    m_35_stable: { stake: 'Try for a step up?', hints: { 0: 'No risk', 1: 'With enough Social you get it; a pay rise' } },
    m_35_labor: { stake: 'Manual work: one day your body will not keep up.', hints: { 0: 'A few more years of earning, hard on your body', 3: 'Switch to a small business of your own' } },
    m_35_own: { stake: 'Grow the business?', hints: { 0: 'Safe', 1: 'Only borrow with high Career; win and income doubles, lose and you carry debt', 2: 'Less income, peace of mind' } },
    m_35_none: { stake: 'No real job these past years. What now?', hints: { 0: 'A steady income', 2: 'With enough Smarts you can freelance' } },
    m_38_marriage: { stake: 'The marriage has gone cold.', hints: { 0: 'Muddle through; Mood slowly sinks', 1: 'With enough Social you can talk it through', 2: 'Separate; everything gets recalculated' } },
    m_42_office: { stake: 'At forty-two, your industry changes again.', hints: { 0: 'No raise', 1: 'With enough Smarts you switch, for higher pay', 2: 'Half the pay, an easier life' } },
    m_42_labor: { stake: 'Try a different life?', hints: { 0: 'Safe', 1: 'Put in $11K; succeed and you are your own boss', 2: 'High pay; you see your family once a year' } },
    m_44_buy: { stake: 'Forty-four and still renting. Buy now, or rent for good?', hints: { 0: 'No debt; money free to invest', 3: 'A home of your own; a mortgage past retirement' } },
    m_44_loan: { stake: 'The mortgage: pay down more, or move?', hints: { 0: 'Keep the cash', 1: 'Less interest, tighter budget' } },
    m_47_ai: { stake: 'Another wave of AI. Keep up again?', hints: { 0: 'Earn a bit less and hold on until retirement', 1: 'With enough Smarts you keep your job', 2: 'Much less income, much less stress' } },
    m_51_parents: { stake: 'Your parents are old. Caring for them is a trade-off between money, time and conscience.', hints: { 1: 'Hundreds a month; easier on you, hard on your conscience', 2: 'Hardest on you, best for them', 3: 'Pay for help and catch your breath' } },
    m_55_ill: { stake: 'A serious illness: the treatment decides how many years you have left.', hints: { 0: 'Most expensive, best chance of surviving', 1: 'Cheaper; harder on your body', 2: 'Spare your children the worry; bear it alone' } },
    m_60_plan: { stake: 'Where you live after retiring decides who is around you in old age.', hints: { 1: 'Spend on fixing up the old house; peace and quiet', 2: 'Near the grandkids; help raise them', 3: 'Free up money for retirement', 4: 'Warm winters; extra cost every year' } },
    o_keep_working: { stake: 'Retired. Keep working anyway?', hints: { 0: 'Extra income; your body pays', 3: 'Easier on your body; money is tighter' } },
    o_where: { stake: 'Live with your children in old age, or keep your own home?', hints: { 0: 'Someone looks after you; you mind their moods', 1: 'Free, but no one is near if something happens' } },
    o_where_nokid: { stake: 'No children nearby. How will you arrange old age?', hints: { 2: '$700 a month; someone looks after you' } },
    o_care_plan: { stake: 'Who will look after you from now on?', hints: { 0: 'One payment; a robot that steadies you and reminds you of pills', 1: '$700 a month, with carers', 2: 'Living with your children: lively, and crowded', 3: 'Free; if something happens, no one knows' } },
    o_will: { stake: 'Who gets what you saved over a lifetime?' },
    o_icu_talk: { stake: 'Someone has to decide this for you in advance.' },
  };
  Object.keys(PATCH).forEach((id) => {
    const n = byId(id);
    if (!n) return;
    const p = PATCH[id];
    if (p.stake && !n.stake) n.stake = p.stake;
    if (p.hints && n.choices) Object.keys(p.hints).forEach((i) => { const ch = n.choices[i]; if (ch && !ch.hint) ch.hint = p.hints[i]; });
  });

  /* 回响：几年后回来兑现当年的选择。弹框里提一句“你 xx 岁时选了……” */
  const ECHO = {
    m_37_crisis_echo: 'y_crisis31', m_39_money_echo: ['m_36_money', 'y_money33'], m_41_body_echo: 'm_40_body', m_43_career_echo: ['m_42_office', 'm_42_stable', 'm_42_labor', 'm_42_own', 'm_42_none'],
    m_46_house_echo: ['m_44_buy', 'm_44_loan', 'm_44_own'], m_48_check_echo: 'm_45_checkup', m_49_ai_echo: 'm_47_ai', m_52_care_echo: 'm_51_parents',
    m_54_nest_echo: 'm_53_money', m_59_end_echo: 'm_58_work', m_61_plan_echo: 'm_60_plan', o_spcare_echo: 'o_sp_sick', o_scam_echo: 'o_scam',
    o_hobby_echo: ['o_hobby', 'o_learn_what'], o_fall_echo: 'o_fall', o_will_echo: 'o_will', o_care_echo: 'o_care_plan', o_trip_echo: 'o_last_place', o_lastwish_echo: 'o_last_wish',
  };
  Object.keys(ECHO).forEach((id) => { const n = byId(id); if (n && !n.echoOf) n.echoOf = ECHO[id]; });

  /* 哪些抉择顺其自然（engine.minor 钩子）：
   *   人生主干（major）总要问；意外带判定或会出人命的，离上一次亲自选的意外隔十二年以上才问；其余自动选。 */
  const big = (n) => (n.choices || []).some((c) => c.check || c.fatal);
  JY.GAME.engine.minor = (n, g) => {
    if (n.major) return false;
    if (!JY.ENCOUNTERS.includes(n) || !big(n)) return true;
    const L = JY.engine.get().L;
    const last = L.picks.filter((p) => p.enc && !p.auto).map((p) => p.age).pop();
    return last != null && g.age - last < 12;
  };
})();

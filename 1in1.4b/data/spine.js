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
    c_xiaoshengchu: { stake: '初中的好坏，三年后决定中考能考成什么样。', hints: { 1: '考上了，学识和中考都往上走一截' , 2: '一年学费好几万，家里要掏' } },
    c_zhongkao: { stake: '这一选，基本定下你走普高考大学，还是早点学手艺、早点挣钱。', hints: { 0: '高考最有底气', 2: '省钱，学校差一点', 3: '三年后就能工作', 6: '马上挣钱，学历停在初中' } },
    c_hs_track: { stake: '选科决定以后能报哪些专业。', hints: { 0: '理工科专业多、工资高', 1: '心情好，能报的专业少一些', 2: '家里满意，以后考公多一分把握' } },
    c_voc_major: { stake: '职高的专业，多半就是你以后十几年的饭碗。', hints: { 0: '工厂、汽修店，哪里都缺人', 1: '养老院和幼儿园一直招人', 2: '收入看运气，好的很好', 3: '新行当，机器人越多越吃香' } },
    c_first_job: { stake: '十六岁出去干活：工资、手艺和以后能走多远，从这里分开。', hints: { 0: '工资马上到手，活累', 1: '学徒钱少，学成了有手艺', 2: '跟着师傅学，出师慢、路子稳' } },
    c_hs_path: { stake: '最后一年怎么冲，直接影响高考分数。', hints: { 0: '稳扎稳打', 1: '花钱补课，分数往上提一截', 4: '学识够高才有戏，成了直接保送' } },
    c_voc_intern: { stake: '实习完是马上工作，还是再读三年大专。', hints: { 0: '早挣钱，学历停在中专', 1: '多读三年，起薪高一些' } },
    c_work_17: { stake: '打工一年了：继续攒钱，还是给自己找条上升的路。', hints: { 0: '攒下第一笔钱', 1: '晚上上课，以后能换个好点的活', 2: '大城市工资高，开销也高' } },
    y_zhiyuan: { stake: '去哪座城、学什么专业，决定了第一份工作在哪里、挣多少。', hints: { 0: '大城市机会多，房价也高', 1: '稳定，收入中等，以后不怕失业', 2: '离家近，工资低一点，照顾家里方便' } },
    y_zhuanke: { stake: '大专、复读，还是马上挣钱。', hints: { 0: '三年后好找工作', 1: '再赌一年本科', 2: '早挣钱，学历停在高中' } },
    y_luobang: { stake: '没考上，下一步怎么走。', hints: { 0: '再赌一年', 1: '马上有工资，活累', 2: '体检要过，退伍后好安排' } },
    y_offer: { stake: '第一份工作，几乎决定了你三十岁前在哪座城、挣多少、有多累。', hints: { 0: '学识够高才进得去；工资最高，加班最多', 1: '稳当，不容易被裁', 2: '要考，考上了一辈子安稳', 3: '人缘够才做得起来，收入看运气' } },
    y_ai24: { stake: 'AI 来了，你的活儿变少了。跟着变，还是换个机器干不了的行当。', hints: { 0: '学识够就能留下，收入不降', 1: '新行当，起步慢，前景好', 2: '工资不高，但机器替不了' } },
    y_love23: { stake: '这一步，关系到你什么时候成家、和谁成家。', hints: { 0: '人缘高更容易处成', 1: '心情好，但家里会一直催' } },
    y_love25: { stake: '一个人过，还是开始找。', hints: { 0: '靠熟人，靠谱', 1: '碰运气，心态好的人更容易遇到对的人', 2: '自在，晚年可能更孤单' } },
    y_dating25: { stake: '见家长，就是要往结婚走了。', hints: { 2: '再等等，可能等来更好的，也可能等散' } },
    y_marry: { stake: '结婚要花一大笔钱，也定下以后几十年和谁过日子。', hints: { 0: '彩礼加酒席，花销最大', 2: '省钱，长辈可能有意见', 3: '一个人重新开始' } },
    y_car26: { stake: '买不买车，买什么车：每年的花销和出门的方便。', hints: { 1: '电车：充电便宜，一年省几千块油钱', 2: '要背几年车贷', 3: '便宜，修车钱多' } },
    y_house: { stake: '这是一辈子最大的一笔账：首付、三十年房贷、住在哪里、孩子在哪上学。', hints: { 0: '住得最舒服，房贷最重', 1: '压力小一点，以后可能要换', 2: '便宜，离工作远', 3: '房价低，通勤要一个多小时', 4: '没有房贷，钱可以拿去理财，也一直交房租' } },
    y_house29: { stake: '这是一辈子最大的一笔账：首付、三十年房贷、住在哪里、孩子在哪上学。', hints: { 0: '住得最舒服，房贷最重', 1: '压力小一点，以后可能要换', 2: '便宜，离工作远', 3: '房价低，通勤要一个多小时', 4: '没有房贷，钱可以拿去理财，也一直交房租' } },
    y_back27: { stake: '留在大城市，还是回到父母身边。', hints: { 0: '收入高，离家远', 1: '收入少一截，家人在身边，房子便宜' } },
    y_startup: { stake: '一次可能改命、也可能赔光的机会。', hints: { 0: '事业够高成功率才高；成了收入翻几倍', 1: '工资照拿' } },
    y_biz32: { stake: '要不要自己干点什么。', hints: { 3: '工资照拿' } },
    y_kid: { stake: '要不要孩子、谁来带，决定你后面二十年的钱、时间和晚年身边有没有人。', hints: { 0: '花钱少，老人累', 1: '每月托育费几千块', 2: '家里少一份收入', 3: '再攒攒钱', 4: '钱宽裕，晚年要自己安排' } },
    y_kid2: { stake: '再要一个：开销翻倍，晚年多一份依靠。', hints: { 0: '钱和时间宽裕些', 1: '再花十几年的钱和精力' } },
    y_crisis31: { stake: '这次吵架，会变成以后婚姻的样子。', hints: { 0: '人缘和心情都好一点', 1: '冷下去，以后更难开口', 2: '分财产、分孩子，从头来过' } },
    y_last34: { stake: '三十五岁之前，最后一次换道。', hints: { 0: '学识够高才考得上；考上了就不怕裁员', 1: '不冒险', 2: '收入看运气，可能翻倍也可能赔' } },
    m_35_office: { stake: '三十五岁，公司要“优化”人了。', hints: { 0: '收入少三成，至少有班上' } },
    m_35_stable: { stake: '要不要往上走一步。', hints: { 0: '不冒险', 1: '人缘够就能上，收入涨一截' } },
    m_35_labor: { stake: '体力活总有干不动的那一天。', hints: { 0: '多挣几年，伤身体', 3: '换成自己的小生意' } },
    m_35_own: { stake: '生意要不要做大。', hints: { 0: '稳当', 1: '事业够高才敢借；成了收入翻倍，败了背债', 2: '收入少，心里踏实' } },
    m_35_none: { stake: '这些年没有正经工作，往后怎么办。', hints: { 0: '有一份稳定收入', 2: '学识够就能自己接活' } },
    m_38_marriage: { stake: '婚姻冷下去了。', hints: { 0: '凑合着过，心情慢慢变差', 1: '人缘够就能谈开', 2: '分开，一切重新算' } },
    m_42_office: { stake: '四十二岁，行当又变了。', hints: { 0: '收入不涨', 1: '学识够就能转过去，收入更高', 2: '工资少一半，日子松快' } },
    m_42_labor: { stake: '要不要换个活法。', hints: { 0: '稳当', 1: '出 ¥8 万，成了自己当老板', 2: '工资高，一年见一次家人' } },
    m_44_buy: { stake: '四十四岁，还租着房。现在买，还是一直租下去。', hints: { 0: '不背债，钱留着理财', 3: '有了自己的家，房贷背到退休以后' } },
    m_44_loan: { stake: '房贷怎么办：多还一点，还是换房。', hints: { 0: '钱留在手里', 1: '少付利息，手头紧一点' } },
    m_47_ai: { stake: '又一波 AI，又一次要不要跟上。', hints: { 0: '少拿一点，熬到退休', 1: '学识够就能保住饭碗', 2: '收入少一大截，人轻松' } },
    m_51_parents: { stake: '父母老了，怎么照顾，是钱、时间和良心之间的取舍。', hints: { 1: '每月几千块，人轻松，心里过不去', 2: '最累，父母最安心', 3: '花钱请人，自己喘口气' } },
    m_55_ill: { stake: '一场大病：治法决定你还能活多少年。', hints: { 0: '花钱最多，活下来的可能最大', 1: '花钱少，伤身体', 2: '不让孩子担心，自己扛' } },
    m_60_plan: { stake: '退休以后住哪儿，决定晚年身边有谁。', hints: { 1: '花钱修房子，老家清静', 2: '离孙辈近，帮着带孩子', 3: '换出一笔养老钱', 4: '冬天暖和，每年多花一笔' } },
    o_keep_working: { stake: '退休了，还干不干。', hints: { 0: '多一份收入，身体吃亏', 3: '身体轻松，钱紧一点' } },
    o_where: { stake: '晚年和孩子住，还是守着自己家。', hints: { 0: '有人照应，要看人脸色', 1: '自在，有事没人在身边' } },
    o_where_nokid: { stake: '没有孩子在身边，晚年怎么安排。', hints: { 2: '每月 ¥5,000，有人照应' } },
    o_care_plan: { stake: '往后谁照顾你。', hints: { 0: '一次掏一笔钱，机器人能扶、能提醒吃药', 1: '每月 ¥5,000，有护工', 2: '和孩子住，热闹也拥挤', 3: '不花钱，出事没人知道' } },
    o_will: { stake: '一辈子攒下的东西，留给谁。' },
    o_icu_talk: { stake: '这件事，总得有人替你先想好。' },
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

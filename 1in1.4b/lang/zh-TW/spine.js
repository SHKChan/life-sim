/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
    c_xiaoshengchu: { stake: '初中的好壞，三年後決定中考能考成什麼樣。', hints: { 1: '考上了，學識和中考都往上走一截' , 2: '一年學費好幾萬，家裡要掏' } },
    c_zhongkao: { stake: '這一選，基本定下你走普高考大學，還是早點學手藝、早點掙錢。', hints: { 0: '高考最有底氣', 2: '省錢，學校差一點', 3: '三年後就能工作', 6: '馬上掙錢，學歷停在初中' } },
    c_hs_track: { stake: '選科決定以後能報哪些專業。', hints: { 0: '理工科專業多、工資高', 1: '心情好，能報的專業少一些', 2: '家裡滿意，以後考公多一分把握' } },
    c_voc_major: { stake: '職高的專業，多半就是你以後十幾年的飯碗。', hints: { 0: '工廠、汽修店，哪裡都缺人', 1: '養老院和幼兒園一直招人', 2: '收入看運氣，好的很好', 3: '新行當，機器人越多越吃香' } },
    c_first_job: { stake: '十六歲出去幹活：工資、手藝和以後能走多遠，從這裡分開。', hints: { 0: '工資馬上到手，活累', 1: '學徒錢少，學成了有手藝', 2: '跟著師傅學，出師慢、路子穩' } },
    c_hs_path: { stake: '最後一年怎麼衝，直接影響高考分數。', hints: { 0: '穩紮穩打', 1: '花錢補課，分數往上提一截', 4: '學識夠高才有戲，成了直接保送' } },
    c_voc_intern: { stake: '實習完是馬上工作，還是再讀三年大專。', hints: { 0: '早掙錢，學歷停在中專', 1: '多讀三年，起薪高一些' } },
    c_work_17: { stake: '打工一年了：繼續攢錢，還是給自己找條上升的路。', hints: { 0: '攢下第一筆錢', 1: '晚上上課，以後能換個好點的活', 2: '大城市工資高，開銷也高' } },
    y_zhiyuan: { stake: '去哪座城、學什麼專業，決定了第一份工作在哪裡、掙多少。', hints: { 0: '大城市機會多，房價也高', 1: '穩定，收入中等，以後不怕失業', 2: '離家近，工資低一點，照顧家裡方便' } },
    y_zhuanke: { stake: '大專、復讀，還是馬上掙錢。', hints: { 0: '三年後好找工作', 1: '再賭一年本科', 2: '早掙錢，學歷停在高中' } },
    y_luobang: { stake: '沒考上，下一步怎麼走。', hints: { 0: '再賭一年', 1: '馬上有工資，活累', 2: '體檢要過，退伍後好安排' } },
    y_offer: { stake: '第一份工作，幾乎決定了你三十歲前在哪座城、掙多少、有多累。', hints: { 0: '學識夠高才進得去；工資最高，加班最多', 1: '穩當，不容易被裁', 2: '要考，考上了一輩子安穩', 3: '人緣夠才做得起來，收入看運氣' } },
    y_ai24: { stake: 'AI 來了，你的活兒變少了。跟著變，還是換個機器幹不了的行當。', hints: { 0: '學識夠就能留下，收入不降', 1: '新行當，起步慢，前景好', 2: '工資不高，但機器替不了' } },
    y_love23: { stake: '這一步，關係到你什麼時候成家、和誰成家。', hints: { 0: '人緣高更容易處成', 1: '心情好，但家裡會一直催' } },
    y_love25: { stake: '一個人過，還是開始找。', hints: { 0: '靠熟人，靠譜', 1: '碰運氣，心態好的人更容易遇到對的人', 2: '自在，晚年可能更孤單' } },
    y_dating25: { stake: '見家長，就是要往結婚走了。', hints: { 2: '再等等，可能等來更好的，也可能等散' } },
    y_marry: { stake: '結婚要花一大筆錢，也定下以後幾十年和誰過日子。', hints: { 0: '彩禮加酒席，花銷最大', 2: '省錢，長輩可能有意見', 3: '一個人重新開始' } },
    y_car26: { stake: '買不買車，買什麼車：每年的花銷和出門的方便。', hints: { 1: '電車：充電便宜，一年省幾千塊油錢', 2: '要背幾年車貸', 3: '便宜，修車錢多' } },
    y_house: { stake: '這是一輩子最大的一筆賬：首付、三十年房貸、住在哪裡、孩子在哪上學。', hints: { 0: '住得最舒服，房貸最重', 1: '壓力小一點，以後可能要換', 2: '便宜，離工作遠', 3: '房價低，通勤要一個多小時', 4: '沒有房貸，錢可以拿去理財，也一直交房租' } },
    y_house29: { stake: '這是一輩子最大的一筆賬：首付、三十年房貸、住在哪裡、孩子在哪上學。', hints: { 0: '住得最舒服，房貸最重', 1: '壓力小一點，以後可能要換', 2: '便宜，離工作遠', 3: '房價低，通勤要一個多小時', 4: '沒有房貸，錢可以拿去理財，也一直交房租' } },
    y_back27: { stake: '留在大城市，還是回到父母身邊。', hints: { 0: '收入高，離家遠', 1: '收入少一截，家人在身邊，房子便宜' } },
    y_startup: { stake: '一次可能改命、也可能賠光的機會。', hints: { 0: '事業夠高成功率才高；成了收入翻幾倍', 1: '工資照拿' } },
    y_biz32: { stake: '要不要自己乾點什麼。', hints: { 3: '工資照拿' } },
    y_kid: { stake: '要不要孩子、誰來帶，決定你後面二十年的錢、時間和晚年身邊有沒有人。', hints: { 0: '花錢少，老人累', 1: '每月托育費幾千塊', 2: '家裡少一份收入', 3: '再攢攢錢', 4: '錢寬裕，晚年要自己安排' } },
    y_kid2: { stake: '再要一個：開銷翻倍，晚年多一份依靠。', hints: { 0: '錢和時間寬裕些', 1: '再花十幾年的錢和精力' } },
    y_crisis31: { stake: '這次吵架，會變成以後婚姻的樣子。', hints: { 0: '人緣和心情都好一點', 1: '冷下去，以後更難開口', 2: '分財產、分孩子，從頭來過' } },
    y_last34: { stake: '三十五歲之前，最後一次換道。', hints: { 0: '學識夠高才考得上；考上了就不怕裁員', 1: '不冒險', 2: '收入看運氣，可能翻倍也可能賠' } },
    m_35_office: { stake: '三十五歲，公司要“最佳化”人了。', hints: { 0: '收入少三成，至少有班上' } },
    m_35_stable: { stake: '要不要往上走一步。', hints: { 0: '不冒險', 1: '人緣夠就能上，收入漲一截' } },
    m_35_labor: { stake: '體力活總有幹不動的那一天。', hints: { 0: '多掙幾年，傷身體', 3: '換成自己的小生意' } },
    m_35_own: { stake: '生意要不要做大。', hints: { 0: '穩當', 1: '事業夠高才敢借；成了收入翻倍，敗了揹債', 2: '收入少，心裡踏實' } },
    m_35_none: { stake: '這些年沒有正經工作，往後怎麼辦。', hints: { 0: '有一份穩定收入', 2: '學識夠就能自己接活' } },
    m_38_marriage: { stake: '婚姻冷下去了。', hints: { 0: '湊合著過，心情慢慢變差', 1: '人緣夠就能談開', 2: '分開，一切重新算' } },
    m_42_office: { stake: '四十二歲，行當又變了。', hints: { 0: '收入不漲', 1: '學識夠就能轉過去，收入更高', 2: '工資少一半，日子鬆快' } },
    m_42_labor: { stake: '要不要換個活法。', hints: { 0: '穩當', 1: '出 ¥8 萬，成了自己當老闆', 2: '工資高，一年見一次家人' } },
    m_44_buy: { stake: '四十四歲，還租著房。現在買，還是一直租下去。', hints: { 0: '不揹債，錢留著理財', 3: '有了自己的家，房貸背到退休以後' } },
    m_44_loan: { stake: '房貸怎麼辦：多還一點，還是換房。', hints: { 0: '錢留在手裡', 1: '少付利息，手頭緊一點' } },
    m_47_ai: { stake: '又一波 AI，又一次要不要跟上。', hints: { 0: '少拿一點，熬到退休', 1: '學識夠就能保住飯碗', 2: '收入少一大截，人輕鬆' } },
    m_51_parents: { stake: '父母老了，怎麼照顧，是錢、時間和良心之間的取捨。', hints: { 1: '每月幾千塊，人輕鬆，心裡過不去', 2: '最累，父母最安心', 3: '花錢請人，自己喘口氣' } },
    m_55_ill: { stake: '一場大病：治法決定你還能活多少年。', hints: { 0: '花錢最多，活下來的可能最大', 1: '花錢少，傷身體', 2: '不讓孩子擔心，自己扛' } },
    m_60_plan: { stake: '退休以後住哪兒，決定晚年身邊有誰。', hints: { 1: '花錢修房子，老家清靜', 2: '離孫輩近，幫著帶孩子', 3: '換出一筆養老錢', 4: '冬天暖和，每年多花一筆' } },
    o_keep_working: { stake: '退休了，還幹不幹。', hints: { 0: '多一份收入，身體吃虧', 3: '身體輕鬆，錢緊一點' } },
    o_where: { stake: '晚年和孩子住，還是守著自己家。', hints: { 0: '有人照應，要看人臉色', 1: '自在，有事沒人在身邊' } },
    o_where_nokid: { stake: '沒有孩子在身邊，晚年怎麼安排。', hints: { 2: '每月 ¥5,000，有人照應' } },
    o_care_plan: { stake: '往後誰照顧你。', hints: { 0: '一次掏一筆錢，機器人能扶、能提醒吃藥', 1: '每月 ¥5,000，有護工', 2: '和孩子住，熱鬧也擁擠', 3: '不花錢，出事沒人知道' } },
    o_will: { stake: '一輩子攢下的東西，留給誰。' },
    o_icu_talk: { stake: '這件事，總得有人替你先想好。' },
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

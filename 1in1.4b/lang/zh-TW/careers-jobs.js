/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 行业入口：复用原来的第一份工、转行、创业节点，不额外增加大抉择。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const defs = {
    restaurant: ['飯館經營者', 'own'], beauty: ['理髮美容師', 'own'], grocery: ['小超市經營者', 'own'], mechanic: ['汽修師傅', 'own'],
    electrician: ['電工', 'labor'], welder: ['焊工', 'labor'], cnc: ['數控技工', 'labor'], renovation: ['裝修師傅', 'labor'],
    parcel: ['快遞站經營者', 'own'], maternity: ['月嫂育兒嫂', 'service'], eldercare: ['養老護理員', 'service'], housekeeping: ['家政服務員', 'service'],
    cooperative: ['合作社經營者', 'own'], livestock: ['養殖戶', 'own'], grower: ['種植大戶', 'own'], construction: ['建築工人', 'labor'],
  };
  const pick = (g, own) => {
    const pool = Object.keys(defs).filter((k) => (CN.TRADE_JOBS || []).includes(k) && (!own || defs[k][1] === 'own') && (g.age >= 18 || ['restaurant', 'beauty', 'mechanic', 'electrician', 'welder', 'cnc', 'renovation', 'construction'].includes(k)) && (k !== 'maternity' || CN.sexOf(g) === '女') && (g.recall('hukou') === 'rural' || !['cooperative', 'livestock', 'grower'].includes(k)));
    return pool[(Math.abs(Number(g.recall('seed')) || 0) + (own ? 3 : 0)) % pool.length] || 'electrician';
  };
  const staff = { restaurant: '飯館廚師', beauty: '理髮師', grocery: '超市店員', mechanic: '汽修工', parcel: '快遞站店員', cooperative: '合作社技術員', livestock: '養殖技術員', grower: '種植技術員' };
  const title = (g, own) => own ? defs[pick(g, own)][0] : staff[pick(g, own)] || defs[pick(g, own)][0];
  const set = (g, own) => { const k = pick(g, own); CN.setJob(g, k, title(g, own) + (g.age < 18 ? '學徒' : '')); g.remember('tradeOwn', !!own); g.remember('lifePath', 'work'); };
  const byId = (id) => JY.LIFE_NODES.find((n) => n.id === id);
  const spend = (g, fee) => {
    if (!g.recall('money0')) { g.stat('财富', -1); return; }
    const have = Math.max(0, CN.cash(g)), loan = Math.max(0, fee - have);
    if (loan) g.remember('debt', (Number(g.recall('debt')) || 0) + loan / 10000);
    CN.pay(g, Math.min(have, fee));
  };
  const entry = (own, cost) => ({
    t: (g) => (own ? '自己做' : '培訓後做') + title(g, own), dev: 15,
    hint: (g) => '成功花 ' + CN.fmt(cost) + '，失敗花 ' + CN.fmt(Math.round(cost / 3)) + '；不夠要借。做成後' + CN.jobLine(g, pick(g, own)) + '。',
    check: [own ? '事业' : '学识', own ? 42 : 35],
    fx: (g) => { spend(g, cost); set(g, own); g.remember('tradeEntry', pick(g, own)); g.stat('事业', 2); },
    res: (g) => '你從' + title(g, own) + '做起。第一筆賬記在新本子上，收入要靠每天的活慢慢攢。',
    fail: { fx: (g) => { spend(g, Math.round(cost / 3)); if (g.age >= 18 && !g.recall('job')) { CN.setJob(g, 'freelance', '打零工'); g.remember('lifePath', 'work'); } g.remember('tradeEntry', 'failed'); g.stat('心情', -2); }, res: '試了一陣，發現條件還沒備齊。你付了試學和材料的錢，先回到原來的路上。' },
  });
  const first = byId('c_first_job');
  if (first) first.choices.push(entry(false, 2000));
  const offer = byId('y_offer');
  if (offer) {
    const media = offer.choices.pop(), oldCond = media.cond;
    const forMedia = (g) => ['mic', 'brush'].includes(g.recall('gift'));
    media.cond = (g) => forMedia(g) && (!oldCond || oldCond(g));
    const trade = entry(false, 5000); trade.cond = (g) => !forMedia(g);
    offer.choices.push(media, trade);
  }
  const worker = byId('y_worker22');
  if (worker) { const trade = entry(false, 5000); worker.choices[3] = trade; }
  const startup = byId('y_startup');
  if (startup) startup.choices.push(entry(true, 30000));
  const own42 = byId('m_42_own');
  if (own42) own42.choices.push(entry(true, 30000));
  const ai = byId('y_ai24');
  if (ai) {
    // 同一转折最多一个 AI 出口：保留跟着学，另一个出口交给手艺。
    ai.choices[1] = entry(false, 5000);
    const care = ai.choices[2];
    care.t = (g) => '轉做養老護理（培訓 ¥3,000，' + CN.jobLine(g, 'eldercare') + '）';
    care.fx = (g) => { CN.pay(g, 3000); CN.setJob(g, 'eldercare', '養老護理員'); g.remember('aiMove', 'care'); };
    care.res = '你學會了翻身、移位和照護記錄。活累，人會認真叫你的名字。';
  }
  const office42 = byId('m_42_office');
  if (office42) {
    office42.text = '老客戶的訂單變少了，新合同又要求人手駐點。你做了二十年這一行，想過把經驗帶到別的地方去。';
    const trade = entry(false, 8000), fx = trade.fx;
    trade.fx = (g) => { fx(g); g.remember('career42', 'pivot'); };
    office42.choices[1] = trade;
  }
  const echo43 = byId('m_43_career_echo');
  if (echo43) {
    const text = echo43.text;
    echo43.text = (g) => g.recall('career42') === 'pivot' ? '換了行當，你把舊本事一點點挪過來。第一個老客戶願意介紹朋友，你在本子上記下了交付的日期。' : g.recall('career42') === 'mid' ? '合同、交付和帶新人都要你過目。你把每週的進度寫清楚，開會終於能早一點散。' : JY.val(text);
  }
  // 新行当由专属30/40/50岁节点承接，避免又被通用桶赶回办公室。
  JY.LIFE_NODES.filter((n) => /^m_(35|42)_/.test(n.id) && !n.auto).forEach((n) => {
    const cond = n.cond;
    n.cond = (g) => !defs[g.recall('job')] && (!cond || cond(g));
  });
  JY.addLifeNodes([
    { id: 'i_entry_late_echo', age: 46, t: '中年換行以後', auto: true, echoOf: ['m_42_office', 'm_42_own'],
      cond: (g) => !!g.recall('tradeEntry') && g.since('tradeEntry') >= 1 && g.since('tradeEntry') <= 6,
      text: (g) => g.recall('tradeEntry') === 'failed' ? '中年換行的試學沒走下去。你把試過的材料留下來，知道有些錢該慢慢花。' : '中年新入的這一行，終於有人介紹回頭客來。你沒有急著擴張，先把這一次的活做完。',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
    { id: 'i_entry_echo', age: 34, t: '從入行到熟手', auto: true, echoOf: ['c_first_job', 'y_offer', 'y_worker22', 'y_startup'],
      cond: (g) => !!g.recall('tradeEntry'),
      text: (g) => g.recall('tradeEntry') === 'failed' ? '當年試過的那條路沒走成，試學的本子還留著。後來遇到要入行的人，你知道該先問清哪些事。' : '入行時最怕報錯價，如今你能把材料、工時和交付都講明白。有老客開始直接找你。',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
  ]);
})();

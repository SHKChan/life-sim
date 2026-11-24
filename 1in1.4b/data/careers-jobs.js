/* 行业入口：复用原来的第一份工、转行、创业节点，不额外增加大抉择。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const defs = {
    restaurant: ['饭馆经营者', 'own'], beauty: ['理发美容师', 'own'], grocery: ['小超市经营者', 'own'], mechanic: ['汽修师傅', 'own'],
    electrician: ['电工', 'labor'], welder: ['焊工', 'labor'], cnc: ['数控技工', 'labor'], renovation: ['装修师傅', 'labor'],
    parcel: ['快递站经营者', 'own'], maternity: ['月嫂育儿嫂', 'service'], eldercare: ['养老护理员', 'service'], housekeeping: ['家政服务员', 'service'],
    cooperative: ['合作社经营者', 'own'], livestock: ['养殖户', 'own'], grower: ['种植大户', 'own'], construction: ['建筑工人', 'labor'],
  };
  const pick = (g, own) => {
    const pool = Object.keys(defs).filter((k) => (CN.TRADE_JOBS || []).includes(k) && (!own || defs[k][1] === 'own') && (g.age >= 18 || ['restaurant', 'beauty', 'mechanic', 'electrician', 'welder', 'cnc', 'renovation', 'construction'].includes(k)) && (k !== 'maternity' || CN.sexOf(g) === '女') && (g.recall('hukou') === 'rural' || !['cooperative', 'livestock', 'grower'].includes(k)));
    return pool[(Math.abs(Number(g.recall('seed')) || 0) + (own ? 3 : 0)) % pool.length] || 'electrician';
  };
  const staff = { restaurant: '饭馆厨师', beauty: '理发师', grocery: '超市店员', mechanic: '汽修工', parcel: '快递站店员', cooperative: '合作社技术员', livestock: '养殖技术员', grower: '种植技术员' };
  const title = (g, own) => own ? defs[pick(g, own)][0] : staff[pick(g, own)] || defs[pick(g, own)][0];
  const set = (g, own) => {
    const sd = Math.abs(Number(g.recall('seed')) || 0);
    if (!own && g.age >= 18 && sd % 5 < 2 && !['restaurant', 'beauty', 'grocery', 'mechanic', 'parcel'].includes(g.recall('job'))) {
      const dr = sd % 2 === 0;
      CN.setJob(g, dr ? 'driver' : 'rider', dr ? '货车司机' : '外卖骑手'); g.remember('tradeOwn', false); g.remember('lifePath', 'work'); return;
    }
    const k = pick(g, own); CN.setJob(g, k, title(g, own) + (g.age < 18 ? '学徒' : '')); g.remember('tradeOwn', !!own); g.remember('lifePath', 'work'); };
  const byId = (id) => JY.LIFE_NODES.find((n) => n.id === id);
  const spend = (g, fee) => {
    if (!g.recall('money0')) { g.stat('财富', -1); return; }
    const have = Math.max(0, CN.cash(g)), loan = Math.max(0, fee - have);
    if (loan) g.remember('debt', (Number(g.recall('debt')) || 0) + loan / 10000);
    CN.pay(g, Math.min(have, fee));
  };
  const entry = (own, cost) => ({
    t: (g) => (own ? '自己做' : '培训后做') + title(g, own), dev: 15,
    hint: (g) => '成功花 ' + CN.fmt(cost) + '，失败花 ' + CN.fmt(Math.round(cost / 3)) + '；不够要借。做成后' + CN.jobLine(g, pick(g, own)) + '。',
    check: [own ? '事业' : '学识', own ? 42 : 35],
    fx: (g) => { spend(g, cost); set(g, own); g.remember('tradeEntry', pick(g, own)); g.stat('事业', 2); },
    res: (g) => '你从' + title(g, own) + '做起。第一笔账记在新本子上，收入要靠每天的活慢慢攒。',
    fail: { fx: (g) => { spend(g, Math.round(cost / 3)); if (g.age >= 18 && !g.recall('job')) { CN.setJob(g, 'freelance', '打零工'); g.remember('lifePath', 'work'); } g.remember('tradeEntry', 'failed'); g.stat('心情', -2); }, res: '试了一阵，发现条件还没备齐。你付了试学和材料的钱，先回到原来的路上。' },
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
    care.t = (g) => '转做养老护理（培训 ¥3,000，' + CN.jobLine(g, 'eldercare') + '）';
    care.fx = (g) => { CN.pay(g, 3000); CN.setJob(g, 'eldercare', '养老护理员'); g.remember('aiMove', 'care'); };
    care.res = '你学会了翻身、移位和照护记录。活累，人会认真叫你的名字。';
  }
  const office42 = byId('m_42_office');
  if (office42) {
    office42.text = '老客户的订单变少了，新合同又要求人手驻点。你做了二十年这一行，想过把经验带到别的地方去。';
    const trade = entry(false, 8000), fx = trade.fx;
    trade.fx = (g) => { fx(g); g.remember('career42', 'pivot'); };
    office42.choices[1] = trade;
  }
  const echo43 = byId('m_43_career_echo');
  if (echo43) {
    const text = echo43.text;
    echo43.text = (g) => g.recall('career42') === 'pivot' ? '换了行当，你把旧本事一点点挪过来。第一个老客户愿意介绍朋友，你在本子上记下了交付的日期。' : g.recall('career42') === 'mid' ? '合同、交付和带新人都要你过目。你把每周的进度写清楚，开会终于能早一点散。' : JY.val(text);
  }
  // 新行当由专属30/40/50岁节点承接，避免又被通用桶赶回办公室。
  JY.LIFE_NODES.filter((n) => /^m_(35|42)_/.test(n.id) && !n.auto).forEach((n) => {
    const cond = n.cond;
    n.cond = (g) => !defs[g.recall('job')] && (!cond || cond(g));
  });
  JY.addLifeNodes([
    { id: 'i_entry_late_echo', age: 46, t: '中年换行以后', auto: true, echoOf: ['m_42_office', 'm_42_own'],
      cond: (g) => !!g.recall('tradeEntry') && g.since('tradeEntry') >= 1 && g.since('tradeEntry') <= 6,
      text: (g) => g.recall('tradeEntry') === 'failed' ? '中年换行的试学没走下去。你把试过的材料留下来，知道有些钱该慢慢花。' : '中年新入的这一行，终于有人介绍回头客来。你没有急着扩张，先把这一次的活做完。',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
    { id: 'i_entry_echo', age: 34, t: '从入行到熟手', auto: true, echoOf: ['c_first_job', 'y_offer', 'y_worker22', 'y_startup'],
      cond: (g) => !!g.recall('tradeEntry'),
      text: (g) => g.recall('tradeEntry') === 'failed' ? '当年试过的那条路没走成，试学的本子还留着。后来遇到要入行的人，你知道该先问清哪些事。' : '入行时最怕报错价，如今你能把材料、工时和交付都讲明白。有老客开始直接找你。',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
  ]);
})();

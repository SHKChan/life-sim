/* 由 share/tools/tr.js 从 data/careers-jobs.js 和 lang/en/tr/careers-jobs.json 生成，不要手改。 */
/* 行业入口：复用原来的第一份工、转行、创业节点，不额外增加大抉择。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const defs = {
    restaurant: ['Restaurant owner', 'own'], beauty: ['Hairdresser and beautician', 'own'], grocery: ['Convenience store owner', 'own'], mechanic: ['Auto repair mechanic', 'own'],
    electrician: ['Electrician', 'labor'], welder: ['Welder', 'labor'], cnc: ['CNC machinist', 'labor'], renovation: ['Renovation contractor', 'labor'],
    parcel: ['Parcel station owner', 'own'], maternity: ['Postnatal and child caregiver', 'service'], eldercare: ['Elder care aide', 'service'], housekeeping: ['Housekeeper', 'service'],
    cooperative: ['Co-op manager', 'own'], livestock: ['Livestock farmer', 'own'], grower: ['Large-scale grower', 'own'], construction: ['Construction worker', 'labor'],
  };
  const pick = (g, own) => {
    const pool = Object.keys(defs).filter((k) => (CN.TRADE_JOBS || []).includes(k) && (!own || defs[k][1] === 'own') && (g.age >= 18 || ['restaurant', 'beauty', 'mechanic', 'electrician', 'welder', 'cnc', 'renovation', 'construction'].includes(k)) && (k !== 'maternity' || CN.sexOf(g) === '女') && (g.recall('hukou') === 'rural' || !['cooperative', 'livestock', 'grower'].includes(k)));
    return pool[(Math.abs(Number(g.recall('seed')) || 0) + (own ? 3 : 0)) % pool.length] || 'electrician';
  };
  const staff = { restaurant: 'Restaurant cook', beauty: 'Barber', grocery: 'Store clerk', mechanic: 'Auto repair hand', parcel: 'Parcel station clerk', cooperative: 'Co-op technician', livestock: 'Livestock technician', grower: 'Growing technician' };
  const title = (g, own) => own ? defs[pick(g, own)][0] : staff[pick(g, own)] || defs[pick(g, own)][0];
  const set = (g, own) => { const k = pick(g, own); CN.setJob(g, k, title(g, own) + (g.age < 18 ? 'apprentice' : '')); g.remember('tradeOwn', !!own); g.remember('lifePath', 'work'); };
  const byId = (id) => JY.LIFE_NODES.find((n) => n.id === id);
  const spend = (g, fee) => {
    if (!g.recall('money0')) { g.stat('财富', -1); return; }
    const have = Math.max(0, CN.cash(g)), loan = Math.max(0, fee - have);
    if (loan) g.remember('debt', (Number(g.recall('debt')) || 0) + loan / 10000);
    CN.pay(g, Math.min(have, fee));
  };
  const entry = (own, cost) => ({
    t: (g) => (own ? 'on your own' : 'after training') + title(g, own), dev: 15,
    hint: (g) => 'If it works, it costs ' + CN.fmt(cost) + '; if not, ' + CN.fmt(Math.round(cost / 3)) + '; you borrow what you lack. Once it works, ' + CN.jobLine(g, pick(g, own)) + '.',
    check: [own ? '事业' : '学识', own ? 42 : 35],
    fx: (g) => { spend(g, cost); set(g, own); g.remember('tradeEntry', pick(g, own)); g.stat('事业', 2); },
    res: (g) => 'You start as ' + title(g, own) + '. The first entry goes into a new ledger, and income builds up slowly, job by job.',
    fail: { fx: (g) => { spend(g, Math.round(cost / 3)); if (g.age >= 18 && !g.recall('job')) { CN.setJob(g, 'freelance', 'odd jobs'); g.remember('lifePath', 'work'); } g.remember('tradeEntry', 'failed'); g.stat('心情', -2); }, res: 'After a trial run, you find you\'re not ready. You pay for the trial lessons and materials, then go back to your old path.' },
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
    care.t = (g) => 'Switching to elder care (training ¥3,000, ' + CN.jobLine(g, 'eldercare') + ')';
    care.fx = (g) => { CN.pay(g, 3000); CN.setJob(g, 'eldercare', 'Elder care aide'); g.remember('aiMove', 'care'); };
    care.res = 'You learn to turn and move patients and keep care records. The work is tiring, but people call your name with real warmth.';
  }
  const office42 = byId('m_42_office');
  if (office42) {
    office42.text = 'Old clients are ordering less, and new contracts want people on site. After twenty years in this trade, you\'ve thought about taking your experience elsewhere.';
    const trade = entry(false, 8000), fx = trade.fx;
    trade.fx = (g) => { fx(g); g.remember('career42', 'pivot'); };
    office42.choices[1] = trade;
  }
  const echo43 = byId('m_43_career_echo');
  if (echo43) {
    const text = echo43.text;
    echo43.text = (g) => g.recall('career42') === 'pivot' ? 'You change trades and carry your old skills over bit by bit. Your first old client offers to introduce friends, and you note the delivery date in your book.' : g.recall('career42') === 'mid' ? 'Contracts, deliveries and training newcomers all cross your desk. You write out the weekly progress clearly, and meetings finally end a little earlier.' : JY.val(text);
  }
  // 新行当由专属30/40/50岁节点承接，避免又被通用桶赶回办公室。
  JY.LIFE_NODES.filter((n) => /^m_(35|42)_/.test(n.id) && !n.auto).forEach((n) => {
    const cond = n.cond;
    n.cond = (g) => !defs[g.recall('job')] && (!cond || cond(g));
  });
  JY.addLifeNodes([
    { id: 'i_entry_late_echo', age: 46, t: 'After the mid-life switch', auto: true, echoOf: ['m_42_office', 'm_42_own'],
      cond: (g) => !!g.recall('tradeEntry') && g.since('tradeEntry') >= 1 && g.since('tradeEntry') <= 6,
      text: (g) => g.recall('tradeEntry') === 'failed' ? 'Your mid-life trial lessons didn\'t lead anywhere. You keep the materials you tried, and learn that some money should be spent slowly.' : 'In this trade you entered in mid-life, someone finally sends a repeat customer your way. You don\'t rush to expand; you finish this job first.',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
    { id: 'i_entry_echo', age: 34, t: 'From newcomer to old hand', auto: true, echoOf: ['c_first_job', 'y_offer', 'y_worker22', 'y_startup'],
      cond: (g) => !!g.recall('tradeEntry'),
      text: (g) => g.recall('tradeEntry') === 'failed' ? 'The path you tried back then didn\'t work out, but your trial notebook is still around. When you meet someone entering the trade, you know what to ask first.' : 'When you started, you feared quoting the wrong price. Now you can lay out materials, hours and delivery clearly, and old customers start asking for you directly.',
      fx: (g) => { if (g.recall('tradeEntry') !== 'failed') g.stat('事业', 2); } },
  ]);
})();

/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 一个念头只带入紧接着的普通人生，用过或命终即止。 */
(function () {
  'use strict';
  const JY = window.JY, GAME = JY.GAME, CN = JY.CN;
  const KEY = '1in1.4b.album.v1';
  const ECHOES = {
    craft: { t: '早點學門手藝', d: '遇到合適的求職或轉行機會，多一條付費學徒路。' },
    home: { t: '別總說下次再陪你', d: '一次家庭矛盾中，可以放下工作，認真修補關係。' },
    self: { t: '這回想替自己活一次', d: '一次轉行或單幹判定，成功率加8個百分點，最高95%。' },
  };
  const known = (k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(ECHOES, k);
  const saveAlbum = (al) => { try { localStorage.setItem(KEY, JSON.stringify(al)); return true; } catch (e) { return false; } };
  const sourceOf = (life) => life.id + ':' + life.born + ':' + life.to;
  const active = (g, k) => known(k) && g.recall('echoCarry') === k && !g.recall('echoUsed') && !g.recall('seedFrom');
  const consume = (g) => {
    const k = g.recall('echoCarry');
    if (!active(g, k) || !ECHOES[k]) return;
    g.remember('echoUsed', true);
    g.info('前世殘響', ECHOES[k].t + '（已用）');
    g.log('前世留下的那句話，這一次你照著做了：' + ECHOES[k].t + '。', 'auto');
  };
  const generate = JY.GENERATE;
  JY.GENERATE = () => {
    const result = generate(), al = JY.album(), k = al.pendingEcho;
    // 同命挑战也消耗这一次带入资格，不能顺延到更后面的普通人生。
    delete al.pendingEcho;
    delete al.echoSource;
    delete al.echoOffers;
    if (saveAlbum(al) && known(k) && !result.me.mem.seedFrom) {
      result.me.mem.echoCarry = k;
      result.me.info = Object.assign({}, result.me.info, { '前世殘響': ECHOES[k].t + '（待用）' });
    }
    return result;
  };

  const bonusChecks = new WeakSet();
  const oddsMod = GAME.engine.oddsMod;
  GAME.engine.oddsMod = (g, chk) => (oddsMod ? Number(oddsMod(g, chk)) || 0 : 0)
    + (bonusChecks.has(chk) && active(g, 'self') ? 8 : 0);
  const add = (id, k, choice) => {
    const node = JY.LIFE_NODES.find((n) => n.id === id);
    if (!node || !node.choices) return;
    const cond = choice.cond;
    choice.cond = (g) => active(g, k) && (!cond || cond(g))
      && node.choices.filter((c) => c !== choice && (!c.cond || c.cond(g))).length < 4;
    choice.echo = k;
    node.choices.push(choice);
  };
  ['y_worker22', 'y_last34', 'm_42_labor', 'm_42_none'].forEach((id) => add(id, 'craft', {
    t: '殘響：從電工學徒做起', dev: 15,
    hint: '花 ¥3,000，事業 −3；轉做電工學徒。只用一次，不借債。',
    cond: (g) => g.age >= 18 && !!g.recall('money0') && CN.cash(g) >= 3000 && !g.recall('skill'),
    fx: (g) => { CN.pay(g, 3000); g.remember('skill', 'elec'); CN.setJob(g, 'electrician', '電工學徒'); g.remember('lifePath', 'work'); g.stat('事业', -3); JY.ECHO.consume(g); },
    res: '你交了學費，從認線、收工具開始。師傅沒誇你聰明，只說肯慢慢學，就能留下來。',
  }));
  ['y_crisis31', 'm_38_marriage'].forEach((id) => add(id, 'home', {
    t: '殘響：請一天假，把話說完', dev: 10,
    hint: '事業 −2；修補關係、心情 +4。只用一次。',
    cond: (g) => g.recall('love') === 'married' && g.alive('sp'),
    fx: (g) => { g.stat('事业', -2); g.stat('心情', 4); g.remember('fight', 'talk'); g.remember('marriage', 'mended'); JY.ECHO.consume(g); },
    res: '你關掉工作訊息，聽對方把話說完。晚飯沒做什麼特別的菜，兩個人卻坐了很久。',
  }));
  const selfNodes = JY.TURNING.ROUTES.map((r) => ['t_rewrite_' + r.k, 1]).concat([['y_last34', 2], ['m_42_office', 1]]);
  selfNodes.forEach(([id, index]) => {
    const node = JY.LIFE_NODES.find((n) => n.id === id), base = node && node.choices[index];
    if (!base || !base.check) return;
    const title = base.t, hint = base.hint, fx = base.fx, fail = base.fail;
    bonusChecks.add(base.check);
    // 直接标明原选项的帮助，避免复制一条同样费用与风险的长选项。
    base.echo = 'self';
    base.t = (g) => (active(g, 'self') ? '殘響：' : '') + (typeof title === 'function' ? title(g) : title);
    base.hint = (g) => (typeof hint === 'function' ? hint(g) : hint || '')
      + (active(g, 'self') ? ' 殘響 +8 個百分點，最高95%；成敗均用掉。' : '');
    base.fx = (g) => { if (active(g, 'self')) JY.ECHO.consume(g); if (fx) fx(g); };
    base.fail = Object.assign({}, fail, { fx: (g) => { if (active(g, 'self')) JY.ECHO.consume(g); if (fail && fail.fx) fail.fx(g); } });
  });
  GAME.stateCalls.push('JY.ECHO.consume');

  const onFinish = GAME.engine.onFinish;
  GAME.engine.onFinish = (g, life) => {
    onFinish(g, life);
    const al = JY.album(), s = life.snap || {};
    life.echoOffers = ['craft', 'self'];
    if (s.kids || ['married', 'divorced', 'widowed'].includes(s.love) || s.age >= 60) life.echoOffers.splice(1, 0, 'home');
    al.echoSource = sourceOf(life);
    al.echoOffers = life.echoOffers.slice();
    delete al.pendingEcho;
    if (known(g.recall('echoCarry'))) life.echo = { k: g.recall('echoCarry'), used: !!g.recall('echoUsed') };
    saveAlbum(al);
  };
  const select = (source, k) => {
    const al = JY.album();
    if (source !== al.echoSource || !Array.isArray(al.echoOffers) || (k && (!known(k) || !al.echoOffers.includes(k)))) return false;
    if (k) al.pendingEcho = k; else delete al.pendingEcho;
    return saveAlbum(al);
  };
  const echoCard = (life, u) => {
    const al = JY.album(), source = sourceOf(life), offers = life.echoOffers || [];
    if (!offers.length || al.echoSource !== source) return '';
    const options = offers.filter(known).map((k) => '<label class="echo-option"><input type="radio" name="next-echo" value="' + k + '" data-echo-source="' + u.esc(source) + '"' + (al.pendingEcho === k ? ' checked' : '') + '><span><b>' + u.esc(ECHOES[k].t) + '</b><small>' + u.esc(ECHOES[k].d) + '</small></span></label>').join('');
    const body = '<fieldset class="echo-options"><legend class="echo-legend">前世殘響</legend>' + options + '</fieldset><p class="note" data-echo-status>' + (al.pendingEcho ? '已選好，只帶入緊接著的下一世；同命挑戰不帶入。' : '可選可不選；下一世最多生效一次，不疊加。同命挑戰不帶入。') + '</p><button class="b" type="button" data-echo-clear="' + u.esc(source) + '">不帶入下一世</button>';
    return '<details class="card end-echo"><summary>給下一世帶個念頭<span class="note">' + (al.pendingEcho ? '已選擇' : '可選') + '</span></summary>' + body + '</details>';
  };
  const endCards = GAME.endCards, homeCards = GAME.homeCards;
  GAME.endPreparation = echoCard;
  GAME.endCards = (life, u) => endCards(life, u) + (GAME.endLayout ? '' : echoCard(life, u));
  GAME.homeCards = (world, u) => {
    const lives = world && world.lives || [];
    return (lives.length ? echoCard(lives[lives.length - 1], u) : '') + homeCards(world, u);
  };
  if (typeof document !== 'undefined') {
    const update = (source, k) => {
      const ok = select(source, k), status = document.querySelector('[data-echo-status]');
      if (status) status.textContent = ok ? (k ? '已選好，只帶入緊接著的下一世；同命挑戰不帶入。' : '這一世不留下殘響。') : '沒有儲存成功，請重試。';
      if (ok && !k) document.querySelectorAll('[data-echo-source]').forEach((el) => { el.checked = false; });
      const summary = document.querySelector('.end-echo > summary .note');
      if (ok && summary) summary.textContent = k ? '已選擇' : '可選';
    };
    document.addEventListener('change', (e) => { if (e.target.dataset.echoSource) update(e.target.dataset.echoSource, e.target.value); });
    document.addEventListener('click', (e) => { const el = e.target.closest('[data-echo-clear]'); if (el) update(el.dataset.echoClear, ''); });
  }
  JY.ECHO = { ECHOES, active, consume, select, sourceOf };
})();

/* 一个念头只带入紧接着的普通人生，用过或命终即止。 */
(function () {
  'use strict';
  const JY = window.JY, GAME = JY.GAME, CN = JY.CN;
  const KEY = '1in1.4b.album.v1';
  const ECHOES = {
    craft: { t: '早点学门手艺', d: '遇到合适的求职或转行机会，多一条付费学徒路。' },
    home: { t: '别总说下次再陪你', d: '一次家庭矛盾中，可以放下工作，认真修补关系。' },
    self: { t: '这回想替自己活一次', d: '一次转行或单干判定，成功率加8个百分点，最高95%。' },
  };
  const known = (k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(ECHOES, k);
  const saveAlbum = (al) => { try { localStorage.setItem(KEY, JSON.stringify(al)); return true; } catch (e) { return false; } };
  const sourceOf = (life) => life.id + ':' + life.born + ':' + life.to;
  const active = (g, k) => known(k) && g.recall('echoCarry') === k && !g.recall('echoUsed') && !g.recall('seedFrom');
  const consume = (g, id) => {
    const k = g.recall('echoCarry');
    if (!active(g, k) || !ECHOES[k]) return;
    g.remember('echoUsed', true);
    if (typeof id === 'string') g.remember('echoUse', { id, age: g.age, k });
    g.info('前世残响', ECHOES[k].t + '（已用）');
    g.log('前世留下的那句话，这一次你照着做了：' + ECHOES[k].t + '。', 'auto');
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
      result.me.info = Object.assign({}, result.me.info, { '前世残响': ECHOES[k].t + '（待用）' });
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
    t: '残响：从电工学徒做起', dev: 15,
    hint: '花 ¥3,000，事业 −3；转做电工学徒。只用一次，不借债。',
    cond: (g) => g.age >= 18 && !!g.recall('money0') && CN.cash(g) >= 3000 && !g.recall('skill'),
    fx: (g) => { CN.pay(g, 3000); g.remember('skill', 'elec'); CN.setJob(g, 'electrician', '电工学徒'); g.remember('lifePath', 'work'); g.stat('事业', -3); JY.ECHO.consume(g, id); },
    res: '你交了学费，从认线、收工具开始。师傅没夸你聪明，只说肯慢慢学，就能留下来。',
  }));
  ['y_crisis31', 'm_38_marriage'].forEach((id) => add(id, 'home', {
    t: '残响：请一天假，把话说完', dev: 10,
    hint: '事业 −2；修补关系、心情 +4。只用一次。',
    cond: (g) => g.recall('love') === 'married' && g.alive('sp'),
    fx: (g) => { g.stat('事业', -2); g.stat('心情', 4); g.remember('fight', 'talk'); g.remember('marriage', 'mended'); JY.ECHO.consume(g, id); },
    res: '你关掉工作消息，听对方把话说完。晚饭没做什么特别的菜，两个人却坐了很久。',
  }));
  const selfNodes = JY.TURNING.ROUTES.map((r) => ['t_rewrite_' + r.k, 1]).concat([['y_last34', 2], ['m_42_office', 1]]);
  selfNodes.forEach(([id, index]) => {
    const node = JY.LIFE_NODES.find((n) => n.id === id), base = node && node.choices[index];
    if (!base || !base.check) return;
    const title = base.t, hint = base.hint, fx = base.fx, fail = base.fail;
    bonusChecks.add(base.check);
    // 直接标明原选项的帮助，避免复制一条同样费用与风险的长选项。
    base.echo = 'self';
    base.t = (g) => (active(g, 'self') ? '残响：' : '') + (typeof title === 'function' ? title(g) : title);
    base.hint = (g) => (typeof hint === 'function' ? hint(g) : hint || '')
      + (active(g, 'self') ? ' 残响 +8 个百分点，最高95%；成败均用掉。' : '');
    base.fx = (g) => { if (active(g, 'self')) JY.ECHO.consume(g, id); if (fx) fx(g); };
    base.fail = Object.assign({}, fail, { fx: (g) => { if (active(g, 'self')) JY.ECHO.consume(g, id); if (fail && fail.fx) fail.fx(g); } });
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
    const use = g.recall('echoUse'), pick = use && (life.picks || []).find((p) => p.id === use.id && p.age === use.age);
    if (life.echo && pick) life.echo.at = { id: pick.id, age: pick.age, choice: pick.c };
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
    const body = '<fieldset class="echo-options"><legend class="echo-legend">前世残响</legend>' + options + '</fieldset><p class="note" data-echo-status>' + (al.pendingEcho ? '已选好，只带入紧接着的下一世；同命挑战不带入。' : '可选可不选；下一世最多生效一次，不叠加。同命挑战不带入。') + '</p><button class="b" type="button" data-echo-clear="' + u.esc(source) + '">不带入下一世</button>';
    return '<details class="card end-echo"><summary>给下一世带个念头<span class="note">' + (al.pendingEcho ? '已选择' : '可选') + '</span></summary>' + body + '</details>';
  };
  const endCards = GAME.endCards, homeCards = GAME.homeCards;
  GAME.endPreparation = echoCard;
  GAME.endCards = (life, u) => endCards(life, u)
    + (life.echo ? '<p class="note echo-review">' + u.esc(life.echo.at ? '前世那句话，在 ' + life.echo.at.age + ' 岁的“' + life.echo.at.choice + '”里用上了。' : life.echo.used ? '前世那句话，这一世用过一次。' : '前世那句话，这一世没有用上；它留在这页，不再顺延。') + '</p>' : '')
    + (GAME.endLayout ? '' : echoCard(life, u));
  GAME.homeCards = (world, u) => {
    const lives = world && world.lives || [];
    return (lives.length ? echoCard(lives[lives.length - 1], u) : '') + homeCards(world, u);
  };
  if (typeof document !== 'undefined') {
    const update = (source, k) => {
      const ok = select(source, k), status = document.querySelector('[data-echo-status]');
      if (status) status.textContent = ok ? (k ? '已选好，只带入紧接着的下一世；同命挑战不带入。' : '这一世不留下残响。') : '没有保存成功，请重试。';
      if (ok && !k) document.querySelectorAll('[data-echo-source]').forEach((el) => { el.checked = false; });
      const summary = document.querySelector('.end-echo > summary .note');
      if (ok && summary) summary.textContent = k ? '已选择' : '可选';
    };
    document.addEventListener('change', (e) => { if (e.target.dataset.echoSource) update(e.target.dataset.echoSource, e.target.value); });
    document.addEventListener('click', (e) => { const el = e.target.closest('[data-echo-clear]'); if (el) update(el.dataset.echoClear, ''); });
  }
  JY.ECHO = { ECHOES, active, consume, select, sourceOf };
})();

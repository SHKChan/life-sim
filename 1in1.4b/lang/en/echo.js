/* 由 share/tools/tr.js 从 data/echo.js 和 lang/en/tr/echo.json 生成，不要手改。 */
/* 一个念头只带入紧接着的普通人生，用过或命终即止。 */
(function () {
  'use strict';
  const JY = window.JY, GAME = JY.GAME, CN = JY.CN;
  const KEY = '1in1.4b.album.v1';
  const ECHOES = {
    craft: { t: 'Learn a trade early', d: 'When a suitable job or career-change opportunity comes, you get an extra paid apprenticeship route.' },
    home: { t: 'Stop saying "next time" about spending time together', d: 'In one family conflict, you can put work aside and seriously mend the relationship.' },
    self: { t: 'This time, live for yourself', d: 'For one career change or going-solo check, the success rate gets +8 percentage points, up to 95%.' },
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
    g.info('Echoes of a Past Life', ECHOES[k].t + '(used)');
    g.log('The words your past life left behind: this time you acted on them: ' + ECHOES[k].t + '.', 'auto');
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
      result.me.info = Object.assign({}, result.me.info, { 'Echoes of a Past Life': ECHOES[k].t + '(pending)' });
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
    t: 'Echo: Start as an electrician\'s apprentice', dev: 15,
    hint: 'Costs ¥3,000, Career −3; become an electrician\'s apprentice. One use only, no borrowing.',
    cond: (g) => g.age >= 18 && !!g.recall('money0') && CN.cash(g) >= 3000 && !g.recall('skill'),
    fx: (g) => { CN.pay(g, 3000); g.remember('skill', 'elec'); CN.setJob(g, 'electrician', 'Electrician\'s apprentice'); g.remember('lifePath', 'work'); g.stat('事业', -3); JY.ECHO.consume(g, id); },
    res: 'You pay the fee and start with learning wires and putting away tools. The master doesn\'t praise your cleverness, only says that if you\'re willing to learn slowly, you can stay.',
  }));
  ['y_crisis31', 'm_38_marriage'].forEach((id) => add(id, 'home', {
    t: 'Echo: Take a day off and say everything', dev: 10,
    hint: 'Career −2; mends the relationship, Mood +4. One use only.',
    cond: (g) => g.recall('love') === 'married' && g.alive('sp'),
    fx: (g) => { g.stat('事业', -2); g.stat('心情', 4); g.remember('fight', 'talk'); g.remember('marriage', 'mended'); JY.ECHO.consume(g, id); },
    res: 'You switch off work messages and hear the other person out. Dinner is nothing special, yet the two of you sit together for a long time.',
  }));
  const selfNodes = JY.TURNING.ROUTES.map((r) => ['t_rewrite_' + r.k, 1]).concat([['y_last34', 2], ['m_42_office', 1]]);
  selfNodes.forEach(([id, index]) => {
    const node = JY.LIFE_NODES.find((n) => n.id === id), base = node && node.choices[index];
    if (!base || !base.check) return;
    const title = base.t, hint = base.hint, fx = base.fx, fail = base.fail;
    bonusChecks.add(base.check);
    // 直接标明原选项的帮助，避免复制一条同样费用与风险的长选项。
    base.echo = 'self';
    base.t = (g) => (active(g, 'self') ? 'Echo: ' : '') + (typeof title === 'function' ? title(g) : title);
    base.hint = (g) => (typeof hint === 'function' ? hint(g) : hint || '')
      + (active(g, 'self') ? ' Echo +8 percentage points, up to 95%; used up whether it succeeds or not.' : '');
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
    const body = '<fieldset class="echo-options"><legend class="echo-legend">Echoes of a Past Life</legend>' + options + '</fieldset><p class="note" data-echo-status>' + (al.pendingEcho ? 'Chosen. It carries only into the very next life, and not into Same-Fate challenges.' : 'Optional. It takes effect at most once in your next life and does not stack. Not carried into Same-Fate challenges.') + '</p><button class="b" type="button" data-echo-clear="' + u.esc(source) + '">Don\'t carry into next life</button>';
    return '<details class="card end-echo"><summary>Carry a thought into your next life<span class="note">' + (al.pendingEcho ? 'Chosen' : 'Optional') + '</span></summary>' + body + '</details>';
  };
  const endCards = GAME.endCards, homeCards = GAME.homeCards;
  GAME.endPreparation = echoCard;
  GAME.endCards = (life, u) => endCards(life, u)
    + (life.echo ? '<p class="note echo-review">' + u.esc(life.echo.at ? 'The words from your past life were used at age ' + life.echo.at.age + ', in “' + life.echo.at.choice + '”.' : life.echo.used ? 'The words from your past life were used once in this life.' : 'The words from your past life weren\'t used in this life; they stay on this page and do not carry over.') + '</p>' : '')
    + (GAME.endLayout ? '' : echoCard(life, u));
  GAME.homeCards = (world, u) => {
    const lives = world && world.lives || [];
    return (lives.length ? echoCard(lives[lives.length - 1], u) : '') + homeCards(world, u);
  };
  if (typeof document !== 'undefined') {
    const update = (source, k) => {
      const ok = select(source, k), status = document.querySelector('[data-echo-status]');
      if (status) status.textContent = ok ? (k ? 'Chosen. It carries only into the very next life, and not into Same-Fate challenges.' : 'This life leaves no echo.') : 'Couldn\'t save. Please try again.';
      if (ok && !k) document.querySelectorAll('[data-echo-source]').forEach((el) => { el.checked = false; });
      const summary = document.querySelector('.end-echo > summary .note');
      if (ok && summary) summary.textContent = k ? 'Chosen' : 'Optional';
    };
    document.addEventListener('change', (e) => { if (e.target.dataset.echoSource) update(e.target.dataset.echoSource, e.target.value); });
    document.addEventListener('click', (e) => { const el = e.target.closest('[data-echo-clear]'); if (el) update(el.dataset.echoClear, ''); });
  }
  JY.ECHO = { ECHOES, active, consume, select, sourceOf };
})();

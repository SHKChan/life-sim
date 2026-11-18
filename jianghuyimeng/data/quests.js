/* 江湖一梦 · 跨世改命
 * 1. 跨世任务 JY.QUESTS：要两世以上才能完成的目标，只读 W.flags 和 W.lives。
 *    命终时（game.js 的 engine.onFinish，接在 legacy.js 后面）检查，完成的记进图鉴（album.quests）。
 * 2. 首页“这个江湖已经不一样了”：列出本江湖已设的改命标记，写明是哪一世、哪个人改的。
 * 3. 选人卡片上的“这一世会和书里不同：N 处”：这个人的节点里读到、而且此刻已设的标记个数。
 *    （“前世所改”的生平小标记在引擎里：g.f 读到前几世设的标记时，那一行带 pre 字段。）
 */
(function () {
  'use strict';
  const JY = window.JY;
  const G = JY.GAME;

  const lived = (W, ...ids) => W.lives.some((l) => ids.includes(l.id));
  const F = (W, k) => !!W.flags[k];

  JY.QUESTS = [
    { id: 'q_arm', t: '断臂补上', d: '先做郭芙：让剑停在半空，杨过双臂俱全；再做杨过：襄阳城破以后，在旧址上给郭伯伯立一座衣冠冢。',
      done: (W) => F(W, 'guofuGentle') && F(W, 'ygCairn') && lived(W, 'guofu') && lived(W, 'yangguo') },
    { id: 'q_blade', t: '一把空刀', d: '先做郭靖或郭襄：倚天剑、屠龙刀里什么也不藏；再做周芷若：在灵蛇岛上，打开的是一把空刀。',
      done: (W) => F(W, 'noBladeSecrets') && lived(W, 'guojing', 'guoxiang') && lived(W, 'zhouzhiruo') },
    { id: 'q_emei', t: '晚立的峨嵋', d: '先做郭襄：下山接着走，峨嵋晚立了二十年；再做周芷若：在人丁稀少的峨嵋长大。',
      done: (W) => F(W, 'emeiLate') && lived(W, 'guoxiang') && lived(W, 'zhouzhiruo') },
    { id: 'q_sword', t: '玄铁回古墓', d: '先做杨过：把玄铁重剑带回古墓；再做倚天年间的任何一个人：倚天剑铸成时，少了那一块玄铁。',
      done: (W) => F(W, 'yangKeepsSword') && lived(W, 'yangguo') && lived(W, 'zhouzhiruo', 'zhangwuji', 'zhaomin') },
    { id: 'q_truth', t: '母亲的真话', d: '先做穆念慈：救回自己，把杨康的事全告诉杨过；再做杨过：听完了，去父亲坟前坐一夜。',
      done: (W) => F(W, 'munianciLives') && F(W, 'ygToldTruth') && lived(W, 'munianci') && lived(W, 'yangguo') },
    { id: 'q_kang', t: '迟来的信', d: '先做杨康：活下来，晚年给郭靖写一封认错的信；再做郭靖：守城的老年，收到了它。',
      done: (W) => (F(W, 'yangkangLives') || F(W, 'yangkangTurned')) && F(W, 'ykApologized') && lived(W, 'yangkang') && lived(W, 'guojing') },
    { id: 'q_diao', t: '老雕的归处', d: '先做杨过：襄阳之后，放走神雕或把它葬进剑冢；再做郭襄：晚年听说它的下落。',
      done: (W) => (F(W, 'diaoLeft') || F(W, 'diaoBuried')) && lived(W, 'yangguo') && lived(W, 'guoxiang') },
  ];
  JY.questsDone = (W) => JY.QUESTS.filter((q) => { try { return !!q.done(W); } catch (e) { return false; } });

  /* ---------- 命终：记进图鉴 ---------- */
  const prevFinish = G.engine.onFinish;
  G.engine.onFinish = (g, life) => {
    if (prevFinish) prevFinish(g, life);
    try {
      const { W } = JY.engine.get();
      const view = { flags: W.flags, lives: W.lives.concat([life]) };
      const al = JY.album();
      life.fresh = life.fresh || [];
      JY.questsDone(view).forEach((q) => {
        if (!al.quests[q.id]) { al.quests[q.id] = life.to; life.fresh.push('任务“' + q.t + '”'); life.newQuests = (life.newQuests || []).concat(q.id); }
      });
      JY.albumSave(al);
    } catch (e) { console.warn(e); }
  };

  /* ---------- 首页：世界线 + 任务 ---------- */
  const baseHome = G.homeCards;
  G.homeCards = (W, u) => {
    const { esc } = u;
    let h = '';
    const keys = Object.keys(W.flags || {}).filter((k) => W.flags[k] && JY.FLAGS[k]);
    if (keys.length) {
      const who = (k) => {
        const b = (W.flagBy || {})[k];
        if (!b) return '更早';
        const c = b.who && JY.byId[b.who];
        return '第 ' + (b.n + 1) + ' 世' + (c ? ' · ' + c.name : '');
      };
      const rows = keys.map((k) => '<div class="wd-row"><b>' + esc(who(k)) + '</b><span>' + esc(JY.FLAGS[k]) + '</span></div>');
      const head = rows.slice(0, 8).join('');
      const rest = rows.slice(8).join('');
      h += '<section><div class="section-h"><h2>这个江湖已经不一样了</h2><span>' + keys.length + ' 处和书里不同 · 之后重生的人会遇上</span></div>'
        + '<div class="card world-diff">' + head
        + (rest ? '<details class="what alb-detail"><summary>另有 ' + (keys.length - 8) + ' 处</summary>' + rest + '</details>' : '') + '</div></section>';
    }
    if (baseHome) h += baseHome(W, u);
    const al = JY.album();
    const done = JY.QUESTS.filter((q) => al.quests[q.id]).length;
    h += '<section><div class="section-h"><h2>跨世任务</h2><span>要两世以上 · 完成 ' + done + ' / ' + JY.QUESTS.length + ' · 记进图鉴，重开不丢</span></div><div class="card">'
      + JY.QUESTS.map((q) => '<div class="quest-row' + (al.quests[q.id] ? ' done' : '') + '"><span class="q-mark">' + (al.quests[q.id] ? '✓' : '○') + '</span><span><b class="q-t">' + esc(q.t) + '</b><span class="q-d">' + esc(q.d) + '</span></span></div>').join('')
      + '</div></section>';
    return h;
  };

  /* ---------- 选人卡片：这一世会和书里不同 ---------- */
  const readCache = {};
  const readsOf = (c) => {
    if (readCache[c.id]) return readCache[c.id];
    const set = new Set();
    const scan = (fn) => { if (typeof fn === 'function') for (const m of fn.toString().matchAll(/\.f\(\s*'([^']+)'\s*\)/g)) set.add(m[1]); };
    ((c.arc && c.arc.nodes) || []).forEach((n) => {
      scan(n.cond); scan(n.text); scan(n.fx);
      (n.choices || []).forEach((ch) => { scan(ch.t); scan(ch.cond); scan(ch.fx); scan(ch.res); if (ch.fail) { scan(ch.fail.fx); scan(ch.fail.res); } });
    });
    return (readCache[c.id] = set);
  };
  G.pickNote = (c, W, u) => {
    const rd = readsOf(c);
    let n = 0;
    rd.forEach((k) => { if (W.flags[k] && JY.FLAGS[k]) n++; });
    return n ? '<div class="pick-note">这一世会和书里不同：' + n + ' 处</div>' : '';
  };
})();

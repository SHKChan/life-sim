/* 共用规则引擎
 * 引擎只管“发生什么”：世界状态、剧情节点、角色生死、属性判定。
 * 所有剧情文字都在 js/data/ 下的数据文件里。数据格式见 docs/SPEC.md。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  Object.assign(JY, {
    CHARS: [], byId: {}, EVENTS: [], ENCOUNTERS: [], FLAGS: {}, SLOTS: {},
    FOCUS: [], FLAVOR: {}, LOCS: {}, PAUSES: [], ERAS: [], LIFE_NODES: [], RELATIONS: [],
  });
  JY.addChars = (list) => list.forEach((c) => {
    if (JY.byId[c.id]) console.warn('重复的人物 id：' + c.id);
    JY.CHARS.push(c);
    JY.byId[c.id] = c;
  });
  JY.addEvents = (list) => { JY.EVENTS.push(...list); };
  JY.addEncounters = (list) => { JY.ENCOUNTERS.push(...list); };
  JY.addFlags = (o) => { Object.assign(JY.FLAGS, o); };
  JY.addLocs = (o) => { Object.assign(JY.LOCS, o); };
  JY.addSlots = (o) => { Object.assign(JY.SLOTS, o); };
  JY.addFlavor = (key, lines) => { (JY.FLAVOR[key] = JY.FLAVOR[key] || []).push(...lines); };
  // 原著人物关系网：{ a, b, ab, ba, y, cond, panel }，见 jianghuyimeng/data/relations.js
  JY.addRelations = (list) => { JY.RELATIONS.push(...list); };
  // 随机人生模式（GAME.random）：所有随机生成的人共用这一套人生节点
  JY.addLifeNodes = (list) => { JY.LIFE_NODES.push(...list); };

  /* 每个游戏可以在 JY.GAME 里改这些设定；没写就用江湖一梦的默认值 */
  const CONF = () => Object.assign({
    stats: ['根骨', '悟性', '心境', '情义', '武学', '声望', '正邪'],
    signedStats: ['正邪'],            // 取值 -100–100 的属性
    healthStat: '根骨',               // 降到 0 就死；也决定寿命
    healthDeath: '伤病缠身，不治而终',
    naturalDeath: '寿终正寝',
    lifespan: { base: 58, k: 0.4, rate: 0.025, decline: [[50, 1], [68, 1]] }, // 寿限 = base + 健康 × k；过了寿限每年死亡率 (年龄 − 寿限) × rate
    wakeBoost: ['武学', '声望'],      // 中途醒来时按年纪补的属性
    endTitle: '命终',                 // 终局回顾最后一屏的标题
    devMode: 'sum',                   // 改命度怎么算：sum 累加每个改命选项的 dev（封顶 100）；ratio 按“和大多数人不一样的选择”占几成
    // 以下都是可选的钩子，没写就按原来的规则：
    // onStat(g, k, d)：g.stat 改属性之前调用，返回 false 表示游戏自己处理了（例如把“财富”换算成钱）
    // yearEnd(g, age)：每年末、年度重心结算之后调用（记账、同住的人、年度小结）
    // deathLine(g, id, cause)：别人去世时生平里那一行的写法（例如带上“你的爷爷”和岁数）
    // flavorRepeat：闲笔都用过一遍以后，允许再用（长寿的人晚年不会一行字都没有）
  }, (JY.GAME && JY.GAME.engine) || {});
  JY.STATS = CONF().stats;
  const KEY = () => ((JY.GAME && JY.GAME.id) || 'game') + '.save.v2';

  let W = null; // 世界：跨多世保存
  let L = null; // 当前这一世
  let quiet = false; // 世界事件改动的标记不算玩家的功劳

  const val = (x) => (typeof x === 'function' ? x(G) : x);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const nodeYear = (c, n) => (n.y != null ? n.y : c.born + n.age);
  JY.val = val;

  /* ---------- 给数据文件用的接口 g ---------- */
  const G = {
    get Y() { return L ? L.year : W.year; },
    get age() { return L ? L.year - JY.byId[L.cid].born : 0; },
    get me() { return L ? L.cid : null; },
    get loc() { return L ? L.loc : null; },
    get focus() { return L ? L.focus : null; },
    s(k) { return L ? L.st[k] : 0; },
    f(k) { return !!W.flags[k]; },
    // 这一世的记忆：只在当前这一世有效，下一世清空。用来让几年后的节点读到当年的选择。
    remember(k, v) { if (!L) return; (L.mem = L.mem || {})[k] = { v: v === undefined ? true : v, y: L.year }; },
    recall(k) { const m = L && L.mem && L.mem[k]; return m ? m.v : undefined; },
    since(k) { const m = L && L.mem && L.mem[k]; return m ? L.year - m.y : -1; },
    set(k, v) {
      if (v === undefined) v = true;
      if (W.flags[k] === v) return;
      W.flags[k] = v;
      if (L && !quiet && JY.FLAGS[k] && !L.changes.includes(k)) L.changes.push(k);
    },
    isMe(id) { return !!L && L.cid === id; },
    exists(id) { const c = JY.byId[id]; return !!c && (!c.exists || c.exists(G)); },
    alive(id) {
      const c = JY.byId[id];
      if (!c) return false;
      if (L && L.cid === id) return !L.death;
      if (W.dead[id]) return false;
      if (c.exists && !c.exists(G)) return false;
      return c.born <= G.Y;
    },
    ageOf(id) { const c = JY.byId[id]; return c ? G.Y - c.born : 0; },
    kill(id, cause, canon) {
      if (L && L.cid === id) { L.death = cause; return; }
      if (W.dead[id] || !JY.byId[id]) return;
      W.dead[id] = { y: G.Y, cause };
      G.chron(JY.byId[id].name + '，' + cause + '。', !canon);
      if (L) G.log(deathText(id, cause), canon ? 'death' : 'wmod');
    },
    die(cause) { if (L) L.death = cause; },
    stat(k, d) {
      if (!L || !(k in L.st)) return;
      const h = CONF().onStat;
      if (h && h(G, k, d) === false) return;
      const lo = CONF().signedStats.includes(k) ? -100 : 0;
      L.st[k] = clamp(Math.round(L.st[k] + d), lo, 100);
    },
    // 直接把属性设成某个值（给 onStat 之类的钩子用，不再触发钩子）
    setStat(k, v) {
      if (!L || !(k in L.st)) return;
      const lo = CONF().signedStats.includes(k) ? -100 : 0;
      L.st[k] = clamp(Math.round(v), lo, 100);
    },
    // 某人在“我”这里怎么称呼：“你的爷爷王建国”。age 为真时加上岁数。不认识就只写名字
    who(id, age) {
      const c = JY.byId[id];
      if (!c) return id;
      const r = G.knows(id);
      const a = age && c.born <= G.Y ? '（' + (G.Y - c.born) + ' 岁）' : '';
      return (r ? '你的' + r : '') + c.name + a;
    },
    log(t, kind) { if (L && t) L.log.push({ y: L.year, a: G.age, t, k: kind || '', loc: L.loc }); },
    chron(t, mod) { if (t) W.chron.push({ y: G.Y, t, mod: !!mod }); },
    name(id) { return JY.byId[id] ? JY.byId[id].name : id; },
    slot(n) { return JY.SLOTS[n] ? JY.SLOTS[n](G) : n; },
    move(loc, cap) { if (!L) return; L.loc = loc; L.locCap = cap || (JY.LOCS[loc] ? JY.LOCS[loc].name : loc); },
    info(k, v) { if (L) L.info[k] = v; },
    rel(rel, who, note) {
      if (!L) return;
      L.rels = L.rels.filter((r) => r.rel !== rel);
      L.rels.push(JY.byId[who] ? { rel, id: who, note: note || '' } : { rel, name: who, note: note || '' });
    },
    unrel(rel) { if (L) L.rels = L.rels.filter((r) => r.rel !== rel); },
    // 某人此刻是“我”（或 who）的什么人：先看这一世 g.rel 记下的，再看原著关系网。不认识返回 ''
    knows(id, who) {
      who = who || G.me;
      if (!who || !id || who === id) return '';
      if (L && who === L.cid) { const r = L.rels.find((x) => x.id === id); if (r) return r.rel; }
      const c = who === G.me && JY.byId[who];
      if (c && c.family) { const f = c.family.find((x) => x.id === id); if (f) return f.rel; }
      let best = null;
      JY.RELATIONS.forEach((r) => {
        const fwd = r.a === who && r.b === id, back = r.b === who && r.a === id;
        if (!fwd && !back) return;
        if (r.y > G.Y) return;
        if (r.cond && !r.cond(G)) return;
        if (!G.exists(id) || !G.exists(who)) return;
        if (!best || r.y >= best.y) best = { y: r.y, t: fwd ? r.ab : r.ba };
      });
      return best ? best.t : '';
    },
    // 原著关系网里，此刻应显示在“家人与师承”里的人：[{ rel, id }]
    panelRels() {
      const me = G.me, out = [];
      if (!me) return out;
      JY.RELATIONS.forEach((r) => {
        if (!r.panel || (r.a !== me && r.b !== me)) return;
        const id = r.a === me ? r.b : r.a;
        if (r.y > G.Y || (r.cond && !r.cond(G)) || !G.exists(id)) return;
        const rel = r.a === me ? r.ab : r.ba;
        const i = out.findIndex((x) => x.id === id);
        if (i >= 0) out.splice(i, 1);
        out.push({ rel, id });
      });
      return out;
    },
    party(ids) { if (L) L.party = ids.slice(0, 3); },
    rnd() { return Math.random(); },
    // 随机人生模式：这一世里新出现一个人（配偶、孩子……），data 格式同生成器产出的人物
    spawn(data) { if (!W) return null; E.register(data); (W.gen = W.gen || []).push(data); return data.id; },
  };
  JY.G = G;

  /* ---------- 世界推演 ---------- */
  function fate(c) { return val(c.death); }
  // 别人去世时生平里的那一行
  function deathText(id, cause) {
    const h = CONF().deathLine;
    const t = h ? h(G, id, cause) : '';
    return t || JY.byId[id].name + '，' + cause + '。';
  }

  function worldYear(Y) {
    const out = [];
    quiet = true;
    JY.EVENTS.forEach((e) => {
      if (e.y !== Y) return;
      if (e.who && L && [].concat(e.who).includes(L.cid)) return;
      if (e.cond && !e.cond(G)) return;
      if (e.fx) e.fx(G);
      const t = val(e.t);
      if (t) {
        const mod = !!val(e.mod);
        G.chron(t, mod);
        out.push({ t, mod });
      }
    });
    quiet = false;
    return out;
  }

  function npcYear(Y) {
    const out = [];
    JY.CHARS.forEach((c) => {
      if (W.dead[c.id] || (L && L.cid === c.id) || c.born > Y) return;
      if (c.exists && !c.exists(G)) return;
      const d = fate(c);
      if (d && d.y <= Y) {
        const t = c.name + '，' + d.cause + '。';
        const line = L ? deathText(c.id, d.cause) : t; // 先写这一行再记死亡，钩子里还能算出岁数和关系
        W.dead[c.id] = { y: Y, cause: d.cause };
        if (c.minor !== true) G.chron(t, !!d.mod);
        out.push({ t: line, mod: !!d.mod, id: c.id });
      }
    });
    return out;
  }

  /* ---------- 存档 ---------- */
  const E = (JY.engine = {});
  E.G = G;
  E.get = () => ({ W, L });
  function newWorld() { return { year: -1, flags: {}, dead: {}, chron: [], lives: [], played: [], made: Date.now() }; }
  E.load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY()) || 'null');
      if (s && s.W) { W = s.W; L = s.L || null; (W.gen || []).forEach((d) => E.register(d)); return; }
    } catch (e) { /* 存储不可用时从新世界开始 */ }
    W = newWorld();
    L = null;
  };
  E.save = () => { try { localStorage.setItem(KEY(), JSON.stringify({ W, L })); } catch (e) { /* 忽略 */ } };
  E.reset = () => { W = newWorld(); L = null; E.save(); };

  /* ---------- 随机人生模式 ----------
   * 生成器 JY.GENERATE() 返回 { me, others: [...] }，都是只含数据的人物（可以存进存档）：
   *   { id, name, sex, born, birthplace, home, origin, bg, info, look, family, st, fateText, death: {y, cause}, ms: [[年, 文字]], mem: {键: 值}, intro, lastWords, peers: [id] }
   * register 给它接上共用的人生节点 JY.LIFE_NODES。每一世是一个新的世界，只保留往生录。 */
  E.register = (d) => {
    const c = Object.assign({}, d);
    if (d.arc !== false && (d.intro || d.mem)) c.arc = { nodes: JY.LIFE_NODES, pauses: [], intro: d.intro, lastWords: d.lastWords, focus: d.focus };
    else delete c.arc;
    if (JY.byId[c.id]) { const i = JY.CHARS.indexOf(JY.byId[c.id]); if (i >= 0) JY.CHARS.splice(i, 1); }
    JY.CHARS.push(c);
    JY.byId[c.id] = c;
    return c;
  };
  E.startRandom = () => {
    if (!W) E.load();
    // 清掉上一世生成的人
    (W.gen || []).forEach((d) => { const c = JY.byId[d.id]; if (c) { JY.CHARS.splice(JY.CHARS.indexOf(c), 1); delete JY.byId[d.id]; } });
    const g = JY.GENERATE();
    const all = [g.me].concat(g.others || []);
    W.gen = all;
    all.forEach((d) => E.register(d));
    W.year = g.me.born - 1; W.flags = {}; W.dead = {}; W.chron = [];
    return E.startLife(g.me.id);
  };

  /* ---------- 可重生的人物 ---------- */
  E.lastYear = (c) => Math.max(c.born + 1, ...c.arc.nodes.map((n) => nodeYear(c, n)));
  E.startYear = (c) => Math.max(c.born, W.year + 1);
  E.available = () => JY.CHARS.filter((c) => {
    if (!c.arc || W.played.includes(c.id) || W.dead[c.id]) return false;
    if (c.exists && !c.exists(G)) return false;
    const s = E.startYear(c);
    if (s > E.lastYear(c)) return false;
    const d = fate(c);
    if (d && d.y < s) return false;
    if (c.arc.req && !c.arc.req(G)) return false;
    return true;
  });

  E.startLife = (id) => {
    const c = JY.byId[id];
    const start = E.startYear(c);
    L = null;
    const from = W.chron.length;
    for (let Y = W.year + 1; Y <= start - 1; Y++) { W.year = Y; worldYear(Y); npcYear(Y); }
    W.year = Math.max(W.year, start - 1);
    const before = W.chron.slice(from);
    L = {
      cid: id, start, year: start - 1, st: {}, focus: null, log: [], dev: 0, changes: [], done: {},
      queue: [], death: null, marks: {}, lastEnc: -99, picks: [], ended: start - 1, peers: [],
      loc: c.home, locCap: c.homeCap || (JY.LOCS[c.home] ? JY.LOCS[c.home].name : c.birthplace),
      info: Object.assign({}, c.info || {}), rels: [], party: [], answers: [], seen: {}, wakeAge: start - c.born, mem: {},
    };
    JY.STATS.forEach((k, i) => { L.st[k] = c.st[i]; });
    // 中途醒来：之前的节点按原著走过，只结算属性与去处
    quiet = true;
    c.arc.nodes.forEach((n) => {
      if (nodeYear(c, n) >= start) return;
      L.done[n.id] = 1;
      if (n.cond && !n.cond(G)) return;
      if (n.loc) G.move(n.loc);
      if (n.auto) { if (n.fx) n.fx(G); return; }
      const ch = n.choices.find((x) => x.canon && !x.fatal && (!x.cond || x.cond(G)));
      if (ch && ch.fx) ch.fx(G);
    });
    quiet = false;
    if (start > c.born) {
      const age = start - c.born;
      JY.STATS.forEach((k) => { if (CONF().wakeBoost.includes(k)) L.st[k] = clamp(L.st[k] + Math.min(25, age), 0, 100); });
    }
    L.log = [];
    L.death = null;
    if (c.mem) Object.keys(c.mem).forEach((k) => { L.mem[k] = { v: c.mem[k], y: start - 1 }; });
    L.focus = E.defaultFocus(c, start - c.born);
    const peerPool = JY.CHARS.filter((x) => x.id !== id && (!x.exists || x.exists(G)) && !W.dead[x.id] && (fate(x) || { y: 9999 }).y >= start);
    const near = (d) => peerPool.filter((x) => Math.abs(x.born - c.born) <= d);
    let peers = near(2);
    if (peers.length < 4) peers = near(5);
    if (peers.length < 4) peers = near(10);
    L.peers = c.peers ? c.peers.slice() : peers.sort((a, b) => Math.abs(a.born - c.born) - Math.abs(b.born - c.born)).slice(0, 4).map((x) => x.id);
    L.intro = val(c.arc.intro);
    L.startLoc = L.loc;
    G.log(L.intro, 'intro');
    E.save();
    return { before, start };
  };

  E.defaultFocus = (c, age) => {
    const opts = E.focusOptions(age);
    if (!opts.length) return null;
    const want = c.arc.focus;
    return opts.find((o) => o.name === want) ? want : opts[0].name;
  };
  E.focusOptions = (age) => JY.FOCUS.filter((f) => age >= f.minAge && (f.maxAge == null || age <= f.maxAge));

  /* ---------- 一年 ---------- */
  E.node = (id) => {
    if (!L) return null;
    const c = JY.byId[L.cid];
    return c.arc.nodes.find((n) => n.id === id) || JY.ENCOUNTERS.find((n) => n.id === id) || JY.PAUSES.find((n) => n.id === id) || null;
  };
  E.peek = () => {
    if (!L) return null;
    if (L.death) return { type: 'death' };
    while (L.queue.length) {
      const n = E.node(L.queue[0]);
      if (n && !n.auto && (!n.cond || n.cond(G))) return { type: 'node', node: n };
      return E.flush();
    }
    return { type: 'idle' };
  };

  E.nextYear = () => {
    L.year += 1;
    W.year = L.year;
    const Y = L.year, c = JY.byId[L.cid], age = Y - c.born;
    // 焦点随年龄自动解锁
    const opts = E.focusOptions(age);
    if (!opts.find((o) => o.name === L.focus)) L.focus = E.defaultFocus(c, age);
    worldYear(Y).forEach((n) => G.log(n.t, n.mod ? 'wmod' : 'world'));
    const q = c.arc.nodes.filter((n) => nodeYear(c, n) === Y && !L.done[n.id]).map((n) => n.id);
    const encs = JY.ENCOUNTERS.filter((e) => !L.done[e.id] && !W.flags['enc:' + e.id] && Y >= e.y[0] && Y <= e.y[1]
      && (e.minAge == null || age >= e.minAge) && (e.maxAge == null || age <= e.maxAge) && (!e.cond || e.cond(G)));
    encs.filter((e) => e.always).forEach((e) => q.push(e.id));
    // 这一年要玩家选的事少于两件，才抽一个意外（自动节点不算，否则节点多的年龄段永远抽不到）
    const decisions = q.filter((id) => { const n = E.node(id); return n && !n.auto; }).length;
    if (Y - L.lastEnc >= 2 && decisions < 2) {
      const pool = encs.filter((e) => !e.always);
      const chance = L.focus === ((JY.GAME && JY.GAME.travelFocus) || '行走') ? 0.45 : 0.25;
      if (pool.length && Math.random() < chance) q.push(pick(pool).id);
    }
    if (q.some((id) => JY.ENCOUNTERS.find((e) => e.id === id))) L.lastEnc = Y;
    const pauses = (c.arc.pauses || []).concat(JY.PAUSES).filter((p) => p.age === age && !L.done[p.id]);
    if (pauses.length) q.push(pauses[0].id);
    L.queue = q;
    return E.flush();
  };

  E.flush = () => {
    if (L.death) return { type: 'death' };
    while (L.queue.length) {
      const n = E.node(L.queue[0]);
      if (!n || (n.cond && !n.cond(G))) { L.queue.shift(); continue; }
      if (n.loc) G.move(n.loc, n.locCap);
      if (n.auto) {
        L.queue.shift();
        L.done[n.id] = 1;
        if (n.once) W.flags['enc:' + n.id] = true;
        if (n.fx) n.fx(G);
        G.log('【' + n.t + '】' + val(n.text), n.kind || 'auto');
        if (L.death) { L.marks[L.year] = 'd'; return { type: 'death' }; }
        continue;
      }
      return { type: 'node', node: n };
    }
    endYear();
    E.save();
    return L.death ? { type: 'death' } : { type: 'idle' };
  };

  E.choices = (n) => n.choices.map((ch, i) => ({ ch, i })).filter((x) => !x.ch.cond || x.ch.cond(G));

  E.odds = (chk) => {
    const k = chk[0], dc = chk[1], mode = chk[2];
    const v = L.st[k];
    const diff = mode === 'low' ? dc - v : v - dc;
    return clamp(50 + diff * 3, 5, 95);
  };

  E.choose = (i) => {
    const n = E.node(L.queue[0]);
    const ch = n.choices[i];
    const c = JY.byId[L.cid];
    L.queue.shift();
    L.done[n.id] = 1;
    if (n.once) W.flags['enc:' + n.id] = true;
    let ok = true, p = null;
    if (ch.check) { p = E.odds(ch.check); ok = Math.random() * 100 < p; }
    const br = ok ? ch : (ch.fail || {});
    if (br.fx) br.fx(G);
    let d = 0;
    if (!ch.canon) d = ok ? (ch.dev != null ? ch.dev : 15) : (ch.fail && ch.fail.dev != null ? ch.fail.dev : 3);
    L.dev += d;
    const isPause = JY.PAUSES.includes(n) || (c.arc.pauses || []).includes(n);
    if (isPause) L.answers.push({ age: G.age, q: val(n.ask || n.text), a: ch.t });
    else L.marks[L.year] = L.death ? 'd' : !ok ? 'b' : (ch.canon || d === 0) ? 'j' : 'q';
    if (L.death) L.marks[L.year] = 'd';
    const res = val(br.res) || (ok ? '' : '没有成功。');
    if (!isPause) L.picks.push({ y: L.year, age: G.age, t: n.t, c: ch.t, canon: !!ch.canon, ok, check: !!ch.check, dev: d, res, loc: L.loc, party: L.party.slice(), enc: JY.ENCOUNTERS.includes(n) });
    const tail = ch.check ? (ok ? '（成功）' : '（失败）') : '';
    G.log('【' + n.t + '】' + ch.t + tail + (res ? '。' + res : ''), isPause ? 'pause' : ch.canon ? 'pick' : ok ? 'mod' : 'fail');
    if (!isPause && !ch.canon && ok && d > 0) G.chron(val(ch.chron) || (c.name + '：' + ch.t + '。'), true);
    E.save();
    return { ok, p, res, check: ch.check, canon: !!ch.canon, dev: d, pause: isPause };
  };

  function flavorLine(c, age) {
    const stage = age <= 5 ? 'child' : age <= 15 ? 'young' : age <= 49 ? 'adult' : 'old';
    const keys = ['loc:' + L.loc, 'focus:' + L.focus, 'age:' + stage, 'book:' + c.book, 'char:' + c.id, 'any'];
    const pool = [];
    keys.forEach((k) => (JY.FLAVOR[k] || []).forEach((x, i) => pool.push({ x, key: k + i })));
    const fresh = pool.filter((p) => !L.seen[p.key]).filter((p) => {
      const x = p.x;
      if (typeof x !== 'object') return true;
      if (x.minAge != null && age < x.minAge) return false;
      if (x.maxAge != null && age > x.maxAge) return false;
      if (x.sex && x.sex !== c.sex) return false;
      return !x.cond || x.cond(G);
    });
    if (!fresh.length) {
      // 都用过了：允许重用，先清掉这些键的“用过”记号
      if (!CONF().flavorRepeat || pool.every((p) => !L.seen[p.key])) return null;
      pool.forEach((p) => { delete L.seen[p.key]; });
      return flavorLine(c, age);
    }
    const p = pick(fresh);
    L.seen[p.key] = 1;
    const x = p.x;
    if (typeof x === 'object') { if (x.fx) x.fx(G); return val(x.t); }
    return val(x);
  }

  function endYear() {
    if (L.ended >= L.year) return;
    L.ended = L.year;
    const Y = L.year, c = JY.byId[L.cid], age = Y - c.born;
    npcYear(Y).forEach((n) => G.log(n.t, n.mod ? 'wmod' : 'death'));
    if (L.death) { L.marks[Y] = 'd'; return; }
    const F = JY.FOCUS.find((f) => f.name === L.focus);
    if (F && F.fx) F.fx(G, age);
    const cf = CONF(), H = cf.healthStat, ls = cf.lifespan;
    ls.decline.forEach(([from, d]) => { if (age >= from) G.stat(H, -d); });
    if (cf.yearEnd) cf.yearEnd(G, age);
    const lines = L.marks[Y] ? 1 : 1 + (Math.random() < 0.55 ? 1 : 0);
    for (let i = 0; i < lines; i++) { const t = flavorLine(c, age); if (t) G.log(t, 'flavor'); }
    if (L.st[H] <= 0) L.death = cf.healthDeath;
    else {
      const lim = ls.base + L.st[H] * ls.k;
      if (age > lim && Math.random() < (age - lim) * ls.rate) L.death = cf.naturalDeath;
    }
    if (L.death) L.marks[Y] = 'd';
  }

  /* ---------- 命终 ---------- */
  E.finish = (words) => {
    const c = JY.byId[L.cid], Y = L.year;
    G.chron(c.name + '，' + L.death + '。', L.dev > 0);
    const peers = L.peers.map((p) => ({ id: p, name: JY.byId[p].name }));
    const moments = E.moments(c);
    W.dead[c.id] = { y: Y, cause: L.death };
    W.played.push(c.id);
    const life = {
      id: c.id, name: c.name, book: c.book, sex: c.sex, from: L.start, to: Y, born: c.born,
      cause: L.death, words, dev: E.devOf(L), changes: L.changes.slice(), picks: L.picks.slice(),
      marks: L.marks, answers: L.answers.slice(), peers, fateText: c.fateText, info: L.info,
      moments, birthplace: c.birthplace, deathLoc: L.locCap, wakeAge: L.wakeAge,
    };
    W.lives.push(life);
    W.year = Y;
    L = null;
    life.peers.forEach((p) => { p.st = E.status(p.id); });
    E.save();
    return life;
  };

  /* 终局回顾：出生（或醒来）、关键抉择、加星的生平、命终 */
  E.moments = (c) => {
    const ms = [{ y: L.start, age: L.wakeAge, loc: L.startLoc || c.home, party: [], t: L.wakeAge > 0 ? '醒来' : '出生', text: L.intro, k: 'intro' }];
    const picks = L.picks.filter((p) => !p.enc || (!p.canon && p.ok && p.dev > 0));
    const key = picks.filter((p) => !p.canon && p.ok && p.dev > 0);
    let chosen = key.slice();
    const rest = picks.filter((p) => !chosen.includes(p));
    const room = Math.max(0, 14 - chosen.length);
    for (let i = 0; i < room && rest.length; i++) chosen.push(rest.splice(Math.floor(rest.length * i / room) % rest.length, 1)[0]);
    chosen = chosen.slice(0, 18).sort((a, b) => a.y - b.y);
    chosen.forEach((p) => ms.push({ y: p.y, age: p.age, loc: p.loc, party: p.party || [], t: p.t, text: p.c + '。' + (p.res || ''), k: !p.ok ? 'fail' : p.canon ? 'canon' : 'mod' }));
    L.log.filter((e) => e.star).forEach((e) => ms.push({ y: e.y, age: e.a, loc: e.loc || L.loc, party: [], t: '你记下的一刻', text: e.t, k: 'star' }));
    ms.sort((a, b) => a.y - b.y);
    ms.push({ y: L.year, age: L.year - c.born, loc: L.loc, party: L.party.slice(), t: CONF().endTitle, text: c.name + '，' + L.death + '。', k: 'death' });
    return ms;
  };

  /* ---------- 显示用 ---------- */
  E.status = (id) => {
    const c = JY.byId[id];
    if (!c) return { dead: false, t: '' };
    const d = W.dead[id];
    if (d) return { dead: true, t: '卒于' + ((JY.GAME && JY.GAME.year) || '纪年') + ' ' + d.y + ' · ' + d.cause };
    if (c.exists && !c.exists(G)) return { dead: true, t: '世上没有这个人' };
    if (c.born > G.Y) return { dead: false, unborn: true, t: '尚未出生' };
    const ms = (c.ms || []).filter((m) => m[0] <= G.Y && (!m[2] || m[2](G)));
    return { dead: false, t: ms.length ? val(ms[ms.length - 1][1]) : c.origin, age: G.Y - c.born };
  };
  E.era = (Y) => { const e = JY.ERAS.find((x) => Y <= x[0]); return e ? e[1] : ''; };
  // 改命度（与众不同度），0–100
  E.devOf = (l) => {
    if (!l) return 0;
    if (CONF().devMode !== 'ratio') return Math.min(100, l.dev);
    const ps = l.picks || [];
    return ps.length ? Math.round(100 * ps.filter((p) => !p.canon && p.ok && p.dev > 0).length / ps.length) : 0;
  };
  E.tier = (v) => (v < 15 ? '不入流' : v < 35 ? '三流' : v < 55 ? '二流' : v < 75 ? '一流' : v < 90 ? '宗师' : '绝顶');
  E.conf = CONF;
  E.stage = (age) => (age <= 2 ? '襁褓' : age <= 5 ? '幼年' : age <= 15 ? '少年' : age <= 30 ? '青年' : age <= 49 ? '壮年' : age <= 69 ? '中老年' : '暮年');
})();

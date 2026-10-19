/* 群侠 · 规则引擎
 * 只管“发生什么”：状态、时间、地图、行走、练功、战斗、事件、存档。不放剧情文字。
 * 剧情、地名、人物、武功、物品都在 data/*.js 里，用 QX.addXxx 注册；引擎要说的固定句式在 QX.TXT（data/world.js）。
 * 全局对象 window.QX；界面（ui.js）只读 QX.state() 和调用这里的函数。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  const QX = (window.QX = window.QX || {});
  const CFG = (QX.CFG = Object.assign({
    start: [131, 1], end: [138, 12], age: 12, key: 'jianghuyimeng.qunxia.v1',
    partyMax: 2, maxLv: 10, relicsAll: 14, retireFrom: [137, 1],
    companions: false, // 同伴功能：暂时关掉（不出现“邀请同行”，旧存档里的同伴也会离开）。改成 true 就恢复
  }, QX.CFG || {}));

  /* ---------- 注册 ---------- */
  QX.LOCS = {}; QX.REGIONS = {}; QX.PEOPLE = {}; QX.ARTS = {}; QX.ITEMS = {}; QX.EVENTS = {}; QX.ENEMIES = {}; QX.SECTS = {};
  QX.TIMELINE = []; QX.ORIGINS = []; QX.ENDINGS = []; QX.TXT = {}; QX.FLAGS = {}; QX.DUP = [];
  const into = (o) => (x) => { Object.keys(x).forEach((k) => { if (o[k]) QX.DUP.push(k); o[k] = Object.assign({ id: k }, x[k]); }); };
  QX.addRegions = into(QX.REGIONS);
  QX.addLocs = into(QX.LOCS);
  QX.addPeople = into(QX.PEOPLE);
  QX.addArts = into(QX.ARTS);
  QX.addItems = into(QX.ITEMS);
  QX.addEnemies = into(QX.ENEMIES);
  QX.addSects = into(QX.SECTS);
  QX.addFlags = (o) => Object.assign(QX.FLAGS, o);
  QX.addText = (o) => Object.assign(QX.TXT, o);
  QX.addEvents = (arr) => arr.forEach((e) => { if (QX.EVENTS[e.id]) QX.DUP.push(e.id); QX.EVENTS[e.id] = e; });
  QX.addTimeline = (arr) => arr.forEach((t) => QX.TIMELINE.push(t));
  QX.addOrigins = (arr) => arr.forEach((o) => QX.ORIGINS.push(o));
  QX.addEndings = (arr) => arr.forEach((o) => QX.ENDINGS.push(o));
  QX.tx = (k, v) => {
    const s = QX.TXT[k];
    if (s == null) return k;
    if (typeof s === 'function') return s(v || {});
    return String(s).replace(/\{(\w+)\}/g, (m, kk) => (v && v[kk] != null ? v[kk] : m));
  };
  QX.rnd = Math.random;
  const R = () => QX.rnd();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const val = (x, g) => (typeof x === 'function' ? x(g) : x);
  const pick = (arr) => arr[Math.floor(R() * arr.length)];

  /* ---------- 日子：一年 360 天，一月 30 天 ---------- */
  const DPY = 360;
  const dv = (y, m, d) => (y - CFG.start[0]) * DPY + ((m || 1) - 1) * 30 + ((d || 1) - 1);
  QX.dv = dv;
  QX.date = (day) => ({ y: CFG.start[0] + Math.floor(day / DPY), m: Math.floor((day % DPY) / 30) + 1, d: (day % 30) + 1 });
  const END_DAY = () => dv(CFG.end[0], CFG.end[1], 30);

  /* ---------- 状态 ---------- */
  let S = null;
  QX.state = () => S;
  QX.setState = (s) => { S = s; };
  const STATS = ['资质', '根骨', '内力', '攻击', '防御', '轻功', '品德', '声望', '银两'];
  QX.STATS = STATS;
  const RANGE = { 品德: [0, 100], 声望: [0, 999], 银两: [0, 999999] };

  function log(t, k) { if (!t) return; S.log.push({ d: S.day, t, k: k || '' }); if (S.log.length > 400) S.log.splice(0, S.log.length - 400); }
  function news(t) { if (!t) return; S.news.push({ d: S.day, t }); if (S.news.length > 80) S.news.splice(0, S.news.length - 80); }
  function addSt(k, n) {
    if (!(k in S.st)) throw new Error('未知属性 ' + k);
    const r = RANGE[k] || [0, 999];
    S.st[k] = clamp(Math.round((S.st[k] + n) * 10) / 10, r[0], r[1]);
  }
  function itemDef(id) { const it = QX.ITEMS[id]; if (!it) throw new Error('未知物品 ' + id); return it; }
  function artDef(id) { const a = QX.ARTS[id]; if (!a) throw new Error('未知武功 ' + id); return a; }
  function personDef(id) { const p = QX.PEOPLE[id]; if (!p) throw new Error('未知人物 ' + id); return p; }
  function eventDef(id) { const e = QX.EVENTS[id]; if (!e) throw new Error('未知事件 ' + id); return e; }

  QX.artLv = (id) => (S.arts[id] ? S.arts[id].lv : 0);
  function bestOf(type) { let b = 0; for (const id in S.arts) if (QX.ARTS[id] && QX.ARTS[id].type === type) b = Math.max(b, S.arts[id].lv); return b; }
  QX.bestNei = () => bestOf('内功');
  function special(key) { // 已学武功里带某种被动的（九阳护体、乾坤挪移）
    let b = 0;
    for (const id in S.arts) { const A = QX.ARTS[id]; if (A && A.passive && A.passive[key]) b = Math.max(b, A.passive[key] * S.arts[id].lv); }
    return b;
  }
  QX.eff = (k) => {
    let v = S.st[k] || 0;
    for (const id in S.items) if (S.items[id] > 0 && QX.ITEMS[id] && QX.ITEMS[id].bonus && QX.ITEMS[id].bonus[k]) v += QX.ITEMS[id].bonus[k];
    if (k === '防御') v += QX.bestNei();
    if (k === '轻功') v += bestOf('轻功') * 2;
    return Math.round(v);
  };
  QX.maxHp = () => Math.round(60 + QX.eff('根骨') * 3 + S.xp / 8 + QX.bestNei() * 6);
  QX.maxMp = () => Math.round(10 + QX.eff('内力') * 2 + QX.bestNei() * 4);
  QX.age = () => CFG.age + Math.floor(S.day / DPY);
  QX.relicIds = () => Object.keys(QX.ITEMS).filter((k) => QX.ITEMS[k].relic);

  function learn(id, lv) {
    const A = artDef(id);
    if (S.arts[id]) { if (lv && S.arts[id].lv < lv) S.arts[id].lv = lv; return false; }
    S.arts[id] = { lv: lv || 1, xp: 0 };
    log(QX.tx('学会', { a: A.name }), 'good');
    return true;
  }
  function give(id, n) {
    const it = itemDef(id);
    S.items[id] = (S.items[id] || 0) + (n || 1);
    if (it.relic) {
      S.items[id] = 1;
      S.holder[id] = 'me';
      if (!S.relics.includes(id)) { S.relics.push(id); log(QX.tx('得信物', { a: it.name, n: S.relics.length, all: CFG.relicsAll }), 'relic'); }
    } else log(QX.tx('得物品', { a: it.name, n: n || 1 }), 'item');
  }
  function take(id, n) {
    itemDef(id);
    S.items[id] = Math.max(0, (S.items[id] || 0) - (n || 1));
    if (!S.items[id]) delete S.items[id];
  }
  QX.has = (id) => (S.items[id] || 0) > 0;

  /* ---------- 同伴 ---------- */
  QX.inParty = (pid) => S.party.includes(pid);
  function joinParty(pid) {
    if (!CFG.companions) return;
    const P = personDef(pid);
    if (!P.comp) throw new Error(pid + ' 不能同行');
    if (QX.inParty(pid)) return;
    S.party.push(pid);
    S.met[pid] = true;
    S.comp[pid] = S.comp[pid] || { since: S.day };
    log(QX.tx('入队', { a: P.name }), 'good');
  }
  function leaveParty(pid, why) {
    if (!QX.inParty(pid)) return;
    S.party = S.party.filter((x) => x !== pid);
    log(why || QX.tx('离队', { a: QX.PEOPLE[pid].name }), 'bad');
  }
  // 这个同伴现在为什么不能入队（返回理由），能入队返回 ''
  function joinBlock(pid, g) {
    const P = personDef(pid), C = P.comp;
    if (S.dead[pid]) return QX.tx('已故');
    if (QX.inParty(pid)) return '';
    for (const o of S.party) {
      const O = QX.PEOPLE[o].comp;
      const hit = ((O.clash || []).includes(pid) && (!O.clashCond || O.clashCond(g))) || ((C.clash || []).includes(o) && (!C.clashCond || C.clashCond(g)));
      if (hit) return QX.tx('不和', { a: P.name, b: QX.PEOPLE[o].name });
    }
    if (C.cond && !C.cond(g)) return val(C.why, g) || QX.tx('不肯同行', { a: P.name });
    if (S.party.length >= CFG.partyMax) return QX.tx('队伍满了', { n: CFG.partyMax });
    return '';
  }

  /* ---------- 门派 ---------- */
  function setSect(s) {
    if (s && !QX.SECTS[s]) throw new Error('未知门派 ' + s);
    S.sect = s || ''; S.rank = 0; S.contrib = 0;
  }

  /* ---------- 人物在哪 ---------- */
  QX.where = (pid) => {
    const P = personDef(pid);
    if (S.dead[pid]) return null;
    if (QX.inParty(pid)) return 'party';
    const g = G();
    if (typeof P.at === 'function') return P.at(g) || null;
    for (const a of P.at || []) {
      if (a.from && S.day < dv(a.from[0], a.from[1])) continue;
      if (a.to && S.day >= dv(a.to[0], a.to[1] + 1)) continue;
      if (a.cond && !a.cond(g)) continue;
      return a.loc;
    }
    return null;
  };
  QX.peopleHere = () => Object.keys(QX.PEOPLE).filter((p) => QX.where(p) === S.loc);

  /* ---------- g：给数据文件用的接口 ---------- */
  function G() {
    const d = QX.date(S.day);
    const g = {
      S, y: d.y, m: d.m, day: S.day, age: QX.age(), loc: S.loc, sex: S.sex, name: S.name, sect: S.sect, rank: S.rank,
      after: (y, m, dd) => S.day >= dv(y, m, dd), before: (y, m, dd) => S.day < dv(y, m, dd),
      st: (k) => QX.eff(k), base: (k) => S.st[k], add: (k, n) => addSt(k, n),
      f: (k) => S.flags[k], set: (k, v) => { if (!QX.FLAGS[k]) QX.FLAGS_UNKNOWN[k] = true; S.flags[k] = v === undefined ? true : v; }, unset: (k) => { delete S.flags[k]; },
      has: (id) => { itemDef(id); return QX.has(id); }, give, take, relics: () => S.relics.length,
      holder: (id) => { const it = itemDef(id); return S.holder[id] !== undefined ? S.holder[id] : (it.holder0 || null); },
      hold: (id, who) => { itemDef(id); if (who !== 'me' && QX.has(id) && QX.ITEMS[id].relic) return; S.holder[id] = who; },
      lv: (id) => { artDef(id); return QX.artLv(id); }, learn, nei: () => QX.bestNei(),
      setSect, setRank: (n) => { S.rank = n; }, contrib: () => S.contrib,
      inParty: (p) => { personDef(p); return QX.inParty(p); }, recruit: joinParty, dismiss: leaveParty,
      partySize: () => S.party.length,
      met: (p) => { personDef(p); return !!S.met[p]; }, meet: (p) => { personDef(p); S.met[p] = true; },
      alive: (p) => { personDef(p); return !S.dead[p]; }, kill: (p, why) => { personDef(p); S.dead[p] = why || true; leaveParty(p); if (why) news(why); },
      here: (p) => QX.where(p) === S.loc || QX.inParty(p),
      heal: (n) => { S.hp = clamp(S.hp + n, 1, QX.maxHp()); }, hurt: (n) => { S.hp = clamp(S.hp - n, 1, QX.maxHp()); },
      restMp: (n) => { S.mp = clamp(S.mp + n, 0, QX.maxMp()); },
      injure: (n) => { S.inj = clamp(S.inj + (n || 1), 0, 9); }, cure: (n) => { S.inj = n ? Math.max(0, S.inj - n) : 0; }, inj: () => S.inj,
      days: (n) => { S.pend += n; }, move: (l) => { if (!QX.LOCS[l]) throw new Error('未知地点 ' + l); S.loc = l; },
      log: (t) => log(t, 'ev'), news: (t) => news(t),
      die: (t) => { S.over = { kind: 'dead', text: t, day: S.day }; },
      rnd: R, pick, name: (p) => personDef(p).name, at: (l) => S.loc === l,
      money: () => S.st.银两, ta: (m, f) => (S.sex === '女' ? f : m),
      queue: (id) => { eventDef(id); S.queue.push(id); },
      done: (id) => S.done[id] || 0,
      tl: (id) => S.tl[id] || '',
      chance: (chk) => chance(chk),
    };
    return g;
  }
  QX.FLAGS_UNKNOWN = {};
  QX.G = () => G();

  function chance(chk) {
    const v = QX.eff(chk[0]);
    return clamp(Math.round(50 + (v - chk[1]) * 3), 5, 95);
  }
  QX.chance = chance;

  /* ---------- 新游戏 ---------- */
  QX.newGame = (o) => {
    const org = QX.ORIGINS.find((x) => x.id === o.origin) || QX.ORIGINS[0];
    const sect = o.sect && QX.SECTS[o.sect] ? o.sect : '';
    S = {
      v: 1, name: (o.name || '').trim().slice(0, 8) || QX.tx('无名'), sex: o.sex === '女' ? '女' : '男', origin: org.id, sect: '', rank: 0, contrib: 0,
      day: 0, loc: org.loc, pend: 0,
      st: { 资质: 45, 根骨: 12, 内力: 6, 攻击: 10, 防御: 6, 轻功: 10, 品德: 50, 声望: 0, 银两: 20 },
      hp: 1, mp: 0, inj: 0, xp: 0, arts: {}, items: {}, relics: [], party: [], comp: {}, flags: {}, met: {}, dead: {}, holder: {}, done: {}, tl: {},
      log: [], news: [], ev: null, queue: [], fight: null, over: null, seen: {}, kills: 0, wins: 0, fights: 0,
    };
    for (const k in org.st || {}) addSt(k, org.st[k]);
    S.st.资质 = clamp(S.st.资质 + Math.round((R() - 0.5) * 16), 15, 90);
    S.st.根骨 = clamp(S.st.根骨 + Math.round((R() - 0.5) * 8), 4, 40);
    (org.arts || []).forEach((a) => learn(a, 1));
    (org.items || []).forEach((it) => give(it[0], it[1]));
    if (sect) {
      const SC = QX.SECTS[sect];
      setSect(sect);
      S.loc = SC.home;
      (SC.arts || []).forEach((a) => learn(a, 1));
    }
    S.log = [];
    const g = G();
    log(val(org.intro, g), 'intro');
    if (sect && QX.SECTS[sect].intro) log(val(QX.SECTS[sect].intro, g), 'intro');
    S.hp = QX.maxHp(); S.mp = QX.maxMp();
    arrive(S.loc);
    flush();
    QX.save();
    return S;
  };

  /* ---------- 时间 ---------- */
  function passDays(n) {
    n = Math.max(0, Math.round(n));
    if (!n) return;
    S.day += n;
    // 路上、日常慢慢恢复；内伤一个月好一层
    S.hp = clamp(S.hp + Math.round(QX.maxHp() * 0.03 * n * (S.inj ? 0.4 : 1)), 1, QX.maxHp());
    S.mp = clamp(S.mp + Math.round(QX.maxMp() * 0.05 * n), 0, QX.maxMp());
    S.injT = (S.injT || 0) + n;
    while (S.injT >= 30) { S.injT -= 30; if (S.inj) S.inj--; }
    timeline();
    if (!S.over && S.day >= END_DAY()) finish('deadline');
  }
  function timeline() {
    const g = G();
    for (const T of QX.TIMELINE) {
      if (S.tl[T.id]) continue;
      const st = dv(T.at[0], T.at[1], T.at[2]), en = st + (T.win || 0);
      if (S.day < st) continue;
      if (T.loc && T.ev && S.loc === T.loc && S.day <= en && (!T.cond || T.cond(g))) {
        S.tl[T.id] = 'here';
        if (T.fx) T.fx(g);
        S.queue.push(T.ev);
        continue;
      }
      if (S.day > en || !T.loc || !T.ev) {
        S.tl[T.id] = 'away';
        if (T.fx) T.fx(g);
        if (T.away) T.away(g);
        const t = val(T.news, g);
        if (t) { news(t); log(t, 'news'); }
      }
    }
    // 同伴自己要走
    for (const pid of S.party.slice()) {
      const C = QX.PEOPLE[pid].comp;
      if (C.leave) { const why = C.leave(g); if (why) leaveParty(pid, why); }
    }
  }
  function settle() { // 数据里 g.days() 攒下的日子
    const n = S.pend; S.pend = 0;
    if (n) passDays(n);
  }

  /* ---------- 到达 ---------- */
  function arrive(loc) {
    S.loc = loc;
    S.seen[loc] = (S.seen[loc] || 0) + 1;
    const g = G();
    // 到达时自动触发的事件（arrive: true）
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (!E.arrive || (E.loc && E.loc !== loc)) continue;
      if (E.once !== false && S.done[id]) continue;
      if (E.cond && !E.cond(g)) continue;
      if (!S.queue.includes(id)) S.queue.push(id);
    }
    // 门派规矩
    const SC = S.sect && QX.SECTS[S.sect];
    if (SC && SC.home === loc && SC.minDe != null && S.st.品德 < SC.minDe && SC.expel && !S.queue.includes(SC.expel)) S.queue.push(SC.expel);
  }

  /* ---------- 事件 ---------- */
  function evAvailable(E, g) {
    if (E.once !== false && S.done[E.id]) return false;
    if (E.from && S.day < dv(E.from[0], E.from[1])) return false;
    if (E.to && S.day >= dv(E.to[0], E.to[1] + 1)) return false;
    if (E.cond && !E.cond(g)) return false;
    return true;
  }
  function costOk(c) {
    if (!c.cost) return '';
    if (c.cost.银两 && S.st.银两 < c.cost.银两) return QX.tx('银两不够', { n: c.cost.银两 });
    if (c.cost.item && !QX.has(c.cost.item)) return QX.tx('缺少', { a: itemDef(c.cost.item).name });
    return '';
  }
  function startEvent(id) {
    const E = eventDef(id), g = G();
    S.done[id] = (S.done[id] || 0) + 1;
    if (E.who) S.met[E.who] = true;
    if (E.fx) E.fx(g);
    if (S.over) { S.ev = null; return; }
    const ch = [];
    (E.choices || []).forEach((c, i) => {
      if (c.cond && !c.cond(g)) return;
      const f = c.fight;
      ch.push({ t: val(c.t, g), a: { k: 'c', i }, tag: c.tag || '', dis: costOk(c), fight: !!f, deadly: !!(f && f.lose && f.lose.mode === 'death'),
        p: c.check ? chance(c.check) : null, ck: c.check ? c.check[0] : '' });
    });
    S.ev = { id, title: val(E.t, g) || '', text: val(E.text, g) || '', who: E.who || '', choices: ch, res: null };
    if (!ch.length) S.ev.res = '';
    settle();
  }
  function resolveChoice(i) {
    const E = eventDef(S.ev.id), c = E.choices[i], g = G();
    if (costOk(c)) return;
    if (c.cost && c.cost.银两) addSt('银两', -c.cost.银两);
    if (c.cost && c.cost.item) take(c.cost.item, 1);
    S.ev.picked = val(c.t, g);
    if (c.fight) { startFight(c.fight, { ev: S.ev.id, ci: i }); return; }
    let br = c, roll = null;
    if (c.check) {
      const p = chance(c.check), ok = R() * 100 < p;
      roll = { k: c.check[0], p, ok };
      if (!ok) br = c.fail || { res: QX.tx('没成') };
    }
    applyBranch(br, roll, c);
  }
  function applyBranch(br, roll, c) {
    const g = G();
    if (br.fx) br.fx(g);
    if (!S.ev) S.ev = { id: '', title: '', text: '', choices: [] };
    S.ev.res = val(br.res, g) || '';
    S.ev.roll = roll;
    S.ev.choices = [];
    S.ev.next = br.next || (c && c.next) || null;
    if (S.ev.res) log(S.ev.res, 'ev');
    settle();
  }
  function flush() {
    const g = G();
    while (!S.ev && !S.fight && !S.over && S.queue.length) {
      const id = S.queue.shift();
      const E = eventDef(id);
      if (E.arrive && E.loc && E.loc !== S.loc) continue;
      if (E.cond && !E.cond(g) && !E.force) continue;
      startEvent(id);
    }
  }
  QX.cont = () => {
    if (!S.ev) { flush(); QX.save(); return; }
    const nx = S.ev.next;
    S.ev = null;
    if (S.over) { QX.save(); return; }
    if (nx) startEvent(nx);
    flush();
    QX.save();
  };

  /* ---------- 和人说话 ---------- */
  QX.talk = (pid) => {
    const P = personDef(pid), g = G();
    const first = !S.met[pid];
    S.met[pid] = true;
    const ch = [];
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (E.who !== pid || !E.act) continue;
      if (E.loc && E.loc !== S.loc) continue;
      if (!evAvailable(E, g)) continue;
      ch.push({ t: val(E.act, g), a: { k: 'ev', id } });
    }
    for (const T of P.teach || []) {
      const A = artDef(T.art), lv = QX.artLv(T.art);
      const ok = !T.cond || T.cond(g);
      if (!ok && !T.why) continue;
      const cap = T.cap || CFG.maxLv;
      if (!lv) ch.push({ t: QX.tx('拜师学', { a: A.name }), a: { k: 'learn', p: pid, art: T.art }, dis: ok ? costOk(T) : val(T.why, g), sub: A.type });
      else if (lv < cap) ch.push({ t: QX.tx('请教', { a: A.name }), a: { k: 'coach', p: pid, art: T.art }, dis: ok ? '' : val(T.why, g), sub: QX.tx('级', { n: lv }) });
    }
    if (CFG.companions && P.comp && !QX.inParty(pid)) {
      const why = joinBlock(pid, g);
      if (!(P.comp.hide && why && P.comp.hide(g))) ch.push({ t: QX.tx('邀请同行'), a: { k: 'join', p: pid }, dis: why });
    }
    ch.push({ t: QX.tx('告辞'), a: { k: 'bye' } });
    S.ev = { talk: pid, id: '', who: pid, title: P.name, text: val(first && P.hello ? P.hello : P.talk, g) || '', choices: ch, res: null };
    QX.save();
  };

  QX.choose = (i) => {
    if (!S.ev || S.fight || S.over) return;
    const c = S.ev.choices[i];
    if (!c || c.dis) return;
    const a = c.a, g = G();
    switch (a.k) {
      case 'c': resolveChoice(a.i); break;
      case 'ev': S.ev = null; startEvent(a.id); break;
      case 'bye': S.ev = null; flush(); break;
      case 'learn': {
        const T = personDef(a.p).teach.find((x) => x.art === a.art);
        if (T.cost && T.cost.银两) addSt('银两', -T.cost.银两);
        learn(a.art, 1);
        S.ev = { id: '', who: a.p, title: QX.PEOPLE[a.p].name, text: '', choices: [], res: val(T.say, g) || QX.tx('学成', { a: QX.ARTS[a.art].name }) };
        passDays(T.days || 5);
        break;
      }
      case 'coach': {
        const r = practise(a.art, false, 2.2);
        S.ev = { id: '', who: a.p, title: QX.PEOPLE[a.p].name, text: '', choices: [], res: QX.tx('指点', { a: QX.ARTS[a.art].name, n: r.gain }) + (r.up ? QX.tx('升级', { a: QX.ARTS[a.art].name, n: QX.artLv(a.art) }) : '') };
        break;
      }
      case 'join': {
        const P = personDef(a.p);
        joinParty(a.p);
        S.ev = { id: '', who: a.p, title: P.name, text: '', choices: [], res: val(P.comp.joinText, g) || QX.tx('入队', { a: P.name }) };
        break;
      }
      default: break;
    }
    QX.save();
  };

  /* ---------- 地点上能做的事 ---------- */
  QX.actions = () => {
    const L = QX.LOCS[S.loc], g = G(), out = [];
    for (const pid of QX.peopleHere()) { const P = QX.PEOPLE[pid]; out.push({ k: 'talk', id: pid, label: P.name, sub: val(P.title, g) || '' }); }
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (!E.act || E.who) continue;
      if (E.loc && E.loc !== S.loc) continue;
      if (!E.loc && !E.anywhere) continue;
      if (!evAvailable(E, g)) continue;
      out.push({ k: 'ev', id, label: val(E.act, g), sub: E.sub || '' });
    }
    out.push({ k: 'explore' });
    if (L.shop) out.push({ k: 'shop' });
    if (L.inn) out.push({ k: 'inn', cost: L.inn });
    if (L.work) out.push({ k: 'work' });
    if (S.sect && QX.SECTS[S.sect].home === S.loc) out.push({ k: 'chore' });
    out.push({ k: 'practise' }, { k: 'rest' }, { k: 'wait' }, { k: 'travel' });
    if (QX.canRetire()) out.push({ k: 'retire' });
    return out;
  };
  QX.act = (k, id) => {
    if (S.ev || S.fight || S.over) return null;
    let r = null;
    switch (k) {
      case 'talk': QX.talk(id); return null;
      case 'ev': startEvent(id); break;
      case 'explore': r = explore(); break;
      case 'inn': r = inn(); break;
      case 'work': r = work(); break;
      case 'chore': r = chore(); break;
      case 'rest': r = rest(); break;
      case 'wait': passDays(30); r = QX.tx('等了一月'); log(r); break;
      case 'retire': finish('retire'); break;
      default: return null;
    }
    flush();
    QX.save();
    return r;
  };
  function explore() {
    const g = G(), pool = [];
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (!E.explore) continue;
      const here = E.explore === S.loc || (Array.isArray(E.explore) && E.explore.includes(S.loc)) || (E.explore === '*' && !(QX.LOCS[S.loc].wild === false && E.wild));
      if (!here) continue;
      if (!evAvailable(E, g)) continue;
      const w = val(E.w, g) || (E.explore === '*' ? 1 : 4);
      pool.push([id, w]);
    }
    passDays(3);
    if (S.over) return null;
    if (!pool.length) { const t = QX.tx('一无所获'); log(t); return t; }
    let tot = pool.reduce((s, x) => s + x[1], 0), r = R() * tot;
    for (const [id, w] of pool) { r -= w; if (r <= 0) { S.queue.unshift(id); break; } }
    return null;
  }
  function inn() {
    const L = QX.LOCS[S.loc];
    if (S.st.银两 < L.inn) return QX.tx('住不起', { n: L.inn });
    addSt('银两', -L.inn);
    passDays(1);
    S.hp = QX.maxHp(); S.mp = QX.maxMp();
    if (S.inj) S.inj = Math.max(0, S.inj - (QX.has('yijing') ? 3 : 1));
    const t = QX.tx('住店', { n: L.inn });
    log(t);
    return t;
  }
  function rest() {
    passDays(3);
    S.hp = clamp(S.hp + Math.round(QX.maxHp() * 0.5), 1, QX.maxHp()); S.mp = QX.maxMp();
    const t = QX.tx('打坐');
    log(t);
    return t;
  }
  function work() {
    const n = Math.round(8 + S.st.声望 / 20 + R() * 10);
    passDays(5);
    addSt('银两', n);
    const L = QX.LOCS[S.loc];
    const t = (L.workText ? pick(L.workText) : '') + QX.tx('做工', { n });
    log(t);
    return t;
  }
  function chore() {
    const SC = QX.SECTS[S.sect];
    passDays(10);
    S.contrib++;
    addSt('声望', 1);
    let t = val(SC.chore, G()) || QX.tx('门派差事');
    const need = SC.ranks ? SC.ranks[S.rank + 1] : null;
    if (need && S.contrib >= need.c && S.st.品德 >= (need.de || 0)) {
      S.rank++;
      t += QX.tx('升位', { a: need.name });
      log(QX.tx('升位', { a: need.name }), 'good');
      if (need.ev) S.queue.push(need.ev);
    }
    log(QX.tx('门派差事'));
    return t;
  }
  QX.rankName = () => (S.sect && QX.SECTS[S.sect].ranks ? QX.SECTS[S.sect].ranks[S.rank].name : '');

  /* ---------- 练功 ---------- */
  const need = (lv) => 15 + lv * 12;
  QX.need = need;
  function addArtXp(id, n) {
    const a = S.arts[id], A = QX.ARTS[id];
    let up = false;
    a.xp += n;
    while (a.lv < CFG.maxLv && a.xp >= need(a.lv)) {
      a.xp -= need(a.lv); a.lv++; up = true;
      for (const k in A.grow || {}) addSt(k, A.grow[k]);
      log(QX.tx('升级', { a: A.name, n: a.lv }), 'good');
    }
    if (a.lv >= CFG.maxLv) a.xp = 0;
    return up;
  }
  QX.canPractise = (id) => { const a = S.arts[id]; return !!a && a.lv < CFG.maxLv; };
  QX.practiseRisk = (id, hard) => {
    const A = artDef(id), a = S.arts[id], g = G();
    let risk = (A.risky || 0) + (S.inj ? 0.08 : 0);
    if (hard) risk += 0.1 + a.lv * 0.02 - QX.bestNei() * 0.012;
    if (A.needs && !A.needs(g)) risk += 0.3;
    return clamp(risk, 0, 0.9);
  };
  function practise(id, hard, coach) {
    const A = artDef(id), a = S.arts[id];
    const out = { gain: 0, up: false, hurt: '' };
    if (!a || a.lv >= CFG.maxLv) return out;
    let gain = (9 + QX.eff('资质') * 0.3 + R() * 9) / (A.diff || 1);
    if (hard) gain *= 2;
    if (coach) gain *= coach;
    gain = Math.max(1, Math.round(gain));
    const risk = coach ? 0 : QX.practiseRisk(id, hard);
    if (R() < risk) {
      if (R() < 0.3) {
        a.lv = Math.max(1, a.lv - 1); a.xp = 0; S.hp = 1; S.inj = clamp(S.inj + 3, 0, 9); out.hurt = 'zouhuo'; gain = 0;
        log(QX.tx('走火入魔', { a: A.name }), 'bad');
      } else {
        S.inj = clamp(S.inj + 1, 0, 9); S.hp = Math.max(1, S.hp - Math.round(QX.maxHp() * 0.3)); out.hurt = 'neishang'; gain = Math.round(gain / 2);
        log(QX.tx('内伤', { a: A.name }), 'bad');
      }
    }
    if (gain) out.up = addArtXp(id, gain);
    out.gain = gain;
    if (A.evil) addSt('品德', -1);
    if (!out.hurt && !coach) log(QX.tx('练功', { a: A.name, n: gain }));
    passDays(10);
    return out;
  }
  QX.practise = (id, hard) => {
    if (S.ev || S.fight || S.over || !QX.canPractise(id)) return null;
    const r = practise(id, hard);
    flush();
    QX.save();
    return r;
  };

  /* ---------- 物品 ---------- */
  QX.useItem = (id) => {
    if (S.ev || S.fight || S.over) return null;
    const it = itemDef(id);
    if (!QX.has(id)) return null;
    let t = '';
    if (it.use) {
      useHeal(it.use);
      if (!it.relic) take(id, 1);
      t = QX.tx('用药', { a: it.name });
    } else if (it.teaches) {
      const g = G();
      const list = [].concat(it.teaches);
      const got = [];
      for (const a of list) {
        const A = artDef(a);
        if (QX.artLv(a)) continue;
        if (A.req && !A.req(g)) { t += QX.tx('读不懂', { a: A.name, why: val(A.reqText, g) || '' }); continue; }
        learn(a, 1); got.push(A.name);
      }
      if (got.length) { t = QX.tx('读秘籍', { a: it.name, b: got.join('、') }) + t; if (it.consume) take(id, 1); passDays(5); } else if (!t) t = QX.tx('都会了');
    }
    if (t) log(t);
    flush();
    QX.save();
    return t;
  };
  function useHeal(u) {
    if (u.hp) S.hp = clamp(S.hp + u.hp, 1, QX.maxHp());
    if (u.mp) S.mp = clamp(S.mp + u.mp, 0, QX.maxMp());
    if (u.full) { S.hp = QX.maxHp(); S.mp = QX.maxMp(); }
    if (u.inj) S.inj = Math.max(0, S.inj - u.inj);
  }
  QX.buy = (id) => {
    const it = itemDef(id), L = QX.LOCS[S.loc];
    if (!L.shop || !L.shop.includes(id) || S.ev || S.fight) return null;
    if (S.st.银两 < it.price) return QX.tx('银两不够', { n: it.price });
    if (it.teaches && QX.has(id)) return QX.tx('已有');
    addSt('银两', -it.price);
    give(id, 1);
    QX.save();
    return QX.tx('买下', { a: it.name, n: it.price });
  };
  QX.dismiss = (pid) => { if (S.ev || S.fight) return; leaveParty(pid, QX.tx('送别', { a: QX.PEOPLE[pid].name })); QX.save(); };

  /* ---------- 地图、行走 ---------- */
  function dist(a, b) { const A = QX.LOCS[a], B = QX.LOCS[b]; return Math.hypot(A.x - B.x, A.y - B.y); }
  function landDays(a, b) { return Math.max(2, Math.round(dist(a, b) * 0.9 / (1 + QX.eff('轻功') / 120))); }
  QX.route = (to) => {
    const A = QX.LOCS[S.loc], B = QX.LOCS[to];
    if (!B || to === S.loc) return null;
    let days = 0, cost = 0, why = '';
    if (B.sea && A.sea) days = Math.round(dist(S.loc, to) * 0.6);
    else if (B.sea) { days = (S.loc === B.port ? 0 : landDays(S.loc, B.port)) + Math.round(dist(B.port, to) * 0.6); }
    else if (A.sea) { days = Math.round(dist(S.loc, A.port) * 0.6) + (to === A.port ? 0 : landDays(A.port, to)); }
    else days = landDays(S.loc, to);
    days = Math.max(2, days);
    if (B.sea) {
      cost = B.fare || 0;
      if (B.needs && !QX.has(B.needs)) why = QX.tx('要海图', { a: itemDef(B.needs).name });
      else if (S.st.银两 < cost) why = QX.tx('船钱不够', { n: cost });
    }
    return { to, days, cost, why };
  };
  QX.travel = (to) => {
    if (S.ev || S.fight || S.over) return null;
    const r = QX.route(to);
    if (!r || r.why) return r ? r.why : null;
    if (r.cost) addSt('银两', -r.cost);
    const from = S.loc;
    S.loc = to;
    log(QX.tx('上路', { a: QX.LOCS[from].name, b: QX.LOCS[to].name, n: r.days }), 'move');
    passDays(r.days);
    if (S.over) { QX.save(); return null; }
    // 路上的遭遇：路越长越容易碰上
    if (R() < clamp(0.08 + r.days * 0.012, 0, 0.45)) {
      const g = G(), pool = [];
      for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if (E.road && evAvailable(E, g)) pool.push([id, val(E.w, g) || 1]); }
      if (pool.length) {
        let tot = pool.reduce((s, x) => s + x[1], 0), x = R() * tot;
        for (const [id, w] of pool) { x -= w; if (x <= 0) { S.queue.push(id); break; } }
      }
    }
    arrive(to);
    flush();
    QX.save();
    return null;
  };

  /* ---------- 战斗 ---------- */
  function tierOf() { // 玩家大致的强弱（路上的对手按这个挑）
    const p = QX.maxHp() / 12 + QX.eff('攻击') + bestAttackPow();
    return p;
  }
  QX.power = tierOf;
  function bestAttackPow() { let b = 0; for (const id in S.arts) { const A = QX.ARTS[id]; if (A && A.pow) b = Math.max(b, A.pow * S.arts[id].lv); } return b; }
  function scaleFoe(E) { // 带 scale 的对手按玩家强弱伸缩（路上的强盗不会一直那么弱或那么强）
    if (!E.scale) return 1;
    const p = tierOf();
    return clamp(p / E.scale, 0.7, 3);
  }
  function mkFoe(f) {
    const id = typeof f === 'string' ? f : f.id;
    const E = QX.ENEMIES[id];
    if (!E) throw new Error('未知对手 ' + id);
    const k = scaleFoe(E) * ((f && f.k) || 1);
    const hp = Math.round(E.hp * k);
    return { id, name: (f && f.name) || E.name, hp, max: hp, mp: E.mp || 0, atk: Math.round(E.atk * Math.sqrt(k)), def: Math.round(E.def * Math.sqrt(k)), agi: E.agi || 10,
      moves: E.moves, side: 'foe', st: {}, xp: Math.round((E.xp || 5) * k), silver: E.silver || [0, 0], drops: E.drops || [], pid: E.pid || '' };
  }
  function mkMe() {
    return { id: 'me', name: S.name, hp: S.hp, max: QX.maxHp(), mp: S.mp, maxMp: QX.maxMp(), atk: QX.eff('攻击'), def: QX.eff('防御'), agi: QX.eff('轻功'), side: 'me', st: {} };
  }
  function mkComp(pid) {
    const C = QX.PEOPLE[pid].comp.st;
    const grow = 0.7 + clamp(S.day / 1800, 0, 1) * 0.8;
    const hp = Math.round(C.hp * grow);
    return { id: pid, name: QX.PEOPLE[pid].name, hp, max: hp, mp: 999, atk: Math.round(C.atk * grow), def: Math.round(C.def * grow), agi: C.agi, moves: C.moves, side: 'ally', st: {} };
  }
  function startFight(F, after) {
    S.fights++;
    const foes = F.foes.map(mkFoe);
    const allies = [mkMe()].concat(F.solo ? [] : S.party.map(mkComp));
    S.fight = { foes, allies, round: 1, lines: [], noFlee: !!F.noFlee, after, auto: false, target: 0, mode: (F.lose && F.lose.mode) || 'injury', maxRound: F.rounds || 40 };
    S.fight.lines.push(QX.tx('开打', { a: foes.map((x) => x.name).join('、') }));
  }
  QX.startFight = (F) => { startFight(F, null); QX.save(); }; // 工具用
  function meMove(id) {
    const A = QX.ARTS[id], lv = QX.artLv(id);
    let mv = null;
    for (const m of A.moves || []) if (lv >= m[0]) mv = m;
    if (!mv) mv = (A.moves || [[1, A.name, 1]])[0];
    const cost = Math.round((A.mp || 0) * (1 + lv * 0.1));
    return { name: mv[1], mult: mv[2], cost };
  }
  QX.fightOptions = () => {
    const F = S.fight; if (!F) return [];
    const me = F.allies[0], out = [];
    const ids = Object.keys(S.arts).filter((id) => QX.ARTS[id] && QX.ARTS[id].pow);
    for (const id of ids) {
      const A = QX.ARTS[id], mv = meMove(id);
      let dis = me.mp < mv.cost ? QX.tx('内力不足') : '';
      if (A.item && !QX.has(A.item)) dis = QX.tx('缺少', { a: itemDef(A.item).name });
      out.push({ k: 'art', id, label: A.name, sub: mv.name, cost: mv.cost, dis });
    }
    out.push({ k: 'fist', label: QX.tx('拳脚'), sub: QX.tx('不耗内力'), cost: 0, dis: '' });
    out.push({ k: 'yun', label: QX.tx('运功'), sub: QX.tx('回内力'), cost: 0, dis: '' });
    for (const id in S.items) { const it = QX.ITEMS[id]; if (it && it.use && it.combat !== false && S.items[id] > 0) out.push({ k: 'item', id, label: it.name, sub: '×' + S.items[id], cost: 0, dis: '' }); }
    if (!F.noFlee) out.push({ k: 'flee', label: QX.tx('逃走'), sub: QX.tx('成功率', { p: Math.round(fleeChance() * 100) }), cost: 0, dis: '' });
    return out;
  };
  function fleeChance() { const F = S.fight, foes = F.foes.filter((x) => x.hp > 0); const agi = foes.reduce((s, x) => s + x.agi, 0) / Math.max(1, foes.length); return clamp(0.45 + (QX.eff('轻功') - agi) * 0.012, 0.1, 0.9); }
  QX.aiOption = () => { // 自动：挑伤害最大、内力够用的招；内力不够就运功；快死了吃药
    const F = S.fight, me = F.allies[0], opts = QX.fightOptions();
    if (me.hp < me.max * 0.3) { const med = opts.find((o) => o.k === 'item' && QX.ITEMS[o.id].use.hp); if (med) return med; }
    let best = null, bv = -1;
    for (const o of opts) {
      if (o.dis || (o.k !== 'art' && o.k !== 'fist')) continue;
      const v = o.k === 'fist' ? QX.eff('攻击') * 0.8 : (QX.eff('攻击') + QX.ARTS[o.id].pow * QX.artLv(o.id) * (1 + QX.bestNei() * 0.06)) * meMove(o.id).mult;
      if (v > bv) { bv = v; best = o; }
    }
    if (best && best.k === 'fist' && me.mp < me.maxMp * 0.4 && opts.some((o) => o.k === 'art')) return opts.find((o) => o.k === 'yun');
    return best || opts.find((o) => o.k === 'yun');
  };
  function dmgCalc(att, def, pow, mult) {
    const dodge = clamp(0.05 + (def.agi - att.agi) * 0.006, 0.03, 0.3);
    if (R() < dodge) return -1;
    const raw = (att.atk + pow) * mult * (0.85 + R() * 0.3);
    return Math.max(1, Math.round(raw - def.def * 0.7));
  }
  function line(t) { S.fight.lines.push(t); if (S.fight.lines.length > 60) S.fight.lines.splice(0, S.fight.lines.length - 60); }
  function strike(att, tgt, moveName, pow, mult, sp) {
    let d = dmgCalc(att, tgt, pow, mult);
    if (d < 0) { line(QX.tx('落空', { a: att.name, m: moveName, t: tgt.name })); return 0; }
    if (sp === 'crit' && R() < 0.3) { d = Math.round(d * 1.8); line(QX.tx('重手')); }
    if (sp === 'taiji') d = Math.round(d + tgt.atk * 0.5);
    // 乾坤大挪移：玩家挨打时有机会把劲力挪回去
    if (tgt.id === 'me') {
      const rf = special('reflect');
      if (rf && R() < clamp(rf / 100, 0, 0.4)) { const back = Math.round(d * 0.6); att.hp -= back; line(QX.tx('挪移', { a: att.name, n: back })); d = Math.round(d * 0.4); }
    }
    tgt.hp -= d;
    line(QX.tx('出招', { a: att.name, m: moveName, t: tgt.name, n: d }) + (tgt.hp <= 0 ? QX.tx('倒下', { t: tgt.name }) : ''));
    if (sp === 'freeze' && tgt.hp > 0 && R() < 0.3) { tgt.st.frozen = 1; line(QX.tx('冻住', { t: tgt.name })); }
    if (sp === 'poison' && tgt.hp > 0) { tgt.st.poison = Math.max(tgt.st.poison || 0, 3); }
    if (sp === 'drain') { att.hp = Math.min(att.max, att.hp + Math.round(d * 0.3)); }
    if (sp === 'self') { const back = Math.round(att.max * 0.04); att.hp = Math.max(1, att.hp - back); line(QX.tx('反伤', { a: att.name, n: back })); }
    return d;
  }
  function alive(arr) { return arr.filter((x) => x.hp > 0); }
  function tickStatus(u) {
    if (u.st.poison && u.hp > 0) { const n = Math.max(1, Math.round(u.max * 0.05)); u.hp -= n; u.st.poison--; line(QX.tx('毒发', { t: u.name, n })); }
  }
  QX.fightAct = (opt) => {
    const F = S.fight; if (!F || !opt) return;
    const me = F.allies[0];
    const foes = alive(F.foes);
    let tgt = F.foes[F.target] && F.foes[F.target].hp > 0 ? F.foes[F.target] : foes[0];
    // 玩家
    if (me.st.frozen) { me.st.frozen = 0; line(QX.tx('被冻', { a: me.name })); }
    else if (opt.k === 'art') {
      const A = QX.ARTS[opt.id], mv = meMove(opt.id);
      if (me.mp < mv.cost) return;
      me.mp -= mv.cost;
      const pow = A.pow * QX.artLv(opt.id) * (1 + QX.bestNei() * 0.06);
      strike(me, tgt, A.name + '·' + mv.name, pow, mv.mult, A.sp);
      if (A.aoe) for (const o of alive(F.foes)) if (o !== tgt) strike(me, o, mv.name, pow * 0.5, mv.mult, A.sp);
    } else if (opt.k === 'fist') strike(me, tgt, QX.tx('拳脚'), 0, 1, '');
    else if (opt.k === 'yun') {
      const n = Math.round(12 + me.maxMp * 0.3 + QX.bestNei() * 3);
      me.mp = Math.min(me.maxMp, me.mp + n);
      line(QX.tx('运功回气', { a: me.name, n }));
    } else if (opt.k === 'item') {
      const it = QX.ITEMS[opt.id];
      take(opt.id, 1);
      if (it.use.hp) me.hp = Math.min(me.max, me.hp + it.use.hp);
      if (it.use.mp) me.mp = Math.min(me.maxMp, me.mp + it.use.mp);
      if (it.use.full) { me.hp = me.max; me.mp = me.maxMp; }
      line(QX.tx('服药', { a: me.name, b: it.name }));
    } else if (opt.k === 'flee') {
      if (R() < fleeChance()) { line(QX.tx('逃脱')); return endFight('flee'); }
      line(QX.tx('没逃掉'));
    }
    // 九阳护体
    const rg = special('regen');
    if (rg && me.hp > 0) me.hp = Math.min(me.max, me.hp + Math.round(me.max * rg / 200));
    if (!alive(F.foes).length) return endFight('win');
    // 同伴
    for (const a of F.allies.slice(1)) {
      if (a.hp <= 0) continue;
      const t = pick(alive(F.foes)); if (!t) break;
      const mv = pick(a.moves);
      strike(a, t, mv[0], 0, mv[1], mv[2]);
      if (!alive(F.foes).length) return endFight('win');
    }
    // 对手
    for (const e of alive(F.foes)) {
      tickStatus(e);
      if (e.hp <= 0) { line(QX.tx('倒下', { t: e.name })); continue; }
      if (e.st.frozen) { e.st.frozen = 0; line(QX.tx('被冻', { a: e.name })); continue; }
      const al = alive(F.allies); if (!al.length) break;
      const t = al[0].id === 'me' && R() < 0.55 ? al[0] : pick(al);
      const mv = pick(e.moves);
      strike(e, t, mv[0], 0, mv[1], mv[2]);
      if (me.hp <= 0) break;
    }
    tickStatus(me);
    if (!F.foes[F.target] || F.foes[F.target].hp <= 0) { const k = F.foes.findIndex((x) => x.hp > 0); if (k >= 0) F.target = k; }
    if (!alive(F.foes).length) return endFight('win');
    if (me.hp <= 0) return endFight('lose');
    F.round++;
    if (F.round > F.maxRound) { line(QX.tx('罢手')); return endFight('draw'); }
    QX.save();
  };
  QX.fightTarget = (i) => { if (S.fight && S.fight.foes[i] && S.fight.foes[i].hp > 0) S.fight.target = i; };
  QX.fightAuto = (on) => { if (S.fight) S.fight.auto = on === undefined ? !S.fight.auto : !!on; };
  function endFight(res) {
    const F = S.fight, me = F.allies[0];
    S.hp = clamp(me.hp, 1, QX.maxHp()); S.mp = clamp(me.mp, 0, QX.maxMp());
    F.result = res;
    let xp = 0, silver = 0;
    if (res === 'win') {
      S.wins++;
      for (const e of F.foes) { xp += e.xp; silver += Math.round(e.silver[0] + R() * (e.silver[1] - e.silver[0])); }
      S.xp += xp; addSt('银两', silver);
      for (const e of F.foes) for (const d of e.drops) if (R() < d[1]) give(d[0], 1);
      line(QX.tx('赢了', { n: xp, s: silver }));
    }
    F.xp = xp; F.silver = silver;
    QX.save();
  }
  // 战斗结束后点“继续”：回到事件，按胜负结算
  QX.fightDone = () => {
    const F = S.fight; if (!F || !F.result) return;
    S.fight = null;
    const after = F.after;
    const E = after && after.ev ? eventDef(after.ev) : null;
    const c = E ? E.choices[after.ci] : null;
    const fight = c ? c.fight : {};
    if (F.result === 'win') applyBranch(fight.win || {}, null, null);
    else if (F.result === 'flee' || F.result === 'draw') applyBranch(fight.flee || { res: QX.tx(F.result === 'flee' ? '逃了' : '不了了之') }, null, null);
    else {
      const mode = F.mode;
      if (mode === 'death') { const g = G(); S.over = { kind: 'dead', text: val((fight.lose && fight.lose.res) || QX.tx('战死'), g), day: S.day }; S.ev = null; QX.save(); return; }
      S.hp = Math.max(1, Math.round(QX.maxHp() * 0.2)); S.inj = clamp(S.inj + 2, 0, 9);
      const lost = Math.round(S.st.银两 * 0.3); addSt('银两', -lost);
      S.pend += 7;
      log(QX.tx('败了', { n: lost }), 'bad');
      applyBranch(fight.lose || { res: QX.tx('败了', { n: lost }) }, null, null);
    }
    if (S.ev && !S.ev.res && !S.ev.choices.length) S.ev.res = QX.tx('战罢');
    QX.save();
  };

  /* ---------- 结局 ---------- */
  QX.canRetire = () => S.relics.length >= CFG.relicsAll || S.day >= dv(CFG.retireFrom[0], CFG.retireFrom[1]);
  function finish(why) {
    const g = G();
    const kind = S.st.品德 >= 50 ? 'xia' : 'mo';
    const end = QX.ENDINGS.find((e) => e.kind === kind && (!e.cond || e.cond(g))) || { t: kind, text: '' };
    S.ev = null; S.fight = null; S.queue = [];
    S.over = { kind, why, id: end.id, title: val(end.t, g), text: val(end.text, g), day: S.day, relics: S.relics.length };
    log(S.over.title, 'end');
  }
  QX.finish = finish;

  /* ---------- 存档 ---------- */
  function readAll() { try { return JSON.parse(localStorage.getItem(CFG.key)) || {}; } catch (e) { return {}; } }
  function writeAll(o) { try { localStorage.setItem(CFG.key, JSON.stringify(o)); } catch (e) { /* 存储不可用 */ } }
  QX.save = () => { if (!S || QX.noSave) return; const o = readAll(); o.auto = S; o.autoAt = Date.now(); writeAll(o); };
  QX.saveManual = () => { if (!S) return; const o = readAll(); o.manual = JSON.parse(JSON.stringify(S)); o.manualAt = Date.now(); writeAll(o); };
  QX.slots = () => { const o = readAll(); return { auto: o.auto ? summary(o.auto, o.autoAt) : null, manual: o.manual ? summary(o.manual, o.manualAt) : null }; };
  function summary(s, at) { return { name: s.name, day: s.day, loc: s.loc, relics: (s.relics || []).length, over: !!s.over, at }; }
  QX.load = (slot) => { const o = readAll(); const s = o[slot || 'auto']; if (!s || s.v !== 1) return false; S = JSON.parse(JSON.stringify(s)); if (!CFG.companions) S.party = []; if (slot === 'manual') QX.save(); return true; };
  QX.clearAuto = () => { const o = readAll(); delete o.auto; writeAll(o); S = null; };

  /* ---------- 给检查工具用 ---------- */
  QX._internal = { passDays, startEvent, flush, arrive, dv, practise, joinBlock };
})();

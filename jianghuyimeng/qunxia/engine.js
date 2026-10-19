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
  QX.GEAR = {}; QX.GOODS = {};
  QX.addGear = into(QX.GEAR);   // 装备：{ id: { name, slot: 兵器 | 护身 | 鞋, tier: 1–3, price, bonus: { 属性: n }, dur, d } }
  QX.addGoods = into(QX.GOODS); // 货物：{ id: { name, buy: { 地点: 价 }, sell: { 地点: 价 }, d } }
  // 给已有的地点补字段（smith 铁匠、bank 钱庄、escort 镖局、black 黑市……），按地点 id 合并
  QX.extendLocs = (o) => Object.keys(o).forEach((id) => { if (!QX.LOCS[id]) { QX.DUP.push('extendLocs:' + id + '（地点不存在）'); return; } Object.assign(QX.LOCS[id], o[id]); });
  QX.addEnemies = into(QX.ENEMIES);
  QX.addSects = into(QX.SECTS);
  QX.addFlags = (o) => Object.assign(QX.FLAGS, o);
  QX.addText = (o) => Object.assign(QX.TXT, o);
  QX.addEvents = (arr) => arr.forEach((e) => { if (QX.EVENTS[e.id]) QX.DUP.push(e.id); QX.EVENTS[e.id] = e; });
  QX.addTimeline = (arr) => arr.forEach((t) => QX.TIMELINE.push(t));
  QX.addOrigins = (arr) => arr.forEach((o) => QX.ORIGINS.push(o));
  // 给已有的人物补上说话的内容（mood、likes、thanks、chats、topics……），按人物 id 合并；topics 接在后面
  QX.addTalk = (o) => Object.keys(o).forEach((pid) => {
    const P = QX.PEOPLE[pid];
    if (!P) { QX.DUP.push('addTalk:' + pid + '（人物不存在）'); return; }
    const x = o[pid];
    for (const k in x) if (k === 'topics') P.topics = (P.topics || []).concat(x.topics); else P[k] = x[k];
  });
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
  // 传闻。o 可以带 loc（在哪儿，界面上有“去看看”）、cred（确凿 / 听说 / 谣言）、from / to（什么时候，日子）、id
  function news(t, o) { if (!t) return; S.news.push(Object.assign({ d: S.day, t }, o || {})); if (S.news.length > 80) S.news.splice(0, S.news.length - 80); }
  function addSt(k, n) {
    if (!(k in S.st)) throw new Error('未知属性 ' + k);
    const r = RANGE[k] || [0, 999];
    const v0 = S.st[k];
    S.st[k] = clamp(Math.round((S.st[k] + n) * 10) / 10, r[0], r[1]);
    // 银两的进出记账（试玩脚本看收入、花销、被抢了多少）：rob() 里扣的算被抢
    if (k === '银两') { const d = S.st[k] - v0; S.acct = S.acct || { earn: 0, spend: 0, lost: 0 }; if (d > 0) S.acct.earn += d; else if (d < 0) S.acct[robbing ? 'lost' : 'spend'] -= d; }
  }
  /* 被抢：身上的钱最多被抢走 ROB_PCT、不超过 ROB_CAP 两（存在钱庄里的抢不走）。frac、cap 可以按剧情写得更狠 */
  const ROB_PCT = 0.15, ROB_CAP = 50;
  let robbing = false;
  function rob(frac, cap) {
    const n = Math.min(Math.round(S.st.银两 * (frac == null ? ROB_PCT : frac)), cap == null ? ROB_CAP : cap);
    robbing = true; addSt('银两', -n); robbing = false;
    return n;
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
    // 装备：磨损到头（wear >= dur）只剩一半的用处，要找铁匠修
    for (const slot in S.gear || {}) { const x = S.gear[slot], Gd = x && QX.GEAR[x.id]; if (Gd && Gd.bonus && Gd.bonus[k]) v += Gd.bonus[k] * (x.wear >= gearDur(Gd) ? 0.5 : 1); }
    if (k === '攻击' && S.inj) v *= 1 - INJ_HIT * S.inj; // 带着内伤，出手就没那么重
    return Math.round(v);
  };
  /* 内伤：每层攻击、内力上限各降 6%。自己慢慢只能好到 SELF_HEAL 层，剩下的要靠药、医馆、名医。
   * 经脉受损（S.mer）：走火入魔留下的，内力上限再降两成，要找高人或奇药才能治。 */
  const INJ_HIT = 0.06, SELF_HEAL = 2, HARD_MAX_INJ = 3;
  QX.INJ = { hit: INJ_HIT, self: SELF_HEAL, hardMax: HARD_MAX_INJ };
  QX.maxHp = () => Math.round(60 + QX.eff('根骨') * 3 + S.xp / 8 + QX.bestNei() * 6);
  QX.maxMp = () => Math.round((10 + QX.eff('内力') * 2 + QX.bestNei() * 4) * (1 - INJ_HIT * S.inj) * (S.mer ? 0.8 : 1));
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
    // 走动的人：roam: { locs, every: 天数, from, to, cond }，每隔一段日子换一处（按人和日子算，同一天总在同一处）
    const W = P.roam;
    if (W && !(W.from && S.day < dv(W.from[0], W.from[1])) && !(W.to && S.day >= dv(W.to[0], W.to[1] + 1)) && (!W.cond || W.cond(g))) {
      const k = Math.floor(S.day / (W.every || 60));
      let h = 7;
      for (const c of pid + ':' + k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      return W.locs[h % W.locs.length];
    }
    return null;
  };
  QX.peopleHere = () => Object.keys(QX.PEOPLE).filter((p) => QX.where(p) === S.loc);

  /* ---------- 好感 ----------
   * 每个人对你有一个好感（0–100，不显示数字），分四档：敌（只能告辞）、生（问路、问传闻）、熟（问人、问武功、请教）、信（托付、送东西）。
   * 起点 = 35 + 人物的 aff0 + 门派之间的亲疏（QX.addSectRel；同门 +25）+ 正派的人看你的品德 + 声望（最多 +15）；
   * 替王府办过事，正派的人少 10、王府的人多 15。之后的增减（深谈、送礼、剧情里 g.like）记在 S.aff。 */
  QX.SECT_REL = {}; QX.UPRIGHT = [];
  QX.addSectRel = (o) => Object.assign(QX.SECT_REL, o);
  const AFF_TIERS = [['敌', 0], ['生', 15], ['熟', 45], ['信', 75]];
  const tierRank = (t) => ['敌', '生', '熟', '信'].indexOf(t);
  QX.tierRank = tierRank;
  function sideRel(a, b) { if (!a || !b) return 0; if (a === b) return 25; return (QX.SECT_REL[a] && QX.SECT_REL[a][b]) || (QX.SECT_REL[b] && QX.SECT_REL[b][a]) || 0; }
  function affBase(pid) {
    const P = personDef(pid);
    let v = 35 + (P.aff0 || 0) + sideRel(S.sect, P.side);
    const up = QX.UPRIGHT.includes(P.side);
    if (up) v += (S.st.品德 - 50) / 4;
    if (S.flags.servedWang) v += up ? -10 : P.side === 'wangfu' ? 15 : 0;
    return v + Math.min(15, S.st.声望 / 8);
  }
  QX.aff = (pid) => clamp(Math.round(affBase(pid) + ((S.aff || {})[pid] || 0)), 0, 100);
  QX.affTier = (pid) => { const v = QX.aff(pid); let r = '敌'; for (const [k, n] of AFF_TIERS) if (v >= n) r = k; return r; };
  function like(pid, n) { personDef(pid); S.aff = S.aff || {}; const t0 = QX.affTier(pid); S.aff[pid] = (S.aff[pid] || 0) + n; const t1 = QX.affTier(pid); if (t0 !== t1) log(QX.tx(tierRank(t1) > tierRank(t0) ? '态度近了' : '态度远了', { a: QX.PEOPLE[pid].name, t: t1 }), tierRank(t1) > tierRank(t0) ? 'good' : 'bad'); }
  QX.mood = (pid) => { const P = personDef(pid), tr = QX.affTier(pid); return val((P.mood || {})[tr], G()) || QX.tx('态度' + tr, { a: P.name }); };

  /* ---------- 托付与差遣 ----------
   * g.task(id, 文字) 记下别人托你的事，g.taskDone(id) 办完。g.errand(id, 地点, 天数, 文字) 是门派派的差事：
   * 限期内到那个地点，写着 errand: id 的事件会自动发生；过了期就算误了，门派贡献 -1。 */
  function task(id, o) { S.tasks = S.tasks || {}; S.tasks[id] = Object.assign({ d: S.day }, typeof o === 'string' ? { t: o } : o); }
  function taskDone(id, t) { if (S.tasks && S.tasks[id]) { delete S.tasks[id]; if (t) log(t, 'good'); } }
  function expireTasks() {
    for (const id in S.tasks || {}) {
      const T = S.tasks[id];
      if (T.until == null || S.day <= T.until) continue;
      if (T.kind === 'escort') { escortLose(QX.tx('镖误期', { n: Math.round(T.pay / 2) })); S.flags['late_' + id] = true; continue; }
      delete S.tasks[id];
      S.flags['late_' + id] = true;
      if (T.kind === 'errand' && T.sect && T.sect === S.sect) S.contrib = Math.max(0, S.contrib - 1);
      log(QX.tx('误期', { t: T.t }), 'bad');
    }
  }

  /* ---------- g：给数据文件用的接口 ---------- */
  function G() {
    const d = QX.date(S.day);
    const g = {
      S, y: d.y, m: d.m, day: S.day, age: QX.age(), loc: S.loc, sex: S.sex, name: S.name, sect: S.sect, rank: S.rank,
      after: (y, m, dd) => S.day >= dv(y, m, dd), before: (y, m, dd) => S.day < dv(y, m, dd),
      st: (k) => QX.eff(k), base: (k) => S.st[k], add: (k, n) => addSt(k, n),
      f: (k) => S.flags[k], set: (k, v) => { if (!QX.FLAGS[k]) QX.FLAGS_UNKNOWN[k] = true; S.flags[k] = v === undefined ? true : v; }, unset: (k) => { delete S.flags[k]; },
      has: (id) => { itemDef(id); return QX.has(id); }, give, take, relics: () => S.relics.length,
      rob: (frac, cap) => rob(frac, cap), escortLose: (t) => escortLose(t), escorting: () => !!(S.tasks && S.tasks.escort),
      gear: (slot) => (S.gear && S.gear[slot] ? S.gear[slot].id : ''), bankMoney: () => S.bank || 0,
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
      mer: () => !!S.mer, cureMer: (t) => cureMer(t),
      like: (p, n) => like(p, n), aff: (p) => { personDef(p); return QX.aff(p); }, tier: (p) => { personDef(p); return QX.affTier(p); },
      atLeast: (p, t) => { personDef(p); return tierRank(QX.affTier(p)) >= tierRank(t); },
      task: (id, o) => task(id, o), taskDone: (id, t) => taskDone(id, t), hasTask: (id) => !!(S.tasks && S.tasks[id]),
      errand: (id, loc, days, t) => { if (!QX.LOCS[loc]) throw new Error('未知地点 ' + loc); task(id, { t, loc, until: S.day + days, kind: 'errand', sect: S.sect }); },
      addContrib: (n) => { S.contrib = Math.max(0, S.contrib + n); },
      breakGate: (id, how) => { artDef(id); return breakGate(id, how); },
      rumor: (t, o) => { news(t, Object.assign({ cred: '听说' }, o || {})); log(t, 'news'); },
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

  /* 判定：check: ['属性', 档位或数值, 加成]。档位（易、中、难、极难）按 QX.CHECKS 的表换成这个属性的数值，
   * 属性正好等于档位数值时成功率 50%，每差 1 点按表里的 step 增减。写数值的照旧按每点 3%。
   * 第三项是剧情里写定的加成（例如这个选项要花内力或银两，把握更大）。 */
  QX.CHECKS = {};
  QX.addChecks = (o) => Object.assign(QX.CHECKS, o);
  QX.TIERS = ['易', '中', '难', '极难'];
  function dcOf(chk) {
    const T = QX.CHECKS[chk[0]];
    if (typeof chk[1] === 'string') { if (!T || T[chk[1]] == null) throw new Error('判定档位不存在 ' + chk[0] + ' ' + chk[1]); return { dc: T[chk[1]], step: T.step }; }
    return { dc: chk[1], step: 3 };
  }
  function chance(chk) {
    const d = dcOf(chk);
    return clamp(Math.round(50 + (QX.eff(chk[0]) - d.dc) * d.step + (chk[2] || 0)), 5, 95);
  }
  QX.chance = chance;
  // 此刻这个属性大致在哪一档（界面上写在属性旁边）
  QX.tierOf = (k) => {
    const T = QX.CHECKS[k]; if (!T) return '';
    const v = QX.eff(k);
    let got = '';
    for (const x of QX.TIERS) if (v >= T[x]) got = x;
    return got;
  };
  // 门槛：need: ['品德', 50] 是 50 以上才能选，['品德', '<', 30] 是 30 以下才能选。不够时选项灰掉
  function needOk(c) {
    if (!c.need) return '';
    const k = c.need[0], low = c.need[1] === '<', n = low ? c.need[2] : c.need[1], v = QX.eff(k);
    if (low ? v < n : v >= n) return '';
    return QX.tx(low ? '门槛以下' : '门槛以上', { k, n });
  }
  const needText = (c) => (c.need ? QX.tx(c.need[1] === '<' ? '门槛以下' : '门槛以上', { k: c.need[0], n: c.need[1] === '<' ? c.need[2] : c.need[1] }) : '');

  /* ---------- 新游戏 ---------- */
  QX.newGame = (o) => {
    const org = QX.ORIGINS.find((x) => x.id === o.origin) || QX.ORIGINS[0];
    const sect = o.sect && QX.SECTS[o.sect] ? o.sect : '';
    S = {
      v: SAVE_V, name: (o.name || '').trim().slice(0, 8) || QX.tx('无名'), sex: o.sex === '女' ? '女' : '男', origin: org.id, sect: '', rank: 0, contrib: 0,
      day: 0, loc: org.loc, pend: 0,
      st: { 资质: 45, 根骨: 12, 内力: 6, 攻击: 10, 防御: 6, 轻功: 10, 品德: 50, 声望: 0, 银两: 20 },
      hp: 1, mp: 0, inj: 0, xp: 0, gear: {}, bank: 0, cargo: {}, tasks: {}, acct: { earn: 0, spend: 0, lost: 0 }, arts: {}, items: {}, relics: [], party: [], comp: {}, flags: {}, met: {}, dead: {}, holder: {}, done: {}, tl: {},
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
    // 路上、日常慢慢恢复；内伤一个月好一层，但自己只能好到两层
    S.hp = clamp(S.hp + Math.round(QX.maxHp() * 0.03 * n * (S.inj ? 0.4 : 1)), 1, QX.maxHp());
    S.mp = clamp(S.mp + Math.round(QX.maxMp() * 0.05 * n), 0, QX.maxMp());
    S.injT = (S.injT || 0) + n;
    while (S.injT >= 30) { S.injT -= 30; if (S.inj > SELF_HEAL) S.inj--; }
    expireTasks();
    timeline();
    if (!S.over && S.day >= END_DAY()) finish('deadline');
  }
  /* 风声：大势写了 rumor: { d: 提前几天, t: 文字 }，到了日子就先放出一条带地点的传闻，玩家可以提前赶去。
   * 打听（客店里花钱）可以把还没到日子的风声提前问出来。 */
  function rumor(T, early) {
    S.rum = S.rum || {};
    if (S.rum[T.id] || !T.rumor) return false;
    const st = dv(T.at[0], T.at[1], T.at[2]);
    S.rum[T.id] = 1;
    const t = val(T.rumor.t, G());
    news(t, { loc: T.loc || '', cred: T.rumor.cred || '确凿', from: st, to: st + (T.win || 0), id: T.id });
    log((early ? QX.tx('打听到') : '') + t, 'news');
    return true;
  }
  QX.upcoming = () => QX.TIMELINE.filter((T) => T.rumor && !S.tl[T.id] && !(S.rum && S.rum[T.id]) && S.day < dv(T.at[0], T.at[1], T.at[2]))
    .sort((a, b) => dv(a.at[0], a.at[1], a.at[2]) - dv(b.at[0], b.at[1], b.at[2]));
  function timeline() {
    const g = G();
    for (const T of QX.TIMELINE) {
      if (S.tl[T.id]) continue;
      const st = dv(T.at[0], T.at[1], T.at[2]), en = st + (T.win || 0);
      if (T.rumor && S.day >= st - T.rumor.d && S.day < st) rumor(T);
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
    // 人跟着大势走：上回在这里见过的人，这回不在了，就记一句他去了哪里（江湖上传得开的才知道）
    S.lastAt = S.lastAt || {};
    for (const pid in S.lastAt) {
      if (S.lastAt[pid] !== loc) continue;
      const w = QX.where(pid);
      if (w === loc) continue;
      const P = QX.PEOPLE[pid];
      log(S.dead[pid] ? QX.tx('人已故', { a: P.name }) : w && w !== 'party' ? QX.tx('人去了', { a: P.name, b: QX.LOCS[w].short }) : QX.tx('人不在', { a: P.name }), 'news');
      delete S.lastAt[pid];
    }
    for (const pid of QX.peopleHere()) if (S.met[pid]) S.lastAt[pid] = loc;
    // 差遣：限期内到了差事要去的地方
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (!E.errand) continue;
      const T = S.tasks && S.tasks[E.errand];
      if (!T || T.loc !== loc || !evAvailable(E, g) || S.queue.includes(id)) continue;
      S.queue.push(id);
    }
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
    if (c.cost.内力 && S.mp < c.cost.内力) return QX.tx('内力不够', { n: c.cost.内力 });
    if (c.cost.item && !QX.has(c.cost.item)) return QX.tx('缺少', { a: itemDef(c.cost.item).name });
    return '';
  }
  function payCost(c) {
    if (!c.cost) return;
    if (c.cost.银两) addSt('银两', -c.cost.银两);
    if (c.cost.内力) S.mp = clamp(S.mp - c.cost.内力, 0, QX.maxMp());
    if (c.cost.item) take(c.cost.item, 1);
  }
  const costText = (c) => (c.cost ? [c.cost.银两 ? QX.tx('花银两', { n: c.cost.银两 }) : '', c.cost.内力 ? QX.tx('花内力', { n: c.cost.内力 }) : ''].filter(Boolean).join(' · ') : '');
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
      ch.push({ t: val(c.t, g), a: { k: 'c', i }, tag: c.tag || '', dis: costOk(c) || needOk(c), fight: !!f, deadly: !!(f && f.lose && f.lose.mode === 'death'),
        p: c.check ? chance(c.check) : null, ck: c.check ? c.check[0] : '', lv: c.check && typeof c.check[1] === 'string' ? c.check[1] : '',
        need: needText(c), cost: costText(c) });
    });
    S.ev = { id, title: val(E.t, g) || '', text: val(E.text, g) || '', who: E.who || '', choices: ch, res: null };
    if (!ch.length) S.ev.res = '';
    settle();
  }
  function resolveChoice(i) {
    const E = eventDef(S.ev.id), c = E.choices[i], g = G();
    if (costOk(c) || needOk(c)) return;
    payCost(c);
    S.ev.picked = val(c.t, g);
    if (c.fight) { startFight(c.fight, { ev: S.ev.id, ci: i }); return; }
    let br = c, roll = null;
    if (c.check) {
      const p = chance(c.check), x = R() * 100, ok = x < p;
      // 大成功：掷出的数比成功率的五分之一还小，而且这个选项写了 great
      const great = ok && c.great && x < p / 5;
      roll = { k: c.check[0], p, ok, lv: typeof c.check[1] === 'string' ? c.check[1] : '', great: !!great };
      // 大成功在成功的结果上再多得一点：先照常结算，再结算 great
      if (great) br = { fx: (gg) => { if (c.fx) c.fx(gg); if (c.great.fx) c.great.fx(gg); }, res: c.great.res || c.res, next: c.great.next || c.next };
      else if (!ok) br = c.fail || { res: QX.tx('没成') };
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
    const nx = S.ev.next, back = S.ev.back;
    S.ev = null;
    // 问完话、深谈、送礼、学武以后回到和这个人说话
    if (back && !nx && !S.over && !S.queue.length && QX.where(back) === S.loc) { QX.talk(back); return; }
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
    S.lastAt = S.lastAt || {}; S.lastAt[pid] = S.loc;
    const ch = [], tr = QX.affTier(pid), rk = tierRank(tr);
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (E.who !== pid || !E.act) continue;
      if (E.loc && E.loc !== S.loc) continue;
      if (!evAvailable(E, g)) continue;
      // minAff：要熟到哪一档才会跟你说这件事；不够时灰着
      const lock = E.minAff && rk < tierRank(E.minAff) ? QX.tx('交情不够', { t: E.minAff }) : '';
      if (lock && E.hideLocked) continue;
      ch.push({ t: val(E.act, g), a: { k: 'ev', id }, dis: lock });
    }
    // 话题：每人只答他会知道的事。问过的再问，换成“上回说过”的短句
    for (const T of P.topics || []) {
      if (T.cond && !T.cond(g)) continue;
      if (rk < tierRank(T.tier || '生')) continue;
      const asked = S.asked && S.asked[pid + ':' + T.id];
      ch.push({ t: QX.tx('问话题', { a: val(T.q, g) }), a: { k: 'topic', p: pid, id: T.id }, sub: QX.tx('话题' + (T.k || '传闻')) + (asked ? ' · ' + QX.tx('问过') : '') });
    }
    for (const T of P.teach || []) {
      const A = artDef(T.art), lv = QX.artLv(T.art);
      const ok = !T.cond || T.cond(g);
      if (!ok && !T.why) continue;
      const cap = T.cap || CFG.maxLv;
      // 拜师要不是仇人；请教要熟
      const fee = teachFee(P, T), cfee = fee ? Math.max(5, Math.round(fee / 10)) : 0;
      if (!lv) ch.push({ t: QX.tx('拜师学', { a: A.name }), a: { k: 'learn', p: pid, art: T.art }, dis: !ok ? val(T.why, g) : rk < 1 ? QX.tx('交情不够', { t: '生' }) : S.st.银两 < fee ? QX.tx('银两不够', { n: fee }) : '', sub: A.type + (fee ? ' · ' + QX.tx('拜师礼', { n: fee }) : '') });
      else if (lv < cap) ch.push({ t: QX.tx('请教', { a: A.name }), a: { k: 'coach', p: pid, art: T.art }, dis: !ok ? val(T.why, g) : rk < 2 ? QX.tx('交情不够', { t: '熟' }) : S.st.银两 < cfee ? QX.tx('银两不够', { n: cfee }) : '', sub: QX.tx('级', { n: lv }) + (cfee ? ' · ' + QX.tx('花银两', { n: cfee }) : '') + (QX.atGate(T.art) ? ' · ' + QX.tx('能破关') : '') });
    }
    if (CFG.companions && P.comp && !QX.inParty(pid)) {
      const why = joinBlock(pid, g);
      if (!(P.comp.hide && why && P.comp.hide(g))) ch.push({ t: QX.tx('邀请同行'), a: { k: 'join', p: pid }, dis: why });
    }
    // 深谈：半天，同一个人七天一回；送礼：送他喜欢的东西，一个月一回
    if (!P.noChat) {
      const last = S.chat && S.chat[pid];
      const wait = last != null && S.day - last < CHAT_GAP ? QX.tx('刚谈过') : '';
      ch.push({ t: QX.tx('深谈'), a: { k: 'chat', p: pid }, dis: rk < 1 ? QX.tx('他不理你') : wait, sub: QX.tx('一天') });
      const gift = (P.likes || []).find((it) => QX.has(it) && !QX.ITEMS[it].relic);
      const lastG = S.gift && S.gift[pid];
      if (gift) ch.push({ t: QX.tx('送礼', { a: QX.ITEMS[gift].name }), a: { k: 'gift', p: pid, item: gift }, dis: lastG != null && S.day - lastG < GIFT_GAP ? QX.tx('刚送过') : '' });
    }
    ch.push({ t: QX.tx('告辞'), a: { k: 'bye' } });
    S.ev = { talk: pid, id: '', who: pid, title: P.name, text: val(first && P.hello ? P.hello : P.talk, g) || '', mood: QX.mood(pid), tier: tr, choices: ch, res: null };
    QX.save();
  };
  const CHAT_GAP = 7, GIFT_GAP = 30, CHAT_AFF = 6, GIFT_AFF = 12;
  function chatText(P, g) {
    const tr = QX.affTier(P.id);
    const lines = val(P.chats, g);
    if (Array.isArray(lines) && lines.length) return pick(lines);
    return QX.tx('深谈' + tr, { a: P.name });
  }

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
        const fee = teachFee(personDef(a.p), T);
        if (S.st.银两 < fee) break;
        if (fee) addSt('银两', -fee);
        learn(a.art, 1);
        S.ev = { id: '', who: a.p, title: QX.PEOPLE[a.p].name, text: '', choices: [], res: val(T.say, g) || QX.tx('学成', { a: QX.ARTS[a.art].name }), back: a.p };
        passDays(T.days || 5);
        break;
      }
      case 'coach': {
        const cfee = QX.coachFee(a.p, a.art);
        if (S.st.银两 < cfee) break;
        if (cfee) addSt('银两', -cfee);
        const r = practise(a.art, false, 2.2);
        // 师父指点能破瓶颈
        const broke = breakGate(a.art, QX.tx('师父指点', { a: QX.PEOPLE[a.p].name }));
        S.ev = { id: '', who: a.p, title: QX.PEOPLE[a.p].name, text: '', choices: [], res: QX.tx('指点', { a: QX.ARTS[a.art].name, n: r.gain }) + (broke ? QX.tx('破关', { n: QX.artLv(a.art) }) : '') + (r.up || broke ? QX.tx('升级', { a: QX.ARTS[a.art].name, n: QX.artLv(a.art) }) : ''), back: a.p };
        break;
      }
      case 'join': {
        const P = personDef(a.p);
        joinParty(a.p);
        S.ev = { id: '', who: a.p, title: P.name, text: '', choices: [], res: val(P.comp.joinText, g) || QX.tx('入队', { a: P.name }) };
        break;
      }
      case 'topic': {
        const P = personDef(a.p), T = P.topics.find((x) => x.id === a.id);
        S.asked = S.asked || {};
        const key = a.p + ':' + a.id, again = S.asked[key];
        S.asked[key] = 1;
        if (!again && T.fx) T.fx(g);
        if (!again && T.loc) news(val(T.a, g), { loc: T.loc, cred: T.cred || '听说' });
        const res = again ? (val(T.again, g) || QX.tx('上回说过', { a: P.name })) : val(T.a, g);
        S.ev = { id: '', who: a.p, title: P.name, text: '', choices: [], res, back: a.p };
        break;
      }
      case 'chat': {
        const P = personDef(a.p);
        S.chat = S.chat || {}; S.chat[a.p] = S.day;
        like(a.p, CHAT_AFF + (P.chatAff || 0));
        passDays(1);
        S.ev = { id: '', who: a.p, title: P.name, text: '', choices: [], res: chatText(P, g), back: a.p };
        break;
      }
      case 'gift': {
        const P = personDef(a.p);
        take(a.item, 1);
        S.gift = S.gift || {}; S.gift[a.p] = S.day;
        like(a.p, GIFT_AFF);
        S.ev = { id: '', who: a.p, title: P.name, text: '', choices: [], res: val((P.thanks || {})[a.item], g) || QX.tx('收礼', { a: P.name, b: QX.ITEMS[a.item].name }), back: a.p };
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
    if (L.inn) out.push({ k: 'ask', cost: ASK_COST });
    if (L.clinic && S.inj) out.push({ k: 'clinic', cost: L.clinic });
    if (L.work) out.push({ k: 'work' });
    if (L.smith) out.push({ k: 'smith' });
    if (L.bank) out.push({ k: 'bankui' });
    if (QX.market().length) out.push({ k: 'trade' });
    if (L.escort) out.push({ k: 'escort' });
    if (S.sect && QX.SECTS[S.sect].home === S.loc) out.push({ k: 'donate', cost: DONATE });
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
      case 'ask': r = ask(); break;
      case 'clinic': r = clinic(); break;
      case 'work': r = work(); break;
      case 'donate': r = donate(); break;
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
  /* 牌堆：同一处的事件抽过一张就先放一边，这一处的牌抽完了才重洗；通用的事件全天下共用一副。
   * 抽牌时本地的事件优先（LOCAL_FIRST 的机会先从本地抽），本地抽完才轮到通用的。 */
  const LOCAL_FIRST = 0.65;
  function weighted(pool) {
    let tot = pool.reduce((s, x) => s + x[1], 0), r = R() * tot;
    for (const x of pool) { r -= x[1]; if (r <= 0) return x[0]; }
    return pool.length ? pool[pool.length - 1][0] : null;
  }
  function drawFrom(key, pool) {
    if (!pool.length) return null;
    S.deck = S.deck || {};
    let used = S.deck[key] || [];
    let left = pool.filter((x) => !used.includes(x[0]));
    if (!left.length) { used = []; left = pool; }
    const id = weighted(left);
    used.push(id);
    S.deck[key] = used;
    return id;
  }
  QX.drawFrom = drawFrom;
  function explore() {
    const g = G(), local = [], general = [];
    for (const id in QX.EVENTS) {
      const E = QX.EVENTS[id];
      if (!E.explore) continue;
      const mine = E.explore === S.loc || (Array.isArray(E.explore) && E.explore.includes(S.loc));
      const any = E.explore === '*' && !(QX.LOCS[S.loc].wild === false && E.wild);
      if (!mine && !any) continue;
      if (!evAvailable(E, g)) continue;
      (mine ? local : general).push([id, val(E.w, g) || (mine ? 4 : 1)]);
    }
    passDays(3);
    if (S.over) return null;
    if (!local.length && !general.length) { const t = QX.tx('一无所获'); log(t); return t; }
    // 本地这副牌还有没抽过的，就多半从本地抽
    const usedHere = (S.deck && S.deck[S.loc]) || [];
    const localLeft = local.some((x) => !usedHere.includes(x[0]));
    const fromLocal = local.length && (!general.length || (localLeft && R() < LOCAL_FIRST) || (!localLeft && R() < 0.3));
    const id = fromLocal ? drawFrom(S.loc, local) : drawFrom('*', general);
    if (id) S.queue.unshift(id);
    return null;
  }
  function inn() {
    const L = QX.LOCS[S.loc];
    if (S.st.银两 < L.inn) return QX.tx('住不起', { n: L.inn });
    addSt('银两', -L.inn);
    passDays(1);
    // 住店只养气血内力，不治内伤；带着胡青牛医经的人会给自己配药，能好一层
    const cured = S.inj && QX.has('yijing');
    if (cured) S.inj--;
    S.hp = QX.maxHp(); S.mp = QX.maxMp();
    const t = QX.tx('住店', { n: L.inn }) + (cured ? QX.tx('医经治伤') : S.inj ? QX.tx('内伤未愈', { n: S.inj }) : '');
    log(t);
    return t;
  }
  // 医馆：花钱治一层内伤，半天
  function clinic() {
    const L = QX.LOCS[S.loc];
    if (!S.inj && !S.mer) return QX.tx('没病');
    if (!S.inj) return QX.tx('医馆治不了经脉');
    if (S.st.银两 < L.clinic) return QX.tx('看不起病', { n: L.clinic });
    addSt('银两', -L.clinic);
    S.inj--;
    passDays(1);
    const t = QX.tx('看病', { n: L.clinic, k: S.inj });
    log(t);
    return t;
  }
  // 治经脉：高人、奇药（物品的 use.mer）、易筋经
  function cureMer(why) { if (!S.mer) return; S.mer = 0; log(why || QX.tx('经脉好了'), 'good'); }
  /* 打听：在客店里花 ASK_COST 两、一天。先问还没到日子的大事（提前放出风声），
   * 再问数据里 QX.addAsks 注册的消息（(g) => 文字 | { t, loc } | null），最后问认得的人去了哪里。 */
  const ASK_COST = 10;
  QX.ASKS = [];
  QX.addAsks = (arr) => arr.forEach((f) => QX.ASKS.push(f));
  function ask() {
    if (S.st.银两 < ASK_COST) return QX.tx('打听不起', { n: ASK_COST });
    addSt('银两', -ASK_COST);
    passDays(1);
    const up = QX.upcoming()[0];
    if (up) { rumor(up, true); return QX.tx('打听到') + val(up.rumor.t, G()); }
    const g = G();
    for (const f of QX.ASKS.slice().sort(() => R() - 0.5)) {
      const r = f(g);
      if (!r) continue;
      const o = typeof r === 'string' ? { t: r } : r;
      if (o.fx) o.fx(g);
      news(o.t, { loc: o.loc || '', cred: o.cred || '听说' });
      log(QX.tx('打听到') + o.t, 'news');
      return QX.tx('打听到') + o.t;
    }
    const ppl = Object.keys(S.met).filter((p) => { const w = QX.where(p); return w && w !== 'party' && w !== S.loc; });
    if (ppl.length) {
      const p = pick(ppl), w = QX.where(p);
      const t = QX.tx('打听人', { a: QX.PEOPLE[p].name, b: QX.LOCS[w].short });
      news(t, { loc: w, cred: '听说' });
      log(t, 'news');
      return t;
    }
    const t = QX.tx('没打听到');
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
  // 做工：五天 8–14 两；同一处连着做，活越来越少（每做一回少一成半，最少一半），隔一个月恢复一回
  function work() {
    S.workN = S.workN || {};
    const w = S.workN[S.loc] || { n: 0, d: S.day };
    w.n = Math.max(0, w.n - Math.floor((S.day - w.d) / 30)); w.d = S.day;
    const n = Math.round((8 + R() * 6) * Math.max(0.5, 1 - 0.15 * w.n));
    w.n++; S.workN[S.loc] = w;
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
    // 门派差事事件：chore: 门派 id（或 '*' 哪个门派都行），用牌堆轮着来；抽到了就接着发生这件事
    const g0 = G(), pool = [];
    for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if ((E.chore === S.sect || E.chore === '*') && evAvailable(E, g0)) pool.push([id, val(E.w, g0) || 1]); }
    const cev = pool.length && R() < CHORE_EVENT ? drawFrom('_chore_' + S.sect, pool) : null;
    if (cev) S.queue.unshift(cev);
    let t = cev ? QX.tx('门派差事') : val(SC.chore, G()) || QX.tx('门派差事');
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
  const CHORE_EVENT = 0.6; // 做门派差事时碰上一件有选项的事的机会
  QX.rankName = () => (S.sect && QX.SECTS[S.sect].ranks ? QX.SECTS[S.sect].ranks[S.rank].name : '');

  /* ---------- 练功 ---------- */
  const need = (lv) => 15 + lv * 12;
  QX.need = need;
  /* 瓶颈：武功练到 3、6、9 级（入门功夫只在 6、9 级）卡住，长进攒满了也升不上去。
   * 突破的办法：找会这门功夫的人指点（请教）、带着对应的秘籍练、到合适的地方闭关（QX.GATE_LOCS，按武功类型，一半机会），
   * 或者打赢一场硬仗（对手的历练加起来 HARD_FIGHT 以上）。突破过的关口记在 a.open。 */
  const HARD_FIGHT = 80;
  QX.GATE_LOCS = {};
  QX.gatesOf = (id) => { const A = artDef(id); return A.gates || ((A.diff || 1) < 0.9 ? [6, 9] : [3, 6, 9]); };
  QX.gateLocs = (id) => { const A = artDef(id); return A.gateLoc || QX.GATE_LOCS[A.type] || []; };
  QX.atGate = (id) => { const a = S.arts[id]; return !!a && a.lv < CFG.maxLv && QX.gatesOf(id).includes(a.lv) && (a.open || 0) < a.lv; };
  QX.stuck = (id) => QX.atGate(id) && S.arts[id].xp >= need(S.arts[id].lv);
  function breakGate(id, how) {
    if (!QX.atGate(id)) return false;
    const a = S.arts[id];
    a.open = a.lv;
    log(QX.tx('突破', { a: QX.ARTS[id].name, n: a.lv, how: how || '' }), 'good');
    addArtXp(id, 0);
    return true;
  }
  function addArtXp(id, n) {
    const a = S.arts[id], A = QX.ARTS[id];
    let up = false;
    a.xp += n;
    while (a.lv < CFG.maxLv && a.xp >= need(a.lv)) {
      if (QX.atGate(id)) { a.xp = need(a.lv); break; } // 卡在关口：长进只攒到满
      a.xp -= need(a.lv); a.lv++; up = true;
      for (const k in A.grow || {}) addSt(k, A.grow[k]);
      log(QX.tx('升级', { a: A.name, n: a.lv }), 'good');
    }
    if (a.lv >= CFG.maxLv) a.xp = 0;
    return up;
  }
  const hasBook = (id) => Object.keys(S.items).some((it) => S.items[it] > 0 && QX.ITEMS[it] && [].concat(QX.ITEMS[it].teaches || []).includes(id));
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
        a.lv = Math.max(1, a.lv - 1); a.xp = 0; S.hp = 1; S.inj = clamp(S.inj + 3, 0, 9); S.mer = 1; out.hurt = 'zouhuo'; gain = 0;
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
    // 卡在瓶颈上：带着秘籍就能对照着想通；在合适的地方闭关有一半机会
    if (!coach && !out.hurt && QX.stuck(id)) {
      if (hasBook(id)) out.broke = breakGate(id, QX.tx('对照秘籍'));
      else if (QX.gateLocs(id).includes(S.loc) && R() < 0.5) out.broke = breakGate(id, QX.tx('闭关', { a: QX.LOCS[S.loc].short }));
      else if (!S.gateTold || S.gateTold[id] !== a.lv) { S.gateTold = S.gateTold || {}; S.gateTold[id] = a.lv; log(QX.tx('瓶颈', { a: A.name, n: a.lv }), 'bad'); }
    }
    if (!coach) { S.trainN = (S.trainN || 0) + 1; if (S.trainN % TRAIN_EVERY === 0) { const ev = trainEvent(); if (ev) S.queue.push(ev); } }
    passDays(10);
    return out;
  }
  /* 修炼小事：每练 TRAIN_EVERY 次碰到一件（事件写 train: true，可以用 cond 限定武功、地点、门派），用牌堆不重复 */
  const TRAIN_EVERY = 3;
  function trainEvent() {
    const g = G(), pool = [];
    for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if (E.train && evAvailable(E, g)) pool.push([id, val(E.w, g) || 1]); }
    return drawFrom('_train', pool);
  }
  // 内伤三层以上不许冒进
  QX.hardBlock = () => (S.inj >= HARD_MAX_INJ ? QX.tx('伤重不能冒进', { n: S.inj }) : '');
  QX.practise = (id, hard) => {
    if (S.ev || S.fight || S.over || !QX.canPractise(id)) return null;
    if (hard && QX.hardBlock()) return null;
    const r = practise(id, hard);
    // 易筋经练到三级，经脉自己就接上了
    if (id === 'yijin' && S.mer && QX.artLv('yijin') >= 3) cureMer(QX.tx('易筋经治经脉'));
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
    if (u.mer) cureMer();
  }
  QX.buy = (id) => {
    const it = itemDef(id), L = QX.LOCS[S.loc];
    if (!L.shop || !L.shop.includes(id) || S.ev || S.fight) return null;
    if (S.st.银两 < it.price) return QX.tx('银两不够', { n: it.price });
    if (it.teaches && QX.has(id)) return QX.tx('已有');
    addSt('银两', -it.price);
    if (it.black) { addSt('品德', -10); log(QX.tx('买黑货', { a: it.name }), 'bad'); }
    give(id, 1);
    QX.save();
    return QX.tx('买下', { a: it.name, n: it.price });
  };
  QX.dismiss = (pid) => { if (S.ev || S.fight) return; leaveParty(pid, QX.tx('送别', { a: QX.PEOPLE[pid].name })); QX.save(); };

  /* ---------- 银两：装备、钱庄、贩货、押镖、捐献、拜师礼 ----------
   * 定价按“一天约值三两”：花钱买的是天数、安全和捷径。
   * 地点上的字段（data/economy.js 用 QX.extendLocs 补）：smith: [装备 id] 铁匠铺卖什么、能修；bank 钱庄；escort 镖局；
   * 货物在哪买哪卖写在 QX.addGoods 里；black: true 的物品是黑市货，买一次品德 -10。 */
  const SLOTS = ['兵器', '护身', '鞋'];
  QX.SLOTS = SLOTS;
  function gearDur(Gd) { return Gd.dur || 10 + Gd.tier * 4; }
  QX.gearDur = (id) => gearDur(QX.GEAR[id]);
  QX.repairCost = (slot) => { const x = S.gear && S.gear[slot]; return x ? Math.max(5, Math.round(QX.GEAR[x.id].price * 0.2 * Math.min(1, x.wear / gearDur(QX.GEAR[x.id])))) : 0; };
  QX.buyGear = (id) => {
    const Gd = QX.GEAR[id], L = QX.LOCS[S.loc];
    if (!Gd || !(L.smith || []).includes(id) || S.ev || S.fight) return null;
    if (S.st.银两 < Gd.price) return QX.tx('银两不够', { n: Gd.price });
    S.gear = S.gear || {};
    const old = S.gear[Gd.slot];
    addSt('银两', -Gd.price);
    let back = 0;
    if (old) { back = Math.round(QX.GEAR[old.id].price * 0.3 * (old.wear >= gearDur(QX.GEAR[old.id]) ? 0.5 : 1)); addSt('银两', back); }
    S.gear[Gd.slot] = { id, wear: 0 };
    const t = QX.tx('买装备', { a: Gd.name, n: Gd.price }) + (old ? QX.tx('旧装备折价', { a: QX.GEAR[old.id].name, n: back }) : '');
    log(t, 'item'); QX.save();
    return t;
  };
  QX.repairGear = (slot) => {
    const x = S.gear && S.gear[slot], L = QX.LOCS[S.loc];
    if (!x || !L.smith || S.ev || S.fight) return null;
    const n = QX.repairCost(slot);
    if (!x.wear) return QX.tx('不用修');
    if (S.st.银两 < n) return QX.tx('银两不够', { n });
    addSt('银两', -n); x.wear = 0; passDays(1);
    const t = QX.tx('修装备', { a: QX.GEAR[x.id].name, n }); log(t); QX.save();
    return t;
  };
  // 钱庄：存着的钱打输了也抢不走
  QX.bank = (n) => {
    const L = QX.LOCS[S.loc];
    if (!L.bank || S.ev || S.fight) return null;
    S.bank = S.bank || 0;
    const amt = n > 0 ? Math.min(n, Math.floor(S.st.银两)) : -Math.min(-n, S.bank);
    if (!amt) return null;
    S.st.银两 -= amt; S.bank += amt; // 存取不算收入、花销
    const t = QX.tx(amt > 0 ? '存钱' : '取钱', { n: Math.abs(amt), b: S.bank }); log(t); QX.save();
    return t;
  };
  // 贩货：价钱每月浮动两成（按地点、货物、月份算，同一个月里不变）；最多带 CARGO_MAX 包
  const CARGO_MAX = 10;
  QX.CARGO_MAX = CARGO_MAX;
  function swing(key) { let h = 11; for (const c of key + ':' + Math.floor(S.day / 30)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 0.8 + (h % 41) / 100; }
  QX.goodPrice = (id, side, loc) => { const Gd = QX.GOODS[id], p = Gd && Gd[side] && Gd[side][loc || S.loc]; return p ? Math.max(1, Math.round(p * swing(id + side + (loc || S.loc)))) : 0; };
  QX.cargoCount = () => Object.values(S.cargo || {}).reduce((s, x) => s + x, 0);
  // 这里能做的买卖：能进的货，或者身上带着、这里收的货
  QX.market = () => Object.keys(QX.GOODS).filter((id) => QX.goodPrice(id, 'buy') || (QX.goodPrice(id, 'sell') && (S.cargo || {})[id]));
  QX.trade = (id, n) => {
    if (S.ev || S.fight) return null;
    S.cargo = S.cargo || {};
    if (n > 0) {
      const p = QX.goodPrice(id, 'buy');
      if (!p) return null;
      const k = Math.min(n, CARGO_MAX - QX.cargoCount(), Math.floor(S.st.银两 / p));
      if (k <= 0) return QX.cargoCount() >= CARGO_MAX ? QX.tx('货满了', { n: CARGO_MAX }) : QX.tx('银两不够', { n: p });
      addSt('银两', -p * k); S.cargo[id] = (S.cargo[id] || 0) + k;
      const t = QX.tx('进货', { a: QX.GOODS[id].name, k, n: p * k }); log(t); QX.save(); return t;
    }
    const p = QX.goodPrice(id, 'sell'), k = Math.min(-n, S.cargo[id] || 0);
    if (!p || k <= 0) return null;
    addSt('银两', p * k); S.cargo[id] -= k; if (!S.cargo[id]) delete S.cargo[id];
    const t = QX.tx('出货', { a: QX.GOODS[id].name, k, n: p * k }); log(t, 'good'); QX.save(); return t;
  };
  // 押镖：要声望 ESCORT_FAME；每月镖局有两趟镖；路上四成会遇劫（data 里的 esc_rob 事件），丢了镖赔一半镖银
  const ESCORT_FAME = 20, ESCORT_ROB = 0.4;
  QX.ESCORT_FAME = ESCORT_FAME;
  QX.escortOffers = () => {
    const L = QX.LOCS[S.loc];
    if (!L.escort) return [];
    const towns = Object.keys(QX.LOCS).filter((id) => id !== S.loc && QX.LOCS[id].escort);
    const out = [];
    for (let i = 0; i < 2 && towns.length; i++) {
      const to = towns[Math.floor(swing(S.loc + 'esc' + i) * 1000) % towns.length];
      if (out.some((o) => o.to === to)) continue;
      const days = landDays(S.loc, to);
      out.push({ to, days, pay: Math.round((25 + days * 2.2) * swing(S.loc + to)), limit: Math.round(days * 1.6 + 8) });
    }
    return out;
  };
  QX.takeEscort = (to) => {
    if (S.ev || S.fight || (S.tasks && S.tasks.escort)) return null;
    if (S.st.声望 < ESCORT_FAME) return QX.tx('声望不够押镖', { n: ESCORT_FAME });
    const o = QX.escortOffers().find((x) => x.to === to);
    if (!o) return null;
    task('escort', { t: QX.tx('押镖去', { a: QX.LOCS[to].short, n: o.pay }), loc: to, until: S.day + o.limit, kind: 'escort', pay: o.pay });
    S.escortHit = 0;
    const t = QX.tx('接镖', { a: QX.LOCS[to].short, n: o.pay, d: o.limit }); log(t); QX.save();
    return t;
  };
  function escortLose(why) {
    const T = S.tasks && S.tasks.escort;
    if (!T) return;
    delete S.tasks.escort;
    const fine = Math.min(Math.round(T.pay / 2), Math.floor(S.st.银两 + (S.bank || 0)));
    const fromBag = Math.min(fine, Math.floor(S.st.银两));
    addSt('银两', -fromBag); S.bank = (S.bank || 0) - (fine - fromBag);
    addSt('声望', -3);
    log(why || QX.tx('丢镖', { n: fine }), 'bad');
  }
  function escortArrive(loc) {
    const T = S.tasks && S.tasks.escort;
    if (!T || T.loc !== loc) return;
    delete S.tasks.escort;
    addSt('银两', T.pay); addSt('声望', 3);
    log(QX.tx('交镖', { a: QX.LOCS[loc].short, n: T.pay }), 'good');
  }
  // 门派捐献：DONATE 两约等于三十天差事
  const DONATE = 100;
  QX.DONATE = DONATE;
  function donate() {
    if (S.st.银两 < DONATE) return QX.tx('银两不够', { n: DONATE });
    addSt('银两', -DONATE); S.contrib += 3; addSt('声望', 1);
    const t = QX.tx('捐献', { n: DONATE, a: QX.SECTS[S.sect].name }); log(t);
    return t;
  }
  /* 拜师礼：同门不收；交情到了“信”不收；teach 写了 free 或 cost 的照写的。
   * 其余按武功的分量：入门 30 两，进阶 100 两，绝学 300 两。请教一回收拜师礼的十分之一（至少 5 两）。 */
  function teachFee(P, T) {
    if (T.cost && T.cost.银两 != null) return T.cost.银两;
    if (T.free || (P.side && P.side === S.sect) || QX.affTier(P.id) === '信') return 0;
    const A = artDef(T.art);
    if (A.fee != null) return A.fee;
    return (A.diff || 1) >= 1.3 || (A.pow || 0) >= 11 ? 300 : (A.pow || 0) >= 6 || (A.type !== '拳掌' && (A.diff || 1) >= 1) ? 100 : 30;
  }
  QX.teachFee = (pid, art) => { const P = personDef(pid), T = (P.teach || []).find((x) => x.art === art); return T ? teachFee(P, T) : 0; };
  QX.coachFee = (pid, art) => { const f = QX.teachFee(pid, art); return f ? Math.max(5, Math.round(f / 10)) : 0; };

  /* ---------- 地图、行走 ---------- */
  function dist(a, b) { const A = QX.LOCS[a], B = QX.LOCS[b]; return Math.hypot(A.x - B.x, A.y - B.y); }
  function landDays(a, b) { return Math.max(2, Math.round(dist(a, b) * 0.9 / (1 + QX.eff('轻功') / 120))); }
  /* 快马：在有客店的城镇雇马，陆路少三成天数。价钱按陆路天数算，至少 HORSE_MIN 两 */
  const HORSE_CUT = 0.7, HORSE_MIN = 15;
  QX.canHorse = () => !!QX.LOCS[S.loc].inn;
  QX.route = (to, horse) => {
    const A = QX.LOCS[S.loc], B = QX.LOCS[to];
    if (!B || to === S.loc) return null;
    let land = 0, sea = 0, cost = 0, why = '';
    if (B.sea && A.sea) sea = dist(S.loc, to) * 0.6;
    else if (B.sea) { land = S.loc === B.port ? 0 : landDays(S.loc, B.port); sea = dist(B.port, to) * 0.6; }
    else if (A.sea) { sea = dist(S.loc, A.port) * 0.6; land = to === A.port ? 0 : landDays(A.port, to); }
    else land = landDays(S.loc, to);
    const horseOk = !!(horse && land >= 4 && QX.canHorse());
    const horseCost = land >= 4 && QX.canHorse() ? Math.max(HORSE_MIN, Math.round(land * 1.2)) : 0;
    if (horseOk) { land *= HORSE_CUT; cost += horseCost; }
    const days = Math.max(2, Math.round(land + sea));
    if (B.sea) cost += B.fare || 0;
    if (B.sea && B.needs && !QX.has(B.needs)) why = QX.tx('要海图', { a: itemDef(B.needs).name });
    else if (S.st.银两 < cost) why = horseOk ? QX.tx('马钱不够', { n: cost }) : QX.tx('船钱不够', { n: cost });
    return { to, days, cost, why, horse: horseOk, horseCost };
  };
  QX.travel = (to, horse) => {
    if (S.ev || S.fight || S.over) return null;
    const r = QX.route(to, horse);
    if (!r || r.why) return r ? r.why : null;
    if (r.cost) addSt('银两', -r.cost);
    const from = S.loc;
    S.loc = to;
    log(QX.tx(r.horse ? '骑马上路' : '上路', { a: QX.LOCS[from].name, b: QX.LOCS[to].name, n: r.days }), 'move');
    passDays(r.days);
    if (S.over) { QX.save(); return null; }
    // 路上的遭遇：路越长越容易碰上。road: true 哪条路都有；road: ['西域', ...] 只在起点或终点在这些地区时有（写地区 id）
    if (R() < clamp(0.08 + r.days * 0.012, 0, 0.45)) {
      const g = G(), pool = [];
      const regs = [QX.LOCS[from].region, QX.LOCS[to].region];
      for (const id in QX.EVENTS) {
        const E = QX.EVENTS[id];
        if (!E.road || !evAvailable(E, g)) continue;
        if (Array.isArray(E.road) && !E.road.some((x) => regs.includes(x))) continue;
        if (E.sea != null && !!E.sea !== !!(QX.LOCS[to].sea || QX.LOCS[from].sea)) continue;
        pool.push([id, val(E.w, g) || 1]);
      }
      const id = drawFrom('_road', pool);
      if (id) S.queue.push(id);
    }
    // 押着镖上路：一趟镖最多遇劫一回
    if (S.tasks && S.tasks.escort && !S.escortHit && QX.EVENTS.esc_rob && R() < ESCORT_ROB) { S.escortHit = 1; S.queue.unshift('esc_rob'); }
    arrive(to);
    escortArrive(to);
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
      // 打赢一场硬仗，卡住的武功里挑一门破关
      if (xp >= HARD_FIGHT) { const sid = Object.keys(S.arts).find((id) => QX.stuck(id)) || Object.keys(S.arts).find((id) => QX.atGate(id)); if (sid) breakGate(sid, QX.tx('硬仗')); }
    }
    F.xp = xp; F.silver = silver;
    // 打一架，身上的装备就磨一点；输了磨得多
    for (const slot in S.gear || {}) if (S.gear[slot]) S.gear[slot].wear += res === 'lose' ? 2 : 1;
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
      const lost = rob();
      // 带着的货丢一半
      for (const id in S.cargo || {}) { S.cargo[id] = Math.floor(S.cargo[id] / 2); if (!S.cargo[id]) delete S.cargo[id]; }
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
  const SAVE_V = 2;
  function readAll() { try { return JSON.parse(localStorage.getItem(CFG.key)) || {}; } catch (e) { return {}; } }
  function writeAll(o) { try { localStorage.setItem(CFG.key, JSON.stringify(o)); } catch (e) { /* 存储不可用 */ } }
  QX.save = () => { if (!S) return; S.hp = Math.min(S.hp, QX.maxHp()); S.mp = Math.min(S.mp, QX.maxMp()); if (QX.noSave) return; const o = readAll(); o.auto = S; o.autoAt = Date.now(); writeAll(o); };
  QX.saveManual = () => { if (!S) return; const o = readAll(); o.manual = JSON.parse(JSON.stringify(S)); o.manualAt = Date.now(); writeAll(o); };
  QX.slots = () => { const o = readAll(); return { auto: o.auto ? summary(o.auto, o.autoAt) : null, manual: o.manual ? summary(o.manual, o.manualAt) : null }; };
  // 存档版本：v2.4 加了装备、钱庄、货物，旧存档（v1）作废，开始页会提示
  function summary(s, at) { return { name: s.name, day: s.day, loc: s.loc, relics: (s.relics || []).length, over: !!s.over, at, old: s.v !== SAVE_V }; }
  QX.load = (slot) => { const o = readAll(); const s = o[slot || 'auto']; if (!s || s.v !== SAVE_V) return false; S = JSON.parse(JSON.stringify(s)); if (!CFG.companions) S.party = []; if (slot === 'manual') QX.save(); return true; };
  QX.clearAuto = () => { const o = readAll(); delete o.auto; writeAll(o); S = null; };

  /* ---------- 给检查工具用 ---------- */
  QX._internal = { passDays, startEvent, flush, arrive, dv, practise, joinBlock };
})();

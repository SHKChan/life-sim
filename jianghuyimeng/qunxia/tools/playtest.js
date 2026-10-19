#!/usr/bin/env node
/* 群侠 · 无界面试玩
 * 用法（在仓库根目录）：node jianghuyimeng/qunxia/tools/playtest.js [局数=300] [种子=1]
 * 照 index.html 的顺序载入引擎和数据（不载界面），先做静态检查，再让三种性格的机器人各玩若干局：
 *   侠（挑品德高的选项）、魔（挑品德低的）、乱（随便选）。机器人会找有事可做的地方去、练功、读秘籍、住店。
 * 检查：运行错误、选项是否都通向某处、十四件信物是否都拿得到、侠魔两种结局是否都到过、
 *   有没有卡死（日子不走）、战斗能不能打完、文风（不用“——”、“不是……而是……”、表情符号）。
 * 没有问题时最后一行是“没有发现问题”。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..');
const games = Number(process.argv[2]) || 300;
let seed = Number(process.argv[3]) || 1;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
  .filter((s) => !/^(https?:|\/)/.test(s) && !/(ui|pixel|i18n|lang)\.js$/.test(s));

const store = {};
const ctx = { console, Math, JSON, Date, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } } };
ctx.window = ctx;
vm.createContext(ctx);
const srcs = {};
for (const s of scripts) {
  const code = fs.readFileSync(path.join(dir, s), 'utf8');
  srcs[s] = code;
  try { vm.runInContext(code, ctx, { filename: s }); } catch (e) { console.error('载入失败 ' + s + '：' + e.stack); process.exit(1); }
}
const QX = ctx.QX;
QX.noSave = true;
const problems = [];
const warn = [];
const P = (m) => { if (!problems.includes(m)) problems.push(m); };

/* ---------- 随机数（可复现） ---------- */
function rng() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
QX.rnd = rng;

/* ---------- 静态检查 ---------- */
const pixelSrc = fs.readFileSync(path.join(dir, '..', '..', 'share', 'pixel.js'), 'utf8');
const scenes = new Set([...pixelSrc.matchAll(/^\s{4}(\w+): \(c, r\) =>/gm)].map((m) => m[1]));
if (QX.DUP.length) P('重复的 id：' + QX.DUP.join('、'));
for (const id in QX.LOCS) {
  const L = QX.LOCS[id];
  if (!scenes.has(L.scene)) P('地点 ' + id + ' 的场景 ' + L.scene + ' 在 pixel.js 里没有');
  if (!QX.REGIONS[L.region]) P('地点 ' + id + ' 的地区 ' + L.region + ' 没有注册');
  for (const it of L.shop || []) if (!QX.ITEMS[it]) P('地点 ' + id + ' 卖的 ' + it + ' 不存在');
}
if (Object.keys(QX.LOCS).filter((l) => !QX.LOCS[l].hidden).length !== 12) warn.push('地点数是 ' + Object.keys(QX.LOCS).length + '（MVP 定的是 12）');
if (Object.keys(QX.REGIONS).length !== 8) warn.push('地区数是 ' + Object.keys(QX.REGIONS).length + '（MVP 定的是 8）');
const relics = QX.relicIds();
if (relics.length !== 14) P('信物不是 14 件：' + relics.length);
for (const id in QX.ITEMS) { const it = QX.ITEMS[id]; for (const a of [].concat(it.teaches || [])) if (!QX.ARTS[a]) P('物品 ' + id + ' 教的武功 ' + a + ' 不存在'); }
for (const id in QX.ARTS) { const A = QX.ARTS[id]; if (A.item && !QX.ITEMS[A.item]) P('武功 ' + id + ' 要的物品不存在'); if (A.pow && !(A.moves || []).length) P('武功 ' + id + ' 没有招式'); }
for (const id in QX.SECTS) { const S = QX.SECTS[id]; if (!QX.LOCS[S.home]) P('门派 ' + id + ' 的山门不存在'); for (const a of S.arts || []) if (!QX.ARTS[a]) P('门派 ' + id + ' 的武功 ' + a + ' 不存在'); if (S.expel && !QX.EVENTS[S.expel]) P('门派 ' + id + ' 的逐出事件不存在'); for (const r of S.ranks || []) if (r.ev && !QX.EVENTS[r.ev]) P('门派 ' + id + ' 的升位事件 ' + r.ev + ' 不存在'); }
for (const o of QX.ORIGINS) { if (!QX.LOCS[o.loc]) P('出身 ' + o.id + ' 的地点不存在'); }
const comps = [];
for (const id in QX.PEOPLE) {
  const p = QX.PEOPLE[id];
  for (const a of p.at || []) if (!QX.LOCS[a.loc]) P('人物 ' + id + ' 的地点 ' + a.loc + ' 不存在');
  for (const t of p.teach || []) if (!QX.ARTS[t.art]) P('人物 ' + id + ' 教的 ' + t.art + ' 不存在');
  if (p.comp) { comps.push(id); for (const c of p.comp.clash || []) if (!QX.PEOPLE[c]) P('人物 ' + id + ' 的 clash ' + c + ' 不存在'); if (!p.comp.st || !p.comp.st.moves) P('同伴 ' + id + ' 没有战斗属性'); }
}
if (comps.length !== 6) warn.push('可同行的人物有 ' + comps.length + ' 个（MVP 定的是 6）');
for (const T of QX.TIMELINE) { if (T.ev && !QX.EVENTS[T.ev]) P('大势 ' + T.id + ' 的事件 ' + T.ev + ' 不存在'); if (T.loc && !QX.LOCS[T.loc]) P('大势 ' + T.id + ' 的地点不存在'); }
const evIds = Object.keys(QX.EVENTS);
for (const id of evIds) {
  const E = QX.EVENTS[id];
  if (E.loc && !QX.LOCS[E.loc]) P('事件 ' + id + ' 的地点 ' + E.loc + ' 不存在');
  if (E.who && !QX.PEOPLE[E.who]) P('事件 ' + id + ' 的人物 ' + E.who + ' 不存在');
  if (typeof E.explore === 'string' && E.explore !== '*' && !QX.LOCS[E.explore]) P('事件 ' + id + ' 的探索地点不存在');
  const ch = E.choices || [];
  if (!ch.length) P('事件 ' + id + ' 没有选项');
  if (ch.length > 4) P('事件 ' + id + ' 有 ' + ch.length + ' 个选项（最多 4 个）');
  ch.forEach((c, i) => {
    const where = '事件 ' + id + ' 的第 ' + (i + 1) + ' 个选项';
    if (!c.t) P(where + '没有文字');
    if (!c.fx && !c.res && !c.fight && !c.next) P(where + '什么也不发生');
    if (c.check && (!Array.isArray(c.check) || !(c.check[0] in { 资质: 1, 根骨: 1, 内力: 1, 攻击: 1, 防御: 1, 轻功: 1, 品德: 1, 声望: 1, 银两: 1 }))) P(where + '的判定写错了');
    if (c.check && typeof c.check[1] === 'string' && !(QX.CHECKS[c.check[0]] && QX.CHECKS[c.check[0]][c.check[1]] != null)) P(where + '的判定档位 ' + c.check[1] + ' 在 QX.CHECKS 里没有');
    if (c.check && typeof c.check[1] === 'number' && QX.CHECKS[c.check[0]]) P(where + '的判定写了数值，' + c.check[0] + ' 要写档位（易、中、难、极难）');
    if (c.check && c.check[0] === '品德') P(where + '拿品德掷骰：品德是侠魔路线，改成 need 门槛');
    if (c.check && !c.fail) P(where + '有判定却没写失败的结果（fail）');
    if (c.great && !c.check) P(where + '写了大成功（great）却没有判定');
    if (c.need && (!Array.isArray(c.need) || !(c.need[0] in { 资质: 1, 根骨: 1, 内力: 1, 攻击: 1, 防御: 1, 轻功: 1, 品德: 1, 声望: 1, 银两: 1 }))) P(where + '的门槛写错了');
    const nexts = [c.next, c.fail && c.fail.next, c.fight && c.fight.win && c.fight.win.next, c.fight && c.fight.lose && c.fight.lose.next].filter(Boolean);
    for (const n of nexts) if (!QX.EVENTS[n]) P(where + '接的事件 ' + n + ' 不存在');
    if (c.fight) { for (const f of c.fight.foes || []) { const fid = typeof f === 'string' ? f : f.id; if (!QX.ENEMIES[fid]) P(where + '的对手 ' + fid + ' 不存在'); } if (!c.fight.win) P(where + '的战斗没有写赢了怎样'); }
  });
}
// 事件能不能被触发：要有 act、arrive、explore、road，或者被别处 next / 大势 / 门派引用
const referenced = new Set();
for (const id of evIds) for (const c of QX.EVENTS[id].choices || []) [c.next, c.fail && c.fail.next, c.fight && c.fight.win && c.fight.win.next, c.fight && c.fight.lose && c.fight.lose.next].filter(Boolean).forEach((n) => referenced.add(n));
QX.TIMELINE.forEach((T) => T.ev && referenced.add(T.ev));
referenced.add('esc_rob'); // 引擎在押镖赶路时排进来
// 银两：装备、货物、地点上的铺子
for (const id in QX.GEAR) { const Gd = QX.GEAR[id]; if (!QX.SLOTS.includes(Gd.slot)) P('装备 ' + id + ' 的格子 ' + Gd.slot + ' 不对'); if (!Gd.price) P('装备 ' + id + ' 没有价钱'); }
for (const id in QX.GOODS) { const Gd = QX.GOODS[id]; for (const side of ['buy', 'sell']) for (const l in Gd[side] || {}) if (!QX.LOCS[l]) P('货物 ' + id + ' 的地点 ' + l + ' 不存在'); }
for (const id in QX.LOCS) for (const gid of QX.LOCS[id].smith || []) if (!QX.GEAR[gid]) P('地点 ' + id + ' 的铁匠铺卖的 ' + gid + ' 不存在');
for (const s in QX.SECTS) { const S = QX.SECTS[s]; if (S.expel) referenced.add(S.expel); (S.ranks || []).forEach((r) => r.ev && referenced.add(r.ev)); }
// 差遣：g.errand('id', ...) 派出去的差事，要有 errand: 'id' 的事件接着；反过来也一样
const errandSet = new Set([...Object.keys(srcs).filter((s) => /^data\//.test(s)).map((s) => srcs[s]).join('\n').matchAll(/g\.errand\('(\w+)'/g)].map((m) => m[1]));
for (const id of evIds) { const E = QX.EVENTS[id]; if (E.errand && !errandSet.has(E.errand)) P('事件 ' + id + ' 等的差遣 ' + E.errand + ' 没有人派（g.errand）'); if (E.chore && E.chore !== '*' && !QX.SECTS[E.chore]) P('事件 ' + id + ' 的门派 ' + E.chore + ' 不存在'); if (E.minAff && QX.tierRank(E.minAff) < 0) P('事件 ' + id + ' 的 minAff 写错了'); }
for (const e of errandSet) if (!evIds.some((id) => QX.EVENTS[id].errand === e)) P('差遣 ' + e + ' 派出去了，却没有 errand: \'' + e + '\' 的事件接着');
// 说话：话题、喜好
for (const pid in QX.PEOPLE) {
  const Pp = QX.PEOPLE[pid], seen = new Set();
  for (const it of Pp.likes || []) if (!QX.ITEMS[it]) P('人物 ' + pid + ' 喜欢的 ' + it + ' 不存在');
  for (const T of Pp.topics || []) {
    if (!T.id || seen.has(T.id)) P('人物 ' + pid + ' 的话题 id 重复或没写：' + T.id); seen.add(T.id);
    if (!T.q || !T.a) P('人物 ' + pid + ' 的话题 ' + T.id + ' 缺问或答');
    if (T.tier && QX.tierRank(T.tier) < 0) P('人物 ' + pid + ' 的话题 ' + T.id + ' 的 tier 写错了');
    if (T.loc && !QX.LOCS[T.loc]) P('人物 ' + pid + ' 的话题 ' + T.id + ' 的地点不存在');
  }
  if (Pp.side && !QX.SECTS[Pp.side] && !['wangfu', 'wudang', 'shaolin', 'tianlong', 'tianying'].includes(Pp.side)) P('人物 ' + pid + ' 的 side ' + Pp.side + ' 不认识');
  if (Pp.roam) for (const l of Pp.roam.locs || []) if (!QX.LOCS[l]) P('人物 ' + pid + ' 走动的地点 ' + l + ' 不存在');
}
for (const id of evIds) { const E = QX.EVENTS[id]; if (!E.act && !E.arrive && !E.explore && !E.road && !E.chore && !E.train && !E.errand && !referenced.has(id)) P('事件 ' + id + ' 没有任何触发方式'); if (E.act && !E.loc && !E.who && !E.anywhere) P('事件 ' + id + ' 有 act，但没写 loc、who 或 anywhere'); }
// 标记：设了没人读、读了没人设
const allSrc = Object.keys(srcs).filter((s) => /^data\//.test(s)).map((s) => srcs[s]).join('\n');
const setF = new Set([...allSrc.matchAll(/g\.set\('(\w+)'/g)].map((m) => m[1]));
const readF = new Set([...allSrc.matchAll(/g\.f\('(\w+)'\)/g)].map((m) => m[1]));
const unread = [...setF].filter((f) => !readF.has(f) && !QX.FLAGS[f]);
const unset = [...readF].filter((f) => !setF.has(f));
if (unset.length) P('读了却从来没人设的标记：' + unset.join('、'));
// 文风
const textSrc = allSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
if (/——/.test(textSrc)) P('文字里用了“——”');
if (/不是[^'。]{0,20}而是/.test(textSrc)) P('文字里用了“不是……而是……”');
if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(textSrc)) P('文字里有表情符号');

/* ---------- 机器人 ---------- */
const clone = (o) => JSON.parse(JSON.stringify(o));
function evalChoice(i, persona) {
  const S0 = QX.state(), keep = clone(S0), seed0 = seed;
  const de0 = S0.st.品德, r0 = S0.relics.length;
  let score = 0;
  try {
    QX.choose(i);
    let n = 0;
    while (QX.state().fight && !QX.state().fight.result && n++ < 80) QX.fightAct(QX.aiOption());
    if (QX.state().fight && QX.state().fight.result) QX.fightDone();
    const S1 = QX.state();
    if (S1.over && S1.over.kind === 'dead') score -= 500;
    score += (S1.relics.length - r0) * 100;
    const dde = S1.st.品德 - de0;
    score += persona === 'xia' ? dde * 3 : persona === 'mo' ? -dde * 3 : 0;
    score += (S1.st.声望 - S0.st.声望) * 0.3;
  } catch (e) { score = 0; }
  QX.setState(keep); seed = seed0;
  return score + rng() * (persona === 'luan' ? 200 : 8);
}
// 事件里能给什么：把选项的代码转成文字，找 g.give('x')。没拿到的信物、海图更值得去
const giveCache = {};
function gives(id) {
  if (giveCache[id]) return giveCache[id];
  const E = QX.EVENTS[id], out = new Set();
  const scan = (f) => { if (typeof f === 'function') for (const m of String(f).matchAll(/give\('(\w+)'/g)) out.add(m[1]); };
  const walk = (eid, depth) => { const X = QX.EVENTS[eid]; if (!X || depth > 3) return; for (const c of X.choices || []) { scan(c.fx); scan(c.fail && c.fail.fx); if (c.fight) { scan(c.fight.win && c.fight.win.fx); } [c.next, c.fail && c.fail.next, c.fight && c.fight.win && c.fight.win.next].filter(Boolean).forEach((n) => walk(n, depth + 1)); } };
  walk(id, 0);
  return (giveCache[id] = [...out]);
}
function evValue(id) {
  const S = QX.state();
  let v = 0;
  for (const it of gives(id)) { if (S.items[it]) continue; if (QX.ITEMS[it].relic) v += 12; else if (it === 'haitu') v += 8; }
  return v;
}
// 某个地点此刻有多少事可做（机器人决定去哪）
function interest(loc, persona) {
  const S = QX.state(), keepLoc = S.loc;
  S.loc = loc;
  let v = 0;
  try {
    const g = QX.G();
    for (const a of QX.actions()) if (a.k === 'ev') v += 3 + evValue(a.id);
    for (const p of QX.peopleHere()) { const P2 = QX.PEOPLE[p]; for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if (E.who === p && E.act && !(S.done[id] && E.once !== false) && (!E.cond || E.cond(g))) v += 3 + evValue(id); } if (P2.comp && !S.party.includes(p)) v += 1; for (const t of P2.teach || []) if (!t.cond || t.cond(g)) v += S.arts[t.art] ? 0.5 : 2; }
    for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if (E.explore === loc && !(S.done[id] && E.once !== false) && (!E.cond || E.cond(g))) v += (E.once === false ? 0.5 : 2) + evValue(id) * 0.6; }
    const r = QX.route(loc);
    if (r) {
      for (const T of QX.TIMELINE) { if (T.loc !== loc || S.tl[T.id] || !T.ev) continue; const st = QX.dv(T.at[0], T.at[1], T.at[2]); const arr = S.day + r.days; if (arr >= st - 40 && arr <= st + (T.win || 0)) v += 25 + evValue(T.ev); }
      v -= r.days * 0.05;
      if (r.why) v = -99;
    }
  } catch (e) { v = 0; }
  S.loc = keepLoc;
  return v;
}
// 每局记下探索、路上抽到了什么，打坐用了多少天（看重复、看日子是不是在填空）
let cur = null;
const actOrig = QX.act, travelOrig = QX.travel;
QX.act = (k, id) => { const r = actOrig(k, id); if (cur) { const S = QX.state(); if (k === 'explore' && S.ev && S.ev.id) cur.ex.push(S.ev.id); if (k === 'rest') cur.rest += 3; if (k === 'ask') cur.ask++; } return r; };
QX.travel = (to, h) => { const S0 = QX.state(), m0 = S0.st.银两; const r = travelOrig(to, h); if (cur) { const S = QX.state(); if (S.ev && S.ev.id && QX.EVENTS[S.ev.id].road) cur.road.push(S.ev.id); if (h && !r && S.log.length && /快马/.test(S.log[S.log.length - 1].t + (S.log[S.log.length - 2] || { t: '' }).t)) cur.horse++; } return r; };
const stat = { games: 0, ckp: {}, per: [], dist: {}, ends: {}, relicsGot: {}, relicsMax: 0, relicsByEnd: {}, evSeen: {}, steps: 0, fights: 0, draws: 0, deaths: [], days: [], comps: {}, maxRelicGame: null };
function playOne(persona, k) {
  const origin = QX.ORIGINS[k % QX.ORIGINS.length].id;
  const sects = ['', 'quanzhen', 'gaibang', 'emei', 'mingjiao'];
  QX.newGame({ name: '测试', sex: k % 2 ? '女' : '男', origin, sect: sects[k % sects.length] });
  cur = { ex: [], road: [], rest: 0, ask: 0, horse: 0, ck: {}, gear: 0, escort: 0 };
  let S = QX.state(), lastDay = -1, still = 0, steps = 0, fightRounds = 0;
  while (steps < 30000) {
    steps++;
    S = QX.state();
    if (S.over) break;
    if (S.day === lastDay) still++; else { still = 0; lastDay = S.day; }
    if (still > 400) { P('卡住了：' + persona + ' 第 ' + k + ' 局在纪年 ' + JSON.stringify(QX.date(S.day)) + '、' + S.loc + '，' + (S.ev ? '事件 ' + (S.ev.id || S.ev.talk) : S.fight ? '战斗中' : '地点上') + ' 日子不走了'); break; }
    if (S.fight) {
      if (S.fight.result) { if (S.fight.result === 'draw') stat.draws++; QX.fightDone(); fightRounds = 0; continue; }
      if (++fightRounds > 100) { P('战斗打不完：' + S.fight.foes.map((f) => f.id).join(',')); break; }
      const opts = QX.fightOptions();
      const o = persona === 'luan' && rng() < 0.3 ? opts[Math.floor(rng() * opts.length)] : QX.aiOption();
      if (o.dis) { QX.fightAct(QX.aiOption()); } else QX.fightAct(o);
      continue;
    }
    if (S.ev) {
      if (S.ev.id) stat.evSeen[S.ev.id] = (stat.evSeen[S.ev.id] || 0) + 1;
      // 每局每件事只记第一次（可重复的偷东西事件会被机器人反复去试，不算）
      if (cur && !cur.ck[S.ev.id]) { cur.ck[S.ev.id] = 1; for (const c of S.ev.choices) if (c.p != null && !c.dis) (stat.ckp[c.ck] = stat.ckp[c.ck] || []).push(c.p); }
      const ch = S.ev.choices.map((c, i) => [c, i]).filter((x) => !x[0].dis);
      if (!ch.length || S.ev.res !== null && !S.ev.choices.length) { QX.cont(); continue; }
      if (S.ev.talk) {
        // 和人说话：先做事件、学武、邀请，最后告辞
        // 和人说话：先做事件、学武、邀请；卡在瓶颈的去请教；问没问过的话题、深谈、送礼；最后告辞
        const pri = ch.find((x) => x[0].a.k === 'ev' && !S.done[x[0].a.id]) || ch.find((x) => x[0].a.k === 'learn') || ch.find((x) => x[0].a.k === 'join' && rng() < 0.7)
          || ch.find((x) => x[0].a.k === 'coach' && QX.stuck(x[0].a.art)) || (rng() < 0.3 && ch.find((x) => x[0].a.k === 'coach'))
          || (rng() < 0.5 && ch.find((x) => x[0].a.k === 'topic' && !(S.asked && S.asked[x[0].a.p + ':' + x[0].a.id])))
          || (rng() < 0.25 && ch.find((x) => x[0].a.k === 'chat')) || (rng() < 0.5 && ch.find((x) => x[0].a.k === 'gift'));
        QX.choose((pri || ch[ch.length - 1])[1]);
        continue;
      }
      let best = ch[0][1], bv = -1e9;
      for (const [, i] of ch) { const v = evalChoice(i, persona); if (v > bv) { bv = v; best = i; } }
      QX.choose(best);
      continue;
    }
    // 在地点上
    const g = QX.G();
    for (const id in Object.assign({}, S.items)) { const it = QX.ITEMS[id]; if (it.teaches && [].concat(it.teaches).some((a) => !S.arts[a] && (!QX.ARTS[a].req || QX.ARTS[a].req(g)))) { QX.useItem(id); } }
    if (S.ev) continue;
    const acts = QX.actions();
    const has = (k2) => acts.find((a) => a.k === k2);
    if (S.inj >= 3 && S.items.heiyu) { QX.useItem('heiyu'); continue; }
    if (S.inj >= 3 && has('clinic') && S.st.银两 >= QX.LOCS[S.loc].clinic) { QX.act('clinic'); continue; }
    if (S.inj >= 3) { const med = ['dahuan', 'jiedu'].find((m) => S.items[m]); if (med) { QX.useItem(med); continue; } }
    if (S.hp < QX.maxHp() * 0.45) { if (has('inn') && S.st.银两 >= QX.LOCS[S.loc].inn) QX.act('inn'); else QX.act('rest'); continue; }
    if (has('ask') && S.st.银两 >= 40 && rng() < 0.04) { QX.act('ask'); continue; }
    if (has('retire') && (S.relics.length >= 14 || rng() < 0.01)) { QX.act('retire'); continue; }
    // 银两：有钱就买装备、修装备；钱多了存钱庄；有镖就押；顺路贩货；在山门捐献
    const L0 = QX.LOCS[S.loc];
    if (L0.smith) {
      const slot = QX.SLOTS.find((sl) => S.gear[sl] && S.gear[sl].wear >= QX.gearDur(S.gear[sl].id));
      if (slot && S.st.银两 >= QX.repairCost(slot) + 20) { QX.repairGear(slot); continue; }
      const up = L0.smith.map((id) => QX.GEAR[id]).filter((Gd) => (!S.gear[Gd.slot] || QX.GEAR[S.gear[Gd.slot].id].tier < Gd.tier) && S.st.银两 >= Gd.price + 30).sort((a, b) => b.tier - a.tier)[0];
      if (up) { QX.buyGear(up.id); cur.gear = 1; continue; }
    }
    if (L0.bank && S.st.银两 > 180 && rng() < 0.6) { QX.bank(Math.floor(S.st.银两 - 80)); continue; }
    if (L0.bank && S.st.银两 < 40 && (S.bank || 0) > 60) { QX.bank(-Math.min(S.bank, 120)); continue; }
    if (L0.escort && !(S.tasks || {}).escort && S.st.声望 >= QX.ESCORT_FAME && rng() < 0.12) { const o = QX.escortOffers()[0]; if (o && QX.takeEscort(o.to)) { const why = QX.travel(o.to); cur.escort++; if (!why) continue; } }
    for (const id in S.cargo || {}) if (QX.goodPrice(id, 'sell')) QX.trade(id, -S.cargo[id]);
    if (QX.market().length && S.st.银两 > 80 && rng() < 0.5) { const id = QX.market().find((x) => QX.goodPrice(x, 'buy')); if (id) QX.trade(id, 6); }
    if (acts.find((a) => a.k === 'donate') && S.st.银两 > 280 && rng() < 0.3) { QX.act('donate'); continue; }
    if (S.ev) continue;
    const evs = acts.filter((a) => a.k === 'ev' && (a.id !== 'gamble' || rng() < 0.08) && (a.id !== 'rob_road' || persona !== 'xia'));
    if (evs.length && rng() < 0.7) { QX.act('ev', evs[Math.floor(rng() * evs.length)].id); continue; }
    const talks = acts.filter((a) => a.k === 'talk');
    const fresh = talks.filter((a) => interest_person(a.id));
    if (fresh.length && rng() < 0.7) { QX.act('talk', fresh[Math.floor(rng() * fresh.length)].id); continue; }
    if (S.st.银两 < 15 && has('work') && rng() < 0.5) { QX.act('work'); continue; }
    if (has('chore') && rng() < 0.3) { QX.act('chore'); continue; }
    const r = rng();
    if (r < 0.42) {
      const arts = Object.keys(S.arts).filter((a) => QX.canPractise(a));
      if (arts.length) { const a = arts[Math.floor(rng() * arts.length)]; const hard = rng() < (persona === 'luan' ? 0.4 : 0.15) && !QX.hardBlock(); QX.practise(a, hard); continue; }
    }
    const exHere = Object.keys(QX.EVENTS).some((id) => { const E = QX.EVENTS[id]; return E.explore === S.loc && evValue(id) > 0 && (!E.cond || E.cond(g)); });
    if (r < 0.58 || (exHere && rng() < 0.6)) { QX.act('explore'); continue; }
    if (r < 0.61) { QX.act('wait'); continue; }
    if (S.party.length === 0 || rng() < 0.9) {
      // 去有事可做的地方
      let best = null, bv = -1e9;
      for (const l in QX.LOCS) { if (l === S.loc || !QX.locKnown(l)) continue; const v = interest(l, persona) + rng() * 4; if (v > bv) { bv = v; best = l; } }
      if (best) { const why = QX.travel(best, S.st.银两 > 80 && rng() < 0.5); if (why) QX.act('work'); continue; }
    }
    QX.act('explore');
  }
  S = QX.state();
  if (!S.over) { P('一局走了 ' + steps + ' 步还没结束（' + persona + ' 第 ' + k + ' 局）'); return; }
  stat.games++;
  stat.steps += steps;
  const end = S.over.kind + (S.over.id ? ':' + S.over.id : '') + (S.over.why ? '(' + S.over.why + ')' : '');
  stat.ends[end] = (stat.ends[end] || 0) + 1;
  stat.days.push(S.day);
  if (S.over.kind === 'dead') stat.deaths.push(S.over.text.slice(0, 20));
  for (const r of S.relics) stat.relicsGot[r] = (stat.relicsGot[r] || 0) + 1;
  if (S.relics.length > stat.relicsMax) { stat.relicsMax = S.relics.length; stat.maxRelicGame = persona + ' #' + k + ' ' + S.over.kind; }
  stat.relicsByEnd[S.over.kind] = (stat.relicsByEnd[S.over.kind] || []).concat([S.relics.length]);
  stat.fights += S.fights;
  stat.pow = (stat.pow || []).concat([QX.power()]); stat.hp = (stat.hp || []).concat([QX.maxHp()]); stat.atk = (stat.atk || []).concat([QX.eff('攻击')]);
  stat.lv = (stat.lv || []).concat([Math.max(0, ...Object.values(S.arts).map((a) => a.lv))]); stat.nart = (stat.nart || []).concat([Object.keys(S.arts).length]);
  for (const p in S.comp) stat.comps[p] = (stat.comps[p] || 0) + 1;
  ['资质', '根骨', '轻功', '内力'].forEach((x) => (stat.dist[x] = stat.dist[x] || []).push(QX.eff(x)));
  (stat.dist.内力上限 = stat.dist.内力上限 || []).push(QX.maxMp());
  cur.acct = Object.assign({}, S.acct); cur.gearN = Object.keys(S.gear || {}).filter((sl) => S.gear[sl]).length;
  stat.per.push(cur);
  cur = null;
}
function interest_person(pid) {
  const S = QX.state(), g = QX.G(), P2 = QX.PEOPLE[pid];
  for (const id in QX.EVENTS) { const E = QX.EVENTS[id]; if (E.who === pid && E.act && !(S.done[id] && E.once !== false) && (!E.cond || E.cond(g))) return true; }
  if (QX.CFG.companions && P2.comp && !S.party.includes(pid) && S.party.length < QX.CFG.partyMax && (!P2.comp.cond || P2.comp.cond(g))) return true;
  for (const t of P2.teach || []) if (!S.arts[t.art] && (!t.cond || t.cond(g))) return true;
  return !S.met[pid];
}

const personas = ['xia', 'mo', 'luan'];
for (let k = 0; k < games; k++) {
  const persona = personas[k % 3];
  try { playOne(persona, k); } catch (e) {
    const S = QX.state();
    P('运行错误（' + persona + ' 第 ' + k + ' 局，' + (S ? JSON.stringify(QX.date(S.day)) + ' ' + S.loc + (S.ev ? ' 事件 ' + (S.ev.id || S.ev.talk) : '') : '') + '）：' + e.stack.split('\n').slice(0, 3).join(' | '));
  }
}


/* ---------- 路线检查：一个练成了的玩家照着每件信物的路线走一遍（走真实的事件，不直接给东西） ---------- */
const ROUTES = [
  { relic: 'yitian', d: '侠：134 年秋夜探王府', at: [134, 8], loc: 'dadu', steps: [['act', 'dd_sword_night']], pref: ['屋顶'] },
  { relic: 'yitian', d: '魔：灵蛇岛那一夜拦下周芷若', at: [135, 6, 1], loc: 'lintan', steps: [['go', 'lingshe']], pref: ['袖手', '让小昭去', '拦下'] },
  { relic: 'tulong', d: '侠：冰火岛见谢逊，去少林认出成昆，再回冰火岛', at: [131, 2], loc: 'lintan', de: 70,
    steps: [['talk', 'laochuanfu', 'la_haitu'], ['go', 'binghuo'], ['talk', 'xiexun', 'bh_meet'], ['go', 'shaolin'], ['talk', 'yuanzhen', 'sl_yuanzhen_hand'], ['go', 'binghuo'], ['talk', 'xiexun', 'bh_blade']], pref: ['五十两', '实话', '借口', '少林'] },
  { relic: 'tulong', d: '魔：屠狮大会上胜周芷若', at: [136, 4, 25], loc: 'wudang', steps: [['go', 'shaolin']], pref: ['讨教', '先看看', '看着', '下山'] },
  { relic: 'jiuyang', d: '134 年后在昆仑山里找到山谷', at: [134, 7], loc: 'guangming', steps: [['explore', 'gm_valley']], pref: ['钻进'] },
  { relic: 'qiankun', d: '侠：替小昭保密，跟她进秘道', at: [133, 2], loc: 'guangming', steps: [['talk', 'xiaozhao', 'gm_xiaozhao'], ['act', 'gm_midao']], pref: ['保密', '带走'] },
  { relic: 'qiankun', d: '魔：夜里撬开圣火殿', at: [132, 2], loc: 'guangming', steps: [['act', 'gm_sneak']], pref: ['撬开'] },
  { relic: 'shenghuo', d: '灵蛇岛与波斯三使动手', at: [135, 6, 1], loc: 'lintan', steps: [['go', 'lingshe']], pref: ['跟三使动手', '翻个身'] },
  { relic: 'wumu', d: '倚天剑斩屠龙刀', at: [136, 1], loc: 'lintan', give: ['yitian', 'tulong'], steps: [['act', 'any_swords']], pref: ['砍下去'] },
  { relic: 'jiuyin', d: '倚天剑斩屠龙刀', at: [136, 1], loc: 'lintan', give: ['yitian', 'tulong'], steps: [['act', 'any_swords']], pref: ['砍下去'] },
  { relic: 'heiyu', d: '侠：认出范遥，替他引开阿三', at: [133, 1], loc: 'dadu', steps: [['talk', 'kutoutuo', 'dd_fanyao'], ['talk', 'kutoutuo', 'dd_heiyu_fan']], pref: ['熊熊圣火', '引开'] },
  { relic: 'heiyu', d: '魔：抢阿三的盒子', at: [133, 1], loc: 'dadu', steps: [['talk', 'asan', 'dd_heiyu_asan']], pref: ['动手抢'] },
  { relic: 'dagou', d: '侠：听见假帮主的事，当众揭穿', at: [134, 1], loc: 'xiangyang', steps: [['explore', 'xy_overhear'], ['act', 'xy_expose']], pref: ['记下来', '逼他', '收下'] },
  { relic: 'dagou', d: '魔：替陈友谅办事，自己留下', at: [134, 1], loc: 'xiangyang', de: 30, steps: [['talk', 'chenyouliang', 'xy_cyl'], ['talk', 'chenyouliang', 'xy_cyl_task']], pref: ['想', '自己留着'] },
  { relic: 'yijin', d: '侠：屠狮大会揭穿成昆，方丈相谢', at: [136, 4, 25], loc: 'wudang', flags: ['knowChengkun'], steps: [['go', 'shaolin'], ['talk', 'kongwen', 'sl_kongwen_thanks']], pref: ['揭穿圆真', '看着', '不争了', '下山', '易筋经'] },
  { relic: 'yijin', d: '魔：夜探藏经阁', at: [132, 1], loc: 'shaolin', steps: [['act', 'sl_cangjing']], pref: ['后窗'] },
  { relic: 'taiji', d: '侠：守武当，再拜见张真人', at: [135, 1, 28], loc: 'shaolin', de: 80, steps: [['go', 'wudang'], ['talk', 'zhangsanfeng', 'wd_zsf_gift']], pref: ['守在殿前', '照看', '双手'] },
  { relic: 'taiji', d: '侠：用黑玉断续膏治好俞岱岩', at: [135, 4], loc: 'wudang', de: 80, give: ['heiyu'], steps: [['talk', 'yudaiyan', 'wd_yu_heiyu'], ['talk', 'zhangsanfeng', 'wd_zsf_gift']], pref: ['敷上', '受了', '双手'] },
  { relic: 'taiji', d: '魔：趁乱摸进后殿', at: [135, 1, 28], loc: 'shaolin', de: 30, steps: [['go', 'wudang']], pref: ['后殿', '揣进'] },
  { relic: 'yijing', d: '侠：祭扫胡青牛的坟，找到医经', at: [131, 3], loc: 'hudie', steps: [['act', 'hd_grave'], ['explore', 'hd_hut']], pref: ['拔草', '字条'] },
  { relic: 'yijing', d: '魔：挖坟（赶在金花婆婆之前）', at: [132, 4], loc: 'hudie', steps: [['act', 'hd_grave']], pref: ['挖开', '夜里来挖'] },
  // 机缘错过了，去对头那里夺回来
  { relic: 'yijing', d: '金花婆婆挖走以后，去灵蛇岛讨回', at: [133, 6], loc: 'lintan', steps: [['go', 'lingshe'], ['talk', 'jinhua', 'ls_yijing']], pref: ['动手抢'] },
  { relic: 'xiantian', d: '番僧抢走以后，夜探王府书库', at: [132, 9], loc: 'dadu', steps: [['act', 'dd_shuku']], pref: ['屋顶', '硬闯'] },
  { relic: 'yiyang', d: '寺田被收以后，夜探王府书库', at: [133, 11], loc: 'dadu', give: ['xiantian'], steps: [['act', 'dd_shuku']], pref: ['屋顶', '硬闯'] },
  { relic: 'qiankun', d: '光明顶以后，向张教主借', at: [134, 7], loc: 'guangming', steps: [['talk', 'zhangwuji', 'gm_wuji_qk']], pref: ['答应'] },
  { relic: 'heiyu', d: '万安寺以后，向赵敏讨', at: [135, 9], loc: 'hudie', steps: [['talk', 'zhaomin', 'hd_zm_heiyu']], pref: ['送去'] },
  { relic: 'yiyang', d: '侠：赶走恶霸，老僧相赠', at: [131, 3], loc: 'dali', steps: [['act', 'dl_temple'], ['talk', 'tianlong_seng', 'dl_yiyang_gift']], pref: ['赶走', '收下'] },
  { relic: 'yiyang', d: '魔：夜入经房', at: [131, 3], loc: 'dali', steps: [['act', 'dl_steal']], pref: ['拿走'] },
  { relic: 'xiantian', d: '侠：帮重阳宫挡住番僧', at: [132, 7], loc: 'xiangyang', steps: [['go', 'zhongnan']], pref: ['挡住', '收下'] },
  { relic: 'xiantian', d: '魔：夜上藏经楼', at: [132, 1], loc: 'zhongnan', de: 30, steps: [['act', 'zn_steal']], pref: ['上楼'] },
];
const routeOk = {};
function drive(pref, maxN) {
  for (let n = 0; n < (maxN || 400); n++) {
    const S = QX.state();
    if (S.over) return;
    if (S.fight) { if (S.fight.result) { if (process.env.RDBG) console.log('   战斗', S.fight.foes.map((f) => f.name + f.hp).join(','), S.fight.result, '我', S.fight.allies[0].hp); QX.fightDone(); } else QX.fightAct(QX.aiOption()); continue; }
    if (!S.ev) return;
    if (process.env.RDBG) console.log('   事件', S.ev.id || S.ev.talk, JSON.stringify(QX.date(S.day)), S.loc, (S.ev.res || '').slice(0, 30), S.ev.choices.map((c) => c.t + (c.dis ? '(x)' : '')).join(' / '));
    if (S.ev.talk || (S.ev.res !== null && !S.ev.choices.length)) { QX.cont(); continue; }
    const ch = S.ev.choices.map((c, i) => [c, i]).filter((x) => !x[0].dis);
    let pick = null;
    for (const k of pref) { pick = ch.find((x) => x[0].t.includes(k)); if (pick) break; }
    QX.choose((pick || ch[ch.length - 1])[1]);
  }
}
function runRoute(R) {
  QX.rnd = () => 0.5; // 判定按成功率的中间值走：练成了的人这些都过得去
  QX.newGame({ name: '路线', sex: '男', origin: 'farmer' });
  let S = QX.state();
  S.ev = null; S.queue = [];
  Object.assign(S.st, { 资质: 80, 根骨: 120, 内力: 120, 攻击: 160, 防御: 90, 轻功: 90, 品德: R.de || 60, 声望: 80, 银两: 2000 });
  ['taizu', 'tuna', 'xianglong', 'jiuyang'].forEach((a) => { S.arts[a] = { lv: 10, xp: 0 }; });
  S.day = QX.dv(R.at[0], R.at[1], R.at[2]) - 1; S.loc = R.loc;
  QX._internal.passDays(1); // 之前的大势照常发生
  S = QX.state(); S.queue = []; S.ev = null; S.hp = QX.maxHp(); S.mp = QX.maxMp();
  (R.flags || []).forEach((f) => { S.flags[f] = true; });
  if (R.aff) S.aff = Object.assign(S.aff || {}, R.aff); // 托付要熟到一定档位才肯开口
  (R.give || []).forEach((it) => QX.G().give(it));
  for (const st of R.steps) {
    S = QX.state();
    if (S.over) break;
    if (st[0] === 'go') { const why = QX.travel(st[1]); if (why) return '去不了 ' + st[1] + '：' + why; }
    else if (st[0] === 'act') { if (!QX.actions().some((a) => a.k === 'ev' && a.id === st[1])) return '这里没有 ' + st[1]; QX.act('ev', st[1]); }
    else if (st[0] === 'talk') {
      if (QX.where(st[1]) !== S.loc) return st[1] + ' 不在 ' + S.loc;
      QX.talk(st[1]);
      const i = QX.state().ev.choices.findIndex((c) => c.a.k === 'ev' && c.a.id === st[2]);
      if (i < 0) return '和 ' + st[1] + ' 说话时没有 ' + st[2];
      QX.choose(i);
    } else if (st[0] === 'explore') {
      let n = 0;
      QX.rnd = rng;
      // 探索用真随机：碰到了还没拿到（判定掷坏了），这件事可重复的话再试几回
      const again = () => { const d = QX.state().done[st[1]] || 0; return !d || (QX.EVENTS[st[1]].once === false && !QX.state().relics.includes(R.relic) && d < 4); };
      while (again() && n++ < 80) { QX.act('explore'); drive(R.pref); S = QX.state(); S.hp = QX.maxHp(); }
      QX.rnd = () => 0.5;
      if (!QX.state().done[st[1]]) return '探索 80 次没碰到 ' + st[1];
      continue;
    }
    drive(R.pref);
  }
  S = QX.state();
  QX.rnd = rng;
  if (S.over && S.over.kind === 'dead') return '死了：' + S.over.text;
  if (R.expect) return R.expect(S) ? '' : '最后没办成（标记：' + Object.keys(S.flags).join('、') + '）';
  return S.relics.includes(R.relic) ? '' : '最后没拿到';
}
/* 托付链：从头走到尾，看最后的标记对不对（机器人凑不齐交情和前置，随机试玩里碰不到） */
const CHAINS = [
  { d: '俞岱岩：打听仇人、讨回公道、用黑玉断续膏治好他', at: [134, 1], loc: 'wudang', aff: { yudaiyan: 30 },
    steps: [['talk', 'yudaiyan', 'tk_yu1'], ['go', 'dadu'], ['go', 'wudang'], ['talk', 'yudaiyan', 'tk_yu3'], ['go', 'dadu'], ['talk', 'asan', 'tk_yu4'], ['go', 'wudang'], ['talk', 'yudaiyan', 'tk_yu5']],
    pref: ['答应替他打听', '凑过去', '答应替他讨回', '动手', '黑玉', '敷上', '受了'], expect: (S) => S.flags.asanCrippled && S.flags.yuCured },
  { d: '说书先生：讲真事、听来成昆的事', at: [133, 1], loc: 'lintan', aff: { shuoshu: 30 }, flags: ['heardGuojing', 'xiexunAsk'],
    steps: [['talk', 'shuoshu', 'tk_shuo1'], ['talk', 'shuoshu', 'tk_shuo2'], ['talk', 'shuoshu', 'tk_shuo3']],
    pref: ['答应替他听', '讲郭大侠', '记下'], expect: (S) => S.flags.heardChengkun && S.flags.shuoTold },
  // 秘地：攒线索、进去拿东西
  { d: '桃花岛：临安、灵蛇岛、襄阳三条线索', at: [132, 1], loc: 'lintan', steps: [['explore', 'cl_th_sailor'], ['go', 'lingshe'], ['explore', 'cl_th_petal'], ['go', 'xiangyang'], ['explore', 'cl_th_book']],
    pref: ['细问', '潮水', '买下'], expect: (S) => S.flags.knowTaohua },
  { d: '桃花岛：过桃花阵、在书房学落英神剑掌', at: [132, 1], loc: 'lintan', flags: ['knowTaohua'], steps: [['go', 'taohua'], ['explore', 'th_study']], pref: ['奇门', '武功'], expect: (S) => !!S.arts.luoying },
  { d: '绝情谷：过情花、斗鳄鱼拔君子剑', at: [132, 1], loc: 'xiangyang', flags: ['knowJueqing'], steps: [['go', 'jueqing'], ['explore', 'jq_pool']], pref: ['小心', '鳄鱼'], expect: (S) => S.gear.兵器 && S.gear.兵器.id === 'junzi' },
  { d: '古墓：潜水道、照墙上的图学玉女剑法', at: [132, 1], loc: 'zhongnan', flags: ['knowGumu'], steps: [['go', 'gumu'], ['explore', 'gm2_sword']], pref: ['一口气', '照着墙'], expect: (S) => !!S.arts.yunv },
];
for (const R of CHAINS) {
  if (process.env.RDBG) { if (!R.d.includes(process.env.RDBG)) continue; console.log('托付', R.d); }
  try { const why = runRoute(R); if (why) P('托付【' + R.d + '】走不通：' + why); }
  catch (e) { QX.rnd = rng; P('托付【' + R.d + '】运行错误：' + String(e.stack).split(/\n/).slice(0, 3).join(' | ')); }
}
for (const R of ROUTES) {
  if (process.env.RDBG) { if (!R.d.includes(process.env.RDBG)) continue; console.log('路线', R.d); }
  try { const why = runRoute(R); if (!why) routeOk[R.relic] = (routeOk[R.relic] || 0) + 1; else P('路线【' + QX.ITEMS[R.relic].name + ' · ' + R.d + '】走不通：' + why); }
  catch (e) { QX.rnd = rng; P('路线【' + QX.ITEMS[R.relic].name + ' · ' + R.d + '】运行错误：' + e.stack.split('\n').slice(0, 3).join(' | ')); }
}
for (const r of relics) if (!routeOk[r]) P('信物【' + QX.ITEMS[r].name + '】没有一条走得通的路线');

/* ---------- 汇总 ---------- */
for (const r of relics) if (!stat.relicsGot[r]) warn.push('信物【' + QX.ITEMS[r].name + '】在随机的 ' + games + ' 局里没拿到（另见路线检查）');
const kinds = Object.keys(stat.ends).map((e) => e.split(':')[0].split('(')[0]);
if (!kinds.includes('xia')) P('侠的结局一次也没到过');
if (!kinds.includes('mo')) P('魔的结局一次也没到过');
const never = evIds.filter((id) => !stat.evSeen[id] && !QX.EVENTS[id].explore && !QX.EVENTS[id].road);
const neverAll = evIds.filter((id) => !stat.evSeen[id]);
console.log('群侠 · 试玩 ' + stat.games + ' 局（侠、魔、乱各三分之一），共 ' + stat.steps + ' 步，' + stat.fights + ' 场战斗（' + stat.draws + ' 场打平）');
console.log('内容：地区 ' + Object.keys(QX.REGIONS).length + '，地点 ' + Object.keys(QX.LOCS).length + '，人物 ' + Object.keys(QX.PEOPLE).length + '（同伴 ' + comps.length + '），武功 ' + Object.keys(QX.ARTS).length + '，物品 ' + Object.keys(QX.ITEMS).length + '（信物 ' + relics.length + '），对手 ' + Object.keys(QX.ENEMIES).length + '，事件 ' + evIds.length + '，大势 ' + QX.TIMELINE.length);
console.log('结局：' + Object.entries(stat.ends).sort((a, b) => b[1] - a[1]).map(([k2, v]) => k2 + ' ' + v).join('，'));
const avg = (a) => (a && a.length ? (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) : '-');
console.log('平均信物数：侠 ' + avg(stat.relicsByEnd.xia) + '，魔 ' + avg(stat.relicsByEnd.mo) + '，死 ' + avg(stat.relicsByEnd.dead) + '；最多一局 ' + stat.relicsMax + ' 件（' + stat.maxRelicGame + '）');
console.log('结束时：强弱 ' + avg(stat.pow) + '，气血 ' + avg(stat.hp) + '，攻击 ' + avg(stat.atk) + '，最高武功等级 ' + avg(stat.lv) + '，会的武功 ' + avg(stat.nart) + ' 门');
console.log('平均活了 ' + avg(stat.days.map((d) => d / 360)) + ' 年');
const pct = (a, q) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(b.length * q))] : '-'; };
console.log('结束时属性（低的一成 / 中间 / 高的一成）：' + Object.keys(stat.dist).map((x) => x + ' ' + pct(stat.dist[x], 0.1) + ' / ' + pct(stat.dist[x], 0.5) + ' / ' + pct(stat.dist[x], 0.9)).join('，'));
console.log('判定（机器人碰到时的成功率）：' + Object.keys(stat.ckp).map((x) => { const a = stat.ckp[x]; return x + ' ' + a.length + ' 次，平均 ' + avg(a) + '%，不到 20% 的 ' + Math.round(a.filter((v) => v <= 20).length / a.length * 100) + '%'; }).join('；'));
{
  const per = stat.per, ex = per.map((c) => c.ex), road = per.map((c) => c.road);
  const rep = (lists) => avg(lists.filter((l) => l.length).map((l) => l.length / new Set(l).size));
  const kinds = (lists) => avg(lists.map((l) => new Set(l).size));
  const localShare = ex.flat().length ? Math.round(ex.flat().filter((id) => QX.EVENTS[id].explore !== '*').length / ex.flat().length * 100) : 0;
  const ac = per.map((c) => c.acct || { earn: 0, spend: 0, lost: 0 });
  console.log('银两：每局收入 ' + avg(ac.map((a) => a.earn)) + ' 两（低的一成 ' + pct(ac.map((a) => a.earn), 0.1) + '，高的一成 ' + pct(ac.map((a) => a.earn), 0.9) + '），花出去 ' + avg(ac.map((a) => a.spend)) + ' 两，被抢 ' + avg(ac.map((a) => a.lost)) + ' 两（占花销 ' + Math.round(ac.reduce((s, a) => s + a.lost, 0) / Math.max(1, ac.reduce((s, a) => s + a.spend + a.lost, 0)) * 100) + '%）；买过装备的局 ' + Math.round(per.filter((c) => c.gear).length / per.length * 100) + '%，结束时平均穿着 ' + avg(per.map((c) => c.gearN)) + ' 件；押镖每局 ' + avg(per.map((c) => c.escort)) + ' 趟');
  console.log('探索：每局 ' + avg(ex.map((l) => l.length)) + ' 次、' + kinds(ex) + ' 种，同一件平均出现 ' + rep(ex) + ' 次，本地事件占 ' + localShare + '%；路上：每局 ' + avg(road.map((l) => l.length)) + ' 次、' + kinds(road) + ' 种；打坐每局 ' + avg(per.map((c) => c.rest)) + ' 天；打听每局 ' + avg(per.map((c) => c.ask)) + ' 次');
}
console.log('每件信物被拿到的局数：' + relics.map((r) => QX.ITEMS[r].name + ' ' + (stat.relicsGot[r] || 0)).join('，'));
console.log('路线检查：' + ROUTES.length + ' 条，走通 ' + Object.values(routeOk).reduce((a, b) => a + b, 0) + ' 条；每件信物走得通的路线数：' + relics.map((x) => QX.ITEMS[x].name + ' ' + (routeOk[x] || 0)).join('，'));
console.log('同行过的同伴（局数）：' + comps.map((p) => QX.PEOPLE[p].name + ' ' + (stat.comps[p] || 0)).join('，'));
if (stat.deaths.length) console.log('死因（前几种）：' + [...new Set(stat.deaths)].slice(0, 6).join('；'));
if (never.length) console.log('从未触发的事件（' + never.length + '）：' + never.join('、'));
if (neverAll.length > never.length) console.log('从未抽到的探索、路上事件：' + neverAll.filter((x) => !never.includes(x)).join('、'));
if (unread.length) console.log('设了但没人用 g.f 读的标记（只影响后面不显示变体，提示）：' + unread.join('、'));
for (const w of warn) console.log('提示：' + w);
if (problems.length) {
  console.log('\n发现 ' + problems.length + ' 个问题：');
  problems.slice(0, 60).forEach((p) => console.log('  - ' + p));
  process.exit(1);
}
console.log('\n没有发现问题');

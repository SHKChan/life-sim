#!/usr/bin/env node
/* 无界面跑完整的人生，检查故事数据有没有运行时错误、死节点、缺字段、选项数不对、选了没后果。
 * 用法：node share/tools/simulate.js <游戏目录> [轮数=30] [人物id ...]
 *   例：node share/tools/simulate.js jianghuyimeng 40
 * 只测部分数据文件：SIM_DATA=shediao,shendiao node share/tools/simulate.js jianghuyimeng 40
 *   （data/world.js 和 data/relations.js 总会载入）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.join(__dirname, '..', '..');
const gameDir = path.join(repo, process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(gameDir, 'index.html'))) {
  console.error('用法：node share/tools/simulate.js <游戏目录> [轮数] [人物id ...]');
  process.exit(2);
}
const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
const only_files = (process.env.SIM_DATA || process.env.SIM_BOOKS || '').split(',').filter(Boolean);
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
  .filter((s) => !/(ui|pixel|sharecard)\.js$/.test(s))
  .filter((s) => !only_files.length || !/^data\//.test(s) || /data\/(world|relations)\.js$/.test(s) || only_files.some((b) => s === 'data/' + b + '.js'));

const { analyze } = require('./consequence.js');
const store = {};
const ctx = {
  window: {}, console, Math, JSON, Date,
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } },
};
ctx.window = ctx;
vm.createContext(ctx);
const dataSrc = {};
for (const s of scripts) {
  const code = fs.readFileSync(path.join(gameDir, s), 'utf8');
  if (/^data\//.test(s)) dataSrc[s] = code;
  try { vm.runInContext(code, ctx, { filename: s }); } catch (e) { console.error('载入失败 ' + s + '：' + e.stack); process.exit(1); }
}
// 测某个语言的翻译：SIM_LANG=en 时，在中文数据之后清空、换上 lang/en/ 下的翻译版（同浏览器里的 JY.loadLangData）
const SIM_LANG = process.env.SIM_LANG || '';
if (SIM_LANG && SIM_LANG !== 'zh') {
  ctx.JY.LANG = SIM_LANG;
  const dir = path.join(gameDir, 'lang', SIM_LANG);
  if (!fs.existsSync(dir)) { console.error('没有这个语言的翻译：' + dir); process.exit(2); }
  const files = ['game.js', '!reset'].concat(scripts.filter((s) => /^data\//.test(s) && s !== 'data/scenes.js').map((s) => s.replace(/^data\//, '')));
  for (const f of files) {
    if (f === '!reset') { ctx.JY.resetData(); for (const k of Object.keys(dataSrc)) delete dataSrc[k]; continue; }
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) { console.error('缺少翻译文件：' + p); process.exit(1); }
    const code = fs.readFileSync(p, 'utf8');
    if (f !== 'game.js') dataSrc['data/' + f] = code;
    try { vm.runInContext(code, ctx, { filename: 'lang/' + SIM_LANG + '/' + f }); } catch (e) { console.error('载入失败 ' + p + '：' + e.stack); process.exit(1); }
  }
}
const JY = ctx.JY, E = JY.engine;

const rounds = Number(process.argv[3]) || 30;
const only = process.argv.slice(4);
const problems = [];
const seenNodes = {};
const minVisible = {};
const maxVisible = {};
const stats = {};

// 静态检查
const VALID_STATS = new Set(JY.STATS);
for (const c of JY.CHARS) {
  for (const k of ['id', 'name', 'book', 'sex', 'born', 'origin']) if (c[k] == null) problems.push(c.id + ' 缺少字段 ' + k);
  if (!c.death) problems.push(c.id + ' 缺少 death');
  if (!c.arc) continue;
  for (const k of ['home', 'fateText', 'st', 'look', 'py']) if (c[k] == null) problems.push(c.id + ' 缺少字段 ' + k);
  if (c.home && !JY.LOCS[c.home]) problems.push(c.id + ' 的 home 地点不存在：' + c.home);
  if (!Array.isArray(c.st) || c.st.length !== 7) problems.push(c.id + ' 的 st 必须是 7 个数');
  const ids = new Set();
  for (const n of c.arc.nodes) {
    if (ids.has(n.id)) problems.push(c.id + ' 节点 id 重复：' + n.id);
    ids.add(n.id);
    if (n.y == null && n.age == null) problems.push(n.id + ' 没有 y 或 age');
    if (n.loc && !JY.LOCS[n.loc]) problems.push(n.id + ' 地点不存在：' + n.loc);
    if (!n.auto && (!n.choices || !n.choices.length)) problems.push(n.id + ' 不是 auto 却没有 choices');
    (n.choices || []).forEach((ch) => { if (ch.check && !VALID_STATS.has(ch.check[0])) problems.push(n.id + ' 判定属性不存在：' + ch.check[0]); });
  }
}
for (const e of JY.ENCOUNTERS) if (!/^e_/.test(e.id)) problems.push('奇遇 id 要以 e_ 开头：' + e.id);
for (const n of JY.LIFE_NODES.concat(JY.ENCOUNTERS)) {
  if (n.loc && !JY.LOCS[n.loc]) problems.push(n.id + ' 地点不存在：' + n.loc);
  if (!n.auto && (!n.choices || !n.choices.length)) problems.push(n.id + ' 不是 auto 却没有 choices');
  (n.choices || []).forEach((ch) => { if (ch.check && !VALID_STATS.has(ch.check[0])) problems.push(n.id + ' 判定属性不存在：' + ch.check[0]); });
}
// 节点 id 全局唯一（引擎按 id 找节点，重名的后一个永远不会出现）
{
  const all = {};
  const add = (id, where) => { if (all[id]) problems.push('节点 id 重复：' + id + '（' + all[id] + ' 和 ' + where + '）'); else all[id] = where; };
  JY.CHARS.forEach((c) => c.arc && c.arc.nodes.concat(c.arc.pauses || []).forEach((n) => add(n.id, c.id)));
  JY.LIFE_NODES.forEach((n) => add(n.id, '人生节点'));
  JY.ENCOUNTERS.forEach((n) => add(n.id, '奇遇'));
  JY.PAUSES.forEach((n) => add(n.id, '人生关口'));
}
// 熟人检查：奇遇在某人身上能触发时，里面出现的人（点了名的，或 cond 里要求活着的）如果此刻是他的熟人
// （原著关系网 JY.RELATIONS 或这一世的 g.rel），奇遇就必须按关系写（用 g.knows / g.isMe / g.me），否则就是“熟人写成陌生人”
const strangerHits = {};
if ((JY.RELATIONS || []).length) {
  const srcOf = (x) => (typeof x === 'function' ? x.toString() : typeof x === 'string' ? x : '');
  const names = JY.CHARS.filter((c) => c.name && c.name.length >= 2);
  JY.ENCOUNTERS.forEach((n) => {
    const all = [srcOf(n.text), srcOf(n.t)].concat((n.choices || []).map((c) => srcOf(c.t) + srcOf(c.res) + srcOf(c.fail && c.fail.res))).join('\n');
    if (/g\.knows\(|g\.isMe\(|g\.me/.test(all + srcOf(n.cond))) return;
    const ids = new Set(names.filter((c) => all.includes(c.name)).map((c) => c.id)
      .concat([...srcOf(n.cond).matchAll(/(?:alive|live)\((?:g, )?'([a-z0-9_]+)'\)/g)].map((m) => m[1])));
    if (!ids.size || !n.cond) return;
    const cond = n.cond;
    n.cond = (g) => {
      const ok = cond(g);
      if (ok && g.me) ids.forEach((id) => { const k = g.knows(id); if (k) strangerHits[n.id + ' · ' + JY.byId[g.me].name + ' 遇见' + k + JY.byId[id].name] = 1; });
      return ok;
    };
  });
}
// 后果检查（同 consequence.js）：每个抉择至少两个选项会影响后面的剧情；设了的标记要有人读
const conseq = analyze(JY, dataSrc);

function runLife(id, mode) {
  // id 为 null：随机人生模式，投一次胎
  if (id == null) { E.startRandom(); id = E.get().L.cid; }
  else E.startLife(id);
  let guard = 0;
  let res = E.peek();
  if (res.type === 'idle') res = E.nextYear();
  let linted = 0;
  while (guard++ < 400) {
    lintLog();
    if (res.type === 'death') break;
    if (res.type === 'node') {
      const n = res.node;
      lintText(n.id, JY.val(n.text), 'node');
      seenNodes[n.id] = (seenNodes[n.id] || 0) + 1;
      const opts = E.choices(n);
      minVisible[n.id] = Math.min(minVisible[n.id] == null ? 99 : minVisible[n.id], opts.length);
      maxVisible[n.id] = Math.max(maxVisible[n.id] || 0, opts.length);
      if (!opts.length) { problems.push('节点没有可选项：' + n.id + '（纪年 ' + E.get().L.year + '）'); E.get().L.queue.shift(); res = E.flush(); continue; }
      let pickOne;
      if (mode === 'canon') pickOne = opts.find((o) => o.ch.canon) || opts[0];
      // 随机人生模式按界面“自动”的选法：七成照大多数人选，这样统计出的分布接近真实玩家
      else if (RANDOM && opts.some((o) => o.ch.canon) && Math.random() < 0.7) pickOne = opts.filter((o) => o.ch.canon)[0];
      else pickOne = opts[Math.floor(Math.random() * opts.length)];
      E.choose(pickOne.i);
      res = E.flush();
      continue;
    }
    res = E.nextYear();
  }
  if (guard >= 400) problems.push(id + ' 人生超过 400 年没结束');
  // 逻辑检查：游戏的 lint 钩子按此刻的状态看每一行生平（例如已婚却写成孤身一人、一岁吃牛肉面）
  function lintLog() {
    const L = E.get().L;
    for (; linted < L.log.length; linted++) { const e = L.log[linted]; if (!/^(world|wmod|intro)$/.test(e.k)) lintText(e.k || 'line', e.t, 'log'); }
  }
  function lintText(where, t, kind) {
    if (!t) return;
    // 英文、西班牙文的翻译里不该再出现汉字
    if (/^(en|es)$/.test(SIM_LANG) && /[㐀-鿿]/.test(t)) { const k = '没翻译的中文（' + where + '）：' + t.slice(0, 60); lintHits[k] = (lintHits[k] || 0) + 1; }
    if (!LINT) return;
    const msg = LINT(JY.G, t, kind);
    if (msg) { const k = msg + '：' + t.slice(0, 50); lintHits[k] = (lintHits[k] || 0) + 1; }
  }
  const L = E.get().L;
  const age = L.year - JY.byId[id].born;
  const words = '测试';
  const life = E.finish(words);
  if (RANDOM) { tally(life); return life; }
  stats[id] = stats[id] || { lives: 0, ages: [], nodes: 0, devs: [] };
  stats[id].lives++;
  stats[id].ages.push(age);
  stats[id].devs.push(life.dev);
  return life;
}

// 随机人生模式：每轮投胎若干次，统计这些人一生的走向
const RANDOM = !!(JY.GAME && JY.GAME.random);
const LINT = JY.GAME && JY.GAME.lint;
const lintHits = {};
const dist = {};
const ages = [], devs = [];
function tally(life) {
  ages.push(life.to - life.born);
  devs.push(life.dev);
  const info = life.info || {};
  ['户籍', '学历', '职业', '婚姻', '住处'].forEach((k) => { const v = info[k] || '（空）'; (dist[k] = dist[k] || {})[v] = (dist[k][v] || 0) + 1; });
  (dist['死因'] = dist['死因'] || {})[life.cause] = (dist['死因'][life.cause] || 0) + 1;
}
if (RANDOM) {
  const n = rounds * 10;
  for (let r = 0; r < n; r++) {
    E.reset(); // 每世之前清空存档，否则往生录越来越大，存档越来越慢
    try { runLife(null, r % 5 === 0 ? 'canon' : 'random'); } catch (e) { problems.push('投胎出错：' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  }
  const nodes = JY.LIFE_NODES.filter((x) => !x.auto);
  console.log('投胎 ' + n + ' 次。人生节点 ' + JY.LIFE_NODES.length + '（抉择 ' + nodes.length + '，触发过 ' + nodes.filter((x) => seenNodes[x.id]).length + '），意外 ' + JY.ENCOUNTERS.length + '，世界事件 ' + JY.EVENTS.length);
  console.log('平均寿命 ' + Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) + '（最短 ' + Math.min(...ages) + '，最长 ' + Math.max(...ages) + '），平均与众不同 ' + Math.round(devs.reduce((a, b) => a + b, 0) / devs.length) + '%');
  for (const k in dist) {
    const top = Object.entries(dist[k]).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([v, c]) => v + ' ' + Math.round(c * 100 / n) + '%');
    console.log('  ' + k + '：' + top.join('，'));
  }
  const never = nodes.filter((x) => !seenNodes[x.id]).map((x) => x.id);
  if (never.length) console.log('从未触发的抉择：' + never.join(', '));
  const neverEnc = JY.ENCOUNTERS.filter((x) => !x.auto && !seenNodes[x.id]).map((x) => x.id);
  if (neverEnc.length) console.log('从未触发的意外：' + neverEnc.join(', '));
}
const playable = RANDOM ? [] : JY.CHARS.filter((c) => c.arc && (!only.length || only.includes(c.id)));
for (let r = 0; r < (RANDOM ? 0 : rounds); r++) {
  for (const c of playable) {
    E.reset();
    try { runLife(c.id, r === 0 ? 'canon' : 'random'); } catch (e) { problems.push('运行 ' + c.id + ' 出错：' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  }
  // 连续轮回：一个江湖里一直重生到没人可选
  E.reset();
  try {
    let n = 0;
    while (n++ < 12) {
      const av = E.available().filter((c) => !only.length || only.includes(c.id));
      if (!av.length) break;
      runLife(av[Math.floor(Math.random() * av.length)].id, 'random');
    }
  } catch (e) { problems.push('轮回出错：' + e.stack.split('\n').slice(0, 3).join(' | ')); }
}

// 汇总
if (!RANDOM) console.log('人物 ' + JY.CHARS.length + '（可玩 ' + JY.CHARS.filter((c) => c.arc).length + '），世界事件 ' + JY.EVENTS.length + '，奇遇 ' + JY.ENCOUNTERS.length);
for (const c of playable) {
  const s = stats[c.id];
  if (!s) continue;
  const total = c.arc.nodes.length;
  const decisions = c.arc.nodes.filter((n) => !n.auto).length;
  const hit = c.arc.nodes.filter((n) => !n.auto && seenNodes[n.id]).length;
  const avgAge = Math.round(s.ages.reduce((a, b) => a + b, 0) / s.ages.length);
  const avgDev = Math.round(s.devs.reduce((a, b) => a + b, 0) / s.devs.length);
  console.log(`${c.name.padEnd(4, '　')} 节点 ${total}（抉择 ${decisions}，触发过 ${hit}） 平均寿命 ${avgAge} 平均改命度 ${avgDev}%`);
  const never = c.arc.nodes.filter((n) => !n.auto && !seenNodes[n.id]).map((n) => n.id);
  if (never.length) console.log('   从未触发：' + never.join(', '));
}
const sh = Object.keys(strangerHits);
if (sh.length) {
  console.log('\n熟人写成陌生人的奇遇 ' + sh.length + ' 处（奇遇要用 g.knows 写变体，或在 cond 里排除熟人）：');
  sh.sort().forEach((k) => console.log('   ' + k));
  problems.push('有 ' + sh.length + ' 处奇遇把熟人写成陌生人');
}
const lh = Object.keys(lintHits);
if (lh.length) {
  console.log('\n前后矛盾、不合年龄的文字 ' + lh.length + ' 处（game.js 的 lint 规则）：');
  lh.sort().slice(0, 80).forEach((k) => console.log('   ' + k + '（' + lintHits[k] + ' 次）'));
  problems.push('有 ' + lh.length + ' 处文字和此刻的状态矛盾');
}
const few = Object.keys(minVisible).filter((k) => minVisible[k] < 2 || maxVisible[k] > 4);
if (few.length) {
  console.log('\n可见选项不在 2–4 个的抉择 ' + few.length + ' 个：');
  console.log('   ' + few.map((k) => k + '(' + minVisible[k] + '–' + maxVisible[k] + ')').join(', '));
  problems.push('有 ' + few.length + ' 个抉择可见选项不在 2–4 个');
}
const scope = (x) => !only.length || only.includes(x.owner) || x.owner === 'enc' || x.owner === 'pause';
const flat = conseq.nodes.filter((x) => scope(x) && x.heavy < 2 && (!only_files.length || only_files.includes(x.file)));
if (flat.length) {
  console.log('\n选什么都差不多的抉择 ' + flat.length + ' 个（有后果的选项少于 2 个。详情：node share/tools/consequence.js <游戏> <id> --list）：');
  console.log('   ' + flat.map((x) => x.n.id).join(', '));
  problems.push('有 ' + flat.length + ' 个抉择选什么都差不多');
}
if (conseq.deadFlags.length && !only_files.length) {
  console.log('\n设了却没有任何地方读的标记：' + conseq.deadFlags.join(', '));
  problems.push('有 ' + conseq.deadFlags.length + ' 个标记设了没人读');
}
if (problems.length) {
  console.log('\n问题 ' + problems.length + ' 条：');
  [...new Set(problems)].slice(0, 60).forEach((p) => console.log(' - ' + p));
  process.exitCode = 1;
} else console.log('\n没有发现问题。');

#!/usr/bin/env node
/* 人物关系检查：找出“把熟人写成陌生人”的地方。
 * 用法：node share/tools/relations.js <游戏目录> [人物id ...]
 *
 * 做法：
 *   1. 关系表：数据里用 JY.addRelations 注册的原著关系（见 jianghuyimeng/data/relations.js）；
 *      没有关系表时，退而用人物的 family 字段，以及人物自己剧情里反复出现的人（3 次以上）。
 *   2. 对每个可玩人物，看所有奇遇和别人的剧情节点：如果它能在这个人物身上触发（cond 里没排除他），
 *      文字里又提到了他的熟人，而节点没有按关系写变体（没有 g.knows / g.isMe / g.me），就列出来。
 * 这是启发式检查，列出来的要人工看一眼。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.join(__dirname, '..', '..');
const game = process.argv[2];
const gameDir = path.join(repo, game || '');
if (!game || !fs.existsSync(path.join(gameDir, 'index.html'))) { console.error('用法：node share/tools/relations.js <游戏目录> [人物id ...]'); process.exit(2); }
const only = process.argv.slice(3);
const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/(ui|pixel|sharecard)\.js$/.test(s) && !/^(https?:|\/)/.test(s)); // 全站顶栏 /nav.js 不是游戏的一部分
const ctx = { console, Math, JSON, Date, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.window = ctx;
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(gameDir, s), 'utf8'), ctx, { filename: s });
const JY = ctx.JY;

const src = (x) => (typeof x === 'function' ? x.toString() : typeof x === 'string' ? x : '');
const nodeText = (n) => [src(n.text), src(n.t)].concat((n.choices || []).map((c) => src(c.t) + src(c.res) + src(c.fx) + src(c.fail && c.fail.res))).join('\n');
const names = JY.CHARS.filter((c) => c.name && c.name.length >= 2).map((c) => ({ id: c.id, name: c.name }));
const mentions = (text) => names.filter((x) => text.includes(x.name)).map((x) => x.id);

// 熟人：关系表优先
const ties = {};
const addTie = (a, b, why) => { (ties[a] = ties[a] || {})[b] = why; (ties[b] = ties[b] || {})[a] = why; };
(JY.RELATIONS || []).forEach((r) => addTie(r.a, r.b, r.rel));
const playable = JY.CHARS.filter((c) => c.arc && (!only.length || only.includes(c.id)));
for (const c of JY.CHARS.filter((x) => x.arc)) {
  (c.family || []).forEach((f) => { if (f.id) addTie(c.id, f.id, f.rel); });
  if ((JY.RELATIONS || []).length) continue;
  const count = {};
  c.arc.nodes.forEach((n) => mentions(nodeText(n)).forEach((id) => { count[id] = (count[id] || 0) + 1; }));
  Object.keys(count).filter((id) => id !== c.id && count[id] >= 3).forEach((id) => { if (!(ties[c.id] || {})[id]) addTie(c.id, id, '剧情里常出现'); });
}

// 节点能不能在某人物身上触发：看 cond 源码里有没有排除他
function canFire(n, pid) {
  const cs = src(n.cond) + src(n.who);
  if (new RegExp("isMe\\('" + pid + "'\\)").test(cs) && /!\s*g\.isMe|!g\.isMe/.test(cs)) return !new RegExp("!\\s*g\\.isMe\\('" + pid + "'\\)").test(cs);
  if (new RegExp("g\\.me\\s*!==\\s*'" + pid + "'").test(cs)) return false;
  if (new RegExp("g\\.me\\s*===\\s*'").test(cs) && !new RegExp("g\\.me\\s*===\\s*'" + pid + "'").test(cs)) return false;
  return true;
}
const relAware = (n) => /g\.knows\(|g\.isMe\(|g\.me\b/.test(nodeText(n) + src(n.cond));

const out = [];
for (const p of playable) {
  const my = ties[p.id] || {};
  const pool = JY.ENCOUNTERS.map((n) => ({ n, kind: '奇遇' }))
    .concat(JY.CHARS.filter((c) => c.arc && c.id !== p.id).flatMap((c) => [])); // 别人的节点只在自己的剧情里触发，不会落到 p 身上
  for (const { n, kind } of pool) {
    if (!canFire(n, p.id)) continue;
    // 年份重叠
    const y0 = n.y ? n.y[0] : -999, y1 = n.y ? n.y[1] : 9999;
    if (y1 < p.born || y0 > (p.death && typeof p.death === 'object' ? p.death.y : p.born + 100)) continue;
    // 节点里出现的人：文字里点了名的，加上 cond 里要求活着的（很多奇遇只写“一个青衫老人”，不点名）
    const featured = new Set(mentions(nodeText(n)).concat([...src(n.cond).matchAll(/(?:alive|live)\((?:g, )?'([a-z0-9_]+)'\)/g)].map((m) => m[1])));
    const ids = [...featured].filter((id) => my[id] && JY.byId[id]);
    if (!ids.length || relAware(n)) continue;
    out.push({ p, n, kind, ids: ids.map((id) => JY.byId[id].name + '（' + my[id] + '）') });
  }
}
const byP = {};
out.forEach((x) => { (byP[x.p.name] = byP[x.p.name] || []).push(x); });
for (const k in byP) {
  console.log('\n' + k + '：');
  byP[k].forEach((x) => console.log('  ' + x.n.id + ' 〔' + x.kind + '〕' + x.n.t + ' —— 提到 ' + x.ids.join('、')));
}
console.log('\n可疑 ' + out.length + ' 处（熟人关系 ' + Object.keys(ties).length + ' 人有记录' + ((JY.RELATIONS || []).length ? '，来自关系表' : '，来自 family 和剧情推断') + '）。');

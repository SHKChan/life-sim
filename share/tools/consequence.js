#!/usr/bin/env node
/* 后果检查：每个抉择的选项，是否真的影响后面的剧情。
 * 用法：node share/tools/consequence.js <游戏目录> [人物id|书文件名 ...] [--list]
 *   例：node share/tools/consequence.js jianghuyimeng shendiao --list
 *
 * 一个选项算“有后果”，满足任一条：
 *   - 设了改命标记（g.set），而这个标记在别处被读到（g.f）
 *   - 记下这一世的记忆（g.remember），而后面有节点读它（g.recall / g.since）
 *   - 杀了人、让玩家死（g.kill / g.die / fatal）
 *   - 改了师承家人、门派身份、去处（g.rel / g.unrel / g.info / g.move）
 * 只改属性（g.stat）算“轻后果”：会影响以后的判定成功率，但剧情文字不会变。
 *
 * 报告：
 *   - 选项数不在 2–4 的抉择
 *   - 只有一个选项有后果的抉择（选什么都一样）
 *   - 设了却没人读的标记（死标记）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function srcOf(fn) { return typeof fn === 'function' ? fn.toString() : ''; }

/* 分析：JY 是载入数据后的全局对象，dataSrc 是 { 文件名: 源码 }。 */
function analyze(JY, dataSrc) {
  const allSrc = Object.values(dataSrc).join('\n');
  const reads = {};
  // 改命标记 g.set/g.f（跨世），这一世的记忆 g.remember/g.recall/g.since，名字前加 mem: 区分
  for (const m of allSrc.matchAll(/\.f\(\s*'([^']+)'\s*\)/g)) reads[m[1]] = (reads[m[1]] || 0) + 1;
  for (const m of allSrc.matchAll(/\.(?:recall|since)\(\s*'([^']+)'\s*\)/g)) reads['mem:' + m[1]] = (reads['mem:' + m[1]] || 0) + 1;
  const sets = {};
  for (const m of allSrc.matchAll(/\.set\(\s*'([^']+)'/g)) sets[m[1]] = (sets[m[1]] || 0) + 1;
  for (const m of allSrc.matchAll(/\.remember\(\s*'([^']+)'/g)) sets['mem:' + m[1]] = (sets['mem:' + m[1]] || 0) + 1;
  const fileOf = (id) => {
    for (const f in dataSrc) if (dataSrc[f].includes("id: '" + id + "'")) return f.replace(/^.*data\/|\.js$/g, '');
    return '?';
  };
  const weight = (ch) => {
    const src = srcOf(ch.fx) + srcOf(ch.fail && ch.fail.fx);
    const flags = [...src.matchAll(/\.set\(\s*'([^']+)'/g)].map((m) => m[1])
      .concat([...src.matchAll(/\.remember\(\s*'([^']+)'/g)].map((m) => 'mem:' + m[1]));
    const readFlags = flags.filter((f) => reads[f]);
    if (readFlags.length) return { k: 'flag', d: readFlags.join(',') };
    if (ch.fatal || /\.(kill|die)\(/.test(src)) return { k: 'life', d: 'kill/die' };
    if (/\.(rel|unrel|info|move)\(/.test(src)) return { k: 'state', d: 'rel/info/move' };
    // 游戏自己的工具函数（game.js 的 stateCalls，例如结婚、买房、搬家）也算有后果
    const call = ((JY.GAME && JY.GAME.stateCalls) || []).find((name) => src.includes(name + '('));
    if (call) return { k: 'state', d: call };
    if (flags.length) return { k: 'dead', d: flags.join(',') };
    if (/\.stat\(/.test(src)) return { k: 'stat', d: '' };
    return { k: 'none', d: '' };
  };
  const nodes = [];
  for (const c of JY.CHARS) if (c.arc) {
    for (const n of c.arc.nodes) if (!n.auto) nodes.push({ n, owner: c.id });
    for (const n of c.arc.pauses || []) nodes.push({ n, owner: c.id });
  }
  for (const n of JY.LIFE_NODES || []) if (!n.auto) nodes.push({ n, owner: 'life' });
  for (const n of JY.ENCOUNTERS) if (!n.auto) nodes.push({ n, owner: 'enc' });
  for (const n of JY.PAUSES) nodes.push({ n, owner: 'pause' });
  nodes.forEach((x) => {
    x.file = fileOf(x.n.id);
    x.ws = (x.n.choices || []).map(weight);
    x.heavy = x.ws.filter((w) => w.k === 'flag' || w.k === 'life' || w.k === 'state').length;
  });
  const deadFlags = Object.keys(sets).filter((f) => !reads[f]);
  return { nodes, deadFlags, reads, sets };
}
module.exports = { analyze };

if (require.main === module) {
  const repo = path.join(__dirname, '..', '..');
  const gameArg = process.argv[2];
  const gameDir = path.join(repo, gameArg || '');
  if (!gameArg || !fs.existsSync(path.join(gameDir, 'index.html'))) {
    console.error('用法：node share/tools/consequence.js <游戏目录> [人物id|书文件名 ...] [--list]');
    process.exit(2);
  }
  const args = process.argv.slice(3);
  const LIST = args.includes('--list');
  const filters = args.filter((a) => a !== '--list');
  const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
  // SIM_DATA=childhood,youth 只载入这几个数据文件（data/world.js 和 data/relations.js 总会载入），并行写作时不受别人半成品的影响
  const onlyFiles = (process.env.SIM_DATA || '').split(',').filter(Boolean);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/(ui|pixel|sharecard)\.js$/.test(s))
    .filter((s) => !onlyFiles.length || !/^data\//.test(s) || /data\/(world|relations)\.js$/.test(s) || onlyFiles.some((b) => s === 'data/' + b + '.js'));
  const ctx = { console, Math, JSON, Date, localStorage: { getItem: () => null, setItem: () => {} } };
  ctx.window = ctx;
  vm.createContext(ctx);
  const dataSrc = {};
  for (const s of scripts) {
    const code = fs.readFileSync(path.join(gameDir, s), 'utf8');
    vm.runInContext(code, ctx, { filename: s });
    if (/^data\//.test(s)) dataSrc[s] = code;
  }
  const { nodes, deadFlags } = analyze(ctx.JY, dataSrc);
  const sel = nodes.filter(({ n, owner, file }) => !filters.length || filters.includes(owner) || filters.includes(file) || filters.includes(n.id));
  const badCount = [], flat = [], byOwner = {};
  for (const x of sel) {
    const ch = x.n.choices || [];
    const o = (byOwner[x.owner] = byOwner[x.owner] || { n: 0, heavy: 0, opts: 0 });
    o.n++; o.opts += ch.length;
    if (x.heavy >= 2) o.heavy++;
    // 带 cond 的选项按情况显示，可见数由 simulate 实测；这里只查没有条件选项的抉择
    if (!ch.some((c) => c.cond) && (ch.length < 2 || ch.length > 4)) badCount.push(x.n.id + '(' + ch.length + ')');
    if (x.heavy < 2) flat.push(x);
    if (LIST) {
      console.log('\n' + x.n.id + ' 〔' + x.owner + '/' + x.file + '〕 ' + x.n.t);
      ch.forEach((c, i) => console.log('   ' + (c.canon ? '原' : '  ') + ' ' + x.ws[i].k.padEnd(5) + ' ' + c.t + (x.ws[i].d ? '  [' + x.ws[i].d + ']' : '')));
    }
  }
  console.log('\n抉择 ' + sel.length + ' 个。按人物：');
  for (const k in byOwner) {
    const o = byOwner[k];
    console.log('  ' + k.padEnd(12) + ' 抉择 ' + String(o.n).padStart(3) + '  平均选项 ' + (o.opts / o.n).toFixed(1) + '  有分支的 ' + o.heavy + '（' + Math.round(o.heavy * 100 / o.n) + '%）');
  }
  if (badCount.length) console.log('\n选项数不在 2–4 的 ' + badCount.length + ' 个：' + badCount.join(', '));
  console.log('\n选什么都差不多（有后果的选项少于 2 个）' + flat.length + ' 个：');
  console.log('   ' + flat.map((x) => x.n.id).join(', '));
  console.log('\n设了没人读的标记 ' + deadFlags.length + ' 个：' + deadFlags.join(', '));
}

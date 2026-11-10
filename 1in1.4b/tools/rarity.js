#!/usr/bin/env node
/* 生成 data/rarity.js：稀有度和成就的统计表（data/legacy.js 用）
 *   node 1in1.4b/tools/rarity.js [次数=3000]
 * 无界面跑很多次人生（选法同界面的“自动”：七成照大多数人选），统计：
 *   f    每一项结果（出身、家庭、学历、职业、婚姻、孩子、城市等级、寿命段）各自占几成
 *   q    “这一生有多少见”的分数（各项比例取对数相加）分成 200 份的分位点，用来算“比百分之几的人生少见”
 *   ach  每个成就有百分之几的人生能解锁
 * 剧情、经济、成就规则改了以后重跑一次。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const dir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
  .filter((s) => !/(ui|pixel|sharecard|qrcode|rarity)\.js$/.test(s) && !/^(https?:|\/)/.test(s) && !/scenes\.js$/.test(s));
const store = {};
const ctx = { console, Math, JSON, Date, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } } };
ctx.window = ctx;
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(dir, s), 'utf8'), ctx, { filename: s });
const JY = ctx.JY, E = JY.engine;
const N = Number(process.argv[2]) || 3000;
const lives = [];
for (let i = 0; i < N; i++) {
  E.reset();
  E.startRandom();
  let r = E.peek();
  if (r.type === 'idle') r = E.nextYear();
  let guard = 0;
  while (guard++ < 400) {
    if (r.type === 'death') break;
    if (r.type === 'node') {
      const opts = E.choices(r.node);
      const canon = opts.filter((o) => o.ch.canon);
      const p = canon.length && Math.random() < 0.7 ? canon[0] : opts[Math.floor(Math.random() * opts.length)];
      E.choose(p.i);
      r = E.flush();
      continue;
    }
    r = E.nextYear();
  }
  lives.push(E.finish('x'));
}
const f = {};
lives.forEach((l) => { const k = JY.lifeKeys(l.snap); Object.keys(k).forEach((d) => { (f[d] = f[d] || {})[k[d]] = (f[d][k[d]] || 0) + 1; }); });
Object.keys(f).forEach((d) => Object.keys(f[d]).forEach((v) => { f[d][v] = Math.round(f[d][v] / N * 10000) / 10000; }));
const score = (s) => { const k = JY.lifeKeys(s); let lp = 0; Object.keys(k).forEach((d) => { lp += Math.log10(Math.max(f[d][k[d]] || 0.002, 0.002)); }); return -lp; };
const sc = lives.map((l) => score(l.snap)).sort((a, b) => a - b);
const q = [];
for (let i = 0; i < 200; i++) q.push(Math.round(sc[Math.floor(i / 200 * sc.length)] * 1000) / 1000);
const ach = {};
JY.ACH.forEach((a) => { ach[a.id] = Math.round(lives.filter((l) => l.ach.includes(a.id)).length / N * 1000) / 10; });
const out = '/* 由 tools/rarity.js 生成（' + N + ' 次人生），不要手改。规则改了以后重跑：node 1in1.4b/tools/rarity.js */\n'
  + 'window.JY.RARITY = ' + JSON.stringify({ n: N, f, q, ach }) + ';\n';
fs.writeFileSync(path.join(dir, 'data', 'rarity.js'), out);
console.log('写好 data/rarity.js（' + N + ' 次）。成就解锁比例：');
JY.ACH.forEach((a) => console.log('  ' + a.t + ' ' + ach[a.id] + '%'));
const med = sc[sc.length >> 1];
console.log('一生稀有度中位数：大约 ' + Math.round(Math.pow(10, med)) + ' 人里一个；最少见的 1%：' + Math.round(Math.pow(10, sc[Math.floor(sc.length * 0.99)])));

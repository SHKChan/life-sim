/* v2.1.11：寿命校准、抽样去重、好友对比/今日同命、英文版完整度、学历线。不加载界面。
 *   node 1in1.4b/tools/check-v211.js [人生数=120]
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const dir = path.join(__dirname, '..');
const N = Number(process.argv[2]) || 120;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1])
  .filter((s) => !/^(https?:|\/)/.test(s) && !/(ui|pixel|sharecard|qrcode|nav)\.js$|scenes\.js$/.test(s));

function boot(opts) {
  opts = opts || {};
  const store = Object.assign({}, opts.store || {});
  const ctx = {
    console: { log() {}, warn() {}, error: console.error }, JSON, Date, Math,
    location: { search: opts.search || '', pathname: '/life-sim/1in1.4b/', hash: '', protocol: 'https:' },
    history: { replaceState() { ctx.location.search = ''; } },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    navigator: { language: 'zh-CN' }, document: undefined,
  };
  ctx.window = ctx; vm.createContext(ctx);
  const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p });
  for (const s of scripts) run(path.join(dir, s));
  const JY = ctx.JY;
  if (opts.lang && opts.lang !== 'zh') {   // 同 share/i18n.js 的 loadLangData：先清空中文数据，再按顺序载入译文
    JY.LANG = opts.lang;
    const done = JY.GAME.langFiles && JY.GAME.langFiles[opts.lang];
    run(path.join(dir, 'lang', opts.lang, 'game.js')); JY.resetData();
    for (const s of scripts.filter((x) => /^data\//.test(x))) {
      const f = s.replace(/^data\//, '');
      run(path.join(dir, !done || done.includes(f) ? path.join('lang', opts.lang, f) : s));
    }
  }
  JY.engine.save = () => {};
  return ctx;
}
const CJK = /[一-鿿]/;
function play(ctx, pick) {
  const E = ctx.JY.engine; let r, guard = 0, asked = 0;
  while (guard++ < 900) {
    r = E.nextYear(); if (!r) break;
    if (r.type === 'node') { const o = E.choices(r.node); asked++; E.choose(pick(o)); r = E.flush(); }
    if (r && r.type === 'death') break;
  }
  const L0 = E.get().L, done = Object.keys(L0.done || {}), mem = Object.assign({}, L0.mem), log = L0.log.slice();
  return { life: E.finish('x'), asked, done, mem, log };
}
const canon = (o) => (o.find((x) => x.ch.canon) || o[0]).i;

// 1 寿命：平均寿命、早逝比例、死因多样
{
  const ctx = boot(); const ages = [], causes = {};
  for (let i = 0; i < N; i++) { ctx.JY.engine.reset(); ctx.JY.engine.startRandom(); const { life } = play(ctx, canon); ages.push(life.to - life.born); causes[life.end.t] = 1; }
  ages.sort((a, b) => a - b);
  const mean = ages.reduce((a, b) => a + b, 0) / ages.length, young = ages.filter((a) => a < 60).length / ages.length;
  assert.ok(mean >= 74 && mean <= 88, '平均寿命应在 74–88 岁，实际 ' + mean.toFixed(1));
  assert.ok(young < 0.15, '60 岁前离世应少于 15%，实际 ' + (young * 100).toFixed(0) + '%');
  assert.ok(Object.keys(causes).length >= 6, '死因应多样');
  console.log('寿命通过：平均 ' + mean.toFixed(1) + '，60 岁前 ' + (young * 100).toFixed(0) + '%，死因 ' + Object.keys(causes).length + ' 种');
}
// 2 抽样：同一出身（同种子）重复游玩的生平行有差异；关键节点不被抽掉
{
  const a = boot(); assert.ok(a.JY.VARIETY && a.JY.VARIETY.thinned > 0, 'variety.js 应已包装若干节点');
  const keep = ['c_born', 'c_first_year', 'c_zhuazhou'];
  const seen = new Set();
  for (let i = 0; i < 12; i++) { a.JY.engine.reset(); a.JY.engine.startRandom(); const { done: ids } = play(a, canon); keep.forEach((k) => assert.ok(ids.includes(k) || !a.JY.byId[k], '不应抽掉 ' + k)); ids.forEach((x) => seen.add(x)); }
  console.log('抽样通过：包装 ' + a.JY.VARIETY.thinned + ' 个节点，12 世共出现 ' + seen.size + ' 种节点');
}
// 3 好友对比 + 今日同命
{
  const A = boot(); const GA = A.JY.GAME;
  GA.onAction('daily', {}, { start: () => A.JY.engine.startRandom() });
  const gA = A.JY.engine.get().W.gen[0]; const lifeA = play(A, canon).life;
  assert.ok(lifeA.daily, '今日同命要记下日期');
  const B = boot(); B.JY.GAME.onAction('daily', {}, { start: () => B.JY.engine.startRandom() });
  const gB = B.JY.engine.get().W.gen[0];
  assert.equal(gB.name, gA.name, '同一天的出身应相同'); assert.equal(gB.mem.seed, gA.mem.seed);
  A.JY.siteUrl = () => 'https://x.test/1in1.4b/';
  const url = GA.share.url(lifeA); assert.match(url, /[?&]s=[0-9a-z]+&f=[0-9a-z]{1,2}-\d{1,3}-m?\d+/, '分享链接带种子和结局');
  const C = boot({ search: url.slice(url.indexOf('?')) });
  C.JY.engine.reset(); C.JY.engine.startRandom();
  assert.equal(C.JY.engine.get().W.gen[0].name, gA.name, '朋友链接出身相同');
  const lifeC = play(C, canon).life; assert.ok(lifeC.friend && lifeC.friend.age === lifeA.to - lifeA.born, '朋友结局应解出');
  const D = boot({ search: '?s=abc&f=zz-999-999' }); D.JY.engine.reset(); D.JY.engine.startRandom();
  assert.equal(play(D, canon).life.friend, null, '非法的 f 参数应被忽略');
  console.log('同命通过：今日同命同出身、分享链接带结局、朋友对比、非法参数');
}
// 4 英文版：数据文件无遗留中文、界面词表覆盖
{
  const ctx = boot({ lang: 'en', store: { 'vibe.lang': 'en' } }); let lines = 0; const hit = {};
  for (let i = 0; i < Math.min(N, 80); i++) {
    ctx.JY.engine.reset(); ctx.JY.engine.startRandom();
    for (const e of play(ctx, canon).log) { lines++; if (CJK.test(e.t)) hit[e.t.slice(0, 40)] = 1; }
  }
  assert.equal(Object.keys(hit).length, 0, '英文版生平行不应有中文：' + Object.keys(hit).slice(0, 3).join(' / '));
  for (const f of ctx.JY.GAME.langFiles.en) assert.ok(fs.existsSync(path.join(dir, 'lang', 'en', f)), '缺英文文件 ' + f);
  console.log('英文版通过：' + lines + ' 行生平无中文，' + ctx.JY.GAME.langFiles.en.length + ' 个数据文件已译');
}
// 5 学历线：本科及以上约四到六成，不再八成以上
{
  const ctx = boot(); const edu = {};
  for (let i = 0; i < N; i++) {
    ctx.JY.engine.reset(); ctx.JY.engine.startRandom();
    const m = play(ctx, (o) => o[Math.floor(Math.random() * o.length)].i).mem.edu; const k = m == null ? '-' : (typeof m === 'object' ? m.v : m); edu[k] = (edu[k] || 0) + 1;
  }
  const hi = ((edu.bachelor || 0) + (edu.master || 0) + (edu.phd || 0)) / N;
  assert.ok(hi >= 0.2 && hi <= 0.65, '随机选法下本科及以上应在 20%–65%，实际 ' + (hi * 100).toFixed(0) + '%');
  console.log('学历线通过：随机选法本科及以上 ' + (hi * 100).toFixed(0) + '%');
}
console.log('v2.1.11 检查全部通过');

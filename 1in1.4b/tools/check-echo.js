/* 用真实生成器、判定和存档验证跨世残响，不依赖UI。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const dir = path.join(__dirname, '..');
const files = [...fs.readFileSync(path.join(dir, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
  .filter((p) => !p.startsWith('/') && !/(ui|pixel|sharecard|scenes)\.js$/.test(p));
function boot(store = {}, search = '') {
  const ctx = { console, Math: Object.create(Math), Date, JSON, location: { search }, history: { replaceState() {} },
    localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } } };
  ctx.window = ctx; vm.createContext(ctx);
  files.forEach((p) => vm.runInContext(fs.readFileSync(path.join(dir, p), 'utf8'), ctx, { filename: p }));
  return ctx;
}
const key = '1in1.4b.album.v1';
function ageAt(J, age) { const { L, W } = J.engine.get(); L.year = J.byId[L.cid].born + age; W.year = L.year; }
function finish(J, age = 80) { ageAt(J, age); J.engine.get().L.death = '寿终正寝'; return J.engine.finish('认真过了。'); }
function carry(k) {
  const store = {}, ctx = boot(store), J = ctx.JY, E = J.engine;
  E.startRandom(); const life = finish(J);
  assert.equal(life.echoOffers.length, 3);
  assert(J.ECHO.select(J.ECHO.sourceOf(life), k)); E.startRandom();
  assert(J.ECHO.active(E.G, k)); assert(!J.album().pendingEcho);
  return { ctx, J, E, store, life };
}
{
  const { J, E, ctx, store, life } = carry('craft'), g = E.G;
  assert(!J.ECHO.select(J.ECHO.sourceOf(life), 'self'), '新世开始后不能从旧结算重领');
  ageAt(J, 22); g.remember('lifePath', 'work'); J.CN.goCity(g, 1, g.recall('city') === '上海' ? '深圳' : '上海'); g.remember('job', 'worker'); g.remember('money0', true); g.remember('skill', null); g.remember('cash', 2999);
  const n = J.LIFE_NODES.find((n) => n.id === 'y_worker22'); assert(n.cond(g), '目标节点必须实际可达');
  assert(!E.choices(n).some((o) => o.ch.echo === 'craft'), '现金不足不开放');
  g.remember('cash', 10000); const option = E.choices(n).find((o) => o.ch.echo === 'craft'); assert(option);
  assert(E.choices(n).length <= 4); assert(!g.recall('echoUsed'), '预览不消耗');
  E.get().L.queue = [n.id]; E.choose(option.i);
  assert.equal(J.CN.cash(g), 7000); assert.equal(g.recall('skill'), 'elec'); assert.equal(g.recall('job'), 'electrician');
  assert.equal(g.recall('echoUsed'), true); assert(!E.choices(n).some((o) => o.ch.echo));
  E.save(); const reload = boot(store).JY; reload.engine.load();
  assert.equal(reload.engine.G.recall('echoUsed'), true, '完整重载后也不能再次使用');
  assert(!reload.ECHO.active(reload.engine.G, 'craft'));
  finish(J); E.startRandom(); assert(!g.recall('echoCarry'), '没有重新选择就不再继承');
  ctx.Math.random = Math.random;
}
for (const success of [true, false]) {
  const { J, E, ctx } = carry('self'), g = E.G;
  ageAt(J, 34); g.remember('job', 'office'); g.remember('gift', null); g.remember('money0', true); g.remember('cash', 50000);
  E.get().L.st['事业'] = 55;
  const n = J.LIFE_NODES.find((n) => n.id === 't_rewrite_remote'), base = n.choices[1];
  const option = E.choices(n).find((o) => o.ch.echo === 'self'); assert(option);
  g.remember('echoUsed', true); assert.equal(E.odds(base.check), 50); g.remember('echoUsed', false);
  assert.equal(E.odds(option.ch.check), 58);
  assert.equal(E.odds(['事业', 55]), 50, '其他判定不获得加成');
  assert.equal(E.odds(option.ch.check), 58); assert(!g.recall('echoUsed'));
  E.get().L.queue = [n.id]; ctx.Math.random = () => success ? 0 : 0.99999; E.choose(option.i);
  assert.equal(g.recall('echoUsed'), true); assert.equal(g.recall('rewrite').ok, success);
  assert.equal(J.CN.cash(g), 38000); assert.equal(E.odds(option.ch.check), Math.max(5, Math.min(95, 50 + (g.s('事业') - 55) * 3)));
}
{
  const { J, E } = carry('home'), g = E.G;
  ageAt(J, 38); g.remember('gift', null); g.remember('love', 'married'); g.remember('marriage', 'cold');
  g.spawn({ id: 'sp', name: '测试伴侣', sex: '女', born: 2026, origin: '伴侣' });
  g.remember('gift', 'sleep');
  const full = J.LIFE_NODES.find((n) => n.id === 'y_crisis31');
  assert.equal(E.choices(full).length, 4); assert(!E.choices(full).some((o) => o.ch.echo === 'home'), '已有四项时不加第五项');
  g.remember('gift', null);
  const n = J.LIFE_NODES.find((n) => n.id === 'm_38_marriage');
  const option = E.choices(n).find((o) => o.ch.echo === 'home'); assert(option);
  const before = g.s('事业'); E.get().L.queue = [n.id]; E.choose(option.i);
  assert.equal(g.recall('marriage'), 'mended'); assert.equal(g.recall('echoUsed'), true); assert(g.s('事业') <= before);
}
{
  const { J, E } = carry('home'); finish(J, 50); E.startRandom();
  assert(!E.G.recall('echoCarry'), '上一世未用的残响也不能顺延');
}
{
  const { J, E, ctx } = carry('craft'), g = E.G;
  ageAt(J, 34); g.remember('lifePath', 'work'); g.remember('job', 'office'); g.remember('money0', true); g.remember('cash', 50000);
  E.get().L.queue = ['y_last34']; ctx.Math.random = () => 0; E.choose(2);
  assert(J.ECHO.active(g, 'craft'), '普通单干选项不能误消耗手艺残响');
}
{
  const store = {}, ctx = boot(store), J = ctx.JY; J.engine.startRandom();
  const life = finish(J, 15); assert.equal(life.echoOffers.length, 2);
  const source = J.ECHO.sourceOf(life);
  assert(J.ECHO.select(source, 'craft')); assert(J.ECHO.select(source, 'self'));
  assert.equal(J.album().pendingEcho, 'self', '换选只保留一项');
  assert(!J.ECHO.select(source, 'unknown')); assert(J.ECHO.select(source, '')); assert(!J.album().pendingEcho);
  const reloaded = boot(store).JY; reloaded.engine.load();
  const esc = (v) => String(v), card = (t, s, b) => '<div>' + t + s + b + '</div>';
  assert(reloaded.GAME.homeCards(reloaded.engine.get().W, { esc, card }).includes('data-echo-source'), '刷新后首页仍可选择');
}
{
  const store = { [key]: JSON.stringify({ pendingEcho: 'self' }) };
  const ctx = boot(store, '?s=abc'), J = ctx.JY; J.engine.startRandom();
  assert.equal(J.engine.G.recall('seedFrom'), true); assert(!J.engine.G.recall('echoCarry'));
  const plain = boot({}, '?s=abc').JY; plain.engine.startRandom();
  assert.equal(JSON.stringify(J.engine.get().L.mem), JSON.stringify(plain.engine.get().L.mem), '同命挑战的出生状态不受待用残响影响');
  assert(!J.album().pendingEcho); J.engine.startRandom(); assert(!J.engine.G.recall('echoCarry'), '挑战后不顺延');
}
{
  const store = { [key]: JSON.stringify({ pendingEcho: 'craft' }) }, ctx = boot(store);
  ctx.localStorage.setItem = () => { throw Error('quota'); };
  assert(!ctx.JY.GENERATE().me.mem.echoCarry, '清除领取记录失败时不发放残响');
}
{ const ctx = boot({ [key]: JSON.stringify({ pendingEcho: 'constructor' }) }); assert(!ctx.JY.GENERATE().me.mem.echoCarry, '忽略未知残响键'); }
console.log('通过：候选/换选/清除、只继承下一世、一次消耗、读档、成败费用、8点概率、家庭修补、同命挑战与存储失败。');

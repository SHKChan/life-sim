/* 指定六条路线的成败与存档边界，使用真实引擎。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..');
const files = [...fs.readFileSync(path.join(dir, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((p) => !p.startsWith('/') && !/(ui|pixel|sharecard|scenes)\.js$/.test(p));
function boot() {
  const store = {}, ctx = { console, Math: Object.create(Math), Date, JSON, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } } };
  ctx.window = ctx; vm.createContext(ctx);
  files.forEach((p) => vm.runInContext(fs.readFileSync(path.join(dir, p), 'utf8'), ctx, { filename: p }));
  ctx.JY.engine.startRandom(); return ctx;
}
for (let i = 0; i < 6; i++) for (const success of [true, false]) {
  const ctx = boot(), J = ctx.JY, E = J.engine, g = E.G, L = E.get().L, route = J.TURNING.ROUTES[i];
  L.year = J.byId[L.cid].born + route.age; E.get().W.year = L.year;
  g.remember('money0', true); g.remember('seed', i % 3); g.remember('job', 'office'); g.remember('cash', route.fee - 1);
  const n = J.LIFE_NODES.find((n) => n.id === 't_rewrite_' + route.k);
  assert(n.cond(g)); assert(!E.choices(n).some((o) => o.i === 1)); assert.equal(E.choices(n).length, 2);
  g.remember('cash', route.fee + 50000); const before = J.CN.cash(g);
  L.queue = [n.id]; ctx.Math.random = () => success ? 0 : 0.99999;
  E.choose(1);
  assert.equal(J.CN.cash(g), before - route.fee); assert.equal(g.recall('rewrite').ok, success);
  assert.equal(g.recall('job'), success ? route.job : 'office');
  assert(J.TURNING.ROUTES.every((r, j) => !J.TURNING.eligible(g, r, j)));
  E.save(); E.load(); assert.equal(E.G.recall('rewrite').ok, success);
  const echo = J.LIFE_NODES.find((x) => x.id === n.id + '_echo');
  assert(echo.cond(g)); assert.equal(echo.text(g), success ? route.echoYes : route.echoNo);
  L.death = '寿终正寝'; const life = { to: L.year, born: J.byId[L.cid].born, picks: L.picks, dev: 10 };
  J.GAME.engine.onFinish(g, life); assert(life.review); assert(Array.isArray(life.otherEnds)); assert(J.album().ends[life.end.k]); assert(life.turns.some((p) => p.t === route.t));
  life.note = '认真生活'; assert(J.GAME.share.badges(life)[0].includes(life.note));
}
const { JY: J } = boot();
const sample = { age: 101, net: 100000, family: 'worker', hukou: 'rural', edu: 'phd', st: {} };
assert.equal(J.FATE.endOf(sample).k, 'phd');
assert(J.FATE.ENDS.every((e) => e.hint));
console.log('通过：六条路线成功/失败、等额成本、现金边界、一次限制、存档重读、回响、评语分享和结局优先级。');

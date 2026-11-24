/* 寿命的底子：每年按年龄、健康、透支算一次离世的可能，死因随年龄变。
 * 原来只有“过了寿限才开始死”，健康好的人几乎都活到九十岁以上、死因都是寿终正寝。
 * 这里补上一张接近真实的年龄死亡率表（30 岁起），健康高的人少担一些风险，不再整齐地活到同一个岁数。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME;
  // [起始年龄, 年死亡率]（健康 50 的基准）
  const Q = [[30, 0.0008], [40, 0.0014], [45, 0.0017], [50, 0.0023], [55, 0.0036], [60, 0.0055], [65, 0.0098], [70, 0.0185],
    [75, 0.031], [80, 0.053], [85, 0.09], [90, 0.17], [95, 0.26], [100, 0.38]];
  const base = (age) => { let r = 0; Q.forEach((x) => { if (age >= x[0]) r = x[1]; }); return r; };
  const CAUSE = {
    mid: ['因心脏病去世', '因癌症去世', '死于一场车祸', '因脑出血去世', '病逝'],
    old: ['因癌症去世', '因心脏病去世', '因脑梗去世', '病逝', '因肺部感染去世'],
    late: ['寿终正寝', '在睡梦中离世', '病逝', '因肺部感染去世', '寿终正寝'],
  };
  const causeOf = (g, age) => {
    const pool = age < 60 ? CAUSE.mid : age < 80 ? CAUSE.old : CAUSE.late;
    return pool[Math.floor(g.rnd() * pool.length)];
  };
  const hazard = (g, age) => {
    const H = g.s('健康');
    const m = Math.max(0.7, Math.min(1.3, 1.3 - 0.6 * H / 100));
    return base(age) * m;
  };
  JY.LIFETABLE = { base, hazard, causeOf };
  const prev = G.engine.yearEnd;
  G.engine.yearEnd = (g, age) => {
    if (prev) prev(g, age);
    const L = JY.engine.get().L;
    if (!L || L.death || age < 30) return;
    if (g.rnd() < hazard(g, age)) g.die(causeOf(g, age));
  };
})();

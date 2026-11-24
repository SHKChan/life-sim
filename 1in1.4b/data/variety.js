/* 每一世只经历一部分“日子里的小事”。
 * 以前每个人在同样的年纪看到同样的一批自动小事（第一次开口、红包、冬至、修鞋摊……），两世之间八成的节点是重复的。
 * 这里给每一世一个隐藏的种子，按种子让一部分纯文字的小事这一世不出现。只动那些不设记忆、没有别的节点读它、也没有回响指向它的自动节点，
 * 所以不会让后面的剧情接不上；同一世里刷新、读档，出现哪些是固定的。 */
(function () {
  'use strict';
  const JY = window.JY;
  const KEEP = /^(c_born|c_first_year|c_zhuazhou|c_gift12|m_gift38|p\d+)$/;
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
  const seedOf = (g) => {
    let s = g.recall('varSeed');
    if (!s) { s = 1 + Math.floor(Math.random() * 2147483000); g.remember('varSeed', s); }
    return s;
  };
  const all = JY.LIFE_NODES.concat(JY.ENCOUNTERS);
  const src = (n) => [n.cond, n.text, n.fx, n.ok, n.res].map((f) => (typeof f === 'function' ? String(f) : '')).join('\n')
    + JSON.stringify(n.choices ? n.choices.map((c) => [String(c.cond || ''), String(c.fx || ''), String(c.res || '')]) : '');
  const text = all.map(src).join('\n');
  const echoed = new Set(all.map((n) => n.echoOf).filter(Boolean));
  const refs = (id) => { const re = new RegExp('[\'".\\[]' + id + '\\b', 'g'); return (text.match(re) || []).length; };
  let thinned = 0;
  all.forEach((n) => {
    if (!n.auto || n.choices || n.major || n.echoOf || KEEP.test(n.id)) return;
    if (/remember|\.set\(|\.die\(|spawn|marry|\.move\(|\.info\(|pay\(|earn\(|\.stat\(/.test(src(n).replace(/String\(/g, '')) && !/^e_daily_|^e_t_/.test(n.id)) return;
    if (echoed.has(n.id)) return;
    if (refs(n.id) > 1) return; // 别的节点的条件或文字提到了它
    const keep = /^e_daily_|^e_t_/.test(n.id) ? 0.5 : 0.58;
    const own = n.cond;
    n.cond = (g) => hash(n.id + ':' + seedOf(g)) < keep && (!own || own(g));
    thinned++;
  });
  JY.VARIETY = { thinned };
})();

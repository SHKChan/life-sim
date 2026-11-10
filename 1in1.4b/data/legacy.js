/* 十四亿分之一 · 复玩：稀有度、成就、人生图鉴、志向达成度、转折线
 * 命终时（engine 的 onFinish 钩子）把这一世要用的东西记到 life 上：
 *   life.snap  这一世的几项结果（户籍、家庭、学历、职业、婚姻、孩子、住在哪一级城市、净资产……）
 *   life.st    临终时的属性
 *   life.rare  稀有度：这样的一生大约多少人里有一个（oneIn），比百分之几的人生少见（pct）
 *   life.ach   这一世解锁的成就 id
 *   life.aim   十六岁的志向，达成了几成（0–100）
 * 稀有度和成就的“几成人解锁”按 data/rarity.js 的统计表算（tools/rarity.js 跑几千次人生生成，规则改了要重跑）。
 * 人生图鉴存在 localStorage 的 1in1.4b.album.v1，和投胎记录分开：清空投胎记录不会清掉图鉴。
 * 墓志页、首页、分享卡通过 game.js 的 endCards / homeCards / share.badges 显示这些。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const G = JY.GAME;
  const fmt = (x) => CN.fmt(x);
  const ALBUM_KEY = '1in1.4b.album.v1';
  const FIRST_TIER = ['北京', '上海', '广州', '深圳'];

  /* ---------- 这一世的结果 ---------- */
  const EDU_T = { primary: '小学', junior: '初中', vocational: '职高中专', senior: '高中', college: '大专', bachelor: '本科', master: '硕士', phd: '博士' };
  const JOB_T = { none: '没有正经工作', farmer: '种地', worker: '工人', rider: '骑手', driver: '司机', shop: '开店', office: '公司职员', tech: '技术岗', civil: '公务员', teacher: '老师', doctor: '医生', nurse: '护士', sales: '销售', boss: '老板', creator: '自媒体', soldier: '军人', freelance: '自由职业', retired: '退休' };
  const FAM_T = { rich: '富裕人家', civil: '体制内家庭', white: '职员家庭', smallbiz: '个体户家庭', worker: '工人家庭', farmer: '农户', migrant: '父母外出打工' };
  const HUKOU_T = { city: '城镇', county: '县城', rural: '农村' };
  // 稀有度用的几项（和 tools/rarity.js 的统计口径一致）
  const ageBand = (a) => (a < 60 ? '<60' : a < 70 ? '60s' : a < 80 ? '70s' : a < 90 ? '80s' : a < 100 ? '90s' : '100+');
  const kidBand = (k) => (k >= 3 ? '3+' : String(k || 0));
  JY.lifeKeys = (s) => ({
    hukou: s.hukou || 'rural', fam: s.family || 'worker', edu: s.edu || 'junior', job: s.lastJob || s.job || 'none',
    love: s.love || 'single', kids: kidBand(s.kids), tier: String(s.tier || 5), age: ageBand(s.age),
  });

  function snap(g, life) {
    const r = (k) => g.recall(k);
    const s = {
      hukou: r('hukou'), family: r('family'), leftBehind: !!r('leftBehind'), prov: r('prov'), region: r('region'),
      edu: r('edu'), gk: r('gk'), uni: r('uni'), job: r('job'), lastJob: r('preJob') || r('job'), love: r('love'), kids: r('kids') || 0,
      tier: r('tier') || 5, workCity: r('workCity'), house: r('house'), backHome: r('backHome'), startup: r('startup'), biz: r('biz'),
      ladder: r('ladder50') || r('ladder40'), aiMove: r('aiMove'), kidPlan: r('kidPlan'), remarried: !!r('remarried'),
      hyBlown: Number(r('hyBlown')) || 0, crash: r('crash'), finGain: Number(r('finGain')) || 0, paAcct: Number(r('paAcct')) || 0,
      net: Math.round(CN.net(g)), age: life.to - life.born, city: r('city'),
    };
    // 退休以后职业写成“退休”，稀有度和成就看退休前的那一行
    if (s.lastJob === 'retired') s.lastJob = r('preJob') || 'office';
    const L = JY.engine.get().L;
    s.seen = ['o_great_gk', 'e_t_maglev', 'o_hundred'].filter((id) => L.done[id]);
    return s;
  }

  /* ---------- 稀有度 ---------- */
  // 这一生大约多少人里有一个：把几项结果各自的比例乘起来（data/rarity.js 的 f）
  function rarity(s) {
    const R = JY.RARITY;
    if (!R) return null;
    const k = JY.lifeKeys(s);
    let lp = 0;
    Object.keys(k).forEach((dim) => { const f = (R.f[dim] || {})[k[dim]]; lp += Math.log10(Math.max(f || 0.002, 0.002)); });
    const oneIn = Math.pow(10, -lp);
    // 比百分之几的人生少见：和统计表里的分布比
    const q = R.q || [];
    const below = q.filter((x) => x < -lp).length;
    const pct = q.length ? Math.round(100 * below / q.length) : 0;
    return { oneIn: Math.round(oneIn), pct, lp: -lp };
  }
  const oneInText = (n) => {
    if (n >= 1e8) return Math.round(n / 1e8) + ' 亿';
    if (n >= 1e4) return Math.round(n / 1e4) + ' 万';
    return String(n);
  };
  JY.oneInText = oneInText;

  /* ---------- 成就 ---------- */
  const ACH = [
    { id: 'scholar', t: '寒门状元', d: '农村出身，高考考进顶尖大学', ok: (s) => s.hukou === 'rural' && s.gk === 'top' },
    { id: 'leftphd', t: '从留守到博士', d: '当过留守儿童，后来读到了博士', ok: (s) => s.leftBehind && s.edu === 'phd' },
    { id: 'phd', t: '读到头了', d: '读到了博士', ok: (s) => s.edu === 'phd' },
    { id: 'century', t: '百岁', d: '活到了一百岁', ok: (s) => s.age >= 100 },
    { id: 'four', t: '四世同堂', d: '见到了重孙辈', ok: (s) => s.seen.includes('o_great_gk') },
    { id: 'firsttier', t: '在一线城市有了家', d: '在北上广深买了房', ok: (s) => FIRST_TIER.includes(s.workCity) && ['own', 'mortgage'].includes(s.house) },
    { id: 'tenmil', t: '千万身家', d: '临终时净资产过了一千万', ok: (s) => s.net >= 1e7 },
    { id: 'selfmade', t: '白手起家', d: '农户、工人或打工家庭出身，挣下八百万家底', ok: (s) => ['farmer', 'worker', 'migrant'].includes(s.family) && s.net >= 8e6 },
    { id: 'founder', t: '创业成了', d: '合伙创业，活了下来', ok: (s) => s.startup === 'ok' },
    { id: 'boss', t: '自己当老板', d: '摆摊、网店、加盟，做成了一门生意', ok: (s) => ['stall', 'online', 'franchise'].includes(s.biz) },
    { id: 'top', t: '走到了顶', d: '五十岁上做到了单位里的头一号人物', ok: (s) => s.ladder === 'top' },
    { id: 'investor', t: '会理财', d: '一辈子理财赚了五百万以上', ok: (s) => s.finGain >= 5e6 },
    { id: 'chive', t: '交过学费', d: '碰上理财暴雷，或者在股灾里割了肉', ok: (s) => s.hyBlown > 0 || s.crash === 'cut' },
    { id: 'aisurvivor', t: '和 AI 抢饭碗', d: 'AI 来的时候跟着变，留在了技术岗', ok: (s) => ['learn', 'switch'].includes(s.aiMove) && ['tech', 'office'].includes(s.lastJob) },
    { id: 'civil', t: '铁饭碗', d: '考上了公务员', ok: (s) => s.lastJob === 'civil' },
    { id: 'creator', t: '做过网红', d: '靠自媒体吃过饭', ok: (s) => s.lastJob === 'creator' },
    { id: 'homeward', t: '回到原点', d: '去外面闯过，又回了老家', ok: (s) => ['early', 'late', 'house', 'parents'].includes(s.backHome) },
    { id: 'rooted', t: '没离开过家乡', d: '一辈子住在出生的地方，活过七十', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { id: 'dink', t: '两个人过一辈子', d: '不要孩子，活过八十', ok: (s) => s.kidPlan === 'dink' && s.age >= 80 },
    { id: 'bigfamily', t: '儿女双全', d: '养大了两个孩子，活过八十', ok: (s) => s.kids >= 2 && s.age >= 80 },
    { id: 'latelove', t: '晚年搭伴', d: '老伴走后，又找到了一个人', ok: (s) => s.remarried },
    { id: 'pension', t: '早做打算', d: '个人养老金账户攒过了五十万', ok: (s) => s.paAcct >= 5e5 },
    { id: 'odd', t: '走自己的路', d: '一半以上的抉择和大多数人不一样', ok: (s, l) => l.dev >= 50 },
    { id: 'plain', t: '和大多数人一样', d: '几乎每一步都随大流，活过七十五', ok: (s, l) => l.dev <= 5 && s.age >= 75 },
  ];
  JY.ACH = ACH;
  JY.JOB_T = JOB_T;

  /* ---------- 志向达成度 ---------- */
  const AIM_T = { rich: '赚很多钱', proud: '让爸妈骄傲', free: '做喜欢的事', none: '还没想好' };
  const EDU_RANK = { primary: 0, junior: 10, vocational: 30, senior: 30, college: 50, bachelor: 70, master: 85, phd: 100 };
  function aimScore(s, st, l) {
    const aim = s.aim;
    const wealth = Math.min(100, Math.max(0, s.net <= 0 ? 0 : 20 + 14 * Math.log10(1 + s.net / 1e4)));
    const sc = {
      rich: wealth,
      proud: 0.4 * (EDU_RANK[s.edu] || 0) + 0.3 * (st['事业'] || 0) + 0.3 * (st['人缘'] || 0),
      free: 0.6 * (st['心情'] || 0) + 0.4 * Math.min(100, l.dev * 2),
      none: 0.5 * (st['心情'] || 0) + 0.5 * (st['人缘'] || 0),
    }[aim];
    return sc == null ? null : Math.round(Math.max(0, Math.min(100, sc)));
  }

  /* ---------- 命终：记下结果、更新图鉴 ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || 'null') || null; } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(ALBUM_KEY, JSON.stringify(v)); } catch (e) { /* 忽略 */ } },
  };
  JY.album = () => store.get() || { lives: 0, provs: {}, fams: {}, edus: {}, jobs: {}, ach: {}, best: null };
  G.engine.onFinish = (g, life) => {
    const s = snap(g, life);
    s.aim = g.recall('aim');
    const L = JY.engine.get().L;
    life.snap = s;
    life.st = Object.assign({}, L.st);
    life.rare = rarity(s);
    life.ach = ACH.filter((a) => { try { return a.ok(s, life); } catch (e) { return false; } }).map((a) => a.id);
    life.aim = s.aim ? { k: s.aim, v: aimScore(s, life.st, life) } : null;
    // 图鉴
    const al = JY.album();
    const fresh = [];
    al.lives++;
    const add = (box, k) => { if (k && !al[box][k]) { al[box][k] = 1; return true; } if (k) al[box][k]++; return false; };
    if (add('provs', s.prov)) fresh.push(s.prov);
    if (add('fams', s.family)) fresh.push(FAM_T[s.family]);
    if (add('edus', s.edu)) fresh.push(EDU_T[s.edu]);
    if (add('jobs', s.lastJob)) fresh.push(JOB_T[s.lastJob]);
    life.newAch = life.ach.filter((id) => !al.ach[id]);
    life.ach.forEach((id) => { al.ach[id] = al.ach[id] || life.to; });
    if (life.rare && (!al.best || life.rare.oneIn > al.best.oneIn)) { al.best = { oneIn: life.rare.oneIn, name: life.name, where: life.birthplace }; life.bestEver = true; }
    life.fresh = fresh.filter(Boolean);
    store.set(al);
  };

  /* ---------- 墓志页的卡片 ---------- */
  const PROV_N = 31; // 大陆 31 个省级行政区（生成器只投到这些地方）
  G.endCards = (l, u) => {
    const { esc, card } = u;
    let h = '';
    const s = l.snap || {};
    if (l.rare) {
      h += card('这一生有多少见', l.bestEver ? '你见过的最少见的一生' : '',
        '<div class="big-num"><div><span>大约</span><b>' + esc(oneInText(l.rare.oneIn)) + '</b><span>人里才有一个</span></div><div><span>比</span><b>' + l.rare.pct + '%</b><span>的人生更少见</span></div></div>'
        + '<p class="note">按出身、学历、职业、婚姻、孩子、住在哪、活了多久，各自在十四亿人里的比例算的。</p>', 'rare-card');
    }
    if (l.aim && l.aim.v != null) {
      h += card('十六岁的志向', esc(AIM_T[l.aim.k] || ''), '<div class="aim-bar"><i style="width:' + l.aim.v + '%"></i></div><p class="note">达成了 <b>' + l.aim.v + '%</b>。'
        + esc({ rich: '临终时的家底 ' + fmt(s.net) + '。', proud: '学历、事业和人缘一起算。', free: '心情和“走自己的路”一起算。', none: '心情和人缘一起算。' }[l.aim.k] || '') + '</p>');
    }
    if (l.ach && l.ach.length) {
      h += card('这一世解锁的成就', l.ach.length + ' 个', '<ul class="ach-list">' + l.ach.map((id) => {
        const a = ACH.find((x) => x.id === id) || {};
        const p = JY.RARITY && JY.RARITY.ach ? JY.RARITY.ach[id] : null;
        return '<li class="' + ((l.newAch || []).includes(id) ? 'new' : '') + '"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + (p != null ? ' · ' + (p < 1 ? '不到 1' : Math.round(p)) + '% 的人生有' : '') + '</span>' + ((l.newAch || []).includes(id) ? '<em>新</em>' : '') + '</li>';
      }).join('') + '</ul>');
    }
    // 转折线：自己做的大事，一步一步走到这里
    const steps = (l.picks || []).filter((p) => p.major && !p.auto);
    if (steps.length) {
      h += card('转折线', '你亲手做的大事', '<ol class="turns">' + steps.slice(0, 30).map((p) => '<li class="' + (!p.canon && p.ok ? 'mod' : !p.ok ? 'fail' : '') + '"><span>' + p.age + ' 岁</span><b>' + esc(p.t) + '</b>' + esc(p.c) + (p.check ? (p.ok ? '（成了）' : '（没成）') : '') + '</li>').join('')
        + '<li class="fin"><span>' + (l.to - l.born) + ' 岁</span><b>' + esc(l.cause) + '</b>' + esc([s.edu && EDU_T[s.edu], s.lastJob && JOB_T[s.lastJob], l.info && l.info['婚姻'], l.info && l.info['住处']].filter(Boolean).join(' · ')) + '</li></ol>');
    }
    if (s.finGain || s.paAcct) {
      h += card('一辈子的理财', '', '<p class="note">' + (s.finGain ? '理财一共' + (s.finGain >= 0 ? '赚了 ' : '亏了 ') + esc(fmt(Math.abs(s.finGain))) + '。' : '') + (s.hyBlown ? '碰上过一次暴雷，亏了 ' + esc(fmt(s.hyBlown)) + '。' : '') + (s.paAcct ? '个人养老金账户攒了 ' + esc(fmt(s.paAcct)) + '。' : '') + '临终时的家底：' + esc(fmt(s.net)) + '。</p>');
    }
    if (l.fresh && l.fresh.length) h += card('人生图鉴 · 新收集', '', '<p class="note">' + esc(l.fresh.join('、')) + '</p>');
    return h;
  };

  /* ---------- 首页：人生图鉴 ---------- */
  G.homeCards = (W, u) => {
    const { esc } = u;
    const al = JY.album();
    if (!al.lives) return '';
    const row = (name, n, total) => '<div class="alb-row"><span>' + esc(name) + '</span><span class="bar"><i style="width:' + Math.round(100 * Math.min(1, n / total)) + '%"></i></span><b>' + n + ' / ' + total + '</b></div>';
    const got = ACH.filter((a) => al.ach[a.id]);
    return '<section class="album"><div class="section-h"><h2>人生图鉴</h2><span>活过 ' + al.lives + ' 世 · 清空投胎记录也不会丢</span></div><div class="card">'
      + row('投胎过的省份', Object.keys(al.provs).length, PROV_N)
      + row('出身', Object.keys(al.fams).length, Object.keys(FAM_T).length)
      + row('学历', Object.keys(al.edus).length, Object.keys(EDU_T).length)
      + row('职业', Object.keys(al.jobs).length, Object.keys(JOB_T).length - 1)
      + row('成就', got.length, ACH.length)
      + (al.best ? '<p class="note">最少见的一生：' + esc(al.best.name) + '（' + esc(al.best.where || '') + '），大约 ' + esc(oneInText(al.best.oneIn)) + ' 人里才有一个。</p>' : '')
      + '<div class="ach-grid">' + ACH.map((a) => '<span class="' + (al.ach[a.id] ? 'on' : '') + '" title="' + esc(al.ach[a.id] ? a.d : '还没解锁') + '">' + esc(al.ach[a.id] ? a.t : '？？？') + '</span>').join('') + '</div>'
      + '</div></section>';
  };

  /* ---------- 分享卡上的几行 ---------- */
  G.share.badges = (l) => {
    const out = [];
    if (l.rare) out.push('大约 ' + oneInText(l.rare.oneIn) + ' 人里才有一个这样的人生（比 ' + l.rare.pct + '% 的人生更少见）');
    if (l.ach && l.ach.length) out.push('解锁成就：' + l.ach.slice(0, 4).map((id) => (ACH.find((a) => a.id === id) || {}).t).join('、'));
    if (l.aim && l.aim.v != null) out.push('十六岁的志向“' + AIM_T[l.aim.k] + '”，达成了 ' + l.aim.v + '%');
    return out;
  };
})();

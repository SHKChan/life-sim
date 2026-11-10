/* 由 share/tools/tr.js 从 data/legacy.js 和 lang/en/tr/legacy.json 生成，不要手改。 */
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
  const FIRST_TIER = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'];

  /* ---------- 这一世的结果 ---------- */
  const EDU_T = { primary: 'Primary school', junior: 'Middle school', vocational: 'Vocational school', senior: 'High school', college: 'Junior college', bachelor: 'Bachelor’s', master: 'Master’s', phd: 'PhD' };
  const JOB_T = { none: 'No steady job', farmer: 'Farming', worker: 'Factory worker', rider: 'Delivery rider', driver: 'Driver', shop: 'Shopkeeper', office: 'Office worker', tech: 'Tech worker', civil: 'Civil servant', teacher: 'Teacher', doctor: 'Doctor', nurse: 'Nurse', sales: 'Sales', boss: 'Business owner', creator: 'Content creator', soldier: 'Soldier', freelance: 'Freelancer', retired: 'Retired' };
  const FAM_T = { rich: 'Wealthy family', civil: 'State-employee family', white: 'Office-worker family', smallbiz: 'Small-business family', worker: 'Working-class family', farmer: 'Farming family', migrant: 'Migrant-worker parents' };
  const HUKOU_T = { city: 'City', county: 'County town', rural: 'Village' };
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
    if (n >= 1e8) return Math.round(n / 1e8) + '00,000,000';
    if (n >= 1e4) return Math.round(n / 1e4) + '0,000';
    return String(n);
  };
  JY.oneInText = oneInText;

  /* ---------- 成就 ---------- */
  const ACH = [
    { id: 'scholar', t: 'Top scorer from nowhere', d: 'Village-born, got into a top university', ok: (s) => s.hukou === 'rural' && s.gk === 'top' },
    { id: 'leftphd', t: 'Left-behind to PhD', d: 'Was a left-behind child, later earned a PhD', ok: (s) => s.leftBehind && s.edu === 'phd' },
    { id: 'phd', t: 'Studied to the top', d: 'Earned a PhD', ok: (s) => s.edu === 'phd' },
    { id: 'century', t: 'Centenarian', d: 'Lived to 100', ok: (s) => s.age >= 100 },
    { id: 'four', t: 'Four generations', d: 'Lived to see great-grandchildren', ok: (s) => s.seen.includes('o_great_gk') },
    { id: 'firsttier', t: 'A home in a tier-1 city', d: 'Bought a home in Beijing, Shanghai, Guangzhou or Shenzhen', ok: (s) => FIRST_TIER.includes(s.workCity) && ['own', 'mortgage'].includes(s.house) },
    { id: 'tenmil', t: 'Multi-millionaire', d: 'Net worth over $1.4 million (¥10M) at death', ok: (s) => s.net >= 1e7 },
    { id: 'selfmade', t: 'Self-made', d: 'From a farming, factory or migrant family, built $1.1 million (¥8M)', ok: (s) => ['farmer', 'worker', 'migrant'].includes(s.family) && s.net >= 8e6 },
    { id: 'founder', t: 'Startup survivor', d: 'Co-founded a startup that survived', ok: (s) => s.startup === 'ok' },
    { id: 'boss', t: 'Own boss', d: 'Made a street stall, online shop or franchise work', ok: (s) => ['stall', 'online', 'franchise'].includes(s.biz) },
    { id: 'top', t: 'Top of the ladder', d: 'Became the top person at work in your fifties', ok: (s) => s.ladder === 'top' },
    { id: 'investor', t: 'Savvy investor', d: 'Made over $700,000 (¥5M) investing in a lifetime', ok: (s) => s.finGain >= 5e6 },
    { id: 'chive', t: 'Lesson learned', d: 'Got burned by a collapsing product or sold in a crash', ok: (s) => s.hyBlown > 0 || s.crash === 'cut' },
    { id: 'aisurvivor', t: 'Outlasted the AI', d: 'Adapted when AI came and stayed in tech', ok: (s) => ['learn', 'switch'].includes(s.aiMove) && ['tech', 'office'].includes(s.lastJob) },
    { id: 'civil', t: 'Iron rice bowl', d: 'Became a civil servant', ok: (s) => s.lastJob === 'civil' },
    { id: 'creator', t: 'Influencer', d: 'Made a living as a content creator', ok: (s) => s.lastJob === 'creator' },
    { id: 'homeward', t: 'Back to the start', d: 'Went out into the world, then came home', ok: (s) => ['early', 'late', 'house', 'parents'].includes(s.backHome) },
    { id: 'rooted', t: 'Never left home', d: 'Lived where you were born all your life, past seventy', ok: (s) => (!s.workCity || s.workCity === s.city) && s.age >= 70 },
    { id: 'dink', t: 'Just the two of us', d: 'Chose no children, lived past eighty', ok: (s) => s.kidPlan === 'dink' && s.age >= 80 },
    { id: 'bigfamily', t: 'Two children', d: 'Raised two children, lived past eighty', ok: (s) => s.kids >= 2 && s.age >= 80 },
    { id: 'latelove', t: 'Late love', d: 'Found someone again after losing your spouse', ok: (s) => s.remarried },
    { id: 'pension', t: 'Planned ahead', d: 'Built a private pension over $70,000 (¥500K)', ok: (s) => s.paAcct >= 5e5 },
    { id: 'odd', t: 'Own road', d: 'More than half your choices went against the crowd', ok: (s, l) => l.dev >= 50 },
    { id: 'plain', t: 'Like most people', d: 'Went with the crowd almost every time, lived past 75', ok: (s, l) => l.dev <= 5 && s.age >= 75 },
  ];
  JY.ACH = ACH;
  JY.JOB_T = JOB_T;

  /* ---------- 志向达成度 ---------- */
  const AIM_T = { rich: 'Make a lot of money', proud: 'Make my parents proud', free: 'Do what I love', none: 'Not sure yet' };
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
      h += card('How rare was this life', l.bestEver ? 'Your rarest life so far' : '',
        '<div class="big-num"><div><span>About</span><b>1 in ' + esc(oneInText(l.rare.oneIn)) + '</b><span>people live a life like this</span></div><div><span>Rarer than</span><b>' + l.rare.pct + '%</b><span>of lives</span></div></div>'
        + '<p class="note">Based on how common your origin, education, job, marriage, children, home city and lifespan each are among 1.4 billion people.</p>', 'rare-card');
    }
    if (l.aim && l.aim.v != null) {
      h += card('Your ambition at sixteen', esc(AIM_T[l.aim.k] || ''), '<div class="aim-bar"><i style="width:' + l.aim.v + '%"></i></div><p class="note">Achieved <b>' + l.aim.v + '%</b>. '
        + esc({ rich: 'Net worth at death ' + fmt(s.net) + '. ', proud: 'Counts education, career and social ties.', free: 'Counts mood and how often you took your own road.', none: 'Counts mood and social ties.' }[l.aim.k] || '') + '</p>');
    }
    if (l.ach && l.ach.length) {
      h += card('Achievements this life', l.ach.length + ' ', '<ul class="ach-list">' + l.ach.map((id) => {
        const a = ACH.find((x) => x.id === id) || {};
        const p = JY.RARITY && JY.RARITY.ach ? JY.RARITY.ach[id] : null;
        return '<li class="' + ((l.newAch || []).includes(id) ? 'new' : '') + '"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + (p != null ? ' · ' + (p < 1 ? 'under 1' : Math.round(p)) + '% of lives' : '') + '</span>' + ((l.newAch || []).includes(id) ? '<em>new</em>' : '') + '</li>';
      }).join('') + '</ul>');
    }
    // 转折线：自己做的大事，一步一步走到这里
    const steps = (l.picks || []).filter((p) => p.major && !p.auto);
    if (steps.length) {
      h += card('Turning points', 'The big choices you made yourself', '<ol class="turns">' + steps.slice(0, 30).map((p) => '<li class="' + (!p.canon && p.ok ? 'mod' : !p.ok ? 'fail' : '') + '"><span>' + p.age + '</span><b>' + esc(p.t) + '</b>' + esc(p.c) + (p.check ? (p.ok ? ' (it worked)' : ' (it failed)') : '') + '</li>').join('')
        + '<li class="fin"><span>' + (l.to - l.born) + '</span><b>' + esc(l.cause) + '</b>' + esc([s.edu && EDU_T[s.edu], s.lastJob && JOB_T[s.lastJob], l.info && l.info['婚姻'], l.info && l.info['住处']].filter(Boolean).join(' · ')) + '</li></ol>');
    }
    if (s.finGain || s.paAcct) {
      h += card('A lifetime of investing', '', '<p class="note">' + (s.finGain ? 'Investments ' + (s.finGain >= 0 ? 'gained ' : 'lost ') + esc(fmt(Math.abs(s.finGain))) + '. ' : '') + (s.hyBlown ? 'Lost in a collapsed product: ' + esc(fmt(s.hyBlown)) + '. ' : '') + (s.paAcct ? 'Private pension: ' + esc(fmt(s.paAcct)) + '. ' : '') + 'Net worth at death: ' + esc(fmt(s.net)) + '.</p>');
    }
    if (l.fresh && l.fresh.length) h += card('Life Album · new', '', '<p class="note">' + esc(l.fresh.join(', ')) + '</p>');
    return h;
  };

  /* ---------- 首页：人生图鉴 ---------- */
  G.homeCards = (W, u) => {
    const { esc } = u;
    const al = JY.album();
    if (!al.lives) return '';
    const row = (name, n, total) => '<div class="alb-row"><span>' + esc(name) + '</span><span class="bar"><i style="width:' + Math.round(100 * Math.min(1, n / total)) + '%"></i></span><b>' + n + ' / ' + total + '</b></div>';
    const got = ACH.filter((a) => al.ach[a.id]);
    return '<section class="album"><div class="section-h"><h2>Life Album</h2><span>' + al.lives + ' lives lived · kept even if you clear past lives</span></div><div class="card">'
      + row('Provinces born in', Object.keys(al.provs).length, PROV_N)
      + row('Family origins', Object.keys(al.fams).length, Object.keys(FAM_T).length)
      + row('学历', Object.keys(al.edus).length, Object.keys(EDU_T).length)
      + row('职业', Object.keys(al.jobs).length, Object.keys(JOB_T).length - 1)
      + row('Achievements', got.length, ACH.length)
      + (al.best ? '<p class="note">Rarest life: ' + esc(al.best.name) + ' (' + esc(al.best.where || '') + '), about 1 in ' + esc(oneInText(al.best.oneIn)) + '.</p>' : '')
      + '<div class="ach-grid">' + ACH.map((a) => '<span class="' + (al.ach[a.id] ? 'on' : '') + '" title="' + esc(al.ach[a.id] ? a.d : 'Locked') + '">' + esc(al.ach[a.id] ? a.t : '???') + '</span>').join('') + '</div>'
      + '</div></section>';
  };

  /* ---------- 分享卡上的几行 ---------- */
  G.share.badges = (l) => {
    const out = [];
    if (l.rare) out.push('About 1 in ' + oneInText(l.rare.oneIn) + ' people live a life like this (rarer than ' + l.rare.pct + '% of lives)');
    if (l.ach && l.ach.length) out.push('Achievements: ' + l.ach.slice(0, 4).map((id) => (ACH.find((a) => a.id === id) || {}).t).join(', '));
    if (l.aim && l.aim.v != null) out.push('Ambition at 16, “' + AIM_T[l.aim.k] + '”: ' + l.aim.v + '%');
    return out;
  };
})();

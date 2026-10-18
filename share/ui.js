/* 共用界面（文字、书名、颜色读 JY.GAME）
 * 屏幕：home 首页 → wake 醒来 → life 这一生 → words 临终 → end 墓志。
 * 每一年的生平一行一行显示出来；遇到抉择就停下，弹出抉择框等玩家。
 * 抉择框可以“收起”看局面，底部留一个按钮再展开。
 */
(function () {
  'use strict';
  const JY = window.JY, E = JY.engine, G = JY.G;
  const app = document.getElementById('app');
  const val = JY.val;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SPEEDS = [1, 2, 4, 8, 16];
  const YEAR_MS = 60000; // 1× 时一年约一分钟，速度翻倍时间减半
  const STEP = 100;
  const T = Object.assign({
    id: 'game', title: '人生', titleHtml: '人生', intro: '', freshLine: '一个新的世界。', year: '纪年', world: '世界',
    idcard: '名帖', rumor: '传闻', chronicle: '大事记', changed: '世界因你而变', changedMine: '世界因我而变', canon: '原著',
    devName: '改命度', devShort: '改命', devTip: '这一生偏离原著多少', modTag: '改命', pauseTag: '人生关口', encTag: '奇遇',
    yourEnd: '你的结局', familyTitle: '家人与师承', peersTitle: '同代人', peersSub: '与你年纪相仿<br>此刻', livesTitle: '往生录', pickTitle: '重生成谁', randomBtn: '随机重生', beginBtn: '开始这一生',
    random: false, // true：每一世随机生成一个人（JY.GENERATE），不从名单里挑
    howto: [], lastWords: { happy: '这一生，值了。', sad: '若有来生，换个活法。', plain: '就此别过。', changed: '原来命，是可以改的。', canon: '我这一生，大概就是书里写的那样。' },
    books: {},
  }, JY.GAME || {});
  // 由 canon 推出来的用词（游戏没写时）
  T.canonEvent = T.canonEvent || T.canon + '大事';
  T.fateLabel = T.fateLabel || T.canon + '命数';
  T.compareTitle = T.compareTitle || T.canon + '与你';
  T.legend = T.legend || ['照' + T.canon + '选', '改了命', '没改成', '命终'];
  T.noChange = T.noChange || T.world + '照着' + T.canon + '走了下去。';
  /* 属性怎么显示：bars 是四条主属性（进度条），extras 是附属属性。tier 是分档名，signed 是正负两头的说法 */
  const SUI = Object.assign({
    bars: [
      { k: '根骨', cls: 'gen', tip: '身体底子。受伤会掉，养伤会回，年纪大了慢慢下降，降到 0 人就没了。' },
      { k: '心境', cls: 'xin', tip: '过得快不快活。太低时临终的话也会苦。' },
      { k: '悟性', cls: 'wu', tip: '学东西、看破局面的本事。很多改命的判定看它。' },
      { k: '情义', cls: 'qing', tip: '和人的牵绊。劝人、救人、留人，看它。' },
    ],
    extras: [
      { k: '武学', tip: '武功境界', tier: [[15, '不入流'], [35, '三流'], [55, '二流'], [75, '一流'], [90, '宗师'], [1e9, '绝顶']] },
      { k: '声望', tip: '江湖上有多少人知道你' },
      { k: '正邪', signed: ['偏正', '偏邪'] },
    ],
    mood: '心境',
  }, T.statsUI || {});
  const tierOf = (x, v) => { if (!x.tier) return ''; const t = x.tier.find((p) => v < p[0]) || x.tier[x.tier.length - 1]; return t[1]; };
  const bookOf = (b) => Object.assign({ short: b || '', code: 'BOOK', color: '#888', ink: '#111' }, T.books[b] || {});
  const PRE = T.id + '.';
  if (T.brand) document.documentElement.style.setProperty('--brand', T.brand);
  document.title = T.title;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 忽略 */ } },
  };
  const ui = {
    screen: 'home', speed: Number(store.get(PRE + 'speed')) || 1, paused: false, auto: false, timer: null,
    shown: 0, pending: null, result: null, wake: null, life: null, words: null,
    drawer: false, drawerMod: false, confirm: false, logAll: false,
    review: null, reviewTimer: null, share: null, peek: false,
    frac: 0, yBase: 0, autoT: null,
  };
  const CFG = window.JY_CONFIG || {};
  // 字体不阻塞首屏：国内访问不了 Google 字体时，页面照样立刻用系统字体显示
  const FONT_CSS = CFG.fontCss === undefined
    ? 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;900&display=swap'
    : CFG.fontCss;
  if (FONT_CSS) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_CSS;
    document.head.appendChild(link);
  }
  const theme = store.get(PRE + 'theme');
  if (theme) document.documentElement.dataset.theme = theme;

  /* ---------- 小工具 ---------- */
  function ageNow() { const { L } = E.get(); return L ? L.year - JY.byId[L.cid].born : 0; }
  function dots(n) { return '●'.repeat(n) + '○'.repeat(5 - n); }
  function lifeBar(cls, label, v) {
    return '<div class="stat ' + cls + '"><span>' + label + '</span><span class="bar"><i style="width:' + v + '%"></i></span><b>' + v + '</b></div>';
  }
  function partyOf(L, c, age) {
    if (L.party && L.party.length) return L.party.filter((id) => G.alive(id));
    if (age < 12) return (c.family || []).filter((f) => f.id && G.alive(f.id)).slice(0, 2).map((f) => f.id);
    return [];
  }
  function lifeMap(born, from, to, now, marks) {
    const span = Math.max(80, (to - born) + 5);
    let h = '';
    for (let a = 0; a < span; a++) {
      const y = born + a;
      let cls = '';
      if (y >= from && y <= to) cls = marks[y] || 'p';
      if (y < from) cls = 'p';
      if (y === now) cls += ' now';
      h += '<i class="' + cls + '" title="' + a + ' 岁 · ' + T.year + ' ' + y + '"></i>';
    }
    return '<div class="lifemap">' + h + '</div><div class="legend">'
      + '<span style="--c:var(--canon)">' + T.legend[0] + '</span><span style="--c:var(--mod)">' + T.legend[1] + '</span>'
      + '<span style="--c:color-mix(in srgb, var(--bad) 55%, var(--panel-2))">' + T.legend[2] + '</span><span style="--c:var(--bad)">' + T.legend[3] + '</span></div>';
  }

  /* ---------- 计时 ----------
   * ui.frac 是当前这一年走过的比例（0–1），顶栏纪年下面的小进度条显示它。
   * 这一年的生平行在前 85% 的时间里均匀出现，走满一年再推演下一年。
   * 抉择框弹出时时钟停住，选完接着走。 */
  function yearMs() { const { L } = E.get(); const d = YEAR_MS / ui.speed; return L && L.death ? Math.min(d, 4000) : d; }
  function paceText() {
    const sec = YEAR_MS / ui.speed / 1000;
    return '一年约 ' + (sec >= 60 ? sec / 60 + ' 分钟' : (Math.round(sec * 2) / 2) + ' 秒');
  }
  function yearStart(L) { let i = L.log.length; while (i > 0 && L.log[i - 1].y === L.year) i--; return i; }
  // 跳转、继续存档之后，按已经显示的行估一个进度
  function syncFrac() {
    const { L } = E.get();
    ui.yBase = yearStart(L);
    const total = L.log.length - ui.yBase;
    ui.frac = ui.pending ? Math.min(0.85, total ? 0.85 * (ui.shown - ui.yBase) / total : 0) : 1;
  }
  function lineTarget(L) {
    const total = L.log.length - ui.yBase;
    if (total <= 0) return L.log.length;
    return ui.yBase + Math.min(total, 1 + Math.floor(total * ui.frac / 0.85));
  }
  function bar() { const i = document.getElementById('yr-prog'); if (i) i.style.width = (ui.frac * 100).toFixed(1) + '%'; }
  function tick() {
    if (ui.screen !== 'life' || ui.paused) return;
    const { L } = E.get();
    if (!L) return;
    if (ui.pending && ui.shown >= L.log.length) {
      if (ui.auto && !ui.autoT) {
        const n = ui.pending;
        ui.autoT = setTimeout(() => { ui.autoT = null; if (ui.pending === n && !ui.paused) autoChoose(); }, 700);
      }
      return;
    }
    ui.frac = Math.min(1, ui.frac + STEP / yearMs());
    const t = lineTarget(L);
    if (t > ui.shown) { ui.shown = t; render(); return; }
    if (ui.frac >= 1 && !ui.pending) {
      if (L.death) { toWords(); return; }
      ui.yBase = L.log.length;
      ui.frac = 0;
      advance(E.nextYear());
      return;
    }
    bar();
  }
  setInterval(tick, STEP);
  function advance(r) {
    ui.pending = r && r.type === 'node' ? r.node : null;
    ui.peek = false;
    const { L } = E.get();
    if (lineTarget(L) > ui.shown) ui.shown = lineTarget(L);
    render();
  }
  function autoChoose() {
    const opts = E.choices(ui.pending);
    const canon = opts.filter((o) => o.ch.canon);
    const pickOne = canon.length && Math.random() < 0.7 ? canon[0] : opts[Math.floor(Math.random() * opts.length)];
    choose(pickOne.i);
  }
  function choose(i) {
    const node = ui.pending;
    const r = E.choose(i);
    const L = E.get().L;
    ui.result = { r, node, year: L.year };
    ui.pending = null;
    ui.shown = L.log.length;
    advance(E.flush());
  }
  function skipToDecision() {
    const { L } = E.get();
    if (!L) return;
    ui.result = null;
    let guard = 0;
    while (!ui.pending && !L.death && guard++ < 300) {
      const r = E.nextYear();
      if (r.type === 'node') ui.pending = r.node;
    }
    ui.peek = false;
    ui.shown = L.log.length;
    if (L.death && !ui.pending) { toWords(); return; }
    syncFrac();
    render();
  }
  function toWords() {
    const { L } = E.get();
    const c = JY.byId[L.cid];
    const xin = L.st[SUI.mood];
    ui.words = [
      c.arc.lastWords,
      xin >= 60 ? T.lastWords.happy : xin <= 30 ? T.lastWords.sad : T.lastWords.plain,
      E.devOf(L) >= 40 ? T.lastWords.changed : T.lastWords.canon,
    ].filter(Boolean);
    ui.screen = 'words';
    render();
    window.scrollTo(0, 0);
    if (ui.auto) setTimeout(() => { if (ui.screen === 'words') finish(0); }, 2500);
  }
  function finish(i) {
    ui.life = E.finish(ui.words[i]);
    ui.screen = 'end';
    ui.auto = false;
    window.scrollTo(0, 0);
    openReview();
  }

  /* ---------- 终局回顾：一屏一个关键时刻 ---------- */
  function openReview() {
    if (!ui.life || !ui.life.moments || !ui.life.moments.length) { render(); return; }
    ui.review = { i: 0 };
    render();
    reviewTick();
  }
  function reviewTick() {
    clearTimeout(ui.reviewTimer);
    if (!ui.review) return;
    ui.reviewTimer = setTimeout(() => reviewNext(), 5200);
  }
  function reviewNext() {
    if (!ui.review) return;
    if (ui.review.i >= ui.life.moments.length - 1) { closeReview(); return; }
    ui.review.i++;
    render();
    reviewTick();
  }
  function reviewPrev() {
    if (!ui.review || ui.review.i === 0) return;
    ui.review.i--;
    render();
    reviewTick();
  }
  function closeReview() {
    clearTimeout(ui.reviewTimer);
    ui.review = null;
    render();
  }
  function start(id) {
    ui.wake = id ? E.startLife(id) : E.startRandom();
    ui.screen = 'wake';
    ui.shown = 0; ui.pending = null; ui.result = null; ui.logAll = false;
    render();
    window.scrollTo(0, 0);
  }
  function begin() {
    ui.screen = 'life';
    ui.paused = false;
    ui.shown = 0;
    ui.yBase = 0;
    ui.frac = 0.75; // 出生那一行之后，很快进入第一年
    render();
    window.scrollTo(0, 0);
  }
  function goHome() {
    ui.screen = 'home';
    ui.confirm = false;
    render();
    window.scrollTo(0, 0);
  }
  function resume() {
    const { L } = E.get();
    if (!L) return;
    ui.screen = 'life';
    ui.shown = L.log.length;
    ui.result = null;
    const p = E.peek();
    ui.pending = p && p.type === 'node' ? p.node : null;
    if (p && p.type === 'death') { toWords(); return; }
    ui.paused = false;
    syncFrac();
    render();
  }

  /* ---------- 首页 ---------- */
  function homeView() {
    const { W, L } = E.get();
    const avail = E.available();
    const fresh = T.random ? !W.lives.length : W.year < 0 && !W.lives.length;
    let h = '<div class="home"><div class="home-hero"><div><h1>' + T.titleHtml + '</h1>'
      + '<p>' + esc(T.intro) + '</p></div>'
      + '<div><button class="b" id="h-theme" data-act="theme" title="切换深浅色">◐ 深浅色</button></div></div>';
    h += '<div class="world-line">';
    if (fresh) h += '<span>' + T.freshLine + '</span>';
    else if (T.random) h += '<span>已经活过 <b>' + W.lives.length + '</b> 世</span>';
    else h += '<span><b>' + T.world + T.year + ' ' + Math.max(0, W.year) + '</b> · ' + E.era(W.year) + ' · 已经活过 ' + W.lives.length + ' 世</span>';
    if (L) {
      const c = JY.byId[L.cid];
      h += '<button class="b primary" id="h-resume" data-act="resume">继续这一生：' + esc(c.name) + '，' + (L.year - c.born) + ' 岁</button>';
    } else if (T.random) {
      h += '<button class="b primary big" id="h-random" data-act="reborn">' + T.randomBtn + '</button>';
    } else if (avail.length) {
      h += '<button class="b primary" id="h-random" data-act="random">' + T.randomBtn + '</button>';
    }
    if (!T.random) h += '<button class="b" id="h-chron" data-act="drawer">' + T.chronicle + '</button>';
    if (!fresh || L) h += '<button class="b" id="h-reset" data-act="reset">' + (T.random ? '清空' + T.livesTitle : '重开一个' + T.world) + '</button>';
    h += '</div>';
    if (ui.confirm) {
      h += '<div class="confirm"><span>' + (T.random ? '会清空' + T.livesTitle + '和正在过的这一生' : '重开会清空这个' + T.world + '的全部历史和' + T.livesTitle) + '，不能撤销。</span>'
        + '<button class="b" id="h-reset-yes" data-act="reset-yes">清空并重开</button><button class="b" id="h-reset-no" data-act="reset-no">算了</button></div>';
    }
    if (!L && !T.random) {
      h += '<section><div class="section-h"><h2>' + T.pickTitle + '</h2><span>' + (avail.length ? avail.length + ' 人可选。已经死去或已经活过的人不能再选；' + T.year + '已过的人，会从现在的年纪醒来。' : '') + '</span></div>';
      if (avail.length) {
        h += '<div class="picks">' + avail.map((c) => {
          const s = E.startYear(c), a = s - c.born;
          return '<button class="pick" id="pick-' + c.id + '" data-act="start" data-id="' + c.id + '">'
            + '<canvas class="px" data-portrait="' + c.id + '" data-age="' + Math.max(18, a) + '"></canvas>'
            + '<div><div class="nm">' + esc(c.name) + '</div><div class="meta">' + bookOf(c.book).short + ' · ' + c.sex + ' · 生于' + T.year + ' ' + c.born
            + (a > 0 ? ' · 醒来时 ' + a + ' 岁' : ' · 从出生开始') + '</div><div class="fate">' + esc(c.fateText) + '</div></div></button>';
        }).join('') + '</div>';
      } else {
        h += '<p class="empty">这个' + T.world + '里能重生的人都已经走完了一生。可以看看大事记，或者重开一个' + T.world + '。</p>';
      }
      h += '</section>';
    }
    h += '<section><div class="section-h"><h2>' + T.livesTitle + '</h2><span>' + (T.random ? '你活过的每一世' : '这个' + T.world + '里你活过的每一世') + '</span></div>';
    h += W.lives.length ? '<div class="lives">' + W.lives.slice().reverse().map((l) => '<div class="life-row"><b>' + esc(l.name) + '</b><span>' + T.year + ' ' + l.from + '–' + l.to + ' · 享年 ' + (l.to - l.born) + ' · ' + esc(l.cause) + ' · “' + esc(l.words) + '”</span><span class="d">' + T.devShort + ' ' + l.dev + '%</span></div>').join('') + '</div>'
      : '<p class="empty">还没有。</p>';
    h += '</section>';
    h += '<section class="how">' + T.howto.map((x) => '<div><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</div>').join('') + '</section></div>';
    return h;
  }

  /* ---------- 醒来 ---------- */
  function wakeView() {
    const { L } = E.get();
    const c = JY.byId[L.cid];
    const before = ui.wake.before || [];
    const age = L.year + 1 - c.born;
    let h = '<div class="wake">';
    if (before.length) {
      const last = before.slice(-14);
      h += '<div class="card"><div class="card-h"><h3>你醒来之前的' + T.world + '</h3><small>' + before.length + ' 件事</small></div><ul class="before">'
        + last.map((e) => '<li class="' + (e.mod ? 'mod' : '') + '">' + T.year + ' ' + e.y + ' · ' + esc(e.t) + '</li>').join('') + '</ul>'
        + (before.length > last.length ? '<p class="empty" style="padding:8px 0 0">更早的事在' + T.world + '大事记里。</p>' : '') + '</div>';
    }
    h += '<div class="card"><div class="id-body" style="padding:0"><canvas class="px" data-portrait="' + c.id + '" data-age="' + age + '"></canvas><div>'
      + '<div class="id-name">' + esc(c.name) + '</div><div style="color:var(--muted);font-size:14px">' + [bookOf(c.book).short, c.sex, c.birthplace, age <= 0 ? '刚刚出生' : '醒来时 ' + age + ' 岁'].filter(Boolean).map(esc).join(' · ') + '</div></div></div>'
      + '<p class="intro" style="margin-top:16px">' + esc(L.intro) + '</p>'
      + (c.facts && c.facts.length ? '<dl class="kv facts" style="margin-top:14px">' + c.facts.map((f) => '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>').join('') + '</dl>' : '')
      + (c.odds ? '<p class="odds">' + esc(c.odds) + '</p>' : '')
      + (c.fateText ? '<div class="fate-box" style="margin-top:14px"><b>' + T.fateLabel + '</b>' + esc(c.fateText) + '</div>' : '')
      + '<div style="margin-top:16px">' + SUI.bars.map((x) => lifeBar(x.cls, x.k, L.st[x.k])).join('') + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="b primary big" id="w-begin" data-act="begin">' + T.beginBtn + '</button></div>'
      + '</div></div>';
    return h;
  }

  /* ---------- 这一生 ---------- */
  function lifeView() {
    const { W, L } = E.get();
    const c = JY.byId[L.cid];
    const Y = L.year, age = Math.max(0, Y - c.born), b = bookOf(c.book);
    const loc = JY.LOCS[L.loc] || { name: L.locCap, desc: '' };
    const showDecision = ui.pending && ui.shown >= L.log.length;
    let h = '<header class="top"><div class="top-in">'
      + '<button class="logo" id="t-logo" data-act="home" title="回到首页">' + T.titleHtml + '</button>'
      + '<div class="agebox"><span>年龄</span><b>' + age + '</b></div>'
      + '<div class="when"><span class="yr">' + T.year + ' ' + Y + '</span><span class="yr-bar" title="今年的进度"><i id="yr-prog" style="width:' + (ui.frac * 100).toFixed(1) + '%"></i></span>'
      + '<small class="pace">' + ui.speed + '× · ' + paceText() + (ui.paused ? ' · 已暂停' : '') + '</small></div>'
      + '<div class="ctl">'
      + '<button class="b" id="c-pause" data-act="pause">' + (ui.paused ? '▶ 继续' : '❚❚ 暂停') + '</button>'
      + SPEEDS.map((s) => '<button class="b" id="c-s' + s + '" data-act="speed" data-v="' + s + '" aria-pressed="' + (ui.speed === s) + '">' + s + '×</button>').join('')
      + '<button class="b" id="c-next" data-act="next"' + (showDecision ? ' disabled' : '') + '>下一抉择 »</button>'
      + '<button class="b" id="c-auto" data-act="auto" aria-pressed="' + ui.auto + '">自动</button>'
      + '<button class="b" id="c-theme" data-act="theme" title="切换深浅色">◐</button>'
      + '<button class="b" id="c-chron" data-act="drawer">' + T.chronicle + '</button>'
      + '<button class="b" id="c-exit" data-act="home">离开</button>'
      + '</div></div></header>';

    h += '<div class="shell">';
    /* 左：名帖、状态 */
    h += '<div class="col left">';
    h += '<div class="card idcard"><div class="id-strip" style="background:' + b.color + ';color:' + b.ink + '"><span>' + T.idcard + ' · ' + b.code + '</span><span>' + T.year + ' ' + Y + '</span></div>'
      + '<div class="id-body"><canvas class="px" data-portrait="' + c.id + '" data-age="' + age + '"></canvas><div>'
      + '<div class="id-name">' + esc(c.name) + '</div><dl class="kv">'
      + '<dt>性别</dt><dd>' + c.sex + '</dd>'
      + '<dt>出生</dt><dd>' + T.year + ' ' + c.born + ' · ' + esc(c.birthplace || '') + '</dd>'
      + '<dt>现居</dt><dd>' + esc(L.locCap || '') + '</dd>'
      + '<dt>时代</dt><dd>' + esc(E.era(Y)) + '</dd>'
      + Object.keys(L.info).filter((k) => L.info[k]).map((k) => '<dt>' + esc(k) + '</dt><dd>' + esc(L.info[k]) + '</dd>').join('')
      + '<dt>出身</dt><dd class="dots">' + dots(c.bg || 3) + '</dd>'
      + '</dl></div></div></div>';
    h += '<div class="card statcard"><div class="card-h"><h3>状态</h3><small>0–100</small></div>'
      + SUI.bars.map((x) => lifeBar(x.cls, x.k, L.st[x.k])).join('')
      + '<details class="what"><summary>这些是什么意思？</summary>'
      + SUI.bars.concat(SUI.extras).filter((x) => x.tip).map((x) => '<p><b>' + x.k + '</b>：' + esc(x.tip) + '</p>').join('')
      + '<p>属性只决定成功率，不决定结果。</p></details>'
      + '<div class="sub-stats">'
      + SUI.extras.map((x) => {
        const v = L.st[x.k];
        if (x.signed) return '<div><span>' + x.k + ' ' + (v >= 0 ? x.signed[0] : x.signed[1]) + '</span><b>' + v + '</b><div class="zx"><i style="left:calc(' + (v + 100) / 2 + '% - 1px)"></i></div></div>';
        return '<div><span>' + x.k + '</span><b>' + (x.tier ? tierOf(x, v) + ' · ' : '') + v + '</b></div>';
      }).join('')
      + '<div><span>' + T.devName + '</span><b>' + E.devOf(L) + '%</b></div>'
      + '</div></div>';
    h += '</div>';

    /* 中：场景、今年的重心、生平。抉择用弹框，见 decisionModal */
    const party = partyOf(L, c, age);
    const partyTxt = age < 3 ? '在襁褓里' : party.length ? '与' + party.map((id) => G.name(id)).join('、') : '独自一人';
    h += '<div class="col center">';
    h += '<div class="card scene"><canvas class="px" id="scene-cv"></canvas><div class="scene-cap">' + esc(L.locCap) + (loc.desc ? ' · ' + esc(loc.desc) : '') + ' · ' + esc(partyTxt) + '</div></div>';
    if (ui.result && L.year > ui.result.year + 1) ui.result = null;
    h += focusBar(L, age);   // 只在手机上显示
    h += focusCard(L, c, age); // 电脑上紧贴场景；手机上排到生平后面
    h += logCard(W, L);
    h += '</div>';

    /* 右：家人、同代人、人生图、传闻 */
    h += '<div class="col right">' + familyCard(L, c) + peersCard(L)
      + '<div class="card"><div class="card-h"><h3>人生图</h3><small>一格一年</small></div>' + lifeMap(c.born, L.start, Y, Y, L.marks) + '</div>'
      + rumorCard(W) + '</div>';
    h += '</div>';
    if (showDecision) h += ui.peek ? decisionPill(ui.pending) : decisionModal(ui.pending, c);
    return h;
  }

  function decisionModal(n, c) {
    const isEnc = JY.ENCOUNTERS.includes(n);
    const isPause = JY.PAUSES.includes(n) || (c.arc.pauses || []).includes(n);
    const opts = E.choices(n);
    const tag = isPause ? '<span class="tag book">' + T.pauseTag + '</span>' : isEnc ? '<span class="tag mod">' + T.encTag + '</span>' : '<span class="tag canon">' + [bookOf(c.book).short, T.canonEvent].filter(Boolean).join(' · ') + '</span>';
    return '<div class="overlay center decide-wrap" data-act="decide-bg"><div class="modal decide' + (isEnc || isPause ? ' enc' : '') + '" role="dialog" aria-modal="true" aria-labelledby="decide-t">'
      + '<div class="decide-meta">' + tag + '<span>' + T.year + ' ' + G.Y + ' · ' + G.age + ' 岁 · ' + esc(G.name(c.id)) + '</span>'
      + '<button class="b decide-peek" id="d-peek" data-act="peek" title="先看看局面，再回来选">收起</button></div>'
      + '<div class="decide-b"><h3 id="decide-t">' + esc(n.t) + '</h3><p>' + esc(val(n.text)) + '</p><div class="choices">'
      + opts.map((o, k) => {
        const ch = o.ch;
        let meta = '';
        if (ch.check) meta += '<span>' + ch.check[0] + ' ' + G.s(ch.check[0]) + ' · 成功率 ' + E.odds(ch.check) + '%</span>';
        if (!isPause) meta += ch.canon ? '<span class="tag canon">' + T.canon + '</span>' : (ch.dev === 0 ? '' : '<span class="tag mod">' + T.modTag + '</span>');
        if (ch.fatal) meta += '<span class="tag bad">命终</span>';
        return '<button class="choice" id="ch-' + k + '" data-act="choose" data-i="' + o.i + '"><span class="t">' + (k + 1) + '. ' + esc(ch.t) + '</span><span class="m">' + meta + '</span></button>';
      }).join('') + '</div></div></div></div>';
  }
  function decisionPill(n) {
    return '<button class="decide-pill" id="d-open" data-act="peek-off"><span>待抉择</span><b>' + esc(n.t) + '</b><span>点开 ›</span></button>';
  }

  /* 刚才的抉择：放在生平最上面，过一年后消失 */
  function resultCard() {
    const r = ui.result.r, n = ui.result.node;
    let h = '<div class="result" aria-live="polite"><div class="decide-meta"><span>刚才的抉择 · ' + esc(n.t) + '</span>';
    if (r.check) h += '<span class="roll ' + (r.ok ? 'ok' : 'no') + '">' + r.check[0] + '判定' + (r.ok ? '成功' : '失败') + '（成功率 ' + r.p + '%）</span>';
    if (!r.canon && r.dev > 0) h += '<span style="color:var(--mod)">' + T.devName + ' +' + r.dev + '</span>';
    h += '</div><p>' + esc(r.res || (r.pause ? '你把这个答案记在了心里。' : '事情就这样定了。')) + '</p>';
    return h + '</div>';
  }

  /* 手机专用的简化框：两行以内显示当前属性，右边是年度重心的下拉按钮。
   * 电脑上隐藏，那里有左栏的“状态”卡和完整的“今年的重心”卡。 */
  function focusBar(L, age) {
    const st = L.st;
    const item = (cls, k, v, tip) => '<span class="fs ' + cls + '" title="' + tip + '"><small>' + k + '</small><b>' + v + '</b></span>';
    // 固定两行：第一行四项主属性和改命度，第二行附属属性和重心按钮
    let h = '<div class="card focusbar"><div class="frow">'
      + SUI.bars.map((x) => item(x.cls, x.k, st[x.k], x.tip || '')).join('')
      + item('mod', T.devShort, E.devOf(L) + '%', T.devTip)
      + '</div><div class="frow">'
      + SUI.extras.map((x) => item('', x.k, (x.tier ? tierOf(x, st[x.k]) + ' ' : '') + st[x.k], x.signed ? (st[x.k] >= 0 ? x.signed[0] : x.signed[1]) : (x.tip || ''))).join('');
    const jump = '<button class="fjump" id="f-jump" data-act="focus-jump" aria-label="查看完整的今年的重心" title="查看完整的今年的重心">详情↓</button>';
    if (age < 6) return h + '<span class="fpick-wrap"><span class="b fpick" aria-disabled="true" title="六岁起可以选每一年的重心">' + E.stage(age) + '</span></span>' + jump + '</div></div>';
    const opts = E.focusOptions(age);
    h += '<div class="fpick-wrap"><button class="b fpick" id="f-open" data-act="focus-menu" aria-haspopup="menu" aria-expanded="' + !!ui.focusOpen + '" title="今年的重心">'
      + esc(L.focus || '重心') + ' ▾</button>';
    if (ui.focusOpen) {
      h += '<div class="fmenu" role="menu" aria-label="今年的重心">' + opts.map((f) => '<button class="fopt" role="menuitemradio" id="fm-' + f.name + '" data-act="focus" data-v="' + f.name + '" aria-checked="' + (f.name === L.focus) + '"><b>' + f.name + '</b><small>' + esc(f.d) + '</small></button>').join('') + '</div>';
    }
    return h + '</div>' + jump + '</div></div>';
  }

  function focusCard(L, c, age) {
    const opts = E.focusOptions(age);
    const cur = JY.FOCUS.find((f) => f.name === L.focus);
    let h = '<div class="card focuscard" id="focus-card"><div class="card-h"><h3>今年的重心</h3></div><p class="focus-sub">' + E.stage(age) + ' · ' + esc(L.locCap) + '</p>';
    if (age < 6) {
      h += '<p class="focus-d">还小，由大人照看。性情在这几年慢慢定下来；六岁起可以选每一年的重心。这一段可以开 8× 跳过。</p>';
    } else {
      h += '<p class="focus-d">' + esc(cur ? cur.d : '') + '</p><div class="chips">'
        + opts.map((f) => '<button class="chip" id="f-' + f.name + '" data-act="focus" data-v="' + f.name + '" aria-pressed="' + (f.name === L.focus) + '">' + f.name + '</button>').join('') + '</div>';
    }
    return h + '</div>';
  }

  function logCard(W, L) {
    const lines = L.log.slice(0, ui.shown).map((e, i) => ({ e, i })).reverse();
    const shownLines = ui.logAll ? lines : lines.slice(0, 120);
    const aliveCount = JY.CHARS.filter((x) => G.alive(x.id)).length;
    let h = '<div class="card log-card"><div class="card-h"><h3>生平</h3><small>最新在上 · 点一行加 ☆</small></div>'
      + '<p class="log-note">' + (T.random ? '这是你的第 ' + (W.lives.length + 1) + ' 世' : '这是这个' + T.world + '里的第 ' + (W.lives.length + 1) + ' 世 · 此刻' + T.world + '上还活着的有名有姓者 ' + aliveCount + ' 人') + '</p>'
      + (ui.result ? resultCard() : '') + '<ul class="log">'
      + shownLines.map(({ e, i }, k) => '<li class="k-' + (e.k || 'auto') + (k === 0 ? ' new' : '') + '" data-act="star" data-i="' + i + '"><span class="a">' + e.a + ' 岁</span><span class="t">' + esc(e.t) + '</span><span class="s">' + (e.star ? '☆' : '') + '</span></li>').join('')
      + '</ul>';
    if (lines.length > shownLines.length) h += '<button class="b log-more" id="l-all" data-act="logall">显示全部 ' + lines.length + ' 行</button>';
    return h + '</div>';
  }

  function familyCard(L, c) {
    const rows = [];
    let rels = (c.family || []).filter((f) => !L.rels.find((r) => r.rel === f.rel)).concat(L.rels);
    // 原著关系网里标了 panel 的人（亲人、师徒、夫妻），到了相识那一年自动出现
    G.panelRels().forEach((x) => { if (!rels.find((r) => r.id === x.id)) rels.push(x); });
    rels.forEach((f) => {
      let v = '', n = f.note || '', dead = false, nm = f.name || '';
      if (f.id) {
        nm = G.name(f.id);
        const st = E.status(f.id);
        dead = !!st.dead;
        v = st.dead ? '已故' : st.unborn ? '' : st.age + ' 岁';
        n = st.t + (f.note ? ' · ' + f.note : '');
      }
      rows.push('<div class="row fam"><span class="k">' + esc(f.rel) + '</span><span class="nm">' + esc(nm) + '</span><span class="v">' + v + '</span><span class="n' + (dead ? ' dead' : '') + '">' + esc(n) + '</span></div>');
    });
    return '<div class="card"><div class="card-h"><h3>' + T.familyTitle + '</h3></div><div class="rows">' + (rows.join('') || '<p class="empty">无亲无故。</p>') + '</div></div>';
  }

  function peersCard(L) {
    const rows = L.peers.map((id) => {
      const p = JY.byId[id], st = E.status(id);
      return '<div class="row"><span class="nm">' + esc(p.name) + '</span><span class="v">' + (st.dead ? '已故' : st.unborn ? '未生' : E.stage(st.age)) + '</span>'
        + '<span class="n' + (st.dead ? ' dead' : '') + '">' + [bookOf(p.book).short, p.sex, st.t].filter(Boolean).map(esc).join(' · ') + '</span></div>';
    });
    return '<div class="card"><div class="card-h"><h3>' + T.peersTitle + '</h3><small>' + T.peersSub + '</small></div><div class="rows">' + (rows.join('') || '<p class="empty">没有。</p>') + '</div></div>';
  }

  function rumorCard(W) {
    const last = W.chron.slice(-5).reverse();
    return '<div class="card"><div class="card-h"><h3>' + T.rumor + '</h3><button class="b" id="r-more" data-act="drawer">全部</button></div><div class="rows">'
      + (last.map((e) => '<div class="row"><span class="n" style="grid-column:1/-1;color:' + (e.mod ? 'var(--mod)' : 'var(--soft)') + ';font-size:14px">' + T.year + ' ' + e.y + ' · ' + esc(e.t) + '</span></div>').join('') || '<p class="empty">' + T.world + '还很安静。</p>')
      + '</div></div>';
  }

  /* ---------- 临终、墓志 ---------- */
  function wordsView() {
    const { L } = E.get();
    const c = JY.byId[L.cid];
    return '<div class="words-pick"><div style="color:var(--muted)">' + T.year + ' ' + L.year + ' · ' + (L.year - c.born) + ' 岁</div><h2>' + esc(c.name) + '，' + esc(L.death) + '。</h2>'
      + '<p style="color:var(--soft)">临终前，你想留下一句话：</p>'
      + ui.words.map((w, i) => '<button class="choice" id="wd-' + i + '" data-act="word" data-i="' + i + '"><span class="t">' + (i + 1) + '. “' + esc(w) + '”</span></button>').join('')
      + '</div>';
  }

  function endView() {
    const l = ui.life;
    const c = JY.byId[l.id];
    const age = l.to - l.born;
    let h = '<div class="end"><div class="stele"><canvas class="px" data-portrait="' + l.id + '" data-age="' + age + '" style="width:80px;height:96px"></canvas>'
      + '<div class="vname">' + esc(l.name) + '</div><div class="yrs">' + T.year + ' ' + l.born + ' — ' + l.to + '</div>'
      + '<div class="cause">享年 ' + age + ' · ' + esc(l.cause) + '</div><div class="words">“' + esc(l.words) + '”</div></div>';
    h += '<div class="end-main">';
    h += '<div class="card"><div class="big-num"><div><span>享年</span><b>' + age + '</b></div><div><span>' + T.devName + '</span><b>' + l.dev + '%</b></div><div><span>做过的抉择</span><b>' + l.picks.length + '</b></div></div></div>';
    h += '<div class="card"><h3>' + T.compareTitle + '</h3><div class="compare" style="margin-top:12px"><div><b>' + T.fateLabel + '</b>' + esc(l.fateText) + '</div><div><b>' + T.yourEnd + '</b>' + esc(l.name + '，' + l.cause + '。') + '</div></div></div>';
    h += '<div class="card"><h3>' + T.changed + '</h3><div style="margin-top:10px">' + (l.changes.length
      ? '<ul class="ulist">' + l.changes.map((k) => '<li class="mod">' + esc(JY.FLAGS[k] || k) + '</li>').join('') + '</ul><p style="color:var(--muted);font-size:13.5px;margin-top:10px">这些改变会留在这个' + T.world + '里。下一世重生到后面的年代，还会碰到它们的后果。</p>'
      : '<p style="color:var(--soft)">' + T.noChange + '</p>') + '</div></div>';
    h += '<div class="card"><h3>你做过的选择</h3><ul class="ulist" style="margin-top:10px">' + (l.picks.map((p) => '<li class="' + (!p.canon && p.ok && p.dev > 0 ? 'mod' : '') + '">' + p.age + ' 岁 · ' + esc(p.t) + '：' + esc(p.c) + (p.check ? (p.ok ? '（成功）' : '（失败）') : '') + '</li>').join('') || '<li>一次也没有。</li>') + '</ul></div>';
    if (l.answers.length) h += '<div class="card"><h3>' + T.pauseTag + '</h3><ul class="ulist" style="margin-top:10px">' + l.answers.map((a) => '<li>' + a.age + ' 岁 · ' + esc(a.q) + ' ' + esc(a.a) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>' + T.peersTitle + '</h3><div class="rows" style="margin-top:10px">' + l.peers.map((p) => '<div class="row"><span class="nm">' + esc(p.name) + '</span><span class="v"></span><span class="n' + (p.st.dead ? ' dead' : '') + '">' + esc(p.st.t) + '</span></div>').join('') + '</div></div>';
    h += '<div class="card"><div class="card-h"><h3>人生图</h3><small>一格一年</small></div>' + lifeMap(l.born, l.from, l.to, -9999, l.marks) + '</div>';
    h += '<div class="end-btns"><button class="b primary big" id="e-share" data-act="share">分享这一生</button>'
      + '<button class="b big" id="e-review" data-act="review">再看一遍</button>'
      + '<button class="b big" id="e-home" data-act="home">再入轮回</button><button class="b big" id="e-chron" data-act="drawer">' + T.chronicle + '</button></div>';
    h += '</div></div>';
    return h;
  }
  /* ---------- 终局回顾 ---------- */
  function reviewView() {
    const ms = ui.life.moments;
    const m = ms[ui.review.i];
    const kindTag = { canon: '<span class="tag canon">' + T.legend[0] + '</span>', mod: '<span class="tag mod">' + T.legend[1] + '</span>', fail: '<span class="tag bad">' + T.legend[2] + '</span>', death: '<span class="tag bad">' + T.legend[3] + '</span>', star: '<span class="tag book">你记下的</span>' }[m.k] || '';
    return '<div class="review" data-act="review-next" role="dialog" aria-label="终局回顾">'
      + '<div class="review-top"><span>' + esc(ui.life.name) + ' · 回顾这一生</span><button class="b" id="rv-close" data-act="review-close">跳过</button></div>'
      + '<div class="review-in"><canvas class="px" id="review-cv"></canvas>'
      + '<div class="review-age"><span>' + m.age + ' 岁 · ' + T.year + ' ' + m.y + '</span>' + kindTag + '</div>'
      + '<h2 class="review-t">' + esc(m.t) + '</h2><p class="review-text">' + esc(m.text) + '</p>'
      + '<div class="review-dash">' + ms.map((x, i) => '<i class="' + (i < ui.review.i ? 'done' : i === ui.review.i ? 'cur' : '') + '"></i>').join('') + '</div></div>'
      + '<div class="review-hint">点屏幕继续 · ' + (ui.review.i + 1) + ' / ' + ms.length + '</div></div>';
  }

  /* ---------- 分享 ---------- */
  function shareLinks(l, line) {
    const url = JY.siteUrl();
    const text = JY.shareText(l, line, false);
    const enc = encodeURIComponent;
    return {
      weibo: 'https://service.weibo.com/share/share.php?url=' + enc(url) + '&title=' + enc(text),
      qzone: 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + enc(url) + '&title=' + enc(T.title) + '&summary=' + enc(text),
    };
  }
  function shareImage() {
    const cv = document.createElement('canvas');
    JY.drawShareCard(cv, ui.life, ui.share.line);
    ui.share.canvas = cv;
    ui.share.png = cv.toDataURL('image/png');
  }
  function shareView() {
    const l = ui.life, line = ui.share.line;
    const links = shareLinks(l, line);
    const text = JY.shareText(l, line);
    return '<div class="overlay center" data-act="share-bg"><div class="modal" role="dialog" aria-label="分享这一生">'
      + '<div class="modal-h"><span>分享这一生</span><button class="b" id="sh-close" data-act="share-close">关闭</button></div>'
      + '<div class="modal-b">'
      + '<label for="share-line" class="lbl">写一句活过这一生的话（可选）</label>'
      + '<textarea id="share-line" maxlength="60" placeholder="' + esc(T.sharePlaceholder || '例如：这一世，我没有走上青石桥。') + '">' + esc(line) + '</textarea>'
      + '<p class="hint">写了会放在文字总结的开头，也会印在图片上。</p>'
      + '<button class="share-main" id="sh-native" data-act="share-native">分享<small>图片和文字一起发给微信、QQ 等应用</small></button>'
      + '<div class="share-grid">'
      + '<button class="b" id="sh-copy" data-act="share-copy">复制文字总结和链接</button>'
      + '<a class="b" id="sh-save" href="' + ui.share.png + '" download="' + T.title + '-' + esc(l.name) + '.png">保存图片</a>'
      + '<a class="b" id="sh-weibo" href="' + esc(links.weibo) + '" target="_blank" rel="noopener">发到微博</a>'
      + '<a class="b" id="sh-qzone" href="' + esc(links.qzone) + '" target="_blank" rel="noopener">发到 QQ 空间</a>'
      + '</div><p class="hint" id="share-msg" aria-live="polite"></p>'
      + '<div class="lbl">文字总结</div><textarea id="share-text" class="share-text" readonly rows="7">' + esc(text) + '</textarea>'
      + '<div class="lbl">分享图</div><img class="card-img" id="share-img" src="' + ui.share.png + '" alt="' + esc(l.name) + '的生平卡片">'
      + '<p class="hint">在微信里打开时，长按图片可以保存或发给朋友。' + (JY.siteUrl() ? '' : '上线后在 config.js 里填写网址，文字总结会自动附上链接。') + '</p>'
      + '</div></div></div>';
  }
  function refreshShare() {
    shareImage();
    const l = ui.life, line = ui.share.line;
    const links = shareLinks(l, line);
    const img = document.getElementById('share-img');
    if (img) img.src = ui.share.png;
    const save = document.getElementById('sh-save');
    if (save) save.href = ui.share.png;
    const t = document.getElementById('share-text');
    if (t) t.value = JY.shareText(l, line);
    const w = document.getElementById('sh-weibo');
    if (w) w.href = links.weibo;
    const q = document.getElementById('sh-qzone');
    if (q) q.href = links.qzone;
  }
  function shareMsg(t) { const m = document.getElementById('share-msg'); if (m) m.textContent = t; }
  function copyShareText() {
    const ta = document.getElementById('share-text');
    const done = () => shareMsg('文字总结和链接已复制，可以直接粘贴到微信、微博或朋友圈。');
    const fallback = () => { ta.focus(); ta.select(); shareMsg('已选中文字，请按 Ctrl+C 或长按复制。'); };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); }
  }
  function nativeShare() {
    const text = JY.shareText(ui.life, ui.share.line, false);
    const url = JY.siteUrl();
    const tryText = () => {
      if (navigator.share) navigator.share({ title: T.title, text, url: url || undefined }).catch(() => {});
      else copyShareText();
    };
    if (!ui.share.canvas || !ui.share.canvas.toBlob) { tryText(); return; }
    ui.share.canvas.toBlob((blob) => {
      try {
        const file = new File([blob], T.title + '-' + ui.life.name + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: T.title, text: text + (url ? ' ' + url : '') }).catch(() => {});
          return;
        }
      } catch (e) { /* 不支持带图分享 */ }
      tryText();
      if (!navigator.share) shareMsg('这个浏览器不能直接分享。文字总结已复制；图片可以长按或点“保存图片”。');
    });
  }

  /* ---------- 大事记 ---------- */
  function drawerView() {
    const { W } = E.get();
    const list = W.chron.filter((e) => !ui.drawerMod || e.mod).slice().reverse();
    return '<div class="overlay" data-act="drawer-bg"><div class="drawer" role="dialog" aria-label="' + T.chronicle + '">'
      + '<div class="drawer-h"><h3>' + T.chronicle + '</h3><div style="display:flex;gap:6px">'
      + '<button class="b" id="d-mod" data-act="drawer-mod" aria-pressed="' + ui.drawerMod + '">只看被改变的</button>'
      + '<button class="b" id="d-close" data-act="drawer-close">关闭</button></div></div>'
      + '<div class="drawer-b">' + (list.length ? '<ul class="chron">' + list.map((e) => '<li class="' + (e.mod ? 'mod' : '') + '"><span class="y">' + T.year + ' ' + e.y + '</span><span class="t">' + esc(e.t) + '</span></li>').join('') + '</ul>'
        : '<p class="empty">' + (ui.drawerMod ? '还没有被改变的事。' : '这个' + T.world + '还没有发生过什么。') + '</p>')
      + '</div></div></div>';
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const active = document.activeElement && document.activeElement.id;
    let h = '';
    if (ui.screen === 'home') h = homeView();
    else if (ui.screen === 'wake') h = wakeView();
    else if (ui.screen === 'life') h = lifeView();
    else if (ui.screen === 'words') h = wordsView();
    else if (ui.screen === 'end') h = endView();
    if (ui.drawer) h += drawerView();
    if (ui.screen === 'end' && ui.share) h += shareView();
    if (ui.screen === 'end' && ui.review) h += reviewView();
    app.innerHTML = h;
    const rc = document.getElementById('review-cv');
    if (rc) {
      const m = ui.life.moments[ui.review.i];
      JY.drawScene(rc, { loc: m.loc, year: m.y, me: ui.life.id, age: m.age, party: m.party || [], partyAges: (m.party || []).map(() => 30) });
    }
    app.querySelectorAll('canvas[data-portrait]').forEach((cv) => JY.drawPortrait(cv, cv.dataset.portrait, Number(cv.dataset.age) || 20));
    const sc = document.getElementById('scene-cv');
    if (sc) {
      const { L } = E.get();
      const c = JY.byId[L.cid];
      const age = Math.max(0, L.year - c.born);
      const party = partyOf(L, c, age);
      JY.drawScene(sc, { loc: L.loc, year: L.year, me: L.cid, age, party, partyAges: party.map((id) => G.ageOf(id)) });
    }
    if (active) { const el = document.getElementById(active); if (el) el.focus({ preventScroll: true }); }
  }

  /* ---------- 交互 ---------- */
  function act(a, d) {
    const { L } = E.get();
    switch (a) {
      case 'theme': {
        const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        store.set(PRE + 'theme', next);
        render();
        break;
      }
      case 'random': { const av = E.available(); if (av.length) start(av[Math.floor(Math.random() * av.length)].id); break; }
      case 'start': start(d.id); break;
      case 'reborn': start(null); break;
      case 'begin': begin(); break;
      case 'resume': resume(); break;
      case 'home': goHome(); break;
      case 'pause': ui.paused = !ui.paused; render(); break;
      case 'speed': ui.speed = Number(d.v); store.set(PRE + 'speed', String(ui.speed)); render(); break;
      case 'next': skipToDecision(); break;
      case 'auto': ui.auto = !ui.auto; ui.paused = false; render(); break;
      case 'choose': if (ui.pending) choose(Number(d.i)); break;
      case 'peek': ui.peek = true; render(); break;
      case 'peek-off': ui.peek = false; render(); break;
      case 'focus': if (L) { L.focus = d.v; ui.focusOpen = false; E.save(); render(); } break;
      case 'focus-menu': ui.focusOpen = !ui.focusOpen; render(); break;
      case 'focus-jump': { const el = document.getElementById('focus-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
      case 'star': if (L && L.log[Number(d.i)]) { L.log[Number(d.i)].star = !L.log[Number(d.i)].star; E.save(); render(); } break;
      case 'logall': ui.logAll = true; render(); break;
      case 'word': finish(Number(d.i)); break;
      case 'review': openReview(); break;
      case 'review-next': reviewNext(); break;
      case 'review-close': closeReview(); break;
      case 'share': ui.share = { line: '' }; shareImage(); render(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (ui.share) refreshShare(); }); break;
      case 'share-close': ui.share = null; render(); break;
      case 'share-copy': copyShareText(); break;
      case 'share-native': nativeShare(); break;
      case 'drawer': ui.drawer = true; render(); break;
      case 'drawer-close': ui.drawer = false; render(); break;
      case 'drawer-bg': break;
      case 'drawer-mod': ui.drawerMod = !ui.drawerMod; render(); break;
      case 'reset': ui.confirm = true; render(); break;
      case 'reset-no': ui.confirm = false; render(); break;
      case 'reset-yes': E.reset(); ui.confirm = false; ui.life = null; render(); break;
      default: break;
    }
  }
  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (ui.focusOpen && !e.target.closest('.fpick-wrap')) { ui.focusOpen = false; if (!t) { render(); return; } }
    if (!t) return;
    if (t.dataset.act === 'drawer-bg' && e.target !== t) return; // 点抽屉里面不关
    if (t.dataset.act === 'drawer-bg') { ui.drawer = false; render(); return; }
    if (t.dataset.act === 'decide-bg') return; // 点抉择框外面不关，免得误触
    if (t.dataset.act === 'share-bg') { if (e.target === t) { ui.share = null; render(); } return; }
    act(t.dataset.act, t.dataset);
  });
  app.addEventListener('input', (e) => {
    if (e.target.id === 'share-line' && ui.share) {
      ui.share.line = e.target.value.trim();
      clearTimeout(ui.share.t);
      ui.share.t = setTimeout(refreshShare, 250);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (ui.review) {
      if (e.key === 'Escape') { closeReview(); return; }
      if (e.key === 'ArrowLeft') { reviewPrev(); return; }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); reviewNext(); return; }
    }
    if (e.key === 'Escape' && ui.share) { ui.share = null; render(); return; }
    if (e.key === 'Escape' && ui.drawer) { ui.drawer = false; render(); return; }
    if (ui.screen !== 'life') return;
    if (e.key === ' ' && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); act('pause'); return; }
    if (ui.focusOpen && e.key === 'Escape') { ui.focusOpen = false; render(); return; }
    if (ui.pending && e.key === 'Escape') { act(ui.peek ? 'peek-off' : 'peek'); return; }
    if (ui.pending && /^[1-5]$/.test(e.key)) {
      const opts = E.choices(ui.pending);
      const o = opts[Number(e.key) - 1];
      if (o) choose(o.i);
    }
  });

  /* ---------- 回到顶部（手机上滚下去才出现） ---------- */
  const topBtn = document.createElement('button');
  topBtn.className = 'to-top';
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', '回到顶部');
  topBtn.innerHTML = '<span aria-hidden="true">↑</span><small>顶部</small>';
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(topBtn);
  const syncTop = () => topBtn.classList.toggle('show', window.scrollY > 480);
  window.addEventListener('scroll', syncTop, { passive: true });

  /* ---------- 启动 ---------- */
  E.load();
  if (E.get().L) { ui.screen = 'home'; }
  render();
})();

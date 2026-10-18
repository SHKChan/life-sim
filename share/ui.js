/* 共用界面（文字、书名、颜色读 JY.GAME）
 * 屏幕：home 首页 → wake 醒来 → life 这一生 → words 临终 → end 墓志。
 * 每一年的生平一行一行显示出来；遇到抉择就停下，弹出抉择框等玩家。
 * 抉择框可以“收起”看局面，底部留一个按钮再展开。
 * 界面上的字都走 t()（share/i18n.js），以中文为准，别的语言查词表。
 */
(function () {
  'use strict';
  const JY = window.JY, E = JY.engine, G = JY.G;
  const app = document.getElementById('app');
  const val = JY.val;
  const t = JY.t || ((s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => v[k]) : s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SPEEDS = [1, 2, 4, 8, 16];
  const YEAR_MS = 60000; // 1× 时一年约一分钟，速度翻倍时间减半
  const STEP = 100;
  // 游戏用词：默认值是江湖一梦的；游戏的 game.js 覆盖；当前语言再用 JY.GAME.i18n.<语言> 覆盖
  const LOC = (JY.GAME && JY.GAME.i18n && JY.GAME.i18n[JY.LANG]) || {};
  const T = Object.assign({
    id: 'game', title: t('人生'), titleHtml: t('人生'), intro: '', freshLine: t('一个新的世界。'), year: t('纪年'), world: t('世界'),
    idcard: t('名帖'), rumor: t('传闻'), chronicle: t('大事记'), changed: t('世界因你而变'), changedMine: t('世界因我而变'), canon: t('原著'),
    devName: t('改命度'), devShort: t('改命'), devTip: t('这一生偏离原著多少'), modTag: t('改命'), pauseTag: t('人生关口'), encTag: t('奇遇'),
    yourEnd: t('你的结局'), familyTitle: t('家人与师承'), peersTitle: t('同代人'), peersSub: t('与你年纪相仿<br>此刻'), livesTitle: t('往生录'), pickTitle: t('重生成谁'), randomBtn: t('随机重生'), beginBtn: t('开始这一生'),
    random: false, // true：每一世随机生成一个人（JY.GENERATE），不从名单里挑
    howto: [], lastWords: { happy: t('这一生，值了。'), sad: t('若有来生，换个活法。'), plain: t('就此别过。'), changed: t('原来命，是可以改的。'), canon: t('我这一生，大概就是书里写的那样。') },
    books: {},
  }, JY.GAME || {}, LOC);
  // 由 canon 推出来的用词（游戏没写时）
  T.canonEvent = T.canonEvent || t('{c}大事', { c: T.canon });
  T.fateLabel = T.fateLabel || t('{c}命数', { c: T.canon });
  T.compareTitle = T.compareTitle || t('{c}与你', { c: T.canon });
  T.legend = T.legend || [t('照{c}选', { c: T.canon }), t('改了命'), t('没改成'), t('命终')];
  T.noChange = T.noChange || t('{w}照着{c}走了下去。', { w: T.world, c: T.canon });
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
  // 属性名、说明、分档名是数据里的键，显示时再翻译
  const statName = (k) => t(k);
  const extraLabel = (x, L) => t(typeof x.label === 'function' ? x.label(L, G) : x.label || x.k);
  const tierOf = (x, v) => { if (!x.tier) return ''; const p = x.tier.find((q) => v < q[0]) || x.tier[x.tier.length - 1]; return t(p[1]); };
  const PROF = T.profile || {};
  /* 场景框画什么：游戏的 scene(g) 返回 { loc, cap, party, pets } 时照它画（例如在家就画家里人，在医院就画陪着的人）；
   * 没有就画当前地点和 party */
  function sceneOf(L, c, age) {
    const s = T.scene ? T.scene(G) : null;
    if (s) return { loc: s.loc || L.loc, cap: s.cap || L.locCap, party: (s.party || []).filter((id) => G.alive(id)), pets: s.pets || [] };
    const loc = JY.LOCS[L.loc] || { name: L.locCap, desc: '' };
    const party = partyOf(L, c, age);
    const who = T.sceneCap ? T.sceneCap(G) : age < 3 ? t('在襁褓里') : party.length ? t('与{who}', { who: party.map((id) => G.name(id)).join(t('、')) }) : t('独自一人');
    return { loc: L.loc, cap: L.locCap + (loc.desc ? ' · ' + t(loc.desc) : '') + ' · ' + who, party, pets: [] };
  }
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
    fromBirth: store.get(PRE + 'fromBirth') === '1', // 游戏设了 wakeAge 时，首页可以改回“从出生开始”
    drawer: false, drawerMod: false, confirm: false, logAll: false,
    review: null, reviewTimer: null, share: null, peek: false,
    frac: 0, yBase: 0, autoT: null, feedback: null,
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
  function dots(n) { return '●'.repeat(n) + '○'.repeat(5 - n); }
  function lifeBar(cls, label, v) {
    return '<div class="stat ' + cls + '"><span>' + esc(label) + '</span><span class="bar"><i style="width:' + v + '%"></i></span><b>' + v + '</b></div>';
  }
  const ageText = (a) => t('{n} 岁', { n: a });
  const yearText = (y) => T.year + ' ' + y;
  function partyOf(L, c, age) {
    if (T.party) return T.party(G).filter((id) => G.alive(id)); // 游戏自己定场景里画谁（例如和你住在一起的人）
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
      h += '<i class="' + cls + '" title="' + esc(ageText(a) + ' · ' + yearText(y)) + '"></i>';
    }
    return '<div class="lifemap">' + h + '</div><div class="legend">'
      + '<span style="--c:var(--canon)">' + esc(T.legend[0]) + '</span><span style="--c:var(--mod)">' + esc(T.legend[1]) + '</span>'
      + '<span style="--c:color-mix(in srgb, var(--bad) 55%, var(--panel-2))">' + esc(T.legend[2]) + '</span><span style="--c:var(--bad)">' + esc(T.legend[3]) + '</span></div>';
  }
  function card(title, small, body, extraCls) {
    return '<div class="card' + (extraCls ? ' ' + extraCls : '') + '"><div class="card-h"><h3>' + title + '</h3>' + (small ? '<small>' + small + '</small>' : '') + '</div>' + body + '</div>';
  }

  /* ---------- 网站导航、语言、反馈 ----------
   * config.js 里：homeUrl / homeName（所有游戏的总页面）、hubUrl / hubName（这个合集的大厅）、
   * feedbackRepo（'用户名/仓库'，有了才能提交到 GitHub Issues）、feedbackApi（以后有后端时，POST 到这个地址）。 */
  // 小图标（线条，跟着文字颜色）
  const ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
  };
  // 三种主题：暗、灰、白，点一下换下一种
  const THEMES = [['dark', '暗'], ['gray', '灰'], ['light', '白']];
  const themeNow = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function themeBtn(id, withText) {
    const cur = THEMES.find((x) => x[0] === themeNow()) || THEMES[0];
    return '<button class="b icon-b" id="' + id + '" data-act="theme" title="' + esc(t('主题：{x}（点一下换）', { x: t(cur[1]) })) + '">' + ICON.theme + '<span>' + esc(t(cur[1])) + (withText ? ' · ' + t('主题') : '') + '</span></button>';
  }
  function langSelect(id) {
    return '<label class="lang-wrap" title="' + esc(t('语言')) + '">' + ICON.globe + '<select class="lang-sel" id="' + id + '" aria-label="' + esc(t('语言')) + '">'
      + (JY.LANGS || [['zh', '中文']]).map((l) => '<option value="' + l[0] + '"' + (l[0] === (JY.LANG || 'zh') ? ' selected' : '') + '>' + l[1] + '</option>').join('')
      + '</select></label>';
  }
  const feedbackBtn = (id, label) => '<button class="b icon-b" id="' + id + '" data-act="feedback">' + ICON.chat + '<span>' + label + '</span></button>';
  function crumbs() {
    const bits = [];
    if (CFG.homeUrl) bits.push('<a href="' + esc(CFG.homeUrl) + '">' + esc(CFG.homeName || t('首页')) + '</a>');
    if (CFG.hubUrl !== '') bits.push('<a href="' + esc(CFG.hubUrl || '../') + '">' + esc(t(CFG.hubName || '大厅')) + '</a>');
    bits.push('<span class="cur">' + esc(T.title) + '</span>');
    return bits.join('<span class="sep" aria-hidden="true">›</span>');
  }
  // 页面最上面的全站导航由总页面的 /nav.js 提供（vibe-game 仓库），这里只做每页底部这一条
  function footNav() {
    return '<footer class="site-foot"><div class="crumbs">' + crumbs() + (T.version ? '<span class="ver" title="' + esc(t('版本')) + '">v' + esc(T.version) + '</span>' : '') + '</div><div class="nav-tools">'
      + langSelect('lang-foot') + feedbackBtn('f-feedback', t('问题反馈')) + '</div>' + mtNote() + '</footer>';
  }
  // 机器翻译剧情时，在底部说一声
  const mtNote = () => (JY.MT ? '<p class="mt-note">' + t('剧情由谷歌网页翻译自动翻译，可能不够准确。') + '</p>' : '');
  const FB_KINDS = [['bug', '程序出错'], ['story', '剧情不合理'], ['idea', '建议'], ['other', '其他']];
  function feedbackContext() {
    const { L } = E.get();
    const bits = [T.title + ' (' + T.id + ')', t('语言') + ': ' + (JY.LANG || 'zh'), location.href.split('?')[0]];
    if (L) {
      const c = JY.byId[L.cid];
      bits.push(esc(c.name) + ' · ' + ageText(L.year - c.born) + ' · ' + yearText(L.year));
      const last = L.log.slice(-3).map((e) => '  ' + ageText(e.a) + ' ' + e.t);
      if (last.length) bits.push(t('最近的生平：') + '\n' + last.join('\n'));
    }
    bits.push(navigator.userAgent);
    return bits.join('\n');
  }
  function feedbackView() {
    const f = ui.feedback;
    return '<div class="overlay center" data-act="fb-bg"><div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(t('问题反馈')) + '">'
      + '<div class="modal-h"><span>' + t('问题反馈') + '</span><button class="b" id="fb-close" data-act="fb-close">' + t('关闭') + '</button></div>'
      + '<div class="modal-b">'
      + '<div class="fb-kinds" role="radiogroup">' + FB_KINDS.map((k) => '<button class="chip" role="radio" id="fb-k-' + k[0] + '" data-act="fb-kind" data-v="' + k[0] + '" aria-pressed="' + (f.kind === k[0]) + '">' + t(k[1]) + '</button>').join('') + '</div>'
      + '<label for="fb-text" class="lbl">' + t('遇到了什么？越具体越好（哪一岁、哪一句话、你期待的是什么）') + '</label>'
      + '<textarea id="fb-text" maxlength="2000" rows="6">' + esc(f.text) + '</textarea>'
      + '<label class="fb-ctx"><input type="checkbox" id="fb-ctx"' + (f.ctx ? ' checked' : '') + '> ' + t('附上当前的游戏进度（人物、年龄、最近几行生平、浏览器）') + '</label>'
      + '<div class="share-grid">'
      + (CFG.feedbackApi ? '<button class="b primary" id="fb-send" data-act="fb-send">' + t('发送') + '</button>' : '')
      + (CFG.feedbackRepo ? '<button class="b' + (CFG.feedbackApi ? '' : ' primary') + '" id="fb-gh" data-act="fb-gh">' + t('提交到 GitHub') + '</button>' : '')
      + '<button class="b" id="fb-copy" data-act="fb-copy">' + t('复制反馈内容') + '</button>'
      + '</div><p class="hint" id="fb-msg" aria-live="polite">' + esc(f.msg || '') + '</p>'
      + (CFG.feedbackRepo && !CFG.feedbackApi ? '<p class="hint">' + t('提交到 GitHub 需要一个 GitHub 账号；打不开的话，点“复制反馈内容”发给作者。') + '</p>' : '')
      + '</div></div></div>';
  }
  function feedbackBody() {
    const f = ui.feedback;
    const kind = (FB_KINDS.find((k) => k[0] === f.kind) || FB_KINDS[3])[1];
    return { title: '[' + t(kind) + '] ' + (f.text.split('\n')[0] || '').slice(0, 60), body: f.text + (f.ctx ? '\n\n---\n' + feedbackContext() : ''), kind: f.kind };
  }
  function fbMsg(m) { ui.feedback.msg = m; const el = document.getElementById('fb-msg'); if (el) el.textContent = m; }
  function feedbackAct(a, d) {
    const f = ui.feedback;
    if (!f) return;
    if (a === 'fb-kind') { f.kind = d.v; render(); return; }
    if (!f.text.trim()) { fbMsg(t('先写几句再提交。')); return; }
    const p = feedbackBody();
    if (a === 'fb-gh') {
      const url = 'https://github.com/' + CFG.feedbackRepo + '/issues/new?title=' + encodeURIComponent(p.title) + '&body=' + encodeURIComponent(p.body.slice(0, 6000));
      window.open(url, '_blank', 'noopener');
      fbMsg(t('已在新窗口打开 GitHub，确认后点提交即可。'));
    } else if (a === 'fb-copy') {
      const txt = p.title + '\n\n' + p.body;
      const done = () => fbMsg(t('已复制，可以粘贴给作者。'));
      try { navigator.clipboard.writeText(txt).then(done, () => fbMsg(t('复制失败，请手动选中文字复制。'))); } catch (e) { fbMsg(t('复制失败，请手动选中文字复制。')); }
    } else if (a === 'fb-send') {
      fbMsg(t('发送中…'));
      fetch(CFG.feedbackApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ game: T.id, lang: JY.LANG }, p)) })
        .then((r) => { if (!r.ok) throw new Error(r.status); f.text = ''; fbMsg(t('收到了，谢谢！')); })
        .catch(() => fbMsg(t('发送失败，请稍后再试，或复制内容发给作者。')));
    }
  }

  /* ---------- 计时 ----------
   * ui.frac 是当前这一年走过的比例（0–1），顶栏纪年下面的小进度条显示它。
   * 这一年的生平行在前 85% 的时间里均匀出现，走满一年再推演下一年。
   * 抉择框弹出时时钟停住，选完接着走。 */
  function yearMs() { const { L } = E.get(); const d = YEAR_MS / ui.speed; return L && L.death ? Math.min(d, 4000) : d; }
  function paceText() {
    const sec = YEAR_MS / ui.speed / 1000;
    return sec >= 60 ? t('一年约 {n} 分钟', { n: sec / 60 }) : t('一年约 {n} 秒', { n: Math.round(sec * 2) / 2 });
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
    const target = lineTarget(L);
    if (target > ui.shown) { ui.shown = target; render(); return; }
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
  // 游戏的 wakeAge：默认从这个年纪醒来，之前的年份按原著结算；首页勾了“从出生开始”就不用
  const wakeOpts = () => (T.wakeAge && !T.random && !ui.fromBirth ? { fromAge: T.wakeAge } : undefined);
  const wakeYearOf = (c) => (E.wakeYear ? E.wakeYear(c, wakeOpts()) : E.startYear(c));
  function start(id) {
    ui.wake = id ? E.startLife(id, wakeOpts()) : E.startRandom();
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
      + '<div>' + themeBtn('h-theme', true) + '</div></div>';
    h += '<div class="world-line">';
    if (fresh) h += '<span>' + T.freshLine + '</span>'; // 游戏自己写的用词，可以带 <b>
    else if (T.random) h += '<span>' + t('已经活过 <b>{n}</b> 世', { n: W.lives.length }) + '</span>';
    else h += '<span><b>' + esc(T.world + T.year) + ' ' + Math.max(0, W.year) + '</b> · ' + esc(t(E.era(W.year))) + ' · ' + t('已经活过 {n} 世', { n: W.lives.length }) + '</span>';
    if (L) {
      const c = JY.byId[L.cid];
      h += '<button class="b primary" id="h-resume" data-act="resume">' + t('继续这一生：{name}，{age}', { name: esc(c.name), age: ageText(L.year - c.born) }) + '</button>';
    } else if (T.random) {
      h += '<button class="b primary big" id="h-random" data-act="reborn">' + esc(T.randomBtn) + '</button>';
    } else if (avail.length) {
      h += '<button class="b primary" id="h-random" data-act="random">' + esc(T.randomBtn) + '</button>';
    }
    if (!T.random) h += '<button class="b" id="h-chron" data-act="drawer">' + esc(T.chronicle) + '</button>';
    if (!fresh || L) h += '<button class="b" id="h-reset" data-act="reset">' + esc(T.random ? t('清空{x}', { x: T.livesTitle }) : t('重开一个{x}', { x: T.world })) + '</button>';
    h += '</div>';
    if (ui.confirm) {
      h += '<div class="confirm"><span>' + esc(T.random ? t('会清空{x}和正在过的这一生，不能撤销。', { x: T.livesTitle }) : t('重开会清空这个{w}的全部历史和{x}，不能撤销。', { w: T.world, x: T.livesTitle })) + '</span>'
        + '<button class="b" id="h-reset-yes" data-act="reset-yes">' + t('清空并重开') + '</button><button class="b" id="h-reset-no" data-act="reset-no">' + t('算了') + '</button></div>';
    }
    if (!L && !T.random) {
      h += '<section><div class="section-h"><h2>' + esc(T.pickTitle) + '</h2><span>' + (avail.length ? esc(t('{n} 人可选。已经死去或已经活过的人不能再选；{y}已过的人，会从现在的年纪醒来。', { n: avail.length, y: T.year })) : '') + '</span>'
        + (T.wakeAge && avail.length ? '<button class="b" id="h-birth" data-act="from-birth" aria-pressed="' + ui.fromBirth + '" title="' + esc(t('不勾时从 {n} 岁醒来，之前的年份照{c}过完。', { n: T.wakeAge, c: T.canon })) + '">' + (ui.fromBirth ? '☑ ' : '☐ ') + esc(t('从出生开始')) + '</button>' : '')
        + '</div>';
      if (avail.length) {
        h += '<div class="picks">' + avail.map((c) => {
          const s = wakeYearOf(c), a = s - c.born;
          return '<button class="pick" id="pick-' + c.id + '" data-act="start" data-id="' + c.id + '">'
            + '<canvas class="px" data-portrait="' + c.id + '" data-age="' + Math.max(18, a) + '"></canvas>'
            + '<div><div class="nm">' + esc(c.name) + '</div><div class="meta">' + esc(bookOf(c.book).short) + ' · ' + esc(t(c.sex)) + ' · ' + esc(t('生于{y}', { y: yearText(c.born) }))
            + ' · ' + esc(a > 0 ? t('醒来时 {n} 岁', { n: a }) : t('从出生开始')) + '</div><div class="fate">' + esc(c.fateText) + '</div></div></button>';
        }).join('') + '</div>';
      } else {
        h += '<p class="empty">' + esc(t('这个{w}里能重生的人都已经走完了一生。可以看看大事记，或者重开一个{w}。', { w: T.world })) + '</p>';
      }
      h += '</section>';
    }
    h += '<section><div class="section-h"><h2>' + esc(T.livesTitle) + '</h2><span>' + esc(T.random ? t('你活过的每一世') : t('这个{w}里你活过的每一世', { w: T.world })) + '</span></div>';
    h += W.lives.length ? '<div class="lives">' + W.lives.slice().reverse().map((l) => '<div class="life-row"><b>' + esc(l.name) + '</b><span>' + esc(T.year + ' ' + l.from + '–' + l.to + ' · ' + t('享年 {n}', { n: l.to - l.born }) + ' · ' + l.cause) + ' · “' + esc(l.words) + '”</span><span class="d">' + esc(T.devShort) + ' ' + l.dev + '%</span></div>').join('') + '</div>'
      : '<p class="empty">' + t('还没有。') + '</p>';
    h += '</section>';
    h += '<section class="how">' + T.howto.map((x) => '<div><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</div>').join('') + '</section></div>';
    return h + footNav();
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
      h += card(esc(t('你醒来之前的{w}', { w: T.world })), esc(t('{n} 件事', { n: before.length })),
        '<ul class="before">' + last.map((e) => '<li class="' + (e.mod ? 'mod' : '') + '">' + esc(yearText(e.y) + ' · ' + e.t) + '</li>').join('') + '</ul>'
        + (before.length > last.length ? '<p class="empty" style="padding:8px 0 0">' + esc(t('更早的事在{w}大事记里。', { w: T.world })) + '</p>' : ''));
    }
    const mine = (ui.wake.mine || []).filter((m) => m.c || m.text);
    if (mine.length) {
      // 醒来之前自己走过的那些年（按原著）
      const ml = mine.slice(-12);
      h += card(esc(t('醒来之前的你')), esc(t('{n} 件事，照{c}走过', { n: mine.length, c: T.canon })),
        '<ul class="before">' + ml.map((m) => '<li>' + esc(ageText(m.age) + ' · ' + (/岁$/.test(m.t) ? '' : m.t + ' · ') + (m.c ? m.c + '。' : '') + (m.text || '')) + '</li>').join('') + '</ul>');
    }
    h += '<div class="card"><div class="id-body" style="padding:0"><canvas class="px" data-portrait="' + c.id + '" data-age="' + age + '"></canvas><div>'
      + '<div class="id-name">' + esc(c.name) + '</div><div style="color:var(--muted);font-size:14px">' + [bookOf(c.book).short, t(c.sex), c.birthplace, age <= 0 ? t('刚刚出生') : t('醒来时 {n} 岁', { n: age })].filter(Boolean).map(esc).join(' · ') + '</div></div></div>'
      + '<p class="intro" style="margin-top:16px">' + esc(L.intro) + '</p>'
      + (c.facts && c.facts.length ? '<dl class="kv facts" style="margin-top:14px">' + c.facts.map((f) => '<dt>' + esc(t(f[0])) + '</dt><dd>' + esc(f[1]) + '</dd>').join('') + '</dl>' : '')
      + (c.odds ? '<p class="odds">' + esc(c.odds) + '</p>' : '')
      + (c.fateText ? '<div class="fate-box" style="margin-top:14px"><b>' + esc(T.fateLabel) + '</b>' + esc(c.fateText) + '</div>' : '')
      + '<div style="margin-top:16px">' + SUI.bars.map((x) => lifeBar(x.cls, statName(x.k), L.st[x.k])).join('') + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="b primary big" id="w-begin" data-act="begin">' + esc(T.beginBtn) + '</button></div>'
      + '</div></div>';
    return h + footNav();
  }

  /* ---------- 这一生 ---------- */
  function lifeView() {
    const { W, L } = E.get();
    const c = JY.byId[L.cid];
    const Y = L.year, age = Math.max(0, Y - c.born), b = bookOf(c.book);
    const showDecision = ui.pending && ui.shown >= L.log.length;
    // 暂停时整段换成“已暂停”，宽度不变，顶栏不会挤成两行
    const pace = ui.paused ? ui.speed + '× · ' + t('已暂停') : ui.speed + '× · ' + paceText();
    let h = '<header class="top"><div class="top-in wide">'
      + '<button class="logo" id="t-logo" data-act="home" title="' + esc(t('回到首页')) + '">' + T.titleHtml + '</button>'
      + '<div class="agebox"><span>' + t('年龄') + '</span><b>' + age + '</b></div>'
      + '<div class="when"><span class="yr">' + esc(yearText(Y)) + '</span><span class="yr-bar" title="' + esc(t('今年的进度')) + '"><i id="yr-prog" style="width:' + (ui.frac * 100).toFixed(1) + '%"></i></span>'
      + '<small class="pace' + (ui.paused ? ' paused' : '') + '">' + esc(pace) + '</small></div>'
      + '<div class="ctl">'
      + '<button class="b pause-b" id="c-pause" data-act="pause">' + (ui.paused ? '▶ ' + t('继续') : '❚❚ ' + t('暂停')) + '</button>'
      + '<span class="speeds" role="group" aria-label="' + esc(t('速度')) + '">' + SPEEDS.map((s) => '<button class="b" id="c-s' + s + '" data-act="speed" data-v="' + s + '" aria-pressed="' + (ui.speed === s) + '">' + s + '×</button>').join('') + '</span>'
      + '<button class="b" id="c-next" data-act="next"' + (showDecision ? ' disabled' : '') + '>' + t('下一抉择') + ' »</button>'
      + '<button class="b" id="c-auto" data-act="auto" aria-pressed="' + ui.auto + '">' + t('自动') + '</button>'
      + themeBtn('c-theme')
      + langSelect('lang-ctl')
      + feedbackBtn('c-feedback', t('反馈'))
      + '<button class="b" id="c-chron" data-act="drawer">' + esc(T.chronicle) + '</button>'
      + '<button class="b" id="c-exit" data-act="home">' + t('离开') + '</button>'
      + '</div></div></header>';

    h += '<div class="shell">';
    /* 左：名帖、状态 */
    h += '<div class="col left">';
    h += '<div class="card idcard"><div class="id-strip" style="background:' + b.color + ';color:' + b.ink + '"><span>' + esc(T.idcard) + ' · ' + b.code + '</span><span>' + esc(yearText(Y)) + '</span></div>'
      + '<div class="id-body"><canvas class="px" data-portrait="' + c.id + '" data-age="' + age + '"></canvas><div>'
      + '<div class="id-name">' + esc(c.name) + '</div><dl class="kv">'
      + '<dt>' + t('性别') + '</dt><dd>' + esc(t(c.sex)) + '</dd>'
      + '<dt>' + t('出生') + '</dt><dd>' + esc(yearText(c.born) + ' · ' + (c.birthplace || '')) + '</dd>'
      // 名帖上显示哪些行，游戏可在 game.js 的 profile 里精简：{ liveIn: false, era: false, hide: ['子女', …] }
      + (PROF.liveIn === false ? '' : '<dt>' + t('现居') + '</dt><dd>' + esc(L.locCap || '') + '</dd>')
      + (PROF.era === false ? '' : '<dt>' + t('时代') + '</dt><dd>' + esc(t(E.era(Y))) + '</dd>')
      + Object.keys(L.info).filter((k) => L.info[k] && !(PROF.hide || []).includes(k)).map((k) => '<dt>' + esc(t(k)) + '</dt><dd>' + esc(L.info[k]) + '</dd>').join('')
      + '<dt>' + t('出身') + '</dt><dd class="dots">' + dots(c.bg || 3) + '</dd>'
      + '</dl></div></div></div>';
    h += card(t('状态'), '0–100',
      SUI.bars.map((x) => lifeBar(x.cls, statName(x.k), L.st[x.k])).join('')
      + '<details class="what"><summary>' + t('这些是什么意思？') + '</summary>'
      + SUI.bars.concat(SUI.extras).filter((x) => x.tip).map((x) => '<p><b>' + esc(statName(x.k)) + '</b>：' + esc(t(x.tip)) + '</p>').join('')
      + '<p>' + t('属性只决定成功率，不决定结果。') + '</p></details>'
      + '<div class="sub-stats">'
      + SUI.extras.map((x) => {
        const v = L.st[x.k];
        const shown = x.show && x.show(L, G);
        if (shown) return '<div><span>' + esc(extraLabel(x, L)) + '</span><b>' + esc(shown) + '</b></div>';
        if (x.hideEmpty) return ''; // 例如没有欠款就不显示“欠款”这一行
        if (x.signed) return '<div><span>' + esc(statName(x.k) + ' ' + t(v >= 0 ? x.signed[0] : x.signed[1])) + '</span><b>' + v + '</b><div class="zx"><i style="left:calc(' + (v + 100) / 2 + '% - 1px)"></i></div></div>';
        return '<div><span>' + esc(extraLabel(x, L)) + '</span><b>' + esc((x.tier ? tierOf(x, v) + ' · ' : '') + v) + '</b></div>';
      }).join('')
      + '<div><span>' + esc(T.devName) + '</span><b>' + E.devOf(L) + '%</b></div>'
      + '</div>', 'statcard');
    h += '</div>';

    /* 中：场景、今年的重心、生平。抉择用弹框，见 decisionModal */
    const scene = sceneOf(L, c, age);
    h += '<div class="col center">';
    h += '<div class="card scene"><canvas class="px" id="scene-cv"></canvas><div class="scene-cap">' + esc(scene.cap) + '</div></div>';
    if (ui.result && L.year > ui.result.year + 1) ui.result = null;
    h += focusBar(L, age);   // 只在手机上显示
    h += focusCard(L, c, age); // 电脑上紧贴场景；手机上排到生平后面
    h += logCard(W, L);
    h += '</div>';

    /* 右：家人、同代人、人生图、传闻 */
    h += '<div class="col right">' + familyCard(L, c) + peersCard(L)
      + card(t('人生图'), t('一格一年'), lifeMap(c.born, L.start, Y, Y, L.marks))
      + rumorCard(W) + '</div>';
    h += '</div>';
    h += footNav();
    if (showDecision) h += ui.peek ? decisionPill(ui.pending) : decisionModal(ui.pending, c);
    return h;
  }

  function decisionModal(n, c) {
    const isEnc = JY.ENCOUNTERS.includes(n);
    const isPause = JY.PAUSES.includes(n) || (c.arc.pauses || []).includes(n);
    const opts = E.choices(n);
    const tag = isPause ? '<span class="tag book">' + esc(T.pauseTag) + '</span>' : isEnc ? '<span class="tag mod">' + esc(T.encTag) + '</span>' : '<span class="tag canon">' + esc([bookOf(c.book).short, T.canonEvent].filter(Boolean).join(' · ')) + '</span>';
    return '<div class="overlay center decide-wrap" data-act="decide-bg"><div class="modal decide' + (isEnc || isPause ? ' enc' : '') + '" role="dialog" aria-modal="true" aria-labelledby="decide-t">'
      + '<div class="decide-meta">' + tag + '<span>' + esc(yearText(G.Y) + ' · ' + ageText(G.age) + ' · ' + G.name(c.id)) + '</span>'
      + '<button class="b decide-peek" id="d-peek" data-act="peek" title="' + esc(t('先看看局面，再回来选')) + '">' + t('收起') + '</button></div>'
      + '<div class="decide-b"><h3 id="decide-t">' + esc(n.t) + '</h3><p>' + esc(val(n.text)) + '</p><div class="choices">'
      + opts.map((o, k) => {
        const ch = o.ch;
        let meta = '';
        if (ch.check) meta += '<span>' + esc(statName(ch.check[0]) + ' ' + G.s(ch.check[0]) + ' · ' + t('成功率 {p}%', { p: E.odds(ch.check) })) + '</span>';
        if (!isPause) meta += ch.canon ? '<span class="tag canon">' + esc(T.canon) + '</span>' : (ch.dev === 0 ? '' : '<span class="tag mod">' + esc(T.modTag) + '</span>');
        if (ch.fatal) meta += '<span class="tag bad">' + t('命终') + '</span>';
        return '<button class="choice" id="ch-' + k + '" data-act="choose" data-i="' + o.i + '"><span class="t">' + (k + 1) + '. ' + esc(val(ch.t)) + '</span><span class="m">' + meta + '</span></button>';
      }).join('') + '</div></div></div></div>';
  }
  function decisionPill(n) {
    return '<button class="decide-pill" id="d-open" data-act="peek-off"><span>' + t('待抉择') + '</span><b>' + esc(n.t) + '</b><span>' + t('点开') + ' ›</span></button>';
  }

  /* 刚才的抉择：放在生平最上面，过一年后消失 */
  function resultCard() {
    const r = ui.result.r, n = ui.result.node;
    let h = '<div class="result" aria-live="polite"><div class="decide-meta"><span>' + esc(t('刚才的抉择') + ' · ' + n.t) + '</span>';
    if (r.check) h += '<span class="roll ' + (r.ok ? 'ok' : 'no') + '">' + esc(t(r.ok ? '{k}判定成功（成功率 {p}%）' : '{k}判定失败（成功率 {p}%）', { k: statName(r.check[0]), p: r.p })) + '</span>';
    if (!r.canon && r.dev > 0) h += '<span style="color:var(--mod)">' + esc(T.devName) + ' +' + r.dev + '</span>';
    h += '</div><p>' + esc(r.res || (r.pause ? t('你把这个答案记在了心里。') : t('事情就这样定了。'))) + '</p>';
    return h + '</div>';
  }

  /* 手机专用的简化框：两行以内显示当前属性，右边是年度重心的下拉按钮。
   * 电脑上隐藏，那里有左栏的“状态”卡和完整的“今年的重心”卡。 */
  function focusBar(L, age) {
    const st = L.st;
    const item = (cls, k, v, tip) => '<span class="fs ' + cls + '" title="' + esc(tip) + '"><small>' + esc(k) + '</small><b>' + esc(v) + '</b></span>';
    // 固定两行：第一行四项主属性和改命度，第二行附属属性和重心按钮
    let h = '<div class="card focusbar"><div class="frow">'
      + SUI.bars.map((x) => item(x.cls, statName(x.k), st[x.k], t(x.tip || ''))).join('')
      + item('mod', T.devShort, E.devOf(L) + '%', T.devTip)
      + '</div><div class="frow">'
      + SUI.extras.filter((x) => x.bar !== false).map((x) => item('', extraLabel(x, L), (x.show && x.show(L, G)) || ((x.tier ? tierOf(x, st[x.k]) + ' ' : '') + st[x.k]), x.signed ? t(st[x.k] >= 0 ? x.signed[0] : x.signed[1]) : t(x.tip || ''))).join('');
    const jump = '<button class="fjump" id="f-jump" data-act="focus-jump" aria-label="' + esc(t('查看完整的今年的重心')) + '" title="' + esc(t('查看完整的今年的重心')) + '">' + t('详情') + '↓</button>';
    if (age < 6) return h + '<span class="fpick-wrap"><span class="b fpick" aria-disabled="true" title="' + esc(t('六岁起可以选每一年的重心')) + '">' + esc(t(E.stage(age))) + '</span></span>' + jump + '</div></div>';
    const opts = E.focusOptions(age);
    h += '<div class="fpick-wrap"><button class="b fpick" id="f-open" data-act="focus-menu" aria-haspopup="menu" aria-expanded="' + !!ui.focusOpen + '" title="' + esc(t('今年的重心')) + '">'
      + esc(t(L.focus || '重心')) + ' ▾</button>';
    if (ui.focusOpen) {
      h += '<div class="fmenu" role="menu" aria-label="' + esc(t('今年的重心')) + '">' + opts.map((f) => '<button class="fopt" role="menuitemradio" id="fm-' + f.name + '" data-act="focus" data-v="' + f.name + '" aria-checked="' + (f.name === L.focus) + '"><b>' + esc(t(f.name)) + '</b><small>' + esc(t(f.d)) + '</small></button>').join('') + '</div>';
    }
    return h + '</div>' + jump + '</div></div>';
  }

  function focusCard(L, c, age) {
    const opts = E.focusOptions(age);
    const cur = JY.FOCUS.find((f) => f.name === L.focus);
    let h = '<div class="card focuscard" id="focus-card"><div class="card-h"><h3>' + t('今年的重心') + '</h3></div><p class="focus-sub">' + esc(t(E.stage(age)) + ' · ' + L.locCap) + '</p>';
    if (age < 6) {
      h += '<p class="focus-d">' + t('还小，由大人照看。性情在这几年慢慢定下来；六岁起可以选每一年的重心。这一段可以开 8× 跳过。') + '</p>';
    } else {
      h += '<p class="focus-d">' + esc(cur ? t(cur.d) : '') + '</p><div class="chips">'
        + opts.map((f) => '<button class="chip" id="f-' + f.name + '" data-act="focus" data-v="' + f.name + '" aria-pressed="' + (f.name === L.focus) + '">' + esc(t(f.name)) + '</button>').join('') + '</div>';
    }
    return h + '</div>';
  }

  function logCard(W, L) {
    const lines = L.log.slice(0, ui.shown).map((e, i) => ({ e, i })).reverse();
    const shownLines = ui.logAll ? lines : lines.slice(0, 120);
    const aliveCount = JY.CHARS.filter((x) => G.alive(x.id)).length;
    let h = '<div class="card log-card"><div class="card-h"><h3>' + t('生平') + '</h3><small>' + t('最新在上 · 点一行加 ☆') + '</small></div>'
      + '<p class="log-note">' + esc(T.random ? t('这是你的第 {n} 世', { n: W.lives.length + 1 }) : t('这是这个{w}里的第 {n} 世 · 此刻{w}上还活着的有名有姓者 {m} 人', { w: T.world, n: W.lives.length + 1, m: aliveCount })) + '</p>'
      + (ui.result ? resultCard() : '') + '<ul class="log">'
      + shownLines.map(({ e, i }, k) => '<li class="k-' + (e.k || 'auto') + (k === 0 ? ' new' : '') + '" data-act="star" data-i="' + i + '"><span class="a">' + esc(ageText(e.a)) + '</span><span class="t">' + esc(e.t) + '</span><span class="s">' + (e.star ? '☆' : '') + '</span></li>').join('')
      + '</ul>';
    if (lines.length > shownLines.length) h += '<button class="b log-more" id="l-all" data-act="logall">' + t('显示全部 {n} 行', { n: lines.length }) + '</button>';
    return h + '</div>';
  }

  function familyCard(L, c) {
    const rows = [];
    const rels = (c.family || []).filter((f) => !L.rels.find((r) => r.rel === f.rel)).concat(L.rels);
    // 原著关系网里标了 panel 的人（亲人、师徒、夫妻），到了相识那一年自动出现
    G.panelRels().forEach((x) => { if (!rels.find((r) => r.id === x.id)) rels.push(x); });
    rels.forEach((f) => {
      let v = '', n = f.note || '', dead = false, nm = f.name || '';
      if (f.id) {
        nm = G.name(f.id);
        const st = E.status(f.id);
        dead = !!st.dead;
        v = st.dead ? t('已故') : st.unborn ? '' : ageText(st.age);
        n = st.t + (f.note ? ' · ' + f.note : '');
        const tag = T.relTag && !dead ? T.relTag(G, f.id) : '';
        if (tag) n = t(tag) + ' · ' + n;
      }
      rows.push('<div class="row fam"><span class="k">' + esc(t(f.rel)) + '</span><span class="nm">' + esc(nm) + '</span><span class="v">' + esc(v) + '</span><span class="n' + (dead ? ' dead' : '') + '">' + esc(n) + '</span></div>');
    });
    return card(esc(T.familyTitle), '', '<div class="rows">' + (rows.join('') || '<p class="empty">' + t('无亲无故。') + '</p>') + '</div>');
  }

  function peersCard(L) {
    const rows = L.peers.map((id) => {
      const p = JY.byId[id], st = E.status(id);
      return '<div class="row"><span class="nm">' + esc(p.name) + '</span><span class="v">' + esc(st.dead ? t('已故') : st.unborn ? t('未生') : t(E.stage(st.age))) + '</span>'
        + '<span class="n' + (st.dead ? ' dead' : '') + '">' + [bookOf(p.book).short, t(p.sex), st.t].filter(Boolean).map(esc).join(' · ') + '</span></div>';
    });
    return card(esc(T.peersTitle), T.peersSub, '<div class="rows">' + (rows.join('') || '<p class="empty">' + t('没有。') + '</p>') + '</div>');
  }

  function rumorCard(W) {
    const last = W.chron.slice(-5).reverse();
    return '<div class="card"><div class="card-h"><h3>' + esc(T.rumor) + '</h3><button class="b" id="r-more" data-act="drawer">' + t('全部') + '</button></div><div class="rows">'
      + (last.map((e) => '<div class="row"><span class="n" style="grid-column:1/-1;color:' + (e.mod ? 'var(--mod)' : 'var(--soft)') + ';font-size:14px">' + esc(yearText(e.y) + ' · ' + e.t) + '</span></div>').join('') || '<p class="empty">' + esc(t('{w}还很安静。', { w: T.world })) + '</p>')
      + '</div></div>';
  }

  /* ---------- 临终、墓志 ---------- */
  function wordsView() {
    const { L } = E.get();
    const c = JY.byId[L.cid];
    return '<div class="words-pick"><div style="color:var(--muted)">' + esc(yearText(L.year) + ' · ' + ageText(L.year - c.born)) + '</div><h2>' + esc(c.name + t('，') + L.death + t('。')) + '</h2>'
      + '<p style="color:var(--soft)">' + t('临终前，你想留下一句话：') + '</p>'
      + ui.words.map((w, i) => '<button class="choice" id="wd-' + i + '" data-act="word" data-i="' + i + '"><span class="t">' + (i + 1) + '. “' + esc(w) + '”</span></button>').join('')
      + '</div>';
  }

  function endView() {
    const l = ui.life;
    const age = l.to - l.born;
    let h = '<div class="end"><div class="stele"><canvas class="px" data-portrait="' + l.id + '" data-age="' + age + '" style="width:80px;height:96px"></canvas>'
      + '<div class="vname">' + esc(l.name) + '</div><div class="yrs">' + esc(T.year + ' ' + l.born + ' — ' + l.to) + '</div>'
      + '<div class="cause">' + esc(t('享年 {n}', { n: age }) + ' · ' + l.cause) + '</div><div class="words">“' + esc(l.words) + '”</div></div>';
    h += '<div class="end-main">';
    h += '<div class="card"><div class="big-num"><div><span>' + t('享年') + '</span><b>' + age + '</b></div><div><span>' + esc(T.devName) + '</span><b>' + l.dev + '%</b></div><div><span>' + t('做过的抉择') + '</span><b>' + l.picks.length + '</b></div></div></div>';
    h += '<div class="card"><h3>' + esc(T.compareTitle) + '</h3><div class="compare" style="margin-top:12px"><div><b>' + esc(T.fateLabel) + '</b>' + esc(l.fateText) + '</div><div><b>' + esc(T.yourEnd) + '</b>' + esc(l.name + t('，') + l.cause + t('。')) + '</div></div></div>';
    h += '<div class="card"><h3>' + esc(T.changed) + '</h3><div style="margin-top:10px">' + (l.changes.length
      ? '<ul class="ulist">' + l.changes.map((k) => '<li class="mod">' + esc(JY.FLAGS[k] || k) + '</li>').join('') + '</ul><p style="color:var(--muted);font-size:13.5px;margin-top:10px">' + esc(t('这些改变会留在这个{w}里。下一世重生到后面的年代，还会碰到它们的后果。', { w: T.world })) + '</p>'
      : '<p style="color:var(--soft)">' + esc(T.noChange) + '</p>') + '</div></div>';
    h += '<div class="card"><h3>' + t('你做过的选择') + '</h3><ul class="ulist" style="margin-top:10px">' + (l.picks.map((p) => '<li class="' + (!p.canon && p.ok && p.dev > 0 ? 'mod' : '') + '">' + esc(ageText(p.age) + ' · ' + p.t + t('：') + p.c + (p.check ? (p.ok ? t('（成功）') : t('（失败）')) : '')) + '</li>').join('') || '<li>' + t('一次也没有。') + '</li>') + '</ul></div>';
    if (l.answers.length) h += '<div class="card"><h3>' + esc(T.pauseTag) + '</h3><ul class="ulist" style="margin-top:10px">' + l.answers.map((a) => '<li>' + esc(ageText(a.age) + ' · ' + a.q + ' ' + a.a) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>' + esc(T.peersTitle) + '</h3><div class="rows" style="margin-top:10px">' + l.peers.map((p) => '<div class="row"><span class="nm">' + esc(p.name) + '</span><span class="v"></span><span class="n' + (p.st.dead ? ' dead' : '') + '">' + esc(p.st.t) + '</span></div>').join('') + '</div></div>';
    h += card(t('人生图'), t('一格一年'), lifeMap(l.born, l.from, l.to, -9999, l.marks));
    h += '<div class="end-btns"><button class="b primary big" id="e-share" data-act="share">' + t('分享这一生') + '</button>'
      + '<button class="b big" id="e-review" data-act="review">' + t('再看一遍') + '</button>'
      + '<button class="b big" id="e-home" data-act="home">' + t('再入轮回') + '</button><button class="b big" id="e-chron" data-act="drawer">' + esc(T.chronicle) + '</button></div>';
    h += '</div></div>';
    return h + footNav();
  }
  /* ---------- 终局回顾 ---------- */
  function reviewView() {
    const ms = ui.life.moments;
    const m = ms[ui.review.i];
    const kindTag = { canon: '<span class="tag canon">' + esc(T.legend[0]) + '</span>', mod: '<span class="tag mod">' + esc(T.legend[1]) + '</span>', fail: '<span class="tag bad">' + esc(T.legend[2]) + '</span>', death: '<span class="tag bad">' + esc(T.legend[3]) + '</span>', star: '<span class="tag book">' + t('你记下的') + '</span>' }[m.k] || '';
    return '<div class="review" data-act="review-next" role="dialog" aria-label="' + esc(t('终局回顾')) + '">'
      + '<div class="review-top"><span>' + esc(ui.life.name + ' · ' + t('回顾这一生')) + '</span><button class="b" id="rv-close" data-act="review-close">' + t('跳过') + '</button></div>'
      + '<div class="review-in"><canvas class="px" id="review-cv"></canvas>'
      + '<div class="review-age"><span>' + esc(ageText(m.age) + ' · ' + yearText(m.y)) + '</span>' + kindTag + '</div>'
      + '<h2 class="review-t">' + esc(m.t) + '</h2><p class="review-text">' + esc(m.text) + '</p>'
      + '<div class="review-dash">' + ms.map((x, i) => '<i class="' + (i < ui.review.i ? 'done' : i === ui.review.i ? 'cur' : '') + '"></i>').join('') + '</div></div>'
      + '<div class="review-hint">' + esc(t('点屏幕继续 · {i} / {n}', { i: ui.review.i + 1, n: ms.length })) + '</div></div>';
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
    const zh = (JY.LANG || 'zh') === 'zh';
    return '<div class="overlay center" data-act="share-bg"><div class="modal" role="dialog" aria-label="' + esc(t('分享这一生')) + '">'
      + '<div class="modal-h"><span>' + t('分享这一生') + '</span><button class="b" id="sh-close" data-act="share-close">' + t('关闭') + '</button></div>'
      + '<div class="modal-b">'
      + '<label for="share-line" class="lbl">' + t('写一句活过这一生的话（可选）') + '</label>'
      + '<textarea id="share-line" maxlength="60" placeholder="' + esc(T.sharePlaceholder || t('例如：这一世，我没有走上青石桥。')) + '">' + esc(line) + '</textarea>'
      + '<p class="hint">' + t('写了会放在文字总结的开头，也会印在图片上。') + '</p>'
      + '<button class="share-main" id="sh-native" data-act="share-native">' + t('分享') + '<small>' + t('图片和文字一起发给微信、QQ 等应用') + '</small></button>'
      + '<div class="share-grid">'
      + '<button class="b" id="sh-copy" data-act="share-copy">' + t('复制文字总结和链接') + '</button>'
      + '<a class="b" id="sh-save" href="' + ui.share.png + '" download="' + esc(T.title + '-' + l.name) + '.png">' + t('保存图片') + '</a>'
      + (zh ? '<a class="b" id="sh-weibo" href="' + esc(links.weibo) + '" target="_blank" rel="noopener">' + t('发到微博') + '</a>'
        + '<a class="b" id="sh-qzone" href="' + esc(links.qzone) + '" target="_blank" rel="noopener">' + t('发到 QQ 空间') + '</a>' : '')
      + '</div><p class="hint" id="share-msg" aria-live="polite"></p>'
      + '<div class="lbl">' + t('文字总结') + '</div><textarea id="share-text" class="share-text" readonly rows="7">' + esc(text) + '</textarea>'
      + '<div class="lbl">' + t('分享图') + '</div><img class="card-img" id="share-img" src="' + ui.share.png + '" alt="' + esc(t('{name}的生平卡片', { name: l.name })) + '">'
      + '<p class="hint">' + t('在微信里打开时，长按图片可以保存或发给朋友。') + (JY.siteUrl() ? '' : t('上线后在 config.js 里填写网址，文字总结会自动附上链接。')) + '</p>'
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
    const ta = document.getElementById('share-text');
    if (ta) ta.value = JY.shareText(l, line);
    const w = document.getElementById('sh-weibo');
    if (w) w.href = links.weibo;
    const q = document.getElementById('sh-qzone');
    if (q) q.href = links.qzone;
  }
  function shareMsg(m) { const el = document.getElementById('share-msg'); if (el) el.textContent = m; }
  function copyShareText() {
    const ta = document.getElementById('share-text');
    const done = () => shareMsg(t('文字总结和链接已复制，可以直接粘贴到微信、微博或朋友圈。'));
    const fallback = () => { ta.focus(); ta.select(); shareMsg(t('已选中文字，请按 Ctrl+C 或长按复制。')); };
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
      if (!navigator.share) shareMsg(t('这个浏览器不能直接分享。文字总结已复制；图片可以长按或点“保存图片”。'));
    });
  }

  /* ---------- 大事记 ---------- */
  function drawerView() {
    const { W } = E.get();
    const list = W.chron.filter((e) => !ui.drawerMod || e.mod).slice().reverse();
    return '<div class="overlay" data-act="drawer-bg"><div class="drawer" role="dialog" aria-label="' + esc(T.chronicle) + '">'
      + '<div class="drawer-h"><h3>' + esc(T.chronicle) + '</h3><div style="display:flex;gap:6px">'
      + '<button class="b" id="d-mod" data-act="drawer-mod" aria-pressed="' + ui.drawerMod + '">' + t('只看被改变的') + '</button>'
      + '<button class="b" id="d-close" data-act="drawer-close">' + t('关闭') + '</button></div></div>'
      + '<div class="drawer-b">' + (list.length ? '<ul class="chron">' + list.map((e) => '<li class="' + (e.mod ? 'mod' : '') + '"><span class="y">' + esc(yearText(e.y)) + '</span><span class="t">' + esc(e.t) + '</span></li>').join('') + '</ul>'
        : '<p class="empty">' + esc(ui.drawerMod ? t('还没有被改变的事。') : t('这个{w}还没有发生过什么。', { w: T.world })) + '</p>')
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
    if (ui.feedback) h += feedbackView();
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
      const s = sceneOf(L, c, age);
      JY.drawScene(sc, { loc: s.loc, year: L.year, me: L.cid, age, party: s.party, partyAges: s.party.map((id) => G.ageOf(id)), pets: s.pets });
    }
    if (active) { const el = document.getElementById(active); if (el) el.focus({ preventScroll: true }); }
  }

  /* ---------- 交互 ---------- */
  function act(a, d) {
    const { L } = E.get();
    switch (a) {
      case 'theme': {
        const i = THEMES.findIndex((x) => x[0] === themeNow());
        const next = THEMES[(i + 1) % THEMES.length][0];
        document.documentElement.dataset.theme = next;
        store.set(PRE + 'theme', next);
        render();
        break;
      }
      case 'random': { const av = E.available(); if (av.length) start(av[Math.floor(Math.random() * av.length)].id); break; }
      case 'start': start(d.id); break;
      case 'from-birth': ui.fromBirth = !ui.fromBirth; store.set(PRE + 'fromBirth', ui.fromBirth ? '1' : '0'); render(); break;
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
      // 反馈：打开时暂停，关掉后恢复原来的状态
      case 'feedback': ui.feedback = { kind: 'story', text: '', ctx: true, msg: '', wasPaused: ui.paused }; ui.paused = true; render(); break;
      case 'fb-close': ui.paused = ui.feedback ? ui.feedback.wasPaused : ui.paused; ui.feedback = null; render(); break;
      case 'fb-kind': case 'fb-gh': case 'fb-copy': case 'fb-send': feedbackAct(a, d); break;
      default: break;
    }
  }
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (ui.focusOpen && !e.target.closest('.fpick-wrap')) { ui.focusOpen = false; if (!el) { render(); return; } }
    if (!el) return;
    if (el.dataset.act === 'drawer-bg' && e.target !== el) return; // 点抽屉里面不关
    if (el.dataset.act === 'drawer-bg') { ui.drawer = false; render(); return; }
    if (el.dataset.act === 'decide-bg') return; // 点抉择框外面不关，免得误触
    if (el.dataset.act === 'share-bg') { if (e.target === el) { ui.share = null; render(); } return; }
    if (el.dataset.act === 'fb-bg') { if (e.target === el) act('fb-close'); return; }
    act(el.dataset.act, el.dataset);
  });
  app.addEventListener('input', (e) => {
    if (e.target.id === 'share-line' && ui.share) {
      ui.share.line = e.target.value.trim();
      clearTimeout(ui.share.t);
      ui.share.t = setTimeout(refreshShare, 250);
    }
    if (e.target.id === 'fb-text' && ui.feedback) ui.feedback.text = e.target.value;
  });
  app.addEventListener('change', (e) => {
    if (e.target.classList.contains('lang-sel')) { E.save(); if (JY.setLang) JY.setLang(e.target.value); }
    if (e.target.id === 'fb-ctx' && ui.feedback) ui.feedback.ctx = e.target.checked;
  });
  document.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'Escape' && ui.feedback) { act('fb-close'); return; }
    if (ui.review) {
      if (e.key === 'Escape') { closeReview(); return; }
      if (e.key === 'ArrowLeft') { reviewPrev(); return; }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); reviewNext(); return; }
    }
    if (e.key === 'Escape' && ui.share) { ui.share = null; render(); return; }
    if (e.key === 'Escape' && ui.drawer) { ui.drawer = false; render(); return; }
    if (ui.screen !== 'life' || ui.feedback) return;
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
  topBtn.setAttribute('aria-label', t('回到顶部'));
  topBtn.innerHTML = '<span aria-hidden="true">↑</span><small>' + t('顶部') + '</small>';
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(topBtn);
  const syncTop = () => topBtn.classList.toggle('show', window.scrollY > 480);
  window.addEventListener('scroll', syncTop, { passive: true });

  /* ---------- 启动 ---------- */
  E.load();
  if (E.get().L) { ui.screen = 'home'; }
  render();
})();

/* 群侠 · 界面
 * 只管“怎么显示”：读 QX.state()，调用引擎的函数。界面用词写 t('中文')（其他语言查词表或机器翻译）。
 * 画面：顶栏（吸顶）、场景、此刻的事（事件 / 说话 / 战斗 / 行动）、右栏（状态、同伴、信物、传闻）、底栏。
 * 弹框：人物、武功、物品、队伍、地图、存档、店铺、练功、反馈。 */
(function () {
  'use strict';
  const JY = window.JY, QX = window.QX, CFG = window.JY_CONFIG || {};
  const t = (s, v) => (JY.t ? JY.t(s, v) : s);
  const VERSION = '2.3.0';
  JY.GAME = JY.GAME || { id: 'jianghuyimeng.qunxia', title: '群侠', version: VERSION };
  const app = document.getElementById('app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const THEME_KEY = 'jianghuyimeng.theme'; // 和江湖一梦共用
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* 忽略 */ } } };
  const th = store.get(THEME_KEY); if (th) document.documentElement.dataset.theme = th;
  if (CFG.fontCss) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CFG.fontCss; document.head.appendChild(l); }

  // 像素画：地点和人物给 share/pixel.js 用
  JY.LOCS = QX.LOCS;
  JY.byId = Object.assign({}, QX.PEOPLE);

  const ui = { modal: null, toast: '', form: { name: '', sex: '男', origin: QX.ORIGINS[0].id, sect: '' }, autoT: null, fb: null, confirmNew: false, practiseHard: false };

  /* ---------- 小工具 ---------- */
  const MON = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const DAYN = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  function dateText(day) { const d = QX.date(day); return t('纪年') + ' ' + d.y + ' · ' + t(MON[d.m - 1]) + t(DAYN[d.d - 1]); }
  // 像素图标（icons.js）：kind 是类型或属性名，id 是物品或武功 id
  const ic = (kind, id) => (QX.iconHtml ? QX.iconHtml(kind, id, 'sm') : '');
  function bar(cls, v, max, label) {
    const p = Math.max(0, Math.min(100, Math.round((v / Math.max(1, max)) * 100)));
    return '<span class="qx-bar ' + cls + '" title="' + esc(label + ' ' + v + '/' + max) + '"><small>' + esc(label) + '</small><span class="qx-track"><i style="width:' + p + '%"></i></span><b>' + Math.max(0, Math.round(v)) + '</b></span>';
  }
  function meLook() { const S = QX.state(); return S.sex === '女' ? { hair: 'bun', robe: '#8a6a7a', accent: '#d8c070' } : { hair: 'topknot', robe: '#6a6f7a', accent: '#c9a45c' }; }
  function setMe() { const S = QX.state(); if (S) JY.byId.me = { id: 'me', name: S.name, sex: S.sex, look: meLook() }; }
  const ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
  };
  const THEMES = [['dark', '暗'], ['gray', '灰'], ['light', '白']];
  const themeNow = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function themeBtn() { const cur = THEMES.find((x) => x[0] === themeNow()) || THEMES[0]; return '<button class="b icon-b" data-act="theme" title="' + esc(t('切换主题')) + '">' + ICON.theme + '<span>' + esc(t(cur[1])) + '</span></button>'; }
  function langSelect(id) {
    return '<label class="lang-wrap notranslate" title="' + esc(t('语言')) + '">' + ICON.globe + '<select class="lang-sel" id="' + id + '" aria-label="' + esc(t('语言')) + '">'
      + (JY.LANGS || [['zh', '中文']]).map((l) => '<option value="' + l[0] + '"' + (l[0] === (JY.LANG || 'zh') ? ' selected' : '') + '>' + l[1] + '</option>').join('') + '</select></label>';
  }
  function foot() {
    const bits = [];
    if (CFG.homeUrl) bits.push('<a href="' + esc(CFG.homeUrl) + '">' + esc(CFG.homeName || 'Vibe Game') + '</a>');
    if (CFG.hubUrl) bits.push('<a href="' + esc(CFG.hubUrl) + '">' + esc(t(CFG.hubName || '浮生录')) + '</a>');
    if (CFG.gameUrl) bits.push('<a href="' + esc(CFG.gameUrl) + '">' + esc(t(CFG.gameName || '江湖一梦')) + '</a>');
    bits.push('<span class="cur">' + esc(t('群侠')) + '</span>');
    return '<footer class="site-foot"><div class="crumbs">' + bits.join('<span class="sep" aria-hidden="true">›</span>') + '<span class="ver">v' + VERSION + '</span></div><div class="nav-tools">'
      + langSelect('lang-foot') + '<button class="b icon-b" data-act="feedback">' + ICON.chat + '<span>' + t('问题反馈') + '</span></button></div>'
      + (JY.MT ? '<p class="mt-note">' + t('剧情由谷歌网页翻译自动翻译，可能不够准确。') + '</p>' : '') + '</footer>';
  }
  function modal(title, body, cls) {
    return '<div class="overlay center" data-act="bg"><div class="modal qx-modal ' + (cls || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal-h"><span>' + esc(title) + '</span><button class="b" data-act="close">' + t('关闭') + '</button></div><div class="modal-b">' + body + '</div></div></div>';
  }

  /* ---------- 开始 ---------- */
  function startView() {
    const sl = QX.slots(), f = ui.form;
    const chips = (key, list) => '<div class="chips">' + list.map((x) => '<button class="chip" data-act="form" data-k="' + key + '" data-v="' + esc(x[0]) + '" aria-pressed="' + (f[key] === x[0]) + '">' + esc(t(x[1])) + '</button>').join('') + '</div>';
    const org = QX.ORIGINS.find((o) => o.id === f.origin), sc = QX.SECTS[f.sect];
    let h = '<main class="home qx-home"><div class="home-hero"><div><h1>' + t('群') + '<i>' + t('侠') + '</i></h1>'
      + '<p>' + t('倚天年间，江湖纪年 131 年。你是一个无名小卒。走遍天下，拜师学艺，结交群侠，回合比武，收齐十四件信物。你做过的事，决定你是侠还是魔。') + '</p></div></div>';
    if (sl.auto && !sl.auto.over) h += '<div class="card"><div class="card-h"><h3>' + t('继续') + '</h3><small>' + t('自动存档') + '</small></div><p class="qx-muted">' + esc(sl.auto.name) + ' · ' + esc(dateText(sl.auto.day)) + ' · ' + esc(QX.LOCS[sl.auto.loc].short) + ' · ' + t('信物') + ' ' + sl.auto.relics + '/14</p><div class="end-btns" style="margin-top:12px"><button class="b primary big" data-act="load" data-v="auto">' + t('继续这一局') + '</button>'
      + (sl.manual ? '<button class="b big" data-act="load" data-v="manual">' + t('读取手动存档') + '</button>' : '') + '</div></div>';
    else if (sl.manual) h += '<div class="card"><button class="b big" data-act="load" data-v="manual">' + t('读取手动存档') + '：' + esc(sl.manual.name) + ' · ' + esc(dateText(sl.manual.day)) + '</button></div>';
    h += '<div class="card qx-form"><div class="card-h"><h3>' + t('新的江湖') + '</h3></div>'
      + '<label class="lbl" for="f-name">' + t('姓名') + '</label><input id="f-name" class="qx-input" maxlength="8" placeholder="' + esc(t('最多八个字')) + '" value="' + esc(f.name) + '">'
      + '<div class="lbl">' + t('性别') + '</div>' + chips('sex', [['男', '男'], ['女', '女']])
      + '<div class="lbl">' + t('出身') + '</div>' + chips('origin', QX.ORIGINS.map((o) => [o.id, o.name])) + '<p class="qx-muted">' + esc(org.d) + ' ' + esc(t('从{a}出发。', { a: QX.LOCS[org.loc].short })) + '</p>'
      + '<div class="lbl">' + t('门派') + '</div>' + chips('sect', [['', '无门无派']].concat(Object.keys(QX.SECTS).map((k) => [k, QX.SECTS[k].name]))) + '<p class="qx-muted">' + esc(sc ? sc.d + ' ' + t('从{a}出发。', { a: QX.LOCS[sc.home].short }) : t('一个人闯荡，谁也不管你，谁也不教你。')) + '</p>'
      + '<div class="end-btns" style="margin-top:14px"><button class="b primary big" data-act="new">' + t('踏入江湖') + '</button></div>'
      + (sl.auto && !sl.auto.over ? '<p class="hint">' + t('开新局会覆盖自动存档（手动存档不受影响）。') + '</p>' : '') + '</div>'
      + '<div class="how"><div><b>' + t('走') + '</b>' + t('十二处地方，路远的要走几十天。轻功越好走得越快。东海的岛要从临安坐船。') + '</div><div><b>' + t('练') + '</b>' + t('拜师、读秘籍、奇遇都能学武功。每门十级，冒进练得快，也容易走火入魔。') + '</div><div><b>' + t('打') + '</b>' + t('回合制，最多带两个同伴。选招式、运功、吃药，打不过可以跑。') + '</div><div><b>' + t('收') + '</b>' + t('十四件信物散在天下。有的要行侠才拿得到，有的只有不择手段才行。') + '</div></div>'
      + '</main>';
    return h + foot();
  }

  /* ---------- 顶栏 ---------- */
  function topView() {
    const S = QX.state();
    const btn = (k, label) => '<button class="b" data-act="open" data-v="' + k + '">' + t(label) + '</button>';
    return '<header class="top qx-top"><div class="top-in wide">'
      + '<button class="logo" data-act="home" title="' + esc(t('回到开始')) + '">' + t('群') + '<i>' + t('侠') + '</i></button>'
      + '<div class="qx-when"><span class="qx-date">' + esc(dateText(S.day)) + '</span><span class="qx-age">' + t('{n} 岁', { n: QX.age() }) + '</span></div>'
      + '<div class="qx-bars">' + bar('hp', S.hp, QX.maxHp(), t('气血')) + bar('mp', S.mp, QX.maxMp(), t('内力')) + '</div>'
      + '<div class="ctl">' + btn('char', '人物') + btn('arts', '武功') + btn('items', '物品') + (QX.CFG.companions ? btn('party', '队伍') : '') + btn('map', '地图') + btn('save', '存档') + themeBtn() + langSelect('lang-top')
      + '<button class="b icon-b" data-act="feedback">' + ICON.chat + '<span>' + t('反馈') + '</span></button></div></div></header>';
  }

  /* ---------- 中间：场景与此刻的事 ---------- */
  function sceneCard() {
    const S = QX.state(), L = QX.LOCS[S.loc];
    return '<div class="card scene"><canvas class="px" id="scene" width="240" height="76" aria-label="' + esc(L.name) + '"></canvas>'
      + '<div class="scene-cap"><b class="qx-locname">' + esc(L.name) + '</b> <span class="tag book">' + esc(QX.REGIONS[L.region].name) + '</span><p>' + esc(L.desc) + '</p></div></div>';
  }
  function eventCard() {
    const S = QX.state(), E = S.ev;
    let h = '<div class="card qx-ev" id="qx-ev">';
    if (E.who && QX.PEOPLE[E.who]) h += '<div class="qx-who"><canvas class="px" data-portrait="' + esc(E.who) + '" width="20" height="24"></canvas><div><h3>' + esc(E.title || QX.PEOPLE[E.who].name) + '</h3><small>' + esc(typeof QX.PEOPLE[E.who].title === 'function' ? QX.PEOPLE[E.who].title(QX.G()) : QX.PEOPLE[E.who].title || '') + '</small></div></div>';
    else if (E.title) h += '<h3 class="qx-evt">' + esc(E.title) + '</h3>';
    // 和人说话：先写他此刻待你怎样（四档加一句，不显示数字）
    if (E.talk && E.mood) h += '<p class="qx-mood"><span class="qx-cred t-' + esc(E.tier) + '">' + esc(t(E.tier)) + '</span> ' + esc(E.mood) + '</p>';
    if (E.text && !(E.res && !E.choices.length && E.talk)) h += '<p class="qx-text">' + esc(E.text) + '</p>';
    if (E.res !== null && E.res !== undefined && !E.choices.length) {
      if (E.picked) h += '<p class="qx-picked">' + esc(t('你选择：')) + esc(E.picked) + '</p>';
      if (E.roll) h += '<p class="roll ' + (E.roll.great ? 'great' : E.roll.ok ? 'ok' : 'no') + '">' + esc(t(E.roll.great ? '{k}判定大成功（成功率 {p}%）' : E.roll.ok ? '{k}判定成功（成功率 {p}%）' : '{k}判定失败（成功率 {p}%）', { k: t(E.roll.k) + (E.roll.lv ? ' · ' + t(E.roll.lv) : ''), p: E.roll.p })) + '</p>';
      if (E.res) h += '<div class="result"><p>' + esc(E.res) + '</p></div>';
      h += '<div class="choices"><button class="b primary big" data-act="cont" id="cont">' + t('继续') + '</button></div>';
    } else {
      h += '<div class="choices">' + E.choices.map((c, i) => '<button class="choice" data-act="choose" data-i="' + i + '"' + (c.dis ? ' disabled aria-disabled="true"' : '') + '><span class="t"><kbd>' + (i + 1) + '</kbd> ' + esc(c.t) + '</span><span class="m">'
        + (c.p != null ? '<span>' + esc(t(c.ck)) + (c.lv ? ' · ' + esc(t(c.lv)) : '') + ' ' + c.p + '%</span>' : '') + (c.cost ? '<span class="tag">' + esc(c.cost) + '</span>' : '') + (c.fight ? '<span class="tag ' + (c.deadly ? 'bad' : 'mod') + '">' + t(c.deadly ? '死斗' : '动手') + '</span>' : '') + (c.sub ? '<span>' + esc(t(c.sub)) + '</span>' : '')
        + (c.need && !c.dis ? '<span class="tag">' + esc(c.need) + '</span>' : '') + (c.dis ? '<span class="qx-dis">' + esc(c.dis) + '</span>' : '') + '</span></button>').join('') + '</div>';
      if (E.choices.some((c) => c.deadly)) h += '<p class="hint qx-warn">' + t('标着“死斗”的，输了就是死。动手前先存档。') + '</p>';
    }
    return h + '</div>';
  }
  function fightCard() {
    const F = QX.state().fight;
    const unit = (u, i, foe) => '<button class="qx-unit' + (foe ? ' foe' : '') + (u.hp <= 0 ? ' down' : '') + (foe && F.target === i ? ' tgt' : '') + '"' + (foe ? ' data-act="target" data-i="' + i + '"' : ' disabled') + '><b>' + esc(u.name) + '</b>'
      + '<span class="qx-track hp"><i style="width:' + Math.max(0, Math.round((u.hp / u.max) * 100)) + '%"></i></span><small>' + Math.max(0, u.hp) + '/' + u.max + (u.id === 'me' ? ' · ' + t('内力') + ' ' + u.mp + '/' + u.maxMp : '') + '</small></button>';
    let h = '<div class="card qx-fight" id="qx-ev"><div class="card-h"><h3>' + t('交手') + '</h3><small>' + t('第 {n} 回合', { n: F.round }) + '</small>'
      + (F.result ? '' : '<button class="b" data-act="auto" aria-pressed="' + !!F.auto + '">' + t(F.auto ? '停止自动' : '自动战斗') + '</button>') + '</div>'
      + '<div class="qx-side"><div class="qx-units">' + F.foes.map((u, i) => unit(u, i, true)).join('') + '</div><div class="qx-vs">' + t('对') + '</div><div class="qx-units">' + F.allies.map((u, i) => unit(u, i, false)).join('') + '</div></div>'
      + '<ol class="qx-flog">' + F.lines.slice(-7).map((l) => '<li>' + esc(l) + '</li>').join('') + '</ol>';
    if (F.result) h += '<div class="choices"><button class="b primary big" data-act="fightdone" id="cont">' + t('继续') + '</button></div>';
    else {
      h += '<div class="qx-opts">' + QX.fightOptions().map((o, i) => '<button class="choice qx-opt" data-act="fight" data-i="' + i + '"' + (o.dis || F.auto ? ' disabled' : '') + '><span class="t">' + esc(t(o.label)) + '</span><span class="m">' + esc(o.dis || t(o.sub)) + (o.cost ? ' · ' + t('内力') + ' ' + o.cost : '') + '</span></button>').join('') + '</div>'
        + '<p class="hint" style="margin-top:8px">' + t('点对手的名字可以换目标。') + '</p>';
    }
    return h + '</div>';
  }
  const ACT_LABEL = { explore: ['探索', '三天'], shop: ['店铺', '买药、买书'], inn: ['住店', ''], ask: ['打听', ''], clinic: ['医馆', ''], work: ['做工', '五天，挣点银子'], chore: ['门派差事', '十天，升门中地位'], practise: ['练功', '十天'], rest: ['打坐', '三天，回气血'], wait: ['等候', '一个月'], travel: ['出行', '看地图'], retire: ['了结江湖', '结束这一局'] };
  function actionsCard() {
    const acts = QX.actions();
    const people = acts.filter((a) => a.k === 'talk'), evs = acts.filter((a) => a.k === 'ev'), rest = acts.filter((a) => a.k !== 'talk' && a.k !== 'ev');
    let h = '<div class="card qx-acts" id="qx-ev">';
    if (ui.toast) h += '<div class="result qx-toast"><p>' + esc(ui.toast) + '</p></div>';
    if (people.length) h += '<div class="lbl">' + t('这里的人') + '</div><div class="qx-grid">' + people.map((a) => '<button class="qx-act person" data-act="do" data-k="talk" data-id="' + esc(a.id) + '"><canvas class="px" data-portrait="' + esc(a.id) + '" width="20" height="24"></canvas><span><b>' + esc(a.label) + '</b><small>' + esc(a.sub) + '</small></span></button>').join('') + '</div>';
    if (evs.length) h += '<div class="lbl">' + t('可以去做的事') + '</div><div class="qx-grid">' + evs.map((a) => '<button class="qx-act ev" data-act="do" data-k="ev" data-id="' + esc(a.id) + '"><span><b>' + esc(a.label) + '</b></span></button>').join('') + '</div>';
    h += '<div class="lbl">' + t('行动') + '</div><div class="qx-grid">' + rest.map((a) => { const L = ACT_LABEL[a.k] || [a.k, '']; const sub = a.k === 'inn' ? t('{n} 两，一夜', { n: a.cost }) : a.k === 'ask' ? t('{n} 两，问大事、问人', { n: a.cost }) : a.k === 'clinic' ? t('{n} 两，治一层内伤', { n: a.cost }) : t(L[1]); return '<button class="qx-act' + (a.k === 'retire' ? ' end' : '') + '" data-act="do" data-k="' + a.k + '"><span><b>' + t(L[0]) + '</b><small>' + esc(sub) + '</small></span></button>'; }).join('') + '</div>';
    return h + '</div>';
  }

  /* ---------- 右栏 ---------- */
  /* 属性分三类：资质（拿来判定、管成长）画进度条、写档位；战斗的气血内力在顶栏，攻击防御在人物页；路线（品德、声望、银两）写成一行字 */
  const APT = ['资质', '根骨', '轻功'];
  const TIER_WORD = { '': '尚浅', 易: '平平', 中: '中等', 难: '上佳', 极难: '出类拔萃' };
  const deWord = (v) => (v >= 70 ? '侠义' : v >= 50 ? '正直' : v >= 30 ? '亦正亦邪' : '心狠手辣');
  const fameWord = (v) => (v >= 120 ? '天下闻名' : v >= 60 ? '威震江湖' : v >= 30 ? '名动一方' : v >= 10 ? '小有名气' : '无名小卒');
  function aptRow(k) {
    const T = QX.CHECKS[k], v = QX.eff(k), top = T ? T.极难 * 1.25 : 100;
    return '<div class="qx-apt"><span class="qx-irow">' + ic(k) + t(k) + '</span><span class="qx-track"><i style="width:' + Math.min(100, Math.round((v / top) * 100)) + '%"></i></span><b>' + v + '</b><small>' + esc(t(TIER_WORD[QX.tierOf(k)])) + '</small></div>';
  }
  function bodyNote(S) {
    const bits = [];
    if (S.inj) bits.push(t('内伤 {n} 层', { n: S.inj }) + (S.inj > QX.INJ.self ? '' : ' · ' + t('自己养不好了')));
    if (S.mer) bits.push(t('经脉受损'));
    return bits.length ? '<p class="qx-body qx-badv">' + esc(bits.join('；')) + '</p>' : '';
  }
  // 托付和差事：别人托你的事、门派派的差事（带地点和期限）
  function tasksHtml(S) {
    const ids = Object.keys(S.tasks || {});
    if (!ids.length) return '';
    return '<div class="lbl qx-tasks-h">' + t('身上的事') + '</div><ul class="qx-tasks">' + ids.map((id) => {
      const T = S.tasks[id], left = T.until != null ? T.until - S.day : null;
      return '<li><span>' + esc(T.t) + '</span>' + (T.loc && QX.LOCS[T.loc] ? ' <button class="b qx-look" data-act="look" data-id="' + esc(T.loc) + '">' + (T.loc === S.loc ? t('就在这里') : esc(QX.LOCS[T.loc].short)) + '</button>' : '')
        + (left != null ? ' <small class="' + (left < 20 ? 'qx-badv' : 'qx-muted') + '">' + t('还剩 {n} 天', { n: Math.max(0, left) }) + '</small>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function statusCard() {
    const S = QX.state();
    const sect = S.sect ? QX.SECTS[S.sect].name + ' · ' + QX.rankName() : t('无门无派');
    return '<div class="card"><div class="card-h"><h3>' + esc(S.name) + '</h3><small>' + esc(t(S.sex)) + ' · ' + esc(QX.ORIGINS.find((o) => o.id === S.origin).name) + '</small></div>'
      + '<p class="qx-way">' + ic('门派') + esc(sect) + '</p>'
      + '<div class="qx-apts">' + APT.map(aptRow).join('') + '</div>' + bodyNote(S)
      + '<p class="qx-way">' + esc(t(deWord(S.st.品德))) + ' · ' + esc(t(fameWord(S.st.声望))) + ' · ' + t('银两') + ' ' + Math.round(S.st.银两) + '</p>'
      + tasksHtml(S)
      + '<div class="qx-zx" title="' + esc(t('品德') + ' ' + Math.round(S.st.品德)) + '"><i style="left:' + S.st.品德 + '%"></i></div><div class="qx-zxl"><span>' + t('魔') + '</span><span>' + t('侠') + '</span></div></div>';
  }
  function partyCard() {
    const S = QX.state();
    return '<div class="card"><div class="card-h"><h3>' + t('同伴') + '</h3><small>' + S.party.length + '/' + QX.CFG.partyMax + '</small></div>'
      + (S.party.length ? '<div class="rows">' + S.party.map((p) => '<div class="row"><span class="nm">' + esc(QX.PEOPLE[p].name) + '</span><span class="v qx-muted">' + esc(typeof QX.PEOPLE[p].title === 'function' ? QX.PEOPLE[p].title(QX.G()) : QX.PEOPLE[p].title) + '</span></div>').join('') + '</div>' : '<p class="empty">' + t('独自一人。') + '</p>') + '</div>';
  }
  function relicCard() {
    const S = QX.state();
    return '<div class="card"><div class="card-h"><h3>' + t('十四件信物') + '</h3><small>' + S.relics.length + '/14</small></div><div class="qx-relics">'
      + QX.relicIds().map((r) => '<span class="qx-relic' + (S.relics.includes(r) ? ' got' : '') + '" title="' + esc(S.relics.includes(r) ? QX.ITEMS[r].d : t('还没找到')) + '">' + esc(S.relics.includes(r) ? QX.ITEMS[r].name : '？') + '</span>').join('') + '</div></div>';
  }
  function newsCard() {
    const S = QX.state();
    const lines = S.log.slice(-14).reverse();
    // 江湖传闻放在上面：玩家靠它知道哪儿要出事、该去哪儿赶热闹；自己的经历在下面
    // 带地点的传闻有“去看看”（打开地图、标出那里）；风声过了日子就灰掉
    const item = (n) => {
      const past = n.to != null && S.day > n.to;
      return '<li class="' + (past ? 'past' : n.loc ? 'lead' : '') + '">' + (n.d != null ? '<span class="qx-muted">' + esc(QX.date(n.d).y + '.' + QX.date(n.d).m) + '</span> ' : '')
        + (n.cred ? '<span class="qx-cred c-' + esc(n.cred) + '">' + esc(t(n.cred)) + '</span> ' : '') + esc(n.t)
        + (n.loc && !past && QX.LOCS[n.loc] ? ' <button class="b qx-look" data-act="look" data-id="' + esc(n.loc) + '">' + (n.loc === S.loc ? t('就在这里') : t('去看看') + ' · ' + esc(QX.LOCS[n.loc].short)) + '</button>' : '') + '</li>';
    };
    return '<div class="card"><div class="card-h"><h3>' + t('江湖传闻') + '</h3><small>' + t('最新在上') + '</small></div>'
      + (S.news.length ? '<ul class="ulist qx-news">' + S.news.slice(-8).reverse().map(item).join('') + '</ul>' : '<p class="empty">' + t('江湖上暂时还算平静。') + '</p>') + '</div>'
      + '<div class="card log-card"><div class="card-h"><h3>' + t('经历') + '</h3><small>' + t('最新在上') + '</small></div><ul class="log qx-log">' + lines.map((l) => '<li class="k-' + esc(l.k) + '"><span class="a">' + esc(QX.date(l.d).y + '.' + QX.date(l.d).m) + '</span><span class="t">' + esc(l.t) + '</span><span class="s"></span></li>').join('') + '</ul>'
      + '</div>';
  }

  /* ---------- 弹框 ---------- */
  function charModal() {
    const S = QX.state();
    const row = (k, v) => '<div class="row"><span class="k qx-irow">' + ic(k) + t(k) + '</span><span class="v">' + v + '</span></div>';
    const sect = S.sect ? QX.SECTS[S.sect].name + ' · ' + QX.rankName() : t('无门无派');
    const head = '<div class="qx-charhead"><canvas class="px" data-portrait="me" width="20" height="24"></canvas><div><h3>' + esc(S.name) + '</h3><p class="qx-muted">' + esc(t(S.sex)) + ' · ' + t('{n} 岁', { n: QX.age() }) + ' · ' + esc(sect) + '</p>'
      + '<p class="qx-muted">' + esc(QX.ORIGINS.find((o) => o.id === S.origin).name) + '</p></div></div>';
    const injPct = Math.round(QX.INJ.hit * S.inj * 100);
    return modal(t('人物'), head
      + '<div class="lbl">' + t('资质') + ' · ' + t('判定看这几样') + '</div><div class="qx-apts">' + APT.map(aptRow).join('') + '</div>'
      + '<div class="lbl">' + t('战斗') + '</div><div class="rows">' + row('气血', S.hp + '/' + QX.maxHp()) + row('内力', S.mp + '/' + QX.maxMp()) + row('攻击', QX.eff('攻击')) + row('防御', QX.eff('防御'))
      + row('历练', S.xp) + row('战绩', t('{w} 胜 / {n} 战', { w: S.wins, n: S.fights })) + '</div>' + bodyNote(S)
      + (S.inj ? '<p class="hint">' + t('内伤让攻击和内力上限各少了 {p}%。自己只能养好到 {n} 层，剩下的要去医馆、吃药或找高人。', { p: injPct, n: QX.INJ.self }) + '</p>' : '')
      + '<div class="lbl">' + t('路线') + '</div><div class="rows">' + row('品德', Math.round(S.st.品德) + ' · ' + t(deWord(S.st.品德))) + row('声望', Math.round(S.st.声望) + ' · ' + t(fameWord(S.st.声望))) + row('银两', Math.round(S.st.银两) + ' ' + t('两')) + '</div>'
      + '<p class="hint">' + t('资质管学武快慢；根骨管气血；轻功管身法、躲闪和赶路。事件里的判定分易、中、难、极难四档，属性到了那一档，成功率大约一半。品德和声望不掷骰，够了才有的选项，不够就灰着。品德 50 以上是侠的结局，以下是魔。') + '</p>');
  }
  function artsModal() {
    const S = QX.state(), ids = Object.keys(S.arts), block = QX.hardBlock();
    if (!ids.length) return modal(t('武功'), '<p class="empty">' + t('还什么都不会。') + '</p>');
    const body = ids.map((id) => {
      const A = QX.ARTS[id], a = S.arts[id], can = QX.canPractise(id);
      const r1 = Math.round(QX.practiseRisk(id, false) * 100), r2 = Math.round(QX.practiseRisk(id, true) * 100);
      const gate = QX.atGate(id), stuck = QX.stuck(id);
      const where = QX.gateLocs(id).map((l) => QX.LOCS[l].short).join('、');
      return '<div class="qx-art"><div class="qx-art-h">' + ic(A.type, id) + '<b>' + esc(A.name) + '</b><span class="tag book">' + esc(t(A.type)) + '</span>' + (gate ? '<span class="tag ' + (stuck ? 'bad' : '') + '">' + t(stuck ? '卡在瓶颈' : '前面是关口') + '</span>' : '') + '<span class="qx-lv">' + t('{n} 级', { n: a.lv }) + '</span></div>'
        + (a.lv < QX.CFG.maxLv ? '<span class="qx-track xp' + (stuck ? ' stuck' : '') + '"><i style="width:' + Math.round((a.xp / QX.need(a.lv)) * 100) + '%"></i></span>' : '<p class="qx-muted">' + t('已经练到顶了。') + '</p>')
        + (stuck ? '<p class="qx-muted qx-badv">' + esc(t('第 {n} 级是个关口：找会这门功夫的人请教、带着秘籍练、去{w}闭关，或者打赢一场硬仗。', { n: a.lv, w: where || t('合适的地方') })) + '</p>' : '')
        + '<p class="qx-muted">' + esc(A.d) + '</p>'
        + (can ? '<div class="end-btns"><button class="b" data-act="practise" data-id="' + id + '">' + t('练十天') + (r1 ? ' · ' + t('风险 {p}%', { p: r1 }) : '') + '</button><button class="b" data-act="practise" data-id="' + id + '" data-hard="1"' + (block ? ' disabled title="' + esc(block) + '"' : '') + '>' + t('冒进苦练') + ' · ' + (block ? esc(t('伤重')) : t('风险 {p}%', { p: r2 })) + '</button></div>' : '') + '</div>';
    }).join('');
    return modal(t('武功'), (ui.toast && ui.modal === 'arts' ? '<div class="result"><p>' + esc(ui.toast) + '</p></div>' : '') + body + '<p class="hint">' + t('冒进苦练长进加倍，可能受内伤或走火入魔；走火入魔还会伤了经脉。内功越深越安全。内伤三层以上不能冒进。') + '</p>');
  }
  function itemsModal() {
    const S = QX.state(), ids = Object.keys(S.items).filter((k) => !QX.ITEMS[k].relic);
    const body = ids.length ? ids.map((id) => { const it = QX.ITEMS[id]; return '<div class="row"><span class="qx-irow">' + ic(it.type, id) + '<span><b class="nm">' + esc(it.name) + '</b> ×' + S.items[id] + '<br><small class="qx-muted">' + esc(it.d) + '</small></span></span><span class="v">' + (it.use || it.teaches ? '<button class="b" data-act="use" data-id="' + id + '">' + t(it.teaches ? '研读' : '使用') + '</button>' : '') + '</span></div>'; }).join('') : '<p class="empty">' + t('包袱里空空的。') + '</p>';
    const slots = '<div class="qx-relics grid">' + QX.relicIds().map((r) => { const got = S.relics.includes(r); return '<span class="qx-relic slot' + (got ? ' got' : '') + '" title="' + esc(got ? QX.ITEMS[r].d : t('还没找到')) + '">' + ic('信物', r) + '<span>' + esc(got ? QX.ITEMS[r].name : t('未得')) + '</span></span>'; }).join('') + '</div>';
    const relics = S.relics.filter((id) => { const it = QX.ITEMS[id]; return it.use || it.teaches; }).map((id) => { const it = QX.ITEMS[id]; return '<div class="row"><span><b class="nm">' + esc(it.name) + '</b><br><small class="qx-muted">' + esc(it.d) + '</small></span><span class="v">' + (it.use || it.teaches ? '<button class="b" data-act="use" data-id="' + id + '">' + t(it.teaches ? '研读' : '使用') + '</button>' : '') + '</span></div>'; }).join('');
    return modal(t('物品'), (ui.toast && ui.modal === 'items' ? '<div class="result"><p>' + esc(ui.toast) + '</p></div>' : '') + '<div class="lbl">' + t('包袱') + '</div><div class="rows">' + body + '</div>'
      + '<div class="lbl">' + t('十四件信物') + ' · ' + S.relics.length + '/14</div>' + slots + (relics ? '<div class="rows" style="margin-top:8px">' + relics + '</div>' : ''));
  }
  function partyModal() {
    const S = QX.state();
    const body = S.party.length ? S.party.map((p) => { const P = QX.PEOPLE[p], C = P.comp.st; return '<div class="row"><span class="qx-who"><canvas class="px" data-portrait="' + p + '" width="20" height="24"></canvas><span><b class="nm">' + esc(P.name) + '</b><br><small class="qx-muted">' + esc(C.moves.map((m) => m[0]).join('、')) + '</small></span></span><span class="v"><button class="b" data-act="dismiss" data-id="' + p + '">' + t('分手') + '</button></span></div>'; }).join('') : '<p class="empty">' + t('身边没有同伴。在各地和人说话，可以邀请同行。') + '</p>';
    return modal(t('队伍'), '<div class="rows">' + body + '</div><p class="hint">' + t('最多带两个同伴。有的人互相合不来，有的人到了时候会自己走。') + '</p>');
  }
  function mapModal() {
    const S = QX.state();
    // 传闻里还没过日子的地点，地图上标出来；从传闻点“去看看”进来的那一处标得更醒目
    const leads = new Set(S.news.filter((n) => n.loc && !(n.to != null && S.day > n.to)).map((n) => n.loc));
    const pins = Object.keys(QX.LOCS).map((id) => { const L = QX.LOCS[id]; return '<button class="qx-pin' + (id === S.loc ? ' here' : '') + (L.sea ? ' sea' : '') + (leads.has(id) ? ' lead' : '') + (ui.mapHi === id ? ' hi' : '') + '" style="left:' + L.x + '%;top:' + L.y + '%" data-act="' + (id === S.loc ? 'noop' : 'go') + '" data-id="' + id + '" title="' + esc(L.name) + '"><i></i><span>' + esc(L.short) + '</span></button>'; }).join('');
    const horse = QX.canHorse() && ui.horse;
    const regs = Object.keys(QX.REGIONS).map((rid) => {
      const locs = Object.keys(QX.LOCS).filter((id) => QX.LOCS[id].region === rid);
      return '<div class="qx-reg"><div class="lbl">' + esc(QX.REGIONS[rid].name) + '</div>' + locs.map((id) => {
        const tag = leads.has(id) ? ' <span class="qx-cred c-确凿">' + t('有风声') + '</span>' : '';
        if (id === S.loc) return '<div class="row' + (ui.mapHi === id ? ' hi' : '') + '"><span class="nm">' + esc(QX.LOCS[id].short) + tag + '</span><span class="v qx-muted">' + t('你在这里') + '</span></div>';
        const r = QX.route(id, horse);
        return '<div class="row' + (ui.mapHi === id ? ' hi' : '') + '"><span class="nm">' + esc(QX.LOCS[id].short) + tag + '</span><span class="v"><button class="b" data-act="go" data-id="' + id + '"' + (r.why ? ' disabled title="' + esc(r.why) + '"' : '') + '>' + t('{n} 天', { n: r.days }) + (r.cost ? ' · ' + t('{n} 两', { n: r.cost }) : '') + '</button></span>' + (r.why ? '<span class="n">' + esc(r.why) + '</span>' : '') + '</div>';
      }).join('') + '</div>';
    }).join('');
    const horseRow = QX.canHorse() ? '<label class="qx-horse"><input type="checkbox" id="qx-horse"' + (ui.horse ? ' checked' : '') + '> ' + t('雇快马：陆路少三成天数，按路程收钱（四天以上的陆路才雇得到）') + '</label>' : '<p class="qx-muted">' + t('这里雇不到马。') + '</p>';
    return modal(t('地图'), '<div class="qx-map" role="img" aria-label="' + esc(t('地图')) + '"><canvas class="qx-mapbg" id="qx-mapbg"></canvas>' + pins + '</div>' + horseRow + '<div class="qx-regs">' + regs + '</div><p class="hint">' + t('路上可能遇到强人、流民或比武的人。东海诸岛从临安坐船，去冰火岛要有海图。标着“有风声”的地方，传闻里说那里要出事。') + '</p>', 'wide');
  }
  function shopModal() {
    const S = QX.state(), L = QX.LOCS[S.loc];
    const body = (L.shop || []).map((id) => { const it = QX.ITEMS[id]; return '<div class="row"><span class="qx-irow">' + ic(it.type, id) + '<span><b class="nm">' + esc(it.name) + '</b><br><small class="qx-muted">' + esc(it.d) + '</small></span></span><span class="v"><button class="b" data-act="buy" data-id="' + id + '"' + (S.st.银两 < it.price ? ' disabled' : '') + '>' + t('{n} 两', { n: it.price }) + '</button></span></div>'; }).join('');
    return modal(t('店铺') + ' · ' + L.short, (ui.toast && ui.modal === 'shop' ? '<div class="result"><p>' + esc(ui.toast) + '</p></div>' : '') + '<p class="qx-muted">' + t('身上有 {n} 两银子。', { n: Math.round(S.st.银两) }) + '</p><div class="rows">' + body + '</div>');
  }
  function saveModal() {
    const sl = QX.slots();
    const line = (s) => (s ? esc(s.name) + ' · ' + esc(dateText(s.day)) + ' · ' + t('信物') + ' ' + s.relics + '/14' : t('（空）'));
    return modal(t('存档'), '<div class="rows"><div class="row"><span><b class="nm">' + t('自动存档') + '</b><br><small class="qx-muted">' + line(sl.auto) + '</small></span><span class="v qx-muted">' + t('每一步都会存') + '</span></div>'
      + '<div class="row"><span><b class="nm">' + t('手动存档') + '</b><br><small class="qx-muted">' + line(sl.manual) + '</small></span><span class="v"><button class="b" data-act="savem">' + t('存到这里') + '</button> <button class="b" data-act="load" data-v="manual"' + (sl.manual ? '' : ' disabled') + '>' + t('读取') + '</button></span></div></div>'
      + (ui.toast && ui.modal === 'save' ? '<p class="hint">' + esc(ui.toast) + '</p>' : '')
      + '<div class="end-btns" style="margin-top:10px">' + (ui.confirmNew ? '<span class="confirm">' + t('确定放弃这一局？自动存档会被覆盖。') + '</span><button class="b" data-act="home">' + t('确定') + '</button><button class="b" data-act="cancelnew">' + t('算了') + '</button>' : '<button class="b" data-act="asknew">' + t('新的江湖') + '</button>') + '</div>');
  }
  const FB_KINDS = [['bug', '程序出错'], ['story', '剧情不合理'], ['idea', '建议'], ['other', '其他']];
  function feedbackModal() {
    const f = ui.fb;
    return modal(t('问题反馈'), '<div class="fb-kinds">' + FB_KINDS.map((k) => '<button class="chip" data-act="fbkind" data-v="' + k[0] + '" aria-pressed="' + (f.kind === k[0]) + '">' + t(k[1]) + '</button>').join('') + '</div>'
      + '<label for="fb-text" class="lbl">' + t('遇到了什么？越具体越好') + '</label><textarea id="fb-text" maxlength="2000" rows="6">' + esc(f.text) + '</textarea>'
      + '<label class="fb-ctx"><input type="checkbox" id="fb-ctx"' + (f.ctx ? ' checked' : '') + '> ' + t('附上当前的游戏进度') + '</label>'
      + '<div class="share-grid">' + (CFG.feedbackRepo ? '<button class="b primary" data-act="fbgh">' + t('提交到 GitHub') + '</button>' : '') + '<button class="b" data-act="fbcopy">' + t('复制反馈内容') + '</button></div><p class="hint" id="fb-msg">' + esc(f.msg || '') + '</p>');
  }
  function fbBody() {
    const S = QX.state(), f = ui.fb;
    let ctx = '';
    if (f.ctx) ctx = '\n\n---\n群侠 v' + VERSION + ' · ' + (JY.LANG || 'zh') + '\n' + (S ? S.name + ' · ' + dateText(S.day) + ' · ' + S.loc + (S.ev ? ' · ' + (S.ev.id || S.ev.talk) : '') + '\n' + S.log.slice(-3).map((l) => '  ' + l.t).join('\n') : '') + '\n' + navigator.userAgent;
    return { title: '[群侠][' + t((FB_KINDS.find((k) => k[0] === f.kind) || FB_KINDS[3])[1]) + '] ' + f.text.split('\n')[0].slice(0, 60), body: f.text + ctx };
  }

  /* ---------- 结局 ---------- */
  function endView() {
    const S = QX.state(), o = S.over;
    const title = o.kind === 'dead' ? t('命丧江湖') : o.title;
    const text = o.kind === 'dead' ? o.text : o.text;
    return '<main class="end"><div class="stele"><div class="vname">' + esc(S.name) + '</div><div class="yrs">' + esc(dateText(S.day)) + '</div><div class="words">' + esc(title) + '</div><div class="cause">' + esc(o.kind === 'xia' ? t('侠') : o.kind === 'mo' ? t('魔') : t('死')) + '</div></div>'
      + '<div class="end-main"><p class="qx-text">' + esc(text) + '</p>'
      + '<div class="big-num"><div><span>' + t('信物') + '</span><b>' + S.relics.length + '/14</b></div><div><span>' + t('品德') + '</span><b>' + Math.round(S.st.品德) + '</b></div><div><span>' + t('声望') + '</span><b>' + Math.round(S.st.声望) + '</b></div><div><span>' + t('战绩') + '</span><b>' + S.wins + '/' + S.fights + '</b></div></div>'
      + '<div class="card">' + relicsList(S) + '</div>'
      + (Object.keys(S.flags).some((f) => QX.FLAGS[f]) ? '<div class="card"><div class="card-h"><h3>' + t('江湖因你而变') + '</h3></div><ul class="ulist">' + Object.keys(S.flags).filter((f) => QX.FLAGS[f]).map((f) => '<li class="mod">' + esc(QX.FLAGS[f]) + '</li>').join('') + '</ul></div>' : '')
      + '<div class="end-btns"><button class="b primary big" data-act="home">' + t('新的江湖') + '</button>' + (QX.slots().manual ? '<button class="b big" data-act="load" data-v="manual">' + t('读取手动存档') + '</button>' : '') + '</div></div></main>' + foot();
  }
  function relicsList(S) { return '<div class="card-h"><h3>' + t('十四件信物') + '</h3></div><div class="qx-relics">' + QX.relicIds().map((r) => '<span class="qx-relic' + (S.relics.includes(r) ? ' got' : '') + '">' + esc(QX.ITEMS[r].name) + '</span>').join('') + '</div>'; }

  /* ---------- 渲染 ---------- */
  function render() {
    const S = QX.state();
    const y = window.scrollY;
    let h;
    if (!S || ui.screen === 'start') h = startView();
    else if (S.over) h = endView();
    else {
      setMe();
      const mid = S.fight ? fightCard() : S.ev ? eventCard() : actionsCard();
      h = topView() + '<div class="qx-shell"><div class="col qx-main">' + sceneCard() + mid + '</div><aside class="col qx-sidecol">' + statusCard() + (QX.CFG.companions ? partyCard() : '') + newsCard() + '</aside></div>' + foot();
      const M = { char: charModal, arts: artsModal, items: itemsModal, party: partyModal, map: mapModal, shop: shopModal, save: saveModal };
      if (ui.modal && M[ui.modal]) h += M[ui.modal]();
    }
    if (ui.fb) h += feedbackModal();
    app.innerHTML = h;
    paint();
    window.scrollTo(0, y);
  }
  function paint() {
    const S = QX.state();
    if (QX.paintIcons) QX.paintIcons(app);
    const mb = document.getElementById('qx-mapbg');
    if (mb && QX.drawMap) QX.drawMap(mb);
    const c = document.getElementById('scene');
    if (c && JY.drawScene) JY.drawScene(c, { loc: S.loc, year: S.day, me: 'me', age: QX.age(), party: S.party.slice(0, 2), partyAges: S.party.map(() => 30) });
    document.querySelectorAll('canvas[data-portrait]').forEach((cv) => { if (JY.drawPortrait) JY.drawPortrait(cv, cv.dataset.portrait, 30); });
  }
  function focusMid() { const el = document.getElementById('qx-ev'); if (el && window.innerWidth <= 820) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  function stopAuto() { if (ui.autoT) { clearInterval(ui.autoT); ui.autoT = null; } }
  function startAuto() {
    stopAuto();
    ui.autoT = setInterval(() => { const F = QX.state() && QX.state().fight; if (!F || F.result || !F.auto) { stopAuto(); render(); return; } QX.fightAct(QX.aiOption()); render(); }, 380);
  }

  /* ---------- 操作 ---------- */
  function act(a, d) {
    const S = QX.state();
    switch (a) {
      case 'form': ui.form[d.k] = d.v; render(); break;
      case 'new': { const n = document.getElementById('f-name'); if (n) ui.form.name = n.value; QX.newGame(ui.form); ui.screen = 'game'; ui.toast = ''; ui.modal = null; render(); window.scrollTo(0, 0); break; }
      case 'load': if (QX.load(d.v)) { ui.screen = 'game'; ui.modal = null; ui.toast = ''; render(); } break;
      case 'home': stopAuto(); ui.screen = 'start'; ui.modal = null; ui.confirmNew = false; render(); window.scrollTo(0, 0); break;
      case 'asknew': ui.confirmNew = true; render(); break;
      case 'cancelnew': ui.confirmNew = false; render(); break;
      case 'open': ui.modal = d.v; ui.toast = ''; ui.confirmNew = false; render(); break;
      case 'close': case 'bg': ui.modal = null; ui.mapHi = ''; ui.toast = ''; if (ui.fb && a === 'close') ui.fb = null; render(); break;
      case 'theme': { const i = THEMES.findIndex((x) => x[0] === themeNow()); const nx = THEMES[(i + 1) % THEMES.length][0]; document.documentElement.dataset.theme = nx; store.set(THEME_KEY, nx); render(); break; }
      case 'choose': QX.choose(Number(d.i)); ui.toast = ''; render(); focusMid(); break;
      case 'cont': QX.cont(); ui.toast = ''; render(); focusMid(); break;
      case 'do': {
        ui.toast = '';
        if (d.k === 'shop' || d.k === 'travel' || d.k === 'practise') { ui.modal = d.k === 'travel' ? 'map' : d.k === 'practise' ? 'arts' : 'shop'; render(); break; }
        if (d.k === 'talk') QX.talk(d.id); else { const r = QX.act(d.k, d.id); if (r) ui.toast = r; }
        render(); focusMid(); break;
      }
      case 'go': { const why = QX.travel(d.id, QX.canHorse() && ui.horse); ui.modal = null; ui.mapHi = ''; ui.toast = why || ''; render(); window.scrollTo(0, 0); break; }
      case 'look': ui.modal = 'map'; ui.mapHi = d.id; ui.toast = ''; render(); break;
      case 'practise': {
        const r = QX.practise(d.id, !!d.hard);
        if (r) { const A = QX.ARTS[d.id]; ui.toast = r.hurt === 'zouhuo' ? t('走火入魔！功力倒退。') : r.hurt === 'neishang' ? t('受了内伤。') + ' ' + t('长进 {n}。', { n: r.gain }) : t('{a}长进 {n}。', { a: A.name, n: r.gain }) + (r.up ? ' ' + t('升到第 {n} 级！', { n: QX.artLv(d.id) }) : ''); }
        if (QX.state().ev || QX.state().fight) ui.modal = null;
        render(); break;
      }
      case 'use': { const r = QX.useItem(d.id); ui.toast = r || ''; if (QX.state().ev) ui.modal = null; render(); break; }
      case 'buy': ui.toast = QX.buy(d.id) || ''; render(); break;
      case 'dismiss': QX.dismiss(d.id); render(); break;
      case 'savem': QX.saveManual(); ui.toast = t('已存档。'); render(); break;
      case 'fight': { const o = QX.fightOptions()[Number(d.i)]; if (o && !o.dis) QX.fightAct(o); render(); break; }
      case 'target': QX.fightTarget(Number(d.i)); render(); break;
      case 'auto': QX.fightAuto(); if (S.fight.auto) startAuto(); else stopAuto(); render(); break;
      case 'fightdone': stopAuto(); QX.fightDone(); render(); focusMid(); break;
      case 'feedback': ui.fb = { kind: 'story', text: '', ctx: true, msg: '' }; render(); break;
      case 'fbkind': ui.fb.kind = d.v; render(); break;
      case 'fbgh': case 'fbcopy': {
        if (!ui.fb.text.trim()) { ui.fb.msg = t('先写几句再提交。'); render(); break; }
        const p = fbBody();
        if (a === 'fbgh') { window.open('https://github.com/' + CFG.feedbackRepo + '/issues/new?title=' + encodeURIComponent(p.title) + '&body=' + encodeURIComponent(p.body.slice(0, 6000)), '_blank', 'noopener'); ui.fb.msg = t('已在新窗口打开 GitHub，确认后点提交即可。'); }
        else { try { navigator.clipboard.writeText(p.title + '\n\n' + p.body).then(() => { ui.fb.msg = t('已复制，可以粘贴给作者。'); render(); }); } catch (e) { ui.fb.msg = t('复制失败，请手动选中文字复制。'); } }
        render(); break;
      }
      default: break;
    }
  }
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if ((el.dataset.act === 'bg') && e.target !== el) return; // 点弹框里面不关
    act(el.dataset.act, el.dataset);
  });
  app.addEventListener('input', (e) => {
    if (e.target.id === 'f-name') ui.form.name = e.target.value;
    if (e.target.id === 'fb-text' && ui.fb) ui.fb.text = e.target.value;
  });
  app.addEventListener('change', (e) => {
    if (e.target.classList.contains('lang-sel') && JY.setLang) JY.setLang(e.target.value);
    if (e.target.id === 'fb-ctx' && ui.fb) ui.fb.ctx = e.target.checked;
    if (e.target.id === 'qx-horse') { ui.horse = e.target.checked; render(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.matches && e.target.matches('input, textarea, select')) return;
    const S = QX.state();
    if (e.key === 'Escape' && (ui.modal || ui.fb)) { ui.modal = null; ui.fb = null; render(); return; }
    if (!S || ui.modal || ui.fb || S.over || ui.screen === 'start') return;
    if (S.ev && /^[1-9]$/.test(e.key)) { const i = Number(e.key) - 1; if (S.ev.choices[i] && !S.ev.choices[i].dis) act('choose', { i }); }
    else if ((e.key === 'Enter' || e.key === ' ') && document.getElementById('cont')) { e.preventDefault(); document.getElementById('cont').click(); }
  });

  // 开局：有自动存档就接着玩，没有就到开始页
  if (QX.load('auto') && !QX.state().over) ui.screen = 'game'; else ui.screen = 'start';
  // 截图用：?demo=1 开一局示例；&open=map 打开弹框；&fight=1 进一场战斗；&theme=light 换主题
  const q = new URLSearchParams(location.search);
  if (q.get('demo') && !QX.state()) { QX.newGame({ name: '阿青', sex: '女', origin: 'fisher', sect: 'emei' }); ui.screen = 'game'; }
  if (q.get('demo') && QX.state()) {
    if (q.get('theme')) document.documentElement.dataset.theme = q.get('theme');
    // &day=134,3 让日子走到那一天（看风声、传闻）；&inj=3 带上内伤
    if (q.get('day')) { const S = QX.state(), d = q.get('day').split(',').map(Number); const n = QX.dv(d[0], d[1] || 1, d[2] || 1) - S.day; if (n > 0) { QX._internal.passDays(n); S.ev = null; S.queue = []; } }
    if (q.get('inj')) { const S = QX.state(); S.inj = Number(q.get('inj')); S.mer = q.get('mer') ? 1 : 0; QX.save(); }
    if (q.get('talk')) { const S = QX.state(); S.ev = null; S.queue = []; S.loc = QX.where(q.get('talk')) || S.loc; QX.talk(q.get('talk')); }
    if (q.get('ev')) { const S = QX.state(); S.ev = null; S.mp = QX.maxMp(); if (q.get('silver')) S.st.银两 = Number(q.get('silver')); QX._internal.startEvent(q.get('ev')); }
    if (q.get('open')) ui.modal = q.get('open');
    if (q.get('fight')) { const S = QX.state(); S.ev = null; S.party = QX.CFG.companions ? ['zhoudian'] : []; QX.startFight({ foes: ['shanzei', 'zeitou'] }); QX.fightAct(QX.aiOption()); QX.fightAct(QX.aiOption()); }
  }
  render();
})();

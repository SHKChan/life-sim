/* 多语言
 * 界面文字以简体中文为准：JY.t('暂停') 在别的语言下查词表，查不到就原样返回中文。
 * 带变量的写成 JY.t('一年约 {n} 秒', { n: 7.5 })。
 * 词表：share/lang/<语言>.js 用 JY.addI18n('en', { '暂停': 'Pause', ... }) 往里加；
 *       各游戏的 game.js 可以再加自己的用词，并在 JY.GAME.i18n.<语言> 里覆盖界面用词字段。
 * 剧情文字的翻译放在各游戏 data/<语言>/ 下，按 id 覆盖中文节点（见 CLAUDE.md“多语言”）。
 * 语言存在 localStorage 的 vibe.lang（同一个网站下所有游戏共用），第一次按浏览器语言选。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  const KEY = 'vibe.lang';
  JY.LANGS = [['zh', '中文'], ['en', 'English'], ['ja', '日本語'], ['es', 'Español']];
  const ok = (l) => JY.LANGS.some((x) => x[0] === l);
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* 存储不可用 */ }
  if (!ok(lang)) {
    const n = String((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase();
    lang = /^ja/.test(n) ? 'ja' : /^es/.test(n) ? 'es' : /^en/.test(n) ? 'en' : 'zh';
  }
  // 网址里带 ?lang=en 时优先（方便分享某个语言的链接）
  try { const q = new URLSearchParams(location.search).get('lang'); if (ok(q)) lang = q; } catch (e) { /* 无界面环境 */ }
  JY.LANG = lang;
  JY.I18N = JY.I18N || {};
  JY.addI18n = (l, dict) => { JY.I18N[l] = Object.assign(JY.I18N[l] || {}, dict); };
  JY.t = (s, vars) => {
    let r = s;
    if (lang !== 'zh' && s != null) { const d = JY.I18N[lang]; if (d && d[s] != null) r = d[s]; }
    if (vars && typeof r === 'string') r = r.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return r;
  };
  JY.setLang = (l) => {
    if (!ok(l)) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* 忽略 */ }
    try { const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString()); } catch (e) { location.reload(); }
  };
  // 中文以外：金额按美元显示（一美元约七元）
  JY.money = (yuan) => {
    const n = Math.round(Number(yuan) || 0), neg = n < 0 ? '-' : '', a = Math.abs(n);
    if (lang !== 'zh') {
      const d = a / 7;
      if (d >= 1e6) return neg + '$' + (d / 1e6).toFixed(d >= 1e7 ? 0 : 1) + 'M';
      if (d >= 1e4) return neg + '$' + Math.round(d / 1e3) + 'K';
      return neg + '$' + Math.round(d).toLocaleString('en-US');
    }
    if (a >= 1e8) return neg + '¥' + (a / 1e8).toFixed(a >= 1e9 ? 0 : 1) + ' 亿';
    if (a >= 1e4) return neg + '¥' + (a >= 1e6 ? Math.round(a / 1e4) : (a / 1e4).toFixed(1).replace(/\.0$/, '')) + ' 万';
    return neg + '¥' + a.toLocaleString('en-US');
  };
  /* 剧情翻译：<游戏>/lang/<语言>/ 下放 game.js（界面用词）和 data/ 里每个文件的翻译版（同名）。
   * index.html 在中文数据文件之后调用 JY.loadLangData()：当前语言在 JY.GAME.langs 里时，
   * 先清空中文数据，再按同样的顺序载入翻译版。没翻译的语言就继续用中文剧情。 */
  JY.hasLangData = () => lang !== 'zh' && !!(JY.GAME && (JY.GAME.langs || []).includes(lang));
  JY.loadLangData = () => {
    if (!JY.hasLangData() || typeof document === 'undefined') return;
    // 只换调用处之前的数据文件（之后的，例如画场景的 scenes.js，没有文字，不用换）
    const all = [].slice.call(document.getElementsByTagName('script'));
    const upto = document.currentScript ? all.indexOf(document.currentScript) : all.length;
    const files = all.slice(0, upto).filter((s) => /^data\//.test(s.getAttribute('src') || '')).map((s) => s.getAttribute('src').replace(/^data\//, '').replace(/\?.*$/, ''));
    const v = (document.querySelector('script[src*="i18n.js"]') || { getAttribute: () => '' }).getAttribute('src').split('?')[1] || '';
    const tag = (src) => '<script src="lang/' + lang + '/' + src + (v ? '?' + v : '') + '"><\/script>';
    document.write(tag('game.js') + '<script>JY.resetData()<\/script>' + files.map(tag).join(''));
  };
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja', es: 'es' }[lang];
})();

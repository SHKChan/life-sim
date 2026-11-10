/* 多语言
 * 界面文字以简体中文为准：JY.t('暂停') 在别的语言下查词表，查不到就原样返回中文。
 * 带变量的写成 JY.t('一年约 {n} 秒', { n: 7.5 })。
 * 词表：share/lang/<语言>.js 用 JY.addI18n('en', { '暂停': 'Pause', ... }) 往里加；
 *       各游戏的 game.js 可以再加自己的用词，并在 JY.GAME.i18n.<语言> 里覆盖界面用词字段。
 * 剧情文字的翻译放在各游戏 data/<语言>/ 下，按 id 覆盖中文节点（见 CLAUDE.md“多语言”）。
 * 语言存在 localStorage 的 vibe.lang（同一个网站下所有游戏共用），第一次按浏览器语言选。
 * 全站翻译暂时只开中文（vibe-game 的 nav.js 里 LANG_OPEN）：这里也把 LANG_OPEN 设成 false，一律用中文、不载入谷歌翻译。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  const KEY = 'vibe.lang';
  JY.LANGS = [['zh', '中文'], ['zh-TW', '繁體中文'], ['en', 'English'], ['ja', '日本語'], ['es', 'Español']];
  const ok = (l) => JY.LANGS.some((x) => x[0] === l);
  // 网站上暂时只开中文（和 vibe-game 的 nav.js 一起改）。单独打包的版本（例如 itch.io 版）在 config.js 里写
  // langOpen: true 打开语言切换，defaultLang 定没选过语言时用哪种（itch 版默认英文）
  const CFG = (typeof window !== 'undefined' && window.JY_CONFIG) || {};
  const LANG_OPEN = !!CFG.langOpen;
  JY.LANG_OPEN = LANG_OPEN;
  let lang = null;
  try { lang = LANG_OPEN ? localStorage.getItem(KEY) : 'zh'; } catch (e) { /* 存储不可用 */ }
  if (!ok(lang) && ok(CFG.defaultLang)) lang = CFG.defaultLang;
  if (!ok(lang)) {
    const n = String((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase();
    lang = /^ja/.test(n) ? 'ja' : /^es/.test(n) ? 'es' : /^en/.test(n) ? 'en' : /^zh-(tw|hk|mo)|hant/.test(n) ? 'zh-TW' : 'zh';
  }
  // 网址里带 ?lang=en 时优先（方便分享某个语言的链接）
  try { const q = new URLSearchParams(location.search).get('lang'); if (LANG_OPEN && ok(q)) lang = q; } catch (e) { /* 无界面环境 */ }
  if (!LANG_OPEN) lang = 'zh';
  JY.LANG = lang;
  JY.I18N = JY.I18N || {};
  JY.addI18n = (l, dict) => { JY.I18N[l] = Object.assign(JY.I18N[l] || {}, dict); };
  JY.t = (s, vars) => {
    let r = s;
    const l = JY.LANG || lang; // 测试工具会直接改 JY.LANG
    if (l !== 'zh' && s != null) { const d = JY.I18N[l]; if (d && d[s] != null) r = d[s]; }
    if (vars && typeof r === 'string') r = r.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return r;
  };
  // 西文剧情是由片段拼起来的：句首字母大写、多余的空格去掉（中文原样返回）
  JY.polish = (t) => {
    if (/^zh/.test(JY.LANG || lang) || typeof t !== 'string' || !t) return t;
    return t.replace(/[ \u00a0]{2,}/g, ' ').replace(/ +([,.;:!?)”’])/g, '$1').replace(/([(“]) +/g, '$1').replace(/\.\s*\./g, '.')
      .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
      .replace(/(^|[.!?]\s+|[\[\]]\s*)([a-z])/g, (m, a, b) => a + b.toUpperCase()).trim();
  };
  JY.setLang = (l) => {
    if (!ok(l)) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* 忽略 */ }
    if (/^zh/.test(l) && typeof document !== 'undefined' && /googtrans=/.test(document.cookie)) clearGt();
    try { const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString()); } catch (e) { location.reload(); }
  };
  // 中文以外：金额按美元显示（一美元约七元）
  JY.money = (yuan) => {
    const n = Math.round(Number(yuan) || 0), neg = n < 0 ? '-' : '', a = Math.abs(n);
    if (!/^zh/.test(lang)) {
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
    // 翻译可以一个文件一个文件地补：GAME.langFiles.<语言> 列出已经翻好的数据文件，没列出的照旧载入中文原文
    const done = JY.GAME.langFiles && JY.GAME.langFiles[lang];
    const orig = (src) => '<script src="data/' + src + (v ? '?' + v : '') + '"><\/script>';
    document.write(tag('game.js') + '<script>JY.resetData()<\/script>' + files.map((f) => (!done || done.includes(f) ? tag(f) : orig(f))).join(''));
  };
  /* 剧情的机器翻译：没有人工翻译的语言，用谷歌网页翻译把页面上剩下的中文（剧情）翻过去。
   * 界面文字已经按词表翻好，谷歌遇到英文会原样留着。国内用中文玩，用不到这一步。
   * 原理：写 googtrans 这个 cookie 指定目标语言，再载入谷歌的翻译脚本，它会自动翻译并跟着页面变化继续翻。 */
  const GT = { en: 'en', ja: 'ja', es: 'es' };
  const clearGt = () => {
    const host = location.hostname;
    ['', '; domain=' + host, '; domain=.' + host.split('.').slice(-2).join('.')].forEach((d) => { document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d; });
  };
  JY.machineTranslate = () => {
    if (typeof document === 'undefined' || !/^https?:$/.test(location.protocol)) return;
    if (lang === 'zh' || !GT[lang] || !JY.GAME || JY.hasLangData()) { if (/googtrans=/.test(document.cookie)) clearGt(); return; }
    document.cookie = 'googtrans=/zh-CN/' + GT[lang] + '; path=/';
    JY.MT = true;
    // 谷歌会在页面顶上加一条横幅、把 body 往下推，这里藏掉
    const st = document.createElement('style');
    st.textContent = '.goog-te-banner-frame,.skiptranslate iframe,#goog-gt-tt,.goog-te-balloon-frame{display:none!important}body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}#gt-el{display:none}';
    document.head.appendChild(st);
    const box = document.createElement('div');
    box.id = 'gt-el';
    document.body.appendChild(box);
    window.JYgtInit = () => { try { new window.google.translate.TranslateElement({ pageLanguage: 'zh-CN', autoDisplay: false }, 'gt-el'); } catch (e) { /* 打不开谷歌就保持中文 */ } };
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=JYgtInit';
    s.async = true;
    document.body.appendChild(s);
  };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => JY.machineTranslate());
    else setTimeout(() => JY.machineTranslate(), 0);
  }
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja', es: 'es' }[lang] || lang;
})();

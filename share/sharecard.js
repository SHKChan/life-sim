/* 共用分享图与文字总结（书名、颜色、文案读 JY.GAME）
 * 在画布上画一张生平卡片，导出 PNG。卡片固定浅色，方便在微信、微博里看。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  const CFG = window.JY_CONFIG || {};
  const GAME = JY.GAME || {};
  // 分享卡和文字总结的用词、字段可以由 GAME.share 覆盖：sub(life) 姓名上方的小字，fields(life) 四个字段，summary(life) 文字总结（不含链接）
  const SH = GAME.share || {};
  const DEV = GAME.devName || '改命度';
  const FATE = GAME.fateLabel || (GAME.canon || '原著') + '命数';
  const LEG = GAME.legend || ['照' + (GAME.canon || '原著'), '改了命'];
  const BOOKS = GAME.books || {};
  const TITLE = GAME.title || '人生';
  const YEAR = GAME.year || '纪年';
  const ACCENT = {};
  const CODE = {};
  Object.keys(BOOKS).forEach((k) => { ACCENT[k] = BOOKS[k].card || BOOKS[k].color; CODE[k] = BOOKS[k].code; });
  const F_HEAD = '"Noto Serif SC", "Songti SC", "SimSun", serif';
  const F_BODY = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  const F_DISP = '"Ma Shan Zheng", "STKaiti", "KaiTi", serif';
  const F_MONO = 'ui-monospace, Consolas, "Courier New", monospace';
  const INK = '#1b2322', MUTED = '#66716d', PAPER = '#f4f2eb';
  const MARK = { p: '#c3cbc4', j: '#c9a24a', q: '#2a8a90', b: '#e3a796', d: '#b0472f', '': '#e3e5de' };

  JY.siteUrl = () => CFG.siteUrl || (/^https?:$/.test(location.protocol) ? location.origin + location.pathname : '');
  JY.siteLabel = () => {
    const u = JY.siteUrl();
    if (!u) return CFG.siteName || TITLE;
    try { return new URL(u).host; } catch (e) { return u; }
  };

  function wrap(c, text, x, y, maxW, lh, maxLines) {
    let line = '';
    let lines = [];
    for (const ch of String(text || '')) {
      const t = line + ch;
      if (c.measureText(t).width > maxW && line) { lines.push(line); line = ch; } else line = t;
    }
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
    }
    lines.forEach((l, i) => c.fillText(l, x, y + i * lh));
    return lines.length * lh;
  }

  /* life：E.finish 返回的记录；line：玩家写的一句话 */
  JY.drawShareCard = (target, life, line) => {
    const S = 2, Wd = 600;
    let Ht = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = Wd * S;
    canvas.height = Ht * S;
    const c = canvas.getContext('2d');
    c.setTransform(S, 0, 0, S, 0, 0);
    const accent = ACCENT[life.book] || GAME.brand || '#a3354c';
    const age = life.to - life.born;

    c.fillStyle = PAPER;
    c.fillRect(0, 0, Wd, Ht);
    c.strokeStyle = 'rgba(30, 50, 50, 0.05)';
    c.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      c.beginPath();
      c.moveTo(0, 230 + i * 34);
      c.bezierCurveTo(180, 180 + i * 34, 420, 300 + i * 34, 600, 236 + i * 34);
      c.stroke();
    }

    // 页眉
    c.fillStyle = accent;
    c.fillRect(0, 0, Wd, 66);
    c.fillStyle = '#ffffff';
    c.textBaseline = 'middle';
    c.font = '900 27px ' + F_HEAD;
    c.fillText(TITLE, 30, 34);
    c.font = '13px ' + F_MONO;
    c.textAlign = 'right';
    c.fillText((CODE[life.book] || 'LIFE') + '-' + life.born + '-' + life.to, Wd - 30, 35);
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';

    // 头像与姓名
    let y = 100;
    c.fillStyle = accent;
    c.font = '700 13px ' + F_BODY;
    c.fillText('生平记录', 30, y);
    const pc = document.createElement('canvas');
    JY.drawPortrait(pc, life.id, age);
    c.imageSmoothingEnabled = false;
    c.drawImage(pc, 30, y + 16, 110, 132);
    c.strokeStyle = 'rgba(0,0,0,0.12)';
    c.strokeRect(30.5, y + 16.5, 110, 132);
    c.fillStyle = accent;
    c.font = '700 13px ' + F_BODY;
    c.fillText(SH.sub ? SH.sub(life) : life.book + ' · ' + life.sex, 164, y + 34);
    c.fillStyle = INK;
    c.font = '900 46px ' + F_HEAD;
    c.fillText(life.name, 162, y + 88);
    c.font = '14px ' + F_MONO;
    c.fillStyle = '#3c4744';
    c.fillText(YEAR + ' ' + life.born + ' — ' + life.to + ' · 享年 ' + age, 164, y + 118);
    c.font = '13px ' + F_BODY;
    c.fillStyle = MUTED;
    c.fillText('卒于' + (life.deathLoc || ''), 164, y + 142);

    // 字段
    y = 290;
    const info = life.info || {};
    const fields = SH.fields ? SH.fields(life) : [
      ['出生于', life.birthplace || ''],
      ['门派', info['门派'] || '无'],
      ['身份', info['身份'] || ''],
      ['结局', life.cause, true],
    ];
    fields.forEach((f, i) => {
      const x = i % 2 ? 316 : 30;
      const yy = y + Math.floor(i / 2) * 64;
      c.font = '12px ' + F_BODY;
      c.fillStyle = MUTED;
      c.fillText(f[0], x, yy);
      c.font = '700 15px ' + F_BODY;
      c.fillStyle = f[2] ? accent : INK;
      wrap(c, f[1], x, yy + 22, 254, 20, 2);
    });

    // 一句话
    y = 440;
    const quote = line || life.words;
    if (quote) {
      c.fillStyle = INK;
      c.font = '26px ' + F_DISP;
      y += wrap(c, '“' + quote + '”', 30, y + 10, 540, 36, 2) + 8;
    }

    // 人生图与改命度
    y = Math.max(y + 12, 520);
    c.font = '11px ' + F_BODY;
    c.fillStyle = MUTED;
    c.fillText('人生图 · 一格一年 · 金色' + LEG[0] + ' · 青色' + LEG[1], 30, y);
    const span = Math.max(80, age + 3);
    const cell = 16, gap = 3, cols = 12;
    for (let a = 0; a < span; a++) {
      const yr = life.born + a;
      let k = '';
      if (yr < life.from) k = 'p';
      else if (yr <= life.to) k = life.marks[yr] || 'p';
      c.fillStyle = MARK[k];
      c.fillRect(30 + (a % cols) * (cell + gap), y + 12 + Math.floor(a / cols) * (cell + gap), cell, cell);
    }
    c.fillStyle = accent;
    c.font = '900 84px ' + F_HEAD;
    c.fillText(life.dev + '%', 300, y + 92);
    c.fillStyle = INK;
    c.font = '700 14px ' + F_BODY;
    c.fillText(DEV, 304, y + 120);
    c.font = '12.5px ' + F_BODY;
    c.fillStyle = MUTED;
    c.fillText('做过 ' + life.picks.length + ' 个抉择', 304, y + 142);
    c.fillText(FATE + '：', 304, y + 166);
    const fateH = wrap(c, life.fateText, 304, y + 186, 266, 18, 5);
    const mapBottom = y + 12 + Math.ceil(span / cols) * (cell + gap);
    y = Math.max(mapBottom, y + 186 + fateH) + 30;

    // 世界因我而变
    if (life.changes.length) {
      c.font = '12px ' + F_BODY;
      c.fillStyle = MUTED;
      c.fillText(GAME.changedMine || '因我而变', 30, y);
      c.font = '700 13.5px ' + F_BODY;
      c.fillStyle = '#2a7d84';
      y += 22 + wrap(c, life.changes.slice(0, 4).map((k) => JY.FLAGS[k] || k).join('；'), 30, y + 22, 540, 20, 3);
    }
    Ht = y + 76;

    // 页脚
    c.fillStyle = 'rgba(0,0,0,0.12)';
    c.fillRect(30, Ht - 62, Wd - 60, 1);
    c.fillStyle = INK;
    c.font = '700 15px ' + F_BODY;
    c.fillText(GAME.cardFooter || '', 30, Ht - 30);
    c.fillStyle = accent;
    c.font = '700 13px ' + F_MONO;
    c.textAlign = 'right';
    c.fillText(JY.siteLabel(), Wd - 30, Ht - 30);
    c.textAlign = 'left';
    target.width = Wd * S;
    target.height = Ht * S;
    target.getContext('2d').drawImage(canvas, 0, 0);
    return target;
  };

  /* 文字总结：复制、微博、QQ 空间都用这一段，末尾附链接 */
  JY.shareText = (life, line, withUrl) => {
    const age = life.to - life.born;
    const ch = life.changes.map((k) => JY.FLAGS[k] || k);
    const lines = [];
    if (line) lines.push('“' + line + '”');
    if (SH.summary) {
      lines.push(...SH.summary(life));
      const u = JY.siteUrl();
      lines.push((GAME.shareLead || '') + (withUrl !== false && u ? u : ''));
      return lines.join('\n');
    }
    lines.push('【' + TITLE + '】这一世，我重生成了《' + life.book + '》里的' + life.name + '。');
    lines.push(YEAR + ' ' + life.born + '—' + life.to + '，享年 ' + age + '，' + life.cause + '。');
    lines.push((GAME.canon || '原著') + '里的' + life.name + '：' + life.fateText);
    lines.push(ch.length ? '这一世我改了命：' + ch.slice(0, 3).join('；') + '。' : '这一世，我照着' + (GAME.canon || '原著') + '走完了。');
    lines.push('改命度 ' + life.dev + '%，做过 ' + life.picks.length + ' 个抉择。临终一句：“' + life.words + '”');
    const url = JY.siteUrl();
    lines.push((GAME.shareLead || '') + (withUrl !== false && url ? url : ''));
    return lines.join('\n');
  };
})();

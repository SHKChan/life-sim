#!/usr/bin/env node
/* 用无界面 Chrome 截图，检查界面。
 *   node share/tools/shot.js <游戏目录> <剧本> <输出.png> [宽,高]
 * 剧本：人物id-步数-主题[-阶段]
 *   guojing-4-dark        重生成郭靖，跳过 4 个抉择（每次选第一个选项），深色
 *   yangkang-80-light-end 一直跳到命终，关掉回顾，停在墓志页
 *   yangkang-80-dark-share 停在分享弹窗
 *   guojing-0-dark-wake   停在醒来页
 *   random-0-dark-wake    随机人生模式（如 1in1.4b）：投一次胎，停在出生页
 *   guojing-4-dark-peek   停在抉择时，把抉择框收起
 *   guojing-4-dark-menu   收起抉择框，再打开年度重心下拉
 *   guojing-4-dark-jump   收起抉择框，点简化框里的“详情↓”跳到完整的今年的重心（手机宽度）
 *   random-0-dark-home    停在游戏首页（看顶上的导航）
 *   guojing-4-dark-feedback 收起抉择框，打开问题反馈
 *   guojing-0-dark-run    不暂停，开 16× 让时间自己走（配合 SHOT_WAIT=毫秒 设定走多久，默认 7000）
 * 宽度小于 500 时用 390px 宽的 iframe 模拟手机（Chrome 无界面窗口最窄约 500px）。
 * 界面语言默认中文，SHOT_LANG=en|ja|es 截其他语言。
 * 会在游戏目录里生成临时文件 _shot.html / _phone.html，截完删除。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [game, spec, out, size = '1440,1000'] = process.argv.slice(2);
if (!game || !spec || !out) { console.error('用法：node share/tools/shot.js <游戏目录> <剧本> <输出.png> [宽,高]'); process.exit(2); }
const repo = path.join(__dirname, '..', '..');
const dir = path.join(repo, game);
const chromes = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].filter(Boolean);
const chrome = chromes.find((p) => fs.existsSync(p));
if (!chrome) { console.error('找不到 Chrome，请设置环境变量 CHROME'); process.exit(2); }

const driver = `<script>
(function () {
  const m = ${JSON.stringify(spec)}.split('-');
  const id = m[0], steps = Number(m[1] || 0), theme = m[2], stage = m[3];
  if (theme) document.documentElement.dataset.theme = theme;
  const click = (i) => { const el = document.getElementById(i); if (el) el.click(); };
  if (stage === 'home') return;
  click(id === 'random' ? 'h-random' : 'pick-' + id); // 随机人生模式的游戏用 random
  if (stage === 'wake') return;
  click('w-begin');
  if (stage === 'run') { click('c-s16'); return; }
  click('c-pause');
  for (let k = 0; k < steps; k++) {
    click('c-next');
    if (k < steps - 1) click('ch-0');
    if (document.getElementById('wd-0')) { click('wd-0'); break; }
  }
  if (stage === 'peek' || stage === 'menu' || stage === 'jump') click('d-peek');
  if (stage === 'jump') click('f-jump');
  if (stage === 'menu') click('f-open');
  if (stage === 'end' || stage === 'share') click('rv-close');
  if (stage === 'share') click('e-share');
  if (stage === 'feedback') { click('d-peek'); click('c-feedback'); }
})();
</script>`;
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
// 截图默认用中文（无界面 Chrome 的浏览器语言是英文）；SHOT_LANG=en 截英文界面
const lang = process.env.SHOT_LANG || 'zh';
html = html.replace('<script src="config.js"></script>', '<script>try { localStorage.clear(); localStorage.setItem("vibe.lang", ' + JSON.stringify(lang) + '); } catch (e) {}</script><script src="config.js"></script>');
html = html.replace('<script src="config.js"></script>', '<script src="config.js"></script><script>window.JY_CONFIG = Object.assign({}, window.JY_CONFIG, { fontCss: undefined });</script>');
html = html.replace('</body>', driver + '</body>');
const shotFile = path.join(dir, '_shot.html');
fs.writeFileSync(shotFile, html);

const [w, h] = size.split(',').map(Number);
let target = shotFile, win = size;
const phoneFile = path.join(dir, '_phone.html');
if (w < 500) {
  fs.writeFileSync(phoneFile, '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#444}iframe{width:' + w + 'px;height:' + h + 'px;border:0;display:block}</style><iframe src="_shot.html"></iframe>');
  target = phoneFile;
  win = Math.max(520, w) + ',' + h;
}
const prof = path.join(require('os').tmpdir(), 'jy-shot-profile');
try {
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=' + win, '--virtual-time-budget=' + (process.env.SHOT_WAIT || 7000),
    '--user-data-dir=' + prof, '--screenshot=' + path.resolve(out), 'file:///' + target.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 90000 });
} finally {
  fs.rmSync(shotFile, { force: true });
  fs.rmSync(phoneFile, { force: true });
}
console.log('已截图：' + path.resolve(out));

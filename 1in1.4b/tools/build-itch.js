#!/usr/bin/env node
/* 打包 itch.io 版（HTML5 游戏，上传 zip，index.html 在压缩包根目录）
 *   node 1in1.4b/tools/build-itch.js [--url=https://vibe-gamer.itch.io/1-in-1-4-billion]
 * 输出 dist/itch-1in1.4b/（可以直接用浏览器打开试玩）和 dist/1in1.4b-itch.zip（上传到 itch）。
 *
 * 和网站版的区别（都在生成的 config.js 里）：
 *   siteUrl     分享图上的二维码和网址、文字总结里的链接，换成 itch 页面（--url）
 *   langOpen    打开语言切换，页面上有“EN / 中文”按钮
 *   defaultLang 没选过语言时默认英文（GAME.langFiles 里没翻完的文件，剧情照旧是中文）
 * 不加载全站顶栏 /nav.js；页面标题、描述换成英文。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..');
const repo = path.join(dir, '..');
const urlArg = process.argv.slice(2).find((a) => a.startsWith('--url='));
const URL = urlArg ? urlArg.slice(6) : 'https://vibe-gamer.itch.io/1-in-1-4-billion';
const out = path.join(repo, 'dist', 'itch-1in1.4b');
const zipPath = path.join(repo, 'dist', '1in1.4b-itch.zip');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1]).filter((r) => !/^(https?:|\/)/.test(r));
const files = new Set();
for (const ref of refs) {
  if (ref === 'config.js') continue;
  const dst = ref.replace(/^\.\.\//, '');
  files.add([path.join(dir, ref), path.join(out, dst)]);
  html = html.split('"' + ref + '"').join('"' + dst + '"');
}
html = html.replace(/<!--[^>]*全站顶栏[^>]*-->\s*/, '').replace(/<script src="\/nav\.js"[^>]*><\/script>\s*/, '')
  .replace(/<html lang="[^"]*">/, '<html lang="en">')
  .replace(/<title>[^<]*<\/title>/, '<title>1 in 1.4 Billion · Live a random life in China</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Be born at random somewhere in China in 2026, weighted by real population data, and live a whole life: school, work, money, high-speed rail, family, old age.">');
for (const [src, dst] of files) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); }
// 翻译文件（i18n.js 动态载入）和图片
for (const extra of ['lang', 'fonts', 'assets']) {
  const src = path.join(dir, extra);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, extra), { recursive: true, filter: (p) => !/[\\/]tr([\\/]|$)/.test(p.slice(src.length)) });
}
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'config.js'), `/* itch.io 版的部署配置（由 tools/build-itch.js 生成） */
window.JY_CONFIG = {
  siteUrl: ${JSON.stringify(URL)},
  siteName: '1 in 1.4 Billion',
  fontCss: '',
  langOpen: true,
  defaultLang: 'en',
  homeUrl: 'https://www.vibe-game.com/',
  homeName: 'Vibe Game',
  hubUrl: '',
  hubName: '',
  feedbackRepo: 'SHKChan/life-sim',
  feedbackApi: '',
};
`);

// 打 zip（不依赖外部命令，Windows 上也能跑）
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const entries = [];
(function walk(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else entries.push(p); } })(out);
const parts = [], central = [];
let offset = 0;
for (const p of entries) {
  const name = Buffer.from(path.relative(out, p).split(path.sep).join('/'));
  const data = fs.readFileSync(p);
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
  local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
  parts.push(local, name, comp);
  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10);
  cen.writeUInt32LE(0, 12); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(data.length, 24);
  cen.writeUInt16LE(name.length, 28); cen.writeUInt32LE(offset, 42);
  central.push(cen, name);
  offset += 30 + name.length + comp.length;
}
const cdir = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(cdir.length, 12); end.writeUInt32LE(offset, 16);
fs.writeFileSync(zipPath, Buffer.concat([...parts, cdir, end]));
console.log('itch 版：dist/itch-1in1.4b/（' + entries.length + ' 个文件），压缩包 dist/1in1.4b-itch.zip（' + Math.round(fs.statSync(zipPath).size / 1024) + ' KB）');
console.log('分享链接和二维码：' + URL);

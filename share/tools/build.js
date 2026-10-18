#!/usr/bin/env node
/* 打包成纯静态站点：
 *   node share/tools/build.js                 打包全部游戏（含 game.js 的目录）
 *   node share/tools/build.js jianghuyimeng   只打包这一个
 * 输出 dist/：
 *   dist/index.html          游戏大厅（根目录 index.html）
 *   dist/share/...           共用代码
 *   dist/<游戏>/...          每个游戏自己的页面、设定、故事数据
 * css、js 引用会加上内容哈希作为版本号，浏览器和 CDN 不会读到旧文件。
 * config.js 不加版本号，上线后可以直接改。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repo = path.join(__dirname, '..', '..');
const dist = path.join(repo, 'dist');
const all = fs.readdirSync(repo).filter((d) => fs.existsSync(path.join(repo, d, 'game.js')) && fs.existsSync(path.join(repo, d, 'index.html')));
const games = process.argv.slice(2).length ? process.argv.slice(2) : all;
for (const g of games) if (!all.includes(g)) { console.error('找不到游戏目录：' + g); process.exit(2); }

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return fs.readFileSync(src);
}
// 把页面引用的本地 css/js 拷过去并加版本号
function buildPage(srcHtml, srcDir, outDir) {
  let html = fs.readFileSync(srcHtml, 'utf8');
  const refs = [...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1]).filter((r) => !/^https?:/.test(r)))];
  for (const ref of refs) {
    const buf = copyFile(path.join(srcDir, ref), path.join(outDir, ref));
    if (/(^|\/)config\.js$/.test(ref)) continue;
    html = html.split('"' + ref + '"').join('"' + ref + '?v=' + hash(buf) + '"');
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, path.basename(srcHtml)), html);
  return refs;
}

for (const g of games) {
  const refs = buildPage(path.join(repo, g, 'index.html'), path.join(repo, g), path.join(dist, g));
  for (const extra of ['fonts', 'assets']) {
    const src = path.join(repo, g, extra);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(dist, g, extra), { recursive: true });
  }
  console.log('  ' + g + '/：' + refs.length + ' 个文件');
}
if (fs.existsSync(path.join(repo, 'index.html'))) buildPage(path.join(repo, 'index.html'), repo, dist);
if (fs.existsSync(path.join(repo, 'share', 'fonts'))) fs.cpSync(path.join(repo, 'share', 'fonts'), path.join(dist, 'share', 'fonts'), { recursive: true });
// Cloudflare Pages / Workers 静态资源认这个文件（其他托管会忽略它）：缓存规则同 deploy/nginx.conf
fs.writeFileSync(path.join(dist, '_headers'), [
  '/*.html', '  Cache-Control: no-cache',
  '/', '  Cache-Control: no-cache',
  '/*/', '  Cache-Control: no-cache',
  '/*/config.js', '  Cache-Control: no-cache',
  '/share/*', '  Cache-Control: public, max-age=31536000, immutable',
  '/*/data/*', '  Cache-Control: public, max-age=31536000, immutable',
  '/*/game.js', '  Cache-Control: public, max-age=31536000, immutable',
  '',
].join('\n'));

let total = 0;
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const st = fs.statSync(p); if (st.isDirectory()) walk(p); else total += st.size; } })(dist);
console.log('已生成 dist/，共 ' + (total / 1024).toFixed(0) + ' KB。');

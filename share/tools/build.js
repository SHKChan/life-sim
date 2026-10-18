#!/usr/bin/env node
/* 打包成纯静态站点：
 *   node share/tools/build.js                 打包全部游戏（含 game.js 的目录）
 *   node share/tools/build.js jianghuyimeng   只打包这一个
 *   node share/tools/build.js --base=life-sim 放在子路径下（网址是 域名/life-sim/），文件输出到 dist/life-sim/
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
const out = path.join(repo, 'dist');
const baseArg = process.argv.slice(2).find((a) => a.startsWith('--base='));
const base = baseArg ? baseArg.slice(7).replace(/^\/+|\/+$/g, '') : '';
const dist = base ? path.join(out, base) : out;
const pre = base ? '/' + base : '';
const all = fs.readdirSync(repo).filter((d) => fs.existsSync(path.join(repo, d, 'game.js')) && fs.existsSync(path.join(repo, d, 'index.html')));
const named = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const games = named.length ? named : all;
for (const g of games) if (!all.includes(g)) { console.error('找不到游戏目录：' + g); process.exit(2); }

fs.rmSync(out, { recursive: true, force: true });
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
    // 翻译文件由 i18n.js 动态载入、沿用它的版本号，所以 i18n.js 的版本号把各游戏的 lang/ 目录也算进去
    const v = /(^|\/)i18n\.js$/.test(ref) ? hash(Buffer.concat([buf, langBuf()])) : hash(buf);
    html = html.split('"' + ref + '"').join('"' + ref + '?v=' + v + '"');
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, path.basename(srcHtml)), html);
  return refs;
}

// 所有游戏 lang/ 目录里文件的内容（算 i18n.js 的版本号）
function langBuf() {
  const bufs = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else bufs.push(fs.readFileSync(p)); } };
  all.forEach((g) => walk(path.join(repo, g, 'lang')));
  return Buffer.concat(bufs);
}

for (const g of games) {
  const refs = buildPage(path.join(repo, g, 'index.html'), path.join(repo, g), path.join(dist, g));
  for (const extra of ['fonts', 'assets', 'lang']) {
    const src = path.join(repo, g, extra);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(dist, g, extra), { recursive: true });
  }
  console.log('  ' + g + '/：' + refs.length + ' 个文件');
}
if (fs.existsSync(path.join(repo, 'index.html'))) buildPage(path.join(repo, 'index.html'), repo, dist);
if (fs.existsSync(path.join(repo, 'share', 'fonts'))) fs.cpSync(path.join(repo, 'share', 'fonts'), path.join(dist, 'share', 'fonts'), { recursive: true });
// Cloudflare Pages / Workers 静态资源认这个文件（其他托管会忽略它）：缓存规则同 deploy/nginx.conf
fs.writeFileSync(path.join(out, '_headers'), [
  pre + '/*.html', '  Cache-Control: no-cache',
  pre + '/', '  Cache-Control: no-cache',
  pre + '/*/', '  Cache-Control: no-cache',
  pre + '/*/config.js', '  Cache-Control: no-cache',
  pre + '/share/*', '  Cache-Control: public, max-age=31536000, immutable',
  pre + '/*/data/*', '  Cache-Control: public, max-age=31536000, immutable',
  pre + '/*/game.js', '  Cache-Control: public, max-age=31536000, immutable',
  '',
].join('\n'));

let total = 0;
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const st = fs.statSync(p); if (st.isDirectory()) walk(p); else total += st.size; } })(out);
console.log('已生成 dist/' + (base ? base + '/' : '') + '，共 ' + (total / 1024).toFixed(0) + ' KB。');

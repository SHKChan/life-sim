#!/usr/bin/env node
/* 剧情翻译：用“字符串对照表”从中文数据文件生成翻译版
 *   node share/tools/tr.js <游戏目录> <语言> <文件名…>        例：node share/tools/tr.js 1in1.4b en finance tech
 *   node share/tools/tr.js <游戏目录> <语言> --all             对照表目录里有的文件全部重新生成
 *   加 --fill：把还没翻译的中文字符串追加进对照表（值留空），方便接着翻
 *
 * 做法：中文数据文件（<游戏>/data/x.js）永远是唯一的源头。对照表 <游戏>/lang/<语言>/tr/x.json 是
 *   { "中文字符串（源码里引号中的原样内容）": "译文", ... }
 * 工具扫描源码里的字符串字面量（跳过注释、正则），在对照表里的就换成译文，生成 <游戏>/lang/<语言>/x.js。
 * 代码逻辑一字不改，所以中文改了剧情或数值，重跑这个工具就同步了；新出现的中文字符串会列出来等着翻。
 * 不翻译的内部键（属性名、重心名、记忆键里的中文值……）写进对照表的 "__keep" 数组。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const game = args[0], lang = args[1];
const fill = args.includes('--fill');
if (!game || !lang) { console.error('用法：node share/tools/tr.js <游戏目录> <语言> <文件名…>|--all [--fill]'); process.exit(2); }
const gdir = path.join(repo, game), trDir = path.join(gdir, 'lang', lang, 'tr');
let files = args.slice(2).filter((a) => !a.startsWith('--'));
if (args.includes('--all')) files = fs.existsSync(trDir) ? fs.readdirSync(trDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.slice(0, -5)) : [];
const CJK = /[㐀-鿿＀-￯　-〿]/;

// 扫描源码：返回 [{ start, end, q, body }]（字符串字面量，含引号的位置）
function scan(src) {
  const out = [];
  let i = 0, prev = '';
  const regexOk = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /\breturn$/.test(src.slice(Math.max(0, i - 7), i).trim());
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? src.length : i + 2; continue; }
    if (c === '\'' || c === '"' || c === '`') {
      const s = i; i++;
      while (i < src.length && src[i] !== c) { if (src[i] === '\\') i++; i++; }
      i++;
      out.push({ start: s, end: i, q: c, body: src.slice(s + 1, i - 1) });
      prev = c;
      continue;
    }
    if (c === '/' && regexOk()) {
      i++;
      let cls = false;
      while (i < src.length && (cls || src[i] !== '/')) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; }
      i++;
      while (/[a-z]/i.test(src[i] || '')) i++;
      prev = '/';
      continue;
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

let missingAll = 0;
for (const f of files) {
  const srcPath = path.join(gdir, 'data', f + '.js');
  const trPath = path.join(trDir, f + '.json');
  const src = fs.readFileSync(srcPath, 'utf8');
  const own = fs.existsSync(trPath) ? JSON.parse(fs.readFileSync(trPath, 'utf8')) : {};
  // _common.json：所有文件共用的词（城市、省份、专业、亲属称呼……），以它为准，保证各文件里拿来比较的值译法一致
  const commonPath = path.join(trDir, '_common.json');
  const common = fs.existsSync(commonPath) ? JSON.parse(fs.readFileSync(commonPath, 'utf8')) : {};
  const map = Object.assign({}, own, common);
  const keep = new Set((own.__keep || []).filter((k) => !(k in common)).concat(common.__keep || []));
  const lits = scan(src);
  let out = '', last = 0;
  const missing = [];
  for (const l of lits) {
    if (!CJK.test(l.body) || keep.has(l.body)) continue;
    const t = map[l.body];
    if (t == null || t === '') { if (!missing.includes(l.body)) missing.push(l.body); continue; }
    if (l.q === '`') throw new Error(f + '：模板字符串不支持翻译：' + l.body.slice(0, 40));
    const esc = t.replace(/\\/g, '\\\\').replace(new RegExp(l.q, 'g'), '\\' + l.q).replace(/\n/g, '\\n');
    out += src.slice(last, l.start) + l.q + esc + l.q;
    last = l.end;
  }
  out += src.slice(last);
  out = '/* 由 share/tools/tr.js 从 data/' + f + '.js 和 lang/' + lang + '/tr/' + f + '.json 生成，不要手改。 */\n' + out;
  fs.mkdirSync(path.dirname(path.join(gdir, 'lang', lang, f + '.js')), { recursive: true });
  fs.writeFileSync(path.join(gdir, 'lang', lang, f + '.js'), out);
  if (fill && missing.length) {
    missing.forEach((m) => { if (!(m in own)) own[m] = ''; });
    fs.mkdirSync(trDir, { recursive: true });
    fs.writeFileSync(trPath, JSON.stringify(own, null, 1) + '\n');
  }
  missingAll += missing.length;
  console.log(f + '：' + (lits.filter((l) => CJK.test(l.body) && !keep.has(l.body)).length - missing.length) + ' 条已翻译，' + missing.length + ' 条没翻译');
  missing.slice(0, 8).forEach((m) => console.log('   · ' + m.slice(0, 60)));
}
if (missingAll) process.exitCode = 1;

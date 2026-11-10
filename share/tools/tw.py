#!/usr/bin/env python3
"""繁体中文版：用 OpenCC（简体 → 台湾正体，含常用词转换 s2twp）从简体源文件生成。
  python3 share/tools/tw.py 1in1.4b
需要：pip install opencc-python-reimplemented

生成：
  <游戏>/lang/zh-TW/game.js       简体 game.js 的繁体版（整份重新定义 JY.GAME）
  <游戏>/lang/zh-TW/<文件>.js     data/ 下每个数据文件的繁体版
  share/lang.zh-TW.js             界面词表（ui.js、engine.js、sharecard.js 等里的中文 → 繁体），给 JY.t 用
做法同 tr.js：只换字符串字面量（跳过注释、正则），代码一字不改。
内部键（属性名、记录字段名、重心名、地区名、性别……）不转换：取 lang/en/tr/_common.json 的 __keep，
再加上闲笔的池子键（'focus:…'）。这些键显示时走 JY.t，词表里有它们的繁体。
简体改了剧情或界面文字，重跑一次即可。
"""
import json, os, re, sys
import opencc

CC = opencc.OpenCC('s2twp')
CJK = re.compile(r'[㐀-鿿]')
repo = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
game = sys.argv[1] if len(sys.argv) > 1 else '1in1.4b'
gdir = os.path.join(repo, game)
out_dir = os.path.join(gdir, 'lang', 'zh-TW')


def scan(src):
    """字符串字面量的位置：[(start, end, quote, body)]，跳过注释和正则（同 tr.js）"""
    out, i, prev = [], 0, ''
    n = len(src)
    while i < n:
        c, d = src[i], src[i + 1] if i + 1 < n else ''
        if c == '/' and d == '/':
            while i < n and src[i] != '\n':
                i += 1
            continue
        if c == '/' and d == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in '\'"`':
            s = i
            i += 1
            while i < n and src[i] != c:
                if src[i] == '\\':
                    i += 1
                i += 1
            i += 1
            out.append((s, i, c, src[s + 1:i - 1]))
            prev = c
            continue
        if c == '/' and (not prev or prev in '(,=:[!&|?{};+-*%<>~^' or src[max(0, i - 7):i].strip().endswith('return')):
            i += 1
            cls = False
            while i < n and (cls or src[i] != '/'):
                if src[i] == '\\':
                    i += 1
                elif src[i] == '[':
                    cls = True
                elif src[i] == ']':
                    cls = False
                i += 1
            i += 1
            while i < n and src[i].isalpha():
                i += 1
            prev = '/'
            continue
        if not c.isspace():
            prev = c
        i += 1
    return out


common = json.load(open(os.path.join(gdir, 'lang', 'en', 'tr', '_common.json'), encoding='utf-8'))
KEEP = set(common.get('__keep', []))


def keep(body):
    return body in KEEP or body.startswith('focus:')


def convert(src):
    lits, out, last = scan(src), [], 0
    for s, e, q, body in lits:
        if not CJK.search(body) or keep(body):
            continue
        t = CC.convert(body)
        if t == body:
            continue
        out.append(src[last:s] + q + t + q)
        last = e
    out.append(src[last:])
    return ''.join(out)


os.makedirs(out_dir, exist_ok=True)
head = '/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */\n'
files = ['game.js'] + ['data/' + f for f in sorted(os.listdir(os.path.join(gdir, 'data'))) if f.endswith('.js')]
for f in files:
    src = open(os.path.join(gdir, f), encoding='utf-8').read()
    dst = os.path.join(out_dir, os.path.basename(f))
    open(dst, 'w', encoding='utf-8', newline='').write(head + convert(src))
print('%s/lang/zh-TW/：%d 个文件' % (game, len(files)))

# 界面词表：共用代码和游戏设定里所有中文字符串，加上内部键（显示时走 JY.t）
dic = {}
for f in ['share/ui.js', 'share/engine.js', 'share/sharecard.js', 'share/lang.js', game + '/game.js']:
    src = open(os.path.join(repo, f), encoding='utf-8').read()
    for s, e, q, body in scan(src):
        if CJK.search(body):
            dic[body] = CC.convert(body)
for k in KEEP:
    if CJK.search(k):
        dic[k] = CC.convert(k)
# 重心说明（显示时走 JY.t(f.d)）也加进来
for s, e, q, body in scan(open(os.path.join(gdir, 'data', 'world.js'), encoding='utf-8').read()):
    if CJK.search(body) and len(body) < 80:
        dic.setdefault(body, CC.convert(body))
dic = {k: v for k, v in dic.items() if k != v}
js = ('/* 繁体中文界面词表，由 share/tools/tw.py 生成，不要手改。 */\n(function () {\n  \'use strict\';\n'
      '  const JY = window.JY;\n  if (!JY || !JY.addI18n) return;\n  JY.addI18n(\'zh-TW\', ' + json.dumps(dic, ensure_ascii=False, indent=0) + ');\n})();\n')
open(os.path.join(repo, 'share', 'lang.zh-TW.js'), 'w', encoding='utf-8').write(js)
print('share/lang.zh-TW.js：%d 条' % len(dic))

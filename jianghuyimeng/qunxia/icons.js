/* 群侠 · 像素图标和地图底图（全部用代码画，不用图片素材）
 * 图标：12×12 的点阵，一个字符一个像素，字母查调色板 PAL，“.”是透明。
 * 用法：页面里放 <canvas class="px qx-ic" data-icon="名字"></canvas>，ui.js 渲染后调用 QX.paintIcons(根元素)。
 * 名字：物品按类型（药、秘籍、杂、信物）或物品 id（信物各有各的样子），武功按类型（内功、拳掌、兵器、轻功），属性按属性名。
 */
(function () {
  'use strict';
  const QX = (window.QX = window.QX || {});
  const PAL = {
    k: '#2a2420', w: '#f2efe6', g: '#9aa3a6', d: '#5c6468', s: '#d9dde0', // 墨、白、灰、深灰、银
    r: '#c8463a', o: '#e08a3a', y: '#e8c45a', b: '#8a5a32', n: '#c99a62', // 红、橙、金、木、浅木
    e: '#4fae6a', t: '#3fa3a0', u: '#4a7ac8', p: '#9a6ac8', c: '#8fd8e8', // 绿、青、蓝、紫、冰
  };
  const ICONS = {
    // 物品类型
    药: ['....bb......', '...nnnn.....', '....bb......', '...eeee.....', '..eeeeee....', '.eeewweee...', '.eeewweee...', '.eeeeeeee...', '..eeeeee....', '...eeee.....', '............', '............'],
    秘籍: ['............', '.bbbbbbbbb..', '.bwwwwwwwb..', '.bwkkkkwwb..', '.bwwwwwwwb..', '.bwkkkkkwb..', '.bwwwwwwwb..', '.bwkkkwwwb..', '.bwwwwwwwb..', '.bbbbbbbbb..', '..bbbbbbbbb.', '............'],
    杂: ['............', '....bkkb....', '...bnnnnb...', '..bnnnnnnb..', '.bnnnbbnnnb.', '.bnnnbbnnnb.', '.bnnnnnnnnb.', '.bnnnnnnnnb.', '..bnnnnnnb..', '...bbbbbb...', '............', '............'],
    信物: ['.....y......', '....yyy.....', '...yyoyy....', '..yyoooyy...', '.yyoowooyy..', '..yyoooyy...', '...yyoyy....', '....yyy.....', '.....y......', '............', '............', '............'],
    卷轴: ['............', '.bb......bb.', '.bnwwwwwwnb.', '.bnwkkkkwnb.', '.bnwwwwwwnb.', '.bnwkkkwwnb.', '.bnwwwwwwnb.', '.bnwkkkkwnb.', '.bnwwwwwwnb.', '.bb......bb.', '............', '............'],
    剑: ['..........s.', '.........ss.', '........ss..', '.......ss...', '......ss....', '.....ss.....', '..y.ss......', '...yy.......', '...yby......', '..b..y......', '.b..........', '............'],
    刀: ['.........dd.', '........dssd', '.......dssd.', '......dssd..', '.....dssd...', '....dssd....', '..yydsd.....', '...yyd......', '...by.......', '..bb........', '.bb.........', '............'],
    杖: ['.........e..', '........ee..', '.......ee...', '......ee....', '.....ee.....', '....ee......', '...ee.......', '..ee........', '.ee.........', 'ee..........', '............', '............'],
    令: ['....rrrr....', '...rooyor...', '...royyor...', '....rrrr....', '...kkkkkk...', '...kyyyyk...', '...kyrryk...', '...kyrryk...', '...kyyyyk...', '...kkkkkk...', '............', '............'],
    膏: ['............', '...kkkkkk...', '...dddddd...', '..kkkkkkkk..', '..kggggggk..', '..kgkkkkgk..', '..kgkkkkgk..', '..kggggggk..', '..kkkkkkkk..', '............', '............', '............'],
    // 武功类型
    内功: ['....tttt....', '..tt....tt..', '.t...cc...t.', '.t..c..c..t.', 't..c.tt.c..t', 't..c.tt.c..t', 't...c..c...t', '.t...cc....t', '.t........t.', '..tt....tt..', '....tttt....', '............'],
    拳掌: ['............', '...n.n.n....', '...n.n.n.n..', '...n.n.n.n..', '...nnnnnnn..', '.n.nnnnnnn..', '.nnnnnnnnn..', '..nnnnnnnn..', '..nnnnnnn...', '...nnnnn....', '...nnnnn....', '............'],
    兵器: ['..........s.', '.........ss.', '........ss..', '.......ss...', '......ss....', '.....ss.....', '..y.ss......', '...yy.......', '...yby......', '..b..y......', '.b..........', '............'],
    轻功: ['.........ww.', '.......wwgw.', '......wwgw..', '.....wwgw...', '....wwgw....', '...wwgw.....', '..wwgw......', '..wgw.......', '.wgw........', '.ww.........', 'w...........', '............'],
    // 属性
    资质: ['............', '...yyyyyy...', '..yy....yy..', '.yy.kkkk.yy.', 'yy..kwwk..yy', 'yy..kwwk..yy', '.yy.kkkk.yy.', '..yy....yy..', '...yyyyyy...', '............', '............', '............'],
    根骨: ['............', '.ww......ww.', 'wwww....wwww', '.wwww..wwww.', '...wwwwww...', '....wwww....', '...wwwwww...', '.wwww..wwww.', 'wwww....wwww', '.ww......ww.', '............', '............'],
    内力: ['....uuuu....', '..uuccccuu..', '.uuccwwccuu.', '.ucccwwcccu.', 'uucccccccuu.', 'uucccccccuu.', '.ucccccccu..', '.uucccccuu..', '..uuuuuuu...', '....uuu.....', '............', '............'],
    攻击: ['............', '...r.r.r....', '...r.r.r.r..', '...r.r.r.r..', '...rrrrrrr..', '.r.rrrrrrr..', '.rrrrrrrrr..', '..rrrrrrrr..', '..rrrrrrr...', '...rrrrr....', '............', '............'],
    防御: ['............', '.dddddddddd.', '.dssssssssd.', '.dssyssyssd.', '.dsssyysssd.', '.dsssyysssd.', '..dssyysd...', '..dsssssd...', '...dsssd....', '....dsd.....', '.....d......', '............'],
    气血: ['............', '..rr...rr...', '.rrrr.rrrr..', 'rrwrrrrrrrr.', 'rrrrrrrrrrr.', 'rrrrrrrrrrr.', '.rrrrrrrrr..', '..rrrrrrr...', '...rrrrr....', '....rrr.....', '.....r......', '............'],
    历练: ['............', '.bb.........', 'bbbb........', 'bbbb..bb....', '.bb..bbbb...', '.....bbbb...', '......bb..bb', '.........bbb', '.........bbb', '..........b.', '............', '............'],
    战绩: ['s..........s', '.s........s.', '..s......s..', '...s....s...', '....s..s....', '.....ss.....', '.....ss.....', '....y..y....', '...y....y...', '..b......b..', '.b........b.', '............'],
    品德: ['.....k......', '.kkkkkkkkkk.', '.k...k....k.', 'yyy..k...yyy', 'yyy..k...yyy', '.....k......', '.....k......', '....kkk.....', '...kkkkk....', '............', '............', '............'],
    声望: ['.k..........', '.krrrrrrr...', '.krrrrrrrr..', '.krryyrrrrr.', '.krrrrrrrr..', '.krrrrrrr...', '.k..........', '.k..........', '.k..........', '.k..........', 'kkk.........', '............'],
    银两: ['............', '............', '..s......s..', '.sss....sss.', '.sswssssssd.', '..sswsssssd.', '..ssssssssd.', '...dsssssd..', '....dddddd..', '............', '............', '............'],
    门派: ['.....r......', '....rrr.....', '...kkkkk....', '..kkkkkkk...', '.kkkkkkkkk..', '..nnnnnnn...', '..nkkkkkn...', '..nk.k.kn...', '..nkkkkkn...', '..nnnnnnn...', 'bbbbbbbbbbb.', '............'],
  };
  // 信物各有各的样子：按名字里的字挑
  const relicShape = (it) => {
    const n = it.name || '';
    if (/剑/.test(n)) return '剑';
    if (/刀/.test(n)) return '刀';
    if (/棒|杖/.test(n)) return '杖';
    if (/令/.test(n)) return '令';
    if (/膏|药/.test(n)) return '膏';
    if (/经|谱|书|心法|篇|诀/.test(n)) return '卷轴';
    return '信物';
  };
  QX.iconOf = (kind, id) => {
    if (id && QX.ITEMS && QX.ITEMS[id]) { const it = QX.ITEMS[id]; return it.relic || it.type === '信物' ? relicShape(it) : ICONS[it.type] ? it.type : '杂'; }
    if (id && QX.ARTS && QX.ARTS[id]) { const A = QX.ARTS[id]; return /剑/.test(A.name) && A.type === '兵器' ? '剑' : /刀/.test(A.name) ? '刀' : /棒|杖/.test(A.name) ? '杖' : A.type; }
    return kind;
  };
  QX.iconHtml = (kind, id, cls) => '<canvas class="px qx-ic' + (cls ? ' ' + cls : '') + '" data-icon="' + QX.iconOf(kind, id) + '" width="12" height="12" aria-hidden="true"></canvas>';
  function draw(cv, name) {
    const rows = ICONS[name] || ICONS.杂;
    const c = cv.getContext('2d');
    cv.width = 12; cv.height = 12;
    c.clearRect(0, 0, 12, 12);
    rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const col = PAL[row[x]]; if (col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); } } });
  }
  QX.paintIcons = (root) => { (root || document).querySelectorAll('canvas[data-icon]').forEach((cv) => draw(cv, cv.dataset.icon)); };

  /* ---------- 地图底图 ----------
   * 一张 160×100 的像素舆图：西北是沙漠，北边是草原，西南是群山，中原是平原，东边和东南是海，
   * 黄河、长江两条河自西向东。地点的位置（LOCS 的 x、y，百分比）画在它上面。 */
  QX.drawMap = (cv) => {
    const W = 160, H = 100;
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    // 海岸线：x 超过它就是海（随 y 变化，东南向内收）
    const coast = (y) => 140 - (y > 60 ? (y - 60) * 0.6 : 0) + Math.sin(y / 6) * 3;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let col;
        if (x > coast(y)) col = (x + y) % 7 === 0 ? '#5d8fb5' : '#4f7fa6';                 // 海
        else if (x < 38 && y < 52) col = (x * 3 + y) % 11 === 0 ? '#d9bf82' : '#ccb071';    // 西域沙漠
        else if (y < 24) col = (x + y * 2) % 9 === 0 ? '#9fbf73' : '#93b366';              // 北方草原
        else if (x < 62 && y > 52) col = (x + y) % 5 === 0 ? '#6f8c5a' : '#7c9a63';         // 西南山地
        else col = (x * 2 + y) % 13 === 0 ? '#a9b57d' : '#b3be86';                         // 中原、江南平原
        c.fillStyle = col; c.fillRect(x, y, 1, 1);
      }
    }
    // 山：西边的高原和西南的群山，画成小三角
    const peak = (x, y, s, col, snow) => { for (let i = 0; i < s; i++) px(x - i, y + i, i * 2 + 1, 1, col); if (snow) px(x - 1, y, 3, 1, '#f2efe6'); };
    for (let i = 0; i < 26; i++) { const x = 6 + rnd() * 54, y = 30 + rnd() * 62; if (x < coast(y) - 10) peak(x, y, 3 + Math.floor(rnd() * 3), '#5a6b4a', rnd() < 0.3); }
    for (let i = 0; i < 8; i++) peak(70 + rnd() * 30, 40 + rnd() * 12, 3, '#6e7f58', false); // 中原的嵩山、武当一带
    // 黄河、长江
    const river = (pts, col) => { for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let k = 0; k <= n; k++) px(x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n, 2, 1, col); } };
    river([[30, 30], [52, 26], [62, 18], [76, 22], [84, 34], [104, 36], [138, 30]], '#6a9fc8');
    river([[22, 70], [46, 66], [70, 61], [96, 63], [118, 61], [138, 62]], '#6a9fc8');
    // 长城：北边一道锯齿
    for (let x = 52; x < 122; x += 2) px(x, 20 + Math.round(Math.sin(x / 7) * 2), 2, 1, x % 4 ? '#8a7a64' : '#6f604c');
    // 海上的小岛
    [[149, 72], [152, 6], [146, 40]].forEach(([x, y]) => { px(x - 2, y, 5, 2, '#c9b77e'); px(x - 1, y - 1, 3, 1, '#7c9a63'); });
  };
})();

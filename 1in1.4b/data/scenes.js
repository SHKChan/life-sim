/* 十四亿分之一 · 现代场景（像素画，240×76，地面在 y=62）
 * 每个场景是 (c, r) => {...}：c 是画布，r 是按地点和年份播种的随机数。天空、人物、夜晚压暗由 share/pixel.js 负责。
 * 人物画在 x≈96–132，前景的车、树、杂物避开这一段。 */
(function () {
  'use strict';
  const JY = window.JY;
  if (!JY.addScenes) return;
  const { W, GROUND: G, px, shade, ridge, peaks, ground, water, tree, pine } = JY.pxKit;

  // 天空已经画好：读左上角的颜色判断是不是夜里（夜里窗户亮灯）
  const isNight = (c) => { try { const d = c.getImageData(1, 1, 1, 1).data; return d[0] + d[1] + d[2] < 120; } catch (e) { return false; } };

  // 楼：x、宽、高、墙色；窗户按格子画，夜里随机亮灯
  function tower(c, r, x, w, h, col, o) {
    o = o || {};
    const top = G - h;
    px(c, x, top, w, h, col);
    px(c, x, top, w, 1, shade(col, 1.2));
    px(c, x + w - 1, top, 1, h, shade(col, 0.8));
    const night = o.night, cw = o.cw || 2, ch = o.ch || 2, gx = o.gx || 4, gy = o.gy || 4;
    for (let y = top + 3; y < G - 4; y += gy) {
      for (let k = x + 2; k < x + w - cw - 1; k += gx) {
        let wc = o.win || shade(col, 0.72);
        if (night) wc = r() < 0.45 ? (r() < 0.8 ? '#f4d27a' : '#cfe3f0') : shade(col, 0.5);
        else if (o.glass && r() < 0.25) wc = '#d9eef7';
        px(c, k, y, cw, ch, wc);
      }
    }
  }
  // 平顶小楼（自建房）
  function block(c, x, w, h, wall, o) {
    o = o || {};
    px(c, x, G - h, w, h, wall);
    px(c, x - 1, G - h - 1, w + 2, 1, o.roof || shade(wall, 0.75));
    for (let y = G - h + 3; y < G - 5; y += 5) for (let k = x + 2; k < x + w - 3; k += 6) px(c, k, y, 3, 2, o.win || '#4a5560');
    px(c, x + Math.floor(w / 2) - 1, G - 5, 3, 5, o.door || shade(wall, 0.45));
  }
  function pole(c, x, h) { px(c, x, G - h, 1, h, '#5a4a3a'); px(c, x - 2, G - h + 1, 5, 1, '#5a4a3a'); }
  function wires(c, x1, x2, y) { for (let x = x1; x < x2; x++) px(c, x, y + Math.round(Math.sin((x - x1) / (x2 - x1) * Math.PI) * 2), 1, 1, 'rgba(40,40,40,.55)'); }
  function car(c, x, col, y) {
    y = y == null ? G + 2 : y;
    px(c, x, y, 14, 4, col); px(c, x + 3, y - 3, 8, 3, col); px(c, x + 4, y - 2, 6, 2, '#bcd6e2');
    px(c, x + 2, y + 4, 3, 2, '#1e1e1e'); px(c, x + 9, y + 4, 3, 2, '#1e1e1e');
  }
  function truck(c, x, col) {
    px(c, x, G - 9, 22, 9, col); px(c, x + 22, G - 6, 8, 6, shade(col, 0.8)); px(c, x + 24, G - 5, 4, 2, '#bcd6e2');
    px(c, x + 3, G, 4, 2, '#1e1e1e'); px(c, x + 22, G, 4, 2, '#1e1e1e');
  }
  function road(c, col) {
    px(c, 0, G + 1, W, 7, col || '#4a4d52');
    for (let x = 4; x < W; x += 16) px(c, x, G + 4, 7, 1, '#d8d4c4');
  }
  function bush(c, x, w, col) { px(c, x, G - 3, w, 3, col); px(c, x + 1, G - 4, w - 2, 1, col); }

  JY.addScenes({
    // 北方平原村子：红砖平顶房、玉米地、电线杆
    cn_village_n: (c, r) => {
      ridge(c, r, 52, 4, '#8a9a6a', 10);
      ground(c, '#8a7a50');
      for (let x = 0; x < 80; x += 4) { const h = 6 + (x % 8 ? 1 : 0); px(c, x, G - h, 2, h, '#9aa04a'); px(c, x - 1, G - h + 2, 1, 2, '#b8a84a'); }
      block(c, 150, 26, 12, '#b5583f', { roof: '#7a3a2a', win: '#3a4048', door: '#5a3a2a' });
      block(c, 184, 22, 11, '#a85038', { roof: '#6a3424', win: '#3a4048' });
      px(c, 150, G - 20, 26, 1, '#7a3a2a'); px(c, 152, G - 19, 6, 7, '#c9c0a8'); // 屋顶晾的玉米
      px(c, 212, G - 4, 26, 4, '#c97a3a'); // 一堆玉米
      pole(c, 90, 30); pole(c, 140, 30); wires(c, 90, 140, G - 29);
      tree(c, 224, '#5f7a3a');
    },
    // 南方山区村子：白墙黑瓦、自建小楼、梯田、竹林
    cn_village_s: (c, r) => {
      peaks(c, r, '#5f7f5a', null, 4, 30);
      for (let i = 0; i < 5; i++) px(c, 150 + i * 6, 30 + i * 6, 90 - i * 6, 2, '#7fa05a'); // 梯田
      for (let i = 0; i < 5; i++) px(c, 150 + i * 6, 32 + i * 6, 90 - i * 6, 4, '#5f804a');
      ground(c, '#5a7040');
      block(c, 20, 22, 18, '#ecebe3', { roof: '#2b2f33', win: '#3a4a58' });
      block(c, 48, 16, 12, '#e4e0d4', { roof: '#2b2f33' });
      for (let i = 0; i < 9; i++) { const x = 160 + i * 9 + r() * 3; px(c, x, G - 22, 1, 22, '#4a7a3a'); px(c, x - 2, G - 22 + (i % 3) * 3, 4, 2, '#6a9a4a'); px(c, x - 1, G - 15, 3, 2, '#5a8a40'); }
    },
    // 西部高原：土黄色、平顶土房、远山、羊
    cn_village_w: (c, r) => {
      peaks(c, r, '#9a8a7a', '#eef0f2', 3, 30);
      ridge(c, r, 50, 8, '#b89a6a', 8);
      ground(c, '#c4a46c');
      block(c, 22, 24, 10, '#c9a46a', { roof: '#a07a4a', win: '#5a4a3a', door: '#6a4a2a' });
      block(c, 52, 18, 9, '#d0ac72', { roof: '#a07a4a', win: '#5a4a3a' });
      px(c, 30, G - 18, 1, 8, '#7a5a3a'); for (let i = 0; i < 4; i++) px(c, 31, G - 18 + i * 2, 4, 1, ['#d84a3a', '#3a7ac8', '#e8c84a', '#ffffff'][i]); // 彩色布条
      for (let i = 0; i < 6; i++) { const x = 160 + r() * 70; px(c, x, G - 3, 5, 3, '#f1ede2'); px(c, x + 4, G - 4, 2, 2, '#f1ede2'); px(c, x + 1, G, 1, 1, '#3a3a3a'); }
    },
    // 县城：一条主街、六七层新楼、门面招牌色块
    cn_county: (c, r) => {
      ridge(c, r, 40, 8, '#7a8a7a', 8);
      const night = isNight(c);
      tower(c, r, 4, 30, 30, '#d8cfc0', { night });
      tower(c, r, 38, 26, 26, '#c9d0d4', { night });
      tower(c, r, 150, 28, 28, '#e0d6c6', { night });
      tower(c, r, 182, 24, 32, '#cdbfae', { night });
      tower(c, r, 210, 28, 24, '#d6d8d0', { night });
      const signs = ['#c8463a', '#e8b03a', '#3a7ac8', '#3a9a6a', '#d0473a'];
      [[4, 30], [38, 26], [150, 28], [182, 24], [210, 28]].forEach(([x, w], i) => { px(c, x + 1, G - 9, w - 2, 3, signs[(i + Math.floor(r() * 5)) % 5]); px(c, x + 3, G - 5, w - 6, 5, '#5a5048'); });
      ground(c, '#8a8478');
      road(c, '#5a5a5e');
      bush(c, 70, 10, '#5a7a4a');
    },
    // 地级市：十几层的楼、马路、红绿灯
    cn_city: (c, r) => {
      const night = isNight(c);
      tower(c, r, 0, 22, 34, '#9aa4ae', { night });
      tower(c, r, 24, 30, 44, '#c8c0b0', { night });
      tower(c, r, 58, 20, 30, '#b0b8c0', { night });
      tower(c, r, 150, 26, 40, '#d0c8b8', { night });
      tower(c, r, 180, 22, 48, '#a8b4c0', { night, glass: true });
      tower(c, r, 206, 34, 32, '#c4bcae', { night });
      ground(c, '#7a7a78');
      road(c);
      px(c, 140, G - 18, 1, 18, '#3a3a3a'); px(c, 138, G - 22, 5, 9, '#2a2a2a'); // 红绿灯
      px(c, 139, G - 21, 3, 2, '#d84a3a'); px(c, 139, G - 18, 3, 2, '#5a4a2a'); px(c, 139, G - 15, 3, 2, r() < 0.5 ? '#4ac86a' : '#2a4a2a');
      car(c, 160, '#c8463a'); car(c, 200, '#e8e4dc');
      tree(c, 82, '#4a7a4a');
    },
    // 大城市：密集高楼、玻璃幕墙、夜里亮灯
    cn_metro: (c, r) => {
      const night = isNight(c);
      for (let x = 0; x < W; x += 9) px(c, x, G - 30 - r() * 12, 8, 60, shade('#7a8aa0', 0.9 + r() * 0.15)); // 远处的楼
      tower(c, r, 4, 24, 52, '#5a7088', { night, glass: true, cw: 3, gx: 4 });
      tower(c, r, 30, 18, 58, '#8aa0b8', { night, glass: true });
      px(c, 37, 0, 2, 6, '#5a6a7a'); // 楼顶天线
      tower(c, r, 52, 26, 44, '#6a7e94', { night, glass: true });
      tower(c, r, 146, 20, 50, '#7a90a8', { night, glass: true });
      tower(c, r, 168, 30, 60, '#4e6680', { night, glass: true, cw: 3, gx: 5 });
      px(c, 168, G - 62, 30, 2, '#3a4a5a');
      tower(c, r, 200, 22, 46, '#8a9cb0', { night, glass: true });
      tower(c, r, 224, 16, 38, '#6a7a8c', { night });
      ground(c, '#6a6c70');
      road(c, '#3e4146');
      car(c, 148, '#2a2a2e'); car(c, 186, night ? '#e8c84a' : '#f0f0f0'); car(c, 22, '#5a7aa8');
    },
    // 学校：教学楼、旗杆、操场跑道
    cn_school: (c, r) => {
      ridge(c, r, 40, 6, '#7a907a', 8);
      tower(c, r, 140, 96, 26, '#e8e2d4', { gx: 6, cw: 4, ch: 3, gy: 6, win: '#7a9ab8' });
      px(c, 140, G - 27, 96, 2, '#c8463a'); // 红色檐口
      px(c, 182, G - 10, 12, 10, '#6a5040');
      px(c, 60, G - 40, 1, 40, '#c8c8c8'); px(c, 61, G - 40, 9, 6, '#d84a3a'); // 旗杆
      ground(c, '#7a9a5a');
      px(c, 0, G + 2, W, 6, '#b8523e'); // 跑道
      for (let x = 0; x < W; x += 2) px(c, x, G + 4, 1, 1, '#e8e0d0');
      px(c, 6, G - 12, 1, 12, '#888'); px(c, 2, G - 14, 9, 4, '#e0e0e0'); // 篮球架
    },
    // 大学：图书馆、林荫道
    cn_campus: (c, r) => {
      ridge(c, r, 42, 6, '#6a8a7a', 8);
      px(c, 150, G - 30, 70, 30, '#b8a890'); // 图书馆
      px(c, 146, G - 32, 78, 3, '#8a7a64');
      for (let k = 154; k < 216; k += 8) px(c, k, G - 26, 3, 22, '#e8e0cc'); // 柱子
      px(c, 158, G - 24, 54, 16, 'rgba(90,120,150,.55)');
      px(c, 175, G - 6, 20, 6, '#6a5a48');
      ground(c, '#6a8a50');
      px(c, 0, G + 3, W, 4, '#b8ae98'); // 林荫道
      [8, 30, 52, 74, 230].forEach((x) => tree(c, x, '#3f7a44'));
      px(c, 84, G - 3, 10, 2, '#7a5a3a'); px(c, 85, G - 1, 1, 1, '#4a3a2a'); px(c, 92, G - 1, 1, 1, '#4a3a2a'); // 长椅
    },
    // 工厂：厂房、烟囱、货车
    cn_factory: (c, r) => {
      ridge(c, r, 44, 6, '#7a8078', 8);
      for (let i = 0; i < 3; i++) { const x = 140 + i * 32; px(c, x, G - 22, 30, 22, '#9aa0a4'); for (let k = 0; k < 6; k++) px(c, x + k * 5, G - 26 + (k % 2 ? 0 : 0), 5, 4 - (k % 2 ? 0 : 2), '#7a8288'); px(c, x + 3, G - 16, 24, 4, '#6a8aa8'); }
      px(c, 228, G - 50, 6, 50, '#a8a098'); px(c, 228, G - 44, 6, 2, '#c8463a'); px(c, 228, G - 36, 6, 2, '#c8463a');
      for (let i = 0; i < 4; i++) px(c, 226 - i * 3 + r() * 2, G - 54 - i * 4, 6 + i, 3, 'rgba(220,220,220,.6)'); // 烟
      px(c, 0, G - 14, 70, 14, '#b0aca4'); px(c, 4, G - 10, 62, 6, '#7a8a9a');
      ground(c, '#7a7870');
      truck(c, 34, '#3a6aa8');
    },
    // 写字楼近景：玻璃格子窗
    cn_office: (c, r) => {
      const night = isNight(c);
      px(c, 0, 0, 90, G, '#5a7088');
      for (let y = 2; y < G - 6; y += 6) for (let x = 2; x < 88; x += 8) px(c, x, y, 7, 5, night ? (r() < 0.55 ? '#f4d27a' : '#2e3a4a') : (r() < 0.3 ? '#d9eef7' : '#8aa8c4'));
      px(c, 150, 6, 90, G - 6, '#6a8098');
      for (let y = 9; y < G - 6; y += 6) for (let x = 152; x < 238; x += 8) px(c, x, y, 7, 5, night ? (r() < 0.5 ? '#f4d27a' : '#2e3a4a') : (r() < 0.3 ? '#d9eef7' : '#9ab4cc'));
      px(c, 160, G - 10, 24, 10, '#2a3440'); px(c, 171, G - 10, 1, 10, '#8a9aaa'); // 大门
      ground(c, '#8a8c90');
      px(c, 0, G + 1, W, 1, '#a8aaae');
      bush(c, 92, 8, '#4a7a4a'); bush(c, 138, 8, '#4a7a4a');
    },
    // 医院：住院楼、抽象红十字色块、救护车
    cn_hospital: (c, r) => {
      ridge(c, r, 40, 6, '#7a8a8a', 8);
      const night = isNight(c);
      tower(c, r, 146, 70, 44, '#eef0f0', { night, win: '#8ab4c8', gx: 5, cw: 3 });
      px(c, 175, G - 42, 12, 4, '#3a9a6a'); px(c, 179, G - 46, 4, 12, '#3a9a6a'); // 绿十字（红十字是受保护的标志，不用）
      px(c, 170, G - 10, 22, 10, '#6aa0b8');
      tower(c, r, 4, 40, 30, '#e4e8e8', { night, win: '#8ab4c8' });
      ground(c, '#8a8c88');
      road(c, '#5a5c60');
      px(c, 52, G - 6, 22, 9, '#f4f4f4'); px(c, 74, G - 3, 6, 6, '#f4f4f4'); px(c, 75, G - 2, 3, 2, '#bcd6e2'); // 救护车
      px(c, 52, G - 2, 22, 1, '#d0473a'); px(c, 60, G - 8, 4, 2, r() < 0.5 ? '#d84a3a' : '#3a7ac8');
      px(c, 55, G + 3, 3, 2, '#1e1e1e'); px(c, 70, G + 3, 3, 2, '#1e1e1e');
    },
    // 小区楼下：住宅楼、单元门、电动车、晾衣服
    cn_home: (c, r) => {
      const night = isNight(c);
      tower(c, r, 0, 60, 46, '#d8c8b0', { night, gx: 6, cw: 4, ch: 3, gy: 7 });
      for (let y = G - 40; y < G - 8; y += 7) px(c, 0, y + 4, 60, 1, '#b8a890'); // 阳台
      px(c, 10, G - 26, 1, 4, '#888'); px(c, 12, G - 26, 4, 3, '#4a7ac8'); px(c, 17, G - 26, 3, 4, '#e8e0d0'); // 晾衣服
      px(c, 24, G - 9, 10, 9, '#5a4a40'); px(c, 26, G - 8, 6, 5, '#7a9ab8'); // 单元门
      tower(c, r, 160, 80, 40, '#cfc0aa', { night, gx: 6, cw: 4, ch: 3, gy: 7 });
      px(c, 196, G - 9, 10, 9, '#5a4a40');
      ground(c, '#8a8478');
      px(c, 0, G, W, 2, '#a8a090');
      // 电动车
      px(c, 66, G - 4, 12, 2, '#3a3a3a'); px(c, 66, G - 7, 3, 3, '#d0473a'); px(c, 75, G - 8, 2, 4, '#3a3a3a');
      px(c, 65, G - 2, 3, 2, '#1e1e1e'); px(c, 76, G - 2, 3, 2, '#1e1e1e');
      tree(c, 140, '#4a7a44'); bush(c, 84, 8, '#5a8a4a');
    },
    // 海边城市：海、栈桥、远处楼群
    cn_coast: (c, r) => {
      for (let x = 140; x < W; x += 8) px(c, x, 26 - r() * 12, 7, 20, shade('#8a9cb0', 0.85 + r() * 0.2)); // 远处楼群
      water(c, r, 40, '#3a7a98');
      px(c, 0, G - 2, W, 4, '#3a7a98');
      px(c, 0, G + 1, 90, H - G, '#d8c49a'); px(c, 150, G + 1, 90, H - G, '#d8c49a'); // 沙滩
      px(c, 90, G + 1, 60, H - G, '#3a7a98');
      px(c, 20, G - 1, 70, 2, '#8a6a4a'); for (let k = 22; k < 90; k += 10) px(c, k, G + 1, 1, 5, '#6a4a2a'); // 栈桥
      for (let i = 0; i < 12; i++) px(c, r() * W, 42 + r() * 18, 5, 1, '#8ac0d8');
      px(c, 200, G - 12, 1, 12, '#7a5a3a'); px(c, 194, G - 14, 13, 3, '#d0473a'); // 遮阳伞
    },
    // 高速公路：护栏、远山、车
    cn_road: (c, r) => {
      peaks(c, r, '#6a7a8a', null, 4, 24);
      ridge(c, r, 50, 6, '#6a8a5a', 6);
      ground(c, '#6a7a4a');
      px(c, 0, G - 1, W, 9, '#55585e');
      for (let x = 2; x < W; x += 14) px(c, x, G + 3, 7, 1, '#e8e4d4');
      px(c, 0, G - 4, W, 1, '#c8c8c8'); for (let x = 0; x < W; x += 8) px(c, x, G - 4, 1, 3, '#a8a8a8'); // 护栏
      px(c, 180, G - 24, 1, 20, '#7a7a7a'); px(c, 168, G - 30, 26, 8, '#3a8a5a'); // 绿色路牌（无字）
      px(c, 170, G - 28, 10, 1, '#e8f0e8'); px(c, 170, G - 25, 16, 1, '#e8f0e8');
      car(c, 20, '#c8463a', G); car(c, 190, '#4a6aa8', G + 2); truck(c, 50, '#e0a03a');
    },
  });
})();

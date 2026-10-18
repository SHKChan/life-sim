/* 共用像素场景与头像（游戏可用 JY.addScenes 增加场景）
 * 场景是程序画的：天空、远景、地标、地面、人物。同一地点同一年画出来总是一样的。
 */
(function () {
  'use strict';
  const JY = (window.JY = window.JY || {});
  const W = 240, H = 76, GROUND = 62;

  function rng(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const SKIES = {
    night: { top: '#121a33', bottom: '#2d3a5e', light: 0.55 },
    dusk: { top: '#3b2a4f', bottom: '#d07a52', light: 0.8 },
    day: { top: '#5d8fc4', bottom: '#b9d4e3', light: 1 },
    dawn: { top: '#4b5d8a', bottom: '#e9b38a', light: 0.85 },
  };

  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

  function sky(c, r, kind) {
    const s = SKIES[kind];
    for (let y = 0; y < GROUND; y++) {
      const t = y / GROUND;
      const a = parseInt(s.top.slice(1), 16), b = parseInt(s.bottom.slice(1), 16);
      const mix = (sh) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
      px(c, 0, y, W, 1, 'rgb(' + mix(16) + ',' + mix(8) + ',' + mix(0) + ')');
    }
    if (kind === 'night') {
      for (let i = 0; i < 40; i++) px(c, r() * W, r() * 34, 1, 1, r() < 0.3 ? '#fff6c8' : '#c9d3ef');
      const mx = 30 + r() * 170;
      px(c, mx, 8, 6, 6, '#f3e7b0'); px(c, mx + 1, 7, 4, 8, '#f3e7b0'); px(c, mx - 1, 9, 8, 4, '#f3e7b0');
      px(c, mx + 3, 9, 2, 2, '#d8c98a');
    } else {
      const sx = 20 + r() * 190, sy = kind === 'day' ? 8 : 26;
      const sc = kind === 'day' ? '#fff2b0' : '#ffb36b';
      px(c, sx, sy, 7, 7, sc); px(c, sx + 1, sy - 1, 5, 9, sc); px(c, sx - 1, sy + 1, 9, 5, sc);
    }
    const n = 2 + Math.floor(r() * 3);
    const cc = kind === 'night' ? '#3d4a6e' : kind === 'day' ? '#eef3f6' : '#b98a8a';
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = 4 + r() * 20, w = 14 + r() * 22;
      px(c, x, y + 2, w, 3, cc); px(c, x + 3, y, w - 8, 3, cc); px(c, x + 6, y - 2, w * 0.4, 2, cc);
    }
  }

  function ridge(c, r, base, amp, col, step) {
    let h = base - r() * amp;
    for (let x = 0; x < W; x += step) {
      h += (r() - 0.5) * amp * 0.6;
      h = Math.max(base - amp, Math.min(base, h));
      px(c, x, h, step, GROUND - h, col);
    }
  }
  function peaks(c, r, col, snow, n, minH) {
    for (let i = 0; i < n; i++) {
      const cx = r() * W, hgt = minH + r() * (GROUND - minH - 4), w = 18 + r() * 30;
      for (let y = 0; y < hgt; y++) {
        const half = (w / 2) * (y / hgt);
        px(c, cx - half, GROUND - hgt + y, half * 2 + 1, 1, col);
        if (snow && y < hgt * 0.22) px(c, cx - half, GROUND - hgt + y, half * 2 + 1, 1, snow);
      }
    }
  }
  function ground(c, col, kind) {
    px(c, 0, GROUND, W, H - GROUND, col);
    px(c, 0, GROUND, W, 1, shade(col, 1.25));
    for (let x = 0; x < W; x += 7) px(c, x + ((x * 13) % 5), GROUND + 3 + ((x * 7) % 9), 2, 1, shade(col, kind === 'snow' ? 0.9 : 0.8));
  }
  function water(c, r, y0, col) {
    px(c, 0, y0, W, GROUND - y0 + 4, col);
    for (let i = 0; i < 30; i++) px(c, r() * W, y0 + 1 + r() * (GROUND - y0), 3 + r() * 5, 1, shade(col, 1.3));
  }
  function tree(c, x, col, trunk) {
    px(c, x + 3, GROUND - 7, 2, 7, trunk || '#4a3424');
    px(c, x, GROUND - 14, 8, 7, col); px(c, x + 1, GROUND - 16, 6, 2, col); px(c, x - 1, GROUND - 11, 10, 3, col);
  }
  function pine(c, x, col) {
    px(c, x + 3, GROUND - 4, 2, 4, '#3b2a1c');
    for (let i = 0; i < 4; i++) px(c, x + 3 - i, GROUND - 16 + i * 3, 2 + i * 2, 3, col);
  }
  function house(c, x, w, wall, roof) {
    const h = 10;
    px(c, x, GROUND - h, w, h, wall);
    for (let i = 0; i < 5; i++) px(c, x - 2 + i, GROUND - h - 1 - i, w + 4 - i * 2, 1, roof);
    px(c, x - 3, GROUND - h - 1, 2, 1, roof); px(c, x + w + 1, GROUND - h - 1, 2, 1, roof);
    px(c, x + Math.floor(w / 2) - 1, GROUND - 6, 3, 6, shade(wall, 0.45));
    if (w > 12) px(c, x + 2, GROUND - 8, 3, 2, shade(wall, 0.6));
  }
  function hall(c, x, w, wall, roof, tiers) {
    for (let t = 0; t < (tiers || 1); t++) {
      const ww = w - t * 10, xx = x + t * 5, base = GROUND - t * 9;
      px(c, xx, base - 9, ww, 9, wall);
      for (let i = 0; i < 4; i++) px(c, xx - 4 + i, base - 10 - i, ww + 8 - i * 2, 1, roof);
      px(c, xx - 5, base - 11, 2, 1, roof); px(c, xx + ww + 3, base - 11, 2, 1, roof);
      for (let k = xx + 3; k < xx + ww - 2; k += 5) px(c, k, base - 8, 1, 8, shade(wall, 0.7));
    }
  }
  function yurt(c, x, col) {
    for (let i = 0; i < 6; i++) px(c, x + 6 - i * 1.5, GROUND - 12 + i, 4 + i * 3, 1, col);
    px(c, x - 2, GROUND - 6, 20, 6, col);
    px(c, x + 6, GROUND - 5, 4, 5, '#5b3a22');
    px(c, x - 2, GROUND - 6, 20, 1, shade(col, 0.7));
  }
  function wall(c, x, w, col) {
    px(c, x, GROUND - 18, w, 18, col);
    for (let k = x; k < x + w; k += 4) px(c, k, GROUND - 20, 2, 2, col);
    px(c, x, GROUND - 10, w, 1, shade(col, 0.8));
  }

  const SCENES = {
    village: (c, r) => { ridge(c, r, 46, 12, '#5d7a62', 6); ground(c, '#5a6e3b'); house(c, 26, 18, '#c8b48a', '#4b3a2e'); house(c, 70, 14, '#b9a37a', '#4b3a2e'); tree(c, 112, '#3f6e3c'); tree(c, 190, '#4a7a44'); px(c, 150, GROUND - 6, 1, 6, '#6b5135'); px(c, 140, GROUND - 6, 22, 1, '#6b5135'); },
    grassland: (c, r) => { ridge(c, r, 50, 8, '#6f8f5c', 8); ground(c, '#7a9a4e'); yurt(c, 30, '#e8e1cf'); yurt(c, 80, '#ddd3bb'); for (let i = 0; i < 6; i++) { const x = 140 + r() * 90; px(c, x, GROUND - 3, 5, 3, '#f1ede2'); px(c, x + 4, GROUND - 4, 2, 2, '#f1ede2'); } },
    palace: (c, r) => { ridge(c, r, 48, 6, '#58607a', 6); ground(c, '#7d6b55'); hall(c, 40, 70, '#a8392f', '#2f3a3f', 3); hall(c, 140, 40, '#a8392f', '#2f3a3f', 2); px(c, 0, GROUND - 6, W, 6, '#9b3d33'); px(c, 0, GROUND - 7, W, 1, '#2f3a3f'); },
    watertown: (c, r) => { ridge(c, r, 44, 8, '#6d8a8a', 6); water(c, r, 52, '#3f6f80'); ground(c, '#56635b'); house(c, 14, 20, '#ecebe3', '#2b2f33'); house(c, 44, 16, '#ecebe3', '#2b2f33'); house(c, 170, 22, '#ecebe3', '#2b2f33'); for (let i = 0; i < 9; i++) px(c, 100 + i, GROUND - 4 - Math.round(Math.sin(i / 8 * Math.PI) * 6), 30 - i * 2, 2, '#b8b2a2'); px(c, 104, GROUND - 3, 22, 3, '#3f6f80'); },
    town: (c, r) => { peaks(c, r, '#6a6f7a', null, 4, 18); ground(c, '#8a7a5c'); wall(c, 0, 90, '#8c8170'); px(c, 34, GROUND - 12, 12, 12, '#3a2a20'); house(c, 120, 18, '#b9a37a', '#3a3530'); house(c, 160, 22, '#c4ad80', '#3a3530'); house(c, 200, 16, '#b9a37a', '#3a3530'); },
    peach: (c, r) => { water(c, r, 46, '#3e7a8f'); ground(c, '#6f8a4e'); for (let i = 0; i < 9; i++) tree(c, 6 + i * 26 + r() * 6, i % 2 ? '#e79ab0' : '#f2b7c6', '#5b3a2e'); for (let i = 0; i < 26; i++) px(c, r() * W, GROUND + 1 + r() * 12, 1, 1, '#f6c4d2'); },
    lake: (c, r) => { ridge(c, r, 44, 10, '#5f7f86', 6); water(c, r, 48, '#4b8296'); ground(c, '#5c6e4a'); hall(c, 150, 30, '#c9b896', '#3a3530', 1); px(c, 120, GROUND - 2, 30, 2, '#8a7a5c'); },
    sea: (c, r) => { water(c, r, 40, '#2f6a86'); px(c, 0, GROUND + 2, W, H - GROUND, '#2f6a86'); for (let i = 0; i < 20; i++) px(c, r() * W, GROUND + 3 + r() * 10, 6, 1, '#6fa4be'); const x = 120 + r() * 60; px(c, x, 50, 30, 5, '#5b3a22'); px(c, x + 13, 28, 2, 22, '#5b3a22'); px(c, x + 4, 30, 10, 16, '#e8e1cf'); px(c, x + 16, 32, 8, 12, '#e8e1cf'); },
    peaks: (c, r) => { peaks(c, r, '#5c6a7a', '#e9eef2', 5, 26); peaks(c, r, '#47525f', '#dfe6ec', 3, 34); ground(c, '#5a5f55'); pine(c, 30, '#2f5440'); pine(c, 190, '#2f5440'); pine(c, 206, '#365c47'); },
    waterfall: (c, r) => { ridge(c, r, 40, 6, '#4f6a5a', 6); px(c, 90, 14, 50, GROUND - 14, '#56645a'); px(c, 108, 14, 10, GROUND - 14, '#d8ecf2'); px(c, 110, 14, 2, GROUND - 14, '#ffffff'); ground(c, '#4e6a48'); water(c, r, GROUND - 1, '#4b8296'); hall(c, 170, 26, '#bfa880', '#3a3530', 1); pine(c, 40, '#2f5440'); },
    temple: (c, r) => { peaks(c, r, '#5f6d64', null, 4, 20); ground(c, '#7a6e5a'); hall(c, 70, 90, '#b9472f', '#2b3a3a', 2); for (let i = 0; i < 4; i++) px(c, 100 - i * 3, GROUND - 2 + 0, 40 + i * 6, 1, '#9a8d76'); for (let i = 0; i < 5; i++) px(c, 200 - i, GROUND - 26 + i * 5, 8 + i * 2, 4, i % 2 ? '#6b5b48' : '#3a3530'); pine(c, 30, '#2f5440'); },
    tomb: (c, r) => { peaks(c, r, '#4c5a50', null, 3, 30); px(c, 70, 30, 100, GROUND - 30, '#5d6358'); px(c, 104, 40, 30, GROUND - 40, '#3a3d38'); px(c, 106, 42, 26, GROUND - 42, '#2a2c28'); px(c, 118, 42, 1, GROUND - 42, '#3a3d38'); ground(c, '#4b5a42'); pine(c, 40, '#2a4a38'); pine(c, 54, '#2f5440'); pine(c, 186, '#2a4a38'); },
    citywall: (c, r) => { ridge(c, r, 48, 6, '#6d7268', 6); ground(c, '#7d6e55'); wall(c, 0, W, '#8a8272'); hall(c, 96, 46, '#a8392f', '#2f3a3f', 1); px(c, 112, GROUND - 12, 14, 12, '#2c2220'); for (let k = 20; k < W; k += 50) { px(c, k, GROUND - 32, 1, 12, '#4a3a2a'); px(c, k + 1, GROUND - 32, 7, 5, '#c9463a'); } },
    valley: (c, r) => { peaks(c, r, '#4f6a5c', null, 5, 30); ground(c, '#5f7d48'); const cols = ['#e86a8a', '#f2c14e', '#d6e1f2', '#e48ad0']; for (let i = 0; i < 70; i++) px(c, r() * W, GROUND + 1 + r() * 12, 1, 1, cols[i % 4]); for (let i = 0; i < 14; i++) px(c, r() * W, GROUND - 2 - r() * 4, 1, 1, cols[i % 4]); },
    cliff: (c, r) => { px(c, 0, 8, 80, GROUND - 8, '#4f544e'); px(c, 180, 18, 60, GROUND - 18, '#5a5f58'); peaks(c, r, '#3f4a44', null, 2, 34); ground(c, '#4f5a44'); px(c, 54, GROUND - 14, 1, 14, '#8f969a'); px(c, 52, GROUND - 14, 5, 1, '#8f969a'); pine(c, 200, '#2a4a38'); },
    desert: (c, r) => { ridge(c, r, 50, 10, '#c9a066', 10); ground(c, '#d6b276'); px(c, 150, GROUND - 16, 40, 16, '#c79a62'); px(c, 160, GROUND - 24, 20, 8, '#c79a62'); px(c, 164, GROUND - 28, 12, 4, '#c79a62'); px(c, 168, GROUND - 32, 4, 4, '#3f8a8a'); },
    river: (c, r) => { ridge(c, r, 42, 8, '#7a8a6a', 8); water(c, r, 46, '#7a6a48'); ground(c, '#6f6448'); const x = 80 + r() * 60; px(c, x, 52, 26, 3, '#5b3a22'); px(c, x + 2, 49, 6, 3, '#3a2a20'); px(c, x + 12, 40, 1, 12, '#3a2a20'); },
    icefire: (c, r) => { px(c, 0, 30, W, GROUND - 30, '#c9e2ea'); for (let y = 0; y < 34; y++) { const half = y * 1.1; px(c, 170 - half, 22 + y, half * 2, 1, y < 4 ? '#ff7a3a' : '#4a3a3a'); } px(c, 168, 10, 4, 12, '#ff9a4a'); px(c, 166, 4, 8, 6, '#70605a'); ground(c, '#e6f1f4', 'snow'); px(c, 30, GROUND - 8, 18, 8, '#9fc4d0'); },
    road: (c, r) => { ridge(c, r, 46, 10, '#6a7a5e', 6); ground(c, '#6f7a4a'); for (let y = GROUND; y < H; y++) { const w = 6 + (y - GROUND) * 4; px(c, 120 - w / 2, y, w, 1, '#a08a62'); } tree(c, 40, '#3f6e3c'); tree(c, 190, '#4a7a44'); px(c, 160, GROUND - 10, 1, 10, '#5b3a22'); px(c, 157, GROUND - 10, 8, 3, '#8a6a42'); },
  };

  JY.addScenes = (o) => { Object.assign(SCENES, o); };
  JY.px = px;
  JY.pxShade = shade;
  // 给各游戏自己画场景用的小工具（JY.addScenes 里用）
  JY.pxKit = { W, H, GROUND, px, shade, rng, ridge, peaks, ground, water, tree, pine, house, hall, wall };

  const DEFAULT_LOOK = { 男: { hair: 'topknot', hairColor: '#241a14', robe: '#6a6f7a' }, 女: { hair: 'bun', hairColor: '#241a14', robe: '#9a6a7a' } };
  function lookOf(id) {
    const c = JY.byId[id];
    if (!c) return DEFAULT_LOOK['男'];
    return Object.assign({}, DEFAULT_LOOK[c.sex] || DEFAULT_LOOK['男'], c.look || {});
  }

  function sprite(c, x, look, age) {
    const skin = look.skin || '#e9c49a';
    let hair = look.hairColor || '#241a14';
    if (age >= 62) hair = '#d9d6cf'; else if (age >= 50) hair = '#8d8780';
    const robe = look.robe || '#6a6f7a', acc = look.accent || shade(robe, 0.7);
    if (age < 3) { // 襁褓
      px(c, x, GROUND - 5, 5, 5, '#e8dcc0'); px(c, x + 1, GROUND - 7, 3, 3, skin); return;
    }
    const s = age < 8 ? 0.62 : age < 14 ? 0.8 : 1;
    const H0 = Math.round(16 * s), hw = 5, bodyH = Math.round(7 * s), legH = Math.max(2, Math.round(3 * s));
    const top = GROUND - H0;
    // 腿与衣
    px(c, x + 1, GROUND - legH, 1, legH, '#2a2420'); px(c, x + 4, GROUND - legH, 1, legH, '#2a2420');
    px(c, x, top + 5, 6, bodyH, robe); px(c, x - 1, top + 6, 1, bodyH - 2, robe); px(c, x + 6, top + 6, 1, bodyH - 2, robe);
    px(c, x + 2, top + 5, 2, 1, acc); px(c, x, top + 5 + Math.floor(bodyH / 2), 6, 1, acc);
    // 头
    px(c, x + 1, top, 4, 5, skin);
    px(c, x + 2, top + 2, 1, 1, '#2a2020'); px(c, x + 4, top + 2, 1, 1, '#2a2020');
    const h = look.hair;
    if (h === 'bald') { px(c, x + 1, top, 4, 1, shade(skin, 0.9)); return; }
    px(c, x + 1, top - 1, 4, 2, hair); px(c, x, top, 1, 3, hair); px(c, x + 5, top, 1, 2, hair);
    if (h === 'topknot') px(c, x + 2, top - 3, 2, 2, hair);
    else if (h === 'bun') { px(c, x + 4, top - 3, 3, 3, hair); px(c, x, top + 1, 1, 4, hair); }
    else if (h === 'twinbun') { px(c, x, top - 3, 2, 2, hair); px(c, x + 4, top - 3, 2, 2, hair); }
    else if (h === 'long') { px(c, x, top, 1, 8, hair); px(c, x + 5, top, 1, 8, hair); }
    else if (h === 'braid') { px(c, x + 5, top + 1, 1, 7, hair); }
    else if (h === 'ponytail') { px(c, x + 6, top, 1, 1, hair); px(c, x + 6, top + 1, 2, 4, hair); }
    // short：短发，只画基础的一层
    else if (h === 'cap') { px(c, x, top - 2, 6, 2, look.accent || '#2b2b2b'); }
    else if (h === 'veil') { px(c, x, top - 1, 6, 7, look.accent || '#e8e6e0'); px(c, x + 1, top, 4, 5, skin); px(c, x + 2, top + 2, 1, 1, '#2a2020'); px(c, x + 4, top + 2, 1, 1, '#2a2020'); }
  }

  /* 画场景：opts = { loc, year, me, age, party: [id], partyAges: [age] } */
  JY.drawScene = (canvas, opts) => {
    const c = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    c.imageSmoothingEnabled = false;
    const loc = JY.LOCS[opts.loc] || { scene: 'road' };
    const r = rng(opts.loc + ':' + opts.year);
    const kinds = ['day', 'dusk', 'night', 'day', 'dawn'];
    const kind = kinds[Math.floor(r() * kinds.length)];
    sky(c, r, kind);
    (SCENES[loc.scene] || SCENES.road)(c, r);
    // 人物
    const ids = [opts.me].concat(opts.party || []);
    const startX = 108 - (ids.length - 1) * 6;
    ids.forEach((id, i) => {
      const age = i === 0 ? opts.age : (opts.partyAges ? opts.partyAges[i - 1] : 30);
      sprite(c, startX + i * 12, lookOf(id), age);
    });
    // 夜晚压暗
    const light = SKIES[kind].light;
    if (light < 1) { c.fillStyle = 'rgba(10,14,30,' + (1 - light) * 0.6 + ')'; c.fillRect(0, GROUND - 30, W, H - GROUND + 30); }
    return kind;
  };

  /* 头像：20×24 像素 */
  JY.drawPortrait = (canvas, id, age) => {
    const c = canvas.getContext('2d');
    canvas.width = 20; canvas.height = 24;
    c.imageSmoothingEnabled = false;
    const look = lookOf(id);
    const skin = look.skin || '#e9c49a';
    let hair = look.hairColor || '#241a14';
    if (age >= 62) hair = '#d9d6cf'; else if (age >= 50) hair = '#8d8780';
    const robe = look.robe || '#6a6f7a';
    px(c, 0, 0, 20, 24, look.bg || '#c7d8d6');
    for (let i = 0; i < 24; i += 3) px(c, 0, i, 20, 1, shade(look.bg || '#c7d8d6', 0.95));
    // 身
    px(c, 3, 18, 14, 6, robe); px(c, 8, 18, 4, 3, shade(robe, 0.7)); px(c, 9, 18, 2, 6, look.accent || shade(robe, 0.6));
    // 脸
    px(c, 6, 7, 8, 10, skin); px(c, 7, 17, 6, 1, skin); px(c, 5, 10, 1, 3, skin); px(c, 14, 10, 1, 3, skin);
    px(c, 7, 11, 2, 1, '#2a2020'); px(c, 11, 11, 2, 1, '#2a2020'); px(c, 9, 14, 2, 1, '#b5735f');
    if (age < 12) px(c, 7, 13, 1, 1, '#e8a08a'), px(c, 12, 13, 1, 1, '#e8a08a');
    const h = look.hair;
    if (h === 'bald') { px(c, 6, 6, 8, 2, shade(skin, 0.92)); px(c, 8, 7, 1, 1, '#c99a7a'); px(c, 11, 7, 1, 1, '#c99a7a'); return; }
    px(c, 5, 5, 10, 3, hair); px(c, 5, 7, 1, 5, hair); px(c, 14, 7, 1, 5, hair); px(c, 6, 8, 3, 1, hair);
    if (h === 'topknot') { px(c, 8, 2, 4, 3, hair); px(c, 8, 4, 4, 1, look.accent || '#c9a45c'); }
    else if (h === 'bun') { px(c, 12, 2, 5, 5, hair); px(c, 4, 7, 2, 9, hair); px(c, 14, 3, 2, 1, look.accent || '#d8c070'); }
    else if (h === 'twinbun') { px(c, 3, 3, 4, 4, hair); px(c, 13, 3, 4, 4, hair); }
    else if (h === 'long') { px(c, 4, 7, 2, 12, hair); px(c, 14, 7, 2, 12, hair); }
    else if (h === 'braid') { px(c, 14, 8, 2, 12, hair); }
    else if (h === 'ponytail') { px(c, 14, 4, 3, 3, hair); px(c, 15, 7, 3, 9, hair); }
    else if (h === 'cap') { px(c, 4, 3, 12, 4, look.accent || '#2b2b2b'); px(c, 3, 6, 14, 1, look.accent || '#2b2b2b'); }
    else if (h === 'veil') { px(c, 4, 4, 12, 3, look.accent || '#e8e6e0'); px(c, 4, 6, 2, 12, look.accent || '#e8e6e0'); px(c, 14, 6, 2, 12, look.accent || '#e8e6e0'); }
  };
})();

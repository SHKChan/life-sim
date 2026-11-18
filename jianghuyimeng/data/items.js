/* 江湖一梦 · 武功和信物
 * JY.ITEMS：{ <id>: { t, kind: '武功'|'兵器'|'秘籍', d, has: (g) => 布尔 } }
 * has 只读已有的记录：改命标记、这一世的 info（武学、武功、兵器、秘籍、身份、门派）、师承关系、人物和年龄，不改任何已有节点的 fx。
 * 用处：
 *   - 名帖和醒来页的“身上的本事”卡，列出此刻有的东西；
 *   - 给 11 个已有抉择各加一个“专属选项”（cond 里读 has），选了有后果；
 *   - 命终时记进图鉴（album.items），墓志页和首页都能看。
 * 跨世的东西（玄铁重剑、淑女剑、兵法册子……）读改命标记，所以这一世带走、毁掉、送人的，下一世的人拿不拿得到，会跟着变。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const G = JY.GAME;

  // g.info 同一个键后写的会盖掉先写的（“武功”先是蛤蟆功，后来是黯然销魂掌）。这里只加一份历史（L.infoHist），学过的武功、读过的秘籍不会因为被盖掉就不算。
  // 兵器看此刻手里有什么（送人、熔掉就没了），所以只读现在的 info。
  const gg = JY.engine.G;
  const origInfo = gg.info;
  gg.info = function (k, v) {
    const { L } = JY.engine.get();
    if (L && v) {
      const h = (L.infoHist = L.infoHist || {});
      const list = (h[k] = h[k] || []);
      if (list.indexOf(v) < 0) list.push(v);
    }
    return origInfo.call(this, k, v);
  };
  const info = (k) => { const { L } = JY.engine.get(); return (L && L.info && L.info[k]) || ''; };
  const infoEver = (k) => { const { L } = JY.engine.get(); return info(k) + ' ' + ((L && L.infoHist && L.infoHist[k]) || []).join(' '); };
  const infoHas = (words, ...keys) => keys.some((k) => { const text = k === '兵器' ? info(k) : infoEver(k); return words.some((w) => text.indexOf(w) >= 0); });

  JY.ITEMS = {
    xianglong: { t: '降龙十八掌', kind: '武功', d: '洪七公的绝学，刚猛无俦，招招留有余力。',
      has: (g) => (g.isMe('guojing') && g.age >= 18 && !g.f('jingNoXianglong')) || infoHas(['降龙'], '武功', '武学') },
    goubang: { t: '打狗棒法', kind: '武功', d: '丐帮历代帮主的镇帮武功，一个“缠”字使得出神入化。',
      has: (g) => (g.isMe('huangrong') && g.age >= 15 && !!g.knows('hongqigong')) || infoHas(['打狗'], '武功', '武学') || info('身份').indexOf('丐帮帮主') >= 0 },
    kongming: { t: '空明拳·双手互搏', kind: '武功', d: '周伯通在山洞里琢磨出来的功夫，左手画方，右手画圆。',
      has: (g) => g.isMe('guojing') && g.age >= 18 && !!g.knows('zhoubotong') },
    jiuyin: { t: '九阴真经', kind: '秘籍', d: '天下武学的总纲，上卷讲内功，下卷讲功夫。',
      has: (g) => (g.isMe('guojing') && g.age >= 18 && !g.recall('noJiuyin')) || (g.isMe('huangrong') && g.age >= 15) || infoHas(['九阴真经'], '秘籍', '武学', '武功') },
    jiuyang: { t: '九阳神功', kind: '武功', d: '藏在《楞伽经》夹缝里的内功，遇强则强，百毒不侵。',
      has: (g) => (g.isMe('zhangwuji') && g.age >= 15 && !g.f('wujiNoJiuyang')) || infoHas(['九阳'], '武学', '武功') },
    qiankun: { t: '乾坤大挪移', kind: '武功', d: '明教的镇教神功，七层心法，把敌人的劲道挪向别处。',
      has: (g) => (g.isMe('zhangwuji') && g.age >= 20 && !g.f('mingjiaoCrushed')) || infoHas(['乾坤'], '武学', '武功') },
    taiji: { t: '太极拳剑', kind: '武功', d: '张三丰晚年创出的功夫，以柔克刚，后发先至。',
      has: () => infoHas(['太极'], '武学', '武功') },
    qishang: { t: '七伤拳', kind: '武功', d: '崆峒派的绝学，伤人先伤己，谢逊练到了第七层。',
      has: () => infoHas(['七伤拳'], '武学', '武功') },
    hama: { t: '蛤蟆功', kind: '武功', d: '西毒欧阳锋的看家功夫，劲力从背脊直贯双臂。',
      has: () => infoHas(['蛤蟆功'], '武学', '武功') },
    anran: { t: '黯然销魂掌', kind: '武功', d: '心里越难过，掌力越强。杨过在十六年的等待里悟出来的。',
      has: () => infoHas(['黯然'], '武学', '武功') },
    yunv: { t: '玉女心经', kind: '武功', d: '古墓派的内功心法，要心如止水才练得成。',
      has: (g) => (g.isMe('xiaolongnv') && g.age >= 10) || infoHas(['玉女心经'], '武学', '武功') },
    yangjia: { t: '杨家枪法', kind: '武功', d: '杨再兴传下来的枪法，铁枪一抖，枪花不落。',
      has: (g) => (g.isMe('munianci') && g.age >= 8) || (g.isMe('yangkang') && (g.f('yangkangTurned') || g.f('tiexinLives'))) || infoHas(['杨家枪'], '武学', '武功') },
    xuantie: { t: '玄铁重剑', kind: '兵器', d: '独孤求败留下的重剑，大巧不工，重剑无锋。',
      has: (g) => infoHas(['玄铁'], '兵器') || (g.isMe('guojing') && g.age >= 56 && !g.f('jingStayMongol') && !g.f('yangKeepsSword') && !g.f('noBladeSecrets')) },
    yitian: { t: '倚天剑', kind: '兵器', d: '熔了玄铁重剑和郭靖留下的剑铸成，削铁如泥。',
      has: () => infoHas(['倚天'], '兵器') },
    shunv: { t: '淑女剑', kind: '兵器', d: '郭芙的佩剑，剑身轻，拔得出，砍得下去。',
      has: (g) => (g.isMe('guofu') && g.age >= 14 && !g.f('gfSwordXiang')) || (g.isMe('guoxiang') && g.f('gfSwordXiang')) },
    jinzhen: { t: '三枚金针', kind: '兵器', d: '杨过送给郭襄的信物，答应替她做三件事。',
      has: (g) => g.isMe('guoxiang') && g.age >= 16 && !g.f('gxNoMeet') },
    wumu: { t: '武穆遗书', kind: '秘籍', d: '岳武穆的兵法，守城用兵都在里面。',
      has: () => infoHas(['武穆'], '秘籍') },
    bingfa: { t: '守城兵法册', kind: '秘籍', d: '黄蓉把襄阳守城的法子写成的小册子，交给了郭襄。',
      has: (g) => g.f('rongManual') },
    yishu: { t: '汝阳王府旧事', kind: '秘籍', d: '赵敏压在箱底的一本书，没有给任何人看。',
      has: (g) => g.isMe('zhaomin') && g.f('zhaominMemoir') && !g.f('zhaoBurnedMemoir') },
    yijing: { t: '医书手稿', kind: '秘籍', d: '张无忌把一辈子的医方写成的书，里面一个字也没提武功。',
      has: (g) => g.f('wujiMedicalBook') },
  };
  const ITEM_IDS = Object.keys(JY.ITEMS);
  JY.itemsOf = (g) => ITEM_IDS.filter((id) => { try { return !!JY.ITEMS[id].has(g); } catch (e) { return false; } });
  const has = (id) => (g) => { try { return !!JY.ITEMS[id].has(g); } catch (e) { return false; } };

  /* ---------- 给已有抉择加专属选项 ---------- */
  const patch = (nodeId, choice) => {
    for (const c of JY.CHARS) {
      if (!c.arc) continue;
      const n = c.arc.nodes.find((x) => x.id === nodeId);
      if (n && n.choices) { n.choices.push(choice); return; }
    }
  };
  patch('gj_arm', { t: '用降龙十八掌震飞淑女剑，掌力收在半途', dev: 30, check: ['武学', 70], cond: has('xianglong'),
    fx: (g) => { g.set('guofuGentle'); g.set('yangArm'); g.info('武学', '降龙十八掌，收放自如'); g.stat('声望', 3); },
    res: '你一掌拍出，劲到半途硬生生收住。淑女剑断成两截，芙儿被震得坐在地上，一根头发也没少。',
    fail: { fx: (g) => g.stat('心境', -10), res: '你收得慢了半分。', dev: 3 } });
  patch('gj_samarkand', { t: '用降龙十八掌拦在城门口，逼大汗收回屠城令', dev: 40, check: ['武学', 85], cond: has('xianglong'),
    fx: (g) => { g.info('身份', '撒麻尔罕城门前拦住大军的人'); g.stat('声望', 10); g.stat('正邪', 10); },
    res: '你一个人站在城门前，十八掌打翻了冲在最前面的一队骑兵。大汗没有说话，半晌，挥了挥手。',
    fail: { fx: (g) => { g.stat('根骨', -12); g.stat('心境', -6); }, res: '你拦住了一队，没拦住第二队。', dev: 5 } });
  patch('hr_arm', { t: '用打狗棒法的“缠”字诀卷走淑女剑', dev: 30, check: ['悟性', 70], cond: has('goubang'),
    fx: (g) => { g.set('guofuGentle'); g.set('yangArm'); g.info('武学', '打狗棒法，缠字诀'); g.stat('声望', 3); },
    res: '竹棒一抖，淑女剑已经被卷出了三丈远。芙儿愣在那里，过儿的手臂还在。',
    fail: { fx: (g) => g.stat('心境', -12), res: '你的棒子晚了一瞬。', dev: 3 } });
  patch('hr_gaibang', { t: '亲自下场，用打狗棒法压服两位不服的长老', dev: 15, cond: has('goubang'),
    fx: (g) => { g.remember('stillChief'); g.info('身份', '不肯放权的老帮主'); g.stat('声望', 4); },
    res: '你一根竹棒打翻了两个，剩下的人再没有说话。你知道，这是做给他们看的，不是给你自己。' });
  patch('yg_menge', { t: '提着玄铁重剑单骑冲阵，直取蒙哥', dev: 25, check: ['武学', 85], cond: has('xuantie'),
    fx: (g) => { g.kill('menge', '在襄阳城下被杨过单骑冲阵斩杀'); g.info('兵器', '玄铁重剑（染过血）'); g.stat('声望', 25); g.stat('根骨', -6); },
    res: '重剑一挥，挡在前面的亲兵连人带马被扫开。你冲到金帐前，蒙哥还没来得及拔刀。',
    fail: { fx: (g) => { g.stat('根骨', -15); g.kill('menge', '在襄阳城下被杨过飞石击毙', true); }, res: '你冲到一半，被一排箭挡了回来。后来，你还是用一块石头了结了他。', dev: 0 } });
  patch('zw_wanan', { t: '用乾坤大挪移，把塔里的人一个个“挪”出来', dev: 25, check: ['悟性', 70], cond: has('qiankun'),
    fx: (g) => { g.set('miejueLives'); g.info('武学', '乾坤大挪移（七层）'); g.stat('声望', 8); },
    res: '你把守塔武士的劲道挪向了彼此，一个个撞在墙上。灭绝师太站在栏杆上，被你隔空一带，稳稳落了地。',
    fail: { fx: (g) => g.stat('根骨', -10), res: '塔太窄，你的劲道挪不开。', dev: 5 } });
  patch('zw_ban', { t: '以九阳神功独自守住山门，不让官兵上山', dev: 20, check: ['根骨', 70], cond: has('jiuyang'),
    fx: (g) => { g.set('mingjiaoPardoned'); g.stat('声望', 8); g.stat('根骨', -5); },
    res: '你在山门前站了三天三夜，官兵的刀砍在你身上，像砍在石头上。第四天，朱元璋派人来谈。',
    fail: { fx: (g) => { g.stat('根骨', -15); g.stat('心境', -8); }, res: '你撑到第二天，倒在了山门前。', dev: 5 } });
  patch('gx_jinlun', { t: '袖里留一枚金针，趁他得意，射他的眼睛', dev: 20, check: ['武学', 50], cond: has('jinzhen'),
    fx: (g) => { g.info('身份', '用金针射伤金轮法王的小姑娘'); g.stat('声望', 6); },
    res: '金针没入他的左眼。他吼了一声，松开了手。你从他腋下滚出去，一口气跑出了二十里。',
    fail: { fx: (g) => g.stat('根骨', -8), res: '针被他两指夹住，随手弹了回来。', dev: 3 } });
  patch('gf_duel', { t: '拔出淑女剑，一剑把两人的刀都隔开', dev: 20, check: ['武学', 35], cond: has('shunv'),
    fx: (g) => { g.set('gfClear'); g.info('身份', '敢拔剑拦人的郭家大小姐'); g.stat('声望', 3); },
    res: '你的剑比他们的刀快。两个人愣在原地，你说：“谁再动手，我就不嫁谁。”',
    fail: { fx: (g) => g.stat('根骨', -6), res: '你的剑被他们的刀震脱了手。', dev: 3 } });
  patch('xl_gongsun', { t: '以玉女心经的静功坐在婚堂上，不喜不怒，等他先露出破绽', dev: 25, check: ['悟性', 60], cond: has('yunv'),
    fx: (g) => { g.kill('gongsunzhi', '在婚堂上露出破绽，被小龙女当场擒下'); g.info('身份', '绝情谷里坐得住的人'); g.stat('声望', 6); },
    res: '你坐了一个时辰，纹丝不动。公孙止先沉不住气，袖里的暗器露了形。你一剑制住了他。',
    fail: { fx: (g) => g.stat('心境', -8), res: '你的心还是乱了一下。', dev: 5 } });
  patch('yk_xiangyang', { t: '带着杨家枪法去襄阳，站在城头，不报名字', dev: 15, cond: has('yangjia'),
    fx: (g) => { g.move('xiangyang'); g.info('身份', '不肯报名的守城人'); g.stat('声望', 6); },
    res: '你一杆铁枪守了西门三个月。郭靖问你的名字，你只说：“姓杨。”' });

  /* ---------- 命终：记进图鉴 ---------- */
  const prevFinish = G.engine.onFinish;
  G.engine.onFinish = (g, life) => {
    if (prevFinish) prevFinish(g, life);
    try {
      const ids = JY.itemsOf(g);
      life.items = ids;
      const al = JY.album();
      al.items = al.items || {};
      life.fresh = life.fresh || [];
      ids.forEach((id) => { if (!al.items[id]) { al.items[id] = life.to; life.fresh.push('收集“' + JY.ITEMS[id].t + '”'); } });
      JY.albumSave(al);
    } catch (e) { console.warn(e); }
  };

  /* ---------- 名帖 / 醒来页：身上的本事 ---------- */
  const li = (u, id) => '<li title="' + u.esc(JY.ITEMS[id].d) + '">' + u.esc(JY.ITEMS[id].t) + '<small>' + u.esc(JY.ITEMS[id].kind) + '</small></li>';
  const baseSide = G.sideCards;
  G.sideCards = (c, u) => {
    let h = baseSide ? baseSide(c, u) : '';
    try {
      const { L } = JY.engine.get();
      if (!L) return h;
      const ids = JY.itemsOf(JY.engine.G);
      if (ids.length) h += u.card('身上的本事', ids.length + ' 样', '<ul class="item-list">' + ids.map((id) => li(u, id)).join('') + '</ul>', 'item-card');
    } catch (e) { /* 忽略 */ }
    return h;
  };

  /* ---------- 墓志页 ---------- */
  const baseEnd = G.endCards;
  G.endCards = (l, u) => {
    let h = baseEnd ? baseEnd(l, u) : '';
    if (l.items && l.items.length) h += u.card('这一世带着的本事', l.items.length + ' 样', '<ul class="item-list">' + l.items.map((id) => (JY.ITEMS[id] ? li(u, id) : '')).join('') + '</ul>', 'item-card');
    return h;
  };

  /* ---------- 首页：收集 ---------- */
  const baseHome = G.homeCards;
  G.homeCards = (W, u) => {
    const al = JY.album();
    const got = ITEM_IDS.filter((id) => (al.items || {})[id]).length;
    const h = (baseHome ? baseHome(W, u) : '')
      + '<section><div class="section-h"><h2>本事与信物</h2><span>收集 ' + got + ' / ' + ITEM_IDS.length + ' · 记进图鉴，重开不丢</span></div><div class="card"><ul class="item-list">'
      + ITEM_IDS.map((id) => ((al.items || {})[id]
        ? '<li title="' + u.esc(JY.ITEMS[id].d) + '">' + u.esc(JY.ITEMS[id].t) + '<small>' + u.esc(JY.ITEMS[id].kind) + '</small></li>'
        : '<li class="off">？？？<small>' + u.esc(JY.ITEMS[id].kind) + '</small></li>')).join('')
      + '</ul></div></section>';
    return h;
  };
})();

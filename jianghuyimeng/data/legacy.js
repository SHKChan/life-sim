/* 江湖一梦 · 复玩：结局图鉴、改命图鉴
 * 命终时（game.js 的 engine.onFinish）：
 *   life.end    这一世的结局 { id, t, d }，从 JY.ENDINGS 里按顺序找第一个命中的
 *   life.newEnd 这个结局是不是第一次见
 *   life.fresh  这一世新收集到的东西（结局、改命、心愿），墓志页列出来
 * 图鉴存在 localStorage 的 jianghuyimeng.album.v1，和江湖存档（jianghuyimeng.save.v2）分开：
 * “重开一个江湖”只清存档，不清图鉴。
 * 图鉴存：见过的结局 id、亲手改过的改命标记、达成过的心愿 id、每个人物活过几世。
 * 首页用 game.js 的 homeCards 显示；没见过的结局只显示“？？？”，不剧透。
 *
 * 结局：每个人物 4–8 个有名字的结局 { id, t, d, when(g, life) }，从上到下第一个命中的算数，最后一条是兜底。
 * when 只读已有的东西：g.f('标记')、life.cause（死法）、享年。读标记写成字面的 g.f('名字')。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const G = JY.GAME;
  const ALBUM_KEY = (G.id || 'jianghuyimeng') + '.album.v1';
  const age = (life) => life.to - life.born;
  const died = (life, s) => String(life.cause || '').indexOf(s) >= 0;

  /* ---------- 结局 ---------- */
  JY.ENDINGS = {
    guojing: [
      { id: 'jing_mongol', t: '草原上的金刀驸马', d: '你留在了蒙古，没有做成南宋的大侠。', when: (g) => g.f('jingStayMongol') },
      { id: 'jing_out', t: '走出襄阳的人', d: '城破的那一天，你活着带着家人走了出来。', when: (g) => g.f('guoSurvive') || g.f('jingEscaped') },
      { id: 'jing_book', t: '降龙十八掌传了下去', d: '这门掌法没有跟着你埋进襄阳，传到了后人手里。', when: (g) => g.f('poluXianglong') || g.f('xianglongBook') || g.f('xianglongWudang') },
      { id: 'jing_fall', t: '为国为民，城破人亡', d: '襄阳城破，你守到了最后一刻。', when: (g, life) => died(life, '城破') },
      { id: 'jing_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    huangrong: [
      { id: 'rong_palm', t: '铁掌峰下', d: '你没能熬过裘千仞那一掌，十九岁就走了。', when: (g) => g.f('rongDied') },
      { id: 'rong_map', t: '襄阳城头的石阵', d: '城头的石阵是你寄去的阵图，守城的人靠它撑了很久。', when: (g) => g.f('rongMapXiangyang') },
      { id: 'rong_teach', t: '一身本事传了下去', d: '你的本事教给了下一辈，没有带进土里。', when: (g) => g.f('rongTaughtYang') || g.f('xiangTaughtByRong') },
      { id: 'rong_fall', t: '襄阳城头', d: '城破的那天，你和郭靖都没有离开。', when: (g, life) => died(life, '城破') },
      { id: 'rong_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    yangkang: [
      { id: 'kang_turned', t: '认祖归宗', d: '你认回了杨铁心，离开了金国。', when: (g) => g.f('yangkangTurned') },
      { id: 'kang_war', t: '死在西门城头', d: '你活到了襄阳大战，死在城下。', when: (g, life) => died(life, '襄阳大战') },
      { id: 'kang_hide', t: '隐姓埋名', d: '你没有死在铁枪庙，在江南隐姓埋名过完一生。', when: (g) => g.f('yangkangLives') },
      { id: 'kang_temple', t: '铁枪庙里', d: '你没能走出那座破庙，十九岁就走了。这是书里写的结局。', when: () => true },
    ],
    munianci: [
      { id: 'nian_turned', t: '劝回了杨康', d: '你把他从金国拉了回来。', when: (g) => g.f('yangkangTurned') },
      { id: 'nian_kang', t: '杨康没有死', d: '铁枪庙里他活了下来，你们一起过了后半生。', when: (g) => g.f('yangkangLives') },
      { id: 'nian_father', t: '父亲活了下来', d: '杨铁心夫妇没有在中都自尽。', when: (g) => g.f('tiexinLives') },
      { id: 'nian_old', t: '看着杨过长大', d: '你没有早逝，把儿子看大了。', when: (g, life) => age(life) >= 40 },
      { id: 'nian_canon', t: '嘉兴的冬天', d: '你病死在嘉兴，留下十一岁的杨过。这是书里写的结局。', when: () => true },
    ],
    yangguo: [
      { id: 'guo_late', t: '还俗进古墓', d: '你在全真教熬到中年，又回了终南山。', when: (g) => g.f('ygLateTomb') },
      { id: 'guo_cliff', t: '跳下断肠崖', d: '你没等到小龙女，也没能活着回来。', when: (g, life) => died(life, '断肠崖') },
      { id: 'guo_arm', t: '双臂俱全的神雕大侠', d: '那一剑没有砍下来。', when: (g) => g.f('yangArm') },
      { id: 'guo_sword', t: '玄铁剑回了古墓', d: '那把重剑跟着你回了终南山。', when: (g) => g.f('yangKeepsSword') },
      { id: 'guo_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    xiaolongnv: [
      { id: 'long_stay', t: '没有跳崖', d: '你留在了断肠崖上，没有跳下去。', when: (g) => g.f('longStayed') },
      { id: 'long_down', t: '一起下山', d: '你和杨过一起离开了终南山。', when: (g) => g.f('xlWithYang') },
      { id: 'long_alone', t: '一个人的古墓', d: '杨过没有来过，古墓里一直只有你。', when: (g) => g.f('yangNoTomb') },
      { id: 'long_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    guofu: [
      { id: 'fu_single', t: '终身未嫁', d: '你没有嫁人，一个人过完了这一生。', when: (g) => g.f('gfSingle') },
      { id: 'fu_emei', t: '女儿上了峨嵋', d: '你把女儿送到了妹妹那里。', when: (g) => g.f('gfDaughterEmei') },
      { id: 'fu_fall', t: '襄阳城破', d: '城破的那天，你没有离开。', when: (g, life) => died(life, '城破') },
      { id: 'fu_join', t: '去投奔妹妹', d: '城破之后，你去找了郭襄。', when: (g) => g.f('fuJoinsXiang') },
      { id: 'fu_wu', t: '嫁给武修文', d: '你嫁了身边的人，没有嫁耶律齐。', when: (g) => g.f('gfWedWu') },
      { id: 'fu_sorry', t: '当面道了歉', d: '你对杨过说了那句对不起。', when: (g) => g.f('gfApologized') || g.f('fuApologized') },
      { id: 'fu_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    guoxiang: [
      { id: 'xiang_fall', t: '与父母同殉襄阳', d: '城破的那天，你和他们在一起。', when: (g, life) => died(life, '城破') },
      { id: 'xiang_lay', t: '俗家开派', d: '你没有出家，以俗家身份开了峨嵋。', when: (g) => g.f('emeiLaywoman') },
      { id: 'xiang_out', t: '带着百姓从水门逃出', d: '城破的那夜，你领着人活着走了出来。', when: (g) => g.f('xyRefugees') },
      { id: 'xiang_miss', t: '风陵渡那夜没去', d: '你没去找神雕侠，把这件事留在了心里。', when: (g) => g.f('gxNoMeet') },
      { id: 'xiang_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    limochou: [
      { id: 'chou_fire', t: '情花火海', d: '你唱着“问世间情为何物”，走进了火里。', when: (g, life) => died(life, '情花') },
      { id: 'chou_xiang', t: '郭襄平安回了郭家', d: '那个婴儿没有留在你手里，平平安安回到了郭家。', when: (g) => g.f('mochouReturnedXiang') || g.f('xiangNotStolen') },
      { id: 'chou_head', t: '古墓派掌门', d: '师父的位子最后落到了你手里。', when: (g) => g.f('mochouHeadGumu') },
      { id: 'chou_heir', t: '古墓武功有了传人', d: '你把本事传给了养女。', when: (g) => g.f('lmHeir') },
      { id: 'chou_nolu', t: '世上没有赤练仙子', d: '你没有爱上陆展元，也就没有后来的事。', when: (g) => g.f('mochouNoLu') },
      { id: 'chou_sister', t: '与师妹重归于好', d: '到了晚年，你和小龙女又坐在了一起。', when: (g) => g.f('mochouSistersMet') },
      { id: 'chou_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    zhangwuji: [
      { id: 'wuji_island', t: '留在冰火岛', d: '你没有回中原，陪着谢逊长大。', when: (g) => g.f('wujiStayIsland') },
      { id: 'wuji_zhou', t: '娶了周芷若', d: '濠州的婚礼上，你没有等到赵敏。', when: (g) => g.f('zhouMarried') },
      { id: 'wuji_kept', t: '没有让出教主之位', d: '你把明教带了下去。', when: (g) => g.f('mingjiaoKept') },
      { id: 'wuji_shaolin', t: '少林里的张无忌', d: '你拜进了少林，走了另一条路。', when: (g) => g.f('wujiShaolin') },
      { id: 'wuji_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    zhaomin: [
      { id: 'min_home', t: '回了蒙古', d: '你没有跟他走，回到了漠北。', when: (g) => g.f('zhaominHome') },
      { id: 'min_zhou', t: '成全了他和周芷若', d: '他娶了别人，你一个人去了塞外。', when: (g) => g.f('zhouMarried') },
      { id: 'min_kept', t: '他没有让出教主之位', d: '他留在了明教，你们没能归隐。', when: (g) => g.f('mingjiaoKept') },
      { id: 'min_friend', t: '和周芷若坐在一张桌上', d: '你们把那件事摊开说了。', when: (g) => g.f('zhaoZhouReconciled') },
      { id: 'min_memoir', t: '写下汝阳王府旧事', d: '你把这些年的事写成了书。', when: (g) => g.f('zhaominMemoir') },
      { id: 'min_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
    zhouzhiruo: [
      { id: 'ruo_wed', t: '嫁给了张无忌', d: '汉水边的那碗饭，吃了一辈子。', when: (g) => g.f('zhouMarried') },
      { id: 'ruo_follow', t: '放下掌门，跟着他', d: '你没有做峨嵋掌门，下了山。', when: (g) => g.f('zhouFollowedWuji') },
      { id: 'ruo_court', t: '峨嵋做了朝廷的门派', d: '你把门派带到了官府那一边。', when: (g) => g.f('emeiCourt') },
      { id: 'ruo_claw', t: '九阴白骨爪传了下去', d: '这门功夫没有断在你手里。', when: (g) => g.f('emeiJiuyinClaw') },
      { id: 'ruo_write', t: '写下灵蛇岛那一夜', d: '你把藏了一辈子的事写了出来。', when: (g) => g.f('zhouConfession') },
      { id: 'ruo_canon', t: '照着书里过完', d: '你这一生，大致和书里写的一样。', when: () => true },
    ],
  };
  const endingsOf = (id) => JY.ENDINGS[id] || [];
  JY.endOf = (g, life) => {
    const list = endingsOf(life.id);
    for (let i = 0; i < list.length; i++) {
      let ok = false;
      try { ok = !!list[i].when(g, life); } catch (e) { console.warn(e); }
      if (ok) return list[i];
    }
    return null;
  };

  /* ---------- 图鉴存储 ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || 'null') || null; } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(ALBUM_KEY, JSON.stringify(v)); } catch (e) { /* 忽略 */ } },
  };
  JY.album = () => {
    const al = store.get() || {};
    return { lives: al.lives || 0, ends: al.ends || {}, flags: al.flags || {}, wishes: al.wishes || {}, chars: al.chars || {}, quests: al.quests || {} };
  };

  /* ---------- 命终：记下结局、更新图鉴 ---------- */
  const prevFinish = G.engine.onFinish;
  G.engine.onFinish = (g, life) => {
    if (prevFinish) prevFinish(g, life);
    const e = JY.endOf(g, life);
    const al = JY.album();
    const fresh = [];
    al.lives++;
    al.chars[life.id] = (al.chars[life.id] || 0) + 1;
    if (e) {
      life.end = { id: e.id, t: e.t, d: e.d };
      if (!al.ends[e.id]) { al.ends[e.id] = life.to; life.newEnd = true; fresh.push('结局“' + e.t + '”'); }
    }
    // 改命：只算这一世亲手设的（life.changes），不算前世留下的
    (life.changes || []).forEach((k) => { if (!al.flags[k]) { al.flags[k] = life.to; fresh.push(JY.FLAGS[k] || k); } });
    (life.wishes || []).forEach((w) => { if (w.ok && !al.wishes[w.id]) { al.wishes[w.id] = life.to; fresh.push('心愿“' + w.t + '”'); } });
    life.fresh = fresh;
    store.set(al);
  };

  /* ---------- 墓志页 ---------- */
  const wishCards = G.endCards;
  G.endCards = (l, u) => {
    const { esc, card } = u;
    let h = '';
    if (l.end) {
      const total = endingsOf(l.id).length;
      const al = JY.album();
      const got = endingsOf(l.id).filter((x) => al.ends[x.id]).length;
      h += card('这一世的结局', esc(l.name + ' · 已见 ' + got + ' / ' + total) + (l.newEnd ? ' · 新' : ''),
        '<p class="end-name"><b>' + esc(l.end.t) + '</b></p><p class="note">' + esc(l.end.d) + '</p>', 'end-card');
    }
    if (wishCards) h += wishCards(l, u);
    if (l.fresh && l.fresh.length) {
      h += card('图鉴 · 新收集', l.fresh.length + ' 项', '<ul class="ulist">' + l.fresh.slice(0, 12).map((x) => '<li class="mod">' + esc(x) + '</li>').join('') + '</ul>'
        + (l.fresh.length > 12 ? '<p class="note">另有 ' + (l.fresh.length - 12) + ' 项。</p>' : ''));
    }
    return h;
  };

  /* ---------- 首页：江湖图鉴 ---------- */
  G.homeCards = (W, u) => {
    const { esc } = u;
    const al = JY.album();
    const chars = JY.CHARS.filter((c) => c.arc);
    const totalEnds = chars.reduce((n, c) => n + endingsOf(c.id).length, 0);
    const gotEnds = chars.reduce((n, c) => n + endingsOf(c.id).filter((x) => al.ends[x.id]).length, 0);
    const totalFlags = Object.keys(JY.FLAGS).length;
    const gotFlags = Object.keys(al.flags).filter((k) => JY.FLAGS[k]).length;
    const totalWishes = chars.reduce((n, c) => n + ((JY.WISHES || {})[c.id] || []).length, 0);
    const gotWishes = Object.keys(al.wishes).length;
    const row = (name, n, total) => '<div class="alb-row"><span>' + esc(name) + '</span><span class="bar"><i style="width:' + Math.round(100 * Math.min(1, n / (total || 1))) + '%"></i></span><b>' + n + ' / ' + total + '</b></div>';
    const rows = chars.map((c) => {
      const list = endingsOf(c.id);
      const n = list.filter((x) => al.ends[x.id]).length;
      return '<div class="alb-char"><div class="alb-row"><span>' + esc(c.name) + '</span><span class="bar"><i style="width:' + Math.round(100 * n / (list.length || 1)) + '%"></i></span><b>' + n + ' / ' + list.length + '</b></div>'
        + '<div class="ach-grid">' + list.map((x) => '<span class="' + (al.ends[x.id] ? 'on' : '') + '" title="' + esc(al.ends[x.id] ? x.d : '还没见过') + '">' + esc(al.ends[x.id] ? x.t : '？？？') + '</span>').join('') + '</div></div>';
    }).join('');
    return '<section class="album"><div class="section-h"><h2>江湖图鉴</h2><span>活过 ' + al.lives + ' 世 · 重开一个江湖也不会丢</span></div><div class="card">'
      + row('结局', gotEnds, totalEnds) + row('改过的事', gotFlags, totalFlags) + row('心愿', gotWishes, totalWishes)
      + '<details class="what alb-detail"' + (al.lives && al.lives < 4 ? ' open' : '') + '><summary>按人物看结局</summary>' + rows + '</details>'
      + '</div></section>';
  };
})();

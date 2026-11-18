/* 江湖一梦 · 心愿
 * 每个可玩人物 3 条心愿：开局能看到，命终时算有没有做到。
 * 三条的分量不同：第一条照原著也能成，第二条要改一次命，第三条要连着做对几件事。
 * done(g, life) 在命终、清空这一世之前调用（game.js 的 engine.onFinish），
 * 只读已有的东西：g.f 标记、g.alive、g.s 属性、g.recall 记忆，以及 life.to - life.born（享年）、life.cause。
 * 读标记一律写成字面的 g.f('名字')，检查工具才认得。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const age = (life) => life.to - life.born;

  JY.WISHES = {
    guojing: [
      { id: 'jing1', t: '守着襄阳，直到城破那一年', done: (g, life) => life.to >= 71 && !g.f('guoLeftXiangyang') },
      { id: 'jing2', t: '活着走出襄阳', done: (g) => g.f('guoSurvive') || g.f('jingEscaped') },
      { id: 'jing3', t: '杨过由你带大，双臂俱全', done: (g) => g.f('yangguoRaisedByGuo') && g.f('guofuGentle') },
    ],
    huangrong: [
      { id: 'rong1', t: '嫁给郭靖', done: (g) => !g.f('jingrongApart') },
      { id: 'rong2', t: '把一身本事教给晚辈', done: (g) => g.f('rongTaughtYang') || g.f('xiangTaughtByRong') },
      { id: 'rong3', t: '襄阳城头的石阵，是你寄去的阵图', done: (g) => g.f('rongMapXiangyang') && !g.f('rongDied') },
    ],
    yangkang: [
      { id: 'kang1', t: '娶了穆念慈', done: (g) => g.f('yangkangMarried') },
      { id: 'kang2', t: '认回生父杨铁心', done: (g) => g.f('tiexinLives') || g.f('yangkangTurned') },
      { id: 'kang3', t: '活着，亲手带大杨过', done: (g, life) => age(life) >= 30 && g.f('yangkangMarried') && !g.recall('abandoned') },
    ],
    munianci: [
      { id: 'nian1', t: '守着杨家的铁枪，把杨过养到十一岁', done: (g, life) => life.to >= 31 && !g.f('spearSold') },
      { id: 'nian2', t: '没有早早病逝', done: (g) => g.f('munianciLives') },
      { id: 'nian3', t: '杨康回了头，你也没有早逝', done: (g) => g.f('yangkangTurned') && g.f('munianciLives') },
    ],
    yangguo: [
      { id: 'guo1', t: '等满十六年，在断肠崖下和小龙女重逢', done: (g, life) => !g.f('ygNoReunion') && !g.f('reunionEarly') && life.to >= 57 },
      { id: 'guo2', t: '双臂俱全', done: (g) => g.f('yangArm') },
      { id: 'guo3', t: '带小龙女连夜离开绝情谷，没中情花毒', done: (g) => g.f('jqSlipped') },
    ],
    xiaolongnv: [
      { id: 'long1', t: '在断肠崖下等满十六年，再见到他', done: (g, life) => !g.f('longStayed') && life.to >= 57 },
      { id: 'long2', t: '不跳断肠崖', done: (g) => g.f('longStayed') },
      { id: 'long3', t: '和杨过一起下山，一起活到八十岁以后', done: (g, life) => g.f('xlWithYang') && age(life) >= 80 },
    ],
    guofu: [
      { id: 'fu1', t: '没有砍断杨过的手臂', done: (g) => g.f('guofuGentle') },
      { id: 'fu2', t: '嫁给自己选的人', done: (g) => g.f('gfWedWu') || g.f('gfSingle') },
      { id: 'fu3', t: '活过襄阳城破，孩子们也平安', done: (g) => g.f('guoSurvive') && g.f('gfKidsOut') },
    ],
    guoxiang: [
      { id: 'xiang1', t: '风陵渡一夜，得到三枚金针', done: (g, life) => !g.f('gxNoMeet') && life.to >= 57 },
      { id: 'xiang2', t: '以俗家身份开峨嵋', done: (g) => g.f('emeiLaywoman') },
      { id: 'xiang3', t: '峨嵋和武当，两派祖师互相照应', done: (g) => g.f('emeiWudangFriends') },
    ],
    limochou: [
      { id: 'chou1', t: '师门和好，在师父面前认了错', done: (g) => g.f('lmReconciled') },
      { id: 'chou2', t: '没有叛出古墓', done: (g) => g.f('lmWaited') },
      { id: 'chou3', t: '晚年和程英、陆无双做邻居，古墓武功传给了养女', done: (g) => g.f('lmWithCheng') && g.f('lmHeir') },
    ],
    zhangwuji: [
      { id: 'wuji1', t: '和赵敏远走塞外', done: (g) => !g.f('zhouMarried') && !g.f('zhaominHome') && !g.f('mingjiaoKept') },
      { id: 'wuji2', t: '张翠山夫妇没有自尽', done: (g) => g.f('cuishanLives') },
      { id: 'wuji3', t: '治好殷离的脸，也去波斯看过小昭', done: (g) => g.f('yinliHealed') && g.f('wujiVisitedPersia') },
    ],
    zhaomin: [
      { id: 'min1', t: '和张无忌相守到老', done: (g) => !g.f('zhaominHome') && !g.f('zhouMarried') },
      { id: 'min2', t: '和周芷若坐在一张桌上吃饭', done: (g) => g.f('zhaoZhouReconciled') },
      { id: 'min3', t: '和周芷若和解，晚年写成《汝阳王府旧事》', done: (g) => g.f('zhaoZhouReconciled') && g.f('zhaominMemoir') },
    ],
    zhouzhiruo: [
      { id: 'ruo1', t: '做峨嵋掌门，做到老', done: (g) => !g.f('zhouMarried') && !g.f('zhouFollowedWuji') && !g.f('zhouDisgraced') && !g.f('zhouLeftEmei') },
      { id: 'ruo2', t: '没有发万安寺那个毒誓', done: (g) => g.f('zhouNoOath') },
      { id: 'ruo3', t: '光明顶上那一剑刺偏，宋青书也活了下来', done: (g) => g.f('zhouMercyThrust') && g.f('songqingshuLives') },
    ],
  };

  // 这一世的心愿结果：[{ t, ok }]。done 出错就当没做到，不影响命终
  JY.wishList = (g, life) => (JY.WISHES[life.id] || []).map((w) => {
    let ok = false;
    try { ok = !!w.done(g, life); } catch (e) { console.warn(e); }
    return { id: w.id, t: w.t, ok };
  });
})();

/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 每世一次改命；复用节点、判定、职业和回响，不累积跨世加成。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME, CN = JY.CN;
  const working = (g) => !g.recall('retired') && !['none', 'retired', 'soldier'].includes(g.recall('job') || 'none');
  const ROUTES = [
    { k: 'repair', age: 23, t: '舊機器裡的新飯碗', fee: 6000, stat: '学识', job: 'mechanic', title: '裝置維修師傅',
      text: '培訓點擺出一臺舊機器。報名連工具 ¥6,000，證書不包工作。',
      yes: '你白天上班，晚上練拆裝。考過實操後，一家維修鋪讓你從接單做起。第一筆工錢買了一套自己的工具。',
      no: '實操沒過，報名費退不了。你把練習機揹回家，終於學會修好那個接觸不良的開關。原來的工作還得繼續。',
      echoYes: '當年練拆裝留下的筆記翻得起了毛邊。新來的學徒問你故障在哪，你讓他先聽一聽聲音。',
      echoNo: '同事的舊風扇壞了，你照著那本維修筆記修好了。沒換成行，至少沒白學。' },
    { k: 'parcel', age: 28, t: '八平方米的試營業', fee: 8000, stat: '人缘', job: 'parcel', title: '社群快遞站經營者',
      text: '小區門口空出一間小屋。貨架、押金和試營業共 ¥8,000，網點不保證單量。',
      yes: '你試營業後接到了穩定的代收單，才辦手續離開原崗位。第一週總有人拿錯件，你把貨架重新編了號。',
      no: '三個月的單量付不起租金。你清掉貨架，損失了押金和佈置費，回去照常上班。倒是認識了半個小區的人。',
      echoYes: '有人搬家前專門來告別，說這些年總是你替他收包裹。你把最後一件遞過去，門口又響起掃碼聲。',
      echoNo: '路上還有鄰居叫你一聲站長。你笑著糾正，說早就不幹了，對方仍順手給你遞了一袋橘子。' },
    { k: 'remote', age: 34, t: '把通勤換成一張工作臺', fee: 12000, stat: '事业', job: 'freelance', title: '接單做設計與資料整理',
      text: '熟人介紹了一份試單。電腦和軟體要 ¥12,000，你想試著把零活做成工作。',
      yes: '你用幾個晚上交完試單，拿到長期訂單後才辭職。工作臺挨著窗，午飯還是會涼，但不用再趕末班車。',
      no: '客戶改了七遍，最後取消續單。電腦錢已經花了，你保住原工作，把軟體練習留在週末。',
      echoYes: '當年的客戶又發來需求。你先列工期和修改次數，再泡一杯茶，終於懂得給自己的時間標價。',
      echoNo: '部門臨時要整理一批老資料，你用當年學的軟體半天做完。同事問你在哪學的，你說交過一點學費。' },
    { k: 'caretech', age: 41, t: '聽懂機器的報警聲', fee: 10000, stat: '学识', job: 'mechanic', title: '養老裝置維護師傅',
      text: '夜校培訓加實習要 ¥10,000。你得下班後擠時間，重新學那些報警程式碼。',
      yes: '實習時你找出一個反覆誤報的接頭。照護站給了你正式崗位，你辦完離職手續，帶著工具箱去報到。',
      no: '最後一輪實操沒過。錢花了，熬夜也是真的，你暫時留在原崗，把考題裡不懂的地方一項項圈出來。',
      echoYes: '照護員說機器昨晚終於沒亂響。你檢查完接頭，輕輕合上櫃門，隔壁的老人還在午睡。',
      echoNo: '家裡的輔助裝置報警，你按筆記先查接線。修好以後，你把熬夜的書收起來，今天早點睡。' },
    { k: 'mentor', age: 49, t: '把經驗講給別人聽', fee: 6000, stat: '事业', job: 'freelance', title: '實務培訓講師',
      text: '社群培訓班邀你試講。教材和錄課共 ¥6,000，你得把自己會做的事講明白。',
      yes: '第一堂課講得太快。你重做教材，幾次試講後拿到固定課時，才轉去接培訓的活。臺下終於有人聽懂了。',
      no: '你做得出來，卻講不清楚，沒拿到固定課時。六千塊沒收回來，你照舊工作，把流程重新寫了一遍。',
      echoYes: '學員帶著自己做的成品回來，說照著你的步驟少走了彎路。你改掉教材裡一處舊說法，又開了一堂課。',
      echoNo: '新人看著你寫的流程，第一次獨立做完了活。你沒當成講師，帶人的時候倒少發了幾次火。' },
    { k: 'studio', age: 58, t: '退休前的一次試營業', fee: 5000, stat: '人缘', job: 'freelance', title: '社群興趣課主理人',
      text: '你想開週末小課。場地和材料共 ¥5,000；鄰居說會來，肯不肯付錢還得試。',
      yes: '續報的人比預想多。你算過一年收支，才辭去原工作。每次開課前，你都比學員早到半小時。',
      no: '熱鬧了兩次，付費的人很少。你沒有續租場地，工作照常，偶爾約鄰居在公共活動室免費交流。',
      echoYes: '你翻到第一期歪歪扭扭的簽到表。有的人還在，有的人搬走了，新報名的人問下週能不能帶朋友來。',
      echoNo: '鄰居還記得當年的試課，帶著材料來找你。你們約好只交流，不租場地，也不用再算回本。' },
  ];
  const technical = (g) => ['auto', 'elec'].includes(g.recall('skill'))
    || ['electric', 'weld'].includes(g.recall('craft')) || ['mech', 'robot'].includes(g.recall('vocMajor'))
    || ['mechanic', 'electrician', 'welder', 'cnc', 'tech'].includes(g.recall('job'));
  const background = (g, r) => ({
    repair: technical(g) && g.recall('job') !== 'mechanic',
    parcel: ['rider', 'driver', 'sales', 'grocery', 'shop'].includes(g.recall('job')),
    remote: ['office', 'tech', 'creator'].includes(g.recall('job')),
    caretech: technical(g) || ['eldercare', 'nurse'].includes(g.recall('job')),
    mentor: g.s('事业') >= 55 && g.since('money0') >= 10,
    studio: g.recall('hobby55') === 'art' || g.recall('gift') === 'brush',
  })[r.k];
  const eligible = (g, r) => !g.recall('rewrite') && working(g) && background(g, r)
    && ROUTES.filter((x) => JY.engine.get().L.done['t_rewrite_' + x.k]).length < 2;
  const origins = {
    repair: '你以前摸過機器、學過技術，老師讓你先試一試。',
    parcel: '你幹過跑單或櫃檯的活，知道這裡每天有多少人來往。',
    remote: '這些年的文案、資料和電腦活，讓你有了接單的底子。',
    caretech: '你做過技術或照護工作，照護站邀你來試崗。',
    mentor: '這些年積下的手藝和工作經驗，有人願意聽你講。',
    studio: '你以前認真學過的興趣，這次有人想跟著你學。',
  };
  ROUTES.forEach((r) => {
    const id = 't_rewrite_' + r.k;
    const take = (g, ok) => {
      // 两个分支都付同一笔费用，且只在有现金时开放，不自动借债。
      CN.pay(g, r.fee);
      g.remember('rewrite', { k: r.k, ok, age: g.age });
      g.stat('健康', -2);
      g.stat('心情', ok ? 4 : -3);
      if (ok) { CN.setJob(g, r.job, r.title); g.remember('lifePath', 'work'); g.stat('事业', 5); }
      else g.stat('学识', 3);
    };
    JY.addLifeNodes([
      { id, age: r.age, t: r.t, major: true, cond: (g) => eligible(g, r),
        stake: '本世剩餘 1 次改命機會；後續機會取決於你的經歷。', text: (g) => origins[r.k] + r.text + (CN.moneyRoom ? CN.moneyRoom(g, r.fee) : ''),
        choices: [
          { t: '留在原崗', canon: true, hint: '不花錢，保留改命機會。',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'pass' })), res: '你把報價單收進抽屜，先過眼前的日子。這次沒有花錢，改命機會還在。' },
          { t: '用一次改命，試著轉行', dev: 25, check: [r.stat, 55], cond: (g) => CN.cash(g) >= r.fee,
            hint: '花費 ' + CN.fmt(r.fee) + '，健康 −2；成功轉行，失敗留原崗、學識 +3。成敗均消耗機會。',
            fx: (g) => { take(g, true); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'yes' })); }, res: r.yes,
            fail: { fx: (g) => { take(g, false); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'no' })); }, res: r.no } },
          { t: '先顧好眼前的賬', canon: true, cond: (g) => CN.cash(g) < r.fee,
            hint: '現金不足 ' + CN.fmt(r.fee) + '；不借債，保留機會。',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'save' })), res: '你算完賬，沒有交報名的錢。先不讓一家人的日常開銷跟著冒險。' },
        ] },
      { id: id + '_echo', age: r.age + 3, t: '那次岔路以後', auto: true, echoOf: id,
        cond: (g) => !!(g.recall('turns') || {})[r.k],
        text: (g) => ({ yes: r.echoYes, no: r.echoNo, pass: '你又看到了類似的招募。想起三年前收起的那張報價單，才發現留在原路上也走出了這麼遠。', save: '你翻到三年前的賬本。那筆沒有花出去的錢，留給了當時更要緊的日子。' })[(g.recall('turns') || {})[r.k]],
        fx: (g) => g.stat('心情', 1) },
    ]);
  });

  const onFinish = G.engine.onFinish;
  G.engine.onFinish = (g, life) => {
    onFinish(g, life);
    const rw = g.recall('rewrite');
    if (rw) life.rewrite = Object.assign({}, rw);
    const picks = life.picks || [];
    life.turns = picks.filter((p) => !p.auto && p.major && typeof p.id === 'string')
      .sort((a, b) => Number(b.id.startsWith('t_rewrite_')) - Number(a.id.startsWith('t_rewrite_')) || b.dev - a.dev)
      .slice(0, 3).sort((a, b) => a.age - b.age)
      .map((p) => ({ id: p.id, age: p.age, t: p.t, c: p.c, res: p.res, ok: p.ok, check: p.check }));
    // 只连接真实完成的回响及其原选择，不用最终属性倒推一生。
    const L = JY.engine.get().L, links = [];
    JY.LIFE_NODES.concat(JY.ENCOUNTERS).forEach((node) => {
      if (!node.echoOf || !L.done[node.id]) return;
      const sourceId = [].concat(node.echoOf).find((id) => L.pickBy && L.pickBy[id]);
      const pick = picks.find((p) => p.id === sourceId && !p.auto);
      const tail = JY.engine.echoTail(node);
      if (!pick || !tail) return;
      const echo = L.log.find((e) => e.k === 'echo' && e.t.includes(tail) && e.a >= pick.age);
      if (!echo || links.some((x) => x.id === pick.id)) return;
      links.push({ id: pick.id, age: pick.age, choice: pick.c, echoId: node.id, echoAge: echo.a, result: echo.t.slice(0, echo.t.indexOf(tail)).trim() });
    });
    const groups = new Set();
    life.reviewLinks = links.sort((a, b) => Number(b.id.startsWith('t_rewrite_')) - Number(a.id.startsWith('t_rewrite_')) || a.age - b.age)
      .filter((x) => { const group = /family|kid|marriage|crisis|care|parents/.test(x.id) ? 'family' : /money|house|f_/.test(x.id) ? 'money' : 'work'; if (groups.has(group)) return false; groups.add(group); return true; }).slice(0, 3).sort((a, b) => a.age - b.age);
    const age = life.to - life.born, s = life.snap || {}, st = life.st || {};
    life.review = age < 50 ? '這一生短了一些，你認真走過的那些日子，仍然算數。'
      : rw ? (rw.ok ? '你花掉了那次改命機會，也親手把另一種日子過成了日常。' : '那次沒成的事，沒有替你決定餘下的一生。')
      : s.net < 0 ? '賬本沒能翻到輕鬆的那頁，這一路，你已經很用力了。'
      : st['事业'] >= 85 && (st['健康'] < 40 || st['心情'] < 50) ? '工作群裡總能找到你，留給自己的時間卻總寫著下次。'
      : life.wish && life.wish.length && life.wish.every((w) => w.ok) ? (life.wishChange ? '後來重新想過的生活，你也一件件認真做了。' : '十六歲寫下的願望，你後來真的一件件做了。')
      : st['心情'] >= 85 ? '你沒把每一天都過成大事，卻把小日子過出了滋味。'
      : '有些路走通了，有些沒走通，你還是把這一生認真過完了。';
  };
  const endCards = G.endCards;
  G.endCards = (l, u) => {
    const { esc, card } = u;
    const links = (l.reviewLinks || []).map((x) => '<li><p>' + esc(x.age + ' 歲 · ' + x.choice) + '</p><p class="note">' + esc(x.echoAge + ' 歲 · ' + x.result) + '</p></li>').join('');
    return (!G.endLayout && l.review ? card('這一生，留下一句話', '', '<p class="life-review">' + esc(l.review) + '</p>') : '')
      + (links ? '<div class="life-connections"><h3>那些選擇，後來怎樣了</h3><ul>' + links + '</ul></div>' : '') + endCards(l, u);
  };
  const homeCards = G.homeCards;
  G.homeCards = (w, u) => {
    const al = JY.album(), ends = al.ends || {}, list = JY.FATE.ENDS;
    const found = list.filter((e) => ends[e.k]), hidden = list.filter((e) => !ends[e.k]);
    return homeCards(w, u) + '<section class="album ending-album"><div class="section-h"><h2>結局圖鑑</h2>' + (found.length ? '<span>已留下 ' + found.length + ' 種人生</span>' : '') + '</div>'
      + (found.length ? '<div class="ending-grid">' + found.map((e) => '<details class="card ending-entry unlocked"><summary>' + u.esc(e.t) + '</summary><p class="note">' + u.esc(e.d) + '</p><small>已記錄 ' + ends[e.k] + ' 次</small></details>').join('') + '</div>'
        : '<p>每一種人生，都有值得留下的一頁。</p><p class="note">完成第一段人生後，你的結局會記錄在這裡。</p>')
      + (hidden.length ? '<details class="ending-hints"><summary>' + (found.length ? '還有 ' + hidden.length + ' 種結局等待發現 · ' : '') + '檢視線索</summary><p class="note">以下線索會透露尚未走過的人生方向。</p><div class="ending-grid">'
        + hidden.map((e) => '<details class="card ending-entry"><summary>' + u.esc(e.hint) + '</summary><p class="note">' + u.esc(e.d) + '</p></details>').join('') + '</div></details>' : '') + '</section>';
  };
  const badges = G.share.badges;
  G.share.badges = (l) => {
    const out = badges(l);
    if (!l.review) return out;
    const turn = (l.turns || []).find((p) => (p.id || '').startsWith('t_rewrite_') || (p.t && p.c.includes('改命'))) || (l.turns || [])[0];
    const note = l.note ? out.shift() : null;
    return (note ? [note] : []).concat(['評語：' + l.review], out.slice(0, 1), turn ? [turn.age + ' 歲 · ' + turn.t + (turn.check ? (turn.ok ? '，成了' : '，沒成') : '')] : [], out.slice(1));
  };
  G.howto.push(['一次改命', '每世一次，最多遇到兩次邀請。機會來自你的經歷；成敗都付代價，也都有後續。']);
  JY.TURNING = { ROUTES, eligible };
})();

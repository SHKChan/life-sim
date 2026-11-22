/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 每世一次改命；复用节点、判定、职业和回响，不累积跨世加成。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME, CN = JY.CN;
  const working = (g) => !g.recall('retired') && !['none', 'retired', 'soldier'].includes(g.recall('job') || 'none');
  const ROUTES = [
    { k: 'repair', age: 23, t: '舊機器裡的新飯碗', fee: 6000, stat: '学识', job: 'mechanic', title: '裝置維修師傅',
      text: '培訓點拆開一臺舊機器，讓你試著找故障。老師說，報名費連工具六千塊，證書不包工作。',
      yes: '你白天上班，晚上練拆裝。考過實操後，一家維修鋪讓你從接單做起。第一筆工錢買了一套自己的工具。',
      no: '實操沒過，報名費退不了。你把練習機揹回家，終於學會修好那個接觸不良的開關。原來的工作還得繼續。',
      echoYes: '當年練拆裝留下的筆記翻得起了毛邊。新來的學徒問你故障在哪，你讓他先聽一聽聲音。',
      echoNo: '同事的舊風扇壞了，你照著那本維修筆記修好了。沒換成行，至少沒白學。' },
    { k: 'parcel', age: 28, t: '八平方米的試營業', fee: 8000, stat: '人缘', job: 'parcel', title: '社群快遞站經營者',
      text: '小區門口空出一間小屋。貨架、押金和試營業要八千塊，你先問了幾家快遞網點，誰都不肯保證單量。',
      yes: '你試營業後接到了穩定的代收單，才辦手續離開原崗位。第一週總有人拿錯件，你把貨架重新編了號。',
      no: '三個月的單量付不起租金。你清掉貨架，損失了押金和佈置費，回去照常上班。倒是認識了半個小區的人。',
      echoYes: '有人搬家前專門來告別，說這些年總是你替他收包裹。你把最後一件遞過去，門口又響起掃碼聲。',
      echoNo: '路上還有鄰居叫你一聲站長。你笑著糾正，說早就不幹了，對方仍順手給你遞了一袋橘子。' },
    { k: 'remote', age: 34, t: '把通勤換成一張工作臺', fee: 12000, stat: '事业', job: 'freelance', title: '接單做設計與資料整理',
      text: '你試著替熟人整理資料、畫產品圖。有人肯下第二單，你開始盤算：花一萬二配電腦和軟體，能不能把零活做成工作。',
      yes: '你用幾個晚上交完試單，拿到長期訂單後才辭職。工作臺挨著窗，午飯還是會涼，但不用再趕末班車。',
      no: '客戶改了七遍，最後取消續單。電腦錢已經花了，你保住原工作，把軟體練習留在週末。',
      echoYes: '當年的客戶又發來需求。你先列工期和修改次數，再泡一杯茶，終於懂得給自己的時間標價。',
      echoNo: '部門臨時要整理一批老資料，你用當年學的軟體半天做完。同事問你在哪學的，你說交過一點學費。' },
    { k: 'caretech', age: 41, t: '聽懂機器的報警聲', fee: 10000, stat: '学识', job: 'mechanic', title: '養老裝置維護師傅',
      text: '附近照護站缺裝置維護人員。夜校培訓要一萬塊，還要實習；你得在下班後擠時間，把那些報警程式碼重新學一遍。',
      yes: '實習時你找出一個反覆誤報的接頭。照護站給了你正式崗位，你辦完離職手續，帶著工具箱去報到。',
      no: '最後一輪實操沒過。錢花了，熬夜也是真的，你暫時留在原崗，把考題裡不懂的地方一項項圈出來。',
      echoYes: '照護員說機器昨晚終於沒亂響。你檢查完接頭，輕輕合上櫃門，隔壁的老人還在午睡。',
      echoNo: '家裡的輔助裝置報警，你按筆記先查接線。修好以後，你把熬夜的書收起來，今天早點睡。' },
    { k: 'mentor', age: 49, t: '把經驗講給別人聽', fee: 6000, stat: '事业', job: 'freelance', title: '實務培訓講師',
      text: '社群培訓班請你試講這些年的工作經驗。教材、錄課和試課要六千塊，你得練習把自己會做的事講明白。',
      yes: '第一堂課講得太快。你重做教材，幾次試講後拿到固定課時，才轉去接培訓的活。臺下終於有人聽懂了。',
      no: '你做得出來，卻講不清楚，沒拿到固定課時。六千塊沒收回來，你照舊工作，把流程重新寫了一遍。',
      echoYes: '學員帶著自己做的成品回來，說照著你的步驟少走了彎路。你改掉教材裡一處舊說法，又開了一堂課。',
      echoNo: '新人看著你寫的流程，第一次獨立做完了活。你沒當成講師，帶人的時候倒少發了幾次火。' },
    { k: 'studio', age: 58, t: '退休前的一次試營業', fee: 5000, stat: '人缘', job: 'freelance', title: '社群興趣課主理人',
      text: '你想把這些年攢下的興趣做成周末小課。借場地、材料和試課共五千塊，鄰居說會來，肯不肯付錢還得試。',
      yes: '續報的人比預想多。你算過一年收支，才辭去原工作。每次開課前，你都比學員早到半小時。',
      no: '熱鬧了兩次，付費的人很少。你沒有續租場地，工作照常，偶爾約鄰居在公共活動室免費交流。',
      echoYes: '你翻到第一期歪歪扭扭的簽到表。有的人還在，有的人搬走了，新報名的人問下週能不能帶朋友來。',
      echoNo: '鄰居還記得當年的試課，帶著材料來找你。你們約好只交流，不租場地，也不用再算回本。' },
  ];
  const eligible = (g, r, i) => !g.recall('rewrite') && working(g)
    && Math.abs(Number(g.recall('seed')) || 0) % 3 === i % 3;
  ROUTES.forEach((r, i) => {
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
      { id, age: r.age, t: r.t, major: true, cond: (g) => eligible(g, r, i),
        stake: '每世僅一次改命。現在押上積蓄和精力，或把機會留到以後；後面的機會取決於你的處境。', text: r.text,
        choices: [
          { t: '照常過日子，暫不改命', canon: true, hint: '不花錢、不消耗機會；三年後會回望這次選擇。',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'pass' })), res: '你把報價單收進抽屜，先過眼前的日子。這次沒有花錢，改命機會還在。' },
          { t: '用掉本世改命機會，認真試一次', dev: 25, check: [r.stat, 55], cond: (g) => CN.cash(g) >= r.fee,
            hint: '無論成敗都花 ' + CN.fmt(r.fee) + '，健康 −2；成功換一條職業路，失敗保留原工作並學到經驗。',
            fx: (g) => { take(g, true); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'yes' })); }, res: r.yes,
            fail: { fx: (g) => { take(g, false); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'no' })); }, res: r.no } },
          { t: '錢先留著，把眼前的賬顧好', canon: true, cond: (g) => CN.cash(g) < r.fee,
            hint: '現金不足 ' + CN.fmt(r.fee) + '，本次不借錢入場，保留改命機會。',
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
    life.turns = picks.filter((p) => !p.auto && p.major && (p.check || p.dev > 0))
      .sort((a, b) => Number(b.id.startsWith('t_rewrite_')) - Number(a.id.startsWith('t_rewrite_')) || b.dev - a.dev)
      .slice(0, 3).sort((a, b) => a.age - b.age)
      .map((p) => ({ age: p.age, t: p.t, c: p.c, res: p.res, ok: p.ok, check: p.check }));
    const age = life.to - life.born, s = life.snap || {}, st = life.st || {};
    life.review = age < 50 ? '這一生短了一些，你認真走過的那些日子，仍然算數。'
      : rw ? (rw.ok ? '你花掉了那次改命機會，也親手把另一種日子過成了日常。' : '那次沒成的事，沒有替你決定餘下的一生。')
      : s.net < 0 ? '賬本沒能翻到輕鬆的那頁，這一路，你已經很用力了。'
      : st['事业'] >= 85 && (st['健康'] < 40 || st['心情'] < 50) ? '工作群裡總能找到你，留給自己的時間卻總寫著下次。'
      : life.wish && life.wish.length && life.wish.every((w) => w.ok) ? '十六歲寫下的願望，你後來真的一件件做了。'
      : st['心情'] >= 85 ? '你沒把每一天都過成大事，卻把小日子過出了滋味。'
      : '有些路走通了，有些沒走通，你還是把這一生認真過完了。';
  };
  const endCards = G.endCards;
  G.endCards = (l, u) => {
    const { esc, card } = u;
    const turns = (l.turns || []).map((p) => '<li><b>' + p.age + ' 歲 · ' + esc(p.t) + '</b><p>' + esc(p.c) + (p.check ? (p.ok ? '（成功）' : '（失敗）') : '') + '</p><p class="note">' + esc(p.res) + '</p></li>').join('');
    return (l.review ? card('這一生，留下一句話', '', '<p class="life-review">' + esc(l.review) + '</p>' + (turns ? '<ul class="ulist">' + turns + '</ul>' : '')) : '') + endCards(l, u);
  };
  const homeCards = G.homeCards;
  G.homeCards = (w, u) => {
    const al = JY.album(), ends = al.ends || {}, list = JY.FATE.ENDS;
    return homeCards(w, u) + '<section class="album"><div class="section-h"><h2>結局圖鑑</h2><span>' + list.filter((e) => ends[e.k]).length + ' / ' + list.length + '</span></div><p class="note">未解鎖的條目留下一個方向。同一世可能符合多種結局，主結局優先記錄最鮮明的人生路線，符合的其他條目也會收錄。</p><div class="ending-grid">'
      + list.map((e) => '<details class="card ending-entry' + (ends[e.k] ? ' unlocked' : '') + '"><summary>' + u.esc(ends[e.k] ? e.t : '未解鎖 · ' + e.hint) + '</summary><p class="note">' + u.esc(ends[e.k] ? e.d : '線索：' + e.d) + '</p><small>' + (ends[e.k] ? '已記錄 ' + ends[e.k] + ' 次' : '試著走一條不同的路') + '</small></details>').join('') + '</div></section>';
  };
  const badges = G.share.badges;
  G.share.badges = (l) => {
    const out = badges(l);
    if (!l.review) return out;
    const turn = (l.turns || []).find((p) => p.t && p.c.includes('改命')) || (l.turns || [])[0];
    const note = l.note ? out.shift() : null;
    return (note ? [note] : []).concat(['評語：' + l.review], out.slice(0, 1), turn ? [turn.age + ' 歲 · ' + turn.t + (turn.check ? (turn.ok ? '，成了' : '，沒成') : '')] : [], out.slice(1));
  };
  G.howto.push(['一次改命', '一世只有一次。少數岔路會邀請你用積蓄和精力試一條新路，寫明費用和成功率；失敗也有後續。結局圖鑑裡可以尋找下一世想試的方向。']);
  JY.TURNING = { ROUTES, eligible };
})();

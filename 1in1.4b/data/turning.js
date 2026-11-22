/* 每世一次改命；复用节点、判定、职业和回响，不累积跨世加成。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME, CN = JY.CN;
  const working = (g) => !g.recall('retired') && !['none', 'retired', 'soldier'].includes(g.recall('job') || 'none');
  const ROUTES = [
    { k: 'repair', age: 23, t: '旧机器里的新饭碗', fee: 6000, stat: '学识', job: 'mechanic', title: '设备维修师傅',
      text: '培训点拆开一台旧机器，让你试着找故障。老师说，报名费连工具六千块，证书不包工作。',
      yes: '你白天上班，晚上练拆装。考过实操后，一家维修铺让你从接单做起。第一笔工钱买了一套自己的工具。',
      no: '实操没过，报名费退不了。你把练习机背回家，终于学会修好那个接触不良的开关。原来的工作还得继续。',
      echoYes: '当年练拆装留下的笔记翻得起了毛边。新来的学徒问你故障在哪，你让他先听一听声音。',
      echoNo: '同事的旧风扇坏了，你照着那本维修笔记修好了。没换成行，至少没白学。' },
    { k: 'parcel', age: 28, t: '八平方米的试营业', fee: 8000, stat: '人缘', job: 'parcel', title: '社区快递站经营者',
      text: '小区门口空出一间小屋。货架、押金和试营业要八千块，你先问了几家快递网点，谁都不肯保证单量。',
      yes: '你试营业后接到了稳定的代收单，才办手续离开原岗位。第一周总有人拿错件，你把货架重新编了号。',
      no: '三个月的单量付不起租金。你清掉货架，损失了押金和布置费，回去照常上班。倒是认识了半个小区的人。',
      echoYes: '有人搬家前专门来告别，说这些年总是你替他收包裹。你把最后一件递过去，门口又响起扫码声。',
      echoNo: '路上还有邻居叫你一声站长。你笑着纠正，说早就不干了，对方仍顺手给你递了一袋橘子。' },
    { k: 'remote', age: 34, t: '把通勤换成一张工作台', fee: 12000, stat: '事业', job: 'freelance', title: '接单做设计与资料整理',
      text: '你试着替熟人整理资料、画产品图。有人肯下第二单，你开始盘算：花一万二配电脑和软件，能不能把零活做成工作。',
      yes: '你用几个晚上交完试单，拿到长期订单后才辞职。工作台挨着窗，午饭还是会凉，但不用再赶末班车。',
      no: '客户改了七遍，最后取消续单。电脑钱已经花了，你保住原工作，把软件练习留在周末。',
      echoYes: '当年的客户又发来需求。你先列工期和修改次数，再泡一杯茶，终于懂得给自己的时间标价。',
      echoNo: '部门临时要整理一批老资料，你用当年学的软件半天做完。同事问你在哪学的，你说交过一点学费。' },
    { k: 'caretech', age: 41, t: '听懂机器的报警声', fee: 10000, stat: '学识', job: 'mechanic', title: '养老设备维护师傅',
      text: '附近照护站缺设备维护人员。夜校培训要一万块，还要实习；你得在下班后挤时间，把那些报警代码重新学一遍。',
      yes: '实习时你找出一个反复误报的接头。照护站给了你正式岗位，你办完离职手续，带着工具箱去报到。',
      no: '最后一轮实操没过。钱花了，熬夜也是真的，你暂时留在原岗，把考题里不懂的地方一项项圈出来。',
      echoYes: '照护员说机器昨晚终于没乱响。你检查完接头，轻轻合上柜门，隔壁的老人还在午睡。',
      echoNo: '家里的辅助设备报警，你按笔记先查接线。修好以后，你把熬夜的书收起来，今天早点睡。' },
    { k: 'mentor', age: 49, t: '把经验讲给别人听', fee: 6000, stat: '事业', job: 'freelance', title: '实务培训讲师',
      text: '社区培训班请你试讲这些年的工作经验。教材、录课和试课要六千块，你得练习把自己会做的事讲明白。',
      yes: '第一堂课讲得太快。你重做教材，几次试讲后拿到固定课时，才转去接培训的活。台下终于有人听懂了。',
      no: '你做得出来，却讲不清楚，没拿到固定课时。六千块没收回来，你照旧工作，把流程重新写了一遍。',
      echoYes: '学员带着自己做的成品回来，说照着你的步骤少走了弯路。你改掉教材里一处旧说法，又开了一堂课。',
      echoNo: '新人看着你写的流程，第一次独立做完了活。你没当成讲师，带人的时候倒少发了几次火。' },
    { k: 'studio', age: 58, t: '退休前的一次试营业', fee: 5000, stat: '人缘', job: 'freelance', title: '社区兴趣课主理人',
      text: '你想把这些年攒下的兴趣做成周末小课。借场地、材料和试课共五千块，邻居说会来，肯不肯付钱还得试。',
      yes: '续报的人比预想多。你算过一年收支，才辞去原工作。每次开课前，你都比学员早到半小时。',
      no: '热闹了两次，付费的人很少。你没有续租场地，工作照常，偶尔约邻居在公共活动室免费交流。',
      echoYes: '你翻到第一期歪歪扭扭的签到表。有的人还在，有的人搬走了，新报名的人问下周能不能带朋友来。',
      echoNo: '邻居还记得当年的试课，带着材料来找你。你们约好只交流，不租场地，也不用再算回本。' },
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
        stake: '每世仅一次改命。现在押上积蓄和精力，或把机会留到以后；后面的机会取决于你的处境。', text: r.text,
        choices: [
          { t: '照常过日子，暂不改命', canon: true, hint: '不花钱、不消耗机会；三年后会回望这次选择。',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'pass' })), res: '你把报价单收进抽屉，先过眼前的日子。这次没有花钱，改命机会还在。' },
          { t: '用掉本世改命机会，认真试一次', dev: 25, check: [r.stat, 55], cond: (g) => CN.cash(g) >= r.fee,
            hint: '无论成败都花 ' + CN.fmt(r.fee) + '，健康 −2；成功换一条职业路，失败保留原工作并学到经验。',
            fx: (g) => { take(g, true); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'yes' })); }, res: r.yes,
            fail: { fx: (g) => { take(g, false); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'no' })); }, res: r.no } },
          { t: '钱先留着，把眼前的账顾好', canon: true, cond: (g) => CN.cash(g) < r.fee,
            hint: '现金不足 ' + CN.fmt(r.fee) + '，本次不借钱入场，保留改命机会。',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'save' })), res: '你算完账，没有交报名的钱。先不让一家人的日常开销跟着冒险。' },
        ] },
      { id: id + '_echo', age: r.age + 3, t: '那次岔路以后', auto: true, echoOf: id,
        cond: (g) => !!(g.recall('turns') || {})[r.k],
        text: (g) => ({ yes: r.echoYes, no: r.echoNo, pass: '你又看到了类似的招募。想起三年前收起的那张报价单，才发现留在原路上也走出了这么远。', save: '你翻到三年前的账本。那笔没有花出去的钱，留给了当时更要紧的日子。' })[(g.recall('turns') || {})[r.k]],
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
    life.review = age < 50 ? '这一生短了一些，你认真走过的那些日子，仍然算数。'
      : rw ? (rw.ok ? '你花掉了那次改命机会，也亲手把另一种日子过成了日常。' : '那次没成的事，没有替你决定余下的一生。')
      : s.net < 0 ? '账本没能翻到轻松的那页，这一路，你已经很用力了。'
      : st['事业'] >= 85 && (st['健康'] < 40 || st['心情'] < 50) ? '工作群里总能找到你，留给自己的时间却总写着下次。'
      : life.wish && life.wish.length && life.wish.every((w) => w.ok) ? '十六岁写下的愿望，你后来真的一件件做了。'
      : st['心情'] >= 85 ? '你没把每一天都过成大事，却把小日子过出了滋味。'
      : '有些路走通了，有些没走通，你还是把这一生认真过完了。';
  };
  const endCards = G.endCards;
  G.endCards = (l, u) => {
    const { esc, card } = u;
    const turns = (l.turns || []).map((p) => '<li><b>' + p.age + ' 岁 · ' + esc(p.t) + '</b><p>' + esc(p.c) + (p.check ? (p.ok ? '（成功）' : '（失败）') : '') + '</p><p class="note">' + esc(p.res) + '</p></li>').join('');
    return (l.review ? card('这一生，留下一句话', '', '<p class="life-review">' + esc(l.review) + '</p>' + (turns ? '<ul class="ulist">' + turns + '</ul>' : '')) : '') + endCards(l, u);
  };
  const homeCards = G.homeCards;
  G.homeCards = (w, u) => {
    const al = JY.album(), ends = al.ends || {}, list = JY.FATE.ENDS;
    return homeCards(w, u) + '<section class="album"><div class="section-h"><h2>结局图鉴</h2><span>' + list.filter((e) => ends[e.k]).length + ' / ' + list.length + '</span></div><p class="note">未解锁的条目留下一个方向。同一世可能符合多种结局，主结局优先记录最鲜明的人生路线，符合的其他条目也会收录。</p><div class="ending-grid">'
      + list.map((e) => '<details class="card ending-entry' + (ends[e.k] ? ' unlocked' : '') + '"><summary>' + u.esc(ends[e.k] ? e.t : '未解锁 · ' + e.hint) + '</summary><p class="note">' + u.esc(ends[e.k] ? e.d : '线索：' + e.d) + '</p><small>' + (ends[e.k] ? '已记录 ' + ends[e.k] + ' 次' : '试着走一条不同的路') + '</small></details>').join('') + '</div></section>';
  };
  const badges = G.share.badges;
  G.share.badges = (l) => {
    const out = badges(l);
    if (!l.review) return out;
    const turn = (l.turns || []).find((p) => p.t && p.c.includes('改命')) || (l.turns || [])[0];
    const note = l.note ? out.shift() : null;
    return (note ? [note] : []).concat(['评语：' + l.review], out.slice(0, 1), turn ? [turn.age + ' 岁 · ' + turn.t + (turn.check ? (turn.ok ? '，成了' : '，没成') : '')] : [], out.slice(1));
  };
  G.howto.push(['一次改命', '一世只有一次。少数岔路会邀请你用积蓄和精力试一条新路，写明费用和成功率；失败也有后续。结局图鉴里可以寻找下一世想试的方向。']);
  JY.TURNING = { ROUTES, eligible };
})();

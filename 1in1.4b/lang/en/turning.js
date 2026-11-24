/* 由 share/tools/tr.js 从 data/turning.js 和 lang/en/tr/turning.json 生成，不要手改。 */
/* 每世一次改命；复用节点、判定、职业和回响，不累积跨世加成。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME, CN = JY.CN;
  const working = (g) => !g.recall('retired') && !['none', 'retired', 'soldier'].includes(g.recall('job') || 'none');
  const ROUTES = [
    { k: 'repair', age: 23, t: 'A New Rice Bowl from an Old Machine', fee: 6000, stat: '学识', job: 'mechanic', title: 'Equipment repair technician',
      text: 'The training centre has set out an old machine. Enrolment with tools costs ¥6,000, and the certificate doesn\'t guarantee a job.',
      yes: 'You work by day and practise taking machines apart at night. After passing the practical exam, a repair shop lets you start by taking orders. Your first pay buys a set of your own tools.',
      no: 'You fail the practical, and the fee isn\'t refundable. You carry the practice machine home and finally learn to fix that faulty-contact switch. Your old job still has to go on.',
      echoYes: 'The notes from your old disassembly practice are worn at the edges. When the new apprentice asks where the fault is, you tell him to listen to the sound first.',
      echoNo: 'A colleague\'s old fan breaks and you fix it from that repair notebook. You didn\'t change careers, but at least the learning wasn\'t wasted.' },
    { k: 'parcel', age: 28, t: 'A Trial Run in Eight Square Metres', fee: 8000, stat: '人缘', job: 'parcel', title: 'Community parcel station operator',
      text: 'A small room has opened up at the compound gate. Shelves, deposit and the trial run total ¥8,000, and the outlet doesn\'t guarantee any volume.',
      yes: 'After the trial run you get steady parcel-collection orders, and only then go through the formalities of leaving your old post. In the first week people keep taking the wrong parcel, so you renumber the shelves.',
      no: 'Three months of volume can\'t cover the rent. You clear the shelves, lose the deposit and setup costs, and go back to work as usual. At least you\'ve met half the compound.',
      echoYes: 'Someone comes to say goodbye before moving, saying that you were always the one who took in his parcels all these years. You hand over the last one, and the scanner beeps at the door again.',
      echoNo: 'On the street a neighbour still calls you "Station Chief". You laugh and correct them, saying you quit long ago, and they still hand you a bag of oranges.' },
    { k: 'remote', age: 34, t: 'Swap the Commute for a Workbench', fee: 12000, stat: '事业', job: 'freelance', title: 'Freelance design and document work',
      text: 'An acquaintance refers a trial job. A computer and software cost ¥12,000, and you want to try turning odd jobs into real work.',
      yes: 'You finish the trial job over a few evenings, and only resign after landing a long-term order. The workbench is by the window, lunch still goes cold, but you no longer rush for the last bus.',
      no: 'The client demands seven rounds of revisions and finally cancels the follow-up order. The computer money is already spent, so you keep your old job and leave software practice for weekends.',
      echoYes: 'The client from back then sends another request. You first list the timeline and number of revisions, then make a cup of tea, finally understanding how to put a price on your own time.',
      echoNo: 'The department suddenly needs a batch of old files sorted, and you finish in half a day with the software you learned back then. A colleague asks where you learned it, and you say you paid a bit of tuition.' },
    { k: 'caretech', age: 41, t: 'Understanding the Machine\'s Alarms', fee: 10000, stat: '学识', job: 'mechanic', title: 'Elder-care equipment maintenance technician',
      text: 'Night school training plus an internship costs ¥10,000. You\'ll have to squeeze time after work to relearn all those alarm codes.',
      yes: 'During the internship you find a connector that keeps causing false alarms. The care centre offers you a regular post, and after completing your resignation, you report in with your toolbox.',
      no: 'You fail the final practical round. The money is spent and the late nights were real, so you stay at your old post for now and circle the points you didn\'t understand in the exam questions one by one.',
      echoYes: 'The caregiver says the machine finally didn\'t go off randomly last night. After checking the connector, you quietly close the cabinet door, and the old person next door is still napping.',
      echoNo: 'The assistive device at home sounds an alarm, and you check the wiring first according to your notes. Once it\'s fixed, you put away the books from those late nights and go to bed early today.' },
    { k: 'mentor', age: 49, t: 'Passing Experience On', fee: 6000, stat: '事业', job: 'freelance', title: 'Practical skills trainer',
      text: 'A community training class invites you to give a trial lecture. Materials and recording cost ¥6,000, and you have to explain clearly what you know how to do.',
      yes: 'Your first class is too fast. You redo the materials, and after several trial lectures you get regular teaching hours, only then switching over to training work. Finally someone in the audience understands.',
      no: 'You can do it but can\'t explain it clearly, and don\'t get regular hours. The six thousand yuan isn\'t recovered; you carry on working as usual and rewrite the process from scratch.',
      echoYes: 'A student comes back with their own finished piece, saying your steps saved them detours. You fix one outdated statement in the materials and open another class.',
      echoNo: 'A newcomer follows the process you wrote and completes the job independently for the first time. You didn\'t become a trainer, but you lose your temper less often when mentoring.' },
    { k: 'studio', age: 58, t: 'A Trial Run Before Retirement', fee: 5000, stat: '人缘', job: 'freelance', title: 'Community hobby class organiser',
      text: 'You want to run a small weekend class. Venue and materials come to ¥5,000; neighbours say they\'ll come, but whether they\'ll pay remains to be seen.',
      yes: 'More people re-enrol than expected. Only after working out a year\'s income and expenses do you resign from your old job. Before each class, you arrive half an hour before the students.',
      no: 'It was lively twice, but few paid. You don\'t renew the venue and carry on working as usual, occasionally inviting neighbours to swap skills for free in the public activity room.',
      echoYes: 'You find the wobbly sign-in sheet from the first session. Some of those people are still around, some have moved away, and a new sign-up asks whether they can bring a friend next week.',
      echoNo: 'A neighbour remembers the trial class from back then and comes to you with materials. You agree to just swap ideas, with no rented venue and no need to calculate break-even again.' },
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
    repair: 'You\'ve worked with machines and learned technical skills before, and the teacher has you give it a try.',
    parcel: 'You\'ve done delivery or counter work and know how many people come and go here each day.',
    remote: 'All these years of copywriting, document and computer work have given you the groundwork to take on freelance orders.',
    caretech: 'You\'ve done technical or care work, and the care centre invites you for a trial shift.',
    mentor: 'With the skills and work experience you\'ve built up over the years, some people are willing to hear what you have to say.',
    studio: 'This time someone wants to learn from you the hobby you once studied seriously.',
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
        stake: '1 fate-change chance left in this life; later chances depend on your experiences.', text: (g) => origins[r.k] + r.text + (CN.moneyRoom ? CN.moneyRoom(g, r.fee) : ''),
        choices: [
          { t: 'Stay in the old post', canon: true, hint: 'No cost; the fate-change chance is kept.',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'pass' })), res: 'You put the price sheet in a drawer and get on with the days at hand. Nothing spent this time, and the fate-change chance remains.' },
          { t: 'Use a fate change to try switching careers', dev: 25, check: [r.stat, 55], cond: (g) => CN.cash(g) >= r.fee,
            hint: 'Cost ' + CN.fmt(r.fee) + ', Health −2; success means switching careers, failure means staying in your old post with Knowledge +3. The chance is used up either way.',
            fx: (g) => { take(g, true); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'yes' })); }, res: r.yes,
            fail: { fx: (g) => { take(g, false); g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'no' })); }, res: r.no } },
          { t: 'Look after the accounts in front of you first', canon: true, cond: (g) => CN.cash(g) < r.fee,
            hint: 'Not enough cash: ' + CN.fmt(r.fee) + '; no borrowing, and the chance is kept.',
            fx: (g) => g.remember('turns', Object.assign({}, g.recall('turns'), { [r.k]: 'save' })), res: 'After working out the accounts, you don\'t pay the enrolment fee. You won\'t risk the family\'s everyday expenses along with it.' },
        ] },
      { id: id + '_echo', age: r.age + 3, t: 'After That Fork in the Road', auto: true, echoOf: id,
        cond: (g) => !!(g.recall('turns') || {})[r.k],
        text: (g) => ({ yes: r.echoYes, no: r.echoNo, pass: 'You see a similar recruitment notice again. Remembering the price sheet you put away three years ago, you realise that staying on the old path has taken you this far too.', save: 'You find the ledger from three years ago. The money you didn\'t spend was kept for days that mattered more at the time.' })[(g.recall('turns') || {})[r.k]],
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
    life.review = age < 50 ? 'This life was a little short, but the days you lived with care still count.'
      : rw ? (rw.ok ? 'You used up that fate-change chance, and with your own hands turned another kind of life into everyday routine.' : 'The thing that didn\'t work out that time didn\'t decide the rest of your life for you.')
      : s.net < 0 ? 'The ledger never turned to an easy page, but along this road, you tried very hard.'
      : st['事业'] >= 85 && (st['健康'] < 40 || st['心情'] < 50) ? 'You could always be found in the work group chat, while the time for yourself was always written down as "next time".'
      : life.wish && life.wish.length && life.wish.every((w) => w.ok) ? (life.wishChange ? 'The life you later reconsidered, you took seriously and carried out one thing at a time.' : 'The wishes you wrote at sixteen, you really did carry out one by one.')
      : st['心情'] >= 85 ? 'You didn\'t make every day a great event, but you gave the small days their flavour.'
      : 'Some roads went through, some didn\'t, and you still lived this life through with care.';
  };
  const endCards = G.endCards;
  G.endCards = (l, u) => {
    const { esc, card } = u;
    const links = (l.reviewLinks || []).map((x) => '<li><p>' + esc(x.age + ' yrs · ' + x.choice) + '</p><p class="note">' + esc(x.echoAge + ' yrs · ' + x.result) + '</p></li>').join('');
    return (!G.endLayout && l.review ? card('One Last Line from This Life', '', '<p class="life-review">' + esc(l.review) + '</p>') : '')
      + (links ? '<div class="life-connections"><h3>What Became of Those Choices</h3><ul>' + links + '</ul></div>' : '') + endCards(l, u);
  };
  const homeCards = G.homeCards;
  G.homeCards = (w, u) => {
    const al = JY.album(), ends = al.ends || {}, list = JY.FATE.ENDS;
    const found = list.filter((e) => ends[e.k]), hidden = list.filter((e) => !ends[e.k]);
    return homeCards(w, u) + '<section class="album ending-album"><div class="section-h"><h2>Endings Album</h2>' + (found.length ? '<span>' + found.length + ' lives kept</span>' : '') + '</div>'
      + (found.length ? '<div class="ending-grid">' + found.map((e) => '<details class="card ending-entry unlocked"><summary>' + u.esc(e.t) + '</summary><p class="note">' + u.esc(e.d) + '</p><small>Recorded ' + ends[e.k] + ' time(s)</small></details>').join('') + '</div>'
        : '<p>Every kind of life has a page worth keeping.</p><p class="note">After you finish your first life, your ending will be recorded here.</p>')
      + (hidden.length ? '<details class="ending-hints"><summary>' + (found.length ? 'There are ' + hidden.length + ' more endings to discover · ' : '') + 'View hints</summary><p class="note">The hints below reveal life directions you haven\'t taken yet.</p><div class="ending-grid">'
        + hidden.map((e) => '<details class="card ending-entry"><summary>' + u.esc(e.hint) + '</summary><p class="note">' + u.esc(e.d) + '</p></details>').join('') + '</div></details>' : '') + '</section>';
  };
  const badges = G.share.badges;
  G.share.badges = (l) => {
    const out = badges(l);
    if (!l.review) return out;
    const turn = (l.turns || []).find((p) => (p.id || '').startsWith('t_rewrite_') || (p.t && p.c.includes('Fate change'))) || (l.turns || [])[0];
    const note = l.note ? out.shift() : null;
    return (note ? [note] : []).concat(['Verdict: ' + l.review], out.slice(0, 1), turn ? [turn.age + ' yrs · ' + turn.t + (turn.check ? (turn.ok ? ', it worked' : ', it didn\'t work') : '')] : [], out.slice(1));
  };
  G.howto.push(['One Fate Change', 'Once per life, with at most two invitations. The chance comes from your experiences; success or failure both cost something and both have consequences.']);
  JY.TURNING = { ROUTES, eligible };
})();

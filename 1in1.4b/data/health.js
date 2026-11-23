/* 长期透支的预警和工伤。范围节点沿用引擎意外的 e_ 前缀。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN, Y = [2026, 2165];
  JY.addEncounters([
    { id: 'e_h_overwork_warn', y: Y, minAge: 28, maxAge: 58, t: '身体叫了停', always: true, major: true, loc: 'hospital',
      cond: (g) => (g.recall('fatigue') || 0) >= 6 && !g.recall('fatigueWarn'),
      stake: '再拼下去，可能连休息的机会也没有。',
      text: (g) => g.recall('job') === 'rider' ? '送完一单，你在路边蹲下，半天站不起来。到医院时，医生问你上一次睡足是什么时候。' : ['tech', 'office', 'boss', 'doctor'].includes(g.recall('job')) ? '你在工位边晕了一下，同事把你送到急诊。医生说，这样的作息不能再拖。' : '体检单上多了一排红箭头。医生把报告推到你面前，说要停下来养一养。',
      choices: [
        { t: '请假调养一个月（¥3,000）', canon: true, hint: '少挣一点，先把身体缓过来', fx: (g) => { CN.pay(g, 3000); g.stat('健康', 8); g.stat('事业', -2); g.remember('fatigue', 2); g.remember('fatigueWarn', 'rest'); }, res: '你交了假条。头几天醒来，还以为自己迟到了。后来终于能睡到自然醒。' },
        { t: '换到轻一点的岗位', dev: 10, hint: '收入和事业降一档，往后少扛一些', fx: (g) => { g.stat('事业', -8); g.remember('lightDuty', true); g.remember('fatigue', 1); g.remember('fatigueWarn', 'change'); }, res: '你跟负责人谈了。工资少一截，傍晚出门时天还是亮的。' },
        { t: '吃药硬扛，接着干', dev: 15, hint: '事业继续往上走，持续透支有猝死风险', fx: (g) => { g.stat('事业', 2); g.remember('fatigueWarn', 'ignore'); }, res: '你把药放进包里。第二天，照常出门。' },
      ] },
    { id: 'e_h_overwork_echo', y: Y, minAge: 31, maxAge: 64, auto: true, always: true, t: '三年以后', echoOf: 'e_h_overwork_warn',
      cond: (g) => !!g.recall('fatigueWarn') && g.since('fatigueWarn') >= 3,
      text: (g) => {
        const way = g.recall('fatigueWarn'), tired = (g.recall('fatigue') || 0) >= 6;
        const t = way === 'ignore' ? (tired ? '当年的药盒换了几个，医生又问，你到底什么时候歇一歇。' : '当年你说还能扛。后来生活慢了一些，你复诊时也说起了作息的变化。')
          : way === 'change' ? (g.recall('lightDuty') ? '换到轻岗以后，你开始留意收工时的天色。身体还得慢慢照顾。' : '当年换岗的事，你复查时又提了一遍。后来工作变过，医生仍让你留意休息。')
          : tired ? '你记得那一个月的长觉。最近又忙起来，复查时你把这一年的安排讲给医生听。' : '你记得那一个月的长觉。忙起来时，也开始知道给自己留一天空。';
        return t + (CN.focusMemory ? CN.focusMemory(g) : '');
      },
      fx: (g) => g.stat('健康', g.recall('fatigueWarn') === 'ignore' ? -2 : 2) },
    { id: 'e_h_injury', y: Y, minAge: 22, maxAge: 50, t: '停工的那几天', loc: 'hospital',
      cond: (g) => ['worker', 'rider', 'driver', 'electrician', 'welder', 'cnc', 'renovation', 'mechanic', 'construction'].includes(g.recall('job')) && !g.recall('injury'),
      text: (g) => !['rider', 'driver'].includes(g.recall('job')) ? '搬货时你扭了腰，医院让你休息两周。班组把当天的记录找出来，问你打算怎么办。' : '下雨那天，你在路边滑了一下，脚踝肿起来。医生开了休息证明，你还得跟用工方谈这几天的账。',
      choices: [
        { t: '按流程申报，留好记录', canon: true, fx: (g) => { g.remember('injury', 'claim'); g.stat('事业', -1); g.stat('健康', -2); CN.earn(g, 5000); }, res: '材料补了几次，最后收到了 ¥5,000。你按医嘱歇足了日子。' },
        { t: '拿补偿私了（¥2,000）', dev: 10, fx: (g) => { g.remember('injury', 'settle'); g.stat('健康', -4); CN.earn(g, 2000); }, res: '你收了 ¥2,000，签完字就回去干活。走路时还会疼。' },
        { t: '怕丢工作，硬扛着干', dev: 15, fx: (g) => { g.remember('injury', 'bear'); g.stat('健康', -6); g.stat('事业', 1); }, res: '你把证明折进包底，跟工友说没事。' },
      ] },
    { id: 'e_h_injury_echo', y: Y, minAge: 25, maxAge: 56, t: '旧伤', auto: true, always: true, echoOf: 'e_h_injury',
      cond: (g) => !!g.recall('injury') && g.since('injury') >= 3,
      fx: (g) => g.stat('健康', g.recall('injury') === 'claim' ? 1 : -1),
      text: (g) => ({ claim: '那次伤养得还算好。你提醒新来的工友，工作记录和就诊单都要留着。', settle: '变天时旧伤还会疼。那张签过的纸，你找了很久也没找到。', bear: '旧伤时不时犯，你学会了先坐下歇一会儿，再说别的。' }[g.recall('injury')]) },
  ]);
})();

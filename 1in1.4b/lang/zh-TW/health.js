/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 长期透支的预警和工伤。范围节点沿用引擎意外的 e_ 前缀。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN, Y = [2026, 2165];
  JY.addEncounters([
    { id: 'e_h_overwork_warn', y: Y, minAge: 28, maxAge: 58, t: '身體叫了停', always: true, major: true, loc: 'hospital',
      cond: (g) => (g.recall('fatigue') || 0) >= 6 && !g.recall('fatigueWarn'),
      stake: '再拼下去，可能連休息的機會也沒有。',
      text: (g) => g.recall('job') === 'rider' ? '送完一單，你在路邊蹲下，半天站不起來。到醫院時，醫生問你上一次睡足是什麼時候。' : ['tech', 'office', 'boss', 'doctor'].includes(g.recall('job')) ? '你在工位邊暈了一下，同事把你送到急診。醫生說，這樣的作息不能再拖。' : '體檢單上多了一排紅箭頭。醫生把報告推到你面前，說要停下來養一養。',
      choices: [
        { t: '請假調養一個月（¥3,000）', canon: true, hint: '少掙一點，先把身體緩過來', fx: (g) => { CN.pay(g, 3000); g.stat('健康', 8); g.stat('事业', -2); g.remember('fatigue', 2); g.remember('fatigueWarn', 'rest'); }, res: '你交了假條。頭幾天醒來，還以為自己遲到了。後來終於能睡到自然醒。' },
        { t: '換到輕一點的崗位', dev: 10, hint: '收入和事業降一檔，往後少扛一些', fx: (g) => { g.stat('事业', -8); g.remember('lightDuty', true); g.remember('fatigue', 1); g.remember('fatigueWarn', 'change'); }, res: '你跟負責人談了。工資少一截，傍晚出門時天還是亮的。' },
        { t: '吃藥硬扛，接著幹', dev: 15, hint: '事業繼續往上走，持續透支有猝死風險', fx: (g) => { g.stat('事业', 2); g.remember('fatigueWarn', 'ignore'); }, res: '你把藥放進包裡。第二天，照常出門。' },
      ] },
    { id: 'e_h_overwork_echo', y: Y, minAge: 31, maxAge: 64, auto: true, always: true, t: '三年以後', echoOf: 'e_h_overwork_warn',
      cond: (g) => !!g.recall('fatigueWarn') && g.since('fatigueWarn') >= 3,
      text: (g) => {
        const way = g.recall('fatigueWarn'), tired = (g.recall('fatigue') || 0) >= 6;
        const t = way === 'ignore' ? (tired ? '當年的藥盒換了幾個，醫生又問，你到底什麼時候歇一歇。' : '當年你說還能扛。後來生活慢了一些，你複診時也說起了作息的變化。')
          : way === 'change' ? (g.recall('lightDuty') ? '換到輕崗以後，你開始留意收工時的天色。身體還得慢慢照顧。' : '當年換崗的事，你複查時又提了一遍。後來工作變過，醫生仍讓你留意休息。')
          : tired ? '你記得那一個月的長覺。最近又忙起來，複查時你把這一年的安排講給醫生聽。' : '你記得那一個月的長覺。忙起來時，也開始知道給自己留一天空。';
        return t + (CN.focusMemory ? CN.focusMemory(g) : '');
      },
      fx: (g) => g.stat('健康', g.recall('fatigueWarn') === 'ignore' ? -2 : 2) },
    { id: 'e_h_injury', y: Y, minAge: 22, maxAge: 50, t: '停工的那幾天', loc: 'hospital',
      cond: (g) => ['worker', 'rider', 'driver', 'electrician', 'welder', 'cnc', 'renovation', 'mechanic', 'construction'].includes(g.recall('job')) && !g.recall('injury'),
      text: (g) => !['rider', 'driver'].includes(g.recall('job')) ? '搬貨時你扭了腰，醫院讓你休息兩週。班組把當天的記錄找出來，問你打算怎麼辦。' : '下雨那天，你在路邊滑了一下，腳踝腫起來。醫生開了休息證明，你還得跟用工方談這幾天的賬。',
      choices: [
        { t: '按流程申報，留好記錄', canon: true, fx: (g) => { g.remember('injury', 'claim'); g.stat('事业', -1); g.stat('健康', -2); CN.earn(g, 5000); }, res: '材料補了幾次，最後收到了 ¥5,000。你按醫囑歇足了日子。' },
        { t: '拿補償私了（¥2,000）', dev: 10, fx: (g) => { g.remember('injury', 'settle'); g.stat('健康', -4); CN.earn(g, 2000); }, res: '你收了 ¥2,000，簽完字就回去幹活。走路時還會疼。' },
        { t: '怕丟工作，硬扛著幹', dev: 15, fx: (g) => { g.remember('injury', 'bear'); g.stat('健康', -6); g.stat('事业', 1); }, res: '你把證明折進包底，跟工友說沒事。' },
      ] },
    { id: 'e_h_injury_echo', y: Y, minAge: 25, maxAge: 56, t: '舊傷', auto: true, always: true, echoOf: 'e_h_injury',
      cond: (g) => !!g.recall('injury') && g.since('injury') >= 3,
      fx: (g) => g.stat('健康', g.recall('injury') === 'claim' ? 1 : -1),
      text: (g) => ({ claim: '那次傷養得還算好。你提醒新來的工友，工作記錄和就診單都要留著。', settle: '變天時舊傷還會疼。那張簽過的紙，你找了很久也沒找到。', bear: '舊傷時不時犯，你學會了先坐下歇一會兒，再說別的。' }[g.recall('injury')]) },
  ]);
})();

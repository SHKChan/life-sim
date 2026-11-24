/* 由 share/tools/tr.js 从 data/health.js 和 lang/en/tr/health.json 生成，不要手改。 */
/* 长期透支的预警和工伤。范围节点沿用引擎意外的 e_ 前缀。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN, Y = [2026, 2165];
  JY.addEncounters([
    { id: 'e_h_overwork_warn', y: Y, minAge: 28, maxAge: 58, t: 'Your Body Calls a Halt', always: true, major: true, loc: 'hospital',
      cond: (g) => (g.recall('fatigue') || 0) >= 6 && !g.recall('fatigueWarn'),
      stake: 'Keep pushing like this and you might not even get the chance to rest.',
      text: (g) => g.recall('job') === 'rider' ? 'After finishing a delivery, you crouch by the roadside and can\'t stand up for a long while. At the hospital, the doctor asks when you last got enough sleep.' : ['tech', 'office', 'boss', 'doctor'].includes(g.recall('job')) ? 'You feel faint beside your desk, and a colleague takes you to the emergency room. The doctor says this kind of schedule can\'t go on.' : 'The check-up report has a row of red arrows. The doctor pushes it in front of you and says you need to stop and recover.',
      choices: [
        { t: 'Take a month\'s leave to recover (¥3,000)', canon: true, hint: 'Earn a little less and let your body recover first', fx: (g) => { CN.pay(g, 3000); g.stat('健康', 8); g.stat('事业', -2); g.remember('fatigue', 2); g.remember('fatigueWarn', 'rest'); }, res: 'You hand in the leave slip. For the first few days you wake up thinking you\'re late. Eventually you can sleep until you wake naturally.' },
        { t: 'Move to a lighter post', dev: 10, hint: 'Income and career drop a notch, and you carry less from now on', fx: (g) => { g.stat('事业', -8); g.remember('lightDuty', true); g.remember('fatigue', 1); g.remember('fatigueWarn', 'change'); }, res: 'You talk to the person in charge. Your pay is cut a bit, but it\'s still light when you leave in the evening.' },
        { t: 'Take medicine, tough it out, and carry on', dev: 15, hint: 'Career keeps climbing, but continued overdrawing risks sudden death', fx: (g) => { g.stat('事业', 2); g.remember('fatigueWarn', 'ignore'); }, res: 'You put the medicine in your bag. The next day, you head out as usual.' },
      ] },
    { id: 'e_h_overwork_echo', y: Y, minAge: 31, maxAge: 64, auto: true, always: true, t: 'Three Years Later', echoOf: 'e_h_overwork_warn',
      cond: (g) => !!g.recall('fatigueWarn') && g.since('fatigueWarn') >= 3,
      text: (g) => {
        const way = g.recall('fatigueWarn'), tired = (g.recall('fatigue') || 0) >= 6;
        const t = way === 'ignore' ? (tired ? 'The pill box has been replaced a few times, and the doctor asks again when exactly you\'re going to rest.' : 'Back then you said you could push on. Life later slowed down a little, and at your follow-up you mention the change in routine.')
          : way === 'change' ? (g.recall('lightDuty') ? 'Since moving to the lighter post, you\'ve started noticing the sky when you finish work. Your body still needs slow care.' : 'At your check-up you mention the job change from back then again. Work has changed since, but the doctor still tells you to watch your rest.')
          : tired ? 'You remember that month of long sleeps. Things have got busy again recently, and at your check-up you tell the doctor how this year has been arranged.' : 'You remember that month of long sleeps. When things get busy, you\'ve learned to leave yourself one free day.';
        return t + (CN.focusMemory ? CN.focusMemory(g) : '');
      },
      fx: (g) => g.stat('健康', g.recall('fatigueWarn') === 'ignore' ? -2 : 2) },
    { id: 'e_h_injury', y: Y, minAge: 22, maxAge: 50, t: 'The Days Off Work', loc: 'hospital',
      cond: (g) => ['worker', 'rider', 'driver', 'electrician', 'welder', 'cnc', 'renovation', 'mechanic', 'construction'].includes(g.recall('job')) && !g.recall('injury'),
      text: (g) => !['rider', 'driver'].includes(g.recall('job')) ? 'You wrenched your back moving goods, and the hospital tells you to rest two weeks. The team pulls out that day\'s records and asks what you plan to do.' : 'On the rainy day, you slipped on the roadside and your ankle swelled up. The doctor gives you a rest certificate, and you still have to settle these days\' pay with your employer.',
      choices: [
        { t: 'Report through the proper process and keep records', canon: true, fx: (g) => { g.remember('injury', 'claim'); g.stat('事业', -1); g.stat('健康', -2); CN.earn(g, 5000); }, res: 'After submitting extra documents a few times, you finally receive ¥5,000. You rest the full days as the doctor ordered.' },
        { t: 'Settle privately for compensation (¥2,000)', dev: 10, fx: (g) => { g.remember('injury', 'settle'); g.stat('健康', -4); CN.earn(g, 2000); }, res: 'You take ¥2,000, sign, and go back to work. It still hurts when you walk.' },
        { t: 'Afraid of losing the job, tough it out', dev: 15, fx: (g) => { g.remember('injury', 'bear'); g.stat('健康', -6); g.stat('事业', 1); }, res: 'You fold the certificate into the bottom of your bag and tell your workmates it\'s nothing.' },
      ] },
    { id: 'e_h_injury_echo', y: Y, minAge: 25, maxAge: 56, t: 'Old Injury', auto: true, always: true, echoOf: 'e_h_injury',
      cond: (g) => !!g.recall('injury') && g.since('injury') >= 3,
      fx: (g) => g.stat('健康', g.recall('injury') === 'claim' ? 1 : -1),
      text: (g) => ({ claim: 'That injury healed reasonably well. You remind new workmates to keep their work records and medical receipts.', settle: 'The old injury still aches when the weather turns. You looked for that signed paper for a long time and never found it.', bear: 'The old injury flares up from time to time, and you\'ve learned to sit and rest first before anything else.' }[g.recall('injury')]) },
  ]);
})();

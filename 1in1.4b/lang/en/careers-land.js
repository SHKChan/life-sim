/* 由 share/tools/tr.js 从 data/careers-land.js 和 lang/en/tr/careers-land.json 生成，不要手改。 */
/* 行业线第三批：农业与建筑工地。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  Object.assign(CN.careerMemories, {
    cooperative: {
      steady: 'At fifty, you watched young people reweigh grain at the drying yard. Now, hearing it\'s harvest season again, you still remind old colleagues on the phone to settle accounts face to face.',
      learn: 'At fifty, you filed the purchase contracts by year. Now when old colleagues ask about the past, you first look up that year\'s returns, then explain how things changed afterwards.' },
    livestock: {
      steady: 'At fifty, you cut back the number of pens. Now when a neighbour talks about raising animals, you still ask whether the records are kept, and tell them not to skip the checks that need doing.',
      learn: 'At fifty, you handed the shared feed accounts to a younger person. Now when old colleagues mention the feed truck at the gate, you remember its sound, but you no longer take the whole ledger on yourself.' },
    grower: {
      steady: 'At fifty, you raised the seedling beds a little. Now, looking after a small pot by the window, you still touch the soil first before deciding whether to water.',
      learn: 'At fifty, you checked crate after crate of vegetables against the delivery slip. Now when the neighbourhood buys vegetables together, you help sort out the portions and keep the leftover bunch for your own soup.' },
    farmer: {
      steady: 'At fifty, you left the far field in someone else\'s care. Now, reading the weather forecast, you still think of the farming calendar, and chat with fellow villagers when you have a moment.',
      learn: 'At fifty, you handed your trial-planting notebook to a younger person. Now when they bring a new harvest, you leaf through those old records together and talk about which methods suit this year.' },
  });
  CN.careerMemories.construction = {
    steady: 'At fifty, you left the high work to others and taught newcomers finishing on the ground. Now when a neighbour fixes up a courtyard, you sit by and remind them how to lay out the tools, no longer climbing the scaffold.',
    learn: 'At fifty, you did acceptance checks with the drawings in hand. Now when someone renovating an old house asks you to look, you note each measurement, and still tell them to get a professional for anything structural.',
  };
  const lines = [
    { job: 'cooperative', title: 'The Scale at the Drying Yard',
      text: 'At the co-op\'s grain collection, a few families dispute the moisture and the weight. The buyer is waiting for a full truckload, and you hold two weighing slips that differ by quite a bit.',
      a: 'Reweigh everything together and settle the accounts on the spot', b: 'Negotiate graded purchasing with the buyer and keep separate accounts',
      ar: 'You recalibrate the scale and let each household watch the bagging. The truck leaves an hour late, but the accounts finally match.', br: 'Good grain and ordinary grain are bagged apart, with separate prices. Some grumble about the hassle, but nod after seeing the settlement slip.',
      a40: 'At collection time people still come to you to check the scale. The co-op\'s ledger is laid out on the table every quarter for anyone to look through.', b40: 'Graded purchasing slowly gains regular buyers. You keep a record of each household\'s quality and settlement, and check them all together at year\'s end.',
      a50: 'The young people start taking over the bookkeeping. You sit by the drying yard and watch them level the weight before opening the first bag.', b50: 'You file the contracts of many years by year. When the new person in charge asks, you first make sure he reads the clause on returns.' },
    { job: 'livestock', title: 'The Early Morning Feed Truck',
      text: 'Feed prices go up and the buyer presses prices down. This batch in the pens isn\'t ready for market yet, and the vet reminds you to do the disinfection and records properly rather than cutting corners to save money.',
      a: 'Hold the scale steady and get disease prevention right first', b: 'Order feed together with a few neighbours and split the transport',
      ar: 'You add no more pens, and every day first check the troughs and the animals\' spirits. The books are tighter, but you worry a little less at night.', br: 'You go house to house confirming quantities and payment dates, and sharing a truck saves on freight. Anyone who wants to back out must say so up front.',
      a40: 'Purchase prices bounce up and down, and you keep a reserve. Disinfection dates are posted in the pens, and you haven\'t missed a day.', b40: 'A few of the households in the group have changed, and those who remain pay first before each delivery. The feed truck knows the tree at your gate.',
      a50: 'You\'re fifty now and cut the pens back a bit. After checking them in the early morning, you can sit down and finish breakfast.', b50: 'You hand the supplier contacts and the accounts to a younger person. You still go to check the packaging and dates on the first truck yourself.' },
    { job: 'grower', title: 'The Temperature in the Greenhouse',
      text: 'A run of overcast days slows the vegetables\' growth while wholesale prices fall. The neighbouring greenhouse wants to rush to market early. You touch the damp soil and glance at the weather again.',
      a: 'Steady this crop and avoid growth boosters', b: 'Arrange scheduled deliveries with a canteen and harvest in batches',
      ar: 'You harvest in order of ripeness. You miss the peak price, but throw away fewer crates.', br: 'You bring a crate of samples to the canteen. They want fixed times and sizes, so you rearrange your harvest days.',
      a40: 'Sowing, pests and selling prices of every crop are written in your notebook. You already know which corner of this plot fears standing water most.', b40: 'A few canteens become regular buyers. When the yield drops, you call ahead to talk it over instead of padding the order with inferior produce.',
      a50: 'Bending for long hours hurts, so you raise a few seedling beds. The old land is still there; the way of planting changes slowly.', b50: 'The delivery van comes early to load the crates, and you check the count at the door. A few bunches of tender greens are left over, kept for your own lunch.' },
    { job: 'farmer', title: 'The Machine Rental Slip for Spring Ploughing',
      text: 'Spring ploughing runs into rain, so the rented machine can only get into the field a few days late. The neighbour wants to switch to a cash crop. You dig out last year\'s grain receipts and work out this year\'s seed money.',
      a: 'Plant familiar crops and secure your own food first', b: 'Try a new crop on a small plot',
      ar: 'You wait for the ground to dry before sowing. A neighbour helps for a whole morning, and at noon you share the hot noodles from the pot.', br: 'You try only a small patch and keep a separate page for seed amounts and harvest times. It sells so-so, but you learn what doesn\'t suit.',
      a40: 'You and the neighbour stagger your machine rental days and wait fewer times. After the harvest, you keep aside the few bags your own family will eat, as always.', b40: 'After a few rounds of trying, you keep the one that suits the local conditions. Market stallholders call ahead to ask which day you\'ll deliver.',
      a50: 'At fifty, you leave the farthest plot to a relative. The little field by your own door, you still walk around early each morning.', b50: 'You hand the trial-planting notebook to the young helper. The crops that lost money are circled more boldly than the ones that earned.' },
    { job: 'construction', title: 'Wind on the Scaffold',
      text: 'The wind picks up upstairs, and the foreman urges everyone to finish the day\'s work. The safety officer says to inspect the scaffold first; a few men, afraid of losing wages, stand below without moving.',
      a: 'Inspect first and go up only when it\'s safe', b: 'Learn surveying and layout, and move toward a technical post',
      ar: 'You point out the loose clamps. The foreman grumbles, but still has them tightened again.', br: 'After work you learn to read drawings from the technician, and by day you do the same old job. A small booklet now sits in your trouser pocket.',
      a40: 'The new labourer follows you upstairs. You check his safety belt first, then show him how to tie his tools down.', b40: 'You start laying out lines with the drawings. Errors have to be rechecked; the work is lighter, but you must be more careful.',
      a50: 'Your knees aren\'t what they were, so you go up high less and do more finishing on the ground. The new labourers first learn from you how to stow tools and materials securely, and the dates on the pay slips get checked one by one.', b50: 'At fifty, you lead a team through the pre-acceptance check. Every change on the drawings must be recorded, and only after the last dimension is confirmed do you put the tape away.' },
  ];
  CN.TRADE_JOBS = (CN.TRADE_JOBS || []).concat(lines.map((x) => x.job));
  lines.forEach((x) => JY.addLifeNodes([
    { id: 'i_' + x.job + '_30', age: 30, t: x.title, cond: (g) => g.recall('job') === x.job, text: x.text,
      choices: [
        { t: x.a, canon: true, fx: (g) => { g.remember('land30', { job: x.job, route: 'steady' }); g.stat('人缘', 2); }, res: x.ar },
        { t: x.b, dev: 10, fx: (g) => { g.remember('land30', { job: x.job, route: 'learn' }); g.stat('学识', 2); g.stat('心情', -1); }, res: x.br },
      ] },
    { id: 'i_' + x.job + '_40', age: 40, t: 'Work You Know Well', auto: true, echoOf: 'i_' + x.job + '_30', cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('land30'); return r && r.job === x.job && r.route === 'learn' ? x.b40 : x.a40; },
      fx: (g) => { const r = g.recall('land30'); if (r && r.job === x.job) g.stat(r.route === 'learn' ? '事业' : '人缘', 3); } },
    { id: 'i_' + x.job + '_50', age: 50, t: 'Years on the Land', auto: true, echoOf: 'i_' + x.job + '_30', cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('land30'); return r && r.job === x.job && r.route === 'learn' ? x.b50 : x.a50; },
      fx: (g) => { const r = g.recall('land30'); if (r && r.job === x.job) { g.remember('career50', { job: x.job, route: r.route }); g.stat(r.route === 'learn' ? '事业' : '心情', 2); } } },
  ]));
})();

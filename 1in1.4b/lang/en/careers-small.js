/* 由 share/tools/tr.js 从 data/careers-small.js 和 lang/en/tr/careers-small.json 生成，不要手改。 */
/* 行业线第一批：小生意、手艺与制造。小抉择顺其自然，不增加停下来问的次数。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  CN.careerMemories = {
    restaurant: {
      steady: 'At fifty, you taught young people how to make that sauce. Now, when you occasionally cook a full meal, someone still asks if they can learn. You pass over the salt jar and let them taste for themselves.',
      learn: 'At fifty, you checked group-meal orders one by one. Now when the neighbourhood holds a shared meal, you help count heads and portions, and when it\'s done you sit down and eat with everyone.',
      rest: 'At fifty, you left some slack at the end of lunch service. Now you don\'t rush your cooking either: you pick two things at the morning market and slowly simmer a pot of soup.' },
    mechanic: {
      steady: 'At fifty, you taught young people to listen to an engine. Now when acquaintances talk about their old cars, you can still offer a few words, and for anything you\'re unsure of, you tell them to have it checked.',
      learn: 'At fifty, you used diagnostic records to teach fault finding. Now when people in the neighbourhood learn to fix small appliances, you tell them your habit: cut the power first, then check.',
      rest: 'At fifty, you left gaps in the repair bays. Now your tools sit in a corner at home; you wipe them down when you have time, put them away after use, and no longer rush for the next job.' },
  };
  CN.careerMemory = (g) => {
    const r = g.recall('career50');
    const text = r && CN.careerMemories[r.job] && CN.careerMemories[r.job][r.route];
    return typeof text === 'string' ? text : '';
  };
  Object.assign(CN.careerMemories, {
    beauty: {
      steady: 'At fifty, you kept unhurried appointments for old regulars. Now, meeting acquaintances, you still chat about the small talk in front of that mirror.',
      learn: 'At fifty, you left the finishing of complex hairstyles to young people. Now, flipping through your portfolio, you point to a page and describe how you practised that one cut.',
      rest: 'At fifty, you spaced out appointments to give your back a rest. Now, even doing your own hair, you settle yourself first and take it slowly.' },
    grocery: {
      steady: 'At fifty, you\'d rather stock a few rows less than fill the storeroom. Now, shopping, you still check the date first and think about what\'s actually missing at home.',
      learn: 'At fifty, you checked the freezer temperature daily. Now, helping distribute food in the neighbourhood, you pick out what needs refrigeration first and explain clearly before leaving.',
      rest: 'At fifty, you tightened up the shelves and rested when it was your turn. Now, after buying vegetables, you sit by the street, watch familiar faces pass, and chat a little.' },
    electrician: {
      steady: 'At fifty, you stayed on the ground checking drawings. Now when someone asks about the wiring at home, you tell them to have a licensed person inspect it first, and to keep the old plans.',
      learn: 'At fifty, you taught young people to verify maintenance readings. Now, sorting old records, you still circle the power-off confirmation step for anyone who comes to ask.',
      rest: 'At fifty, you stopped packing maintenance jobs so tightly. Now, seeing the old toolbox, you straighten the meter probes and then sit down for a drink of water.' },
    welder: {
      steady: 'At fifty, you began inspecting welds. Now, meeting old workmates, you talk about the bend that had to be redone, and everyone remembers it clearly.',
      learn: 'At fifty, you went through your certification practice book again. Now when someone asks about the craft, you start with protection and inspection, and the weld seams you draw on paper are very fine.',
      rest: 'At fifty, you left room to stop and rest. Now, after wiping those goggles, you put them away and slowly loosen your shoulders.' },
    cnc: {
      steady: 'At fifty, you drew common deviations as little diagrams. Now when an old colleague sends a new version of the chart, you zoom in and study it for a long time, then add one old lesson of your own.',
      learn: 'At fifty, you led a trial of a new process. Now, leafing through the old program book, you recall that test cut, and the dimensions you changed are still pencilled in the margin.',
      rest: 'At fifty, you stopped filling your shifts. Now, doing small jobs around the house, you\'ve also got used to measuring carefully before starting, and stopping when tired.' },
    renovation: {
      steady: 'At fifty, you taught people on the ground how to lay tiles and check for hollow spots. Now, finding old photos of houses you worked on, you zoom in on the doorway and remember the finishing touches.',
      learn: 'At fifty, you cut down the number of sites you took at once. Now when someone asks about repairing a house, you help list the acceptance items, and leave the construction to those in the trade.',
      rest: 'At fifty, you left gaps between jobs. Now, tidying at home, you only do one small spot, then sit down and look it over, in no hurry for the next.' },
  });
  // 每行的两个走法、十年后的回响和五十岁的落点都按行当写。
  const lines = [
    { job: 'restaurant', name: 'Restaurant', title: 'The Lunch Rush Accounts',
      text: 'After the lunch rush, you tip the leftovers into the bin and work out that this month\'s waste comes to over three thousand yuan. A fast-food place has opened next door, and your regulars have gone to try it.',
      a: 'Cut six slow-selling dishes and hold on to the signature ones', b: 'Spend ¥8,000 on the kitchen and take nearby group-meal orders', fee: 8000,
      ar: 'The menu is down to two pages. The cook works faster, and the regulars still order that same dish.', br: 'You visit five workplaces and win two lunch orders. Every day the boxes must be sealed by half past ten.',
      a40: 'You add a small portion next to the signature dish. Regulars nearby have had children and still come for a bowl at lunch break.', b40: 'Group-meal clients have changed a few times. You write each day\'s portions on a whiteboard, take on a bit less, and still deliver on time.',
      a50: 'At fifty, you teach the new cook how to make that sauce. After the lunch rush, you sit down and eat a bowl of hot noodles yourself.', b50: 'You hand the delivery counts and flavour notes to a young person to check. Before each batch comes out, you still taste the first bite yourself.',
      r40: 'The lunch-hour work is scheduled a bit looser. You no longer rush several pots in a row, you have time to sit and eat after finishing, and regulars know to come early.',
      r50: 'At fifty, you say up front which jobs you can\'t make in time and don\'t force them. Once the kitchen is cleaned up, your evenings are your own.' },
    { job: 'beauty', name: 'Hair & Beauty', title: 'Regulars at the Mirror',
      text: 'Customers ask if you can do the new trendy styles. The training course costs ¥6,000, and you\'d also have to close the shop for three days. The regulars say your old skills are good too.',
      a: 'Do right by the regulars\' cuts and colouring first', b: 'Close for three days and learn the new techniques', fee: 6000,
      ar: 'You write each regular\'s usual length in your book. Some bring the whole family to get their hair cut.', br: 'On your first day back, you practise on a wig until late. The first new customer studies the mirror for a long time, then smiles.',
      a40: 'One regular has had her hair cut by you for years, from her job-hunting photo to her baby\'s one-month photo.', b40: 'You\'ve built up a few portfolios. When the young apprentice asks about technique, you hand over the scissors and tell him to take his time.',
      a50: 'Standing long makes your back ache, so you space out the appointments. The regulars say no rush and make tea while they wait.', b50: 'You\'ve hired two young people. Complex styles go to them, and you sit by to watch the finishing.' },
    { job: 'grocery', name: 'Convenience Store', title: 'Expiry Dates on the Shelf',
      text: 'At month-end stocktaking, a case of drinks is about to expire. The wholesaler urges you to stock another batch, saying it will sell before the holiday. You spread the receipts all over the counter.',
      a: 'Buy less and clear the old stock first', b: 'Spend ¥10,000 on a chiller to sell fresh food', fee: 10000,
      ar: 'You stick discount labels on the near-expiry shelf. You earn a little less, but a corner of the storeroom is finally clear.', br: 'The chiller is plugged in, and every morning you inspect the fresh milk and tofu. The electricity bill goes up too.',
      a40: 'A few new neighbours have moved in around you, and you already know who wants big bags of rice and who only buys a small bottle of oil.', b40: 'Fresh food spoils, but it also brings people who come daily for breakfast. You keep adjusting the order quantities.',
      a50: 'At fifty, the stocktake ledger is thinner than before. You\'d rather stock two rows less than tie up money in the storeroom again.', b50: 'Every day you check the chiller temperature, then set out the small stool at the door. The old folks nearby like to rest here.' },
    { job: 'mechanic', name: 'auto repair', title: 'Under the Lift',
      text: 'An old car has hung on the lift half the day, and the fault light keeps coming on. A new diagnostic tool costs ¥12,000, and the shop next door has already bought one. The owner is still waiting at the door.',
      a: 'Trace the wiring and understand the old car first', b: 'Buy the diagnostic tool and take more car models', fee: 12000,
      ar: 'You find a frayed wire, replace it, and test-drive three times. The owner takes the old part away.', br: 'You read the manual until midnight. The next day\'s car you diagnose first, then give the owner a clear price.',
      a40: 'Old customers change cars but still come to you for servicing. You lay out the removed parts one by one for him to see.', b40: 'Models keep multiplying and your tool cabinet fills with labels. At last some people are willing to pay the diagnostic fee separately.',
      a50: 'You no longer crawl under the tightest chassis; instead you take your apprentice to listen to the engine. The torch beam is still steady.', b50: 'The shop\'s diagnostic tool has gone through two generations. You hand the readings and fault records to a young person to verify, then test-drive together.',
      r40: 'You spread out your bookings and leave enough time first for complicated faults. With a few fewer cars to rush, you can finally eat lunch on time.',
      r50: 'At fifty, you no longer fill every bay. It\'s still light when you put away the tools, and on the way home you don\'t have to phone to explain why you\'re late.' },
    { job: 'electrician', name: 'Electrician', title: 'The Distribution Box Drawings',
      text: 'You\'re hired for an old building\'s renovation, where the corridor cables are tangled like yarn. The foreman is pushing to seal the conduits, and you find two households\' circuits haven\'t been separated yet.',
      a: 'Check each line against the drawings and finish a day late', b: 'Spend ¥4,000 learning testing and buy a set of instruments', fee: 4000,
      ar: 'You relabel the circuits. The foreman grumbles about the slowness, but says not a word at acceptance.', br: 'The new meter finds a leakage point. You copy the result into the record and give it to the resident to keep.',
      a40: 'The labels in the distribution boxes you did are still clear. The property management has changed hands, but when problems come up they still look up your number.', b40: 'More maintenance orders come in. After every job you photograph the readings and keep them even after the warranty expires.',
      a50: 'You leave the ladder work to the young ones and check drawings on the ground. The step of cutting power and hanging the tag is one nobody may skip.', b50: 'When you take your apprentice on maintenance calls, you first teach him to put his pen away, confirm there\'s no power, and only then start.' },
    { job: 'welder', name: 'Welder', title: 'A Weld Seam',
      text: 'The workshop takes a batch of pressure pipe fittings, and the master has you weld the sample piece. Piece-rate pay is higher, but if it fails flaw detection you must redo it. Behind the goggles you\'re drenched in sweat.',
      a: 'Follow the familiar procedure and protect the pass rate', b: 'Spend ¥5,000 on a higher-grade welding certificate', fee: 5000,
      ar: 'You grind the weld smooth, and the piece you hand in passes first time. Your pay slip doesn\'t jump, but there\'s less rework.', br: 'You practise on test plates after work, and your hands are steady on exam day. The certificate goes into your tool bag.',
      a40: 'The team leaves the hard-to-weld corners to you. You let new workers watch beside you first, with no rush to get their hands on it.', b40: 'With the certificate, you join the crew for a few equipment overhauls. Income rises, and so do the days away from home.',
      a50: 'You start inspecting welds. When you say where repairs are needed, workers take off their gloves and look carefully.', b50: 'Renewing your certificate at fifty, you dig out that practice book again. You must keep the craft, but also look after your eyes and lungs.' },
    { job: 'cnc', name: 'CNC machining', title: 'Two Hundredths Off',
      text: 'The tolerance on the new part is tight, and the first piece is two hundredths of a millimetre off. The shift leader pushes for output, and you stare at the gauge and check the tool wear again.',
      a: 'Stop the machine to recalibrate, giving up a shift\'s output', b: 'Spend ¥6,000 learning programming and process engineering', fee: 6000,
      ar: 'After re-setting the tool, the dimensions hold steady. You make a few dozen fewer pieces that day, and the scrap bin stays empty.', br: 'You start practising by changing one line of a program. A few months later, you no longer have to wait for the engineer to test-cut new parts.',
      a40: 'The line changes several machines, and you handle first-piece inspection. After using the gauges, you wipe them clean and put them back in their box.', b40: 'You can now plan processes yourself. When the workshop schedules new orders, they come to ask you first how to make the fixture.',
      a50: 'You draw common deviations as little diagrams and post them beside the machine. Newcomers can look up and check, scrapping a few fewer pieces.', b50: 'At fifty, you lead two people in trying a new process. Before closing the machine\'s door, you still lean in to confirm the clamp once more.' },
    { job: 'renovation', name: 'Renovation', title: 'The Wall Before Tiling',
      text: 'The owner wants to skip the waterproofing test and urges you to start tiling. The materials you brought are piled at the door, and the next client\'s schedule is already lined up.',
      a: 'Wait for the water test to pass before starting', b: 'Spend ¥3,000 learning waterproofing tests and do a full acceptance', fee: 3000,
      ar: 'You wait two days, and sure enough a little seeps through downstairs. You repair it, then tile, and the owner treats you to an extra bowl of soup.', br: 'You compile materials, photos and test times into one record. At final payment, both sides check it line by line.',
      a40: 'An old client refers a new household, saying you\'re a bit slow, but that the finished work doesn\'t get damp.', b40: 'The small crew you lead starts taking whole-home renovations. After each job, you sweep the doorway clean before leaving.',
      a50: 'Your knees can\'t kneel that long any more. You teach the apprentice to lay tiles and take charge of the final hollow-spot check yourself.', b50: 'You no longer take three jobs at once. With one site fewer, you can get home for a hot meal in the evening.' },
  ];
  const rest = {
    beauty: ['You leave gaps between appointments and sit for a while when you\'ve stood too long. Regulars book ahead, so you can eat on time after the work is done.', 'At fifty, you no longer stand through a whole day without a break. The scissors go into the drawer, your back eases, and you get on with your own things.'],
    grocery: ['You separate restocking from tidying time and no longer carry boxes while eating. The familiar shelves get sorted slowly, and the count comes out clear.', 'At fifty, you\'ve tightened up the shelves a bit. You rest when it\'s your turn and don\'t cram everything into after closing time.'],
    electrician: ['You leave enough travel time between maintenance jobs and no longer rush from one place to the next. You have time to check the labels before finishing.', 'At fifty, you discuss high-climbing work with your partner first. You don\'t force overly tight maintenance schedules, and you put your tools away before leaving.'],
    welder: ['You write rest breaks into your schedule. You take off the goggles, drink some water, and wait for your eyes to recover before continuing.', 'At fifty, you no longer rush several shifts in a row. When your hands stop, you can slowly loosen your shoulders and check your protective gear.'],
    cnc: ['You cut back extra overtime. Once the machine has stopped, you wipe the gauges clean and put them away, and your meals no longer go cold before you eat.', 'At fifty, you don\'t fill every shift. When the closing bell rings, you hand in the dimension records and go, leaving a little time for yourself in the evening.'],
    renovation: ['You leave a gap between two jobs. You finish the edges at the previous place before going to the next, no longer dashing back and forth.', 'At fifty, you say in advance which jobs you can\'t make in time. When the day\'s work is done you put the tools away, and no longer force yourself to kneel on tired knees.'],
  };
  const employee = {
    beauty: { text: 'A customer asks about the new trendy styles. The training course costs ¥6,000 and takes three rest days; the master says you must keep practising the old cutting and colouring too.', choice: 'Spend ¥6,000 and swap shifts to learn the new techniques', result: 'You swap shifts with a colleague and go to class with a wig. Back at work, you practise until fluent, then discuss with the master which styles to take on.' },
    grocery: { text: 'At month-end you help with stocktaking, and a case of drinks is about to expire. The store plans to add fresh food, and you\'ve asked about a cold-chain and fresh-food management course costing ¥10,000.', choice: 'Spend ¥10,000 learning fresh-food and cold-chain management', result: 'You note down how to check temperatures and count spoilage, then help tend the fresh-food shelves. The money for equipment and stock is still arranged by the store.' },
    mechanic: { text: 'The old car\'s fault light keeps coming on, and you haven\'t yet mastered the shop\'s new diagnostic tool. A course on new-model diagnostics costs ¥12,000, and you read its description for a long time after work.', choice: 'Spend ¥12,000 learning new-model diagnostics', result: 'You take the classes in your free time, then practise again against the diagnostic records. For faults you\'re unsure of, you still check together with the master.' },
  };
  lines.forEach((x) => { if (rest[x.job]) [x.r40, x.r50] = rest[x.job]; });
  CN.TRADE_JOBS = (CN.TRADE_JOBS || []).concat(lines.map((x) => x.job));
  lines.forEach((x) => JY.addLifeNodes([
    { id: 'i_' + x.job + '_30', age: 30, t: x.title, cond: (g) => g.recall('job') === x.job,
      text: (g) => !g.recall('tradeOwn') && employee[x.job] ? employee[x.job].text : x.job === 'restaurant' && !g.recall('tradeOwn') ? 'After the lunch rush, the master has you help check the leftovers. The restaurant wants to take group meals, and you\'ve asked about a meal-prep course costing ¥8,000. The usual work still has to be done, and whether to study is up to you.' : x.text, choices: [
        { t: x.a, canon: true, fx: (g) => { g.remember('trade30', { job: x.job, route: 'steady' }); g.stat('事业', 2); }, res: x.ar },
        { t: (g) => !g.recall('tradeOwn') && employee[x.job] ? employee[x.job].choice : x.job === 'restaurant' && !g.recall('tradeOwn') ? 'Spend ¥8,000 learning group-meal prep' : x.b, dev: 10, cond: (g) => CN.cash(g) >= x.fee + 10000,
          fx: (g) => { CN.pay(g, x.fee); g.remember('trade30', { job: x.job, route: 'learn' }); g.stat('学识', 3); }, res: (g) => !g.recall('tradeOwn') && employee[x.job] ? employee[x.job].result : x.job === 'restaurant' && !g.recall('tradeOwn') ? 'You go to class after work, then try out a prep order with the master. When the first batch of boxes is sealed, it\'s half an hour earlier than usual.' : x.br },
        { t: 'Ease off for now and take on a little less work', dev: 10, fx: (g) => { g.remember('trade30', { job: x.job, route: 'rest' }); g.stat('心情', 2); g.stat('事业', -1); }, res: 'You loosen this month\'s schedule a little and leave yourself a few free days.' },
      ] },
    { id: 'i_' + x.job + '_40', age: 40, t: x.name + ': The Years', auto: true, echoOf: 'i_' + x.job + '_30',
      cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('trade30'); return r && r.job === x.job && r.route === 'rest' && x.r40 ? x.r40 : r && r.job === x.job && r.route === 'learn' ? x.b40 : x.a40; },
      fx: (g) => { const r = g.recall('trade30'); if (r && r.job === x.job && r.route === 'learn') { CN.earn(g, 6000); g.log('The skills you\'ve learned over the years bring in an extra job, settled for ¥6,000.', 'auto'); } else if (r && r.job === x.job && r.route === 'rest') g.stat('心情', 2); } },
    { id: 'i_' + x.job + '_50', age: 50, t: 'Days of Working with Your Hands', auto: true, echoOf: 'i_' + x.job + '_30',
      cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('trade30'); return r && r.job === x.job && r.route === 'rest' && x.r50 ? x.r50 : r && r.job === x.job && r.route === 'learn' ? x.b50 : x.a50; },
      fx: (g) => { const r = g.recall('trade30'); if (r && r.job === x.job && CN.careerMemories[x.job]) g.remember('career50', { job: x.job, route: r.route }); if (r && r.job === x.job && r.route === 'steady') g.stat('人缘', 3); if (r && r.job === x.job && r.route === 'rest') g.stat('健康', 2); } },
  ]));
})();

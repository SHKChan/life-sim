/* 由 share/tools/tr.js 从 data/careers-service.js 和 lang/en/tr/careers-service.json 生成，不要手改。 */
/* 行业线第二批：教育医疗、运输快递、照护与家政。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  Object.assign(CN.careerMemories, {
    doctor: {
      steady: 'At fifty, you took fewer night shifts but still checked the handover sheet. Now, meeting young colleagues, you first ask whether they\'ve handed over everything that needed handing over.',
      learn: 'At fifty, people came to you with old medical records. Now, leafing through your case notes, you leave the new questions you\'re unsure about for colleagues still on the job to discuss.' },
    nurse: {
      steady: 'At fifty, you taught new nurses bedside care. Now, sorting your own check-up reports, you write down your questions one by one.',
      learn: 'At fifty, you drew care diagrams for patients going home. Now, when a community talk asks you to share your experience, you first remind everyone that specific cases still need to be checked with medical staff.' },
    driver: {
      steady: 'At fifty, you turned down runs of several night drives. Now, travelling by car, a service area reminds you of that bowl of hot noodles, and you tell your companions to take a rest.',
      learn: 'At fifty, you showed newcomers the regular route. Now, when an old partner calls, you talk about the narrow bends and places to park, though the road has long since been widened a little.' },
    rider: {
      steady: 'At fifty, you kept your deliveries to familiar blocks. Now, strolling past those entrances, you still recognise a few doormen and stop to say hello.',
      learn: 'At fifty, you helped sort orders at the station. Now, when an old colleague messages on a rainy day, you first ask whether the roads are slippery; arriving a bit slower is fine.' },
    parcel: {
      steady: 'At fifty, you learned to wait for your partner before lifting big items. Now, picking up a parcel, you hold the door when you see a young person with a hand truck.',
      learn: 'At fifty, you taught people to check tracking numbers. Now, helping a neighbour write a shipping address, you still read the name and phone number aloud once more before sealing it.' },
    maternity: {
      steady: 'At fifty, you stopped taking live-in care jobs back to back. Now, finding that record book, you remember the early mornings spent explaining things slowly to a family.',
      learn: 'At fifty, you did more daytime coaching. Now when someone asks about caring for a child, you first listen to their situation, and if you\'re unsure, you advise them to ask a doctor.' },
    eldercare: {
      steady: 'At fifty, you did the lifting and supporting work together with colleagues. Now that you need care yourself, you state your habits clearly so no one has to guess.',
      learn: 'At fifty, you drew up care plans. Now, discussing your own care arrangements, you point out the things by the bed one by one: which are handy, which are in the way.' },
    housekeeping: {
      steady: 'At fifty, you cut back your jobs and kept only the nearby clients. Now, tidying your own home, you do a little each day, and still have time to sit and look out the window.',
      learn: 'At fifty, you went over the acceptance checklist with your partner. Now when someone asks how to clean old things, you look at the material first and don\'t try methods that don\'t suit it.' },
  });
  CN.careerMemories.teacher = {
    steady: 'At fifty, you still asked about the blank question in a homework book. Now when someone brings a child to ask about studying, you let the child speak first and don\'t rush to choose a path for them.',
    learn: 'At fifty, you sat in on young teachers\' trial lessons. Now, when occasionally invited back to observe a class, you bring a marked workbook and jot down the new methods afterwards.',
  };
  const lines = [
    { job: 'teacher', title: 'The Workbook in the Back Row',
      text: 'A child in your class keeps handing in blank papers. The teaching group presses you for open-lesson materials, and the child\'s parents only say they\'re busy at work. You leave the empty workbook on your desk.',
      a: 'First find out where the child is stuck', b: 'Work out a tiered homework set with the teaching group',
      ar: 'You find he hasn\'t even caught up with last year\'s material. Every day after school you keep him ten extra minutes and start from there.', br: 'You and your colleagues revise the questions over several rounds. Some find it a hassle, but after a term there are finally fewer blank papers.',
      a40: 'Class after class of students goes by. Some come back to see you, and what they talk about is always those ten minutes after school.', b40: 'You bind the homework sets you tried into a booklet, and new teachers taking over a class borrow it first.',
      a50: 'At fifty, you need reading glasses to mark homework. Faced with a blank, you still call the child over to ask. Some come back after graduating with their own children, wanting you to hear out the child\'s difficulties first.', b50: 'After the teaching meeting, you stay to hear a young teacher\'s trial lesson. In later trial runs of new lessons, they always send the workbooks over first for you to mark together.' },
    { job: 'doctor', title: 'Before the Handover',
      text: 'At the early-morning handover, one patient\'s follow-up results aren\'t back yet. The family clutches the payment slip and keeps asking, and you\'ve already worked twelve hours of night shift.',
      a: 'Write out the condition and next steps clearly before handing over', b: 'Sign up for the department\'s case discussions to build experience in this area',
      ar: 'You go through the orders with the incoming doctor, then explain once more to the family. Back in the duty room, the soy milk has gone cold.', br: 'You bring the case file to the discussion. The senior doctors ask in detail, and your notebook fills up.',
      a40: 'A young doctor asks you to check the handover sheet. You circle the item most easily missed and have him check it again.', b40: 'You often chair difficult-case discussions. You let the youngest speak first, then check the evidence point by point.',
      a50: 'The department schedules you fewer night shifts. Passing the ward after work, you still glance at that handover sheet.', b50: 'In your clinic at fifty, someone always turns up with a medical record from years ago. The cover is worn, but the notes are still clear.' },
    { job: 'nurse', title: 'The Call Bell',
      text: 'Before the handover, the call bell in the corridor rings again. The new colleague is slow at dispensing, and an elderly patient who has just had surgery needs two people to turn.',
      a: 'First sort out the bedside work with your colleague', b: 'Compete for a place in specialist nursing training',
      ar: 'You reschedule your time and attend to the post-surgery bed first. The old man grips your hand and thanks you.', br: 'The training takes up several rest days. You practise the procedures many times, then lead your colleagues through them back in the ward.',
      a40: 'On the new nurse\'s first shift, you go through the orders with her. She\'s so nervous she forgot her pen, so you hand her one.', b40: 'The specialist nursing clinic starts scheduling you. Someone brings a bag of used dressings and asks whether they changed them correctly.',
      a50: 'With fewer night shifts, you start mentoring. When turning a patient, you still ask first whether it hurts.', b50: 'You draw common care issues as diagrams for patients to take home. Many families fold the paper up neatly.' },
    { job: 'driver', title: 'This Load',
      text: 'Dispatch adds a last-minute night run. Delivering it pays ¥1,200 more, but your eyelids are already heavy, and there\'s a stretch of mountain road ahead.',
      a: 'Sleep first, even if it means one run fewer', b: 'Ask dispatch for a fixed daytime route',
      ar: 'You pull into a service area. After waking, you eat a bowl of noodles and leave at daybreak.', br: 'The rate on a fixed route is a little lower, but the loaders come to know you, and your time of getting home becomes predictable.',
      a40: 'There\'s now a cushion in the cab. You write each rest into your trip sheet and no longer gamble on the last drowsy hour.', b40: 'You\'ve run that route for years, and the warehouse keeper knows you\'ve arrived the moment he sees your plate. When holiday traffic jams up, someone even saves you a meal.',
      a50: 'Renewing your licence at fifty, the medical form carries an extra warning. You turn down runs of several nights in a row.', b50: 'You start showing new drivers the route, explaining every narrow bend and every place to park.' },
    { job: 'rider', title: 'The Last Two Orders in the Rain',
      text: 'Rain starts in the evening rush, and the two orders in your box go in opposite directions. The station manager says there\'s a bonus for extra orders, and your raincoat cuffs are already soaked.',
      a: 'Take the safe route and skip two orders', b: 'Sign up to mentor newcomers at the station',
      ar: 'You tie your raincoat tight by the roadside and wait for the green light. On delivery, the customer hands you two tissues.', br: 'You teach newcomers to read building numbers and tie meal boxes shut. Your own order count dips a little, and the station adds a mentoring allowance.',
      a40: 'In the compounds you often run, the doormen all know you. You stick the date on your newly swapped battery, reminding yourself to rest when you need to.', b40: 'Several of the team leaders at the station were trained by you. On the day of the downpour, you help them rearrange routes.',
      a50: 'You keep your delivery range to a few familiar blocks. After the noon run, you can sit down and eat something hot.', b50: 'At fifty, you stay more at the station sorting orders. Before the young ones head out, you straighten a crooked helmet for them.' },
    { job: 'parcel', title: 'Parcels Piled at the Door',
      text: 'The parcel station has changed sorters again. Parcels pile up at the door; someone takes the wrong item, someone says you close too early. By the time the stocktake is done it\'s half past ten.',
      a: 'Rearrange the shelves and fix pickup hours', b: 'Team up with nearby shops for convenient mailing',
      ar: 'You move the big items to the bottom shelf and post a schedule on the wall. Some people are unhappy, but get used to it within days.', br: 'You and the shop owner work out how to split each order. With more parcels, you also have to reconcile accounts together at month\'s end.',
      a40: 'Students have grown into working adults and still come here to pick up parcels. You know their names, and remember not to close at mealtimes.', b40: 'Partner outlets open and close; you keep the two reliable ones. You settle accounts weekly, and neither side holds the other up.',
      a50: 'Your back isn\'t what it was, so you buy a hand truck. You no longer force the big items yourself and wait for your partner to return.', b50: 'You raise the packing table a bit, and your back is straighter. Your partner brings a new apprentice, who starts by learning how you check tracking numbers.' },
    { job: 'maternity', title: 'The Bottle at Dawn',
      text: 'The baby wakes crying in the night, and the new mother\'s eyes are red too. The grandparents on both sides each have their own ideas about feeding, and you haven\'t finished your log.',
      a: 'Keep records as agreed and patiently explain to the whole family', b: 'Use spare time to take a postnatal care course',
      ar: 'You write down the feeding amounts, sleep and things to watch for. The grandparents read the log, and their voices gradually quiet.', br: 'On your days off, you go to the hands-on classes. You come back with new methods, and know which situations call for the family to see a doctor.',
      a40: 'A family you looked after before refers a new client. In the contract, you spell out your rest time too.', b40: 'You can now train newcomers. Rule one is wash your hands first; rule two is don\'t promise anything when you\'re unsure.',
      a50: 'At fifty, you no longer take non-stop live-in jobs. On the baby\'s one-month day, the family keeps you for another bowl of soup.', b50: 'You do more daytime coaching now. When a young mother opens the log book, you first make her sit down for a sip of water.' },
    { job: 'eldercare', title: 'At the Bedside',
      text: 'The newly arrived old man refuses to eat and keeps mistaking you for someone else. The family asks why he hasn\'t put on any weight this week, and you have several pages of care records to hand in.',
      a: 'Ask patiently about his habits and care by the clock', b: 'Study care for the disabled and communication',
      ar: 'You find the old man simply isn\'t used to food that\'s too hard. After switching to soft rice, the spoon finally moves.', br: 'In class you practise transfers and fall prevention. Back at work, you first clear the clutter around the bed, and your movements are gentler.',
      a40: 'A family member remembers your name. After taking the old man for a check-up, they bring you a lunch box too.', b40: 'You become the team\'s mentor. Each time you demonstrate turning a patient, you explain to the old person first, then let the newcomer try.',
      a50: 'Your back is struggling, so you agree with your partner to do any lifting and supporting work together.', b50: 'You start organising care plans and do less heavy lifting. The old people who know you raise their heads at the sound of your voice.' },
    { job: 'housekeeping', title: 'A Ring of Keys',
      text: 'The employer suddenly adds a whole wall of windows, and asks if you could also watch the kids for two hours. Your scheduled hours are already full, and you look at the contract.',
      a: 'Stick to the contract and state the price of extras clearly', b: 'Learn detail cleaning and take specialised appointment jobs',
      ar: 'You list what you can do and what costs extra separately. The client thinks it over and drops one item.', br: 'You learn to tell stone types and cleaning agents apart. Before your first job, you test a bit in an inconspicuous corner.',
      a40: 'Several employers keep asking you to renew. You always remember to put out fresh shoe covers at the door.', b40: 'Your toolbox grows more complete and you begin quoting by project. At acceptance, you check the edges and corners together with the employer.',
      a50: 'You cut your weekly jobs and keep the nearby clients. One fewer bus transfer on the way, and you get home earlier.', b50: 'At fifty, you take on a big job with a young partner. You leave the high places to her and go over the acceptance checklist once more yourself.' },
  ];
  CN.TRADE_JOBS = (CN.TRADE_JOBS || []).concat(lines.map((x) => x.job));
  lines.forEach((x) => JY.addLifeNodes([
    { id: 'i_' + x.job + '_30', age: 30, t: x.title, cond: (g) => g.recall('job') === x.job, text: x.text,
      choices: [
        { t: x.a, canon: true, fx: (g) => { g.remember('service30', { job: x.job, route: 'steady' }); g.stat('人缘', 2); }, res: x.ar },
        { t: x.b, dev: 10, fx: (g) => { g.remember('service30', { job: x.job, route: 'learn' }); g.stat('学识', 2); g.stat('心情', -1); }, res: x.br },
      ] },
    { id: 'i_' + x.job + '_40', age: 40, t: 'A Long Time in the Trade', auto: true, echoOf: 'i_' + x.job + '_30', cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('service30'); return r && r.job === x.job && r.route === 'learn' ? x.b40 : x.a40; },
      fx: (g) => { const r = g.recall('service30'); if (r && r.job === x.job) g.stat(r.route === 'learn' ? '事业' : '人缘', 3); } },
    { id: 'i_' + x.job + '_50', age: 50, t: 'A Different Approach', auto: true, echoOf: 'i_' + x.job + '_30', cond: (g) => g.recall('job') === x.job,
      text: (g) => { const r = g.recall('service30'); return r && r.job === x.job && r.route === 'learn' ? x.b50 : x.a50; },
      fx: (g) => { const r = g.recall('service30'); if (r && r.job === x.job) { g.remember('career50', { job: x.job, route: r.route }); g.stat(r.route === 'learn' ? '事业' : '心情', 2); } } },
  ]));
})();

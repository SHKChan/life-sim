/* 由 share/tools/tr.js 从 data/travel.js 和 lang/en/tr/travel.json 生成，不要手改。 */
/* 国内走动与会回来的短期外派；不设置留学定居标记 abroadStay。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const working = (g) => !!g.recall('job') && !['none', 'retired'].includes(g.recall('job'));
  const kids = (g) => ['k1', 'k2', 'k3'].filter((id) => JY.byId[id] && g.alive(id));
  const married = (g) => g.recall('love') === 'married' && g.alive('sp');
  const dispatchScene = (g) => g.move(['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? 'factory' : 'office', 'Short-term assignment · Return on schedule');
  const studyScene = (g) => g.move(g.recall('job') === 'teacher' ? 'campus' : ['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : 'office', 'Three-month training · Return to your unit');
  const petCare = (g) => { const p = CN.pet(g); if (p) { CN.pay(g, 600); g.log('Before leaving, you spend ¥600 to have someone look after ' + p.name + '.', 'auto'); } };
  const trip = (g, fee) => { CN.pay(g, fee); petCare(g); g.stat('心情', 3); };
  JY.addLifeNodes([
    { id: 't_gradtrip', age: 22, t: 'Graduation Trip',
      cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')) || !!g.recall('uni') || g.recall('edu') === 'college',
      text: 'Around graduation, classmates discuss in the group chat where to go for a trip. Some list ticket and hostel prices, and some have already packed for their internships.',
      choices: [
        { t: 'Travel cheaply by slow train (¥800)', canon: true, fx: (g) => { trip(g, 800); g.remember('gradTrip', 'cheap'); g.move('hsr', 'Graduation Trip Station'); }, res: 'You share bunk beds and take turns carrying the kettle. The group photo on the platform was kept for many years.' },
        { t: 'Go farther with classmates (¥3,000)', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => { trip(g, 3000); g.remember('gradTrip', 'far'); g.move('coast', 'Graduation Trip · The Seaside'); g.stat('人缘', 3); }, res: 'You wait for a sunrise by the sea. After returning, some go off to cities far away.' },
        { t: 'Skip it and start the internship', dev: 10, fx: (g) => { g.remember('gradTrip', 'intern'); g.move(['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : g.recall('job') === 'teacher' ? 'school' : 'office', 'Starting the Internship'); g.stat('事业', 3); }, res: 'When they post their photos, you\'ve just been issued a temporary work badge. You say you\'ll treat them to a meal when they\'re back.' },
      ] },
    { id: 't_move', age: 31, t: 'Move to a New City', major: true,
      cond: (g) => working(g) && !g.recall('abroadStay') && !['own', 'mortgage'].includes(g.recall('house')) && !kids(g).some((id) => g.ageOf(id) >= 6 && g.ageOf(id) < 18)
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      stake: 'New income, new rent, and getting to know the people around you all over again.',
      text: 'A friend sends two job postings, one in a tier-one city and one in a new tier-one city. Your lease is almost up, so this time you can move farther.',
      choices: [
        { t: 'Go to a tier-one city (moving ¥5,000)', dev: 15, fx: (g) => { trip(g, 5000); g.remember('cityMove', 'first'); CN.goCity(g, 1, CN.pick(['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'])); g.remember('house', 'rent'); g.stat('事业', 4); g.stat('人缘', -3); }, res: 'The boxes sit in the newly rented room. The pay is a little higher, and the rent a good deal higher.' },
        { t: 'Go to a new tier-one city (moving ¥3,000)', dev: 10, fx: (g) => { trip(g, 3000); g.remember('cityMove', 'second'); CN.goCity(g, 2, CN.pick(['Chengdu', 'Wuhan', 'Nanjing', 'Hangzhou'])); g.remember('house', 'rent'); g.stat('事业', 2); g.stat('人缘', -1); }, res: 'You find a place first, then move. There\'s a cheap noodle shop downstairs, and the owner soon remembers you.' },
        { t: 'Stay Put', canon: true, fx: (g) => { g.remember('cityMove', 'stay'); g.stat('人缘', 2); }, res: 'You renew the lease. The familiar roads are still there, and when friends invite you to dinner, you don\'t have to ask the address.' },
      ] },
    { id: 't_dispatch', age: 36, t: 'A Half-Year Assignment', major: true,
      cond: (g) => working(g) && ['office', 'tech', 'sales', 'boss', 'worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: 'Go for a short time and return on schedule; behind the allowance is half a year\'s absence from home.',
      text: (g) => (['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? 'The factory asks if you\'d go to a plant in Southeast Asia for half a year of technical guidance.' : 'The company asks if you\'d support an overseas branch for half a year.') + 'You come back when it\'s over, with a half-year allowance of ¥30,000.' + (married(g) && kids(g).length ? 'The school runs and family matters will have to be rearranged.' : 'You circle the dates on the calendar.'),
      choices: [
        { t: 'Go for half a year and arrange things at home', dev: 15, fx: (g) => { g.remember('dispatch', 'half'); dispatchScene(g); CN.earn(g, 30000); g.stat('事业', 5); if (married(g) && kids(g).length) { g.stat('心情', -2); g.stat('人缘', -2); } petCare(g); }, res: 'You set off with your suitcase and return to your old post on schedule. The breakfast shop by the door is still there.' },
        { t: 'Let someone else go this time', canon: true, fx: (g) => { g.remember('dispatch', 'no'); g.stat('人缘', 1); }, res: 'You push the list back. On the day of the send-off, you carry a colleague\'s suitcase for part of the way.' },
        { t: 'Try to go for only three months', dev: 10, check: ['学识', 55], fx: (g) => { g.remember('dispatch', 'quarter'); dispatchScene(g); CN.earn(g, 15000); g.stat('事业', 3); petCare(g); }, res: 'The handover plan is approved. Three months later, you return as planned.', fail: { fx: (g) => g.remember('dispatch', 'no'), res: 'The short-term plan isn\'t approved. You stay at your post, and a colleague goes.' } },
      ] },
    { id: 't_study_abroad_short', age: 39, t: 'A Three-Month Training', major: true,
      cond: (g) => ['teacher', 'doctor', 'civil', 'nurse'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: 'You bring back some skills, but someone has to look after things at home for those three months.',
      text: (g) => (g.recall('job') === 'teacher' ? 'The school gives you a place to sit in on classes at a school abroad.' : ['doctor', 'nurse'].includes(g.recall('job')) ? 'The hospital gives you a place for training at a hospital abroad.' : 'Your unit has a place for training abroad in public services.') + 'Three months, returning to your unit afterwards, with ¥5,000 out of your own pocket.',
      choices: [
        { t: 'Go for the training after handing over properly', dev: 10, fx: (g) => { trip(g, 5000); g.remember('study3m', 'go'); studyScene(g); g.stat('学识', 4); g.stat('事业', 2); }, res: 'You fill two notebooks. After returning, you photocopy the useful pages for colleagues.' },
        { t: 'Give the place to a younger person', canon: true, fx: (g) => { g.remember('study3m', 'no'); g.stat('人缘', 2); }, res: 'When the young colleague returns, they bring you a thin local booklet.' },
        { t: 'Go first, and come back if there\'s an emergency at home', dev: 15, cond: (g) => kids(g).length > 0 || married(g) || g.alive('fa') || g.alive('mo'), fx: (g) => { trip(g, 5000); g.remember('study3m', 'early'); studyScene(g); g.stat('学识', 2); g.stat('事业', -1); }, res: 'Home suddenly needs looking after, and you hurry back two weeks early. For the remaining classes, you ask a colleague to bring back the handouts.' },
      ] },
    { id: 't_family_trip', age: 40, t: 'A Family Holiday', cond: (g) => kids(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) < 18),
      text: 'The child digs out a map and says classmates are going to see the sea this summer. You tally your savings and the leave you can take, with the tutoring class start date still marked on the calendar.',
      choices: [
        { t: (g) => CN.cash(g) < 2000 ? 'Pack a lunch for a nearby park (¥100)' : 'Drive or rent a car nearby (¥2,000)', canon: true, fx: (g) => { trip(g, CN.cash(g) < 2000 ? 100 : 2000); g.remember('familyTrip', 'drive'); g.move('road', 'Suburban Outing'); }, res: 'You go out with lunch boxes and find shade under a tree. The child picks up a stone shaped like a little boat.' },
        { t: 'Group tour to the seaside in China (¥6,000)', dev: 10, cond: (g) => CN.cash(g) >= 6000, fx: (g) => { trip(g, 6000); g.remember('familyTrip', 'sea'); g.move('coast', 'Domestic Seaside'); }, res: 'The group meals don\'t suit your taste, but the sea breeze is real. On the way back the suitcase is full of sand.' },
        { t: 'Overseas trip (¥20,000, short round trip)', dev: 15, cond: (g) => CN.cash(g) >= 80000, fx: (g) => { trip(g, 20000); g.remember('familyTrip', 'overseas'); g.move('coast', 'Short Overseas Trip'); }, res: 'The child looks at the boarding pass all the way, and after returning fills a notebook with pasted tickets.' },
        { t: 'Enrol in the tutoring class first (¥1,500)', dev: 10, fx: (g) => { CN.pay(g, 1500); g.remember('familyTrip', 'class'); g.move('school', 'At the Tutoring Class Door'); g.stat('心情', -1); }, res: 'You put the map away and say next time. When you take the child to the classroom at the weekend, the sky is very blue.' },
      ] },
    { id: 't_echo41', age: 41, t: 'Old Tickets in the Suitcase', auto: true, echoOf: ['t_gradtrip', 't_move', 't_dispatch', 't_study_abroad_short', 't_family_trip'],
      cond: (g) => !!(g.recall('gradTrip') || g.recall('cityMove') || g.recall('dispatch') || g.recall('study3m') || g.recall('familyTrip')),
      text: (g) => {
        const out = [];
        if (g.recall('gradTrip')) out.push(g.recall('gradTrip') === 'intern' ? 'A classmate sends old photos from the graduation trip, and you recognise the train you missed back then.' : 'The group photo from the graduation trip resurfaces, and the chat goes on for quite a while.');
        if (g.recall('cityMove')) out.push(g.recall('cityMove') === 'stay' ? 'You think of the decision to renew the lease back then; whether or not you still live in the same place, life has moved on.' : 'Photos from the move back then turn up again, and those first days finding your way around now feel familiar in memory.');
        if (g.recall('dispatch')) out.push(g.recall('dispatch') === 'no' ? 'A colleague back from assignment gives you a bag of snacks and talks about the food during those six months.' : 'The experience brought back from the short-term assignment helps you handle a difficult handover.');
        if (g.recall('study3m')) out.push(g.recall('study3m') === 'no' ? 'A young colleague lends you their training notes, and you photocopy a few pages.' : 'That training notebook is still in the drawer, with the useful parts dog-eared.');
        if (g.recall('familyTrip')) out.push(g.recall('familyTrip') === 'class' ? 'You think again of the map you put away back then, and leave two free days for the next holiday.' : 'Finding the photos from that outing, you remember the little thing the child brought back.' + (married(g) ? 'You look through them for a while with your partner, each remembering slightly different details.' : 'You slowly flip through all the photos, and the laughter from that year is still clear.'));
        const pet = CN.pet(g);
        if (pet) out.push('Before packing, you first checked the care arrangements for ' + pet.name + '.');
        return (out.length > 3 ? [out[0]].concat(out.slice(-2)) : out).join('');
      }, fx: (g) => { if (g.recall('dispatch') && g.recall('dispatch') !== 'no') g.stat('事业', 2); if (g.recall('study3m') && g.recall('study3m') !== 'no') g.stat('学识', 2); } },
  ]);
})();

/* 由 share/tools/tr.js 从 data/pets.js 和 lang/en/tr/pets.json 生成，不要手改。 */
/* 成年后的宠物，沿用 economy.js 的 petNow、寿命和名字。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN, Y = [2026, 2165];
  const adopt = (g, fee) => {
    CN.pay(g, fee);
    const p = CN.adoptPet(g, (Number(g.recall('seed')) || 0) % 2 ? 'dog' : 'cat');
    g.stat('心情', 3); return p;
  };
  JY.addEncounters([
    { id: 'e_pet_adopt', y: Y, minAge: 25, maxAge: 35, t: 'The Little Animal at the Door', always: true,
      cond: (g) => !g.recall('adultPet') && !CN.pet(g) && g.recall('hhPlace') !== 'dorm' && !g.recall('abroadStay')
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      text: (g) => (g.recall('kidPet') === 'kept' ? 'You still remember the ' + CN.kidPetName(g) + '.' : '') + 'The rescue shelter sends an adoption notice, and there\'s a pet shop nearby too. You first check whether your home allows pets, then start working out the yearly food and vet costs.',
      choices: [
        { t: 'Adopt one (health check ¥500)', canon: true, fx: (g) => g.remember('adultPet', Object.assign({ way: 'adopt' }, adopt(g, 500))), res: (g) => 'You name it ' + CN.pet(g).name + '. At first it hides under the bed, and later waits for you at the door.' },
        { t: 'Buy one from a reputable shop (¥3,000)', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => g.remember('adultPet', Object.assign({ way: 'buy' }, adopt(g, 3000))), res: (g) => 'You keep the receipt and vaccine record and bring ' + CN.pet(g).name + ' home. The first night, it knocks over the water bowl twice.' },
        { t: 'Not for now', dev: 10, fx: (g) => g.remember('adultPet', { way: 'no' }), res: 'You forward the notice to a friend who\'d like a pet. On the way out, you drop off a bag of pet food at the shelter.' },
      ] },
    { id: 'e_pet_lease', y: Y, minAge: 26, maxAge: 45, t: 'The Lease Renewal Agreement', always: true,
      cond: (g) => !!CN.pet(g) && !!g.recall('adultPet') && g.recall('house') === 'rent' && g.since('adultPet') >= 2,
      text: (g) => 'At lease renewal, the landlord says there are scratch marks in the flat and doesn\'t want pets from now on.' + CN.pet(g).name + ' lies by the door while you dig out the old chat log from when you first asked.',
      choices: [
        { t: 'Fix the scratches and put it clearly in the lease (¥800)', canon: true, fx: (g) => { CN.pay(g, 800); g.remember('petLease', 'repair'); }, res: 'You have the wall corner repaired and write the pet-keeping and move-out inspection terms into a supplementary clause.' },
        { t: 'Move to a flat that explicitly allows pets (¥3,000)', dev: 10, fx: (g) => { CN.pay(g, 3000); g.remember('petLease', 'move'); g.stat('心情', 2); }, res: 'You move with it to another street. The new landlord asks its name first, then says to keep the doors and windows shut.' },
        { t: 'Leave it with a trusted friend long-term', dev: 15, fx: (g) => { g.remember('petLease', 'friend'); g.remember('petNow', null); g.stat('心情', -2); }, res: 'The friend sends photos of it eating and sleeping. Every so often you visit, bringing toys it knows.' },
      ] },
    { id: 'e_pet_farewell', y: Y, minAge: 35, maxAge: 60, t: 'The Bowl Put Away', auto: true, always: true, echoOf: ['e_pet_adopt', 'e_pet_lease'],
      cond: (g) => { const p = g.recall('adultPet'); return p && p.way !== 'no' && !CN.pet(g) && g.Y - p.y > p.life; },
      text: (g) => { const p = g.recall('adultPet'); return g.recall('petLease') === 'friend' ? 'You visit your friend\'s home and see that the ' + p.name + '\'s little bowl has been put away in the cupboard. It spent its last days among people it knew. You sit and talk about how it looked when it first came.' : 'For more than a decade, your companion the ' + p.name + 'After it\'s gone, you wash its little bowl and put it away.' + (p.way === 'adopt' ? 'The registration form from the adoption is still tucked in the vaccine record.' : 'The receipt from when you bought it has faded.') + 'Sometimes at the usual hour you still glance at the door; only later did you slowly drop the habit.'; },
      fx: (g) => { g.stat('心情', -2); if (g.recall('petLease') === 'repair' || g.recall('petLease') === 'move') g.stat('人缘', 1); } },
    { id: 'e_pet_no_echo', y: Y, minAge: 30, maxAge: 40, t: 'The Friend\'s Photo', auto: true, always: true, echoOf: 'e_pet_adopt',
      cond: (g) => g.recall('adultPet') && g.recall('adultPet').way === 'no' && g.since('adultPet') >= 4,
      text: 'The friend who got your forwarded notice back then sends a photo holding a cat. It\'s basking on the windowsill, and you say it\'s been looked after so well.' },
  ]);
})();

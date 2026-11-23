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
    { id: 'e_pet_adopt', y: Y, minAge: 25, maxAge: 35, t: '门口的小动物', always: true,
      cond: (g) => !g.recall('adultPet') && !CN.pet(g) && g.recall('hhPlace') !== 'dorm' && !g.recall('abroadStay')
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      text: (g) => (g.recall('kidPet') === 'kept' ? '你还记得小时候的' + CN.kidPetName(g) + '。' : '') + '救助站发来领养消息，附近也有宠物店。你先问清了住处能不能养，开始算每年的口粮和看病钱。',
      choices: [
        { t: '领养一只（体检 ¥500）', canon: true, fx: (g) => g.remember('adultPet', Object.assign({ way: 'adopt' }, adopt(g, 500))), res: (g) => '你给它起名叫' + CN.pet(g).name + '。它先躲在床底，后来会守在门口等你。' },
        { t: '去正规店买一只（¥3,000）', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => g.remember('adultPet', Object.assign({ way: 'buy' }, adopt(g, 3000))), res: (g) => '你留好票据和疫苗本，带着' + CN.pet(g).name + '回家。第一晚，它把水碗打翻了两次。' },
        { t: '这几年先不养', dev: 10, fx: (g) => g.remember('adultPet', { way: 'no' }), res: '你把消息转给愿意养的朋友。出门时，顺手给救助站送去一袋粮。' },
      ] },
    { id: 'e_pet_lease', y: Y, minAge: 26, maxAge: 45, t: '续租时的约定', always: true,
      cond: (g) => !!CN.pet(g) && !!g.recall('adultPet') && g.recall('house') === 'rent' && g.since('adultPet') >= 2,
      text: (g) => '续租时，房东说屋里有抓痕，往后不想让养宠物。' + CN.pet(g).name + '趴在门边，你翻出当初问过的聊天记录。',
      choices: [
        { t: '修好抓痕，写清租约（¥800）', canon: true, fx: (g) => { CN.pay(g, 800); g.remember('petLease', 'repair'); }, res: '你找人补好墙角，把养宠和退租验收的约定都写进补充条款。' },
        { t: '换间明确允许养的房（¥3,000）', dev: 10, fx: (g) => { CN.pay(g, 3000); g.remember('petLease', 'move'); g.stat('心情', 2); }, res: '你带它搬到另一条街。新房东先问名字，又说门窗要关好。' },
        { t: '托熟悉的朋友长期照看', dev: 15, fx: (g) => { g.remember('petLease', 'friend'); g.remember('petNow', null); g.stat('心情', -2); }, res: '朋友发来吃饭和睡觉的照片。你隔一阵去看看，带上它熟悉的玩具。' },
      ] },
    { id: 'e_pet_farewell', y: Y, minAge: 35, maxAge: 60, t: '收好的小碗', auto: true, always: true, echoOf: ['e_pet_adopt', 'e_pet_lease'],
      cond: (g) => { const p = g.recall('adultPet'); return p && p.way !== 'no' && !CN.pet(g) && g.Y - p.y > p.life; },
      text: (g) => { const p = g.recall('adultPet'); return g.recall('petLease') === 'friend' ? '你去朋友家，看见' + p.name + '的小碗收进了柜子。它在熟悉的人身边走完了最后一段日子。你们坐着，说起它刚来时的样子。' : '陪伴十几年的' + p.name + '离开以后，你把它的小碗洗干净收起来。' + (p.way === 'adopt' ? '领养时的那张登记单，还夹在疫苗本里。' : '当年买它时留的票据，字已经淡了。') + '有时到点还会往门口看一眼，后来才慢慢改掉这个习惯。'; },
      fx: (g) => { g.stat('心情', -2); if (g.recall('petLease') === 'repair' || g.recall('petLease') === 'move') g.stat('人缘', 1); } },
    { id: 'e_pet_no_echo', y: Y, minAge: 30, maxAge: 40, t: '朋友的照片', auto: true, always: true, echoOf: 'e_pet_adopt',
      cond: (g) => g.recall('adultPet') && g.recall('adultPet').way === 'no' && g.since('adultPet') >= 4,
      text: '当年收到你转发消息的朋友，发来一张抱着猫的照片。窗台上晒着太阳，你说养得真好。' },
  ]);
})();

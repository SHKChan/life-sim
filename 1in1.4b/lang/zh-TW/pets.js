/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
    { id: 'e_pet_adopt', y: Y, minAge: 25, maxAge: 35, t: '門口的小動物', always: true,
      cond: (g) => !g.recall('adultPet') && !CN.pet(g) && g.recall('hhPlace') !== 'dorm' && !g.recall('abroadStay')
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      text: (g) => (g.recall('kidPet') === 'kept' ? '你還記得小時候的' + CN.kidPetName(g) + '。' : '') + '救助站發來領養訊息，附近也有寵物店。你先問清了住處能不能養，開始算每年的口糧和看病錢。',
      choices: [
        { t: '領養一隻（體檢 ¥500）', canon: true, fx: (g) => g.remember('adultPet', Object.assign({ way: 'adopt' }, adopt(g, 500))), res: (g) => '你給它起名叫' + CN.pet(g).name + '。它先躲在床底，後來會守在門口等你。' },
        { t: '去正規店買一隻（¥3,000）', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => g.remember('adultPet', Object.assign({ way: 'buy' }, adopt(g, 3000))), res: (g) => '你留好票據和疫苗本，帶著' + CN.pet(g).name + '回家。第一晚，它把水碗打翻了兩次。' },
        { t: '這幾年先不養', dev: 10, fx: (g) => g.remember('adultPet', { way: 'no' }), res: '你把訊息轉給願意養的朋友。出門時，順手給救助站送去一袋糧。' },
      ] },
    { id: 'e_pet_lease', y: Y, minAge: 26, maxAge: 45, t: '續租時的約定', always: true,
      cond: (g) => !!CN.pet(g) && !!g.recall('adultPet') && g.recall('house') === 'rent' && g.since('adultPet') >= 2,
      text: (g) => '續租時，房東說屋裡有抓痕，往後不想讓養寵物。' + CN.pet(g).name + '趴在門邊，你翻出當初問過的聊天記錄。',
      choices: [
        { t: '修好抓痕，寫清租約（¥800）', canon: true, fx: (g) => { CN.pay(g, 800); g.remember('petLease', 'repair'); }, res: '你找人補好牆角，把養寵和退租驗收的約定都寫進補充條款。' },
        { t: '換間明確允許養的房（¥3,000）', dev: 10, fx: (g) => { CN.pay(g, 3000); g.remember('petLease', 'move'); g.stat('心情', 2); }, res: '你帶它搬到另一條街。新房東先問名字，又說門窗要關好。' },
        { t: '托熟悉的朋友長期照看', dev: 15, fx: (g) => { g.remember('petLease', 'friend'); g.remember('petNow', null); g.stat('心情', -2); }, res: '朋友發來吃飯和睡覺的照片。你隔一陣去看看，帶上它熟悉的玩具。' },
      ] },
    { id: 'e_pet_farewell', y: Y, minAge: 35, maxAge: 60, t: '收好的小碗', auto: true, always: true, echoOf: ['e_pet_adopt', 'e_pet_lease'],
      cond: (g) => { const p = g.recall('adultPet'); return p && p.way !== 'no' && !CN.pet(g) && g.Y - p.y > p.life; },
      text: (g) => { const p = g.recall('adultPet'); return g.recall('petLease') === 'friend' ? '你去朋友家，看見' + p.name + '的小碗收進了櫃子。它在熟悉的人身邊走完了最後一段日子。你們坐著，說起它剛來時的樣子。' : '陪伴十幾年的' + p.name + '離開以後，你把它的小碗洗乾淨收起來。' + (p.way === 'adopt' ? '領養時的那張登記單，還夾在疫苗本里。' : '當年買它時留的票據，字已經淡了。') + '有時到點還會往門口看一眼，後來才慢慢改掉這個習慣。'; },
      fx: (g) => { g.stat('心情', -2); if (g.recall('petLease') === 'repair' || g.recall('petLease') === 'move') g.stat('人缘', 1); } },
    { id: 'e_pet_no_echo', y: Y, minAge: 30, maxAge: 40, t: '朋友的照片', auto: true, always: true, echoOf: 'e_pet_adopt',
      cond: (g) => g.recall('adultPet') && g.recall('adultPet').way === 'no' && g.since('adultPet') >= 4,
      text: '當年收到你轉發訊息的朋友，發來一張抱著貓的照片。窗臺上曬著太陽，你說養得真好。' },
  ]);
})();

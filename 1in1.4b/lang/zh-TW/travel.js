/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 国内走动与会回来的短期外派；不设置留学定居标记 abroadStay。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const working = (g) => !!g.recall('job') && !['none', 'retired'].includes(g.recall('job'));
  const kids = (g) => ['k1', 'k2', 'k3'].filter((id) => JY.byId[id] && g.alive(id));
  const married = (g) => g.recall('love') === 'married' && g.alive('sp');
  const dispatchScene = (g) => g.move(['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? 'factory' : 'office', '短期外派 · 按期返崗');
  const studyScene = (g) => g.move(g.recall('job') === 'teacher' ? 'campus' : ['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : 'office', '三個月研修 · 返回原單位');
  const petCare = (g) => { const p = CN.pet(g); if (p) { CN.pay(g, 600); g.log('出門前，你花 ¥600 託人照看' + p.name + '。', 'auto'); } };
  const trip = (g, fee) => { CN.pay(g, fee); petCare(g); g.stat('心情', 3); };
  JY.addLifeNodes([
    { id: 't_gradtrip', age: 22, t: '畢業旅行',
      cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')) || !!g.recall('uni') || g.recall('edu') === 'college',
      text: '畢業前後，同學在群裡商量去哪兒走一趟。有人列了車票和青旅的價錢，也有人已經收拾好了實習的行李。',
      choices: [
        { t: '坐慢車窮遊（¥800）', canon: true, fx: (g) => { trip(g, 800); g.remember('gradTrip', 'cheap'); g.move('hsr', '畢業旅行的車站'); }, res: '你們住上下鋪，輪著提水壺。站臺上的合照，後來留了很多年。' },
        { t: '和同學去遠一點（¥3,000）', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => { trip(g, 3000); g.remember('gradTrip', 'far'); g.move('coast', '畢業旅行 · 海邊'); g.stat('人缘', 3); }, res: '你們在海邊等了一次日出。回去以後，有人去了很遠的城市。' },
        { t: '不去，直接實習', dev: 10, fx: (g) => { g.remember('gradTrip', 'intern'); g.move(['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : g.recall('job') === 'teacher' ? 'school' : 'office', '入職見習'); g.stat('事业', 3); }, res: '他們發照片的時候，你剛領到臨時工牌。你說回來請你們吃飯。' },
      ] },
    { id: 't_move', age: 31, t: '換座城生活', major: true,
      cond: (g) => working(g) && !g.recall('abroadStay') && !['own', 'mortgage'].includes(g.recall('house')) && !kids(g).some((id) => g.ageOf(id) >= 6 && g.ageOf(id) < 18)
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      stake: '新的收入、新的房租，也要重新認識身邊的人。',
      text: '朋友發來兩張招聘啟事，一張在一線，一張在新一線。租約快到期了，這回搬家可以搬得更遠一點。',
      choices: [
        { t: '去一線（搬家 ¥5,000）', dev: 15, fx: (g) => { trip(g, 5000); g.remember('cityMove', 'first'); CN.goCity(g, 1, CN.pick(['北京', '上海', '廣州', '深圳'])); g.remember('house', 'rent'); g.stat('事业', 4); g.stat('人缘', -3); }, res: '箱子放在新租的屋裡。工資高了一點，房租也高了一截。' },
        { t: '去新一線（搬家 ¥3,000）', dev: 10, fx: (g) => { trip(g, 3000); g.remember('cityMove', 'second'); CN.goCity(g, 2, CN.pick(['成都', '武漢', '南京', '杭州'])); g.remember('house', 'rent'); g.stat('事业', 2); g.stat('人缘', -1); }, res: '你先找好房子，再搬過去。樓下有家便宜的麵館，老闆很快記住了你。' },
        { t: '留下來', canon: true, fx: (g) => { g.remember('cityMove', 'stay'); g.stat('人缘', 2); }, res: '你續了租。熟悉的路還在，朋友約飯不用再問地址。' },
      ] },
    { id: 't_dispatch', age: 36, t: '半年的外派', major: true,
      cond: (g) => working(g) && ['office', 'tech', 'sales', 'boss', 'worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: '短期去，按期回來；補貼背後是家裡半年的空缺。',
      text: (g) => (['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? '廠裡問你，願不願去東南亞的工廠做半年技術指導。' : '公司問你，願不願去海外分公司支援半年。') + '結束就回來，半年補貼 ¥3 萬。' + (married(g) && kids(g).length ? '接送孩子和家裡的事，要重新安排。' : '你把日期在日曆上圈了出來。'),
      choices: [
        { t: '去半年，安排好家裡', dev: 15, fx: (g) => { g.remember('dispatch', 'half'); dispatchScene(g); CN.earn(g, 30000); g.stat('事业', 5); if (married(g) && kids(g).length) { g.stat('心情', -2); g.stat('人缘', -2); } petCare(g); }, res: '你帶著箱子出發，按期回到原來的崗位。門口那家早餐鋪還在。' },
        { t: '這次讓給別人', canon: true, fx: (g) => { g.remember('dispatch', 'no'); g.stat('人缘', 1); }, res: '你把名單推了回去。送行那天，幫同事提了一段箱子。' },
        { t: '爭取只去三個月', dev: 10, check: ['学识', 55], fx: (g) => { g.remember('dispatch', 'quarter'); dispatchScene(g); CN.earn(g, 15000); g.stat('事业', 3); petCare(g); }, res: '交接方案透過了。三個月後，你按計劃回來。', fail: { fx: (g) => g.remember('dispatch', 'no'), res: '短期方案沒透過。你留在原崗，同事去了。' } },
      ] },
    { id: 't_study_abroad_short', age: 39, t: '三個月的研修', major: true,
      cond: (g) => ['teacher', 'doctor', 'civil', 'nurse'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: '帶回一點本事，家裡的三個月也得有人照應。',
      text: (g) => (g.recall('job') === 'teacher' ? '學校給了你一個去國外學校聽課的名額。' : ['doctor', 'nurse'].includes(g.recall('job')) ? '院裡給了你一個去國外醫院研修的名額。' : '單位有一個去國外學習公共服務的研修名額。') + '三個月，結束回原單位，自己出 ¥5,000。',
      choices: [
        { t: '去研修，先交接妥當', dev: 10, fx: (g) => { trip(g, 5000); g.remember('study3m', 'go'); studyScene(g); g.stat('学识', 4); g.stat('事业', 2); }, res: '你記滿兩本筆記。回來以後，把能用的幾頁影印給了同事。' },
        { t: '讓給年輕人', canon: true, fx: (g) => { g.remember('study3m', 'no'); g.stat('人缘', 2); }, res: '年輕同事回來的時候，給你帶了一本當地的薄冊子。' },
        { t: '先去，家裡有急事就回來', dev: 15, cond: (g) => kids(g).length > 0 || married(g) || g.alive('fa') || g.alive('mo'), fx: (g) => { trip(g, 5000); g.remember('study3m', 'early'); studyScene(g); g.stat('学识', 2); g.stat('事业', -1); }, res: '家裡臨時需要人照應，你提前兩週趕回來。剩下的課，託同事帶回了講義。' },
      ] },
    { id: 't_family_trip', age: 40, t: '一家人的假期', cond: (g) => kids(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) < 18),
      text: '孩子翻出地圖，說同學暑假要去看海。你算了一遍存款和能請的假，日曆上還寫著補習班開課的日期。',
      choices: [
        { t: (g) => CN.cash(g) < 2000 ? '帶飯去附近公園（¥100）' : '周邊自駕或租車（¥2,000）', canon: true, fx: (g) => { trip(g, CN.cash(g) < 2000 ? 100 : 2000); g.remember('familyTrip', 'drive'); g.move('road', '近郊出遊'); }, res: '你們帶著飯盒出門，在樹下找了一片陰涼。孩子撿回一塊像小船的石頭。' },
        { t: '國內跟團看海（¥6,000）', dev: 10, cond: (g) => CN.cash(g) >= 6000, fx: (g) => { trip(g, 6000); g.remember('familyTrip', 'sea'); g.move('coast', '國內海邊'); }, res: '團餐不合口味，海風倒是真的。回程箱子裡全是沙。' },
        { t: '出境遊（¥2 萬，短期往返）', dev: 15, cond: (g) => CN.cash(g) >= 80000, fx: (g) => { trip(g, 20000); g.remember('familyTrip', 'overseas'); g.move('coast', '短期出境遊'); }, res: '孩子拿著登機牌一路看，回來把車票貼滿了本子。' },
        { t: '先上補習班（¥1,500）', dev: 10, fx: (g) => { CN.pay(g, 1500); g.remember('familyTrip', 'class'); g.move('school', '補習班門口'); g.stat('心情', -1); }, res: '你把地圖收好，說下次。週末送孩子去教室時，天很藍。' },
      ] },
    { id: 't_echo41', age: 41, t: '箱子裡的舊票', auto: true, echoOf: ['t_gradtrip', 't_move', 't_dispatch', 't_study_abroad_short', 't_family_trip'],
      cond: (g) => !!(g.recall('gradTrip') || g.recall('cityMove') || g.recall('dispatch') || g.recall('study3m') || g.recall('familyTrip')),
      text: (g) => {
        const out = [];
        if (g.recall('gradTrip')) out.push(g.recall('gradTrip') === 'intern' ? '同學發來畢業旅行的舊照，你認出當年沒趕上的那趟車。' : '畢業旅行的合照又被翻出來，群裡聊了好一陣。');
        if (g.recall('cityMove')) out.push(g.recall('cityMove') === 'stay' ? '你想起當年續租留下的決定，如今住處是否還在原地，日子都已往前走了。' : '當年搬家的照片又被翻出來，那些第一次找路的日子，現在想起來已經熟悉。');
        if (g.recall('dispatch')) out.push(g.recall('dispatch') === 'no' ? '外派回來的同事送你一包點心，講起那半年的飯菜。' : '短期外派帶回來的經驗，幫你接住了一次難辦的交接。');
        if (g.recall('study3m')) out.push(g.recall('study3m') === 'no' ? '年輕同事把研修的筆記借給你，你挑了幾頁影印。' : '那本研修筆記還在抽屜裡，用得上的地方折了角。');
        if (g.recall('familyTrip')) out.push(g.recall('familyTrip') === 'class' ? '你又想起當年收好的地圖，給下一個假期留了兩天空。' : '翻到那次出遊的照片，你想起孩子當時帶回的小東西。' + (married(g) ? '你和伴侶一起看了一會兒，各自記得的細節不太一樣。' : '你把照片慢慢翻完，留在那一年的笑聲仍然清楚。'));
        const pet = CN.pet(g);
        if (pet) out.push('收拾行李前，你先核對了' + pet.name + '的照料安排。');
        return (out.length > 3 ? [out[0]].concat(out.slice(-2)) : out).join('');
      }, fx: (g) => { if (g.recall('dispatch') && g.recall('dispatch') !== 'no') g.stat('事业', 2); if (g.recall('study3m') && g.recall('study3m') !== 'no') g.stat('学识', 2); } },
  ]);
})();

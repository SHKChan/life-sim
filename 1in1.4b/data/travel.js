/* 国内走动与会回来的短期外派；不设置留学定居标记 abroadStay。 */
(function () {
  'use strict';
  const JY = window.JY, CN = JY.CN;
  const working = (g) => !!g.recall('job') && !['none', 'retired'].includes(g.recall('job'));
  const kids = (g) => ['k1', 'k2', 'k3'].filter((id) => JY.byId[id] && g.alive(id));
  const married = (g) => g.recall('love') === 'married' && g.alive('sp');
  const dispatchScene = (g) => g.move(['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? 'factory' : 'office', '短期外派 · 按期返岗');
  const studyScene = (g) => g.move(g.recall('job') === 'teacher' ? 'campus' : ['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : 'office', '三个月研修 · 返回原单位');
  const petCare = (g) => { const p = CN.pet(g); if (p) { CN.pay(g, 600); g.log('出门前，你花 ¥600 托人照看' + p.name + '。', 'auto'); } };
  const trip = (g, fee) => { CN.pay(g, fee); petCare(g); g.stat('心情', 3); };
  JY.addLifeNodes([
    { id: 't_gradtrip', age: 22, t: '毕业旅行',
      cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')) || !!g.recall('uni') || g.recall('edu') === 'college',
      text: '毕业前后，同学在群里商量去哪儿走一趟。有人列了车票和青旅的价钱，也有人已经收拾好了实习的行李。',
      choices: [
        { t: '坐慢车穷游（¥800）', canon: true, fx: (g) => { trip(g, 800); g.remember('gradTrip', 'cheap'); g.move('hsr', '毕业旅行的车站'); }, res: '你们住上下铺，轮着提水壶。站台上的合照，后来留了很多年。' },
        { t: '和同学去远一点（¥3,000）', dev: 10, cond: (g) => CN.cash(g) >= 3000, fx: (g) => { trip(g, 3000); g.remember('gradTrip', 'far'); g.move('coast', '毕业旅行 · 海边'); g.stat('人缘', 3); }, res: '你们在海边等了一次日出。回去以后，有人去了很远的城市。' },
        { t: '不去，直接实习', dev: 10, fx: (g) => { g.remember('gradTrip', 'intern'); g.move(['doctor', 'nurse'].includes(g.recall('job')) ? 'hospital' : g.recall('job') === 'teacher' ? 'school' : 'office', '入职见习'); g.stat('事业', 3); }, res: '他们发照片的时候，你刚领到临时工牌。你说回来请你们吃饭。' },
      ] },
    { id: 't_move', age: 31, t: '换座城生活', major: true,
      cond: (g) => working(g) && !g.recall('abroadStay') && !['own', 'mortgage'].includes(g.recall('house')) && !kids(g).some((id) => g.ageOf(id) >= 6 && g.ageOf(id) < 18)
        && !JY.engine.get().L.picks.some((p) => p.age === g.age),
      stake: '新的收入、新的房租，也要重新认识身边的人。',
      text: '朋友发来两张招聘启事，一张在一线，一张在新一线。租约快到期了，这回搬家可以搬得更远一点。',
      choices: [
        { t: '去一线（搬家 ¥5,000）', dev: 15, fx: (g) => { trip(g, 5000); g.remember('cityMove', 'first'); CN.goCity(g, 1, CN.pick(['北京', '上海', '广州', '深圳'])); g.remember('house', 'rent'); g.stat('事业', 4); g.stat('人缘', -3); }, res: '箱子放在新租的屋里。工资高了一点，房租也高了一截。' },
        { t: '去新一线（搬家 ¥3,000）', dev: 10, fx: (g) => { trip(g, 3000); g.remember('cityMove', 'second'); CN.goCity(g, 2, CN.pick(['成都', '武汉', '南京', '杭州'])); g.remember('house', 'rent'); g.stat('事业', 2); g.stat('人缘', -1); }, res: '你先找好房子，再搬过去。楼下有家便宜的面馆，老板很快记住了你。' },
        { t: '留下来', canon: true, fx: (g) => { g.remember('cityMove', 'stay'); g.stat('人缘', 2); }, res: '你续了租。熟悉的路还在，朋友约饭不用再问地址。' },
      ] },
    { id: 't_dispatch', age: 36, t: '半年的外派', major: true,
      cond: (g) => working(g) && ['office', 'tech', 'sales', 'boss', 'worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: '短期去，按期回来；补贴背后是家里半年的空缺。',
      text: (g) => (['worker', 'electrician', 'welder', 'cnc'].includes(g.recall('job')) ? '厂里问你，愿不愿去东南亚的工厂做半年技术指导。' : '公司问你，愿不愿去海外分公司支援半年。') + '结束就回来，半年补贴 ¥3 万。' + (married(g) && kids(g).length ? '接送孩子和家里的事，要重新安排。' : '你把日期在日历上圈了出来。'),
      choices: [
        { t: '去半年，安排好家里', dev: 15, fx: (g) => { g.remember('dispatch', 'half'); dispatchScene(g); CN.earn(g, 30000); g.stat('事业', 5); if (married(g) && kids(g).length) { g.stat('心情', -2); g.stat('人缘', -2); } petCare(g); }, res: '你带着箱子出发，按期回到原来的岗位。门口那家早餐铺还在。' },
        { t: '这次让给别人', canon: true, fx: (g) => { g.remember('dispatch', 'no'); g.stat('人缘', 1); }, res: '你把名单推了回去。送行那天，帮同事提了一段箱子。' },
        { t: '争取只去三个月', dev: 10, check: ['学识', 55], fx: (g) => { g.remember('dispatch', 'quarter'); dispatchScene(g); CN.earn(g, 15000); g.stat('事业', 3); petCare(g); }, res: '交接方案通过了。三个月后，你按计划回来。', fail: { fx: (g) => g.remember('dispatch', 'no'), res: '短期方案没通过。你留在原岗，同事去了。' } },
      ] },
    { id: 't_study_abroad_short', age: 39, t: '三个月的研修', major: true,
      cond: (g) => ['teacher', 'doctor', 'civil', 'nurse'].includes(g.recall('job')) && !g.recall('abroadStay'),
      stake: '带回一点本事，家里的三个月也得有人照应。',
      text: (g) => (g.recall('job') === 'teacher' ? '学校给了你一个去国外学校听课的名额。' : ['doctor', 'nurse'].includes(g.recall('job')) ? '院里给了你一个去国外医院研修的名额。' : '单位有一个去国外学习公共服务的研修名额。') + '三个月，结束回原单位，自己出 ¥5,000。',
      choices: [
        { t: '去研修，先交接妥当', dev: 10, fx: (g) => { trip(g, 5000); g.remember('study3m', 'go'); studyScene(g); g.stat('学识', 4); g.stat('事业', 2); }, res: '你记满两本笔记。回来以后，把能用的几页复印给了同事。' },
        { t: '让给年轻人', canon: true, fx: (g) => { g.remember('study3m', 'no'); g.stat('人缘', 2); }, res: '年轻同事回来的时候，给你带了一本当地的薄册子。' },
        { t: '先去，家里有急事就回来', dev: 15, cond: (g) => kids(g).length > 0 || married(g) || g.alive('fa') || g.alive('mo'), fx: (g) => { trip(g, 5000); g.remember('study3m', 'early'); studyScene(g); g.stat('学识', 2); g.stat('事业', -1); }, res: '家里临时需要人照应，你提前两周赶回来。剩下的课，托同事带回了讲义。' },
      ] },
    { id: 't_family_trip', age: 40, t: '一家人的假期', cond: (g) => kids(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) < 18),
      text: '孩子翻出地图，说同学暑假要去看海。你算了一遍存款和能请的假，日历上还写着补习班开课的日期。',
      choices: [
        { t: (g) => CN.cash(g) < 2000 ? '带饭去附近公园（¥100）' : '周边自驾或租车（¥2,000）', canon: true, fx: (g) => { trip(g, CN.cash(g) < 2000 ? 100 : 2000); g.remember('familyTrip', 'drive'); g.move('road', '近郊出游'); }, res: '你们带着饭盒出门，在树下找了一片阴凉。孩子捡回一块像小船的石头。' },
        { t: '国内跟团看海（¥6,000）', dev: 10, cond: (g) => CN.cash(g) >= 6000, fx: (g) => { trip(g, 6000); g.remember('familyTrip', 'sea'); g.move('coast', '国内海边'); }, res: '团餐不合口味，海风倒是真的。回程箱子里全是沙。' },
        { t: '出境游（¥2 万，短期往返）', dev: 15, cond: (g) => CN.cash(g) >= 80000, fx: (g) => { trip(g, 20000); g.remember('familyTrip', 'overseas'); g.move('coast', '短期出境游'); }, res: '孩子拿着登机牌一路看，回来把车票贴满了本子。' },
        { t: '先上补习班（¥1,500）', dev: 10, fx: (g) => { CN.pay(g, 1500); g.remember('familyTrip', 'class'); g.move('school', '补习班门口'); g.stat('心情', -1); }, res: '你把地图收好，说下次。周末送孩子去教室时，天很蓝。' },
      ] },
    { id: 't_echo41', age: 41, t: '箱子里的旧票', auto: true, echoOf: ['t_gradtrip', 't_move', 't_dispatch', 't_study_abroad_short', 't_family_trip'],
      cond: (g) => !!(g.recall('gradTrip') || g.recall('cityMove') || g.recall('dispatch') || g.recall('study3m') || g.recall('familyTrip')),
      text: (g) => {
        const out = [];
        if (g.recall('gradTrip')) out.push(g.recall('gradTrip') === 'intern' ? '同学发来毕业旅行的旧照，你认出当年没赶上的那趟车。' : '毕业旅行的合照又被翻出来，群里聊了好一阵。');
        if (g.recall('cityMove')) out.push(g.recall('cityMove') === 'stay' ? '你想起当年续租留下的决定，如今住处是否还在原地，日子都已往前走了。' : '当年搬家的照片又被翻出来，那些第一次找路的日子，现在想起来已经熟悉。');
        if (g.recall('dispatch')) out.push(g.recall('dispatch') === 'no' ? '外派回来的同事送你一包点心，讲起那半年的饭菜。' : '短期外派带回来的经验，帮你接住了一次难办的交接。');
        if (g.recall('study3m')) out.push(g.recall('study3m') === 'no' ? '年轻同事把研修的笔记借给你，你挑了几页复印。' : '那本研修笔记还在抽屉里，用得上的地方折了角。');
        if (g.recall('familyTrip')) out.push(g.recall('familyTrip') === 'class' ? '你又想起当年收好的地图，给下一个假期留了两天空。' : '翻到那次出游的照片，你想起孩子当时带回的小东西。' + (married(g) ? '你和伴侣一起看了一会儿，各自记得的细节不太一样。' : '你把照片慢慢翻完，留在那一年的笑声仍然清楚。'));
        const pet = CN.pet(g);
        if (pet) out.push('收拾行李前，你先核对了' + pet.name + '的照料安排。');
        return (out.length > 3 ? [out[0]].concat(out.slice(-2)) : out).join('');
      }, fx: (g) => { if (g.recall('dispatch') && g.recall('dispatch') !== 'no') g.stat('事业', 2); if (g.recall('study3m') && g.recall('study3m') !== 'no') g.stat('学识', 2); } },
  ]);
})();

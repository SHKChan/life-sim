/* 由 share/tools/tr.js 从 data/tech.js 和 lang/en/tr/tech.json 生成，不要手改。 */
/* 十四亿分之一 · 日子里的新东西：高铁、扫码支付、数字人民币、无人店、自助政务（无人窗口）、电车换电、
 * 无人机外卖、无人驾驶出租车、磁悬浮、机器人餐厅、直播带货、智慧医院……
 * 不写成新闻腔，写成“你”第一次碰上它的那一刻。外国玩家对这些最陌生，也最好奇，所以每一样都写具体：多快、多少钱、怎么用。
 *
 * 写法：
 *   亲历（auto + always 的意外，一世一次）：到了年纪、条件对上就发生，把场景挪到高铁站（hsr）或街口（smart）。
 *   新闻（JY.addEvents）：补几条全国性的“新东西”。
 *   闲笔（JY.addFlavor）：没大事的年份里抽一两句。
 * 不写真实品牌和公司名，写“一家外卖平台”“12306”这样大家都知道的叫法即可（12306 是铁路售票，不算品牌）。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const Y = [2026, 2140];
  const tier = (g) => g.recall('tier') || 5;
  const has = (g, id) => !!JY.byId[id] && g.alive(id);
  const away = (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && g.recall('workCity') !== g.recall('homeCap');
  const home = (g) => (g.recall('homeCap') || g.recall('city') || 'your hometown').replace(/ · .*$/, '');
  const here = (g) => (g.recall('workCity') || g.recall('city') || 'the city').replace(/ · .*$/, '');
  const elder = (g) => ['gm', 'gp'].find((id) => has(g, id));
  const fmt = (x) => CN.fmt(x);
  // 高铁：按两座城市的“距离档”估时长和票价（同省 1–2 小时，跨省 4–6 小时）
  const sameProv = (g) => { const P = CN.PROVS.find((p) => p[0] === g.recall('prov')); return !!P && P[6].some((c) => c[0] === here(g)); };
  const hsrHours = (g) => (sameProv(g) ? 1 + (g.recall('hukou') === 'rural' ? 1 : 0) : CN.ri(4, 6));
  const hsrFare = (g) => (sameProv(g) ? CN.ri(6, 15) * 10 : CN.ri(45, 75) * 10);

  JY.addEncounters([
    { id: 'e_t_first_scan', y: Y, minAge: 5, maxAge: 7, t: 'Scan to pay', auto: true, always: true, loc: 'smart',
      text: (g) => 'The first thing you ever buy yourself: an ice lolly. ' + (g.recall('hukou') === 'rural' ? 'A QR code is taped to the corner-shop counter.' : 'The little shop downstairs has no cashier, just a screen.') + ' A grown-up hands you a phone; you point it, it beeps, and it is paid. You ask where the money went. Nobody can quite explain.' },
    { id: 'e_t_red_packet', y: Y, minAge: 7, maxAge: 9, t: 'Red envelopes', auto: true, always: true,
      cond: (g) => !!elder(g),
      text: (g) => 'At Chinese New Year, ' + CN.who(g, elder(g)) + ' learned to send red envelopes on the phone: digital yuan, tap two phones together and it lands in your “wallet”. ' + CN.he(g, elder(g)) + ' still did not quite trust it, and slipped you a paper note from under the pillow: “This one you can see.”' },
    { id: 'e_t_hsr_first', y: Y, minAge: 10, maxAge: 14, t: 'First bullet train', auto: true, always: true, loc: 'hsr',
      text: (g) => 'Summer holiday, your first ride on a high-speed train. No ticket at the station: the gate scans your face and opens. The train hits 350 km/h; you stand a bottle of water on the tray table and not a drop spills. Fields, hills and villages stream past the window. ' + (g.recall('hukou') === 'rural' ? 'You remember Grandpa saying that when he was young, getting to the provincial capital meant a whole night on the old green train.' : 'You count tunnels and fall asleep at the eleventh.') },
    { id: 'e_t_drone', y: Y, minAge: 12, maxAge: 17, t: 'Takeout from the sky', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3 || g.recall('hukou') !== 'rural',
      text: 'Weekend, you order fried chicken. The app says “Drone delivery in progress”. Twenty minutes later the rooftop locker chimes. You run up, the door pops open by itself, and the chicken is still hot.' },
    { id: 'e_t_unmanned', y: Y, minAge: 15, maxAge: 19, t: 'The shop with no one in it', auto: true, always: true, loc: 'smart',
      text: (g) => (g.recall('hukou') === 'rural' ? 'The town ' : 'The street by your school ') + 'gets an unstaffed convenience store. Scan your face to get in, take what you want and just walk out; the screen at the door charges you and the receipt lands on your phone: water and crisps, $1.20. A foreign tourist stands frozen at the exit, afraid to leave. You show him: just walk.' },
    { id: 'e_t_kiosk', y: Y, minAge: 18, maxAge: 22, t: 'The unstaffed window', auto: true, always: true, loc: 'smart',
      text: 'You go to apply for a passport. The government service hall has a row of self-service machines, open 24 hours, under a sign that says “Unstaffed Window”. Face scan, photo, signature, payment: seven minutes, and the passport is posted to you ten days later. You linger at the door wanting to thank someone. There is no one to thank.' },
    { id: 'e_t_spring_rush', y: Y, minAge: 19, maxAge: 34, t: 'Spring Festival rush', auto: true, always: true, loc: 'hsr',
      cond: (g) => away(g) || g.recall('lifePath') === 'uni',
      text: (g) => 'In the last month of the lunar year you fight for a ticket home on the 12306 rail app. Two days on the waitlist, then a line of text: waitlist successful. From ' + here(g) + ' to ' + home(g) + ' by high-speed rail: ' + hsrHours(g) + ' hours, fare ' + fmt(hsrFare(g)) + '. The platform is packed; everyone drags a suitcase full of gifts for home.' },
    { id: 'e_t_robotaxi', y: Y, minAge: 22, maxAge: 40, t: 'The car with no driver', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3,
      text: (g) => 'One a.m. after overtime, you hail a car in ' + here(g) + '. A robotaxi pulls up: empty driver’s seat, the wheel turning by itself, soft music, your name on the screen. $3.30 to your door, cheaper than a human driver. You doze off in the back; it wakes you gently when you arrive.' },
    { id: 'e_t_ev_swap', y: Y, minAge: 26, maxAge: 45, t: 'Battery swap', auto: true, always: true, loc: 'road',
      cond: (g) => !!g.recall('money0'),
      text: 'You and a friend drive an EV back to your hometown. At a highway service area there is a battery-swap station: you drive in, robot arms underneath pull out the flat battery and slot in a full one. Three minutes, $20. Your friend says a trip home in a petrol car used to cost $70 in fuel alone.' },
    { id: 'e_t_robot_cook', y: Y, minAge: 25, maxAge: 60, t: 'Cooked by robots', auto: true, always: true,
      cond: (g) => tier(g) <= 3,
      text: 'A robot restaurant opens below your office. Behind a glass kitchen, robot arms toss woks with perfect timing; a waist-high cart brings the dishes and says “Enjoy your meal.” It tastes good, though it lacks that smoky wok breath.' },
    { id: 'e_t_maglev', y: [2045, 2140], minAge: 28, maxAge: 60, t: 'Maglev', auto: true, always: true, loc: 'hsr',
      cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' && tier(g) <= 2,
      text: 'On a business trip you take the newly opened high-speed maglev. 600 km/h, and the carriage is so quiet you can hear the person beside you turning pages. Over a thousand kilometres in two and a half hours. You arrive before you finish reading your report.' },
    { id: 'e_t_livestream', y: Y, minAge: 38, maxAge: 62, t: 'Livestream', auto: true, always: true,
      cond: (g) => has(g, 'fa') || has(g, 'mo') || g.recall('hukou') === 'rural',
      text: (g) => (g.recall('hukou') === 'rural' ? 'People back in your home village have started selling their produce on livestreams. You help ' + (has(g, 'mo') ? 'Mom' : has(g, 'fa') ? 'Dad' : 'a neighbour auntie') + ' set up the phone and the lights; in one evening you sell 150 kilos of oranges, and the courier van comes for them first thing next morning.' : (has(g, 'mo') ? 'Mom' : 'Dad') + ' got hooked on livestream shopping: seven orders in one evening. You look at the pile of parcels in the locker and don’t know whether to laugh or cry.') },
    { id: 'e_t_smart_hosp', y: Y, minAge: 50, maxAge: 72, t: 'Seeing a doctor', auto: true, always: true, loc: 'hospital',
      text: 'You go back to the hospital for a check-up. Registration, queueing and payment all happen on your phone; while you wait, an AI takes your history, and the doctor needs only five minutes. No pharmacy queue: a little robot cart brings the medicine to the consulting-room door. You remember sitting in a hospital corridor all day as a child.' },
    { id: 'e_t_silver_hsr', y: Y, minAge: 66, maxAge: 82, t: 'The silver train', auto: true, always: true, loc: 'hsr',
      text: 'After retiring you sign up for a “silver train” tour: twelve days by high-speed rail around half of China, with a doctor on board and guides at every stop. You post lots of photos, every caption the same: “Beautiful.”' },
    { id: 'e_t_drone_med', y: Y, minAge: 75, maxAge: 95, t: 'Medicine by drone', auto: true, always: true,
      cond: (g) => g.recall('liveWith') === 'hometown' || tier(g) >= 4,
      text: 'Once walking gets hard, you see the doctor by video call. The next day a small drone lands in your yard with the medicine and beeps twice. The neighbour’s kids run out to watch every time.' },
  ]);

  JY.addEvents([
    { y: 2027, t: 'This Chinese New Year, more “tap-to-send” digital-yuan red envelopes were given than paper ones for the first time.' },
    { y: 2030, t: 'China’s high-speed rail network passes 60,000 km, enough to wrap around the Earth one and a half times.' },
    { y: 2034, t: 'A 600 km/h maglev line begins trial runs; tickets sell out a month ahead.' },
    { y: 2036, t: 'Unstaffed convenience stores reach many county towns: face in, grab and go.' },
    { y: 2038, t: 'Government service halls everywhere now have 24-hour “unstaffed windows”; IDs and certificates without a queue.' },
    { y: 2043, t: 'Electric passenger air taxis begin trial service: east side to west side of a city in ten minutes.' },
    { y: 2047, t: 'More than half of private cars are now electric. Highway service areas have more battery-swap stations than petrol pumps.' },
    { y: 2050, t: 'High-speed rail now reaches every prefecture-level city in China.' },
    { y: 2056, t: 'In remote mountain villages, medicine and parcels mostly arrive by drone.' },
  ]);

  JY.addFlavor('age:child', [
    { t: 'You drive your toy car into the robot vacuum’s path. It stops and goes around.', minAge: 3, maxAge: 7 },
    { t: 'You discover the front-door lock knows faces. Smile at it and it opens.', minAge: 4, maxAge: 8 },
  ]);
  JY.addFlavor('age:young', [
    { t: 'On the way home from school, delivery robots wait at the red light in a neat row, like little loaves of bread.', minAge: 8, maxAge: 15 },
    { t: 'You buy something online with your New Year money. It arrives the next morning.', minAge: 9, maxAge: 15 },
    { t: 'At the weekend you ride a shared bike to the library: scan, 20 cents. A robot fetches your book from the shelves.', minAge: 10, maxAge: 15 },
  ]);
  JY.addFlavor('age:adult', [
    { t: 'You leave home with only your phone. Your wallet has sat in a drawer for three years with the same few banknotes in it.', minAge: 18 },
    { t: 'The parcel lockers downstairs open with your face. You collect from them twenty-odd times a month.', minAge: 18 },
    { t: 'You finish a video meeting on the bullet train. Rice paddies flash past and the signal never drops a bar.', minAge: 22, cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' },
    { t: 'Hungry at midnight, you order a snack. A little driverless cart brings it and phones you from downstairs.', minAge: 18, cond: (g) => tier(g) <= 3 },
    { t: 'You charge your EV overnight downstairs for about $2, cheaper than a subway ride.', minAge: 26, cond: (g) => !!g.recall('money0') },
    { t: 'You scan to pay for two steamed buns at a street breakfast stall. The owner is past sixty; her payment speaker announces each sale louder than anyone’s.', minAge: 18 },
  ]);
  JY.addFlavor('age:old', [
    { t: 'You learn to order food by voice. Half an hour later a delivery robot downstairs calls your name.', minAge: 65, maxAge: 90 },
    { t: 'At the community canteen you pay with your face: two meat dishes and a vegetable for $1.70, taken from your pension.', minAge: 65 },
    { t: 'Your child installs a talking speaker for you. You ask it the weather every day, and it answers every day without ever getting tired of you.', minAge: 65 },
  ]);
})();

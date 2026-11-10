/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const home = (g) => (g.recall('homeCap') || g.recall('city') || '老家').replace(/ · .*$/, '');
  const here = (g) => (g.recall('workCity') || g.recall('city') || '城裡').replace(/ · .*$/, '');
  const elder = (g) => ['gm', 'gp'].find((id) => has(g, id));
  const fmt = (x) => CN.fmt(x);
  // 高铁：按两座城市的“距离档”估时长和票价（同省 1–2 小时，跨省 4–6 小时）
  const sameProv = (g) => { const P = CN.PROVS.find((p) => p[0] === g.recall('prov')); return !!P && P[6].some((c) => c[0] === here(g)); };
  const hsrHours = (g) => (sameProv(g) ? 1 + (g.recall('hukou') === 'rural' ? 1 : 0) : CN.ri(4, 6));
  const hsrFare = (g) => (sameProv(g) ? CN.ri(6, 15) * 10 : CN.ri(45, 75) * 10);

  JY.addEncounters([
    { id: 'e_t_first_scan', y: Y, minAge: 5, maxAge: 7, t: '掃一下', auto: true, always: true, loc: 'smart',
      text: (g) => '你第一次自己買東西：一根冰棒，' + (g.recall('hukou') === 'rural' ? '小賣部的櫃檯上貼著一張二維碼。' : '樓下的小店裡，收銀臺沒有人，只有一塊螢幕。') + '大人把手機遞給你，你對準一掃，“滴”的一聲，錢就付了。你問錢去哪兒了，沒人答得上來。' },
    { id: 'e_t_red_packet', y: Y, minAge: 7, maxAge: 9, t: '紅包', auto: true, always: true,
      cond: (g) => !!elder(g),
      text: (g) => '過年，' + CN.who(g, elder(g)) + '學會了在手機上發紅包，數字人民幣，碰一碰手機就到了你的“錢包”裡。' + CN.he(g, elder(g)) + '還是不放心，又從枕頭底下摸出一張紙幣塞給你，說這個看得見。' },
    { id: 'e_t_hsr_first', y: Y, minAge: 10, maxAge: 14, t: '第一次坐高鐵', auto: true, always: true, loc: 'hsr',
      text: (g) => '暑假，你第一次坐高鐵。進站不用拿票，對著閘機刷一下臉就開了。車開到每小時三百五十公里，你把一瓶水立在小桌板上，一滴都沒灑。窗外的田、山、村子一片一片往後跑，' + (g.recall('hukou') === 'rural' ? '你想起爺爺說過，他年輕時去省城要坐一整夜的綠皮車。' : '你數著隧道，數到第十一個就睡著了。') },
    { id: 'e_t_drone', y: Y, minAge: 12, maxAge: 17, t: '天上來的外賣', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3 || g.recall('hukou') !== 'rural',
      text: '週末在家點了一份炸雞。手機上顯示“無人機配送中”，二十分鐘後，樓頂的取餐櫃響了一聲。你跑上去，櫃門自己彈開，炸雞還是燙的。' },
    { id: 'e_t_unmanned', y: Y, minAge: 15, maxAge: 19, t: '沒有人的店', auto: true, always: true, loc: 'smart',
      text: (g) => (g.recall('hukou') === 'rural' ? '鎮上' : '學校門口') + '開了一家無人便利店。刷臉進門，拿了東西直接走，門口的螢幕自動扣錢，賬單發到手機上：一瓶水、一包薯片，¥8.5。一個外國遊客站在門口不敢出去，你教他直接走。' },
    { id: 'e_t_kiosk', y: Y, minAge: 18, maxAge: 22, t: '無人視窗', auto: true, always: true, loc: 'smart',
      text: '你去辦護照。政務大廳裡一排自助機，二十四小時開著，門口寫著“無人視窗”。刷臉、拍照、簽字、交費，一共七分鐘，護照十天後寄到家。你在門口等了一會兒，想找個人說聲謝謝，沒找到人。' },
    { id: 'e_t_spring_rush', y: Y, minAge: 19, maxAge: 34, t: '春運', auto: true, always: true, loc: 'hsr',
      cond: (g) => away(g) || g.recall('lifePath') === 'uni',
      text: (g) => '臘月，你在手機上搶回家的票。12306 的候補排了兩天，終於跳出一行字：候補成功。從' + here(g) + '到' + home(g) + '，高鐵 ' + hsrHours(g) + ' 個小時，票價 ' + fmt(hsrFare(g)) + '。站臺上人擠人，每個人都拖著箱子，箱子裡裝著給家裡的東西。' },
    { id: 'e_t_robotaxi', y: Y, minAge: 22, maxAge: 40, t: '沒有司機的車', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3,
      text: (g) => '加完班，凌晨一點，你在' + here(g) + '叫了一輛車。來的是一輛無人駕駛計程車，駕駛座上空著，方向盤自己轉。車裡放著輕音樂，螢幕上寫著你的名字。到家 ¥23，比有司機的便宜四塊錢。你在後座睡著了，到了它輕輕叫醒你。' },
    { id: 'e_t_ev_swap', y: Y, minAge: 26, maxAge: 45, t: '換電', auto: true, always: true, loc: 'road',
      cond: (g) => !!g.recall('money0'),
      text: '你和朋友開電車回老家。高速服務區裡有一座換電站，車開上去，底下的機械臂把沒電的電池卸下來、把滿電的裝上去，三分鐘，¥140。朋友說，以前開油車回趟家，光油錢就要五百。' },
    { id: 'e_t_robot_cook', y: Y, minAge: 25, maxAge: 60, t: '機器人炒的菜', auto: true, always: true,
      cond: (g) => tier(g) <= 3,
      text: '公司樓下開了一家機器人餐廳。點完菜，透明的廚房裡幾隻機械臂在顛勺，火候分秒不差；送菜的是一臺半人高的小車，到桌邊會說“請慢用”。味道不錯，就是少了點鍋氣。' },
    { id: 'e_t_maglev', y: [2045, 2140], minAge: 28, maxAge: 60, t: '磁懸浮', auto: true, always: true, loc: 'hsr',
      cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' && tier(g) <= 2,
      text: '你出差，坐了剛開通的高速磁懸浮。時速六百公里，車廂裡安靜得聽得見旁邊人翻書。一千多公里，兩個半小時。你還沒把報告看完，就到了。' },
    { id: 'e_t_livestream', y: Y, minAge: 38, maxAge: 62, t: '直播間', auto: true, always: true,
      cond: (g) => has(g, 'fa') || has(g, 'mo') || g.recall('hukou') === 'rural',
      text: (g) => (g.recall('hukou') === 'rural' ? '老家村裡的人開始在直播間裡賣自家的東西。你幫' + (has(g, 'mo') ? '媽媽' : has(g, 'fa') ? '爸爸' : '村裡的嬸子') + '架好手機、調好燈，一晚上賣出去三百斤橘子，快遞車第二天一早就來拉。' : (has(g, 'mo') ? '媽媽' : '爸爸') + '迷上了看直播買東西，一晚上下了七單。你看著快遞櫃裡的一堆包裹，哭笑不得。') },
    { id: 'e_t_smart_hosp', y: Y, minAge: 50, maxAge: 72, t: '看病', auto: true, always: true, loc: 'hospital',
      text: '你去醫院複查。手機上掛號、排隊、繳費，候診時 AI 先問了一遍你的情況，醫生只看了五分鐘就開好了單子。取藥不用排隊，一臺小車把藥送到了診室門口。你想起小時候陪大人看病，在走廊裡坐了一整天。' },
    { id: 'e_t_silver_hsr', y: Y, minAge: 66, maxAge: 82, t: '銀髮專列', auto: true, always: true, loc: 'hsr',
      text: '退休以後，你報了一趟“銀髮專列”，坐高鐵繞著半個中國走了十二天。車上有醫生，有人陪著下車逛景點。你在手機上發了好多照片，配的字都是“好看”。' },
    { id: 'e_t_drone_med', y: Y, minAge: 75, maxAge: 95, t: '送藥的無人機', auto: true, always: true,
      cond: (g) => g.recall('liveWith') === 'hometown' || tier(g) >= 4,
      text: '腿腳不方便以後，你在手機上跟醫生影片。開的藥，第二天由一架小無人機送到院子裡，落地時會“嘀嘀”叫兩聲。鄰居的孩子每次都跑出來看。' },
  ]);

  JY.addEvents([
    { y: 2027, t: '春節裡，數字人民幣的“碰一碰”紅包第一次比紙紅包發得還多。' },
    { y: 2030, t: '全國的高鐵線路連起來超過了六萬公里，比繞地球一圈半還長。' },
    { y: 2034, t: '一條時速六百公里的高速磁懸浮線試執行，坐的人要提前一個月搶票。' },
    { y: 2036, t: '無人便利店開進了很多縣城，刷臉進門，拿了就走。' },
    { y: 2038, t: '各地的政務大廳普及了二十四小時的“無人視窗”，辦證、開證明不用排隊。' },
    { y: 2043, t: '城市之間開始試運營載人的電動飛行器，從城東飛到城西十分鐘。' },
    { y: 2047, t: '全國一半以上的私家車是電車。高速服務區裡，換電站比加油站還多。' },
    { y: 2050, t: '高鐵通到了全國每一個地級市。' },
    { y: 2056, t: '偏遠山村的藥品和快遞，大多由無人機送到了家門口。' },
  ]);

  JY.addFlavor('age:child', [
    { t: '你把玩具車開進了掃地機器人的路線，它停下來，繞了過去。', minAge: 3, maxAge: 7 },
    { t: '你發現家裡的門鎖會認人，對著它笑一下，它就開了。', minAge: 4, maxAge: 8 },
  ]);
  JY.addFlavor('age:young', [
    { t: '放學路上，送快遞的無人車在紅燈前停得整整齊齊，像一排小麵包。', minAge: 8, maxAge: 15 },
    { t: '你用壓歲錢在網上買了一樣東西，第二天早上就到了。', minAge: 9, maxAge: 15 },
    { t: '週末你騎共享單車去圖書館，掃碼一塊五，書是機器人從書架上取下來的。', minAge: 10, maxAge: 15 },
  ]);
  JY.addFlavor('age:adult', [
    { t: '你出門只帶手機。錢包在抽屜裡放了三年，裡面還是那幾張現金。', minAge: 18 },
    { t: '樓下的快遞櫃刷臉就開，你一個月去拿二十幾次。', minAge: 18 },
    { t: '你在高鐵上開完了一個影片會。窗外的稻田一閃而過，訊號一格都沒掉。', minAge: 22, cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' },
    { t: '半夜餓了，你點了一份宵夜。來送的是一輛無人小車，到了樓下給你打了個電話。', minAge: 18, cond: (g) => tier(g) <= 3 },
    { t: '你給電車充電，樓下的充電樁一晚上 ¥15，比坐地鐵還便宜。', minAge: 26, cond: (g) => !!g.recall('money0') },
    { t: '你在街邊的早餐攤掃碼買了兩個包子。攤主六十多歲，收款音箱報得比誰都響。', minAge: 18 },
  ]);
  JY.addFlavor('age:old', [
    { t: '你學會了用語音點外賣。半個小時以後，無人車在樓下喊你的名字。', minAge: 65, maxAge: 90 },
    { t: '社群食堂刷臉吃飯，兩葷一素，¥12，飯卡錢從養老金里扣。', minAge: 65 },
    { t: '孩子給你裝了一個會說話的音箱。你每天問它天氣，它每天回答你，從來不嫌煩。', minAge: 65 },
  ]);
})();

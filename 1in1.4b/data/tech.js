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
  const here = (g) => (g.recall('workCity') || g.recall('city') || '城里').replace(/ · .*$/, '');
  const elder = (g) => ['gm', 'gp'].find((id) => has(g, id));
  const fmt = (x) => CN.fmt(x);
  // 高铁：按两座城市的“距离档”估时长和票价（同省 1–2 小时，跨省 4–6 小时）
  const sameProv = (g) => { const P = CN.PROVS.find((p) => p[0] === g.recall('prov')); return !!P && P[6].some((c) => c[0] === here(g)); };
  const hsrHours = (g) => (sameProv(g) ? 1 + (g.recall('hukou') === 'rural' ? 1 : 0) : CN.ri(4, 6));
  const hsrFare = (g) => (sameProv(g) ? CN.ri(6, 15) * 10 : CN.ri(45, 75) * 10);

  JY.addEncounters([
    { id: 'e_t_first_scan', y: Y, minAge: 5, maxAge: 7, t: '扫一下', auto: true, always: true, loc: 'smart',
      text: (g) => '你第一次自己买东西：一根冰棍，' + (g.recall('hukou') === 'rural' ? '小卖部的柜台上贴着一张二维码。' : '楼下的小店里，收银台没有人，只有一块屏幕。') + '大人把手机递给你，你对准一扫，“滴”的一声，钱就付了。你问钱去哪儿了，没人答得上来。' },
    { id: 'e_t_red_packet', y: Y, minAge: 7, maxAge: 9, t: '红包', auto: true, always: true,
      cond: (g) => !!elder(g),
      text: (g) => '过年，' + CN.who(g, elder(g)) + '学会了在手机上发红包，数字人民币，碰一碰手机就到了你的“钱包”里。' + CN.he(g, elder(g)) + '还是不放心，又从枕头底下摸出一张纸币塞给你，说这个看得见。' },
    { id: 'e_t_hsr_first', y: Y, minAge: 10, maxAge: 14, t: '第一次坐高铁', auto: true, always: true, loc: 'hsr',
      text: (g) => '暑假，你第一次坐高铁。进站不用拿票，对着闸机刷一下脸就开了。车开到每小时三百五十公里，你把一瓶水立在小桌板上，一滴都没洒。窗外的田、山、村子一片一片往后跑，' + (g.recall('hukou') === 'rural' ? '你想起爷爷说过，他年轻时去省城要坐一整夜的绿皮车。' : '你数着隧道，数到第十一个就睡着了。') },
    { id: 'e_t_drone', y: Y, minAge: 12, maxAge: 17, t: '天上来的外卖', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3 || g.recall('hukou') !== 'rural',
      text: '周末在家点了一份炸鸡。手机上显示“无人机配送中”，二十分钟后，楼顶的取餐柜响了一声。你跑上去，柜门自己弹开，炸鸡还是烫的。' },
    { id: 'e_t_unmanned', y: Y, minAge: 15, maxAge: 19, t: '没有人的店', auto: true, always: true, loc: 'smart',
      text: (g) => (g.recall('hukou') === 'rural' ? '镇上' : '学校门口') + '开了一家无人便利店。刷脸进门，拿了东西直接走，门口的屏幕自动扣钱，账单发到手机上：一瓶水、一包薯片，¥8.5。一个外国游客站在门口不敢出去，你教他直接走。' },
    { id: 'e_t_kiosk', y: Y, minAge: 18, maxAge: 22, t: '无人窗口', auto: true, always: true, loc: 'smart',
      text: '你去办护照。政务大厅里一排自助机，二十四小时开着，门口写着“无人窗口”。刷脸、拍照、签字、交费，一共七分钟，护照十天后寄到家。你在门口等了一会儿，想找个人说声谢谢，没找到人。' },
    { id: 'e_t_spring_rush', y: Y, minAge: 19, maxAge: 34, t: '春运', auto: true, always: true, loc: 'hsr',
      cond: (g) => away(g) || g.recall('lifePath') === 'uni',
      text: (g) => '腊月，你在手机上抢回家的票。12306 的候补排了两天，终于跳出一行字：候补成功。从' + here(g) + '到' + home(g) + '，高铁 ' + hsrHours(g) + ' 个小时，票价 ' + fmt(hsrFare(g)) + '。站台上人挤人，每个人都拖着箱子，箱子里装着给家里的东西。' },
    { id: 'e_t_robotaxi', y: Y, minAge: 22, maxAge: 40, t: '没有司机的车', auto: true, always: true, loc: 'smart',
      cond: (g) => tier(g) <= 3,
      text: (g) => '加完班，凌晨一点，你在' + here(g) + '叫了一辆车。来的是一辆无人驾驶出租车，驾驶座上空着，方向盘自己转。车里放着轻音乐，屏幕上写着你的名字。到家 ¥23，比有司机的便宜四块钱。你在后座睡着了，到了它轻轻叫醒你。' },
    { id: 'e_t_ev_swap', y: Y, minAge: 26, maxAge: 45, t: '换电', auto: true, always: true, loc: 'road',
      cond: (g) => !!g.recall('money0'),
      text: '你和朋友开电车回老家。高速服务区里有一座换电站，车开上去，底下的机械臂把没电的电池卸下来、把满电的装上去，三分钟，¥140。朋友说，以前开油车回趟家，光油钱就要五百。' },
    { id: 'e_t_robot_cook', y: Y, minAge: 25, maxAge: 60, t: '机器人炒的菜', auto: true, always: true,
      cond: (g) => tier(g) <= 3,
      text: '公司楼下开了一家机器人餐厅。点完菜，透明的厨房里几只机械臂在颠勺，火候分秒不差；送菜的是一台半人高的小车，到桌边会说“请慢用”。味道不错，就是少了点锅气。' },
    { id: 'e_t_maglev', y: [2045, 2140], minAge: 28, maxAge: 60, t: '磁悬浮', auto: true, always: true, loc: 'hsr',
      cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' && tier(g) <= 2,
      text: '你出差，坐了刚开通的高速磁悬浮。时速六百公里，车厢里安静得听得见旁边人翻书。一千多公里，两个半小时。你还没把报告看完，就到了。' },
    { id: 'e_t_livestream', y: Y, minAge: 38, maxAge: 62, t: '直播间', auto: true, always: true,
      cond: (g) => has(g, 'fa') || has(g, 'mo') || g.recall('hukou') === 'rural',
      text: (g) => (g.recall('hukou') === 'rural' ? '老家村里的人开始在直播间里卖自家的东西。你帮' + (has(g, 'mo') ? '妈妈' : has(g, 'fa') ? '爸爸' : '村里的婶子') + '架好手机、调好灯，一晚上卖出去三百斤橘子，快递车第二天一早就来拉。' : (has(g, 'mo') ? '妈妈' : '爸爸') + '迷上了看直播买东西，一晚上下了七单。你看着快递柜里的一堆包裹，哭笑不得。') },
    { id: 'e_t_smart_hosp', y: Y, minAge: 50, maxAge: 72, t: '看病', auto: true, always: true, loc: 'hospital',
      text: '你去医院复查。手机上挂号、排队、缴费，候诊时 AI 先问了一遍你的情况，医生只看了五分钟就开好了单子。取药不用排队，一台小车把药送到了诊室门口。你想起小时候陪大人看病，在走廊里坐了一整天。' },
    { id: 'e_t_silver_hsr', y: Y, minAge: 66, maxAge: 82, t: '银发专列', auto: true, always: true, loc: 'hsr',
      text: '退休以后，你报了一趟“银发专列”，坐高铁绕着半个中国走了十二天。车上有医生，有人陪着下车逛景点。你在手机上发了好多照片，配的字都是“好看”。' },
    { id: 'e_t_drone_med', y: Y, minAge: 75, maxAge: 95, t: '送药的无人机', auto: true, always: true,
      cond: (g) => g.recall('liveWith') === 'hometown' || tier(g) >= 4,
      text: '腿脚不方便以后，你在手机上跟医生视频。开的药，第二天由一架小无人机送到院子里，落地时会“嘀嘀”叫两声。邻居的孩子每次都跑出来看。' },
  ]);

  JY.addEvents([
    { y: 2027, t: '春节里，数字人民币的“碰一碰”红包第一次比纸红包发得还多。' },
    { y: 2030, t: '全国的高铁线路连起来超过了六万公里，比绕地球一圈半还长。' },
    { y: 2034, t: '一条时速六百公里的高速磁悬浮线试运行，坐的人要提前一个月抢票。' },
    { y: 2036, t: '无人便利店开进了很多县城，刷脸进门，拿了就走。' },
    { y: 2038, t: '各地的政务大厅普及了二十四小时的“无人窗口”，办证、开证明不用排队。' },
    { y: 2043, t: '城市之间开始试运营载人的电动飞行器，从城东飞到城西十分钟。' },
    { y: 2047, t: '全国一半以上的私家车是电车。高速服务区里，换电站比加油站还多。' },
    { y: 2050, t: '高铁通到了全国每一个地级市。' },
    { y: 2056, t: '偏远山村的药品和快递，大多由无人机送到了家门口。' },
  ]);

  JY.addFlavor('age:child', [
    { t: '你把玩具车开进了扫地机器人的路线，它停下来，绕了过去。', minAge: 3, maxAge: 7 },
    { t: '你发现家里的门锁会认人，对着它笑一下，它就开了。', minAge: 4, maxAge: 8 },
  ]);
  JY.addFlavor('age:young', [
    { t: '放学路上，送快递的无人车在红灯前停得整整齐齐，像一排小面包。', minAge: 8, maxAge: 15 },
    { t: '你用压岁钱在网上买了一样东西，第二天早上就到了。', minAge: 9, maxAge: 15 },
    { t: '周末你骑共享单车去图书馆，扫码一块五，书是机器人从书架上取下来的。', minAge: 10, maxAge: 15 },
  ]);
  JY.addFlavor('age:adult', [
    { t: '你出门只带手机。钱包在抽屉里放了三年，里面还是那几张现金。', minAge: 18 },
    { t: '楼下的快递柜刷脸就开，你一个月去拿二十几次。', minAge: 18 },
    { t: '你在高铁上开完了一个视频会。窗外的稻田一闪而过，信号一格都没掉。', minAge: 22, cond: (g) => !!g.recall('job') && g.recall('job') !== 'none' },
    { t: '半夜饿了，你点了一份宵夜。来送的是一辆无人小车，到了楼下给你打了个电话。', minAge: 18, cond: (g) => tier(g) <= 3 },
    { t: '你给电车充电，楼下的充电桩一晚上 ¥15，比坐地铁还便宜。', minAge: 26, cond: (g) => !!g.recall('money0') },
    { t: '你在街边的早餐摊扫码买了两个包子。摊主六十多岁，收款音箱报得比谁都响。', minAge: 18 },
  ]);
  JY.addFlavor('age:old', [
    { t: '你学会了用语音点外卖。半个小时以后，无人车在楼下喊你的名字。', minAge: 65, maxAge: 90 },
    { t: '社区食堂刷脸吃饭，两荤一素，¥12，饭卡钱从养老金里扣。', minAge: 65 },
    { t: '孩子给你装了一个会说话的音箱。你每天问它天气，它每天回答你，从来不嫌烦。', minAge: 65 },
  ]);
})();

/* 十四亿分之一 · 意外、新闻、闲笔
 * 意外（JY.addEncounters，id 以 e_ 开头）：任何年龄都可能碰上，选择用 g.remember 记下（键名以 ev 开头），
 *   几年后由下面的回响意外（auto + always）兑现。
 * 新闻（JY.addEvents）：2026–2120 年的民生新闻，按 docs/SPEC.md 的时间线写。
 * 闲笔（JY.addFlavor）：没有大事的年份里每年抽 1–2 句。
 *   写“你吃了……”“你学会了……”“你骑车……”的，一律写成 { t, minAge, maxAge }；
 *   地区、省份、城市等级的闲笔用 RG / PV / TIER 生成，默认 minAge 6。
 *   提到家里人先看人在不在、住没住在一起（has、CN.livesWith、CN.alone），称呼用 CN.who(g, id, true)。
 * 钱：成年后是真金白银（元）。新写的花钱、进账用 CN.pay / CN.earn，文字里写出金额，按 CN.income、CN.cash 定数。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const Y = [2026, 2130];
  const job = (g) => g.recall('job');
  const tier = (g) => g.recall('tier') || 5;
  const big = (g) => tier(g) <= 2;
  const married = (g) => g.recall('love') === 'married';

  /* ---------- 读状态的小工具 ---------- */
  const has = (g, id) => !!JY.byId[id] && g.alive(id);
  const kids = (g) => ['k1', 'k2', 'k3'].filter((id) => has(g, id));
  const gks = (g) => ['gk1', 'gk2', 'gk3'].filter((id) => has(g, id));
  const spOk = (g) => married(g) && has(g, 'sp');
  const spRel = (g) => g.knows('sp') || '爱人';
  const parentsAlive = (g) => has(g, 'fa') || has(g, 'mo');
  const parentsWord = (g) => (has(g, 'fa') && has(g, 'mo') ? '爸妈' : has(g, 'fa') ? '爸爸' : '妈妈');
  const withParents = (g) => CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo');
  const money = (g) => !!g.recall('money0');
  const cash = (g) => CN.cash(g);
  const inc = (g) => Number(g.recall('income')) || 60000;
  const round = (x, step) => Math.max(step, Math.round(x / step) * step);
  const fmt = (x) => CN.fmt(x);
  const working = (g) => { const j = job(g); return !!j && j !== 'none' && j !== 'retired' && !g.recall('retired'); };
  const ta = (g, id) => (JY.byId[id] && JY.byId[id].sex === '女' ? '她' : '他');
  const olderSib = (g) => ['sib0', 'sib1'].find((id) => has(g, id) && g.ageOf(id) > g.age);

  /* ---------- 留下的痕迹（墓志页“你留下的痕迹”） ---------- */
  JY.addFlags({
    evSavedLife: '你在地铁里救回了一个陌生人。',
    evFoundKid: '你帮一个走失的孩子找到了家。',
    evVillageShop: '你帮老家的乡亲把农产品卖到了全国。',
    evVolunteer: '你做了很多年志愿者。',
    evWitness: '你为一场车祸出庭作证，帮受害的一家讨回了公道。',
  });

  /* ---------- 金额（按这个人的家底定数） ---------- */
  const loanAmt = (g) => round(Math.min(100000, Math.max(10000, inc(g) * 0.2)), 5000);
  const tipAmt = (g) => round(Math.min(200000, cash(g) * 0.3), 5000);
  const highAmt = (g) => round(Math.min(100000, cash(g) * 0.2), 5000);
  const carPrice = (g) => (tier(g) <= 2 ? 200000 : 120000);
  const premium = (g) => round(Math.min(15000, Math.max(3000, inc(g) * 0.05)), 500);
  const offerPrice = (g) => Math.round(CN.price(g) * 0.9);
  const offerDown = (g) => offerPrice(g) * 0.3 * 1e4;

  /* ---------- 意外 ---------- */
  JY.addEncounters([
    // —— 童年、学生 ——
    { id: 'e_stray_dog', y: Y, minAge: 6, maxAge: 14, t: '小狗', text: '放学路上，一只小土狗跟了你两条街。它很瘦，一条后腿有点瘸。',
      choices: [
        { t: '把手里的半个馒头给它', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evDog', 'fed'); }, res: '它吃完了，又跟到你家门口才走。' },
        { t: '抱回家，求大人留下它', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('evDog', 'kept'); },
          res: (g) => (g.recall('leftBehind') ? '奶奶嘴上嫌麻烦，晚上却把剩饭拌好了端出去。' : g.recall('hukou') === 'rural' ? '家里人说，院子里多一只狗也好看门。' : '妈妈皱了半天眉，最后去楼下买了狗粮。') },
        { t: '赶紧跑开', dev: 0, fx: (g) => g.stat('心情', -1), res: '你回头看了一眼，它站在路口没动。' },
      ] },
    { id: 'e_found_wallet', y: Y, minAge: 8, maxAge: 16, t: '钱包', text: '你在操场边捡到一个钱包，里面有四百块钱和一张身份证。',
      choices: [
        { t: '交给老师', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evWallet', 'returned'); }, res: '老师在班会上表扬了你。你有点不好意思。' },
        { t: '拿走钱，把钱包扔回原处', dev: 20, fx: (g) => { g.stat('心情', -2); g.remember('evWallet', 'kept'); }, res: '那天晚上你没睡好。四百块钱，你一分也没敢花。' },
      ] },
    { id: 'e_ai_homework', y: Y, minAge: 8, maxAge: 15, t: '作业', text: '家里的 AI 助手说，作业它三秒钟就能写完，字迹都能模仿你的。',
      choices: [
        { t: '自己写，写不出来再问它思路', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('evAiHw', 'learn'); }, res: '你写到十点。最后一道题，是它提示了一句你才想通的。' },
        { t: '让它写', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('evAiHw', 'copy'); }, res: '你看了一晚上动画片。第二天作业本上全是对勾。' },
        { t: '把它关掉，一个字都不问', dev: 20, fx: (g) => { g.stat('学识', 1); g.stat('心情', -1); g.remember('evAiHw', 'self'); }, res: '你算错了三道题，可每一道都是你自己算错的。' },
      ] },
    { id: 'e_game_night', y: Y, minAge: 11, maxAge: 17, t: '游戏', text: '同学拉你玩一款新游戏。第一局就赢了，你看了看表，已经十一点半。',
      choices: [
        { t: '再来一局就睡', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evGame', 'some'); }, res: '你又玩了三局。第二天早自习，你一直在打哈欠。' },
        { t: '通宵', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('健康', -2); g.remember('evGame', 'hooked'); }, res: '天亮的时候，你升到了全服前一百。' },
        { t: '退出，卸载', dev: 15, fx: (g) => { g.stat('学识', 1); g.remember('evGame', 'quit'); }, res: '同学说你没劲。你没理他。' },
      ] },
    { id: 'e_bully_seen', y: Y, minAge: 9, maxAge: 16, t: '厕所门口', text: '几个高年级的男生把一个瘦小的同学堵在厕所门口，抢他的零花钱。',
      choices: [
        { t: '跑去告诉老师', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evBully', 'told'); }, res: '老师来了，他们一哄而散。被欺负的同学冲你点了点头。' },
        { t: '冲上去拉开他们', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 3); g.remember('evBully', 'stood'); }, res: '他们没想到有人敢管，骂骂咧咧地走了。',
          fail: { fx: (g) => { g.stat('健康', -4); g.remember('evBully', 'stood'); }, res: '你脸上挨了一拳。可那个同学的钱保住了。' } },
        { t: '低头走过去', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evBully', 'passed'); }, res: '你走得很快。那个同学的眼神，你记了很久。' },
      ] },
    { id: 'e_talent_show', y: Y, minAge: 8, maxAge: 17, t: '文艺汇演', text: '学校要办文艺汇演，班主任问谁愿意上台。教室里没人举手。',
      choices: [
        { t: '低着头，等别人举手', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStage', 'shy'); }, res: '最后是班长上去唱了一首歌。' },
        { t: '举手，说你可以讲个相声', dev: 20, check: ['人缘', 45], fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('evStage', 'hit'); }, res: '全场笑了三次。下台的时候你的腿还在抖。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evStage', 'flop'); }, res: '你忘词了，站在台上一动不动。台下有人在笑，笑的不是相声。' } },
      ] },
    { id: 'e_idol_concert', y: Y, minAge: 14, maxAge: 35, t: '演唱会', text: '你喜欢了好几年的歌手要来附近的城市开演唱会，最便宜的票也要六百。',
      choices: [
        { t: '算了，在网上看直播', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evConcert', 'online'); }, res: '弹幕刷得太快，你看不清台上的人。' },
        { t: '攒钱，买票，坐夜车去', dev: 15, fx: (g) => { g.stat('心情', 5); CN.pay(g, 1500); g.remember('evConcert', 'went'); },
          res: (g) => (money(g) ? '门票加车票，一共花了 ' + fmt(1500) + '。' : '') + '散场的时候，你和旁边的陌生人一起哭了。你们加了好友。' },
      ] },

    // —— 青年、成年 ——
    { id: 'e_part_time_scam', y: Y, minAge: 16, maxAge: 30, t: '兼职', text: '一个陌生人拉你进群，说点赞刷单就能赚钱。前三单真的到账了，第四单要你先垫两千。',
      choices: [
        { t: '垫钱，想着做完这单就收手', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('心情', -3); g.remember('evScam', 'lost'); },
          res: (g) => (money(g) ? '' : '那是你攒了两年的压岁钱。') + '钱转过去，群就解散了。' },
        { t: '退群，拉黑', dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evScam', 'spotted'); }, res: '你把聊天记录截了图，发到了家族群里提醒大家。' },
        { t: '报警，把群号交给民警', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evScam', 'reported'); }, res: '民警说这个群已经骗了几十个学生。他们留了你的电话。' },
      ] },
    { id: 'e_friend_borrow', y: Y, minAge: 20, maxAge: 65, t: '借钱', cond: (g) => money(g),
      text: (g) => '一个多年的朋友半夜打来电话，说家里出了急事，想借 ' + fmt(loanAmt(g)) + '。他说话的声音有点抖。',
      choices: [
        { t: '借', canon: true, cond: (g) => cash(g) >= loanAmt(g), fx: (g) => { const a = loanAmt(g); CN.pay(g, a); g.stat('人缘', 2); g.remember('evLoan', 'lent'); g.remember('evLoanAmt', a); }, res: '钱转过去了。他说半年内一定还。' },
        { t: '借一半，说手头只有这些', dev: 10, cond: (g) => cash(g) >= loanAmt(g) / 2, fx: (g) => { const a = loanAmt(g) / 2; CN.pay(g, a); g.remember('evLoan', 'half'); g.remember('evLoanAmt', a); }, res: (g) => '你转过去 ' + fmt(g.recall('evLoanAmt')) + '。他沉默了两秒，说够了，谢谢你。' },
        { t: '手里没钱，陪他去想办法', dev: 15, cond: (g) => cash(g) < loanAmt(g) / 2, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evLoan', 'helped'); }, res: '第二天一早，你陪他跑了三家银行，又帮他打了一圈电话。' },
        { t: '说最近手头也紧', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evLoan', 'refused'); }, res: '他说没事，理解。电话挂得很快。' },
      ] },
    { id: 'e_class_reunion', y: Y, minAge: 25, maxAge: 65, t: '同学会', text: (g) => (['bachelor', 'master', 'phd'].includes(g.recall('edu')) ? '大学班长在群里发了通知：老同学们，找个周末聚一聚。' : '初中班长在群里发了通知：老同学们，回老家聚一聚。'),
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evReunion', 'went'); }, res: '有人胖了，有人秃了，有人没来。散场时你们约好明年再聚。' },
        { t: '找个理由不去', dev: 10, fx: (g) => { g.stat('心情', 1); g.remember('evReunion', 'skip'); }, res: '那天晚上你刷到了他们的合影。你在里面找了找，当然没有你。' },
      ] },
    { id: 'e_viral_video', y: Y, minAge: 18, maxAge: 60, t: '火了', text: '你随手拍的一条视频，一夜之间播放量过了五百万。手机一直在响。',
      choices: [
        { t: '回几条评论，日子照旧', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evViral', 'ignored'); }, res: '一个星期后，就没人记得这条视频了。' },
        { t: '趁热开直播、接广告', dev: 25, fx: (g) => { CN.earn(g, 8000); g.stat('事业', 2); g.info('副业', '博主'); g.remember('evViral', 'ride'); }, res: (g) => '第一场直播就有两万人看。第一条广告到手 ' + fmt(8000) + '。你说话的时候，手心全是汗。' },
        { t: '删掉，关掉评论', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evViral', 'deleted'); }, res: '有人截了图，转了好几轮。慢慢地，也就没人提了。' },
      ] },
    { id: 'e_subway_faint', y: Y, minAge: 16, maxAge: 72, t: '晕倒的人', cond: (g) => tier(g) <= 3,
      text: '早高峰的地铁上，一个中年男人突然倒在你脚边，脸色发青。车厢里的人都往后退。',
      choices: [
        { t: '大声喊人，打急救电话', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evFaint', 'called'); }, res: '列车到站，急救的人冲了进来。他被抬上担架的时候，手指动了一下。' },
        { t: '跪下来给他做心肺复苏', dev: 30, check: ['学识', 45], fx: (g) => { g.stat('人缘', 4); g.set('evSavedLife'); g.remember('evFaint', 'cpr'); }, res: '按到第三轮，他咳了一声，睁开了眼睛。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('evFaint', 'tried'); }, res: '你按了很久，直到急救的人接手。后来你一直不知道他有没有活下来。' } },
        { t: '低头看手机，等别人处理', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evFaint', 'away'); }, res: '下一站，你换了一节车厢。' },
      ] },
    { id: 'e_lottery', y: Y, minAge: 18, maxAge: 85, t: '彩票', cond: (g) => money(g), text: '楼下彩票站的老板说，昨天这里刚出了个二等奖。',
      choices: [
        { t: '不买，走了', canon: true, fx: (g) => { g.remember('evLottery', 'never'); }, res: '你买了一瓶水就走了。' },
        { t: '买两注，就当买个盼头', dev: 10, fx: (g) => { if (g.rnd() < 0.03) { CN.earn(g, 160000); g.stat('心情', 8); g.remember('evLottery', 'won'); } else { CN.pay(g, 4); g.remember('evLottery', 'habit'); } },
          res: (g) => (g.recall('evLottery') === 'won' ? '开奖那天你核对了七遍号码。中了，扣完税到手 ' + fmt(160000) + '。' : '四块钱，没中。可是从那以后，你每个星期都会去买两注。') },
      ] },
    { id: 'e_rain_rider', y: Y, minAge: 18, maxAge: 60, t: '暴雨', cond: (g) => job(g) === 'rider' || job(g) === 'driver',
      text: '暴雨。手机上还有七单没送，系统提示：超时将扣款。路边的积水已经没过了脚踝。',
      choices: [
        { t: '咬牙冲出去送', canon: true, fx: (g) => { CN.earn(g, 300); g.stat('健康', -3); g.remember('evRain', 'rushed'); }, res: '七单都送到了，多挣了三百块。你在一个路口摔了一跤，餐盒保住了，膝盖没保住。' },
        { t: '找个屋檐等雨小一点', dev: 10, fx: (g) => { CN.pay(g, 90); g.remember('evRain', 'waited'); }, res: '扣了九十块。你在屋檐下抽完了一根烟，雨停的时候，天边出了一点亮光。' },
        { t: '先把困在水里的老太太扶上台阶', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 60); g.remember('evRain', 'helped'); }, res: '超时扣了六十块。老太太一直问你的名字，你说不用了，骑上车走了。' },
      ] },
    { id: 'e_headhunter', y: Y, minAge: 24, maxAge: 50, t: '猎头', cond: (g) => ['tech', 'office', 'sales'].includes(job(g)),
      text: '一个猎头约你喝咖啡，说另一家公司愿意给你多开四成工资，就是要常加班。',
      choices: [
        { t: '谢谢，不考虑', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evHop', 'stayed'); }, res: '你回到工位，觉得椅子比平时舒服一点。' },
        { t: '跳', dev: 20, fx: (g) => { g.stat('事业', 4); g.stat('健康', -2); g.remember('evHop', 'hopped'); }, res: '新工牌是黑色的，比原来的好看。第一个月的工资条，你看了两遍。' },
        { t: '拿着这个去找老板谈加薪', dev: 15, check: ['事业', 45], fx: (g) => { g.stat('事业', 2); g.remember('evHop', 'raise'); }, res: '老板看了你很久，给你涨了两成。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evHop', 'cold'); }, res: '老板说，要走不拦。你没走，可从那以后，他看你的眼神不一样了。' } },
      ] },
    { id: 'e_rent_up', y: Y, minAge: 20, maxAge: 50, t: '房东', cond: (g) => money(g) && !withParents(g) && (g.recall('house') === 'rent' || (g.recall('house') == null && g.age >= 22 && tier(g) <= 3)),
      text: '房东发来消息：下个月起，房租每月涨五百。',
      choices: [
        { t: '忍了，接着住', canon: true, fx: (g) => { CN.pay(g, 6000); g.remember('evRent', 'paid'); }, res: (g) => '一年多交 ' + fmt(6000) + '。你把每天的咖啡戒了，改成自己泡茶。' },
        { t: '搬到更远的地方', dev: 10, fx: (g) => { g.stat('健康', -1); g.remember('evRent', 'moved'); }, res: '通勤多了四十分钟，房子大了一点，窗外能看见一片菜地。' },
        { t: '上门跟房东商量', dev: 10, check: ['人缘', 50], fx: (g) => { CN.pay(g, 2400); g.remember('evRent', 'haggled'); }, res: '房东是个退休老师。最后只涨了两百，还送了你一袋橘子。',
          fail: { fx: (g) => { CN.pay(g, 6000); g.stat('心情', -2); g.remember('evRent', 'paid'); }, res: '房东说，不租有的是人租。' } },
      ] },
    { id: 'e_red_envelope', y: Y, minAge: 22, maxAge: 55, t: '份子钱', cond: (g) => money(g), text: '这个月收到三张喜帖。其中一张来自一个你快记不起名字的同事。',
      choices: [
        { t: '每张都随常规的份子', canon: true, fx: (g) => { CN.pay(g, big(g) ? 2400 : 1500); g.remember('evGift', 'normal'); }, res: (g) => '三份份子，一共 ' + fmt(big(g) ? 2400 : 1500) + '。这个月的账有点紧。' },
        { t: '给要好的包个大红包，其他的不去', dev: 15, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 1); g.remember('evGift', 'close'); }, res: (g) => '你包了 ' + fmt(2000) + '。新郎抱着你，说你是他最好的朋友。' },
        { t: '都不去，说自己在出差', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evGift', 'skip'); }, res: '后来有人在群里提到你，说你最近好忙。' },
      ] },
    { id: 'e_relative_kid', y: Y, minAge: 32, maxAge: 62, t: '亲戚家的孩子', cond: (g) => g.s('事业') >= 35 && working(g),
      text: '表姐打电话来，说她家孩子刚毕业，想去你那里实习，问你能不能帮忙说句话。',
      choices: [
        { t: '帮着问一问', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evNephew', 'helped'); }, res: '孩子来了，很机灵，第一天就给你带了早饭。' },
        { t: '客气地推掉', dev: 10, fx: (g) => { g.stat('人缘', -1); g.remember('evNephew', 'declined'); }, res: '表姐说没事。过年的时候，她跟你说话少了。' },
      ] },
    { id: 'e_checkup', y: Y, minAge: 30, maxAge: 75, t: '体检单', text: (g) => (working(g) ? '单位体检的报告上' : '社区免费体检的报告上') + '，有一行字被加粗了：建议进一步检查。',
      choices: [
        { t: '去医院复查', canon: true, fx: (g) => { g.stat('健康', 2); g.remember('evCheck', 'checked'); }, res: '医生说发现得早，问题不大，按时吃药就行。你出了医院，给自己买了一碗热汤。' },
        { t: '忙完这阵再说', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evCheck', 'ignored'); }, res: '这阵子，一忙就是两年。' },
      ] },
    { id: 'e_marathon', y: Y, minAge: 20, maxAge: 62, t: '马拉松', text: '城市马拉松开始报名。一个朋友说他要去跑半程，问你去不去。',
      choices: [
        { t: '去跑', dev: 15, check: ['健康', 55], fx: (g) => { g.stat('健康', 3); g.stat('心情', 3); g.remember('evRun', 'ran'); }, res: '冲过终点的时候，你两条腿都不是自己的了。可你想再跑一次。',
          fail: { fx: (g) => { g.stat('健康', -2); g.remember('evRun', 'quit'); }, res: '跑到十二公里，你上了收容车。车上的人分给你一根香蕉。' } },
        { t: '在路边给他加油', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evRun', 'cheered'); }, res: '他跑过去的时候，冲你比了个大拇指。' },
      ] },
    { id: 'e_side_stall', y: Y, minAge: 20, maxAge: 55, t: '摆摊', cond: (g) => money(g), text: '朋友说夜市的摊位一个月才几百块，问你要不要一起卖烤肠。',
      choices: [
        { t: '算了，下班只想躺着', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evStall', 'no'); }, res: '你刷到他发的视频，摊前排着队。' },
        { t: '干', dev: 20, fx: (g) => { CN.pay(g, 3000); g.stat('健康', -1); g.remember('evStall', g.rnd() < 0.55 ? 'good' : 'bad'); }, res: (g) => '买炉子、进货，先花了 ' + fmt(3000) + '。第一晚卖了一百二十根。腰酸得直不起来，你却笑了一路。' },
      ] },
    { id: 'e_invest', y: Y, minAge: 25, maxAge: 68, t: '理财', cond: (g) => money(g) && cash(g) >= 20000,
      text: (g) => '同事都在说一只基金，说一个月涨了三成。你的 ' + fmt(cash(g)) + ' 存款躺在银行里，利息低得可怜。',
      choices: [
        { t: '还是存银行', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evInvest', 'saved'); }, res: '你睡得很踏实。' },
        { t: '拿一半存款追进去', dev: 20, fx: (g) => { const a = CN.invest(g, round(cash(g) / 2, 1000), 'stock'); g.stat('心情', 2); g.remember('evInvest', 'chased'); g.remember('evInvestAmt', a); }, res: (g) => '你买进了 ' + fmt(g.recall('evInvestAmt')) + '。第二天它涨了两个点，你一晚上看了三十次手机。' },
        { t: '每月定投一点，十年不看', dev: 15, fx: (g) => { const a = CN.invest(g, round(cash(g) * 0.2, 1000), 'fund'); g.remember('evInvest', 'dca'); g.remember('evInvestAmt', a); }, res: '你设好了自动扣款，然后卸载了那个软件。' },
      ] },
    { id: 'e_cat_adopt', y: Y, minAge: 20, maxAge: 80, t: '流浪猫', text: '小区的流浪猫生了一窝小猫。物业贴出通知，下周要统一清理。',
      choices: [
        { t: '领养一只', dev: 15, fx: (g) => { g.stat('心情', 4); g.remember('evCat', 'adopted'); }, res: '它是一只三花，第一天就钻进了你的被窝。' },
        { t: '在业主群里帮它们找主人', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('evCat', 'rehomed'); }, res: '五只小猫，三天就被领走了。' },
        { t: '和别人一样看看就走', canon: true, fx: (g) => g.stat('心情', -1), res: '下个星期，猫窝空了。' },
      ] },
    { id: 'e_neighbor', y: Y, minAge: 22, maxAge: 80, t: '楼上', cond: (g) => tier(g) <= 4, text: '楼上新搬来一户人家，每天晚上十一点开始拖椅子。',
      choices: [
        { t: '忍一忍，买副耳塞', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNeighbor', 'endured'); }, res: '耳塞很管用，就是早上的闹钟也听不见了。' },
        { t: '拎一袋水果上门聊聊', dev: 15, fx: (g) => { g.stat('人缘', 3); g.remember('evNeighbor', 'friend'); }, res: '开门的是个老太太，说她孙子晚上在家练跳绳。她给你泡了一杯茶。' },
        { t: '拿扫把杆捅天花板', dev: 15, fx: (g) => { g.stat('心情', 1); g.stat('人缘', -2); g.remember('evNeighbor', 'feud'); }, res: '楼上安静了。电梯里碰见，谁也不看谁。' },
      ] },
    { id: 'e_witness', y: Y, minAge: 20, maxAge: 72, t: '车祸', text: '路口一辆车闯红灯，撞倒了一个骑电动车的人。司机下车看了看，说是对方冲出来的。你看得清清楚楚。',
      choices: [
        { t: '留下电话，愿意作证', dev: 25, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evWitness', 'testified'); }, res: '交警记下了你的话。那个骑车的人躺在地上，冲你点了点头。' },
        { t: '帮着打了急救电话，没多说', canon: true, fx: (g) => { g.remember('evWitness', 'quiet'); }, res: '救护车来了，你就走了。' },
      ] },
    { id: 'e_volunteer', y: Y, minAge: 16, maxAge: 78, t: '志愿者', text: '社区在招志愿者：陪独居老人聊天，每周两个小时。',
      choices: [
        { t: '报名', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.remember('evVol', 'yes'); }, res: '你分到的老人是个退休的钳工，第一次见面就跟你讲了两个小时他年轻时的事。' },
        { t: '太忙了，下次吧', canon: true, fx: (g) => { g.remember('evVol', 'no'); }, res: '海报在公告栏上贴了一个月。' },
      ] },
    { id: 'e_classmate_ill', y: Y, minAge: 30, maxAge: 68, t: '众筹', text: '老同学群里有人转发了一条众筹链接。生病的是你初中时的同桌。',
      choices: [
        { t: '捐两百，转发', canon: true, fx: (g) => { CN.pay(g, 200); g.remember('evIll', 'shared'); }, res: '链接下面的留言越来越多。' },
        { t: '请假去医院看他', dev: 20, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 2000); g.remember('evIll', 'visited'); }, res: (g) => '你塞给他一个 ' + fmt(2000) + ' 的红包。他瘦得认不出来了，你们聊起初中时偷偷养在课桌里的蚕。' },
      ] },
    { id: 'e_lost_child', y: Y, minAge: 16, maxAge: 78, t: '走失的孩子', text: '商场门口，一个四五岁的小男孩站着哭，说找不到妈妈了。',
      choices: [
        { t: '带他去找保安和警察', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evKid', 'police'); }, res: '广播响了两遍，他妈妈跑了过来，抱住他就哭。' },
        { t: '陪着他在原地等，拍照发到本地群里', dev: 20, fx: (g) => { g.stat('人缘', 3); g.set('evFoundKid'); g.remember('evKid', 'waited'); }, res: '二十分钟后，他妈妈看到群里的照片找来了。她要给你钱，你没要。' },
      ] },
    { id: 'e_village_live', y: Y, minAge: 20, maxAge: 60, t: '老家的果子', cond: (g) => g.recall('hukou') === 'rural',
      text: '老家今年的果子大丰收，收购价却压得很低。村支书打电话问你，能不能在网上帮着卖一卖。',
      choices: [
        { t: '转发到朋友圈，帮着问问', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evVillage', 'shared'); }, res: '卖出去几十箱。支书说，谢谢你还记着村里。' },
        { t: '请几天假回去，开直播卖', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 1500); g.set('evVillageShop'); g.remember('evVillage', 'live'); }, res: '第一天卖了三千箱。二叔在镜头后面扛箱子，笑得合不拢嘴。' },
      ] },
    { id: 'e_old_teacher', y: Y, minAge: 25, maxAge: 72, t: '老师', text: '你听说当年的班主任住院了。她教了你三年，那时候总说你的字太潦草。',
      choices: [
        { t: '打个电话问候', canon: true, fx: (g) => { g.remember('evTeacher', 'called'); }, res: '电话那头她的声音很弱，可还是一下就叫出了你的名字。' },
        { t: '买束花去医院看她', dev: 15, fx: (g) => { g.stat('人缘', 2); g.remember('evTeacher', 'visited'); }, res: '她握着你的手，说你现在的字，好看多了。' },
      ] },
    { id: 'e_friend_divorce', y: Y, minAge: 30, maxAge: 62, t: '酒', text: '好朋友约你出来喝酒。喝到第三瓶，他说他要离婚了。',
      choices: [
        { t: '劝他再想想，为了孩子', canon: true, fx: (g) => { g.remember('evFriendDiv', 'persuade'); }, res: '他点点头，又摇了摇头。' },
        { t: '什么也不劝，陪他喝到天亮', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evFriendDiv', 'listened'); }, res: '天亮的时候，他说谢谢你没劝他。' },
      ] },
    { id: 'e_typhoon', y: Y, minAge: 10, maxAge: 80, t: '台风', cond: (g) => g.recall('region') === '华南' || g.recall('region') === '华东',
      text: '台风要登陆了。超市的面包架空了，窗户上贴满了米字形的胶带。',
      choices: [
        { t: '关好门窗，在家待着', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStorm', 'home'); }, res: '风刮了一夜，楼下的树倒了两棵。' },
        { t: '去帮楼下的独居老人加固窗户', dev: 20, fx: (g) => { g.stat('人缘', 3); g.remember('evStorm', 'helped'); }, res: '你钉好最后一块木板，雨就砸下来了。阿婆给你煮了一碗糖水。' },
        { t: '去海边拍浪', dev: 25, cond: (g) => g.age <= 55, check: ['健康', 50], fx: (g) => { g.stat('心情', 3); g.remember('evStorm', 'reckless'); }, res: '你拍到了一张浪比楼高的照片，转发了一万次。',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('evStorm', 'hurt'); }, res: '一阵浪把你拍在了栏杆上。你在医院住了半个月。' } },
      ] },
    { id: 'e_snowstorm', y: Y, minAge: 8, maxAge: 80, t: '大雪', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')),
      text: '一夜的大雪，早上推门推不开。院子里的雪没过了膝盖。',
      choices: [
        { t: '扫自家门口', canon: true, fx: (g) => g.stat('健康', 1), res: '扫完你出了一身汗，脸冻得通红。' },
        { t: '顺手把整栋楼门口都扫了', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evSnow', 'swept'); }, res: '楼上的大爷站在窗户后面看了你半天，第二天给你送来一兜冻梨。' },
        { t: '先堆个雪人再说', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('evSnow', 'fun'); }, res: '雪人的鼻子是一根胡萝卜。你拍了张照片，存了很多年。' },
      ] },
    { id: 'e_ai_layoff', y: [2044, 2080], minAge: 22, maxAge: 60, t: '新系统', cond: (g) => ['office', 'worker', 'driver', 'sales', 'shop'].includes(job(g)),
      text: '公司上了新的 AI 系统。部门开会说，明年的岗位要“优化”三成。',
      choices: [
        { t: '埋头干活，等着看', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('evAiCut', 'stay'); }, res: '那段时间，每次开会你都坐在最后一排。' },
        { t: '晚上去学怎么管这些系统', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('健康', -1); g.remember('evAiCut', 'reskill'); }, res: '课很难。第一个月，你在课上睡着了三次。' },
        { t: '先下手，自己出去找活路', dev: 25, fx: (g) => { CN.setJob(g, 'freelance', '自由职业'); g.remember('evAiCut', 'left'); }, res: '你递了辞职信。走出写字楼的时候，天特别蓝。' },
      ] },
    { id: 'e_robot_buy', y: [2060, 2130], minAge: 35, t: '机器人', cond: (g) => g.recall('robot') == null && money(g),
      text: (g) => '家电城在搞活动：家务机器人 ' + fmt(36000) + '，分二十四期免息。售货员说，它能做饭、拖地、陪老人下棋。',
      choices: [
        { t: '太贵了，再等等', canon: true, fx: (g) => { g.remember('evRobot', 'waited'); }, res: '你在它面前站了十分钟，摸了摸它的手。' },
        { t: '分期买一台', dev: 15, fx: (g) => { CN.pay(g, 36000); g.stat('健康', 1); g.remember('evRobot', 'bought'); }, res: '它到家的第一天，把你的袜子按颜色排好了。' },
      ] },
    { id: 'e_hometown_newyear', y: Y, minAge: 18, maxAge: 60, t: '过年',
      cond: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && parentsAlive(g) && !withParents(g) && g.recall('parentsCare') !== 'nursing',
      text: '腊月二十，抢票软件开了一整夜，回老家的票还是候补。',
      choices: [
        { t: '加钱买站票也要回', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 2); g.stat('健康', -1); g.remember('evNewYear', 'home'); }, res: '站了九个小时。推开家门，饭桌上摆着你最爱吃的菜。' },
        { t: '今年不回了，视频拜年', dev: 15, fx: (g) => { g.stat('心情', -1); g.remember('evNewYear', 'stay'); }, res: (g) => (has(g, 'mo') ? '视频里，妈妈说没事没事，你那边吃饺子没。' : '视频里，爸爸说没事，让你自己记得吃顿好的。') },
        { t: (g) => '把' + parentsWord(g) + '接过来过年', dev: 20, fx: (g) => { CN.pay(g, 8000); g.stat('人缘', 3); g.remember('evNewYear', 'brought'); },
          res: (g) => (has(g, 'fa') && has(g, 'mo') ? '他们' : parentsWord(g)) + '第一次看到这座城市的烟火，一直说太贵了，一直在拍照。车票、吃住，一共花了 ' + fmt(8000) + '。' },
      ] },
    { id: 'e_health_lecture', y: Y, minAge: 60, t: '讲座', text: '小区门口发鸡蛋，说听完一场“健康讲座”就送一盒。讲台上的人说，他们的保健品能治百病。',
      choices: [
        { t: '领了鸡蛋就走', canon: true, fx: (g) => g.stat('心情', 1), res: '鸡蛋有两个是破的。' },
        { t: '买了一个疗程', dev: 15, fx: (g) => { CN.pay(g, 8800); g.remember('evLecture', 'bought'); }, res: '一个疗程八千八。他们说，第二个疗程打八折。' },
        { t: '站起来问他：有没有批文', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evLecture', 'exposed'); }, res: '讲台上的人愣住了。几个老邻居跟着你一起走了出去。' },
      ] },
    { id: 'e_square_dance', y: Y, minAge: 55, maxAge: 82, t: '广场', text: '傍晚的广场上，一群人跟着音乐在跳舞。领舞的阿姨冲你招手。',
      choices: [
        { t: '在旁边看看就好', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evDance', 'watched'); }, res: '音乐很响，你跟着拍了几下腿。' },
        { t: '加进去跳', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('evDance', 'joined'); }, res: '你踩错了好几拍，没人笑你。散场的时候，有人塞给你一瓶水。' },
      ] },
    { id: 'e_tech_class', y: Y, minAge: 66, t: '新设备', cond: (g) => kids(g).length > 0,
      text: (g) => (gks(g).length ? '孙辈' : '孩子') + '送你一副新眼镜，说戴上就能和他们视频，还能把字放大。说明书你看不懂。',
      choices: [
        { t: '收进抽屉，用老手机就行', canon: true, fx: (g) => { g.remember('evTech', 'drawer'); }, res: '老手机的屏幕已经裂了一道缝。' },
        { t: '去社区的老年课学怎么用', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('evTech', 'learned'); }, res: '老师是个大学生，很耐心。你在本子上记了满满三页。' },
      ] },

    // —— 钱 ——
    { id: 'e_tip_stock', y: Y, minAge: 25, maxAge: 70, t: '内部消息', cond: (g) => money(g) && cash(g) >= 30000,
      text: '过节的饭桌上，一个远房表舅压低了声音：他有个朋友在一家公司上班，下个月有大消息，那只股票现在买，少说翻一倍。',
      choices: [
        { t: '笑笑，不当真', canon: true, fx: (g) => { g.remember('evTip', 'no'); }, res: '你给表舅倒了一杯茶，聊起了别的。' },
        { t: (g) => '拿出 ' + fmt(tipAmt(g)) + ' 买进去', dev: 20, fx: (g) => { const a = tipAmt(g); CN.pay(g, a); g.stat('心情', 2); g.remember('evTip', 'in'); g.remember('evTipAmt', a); }, res: (g) => '你把 ' + fmt(g.recall('evTipAmt')) + ' 转进了股票账户。那天晚上，你梦见数字一直在涨。' },
        { t: '只拿一小笔试试', dev: 10, fx: (g) => { const a = round(tipAmt(g) / 5, 1000); CN.pay(g, a); g.remember('evTip', 'little'); g.remember('evTipAmt', a); }, res: (g) => '你买了 ' + fmt(g.recall('evTipAmt')) + '，告诉自己，亏了就当交学费。' },
      ] },
    { id: 'e_high_yield', y: Y, minAge: 40, maxAge: 85, t: '理财顾问', cond: (g) => money(g) && cash(g) >= 20000,
      text: '一个自称理财顾问的人加了你好友。他说有一款产品，年化百分之十五，保本保息，已经有很多人买了，开户还送一桶油。',
      choices: [
        { t: '不信，删了', canon: true, fx: (g) => { g.remember('evHigh', 'no'); }, res: '他又换了一个号来加你。你又删了。' },
        { t: (g) => '先投 ' + fmt(highAmt(g)) + ' 试试', dev: 15, fx: (g) => { const a = highAmt(g); CN.pay(g, a); g.remember('evHigh', 'in'); g.remember('evHighAmt', a); }, res: '第一个月，利息真的到账了。那桶油也送到了家门口。' },
        { t: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? '先问问孩子' : '先去银行问问柜员'), dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evHigh', 'asked'); },
          res: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? '孩子在电话里急了：这是骗子。' + ta(g, 'k1') + '帮你把那个人拉黑了。' : '柜员看了一眼，说这种保本百分之十五的，十个有十个是骗人的。') },
      ] },
    { id: 'e_net_loan', y: Y, minAge: 18, maxAge: 32, t: '网贷', cond: (g) => money(g) && cash(g) < 10000,
      text: '手机上弹出一条广告：凭身份证最高借五万，秒到账，前三十天免息。你这个月的钱，确实不太够了。',
      choices: [
        { t: '不点开，这个月省着点', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNetLoan', 'no'); }, res: '你把外卖软件卸了，天天自己煮面。' },
        { t: '借两万应急', dev: 15, fx: (g) => { CN.earn(g, 20000); g.remember('debt', (Number(g.recall('debt')) || 0) + 2.6); g.remember('evNetLoan', 'took'); }, res: (g) => '十秒钟，' + fmt(20000) + ' 就到了账。合同有二十页，你一页也没看。' },
        { t: (g) => '跟' + parentsWord(g) + '开口', dev: 10, cond: (g) => parentsAlive(g), fx: (g) => { CN.earn(g, 5000); g.remember('evNetLoan', 'family'); }, res: (g) => '电话里你支支吾吾。第二天，卡里多了 ' + fmt(5000) + '，附言写着：吃好点。' },
      ] },
    { id: 'e_windfall', y: Y, minAge: 22, maxAge: 64, t: '年会', cond: (g) => money(g) && working(g) && job(g) !== 'farmer',
      text: (g) => (['rider', 'driver', 'worker'].includes(job(g)) ? '年底聚餐抽奖' : '公司年会抽奖') + '，主持人念到了你的名字：一等奖，现金 ' + fmt(20000) + '。',
      choices: [
        { t: '存起来', canon: true, fx: (g) => { CN.earn(g, 20000); g.remember('evWindfall', 'saved'); }, res: '你把钱转进了存款，心里踏实了一点。' },
        { t: (g) => (CN.alone(g) ? '给自己放个假，出去走一趟' : '带家里人出去玩一趟'), dev: 15, fx: (g) => { CN.earn(g, 2000); g.stat('心情', 5); g.remember('evWindfall', 'trip'); },
          res: (g) => (CN.alone(g) ? '你一个人去了海边，住了五天，花得只剩两千。' : '一家人去了趟海边，住了五天，花得只剩两千。') },
        { t: (g) => '全给' + parentsWord(g), dev: 15, cond: (g) => parentsAlive(g), fx: (g) => { g.stat('人缘', 3); g.remember('evWindfall', 'parents'); }, res: (g) => parentsWord(g) + '在电话里推了半天，最后说，那就先替你存着。' },
      ] },
    { id: 'e_car', y: Y, minAge: 24, maxAge: 60, t: '买车', cond: (g) => money(g) && cash(g) >= 60000,
      text: (g) => '周末去车展转了一圈。销售说，这款电动车今年降价，' + fmt(carPrice(g)) + '，首付只要两成。',
      choices: [
        { t: '再等等，打车也挺好', canon: true, fx: (g) => { g.remember('evCar', 'no'); }, res: '你在车里坐了五分钟，下来的时候摸了摸方向盘。' },
        { t: '分期买一辆新的', dev: 15, fx: (g) => { const p = carPrice(g); CN.pay(g, p * 0.2); g.remember('debt', (Number(g.recall('debt')) || 0) + p * 0.8 / 1e4); g.remember('evCar', 'new'); g.stat('心情', 3); }, res: (g) => '首付 ' + fmt(carPrice(g) * 0.2) + '，剩下的分三年还。提车那天，你在车里坐了很久才开走。' },
        { t: '买一辆二手车', dev: 10, fx: (g) => { CN.pay(g, 50000); g.remember('evCar', 'used'); g.stat('心情', 2); }, res: (g) => '一辆开了五年的车，' + fmt(50000) + '。座椅上还有前主人家孩子贴的贴纸。' },
      ] },
    { id: 'e_insurance', y: Y, minAge: 28, maxAge: 55, t: '保险', cond: (g) => money(g) && working(g),
      text: (g) => '一个老同学做了保险，约你喝茶，给你算了一笔账：一份重疾险，每年交 ' + fmt(premium(g)) + '，交二十年。',
      choices: [
        { t: '说再考虑考虑', canon: true, fx: (g) => { g.remember('evIns', 'no'); }, res: '茶喝完了，他说不急，有需要随时找他。' },
        { t: '买', dev: 10, fx: (g) => { const p = premium(g); CN.pay(g, p); g.remember('evIns', 'bought'); g.remember('evInsAmt', p); }, res: (g) => '你签了字，第一年交了 ' + fmt(g.recall('evInsAmt')) + '。他说，这钱最好一辈子用不上。' },
        { t: '只买一份几百块的医疗险', dev: 10, fx: (g) => { CN.pay(g, 600); g.remember('evIns', 'cheap'); }, res: '一年六百。老同学有点失望，还是帮你办好了。' },
      ] },
  ]);

  JY.addEncounters([
    { id: 'e_rent_offer', y: Y, minAge: 22, maxAge: 60, t: '房东卖房', cond: (g) => g.recall('evRentOffer') === true && !['own', 'mortgage'].includes(g.recall('house')) && money(g),
      text: (g) => '退休老师房东又来问了一次：这房子卖给你，' + fmt(offerPrice(g) * 1e4) + '，比市价便宜一成，首付可以分两年给。',
      choices: [
        { t: '买下来，背上房贷', dev: 15, cond: (g) => cash(g) >= offerDown(g), fx: (g) => { CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('evRentOffer', 'bought'); g.stat('心情', 4); },
          res: (g) => '首付 ' + fmt(offerDown(g)) + '。签合同那天，房东把一串钥匙交给你，说阳台上的花记得浇。' },
        { t: '东拼西凑，借钱付首付', dev: 20, cond: (g) => cash(g) < offerDown(g), fx: (g) => { const short = Math.max(0, offerDown(g) - Math.max(0, cash(g))); CN.earn(g, short); CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('debt', (Number(g.recall('debt')) || 0) + short / 1e4); g.remember('evRentOffer', 'bought'); g.stat('心情', 2); },
          res: '你打了一圈电话，借齐了首付。签合同那天，房东把一串钥匙交给你，说阳台上的花记得浇。' },
        { t: '谢谢她，还是租着', canon: true, fx: (g) => { g.remember('evRentOffer', 'declined'); }, res: '房子卖给了别人。搬走那天，老师给你写了一张卡片。' },
      ] },
  ]);

  /* ---------- 回响：几年后读到上面那些选择 ---------- */
  // read 返回 [当年的选择, 过了几年]，写成字面的 g.recall('键')，检查工具才认得
  const echo = (id, read, t, years, minAge, map) => ({
    id, y: Y, minAge, t, auto: true, always: true, kind: 'echo',
    cond: (g) => { const [v, n] = read(g); return !!map[v] && n >= years; },
    fx: (g) => { const m = map[read(g)[0]]; if (m.fx) m.fx(g); },
    text: (g) => { const m = map[read(g)[0]]; return m ? JY.val(m.t) : ''; },
  });
  JY.addEncounters([
    echo('e_echo_dog', (g) => [g.recall('evDog'), g.since('evDog')], '小狗', 4, 10, {
      kept: { t: '那只瘸腿的小狗长成了一条大黄狗。每天放学，它都蹲在路口等你。', fx: (g) => g.stat('心情', 3) },
      fed: { t: '路口那只瘸腿的狗，被一户卖早点的人家收养了。你每天路过，它都冲你摇尾巴。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_dog2', (g) => [g.recall('evDog'), g.since('evDog')], '老狗', 13, 18, {
      kept: { t: '大黄老了，走不动了。那天你回家，它在门口趴着，等到你摸了摸它的头，才闭上眼睛。', fx: (g) => g.stat('心情', -4) },
    }),
    echo('e_echo_wallet', (g) => [g.recall('evWallet'), g.since('evWallet')], '钱包', 1, 9, {
      returned: { t: '钱包的主人是个外卖骑手，那四百块是他半个月的饭钱。他给学校送来一面锦旗，上面写着你的名字。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); } },
      kept: { t: '学校的公告栏上贴了一张寻物启事：外卖骑手，丢失钱包，内有半个月饭钱。你在启事前站了很久。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_aihw', (g) => [g.recall('evAiHw'), g.since('evAiHw')], '考试', 1, 9, {
      copy: { t: '期中考试，考场里没有 AI。你盯着卷子，发现自己连题目都看不太懂。', fx: (g) => { g.stat('学识', -3); g.stat('心情', -2); } },
      learn: { t: '期中考试，最后一道大题你做出来了。是那天晚上 AI 提示过的那种解法。', fx: (g) => g.stat('学识', 2) },
      self: { t: '期中考试，你的分数不算最高，可老师说你的解题步骤是全班最干净的。', fx: (g) => { g.stat('学识', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_game', (g) => [g.recall('evGame'), g.since('evGame')], '账号', 2, 13, {
      hooked: { t: '你的游戏账号排名越来越高，成绩单上的排名越来越低。家长会后，家里把网线拔了。', fx: (g) => { g.stat('学识', -3); g.stat('人缘', -1); } },
      quit: { t: '同学们还在聊那款游戏，你已经插不上话了。不过你多读完了两本书。', fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); } },
    }),
    echo('e_echo_bully', (g) => [g.recall('evBully'), g.since('evBully')], '那个同学', 8, 18, {
      stood: { t: '当年在厕所门口被堵的那个同学加了你的好友。他说他现在是一名警察，那件事他一直记着。', fx: (g) => { g.stat('人缘', 3); g.rel('老同学', '当年被欺负的同学', '后来当了警察'); } },
      told: { t: '你在街上碰见当年被欺负的那个同学，他请你吃了一碗面，说那天谢谢你去叫了老师。', fx: (g) => g.stat('人缘', 1) },
      passed: { t: '同学聚会上，当年被欺负的那个同学坐在角落。他看见你，客气地笑了笑，没有说话。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_stage', (g) => [g.recall('evStage'), g.since('evStage')], '舞台', 3, 12, {
      hit: { t: '那次相声以后，学校每次有活动都叫你上台。你不再怕人多的地方了。', fx: (g) => { g.stat('人缘', 2); g.stat('事业', 1); } },
      shy: { t: '那次上台唱歌的班长，后来成了学校的主持人。每次看她站在台上，你都想，那天要是举了手会怎样。', fx: (g) => g.stat('心情', -1) },
      flop: { t: '那次忘词的事，同学们早忘了。只有你还记得。后来每次要当众说话，你都会提前写好稿子。', fx: (g) => g.stat('学识', 1) },
    }),
    echo('e_echo_concert', (g) => [g.recall('evConcert'), g.since('evConcert')], '散场的朋友', 3, 17, {
      online: { t: '那个歌手宣布退出了。最后一场演唱会，你还是在网上看的。', fx: (g) => g.stat('心情', -2) },
      went: { t: '演唱会上认识的那个人，后来成了你最常聊天的朋友。你们约好下一场还一起去。', fx: (g) => { g.stat('人缘', 2); g.rel('网友', '演唱会上认识的朋友'); } },
    }),
    echo('e_echo_scam', (g) => [g.recall('evScam'), g.since('evScam')], '反诈', 1, 17, {
      lost: { t: '你在反诈宣传的展板上看见了那个群名。展板上写着：涉案金额两百余万，受害者多为学生。', fx: (g) => { g.stat('学识', 2); g.stat('心情', -1); } },
      reported: { t: '派出所打来电话：那个刷单团伙被抓了，你提供的线索有用。被骗的学生，追回了大半的钱。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 3); } },
      spotted: { t: '家族群里，表姑说她差点被一个刷单群骗了，多亏想起你发的截图。', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_loan', (g) => [g.recall('evLoan'), g.since('evLoan')], '借出去的钱', 2, 22, {
      lent: { t: (g) => (g.recall('evLoanBack') ? '那个朋友把 ' + fmt(g.recall('evLoanAmt')) + ' 还了，还多转了两千，说是利息。他家里的事已经过去了。' : '借出去的 ' + fmt(g.recall('evLoanAmt')) + '，一直没有还。他的头像，后来变成了灰色。'),
        fx: (g) => { const back = g.rnd() < 0.6; g.remember('evLoanBack', back); if (back) { CN.earn(g, (Number(g.recall('evLoanAmt')) || 0) + 2000); g.stat('人缘', 2); } else { g.stat('心情', -3); } } },
      half: { t: (g) => '那个朋友把借你的 ' + fmt(g.recall('evLoanAmt')) + ' 还了，说另一半是别人借的。他没再找过你，你也没再找过他。', fx: (g) => { CN.earn(g, Number(g.recall('evLoanAmt')) || 0); g.stat('人缘', -1); } },
      helped: { t: '那个朋友家里的事扛过去了。他说那天你陪他跑银行，比借钱给他还管用。现在每年过年，他都第一个给你打电话。', fx: (g) => g.stat('人缘', 3) },
      refused: { t: '你听说那个朋友家里的事，最后是另一个朋友帮着扛过去的。他们现在常在一起喝酒。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_reunion', (g) => [g.recall('evReunion'), g.since('evReunion')], '老同学', 2, 27, {
      went: { t: (g) => (working(g) ? '同学会上重新联系上的一个老同学，给你介绍了一单生意，你赚了 ' + fmt(10000) + '。你们说好以后常走动。' : '同学会上重新联系上的一个老同学，约你每个周末去河边钓鱼。你们说好以后常走动。'),
        fx: (g) => { if (working(g)) CN.earn(g, 10000); g.stat('人缘', 2); g.rel('老同学', '同学会上重逢的老同学'); } },
      skip: { t: '你从别人嘴里听说，老同学里有人已经不在了。那次同学会，是他最后一次露面。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_viral', (g) => [g.recall('evViral'), g.since('evViral')], '粉丝', 2, 20, {
      ride: { t: (g) => (g.recall('evViralEarn') ? '你的账号做起来了。这一年光广告就进账 ' + fmt(g.recall('evViralEarn')) + '。' : '粉丝涨到一个数，就再也不动了。你每天对着镜头说话，越来越不知道该说什么。'),
        fx: (g) => { const up = g.s('事业') >= 40; const e = up ? round(inc(g) * 0.4, 1000) : 0; g.remember('evViralEarn', e); if (up) CN.earn(g, e); else g.stat('心情', -3); } },
      deleted: { t: '有个陌生人发来私信，说当年那条视频他存了下来，看了很多遍。他问你为什么删了。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_faint', (g) => [g.recall('evFaint'), g.since('evFaint')], '那个人', 1, 17, {
      cpr: { t: '一个陌生号码打来电话。是地铁上倒下的那个人，他的女儿刚考上大学。他说，没有你，他看不到这一天。', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); } },
      tried: { t: '你在新闻里看到，那天地铁上倒下的人被救回来了。新闻里说，是一位乘客先做了心肺复苏。', fx: (g) => g.stat('心情', 4) },
      called: { t: '地铁站贴出一张感谢信：感谢那天早高峰第一个喊人、打急救电话的乘客。你在信前站了一会儿。', fx: (g) => g.stat('心情', 2) },
      away: { t: '那节车厢，你后来再也没坐过。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_lottery', (g) => [g.recall('evLottery'), g.since('evLottery')], '彩票', 1, 19, {
      won: { t: '中奖的事没瞒住。这一年，你多了很多亲戚。', fx: (g) => { g.stat('人缘', -2); g.stat('心情', -1); } },
      never: { t: '楼下彩票站出了个大奖，中奖号码正好是你的生日。你站在门口看了半天红榜，笑了笑，回家做饭去了。', fx: (g) => g.stat('心情', -1) },
      habit: { t: '每个星期两注彩票，你坚持了好多年。一次也没中过大奖，但每个开奖的晚上，你都过得很有盼头。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_rain', (g) => [g.recall('evRain'), g.since('evRain')], '锦旗', 1, 19, {
      helped: { t: (g) => '外卖站点收到一面锦旗，说找一个暴雨天扶老人的骑手。站长一看监控，是你。那个月你拿了全站的好评奖，奖金 ' + fmt(1000) + '。', fx: (g) => { g.stat('人缘', 3); CN.earn(g, 1000); } },
      rushed: { t: '那次摔的膝盖，一到阴雨天就疼。', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_hop', (g) => [g.recall('evHop'), g.since('evHop')], '那次跳槽', 2, 26, {
      hopped: { t: (g) => (g.recall('evHopLuck') ? '跳槽去的那家公司上市了。你的期权换成了 ' + fmt(round(CN.price(g) * 0.2 * 1e4, 10000)) + '，够付一套房的首付。' : '跳槽去的那家公司裁员了，名单上有你。好在赔偿金不少，你歇了两个月，又找到了下一份。'),
        fx: (g) => { const up = g.rnd() < 0.4; g.remember('evHopLuck', up); if (up) CN.earn(g, round(CN.price(g) * 0.2 * 1e4, 10000)); else { g.stat('事业', -3); g.stat('心情', -3); } } },
      raise: { t: '老板升了，走之前把你推荐给了接班的人。', fx: (g) => g.stat('事业', 4) },
      cold: { t: '那次谈加薪以后，你的项目越来越少。年底，你自己走了。新公司的同事都很好相处。', fx: (g) => { g.stat('事业', -3); g.stat('心情', -1); } },
    }),
    echo('e_echo_rent', (g) => [g.recall('evRent'), g.since('evRent')], '搬家以后', 2, 22, {
      moved: { t: '新住处楼下的菜地，是一个大爷种的。他常把吃不完的菜挂在你门把手上。', fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
      haggled: { t: '那个退休老师房东说要卖房了，问你想不想买，价钱好商量。', fx: (g) => { g.stat('心情', 2); g.remember('evRentOffer', true); } },
    }),
    echo('e_echo_rentoffer', (g) => [g.recall('evRentOffer'), g.since('evRentOffer')], '阳台的花', 2, 24, {
      bought: { t: '阳台上那盆老房东留下的花开了。你拍了张照片发给她，她回了一个大大的笑脸。', fx: (g) => g.stat('心情', 3) },
      declined: { t: '你路过那栋楼，抬头看了一眼。阳台上换了别人家的花，也开得很好。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_gift', (g) => [g.recall('evGift'), g.since('evGift')], '人情', 3, 25, {
      close: { t: '你家里有事那天，第一个到的是当年你包了大红包的那个朋友。他什么也没问，挽起袖子就干活。', fx: (g) => g.stat('人缘', 3) },
      skip: { t: '你有事想找人帮忙，翻遍了通讯录，不知道该打给谁。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_nephew', (g) => [g.recall('evNephew'), g.since('evNephew')], '表姐家的孩子', 3, 35, {
      helped: { t: '表姐家的孩子在你那里转正了，后来还升了组长。过年回去，表姐拉着你的手，非要你多喝一杯。', fx: (g) => { g.stat('人缘', 3); g.rel('外甥', '表姐家的孩子', '在你那里实习过'); } },
      declined: { t: '表姐家的孩子自己找到了工作，干得不错。表姐说起这事，语气里有点什么。', fx: (g) => g.stat('人缘', -1) },
    }),
    echo('e_echo_check', (g) => [g.recall('evCheck'), g.since('evCheck')], '复查', 2, 32, {
      ignored: { t: '这一年你总觉得累。再去医院的时候，医生看着片子，问你为什么不早点来。', fx: (g) => { g.stat('健康', -12); g.stat('心情', -4); } },
      checked: { t: '定期复查，指标一直平稳。医生说你是她见过最听话的病人。', fx: (g) => g.stat('健康', 2) },
    }),
    echo('e_echo_run', (g) => [g.recall('evRun'), g.since('evRun')], '跑步', 2, 22, {
      cheered: { t: '那个跑马拉松的朋友又来叫你：明年一起跑吧。你想了想，买了一双跑鞋。', fx: (g) => g.stat('健康', 2) },
      ran: { t: '跑步成了你的习惯。每周三次，雷打不动。体检的时候，医生说你的心肺比同龄人年轻十岁。', fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); } },
    }),
    echo('e_echo_stall', (g) => [g.recall('evStall'), g.since('evStall')], '夜市', 1, 21, {
      good: { t: (g) => '夜市的摊子越摆越熟，这一年挣了 ' + fmt(15000) + '。你给摊子起了个名字，挂了一块小灯牌。', fx: (g) => { CN.earn(g, 15000); g.stat('健康', -1); } },
      no: { t: '那个摆摊的朋友攒够了钱，开了一家小店。开业那天，他请你去吃了一顿，说当年要是你也来就好了。', fx: (g) => g.stat('人缘', 1) },
      bad: { t: '夜市整顿，摊子摆不下去了。剩下的两箱烤肠，你吃了一个月。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_invest', (g) => [g.recall('evInvest'), g.since('evInvest')], '那只基金', 2, 27, {
      chased: { t: (g) => { const got = Number(g.recall('evInvestGot')) || 0, amt = Number(g.recall('evInvestAmt')) || 0;
        if (!got) return '你早就把那笔钱取出来了。那只基金后来怎么样，你没再看。';
        return got >= amt ? '那只基金涨涨跌跌。你在一次大涨后全卖了：投进去 ' + fmt(amt) + '，取出来 ' + fmt(got) + '，心里痛快了好几天。' : '那只基金跌跌撞撞。你受不了，全卖了：投进去 ' + fmt(amt) + '，只剩 ' + fmt(got) + '。你把软件卸了，又装上，又卸了。'; },
        fx: (g) => { const cur = Number(g.recall('invest')) || 0; g.remember('evInvestGot', cur); if (cur > 0) CN.withdraw(g); } },
      dca: { t: (g) => ((Number(g.recall('invest')) || 0) > 0 ? '你重新装上那个软件，看了一眼理财账户：' + fmt(g.recall('invest')) + '。不多，可比存银行多出一截。' : '你重新装上那个软件，才想起定投的钱早就取出来用了。'), fx: (g) => g.stat('心情', 1) },
      saved: { t: '同事追的那只基金跌了一半，午饭的时候没人再提。你的钱还在银行里，一分没少。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_cat', (g) => [g.recall('evCat'), g.since('evCat')], '三花', 12, 32, {
      adopted: { t: '那只三花陪了你十二年。最后那几天，它总是趴在你的拖鞋上。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_cat2', (g) => [g.recall('evCat'), g.since('evCat')], '猫', 2, 22, {
      adopted: { t: '三花胖了一圈，每天傍晚蹲在门口等你回家。你一开门，它就躺下露出肚皮。', fx: (g) => g.stat('心情', 2) },
      rehomed: { t: '业主群里，领走小猫的几户人家常发照片。五只小猫都长大了，有一只还当上了一家小卖部的“店长”。', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_neighbor', (g) => [g.recall('evNeighbor'), g.since('evNeighbor')], '邻居', 2, 24, {
      friend: { t: '楼上的老太太成了你家的常客。你不在家那阵子，是她帮你收的快递，还顺手把你阳台的花浇了。', fx: (g) => { g.stat('人缘', 2); g.rel('邻居', '楼上的老太太'); } },
      feud: { t: '你家水管漏水，水渗到了楼下。来敲门的，正好是楼上那家人。他们看了你一眼，帮你把总阀关上了。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_witness', (g) => [g.recall('evWitness'), g.since('evWitness')], '证词', 1, 21, {
      testified: { t: '那场车祸的官司判了。法官采信了你的证词，受伤的人拿到了赔偿。他的家人给你寄来一箱老家的苹果。', fx: (g) => { g.stat('人缘', 3); g.set('evWitness'); } },
    }),
    echo('e_echo_vol', (g) => [g.recall('evVol'), g.since('evVol')], '志愿者', 4, 20, {
      no: { t: '社区那位退休的老钳工，后来由一个大学生陪着。你在楼下碰见他们下棋，老人笑得很大声。', fx: (g) => g.stat('心情', 1) },
      yes: { t: '每周两个小时，你坚持了好几年。社区给你发了一个小小的证书，你夹在了相册里。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.set('evVolunteer'); } },
    }),
    echo('e_echo_ill', (g) => [g.recall('evIll'), g.since('evIll')], '同桌', 1, 31, {
      visited: { t: '你的初中同桌病好了。他给你寄来一盒蚕茧，附了一张字条：这回养成了。', fx: (g) => { g.stat('心情', 4); g.rel('老同学', '初中同桌'); } },
      shared: { t: '你听说初中同桌的病好了。众筹的链接，你一直没删。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_kid', (g) => [g.recall('evKid'), g.since('evKid')], '那个孩子', 12, 28, {
      waited: { t: '一个高中生在街上叫住你。他说他就是当年商场门口走丢的那个孩子，妈妈一直留着那张照片。', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 2); } },
    }),
    echo('e_echo_village', (g) => [g.recall('evVillage'), g.since('evVillage')], '老家', 2, 22, {
      live: { t: '老家的果子有了自己的牌子，村里盖了冷库，年轻人回来了几个。村口的路，是今年新修的。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); } },
      shared: { t: '老家的果子还是卖不上价。村支书打电话来，没提这事，只问你什么时候回来。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_teacher', (g) => [g.recall('evTeacher'), g.since('evTeacher')], '老师', 1, 26, {
      visited: { t: '班主任走了。她的家人整理遗物时，找到一沓旧作文本，里面有你的一本，上面的红笔批注还很清楚。', fx: (g) => { g.stat('心情', -2); g.stat('学识', 1); } },
      called: { t: '你听说班主任走了。那通电话，是你们最后一次说话。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_frienddiv', (g) => [g.recall('evFriendDiv'), g.since('evFriendDiv')], '朋友', 2, 32, {
      listened: { t: '那个离婚的朋友，重新成了家。婚礼上，他让你坐第一桌。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); } },
      persuade: { t: '那个朋友到底还是离了。他说你劝得对，可他做不到。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_storm', (g) => [g.recall('evStorm'), g.since('evStorm')], '台风之后', 1, 11, {
      helped: { t: '楼下的阿婆逢人就说，台风那天是你帮她钉的窗户。整栋楼的人见了你都很客气。', fx: (g) => g.stat('人缘', 3) },
      home: { t: '台风那年倒下的两棵树，原地种上了小树苗。今年春天，它们抽出了新叶子。', fx: (g) => g.stat('心情', 1) },
      reckless: { t: '你那张浪比楼高的照片，被一家杂志买去当了封面，给了你一笔稿费。你把照片洗出来，挂在墙上。', fx: (g) => { g.stat('心情', 2); CN.earn(g, 3000); } },
      hurt: { t: '那次被浪拍伤的肩膀，留下了旧伤。抬手拿高处的东西，你总要先停一下。', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_snow', (g) => [g.recall('evSnow'), g.since('evSnow')], '冻梨', 1, 9, {
      swept: { t: '这一年冬天，楼上大爷家的冻梨又给你送来了一兜。大爷说，你扫雪那年，他记一辈子。', fx: (g) => g.stat('人缘', 2) },
      fun: { t: '你翻到那张雪人的照片，胡萝卜鼻子已经歪了。你笑了很久。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_aicut', (g) => [g.recall('evAiCut'), g.since('evAiCut')], '那一轮优化', 1, 23, {
      reskill: { t: '优化名单出来了，没有你。新系统出了问题，部门里只有你能看懂报警。', fx: (g) => g.stat('事业', 5) },
      stay: { t: '优化名单出来了。你没被裁，被调去了一个边缘的岗位，工资降了两成。', fx: (g) => { g.stat('事业', -4); g.stat('心情', -3); } },
      left: { t: '你自己接活的第二年，收入总算追上了原来的工资。时间是自己的了，焦虑也是。', fx: (g) => { g.stat('事业', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_robot', (g) => [g.recall('evRobot'), g.since('evRobot')], '机器人', 3, 38, {
      waited: { t: '机器人降价了一半。你又去了一趟家电城，那台你摸过手的型号已经停产了。', fx: (g) => g.stat('心情', -1) },
      bought: { t: (g) => (has(g, 'mo') ? '家里的机器人学会了做你妈拿手的那道菜。你拍了视频发给她，她说盐放多了。' : '家里的机器人照着你说的，做出了妈妈当年拿手的那道菜。第一次端上桌，你愣了一下。'), fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
    }),
    echo('e_echo_newyear', (g) => [g.recall('evNewYear'), g.since('evNewYear')], '过年', 1, 19, {
      stay: { t: (g) => (has(g, 'fa') && has(g, 'mo') ? '又到年关。妈妈在电话里说，今年你爸专门杀了一只鸡，留着等你。' : has(g, 'mo') ? '又到年关。妈妈在电话里说，今年她灌了一大串香肠，留着等你。' : has(g, 'fa') ? '又到年关。爸爸在电话里说，今年他专门杀了一只鸡，留着等你。' : '又到年关。你给老家的亲戚们挨个打了电话，大家都问你今年回不回。'),
        fx: (g) => g.stat('心情', -1) },
      home: { t: '又是腊月，你早早定了回家的票。这回坐上了座位，一路睡到了站。', fx: (g) => g.stat('心情', 2) },
      brought: { t: (g) => (parentsAlive(g) ? parentsWord(g) + '回去以后，逢人就说城里的烟火。那天的照片洗出来，挂在了老家的墙上。' : '你翻到那年接爸妈来过年的照片，烟火底下，两个人都笑得眯起了眼。'), fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_lecture', (g) => [g.recall('evLecture'), g.since('evLecture')], '保健品', 1, 61, {
      bought: { t: '那家保健品公司被查了，新闻里说是骗老人的。你那一抽屉的药，家里人帮你扔了。', fx: (g) => { g.stat('心情', -3); g.stat('人缘', 1); } },
      exposed: { t: '小区门口再也没人来发鸡蛋了。邻居们说，是你那一嗓子把他们吓跑的。', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_dance', (g) => [g.recall('evDance'), g.since('evDance')], '傍晚', 3, 58, {
      watched: { t: (g) => (g.age >= 85 ? '傍晚你还是去那片空地坐一坐。音乐响起来，你的手跟着在膝盖上打拍子。' : '傍晚跳舞的那群人，换了一拨又一拨。你还坐在那张长椅上，听得出每一首歌。'), fx: (g) => g.stat('心情', 1) },
      joined: { t: (g) => (g.age < 80 ? '你成了广场舞队的领舞。每天傍晚六点半，音乐一响，你就是全场最精神的那个。' : g.age < 85 ? '快的舞你跳不动了，就站在最后一排慢慢比划。队里的人都叫你老师。' : '你跳不动了，傍晚还是会去那片空地。她们跳完，总有人过来陪你说几句话，再扶你回家。'),
        fx: (g) => { g.stat('健康', g.age < 80 ? 3 : 1); g.stat('人缘', 2); } },
    }),
    echo('e_echo_tech', (g) => [g.recall('evTech'), g.since('evTech')], '视频', 1, 67, {
      drawer: { t: (g) => (gks(g).length ? '孙辈' : '孩子') + '打来视频，你的老手机接不起来。等你找到那副眼镜，电话已经挂了。', fx: (g) => g.stat('心情', -2) },
      learned: { t: (g) => '你戴上那副眼镜，' + (gks(g).length ? '孙辈' : '孩子') + '的脸就在眼前。你们每个星期视频两次，你学会了发表情。', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); } },
    }),

    // —— 钱的回响 ——
    echo('e_echo_tip', (g) => [g.recall('evTip'), g.since('evTip')], '那只股票', 2, 27, {
      in: { t: (g) => (g.recall('evTipUp') ? '表舅说的那只股票真涨了。你卖掉的时候，' + fmt(g.recall('evTipAmt')) + ' 变成了 ' + fmt(Number(g.recall('evTipAmt')) * 1.8) + '。表舅在饭桌上说了一晚上。' : '表舅说的大消息一直没来，股价跌了一大半。你割肉卖掉，' + fmt(g.recall('evTipAmt')) + ' 只拿回 ' + fmt(Number(g.recall('evTipAmt')) * 0.4) + '。过年再见到表舅，他没提这事。'),
        fx: (g) => { const up = g.rnd() < 0.3; g.remember('evTipUp', up); const a = Number(g.recall('evTipAmt')) || 0; CN.earn(g, a * (up ? 1.8 : 0.4)); g.stat('心情', up ? 3 : -3); } },
      little: { t: (g) => '那只股票跌了一大半。你那 ' + fmt(g.recall('evTipAmt')) + ' 只剩下零头，好在只是一小笔。你记住了：饭桌上的消息，听听就好。', fx: (g) => { CN.earn(g, (Number(g.recall('evTipAmt')) || 0) * 0.4); g.stat('学识', 1); } },
      no: { t: '表舅说的那只股票，后来跌了一大半。饭桌上，再没人提起这事。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_high', (g) => [g.recall('evHigh'), g.since('evHigh')], '那款理财', 1, 41, {
      in: { t: (g) => '那款理财的群一夜之间解散了。警察说，这个平台卷走了好几个亿。你那 ' + fmt(g.recall('evHighAmt')) + '，只追回来一成。', fx: (g) => { CN.earn(g, (Number(g.recall('evHighAmt')) || 0) * 0.1); g.stat('心情', -4); } },
      asked: { t: '小区里好几个老邻居买了那款理财，钱都没了。你在楼下陪他们坐了一下午，庆幸当时多问了一句。', fx: (g) => { g.stat('心情', 1); g.stat('人缘', 1); } },
      no: { t: '新闻里说，一个“年化百分之十五”的理财平台跑路了。你想起那个被你删掉的人，把新闻转到了家族群里。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_netloan', (g) => [g.recall('evNetLoan'), g.since('evNetLoan')], '网贷', 2, 20, {
      took: { t: (g) => '那笔网贷利滚利，两万滚成了 ' + fmt(26000) + '。催收电话打到了你朋友那里。你咬着牙还了一年多，删掉了那个软件。', fx: (g) => { g.stat('心情', -3); g.stat('人缘', -1); } },
      family: { t: (g) => '你把借家里的 ' + fmt(5000) + ' 还了回去，还多买了两箱水果。' + (parentsAlive(g) ? parentsWord(g) + '嘴上说你见外，水果当天就分给了邻居。' : ''), fx: (g) => { CN.pay(g, 5000); g.stat('心情', 2); } },
      no: { t: '那个月你天天自己煮面。月底发了工资，你给自己加了一个鸡腿，觉得比什么都香。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_windfall', (g) => [g.recall('evWindfall'), g.since('evWindfall')], '那两万块', 2, 24, {
      saved: { t: '那两万块一直没动。后来家里急用钱的那次，它刚好顶上。', fx: (g) => g.stat('心情', 2) },
      trip: { t: (g) => (CN.alone(g) ? '你翻到那次旅行的照片，海边的风把你的头发吹得乱七八糟。你把它设成了手机屏保。' : '你翻到那次旅行的照片，一家人挤在镜头前，每个人都笑得很傻。你把它设成了手机屏保。'), fx: (g) => g.stat('心情', 3) },
      parents: { t: (g) => (parentsAlive(g) ? parentsWord(g) + '用那笔钱换了一台新冰箱，冰箱门上贴着你小时候的照片。剩下的，说是给你存着。' : '你整理老家的柜子，翻出一个信封，里面是那两万块，一分没动。信封上写着你的名字。'), fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_car', (g) => [g.recall('evCar'), g.since('evCar')], '车', 2, 26, {
      new: { t: (g) => (parentsAlive(g) ? '这一年你开车带' + parentsWord(g) + '回了一趟老家，后备厢塞满了吃的。一路上，他们一直夸车开得稳。' : kids(g).length ? '周末你开车带孩子去郊外，后座上传来一路的歌声。' : '你开车去了一趟很远的海边，一路上放着年轻时爱听的歌。'), fx: (g) => { g.stat('心情', 3); g.stat('人缘', 1); } },
      used: { t: '那辆二手车小毛病不断，修车铺的老板都认识你了。可它一次也没把你扔在半路上。', fx: (g) => g.stat('心情', 2) },
      no: { t: '下暴雨的那天晚上，你在路边等了四十分钟才打到车。司机是个话多的大叔，一路给你讲他女儿考上大学的事。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_ins', (g) => [g.recall('evIns'), g.since('evIns')], '保单', 8, 36, {
      bought: { t: (g) => (g.recall('evInsHit') ? '你住院做了一个手术。保险公司赔了 ' + fmt(300000) + '，你在病床上翻出那位老同学的电话，说了声谢谢。' : '保单交了八年，一次也没用上。你说，这样最好。'),
        fx: (g) => { const hit = g.s('健康') < 60; g.remember('evInsHit', hit); if (hit) CN.earn(g, 300000); else CN.pay(g, (Number(g.recall('evInsAmt')) || 3000) * 2); } },
      cheap: { t: (g) => (g.s('健康') < 70 ? '那年住院，那份几百块的医疗险报了 ' + fmt(20000) + '。你说，这六百块花得值。' : '那份几百块的医疗险，你年年续着，一直没用上。'), fx: (g) => { if (g.s('健康') < 70) CN.earn(g, 20000); } },
      no: { t: (g) => (g.s('健康') < 60 ? '你住了一次院，花了 ' + fmt(80000) + '，全是自己掏的。出院那天，你想起了那次喝茶。' : '那个卖保险的老同学转了行，开了一家茶馆。你去过两次，他都没收你的钱。'), fx: (g) => { if (g.s('健康') < 60) CN.pay(g, 80000); g.stat('人缘', 1); } },
    }),
  ]);

  /* ---------- 新闻：2026–2120 ---------- */
  const NEWS = [
    [2026, '全国全年出生人口九百万左右。新生儿名字里，“沐”“汐”“宸”用得最多。'],
    [2026, '一些城市开始给新生儿家庭发育儿补贴，每月几百元。'],
    [2027, '夏天比往年热，南方多地气温破了纪录。空调卖断了货。'],
    [2027, '家用 AI 助手的价格降到了一台冰箱以下。'],
    [2028, '高铁又通了几条新线，从县城到省会，最快一个小时。'],
    [2028, '一些幼儿园因为招不满学生，改成了托育中心。'],
    [2029, 'AI 助手进了越来越多的家庭，会讲故事、辅导作业、提醒老人吃药。'],
    [2029, '新能源车的销量第一次超过了燃油车。'],
    [2030, '各地延迟退休的方案继续推进，退休年龄每隔几个月往后延一点。'],
    [2030, '超市里能刷脸结账了，收银台少了一半。'],
    [2031, '一种新的流感疫苗上市，打一针管两年。'],
    [2031, '短视频平台上，一个讲方言的农村老太太粉丝过了千万。'],
    [2032, '这一年的小学新生比十年前少了三成，不少乡村小学合并，孩子们去镇上寄宿。'],
    [2032, '大城市的外卖开始用无人机送，楼顶多了一个个小停机坪。'],
    [2033, '全国人口继续缓慢减少，六十岁以上的人占到了四分之一。'],
    [2033, '有的城市推出“二孩三孩买房优惠”，看房的人多了一些。'],
    [2034, '北方一场大雪，多地停课两天，孩子们在雪地里打了两天雪仗。'],
    [2035, '大城市有了无人驾驶出租车，起步价比有人开的便宜一块钱。'],
    [2035, '医院里，AI 帮医生看片子，排队看病的时间短了一些。'],
    [2036, '一部讲留守儿童的电影票房很高，很多人看哭了。'],
    [2037, '暑假，研学旅行团挤满了各地的博物馆。'],
    [2037, '一些县城开始给返乡创业的年轻人发补贴。'],
    [2038, '这一年的初中新生又少了，城里有的初中把空教室改成了实验室。'],
    [2039, '电动车换电站开到了乡镇，五分钟换一块电池。'],
    [2040, '家务机器人开始卖进普通人家，价格还很贵。'],
    [2040, '全国平均寿命过了八十岁。'],
    [2041, '中考的考生人数是三十年来最少的一年。普高和职校各招一半左右。'],
    [2041, '职业学校新开了“智能设备维修”“养老护理”专业，报名的人不少。'],
    [2042, '夏天的雨水特别多，长江中下游防汛的新闻上了好几天。'],
    [2043, '有家大厂宣布员工每周只上四天班，网上吵翻了。'],
    [2044, '高考报名人数比父辈那代少了三分之一，本科录取率创了新高。好大学还是那么难考。'],
    [2044, '高考作文题是《我和我的 AI 同桌》。'],
    [2045, '大学里，不少基础课由 AI 助教带，老师更多地在带讨论。'],
    [2046, '一些城市的房价连续几年没涨，租房的人比买房的人多了。'],
    [2047, '乡村的快递开始用无人车送到村口。'],
    [2048, '这一年毕业的大学生，很多去了五年前还不存在的岗位：AI 训练师、陪护机器人维修员、数字遗产整理师。'],
    [2048, '很多基础岗位被 AI 替代，职业培训班报名的人排起了长队。'],
    [2049, '各地的养老院床位不够，排队要等一两年。'],
    [2050, '远程办公成了常态，很多人搬回了老家的县城，在家里给大城市干活。'],
    [2050, '全国人口降到了十三亿出头。'],
    [2051, '一种癌症的新疗法进了医保，费用降了九成。'],
    [2052, '结婚的平均年龄过了三十二岁。'],
    [2053, '无人驾驶货车在高速上排成了车队，长途司机越来越少了。'],
    [2054, '一些城市的老小区加装电梯基本完成了。'],
    [2055, '夏天，北方的一条河断流了一个月，又在秋天重新流了起来。'],
    [2056, '家务机器人的价格降了一半，很多年轻夫妻把它列进了结婚的“三大件”。'],
    [2057, '大城市和小城市的房价越拉越开，省会以下的很多城市房子供大于求。'],
    [2058, '新一代的人工心脏瓣膜上市，手术不用开胸了。'],
    [2059, '一些高校因为生源不足合并了，校名换了，校园还在。'],
    [2060, '六十五岁以上的人占到了总人口的三分之一。家家都有老人要照顾。'],
    [2060, '社区里开了很多“日间照料中心”，白天帮忙照看老人，晚上送回家。'],
    [2061, '银发旅游团挤满了各地的景点，导游都是年轻人和机器人。'],
    [2062, '一种阿尔茨海默病的早期筛查进了体检套餐。'],
    [2063, '城市里的小学开设了“陪爷爷奶奶”的社会实践课。'],
    [2064, '电动飞行器在几座大城市试运行，从郊区到市中心只要十五分钟。'],
    [2065, '这一年，全国的养老护理员缺口还有几百万，机器人护工上了岗。'],
    [2066, '一部讲“独生一代”养老的纪录片引发了很多讨论。'],
    [2067, '各地的老年大学报名，手机上几秒钟就抢光了。'],
    [2068, '南方一场罕见的冬季寒潮，香蕉园冻坏了一大片。'],
    [2069, '人工肾脏开始在大医院临床使用。'],
    [2070, '机器人做家务、陪老人已经很常见，小区里能看见机器人推着轮椅散步。'],
    [2071, '全国平均寿命接近八十三岁。'],
    [2072, '很多乡村变成了养老村，空房子改成了康养院。'],
    [2073, '年轻人里流行起手写信，文具店的信纸卖断货。'],
    [2074, '一种新药能让骨折的老人恢复得更快，进了医保。'],
    [2075, '城市里的出租车已经几乎都是无人驾驶的了。'],
    [2076, '一些城市试行“时间银行”：年轻时照顾老人攒下时间，老了可以兑换照顾。'],
    [2077, '春节，全国的“空巢老人”视频团圆数创了纪录。'],
    [2078, '老旧小区改造成了适老社区，楼道里装满了扶手。'],
    [2079, '家用医疗机器人能做简单的检查，测完血压直接把数据发给医生。'],
    [2080, '这一年，养老护理机器人的数量超过了人类护工。'],
    [2081, '一位一百一十二岁的老人在家里过了生日，她是全国最长寿的人之一。'],
    [2082, '各地的公墓开始推广树葬、海葬，越来越多的人选择不立碑。'],
    [2083, '一种记忆辅助设备上市，能帮老人想起刚说过的话。'],
    [2084, '新一年的出生人口比上一年略有回升，新闻说是“年轻人的生育意愿回暖”。'],
    [2085, '数字遗产整理成了一门正经生意，很多老人开始给自己的照片、视频立遗嘱。'],
    [2086, '县城里的电影院换成了沉浸式剧场，观众大多是老人。'],
    [2087, '一座城市试行全自动的社区医院，夜里也有“医生”值班。'],
    [2088, '全国平均寿命过了八十四岁。'],
    [2089, '老年人再婚的登记数比十年前翻了一倍。'],
    [2090, '各地的“老年食堂”一顿饭只要几块钱，很多是机器人做的。'],
    [2091, '这一年的法定退休年龄是六十五岁左右。2026 年出生的这一代人，开始陆续退休。'],
    [2091, '养老金的账户全国通用，退休的人去哪个城市都能领。'],
    [2092, '很多 2026 年出生的人在社交平台上晒退休证，配文是“终于”。'],
    [2093, '一部讲 2030 年代童年的电视剧热播，演员们背着当年的书包。'],
    [2094, '新的抗衰老药物进入临床试验，报名的老人排起了队。'],
    [2095, '夏天的高温比二十世纪末平均高出一点几度，很多城市的公园里加了喷雾。'],
    [2096, '一项调查说，七十岁的人里，一半以上每天和机器人说的话比和人说的多。'],
    [2097, '养老院里开始流行“回忆课”：机器人帮老人把一生的照片做成相册。'],
    [2098, '平均寿命过了八十五岁。百岁老人比二十年前多了好几倍。'],
    [2099, '这一年的最后一天，很多老人守着电视跨年，说这是他们见到的第二个世纪交替。'],
    [2100, '二十二世纪的第一天。烟火在每座城市的上空同时亮起。'],
    [2101, '城市里的老人公园比儿童公园多了。'],
    [2103, '一种能延缓衰老的基因疗法获批，价格还很贵。'],
    [2105, '县城的医院也有了手术机器人，大病不用再往省城跑。'],
    [2108, '全国最后一批 2020 年代出生的人里，最年长的已经八十多岁了。'],
    [2110, '百岁老人的数量过了百万。'],
    [2113, '一个 2026 年出生的老人在网上分享了自己一百岁的生日，说他这一辈子见过太多的“第一次”。'],
    [2116, '养老机器人开始能陪老人下象棋，偶尔故意输一盘。'],
    [2027, '一些城市的地铁开通了夜班车，凌晨一点还有车。'],
    [2030, '这一年的春运，坐高铁回家的人第一次超过了坐飞机和大巴的总和。'],
    [2034, '乡村医生开始用远程诊疗设备，在村卫生室就能和县医院的医生视频看病。'],
    [2036, '全国的中小学都配了 AI 助教，有家长担心孩子不会自己想问题了。'],
    [2039, '一些大城市试行“小学放学后托管”，家长下班前孩子都有地方去。'],
    [2042, '职业学校的毕业生就业率，第一次和普通本科差不多了。'],
    [2046, '考研报名人数连续几年下降，考公的人还是很多。'],
    [2049, '各地的县城出现了“返乡青年创业园”，空置的厂房改成了工作室。'],
    [2052, '一款能把方言翻译成普通话的耳机卖得很好，买的大多是给老人用的。'],
    [2055, '新修的跨海大桥通车了，开车从岛上到大陆只要二十分钟。'],
    [2058, '很多城市的出生人口比十年前略有回升，产科又开始排队了。'],
    [2063, '一种新的降压药一周只要吃一片，进了医保。'],
    [2067, '机器人快递员能自己坐电梯上楼了。'],
    [2072, '县城的电影院里，看老电影的场次比新电影多。'],
    [2076, '全国第一批“机器人养老院”开业，护工和老人的比例是一比二十。'],
    [2079, '智能助听器的价格降到了几百块，很多老人终于听清了孙辈说话。'],
    [2084, '各地开始给八十岁以上的老人免费配家用医疗机器人。'],
    [2087, '一项调查说，2020 年代出生的这一代人，平均换过五份工作。'],
    [2096, '养老院里流行起了“代际午餐”：附近小学的孩子每周来陪老人吃一顿饭。'],
    [2104, '一位 2026 年出生的老人出版了回忆录，书名叫《我们这一代》。'],
    [2120, '这一年，出生在 2026 年的人，大多已经离开了。'],
    // 平淡的好消息
    [2031, '不少小区建起了“共享厨房”，加班的年轻人下楼就能做顿热饭。'],
    [2033, '一款护眼台灯在家长群里传开了，说孩子写作业不容易近视。'],
    [2038, '很多城市的公交站换成了带空调的小亭子，夏天等车不再晒。'],
    [2043, '春节档上映了一部动画电影，讲一只熊猫回老家过年，大人小孩都爱看。'],
    [2045, '各地的夜市又热闹起来，烤串和糖水摊排到了半夜。'],
    [2047, '一些城市流行起“社区小饭桌”，邻居们轮流做饭，一起吃。'],
    [2051, '高铁的票价打了一轮折，周末回家的年轻人多了。'],
    [2054, '几座城市把废弃的铁路改成了步道，周末全是散步的人。'],
    [2057, '常规体检里加了基因检测，价格降到了几百块。'],
    [2061, '各地的菜市场改造完了，干净明亮，摊主们都用上了电子秤。'],
    [2066, '一档讲普通人做家常菜的节目火了，主角是一位退休的厨师。'],
    [2069, '不少公园旁开了“银发食堂”，两荤一素十块钱。'],
    [2074, '城里的公交车全换成了低底盘，轮椅能直接推上去。'],
    [2083, '“老友合租”在各地流行起来，几个老朋友合住一套房，互相照应。'],
    [2093, '一项调查说，七十岁上下的人里，每天出门散步的比十年前多了一半。'],
    [2102, '很多人家给用了二十年的老机器人办了“退休仪式”，换下来的旧机器人送进了博物馆。'],
    [2107, '一种新药能让老人重新尝出味道，很多人又吃上了年轻时爱吃的菜。'],
  ].map(([y, t]) => ({ y, t }));
  // 和你的生活有关的新闻
  NEWS.push(
    { y: 2032, t: '你老家那一片的几所村小合并成了一所，校车每天早上六点半出发。', cond: (g) => g.recall('hukou') === 'rural' },
    { y: 2044, t: '你所在的省公布了高考分数线。家长群里炸开了锅。', cond: (g) => g.recall('edu') === 'senior' },
    { y: 2060, t: (g) => g.recall('city') + '的新闻说，全市的老人已经比孩子多了。', cond: (g) => !!g.recall('city') },
    { y: 2070, t: (g) => g.recall('prov') + '的乡村养老院开始配机器人护工。', cond: (g) => g.recall('hukou') !== 'city' },
    { y: 2052, t: (g) => g.recall('workCity') + '的地铁又开了两条新线，你上班的路短了一截。', cond: (g) => !!g.recall('workCity') && tier(g) <= 2 && working(g) },
    { y: 2058, t: (g) => g.recall('prov') + '的老家县城通了高铁，回家的路从六个小时变成了两个小时。', cond: (g) => g.recall('hukou') !== 'city' && !!g.recall('prov') },
  );
  JY.addEvents(NEWS);

  /* ---------- 闲笔 ---------- */
  // 熬过婴儿期的头几年（重心“懵懂”，0–5 岁）
  JY.addFlavor('focus:懵懂', [
    { t: '第一次笑出声的那天，家里人围着你逗了一晚上。', maxAge: 0 },
    { t: '你睡着的时候总攥着小拳头，大人掰都掰不开。', maxAge: 0 },
    { t: '夜里你醒了三回，家里人轮流起来抱你。', maxAge: 1 },
    { t: '这一年你长了第一颗牙，见什么都想咬一口。', maxAge: 1 },
    { t: '打预防针的时候你哭得很凶，出了门拿到一个气球就笑了。', maxAge: 3 },
    { t: '洗澡的时候你拍水拍得最欢，溅了大人一身。', maxAge: 2 },
    { t: '天气好的时候，你被抱到楼下晒太阳，见了谁都盯着看。', maxAge: 1 },
    { t: '你会爬了，满屋子找地方钻，最喜欢钻到桌子底下。', minAge: 1, maxAge: 1 },
    { t: '你在小区的滑梯上滑了一下午，不肯回家。', minAge: 2, maxAge: 5 },
    { t: '你把碗里的胡萝卜一块块挑出来，摆在桌上排成一排。', minAge: 2, maxAge: 5 },
    { t: '你缠着大人讲故事，讲到第三遍才睡着。', minAge: 2, maxAge: 5 },
    { t: '你对着镜子做鬼脸，把自己逗得咯咯笑。', minAge: 1, maxAge: 4 },
  ]);
  JY.addFlavor('age:child', [
    { t: '你学会了走路，第一步就扑进了大人怀里。', minAge: 1, maxAge: 1 },
    { t: '你第一次叫“爸爸”，爸爸录了视频，发到了家族群里。', minAge: 1, maxAge: 2, cond: (g) => has(g, 'fa') },
    { t: '你把积木搭得比自己还高，然后一巴掌推倒了它。', minAge: 2 },
    '你发了一场高烧，半夜被抱去医院，打了一针，哭得整个走廊都听得见。',
    { t: '你喜欢趴在窗边看楼下的车，能叫出好几种车的名字。', minAge: 3 },
    { t: '你第一次看见下雨，伸手去接，说天在哭。', minAge: 2 },
    { t: '家里的 AI 音箱给你讲了一百遍同一个故事，你还要听。', minAge: 2 },
    { t: '你把手机里的照片删了一半。没人知道是你干的。', minAge: 3 },
    { t: '你学会了数数，数到十就不数了。', minAge: 3 },
    { t: '你在幼儿园交了第一个好朋友，第二天就吵翻了，第三天又和好了。', minAge: 3 },
    { t: '你害怕打雷，每次都钻进被子里。', minAge: 2 },
    { t: '你把蜡笔画在了墙上，画的是一家人手拉着手。', minAge: 2 },
    { t: '你掉了第一颗牙，放在枕头底下，等了一晚上。', minAge: 5 },
    { t: '你开始问“为什么”。大人答不上来的时候，会说“问 AI 去”。', minAge: 3 },
    { t: '你第一次自己吃完一整碗饭，大人们都鼓掌了。', minAge: 2 },
    { t: '你在超市里赖在地上不走，因为想要一个会说话的玩具。', minAge: 2 },
    { t: '你会背第一首古诗了，“床前明月光”，背到第三句就卡住。', minAge: 3 },
    { t: '你最喜欢的动画片讲的是一只会开飞船的熊猫。', minAge: 2 },
    { t: '你偷偷吃了一整包糖，那天晚上牙疼得直哭。', minAge: 3 },
    { t: '幼儿园的老师说你画画很有想法，你回家就把这句话说了五遍。', minAge: 3 },
    { t: '你第一次坐火车，一路趴在窗户上，没睡着。', minAge: 2 },
    { t: '你把家里的拖鞋都排成了一列，说那是火车。', minAge: 2 },
    { t: '你会自己穿鞋了，就是左右总穿反。', minAge: 3 },
    { t: '你第一次看见大海，被一个浪拍倒，坐在沙滩上愣了半天。', minAge: 3 },
    { t: '你学会了骑带辅助轮的自行车，在小区里转了一下午。', minAge: 3 },
    { t: '你跟大人说，你的梦想是当一个会飞的人。', minAge: 4 },
    { t: (g) => CN.who(g, olderSib(g), true) + '放学回来，把作业本上的小红花撕下来贴在了你额头上。', minAge: 2, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 7 },
    { t: (g) => CN.who(g, 'gm', true) + '给你缝了一个布老虎，你抱着它睡了好几年。', minAge: 1, cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:young', [
    '你和同桌在课桌中间画了一条线，谁过线谁就是小狗。',
    '你第一次考了一百分，把卷子贴在了冰箱上。',
    { t: '你学会了游泳，在泳池里泡到嘴唇发紫。', minAge: 7 },
    { t: '你偷偷把作业本上的分数改了一笔，后来一直记着。', minAge: 8 },
    { t: '你喜欢上了一本小说，熬夜在被子里打着手电看完。', minAge: 9 },
    { t: '你第一次一个人坐公交车，紧张得提前三站就站了起来。', minAge: 8 },
    '班上转来一个新同学，说话带着你听不懂的口音。你们成了好朋友。',
    { t: '你开始在乎穿什么，早上要在镜子前站很久。', minAge: 11 },
    '运动会上你跑了个第三，奖品是一个笔记本。',
    '你在课本的空白处画满了小人。',
    { t: '你第一次有了自己的手机，设置了密码，谁都不告诉。', minAge: 10 },
    { t: '你个子长得太快，夜里腿疼，大人说那是在长个子。', minAge: 10 },
    { t: '你和家里人吵了一架，摔上了房门。半夜饿了，出来发现桌上留着饭。', minAge: 11, cond: (g) => !CN.alone(g) },
    { t: '你开始写日记，写了三天就断了，过了几年又捡起来。', minAge: 9 },
    { t: '你第一次在 KTV 唱歌，唱破了音，大家笑了好久。', minAge: 10 },
    { t: '你偷偷喜欢班上的一个人，每天故意晚一点出教室，好同路走一段。', minAge: 12 },
    { t: '暑假你在乡下住了一个月，学会了抓知了。', cond: (g) => g.recall('hukou') !== 'rural' },
    '你迷上了一个科幻故事，发誓以后要去太空。',
    { t: '你的近视又加深了，换了一副更厚的眼镜。', minAge: 8 },
    { t: '你第一次觉得大人说的话也不全对。', minAge: 10 },
    { t: '期末考试前，全班都在熬夜。你在台灯下数窗外的星星。', minAge: 12 },
    { t: '你和好朋友约好考同一所高中。', minAge: 13 },
    '你在食堂吃到了一只完整的鸡腿，高兴了一下午。',
    { t: '你在 AI 助手里问了一个不敢问大人的问题。', minAge: 10 },
    { t: '你攒了一个学期的零花钱，买了一双球鞋，舍不得穿。', minAge: 10 },
    { t: '班主任说你“聪明，就是不用功”。这句话，后来很多人都对你说过。', minAge: 8 },
    { t: '放学路上，你和同学分着吃了一根冰棍，一人一口。', minAge: 6 },
    { t: '你帮同桌讲明白了一道题，他请你喝了一瓶汽水。', minAge: 8 },
    { t: '下了一场大雪，学校停了半天课。操场上全是打雪仗的人。', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: (g) => CN.who(g, olderSib(g), true) + '偷偷塞给你一个红包，说别告诉爸妈，拿去买本喜欢的书。', minAge: 8, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 18 },
    { t: (g) => CN.who(g, 'gp', true) + '教你下象棋，每回都让你一个车，还是赢了你。', minAge: 7, cond: (g) => has(g, 'gp') },
    { t: (g) => '每天出门前，' + CN.who(g, 'gm') + '都往你书包里塞一个煮鸡蛋。', cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:adult', [
    { t: '高中的晚自习上到九点半。回家的路上，你买了一个烤红薯，捧着暖手。', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: '你在课桌角上贴了一张倒计时，数字一天天变小。', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: '这一年没什么大事。你学会了做一道红烧肉。', minAge: 18 },
    { t: '你在地铁上睡着了，坐过了三站。', minAge: 16, cond: (g) => tier(g) <= 3 },
    { t: '你换了一部新手机，把旧手机里的照片一张张导了过去。', minAge: 18 },
    { t: '你在深夜的便利店吃了一碗关东煮，觉得日子还过得去。', minAge: 18 },
    { t: '你开始在乎体检报告上的数字了。', minAge: 30 },
    { t: '你发现自己也会说“现在的年轻人啊”。', minAge: 32 },
    { t: '你在楼下的面馆吃了五年，老板终于记住了你不要香菜。', minAge: 22 },
    { t: '你加了一个跑步群，跑了三次就没去了。', minAge: 20 },
    { t: '你过生日，收到的祝福里，有一半是平台自动发的。', minAge: 18 },
    { t: '你在阳台上种了一盆薄荷，它活得比你想象的久。', minAge: 18 },
    { t: '你给爸妈买了一台按摩椅，他们说浪费钱，每天都坐。', minAge: 24, cond: (g) => has(g, 'fa') && has(g, 'mo') && money(g) },
    { t: '你删掉了一个很久不联系的人的联系方式，又后悔了。', minAge: 18 },
    { t: '你的头发开始掉了，洗头的时候不太敢看下水口。', minAge: 30 },
    { t: '一个老朋友结婚了，你在婚礼上喝多了，唱了一首老歌。', minAge: 22 },
    { t: '你第一次一个人去旅行，在一座陌生的城市迷了路，却很开心。', minAge: 18, maxAge: 35 },
    { t: (g) => '这一年房贷又还掉一截，还欠 ' + fmt((Number(g.recall('debt')) || 0) * 1e4) + '。', cond: (g) => g.recall('house') === 'mortgage' && (Number(g.recall('debt')) || 0) > 0 },
    { t: '你在加班的路上看到了一场很美的晚霞，忘了拍下来。', minAge: 20, maxAge: 64, cond: working },
    { t: '你给自己列了一张记账的表，坚持了大半年。', minAge: 20, cond: money },
    { t: '你学会了在会议上不说话。', minAge: 24, maxAge: 64, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher'].includes(job(g)) },
    { t: '你翻到小时候的照片，认不出照片里的自己。', minAge: 18 },
    { t: '你在超市里比较了半天两种酱油，最后买了贵的那种。', minAge: 20 },
    { t: '你戒了一阵子烟，又抽上了。', minAge: 22, sex: '男' },
    { t: '你开始失眠，夜里三点盯着天花板想事情。', minAge: 28 },
    { t: '有个小孩在电梯里叫你“叔叔”，你愣了一下才答应。', minAge: 26, sex: '男' },
    { t: '有个小孩在电梯里叫你“阿姨”，你愣了一下才答应。', minAge: 26, sex: '女' },
    { t: '你和一个多年的朋友吃了顿饭，发现彼此都变了，又好像都没变。', minAge: 25 },
    { t: '你花了一个周末收拾房间，扔掉了三大袋东西。', minAge: 18 },
    { t: '发工资那天，你给自己点了一份好一点的午饭。', minAge: 18, maxAge: 64, cond: working },
    { t: '你找到了一条上班的近道，每天能多睡十分钟。', minAge: 20, maxAge: 64, cond: working },
    { t: '你学会了做一道家常菜，第一次就做得很成功。', minAge: 18 },
    { t: '你在旧书摊上淘到一本小时候读过的书，五块钱。', minAge: 18 },
    { t: '你收到一个包裹，是很久不联系的朋友寄来的家乡特产。', minAge: 22 },
    { t: '你养的那盆花，今年第一次开了。', minAge: 20 },
    { t: '存款又多了一点。你看着那个数字，心里踏实了一些。', minAge: 22, cond: (g) => money(g) && cash(g) >= 50000 },
    { t: '一个人住久了，你学会了做一人份的饭，不多不少。', minAge: 20, cond: (g) => CN.alone(g) },
    { t: '周末你一个人去看了场电影，散场的时候，外面刚好下起了小雨。', minAge: 18, cond: (g) => CN.alone(g) },
    { t: (g) => '晚饭后，你和' + spRel(g) + '下楼散步，绕着小区走了三圈。', minAge: 22, cond: spOk },
    { t: (g) => '你忙了一整天回到家，' + spRel(g) + '给你留了一碗汤，还热着。', minAge: 22, cond: (g) => spOk(g) && CN.livesWith(g, 'sp') },
    { t: (g) => CN.who(g, 'k1', true) + '在幼儿园画了一张全家福。画上的你，比房子还高。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 6 },
    { t: (g) => CN.who(g, 'k1', true) + '第一次自己系好了鞋带，跑过来让你看。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 4 && g.ageOf('k1') <= 7 },
    { t: (g) => CN.who(g, 'k1', true) + '的个子蹿得飞快，量身高的那道线，又往上画了一截。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 9 && g.ageOf('k1') <= 16 },
    { t: (g) => CN.who(g, 'mo') + '打来电话，没什么事，就是问你吃了没有。', minAge: 18, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: (g) => CN.who(g, 'fa', true) + '学会了用手机发语音，每天早上给你发一条天气预报。', minAge: 20, cond: (g) => has(g, 'fa') && !CN.livesWith(g, 'fa') },
    { t: '早上起床，厨房里已经有了热粥。妈妈说，趁热喝。', minAge: 18, cond: (g) => CN.livesWith(g, 'mo') },
  ]);
  JY.addFlavor('age:old', [
    { t: '你早上五点就醒了，再也睡不着。', minAge: 60 },
    { t: '你在公园里看人下棋，看了一下午，忍不住插了一句嘴。', minAge: 60 },
    { t: '你的老花镜放在哪儿，总是要找半天。', minAge: 50 },
    { t: '你学会了用语音发消息，一条能说三分钟。', minAge: 58 },
    { t: (g) => '你把' + CN.who(g, gks(g)[0]) + '的照片设成了手机屏保，逢人就给人看。', cond: (g) => gks(g).length > 0 },
    { t: '你去菜市场，跟摊主讲了十分钟的价，最后便宜了五毛。', minAge: 55 },
    { t: '你翻出了年轻时的衣服，已经穿不上了，还是没舍得扔。', minAge: 50 },
    { t: '老同学又少了一个。你在群里发了一支蜡烛。', minAge: 65 },
    { t: '你开始每天量血压，把数字记在一个小本子上。', minAge: 55 },
    { t: '你在小区里认识了一个新朋友，你们每天一起遛弯。', minAge: 60 },
    '你看了一部老电影，是你年轻时看过的，哭了。',
    { t: '你给自己织了一条围巾，织歪了，还是天天戴。', minAge: 55 },
    { t: '你学会了和家里的机器人聊天。它记性比你好。', minAge: 60 },
    { t: '下雨天，你的腿就开始疼。', minAge: 60 },
    { t: (g) => '你给' + CN.who(g, gks(g)[0]) + '讲你小时候的事，孩子以为你在讲故事。', cond: (g) => gks(g).length > 0 && g.ageOf(gks(g)[0]) >= 4 },
    { t: '你把存折和遗嘱放在了同一个抽屉里。', minAge: 70 },
    { t: '你开始忘事，刚说的话，转头就忘了。', minAge: 75 },
    { t: '你在阳台上晒太阳，晒着晒着就睡着了。', minAge: 65 },
    { t: '你学会了用手机看病，医生在屏幕那头说你保养得不错。', minAge: 60 },
    { t: (g) => '你和' + (g.knows('sp') === '丈夫' ? '老伴' : '老伴') + '拌了一句嘴，半个钟头后又一起出门买菜。', minAge: 55, cond: spOk },
    { t: (g) => '老伴给你剥了一个橘子，一瓣一瓣递过来。', minAge: 62, cond: spOk },
    { t: '你去参加了一个老同学的葬礼，回来路上一句话也没说。', minAge: 65 },
    { t: '你吃饭越来越少，菜越来越淡。', minAge: 75 },
    { t: '你把一辈子的照片整理成了一本相册，扉页写上了自己的名字。', minAge: 65 },
    '春天的时候，你在楼下看了一下午的花。',
    { t: '你说话越来越慢，可是讲起年轻时的事，一个细节都不落。', minAge: 75 },
    { t: '有人问你多大岁数了，你想了一下才说出来。', minAge: 80 },
    { t: (g) => (gks(g).length ? '孙辈' : '孩子') + '打来视频，非要给你看他新长的牙。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 7) },
    { t: (g) => '你给' + CN.who(g, kids(g)[0], true) + '打了个视频，看见那边的灯亮着，就放心了。', minAge: 55, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) && g.ageOf(kids(g)[0]) >= 20 },
    { t: '楼下的早点铺老板知道你的口味，豆浆少糖，油条要焦一点。', minAge: 55 },
    { t: '你在老年大学报了一门书法课，同桌是个八十岁的老太太，字写得比你好。', minAge: 62, maxAge: 85 },
    { t: '天气好的时候，几个老邻居搬着小板凳坐在楼下，一聊就是一上午。', minAge: 62 },
    { t: '一个人吃饭，你也照样摆好碗筷，炒一个菜，熬一碗汤。', minAge: 60, cond: (g) => CN.alone(g) },
    { t: (g) => CN.who(g, kids(g)[0]) + '寄来一箱水果，说是那边的特产。你分了一半给邻居。', minAge: 60, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) },
  ]);

  /* 地点 */
  JY.addFlavor('loc:village_n', [
    '玉米收完了，院子里堆成了一座金黄的小山。',
    '村口的大喇叭在播通知，说明天停电。',
    { t: '冬天，炕烧得滚烫，一家人挤在上面看电视。', cond: (g) => !CN.alone(g) },
    '麦子黄了，联合收割机一天就能收完一个村。',
    '红砖房的墙上，还留着几十年前刷的标语，字已经看不清了。',
    '村里的年轻人走了大半，过年才回来，开着各种牌子的车。',
    { t: '院子里的枣树结了果，你爬上去摘，被奶奶骂了下来。', minAge: 6, maxAge: 13, cond: (g) => has(g, 'gm') },
    '傍晚的风里有烧秸秆的味道。',
    '村里的广场上，晚上有人跳广场舞，音乐响到九点。',
    '谁家娶媳妇，流水席从中午摆到天黑，半个村子都来帮忙。',
    { t: '你在村口的小卖部买了一根冰棍，老板娘多送了你一颗糖。', minAge: 4, maxAge: 14 },
  ]);
  JY.addFlavor('loc:village_s', [
    '山上的茶叶该采了，天不亮就有人上山。',
    '梅雨季，墙角长出了青苔，衣服一个星期晒不干。',
    '村里的祠堂翻修了，外出的人都捐了钱。',
    '稻田里的青蛙叫了一整夜。',
    '竹林后面的小路，下雨天滑得站不住。',
    '老屋空了好几年，门上的春联褪成了白色。',
    '赶集的日子，镇上挤满了人，卖什么的都有。',
    '端午节，河里在划龙舟，鼓声隔着几座山都听得见。',
    '山上的雾一直到中午才散。',
    { t: '你跟着大人去溪边洗菜，脚泡在水里，凉得直缩。', minAge: 4, maxAge: 14 },
    '谁家杀了年猪，请了半个村子的人来吃饭。',
  ]);
  JY.addFlavor('loc:village_w', [
    '风沙大的时候，天是黄的，出门要蒙住脸。',
    '羊群从山坡上下来，扬起一路的土。',
    '夜里的星星很多，多得有点吓人。',
    '村里的土坯房一年比一年少，新盖的砖房刷着白墙。',
    '中午太阳毒，下午一过就冷，一天能穿过四季。',
    '远处的雪山，一年到头都是白的。',
    '村里的光伏板铺了一大片，在太阳底下闪着光。',
    { t: '喝的水是从很远的地方引过来的。水龙头里流出来的时候，奶奶还会念一句好。', cond: (g) => has(g, 'gm') },
    '秋天，家家房顶上晒着金黄的玉米和红辣椒。',
  ]);
  JY.addFlavor('loc:county', [
    { t: '县城的主街上又开了一家奶茶店，门口排着队。', minAge: 3 },
    { t: '县城不大，走在街上，十个人里有三个认识你。', minAge: 10 },
    '县一中门口的文具店，开了三十年了。',
    '晚上的广场上，跳舞的、摆摊的、遛娃的挤在一起。',
    '县城新修了一个公园，有湖，有步道，周末人很多。',
    { t: '小区楼下的早餐店，豆浆还是一块五一碗。', minAge: 3 },
    '县城的房子不贵，可年轻人越来越少。',
    '过年的时候，县城的路堵得像省城。',
    '县医院新盖了一栋住院楼，比老楼高了一倍。',
    { t: '县城的夜晚，九点以后街上就没什么人了，只有烧烤摊还亮着。', minAge: 3 },
    '亲戚们都住得近，谁家炖了肉，半条街都知道。',
  ]);
  JY.addFlavor('loc:city', [
    '城里的公交车换成了电动的，开起来没有声音。',
    '老城区的巷子拆了一半，剩下的一半成了网红打卡地。',
    '周末的商场里，人比货多。',
    '下班高峰，过一个路口要等三个红绿灯。',
    '小区门口新开了一家社区食堂，饭菜很便宜。',
    '江边的步道修好了，晚上有很多人散步。',
    '城里的房价这几年没怎么动，大家都在等。',
    '夏天的夜市一直开到凌晨。',
    { t: '你在这座城市住久了，开始能分辨出不同街区的味道。', minAge: 12 },
    '小区里的桂花开了，整栋楼都是香的。',
  ]);
  JY.addFlavor('loc:metro', [
    { t: '早高峰的地铁里，你的脸贴在别人的背包上。', minAge: 6, maxAge: 70 },
    '写字楼的灯，到半夜还亮着一大半。',
    { t: '你在这座城市住了很久，还是叫不出隔壁邻居的名字。', minAge: 12 },
    '周末的公园里，到处是遛狗的人和带孩子的人。',
    '外卖骑手在楼下排成一排，等着电梯。',
    { t: '你在天桥上看了一会儿车流，像一条发光的河。', minAge: 6 },
    { t: '房租又涨了。你算了算，一个月的工资，三分之一交给了房东。', minAge: 22, maxAge: 60, cond: (g) => g.recall('house') === 'rent' && working(g) },
    { t: '凌晨两点的街上，还有人在跑步。', maxAge: 84 },
    '无人驾驶的出租车在路边等客，车里没有人。',
    '这座城市的冬天不下雪，可是风很冷。',
    '周末的美术馆排起了长队，排队的人里有不少是带着孩子的。',
    { t: '你在街角发现了一家开了二十年的小面馆，从此有了自己的“食堂”。', minAge: 18 },
  ]);
  JY.addFlavor('loc:school', [
    '课间十分钟，走廊里全是跑来跑去的人。',
    '升旗仪式上，你在队伍里打了个哈欠，被班主任看见了。',
    '教室后面的黑板报，这期的主题是“我的家乡”。',
    '晚自习停电了，全班一起欢呼。',
    '你在课桌的抽屉里发现了一张没署名的纸条。',
    '体育课被数学老师借走了。',
    '学校食堂的番茄炒蛋，是全校公认最好吃的菜。',
    '期末考试前一天，教室里安静得只能听见翻书声。',
    '春游那天，你的书包里装满了零食，一本书也没带。',
  ]);
  JY.addFlavor('loc:campus', [
    '图书馆占座的人，早上七点就排起了长队。',
    '宿舍楼十一点熄灯，你们在黑暗里聊到两点。',
    '食堂三楼的麻辣烫，你吃了四年。',
    '你选了一门水课，结果被它吸引，每节都去听。',
    '社团招新的时候，操场上摆满了摊位。',
    '期末周，图书馆的每一张桌子都有人趴着睡觉。',
    '学校的猫比学生还多，每一只都有名字。',
    '毕业前的那个夏天，到处都有人在拍照。',
    '下雨天，室友多带了一把伞，在教学楼门口等你。',
  ]);
  JY.addFlavor('loc:factory', [
    { t: '流水线一刻不停，你闭着眼睛都能做完手上的活。', maxAge: 70 },
    '车间里的机器越来越多，人越来越少。',
    { t: '下夜班的时候，天刚刚亮，厂门口的包子铺正在开张。', maxAge: 70 },
    { t: '宿舍里八个人，来自五个省，说话各有各的口音。', maxAge: 50 },
    '发工资那天，厂门口的小饭馆生意特别好。',
    '工友们在午休的时候刷短视频，笑声此起彼伏。',
    { t: '你的手上起了一层茧，洗不掉了。', maxAge: 70 },
    '车间主任说，下个月要换新设备，有一半的人要去学新东西。',
    { t: '工友过生日，大家凑钱买了个蛋糕，在车间门口分着吃了。', maxAge: 70 },
  ]);
  JY.addFlavor('loc:office', [
    { t: '工位上的绿萝死了第三盆。', maxAge: 70 },
    '茶水间里，大家都在说谁要离职了。',
    { t: '你在会议室里开了三个小时的会，什么也没决定。', maxAge: 70 },
    '下午三点，整层楼都在点奶茶。',
    { t: '你给 AI 助手布置了一个任务，它做得比你预想的好，你有点不是滋味。', maxAge: 70 },
    { t: '电梯里碰见老板，你们聊了二十秒的天气。', maxAge: 70 },
    { t: '年终总结写了三天，最后一句是“继续努力”。', maxAge: 70 },
    { t: '你的工牌上的照片，还是刚入职时拍的。', maxAge: 70 },
    { t: '同事从老家带回来一箱特产，挨个工位分了一圈。', maxAge: 70 },
  ]);
  JY.addFlavor('loc:hospital', [
    '医院走廊的长椅上，坐满了等着叫号的人。',
    '病房的窗外有一棵树，叶子一片片地黄了。',
    '护士换了一批年轻的，说话都很温柔。',
    '医院门口的花店，生意总是很好。',
    '消毒水的味道，在衣服上留了好几天。',
    '同病房的老人每天都有人来看，你看着他们说话。',
    '夜里的病房很安静，只有仪器偶尔滴一声。',
    '机器人推着药车在走廊里穿过，说了一声“请让一让”。',
    '隔壁床的人出院那天，把一兜没吃完的橘子留给了你。',
  ]);
  JY.addFlavor('loc:home', [
    '小区楼下的快递柜又满了。',
    '楼下的电动车充电桩前，每天晚上都排着队。',
    '邻居家的孩子在练钢琴，同一首曲子弹了一个月。',
    '小区的业主群里，为了停车位的事吵了一整晚。',
    { t: '你在阳台上晾衣服，看见对面楼的人也在晾衣服。', minAge: 10 },
    '楼下的老人每天下午都坐在长椅上，等孙子放学。',
    { t: '快递员认识你，不用看单子就知道你住几楼。', minAge: 18 },
    '傍晚的时候，厨房里飘出各家做饭的味道。',
    { t: '邻居家包了饺子，端来一盘，说趁热吃。', minAge: 3 },
  ]);
  JY.addFlavor('loc:coast', [
    '海风很咸，衣服晒干了也带着一股潮味。',
    '退潮的时候，滩涂上全是赶海的人。',
    '渔船回港了，码头上一片吆喝声。',
    '傍晚的海边，有人在放风筝。',
    '台风过后，海边的沙滩上冲上来很多贝壳。',
    { t: '你在海边买了一份炒花甲，坐在礁石上吃完了。', minAge: 6 },
    '海上的灯塔，每隔几秒闪一次。',
    '夏天的海水浴场，人挤人。',
  ]);
  JY.addFlavor('loc:road', [
    '高速服务区里，到处是赶路的人。',
    '车窗外的风景一片片往后退，你在车上睡着了。',
    '收费站排着长队，过年的车流一眼望不到头。',
    { t: '你在服务区吃了一碗很贵的泡面，觉得格外好吃。', minAge: 6 },
    '路边的山越来越高，信号越来越弱。',
    '车里放着一首老歌，你跟着哼了一路。',
    '天黑了，前面的车灯连成了一条线。',
    { t: '你在一个不知名的小镇停下来，买了一袋当地的特产。', minAge: 16 },
  ]);

  /* 年度重心 */
  JY.addFlavor('focus:用功读书', [
    '你的错题本写满了一本，又开了一本。',
    '你在台灯下写作业，写到眼睛发酸。',
    { t: '你背单词背到半夜，梦里都在拼写。', minAge: 10 },
    { t: (g) => '你考进了年级前五十，' + (has(g, 'mo') ? '妈妈' : '家里人') + '高兴得多做了两个菜。', minAge: 10 },
    '你把一道难题想了三天，想通的那一刻，激动得拍了桌子。',
    '你的笔记被同学借去复印了一份又一份。',
  ]);
  JY.addFlavor('focus:贪玩', [
    '你和朋友在河边玩了一下午，鞋子湿透了。',
    { t: '你攒钱买了一个新游戏，玩了一整个周末。', minAge: 9 },
    '你在小区里认识了一群新朋友，每天放学都约着一起玩。',
    { t: '你偷偷溜出去看了一场电影，回家撒了个谎。', minAge: 11 },
    { t: '你学会了打篮球，晒得黑了一圈。', minAge: 8 },
    '你作业没写完，被罚站了一节课。',
  ]);
  JY.addFlavor('focus:帮家里干活', [
    { t: '你帮家里看店，学会了算账，也学会了跟人讨价还价。', cond: (g) => g.recall('family') === 'smallbiz' },
    { t: '你放学回家先喂鸡，再写作业。', cond: (g) => g.recall('hukou') === 'rural' },
    { t: (g) => '你帮' + (has(g, 'mo') && CN.livesWith(g, 'mo') ? '妈妈' : '家里') + '做饭，第一次炒的菜咸得没法吃，大人全吃了。' },
    { t: '农忙的时候，你在地里干了一天，晚上手都抬不起来。', cond: (g) => g.recall('hukou') !== 'city' },
    '你会洗全家人的衣服了。',
    { t: (g) => '你照顾生病的' + CN.who(g, 'gm') + '，喂她吃药，比大人还细心。', cond: (g) => has(g, 'gm') },
    '你把家里的地拖得锃亮，大人回来夸了一句，你高兴了一晚上。',
  ]);
  JY.addFlavor('focus:学个特长', [
    '你练琴练到手指起茧。',
    '你的画被贴在了学校的走廊上。',
    '你学了一年的书法，字终于不再歪了。',
    { t: '你参加了一个编程比赛，拿了个三等奖。', minAge: 9 },
    '你学游泳，从怕水学到能游一千米。',
    '你跳舞跳得脚踝扭了，休息了两个星期又去了。',
  ]);
  JY.addFlavor('focus:埋头工作', [
    { t: '你连续加了一个月的班，周末只想睡觉。', maxAge: 65 },
    { t: '你的项目做成了，团队一起吃了顿火锅。', maxAge: 70 },
    { t: '你在年终评选里拿了个优秀，奖金不多，心里很满。', maxAge: 70 },
    { t: '你开始失眠，脑子里全是没做完的事。', minAge: 22, maxAge: 70 },
    { t: '你带了一个新人，他问的问题，让你想起了刚入行时的自己。', minAge: 25, maxAge: 70 },
    { t: '你升职了，换了一张大一点的桌子。', minAge: 24, maxAge: 60, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher', 'doctor', 'nurse'].includes(job(g)) },
    { t: '你把手上的活干得又快又好，老师傅点了点头，没说话。', maxAge: 60, cond: (g) => ['worker', 'farmer', 'rider', 'driver', 'shop'].includes(job(g)) },
    { t: '这一年你一天假也没请。年底算账，多攒下了一点。', minAge: 18, maxAge: 70 },
  ]);
  JY.addFlavor('focus:学习充电', [
    { t: '你报了一个夜校的课，每周两个晚上。', maxAge: 70 },
    { t: '你考下了一个证书，挂在了墙上。', maxAge: 70 },
    '你开始学一门外语，每天早上背二十个单词。',
    '你看完了一本很厚的书，在最后一页写下了日期。',
    { t: '你跟着 AI 学了一门新技术，第一次用到工作里，效果很好。', maxAge: 70, cond: working },
    { t: '你在老年大学学会了用电脑剪视频，给自己的生日做了一段。', minAge: 60 },
  ]);
  JY.addFlavor('focus:搞副业', [
    { t: '你下班后接了个小活，熬到半夜交了稿。', maxAge: 70 },
    { t: '你的副业赚了一笔小钱，你给自己买了一个心心念念的东西。', maxAge: 75 },
    { t: '副业亏了一点钱，你安慰自己就当交学费。', maxAge: 75 },
    { t: '你在周末帮人拍婚礼视频，累得腰都直不起来。', maxAge: 60 },
    { t: '你开了个网店，第一单是你妈下的。', maxAge: 70, cond: (g) => has(g, 'mo') },
    { t: '你开了个网店，第一单是一个老同学下的，还给了个五星好评。', maxAge: 70, cond: (g) => !has(g, 'mo') },
  ]);
  JY.addFlavor('focus:陪伴家人', [
    { t: '你陪爸妈去了一趟他们年轻时去过的地方。', maxAge: 75, cond: (g) => has(g, 'fa') && has(g, 'mo') },
    { t: (g) => '你每个周末都回家吃饭，' + CN.who(g, 'mo') + '每次都做一大桌菜。', maxAge: 70, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: '你和家里人一起包了饺子，包得奇形怪状。', cond: (g) => !CN.alone(g) },
    { t: (g) => '你陪' + CN.who(g, 'k1', true) + '搭了一下午积木，听' + ta(g, 'k1') + '讲了一个没有结尾的故事。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 10 },
    { t: (g) => '你给' + CN.who(g, 'fa', true) + '买了一部新手机，教他用了一个下午。', cond: (g) => has(g, 'fa') },
    { t: '你们一家人去郊外野餐，晒了一天太阳。', cond: (g) => !CN.alone(g) },
    { t: '你给家里打了很长一个电话，把这一年的事都说了一遍。', cond: (g) => CN.alone(g) && (parentsAlive(g) || kids(g).length > 0 || has(g, 'sib0')) },
    '你翻出老照片，一张张发到家族群里，群里热闹了一晚上。',
    { t: (g) => '你陪' + CN.who(g, olderSib(g) || 'sib0', true) + '喝了一晚上茶，聊起小时候抢遥控器的事，笑得直拍桌子。', minAge: 25, cond: (g) => has(g, 'sib0') },
  ]);
  JY.addFlavor('focus:锻炼身体', [
    { t: '你每天早上跑五公里，跑完觉得整个人都醒了。', maxAge: 70 },
    { t: '你办了一张健身卡，这一次真的坚持了下来。', maxAge: 75 },
    { t: '你学会了游泳，每周去两次。', maxAge: 80 },
    { t: '你戒了夜宵，体重降了五斤。', maxAge: 70 },
    { t: '你爬了一座山，在山顶看了一场日出。', maxAge: 75 },
    '体检的时候，医生说你的各项指标都不错。',
    { t: '你每天早上在公园里打一套太极拳，打完浑身暖和。', minAge: 50 },
    { t: '你每天饭后绕着小区慢慢走两圈，邻居们都认识你了。', minAge: 60 },
  ]);
  JY.addFlavor('focus:躺平休息', [
    '你在家躺了一整个周末，看完了一部很长的剧。',
    { t: '你关掉了工作群的消息提醒，世界一下安静了。', maxAge: 70, cond: working },
    '你睡到了中午才起，阳光照在被子上。',
    '你什么也没做，就是坐在阳台上喝茶。',
    '你发现，什么都不干的日子，也挺好的。',
  ]);
  JY.addFlavor('focus:出去走走', [
    '你去了一座从没去过的城市，吃了当地人推荐的小吃。',
    '你在一个古镇住了几天，每天睡到自然醒。',
    { t: '你一个人去爬了雪山，在山脚下就有高原反应了。', maxAge: 65 },
    '你在火车上认识了一个人，聊了一路。',
    '你去看了海，在沙滩上坐到天黑。',
    '你在旅途中丢了一个包，又被好心人送了回来。',
    { t: '你跟着老年旅游团去了南方，团里最小的六十五，最大的八十二。', minAge: 62 },
  ]);
  JY.addFlavor('focus:含饴弄孙', [
    { t: (g) => '你每天接送' + CN.who(g, gks(g)[0]) + '上学，在校门口和别的老人聊天。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 12) },
    { t: (g) => CN.who(g, gks(g)[0]) + '学会了叫你，你高兴了好几天。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 2) },
    { t: '你给孙辈讲故事，讲着讲着，自己先睡着了。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 2 && g.ageOf(id) <= 9) },
    { t: '孙辈调皮，把你的老花镜藏了起来，你找了一下午。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 10) },
    { t: '你教孙辈下象棋，孩子第一次赢了你，你故意没让。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 6) },
    { t: '家里还没有孙辈。你常去社区，帮着看邻居家的小孩写作业。', cond: (g) => !gks(g).length },
    { t: '孙辈长大了，不用你带了。你把他们小时候的玩具洗干净，收进了柜子。', cond: (g) => gks(g).length > 0 && gks(g).every((id) => g.ageOf(id) >= 13) },
  ]);

  /* 地区、省份、城市等级：默认六岁以后才有（小孩子不吃火锅、不说方言） */
  const wrap = (test) => (x) => {
    const o = typeof x === 'string' ? { t: x } : Object.assign({}, x);
    const c = o.cond;
    return Object.assign({ minAge: 6 }, o, { cond: (g) => test(g) && (!c || c(g)) });
  };
  const RG = (r, list) => list.map(wrap((g) => g.recall('region') === r));
  const PV = (ps, list) => list.map(wrap((g) => ps.includes(g.recall('prov'))));
  const TIER = (ts, list) => list.map(wrap((g) => ts.includes(tier(g))));
  JY.addFlavor('any', [].concat(
    RG('东北', ['冬天的暖气烧得很足，屋里能穿短袖，窗户上结着冰花。', { t: '你在冰面上打出溜滑，摔了个四仰八叉。', maxAge: 50 }, '过年的饭桌上，一定有一盘酸菜炖粉条。', '东北的冬天，下午四点天就黑了。', '你说话越来越像你爸，一句话三个“嘎哈”。', '小区门口卖冻梨的大娘，一年只出摊一个冬天。', '你学会了穿秋裤，一穿就是半年。', '烧烤摊上，铁签子堆成了小山。', '夏天的傍晚，凉风一吹，整个城市都在外面吃烧烤。', '你家的老房子，暖气片刷了一层又一层银粉。', '雪化的时候，路上全是泥。', { t: '你和朋友在澡堂子里泡了一下午，出来吃了一碗冷面。', minAge: 14 }, '早市上，大娘把一兜黏豆包塞给你，说是自家蒸的。', '冬天的阳台就是冰箱，冻饺子、冻梨、冻柿子摆了一排。', '过年贴春联，浆糊在门上冻住了。']),
    RG('华北', ['冬天的雾霾比小时候少多了，蓝天越来越多。', '春天的柳絮飘得到处都是，你一直打喷嚏。', '饺子是一年到头的主食，过年包，冬至包，来客人也包。', '夏天的西瓜一块钱一斤，你一个人能吃半个。', '北方的秋天很短，一转眼树叶就掉光了。', { t: '你学会了包包子，褶子捏得比你妈还好看。', minAge: 12 }, '过年的庙会，人挤得走不动道。', '你吃了一碗炸酱面，面码摆了七八样。', '风大的时候，出门得眯着眼睛走。', '暖气来的那天，全楼的人都松了一口气。', '秋天，柿子挂在光秃秃的树上，红得像一盏盏灯笼。']),
    PV(['北京'], ['早点铺子里，豆汁和焦圈的摊位前排着队。', '晚上的胡同里，有人在下棋，有人在乘凉。', '你家的老人每天早上去公园遛鸟。']),
    PV(['天津'], ['早上一套煎饼果子，薄脆要多加一个。', '天津人说话自带包袱，买个菜都像在听相声。']),
    PV(['山西'], ['山西人一顿不吃面就心慌。刀削面、猫耳朵、剔尖，换着花样吃。', '醋是每张饭桌上都少不了的。']),
    PV(['内蒙古'], ['草原上的夏天，天蓝得发亮，羊群像撒在山坡上的白云。', '一碗奶茶配一盘手把肉，是招待客人的规矩。']),
    RG('华东', ['梅雨季，家里的墙角长出了霉点，衣服一直晒不干。', '江南的春天，到处都是油菜花。', '夏天的午后，雷阵雨说来就来。', '过年的时候，桌上一定有一条鱼，寓意年年有余。', '黄梅天过去，被子拿到太阳底下晒，晒完有一股太阳的味道。', '青团上市了，你一口气吃了三个。']),
    PV(['上海', '江苏', '浙江'], ['早上的小笼包，汤汁烫了你的舌头。', '楼下的阿婆说话软软糯糯的，你听了半天才听懂。', '弄堂里的老人摇着扇子，在门口乘凉。']),
    PV(['上海'], ['你吃了一客生煎，配了一碗咖喱牛肉汤。']),
    PV(['浙江'], ['你在西湖边走了一下午，看见了很多拍婚纱照的人。']),
    PV(['江苏'], ['秋天吃大闸蟹，家里人能剥一个下午。', '一碗鸭血粉丝汤，几块钱，暖到胃里。']),
    PV(['山东'], ['山东人的饭桌，主座谁来坐，要推让上三回。', '大葱蘸酱，煎饼卷一切。', '过年走亲戚，进门先磕头，拜年要拜一整天。']),
    PV(['福建'], ['大人们喝茶，小小的杯子，一泡就是一下午。', '一碗沙茶面，汤头浓得化不开。']),
    PV(['安徽', '江西'], ['早上一碗米粉，浇上辣椒，一天都有劲。', '山里的徽派老房子，白墙黑瓦，下雨天像一幅画。']),
    RG('华中', ['夏天热得像蒸笼，你家的空调从五月开到十月。', '过年的时候，家家都在熏腊肉、灌香肠。', '你吃了一盘小龙虾，辣得满头大汗。', '冬天没有暖气，冷得钻心，你在家里也穿着羽绒服。', '油菜花开的时候，田野一片金黄。', '端午节，吃粽子、看龙舟，街上热闹得很。', '你学会了说几句方言，一开口就被本地人认出来是外地的。']),
    PV(['湖北'], ['早上来一碗热干面，芝麻酱拌得匀匀的。', '长江边的夜景很美，轮渡上全是看灯的人。']),
    PV(['湖南'], ['湘江边上，有人在冬泳。', '你家门口的米粉店，开了二十年了。', '你在楼下的小摊上吃了一碗臭豆腐，闻着臭，吃着香。']),
    PV(['河南'], ['一碗烩面，面宽得像腰带。', '胡辣汤配油条，是你家的早饭。', '河南人说话，一句“中”就什么都说了。']),
    RG('华南', ['回南天，墙上、地上全是水珠，衣服永远是湿的。', '一年四季都能穿短袖，冬天也就冷那么几天。', '台风天，学校停课，你在家里待了一整天。', '楼下的榕树，根须垂得长长的，像老人的胡子。', '夏天的蟑螂会飞，你吓得跳上了床。', '雨说下就下，说停就停，太阳一出来，地上就蒸起白气。']),
    PV(['广东'], ['早上去喝早茶，一盅两件，坐了一上午。', '你学会了说“唔该”和“得闲饮茶”。', '街边的糖水铺，开到半夜两点。', '过年的花市，人山人海，你买了一盆金桔回家。', '你吃了一碟肠粉，配了一杯凉茶，苦得皱眉。']),
    PV(['广西'], ['一碗螺蛳粉，整层楼都知道你在吃什么。', '三月三，街上有人对山歌，你也跟着哼了两句。']),
    PV(['海南'], ['椰子掉在路边，没人去捡。', '海南的太阳毒，你永远晒不白。', '你在海边吃了一顿海鲜，比内地便宜一半。']),
    RG('西南', ['赶场天，镇上的人比过年还多。', '雨季来了，雨一下就是半个月。', '过年的时候，家里要做腊肉、灌香肠，挂满了阳台。', '山路弯弯绕绕，坐车坐得人发晕。']),
    PV(['四川', '重庆'], [{ t: '你在火锅店里吃到了深夜，衣服上全是牛油味。', minAge: 12 }, '下午的茶馆里，老人们在打麻将，一打就是一下午。', '你学会了说“巴适”，什么好东西都说“巴适得板”。']),
    PV(['重庆'], ['山城的路上上下下，导航也会迷路。', '雾很大的时候，对面的楼都看不见。', { t: '你吃了一碗酸辣粉，辣得嘴唇发麻。', minAge: 10 }]),
    PV(['贵州', '四川', '云南'], ['你学会了吃折耳根，一开始觉得怪，后来离不开了。']),
    PV(['云南'], ['你家楼下的米线店，一碗米线配三样小菜。', { t: '你骑车去了一趟湖边，风吹得很舒服。', maxAge: 75 }, '雨季的菌子上市了，家家都在炒菌子，大人说一定要炒熟。']),
    PV(['贵州'], ['一碗酸汤鱼，酸得你直眯眼睛，又忍不住多喝一碗。']),
    PV(['西藏'], ['酥油茶喝惯了，到了外地反倒想得慌。', '转经的老人从你身边走过，嘴里念念有词。', '太阳很近，天很蓝，脸上晒出了两块红。']),
    RG('西北', ['风沙大的时候，嘴里全是沙子。', '晚上的夜市，烤肉的香味飘了几条街。', '冬天的风像刀子，出门要裹得严严实实。', '你家的窗台上，总晾着一排风干的辣子。', '天很高，云很低，好像伸手就能摸到。', '过年的时候，家里炸了一大锅油饼。']),
    PV(['甘肃', '青海', '宁夏'], ['早上一碗牛肉面，一清二白三红四绿。', '你学会了唱一首花儿，调子高得你唱不上去。']),
    PV(['陕西'], ['你吃了一碗羊肉泡馍，馍掰得越碎越好吃。', '你吃了一碗凉皮，配了一个肉夹馍。', '一碗油泼面，辣子一泼，滋啦一声，香了一屋子。']),
    PV(['新疆'], ['夏天的瓜果特别甜，一个哈密瓜你一个人吃了一半。', '秋天的胡杨林，黄得像着了火。', '晚上十点天还亮着，大人们在葡萄架下吃饭聊天。']),
    TIER([1], [{ t: '你周末去看了一个展，排队排了一个小时，看了二十分钟。', minAge: 10 }, '小区楼下的便利店二十四小时亮着灯。', { t: '地铁换乘要走十分钟，你走得比谁都快。', minAge: 18, maxAge: 70 }]),
    TIER([2, 3], ['城里新开了一座图书馆，周末的座位要抢。', '江边的灯光秀，每到周末就有很多人去看。']),
    TIER([4], ['县城的菜市场早上最热闹，卖菜的大多是附近村里的人。', '县城的人结婚，酒席要摆三天，请帖发遍了半条街。']),
    TIER([5], ['村里的小卖部也能收快递了。', '傍晚，谁家的烟囱先冒烟，谁家就先开饭。', '村里修了水泥路，路灯一直亮到村尾。']),
    [
      { t: '你在地铁上被人认出来，说是当年救人的那个人。你摆摆手说不是。', cond: (g) => g.f('evSavedLife') },
      { t: '那个走丢的孩子的妈妈，每年过年都会给你发一条祝福。', cond: (g) => g.f('evFoundKid') },
      { t: '老家寄来一箱今年的新果，箱子上印着村里的牌子。', cond: (g) => g.f('evVillageShop') },
      { t: '你在社区活动室的墙上，看到了自己做志愿者时的照片。', cond: (g) => g.f('evVolunteer') },
      { t: '你路过那个路口，红绿灯旁新装了一个摄像头。你想起了那场车祸。', cond: (g) => g.f('evWitness') },
      // 温暖的日常，不分地区
      { t: '一场雨过后，天边挂了一道彩虹，路上好多人停下来拍照。', minAge: 3 },
      { t: '冬天的第一场雪落下来，你站在窗边看了很久。', minAge: 3, cond: (g) => !['华南'].includes(g.recall('region')) },
      { t: '楼下新开了一家面包店，傍晚打折，你买了一袋。', minAge: 10 },
      { t: '路边的早点摊多给了你一根油条，说今天生意好。', minAge: 8 },
      { t: '这一年夏天，你在凉席上睡了一个很长的午觉，醒来的时候窗外蝉在叫。', minAge: 4 },
      { t: '你和家里人一起看了一部老电影，笑得前仰后合。', minAge: 6, cond: (g) => !CN.alone(g) },
      { t: '中秋节的晚上，月亮很圆。你吃了半块月饼，剩下半块放到了第二天。', minAge: 4 },
      { t: '过年守岁，零点的时候外面的烟花一下子全亮了。', minAge: 4 },
    ],
  ));
})();

/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const spRel = (g) => g.knows('sp') || '愛人';
  const parentsAlive = (g) => has(g, 'fa') || has(g, 'mo');
  const parentsWord = (g) => (has(g, 'fa') && has(g, 'mo') ? '爸媽' : has(g, 'fa') ? '爸爸' : '媽媽');
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
    evSavedLife: '你在地鐵裡救回了一個陌生人。',
    evFoundKid: '你幫一個走失的孩子找到了家。',
    evVillageShop: '你幫老家的鄉親把農產品賣到了全國。',
    evVolunteer: '你做了很多年志願者。',
    evWitness: '你為一場車禍出庭作證，幫受害的一家討回了公道。',
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
    { id: 'e_stray_dog', y: Y, minAge: 6, maxAge: 14, t: '小狗', text: '放學路上，一隻小土狗跟了你兩條街。它很瘦，一條後腿有點瘸。',
      choices: [
        { t: '把手裡的半個饅頭給它', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evDog', 'fed'); }, res: '它吃完了，又跟到你家門口才走。' },
        { t: '抱回家，求大人留下它', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('evDog', 'kept'); },
          res: (g) => (g.recall('leftBehind') ? '奶奶嘴上嫌麻煩，晚上卻把剩飯拌好了端出去。' : g.recall('hukou') === 'rural' ? '家裡人說，院子裡多一隻狗也好看門。' : '媽媽皺了半天眉，最後去樓下買了狗糧。') },
        { t: '趕緊跑開', dev: 0, fx: (g) => g.stat('心情', -1), res: '你回頭看了一眼，它站在路口沒動。' },
      ] },
    { id: 'e_found_wallet', y: Y, minAge: 8, maxAge: 16, t: '錢包', text: '你在操場邊撿到一個錢包，裡面有四百塊錢和一張身份證。',
      choices: [
        { t: '交給老師', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evWallet', 'returned'); }, res: '老師在班會上表揚了你。你有點不好意思。' },
        { t: '拿走錢，把錢包扔回原處', dev: 20, fx: (g) => { g.stat('心情', -2); g.remember('evWallet', 'kept'); }, res: '那天晚上你沒睡好。四百塊錢，你一分也沒敢花。' },
      ] },
    { id: 'e_ai_homework', y: Y, minAge: 8, maxAge: 15, t: '作業', text: '家裡的 AI 助手說，作業它三秒鐘就能寫完，字跡都能模仿你的。',
      choices: [
        { t: '自己寫，寫不出來再問它思路', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('evAiHw', 'learn'); }, res: '你寫到十點。最後一道題，是它提示了一句你才想通的。' },
        { t: '讓它寫', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('evAiHw', 'copy'); }, res: '你看了一晚上動畫片。第二天作業本上全是對勾。' },
        { t: '把它關掉，一個字都不問', dev: 20, fx: (g) => { g.stat('学识', 1); g.stat('心情', -1); g.remember('evAiHw', 'self'); }, res: '你算錯了三道題，可每一道都是你自己算錯的。' },
      ] },
    { id: 'e_game_night', y: Y, minAge: 11, maxAge: 17, t: '遊戲', text: '同學拉你玩一款新遊戲。第一局就贏了，你看了看錶，已經十一點半。',
      choices: [
        { t: '再來一局就睡', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evGame', 'some'); }, res: '你又玩了三局。第二天早自習，你一直在打哈欠。' },
        { t: '通宵', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('健康', -2); g.remember('evGame', 'hooked'); }, res: '天亮的時候，你升到了全服前一百。' },
        { t: '退出，解除安裝', dev: 15, fx: (g) => { g.stat('学识', 1); g.remember('evGame', 'quit'); }, res: '同學說你沒勁。你沒理他。' },
      ] },
    { id: 'e_bully_seen', y: Y, minAge: 9, maxAge: 16, t: '廁所門口', text: '幾個高年級的男生把一個瘦小的同學堵在廁所門口，搶他的零花錢。',
      choices: [
        { t: '跑去告訴老師', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evBully', 'told'); }, res: '老師來了，他們一鬨而散。被欺負的同學衝你點了點頭。' },
        { t: '衝上去拉開他們', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 3); g.remember('evBully', 'stood'); }, res: '他們沒想到有人敢管，罵罵咧咧地走了。',
          fail: { fx: (g) => { g.stat('健康', -4); g.remember('evBully', 'stood'); }, res: '你臉上捱了一拳。可那個同學的錢保住了。' } },
        { t: '低頭走過去', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evBully', 'passed'); }, res: '你走得很快。那個同學的眼神，你記了很久。' },
      ] },
    { id: 'e_talent_show', y: Y, minAge: 8, maxAge: 17, t: '文藝匯演', text: '學校要辦文藝匯演，班主任問誰願意上臺。教室裡沒人舉手。',
      choices: [
        { t: '低著頭，等別人舉手', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStage', 'shy'); }, res: '最後是班長上去唱了一首歌。' },
        { t: '舉手，說你可以講個相聲', dev: 20, check: ['人缘', 45], fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('evStage', 'hit'); }, res: '全場笑了三次。下臺的時候你的腿還在抖。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evStage', 'flop'); }, res: '你忘詞了，站在臺上一動不動。臺下有人在笑，笑的不是相聲。' } },
      ] },
    { id: 'e_idol_concert', y: Y, minAge: 14, maxAge: 35, t: '演唱會', text: '你喜歡了好幾年的歌手要來附近的城市開演唱會，最便宜的票也要六百。',
      choices: [
        { t: '算了，在網上看直播', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evConcert', 'online'); }, res: '彈幕刷得太快，你看不清檯上的人。' },
        { t: '攢錢，買票，坐夜車去', dev: 15, fx: (g) => { g.stat('心情', 5); CN.pay(g, 1500); g.remember('evConcert', 'went'); },
          res: (g) => (money(g) ? '門票加車票，一共花了 ' + fmt(1500) + '。' : '') + '散場的時候，你和旁邊的陌生人一起哭了。你們加了好友。' },
      ] },

    // —— 青年、成年 ——
    { id: 'e_part_time_scam', y: Y, minAge: 16, maxAge: 30, t: '兼職', text: '一個陌生人拉你進群，說點贊刷單就能賺錢。前三單真的到賬了，第四單要你先墊兩千。',
      choices: [
        { t: '墊錢，想著做完這單就收手', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('心情', -3); g.remember('evScam', 'lost'); },
          res: (g) => (money(g) ? '' : '那是你攢了兩年的壓歲錢。') + '錢轉過去，群就解散了。' },
        { t: '退群，拉黑', dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evScam', 'spotted'); }, res: '你把聊天記錄截了圖，發到了家族群裡提醒大家。' },
        { t: '報警，把群號交給民警', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evScam', 'reported'); }, res: '民警說這個群已經騙了幾十個學生。他們留了你的電話。' },
      ] },
    { id: 'e_friend_borrow', y: Y, minAge: 20, maxAge: 65, t: '借錢', cond: (g) => money(g),
      text: (g) => '一個多年的朋友半夜打來電話，說家裡出了急事，想借 ' + fmt(loanAmt(g)) + '。他說話的聲音有點抖。',
      choices: [
        { t: '借', canon: true, cond: (g) => cash(g) >= loanAmt(g), fx: (g) => { const a = loanAmt(g); CN.pay(g, a); g.stat('人缘', 2); g.remember('evLoan', 'lent'); g.remember('evLoanAmt', a); }, res: '錢轉過去了。他說半年內一定還。' },
        { t: '借一半，說手頭只有這些', dev: 10, cond: (g) => cash(g) >= loanAmt(g) / 2, fx: (g) => { const a = loanAmt(g) / 2; CN.pay(g, a); g.remember('evLoan', 'half'); g.remember('evLoanAmt', a); }, res: (g) => '你轉過去 ' + fmt(g.recall('evLoanAmt')) + '。他沉默了兩秒，說夠了，謝謝你。' },
        { t: '手裡沒錢，陪他去想辦法', dev: 15, cond: (g) => cash(g) < loanAmt(g) / 2, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evLoan', 'helped'); }, res: '第二天一早，你陪他跑了三家銀行，又幫他打了一圈電話。' },
        { t: '說最近手頭也緊', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evLoan', 'refused'); }, res: '他說沒事，理解。電話掛得很快。' },
      ] },
    { id: 'e_class_reunion', y: Y, minAge: 25, maxAge: 65, t: '同學會', text: (g) => (['bachelor', 'master', 'phd'].includes(g.recall('edu')) ? '大學班長在群裡發了通知：老同學們，找個週末聚一聚。' : '初中班長在群裡發了通知：老同學們，回老家聚一聚。'),
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evReunion', 'went'); }, res: '有人胖了，有人禿了，有人沒來。散場時你們約好明年再聚。' },
        { t: '找個理由不去', dev: 10, fx: (g) => { g.stat('心情', 1); g.remember('evReunion', 'skip'); }, res: '那天晚上你刷到了他們的合影。你在裡面找了找，當然沒有你。' },
      ] },
    { id: 'e_viral_video', y: Y, minAge: 18, maxAge: 60, t: '火了', text: '你隨手拍的一條影片，一夜之間播放量過了五百萬。手機一直在響。',
      choices: [
        { t: '回幾條評論，日子照舊', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evViral', 'ignored'); }, res: '一個星期後，就沒人記得這條影片了。' },
        { t: '趁熱開直播、接廣告', dev: 25, fx: (g) => { CN.earn(g, 8000); g.stat('事业', 2); g.info('副業', '博主'); g.remember('evViral', 'ride'); }, res: (g) => '第一場直播就有兩萬人看。第一條廣告到手 ' + fmt(8000) + '。你說話的時候，手心全是汗。' },
        { t: '刪掉，關掉評論', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evViral', 'deleted'); }, res: '有人截了圖，轉了好幾輪。慢慢地，也就沒人提了。' },
      ] },
    { id: 'e_subway_faint', y: Y, minAge: 16, maxAge: 72, t: '暈倒的人', cond: (g) => tier(g) <= 3,
      text: (g) => pk(g, ['早高峰的地鐵上', '晚高峰的地鐵上', '週末的地鐵上'], 88) + '，一個' + pk(g, ['中年男人', '穿工裝的大叔', '揹著電腦包的年輕人'], 89) + '突然倒在你腳邊，臉色發青。車廂裡的人都往後退。',
      choices: [
        { t: '大聲喊人，打急救電話', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evFaint', 'called'); }, res: '列車到站，急救的人衝了進來。他被抬上擔架的時候，手指動了一下。' },
        { t: '跪下來給他做心肺復甦', dev: 30, check: ['学识', 45], fx: (g) => { g.stat('人缘', 4); g.set('evSavedLife'); g.remember('evFaint', 'cpr'); }, res: '按到第三輪，他咳了一聲，睜開了眼睛。',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('evFaint', 'tried'); }, res: '你按了很久，直到急救的人接手。後來你一直不知道他有沒有活下來。' } },
        { t: '低頭看手機，等別人處理', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evFaint', 'away'); }, res: '下一站，你換了一節車廂。' },
      ] },
    { id: 'e_lottery', y: Y, minAge: 18, maxAge: 85, t: '彩票', cond: (g) => money(g), text: (g) => pk(g, ['樓下彩票站的老闆說，昨天這裡剛出了個二等獎。', '公司樓下新開了一家彩票站，門口貼著紅紙：本站喜中二等獎。', '你在便利店排隊結賬，前面的大爺一口氣買了二十注。', '家族群裡有人發了一張彩票，說是夢裡夢見的號碼。'], 80),
      choices: [
        { t: '不買，走了', canon: true, fx: (g) => { g.remember('evLottery', 'never'); }, res: '你買了一瓶水就走了。' },
        { t: '買兩注，就當買個盼頭', dev: 10, fx: (g) => { if (g.rnd() < 0.03) { CN.earn(g, 160000); g.stat('心情', 8); g.remember('evLottery', 'won'); } else { CN.pay(g, 4); g.remember('evLottery', 'habit'); } },
          res: (g) => (g.recall('evLottery') === 'won' ? '開獎那天你核對了七遍號碼。中了，扣完稅到手 ' + fmt(160000) + '。' : '四塊錢，沒中。可是從那以後，你每個星期都會去買兩注。') },
      ] },
    { id: 'e_rain_rider', y: Y, minAge: 18, maxAge: 60, t: '暴雨', cond: (g) => job(g) === 'rider' || job(g) === 'driver',
      text: '暴雨。手機上還有七單沒送，系統提示：超時將扣款。路邊的積水已經沒過了腳踝。',
      choices: [
        { t: '咬牙衝出去送', canon: true, fx: (g) => { CN.earn(g, 300); g.stat('健康', -3); g.remember('evRain', 'rushed'); }, res: '七單都送到了，多掙了三百塊。你在一個路口摔了一跤，餐盒保住了，膝蓋沒保住。' },
        { t: '找個屋簷等雨小一點', dev: 10, fx: (g) => { CN.pay(g, 90); g.remember('evRain', 'waited'); }, res: '扣了九十塊。你在屋簷下抽完了一根菸，雨停的時候，天邊出了一點亮光。' },
        { t: '先把困在水裡的老太太扶上臺階', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 60); g.remember('evRain', 'helped'); }, res: '超時扣了六十塊。老太太一直問你的名字，你說不用了，騎上車走了。' },
      ] },
    { id: 'e_headhunter', y: Y, minAge: 24, maxAge: 50, t: '獵頭', cond: (g) => ['tech', 'office', 'sales'].includes(job(g)),
      text: '一個獵頭約你喝咖啡，說另一家公司願意給你多開四成工資，就是要常加班。',
      choices: [
        { t: '謝謝，不考慮', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evHop', 'stayed'); }, res: '你回到工位，覺得椅子比平時舒服一點。' },
        { t: '跳', dev: 20, fx: (g) => { g.stat('事业', 4); g.stat('健康', -2); g.remember('evHop', 'hopped'); }, res: '新工牌是黑色的，比原來的好看。第一個月的工資條，你看了兩遍。' },
        { t: '拿著這個去找老闆談加薪', dev: 15, check: ['事业', 45], fx: (g) => { g.stat('事业', 2); g.remember('evHop', 'raise'); }, res: '老闆看了你很久，給你漲了兩成。',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evHop', 'cold'); }, res: '老闆說，要走不攔。你沒走，可從那以後，他看你的眼神不一樣了。' } },
      ] },
    { id: 'e_rent_up', y: Y, minAge: 20, maxAge: 50, t: '房東', cond: (g) => money(g) && !withParents(g) && (g.recall('house') === 'rent' || (g.recall('house') == null && g.age >= 22 && tier(g) <= 3)),
      text: '房東發來訊息：下個月起，房租每月漲五百。',
      choices: [
        { t: '忍了，接著住', canon: true, fx: (g) => { CN.pay(g, 6000); g.remember('evRent', 'paid'); }, res: (g) => '一年多交 ' + fmt(6000) + '。你把每天的咖啡戒了，改成自己泡茶。' },
        { t: '搬到更遠的地方', dev: 10, fx: (g) => { g.stat('健康', -1); g.remember('evRent', 'moved'); }, res: '通勤多了四十分鐘，房子大了一點，窗外能看見一片菜地。' },
        { t: '上門跟房東商量', dev: 10, check: ['人缘', 50], fx: (g) => { CN.pay(g, 2400); g.remember('evRent', 'haggled'); }, res: '房東是個退休老師。最後只漲了兩百，還送了你一袋橘子。',
          fail: { fx: (g) => { CN.pay(g, 6000); g.stat('心情', -2); g.remember('evRent', 'paid'); }, res: '房東說，不租有的是人租。' } },
      ] },
    { id: 'e_red_envelope', y: Y, minAge: 22, maxAge: 55, t: '份子錢', cond: (g) => money(g), text: '這個月收到三張喜帖。其中一張來自一個你快記不起名字的同事。',
      choices: [
        { t: '每張都隨常規的份子', canon: true, fx: (g) => { CN.pay(g, big(g) ? 2400 : 1500); g.remember('evGift', 'normal'); }, res: (g) => '三份份子，一共 ' + fmt(big(g) ? 2400 : 1500) + '。這個月的賬有點緊。' },
        { t: '給要好的包個大紅包，其他的不去', dev: 15, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 1); g.remember('evGift', 'close'); }, res: (g) => '你包了 ' + fmt(2000) + '。新郎抱著你，說你是他最好的朋友。' },
        { t: '都不去，說自己在出差', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evGift', 'skip'); }, res: '後來有人在群裡提到你，說你最近好忙。' },
      ] },
    { id: 'e_relative_kid', y: Y, minAge: 32, maxAge: 62, t: '親戚家的孩子', cond: (g) => g.s('事业') >= 35 && working(g),
      text: '表姐打電話來，說她家孩子剛畢業，想去你那裡實習，問你能不能幫忙說句話。',
      choices: [
        { t: '幫著問一問', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evNephew', 'helped'); }, res: '孩子來了，很機靈，第一天就給你帶了早飯。' },
        { t: '客氣地推掉', dev: 10, fx: (g) => { g.stat('人缘', -1); g.remember('evNephew', 'declined'); }, res: '表姐說沒事。過年的時候，她跟你說話少了。' },
      ] },
    { id: 'e_checkup', y: Y, minAge: 30, maxAge: 75, t: '體檢單', text: (g) => (working(g) ? '單位體檢的報告上' : '社群免費體檢的報告上') + '，有一行字被加粗了：建議進一步檢查。',
      choices: [
        { t: '去醫院複查', canon: true, fx: (g) => { g.stat('健康', 2); g.remember('evCheck', 'checked'); }, res: '醫生說發現得早，問題不大，按時吃藥就行。你出了醫院，給自己買了一碗熱湯。' },
        { t: '忙完這陣再說', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evCheck', 'ignored'); }, res: '這陣子，一忙就是兩年。' },
      ] },
    { id: 'e_marathon', y: Y, minAge: 20, maxAge: 62, t: '馬拉松', text: '城市馬拉松開始報名。一個朋友說他要去跑半程，問你去不去。',
      choices: [
        { t: '去跑', dev: 15, check: ['健康', 55], fx: (g) => { g.stat('健康', 3); g.stat('心情', 3); g.remember('evRun', 'ran'); }, res: '衝過終點的時候，你兩條腿都不是自己的了。可你想再跑一次。',
          fail: { fx: (g) => { g.stat('健康', -2); g.remember('evRun', 'quit'); }, res: '跑到十二公里，你上了收容車。車上的人分給你一根香蕉。' } },
        { t: '在路邊給他加油', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evRun', 'cheered'); }, res: '他跑過去的時候，衝你比了個大拇指。' },
      ] },
    { id: 'e_side_stall', y: Y, minAge: 20, maxAge: 55, t: '擺攤', cond: (g) => money(g), text: '朋友說夜市的攤位一個月才幾百塊，問你要不要一起賣烤腸。',
      choices: [
        { t: '算了，下班只想躺著', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evStall', 'no'); }, res: '你刷到他發的影片，攤前排著隊。' },
        { t: '幹', dev: 20, fx: (g) => { CN.pay(g, 3000); g.stat('健康', -1); g.remember('evStall', g.rnd() < 0.55 ? 'good' : 'bad'); }, res: (g) => '買爐子、進貨，先花了 ' + fmt(3000) + '。第一晚賣了一百二十根。腰痠得直不起來，你卻笑了一路。' },
      ] },
    { id: 'e_invest', y: Y, minAge: 25, maxAge: 68, t: '理財', cond: (g) => money(g) && cash(g) >= 20000,
      text: (g) => '同事都在說一隻基金，說一個月漲了三成。你的 ' + fmt(cash(g)) + ' 存款躺在銀行裡，利息低得可憐。',
      choices: [
        { t: '還是存銀行', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evInvest', 'saved'); }, res: '你睡得很踏實。' },
        { t: '拿一半存款追進去', dev: 20, fx: (g) => { const a = CN.invest(g, round(cash(g) / 2, 1000), 'stock'); g.stat('心情', 2); g.remember('evInvest', 'chased'); g.remember('evInvestAmt', a); }, res: (g) => '你買進了 ' + fmt(g.recall('evInvestAmt')) + '。第二天它漲了兩個點，你一晚上看了三十次手機。' },
        { t: '每月定投一點，十年不看', dev: 15, fx: (g) => { const a = CN.invest(g, round(cash(g) * 0.2, 1000), 'fund'); g.remember('evInvest', 'dca'); g.remember('evInvestAmt', a); }, res: '你設好了自動扣款，然後解除安裝了那個軟體。' },
      ] },
    { id: 'e_cat_adopt', y: Y, minAge: 20, maxAge: 80, t: '流浪貓', cond: (g) => !CN.pet(g), text: (g) => pk(g, ['小區的車棚裡', '單位鍋爐房的後面', '樓下的灌木叢裡'], 81) + '，流浪貓生了一窩小貓。' + pk(g, ['物業貼出通知，下週要統一清理。', '有人在群裡說太吵了，該處理掉。', '天越來越冷，夜裡能聽見它們叫。'], 82),
      choices: [
        { t: '領養一隻', dev: 15, fx: (g) => { g.stat('心情', 4); g.remember('evCat', 'adopted'); }, res: '它是一隻三花，第一天就鑽進了你的被窩。' },
        { t: '在業主群裡幫它們找主人', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('evCat', 'rehomed'); }, res: '五隻小貓，三天就被領走了。' },
        { t: '和別人一樣看看就走', canon: true, fx: (g) => g.stat('心情', -1), res: '下個星期，貓窩空了。' },
      ] },
    { id: 'e_neighbor', y: Y, minAge: 22, maxAge: 80, t: '樓上', cond: (g) => tier(g) <= 4, text: (g) => '樓上新搬來一戶人家，' + ['每天晚上十一點開始拖椅子。', '半夜總有咚咚的聲音，一下一下的。', '天天晚上彈鋼琴，彈到十一點。'][Math.floor(rr(g, 84) * 3)],
      choices: [
        { t: '忍一忍，買副耳塞', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNeighbor', 'endured'); }, res: '耳塞很管用，就是早上的鬧鐘也聽不見了。' },
        { t: '拎一袋水果上門聊聊', dev: 15, fx: (g) => { g.stat('人缘', 3); g.remember('evNeighbor', 'friend'); }, res: (g) => ['開門的是個老太太，說她腿腳不好，椅子是拖著走的。她給你泡了一杯茶。', '開門的是個老太太，說她孫子晚上在家練跳繩。她給你泡了一杯茶。', '開門的是個小姑娘，說下個月考級。她媽媽給你泡了一杯茶，說以後九點就停。'][Math.floor(rr(g, 84) * 3)] },
        { t: '拿掃把杆捅天花板', dev: 15, fx: (g) => { g.stat('心情', 1); g.stat('人缘', -2); g.remember('evNeighbor', 'feud'); }, res: '樓上安靜了。電梯裡碰見，誰也不看誰。' },
      ] },
    { id: 'e_witness', y: Y, minAge: 20, maxAge: 72, t: '車禍', text: '路口一輛車闖紅燈，撞倒了一個騎電動車的人。司機下車看了看，說是對方衝出來的。你看得清清楚楚。',
      choices: [
        { t: '留下電話，願意作證', dev: 25, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evWitness', 'testified'); }, res: '交警記下了你的話。那個騎車的人躺在地上，衝你點了點頭。' },
        { t: '幫著打了急救電話，沒多說', canon: true, fx: (g) => { g.remember('evWitness', 'quiet'); }, res: '救護車來了，你就走了。' },
      ] },
    { id: 'e_volunteer', y: Y, minAge: 16, maxAge: 78, t: '志願者', text: '社群在招志願者：陪獨居老人聊天，每週兩個小時。',
      choices: [
        { t: '報名', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.remember('evVol', 'yes'); }, res: '你分到的老人是個退休的鉗工，第一次見面就跟你講了兩個小時他年輕時的事。' },
        { t: '太忙了，下次吧', canon: true, fx: (g) => { g.remember('evVol', 'no'); }, res: '海報在公告欄上貼了一個月。' },
      ] },
    { id: 'e_classmate_ill', y: Y, minAge: 30, maxAge: 68, t: '眾籌', text: '老同學群裡有人轉發了一條眾籌連結。生病的是你初中時的同桌。',
      choices: [
        { t: '捐兩百，轉發', canon: true, fx: (g) => { CN.pay(g, 200); g.remember('evIll', 'shared'); }, res: '連結下面的留言越來越多。' },
        { t: '請假去醫院看他', dev: 20, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 2000); g.remember('evIll', 'visited'); }, res: (g) => '你塞給他一個 ' + fmt(2000) + ' 的紅包。他瘦得認不出來了，你們聊起初中時偷偷養在課桌裡的蠶。' },
      ] },
    { id: 'e_lost_child', y: Y, minAge: 16, maxAge: 78, t: '走失的孩子', text: (g) => pk(g, ['商場門口', '地鐵站出口', '公園的湖邊', '超市的收銀臺旁'], 83) + '，一個四五歲的小男孩站著哭，說找不到媽媽了。',
      choices: [
        { t: '帶他去找保安和警察', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evKid', 'police'); }, res: '廣播響了兩遍，他媽媽跑了過來，抱住他就哭。' },
        { t: '陪著他在原地等，拍照發到本地群裡', dev: 20, fx: (g) => { g.stat('人缘', 3); g.set('evFoundKid'); g.remember('evKid', 'waited'); }, res: '二十分鐘後，他媽媽看到群裡的照片找來了。她要給你錢，你沒要。' },
      ] },
    { id: 'e_village_live', y: Y, minAge: 20, maxAge: 60, t: '老家的果子', cond: (g) => g.recall('hukou') === 'rural',
      text: '老家今年的果子大豐收，收購價卻壓得很低。村支書打電話問你，能不能在網上幫著賣一賣。',
      choices: [
        { t: '轉發到朋友圈，幫著問問', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evVillage', 'shared'); }, res: '賣出去幾十箱。支書說，謝謝你還記著村裡。' },
        { t: '請幾天假回去，開直播賣', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 1500); g.set('evVillageShop'); g.remember('evVillage', 'live'); }, res: '第一天賣了三千箱。二叔在鏡頭後面扛箱子，笑得合不攏嘴。' },
      ] },
    { id: 'e_old_teacher', y: Y, minAge: 25, maxAge: 72, t: '老師', text: '你聽說當年的班主任住院了。她教了你三年，那時候總說你的字太潦草。',
      choices: [
        { t: '打個電話問候', canon: true, fx: (g) => { g.remember('evTeacher', 'called'); }, res: '電話那頭她的聲音很弱，可還是一下就叫出了你的名字。' },
        { t: '買束花去醫院看她', dev: 15, fx: (g) => { g.stat('人缘', 2); g.remember('evTeacher', 'visited'); }, res: '她握著你的手，說你現在的字，好看多了。' },
      ] },
    { id: 'e_friend_divorce', y: Y, minAge: 30, maxAge: 62, t: '酒', text: '好朋友約你出來喝酒。喝到第三瓶，他說他要離婚了。',
      choices: [
        { t: '勸他再想想，為了孩子', canon: true, fx: (g) => { g.remember('evFriendDiv', 'persuade'); }, res: '他點點頭，又搖了搖頭。' },
        { t: '什麼也不勸，陪他喝到天亮', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evFriendDiv', 'listened'); }, res: '天亮的時候，他說謝謝你沒勸他。' },
      ] },
    { id: 'e_typhoon', y: Y, minAge: 10, maxAge: 80, t: '颱風', cond: (g) => g.recall('region') === '华南' || g.recall('region') === '华东',
      text: '颱風要登陸了。超市的麵包架空了，窗戶上貼滿了米字形的膠帶。',
      choices: [
        { t: '關好門窗，在家待著', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStorm', 'home'); }, res: '風颳了一夜，樓下的樹倒了兩棵。' },
        { t: '去幫樓下的獨居老人加固窗戶', dev: 20, fx: (g) => { g.stat('人缘', 3); g.remember('evStorm', 'helped'); }, res: '你釘好最後一塊木板，雨就砸下來了。阿婆給你煮了一碗糖水。' },
        { t: '去海邊拍浪', dev: 25, cond: (g) => g.age <= 55, check: ['健康', 50], fx: (g) => { g.stat('心情', 3); g.remember('evStorm', 'reckless'); }, res: '你拍到了一張浪比樓高的照片，轉發了一萬次。',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('evStorm', 'hurt'); }, res: '一陣浪把你拍在了欄杆上。你在醫院住了半個月。' } },
      ] },
    { id: 'e_snowstorm', y: Y, minAge: 8, maxAge: 80, t: '大雪', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')),
      text: '一夜的大雪，早上推門推不開。院子裡的雪沒過了膝蓋。',
      choices: [
        { t: '掃自家門口', canon: true, fx: (g) => g.stat('健康', 1), res: '掃完你出了一身汗，臉凍得通紅。' },
        { t: '順手把整棟樓門口都掃了', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evSnow', 'swept'); }, res: '樓上的大爺站在窗戶後面看了你半天，第二天給你送來一兜凍梨。' },
        { t: '先堆個雪人再說', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('evSnow', 'fun'); }, res: '雪人的鼻子是一根胡蘿蔔。你拍了張照片，存了很多年。' },
      ] },
    { id: 'e_ai_layoff', y: [2044, 2080], minAge: 22, maxAge: 60, t: '新系統', cond: (g) => ['office', 'worker', 'driver', 'sales', 'shop'].includes(job(g)),
      text: '公司上了新的 AI 系統。部門開會說，明年的崗位要“最佳化”三成。',
      choices: [
        { t: '埋頭幹活，等著看', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('evAiCut', 'stay'); }, res: '那段時間，每次開會你都坐在最後一排。' },
        { t: '晚上去學怎麼管這些系統', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('健康', -1); g.remember('evAiCut', 'reskill'); }, res: '課很難。第一個月，你在課上睡著了三次。' },
        { t: '先下手，自己出去找活路', dev: 25, fx: (g) => { CN.setJob(g, 'freelance', '自由職業'); g.remember('evAiCut', 'left'); }, res: '你遞了辭職信。走出寫字樓的時候，天特別藍。' },
      ] },
    { id: 'e_robot_buy', y: [2060, 2130], minAge: 35, t: '機器人', cond: (g) => g.recall('robot') == null && money(g),
      text: (g) => '家電城在搞活動：家務機器人 ' + fmt(36000) + '，分二十四期免息。售貨員說，它能做飯、拖地、陪老人下棋。',
      choices: [
        { t: '太貴了，再等等', canon: true, fx: (g) => { g.remember('evRobot', 'waited'); }, res: '你在它面前站了十分鐘，摸了摸它的手。' },
        { t: '分期買一臺', dev: 15, fx: (g) => { CN.pay(g, 36000); g.stat('健康', 1); g.remember('evRobot', 'bought'); }, res: '它到家的第一天，把你的襪子按顏色排好了。' },
      ] },
    { id: 'e_hometown_newyear', y: Y, minAge: 18, maxAge: 60, t: '過年',
      cond: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && parentsAlive(g) && !withParents(g) && g.recall('parentsCare') !== 'nursing',
      text: '臘月二十，搶票軟體開了一整夜，回老家的票還是候補。',
      choices: [
        { t: '加錢買站票也要回', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 2); g.stat('健康', -1); g.remember('evNewYear', 'home'); }, res: '站了九個小時。推開家門，飯桌上擺著你最愛吃的菜。' },
        { t: '今年不回了，影片拜年', dev: 15, fx: (g) => { g.stat('心情', -1); g.remember('evNewYear', 'stay'); }, res: (g) => (has(g, 'mo') ? '影片裡，媽媽說沒事沒事，你那邊吃餃子沒。' : '影片裡，爸爸說沒事，讓你自己記得吃頓好的。') },
        { t: (g) => '把' + parentsWord(g) + '接過來過年', dev: 20, fx: (g) => { CN.pay(g, 8000); g.stat('人缘', 3); g.remember('evNewYear', 'brought'); },
          res: (g) => (has(g, 'fa') && has(g, 'mo') ? '他們' : parentsWord(g)) + '第一次看到這座城市的煙火，一直說太貴了，一直在拍照。車票、吃住，一共花了 ' + fmt(8000) + '。' },
      ] },
    { id: 'e_health_lecture', y: Y, minAge: 60, t: '講座', text: '小區門口發雞蛋，說聽完一場“健康講座”就送一盒。講臺上的人說，他們的保健品能治百病。',
      choices: [
        { t: '領了雞蛋就走', canon: true, fx: (g) => g.stat('心情', 1), res: '雞蛋有兩個是破的。' },
        { t: '買了一個療程', dev: 15, fx: (g) => { CN.pay(g, 8800); g.remember('evLecture', 'bought'); }, res: '一個療程八千八。他們說，第二個療程打八折。' },
        { t: '站起來問他：有沒有批文', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evLecture', 'exposed'); }, res: '講臺上的人愣住了。幾個老鄰居跟著你一起走了出去。' },
      ] },
    { id: 'e_square_dance', y: Y, minAge: 55, maxAge: 82, t: '廣場', text: (g) => pk(g, ['傍晚的廣場上', '小區的空地上', '公園的亭子邊'], 85) + '，一群人跟著音樂在' + pk(g, ['跳舞', '跳健身操', '打太極'], 86) + '。領頭的' + pk(g, ['阿姨', '大爺'], 87) + '衝你招手。',
      choices: [
        { t: '在旁邊看看就好', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evDance', 'watched'); }, res: '音樂很響，你跟著拍了幾下腿。' },
        { t: '加進去跳', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('evDance', 'joined'); }, res: '你踩錯了好幾拍，沒人笑你。散場的時候，有人塞給你一瓶水。' },
      ] },
    { id: 'e_tech_class', y: Y, minAge: 66, t: '新裝置', cond: (g) => kids(g).length > 0,
      text: (g) => (gks(g).length ? '孫輩' : '孩子') + '送你一副新眼鏡，說戴上就能和他們影片，還能把字放大。說明書你看不懂。',
      choices: [
        { t: '收進抽屜，用老手機就行', canon: true, fx: (g) => { g.remember('evTech', 'drawer'); }, res: '老手機的螢幕已經裂了一道縫。' },
        { t: '去社群的老年課學怎麼用', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('evTech', 'learned'); }, res: '老師是個大學生，很耐心。你在本子上記了滿滿三頁。' },
      ] },

    // —— 钱 ——
    { id: 'e_tip_stock', y: Y, minAge: 25, maxAge: 70, t: '內部訊息', cond: (g) => money(g) && cash(g) >= 30000,
      text: '過節的飯桌上，一個遠房表舅壓低了聲音：他有個朋友在一家公司上班，下個月有大訊息，那隻股票現在買，少說翻一倍。',
      choices: [
        { t: '笑笑，不當真', canon: true, fx: (g) => { g.remember('evTip', 'no'); }, res: '你給表舅倒了一杯茶，聊起了別的。' },
        { t: (g) => '拿出 ' + fmt(tipAmt(g)) + ' 買進去', dev: 20, fx: (g) => { const a = tipAmt(g); CN.pay(g, a); g.stat('心情', 2); g.remember('evTip', 'in'); g.remember('evTipAmt', a); }, res: (g) => '你把 ' + fmt(g.recall('evTipAmt')) + ' 轉進了股票賬戶。那天晚上，你夢見數字一直在漲。' },
        { t: '只拿一小筆試試', dev: 10, fx: (g) => { const a = round(tipAmt(g) / 5, 1000); CN.pay(g, a); g.remember('evTip', 'little'); g.remember('evTipAmt', a); }, res: (g) => '你買了 ' + fmt(g.recall('evTipAmt')) + '，告訴自己，虧了就當交學費。' },
      ] },
    { id: 'e_high_yield', y: Y, minAge: 40, maxAge: 85, t: '理財顧問', cond: (g) => money(g) && cash(g) >= 20000,
      text: '一個自稱理財顧問的人加了你好友。他說有一款產品，年化百分之十五，保本保息，已經有很多人買了，開戶還送一桶油。',
      choices: [
        { t: '不信，刪了', canon: true, fx: (g) => { g.remember('evHigh', 'no'); }, res: '他又換了一個號來加你。你又刪了。' },
        { t: (g) => '先投 ' + fmt(highAmt(g)) + ' 試試', dev: 15, fx: (g) => { const a = highAmt(g); CN.pay(g, a); g.remember('evHigh', 'in'); g.remember('evHighAmt', a); }, res: '第一個月，利息真的到賬了。那桶油也送到了家門口。' },
        { t: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? '先問問孩子' : '先去銀行問問櫃員'), dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evHigh', 'asked'); },
          res: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? '孩子在電話裡急了：這是騙子。' + ta(g, 'k1') + '幫你把那個人拉黑了。' : '櫃員看了一眼，說這種保本百分之十五的，十個有十個是騙人的。') },
      ] },
    { id: 'e_net_loan', y: Y, minAge: 18, maxAge: 32, t: '網貸', cond: (g) => money(g) && cash(g) < 10000,
      text: '手機上彈出一條廣告：憑身份證最高借五萬，秒到賬，前三十天免息。你這個月的錢，確實不太夠了。',
      choices: [
        { t: '不點開，這個月省著點', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNetLoan', 'no'); }, res: '你把外賣軟體卸了，天天自己煮麵。' },
        { t: '借兩萬應急', dev: 15, fx: (g) => { CN.earn(g, 20000); g.remember('debt', (Number(g.recall('debt')) || 0) + 2.6); g.remember('evNetLoan', 'took'); }, res: (g) => '十秒鐘，' + fmt(20000) + ' 就到了賬。合同有二十頁，你一頁也沒看。' },
        { t: (g) => '跟' + parentsWord(g) + '開口', dev: 10, cond: (g) => parentsAlive(g), fx: (g) => { CN.earn(g, 5000); g.remember('evNetLoan', 'family'); }, res: (g) => '電話裡你支支吾吾。第二天，卡里多了 ' + fmt(5000) + '，附言寫著：吃好點。' },
      ] },
    { id: 'e_windfall', y: Y, minAge: 22, maxAge: 64, t: '年會', cond: (g) => money(g) && working(g) && job(g) !== 'farmer',
      text: (g) => (['rider', 'driver', 'worker'].includes(job(g)) ? '年底聚餐抽獎' : '公司年會抽獎') + '，主持人唸到了你的名字：一等獎，現金 ' + fmt(20000) + '。',
      choices: [
        { t: '存起來', canon: true, fx: (g) => { CN.earn(g, 20000); g.remember('evWindfall', 'saved'); }, res: '你把錢轉進了存款，心裡踏實了一點。' },
        { t: (g) => (CN.alone(g) ? '給自己放個假，出去走一趟' : '帶家裡人出去玩一趟'), dev: 15, fx: (g) => { CN.earn(g, 2000); g.stat('心情', 5); g.remember('evWindfall', 'trip'); },
          res: (g) => (CN.alone(g) ? '你一個人去了海邊，住了五天，花得只剩兩千。' : '一家人去了趟海邊，住了五天，花得只剩兩千。') },
        { t: (g) => '全給' + parentsWord(g), dev: 15, cond: (g) => parentsAlive(g), fx: (g) => { g.stat('人缘', 3); g.remember('evWindfall', 'parents'); }, res: (g) => parentsWord(g) + '在電話裡推了半天，最後說，那就先替你存著。' },
      ] },
    { id: 'e_car', y: Y, minAge: 24, maxAge: 60, t: '買車', cond: (g) => money(g) && cash(g) >= 60000,
      text: (g) => '週末去車展轉了一圈。銷售說，這款電動車今年降價，' + fmt(carPrice(g)) + '，首付只要兩成。',
      choices: [
        { t: '再等等，打車也挺好', canon: true, fx: (g) => { g.remember('evCar', 'no'); }, res: '你在車裡坐了五分鐘，下來的時候摸了摸方向盤。' },
        { t: '分期買一輛新的', dev: 15, fx: (g) => { const p = carPrice(g); CN.pay(g, p * 0.2); g.remember('debt', (Number(g.recall('debt')) || 0) + p * 0.8 / 1e4); g.remember('evCar', 'new'); g.stat('心情', 3); }, res: (g) => '首付 ' + fmt(carPrice(g) * 0.2) + '，剩下的分三年還。提車那天，你在車裡坐了很久才開走。' },
        { t: '買一輛二手車', dev: 10, fx: (g) => { CN.pay(g, 50000); g.remember('evCar', 'used'); g.stat('心情', 2); }, res: (g) => '一輛開了五年的車，' + fmt(50000) + '。座椅上還有前主人家孩子貼的貼紙。' },
      ] },
    { id: 'e_insurance', y: Y, minAge: 28, maxAge: 55, t: '保險', cond: (g) => money(g) && working(g),
      text: (g) => '一個老同學做了保險，約你喝茶，給你算了一筆賬：一份重疾險，每年交 ' + fmt(premium(g)) + '，交二十年。',
      choices: [
        { t: '說再考慮考慮', canon: true, fx: (g) => { g.remember('evIns', 'no'); }, res: '茶喝完了，他說不急，有需要隨時找他。' },
        { t: '買', dev: 10, fx: (g) => { const p = premium(g); CN.pay(g, p); g.remember('evIns', 'bought'); g.remember('evInsAmt', p); }, res: (g) => '你簽了字，第一年交了 ' + fmt(g.recall('evInsAmt')) + '。他說，這錢最好一輩子用不上。' },
        { t: '只買一份幾百塊的醫療險', dev: 10, fx: (g) => { CN.pay(g, 600); g.remember('evIns', 'cheap'); }, res: '一年六百。老同學有點失望，還是幫你辦好了。' },
      ] },
  ]);

  JY.addEncounters([
    { id: 'e_rent_offer', y: Y, minAge: 22, maxAge: 60, t: '房東賣房', cond: (g) => g.recall('evRentOffer') === true && !['own', 'mortgage'].includes(g.recall('house')) && money(g),
      text: (g) => '退休老師房東又來問了一次：這房子賣給你，' + fmt(offerPrice(g) * 1e4) + '，比市價便宜一成，首付可以分兩年給。',
      choices: [
        { t: '買下來，背上房貸', dev: 15, cond: (g) => cash(g) >= offerDown(g), fx: (g) => { CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('evRentOffer', 'bought'); g.stat('心情', 4); },
          res: (g) => '首付 ' + fmt(offerDown(g)) + '。籤合同那天，房東把一串鑰匙交給你，說陽臺上的花記得澆。' },
        { t: '東拼西湊，借錢付首付', dev: 20, cond: (g) => cash(g) < offerDown(g), fx: (g) => { const short = Math.max(0, offerDown(g) - Math.max(0, cash(g))); CN.earn(g, short); CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('debt', (Number(g.recall('debt')) || 0) + short / 1e4); g.remember('evRentOffer', 'bought'); g.stat('心情', 2); },
          res: '你打了一圈電話，借齊了首付。籤合同那天，房東把一串鑰匙交給你，說陽臺上的花記得澆。' },
        { t: '謝謝她，還是租著', canon: true, fx: (g) => { g.remember('evRentOffer', 'declined'); }, res: '房子賣給了別人。搬走那天，老師給你寫了一張卡片。' },
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
      kept: { t: '那隻瘸腿的小狗長成了一條大黃狗。每天放學，它都蹲在路口等你。', fx: (g) => g.stat('心情', 3) },
      fed: { t: '路口那隻瘸腿的狗，被一戶賣早點的人家收養了。你每天路過，它都衝你搖尾巴。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_dog2', (g) => [g.recall('evDog'), g.since('evDog')], '老狗', 13, 18, {
      kept: { t: '大黃老了，走不動了。那天你回家，它在門口趴著，等到你摸了摸它的頭，才閉上眼睛。', fx: (g) => g.stat('心情', -4) },
    }),
    echo('e_echo_wallet', (g) => [g.recall('evWallet'), g.since('evWallet')], '錢包', 1, 9, {
      returned: { t: '錢包的主人是個外賣騎手，那四百塊是他半個月的飯錢。他給學校送來一面錦旗，上面寫著你的名字。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); } },
      kept: { t: '學校的公告欄上貼了一張尋物啟事：外賣騎手，丟失錢包，內有半個月飯錢。你在啟事前站了很久。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_aihw', (g) => [g.recall('evAiHw'), g.since('evAiHw')], '考試', 1, 9, {
      copy: { t: '期中考試，考場裡沒有 AI。你盯著卷子，發現自己連題目都看不太懂。', fx: (g) => { g.stat('学识', -3); g.stat('心情', -2); } },
      learn: { t: '期中考試，最後一道大題你做出來了。是那天晚上 AI 提示過的那種解法。', fx: (g) => g.stat('学识', 2) },
      self: { t: '期中考試，你的分數不算最高，可老師說你的解題步驟是全班最乾淨的。', fx: (g) => { g.stat('学识', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_game', (g) => [g.recall('evGame'), g.since('evGame')], '賬號', 2, 13, {
      hooked: { t: '你的遊戲賬號排名越來越高，成績單上的排名越來越低。家長會後，家裡把網線拔了。', fx: (g) => { g.stat('学识', -3); g.stat('人缘', -1); } },
      quit: { t: '同學們還在聊那款遊戲，你已經插不上話了。不過你多讀完了兩本書。', fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); } },
    }),
    echo('e_echo_bully', (g) => [g.recall('evBully'), g.since('evBully')], '那個同學', 8, 18, {
      stood: { t: '當年在廁所門口被堵的那個同學加了你的好友。他說他現在是一名警察，那件事他一直記著。', fx: (g) => { g.stat('人缘', 3); g.rel('老同學', '當年被欺負的同學', '後來當了警察'); } },
      told: { t: '你在街上碰見當年被欺負的那個同學，他請你吃了一碗麵，說那天謝謝你去叫了老師。', fx: (g) => g.stat('人缘', 1) },
      passed: { t: '同學聚會上，當年被欺負的那個同學坐在角落。他看見你，客氣地笑了笑，沒有說話。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_stage', (g) => [g.recall('evStage'), g.since('evStage')], '舞臺', 3, 12, {
      hit: { t: '那次相聲以後，學校每次有活動都叫你上臺。你不再怕人多的地方了。', fx: (g) => { g.stat('人缘', 2); g.stat('事业', 1); } },
      shy: { t: '那次上臺唱歌的班長，後來成了學校的主持人。每次看她站在臺上，你都想，那天要是舉了手會怎樣。', fx: (g) => g.stat('心情', -1) },
      flop: { t: '那次忘詞的事，同學們早忘了。只有你還記得。後來每次要當眾說話，你都會提前寫好稿子。', fx: (g) => g.stat('学识', 1) },
    }),
    echo('e_echo_concert', (g) => [g.recall('evConcert'), g.since('evConcert')], '散場的朋友', 3, 17, {
      online: { t: '那個歌手宣佈退出了。最後一場演唱會，你還是在網上看的。', fx: (g) => g.stat('心情', -2) },
      went: { t: '演唱會上認識的那個人，後來成了你最常聊天的朋友。你們約好下一場還一起去。', fx: (g) => { g.stat('人缘', 2); g.rel('網友', '演唱會上認識的朋友'); } },
    }),
    echo('e_echo_scam', (g) => [g.recall('evScam'), g.since('evScam')], '反詐', 1, 17, {
      lost: { t: '你在反詐宣傳的展板上看見了那個群名。展板上寫著：涉案金額兩百餘萬，受害者多為學生。', fx: (g) => { g.stat('学识', 2); g.stat('心情', -1); } },
      reported: { t: '派出所打來電話：那個刷單團伙被抓了，你提供的線索有用。被騙的學生，追回了大半的錢。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 3); } },
      spotted: { t: '家族群裡，表姑說她差點被一個刷單群騙了，多虧想起你發的截圖。', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_loan', (g) => [g.recall('evLoan'), g.since('evLoan')], '借出去的錢', 2, 22, {
      lent: { t: (g) => (g.recall('evLoanBack') ? '那個朋友把 ' + fmt(g.recall('evLoanAmt')) + ' 還了，還多轉了兩千，說是利息。他家裡的事已經過去了。' : '借出去的 ' + fmt(g.recall('evLoanAmt')) + '，一直沒有還。他的頭像，後來變成了灰色。'),
        fx: (g) => { const back = g.rnd() < 0.6; g.remember('evLoanBack', back); if (back) { CN.earn(g, (Number(g.recall('evLoanAmt')) || 0) + 2000); g.stat('人缘', 2); } else { g.stat('心情', -3); } } },
      half: { t: (g) => '那個朋友把借你的 ' + fmt(g.recall('evLoanAmt')) + ' 還了，說另一半是別人借的。他沒再找過你，你也沒再找過他。', fx: (g) => { CN.earn(g, Number(g.recall('evLoanAmt')) || 0); g.stat('人缘', -1); } },
      helped: { t: '那個朋友家裡的事扛過去了。他說那天你陪他跑銀行，比借錢給他還管用。現在每年過年，他都第一個給你打電話。', fx: (g) => g.stat('人缘', 3) },
      refused: { t: '你聽說那個朋友家裡的事，最後是另一個朋友幫著扛過去的。他們現在常在一起喝酒。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_reunion', (g) => [g.recall('evReunion'), g.since('evReunion')], '老同學', 2, 27, {
      went: { t: (g) => (working(g) ? '同學會上重新聯絡上的一個老同學，給你介紹了一單生意，你賺了 ' + fmt(10000) + '。你們說好以後常走動。' : '同學會上重新聯絡上的一個老同學，約你每個週末去河邊釣魚。你們說好以後常走動。'),
        fx: (g) => { if (working(g)) CN.earn(g, 10000); g.stat('人缘', 2); g.rel('老同學', '同學會上重逢的老同學'); } },
      skip: { t: '你從別人嘴裡聽說，老同學裡有人已經不在了。那次同學會，是他最後一次露面。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_viral', (g) => [g.recall('evViral'), g.since('evViral')], '粉絲', 2, 20, {
      ride: { t: (g) => (g.recall('evViralEarn') ? '你的賬號做起來了。這一年光廣告就進賬 ' + fmt(g.recall('evViralEarn')) + '。' : '粉絲漲到一個數，就再也不動了。你每天對著鏡頭說話，越來越不知道該說什麼。'),
        fx: (g) => { const up = g.s('事业') >= 40; const e = up ? round(inc(g) * 0.4, 1000) : 0; g.remember('evViralEarn', e); if (up) CN.earn(g, e); else g.stat('心情', -3); } },
      deleted: { t: '有個陌生人發來私信，說當年那條影片他存了下來，看了很多遍。他問你為什麼刪了。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_faint', (g) => [g.recall('evFaint'), g.since('evFaint')], '那個人', 1, 17, {
      cpr: { t: '一個陌生號碼打來電話。是地鐵上倒下的那個人，他的女兒剛考上大學。他說，沒有你，他看不到這一天。', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); } },
      tried: { t: '你在新聞裡看到，那天地鐵上倒下的人被救回來了。新聞裡說，是一位乘客先做了心肺復甦。', fx: (g) => g.stat('心情', 4) },
      called: { t: '地鐵站貼出一張感謝信：感謝那天早高峰第一個喊人、打急救電話的乘客。你在信前站了一會兒。', fx: (g) => g.stat('心情', 2) },
      away: { t: '那節車廂，你後來再也沒坐過。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_lottery', (g) => [g.recall('evLottery'), g.since('evLottery')], '彩票', 1, 19, {
      won: { t: '中獎的事沒瞞住。這一年，你多了很多親戚。', fx: (g) => { g.stat('人缘', -2); g.stat('心情', -1); } },
      never: { t: '樓下彩票站出了個大獎，中獎號碼正好是你的生日。你站在門口看了半天紅榜，笑了笑，回家做飯去了。', fx: (g) => g.stat('心情', -1) },
      habit: { t: '每個星期兩注彩票，你堅持了好多年。一次也沒中過大獎，但每個開獎的晚上，你都過得很有盼頭。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_rain', (g) => [g.recall('evRain'), g.since('evRain')], '錦旗', 1, 19, {
      helped: { t: (g) => '外賣站點收到一面錦旗，說找一個暴雨天扶老人的騎手。站長一看監控，是你。那個月你拿了全站的好評獎，獎金 ' + fmt(1000) + '。', fx: (g) => { g.stat('人缘', 3); CN.earn(g, 1000); } },
      rushed: { t: '那次摔的膝蓋，一到陰雨天就疼。', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_hop', (g) => [g.recall('evHop'), g.since('evHop')], '那次跳槽', 2, 26, {
      hopped: { t: (g) => (g.recall('evHopLuck') ? '跳槽去的那家公司上市了。你的期權換成了 ' + fmt(round(CN.price(g) * 0.2 * 1e4, 10000)) + '，夠付一套房的首付。' : '跳槽去的那家公司裁員了，名單上有你。好在賠償金不少，你歇了兩個月，又找到了下一份。'),
        fx: (g) => { const up = g.rnd() < 0.4; g.remember('evHopLuck', up); if (up) CN.earn(g, round(CN.price(g) * 0.2 * 1e4, 10000)); else { g.stat('事业', -3); g.stat('心情', -3); } } },
      raise: { t: '老闆升了，走之前把你推薦給了接班的人。', fx: (g) => g.stat('事业', 4) },
      cold: { t: '那次談加薪以後，你的專案越來越少。年底，你自己走了。新公司的同事都很好相處。', fx: (g) => { g.stat('事业', -3); g.stat('心情', -1); } },
    }),
    echo('e_echo_rent', (g) => [g.recall('evRent'), g.since('evRent')], '搬家以後', 2, 22, {
      moved: { t: '新住處樓下的菜地，是一個大爺種的。他常把吃不完的菜掛在你門把手上。', fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
      haggled: { t: '那個退休老師房東說要賣房了，問你想不想買，價錢好商量。', fx: (g) => { g.stat('心情', 2); g.remember('evRentOffer', true); } },
    }),
    echo('e_echo_rentoffer', (g) => [g.recall('evRentOffer'), g.since('evRentOffer')], '陽臺的花', 2, 24, {
      bought: { t: '陽臺上那盆老房東留下的花開了。你拍了張照片發給她，她回了一個大大的笑臉。', fx: (g) => g.stat('心情', 3) },
      declined: { t: '你路過那棟樓，抬頭看了一眼。陽臺上換了別人家的花，也開得很好。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_gift', (g) => [g.recall('evGift'), g.since('evGift')], '人情', 3, 25, {
      close: { t: '你家裡有事那天，第一個到的是當年你包了大紅包的那個朋友。他什麼也沒問，挽起袖子就幹活。', fx: (g) => g.stat('人缘', 3) },
      skip: { t: '你有事想找人幫忙，翻遍了通訊錄，不知道該打給誰。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_nephew', (g) => [g.recall('evNephew'), g.since('evNephew')], '表姐家的孩子', 3, 35, {
      helped: { t: '表姐家的孩子在你那裡轉正了，後來還升了組長。過年回去，表姐拉著你的手，非要你多喝一杯。', fx: (g) => { g.stat('人缘', 3); g.rel('外甥', '表姐家的孩子', '在你那裡實習過'); } },
      declined: { t: '表姐家的孩子自己找到了工作，幹得不錯。表姐說起這事，語氣裡有點什麼。', fx: (g) => g.stat('人缘', -1) },
    }),
    echo('e_echo_check', (g) => [g.recall('evCheck'), g.since('evCheck')], '複查', 2, 32, {
      ignored: { t: '這一年你總覺得累。再去醫院的時候，醫生看著片子，問你為什麼不早點來。', fx: (g) => { g.stat('健康', -12); g.stat('心情', -4); } },
      checked: { t: '定期複查，指標一直平穩。醫生說你是她見過最聽話的病人。', fx: (g) => g.stat('健康', 2) },
    }),
    echo('e_echo_run', (g) => [g.recall('evRun'), g.since('evRun')], '跑步', 2, 22, {
      cheered: { t: '那個跑馬拉松的朋友又來叫你：明年一起跑吧。你想了想，買了一雙跑鞋。', fx: (g) => g.stat('健康', 2) },
      ran: { t: '跑步成了你的習慣。每週三次，雷打不動。體檢的時候，醫生說你的心肺比同齡人年輕十歲。', fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); } },
    }),
    echo('e_echo_stall', (g) => [g.recall('evStall'), g.since('evStall')], '夜市', 1, 21, {
      good: { t: (g) => '夜市的攤子越擺越熟，這一年掙了 ' + fmt(15000) + '。你給攤子起了個名字，掛了一塊小燈牌。', fx: (g) => { CN.earn(g, 15000); g.stat('健康', -1); } },
      no: { t: '那個擺攤的朋友攢夠了錢，開了一家小店。開業那天，他請你去吃了一頓，說當年要是你也來就好了。', fx: (g) => g.stat('人缘', 1) },
      bad: { t: '夜市整頓，攤子擺不下去了。剩下的兩箱烤腸，你吃了一個月。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_invest', (g) => [g.recall('evInvest'), g.since('evInvest')], '那隻基金', 2, 27, {
      chased: { t: (g) => { const got = Number(g.recall('evInvestGot')) || 0, amt = Number(g.recall('evInvestAmt')) || 0;
        if (!got) return '你早就把那筆錢取出來了。那隻基金後來怎麼樣，你沒再看。';
        return got >= amt ? '那隻基金漲漲跌跌。你在一次大漲後全賣了：投進去 ' + fmt(amt) + '，取出來 ' + fmt(got) + '，心裡痛快了好幾天。' : '那隻基金跌跌撞撞。你受不了，全賣了：投進去 ' + fmt(amt) + '，只剩 ' + fmt(got) + '。你把軟體卸了，又裝上，又卸了。'; },
        fx: (g) => { const cur = Number(g.recall('invest')) || 0; g.remember('evInvestGot', cur); if (cur > 0) CN.withdraw(g); } },
      dca: { t: (g) => ((Number(g.recall('invest')) || 0) > 0 ? '你重新裝上那個軟體，看了一眼理財賬戶：' + fmt(g.recall('invest')) + '。不多，可比存銀行多出一截。' : '你重新裝上那個軟體，才想起定投的錢早就取出來用了。'), fx: (g) => g.stat('心情', 1) },
      saved: { t: '同事追的那隻基金跌了一半，午飯的時候沒人再提。你的錢還在銀行裡，一分沒少。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_cat', (g) => [g.recall('evCat'), g.since('evCat')], '三花', 12, 32, {
      adopted: { t: '那隻三花陪了你十二年。最後那幾天，它總是趴在你的拖鞋上。', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_cat2', (g) => [g.recall('evCat'), g.since('evCat')], '貓', 2, 22, {
      adopted: { t: '三花胖了一圈，每天傍晚蹲在門口等你回家。你一開門，它就躺下露出肚皮。', fx: (g) => g.stat('心情', 2) },
      rehomed: { t: '業主群裡，領走小貓的幾戶人家常發照片。五隻小貓都長大了，有一隻還當上了一家小賣部的“店長”。', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_neighbor', (g) => [g.recall('evNeighbor'), g.since('evNeighbor')], '鄰居', 2, 24, {
      friend: { t: '樓上的老太太成了你家的常客。你不在家那陣子，是她幫你收的快遞，還順手把你陽臺的花澆了。', fx: (g) => { g.stat('人缘', 2); g.rel('鄰居', '樓上的老太太'); } },
      feud: { t: '你家水管漏水，水滲到了樓下。來敲門的，正好是樓上那家人。他們看了你一眼，幫你把總閥關上了。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_witness', (g) => [g.recall('evWitness'), g.since('evWitness')], '證詞', 1, 21, {
      testified: { t: '那場車禍的官司判了。法官採信了你的證詞，受傷的人拿到了賠償。他的家人給你寄來一箱老家的蘋果。', fx: (g) => { g.stat('人缘', 3); g.set('evWitness'); } },
    }),
    echo('e_echo_vol', (g) => [g.recall('evVol'), g.since('evVol')], '志願者', 4, 20, {
      no: { t: '社群那位退休的老鉗工，後來由一個大學生陪著。你在樓下碰見他們下棋，老人笑得很大聲。', fx: (g) => g.stat('心情', 1) },
      yes: { t: '每週兩個小時，你堅持了好幾年。社群給你發了一個小小的證書，你夾在了相簿裡。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.set('evVolunteer'); } },
    }),
    echo('e_echo_ill', (g) => [g.recall('evIll'), g.since('evIll')], '同桌', 1, 31, {
      visited: { t: '你的初中同桌病好了。他給你寄來一盒蠶繭，附了一張字條：這回養成了。', fx: (g) => { g.stat('心情', 4); g.rel('老同學', '初中同桌'); } },
      shared: { t: '你聽說初中同桌的病好了。眾籌的連結，你一直沒刪。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_kid', (g) => [g.recall('evKid'), g.since('evKid')], '那個孩子', 12, 28, {
      waited: { t: '一個高中生在街上叫住你。他說他就是當年商場門口走丟的那個孩子，媽媽一直留著那張照片。', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 2); } },
    }),
    echo('e_echo_village', (g) => [g.recall('evVillage'), g.since('evVillage')], '老家', 2, 22, {
      live: { t: '老家的果子有了自己的牌子，村裡蓋了冷庫，年輕人回來了幾個。村口的路，是今年新修的。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); } },
      shared: { t: '老家的果子還是賣不上價。村支書打電話來，沒提這事，只問你什麼時候回來。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_teacher', (g) => [g.recall('evTeacher'), g.since('evTeacher')], '老師', 1, 26, {
      visited: { t: '班主任走了。她的家人整理遺物時，找到一沓舊作文字，裡面有你的一本，上面的紅筆批註還很清楚。', fx: (g) => { g.stat('心情', -2); g.stat('学识', 1); } },
      called: { t: '你聽說班主任走了。那通電話，是你們最後一次說話。', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_frienddiv', (g) => [g.recall('evFriendDiv'), g.since('evFriendDiv')], '朋友', 2, 32, {
      listened: { t: '那個離婚的朋友，重新成了家。婚禮上，他讓你坐第一桌。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); } },
      persuade: { t: '那個朋友到底還是離了。他說你勸得對，可他做不到。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_storm', (g) => [g.recall('evStorm'), g.since('evStorm')], '颱風之後', 1, 11, {
      helped: { t: '樓下的阿婆逢人就說，颱風那天是你幫她釘的窗戶。整棟樓的人見了你都很客氣。', fx: (g) => g.stat('人缘', 3) },
      home: { t: '颱風那年倒下的兩棵樹，原地種上了小樹苗。今年春天，它們抽出了新葉子。', fx: (g) => g.stat('心情', 1) },
      reckless: { t: '你那張浪比樓高的照片，被一家雜誌買去當了封面，給了你一筆稿費。你把照片洗出來，掛在牆上。', fx: (g) => { g.stat('心情', 2); CN.earn(g, 3000); } },
      hurt: { t: '那次被浪拍傷的肩膀，留下了舊傷。抬手拿高處的東西，你總要先停一下。', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_snow', (g) => [g.recall('evSnow'), g.since('evSnow')], '凍梨', 1, 9, {
      swept: { t: '這一年冬天，樓上大爺家的凍梨又給你送來了一兜。大爺說，你掃雪那年，他記一輩子。', fx: (g) => g.stat('人缘', 2) },
      fun: { t: '你翻到那張雪人的照片，胡蘿蔔鼻子已經歪了。你笑了很久。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_aicut', (g) => [g.recall('evAiCut'), g.since('evAiCut')], '那一輪最佳化', 1, 23, {
      reskill: { t: '最佳化名單出來了，沒有你。新系統出了問題，部門裡只有你能看懂報警。', fx: (g) => g.stat('事业', 5) },
      stay: { t: '最佳化名單出來了。你沒被裁，被調去了一個邊緣的崗位，工資降了兩成。', fx: (g) => { g.stat('事业', -4); g.stat('心情', -3); } },
      left: { t: '你自己接活的第二年，收入總算追上了原來的工資。時間是自己的了，焦慮也是。', fx: (g) => { g.stat('事业', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_robot', (g) => [g.recall('evRobot'), g.since('evRobot')], '機器人', 3, 38, {
      waited: { t: '機器人降價了一半。你又去了一趟家電城，那臺你摸過手的型號已經停產了。', fx: (g) => g.stat('心情', -1) },
      bought: { t: (g) => (has(g, 'mo') ? '家裡的機器人學會了做你媽拿手的那道菜。你拍了影片發給她，她說鹽放多了。' : '家裡的機器人照著你說的，做出了媽媽當年拿手的那道菜。第一次端上桌，你愣了一下。'), fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
    }),
    echo('e_echo_newyear', (g) => [g.recall('evNewYear'), g.since('evNewYear')], '過年', 1, 19, {
      stay: { t: (g) => (has(g, 'fa') && has(g, 'mo') ? '又到年關。媽媽在電話裡說，今年你爸專門殺了一隻雞，留著等你。' : has(g, 'mo') ? '又到年關。媽媽在電話裡說，今年她灌了一大串香腸，留著等你。' : has(g, 'fa') ? '又到年關。爸爸在電話裡說，今年他專門殺了一隻雞，留著等你。' : '又到年關。你給老家的親戚們挨個打了電話，大家都問你今年回不回。'),
        fx: (g) => g.stat('心情', -1) },
      home: { t: '又是臘月，你早早定了回家的票。這回坐上了座位，一路睡到了站。', fx: (g) => g.stat('心情', 2) },
      brought: { t: (g) => (parentsAlive(g) ? parentsWord(g) + '回去以後，逢人就說城裡的煙火。那天的照片洗出來，掛在了老家的牆上。' : '你翻到那年接爸媽來過年的照片，煙火底下，兩個人都笑得眯起了眼。'), fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_lecture', (g) => [g.recall('evLecture'), g.since('evLecture')], '保健品', 1, 61, {
      bought: { t: '那家保健品公司被查了，新聞裡說是騙老人的。你那一抽屜的藥，家裡人幫你扔了。', fx: (g) => { g.stat('心情', -3); g.stat('人缘', 1); } },
      exposed: { t: '小區門口再也沒人來發雞蛋了。鄰居們說，是你那一嗓子把他們嚇跑的。', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_dance', (g) => [g.recall('evDance'), g.since('evDance')], '傍晚', 3, 58, {
      watched: { t: (g) => (g.age >= 85 ? '傍晚你還是去那片空地坐一坐。音樂響起來，你的手跟著在膝蓋上打拍子。' : '傍晚跳舞的那群人，換了一撥又一撥。你還坐在那張長椅上，聽得出每一首歌。'), fx: (g) => g.stat('心情', 1) },
      joined: { t: (g) => (g.age < 80 ? '你成了廣場舞隊的領舞。每天傍晚六點半，音樂一響，你就是全場最精神的那個。' : g.age < 85 ? '快的舞你跳不動了，就站在最後一排慢慢比劃。隊裡的人都叫你老師。' : '你跳不動了，傍晚還是會去那片空地。她們跳完，總有人過來陪你說幾句話，再扶你回家。'),
        fx: (g) => { g.stat('健康', g.age < 80 ? 3 : 1); g.stat('人缘', 2); } },
    }),
    echo('e_echo_tech', (g) => [g.recall('evTech'), g.since('evTech')], '影片', 1, 67, {
      drawer: { t: (g) => (gks(g).length ? '孫輩' : '孩子') + '打來影片，你的老手機接不起來。等你找到那副眼鏡，電話已經掛了。', fx: (g) => g.stat('心情', -2) },
      learned: { t: (g) => '你戴上那副眼鏡，' + (gks(g).length ? '孫輩' : '孩子') + '的臉就在眼前。你們每個星期影片兩次，你學會了發表情。', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); } },
    }),

    // —— 钱的回响 ——
    echo('e_echo_tip', (g) => [g.recall('evTip'), g.since('evTip')], '那隻股票', 2, 27, {
      in: { t: (g) => (g.recall('evTipUp') ? '表舅說的那隻股票真漲了。你賣掉的時候，' + fmt(g.recall('evTipAmt')) + ' 變成了 ' + fmt(Number(g.recall('evTipAmt')) * 1.8) + '。表舅在飯桌上說了一晚上。' : '表舅說的大訊息一直沒來，股價跌了一大半。你割肉賣掉，' + fmt(g.recall('evTipAmt')) + ' 只拿回 ' + fmt(Number(g.recall('evTipAmt')) * 0.4) + '。過年再見到表舅，他沒提這事。'),
        fx: (g) => { const up = g.rnd() < 0.3; g.remember('evTipUp', up); const a = Number(g.recall('evTipAmt')) || 0; CN.earn(g, a * (up ? 1.8 : 0.4)); g.stat('心情', up ? 3 : -3); } },
      little: { t: (g) => '那隻股票跌了一大半。你那 ' + fmt(g.recall('evTipAmt')) + ' 只剩下零頭，好在只是一小筆。你記住了：飯桌上的訊息，聽聽就好。', fx: (g) => { CN.earn(g, (Number(g.recall('evTipAmt')) || 0) * 0.4); g.stat('学识', 1); } },
      no: { t: '表舅說的那隻股票，後來跌了一大半。飯桌上，再沒人提起這事。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_high', (g) => [g.recall('evHigh'), g.since('evHigh')], '那款理財', 1, 41, {
      in: { t: (g) => '那款理財的群一夜之間解散了。警察說，這個平臺捲走了好幾個億。你那 ' + fmt(g.recall('evHighAmt')) + '，只追回來一成。', fx: (g) => { CN.earn(g, (Number(g.recall('evHighAmt')) || 0) * 0.1); g.stat('心情', -4); } },
      asked: { t: '小區裡好幾個老鄰居買了那款理財，錢都沒了。你在樓下陪他們坐了一下午，慶幸當時多問了一句。', fx: (g) => { g.stat('心情', 1); g.stat('人缘', 1); } },
      no: { t: '新聞裡說，一個“年化百分之十五”的理財平臺跑路了。你想起那個被你刪掉的人，把新聞轉到了家族群裡。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_netloan', (g) => [g.recall('evNetLoan'), g.since('evNetLoan')], '網貸', 2, 20, {
      took: { t: (g) => '那筆網貸利滾利，兩萬滾成了 ' + fmt(26000) + '。催收電話打到了你朋友那裡。你咬著牙還了一年多，刪掉了那個軟體。', fx: (g) => { g.stat('心情', -3); g.stat('人缘', -1); } },
      family: { t: (g) => '你把借家裡的 ' + fmt(5000) + ' 還了回去，還多買了兩箱水果。' + (parentsAlive(g) ? parentsWord(g) + '嘴上說你見外，水果當天就分給了鄰居。' : ''), fx: (g) => { CN.pay(g, 5000); g.stat('心情', 2); } },
      no: { t: '那個月你天天自己煮麵。月底發了工資，你給自己加了一個雞腿，覺得比什麼都香。', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_windfall', (g) => [g.recall('evWindfall'), g.since('evWindfall')], '那兩萬塊', 2, 24, {
      saved: { t: '那兩萬塊一直沒動。後來家裡急用錢的那次，它剛好頂上。', fx: (g) => g.stat('心情', 2) },
      trip: { t: (g) => (CN.alone(g) ? '你翻到那次旅行的照片，海邊的風把你的頭髮吹得亂七八糟。你把它設成了手機屏保。' : '你翻到那次旅行的照片，一家人擠在鏡頭前，每個人都笑得很傻。你把它設成了手機屏保。'), fx: (g) => g.stat('心情', 3) },
      parents: { t: (g) => (parentsAlive(g) ? parentsWord(g) + '用那筆錢換了一臺新冰箱，冰箱門上貼著你小時候的照片。剩下的，說是給你存著。' : '你整理老家的櫃子，翻出一個信封，裡面是那兩萬塊，一分沒動。信封上寫著你的名字。'), fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_car', (g) => [g.recall('evCar'), g.since('evCar')], '車', 2, 26, {
      new: { t: (g) => (parentsAlive(g) ? '這一年你開車帶' + parentsWord(g) + '回了一趟老家，後備廂塞滿了吃的。一路上，他們一直誇車開得穩。' : kids(g).length ? '週末你開車帶孩子去郊外，後座上傳來一路的歌聲。' : '你開車去了一趟很遠的海邊，一路上放著年輕時愛聽的歌。'), fx: (g) => { g.stat('心情', 3); g.stat('人缘', 1); } },
      used: { t: '那輛二手車小毛病不斷，修車鋪的老闆都認識你了。可它一次也沒把你扔在半路上。', fx: (g) => g.stat('心情', 2) },
      no: { t: '下暴雨的那天晚上，你在路邊等了四十分鐘才打到車。司機是個話多的大叔，一路給你講他女兒考上大學的事。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_ins', (g) => [g.recall('evIns'), g.since('evIns')], '保單', 8, 36, {
      bought: { t: (g) => (g.recall('evInsHit') ? '你住院做了一個手術。保險公司賠了 ' + fmt(300000) + '，你在病床上翻出那位老同學的電話，說了聲謝謝。' : '保單交了八年，一次也沒用上。你說，這樣最好。'),
        fx: (g) => { const hit = g.s('健康') < 60; g.remember('evInsHit', hit); if (hit) CN.earn(g, 300000); else CN.pay(g, (Number(g.recall('evInsAmt')) || 3000) * 2); } },
      cheap: { t: (g) => (g.s('健康') < 70 ? '那年住院，那份幾百塊的醫療險報了 ' + fmt(20000) + '。你說，這六百塊花得值。' : '那份幾百塊的醫療險，你年年續著，一直沒用上。'), fx: (g) => { if (g.s('健康') < 70) CN.earn(g, 20000); } },
      no: { t: (g) => (g.s('健康') < 60 ? '你住了一次院，花了 ' + fmt(80000) + '，全是自己掏的。出院那天，你想起了那次喝茶。' : '那個賣保險的老同學轉了行，開了一家茶館。你去過兩次，他都沒收你的錢。'), fx: (g) => { if (g.s('健康') < 60) CN.pay(g, 80000); g.stat('人缘', 1); } },
    }),
  ]);

  /* ---------- 宠物、日子里的小事：每一世读到的细节不一样 ----------
   * pk(g, [...], 盐) 在同一年里固定、换一世就变，所以正文和结果读到的是同一个名字、同一个数。
   * 回响里要用到的细节（名字、金额、种类），在选项里 remember 下来（键名都以 ev 开头）。 */
  const seedOf = (g) => { const c = JY.byId[g.me]; const s = ((c && c.name) || '') + (g.recall('city') || ''); let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; };
  const rr = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + seedOf(g) * 0.0137) * 43758.5453; return x - Math.floor(x); };
  const pk = (g, arr, salt) => arr[Math.floor(rr(g, salt) * arr.length)];
  const hiEdu = (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu'));
  const pet = (g) => CN.pet(g);
  const petName = (g) => (pet(g) ? pet(g).name : '它');
  const PET_W = { dog: '狗', cat: '貓', bird: '鳥', fish: '魚', rabbit: '兔子' };
  // 宠物店里的品种：[种类, 价格]
  const BREED = { '布偶貓': ['cat', 8000], '英短': ['cat', 3000], '暹羅貓': ['cat', 4000], '柯基': ['dog', 6000], '柴犬': ['dog', 7000], '比熊': ['dog', 3000], '金毛': ['dog', 4000] };
  const breed = (g) => pk(g, Object.keys(BREED), 41);
  const petYear = (g, kind) => round((kind === 'dog' ? 6000 : 4000) * (tier(g) <= 1 ? 1.3 : 1), 500);
  const crop = (g) => pk(g, { 西南: ['獼猴桃', '茶葉', '花椒'], 华南: ['荔枝', '百香果', '茶葉'], 华东: ['草莓', '茶葉', '藍莓'], 华中: ['小龍蝦', '臍橙', '蓮藕'], 华北: ['蘋果', '小米', '大棚蔬菜'], 东北: ['大米', '木耳', '藍莓'], 西北: ['蘋果', '枸杞', '牛羊肉'] }[g.recall('region')] || ['大棚蔬菜', '水果'], 42);
  const myPay = (g) => (CN.jobPay && job(g) ? CN.jobPay(g, job(g)) : round(inc(g) / 12, 100));
  const DEPOSIT = { 1: 10000, 2: 5000, 3: 3000, 4: 2000, 5: 1000 };
  const stakeAmt = (g) => round(Math.min(100000, cash(g) * 0.25), 10000);
  const roadAmt = (g) => round(Math.min(20000, Math.max(1000, cash(g) * 0.03)), 1000);
  const vetBill = (g) => round((tier(g) <= 2 ? 6000 : tier(g) === 3 ? 3000 : 1500) * (1 + rr(g, 47)), 500);

  JY.addEncounters([
    // —— 宠物：住在哪儿、有没有钱，碰到的不一样 ——
    { id: 'e_pet_shop', y: Y, minAge: 22, maxAge: 60, t: '寵物店',
      cond: (g) => money(g) && !pet(g) && (big(g) || g.recall('family') === 'rich') && g.recall('hhPlace') !== 'dorm',
      text: (g) => { const b = breed(g), k = BREED[b]; return pk(g, ['下班路過一家寵物店，', '週末逛商場，', '小區門口新開了一家寵物店，'], 43) + '玻璃後面有一隻' + b + '，標價 ' + fmt(k[1]) + '。店員說，打針、驅蟲另算，一年吃喝看病還要 ' + fmt(petYear(g, k[0])) + ' 左右。' + (CN.alone(g) ? '你一個人住，晚上回家沒人說話。' : ''); },
      choices: [
        { t: (g) => '買下這隻' + breed(g) + '（' + fmt(BREED[breed(g)][1] + 1500) + '，連針帶籠子）', dev: 15, cond: (g) => cash(g) >= BREED[breed(g)][1] * 3,
          fx: (g) => { const b = breed(g), k = BREED[b]; CN.pay(g, k[1] + 1500); CN.adoptPet(g, k[0], pk(g, k[0] === 'cat' ? ['奶糖', '布丁', '可樂', '芝麻'] : ['可樂', '豆包', '元寶', '樂樂'], 44)); g.remember('evPetGet', 'bought'); g.stat('心情', 4); },
          res: (g) => '你給它起名叫' + petName(g) + '。一共花了 ' + fmt(BREED[breed(g)][1] + 1500) + '。回家的路上，它在航空箱裡叫了一路。' },
        { t: '去救助站領養一隻（疫苗、絕育約 ¥800）', dev: 10,
          fx: (g) => { const k = BREED[breed(g)][0]; CN.pay(g, 800); CN.adoptPet(g, k, pk(g, ['小土', '豆包', '二丫', '阿福', '黑妞'], 45)); g.remember('evPetGet', 'shelter'); g.stat('心情', 3); g.stat('人缘', 1); },
          res: (g) => '救助站的志願者來家裡看了一次，才讓你把' + petName(g) + '領走。它是一隻' + PET_W[pet(g).kind] + '，左耳缺了一小塊。疫苗、絕育花了 ¥800。' },
        { t: '算了，沒時間，也怕養不好', canon: true, fx: (g) => { g.remember('evPetGet', 'no'); }, res: '你隔著玻璃看了它一會兒，走了。' },
      ] },
    { id: 'e_pet_village', y: Y, minAge: 12, maxAge: 70, t: '狗崽',
      cond: (g) => tier(g) >= 4 && !pet(g) && g.recall('liveWith') !== 'nursing' && g.recall('hhPlace') !== 'dorm',
      text: (g) => pk(g, ['鄰居家的大黃下了一窩崽，問你要不要抱一隻。', '院門口來了一隻瘦狗，趕了兩回，它又回來了，蹲在那兒看你。', '這陣子村裡丟了兩回雞，隔壁說，該養條看家狗了。'], 46),
      choices: [
        { t: '抱一只回來看家', canon: true, fx: (g) => { CN.adoptPet(g, 'dog', pk(g, ['大黃', '黑子', '虎子', '旺財', '來福'], 48)); g.remember('evPup', 'dog'); g.stat('心情', 3); },
          res: (g) => '你給它起名叫' + petName(g) + '，在門邊墊了個紙箱當窩。頭一夜它哼唧了半宿。' },
        { t: '要一隻貓，抓抓老鼠', dev: 10, fx: (g) => { CN.adoptPet(g, 'cat', pk(g, ['花花', '老虎', '咪咪', '小灰'], 49)); g.remember('evPup', 'cat'); g.stat('心情', 2); },
          res: (g) => '隔壁正好有一窩小貓。你挑了最瘦的那隻，叫它' + petName(g) + '。' },
        { t: '不要，養不過來', dev: 10, fx: (g) => { g.remember('evPup', 'no'); }, res: '那幾只狗崽，過了幾天都被人抱走了。' },
      ] },
    { id: 'e_pet_old', y: Y, minAge: 66, maxAge: 86, t: '做個伴',
      cond: (g) => !pet(g) && !g.recall('pet') && g.recall('liveWith') !== 'nursing',
      text: (g) => [
        '社群在辦流浪動物領養，一隻九歲的老狗趴在籠子邊上，一直看著你。',
        (kids(g).length ? g.name(kids(g)[0]) + '打電話來，說給你買了一隻鸚鵡，會說“吃了嗎”，問你要不要。' : '老年活動中心有人家裡的鸚鵡孵了小鳥，問你要不要一隻。'),
        '樓下的老鄰居住進了養老院，託你照看他養了好些年的貓。',
      ][Math.floor(rr(g, 50) * 3)],
      choices: [
        { t: (g) => ['領回家，做個伴', '要了，掛在陽臺上', '答應，把它接過來'][Math.floor(rr(g, 50) * 3)], dev: 10,
          fx: (g) => { const v = Math.floor(rr(g, 50) * 3); CN.adoptPet(g, ['dog', 'bird', 'cat'][v], ['老黑', '八哥', '老咪'][v]); g.remember('evOldPet', 'yes'); g.stat('心情', 4); g.stat('健康', 1); },
          res: (g) => ({ dog: '老狗走得慢，你也走得慢。每天傍晚你們繞小區一圈，正好。', bird: '鸚鵡頭一個月一句話也不說。有天早上你開窗，它突然說：吃了嗎。', cat: '老貓認生，在櫃頂上待了三天。第四天，它下來蹭了蹭你的褲腿。' }[pet(g).kind]) },
        { t: '算了，怕自己走在它前頭', canon: true, fx: (g) => { g.remember('evOldPet', 'no'); }, res: '你說了聲謝謝，回家把陽臺上的花澆了一遍。' },
      ] },
    { id: 'e_pet_vet', y: Y, minAge: 18, maxAge: 92, t: '寵物醫院',
      cond: (g) => money(g) && !!pet(g) && ['dog', 'cat', 'rabbit'].includes(pet(g).kind) && g.Y - pet(g).y >= 2,
      text: (g) => petName(g) + pk(g, ['吃壞了東西，吐了一晚上', '腿瘸了，一碰就叫', '好幾天不吃飯，蔫蔫地趴著'], 51) + '。寵物醫院說要' + pk(g, ['做個小手術', '住幾天院', '做一套檢查'], 52) + '，先交 ' + fmt(vetBill(g)) + '。',
      choices: [
        { t: (g) => '治，先交 ' + fmt(vetBill(g)), canon: true, cond: (g) => cash(g) >= vetBill(g), fx: (g) => { CN.pay(g, vetBill(g)); g.remember('evVet', 'cure'); g.stat('心情', -1); },
          res: (g) => '你交了 ' + fmt(vetBill(g)) + '。醫生說來得及時。' + petName(g) + '戴著伊麗莎白圈回了家，委屈了好幾天。' },
        { t: (g) => '刷信用卡也要治（' + fmt(vetBill(g)) + '）', dev: 15, cond: (g) => cash(g) < vetBill(g), fx: (g) => { CN.pay(g, vetBill(g)); g.remember('evVet', 'cure'); g.stat('心情', -2); },
          res: (g) => '你刷了卡。' + petName(g) + '住了幾天院，回家那天一直蹭你的手。這筆錢，你分了好幾個月才還上。' },
        { t: (g) => '先開點藥回家養（約 ' + fmt(round(vetBill(g) * 0.2, 100)) + '）', dev: 10, fx: (g) => { CN.pay(g, round(vetBill(g) * 0.2, 100)); g.remember('evVet', 'basic'); g.stat('心情', -2); },
          res: '你拿了藥，每天掰開它的嘴喂。它不肯吃，你就把藥裹在肉裡。' },
      ] },

    // —— 上班的人 ——
    { id: 'e_layoff_rumor', y: Y, minAge: 26, maxAge: 52, t: '傳言', cond: (g) => working(g) && ['office', 'tech', 'sales'].includes(job(g)),
      text: (g) => pk(g, ['茶水間裡有人小聲說', '工作群突然安靜了，有人私下說', '樓下吃飯的時候，隔壁部門的人說'], 53) + '，公司下個月要裁掉' + pk(g, ['兩成', '三成', '一整個部門'], 54) + '的人。你現在一個月約 ' + fmt(myPay(g)) + '。',
      choices: [
        { t: '照常幹活，不瞎想', canon: true, fx: (g) => { g.remember('evRumor', 'calm'); }, res: '你把手頭的報告交了，準點下班。' },
        { t: '悄悄投簡歷，先找好下家', dev: 10, fx: (g) => { g.remember('evRumor', 'hunt'); g.stat('心情', -1); }, res: '你在午休的時候改簡歷，螢幕調得很暗。' },
        { t: '主動申請去最忙的專案組', dev: 15, fx: (g) => { g.remember('evRumor', 'busy'); g.stat('健康', -2); g.stat('事业', 2); }, res: '新專案組的燈每天亮到十一點。你在那兒認識了幾個能幹的人。' },
      ] },
    { id: 'e_wage_owed', y: Y, minAge: 18, maxAge: 60, t: '工錢', cond: (g) => working(g) && ['worker', 'driver', 'freelance'].includes(job(g)) && money(g),
      text: (g) => '老闆拖了你兩個月的工錢，' + fmt(round(myPay(g) * 2, 100)) + '。' + pk(g, ['他說等工程款下來就給。', '人找不著了，電話也不接。', '他說公司週轉不開，先給你打個欠條。'], 55),
      choices: [
        { t: '去勞動監察大隊反映，申請仲裁', dev: 15, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'sue'); g.stat('心情', -1); }, res: '你把工牌、聊天記錄、考勤截圖都列印出來，裝了一個牛皮紙袋。' },
        { t: '跟幾個工友一起去找他', dev: 10, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'group'); g.stat('人缘', 2); }, res: '你們五個人在他辦公室門口等了一下午。他最後出來了，說下個月一定給。' },
        { t: '認了，換個地方幹', canon: true, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'quit'); g.stat('心情', -3); }, res: '你收拾了東西，第二天去了新地方。' },
      ] },
    { id: 'e_partner_stake', y: Y, minAge: 28, maxAge: 55, t: '入股', cond: (g) => money(g) && cash(g) >= 50000,
      text: (g) => '老同學' + pk(g, ['大劉', '阿杰', '小芳', '老周', '胖子', '燕子'], 56) + '要開一家' + pk(g, ['燒烤店', '民宿', '奶茶店', '洗車店', '劇本殺店'], 57) + '，拉你入股，要 ' + fmt(stakeAmt(g)) + '，說一年能分兩成。',
      choices: [
        { t: (g) => '入股 ' + fmt(stakeAmt(g)) + '（成了年年分紅，賠了血本無歸）', dev: 15,
          fx: (g) => { const a = stakeAmt(g); CN.pay(g, a); g.remember('evStakeAmt', a); g.remember('evStakeWho', pk(g, ['大劉', '阿杰', '小芳', '老周', '胖子', '燕子'], 56)); g.remember('evStakeKind', pk(g, ['燒烤店', '民宿', '奶茶店', '洗車店', '劇本殺店'], 57)); g.remember('evStake', 'in'); },
          res: '你轉了錢，他發來一張合夥協議的照片。字很小，你沒細看。' },
        { t: (g) => '少投一點，意思一下（' + fmt(round(stakeAmt(g) / 4, 5000)) + '）', dev: 10,
          fx: (g) => { const a = round(stakeAmt(g) / 4, 5000); CN.pay(g, a); g.remember('evStakeAmt', a); g.remember('evStakeWho', pk(g, ['大劉', '阿杰', '小芳', '老周', '胖子', '燕子'], 56)); g.remember('evStakeKind', pk(g, ['燒烤店', '民宿', '奶茶店', '洗車店', '劇本殺店'], 57)); g.remember('evStake', 'part'); },
          res: '你說手頭緊，轉了一小筆。他說夠意思。' },
        { t: '不入，錢留著', canon: true, fx: (g) => { g.remember('evStake', 'no'); g.remember('evStakeKind', pk(g, ['燒烤店', '民宿', '奶茶店', '洗車店', '劇本殺店'], 57)); }, res: '你說再想想。他說理解，開業那天還給你發了請柬。' },
      ] },
    { id: 'e_village_coop', y: Y, minAge: 24, maxAge: 45, t: '村裡來電', cond: (g) => g.recall('hukou') === 'rural' && working(g) && tier(g) <= 3 && job(g) !== 'boss' && !!g.recall('homeCap'),
      text: (g) => '老家的村支書在群裡發了一條長訊息：村裡要辦' + crop(g) + '基地，' + pk(g, ['縣裡給補貼', '有家公司包收購', '進村的路修通了'], 58) + '，想請在外面的年輕人回去牽頭。他單獨給你打了個電話。',
      choices: [
        { t: (g) => '回去牽頭（' + CN.jobRisk('boss') + '）', dev: 25, check: ['人缘', 50],
          fx: (g) => { const c = crop(g); CN.goHome(g); g.remember('tier', 5); g.remember('workCity', g.recall('homeCap')); g.info('住处', g.recall('homeCap')); CN.setJob(g, 'boss', c + '基地帶頭人'); g.remember('evCoopCrop', c); g.remember('evCoop', 'back'); g.stat('人缘', 4); },
          res: (g) => '你回了村。頭一年，' + g.recall('evCoopCrop') + '基地流轉了兩百畝地，你每天在地頭和縣城之間跑。',
          fail: { fx: (g) => { const c = crop(g); CN.goHome(g); g.remember('tier', 5); g.remember('workCity', g.recall('homeCap')); g.info('住处', g.recall('homeCap')); CN.setJob(g, 'farmer', '回鄉種地'); g.remember('evCoopCrop', c); g.remember('evCoop', 'backFail'); g.stat('心情', -3); },
            res: '你回去了，可幾戶大的人家不肯把地流轉出來，基地沒辦成。你留在村裡，種自家那幾畝。' } },
        { t: '出點錢，人不回去（¥2 萬）', dev: 10, cond: (g) => cash(g) >= 30000, fx: (g) => { CN.pay(g, 20000); g.remember('evCoopCrop', crop(g)); g.remember('evCoop', 'money'); g.stat('人缘', 2); }, res: '你轉了 ¥2 萬，支書在群裡點了你的名。' },
        { t: '不回，在外面挺好', canon: true, fx: (g) => { g.remember('evCoopCrop', crop(g)); g.remember('evCoop', 'no'); }, res: '你回了一句“支援”，又發了個紅包。' },
      ] },
    { id: 'e_deposit', y: Y, minAge: 20, maxAge: 42, t: '押金', cond: (g) => g.recall('house') === 'rent' && money(g),
      text: (g) => '退租那天，房東' + pk(g, ['說牆上多了幾個釘子眼', '說沙發上有塊印子', '說馬桶得換個新的'], 59) + '，押金 ' + fmt(DEPOSIT[tier(g)] || 3000) + ' 只肯退一半。',
      choices: [
        { t: '翻出入住時拍的照片，一分不讓', dev: 10, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'fight'); }, res: '你把手機裡的照片一張張劃給他看。他臉色不太好看。' },
        { t: '找中介和平臺投訴', dev: 10, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'report'); }, res: '你打了三次客服電話，每次都從頭講一遍。' },
        { t: '認了，不想吵', canon: true, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'let'); g.stat('心情', -2); }, res: '你把鑰匙放在桌上，拖著箱子下了樓。' },
      ] },

    // —— 邻里、路上 ——
    { id: 'e_lost_phone', y: Y, minAge: 16, maxAge: 78, t: '手機', cond: (g) => money(g),
      text: (g) => '你把手機落在了' + pk(g, ['計程車後座上', '地鐵座位上', '公園的長椅上', '飯館的桌上'], 60) + '，走出去老遠才發現。',
      choices: [
        { t: '借別人的手機，一遍遍打過去', canon: true, fx: (g) => { g.remember('evPhone', 'call'); }, res: '打到第六遍，有人接了。' },
        { t: '去派出所報失', dev: 10, fx: (g) => { g.remember('evPhone', 'police'); }, res: '民警給你登了記，讓你回去等訊息。' },
        { t: '認了，買個新的（¥3,000）', dev: 10, fx: (g) => { CN.pay(g, 3000); g.remember('evPhone', 'new'); g.stat('心情', -2); }, res: '新手機 ¥3,000。登入的時候，你發現好幾年的照片都沒備份。' },
      ] },
    { id: 'e_umbrella', y: Y, minAge: 16, maxAge: 72, t: '一把傘',
      text: (g) => '下暴雨，' + pk(g, ['公交站', '地鐵口', '便利店門口'], 61) + '有個' + pk(g, ['抱著孩子的女人', '拄拐的老人', '穿校服的學生'], 62) + '沒帶傘，看著雨發愁。你手裡只有一把傘。',
      choices: [
        { t: '把傘塞給對方，自己跑回去', dev: 10, fx: (g) => { g.remember('evUmb', 'gave'); g.stat('健康', -1); g.stat('心情', 2); }, res: '你一路跑回去，鞋裡全是水。' },
        { t: '一起撐著，送一段', canon: true, fx: (g) => { g.remember('evUmb', 'walk'); g.stat('人缘', 1); }, res: '你把傘往那邊歪著，自己溼了半邊肩膀。' },
        { t: '低頭走過去', dev: 5, fx: (g) => { g.remember('evUmb', 'no'); }, res: '你走出幾步，回頭看了一眼。' },
      ] },
    { id: 'e_tutor_kid', y: Y, minAge: 30, maxAge: 75, t: '輔導', cond: (g) => hiEdu(g),
      text: (g) => '樓下' + pk(g, ['張姐', '老李', '王阿姨', '小陳'], 63) + '家的孩子' + pk(g, ['數學', '英語', '作文'], 64) + '跟不上，問你能不能週末幫著看看。',
      choices: [
        { t: '答應，不收錢', canon: true, fx: (g) => { g.remember('evTutor', 'free'); g.stat('人缘', 3); }, res: '每個週六下午，那孩子抱著作業本來敲門。' },
        { t: '答應，按市價收（一次 ¥200）', dev: 10, fx: (g) => { CN.earn(g, 6000); g.remember('evTutor', 'paid'); g.stat('人缘', 1); }, res: '一學期下來，你收了 ¥6,000。孩子的卷子上，紅叉少了一半。' },
        { t: '推了，實在沒時間', dev: 10, fx: (g) => { g.remember('evTutor', 'no'); }, res: '你說最近太忙。對方說沒事，下樓的腳步有點慢。' },
      ] },
    { id: 'e_hometown_road', y: Y, minAge: 35, maxAge: 80, t: '修路', cond: (g) => g.recall('hukou') === 'rural' && money(g) && cash(g) >= 10000,
      text: (g) => '老家要' + pk(g, ['把進村的土路修成水泥路', '在村裡裝一排路燈', '在河上修一座橋'], 65) + '，在外面的人自願出點錢。名字會刻在村口的碑上。',
      choices: [
        { t: (g) => '出 ' + fmt(roadAmt(g)), canon: true, fx: (g) => { const a = roadAmt(g); CN.pay(g, a); g.remember('evRoadAmt', a); g.remember('evRoad', 'gave'); g.stat('人缘', 2); }, res: '你在群裡接龍，寫上了自己的名字。' },
        { t: (g) => '多出一些，出 ' + fmt(roadAmt(g) * 3), dev: 15, cond: (g) => cash(g) >= roadAmt(g) * 10,
          fx: (g) => { const a = roadAmt(g) * 3; CN.pay(g, a); g.remember('evRoadAmt', a); g.remember('evRoad', 'big'); g.stat('人缘', 4); }, res: '支書打電話來，說了好幾遍謝謝。' },
        { t: '不出，沒回去過幾次', dev: 10, fx: (g) => { g.remember('evRoad', 'no'); g.stat('人缘', -2); }, res: '接龍到了一百多號，裡面沒有你。' },
      ] },
    { id: 'e_group_buy', y: Y, minAge: 35, maxAge: 78, t: '團長', cond: (g) => tier(g) <= 4 && money(g) && g.recall('liveWith') !== 'nursing',
      text: (g) => '小區的團購群缺一個團長。' + pk(g, ['物業', '樓下超市的老闆', '群主'], 66) + '問你願不願意幹：幫大家收菜、分菜，每單有一點提成。',
      choices: [
        { t: '幹，就當認識認識鄰居', dev: 10, fx: (g) => { g.remember('evTuan', 'yes'); g.stat('人缘', 3); }, res: '你家門口多了一張摺疊桌。每天傍晚，樓裡的人來這兒取菜，順便聊幾句。' },
        { t: '不幹，太瑣碎', canon: true, fx: (g) => { g.remember('evTuan', 'no'); }, res: '你在群裡推薦了樓上的一個阿姨。' },
      ] },
    { id: 'e_hospital_number', y: Y, minAge: 35, maxAge: 85, t: '號', loc: 'hospital', cond: (g) => tier(g) <= 3,
      text: (g) => '你排了一早上的隊，掛上了' + pk(g, ['今天最後一個專家號', '下午的最後一個號'], 67) + '。旁邊一個' + pk(g, ['從縣裡來的老人', '抱著發燒孩子的年輕媽媽'], 68) + '沒掛上，急得直掉眼淚。',
      choices: [
        { t: '把號讓給對方', dev: 15, fx: (g) => { g.remember('evHosp', 'gave'); g.stat('人缘', 2); g.stat('健康', -1); }, res: '對方愣了一下，一個勁地說謝謝。你把自己的號改到了下週。' },
        { t: '陪對方去導診臺想辦法', dev: 10, fx: (g) => { g.remember('evHosp', 'help'); g.stat('人缘', 1); }, res: '導診的護士幫著加了一個號。你回來的時候，自己的號剛好叫到。' },
        { t: '嘆口氣，看自己的病', canon: true, fx: (g) => { g.remember('evHosp', 'kept'); }, res: '你看完出來，那個人已經不在了。' },
      ] },
  ]);

  /* 上面这些的回响 */
  JY.addEncounters([
    // 宠物老了：还在世的宠物，离它的寿数还有两年
    { id: 'e_echo_petage', y: Y, minAge: 10, t: '老了', auto: true, always: true, kind: 'echo',
      cond: (g) => !!pet(g) && ['dog', 'cat'].includes(pet(g).kind) && g.Y - pet(g).y >= Math.max(6, pet(g).life - 2),
      text: (g) => petName(g) + '老了。' + (pet(g).kind === 'dog' ? '下樓梯要人抱，耳朵也背了，叫它好幾聲才回頭。' : '跳不上窗臺了，整天睡在暖氣片邊上。') + '你給它換了軟一點的糧。' },
    echo('e_echo_petget', (g) => [g.recall('evPetGet'), g.since('evPetGet')], '它', 3, 25, {
      bought: { t: (g) => (pet(g) ? petName(g) + '長大了，' + (pet(g).kind === 'dog' ? '每天一到點就叼著牽引繩在門口等你。' : '最喜歡趴在你的鍵盤上。') + '這幾年吃的、用的、看病，加起來花了 ' + fmt(petYear(g, pet(g).kind) * 3) + '。' : '你買的那隻小傢伙沒養幾年就病了。你後來一直沒再去寵物店。'), fx: (g) => { if (pet(g)) CN.pay(g, petYear(g, pet(g).kind) * 3); g.stat('心情', 2); } },
      shelter: { t: (g) => (pet(g) ? '救助站發來回訪的訊息，問' + petName(g) + '過得好不好。你拍了一張它四腳朝天睡覺的照片發過去。' : '救助站發來回訪的訊息。你翻出它的照片，看了很久。'), fx: (g) => g.stat('心情', 2) },
      no: { t: '你後來常去同事家，抱著他家的貓坐一下午。同事說，你乾脆自己養一隻。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_pup', (g) => [g.recall('evPup'), g.since('evPup')], '院子裡', 2, 14, {
      dog: { t: (g) => (pet(g) && pet(g).kind === 'dog' ? petName(g) + '長成了一條大狗。有天半夜它叫個不停，' + CN.pick(['院牆外有人在撬隔壁的門。', '原來是灶房的爐子沒封好，冒了煙。', '原來是一隻黃鼠狼鑽進了雞窩。']) : '那條看家狗後來跑丟了，你找了好幾天。'), fx: (g) => g.stat('心情', 2) },
      cat: { t: (g) => (pet(g) && pet(g).kind === 'cat' ? petName(g) + '一早把一隻老鼠擺在你門口，蹲在旁邊等你誇它。' : '那隻貓後來跟著隔壁走了，隔壁家的魚更好吃。'), fx: (g) => g.stat('心情', 1) },
      no: { t: '那窩狗崽裡最壯的一隻，被村口小賣部抱去了。你每次去買東西，它都衝你搖尾巴。' },
    }),
    echo('e_echo_oldpet', (g) => [g.recall('evOldPet'), g.since('evOldPet')], '老夥計', 2, 68, {
      yes: { t: (g) => (pet(g) ? '有' + petName(g) + '在，你每天都有事做：' + ({ dog: '早晚遛兩趟', bird: '換水、添食、教它說話', cat: '鏟屎、梳毛、跟它說話' }[pet(g).kind] || '餵它') + '。' + (CN.alone(g) ? '屋裡有了響動。' : '家裡人說你話多了。') : '它陪了你幾年，走了。你把它的東西收起來，留了一樣擺在窗臺上。'), fx: (g) => { g.stat('心情', 3); g.stat('健康', 1); } },
      no: { t: '後來你常去社群的領養點坐坐，給那裡的貓狗帶點吃的。工作人員都認得你。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_vet', (g) => [g.recall('evVet'), g.since('evVet')], '好了', 1, 19, {
      cure: { t: (g) => (pet(g) ? petName(g) + '的病好利索了，又開始滿屋子撒歡，' + CN.pick(['咬壞了一隻拖鞋。', '把沙發抓出了一道口子。', '把垃圾桶翻了個底朝天。']) : '那次花的錢，你一點也不後悔。'), fx: (g) => g.stat('心情', 2) },
      basic: { t: (g) => (pet(g) ? petName(g) + '慢慢好了，就是比以前瘦了一圈，跑起來沒那麼快。' : '那次沒捨得多花錢。它走了以後，你有好一陣子想起來就難受。'), fx: (g) => g.stat('心情', pet(g) ? 1 : -3) },
    }),
    echo('e_echo_rumor', (g) => [g.recall('evRumor'), g.since('evRumor')], '名單', 1, 27, {
      calm: { t: (g) => (g.recall('evRumorCut') ? '名單出來了，上面有你。補償 ' + fmt(round(myPay(g) * 6, 1000)) + '。你歇了兩個月，找到了新工作，錢少了一點。' : '傳言沒成真，只裁了幾個外包。你照常上班，桌上的綠蘿又長了一截。'),
        fx: (g) => { const cut = g.rnd() < 0.4; g.remember('evRumorCut', cut); if (cut) { CN.earn(g, round(myPay(g) * 6, 1000)); g.stat('事业', -3); g.stat('心情', -3); } } },
      hunt: { t: (g) => '你跳去了一家新公司，月薪多了 ' + fmt(round(myPay(g) * 0.15, 100)) + '。老公司後來真的裁了人，前同事在群裡說你走得及時。', fx: (g) => { g.stat('事业', 3); g.stat('心情', 2); } },
      busy: { t: '裁員名單上沒有你們組。年底專案上線，領導在大會上唸了你的名字。', fx: (g) => { g.stat('事业', 4); } },
    }),
    echo('e_echo_wage', (g) => [g.recall('evWage'), g.since('evWage')], '討回來', 1, 19, {
      sue: { t: (g) => '仲裁下來了。拖欠的 ' + fmt(g.recall('evWageAmt')) + ' 一分不少到了賬，還多了一點利息。你給幫你寫材料的那位工作人員送了一面錦旗。', fx: (g) => { CN.earn(g, Number(g.recall('evWageAmt')) || 0); g.stat('心情', 3); } },
      group: { t: (g) => (g.recall('evWageBack') ? '拖了大半年，那筆 ' + fmt(g.recall('evWageAmt')) + ' 總算分三次給齊了。' : '老闆最後只給了一半。剩下的，幾個工友說算了，你也說算了。'),
        fx: (g) => { const back = g.rnd() < 0.5; g.remember('evWageBack', back); CN.earn(g, (Number(g.recall('evWageAmt')) || 0) * (back ? 1 : 0.5)); } },
      quit: { t: '後來聽說那個老闆跑路了，欠了一百多號人的錢。你在新地方幹得踏實，每個月十號準時發錢。', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_stake', (g) => [g.recall('evStake'), g.since('evStake')], '那家店', 2, 30, {
      in: { t: (g) => (g.recall('evStakeOk') ? g.recall('evStakeWho') + '的' + g.recall('evStakeKind') + '火了，節假日要排隊。兩年分紅加起來有 ' + fmt((Number(g.recall('evStakeAmt')) || 0) * 0.6) + '。' : g.recall('evStakeWho') + '的' + g.recall('evStakeKind') + '開了一年半，關了。入股的 ' + fmt(g.recall('evStakeAmt')) + ' 沒了。他說對不住，你說生意就是這樣。'),
        fx: (g) => { const ok = g.rnd() < 0.45; g.remember('evStakeOk', ok); if (ok) CN.earn(g, (Number(g.recall('evStakeAmt')) || 0) * 0.6); else g.stat('心情', -3); } },
      part: { t: (g) => (g.recall('evStakeOk') ? g.recall('evStakeWho') + '的店做起來了，年底給你轉了一筆分紅，' + fmt((Number(g.recall('evStakeAmt')) || 0) * 0.5) + '。你有點後悔當初沒多投。' : g.recall('evStakeWho') + '的店沒撐下去。你投的那一小筆，就當請他吃了幾頓飯。'),
        fx: (g) => { const ok = g.rnd() < 0.45; g.remember('evStakeOk', ok); if (ok) CN.earn(g, (Number(g.recall('evStakeAmt')) || 0) * 0.5); } },
      no: { t: (g) => '那家' + g.recall('evStakeKind') + '你去過兩次，生意不鹹不淡。老同學每次都給你多送一個菜。' },
    }),
    echo('e_echo_coop', (g) => [g.recall('evCoop'), g.since('evCoop')], '基地', 3, 27, {
      back: { t: (g) => g.recall('evCoopCrop') + '基地有了起色，去年賣了 ' + fmt(300000 + Math.round(rr(g, 69) * 40) * 10000) + '。村裡四十多戶人家在基地幹活，' + (has(g, 'fa') || has(g, 'mo') ? parentsWord(g) + '也在，' : '') + '年底每戶都分了錢。', fx: (g) => { CN.earn(g, 60000); g.stat('事业', 6); g.stat('人缘', 3); } },
      backFail: { t: '基地沒辦成，你在村裡種了三年地，又幫人開收割機。掙得不多，晚飯總是熱的。', fx: (g) => g.stat('心情', 1) },
      money: { t: (g) => '基地的第一批' + g.recall('evCoopCrop') + '下來了，支書給每個出過錢的人寄了一箱。你分給了同事，大家都說好吃。', fx: (g) => g.stat('人缘', 2) },
      no: { t: (g) => '過年回村，村口多了一排' + g.recall('evCoopCrop') + '的大棚。牽頭的是一個比你小几歲的人，他客客氣氣地喊你哥。' },
    }),
    echo('e_echo_deposit', (g) => [g.recall('evDeposit'), g.since('evDeposit')], '押金', 1, 21, {
      fight: { t: (g) => (g.recall('evDepositBack') ? '房東最後把押金全退了，' + fmt(g.recall('evDepositAmt')) + '。你從此搬進哪兒都先拍一遍照。' : '房東還是扣了一半。你在租房平臺上寫了一條長長的評價，後來有好幾個人私信謝你。'),
        fx: (g) => { const back = g.rnd() < 0.6; g.remember('evDepositBack', back); if (back) CN.earn(g, (Number(g.recall('evDepositAmt')) || 0) / 2); } },
      report: { t: (g) => '中介出面調解，退回了扣下的 ' + fmt((Number(g.recall('evDepositAmt')) || 0) / 2) + '。客服最後還給你打了個回訪電話。', fx: (g) => CN.earn(g, (Number(g.recall('evDepositAmt')) || 0) / 2) },
      let: { t: '那筆被扣的押金，你後來想起來還是有點氣。下一次租房，你進門先把每面牆都拍了一遍。' },
    }),
    echo('e_echo_phone', (g) => [g.recall('evPhone'), g.since('evPhone')], '失而復得', 1, 17, {
      call: { t: (g) => '接電話的是一個' + CN.pick(['外賣騎手', '大學生', '環衛工', '計程車司機']) + '，把手機給你送了回來。你要給錢，對方只收了一瓶水。後來你撿到東西，也總是等著失主來找。', fx: (g) => g.stat('心情', 2) },
      police: { t: '過了一個星期，派出所打電話說手機找到了，是一位撿到的老人交過來的。你去取的時候，民警說那位老人沒留名字。', fx: (g) => g.stat('人缘', 1) },
      new: { t: '舊手機一直沒找回來。那些沒備份的照片裡，有一張你很喜歡。你開始每個月備份一次。', fx: (g) => g.stat('学识', 1) },
    }),
    echo('e_echo_umbrella', (g) => [g.recall('evUmb'), g.since('evUmb')], '又碰見了', 1, 17, {
      gave: { t: '過了一陣，你在同一個地方又碰見了那個人。對方認出了你，非要塞給你一袋自家包的包子。', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 1); } },
      walk: { t: '那天送到路口，對方說就在前面。後來下雨的時候，你的包裡總多放一把摺疊傘。', fx: (g) => g.stat('人缘', 1) },
      no: { t: '後來又下了幾場大雨。每次站在屋簷下，你都會想起那個看著雨發愁的人。', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_tutor', (g) => [g.recall('evTutor'), g.since('evTutor')], '那個孩子', 3, 33, {
      free: { t: (g) => '樓下那孩子考上了' + CN.pick(['市裡的重點高中', '一所不錯的大學', '心心念唸的師範']) + '，拎著一箱水果來敲門，說是你教會了' + CN.pick(['他', '她']) + '怎麼讀題。', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); } },
      paid: { t: '那孩子的成績上來了，家長又介紹了兩個孩子來。你說週末還想歇歇，就沒再接。', fx: (g) => g.stat('人缘', 1) },
      no: { t: '你在電梯裡碰見那個孩子。他長高了，戴著耳機，衝你點了點頭。' },
    }),
    echo('e_echo_road', (g) => [g.recall('evRoad'), g.since('evRoad')], '村口', 2, 37, {
      gave: { t: (g) => '回老家那次，你在村口的碑上找到了自己的名字，後面寫著 ' + fmt(g.recall('evRoadAmt')) + '。車一直開到了家門口。', fx: (g) => g.stat('心情', 2) },
      big: { t: (g) => '碑上你的名字排在前頭，後面寫著 ' + fmt(g.recall('evRoadAmt')) + '。村裡的小孩指著碑認字，唸到你的名字，念得很響。', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); } },
      no: { t: '回老家那次，新修好的路一直通到村裡。你開過去的時候，開得很慢。' },
    }),
    echo('e_echo_tuan', (g) => [g.recall('evTuan'), g.since('evTuan')], '團長', 2, 37, {
      yes: { t: (g) => '當團長這兩年，提成攢了 ' + fmt(round(3000 + rr(g, 70) * 9000, 100)) + '。樓裡誰家孩子考上了學、誰家老人住了院，你都比別人先知道。', fx: (g) => { CN.earn(g, round(3000 + rr(g, 70) * 9000, 100)); g.stat('人缘', 3); } },
      no: { t: '團長換了三個人。最後一個是樓上的阿姨，她每次都給你留最新鮮的那把青菜。', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_hosp', (g) => [g.recall('evHosp'), g.since('evHosp')], '一箱特產', 2, 37, {
      gave: { t: (g) => '你收到一個快遞，是一箱' + CN.pick(['土雞蛋', '小米', '臘肉', '新摘的橘子']) + '，裡面夾著一張字條：那天謝謝你的號。', fx: (g) => { g.stat('心情', 3); } },
      help: { t: '後來你在醫院當過幾回志願者，專門站在掛號機旁邊，幫老人點螢幕。', fx: (g) => g.stat('人缘', 2) },
      kept: { t: '後來醫院上了 AI 導診，號好掛多了。你有時候還會想起那個掉眼淚的人。' },
    }),
  ]);

  /* ---------- 新闻：2026–2120 ---------- */
  const NEWS = [
    [2026, '全國全年出生人口九百萬左右。新生兒名字裡，“沐”“汐”“宸”用得最多。'],
    [2026, '一些城市開始給新生兒家庭發育兒補貼，每月幾百元。'],
    [2027, '夏天比往年熱，南方多地氣溫破了紀錄。空調賣斷了貨。'],
    [2027, '家用 AI 助手的價格降到了一臺冰箱以下。'],
    [2028, '高鐵又通了幾條新線，從縣城到省會，最快一個小時。'],
    [2028, '一些幼兒園因為招不滿學生，改成了托育中心。'],
    [2029, 'AI 助手進了越來越多的家庭，會講故事、輔導作業、提醒老人吃藥。'],
    [2029, '新能源車的銷量第一次超過了燃油車。'],
    [2030, '各地延遲退休的方案繼續推進，退休年齡每隔幾個月往後延一點。'],
    [2030, '超市裡能刷臉結賬了，收銀臺少了一半。'],
    [2031, '一種新的流感疫苗上市，打一針管兩年。'],
    [2031, '短影片平臺上，一個講方言的農村老太太粉絲過了千萬。'],
    [2032, '這一年的小學新生比十年前少了三成，不少鄉村小學合併，孩子們去鎮上寄宿。'],
    [2032, '大城市的外賣開始用無人機送，樓頂多了一個個小停機坪。'],
    [2033, '全國人口繼續緩慢減少，六十歲以上的人佔到了四分之一。'],
    [2033, '有的城市推出“二孩三孩買房優惠”，看房的人多了一些。'],
    [2034, '北方一場大雪，多地停課兩天，孩子們在雪地裡打了兩天雪仗。'],
    [2035, '大城市有了無人駕駛計程車，起步價比有人開的便宜一塊錢。'],
    [2035, '醫院裡，AI 幫醫生看片子，排隊看病的時間短了一些。'],
    [2036, '一部講留守兒童的電影票房很高，很多人看哭了。'],
    [2037, '暑假，研學旅行團擠滿了各地的博物館。'],
    [2037, '一些縣城開始給返鄉創業的年輕人發補貼。'],
    [2038, '這一年的初中新生又少了，城裡有的初中把空教室改成了實驗室。'],
    [2039, '電動車換電站開到了鄉鎮，五分鐘換一塊電池。'],
    [2040, '家務機器人開始賣進普通人家，價格還很貴。'],
    [2040, '全國平均壽命過了八十歲。'],
    [2041, '中考的考生人數是三十年來最少的一年。普高和職校各招一半左右。'],
    [2041, '職業學校新開了“智慧裝置維修”“養老護理”專業，報名的人不少。'],
    [2042, '夏天的雨水特別多，長江中下游防汛的新聞上了好幾天。'],
    [2043, '有家大廠宣佈員工每週只上四天班，網上吵翻了。'],
    [2044, '高考報名人數比父輩那代少了三分之一，本科錄取率創了新高。好大學還是那麼難考。'],
    [2044, '高考作文題是《我和我的 AI 同桌》。'],
    [2045, '大學裡，不少基礎課由 AI 助教帶，老師更多地在帶討論。'],
    [2046, '一些城市的房價連續幾年沒漲，租房的人比買房的人多了。'],
    [2047, '鄉村的快遞開始用無人車送到村口。'],
    [2048, '這一年畢業的大學生，很多去了五年前還不存在的崗位：AI 訓練師、陪護機器人維修員、數字遺產整理師。'],
    [2048, '很多基礎崗位被 AI 替代，職業培訓班報名的人排起了長隊。'],
    [2049, '各地的養老院床位不夠，排隊要等一兩年。'],
    [2050, '遠端辦公成了常態，很多人搬回了老家的縣城，在家裡給大城市幹活。'],
    [2050, '全國人口降到了十三億出頭。'],
    [2051, '一種癌症的新療法進了醫保，費用降了九成。'],
    [2052, '結婚的平均年齡過了三十二歲。'],
    [2053, '無人駕駛貨車在高速上排成了車隊，長途司機越來越少了。'],
    [2054, '一些城市的老小區加裝電梯基本完成了。'],
    [2055, '夏天，北方的一條河斷流了一個月，又在秋天重新流了起來。'],
    [2056, '家務機器人的價格降了一半，很多年輕夫妻把它列進了結婚的“三大件”。'],
    [2057, '大城市和小城市的房價越拉越開，省會以下的很多城市房子供大於求。'],
    [2058, '新一代的人工心臟瓣膜上市，手術不用開胸了。'],
    [2059, '一些高校因為生源不足合併了，校名換了，校園還在。'],
    [2060, '六十五歲以上的人佔到了總人口的三分之一。家家都有老人要照顧。'],
    [2060, '社群裡開了很多“日間照料中心”，白天幫忙照看老人，晚上送回家。'],
    [2061, '銀髮旅遊團擠滿了各地的景點，導遊都是年輕人和機器人。'],
    [2062, '一種阿爾茨海默病的早期篩查進了體檢套餐。'],
    [2063, '城市裡的小學開設了“陪爺爺奶奶”的社會實踐課。'],
    [2064, '電動飛行器在幾座大城市試執行，從郊區到市中心只要十五分鐘。'],
    [2065, '這一年，全國的養老護理員缺口還有幾百萬，機器人護工上了崗。'],
    [2066, '一部講“獨生一代”養老的紀錄片引發了很多討論。'],
    [2067, '各地的老年大學報名，手機上幾秒鐘就搶光了。'],
    [2068, '南方一場罕見的冬季寒潮，香蕉園凍壞了一大片。'],
    [2069, '人工腎臟開始在大醫院臨床使用。'],
    [2070, '機器人做家務、陪老人已經很常見，小區裡能看見機器人推著輪椅散步。'],
    [2071, '全國平均壽命接近八十三歲。'],
    [2072, '很多鄉村變成了養老村，空房子改成了康養院。'],
    [2073, '年輕人裡流行起手寫信，文具店的信紙賣斷貨。'],
    [2074, '一種新藥能讓骨折的老人恢復得更快，進了醫保。'],
    [2075, '城市裡的計程車已經幾乎都是無人駕駛的了。'],
    [2076, '一些城市試行“時間銀行”：年輕時照顧老人攢下時間，老了可以兌換照顧。'],
    [2077, '春節，全國的“空巢老人”影片團圓數創了紀錄。'],
    [2078, '老舊小區改造成了適老社群，樓道里裝滿了扶手。'],
    [2079, '家用醫療機器人能做簡單的檢查，測完血壓直接把資料發給醫生。'],
    [2080, '這一年，養老護理機器人的數量超過了人類護工。'],
    [2081, '一位一百一十二歲的老人在家裡過了生日，她是全國最長壽的人之一。'],
    [2082, '各地的公墓開始推廣樹葬、海葬，越來越多的人選擇不立碑。'],
    [2083, '一種記憶輔助裝置上市，能幫老人想起剛說過的話。'],
    [2084, '新一年的出生人口比上一年略有回升，新聞說是“年輕人的生育意願回暖”。'],
    [2085, '數字遺產整理成了一門正經生意，很多老人開始給自己的照片、影片立遺囑。'],
    [2086, '縣城裡的電影院換成了沉浸式劇場，觀眾大多是老人。'],
    [2087, '一座城市試行全自動的社群醫院，夜裡也有“醫生”值班。'],
    [2088, '全國平均壽命過了八十四歲。'],
    [2089, '老年人再婚的登記數比十年前翻了一倍。'],
    [2090, '各地的“老年食堂”一頓飯只要幾塊錢，很多是機器人做的。'],
    [2091, '這一年的法定退休年齡是六十五歲左右。2026 年出生的這一代人，開始陸續退休。'],
    [2091, '養老金的賬戶全國通用，退休的人去哪個城市都能領。'],
    [2092, '很多 2026 年出生的人在社交平臺上曬退休證，配文是“終於”。'],
    [2093, '一部講 2030 年代童年的電視劇熱播，演員們揹著當年的書包。'],
    [2094, '新的抗衰老藥物進入臨床試驗，報名的老人排起了隊。'],
    [2095, '夏天的高溫比二十世紀末平均高出一點幾度，很多城市的公園裡加了噴霧。'],
    [2096, '一項調查說，七十歲的人裡，一半以上每天和機器人說的話比和人說的多。'],
    [2097, '養老院裡開始流行“回憶課”：機器人幫老人把一生的照片做成相簿。'],
    [2098, '平均壽命過了八十五歲。百歲老人比二十年前多了好幾倍。'],
    [2099, '這一年的最後一天，很多老人守著電視跨年，說這是他們見到的第二個世紀交替。'],
    [2100, '二十二世紀的第一天。煙火在每座城市的上空同時亮起。'],
    [2101, '城市裡的老人公園比兒童公園多了。'],
    [2103, '一種能延緩衰老的基因療法獲批，價格還很貴。'],
    [2105, '縣城的醫院也有了手術機器人，大病不用再往省城跑。'],
    [2108, '全國最後一批 2020 年代出生的人裡，最年長的已經八十多歲了。'],
    [2110, '百歲老人的數量過了百萬。'],
    [2113, '一個 2026 年出生的老人在網上分享了自己一百歲的生日，說他這一輩子見過太多的“第一次”。'],
    [2116, '養老機器人開始能陪老人下象棋，偶爾故意輸一盤。'],
    [2027, '一些城市的地鐵開通了夜班車，凌晨一點還有車。'],
    [2030, '這一年的春運，坐高鐵回家的人第一次超過了坐飛機和大巴的總和。'],
    [2034, '鄉村醫生開始用遠端診療裝置，在村衛生室就能和縣醫院的醫生影片看病。'],
    [2036, '全國的中小學都配了 AI 助教，有家長擔心孩子不會自己想問題了。'],
    [2039, '一些大城市試行“小學放學後託管”，家長下班前孩子都有地方去。'],
    [2042, '職業學校的畢業生就業率，第一次和普通本科差不多了。'],
    [2046, '考研報名人數連續幾年下降，考公的人還是很多。'],
    [2049, '各地的縣城出現了“返鄉青年創業園”，空置的廠房改成了工作室。'],
    [2052, '一款能把方言翻譯成普通話的耳機賣得很好，買的大多是給老人用的。'],
    [2055, '新修的跨海大橋通車了，開車從島上到大陸只要二十分鐘。'],
    [2058, '很多城市的出生人口比十年前略有回升，產科又開始排隊了。'],
    [2063, '一種新的降壓藥一週只要吃一片，進了醫保。'],
    [2067, '機器人快遞員能自己坐電梯上樓了。'],
    [2072, '縣城的電影院裡，看老電影的場次比新電影多。'],
    [2076, '全國第一批“機器人養老院”開業，護工和老人的比例是一比二十。'],
    [2079, '智慧助聽器的價格降到了幾百塊，很多老人終於聽清了孫輩說話。'],
    [2084, '各地開始給八十歲以上的老人免費配家用醫療機器人。'],
    [2087, '一項調查說，2020 年代出生的這一代人，平均換過五份工作。'],
    [2096, '養老院裡流行起了“代際午餐”：附近小學的孩子每週來陪老人吃一頓飯。'],
    [2104, '一位 2026 年出生的老人出版了回憶錄，書名叫《我們這一代》。'],
    [2120, '這一年，出生在 2026 年的人，大多已經離開了。'],
    // 平淡的好消息
    [2031, '不少小區建起了“共享廚房”，加班的年輕人下樓就能做頓熱飯。'],
    [2033, '一款護眼檯燈在家長群裡傳開了，說孩子寫作業不容易近視。'],
    [2038, '很多城市的公交站換成了帶空調的小亭子，夏天等車不再曬。'],
    [2043, '春節檔上映了一部動畫電影，講一隻熊貓回老家過年，大人小孩都愛看。'],
    [2045, '各地的夜市又熱鬧起來，烤串和糖水攤排到了半夜。'],
    [2047, '一些城市流行起“社群小飯桌”，鄰居們輪流做飯，一起吃。'],
    [2051, '高鐵的票價打了一輪折，週末回家的年輕人多了。'],
    [2054, '幾座城市把廢棄的鐵路改成了步道，週末全是散步的人。'],
    [2057, '常規體檢里加了基因檢測，價格降到了幾百塊。'],
    [2061, '各地的菜市場改造完了，乾淨明亮，攤主們都用上了電子秤。'],
    [2066, '一檔講普通人做家常菜的節目火了，主角是一位退休的廚師。'],
    [2069, '不少公園旁開了“銀髮食堂”，兩葷一素十塊錢。'],
    [2074, '城裡的公交車全換成了低底盤，輪椅能直接推上去。'],
    [2083, '“老友合租”在各地流行起來，幾個老朋友合住一套房，互相照應。'],
    [2093, '一項調查說，七十歲上下的人裡，每天出門散步的比十年前多了一半。'],
    [2102, '很多人家給用了二十年的老機器人辦了“退休儀式”，換下來的舊機器人送進了博物館。'],
    [2107, '一種新藥能讓老人重新嚐出味道，很多人又吃上了年輕時愛吃的菜。'],
  ].map(([y, t]) => ({ y, t }));
  // 和你的生活有关的新闻
  NEWS.push(
    { y: 2032, t: '你老家那一片的幾所村小合併成了一所，校車每天早上六點半出發。', cond: (g) => g.recall('hukou') === 'rural' },
    { y: 2044, t: '你所在的省公佈了高考分數線。家長群裡炸開了鍋。', cond: (g) => g.recall('edu') === 'senior' },
    { y: 2060, t: (g) => g.recall('city') + '的新聞說，全市的老人已經比孩子多了。', cond: (g) => !!g.recall('city') },
    { y: 2070, t: (g) => g.recall('prov') + '的鄉村養老院開始配機器人護工。', cond: (g) => g.recall('hukou') !== 'city' },
    { y: 2052, t: (g) => g.recall('workCity') + '的地鐵又開了兩條新線，你上班的路短了一截。', cond: (g) => !!g.recall('workCity') && tier(g) <= 2 && working(g) },
    { y: 2058, t: (g) => g.recall('prov') + '的老家縣城通了高鐵，回家的路從六個小時變成了兩個小時。', cond: (g) => g.recall('hukou') !== 'city' && !!g.recall('prov') },
  );
  JY.addEvents(NEWS);

  /* ---------- 闲笔 ---------- */
  // 熬过婴儿期的头几年（重心“懵懂”，0–5 岁）
  JY.addFlavor('focus:懵懂', [
    { t: '第一次笑出聲的那天，家裡人圍著你逗了一晚上。', maxAge: 0 },
    { t: '你睡著的時候總攥著小拳頭，大人掰都掰不開。', maxAge: 0 },
    { t: '夜裡你醒了三回，家裡人輪流起來抱你。', maxAge: 1 },
    { t: '這一年你長了第一顆牙，見什麼都想咬一口。', maxAge: 1 },
    { t: '打預防針的時候你哭得很兇，出了門拿到一個氣球就笑了。', maxAge: 3 },
    { t: '洗澡的時候你拍水拍得最歡，濺了大人一身。', maxAge: 2 },
    { t: '天氣好的時候，你被抱到樓下曬太陽，見了誰都盯著看。', maxAge: 1 },
    { t: '你會爬了，滿屋子找地方鑽，最喜歡鑽到桌子底下。', minAge: 1, maxAge: 1 },
    { t: '你在小區的滑梯上滑了一下午，不肯回家。', minAge: 2, maxAge: 5 },
    { t: '你把碗裡的胡蘿蔔一塊塊挑出來，擺在桌上排成一排。', minAge: 2, maxAge: 5 },
    { t: '你纏著大人講故事，講到第三遍才睡著。', minAge: 2, maxAge: 5 },
    { t: '你對著鏡子做鬼臉，把自己逗得咯咯笑。', minAge: 1, maxAge: 4 },
  ]);
  JY.addFlavor('age:child', [
    { t: '你學會了走路，第一步就撲進了大人懷裡。', minAge: 1, maxAge: 1 },
    { t: '你第一次叫“爸爸”，爸爸錄了影片，發到了家族群裡。', minAge: 1, maxAge: 2, cond: (g) => has(g, 'fa') },
    { t: '你把積木搭得比自己還高，然後一巴掌推倒了它。', minAge: 2 },
    '你發了一場高燒，半夜被抱去醫院，打了一針，哭得整個走廊都聽得見。',
    { t: '你喜歡趴在窗邊看樓下的車，能叫出好幾種車的名字。', minAge: 3 },
    { t: '你第一次看見下雨，伸手去接，說天在哭。', minAge: 2 },
    { t: '家裡的 AI 音箱給你講了一百遍同一個故事，你還要聽。', minAge: 2 },
    { t: '你把手機裡的照片刪了一半。沒人知道是你乾的。', minAge: 3 },
    { t: '你學會了數數，數到十就不數了。', minAge: 3 },
    { t: '你在幼兒園交了第一個好朋友，第二天就吵翻了，第三天又和好了。', minAge: 3 },
    { t: '你害怕打雷，每次都鑽進被子裡。', minAge: 2 },
    { t: '你把蠟筆畫在了牆上，畫的是一家人手拉著手。', minAge: 2 },
    { t: '你掉了第一顆牙，放在枕頭底下，等了一晚上。', minAge: 5 },
    { t: '你開始問“為什麼”。大人答不上來的時候，會說“問 AI 去”。', minAge: 3 },
    { t: '你第一次自己吃完一整碗飯，大人們都鼓掌了。', minAge: 2 },
    { t: '你在超市裡賴在地上不走，因為想要一個會說話的玩具。', minAge: 2 },
    { t: '你會背第一首古詩了，“床前明月光”，背到第三句就卡住。', minAge: 3 },
    { t: '你最喜歡的動畫片講的是一隻會開飛船的熊貓。', minAge: 2 },
    { t: '你偷偷吃了一整包糖，那天晚上牙疼得直哭。', minAge: 3 },
    { t: '幼兒園的老師說你畫畫很有想法，你回家就把這句話說了五遍。', minAge: 3 },
    { t: '你第一次坐火車，一路趴在窗戶上，沒睡著。', minAge: 2 },
    { t: '你把家裡的拖鞋都排成了一列，說那是火車。', minAge: 2 },
    { t: '你會自己穿鞋了，就是左右總穿反。', minAge: 3 },
    { t: '你第一次看見大海，被一個浪拍倒，坐在沙灘上愣了半天。', minAge: 3 },
    { t: '你學會了騎帶輔助輪的腳踏車，在小區裡轉了一下午。', minAge: 3 },
    { t: '你跟大人說，你的夢想是當一個會飛的人。', minAge: 4 },
    { t: (g) => CN.who(g, olderSib(g), true) + '放學回來，把作業本上的小紅花撕下來貼在了你額頭上。', minAge: 2, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 7 },
    { t: (g) => CN.who(g, 'gm', true) + '給你縫了一個布老虎，你抱著它睡了好幾年。', minAge: 1, cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:young', [
    '你和同桌在課桌中間畫了一條線，誰過線誰就是小狗。',
    '你第一次考了一百分，把卷子貼在了冰箱上。',
    { t: '你學會了游泳，在泳池裡泡到嘴唇發紫。', minAge: 7 },
    { t: '你偷偷把作業本上的分數改了一筆，後來一直記著。', minAge: 8 },
    { t: '你喜歡上了一本小說，熬夜在被子裡打著手電看完。', minAge: 9 },
    { t: '你第一次一個人坐公交車，緊張得提前三站就站了起來。', minAge: 8 },
    '班上轉來一個新同學，說話帶著你聽不懂的口音。你們成了好朋友。',
    { t: '你開始在乎穿什麼，早上要在鏡子前站很久。', minAge: 11 },
    '運動會上你跑了個第三，獎品是一個筆記本。',
    '你在課本的空白處畫滿了小人。',
    { t: '你第一次有了自己的手機，設定了密碼，誰都不告訴。', minAge: 10 },
    { t: '你個子長得太快，夜裡腿疼，大人說那是在長個子。', minAge: 10 },
    { t: '你和家裡人吵了一架，摔上了房門。半夜餓了，出來發現桌上留著飯。', minAge: 11, cond: (g) => !CN.alone(g) },
    { t: '你開始寫日記，寫了三天就斷了，過了幾年又撿起來。', minAge: 9 },
    { t: '你第一次在 KTV 唱歌，唱破了音，大家笑了好久。', minAge: 10 },
    { t: '你偷偷喜歡班上的一個人，每天故意晚一點出教室，好同路走一段。', minAge: 12 },
    { t: '暑假你在鄉下住了一個月，學會了抓知了。', cond: (g) => g.recall('hukou') !== 'rural' },
    '你迷上了一個科幻故事，發誓以後要去太空。',
    { t: '你的近視又加深了，換了一副更厚的眼鏡。', minAge: 8 },
    { t: '你第一次覺得大人說的話也不全對。', minAge: 10 },
    { t: '期末考試前，全班都在熬夜。你在臺燈下數窗外的星星。', minAge: 12 },
    { t: '你和好朋友約好考同一所高中。', minAge: 13 },
    '你在食堂吃到了一隻完整的雞腿，高興了一下午。',
    { t: '你在 AI 助手裡問了一個不敢問大人的問題。', minAge: 10 },
    { t: '你攢了一個學期的零花錢，買了一雙球鞋，捨不得穿。', minAge: 10 },
    { t: '班主任說你“聰明，就是不用功”。這句話，後來很多人都對你說過。', minAge: 8 },
    { t: '放學路上，你和同學分著吃了一根冰棒，一人一口。', minAge: 6 },
    { t: '你幫同桌講明白了一道題，他請你喝了一瓶汽水。', minAge: 8 },
    { t: '下了一場大雪，學校停了半天課。操場上全是打雪仗的人。', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: (g) => CN.who(g, olderSib(g), true) + '偷偷塞給你一個紅包，說別告訴爸媽，拿去買本喜歡的書。', minAge: 8, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 18 },
    { t: (g) => CN.who(g, 'gp', true) + '教你下象棋，每回都讓你一個車，還是贏了你。', minAge: 7, cond: (g) => has(g, 'gp') },
    { t: (g) => '每天出門前，' + CN.who(g, 'gm') + '都往你書包裡塞一個煮雞蛋。', cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:adult', [
    { t: '高中的晚自習上到九點半。回家的路上，你買了一個烤紅薯，捧著暖手。', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: '你在課桌角上貼了一張倒計時，數字一天天變小。', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: '這一年沒什麼大事。你學會了做一道紅燒肉。', minAge: 18 },
    { t: '你在地鐵上睡著了，坐過了三站。', minAge: 16, cond: (g) => tier(g) <= 3 },
    { t: '你換了一部新手機，把舊手機裡的照片一張張導了過去。', minAge: 18 },
    { t: '你在深夜的便利店吃了一碗關東煮，覺得日子還過得去。', minAge: 18 },
    { t: '你開始在乎體檢報告上的數字了。', minAge: 30 },
    { t: '你發現自己也會說“現在的年輕人啊”。', minAge: 32 },
    { t: '你在樓下的麵館吃了五年，老闆終於記住了你不要香菜。', minAge: 22 },
    { t: '你加了一個跑步群，跑了三次就沒去了。', minAge: 20 },
    { t: '你過生日，收到的祝福裡，有一半是平臺自動發的。', minAge: 18 },
    { t: '你在陽臺上種了一盆薄荷，它活得比你想象的久。', minAge: 18 },
    { t: '你給爸媽買了一臺按摩椅，他們說浪費錢，每天都坐。', minAge: 24, cond: (g) => has(g, 'fa') && has(g, 'mo') && money(g) },
    { t: '你刪掉了一個很久不聯絡的人的聯絡方式，又後悔了。', minAge: 18 },
    { t: '你的頭髮開始掉了，洗頭的時候不太敢看下水口。', minAge: 30 },
    { t: '一個老朋友結婚了，你在婚禮上喝多了，唱了一首老歌。', minAge: 22 },
    { t: '你第一次一個人去旅行，在一座陌生的城市迷了路，卻很開心。', minAge: 18, maxAge: 35 },
    { t: (g) => '這一年房貸又還掉一截，還欠 ' + fmt((Number(g.recall('debt')) || 0) * 1e4) + '。', cond: (g) => g.recall('house') === 'mortgage' && (Number(g.recall('debt')) || 0) > 0 },
    { t: '你在加班的路上看到了一場很美的晚霞，忘了拍下來。', minAge: 20, maxAge: 64, cond: working },
    { t: '你給自己列了一張記賬的表，堅持了大半年。', minAge: 20, cond: money },
    { t: '你學會了在會議上不說話。', minAge: 24, maxAge: 64, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher'].includes(job(g)) },
    { t: '你翻到小時候的照片，認不出照片裡的自己。', minAge: 18 },
    { t: '你在超市裡比較了半天兩種醬油，最後買了貴的那種。', minAge: 20 },
    { t: '你戒了一陣子煙，又抽上了。', minAge: 22, sex: '男' },
    { t: '你開始失眠，夜裡三點盯著天花板想事情。', minAge: 28 },
    { t: '有個小孩在電梯裡叫你“叔叔”，你愣了一下才答應。', minAge: 26, sex: '男' },
    { t: '有個小孩在電梯裡叫你“阿姨”，你愣了一下才答應。', minAge: 26, sex: '女' },
    { t: '你和一個多年的朋友吃了頓飯，發現彼此都變了，又好像都沒變。', minAge: 25 },
    { t: '你花了一個週末收拾房間，扔掉了三大袋東西。', minAge: 18 },
    { t: '發工資那天，你給自己點了一份好一點的午飯。', minAge: 18, maxAge: 64, cond: working },
    { t: '你找到了一條上班的近道，每天能多睡十分鐘。', minAge: 20, maxAge: 64, cond: working },
    { t: '你學會了做一道家常菜，第一次就做得很成功。', minAge: 18 },
    { t: '你在舊書攤上淘到一本小時候讀過的書，五塊錢。', minAge: 18 },
    { t: '你收到一個包裹，是很久不聯絡的朋友寄來的家鄉特產。', minAge: 22 },
    { t: '你養的那盆花，今年第一次開了。', minAge: 20 },
    { t: '存款又多了一點。你看著那個數字，心裡踏實了一些。', minAge: 22, cond: (g) => money(g) && cash(g) >= 50000 },
    { t: '一個人住久了，你學會了做一人份的飯，不多不少。', minAge: 20, cond: (g) => CN.alone(g) },
    { t: '週末你一個人去看了場電影，散場的時候，外面剛好下起了小雨。', minAge: 18, cond: (g) => CN.alone(g) },
    { t: (g) => '晚飯後，你和' + spRel(g) + '下樓散步，繞著小區走了三圈。', minAge: 22, cond: spOk },
    { t: (g) => '你忙了一整天回到家，' + spRel(g) + '給你留了一碗湯，還熱著。', minAge: 22, cond: (g) => spOk(g) && CN.livesWith(g, 'sp') },
    { t: (g) => CN.who(g, 'k1', true) + '在幼兒園畫了一張全家福。畫上的你，比房子還高。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 6 },
    { t: (g) => CN.who(g, 'k1', true) + '第一次自己繫好了鞋帶，跑過來讓你看。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 4 && g.ageOf('k1') <= 7 },
    { t: (g) => CN.who(g, 'k1', true) + '的個子躥得飛快，量身高的那道線，又往上畫了一截。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 9 && g.ageOf('k1') <= 16 },
    { t: (g) => CN.who(g, 'mo') + '打來電話，沒什麼事，就是問你吃了沒有。', minAge: 18, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: (g) => CN.who(g, 'fa', true) + '學會了用手機發語音，每天早上給你發一條天氣預報。', minAge: 20, cond: (g) => has(g, 'fa') && !CN.livesWith(g, 'fa') },
    { t: '早上起床，廚房裡已經有了熱粥。媽媽說，趁熱喝。', minAge: 18, cond: (g) => CN.livesWith(g, 'mo') },
  ]);
  JY.addFlavor('age:old', [
    { t: '你早上五點就醒了，再也睡不著。', minAge: 60 },
    { t: '你在公園裡看人下棋，看了一下午，忍不住插了一句嘴。', minAge: 60 },
    { t: '你的老花鏡放在哪兒，總是要找半天。', minAge: 50 },
    { t: '你學會了用語音發訊息，一條能說三分鐘。', minAge: 58 },
    { t: (g) => '你把' + CN.who(g, gks(g)[0]) + '的照片設成了手機屏保，逢人就給人看。', cond: (g) => gks(g).length > 0 },
    { t: '你去菜市場，跟攤主講了十分鐘的價，最後便宜了五毛。', minAge: 55 },
    { t: '你翻出了年輕時的衣服，已經穿不上了，還是沒捨得扔。', minAge: 50 },
    { t: '老同學又少了一個。你在群裡發了一支蠟燭。', minAge: 65 },
    { t: '你開始每天量血壓，把數字記在一個小本子上。', minAge: 55 },
    { t: '你在小區裡認識了一個新朋友，你們每天一起遛彎。', minAge: 60 },
    '你看了一部老電影，是你年輕時看過的，哭了。',
    { t: '你給自己織了一條圍巾，織歪了，還是天天戴。', minAge: 55 },
    { t: '你學會了和家裡的機器人聊天。它記性比你好。', minAge: 60 },
    { t: '下雨天，你的腿就開始疼。', minAge: 60 },
    { t: (g) => '你給' + CN.who(g, gks(g)[0]) + '講你小時候的事，孩子以為你在講故事。', cond: (g) => gks(g).length > 0 && g.ageOf(gks(g)[0]) >= 4 },
    { t: '你把存摺和遺囑放在了同一個抽屜裡。', minAge: 70 },
    { t: '你開始忘事，剛說的話，轉頭就忘了。', minAge: 75 },
    { t: '你在陽臺上曬太陽，曬著曬著就睡著了。', minAge: 65 },
    { t: '你學會了用手機看病，醫生在螢幕那頭說你保養得不錯。', minAge: 60 },
    { t: (g) => '你和' + (g.knows('sp') === '丈夫' ? '老伴' : '老伴') + '拌了一句嘴，半個鐘頭後又一起出門買菜。', minAge: 55, cond: spOk },
    { t: (g) => '老伴給你剝了一個橘子，一瓣一瓣遞過來。', minAge: 62, cond: spOk },
    { t: '你去參加了一個老同學的葬禮，回來路上一句話也沒說。', minAge: 65 },
    { t: '你吃飯越來越少，菜越來越淡。', minAge: 75 },
    { t: '你把一輩子的照片整理成了一本相簿，扉頁寫上了自己的名字。', minAge: 65 },
    '春天的時候，你在樓下看了一下午的花。',
    { t: '你說話越來越慢，可是講起年輕時的事，一個細節都不落。', minAge: 75 },
    { t: '有人問你多大歲數了，你想了一下才說出來。', minAge: 80 },
    { t: (g) => (gks(g).length ? '孫輩' : '孩子') + '打來影片，非要給你看他新長的牙。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 7) },
    { t: (g) => '你給' + CN.who(g, kids(g)[0], true) + '打了個影片，看見那邊的燈亮著，就放心了。', minAge: 55, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) && g.ageOf(kids(g)[0]) >= 20 },
    { t: '樓下的早點鋪老闆知道你的口味，豆漿少糖，油條要焦一點。', minAge: 55 },
    { t: '你在老年大學報了一門書法課，同桌是個八十歲的老太太，字寫得比你好。', minAge: 62, maxAge: 85 },
    { t: '天氣好的時候，幾個老鄰居搬著小板凳坐在樓下，一聊就是一上午。', minAge: 62 },
    { t: '一個人吃飯，你也照樣擺好碗筷，炒一個菜，熬一碗湯。', minAge: 60, cond: (g) => CN.alone(g) },
    { t: (g) => CN.who(g, kids(g)[0]) + '寄來一箱水果，說是那邊的特產。你分了一半給鄰居。', minAge: 60, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) },
  ]);

  /* 地点 */
  JY.addFlavor('loc:village_n', [
    '玉米收完了，院子裡堆成了一座金黃的小山。',
    '村口的大喇叭在播通知，說明天停電。',
    { t: '冬天，炕燒得滾燙，一家人擠在上面看電視。', cond: (g) => !CN.alone(g) },
    '麥子黃了，聯合收割機一天就能收完一個村。',
    '紅磚房的牆上，還留著幾十年前刷的標語，字已經看不清了。',
    '村裡的年輕人走了大半，過年才回來，開著各種牌子的車。',
    { t: '院子裡的棗樹結了果，你爬上去摘，被奶奶罵了下來。', minAge: 6, maxAge: 13, cond: (g) => has(g, 'gm') },
    '傍晚的風裡有燒秸稈的味道。',
    '村裡的廣場上，晚上有人跳廣場舞，音樂響到九點。',
    '誰家娶媳婦，流水席從中午擺到天黑，半個村子都來幫忙。',
    { t: '你在村口的小賣部買了一根冰棒，老闆娘多送了你一顆糖。', minAge: 4, maxAge: 14 },
  ]);
  JY.addFlavor('loc:village_s', [
    '山上的茶葉該採了，天不亮就有人上山。',
    '梅雨季，牆角長出了青苔，衣服一個星期曬不幹。',
    '村裡的祠堂翻修了，外出的人都捐了錢。',
    '稻田裡的青蛙叫了一整夜。',
    '竹林後面的小路，下雨天滑得站不住。',
    '老屋空了好幾年，門上的春聯褪成了白色。',
    '趕集的日子，鎮上擠滿了人，賣什麼的都有。',
    '端午節，河裡在划龍舟，鼓聲隔著幾座山都聽得見。',
    '山上的霧一直到中午才散。',
    { t: '你跟著大人去溪邊洗菜，腳泡在水裡，涼得直縮。', minAge: 4, maxAge: 14 },
    '誰家殺了年豬，請了半個村子的人來吃飯。',
  ]);
  JY.addFlavor('loc:village_w', [
    '風沙大的時候，天是黃的，出門要矇住臉。',
    '羊群從山坡上下來，揚起一路的土。',
    '夜裡的星星很多，多得有點嚇人。',
    '村裡的土坯房一年比一年少，新蓋的磚房刷著白牆。',
    '中午太陽毒，下午一過就冷，一天能穿過四季。',
    '遠處的雪山，一年到頭都是白的。',
    '村裡的光伏板鋪了一大片，在太陽底下閃著光。',
    { t: '喝的水是從很遠的地方引過來的。水龍頭裡流出來的時候，奶奶還會念一句好。', cond: (g) => has(g, 'gm') },
    '秋天，家家房頂上曬著金黃的玉米和紅辣椒。',
  ]);
  JY.addFlavor('loc:county', [
    { t: '縣城的主街上又開了一家奶茶店，門口排著隊。', minAge: 3 },
    { t: '縣城不大，走在街上，十個人裡有三個認識你。', minAge: 10 },
    '縣一中門口的文具店，開了三十年了。',
    '晚上的廣場上，跳舞的、擺攤的、遛娃的擠在一起。',
    '縣城新修了一個公園，有湖，有步道，週末人很多。',
    { t: '小區樓下的早餐店，豆漿還是一塊五一碗。', minAge: 3 },
    '縣城的房子不貴，可年輕人越來越少。',
    '過年的時候，縣城的路堵得像省城。',
    '縣醫院新蓋了一棟住院樓，比老樓高了一倍。',
    { t: '縣城的夜晚，九點以後街上就沒什麼人了，只有燒烤攤還亮著。', minAge: 3 },
    '親戚們都住得近，誰家燉了肉，半條街都知道。',
  ]);
  JY.addFlavor('loc:city', [
    '城裡的公交車換成了電動的，開起來沒有聲音。',
    '老城區的巷子拆了一半，剩下的一半成了網紅打卡地。',
    '週末的商場裡，人比貨多。',
    '下班高峰，過一個路口要等三個紅綠燈。',
    '小區門口新開了一家社群食堂，飯菜很便宜。',
    '江邊的步道修好了，晚上有很多人散步。',
    '城裡的房價這幾年沒怎麼動，大家都在等。',
    '夏天的夜市一直開到凌晨。',
    { t: '你在這座城市住久了，開始能分辨出不同街區的味道。', minAge: 12 },
    '小區裡的桂花開了，整棟樓都是香的。',
  ]);
  JY.addFlavor('loc:metro', [
    { t: '早高峰的地鐵裡，你的臉貼在別人的揹包上。', minAge: 6, maxAge: 70 },
    '寫字樓的燈，到半夜還亮著一大半。',
    { t: '你在這座城市住了很久，還是叫不出隔壁鄰居的名字。', minAge: 12 },
    '週末的公園裡，到處是遛狗的人和帶孩子的人。',
    '外賣騎手在樓下排成一排，等著電梯。',
    { t: '你在天橋上看了一會兒車流，像一條發光的河。', minAge: 6 },
    { t: '房租又漲了。你算了算，一個月的工資，三分之一交給了房東。', minAge: 22, maxAge: 60, cond: (g) => g.recall('house') === 'rent' && working(g) },
    { t: '凌晨兩點的街上，還有人在跑步。', maxAge: 84 },
    '無人駕駛的計程車在路邊等客，車裡沒有人。',
    '這座城市的冬天不下雪，可是風很冷。',
    '週末的美術館排起了長隊，排隊的人裡有不少是帶著孩子的。',
    { t: '你在街角發現了一家開了二十年的小麵館，從此有了自己的“食堂”。', minAge: 18 },
  ]);
  JY.addFlavor('loc:school', [
    '課間十分鐘，走廊裡全是跑來跑去的人。',
    '升旗儀式上，你在隊伍裡打了個哈欠，被班主任看見了。',
    '教室後面的黑板報，這期的主題是“我的家鄉”。',
    '晚自習停電了，全班一起歡呼。',
    '你在課桌的抽屜裡發現了一張沒署名的紙條。',
    '體育課被數學老師借走了。',
    '學校食堂的番茄炒蛋，是全校公認最好吃的菜。',
    '期末考試前一天，教室裡安靜得只能聽見翻書聲。',
    '春遊那天，你的書包裡裝滿了零食，一本書也沒帶。',
  ]);
  JY.addFlavor('loc:campus', [
    '圖書館佔座的人，早上七點就排起了長隊。',
    '宿舍樓十一點熄燈，你們在黑暗裡聊到兩點。',
    '食堂三樓的麻辣燙，你吃了四年。',
    '你選了一門水課，結果被它吸引，每節都去聽。',
    '社團招新的時候，操場上擺滿了攤位。',
    '期末周，圖書館的每一張桌子都有人趴著睡覺。',
    '學校的貓比學生還多，每一隻都有名字。',
    '畢業前的那個夏天，到處都有人在拍照。',
    '下雨天，室友多帶了一把傘，在教學樓門口等你。',
  ]);
  JY.addFlavor('loc:factory', [
    { t: '流水線一刻不停，你閉著眼睛都能做完手上的活。', maxAge: 70 },
    '車間裡的機器越來越多，人越來越少。',
    { t: '下夜班的時候，天剛剛亮，廠門口的包子鋪正在開張。', maxAge: 70 },
    { t: '宿舍裡八個人，來自五個省，說話各有各的口音。', maxAge: 50 },
    '發工資那天，廠門口的小飯館生意特別好。',
    '工友們在午休的時候刷短影片，笑聲此起彼伏。',
    { t: '你的手上起了一層繭，洗不掉了。', maxAge: 70 },
    '車間主任說，下個月要換新裝置，有一半的人要去學新東西。',
    { t: '工友過生日，大家湊錢買了個蛋糕，在車間門口分著吃了。', maxAge: 70 },
  ]);
  JY.addFlavor('loc:office', [
    { t: '工位上的綠蘿死了第三盆。', maxAge: 70 },
    '茶水間裡，大家都在說誰要離職了。',
    { t: '你在會議室裡開了三個小時的會，什麼也沒決定。', maxAge: 70 },
    '下午三點，整層樓都在點奶茶。',
    { t: '你給 AI 助手佈置了一個任務，它做得比你預想的好，你有點不是滋味。', maxAge: 70 },
    { t: '電梯裡碰見老闆，你們聊了二十秒的天氣。', maxAge: 70 },
    { t: '年終總結寫了三天，最後一句是“繼續努力”。', maxAge: 70 },
    { t: '你的工牌上的照片，還是剛入職時拍的。', maxAge: 70 },
    { t: '同事從老家帶回來一箱特產，挨個工位分了一圈。', maxAge: 70 },
  ]);
  JY.addFlavor('loc:hospital', [
    '醫院走廊的長椅上，坐滿了等著叫號的人。',
    '病房的窗外有一棵樹，葉子一片片地黃了。',
    '護士換了一批年輕的，說話都很溫柔。',
    '醫院門口的花店，生意總是很好。',
    '消毒水的味道，在衣服上留了好幾天。',
    '同病房的老人每天都有人來看，你看著他們說話。',
    '夜裡的病房很安靜，只有儀器偶爾滴一聲。',
    '機器人推著藥車在走廊裡穿過，說了一聲“請讓一讓”。',
    '隔壁床的人出院那天，把一兜沒吃完的橘子留給了你。',
  ]);
  JY.addFlavor('loc:home', [
    '小區樓下的快遞櫃又滿了。',
    '樓下的電動車充電樁前，每天晚上都排著隊。',
    '鄰居家的孩子在練鋼琴，同一首曲子彈了一個月。',
    '小區的業主群裡，為了停車位的事吵了一整晚。',
    { t: '你在陽臺上晾衣服，看見對面樓的人也在晾衣服。', minAge: 10 },
    '樓下的老人每天下午都坐在長椅上，等孫子放學。',
    { t: '快遞員認識你，不用看單子就知道你住幾樓。', minAge: 18 },
    '傍晚的時候，廚房裡飄出各家做飯的味道。',
    { t: '鄰居家包了餃子，端來一盤，說趁熱吃。', minAge: 3 },
  ]);
  JY.addFlavor('loc:coast', [
    '海風很鹹，衣服曬乾了也帶著一股潮味。',
    '退潮的時候，灘塗上全是趕海的人。',
    '漁船回港了，碼頭上一片吆喝聲。',
    '傍晚的海邊，有人在放風箏。',
    '颱風過後，海邊的沙灘上衝上來很多貝殼。',
    { t: '你在海邊買了一份炒花甲，坐在礁石上吃完了。', minAge: 6 },
    '海上的燈塔，每隔幾秒閃一次。',
    '夏天的海水浴場，人擠人。',
  ]);
  JY.addFlavor('loc:road', [
    '高速服務區裡，到處是趕路的人。',
    '車窗外的風景一片片往後退，你在車上睡著了。',
    '收費站排著長隊，過年的車流一眼望不到頭。',
    { t: '你在服務區吃了一碗很貴的泡麵，覺得格外好吃。', minAge: 6 },
    '路邊的山越來越高，訊號越來越弱。',
    '車裡放著一首老歌，你跟著哼了一路。',
    '天黑了，前面的車燈連成了一條線。',
    { t: '你在一個不知名的小鎮停下來，買了一袋當地的特產。', minAge: 16 },
  ]);

  /* 年度重心 */
  JY.addFlavor('focus:用功读书', [
    '你的錯題本寫滿了一本，又開了一本。',
    '你在臺燈下寫作業，寫到眼睛發酸。',
    { t: '你背單詞背到半夜，夢裡都在拼寫。', minAge: 10 },
    { t: (g) => '你考進了年級前五十，' + (has(g, 'mo') ? '媽媽' : '家裡人') + '高興得多做了兩個菜。', minAge: 10 },
    '你把一道難題想了三天，想通的那一刻，激動得拍了桌子。',
    '你的筆記被同學借去影印了一份又一份。',
  ]);
  JY.addFlavor('focus:贪玩', [
    '你和朋友在河邊玩了一下午，鞋子溼透了。',
    { t: '你攢錢買了一個新遊戲，玩了一整個週末。', minAge: 9 },
    '你在小區裡認識了一群新朋友，每天放學都約著一起玩。',
    { t: '你偷偷溜出去看了一場電影，回家撒了個謊。', minAge: 11 },
    { t: '你學會了打籃球，曬得黑了一圈。', minAge: 8 },
    '你作業沒寫完，被罰站了一節課。',
  ]);
  JY.addFlavor('focus:帮家里干活', [
    { t: '你幫家裡看店，學會了算賬，也學會了跟人討價還價。', cond: (g) => g.recall('family') === 'smallbiz' },
    { t: '你放學回家先餵雞，再寫作業。', cond: (g) => g.recall('hukou') === 'rural' },
    { t: (g) => '你幫' + (has(g, 'mo') && CN.livesWith(g, 'mo') ? '媽媽' : '家裡') + '做飯，第一次炒的菜鹹得沒法吃，大人全吃了。' },
    { t: '農忙的時候，你在地裡幹了一天，晚上手都抬不起來。', cond: (g) => g.recall('hukou') !== 'city' },
    '你會洗全家人的衣服了。',
    { t: (g) => '你照顧生病的' + CN.who(g, 'gm') + '，喂她吃藥，比大人還細心。', cond: (g) => has(g, 'gm') },
    '你把家裡的地拖得鋥亮，大人回來誇了一句，你高興了一晚上。',
  ]);
  JY.addFlavor('focus:学个特长', [
    '你練琴練到手指起繭。',
    '你的畫被貼在了學校的走廊上。',
    '你學了一年的書法，字終於不再歪了。',
    { t: '你參加了一個程式設計比賽，拿了個三等獎。', minAge: 9 },
    '你學游泳，從怕水學到能遊一千米。',
    '你跳舞跳得腳踝扭了，休息了兩個星期又去了。',
  ]);
  JY.addFlavor('focus:埋头工作', [
    { t: '你連續加了一個月的班，週末只想睡覺。', maxAge: 65 },
    { t: '你的專案做成了，團隊一起吃了頓火鍋。', maxAge: 70 },
    { t: '你在年終評選裡拿了個優秀，獎金不多，心裡很滿。', maxAge: 70 },
    { t: '你開始失眠，腦子裡全是沒做完的事。', minAge: 22, maxAge: 70 },
    { t: '你帶了一個新人，他問的問題，讓你想起了剛入行時的自己。', minAge: 25, maxAge: 70 },
    { t: '你升職了，換了一張大一點的桌子。', minAge: 24, maxAge: 60, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher', 'doctor', 'nurse'].includes(job(g)) },
    { t: '你把手上的活幹得又快又好，老師傅點了點頭，沒說話。', maxAge: 60, cond: (g) => ['worker', 'farmer', 'rider', 'driver', 'shop'].includes(job(g)) },
    { t: '這一年你一天假也沒請。年底算賬，多攢下了一點。', minAge: 18, maxAge: 70 },
  ]);
  JY.addFlavor('focus:学习充电', [
    { t: '你報了一個夜校的課，每週兩個晚上。', maxAge: 70 },
    { t: '你考下了一個證書，掛在了牆上。', maxAge: 70 },
    '你開始學一門外語，每天早上背二十個單詞。',
    '你看完了一本很厚的書，在最後一頁寫下了日期。',
    { t: '你跟著 AI 學了一門新技術，第一次用到工作裡，效果很好。', maxAge: 70, cond: working },
    { t: '你在老年大學學會了用電腦剪影片，給自己的生日做了一段。', minAge: 60 },
  ]);
  JY.addFlavor('focus:搞副业', [
    { t: '你下班後接了個小活，熬到半夜交了稿。', maxAge: 70 },
    { t: '你的副業賺了一筆小錢，你給自己買了一個心心念唸的東西。', maxAge: 75 },
    { t: '副業虧了一點錢，你安慰自己就當交學費。', maxAge: 75 },
    { t: '你在週末幫人拍婚禮影片，累得腰都直不起來。', maxAge: 60 },
    { t: '你開了個網店，第一單是你媽下的。', maxAge: 70, cond: (g) => has(g, 'mo') },
    { t: '你開了個網店，第一單是一個老同學下的，還給了個五星好評。', maxAge: 70, cond: (g) => !has(g, 'mo') },
  ]);
  JY.addFlavor('focus:陪伴家人', [
    { t: '你陪爸媽去了一趟他們年輕時去過的地方。', maxAge: 75, cond: (g) => has(g, 'fa') && has(g, 'mo') },
    { t: (g) => '你每個週末都回家吃飯，' + CN.who(g, 'mo') + '每次都做一大桌菜。', maxAge: 70, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: '你和家裡人一起包了餃子，包得奇形怪狀。', cond: (g) => !CN.alone(g) },
    { t: (g) => '你陪' + CN.who(g, 'k1', true) + '搭了一下午積木，聽' + ta(g, 'k1') + '講了一個沒有結尾的故事。', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 10 },
    { t: (g) => '你給' + CN.who(g, 'fa', true) + '買了一部新手機，教他用了一個下午。', cond: (g) => has(g, 'fa') },
    { t: '你們一家人去郊外野餐，曬了一天太陽。', cond: (g) => !CN.alone(g) },
    { t: '你給家裡打了很長一個電話，把這一年的事都說了一遍。', cond: (g) => CN.alone(g) && (parentsAlive(g) || kids(g).length > 0 || has(g, 'sib0')) },
    '你翻出老照片，一張張發到家族群裡，群裡熱鬧了一晚上。',
    { t: (g) => '你陪' + CN.who(g, olderSib(g) || 'sib0', true) + '喝了一晚上茶，聊起小時候搶遙控器的事，笑得直拍桌子。', minAge: 25, cond: (g) => has(g, 'sib0') },
  ]);
  JY.addFlavor('focus:锻炼身体', [
    { t: '你每天早上跑五公里，跑完覺得整個人都醒了。', maxAge: 70 },
    { t: '你辦了一張健身卡，這一次真的堅持了下來。', maxAge: 75 },
    { t: '你學會了游泳，每週去兩次。', maxAge: 80 },
    { t: '你戒了夜宵，體重降了五斤。', maxAge: 70 },
    { t: '你爬了一座山，在山頂看了一場日出。', maxAge: 75 },
    '體檢的時候，醫生說你的各項指標都不錯。',
    { t: '你每天早上在公園裡打一套太極拳，打完渾身暖和。', minAge: 50 },
    { t: '你每天飯後繞著小區慢慢走兩圈，鄰居們都認識你了。', minAge: 60 },
  ]);
  JY.addFlavor('focus:躺平休息', [
    '你在家躺了一整個週末，看完了一部很長的劇。',
    { t: '你關掉了工作群的訊息提醒，世界一下安靜了。', maxAge: 70, cond: working },
    '你睡到了中午才起，陽光照在被子上。',
    '你什麼也沒做，就是坐在陽臺上喝茶。',
    '你發現，什麼都不幹的日子，也挺好的。',
  ]);
  JY.addFlavor('focus:出去走走', [
    '你去了一座從沒去過的城市，吃了當地人推薦的小吃。',
    '你在一個古鎮住了幾天，每天睡到自然醒。',
    { t: '你一個人去爬了雪山，在山腳下就有高原反應了。', maxAge: 65 },
    '你在火車上認識了一個人，聊了一路。',
    '你去看了海，在沙灘上坐到天黑。',
    '你在旅途中丟了一個包，又被好心人送了回來。',
    { t: '你跟著老年旅遊團去了南方，團裡最小的六十五，最大的八十二。', minAge: 62 },
  ]);
  JY.addFlavor('focus:含饴弄孙', [
    { t: (g) => '你每天接送' + CN.who(g, gks(g)[0]) + '上學，在校門口和別的老人聊天。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 12) },
    { t: (g) => CN.who(g, gks(g)[0]) + '學會了叫你，你高興了好幾天。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 2) },
    { t: '你給孫輩講故事，講著講著，自己先睡著了。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 2 && g.ageOf(id) <= 9) },
    { t: '孫輩調皮，把你的老花鏡藏了起來，你找了一下午。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 10) },
    { t: '你教孫輩下象棋，孩子第一次贏了你，你故意沒讓。', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 6) },
    { t: '家裡還沒有孫輩。你常去社群，幫著看鄰居家的小孩寫作業。', cond: (g) => !gks(g).length },
    { t: '孫輩長大了，不用你帶了。你把他們小時候的玩具洗乾淨，收進了櫃子。', cond: (g) => gks(g).length > 0 && gks(g).every((id) => g.ageOf(id) >= 13) },
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
    RG('东北', ['冬天的暖氣燒得很足，屋裡能穿短袖，窗戶上結著冰花。', { t: '你在冰面上打出溜滑，摔了個四仰八叉。', maxAge: 50 }, '過年的飯桌上，一定有一盤酸菜燉粉條。', '東北的冬天，下午四點天就黑了。', '你說話越來越像你爸，一句話三個“嘎哈”。', '小區門口賣凍梨的大娘，一年只出攤一個冬天。', '你學會了穿秋褲，一穿就是半年。', '燒烤攤上，鐵籤子堆成了小山。', '夏天的傍晚，涼風一吹，整個城市都在外面吃燒烤。', '你家的老房子，暖氣片刷了一層又一層銀粉。', '雪化的時候，路上全是泥。', { t: '你和朋友在澡堂子裡泡了一下午，出來吃了一碗冷麵。', minAge: 14 }, '早市上，大娘把一兜黏豆包塞給你，說是自家蒸的。', '冬天的陽臺就是冰箱，凍餃子、凍梨、凍柿子擺了一排。', '過年貼春聯，漿糊在門上凍住了。']),
    RG('华北', ['冬天的霧霾比小時候少多了，藍天越來越多。', '春天的柳絮飄得到處都是，你一直打噴嚏。', '餃子是一年到頭的主食，過年包，冬至包，來客人也包。', '夏天的西瓜一塊錢一斤，你一個人能吃半個。', '北方的秋天很短，一轉眼樹葉就掉光了。', { t: '你學會了包包子，褶子捏得比你媽還好看。', minAge: 12 }, '過年的廟會，人擠得走不動道。', '你吃了一碗炸醬麵，面碼擺了七八樣。', '風大的時候，出門得眯著眼睛走。', '暖氣來的那天，全樓的人都鬆了一口氣。', '秋天，柿子掛在光禿禿的樹上，紅得像一盞盞燈籠。']),
    PV(['北京'], ['早點鋪子裡，豆汁和焦圈的攤位前排著隊。', '晚上的衚衕裡，有人在下棋，有人在乘涼。', '你家的老人每天早上去公園遛鳥。']),
    PV(['天津'], ['早上一套煎餅果子，薄脆要多加一個。', '天津人說話自帶包袱，買個菜都像在聽相聲。']),
    PV(['山西'], ['山西人一頓不吃麵就心慌。刀削麵、貓耳朵、剔尖，換著花樣吃。', '醋是每張飯桌上都少不了的。']),
    PV(['內蒙古'], ['草原上的夏天，天藍得發亮，羊群像撒在山坡上的白雲。', '一碗奶茶配一盤手把肉，是招待客人的規矩。']),
    RG('华东', ['梅雨季，家裡的牆角長出了黴點，衣服一直曬不幹。', '江南的春天，到處都是油菜花。', '夏天的午後，雷陣雨說來就來。', '過年的時候，桌上一定有一條魚，寓意年年有餘。', '黃梅天過去，被子拿到太陽底下曬，曬完有一股太陽的味道。', '青團上市了，你一口氣吃了三個。']),
    PV(['上海', '江蘇', '浙江'], ['早上的小籠包，湯汁燙了你的舌頭。', '樓下的阿婆說話軟軟糯糯的，你聽了半天才聽懂。', '弄堂裡的老人搖著扇子，在門口乘涼。']),
    PV(['上海'], ['你吃了一客生煎，配了一碗咖哩牛肉湯。']),
    PV(['浙江'], ['你在西湖邊走了一下午，看見了很多拍婚紗照的人。']),
    PV(['江蘇'], ['秋天吃大閘蟹，家裡人能剝一個下午。', '一碗鴨血粉絲湯，幾塊錢，暖到胃裡。']),
    PV(['山東'], ['山東人的飯桌，主座誰來坐，要推讓上三回。', '大蔥蘸醬，煎餅卷一切。', '過年走親戚，進門先磕頭，拜年要拜一整天。']),
    PV(['福建'], ['大人們喝茶，小小的杯子，一泡就是一下午。', '一碗沙茶麵，湯頭濃得化不開。']),
    PV(['安徽', '江西'], ['早上一碗米粉，澆上辣椒，一天都有勁。', '山裡的徽派老房子，白牆黑瓦，下雨天像一幅畫。']),
    RG('华中', ['夏天熱得像蒸籠，你家的空調從五月開到十月。', '過年的時候，家家都在燻臘肉、灌香腸。', '你吃了一盤小龍蝦，辣得滿頭大汗。', '冬天沒有暖氣，冷得鑽心，你在家裡也穿著羽絨服。', '油菜花開的時候，田野一片金黃。', '端午節，吃粽子、看龍舟，街上熱鬧得很。', '你學會了說幾句方言，一開口就被本地人認出來是外地的。']),
    PV(['湖北'], ['早上來一碗熱乾麵，芝麻醬拌得勻勻的。', '長江邊的夜景很美，輪渡上全是看燈的人。']),
    PV(['湖南'], ['湘江邊上，有人在冬泳。', '你家門口的米粉店，開了二十年了。', '你在樓下的小攤上吃了一碗臭豆腐，聞著臭，吃著香。']),
    PV(['河南'], ['一碗燴麵，面寬得像腰帶。', '胡辣湯配油條，是你家的早飯。', '河南人說話，一句“中”就什麼都說了。']),
    RG('华南', ['回南天，牆上、地上全是水珠，衣服永遠是溼的。', '一年四季都能穿短袖，冬天也就冷那麼幾天。', '颱風天，學校停課，你在家裡待了一整天。', '樓下的榕樹，根鬚垂得長長的，像老人的鬍子。', '夏天的蟑螂會飛，你嚇得跳上了床。', '雨說下就下，說停就停，太陽一出來，地上就蒸起白氣。']),
    PV(['廣東'], ['早上去喝早茶，一盅兩件，坐了一上午。', '你學會了說“唔該”和“得閒飲茶”。', '街邊的糖水鋪，開到半夜兩點。', '過年的花市，人山人海，你買了一盆金桔回家。', '你吃了一碟腸粉，配了一杯涼茶，苦得皺眉。']),
    PV(['廣西'], ['一碗螺螄粉，整層樓都知道你在吃什麼。', '三月三，街上有人對山歌，你也跟著哼了兩句。']),
    PV(['海南'], ['椰子掉在路邊，沒人去撿。', '海南的太陽毒，你永遠曬不白。', '你在海邊吃了一頓海鮮，比內地便宜一半。']),
    RG('西南', ['趕場天，鎮上的人比過年還多。', '雨季來了，雨一下就是半個月。', '過年的時候，家裡要做臘肉、灌香腸，掛滿了陽臺。', '山路彎彎繞繞，坐車坐得人發暈。']),
    PV(['四川', '重慶'], [{ t: '你在火鍋店裡吃到了深夜，衣服上全是牛油味。', minAge: 12 }, '下午的茶館裡，老人們在打麻將，一打就是一下午。', '你學會了說“巴適”，什麼好東西都說“巴適得板”。']),
    PV(['重慶'], ['山城的路上上下下，導航也會迷路。', '霧很大的時候，對面的樓都看不見。', { t: '你吃了一碗酸辣粉，辣得嘴唇發麻。', minAge: 10 }]),
    PV(['貴州', '四川', '雲南'], ['你學會了吃折耳根，一開始覺得怪，後來離不開了。']),
    PV(['雲南'], ['你家樓下的米線店，一碗米線配三樣小菜。', { t: '你騎車去了一趟湖邊，風吹得很舒服。', maxAge: 75 }, '雨季的菌子上市了，家家都在炒菌子，大人說一定要炒熟。']),
    PV(['貴州'], ['一碗酸湯魚，酸得你直眯眼睛，又忍不住多喝一碗。']),
    PV(['西藏'], ['酥油茶喝慣了，到了外地反倒想得慌。', '轉經的老人從你身邊走過，嘴裡唸唸有詞。', '太陽很近，天很藍，臉上曬出了兩塊紅。']),
    RG('西北', ['風沙大的時候，嘴裡全是沙子。', '晚上的夜市，烤肉的香味飄了幾條街。', '冬天的風像刀子，出門要裹得嚴嚴實實。', '你家的窗臺上，總晾著一排風乾的辣子。', '天很高，雲很低，好像伸手就能摸到。', '過年的時候，家裡炸了一大鍋油餅。']),
    PV(['甘肅', '青海', '寧夏'], ['早上一碗牛肉麵，一清二白三紅四綠。', '你學會了唱一首花兒，調子高得你唱不上去。']),
    PV(['陝西'], ['你吃了一碗羊肉泡饃，饃掰得越碎越好吃。', '你吃了一碗涼皮，配了一個肉夾饃。', '一碗油潑面，辣子一潑，滋啦一聲，香了一屋子。']),
    PV(['新疆'], ['夏天的瓜果特別甜，一個哈密瓜你一個人吃了一半。', '秋天的胡楊林，黃得像著了火。', '晚上十點天還亮著，大人們在葡萄架下吃飯聊天。']),
    TIER([1], [{ t: '你週末去看了一個展，排隊排了一個小時，看了二十分鐘。', minAge: 10 }, '小區樓下的便利店二十四小時亮著燈。', { t: '地鐵換乘要走十分鐘，你走得比誰都快。', minAge: 18, maxAge: 70 }]),
    TIER([2, 3], ['城裡新開了一座圖書館，週末的座位要搶。', '江邊的燈光秀，每到週末就有很多人去看。']),
    TIER([4], ['縣城的菜市場早上最熱鬧，賣菜的大多是附近村裡的人。', '縣城的人結婚，酒席要擺三天，請帖發遍了半條街。']),
    TIER([5], ['村裡的小賣部也能收快遞了。', '傍晚，誰家的煙囪先冒煙，誰家就先開飯。', '村裡修了水泥路，路燈一直亮到村尾。']),
    [
      { t: '你在地鐵上被人認出來，說是當年救人的那個人。你擺擺手說不是。', cond: (g) => g.f('evSavedLife') },
      { t: '那個走丟的孩子的媽媽，每年過年都會給你發一條祝福。', cond: (g) => g.f('evFoundKid') },
      { t: '老家寄來一箱今年的新果，箱子上印著村裡的牌子。', cond: (g) => g.f('evVillageShop') },
      { t: '你在社群活動室的牆上，看到了自己做志願者時的照片。', cond: (g) => g.f('evVolunteer') },
      { t: '你路過那個路口，紅綠燈旁新裝了一個攝像頭。你想起了那場車禍。', cond: (g) => g.f('evWitness') },
      // 温暖的日常，不分地区
      { t: '一場雨過後，天邊掛了一道彩虹，路上好多人停下來拍照。', minAge: 3 },
      { t: '冬天的第一場雪落下來，你站在窗邊看了很久。', minAge: 3, cond: (g) => !['华南'].includes(g.recall('region')) },
      { t: '樓下新開了一家麵包店，傍晚打折，你買了一袋。', minAge: 10 },
      { t: '路邊的早點攤多給了你一根油條，說今天生意好。', minAge: 8 },
      { t: '這一年夏天，你在涼蓆上睡了一個很長的午覺，醒來的時候窗外蟬在叫。', minAge: 4 },
      { t: '你和家裡人一起看了一部老電影，笑得前仰後合。', minAge: 6, cond: (g) => !CN.alone(g) },
      { t: '中秋節的晚上，月亮很圓。你吃了半塊月餅，剩下半塊放到了第二天。', minAge: 4 },
      { t: '過年守歲，零點的時候外面的煙花一下子全亮了。', minAge: 4 },
    ],
  ));
})();

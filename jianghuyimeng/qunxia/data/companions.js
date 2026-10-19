/* 群侠 · 同伴的故事，以及哪里都能做的事（anywhere: true）
 * 同伴的故事用 anywhere + cond: g.inParty(...)，在同行时出现在行动列表里。 */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEvents([
    /* ---------- 以剑斩刀：倚天剑、屠龙刀里藏着的东西 ---------- */
    { id: 'any_swords', anywhere: true, act: '以倚天剑斩屠龙刀', cond: (g) => g.has('yitian') && g.has('tulong') && !g.has('wumu'), t: '刀剑互斫',
      text: (g) => '倚天剑在左，屠龙刀在右。' + (g.f('heardSwordSecret') ? '灭绝师太说过：刀剑互斫，才见真经。' : '说书先生讲过，这两样东西是郭大侠夫妇铸的，里头藏着东西。') + '你举起了剑。',
      choices: [
        { t: '砍下去', fx: (g) => { g.give('wumu'); g.give('jiuyin'); }, res: '火星四溅。刀身裂开一道缝，掉出两卷薄绢：一卷是武穆遗书，一卷是九阴真经。刀和剑都还能用。' },
        { t: '还是不要毁了它们', fx: (g) => g.add('品德', 1), res: '你把刀剑收了起来。' },
      ] },

    /* ---------- 殷离 ---------- */
    { id: 'cp_yinli_face', anywhere: true, act: '问殷离脸上的毒', cond: (g) => g.inParty('yinli') && !g.f('yinliFace') && !g.f('yinliTalked'), t: '殷离的脸',
      text: '夜里殷离睡不着，摸着自己肿起来的脸。她说她娘就是被人欺负死的，她练千蛛万毒手，是不想再被人欺负。',
      choices: [
        { t: '照胡青牛医经上的方子替她解毒', cond: (g) => g.has('yijing'), check: ['资质', '易'], fx: (g) => { g.set('yinliFace'); g.add('品德', 5); },
          res: '你配了三天的药。第七天，她脸上的肿消了。她在溪边照了很久，回来的时候眼睛是红的。', fail: { fx: (g) => g.set('yinliTalked'), res: '药没配对。她说算了，反正也习惯了。' } },
        { t: '劝她别练了', fx: (g) => { g.set('yinliTalked'); g.add('品德', 2); }, res: '她没说话。第二天你发现，她把装毒蛛的金盒子扔进了河里。' },
        { t: '让她教你这门功夫', cond: (g) => g.st('品德') < 40, fx: (g) => { g.set('yinliTalked'); g.learn('qianzhu', 1); g.add('品德', -3); }, res: '她把手伸进金盒子里给你看。你学会了，手肿了三天。' },
      ] },
    { id: 'cp_yinli_aniu', anywhere: true, act: '殷离听说了张无忌的事', cond: (g) => g.inParty('yinli') && g.after(134, 6), t: '阿牛哥',
      text: '殷离在路上听人说，明教的新教主叫张无忌。她站住了：“张无忌……那个咬我手的人，就叫张无忌。”',
      choices: [
        { t: '陪她去找他', fx: (g) => { g.dismiss('yinli', '殷离说她要自己去找他。她走了几步，又回头冲你挥了挥手。'); g.add('品德', 3); g.set('yinliSearch'); }, res: '你送她到了路口。' },
        { t: '劝她：他心里未必有你', fx: (g) => { g.set('yinliStay'); g.add('品德', -1); }, res: '她骂了你一路，可是没走。' },
      ] },

    /* ---------- 韦一笑 ---------- */
    { id: 'cp_wei_cold', anywhere: true, act: '韦一笑寒毒发作', cond: (g) => g.inParty('weiyixiao') && !g.f('weiCured') && !g.f('weiBlood') && g.S.comp.weiyixiao && g.day - g.S.comp.weiyixiao.since > 20, t: '寒毒',
      text: '韦一笑缩在火堆边，牙齿打战，脸上一层白霜。他咬着牙说：“走远一点。我忍不住的时候，会咬人。”',
      choices: [
        { t: '用九阳神功替他驱毒', cond: (g) => g.lv('jiuyang') >= 3, fx: (g) => { g.set('weiCured'); g.add('品德', 5); g.restMp(-999); }, res: '你把手按在他背上，运了一夜的九阳真气。天亮时，他脸上的白霜化了。“二十年了……”他说不下去。' },
        { t: '割一碗自己的血给他', fx: (g) => { g.hurt(60); g.add('品德', 4); g.set('weiOwe'); }, res: '他喝了，缓了过来。他没有谢你，可是后来打架，他总挡在你前面。' },
        { t: '抓个路过的元兵给他', fx: (g) => { g.add('品德', -10); g.set('weiBlood'); }, res: '元兵后来没再醒过来。韦一笑擦了擦嘴，看你的眼神变了，像是看一个同类。' },
      ] },

    /* ---------- 周颠 ---------- */
    { id: 'cp_zhou_yang', loc: 'guangming', arrive: true, cond: (g) => g.inParty('zhoudian') && g.before(134, 5), t: '周颠上山',
      text: '一到光明顶，周颠就要冲进大殿找杨逍算账：“老周今天不打这一架，就不姓周！”',
      choices: [
        { t: '拉住他', check: ['根骨', '中'], fx: (g) => { g.set('zdCalm'); g.add('品德', 2); }, res: '你死死抱住他的腰。他骂了半天，骂累了，坐下喝酒。', fail: { fx: (g) => g.hurt(30), res: '他一甩手把你甩开，冲进去跟杨逍打了一架，鼻青脸肿地出来了。' } },
        { t: '帮他一起骂', fx: (g) => { g.add('声望', 2); g.set('zdLoud'); }, res: '你们两个在殿外骂了一个时辰。杨逍始终没出来。' },
      ] },
    { id: 'cp_zhou_drink', anywhere: true, act: '陪周颠喝酒', cond: (g) => g.inParty('zhoudian') && g.money() >= 5, once: false, t: '喝酒',
      text: '周颠说他嘴里淡出鸟来了，非要找个地方喝两碗。',
      choices: [
        { t: '请他喝（5 两）', cost: { 银两: 5 }, fx: (g) => { g.add('声望', 1); g.restMp(30); }, res: '他喝高了，讲了一晚上五散人当年的事。' },
        { t: '不请', res: '周颠说你小气，自己去讨了一碗。' },
      ] },

    /* ---------- 小昭 ---------- */
    { id: 'cp_xz_mother', loc: 'lingshe', arrive: true, cond: (g) => g.inParty('xiaozhao') && g.alive('jinhua') && g.before(135, 8), t: '灵蛇岛',
      text: '小昭一上岛，就看见了金花婆婆。她的手在抖。夜里她对你说：“那是我娘。”',
      choices: [
        { t: '替她保守秘密', fx: (g) => { g.set('knowXiaozhaoMother'); g.add('品德', 2); }, res: '小昭说，她娘犯了波斯总教的规矩，她进光明顶，就是想替娘找乾坤大挪移，好去赎罪。' },
        { t: '劝她们母女相认', check: ['资质', '中'], fx: (g) => { g.set('knowXiaozhaoMother'); g.set('xzReunion'); }, res: '那天晚上，木屋里传出了哭声，哭了很久。', fail: { fx: (g) => g.set('knowXiaozhaoMother'), res: '金花婆婆冷冷地说她没有女儿。小昭一夜没睡。' } },
      ] },

    /* ---------- 常遇春 ---------- */
    { id: 'cp_cyc_grave', loc: 'hudie', arrive: true, cond: (g) => g.inParty('changyuchun'), t: '常遇春',
      text: '常遇春在胡青牛的坟前磕了三个头，额头上全是土。',
      choices: [
        { t: '陪他磕头', fx: (g) => { g.add('品德', 2); g.set('cycGrave'); }, res: '常遇春说，胡先生救人不图名，他这辈子也要这样。' },
        { t: '在一旁等他', res: '风吹着坟上的草。' },
      ] },
    { id: 'cp_cyc_army', anywhere: true, act: '常遇春要去濠州', cond: (g) => g.inParty('changyuchun') && g.after(136, 2), t: '濠州',
      text: '常遇春说朱元璋在濠州起兵了，他要去投军。“兄弟，一起去？将来打下天下，咱们都是功臣。”',
      choices: [
        { t: '送他到濠州', fx: (g) => { g.days(15); g.set('joinedZhu'); g.add('声望', 10); g.dismiss('changyuchun', '常遇春在濠州城下跟你分了手。'); }, res: '你在濠州城外看着他进了军营。后来你听说，他打仗从来不退。' },
        { t: '各走各的路', fx: (g) => g.dismiss('changyuchun', '常遇春大笑一声，拍马走了。'), res: '你们在路口喝了一碗酒。' },
      ] },

    /* ---------- 赵敏 ---------- */
    { id: 'cp_zm_heart', anywhere: true, act: '赵敏说起一个人', cond: (g) => g.inParty('zhaomin') && g.after(134, 9), t: '赵敏',
      text: '赵敏骑在马上，忽然问你：“你说，一个人为了另一个人，能不能连爹娘都不要？”',
      choices: [
        { t: '能，跟着心走', fx: (g) => { g.set('zmFollowHeart'); g.add('品德', 2); }, res: '她笑了，笑得很开心。那几天她总在发呆。' },
        { t: '不能，王府才是你的家', fx: (g) => { g.set('zmStayWang'); g.add('品德', -2); g.add('银两', 50); }, res: '她不笑了，扔给你一袋银子：“你说得对。”' },
      ] },
  ]);
})();

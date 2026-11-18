/* 江湖一梦 · 中年与晚年的人物专属节点
 * 45 岁以后，这些人原来只靠通用奇遇撑着。这里给每个人补上贴着他们自己经历的节点：
 * 郭靖、黄蓉、穆念慈、杨过、赵敏、张无忌各 4 个，其余六人各 2 个。
 * 杨康、穆念慈、李莫愁在原著里早死，他们的节点只在改命救下他们之后才出现。
 * 节点按“纪年 y”或“年龄 age”挂在人物的 arc.nodes 上（和原来的写法一样），载入顺序在三本书之后。
 */
(function () {
  'use strict';
  const JY = window.JY;

  const add = (id, nodes) => { const c = JY.byId[id]; if (c && c.arc) c.arc.nodes.push(...nodes); };
  const live = (g, id) => !JY.byId[id] || g.alive(id);
  const xy = (g) => g.loc === 'xiangyang';
  const married = (g) => !g.f('jingrongApart') && !g.f('rongDied') && !g.f('jingStayMongol');
  const hasYG = (g) => live(g, 'yangguo');

  JY.addFlags({
    guoSentWine: '郭靖派人给杨过送去了一坛桃花岛的酒',
    guoLetterYang: '郭靖写信请杨过回襄阳',
    guoSelfPaid: '郭靖拿自己的积蓄养着被裁的老兵',
    guoMemorial: '郭靖上书朝廷，直陈襄阳存亡',
    boyAway: '郭靖把襄阳城里的孩子送去了桃花岛',
    guoFamiliesOut: '郭靖把守城老兵的家眷悄悄送出了襄阳',
    guoCalledYang: '郭靖请杨过回襄阳共守',
    xyFarms: '黄蓉在襄阳开荒屯田',
    rongFalseNews: '黄蓉放走内奸，借他传了假消息',
    rongManual: '黄蓉把守城的法子写成了册子，交给郭襄',
    xyChronicle: '有人把襄阳守城的事写成了书，黄蓉看过稿子',
    ygToldTruth: '穆念慈把杨康的事全告诉了杨过',
    ygToldHero: '穆念慈只告诉杨过，他的父亲是个好汉',
    kangStone: '穆念慈给杨康立了碑',
    ygKneltKang: '杨过在杨康坟前磕过头',
    mnBesideKang: '穆念慈葬在铁枪庙杨康的坟旁',
    mnBesideTiexin: '穆念慈葬在牛家村杨铁心夫妇身边',
    mnRiver: '穆念慈的骨灰撒进了钱塘江',
  });

  /* ================= 郭靖（纪年 y = 年龄 + 1） ================= */
  add('guojing', [
    { id: 'gj_polu', y: 46, t: '垛口', cond: xy,
      text: (g) => (married(g) ? '破虏六岁了，天天扒在城墙垛口上看蒙古人的营火。' : '守城老兵的一个孩子，六七岁，天天跟在你后面扒着垛口看蒙古人的营火。') + '他问你，打仗是什么样的。',
      choices: [
        { t: '让他跟着老兵们一起操练', canon: true, fx: (g) => { g.remember('gj_boy', 'army'); g.stat('情义', 2); }, res: '他和守城的兵一起长大，手上的茧比谁都早。' },
        { t: '亲手教他降龙十八掌的起手', dev: 10, cond: (g) => !g.f('jingNoXianglong'), fx: (g) => { g.remember('gj_boy', 'palm'); g.stat('情义', 3); }, res: '你教他第一掌。他练了三个月，手掌肿得握不住筷子，没喊过一声疼。' },
        { t: '送他去桃花岛念书，不让他沾兵器', dev: 20, fx: (g) => { g.set('boyAway'); g.stat('心境', -3); }, res: '他走那天回了三次头。你站在城头，没有招手。' },
      ] },
    { id: 'gj_shendiao', y: 52, t: '神雕大侠', cond: (g) => !g.f('jingStayMongol') && hasYG(g),
      text: (g) => '襄阳的茶馆里都在说一个神雕大侠，一个人杀了蒙古的先锋大将。你问来人，他说那人' + (g.f('yangArm') ? '使一柄没有锋口的重剑' : '右袖是空的') + '。你知道他是谁。',
      choices: [
        { t: '不去找他，等他自己来', canon: true, fx: (g) => { g.remember('gj_yg', 'wait'); g.stat('心境', -2); }, res: '你等了几年。他是自己来的，来的时候城下正打着仗。' },
        { t: '派人把一坛桃花岛的酒送去终南山', dev: 8, fx: (g) => { g.set('guoSentWine'); g.stat('情义', 3); }, res: '酒送到了。回信只有两个字：“收到。”' },
        { t: '写信请他回襄阳，只提守城，不提旧事', dev: 15, check: ['情义', 60], fx: (g) => { g.set('guoLetterYang'); g.stat('情义', 4); }, res: '你写了三遍才写得不像命令。',
          fail: { fx: (g) => { g.remember('gj_yg', 'refused'); g.stat('心境', -4); }, res: '信退了回来，封口没有拆。', dev: 3 } },
      ] },
    { id: 'gj_court', y: 58, t: '裁兵', cond: xy,
      text: '襄阳守住了。临安来了钦差，说朝廷嫌守军花钱太多，要裁掉一半。你知道被裁的是谁，是跟了你二十年的那些老兵。',
      choices: [
        { t: '照办，只裁老弱', canon: true, fx: (g) => { g.remember('gj_court', 'cut'); g.stat('心境', -5); }, res: '你把名册一页一页念完。念到最后，没有人说话。' },
        { t: '拿出自己的积蓄养着，一个不裁', dev: 12, fx: (g) => { g.set('guoSelfPaid'); g.stat('声望', 5); g.stat('情义', 4); }, res: '你和蓉儿把桃花岛带来的东西一样样当了。老兵们不知道，只知道饷银一文没少。' },
        { t: '写一封长信，直陈襄阳存亡', dev: 20, check: ['声望', 70], fx: (g) => { g.set('guoMemorial'); g.stat('声望', 6); }, res: '你不会写文章，信里全是实话。钦差看完，沉默了很久，只裁了三成。',
          fail: { fx: (g) => { g.remember('gj_court', 'cut'); g.stat('心境', -6); }, res: '信递上去，没有回音。名册还是照原样裁了。', dev: 3 } },
      ] },
    { id: 'gj_vets', y: 66, t: '老兵', cond: xy,
      text: (g) => {
        let t = '守城的老兵一个个走了，有的病死，有的战死，有的回了乡。';
        if (g.f('guoSelfPaid')) t += '留下来的那些，是你用自己的钱养着的。';
        else if (g.recall('gj_court') === 'cut') t += '当年裁掉的那些人，你后来没再见过。';
        if (g.f('guoMemorial')) t += '朝廷里偶尔有人提起那封长信，说得最多的是它写得很笨。';
        if (g.recall('gj_boy') === 'palm') t += '破虏的掌力已经能震裂城砖。';
        else if (g.f('boyAway')) t += '桃花岛那边捎来话，那个孩子在读《孙子》。';
        if (g.f('guoSentWine') || g.f('guoLetterYang')) t += '终南山那边，一直没有人来。';
        if (g.recall('gj_yg') === 'wait') t += '神雕大侠是自己来的，来的时候城下正打着仗。';
        else if (g.recall('gj_yg') === 'refused') t += '你写给杨过的信被退了回来，封口没有拆。';
        if (g.f('ykApologized')) t += '嘉兴有人托人带来一封很短的信，是杨康写的。你看了三遍，把它收了起来。';
        return t + '蒙古人又在城外扎营了。';
      },
      choices: [
        { t: '守到最后，不留退路', canon: true, fx: (g) => { g.info('身份', '誓与襄阳共存亡的老将'); g.stat('声望', 4); }, res: '你把后路上的船都烧了。从那天起，城里再没有人提退字。' },
        { t: '把老兵的家眷悄悄送出城', dev: 20, fx: (g) => { g.set('guoFamiliesOut'); g.stat('情义', 5); }, res: '三百多口人，趁着夜里从水门走了。没有人告诉他们为什么。' },
        { t: '写信请杨过回襄阳共守', dev: 20, cond: hasYG, fx: (g) => { g.set('guoCalledYang'); g.stat('情义', 4); }, res: '信用快马送了出去。你不知道他会不会来，只知道城里缺一个人，是他。' },
      ] },
  ]);

  /* ================= 黄蓉（纪年 y = 年龄 + 4） ================= */
  add('huangrong', [
    { id: 'hr_tun', y: 51, t: '粮', cond: xy,
      text: '襄阳存粮见底。守军吃官粮，百姓吃自己的，年年有人饿死在城根下。靖哥哥只管守城，粮的事，他没有想过。',
      choices: [
        { t: '官粮民粮分开记，宁可自己少吃', canon: true, fx: (g) => { g.remember('hr_grain', 'ledger'); g.stat('声望', 3); }, res: '你亲手记了一本账。账上最后一行，每个月都写着“黄蓉自减一半”。' },
        { t: '开荒屯田，让兵闲时自己种粮', dev: 10, fx: (g) => { g.set('xyFarms'); g.stat('悟性', 2); }, res: '汉水边的荒地开出了几千亩。第二年秋天，城根下没有饿死一个人。' },
        { t: '把桃花岛攒下的珍玩拿去换粮', dev: 15, fx: (g) => { g.remember('hr_grain', 'sold'); g.stat('情义', 4); }, res: '父亲当年收的字画，一幅幅换成了米。你没写信告诉他。' },
      ] },
    { id: 'hr_spy', y: 55, t: '内奸', cond: xy,
      text: (g) => '军中有人把守城的虚实报给了蒙古人。' + (g.f('xyFarms') ? '你顺着线头查下去，牵出来的竟是屯田的一个管事。' : '你顺着线头查下去，牵出来的是一个跟了靖哥哥十年的人。'),
      choices: [
        { t: '当众揪出来，按军法办', canon: true, fx: (g) => { g.remember('hr_spy', 'public'); g.stat('声望', 4); g.stat('心境', -3); }, res: '他到死都没有求饶，只问了一句，蒙古人答应给他家里的粮，给了没有。' },
        { t: '放他回去，借他的嘴传假消息', dev: 20, check: ['悟性', 80], fx: (g) => { g.set('rongFalseNews'); g.stat('悟性', 3); }, res: '蒙古人信了。三个月后，他们的先锋扑进了一片空了的粮仓，里面埋着伏兵。',
          fail: { fx: (g) => { g.remember('hr_spy', 'fled'); g.stat('心境', -4); }, res: '他看穿了你的局，当夜就逃了。', dev: 3 } },
        { t: '把名单交给靖哥哥，让他决断', dev: 6, cond: married, fx: (g) => { g.remember('hr_spy', 'jing'); g.stat('情义', 4); }, res: '他看了很久，把名单烧了，说先打完这一仗。你没有问他是不是真的这样想。' },
      ] },
    { id: 'hr_book', y: 65, t: '兵法', cond: xy,
      text: (g) => '你们都老了，守城的法子却只在你一个人脑子里。' + (g.f('rongFalseNews') ? '那个放回去的内奸的事，你一个字也不敢写下来。' : g.recall('hr_spy') === 'public' ? '军中的人如今都叫你“黄帮主”，没有人敢再提那个内奸。' : '') + (g.recall('hr_grain') === 'ledger' ? '你那本账，还摆在案头。' : ''),
      choices: [
        { t: '口述给守将们，各记各的', canon: true, fx: (g) => { g.info('身份', '襄阳军师'); g.stat('声望', 3); }, res: '十几个守将，十几种记法。后来城破，一本也没有传下来。' },
        { t: '写成一册，交给襄儿带走', dev: 12, cond: (g) => !JY.byId.guoxiang || g.alive('guoxiang'), fx: (g) => { g.set('rongManual'); g.stat('情义', 4); }, res: '你写了三个月。襄儿接过去，什么也没说，贴身收好。' },
        { t: '烧掉，只记在脑子里', dev: 8, fx: (g) => { g.remember('hr_burn'); g.stat('悟性', 2); }, res: '你把稿纸一页页扔进火盆。靖哥哥问为什么，你说，这些东西，落到谁手里都不是好事。' },
      ] },
    { id: 'hr_visit', y: 78, t: '书生', loc: 'hut', cond: (g) => g.f('guoSurvive') || g.f('rongEscaped'),
      text: (g) => '终南山下来了一个书生，说想把襄阳守城的事写成书，问你要不要看稿子。' + (g.f('rongManual') ? '他手里竟有半册你写的兵法，是襄儿一路流传出去的。' : g.recall('hr_burn') ? '你说，该记的都在脑子里，没有稿子可看。' : ''),
      choices: [
        { t: '看稿子，改了三处', canon: true, fx: (g) => { g.set('xyChronicle'); g.stat('心境', 4); }, res: '你改的三处，全是他写得太好的地方。你让他照实写。' },
        { t: '不看，请他照原样写', dev: 5, fx: (g) => { g.info('身份', '襄阳旧事的见证人'); g.stat('心境', 3); }, res: '书后来传下来了。里面的黄蓉，比你聪明，比你好看。' },
        { t: '请他把靖哥哥写得笨一点', dev: 10, fx: (g) => { g.stat('情义', 4); }, res: '书生笑了。你也笑了。你说：“不用写，他本来就是。”' },
      ] },
  ]);

  /* ================= 穆念慈（纪年 y = 年龄；改命救下之后才有） ================= */
  add('munianci', [
    { id: 'mn_truth', y: 44, t: '父亲', cond: (g) => g.f('munianciLives'),
      text: '过儿二十四岁了。他一直不知道父亲是谁。有一天，他问：“娘，爹到底是个什么人？”',
      choices: [
        { t: '全说了：他是你爹，做过糊涂事，也留下了你', canon: true, fx: (g) => { g.set('ygToldTruth'); g.stat('情义', 3); }, res: '过儿听完，坐了一夜。天亮时他说：“我知道了。”' },
        { t: '只说他是个好汉，战死在沙场', dev: 10, fx: (g) => { g.set('ygToldHero'); g.stat('心境', -2); }, res: '过儿点点头，没有多问。你不知道他信了几分。' },
        { t: '不说，等他自己去查', dev: 5, fx: (g) => { g.remember('mn_silent'); g.stat('心境', -3); }, res: '你把话咽了回去。过儿看了你一会儿，也没有再问。' },
      ] },
    { id: 'mn_grave', y: 49, t: '清明', cond: (g) => g.f('munianciLives'),
      text: (g) => '清明，你去铁枪庙旁边看那座土坟。坟头的草是你每年亲手拔的。' + (g.recall('mn_silent') ? '过儿站在你身后，已经不再问了。' : ''),
      choices: [
        { t: '立一块碑，写“杨康之墓”', canon: true, fx: (g) => { g.set('kangStone'); g.stat('心境', 3); }, res: '石匠问你写什么字，你说，就写他的名字。' },
        { t: '什么也不立，只栽一棵树', dev: 5, fx: (g) => { g.remember('mn_tree'); g.stat('心境', 2); }, res: '树长得很慢。你想，等它长高了，应该没有人再记得那里埋的是谁。' },
        { t: '带过儿一起来，让他自己磕头', dev: 10, cond: hasYG, fx: (g) => { g.set('ygKneltKang'); g.stat('情义', 4); }, res: '过儿跪下去，磕了三个头。起身时他的脸上没有表情。' },
      ] },
    { id: 'mn_xy', y: 54, t: '襄阳来人', cond: (g) => g.f('munianciLives'),
      text: '黄蓉托人捎话：襄阳缺人手，城里的兵衣没人缝。你知道这是个借口，她是怕你一个人在嘉兴。',
      choices: [
        { t: '不去，说嘉兴挺好', canon: true, fx: (g) => g.stat('心境', 2), res: '你托来人带了一包亲手做的针线。' },
        { t: '去襄阳', dev: 15, fx: (g) => { g.move('xiangyang'); g.stat('情义', 4); }, res: '你在襄阳城里住了下来。每天早晨，黄蓉亲自给你送一碗粥。' },
        { t: '请她把过儿的消息捎来，自己不动', dev: 5, fx: (g) => { g.remember('mn_news'); g.stat('心境', 1); }, res: '此后每隔几个月，黄蓉都托人送来一封信，只写过儿的事。' },
      ] },
    { id: 'mn_will', y: 63, t: '身后事', cond: (g) => g.f('munianciLives'),
      text: (g) => '你知道自己的日子不多了。' + (g.f('kangStone') ? '那块碑还立在铁枪庙旁边。' : g.recall('mn_tree') ? '那棵树已经比人高了。' : '') + (g.recall('mn_news') ? '黄蓉的信一封封压在枕头底下。' : '') + '过儿问你想葬在哪里。',
      choices: [
        { t: '铁枪庙边上，和杨康作伴', canon: true, fx: (g) => { g.set('mnBesideKang'); g.stat('心境', 5); }, res: '过儿点头。他没有问为什么。' },
        { t: '牛家村，杨叔叔夫妇身边', dev: 5, fx: (g) => { g.set('mnBesideTiexin'); g.stat('情义', 4); }, res: '你想，义父一辈子等的人，终究是在那里。' },
        { t: '不要坟，把骨灰撒进钱塘江', dev: 10, fx: (g) => { g.set('mnRiver'); g.stat('心境', 6); }, res: '你说：“我一辈子都在追人，最后让水追我吧。”' },
      ] },
  ]);

  JY.addFlags({
    zhaoOldmenSettled: '赵敏替漠北的旧部求了一处安置',
    zhaoZhouWrites: '赵敏和周芷若一直通信',
    zhaoGaveHorse: '赵敏把哥哥留下的那匹马送给了草原上的孩子',
    zhaoMemoirGiven: '赵敏把《汝阳王府旧事》交给了来修史的人',
    zhaoBurnedMemoir: '赵敏烧掉了《汝阳王府旧事》',
    xiexunLivesWith: '谢逊晚年和张无忌住在一起',
    xiexunTaughtSon: '谢逊把狮子吼的窍门传给了张无忌的孩子',
    wujiGuest: '张无忌做了朝廷的客卿，不接官职',
    wujiLandGrant: '张无忌替明教旧人求到了一块封地',
    jiuyangToWudang: '张无忌把九阳神功的口诀留给了武当',
    ygVisitedXY: '杨过早早回过襄阳',
    ygTaughtPalm: '杨过把黯然销魂掌的心法传给了一个少年',
    ygReturnedXY: '杨过收到信，回襄阳共守',
    ygCairn: '杨过在襄阳旧址给郭靖立了衣冠冢',
    diaoLeft: '杨过放走了老神雕',
    diaoBuried: '杨过把神雕葬在了剑冢里',
  });

  /* ================= 赵敏（年龄 age） ================= */
  add('zhaomin', [
    { id: 'zm_oldmen', age: 40, t: '旧部',
      text: '几个鬓角发白的蒙古老兵找到你，说北边还有人愿意打回大都，求你出面。他们认得你，管你叫郡主。',
      choices: [
        { t: '劝他们散了，各回各的牧场', canon: true, fx: (g) => { g.remember('zm_oldmen', 'disband'); g.stat('心境', -3); }, res: '你给每人一匹马。他们在帐外跪了一会儿，走了。' },
        { t: '替他们写信给新朝，求个安置', dev: 15, fx: (g) => { g.set('zhaoOldmenSettled'); g.stat('情义', 5); }, res: '信是你亲笔写的，落款写的是“赵敏”，没有写郡主。三个月后，旧部们分到了草场。' },
        { t: '把兵符和印交出去，从此不过问', dev: 10, fx: (g) => { g.info('身份', '无名牧人'); g.stat('心境', 5); }, res: '你把汝阳王府的最后一块兵符丢进了火塘。火苗跳了一下。' },
      ] },
    { id: 'zm_letter', age: 44, t: '汉水来信', cond: (g) => g.alive('zhouzhiruo'),
      text: (g) => (g.f('zhaoZhouReconciled') ? '周芷若托人带来一包新采的峨嵋茶，附信说她今年没法来了，问你塞外的雪厚不厚。' : '周芷若托人带来一包峨嵋茶，没有附信。你在帐里翻来覆去看了三遍包茶叶的纸。'),
      choices: [
        { t: '回一封信，约她秋天来坐坐', canon: true, fx: (g) => { g.set('zhaoZhouWrites'); g.stat('心境', 4); }, res: '你写了一页，撕了，又写了半页。她回信只有一个字：好。' },
        { t: '寄一包塞外的奶茶，什么也不写', dev: 8, fx: (g) => { g.remember('zm_tea'); g.stat('心境', 1); }, res: '信使走后你才想起，那茶要熬三个时辰，她未必会熬。' },
        { t: '不回', dev: 5, fx: (g) => { g.remember('zm_noanswer'); g.stat('心境', -3); }, res: '茶你喝完了。纸你留着。' },
      ] },
    { id: 'zm_horse', age: 56, t: '小红马',
      text: (g) => '哥哥当年养的那匹小红马，如今早不是原来那一匹，是它的孙辈。' + (g.recall('zm_saw_brother') ? '你回漠北看过他，记得他牵着马缰笑的样子。' : '') + (g.recall('zm_oldmen') === 'disband' ? '那些散了的旧部，偶尔还来给你送一袋奶干。' : '') + (g.f('zhaoZhouWrites') ? '周芷若的信每年秋天都来。' : '') + (g.recall('zm_tea') ? '你寄过去的那包奶茶，她后来回信说，熬了三个时辰。' : '') + (g.recall('zm_noanswer') ? '那包峨嵋茶的纸，你一直没有扔。' : ''),
      choices: [
        { t: '骑着它，去哥哥坟前坐一天', canon: true, fx: (g) => { g.move('grassland'); g.stat('心境', 4); }, res: '你对着土堆说了一下午的话。风很大，没人听见。' },
        { t: '把马送给草原上放羊的孩子', dev: 10, fx: (g) => { g.set('zhaoGaveHorse'); g.stat('情义', 4); }, res: '孩子的父亲要给你银子。你说，让他好好养，别让它拉车。' },
        { t: '留着，让它在你帐外老死', dev: 3, fx: (g) => { g.remember('zm_horsekeep'); g.stat('心境', 2); }, res: '它死的那天，你亲手埋的。' },
      ] },
    { id: 'zm_last', age: 68, t: '身后',
      text: (g) => '你身体不如从前了。' + (g.f('zhaominMemoir') ? '压在箱底的《汝阳王府旧事》，你想起来要看一看。' : '你没有留下一个字，也没人来问。') + (g.f('zhaoOldmenSettled') ? '当年你求过安置的旧部，有人托人带来了一袋新麦。' : '') + (g.f('zhaoGaveHorse') ? '放羊的孩子已经长大，骑马来看过你。' : '') + (g.recall('zm_horsekeep') ? '那匹马的坟，就在你的帐外。' : ''),
      choices: [
        { t: '什么也不留，只让人把帐子收拾干净', canon: true, fx: (g) => { g.info('身份', '漠北的老妇人'); g.stat('心境', 6); }, res: '你睡了一个很长的午觉。' },
        { t: '把书交给来修史的人', dev: 10, cond: (g) => g.f('zhaominMemoir'), fx: (g) => { g.set('zhaoMemoirGiven'); g.stat('悟性', 2); }, res: '书后来真的进了史馆。他们删了一半，剩下的一半也没有人看。' },
        { t: '一页页烧了，不留给任何人', dev: 8, cond: (g) => g.f('zhaominMemoir'), fx: (g) => { g.set('zhaoBurnedMemoir'); g.stat('心境', 5); }, res: '火很旺。你想，该记的人都记着，不该记的，让它干净。' },
        { t: '请人把哥哥坟边的土带来，铺在帐下', dev: 6, fx: (g) => { g.move('grassland'); g.stat('心境', 4); }, res: '土带来了，带着草根的味道。你把它铺在床下，睡了一个好觉。' },
      ] },
  ]);

  /* ================= 张无忌（年龄 age） ================= */
  add('zhangwuji', [
    { id: 'zw_xiexun', age: 35, t: '义父', cond: (g) => g.alive('xiexun'),
      text: '义父老了，睡梦里还在喊“无忌”，喊的是他死去的那个儿子。他看不见，听见你的脚步，就把手伸出来。',
      choices: [
        { t: '请他搬来同住，天天陪着', canon: true, fx: (g) => { g.set('xiexunLivesWith'); g.stat('情义', 5); }, res: '他住了下来。每天早上，他在院里把狮子吼的口诀念一遍，念给你听，也念给自己听。' },
        { t: '送他回冰火岛，看一眼火山', dev: 10, fx: (g) => { g.move('binghuo'); g.stat('情义', 4); }, res: '你们在岛上住了一个冬天。他摸到了当年你站过的石头，说，你长大了。' },
        { t: '让他把狮子吼的窍门传给你的孩子', dev: 8, cond: (g) => !g.f('zhaominHome'), fx: (g) => { g.set('xiexunTaughtSon'); g.stat('悟性', 2); }, res: '孩子被吓得哭了三天。第四天，他自己要求再学。' },
      ] },
    { id: 'zw_envoy', age: 41, t: '使者',
      text: '朱元璋派人送来一封亲笔信，信里没有一句官话，只问你，日子过得可好。送信的人说，皇上想请你去金陵坐坐。',
      choices: [
        { t: '婉拒，说自己只会治病', canon: true, fx: (g) => { g.remember('zw_envoy', 'decline'); g.stat('心境', 3); }, res: '你把信收好。送信的人走了，皇上的回信再也没有来。' },
        { t: '答应做客卿，但不接官职', dev: 15, fx: (g) => { g.set('wujiGuest'); g.stat('声望', 6); }, res: '你住了三个月。朝里的人见你，都像见一块烫手的炭。' },
        { t: '替明教旧人求一块封地', dev: 20, fx: (g) => { g.set('wujiLandGrant'); g.stat('情义', 6); }, res: '皇上沉默了很久，在地图上圈了一块地：“够了吧？”你说，够种药了。' },
      ] },
    { id: 'zw_taiji', age: 52, t: '太极',
      text: (g) => '你把太师父教的太极剑重新想了一遍。' + (g.f('xiexunLivesWith') ? '义父在院里念口诀，你听着，忽然觉得两样东西是一回事。' : '') + (g.f('wujiGuest') ? '客卿那几个月，你看够了人心。' : '') + '武当和九阳，该不该合在一起，你想了很多年。',
      choices: [
        { t: '只传太极，不传九阳', canon: true, fx: (g) => { g.remember('zw_taiji', 'only'); g.stat('悟性', 3); }, res: '你写了一份太极的心得寄上武当。九阳的事，你谁也没提。' },
        { t: '把九阳神功的口诀抄给武当', dev: 20, fx: (g) => { g.set('jiuyangToWudang'); g.stat('情义', 5); }, res: '武当山的后辈练上了九阳。三十年后，江湖上多出几个不输五绝的人。' },
        { t: '把它们都写进医书，不分门派', dev: 12, fx: (g) => { g.remember('zw_taiji', 'book'); g.stat('悟性', 4); }, res: '你的医书里，多了几页讲怎么呼吸的。没有人看出那是武功。' },
      ] },
    { id: 'zw_guest', age: 66, t: '来客',
      text: (g) => '塞外的雪厚了又薄。' + (g.f('zhaoMemoirGiven') ? '有人说，赵敏的书进了史馆。' : g.f('zhaoBurnedMemoir') ? '你知道赵敏把她的书烧了。你没有问她为什么。' : '') + (g.f('jiuyangToWudang') ? '武当山有人来送信，说那边练九阳的后辈，已经有人能接下你一招。' : '') + (g.f('wujiLandGrant') ? '明教旧人的那块地，今年打了不少粮。' : '') + (g.f('xiexunTaughtSon') ? '义父教过的孩子，如今在江湖上喊出过一声狮吼。' : '') + (g.f('zhouNovice') ? '听说周芷若又收了一个关门弟子。' : '') + (g.recall('zw_envoy') === 'decline' ? '金陵再没有来过信。' : '') + (g.recall('zw_taiji') === 'only' ? '九阳的口诀，仍只在你一个人的脑子里。' : g.recall('zw_taiji') === 'book' ? '你那几页讲呼吸的医书，有人照着练出了名堂。' : '') + '你的手越来越抖，眉笔常常拿不稳。',
      choices: [
        { t: '静静坐着，等她来给你画', canon: true, fx: (g) => { g.info('身份', '塞外的老人'); g.stat('心境', 6); }, res: '她来了，什么也没问，拿过笔。' },
        { t: '回武当山住一年', dev: 12, fx: (g) => { g.move('wudang'); g.stat('心境', 5); }, res: '太师父当年的那间屋子还在，没人动过。你睡了一整年。' },
        { t: '去看看波斯来的商队，打听小昭的消息', dev: 8, cond: (g) => g.f('wujiVisitedPersia') || g.alive('xiaozhao'), fx: (g) => { g.stat('情义', 3); }, res: '商队的人说，波斯的总教教主，是一个很会唱歌的女人。' },
      ] },
  ]);

  /* ================= 杨过（纪年 y = 年龄 + 20） ================= */
  add('yangguo', [
    { id: 'yg_wine', y: 54, t: '来自襄阳',
      text: (g) => (g.f('guoSentWine') ? '一个陌生人送来一坛桃花岛的酒，说是郭大侠托他送的。' : g.f('guoLetterYang') ? '襄阳来了一封信，没有称呼，没有提旧事，只说城里缺人。' : '襄阳那边没有任何消息。') + '你把东西摆在案头，看了很久。',
      choices: [
        { t: '把酒喝了，没有回话', canon: true, fx: (g) => { g.remember('yg_wine', 'drank'); g.stat('心境', 2); }, res: '酒是好酒，你喝完了坛子，把空坛放在门口。' },
        { t: '回赠一坛终南山的蜂蜜', dev: 8, fx: (g) => { g.remember('yg_wine', 'honey'); g.stat('情义', 3); }, res: '回礼是一坛蜂蜜。送酒的人走时说，郭大侠最爱吃甜的。' },
        { t: '去襄阳看他一眼', dev: 15, fx: (g) => { g.set('ygVisitedXY'); g.move('xiangyang'); g.stat('情义', 5); }, res: '你在城下看了他一天。他站在城头，没有发现你。你转身走了。' },
      ] },
    { id: 'yg_taught', y: 60, t: '求学的少年', cond: (g) => !g.f('ygNoReunion'),
      text: '一个衣衫褴褛的少年找到你住的地方，跪在门口三天，说要学“那一套能让人哭的掌法”。他说他在襄阳城下听人讲过。',
      choices: [
        { t: '教他心法，不教招式', canon: true, fx: (g) => { g.remember('yg_taught', 'xin'); g.stat('悟性', 2); }, res: '你对他说：“这掌法不是学来的，是活出来的。”他似懂非懂地走了。' },
        { t: '一招一式教给他', dev: 12, fx: (g) => { g.set('ygTaughtPalm'); g.stat('情义', 4); }, res: '他学了三年，下山那天跪在你面前磕了三个响头。从此江湖上又多了一个黯然销魂的人。' },
        { t: '不教，让他去襄阳城下当兵', dev: 8, fx: (g) => { g.remember('yg_taught', 'army'); g.move('xiangyang'); }, res: '你送了他一程，直到他走进襄阳的城门。' },
      ] },
    { id: 'yg_answer', y: 66, t: '再次召唤', cond: (g) => !g.f('jingStayMongol') && live(g, 'guojing'),
      text: (g) => (g.f('guoCalledYang') ? '郭伯伯又来信了，这回署了名。字写得很笨，一笔一划像是描出来的。' : '蒙古人又在襄阳城外扎营了。你在茶馆里听来的消息，一个比一个坏。') + (g.recall('yg_wine') === 'honey' ? '那坛蜂蜜，听说他舍不得吃。' : '') + (g.f('ygVisitedXY') ? '你在城下看他的那一天，他后来也知道了。' : '') + (g.f('ygTaughtPalm') ? '你教出去的那个少年，听说在襄阳当了兵。' : g.recall('yg_taught') === 'xin' ? '你传出去的那点心法，不知有没有人用上。' : g.recall('yg_taught') === 'army' ? '你送进襄阳城的那个少年，没有消息。' : '') + (g.recall('yg_father') === 'visit' ? '你在父亲坟前坐过的那一夜，露水还凉着。' : g.recall('yg_father') === 'tiexin' ? '牛家村的香火，你每年都托人去添。' : g.recall('yg_father') === 'skip' ? '父亲的事，你还是没去。' : ''),
      choices: [
        { t: '回襄阳，守到最后', canon: true, fx: (g) => { g.set('ygReturnedXY'); g.move('xiangyang'); g.stat('情义', 5); g.stat('声望', 5); }, res: '你背着那把没有锋口的剑，走进襄阳的城门。守门的老兵认出了你，先敬了个礼。' },
        { t: '不回，说守城是官军的事', dev: 25, fx: (g) => { g.info('身份', '不肯再过问襄阳的人'); g.stat('情义', -5); }, res: '你把信烧了。那一晚你没睡着。' },
        { t: '回信答应，但要带龙儿一起去', dev: 10, cond: (g) => g.f('longStayed') || g.f('reunionEarly') || g.alive('xiaolongnv'), fx: (g) => { g.set('ygReturnedXY'); g.stat('情义', 4); g.stat('心境', 4); }, res: '你们并肩走进襄阳的城门。守城的老兵说，从来没见过这样的一对。' },
      ] },
    { id: 'yg_father', y: 64, t: '父亲',
      text: (g) => (g.f('ygToldTruth') ? '母亲把父亲的事全说了。你一直想去看看他。' : g.f('ygToldHero') ? '母亲只说父亲是个好汉。你后来从别人嘴里听到了另外的话。' : '父亲的事，你只从别人嘴里听过。') + (g.f('mnBesideKang') ? '母亲葬在铁枪庙，他的坟边。' : g.f('mnBesideTiexin') ? '母亲葬在牛家村，在杨叔叔夫妇身边。' : g.f('mnRiver') ? '母亲的骨灰撒进了钱塘江。' : '') + (g.f('ygKneltKang') ? '你小时候跪过他的坟，那时你不懂，现在懂了。' : ''),
      choices: [
        { t: '去铁枪庙，在他的坟前坐一夜', canon: true, fx: (g) => { g.remember('yg_father', 'visit'); g.stat('心境', 5); }, res: '你对着土堆说：“爹，我来了。”天亮时，你的衣裳全被露水打湿了。' },
        { t: '去牛家村，拜杨叔叔夫妇', dev: 8, fx: (g) => { g.remember('yg_father', 'tiexin'); g.stat('情义', 4); }, res: '你磕了三个头。你想，这才是你真正的祖辈。' },
        { t: '不去，把这件事留给下一世', dev: 3, fx: (g) => { g.remember('yg_father', 'skip'); g.stat('心境', -3); }, res: '你在门口站了很久，终究没有出门。' },
      ] },
    { id: 'yg_after', y: 77, t: '襄阳之后',
      text: (g) => (g.f('ygReturnedXY') ? '城破那天，你站在城头，看着旗一面面倒下。' : '襄阳城破的消息，是在茶馆里听来的。') + '后来常有年轻人来问，那一天是怎么回事。',
      choices: [
        { t: '把那一天的事，原原本本讲给来问的人', canon: true, fx: (g) => { g.remember('yg_after', 'tell'); g.stat('心境', 3); }, res: '你讲了三个下午。听的人里，有一个哭了。' },
        { t: '在城旧址上立一座衣冠冢，给郭伯伯', dev: 10, fx: (g) => { g.set('ygCairn'); g.stat('情义', 5); }, res: '你一个人搬了三个月的石头。碑上只刻了两个字：“郭靖”。' },
        { t: '什么也不说，夜里去旧城墙下坐一会儿', dev: 3, fx: (g) => { g.move('xiangyang'); g.stat('心境', -2); }, res: '城墙塌了一半。你靠在断墙上，听风从缺口里穿过去。' },
      ] },
    { id: 'yg_diao', y: 82, t: '神雕',
      text: (g) => '神雕老了，飞不动了，常常蹲在你门口，看着南边。' + (g.recall('yg_after') === 'tell' ? '你给人讲襄阳的时候，它在旁边听着，一动不动。' : '') + (g.f('ygCairn') ? '郭伯伯碑前的草，是它每天去啄干净的。' : ''),
      choices: [
        { t: '陪它到最后，不让它走远', canon: true, fx: (g) => { g.info('身份', '带着老雕的隐士'); g.stat('情义', 4); }, res: '它死在你脚边，眼睛还望着南边。' },
        { t: '放它走，让它自己去选地方', dev: 8, fx: (g) => { g.set('diaoLeft'); g.stat('心境', 4); }, res: '你把它抱到崖边，一松手，它扑棱着飞远了。你知道它不会回来。' },
        { t: '把它葬在剑冢里，和独孤前辈做伴', dev: 12, fx: (g) => { g.set('diaoBuried'); g.stat('情义', 5); }, res: '你把它抱回了剑冢。那块石头下面，从此有了两个伴。' },
      ] },
  ]);

  JY.addFlags({
    ykSendsYang: '杨康让杨过去了郭靖身边',
    ykApologized: '杨康给郭靖写了一封认错的信',
    xlCarved: '小龙女把玉女心经刻在了古墓石壁上',
    xlPupil: '小龙女收了一个女孩做徒弟',
    gfRaisedXiang: '郭芙一手带大了妹妹郭襄',
    gfSwordXiang: '郭芙把淑女剑传给了郭襄',
    lmPupil: '李莫愁收了一个小道姑做徒弟',
    lmSong: '李莫愁把那首“问世间情为何物”写了下来',
    zhouHanshui: '周芷若在汉水边为过路人撑过渡',
    zhouNovice: '周芷若收了最后一个弟子',
  });

  /* ================= 杨康（纪年 y；改命救下之后才有） ================= */
  add('yangkang', [
    { id: 'yk_boy', y: 46, t: '儿子', cond: (g) => (g.f('yangkangLives') || g.f('yangkangTurned')) && hasYG(g),
      text: '过儿二十六岁了，站在你面前，比你高半个头。他看你的眼神，你读不懂，只觉得像杨铁心。',
      choices: [
        { t: '把杨家枪法传给他', canon: true, fx: (g) => { g.remember('yk_spear'); g.stat('情义', 4); }, res: '他学得很快，快得让你难受。他的枪使出来，每一招都像在问你当年的事。' },
        { t: '让他去郭伯伯身边', dev: 10, fx: (g) => { g.set('ykSendsYang'); g.stat('心境', -2); }, res: '你对他说：“去郭伯伯那里，学真正的本事。”他看了你一眼，点点头。' },
        { t: '隔着门看他练功，一句话也不说', dev: 3, fx: (g) => { g.remember('yk_door'); g.stat('心境', -3); }, res: '他练了一个时辰。你看了一个时辰。' },
      ] },
    { id: 'yk_late', y: 55, t: '迟来的信', cond: (g) => g.f('yangkangLives') || g.f('yangkangTurned'),
      text: (g) => '你老了，常常想起铁枪庙那一夜。' + (g.recall('yk_spear') ? '过儿使枪时的样子，你一直记得。' : '') + (g.recall('yk_door') ? '那天你隔着门看他，他其实知道。' : '') + (g.f('ykSendsYang') ? '听说他在郭靖那里学得很好。' : ''),
      choices: [
        { t: '给郭靖写一封信，认个错', canon: true, fx: (g) => { g.set('ykApologized'); g.stat('心境', 6); }, res: '信很短，只有三行。你写了一个下午。' },
        { t: '回牛家村，给杨铁心夫妇上坟', dev: 10, fx: (g) => { g.move('niujia'); g.stat('情义', 5); }, res: '你在坟前跪了一夜。天亮的时候，你觉得自己老了十岁。' },
        { t: '什么也不说，让这件事就这样过去', dev: 3, fx: (g) => { g.stat('心境', -2); }, res: '你把信纸叠好，放进了抽屉。' },
      ] },
  ]);

  /* ================= 小龙女（纪年 y） ================= */
  add('xiaolongnv', [
    { id: 'xl_wall', y: 66, t: '石壁',
      text: '古墓外的玉蜂越来越少。你想，墓里的东西，总要留一点给后来人。',
      choices: [
        { t: '把玉女心经刻在石壁上', canon: true, fx: (g) => { g.set('xlCarved'); g.stat('悟性', 2); }, res: '你刻了三年，刻完最后一个字，手指都磨出了血。' },
        { t: '教给一个来古墓避难的女孩', dev: 12, fx: (g) => { g.set('xlPupil'); g.stat('情义', 5); }, res: '女孩很怕冷，学了三个月才不哭。你想，原来你也教得了人。' },
        { t: '把蜂放走，封了墓门', dev: 15, fx: (g) => { g.move('road'); g.stat('心境', 4); }, res: '你走了很远，才发现忘了带那朵玉蜂浆。' },
      ] },
    { id: 'xl_quiet', y: 78, t: '静',
      text: (g) => '你坐在寒玉床上，听外面的风。' + (g.f('xlCarved') ? '石壁上的字，被你摸得发亮。' : '') + (g.f('xlPupil') ? '那个女孩下山前跪在你面前，说她一定回来看你。' : '') + '你想起了一个人。',
      choices: [
        { t: '一个人坐着，不动', canon: true, fx: (g) => { g.info('身份', '古墓里的老人'); g.stat('心境', 4); }, res: '你坐了一整个冬天。春天，外面的草长高了。' },
        { t: '下山，去襄阳旧城看一眼', dev: 10, fx: (g) => { g.move('xiangyang'); g.stat('情义', 4); }, res: '城已经不是当年的城了。你站在城头，看了很久。' },
      ] },
  ]);

  /* ================= 郭芙（纪年 y） ================= */
  add('guofu', [
    { id: 'gf_sister', y: 50, t: '妹妹', cond: (g) => !g.f('jingrongApart') && !g.f('rongDied'),
      text: '襄儿十岁了，整天跟在你后面，说长大了要做女侠。你每次都说，不许胡闹，却每次都替她遮掩。',
      choices: [
        { t: '带她去集市，教她不要被人骗', canon: true, fx: (g) => { g.set('gfRaisedXiang'); g.stat('情义', 4); }, res: '你教她看人的眼睛。她学得比你快。' },
        { t: '把淑女剑传给她', dev: 10, fx: (g) => { g.set('gfSwordXiang'); g.stat('情义', 5); }, res: '你把剑交到她手里。你说：“这剑砍过不该砍的人，你别学我。”' },
        { t: '不管她，让爹娘去教', dev: 3, fx: (g) => { g.remember('gf_nosis'); g.stat('心境', -2); }, res: '你背过身去。听着她的笑声越来越远。' },
      ] },
    { id: 'gf_late', y: 76, t: '岛上',
      text: (g) => '你们躲到桃花岛上，日子慢了下来。' + (g.f('gfRaisedXiang') ? '襄儿偶尔写信，信里总是问你吃得好不好。' : g.recall('gf_nosis') ? '襄儿没有来过信，你也没有写。' : '') + (g.f('gfSwordXiang') ? '那把淑女剑，据说她挂在了峨嵋的殿里。' : ''),
      choices: [
        { t: '写一封信，说你想她', canon: true, fx: (g) => { g.info('身份', '岛上等信的人'); g.stat('情义', 4); }, res: '你写了三遍，每一遍都比上一遍短。' },
        { t: '去找她', dev: 12, fx: (g) => { g.move('emei'); g.stat('情义', 6); }, res: '你坐了半个月的船。她在山门口等你，什么也没说，抱住了你。' },
      ] },
  ]);

  /* ================= 郭襄（纪年 y） ================= */
  add('guoxiang', [
    { id: 'gx_manual', y: 64, t: '册子',
      text: (g) => '你二十四岁了，在江湖上漂着。' + (g.f('rongManual') ? '娘给你的那本册子，你一直贴身带着。' : '') + (g.f('guoFamiliesOut') ? '听说爹把守城老兵的家眷悄悄送出了襄阳，其中有人在江湖上认出了你。' : '') + (g.f('ygReturnedXY') ? '你听说杨大哥回了襄阳，一个人，一把剑。' : '') + (g.f('gfRaisedXiang') ? '姐姐托人带来一件新衣，说是照你上次的尺寸缝的。' : ''),
      choices: [
        { t: '把册子读熟，再一页页烧掉', canon: true, fx: (g) => { g.remember('gx_book', 'burn'); g.stat('悟性', 3); }, res: '灰烬被风吹走。你想，这样的东西，只有记在心里才算数。' },
        { t: '回襄阳，陪着爹娘', dev: 15, fx: (g) => { g.move('xiangyang'); g.stat('情义', 6); }, res: '城里的老兵们说：“襄儿回来了。”你替他们补了一件冬衣。' },
        { t: '继续漂，去看看杨大哥', dev: 10, fx: (g) => { g.remember('gx_book', 'wander'); g.stat('心境', 3); }, res: '你一路打听，终于在一座小镇的茶馆里，遇见了一只神雕。' },
      ] },
    { id: 'gx_chronicle', y: 100, t: '一本书', cond: (g) => g.f('emeiLate') || g.alive('guoxiang'),
      text: (g) => '你老了。' + (g.f('xyChronicle') ? '有人把襄阳守城的事写成了书，里面的黄蓉比你娘聪明，比你娘好看。' : '襄阳的故事，已经快没有人记得了。') + (g.recall('gx_book') === 'burn' ? '那本册子，你烧过。' : '') + (g.recall('gx_book') === 'wander' ? '册子被你留在了一个客栈的柜台下。' : '') + (g.f('diaoLeft') ? '听说那只神雕后来一个人飞向了南边，再没有回来。' : g.f('diaoBuried') ? '神雕葬在剑冢里，墓前总有人放一朵花。' : ''),
      choices: [
        { t: '把书从头读一遍，不说话', canon: true, fx: (g) => { g.info('身份', '襄阳旧事的最后一个读者'); g.stat('心境', 5); }, res: '读到爹的名字，你合上了书。' },
        { t: '把自己知道的补写下来', dev: 12, fx: (g) => { g.move('emei'); g.stat('悟性', 3); }, res: '你补了七页。字写得很小，很密。' },
      ] },
  ]);

  /* ================= 李莫愁（纪年 y；改命救下之后才有） ================= */
  add('limochou', [
    { id: 'lm_temple2', y: 56, t: '小庙', cond: (g) => g.f('limochouLives') || g.f('mochouNoLu'),
      text: '你住在一座小道观里，不再杀人。夜里还会梦见那首词。观里来了一个无家可归的小道姑，十岁，不肯说话。',
      choices: [
        { t: '收她做徒弟，教她拂尘', canon: true, fx: (g) => { g.set('lmPupil'); g.stat('情义', 5); }, res: '她学得很慢。你想起，你师父也这么骂过你。' },
        { t: '给她一口饭，让她走', dev: 8, fx: (g) => { g.remember('lm_girl'); g.stat('心境', 2); }, res: '她站在门口，没动。第二天你又给了她一口饭。' },
        { t: '把那首词写下来，贴在墙上', dev: 10, fx: (g) => { g.set('lmSong'); g.stat('心境', 4); }, res: '“问世间情为何物，直教生死相许。”你写了一遍，又撕了。' },
      ] },
    { id: 'lm_end2', y: 66, t: '最后一场雨', cond: (g) => g.f('limochouLives') || g.f('mochouNoLu'),
      text: (g) => '你病了。' + (g.f('lmPupil') ? '徒弟守在床边，一夜没合眼。' : g.recall('lm_girl') ? '那个小道姑后来来过几次，每次都带一包糕点。' : '') + (g.f('lmSong') ? '墙上的那张纸，已经被雨水泡得看不清了。' : ''),
      choices: [
        { t: '把拂尘交给她', canon: true, cond: (g) => g.f('lmPupil'), fx: (g) => { g.info('身份', '小庙里的老道姑'); g.stat('情义', 5); }, res: '你说：“别学我，学你师父。”' },
        { t: '嘱咐人把你葬在观后，不立碑', dev: 6, fx: (g) => { g.info('身份', '无名的道姑'); g.stat('心境', 4); }, res: '你说，这一辈子名字够多了，不要了。' },
        { t: '什么也不说，闭上眼睛', dev: 5, fx: (g) => { g.stat('心境', 5); }, res: '雨下了一夜。第二天，天晴了。' },
        { t: '让她把那首词念给你听', dev: 8, cond: (g) => g.f('lmSong'), fx: (g) => { g.info('身份', '听完词才闭眼的人'); g.stat('心境', 6); }, res: '她念得很慢，念到一半，你笑了。' },
      ] },
  ]);

  /* ================= 周芷若（年龄 age） ================= */
  add('zhouzhiruo', [
    { id: 'zz_ferry', age: 40, t: '渡口',
      text: (g) => (g.f('zhouMarried') ? '你和张无忌住在峨嵋山下，日子平淡。' : g.f('zhouDisgraced') ? '你在汉水边撑船，一天渡几十个人。' : '你是峨嵋掌门，每个月下山一趟，去看看山下的村子。') + '汉水边有一个渡口，常年没人撑船。',
      choices: [
        { t: '亲自去撑几天船', canon: true, fx: (g) => { g.set('zhouHanshui'); g.stat('心境', 5); }, res: '你把船撑过去，又撑回来。一个老妇人偷偷塞给你两个鸡蛋。' },
        { t: '派一个弟子去', dev: 5, fx: (g) => { g.remember('zz_ferry', 'pupil'); g.stat('情义', 2); }, res: '弟子撑得很稳。你站在岸上，看着她。' },
        { t: '什么也不做', dev: 3, fx: (g) => { g.remember('zz_ferry', 'none'); g.stat('心境', -2); }, res: '渡口还是空着。' },
      ] },
    { id: 'zz_novice', age: 50, t: '最后一个弟子',
      text: (g) => '一个十来岁的小姑娘站在山门前，说她想学剑。' + (g.f('zhouHanshui') ? '她说，她娘亲在汉水的渡船上见过你，说你撑船的样子，比谁都好看。' : g.recall('zz_ferry') === 'pupil' ? '她是你弟子在渡口收下的。' : ''),
      choices: [
        { t: '收她做关门弟子，只教她剑', canon: true, fx: (g) => { g.set('zhouNovice'); g.stat('情义', 5); }, res: '你想，这一次，你要教她好好做人。' },
        { t: '不收，让她下山去读书', dev: 8, fx: (g) => { g.stat('心境', 2); }, res: '她下山时回头看了你三次。' },
        { t: '送她去找赵敏，说那边有更好的路', dev: 15, cond: (g) => g.alive('zhaomin'), fx: (g) => { g.info('身份', '没有门派的峨嵋人'); g.stat('情义', 4); }, res: '你自己也不知道为什么这么说。' },
      ] },
  ]);
})();

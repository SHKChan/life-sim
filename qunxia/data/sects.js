/* 群侠 · 门派差事：做门派差事时有机会碰上的事（chore: 门派 id，或 '*' 哪派都行），以及差遣（派你去外地办事）。
 * 差遣：在选项里 g.errand(id, 地点, 天数, 文字)；写着 errand: id 的事件在限期内到了那个地点自动发生；办完 g.taskDone(id, 文字)、g.addContrib(n)。
 * 误了期贡献 -1，并留下标记 late_<id>。 */
(function () {
  'use strict';
  const QX = window.QX;

  // 峨嵋的人 134 年三月去了西域，135 年五月才回山（灭绝要 miejueLives 才在）
  const emHome = (g) => g.before(134, 3);
  const emBack = (g) => g.after(135, 5);
  // 135 年回山后谁在管峨嵋：灭绝活着就是她，不然是周芷若
  const emHead = (g) => (g.f('miejueLives') && g.alive('miejue') ? 'miejue' : 'zhouzhiruo');
  // 误了差遣留下的标记 late_<差遣 id>（引擎设的）
  const late = (g, id) => g.f('late_' + id);

  QX.addFlags({
    emGateMercy: '你在峨嵋山门给一个明教的伤者喝过水',
    emHeldGate: '师父们不在的那一年，你替峨嵋守住了山门',
    emTowerNote: '你往万安寺塔上射过一张峨嵋平安的字条',
    qzWudangHelp: '你替重阳宫请来了武当的人',
    gbDaduNews: '你替丐帮去大都打探过汝阳王府',
    gbHongFriend: '你陪史红石在破庙后面练过棍',
    mjKnowRoute: '你从崆峒探子嘴里问出了六大派上山的路',
    mjRevenge: '光明顶之战后你下山找六大派报过仇',
  });

  QX.addEvents([
    /* ================= 峨嵋 ================= */
    { id: 'em_ch_gate', chore: 'emei', t: '守山门', cond: (g) => emHome(g),
      text: '天快黑的时候，一个年轻人爬上了山门。他胸口缠着布，布上绣着一团火。他说：“讨口水喝，喝完就走。”',
      choices: [
        { t: '按门规，去叫静玄师姐', cond: (g) => g.alive('jingxuan'),
          fx: (g) => { g.like('jingxuan', 6); g.like('miejue', 3); g.addContrib(1); },
          res: '静玄来了，看见那团火，剑就出了鞘。年轻人滚下了石阶。静玄说你做得对。' },
        { t: '给他一碗水，指一条下山的小路', fx: (g) => { g.add('品德', 3); g.set('emGateMercy'); g.like('jingxuan', -4); },
          res: '他把水喝干，朝你点点头，钻进了林子。第二天静玄问起石阶上的血，你没说话。' },
        { t: '拦住他，自己拿下', fight: { foes: ['mjdizi'],
          win: { fx: (g) => { g.like('miejue', 8); g.addContrib(2); g.add('品德', -2); }, res: '你把他捆了，押到后殿。师太看了你一眼，说了一声好。' },
          lose: { res: '他把你推倒在石阶上，自己走了。你爬起来，袖子上沾着他的血。' } } },
      ] },

    { id: 'em_ch_wash', chore: 'emei', t: '溪边', cond: (g) => emHome(g) && g.alive('zhouzhiruo') && g.alive('dingminjun'),
      text: '溪边，丁敏君把一盆衣裳踢到周芷若脚下。“洗干净，天黑前晾好。”周芷若低着头，没出声。',
      choices: [
        { t: '蹲下来帮她一起洗', fx: (g) => { g.like('zhouzhiruo', 8); g.like('dingminjun', -6); g.set('emZhouHelp'); },
          res: '你们洗到天黑。周芷若小声说了一句谢谢，手冻得通红。' },
        { t: '去告诉静玄师姐', cond: (g) => g.alive('jingxuan'), fx: (g) => { g.like('jingxuan', 4); g.like('dingminjun', -10); g.set('emDingGrudge'); g.addContrib(1); },
          res: '静玄罚丁敏君抄了三遍门规。丁敏君从此看见你就冷笑。' },
        { t: '当没看见', fx: (g) => g.like('dingminjun', 3), res: '你从溪边走过去了。周芷若的影子映在水里，一动不动。' },
      ] },

    { id: 'em_ch_letter', chore: 'emei', t: '一封信', cond: (g) => emHome(g) && g.alive('jingxuan'),
      text: '静玄把一封封了蜡的信交给你。“送到襄阳丐帮分舵。师父想请他们帮着盯一盯汉水一带魔教的动静。”',
      choices: [
        { t: '领命下山', fx: (g) => { g.errand('em_err_letter', 'xiangyang', 50, '把静玄师姐的信送到襄阳丐帮分舵'); g.like('jingxuan', 3); },
          res: '你把信贴身收好，第二天一早下了山。静玄说，五十天里要有回音。' },
        { t: '说剑法还没练好，请师姐另派人', fx: (g) => g.like('jingxuan', -4), res: '静玄没说什么，把信交给了丁敏君。' },
      ] },
    { id: 'em_err_letter_go', errand: 'em_err_letter', t: '送信', cond: (g) => g.sect === 'emei',
      text: (g) => '破庙门口蹲着几个叫化。你说是峨嵋派来送信的。' + (g.alive('chenyouliang') && !g.f('cylDown') ? '一个白净的汉子笑着迎出来，自称陈友谅，伸手要接。' : ''),
      choices: [
        { t: '要亲手交给传功长老', cond: (g) => g.alive('gb_chuangong'),
          fx: (g) => { g.taskDone('em_err_letter', '你把峨嵋的信交到了传功长老手里。'); g.addContrib(2); g.like('gb_chuangong', 6); if (g.alive('chenyouliang')) g.like('chenyouliang', -4); },
          res: '传功长老拆信看完，叫人给你端了一碗热汤。门口那个白净汉子没再笑。' },
        { t: '交给陈友谅代转', cond: (g) => g.alive('chenyouliang') && !g.f('cylDown'),
          fx: (g) => { g.taskDone('em_err_letter', '你把峨嵋的信交给了丐帮。'); g.addContrib(1); g.like('chenyouliang', 5); g.set('emLetterCyl'); },
          res: '陈友谅把信揣进怀里，说一定转交帮主。他还塞给你一包干粮。' },
        { t: '交给门口的叫化就走', fx: (g) => { g.taskDone('em_err_letter', '你把峨嵋的信留在了丐帮分舵。'); g.addContrib(1); },
          res: '叫化把信往怀里一塞，又低头捉起了虱子。' },
      ] },

    { id: 'em_ch_pick', chore: 'emei', t: '点将', from: [133, 10], cond: (g) => emHome(g) && g.alive('miejue'),
      text: (g) => '师太在大殿上点人去西域。静玄、丁敏君、周芷若都点到了。师太的目光落到你身上。' +
        (g.f('emLetterCyl') ? '静玄在旁边低声说，丐帮的回信是一个姓陈的写的，话说得太漂亮了。' : '') +
        (late(g, 'em_err_letter') ? '丁敏君在后面说，送封信都能误期的人，去了也是累赘。' : ''),
      choices: [
        { t: '请命同去', fx: (g) => { g.errand('em_err_gmd', 'guangming', 70, '赶到昆仑山下，跟上峨嵋去光明顶的队伍'); g.like('miejue', 6); },
          res: '师太说，你先去打前站，在昆仑山下等着。' },
        { t: '说功夫不够，留下守山', fx: (g) => { g.set('emStayed'); g.like('miejue', -4); g.addContrib(1); },
          res: '师太没说什么。第二天一早，队伍下了山。金顶上只剩你和几个小师妹。' },
        { t: '问师父，明教里有没有好人', need: ['品德', 55], fx: (g) => { g.set('emeiDoubt'); g.like('miejue', -8); g.like('jingxuan', 3); },
          res: '大殿里一下子没了声音。师太说：“你留下。”静玄出门时拍了拍你的肩。' },
      ] },
    { id: 'em_err_gmd_go', errand: 'em_err_gmd', t: '昆仑山下', cond: (g) => g.sect === 'emei' && g.alive('miejue') && g.before(134, 6),
      text: (g) => (g.before(134, 3) ? '峨嵋的队伍还没到。你在昆仑山下等了些日子，才看见师太领着人上来。' : '你在昆仑山下追上了峨嵋的队伍。') + '师太正坐在石头上擦剑，看见你，只说了一句：“来得正好。”',
      choices: [
        { t: '跟在师父身后，替她牵马', fx: (g) => { g.taskDone('em_err_gmd', '你跟上了峨嵋的队伍。'); g.addContrib(2); g.like('miejue', 6); g.learn('jieshou', 1); },
          res: '这一路你替师父牵马。歇脚的时候，师太随手教了你两招截手九式。' },
        { t: '跟在周芷若身边', cond: (g) => g.alive('zhouzhiruo'), fx: (g) => { g.taskDone('em_err_gmd', '你跟上了峨嵋的队伍。'); g.addContrib(2); g.like('zhouzhiruo', 8); },
          res: '周芷若走得很慢，一路都在看雪山。她说，打完这一仗，她想回汉水边看看。' },
      ] },

    { id: 'em_ch_empty', chore: 'emei', t: '空山', cond: (g) => g.after(134, 3) && g.before(135, 5),
      text: (g) => '师父们走了。金顶上只剩几个小尼姑和你。' + (g.after(134, 7) ? '山下传来消息，六大派在回来的路上被人一网打尽，不知押去了哪里。' : '每天都有人上山打听光明顶的消息。') +
        '这天，一队元兵在山门外叫门，说奉命搜查魔教余党。',
      choices: [
        { t: '带小师妹们从后山躲开', check: ['轻功', '中'],
          fx: (g) => { g.set('emHid'); g.addContrib(2); }, res: '你们在山洞里躲了三天。元兵把庵里翻了一遍，走了。',
          fail: { fx: (g) => { g.hurt(40); g.addContrib(1); }, res: '一个小师妹扭了脚。你背着她走，一支箭擦破了你的肩膀。' } },
        { t: '守住山门', fight: { foes: ['yuanbing', 'yuanbing'],
          win: { fx: (g) => { g.set('emHeldGate'); g.addContrib(3); g.add('声望', 5); }, res: '元兵丢下两具尸首，退下了山。小师妹们躲在门后，哭了又笑。' },
          lose: { res: '元兵冲进来，砸了香炉，抢了几袋米，走了。' } } },
        { t: '天黑前，等林子里的人', cond: (g) => g.f('emGateMercy'), fx: (g) => { g.set('emHeldGate'); g.add('品德', 2); g.addContrib(2); },
          res: '几个背刀的汉子从林子里出来，领头的胸口缠着布。他们把元兵引下了山。他走前说，那碗水他记着。' },
        { t: '下山去大都，打听师父关在哪里', cond: (g) => g.after(134, 7) && g.before(135, 3),
          fx: (g) => g.errand('em_err_dadu', 'dadu', 60, '去大都打听师父们关在哪里'), res: '你把山门托给最大的那个小师妹，连夜往北走了。' },
      ] },
    { id: 'em_err_dadu_go', errand: 'em_err_dadu', t: '万安寺', cond: (g) => g.sect === 'emei',
      text: (g) => (g.before(135, 3, 10) ? '万安寺的塔上挂着灯。巡夜的人说，塔里关着一群和尚尼姑，每天有人上去逼他们比武。' : '万安寺的塔烧塌了半边。街上的人说，关在里面的人前几天全跑了。'),
      choices: [
        { t: '夜里摸到塔下，把一张字条射上去', cond: (g) => g.before(135, 3, 10), check: ['轻功', '难'],
          fx: (g) => { g.taskDone('em_err_dadu', '你在万安寺找到了师父们。'); g.set('emTowerNote'); g.like('miejue', 6); g.like('jingxuan', 6); g.addContrib(2); },
          res: '字条上写着“峨嵋平安”。第二天，塔上第五层的窗子开了一条缝。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); g.taskDone('em_err_dadu', '你把打听到的消息带回了峨嵋。'); g.addContrib(1); }, res: '番僧发现了你。你背上挨了一杵，连夜逃出了城。' } },
        { t: '把塔的位置、守卫记下来，赶回峨嵋', cond: (g) => g.before(135, 3, 10),
          fx: (g) => { g.taskDone('em_err_dadu', '你把万安寺的消息带回了峨嵋。'); g.addContrib(2); }, res: '你画了一张图，缝在鞋底里。' },
        { t: '打听她们往哪里去了', cond: (g) => !g.before(135, 3, 10),
          fx: (g) => { g.taskDone('em_err_dadu', '你打听到了师父们的去向。'); g.addContrib(1); }, res: '城门口卖饼的说，有一群尼姑往南去了，走在前头的是个年轻姑娘。' },
        { t: '在城里多住几天，看看还能打听到什么', cond: (g) => !g.before(135, 3, 10),
          fx: (g) => { g.days(5); g.taskDone('em_err_dadu', '你在大都打听了五天。'); g.addContrib(1); g.add('声望', 2); }, res: '你听说放火救人的是明教的新教主。你没把这句话带回峨嵋。' },
      ] },

    { id: 'em_ch_return', chore: 'emei', t: '回山', cond: (g) => emBack(g) && g.alive(emHead(g)),
      text: (g) => (emHead(g) === 'miejue' ? '师太回来了，瘦了一圈。她在大殿上问，她不在的这一年，山上是谁在管。' : '周芷若回来了，手上戴着师父的铁指环。她做了掌门。她在大殿上问，这一年山上是谁在管。') +
        (g.f('emTowerNote') ? '她说塔上收到过一张字条。' : '') +
        (g.f('emDingGrudge') && g.alive('dingminjun') ? '丁敏君在一旁说，你只会讨好人。' : '') +
        (late(g, 'em_err_dadu') ? '有人提起，你说去大都打听消息，却没按时回来。' : ''),
      choices: [
        { t: '站出来，说是自己', cond: (g) => g.f('emHeldGate') || g.f('emHid') || g.f('emTowerNote') || g.f('emStayed'),
          fx: (g) => { const h = emHead(g); g.addContrib(3); g.like(h, 8); if (h === 'zhouzhiruo' && g.f('emZhouHelp')) g.learn('emei_jiuyang', 1); },
          res: (g) => (emHead(g) === 'zhouzhiruo' && g.f('emZhouHelp') ? '周芷若看了你很久，像是想起了溪边那盆衣裳。当晚她把峨嵋九阳功的口诀传给了你。' : '大殿上的人都看着你。掌门点了点头，说峨嵋记着这份情。') },
        { t: '说是小师妹们自己守住的', fx: (g) => { g.add('品德', 3); g.addContrib(1); if (g.alive('jingxuan')) g.like('jingxuan', 6); },
          res: '小师妹们红了脸。静玄看了你一眼，没有拆穿。' },
        { t: '说山上没人管，大家各管各的', fx: (g) => { g.like(emHead(g), -6); },
          res: '掌门皱起了眉，没再问下去。' },
      ] },

    /* ================= 全真 ================= */
    { id: 'qz_ch_copy', chore: 'quanzhen', t: '抄经',
      text: '你在经楼抄《道德经》。一本旧经的夹层里滑出一张纸，上面画着几个小人在练剑。',
      choices: [
        { t: '拿去给守经楼的老道看', fx: (g) => { g.like('qz_laodao', 8); g.learn('quanzhen_jian', 1); },
          res: '老道看了半天，说是丘真人年轻时画着玩的。他没收走，叫你照着练。' },
        { t: '自己收起来', fx: (g) => { g.add('品德', -3); g.add('攻击', 1); g.set('qzHidPage'); },
          res: '你把纸叠好，塞进了袖子。夜里你照着比画了几下。' },
        { t: '夹回去，接着抄', fx: (g) => g.addContrib(1), res: '你把纸夹了回去。经抄完了，字很工整。' },
      ] },

    { id: 'qz_ch_audit', chore: 'quanzhen', t: '查经', cond: (g) => g.done('qz_ch_copy') > 0,
      text: (g) => '监院道长在查经楼的书，说有一本旧经的夹层空了。' + (g.f('qzHidPage') ? '他一个一个问过来，问到了你。' : '他问你抄经的时候看见什么没有。'),
      choices: [
        { t: '把纸交出来认错', cond: (g) => g.f('qzHidPage'), fx: (g) => { g.add('品德', 3); g.like('qz_jianyuan', 4); g.like('qz_laodao', 4); g.unset('qzHidPage'); g.learn('quanzhen_jian', 1); },
          res: '监院罚你扫了三天台阶。守经楼的老道把那张纸要了过去，第二天叫你去后院，一招一招教你。' },
        { t: '说没看见', cond: (g) => g.f('qzHidPage'), fx: (g) => { g.add('品德', -4); g.set('qzLied'); g.like('qz_laodao', -8); },
          res: '监院没再追问。守经楼的老道站在门边，叹了一口气。' },
        { t: '照实说，纸还在原处', cond: (g) => !g.f('qzHidPage'), fx: (g) => { g.like('qz_jianyuan', 4); g.addContrib(1); },
          res: '监院去看了，纸果然在。他说这些年经楼里少的东西太多，他是怕了。' },
        { t: '帮着一本一本查', cond: (g) => !g.f('qzHidPage'), check: ['资质', '中'],
          fx: (g) => { g.addContrib(2); g.like('qz_jianyuan', 6); }, res: '你在楼梯缝里找到了被老鼠拖走的半页经。监院笑了，这是你头一回看见他笑。',
          fail: { fx: (g) => g.days(3), res: '你翻了三天，什么也没找到。' } },
      ] },

    { id: 'qz_ch_letter', chore: 'quanzhen', t: '送信', cond: (g) => g.before(134, 3),
      text: (g) => '监院道长把一封信交给你。' + (g.before(132, 6) ? '山下来过几个番僧，问藏经楼在哪。监院想请武当派人来看看。' : '王府的人这两年常在山下转。监院想问问武当，他们那边是不是也一样。'),
      choices: [
        { t: '领命，去武当山', fx: (g) => { g.errand('qz_err_wudang', 'wudang', 40, '把监院道长的信送到武当山'); g.like('qz_jianyuan', 3); },
          res: '你把信缝进了衣襟。监院送你到山门，说路上别跟人起争执。' },
        { t: '请道长另派人', fx: (g) => g.like('qz_jianyuan', -4), res: '监院把信收了回去，说那就再等等。' },
      ] },
    { id: 'qz_err_wudang_go', errand: 'qz_err_wudang', t: '武当', cond: (g) => g.sect === 'quanzhen',
      text: (g) => (g.here('songyuanqiao') ? '宋远桥在紫霄宫前接了信。他看完说，全真和武当，往上数都是一家。' : '紫霄宫的道童接了信，说几位师父都下山去了。'),
      choices: [
        { t: '请宋大侠派人去终南山', cond: (g) => g.here('songyuanqiao'),
          fx: (g) => { g.taskDone('qz_err_wudang', '你把信送到了武当。'); g.set('qzWudangHelp'); g.like('songyuanqiao', 6); g.addContrib(2); },
          res: '宋远桥点了两个弟子，跟你一道回终南山。' },
        { t: '讨一封回信就走', fx: (g) => { g.taskDone('qz_err_wudang', '你把信送到了武当。'); g.addContrib(2); g.give('jinchuang', 1); },
          res: '你拿了回信，道童又塞给你一包伤药，说是武当自己配的。' },
      ] },

    { id: 'qz_ch_wine', chore: 'quanzhen', t: '翻窗',
      text: '半夜，同屋的师兄翻窗出去了。他回来的时候一身酒气，求你别告诉监院。',
      choices: [
        { t: '第二天告诉监院', fx: (g) => { g.like('qz_jianyuan', 6); g.addContrib(1); g.set('qzTattle'); },
          res: '师兄被罚挑了一个月水。他在井边看你的眼神很冷。' },
        { t: '替他瞒着', fx: (g) => { g.add('品德', -1); g.set('qzCovered'); },
          res: '师兄拍了拍你的肩膀。第二天他塞给你半个烧饼。' },
        { t: '劝他自己去认', need: ['品德', 55], fx: (g) => { g.add('品德', 2); g.like('qz_jianyuan', 3); g.set('qzCovered'); },
          res: '师兄犹豫了一夜，第二天自己去了。监院只罚他抄了三遍经。' },
      ] },
    { id: 'qz_ch_brother', chore: 'quanzhen', t: '师兄', cond: (g) => g.f('qzTattle') || g.f('qzCovered'),
      text: (g) => (g.f('qzTattle') ? '后山的石阶上抹了一层油。你脚下一滑，抬头看见那个师兄站在上面。' : '你在后山练功岔了气，倒在地上起不来。是那个喝酒的师兄把你背了回去。'),
      choices: [
        { t: '上去跟他打一架', cond: (g) => g.f('qzTattle'), fight: { foes: ['qzdaoshi'],
          win: { fx: (g) => { g.like('qz_jianyuan', -3); g.unset('qzTattle'); }, res: '你把他按在地上。他喘着气说，这下扯平了。监院知道后，罚你们俩一起扫了十天院子。' },
          lose: { res: '你被他打得鼻青脸肿。他扔下一句“多嘴的下场”，走了。' } } },
        { t: '去找监院说清楚', cond: (g) => g.f('qzTattle'), fx: (g) => { g.like('qz_jianyuan', 4); g.addContrib(1); },
          res: '监院把师兄叫去，关了一个月的禁闭。从此后山的石阶很干净。' },
        { t: '谢过他，请他教你两步轻身的功夫', cond: (g) => !g.f('qzTattle'), fx: (g) => g.learn('jinyan', 1),
          res: '师兄说他下山喝酒，靠的就是这两步金雁功。他教得很耐心。' },
        { t: '谢过他，托他帮你运气疗伤', cond: (g) => !g.f('qzTattle'), fx: (g) => { g.heal(80); g.cure(1); },
          res: '他按着你的后背运了一夜的气。天亮的时候，胸口不闷了。' },
      ] },

    { id: 'qz_ch_grain', chore: 'quanzhen', t: '征粮', from: [133, 1],
      text: (g) => '一个元军百夫长带着兵上了山，说重阳宫的存粮要充军。监院拦在仓门前。' + (g.f('qzWudangHelp') ? '武当来的两个师兄站在他身后。' : '') + (g.f('qzLied') ? '守经楼的老道没出来，他这些日子不太理你。' : ''),
      choices: [
        { t: '拦着', cond: (g) => !g.f('qzWudangHelp'), fight: { foes: ['baihu', 'yuanbing'],
          win: { fx: (g) => { g.like('qz_jianyuan', 8); g.addContrib(3); g.add('声望', 5); }, res: '百夫长捂着胳膊下了山。山下的佃户听说了，送上来两筐鸡蛋。' },
          lose: { res: '仓门被砸开了，粮车一辆一辆下了山。' } } },
        { t: '和武当的师兄一起拦着', cond: (g) => g.f('qzWudangHelp'), fight: { foes: ['baihu'],
          win: { fx: (g) => { g.like('qz_jianyuan', 8); g.like('songyuanqiao', 4); g.addContrib(3); g.add('声望', 5); }, res: '武当的师兄缠住了元兵，你对上了百夫长。他捂着胳膊下了山。' },
          lose: { res: '武当的师兄把你扶了起来。仓门被砸开了，粮车一辆一辆下了山。' } } },
        { t: '劝监院交出一半', fx: (g) => { g.like('qz_jianyuan', -3); g.addContrib(1); },
          res: '粮交了一半，百夫长走了。监院在仓门口坐了一夜。' },
        { t: '夜里从后山把粮运走', check: ['轻功', '中'], fx: (g) => { g.like('qz_jianyuan', 5); g.addContrib(2); },
          res: '天亮的时候，仓里只剩几袋糠。百夫长骂了半天，什么也没拿到。',
          fail: { fx: (g) => g.hurt(40), res: '一辆粮车翻进了沟里，你被压在下面，半天才爬出来。' } },
      ] },

    /* ================= 丐帮 ================= */
    { id: 'gb_ch_thief', chore: 'gaibang', t: '偷鸡',
      text: '城南一个寡妇找上破庙，说丐帮的小叫化偷了她的鸡。偷鸡的孩子被揪了出来，才十二三岁。',
      choices: [
        { t: '押去见传功长老', fx: (g) => { g.like('gb_chuangong', 6); g.addContrib(1); },
          res: '长老打了他十棍，叫他去给寡妇劈一个月柴。孩子一声没哭。' },
        { t: '自己掏钱赔给寡妇，放他走', cost: { 银两: 10 }, fx: (g) => { g.add('品德', 3); g.set('gbSparedThief'); },
          res: '孩子跑了。跑出去很远，又回头看了你一眼。' },
        { t: '带他去给寡妇赔不是', fx: (g) => { g.add('品德', 2); g.like('gb_zhangbang', 4); g.days(2); },
          res: '你们在寡妇家门口跪了半天。寡妇心软了，留你们吃了一顿饭。' },
      ] },

    { id: 'gb_ch_box', chore: 'gaibang', t: '食盒', from: [133, 1],
      cond: (g) => g.alive('chenyouliang') && !g.f('cylDown') && g.alive('shihuolong') && !g.f('fakeBangzhu') && !g.f('knowFake'),
      text: (g) => '陈友谅塞给你一个食盒，叫你半夜送进帮主房里。“别让人看见。”' + (g.f('gbSparedThief') ? '你出门时，那个偷鸡的孩子拉住你的袖子：“陈长老的东西，别碰。”' : ''),
      choices: [
        { t: '照办', fx: (g) => { g.like('chenyouliang', 6); g.add('银两', 10); },
          res: '帮主接过食盒，没看你一眼，关上了门。第二天陈友谅给了你十两银子。' },
        { t: '路上先掀开看看', check: ['资质', '中'],
          fx: (g) => { g.set('knowFake'); }, res: '食盒里是一瓶药水，还有一张字条，写着“明日照旧”。你闻得出那是易容的药。坐在庙里的那个帮主是假的。',
          fail: { fx: (g) => { g.like('chenyouliang', -8); g.set('cylWary'); }, res: '盖子还没掀开，陈友谅就站在你身后了。他笑着把食盒拿了回去。' } },
        { t: '推说肚子疼', fx: (g) => g.like('chenyouliang', -3), res: '陈友谅看了你一会儿，把食盒交给了别人。' },
      ] },

    { id: 'gb_ch_hong', chore: 'gaibang', t: '竹竿', from: [134, 1], cond: (g) => g.alive('shihongshi') && !g.f('fakeBangzhu') && g.before(136, 6),
      text: '史红石蹲在破庙后面，拿一根竹竿戳地。她说她爹以前教过她一套棍法，现在爹不认得她了。',
      choices: [
        { t: '找根竹竿，陪她练', fx: (g) => { g.like('shihongshi', 8); g.set('gbHongFriend'); g.days(3); },
          res: '你们练了三天。她的棍法很生，可每一招都记得清清楚楚。' },
        { t: '问她“不认得”是什么意思', cond: (g) => !g.f('knowFake'), check: ['资质', '难'],
          fx: (g) => { g.set('knowFake'); g.like('shihongshi', 4); }, res: '她说爹以前用左手拿筷子，现在用右手。爹以前叫她红儿，现在叫她丫头。你心里一凉。',
          fail: { fx: (g) => g.like('shihongshi', -2), res: '她咬着嘴唇，不肯再说了。' } },
        { t: '叫她别乱说话', fx: (g) => { g.like('shihongshi', -6); if (g.alive('chenyouliang')) g.like('chenyouliang', 3); },
          res: '她瞪了你一眼，跑了。陈友谅在墙角笑了笑。' },
      ] },

    { id: 'gb_ch_split', chore: 'gaibang', t: '净衣污衣',
      text: '分舵里吵起来了。净衣派的人说，该和官府结交；污衣派的人说，丐帮就该要饭。掌棒龙头叫你说句话。',
      choices: [
        { t: '站污衣派', fx: (g) => { g.like('gb_zhangbang', 5); g.set('gbWuyi'); },
          res: '污衣派的老叫化们拍着你的背，把一碗剩饭推到你面前。' },
        { t: '站净衣派', fx: (g) => { g.add('银两', 10); g.like('gb_zhangbang', -5); g.set('gbJingyi'); },
          res: '散了以后，净衣派的一个长老塞给你十两银子。' },
        { t: '说帮规只管偷不偷、抢不抢，管不着穿什么', need: ['品德', 55], fx: (g) => { g.like('gb_chuangong', 6); g.add('声望', 3); },
          res: '屋里静了一会儿。传功长老笑出了声，说这话该写在破庙的墙上。' },
      ] },

    { id: 'gb_ch_north', chore: 'gaibang', t: '北上', from: [134, 1], cond: (g) => g.rank >= 1 && g.before(136, 6),
      text: '掌棒龙头说，北边的兄弟传话回来，汝阳王府这阵子在招揽番僧和高手。“你去大都，看看他们要干什么。”',
      choices: [
        { t: '领命', fx: (g) => { g.errand('gb_err_dadu', 'dadu', 50, '去大都打探汝阳王府的动静'); g.like('gb_zhangbang', 3); },
          res: '掌棒龙头给了你一只旧碗，说到了大都，拿着它去找城北的老孙头。' },
        { t: '说自己面生，请他派老兄弟去', fx: (g) => g.like('gb_zhangbang', -4), res: '掌棒龙头哼了一声，说年轻人就是怕冷。' },
      ] },
    { id: 'gb_err_dadu_go', errand: 'gb_err_dadu', t: '王府后门', cond: (g) => g.sect === 'gaibang',
      text: (g) => (g.before(135, 3, 10) ? '城北的老孙头带你到王府后门。门口进进出出都是番僧，还有一车一车的铁链。' : '万安寺的塔烧了以后，王府四门紧闭，巡夜的兵多了一倍。'),
      choices: [
        { t: '扮成要饭的，在后门蹲三天', fx: (g) => { g.days(3); g.taskDone('gb_err_dadu', '你把王府的动静记了下来。'); g.addContrib(2); g.set('gbDaduNews'); g.like('gb_zhangbang', 5); },
          res: '你记下了进出的人和车马。第三天夜里，你听见两个武士说起郡主和一种叫十香软筋散的药。' },
        { t: '翻墙进去听', check: ['轻功', '难'],
          fx: (g) => { g.taskDone('gb_err_dadu', '你探明了王府的虚实。'); g.addContrib(3); g.set('gbDaduNews'); g.add('声望', 3); },
          res: '你在房梁上趴了半夜，听见王府的人在点哪几派的高手先抓。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); g.taskDone('gb_err_dadu', '你带着伤从大都回来。'); g.addContrib(1); }, res: '墙头上有铃铛。你挨了一箭，从水沟里爬了出去。' } },
        { t: '花钱请王府的马夫喝酒', cost: { 银两: 20 }, fx: (g) => { g.taskDone('gb_err_dadu', '你从马夫嘴里套出了话。'); g.addContrib(2); g.set('gbDaduNews'); },
          res: '马夫喝到第三壶，说王府要在万安寺关一大批人，塔都腾空了。' },
      ] },

    { id: 'gb_ch_newhead', chore: 'gaibang', t: '新帮主', cond: (g) => g.alive('shihongshi') && (g.f('fakeBangzhu') || g.after(136, 6)),
      text: (g) => '史红石做了帮主。她坐在破庙的供桌上，脚还够不着地。长老们一个一个上来交差。' +
        (g.f('gbHongFriend') ? '她看见你，偷偷朝你眨了眨眼。' : '') +
        (g.f('gbDaduNews') ? '掌棒龙头提起你从大都带回来的消息。' : '') +
        (late(g, 'gb_err_dadu') ? '有人提起你去大都误了期。' : '') +
        (g.f('gbJingyi') ? '净衣派的几个人站在你身边，等着你开口。' : g.f('gbWuyi') ? '污衣派的老叫化们把你推到了前头。' : ''),
      choices: [
        { t: '请帮主让你管一路兄弟', cond: (g) => g.f('gbHongFriend') || g.f('gbDaduNews'), fx: (g) => { g.addContrib(3); g.like('shihongshi', 6); g.add('声望', 5); },
          res: '史红石想了想，把城东的二十几个兄弟交给了你。她说，别让他们饿着。' },
        { t: '说城外的饥民比交差要紧', fx: (g) => { g.add('品德', 2); g.like('gb_chuangong', 4); g.like('shihongshi', 2); },
          res: '史红石从供桌上跳下来，说那就先去城外。长老们愣了一下，跟着她走了。' },
        { t: '跟着长老们磕头', fx: (g) => { g.like('shihongshi', 3); g.addContrib(1); },
          res: '你磕了头。史红石说，起来吧，丐帮不兴这个。' },
        { t: '替净衣派说话，请帮主和官府走近些', cond: (g) => g.f('gbJingyi'), fx: (g) => { g.like('shihongshi', -6); g.like('gb_zhangbang', -6); g.add('银两', 20); },
          res: '史红石没答应。散了以后，净衣派的人又塞给你二十两。' },
      ] },

    /* ================= 明教 ================= */
    { id: 'mj_ch_quarrel', chore: 'mingjiao', t: '拍桌子', from: [134, 1], cond: (g) => g.before(134, 5) && g.alive('yangxiao') && g.alive('zhoudian'),
      text: '大敌就要上山了。周颠还在聚义厅里拍桌子，骂杨逍想当教主。杨逍坐着喝茶，眼皮都没抬。两个人都看向你。',
      choices: [
        { t: '替杨左使说话', fx: (g) => { g.like('yangxiao', 6); g.like('zhoudian', -6); },
          res: '周颠指着你骂了半天，骂累了，自己走了。杨逍朝你举了举茶碗。' },
        { t: '替周先生说话', fx: (g) => { g.like('zhoudian', 6); g.like('yangxiao', -6); },
          res: '周颠哈哈大笑，说光明顶上总算有个明白人。杨逍放下了茶碗。' },
        { t: '去请殷老鹰王来劝', cond: (g) => g.here('yintianzheng'), fx: (g) => { g.like('yintianzheng', 5); g.addContrib(1); },
          res: '殷天正进门只说了一句：“六大派还没来，自己人先打起来了？”两个人都不吭声了。' },
      ] },

    { id: 'mj_ch_spy', chore: 'mingjiao', t: '探子', from: [133, 10], cond: (g) => g.before(134, 5),
      text: '山口抓到一个人，身上带着崆峒派的令牌，说是来探路的。庄铮叫你看着他。',
      choices: [
        { t: '交给杨左使发落', cond: (g) => g.alive('yangxiao'), fx: (g) => { g.like('yangxiao', 4); g.addContrib(2); g.add('品德', -3); },
          res: '第二天早上，那人不见了。没有人再提起他。' },
        { t: '自己审他', check: ['资质', '中'], fx: (g) => { g.set('mjKnowRoute'); g.addContrib(2); g.like('zhuangzheng', 4); },
          res: '他熬到半夜，说了。六大派分六路上山，峨嵋走西边的冰川。庄铮连夜调了锐金旗去守。',
          fail: { res: '他一口咬定自己是采药的，说完就闭上了眼睛。' } },
        { t: '半夜放他走', fx: (g) => { g.add('品德', 4); g.set('mjSpyFreed'); g.like('zhuangzheng', -6); },
          res: '你割断绳子，指了一条下山的路。他没说谢，跑得很快。' },
      ] },

    { id: 'mj_ch_medicine', chore: 'mingjiao', t: '伤药', cond: (g) => g.before(134, 4),
      text: (g) => (g.before(133, 4) ? '庄铮说，旗里几个兄弟的伤拖了半年。蝴蝶谷的胡青牛先生医术天下第一，要去求一副方子。' : '庄铮说，蝴蝶谷的胡先生死了，可谷里还有个常遇春，跟着他认过几年药。旗里几个兄弟的伤拖不得。'),
      choices: [
        { t: '领命，去蝴蝶谷', fx: (g) => { g.errand('mj_err_hudie', 'hudie', 50, '去蝴蝶谷替锐金旗求伤药'); g.like('zhuangzheng', 4); },
          res: '庄铮把一包碎银子塞给你，说路上别省。' },
        { t: '说自己不认得药，请他派别人', fx: (g) => g.like('zhuangzheng', -4), res: '庄铮挠挠头，叫了另一个兄弟。' },
      ] },
    { id: 'mj_err_hudie_go', errand: 'mj_err_hudie', t: '蝴蝶谷', cond: (g) => g.sect === 'mingjiao',
      text: (g) => (g.before(133, 4) ? '谷里种满了草药。茅屋里坐着一个瘦削的中年人，听说你是光明顶来的，才抬了抬眼皮。' : g.here('changyuchun') ? '常遇春在谷口劈柴，听说是光明顶来的，放下斧头就迎了上来。' : '谷里没人。药圃荒了，屋檐下挂着几串晒干的草药。'),
      choices: [
        { t: '求胡先生开方子', cond: (g) => g.before(133, 4),
          fx: (g) => { g.taskDone('mj_err_hudie', '你从蝴蝶谷求回了伤药。'); g.give('jinchuang', 3); g.give('jiedu', 1); g.addContrib(3); },
          res: '胡先生问清是本教的兄弟，提笔开了方子，又多给了一瓶解毒丹。' },
        { t: '请常遇春帮着配药', cond: (g) => !g.before(133, 4) && g.here('changyuchun'),
          fx: (g) => { g.taskDone('mj_err_hudie', '你从蝴蝶谷求回了伤药。'); g.give('jinchuang', 3); g.like('changyuchun', 6); g.addContrib(2); },
          res: '常遇春配了一夜的药。他说胡先生在的时候，他只会劈柴，药都是看会的。' },
        { t: '自己在药圃里找', check: ['资质', '中'],
          fx: (g) => { g.taskDone('mj_err_hudie', '你从蝴蝶谷采回了伤药。'); g.give('jinchuang', 2); g.addContrib(2); },
          res: '你认出了几样止血的草，捣烂了包好。',
          fail: { fx: (g) => g.days(3), res: '你在药圃里转了三天，分不清哪些是药，哪些是草。' } },
      ] },

    { id: 'mj_ch_ruins', chore: 'mingjiao', t: '收拾', from: [134, 6], cond: (g) => g.before(135, 1),
      text: (g) => '六大派退下山了。光明顶烧黑了一半。' + (g.alive('zhuangzheng') ? '庄铮吊着胳膊，领着人收拾。' : '锐金旗的旗子还插在原处，扛旗的人不在了。') +
        (g.f('mjKnowRoute') ? '有人说，西边冰川那一路，多亏你事先问出来，旗里才没被人包了。' : '') +
        (g.f('mjSpyFreed') ? '有个兄弟说，那天你放走的那个崆峒探子，上山时走在最前面。' : ''),
      choices: [
        { t: '留下修山门，埋兄弟', fx: (g) => { g.addContrib(2); g.add('品德', 2); if (g.alive('zhuangzheng')) g.like('zhuangzheng', 6); },
          res: '你在后山挖了七天的坑。每埋一个，就有人念一遍圣火的经文。' },
        { t: '去蝴蝶谷，赶上教中聚义', cond: (g) => g.after(134, 8), fx: (g) => g.errand('mj_err_rally', 'hudie', 60, '去蝴蝶谷，赶上明教聚义'),
          res: '听说新教主要在蝴蝶谷聚齐各路人马。你收拾了包袱，往东走了。' },
        { t: '下山去追六大派，报仇', fight: { foes: ['emdizi', 'slwuseng'],
          win: { fx: (g) => { g.add('品德', -4); g.add('声望', 6); g.set('mjRevenge'); }, res: '你在山下截住了两个落单的。你回到山上，没有人夸你。' },
          lose: { fx: (g) => g.set('mjRevenge'), res: '你被打得滚下了山坡，几个兄弟把你抬了回来。' } } },
      ] },
    { id: 'mj_err_rally_go', errand: 'mj_err_rally', t: '聚义', from: [134, 9], cond: (g) => g.sect === 'mingjiao',
      text: (g) => '蝴蝶谷里搭满了草棚，各路的旗主、散人都到了。' + (g.here('zhangwuji') ? '新教主张无忌站在中间，比你想的年轻。' : g.here('yangxiao') ? '杨逍站在棚前点名。' : ''),
      choices: [
        { t: '报到，跟着锐金旗', fx: (g) => { g.taskDone('mj_err_rally', '你赶上了蝴蝶谷聚义。'); g.addContrib(3); },
          res: '旗里的兄弟给你腾了一块铺。夜里大家围着火，说的都是以后的事。' },
        { t: '求见教主，说光明顶上的事', cond: (g) => g.here('zhangwuji'),
          fx: (g) => { g.taskDone('mj_err_rally', '你赶上了蝴蝶谷聚义。'); g.addContrib(2); g.like('zhangwuji', 8); g.add('声望', 4); },
          res: '张无忌听你说完，沉默了一会儿。他说，死了的兄弟，明教一个都不会忘。' },
        { t: '跟常遇春去打附近的元兵', cond: (g) => g.here('changyuchun'), fight: { foes: ['yuanbing', 'yuanbing', 'yuanbing'],
          win: { fx: (g) => { g.taskDone('mj_err_rally', '你在蝴蝶谷聚义时立了一功。'); g.addContrib(3); g.like('changyuchun', 6); }, res: '你们端了一个元兵的哨所。常遇春扛着缴来的刀，笑得像个孩子。' },
          lose: { fx: (g) => g.taskDone('mj_err_rally', '你赶上了蝴蝶谷聚义，挂了彩。'), res: '你挨了一刀，是常遇春把你拖回来的。' } } },
      ] },

    { id: 'mj_ch_mutton', chore: 'mingjiao', t: '烤羊',
      text: '教规不许喝酒吃肉。锐金旗一个老兄弟在山后烤了一只野羊，冲你招手。',
      choices: [
        { t: '过去吃一口', fx: (g) => { g.add('品德', -1); g.heal(40); g.set('mjMeat'); },
          res: '羊肉烤得焦香。老兄弟说，圣火又不吃饭，管那么多。' },
        { t: '报给庄铮', cond: (g) => g.alive('zhuangzheng'), fx: (g) => { g.like('zhuangzheng', 4); g.addContrib(1); },
          res: '老兄弟被罚守了一个月的夜哨。他在哨台上冲你吐了口唾沫。' },
        { t: '劝他把羊送给山下的牧民', fx: (g) => { g.add('品德', 2); g.add('声望', 2); },
          res: '他嘟囔了半天，还是扛着羊下了山。牧民们送上来一桶马奶。' },
      ] },

    { id: 'mj_ch_rise', chore: 'mingjiao', t: '起兵', from: [136, 3],
      text: (g) => '各地的明教兄弟起兵了。山上来了信，叫光明顶也出一队人，去打附近的元军粮站。' +
        (g.f('mjRevenge') ? '有人说你从前下山找六大派报仇，教主说过，六大派的旧账一笔勾销。' : '') +
        (g.f('mjMeat') ? '那个烤羊的老兄弟也在队伍里，冲你挤眼睛。' : ''),
      choices: [
        { t: '带人去劫粮', fight: { foes: ['baihu', 'yuanbing'],
          win: { fx: (g) => { g.addContrib(3); g.add('声望', 8); }, res: '粮站烧起来了。你们赶着二十车粮回了山。' },
          lose: { res: '元兵早有防备，你们退了回来，折了几个兄弟。' } } },
        { t: '劝大家别杀降兵', need: ['品德', 50], fx: (g) => { g.add('品德', 3); g.addContrib(1); if (g.alive('zhuangzheng')) g.like('zhuangzheng', 4); },
          res: '劫了粮，投降的元兵被放回了家。有几个没走，留下来入了教。' },
        { t: '留在山上守着', fx: (g) => g.addContrib(1), res: '队伍下山了。光明顶上很静，只剩风声。' },
      ] },

    /* ================= 哪个门派都行 ================= */
    { id: 'ch_any_sick', chore: '*', t: '病倒',
      text: (g) => '同门里有个人病倒了，烧得说胡话。' + (g.f('chLedger') ? '这回的药钱，是被你查出来的那个管库房的人掏的。' : '大家都怕过了病气，没人敢靠近。'),
      choices: [
        { t: '守着他', fx: (g) => { g.days(10); g.add('品德', 2); g.addContrib(1); g.set('chNursed'); },
          res: '你守了他十天。烧退的那天，他抓着你的手说不出话。' },
        { t: '下山买药', cost: { 银两: 15 }, fx: (g) => { g.add('品德', 1); g.addContrib(2); },
          res: '药很苦。他喝了三天，能下地了。' },
        { t: '叫他自己扛着', fx: (g) => g.add('品德', -2), res: '他扛过来了。病好以后，他再也没跟你说过话。' },
      ] },
    { id: 'ch_any_ledger', chore: '*', t: '账目',
      text: (g) => '你帮着对门里的账，少了三十两。' + (g.f('chNursed') ? '你照顾过的那个同门悄悄告诉你，管库房的人这几个月常去赌坊。' : ''),
      choices: [
        { t: '照他说的，去库房对账', cond: (g) => g.f('chNursed'), fx: (g) => { g.addContrib(2); g.set('chLedger'); },
          res: '库房的人没赖账。他把赌坊的欠条摊在桌上，答应一个月里补齐。' },
        { t: '一笔一笔查下去', cond: (g) => !g.f('chNursed'), check: ['资质', '中'], fx: (g) => { g.addContrib(2); g.set('chLedger'); },
          res: '你查到了库房，账是在那里断的。',
          fail: { fx: (g) => g.days(5), res: '你对了五天，越对越乱。' } },
        { t: '自己掏钱补上', cost: { 银两: 30 }, fx: (g) => { g.addContrib(2); g.add('品德', 1); },
          res: '账平了。没人知道钱是谁补的。' },
        { t: '装作没看见', fx: (g) => g.add('品德', -1), res: '账本合上了。下个月又少了二十两。' },
      ] },
  ]);
})();

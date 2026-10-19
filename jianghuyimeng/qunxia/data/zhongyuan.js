/* 群侠 · 中原：嵩山少林寺、武当山、蝴蝶谷
 * 事件字段：id、loc、who（在和这个人说话时出现）、act（按钮上的字）、arrive（到达时自动）、explore（探索时抽到）、
 *   from / to（[年, 月] 起止）、cond、once（默认只发生一次，false 可重复）、t、text、fx（开始时执行）、choices。
 * 选项：t、cond、check: ['属性', 难度]、cost: { 银两 }、fx、res、fail: { fx, res }、next（接着发生的事件）、
 *   fight: { foes, noFlee, win: { fx, res, next }, lose: { mode: 'injury' | 'death', fx, res, next }, flee }。 */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEvents([
    /* ---------- 少林 ---------- */
    { id: 'sl_orphan', loc: 'shaolin', arrive: true, cond: (g) => g.S.origin === 'orphan' && g.day < 5, t: '山门',
      text: '你又站在了少林山门口。施粥的老和尚还认得你，问你这几年去了哪里。',
      choices: [
        { t: '说要出去学武', fx: (g) => { g.add('品德', 2); g.give('jinchuang', 1); }, res: '老和尚塞给你一包金创药：“学武是为了救人，记住了。”' },
        { t: '帮他施了一天粥再走', fx: (g) => { g.days(1); g.add('品德', 3); g.add('声望', 1); }, res: '你舀了一天的粥。排队的人里，有和你当年一样大的孩子。' },
      ] },
    { id: 'sl_luohan_tang', loc: 'shaolin', explore: 'shaolin', once: false, w: 3, t: '罗汉堂外',
      text: '罗汉堂外的空地上，几十个武僧在晨雾里练拳，脚下的青石板踩出了一个个浅坑。',
      choices: [
        { t: '躲在树后偷看', check: ['资质', '中'], fx: (g) => { if (g.lv('luohan')) g.S.arts.luohan.xp += 15; else g.add('攻击', 0.5); }, res: '你看懂了几式，回去比划，好像真有点样子。', fail: { fx: (g) => g.add('声望', -1), res: '你被巡山的武僧发现，轰下了山。' } },
        { t: '上前请教', fx: (g) => g.add('品德', 1), res: '武僧说少林的拳要在寺里学，让你去找知客僧。' },
      ] },
    { id: 'sl_yuanzhen_hand', who: 'yuanzhen', act: '留意圆真的手', cond: (g) => g.f('heardChengkun') && !g.f('knowChengkun'), t: '圆真',
      text: '谢逊说过，成昆的手指又白又细，笑起来很和气。你看着眼前这个和尚，他的手也是这样。',
      choices: [
        { t: '借口请教，看他出指', check: ['资质', '中'], fx: (g) => { g.set('knowChengkun'); g.add('声望', 2); },
          res: '他随手一指，你看见了一点阴寒的气。谢逊说过的幻阴指，就是这个样子。圆真就是成昆。你没有说破，他也在看你。',
          great: { fx: (g) => g.add('资质', 1), res: '他出指的那一下，你不光看出了幻阴指，还看清了他运劲的路数。圆真就是成昆。他笑着看你，你也笑着看他。' }, fail: { fx: (g) => g.hurt(30), res: '他笑着拍了拍你的肩膀，你半边身子麻了一整天。你什么也没看出来。' } },
        { t: '先不打草惊蛇', fx: (g) => g.add('资质', 0.5), res: '你记下了他的样子。还不能确定。' },
      ] },
    { id: 'sl_cangjing', loc: 'shaolin', act: '夜探藏经阁', cond: (g) => !(g.f('watchSl') && g.day - g.f('watchSl') < 180) && !g.has('yijin') && g.holder('yijin') === 'shaolin', once: false, t: '藏经阁',
      text: '半夜，藏经阁的灯还亮着。最高一层供着一部用贝叶写的经，听说就是达摩祖师留下的易筋经。',
      choices: [
        { t: '从后窗翻进去', check: ['轻功', '极难'], fx: (g) => { g.give('yijin'); g.set('robbedShaolin'); g.add('品德', -15); },
          res: '你摸到了那个木匣，揣进怀里，从屋檐上一路跑下了山。身后的钟声响了一夜。',
          great: { fx: (g) => { g.give('dahuan', 1); g.add('声望', 5); }, res: '你摸到了木匣，又顺手揣走了供桌上的一颗大还丹。整座寺没有一个人醒。' }, fail: { res: '你踩响了一片瓦。四个武僧提着棍子围了上来。', next: 'sl_cangjing_caught' } },
        { t: '运起内力，屏住呼吸从塔檐纵上顶层', cost: { 内力: 30 }, check: ['轻功', '极难', 20], fx: (g) => { g.give('yijin'); g.set('robbedShaolin'); g.add('品德', -15); },
          res: '你提着一口真气，踩着飞檐一层一层翻上去，落脚一点声音也没有。木匣到手，你从另一面滑了下去。',
          fail: { res: '真气走到一半散了，你扒着檐角吊在半空。底下的武僧提着灯笼围了过来。', next: 'sl_cangjing_caught' } },
        { t: '算了，佛门的东西不碰', fx: (g) => g.add('品德', 2), res: '你在藏经阁外站了一会儿，回去了。' },
      ] },
    { id: 'sl_cangjing_caught', once: false, fx: (g) => g.set('watchSl', g.day), // 被抓过一回，半年内这里戒备森严
      t: '被围',
      text: '武僧们的棍子封住了四面。领头的说：“施主放下东西，少林不伤人。”',
      choices: [
        { t: '硬闯', fight: { foes: ['slwuseng', 'slwuseng', 'slwuseng'], win: { fx: (g) => { g.give('yijin'); g.set('robbedShaolin'); g.add('品德', -20); }, res: '你打翻了三个武僧，抢了经书冲下山去。少林从此把你当成了贼。' },
          lose: { fx: (g) => { g.days(60); g.add('声望', -5); }, res: '你被罚在少林挑了两个月水。放你下山那天，方丈说：“回头是岸。”' } } },
        { t: '认错，跪下', fx: (g) => { g.days(30); g.add('品德', 3); g.add('声望', -3); }, res: '你在戒律院跪了一夜，又挑了一个月的水，才被放下山。' },
      ] },
    { id: 'sl_kongwen_thanks', who: 'kongwen', act: '拜见方丈', cond: (g) => g.f('chengkunExposed') && !g.has('yijin') && g.holder('yijin') === 'shaolin' && !g.f('robbedShaolin'), t: '方丈',
      text: '空闻方丈说，屠狮大会那天，若不是你说破圆真的真面目，少林就成了天下的笑话。“施主要什么，少林能给的都给。”',
      choices: [
        { t: '求借易筋经一观', fx: (g) => { g.give('yijin'); g.add('声望', 10); }, res: '方丈沉默了很久，取出了那只木匣。“经书借给施主。施主百年之后，送回少林。”' },
        { t: '什么都不要', fx: (g) => { g.add('品德', 5); g.add('声望', 15); g.give('dahuan', 3); }, res: '方丈双手合十，送了你三颗大还丹。少林的和尚，从此都管你叫“施主”，不叫“那个人”了。' },
      ] },
    { id: 'sl_tushi', t: '屠狮英雄会',
      fx: (g) => { g.set('atTushi'); },
      text: (g) => '少林寺前搭了一座高台，天下英雄都来了。后山的地牢里关着谢逊，三位渡字辈的老僧守在牢外。' + (g.alive('yuanzhen') ? '圆真在台上主持，笑容和善。' : '') + (g.holder('tulong') === 'zhouzhiruo' ? '峨嵋周掌门坐在一边，身后的弟子捧着一只长匣。' : ''),
      choices: [
        { t: '当众揭穿圆真就是成昆', cond: (g) => g.f('knowChengkun') && g.alive('yuanzhen'), fx: (g) => { g.set('chengkunExposed'); g.add('品德', 8); g.add('声望', 30); },
          res: '你说出了幻阴指，说出了谢逊满门的血案，说出了他在光明顶上做的事。台下一片哗然。圆真的脸色变了又变。', next: 'sl_tushi_gb' },
        { t: '先看看', res: '你挤在人堆里，看各派的人轮番上台。', next: 'sl_tushi_gb' },
      ] },
    { id: 'sl_tushi_gb', t: '丐帮',
      text: (g) => (g.alive('shihuolong') && !g.f('fakeBangzhu') ? '丐帮的帮主坐在台下，陈友谅站在他身后。一个穿黄衫的女子走到台前，问那个帮主：“你是谁？”' : '丐帮的人在台下坐了一大片，史红石坐在最前面。'),
      choices: [
        { t: '站出来作证，帮主是假的', cond: (g) => g.f('knowFake') && g.alive('shihuolong') && !g.f('fakeBangzhu'),
          fight: { foes: ['jiabangzhu', 'chenyouliang'], win: { fx: (g) => { g.set('fakeBangzhu'); g.set('cylDown'); g.kill('shihuolong'); g.add('品德', 6); g.add('声望', 20); }, res: '假帮主被你一掌打下了台，陈友谅混在人群里跑了。黄衫女子朝你点了点头。', next: 'sl_tushi_hongshi' },
            lose: { res: '你被打下了台。黄衫女子出手，几招就制住了那个假货。', next: 'sl_tushi_dao' } } },
        { t: '看着', res: '黄衫女子几招就制住了那个帮主。原来真的史火龙早就死了，这个是假的。', next: 'sl_tushi_dao' },
      ] },
    { id: 'sl_tushi_hongshi', t: '打狗棒',
      text: '史红石捧着打狗棒走过来。她还是个小姑娘，手在发抖。“黄衫姐姐说，我还撑不起丐帮。打狗棒，先请你替我收着，等我长大。”',
      choices: [
        { t: '收下，答应她', fx: (g) => { g.give('dagou'); g.add('品德', 2); }, res: '你接过了那根碧绿的竹棒。丐帮的长老们齐齐向你行了个礼。', next: 'sl_tushi_dao' },
        { t: '推辞，这是丐帮的东西', fx: (g) => { g.add('品德', 5); g.add('声望', 10); g.hold('dagou', 'shihongshi'); }, res: '史红石红了眼眶。丐帮的人说，你这个朋友，他们交定了。', next: 'sl_tushi_dao' },
      ] },
    { id: 'sl_tushi_dao', t: '屠龙刀',
      text: (g) => (g.holder('tulong') === 'zhouzhiruo' ? '周芷若打开长匣，里面是屠龙刀。她说：“谁胜了峨嵋，刀就是谁的。”上台的人一个一个被她的爪子抓伤了。' : '台上的人争来争去，屠龙刀却不在场。'),
      choices: [
        { t: '上台，向周掌门讨教', cond: (g) => g.holder('tulong') === 'zhouzhiruo' && !g.has('tulong'),
          fight: { foes: ['zhouzhiruo'], noFlee: true, win: { fx: (g) => { g.give('tulong'); g.add('声望', 30); }, res: '你接住了她最后一爪，一掌把她震下了台。天下英雄看着你，屠龙刀是你的了。', next: 'sl_tushi_end' },
            lose: { mode: 'death', res: '周芷若的白骨爪抓进了你的头顶。屠狮大会上，又多了一个死人。' } } },
        { t: '不争了', res: '你没有上台。', next: 'sl_tushi_end' },
      ] },
    { id: 'sl_tushi_end', t: '散会',
      fx: (g) => { if (g.alive('shihuolong')) g.kill('shihuolong'); if (g.alive('yuanzhen')) g.kill('yuanzhen'); g.set('cylDown'); if (g.holder('dagou') === 'shihuolong') g.hold('dagou', 'shihongshi'); },
      text: (g) => (g.f('chengkunExposed') ? '成昆想逃，被谢逊在地牢前截住。谢逊废了他的武功，然后跪下，拜渡厄为师。' : '后来张无忌揭穿了成昆。谢逊废了他的武功，然后跪下，拜渡厄为师。') + '屠狮大会就这样散了。',
      choices: [
        { t: '去地牢前看谢逊一眼', cond: (g) => g.met('xiexun'), fx: (g) => { g.add('品德', 2); g.set('sawXiexunMonk'); }, res: '谢逊剃了光头，听出了你的脚步声。“是你啊。好，好。”' },
        { t: '下山', res: '你随着人流下了山。' },
      ] },
    { id: 'sl_dahuan_gift', loc: 'shaolin', arrive: true, cond: (g) => g.f('chengkunExposed') && g.after(136, 6) && !g.f('robbedShaolin'), t: '山门',
      text: '你刚到山门，知客僧就迎了出来，说方丈吩咐过，你来了不用通报。',
      choices: [
        { t: '进去喝杯茶', fx: (g) => { g.give('dahuan', 1); g.add('声望', 3); }, res: '你喝了一杯茶，走的时候怀里多了一颗大还丹。' },
        { t: '在山门外拜一拜就走', fx: (g) => g.add('品德', 1), res: '你拜了一拜，没有进去。' },
      ] },

    /* ---------- 武当 ---------- */
    { id: 'wd_daotong', loc: 'wudang', explore: 'wudang', once: false, w: 3, t: '山道',
      text: (g) => g.pick(['一个小道童挑着两桶水上山，脚下一滑，桶滚下了台阶。', '山道边一个小道童蹲着哭，他的木剑掉进了山涧。']),
      choices: [
        { t: '帮他一把', fx: (g) => { g.add('品德', 2); g.add('声望', 1); g.set('wdKind'); }, res: '小道童谢了你，说要去告诉宋师伯。' },
        { t: '看看就走', res: '你接着往上走。' },
      ] },
    { id: 'wd_yu_heiyu', who: 'yudaiyan', act: '给俞三侠用黑玉断续膏', cond: (g) => g.has('heiyu') && !g.f('yuCured'), t: '黑玉断续膏',
      text: '你打开那盒黑玉断续膏，药香满屋。俞岱岩看着那盒药，看了很久，嘴唇在抖。“这……这是西域金刚门的……”',
      choices: [
        { t: '替他敷上', fx: (g) => { g.set('yuCured'); g.add('品德', 10); g.add('声望', 20); }, res: '要先把他长歪的骨头重新折断，再敷药。俞岱岩咬着木头，一声没吭。三个月后，他站了起来。', next: 'wd_yu_after' },
        { t: '药太珍贵，再想想', fx: (g) => g.add('品德', -2), res: '你合上了盒子。俞岱岩闭上了眼睛，什么也没说。' },
      ] },
    { id: 'wd_yu_after', t: '武当山上',
      fx: (g) => g.days(30),
      text: (g) => '武当派上下都来谢你。' + (g.after(135, 2) ? '张三丰拉着你的手，说他这个三弟子，二十年没站起来过了。' : '宋远桥说，等师父出关，一定亲自谢你。'),
      choices: [
        { t: '受了这一拜', fx: (g) => g.add('声望', 5), res: '武当七侠的名字，从此和你连在了一起。' },
        { t: '不敢当', fx: (g) => g.add('品德', 3), res: '宋远桥说，施主不受谢，武当就记在心里。' },
      ] },
    { id: 'wd_zsf_gift', who: 'zhangsanfeng', act: '拜见张真人', cond: (g) => g.after(135, 2) && (g.f('yuCured') || g.f('zhuangWudang')) && !g.has('taiji') && g.holder('taiji') === 'zhangsanfeng' && g.st('品德') >= 60, t: '太极',
      text: '张三丰在松树下打拳，慢得像不动。他打完了，从怀里摸出一卷纸：“老道把这几天想的写下来了。你拿去看，看不懂也不要紧。”',
      choices: [
        { t: '双手接过', fx: (g) => { g.give('taiji'); g.add('品德', 2); }, res: '纸上的字歪歪扭扭，写的是圆。一个圆套着一个圆。' },
        { t: '请真人当面指点', fx: (g) => { g.learn('taiji_quan', 1); g.add('声望', 5); g.hold('taiji', 'zhangsanfeng'); }, res: '张三丰教了你一路太极拳，教完问你记住了几招。你说忘了一半。他笑了：“好。”' },
      ] },
    { id: 'wd_zsf_mer', who: 'zhangsanfeng', act: '请张真人看看经脉', cond: (g) => g.after(135, 2) && g.mer(), once: false, t: '经脉',
      text: '张三丰搭着你的手腕，眯着眼睛听了很久：“走火入魔，伤了经脉。年轻人，急什么。”',
      choices: [
        { t: '请真人出手', fx: (g) => { g.days(10); g.cureMer('张三丰用十天时间，一寸一寸替你把断了的经脉接上了。他说：“练功是一辈子的事。”'); g.add('品德', 1); }, res: '你在武当山上住了十天。下山那天，真气又能走满全身了。' },
        { t: '不敢劳动真人', res: '张三丰笑了笑，放开了你的手。' },
      ] },
    { id: 'wd_siege', t: '武当之围',
      text: (g) => '王府的高手上了武当山，番僧、武士、神箭手，把真武大殿围了个水泄不通。领头的是个穿男装的姑娘。张三丰受了重伤，坐在殿上。' + (g.f('servedWang') ? '她看见你，眨了眨眼。' : ''),
      choices: [
        { t: '守在殿前，和武当弟子一起挡', fight: { foes: ['wfwushi', 'fanseng', 'shenjian'], win: { fx: (g) => { g.set('zhuangWudang'); g.add('品德', 6); g.add('声望', 15); }, res: '你挡住了从侧门冲进来的人。张三丰在殿上看了你一眼。', next: 'wd_siege_taiji' }, lose: { res: '你被番僧一掌打倒在台阶上。', next: 'wd_siege_taiji' } } },
        { t: '跟着王府的人，趁乱摸进后殿', cond: (g) => g.f('servedWang') || g.st('品德') <= 40, fx: (g) => g.add('品德', -10), res: '你绕到了后殿。张三丰闭关的小屋没人守着。', next: 'wd_siege_steal' },
        { t: '躲在山门外看', res: '你什么也看不清。', next: 'wd_siege_taiji' },
      ] },
    { id: 'wd_siege_taiji', t: '太极',
      text: '一个年轻人从山下赶来，替张三丰接下了王府的人。张三丰当着众人的面，一招一招地教他太极拳，又教他太极剑。教一遍，问他忘了多少。',
      choices: [
        { t: '在一旁用心记', check: ['资质', '难'], fx: (g) => { if (g.st('品德') >= 55) g.learn('taiji_quan', 1); else g.add('资质', 1); g.set('sawTaiji'); }, res: (g) => (g.st('品德') >= 55 ? '你记住了一个圆。后来你才知道，那就是太极拳。' : '你记住了招式，却怎么也打不圆。'), great: { fx: (g) => { if (g.st('品德') >= 55) g.learn('taiji_jian', 1); g.add('资质', 1); }, res: (g) => (g.st('品德') >= 55 ? '你记住了拳，也记住了剑。张三丰教完，朝人群里的你看了一眼。' : '你把一招一式都记下来了，可总觉得少了点什么。') }, fail: { res: '招式太慢，你看着看着就看不懂了。' } },
        { t: '去照看受伤的武当弟子', fx: (g) => { g.add('品德', 4); g.set('zhuangWudang'); }, res: '你给几个武当弟子包扎伤口。宋远桥事后说，张真人问起过你。' },
      ] },
    { id: 'wd_siege_steal', t: '后殿',
      text: '小屋里只有一张蒲团、一张桌子。桌上压着一卷纸，墨迹还没干，写满了圆圈。',
      choices: [
        { t: '揣进怀里', fx: (g) => { g.give('taiji'); g.add('品德', -15); }, res: '你从后山溜走了。武当的人后来到处找这卷纸。' },
        { t: '放回去', fx: (g) => g.add('品德', 5), res: '你把纸压好，悄悄退了出去。' },
      ] },

    /* ---------- 蝴蝶谷 ---------- */
    { id: 'hd_grave', loc: 'hudie', act: '去胡青牛的坟前', cond: (g) => !g.f('graveTended') && !g.f('dugGrave'), t: '胡青牛之墓',
      text: (g) => (g.f('jinhuaDug') ? '谷底的两座坟被人挖开了，土翻在一边，木牌倒在草里。坑里只剩两副骨头，陪葬的铁匣不见了。' : '谷底有两座坟，并排着。一块木牌上写着“胡青牛之墓”，另一块写着“王难姑之墓”。坟上长满了草。'),
      choices: [
        { t: (g) => (g.f('jinhuaDug') ? '把土填回去，扶正木牌' : '拔草，上香'), fx: (g) => { g.set('graveTended'); g.add('品德', g.f('jinhuaDug') ? 4 : 3); }, res: (g) => (g.f('jinhuaDug') ? '你填了一下午的土，把两块木牌重新插好。蝴蝶落在新土上，一动不动。' : '你拔了半天草，又找了两块石头压住木牌。风吹过来，满谷的蝴蝶飞了起来。') },
        { t: '挖开坟，看看有没有陪葬', cond: (g) => !g.here('changyuchun') && !g.f('jinhuaDug'), fx: (g) => { g.set('dugGrave'); g.add('品德', -15); g.give('yijing'); g.give('jiedu', 3); },
          res: '坟里只有两副骨头，一只铁匣。铁匣里是两本手写的书，一本医经，一本毒经。毒经你扔了，医经你留下了。' },
        { t: '等守坟的常遇春睡熟了，夜里来挖', cond: (g) => g.here('changyuchun') && !g.f('jinhuaDug'), check: ['轻功', '中'], fx: (g) => { g.set('dugGrave'); g.add('品德', -15); g.give('yijing'); g.give('jiedu', 3); },
          res: '你在月光下挖开了坟，抱着铁匣翻出了山谷。常遇春的鼾声一直没停。铁匣里一本医经，一本毒经。医经你留下了。',
          fail: { fx: (g) => { g.add('品德', -5); g.hurt(40); g.set('cycAngry'); g.like('changyuchun', -40); }, res: '铁锹刚碰到棺木，常遇春的刀背就砸在了你肩上：“胡先生的坟你也敢动！”你连滚带爬地逃出了谷。' } },
        { t: '磕个头就走', fx: (g) => g.add('品德', 1), res: '你磕了一个头。' },
      ] },
    { id: 'hd_hut', loc: 'hudie', explore: 'hudie', once: false, w: 5, cond: (g) => g.f('graveTended') && !g.has('yijing') && !g.holder('yijing'), t: '草屋',
      text: '草屋里的药柜还在，抽屉上贴着字条，一格一格写着药名。墙角有一块地砖是松的。',
      choices: [
        { t: '照着药柜上的字条找', check: ['资质', '中'], fx: (g) => { g.give('yijing'); g.add('品德', 1); },
          res: '字条上的药名连起来，是一句话：“医者，救人。”松动的地砖下面，埋着胡青牛的医经。你在坟前又磕了一个头。',
          great: { fx: (g) => g.give('jiedu', 3), res: '字条上的药名连起来，是一句话：“医者，救人。”地砖下面除了医经，还有一包配好的解毒丹。你在坟前磕了三个头。' }, fail: { res: '你翻了一下午，没看出名堂。' } },
        { t: '不动死人的东西', fx: (g) => g.add('品德', 1), res: '你把门掩上了。' },
      ] },
    /* 黑玉断续膏：万安寺以后在赵敏手里（大势 t_wanan）。她原本就是要拿去给武当的人治伤 */
    { id: 'hd_zm_heiyu', who: 'zhaomin', act: '向赵姑娘讨黑玉断续膏', cond: (g) => g.holder('heiyu') === 'zhaomin' && !g.has('heiyu'), t: '黑玉断续膏',
      text: '赵敏把一只黑盒子在手里转来转去：“阿三那个蠢货的东西。我答应过一个人，拿去给武当的俞三侠、殷六侠接骨。你要它做什么？”',
      choices: [
        { t: '说你正要上武当，替她送去', cond: (g) => !g.f('yuCured') && g.alive('yudaiyan'), need: ['品德', 50], fx: (g) => { g.give('heiyu'); g.add('声望', 3); },
          res: '赵敏看了你半天，把盒子扔给你：“送到了，就说是我给的。少一点，我找你算账。”' },
        { t: '拿两百两银子换', cost: { 银两: 200 }, fx: (g) => { g.give('heiyu'); g.add('品德', -2); }, res: '赵敏掂了掂银子，笑得很开心：“你倒实在。阿三那个蠢货，也就值这个价。”' },
        { t: '告辞', res: '赵敏把盒子收回了袖子里。' },
      ] },
    { id: 'hd_butterfly', loc: 'hudie', explore: 'hudie', once: false, w: 2, t: '蝴蝶',
      text: '蝴蝶落了你一身，有一只停在你的刀尖上，翅膀一开一合。',
      choices: [
        { t: '一动不动，等它飞走', fx: (g) => { g.add('资质', 0.5); g.restMp(40); }, res: '你站了一个时辰。蝴蝶飞走的时候，你觉得心里很静。' },
        { t: '挥刀练几招', fx: (g) => g.add('攻击', 0.5), res: '蝴蝶都被你惊飞了。' },
      ] },
    { id: 'hd_minghui', loc: 'hudie', arrive: true, cond: (g) => g.after(135, 1) && g.before(136, 6), t: '蝴蝶谷大会',
      text: (g) => '谷里搭满了帐篷，到处是明教的人。张教主在这里召集各路义军，说要把蒙古人赶回草原去。' + (g.f('helpedMing') ? '有人认出了你：“光明顶上帮过咱们的那个！”' : ''),
      choices: [
        { t: '帮着搭帐篷、运粮', fx: (g) => { g.days(10); g.add('声望', 5); g.add('品德', 2); g.set('helpedMing'); }, res: '你干了十天活。明教的人说，你这个朋友交得。' },
        { t: '看看就走', res: '你从帐篷中间穿了过去。' },
      ] },
  ]);
})();

/* 群侠 · 江南与东海：临安、灵蛇岛、冰火岛（字段说明见 zhongyuan.js 开头） */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEvents([
    /* ---------- 临安 ---------- */
    { id: 'la_haitu', who: 'laochuanfu', act: '向老船夫打听北海', cond: (g) => !g.has('haitu'), once: false, t: '海图',
      text: '老船夫从怀里摸出一张发黄的羊皮：“年轻时画的。往北走四十天，海上有座冒火的山。这图，我留着也没用了。”',
      choices: [
        { t: '花五十两买下', cost: { 银两: 50 }, fx: (g) => g.give('haitu'), res: '老船夫把图卷好，用油布包了三层。' },
        { t: '帮他出一个月的海', fx: (g) => { g.days(30); g.give('haitu'); g.add('根骨', 1); g.add('品德', 1); }, res: '你跟他打了一个月的鱼，手上又起了一层茧。他把图送给了你。' },
        { t: '先不要', res: '老船夫又低头补网去了。' },
      ] },
    { id: 'la_zhoudian_bet', who: 'zhoudian', act: '跟周颠打赌', cond: (g) => !g.f('zhoudianBet'), once: false, t: '打赌',
      text: '周颠把两坛酒往桌上一放：“比喝酒。你赢了，老周跟你走；你输了，付酒钱。”',
      choices: [
        { t: '喝', check: ['根骨', 22], fx: (g) => { g.set('zhoudianBet'); g.add('声望', 3); }, res: '第二坛喝到一半，周颠先趴下了。他醒来以后说，这是他头一回喝输。', fail: { fx: (g) => { g.add('银两', -Math.min(g.money(), 10)); g.hurt(20); }, res: '你醒来的时候在茶楼的地板上，酒钱已经替你付了，是从你钱袋里拿的。' } },
        { t: '换个赌法：比谁先骂杨逍骂不出新词', check: ['资质', 50], fx: (g) => { g.set('zhoudianBet'); g.add('品德', -1); }, res: '你骂了半个时辰。周颠拍着桌子大笑，说你比他还颠。', fail: { res: '周颠骂了一个时辰还没重样，你认输了。' } },
        { t: '不赌', res: '周颠说你没意思，自己把两坛酒都喝了。' },
      ] },
    { id: 'la_tianying', who: 'yintianzheng', act: '替天鹰教押一趟货', cond: (g) => g.before(134, 3) && !g.f('tianyingFriend'), t: '天鹰教',
      text: '殷天正说，有一船盐要从海上运到明州，路上有元兵的水寨。“你一个外人，元兵不认得，正好走一趟。”',
      choices: [
        { t: '接下', fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.set('tianyingFriend'); g.add('银两', 40); g.add('声望', 6); }, res: '你打退了查船的元兵，盐送到了。殷天正拍了拍你的肩膀，没说什么，银子给足了。' }, lose: { fx: (g) => g.set('tianyingFriend'), res: '你被元兵打下了船，天鹰教的人把你捞了上来。货还是送到了，殷天正说你这个人肯拼命。' } } },
        { t: '不掺和', res: '殷天正点点头，没有再说。' },
      ] },
    { id: 'la_yuewang', loc: 'lintan', explore: 'lintan', once: false, w: 2, t: '岳王庙',
      text: (g) => '西湖边的岳王庙，秦桧夫妇的铁像跪在墓前。' + (g.has('wumu') ? '你怀里揣着武穆遗书，走到墓前，脚步沉了。' : '来上香的人不多，看庙的老头说，元人不让修。'),
      choices: [
        { t: '把武穆遗书供在墓前一夜', cond: (g) => g.has('wumu'), fx: (g) => { g.add('品德', 4); g.add('声望', 4); g.days(1); }, res: '你在墓前守了一夜。天亮的时候，看庙的老头给你端来一碗热粥。' },
        { t: '上一炷香', fx: (g) => g.add('品德', 1), res: '“还我河山”四个字刻在墙上，你看了很久。' },
      ] },
    { id: 'la_pickpocket', loc: 'lintan', explore: 'lintan', once: false, w: 2, t: '集市',
      text: '集市上人挤人。你觉得腰间一轻，一个半大孩子正往人缝里钻。',
      choices: [
        { t: '追上去', check: ['轻功', 25], fx: (g) => g.add('品德', 1), res: '你在巷子里堵住了他。他瘦得像根柴，你把钱拿回来，又给了他一个包子。', fail: { fx: (g) => g.add('银两', -Math.round(g.money() * 0.15)), res: '他钻进巷子就不见了。' } },
        { t: '算了，由他去', fx: (g) => { g.add('银两', -Math.round(g.money() * 0.15)); g.add('品德', 1); }, res: '你摸了摸空了一点的钱袋，想起了自己小时候。' },
      ] },
    { id: 'la_bosi_port', loc: 'lintan', act: '码头上的波斯人', from: [135, 8], to: [136, 6], cond: (g) => g.holder('shenghuo') === 'bosi' && !g.has('shenghuo'), t: '波斯人',
      text: '码头上两个戴高帽的波斯人在等船，腰里各挂一块黑铁牌。他们说中原话很怪，正跟船家吵架。',
      choices: [
        { t: '趁夜动手，抢一块铁牌', fight: { foes: ['bosi1', 'bosi2'], win: { fx: (g) => { g.give('shenghuo'); g.add('品德', -10); }, res: '你抢到了一块圣火令。波斯人的船第二天一早就开走了。' }, lose: { res: '他们的招式怪得很，你没看清就倒下了。' } } },
        { t: '帮他们跟船家说价钱', fx: (g) => { g.add('品德', 3); g.add('银两', 10); }, res: '波斯人谢了你，硬塞给你一块碎金子。' },
      ] },

    /* ---------- 灵蛇岛 ---------- */
    { id: 'ls_yinli', who: 'yinli', act: '问她脸上的伤', cond: (g) => !g.f('yinliFriend'), t: '殷离',
      text: '殷离转过脸来：“看什么？我练的是千蛛万毒手，练成了就是这个样子。好看吗？”',
      choices: [
        { t: '给她一份金创药', cond: (g) => g.has('jinchuang'), fx: (g) => { g.take('jinchuang', 1); g.set('yinliFriend'); g.add('品德', 2); }, res: '她愣了一下，接过去了：“你这人真怪。”' },
        { t: '陪她坐着看海', fx: (g) => { g.days(3); g.set('yinliFriend'); }, res: '你们坐了三天。她说了很多那个咬她手的男孩的事。' },
        { t: '说她不该练这种功夫', fx: (g) => { g.add('品德', 1); g.set('yinliScold'); }, res: '她瞪了你一眼，跳下礁石走了。后来她再见你，就不理了。' },
      ] },
    { id: 'ls_jinhua', loc: 'lingshe', explore: 'lingshe', w: 3, cond: (g) => g.here('jinhua') && !g.f('jinhuaKnown'), t: '月下',
      text: '半夜你睡不着，在岛上走。月光下有个女人在练剑，身段很好，腰一点也不弯。她回过头来，是金花婆婆那张脸。',
      choices: [
        { t: '躲回去，装作没看见', fx: (g) => { g.set('jinhuaKnown'); }, res: '第二天金花婆婆照样咳嗽。她看你的时候，眼神比平常久了一点。' },
        { t: '上前拜见“紫衫龙王”', check: ['资质', 50], fx: (g) => { g.set('jinhuaKnown'); g.set('knowXiaozhaoMother'); g.give('jiedu', 2); },
          res: '她站了很久，笑了：“二十年了，还有人记得这个名字。”她说她有个女儿，在光明顶上。临走给了你两颗解毒丹。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); g.set('jinhuaKnown'); }, res: '一朵金花打在你膝盖上。你跪倒在沙滩上，她已经不见了。' } },
      ] },
    { id: 'ls_snake', loc: 'lingshe', explore: 'lingshe', once: false, w: 2, t: '蛇',
      text: '礁石缝里游出几条花蛇，昂着头。',
      choices: [
        { t: '打', fight: { foes: ['dushe', 'dushe', 'dushe'], win: { fx: (g) => g.add('银两', 6), res: '蛇胆能卖钱，你剖了三个。' }, lose: { res: '你被咬了一口，腿肿了好几天。' } } },
        { t: '慢慢退开', check: ['轻功', 20], res: '蛇没有追。', fail: { fx: (g) => g.hurt(20), res: '退的时候被咬了一口。' } },
      ] },
    { id: 'ls_bosi', t: '波斯三使',
      text: (g) => '三条大船靠了岛，下来三个戴高帽的波斯人，手里拿着黑铁牌。他们说中原明教背叛了总教，要拿谢逊回去治罪。' + (g.f('xiaozhaoGone') ? '' : '小昭站了出来。她说她是圣女的女儿，愿意跟他们回波斯。'),
      choices: [
        { t: '跟三使动手', fight: { foes: ['bosi1', 'bosi2', 'bosi3'], noFlee: true,
          win: { fx: (g) => { g.give('shenghuo'); g.add('品德', 5); g.add('声望', 20); if (!g.f('xiaozhaoGone')) g.set('xiaozhaoStays'); g.set('xiexunTrust'); }, res: (g) => '三使退回了船上，扔下了一块圣火令。' + (g.f('xiaozhaoStays') ? '小昭不用去波斯了，她看着你，眼泪掉了下来。' : ''), next: 'ls_night' },
          lose: { fx: (g) => g.set('xiaozhaoGone'), res: '他们的阵法你破不了。小昭还是上了船。', next: 'ls_night' } } },
        { t: '让小昭去', cond: (g) => !g.f('xiaozhaoGone'), fx: (g) => { g.set('xiaozhaoGone'); if (g.f('xiaozhaoTrust')) g.give('shenghuo'); }, res: (g) => '小昭的船走远了。她一直站在船尾。' + (g.f('xiaozhaoTrust') ? '上船前，她把一块圣火令塞进你手里：“留个念想。”' : ''), next: 'ls_night' },
        { t: '袖手旁观', cond: (g) => g.f('xiaozhaoGone'), fx: (g) => g.add('品德', -1), res: '张无忌出手，和三使斗了一场。', next: 'ls_night' },
      ] },
    { id: 'ls_night', t: '那一夜',
      text: (g) => '那一夜岛上很静。你半夜醒来，看见一个人影从谢逊的屋里出来，怀里抱着两样长长的东西。月光照在她脸上，是周芷若。' + (g.has('tulong') && g.has('yitian') ? '她扑了个空，什么也没拿到。' : ''),
      choices: [
        { t: '当场拦下她', cond: (g) => g.holder('tulong') === 'zhouzhiruo' || g.holder('yitian') === 'zhouzhiruo',
          fight: { foes: ['zhouzhiruo'], win: { fx: (g) => { if (g.holder('tulong') === 'zhouzhiruo') g.give('tulong'); if (g.holder('yitian') === 'zhouzhiruo') g.give('yitian'); g.add('声望', 10); }, res: '她丢下东西逃进了夜色里。你抱着刀剑，手还在抖。' },
            lose: { fx: (g) => g.set('knowZhouSecret'), res: '她一爪抓伤了你的肩膀，消失在礁石后面。你记住了她的脸。' } } },
        { t: '记在心里，不出声', fx: (g) => g.set('knowZhouSecret'), res: '你闭上了眼睛。天亮以后，岛上乱成了一团，刀剑都不见了，赵敏被人当成了贼。' },
        { t: '翻个身，接着睡', res: '第二天的事，你一点也不想管。' },
      ] },
    { id: 'ls_xiexun_meet', who: 'xiexun', act: '跟谢逊说话', cond: (g) => g.at('lingshe') && !g.f('xiexunTrust'), t: '金毛狮王',
      text: '谢逊被金花婆婆从冰火岛接了回来。他耳朵很灵，你还没走近就说：“是生人。来做什么？”',
      choices: [
        { t: '说你只是来看看狮王', check: ['品德', 55], fx: (g) => { g.set('xiexunTrust'); g.set('heardChengkun'); }, res: '谢逊笑了一声。他说了很多成昆的事，说那人手指又白又细，笑起来很和气。', fail: { fx: (g) => g.hurt(40), res: '谢逊一声长啸，你耳朵嗡嗡响了一整天。' } },
        { t: '告辞', res: '你没有打扰他。' },
      ] },

    /* ---------- 冰火岛 ---------- */
    { id: 'bh_meet', who: 'xiexun', act: '跟谢逊说话', cond: (g) => g.at('binghuo') && !g.f('xiexunTrust') && !g.f('xiexunAngry'), t: '金毛狮王',
      text: '谢逊的刀横在膝上：“二十年来第一个活人。你是成昆派来的？”',
      choices: [
        { t: '说实话：一个无名小卒，听说书人讲了屠龙刀，就来了', check: ['品德', 50], fx: (g) => { g.set('xiexunTrust'); g.set('heardChengkun'); g.add('品德', 2); },
          res: '谢逊沉默了很久，忽然大笑：“好，好一个傻子。”那天晚上他说了很多成昆的事。成昆的手指又白又细，笑起来很和气。',
          fail: { fx: (g) => { g.hurt(60); g.injure(1); }, res: '谢逊不信。他一声长啸，你耳朵里流出了血，晕了过去。' } },
        { t: '不说话，给他烤一条鱼', fx: (g) => { g.days(5); g.set('xiexunTrust'); }, res: '你烤了五天的鱼。第五天，谢逊开口问你叫什么名字。' },
        { t: '拔刀：屠龙刀我要了', fight: { foes: ['xiexun'], noFlee: true,
          win: { fx: (g) => { g.give('tulong'); g.add('品德', -20); g.set('xiexunAngry'); }, res: '谢逊倒在冰上，喘着粗气。你拿走了刀，他没再出声。你划船离开的时候，听见身后一声长啸。' },
          lose: { mode: 'death', res: '谢逊一拳打在你胸口。冰火岛上，又多了一具冻僵的尸首。' } } },
      ] },
    { id: 'bh_blade', who: 'xiexun', act: '问屠龙刀的秘密', cond: (g) => g.f('xiexunTrust') && g.holder('tulong') === 'xiexun' && g.at('binghuo'), once: false, t: '屠龙刀',
      text: '谢逊摸着刀背：“武林至尊，号令天下。我在这岛上琢磨了二十年，也没琢磨出它有什么秘密。我只想用它杀一个人。”',
      choices: [
        { t: '告诉他成昆在少林做了和尚', cond: (g) => g.f('knowChengkun'), fx: (g) => { g.set('xiexunTold'); g.give('tulong'); g.add('品德', 5); },
          res: '谢逊的手在发抖。过了很久，他把刀推到你面前：“刀你带回中原。等我回去，我自己去找他。”' },
        { t: '答应替他打听成昆的下落', fx: (g) => g.set('xiexunAsk'), res: '谢逊点点头：“你若打听到了，再回来告诉我。”' },
        { t: '告辞', res: '谢逊又坐回了火山脚下。' },
      ] },
    { id: 'bh_bear', loc: 'binghuo', explore: 'binghuo', once: false, w: 2, t: '白熊',
      text: '冰原上一头白熊站了起来，比人高出一头。',
      choices: [
        { t: '打', fight: { foes: [{ id: 'lang', name: '白熊', k: 2.5 }], win: { fx: (g) => { g.add('根骨', 1); g.give('jinchuang', 1); }, res: '你剥了熊皮。熊胆苦得要命，吃下去浑身发热。' }, lose: { res: '你被熊掌拍飞了。等你醒来，熊已经走了。' } } },
        { t: '往火山那边跑', check: ['轻功', 30], res: '熊怕火，没有追过来。', fail: { fx: (g) => g.hurt(50), res: '你被追上了，挨了一掌。' } },
      ] },
    { id: 'bh_volcano', loc: 'binghuo', explore: 'binghuo', w: 3, t: '火山口',
      text: '火山口的热气往上冒，四周的冰化成了水。你坐在冰与火中间。',
      choices: [
        { t: '在冰火之间打坐七天', fx: (g) => { g.days(7); g.add('内力', 3); g.add('根骨', 1); }, res: '一边冷，一边热。七天以后，你的内力粗了一圈。' },
        { t: '太热了，走开', res: '你回到了冰上。' },
      ] },
  ]);
})();

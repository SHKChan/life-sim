/* 群侠 · 西域：昆仑山光明顶（字段说明见 zhongyuan.js 开头） */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEvents([
    { id: 'gm_join', who: 'zhuangzheng', act: '求入明教', cond: (g) => !g.sect && g.before(134, 5), once: false, t: '入教',
      text: '庄铮上下打量你：“明教的人，朝廷要杀，六大派也要杀。你想好了？”',
      choices: [
        { t: '想好了', fx: (g) => { g.setSect('mingjiao'); g.learn('tuna', 1); }, res: '你在圣火前念了教规。庄铮让你跟着锐金旗搬石头，说先练筋骨。' },
        { t: '再想想', res: '庄铮哈哈一笑：“想好了再来。”' },
      ] },
    { id: 'mj_rank3', t: '锐金旗',
      text: '庄铮把一面小旗交给你：“山下来了一伙元兵，要烧咱们的粮道。你带五个兄弟去守。”',
      choices: [
        { t: '守住粮道', fight: { foes: ['yuanbing', 'yuanbing', 'baihu'], win: { fx: (g) => { g.add('声望', 8); g.set('helpedMing'); }, res: '粮道守住了。庄铮当着全旗的面敬了你一碗酒。' }, lose: { fx: (g) => g.add('声望', 2), res: '粮道烧了一半。庄铮说：“人回来就好。”' } } },
        { t: '先派人探清虚实', check: ['资质', '中'], fx: (g) => { g.add('声望', 6); g.add('资质', 1); }, res: '你绕到元兵背后放了把火，他们自己乱了。庄铮说你脑子比拳头好使。', fail: { fx: (g) => g.hurt(40), res: '探路的兄弟被发现了，你冲上去救人，挨了一刀。' } },
      ] },
    { id: 'gm_xiaozhao', who: 'xiaozhao', act: '帮她提水', cond: (g) => !g.f('xiaozhaoTrust') && !g.f('xiaozhaoTold'), t: '小昭',
      text: '你帮小昭把水提到后院。她低声说了句谢谢，声音很好听。你看见她扫地的时候，一直在数地上的石砖。',
      choices: [
        { t: '问她在找什么，答应替她保密', fx: (g) => { g.set('xiaozhaoTrust'); g.add('品德', 2); }, res: '她犹豫了很久，小声说：“光明顶下面有一条秘道。我想进去看看。”她让你别告诉别人。' },
        { t: '把她数石砖的事告诉杨逍', fx: (g) => { g.set('xiaozhaoTold'); g.add('品德', -3); g.add('声望', 3); }, res: '杨逍让人把小昭的铁链又加了一道。她再见你的时候，低着头，一句话也不说。' },
        { t: '不多问', res: '你把水桶放下就走了。' },
      ] },
    { id: 'gm_midao', loc: 'guangming', act: '跟小昭进秘道', cond: (g) => g.f('xiaozhaoTrust') && (g.here('xiaozhao') || g.inParty('xiaozhao')) && !g.has('qiankun') && !g.f('midaoDone') && g.holder('qiankun') !== 'zhangwuji', t: '秘道',
      text: '小昭领你从一块松动的石砖钻下去。秘道很长，尽头是一间石室，地上坐着两具骸骨。一具骸骨手里攥着一张羊皮，上面写满了字。',
      choices: [
        { t: '和小昭一起参详，把羊皮带走', fx: (g) => { g.give('qiankun'); g.set('midaoDone'); }, res: '小昭看了一夜，把字一个一个记在心里。“你拿着吧，我记住了就够了。”' },
        { t: '把羊皮留给小昭', fx: (g) => { g.add('品德', 5); g.set('midaoDone'); g.set('xiaozhaoOwe'); }, res: '小昭攥着羊皮，眼睛亮亮的：“我欠你一回。”' },
        { t: '先把两位前辈葬了', fx: (g) => { g.add('品德', 3); g.set('buriedYang'); }, res: '骸骨旁有一封遗书，是阳顶天教主写的。你把他们葬在石室里，羊皮压在了碑下。下回再来取。' },
      ] },
    { id: 'gm_midao2', loc: 'guangming', act: '去石室取羊皮', cond: (g) => g.f('buriedYang') && !g.has('qiankun') && !g.f('midaoDone') && g.holder('qiankun') !== 'zhangwuji', t: '石室',
      text: '你又下了秘道。石碑还在，羊皮压在碑下，好好的。',
      choices: [
        { t: '取出来', fx: (g) => { g.give('qiankun'); g.set('midaoDone'); }, res: '你在碑前磕了一个头，带走了羊皮。' },
        { t: '还是留在这里', fx: (g) => { g.add('品德', 2); g.set('midaoDone'); }, res: '你把石碑扶正，退了出去。这东西不该是你的。' },
      ] },
    { id: 'gm_sneak', loc: 'guangming', act: '夜里撬开圣火殿的地砖', cond: (g) => !(g.f('watchGm') && g.day - g.f('watchGm') < 180) && !g.has('qiankun') && !g.f('midaoDone') && g.before(134, 5) && !g.f('xiaozhaoTrust'), once: false, t: '圣火殿',
      text: '你听人说圣火殿下面有一条秘道，历代教主的武功都藏在里面。半夜，殿里只有一盏长明灯。',
      choices: [
        { t: '撬开地砖钻下去', check: ['轻功', '难'], fx: (g) => { g.give('qiankun'); g.set('midaoDone'); g.add('品德', -12); }, res: '你在秘道尽头的骸骨手里拿到了一张羊皮。出来的时候，天已经亮了，没人发现。',
          fail: { res: '地砖还没撬开，巡夜的教众就到了。', next: 'gm_sneak_caught' } },
        { t: '不动明教的东西', fx: (g) => g.add('品德', 1), res: '你回去睡了。' },
      ] },
    { id: 'gm_sneak_caught', once: false, fx: (g) => g.set('watchGm', g.day), // 被抓过一回，半年内这里戒备森严
      t: '被发现',
      text: '火把一下子亮了一圈。明教的人围住了你，有人喊：“六大派的奸细！”',
      choices: [
        { t: '打出去', fight: { foes: ['mjdizi', 'mjdizi'], win: { fx: (g) => { g.add('品德', -5); if (g.sect === 'mingjiao') g.setSect(''); }, res: '你打翻了两个人，从后山滑了下去。光明顶你是回不去了。' }, lose: { fx: (g) => { if (g.sect === 'mingjiao') g.setSect(''); }, res: '你被扔下了山。醒来时躺在雪地里。' } } },
        { t: '束手就擒', fx: (g) => { g.days(20); g.add('品德', 2); if (g.sect === 'mingjiao') g.setSect(''); }, res: '你被关了二十天。杨逍说你是个蠢贼，不是奸细，放你下了山。' },
      ] },
    { id: 'gm_xuelian', loc: 'guangming', explore: 'guangming', once: false, w: 2, t: '雪线',
      text: '雪线上有一朵白花，长在悬崖的石缝里。',
      choices: [
        { t: '爬上去采', check: ['轻功', '中'], fx: (g) => g.give('xuelian'), res: '你摘到了一朵天山雪莲。', fail: { fx: (g) => g.hurt(40), res: '你滑了下来，摔得不轻。' } },
        { t: '太险了', res: '你看了它一会儿，下山了。' },
      ] },
    { id: 'gm_valley', loc: 'guangming', explore: 'guangming', once: false, w: 4, from: [134, 6], cond: (g) => !g.has('jiuyang') && !g.f('jiuyangLeft'), t: '山谷',
      text: (g) => (g.f('jiuyangHint') ? '你照张教主说的，找到了那道悬崖。崖下有一个山洞，钻过去就是一个与世隔绝的山谷。' : '你在昆仑山里迷了路。一道悬崖下面像是有个山洞，洞那头隐隐有鸟叫。'),
      choices: [
        { t: '钻进山洞', check: ['轻功', '中'], fx: (g) => g.give('jiuyang'), res: '谷里有猿猴，有果树。一块大石下面埋着一个油布包，里面是四卷经书。封面上写着“九阳真经”。',
          great: { fx: (g) => g.add('根骨', 2), res: '谷里的白猿冲你叫了两声，领你走到一块大石前。石头底下埋着四卷经书。你在谷里住了几天，吃了不少奇果，身子轻了很多。' }, fail: { fx: (g) => g.hurt(50), res: '洞太窄，你卡在里面半天，退出来的时候擦掉了一层皮。' } },
        { t: '天快黑了，改天再来', res: '你记下了路，回去了。' },
      ] },
    { id: 'gm_wuji', who: 'zhangwuji', act: '向张教主请教', cond: (g) => g.f('helpedMing') && !g.has('jiuyang') && !g.f('jiuyangHint'), t: '张教主',
      text: '张无忌说，他小时候在昆仑山的一个山谷里待了五年，从一只白猿肚子里取出过一部经书。“我把它埋在谷里了。你帮过明教，想去看看，我告诉你路。”',
      choices: [
        { t: '请他告诉你路', fx: (g) => { g.set('jiuyangHint'); }, res: '他画了一张图，说从光明顶往西，找那道最陡的悬崖。' },
        { t: '谢过他，不必了', fx: (g) => { g.add('品德', 4); g.add('声望', 5); g.set('jiuyangLeft'); }, res: '张无忌笑了：“你这个人，倒跟我一样。”' },
      ] },
    /* 乾坤大挪移心法：光明顶一战后在张无忌手里（大势 t_gmd） */
    { id: 'gm_wuji_qk', who: 'zhangwuji', act: '向张教主借乾坤大挪移心法', cond: (g) => g.holder('qiankun') === 'zhangwuji' && !g.has('qiankun'), minAff: '熟', t: '乾坤大挪移',
      text: '张无忌从怀里取出那张羊皮，摊在桌上：“这是阳教主留下的。我已经背熟了。你要看，得先答应我一件事。”',
      choices: [
        { t: '答应他：只用来护人，不用来争', need: ['品德', 60], fx: (g) => { g.give('qiankun'); g.like('zhangwuji', 5); }, res: '张无忌把羊皮卷好递给你：“内功不到火候别硬练，我当年是碰巧。”' },
        { t: '说你是想看看明教的根底', fx: (g) => g.like('zhangwuji', -8), res: '张无忌把羊皮收了回去，客客气气地请你喝了一杯茶。' },
      ] },
    { id: 'gmd_battle', t: '六大派围攻光明顶',
      fx: (g) => g.set('atGmd'),
      text: (g) => '六大派的人从三面攻上了光明顶。少林的和尚、武当的道士、峨嵋的尼姑，喊杀声一直传到雪线上。明教的人一个一个倒下。' + (g.sect === 'mingjiao' ? '庄铮把你推到身后：“护着圣火！”' : ''),
      choices: [
        { t: '站在明教一边，守住圣火', fight: { foes: ['emdizi', 'qzdaoshi', 'slwuseng'], win: { fx: (g) => { g.set('helpedMing'); g.add('品德', 5); g.add('声望', 10); }, res: '你守住了圣火殿的门。', next: 'gmd_zhuang' }, lose: { res: '你被人一掌打倒在殿前。', next: 'gmd_zhuang' } } },
        { t: '跟着六大派往上冲', cond: (g) => g.sect !== 'mingjiao', fight: { foes: ['mjdizi', 'mjdizi', 'mjdizi'], win: { fx: (g) => { g.add('声望', 10); g.add('品德', -4); }, res: '你冲上了光明顶。地上躺着的人，很多还是孩子。', next: 'gmd_zhuang' }, lose: { res: '你被明教的人打下了台阶。', next: 'gmd_zhuang' } } },
        { t: '躲在石头后面', res: '你躲着，看着。', next: 'gmd_zhuang' },
      ] },
    { id: 'gmd_zhuang', t: '庄铮',
      text: (g) => (g.alive('zhuangzheng') ? '灭绝师太的剑指着庄铮的喉咙。庄铮浑身是血，还在骂。' : '光明顶上到处是血。'),
      choices: [
        { t: '扑上去，替庄铮挡这一剑', cond: (g) => g.alive('zhuangzheng'), check: ['轻功', '难'], fx: (g) => { g.set('savedZhuang'); g.add('品德', 8); g.add('声望', 10); },
          res: '剑擦着你的胳膊过去了。就在这时，一个年轻人从人群里走出来，挡在了庄铮前面。庄铮活了下来。',
          great: { fx: (g) => { g.like('zhuangzheng', 20); g.like('yangxiao', 10); g.add('声望', 5); }, res: '你不光挡下了这一剑，还顺势把剑锋引开了半尺。杨逍在远处看着你，点了点头。庄铮活了下来。' }, fail: { fx: (g) => { g.hurt(80); g.injure(2); g.kill('zhuangzheng'); }, res: '你慢了一步。灭绝的剑先到了，又顺手划了你一剑。' }, next: 'gmd_end' },
        { t: '不敢动', cond: (g) => g.alive('zhuangzheng'), fx: (g) => g.kill('zhuangzheng'), res: '庄铮倒下了。', next: 'gmd_end' },
        { t: '往下看', cond: (g) => !g.alive('zhuangzheng'), res: '你往人群里看。', next: 'gmd_end' },
      ] },
    { id: 'gmd_end', t: '曾阿牛',
      text: '一个衣衫破烂的年轻人站在了六大派面前，说他叫曾阿牛。他一个人接了少林、武当、峨嵋、华山、昆仑、崆峒的高手，一招也没伤人。后来大家才知道，他是张翠山的儿子张无忌。那天晚上，明教拜他做了教主。',
      choices: [
        { t: '挤上前去看看他', fx: (g) => { g.meet('zhangwuji'); g.add('资质', 1); }, res: '他朝你点了点头。你记住了他的招式，一招也没记全。' },
        { t: '趁乱下山', res: '你在夜里下了光明顶。' },
      ] },
  ]);
})();

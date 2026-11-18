/* 群侠 · 江湖大势（铁律：大势不可改）
 * at：[年, 月, 日] 开始；win：持续几天；loc + ev：这段时间你人在这里，就会亲历 ev 这件事。
 * 不在场也照样发生：到了时间就把 news 写进传闻，并执行 away（原著的结局，例如某人照原著死去）。
 * fx：无论在不在场都会执行（例如兵器换了主人）。个人的生死、东西归谁，在场时由你的选择决定。
 * rumor：{ d: 提前几天, t: 风声, cred: 确凿 | 听说 | 谣言 }。到了日子先在传闻里放出来，带着地点，玩家可以提前赶去；在客店打听还能更早知道。 */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addTimeline([
    { id: 't_start', at: [131, 2], news: '传闻：明教教主阳顶天失踪多年，光明顶上为争教主之位，五散人和杨逍又打了一架。' },
    { id: 't_gaibang', at: [133, 1], news: '传闻：丐帮帮主史火龙多年不露面，这一年忽然回到襄阳分舵，人胖了，话也少了。' },
    { id: 't_liupai', at: [133, 10], news: '传闻：少林、武当、峨嵋、昆仑、崆峒、华山六大派会盟，约定明年夏天西上光明顶，剿灭魔教。' },
    /* 机缘：有的信物有期限，过了期还没到手，就落到对头手里（holder 换人），以后只能去对头那里讨、偷、抢。
     * 先天功残篇：番僧上终南山借经，不在场就被抢进汝阳王府的书库（大都 dd_shuku 夺回）。 */
    { id: 't_fanseng', at: [132, 6], win: 60, loc: 'zhongnan', ev: 'zn_fanseng', cond: (g) => g.holder('xiantian') === 'quanzhen',
      rumor: { d: 40, cred: '听说', t: '风声：大都的番僧说要上终南山，向重阳宫“借”经书。时候大约在 132 年夏天。' },
      away: (g) => { if (g.holder('xiantian') === 'quanzhen') { g.hold('xiantian', 'wangfu'); g.set('xiantianLost'); } },
      news: (g) => (g.f('xiantianLost') ? '番僧从重阳宫抢走了先天功残篇，装箱送进了大都汝阳王府的书库。' : '') },
    /* 胡青牛医经：金花婆婆来蝴蝶谷挖坟找医书（灵蛇岛 ls_yijing 讨回） */
    { id: 't_hudie_grave', at: [133, 4], loc: 'hudie',
      rumor: { d: 45, cred: '听说', t: '风声：一个拄拐杖的白发婆婆在淮北一带打听胡青牛的坟，听说她和胡青牛夫妇有旧仇。' },
      away: (g) => { if (!g.has('yijing') && !g.f('dugGrave') && !g.holder('yijing')) { g.hold('yijing', 'jinhua'); g.set('jinhuaDug'); } },
      news: (g) => (g.f('jinhuaDug') ? '蝴蝶谷胡青牛夫妇的坟被人挖开了。有人看见一个白发婆婆从谷里出来，怀里抱着一只铁匣，往东海去了。' : '') },
    /* 一阳指谱：恶霸拿着元人的文书收走天龙寺的田和经房（大都 dd_shuku 夺回） */
    { id: 't_dali', at: [133, 10], loc: 'dali',
      rumor: { d: 60, cred: '听说', t: '风声：大理的恶霸拿着元人的文书，十月就要收走天龙寺的田产和经房。寺里的老和尚拦不住。' },
      away: (g) => { if (!g.f('tianlongHelped') && g.holder('yiyang') === 'tianlong') { g.hold('yiyang', 'wangfu'); g.set('tianlongLost'); } },
      news: (g) => (g.f('tianlongLost') ? '大理天龙寺的田被恶霸占了。经房里的书让元人的官差装了箱，说是汝阳王府要的，一路送去了大都。' : '') },
    { id: 't_gmd', at: [134, 5, 1], win: 29, loc: 'guangming', ev: 'gmd_battle',
      rumor: { d: 60, t: '风声：六大派的人马已经过了玉门关，五月初就要攻上昆仑山光明顶。想去的，要赶在五月前上山。' },
      // 乾坤大挪移心法：光明顶一战，张无忌在秘道里练成了它（之后找张无忌 gm_wuji_qk 借）
      fx: (g) => { if (!g.has('qiankun') && !g.f('midaoDone') && !g.holder('qiankun')) g.hold('qiankun', 'zhangwuji'); },
      away: (g) => { if (g.alive('zhuangzheng')) g.kill('zhuangzheng'); },
      news: (g) => '六大派围攻光明顶。一个叫曾阿牛的年轻人以一人之力连败六派高手，原来他是张翠山之子张无忌。明教拜他为教主。锐金旗掌旗使庄铮死在灭绝师太剑下。'
        + (g.holder('qiankun') === 'zhangwuji' ? '听说他是在光明顶的秘道里练成的乾坤大挪移。' : '') },
    { id: 't_capture', at: [134, 7], fx: (g) => { if (g.holder('yitian') === 'miejue') g.hold('yitian', 'zhaomin'); },
      news: '六大派从西域回来的路上中了十香软筋散，掌门和高手都被押往大都。灭绝师太的倚天剑落进了汝阳王府郡主的手里。' },
    { id: 't_lvliu', at: [134, 9], news: '张无忌在绿柳山庄见到了汝阳王府的郡主赵敏，中了她的圈套，又从地牢里逃了出来。' },
    { id: 't_wudang', at: [135, 2, 1], win: 24, loc: 'wudang', ev: 'wd_siege',
      rumor: { d: 30, t: '风声：汝阳王府的番僧和武士往南去了，说是要上武当山，找张三丰算账。时候在 135 年二月。' },
      news: '王府的高手围攻武当山。张三丰重伤之下，当场创出太极拳、太极剑。一个叫曾阿牛的年轻人替武当挡下了这一劫。' },
    { id: 't_wanan', at: [135, 3, 10], win: 30, loc: 'dadu', ev: 'dd_wanan',
      rumor: { d: 30, t: '风声：六大派的人被关在大都万安寺的塔里，每天有人被斩断一根手指。明教的人说三月里要动手救人。' },
      // 黑玉断续膏：万安寺之后到了赵敏手里，她要拿去给武当的人治伤（之后找赵敏 hd_zm_heiyu 讨）
      fx: (g) => { if (g.holder('heiyu') === 'asan') g.hold('heiyu', 'zhaomin'); },
      away: (g) => { if (g.alive('miejue')) g.kill('miejue'); },
      news: (g) => '明教群雄火烧大都万安寺，救出了六大派。' + (g.alive('miejue') || g.f('miejueLives') ? '' : '灭绝师太不肯受魔教的恩，从塔顶跳了下去。临死前把峨嵋掌门之位传给了周芷若。')
        + (g.holder('heiyu') === 'zhaomin' ? '金刚门阿三的黑玉断续膏，听说落进了赵郡主的手里。' : '') },
    { id: 't_lingshe', at: [135, 6, 1], win: 44, loc: 'lingshe', ev: 'ls_bosi',
      rumor: { d: 45, t: '风声：金花婆婆把金毛狮王从北海接回了东海灵蛇岛，张无忌和赵敏也坐船去了。六月前后岛上要出大事。' },
      fx: (g) => { if (g.holder('tulong') === 'xiexun') g.hold('tulong', 'zhouzhiruo'); if (g.holder('yitian') === 'zhaomin') g.hold('yitian', 'zhouzhiruo'); },
      away: (g) => { if (!g.f('xiaozhaoStays')) g.set('xiaozhaoGone'); },
      news: '灵蛇岛上来了波斯明教的三位使者。小昭为了救众人，随船西去，做了波斯明教的教主。倚天剑和屠龙刀在岛上一夜之间同时失踪。' },
    { id: 't_xiexun', at: [135, 9], news: '谢逊在海边被丐帮的人擒住，押进了少林后山。听说少林要开“屠狮英雄会”，天下英雄都可以来争屠龙刀、杀金毛狮王。' },
    { id: 't_haozhou', at: [136, 2], news: '张无忌在濠州与周芷若成亲。拜堂的时候赵敏闯了进来，张无忌跟她走了。' },
    { id: 't_zhu', at: [136, 3], news: '朱元璋在濠州起兵，常遇春投在他帐下。' },
    { id: 't_tushi', at: [136, 5, 1], win: 29, loc: 'shaolin', ev: 'sl_tushi',
      rumor: { d: 60, t: '风声：少林的屠狮英雄会定在 136 年五月，天下英雄都可以上嵩山，争屠龙刀、杀金毛狮王。' },
      fx: (g) => { if (g.holder('dagou') === 'shihuolong') g.hold('dagou', 'shihongshi'); },
      away: (g) => { if (g.alive('shihuolong')) g.kill('shihuolong'); if (g.alive('yuanzhen')) g.kill('yuanzhen'); if (g.alive('chenyouliang')) g.set('cylDown'); },
      news: '少林屠狮英雄会。黄衫女子当众揭穿丐帮的假帮主，扶史红石做了帮主。圆真原来就是成昆，谢逊当着天下英雄废了他的武功，自己在少林出家。' },
    { id: 't_rise', at: [137, 3], news: '明教义军在各地起兵，元朝的江山一天比一天不稳。' },
    { id: 't_wuji', at: [138, 3], news: '张无忌让出明教教主之位，和赵敏去了远方。听说他答应过替她画一辈子眉。' },
  ]);
})();

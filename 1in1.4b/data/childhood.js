/* 十四亿分之一 · 童年：0–17 岁
 * 出生头几年、留守、幼儿园、小学（城乡差别、撤点并校、AI 辅导、特长班）、初中、中考分流、
 * 高中 / 职高 / 早早打工。为青年部分留下 edu、school、talent、track、hsPath、vocMajor、vocPlan 等状态。
 * 同一个年龄的抉择用 cond 互斥：一个人一年最多碰到一个抉择（16 岁另有人生关口 p15）。
 *
 * 和谁住（economy.js 的 hh）：童年里改变住处的地方都要同步 CN.liveWith / CN.moveOut：
 *   奶奶来城里带孩子（1 岁）又回老家（6 岁），留守儿童跟爸妈进城（9 岁），回老家读书（11、14 岁），
 *   父母离婚爸爸搬走（10 岁），爷爷奶奶都走了、妈妈回来照顾（任何年龄）。
 *
 * 童年内部的记忆键（SPEC 状态表“童年细节”一行）：
 *   nanny      1 岁起谁带你：'gm' 奶奶来同住、'home' 三代同堂或奶奶就在附近、'daycare' 托育班、'mom' 妈妈辞职、'maid' 育儿嫂、'shop' 在店里长大
 *   kidPet     5 岁：'kept' 收养了小狗小猫、'fed' 偷偷喂、'no' 没管（老年的 pet 是另一回事）
 *   cityKid    10 岁随迁进城的孩子放学后：'shop' 在小卖部、'class' 托管班、'roam' 满巷子跑
 *   momBack    留守时爷爷奶奶都不在了，回来照顾你的人：'mo' / 'fa'
 *   firstWord kidStyle kindness homework phone bully push river askedMom boarding olympiad xsc deskmate glue 等：见各节点
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const hk = (g) => g.recall('hukou') || 'city';
  const fam = (g) => g.recall('family') || 'white';
  const isMale = (g) => CN.sexOf(g) === '男';
  const rural = (g) => hk(g) === 'rural';
  const left = (g) => !!g.recall('leftBehind');
  // 爸妈此刻不在身边：留守、没进城、也没人回来
  const away = (g) => left(g) && !g.recall('migrated') && !g.recall('momBack');
  const cityName = (g) => g.recall('city') || '市里';
  const home = (g) => g.recall('homeCap') || '老家';
  const notRural = (g) => hk(g) !== 'rural' || !!g.recall('migrated');
  const sibIds = ['sib0', 'sib1'];
  const youngerSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born > CN.NOW);
  const olderSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born < CN.NOW);
  const regionBit = (g, map, dft) => map[g.recall('region')] || dft;
  const north = (g) => ['东北', '华北', '西北'].includes(g.recall('region'));
  // 家里管你的大人怎么称呼
  const parents = (g) => {
    if (g.recall('parentsSplit')) return '妈妈';
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? '爸爸' : '妈妈';
    return '爸妈';
  };
  // 留守时带你的人
  const carer = (g) => {
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? '爸爸' : '妈妈';
    if (g.alive('gm')) return '奶奶';
    if (g.alive('gp')) return '爷爷';
    return '家里人';
  };
  // 名字算出来的固定随机数：同一个人每次读到的城市、宠物名都一样
  const hash = (g) => { const n = (JY.byId[g.me] && JY.byId[g.me].name) || ''; let s = 0; for (let i = 0; i < n.length; i++) s += n.charCodeAt(i); return s; };
  // 留守孩子的爸妈在哪座城市打工
  const PCITY = { 华南: ['深圳', '东莞', '佛山', '广州'], 西南: ['东莞', '深圳', '佛山', '宁波'], 华中: ['东莞', '苏州', '深圳', '杭州'], 华东: ['苏州', '宁波', '杭州', '上海'], 华北: ['北京', '天津', '苏州', '青岛'], 东北: ['北京', '天津', '大连', '青岛'], 西北: ['西安', '北京', '苏州', '东莞'] };
  const pcity = (g) => {
    const list = PCITY[g.recall('region')] || ['东莞', '深圳', '苏州', '杭州'];
    return list[hash(g) % list.length];
  };
  const seaCity = (c) => ['深圳', '广州', '宁波', '上海', '天津', '大连', '青岛'].includes(c);
  const petName = (g) => (rural(g) ? ['大黄', '小黑', '旺财', '花花'] : ['团子', '咪咪', '豆豆', '橘子'])[hash(g) % 4];
  const petKind = (g) => (rural(g) ? '狗' : '猫');
  // 在学校里的场景
  const atSchool = (g, what) => g.move('school', what);
  // 随迁的孩子回老家读书：爸妈留在城里，和还在世的爷爷奶奶住；爷爷奶奶都不在了，就有一个大人跟着回来
  const returnHome = (g) => {
    g.remember('migrated', false);
    g.remember('workCity', '');
    g.remember('tier', rural(g) ? 5 : hk(g) === 'county' ? 4 : (g.recall('cityTier') || 3));
    CN.goHome(g);
    g.info('住处', home(g));
    const gs = ['gp', 'gm'].filter((id) => g.alive(id));
    if (gs.length) {
      CN.moveOut(g, ['fa', 'mo']);
      CN.liveWith(g, gs);
      g.remember('leftBehind', true);
    } else {
      const id = g.alive('mo') ? 'mo' : 'fa';
      CN.moveOut(g, ['fa', 'mo'].filter((x) => x !== id));
      g.remember('momBack', id);
    }
  };

  JY.addFlags({
    childSavedKid: '十岁那年，从河里拉上来一个落水的孩子',
  });

  // 留守的孩子，爷爷奶奶都不在了：爸妈得有一个人回来。每个年龄放一个自动节点，排在这一年所有节点前面
  const momBackNode = (age) => ({
    id: 'c_mom_back_' + age, age, t: '回来了', auto: true,
    cond: (g) => away(g) && !!JY.byId.gp && !g.alive('gp') && !g.alive('gm') && (g.alive('mo') || g.alive('fa')),
    fx: (g) => {
      const id = g.alive('mo') ? 'mo' : 'fa';
      g.remember('momBack', id);
      CN.liveWith(g, [id]);
      CN.goHome(g);
      g.stat('心情', 3);
    },
    text: (g) => {
      const id = g.recall('momBack'), he = id === 'fa' ? '他' : '她';
      return '爷爷奶奶都不在了，家里不能没有大人。' + CN.who(g, id, true) + '辞了外地的工作，回来了。' + he + '在' + (rural(g) ? '镇上' : '县城') + '找了份活，挣的钱少了一半，可每天晚上都能和你一起吃饭。';
    },
  });
  JY.addLifeNodes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(momBackNode));

  JY.addLifeNodes([
    /* ================= 0–5 岁：大多是自动节点 ================= */
    { id: 'c_born', age: 0, t: '满月', auto: true,
      text: (g) => {
        if (left(g)) return '奶奶用一条旧背带把你绑在背上，喂鸡、做饭都背着。妈妈每天晚上打来视频，屏幕一亮，你就不哭了。';
        if (fam(g) === 'rich') return '妈妈在月子中心住了一个月。护士给你拍嗝的手法，比爸妈熟练得多。';
        return regionBit(g, {
          东北: '妈妈坐月子，屋里暖气烧得足。奶奶天天熬小米粥，熬得满屋都是米香。',
          华南: '满月那天，家里煮了一大锅猪脚姜，分给左邻右舍。你被抱出来转了一圈，一直在睡。',
          西南: '满月那天，家里摆了几桌酒。外婆从乡下赶来，给你戴上一只小银镯。',
          西北: '满月那天，奶奶蒸了一笼花馍，捏成老虎的样子，说是给你压惊。',
          华东: '满月那天，家里人凑在一起给你剃了胎发，说要留着做一支毛笔。',
        }, '满月那天，家里摆了几桌酒。亲戚们轮流抱你，你一直在睡，谁也没吵醒你。');
      } },
    { id: 'c_nights', age: 0, t: '夜里', auto: true,
      cond: (g) => !left(g),
      text: (g) => (fam(g) === 'rich' ? '夜里有育儿嫂守着。妈妈还是常常醒过来，站在小床边看你。' : '头半年，夜里每两三个小时就得喂一次奶。爸爸学会了单手冲奶粉，另一只手还抱着你。') },
    { id: 'c_nanny', age: 1, t: '谁带你', auto: true,
      cond: (g) => !left(g),
      fx: (g) => {
        const f = fam(g);
        let n;
        if (f === 'rich') n = 'maid';
        else if (f === 'smallbiz') n = 'shop';
        else if (CN.livesWith(g, 'gm') || rural(g)) n = 'home';
        else { const r = g.rnd(); n = r < 0.5 && g.alive('gm') ? 'gm' : r < 0.8 ? 'daycare' : 'mom'; }
        g.remember('nanny', n);
        if (n === 'gm') CN.liveWith(g, ['gm']);
      },
      text: (g) => ({
        maid: '家里请了一位育儿嫂，说话带着老家口音。她抱你的姿势，比爸妈都稳。',
        shop: '爸妈的店离不开人。你的小床就摆在柜台后面，来买东西的人，顺手逗你两下。',
        home: rural(g) ? '爸妈下地的时候，就把你交给奶奶。奶奶一边择菜，一边用脚晃着你的摇篮。' : '家里三代人住在一起。爸妈白天上班，你归奶奶管。',
        gm: '妈妈的产假休完了。奶奶从老家坐了一夜的车过来，说要帮着带到你上小学。' + (g.alive('gp') ? '爷爷一个人留在老家，每天晚上打视频来看你。' : ''),
        daycare: '妈妈回去上班了。你被送进了小区里的托育班，早上八点送，晚上六点接。',
        mom: '妈妈算了算请人带孩子的钱，辞了工作，在家带你。',
      }[g.recall('nanny')]) },
    { id: 'c_first_year', age: 1, t: '一岁', auto: true,
      text: (g) => {
        if (left(g)) return '你会走路了。第一步是扶着奶奶的裤腿迈出去的。奶奶录了视频发过去，视频那头，妈妈哭了。';
        if (g.recall('nanny') === 'maid') return '你会走路了。家里的育儿嫂比爸妈先看见你迈出第一步，赶紧掏出手机补拍了一遍。';
        if (g.recall('nanny') === 'gm') return '你会走路了。第一步是朝着奶奶走过去的。奶奶高兴得在电话里跟爷爷说了半个钟头。';
        if (rural(g)) return '你会走路了。你摇摇晃晃地朝院子里的鸡走过去，鸡还没跑，你先一屁股坐在了地上。';
        return '你会走路了。爸妈把你第一步的视频发到了家族群里，亲戚们回了一排大拇指。';
      } },
    { id: 'c_first_word', age: 2, t: '第一句话', auto: true,
      fx: (g) => {
        const w = left(g) || g.recall('nanny') === 'gm' ? '奶奶' : g.recall('nanny') === 'mom' ? '妈妈' : g.rnd() < 0.5 ? '妈妈' : '爸爸';
        g.remember('firstWord', w);
      },
      text: (g) => '你说的第一个词是“' + g.recall('firstWord') + '”。'
        + (left(g) ? '爸妈在电话里听见了，半天没说话。后来妈妈说，听你叫奶奶，她也高兴。'
          : g.recall('firstWord') === '奶奶' ? '奶奶当天就打电话告诉了老家所有的亲戚。' : '家里人高兴了一整天。') },
    { id: 'c_spoon', age: 2, t: '自己吃饭', auto: true,
      text: (g) => (north(g) ? '你学着自己拿勺子喝小米粥，喝一半洒一半，' : '你学着自己拿勺子吃米糊，吃一半糊一半，') + (left(g) || g.recall('nanny') === 'gm' || g.recall('nanny') === 'home' ? '奶奶在旁边拿着毛巾，也不催你。' : '爸妈在旁边举着手机拍，谁也不肯帮你。') },
    { id: 'c_fever', age: 2, t: '发烧', auto: true,
      fx: (g) => { const bad = g.s('健康') < 50 || g.rnd() < 0.25; g.remember('fever', bad); g.stat('健康', bad ? -4 : 1); },
      text: (g) => g.recall('fever')
        ? (rural(g) ? '你半夜烧到三十九度八。爷爷骑着电动车，把你裹在怀里送到镇卫生院。天亮时烧退了，你在爷爷怀里睡着了。' : '你烧了三天，在儿童医院的走廊里打了三天点滴。出院那天，护士阿姨送了你一张小贴纸。')
        : '入冬时你发了一场小烧，喝了几天药就好了。' },
    { id: 'c_kinder', age: 3, t: '幼儿园', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        if (h === 'rural') { g.remember('kinder', left(g) ? 'none' : 'town'); g.move(g.recall('homeLoc'), home(g)); }
        else g.remember('kinder', f === 'rich' ? 'bilingual' : f === 'civil' ? 'public' : 'private');
        if (g.recall('kinder') === 'none') g.stat('学识', -2); else g.stat('人缘', 2);
      },
      text: (g) => ({
        bilingual: '你上了一家双语幼儿园，老师说英语，午饭有水果拼盘。第一天你没哭。',
        public: '你抽中了公办幼儿园的名额。爸妈说运气好，开学前一晚把你的小被子叠了三遍。',
        private: '你上了小区门口的民办幼儿园。头一个星期，你每天早上都扒着门不肯进去，第二个星期就不回头了。',
        town: '你每天坐三轮车去镇上的幼儿园。车上挤着七八个孩子，像一筐萝卜。',
        none: '村里的幼儿园两年前就关了。你跟着' + carer(g) + '在家，' + carer(g) + '教你数鸡蛋，数到十就奖励你一颗。',
      }[g.recall('kinder')]) },
    { id: 'c_first_taste', age: 3, t: '尝一口', auto: true,
      text: (g) => '三岁那年，你第一次尝了大人碗里的' + regionBit(g, {
        东北: '锅包肉。酸酸甜甜的，你一口气吃了三块。',
        华北: '炸酱面。酱是咸的，你吃得满嘴黑，还要第二口。',
        西北: '臊子面，大人给你挑了不辣的那一小碗。你连汤都喝了。',
        华东: '小馄饨。皮薄得透光，你一个一个数着吃。',
        华中: '热干面。芝麻酱糊了一嘴，你还是说好吃。',
        华南: '虾饺。你咬了一口，烫得直哈气，又伸手要了一个。',
        西南: '抄手，红油给你撇掉了。你还是被辣得眼泪汪汪，又不肯放下勺子。',
      }, '饺子。你一口咬下去，汤烫了舌头，又伸手要了一个。') },
    { id: 'c_newyear', age: 5, t: '过年', auto: true,
      fx: (g) => { g.stat('心情', 3); if (left(g)) g.stat('人缘', 2); },
      text: (g) => {
        const food = regionBit(g, { 东北: '饺子和冻梨', 华北: '饺子', 西北: '油饼和臊子面', 华东: '年糕和八宝饭', 华中: '腊鱼和糍粑', 华南: '盆菜和煎堆', 西南: '腊肉和汤圆' }, '饺子');
        if (away(g)) return '腊月二十八，爸妈拖着两个大箱子回来了。你躲在' + carer(g) + '身后，不敢叫人。那年过年吃的是' + food + '。初六他们又走了，妈妈给你留了一件新棉袄，你穿到了开春。';
        if (rural(g)) return '这一年过年，桌上有' + food + '。你跟着大孩子放小鞭炮，捂着耳朵跑得比谁都快。';
        return '这一年过年，桌上有' + food + '。你收了一堆红包，全被妈妈“替你存着”了。';
      } },

    /* ---------- 4 岁：小时候的样子 ---------- */
    { id: 'c_ai_story', age: 4, t: '讲故事的小盒子',
      cond: (g) => !rural(g),
      text: (g) => (away(g) ? '爸妈从外地寄回来一个会说话的小盒子。它会讲故事、会唱歌，奶奶听不懂的“为什么”，它都答得上来。' : '家里来了一个会说话的小盒子。它会讲故事、会唱歌，还会回答你所有的“为什么”。' + (fam(g) === 'smallbiz' ? '爸妈守着店，天黑才回家。' : '爸妈下班很晚。')),
      choices: [
        { t: '天天让它讲故事', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'ai'); }, res: '你知道了恐龙、星星和海底。它从来不嫌你烦。' },
        { t: '非要等爸妈回来讲', dev: 15, cond: (g) => !away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: '你常常等着等着就睡着了。偶尔等到了，那是一天里最好的时候。' },
        { t: '只听妈妈在视频里讲', dev: 15, cond: (g) => away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: '妈妈下了夜班，躺在宿舍的床上给你讲。讲着讲着，有时候是她先睡着。' },
        { t: '把它拆开，看里面谁在说话', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', -1); g.remember('kidStyle', 'tinker'); }, res: '里面没有人，只有一块绿色的板子。你挨了一顿骂，也记住了那块板子的样子。' },
      ] },
    { id: 'c_village_kid', age: 4, t: '村口',
      cond: (g) => rural(g),
      text: (g) => (away(g) ? carer(g) + '下地的时候，' : '大人们忙的时候，') + '你在村口待着。一条土路通到外面，偶尔有车开过去。',
      choices: [
        { t: '跟着下地', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('kidStyle', 'field'); }, res: '你学会了分辨麦苗和韭菜，晒得像个泥娃娃。' },
        { t: '蹲在路边数过去的车', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'road'); }, res: '你数到了一百。你想知道路的那头是什么地方。' },
        { t: '跟一群大孩子去后山', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('kidStyle', 'gang'); }, res: '你摔破了膝盖，也有了第一帮跟着混的哥哥姐姐。' },
      ] },

    /* ---------- 5 岁：小狗小猫 ---------- */
    { id: 'c_pet', age: 5, t: '小东西',
      text: (g) => (rural(g) ? '村口来了一条小土狗，瘦得肋骨一根根看得见。它跟着你走了一路，你停它也停。' : '小区的花坛里有一只小野猫，叫声细细的。你蹲下来，它没跑。'),
      choices: [
        { t: '每天偷偷留一口吃的给它', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('kidPet', 'fed'); }, res: '你把鸡蛋黄省下来，用纸包着带出门。它每天在老地方等你。' },
        { t: '抱回家，求大人留下它', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('kidPet', 'kept'); }, res: (g) => '大人嘴上嫌麻烦，还是给它找了个纸箱当窝。你给它取名叫' + petName(g) + '。' },
        { t: '不敢碰，跑回了家', dev: 10, fx: (g) => { g.stat('心情', -1); g.remember('kidPet', 'no'); }, res: '第二天你再去看，它不在那儿了。你在那里站了一会儿。' },
      ] },
    { id: 'c_name_lesson', age: 5, t: '写名字', auto: true,
      cond: (g) => g.recall('kinder') === 'none',
      fx: (g) => g.stat('学识', 2),
      text: (g) => carer(g) + '拆了一个烟盒，在背面一笔一画写下你的名字，让你照着描。你描了一个下午，' + carer(g) + '把那张纸压在了玻璃板底下。' },

    /* ================= 6 岁：上小学 ================= */
    { id: 'c_school_assign', age: 6, t: '上小学', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        let s;
        if (h === 'rural') s = 'weak';
        else if (f === 'rich' || f === 'civil') s = g.rnd() < 0.6 ? 'key' : 'normal';
        else if (h === 'city') s = g.rnd() < 0.25 ? 'key' : 'normal';
        else s = g.rnd() < 0.15 ? 'key' : 'normal';
        g.remember('school', s);
        CN.setEdu(g, 'primary', '小学在读');
        atSchool(g, h === 'rural' ? '镇中心小学' : h === 'county' ? '县实验小学' : cityName(g) + '的小学');
      },
      text: (g) => {
        const s = g.recall('school');
        if (rural(g)) return '村小在你上学前一年撤了，全村的孩子都并到了镇中心小学。开学那天，操场上的孩子比你见过的都多。';
        if (s === 'key') return fam(g) === 'rich' ? '你进了一所好小学。开学那天，校门口停满了车，爸爸把你送到教室门口才走。' : '你进了一所好小学。为了这个学位，爸妈几年前就买了学校旁边的老房子。';
        if (hk(g) === 'county') return '你背上新书包，进了县实验小学。校门口卖烤肠的摊子，从你开学那天起就成了你的心事。';
        return '你背上新书包，进了离家最近的小学。书包比你还宽。';
      } },
    { id: 'c_nanny_end', age: 6, t: '上学以后', auto: true,
      cond: (g) => ['gm', 'mom'].includes(g.recall('nanny')) && (g.recall('nanny') === 'mom' || CN.livesWith(g, 'gm')),
      fx: (g) => { if (g.recall('nanny') === 'gm' && g.alive('gp')) CN.moveOut(g, ['gm']); },
      text: (g) => {
        if (g.recall('nanny') === 'mom') return '你上了小学，妈妈重新出去找了份工作。她说在家待了五年，第一天上班，连会议室在哪儿都要问人。';
        if (g.alive('gp')) return '你上了小学，奶奶说她的任务完成了，要回老家陪爷爷。走那天，她给你缝了一个装零钱的小布包，说放假就回去看她。';
        return '你上了小学。奶奶本来说要回老家，可爷爷不在了，她就留了下来，每天站在校门口第一排等你放学。';
      } },
    { id: 'c_first_day', age: 6, t: '开学第一天', loc: 'school',
      cond: (g) => !rural(g),
      text: '老师让大家选同桌、选班干部。你旁边坐着一个一直在抠橡皮的孩子。',
      choices: [
        { t: '主动跟同桌说话', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('deskmate', 'friend'); g.rel('发小', CN.pick(['小胖', '豆豆', '乐乐', '果果', '小雨']), '小学同桌'); }, res: '同桌把橡皮掰了一半给你。你们后来一起上了六年学。' },
        { t: '举手要当班长', dev: 20, fx: (g) => { g.stat('事业', 2); g.stat('人缘', -1); g.remember('deskmate', 'leader'); g.info('身份', '班长'); }, res: '老师笑着让你当了。你第一次站在讲台上喊“起立”，声音有点抖。' },
        { t: '一直盯着窗外，看送你的人走了没有', dev: 10, fx: (g) => { g.stat('心情', -2); g.remember('deskmate', 'shy'); },
          res: (g) => (away(g) ? carer(g) : g.recall('nanny') === 'gm' && CN.livesWith(g, 'gm') ? '奶奶' : '妈妈') + '早走了。那一天你一句话也没说。放学时看见校门口那张熟悉的脸，你才哭出来。' },
      ] },
    { id: 'c_boarding', age: 6, t: '寄宿', loc: 'school',
      cond: (g) => rural(g),
      text: '镇上的学校离家十几里。老师说一年级就可以住校，一周回一次家。',
      choices: [
        { t: '住校', canon: true, fx: (g) => { g.stat('心情', -3); g.stat('健康', 1); g.remember('boarding', 'yes'); }, res: '宿舍里睡十二个孩子。头一个月，每天熄灯后都有人哭。生活老师挨个床给你们掖被角，后来哭的人少了。' },
        { t: '每天走读，天不亮就出门', dev: 15, fx: (g) => { g.stat('健康', 3); g.stat('学识', -1); g.remember('boarding', 'walk'); }, res: '你每天来回走两个小时。冬天出门时天上还挂着星星，路上有几个同村的孩子和你一起走。' },
        { t: '奶奶去镇上租房陪读', dev: 20, cond: (g) => away(g) && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'gm'); g.move('county', '镇上的出租屋'); }, res: '奶奶在学校后面租了一间小屋，每天早上给你煮一个鸡蛋。' },
        { t: '妈妈去镇上租房陪读', dev: 20, cond: (g) => !away(g) && g.alive('mo') && !left(g), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'mom'); g.move('county', '镇上的出租屋'); }, res: '妈妈在学校后面租了一间小屋，白天在镇上的超市理货，晚上陪你写作业。' },
      ] },

    /* ================= 7 岁 ================= */
    { id: 'c_video_call', age: 7, t: '视频电话',
      cond: (g) => away(g),
      text: '周六晚上，妈妈打来视频。她问你想要什么。屏幕卡了一下，她的脸停在一个笑上。',
      choices: [
        { t: '说想要一个新书包', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('askedMom', 'bag'); }, res: '过年的时候，书包是她亲手背回来的，上面印着你喜欢的动画片。' },
        { t: '说想要她回来', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('心情', -1); g.remember('askedMom', 'home'); }, res: '那边沉默了很久，然后说，等你再大一点。那年暑假，她请了半个月的假回来陪你。' },
        { t: '什么也不说，把手机递给大人', dev: 15, fx: (g) => { g.stat('心情', -2); g.remember('askedMom', 'silent'); }, res: (g) => carer(g) + '接过去，说孩子挺好的，就是不爱说话。' },
      ] },
    { id: 'c_new_kid', age: 7, t: '转来的同学', loc: 'school',
      cond: (g) => !away(g),
      text: '班上转来一个说话口音很重的同学。下课时，几个人学他说话，全班都笑了。',
      choices: [
        { t: '跟着笑', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('kindness', 'laughed'); }, res: '他低着头，把作业本翻来翻去。你笑完就忘了。' },
        { t: '下课找他一起玩', dev: 20, fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); g.remember('kindness', 'friend'); }, res: '他教你用老家话数数，你教他跳房子。你们成了好朋友。' },
        { t: '告诉老师', dev: 15, fx: (g) => { g.stat('人缘', -1); g.remember('kindness', 'teacher'); }, res: '老师在班会上说了这件事。学他说话的人少了，跟你玩的人也少了几个。' },
      ] },

    /* ================= 8 岁 ================= */
    { id: 'c_ai_homework', age: 8, t: '作业',
      cond: (g) => notRural(g),
      text: (g) => (g.recall('kidStyle') === 'ai' ? '那个陪你长大的小盒子升级了，' : '家里的平板装了学习助手，') + '拍一下题目，答案和步骤就全出来了。',
      choices: [
        { t: '只让它讲思路，自己写', canon: true, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: '你写得慢，但写对的都是你自己会的。' },
        { t: '照着抄，抄完去玩', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('homework', 'copy'); }, res: '作业本上全是红勾。考试的时候，你对着卷子发愣。' },
        { t: '和它比赛，看谁算得快', dev: 25, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.stat('学识', 4); g.stat('心情', 1); g.remember('homework', 'race'); }, res: '你从来没赢过。但你的口算成了全班第一。' },
      ] },
    { id: 'c_farm_busy', age: 8, t: '农忙',
      cond: (g) => rural(g) && !g.recall('migrated'),
      text: (g) => regionBit(g, { 东北: '秋收的时候，玉米堆成了山。', 华北: '麦收那几天，全家人都在地里。', 西北: '收洋芋的时候，地里的人弯着腰一整天。', 西南: '割稻子的时候，梯田里全是人。', 华南: '收甘蔗那几天，家里人天不亮就出门。', 华东: '插秧那几天，水田里一排排都是弯着的腰。', 华中: '收油菜籽那几天，家里人在晒场上忙到天黑。' }, '农忙那几天，家里人都在地里。') + '作业还没写。',
      choices: [
        { t: '下地帮忙', canon: true, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('homework', 'farm'); }, res: '你手上起了泡。晚上就着灯泡写作业，写着写着睡着了，醒来时身上多了一件外套。' },
        { t: '在家写作业', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: (g) => '你一个人在家，把作业写得工工整整。' + (away(g) ? carer(g) : '妈妈') + '回来看了一眼，没说话，给你削了个苹果。' },
        { t: '偷偷溜去河边玩', dev: 20, fx: (g) => { g.stat('心情', 4); g.stat('学识', -1); g.remember('homework', 'river'); }, res: '你在河边捉了一下午的小鱼。回家时裤子是湿的，挨了一顿骂。那几条小鱼，晚上被煎成了一盘菜。' },
      ] },
    { id: 'c_season', age: 8, t: '这一年', auto: true,
      text: (g) => regionBit(g, {
        东北: '冬天，学校把操场浇成了冰场。体育课上，全班在冰上摔成一片，笑声比哨子还响。',
        华北: '冬天来了暖气，教室里热得只穿毛衣。窗玻璃上结着霜花，你用手指在上面画小人。',
        西北: '学校门口的小摊卖酿皮，五块钱一碗。你攒了三天零花钱，吃得满嘴辣子。',
        华东: '梅雨季，教室的墙根长出一圈青苔。你的球鞋一个星期没干过，妈妈用吹风机给你吹了一晚上。',
        华中: '夏天热得像蒸笼。学校装了空调，下课了也没人肯出教室。',
        华南: '台风来了，学校停课两天。你趴在窗边看楼下的树被吹得东倒西歪，心里有点高兴。',
        西南: rural(g) ? '下了一个星期的雨。山路滑，你上学路上摔了一跤，到学校时裤腿全是泥。同桌把自己的干袜子借给了你。' : '雾大得看不见对面的楼。课间，你们在雾里玩捉迷藏，谁也找不着谁。',
      }, '春天，学校组织去郊外踏青。你在草地上打了个滚，衣服绿了一片。') },

    /* ================= 9 岁：特长、随迁 ================= */
    { id: 'c_talent', age: 9, t: '特长班', loc: 'school',
      cond: (g) => !rural(g) && !away(g) && !g.recall('migrated'),
      text: (g) => (fam(g) === 'rich' ? '妈妈拿出一张表，上面有十几个兴趣班。' : '同学们周末都去上兴趣班。' + parents(g) + '商量了几晚，说可以给你报一个。') + '你选什么？',
      choices: [
        { t: '编程', canon: true, fx: (g) => { g.stat('学识', 3); g.stat('财富', -1); g.remember('talent', 'code'); g.info('特长', '编程'); }, res: '你让屏幕上的小猫走了十步。你觉得自己什么都能做出来。' },
        { t: '画画', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('财富', -1); g.remember('talent', 'art'); g.info('特长', '画画'); }, res: '你画的猫被老师贴在了墙上。' },
        { t: '篮球或者游泳', dev: 15, fx: (g) => { g.stat('健康', 4); g.remember('talent', 'sport'); g.info('特长', '体育'); }, res: '你长高了一大截，晒得黑黑的。' },
        { t: '什么都不报，周末想睡觉', dev: 20, fx: (g) => { g.stat('心情', 4); g.remember('talent', 'none'); }, res: '同学们周末都在上课，你在睡觉。你觉得自己赚了。' },
      ] },
    { id: 'c_follow_parents', age: 9, t: '进城',
      cond: (g) => away(g),
      text: (g) => '爸妈在' + pcity(g) + '打工。过年时他们问你：想不想跟去城里读书？那边的学校不好进，房子也小。'
        + (g.recall('askedMom') === 'home' ? '妈妈说，她一直记着你那年在视频里说的话。' : ''),
      choices: [
        { t: '留在老家', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('migrated', false); }, res: (g) => carer(g) + '说你懂事。爸妈初六走的时候，你送到了村口，手里攥着妈妈塞给你的两百块钱。' },
        { t: '跟爸妈去城里', dev: 25, fx: (g) => {
          const c = pcity(g);
          g.remember('migrated', true); g.remember('school', 'weak');
          CN.goCity(g, ['北京', '上海', '广州', '深圳'].includes(c) ? 1 : 2, c);
          g.move('metro', c + ' · 城中村');
          CN.moveOut(g, ['gp', 'gm']); CN.liveWith(g, ['fa', 'mo']);
          g.stat('心情', 3); g.stat('学识', 1);
        }, res: (g) => '你第一次坐了高铁。爸妈在' + g.recall('workCity') + '的城中村租了一间屋，你上了一所专收外地孩子的学校。' + carer(g) + '一个人留在老家，每天晚上打一个电话问你吃了没有。' },
      ] },
    { id: 'c_teacher_volunteer', age: 9, t: '支教老师', loc: 'school',
      cond: (g) => rural(g) && !away(g) && !g.recall('migrated'),
      text: '学校来了一个从大城市来支教的年轻老师。她会画画，会弹琴，还会讲外面的事。',
      choices: [
        { t: '上课认真听，下课就回家', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('talent', 'none'); }, res: '一年后她走了。走之前给每个人发了一支铅笔，铅笔上刻着每个人的名字。' },
        { t: '天天缠着她学画', dev: 20, fx: (g) => { g.stat('心情', 3); g.remember('talent', 'art'); g.info('特长', '画画'); g.rel('恩师', '支教的林老师'); }, res: '她走的时候送了你一盒水彩。你用了很多年，舍不得用完。' },
        { t: '问她外面的城市是什么样的', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('talent', 'dream'); }, res: '她给你看了很多照片。那天晚上，你梦见自己站在一栋很高的楼上。' },
      ] },

    /* ================= 10 岁 ================= */
    { id: 'c_parents_fight', age: 10, t: '吵架',
      cond: (g) => ['worker', 'smallbiz', 'white'].includes(fam(g)) && !left(g),
      text: (g) => ({ smallbiz: '那一年店里生意不好，', worker: '那一年厂里减了班，', white: '那一年爸爸的公司裁了一批人，' }[fam(g)] || '那一年家里不顺，') + '爸妈常常半夜吵架。有一天，妈妈问你：要是我们分开，你跟谁？',
      choices: [
        { t: '捂着耳朵说“我不知道”', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('parentsSplit', false); }, res: '他们没再问。后来也没分开。有天你放学回家，看见爸爸系着围裙在厨房里炒菜，妈妈在旁边指挥。' },
        { t: '哭着让他们别分开', dev: 15, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -2); g.remember('parentsSplit', false); g.remember('glue', true); }, res: '爸爸蹲下来抱了你很久。那天以后，吵架的声音小了。' },
        { t: '说“分开吧，你们都别哭了”', dev: 30, fx: (g) => {
          g.stat('心情', -4); g.stat('学识', 2); g.remember('parentsSplit', true);
          g.info('家庭', '父母离异'); g.unrel('父亲'); g.rel('父亲', 'fa', '不和你们住了');
          CN.moveOut(g, ['fa', 'gp', 'gm']);
        }, res: '那年冬天，他们离了婚。爸爸搬了出去，你跟妈妈住，每个月见一次爸爸。你一下子长大了好几岁。' },
      ] },
    { id: 'c_olympiad', age: 10, t: '奥数班', loc: 'school',
      cond: (g) => ['civil', 'rich'].includes(fam(g)) && !left(g),
      text: '老师说你脑子快，建议去上奥数班。周末要上两天课。',
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('学识', 4); g.stat('心情', -3); g.remember('olympiad', true); }, res: '你的周末没了。你认识了很多和你一样脑子快的孩子，也第一次知道自己不是最快的。' },
        { t: '不去，周末去爷爷家', dev: 20, cond: (g) => g.alive('gp'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: '爷爷教你下象棋。你输了一整个夏天，到秋天终于赢了一盘，爷爷高兴得给你买了一根雪糕。' },
        { t: '不去，周末去奶奶家', dev: 20, cond: (g) => !g.alive('gp') && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: '奶奶教你包饺子。你包的饺子一下锅就散，奶奶全捞到自己碗里吃了。' },
        { t: '不去，周末想自己看书', dev: 20, cond: (g) => !g.alive('gp') && !g.alive('gm'), fx: (g) => { g.stat('学识', 2); g.stat('心情', 3); g.remember('olympiad', false); }, res: '你在图书馆的角落里坐了一整个夏天，看完了一整排的科普书。' },
      ] },
    { id: 'c_river', age: 10, t: '河',
      cond: (g) => ['farmer', 'migrant'].includes(fam(g)) && !g.recall('migrated'),
      text: '暑假，几个孩子约着去河里游泳。大人说过很多遍，河里淹死过人。',
      choices: [
        { t: '不去，在家看电视', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('river', 'no'); }, res: '那天下午，你听见有人在村里喊。后来听说，河里出了事，人救上来了。' },
        { t: '去，就在浅水边玩', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('心情', 3); g.remember('river', 'swim'); }, res: '水很凉。你学会了狗刨，再也没告诉过大人。' },
        { t: '去，看见有个小孩往深水走，赶紧去拉', dev: 30, check: ['健康', 55], fx: (g) => { g.stat('人缘', 6); g.remember('river', 'saved'); g.set('childSavedKid'); }, res: '你把他拖上了岸，自己呛了好几口水。他家里人提着一篮鸡蛋来你家，站了很久。',
          fail: { fx: (g) => { g.stat('健康', -8); g.remember('river', 'nearly'); }, res: '你拉住了他，自己却被冲开。是路过的大人把你们俩都捞了上来。你发了三天烧。', dev: 10 } },
      ] },
    { id: 'c_city_village', age: 10, t: '放学以后',
      cond: (g) => !!g.recall('migrated'),
      text: (g) => '你在' + (g.recall('workCity') || '城里') + '的城中村住了一年。爸爸在工地，妈妈在电子厂，都是天黑了才回来。放学到天黑这几个小时，你得自己安排。',
      choices: [
        { t: '去楼下小卖部写作业', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('cityKid', 'shop'); }, res: '老板娘给你留了一张小桌子。你学会了找零钱，也学会了说几句本地话。' },
        { t: '去社区的免费托管班', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('cityKid', 'class'); }, res: '托管班是几个大学生志愿者办的。一个戴眼镜的姐姐教你做题，说你脑子快。' },
        { t: '和楼里的孩子满巷子跑', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('健康', 1); g.remember('cityKid', 'roam'); }, res: '你们把每条巷子都跑熟了。哪家的狗凶、哪家的烧饼香，你闭着眼都知道。' },
      ] },

    /* ================= 11 岁：小升初 ================= */
    { id: 'c_xiaoshengchu', age: 11, t: '小升初', loc: 'school',
      cond: (g) => notRural(g) && !g.recall('migrated'),
      text: (g) => '要升初中了。' + (hk(g) === 'county' ? '县里最好的初中要考试，' : cityName(g) + '有几所好初中要摇号，有一所私立的要考试，') + '其他的就近入学。',
      choices: [
        { t: '就近入学', canon: true, fx: (g) => { g.remember('school', g.recall('school') === 'key' ? 'key' : 'normal'); g.remember('xsc', 'near'); }, res: '你和小学的一半同学升进了同一所初中。' },
        { t: '去考那所好学校', dev: 15, check: ['学识', 62], fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'exam'); g.stat('心情', 3); }, res: (g) => '你考上了。放榜那天，' + parents(g) + '带你下了一回馆子，点了你最爱吃的菜。',
          fail: { fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'failed'); g.stat('心情', -3); }, res: '差了几分。你哭了一晚上，第二天照常去了家门口的初中。', dev: 5 } },
        { t: '花钱去私立初中', dev: 20, cond: (g) => ['rich', 'civil'].includes(fam(g)), fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'paid'); g.stat('财富', -6); }, res: '学费一年好几万。妈妈说，这钱花得值。' },
      ] },
    { id: 'c_town_middle', age: 11, t: '上初中', loc: 'school',
      cond: (g) => !notRural(g) || g.recall('migrated'),
      text: (g) => g.recall('migrated')
        ? '你在城里没有户口，初中只能读民办的，以后中考也要回老家考。' + ({ shop: '小卖部的老板娘听说你可能要走，塞给你一包糖。', class: '托管班的姐姐说，不管在哪儿读，都要好好念。' }[g.recall('cityKid')] || '')
        : '要上初中了。镇中学就在家门口，县城的初中要考试，考上了要住校。',
      choices: [
        { t: '读镇中学', canon: true, cond: (g) => !g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'near'); }, res: '镇中学的教室还是老样子，窗户漏风。新来的数学老师是本镇人，大学毕业又回来了。' },
        { t: '去考县城的初中', dev: 20, cond: (g) => !g.recall('migrated'), check: ['学识', 55],
          fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'exam'); g.move('county', '县城中学'); g.stat('心情', 2); }, res: '你考上了县城的初中，第一次住进了六个人一间的宿舍。',
          fail: { fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'failed'); }, res: '没考上。你在镇中学读了下去。', dev: 5 } },
        { t: '回老家读初中，以后好考试', canon: true, cond: (g) => !!g.recall('migrated') && (g.alive('gp') || g.alive('gm')),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => '你又回到了' + carer(g) + '身边。城里的同学说会常联系，后来只发了几条消息。' + carer(g) + '把你小时候睡的床又铺好了。' },
        { t: '回老家读初中，家里大人陪你回去', canon: true, cond: (g) => !!g.recall('migrated') && !g.alive('gp') && !g.alive('gm'),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => carer(g) + '辞了城里的活，陪你回了老家。老房子收拾了三天，才又像个家。' },
        { t: '留在城里读民办，到时候再说', dev: 20, cond: (g) => !!g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'stay'); g.stat('心情', 2); }, res: '你留在了城里。只是同学们一个个回了老家，教室越来越空。' },
      ] },

    /* ================= 12 岁：手机 ================= */
    { id: 'c_phone', age: 12, t: '第一部手机',
      text: (g) => (away(g) ? '爸妈寄回来一部旧手机，说这样能天天视频。' : '上初中了，' + parents(g) + '给你买了一部手机。') + '同学们都在刷短视频、打游戏。',
      choices: [
        { t: '刷视频、打游戏，停不下来', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('学识', -3); g.remember('phone', 'game'); }, res: '你的段位越来越高，成绩越来越低。' },
        { t: '用来查资料、看网课', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('phone', 'study'); }, res: '你在网上听了很多好老师的课。你发现世界上有的是比你们老师讲得好的人。' },
        { t: '交给大人保管，周末才拿', dev: 25, fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); g.remember('phone', 'locked'); }, res: (g) => '你把手机交给了' + (away(g) ? carer(g) : parents(g)) + '。同学们聊的梗你都听不懂，可你的作业总是第一个写完。' },
      ] },
    { id: 'c_junior_start', age: 12, t: '初一', auto: true,
      fx: (g) => { CN.setEdu(g, 'primary', '小学'); g.stat('学识', 1); },
      text: (g) => ({ key: '你进了一所好初中。第一次月考，你从小学的前几名掉到了中游。', normal: '你上了初中。课程一下子多了好几门。', weak: '初中的老师换得勤，英语老师一学期换了三个。第三个留了下来，她说要把你们带到毕业。' }[g.recall('school') || 'normal'])
        + (g.recall('xsc') === 'failed' ? '差的那几分，你记了很久。' : '')
        + (g.recall('deskmate') === 'friend' ? '小学的同桌又和你分在了一个班。' : g.recall('deskmate') === 'leader' ? '新班主任看了你的档案，又让你当了班长。' : '') },
    { id: 'c_cook', age: 12, t: '一顿饭', auto: true,
      fx: (g) => g.stat('人缘', 1),
      text: (g) => {
        const who = away(g) ? carer(g) : parents(g);
        return '你第一次自己做了一顿饭：' + (north(g) ? '一锅西红柿鸡蛋面，面煮得有点坨。' : '番茄炒蛋，盐放多了。') + who + '吃得一点不剩，说比外面卖的好吃。';
      } },
    { id: 'c_pet_old', age: 12, t: '它', auto: true,
      cond: (g) => ['kept', 'fed'].includes(g.recall('kidPet')),
      text: (g) => (g.recall('kidPet') === 'kept'
        ? (rural(g) ? petName(g) + '长成了一条大狗，每天傍晚蹲在村口等你放学。你一走近，它的尾巴就把地扫得啪啪响。' : petName(g) + '胖了一大圈，每天晚上挤到你的作业本上睡觉，赶都赶不走。')
        : '你小时候喂过的那只' + petKind(g) + '，后来被一户人家收养了。有一回你在路上遇见它，它看了你一眼，好像还认得。') },

    /* ================= 13 岁 ================= */
    { id: 'c_crush', age: 13, t: '喜欢', loc: 'school',
      cond: (g) => g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak'),
      text: (g) => '你开始注意班上的一个' + (isMale(g) ? '女生' : '男生') + '。传纸条的时候，你的手心全是汗。',
      choices: [
        { t: '什么也不说，好好学习', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('crush', 'hidden'); }, res: '你把那个名字写在草稿纸上，写满了又撕掉。' },
        { t: '写一封信', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('crush', 'told'); }, res: '信被班主任没收了。你们被叫到办公室，出来以后一起笑了很久。' },
        { t: '约着一起考同一所高中', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', 2); g.remember('crush', 'pact'); }, res: '你们拉了钩。每天晚自习，你都多做一张卷子。' },
      ] },
    { id: 'c_bully', age: 13, t: '厕所门口', loc: 'school',
      cond: (g) => !(g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak')),
      text: (g) => '学校里有几个高年级的人，常常在厕所门口堵人要钱。' + (g.recall('kindness') === 'friend' ? '今天被堵的，是当年那个口音很重的同学。' : '今天被堵的，是你们班最瘦的那个。'),
      choices: [
        { t: '绕开走', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('bully', 'away'); }, res: '那天你一直听见身后的声音。' },
        { t: '上去拉人', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 4); g.remember('bully', 'stood'); }, res: '你挨了几下，他们也走了。那个同学把攒了很久的零食都塞给了你。',
          fail: { fx: (g) => { g.stat('健康', -6); g.remember('bully', 'beaten'); }, res: '你被打得鼻子流血。老师来的时候，那几个人早跑了。那个同学一路扶着你去了医务室。', dev: 10 } },
        { t: '跑去叫老师', dev: 15, fx: (g) => { g.stat('人缘', 1); g.remember('bully', 'teacher'); }, res: '老师来了，那几个人被记了处分。后来学校在厕所门口装了一个摄像头，再没人在那儿堵人。' },
      ] },

    /* ================= 14 岁：初三 ================= */
    { id: 'c_back_14', age: 14, t: '回老家', auto: true,
      cond: (g) => !!g.recall('migrated'),
      fx: (g) => { returnHome(g); g.remember('school', 'weak'); },
      text: (g) => '中考要回户籍所在地考。初三开学前，你回到了' + home(g) + '。' + (g.recall('momBack') ? carer(g) + '跟着你回来了，在镇上找了份活。' : '爸妈把你送回' + carer(g) + '身边，又回了城里。')
        + (g.recall('cityKid') === 'roam' ? '你把城中村每条巷子的样子，讲给新同学听。' : '老家的课本和城里的不一样，你花了一个月才跟上。') },
    { id: 'c_grade9', age: 14, t: '初三', loc: 'school',
      text: (g) => '初三了。黑板角上写着离中考还有多少天。' + (g.recall('crush') === 'pact' ? '你想起那个拉过钩的约定。' : '') + (rural(g) ? '班上有几个同学已经不来了，说是出去打工了。' : '老师说，中考一半人上普高，一半人去职高。'),
      choices: [
        { t: '拼了，每天学到半夜', canon: true, fx: (g) => { g.stat('学识', 5); g.stat('健康', -3); g.stat('心情', -2); g.remember('push', 'hard'); }, res: (g) => '你的眼镜度数涨了两百度。成绩也涨了。' + (away(g) ? carer(g) : parents(g)) + '每天晚上给你端来一杯热牛奶。' },
        { t: '照常学，该睡就睡', dev: 15, fx: (g) => { g.stat('学识', 2); g.stat('健康', 1); g.remember('push', 'normal'); }, res: '你没熬夜，成绩也没掉。' },
        { t: '不想读了，想早点出去挣钱', dev: 25, cond: (g) => ['farmer', 'migrant', 'worker'].includes(fam(g)) || g.s('学识') < 45, fx: (g) => { g.stat('心情', 2); g.stat('学识', -3); g.remember('push', 'quit'); }, res: '你上课开始看窗外。你在算，进厂一个月能挣多少钱。' },
      ] },
    { id: 'c_grandpa_ill', age: 14, t: '爷爷', auto: true,
      cond: (g) => g.alive('gp') && rural(g),
      fx: (g) => g.stat('人缘', 1),
      text: (g) => CN.who(g, 'gp', true) + '腰弯得更厉害了。' + (CN.livesWith(g, 'gp') || !g.recall('migrated')
        ? '他还是天天去地里，回来就坐在门槛上，问你考得怎么样。你说还行，他就笑。'
        : '他在电话里问你考得怎么样。你说还行，他在那头笑出了声。') },

    /* ================= 15 岁：中考 ================= */
    { id: 'c_zk_score', age: 15, t: '中考', auto: true,
      fx: (g) => {
        let s = g.s('学识');
        s += { key: 10, normal: 0, weak: -8 }[g.recall('school')] || 0;
        s += { hard: 8, normal: 2, quit: -15 }[g.recall('push')] || 0;
        s += { game: -6, study: 5, locked: 3 }[g.recall('phone')] || 0;
        s += { copy: -6, think: 3, race: 5, farm: 0, river: -2 }[g.recall('homework')] || 0;
        if (g.recall('olympiad')) s += 4;
        if (g.recall('cityKid') === 'class') s += 2;
        s += Math.round((g.rnd() - 0.5) * 18);
        g.remember('zkScore', s >= 86 ? 'high' : s >= 70 ? 'mid' : 'low'); // 分数线按真实比例：约两成上好高中，一半出头上普高
        CN.setEdu(g, 'junior', '初中');
        atSchool(g, '中考考场');
      },
      text: (g) => ({ high: '中考放榜，你考得很好，够得上最好的高中。', mid: '中考放榜，你的分数够上普通高中，离好高中差一截。', low: '中考放榜，你的分数没过普高线。' }[g.recall('zkScore')]) },
    { id: 'c_zhongkao', age: 15, t: '填志愿',
      text: (g) => {
        const z = g.recall('zkScore');
        if (z === 'high') return '班主任打电话来，问你填哪所高中。';
        if (z === 'low') return '班主任说，职高也是条路，学门手艺，好找工作。';
        if (away(g)) return '爸妈在电话里一遍遍地问你的分数，又让' + carer(g) + '把分数表拍下来发过去。';
        if (g.recall('parentsSplit')) return '妈妈拿着分数表，给爸爸打了一个电话。两个人难得心平气和地商量了一回。';
        return parents(g) + '看着那张分数表，商量了好几个晚上。';
      },
      choices: [
        { t: '上最好的那所高中', canon: true, cond: (g) => g.recall('zkScore') === 'high', fx: (g) => { CN.setEdu(g, 'senior', '高中在读'); g.remember('school', 'key'); g.remember('hs', 'key'); g.stat('心情', 3); }, res: (g) => '录取通知书寄到家里，' + (away(g) ? carer(g) + '把它拍了照，发给了外地的爸妈。' : parents(g) + '把它拍了照发到了亲戚群里。') },
        { t: '上普通高中', canon: true, cond: (g) => g.recall('zkScore') === 'mid', fx: (g) => { CN.setEdu(g, 'senior', '高中在读'); g.remember('school', 'normal'); g.remember('hs', 'normal'); }, res: (g) => '你进了' + (hk(g) === 'city' ? '市里' : '县里') + '的一所普通高中。三年以后，还有一次机会。' },
        { t: '去普通高中，拿全额奖学金', dev: 20, cond: (g) => g.recall('zkScore') === 'high' && ['farmer', 'migrant', 'worker'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', '高中在读'); g.remember('school', 'normal'); g.remember('hs', 'scholar'); g.stat('财富', 4); }, res: '学校免了你的学费，还每月发生活费。你是那所学校当年招的最高分。' },
        { t: '去职高，学一门手艺', canon: true, cond: (g) => g.recall('zkScore') === 'low', fx: (g) => { CN.setEdu(g, 'vocational', '职高在读'); g.remember('school', 'weak'); g.remember('hs', 'voc'); }, res: '你去了县里的职业学校。第一天，你看见实训车间里摆着一排排机器，心里松了一口气。' },
        { t: '去职高，学自己喜欢的专业', dev: 25, cond: (g) => g.recall('zkScore') !== 'low', fx: (g) => { CN.setEdu(g, 'vocational', '职高在读'); g.remember('school', 'normal'); g.remember('hs', 'vocChoice'); g.stat('心情', 4); }, res: '老师和家里人都劝你。你说，我就想学这个。' },
        { t: '花钱上私立高中', dev: 15, cond: (g) => g.recall('zkScore') !== 'high' && ['rich', 'civil', 'smallbiz'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', '高中在读'); g.remember('school', 'normal'); g.remember('hs', 'private'); g.stat('财富', -8); }, res: (g) => '一年的学费抵得上' + parents(g) + '半年的收入。妈妈说，砸锅卖铁也要让你读高中。' },
        { t: '不读了，出去打工', dev: 20, cond: (g) => g.recall('zkScore') === 'low' || g.recall('push') === 'quit', fx: (g) => { CN.setEdu(g, 'junior', '初中'); g.remember('hs', 'work'); g.stat('财富', 2); }, res: '你把课本卖给了收废品的，只留下一本语文书。那年夏天，你去了县城的一家饭馆帮工。' },
      ] },

    /* ================= 16 岁 ================= */
    { id: 'c_hs_track', age: 16, t: '选科', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: '高一下学期要选科了。物理、历史二选一，后面再选两门。你的同桌已经填好了。',
      choices: [
        { t: '选物理，以后专业多', canon: true, fx: (g) => { g.remember('track', 'sci'); g.stat('学识', 2); }, res: '你每天和受力分析较劲。老师说，选物理的路宽。' },
        { t: '选历史，自己喜欢', dev: 15, fx: (g) => { g.remember('track', 'arts'); g.stat('心情', 3); }, res: '你喜欢读那些旧事。你觉得过去的人和现在的人差不多。' },
        { t: '听家里的，他们说考公好考', dev: 10, fx: (g) => { g.remember('track', 'arts'); g.remember('parentsPlan', 'civil'); g.stat('人缘', 2); }, res: (g) => parents(g) + '很满意。你在志愿表上写下“历史”的时候，没多想。' },
      ] },
    { id: 'c_voc_major', age: 16, t: '专业', loc: 'school',
      cond: (g) => g.recall('edu') === 'vocational',
      text: '职高要分专业了。墙上贴着几个热门专业的就业率。',
      choices: [
        { t: '汽修或机电，好找工作', canon: true, fx: (g) => { g.remember('vocMajor', 'mech'); g.stat('健康', 1); g.info('专业', '机电'); }, res: '你的指甲缝里从此总有洗不掉的油。第一次把一台发动机装回去打着了火，你在车间里叫出了声。' },
        { t: '护理或幼教', dev: 10, fx: (g) => { g.remember('vocMajor', 'care'); g.stat('人缘', 3); g.info('专业', '护理'); }, res: '你学会了量血压、扎针。老师说，以后老人越来越多，这行缺人。' },
        { t: '电商直播', dev: 15, fx: (g) => { g.remember('vocMajor', 'ecom'); g.stat('心情', 2); g.info('专业', '电商'); }, res: '你对着镜头说了第一句“家人们”，自己先笑场了。' },
        { t: '工业机器人维修', dev: 15, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.remember('vocMajor', 'robot'); g.stat('学识', 3); g.info('专业', '机器人维修'); }, res: '实训室里那台机械臂比你还高。你第一次让它动起来的时候，全班都在鼓掌。' },
      ] },
    { id: 'c_first_job', age: 16, t: '第一份工',
      cond: (g) => g.recall('hs') === 'work',
      text: '你十六岁了，可以正经出去干活了。表哥说厂里在招人，饭馆的老板也说你可以留下学厨。',
      choices: [
        { t: '跟表哥去南方进厂', canon: true, fx: (g) => { const c = CN.goCity(g, 2, CN.pick(['东莞', '苏州', '佛山', '宁波'])); CN.setJob(g, 'worker', '工厂流水线'); g.move('factory', c + ' · 电子厂'); g.stat('财富', 3); g.stat('健康', -2); }, res: (g) => '你在' + g.recall('workCity') + '的流水线上一站就是十二个小时。第一个月发了钱，你寄了一半回家，剩下的请表哥吃了一顿烧烤。' },
        { t: '留在饭馆学厨', dev: 15, fx: (g) => { CN.setJob(g, 'shop', '饭馆学徒'); g.move('county', '县城 · 饭馆后厨'); g.remember('craft', 'cook'); g.stat('人缘', 2); }, res: '师傅脾气很差，刀工很好。你切坏了三十斤土豆，才学会切丝。师傅嘴上骂，收工时给你多盛了一碗饭。' },
        { t: '跟村里的叔叔学手艺', dev: 20, fx: (g) => { CN.setJob(g, 'worker', '学徒'); g.remember('craft', CN.pick(['tile', 'electric', 'weld'])); CN.goHome(g); g.stat('健康', 2); }, res: '你跟着叔叔走村串户，装水电、贴瓷砖。叔叔说，手艺在身上，饿不死。' },
      ] },

    /* ================= 17 岁 ================= */
    { id: 'c_hs_path', age: 17, t: '高二', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: (g) => {
        const t = g.recall('talent');
        const bit = t === 'art' ? '美术老师问你要不要走艺考。' : t === 'sport' ? '体育老师问你要不要走体考。' : t === 'code' || g.recall('olympiad') ? '数学老师问你要不要去搞竞赛。' : '班主任说，最后一年半，拼的是基本功。';
        return '高二快结束了。' + bit;
      },
      choices: [
        { t: '老老实实准备高考', canon: true, fx: (g) => { g.remember('hsPath', 'normal'); g.stat('学识', 3); }, res: '你的桌上摞起了一人高的卷子。' },
        { t: '报个补习班，补最差的那门', dev: 10, cond: (g) => fam(g) !== 'rich', fx: (g) => { g.remember('hsPath', 'tutor'); g.stat('学识', 4); g.stat('财富', -3); g.stat('心情', -1); }, res: '补习班在一栋旧楼的五楼，晚上十点才下课。那门课的分数，终于不拖后腿了。' },
        { t: '走艺考', dev: 20, cond: (g) => g.recall('talent') === 'art', fx: (g) => { g.remember('hsPath', 'art'); g.stat('心情', 3); g.stat('财富', -4); }, res: '你去省城的画室集训了半年，每天画十个小时。' },
        { t: '走体考', dev: 20, cond: (g) => g.recall('talent') === 'sport', fx: (g) => { g.remember('hsPath', 'sport'); g.stat('健康', 5); }, res: '你每天跑二十圈。你的腿上全是肌肉，书包里还是那些卷子。' },
        { t: '搞竞赛，赌一把保送', dev: 25, cond: (g) => g.recall('talent') === 'code' || !!g.recall('olympiad'), check: ['学识', 70], fx: (g) => { g.remember('hsPath', 'olympiad'); g.stat('学识', 6); g.stat('心情', 3); }, res: '你拿了省一等奖。几所好大学的老师来找你谈话。',
          fail: { fx: (g) => { g.remember('hsPath', 'normal'); g.stat('心情', -4); g.stat('学识', 1); }, res: '你差一点。回到教室时，别人已经复习完一轮了。同桌把整理好的笔记推到了你面前。', dev: 5 } },
        { t: '不想考了，想出国', dev: 20, cond: (g) => fam(g) === 'rich' && !g.recall('olympiad'), fx: (g) => { g.remember('hsPath', 'abroad'); g.stat('财富', -5); g.stat('学识', 2); }, res: '你开始考语言成绩，申请国外的大学。同学们在刷题，你在写文书。' },
      ] },
    { id: 'c_voc_intern', age: 17, t: '实习', loc: 'factory',
      cond: (g) => g.recall('edu') === 'vocational',
      text: (g) => '职高最后一年是实习。' + ({ mech: '你被分到一家汽车配件厂。', care: '你被分到市里的一家养老院。', ecom: '你被分到一家做直播带货的小公司。', robot: '你被分到一家自动化工厂，修机械臂。' }[g.recall('vocMajor')] || '你被分到一家工厂。') + '老师说，还可以准备“职教高考”，考高职。',
      choices: [
        { t: '实习完留下来干', canon: true, fx: (g) => { g.remember('vocPlan', 'work'); g.stat('财富', 2); g.stat('事业', 2); }, res: '老板说你手脚麻利，毕业就可以来上班。' },
        { t: '准备考高职（大专）', dev: 20, fx: (g) => { g.remember('vocPlan', 'college'); g.stat('学识', 4); }, res: '你白天实习，晚上在宿舍做题。宿舍里只有你的灯亮着。' },
      ] },
    { id: 'c_work_17', age: 17, t: '一年以后',
      cond: (g) => g.recall('hs') === 'work',
      text: (g) => (g.recall('job') === 'worker' && !g.recall('craft') ? '流水线上的活，你闭着眼睛都能做了。' : '师傅说你出师还早。') + '工友里有人在攒钱学技术，有人说要去大城市送外卖，挣得多。',
      choices: [
        { t: '接着干，攒钱', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('workPlan', 'stay'); CN.earn(g, 6000); }, res: (g) => '你一个月只花六七百块。年底一算，手里有 ' + CN.fmt(CN.cash(g)) + '，你把这个数看了好几遍。' },
        { t: '报个夜校，学技术', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('workPlan', 'study'); CN.pay(g, 3000); }, res: (g) => '学费 ' + CN.fmt(3000) + '。你下了班去上课，在课上打瞌睡，又被自己掐醒。' },
        { t: '去大城市闯闯', dev: 20, fx: (g) => { const c = CN.goCity(g, 1); CN.setJob(g, 'rider', '外卖骑手'); g.stat('健康', -2); g.remember('workPlan', 'city'); g.move('metro', c); }, res: (g) => '你到了' + g.recall('workCity') + '，租了一张床位，骑上了电动车。这座城市比你想的大得多。' },
      ] },
    { id: 'c_gaokao_eve', age: 17, t: '最后一个暑假', auto: true,
      cond: (g) => g.recall('edu') === 'senior',
      fx: (g) => g.stat('学识', 1),
      text: (g) => (g.recall('hsPath') === 'abroad' ? '你收到了国外大学的录取邮件。' : '高三开学前的那个暑假，你只放了七天。')
        + (g.recall('track') === 'sci' ? '物理老师说你的电磁学还差点火候。' : g.recall('track') === 'arts' ? '你把历史书上的年份编成了顺口溜。' : '')
        + (g.recall('parentsPlan') === 'civil' ? '爸妈已经开始打听公务员考试要考什么了。' : '')
        + (g.recall('crush') === 'pact' ? '那个和你拉过钩的人，和你分在了同一个班。' : '') },

    /* ---------- 更多自动节点：让每个童年有血有肉 ---------- */
    { id: 'c_older_sib', age: 3, t: '哥哥姐姐', auto: true,
      cond: (g) => !!olderSib(g),
      fx: (g) => g.stat('人缘', 2),
      text: (g) => { const s = olderSib(g); return (s.sex === '男' ? '哥哥' : '姐姐') + s.name + '放学回来，第一件事是把你抱起来转圈。' + (left(g) ? '爸妈不在家，' + (s.sex === '男' ? '他' : '她') + '像半个大人。' : ''); } },
    { id: 'c_june_show', age: 5, t: '六一', auto: true,
      cond: (g) => g.recall('kinder') !== 'none',
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.recall('kinder') === 'bilingual' ? '幼儿园的六一汇演，你演了一棵会说英语的树。' : '六一儿童节，你脸上点了红点，站在第二排跳舞。') + (away(g) ? carer(g) + '举着手机录像，录了一半没电了。' : '台下的爸妈举着手机，比你还紧张。') },
    { id: 'c_first_award', age: 7, t: '期末', auto: true,
      fx: (g) => { const good = g.s('学识') >= 45; g.remember('firstAward', good); g.stat('心情', good ? 3 : -1); },
      text: (g) => (g.recall('firstAward') ? '一年级期末，你拿回来一张“三好学生”的奖状。' + (away(g) ? carer(g) + '把它贴在堂屋正中间，来人就指给人看。' : '爸妈把它贴在了冰箱上。') : '一年级期末，你的数学没考及格。你把卷子藏在了书包最底下。第二学期，同桌每天课间教你一道题。') },
    { id: 'c_summer_visit', age: 8, t: '暑假', auto: true,
      cond: (g) => away(g),
      fx: (g) => { g.stat('心情', 3); g.stat('学识', 1); },
      text: (g) => '暑假，爸妈把你接到' + pcity(g) + '住了半个月。他们白天上班，你在出租屋里看电视，等他们下班。最后一天，他们带你去了一次' + (seaCity(pcity(g)) ? '海边。你第一次看见海，' : '游乐场。你第一次坐了摩天轮，') + '记了很多年。' },
    { id: 'c_new_home', age: 9, t: '搬家', auto: true,
      cond: (g) => ['white', 'civil', 'rich'].includes(fam(g)) && !rural(g) && !left(g),
      fx: (g) => { const moved = g.rnd() < 0.5; g.remember('newHome', moved); if (moved) { g.stat('心情', 2); g.stat('财富', -3); } },
      text: (g) => (g.recall('newHome')
        ? (g.recall('school') === 'key' ? '家里在新区买了房子，你有了自己的房间。上学远了，爸爸每天早上开车送你。爸妈说房贷要还二十年。' : '家里换了房子。新房子离学校近，你有了自己的房间。爸妈说房贷要还二十年。')
        : '同学们一个个搬进了新小区。你家还住在老房子里，楼道里的灯坏了一年。后来是你和爸爸一起把灯泡换上的。') },
    { id: 'c_glasses', age: 10, t: '近视', auto: true,
      fx: (g) => { const my = g.recall('kidStyle') === 'ai' || g.recall('homework') === 'copy' || g.rnd() < 0.45; g.remember('glasses', my); if (my) g.stat('健康', -1); },
      text: (g) => (g.recall('glasses') ? '体检的时候，你看不清视力表的第三行了。你配了第一副眼镜，世界一下子清楚得吓人。' : '体检的时候，你的视力还是 5.0。班上一半的同学戴上了眼镜。') },
    { id: 'c_ai_class', age: 11, t: '新课', auto: true,
      fx: (g) => g.stat('学识', 1),
      text: (g) => (rural(g) && !g.recall('migrated') ? '镇上的学校装了一块大屏幕，城里的老师在屏幕那头给你们上课。信号不好的时候，老师的脸会变成马赛克。' : '学校开了一门新课，教你们怎么跟 AI 说话，怎么分辨它说的是真是假。') },
    { id: 'c_sports_day', age: 11, t: '运动会', auto: true,
      fx: (g) => { const run = g.s('健康') >= 70 || g.recall('talent') === 'sport'; g.remember('sportsDay', run); if (run) g.stat('人缘', 2); },
      text: (g) => (g.recall('sportsDay') ? '运动会上，你跑了八百米，拿了第二名。全班都在终点等你。' : '运动会上，你负责在看台上喊加油，喊哑了嗓子。') },
    { id: 'c_growing', age: 13, t: '长大', auto: true,
      fx: (g) => g.stat('健康', 1),
      text: (g) => (isMale(g) ? '你的声音变粗了，嘴唇上冒出一层绒毛。一个暑假，你长高了八厘米。' : '你一个暑假长高了好几厘米。')
        + (away(g) ? '妈妈从外地寄回来一件新外套，袖子长了一截，' + carer(g) + '说留着明年穿。' : isMale(g) ? '' : '妈妈带你去买新衣服，你第一次自己挑颜色。') },
    { id: 'c_gm_ill', age: 13, t: '奶奶病了', auto: true,
      cond: (g) => away(g) && g.alive('gm') && CN.livesWith(g, 'gm'),
      fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); },
      text: (g) => CN.who(g, 'gm', true) + '病了一场，躺了半个月。你学会了煮粥、熬药，周末陪她去镇上打针。爸妈打电话回来，你说奶奶好着呢。半个月后，她又能下地喂鸡了。' },
    { id: 'c_shop_closed', age: 14, t: '店', auto: true,
      cond: (g) => fam(g) === 'smallbiz',
      fx: (g) => { const bad = g.rnd() < 0.4; g.remember('shopClosed', bad); if (bad) { g.stat('财富', -6); g.stat('心情', -2); } else g.stat('财富', 2); },
      text: (g) => (g.recall('shopClosed') ? '家里的小店关门了。网上什么都能买，来店里的人越来越少。半年后，爸爸在网上把货重新卖了起来，生意小了，人倒是天天在家吃晚饭了。' : '家里的小店还开着，你放学后在柜台后面写作业，顺便帮着收钱。') },
    { id: 'c_id_card', age: 16, t: '身份证', auto: true,
      fx: (g) => g.stat('心情', 1),
      text: (g) => '你办了第一张身份证。照片上的你绷着脸，' + (g.recall('glasses') ? '摘了眼镜，眼睛有点虚。' : '头发是前一天刚剪的。') + (g.recall('hs') === 'work' ? '有了它，你可以正经签劳动合同了。' : '') },
    { id: 'c_hs_start', age: 16, t: '开学', auto: true,
      cond: (g) => ['senior', 'vocational'].includes(g.recall('edu')),
      fx: (g) => { if (g.recall('edu') === 'senior') atSchool(g, g.recall('hs') === 'key' ? '重点高中' : '高中'); else atSchool(g, '职业学校'); },
      text: (g) => (g.recall('edu') === 'senior'
        ? (g.recall('hs') === 'key' ? '重点高中的晚自习上到十点。年级第一的人，每天早上五点半就在走廊里背单词。' : g.recall('hs') === 'scholar' ? '你是学校的“状元苗子”，校长在开学典礼上念了你的名字。' : '高一开学，军训晒掉了你一层皮。')
          + (rural(g) ? '县城的高中要住校，你一个月回一次家，每次回去都背一罐家里腌的咸菜。' : '')
        : '职业学校的宿舍楼对着一片工地。第一周，你认识了宿舍里另外五个从不同县来的人。') },
  ]);

  /* ---------- 随时可能发生的家事：兄弟姐妹出生、爷爷奶奶离世、旧日的回声 ---------- */
  const sibBorn = (id) => ({
    id: 'e_c_born_' + id, y: [2027, 2033], maxAge: 6, t: '家里添了人', auto: true, always: true,
    cond: (g) => { const s = JY.byId[id]; return !!s && s.born === g.Y; },
    fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); },
    text: (g) => {
      const s = JY.byId[id], he = s.sex === '男' ? '他' : '她';
      return '你有了一个' + (s.sex === '男' ? '弟弟' : '妹妹') + '，叫' + s.name + '。家里人都围着' + he + '转，你抱着自己的玩具，在旁边站了很久。'
        + (left(g) ? '妈妈坐完月子又走了，把' + he + '也留给了' + carer(g) + '。' : '') + '后来' + he + '会走路了，第一件事就是摇摇晃晃地跟在你后面。';
    },
  });
  const gpGone = (id, who) => ({
    id: 'e_c_gone_' + id, y: [2027, 2043], maxAge: 17, t: who, auto: true, always: true,
    cond: (g) => !!JY.byId[id] && !g.alive(id),
    fx: (g) => { g.stat('心情', -4); if (g.recall('leftBehind')) g.stat('心情', -3); },
    text: (g) => {
      const raised = g.recall('leftBehind') || (id === 'gm' && (g.recall('boarding') === 'gm' || g.recall('nanny') === 'gm'));
      return (raised
        ? CN.who(g, id) + '走了快一年了。是' + who + '把你带大的。' + (id === 'gm' ? '你一直留着奶奶的那条旧毛巾，洗得发白了也不让人扔。' : '爷爷那根磨得发亮的拐棍，你靠在了自己床头。')
        : '清明，你跟着大人去给' + CN.who(g, id) + '上坟。回去的路上，你想起' + who + '以前总在兜里给你留一块糖。');
    },
  });
  JY.addEncounters([
    sibBorn('sib0'), sibBorn('sib1'),
    gpGone('gp', '爷爷'), gpGone('gm', '奶奶'),
    // 当年对转学来的同学怎么样，几年后有回音
    { id: 'e_c_kindness_echo', y: [2040, 2044], minAge: 14, maxAge: 17, t: '旧同学', auto: true, always: true,
      cond: (g) => ['friend', 'laughed'].includes(g.recall('kindness')),
      fx: (g) => { if (g.recall('kindness') === 'friend') g.stat('人缘', 3); else g.stat('心情', -1); },
      text: (g) => (g.recall('kindness') === 'friend'
        ? '那个口音很重的同学转学走了好几年，突然给你发来一张照片：他考上了老家最好的高中。下面一行字：谢谢你当年跟我玩。'
        : '你在网上刷到一个视频，说小时候被人学口音嘲笑是什么感觉。你想起了那个转学来的同学，想不起他的名字了。') },
    // 小时候的那次拉人，后来有人记得
    { id: 'e_c_river_echo', y: [2040, 2044], minAge: 15, maxAge: 17, t: '鸡蛋', auto: true, always: true,
      cond: (g) => g.recall('river') === 'saved' && g.f('childSavedKid'),
      fx: (g) => g.stat('人缘', 3),
      text: '当年被你从河里拉上来的那个小孩，上初中了。他妈妈每年都在你家门口放一篮鸡蛋，从来不敲门。' },
    // 父母离婚以后
    { id: 'e_c_split_echo', y: [2038, 2043], minAge: 12, maxAge: 17, t: '周末', auto: true, always: true,
      cond: (g) => g.recall('parentsSplit') === true && g.alive('fa'),
      fx: (g) => { g.stat('心情', -1); g.stat('学识', 1); },
      text: '你每个月去爸爸那儿吃一顿饭。饭桌上大家都很客气，他总记得给你夹你爱吃的那道菜。回来的公交上，你戴着耳机，什么也没放。' },
    // 小时候第一句话叫的是奶奶
    { id: 'e_c_firstword_echo', y: [2036, 2043], minAge: 10, maxAge: 17, t: '奶奶', auto: true, always: true,
      cond: (g) => g.recall('firstWord') === '奶奶' && g.alive('gm') && g.recall('askedMom') === 'home',
      fx: (g) => g.stat('人缘', 2),
      text: '奶奶的眼睛花了，穿针要你帮忙。她说你小时候第一句话叫的就是奶奶，说了很多遍，你装作第一次听。' },
  ]);

  /* ---------- 童年专属闲笔（0–5 岁按年龄放开） ---------- */
  JY.addFlavor('age:child', [
    { t: '你把奶奶的老花镜戴在头上，说自己是老师。', minAge: 3, cond: (g) => g.recall('leftBehind') && g.alive('gm') },
    { t: '第一场雪落下来，大人抱着你到门口，你伸手去接，雪在手心化了。', minAge: 1, cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: '你在小区的滑梯上滑了一百次，还不肯回家。', minAge: 3, cond: (g) => g.recall('hukou') !== 'rural' },
    { t: '你追着村里的大鹅跑，被大鹅追了回来。', minAge: 3, cond: (g) => g.recall('hukou') === 'rural' },
    { t: '大人一逗，你就咯咯地笑，笑得口水流了一下巴。', maxAge: 1 },
    { t: '你抓住了大人的手指，攥得紧紧的，怎么也不肯松开。', maxAge: 0 },
    { t: '你长出了第一颗牙，咬什么都要咬一下。', minAge: 0, maxAge: 1 },
    { t: '你会翻身了，一不留神就从枕头这头滚到那头。', maxAge: 0 },
    { t: '你学会了说“不要”，每天要说一百遍。', minAge: 2, maxAge: 4 },
    { t: '你把积木搭得比自己还高，然后一巴掌推倒，笑得前仰后合。', minAge: 2 },
    { t: '奶奶唱的摇篮曲是老家的调子，你听着听着就睡着了。', maxAge: 2, cond: (g) => (g.recall('leftBehind') || ['gm', 'home'].includes(g.recall('nanny'))) && g.alive('gm') },
    { t: '托育班的老师说，你是班上第一个会自己穿鞋的。', minAge: 2, maxAge: 3, cond: (g) => g.recall('nanny') === 'daycare' },
    { t: '店里来了客人，你学着爸妈的样子说“欢迎光临”，把客人逗笑了。', minAge: 3, cond: (g) => g.recall('nanny') === 'shop' },
    { t: '你蹲在门口看蚂蚁搬家，看了整整一个下午。', minAge: 3 },
  ]);
  JY.addFlavor('age:young', [
    { t: '周五放学，你在校门口等奶奶，等到了天黑。奶奶到的时候，手里提着一袋热乎的烤红薯。', cond: (g) => g.recall('leftBehind') && !g.recall('migrated') && g.alive('gm') },
    { t: '城中村的楼挨得很近，你从窗户能递东西给对面楼的同学。', cond: (g) => g.recall('migrated') },
    { t: '城中村的巷子里，烧饼摊的老板记得你不要葱。', cond: (g) => g.recall('migrated') && g.recall('cityKid') === 'roam' },
    { t: '你的手机屏幕裂了一道缝，你一直没舍得换。', cond: (g) => g.recall('phone') === 'game' },
    { t: '你在网课上听一个大学教授讲宇宙，听到了半夜。', cond: (g) => g.recall('phone') === 'study' },
    { t: '你偷偷看了一眼那个人的座位，然后假装在看黑板。', cond: (g) => ['hidden', 'pact', 'told'].includes(g.recall('crush')) },
    { t: '宿舍熄灯以后，你打着手电筒做完了最后一道题。', cond: (g) => g.recall('push') === 'hard' },
    { t: '爸妈吵架的时候，会先看你一眼，然后压低声音。', cond: (g) => g.recall('glue') === true },
    { t: '你在走廊上碰见了当年那几个堵人的高年级，他们装作不认识你。', cond: (g) => ['stood', 'teacher', 'beaten'].includes(g.recall('bully')) },
    { t: '那天你绕开走的事，你后来想起过好几次。', cond: (g) => g.recall('bully') === 'away' },
    { t: '路边有一只流浪猫冲你叫了一声。你想起小时候没敢碰的那一只，蹲下来看了它一会儿。', cond: (g) => g.recall('kidPet') === 'no' },
    { t: '妈妈回来以后，家里的灯每天晚上都亮着。你放学走到村口，远远就能看见。', cond: (g) => g.recall('momBack') === 'mo' },
  ]);
  // 16、17 岁归在 adult 闲笔里，用 maxAge 卡住
  JY.addFlavor('age:adult', [
    { t: '夜校的课本上，你在每一页的角上写了日期。', maxAge: 19, cond: (g) => g.recall('workPlan') === 'study' },
    { t: '你给家里打电话，只说一切都好，没说累。', maxAge: 19, cond: (g) => ['stay', 'city'].includes(g.recall('workPlan')) },
    { t: '实习结束那天，师傅拍了拍你的肩膀，说以后有事找他。', maxAge: 18, cond: (g) => g.recall('vocPlan') === 'work' },
    { t: '宿舍熄灯以后，你借着走廊的灯做职教高考的题。', maxAge: 17, cond: (g) => g.recall('vocPlan') === 'college' },
    { t: '高三的教室后墙上贴着倒计时，每天有人去撕掉一页。', minAge: 17, maxAge: 17, cond: (g) => g.recall('edu') === 'senior' && g.recall('hsPath') !== 'abroad' },
  ]);
})();

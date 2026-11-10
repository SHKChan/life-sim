/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
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
  const cityName = (g) => g.recall('city') || '市裡';
  const home = (g) => g.recall('homeCap') || '老家';
  const notRural = (g) => hk(g) !== 'rural' || !!g.recall('migrated');
  const sibIds = ['sib0', 'sib1'];
  const youngerSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born > CN.NOW);
  const olderSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born < CN.NOW);
  const regionBit = (g, map, dft) => map[g.recall('region')] || dft;
  const north = (g) => ['东北', '华北', '西北'].includes(g.recall('region'));
  // 家里管你的大人怎么称呼
  const parents = (g) => {
    if (g.recall('parentsSplit')) return '媽媽';
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? '爸爸' : '媽媽';
    return '爸媽';
  };
  // 留守时带你的人
  const carer = (g) => {
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? '爸爸' : '媽媽';
    if (g.alive('gm')) return '奶奶';
    if (g.alive('gp')) return '爺爺';
    return '家裡人';
  };
  // 名字算出来的固定随机数：同一个人每次读到的城市、宠物名都一样
  const hash = (g) => { const n = (JY.byId[g.me] && JY.byId[g.me].name) || ''; let s = 0; for (let i = 0; i < n.length; i++) s += n.charCodeAt(i); return s; };
  // 留守孩子的爸妈在哪座城市打工
  const PCITY = { 华南: ['深圳', '東莞', '佛山', '廣州'], 西南: ['東莞', '深圳', '佛山', '寧波'], 华中: ['東莞', '蘇州', '深圳', '杭州'], 华东: ['蘇州', '寧波', '杭州', '上海'], 华北: ['北京', '天津', '蘇州', '青島'], 东北: ['北京', '天津', '大連', '青島'], 西北: ['西安', '北京', '蘇州', '東莞'] };
  const pcity = (g) => {
    const list = PCITY[g.recall('region')] || ['東莞', '深圳', '蘇州', '杭州'];
    return list[hash(g) % list.length];
  };
  const seaCity = (c) => ['深圳', '廣州', '寧波', '上海', '天津', '大連', '青島'].includes(c);
  const petName = (g) => (rural(g) ? ['大黃', '小黑', '旺財', '花花'] : ['糰子', '咪咪', '豆豆', '橘子'])[hash(g) % 4];
  CN.kidPetName = petName; // economy.js 收养这只宠物时用同一个名字
  const petKind = (g) => (rural(g) ? '狗' : '貓');
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
    childSavedKid: '十歲那年，從河裡拉上來一個落水的孩子',
  });

  // 留守的孩子，爷爷奶奶都不在了：爸妈得有一个人回来。每个年龄放一个自动节点，排在这一年所有节点前面
  const momBackNode = (age) => ({
    id: 'c_mom_back_' + age, age, t: '回來了', auto: true,
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
      return '爺爺奶奶都不在了，家裡不能沒有大人。' + CN.who(g, id, true) + '辭了外地的工作，回來了。' + he + '在' + (rural(g) ? '鎮上' : '縣城') + '找了份活，掙的錢少了一半，可每天晚上都能和你一起吃飯。';
    },
  });
  JY.addLifeNodes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(momBackNode));

  JY.addLifeNodes([
    /* ================= 0–5 岁：大多是自动节点 ================= */
    { id: 'c_born', age: 0, t: '滿月', auto: true,
      text: (g) => {
        if (left(g)) return '奶奶用一條舊揹帶把你綁在背上，餵雞、做飯都揹著。媽媽每天晚上打來影片，螢幕一亮，你就不哭了。';
        if (fam(g) === 'rich') return '媽媽在月子中心住了一個月。護士給你拍嗝的手法，比爸媽熟練得多。';
        return regionBit(g, {
          东北: '媽媽坐月子，屋裡暖氣燒得足。奶奶天天熬小米粥，熬得滿屋都是米香。',
          华南: '滿月那天，家裡煮了一大鍋豬腳姜，分給左鄰右舍。你被抱出來轉了一圈，一直在睡。',
          西南: '滿月那天，家裡擺了幾桌酒。外婆從鄉下趕來，給你戴上一隻小銀鐲。',
          西北: '滿月那天，奶奶蒸了一籠花饃，捏成老虎的樣子，說是給你壓驚。',
          华东: '滿月那天，家裡人湊在一起給你剃了胎髮，說要留著做一支毛筆。',
        }, '滿月那天，家裡擺了幾桌酒。親戚們輪流抱你，你一直在睡，誰也沒吵醒你。');
      } },
    { id: 'c_nights', age: 0, t: '夜裡', auto: true,
      cond: (g) => !left(g),
      text: (g) => (fam(g) === 'rich' ? '夜裡有育兒嫂守著。媽媽還是常常醒過來，站在小床邊看你。' : '頭半年，夜裡每兩三個小時就得喂一次奶。爸爸學會了單手衝奶粉，另一隻手還抱著你。') },
    { id: 'c_nanny', age: 1, t: '誰帶你', auto: true,
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
        maid: '家裡請了一位育兒嫂，說話帶著老家口音。她抱你的姿勢，比爸媽都穩。',
        shop: '爸媽的店離不開人。你的小床就擺在櫃檯後面，來買東西的人，順手逗你兩下。',
        home: rural(g) ? '爸媽下地的時候，就把你交給奶奶。奶奶一邊擇菜，一邊用腳晃著你的搖籃。' : '家裡三代人住在一起。爸媽白天上班，你歸奶奶管。',
        gm: '媽媽的產假休完了。奶奶從老家坐了一夜的車過來，說要幫著帶到你上小學。' + (g.alive('gp') ? '爺爺一個人留在老家，每天晚上打影片來看你。' : ''),
        daycare: '媽媽回去上班了。你被送進了小區裡的托育班，早上八點送，晚上六點接。',
        mom: '媽媽算了算請人帶孩子的錢，辭了工作，在家帶你。',
      }[g.recall('nanny')]) },
    { id: 'c_first_year', age: 1, t: '一歲', auto: true,
      text: (g) => {
        if (left(g)) return '你會走路了。第一步是扶著奶奶的褲腿邁出去的。奶奶錄了影片發過去，影片那頭，媽媽哭了。';
        if (g.recall('nanny') === 'maid') return '你會走路了。家裡的育兒嫂比爸媽先看見你邁出第一步，趕緊掏出手機補拍了一遍。';
        if (g.recall('nanny') === 'gm') return '你會走路了。第一步是朝著奶奶走過去的。奶奶高興得在電話裡跟爺爺說了半個鐘頭。';
        if (rural(g)) return '你會走路了。你搖搖晃晃地朝院子裡的雞走過去，雞還沒跑，你先一屁股坐在了地上。';
        return '你會走路了。爸媽把你第一步的影片發到了家族群裡，親戚們回了一排大拇指。';
      } },
    { id: 'c_first_word', age: 2, t: '第一句話', auto: true,
      fx: (g) => {
        const w = left(g) || g.recall('nanny') === 'gm' ? '奶奶' : g.recall('nanny') === 'mom' ? '媽媽' : g.rnd() < 0.5 ? '媽媽' : '爸爸';
        g.remember('firstWord', w);
      },
      text: (g) => '你說的第一個詞是“' + g.recall('firstWord') + '”。'
        + (left(g) ? '爸媽在電話裡聽見了，半天沒說話。後來媽媽說，聽你叫奶奶，她也高興。'
          : g.recall('firstWord') === '奶奶' ? '奶奶當天就打電話告訴了老家所有的親戚。' : '家裡人高興了一整天。') },
    { id: 'c_spoon', age: 2, t: '自己吃飯', auto: true,
      text: (g) => (north(g) ? '你學著自己拿勺子喝小米粥，喝一半灑一半，' : '你學著自己拿勺子吃米糊，吃一半糊一半，') + (left(g) || g.recall('nanny') === 'gm' || g.recall('nanny') === 'home' ? '奶奶在旁邊拿著毛巾，也不催你。' : '爸媽在旁邊舉著手機拍，誰也不肯幫你。') },
    { id: 'c_fever', age: 2, t: '發燒', auto: true,
      fx: (g) => { const bad = g.s('健康') < 50 || g.rnd() < 0.25; g.remember('fever', bad); g.stat('健康', bad ? -4 : 1); },
      text: (g) => g.recall('fever')
        ? (rural(g) ? '你半夜燒到三十九度八。爺爺騎著電動車，把你裹在懷裡送到鎮衛生院。天亮時燒退了，你在爺爺懷裡睡著了。' : '你燒了三天，在兒童醫院的走廊裡打了三天點滴。出院那天，護士阿姨送了你一張小貼紙。')
        : '入冬時你發了一場小燒，喝了幾天藥就好了。' },
    { id: 'c_kinder', age: 3, t: '幼兒園', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        if (h === 'rural') { g.remember('kinder', left(g) ? 'none' : 'town'); g.move(g.recall('homeLoc'), home(g)); }
        else g.remember('kinder', f === 'rich' ? 'bilingual' : f === 'civil' ? 'public' : 'private');
        if (g.recall('kinder') === 'none') g.stat('学识', -2); else g.stat('人缘', 2);
      },
      text: (g) => ({
        bilingual: '你上了一家雙語幼兒園，老師說英語，午飯有水果拼盤。第一天你沒哭。',
        public: '你抽中了公辦幼兒園的名額。爸媽說運氣好，開學前一晚把你的小被子疊了三遍。',
        private: '你上了小區門口的民辦幼兒園。頭一個星期，你每天早上都扒著門不肯進去，第二個星期就不回頭了。',
        town: '你每天坐三輪車去鎮上的幼兒園。車上擠著七八個孩子，像一筐蘿蔔。',
        none: '村裡的幼兒園兩年前就關了。你跟著' + carer(g) + '在家，' + carer(g) + '教你數雞蛋，數到十就獎勵你一顆。',
      }[g.recall('kinder')]) },
    { id: 'c_first_taste', age: 3, t: '嘗一口', auto: true,
      text: (g) => '三歲那年，你第一次嚐了大人碗裡的' + regionBit(g, {
        东北: '鍋包肉。酸酸甜甜的，你一口氣吃了三塊。',
        华北: '炸醬麵。醬是鹹的，你吃得滿嘴黑，還要第二口。',
        西北: '臊子面，大人給你挑了不辣的那一小碗。你連湯都喝了。',
        华东: '小餛飩。皮薄得透光，你一個一個數著吃。',
        华中: '熱乾麵。芝麻醬糊了一嘴，你還是說好吃。',
        华南: '蝦餃。你咬了一口，燙得直哈氣，又伸手要了一個。',
        西南: '抄手，紅油給你撇掉了。你還是被辣得眼淚汪汪，又不肯放下勺子。',
      }, '餃子。你一口咬下去，湯燙了舌頭，又伸手要了一個。') },
    { id: 'c_newyear', age: 5, t: '過年', auto: true,
      fx: (g) => { g.stat('心情', 3); if (left(g)) g.stat('人缘', 2); },
      text: (g) => {
        const food = regionBit(g, { 东北: '餃子和凍梨', 华北: '餃子', 西北: '油餅和臊子面', 华东: '年糕和八寶飯', 华中: '臘魚和餈粑', 华南: '盆菜和煎堆', 西南: '臘肉和湯圓' }, '餃子');
        if (away(g)) return '臘月二十八，爸媽拖著兩個大箱子回來了。你躲在' + carer(g) + '身後，不敢叫人。那年過年吃的是' + food + '。初六他們又走了，媽媽給你留了一件新棉襖，你穿到了開春。';
        if (rural(g)) return '這一年過年，桌上有' + food + '。你跟著大孩子放小鞭炮，捂著耳朵跑得比誰都快。';
        return '這一年過年，桌上有' + food + '。你收了一堆紅包，全被媽媽“替你存著”了。';
      } },

    /* ---------- 4 岁：小时候的样子 ---------- */
    { id: 'c_ai_story', age: 4, t: '講故事的小盒子',
      cond: (g) => !rural(g),
      text: (g) => (away(g) ? '爸媽從外地寄回來一個會說話的小盒子。它會講故事、會唱歌，奶奶聽不懂的“為什麼”，它都答得上來。' : '家裡來了一個會說話的小盒子。它會講故事、會唱歌，還會回答你所有的“為什麼”。' + (fam(g) === 'smallbiz' ? '爸媽守著店，天黑才回家。' : '爸媽下班很晚。')),
      choices: [
        { t: '天天讓它講故事', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'ai'); }, res: '你知道了恐龍、星星和海底。它從來不嫌你煩。' },
        { t: '非要等爸媽回來講', dev: 15, cond: (g) => !away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: '你常常等著等著就睡著了。偶爾等到了，那是一天裡最好的時候。' },
        { t: '只聽媽媽在影片裡講', dev: 15, cond: (g) => away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: '媽媽下了夜班，躺在宿舍的床上給你講。講著講著，有時候是她先睡著。' },
        { t: '把它拆開，看裡面誰在說話', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', -1); g.remember('kidStyle', 'tinker'); }, res: '裡面沒有人，只有一塊綠色的板子。你捱了一頓罵，也記住了那塊板子的樣子。' },
      ] },
    { id: 'c_village_kid', age: 4, t: '村口',
      cond: (g) => rural(g),
      text: (g) => (away(g) ? carer(g) + '下地的時候，' : '大人們忙的時候，') + '你在村口待著。一條土路通到外面，偶爾有車開過去。',
      choices: [
        { t: '跟著下地', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('kidStyle', 'field'); }, res: '你學會了分辨麥苗和韭菜，曬得像個泥娃娃。' },
        { t: '蹲在路邊數過去的車', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'road'); }, res: '你數到了一百。你想知道路的那頭是什麼地方。' },
        { t: '跟一群大孩子去後山', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('kidStyle', 'gang'); }, res: '你摔破了膝蓋，也有了第一幫跟著混的哥哥姐姐。' },
      ] },

    /* ---------- 5 岁：小狗小猫 ---------- */
    { id: 'c_pet', age: 5, t: '小東西',
      text: (g) => (rural(g) ? '村口來了一條小土狗，瘦得肋骨一根根看得見。它跟著你走了一路，你停它也停。' : '小區的花壇裡有一隻小野貓，叫聲細細的。你蹲下來，它沒跑。'),
      choices: [
        { t: '每天偷偷留一口吃的給它', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('kidPet', 'fed'); }, res: '你把雞蛋黃省下來，用紙包著帶出門。它每天在老地方等你。' },
        { t: '抱回家，求大人留下它', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('kidPet', 'kept'); }, res: (g) => '大人嘴上嫌麻煩，還是給它找了個紙箱當窩。你給它取名叫' + petName(g) + '。' },
        { t: '不敢碰，跑回了家', dev: 10, fx: (g) => { g.stat('心情', -1); g.remember('kidPet', 'no'); }, res: '第二天你再去看，它不在那兒了。你在那裡站了一會兒。' },
      ] },
    { id: 'c_name_lesson', age: 5, t: '寫名字', auto: true,
      cond: (g) => g.recall('kinder') === 'none',
      fx: (g) => g.stat('学识', 2),
      text: (g) => carer(g) + '拆了一個煙盒，在背面一筆一畫寫下你的名字，讓你照著描。你描了一個下午，' + carer(g) + '把那張紙壓在了玻璃板底下。' },

    /* ================= 6 岁：上小学 ================= */
    { id: 'c_school_assign', age: 6, t: '上小學', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        let s;
        if (h === 'rural') s = 'weak';
        else if (f === 'rich' || f === 'civil') s = g.rnd() < 0.6 ? 'key' : 'normal';
        else if (h === 'city') s = g.rnd() < 0.25 ? 'key' : 'normal';
        else s = g.rnd() < 0.15 ? 'key' : 'normal';
        g.remember('school', s);
        CN.setEdu(g, 'primary', '小學在讀');
        atSchool(g, h === 'rural' ? '鎮中心小學' : h === 'county' ? '縣實驗小學' : cityName(g) + '的小學');
      },
      text: (g) => {
        const s = g.recall('school');
        if (rural(g)) return '村小在你上學前一年撤了，全村的孩子都併到了鎮中心小學。開學那天，操場上的孩子比你見過的都多。';
        if (s === 'key') return fam(g) === 'rich' ? '你進了一所好小學。開學那天，校門口停滿了車，爸爸把你送到教室門口才走。' : '你進了一所好小學。為了這個學位，爸媽幾年前就買了學校旁邊的老房子。';
        if (hk(g) === 'county') return '你背上新書包，進了縣實驗小學。校門口賣烤腸的攤子，從你開學那天起就成了你的心事。';
        return '你背上新書包，進了離家最近的小學。書包比你還寬。';
      } },
    { id: 'c_nanny_end', age: 6, t: '上學以後', auto: true,
      cond: (g) => ['gm', 'mom'].includes(g.recall('nanny')) && (g.recall('nanny') === 'mom' || CN.livesWith(g, 'gm')),
      fx: (g) => { if (g.recall('nanny') === 'gm' && g.alive('gp')) CN.moveOut(g, ['gm']); },
      text: (g) => {
        if (g.recall('nanny') === 'mom') return '你上了小學，媽媽重新出去找了份工作。她說在家待了五年，第一天上班，連會議室在哪兒都要問人。';
        if (g.alive('gp')) return '你上了小學，奶奶說她的任務完成了，要回老家陪爺爺。走那天，她給你縫了一個裝零錢的小布包，說放假就回去看她。';
        return '你上了小學。奶奶本來說要回老家，可爺爺不在了，她就留了下來，每天站在校門口第一排等你放學。';
      } },
    { id: 'c_first_day', age: 6, t: '開學第一天', loc: 'school',
      cond: (g) => !rural(g),
      text: '老師讓大家選同桌、選班幹部。你旁邊坐著一個一直在摳橡皮的孩子。',
      choices: [
        { t: '主動跟同桌說話', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('deskmate', 'friend'); g.rel('發小', CN.pick(['小胖', '豆豆', '樂樂', '果果', '小雨']), '小學同桌'); }, res: '同桌把橡皮掰了一半給你。你們後來一起上了六年學。' },
        { t: '舉手要當班長', dev: 20, fx: (g) => { g.stat('事业', 2); g.stat('人缘', -1); g.remember('deskmate', 'leader'); g.info('身份', '班長'); }, res: '老師笑著讓你當了。你第一次站在講臺上喊“起立”，聲音有點抖。' },
        { t: '一直盯著窗外，看送你的人走了沒有', dev: 10, fx: (g) => { g.stat('心情', -2); g.remember('deskmate', 'shy'); },
          res: (g) => (away(g) ? carer(g) : g.recall('nanny') === 'gm' && CN.livesWith(g, 'gm') ? '奶奶' : '媽媽') + '早走了。那一天你一句話也沒說。放學時看見校門口那張熟悉的臉，你才哭出來。' },
      ] },
    { id: 'c_boarding', age: 6, t: '寄宿', loc: 'school',
      cond: (g) => rural(g),
      text: '鎮上的學校離家十幾裡。老師說一年級就可以住校，一週回一次家。',
      choices: [
        { t: '住校', canon: true, fx: (g) => { g.stat('心情', -3); g.stat('健康', 1); g.remember('boarding', 'yes'); }, res: '宿舍裡睡十二個孩子。頭一個月，每天熄燈後都有人哭。生活老師挨個床給你們掖被角，後來哭的人少了。' },
        { t: '每天走讀，天不亮就出門', dev: 15, fx: (g) => { g.stat('健康', 3); g.stat('学识', -1); g.remember('boarding', 'walk'); }, res: '你每天來回走兩個小時。冬天出門時天上還掛著星星，路上有幾個同村的孩子和你一起走。' },
        { t: '奶奶去鎮上租房陪讀', dev: 20, cond: (g) => away(g) && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'gm'); g.move('county', '鎮上的出租屋'); }, res: '奶奶在學校後面租了一間小屋，每天早上給你煮一個雞蛋。' },
        { t: '媽媽去鎮上租房陪讀', dev: 20, cond: (g) => !away(g) && g.alive('mo') && !left(g), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'mom'); g.move('county', '鎮上的出租屋'); }, res: '媽媽在學校後面租了一間小屋，白天在鎮上的超市理貨，晚上陪你寫作業。' },
      ] },

    /* ================= 7 岁 ================= */
    { id: 'c_video_call', age: 7, t: '影片電話',
      cond: (g) => away(g),
      text: '週六晚上，媽媽打來影片。她問你想要什麼。螢幕卡了一下，她的臉停在一個笑上。',
      choices: [
        { t: '說想要一個新書包', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('askedMom', 'bag'); }, res: '過年的時候，書包是她親手揹回來的，上面印著你喜歡的動畫片。' },
        { t: '說想要她回來', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('心情', -1); g.remember('askedMom', 'home'); }, res: '那邊沉默了很久，然後說，等你再大一點。那年暑假，她請了半個月的假回來陪你。' },
        { t: '什麼也不說，把手機遞給大人', dev: 15, fx: (g) => { g.stat('心情', -2); g.remember('askedMom', 'silent'); }, res: (g) => carer(g) + '接過去，說孩子挺好的，就是不愛說話。' },
      ] },
    { id: 'c_new_kid', age: 7, t: '轉來的同學', loc: 'school',
      cond: (g) => !away(g),
      text: '班上轉來一個說話口音很重的同學。下課時，幾個人學他說話，全班都笑了。',
      choices: [
        { t: '跟著笑', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('kindness', 'laughed'); }, res: '他低著頭，把作業本翻來翻去。你笑完就忘了。' },
        { t: '下課找他一起玩', dev: 20, fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); g.remember('kindness', 'friend'); }, res: '他教你用老家話數數，你教他跳房子。你們成了好朋友。' },
        { t: '告訴老師', dev: 15, fx: (g) => { g.stat('人缘', -1); g.remember('kindness', 'teacher'); }, res: '老師在班會上說了這件事。學他說話的人少了，跟你玩的人也少了幾個。' },
      ] },

    /* ================= 8 岁 ================= */
    { id: 'c_ai_homework', age: 8, t: '作業',
      cond: (g) => notRural(g),
      text: (g) => (g.recall('kidStyle') === 'ai' ? '那個陪你長大的小盒子升級了，' : '家裡的平板裝了學習助手，') + '拍一下題目，答案和步驟就全出來了。',
      choices: [
        { t: '只讓它講思路，自己寫', canon: true, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: '你寫得慢，但寫對的都是你自己會的。' },
        { t: '照著抄，抄完去玩', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('homework', 'copy'); }, res: '作業本上全是紅勾。考試的時候，你對著卷子發愣。' },
        { t: '和它比賽，看誰算得快', dev: 25, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.stat('学识', 4); g.stat('心情', 1); g.remember('homework', 'race'); }, res: '你從來沒贏過。但你的口算成了全班第一。' },
      ] },
    { id: 'c_farm_busy', age: 8, t: '農忙',
      cond: (g) => rural(g) && !g.recall('migrated'),
      text: (g) => regionBit(g, { 东北: '秋收的時候，玉米堆成了山。', 华北: '麥收那幾天，全家人都在地裡。', 西北: '收洋芋的時候，地裡的人彎著腰一整天。', 西南: '割稻子的時候，梯田裡全是人。', 华南: '收甘蔗那幾天，家裡人天不亮就出門。', 华东: '插秧那幾天，水田裡一排排都是彎著的腰。', 华中: '收油菜籽那幾天，家裡人在曬場上忙到天黑。' }, '農忙那幾天，家裡人都在地裡。') + '作業還沒寫。',
      choices: [
        { t: '下地幫忙', canon: true, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('homework', 'farm'); }, res: '你手上起了泡。晚上就著燈泡寫作業，寫著寫著睡著了，醒來時身上多了一件外套。' },
        { t: '在家寫作業', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: (g) => '你一個人在家，把作業寫得工工整整。' + (away(g) ? carer(g) : '媽媽') + '回來看了一眼，沒說話，給你削了個蘋果。' },
        { t: '偷偷溜去河邊玩', dev: 20, fx: (g) => { g.stat('心情', 4); g.stat('学识', -1); g.remember('homework', 'river'); }, res: '你在河邊捉了一下午的小魚。回家時褲子是溼的，捱了一頓罵。那幾條小魚，晚上被煎成了一盤菜。' },
      ] },
    { id: 'c_season', age: 8, t: '這一年', auto: true,
      text: (g) => regionBit(g, {
        东北: '冬天，學校把操場澆成了冰場。體育課上，全班在冰上摔成一片，笑聲比哨子還響。',
        华北: '冬天來了暖氣，教室裡熱得只穿毛衣。窗玻璃上結著霜花，你用手指在上面畫小人。',
        西北: '學校門口的小攤賣釀皮，五塊錢一碗。你攢了三天零花錢，吃得滿嘴辣子。',
        华东: '梅雨季，教室的牆根長出一圈青苔。你的球鞋一個星期沒幹過，媽媽用吹風機給你吹了一晚上。',
        华中: '夏天熱得像蒸籠。學校裝了空調，下課了也沒人肯出教室。',
        华南: '颱風來了，學校停課兩天。你趴在窗邊看樓下的樹被吹得東倒西歪，心裡有點高興。',
        西南: rural(g) ? '下了一個星期的雨。山路滑，你上學路上摔了一跤，到學校時褲腿全是泥。同桌把自己的幹襪子借給了你。' : '霧大得看不見對面的樓。課間，你們在霧裡玩捉迷藏，誰也找不著誰。',
      }, '春天，學校組織去郊外踏青。你在草地上打了個滾，衣服綠了一片。') },

    /* ================= 9 岁：特长、随迁 ================= */
    { id: 'c_talent', age: 9, t: '特長班', loc: 'school',
      cond: (g) => !rural(g) && !away(g) && !g.recall('migrated'),
      text: (g) => (fam(g) === 'rich' ? '媽媽拿出一張表，上面有十幾個興趣班。' : '同學們週末都去上興趣班。' + parents(g) + '商量了幾晚，說可以給你報一個。') + '你選什麼？',
      choices: [
        { t: '程式設計', canon: true, fx: (g) => { g.stat('学识', 3); g.stat('财富', -1); g.remember('talent', 'code'); g.info('特長', '程式設計'); }, res: '你讓螢幕上的小貓走了十步。你覺得自己什麼都能做出來。' },
        { t: '畫畫', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('财富', -1); g.remember('talent', 'art'); g.info('特長', '畫畫'); }, res: '你畫的貓被老師貼在了牆上。' },
        { t: '籃球或者游泳', dev: 15, fx: (g) => { g.stat('健康', 4); g.remember('talent', 'sport'); g.info('特長', '體育'); }, res: '你長高了一大截，曬得黑黑的。' },
        { t: '什麼都不報，週末想睡覺', dev: 20, fx: (g) => { g.stat('心情', 4); g.remember('talent', 'none'); }, res: '同學們週末都在上課，你在睡覺。你覺得自己賺了。' },
      ] },
    { id: 'c_follow_parents', age: 9, t: '進城',
      cond: (g) => away(g),
      text: (g) => '爸媽在' + pcity(g) + '打工。過年時他們問你：想不想跟去城裡讀書？那邊的學校不好進，房子也小。'
        + (g.recall('askedMom') === 'home' ? '媽媽說，她一直記著你那年在影片裡說的話。' : ''),
      choices: [
        { t: '留在老家', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('migrated', false); }, res: (g) => carer(g) + '說你懂事。爸媽初六走的時候，你送到了村口，手裡攥著媽媽塞給你的兩百塊錢。' },
        { t: '跟爸媽去城裡', dev: 25, fx: (g) => {
          const c = pcity(g);
          g.remember('migrated', true); g.remember('school', 'weak');
          CN.goCity(g, ['北京', '上海', '廣州', '深圳'].includes(c) ? 1 : 2, c);
          g.move('metro', c + ' · 城中村');
          CN.moveOut(g, ['gp', 'gm']); CN.liveWith(g, ['fa', 'mo']);
          g.stat('心情', 3); g.stat('学识', 1);
        }, res: (g) => '你第一次坐了高鐵。爸媽在' + g.recall('workCity') + '的城中村租了一間屋，你上了一所專收外地孩子的學校。' + carer(g) + '一個人留在老家，每天晚上打一個電話問你吃了沒有。' },
      ] },
    { id: 'c_teacher_volunteer', age: 9, t: '支教老師', loc: 'school',
      cond: (g) => rural(g) && !away(g) && !g.recall('migrated'),
      text: '學校來了一個從大城市來支教的年輕老師。她會畫畫，會彈琴，還會講外面的事。',
      choices: [
        { t: '上課認真聽，下課就回家', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('talent', 'none'); }, res: '一年後她走了。走之前給每個人發了一支鉛筆，鉛筆上刻著每個人的名字。' },
        { t: '天天纏著她學畫', dev: 20, fx: (g) => { g.stat('心情', 3); g.remember('talent', 'art'); g.info('特長', '畫畫'); g.rel('恩師', '支教的林老師'); }, res: '她走的時候送了你一盒水彩。你用了很多年，捨不得用完。' },
        { t: '問她外面的城市是什麼樣的', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('talent', 'dream'); }, res: '她給你看了很多照片。那天晚上，你夢見自己站在一棟很高的樓上。' },
      ] },

    /* ================= 10 岁 ================= */
    { id: 'c_parents_fight', age: 10, t: '吵架',
      cond: (g) => ['worker', 'smallbiz', 'white'].includes(fam(g)) && !left(g),
      text: (g) => ({ smallbiz: '那一年店裡生意不好，', worker: '那一年廠裡減了班，', white: '那一年爸爸的公司裁了一批人，' }[fam(g)] || '那一年家裡不順，') + '爸媽常常半夜吵架。有一天，媽媽問你：要是我們分開，你跟誰？',
      choices: [
        { t: '捂著耳朵說“我不知道”', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('parentsSplit', false); }, res: '他們沒再問。後來也沒分開。有天你放學回家，看見爸爸繫著圍裙在廚房裡炒菜，媽媽在旁邊指揮。' },
        { t: '哭著讓他們別分開', dev: 15, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -2); g.remember('parentsSplit', false); g.remember('glue', true); }, res: '爸爸蹲下來抱了你很久。那天以後，吵架的聲音小了。' },
        { t: '說“分開吧，你們都別哭了”', dev: 30, fx: (g) => {
          g.stat('心情', -4); g.stat('学识', 2); g.remember('parentsSplit', true);
          g.info('家庭', '父母離異'); g.unrel('父親'); g.rel('父親', 'fa', '不和你們住了');
          CN.moveOut(g, ['fa', 'gp', 'gm']);
        }, res: '那年冬天，他們離了婚。爸爸搬了出去，你跟媽媽住，每個月見一次爸爸。你一下子長大了好幾歲。' },
      ] },
    { id: 'c_olympiad', age: 10, t: '奧數班', loc: 'school',
      cond: (g) => ['civil', 'rich'].includes(fam(g)) && !left(g),
      text: '老師說你腦子快，建議去上奧數班。週末要上兩天課。',
      choices: [
        { t: '去', canon: true, fx: (g) => { g.stat('学识', 4); g.stat('心情', -3); g.remember('olympiad', true); }, res: '你的週末沒了。你認識了很多和你一樣腦子快的孩子，也第一次知道自己不是最快的。' },
        { t: '不去，週末去爺爺家', dev: 20, cond: (g) => g.alive('gp'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: '爺爺教你下象棋。你輸了一整個夏天，到秋天終於贏了一盤，爺爺高興得給你買了一根雪糕。' },
        { t: '不去，週末去奶奶家', dev: 20, cond: (g) => !g.alive('gp') && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: '奶奶教你包餃子。你包的餃子一下鍋就散，奶奶全撈到自己碗裡吃了。' },
        { t: '不去，週末想自己看書', dev: 20, cond: (g) => !g.alive('gp') && !g.alive('gm'), fx: (g) => { g.stat('学识', 2); g.stat('心情', 3); g.remember('olympiad', false); }, res: '你在圖書館的角落裡坐了一整個夏天，看完了一整排的科普書。' },
      ] },
    { id: 'c_river', age: 10, t: '河',
      cond: (g) => ['farmer', 'migrant'].includes(fam(g)) && !g.recall('migrated'),
      text: '暑假，幾個孩子約著去河裡游泳。大人說過很多遍，河裡淹死過人。',
      choices: [
        { t: '不去，在家看電視', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('river', 'no'); }, res: '那天下午，你聽見有人在村裡喊。後來聽說，河裡出了事，人救上來了。' },
        { t: '去，就在淺水邊玩', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('心情', 3); g.remember('river', 'swim'); }, res: '水很涼。你學會了狗刨，再也沒告訴過大人。' },
        { t: '去，看見有個小孩往深水走，趕緊去拉', dev: 30, check: ['健康', 55], fx: (g) => { g.stat('人缘', 6); g.remember('river', 'saved'); g.set('childSavedKid'); }, res: '你把他拖上了岸，自己嗆了好幾口水。他家裡人提著一籃雞蛋來你家，站了很久。',
          fail: { fx: (g) => { g.stat('健康', -8); g.remember('river', 'nearly'); }, res: '你拉住了他，自己卻被衝開。是路過的大人把你們倆都撈了上來。你發了三天燒。', dev: 10 } },
      ] },
    { id: 'c_city_village', age: 10, t: '放學以後',
      cond: (g) => !!g.recall('migrated'),
      text: (g) => '你在' + (g.recall('workCity') || '城裡') + '的城中村住了一年。爸爸在工地，媽媽在電子廠，都是天黑了才回來。放學到天黑這幾個小時，你得自己安排。',
      choices: [
        { t: '去樓下小賣部寫作業', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('cityKid', 'shop'); }, res: '老闆娘給你留了一張小桌子。你學會了找零錢，也學會了說幾句本地話。' },
        { t: '去社群的免費託管班', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('cityKid', 'class'); }, res: '託管班是幾個大學生志願者辦的。一個戴眼鏡的姐姐教你做題，說你腦子快。' },
        { t: '和樓裡的孩子滿巷子跑', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('健康', 1); g.remember('cityKid', 'roam'); }, res: '你們把每條巷子都跑熟了。哪家的狗兇、哪家的燒餅香，你閉著眼都知道。' },
      ] },

    /* ================= 11 岁：小升初 ================= */
    { id: 'c_xiaoshengchu', age: 11, t: '小升初', loc: 'school',
      cond: (g) => notRural(g) && !g.recall('migrated'),
      text: (g) => '要升初中了。' + (hk(g) === 'county' ? '縣裡最好的初中要考試，' : cityName(g) + '有幾所好初中要搖號，有一所私立的要考試，') + '其他的就近入學。',
      choices: [
        { t: '就近入學', canon: true, fx: (g) => { g.remember('school', g.recall('school') === 'key' ? 'key' : 'normal'); g.remember('xsc', 'near'); }, res: '你和小學的一半同學升進了同一所初中。' },
        { t: '去考那所好學校', dev: 15, check: ['学识', 62], fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'exam'); g.stat('心情', 3); }, res: (g) => '你考上了。放榜那天，' + parents(g) + '帶你下了一回館子，點了你最愛吃的菜。',
          fail: { fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'failed'); g.stat('心情', -3); }, res: '差了幾分。你哭了一晚上，第二天照常去了家門口的初中。', dev: 5 } },
        { t: '花錢去私立初中', dev: 20, cond: (g) => ['rich', 'civil'].includes(fam(g)), fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'paid'); g.stat('财富', -6); }, res: '學費一年好幾萬。媽媽說，這錢花得值。' },
      ] },
    { id: 'c_town_middle', age: 11, t: '上初中', loc: 'school',
      cond: (g) => !notRural(g) || g.recall('migrated'),
      text: (g) => g.recall('migrated')
        ? '你在城裡沒有戶口，初中只能讀民辦的，以後中考也要回老家考。' + ({ shop: '小賣部的老闆娘聽說你可能要走，塞給你一包糖。', class: '託管班的姐姐說，不管在哪兒讀，都要好好念。' }[g.recall('cityKid')] || '')
        : '要上初中了。鎮中學就在家門口，縣城的初中要考試，考上了要住校。',
      choices: [
        { t: '讀鎮中學', canon: true, cond: (g) => !g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'near'); }, res: '鎮中學的教室還是老樣子，窗戶漏風。新來的數學老師是本鎮人，大學畢業又回來了。' },
        { t: '去考縣城的初中', dev: 20, cond: (g) => !g.recall('migrated'), check: ['学识', 55],
          fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'exam'); g.move('county', '縣城中學'); g.stat('心情', 2); }, res: '你考上了縣城的初中，第一次住進了六個人一間的宿舍。',
          fail: { fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'failed'); }, res: '沒考上。你在鎮中學讀了下去。', dev: 5 } },
        { t: '回老家讀初中，以後好考試', canon: true, cond: (g) => !!g.recall('migrated') && (g.alive('gp') || g.alive('gm')),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => '你又回到了' + carer(g) + '身邊。城裡的同學說會常聯絡，後來只發了幾條訊息。' + carer(g) + '把你小時候睡的床又鋪好了。' },
        { t: '回老家讀初中，家裡大人陪你回去', canon: true, cond: (g) => !!g.recall('migrated') && !g.alive('gp') && !g.alive('gm'),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => carer(g) + '辭了城裡的活，陪你回了老家。老房子收拾了三天，才又像個家。' },
        { t: '留在城裡讀民辦，到時候再說', dev: 20, cond: (g) => !!g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'stay'); g.stat('心情', 2); }, res: '你留在了城裡。只是同學們一個個回了老家，教室越來越空。' },
      ] },

    /* ================= 12 岁：手机 ================= */
    { id: 'c_phone', age: 12, t: '第一部手機',
      text: (g) => (away(g) ? '爸媽寄回來一部舊手機，說這樣能天天影片。' : '上初中了，' + parents(g) + '給你買了一部手機。') + '同學們都在刷短影片、打遊戲。',
      choices: [
        { t: '刷影片、打遊戲，停不下來', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('学识', -3); g.remember('phone', 'game'); }, res: '你的段位越來越高，成績越來越低。' },
        { t: '用來查資料、看網課', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('phone', 'study'); }, res: '你在網上聽了很多好老師的課。你發現世界上有的是比你們老師講得好的人。' },
        { t: '交給大人保管，週末才拿', dev: 25, fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); g.remember('phone', 'locked'); }, res: (g) => '你把手機交給了' + (away(g) ? carer(g) : parents(g)) + '。同學們聊的梗你都聽不懂，可你的作業總是第一個寫完。' },
      ] },
    { id: 'c_junior_start', age: 12, t: '初一', auto: true,
      fx: (g) => { CN.setEdu(g, 'primary', '小學'); g.stat('学识', 1); },
      text: (g) => ({ key: '你進了一所好初中。第一次月考，你從小學的前幾名掉到了中游。', normal: '你上了初中。課程一下子多了好幾門。', weak: '初中的老師換得勤，英語老師一學期換了三個。第三個留了下來，她說要把你們帶到畢業。' }[g.recall('school') || 'normal'])
        + (g.recall('xsc') === 'failed' ? '差的那幾分，你記了很久。' : '')
        + (g.recall('deskmate') === 'friend' ? '小學的同桌又和你分在了一個班。' : g.recall('deskmate') === 'leader' ? '新班主任看了你的檔案，又讓你當了班長。' : '') },
    { id: 'c_cook', age: 12, t: '一頓飯', auto: true,
      fx: (g) => g.stat('人缘', 1),
      text: (g) => {
        const who = away(g) ? carer(g) : parents(g);
        return '你第一次自己做了一頓飯：' + (north(g) ? '一鍋西紅柿雞蛋麵，面煮得有點坨。' : '番茄炒蛋，鹽放多了。') + who + '吃得一點不剩，說比外面賣的好吃。';
      } },
    { id: 'c_pet_old', age: 12, t: '它', auto: true,
      cond: (g) => ['kept', 'fed'].includes(g.recall('kidPet')),
      text: (g) => (g.recall('kidPet') === 'kept'
        ? (rural(g) ? petName(g) + '長成了一條大狗，每天傍晚蹲在村口等你放學。你一走近，它的尾巴就把地掃得啪啪響。' : petName(g) + '胖了一大圈，每天晚上擠到你的作業本上睡覺，趕都趕不走。')
        : '你小時候餵過的那隻' + petKind(g) + '，後來被一戶人家收養了。有一回你在路上遇見它，它看了你一眼，好像還認得。') },

    /* ================= 13 岁 ================= */
    { id: 'c_crush', age: 13, t: '喜歡', loc: 'school',
      cond: (g) => g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak'),
      text: (g) => '你開始注意班上的一個' + (isMale(g) ? '女生' : '男生') + '。傳紙條的時候，你的手心全是汗。',
      choices: [
        { t: '什麼也不說，好好學習', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('crush', 'hidden'); }, res: '你把那個名字寫在草稿紙上，寫滿了又撕掉。' },
        { t: '寫一封信', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('crush', 'told'); }, res: '信被班主任沒收了。你們被叫到辦公室，出來以後一起笑了很久。' },
        { t: '約著一起考同一所高中', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', 2); g.remember('crush', 'pact'); }, res: '你們拉了鉤。每天晚自習，你都多做一張卷子。' },
      ] },
    { id: 'c_bully', age: 13, t: '廁所門口', loc: 'school',
      cond: (g) => !(g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak')),
      text: (g) => '學校裡有幾個高年級的人，常常在廁所門口堵人要錢。' + (g.recall('kindness') === 'friend' ? '今天被堵的，是當年那個口音很重的同學。' : '今天被堵的，是你們班最瘦的那個。'),
      choices: [
        { t: '繞開走', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('bully', 'away'); }, res: '那天你一直聽見身後的聲音。' },
        { t: '上去拉人', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 4); g.remember('bully', 'stood'); }, res: '你捱了幾下，他們也走了。那個同學把攢了很久的零食都塞給了你。',
          fail: { fx: (g) => { g.stat('健康', -6); g.remember('bully', 'beaten'); }, res: '你被打得鼻子流血。老師來的時候，那幾個人早跑了。那個同學一路扶著你去了醫務室。', dev: 10 } },
        { t: '跑去叫老師', dev: 15, fx: (g) => { g.stat('人缘', 1); g.remember('bully', 'teacher'); }, res: '老師來了，那幾個人被記了處分。後來學校在廁所門口裝了一個攝像頭，再沒人在那兒堵人。' },
      ] },

    /* ================= 14 岁：初三 ================= */
    { id: 'c_back_14', age: 14, t: '回老家', auto: true,
      cond: (g) => !!g.recall('migrated'),
      fx: (g) => { returnHome(g); g.remember('school', 'weak'); },
      text: (g) => '中考要回戶籍所在地考。初三開學前，你回到了' + home(g) + '。' + (g.recall('momBack') ? carer(g) + '跟著你回來了，在鎮上找了份活。' : '爸媽把你送回' + carer(g) + '身邊，又回了城裡。')
        + (g.recall('cityKid') === 'roam' ? '你把城中村每條巷子的樣子，講給新同學聽。' : '老家的課本和城裡的不一樣，你花了一個月才跟上。') },
    { id: 'c_grade9', age: 14, t: '初三', loc: 'school',
      text: (g) => '初三了。黑板角上寫著離中考還有多少天。' + (g.recall('crush') === 'pact' ? '你想起那個拉過鉤的約定。' : '') + (rural(g) ? '班上有幾個同學已經不來了，說是出去打工了。' : '老師說，中考一半人上普高，一半人去職高。'),
      choices: [
        { t: '拼了，每天學到半夜', canon: true, fx: (g) => { g.stat('学识', 5); g.stat('健康', -3); g.stat('心情', -2); g.remember('push', 'hard'); }, res: (g) => '你的眼鏡度數漲了兩百度。成績也漲了。' + (away(g) ? carer(g) : parents(g)) + '每天晚上給你端來一杯熱牛奶。' },
        { t: '照常學，該睡就睡', dev: 15, fx: (g) => { g.stat('学识', 2); g.stat('健康', 1); g.remember('push', 'normal'); }, res: '你沒熬夜，成績也沒掉。' },
        { t: '不想讀了，想早點出去掙錢', dev: 25, cond: (g) => ['farmer', 'migrant', 'worker'].includes(fam(g)) || g.s('学识') < 45, fx: (g) => { g.stat('心情', 2); g.stat('学识', -3); g.remember('push', 'quit'); }, res: '你上課開始看窗外。你在算，進廠一個月能掙多少錢。' },
      ] },
    { id: 'c_grandpa_ill', age: 14, t: '爺爺', auto: true,
      cond: (g) => g.alive('gp') && rural(g),
      fx: (g) => g.stat('人缘', 1),
      text: (g) => CN.who(g, 'gp', true) + '腰彎得更厲害了。' + (CN.livesWith(g, 'gp') || !g.recall('migrated')
        ? '他還是天天去地裡，回來就坐在門檻上，問你考得怎麼樣。你說還行，他就笑。'
        : '他在電話裡問你考得怎麼樣。你說還行，他在那頭笑出了聲。') },

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
        atSchool(g, '中考考場');
      },
      text: (g) => ({ high: '中考放榜，你考得很好，夠得上最好的高中。', mid: '中考放榜，你的分數夠上普通高中，離好高中差一截。', low: '中考放榜，你的分數沒過普高線。' }[g.recall('zkScore')]) },
    { id: 'c_zhongkao', age: 15, t: '填志願',
      text: (g) => {
        const z = g.recall('zkScore');
        if (z === 'high') return '班主任打電話來，問你填哪所高中。';
        if (z === 'low') return '班主任說，職高也是條路，學門手藝，好找工作。';
        if (away(g)) return '爸媽在電話裡一遍遍地問你的分數，又讓' + carer(g) + '把分數表拍下來發過去。';
        if (g.recall('parentsSplit')) return '媽媽拿著分數表，給爸爸打了一個電話。兩個人難得心平氣和地商量了一回。';
        return parents(g) + '看著那張分數表，商量了好幾個晚上。';
      },
      choices: [
        { t: '上最好的那所高中', canon: true, cond: (g) => g.recall('zkScore') === 'high', fx: (g) => { CN.setEdu(g, 'senior', '高中在讀'); g.remember('school', 'key'); g.remember('hs', 'key'); g.stat('心情', 3); }, res: (g) => '錄取通知書寄到家裡，' + (away(g) ? carer(g) + '把它拍了照，發給了外地的爸媽。' : parents(g) + '把它拍了照發到了親戚群裡。') },
        { t: '上普通高中', canon: true, cond: (g) => g.recall('zkScore') === 'mid', fx: (g) => { CN.setEdu(g, 'senior', '高中在讀'); g.remember('school', 'normal'); g.remember('hs', 'normal'); }, res: (g) => '你進了' + (hk(g) === 'city' ? '市裡' : '縣裡') + '的一所普通高中。三年以後，還有一次機會。' },
        { t: '去普通高中，拿全額獎學金', dev: 20, cond: (g) => g.recall('zkScore') === 'high' && ['farmer', 'migrant', 'worker'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', '高中在讀'); g.remember('school', 'normal'); g.remember('hs', 'scholar'); g.stat('财富', 4); }, res: '學校免了你的學費，還每月發生活費。你是那所學校當年招的最高分。' },
        { t: '去職高，學一門手藝', canon: true, cond: (g) => g.recall('zkScore') === 'low', fx: (g) => { CN.setEdu(g, 'vocational', '職高在讀'); g.remember('school', 'weak'); g.remember('hs', 'voc'); }, res: '你去了縣裡的職業學校。第一天，你看見實訓車間裡擺著一排排機器，心裡鬆了一口氣。' },
        { t: '去職高，學自己喜歡的專業', dev: 25, cond: (g) => g.recall('zkScore') !== 'low', fx: (g) => { CN.setEdu(g, 'vocational', '職高在讀'); g.remember('school', 'normal'); g.remember('hs', 'vocChoice'); g.stat('心情', 4); }, res: '老師和家裡人都勸你。你說，我就想學這個。' },
        { t: '花錢上私立高中', dev: 15, cond: (g) => g.recall('zkScore') !== 'high' && ['rich', 'civil', 'smallbiz'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', '高中在讀'); g.remember('school', 'normal'); g.remember('hs', 'private'); g.stat('财富', -8); }, res: (g) => '一年的學費抵得上' + parents(g) + '半年的收入。媽媽說，砸鍋賣鐵也要讓你讀高中。' },
        { t: '不讀了，出去打工', dev: 20, cond: (g) => g.recall('zkScore') === 'low' || g.recall('push') === 'quit', fx: (g) => { CN.setEdu(g, 'junior', '初中'); g.remember('hs', 'work'); g.stat('财富', 2); }, res: '你把課本賣給了收廢品的，只留下一本語文書。那年夏天，你去了縣城的一家飯館幫工。' },
      ] },

    /* ================= 16 岁 ================= */
    { id: 'c_hs_track', age: 16, t: '選科', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: '高一下學期要選科了。物理、歷史二選一，後面再選兩門。你的同桌已經填好了。',
      choices: [
        { t: '選物理，以後專業多', canon: true, fx: (g) => { g.remember('track', 'sci'); g.stat('学识', 2); }, res: '你每天和受力分析較勁。老師說，選物理的路寬。' },
        { t: '選歷史，自己喜歡', dev: 15, fx: (g) => { g.remember('track', 'arts'); g.stat('心情', 3); }, res: '你喜歡讀那些舊事。你覺得過去的人和現在的人差不多。' },
        { t: '聽家裡的，他們說考公好考', dev: 10, fx: (g) => { g.remember('track', 'arts'); g.remember('parentsPlan', 'civil'); g.stat('人缘', 2); }, res: (g) => parents(g) + '很滿意。你在志願表上寫下“歷史”的時候，沒多想。' },
      ] },
    { id: 'c_voc_major', age: 16, t: '專業', loc: 'school',
      cond: (g) => g.recall('edu') === 'vocational',
      text: '職高要分專業了。牆上貼著幾個熱門專業的就業率。',
      choices: [
        { t: '汽修或機電，好找工作', canon: true, fx: (g) => { g.remember('vocMajor', 'mech'); g.stat('健康', 1); g.info('專業', '機電'); }, res: '你的指甲縫裡從此總有洗不掉的油。第一次把一臺發動機裝回去打著了火，你在車間裡叫出了聲。' },
        { t: '護理或幼教', dev: 10, fx: (g) => { g.remember('vocMajor', 'care'); g.stat('人缘', 3); g.info('專業', '護理'); }, res: '你學會了量血壓、扎針。老師說，以後老人越來越多，這行缺人。' },
        { t: '電商直播', dev: 15, fx: (g) => { g.remember('vocMajor', 'ecom'); g.stat('心情', 2); g.info('專業', '電商'); }, res: '你對著鏡頭說了第一句“家人們”，自己先笑場了。' },
        { t: '工業機器人維修', dev: 15, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.remember('vocMajor', 'robot'); g.stat('学识', 3); g.info('專業', '機器人維修'); }, res: '實訓室裡那臺機械臂比你還高。你第一次讓它動起來的時候，全班都在鼓掌。' },
      ] },
    { id: 'c_first_job', age: 16, t: '第一份工',
      cond: (g) => g.recall('hs') === 'work',
      text: '你十六歲了，可以正經出去幹活了。表哥說廠裡在招人，飯館的老闆也說你可以留下學廚。',
      choices: [
        { t: '跟表哥去南方進廠', canon: true, fx: (g) => { const c = CN.goCity(g, 2, CN.pick(['東莞', '蘇州', '佛山', '寧波'])); CN.setJob(g, 'worker', '工廠流水線'); g.move('factory', c + ' · 電子廠'); g.stat('财富', 3); g.stat('健康', -2); }, res: (g) => '你在' + g.recall('workCity') + '的流水線上一站就是十二個小時。第一個月發了錢，你寄了一半回家，剩下的請表哥吃了一頓燒烤。' },
        { t: '留在飯館學廚', dev: 15, fx: (g) => { CN.setJob(g, 'shop', '飯館學徒'); g.move('county', '縣城 · 飯館後廚'); g.remember('craft', 'cook'); g.stat('人缘', 2); }, res: '師傅脾氣很差，刀工很好。你切壞了三十斤土豆，才學會切絲。師傅嘴上罵，收工時給你多盛了一碗飯。' },
        { t: '跟村裡的叔叔學手藝', dev: 20, fx: (g) => { CN.setJob(g, 'worker', '學徒'); g.remember('craft', CN.pick(['tile', 'electric', 'weld'])); CN.goHome(g); g.stat('健康', 2); }, res: '你跟著叔叔走村串戶，裝水電、貼瓷磚。叔叔說，手藝在身上，餓不死。' },
      ] },

    /* ================= 17 岁 ================= */
    { id: 'c_hs_path', age: 17, t: '高二', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: (g) => {
        const t = g.recall('talent');
        const bit = t === 'art' ? '美術老師問你要不要走藝考。' : t === 'sport' ? '體育老師問你要不要走體考。' : t === 'code' || g.recall('olympiad') ? '數學老師問你要不要去搞競賽。' : '班主任說，最後一年半，拼的是基本功。';
        return '高二快結束了。' + bit;
      },
      choices: [
        { t: '老老實實準備高考', canon: true, fx: (g) => { g.remember('hsPath', 'normal'); g.stat('学识', 3); }, res: '你的桌上摞起了一人高的卷子。' },
        { t: '報個補習班，補最差的那門', dev: 10, cond: (g) => fam(g) !== 'rich', fx: (g) => { g.remember('hsPath', 'tutor'); g.stat('学识', 4); g.stat('财富', -3); g.stat('心情', -1); }, res: '補習班在一棟舊樓的五樓，晚上十點才下課。那門課的分數，終於不拖後腿了。' },
        { t: '走藝考', dev: 20, cond: (g) => g.recall('talent') === 'art', fx: (g) => { g.remember('hsPath', 'art'); g.stat('心情', 3); g.stat('财富', -4); }, res: '你去省城的畫室集訓了半年，每天畫十個小時。' },
        { t: '走體考', dev: 20, cond: (g) => g.recall('talent') === 'sport', fx: (g) => { g.remember('hsPath', 'sport'); g.stat('健康', 5); }, res: '你每天跑二十圈。你的腿上全是肌肉，書包裡還是那些卷子。' },
        { t: '搞競賽，賭一把保送', dev: 25, cond: (g) => g.recall('talent') === 'code' || !!g.recall('olympiad'), check: ['学识', 70], fx: (g) => { g.remember('hsPath', 'olympiad'); g.stat('学识', 6); g.stat('心情', 3); }, res: '你拿了省一等獎。幾所好大學的老師來找你談話。',
          fail: { fx: (g) => { g.remember('hsPath', 'normal'); g.stat('心情', -4); g.stat('学识', 1); }, res: '你差一點。回到教室時，別人已經複習完一輪了。同桌把整理好的筆記推到了你面前。', dev: 5 } },
        { t: '不想考了，想出國', dev: 20, cond: (g) => fam(g) === 'rich' && !g.recall('olympiad'), fx: (g) => { g.remember('hsPath', 'abroad'); g.stat('财富', -5); g.stat('学识', 2); }, res: '你開始考語言成績，申請國外的大學。同學們在刷題，你在寫文書。' },
      ] },
    { id: 'c_voc_intern', age: 17, t: '實習', loc: 'factory',
      cond: (g) => g.recall('edu') === 'vocational',
      text: (g) => '職高最後一年是實習。' + ({ mech: '你被分到一家汽車配件廠。', care: '你被分到市裡的一家養老院。', ecom: '你被分到一家做直播帶貨的小公司。', robot: '你被分到一家自動化工廠，修機械臂。' }[g.recall('vocMajor')] || '你被分到一家工廠。') + '老師說，還可以準備“職教高考”，考高職。',
      choices: [
        { t: '實習完留下來幹', canon: true, fx: (g) => { g.remember('vocPlan', 'work'); g.stat('财富', 2); g.stat('事业', 2); }, res: '老闆說你手腳麻利，畢業就可以來上班。' },
        { t: '準備考高職（大專）', dev: 20, fx: (g) => { g.remember('vocPlan', 'college'); g.stat('学识', 4); }, res: '你白天實習，晚上在宿舍做題。宿舍裡只有你的燈亮著。' },
      ] },
    { id: 'c_work_17', age: 17, t: '一年以後',
      cond: (g) => g.recall('hs') === 'work',
      text: (g) => (g.recall('job') === 'worker' && !g.recall('craft') ? '流水線上的活，你閉著眼睛都能做了。' : '師傅說你出師還早。') + '工友裡有人在攢錢學技術，有人說要去大城市送外賣，掙得多。',
      choices: [
        { t: '接著幹，攢錢', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('workPlan', 'stay'); CN.earn(g, 6000); }, res: (g) => '你一個月只花六七百塊。年底一算，手裡有 ' + CN.fmt(CN.cash(g)) + '，你把這個數看了好幾遍。' },
        { t: '報個夜校，學技術', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('workPlan', 'study'); CN.pay(g, 3000); }, res: (g) => '學費 ' + CN.fmt(3000) + '。你下了班去上課，在課上打瞌睡，又被自己掐醒。' },
        { t: '去大城市闖闖', dev: 20, fx: (g) => { const c = CN.goCity(g, 1); CN.setJob(g, 'rider', '外賣騎手'); g.stat('健康', -2); g.remember('workPlan', 'city'); g.move('metro', c); }, res: (g) => '你到了' + g.recall('workCity') + '，租了一張床位，騎上了電動車。這座城市比你想的大得多。' },
      ] },
    { id: 'c_gaokao_eve', age: 17, t: '最後一個暑假', auto: true,
      cond: (g) => g.recall('edu') === 'senior',
      fx: (g) => g.stat('学识', 1),
      text: (g) => (g.recall('hsPath') === 'abroad' ? '你收到了國外大學的錄取郵件。' : '高三開學前的那個暑假，你只放了七天。')
        + (g.recall('track') === 'sci' ? '物理老師說你的電磁學還差點火候。' : g.recall('track') === 'arts' ? '你把歷史書上的年份編成了順口溜。' : '')
        + (g.recall('parentsPlan') === 'civil' ? '爸媽已經開始打聽公務員考試要考什麼了。' : '')
        + (g.recall('crush') === 'pact' ? '那個和你拉過鉤的人，和你分在了同一個班。' : '') },

    /* ---------- 更多自动节点：让每个童年有血有肉 ---------- */
    { id: 'c_older_sib', age: 3, t: '哥哥姐姐', auto: true,
      cond: (g) => !!olderSib(g),
      fx: (g) => g.stat('人缘', 2),
      text: (g) => { const s = olderSib(g); return (s.sex === '男' ? '哥哥' : '姐姐') + s.name + '放學回來，第一件事是把你抱起來轉圈。' + (left(g) ? '爸媽不在家，' + (s.sex === '男' ? '他' : '她') + '像半個大人。' : ''); } },
    { id: 'c_june_show', age: 5, t: '六一', auto: true,
      cond: (g) => g.recall('kinder') !== 'none',
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.recall('kinder') === 'bilingual' ? '幼兒園的六一匯演，你演了一棵會說英語的樹。' : '六一兒童節，你臉上點了紅點，站在第二排跳舞。') + (away(g) ? carer(g) + '舉著手機錄影，錄了一半沒電了。' : '臺下的爸媽舉著手機，比你還緊張。') },
    { id: 'c_first_award', age: 7, t: '期末', auto: true,
      fx: (g) => { const good = g.s('学识') >= 45; g.remember('firstAward', good); g.stat('心情', good ? 3 : -1); },
      text: (g) => (g.recall('firstAward') ? '一年級期末，你拿回來一張“三好學生”的獎狀。' + (away(g) ? carer(g) + '把它貼在堂屋正中間，來人就指給人看。' : '爸媽把它貼在了冰箱上。') : '一年級期末，你的數學沒考及格。你把卷子藏在了書包最底下。第二學期，同桌每天課間教你一道題。') },
    { id: 'c_summer_visit', age: 8, t: '暑假', auto: true,
      cond: (g) => away(g),
      fx: (g) => { g.stat('心情', 3); g.stat('学识', 1); },
      text: (g) => '暑假，爸媽把你接到' + pcity(g) + '住了半個月。他們白天上班，你在出租屋裡看電視，等他們下班。最後一天，他們帶你去了一次' + (seaCity(pcity(g)) ? '海邊。你第一次看見海，' : '遊樂場。你第一次坐了摩天輪，') + '記了很多年。' },
    { id: 'c_new_home', age: 9, t: '搬家', auto: true,
      cond: (g) => ['white', 'civil', 'rich'].includes(fam(g)) && !rural(g) && !left(g),
      fx: (g) => { const moved = g.rnd() < 0.5; g.remember('newHome', moved); if (moved) { g.stat('心情', 2); g.stat('财富', -3); } },
      text: (g) => (g.recall('newHome')
        ? (g.recall('school') === 'key' ? '家裡在新區買了房子，你有了自己的房間。上學遠了，爸爸每天早上開車送你。爸媽說房貸要還二十年。' : '家裡換了房子。新房子離學校近，你有了自己的房間。爸媽說房貸要還二十年。')
        : '同學們一個個搬進了新小區。你家還住在老房子裡，樓道里的燈壞了一年。後來是你和爸爸一起把燈泡換上的。') },
    { id: 'c_glasses', age: 10, t: '近視', auto: true,
      fx: (g) => { const my = g.recall('kidStyle') === 'ai' || g.recall('homework') === 'copy' || g.rnd() < 0.45; g.remember('glasses', my); if (my) g.stat('健康', -1); },
      text: (g) => (g.recall('glasses') ? '體檢的時候，你看不清視力表的第三行了。你配了第一副眼鏡，世界一下子清楚得嚇人。' : '體檢的時候，你的視力還是 5.0。班上一半的同學戴上了眼鏡。') },
    { id: 'c_ai_class', age: 11, t: '新課', auto: true,
      fx: (g) => g.stat('学识', 1),
      text: (g) => (rural(g) && !g.recall('migrated') ? '鎮上的學校裝了一塊大螢幕，城裡的老師在螢幕那頭給你們上課。訊號不好的時候，老師的臉會變成馬賽克。' : '學校開了一門新課，教你們怎麼跟 AI 說話，怎麼分辨它說的是真是假。') },
    { id: 'c_sports_day', age: 11, t: '運動會', auto: true,
      fx: (g) => { const run = g.s('健康') >= 70 || g.recall('talent') === 'sport'; g.remember('sportsDay', run); if (run) g.stat('人缘', 2); },
      text: (g) => (g.recall('sportsDay') ? '運動會上，你跑了八百米，拿了第二名。全班都在終點等你。' : '運動會上，你負責在看臺上喊加油，喊啞了嗓子。') },
    { id: 'c_growing', age: 13, t: '長大', auto: true,
      fx: (g) => g.stat('健康', 1),
      text: (g) => (isMale(g) ? '你的聲音變粗了，嘴唇上冒出一層絨毛。一個暑假，你長高了八釐米。' : '你一個暑假長高了好幾釐米。')
        + (away(g) ? '媽媽從外地寄回來一件新外套，袖子長了一截，' + carer(g) + '說留著明年穿。' : isMale(g) ? '' : '媽媽帶你去買新衣服，你第一次自己挑顏色。') },
    { id: 'c_gm_ill', age: 13, t: '奶奶病了', auto: true,
      cond: (g) => away(g) && g.alive('gm') && CN.livesWith(g, 'gm'),
      fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); },
      text: (g) => CN.who(g, 'gm', true) + '病了一場，躺了半個月。你學會了煮粥、熬藥，週末陪她去鎮上打針。爸媽打電話回來，你說奶奶好著呢。半個月後，她又能下地餵雞了。' },
    { id: 'c_shop_closed', age: 14, t: '店', auto: true,
      cond: (g) => fam(g) === 'smallbiz',
      fx: (g) => { const bad = g.rnd() < 0.4; g.remember('shopClosed', bad); if (bad) { g.stat('财富', -6); g.stat('心情', -2); } else g.stat('财富', 2); },
      text: (g) => (g.recall('shopClosed') ? '家裡的小店關門了。網上什麼都能買，來店裡的人越來越少。半年後，爸爸在網上把貨重新賣了起來，生意小了，人倒是天天在家吃晚飯了。' : '家裡的小店還開著，你放學後在櫃檯後面寫作業，順便幫著收錢。') },
    { id: 'c_id_card', age: 16, t: '身份證', auto: true,
      fx: (g) => g.stat('心情', 1),
      text: (g) => '你辦了第一張身份證。照片上的你繃著臉，' + (g.recall('glasses') ? '摘了眼鏡，眼睛有點虛。' : '頭髮是前一天剛剪的。') + (g.recall('hs') === 'work' ? '有了它，你可以正經籤勞動合同了。' : '') },
    { id: 'c_hs_start', age: 16, t: '開學', auto: true,
      cond: (g) => ['senior', 'vocational'].includes(g.recall('edu')),
      fx: (g) => { if (g.recall('edu') === 'senior') atSchool(g, g.recall('hs') === 'key' ? '重點高中' : '高中'); else atSchool(g, '職業學校'); },
      text: (g) => (g.recall('edu') === 'senior'
        ? (g.recall('hs') === 'key' ? '重點高中的晚自習上到十點。年級第一的人，每天早上五點半就在走廊裡背單詞。' : g.recall('hs') === 'scholar' ? '你是學校的“狀元苗子”，校長在開學典禮上唸了你的名字。' : '高一開學，軍訓曬掉了你一層皮。')
          + (rural(g) ? '縣城的高中要住校，你一個月回一次家，每次回去都背一罐家裡醃的鹹菜。' : '')
        : '職業學校的宿舍樓對著一片工地。第一週，你認識了宿舍裡另外五個從不同縣來的人。') },
  ]);

  /* ---------- 随时可能发生的家事：兄弟姐妹出生、爷爷奶奶离世、旧日的回声 ---------- */
  const sibBorn = (id) => ({
    id: 'e_c_born_' + id, y: [2027, 2033], maxAge: 6, t: '家裡添了人', auto: true, always: true,
    cond: (g) => { const s = JY.byId[id]; return !!s && s.born === g.Y; },
    fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); },
    text: (g) => {
      const s = JY.byId[id], he = s.sex === '男' ? '他' : '她';
      return '你有了一個' + (s.sex === '男' ? '弟弟' : '妹妹') + '，叫' + s.name + '。家裡人都圍著' + he + '轉，你抱著自己的玩具，在旁邊站了很久。'
        + (left(g) ? '媽媽坐完月子又走了，把' + he + '也留給了' + carer(g) + '。' : '') + '後來' + he + '會走路了，第一件事就是搖搖晃晃地跟在你後面。';
    },
  });
  const gpGone = (id, who) => ({
    id: 'e_c_gone_' + id, y: [2027, 2043], maxAge: 17, t: who, auto: true, always: true,
    cond: (g) => !!JY.byId[id] && !g.alive(id),
    fx: (g) => { g.stat('心情', -4); if (g.recall('leftBehind')) g.stat('心情', -3); },
    text: (g) => {
      const raised = g.recall('leftBehind') || (id === 'gm' && (g.recall('boarding') === 'gm' || g.recall('nanny') === 'gm'));
      return (raised
        ? CN.who(g, id) + '走了快一年了。是' + who + '把你帶大的。' + (id === 'gm' ? '你一直留著奶奶的那條舊毛巾，洗得發白了也不讓人扔。' : '爺爺那根磨得發亮的柺棍，你靠在了自己床頭。')
        : '清明，你跟著大人去給' + CN.who(g, id) + '上墳。回去的路上，你想起' + who + '以前總在兜裡給你留一塊糖。');
    },
  });
  JY.addEncounters([
    sibBorn('sib0'), sibBorn('sib1'),
    gpGone('gp', '爺爺'), gpGone('gm', '奶奶'),
    // 当年对转学来的同学怎么样，几年后有回音
    { id: 'e_c_kindness_echo', y: [2040, 2044], minAge: 14, maxAge: 17, t: '舊同學', auto: true, always: true,
      cond: (g) => ['friend', 'laughed'].includes(g.recall('kindness')),
      fx: (g) => { if (g.recall('kindness') === 'friend') g.stat('人缘', 3); else g.stat('心情', -1); },
      text: (g) => (g.recall('kindness') === 'friend'
        ? '那個口音很重的同學轉學走了好幾年，突然給你發來一張照片：他考上了老家最好的高中。下面一行字：謝謝你當年跟我玩。'
        : '你在網上刷到一個影片，說小時候被人學口音嘲笑是什麼感覺。你想起了那個轉學來的同學，想不起他的名字了。') },
    // 小时候的那次拉人，后来有人记得
    { id: 'e_c_river_echo', y: [2040, 2044], minAge: 15, maxAge: 17, t: '雞蛋', auto: true, always: true,
      cond: (g) => g.recall('river') === 'saved' && g.f('childSavedKid'),
      fx: (g) => g.stat('人缘', 3),
      text: '當年被你從河裡拉上來的那個小孩，上初中了。他媽媽每年都在你家門口放一籃雞蛋，從來不敲門。' },
    // 父母离婚以后
    { id: 'e_c_split_echo', y: [2038, 2043], minAge: 12, maxAge: 17, t: '週末', auto: true, always: true,
      cond: (g) => g.recall('parentsSplit') === true && g.alive('fa'),
      fx: (g) => { g.stat('心情', -1); g.stat('学识', 1); },
      text: '你每個月去爸爸那兒吃一頓飯。飯桌上大家都很客氣，他總記得給你夾你愛吃的那道菜。回來的公交上，你戴著耳機，什麼也沒放。' },
    // 小时候第一句话叫的是奶奶
    { id: 'e_c_firstword_echo', y: [2036, 2043], minAge: 10, maxAge: 17, t: '奶奶', auto: true, always: true,
      cond: (g) => g.recall('firstWord') === '奶奶' && g.alive('gm') && g.recall('askedMom') === 'home',
      fx: (g) => g.stat('人缘', 2),
      text: '奶奶的眼睛花了，穿針要你幫忙。她說你小時候第一句話叫的就是奶奶，說了很多遍，你裝作第一次聽。' },
  ]);

  /* ---------- 童年专属闲笔（0–5 岁按年龄放开） ---------- */
  JY.addFlavor('age:child', [
    { t: '你把奶奶的老花鏡戴在頭上，說自己是老師。', minAge: 3, cond: (g) => g.recall('leftBehind') && g.alive('gm') },
    { t: '第一場雪落下來，大人抱著你到門口，你伸手去接，雪在手心化了。', minAge: 1, cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: '你在小區的滑梯上滑了一百次，還不肯回家。', minAge: 3, cond: (g) => g.recall('hukou') !== 'rural' },
    { t: '你追著村裡的大鵝跑，被大鵝追了回來。', minAge: 3, cond: (g) => g.recall('hukou') === 'rural' },
    { t: '大人一逗，你就咯咯地笑，笑得口水流了一下巴。', maxAge: 1 },
    { t: '你抓住了大人的手指，攥得緊緊的，怎麼也不肯鬆開。', maxAge: 0 },
    { t: '你長出了第一顆牙，咬什麼都要咬一下。', minAge: 0, maxAge: 1 },
    { t: '你會翻身了，一不留神就從枕頭這頭滾到那頭。', maxAge: 0 },
    { t: '你學會了說“不要”，每天要說一百遍。', minAge: 2, maxAge: 4 },
    { t: '你把積木搭得比自己還高，然後一巴掌推倒，笑得前仰後合。', minAge: 2 },
    { t: '奶奶唱的搖籃曲是老家的調子，你聽著聽著就睡著了。', maxAge: 2, cond: (g) => (g.recall('leftBehind') || ['gm', 'home'].includes(g.recall('nanny'))) && g.alive('gm') },
    { t: '托育班的老師說，你是班上第一個會自己穿鞋的。', minAge: 2, maxAge: 3, cond: (g) => g.recall('nanny') === 'daycare' },
    { t: '店裡來了客人，你學著爸媽的樣子說“歡迎光臨”，把客人逗笑了。', minAge: 3, cond: (g) => g.recall('nanny') === 'shop' },
    { t: '你蹲在門口看螞蟻搬家，看了整整一個下午。', minAge: 3 },
  ]);
  JY.addFlavor('age:young', [
    { t: '週五放學，你在校門口等奶奶，等到了天黑。奶奶到的時候，手裡提著一袋熱乎的烤紅薯。', cond: (g) => g.recall('leftBehind') && !g.recall('migrated') && g.alive('gm') },
    { t: '城中村的樓捱得很近，你從窗戶能遞東西給對面樓的同學。', cond: (g) => g.recall('migrated') },
    { t: '城中村的巷子裡，燒餅攤的老闆記得你不要蔥。', cond: (g) => g.recall('migrated') && g.recall('cityKid') === 'roam' },
    { t: '你的手機螢幕裂了一道縫，你一直沒捨得換。', cond: (g) => g.recall('phone') === 'game' },
    { t: '你在網課上聽一個大學教授講宇宙，聽到了半夜。', cond: (g) => g.recall('phone') === 'study' },
    { t: '你偷偷看了一眼那個人的座位，然後假裝在看黑板。', cond: (g) => ['hidden', 'pact', 'told'].includes(g.recall('crush')) },
    { t: '宿舍熄燈以後，你打著手電筒做完了最後一道題。', cond: (g) => g.recall('push') === 'hard' },
    { t: '爸媽吵架的時候，會先看你一眼，然後壓低聲音。', cond: (g) => g.recall('glue') === true },
    { t: '你在走廊上碰見了當年那幾個堵人的高年級，他們裝作不認識你。', cond: (g) => ['stood', 'teacher', 'beaten'].includes(g.recall('bully')) },
    { t: '那天你繞開走的事，你後來想起過好幾次。', cond: (g) => g.recall('bully') === 'away' },
    { t: '路邊有一隻流浪貓衝你叫了一聲。你想起小時候沒敢碰的那一隻，蹲下來看了它一會兒。', cond: (g) => g.recall('kidPet') === 'no' },
    { t: '媽媽回來以後，家裡的燈每天晚上都亮著。你放學走到村口，遠遠就能看見。', cond: (g) => g.recall('momBack') === 'mo' },
  ]);
  // 16、17 岁归在 adult 闲笔里，用 maxAge 卡住
  JY.addFlavor('age:adult', [
    { t: '夜校的課本上，你在每一頁的角上寫了日期。', maxAge: 19, cond: (g) => g.recall('workPlan') === 'study' },
    { t: '你給家裡打電話，只說一切都好，沒說累。', maxAge: 19, cond: (g) => ['stay', 'city'].includes(g.recall('workPlan')) },
    { t: '實習結束那天，師傅拍了拍你的肩膀，說以後有事找他。', maxAge: 18, cond: (g) => g.recall('vocPlan') === 'work' },
    { t: '宿舍熄燈以後，你藉著走廊的燈做職教高考的題。', maxAge: 17, cond: (g) => g.recall('vocPlan') === 'college' },
    { t: '高三的教室後牆上貼著倒計時，每天有人去撕掉一頁。', minAge: 17, maxAge: 17, cond: (g) => g.recall('edu') === 'senior' && g.recall('hsPath') !== 'abroad' },
  ]);
})();

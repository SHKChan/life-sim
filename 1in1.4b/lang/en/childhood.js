/* 由 share/tools/tr.js 从 data/childhood.js 和 lang/en/tr/childhood.json 生成，不要手改。 */
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
  const cityName = (g) => g.recall('city') || 'the city';
  const home = (g) => g.recall('homeCap') || 'your hometown';
  const notRural = (g) => hk(g) !== 'rural' || !!g.recall('migrated');
  const sibIds = ['sib0', 'sib1'];
  const youngerSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born > CN.NOW);
  const olderSib = (g) => sibIds.map((id) => JY.byId[id]).find((s) => s && s.born < CN.NOW);
  const regionBit = (g, map, dft) => map[g.recall('region')] || dft;
  const north = (g) => ['东北', '华北', '西北'].includes(g.recall('region'));
  // 家里管你的大人怎么称呼
  const parents = (g) => {
    if (g.recall('parentsSplit')) return 'Mom';
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? 'Dad' : 'Mom';
    return 'Mom and Dad';
  };
  // 留守时带你的人
  const carer = (g) => {
    const b = g.recall('momBack');
    if (b) return b === 'fa' ? 'Dad' : 'Mom';
    if (g.alive('gm')) return 'grandma';
    if (g.alive('gp')) return 'grandpa';
    return 'The family';
  };
  // 名字算出来的固定随机数：同一个人每次读到的城市、宠物名都一样
  const hash = (g) => { const n = (JY.byId[g.me] && JY.byId[g.me].name) || ''; let s = 0; for (let i = 0; i < n.length; i++) s += n.charCodeAt(i); return s; };
  // 留守孩子的爸妈在哪座城市打工
  const PCITY = { 华南: ['Shenzhen', 'Dongguan', 'Foshan', 'Guangzhou'], 西南: ['Dongguan', 'Shenzhen', 'Foshan', 'Ningbo'], 华中: ['Dongguan', 'Suzhou', 'Shenzhen', 'Hangzhou'], 华东: ['Suzhou', 'Ningbo', 'Hangzhou', 'Shanghai'], 华北: ['Beijing', 'Tianjin', 'Suzhou', 'Qingdao'], 东北: ['Beijing', 'Tianjin', 'Dalian', 'Qingdao'], 西北: ['Xi\'an', 'Beijing', 'Suzhou', 'Dongguan'] };
  const pcity = (g) => {
    const list = PCITY[g.recall('region')] || ['Dongguan', 'Shenzhen', 'Suzhou', 'Hangzhou'];
    return list[hash(g) % list.length];
  };
  const seaCity = (c) => ['Shenzhen', 'Guangzhou', 'Ningbo', 'Shanghai', 'Tianjin', 'Dalian', 'Qingdao'].includes(c);
  const petName = (g) => (rural(g) ? ['Goldie', 'Blackie', 'Lucky', 'Spot'] : ['Dumpling', 'Kitty', 'Bean', 'Tangerine'])[hash(g) % 4];
  CN.kidPetName = petName; // economy.js 收养这只宠物时用同一个名字
  const petKind = (g) => (rural(g) ? 'dog' : 'cat');
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
    childSavedKid: 'At ten, you pulled a drowning child out of the river',
  });

  // 留守的孩子，爷爷奶奶都不在了：爸妈得有一个人回来。每个年龄放一个自动节点，排在这一年所有节点前面
  const momBackNode = (age) => ({
    id: 'c_mom_back_' + age, age, t: 'Coming Home', auto: true,
    cond: (g) => away(g) && !!JY.byId.gp && !g.alive('gp') && !g.alive('gm') && (g.alive('mo') || g.alive('fa')),
    fx: (g) => {
      const id = g.alive('mo') ? 'mo' : 'fa';
      g.remember('momBack', id);
      CN.liveWith(g, [id]);
      CN.goHome(g);
      g.stat('心情', 3);
    },
    text: (g) => {
      const id = g.recall('momBack'), he = id === 'fa' ? ' ' : ' ';
      return 'With your grandparents gone, the house could not be left without a grown-up. ' + CN.who(g, id, true) + ' quit the job out of town and came home.' + he + 'The new job in ' + (rural(g) ? 'town' : 'the county town') + ' paid half as much as the old one, but every evening you could eat dinner together.';
    },
  });
  JY.addLifeNodes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(momBackNode));

  JY.addLifeNodes([
    /* ================= 0–5 岁：大多是自动节点 ================= */
    { id: 'c_born', age: 0, t: 'One Month Old', auto: true,
      text: (g) => {
        if (left(g)) return 'Grandma carried you on her back in an old baby sling, even while she fed the chickens and cooked. Every night Mom called on video, and the moment the screen lit up, you stopped crying.';
        if (fam(g) === 'rich') return 'Mom spent a month at a postpartum care center. The nurses burped you far better than Mom and Dad ever could.';
        return regionBit(g, {
          东北: 'Mom was resting through her first month after the birth, and the heating in the house ran hot. Grandma boiled millet porridge every day until the whole house smelled of grain.',
          华南: 'On your one-month day, the family cooked a huge pot of pork trotters in ginger and shared it with the neighbors. You were carried out for a lap and slept through all of it.',
          西南: 'On your one-month day, the family laid out a few tables of food. Your grandmother came in from the countryside and fastened a little silver bracelet on your wrist.',
          西北: 'On your one-month day, Grandma steamed a basket of flower buns, shaped like tigers, saying they would keep you safe from frights.',
          华东: 'On your one-month day, the family gathered to shave off your birth hair, saying they would keep it to make a writing brush.',
        }, 'On your one-month day, the family laid out a few tables of food. Relatives took turns holding you. You slept through it, and nobody managed to wake you.');
      } },
    { id: 'c_nights', age: 0, t: 'Nights', auto: true,
      cond: (g) => !left(g),
      text: (g) => (fam(g) === 'rich' ? 'A baby nurse kept watch at night. Mom still woke up often and stood by the crib looking at you.' : 'For the first six months you needed feeding every two or three hours at night. Dad learned to mix formula with one hand while holding you with the other.') },
    { id: 'c_nanny', age: 1, t: 'Who Looks After You', auto: true,
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
        maid: 'The family hired a baby nurse with an accent from her hometown. She held you more steadily than Mom and Dad did.',
        shop: 'Mom and Dad’s shop could not run without them. Your crib stood behind the counter, and customers would tickle you on their way out.',
        home: rural(g) ? 'When Mom and Dad went out to the fields, they left you with Grandma. She picked vegetables with her hands and rocked your cradle with her foot.' : 'Three generations lived under one roof. Mom and Dad worked during the day, and you were Grandma’s job.',
        gm: 'Mom’s maternity leave was over. Grandma rode a night train from the countryside, saying she would help raise you until you started primary school.' + (g.alive('gp') ? ' Grandpa stayed behind alone and video-called every night to see you.' : ''),
        daycare: 'Mom went back to work. You were sent to the daycare in the housing complex, dropped off at eight in the morning and picked up at six in the evening.',
        mom: 'Mom worked out what it would cost to hire someone to watch you, quit her job, and stayed home with you.',
      }[g.recall('nanny')]) },
    { id: 'c_first_year', age: 1, t: 'One Year Old', auto: true,
      text: (g) => {
        if (left(g)) return 'You could walk. Your first step was taken holding on to Grandma’s trouser leg. She filmed it and sent it off, and on the other end of the video, Mom cried.';
        if (g.recall('nanny') === 'maid') return 'You could walk. The baby nurse saw your first step before Mom and Dad did, and hurried to pull out her phone to film it again.';
        if (g.recall('nanny') === 'gm') return 'You could walk. Your first step was toward Grandma. She was so happy she told Grandpa about it on the phone for half an hour.';
        if (rural(g)) return 'You could walk. You toddled toward the chickens in the yard. Before the chickens could run, you plopped down on your bottom.';
        return 'You could walk. Mom and Dad posted the video of your first step in the family group chat, and relatives answered with a row of thumbs-up.';
      } },
    { id: 'c_first_word', age: 2, t: 'First Words', auto: true,
      fx: (g) => {
        const w = left(g) || g.recall('nanny') === 'gm' ? 'grandma' : g.recall('nanny') === 'mom' ? 'Mom' : g.rnd() < 0.5 ? 'Mom' : 'Dad';
        g.remember('firstWord', w);
      },
      text: (g) => 'Your first word was “' + g.recall('firstWord') + '”. '
        + (left(g) ? 'Mom and Dad heard it on the phone and said nothing for a long while. Later Mom said that hearing you call for Grandma made her happy too.'
          : g.recall('firstWord') === 'grandma' ? 'Grandma phoned every relative back home that very day.' : 'The whole family was happy all day.') },
    { id: 'c_spoon', age: 2, t: 'Feeding Yourself', auto: true,
      text: (g) => (north(g) ? 'You learned to feed yourself with a spoon: half the millet porridge went in and half went everywhere, ' : 'You learned to feed yourself with a spoon: half the rice cereal went in and half got smeared around, ') + (left(g) || g.recall('nanny') === 'gm' || g.recall('nanny') === 'home' ? 'and Grandma stood by with a towel and never hurried you.' : 'and Mom and Dad stood by filming on their phones, neither of them willing to help.') },
    { id: 'c_fever', age: 2, t: 'Fever', auto: true,
      fx: (g) => { const bad = g.s('健康') < 50 || g.rnd() < 0.25; g.remember('fever', bad); g.stat('健康', bad ? -4 : 1); },
      text: (g) => g.recall('fever')
        ? (rural(g) ? 'One night your fever shot up to 39.8°C (103.6°F). Grandpa wrapped you up against his chest and rode his electric scooter to the town clinic. By dawn the fever had broken, and you fell asleep in his arms.' : 'You had a fever for three days and spent them on an IV drip in a children’s hospital corridor. On the day you were discharged, the nurse gave you a little sticker.')
        : 'At the start of winter you ran a small fever, and a few days of medicine fixed it.' },
    { id: 'c_kinder', age: 3, t: 'Kindergarten', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        if (h === 'rural') { g.remember('kinder', left(g) ? 'none' : 'town'); g.move(g.recall('homeLoc'), home(g)); }
        else g.remember('kinder', f === 'rich' ? 'bilingual' : f === 'civil' ? 'public' : 'private');
        if (g.recall('kinder') === 'none') g.stat('学识', -2); else g.stat('人缘', 2);
      },
      text: (g) => ({
        bilingual: 'You started at a bilingual kindergarten, where the teachers spoke English and lunch came with a fruit platter. You didn’t cry on the first day.',
        public: 'You won a place at a public kindergarten in the lottery. Mom and Dad said it was luck, and the night before term they folded your little quilt three times.',
        private: 'You went to the private kindergarten at the gate of the housing complex. The first week, every morning you clung to the door and refused to go in. By the second week you didn’t look back.',
        town: 'Every day you rode a motor tricycle to the kindergarten in town. Seven or eight kids were crammed in, like a basket of turnips.',
        none: 'The village kindergarten had closed two years earlier. You stayed home with ' + carer(g) + ', and ' + carer(g) + ' taught you to count eggs, giving you one as a reward whenever you got to ten.',
      }[g.recall('kinder')]) },
    { id: 'c_first_taste', age: 3, t: 'A Taste', auto: true,
      text: (g) => 'When you were three, you had your first taste from a grown-up’s bowl: ' + regionBit(g, {
        东北: 'guobaorou, crispy sweet-and-sour pork. It was sweet and tangy, and you ate three pieces in one go.',
        华北: 'zhajiangmian, noodles in fried soybean paste. The sauce was salty, you ended up with a black mouth, and you still wanted a second bite.',
        西北: 'minced-meat noodles. A grown-up picked out a small bowl without chili for you. You drank the soup down too.',
        华东: 'little wontons. The wrappers were so thin they were see-through, and you counted them one by one as you ate.',
        华中: 'hot dry noodles with sesame paste. The paste was smeared all over your mouth, and you still said it was good.',
        华南: 'a shrimp dumpling. You bit in, gasped at the heat, and reached for another.',
        西南: 'a wonton in chili oil. They skimmed the red oil off for you. You still teared up from the spice, and still wouldn’t put the spoon down.',
      }, 'a dumpling. You bit down and the hot broth burned your tongue, and you reached for another.') },
    { id: 'c_newyear', age: 5, t: 'New Year', auto: true,
      fx: (g) => { g.stat('心情', 3); if (left(g)) g.stat('人缘', 2); },
      text: (g) => {
        const food = regionBit(g, { 东北: 'dumplings and frozen pears', 华北: 'dumplings', 西北: 'fried flatbread and minced-meat noodles', 华东: 'rice cake and eight-treasure rice pudding', 华中: 'cured fish and sticky rice cakes', 华南: 'a big-bowl feast and fried sesame balls', 西南: 'cured pork and sweet rice balls' }, 'dumplings');
        if (away(g)) return 'On the twenty-eighth of the last lunar month, Mom and Dad came home dragging two big suitcases. You hid behind ' + carer(g) + ', too shy to greet them. That year’s New Year food was ' + food + '. On the sixth day of the new year they left again. Mom left you a new padded jacket, and you wore it until spring.';
        if (rural(g)) return 'That New Year, the table had ' + food + '. You followed the bigger kids setting off little firecrackers, covering your ears and running faster than anyone.';
        return 'That New Year, the table had ' + food + '. You collected a pile of red envelopes, and Mom “kept them safe for you.”';
      } },

    /* ---------- 4 岁：小时候的样子 ---------- */
    { id: 'c_ai_story', age: 4, t: 'The Storytelling Box',
      cond: (g) => !rural(g),
      text: (g) => (away(g) ? 'Mom and Dad mailed back a little talking box from far away. It told stories and sang songs, and it could answer all the “whys” that Grandma couldn’t follow.' : 'A little talking box came into the house. It told stories, sang songs, and answered all your “whys.”' + (fam(g) === 'smallbiz' ? ' Mom and Dad minded the shop and got home after dark.' : ' Mom and Dad worked late.')),
      choices: [
        { t: 'Ask it for stories every day', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'ai'); }, res: 'You learned about dinosaurs, stars, and the bottom of the sea. It never got tired of you.' },
        { t: 'Insist on waiting for Mom and Dad to tell the story', dev: 15, cond: (g) => !away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: 'You often fell asleep waiting. Once in a while you managed to wait it out, and that was the best part of the day.' },
        { t: 'Only listen to Mom tell it over video', dev: 15, cond: (g) => away(g), fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); g.remember('kidStyle', 'parents'); }, res: 'Mom, just off a night shift, lay on her dorm bed and told you stories. Sometimes she was the one who fell asleep halfway through.' },
        { t: 'Take it apart to see who is talking inside', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', -1); g.remember('kidStyle', 'tinker'); }, res: 'There was nobody inside, only a green circuit board. You got scolded, and you also remembered what that board looked like.' },
      ] },
    { id: 'c_village_kid', age: 4, t: 'The Village Entrance',
      cond: (g) => rural(g),
      text: (g) => (away(g) ? carer(g) + ' was out working the fields, so ' : 'When the grown-ups were busy, ') + 'you hung around at the village entrance. A dirt road led out to the wider world, and every so often a car drove past.',
      choices: [
        { t: 'Follow them to the fields', canon: true, fx: (g) => { g.stat('健康', 3); g.remember('kidStyle', 'field'); }, res: 'You learned to tell wheat seedlings from chives and got as tanned as a little mud doll.' },
        { t: 'Squat by the road and count the passing cars', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('kidStyle', 'road'); }, res: 'You counted to a hundred. You wanted to know what was at the other end of the road.' },
        { t: 'Go up the back mountain with the big kids', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('kidStyle', 'gang'); }, res: 'You scraped your knee, and you also got your first gang of big brothers and sisters to tag along with.' },
      ] },

    /* ---------- 5 岁：小狗小猫 ---------- */
    { id: 'c_pet', age: 5, t: 'A Little Creature',
      text: (g) => (rural(g) ? 'A scrawny little local puppy came to the village entrance, so thin you could count its ribs. It followed you all the way. When you stopped, it stopped.' : 'There was a little stray cat in the flowerbed of the housing complex, with a thin little mew. You crouched down, and it didn’t run.'),
      choices: [
        { t: 'Secretly save it a bite of food every day', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('kidPet', 'fed'); }, res: 'You saved the egg yolk, wrapped it in paper, and carried it out. It waited for you at the same spot every day.' },
        { t: 'Carry it home and beg the grown-ups to keep it', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('kidPet', 'kept'); }, res: (g) => 'The grown-ups grumbled about the trouble but still found it a cardboard box to sleep in. You named it ' + petName(g) + '. ' },
        { t: 'Too scared to touch it; run home', dev: 10, fx: (g) => { g.stat('心情', -1); g.remember('kidPet', 'no'); }, res: 'The next day when you went back to look, it wasn’t there. You stood in that spot for a while.' },
      ] },
    { id: 'c_name_lesson', age: 5, t: 'Writing Your Name', auto: true,
      cond: (g) => g.recall('kinder') === 'none',
      fx: (g) => g.stat('学识', 2),
      text: (g) => carer(g) + ' took apart a cigarette box and wrote your name on the back, stroke by stroke, for you to trace. You traced it all afternoon, and ' + carer(g) + ' pressed that sheet of paper under the glass top of the table.' },

    /* ================= 6 岁：上小学 ================= */
    { id: 'c_school_assign', age: 6, t: 'Starting Primary School', auto: true,
      fx: (g) => {
        const h = hk(g), f = fam(g);
        let s;
        if (h === 'rural') s = 'weak';
        else if (f === 'rich' || f === 'civil') s = g.rnd() < 0.6 ? 'key' : 'normal';
        else if (h === 'city') s = g.rnd() < 0.25 ? 'key' : 'normal';
        else s = g.rnd() < 0.15 ? 'key' : 'normal';
        g.remember('school', s);
        CN.setEdu(g, 'primary', 'In primary school');
        atSchool(g, h === 'rural' ? 'Town Central Primary School' : h === 'county' ? 'County Experimental Primary School' : cityName(g) + ' primary school');
      },
      text: (g) => {
        const s = g.recall('school');
        if (rural(g)) return 'The village school had been closed the year before you started, and all the village’s kids were merged into the town central primary school. On the first day, the playground held more kids than you had ever seen.';
        if (s === 'key') return fam(g) === 'rich' ? 'You got into a good primary school. On the first day, cars filled the road outside the gate, and Dad walked you to the classroom door before leaving.' : 'You got into a good primary school. To win a place there, Mom and Dad had bought an old flat next to the school a few years earlier.';
        if (hk(g) === 'county') return 'You put on your new schoolbag and started at the county experimental primary school. The grilled-sausage stand outside the gate had been on your mind since the day you started.';
        return 'You put on a new schoolbag and went to the primary school nearest to home. The bag was wider than you were.';
      } },
    { id: 'c_nanny_end', age: 6, t: 'After You Started School', auto: true,
      cond: (g) => ['gm', 'mom'].includes(g.recall('nanny')) && (g.recall('nanny') === 'mom' || CN.livesWith(g, 'gm')),
      fx: (g) => { if (g.recall('nanny') === 'gm' && g.alive('gp')) CN.moveOut(g, ['gm']); },
      text: (g) => {
        if (g.recall('nanny') === 'mom') return 'You started primary school, and Mom went back out to find a job. She said that after five years at home, on her first day at work she had to ask where the meeting room was.';
        if (g.alive('gp')) return 'You started primary school, and Grandma said her job was done and she would go back home to keep Grandpa company. The day she left, she sewed you a little cloth pouch for loose change and told you to come visit her during the holidays.';
        return 'You started primary school. Grandma had meant to go back home, but with Grandpa gone she stayed, standing in the very front row at the school gate every day waiting for you.';
      } },
    { id: 'c_first_day', age: 6, t: 'The First Day', loc: 'school',
      cond: (g) => !rural(g),
      text: 'The teacher had everyone pick desk mates and class officers. The kid next to you kept picking at an eraser.',
      choices: [
        { t: 'Talk to your desk mate', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('deskmate', 'friend'); g.rel('childhood friend', CN.pick(['Chubby', 'Bean', 'Lele', 'Guoguo', 'Xiaoyu']), 'primary school desk mate'); }, res: 'Your desk mate broke the eraser in half and gave you a piece. You went through six years of school together.' },
        { t: 'Put your hand up to be class monitor', dev: 20, fx: (g) => { g.stat('事业', 2); g.stat('人缘', -1); g.remember('deskmate', 'leader'); g.info('Identity', 'Class monitor'); }, res: 'The teacher smiled and let you. The first time you stood at the front of the class and called “Stand up,” your voice shook a little.' },
        { t: 'Keep staring out the window to see whether the person who dropped you off has left', dev: 10, fx: (g) => { g.stat('心情', -2); g.remember('deskmate', 'shy'); },
          res: (g) => (away(g) ? carer(g) : g.recall('nanny') === 'gm' && CN.livesWith(g, 'gm') ? 'grandma' : 'Mom') + ' had left long ago. You didn’t say a word all day. When you saw that familiar face at the school gate at the end of the day, you finally cried.' },
      ] },
    { id: 'c_boarding', age: 6, t: 'Boarding', loc: 'school',
      cond: (g) => rural(g),
      text: 'The school in town was several kilometers from home. The teacher said you could board from first grade and go home once a week.',
      choices: [
        { t: 'Board at school', canon: true, fx: (g) => { g.stat('心情', -3); g.stat('健康', 1); g.remember('boarding', 'yes'); }, res: 'Twelve kids slept in one dorm room. For the first month, someone cried every night after lights-out. The dorm aunt went from bed to bed tucking in your blankets, and after a while fewer kids cried.' },
        { t: 'Walk to school every day, leaving before dawn', dev: 15, fx: (g) => { g.stat('健康', 3); g.stat('学识', -1); g.remember('boarding', 'walk'); }, res: 'You walked two hours a day, there and back. In winter there were still stars in the sky when you left, and a few kids from your village walked with you.' },
        { t: 'Grandma rents a place in town to look after you', dev: 20, cond: (g) => away(g) && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'gm'); g.move('county', 'A rented room in town'); }, res: 'Grandma rented a tiny room behind the school and boiled you an egg every morning.' },
        { t: 'Mom rents a place in town to look after you', dev: 20, cond: (g) => !away(g) && g.alive('mo') && !left(g), fx: (g) => { g.stat('人缘', 3); g.stat('财富', -2); g.remember('boarding', 'mom'); g.move('county', 'A rented room in town'); }, res: 'Mom rented a tiny room behind the school. During the day she stocked shelves at the supermarket in town, and in the evening she sat with you while you did your homework.' },
      ] },

    /* ================= 7 岁 ================= */
    { id: 'c_video_call', age: 7, t: 'Video Call',
      cond: (g) => away(g),
      text: 'On Saturday night, Mom called on video. She asked what you wanted. The screen froze for a moment, and her face stayed stuck in a smile.',
      choices: [
        { t: 'Say you want a new schoolbag', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('askedMom', 'bag'); }, res: 'At New Year she carried the schoolbag home herself, printed with the cartoon you liked.' },
        { t: 'Say you want her to come home', dev: 20, fx: (g) => { g.stat('人缘', 3); g.stat('心情', -1); g.remember('askedMom', 'home'); }, res: 'The other end was silent for a long time, and then she said, when you’re a little older. That summer she took half a month off to come stay with you.' },
        { t: 'Say nothing and hand the phone to a grown-up', dev: 15, fx: (g) => { g.stat('心情', -2); g.remember('askedMom', 'silent'); }, res: (g) => carer(g) + ' took the phone and said you were doing fine, just quiet.' },
      ] },
    { id: 'c_new_kid', age: 7, t: 'The New Kid', loc: 'school',
      cond: (g) => !away(g),
      text: 'A new kid with a strong accent was transferred into your class. At break, a few kids imitated the way he talked, and the whole class laughed.',
      choices: [
        { t: 'Laugh along', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('kindness', 'laughed'); }, res: 'He kept his head down and flipped his workbook back and forth. When you finished laughing, you forgot all about it.' },
        { t: 'Play with him at break', dev: 20, fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); g.remember('kindness', 'friend'); }, res: 'He taught you to count in his hometown dialect, and you taught him hopscotch. You became good friends.' },
        { t: 'Tell the teacher', dev: 15, fx: (g) => { g.stat('人缘', -1); g.remember('kindness', 'teacher'); }, res: 'The teacher brought it up at the class meeting. Fewer kids imitated the way he talked, and a few fewer played with you.' },
      ] },

    /* ================= 8 岁 ================= */
    { id: 'c_ai_homework', age: 8, t: 'Homework',
      cond: (g) => notRural(g),
      text: (g) => (g.recall('kidStyle') === 'ai' ? 'The little box that had grown up with you got an upgrade, and ' : 'The family tablet had a study assistant installed, and ') + 'if you snapped a photo of a problem, the answer and every step appeared at once.',
      choices: [
        { t: 'Ask it only for the approach and write the answers yourself', canon: true, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: 'You wrote slowly, but everything you got right was something you really knew.' },
        { t: 'Copy the answers and go play', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('homework', 'copy'); }, res: 'Your workbook was full of red check marks. At exam time, you stared blankly at the paper.' },
        { t: 'Race it to see who calculates faster', dev: 25, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.stat('学识', 4); g.stat('心情', 1); g.remember('homework', 'race'); }, res: 'You never won. But your mental arithmetic became the best in the class.' },
      ] },
    { id: 'c_farm_busy', age: 8, t: 'Busy Farm Season',
      cond: (g) => rural(g) && !g.recall('migrated'),
      text: (g) => regionBit(g, { 东北: 'At the autumn harvest, the corn was piled up like a mountain.', 华北: 'During the wheat harvest, the whole family was out in the fields.', 西北: 'During the potato harvest, everyone in the fields stooped over all day.', 西南: 'At rice-cutting time, the terraces were full of people.', 华南: 'During the sugarcane harvest, the family left home before dawn.', 华东: 'During rice transplanting, the paddies were rows and rows of bent backs.', 华中: 'During the rapeseed harvest, the family worked on the drying ground until dark.' }, 'During the busy farm days, the whole family was out in the fields.') + ' Your homework still wasn’t done.',
      choices: [
        { t: 'Go help in the fields', canon: true, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('homework', 'farm'); }, res: 'Your hands blistered. That night you did your homework under the light bulb and fell asleep over it, and woke up with a jacket draped over you.' },
        { t: 'Stay home and do your homework', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('homework', 'think'); }, res: (g) => 'You stayed home alone and wrote your homework out neatly. ' + (away(g) ? carer(g) : 'Mom') + ' came back, took a look, said nothing, and peeled you an apple.' },
        { t: 'Sneak off to play by the river', dev: 20, fx: (g) => { g.stat('心情', 4); g.stat('学识', -1); g.remember('homework', 'river'); }, res: 'You caught little fish by the river all afternoon. You came home with wet trousers and got scolded. That night the little fish were fried into a dish.' },
      ] },
    { id: 'c_season', age: 8, t: 'This Year', auto: true,
      text: (g) => regionBit(g, {
        东北: 'In winter, the school flooded the playground into an ice rink. In PE class the whole class fell over on the ice, and the laughter was louder than the whistle.',
        华北: 'Winter brought the central heating, and the classroom was so warm you wore only a sweater. Frost flowers grew on the window glass, and you drew little people in them with your finger.',
        西北: 'The stall at the school gate sold liangpi (cold skin noodles) for less than a dollar a bowl. You saved your pocket money for three days and ate until your mouth burned with chili.',
        华东: 'In the plum rain season, moss grew along the base of the classroom wall. Your sneakers hadn’t been dry in a week, and Mom dried them with a hair dryer for a whole night.',
        华中: 'Summer was like a steamer. The school had put in air conditioning, and nobody wanted to leave the classroom even after the bell.',
        华南: 'A typhoon came and school was closed for two days. You leaned on the windowsill watching the trees below blow every which way, a little bit glad.',
        西南: rural(g) ? 'It rained for a week. The mountain road was slick, you slipped on the way to school, and your trouser legs were covered in mud when you got there. Your desk mate lent you a pair of dry socks.' : 'The fog was so thick you couldn’t see the building opposite. At break you played hide-and-seek in it, and nobody could find anybody.',
      }, 'In spring, the school organized an outing to the countryside. You rolled around on the grass, and your clothes turned green.') },

    /* ================= 9 岁：特长、随迁 ================= */
    { id: 'c_talent', age: 9, t: 'Hobby Classes', loc: 'school',
      cond: (g) => !rural(g) && !away(g) && !g.recall('migrated'),
      text: (g) => (fam(g) === 'rich' ? 'Mom brought out a form listing a dozen or so hobby classes.' : 'Your classmates all went to hobby classes on weekends. ' + parents(g) + ' talked it over for a few evenings and said you could sign up for one.') + ' What will you pick?',
      choices: [
        { t: 'Coding', canon: true, fx: (g) => { g.stat('学识', 3); g.stat('财富', -1); g.remember('talent', 'code'); g.info('Talent', 'Coding'); }, res: 'You made the little cat on the screen walk ten steps. You felt you could build anything.' },
        { t: 'Drawing', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('财富', -1); g.remember('talent', 'art'); g.info('Talent', 'Drawing'); }, res: 'The teacher pinned the cat you drew on the wall.' },
        { t: 'Basketball or swimming', dev: 15, fx: (g) => { g.stat('健康', 4); g.remember('talent', 'sport'); g.info('Talent', 'Sports'); }, res: 'You shot up and got deeply tanned.' },
        { t: 'Sign up for nothing; you want to sleep in on weekends', dev: 20, fx: (g) => { g.stat('心情', 4); g.remember('talent', 'none'); }, res: 'Your classmates were in class all weekend while you slept. You felt you’d come out ahead.' },
      ] },
    { id: 'c_follow_parents', age: 9, t: 'Moving to the City',
      cond: (g) => away(g),
      text: (g) => 'Mom and Dad were working in ' + pcity(g) + '. At New Year they asked you: do you want to come with us and go to school in the city? The schools there are hard to get into, and the apartment is small.'
        + (g.recall('askedMom') === 'home' ? ' Mom said she had never forgotten what you said on the video call that year.' : ''),
      choices: [
        { t: 'Stay in your hometown', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('migrated', false); }, res: (g) => carer(g) + ' said you were a sensible kid. When Mom and Dad left on the sixth day of the New Year, you walked them to the village entrance, clutching the $30 Mom had pressed into your hand.' },
        { t: 'Go to the city with Mom and Dad', dev: 25, fx: (g) => {
          const c = pcity(g);
          g.remember('migrated', true); g.remember('school', 'weak');
          CN.goCity(g, ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'].includes(c) ? 1 : 2, c);
          g.move('metro', c + ' · Urban Village');
          CN.moveOut(g, ['gp', 'gm']); CN.liveWith(g, ['fa', 'mo']);
          g.stat('心情', 3); g.stat('学识', 1);
        }, res: (g) => 'You rode a high-speed train for the first time. Mom and Dad rented a room in an “urban village” (a crowded migrant neighborhood) in ' + g.recall('workCity') + ', and you started at a school just for children from other provinces. ' + carer(g) + ' stayed behind alone in your hometown, calling every night to ask whether you’d eaten.' },
      ] },
    { id: 'c_teacher_volunteer', age: 9, t: 'The Volunteer Teacher', loc: 'school',
      cond: (g) => rural(g) && !away(g) && !g.recall('migrated'),
      text: 'A young volunteer teacher came to the school from a big city. She could draw, she could play the piano, and she told stories about the outside world.',
      choices: [
        { t: 'Listen carefully in class, then go home', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('talent', 'none'); }, res: 'A year later she left. Before going, she gave everyone a pencil with their name carved on it.' },
        { t: 'Pester her every day to teach you to draw', dev: 20, fx: (g) => { g.stat('心情', 3); g.remember('talent', 'art'); g.info('Talent', 'Drawing'); g.rel('mentor', 'Ms. Lin, the volunteer teacher'); }, res: 'When she left, she gave you a box of watercolors. You used it for many years and never could bear to finish it.' },
        { t: 'Ask her what the cities outside are like', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('talent', 'dream'); }, res: 'She showed you lots of photos. That night you dreamed you were standing on top of a very tall building.' },
      ] },

    /* ================= 10 岁 ================= */
    { id: 'c_parents_fight', age: 10, t: 'Arguments',
      cond: (g) => ['worker', 'smallbiz', 'white'].includes(fam(g)) && !left(g),
      text: (g) => ({ smallbiz: 'That year business was bad at the shop, ', worker: 'That year the factory cut shifts, ', white: 'That year Dad’s company laid off a batch of people, ' }[fam(g)] || 'That year things weren’t going well at home, ') + 'and Mom and Dad often argued in the middle of the night. One day Mom asked you: if we split up, who would you go with?',
      choices: [
        { t: 'Cover your ears and say “I don’t know”', canon: true, fx: (g) => { g.stat('心情', -3); g.remember('parentsSplit', false); }, res: 'They didn’t ask again. And in the end they didn’t split up. One day you came home from school and found Dad in an apron frying food in the kitchen, with Mom beside him giving orders.' },
        { t: 'Cry and beg them not to split up', dev: 15, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -2); g.remember('parentsSplit', false); g.remember('glue', true); }, res: 'Dad crouched down and held you for a long time. After that day, the arguing got quieter.' },
        { t: 'Say “Then split up, just stop crying, both of you”', dev: 30, fx: (g) => {
          g.stat('心情', -4); g.stat('学识', 2); g.remember('parentsSplit', true);
          g.info('Family', 'Parents divorced'); g.unrel('father'); g.rel('father', 'fa', 'doesn’t live with you anymore');
          CN.moveOut(g, ['fa', 'gp', 'gm']);
        }, res: 'That winter they divorced. Dad moved out, you lived with Mom, and you saw Dad once a month. You grew up several years all at once.' },
      ] },
    { id: 'c_olympiad', age: 10, t: 'Math Olympiad Class', loc: 'school',
      cond: (g) => ['civil', 'rich'].includes(fam(g)) && !left(g),
      text: 'The teacher said you were quick and suggested the Math Olympiad class. It meant two full days of classes every weekend.',
      choices: [
        { t: 'Go', canon: true, fx: (g) => { g.stat('学识', 4); g.stat('心情', -3); g.remember('olympiad', true); }, res: 'You lost your weekends. You met many kids as quick as you, and learned for the first time that you weren’t the quickest.' },
        { t: 'No, spend weekends at Grandpa’s', dev: 20, cond: (g) => g.alive('gp'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: 'Grandpa taught you Chinese chess. You lost all summer, and finally in autumn you won a game, and Grandpa was so happy he bought you an ice lolly.' },
        { t: 'No, spend weekends at Grandma’s', dev: 20, cond: (g) => !g.alive('gp') && g.alive('gm'), fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); g.remember('olympiad', false); }, res: 'Grandma taught you to make dumplings. Yours fell apart the moment they hit the pot, and Grandma fished them all out and ate them herself.' },
        { t: 'No, read by yourself on weekends', dev: 20, cond: (g) => !g.alive('gp') && !g.alive('gm'), fx: (g) => { g.stat('学识', 2); g.stat('心情', 3); g.remember('olympiad', false); }, res: 'You sat in a corner of the library all summer and read through a whole row of popular science books.' },
      ] },
    { id: 'c_river', age: 10, t: 'The River',
      cond: (g) => ['farmer', 'migrant'].includes(fam(g)) && !g.recall('migrated'),
      text: 'In summer vacation, a few kids arranged to go swimming in the river. The grown-ups had said many times that people had drowned there.',
      choices: [
        { t: 'Don’t go; stay home and watch TV', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('river', 'no'); }, res: 'That afternoon you heard someone shouting in the village. Later you heard something had happened at the river, but the person had been pulled out.' },
        { t: 'Go, but only play in the shallows', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('心情', 3); g.remember('river', 'swim'); }, res: 'The water was cold. You learned to doggy-paddle and never told the grown-ups.' },
        { t: 'Go, and when you see a small kid wading into deep water, rush to grab him', dev: 30, check: ['健康', 55], fx: (g) => { g.stat('人缘', 6); g.remember('river', 'saved'); g.set('childSavedKid'); }, res: 'You dragged him to shore and swallowed several mouthfuls of water yourself. His family came to your house carrying a basket of eggs and stood there for a long time.',
          fail: { fx: (g) => { g.stat('健康', -8); g.remember('river', 'nearly'); }, res: 'You caught hold of him but were swept away yourself. A grown-up passing by pulled you both out. You ran a fever for three days.', dev: 10 } },
      ] },
    { id: 'c_city_village', age: 10, t: 'After School',
      cond: (g) => !!g.recall('migrated'),
      text: (g) => 'In ' + (g.recall('workCity') || 'the city') + ', you spent a year in an urban village. Dad worked on a building site and Mom in an electronics factory, and both got home after dark. The hours between school letting out and dark were yours to plan.',
      choices: [
        { t: 'Do homework at the little shop downstairs', canon: true, fx: (g) => { g.stat('人缘', 3); g.remember('cityKid', 'shop'); }, res: 'The shop owner kept a small table for you. You learned to make change, and to say a few words of the local dialect.' },
        { t: 'Go to the free community after-school class', dev: 15, fx: (g) => { g.stat('学识', 3); g.remember('cityKid', 'class'); }, res: 'The after-school class was run by a few college student volunteers. A girl with glasses taught you problems and said you were quick.' },
        { t: 'Run through the alleys with the kids in your building', dev: 15, fx: (g) => { g.stat('心情', 3); g.stat('健康', 1); g.remember('cityKid', 'roam'); }, res: 'You ran every alley until you knew them all. Which house had the fierce dog, which stall had the good sesame flatbread: you could have told with your eyes shut.' },
      ] },

    /* ================= 11 岁：小升初 ================= */
    { id: 'c_xiaoshengchu', age: 11, t: 'Junior High Placement', loc: 'school',
      cond: (g) => notRural(g) && !g.recall('migrated'),
      text: (g) => 'Time to move up to junior high. ' + (hk(g) === 'county' ? 'The county’s best junior high required an exam, ' : cityName(g) + ' had a few good junior highs that admitted by lottery and one private school that required an exam, ') + 'and the rest took students from the neighborhood.',
      choices: [
        { t: 'Go to the nearest school', canon: true, fx: (g) => { g.remember('school', g.recall('school') === 'key' ? 'key' : 'normal'); g.remember('xsc', 'near'); }, res: 'Half your primary school classmates moved up to the same junior high with you.' },
        { t: 'Take the exam for the good school', dev: 15, check: ['学识', 62], fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'exam'); g.stat('心情', 3); }, res: (g) => 'You passed. On the day the results came out, ' + parents(g) + ' took you out to a restaurant and ordered all your favorite dishes.',
          fail: { fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'failed'); g.stat('心情', -3); }, res: 'You missed by a few points. You cried all night, and the next day went as usual to the junior high near home.', dev: 5 } },
        { t: 'Pay for a private junior high', dev: 20, cond: (g) => ['rich', 'civil'].includes(fam(g)), fx: (g) => { g.remember('school', 'key'); g.remember('xsc', 'paid'); g.stat('财富', -6); }, res: 'Tuition ran to several thousand dollars a year. Mom said the money was well spent.' },
      ] },
    { id: 'c_town_middle', age: 11, t: 'Starting Junior High', loc: 'school',
      cond: (g) => !notRural(g) || g.recall('migrated'),
      text: (g) => g.recall('migrated')
        ? 'You had no city hukou (household registration), so you could only attend a private junior high, and later you would have to go back to your hometown to take the zhongkao (high school entrance exam).' + ({ shop: 'When the owner of the little shop heard you might leave, she pressed a bag of candy into your hand.', class: 'The girl from the after-school class said, wherever you go to school, study hard.' }[g.recall('cityKid')] || '')
        : 'Time for junior high. The town school was right by your door. The county junior high required an exam, and if you passed you would board.',
      choices: [
        { t: 'Go to the town school', canon: true, cond: (g) => !g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'near'); }, res: 'The classrooms at the town school were as ever, with drafty windows. The new math teacher was from the town and had come back after graduating from university.' },
        { t: 'Take the exam for the county junior high', dev: 20, cond: (g) => !g.recall('migrated'), check: ['学识', 55],
          fx: (g) => { g.remember('school', 'normal'); g.remember('xsc', 'exam'); g.move('county', 'County Junior High'); g.stat('心情', 2); }, res: 'You passed the county junior high exam and, for the first time, lived in a dorm room with six people.',
          fail: { fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'failed'); }, res: 'You failed. You stayed on at the town school.', dev: 5 } },
        { t: 'Go back to your hometown for junior high, so you can sit the exams there', canon: true, cond: (g) => !!g.recall('migrated') && (g.alive('gp') || g.alive('gm')),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => 'You went back to ' + carer(g) + '’s side. Your classmates in the city said they would keep in touch, and later sent only a few messages. ' + carer(g) + ' made up the bed you slept in as a little kid again.' },
        { t: 'Go back to your hometown for junior high, with a grown-up from home going back with you', canon: true, cond: (g) => !!g.recall('migrated') && !g.alive('gp') && !g.alive('gm'),
          fx: (g) => { returnHome(g); g.remember('school', 'weak'); g.remember('xsc', 'back'); },
          res: (g) => carer(g) + ' quit the job in the city and went back to your hometown with you. It took three days to tidy the old house before it felt like a home again.' },
        { t: 'Stay in the city at a private school and decide later', dev: 20, cond: (g) => !!g.recall('migrated'), fx: (g) => { g.remember('school', 'weak'); g.remember('xsc', 'stay'); g.stat('心情', 2); }, res: 'You stayed in the city. But your classmates went back to their hometowns one by one, and the classroom emptied.' },
      ] },

    /* ================= 12 岁：手机 ================= */
    { id: 'c_phone', age: 12, t: 'Your First Phone',
      text: (g) => (away(g) ? 'Mom and Dad mailed back an old phone so you could video-call every day.' : 'Junior high had started, and ' + parents(g) + ' bought you a phone.') + ' Your classmates were all scrolling short videos and playing games.',
      choices: [
        { t: 'Scroll videos and play games without being able to stop', canon: true, fx: (g) => { g.stat('心情', 3); g.stat('学识', -3); g.remember('phone', 'game'); }, res: 'Your rank in the game got higher and higher, and your grades lower and lower.' },
        { t: 'Use it to look things up and watch online classes', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('phone', 'study'); }, res: 'You listened to many good teachers’ lessons online. You found out there were plenty of people in the world who explained things better than your teachers.' },
        { t: 'Hand it to a grown-up and only get it on weekends', dev: 25, fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); g.remember('phone', 'locked'); }, res: (g) => 'You handed your phone to ' + (away(g) ? carer(g) : parents(g)) + '. You couldn’t follow the memes your classmates talked about, but your homework was always done first.' },
      ] },
    { id: 'c_junior_start', age: 12, t: 'Seventh Grade', auto: true,
      fx: (g) => { CN.setEdu(g, 'primary', 'Primary school'); g.stat('学识', 1); },
      text: (g) => ({ key: 'You got into a good junior high. On the first monthly exam, you dropped from the top few in primary school to the middle of the pack.', normal: 'You started junior high. Suddenly there were several more subjects.', weak: 'The junior high teachers changed often. The English teacher changed three times in one term. The third one stayed, saying she would take your class all the way to graduation.' }[g.recall('school') || 'normal'])
        + (g.recall('xsc') === 'failed' ? ' The few points you missed stayed with you for a long time.' : '')
        + (g.recall('deskmate') === 'friend' ? ' Your primary school desk mate was in the same class as you again.' : g.recall('deskmate') === 'leader' ? ' The new homeroom teacher looked at your file and made you class monitor again.' : '') },
    { id: 'c_cook', age: 12, t: 'A Meal', auto: true,
      fx: (g) => g.stat('人缘', 1),
      text: (g) => {
        const who = away(g) ? carer(g) : parents(g);
        return 'You cooked a meal all by yourself for the first time: ' + (north(g) ? 'a pot of tomato and egg noodles, the noodles a little mushy. ' : 'tomato scrambled eggs, with too much salt. ') + who + ' ate every bite and said it was better than anything sold outside.';
      } },
    { id: 'c_pet_old', age: 12, t: 'It', auto: true,
      cond: (g) => ['kept', 'fed'].includes(g.recall('kidPet')),
      text: (g) => (g.recall('kidPet') === 'kept'
        ? (rural(g) ? petName(g) + ' had grown into a big dog, crouching at the village entrance every evening waiting for you after school. As soon as you got close, its tail thumped against the ground.' : petName(g) + ' had gotten much fatter, and every night squeezed onto your workbook to sleep, impossible to shoo away.')
        : 'When you were little you fed a stray ' + petKind(g) + ', and it was later adopted by a family. Once you ran into it on the road, and it looked at you as if it still remembered you.') },

    /* ================= 13 岁 ================= */
    { id: 'c_crush', age: 13, t: 'A Crush', loc: 'school',
      cond: (g) => g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak'),
      text: (g) => 'You started noticing a ' + (isMale(g) ? 'girl' : 'boy') + ' in your class. When you passed notes, your palms were soaked with sweat.',
      choices: [
        { t: 'Say nothing and study hard', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('crush', 'hidden'); }, res: 'You wrote that name on scrap paper, filled the page, and tore it up.' },
        { t: 'Write a letter', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('学识', -2); g.remember('crush', 'told'); }, res: 'The homeroom teacher confiscated the letter. You were called to the office, and when you came out, you laughed together for a long time.' },
        { t: 'Promise to aim for the same high school', dev: 25, fx: (g) => { g.stat('学识', 3); g.stat('心情', 2); g.remember('crush', 'pact'); }, res: 'You hooked pinkies on it. Every evening study session, you did an extra practice paper.' },
      ] },
    { id: 'c_bully', age: 13, t: 'Outside the Bathroom', loc: 'school',
      cond: (g) => !(g.recall('school') === 'key' || (hk(g) === 'city' && g.recall('school') !== 'weak')),
      text: (g) => 'Some older students at school often blocked people outside the bathroom and demanded money. ' + (g.recall('kindness') === 'friend' ? 'Today the one being cornered was that kid with the strong accent from back then.' : 'Today the one being cornered was the skinniest kid in your class.'),
      choices: [
        { t: 'Walk around them', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('bully', 'away'); }, res: 'That day you kept hearing the sounds behind you.' },
        { t: 'Step in and pull him out', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 4); g.remember('bully', 'stood'); }, res: 'You took a few hits, and then they left. The kid stuffed you with all the snacks he’d been saving for ages.',
          fail: { fx: (g) => { g.stat('健康', -6); g.remember('bully', 'beaten'); }, res: 'You got beaten until your nose bled. By the time a teacher came, those kids had long since run off. The kid helped you all the way to the infirmary.', dev: 10 } },
        { t: 'Run and get a teacher', dev: 15, fx: (g) => { g.stat('人缘', 1); g.remember('bully', 'teacher'); }, res: 'The teacher came, and those kids were given demerits. Later the school put a camera outside the bathroom, and nobody blocked people there anymore.' },
      ] },

    /* ================= 14 岁：初三 ================= */
    { id: 'c_back_14', age: 14, t: 'Going Home', auto: true,
      cond: (g) => !!g.recall('migrated'),
      fx: (g) => { returnHome(g); g.remember('school', 'weak'); },
      text: (g) => 'The zhongkao (high school entrance exam) had to be taken where your hukou was registered. Before ninth grade began, you went back to ' + home(g) + '. ' + (g.recall('momBack') ? carer(g) + ' came back with you and found work in town. ' : 'Mom and Dad took you back to ' + carer(g) + '’s side, then returned to the city. ')
        + (g.recall('cityKid') === 'roam' ? 'You described every alley of the urban village to your new classmates.' : 'The textbooks back home were different from the city’s, and it took you a month to catch up.') },
    { id: 'c_grade9', age: 14, t: 'Ninth Grade', loc: 'school',
      text: (g) => 'Ninth grade. The corner of the blackboard said how many days were left until the zhongkao.' + (g.recall('crush') === 'pact' ? ' You remembered the promise you had hooked pinkies on.' : '') + (rural(g) ? ' A few classmates had stopped coming; they said they’d gone out to work.' : ' The teacher said that after the zhongkao, half would go on to regular high school and half to vocational school.'),
      choices: [
        { t: 'Go all out, studying until midnight', canon: true, fx: (g) => { g.stat('学识', 5); g.stat('健康', -3); g.stat('心情', -2); g.remember('push', 'hard'); }, res: (g) => 'Your glasses prescription went up by two diopters. Your grades went up too. ' + (away(g) ? carer(g) : parents(g)) + ' brought you a glass of hot milk every night.' },
        { t: 'Study as usual and sleep when it’s time', dev: 15, fx: (g) => { g.stat('学识', 2); g.stat('健康', 1); g.remember('push', 'normal'); }, res: 'You didn’t stay up late, and your grades didn’t drop.' },
        { t: 'Don’t want to study; want to go earn money early', dev: 25, cond: (g) => ['farmer', 'migrant', 'worker'].includes(fam(g)) || g.s('学识') < 45, fx: (g) => { g.stat('心情', 2); g.stat('学识', -3); g.remember('push', 'quit'); }, res: 'In class you started looking out the window. You were calculating how much you could earn a month working in a factory.' },
      ] },
    { id: 'c_grandpa_ill', age: 14, t: 'grandpa', auto: true,
      cond: (g) => g.alive('gp') && rural(g),
      fx: (g) => g.stat('人缘', 1),
      text: (g) => CN.who(g, 'gp', true) + ' had grown more stooped than ever. ' + (CN.livesWith(g, 'gp') || !g.recall('migrated')
        ? 'He still went out to the fields every day, then sat on the doorstep when he came back and asked how your exams had gone. You said okay, and he smiled.'
        : 'He asked on the phone how your exams had gone. You said okay, and he burst out laughing on the other end.') },

    /* ================= 15 岁：中考 ================= */
    { id: 'c_zk_score', age: 15, t: 'The Zhongkao', auto: true,
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
        CN.setEdu(g, 'junior', 'Junior high');
        atSchool(g, 'Zhongkao exam hall');
      },
      text: (g) => ({ high: 'The zhongkao results came out. You did very well, enough to get into the best high school.', mid: 'The zhongkao results came out. Your score was enough for an ordinary high school, a notch below the good ones.', low: 'The zhongkao results came out. Your score didn’t reach the line for regular high school.' }[g.recall('zkScore')]) },
    { id: 'c_zhongkao', age: 15, t: 'Choosing a High School',
      text: (g) => {
        const z = g.recall('zkScore');
        if (z === 'high') return 'Your homeroom teacher called to ask which high school you wanted to list.';
        if (z === 'low') return 'Your homeroom teacher said vocational school was a path too: learn a trade, find a job easily.';
        if (away(g)) return 'Mom and Dad asked about your score on the phone over and over, and had ' + carer(g) + ' photograph the score sheet and send it to them.';
        if (g.recall('parentsSplit')) return 'Mom took the score sheet and called Dad. For once the two of them talked it over calmly.';
        return parents(g) + ' looked at the score sheet and talked it over for several nights.';
      },
      choices: [
        { t: 'Go to the best high school', canon: true, cond: (g) => g.recall('zkScore') === 'high', fx: (g) => { CN.setEdu(g, 'senior', 'In high school'); g.remember('school', 'key'); g.remember('hs', 'key'); g.stat('心情', 3); }, res: (g) => 'The admission letter arrived at the house, and ' + (away(g) ? carer(g) + ' took a photo of it and sent it to Mom and Dad far away.' : parents(g) + ' took a photo of it and posted it in the relatives’ group chat.') },
        { t: 'Go to an ordinary high school', canon: true, cond: (g) => g.recall('zkScore') === 'mid', fx: (g) => { CN.setEdu(g, 'senior', 'In high school'); g.remember('school', 'normal'); g.remember('hs', 'normal'); }, res: (g) => 'You enrolled in an ordinary high school in ' + (hk(g) === 'city' ? 'the city' : 'the county') + '. In three years there would be another chance.' },
        { t: 'Go to an ordinary high school on a full scholarship', dev: 20, cond: (g) => g.recall('zkScore') === 'high' && ['farmer', 'migrant', 'worker'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', 'In high school'); g.remember('school', 'normal'); g.remember('hs', 'scholar'); g.stat('财富', 4); }, res: 'The school waived your tuition and paid a monthly living allowance. You were the highest scorer that school took that year.' },
        { t: 'Go to vocational school and learn a trade', canon: true, cond: (g) => g.recall('zkScore') === 'low', fx: (g) => { CN.setEdu(g, 'vocational', 'In vocational school'); g.remember('school', 'weak'); g.remember('hs', 'voc'); }, res: 'You went to the vocational school in the county. On the first day you saw rows of machines in the training workshop and felt a wave of relief.' },
        { t: 'Go to vocational school and study what you like', dev: 25, cond: (g) => g.recall('zkScore') !== 'low', fx: (g) => { CN.setEdu(g, 'vocational', 'In vocational school'); g.remember('school', 'normal'); g.remember('hs', 'vocChoice'); g.stat('心情', 4); }, res: 'Teachers and family all tried to talk you out of it. You said, this is what I want to study.' },
        { t: 'Pay for a private high school', dev: 15, cond: (g) => g.recall('zkScore') !== 'high' && ['rich', 'civil', 'smallbiz'].includes(fam(g)), fx: (g) => { CN.setEdu(g, 'senior', 'In high school'); g.remember('school', 'normal'); g.remember('hs', 'private'); g.stat('财富', -8); }, res: (g) => 'A year of tuition was as much as ' + parents(g) + ' earned in half a year. Mom said she would sell everything they owned if she had to, so you could go to high school.' },
        { t: 'Quit school and go out to work', dev: 20, cond: (g) => g.recall('zkScore') === 'low' || g.recall('push') === 'quit', fx: (g) => { CN.setEdu(g, 'junior', 'Junior high'); g.remember('hs', 'work'); g.stat('财富', 2); }, res: 'You sold your textbooks to the scrap collector, keeping only one Chinese textbook. That summer you went to work as a helper in a restaurant in the county town.' },
      ] },

    /* ================= 16 岁 ================= */
    { id: 'c_hs_track', age: 16, t: 'Choosing Subjects', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: 'In the second semester of first year, it was time to choose subjects. Physics or history, one of the two, and then two more after that. Your desk mate had already filled in the form.',
      choices: [
        { t: 'Choose physics, more majors later', canon: true, fx: (g) => { g.remember('track', 'sci'); g.stat('学识', 2); }, res: 'Every day you wrestled with force diagrams. The teacher said the physics path was wider.' },
        { t: 'Choose history, because you like it', dev: 15, fx: (g) => { g.remember('track', 'arts'); g.stat('心情', 3); }, res: 'You liked reading about the past. You felt people in the past weren’t so different from people today.' },
        { t: 'Listen to your family, who say it’s easier to pass the civil service exam that way', dev: 10, fx: (g) => { g.remember('track', 'arts'); g.remember('parentsPlan', 'civil'); g.stat('人缘', 2); }, res: (g) => parents(g) + ' were very pleased. When you wrote “history” on the form, you didn’t think much of it.' },
      ] },
    { id: 'c_voc_major', age: 16, t: 'Major', loc: 'school',
      cond: (g) => g.recall('edu') === 'vocational',
      text: 'Time to choose majors at vocational school. The employment rates of several popular majors were posted on the wall.',
      choices: [
        { t: 'Auto repair or mechatronics, easy to find work', canon: true, fx: (g) => { g.remember('vocMajor', 'mech'); g.stat('健康', 1); g.info('Major', 'mechatronics'); }, res: 'From then on there was always oil under your fingernails that wouldn’t wash out. The first time you reassembled an engine and it started, you yelled out in the workshop.' },
        { t: 'Nursing or early-childhood education', dev: 10, fx: (g) => { g.remember('vocMajor', 'care'); g.stat('人缘', 3); g.info('Major', 'nursing'); }, res: 'You learned to take blood pressure and give injections. The teacher said there would be more and more elderly people, and this field was short of workers.' },
        { t: 'E-commerce livestreaming', dev: 15, fx: (g) => { g.remember('vocMajor', 'ecom'); g.stat('心情', 2); g.info('Major', 'e-commerce'); }, res: 'The first time you said “hey, everybody!” to the camera, you cracked up first.' },
        { t: 'Industrial robot maintenance', dev: 15, cond: (g) => g.s('学识') >= 40, fx: (g) => { g.remember('vocMajor', 'robot'); g.stat('学识', 3); g.info('Major', 'robot repair'); }, res: 'The robotic arm in the training room was taller than you. When you got it moving for the first time, the whole class applauded.' },
      ] },
    { id: 'c_first_job', age: 16, t: 'First Job',
      cond: (g) => g.recall('hs') === 'work',
      text: 'You were sixteen, old enough to go out and work properly. Your cousin said a factory was hiring, and the restaurant owner said you could stay and learn to cook.',
      choices: [
        { t: 'Go with your cousin to a factory in the south', canon: true, fx: (g) => { const c = CN.goCity(g, 2, CN.pick(['Dongguan', 'Suzhou', 'Foshan', 'Ningbo'])); CN.setJob(g, 'worker', 'Factory assembly line'); g.move('factory', c + ' · Electronics factory'); g.stat('财富', 3); g.stat('健康', -2); }, res: (g) => 'In ' + g.recall('workCity') + ', you stood on the assembly line twelve hours at a stretch. When your first month’s pay came, you sent half of it home and spent the rest treating your cousin to barbecue.' },
        { t: 'Stay at the restaurant and learn to cook', dev: 15, fx: (g) => { CN.setJob(g, 'shop', 'Restaurant apprentice'); g.move('county', 'County town · Restaurant kitchen'); g.remember('craft', 'cook'); g.stat('人缘', 2); }, res: 'The master had a terrible temper and wonderful knife skills. You ruined thirty kilos of potatoes before you learned to cut them into shreds. He swore at you, but at closing time he gave you an extra bowl of rice.' },
        { t: 'Learn a trade from your uncle in the village', dev: 20, fx: (g) => { CN.setJob(g, 'worker', 'Apprentice'); g.remember('craft', CN.pick(['tile', 'electric', 'weld'])); CN.goHome(g); g.stat('健康', 2); }, res: 'You followed your uncle from village to village, installing plumbing and electrics and laying tile. Uncle said, a skill in your hands means you won’t go hungry.' },
      ] },

    /* ================= 17 岁 ================= */
    { id: 'c_hs_path', age: 17, t: 'Eleventh Grade', loc: 'school',
      cond: (g) => g.recall('edu') === 'senior',
      text: (g) => {
        const t = g.recall('talent');
        const bit = t === 'art' ? 'The art teacher asked whether you wanted to go the art-exam route.' : t === 'sport' ? 'The PE teacher asked whether you wanted to go the sports-exam route.' : t === 'code' || g.recall('olympiad') ? 'The math teacher asked whether you wanted to get into competitions.' : 'Your homeroom teacher said that in the last year and a half, what counted was your fundamentals.';
        return 'The second year of high school was nearly over. ' + bit;
      },
      choices: [
        { t: 'Prepare for the gaokao honestly', canon: true, fx: (g) => { g.remember('hsPath', 'normal'); g.stat('学识', 3); }, res: 'The papers on your desk stacked up as high as a person.' },
        { t: 'Sign up for a cram class to fix your weakest subject', dev: 10, cond: (g) => fam(g) !== 'rich', fx: (g) => { g.remember('hsPath', 'tutor'); g.stat('学识', 4); g.stat('财富', -3); g.stat('心情', -1); }, res: 'The cram school was on the fifth floor of an old building and didn’t let out until ten at night. That subject’s score finally stopped dragging you down.' },
        { t: 'Take the art-exam route', dev: 20, cond: (g) => g.recall('talent') === 'art', fx: (g) => { g.remember('hsPath', 'art'); g.stat('心情', 3); g.stat('财富', -4); }, res: 'You went to an art studio in the provincial capital for six months of intensive training, drawing ten hours a day.' },
        { t: 'Take the sports-exam route', dev: 20, cond: (g) => g.recall('talent') === 'sport', fx: (g) => { g.remember('hsPath', 'sport'); g.stat('健康', 5); }, res: 'You ran twenty laps a day. Your legs were all muscle, and your schoolbag was still full of the same papers.' },
        { t: 'Go for the competition and gamble on a recommended admission', dev: 25, cond: (g) => g.recall('talent') === 'code' || !!g.recall('olympiad'), check: ['学识', 70], fx: (g) => { g.remember('hsPath', 'olympiad'); g.stat('学识', 6); g.stat('心情', 3); }, res: 'You won first prize in the province. Teachers from several top universities came to talk with you.',
          fail: { fx: (g) => { g.remember('hsPath', 'normal'); g.stat('心情', -4); g.stat('学识', 1); }, res: 'You were just short. By the time you got back to the classroom, everyone else had already finished a round of review. Your desk mate pushed the notes they had organized in front of you.', dev: 5 } },
        { t: 'Don’t want to take the exam; want to study abroad', dev: 20, cond: (g) => fam(g) === 'rich' && !g.recall('olympiad'), fx: (g) => { g.remember('hsPath', 'abroad'); g.stat('财富', -5); g.stat('学识', 2); }, res: 'You started taking language tests and applying to universities abroad. Your classmates were drilling practice questions, and you were writing application essays.' },
      ] },
    { id: 'c_voc_intern', age: 17, t: 'Internship', loc: 'factory',
      cond: (g) => g.recall('edu') === 'vocational',
      text: (g) => 'The last year of vocational school was an internship. ' + ({ mech: 'You were assigned to a car parts factory.', care: 'You were assigned to a nursing home in the city.', ecom: 'You were assigned to a small company that did livestream selling.', robot: 'You were assigned to an automated factory, repairing robotic arms.' }[g.recall('vocMajor')] || 'You were assigned to a factory.') + ' The teacher said you could also prepare for the “vocational college entrance exam” and aim for a higher vocational college.',
      choices: [
        { t: 'Stay on after the internship', canon: true, fx: (g) => { g.remember('vocPlan', 'work'); g.stat('财富', 2); g.stat('事业', 2); }, res: 'The boss said you were quick with your hands and could start work after you graduated.' },
        { t: 'Prepare for higher vocational college (a junior college program)', dev: 20, fx: (g) => { g.remember('vocPlan', 'college'); g.stat('学识', 4); }, res: 'You interned in the daytime and did practice problems in the dorm at night. Only your light was on in the dorm.' },
      ] },
    { id: 'c_work_17', age: 17, t: 'A Year Later',
      cond: (g) => g.recall('hs') === 'work',
      text: (g) => (g.recall('job') === 'worker' && !g.recall('craft') ? 'You could do the work on the assembly line with your eyes closed. ' : 'The master said it was too early for you to graduate as a journeyman. ') + 'Among your coworkers, some were saving up to learn a skill, and some said they’d go to a big city to deliver food, where the pay was higher.',
      choices: [
        { t: 'Keep working and save money', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('workPlan', 'stay'); CN.earn(g, 6000); }, res: (g) => 'You spent only about $100 a month. At the end of the year you did the sums and had ' + CN.fmt(CN.cash(g)) + ', and you looked at that number again and again.' },
        { t: 'Sign up for night school to learn a skill', dev: 20, fx: (g) => { g.stat('学识', 4); g.remember('workPlan', 'study'); CN.pay(g, 3000); }, res: (g) => 'Tuition was ' + CN.fmt(3000) + '. After work you went to class, dozed off in it, and pinched yourself awake.' },
        { t: 'Go try your luck in a big city', dev: 20, fx: (g) => { const c = CN.goCity(g, 1); CN.setJob(g, 'rider', 'Delivery rider'); g.stat('健康', -2); g.remember('workPlan', 'city'); g.move('metro', c); }, res: (g) => 'You arrived in ' + g.recall('workCity') + ', rented a bunk bed, and got on an electric scooter. The city was far bigger than you had imagined.' },
      ] },
    { id: 'c_gaokao_eve', age: 17, t: 'The Last Summer', auto: true,
      cond: (g) => g.recall('edu') === 'senior',
      fx: (g) => g.stat('学识', 1),
      text: (g) => (g.recall('hsPath') === 'abroad' ? 'You received an admission email from a university abroad. ' : 'The summer before senior year, you got only seven days off. ')
        + (g.recall('track') === 'sci' ? 'Your physics teacher said your electromagnetism still needed work. ' : g.recall('track') === 'arts' ? 'You turned the dates in your history book into rhymes. ' : '')
        + (g.recall('parentsPlan') === 'civil' ? 'Mom and Dad had already started asking around about what the civil service exam covered. ' : '')
        + (g.recall('crush') === 'pact' ? 'The person you had hooked pinkies with was in the same class as you.' : '') },

    /* ---------- 更多自动节点：让每个童年有血有肉 ---------- */
    { id: 'c_older_sib', age: 3, t: 'Big Brother or Sister', auto: true,
      cond: (g) => !!olderSib(g),
      fx: (g) => g.stat('人缘', 2),
      text: (g) => { const s = olderSib(g); return (s.sex === '男' ? 'older brother' : 'older sister') + s.name + ' came home from school, and the first thing was to pick you up and whirl you around. ' + (left(g) ? 'With Mom and Dad away,' + (s.sex === '男' ? ' ' : ' ') + 'it was almost like having a second grown-up in the house.' : ''); } },
    { id: 'c_june_show', age: 5, t: 'Children’s Day', auto: true,
      cond: (g) => g.recall('kinder') !== 'none',
      fx: (g) => g.stat('心情', 2),
      text: (g) => (g.recall('kinder') === 'bilingual' ? 'At the kindergarten’s Children’s Day show, you played a tree that could speak English. ' : 'On Children’s Day, June 1, you had a red dot painted on your forehead and danced in the second row. ') + (away(g) ? carer(g) + ' held up a phone to film, and it died halfway through.' : 'In the audience, Mom and Dad held up their phones, more nervous than you were.') },
    { id: 'c_first_award', age: 7, t: 'End of Term', auto: true,
      fx: (g) => { const good = g.s('学识') >= 45; g.remember('firstAward', good); g.stat('心情', good ? 3 : -1); },
      text: (g) => (g.recall('firstAward') ? 'At the end of first grade, you brought home a “Three Good Student” certificate. ' + (away(g) ? carer(g) + ' stuck it in the middle of the main room and pointed it out to every visitor.' : 'Mom and Dad stuck it on the fridge.') : 'At the end of first grade, you failed math. You hid the paper at the very bottom of your schoolbag. In the second semester, your desk mate taught you one problem every break.') },
    { id: 'c_summer_visit', age: 8, t: 'Summer Vacation', auto: true,
      cond: (g) => away(g),
      fx: (g) => { g.stat('心情', 3); g.stat('学识', 1); },
      text: (g) => 'In the summer vacation, Mom and Dad took you to ' + pcity(g) + ' to stay for half a month. They worked during the day, and you watched TV in the rented room, waiting for them to get home. On the last day they took you to ' + (seaCity(pcity(g)) ? 'the seaside. You saw the sea for the first time, and ' : 'an amusement park. You rode a Ferris wheel for the first time, and ') + 'you remembered it for many years.' },
    { id: 'c_new_home', age: 9, t: 'Moving House', auto: true,
      cond: (g) => ['white', 'civil', 'rich'].includes(fam(g)) && !rural(g) && !left(g),
      fx: (g) => { const moved = g.rnd() < 0.5; g.remember('newHome', moved); if (moved) { g.stat('心情', 2); g.stat('财富', -3); } },
      text: (g) => (g.recall('newHome')
        ? (g.recall('school') === 'key' ? 'The family bought a flat in the new district, and you got a room of your own. School was farther away, and Dad drove you every morning. Mom and Dad said the mortgage would take twenty years to pay off.' : 'The family moved to a different flat. It was closer to school, and you got a room of your own. Mom and Dad said the mortgage would take twenty years to pay off.')
        : 'Your classmates moved into new housing complexes one after another. Your family still lived in the old flat, where the hallway light had been broken for a year. Later you and Dad changed the bulb together.') },
    { id: 'c_glasses', age: 10, t: 'Nearsighted', auto: true,
      fx: (g) => { const my = g.recall('kidStyle') === 'ai' || g.recall('homework') === 'copy' || g.rnd() < 0.45; g.remember('glasses', my); if (my) g.stat('健康', -1); },
      text: (g) => (g.recall('glasses') ? 'At the check-up, you couldn’t read the third row of the eye chart. You got your first pair of glasses, and the world was suddenly startlingly clear.' : 'At the check-up, your vision was still 5.0 (a perfect score on the Chinese eye chart). Half your class had glasses by now.') },
    { id: 'c_ai_class', age: 11, t: 'A New Class', auto: true,
      fx: (g) => g.stat('学识', 1),
      text: (g) => (rural(g) && !g.recall('migrated') ? 'The town school had put in a big screen, and teachers from the city taught you from the other side of it. When the signal was bad, the teacher’s face turned to mosaic.' : 'The school added a new class that taught how to talk to AI and how to tell whether what it says is true.') },
    { id: 'c_sports_day', age: 11, t: 'Sports Day', auto: true,
      fx: (g) => { const run = g.s('健康') >= 70 || g.recall('talent') === 'sport'; g.remember('sportsDay', run); if (run) g.stat('人缘', 2); },
      text: (g) => (g.recall('sportsDay') ? 'At Sports Day you ran the 800 meters and came second. The whole class waited at the finish line for you.' : 'At Sports Day your job was to cheer from the stands, and you cheered until your voice gave out.') },
    { id: 'c_growing', age: 13, t: 'Growing Up', auto: true,
      fx: (g) => g.stat('健康', 1),
      text: (g) => (isMale(g) ? 'Your voice deepened and a fuzz appeared on your upper lip. Over one summer you grew eight centimeters. ' : 'You grew several centimeters over one summer. ')
        + (away(g) ? 'Mom mailed you a new coat from far away, the sleeves a bit long, and ' + carer(g) + ' said to save it to wear next year.' : isMale(g) ? '' : 'Mom took you shopping for new clothes, and for the first time you picked the colors yourself.') },
    { id: 'c_gm_ill', age: 13, t: 'Grandma Falls Ill', auto: true,
      cond: (g) => away(g) && g.alive('gm') && CN.livesWith(g, 'gm'),
      fx: (g) => { g.stat('人缘', 3); g.stat('学识', -1); },
      text: (g) => CN.who(g, 'gm', true) + ' was sick for a while and spent half a month in bed. You learned to cook porridge and brew herbal medicine, and on weekends took her to town for injections. When Mom and Dad called, you said Grandma was doing fine. Half a month later she was back in the yard feeding the chickens.' },
    { id: 'c_shop_closed', age: 14, t: 'The Shop', auto: true,
      cond: (g) => fam(g) === 'smallbiz',
      fx: (g) => { const bad = g.rnd() < 0.4; g.remember('shopClosed', bad); if (bad) { g.stat('财富', -6); g.stat('心情', -2); } else g.stat('财富', 2); },
      text: (g) => (g.recall('shopClosed') ? 'The family’s little shop closed. You could buy anything online, and fewer and fewer people came into the shop. Half a year later, Dad started selling the stock online again. Business was smaller, but at least he was home for dinner every night.' : 'The family’s little shop was still open, and after school you did your homework behind the counter and helped take the money.') },
    { id: 'c_id_card', age: 16, t: 'ID Card', auto: true,
      fx: (g) => g.stat('心情', 1),
      text: (g) => 'You got your first ID card. In the photo you were scowling, ' + (g.recall('glasses') ? 'with your glasses off and your eyes a little blurry. ' : 'with a haircut you’d just gotten the day before. ') + (g.recall('hs') === 'work' ? 'With it, you could now sign a proper labor contract.' : '') },
    { id: 'c_hs_start', age: 16, t: 'School Starts', auto: true,
      cond: (g) => ['senior', 'vocational'].includes(g.recall('edu')),
      fx: (g) => { if (g.recall('edu') === 'senior') atSchool(g, g.recall('hs') === 'key' ? 'Key High School' : 'High school'); else atSchool(g, 'Vocational school'); },
      text: (g) => (g.recall('edu') === 'senior'
        ? (g.recall('hs') === 'key' ? 'At the key high school, evening study went until ten. The top student of the year was already reciting English words in the corridor at half past five every morning. ' : g.recall('hs') === 'scholar' ? 'You were the school’s “future top scorer,” and the principal read your name out at the opening ceremony. ' : 'At the start of first year, military training burned off a layer of your skin. ')
          + (rural(g) ? 'The county high school required boarding. You went home once a month, and each time you returned to school you carried a jar of pickles made at home.' : '')
        : 'The vocational school’s dormitory faced a construction site. In the first week, you met the five other people in your dorm, all from different counties.') },
  ]);

  /* ---------- 随时可能发生的家事：兄弟姐妹出生、爷爷奶奶离世、旧日的回声 ---------- */
  const sibBorn = (id) => ({
    id: 'e_c_born_' + id, y: [2027, 2033], maxAge: 6, t: 'A New Arrival', auto: true, always: true,
    cond: (g) => { const s = JY.byId[id]; return !!s && s.born === g.Y; },
    fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); },
    text: (g) => {
      const s = JY.byId[id], he = s.sex === '男' ? ' ' : ' ';
      return 'You now had a ' + (s.sex === '男' ? 'younger brother' : 'younger sister') + ', ' + s.name + '. Everyone crowded around the new baby,' + he + 'and you stood off to one side holding your own toys for a long time. '
        + (left(g) ? 'Mom finished her postpartum month and left again,' + he + 'leaving the baby with ' + carer(g) + '. ' : '') + 'Later, when' + he + 'the baby could walk, the first thing was to wobble along behind you.';
    },
  });
  const gpGone = (id, who) => ({
    id: 'e_c_gone_' + id, y: [2027, 2043], maxAge: 17, t: who, auto: true, always: true,
    cond: (g) => !!JY.byId[id] && !g.alive(id),
    fx: (g) => { g.stat('心情', -4); if (g.recall('leftBehind')) g.stat('心情', -3); },
    text: (g) => {
      const raised = g.recall('leftBehind') || (id === 'gm' && (g.recall('boarding') === 'gm' || g.recall('nanny') === 'gm'));
      return (raised
        ? CN.who(g, id) + ' had been gone almost a year. It was ' + who + ' who had raised you. ' + (id === 'gm' ? 'You kept Grandma’s old towel, and even when it had washed out pale you wouldn’t let anyone throw it away.' : 'You propped Grandpa’s cane, worn smooth and shiny, against your own bedside.')
        : 'At the Qingming festival, you went with the grown-ups to sweep the grave of ' + CN.who(g, id) + '. On the way home, you remembered how ' + who + ' always used to keep a piece of candy in a pocket for you.');
    },
  });
  JY.addEncounters([
    sibBorn('sib0'), sibBorn('sib1'),
    gpGone('gp', 'grandpa'), gpGone('gm', 'grandma'),
    // 当年对转学来的同学怎么样，几年后有回音
    { id: 'e_c_kindness_echo', y: [2040, 2044], minAge: 14, maxAge: 17, t: 'An Old Classmate', auto: true, always: true,
      cond: (g) => ['friend', 'laughed'].includes(g.recall('kindness')),
      fx: (g) => { if (g.recall('kindness') === 'friend') g.stat('人缘', 3); else g.stat('心情', -1); },
      text: (g) => (g.recall('kindness') === 'friend'
        ? 'That kid with the strong accent, who had transferred away several years ago, suddenly sent you a photo: he had gotten into the best high school back in his hometown. Below it, a line: Thank you for playing with me back then.'
        : 'You scrolled onto a video online about what it felt like to be mocked for your accent as a kid. You thought of the transfer student and couldn’t remember his name.') },
    // 小时候的那次拉人，后来有人记得
    { id: 'e_c_river_echo', y: [2040, 2044], minAge: 15, maxAge: 17, t: 'Eggs', auto: true, always: true,
      cond: (g) => g.recall('river') === 'saved' && g.f('childSavedKid'),
      fx: (g) => g.stat('人缘', 3),
      text: 'The little kid you once pulled out of the river was in junior high now. His mother left a basket of eggs at your door every year, and never knocked.' },
    // 父母离婚以后
    { id: 'e_c_split_echo', y: [2038, 2043], minAge: 12, maxAge: 17, t: 'Weekend', auto: true, always: true,
      cond: (g) => g.recall('parentsSplit') === true && g.alive('fa'),
      fx: (g) => { g.stat('心情', -1); g.stat('学识', 1); },
      text: 'Once a month you went to Dad’s for a meal. Everyone at the table was very polite, and he always remembered to put your favorite dish in your bowl. On the bus home you wore earphones and played nothing.' },
    // 小时候第一句话叫的是奶奶
    { id: 'e_c_firstword_echo', y: [2036, 2043], minAge: 10, maxAge: 17, t: 'grandma', auto: true, always: true,
      cond: (g) => g.recall('firstWord') === 'grandma' && g.alive('gm') && g.recall('askedMom') === 'home',
      fx: (g) => g.stat('人缘', 2),
      text: 'Grandma’s eyesight was fading, and she needed your help threading needles. She said your first word as a little kid had been Grandma, and she had told you so many times that you pretended to hear it for the first time.' },
  ]);

  /* ---------- 童年专属闲笔（0–5 岁按年龄放开） ---------- */
  JY.addFlavor('age:child', [
    { t: 'You put Grandma’s reading glasses on your head and announced you were the teacher.', minAge: 3, cond: (g) => g.recall('leftBehind') && g.alive('gm') },
    { t: 'The first snow fell, and a grown-up carried you to the door. You reached out to catch it, and the snow melted in your palm.', minAge: 1, cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: 'You went down the slide in the housing complex a hundred times and still wouldn’t go home.', minAge: 3, cond: (g) => g.recall('hukou') !== 'rural' },
    { t: 'You chased the village geese, and then the geese chased you back.', minAge: 3, cond: (g) => g.recall('hukou') === 'rural' },
    { t: 'Whenever a grown-up teased you, you giggled until drool ran down your chin.', maxAge: 1 },
    { t: 'You grabbed a grown-up’s finger and squeezed it tight, and wouldn’t let go no matter what.', maxAge: 0 },
    { t: 'Your first tooth came in, and you bit down on everything.', minAge: 0, maxAge: 1 },
    { t: 'You learned to roll over, and if no one was watching you rolled from one end of the pillow to the other.', maxAge: 0 },
    { t: 'You learned to say “no,” and said it a hundred times a day.', minAge: 2, maxAge: 4 },
    { t: 'You stacked blocks taller than yourself, then knocked them over with one swat and laughed until you fell over backwards.', minAge: 2 },
    { t: 'The lullaby Grandma sang was from her hometown, and you fell asleep listening.', maxAge: 2, cond: (g) => (g.recall('leftBehind') || ['gm', 'home'].includes(g.recall('nanny'))) && g.alive('gm') },
    { t: 'The daycare teacher said you were the first in the class who could put on your own shoes.', minAge: 2, maxAge: 3, cond: (g) => g.recall('nanny') === 'daycare' },
    { t: 'A customer came into the shop, and you copied Mom and Dad and said “welcome in,” which made the customer laugh.', minAge: 3, cond: (g) => g.recall('nanny') === 'shop' },
    { t: 'You squatted at the door and watched ants move house for a whole afternoon.', minAge: 3 },
  ]);
  JY.addFlavor('age:young', [
    { t: 'On Friday after school, you waited for Grandma at the school gate until dark. When she arrived, she was carrying a bag of hot roasted sweet potatoes.', cond: (g) => g.recall('leftBehind') && !g.recall('migrated') && g.alive('gm') },
    { t: 'The buildings in the urban village were so close together that from your window you could pass things to a classmate in the building across the way.', cond: (g) => g.recall('migrated') },
    { t: 'In the alley of the urban village, the flatbread vendor remembered that you didn’t want scallions.', cond: (g) => g.recall('migrated') && g.recall('cityKid') === 'roam' },
    { t: 'Your phone screen had a crack across it, and you could never bring yourself to replace it.', cond: (g) => g.recall('phone') === 'game' },
    { t: 'In an online class, you listened to a university professor talk about the universe until midnight.', cond: (g) => g.recall('phone') === 'study' },
    { t: 'You stole a glance at that person’s seat, then pretended to be looking at the blackboard.', cond: (g) => ['hidden', 'pact', 'told'].includes(g.recall('crush')) },
    { t: 'After lights-out in the dorm, you finished the last problem by flashlight.', cond: (g) => g.recall('push') === 'hard' },
    { t: 'When Mom and Dad argued, they would look at you first and then lower their voices.', cond: (g) => g.recall('glue') === true },
    { t: 'In the corridor you ran into those older kids who used to block people, and they pretended not to know you.', cond: (g) => ['stood', 'teacher', 'beaten'].includes(g.recall('bully')) },
    { t: 'You thought about that day you walked around them many times afterward.', cond: (g) => g.recall('bully') === 'away' },
    { t: 'A stray cat on the roadside meowed at you. You remembered the one you hadn’t dared to touch as a kid, and crouched down to look at it for a while.', cond: (g) => g.recall('kidPet') === 'no' },
    { t: 'Since Mom came back, the lights at home were on every night. Walking back from school to the village entrance, you could see them from far away.', cond: (g) => g.recall('momBack') === 'mo' },
  ]);
  // 16、17 岁归在 adult 闲笔里，用 maxAge 卡住
  JY.addFlavor('age:adult', [
    { t: 'In your night-school textbook, you wrote the date in the corner of every page.', maxAge: 19, cond: (g) => g.recall('workPlan') === 'study' },
    { t: 'When you called home, you said only that everything was fine, not that you were tired.', maxAge: 19, cond: (g) => ['stay', 'city'].includes(g.recall('workPlan')) },
    { t: 'On the last day of your internship, the master patted your shoulder and said to come find him if you ever needed anything.', maxAge: 18, cond: (g) => g.recall('vocPlan') === 'work' },
    { t: 'After lights-out in the dorm, you did vocational college entrance exam problems by the light from the corridor.', maxAge: 17, cond: (g) => g.recall('vocPlan') === 'college' },
    { t: 'A countdown was posted on the back wall of the senior-year classroom, and every day someone tore off a page.', minAge: 17, maxAge: 17, cond: (g) => g.recall('edu') === 'senior' && g.recall('hsPath') !== 'abroad' },
  ]);
})();

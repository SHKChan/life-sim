/* 由 share/tools/tr.js 从 data/world.js 和 lang/en/tr/world.json 生成，不要手改。 */
/* 十四亿分之一 · 世界设定与投胎生成器
 * 这一份放：年代、地点、省份数据、投胎生成器、年度重心、人生关口、给剧情用的工具函数 JY.CN。
 * 人生各阶段的剧情在 childhood / youth / midlife / oldage / events 里。写之前读 docs/SPEC.md。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const NOW = 2026; // 所有人都在这一年出生

  /* ---------- 年代 ---------- */
  JY.ERAS = [[2029, '2020s'], [2039, '2030s'], [2049, '2040s'], [2059, '2050s'], [2069, '2060s'], [2079, '2070s'], [2089, '2080s'], [2099, '2090s'], [9999, '22nd century']];

  /* ---------- 地点：场景图按这里的 scene 画（scenes.js） ----------
   * 地点是“类型”，具体城市名由 g.move(地点, '城市名 · 说明') 的第二个参数给出。 */
  JY.addLocs({
    village_n: { name: 'Northern village', scene: 'cn_village_n', desc: 'A village on the plain' },
    village_s: { name: 'Southern village', scene: 'cn_village_s', desc: 'A village at the foot of the hills' },
    village_w: { name: 'Western village', scene: 'cn_village_w', desc: 'A village on the plateau' },
    county: { name: 'County town', scene: 'cn_county', desc: 'One main street, a few new buildings' },
    city: { name: 'Prefecture-level city', scene: 'cn_city', desc: 'City' },
    metro: { name: 'Big city', scene: 'cn_metro', desc: 'Skyscrapers everywhere' },
    school: { name: 'School', scene: 'cn_school', desc: 'Playground and classroom blocks' },
    campus: { name: 'University', scene: 'cn_campus', desc: 'University campus' },
    factory: { name: 'Factory', scene: 'cn_factory', desc: 'Assembly line' },
    office: { name: 'Office tower', scene: 'cn_office', desc: 'Cubicles' },
    hospital: { name: 'Hospital', scene: 'cn_hospital', desc: 'A bench in the corridor' },
    home: { name: 'Home', scene: 'cn_home', desc: 'Downstairs in the housing compound' },
    coast: { name: 'Seaside', scene: 'cn_coast', desc: 'Seaside' },
    road: { name: 'On the road', scene: 'cn_road', desc: 'Expressway' },
    hsr: { name: 'High-speed rail station', scene: 'cn_hsr', desc: 'Platform' },
    smart: { name: 'Street corner', scene: 'cn_smart', desc: 'Driverless cars and drones' },
  });

  /* ---------- 省份 ----------
   * [名, 简称, 地区, 出生权重（近年出生人口，万）, 城镇化率 %, 农村类型, [[城市, 等级 1–4], ...]]
   * 城市等级：1 一线，2 新一线和省会，3 普通地级市，4 小城市。数字是估算，只用来做随机权重。 */
  const PROVS = [
    ['Beijing', '京', '华北', 12, 88, 'n', [['Beijing', 1]]],
    ['Tianjin', '津', '华北', 6, 85, 'n', [['Tianjin', 2]]],
    ['Hebei', '冀', '华北', 45, 62, 'n', [['Shijiazhuang', 2], ['Tangshan', 3], ['Baoding', 3], ['Handan', 3], ['Cangzhou', 3]]],
    ['Shanxi', '晋', '华北', 22, 64, 'n', [['Taiyuan', 2], ['Datong', 3], ['Yuncheng', 3], ['Zhangzhi', 3]]],
    ['Inner Mongolia', '蒙', '华北', 13, 69, 'w', [['Hohhot', 2], ['Baotou', 3], ['Chifeng', 3], ['Eerduosi', 3]]],
    ['Liaoning', '辽', '东北', 17, 73, 'n', [['Shenyang', 2], ['Dalian', 2], ['Anshan', 3], ['Jinzhou', 3]]],
    ['Jilin', '吉', '东北', 9, 64, 'n', [['Changchun', 2], ['Jilin', 3], ['Yanbian', 4]]],
    ['Heilongjiang', '黑', '东北', 10, 67, 'n', [['Haerbin', 2], ['Qiqihaer', 3], ['Daqing', 3], ['Mudanjiang', 3]]],
    ['Shanghai', '沪', '华东', 10, 89, 's', [['Shanghai', 1]]],
    ['Jiangsu', '苏', '华东', 48, 75, 's', [['Nanjing', 2], ['Suzhou', 2], ['Wuxi', 3], ['Xuzhou', 3], ['Nantong', 3], ['Yancheng', 3]]],
    ['Zhejiang', '浙', '华东', 50, 74, 's', [['Hangzhou', 2], ['Ningbo', 2], ['Wenzhou', 3], ['Jinhua', 3], ['Taizhou', 3]]],
    ['Anhui', '皖', '华东', 42, 61, 's', [['Hefei', 2], ['Fuyang', 3], ['Wuhu', 3], ['Anqing', 3], ['Lu\'an', 4]]],
    ['Fujian', '闽', '华东', 32, 70, 's', [['Fuzhou', 2], ['Xiamen', 2], ['Quanzhou', 3], ['Zhangzhou', 3]]],
    ['Jiangxi', '赣', '华东', 33, 63, 's', [['Nanchang', 2], ['Ganzhou', 3], ['Jiujiang', 3], ['Shangrao', 3]]],
    ['Shandong', '鲁', '华东', 60, 66, 'n', [['Jinan', 2], ['Qingdao', 2], ['Linyi', 3], ['Weifang', 3], ['Heze', 3], ['Yantai', 3]]],
    ['Henan', '豫', '华中', 73, 58, 'n', [['Zhengzhou', 2], ['Luoyang', 3], ['Nanyang', 3], ['Zhoukou', 3], ['Shangqiu', 3], ['Xinyang', 3]]],
    ['Hubei', '鄂', '华中', 34, 65, 's', [['Wuhan', 2], ['Xiangyang', 3], ['Yichang', 3], ['Jingzhou', 3], ['Huanggang', 3]]],
    ['Hunan', '湘', '华中', 40, 61, 's', [['Changsha', 2], ['Hengyang', 3], ['Yueyang', 3], ['Changde', 3], ['Shaoyang', 3]]],
    ['Guangdong', '粤', '华南', 110, 75, 's', [['Guangzhou', 1], ['Shenzhen', 1], ['Dongguan', 2], ['Foshan', 2], ['Shantou', 3], ['Zhanjiang', 3], ['Meizhou', 4]]],
    ['Guangxi', '桂', '华南', 40, 56, 's', [['Nanning', 2], ['Liuzhou', 3], ['Guilin', 3], ['Yulin', 3]]],
    ['Hainan', '琼', '华南', 11, 62, 's', [['Haikou', 2], ['Sanya', 3], ['Danzhou', 4]]],
    ['Chongqing', '渝', '西南', 18, 71, 's', [['Chongqing', 2]]],
    ['Sichuan', '川', '西南', 50, 59, 's', [['Chengdu', 2], ['Mianyang', 3], ['Nanchong', 3], ['Yibin', 3], ['Dazhou', 3], ['Liangshan', 4]]],
    ['Guizhou', '黔', '西南', 41, 55, 's', [['Guiyang', 2], ['Zunyi', 3], ['Bijie', 3], ['Qiandongnan', 4]]],
    ['Yunnan', '滇', '西南', 41, 52, 'w', [['Kunming', 2], ['Qujing', 3], ['Dali', 3], ['Honghe', 3], ['Zhaotong', 4]]],
    ['Tibet', '藏', '西南', 5, 38, 'w', [['Lhasa', 3], ['Shigatse', 4]]],
    ['Shaanxi', '陕', '西北', 28, 65, 'n', [['Xi\'an', 2], ['Baoji', 3], ['Xianyang', 3], ['Yulin', 3], ['Hanzhong', 3]]],
    ['Gansu', '甘', '西北', 20, 55, 'w', [['Lanzhou', 2], ['Tianshui', 3], ['Qingyang', 4], ['Zhangye', 4]]],
    ['Qinghai', '青', '西北', 5, 62, 'w', [['Xining', 2], ['Haidong', 4]]],
    ['Ningxia', '宁', '西北', 7, 67, 'w', [['Yinchuan', 2], ['Guyuan', 4]]],
    ['Xinjiang', '新', '西北', 26, 59, 'w', [['Urumqi', 2], ['Ili', 3], ['Kashgar', 3], ['Bayingolin', 3]]],
  ];
  const TOTAL_W = PROVS.reduce((a, p) => a + p[3], 0);

  /* ---------- 名字 ---------- */
  const SURNAMES = '王王王李李李张张张刘刘陈陈杨杨黄黄赵吴周徐孙马朱胡郭何林高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤';
  const GIVEN_M = ['子墨', '沐宸', '浩宇', '宇轩', '一鸣', '奕辰', '梓睿', '承泽', '俊熙', '铭哲', '皓轩', '景行', '思源', '博文', '嘉树', '明远', '安然', '天佑', '辰逸', '致远', '星河', '书恒', '亦凡', '家豪', '志强', '建华', '晨阳', '睿', '航', '昊', '凯', '涛', '鹏', '磊', '杰'];
  const GIVEN_F = ['一诺', '若汐', '欣怡', '梓涵', '语桐', '诗涵', '依诺', '可馨', '芷若', '雨萱', '星辰', '安琪', '思琪', '佳怡', '梦瑶', '晓雯', '清欢', '知夏', '念念', '沐瑶', '婉清', '静怡', '小满', '甜甜', '悦', '萌', '琳', '丹', '颖', '洁', '雪', '敏'];
  const OLD_M = ['建国', '建军', '国强', '志刚', '海涛', '永红', '卫东', '小军', '伟', '勇', '军', '斌', '强', '磊', '明', '涛', '鹏'];
  const OLD_F = ['秀英', '桂兰', '丽娟', '晓燕', '春梅', '红霞', '丽', '芳', '静', '燕', '娟', '敏', '霞', '艳', '玲', '琴'];

  /* ---------- 随机工具 ---------- */
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];
  const wpick = (list, w) => { let t = list.reduce((s, x) => s + w(x), 0) * R(); for (const x of list) { t -= w(x); if (t <= 0) return x; } return list[list.length - 1]; };
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seq = 0;
  const uid = (p) => p + Date.now().toString(36) + (seq++).toString(36);

  // 英文等外文界面：名字写成拼音（“Wang Jianguo”），姓和名之间空一格；姓用 CN.surOf(名字) 取，不要写 name[0]
  const PY_C = '一丁万东严丹丽书于亦付任伟佑何余佳依侯俊兰军冯凡凯刘刚勇华博卢卫可史叶向吕吴周哲唐嘉国墨夏天奕姚姜娟婉子孔孙孟宇安宋家宸小尹崔廖建张强彭徐志念思怡恒悦戴承敏文斌方昊明星春晓晨景曹曾朱李杜杨杰林树桂桐梁梅梓梦欢欣武段毛永汐江汤汪沈沐河泽洁浩海涛涵清源满潘然熊熙燕王玲琪琳琴瑶甜田白皓睿知石磊秀秦程红罗肖胡致航艳芳芷苏若英范莫萌萱董蒋蔡薛行袁覃许诗语诺谢谭豪贺贾赵轩辰远逸邓邱邵邹郑郝郭金钟钱铭闫阳陆陈陶雨雪雯雷霞静韦韩顾颖馨马高魏鸣鹏黄黎龙龚';
  const PY_P = 'yi ding wan dong yan dan li shu yu yi fu ren wei you he yu jia yi hou jun lan jun feng fan kai liu gang yong hua bo lu wei ke shi ye xiang lü wu zhou zhe tang jia guo mo xia tian yi yao jiang juan wan zi kong sun meng yu an song jia chen xiao yin cui liao jian zhang qiang peng xu zhi nian si yi heng yue dai cheng min wen bin fang hao ming xing chun xiao chen jing cao zeng zhu li du yang jie lin shu gui tong liang mei zi meng huan xin wu duan mao yong xi jiang tang wang shen mu he ze jie hao hai tao han qing yuan man pan ran xiong xi yan wang ling qi lin qin yao tian tian bai hao rui zhi shi lei xiu qin cheng hong luo xiao hu zhi hang yan fang zhi su ruo ying fan mo meng xuan dong jiang cai xue xing yuan qin xu shi yu nuo xie tan hao he jia zhao xuan chen yuan yi deng qiu shao zou zheng hao guo jin zhong qian ming yan yang lu chen tao yu xue wen lei xia jing wei han gu ying xin ma gao wei ming peng huang li long gong'.split(' ');
  const PY = {};
  [...PY_C].forEach((c, i) => { PY[c] = PY_P[i]; });
  const latin = () => !/^zh/.test(JY.LANG || 'zh');
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  const roman = (t) => cap([...t].map((c) => PY[c] || c).join(''));
  function nameOf(sex, surname, old) {
    const pool = old ? (sex === '男' ? OLD_M : OLD_F) : (sex === '男' ? GIVEN_M : GIVEN_F);
    const sur = surname || pick(SURNAMES), given = pick(pool);
    return latin() ? roman(sur) + ' ' + roman(given) : sur + given;
  }
  const HAIR_COLORS = ['#1f1a17', '#241a14', '#2b211b', '#1a1714'];
  function lookOf(sex, age) {
    const robes = ['#4a6a8a', '#8a4a4a', '#5a7a5a', '#7a6a9a', '#3a3a3a', '#9a7a4a', '#c06a6a', '#4a8a9a', '#6a5a4a'];
    return {
      hair: sex === '男' ? (R() < 0.1 ? 'cap' : 'short') : pick(['ponytail', 'long', 'short', 'ponytail', 'bun']),
      hairColor: pick(HAIR_COLORS), robe: pick(robes), accent: pick(['#e8e1cf', '#2b2b2b', '#c9a45c', '#d0473a']),
      skin: pick(['#e9c49a', '#e2b88e', '#d9ad84', '#efcfa8']), bg: pick(['#c7d8d6', '#d8cfc0', '#cfd6e2', '#e2d2d2']),
    };
  }

  /* 生成一个人（只含数据，能存进存档）。剧情里生成配偶、孩子也用它：JY.CN.person({...}) */
  function person(o) {
    const sex = o.sex || (R() < 0.52 ? '男' : '女');
    const born = o.born != null ? o.born : NOW;
    const old = born < 2010;
    return Object.assign({
      id: o.id || uid('p'), name: o.name || nameOf(sex, o.surname, old), sex, born, minor: true,
      origin: o.origin || '', book: o.book, look: lookOf(sex),
      death: o.death || { y: born + clamp(Math.round(78 + (R() - 0.5) * 24), 40, 102), cause: pick([' died peacefully of old age', ' died of illness', ' died of illness', ' died in their sleep', ' died of heart disease', ' died of cancer']) },
      ms: o.ms || [],
    }, o.extra || {});
  }

  /* ---------- 家庭类型 ----------
   * key: 记忆里的 family；w: 按住处给的权重；bg: 出身几个点；cash: 初始财富；parents: 父母职业说明 */
  const FAMILIES = [
    { key: 'rich', t: 'A wealthy business family', w: { city: 6, county: 3, rural: 0.5 }, bg: 5, cash: [70, 90], dad: 'runs a company', mom: 'keeps the family accounts' },
    { key: 'civil', t: 'Both parents in stable state-sector jobs', w: { city: 20, county: 14, rural: 2 }, bg: 4, cash: [45, 60], dad: 'works at a state-run work unit', mom: 'teaches' },
    { key: 'white', t: 'An office-worker family', w: { city: 34, county: 8, rural: 1 }, bg: 3, cash: [35, 55], dad: 'company employee', mom: 'company employee' },
    { key: 'smallbiz', t: 'A small-shop family (self-employed)', w: { city: 16, county: 30, rural: 8 }, bg: 3, cash: [30, 50], dad: 'runs a small shop', mom: 'helps out in the shop' },
    { key: 'worker', t: 'A factory-worker family', w: { city: 18, county: 26, rural: 10 }, bg: 2, cash: [20, 35], dad: 'factory worker', mom: 'supermarket cashier' },
    { key: 'farmer', t: 'A farming family', w: { city: 0, county: 4, rural: 38 }, bg: 1, cash: [10, 25], dad: 'farms', mom: 'farms and raises pigs' },
    { key: 'migrant', t: 'Parents working away from home', w: { city: 6, county: 12, rural: 40 }, bg: 1, cash: [15, 30], dad: 'works on construction sites far away', mom: 'works in an electronics factory far away' },
  ];
  const HUKOU_T = { city: 'Urban', county: 'County town', rural: 'Rural' };

  /* 和这个出身的大多数人（墓志页、分享卡的对照） */
  function fateOf(fam, hukou) {
    if (fam === 'rich') return 'Went to a private school, then studied abroad or came home to take over the business, bought a home in a big city, handed the business to the next generation around fifty, and lived into their eighties.';
    if (hukou === 'rural') return 'Finished high school in the county town, got into an ordinary university or went off to work early, took a job in a provincial capital or coastal city, married before thirty, bought a flat in the county town, went back home in old age to help with the grandkids, and lived to around eighty.';
    if (hukou === 'county') return 'Finished high school in the county town, went to university in another city, then either came home to take the civil-service exam or stayed on working in the provincial capital, married, had a child, paid a mortgage for twenty or thirty years, and lived to around eighty.';
    return 'Finished university, worked in the home city or a bigger one, married around thirty, had one child, paid a mortgage for thirty years, retired at sixty-five, and lived into their eighties.';
  }

  /* ---------- 投胎 ---------- */
  JY.GENERATE = () => {
    const P = wpick(PROVS, (p) => p[3]);
    const [prov, short, region, birthW, urban, rtype, cities] = P;
    // 城乡：城镇化率决定在城区出生的比例；不在城区的，一部分在县城，其余在农村
    const u = R() * 100;
    const hukou = u < urban - 12 ? 'city' : u < urban + 8 ? 'county' : 'rural';
    const city = hukou === 'city' ? wpick(cities, (c) => (c[1] <= 2 ? 3 : 1)) : wpick(cities, (c) => (c[1] >= 3 ? 2 : 0.5));
    const tier = hukou === 'city' ? city[1] : hukou === 'county' ? 4 : 5;
    const fam = wpick(FAMILIES, (f) => f.w[hukou]);
    const sex = R() < 0.51 ? '男' : '女';
    const surname = pick(SURNAMES);
    const me = person({ sex, surname, id: uid('me'), book: region });
    me.minor = false;
    // 兄弟姐妹：城里多是独生，农村常有哥哥姐姐
    const sibP = hukou === 'rural' ? 0.6 : hukou === 'county' ? 0.4 : 0.25;
    const sibs = R() < sibP ? (R() < 0.25 ? 2 : 1) : 0;
    const order = sibs ? ri(0, sibs) : 0; // 前面有几个
    const leftBehind = fam.key === 'migrant';
    const cityName = /[州区區市]$/.test(city[0]) || !/^zh/.test(JY.LANG || 'zh') ? city[0] : city[0] + ' City'; // 自治州、地区不加“市”
    const muni = prov === city[0]; // 直辖市：郊区的镇子和村子
    const place = hukou === 'city' ? cityName : hukou === 'county' ? (muni ? cityName + ' (a town in the suburbs)' : cityName + ' (a county town)') : (muni ? cityName + ' (a village in the suburbs)' : cityName + ' (a village)');
    const provName = prov === city[0] ? prov + ' City' : ['Inner Mongolia', 'Guangxi', 'Tibet', 'Ningxia', 'Xinjiang'].includes(prov) ? prov + ' ' : prov + ' Province, ';
    const birthplace = muni ? place : provName + place;
    const homeLoc = hukou === 'city' ? (tier <= 2 ? 'metro' : 'city') : hukou === 'county' ? 'county' : 'village_' + rtype;
    // 父母
    const dadAge = ri(24, 36), momAge = clamp(dadAge - ri(0, 4), 21, 40);
    const dad = person({ id: 'fa', sex: '男', surname, born: NOW - dadAge, origin: fam.dad, ms: [[NOW, fam.dad]] });
    const mom = person({ id: 'mo', sex: '女', born: NOW - momAge, origin: fam.mom, ms: [[NOW, fam.mom]] });
    const family = [{ rel: 'father', id: 'fa' }, { rel: 'mother', id: 'mo' }];
    const others = [dad, mom];
    if (sibs) {
      for (let i = 0; i < sibs; i++) {
        const older = i < order;
        const sx = R() < 0.5 ? '男' : '女';
        const sb = person({ id: 'sib' + i, sex: sx, surname, born: older ? NOW - ri(2, 7) : NOW + ri(2, 5), origin: older ? 'Older than you' : 'Younger than you' });
        sb.ms = [[sb.born, 'Born'], [sb.born + 7, 'Started primary school'], [sb.born + 18, 'Finished high school'], [sb.born + 26, 'Working in another city'], [sb.born + 30, 'Started a family']];
        others.push(sb);
        family.push({ rel: (older ? (sx === '男' ? 'older brother' : 'older sister') : (sx === '男' ? 'younger brother' : 'younger sister')), id: sb.id });
      }
    }
    // 爷爷奶奶（老人）
    const gpa = person({ id: 'gp', sex: '男', surname, born: dad.born - ri(22, 30), origin: hukou === 'rural' ? 'Farming back in the hometown' : 'Retired', death: { y: NOW + ri(3, 22), cause: pick([' died of illness', ' died peacefully of old age', ' died of a stroke']) } });
    const gma = person({ id: 'gm', sex: '女', born: dad.born - ri(20, 28), origin: leftBehind ? 'Looking after you at home' : 'Back in the hometown', death: { y: NOW + ri(6, 28), cause: pick([' died of illness', ' died peacefully of old age', ' died in their sleep']) } });
    others.push(gpa, gma);
    family.push({ rel: 'grandpa', id: 'gp' }, { rel: 'grandma', id: 'gm' });
    // 同一年出生的人：散在全国，按同样的规则投胎，只记一条简单的人生
    const peers = [];
    for (let i = 0; i < 4; i++) {
      const pp = wpick(PROVS, (p) => p[3]);
      const pc = pick(pp[6]);
      const ph = R() * 100 < pp[4] ? 'City' : 'Rural';
      const ps = R() < 0.51 ? '男' : '女';
      const path = peerPath(ph);
      const peer = person({ id: 'peer' + i, sex: ps, book: pp[2], origin: 'Born in ' + pp[0] + (latin() ? ', ' : '') + pc[0] + (ph === 'Rural' ? ' (rural area)' : ''), ms: path.ms, death: path.death });
      peers.push(peer.id);
      others.push(peer);
    }
    me.peers = peers;
    // 属性：健康、学识、心情、人缘、财富、事业
    const cash = ri(fam.cash[0], fam.cash[1]);
    me.st = [ri(55, 85), ri(25, 55), ri(55, 75), ri(40, 60), cash, 0];
    if (R() < 0.04) me.st[0] = ri(25, 45); // 先天体弱
    Object.assign(me, {
      birthplace, home: homeLoc, homeCap: (hukou === 'city' ? city[0] : place),
      origin: 'Born in ' + birthplace, bg: fam.bg, family,
      info: { 户籍: HUKOU_T[hukou], 家庭: fam.t, 学历: 'None', 职业: 'None', 婚姻: '', 住处: '' },
      fateText: fateOf(fam.key, hukou),
      focus: '懵懂',
      lastWords: pick(['Next life, I’d still like to come here.', 'Thank you for making this trip with me.', 'Don’t cry. It was all good.', 'I didn’t live this life in vain.']),
      mem: { prov, provShort: short, region, city: city[0], cityTier: city[1], tier, hukou, family: fam.key, sibs, only: !sibs, leftBehind, rtype, homeLoc, homeCap: hukou === 'city' ? city[0] : place },
      facts: [
        ['Birthplace', birthplace],
        ['户籍', HUKOU_T[hukou]],
        ['Family', fam.t],
        ['father', dad.name + ', ' + dadAge + ' years old, ' + fam.dad],
        ['mother', mom.name + ', ' + momAge + ' years old, ' + fam.mom],
        ['Siblings', sibs ? family.filter((f) => /^sib/.test(f.id || '')).map((f) => f.rel).join(', ') : 'Only child'],
      ],
      odds: 'Of the babies born in China this year, about ' + (birthW / TOTAL_W * 100).toFixed(1) + '% were born in ' + prov + '; of those, ' + (hukou === 'rural' ? 'rural births are about ' + Math.max(5, 100 - urban - 8) : hukou === 'county' ? 'county-town births are about 20' : 'urban births are about ' + Math.max(10, urban - 12)) + '%. You are one in 1.4 billion.',
    });
    me.intro = (sex === '男' ? 'A boy' : 'A girl') + ', ' + (R() < 0.5 ? 'born before dawn' : R() < 0.5 ? 'born in the afternoon' : 'born at dusk') + ' in ' + birthplace + ', at the ' + (hukou === 'city' ? 'Hospital' : hukou === 'county' ? 'county hospital' : 'township health clinic') + '. '
      + (leftBehind ? 'After your first month, your parents went back to work in another city, and you stayed with your grandparents.' : fam.key === 'rich' ? 'The ward was full of flower baskets.' : 'Your parents took turns holding you, not quite sure how to hold a baby.');
    return { me, others };
  };

  /* 同龄人的人生：只要几条近况和结局 */
  function peerPath(ph) {
    const B = NOW, ms = [[B, 'Just born']];
    ms.push([B + 3, 'Started kindergarten'], [B + 6, 'Started primary school'], [B + 12, 'Started middle school']);
    const up = ph === 'City' ? 0.75 : 0.5;
    let job;
    if (R() < up) { ms.push([B + 15, 'Started high school'], [B + 18, pick(['Got into university', 'Got into an ordinary university', 'Got into a top university'])]); job = pick(['Works in an office', 'Became a teacher', 'Became a civil servant', 'Works as a programmer', 'Works at a hospital', 'Opened a shop of their own']); }
    else { ms.push([B + 15, pick(['Went to vocational high school', 'Left to work in another city'])]); job = pick(['Works in a factory', 'Delivers takeout', 'Drives a delivery truck', 'Works on a construction site', 'Opened a small restaurant', 'Sells goods by livestream']); }
    ms.push([B + 23, job]);
    if (R() < 0.8) ms.push([B + ri(26, 33), 'Got married']);
    if (R() < 0.65) ms.push([B + ri(28, 36), 'Had a child']);
    if (R() < 0.1) ms.push([B + ri(35, 50), 'Got divorced']);
    ms.push([B + ri(38, 48), pick(['Half the mortgage left', 'Child started primary school', 'Changed jobs', 'Moved their parents in']), null]);
    ms.push([B + 65, 'Retired']);
    ms.push([B + ri(66, 75), pick(['Helping raise the grandkids', 'Learning calligraphy at a seniors’ college', 'Walks in the park every day', 'Moved back to the hometown'])]);
    const dy = B + clamp(Math.round(80 + (R() - 0.5) * 26), 30, 104);
    return { ms: ms.filter((m) => m[0] < dy).map((m) => [m[0], m[1]]), death: { y: dy, cause: pick([' died peacefully of old age', ' died of illness', ' died of illness', ' died of heart disease', ' died of cancer', dy - B < 50 ? ' died in a car accident' : ' died in their sleep']) } };
  }

  /* ---------- 年度重心 ---------- */
  JY.FOCUS = [
    { name: '懵懂', minAge: 0, maxAge: 5, d: '还小，由大人照看。', fx: (g) => { g.stat('心情', 1); if (g.rnd() < 0.3) g.stat('健康', 1); } },
    { name: '用功读书', minAge: 6, maxAge: 22, d: '学识 +2～3，心情会闷。中考、高考、考研都看学识。', fx: (g) => { g.stat('学识', g.rnd() < 0.5 ? 3 : 2); if (g.rnd() < 0.35) g.stat('心情', -1); } },
    { name: '贪玩', minAge: 6, maxAge: 17, d: '心情 +2、人缘 +1，学识会往下掉。', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); if (g.rnd() < 0.5) g.stat('学识', -1); } },
    { name: '帮家里干活', minAge: 8, maxAge: 17, d: '人缘、健康；人会早熟一些。', fx: (g) => { g.stat('人缘', 1); g.stat('健康', 1); if (g.rnd() < 0.3) g.stat('财富', 1); } },
    { name: '学个特长', minAge: 6, maxAge: 17, d: '学识，偶尔有意外收获；家里要花钱。', fx: (g) => { g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('事业', 1); if (g.rnd() < 0.3) g.stat('财富', -1); } },
    { name: '埋头工作', minAge: 16, d: '事业 +3，年终多拿一笔；健康和心情慢慢掉。事业高，工资高、升职和创业更容易成。', fx: (g) => { g.stat('事业', 3); g.stat('财富', 1); if (g.rnd() < 0.35) g.stat('健康', -1); if (g.rnd() < 0.3) g.stat('心情', -1); } },
    { name: '学习充电', minAge: 18, d: '学识；学识高时事业也会涨。', fx: (g) => { g.stat('学识', 2); if (g.rnd() < g.s('学识') / 150) g.stat('事业', 1); } },
    { name: '搞副业', minAge: 18, d: '财富，看运气；累。', fx: (g) => { if (g.rnd() < 0.6) g.stat('财富', 2); else g.stat('财富', -1); if (g.rnd() < 0.3) g.stat('健康', -1); } },
    { name: '陪伴家人', minAge: 18, d: '人缘 +2、心情 +1；工作上顾不过来，事业偶尔往下掉。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); if (g.rnd() < 0.3) g.stat('事业', -1); } },
    { name: '锻炼身体', minAge: 16, d: '健康回升。', fx: (g) => { g.stat('健康', 2); if (g.rnd() < 0.3) g.stat('心情', 1); } },
    { name: '躺平休息', minAge: 18, d: '心情 +2；事业往下掉，钱只出不进。', fx: (g) => { g.stat('心情', 2); if (g.rnd() < 0.15) g.stat('健康', 1); g.stat('事业', -1); if (g.rnd() < 0.5) g.stat('财富', -1); } },
    { name: '出去走走', minAge: 18, d: '心情、见识；意外多，花钱。', fx: (g) => { g.stat('心情', 1); g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('财富', -1); } },
    { name: '含饴弄孙', minAge: 55, d: '人缘、心情；累一点。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); if (g.rnd() < 0.2) g.stat('健康', -1); } },
  ];

  /* ---------- 人生关口：16、30、50、70 岁（15 岁要中考，关口挪到 16 岁） ---------- */
  JY.PAUSES = [
    { id: 'p15', age: 16, t: 'Sixteen', ask: 'Who do you want to become?', text: 'You are sixteen. Lying in bed at night, have you ever thought about who you want to become?', choices: [
      { t: 'Someone who earns a lot of money', canon: true, fx: (g) => { g.info('志向', 'Earn a lot of money'); g.stat('财富', 1); g.remember('aim', 'rich'); } },
      { t: 'Someone who makes Mom and Dad proud', canon: true, fx: (g) => { g.info('志向', 'Make Mom and Dad proud'); g.stat('人缘', 2); g.remember('aim', 'proud'); } },
      { t: 'Someone who does what they love', canon: true, fx: (g) => { g.info('志向', 'Do what I love'); g.stat('心情', 3); g.remember('aim', 'free'); } },
      { t: 'Haven’t decided yet', canon: true, fx: (g) => { g.info('志向', 'Haven’t decided yet'); g.stat('心情', 1); g.remember('aim', 'none'); } },
    ] },
    { id: 'p30', age: 30, t: 'Thirty', ask: 'What can you least let go of?',
      text: (g) => {
        const a = g.recall('aim');
        const back = a === 'rich' ? 'At sixteen, you wanted to earn a lot of money. ' + (g.s('财富') >= 60 ? 'Now you really are not short of money. ' : 'Now you are still worrying about rent and loan payments. ')
          : a === 'proud' ? 'At sixteen, you wanted to make your parents proud. ' + (g.s('人缘') >= 60 ? 'They bring you up to everyone they meet. ' : 'When they call lately, what they ask most is when you will get married. ')
          : a === 'free' ? 'At sixteen, you wanted to do what you love. ' + (g.s('心情') >= 60 ? 'Over the years, you have mostly not shortchanged yourself. ' : 'Over the years, you have mostly done what you had to do. ') : '';
        return back + 'You are thirty. What can you least let go of?';
      }, choices: [
      { t: 'Family', canon: true, fx: (g) => { g.stat('人缘', 3); g.info('心结', 'Family'); g.remember('knot', 'family'); } },
      { t: 'Money', canon: true, fx: (g) => { g.stat('财富', 1); g.info('心结', 'Money'); g.remember('knot', 'money'); } },
      { t: 'Someone in particular', canon: true, fx: (g) => { g.stat('心情', -1); g.info('心结', 'Someone in particular'); g.remember('knot', 'person'); } },
      { t: 'Nothing at all', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('knot', 'none'); } },
    ] },
    { id: 'p50', age: 50, t: 'Fifty', ask: 'How do you want to be remembered?',
      text: (g) => {
        const k = g.recall('knot');
        const back = k === 'family' ? 'At thirty, you couldn’t let go of your family. ' + (g.alive('fa') || g.alive('mo') ? 'Your parents have grown old, and you still don’t go home often enough. ' : 'Your parents are gone. ') : k === 'money' ? 'At thirty, you couldn’t let go of money. ' + (g.s('财富') >= 60 ? 'In these twenty years, you finally saved up some money. ' : 'In these twenty years, you still haven’t saved much. ') : k === 'person' ? 'At thirty, you couldn’t let go of one particular person. Twenty years on, you rarely think of them now. ' : '';
        return back + 'You are fifty. When people talk about you in the future, what do you hope they say?';
      }, choices: [
      { t: '“A good person.”', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('心愿', 'Be a good person'); g.remember('fame', 'good'); } },
      { t: '“Someone capable.”', canon: true, fx: (g) => { g.stat('事业', 2); g.info('心愿', 'Be capable'); g.remember('fame', 'able'); } },
      { t: '“Held the family together.”', canon: true, fx: (g) => { g.stat('人缘', 1); g.info('心愿', 'Hold the family together'); g.remember('fame', 'family'); } },
      { t: '“Lived at ease.”', canon: true, fx: (g) => { g.stat('心情', 4); g.info('心愿', 'Live at ease'); g.remember('fame', 'free'); } },
    ] },
    { id: 'p70', age: 70, t: 'Seventy', ask: 'If you could do it over, which year would you go back to?',
      text: (g) => {
        const f = g.recall('fame');
        const said = f === 'good' ? (g.s('人缘') >= 50 ? 'The neighbours all say you are a good person. ' : 'You think of yourself as a good person; what others think, you can’t say. ')
          : f === 'able' ? (g.s('事业') >= 55 ? 'When people talk about you, they all say you are capable. ' : 'Others haven’t seen much of your ability. ')
          : f === 'family' ? 'You carried this family through. ' : f === 'free' ? 'You have lived quite at ease. ' : '';
        return said + 'You are seventy. If you could go back to one year and start over, which would you pick?';
      }, choices: [
      { t: 'The year of the gaokao (college entrance exam)', canon: true, fx: (g) => g.info('遗愿', 'Go back to the year of the gaokao') },
      { t: 'The year I started working', canon: true, fx: (g) => g.info('遗愿', 'Go back to the year I started working') },
      { t: 'When my parents were still young', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('遗愿', 'See my parents young again'); } },
      { t: 'No going back, this life is fine as it is', canon: true, fx: (g) => g.stat('心情', 5) },
    ] },
  ];

  /* ---------- 给剧情用的工具函数 ----------
   * 剧情文件里用 const CN = JY.CN; 然后 CN.setJob(g, 'tech', '程序员') 这样调用。
   * 状态都存在这一世的记忆里（g.remember），名帖字段用 g.info。键名见 docs/SPEC.md。 */
  const CN = (JY.CN = {
    NOW, PROVS, person, pick, ri, R,
    sexOf: (g) => (JY.byId[g.me] ? JY.byId[g.me].sex : '男'),
    // 名字里的姓：中文取第一个字，拼音取空格前那一段
    surOf: (name) => (/ /.test(name || '') ? name.split(' ')[0] : String(name || '').charAt(0)),
    he: (g, id) => (JY.byId[id] && JY.byId[id].sex === '女' ? 'she' : 'he'),
    // 回到老家
    goHome: (g, cap) => g.move(g.recall('homeLoc'), cap || g.recall('homeCap')),
    // 去某个等级的城市：tier 1 一线，2 省会/新一线，3 地级市，4 县城。返回城市名
    goCity: (g, tier, name) => {
      const P = PROVS.find((p) => p[0] === g.recall('prov'));
      let city = name;
      if (!city) {
        if (tier === 1) city = pick(['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen']);
        else if (tier === 2) city = (P && P[6].find((c) => c[1] === 2) || [pick(['Hangzhou', 'Chengdu', 'Wuhan', 'Nanjing', 'Xi\'an'])])[0];
        else if (tier === 3) city = (P && pick(P[6])[0]) || 'your home city';
        else city = g.recall('city') + ' (county town)';
      }
      g.remember('tier', tier);
      g.remember('workCity', city);
      g.move(tier <= 2 ? 'metro' : tier === 3 ? 'city' : 'county', city);
      g.info('住处', city);
      return city;
    },
    setEdu: (g, key, title) => { g.remember('edu', key); g.info('学历', title); },
    setJob: (g, key, title) => { g.remember('job', key); g.info('职业', title); },
    // 结婚：生成配偶（id 'sp'），写进家人
    marry: (g, o) => {
      o = o || {};
      const sex = CN.sexOf(g) === '男' ? '女' : '男';
      const W = JY.engine.get().W;
      if (W && W.dead) delete W.dead.sp; // 再婚：新配偶用同一个 id，先清掉前一位的去世记录
      const sp = person(Object.assign({ id: 'sp', sex, born: g.Y - g.age + ri(-3, 3), origin: o.origin || '' }, o));
      g.spawn(sp);
      g.rel(sex === '女' ? 'wife' : 'husband', 'sp', o.note || '');
      g.remember('love', 'married');
      g.remember('spouse', sp.name);
      g.info('婚姻', 'Married');
      return sp;
    },
    // 生孩子：id 依次为 k1、k2、k3
    haveKid: (g, o) => {
      o = o || {};
      const n = (g.recall('kids') || 0) + 1;
      const surname = CN.sexOf(g) === '男' ? CN.surOf(JY.byId[g.me].name) : (JY.byId.sp ? CN.surOf(JY.byId.sp.name) : CN.surOf(JY.byId[g.me].name));
      const k = person(Object.assign({ id: 'k' + n, born: g.Y, surname, origin: 'Your child' }, o));
      g.spawn(k);
      g.rel(['', '', 'second ', 'third ', 'fourth ', 'fifth '][n] + (k.sex === '男' ? 'son' : 'daughter'), k.id); // 关系名不能重复，第二个起加“二”“三”
      g.remember('kids', n);
      g.info('子女', n + ' child(ren)');
      return k;
    },
  });
})();

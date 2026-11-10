/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 十四亿分之一 · 世界设定与投胎生成器
 * 这一份放：年代、地点、省份数据、投胎生成器、年度重心、人生关口、给剧情用的工具函数 JY.CN。
 * 人生各阶段的剧情在 childhood / youth / midlife / oldage / events 里。写之前读 docs/SPEC.md。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const NOW = 2026; // 所有人都在这一年出生

  /* ---------- 年代 ---------- */
  JY.ERAS = [[2029, '2020 年代'], [2039, '2030 年代'], [2049, '2040 年代'], [2059, '2050 年代'], [2069, '2060 年代'], [2079, '2070 年代'], [2089, '2080 年代'], [2099, '2090 年代'], [9999, '22 世紀']];

  /* ---------- 地点：场景图按这里的 scene 画（scenes.js） ----------
   * 地点是“类型”，具体城市名由 g.move(地点, '城市名 · 说明') 的第二个参数给出。 */
  JY.addLocs({
    village_n: { name: '北方農村', scene: 'cn_village_n', desc: '平原上的村子' },
    village_s: { name: '南方農村', scene: 'cn_village_s', desc: '山腳下的村子' },
    village_w: { name: '西部農村', scene: 'cn_village_w', desc: '高原上的村子' },
    county: { name: '縣城', scene: 'cn_county', desc: '一條主街，幾棟新樓' },
    city: { name: '地級市', scene: 'cn_city', desc: '城市' },
    metro: { name: '大城市', scene: 'cn_metro', desc: '高樓林立' },
    school: { name: '學校', scene: 'cn_school', desc: '操場和教學樓' },
    campus: { name: '大學', scene: 'cn_campus', desc: '大學校園' },
    factory: { name: '工廠', scene: 'cn_factory', desc: '流水線' },
    office: { name: '寫字樓', scene: 'cn_office', desc: '格子間' },
    hospital: { name: '醫院', scene: 'cn_hospital', desc: '走廊裡的長椅' },
    home: { name: '家', scene: 'cn_home', desc: '小區樓下' },
    coast: { name: '海邊', scene: 'cn_coast', desc: '海邊' },
    road: { name: '路上', scene: 'cn_road', desc: '高速公路' },
    hsr: { name: '高鐵站', scene: 'cn_hsr', desc: '站臺' },
    smart: { name: '街口', scene: 'cn_smart', desc: '無人車和無人機' },
  });

  /* ---------- 省份 ----------
   * [名, 简称, 地区, 出生权重（近年出生人口，万）, 城镇化率 %, 农村类型, [[城市, 等级 1–4], ...]]
   * 城市等级：1 一线，2 新一线和省会，3 普通地级市，4 小城市。数字是估算，只用来做随机权重。 */
  const PROVS = [
    ['北京', '京', '华北', 12, 88, 'n', [['北京', 1]]],
    ['天津', '津', '华北', 6, 85, 'n', [['天津', 2]]],
    ['河北', '冀', '华北', 45, 62, 'n', [['石家莊', 2], ['唐山', 3], ['保定', 3], ['邯鄲', 3], ['滄州', 3]]],
    ['山西', '晉', '华北', 22, 64, 'n', [['太原', 2], ['大同', 3], ['運城', 3], ['長治', 3]]],
    ['內蒙古', '蒙', '华北', 13, 69, 'w', [['呼和浩特', 2], ['包頭', 3], ['赤峰', 3], ['鄂爾多斯', 3]]],
    ['遼寧', '遼', '东北', 17, 73, 'n', [['瀋陽', 2], ['大連', 2], ['鞍山', 3], ['錦州', 3]]],
    ['吉林', '吉', '东北', 9, 64, 'n', [['長春', 2], ['吉林', 3], ['延邊州', 4]]],
    ['黑龍江', '黑', '东北', 10, 67, 'n', [['哈爾濱', 2], ['齊齊哈爾', 3], ['大慶', 3], ['牡丹江', 3]]],
    ['上海', '滬', '华东', 10, 89, 's', [['上海', 1]]],
    ['江蘇', '蘇', '华东', 48, 75, 's', [['南京', 2], ['蘇州', 2], ['無錫', 3], ['徐州', 3], ['南通', 3], ['鹽城', 3]]],
    ['浙江', '浙', '华东', 50, 74, 's', [['杭州', 2], ['寧波', 2], ['溫州', 3], ['金華', 3], ['台州', 3]]],
    ['安徽', '皖', '华东', 42, 61, 's', [['合肥', 2], ['阜陽', 3], ['蕪湖', 3], ['安慶', 3], ['六安', 4]]],
    ['福建', '閩', '华东', 32, 70, 's', [['福州', 2], ['廈門', 2], ['泉州', 3], ['漳州', 3]]],
    ['江西', '贛', '华东', 33, 63, 's', [['南昌', 2], ['贛州', 3], ['九江', 3], ['上饒', 3]]],
    ['山東', '魯', '华东', 60, 66, 'n', [['濟南', 2], ['青島', 2], ['臨沂', 3], ['濰坊', 3], ['菏澤', 3], ['煙臺', 3]]],
    ['河南', '豫', '华中', 73, 58, 'n', [['鄭州', 2], ['洛陽', 3], ['南陽', 3], ['周口', 3], ['商丘', 3], ['信陽', 3]]],
    ['湖北', '鄂', '华中', 34, 65, 's', [['武漢', 2], ['襄陽', 3], ['宜昌', 3], ['荊州', 3], ['黃岡', 3]]],
    ['湖南', '湘', '华中', 40, 61, 's', [['長沙', 2], ['衡陽', 3], ['岳陽', 3], ['常德', 3], ['邵陽', 3]]],
    ['廣東', '粵', '华南', 110, 75, 's', [['廣州', 1], ['深圳', 1], ['東莞', 2], ['佛山', 2], ['汕頭', 3], ['湛江', 3], ['梅州', 4]]],
    ['廣西', '桂', '华南', 40, 56, 's', [['南寧', 2], ['柳州', 3], ['桂林', 3], ['玉林', 3]]],
    ['海南', '瓊', '华南', 11, 62, 's', [['海口', 2], ['三亞', 3], ['儋州', 4]]],
    ['重慶', '渝', '西南', 18, 71, 's', [['重慶', 2]]],
    ['四川', '川', '西南', 50, 59, 's', [['成都', 2], ['綿陽', 3], ['南充', 3], ['宜賓', 3], ['達州', 3], ['涼山州', 4]]],
    ['貴州', '黔', '西南', 41, 55, 's', [['貴陽', 2], ['遵義', 3], ['畢節', 3], ['黔東南州', 4]]],
    ['雲南', '滇', '西南', 41, 52, 'w', [['昆明', 2], ['曲靖', 3], ['大理州', 3], ['紅河州', 3], ['昭通', 4]]],
    ['西藏', '藏', '西南', 5, 38, 'w', [['拉薩', 3], ['日喀則', 4]]],
    ['陝西', '陝', '西北', 28, 65, 'n', [['西安', 2], ['寶雞', 3], ['咸陽', 3], ['榆林', 3], ['漢中', 3]]],
    ['甘肅', '甘', '西北', 20, 55, 'w', [['蘭州', 2], ['天水', 3], ['慶陽', 4], ['張掖', 4]]],
    ['青海', '青', '西北', 5, 62, 'w', [['西寧', 2], ['海東', 4]]],
    ['寧夏', '寧', '西北', 7, 67, 'w', [['銀川', 2], ['固原', 4]]],
    ['新疆', '新', '西北', 26, 59, 'w', [['烏魯木齊', 2], ['伊犁州', 3], ['喀什地區', 3], ['巴音郭楞州', 3]]],
  ];
  const TOTAL_W = PROVS.reduce((a, p) => a + p[3], 0);

  /* ---------- 名字 ---------- */
  const SURNAMES = '王王王李李李張張張劉劉陳陳楊楊黃黃趙吳周徐孫馬朱胡郭何林高羅鄭梁謝宋唐許韓馮鄧曹彭曾肖田董袁潘於蔣蔡餘杜葉程蘇魏呂丁任沈姚盧姜崔鍾譚陸汪範金石廖賈夏韋付方白鄒孟熊秦邱江尹薛閆段雷侯龍史陶黎賀顧毛郝龔邵萬錢嚴覃武戴莫孔向湯';
  const GIVEN_M = ['子墨', '沐宸', '浩宇', '宇軒', '一鳴', '奕辰', '梓睿', '承澤', '俊熙', '銘哲', '皓軒', '景行', '思源', '博文', '嘉樹', '明遠', '安然', '天佑', '辰逸', '致遠', '星河', '書恆', '亦凡', '家豪', '志強', '建華', '晨陽', '睿', '航', '昊', '凱', '濤', '鵬', '磊', '傑'];
  const GIVEN_F = ['一諾', '若汐', '欣怡', '梓涵', '語桐', '詩涵', '依諾', '可馨', '芷若', '雨萱', '星辰', '安琪', '思琪', '佳怡', '夢瑤', '曉雯', '清歡', '知夏', '念念', '沐瑤', '婉清', '靜怡', '小滿', '甜甜', '悅', '萌', '琳', '丹', '穎', '潔', '雪', '敏'];
  const OLD_M = ['建國', '建軍', '國強', '志剛', '海濤', '永紅', '衛東', '小軍', '偉', '勇', '軍', '斌', '強', '磊', '明', '濤', '鵬'];
  const OLD_F = ['秀英', '桂蘭', '麗娟', '曉燕', '春梅', '紅霞', '麗', '芳', '靜', '燕', '娟', '敏', '霞', '豔', '玲', '琴'];

  /* ---------- 随机工具 ---------- */
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];
  const wpick = (list, w) => { let t = list.reduce((s, x) => s + w(x), 0) * R(); for (const x of list) { t -= w(x); if (t <= 0) return x; } return list[list.length - 1]; };
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seq = 0;
  const uid = (p) => p + Date.now().toString(36) + (seq++).toString(36);

  // 英文等外文界面：名字写成拼音（“Wang Jianguo”），姓和名之间空一格；姓用 CN.surOf(名字) 取，不要写 name[0]
  const PY_C = '一丁萬東嚴丹麗書於亦付任偉佑何餘佳依侯俊蘭軍馮凡凱劉剛勇華博盧衛可史葉向呂吳周哲唐嘉國墨夏天奕姚姜娟婉子孔孫孟宇安宋家宸小尹崔廖建張強彭徐志念思怡恆悅戴承敏文斌方昊明星春曉晨景曹曾朱李杜楊傑林樹桂桐梁梅梓夢歡欣武段毛永汐江湯汪沈沐河澤潔浩海濤涵清源滿潘然熊熙燕王玲琪琳琴瑤甜田白皓睿知石磊秀秦程紅羅肖胡致航豔芳芷蘇若英範莫萌萱董蔣蔡薛行袁覃許詩語諾謝譚豪賀賈趙軒辰遠逸鄧邱邵鄒鄭郝郭金鐘錢銘閆陽陸陳陶雨雪雯雷霞靜韋韓顧穎馨馬高魏鳴鵬黃黎龍龔';
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
      death: o.death || { y: born + clamp(Math.round(78 + (R() - 0.5) * 24), 40, 102), cause: pick(['壽終正寢', '病逝', '病逝', '在睡夢中離世', '因心臟病去世', '因癌症去世']) },
      ms: o.ms || [],
    }, o.extra || {});
  }

  /* ---------- 家庭类型 ----------
   * key: 记忆里的 family；w: 按住处给的权重；bg: 出身几个点；cash: 初始财富；parents: 父母职业说明 */
  const FAMILIES = [
    { key: 'rich', t: '做生意的富裕人家', w: { city: 6, county: 3, rural: 0.5 }, bg: 5, cash: [70, 90], dad: '開公司的', mom: '管家裡的賬' },
    { key: 'civil', t: '體制內的雙職工', w: { city: 20, county: 14, rural: 2 }, bg: 4, cash: [45, 60], dad: '在單位上班', mom: '當老師' },
    { key: 'white', t: '公司職員家庭', w: { city: 34, county: 8, rural: 1 }, bg: 3, cash: [35, 55], dad: '公司職員', mom: '公司職員' },
    { key: 'smallbiz', t: '開小店的個體戶', w: { city: 16, county: 30, rural: 8 }, bg: 3, cash: [30, 50], dad: '開小店', mom: '在店裡幫忙' },
    { key: 'worker', t: '工人家庭', w: { city: 18, county: 26, rural: 10 }, bg: 2, cash: [20, 35], dad: '廠裡的工人', mom: '超市收銀員' },
    { key: 'farmer', t: '種地的農戶', w: { city: 0, county: 4, rural: 38 }, bg: 1, cash: [10, 25], dad: '種地', mom: '種地、養豬' },
    { key: 'migrant', t: '父母在外打工的家庭', w: { city: 6, county: 12, rural: 40 }, bg: 1, cash: [15, 30], dad: '在外地工地上幹活', mom: '在外地電子廠上班' },
  ];
  const HUKOU_T = { city: '城鎮', county: '縣城', rural: '農村' };

  /* 和这个出身的大多数人（墓志页、分享卡的对照） */
  function fateOf(fam, hukou) {
    if (fam === 'rich') return '讀私立學校，出國或者回家接班，在大城市買房，五十歲前後把生意交給下一代，活到八十多歲。';
    if (hukou === 'rural') return '在縣城讀完高中，考上一所普通大學或者早早出去打工，去省會或沿海城市工作，三十歲前結婚，在縣城買房，晚年回老家帶孫子，活到八十歲左右。';
    if (hukou === 'county') return '在縣城讀完高中，去外地讀大學，畢業後回縣城考編或者留在省會上班，結婚生子，背二三十年房貸，活到八十歲左右。';
    return '讀完大學，在本地或更大的城市上班，三十歲前後結婚，生一個孩子，背三十年房貸，六十五歲退休，活到八十多歲。';
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
    const cityName = /[州区區市]$/.test(city[0]) || !/^zh/.test(JY.LANG || 'zh') ? city[0] : city[0] + '市'; // 自治州、地区不加“市”
    const muni = prov === city[0]; // 直辖市：郊区的镇子和村子
    const place = hukou === 'city' ? cityName : hukou === 'county' ? (muni ? cityName + '郊區的一個鎮上' : cityName + '下面的一個縣城') : (muni ? cityName + '郊區的一個村子' : cityName + '下面的一個村子');
    const provName = prov === city[0] ? prov + '市' : ['內蒙古', '廣西', '西藏', '寧夏', '新疆'].includes(prov) ? prov + ' ' : prov + '省 ';
    const birthplace = muni ? place : provName + place;
    const homeLoc = hukou === 'city' ? (tier <= 2 ? 'metro' : 'city') : hukou === 'county' ? 'county' : 'village_' + rtype;
    // 父母
    const dadAge = ri(24, 36), momAge = clamp(dadAge - ri(0, 4), 21, 40);
    const dad = person({ id: 'fa', sex: '男', surname, born: NOW - dadAge, origin: fam.dad, ms: [[NOW, fam.dad]] });
    const mom = person({ id: 'mo', sex: '女', born: NOW - momAge, origin: fam.mom, ms: [[NOW, fam.mom]] });
    const family = [{ rel: '父親', id: 'fa' }, { rel: '母親', id: 'mo' }];
    const others = [dad, mom];
    if (sibs) {
      for (let i = 0; i < sibs; i++) {
        const older = i < order;
        const sx = R() < 0.5 ? '男' : '女';
        const sb = person({ id: 'sib' + i, sex: sx, surname, born: older ? NOW - ri(2, 7) : NOW + ri(2, 5), origin: older ? '比你大' : '比你小' });
        sb.ms = [[sb.born, '出生'], [sb.born + 7, '上小學'], [sb.born + 18, '讀高中畢業了'], [sb.born + 26, '在外地工作'], [sb.born + 30, '成家了']];
        others.push(sb);
        family.push({ rel: (older ? (sx === '男' ? '哥哥' : '姐姐') : (sx === '男' ? '弟弟' : '妹妹')), id: sb.id });
      }
    }
    // 爷爷奶奶（老人）
    const gpa = person({ id: 'gp', sex: '男', surname, born: dad.born - ri(22, 30), origin: hukou === 'rural' ? '在老家種地' : '退休了', death: { y: NOW + ri(3, 22), cause: pick(['病逝', '壽終正寢', '因腦梗去世']) } });
    const gma = person({ id: 'gm', sex: '女', born: dad.born - ri(20, 28), origin: leftBehind ? '在家帶你' : '在老家', death: { y: NOW + ri(6, 28), cause: pick(['病逝', '壽終正寢', '在睡夢中離世']) } });
    others.push(gpa, gma);
    family.push({ rel: '爺爺', id: 'gp' }, { rel: '奶奶', id: 'gm' });
    // 同一年出生的人：散在全国，按同样的规则投胎，只记一条简单的人生
    const peers = [];
    for (let i = 0; i < 4; i++) {
      const pp = wpick(PROVS, (p) => p[3]);
      const pc = pick(pp[6]);
      const ph = R() * 100 < pp[4] ? '城裡' : '農村';
      const ps = R() < 0.51 ? '男' : '女';
      const path = peerPath(ph);
      const peer = person({ id: 'peer' + i, sex: ps, book: pp[2], origin: '生在' + pp[0] + (latin() ? ', ' : '') + pc[0] + (ph === '農村' ? '的農村' : ''), ms: path.ms, death: path.death });
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
      origin: '生在' + birthplace, bg: fam.bg, family,
      info: { 户籍: HUKOU_T[hukou], 家庭: fam.t, 学历: '無', 职业: '無', 婚姻: '', 住处: '' },
      fateText: fateOf(fam.key, hukou),
      focus: '懵懂',
      lastWords: pick(['下輩子，還想來這兒。', '謝謝你們陪我這一趟。', '別哭，都挺好的。', '我這一輩子，沒白活。']),
      mem: { prov, provShort: short, region, city: city[0], cityTier: city[1], tier, hukou, family: fam.key, sibs, only: !sibs, leftBehind, rtype, homeLoc, homeCap: hukou === 'city' ? city[0] : place },
      facts: [
        ['出生地', birthplace],
        ['户籍', HUKOU_T[hukou]],
        ['家庭', fam.t],
        ['父親', dad.name + '，' + dadAge + ' 歲，' + fam.dad],
        ['母親', mom.name + '，' + momAge + ' 歲，' + fam.mom],
        ['兄弟姐妹', sibs ? family.filter((f) => /^sib/.test(f.id || '')).map((f) => f.rel).join('、') : '獨生子女'],
      ],
      odds: '今年全國出生的孩子裡，約 ' + (birthW / TOTAL_W * 100).toFixed(1) + '% 生在' + prov + '；其中' + (hukou === 'rural' ? '生在農村的約佔 ' + Math.max(5, 100 - urban - 8) : hukou === 'county' ? '生在縣城的約佔 20' : '生在城區的約佔 ' + Math.max(10, urban - 12)) + '%。你是十四億分之一。',
    });
    me.intro = (sex === '男' ? '一個男孩' : '一個女孩') + '，' + (R() < 0.5 ? '在凌晨' : R() < 0.5 ? '在午後' : '在傍晚') + '出生在' + birthplace + '的' + (hukou === 'city' ? '醫院' : hukou === 'county' ? '縣醫院' : '鎮衛生院') + '。'
      + (leftBehind ? '滿月以後，爸媽就回了外地打工，你跟著爺爺奶奶。' : fam.key === 'rich' ? '病房裡擺滿了花籃。' : '爸媽輪流抱著你，不知道該怎麼抱才對。');
    return { me, others };
  };

  /* 同龄人的人生：只要几条近况和结局 */
  function peerPath(ph) {
    const B = NOW, ms = [[B, '剛出生']];
    ms.push([B + 3, '上幼兒園'], [B + 6, '上小學'], [B + 12, '上初中']);
    const up = ph === '城裡' ? 0.75 : 0.5;
    let job;
    if (R() < up) { ms.push([B + 15, '上高中'], [B + 18, pick(['考上了大學', '考上了一所普通大學', '考上了重點大學'])]); job = pick(['在寫字樓上班', '當了老師', '考上了公務員', '做程式設計師', '在醫院上班', '自己開了家店']); }
    else { ms.push([B + 15, pick(['讀了職高', '去外地打工了'])]); job = pick(['在工廠上班', '跑外賣', '跑車拉貨', '在工地上幹活', '開了家小飯館', '做直播帶貨']); }
    ms.push([B + 23, job]);
    if (R() < 0.8) ms.push([B + ri(26, 33), '結婚了']);
    if (R() < 0.65) ms.push([B + ri(28, 36), '有了孩子']);
    if (R() < 0.1) ms.push([B + ri(35, 50), '離婚了']);
    ms.push([B + ri(38, 48), pick(['房貸還剩一半', '孩子上小學了', '換了一份工作', '把父母接來同住']), null]);
    ms.push([B + 65, '退休了']);
    ms.push([B + ri(66, 75), pick(['幫著帶孫輩', '在老年大學學書法', '每天去公園散步', '回老家住了'])]);
    const dy = B + clamp(Math.round(80 + (R() - 0.5) * 26), 30, 104);
    return { ms: ms.filter((m) => m[0] < dy).map((m) => [m[0], m[1]]), death: { y: dy, cause: pick(['壽終正寢', '病逝', '病逝', '因心臟病去世', '因癌症去世', dy - B < 50 ? '死於一場車禍' : '在睡夢中離世']) } };
  }

  /* ---------- 年度重心 ---------- */
  JY.FOCUS = [
    { name: '懵懂', minAge: 0, maxAge: 5, d: '還小，由大人照看。', fx: (g) => { g.stat('心情', 1); if (g.rnd() < 0.3) g.stat('健康', 1); } },
    { name: '用功读书', minAge: 6, maxAge: 22, d: '學識 +2～3，心情會悶。中考、高考、考研都看學識。', fx: (g) => { g.stat('学识', g.rnd() < 0.5 ? 3 : 2); if (g.rnd() < 0.35) g.stat('心情', -1); } },
    { name: '贪玩', minAge: 6, maxAge: 17, d: '心情 +2、人緣 +1，學識會往下掉。', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); if (g.rnd() < 0.5) g.stat('学识', -1); } },
    { name: '帮家里干活', minAge: 8, maxAge: 17, d: '人緣、健康；人會早熟一些。', fx: (g) => { g.stat('人缘', 1); g.stat('健康', 1); if (g.rnd() < 0.3) g.stat('财富', 1); } },
    { name: '学个特长', minAge: 6, maxAge: 17, d: '學識，偶爾有意外收穫；家裡要花錢。', fx: (g) => { g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('事业', 1); if (g.rnd() < 0.3) g.stat('财富', -1); } },
    { name: '埋头工作', minAge: 16, d: '事業 +3，年終多拿一筆；健康和心情慢慢掉。事業高，工資高、升職和創業更容易成。', fx: (g) => { g.stat('事业', 3); g.stat('财富', 1); if (g.rnd() < 0.35) g.stat('健康', -1); if (g.rnd() < 0.3) g.stat('心情', -1); } },
    { name: '学习充电', minAge: 18, d: '學識；學識高時事業也會漲。', fx: (g) => { g.stat('学识', 2); if (g.rnd() < g.s('学识') / 150) g.stat('事业', 1); } },
    { name: '搞副业', minAge: 18, d: '財富，看運氣；累。', fx: (g) => { if (g.rnd() < 0.6) g.stat('财富', 2); else g.stat('财富', -1); if (g.rnd() < 0.3) g.stat('健康', -1); } },
    { name: '陪伴家人', minAge: 18, d: '人緣 +2、心情 +1；工作上顧不過來，事業偶爾往下掉。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); if (g.rnd() < 0.3) g.stat('事业', -1); } },
    { name: '锻炼身体', minAge: 16, d: '健康回升。', fx: (g) => { g.stat('健康', 2); if (g.rnd() < 0.3) g.stat('心情', 1); } },
    { name: '躺平休息', minAge: 18, d: '心情 +2；事業往下掉，錢只出不進。', fx: (g) => { g.stat('心情', 2); if (g.rnd() < 0.15) g.stat('健康', 1); g.stat('事业', -1); if (g.rnd() < 0.5) g.stat('财富', -1); } },
    { name: '出去走走', minAge: 18, d: '心情、見識；意外多，花錢。', fx: (g) => { g.stat('心情', 1); g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('财富', -1); } },
    { name: '含饴弄孙', minAge: 55, d: '人緣、心情；累一點。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); if (g.rnd() < 0.2) g.stat('健康', -1); } },
  ];

  /* ---------- 人生关口：16、30、50、70 岁（15 岁要中考，关口挪到 16 岁） ---------- */
  JY.PAUSES = [
    { id: 'p15', age: 16, t: '十六歲', ask: '想成為什麼樣的人？', text: '你十六歲了。夜裡躺在床上，你想過以後要成為什麼樣的人嗎？', choices: [
      { t: '賺很多錢的人', canon: true, fx: (g) => { g.info('志向', '賺很多錢'); g.stat('财富', 1); g.remember('aim', 'rich'); } },
      { t: '讓爸媽驕傲的人', canon: true, fx: (g) => { g.info('志向', '讓爸媽驕傲'); g.stat('人缘', 2); g.remember('aim', 'proud'); } },
      { t: '做自己喜歡的事的人', canon: true, fx: (g) => { g.info('志向', '做喜歡的事'); g.stat('心情', 3); g.remember('aim', 'free'); } },
      { t: '還沒想好', canon: true, fx: (g) => { g.info('志向', '還沒想好'); g.stat('心情', 1); g.remember('aim', 'none'); } },
    ] },
    { id: 'p30', age: 30, t: '三十歲', ask: '最放不下的是什麼？',
      text: (g) => {
        const a = g.recall('aim');
        const back = a === 'rich' ? '十六歲時你想賺很多錢。' + (g.s('财富') >= 60 ? '現在，你確實不太缺錢了。' : '現在，你還在為房租和貸款發愁。')
          : a === 'proud' ? '十六歲時你想讓爸媽驕傲。' + (g.s('人缘') >= 60 ? '他們逢人就提起你。' : '他們最近打電話，問得最多的是你什麼時候結婚。')
          : a === 'free' ? '十六歲時你想做喜歡的事。' + (g.s('心情') >= 60 ? '這些年，你大體沒委屈自己。' : '這些年，你做的大多是不得不做的事。') : '';
        return back + '三十歲了。你最放不下的是什麼？';
      }, choices: [
      { t: '家裡人', canon: true, fx: (g) => { g.stat('人缘', 3); g.info('心结', '家裡人'); g.remember('knot', 'family'); } },
      { t: '錢', canon: true, fx: (g) => { g.stat('财富', 1); g.info('心结', '錢'); g.remember('knot', 'money'); } },
      { t: '一個人', canon: true, fx: (g) => { g.stat('心情', -1); g.info('心结', '一個人'); g.remember('knot', 'person'); } },
      { t: '沒什麼放不下的', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('knot', 'none'); } },
    ] },
    { id: 'p50', age: 50, t: '五十歲', ask: '想被怎樣記住？',
      text: (g) => {
        const k = g.recall('knot');
        const back = k === 'family' ? '三十歲時你放不下家裡人。' + (g.alive('fa') || g.alive('mo') ? '爸媽都老了，你回家的次數還是不夠多。' : '爸媽都不在了。') : k === 'money' ? '三十歲時你放不下錢。' + (g.s('财富') >= 60 ? '這二十年，錢總算攢下了一些。' : '這二十年，錢還是沒攢下多少。') : k === 'person' ? '三十歲時你放不下一個人。二十年過去，你很少再想起了。' : '';
        return back + '五十歲了。以後別人說起你，你希望他們說什麼？';
      }, choices: [
      { t: '“是個好人。”', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('心愿', '做個好人'); g.remember('fame', 'good'); } },
      { t: '“有本事。”', canon: true, fx: (g) => { g.stat('事业', 2); g.info('心愿', '有本事'); g.remember('fame', 'able'); } },
      { t: '“把家撐起來了。”', canon: true, fx: (g) => { g.stat('人缘', 1); g.info('心愿', '撐起這個家'); g.remember('fame', 'family'); } },
      { t: '“活得挺自在。”', canon: true, fx: (g) => { g.stat('心情', 4); g.info('心愿', '自在'); g.remember('fame', 'free'); } },
    ] },
    { id: 'p70', age: 70, t: '七十歲', ask: '如果能重來，回到哪一年？',
      text: (g) => {
        const f = g.recall('fame');
        const said = f === 'good' ? (g.s('人缘') >= 50 ? '鄰居們都說你是個好人。' : '你覺得自己是個好人，別人怎麼想就不知道了。')
          : f === 'able' ? (g.s('事业') >= 55 ? '說起你，大家都說有本事。' : '你的本事，別人沒怎麼看見。')
          : f === 'family' ? '這個家，你撐過來了。' : f === 'free' ? '你活得挺自在。' : '';
        return said + '七十歲了。如果能回到某一年重來一次，你選哪一年？';
      }, choices: [
      { t: '高考那年', canon: true, fx: (g) => g.info('遗愿', '回到高考那年') },
      { t: '剛工作那年', canon: true, fx: (g) => g.info('遗愿', '回到剛工作那年') },
      { t: '爸媽還年輕的時候', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('遗愿', '再見爸媽年輕的樣子'); } },
      { t: '不回去了，這一生就這樣', canon: true, fx: (g) => g.stat('心情', 5) },
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
    he: (g, id) => (JY.byId[id] && JY.byId[id].sex === '女' ? '她' : '他'),
    // 回到老家
    goHome: (g, cap) => g.move(g.recall('homeLoc'), cap || g.recall('homeCap')),
    // 去某个等级的城市：tier 1 一线，2 省会/新一线，3 地级市，4 县城。返回城市名
    goCity: (g, tier, name) => {
      const P = PROVS.find((p) => p[0] === g.recall('prov'));
      let city = name;
      if (!city) {
        if (tier === 1) city = pick(['北京', '上海', '廣州', '深圳']);
        else if (tier === 2) city = (P && P[6].find((c) => c[1] === 2) || [pick(['杭州', '成都', '武漢', '南京', '西安'])])[0];
        else if (tier === 3) city = (P && pick(P[6])[0]) || '老家的市裡';
        else city = g.recall('city') + '下面的縣城';
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
      g.rel(sex === '女' ? '妻子' : '丈夫', 'sp', o.note || '');
      g.remember('love', 'married');
      g.remember('spouse', sp.name);
      g.info('婚姻', '已婚');
      return sp;
    },
    // 生孩子：id 依次为 k1、k2、k3
    haveKid: (g, o) => {
      o = o || {};
      const n = (g.recall('kids') || 0) + 1;
      const surname = CN.sexOf(g) === '男' ? CN.surOf(JY.byId[g.me].name) : (JY.byId.sp ? CN.surOf(JY.byId.sp.name) : CN.surOf(JY.byId[g.me].name));
      const k = person(Object.assign({ id: 'k' + n, born: g.Y, surname, origin: '你的孩子' }, o));
      g.spawn(k);
      g.rel(['', '', '二', '三', '四', '五'][n] + (k.sex === '男' ? '兒子' : '女兒'), k.id); // 关系名不能重复，第二个起加“二”“三”
      g.remember('kids', n);
      g.info('子女', n + ' 個');
      return k;
    },
  });
})();

/* 十四亿分之一 · 世界设定与投胎生成器
 * 这一份放：年代、地点、省份数据、投胎生成器、年度重心、人生关口、给剧情用的工具函数 JY.CN。
 * 人生各阶段的剧情在 childhood / youth / midlife / oldage / events 里。写之前读 docs/SPEC.md。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const NOW = 2026; // 所有人都在这一年出生

  /* ---------- 年代 ---------- */
  JY.ERAS = [[2029, '2020 年代'], [2039, '2030 年代'], [2049, '2040 年代'], [2059, '2050 年代'], [2069, '2060 年代'], [2079, '2070 年代'], [2089, '2080 年代'], [2099, '2090 年代'], [9999, '22 世纪']];

  /* ---------- 地点：场景图按这里的 scene 画（scenes.js） ----------
   * 地点是“类型”，具体城市名由 g.move(地点, '城市名 · 说明') 的第二个参数给出。 */
  JY.addLocs({
    village_n: { name: '北方农村', scene: 'cn_village_n', desc: '平原上的村子' },
    village_s: { name: '南方农村', scene: 'cn_village_s', desc: '山脚下的村子' },
    village_w: { name: '西部农村', scene: 'cn_village_w', desc: '高原上的村子' },
    county: { name: '县城', scene: 'cn_county', desc: '一条主街，几栋新楼' },
    city: { name: '地级市', scene: 'cn_city', desc: '城市' },
    metro: { name: '大城市', scene: 'cn_metro', desc: '高楼林立' },
    school: { name: '学校', scene: 'cn_school', desc: '操场和教学楼' },
    campus: { name: '大学', scene: 'cn_campus', desc: '大学校园' },
    factory: { name: '工厂', scene: 'cn_factory', desc: '流水线' },
    office: { name: '写字楼', scene: 'cn_office', desc: '格子间' },
    hospital: { name: '医院', scene: 'cn_hospital', desc: '走廊里的长椅' },
    home: { name: '家', scene: 'cn_home', desc: '小区楼下' },
    coast: { name: '海边', scene: 'cn_coast', desc: '海边' },
    road: { name: '路上', scene: 'cn_road', desc: '高速公路' },
  });

  /* ---------- 省份 ----------
   * [名, 简称, 地区, 出生权重（近年出生人口，万）, 城镇化率 %, 农村类型, [[城市, 等级 1–4], ...]]
   * 城市等级：1 一线，2 新一线和省会，3 普通地级市，4 小城市。数字是估算，只用来做随机权重。 */
  const PROVS = [
    ['北京', '京', '华北', 12, 88, 'n', [['北京', 1]]],
    ['天津', '津', '华北', 6, 85, 'n', [['天津', 2]]],
    ['河北', '冀', '华北', 45, 62, 'n', [['石家庄', 2], ['唐山', 3], ['保定', 3], ['邯郸', 3], ['沧州', 3]]],
    ['山西', '晋', '华北', 22, 64, 'n', [['太原', 2], ['大同', 3], ['运城', 3], ['长治', 3]]],
    ['内蒙古', '蒙', '华北', 13, 69, 'w', [['呼和浩特', 2], ['包头', 3], ['赤峰', 3], ['鄂尔多斯', 3]]],
    ['辽宁', '辽', '东北', 17, 73, 'n', [['沈阳', 2], ['大连', 2], ['鞍山', 3], ['锦州', 3]]],
    ['吉林', '吉', '东北', 9, 64, 'n', [['长春', 2], ['吉林', 3], ['延边州', 4]]],
    ['黑龙江', '黑', '东北', 10, 67, 'n', [['哈尔滨', 2], ['齐齐哈尔', 3], ['大庆', 3], ['牡丹江', 3]]],
    ['上海', '沪', '华东', 10, 89, 's', [['上海', 1]]],
    ['江苏', '苏', '华东', 48, 75, 's', [['南京', 2], ['苏州', 2], ['无锡', 3], ['徐州', 3], ['南通', 3], ['盐城', 3]]],
    ['浙江', '浙', '华东', 50, 74, 's', [['杭州', 2], ['宁波', 2], ['温州', 3], ['金华', 3], ['台州', 3]]],
    ['安徽', '皖', '华东', 42, 61, 's', [['合肥', 2], ['阜阳', 3], ['芜湖', 3], ['安庆', 3], ['六安', 4]]],
    ['福建', '闽', '华东', 32, 70, 's', [['福州', 2], ['厦门', 2], ['泉州', 3], ['漳州', 3]]],
    ['江西', '赣', '华东', 33, 63, 's', [['南昌', 2], ['赣州', 3], ['九江', 3], ['上饶', 3]]],
    ['山东', '鲁', '华东', 60, 66, 'n', [['济南', 2], ['青岛', 2], ['临沂', 3], ['潍坊', 3], ['菏泽', 3], ['烟台', 3]]],
    ['河南', '豫', '华中', 73, 58, 'n', [['郑州', 2], ['洛阳', 3], ['南阳', 3], ['周口', 3], ['商丘', 3], ['信阳', 3]]],
    ['湖北', '鄂', '华中', 34, 65, 's', [['武汉', 2], ['襄阳', 3], ['宜昌', 3], ['荆州', 3], ['黄冈', 3]]],
    ['湖南', '湘', '华中', 40, 61, 's', [['长沙', 2], ['衡阳', 3], ['岳阳', 3], ['常德', 3], ['邵阳', 3]]],
    ['广东', '粤', '华南', 110, 75, 's', [['广州', 1], ['深圳', 1], ['东莞', 2], ['佛山', 2], ['汕头', 3], ['湛江', 3], ['梅州', 4]]],
    ['广西', '桂', '华南', 40, 56, 's', [['南宁', 2], ['柳州', 3], ['桂林', 3], ['玉林', 3]]],
    ['海南', '琼', '华南', 11, 62, 's', [['海口', 2], ['三亚', 3], ['儋州', 4]]],
    ['重庆', '渝', '西南', 18, 71, 's', [['重庆', 2]]],
    ['四川', '川', '西南', 50, 59, 's', [['成都', 2], ['绵阳', 3], ['南充', 3], ['宜宾', 3], ['达州', 3], ['凉山州', 4]]],
    ['贵州', '黔', '西南', 41, 55, 's', [['贵阳', 2], ['遵义', 3], ['毕节', 3], ['黔东南州', 4]]],
    ['云南', '滇', '西南', 41, 52, 'w', [['昆明', 2], ['曲靖', 3], ['大理州', 3], ['红河州', 3], ['昭通', 4]]],
    ['西藏', '藏', '西南', 5, 38, 'w', [['拉萨', 3], ['日喀则', 4]]],
    ['陕西', '陕', '西北', 28, 65, 'n', [['西安', 2], ['宝鸡', 3], ['咸阳', 3], ['榆林', 3], ['汉中', 3]]],
    ['甘肃', '甘', '西北', 20, 55, 'w', [['兰州', 2], ['天水', 3], ['庆阳', 4], ['张掖', 4]]],
    ['青海', '青', '西北', 5, 62, 'w', [['西宁', 2], ['海东', 4]]],
    ['宁夏', '宁', '西北', 7, 67, 'w', [['银川', 2], ['固原', 4]]],
    ['新疆', '新', '西北', 26, 59, 'w', [['乌鲁木齐', 2], ['伊犁州', 3], ['喀什地区', 3], ['巴音郭楞州', 3]]],
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

  function nameOf(sex, surname, old) {
    const pool = old ? (sex === '男' ? OLD_M : OLD_F) : (sex === '男' ? GIVEN_M : GIVEN_F);
    return (surname || pick(SURNAMES)) + pick(pool);
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
      death: o.death || { y: born + clamp(Math.round(78 + (R() - 0.5) * 24), 40, 102), cause: pick(['寿终正寝', '病逝', '病逝', '在睡梦中离世', '因心脏病去世', '因癌症去世']) },
      ms: o.ms || [],
    }, o.extra || {});
  }

  /* ---------- 家庭类型 ----------
   * key: 记忆里的 family；w: 按住处给的权重；bg: 出身几个点；cash: 初始财富；parents: 父母职业说明 */
  const FAMILIES = [
    { key: 'rich', t: '做生意的富裕人家', w: { city: 6, county: 3, rural: 0.5 }, bg: 5, cash: [70, 90], dad: '开公司的', mom: '管家里的账' },
    { key: 'civil', t: '体制内的双职工', w: { city: 20, county: 14, rural: 2 }, bg: 4, cash: [45, 60], dad: '在单位上班', mom: '当老师' },
    { key: 'white', t: '公司职员家庭', w: { city: 34, county: 8, rural: 1 }, bg: 3, cash: [35, 55], dad: '公司职员', mom: '公司职员' },
    { key: 'smallbiz', t: '开小店的个体户', w: { city: 16, county: 30, rural: 8 }, bg: 3, cash: [30, 50], dad: '开小店', mom: '在店里帮忙' },
    { key: 'worker', t: '工人家庭', w: { city: 18, county: 26, rural: 10 }, bg: 2, cash: [20, 35], dad: '厂里的工人', mom: '超市收银员' },
    { key: 'farmer', t: '种地的农户', w: { city: 0, county: 4, rural: 38 }, bg: 1, cash: [10, 25], dad: '种地', mom: '种地、养猪' },
    { key: 'migrant', t: '父母在外打工的家庭', w: { city: 6, county: 12, rural: 40 }, bg: 1, cash: [15, 30], dad: '在外地工地上干活', mom: '在外地电子厂上班' },
  ];
  const HUKOU_T = { city: '城镇', county: '县城', rural: '农村' };

  /* 和这个出身的大多数人（墓志页、分享卡的对照） */
  function fateOf(fam, hukou) {
    if (fam === 'rich') return '读私立学校，出国或者回家接班，在大城市买房，五十岁前后把生意交给下一代，活到八十多岁。';
    if (hukou === 'rural') return '在县城读完高中，考上一所普通大学或者早早出去打工，去省会或沿海城市工作，三十岁前结婚，在县城买房，晚年回老家带孙子，活到八十岁左右。';
    if (hukou === 'county') return '在县城读完高中，去外地读大学，毕业后回县城考编或者留在省会上班，结婚生子，背二三十年房贷，活到八十岁左右。';
    return '读完大学，在本地或更大的城市上班，三十岁前后结婚，生一个孩子，背三十年房贷，六十五岁退休，活到八十多岁。';
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
    const cityName = /[州区市]$/.test(city[0]) ? city[0] : city[0] + '市'; // 自治州、地区不加“市”
    const muni = prov === city[0]; // 直辖市：郊区的镇子和村子
    const place = hukou === 'city' ? cityName : hukou === 'county' ? (muni ? cityName + '郊区的一个镇上' : cityName + '下面的一个县城') : (muni ? cityName + '郊区的一个村子' : cityName + '下面的一个村子');
    const provName = prov === city[0] ? prov + '市' : /^(内蒙古|广西|西藏|宁夏|新疆)$/.test(prov) ? prov + ' ' : prov + '省 ';
    const birthplace = muni ? place : provName + place;
    const homeLoc = hukou === 'city' ? (tier <= 2 ? 'metro' : 'city') : hukou === 'county' ? 'county' : 'village_' + rtype;
    // 父母
    const dadAge = ri(24, 36), momAge = clamp(dadAge - ri(0, 4), 21, 40);
    const dad = person({ id: 'fa', sex: '男', surname, born: NOW - dadAge, origin: fam.dad, ms: [[NOW, fam.dad]] });
    const mom = person({ id: 'mo', sex: '女', born: NOW - momAge, origin: fam.mom, ms: [[NOW, fam.mom]] });
    const family = [{ rel: '父亲', id: 'fa' }, { rel: '母亲', id: 'mo' }];
    const others = [dad, mom];
    if (sibs) {
      for (let i = 0; i < sibs; i++) {
        const older = i < order;
        const sx = R() < 0.5 ? '男' : '女';
        const sb = person({ id: 'sib' + i, sex: sx, surname, born: older ? NOW - ri(2, 7) : NOW + ri(2, 5), origin: older ? '比你大' : '比你小' });
        sb.ms = [[sb.born, '出生'], [sb.born + 7, '上小学'], [sb.born + 18, '读高中毕业了'], [sb.born + 26, '在外地工作'], [sb.born + 30, '成家了']];
        others.push(sb);
        family.push({ rel: (older ? (sx === '男' ? '哥哥' : '姐姐') : (sx === '男' ? '弟弟' : '妹妹')), id: sb.id });
      }
    }
    // 爷爷奶奶（老人）
    const gpa = person({ id: 'gp', sex: '男', surname, born: dad.born - ri(22, 30), origin: hukou === 'rural' ? '在老家种地' : '退休了', death: { y: NOW + ri(3, 22), cause: pick(['病逝', '寿终正寝', '因脑梗去世']) } });
    const gma = person({ id: 'gm', sex: '女', born: dad.born - ri(20, 28), origin: leftBehind ? '在家带你' : '在老家', death: { y: NOW + ri(6, 28), cause: pick(['病逝', '寿终正寝', '在睡梦中离世']) } });
    others.push(gpa, gma);
    family.push({ rel: '爷爷', id: 'gp' }, { rel: '奶奶', id: 'gm' });
    // 同一年出生的人：散在全国，按同样的规则投胎，只记一条简单的人生
    const peers = [];
    for (let i = 0; i < 4; i++) {
      const pp = wpick(PROVS, (p) => p[3]);
      const pc = pick(pp[6]);
      const ph = R() * 100 < pp[4] ? '城里' : '农村';
      const ps = R() < 0.51 ? '男' : '女';
      const path = peerPath(ph);
      const peer = person({ id: 'peer' + i, sex: ps, book: pp[2], origin: '生在' + pp[0] + pc[0] + (ph === '农村' ? '的农村' : ''), ms: path.ms, death: path.death });
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
      info: { 户籍: HUKOU_T[hukou], 家庭: fam.t, 学历: '无', 职业: '无', 婚姻: '', 住处: '' },
      fateText: fateOf(fam.key, hukou),
      focus: '懵懂',
      lastWords: pick(['下辈子，还想来这儿。', '谢谢你们陪我这一趟。', '别哭，都挺好的。', '我这一辈子，没白活。']),
      mem: { prov, provShort: short, region, city: city[0], cityTier: city[1], tier, hukou, family: fam.key, sibs, only: !sibs, leftBehind, rtype, homeLoc, homeCap: hukou === 'city' ? city[0] : place },
      facts: [
        ['出生地', birthplace],
        ['户籍', HUKOU_T[hukou]],
        ['家庭', fam.t],
        ['父亲', dad.name + '，' + dadAge + ' 岁，' + fam.dad],
        ['母亲', mom.name + '，' + momAge + ' 岁，' + fam.mom],
        ['兄弟姐妹', sibs ? family.filter((f) => /哥|姐|弟|妹/.test(f.rel)).map((f) => f.rel).join('、') : '独生子女'],
      ],
      odds: '今年全国出生的孩子里，约 ' + (birthW / TOTAL_W * 100).toFixed(1) + '% 生在' + prov + '；其中' + (hukou === 'rural' ? '生在农村的约占 ' + Math.max(5, 100 - urban - 8) : hukou === 'county' ? '生在县城的约占 20' : '生在城区的约占 ' + Math.max(10, urban - 12)) + '%。你是十四亿分之一。',
    });
    me.intro = (sex === '男' ? '一个男孩' : '一个女孩') + '，' + (R() < 0.5 ? '在凌晨' : R() < 0.5 ? '在午后' : '在傍晚') + '出生在' + birthplace + '的' + (hukou === 'city' ? '医院' : hukou === 'county' ? '县医院' : '镇卫生院') + '。'
      + (leftBehind ? '满月以后，爸妈就回了外地打工，你跟着爷爷奶奶。' : fam.key === 'rich' ? '病房里摆满了花篮。' : '爸妈轮流抱着你，不知道该怎么抱才对。');
    return { me, others };
  };

  /* 同龄人的人生：只要几条近况和结局 */
  function peerPath(ph) {
    const B = NOW, ms = [[B, '刚出生']];
    ms.push([B + 3, '上幼儿园'], [B + 6, '上小学'], [B + 12, '上初中']);
    const up = ph === '城里' ? 0.75 : 0.5;
    let job;
    if (R() < up) { ms.push([B + 15, '上高中'], [B + 18, pick(['考上了大学', '考上了一所普通大学', '考上了重点大学'])]); job = pick(['在写字楼上班', '当了老师', '考上了公务员', '做程序员', '在医院上班', '自己开了家店']); }
    else { ms.push([B + 15, pick(['读了职高', '去外地打工了'])]); job = pick(['在工厂上班', '跑外卖', '跑车拉货', '在工地上干活', '开了家小饭馆', '做直播带货']); }
    ms.push([B + 23, job]);
    if (R() < 0.8) ms.push([B + ri(26, 33), '结婚了']);
    if (R() < 0.65) ms.push([B + ri(28, 36), '有了孩子']);
    if (R() < 0.1) ms.push([B + ri(35, 50), '离婚了']);
    ms.push([B + ri(38, 48), pick(['房贷还剩一半', '孩子上小学了', '换了一份工作', '把父母接来同住']), null]);
    ms.push([B + 65, '退休了']);
    ms.push([B + ri(66, 75), pick(['帮着带孙辈', '在老年大学学书法', '每天去公园散步', '回老家住了'])]);
    const dy = B + clamp(Math.round(80 + (R() - 0.5) * 26), 30, 104);
    return { ms: ms.filter((m) => m[0] < dy).map((m) => [m[0], m[1]]), death: { y: dy, cause: pick(['寿终正寝', '病逝', '病逝', '因心脏病去世', '因癌症去世', dy - B < 50 ? '死于一场车祸' : '在睡梦中离世']) } };
  }

  /* ---------- 年度重心 ---------- */
  JY.FOCUS = [
    { name: '懵懂', minAge: 0, maxAge: 5, d: '还小，由大人照看。', fx: (g) => { g.stat('心情', 1); if (g.rnd() < 0.3) g.stat('健康', 1); } },
    { name: '用功读书', minAge: 6, maxAge: 22, d: '学识涨，心情会闷。', fx: (g) => { g.stat('学识', 2); if (g.rnd() < 0.3) g.stat('心情', -1); } },
    { name: '贪玩', minAge: 6, maxAge: 17, d: '心情好，人缘好，学识涨得慢。', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    { name: '帮家里干活', minAge: 8, maxAge: 17, d: '人缘、健康；人会早熟一些。', fx: (g) => { g.stat('人缘', 1); g.stat('健康', 1); if (g.rnd() < 0.3) g.stat('财富', 1); } },
    { name: '学个特长', minAge: 6, maxAge: 17, d: '学识，偶尔有意外收获；家里要花钱。', fx: (g) => { g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('事业', 1); if (g.rnd() < 0.3) g.stat('财富', -1); } },
    { name: '埋头工作', minAge: 16, d: '事业、财富涨，健康和心情慢慢掉。', fx: (g) => { g.stat('事业', 2); g.stat('财富', 1); if (g.rnd() < 0.35) g.stat('健康', -1); if (g.rnd() < 0.3) g.stat('心情', -1); } },
    { name: '学习充电', minAge: 18, d: '学识；学识高时事业也会涨。', fx: (g) => { g.stat('学识', 2); if (g.rnd() < g.s('学识') / 150) g.stat('事业', 1); } },
    { name: '搞副业', minAge: 18, d: '财富，看运气；累。', fx: (g) => { if (g.rnd() < 0.6) g.stat('财富', 2); else g.stat('财富', -1); if (g.rnd() < 0.3) g.stat('健康', -1); } },
    { name: '陪伴家人', minAge: 18, d: '人缘、心情。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); } },
    { name: '锻炼身体', minAge: 16, d: '健康回升。', fx: (g) => { g.stat('健康', 2); if (g.rnd() < 0.3) g.stat('心情', 1); } },
    { name: '躺平休息', minAge: 18, d: '心情回升，财富和事业停滞。', fx: (g) => { g.stat('心情', 2); if (g.rnd() < 0.3) g.stat('健康', 1); if (g.rnd() < 0.3) g.stat('财富', -1); } },
    { name: '出去走走', minAge: 18, d: '心情、见识；意外多，花钱。', fx: (g) => { g.stat('心情', 1); g.stat('学识', 1); if (g.rnd() < 0.4) g.stat('财富', -1); } },
    { name: '含饴弄孙', minAge: 55, d: '人缘、心情；累一点。', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 1); if (g.rnd() < 0.2) g.stat('健康', -1); } },
  ];

  /* ---------- 人生关口：16、30、50、70 岁（15 岁要中考，关口挪到 16 岁） ---------- */
  JY.PAUSES = [
    { id: 'p15', age: 16, t: '十六岁', ask: '想成为什么样的人？', text: '你十六岁了。夜里躺在床上，你想过以后要成为什么样的人吗？', choices: [
      { t: '赚很多钱的人', canon: true, fx: (g) => { g.info('志向', '赚很多钱'); g.stat('财富', 1); g.remember('aim', 'rich'); } },
      { t: '让爸妈骄傲的人', canon: true, fx: (g) => { g.info('志向', '让爸妈骄傲'); g.stat('人缘', 2); g.remember('aim', 'proud'); } },
      { t: '做自己喜欢的事的人', canon: true, fx: (g) => { g.info('志向', '做喜欢的事'); g.stat('心情', 3); g.remember('aim', 'free'); } },
      { t: '还没想好', canon: true, fx: (g) => { g.info('志向', '还没想好'); g.stat('心情', 1); g.remember('aim', 'none'); } },
    ] },
    { id: 'p30', age: 30, t: '三十岁', ask: '最放不下的是什么？',
      text: (g) => {
        const a = g.recall('aim');
        const back = a === 'rich' ? '十六岁时你想赚很多钱。' + (g.s('财富') >= 60 ? '现在，你确实不太缺钱了。' : '现在，你还在为房租和贷款发愁。')
          : a === 'proud' ? '十六岁时你想让爸妈骄傲。' + (g.s('人缘') >= 60 ? '他们逢人就提起你。' : '他们最近打电话，问得最多的是你什么时候结婚。')
          : a === 'free' ? '十六岁时你想做喜欢的事。' + (g.s('心情') >= 60 ? '这些年，你大体没委屈自己。' : '这些年，你做的大多是不得不做的事。') : '';
        return back + '三十岁了。你最放不下的是什么？';
      }, choices: [
      { t: '家里人', canon: true, fx: (g) => { g.stat('人缘', 3); g.info('心结', '家里人'); g.remember('knot', 'family'); } },
      { t: '钱', canon: true, fx: (g) => { g.stat('财富', 1); g.info('心结', '钱'); g.remember('knot', 'money'); } },
      { t: '一个人', canon: true, fx: (g) => { g.stat('心情', -1); g.info('心结', '一个人'); g.remember('knot', 'person'); } },
      { t: '没什么放不下的', canon: true, fx: (g) => { g.stat('心情', 4); g.remember('knot', 'none'); } },
    ] },
    { id: 'p50', age: 50, t: '五十岁', ask: '想被怎样记住？',
      text: (g) => {
        const k = g.recall('knot');
        const back = k === 'family' ? '三十岁时你放不下家里人。' + (g.alive('fa') || g.alive('mo') ? '爸妈都老了，你回家的次数还是不够多。' : '爸妈都不在了。') : k === 'money' ? '三十岁时你放不下钱。' + (g.s('财富') >= 60 ? '这二十年，钱总算攒下了一些。' : '这二十年，钱还是没攒下多少。') : k === 'person' ? '三十岁时你放不下一个人。二十年过去，你很少再想起了。' : '';
        return back + '五十岁了。以后别人说起你，你希望他们说什么？';
      }, choices: [
      { t: '“是个好人。”', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('心愿', '做个好人'); g.remember('fame', 'good'); } },
      { t: '“有本事。”', canon: true, fx: (g) => { g.stat('事业', 2); g.info('心愿', '有本事'); g.remember('fame', 'able'); } },
      { t: '“把家撑起来了。”', canon: true, fx: (g) => { g.stat('人缘', 1); g.info('心愿', '撑起这个家'); g.remember('fame', 'family'); } },
      { t: '“活得挺自在。”', canon: true, fx: (g) => { g.stat('心情', 4); g.info('心愿', '自在'); g.remember('fame', 'free'); } },
    ] },
    { id: 'p70', age: 70, t: '七十岁', ask: '如果能重来，回到哪一年？',
      text: (g) => {
        const f = g.recall('fame');
        const said = f === 'good' ? (g.s('人缘') >= 50 ? '邻居们都说你是个好人。' : '你觉得自己是个好人，别人怎么想就不知道了。')
          : f === 'able' ? (g.s('事业') >= 55 ? '说起你，大家都说有本事。' : '你的本事，别人没怎么看见。')
          : f === 'family' ? '这个家，你撑过来了。' : f === 'free' ? '你活得挺自在。' : '';
        return said + '七十岁了。如果能回到某一年重来一次，你选哪一年？';
      }, choices: [
      { t: '高考那年', canon: true, fx: (g) => g.info('遗愿', '回到高考那年') },
      { t: '刚工作那年', canon: true, fx: (g) => g.info('遗愿', '回到刚工作那年') },
      { t: '爸妈还年轻的时候', canon: true, fx: (g) => { g.stat('人缘', 2); g.info('遗愿', '再见爸妈年轻的样子'); } },
      { t: '不回去了，这一生就这样', canon: true, fx: (g) => g.stat('心情', 5) },
    ] },
  ];

  /* ---------- 给剧情用的工具函数 ----------
   * 剧情文件里用 const CN = JY.CN; 然后 CN.setJob(g, 'tech', '程序员') 这样调用。
   * 状态都存在这一世的记忆里（g.remember），名帖字段用 g.info。键名见 docs/SPEC.md。 */
  const CN = (JY.CN = {
    NOW, PROVS, person, pick, ri, R,
    sexOf: (g) => (JY.byId[g.me] ? JY.byId[g.me].sex : '男'),
    he: (g, id) => (JY.byId[id] && JY.byId[id].sex === '女' ? '她' : '他'),
    // 回到老家
    goHome: (g, cap) => g.move(g.recall('homeLoc'), cap || g.recall('homeCap')),
    // 去某个等级的城市：tier 1 一线，2 省会/新一线，3 地级市，4 县城。返回城市名
    goCity: (g, tier, name) => {
      const P = PROVS.find((p) => p[0] === g.recall('prov'));
      let city = name;
      if (!city) {
        if (tier === 1) city = pick(['北京', '上海', '广州', '深圳']);
        else if (tier === 2) city = (P && P[6].find((c) => c[1] === 2) || [pick(['杭州', '成都', '武汉', '南京', '西安'])])[0];
        else if (tier === 3) city = (P && pick(P[6])[0]) || '老家的市里';
        else city = g.recall('city') + '下面的县城';
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
      const surname = CN.sexOf(g) === '男' ? JY.byId[g.me].name[0] : (JY.byId.sp ? JY.byId.sp.name[0] : JY.byId[g.me].name[0]);
      const k = person(Object.assign({ id: 'k' + n, born: g.Y, surname, origin: '你的孩子' }, o));
      g.spawn(k);
      g.rel(['', '', '二', '三', '四', '五'][n] + (k.sex === '男' ? '儿子' : '女儿'), k.id); // 关系名不能重复，第二个起加“二”“三”
      g.remember('kids', n);
      g.info('子女', n + ' 个');
      return k;
    },
  });
})();

/* 十四亿分之一 · 青年：18–34 岁
 * 高考和志愿、大学或打工、参军、毕业去向、AI 替代、恋爱、彩礼、结婚、买房、生孩子、回不回老家。
 * 读童年留下的 edu、school、hukou、family；给中年留下 edu、uni、major、job、workCity、tier、love、kids、house、debt。
 * 新增的状态键名见文件末尾的说明，也写进了 docs/SPEC.md 的表。
 *
 * 一年最多一个抉择：用 dec() 注册的抉择节点，同一年龄里排在前面的先触发，触发过一个，同龄的其他就跳过。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;

  /* ---------- 小工具 ---------- */
  const BY_AGE = {};
  // 抉择节点：同一年龄只出现一个（按本文件里的先后）
  const dec = (n) => {
    const ids = (BY_AGE[n.age] = BY_AGE[n.age] || []);
    ids.push(n.id);
    const own = n.cond;
    n.cond = (g) => {
      const L = JY.engine.get().L;
      if (L && ids.some((id) => id !== n.id && L.done[id])) return false;
      return !own || own(g);
    };
    return n;
  };
  const isMale = (g) => CN.sexOf(g) === '男';
  // 童年职高专业（childhood 的 vocMajor）对应的大专专业
  const VOC_MAJOR = { mech: '汽修', care: '护理', ecom: '电商', robot: '机器人维修' };
  const WHITE = ['office', 'tech', 'civil', 'teacher', 'doctor', 'sales'];
  const white = (g) => WHITE.includes(g.recall('job'));
  const AI_JOBS = ['office', 'tech', 'sales', 'worker', 'rider', 'driver'];
  const rural = (g) => g.recall('hukou') === 'rural';
  const tierNow = (g) => g.recall('tier') || 5;
  const spName = (g) => (JY.byId.sp ? g.name('sp') : '对象');
  const kidN = (g) => g.recall('kids') || 0;
  const loveIs = (g, v) => (g.recall('love') || 'single') === v;
  const home = (g) => g.recall('homeCap') || '老家';
  // 本省省会
  const capital = (g) => {
    const P = CN.PROVS.find((p) => p[0] === g.recall('prov'));
    const c = P && (P[6].find((x) => x[1] <= 2) || P[6][0]);
    return c ? c[0] : '省城';
  };
  const bigCity = () => CN.pick(['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉']);

  /* 高考档次：学识 + 学校 + 运气 */
  const gaokao = (g, bonus) => {
    const sc = { key: 12, normal: 0, weak: -8 }[g.recall('school')] || 0;
    const v = g.s('学识') + sc + (bonus || 0) + (g.rnd() * 20 - 10);
    // 童年结束时高中生的学识大多在 60–95；按真实比例：顶尖约 6%，好大学约 25%，普通本科约 40%，大专约 20%，落榜约 10%
    return v >= 100 ? 'top' : v >= 88 ? 'good' : v >= 74 ? 'normal' : v >= 62 ? 'college' : 'fail';
  };
  const UNI_T = { top: '一所顶尖大学', good: '一所好大学', normal: '一所普通本科' };
  // 进大学：档次、专业、城市
  // 调用前先在选项里 g.remember('uni', …) 和 g.remember('major', …)
  const enroll = (g, city, tier) => {
    const uni = g.recall('uni');
    g.remember('lifePath', 'uni');
    g.info('学历', '本科在读');
    CN.goCity(g, tier, city);
    g.move('campus', city + ' · ' + UNI_T[uni]);
  };

  /* 志愿：18 岁第一次高考，19 岁复读后的第二次，共用一套选项 */
  const zhiyuan = (id, age, cond) => dec({ id, age, t: '填志愿', loc: 'home', cond,
    text: (g) => {
      const gk = g.recall('gk');
      return (gk === 'top' ? '分数出来了，比你预想的高。班主任打电话来，声音都变了。' : gk === 'good' ? '分数不错，够得上一所好大学，挑不了最热门的专业。' : '分数刚过本科线。志愿书厚厚一本，你翻到半夜。')
        + '爸妈说你自己定，又说别离家太远。';
    },
    choices: [
      { t: '去大城市，报热门的计算机', canon: true,
        fx: (g) => { const gk = g.recall('gk'); const tier = gk === 'normal' ? 2 : 1; g.remember('uni', gk); g.remember('major', '计算机'); enroll(g, tier === 1 ? bigCity() : capital(g), tier); g.stat('心情', 2); },
        res: (g) => '录取通知书寄到了。' + g.recall('workCity') + '，你只在地图上见过。' },
      { t: '报师范或医学，图个稳当', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', g.rnd() < 0.5 ? '师范' : '医学'); enroll(g, capital(g), 2); g.stat('人缘', 2); },
        res: (g) => (g.recall('major') === '医学' ? '医学要读五年。你妈说，以后家里人看病就不求人了。' : '师范生，毕业以后多半回来当老师。你爸挺满意。') },
      { t: '离家近，在本省读个好就业的专业', dev: 10,
        fx: (g) => { g.remember('uni', g.recall('gk')); g.remember('major', CN.pick(['会计', '机械', '电气', '中文', '法学'])); enroll(g, capital(g), 2); g.stat('人缘', 1); },
        res: (g) => '学校在' + g.recall('workCity') + '，坐车三个小时就能回家。专业是' + g.recall('major') + '。' },
      { t: '不甘心，复读一年', dev: 25, cond: (g) => g.recall('gk') !== 'top' && g.recall('lifePath') !== 'repeat',
        fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -6); g.move('school', home(g) + ' · 复读班'); },
        res: '复读班在县中学的后楼。第一天点名，你认识里面一半的人。' },
    ] });

  JY.addFlags({
    ySavedWorker: '在工地上救下了一个从脚手架上摔下来的工友',
    yHometownShop: '回老家开了一家店，后来成了镇上的老字号',
  });

  JY.addLifeNodes([
    /* ================= 18 岁：衔接童年 ================= */
    { id: 'y_entry', age: 18, t: '十八岁', auto: true,
      fx: (g) => {
        // 童年没留下学历时兜底：按学识和出身估一个
        let e = g.recall('edu');
        if (!e) {
          const r = g.s('学识') + (rural(g) ? -8 : 4) + g.rnd() * 30;
          e = r >= 60 ? 'senior' : r >= 42 ? 'vocational' : 'junior';
          CN.setEdu(g, e, { senior: '高中', vocational: '职高', junior: '初中' }[e]);
        }
        if (e === 'primary') CN.setEdu(g, 'junior', '初中');
        // 童年写的是“高中在读”“职高在读”，十八岁毕业
        if (e === 'senior') CN.setEdu(g, 'senior', '高中');
        if (e === 'vocational') CN.setEdu(g, 'vocational', '职高');
        if ((e === 'junior' || e === 'primary') && (!g.recall('job') || g.recall('job') === 'none')) {
          CN.setJob(g, 'worker', '工厂工人');
          CN.goCity(g, CN.pick([1, 3, 3]));
          g.move('factory', g.recall('workCity') + ' · 电子厂');
        }
        if (e === 'junior' || e === 'primary') g.remember('lifePath', 'work');
        if (e === 'senior') g.remember('gk', gaokao(g));
      },
      text: (g) => (g.recall('edu') === 'senior' ? '六月，你走进考场。笔袋是透明的，手心全是汗。'
        : g.recall('edu') === 'vocational' ? '职高最后一年，你在实习的地方过了十八岁生日。'
        : '你十八岁了。在' + (g.recall('workCity') || '外地') + '的宿舍里，工友给你买了一个小蛋糕。') },
    { id: 'y_gaokao', age: 18, t: '高考放榜', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => ({ top: '你考了全县第一。门口放了一挂鞭炮，是邻居放的。', good: '你考得不错。班主任在群里点了你的名。', normal: '分数刚过本科线，不高不低。', college: '分数够不上本科，只够大专。', fail: '分数出来，你看了很久，关掉了网页。' }[g.recall('gk')]) },
    zhiyuan('y_zhiyuan', 18, (g) => ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_zhuanke', age: 18, t: '大专', loc: 'home', cond: (g) => g.recall('gk') === 'college',
      text: '能上的是一所大专，在省城边上。你妈说，大专也是大学。',
      choices: [
        { t: '去读，学个实用的专业', canon: true,
          fx: (g) => { const m = CN.pick(['护理', '汽修', '电商', '学前教育', '机电']); g.remember('major', m); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); },
          res: (g) => '专业是' + g.recall('major') + '。宿舍六个人，三个和你一样是第一次离家。' },
        { t: '复读一年，冲本科', dev: 20, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -5); g.move('school', home(g) + ' · 复读班'); }, res: '你把大专的录取通知书压在了抽屉最底下。' },
        { t: '不读了，出去挣钱', dev: 25,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工业园'); g.stat('财富', 4); },
          res: (g) => '表哥在' + g.recall('workCity') + '的厂里当线长，说可以带你。' },
      ] }),
    dec({ id: 'y_luobang', age: 18, t: '落榜', loc: 'home', cond: (g) => g.recall('gk') === 'fail',
      text: '你没考上。家里没人提这件事，吃饭的时候特别安静。',
      choices: [
        { t: '复读', canon: true, fx: (g) => { g.remember('lifePath', 'repeat'); g.stat('心情', -4); g.move('school', home(g) + ' · 复读班'); }, res: '你又背上了书包。' },
        { t: '去南方打工', dev: 10,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1, CN.pick(['深圳', '广州'])); g.move('factory', g.recall('workCity') + ' · 工业园'); g.stat('财富', 3); },
          res: (g) => '绿皮车坐了二十个小时。' + g.recall('workCity') + '的夏天比老家热。' },
        { t: '去当兵', dev: 20, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部队的路上'); g.stat('健康', 5); },
          res: '体检过了。走的那天，村口挂了横幅，写着你的名字。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 3); }, res: '体检没过，视力差了一点。你跟着同学去了市里的厂子。' } },
      ] }),
    dec({ id: 'y_voc18', age: 18, t: '职高毕业', loc: 'factory', cond: (g) => g.recall('edu') === 'vocational' && !g.recall('lifePath'),
      text: (g) => (g.recall('vocPlan') === 'college' ? '职教高考的成绩出来了，够上一所高职。' : '实习的厂子说可以留你。') + '老师说，读三年大专，出来路宽一点。',
      choices: [
        { t: '考高职，读大专', canon: true,
          fx: (g) => { g.remember('major', VOC_MAJOR[g.recall('vocMajor')] || CN.pick(['汽修', '数控', '护理', '电商', '烹饪'])); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); },
          res: (g) => '你考上了。学的还是' + g.recall('major') + '，只是学校大了。' },
        { t: '留在厂里转正', dev: 5,
          fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 车间'); g.stat('财富', 4); },
          res: '转正那天，班长让你自己带一台机器。' },
        { t: '去当兵', dev: 15, check: ['健康', 55],
          fx: (g) => { g.remember('lifePath', 'army'); CN.setJob(g, 'soldier', '士兵'); g.move('road', '去部队的路上'); g.stat('健康', 5); },
          res: '你剃了平头，在火车站跟妈妈挥手。',
          fail: { fx: (g) => { g.remember('lifePath', 'work'); CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); }, res: '体检没过。你回了实习的厂子。' } },
      ] }),
    dec({ id: 'y_work18', age: 18, t: '在外面', loc: 'factory', cond: (g) => g.recall('lifePath') === 'work' && ['junior', 'primary'].includes(g.recall('edu')),
      text: (g) => '你在' + (g.recall('workCity') || '外地') + '已经干了两年。' + (g.recall('workPlan') === 'study' ? '夜校的课快上完了。' : g.recall('workPlan') === 'city' ? '电动车换了第二辆。' : '流水线上的活闭着眼都会了。'),
      choices: [
        { t: '接着干，攒钱', canon: true, fx: (g) => { g.remember('workStyle', 'save'); g.stat('财富', 5); g.stat('心情', -2); }, res: '你每个月往家里打一半工资，自己留一点吃饭。' },
        { t: '去大城市跑外卖', dev: 15,
          fx: (g) => { CN.setJob(g, 'rider', '外卖骑手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('财富', 4); g.stat('健康', -2); },
          res: (g) => '在' + g.recall('workCity') + '，你租了一辆电动车，第一天跑了二十单。' },
        { t: '跟师傅学门手艺', dev: 15,
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.setJob(g, 'worker', { cook: '学徒厨师', auto: '汽修学徒', hair: '理发学徒', elec: '电工学徒' }[s]); g.stat('财富', -2); },
          res: '学徒工资少，师傅脾气大。你每天最后一个走。' },
      ] }),

    /* ================= 19 岁 ================= */
    { id: 'y_firstleave', age: 18, t: '第一次离家', auto: true, cond: (g) => g.recall('lifePath') === 'uni' || g.recall('lifePath') === 'college',
      text: (g) => (g.recall('hukou') === 'rural' ? '你爸扛着被子送你到宿舍楼下，没上楼，说楼梯太窄。' : '你妈帮你铺好床，又把柜子擦了一遍。走的时候她没回头。') },
    { id: 'y_repeat', age: 19, t: '第二次高考', auto: true, cond: (g) => g.recall('lifePath') === 'repeat',
      fx: (g) => { const r = gaokao(g, 8); g.remember('gk', r === 'fail' ? 'college' : r); },
      text: (g) => '复读这一年，你瘦了十斤。第二次放榜，你考到了' + ({ top: '全市前列', good: '一本线以上', normal: '本科线以上', college: '大专线' }[g.recall('gk')]) + '。' },
    zhiyuan('y_zhiyuan2', 19, (g) => g.recall('lifePath') === 'repeat' && ['top', 'good', 'normal'].includes(g.recall('gk'))),
    dec({ id: 'y_repeat_college', age: 19, t: '还是大专', loc: 'home', cond: (g) => g.recall('lifePath') === 'repeat' && g.recall('gk') === 'college',
      text: '复读一年，分数还是只够大专。',
      choices: [
        { t: '认了，去读', canon: true, fx: (g) => { g.remember('major', CN.pick(['护理', '汽修', '电商', '机电'])); g.remember('lifePath', 'college'); g.info('学历', '大专在读'); CN.goCity(g, 2, capital(g)); g.move('campus', capital(g) + ' · 职业技术学院'); }, res: '你比同学大一岁。没人知道。' },
        { t: '出去打工', dev: 10, fx: (g) => { g.remember('lifePath', 'work'); CN.setEdu(g, 'senior', '高中'); CN.setJob(g, 'worker', '工厂工人'); CN.goCity(g, 1); g.move('factory', g.recall('workCity') + ' · 工业园'); }, res: '你把复读的书都卖了，换了一张火车票。' },
      ] }),
    dec({ id: 'y_campus', age: 19, t: '大一', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '宿舍熄灯以后，走廊里还有人在打电话。大学和你想的不太一样，没人管你。',
      choices: [
        { t: '泡图书馆，卷绩点', canon: true, fx: (g) => { g.remember('campus', 'study'); g.stat('学识', 6); g.stat('心情', -2); }, res: '你拿了一等奖学金。室友说你没意思。' },
        { t: '进社团，认识人', dev: 10, fx: (g) => { g.remember('campus', 'club'); g.stat('人缘', 6); g.stat('心情', 3); }, res: '你当上了社团的副部长，手机里多了两百个联系人。' },
        { t: '谈一场恋爱', dev: 10, check: ['人缘', 45],
          fx: (g) => { g.remember('campus', 'love'); g.remember('love', 'dating'); g.remember('loveFrom', 'campus'); g.info('婚姻', '恋爱中'); g.stat('心情', 8); },
          res: '你们在食堂门口第一次说上话。后来每天一起去上早八。',
          fail: { fx: (g) => { g.remember('campus', 'game'); g.stat('心情', -3); }, res: '表白被拒了。你在宿舍打了一个学期的游戏。' } },
      ] }),
    dec({ id: 'y_work19', age: 19, t: '城里', loc: 'metro', cond: (g) => g.recall('lifePath') === 'work',
      text: (g) => '在' + (g.recall('workCity') || '城里') + '的第一个春节，你没回家。厂里包了饺子，你吃了三个。',
      choices: [
        { t: '能省就省，钱存着', canon: true, fx: (g) => { g.remember('workStyle', 'save'); g.stat('财富', 5); g.stat('心情', -2); }, res: '你的存折上第一次有了五位数。' },
        { t: '跟工友出去玩，见见世面', dev: 10, fx: (g) => { g.remember('workStyle', 'fun'); g.stat('心情', 5); g.stat('人缘', 4); g.stat('财富', -3); }, res: '你们去了海边。你第一次见到海，站了很久。' },
        { t: '晚上去上夜校，考个证', dev: 15, fx: (g) => { g.remember('workStyle', 'study'); g.stat('学识', 6); g.stat('健康', -2); }, res: '下了夜班去上课，你常常在最后一排睡着。证考下来了。' },
      ] }),

    /* ================= 20 岁 ================= */
    dec({ id: 'y_army_back', age: 20, t: '退伍', loc: 'road', cond: (g) => g.recall('lifePath') === 'army',
      text: '两年兵役满了。指导员问你要不要留下转士官。',
      choices: [
        { t: '留队，转士官', dev: 10, fx: (g) => { g.remember('army', 'stay'); CN.setJob(g, 'soldier', '士官'); g.stat('健康', 4); g.stat('事业', 6); }, res: '你肩上的牌子换了颜色。' },
        { t: '退伍，回老家考公', canon: true,
          fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); if (g.s('学识') >= 45 || g.rnd() < 0.5) { CN.setJob(g, 'civil', '基层公务员'); CN.goCity(g, 4); } else { CN.setJob(g, 'driver', '司机'); CN.goCity(g, 3); } },
          res: (g) => (g.recall('job') === 'civil' ? '退役军人有加分。你考上了县里的岗位。' : '没考上。你考了驾照，在市里给一家公司开车。') },
        { t: '退伍，去大城市当保安、做物流', dev: 10, fx: (g) => { g.remember('army', 'out'); g.remember('lifePath', 'work'); CN.setJob(g, 'driver', '物流司机'); CN.goCity(g, 1); g.stat('财富', 4); }, res: '物流公司喜欢当过兵的人。你开的是夜班车。' },
      ] }),
    dec({ id: 'y_side', age: 20, t: '课余', loc: 'campus', cond: (g) => ['uni', 'college'].includes(g.recall('lifePath')),
      text: '大二了。身边的人有的去实习，有的在做兼职，有的在打游戏。',
      choices: [
        { t: '找家公司实习', canon: true, fx: (g) => { g.remember('side', 'intern'); g.stat('事业', 5); g.stat('学识', 2); }, res: '实习工资不多。你学会了做表格，也学会了看领导脸色。' },
        { t: '做家教、送外卖挣生活费', dev: 10, fx: (g) => { g.remember('side', 'money'); g.stat('财富', 5); g.stat('学识', -1); }, res: '你再没问家里要过生活费。' },
        { t: '和同学搞个小项目', dev: 20, check: ['学识', 72],
          fx: (g) => { g.remember('side', 'project'); g.stat('事业', 4); g.stat('学识', 4); }, res: '你们做的小程序有了几千个用户。有人问你们要不要融资。',
          fail: { fx: (g) => { g.remember('side', 'none'); g.stat('心情', -3); }, res: '项目做了一半，散伙了。' } },
      ] }),
    dec({ id: 'y_work20', age: 20, t: '换个活法', loc: 'factory', cond: (g) => g.recall('lifePath') === 'work' && !g.recall('army'),
      text: (g) => (g.recall('workStyle') === 'study' ? '你考下来的证，让你有了换岗的机会。' : '厂里的订单越来越少，车间里多了几台机械臂。'),
      choices: [
        { t: '学门手艺，以后不靠流水线', canon: true, cond: (g) => !g.recall('skill'),
          fx: (g) => { const s = CN.pick(['cook', 'auto', 'hair', 'elec']); g.remember('skill', s); CN.setJob(g, 'worker', { cook: '厨师', auto: '汽修工', hair: '理发师', elec: '电工' }[s]); g.stat('财富', -2); g.stat('事业', 4); },
          res: '你拜了个师傅。半年后，师傅说你可以出师了。' },
        { t: '去跑外卖，多劳多得', dev: 10, cond: (g) => g.recall('job') !== 'rider',
          fx: (g) => { CN.setJob(g, 'rider', '外卖骑手'); CN.goCity(g, 1); g.move('metro', g.recall('workCity') + ' · 城中村'); g.stat('财富', 5); g.stat('健康', -3); },
          res: '你每天跑十二个小时，膝盖开始疼。' },
        { t: '学着做直播', dev: 20, check: ['人缘', 50],
          fx: (g) => { CN.setJob(g, 'creator', '主播'); g.stat('财富', 4); g.stat('心情', 3); }, res: '你拍的工地日常有人看。第一个月，打赏够交房租了。',
          fail: { fx: (g) => { g.stat('心情', -4); g.stat('财富', -2); }, res: '直播间常常只有三个人，其中一个是你妈。' } },
        { t: '回老家，帮家里', dev: 10,
          fx: (g) => { CN.goHome(g); g.remember('tier', 5); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '种地，农闲打零工' : '在家里的店帮忙'); g.stat('心情', 3); g.stat('财富', -2); },
          res: '你回来那天，家门口的路刚修成水泥的。' },
      ] }),

    /* ================= 21 岁 ================= */
    dec({ id: 'y_plan', age: 21, t: '大三', loc: 'campus', cond: (g) => g.recall('lifePath') === 'uni',
      text: '大三下学期，宿舍里的人分成了几拨：考研的、考公的、找工作的。',
      choices: [
        { t: '找工作', canon: true, fx: (g) => { g.remember('plan', 'job'); g.stat('事业', 3); }, res: '你改了十几版简历。' },
        { t: '考研', dev: 10, fx: (g) => { g.remember('plan', 'grad'); g.stat('学识', 4); g.stat('心情', -3); }, res: '你在自习室占了一个靠窗的座位，一坐就是一年。' },
        { t: '考公', dev: 10, fx: (g) => { g.remember('plan', 'civil'); g.stat('学识', 3); }, res: '你买了一摞行测和申论的书。' },
        { t: '出国读书', dev: 20, cond: (g) => ['rich', 'civil'].includes(g.recall('family')) || g.s('财富') >= 55, fx: (g) => { g.remember('plan', 'abroad'); g.stat('财富', -8); g.stat('学识', 3); }, res: '你考了语言成绩，家里给你准备了一笔钱。' },
      ] }),
    dec({ id: 'y_college_out', age: 21, t: '大专毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'college',
      text: (g) => '三年过得快。' + (g.recall('major') || '你的专业') + '的同学，大半已经签了工作。',
      choices: [
        { t: '按专业找工作', canon: true,
          fx: (g) => {
            CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work');
            const m = g.recall('major');
            if (m === '护理') { CN.setJob(g, 'nurse', '护士'); CN.goCity(g, 3); g.move('hospital', g.recall('workCity') + ' · 市医院'); }
            else if (m === '学前教育') { CN.setJob(g, 'teacher', '幼儿园老师'); CN.goCity(g, 3); }
            else if (m === '机器人维修') { CN.setJob(g, 'worker', '机器人运维'); CN.goCity(g, 2); g.move('factory', g.recall('workCity') + ' · 自动化工厂'); }
            else if (m === '电商') { CN.setJob(g, 'sales', '电商运营'); CN.goCity(g, 2); g.move('office', g.recall('workCity') + ' · 电商园区'); }
            else { CN.setJob(g, 'worker', '技术工人'); CN.goCity(g, 3); g.move('factory', g.recall('workCity') + ' · 车间'); }
            g.stat('财富', 3);
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了，职位是' + (JY.engine.get().L.info['职业'] || '') + '。' },
        { t: '专升本，再读两年', dev: 15, check: ['学识', 66],
          fx: (g) => { g.remember('lifePath', 'uni'); g.remember('uni', 'normal'); g.remember('plan', 'job'); g.info('学历', '本科在读'); g.stat('学识', 3); },
          res: '你考上了。毕业证上会写着“本科”两个字。',
          fail: { fx: (g) => { CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work'); CN.setJob(g, 'sales', '销售'); CN.goCity(g, 2); }, res: '差了几分。你拿着大专文凭去做了销售。' } },
        { t: '回老家开店', dev: 20,
          fx: (g) => { CN.setEdu(g, 'college', '大专'); g.remember('lifePath', 'work'); CN.goHome(g); g.remember('tier', 4); CN.setJob(g, 'shop', '开小店'); g.stat('财富', -5); g.stat('心情', 3); },
          res: (g) => '你在' + home(g) + '的街上盘下一个门面。' },
      ] }),
    dec({ id: 'y_love21', age: 21, t: '有人', loc: 'metro', cond: (g) => g.recall('lifePath') === 'work' && loveIs(g, 'single'),
      text: (g) => '同在' + (g.recall('workCity') || '城里') + '打拼的老乡里，有个人总是给你留饭。',
      choices: [
        { t: '处处看', canon: true, fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'work'); g.info('婚姻', '恋爱中'); g.stat('心情', 6); }, res: '你们下了班一起去吃麻辣烫，一人一碗，加一个蛋。' },
        { t: '先顾自己，不想谈', dev: 10, fx: (g) => { g.remember('singleWay', 'self'); g.stat('财富', 2); g.stat('事业', 2); }, res: '你把那份心思都放在了挣钱上。' },
      ] }),

    /* ================= 22 岁：毕业 ================= */
    { id: 'y_grad_result', age: 22, t: '毕业季', auto: true, cond: (g) => g.recall('lifePath') === 'uni',
      fx: (g) => {
        const p = g.recall('plan');
        const uniB = { top: 15, good: 6, normal: 0 }[g.recall('uni')] || 0;
        if (p === 'grad' && g.s('学识') + uniB + g.rnd() * 20 >= 88) { g.remember('lifePath', 'grad'); CN.setEdu(g, 'bachelor', '本科'); g.info('学历', '硕士在读'); g.move('campus', g.recall('workCity') + ' · 研究生院'); }
        else if (p === 'civil' && g.s('学识') + uniB + g.rnd() * 25 >= 90) { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'work'); CN.setJob(g, 'civil', '公务员'); CN.goCity(g, CN.pick([2, 3, 4])); g.move('office', g.recall('workCity') + ' · 机关大院'); }
        else if (p === 'abroad') { CN.setEdu(g, 'bachelor', '本科'); g.remember('lifePath', 'abroad'); g.info('学历', '在国外读硕士'); g.move('campus', '国外 · 一所大学'); }
        else { CN.setEdu(g, 'bachelor', '本科'); g.remember('gradFail', p === 'grad' || p === 'civil'); }
      },
      text: (g) => {
        const t = g.recall('lifePath');
        if (t === 'grad') return '你考上了研究生。拍毕业照那天，你知道自己还要在学校里待三年。';
        if (t === 'abroad') return '毕业典礼一结束，你就去了机场。';
        if (g.recall('job') === 'civil') return '你考上了。公示名单上，你的名字排在第三个。';
        return (g.recall('gradFail') ? '考试没上岸。' : '') + '毕业照上大家都在笑。散伙饭吃到凌晨，' + ({ love: '你和对象在操场上坐到天亮。', club: '社团的人哭成一片。', study: '你把笔记本送给了学弟。', game: '你们最后开了一局游戏。' }[g.recall('campus')] || '有人喝多了。');
      } },
    dec({ id: 'y_offer', age: 22, t: '第一份工作', loc: 'office', cond: (g) => g.recall('lifePath') === 'uni' && !g.recall('job'),
      text: (g) => '投了几十份简历，' + (g.recall('side') === 'intern' ? '实习过的公司先给了你回复。' : '回音不多。') + '那一年，很多基础岗位被 AI 替代，招聘会上的人比岗位多。',
      choices: [
        { t: '去大城市，进一家大厂', dev: 10, check: ['学识', 84],
          fx: (g) => { CN.setJob(g, g.recall('major') === '计算机' ? 'tech' : 'office', g.recall('major') === '计算机' ? '程序员' : '大厂职员'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 写字楼'); g.remember('lifePath', 'work'); g.stat('财富', 8); g.stat('健康', -3); },
          res: (g) => '你进了' + g.recall('workCity') + '的一家大厂。工牌挂在脖子上，晚上十点地铁还很挤。',
          fail: { fx: (g) => { CN.setJob(g, 'office', '公司职员'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); }, res: (g) => '大厂没要你。你回了' + g.recall('workCity') + '，在一家小公司上班。' } },
        { t: '回省城，找份稳定的工作', canon: true,
          fx: (g) => {
            const m = g.recall('major');
            if (m === '医学') { CN.setJob(g, 'doctor', '住院医生'); g.move('hospital', capital(g) + ' · 省医院'); }
            else if (m === '师范') CN.setJob(g, 'teacher', '中学老师');
            else CN.setJob(g, 'office', '公司职员');
            CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.stat('财富', 4);
          },
          res: (g) => '你在' + g.recall('workCity') + '上班了。工资不高，周末能回家。' },
        { t: '回老家，考编', dev: 10,
          fx: (g) => { CN.setJob(g, g.recall('major') === '师范' ? 'teacher' : 'civil', g.recall('major') === '师范' ? '县中学老师' : '乡镇公务员'); CN.goCity(g, 4); g.remember('backHome', 'early'); g.remember('lifePath', 'work'); g.stat('心情', 3); },
          res: '编制考上了。你妈在亲戚群里发了一个大红包。' },
        { t: '做自媒体，自己干', dev: 25, check: ['人缘', 55],
          fx: (g) => { CN.setJob(g, 'creator', '博主'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.stat('财富', 5); g.stat('心情', 4); },
          res: '你拍的租房日常火了一条。半年后，接广告的钱够活了。',
          fail: { fx: (g) => { CN.setJob(g, 'freelance', '自由职业'); CN.goCity(g, 2, capital(g)); g.remember('lifePath', 'work'); g.stat('财富', -4); }, res: '粉丝涨得很慢。你接了一些零活，勉强交上房租。' } },
      ] }),
    dec({ id: 'y_worker22', age: 22, t: '留下还是回去', loc: 'metro', cond: (g) => g.recall('lifePath') === 'work' && !white(g) && !g.recall('army'),
      text: (g) => '过年回家，' + (g.recall('workStyle') === 'save' ? '你给爸妈带了一个红包，鼓鼓的。' : '你兜里没剩几个钱。') + '你爸问你，打算在外面漂到什么时候。',
      choices: [
        { t: '留在城里接着干', canon: true, fx: (g) => { g.remember('stayCity', true); g.stat('事业', 3); g.stat('财富', 3); }, res: '正月初六，你又坐上了往南的车。' },
        { t: '回老家开个店', dev: 20, cond: (g) => !!g.recall('skill') || g.recall('workStyle') === 'save',
          fx: (g) => { CN.goHome(g); g.remember('tier', 4); g.remember('backHome', 'early'); CN.setJob(g, 'shop', { cook: '开小饭馆', auto: '开修车铺', hair: '开理发店', elec: '开五金店' }[g.recall('skill')] || '开小卖部'); g.stat('财富', -6); g.stat('心情', 5); },
          res: '开张那天，你放了一挂鞭炮。第一个客人是你小学同学。' },
        { t: '去更远的城市闯', dev: 15, fx: (g) => { CN.goCity(g, 1, CN.pick(['上海', '深圳', '北京', '杭州'])); g.remember('stayCity', true); g.stat('财富', 3); g.stat('心情', -2); }, res: (g) => '你去了' + g.recall('workCity') + '。地铁线路图你看了三天才看懂。' },
      ] }),

    /* ================= 23 岁 ================= */
    dec({ id: 'y_abroad', age: 23, t: '在国外', loc: 'campus', cond: (g) => g.recall('lifePath') === 'abroad',
      text: '硕士快毕业了。你在超市里找了很久，才找到一瓶像样的老干妈。',
      choices: [
        { t: '回国', canon: true, fx: (g) => { CN.setEdu(g, 'master', '海外硕士'); g.remember('lifePath', 'work'); CN.setJob(g, 'office', '外企职员'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 写字楼'); g.stat('财富', 5); }, res: (g) => '你落地' + g.recall('workCity') + '，第一顿吃的是火锅。' },
        { t: '留在国外工作几年', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '海外硕士'); g.remember('lifePath', 'work'); g.remember('abroadStay', true); CN.setJob(g, 'office', '在海外工作'); g.move('office', '国外 · 一家公司'); g.info('住处', '国外'); g.stat('财富', 6); g.stat('人缘', -4); }, res: '你和家里的视频，从每天变成了每周。' },
      ] }),
    dec({ id: 'y_grad23', age: 23, t: '研一', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '导师给你的第一个任务，是帮他报销发票。',
      choices: [
        { t: '跟着导师做项目', canon: true, fx: (g) => { g.remember('gradWay', 'lab'); g.stat('学识', 6); g.stat('心情', -2); }, res: '你在实验室过了两个春节。' },
        { t: '多出去实习', dev: 10, fx: (g) => { g.remember('gradWay', 'intern'); g.stat('事业', 6); }, res: '你在一家公司实习了一年。走的时候主管说，毕业了来找我。' },
      ] }),
    dec({ id: 'y_rent', age: 23, t: '租房', loc: 'home', cond: (g) => g.recall('lifePath') === 'work' && white(g) && tierNow(g) <= 3 && !g.recall('house'),
      text: (g) => '在' + (g.recall('workCity') || '城里') + '，房租占了工资的三分之一。',
      choices: [
        { t: '合租，省钱', canon: true, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'share'); g.stat('财富', 3); g.stat('心情', -2); }, res: '你和三个陌生人共用一个卫生间，早上要排队。' },
        { t: '咬牙整租一个一居室', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'whole'); g.stat('财富', -3); g.stat('心情', 4); }, res: '你买了一盆绿萝放在窗台上。下班回来，屋里亮着你自己开的灯。' },
        { t: '住到郊区，通勤两小时', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentType', 'far'); g.stat('财富', 4); g.stat('健康', -3); }, res: '你在地铁上看完了很多本书。' },
      ] }),
    dec({ id: 'y_love23', age: 23, t: '相亲', loc: 'home', cond: (g) => g.recall('lifePath') === 'work' && loveIs(g, 'single') && (rural(g) || g.recall('hukou') === 'county'),
      text: '过年回家，你妈已经安排好了三场相亲，一天一场。',
      choices: [
        { t: '去见，看着合适就处', canon: true, check: ['人缘', 40],
          fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('心情', 4); }, res: '第二场的那个人话不多，走的时候把你送到了巷子口。',
          fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -3); }, res: '三场都没成。你妈叹了一口气。' } },
        { t: '一个都不去', dev: 15, fx: (g) => { g.remember('singleWay', 'refuse'); g.stat('心情', 2); g.stat('人缘', -4); }, res: '你妈三天没跟你说话。' },
      ] }),

    /* ================= 24 岁：AI 来了 ================= */
    dec({ id: 'y_ai24', age: 24, t: '被替代', loc: 'office', cond: (g) => g.recall('lifePath') === 'work' && AI_JOBS.includes(g.recall('job')) && !g.recall('abroadStay'),
      text: (g) => ({ tech: '公司上了一套新的写代码的 AI，组里裁了三分之一。', office: '你做的报表，现在 AI 几秒钟就能出。', sales: '客户开始跟 AI 客服聊天了。', worker: '车间又进了一批机器人，一条线只要两个人看着。', rider: '小区里开始有无人车送外卖。', driver: '无人驾驶的货车上了高速。' }[g.recall('job')]) + '你的位置有点悬。',
      choices: [
        { t: '学新东西，跟着变', canon: true, check: ['学识', 70],
          fx: (g) => { g.remember('aiMove', 'learn'); g.stat('学识', 5); g.stat('事业', 5); if (['worker', 'rider', 'driver'].includes(g.recall('job'))) CN.setJob(g, 'worker', '机器人运维'); },
          res: '你熬了几个月的夜，学会了怎么跟机器打交道。你留下来了。',
          fail: { fx: (g) => { g.remember('aiMove', 'laid'); g.stat('财富', -6); g.stat('心情', -6); CN.setJob(g, 'freelance', '打零工'); }, res: '你还是被裁了。拿到补偿那天，你在公司楼下坐了一下午。' } },
        { t: '转行，去做 AI 训练师', dev: 15, fx: (g) => { g.remember('aiMove', 'switch'); CN.setJob(g, 'tech', 'AI 训练师'); g.stat('事业', 3); g.stat('财富', 2); }, res: '你的新工作是教机器说人话。听起来有点好笑，工资还行。' },
        { t: '换个机器干不了的活', dev: 15,
          fx: (g) => { g.remember('aiMove', 'care'); CN.setJob(g, g.rnd() < 0.5 ? 'nurse' : 'freelance', g.rnd() < 0.5 ? '护工' : '家政'); g.stat('人缘', 5); g.stat('财富', -2); },
          res: '你去照顾老人。他们记不住你的名字，记得你的声音。' },
      ] }),
    dec({ id: 'y_steady24', age: 24, t: '安稳', loc: 'office', cond: (g) => g.recall('lifePath') === 'work' && !g.recall('abroadStay'),
      text: (g) => ({ civil: '单位里一眼能看到退休。', teacher: '你带的第一届学生毕业了。', doctor: '规培三年，你已经记不清上一次睡满八个小时是什么时候。', nurse: '夜班一个接一个。', shop: '店开了两年，生意不好不坏。', creator: '粉丝涨到了一个平台期。', soldier: '部队的日子很规律。', farmer: '村里年轻人越来越少。', freelance: '活有一阵没一阵。', boss: '你手下有了五个人。' }[g.recall('job')] || '日子一天天过。') + '你问自己，就这样了吗。',
      choices: [
        { t: '就这样，挺好', canon: true, fx: (g) => { g.remember('steady', 'stay'); g.stat('心情', 4); g.stat('事业', 2); }, res: '你把办公桌收拾得很整齐。' },
        { t: '往上走，争个位置', dev: 10, check: ['人缘', 50], fx: (g) => { g.remember('steady', 'up'); g.stat('事业', 8); g.stat('健康', -2); }, res: '你主动接了最难的活。年底，领导记住了你。', fail: { fx: (g) => { g.remember('steady', 'stuck'); g.stat('心情', -4); }, res: '位置给了别人。你在工位上坐了很久。' } },
        { t: '辞职，换个城市重来', dev: 20, fx: (g) => { g.remember('steady', 'move'); CN.goCity(g, g.recall('tier') <= 2 ? 3 : 2); CN.setJob(g, 'office', '公司职员'); g.stat('心情', 3); g.stat('财富', -4); }, res: (g) => '你去了' + g.recall('workCity') + '。没人认识你，这让你觉得轻松。' },
      ] }),

    /* ================= 25 岁 ================= */
    dec({ id: 'y_grad_out', age: 25, t: '硕士毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'grad',
      text: '答辩完，导师问你要不要接着读博。',
      choices: [
        { t: '去工作', canon: true,
          fx: (g) => { CN.setEdu(g, 'master', '硕士'); g.remember('lifePath', 'work'); const m = g.recall('major'); CN.setJob(g, m === '计算机' ? 'tech' : m === '医学' ? 'doctor' : 'office', m === '计算机' ? '算法工程师' : m === '医学' ? '医生' : '研究员'); CN.goCity(g, g.recall('gradWay') === 'intern' ? 1 : 2); g.move('office', g.recall('workCity') + ' · 写字楼'); g.stat('财富', 8); },
          res: (g) => (g.recall('gradWay') === 'intern' ? '实习时的主管兑现了承诺。' : '你投了二十份简历，拿到三个面试。') + '你在' + g.recall('workCity') + '上班了。' },
        { t: '读博', dev: 20, fx: (g) => { CN.setEdu(g, 'master', '硕士'); g.remember('lifePath', 'phd'); g.info('学历', '博士在读'); g.stat('学识', 6); g.stat('财富', -3); }, res: '你又在学校留了下来。同学们开始结婚了。' },
      ] }),
    dec({ id: 'y_dating25', age: 25, t: '见家长', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => ({ campus: '你们从大学走到现在，', work: '你们在城里互相照应了几年，', blind: '相亲认识一年多，', online: '从网上聊到线下，' }[g.recall('loveFrom')] || '在一起有一阵了，') + '对方说，该见见家长了。',
      choices: [
        { t: '带回家见爸妈', canon: true, fx: (g) => { g.remember('metParents', true); g.stat('人缘', 4); }, res: '你妈做了一桌子菜。对方吃了三碗饭，你妈很高兴。' },
        { t: '再等等，还没想好', dev: 10, fx: (g) => { g.remember('metParents', false); g.stat('心情', -2); if (g.rnd() < 0.4) { g.remember('love', 'single'); g.info('婚姻', '单身'); } }, res: (g) => (loveIs(g, 'single') ? '对方没再等。你们分开了。' : '对方没说什么，只是不太爱笑了。') },
      ] }),
    dec({ id: 'y_love25', age: 25, t: '一个人', loc: 'home', cond: (g) => loveIs(g, 'single') && g.recall('lifePath') !== 'phd',
      text: '朋友圈里，有人结婚，有人晒娃。你下班回家，点了一份外卖。',
      choices: [
        { t: '让朋友介绍一个', canon: true, check: ['人缘', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('心情', 5); }, res: '朋友介绍的人很实在，第一次见面就聊到了房价。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '见了几个，都没下文。' } },
        { t: '在交友软件上碰碰运气', dev: 10, check: ['心情', 45], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'online'); g.info('婚姻', '恋爱中'); g.stat('心情', 4); }, res: '你们聊了一个月才见面。见了以后，比照片好看。', fail: { fx: (g) => { g.remember('singleWay', 'app'); g.stat('心情', -4); }, res: '聊着聊着，对方开始推荐理财产品。你删了软件。' } },
        { t: '一个人也挺好', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 3); g.stat('事业', 2); }, res: '你报了一个周末的陶艺课。' },
      ] }),

    /* ================= 26 岁：结婚 ================= */
    dec({ id: 'y_marry', age: 26, t: '结婚', loc: 'home', cond: (g) => loveIs(g, 'dating'),
      text: (g) => (rural(g) || g.recall('hukou') === 'county'
        ? '两家人坐下来谈彩礼。对方家里开口要的数，是你家两年的收入。'
        : '对方问你，要不要把日子定下来。') + '你看着' + (JY.byId.sp ? g.name('sp') : '对方') + '，没马上说话。',
      choices: [
        { t: '结婚', canon: true,
          fx: (g) => { const sp = CN.marry(g, { origin: { campus: '大学同学', work: '老乡', blind: '相亲认识', online: '网上认识' }[g.recall('loveFrom')] || '' }); g.remember('caili', rural(g) ? 'paid' : 'none'); if (rural(g)) { g.stat('财富', -8); g.remember('debt', (g.recall('debt') || 0) + 10); } g.stat('心情', 8); g.stat('人缘', 4); },
          res: (g) => '你和' + g.recall('spouse') + '结婚了。' + (g.recall('caili') === 'paid' ? '彩礼是借了一部分凑的，婚礼办了四十桌。' : '没办大酒席，两家人吃了一顿饭。') },
        { t: '彩礼谈不拢，先缓缓', dev: 15, cond: (g) => rural(g) || g.recall('hukou') === 'county', fx: (g) => { g.remember('caili', 'stuck'); g.stat('心情', -5); }, res: '两家人不欢而散。对方在电话里哭了。' },
        { t: '旅行结婚，不办酒', dev: 15, fx: (g) => { CN.marry(g, { origin: '恋人' }); g.remember('caili', 'travel'); g.stat('财富', 2); g.stat('人缘', -3); g.stat('心情', 6); }, res: '你们去了海边。亲戚们说你们不懂事。' },
        { t: '分手', dev: 20, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); g.stat('心情', -10); }, res: '你删掉了相册里的照片，删到一半停下了。' },
      ] }),
    dec({ id: 'y_career26', age: 26, t: '跳槽', loc: 'office', cond: (g) => g.recall('lifePath') === 'work' && !g.recall('abroadStay'),
      text: (g) => '猎头打来电话。' + (g.recall('aiMove') === 'laid' ? '这几年你换了好几份零工，这是第一个像样的机会。' : '对方开的价，比你现在多三成。'),
      choices: [
        { t: '跳', dev: 10, check: ['事业', 30], fx: (g) => { g.remember('jumped', true); g.stat('财富', 8); g.stat('事业', 5); if (!white(g)) CN.setJob(g, 'office', '公司职员'); }, res: '新公司的工位在二十八楼，能看见江。', fail: { fx: (g) => { g.remember('jumped', false); g.stat('心情', -3); }, res: '面了三轮，没了下文。' } },
        { t: '不动，稳着', canon: true, fx: (g) => { g.remember('jumped', false); g.stat('事业', 3); g.stat('心情', 1); }, res: '你谢绝了。下个月，组长的位置给了你。' },
      ] }),

    /* ================= 27 岁：房子 ================= */
    dec({ id: 'y_house', age: 27, t: '买房', loc: 'home', cond: (g) => loveIs(g, 'married') && !['mortgage', 'own', 'hometown'].includes(g.recall('house')),
      text: (g) => (g.recall('rentType') === 'share' ? '合租的日子过够了。' : '') + '丈母娘那边说，没房子心里不踏实。' + (tierNow(g) <= 2 ? '城里的房价，你们俩不吃不喝要攒二十年。' : '县城的新楼盘一平八千。'),
      choices: [
        { t: '两家凑首付，背三十年贷款', canon: true, fx: (g) => { g.remember('house', 'mortgage'); g.remember('debt', (g.recall('debt') || 0) + (tierNow(g) <= 2 ? 150 : 50)); g.info('住处', g.recall('workCity') || home(g)); g.stat('财富', -12); g.stat('心情', 3); g.move('home', (g.recall('workCity') || home(g)) + ' · 新家'); }, res: '交钥匙那天，你们在空房子里坐着，什么家具都没有，觉得挺好。' },
        { t: '回老家县城买，便宜', dev: 15, fx: (g) => { g.remember('house', 'hometown'); g.remember('debt', (g.recall('debt') || 0) + 30); g.remember('backHome', 'house'); g.stat('财富', -6); }, res: '房子在老家，你们一年回去住几天。爸妈帮着看房子。' },
        { t: '不买，一直租', dev: 20, fx: (g) => { g.remember('house', 'rent'); g.remember('rentForever', true); g.stat('财富', 4); g.stat('人缘', -4); }, res: '丈母娘很久没给你好脸色。你们把钱拿去换了一辆车。' },
      ] }),
    dec({ id: 'y_marry27', age: 27, t: '再想想', loc: 'home', cond: (g) => loveIs(g, 'dating') || g.recall('caili') === 'stuck',
      text: (g) => (g.recall('caili') === 'stuck' ? '彩礼的事拖了一年。对方家里松了口。' : '在一起好几年了。身边的人都在问什么时候办事。'),
      choices: [
        { t: '结婚', canon: true, fx: (g) => { CN.marry(g, { origin: '处了好几年' }); g.remember('caili', 'late'); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '结婚了。喜糖是你自己挑的。' },
        { t: '分开', dev: 15, fx: (g) => { g.remember('love', 'single'); g.remember('singleWay', 'broke'); g.info('婚姻', '单身'); g.stat('心情', -8); }, res: '你们分开得很平静，像两个累了的人。' },
      ] }),
    dec({ id: 'y_back27', age: 27, t: '回不回去', loc: 'metro', cond: (g) => tierNow(g) <= 2 && g.recall('hukou') !== 'city' && !g.recall('abroadStay'),
      text: (g) => '你在' + (g.recall('workCity') || '大城市') + '待了好几年。爸妈打电话越来越短，爸的腰不好了。',
      choices: [
        { t: '留下，再拼几年', canon: true, fx: (g) => { g.remember('backHome', 'no'); g.stat('事业', 4); g.stat('人缘', -2); }, res: '你给家里寄了一个按摩椅。' },
        { t: '回老家', dev: 15, fx: (g) => { g.remember('backHome', 'late'); CN.goCity(g, 3, g.recall('city')); if (!['civil', 'teacher', 'shop'].includes(g.recall('job'))) CN.setJob(g, 'office', '本地公司职员'); g.stat('财富', -4); g.stat('心情', 5); g.stat('人缘', 4); }, res: (g) => '你回了' + g.recall('city') + '。工资少了一半，晚饭是在家吃的。' },
      ] }),
    dec({ id: 'y_startup', age: 27, t: '创业', loc: 'office', cond: (g) => g.recall('lifePath') === 'work' && (g.recall('side') === 'project' || g.recall('family') === 'rich' || g.s('事业') >= 45),
      text: '一个老同学找到你，说有个想法，就差一个合伙人。',
      choices: [
        { t: '辞职一起干', dev: 25, check: ['事业', 50], fx: (g) => { g.remember('startup', 'ok'); CN.setJob(g, 'boss', '创业公司合伙人'); g.stat('财富', 10); g.stat('健康', -4); }, res: '第三年，公司拿到了融资。你请所有人吃了一顿烧烤。', fail: { fx: (g) => { g.remember('startup', 'fail'); g.remember('debt', (g.recall('debt') || 0) + 20); g.stat('财富', -10); g.stat('心情', -8); }, res: '撑了两年，公司没了。你欠了二十万。' } },
        { t: '算了，打工稳当', canon: true, fx: (g) => { g.remember('startup', 'no'); g.stat('心情', 1); }, res: '后来你在新闻里看到了那家公司的名字。' },
      ] }),

    /* ================= 28 岁：孩子 ================= */
    dec({ id: 'y_kid', age: 28, t: '要孩子', loc: 'home', cond: (g) => loveIs(g, 'married') && kidN(g) === 0,
      text: (g) => '结婚两年了。' + (g.alive('mo') ? '你妈每次打电话都要绕到这件事上。' : '') + (g.recall('house') === 'rent' ? '你们还租着房。' : ''),
      choices: [
        { t: '要一个', canon: true, fx: (g) => { g.remember('kidPlan', 'now'); CN.haveKid(g); g.stat('财富', -6); g.stat('心情', 4); g.stat('健康', isMale(g) ? 0 : -4); }, res: (g) => '孩子出生了，叫' + g.name('k1') + '。你抱着' + CN.he(g, 'k1') + '，手都不知道往哪放。' },
        { t: '再等两年', dev: 10, fx: (g) => { g.remember('kidPlan', 'wait'); g.stat('事业', 3); }, res: '你们说好了，等工作稳一点再说。' },
        { t: '不要孩子', dev: 25, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 3); g.stat('人缘', -5); }, res: '两边的老人都不说话了。你们养了一只猫。' },
      ] }),
    dec({ id: 'y_single28', age: 28, t: '被催', loc: 'home', cond: (g) => loveIs(g, 'single'),
      text: (g) => '过年回家，饭桌上七大姑八大姨轮着问。' + (g.recall('singleWay') === 'self' ? '你早就想好了怎么回答。' : '你低头吃菜。'),
      choices: [
        { t: '答应家里，再去相亲', canon: true, check: ['人缘', 40], fx: (g) => { g.remember('love', 'dating'); g.remember('loveFrom', 'blind'); g.info('婚姻', '恋爱中'); g.stat('人缘', 3); }, res: '这次的人还不错。你们约了第二次。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -4); }, res: '又没成。' } },
        { t: '不急，过好自己的日子', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.info('婚姻', '单身'); g.stat('心情', 3); g.stat('人缘', -3); }, res: '你初二就回了城。一个人过了个清静年。' },
      ] }),
    dec({ id: 'y_burnout28', age: 28, t: '加班', loc: 'office', cond: (g) => ['tech', 'office', 'doctor', 'boss'].includes(g.recall('job')),
      text: '连续三个月，你没在十二点前睡过。体检报告上有好几个箭头。',
      choices: [
        { t: '扛着，过了这阵再说', canon: true, fx: (g) => { g.remember('burnout', 'push'); g.stat('健康', -8); g.stat('事业', 6); g.stat('财富', 4); }, res: '项目上线了。你在出租车上睡着了。' },
        { t: '降点要求，开始健身', dev: 15, fx: (g) => { g.remember('burnout', 'rest'); g.stat('健康', 6); g.stat('事业', -2); g.stat('心情', 3); }, res: '你办了一张健身卡，这次真的去了。' },
      ] }),

    /* ================= 29 岁 ================= */
    dec({ id: 'y_phd_out', age: 29, t: '博士毕业', loc: 'campus', cond: (g) => g.recall('lifePath') === 'phd',
      text: '论文终于过了。你二十九岁，第一次领到一份正式工资之前，先看到了一张教职的招聘启事。',
      choices: [
        { t: '去高校当老师', canon: true, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'teacher', '大学讲师'); CN.goCity(g, 2); g.move('campus', g.recall('workCity') + ' · 一所大学'); g.stat('事业', 8); }, res: '你分到一间和别人共用的办公室。' },
        { t: '去企业做研发', dev: 10, fx: (g) => { CN.setEdu(g, 'phd', '博士'); g.remember('lifePath', 'work'); CN.setJob(g, 'tech', '研发工程师'); CN.goCity(g, 1); g.move('office', g.recall('workCity') + ' · 研发中心'); g.stat('财富', 12); }, res: '第一个月的工资，比你读博五年的补助加起来还多。' },
      ] }),

    dec({ id: 'y_house29', age: 29, t: '要不要上车', loc: 'home', cond: (g) => !['mortgage', 'own', 'hometown'].includes(g.recall('house')) && (loveIs(g, 'married') || g.s('财富') >= 50),
      text: (g) => (loveIs(g, 'married') ? '房东要卖房，让你们三个月内搬走。' : '一个人在城里，你攒下了一笔钱。中介说现在的价格是十年来最低的。'),
      choices: [
        { t: '买一套小的', canon: true, fx: (g) => { g.remember('house', 'mortgage'); g.remember('debt', (g.recall('debt') || 0) + (tierNow(g) <= 2 ? 100 : 40)); g.info('住处', g.recall('workCity') || home(g)); g.stat('财富', -8); g.stat('心情', 3); }, res: '五十平，朝北。你在阳台上种了葱。' },
        { t: '接着租', dev: 10, fx: (g) => { g.remember('house', 'rent'); g.remember('rentForever', true); g.stat('财富', 2); }, res: '你们又搬了一次家。这次的房东人很好。' },
      ] }),
    dec({ id: 'y_parents29', age: 29, t: '爸妈', loc: 'home', cond: (g) => g.alive('fa') || g.alive('mo'),
      text: (g) => (g.alive('fa') ? '爸体检查出了高血压。' : '妈一个人在老家。') + '你看着视频里的' + (g.alive('fa') ? '他' : '她') + '，头发白了一大半。',
      choices: [
        { t: '多寄点钱，常打电话', canon: true, fx: (g) => { g.remember('parentsNear', 'far'); g.stat('财富', -3); g.stat('人缘', 2); }, res: '你设了一个每周日晚上的闹钟，提醒自己打电话。' },
        { t: '把爸妈接到身边住', dev: 15, cond: (g) => !!g.recall('workCity') && g.recall('house') !== 'none', fx: (g) => { g.remember('parentsNear', 'with'); g.stat('人缘', 5); g.stat('心情', -2); g.stat('财富', -2); }, res: '家里多了两个人，饭桌上多了两盘菜，也多了一些争吵。' },
        { t: '辞了工作回去', dev: 25, fx: (g) => { g.remember('parentsNear', 'back'); g.remember('backHome', 'parents'); CN.goHome(g); g.remember('tier', 4); CN.setJob(g, rural(g) ? 'farmer' : 'shop', rural(g) ? '回乡务农' : '在县城做点小生意'); g.stat('财富', -8); g.stat('人缘', 6); g.stat('心情', 2); }, res: '你回来那天，你妈在村口等了一下午。' },
      ] }),
    /* ================= 30 岁是人生关口，这里只写自动节点 ================= */
    { id: 'y_turn30', age: 30, t: '三十岁', auto: true,
      text: (g) => (loveIs(g, 'married') ? (kidN(g) ? g.name('k1') + '给你画了一张生日卡，你被画成了一个圆。' : '你和' + g.recall('spouse') + '吃了一顿火锅，算是过生日。') : '三十岁生日，你一个人吃了一碗长寿面。') },

    /* ================= 31 岁 ================= */
    dec({ id: 'y_kid31', age: 31, t: '孩子的事', loc: 'home', cond: (g) => loveIs(g, 'married') && kidN(g) === 0 && g.recall('kidPlan') !== 'dink',
      text: (g) => (g.recall('kidPlan') === 'wait' ? '说好等两年，三年过去了。' : '结婚几年了，一直没有孩子。') + (isMale(g) ? '' : '医生说，年纪越大越不容易。'),
      choices: [
        { t: '要', canon: true, check: ['健康', 40], fx: (g) => { g.remember('kidPlan', 'now'); CN.haveKid(g); g.stat('财富', -6); g.stat('心情', 4); }, res: (g) => '孩子出生了，叫' + g.name('k1') + '。', fail: { fx: (g) => { g.remember('kidPlan', 'trying'); g.stat('心情', -6); g.stat('财富', -5); }, res: '一直没怀上。你们去了几次医院。' } },
        { t: '算了，两个人过', dev: 20, fx: (g) => { g.remember('kidPlan', 'dink'); g.stat('心情', 2); g.stat('人缘', -3); }, res: '你们把买婴儿床的钱，拿去报了一个旅行团。' },
      ] }),
    dec({ id: 'y_crisis31', age: 31, t: '吵架', loc: 'home', cond: (g) => loveIs(g, 'married') && g.since('love') >= 3,
      text: (g) => '你和' + g.recall('spouse') + '为了' + (kidN(g) ? '谁去开家长会' : g.recall('house') === 'mortgage' ? '房贷' : '一点小事') + '吵了一架，吵完各睡各的。',
      choices: [
        { t: '先低头，好好说', canon: true, fx: (g) => { g.remember('crisis', 'talk'); g.stat('人缘', 4); g.stat('心情', 2); }, res: '第二天早上，你多煮了一个鸡蛋。' },
        { t: '冷着，谁也不理谁', dev: 10, fx: (g) => { g.remember('crisis', 'cold'); g.stat('心情', -5); }, res: '冷了一个星期。后来也就过去了，只是有些话再没说过。' },
        { t: '这日子过不下去，离', dev: 25, fx: (g) => { g.remember('crisis', 'split'); g.remember('love', 'divorced'); g.info('婚姻', '离异'); g.unrel(CN.sexOf(g) === '男' ? '妻子' : '丈夫'); g.stat('心情', -8); g.stat('财富', -6); }, res: '民政局门口排着队。你们签完字，各走各的。' },
      ] }),
    dec({ id: 'y_job31', age: 31, t: '升职', loc: 'office', cond: (g) => g.recall('lifePath') === 'work',
      text: (g) => ({ civil: '科里空出一个副科的位置。', teacher: '学校要选一个年级组长。', worker: '车间主任要退休了。', rider: '站长问你要不要当个小组长。', shop: '隔壁的门面也要转让。', creator: '有家公司想签你。' }[g.recall('job')] || '部门里空出一个小主管的位置。'),
      choices: [
        { t: '争一争', canon: true, check: ['事业', 40], fx: (g) => { g.remember('promoted', true); g.stat('事业', 8); g.stat('财富', 5); g.stat('健康', -2); g.info('职业', (JY.engine.get().L.info['职业'] || '') + '（带团队）'); }, res: '你上去了。第一件事，是学着不在群里说太多话。', fail: { fx: (g) => { g.remember('promoted', false); g.stat('心情', -4); }, res: '没轮上你。你照常上班，只是话少了。' } },
        { t: '让给别人，图个轻松', dev: 10, fx: (g) => { g.remember('promoted', false); g.stat('心情', 3); g.stat('健康', 2); }, res: '你准点下班，去接孩子，或者去公园走两圈。' },
      ] }),

    /* ================= 32 岁 ================= */
    dec({ id: 'y_kid2', age: 32, t: '二胎', loc: 'home', cond: (g) => loveIs(g, 'married') && kidN(g) === 1,
      text: (g) => g.name('k1') + '上幼儿园了，回来问你，别的小朋友都有弟弟妹妹，' + CN.he(g, 'k1') + '为什么没有。',
      choices: [
        { t: '一个就够了', canon: true, fx: (g) => { g.remember('kid2', 'no'); g.stat('财富', 3); }, res: '你们把全部的心思放在一个孩子身上。' },
        { t: '再要一个', dev: 15, fx: (g) => { g.remember('kid2', 'yes'); CN.haveKid(g); g.stat('财富', -8); g.stat('健康', -3); g.stat('心情', 3); }, res: (g) => '老二出生了，叫' + g.name('k2') + '。家里从此没有安静的时候。' },
      ] }),
    dec({ id: 'y_single32', age: 32, t: '一个人的三十二岁', loc: 'home', cond: (g) => !loveIs(g, 'married'),
      text: (g) => (loveIs(g, 'divorced') ? '离婚一年了。' : '') + '你一个人住。周末去菜市场，摊主已经认识你了。',
      choices: [
        { t: '有人介绍，就见见', canon: true, check: ['人缘', 45], fx: (g) => { CN.marry(g, { origin: '朋友介绍' }); g.remember('lateMarry', true); g.stat('心情', 6); }, res: (g) => '你和' + g.recall('spouse') + '处了半年就结了婚。两个人都不年轻了，没那么多讲究。', fail: { fx: (g) => { g.remember('singleWay', 'blind'); g.stat('心情', -2); }, res: '没成。你也没太难过。' } },
        { t: '就这样过，挺自在', dev: 15, fx: (g) => { g.remember('singleWay', 'self'); g.stat('心情', 4); g.stat('财富', 3); }, res: '你给自己买了一套好点的锅。' },
      ] }),

    /* ================= 33 岁 ================= */
    dec({ id: 'y_debt33', age: 33, t: '房贷', loc: 'home', cond: (g) => (g.recall('debt') || 0) >= 40,
      text: (g) => '每个月一号，工资进卡，房贷出卡，中间只停留几分钟。' + (g.recall('startup') === 'fail' ? '创业欠的钱还没还完。' : ''),
      choices: [
        { t: '咬牙还，什么都省', canon: true, fx: (g) => { g.remember('debt', Math.max(0, (g.recall('debt') || 0) - 10)); g.stat('财富', -2); g.stat('心情', -4); }, res: '你不再点外卖，开始自己带饭。' },
        { t: '晚上跑网约车多挣点', dev: 10, fx: (g) => { g.remember('nightJob', true); g.remember('debt', Math.max(0, (g.recall('debt') || 0) - 15)); g.stat('财富', 4); g.stat('健康', -5); }, res: '你认识了城里凌晨两点的每一条路。' },
        { t: '卖了房，无债一身轻', dev: 20, cond: (g) => g.recall('house') === 'mortgage', fx: (g) => { g.remember('house', 'rent'); g.remember('debt', 0); g.remember('soldHouse', true); g.stat('财富', -6); g.stat('心情', 6); }, res: '房子亏了一点卖掉了。签完字那天，你睡了一个好觉。' },
      ] }),
    dec({ id: 'y_friend33', age: 33, t: '老朋友', loc: 'home', cond: (g) => true,
      text: (g) => '大学（或者工厂）里最好的朋友要结婚了，在' + (g.recall('workCity') || '外地') + '的另一头。那天你也要加班。',
      choices: [
        { t: '请假去', canon: true, fx: (g) => { g.remember('oldFriend', 'went'); g.stat('人缘', 5); g.stat('事业', -1); }, res: '婚礼上你哭了，比新人哭得还厉害。' },
        { t: '转个红包', dev: 10, fx: (g) => { g.remember('oldFriend', 'red'); g.stat('财富', -2); g.stat('人缘', -2); }, res: '对方回了一个“谢谢”。后来你们很少联系了。' },
      ] }),

    /* ================= 34 岁：三十五岁之前 ================= */
    dec({ id: 'y_last34', age: 34, t: '三十五岁之前', loc: 'office', cond: (g) => g.recall('lifePath') === 'work' && !['civil', 'teacher', 'doctor', 'soldier', 'farmer', 'retired'].includes(g.recall('job')),
      text: (g) => '明年就三十五了。招聘启事上写着“三十五岁以下”。' + (g.recall('aiMove') === 'switch' ? '你转行做的这一行，年轻人越来越多。' : g.recall('promoted') ? '你带着一个小团队，也带着一份不安。' : '你在现在的位置上已经好几年了。'),
      choices: [
        { t: '考个编，求个稳', dev: 10, check: ['学识', 80], fx: (g) => { g.remember('last34', 'civil'); CN.setJob(g, 'civil', '事业单位职员'); g.stat('心情', 4); g.stat('财富', -3); }, res: '你考上了最后一年还能报的岗位。', fail: { fx: (g) => { g.remember('last34', 'stay'); g.stat('心情', -3); }, res: '差了两分。你回到工位上，把准考证收进了抽屉。' } },
        { t: '守住现在的位置', canon: true, fx: (g) => { g.remember('last34', 'stay'); g.stat('事业', 3); g.stat('健康', -2); }, res: '你比以前更早到公司，更晚走。' },
        { t: '自己出来单干', dev: 20, fx: (g) => { g.remember('last34', 'own'); CN.setJob(g, g.recall('skill') ? 'shop' : 'boss', g.recall('skill') ? '开店' : '个体老板'); g.stat('财富', -6); g.stat('心情', 4); }, res: '你注册了一家小公司，法人代表写的是你的名字。' },
      ] }),
    dec({ id: 'y_last34b', age: 34, t: '回头看', loc: 'home', cond: (g) => true,
      text: '你翻到一张十八岁时的照片。那时候你以为三十四岁是很老的年纪。',
      choices: [
        { t: '日子是自己选的，接着过', canon: true, fx: (g) => { g.remember('look34', 'ok'); g.stat('心情', 3); }, res: '你把照片夹回了相册。' },
        { t: '想再学点东西', dev: 10, fx: (g) => { g.remember('look34', 'learn'); g.stat('学识', 5); g.stat('财富', -2); }, res: '你报了一个周末的课。教室里大多是比你小的人。' },
      ] }),

    /* ================= 自动节点：让日子有血有肉 ================= */
    { id: 'y_firstpay', age: 22, t: '第一份工资', auto: true, cond: (g) => !!g.recall('job') && !['farmer', 'soldier'].includes(g.recall('job')) && g.recall('lifePath') === 'work',
      text: (g) => '第一份工资到账，你给' + (g.alive('mo') ? '妈' : '家里') + '转了一笔钱。' + (g.recall('side') === 'money' ? '你早就习惯了自己挣钱。' : '对方回了一句“自己留着花”，又回了一句“谢谢宝贝”。') },
    { id: 'y_army_life', age: 19, t: '新兵连', auto: true, cond: (g) => g.recall('lifePath') === 'army',
      text: '新兵连三个月，你学会了三分钟叠好被子，学会了在雪地里站一个小时不动。' },
    { id: 'y_newyear24', age: 24, t: '过年', auto: true, cond: (g) => g.recall('workCity') && g.recall('workCity') !== g.recall('city'),
      text: (g) => '春运抢票，你守着手机抢了一晚上。回到' + home(g) + '，' + (loveIs(g, 'single') ? '亲戚们问你有没有对象。' : '亲戚们问你什么时候结婚。') },
    { id: 'y_wedding_day', age: 26, t: '婚礼', auto: true, cond: (g) => loveIs(g, 'married') && g.since('love') === 0,
      text: (g) => (g.recall('caili') === 'paid' ? '婚礼上，你爸喝多了，拉着亲家的手一直说“孩子交给你们了”。' : g.recall('caili') === 'travel' ? '你们在海边拍了一张合影，就算是婚纱照。' : '婚礼很简单。你记得那天的风很大。') },
    { id: 'y_abroad_back', age: 28, t: '回国', auto: true, cond: (g) => !!g.recall('abroadStay'),
      fx: (g) => { g.remember('abroadStay', false); CN.goCity(g, 1); CN.setJob(g, 'office', '外企中层'); g.stat('人缘', 3); },
      text: (g) => '在国外待了几年，你还是回来了。落地' + g.recall('workCity') + '，空气里有一股熟悉的味道。' },
    { id: 'y_baby_night', age: 29, t: '夜里', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') <= 2,
      text: (g) => g.name('k1') + '夜里哭醒三次。你抱着' + CN.he(g, 'k1') + '在客厅里走，走到天亮。' },
    { id: 'y_kid_school', age: 33, t: '上幼儿园', auto: true, cond: (g) => kidN(g) >= 1 && g.alive('k1') && g.ageOf('k1') === 3,
      text: (g) => g.name('k1') + '第一天上幼儿园，哭着不撒手。你在门口站了一上午。' },
    { id: 'y_grandparent', age: 25, t: '老人', auto: true, cond: (g) => !g.alive('gm') && !g.alive('gp'),
      text: (g) => (g.recall('leftBehind') ? '你小时候是爷爷奶奶带大的。他们都走了以后，老家的房子空着，院子里长满了草。' : '爷爷奶奶都不在了。过年回去，少了两个人催你吃饭。') },
    { id: 'y_rider_rain', age: 21, t: '暴雨', auto: true, cond: (g) => g.recall('job') === 'rider',
      fx: (g) => { if (g.rnd() < 0.08) { g.stat('健康', -20); g.remember('riderHurt', true); } },
      text: (g) => (g.recall('riderHurt') ? '暴雨天你摔了车，小腿缝了十几针。站长说这单不算超时。' : '暴雨天，单子翻了一倍。你在雨里跑了一天，到家时鞋里能倒出水。') },
    { id: 'y_save_worker', age: 23, t: '脚手架', auto: true, cond: (g) => g.recall('job') === 'worker' && g.recall('stayCity'),
      fx: (g) => { if (g.rnd() < 0.15) g.set('ySavedWorker'); },
      text: (g) => (g.f('ySavedWorker') ? '工地上有人从脚手架上滑下来，你离得最近，一把拽住了他的衣领。他家里后来寄来一面锦旗。' : '这一年你换了三个工地。每个工地的饭都差不多。') },
    { id: 'y_shop_good', age: 28, t: '小店', auto: true, cond: (g) => g.recall('job') === 'shop',
      fx: (g) => { if (g.s('人缘') >= 55 && g.rnd() < 0.5) { g.set('yHometownShop'); g.stat('财富', 8); } },
      text: (g) => (g.f('yHometownShop') ? '你的店成了街上排队最长的一家。镇上的人说起你，就说那家店。' : '小店的生意不温不火。你认识了街上所有的人。') },
    { id: 'y_civil_life', age: 26, t: '单位', auto: true, cond: (g) => g.recall('job') === 'civil',
      text: (g) => (g.recall('army') === 'out' ? '单位里的人知道你当过兵，搬东西总叫你。' : '你写的材料，领导改了三遍，改回了第一版。') },
    { id: 'y_teacher_life', age: 27, t: '讲台', auto: true, cond: (g) => g.recall('job') === 'teacher',
      text: '你班上有个孩子，作文写的是你。你在办公室里看了两遍。' },
    { id: 'y_doctor_life', age: 27, t: '值班', auto: true, cond: (g) => ['doctor', 'nurse'].includes(g.recall('job')),
      text: '夜班来了一个出车祸的年轻人。你们抢救了四个小时，他活了下来。你在楼梯间吃了一个冷掉的包子。' },
    { id: 'y_creator_life', age: 25, t: '直播间', auto: true, cond: (g) => g.recall('job') === 'creator',
      fx: (g) => { if (g.rnd() < 0.3) { g.stat('财富', 10); g.stat('事业', 6); g.remember('viral', true); } },
      text: (g) => (g.recall('viral') ? '你有一条视频火了，一夜之间涨了十万粉丝。你妈在村里走路都带风。' : '你每天播四个小时。镜头关掉以后，屋里特别安静。') },
    { id: 'y_jumped_after', age: 28, t: '新公司', auto: true, cond: (g) => g.recall('jumped') === true,
      text: '新公司的人比你想的还要拼。你开始想念以前那个组了。' },
    { id: 'y_rent_whole', age: 25, t: '一个人的屋子', auto: true, cond: (g) => g.recall('rentType') === 'whole',
      text: '你在一居室里养了一只猫。下雨的晚上，猫趴在你腿上，你觉得这座城市是你的。' },
    { id: 'y_rent_far', age: 25, t: '通勤', auto: true, cond: (g) => g.recall('rentType') === 'far',
      text: '每天来回四个小时。你在地铁上学会了站着睡觉。' },
    { id: 'y_dink_life', age: 33, t: '两个人', auto: true, cond: (g) => g.recall('kidPlan') === 'dink' && loveIs(g, 'married'),
      text: (g) => '你和' + g.recall('spouse') + '去了很多地方。照片里永远是两个人。' },
    { id: 'y_trying', age: 33, t: '医院', auto: true, cond: (g) => g.recall('kidPlan') === 'trying',
      fx: (g) => { if (g.rnd() < 0.5) { CN.haveKid(g); g.remember('kidPlan', 'now'); } },
      text: (g) => (kidN(g) ? '跑了两年医院，孩子终于来了，叫' + g.name('k1') + '。' : '又一年过去了。你们决定不再去医院。') },
    { id: 'y_divorce_after', age: 33, t: '离婚以后', auto: true, cond: (g) => g.recall('crisis') === 'split',
      text: (g) => (kidN(g) ? '孩子跟着对方。每个周末，你去接' + CN.he(g, 'k1') + '出来吃一顿饭。' : '离婚以后，你搬回了一个人的屋子。东西少了一半，地方大了一半。') },
    { id: 'y_cold_after', age: 33, t: '饭桌', auto: true, cond: (g) => g.recall('crisis') === 'cold',
      text: (g) => '你和' + g.recall('spouse') + '在饭桌上说的话，大多是关于孩子和账单的。' },
    { id: 'y_parents_with', age: 32, t: '一家人', auto: true, cond: (g) => g.recall('parentsNear') === 'with',
      text: (g) => '你妈每天早上五点起来给全家做早饭。' + (kidN(g) ? g.name('k1') + '是奶奶带大的。' : '你说不用这么早，她不听。') },
    { id: 'y_back_life', age: 31, t: '老家的日子', auto: true, cond: (g) => ['late', 'parents', 'early'].includes(g.recall('backHome')),
      text: (g) => '回到' + (g.recall('backHome') === 'late' ? g.recall('city') : home(g)) + '以后，你胖了十斤。晚饭后跟着爸妈去广场上走两圈。' },
    { id: 'y_night_driver', age: 34, t: '凌晨', auto: true, cond: (g) => !!g.recall('nightJob'),
      text: '凌晨跑车，你拉过加班的程序员、哭着的姑娘、喝多的老板。每个人下车时都说一声谢谢。' },
    { id: 'y_soldhouse', age: 34, t: '没有房子', auto: true, cond: (g) => !!g.recall('soldHouse'),
      text: '卖了房以后，你们又租房住。周末不用想着还贷，日子松了一口气。' },
    { id: 'y_friend_after', age: 34, t: '朋友', auto: true, cond: (g) => !!g.recall('oldFriend'),
      text: (g) => (g.recall('oldFriend') === 'went' ? '那个朋友的孩子出生了，认你做了干' + (isMale(g) ? '爹' : '妈') + '。' : '你在朋友圈看到老朋友的孩子满月。你点了个赞。') },
    { id: 'y_look34', age: 34, t: '周末', auto: true, cond: (g) => g.recall('look34') === 'learn' && !g.recall('last34'),
      text: '周末的课上完了。你发现自己还能学进去东西，这让你高兴了好几天。' },
    { id: 'y_single_after', age: 34, t: '一个人', auto: true, cond: (g) => loveIs(g, 'single') && ['self', 'refuse'].includes(g.recall('singleWay')),
      text: '你一个人过得井井有条。偶尔夜里醒来，会想一想以后老了谁陪你。' },
    { id: 'y_broke_after', age: 28, t: '分手以后', auto: true, cond: (g) => g.recall('singleWay') === 'broke' && loveIs(g, 'single'),
      text: '分手以后，你很长一段时间没再谈。工作倒是做得更好了。' },
    { id: 'y_startup_after', age: 31, t: '公司', auto: true, cond: (g) => ['ok', 'fail'].includes(g.recall('startup')),
      text: (g) => (g.recall('startup') === 'ok' ? '公司有了五十个人。你开始学着记住每个人的名字。' : '你又回去打工了。面试官看到你的简历，问你创业失败学到了什么。') },
    { id: 'y_promo_after', age: 33, t: '团队', auto: true, cond: (g) => g.recall('promoted') === true,
      text: '你带的人里，有一个跟你刚毕业时很像。你把自己的经验一条条告诉了他。' },
    { id: 'y_metparents_after', age: 26, t: '亲家', auto: true, cond: (g) => g.recall('metParents') === true && !loveIs(g, 'married'),
      text: '两家家长通了一次电话，聊了一个小时。你在旁边听着，有点尴尬，也有点高兴。' },
    { id: 'y_burnout_after', age: 31, t: '体检', auto: true, cond: (g) => !!g.recall('burnout'),
      fx: (g) => { if (g.recall('burnout') === 'push') g.stat('健康', -4); },
      text: (g) => (g.recall('burnout') === 'push' ? '今年的体检，箭头比去年多了两个。' : '坚持健身三年，你比二十五岁时还精神。') },
    { id: 'y_ai_after', age: 27, t: '机器', auto: true, cond: (g) => !!g.recall('aiMove'),
      text: (g) => ({ learn: '公司里会用 AI 的人越来越吃香。你庆幸当年熬了那几个月。', switch: '你训练过的模型上线了。你在新闻里认出了自己写的那些句子。', care: '你照顾的老人里，有一个总把你当成她的孙子。', laid: '这几年你换了很多份零工，学会了不把鸡蛋放在一个篮子里。' }[g.recall('aiMove')]) },
    { id: 'y_steady_after', age: 28, t: '单位里', auto: true, cond: (g) => !!g.recall('steady'),
      text: (g) => ({ stay: '日子过得平平稳稳，你学会了泡茶。', up: '你成了单位里最年轻的骨干。', stuck: '你不再争了。下班后去学了游泳。', move: '新城市的生活慢慢有了样子。你有了常去的面馆。' }[g.recall('steady')]) },
    { id: 'y_workstyle_after', age: 25, t: '攒下的', auto: true, cond: (g) => !!g.recall('workStyle') && !white(g),
      fx: (g) => { if (g.recall('workStyle') === 'save') g.stat('财富', 5); },
      text: (g) => ({ save: '这几年攒下的钱，够在老家县城付个首付了。', fun: '这几年钱没攒下多少，朋友倒是交了一堆。', study: '夜校考的证派上了用场，你调去了技术岗。' }[g.recall('workStyle')]) },
    { id: 'y_skill_after', age: 26, t: '手艺', auto: true, cond: (g) => !!g.recall('skill'),
      text: (g) => ({ cook: '你炒的回锅肉，老板说可以上招牌了。', auto: '什么车送来，你听声音就知道哪里不对。', hair: '有几个老顾客只找你剪。', elec: '你一个人能把一栋楼的线路查完。' }[g.recall('skill')]) },
    { id: 'y_army_stay', age: 26, t: '部队', auto: true, cond: (g) => g.recall('army') === 'stay',
      fx: (g) => { if (!g.recall('armyOut')) { g.remember('armyOut', true); g.remember('lifePath', 'work'); CN.setJob(g, 'civil', '转业到地方单位'); CN.goCity(g, 3); } },
      text: '在部队待了八年，你转业了。分到地方的一个单位，脱下军装那天，你把它叠得整整齐齐。' },
    { id: 'y_gaokao_memory', age: 32, t: '高考', auto: true, cond: (g) => !!g.recall('gk'),
      text: (g) => '又到高考。新闻里说今年考生是近几十年最少的。你想起自己那年' + ({ top: '考了全县第一', good: '考得不错', normal: '刚过本科线', college: '只够大专', fail: '没考上' }[g.recall('gk')]) + '。' },
    { id: 'y_side_after', age: 23, t: '学校里学的', auto: true, cond: (g) => g.recall('side') === 'money' && g.recall('lifePath') === 'work',
      text: '大学时打工攒下的钱，你拿来交了第一个月的房租和押金。' },
    { id: 'y_campus_after', age: 24, t: '同学', auto: true, cond: (g) => g.recall('campus') === 'club',
      text: '大学社团里认识的人，现在散在各个城市。你出差到哪儿，都有人请你吃饭。' },
    { id: 'y_grad_after', age: 27, t: '研究生的朋友', auto: true, cond: (g) => g.recall('gradWay') === 'lab',
      text: '实验室的师兄去了一家大公司，问你要不要过去。你说再看看。' },
    { id: 'y_rentforever', age: 32, t: '租房的人', auto: true, cond: (g) => !!g.recall('rentForever'),
      text: '房东换了三个，你的绿萝还活着。' },
    { id: 'y_late_marry', age: 33, t: '晚婚', auto: true, cond: (g) => !!g.recall('lateMarry'),
      text: (g) => '结婚以后，你和' + g.recall('spouse') + '有一种默契：谁先到家谁做饭。' },
    { id: 'y_kid2_life', age: 34, t: '两个孩子', auto: true, cond: (g) => g.recall('kid2') === 'yes',
      text: (g) => g.name('k1') + '和' + g.name('k2') + '为一个玩具吵了一下午。你在厨房里，听着听着笑了。' },
    { id: 'y_debt_paid', age: 34, t: '账', auto: true, cond: (g) => g.recall('debt') === 0 && (g.recall('house') === 'mortgage' || !!g.recall('soldHouse')),
      text: '你算了一下，现在一分钱都不欠别人。这是你成年以后第一次。' },
  ].concat([]));

  /* 新增的状态键名（青年，写进这一世的记忆）：
   * gk 高考档次 'top'|'good'|'normal'|'college'|'fail'；lifePath 当下在做什么 'uni'|'college'|'repeat'|'army'|'grad'|'phd'|'abroad'|'work'
   * campus 大一怎么过 'study'|'club'|'love'|'game'；side 大二课余 'intern'|'money'|'project'|'none'；plan 大三打算 'job'|'grad'|'civil'|'abroad'
   * gradFail 考研考公没上岸；gradWay 研究生怎么读 'lab'|'intern'；army 'stay'|'out'；armyOut 已转业
   * workStyle 打工头几年 'save'|'fun'|'study'；skill 手艺 'cook'|'auto'|'hair'|'elec'；stayCity 留在城里
   * loveFrom 怎么认识的 'campus'|'work'|'blind'|'online'；singleWay 单身的原因 'self'|'refuse'|'blind'|'app'|'broke'；metParents
   * caili 彩礼 'paid'|'stuck'|'late'|'travel'|'none'；lateMarry 晚婚；crisis 婚姻危机 'talk'|'cold'|'split'
   * rentType 'share'|'whole'|'far'；rentForever；soldHouse；nightJob；backHome 'early'|'late'|'house'|'parents'|'no'
   * aiMove 'learn'|'switch'|'care'|'laid'；steady 'stay'|'up'|'stuck'|'move'；jumped；promoted；startup 'ok'|'fail'|'no'
   * kidPlan 'now'|'wait'|'dink'|'trying'；kid2 'yes'|'no'；parentsNear 'far'|'with'|'back'；burnout 'push'|'rest'
   * oldFriend 'went'|'red'；last34 'civil'|'stay'|'own'；look34 'ok'|'learn'；abroadStay；viral；riderHurt
   */
})();

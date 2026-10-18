# 十四亿分之一 · 内容规范

玩法照 *1 in 8 Billion*，彻底中国化。每一世按真实人口比例随机投胎：2026 年出生在中国大陆某个省、某座城或某个村、某种家庭，从出生活到离世。没有原著人物，所有人都共用一套“人生节点”，靠条件分出千差万别的人生。剧情文字全部预先写好。

和江湖一梦共用 `share/` 的引擎和界面（`JY.GAME.random = true` 打开随机人生模式）。格式、写作要求大部分相同，先读 `../../CLAUDE.md` 和 `../../jianghuyimeng/docs/SPEC.md` 里“后果”一节。

## 文件

| 文件 | 内容 | 节点 id 前缀 |
|---|---|---|
| `game.js` | 标题、界面用词、属性显示、分享文案、地区颜色 | |
| `data/world.js` | 年代、地点、省份数据、投胎生成器、年度重心、人生关口、工具函数 `JY.CN` | `p15` 等 |
| `data/childhood.js` | 0–17 岁：家庭、留守、幼儿园、小学、初中、中考、高中或职校 | `c_` |
| `data/youth.js` | 18–34 岁：高考、志愿、大学或打工、求职、考研考公、恋爱、结婚、买房、生孩子 | `y_` |
| `data/midlife.js` | 35–64 岁：中年危机、孩子上学、房贷、父母养老和离世、转行、婚姻变故、身体 | `m_` |
| `data/oldage.js` | 65 岁以后：退休、带孙辈、老伴、养老、病、离世 | `o_` |
| `data/events.js` | 任何年龄都可能碰上的意外（奇遇），世界新闻（世界事件），闲笔 | `e_` |
| `data/scenes.js` | 现代场景的像素画（`JY.addScenes`） | |

## 时间线

所有人都在 **2026 年**出生，所以年龄和年份一一对应：`年份 = 2026 + 年龄`。2026 年以后是推演的未来，写得克制、可信，和下面这张表保持一致（世界新闻在 `events.js` 里按这张表写）：

| 年份 | 你的年龄 | 背景 |
|---|---|---|
| 2026 | 0 | 出生。这一年全国出生九百万左右，同龄人少。 |
| 2029 | 3 | 上幼儿园。AI 助手进了很多家庭，会讲故事、辅导作业。 |
| 2032 | 6 | 上小学。生源少，乡村小学合并，有的孩子要去镇上寄宿。 |
| 2035 | 9 | 大城市有了无人驾驶出租车。 |
| 2038 | 12 | 上初中。 |
| 2041 | 15 | 中考，大约一半上普高，一半上职校。 |
| 2044 | 18 | 高考还在。同龄人少，上大学比父母那代容易，好大学照样难考。 |
| 2048 | 22 | 大学毕业。很多基础岗位被 AI 替代，新职业也冒出来（AI 训练师、陪护机器人维修……）。 |
| 2050 年代 | 24–33 | 远程办公普遍；结婚、生育都更晚；房价不再普涨，大城市和小城分化。 |
| 2060 年代 | 34–43 | 老龄化最重的时候，家家都有老人要照顾；银发经济。 |
| 2070 年代 | 44–53 | 机器人做家务、陪老人很常见。 |
| 2091 | 65 | 那时的法定退休年龄大约 65 岁。 |
| 2100 以后 | 74+ | 平均寿命 85 岁左右。 |

- 不写战争、灾难性的大事件、政治运动、政策评论。时代背景只从普通人的日子里露出来。
- 不写真实的公司、品牌、名人。写“一家大厂”“外卖平台”“短视频平台”。
- 可以写的民生：升学、内卷、打工、彩礼、房贷、催婚、生育、育儿、养老、看病、下岗转行、留守、进城、返乡、直播带货、考公……写具体的日子，不下结论。

## 一个人身上有什么

投胎生成器（`world.js` 的 `JY.GENERATE`）生成：玩家自己、父亲 `fa`、母亲 `mo`、爷爷 `gp`、奶奶 `gm`、兄弟姐妹 `sib0` `sib1`、4 个同一年出生的人 `peer0`–`peer3`。剧情里可以 `g.alive('fa')`、`g.name('mo')`、`g.kill('gm', '病逝', true)`。

属性（`g.s` / `g.stat` / `check`）：`健康`、`学识`、`心情`、`人缘`、`财富`、`事业`，都是 0–100。`健康` 降到 0 人就没了，也决定寿命。

### 状态键名（这一世的记忆，`g.recall` / `g.remember`）

各阶段的文件靠这些键名衔接：前一阶段记下，后一阶段读。**只用这些键名表示这些意思**；要新键名就加到这张表里。

| 键 | 值 | 谁设 | 说明 |
|---|---|---|---|
| `prov` `provShort` `region` | `'四川'` `'川'` `'西南'` | 生成器 | 出生省份、地区 |
| `city` `cityTier` | `'南充'` `3` | 生成器 | 出生地所属城市和等级 |
| `hukou` | `'city'` `'county'` `'rural'` | 生成器 | 出身：城区、县城、农村 |
| `family` | `'rich'` `'civil'` `'white'` `'smallbiz'` `'worker'` `'farmer'` `'migrant'` | 生成器 | 家庭类型（富裕、体制内、职员、个体户、工人、农户、父母外出打工） |
| `leftBehind` | `true` / `false` | 生成器，童年可改 | 留守儿童 |
| `sibs` `only` | 数字，布尔 | 生成器 | 兄弟姐妹几个，是否独生 |
| `rtype` | `'n'` `'s'` `'w'` | 生成器 | 老家农村的样子：北方平原、南方山区、西部高原 |
| `homeLoc` `homeCap` | 地点 id，地名 | 生成器 | 老家，`CN.goHome(g)` 用 |
| `tier` | `1`–`5` | 生成器，`CN.goCity` | 现在住的地方：1 一线，2 省会和新一线，3 地级市，4 县城，5 农村 |
| `workCity` | 城市名 | `CN.goCity` | 现在在哪座城市 |
| `school` | `'key'` `'normal'` `'weak'` | 童年 | 读的学校好坏 |
| `edu` | `'primary'` `'junior'` `'vocational'` `'senior'` `'college'` `'bachelor'` `'master'` `'phd'` | 童年、青年 | 最高学历：小学、初中、职高中专、高中、大专、本科、硕士、博士。用 `CN.setEdu(g, 键, '名帖上的写法')` |
| `uni` | `'top'` `'good'` `'normal'` | 青年 | 大学档次 |
| `major` | 文字 | 青年 | 专业，如 `'计算机'` `'师范'` `'医学'` |
| `job` | `'none'` `'farmer'` `'worker'` `'rider'` `'driver'` `'shop'` `'office'` `'tech'` `'civil'` `'teacher'` `'doctor'` `'nurse'` `'sales'` `'boss'` `'creator'` `'soldier'` `'freelance'` `'retired'` | 青年、中年、老年 | 职业类别。用 `CN.setJob(g, 键, '名帖上的写法')` |
| `love` | `'single'` `'dating'` `'married'` `'divorced'` `'widowed'` | 青年起 | 感情状况。结婚用 `CN.marry(g)`，会生成配偶 `sp` |
| `spouse` | 名字 | `CN.marry` | 配偶的名字 |
| `kids` | 数字 | `CN.haveKid` | 孩子个数，孩子 id 是 `k1` `k2` `k3` |
| `house` | `'none'` `'rent'` `'mortgage'` `'own'` `'hometown'` | 青年起 | 住房：没有、租房、背房贷、全款或还清、回老家住 |
| `debt` | 数字（万） | 任何时候 | 欠的钱，0 表示没有 |
| `parentsCare` | `'self'` `'sibling'` `'nursing'` `'far'` | 中年 | 父母谁来照顾 |
| `kidSchool` `kidPush` `kidBond` | `'public'` `'district'` `'good'` `'left'`；`'hard'` `'self'` `'easy'`；`'strict'` `'close'` `'loose'` | 中年（按 k1 的年纪） | 孩子的小学、补习、青春期 |
| `kidScore` `kidUni` `kidPath` | `'top'` `'good'` `'normal'` `'none'`；`'own'` `'stable'` `'work'` | 中年 | 孩子的高考分数、去向、谁拿的主意 |
| `kidCity` | 城市名或 `'国外'` | 中年（孩子 22–25 岁），老年可改 | 孩子定居的城市 |
| `kidWed` | `'paid'` `'self'` `'none'` | 中年 | 孩子成家时你出了多少力 |
| `crisis` `stableRoute` `laborRoute` `ownRoute` `noneRoute` | 见 `midlife.js` 末尾 | 中年（35 岁） | 三十五岁那道坎怎么过的，按职业类别分 |
| `career42` `ai47` `end58` | 见 `midlife.js` 末尾 | 中年 | 42 岁转行、47 岁 AI 第二波、58 岁最后几年 |
| `marriage` `custody` `lateMarry` `nokid` | `'cold'` `'mended'` `'split'`；`'me'` `'ex'`；`'match'` `'alone'` `'love'`；`'ivf'` `'failed'` `'dink'` `'adopt'` | 中年 | 婚姻、离婚后孩子跟谁、晚婚、没孩子怎么办 |
| `house44` `nest` `oldHouse` `plan60` | 见 `midlife.js` 末尾 | 中年 | 房子、积蓄、父母的老房子（`'keep'` `'sold'` `'gave'`）、退休后住哪儿（`'stay'` `'home'` `'kid'`） |
| `body40` `check45` `ill55` `hobby55` | 见 `midlife.js` 末尾 | 中年 | 身体、体检、大病、爱好 |
| `care51` `lostFa` `spSick` `sibLoan` `selfCare` | 见 `midlife.js` 末尾 | 中年 | 照顾父母换没换法子、父亲去世、配偶大病、兄弟姐妹借钱、独生子女的养老打算 |
| `land` | `'rent'` `'big'` `'city'` | 中年 | 农村的地流转、承包还是进城 |
| `retired` | `true` | 老年 | 已退休 |
| `talent` | `'code'` `'art'` `'sport'` `'dream'` `'none'` | 童年（9 岁） | 特长；`'dream'` 是听支教老师讲外面的世界 |
| `track` | `'sci'` `'arts'` | 童年（16 岁，普高） | 选科：物理方向、历史方向 |
| `hs` | `'key'` `'normal'` `'scholar'` `'private'` `'voc'` `'vocChoice'` `'work'` | 童年（15 岁中考） | 中考后的去向：重点高中、普高、拿奖学金的普高、私立高中、职高（分数不够）、职高（自己选的）、不读了去打工 |
| `zkScore` | `'high'` `'mid'` `'low'` | 童年（15 岁） | 中考成绩档次 |
| `hsPath` | `'normal'` `'tutor'` `'art'` `'sport'` `'olympiad'` `'abroad'` | 童年（17 岁，普高） | 高考的路子：普通高考、补课冲刺、艺考、体考、竞赛（省一，有保送机会）、出国 |
| `vocMajor` | `'mech'` `'care'` `'ecom'` `'robot'` | 童年（16 岁，职高） | 职高专业：机电汽修、护理幼教、电商直播、机器人维修 |
| `vocPlan` | `'work'` `'college'` | 童年（17 岁，职高） | 职高毕业后：直接工作、考高职（大专） |
| `workPlan` `craft` | `'stay'` `'study'` `'city'`；`'cook'` `'tile'` `'electric'` `'weld'` | 童年（16–17 岁，初中毕业打工的人） | 打工的打算；学的手艺 |
| `migrated` | 布尔 | 童年（9 岁） | 留守儿童跟父母进了城（11 岁可能又回老家） |
| `parentsSplit` | 布尔 | 童年（10 岁） | 父母离婚了 |
| `crush` | `'hidden'` `'told'` `'pact'` | 童年（13 岁） | 初中喜欢过一个人；`'pact'` 约好考同一所高中 |
| `parentsPlan` | `'civil'` | 童年（16 岁） | 爸妈希望你考公 |
| `firstWord` `kidStyle` `kindness` `homework` `phone` `bully` `push` `river` `askedMom` `boarding` `olympiad` | 见 `childhood.js` | 童年 | 童年细节，童年内部和回响用；后面的阶段想回望童年也可以读 |
| `aim` `knot` `fame` | 见 `world.js` 的人生关口 | 人生关口 | 15、30、50 岁的回答 |
| `lifePath` | `'uni'` `'college'` `'repeat'` `'army'` `'grad'` `'phd'` `'abroad'` `'work'` | 青年 | 18 岁以后正在做什么：读本科、读大专、复读、当兵、读研、读博、留学、工作。35 岁时基本都是 `'work'`（童年的 `track` 是高中选科 `'sci'`/`'arts'`，别混用） |
| `gk` | `'top'` `'good'` `'normal'` `'college'` `'fail'` | 青年 | 高考考到的档次 |
| `loveFrom` | `'campus'` `'work'` `'blind'` `'online'` | 青年 | 和对象怎么认识的 |
| `singleWay` | `'self'` `'refuse'` `'blind'` `'app'` `'broke'` | 青年 | 单身的缘由：自己选的、拒绝相亲、相亲没成、网恋没成、分手 |
| `kidPlan` | `'now'` `'wait'` `'dink'` `'trying'` | 青年 | 生育打算，`'dink'` 是不要孩子 |
| `crisis` | `'talk'` `'cold'` `'split'` | 青年 | 31 岁那次大吵怎么收场 |
| `backHome` | `'early'` `'late'` `'house'` `'parents'` `'no'` | 青年 | 回没回老家、什么时候回的 |
| `aiMove` | `'learn'` `'switch'` `'care'` `'laid'` | 青年 | 24 岁 AI 替代时怎么应对 |
| `startup` | `'ok'` `'fail'` `'no'` | 青年 | 创业结果 |
| `parentsNear` | `'far'` `'with'` `'back'` | 青年 | 29 岁时怎么照顾爸妈（中年的 `parentsCare` 可以参考它） |
| `skill` `workStyle` `promoted` `burnout` `last34` | 见 `youth.js` 末尾说明 | 青年 | 手艺、打工头几年怎么过、升没升职、加班还是休息、35 岁前的选择 |
| `ev*`（如 `evDog` `evLoan` `evHop` `evInvest` `evRentOffer`） | 各意外自己的取值 | `events.js` 的意外 | 意外的选择，由对应的回响意外读。别的阶段不要用 `ev` 开头的键名。`evRentOffer` 为 `true` 时会出现“房东卖房”的抉择，买下会把 `house` 设成 `'mortgage'` |

名帖字段（`g.info`）：`户籍`、`家庭`、`学历`、`职业`、`婚姻`、`住处`、`子女`、`志向`、`心结`、`心愿`、`遗愿`。墓志页和分享卡读 `学历`、`职业`、`婚姻`、`住处`。

### 工具函数 `JY.CN`（在 `world.js`）

```js
const CN = JY.CN;
CN.goCity(g, 2)            // 去本省省会（1 一线随机，3 本省地级市，4 县城），改场景、住处、tier、workCity，返回城市名
CN.goCity(g, 1, '深圳')    // 指定城市
CN.goHome(g)               // 回老家
CN.setEdu(g, 'bachelor', '本科')
CN.setJob(g, 'tech', '程序员')
CN.marry(g, { origin: '大学同学' })   // 生成配偶 sp，写进家人，love = married
CN.haveKid(g)              // 生成孩子 k1/k2/k3，写进家人，kids + 1
CN.person({ sex, born })   // 生成一个人的数据，再 g.spawn(数据) 让他出现在这一世
CN.sexOf(g)                // '男' / '女'
CN.pick([...]) CN.ri(a, b) // 随机
```

## 节点

人生节点用 `JY.addLifeNodes([...])` 注册，格式和江湖一梦的节点一样，只是所有人共用，所以**几乎每个节点都要写 `cond`**：

```js
JY.addLifeNodes([
  { id: 'c_leftbehind_call', age: 7, t: '视频电话', loc: 'village_s',
    cond: (g) => g.recall('leftBehind'),
    text: '妈妈在视频里问你想要什么。屏幕卡了一下，她的脸停在一个笑上。',
    choices: [
      { t: '说想要一个书包', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('askedMom', 'bag'); }, res: '过年的时候，书包是她亲手背回来的。' },
      { t: '说想要她回来', dev: 20, fx: (g) => { g.stat('人缘', 3); g.remember('askedMom', 'home'); }, res: '那边沉默了很久。' },
    ] },
]);
```

- `age` 是年龄（不是年份）。`loc` 可选，是地点类型（`world.js` 的 `JY.addLocs`），具体地名用 `fx` 里的 `g.move(地点, '地名')`。
- 同一个年龄可以有好几个节点，用 `cond` 让不同的人碰到不同的那个。**一个人一年里最多碰到一个抉择节点**（自动节点可以多个），写 `cond` 时让同龄的抉择互斥。
- 自动节点（`auto: true`）用来写不需要选的经历：入学、毕业、亲人离世、孩子出生……它们让人生有血有肉，可以多写。
- `canon: true` 是“大多数人会这么选”。另一条路写 `dev`（与众不同度，10–40）。
- 会死的选项写 `fatal: true`，`fx` 里 `g.die('死法')`。青壮年的死要罕见（一世里不到 2% 的概率）。
- 重要的成就或善举可以 `g.set('标记')` 并 `JY.addFlags({ 标记: '一句话' })` 注册，会出现在墓志页“你留下的痕迹”。标记要在后面某处被 `g.f` 读到。

### 后果（和江湖一梦同样的硬规矩）

- 每个抉择 2–4 个选项，按情节定。
- 每个抉择至少 2 个选项有后果，而且后面读得到：记下状态（`g.remember` / `CN.setJob` / `CN.setEdu` / `CN.marry` / `g.info` / `g.move`），后面的节点用 `cond` 或文字变体读它。只改属性不算。
- 读状态写成字面的 `g.recall('键')`，检查工具才认得。

### 多样性

所有人共用这套节点，节点少了，每一世都会长得一样。每个人生阶段都要按出身（`hukou`、`family`、`region`）、性别、学历、职业、婚姻写不同的版本。一世大约 25–35 个抉择，加上意外。童年 0–5 岁以自动节点为主。

## 意外、新闻、闲笔（`events.js`）

- 意外：`JY.addEncounters`，`y: [2026, 2130]`，`minAge`/`maxAge`/`cond`。一半以上要读状态（职业、城市、婚姻……），让意外贴着这个人的生活。选择的后果用 `g.remember` 记下，几年后由回响意外（`auto + always`）兑现，写法见江湖一梦 `data/world.js` 的 `echo`。
- 新闻：`JY.addEvents`，按上面的时间线，每年 0–2 条，平淡、具体。
- 闲笔：`JY.addFlavor`，键可以是 `loc:地点`、`age:child|young|adult|old`、`focus:重心名`、`any`。按地区、省份写的用 `{ t, cond: (g) => g.recall('region') === '东北' }`。每个地区都要有自己的味道（东北的暖气、广东的早茶、四川的火锅、西北的面……）。

## 写作要求

- 中文，第二人称“你”，短句白描，每段 1–4 句。不用“——”插入语，不用“不是……而是……”，不用表情符号。
- 写具体的日子：一碗面多少钱，几点下班，地铁上看见什么。不评论、不说教、不喊口号。
- 不写政治。不写真实品牌、公司、名人。不写性和暴力细节，死亡一句带过。

## 检查

```bash
node share/tools/simulate.js 1in1.4b 40                     # 投 400 次胎，必须“没有发现问题”，并看各项分布是否合理
node share/tools/consequence.js 1in1.4b childhood --list    # 看童年每个选项的后果
node share/tools/shot.js 1in1.4b random-20-dark out.png     # 投一次胎，跳过 20 个抉择截图
```

simulate 会打印投胎后各项的分布（学历、职业、婚姻、住处、死因、寿命）。分布要像真实的中国：大约一半上大学，多数人结婚，平均寿命 80 左右。

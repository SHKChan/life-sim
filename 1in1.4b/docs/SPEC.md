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
| `data/fate.js` | 天赋、心愿、结局与同命挑战 | |
| `data/echo.js` | 单项前世残响、下一世入口与一次消耗 | |
| `data/turning.js` | 一次改命、经历门槛、三年回响与结算评语 | `t_rewrite_` |
| `data/legacy.js` | 成就、图鉴与结算；`data/rarity.js` 为生成统计 | |
| `data/travel.js` `health.js` | 旅行迁城、疲劳预警、体检和工伤 | |
| `data/careers-*.js` | 行业入口与30/40/50岁经历 | |
| `data/family.js` `pets.js` `daily.js` `note.js` | 家庭、宠物、生活细节与临终留言 | |
| `data/scenes.js` | 现代场景的像素画（`JY.addScenes`） | |

## 出生地与时间线

出生省份按 `world.js` 的 `PROVS` 出生人口权重随机抽取，覆盖大陆31个省级地区，不是各省或各大区等概率。华东的配置权重约28.7%；地区标签表示出生大区，迁居后不变。普通新人生重新抽种子，同命挑战链接只固定首局出身；固定种子的截图不可用于判断正常投胎分布。

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
| `nanny` `kidPet` `cityKid` `momBack` | 见 `childhood.js` 开头 | 童年 | 奶奶来带你、小时候养的宠物、进城孩子回不回村、留守时爷爷奶奶不在了爸妈回来 |
| `will` `willAmt` `willSpent` | `'kids'` `'spouse'` `'sell'` `'spend'` `'donate'` `'kin'` `'carer'` `'none'`；元；元 | 老年（78 岁） | 遗嘱留给谁、卖房或捐出的金额、八十一岁前花掉的钱 |
| `liveWith` | `'alone'` `'kids'` `'nursing'` `'hometown'` | 老年 | 晚年住哪儿。`'alone'` 是住自己家（可能和老伴一起）；`economy.js` 按它对“和谁住” |
| `spCare` `gkCare` `afterWidow` `oldNanny` `robotBuy` `scamLoss` `heartBill` `gkGift` `gk2No` | 见 `oldage.js` | 老年 | 照顾老伴、带孙辈、丧偶后怎么过、九十三岁请住家保姆、机器人、被骗的钱、心梗的医药费、给孙辈的红包、二孩没生孩子 |
| `sp2` | 人物 id | 老年 | 晚年再婚的老伴，和 `sp` 一样算同住 |
| `offer22` `ladder` `biz` `bizKind` | 见 `youth.js` 末尾 | 青年 | 第一份工作（大厂、稳定、考公、自媒体）、29 岁升职（`y_promo29`）、32 岁创业及结果（`…Fail` 是失败） |
| `ladder40` `ladder50` `biz45` `bizKind45` `crop45` `consult` `consultPay` | 见 `midlife.js` 末尾 | 中年 | 中年两次升职、40–52 岁创业、55–63 岁做顾问 |
| `rehirePay` `afterRetire` | 元/月；`'odd'` 等 | 老年 | 返聘的月薪（只有有本事、身体好的人才有返聘）、退休后做什么 |
| `petNow` | `{ kind, name, y, life }` | `economy.js`，剧情用 `CN.adoptPet` | 现在养的宠物，在家时画进场景，活够年头会老去。读用 `CN.pet(g)` |
| `illY` `lowMood` | 布尔；连续几年心情很低 | `economy.js` | 上一次生病的年份（两次病至少隔四年）、心情低落的年数 |
| `expense` | 元 | `economy.js` | 去年花出去的钱（日常加还款），名帖上显示 |
| `money0` | 布尔 | `economy.js` | 已经有自己的钱了（十八岁或开始工作起）。之前“财富”表示家境 |
| `cash` `invest` `investStyle` | 元、元、`'safe'` `'fund'` `'stock'` `'gold'` | `economy.js`，剧情用 `CN.pay` `CN.earn` `CN.invest` `CN.withdraw` | 存款、理财。**剧情不要直接 remember 这几个键**，用工具函数 |
| `houseVal` `loanBase` | 万 | `economy.js`，剧情用 `CN.buyHouse` `CN.sellHouse` | 房子值多少、贷款本金基数（算每年还款） |
| `income` | 元 | `economy.js` | 去年全家的收入，只读 |
| `hh` | id 列表 | `economy.js`，剧情用 `CN.liveWith` `CN.moveOut` | 和你住在一起的人。读用 `CN.livesWith` `CN.alone` `CN.hhCount` `CN.hhText` |
| `hhPlace` | `''` `'dorm'` `'nursing'` | `economy.js` | 住宿舍、住养老院 |
| `parentsIn` `leftHome` | 布尔 | `economy.js` | 已经把爸妈接来同住；已经离开爸妈家 |
| `spWork` | `'home'` | 剧情 | 配偶不上班（全职带孩子），收入按零算 |

### 钱、房子、和谁住（`data/economy.js`）

每一世都要算的账在 `economy.js`，剧情文件直接用 `JY.CN` 上的工具函数：

```js
CN.fmt(元)                         // '¥3,200'、'¥12.5 万'；界面换成其他语言时显示美元
CN.cash(g) CN.net(g) CN.income(g)  // 存款、净资产、今年全家的年收入（元）
CN.pay(g, 元) CN.earn(g, 元)        // 花钱、进账（成年后才有效，未成年时什么都不做）
CN.price(g, tier)                  // 一套普通住房的价格（万）：一线 600、省会 200、地级市 90、县城 55、农村 25
CN.buyHouse(g, { tier, city, down, price })  // 买房；down 首付比例（默认 0.3，1 是全款），会扣首付、记房贷
CN.sellHouse(g)                    // 卖房，钱进存款
CN.invest(g, 元, 'fund') CN.withdraw(g)       // 理财：safe 存定期、fund 基金、stock 股票、gold 黄金，每年按风险涨跌
CN.liveWith(g, ['fa', 'mo'])       // 这些人搬来和你住（接爸妈、和孩子住）
CN.moveOut(g, ['fa'])              // 这些人搬走
CN.livesWith(g, id) CN.alone(g) CN.hhCount(g) CN.hhText(g)   // 是否同住、是不是一个人住、家里几口人（含自己）、“和妻子、女儿住在一起”
CN.who(g, id, true)                // “你的爷爷王建国（81 岁）”，提到亲人时用它
```

- 成年后每年末自动记账：按职业、城市、事业算收入（配偶也算），按家里几口人、城市算开销，交房租，还房贷，存款有利息，理财涨跌。属性“财富”从净资产换算（0–100），所以 `check: ['财富', 50]` 这样的判定照样能用。
- 旧写法 `g.stat('财富', ±n)` 成年后会换算成一笔钱（一点约等于全家年收入的 6%）。**新写的剧情涉及具体的钱，用 `CN.pay` / `CN.earn` 并在文字里写出金额**（`'花了 ' + CN.fmt(x)`），不要再叠加 `g.stat('财富')`。
- 金额按 2026 年的物价写，不算通胀。写数之前看一眼 `CN.income(g)`、`CN.cash(g)`，别让存款三万的人一口气掏出五十万；钱不够的选项写 `cond` 或者写成借钱（`g.remember('debt', 欠的万数)`）。
- 和谁住每年自动对一遍：出生时和爸妈（留守是爷爷奶奶）住，上大学、去外地工作就离家，结婚后配偶住进来，买了房就和爸妈分开，孩子出生就同住、十八岁离家，选了“接爸妈来住”（`parentsCare: 'self'`、`parentsNear: 'with'`）爸妈就搬进来，晚年 `liveWith` 决定住养老院还是和孩子住。场景里画的人、场景下面那行字、家人卡里的“同住”都读它。
- **写“一个人”“家里冷清”“要不要把爸妈接来”“给你介绍对象”之前，先用 `cond` 或文字变体读状态**：`CN.alone(g)`、`CN.livesWith(g, 'mo')`、`g.recall('love')`。`simulate.js` 的逻辑检查会报“已婚却写成单身”“有人同住却写成独居”“已经和爸妈同住还问要不要接来”。
- 提到亲人、同龄人去世或出事，用 `CN.who(g, id, true)` 写出关系和岁数。别人去世那一行引擎已经自动写成“你的爷爷王建国病逝，享年 82 岁”。

### 年龄要对得上

- 0 岁不会说话、走路；1 岁才会走、2 岁左右说第一句话；3 岁前不吃大人的饭菜（火锅、牛肉面、烧烤）、不喝奶茶咖啡。
- 闲笔里写“你吃了一碗……”“你学会了……”“你骑车……”的，写成对象 `{ t, minAge, maxAge }`。地区闲笔（`RG`）默认 `minAge: 6`。
- 八十五岁以后不跳广场舞、不领舞、不骑车爬山；七十五岁以后不上班加班（返聘写到七十岁为止）。
- `simulate.js` 会用 `game.js` 的 `lint` 规则检查这些，报“前后矛盾、不合年龄的文字”，必须清零。

### 基调

日子有难处，也有盼头。写难处时给一点暖意或转机（一顿饭、一句话、一件小事办成了），不要一路灰到底。死亡和疾病照写，但别让一世里坏事扎堆。

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

## v2.0：节奏与财务约定

### 自动小事与亲自决定的边界

- `engine.autoChoice(n, g, opts)` 是可选钩子，仅用于小抉择；返回当前可见、非致命选项的原下标。未配置或返回无效下标时沿用原自动逻辑，不影响其他游戏。
- 本游戏先在夫妻晚饭、青春期沟通和58岁工作安排三个小事中，读取同领域最近的手动选择及其已有记忆。自动经历不反推人格，无依据时回退；不新增存档字段。
- 婚姻、生育、职业主路、迁居、长期照护及重大支出节点由 `spine.js` 的 `PERSONAL` 列表补为重大决定。致命风险无论间隔多久均须停问。
- 明确 `kidPlan=dink` 或 `nokid=dink` 后，`m_40_nokid` 不再触发；旧档无这些值时沿用原条件。
- 停问约25–35次仍为内容设计目标，不作为强制截断；不能为达标代选重大决定。比较报告必须同时检查同年多次停问和各节点分布。

- `yearMs: 12000`：1× 一年12秒。大事标 `major: true`，写清 `stake` 与选项 `hint`；其余小事顺其自然，不算玩家抉择。重大意外的停问间隔见 `spine.js`。
- 回响用 `echoOf` 引用原节点，不另起一套任务系统。选项标题写行动，费用、风险和失败后果写在说明里。
- `finance.js` 管行情、分仓、定投、养老金和高息理财；`tech.js` 管科技亲历。新增文件的加载顺序以 `index.html` 为准。
- 金钱、房屋、职业、同住信息通过 `CN` 工具修改，避免直接写经济字段；新增职业须同步收入表、名称表、退休、心愿与图鉴。

| 键 | 值 | 谁设 | 说明 |
|---|---|---|---|
| `mktSeed` | 数字 | 生成器 | 这一世的行情种子。`CN.marketMood(g)` 今年的行情（boom/bull/calm/bear/crash），`CN.marketRet(g)` 大盘涨跌 |
| `pf` | `{ safe, fund, stock, gold, hy }` 元 | finance.js | 分仓。`invest`、`investStyle` 照旧同步。读用 `CN.pf(g)`、`CN.pfText(g)`，买卖用 `CN.invest(g, 元, 仓)`、`CN.withdraw(g, 仓?)` |
| `finGain` | 元 | finance.js | 一辈子理财赚（亏）了多少 |
| `dca` `dcaTotal` | 收入的几成；元 | f_review45 | 定投 |
| `paYear` `paAcct` | 布尔；元 | f_pension | 个人养老金：每年存一万二，退休后每年领账户的 1/20 |
| `hy` `hyBlown` | `'half'` `'some'` `'no'`；元 | f_hy | 高息理财；暴雷亏掉的钱 |
| `review45` | `'keep'` `'safe'` `'dca'` `'stock'` | f_review45 | 四十五岁怎么调整 |
| `retire62` `annuity` | `'safe'` `'annuity'` `'kid'` `'fund'`；元/年 | f_retire62 | 退休前的钱；养老年金每年领多少 |

## 天赋、心愿、结局与分享

- `fate.js`：一岁抓周，三选一；五种基础天赋，三种靠成就解锁。对口判定加12个百分点，八个关键节点有天赋专属选项。
- 十六岁选志向后，从相应池中抽三个心愿，完成一项记日志、心情+4。完整年龄条件在过程文案和判定中保留；结算用短标题，显示“完成 n / 3”和“已完成／未完成”。活到八十岁等以年龄本身为目标的心愿不删年龄。
- 33种结局保留原ID。主结局优先记录特定经历，寿命等通用结局兜底；同时符合的其他条目也收录，`plain` 仅在主结局为平凡人生时收录。图鉴默认只展示已收录结局和收录种数，不显示完成比例；尚无结局时显示人生记录空状态。未发现结局的线索统一折叠，主动展开后才显示方向，不预先展示完整结局标题。
- 同命挑战链接带出生种子；同种子生成同一出身、家庭和行情，不保证后续人生相同。生成器只能使用受种子控制的 `Math.random`，不能引入其他随机来源。朋友分享来的出身仅使用基础天赋池。
- 图鉴独立保存在 `1in1.4b.album.v1`，清空人生记录不清图鉴。人生存档继续使用 `1in1.4b.save.v2`。
- 人生特别程度按模拟样本百分位分档（75、95），仅在结算记录中展示，不解释为现实人口统计或人生好坏；分享卡不展示稀有度、成就、心愿完成比例和额外转折。
- 结算由可选 `GAME.endLayout(life, u)` 组织：人物与人生结局合并为顶部区域，说明只留一句，留言优先于临终原话。桌面人物和结局并排，手机上下排列；主操作紧接顶部区域。
- 统计、收集统一在“这一生的记录”默认展开，完整生平保留内层折叠；下一世念头和留言输入独立默认折叠，桌面放右列，手机单列。`GAME.endPreparation` 返回下一世选项，`GAME.endDetailsLabel` 保留完整记录的内层折叠；未配置布局钩子的游戏保持原展示。
- 留言 `life.note` 最多30个Unicode字符，清除HTML与控制字符，输入不重建界面；只存本机，不进入分享链接。输入后同步顶部引语，保留原存档字段。
- 分享卡展示人物资料、人生结局及一句说明、一句留言、人生轨迹和本游戏入口；右侧最多显示三个实际心愿的短标题，以“如愿／惦念”标记，不显示数量或比例，无记录时留白。第四资料项在有结局时显示结局标题，真实住处并入离世信息之后，以“·”分隔；轨迹只画已经走过的年份。`GAME.share.story(life)` 为可选钩子，未设置的游戏保留原卡片。旧记录缺少结局时不补算，离世原因不改写；未满八十岁的自然离世展示“安然离世”。
- 《江湖一梦》体验入口通过 `GAME.endAfterActions` 在结算底部显示为轻推荐，不进入分享卡。

| 键 | 值 | 谁设 | 说明 |
|---|---|---|---|
| `gift` | `'book'` `'abacus'` `'seal'` `'ball'` `'mic'` `'coin'` `'brush'` `'sleep'` | fate.js（一岁） | 天赋。名帖字段 `天赋` |
| `zzSeed` `zzOpts` | 数字；三个天赋的键 | 生成器；fate.js | 抓周时摆在面前的是哪三样，一世之内不变 |
| `wishes` `wishDone` | 心愿的键列表 | fate.js（十六岁起） | 写下的三件事、已经做到的 |
| `coinPaid` | 布尔 | fate.js | “有财运”成年时那一份已经给过 |
| `seed` `seedFrom` | 数字；布尔 | 生成器（fate.js 包了一层） | 这一世出身的种子；是不是朋友分享来的 |

## 年度重心、健康与数值边界

- 重心按年龄开放。在职且有未成年孩子时默认陪伴家人，其后55岁起默认锻炼；手动选择保留到该重心不再适龄。
- 人缘55、心情70、学识80以后增长递减；事业增长线取决于学历与天赋。具体公式以 `economy.js` 为准，下降不打折。
- 25岁后不学习且学识高于55时，每年35%概率学识-1。60岁后高健康恢复减半，75岁后降为四分之一；不能靠锻炼无限延寿。
- 透支统一结算，不重复扣工作健康。疲劳≥5且非轻岗时，收入效率为68%；轻岗通过事业下降影响工资。累计透支满20后，60岁起且健康>25仍有后续损耗。
- 猝死判定仅在28–60岁：忽视预警且疲劳≥8时，概率为 `0.006 × (1.7 − 健康/100)`；无预警但疲劳≥10时为2%。不能解释成所有工作者的固定年死亡率。
- 复用45/55/69岁体检与大病节点，工伤和疲劳预警均有后续。新增事件保持 `e_` 前缀。
- 收入结余的30%进入额外开销；房价分化、照护、理财等参数以 `economy.js` 和 `finance.js` 为准，不在文档重复整套数表。
- 平衡检查比较多种选法、重心和志向，关注寿命、早逝、净资产、学识与心愿分布。新写“又稳又赚”的选项必须有代价、判定和失败分支。

| 键 | 值 | 写入与读取 |
|---|---|---|
| `focusManual` | 重心名或 null | 手选后保持到该重心不再适龄；缺失时跟随阶段默认 |
| `fatigue` | 0–12 浮点 | economy 年终结算；health 预警、体检、生病读取 |
| `fatigueWarn` | rest / change / ignore | health 预警及三年回响、年终猝死读取 |
| `workStrain` | 累积透支暴露量（轻岗每年记0.5） | 透支满二十年的长期健康损耗；退休后仍有效 |
| `lightDuty` | 布尔 | 轻岗降低收入与新增透支 |
| `chronic` | pills / control / ignore；兼容旧 control / ai | 复用45岁体检、55岁大病、69岁体检 |
| `injury` | claim / settle / bear | 工伤选择、三年回响 |

## 行业、旅行、家庭与宠物

### 第二批关系与职业试点

- 家庭记忆在 `o_seventy`、`o_spcare_echo`、`o_care_plan`、`o_care_echo`、`o_kids_visit` 继续读取。夫妻只续接健在原配 `sp`，亲子记忆只属于健在 `k1`；手足无法辨认对象时不猜测。
- 行业模板现覆盖22个职业52条路线：8个小生意/手艺职业各三条，9个服务职业和5个农业/建筑职业各两条。40、50岁已有回响保留，全部路线由 `CN.careerMemory(g)` 进入已有79岁工作回顾。`career50={job,route}` 仅在实际触发50岁回响且有原路线记忆时记录；缺失或未知值保留原回顾，不补造旧档历史。
- `CN.homeLifeContext(g)` 在原住房、父母照护、退休、职业、家庭工作支持和夫妻相处等九个节点读取当前住所。覆盖租住、置业、返乡、父母同住、子女同住、宿舍、养老社区；子女同住必须核实健在且实际同住。函数只读，不再次收取费用或移动场景。
- `focusRun={name,n,y}` 为本世可选记忆：6岁起年终记录实际重心、连续年数和最后结算年份；同年不重复累计，重心变化或跨年缺口重置。旧档从更新后的第一次结算记一年，不补造过去。
- 连续三年及以上且仍采用该重心时，`CN.focusMemory(g)` 为十二种可主动选择的重心呈现生活痕迹，童年“懵懂”不记为个人习惯。除原十年小结和疲劳回响，还接入职业、体检、旧伤、夫妻、退休、爱好和慢性病七个现有节点；孙辈重心需有健在孙辈才写相关反馈。只增加文字，不增加费用、健康效果、日志条数或停问。
- 定向检查为 `tools/check-batch2-family.js`、`check-batch2-careers.js`、`check-batch2-life.js`。本批没有解决P0停问预算问题，不能将文字深化作为节奏达标证据。
- 全覆盖验证为 `tools/check-batch3.js`：遍历22职业52条路线、住房及重心组合，并在固定时钟和随机种子下与当前已提交HEAD逐世比较操作和主要数值；脚本比较基线含义随HEAD变更而变化。

- 行业文件：`careers-small.js` 管餐饮、理发、零售、维修和技工；`careers-service.js` 管教育医疗、运输和照护；`careers-land.js` 管农业与工地；`careers-jobs.js` 接入原有升学、就业、创业和转行节点。行业30/40/50岁经历复用原职业与记忆。
- `job` 还包括 `restaurant`、`beauty`、`grocery`、`mechanic`、`electrician`、`welder`、`cnc`、`renovation`、`parcel`、`maternity`、`eldercare`、`housekeeping`、`cooperative`、`livestock`、`grower`、`construction`。收入基数以代码为准。
- `tradeOwn` 区分同一职业里的经营者和雇员，换行清除、退休保留回顾；不能把学徒算成老板。
- 国内迁城用 `CN.goCity`；外派、研修按期返回，不设 `abroadStay`，不引入移民或定居。家庭出行与已有宠物的照料要衔接。
- 家庭节点复用原子女、婚姻和同住状态，不重复高考、婚礼。孩子选择不婚后，不能强制触发结婚或孙辈剧情。
- 成年宠物复用 `petNow`，每年花¥1,200；续租、出行、送别均读当前宠物状态。`daily.js` 补生活与背景文字，不增加停问。

| 键 | 值 | 后续读取 |
|---|---|---|
| `gradTrip` | cheap / far / intern | 毕业出行及回响 |
| `cityMove` | first / second / stay | 国内迁城与收入、房租 |
| `dispatch` `study3m` | half / quarter / no；go / early / no | 短期外派、研修及回响 |
| `familyTrip` | drive / sea / overseas / class | 家庭出行与41岁回响 |
| `trade30` `service30` `land30` | `{ job, route: steady / learn / rest }` | 行业40/50岁回响 |
| `tradeEntry` `tradeOwn` | 职业键或 failed；布尔 | 入行回响、经营者判定、退休回顾 |
| `familyTeen` | listen / later | 两年后的亲子回响 |
| `familyExam` | rest / sort / class | 考前陪伴回响 |
| `familyWork` | budget / support / alone | 孩子第一份工作回响 |
| `kidNoWed` | respect / plan / press | 不婚选择、四年回响及后续节点限制 |
| `familyPartner` | talk / space / busy | 两年夫妻相处回响 |
| `familySibling` | share / time / apart | 两年照护分担回响 |
| `adultPet` | `{ way, kind, name, y, life }`；不养为 `{ way: no }` | 成年养宠及回响 |
| `petLease` | repair / move / friend | 续租与宠物安排 |

## 有限改命

`turning.js` 在 `note.js` 后加载。每世最多两次邀请，只能使用一次；机会读取已有经历，不再按出生种子分配。用原 `L.done` 统计邀请，不新增任务、货币或跨世战力。

| 路线（年龄） | 经历门槛 | 费用 |
|---|---|---|
| 维修试学（23） | 相关手艺、机电/机器人专业或技术职业；已有汽修岗除外 | ¥6,000 |
| 快递站（28） | 配送、驾驶、销售、零售或店铺工作 | ¥8,000 |
| 独立接单（34） | 公司职员、技术岗、自媒体 | ¥12,000 |
| 养老设备（41） | 技术或照护工作背景 | ¥10,000 |
| 实务试讲（49） | 事业≥55，且已有十年个人收支经历 | ¥6,000 |
| 兴趣小课（58） | `hobby55=art` 或画笔天赋 | ¥5,000 |

需仍在工作、未用机会。现金不足不借债入场；成败支付同额费用、健康-2，成功换职业并加事业，失败保留原岗、学识+3。选择和成败均有三年后回响。

- `rewrite={k,ok,age}`：本世改命记录；缺失按未使用读取。
- `turns={路线键:pass/save/yes/no}`：各次邀请的选择。
- 终局可选字段：`life.rewrite`、`life.turns`（最多三个关键抉择，供分享）、`life.review`、`life.otherEnds`、`life.note`。旧记录缺字段时保持可读，不改存档前缀。

## 前世残响

`echo.js` 在 `turning.js` 后载入。结算给两个候选；有过婚姻、子女或活过60岁时再提供家庭候选。可选一项，也可不选；下一世开始前可在结算或首页换选，刷新保留。开始新人生后不能从旧结算重复领取。

| 残响 | 本世一次作用 | 代价与限制 |
|---|---|---|
| 早点学门手艺 | 合适的求职/转行节点增加电工学徒入口 | ¥3,000、事业−3；现金不足不借债，已有技能不覆盖 |
| 别总说下次再陪你 | 一次婚姻矛盾中修补关系 | 事业−2、心情+4；需伴侣健在，不复活人物 |
| 这回想替自己活一次 | 指定转行/单干选项成功率+8个百分点 | 最高95%，保留原费用与失败风险，成败均消耗 |

只带入紧接着的下一世，使用或命终后失效；不叠加跨世属性，不锁省份或家境。普通选择不会误消耗其他种类的残响，预览成功率不消耗；可见选项最多四个。尚未用上的残响不顺延。

同命挑战统一不带入，也不会留到挑战后的普通人生。选择存入图鉴的 `pendingEcho`、`echoSource`、`echoOffers`；仅在成功持久化领取清除后才发放。当前人生可选记忆为 `echoCarry`、`echoUsed`，终局可选字段为 `life.echoOffers`、`life.echo`；不改变旧存档前缀。

## 检查与产物

在仓库根目录执行：

```powershell
node share/tools/simulate.js 1in1.4b 40
node share/tools/consequence.js 1in1.4b
node 1in1.4b/tools/check-update.js
node 1in1.4b/tools/check-turning.js
node 1in1.4b/tools/check-echo.js
node 1in1.4b/tools/check-album.js
node 1in1.4b/tools/shot-echo.js
node 1in1.4b/tools/shot-turning.js
node tools/build.js
```

- `simulate` 必须“没有发现问题”，另看分布与未覆盖分支；游戏模拟不是现实人口统计。改经济、剧情或结局规则后重跑 `node 1in1.4b/tools/rarity.js 2500`。
- 简体变化后用 `python share/tools/tw.py 1in1.4b` 同步繁体。共享词表不得丢旧键或覆盖已有译文；繁体回归用 `SIM_LANG=zh-TW`（PowerShell设置 `$env:SIM_LANG`，结束后移除）。
- 界面在Chrome或内置浏览器验收，覆盖桌面、390px、折叠/展开、头像和真实分享图；用独立测试存档。改共享代码还要回归江湖一梦；群侠用自己的 `tools/playtest.js`，不能用共享人生模拟器。
- 日志、截图和当前对比写入被Git忽略的 `docs/validation/`，不提交逐阶段结果。长期基线的口径和限制见 [资料说明](README.md)；规则历史见根目录 [CHANGELOG.md](../../CHANGELOG.md) 和Git历史。

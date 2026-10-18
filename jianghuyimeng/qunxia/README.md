# 群侠（江湖一梦 · 群侠模式）

倚天年间（江湖纪年 131–138 年）的文字武侠 RPG。玩法借鉴《金庸群侠传》的自由度：在地图上走动，拜师、找秘籍、结交群侠、回合制比武、收集十四件信物，最后按品德走向“侠”或“魔”的结局。文字、地图、数值都是自己写的，不照抄任何游戏或原著原文。

和年度人生模拟“江湖一梦”完全分开：自己的引擎、数据、界面和存档（`localStorage` 键 `jianghuyimeng.qunxia.v1`）。只共用 `../../share/style.css`、`pixel.js`、`i18n.js`、`lang.js`，不改它们。

## 文件

| 文件 | 内容 |
|---|---|
| `index.html` | 页面。按顺序载入 config → i18n → engine → data/* → pixel → ui |
| `config.js` | 部署配置（网址、字体、面包屑、反馈仓库），字段同 `../config.js`，另有 `gameUrl`、`gameName` |
| `engine.js` | 规则引擎 `window.QX`：状态、日子、地图行程、练功、战斗、事件、存档。不放剧情文字 |
| `data/world.js` | 地区、地点、出身、门派、物品、引擎用的固定句式（`QX.TXT`）、改命标记说明、结局、通用探索与路上遭遇 |
| `data/arts.js` | 武功（29 门） |
| `data/enemies.js` | 对手 |
| `data/people.js` | 人物：在哪里（按纪年）、说什么、教什么、能不能同行 |
| `data/timeline.js` | 江湖大势：光明顶、万安寺、灵蛇岛、屠狮大会等，到点必然发生 |
| `data/zhongyuan.js` `xinan.js` `donghai.js` `xiyu.js` `north.js` | 各地事件 |
| `data/companions.js` | 同伴的故事、以剑斩刀 |
| `ui.js` `qunxia.css` | 界面 |
| `tools/playtest.js` | 无界面试玩与检查 |

## 系统

- **时间**：一年 360 天。只有赶路、练功（10 天）、探索（3 天）、打坐（3 天）、住店（1 天）、做工（5 天）、门派差事（10 天）、等候（30 天）会过日子。138 年腊月是最后期限；137 年起（或收齐 14 件）可以随时“了结江湖”。
- **地图**：8 个地区、12 处地点，坐标在 `QX.addLocs` 里。行程天数按距离算，轻功越高越快。海岛（`sea`）要从临安坐船，冰火岛还要海图。路上按路程长短有几率遇到 `road` 事件。
- **大势（铁律）**：`timeline.js` 的事到了日子一定发生。人在当地就亲历（`ev`），由你的选择决定个人的生死、东西归谁；不在场就按原著结局写进传闻（`away`）。
- **人物**：主角是无名小卒，谁也不认识。人物按 `at` 的纪年出现在原著里该在的地方。
- **属性**：资质（学武快慢）、根骨（气血）、内力、攻击、防御、轻功、品德（0–100，50 是侠魔分界）、声望、银两；气血、内力两个池子；内伤（住店、时间、药能治）。
- **武功**：内功、拳掌、兵器、轻功，每门 1–10 级。来源：拜师（人物的 `teach`）、秘籍（物品的 `teaches`）、奇遇。练十天长一截；冒进加倍，但可能受内伤或走火入魔（掉级）。内功越深越安全。
- **战斗**：你加最多 2 个同伴，对 1–4 个对手。每回合选招式（伤害看等级和攻击、防御，耗内力）、运功、吃药、逃走；同伴自己出手；可以开自动。输了默认是重伤、丢钱、躺几天；标着“死斗”的输了就是死。
- **同伴**：殷离、韦一笑、周颠、小昭、常遇春、赵敏。各有入队条件、互相合不来的人（`clash`）、离开的时机（`leave`），和自己的小故事。
- **信物**：14 件，大多有侠、魔两条路。倚天剑与屠龙刀互斫得武穆遗书、九阴真经。
- **结局**：侠（品德 ≥ 50）、魔，按信物多少各三档；另有战死。结局页列出“江湖因你而变”的标记。
- **存档**：每一步自动存；一个手动存档位；新的江湖。

## 数据格式（要点）

```js
QX.addLocs({ id: { name, short, region, scene /* pixel.js 的场景 */, x, y, inn /* 住店价 */, shop: [物品], work, sea, port, fare, needs, desc } });
QX.addPeople({ id: { name, sex, look, title, at: [{ loc, from: [年, 月], to: [年, 月], cond }], hello, talk,
  teach: [{ art, cond, why, cap, cost }], comp: { cond, why, clash, leave, st: { hp, atk, def, agi, moves } } } });
QX.addArts({ id: { name, type, pow, mp, moves: [[级, 招式, 倍数]], grow: { 属性: 每级 }, diff, risky, needs, req, reqText, sp, passive, evil, item } });
QX.addEvents([{ id, loc | who | anywhere, act /* 按钮字 */ | arrive | explore | road, from, to, cond, once, t, text, fx,
  choices: [{ t, cond, check: ['属性', 难度], cost: { 银两 }, fx, res, fail: { fx, res }, next,
             fight: { foes, noFlee, win: { fx, res, next }, lose: { mode: 'injury' | 'death', res, next } } }] }]);
QX.addTimeline([{ id, at: [年, 月, 日], win, loc, ev, fx, away, news }]);
```

`fx` 收到 `g`：`g.st / add / f / set / has / give / take / holder / hold / lv / learn / setSect / recruit / dismiss / alive / kill / heal / hurt / injure / days / move / log / news / die` 等，见 `engine.js` 的 `G()`。

## 怎么加内容

- **地点**：在 `world.js` 的 `QX.addLocs` 加一项（场景用 `pixel.js` 已有的），再在某个事件文件里给它写探索事件（`explore: 'id'`）。
- **武功**：`arts.js` 加一项；给某个人物的 `teach` 加上，或给某件物品写 `teaches`。
- **人物**：`people.js` 加一项，`at` 按 `../docs/SPEC.md` 的纪年写；和别人的关系照 `../data/relations.js`。
- **事件**：写进对应地区的文件。每个选项都要有结果（`res`、`fx`、`fight` 或 `next`）。设了标记就在别处用 `g.f('名字')` 读，或在 `world.js` 的 `QX.addFlags` 写一句说明（会出现在结局页）。
- 文风：中文、第二人称“你”、短句白描；不用“——”、不用“不是……而是……”、不用表情符号；死亡一句带过。

## 测试

在仓库根目录：

```bash
node jianghuyimeng/qunxia/tools/playtest.js 300      # 必须最后输出“没有发现问题”
RDBG=守武当 node jianghuyimeng/qunxia/tools/playtest.js 0   # 只跑名字里带“守武当”的路线，并打印每一步
```

它会做静态检查（id 重复、引用不存在、选项没结果、触发不了的事件、读了没人设的标记、文风），再让侠、魔、乱三种机器人各玩若干局（查运行错误、卡死、打不完的战斗、两种结局是否都到过），最后按 `ROUTES` 让一个练成了的玩家把每件信物的路线走一遍（走真实事件），确认 14 件都拿得到。

界面截图：`index.html?demo=1` 开一局示例，可加 `&open=map`、`&fight=1`、`&theme=light|gray`、`&lang=zh`。

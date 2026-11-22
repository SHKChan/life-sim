# life-sim · 开发约定

浮生录包含两个年度人生模拟器和一个独立文字RPG。这里保留仓库级约束，玩法与数据格式只在各游戏规范维护。

## 先读

1. 系列规范：本地 `../vibe-game/docs/GUIDE.md`，或[线上版本](https://raw.githubusercontent.com/SHKChan/vibe-game/main/docs/GUIDE.md)。两处都读不到时，先停下索取规范，不能猜测跨仓库规则。
2. 对应游戏的README与SPEC，见下表。系列规范优先；本文件明确列出的仓库例外除外。用户本次指令优先于文件约定。

| 游戏 | README | 规范 | 引擎 |
|---|---|---|---|
| 十四亿分之一 | [入口](1in1.4b/README.md) | [SPEC](1in1.4b/docs/SPEC.md) | `share/engine.js`、`share/ui.js` |
| 江湖一梦 | [入口](jianghuyimeng/README.md) | [SPEC](jianghuyimeng/docs/SPEC.md) | 同上 |
| 群侠 | [入口](qunxia/README.md) | [SPEC](qunxia/docs/SPEC.md) | `qunxia/engine.js`、`qunxia/ui.js` |

## 仓库参数

| 项 | 值 |
|---|---|
| 路径 / Worker | `life-sim`；[正式大厅](https://www.vibe-game.com/life-sim/) |
| 生产分支 | `main`，推送会自动部署 |
| 打包入口 | `node tools/build.js` 固定 `--base=life-sim`；输出 `dist/life-sim/`，不要手改产物 |
| 版本 | 三个游戏均在各自 `game.js` 的 `version`；构建时写入 `vg:version`。大厅不单设版本 |
| 存档例外 | 前缀用游戏ID而非站点slug：`1in1.4b.save.v2`、`jianghuyimeng.save.v2`、`qunxia.save.v2` |
| 图鉴 | 年度人生游戏另存 `<游戏ID>.album.v1`，不能随普通记录一起清除 |
| 旧网址 | `jianghuyimeng/qunxia/` 仅保留跳转，实际游戏在 `qunxia/` |
| 变更记录 | 根目录 `CHANGELOG.md`，每节标明游戏；纯文档或测试改动无需升游戏版本 |
| 语言 | 正式站 `share/i18n.js` 的 `LANG_OPEN=false`；翻译机制保留 |

部署、反馈与发布流程遵循系列指南及本次授权。游戏里的反馈通过 `window.VG_FEEDBACK` 接入；不要把旧GitHub反馈方案当作新功能待办。

## 修改边界

- 纯静态、原生JavaScript、普通script，双击页面也能运行。不要擅自引入构建器、后端或依赖。
- 规则在引擎，剧情在数据，展示在界面。`share/` 不得写游戏专属人名、颜色、文案；能用现有钩子就不改共享层。
- `share/engine.js` 的g接口和数据格式只能加，不能删改既有语义；`game.js` 的字段名不能随意改。
- 既有节点ID、改命标记、记忆键只能新增，不能改名；新增跨世标记须注册说明。命名和单位以对应SPEC为准。
- `W`、`L`及存档结构不能随意更换。新增可选字段必须兼容旧记录；不兼容变更须明确版本与迁移策略，不能让旧档读成半新数据。
- 游戏目录、网址、存档前缀不可随意更换。语言、画风、顶栏、主题和路径规则引用系列指南，不在子游戏重复维护。

## 两种年度人生模式

`game.js` 先定义 `JY.GAME`，`share/engine.js` 再载入，数据文件用 `JY.addChars/addLifeNodes/addEvents/addEncounters` 等注册。加载顺序以各游戏 `index.html` 为准，不改成模块。

- 江湖一梦：固定人物与 `arc.nodes`，世界W跨世保存。后世从当前江湖纪年醒来，较早节点按原著结算。
- 十四亿分之一：`GAME.random=true`，`JY.GENERATE()` 每世生成新人物与家庭，共用 `LIFE_NODES`。普通游戏随机出身，同命挑战只固定起点。
- `g.set/g.f` 写读世界标记，跨人物跨世；`g.remember/g.recall/g.since` 写读 `L.mem`，只属于这一世。不要混用。
- 一年先推演世界、人物节点和奇遇，再年终结算；UI按时间播放日志。自动小事不计玩家抉择。
- 可选钩子如 `engine.onFinish/minor/oddsMod/defaultFocus/onFocus`、`endCards/homeCards/sideCards/endNote/endDetailsLabel` 应默认关闭，未配置的游戏行为保持一致。完整参数见代码注释与游戏SPEC。

群侠不使用上述年度引擎，格式与检查工具以自己的SPEC为准。

## 内容与界面硬约束

- 剧情预先编写，不接实时AI旁白。简体中文、第二人称、短句白描；不抄原著原文，不写性暴力。其余文风按系列指南。
- 年度人生抉择可见选项保持2–4个，按情节定，不凑数。至少两个选项产生后面读得到的后果；只改属性不算。判定要有失败结果，致命选项标 `fatal:true`。
- 节点ID全局唯一；读取标记用字面键名以便检查。带条件的选项也要测试边界状态，随机模拟未覆盖的跨世分支需单独设状态验证。
- 江湖一梦：纪年表不可改；大势不可改、个人命运可改。引用人物先检查存活、存在与 `g.knows`，亲人师徒旧识不能当陌生人。世界事件写 `who` 避免和玩家自身节点重复。每个人物至少三处真实剧情分叉。
- 十四亿分之一：固定2026年出生，未来推演克制；只写普通民生，不写政治运动、真实品牌与名人。经济、职业、住房、同住关系通过CN工具联动。
- 年度界面：电脑保持名帖/状态、场景/重心/生平、家人/同代人的布局；手机优先中栏，其次左栏、右栏。手机简化状态与重心下拉保留，不复制另一份页面。
- 抉择弹框停钟，选完无需确认。Esc收起/展开；手机从底部出现，点遮罩不误关。结果进入生平，之后临终一句、回顾、墓志、分享。
- 江湖一梦1×一年约60秒，纯闲笔年20秒；十四亿分之一12秒。进度条只表示当年进度，命终年最多等4秒，不用含义不明的额外进度条。
- 保留头像、像素场景、分享图与带链接的文字总结；字体异步，系统字体回退可用。不要添加装饰乱码。
- 浏览器验收使用Chrome或内置浏览器，不使用Edge。检查桌面、390px及相关交互，注意暗/灰/白主题与键盘操作。

## 翻译

中文为源文件，内部ID、键名、属性名和比较值不翻译。`game.js` 的 `langFiles` 标记已完成文件，未列出的保留中文。

- 字符串对照生成：`node share/tools/tr.js <游戏> <语言> --all`；译者说明见 [TRANSLATORS.md](1in1.4b/lang/en/tr/TRANSLATORS.md)。
- 繁体：`python share/tools/tw.py 1in1.4b`，需要OpenCC；重生成共享词表时保留全部旧键和旧译文。
- 测翻译用 `SIM_LANG`；PowerShell以 `$env:SIM_LANG='zh-TW'` 设置，结束后移除，不能污染其他游戏检查。
- 中文显示人民币，其他语言按已有逻辑显示美元；英文名字用现有姓氏工具，不能假定姓占一个字符。

## 验证与测试产物

命令在仓库根目录执行，按修改范围选择：

```powershell
node share/tools/simulate.js 1in1.4b 40
node 1in1.4b/tools/check-update.js
node 1in1.4b/tools/check-turning.js
node 1in1.4b/tools/check-echo.js
node share/tools/simulate.js jianghuyimeng 40
node qunxia/tools/playtest.js 300
node tools/build.js
```

- 改共享层时回归所有受影响游戏；群侠用专用playtest，不能传给共享simulate。
- 界面截图工具见各游戏README；Chrome不在默认位置时设置 `CHROME`。使用独立测试存档，不清玩家日常记录。
- 日志、截图和单次模拟统一写 `docs/validation/`，该目录被Git忽略。保留可复现脚本和必要长期基线，不提交逐阶段PASS记录。
- 十四亿分之一的历史基线口径见 [docs/README.md](1in1.4b/docs/README.md)。历史任务与协作过程交给CHANGELOG和Git，不塞回当前规则。
- 普通文档改动验证链接、路径和事实即可，不必重跑完整游戏；发布前仍按系列指南完成构建与必要验收。

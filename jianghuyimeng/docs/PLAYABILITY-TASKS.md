# 江湖一梦 · 可玩性模块索引

这里原为早期分阶段实施任务，相关模块现已接入。它不是待办清单，不要按旧任务再次实现、重复增加存档或重做版本。当前行为、接口和验收以 [SPEC.md](SPEC.md) 为准；原任务细节可从Git历史查看。

| 原任务 | 当前实现入口 |
|---|---|
| 人物心愿 | `data/wishes.js`、`GAME.sideCards/endCards` |
| 结局与改命图鉴 | `data/legacy.js`、独立album存储 |
| 空白年提速 | `game.js` 的 `quietYearMs`、共享UI |
| 中晚年专属剧情 | `data/midlife.js` |
| 年度重心预告 | `data/stakes.js`、`game.js` 的 `focusPreview` |
| 跨世改命 | `data/quests.js`、世界标记与 `W.flagBy` |
| 张三丰可玩路线 | `data/zhangsanfeng.js`，沿用原人物ID |
| 武功与信物 | `data/items.js` |
| 险境 | `data/perils.js` |

所有路径相对 `jianghuyimeng/`，载入顺序以 `index.html` 为准。新增内容先复用上述模块，后果、人物关系与纪年约束见SPEC；检查命令见 [README](../README.md)。

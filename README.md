# 浮生录

人生模拟器合集。选一个背景，投一次胎，从出生活到离世。玩法借鉴 *1 in 8 Billion*，同一套引擎，不同的世界。

**线上地址：https://www.vibe-game.com/life-sim/**（Vibe Game 系列的一部分，总页面 https://www.vibe-game.com/）

| 游戏 | 线上地址 | 目录 | 说明 |
|---|---|---|---|
| 十四亿分之一 | https://www.vibe-game.com/life-sim/1in1.4b/ | `1in1.4b/` | 按真实人口比例随机投胎到中国某个省市、某种家庭，2026 年出生，过完普通人的一生。有真实的钱、房子、和谁住在一起 |
| 江湖一梦 | https://www.vibe-game.com/life-sim/jianghuyimeng/ | `jianghuyimeng/` | 射雕三部曲放进同一个江湖，重生成书中人物，改写原著里的命运 |
| 江湖一梦 · 群侠 | https://www.vibe-game.com/life-sim/jianghuyimeng/qunxia/ | `jianghuyimeng/qunxia/` | 文字武侠 RPG：做一个无名小卒，自由游历江湖、拜师学艺、招募队友、集齐信物 |

- 语言：暂时只开中文（`share/i18n.js` 的 `LANG_OPEN`）。英日西的界面词表和剧情翻译都还在，以后再开放。
- 主题：暗、灰、白三种。手机、电脑都能玩。
- 试玩（本地）：用浏览器打开根目录的 `index.html`（大厅），或者直接打开某个游戏目录里的 `index.html`。不需要服务器，存档在浏览器里。
- 部署：纯静态网站，推送到 `main` 后 Cloudflare 自动部署（Build command `node tools/build.js`，部署规则见 [vibe-game 的 GUIDE.md](https://github.com/SHKChan/vibe-game/blob/main/docs/GUIDE.md)）。
- 版本：每个游戏的版本号显示在全站顶栏（`game.js` 的 `version`，打包时写进页面）；发布时打 Git 标签（例如 `1in1.4b-v1.5.0`、`jianghuyimeng-v1.3.0`），要回滚就回到对应标签。
- 开发：先读 `CLAUDE.md`（给开发者和 AI 助手的说明），写剧情前读各游戏的 `docs/SPEC.md`。全系列的约定在 [vibe-game 仓库的 docs/GUIDE.md](https://github.com/SHKChan/vibe-game/blob/main/docs/GUIDE.md)。
- 改完数据在根目录跑 `node share/tools/simulate.js <游戏目录> 40`，必须输出“没有发现问题”。
- 问题反馈：点顶栏或游戏里的“反馈”，或者直接到 [GitHub Issues](https://github.com/SHKChan/life-sim/issues) 提。

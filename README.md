# 浮生录

三个纯静态文字游戏，存档保存在浏览器本地，剧情全部预先写好，不调用 AI。[进入大厅](https://www.vibe-game.com/life-sim/)。

| 游戏 | 玩法 | 开发入口 |
|---|---|---|
| [十四亿分之一](https://www.vibe-game.com/life-sim/1in1.4b/) | 2026年随机出生，经历工作、家庭与养老，收集人生结局 | [README](1in1.4b/README.md) · [规范](1in1.4b/docs/SPEC.md) |
| [江湖一梦](https://www.vibe-game.com/life-sim/jianghuyimeng/) | 重生成射雕三部曲人物，改命影响同一个江湖的下一世 | [README](jianghuyimeng/README.md) · [规范](jianghuyimeng/docs/SPEC.md) |
| [群侠](https://www.vibe-game.com/life-sim/qunxia/) | 无名小卒自由游历、拜师、战斗，收集十四件信物 | [README](qunxia/README.md) · [规范](qunxia/docs/SPEC.md) |

正式站暂时只开中文，支持暗、灰、白主题及手机布局。

> 本文件给人看：怎么本地试玩、构建、测试和发布。给 agent 和开发者的约束在 [`AGENTS.md`](AGENTS.md)，各游戏的玩法和数据格式在各自的 README 和 SPEC，全系列规范在 [vibe-game 的 `docs/GUIDE.md`](https://github.com/SHKChan/vibe-game/blob/main/docs/GUIDE.md)（本地是 `../vibe-game/docs/GUIDE.md`，也可读[线上版本](https://raw.githubusercontent.com/SHKChan/vibe-game/main/docs/GUIDE.md)）。

## 本地试玩与开发

用 Chrome 直接打开根目录或游戏目录的 `index.html`（群侠是 `qunxia/index.html`），不需要服务器，本地没有全站顶栏，不影响玩。前两个游戏共用 `share/` 引擎与界面；群侠有独立引擎和存档，只复用部分公共资源。

跑工具需要 Node.js，没有 npm 依赖。截图工具还需要 Chrome，不在默认位置时设环境变量 `CHROME`。开发前读 [`AGENTS.md`](AGENTS.md) 和对应游戏的规范。

## 构建

| 版本 | 命令 | 输出 | 和线上版的区别 |
|---|---|---|---|
| **线上版** | `node tools/build.js` | `dist/life-sim/`（大厅和三个游戏），不要手改 | 给 css/js 加内容哈希，写 `dist/_headers` 缓存规则，把版本号写进页面的 `vg:version` |
| 本地静态版 | `node share/tools/build.js [游戏目录]` | `dist/`（站点在根路径，不带 `/life-sim/`） | 不带子路径，适合用任意静态服务器预览；可以只打包一个游戏 |
| **itch.io 版**（仅十四亿分之一） | `node 1in1.4b/tools/build-itch.js [--url=itch 页面地址]` | `dist/itch-1in1.4b/`（可直接打开试玩）和 `dist/1in1.4b-itch.zip` | 分享图和文字总结里的网址换成 itch 页面；开放语言切换，页面上有“EN / 中文”按钮，默认英文；不加载全站顶栏；页面标题和描述换成英文 |

微信版：暂无单独版本。在微信里直接打开线上网址即可玩；分享链接可能被微信拦截，所以分享以图片为主，被拦截时换备用域名（改各游戏 `config.js` 的 `siteUrl`，见系列规范第十二节）。

## 测试

在仓库根目录运行，必须输出“没有发现问题”：

```powershell
node share/tools/simulate.js 1in1.4b 40       # 40 轮对应 400 世
node share/tools/simulate.js jianghuyimeng 40
node qunxia/tools/playtest.js 300
node tools/build.js
```

这是最基本的一组。按修改范围还有更多检查（十四亿分之一的 `1in1.4b/tools/check-*.js`、截图脚本等），见各游戏 README 和 [`AGENTS.md`](AGENTS.md) 的「验证与测试产物」。改了界面，要截桌面和 390px 手机宽度各一张看看。

截图和日志放各游戏的 `docs/validation/`，Git 忽略生成产物；长期基线另行说明。打包后想看线上的样子：

```powershell
npx wrangler dev --assets ./dist --compatibility-date=2025-06-01
# 打开 http://localhost:8787/life-sim/ ；本地看不到顶栏（/nav.js 是 404），正常
```

## 发布

**线上版**：推送 `main`，Cloudflare 自动构建部署。设置（已配好，换环境时才需要）：

- Build command：`node tools/build.js`
- Deploy command：`npx wrangler deploy --name life-sim --assets ./dist --compatibility-date=2025-06-01`
- Worker `life-sim`，路由 `www.vibe-game.com/life-sim*`

**发新版本**：

1. 改版本号：各游戏目录 `game.js` 的 `version`，打包时自动写进页面，不用手写 meta
2. 在 [`CHANGELOG.md`](CHANGELOG.md) 最上面写一节，三个游戏写在同一份里，标题写明是哪个游戏；纯文档或测试改动不用升版本
3. 跑上面的测试
4. 推送，到 Cloudflare 的 Deployments 页面确认构建成功，再打开线上的 `/life-sim/` 看一眼（大厅和三个游戏各点进去一次）
5. 打标签，例如 `1in1.4b-v<版本>`、`jianghuyimeng-v<版本>`、`qunxia-v<版本>`

**回滚**：回到对应标签再推送。

**itch.io 版**（十四亿分之一）：

1. 跑 `node 1in1.4b/tools/build-itch.js --url=<你的 itch 页面地址>`
2. 先用浏览器打开 `dist/itch-1in1.4b/index.html` 试玩一遍
3. 把 `dist/1in1.4b-itch.zip` 上传到 itch.io 项目页，类型选 HTML，勾选“This file will be played in the browser”
4. 更新 itch 页面上的版本说明（内容同 `CHANGELOG.md`）

反馈优先使用顶栏或游戏内入口（`window.VG_FEEDBACK`）。

## 目录

| 位置 | 作用 |
|---|---|
| `index.html` | 大厅 |
| `1in1.4b/`、`jianghuyimeng/`、`qunxia/` | 三个游戏：设定 `game.js`、故事数据 `data/`、翻译 `lang/`、部署配置 `config.js`、各自的 README 和 `docs/SPEC.md` |
| `share/` | 前两个游戏共用的引擎、界面、样式，以及全部工具（`share/tools/`）。改动会影响每个游戏，谨慎 |
| `tools/build.js` | Cloudflare 的打包入口，实际打包在 `share/tools/build.js` |
| `dist/` | 打包产物，不进版本库 |

## 文档

- [`AGENTS.md`](AGENTS.md)：仓库级约束、架构、内容和界面硬约束、验证方法
- [`CHANGELOG.md`](CHANGELOG.md)：更新日志
- 各游戏的 README 和 `docs/SPEC.md`：玩法、状态键、写作要求

# 浮生录

三个纯静态文字游戏，存档保存在浏览器本地。[进入大厅](https://www.vibe-game.com/life-sim/)。

| 游戏 | 玩法 | 开发入口 |
|---|---|---|
| [十四亿分之一](https://www.vibe-game.com/life-sim/1in1.4b/) | 2026年随机出生，经历工作、家庭与养老，收集人生结局 | [README](1in1.4b/README.md) · [规范](1in1.4b/docs/SPEC.md) |
| [江湖一梦](https://www.vibe-game.com/life-sim/jianghuyimeng/) | 重生成射雕三部曲人物，改命影响同一个江湖的下一世 | [README](jianghuyimeng/README.md) · [规范](jianghuyimeng/docs/SPEC.md) |
| [群侠](https://www.vibe-game.com/life-sim/qunxia/) | 无名小卒自由游历、拜师、战斗，收集十四件信物 | [README](qunxia/README.md) · [规范](qunxia/docs/SPEC.md) |

## 本地与开发

用Chrome直接打开根目录或游戏目录的 `index.html`，不需要服务器。前两个游戏共用 `share/` 引擎与界面；群侠有独立引擎和存档，只复用部分公共资源。

开发前读 [CLAUDE.md](CLAUDE.md) 和对应游戏规范。跨仓库的部署、顶栏、画风等规则以 [系列指南](../vibe-game/docs/GUIDE.md) 为准；本地没有时读取[线上版本](https://raw.githubusercontent.com/SHKChan/vibe-game/main/docs/GUIDE.md)。

在仓库根目录运行：

```powershell
node share/tools/simulate.js 1in1.4b 40
node share/tools/simulate.js jianghuyimeng 40
node qunxia/tools/playtest.js 300
node tools/build.js
```

测试必须输出“没有发现问题”。截图和日志放各游戏的 `docs/validation/`，Git忽略生成产物；长期基线另行说明。发布变更见 [CHANGELOG.md](CHANGELOG.md)。

## 部署与反馈

`node tools/build.js` 输出 `dist/life-sim/`。推送 `main` 会触发Cloudflare部署，三个游戏版本号均取自各自 `game.js`。正式站暂时只开中文，支持暗、灰、白主题及手机布局。反馈优先使用顶栏或游戏内入口。

# 群侠

倚天年间的文字武侠RPG。做一个无名小卒，自由游历、拜师、结交同伴、回合制比武，收集十四件信物，按品德走向侠或魔的结局。

[在线游玩](https://www.vibe-game.com/life-sim/qunxia/)。本地直接打开 `index.html`，存档在浏览器。引擎、数据、UI与存档独立于另外两款年度人生游戏；旧 `jianghuyimeng/qunxia/` 网址只跳转。

## 开发

先读根目录 [AGENTS.md](../AGENTS.md)，再读 [docs/SPEC.md](docs/SPEC.md)。文件分工、事件格式、战斗、门派和信物规则集中在SPEC，不在README重复。

命令在仓库根目录执行：

```powershell
node qunxia/tools/playtest.js 300
node tools/build.js
```

playtest必须输出“没有发现问题”，包含静态检查、侠/魔/随机策略和信物路线检查。不要使用 `share/tools/simulate.js qunxia`。

## 界面验收

使用Chrome或内置浏览器打开 `index.html?demo=1`。可组合 `&open=map`、`&fight=1`、`&theme=light|gray`、`&lang=zh`、`&day=134,3`、`&inj=3&mer=1`、`&ev=事件id` 构造场景。

检查桌面与390px手机、地图、战斗和主题；测试截图与日志放 `docs/validation/`，Git忽略生成产物。

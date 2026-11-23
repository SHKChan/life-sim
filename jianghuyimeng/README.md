# 江湖一梦

射雕三部曲共用一个江湖的人生模拟。重生成书中人物，在大事上做选择；改掉的命运会留给这个江湖的后世。

[在线游玩](https://www.vibe-game.com/life-sim/jianghuyimeng/)。本地直接打开 `index.html`，存档保存在浏览器。默认十岁醒来，也可勾选从出生开始；后世受当前江湖纪年限制。1×有事的一年约一分钟，纯闲笔年20秒，可加速或跳到下一个抉择。

## 开发入口

先读根目录 [AGENTS.md](../AGENTS.md)，再读 [docs/SPEC.md](docs/SPEC.md)。纪年、人物格式、关系、跨世改命和结局规则集中在SPEC。早期可玩性任务的实现索引见 [PLAYABILITY-TASKS.md](docs/PLAYABILITY-TASKS.md)，不再作为待办重做。

- `game.js`：设定、版本与界面文案；`config.js`：部署配置。
- `data/world.js`、`relations.js`：世界、标记和人物关系；三部书文件：人物剧情。
- 心愿、图鉴、跨世任务、信物、判定提示和险境各有独立数据文件；加载顺序以 `index.html` 为准。
- 引擎和界面在 `../share/`，这里不复制引擎。

## 检查

在仓库根目录执行：

```powershell
node share/tools/simulate.js jianghuyimeng 40
node share/tools/consequence.js jianghuyimeng guojing --list
node tools/build.js
```

模拟必须输出“没有发现问题”。跨世专属分支还要单独设状态检查。界面用Chrome或内置浏览器验收桌面和390px；截图工具用法见 `share/tools/shot.js` 文件头，输出放 `jianghuyimeng/docs/validation/`（先创建目录，产物不提交）。

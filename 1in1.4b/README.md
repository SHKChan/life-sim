# 十四亿分之一

2026 年出生，按人口比例随机投到一个省市和家庭，从升学、工作、成家走到晚年。钱、住房、同住家人和选择后的回响共同影响人生；符合经历时可以尝试一次改命，并收集结局。

[在线游玩](https://www.vibe-game.com/life-sim/1in1.4b/)。本地直接用 Chrome 打开 `index.html`，不需要服务器，存档保存在浏览器。

开发前先读根目录 [AGENTS.md](../AGENTS.md)，剧情和状态键以 [docs/SPEC.md](docs/SPEC.md) 为准。[资料说明](docs/README.md)解释历史基线和测试产物的用途。

常用命令在仓库根目录执行：

```powershell
node share/tools/simulate.js 1in1.4b 40
node 1in1.4b/tools/check-update.js
node 1in1.4b/tools/check-turning.js
node 1in1.4b/tools/check-echo.js
node 1in1.4b/tools/shot-turning.js
node tools/build.js
```

`simulate` 的 40 轮对应 400 世，必须输出“没有发现问题”。测试截图和日志写入 `docs/validation/`，本地保留、不提交。玩法改动后按 SPEC 重新生成稀有度统计和繁体数据；仅修改文档不需要重跑整套人生模拟。

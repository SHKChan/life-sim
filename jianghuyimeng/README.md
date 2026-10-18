# 江湖一梦

射雕三部曲同一个江湖里的人生模拟。玩法借鉴 *1 in 8 Billion*：重生成书里有名有姓的一个人，从出生活到命终，在原著大事上做选择。改掉的命运会留在这个江湖里，下一世重生到后面的年代还会遇到。

- 时间一年一年地走，1× 时一年约 1 分钟，可以开到 16×（一年约 4 秒），或者直接跳到下一个抉择。
- 抉择用弹框，2–4 个选项。每个选择都会在后面留下痕迹：这一世后面的剧情变了、某个人活下来或死了，或者下一世换个人重生时还会碰到。

## 试玩

用浏览器直接打开本目录的 `index.html`，不需要服务器。存档在浏览器本地。

## 本目录

| 路径 | 内容 |
|---|---|
| `index.html` | 游戏页面，引用 `../share/` 的共用代码 |
| `config.js` | 部署配置：网址、站名、字体 |
| `game.js` | 游戏设定：标题、界面用词、书名颜色、分享文案 |
| `data/world.js` | 年代、地点、年度重心、人生关口、共用人物、通用奇遇、闲笔、改命标记说明 |
| `data/shediao.js` `data/shendiao.js` `data/yitian.js` | 三部书的人物、剧情节点、世界事件、奇遇、闲笔 |
| `docs/SPEC.md` | 内容规范：时间线、数据格式、写作要求 |
| `docs/ref/` | 设计参考截图 |

## 常用命令（在仓库根目录执行）

```bash
node share/tools/simulate.js jianghuyimeng 40                       # 检查全部数据（必须“没有发现问题”）
node share/tools/consequence.js jianghuyimeng guojing --list         # 看郭靖每个选项有没有后果
SIM_DATA=shediao node share/tools/simulate.js jianghuyimeng 40      # 只测射雕
node share/tools/shot.js jianghuyimeng guojing-4-dark out.png       # 截图
node share/tools/build.js jianghuyimeng                             # 打包到 dist/
```

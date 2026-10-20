# Cloudflare 部署约定（life-sim）

> 给负责这个仓库的 Agent 看。你要保证：**推送到 `main` 之后，Cloudflare 能自动构建、部署成功，游戏能在 `https://www.vibe-game.com/life-sim/` 正常打开。**

---

## 1. 整体结构：一个游戏 = 一个仓库 = 一个 Worker

| 仓库 | Cloudflare Worker | 挂在哪 | 说明 |
|---|---|---|---|
| `SHKChan/vibe-game` | `vibe-game` | 自定义域名 `www.vibe-game.com`（兜底所有路径） | 总页面 + 全站外壳 `/nav.js`（顶栏：游戏列表、版本号、问题反馈、定时提醒；游戏登记表） |
| `SHKChan/life-sim`（**本仓库**） | `life-sim` | 路由 `www.vibe-game.com/life-sim*` | 本游戏 |

其他游戏的完整列表见 vibe-game 的 `docs/GUIDE.md`。

- **路由比自定义域名先匹配。** 访问 `/life-sim/...` 会进入本仓库的 Worker，其他路径（`/`、`/nav.js`、别的游戏）由别的 Worker 处理，互不影响。
- 每个 Worker 都开着 **Workers Builds**，连的是自己的仓库，推送到 `main` 就会自动构建和部署。
- **`life-sim`** 是本游戏的网址路径。上线以后不能改。
  - 命名规则：只用小写英文和连字符（古风游戏可以用拼音）。
  - 不能是别的 slug 的前缀，例如 `life` 会把 `life-sim` 的请求也吃掉。
  - 本仓库的 slug：**`life-sim`**

---

## 2. 关键：Worker 收到的是完整路径

请求 `www.vibe-game.com/life-sim/index.html` 时，Worker 会去静态资源里找 **`/life-sim/index.html`**，不是 `/index.html`。

所以上传的目录（`dist/`）**必须多套一层 `life-sim/`**：

```
dist/
└── life-sim/
    ├── index.html
    └── ...（其他 js / css / 图片）
```

- ❌ 直接上传仓库根目录 → 访问 `/life-sim/` 会 404。
- ✅ `dist/life-sim/index.html` 存在 → 访问 `/life-sim` 自动跳转到 `/life-sim/`，然后打开 index.html。

---

## 3. 本仓库的打包方式

浮生录是纯静态的合集（大厅 + 十四亿分之一 + 江湖一梦 + 群侠），没有构建器：

- `tools/build.js` 是统一入口，固定 `SLUG = 'life-sim'`，实际打包在 `share/tools/build.js`：拷页面和引用到的 js/css，给它们加内容哈希，写 `dist/_headers` 缓存规则，并把各游戏的版本号写进页面的 `<meta name="vg:version">`。
- 页面里引用的本地 js/css 会自动打包；游戏目录下的 `fonts/`、`assets/`、`lang/`，以及带 `index.html` 的子目录（例如 `qunxia/`）也会一起打包。
- `SLUG` 要和 Cloudflare 路由保持一致，上线后不要改。

另外：

- `dist/` 已经写进 `.gitignore`，不要提交。
- **不要**在仓库里放 `wrangler.jsonc` / `wrangler.toml`。所有参数都写在 Cloudflare 的命令里。

---

## 4. Cloudflare 上的设置（由用户在 Dashboard 填）

Worker `life-sim` → Settings → Build：

| 项 | 值 |
|---|---|
| Build command | `node tools/build.js` |
| Deploy command | `npx wrangler deploy --name life-sim --assets ./dist --compatibility-date=2025-06-01` |
| Root directory | `/` |
| Build watch paths | 默认 `*` 即可 |

Worker `life-sim` → Domains & Routes → 添加 Route：

- Zone：`vibe-game.com`
- Route：`www.vibe-game.com/life-sim*`

**三处名字必须对上：**

1. `--name` = Worker 名 `life-sim`，不一致会报 name mismatch。
2. `tools/build.js` 里的 `SLUG` = Route 里的路径。
3. `--assets ./dist` = build 脚本的输出目录。

---

## 5. 页面里的约定

- `<head>` 里这两行，全站顶栏（游戏列表、版本号、问题反馈、定时提醒）就有了，游戏自己不用写导航，也**不要做底栏**（屏幕留给游戏）：
  ```html
  <script src="/nav.js" defer></script>
  ```
  - 版本号写在 `game.js` 的 `version`（群侠是 `qunxia/ui.js` 的 `VERSION`），打包时自动变成 `<meta name="vg:version">`，不用手写。顶栏显示它，首页游戏卡也去读它，所以发版不用改 vibe-game。发布新内容改中间位，修 bug 改末位，大改玩法改首位。
  - 铺满整屏、自己不滚动的游戏，容器用 `top: var(--vg-nav-h, 0px)` 给顶栏让位置（顶栏装好后会触发一次 `resize`）。
- 语言：全站翻译暂时只开中文。`share/i18n.js` 里 `LANG_OPEN = false`，一律用中文、不载入谷歌翻译；英日西词表和剧情翻译都留着，以后和 vibe-game 的 `nav.js` 一起改成 `true`。
- 问题反馈：顶栏的“问题反馈”会调用页面里的 `window.VG_FEEDBACK`，打开游戏自带的反馈框（会附上当前进度）；大厅没有它，直接打开 GitHub Issues。
- `<title>` 写成 `游戏名 · Vibe Game`。
- **本游戏自己的文件，一律用相对路径**：`./game.js`、`assets/bg.png`。
  - ❌ 不要写 `/game.js`，它会去找 `www.vibe-game.com/game.js`，那个请求归 vibe-game 的 Worker 处理，结果是 404。
- **全站共用的文件用 `/` 开头**：唯一的例子是 `/nav.js`，它由 vibe-game 的 Worker 提供。
- `localStorage` 的键名要加游戏前缀（例如 `life-sim.save.v1`），因为整个域名下所有游戏共用一个 localStorage。
  - 本仓库的存档键是 `<game.id>.save.v2`（例如 `1in1.4b.save.v2`）。
  - 全站共用、不要动的键：`vibe.lang`（语言）、`vibe.reminder` 和 `vibe.reminder.fired`（定时提醒）。

---

## 6. 上线时还要改另一个仓库（vibe-game）

新游戏要出现在顶栏和总页面上，只需要在 **`SHKChan/vibe-game`** 的 `public/nav.js` 里给 `GAMES` 加一项（顶栏、首页游戏卡都从这里生成），再在 README 的表格里加一行。之后发版不用再改 vibe-game：

```js
{ path: '/life-sim/', repo: 'SHKChan/life-sim', color: '#5ab0e8',
  name: { zh: '…', en: '…', ja: '…', es: '…' },
  tags: { zh: ['…'], en: ['…'] },
  desc: { zh: '…', en: '…' } },
```

全系列的共同约定（顶栏、版本号、主题、语言、画风、检查方法）写在 `vibe-game/docs/GUIDE.md`。做功能之前先读一遍。

---

## 7. 每次推送前的检查清单

- [ ] `node tools/build.js` 能成功执行，生成 `dist/life-sim/index.html`
- [ ] `node share/tools/simulate.js <游戏> 40` 都是“没有发现问题”
- [ ] 本地预览，确认在子路径下能打开、没有 404：
  ```
  npx wrangler dev --assets ./dist --compatibility-date=2025-06-01
  # 然后打开 http://localhost:8787/life-sim/ 和各个游戏
  ```
  （`/nav.js` 在本地是 404，所以看不到顶栏，这是正常的，线上由 vibe-game 的 Worker 提供）
- [ ] 代码里没有以 `/` 开头的本游戏资源路径（`/nav.js` 除外）
- [ ] 发布新内容时改了 `game.js` 的 `version`
- [ ] 推送后，在 Cloudflare 的 Deployments 页面确认构建成功，然后打开 `https://www.vibe-game.com/life-sim/` 实际验证

---

## 8. 交付时告诉用户

```
Worker:         life-sim
Build command:  node tools/build.js
Deploy command: npx wrangler deploy --name life-sim --assets ./dist --compatibility-date=2025-06-01
Route:          www.vibe-game.com/life-sim*
访问地址:        https://www.vibe-game.com/life-sim/
（已在 vibe-game 的 nav.js 的 GAMES 里加上本游戏）
```

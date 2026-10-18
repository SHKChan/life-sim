# 部署

这个仓库里的游戏都是纯静态网站：html、css、js，没有后端，也没有数据库，存档保存在玩家浏览器里。所以任何能放静态文件的地方都能部署。打包后的站点结构：

```
dist/
  index.html          浮生录大厅（仓库根目录的 index.html）
  share/              共用代码
  1in1.4b/            十四亿分之一，访问路径 /1in1.4b/
  jianghuyimeng/      江湖一梦，访问路径 /jianghuyimeng/
```

## 第一步：打包

```bash
node share/tools/build.js                # 全部游戏
node share/tools/build.js jianghuyimeng   # 只打包江湖一梦
```

生成 `dist/` 目录（江湖一梦约 670 KB），里面只有上线需要的文件。css、js 文件名后面会加版本号，更新后浏览器不会读到旧文件。

## 第二步：改配置

上线前改每个游戏目录里的 `config.js`（例如 `1in1.4b/config.js`、`jianghuyimeng/config.js`，或者打包后直接改 `dist/` 里的）。每个游戏有自己的 `config.js`：

| 配置项 | 作用 |
|---|---|
| `siteUrl` | 这个游戏的网址，例如 `https://games.example.com/jianghuyimeng/`。分享出去的文字总结会附上这个链接。 |
| `siteName` | 分享图上的站名，没有网址时显示。 |
| `fontCss` | 网页字体。国内访问不了 Google 字体，默认留空，只用系统自带的楷体、宋体、苹方、微软雅黑。想要书法标题字，可以把字体文件放进游戏目录下的 `fonts/`（或共用的 `share/fonts/`），写一个 `fonts.css`，再把这一项改成它的路径，例如 `'fonts/fonts.css'`。 |

`config.js` 不带版本号、不缓存，上线后可以直接改，不用重新打包。

## 第三步：选一种方式上线

### 方式 A：OSS 静态网站托管（最省事，推荐）

1. 在 OSS 控制台新建 Bucket，读写权限选“公共读”。
2. Bucket → 数据管理 → 静态页面：默认首页填 `index.html`，子目录首页选“开通”。
3. 安装 [ossutil](https://help.aliyun.com/zh/oss/developer-reference/ossutil)（脚本按 1.x 版写），执行 `ossutil config` 填写 AccessKey 和地域。
4. 上传：

   ```bash
   OSS_BUCKET=你的Bucket名 bash deploy/deploy-oss.sh
   ```

   脚本会先打包，再上传，并设置好缓存头：页面和配置不缓存，css、js 长期缓存。
5. 绑定自己的域名：Bucket → Bucket 配置 → 域名管理。国内地域的 Bucket 用 OSS 默认域名打开网页会被强制下载，必须绑定已备案的自定义域名。
6. 访问量大时在域名上开启 CDN 加速，回源到这个 Bucket。

### 方式 B：ECS + Nginx

```bash
node share/tools/build.js
scp -r dist/* root@你的服务器:/usr/share/nginx/html/
scp deploy/nginx.conf root@你的服务器:/etc/nginx/conf.d/jianghu.conf
ssh root@你的服务器 "nginx -t && nginx -s reload"
```

`deploy/nginx.conf` 已经配好 gzip 和缓存头。HTTPS 证书可以在阿里云“数字证书管理服务”免费申请，再在 Nginx 里加 443 端口。

### 方式 C：Docker（容器镜像服务 ACR + ECS / SAE）

```bash
node share/tools/build.js
docker build -t jianghu-yimeng .
docker run -d -p 80:80 jianghu-yimeng
```

推到阿里云容器镜像服务 ACR 后，可以在 ECS、Serverless 应用引擎 SAE 或 ACK 上直接运行。

### 方式 D：Cloudflare（免备案）

适合不想备案的情况。国内能打开，但速度和稳定性不如国内节点，适合小流量。

1. 准备一个自己的域名，把 DNS 托管到 Cloudflare（免费套餐要改 NS）。**不要只用 `*.pages.dev` 或 `*.workers.dev` 的默认域名**，它们在国内经常打不开。
2. 二选一：
   - **Workers 静态资源（推荐）**：以后加反馈接口（`/api/feedback` 转发到 GitHub Issues）可以放在同一个 Worker 里。仓库根目录放一个 `wrangler.jsonc`：
     ```jsonc
     { "name": "vibe-game", "compatibility_date": "2025-06-01", "assets": { "directory": "./dist" } }
     ```
     然后 `node share/tools/build.js && npx wrangler deploy`，再在 Worker 设置里绑定自定义域名。
   - **Pages**：`node share/tools/build.js && npx wrangler pages deploy dist --project-name vibe-game`，或者在控制台连 GitHub 仓库，构建命令填 `node share/tools/build.js`，输出目录填 `dist`。
3. 打包时会生成 `dist/_headers`，Cloudflare 会按它设置缓存：页面和 `config.js` 不缓存，其他文件长期缓存。
4. 每个游戏 `config.js` 的 `siteUrl` 填自定义域名下的地址。

国内访问的要点：
- 免费套餐没有国内节点，国内访客走香港、日本或美国的节点。打开慢一些属于正常，偶尔个别网络会更慢。
- 页面要尽量小，不依赖境外资源。本项目打包后约 700 KB、没有外部依赖、默认不加载 Google 字体，已经满足。
- 网上流传的“优选 IP”做法需要额外配置，也不稳定，这里不推荐。
- 如果后来国内访客多了，可以换成香港地域的服务器（例如阿里云香港轻量应用服务器加 Nginx，见方式 B），同样不用备案，国内访问通常比 Cloudflare 免费套餐稳定。

## 注意

- 用国内地域的服务器或 Bucket 绑定域名，域名必须先完成 ICP 备案。不想备案可以选香港等境外地域。
- 金庸作品仍受版权保护。公开上线前请确认用途（建议非商业）。
- 分享功能：
  - 手机浏览器会调起系统分享面板，图片和文字一起发出去。
  - 不支持的浏览器会复制文字总结，并提供“保存图片”。
  - 在微信内置浏览器里不能直接下载，提示玩家长按图片保存。

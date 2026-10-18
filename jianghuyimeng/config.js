/* 江湖一梦 · 部署配置。上线前按需修改这一个文件即可。 */
window.JY_CONFIG = {
  // 分享文字里附带的网址，例如 'https://jianghu.example.com/'。留空则自动用当前页面地址。
  siteUrl: 'https://www.vibe-game.com/life-sim/jianghuyimeng/',
  // 分享图右下角显示的站名（没有网址时使用）。
  siteName: '江湖一梦',
  // 网页字体的样式表地址。国内访问不了 Google 字体：
  //   留空 ''：只用系统字体（楷体、宋体、苹方、微软雅黑），最快最稳；
  //   填国内镜像或自托管地址：例如 'fonts/fonts.css'。
  // 不写这一项时默认加载 Google 字体（海外访问）。字体都是异步加载，不会卡住页面。
  fontCss: '',
  // 网站导航（每页底部、首页顶上）：所有游戏的总页面、这个合集的大厅。homeUrl 留空就不显示
  homeUrl: 'https://www.vibe-game.com/',
  homeName: 'Vibe Game',
  hubUrl: '../',
  hubName: '浮生录',
  // 问题反馈：'用户名/仓库' 时可以一键提交到 GitHub Issues；feedbackApi 填后端地址时直接 POST（例如 Cloudflare Worker 的 /api/feedback）
  feedbackRepo: 'SHKChan/life-sim',
  feedbackApi: '',
};

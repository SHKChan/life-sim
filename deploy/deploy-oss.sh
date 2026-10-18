#!/usr/bin/env bash
# 一键上传到阿里云 OSS（ossutil 1.x）
# 先装好 ossutil 并执行过 `ossutil config`，然后在仓库根目录执行：
#   OSS_BUCKET=你的bucket名 bash deploy/deploy-oss.sh            打包并上传全部游戏
#   OSS_BUCKET=你的bucket名 bash deploy/deploy-oss.sh jianghuyimeng 只打包这一个（大厅页照样上传）
set -euo pipefail

: "${OSS_BUCKET:?请设置 OSS_BUCKET，例如 OSS_BUCKET=my-games}"
cd "$(dirname "$0")/.."

node share/tools/build.js "$@"

# 先整体上传，带版本号的 css、js 长期缓存
ossutil cp -r -f dist/ "oss://${OSS_BUCKET}/" --meta "Cache-Control:public, max-age=31536000"

# 页面和 config.js 改成不缓存，改完立刻生效
cd dist
find . -name '*.html' | while read -r f; do
  ossutil cp -f "$f" "oss://${OSS_BUCKET}/${f#./}" --meta "Cache-Control:no-cache#Content-Type:text/html; charset=utf-8"
done
find . -name 'config.js' | while read -r f; do
  ossutil cp -f "$f" "oss://${OSS_BUCKET}/${f#./}" --meta "Cache-Control:no-cache#Content-Type:application/javascript; charset=utf-8"
done
echo "已上传到 oss://${OSS_BUCKET}/"

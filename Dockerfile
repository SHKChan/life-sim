# 人生模拟游戏合集 · 静态站点镜像
# 构建：node share/tools/build.js && docker build -t jianghu-yimeng .
# 运行：docker run -d -p 80:80 jianghu-yimeng
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
EXPOSE 80

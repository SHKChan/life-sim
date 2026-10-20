#!/usr/bin/env node
/* 打包：和 vibe-game 其他游戏统一的入口（Cloudflare Build command: node tools/build.js）。
 * Cloudflare Worker life-sim 挂在路由 www.vibe-game.com/life-sim*，
 * Worker 收到的是完整路径（/life-sim/index.html），所以文件放在 dist/life-sim/ 下。
 * 实际打包在 share/tools/build.js（加内容哈希、写 _headers、写版本号）；这里固定 --base=life-sim，其余参数原样传过去。
 */
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

const SLUG = 'life-sim'; // 和 Cloudflare 路由一致，上线后不要改
execFileSync(process.execPath, [path.join(__dirname, '..', 'share', 'tools', 'build.js'), '--base=' + SLUG, ...process.argv.slice(2)], { stdio: 'inherit' });

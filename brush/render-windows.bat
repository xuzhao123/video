@echo off
chcp 65001 >nul
cd /d %~dp0
where node >nul 2>nul || (echo 没找到 Node.js，请先安装：winget install OpenJS.NodeJS.LTS & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo 没找到 ffmpeg，请先安装：winget install Gyan.FFmpeg ，装完重开命令行窗口 & pause & exit /b 1)
if not exist node_modules (
  echo 第一次运行，正在安装依赖……
  call npm install || (pause & exit /b 1)
)
echo 开始渲染，完成后视频在 out\video.mp4
node render.mjs --clip --out=out\video.mp4
pause

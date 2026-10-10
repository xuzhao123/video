# 在 Windows 上渲染

渲染不需要 AI 模型，只需要下面三样软件（只装一次）：

1. **Node.js**：在 PowerShell 里运行 `winget install OpenJS.NodeJS.LTS`
2. **ffmpeg**：运行 `winget install Gyan.FFmpeg`
3. **Google Chrome**：正常安装在默认位置即可

装完后**重新打开**一个命令行窗口，再双击 `render-windows.bat`。

- 第一次运行会自动执行 `npm install` 下载依赖（需要联网）
- 渲染过程中会显示 `frame 25/318  xxx ms/frame`，表示每帧耗时
- 完成后视频在 `out\video.mp4`，配音已经合进去了

## 常见问题

- **提示找不到 Chrome**：Chrome 不在默认位置时，在命令行运行
  `node render.mjs --clip --chrome="你的chrome.exe路径" --out=out\video.mp4`
- **想先快速预览几帧**：
  `node render.mjs --sheet=2,5,8,11 --cols=4 --w=480 --out=out\check.jpg`
- **想用多进程更快地渲染**：
  `node render.mjs --frames --workers=4`，然后运行
  `node render.mjs --encode --audio=assets/pilot.wav --out=out\video.mp4`

## 文件说明

| 文件 | 作用 |
|---|---|
| `src/scenes/pilot.js` | 视频的场景代码（由 Claude 编写） |
| `src/config.js` | 视频时长、节拍、配音文件 |
| `assets/pilot.wav` | 配音 |
| `assets/NotoSansSC.ttf` | 中文字体 |

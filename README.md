# 金融知识库 · 动画视频

把本地「金融知识库」的课程做成带中文配音的动画视频。两种做法，放在两个子目录里：

| 目录 | 引擎 | 画风 | 渲染速度 |
|---|---|---|---|
| [`remotion/`](remotion) | [Remotion](https://www.remotion.dev)（React） | 干净的卡通矢量风，适合图表、文字 | 快，没有显卡也行 |
| [`brush/`](brush) | [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（p5.js + p5.brush） | 手绘水彩、纸张纹理 | 慢，建议用有显卡的电脑 |

场景代码由 Claude 编写；渲染只需要 Node.js、Chrome 和 ffmpeg，不需要 AI 模型。

## remotion/

```bash
cd remotion
npm install
npx remotion studio                                   # 浏览器里预览、拖动时间轴
npx remotion render Pilot out/pilot.mp4               # 样片「资金的搬运」
npx remotion render Lesson01 out/lesson01.mp4         # 第 1 课完整版
```

- 配音稿：`src/<课程>/narration.json`；运行 `node scripts/tts.mjs <课程>` 生成配音（微软 Edge 免费语音）和 `timing.json`，动画会自动跟着配音时长对齐。
- 中文字体在 `public/NotoSansSC.ttf`。

## brush/

Windows 上双击 `brush/render-windows.bat`，详见 [brush/Windows渲染说明.md](brush/Windows渲染说明.md)。

```bash
cd brush
npm install
node render.mjs --clip --out=out/video.mp4            # 有显卡时
node render.mjs --clip --soft-gl --out=out/video.mp4  # 没有显卡（很慢）
```

- 场景代码：`brush/src/scenes/pilot.js`；时长和配音在 `brush/src/config.js`。
- 配音由 remotion 那边生成后拼成一条音轨：
  `node scripts/mixaudio.mjs ../remotion/src/pilot/timing.json ../remotion/public assets/pilot.wav`
- `brush/` 基于 JohnHeibel/ClaudeAnimationBase（MIT 协议），原始说明见 [brush/README.md](brush/README.md)。

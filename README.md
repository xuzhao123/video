# 金融知识库 · 动画视频

把本地「金融知识库」的课程做成带中文配音的动画视频。两种做法，放在两个子目录里：

| 目录 | 引擎 | 画风 | 渲染速度 |
|---|---|---|---|
| [`remotion/`](remotion) | [Remotion](https://www.remotion.dev)（React） | 干净的卡通矢量风，适合图表、文字 | 快，没有显卡也行 |
| [`brush/`](brush) | [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（p5.js + p5.brush） | 手绘水彩、纸张纹理 | 慢，建议用有显卡的电脑 |

场景代码由 Claude 编写；**渲染不需要 AI 模型**，只需要 Node.js、Chrome 和 ffmpeg。

---

## 操作手册（Windows）

### 一、第一次使用：安装软件

只需做一次。打开 **PowerShell**（开始菜单搜索 "PowerShell"），逐行运行：

```powershell
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
winget install Git.Git
```

另外安装 [Google Chrome](https://www.google.com/chrome/)，放在默认位置即可。

装完后**关掉 PowerShell 再重新打开**（新装的软件要重开窗口才能用），检查一下：

```powershell
node -v      # 显示 v20 以上的版本号
ffmpeg -version
git --version
```

三条命令都显示版本号，就说明装好了。

### 二、下载代码

选一个放代码的位置，比如 `D:\`：

```powershell
cd D:\
git clone https://github.com/xuzhao123/video.git
```

完成后会多出一个 `D:\video` 文件夹。如果仓库是私有的，第一次会弹出 GitHub 登录窗口，登录即可。

### 三、渲染手绘版（brush）

**最简单的方式**：打开 `D:\video\brush` 文件夹，**双击 `render-windows.bat`**。

- 第一次运行会自动下载依赖（需要联网，约 1 分钟）
- 渲染时窗口里会不断显示进度，例如 `frame 25/318  850 ms/frame`
  - `25/318`：已渲染 25 帧，共 318 帧
  - `850 ms/frame`：每帧耗时 850 毫秒
- 显示 `wrote out\video.mp4` 就完成了，视频在 `D:\video\brush\out\video.mp4`，配音已经合进去了

**用命令行**（想要更多控制时）：

```powershell
cd D:\video\brush
npm install                                                    # 只需第一次
node render.mjs --clip --out=out\video.mp4                     # 渲染完整视频
node render.mjs --sheet=2,5,8,11 --cols=4 --w=480 --out=out\check.jpg   # 只截 4 帧看看效果，很快
```

**想再快一点：多进程渲染**（先渲染出图片，再合成视频）：

```powershell
node render.mjs --frames --workers=4
node render.mjs --encode --audio=assets/pilot.wav --out=out\video.mp4
```

中途中断也没关系，再次运行 `--frames` 会跳过已经渲染好的帧。

**在浏览器里预览**：用 Chrome 直接打开 `brush\studio.html`，可以拖动时间轴查看任意时刻的画面。

### 四、渲染 Remotion 版（remotion）

```powershell
cd D:\video\remotion
npm install                                         # 只需第一次
npx remotion studio                                 # 在浏览器里预览，可以拖动时间轴、边改边看
npx remotion render Pilot out\pilot.mp4             # 样片「资金的搬运」（约 13 秒）
npx remotion render Lesson01 out\lesson01.mp4       # 第 1 课完整版（约 5 分钟）
```

渲染完成后视频在 `D:\video\remotion\out\` 里。

### 五、获取更新

Claude 改完场景后会推送到这个仓库。你只需要：

```powershell
cd D:\video
git pull
```

然后按上面的步骤重新渲染。

> 如果 `git pull` 提示本地有改动、无法更新：说明你改过某些文件。想放弃本地改动、直接用仓库里的最新版本，运行 `git checkout .` 后再 `git pull`。注意这会丢掉你本地的修改。

### 六、常见问题

| 现象 | 解决办法 |
|---|---|
| 提示"没找到 Node.js"或"没找到 ffmpeg" | 回到第一步安装，**装完要重开窗口** |
| 提示 `Chrome not found` | Chrome 不在默认位置。命令里加上路径：`node render.mjs --clip --chrome="C:\你的路径\chrome.exe" --out=out\video.mp4` |
| `npm install` 很慢或失败 | 检查网络；可以换国内镜像：`npm config set registry https://registry.npmmirror.com` |
| 画面里中文显示成方块 | 确认 `brush\assets\NotoSansSC.ttf` 存在；它在仓库里，`git pull` 一下 |
| 渲染特别慢（每帧几秒以上） | 可能没用上显卡。在 brush 目录运行 `node gpu_probe.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe"`，把输出发给 Claude |
| 其它报错 | 把窗口里的报错文字完整复制下来，发给 Claude |

---

## 给开发者：项目结构

### remotion/

| 路径 | 作用 |
|---|---|
| `src/lesson01/` | 第 1 课：9 个场景（`scenes1~3.tsx`）、配音稿 `narration.json`、配音时长 `timing.json` |
| `src/pilot/` | 样片「资金的搬运」：角色和道具（`actors.tsx`、`draw.tsx`）、时间轴（`Pilot.tsx`） |
| `src/ui.tsx` | 共用的配色、标题、字幕等组件 |
| `scripts/tts.mjs` | 生成配音：`node scripts/tts.mjs <课程>`（微软 Edge 免费语音，默认"晓晓"） |
| `public/` | 中文字体和生成好的配音 |

配音和动画的对齐方式：`tts.mjs` 生成每段配音并记录时长到 `timing.json`，场景按配音时长排出时间轴，所以改了配音稿重新生成后，动画会自动对齐。

### brush/

| 路径 | 作用 |
|---|---|
| `src/scenes/pilot.js` | 样片场景代码 |
| `src/config.js` | 时长、节拍、配音文件 |
| `assets/` | 中文字体、配音 `pilot.wav` |
| `scripts/mixaudio.mjs` | 把 remotion 生成的分段配音拼成一条音轨 |
| `ANIMATION_GUIDE.md` | 原作者的动画规则和完整 API |

配音的来源：先在 remotion 里生成分段配音，再拼成一条：

```bash
cd brush
node scripts/mixaudio.mjs ../remotion/src/pilot/timing.json ../remotion/public assets/pilot.wav
```

`brush/` 基于 JohnHeibel/ClaudeAnimationBase（MIT 协议），原始说明见 [brush/README.md](brush/README.md)。

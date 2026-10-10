// 用法：node scripts/tts.mjs lesson01 [voice]
// 读取 src/<lesson>/narration.json，生成 public/audio/<lesson>/*.mp3，并写出 src/<lesson>/timing.json（每段音频的帧数）
import {EdgeTTS} from 'node-edge-tts';
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const lesson = process.argv[2] ?? 'lesson01';
const voice = process.argv[3] ?? 'zh-CN-XiaoxiaoNeural';
const FPS = 30;
// 用 Remotion 自带的 ffprobe（按当前平台找 compositor 包）
const remotionDir = new URL('../node_modules/@remotion/', import.meta.url);
const compositor = readdirSync(remotionDir).find((d) => d.startsWith('compositor-'));
const ffprobe = new URL(`${compositor}/ffprobe${process.platform === 'win32' ? '.exe' : ''}`, remotionDir).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const scenes = JSON.parse(readFileSync(`src/${lesson}/narration.json`, 'utf8'));
const outDir = `public/audio/${lesson}`;
mkdirSync(outDir, {recursive: true});
const tts = new EdgeTTS({voice, lang: 'zh-CN', rate: '+5%', timeout: 30000});

const timing = [];
for (const [s, segs] of scenes.entries()) {
  const frames = [];
  for (const [i, text] of segs.entries()) {
    const hash = createHash('md5').update(voice + text).digest('hex').slice(0, 8);
    const file = `${outDir}/s${s}-${i}-${hash}.mp3`;
    if (!existsSync(file)) {
      for (let attempt = 1; ; attempt++) {
        try {
          await tts.ttsPromise(text, file);
          break;
        } catch (e) {
          if (attempt >= 3) throw e;
        }
      }
    }
    const sec = Number(execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
    frames.push({src: file.replace(/^public\//, ''), frames: Math.ceil(sec * FPS)});
    console.log(`s${s}-${i}  ${sec.toFixed(1)}s  ${text.slice(0, 20)}…`);
  }
  timing.push(frames);
}
writeFileSync(`src/${lesson}/timing.json`, JSON.stringify(timing, null, 1));

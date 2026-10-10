// 把分段配音按时间点拼成一条 WAV：node scripts/mixaudio.mjs <timing.json> <audioRoot> <out.wav> [leadFrames] [gapFrames]
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const [timingPath, root, out, lead = '14', gap = '6'] = process.argv.slice(2);
const FPS = 30, RATE = 24000;
const segs = JSON.parse(readFileSync(timingPath, 'utf8'))[0];
const tmp = mkdtempSync(join(tmpdir(), 'mix-'));
let t = Number(lead);
const parts = [];
for (const [i, s] of segs.entries()) {
  const wav = join(tmp, `${i}.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(root, s.src), '-ac', '1', '-ar', String(RATE), '-c:a', 'pcm_s16le', wav]);
  const b = readFileSync(wav), o = b.indexOf('data') + 8;
  parts.push({at: Math.round((t / FPS) * RATE), pcm: b.subarray(o)});
  t += s.frames + Number(gap);
}
const total = Math.round(((t - Number(gap) + 34) / FPS) * RATE);
const data = Buffer.alloc(total * 2);
for (const p of parts) p.pcm.copy(data, p.at * 2, 0, Math.min(p.pcm.length, data.length - p.at * 2));
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28);
h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
writeFileSync(out, Buffer.concat([h, data]));
console.log(out, (total / RATE).toFixed(2) + 's');

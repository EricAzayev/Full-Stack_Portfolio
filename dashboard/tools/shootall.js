// Batch screenshotter: starts a static server per project, captures with headless Chrome, kills server.
// Usage: node shootall.js (reads the JOBS array below)
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');      // Full-Stack_Portfolio
const OUT = path.join(__dirname, '..', 'public', 'assets', 'thumbnails');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveJs = path.join(__dirname, 'serve.js');

// jobs: [projectDir, id, page(optional), waitMs, width(optional), apiPort(optional)]
const JOBS = process.argv[2]
  ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  : JSON.parse(fs.readFileSync(path.join(__dirname, 'shotjobs.json'), 'utf8'));

for (const [projDir, id, page = '', wait = 2500, width = 1600, apiPort = '', apiCmd = ''] of JOBS) {
  const root = path.resolve(REPO, projDir, 'dist');
  let api = null;
  if (apiPort && apiCmd) {
    api = spawn('node', apiCmd.split(' '), { cwd: path.resolve(REPO, projDir) });
    await new Promise(r => setTimeout(r, 2500));
  }
  if (!fs.existsSync(path.join(root, 'index.html'))) { console.log(`SKIP ${id} (no dist)`); continue; }
  const port = 9510 + Math.floor(Math.random() * 80);
  const base = `/projects/${id}`;
  const url = `http://localhost:${port}${base}/${page}`;
  const server = spawn('node', [serveJs, root, String(port), base, apiPort], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 900));
  const out = path.join(OUT, `${id}.png`);
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise((resolve) => {
    const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars',
      `--window-size=${width},1000`, `--virtual-time-budget=${wait}`, `--screenshot=${out}`, url];
    const shot = spawn(CHROME, args, { stdio: 'ignore' });
    const cleanup = () => { try { spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} resolve(); };
    shot.on('exit', cleanup);
    setTimeout(() => { try { shot.kill(); } catch {} cleanup(); }, 20000);
  });
  if (api) {
    // Windows: terminate the whole child tree
    try { spawn('taskkill', ['/pid', String(api.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  }
  console.log(`shot: ${id}`);
}
console.log('all done');
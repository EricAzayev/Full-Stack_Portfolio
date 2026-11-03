// Deterministic screenshots via puppeteer-core + the installed Chrome.
// Usage: node cdpshot.js [jobsFile]   (default: shotjobs.json)
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'thumbnails');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveJs = path.join(__dirname, 'serve.js');

const JOBS = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'shotjobs.json'), 'utf8'));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1600, height: 1000 },
});

for (const [projDir, id, page = '', waitMs = 2500, , apiPort = '', apiCmd = ''] of JOBS) {
  const root = path.resolve(REPO, projDir, 'dist');
  if (!fs.existsSync(path.join(root, 'index.html'))) { console.log(`SKIP ${id} (no dist)`); continue; }

  let api = null;
  if (apiPort && apiCmd) {
    // free a squatted port so this job's own server can bind
    try {
      const { execSync } = await import('child_process');
      const out = execSync(`netstat -ano | findstr ":${apiPort} " | findstr LISTENING`).toString();
      const pids = [...new Set(out.trim().split('\n').map(l => l.trim().split(/\s+/).pop()))];
      pids.forEach(pid => { try { spawn('taskkill', ['/pid', pid, '/F'], { stdio: 'ignore' }); } catch {} });
      if (pids.length) await new Promise(r => setTimeout(r, 500));
    } catch {} // findstr finds nothing -> port free
    const cmdArgs = apiCmd.replace(/^node\s+/, '').split(' ');
    api = spawn('node', cmdArgs, { cwd: path.resolve(REPO, projDir) });
    api.stderr.on('data', d => console.log(`[${id} api-err]`, d.toString().trim()));
    api.on('exit', (c) => console.log(`[${id} api-exit]`, c));
    // wait until the API actually answers (up to 10s)
    const up = (port) => new Promise(res => {
      const t = setTimeout(() => res(false), 900);
      import('http').then(({ default: http }) => http.get({ host: 'localhost', port, path: '/' }, r => { r.resume(); clearTimeout(t); res(true); }).on('error', () => {}));
    });
    let ok = false;
    for (let i = 0; i < 14 && !ok; i++) {
      await new Promise(r => setTimeout(r, 700));
      ok = await up(apiPort);
      if (!ok) console.log(`[${id}] probe ${i} false`);
    }
    if (!ok) console.log(`WARN ${id}: API ${apiPort} never answered`);
  }

  const base = `/projects/${id}`;
  const url = api && fs.existsSync(path.join(root, 'index.html'))
    ? `http://localhost:${apiPort}${base}/${page}`   // API server also serves the built frontend
    : null;
  const port = 9510 + Math.floor(Math.random() * 80);
  const server = url ? null : spawn('node', [serveJs, root, String(port), base, apiPort], { stdio: 'ignore' });
  if (!url) await new Promise(r => setTimeout(r, 800));

  try {
    const p = await browser.newPage();
    await p.goto(url || `http://localhost:${port}${base}/${page}`, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, waitMs));
    fs.mkdirSync(OUT, { recursive: true });
    await p.screenshot({ path: path.join(OUT, `${id}.png`) });
    await p.close();
    console.log(`shot: ${id}`);
  } catch (e) {
    console.log(`FAIL ${id}: ${e.message.slice(0, 100)}`);
  }

  if (server) server.kill();
  if (api) { try { spawn('taskkill', ['/pid', String(api.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} }
}

await browser.close();
console.log('all done');
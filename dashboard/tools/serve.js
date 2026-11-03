// Zero-dependency static server with optional URL-prefix strip and API proxy pass-through.
// Usage: node serve.js <rootDir> <port> [stripPrefix] [apiPort]
import http from 'http';
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8900);
const strip = process.argv[4] || '';   // e.g. "/projects/rpg-chess" stripped before resolving in root
const apiPort = process.argv[5] || null; // requests not found in root are proxied to localhost:apiPort

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff'
};

const proxy = (req, res) => {
  if (!apiPort) { res.writeHead(404); return res.end('not found'); }
  const preq = http.request(
    { host: 'localhost', port: apiPort, path: req.url, method: req.method, headers: { host: `localhost:${apiPort}` } },
    pres => { res.writeHead(pres.statusCode, pres.headers); pres.pipe(res); }
  );
  preq.on('error', () => { res.writeHead(502); res.end('api down'); });
  req.pipe(preq);
};

http.createServer((req, res) => {
  const handle = (err, data) => {
    if (err) {
      // Browser navigations (Accept: text/html) get the SPA entry point;
      // everything else (fetch/XHR) falls through to the API proxy.
      if ((req.headers.accept || '').includes('text/html')) {
        return fs.readFile(path.join(root, 'index.html'), (e2, html) => {
          if (e2) return proxy(req, res);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        });
      }
      return proxy(req, res);
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  };
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (strip && p.startsWith(strip)) p = p.slice(strip.length) || '/';
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, handle);
}).listen(port, () => console.log(`serving ${root} on ${port} (strip=${strip}, api=${apiPort || 'none'})`));
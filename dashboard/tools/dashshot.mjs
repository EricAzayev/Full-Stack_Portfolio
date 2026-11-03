import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1600, height: 1000 },
});
const p = await b.newPage();
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));
await p.screenshot({ path: process.env.TEMP + '/dash1.png' });
await p.evaluate(() => window.scrollBy(0, 900));
await new Promise(r => setTimeout(r, 1200));
await p.screenshot({ path: process.env.TEMP + '/dash2.png' });
await p.evaluate(() => window.scrollBy(0, 1600));
await new Promise(r => setTimeout(r, 1200));
await p.screenshot({ path: process.env.TEMP + '/dash3.png' });
console.log('shots saved');
await b.close();

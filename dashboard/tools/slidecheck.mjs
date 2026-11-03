import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--disable-gpu', '--hide-scrollbars'], defaultViewport: { width: 1600, height: 1000 } });
const p = await b.newPage();
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
for (let i = 1; i <= 3; i++) {
  await p.click('.nav-next');
  await new Promise(r => setTimeout(r, 2500));
  await p.screenshot({ path: process.env.TEMP + `/slide${i}.png` });
}
console.log('done'); await b.close();

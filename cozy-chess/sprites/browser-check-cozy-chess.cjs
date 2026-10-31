const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.join(__dirname, 'cozy-chess-work');
const server = http.createServer((req, res) => {
  let pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filename = path.resolve(root, '.' + pathname);
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(filename, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    const ext = path.extname(filename);
    res.setHeader('Content-Type', { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp' }[ext] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true });
  try {
    const context = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:1, serviceWorkers:'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/cozy-chess/`);
    await page.waitForFunction(() => [...document.querySelectorAll('#titleArt img')].length === 3 && [...document.querySelectorAll('#titleArt img')].every(i => i.complete && i.naturalWidth === 512 && i.src.endsWith('.webp')));
    await page.locator('#pvpBtn').click();
    await page.waitForFunction(() => document.querySelectorAll('#board img').length === 32 && [...document.querySelectorAll('#board img')].every(i => i.complete && i.naturalWidth === 512));
    await page.screenshot({ path:path.join(__dirname, 'cozy-chess-board.png'), fullPage:true });
    for (const sq of [52,36,11,27,36,27]) await page.locator(`.sq[data-i="${sq}"]`).click();
    await page.waitForFunction(() => document.querySelector('#battle').classList.contains('impact'));
    await page.waitForFunction(() => [...document.querySelectorAll('#battle .fighter img')].every(i => i.complete && i.naturalWidth === 512));
    assert.match(await page.locator('.fighter.atk img').getAttribute('src'), /white_pawn_attack.webp$/);
    assert.match(await page.locator('.fighter.def img').getAttribute('src'), /black_pawn_hurt.webp$/);
    await page.screenshot({ path:path.join(__dirname, 'cozy-chess-battle.png'), fullPage:true });
    await page.waitForFunction(() => document.querySelectorAll('#board img').length === 31);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile browser loaded all 32 board sprites and capture cinematic switched to attack/hurt sprites; no JS errors');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });

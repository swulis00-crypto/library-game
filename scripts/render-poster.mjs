/**
 * design/poster-a4.html → 인쇄용 A4 포스터
 *   public/poster/book-trail-poster-a4.png  (2480 x 3508, 300dpi)
 *   public/poster/book-trail-poster-a4.pdf  (A4, 여백 없음)
 *
 * 사용법: node scripts/render-poster.mjs
 *  - playwright, qrcode 패키지 필요 (npm i -D playwright qrcode). 설치된 폴더에서 실행해도 된다.
 *  - 게임 화면 캡처(design/poster/shots/*.png)가 먼저 있어야 한다.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const htmlPath = path.join(root, 'design', 'poster-a4.html');
const outDir = path.join(root, 'public', 'poster');
const SITE_URL = 'https://swulis00-crypto.github.io/library-game/';

let chromium, QRCode;
for (const base of [root + path.sep, process.cwd() + path.sep]) {
  try {
    const req = createRequire(base);
    chromium = req('playwright').chromium;
    QRCode = req('qrcode');
    break;
  } catch (e) { /* 다음 후보 */ }
}
if (!chromium || !QRCode) {
  console.error('playwright 와 qrcode 가 필요합니다: npm i -D playwright qrcode');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const qrSvg = await QRCode.toString(SITE_URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0f172a', light: '#ffffff' } });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3.125 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate((svg) => { document.getElementById('qr').innerHTML = svg; }, qrSvg);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const png = path.join(outDir, 'book-trail-poster-a4.png');
await page.screenshot({ path: png, type: 'png', clip: { x: 0, y: 0, width: 794, height: 1123 } });

const pdf = path.join(outDir, 'book-trail-poster-a4.pdf');
await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

await browser.close();
console.log('포스터 저장:', png, '\n          ', pdf);

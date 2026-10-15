/**
 * design/og-image.html 을 1200x630 PNG(public/og-image.png)로 렌더링한다.
 *
 * 사용법:  node scripts/render-og.mjs
 *  - playwright 가 필요하다. 프로젝트에 없으면 설치된 폴더에서 실행해도 된다:
 *      cd <playwright 가 설치된 폴더> && node "<이 프로젝트>/scripts/render-og.mjs"
 *  - 설치된 Chrome(channel: 'chrome')을 사용하므로 브라우저 다운로드가 필요 없다.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const htmlPath = path.join(root, 'design', 'og-image.html');
const outPath = path.join(root, 'public', 'og-image.png');

let chromium;
for (const base of [root + path.sep, process.cwd() + path.sep]) {
  try { ({ chromium } = createRequire(base)('playwright')); break; } catch (e) { /* 다음 후보 */ }
}
if (!chromium) {
  console.error('playwright 를 찾을 수 없습니다. `npm i -D playwright` 후 다시 실행하세요.');
  process.exit(1);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('OG 이미지 저장:', outPath);

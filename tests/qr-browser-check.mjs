import { createRequire } from 'node:module';
import { createSiteServer } from '../server.mjs';
import assert from 'node:assert/strict';
const require = createRequire('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const { chromium } = require('playwright');
const server=createSiteServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(async()=>{
  const {videoQRMarkup,mountVideoQR}=await import('/src/components/video-qr.js');
  const host=document.createElement('div');host.style='position:fixed;inset:60px auto auto 60px;z-index:9999';
  host.innerHTML=videoQRMarkup({title:'二维码验证',mediaType:'video',bilibili:'BV1xx411c7mD'},[]);document.body.append(host);mountVideoQR(host);
 });
 await page.locator('.qr-trigger').hover();
 await page.waitForTimeout(250);
 assert.equal(await page.locator('.qr-trigger').getAttribute('aria-expanded'),'true');
 for(const format of ['svg','png']) {
  const downloadPromise=page.waitForEvent('download');
  await page.locator(`[data-qr-download="${format}"]`).click();
  const download=await downloadPromise; assert.equal(await download.failure(),null);
  await download.saveAs(`tests/qr-check.${format}`);
 }
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('.qr-trigger').getAttribute('aria-expanded'),'false');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.qr-trigger').click();
 assert.equal(await page.locator('.qr-trigger').getAttribute('aria-expanded'),'true');
 const rect=await page.locator('.qr-panel').boundingBox();assert(rect.width<=342);
 console.log('Browser checks passed: hover, Escape, mobile click, SVG and PNG downloads.');
} finally {await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

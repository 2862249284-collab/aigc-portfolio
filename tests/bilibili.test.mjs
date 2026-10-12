import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bilibiliURL, uniqueBilibiliURL } from '../src/lib/bilibili.js';
import { videoQRMarkup, qrSVG } from '../src/components/video-qr.js';

// Fixtures exercise encoding only; these are never published as portfolio works.
const first = 'BV1xx411c7mD', second = 'BV1Q541167Qg';
test('only video links pass, tracking is stripped and part selection survives', () => {
  assert.equal(bilibiliURL(first), `https://www.bilibili.com/video/${first}/`);
  assert.equal(bilibiliURL(`http://m.bilibili.com/video/${first}?p=2&share_source=copy`), `https://www.bilibili.com/video/${first}/?p=2`);
  for (const input of ['', null, 'javascript:alert(1)', 'https://space.bilibili.com/123', 'https://b23.tv/abcd', 'https://www.bilibili.com/', `https://bilibili.com.evil.com/video/${first}`, `https://user@bilibili.com/video/${first}`, `https://bilibili.com/video/${first}?p=abc`]) assert.equal(bilibiliURL(input), '', String(input));
});
test('each work encodes its own link and duplicate links cannot generate shared QR', () => {
  const a = {title:'A',mediaType:'video',bilibili:first}, b = {title:'B',mediaType:'video',bilibili:second};
  assert.notEqual(qrSVG(bilibiliURL(first)), qrSVG(bilibiliURL(second)));
  assert(videoQRMarkup(a,[a,b]).includes(bilibiliURL(first)));
  assert(!videoQRMarkup(a,[a,b]).includes(bilibiliURL(second)));
  assert.equal(uniqueBilibiliURL(a,[a,{...b,bilibili:bilibiliURL(first)}]), '');
  assert(!videoQRMarkup({...a,bilibili:''},[]).includes('<svg'));
  assert(!videoQRMarkup({...a,bilibili:'https://space.bilibili.com/1'},[]).includes('<svg'));
  const html = videoQRMarkup({...a,title:'<script>alert(1)</script>'},[]);
  assert(!html.includes('<script>')); assert(html.includes('data-qr-download="png"')); assert(html.includes('data-qr-download="svg"'));
});

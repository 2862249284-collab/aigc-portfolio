import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {ips,ipScenes,ipGalleryItems} from '../src/data/ips.js';
import {ipOverviewMarkup,ipDetailMarkup} from '../src/pages/ip.js';
import {resolveRoute} from '../src/lib/routes.js';
const fileFor=url=>new URL('../public'+decodeURIComponent(url),import.meta.url);
test('four source-backed IP characters have unique deep links and matching boards',async()=>{
 assert.deepEqual(ips.map(w=>w.title),['凛芽','岚斗','雾璃','暖柚']);
 const all=new Set();
 for(const work of ips){
  assert.equal(resolveRoute(`/works/ip/${work.id}`).work,work);
  assert.equal(work.gallery.length,2);assert(work.gallery.every(b=>decodeURIComponent(b.src).includes(work.title)));
  for(const src of [work.media,...work.gallery.flatMap(b=>[b.src,b.preview])]){all.add(src);assert((await stat(fileFor(src))).size>0);}
  const png=await readFile(fileFor(work.media));assert.equal(png[25],2,'Original RGB board is required');assert.equal(work.media,work.gallery[0].src);
  const html=ipDetailMarkup(work);assert(html.includes('IP 总览'));assert(html.includes('aria-current="page"'));assert(!html.includes('2026'));
 }
});
test('overview connects exactly four figures and four independent scene originals',async()=>{
 const html=ipOverviewMarkup();assert(html.includes('data-carousel="ip"'));assert(!html.includes('ip-orbit'));assert.equal(ipGalleryItems.length,8);assert.equal(new Set(ipGalleryItems.map(w=>w.media)).size,8);assert.deepEqual(ipGalleryItems.map(w=>w.kind),[...Array(4).fill('character'),...Array(4).fill('scene')]);
 assert.equal(ipScenes.length,4);
 assert.equal(new Set(ipScenes.map(s=>s.src)).size,4);
 for(const scene of ipScenes)for(const src of [scene.src,scene.preview])assert((await stat(fileFor(src))).size>0);
});

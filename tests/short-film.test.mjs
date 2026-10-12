import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {shortFilmMarkup,shortFilmEmbedURL} from '../src/pages/short-film.js';
import {worksFor} from '../src/data/works.js';
import {categories} from '../src/data/categories.js';
test('short film binds supplied BV to its own characters, scene and props',async()=>{
 const work=worksFor('short-film').find(w=>w.id==='grandpa');assert.equal(work.bilibili,'BV1wfpv6FEPx');assert.deepEqual(work.characters.map(c=>c.name),['爷爷','成年孙子']);
 for(const item of [...work.characters,...work.assets.environments,...work.assets.props])assert((await stat(new URL('../public'+item.src,import.meta.url))).size>0);
 const html=shortFilmMarkup(categories.find(c=>c.id==='short-film'),work);
 const markers=['data-film-player','id="film-characters"','aria-label="场景设计"','aria-label="道具设计"'];let position=-1;for(const marker of markers){const next=html.indexOf(marker);assert(next>position);position=next;}assert(!html.includes('<iframe'));assert(!html.includes('三视图展示'));
});
test('official embed is muted, opt-in and rejects unrelated destinations',()=>{
 const url=new URL(shortFilmEmbedURL('BV1wfpv6FEPx'));assert.equal(url.hostname,'player.bilibili.com');assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(url.searchParams.get('muted'),'1');assert.equal(shortFilmEmbedURL('https://example.com/a'),'');
});
test('short film overview uses the Banner carousel with two real works',()=>{
 const html=shortFilmMarkup(categories.find(c=>c.id==='short-film'));
 assert(html.includes('video-carousel'));assert(html.includes('poster-stage'));assert(!html.includes('<iframe'));
 assert.equal(worksFor('short-film').length,2);
 assert.equal(worksFor('short-film').find(w=>w.id==='zongxiang').bilibili,'BV1Copv6hEKQ');
});

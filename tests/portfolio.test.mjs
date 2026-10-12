import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categories } from '../src/data/categories.js';
import { works, worksFor, findWork } from '../src/data/works.js';
import { resolveRoute } from '../src/lib/routes.js';
import { wrap, assetURL, escapeHTML } from '../src/lib/dom.js';
import { categoryMarkup } from '../src/pages/category.js';
import { detailMarkup } from '../src/pages/detail.js';
import { createSiteServer, parseRange } from '../server.mjs';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { backgroundFrames, backgroundAssignments } from '../src/data/backgrounds.js';
import { disciplineBarMarkup } from '../src/components/discipline-bar.js';

test('eight exact categories, routes and honest empty states',()=>{
  assert.deepEqual(categories.map(c=>c.name),['海报','Banner','IP','短片','漫剧','TVC','AI真人','游戏']);
  for(const category of categories){
    const route=resolveRoute(`/works/${category.id}/`);assert.equal(route.type,'category');assert.equal(route.category,category);
    assert.equal(resolveRoute(`/works/${category.id}/${category.id}-preview`).type,'not-found');
    assert.equal(findWork(category.id,'nonexistent'),null);
    if(!worksFor(category.id).length){assert(categoryMarkup(category).includes('0 件作品'));assert(!categoryMarkup(category).includes('project-card'));assert(categoryMarkup(category).includes('尚未上传作品'));}
  }
  assert(worksFor('poster').length>0);assert(works.every(work=>categories.some(category=>category.id===work.category)));
  assert.equal(resolveRoute('/works/unknown').type,'not-found');assert.equal(resolveRoute('/works/poster/missing').type,'not-found');
  assert.equal(resolveRoute('/works/%zz').type,'not-found');
});
test('bidirectional orbit wraps and asset paths cannot inject markup or scripts',()=>{
  assert.equal(wrap(-1,8),7);assert.equal(wrap(8,8),0);assert.equal(wrap(81,8),1);
  assert.equal(assetURL('javascript:alert(1)'), '');assert.equal(assetURL('//unknown.com/file'),'');assert.equal(assetURL('/assets/a.mp4'),'/assets/a.mp4');
  assert.equal(escapeHTML('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});
test('real image and video records render without autoplay or preloading',()=>{
  const image={id:'test',title:'真实作品',category:'ip',year:2026,description:'描述',mediaType:'image',media:'/assets/works/ip/main.webp',gallery:[{src:'/assets/works/ip/side.webp',caption:'三视图'}],tools:['Blender']};
  const html=detailMarkup(image,categories[2]);assert(html.includes('main.webp'));assert(html.includes('side.webp'));assert(html.includes('loading="lazy"'));assert(html.includes('三视图'));
  const video=detailMarkup({...image,mediaType:'video',media:'/assets/works/tvc/film.mp4',cover:'/assets/works/tvc/cover.webp'},categories[5]);
  assert(video.includes('preload="none"'));assert(video.includes('controls playsinline'));assert(video.includes('data-fullscreen'));assert(!video.includes('autoplay'));
});
test('server supports deep links, preserved PLATE, assets, ranges and missing resources',async()=>{
  const server=createSiteServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const category of categories){const response=await fetch(`${origin}/works/${category.id}`);assert.equal(response.status,200);assert((await response.text()).includes('/src/app.js'));}
    const detail=await fetch(`${origin}/works/ip/ip-preview`);assert.equal(detail.status,200);
    const legacy=await fetch(`${origin}/plate/`);assert((await legacy.text()).includes('id="v1"'));
    const resource=await fetch(`${origin}/vendor/three/three.module.js`);assert.equal(resource.status,200);assert(resource.headers.get('content-type').includes('javascript'));
    const partial=await fetch(`${origin}/portfolio.css`,{headers:{Range:'bytes=0-19'}});assert.equal(partial.status,206);assert.equal((await partial.arrayBuffer()).byteLength,20);
    assert.equal((await fetch(`${origin}/assets/missing.mp4`)).status,404);
    assert.equal((await fetch(`${origin}/.env`)).status,404);
    assert.equal((await fetch(`${origin}/src/%2e%2e%5cpackage.json`)).status,403);
    assert.equal((await fetch(`${origin}/portfolio.css`,{headers:{Range:'bytes=99999999-'}})).status,416);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
test('range parser handles suffixes and bounds',()=>{
  assert.deepEqual(parseRange('bytes=-10',100),{start:90,end:99});assert.deepEqual(parseRange('bytes=90-1000',100),{start:90,end:99});assert.equal(parseRange('bytes=100-',100),null);assert.equal(parseRange('bytes=10-3',100),null);
});
test('all backgrounds are real original-video frames with verifiable source and assignment',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public/assets/backgrounds/manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.frames.length,8);assert.deepEqual(manifest.resolution,[1280,720]);assert.equal(manifest.fps,24);
  const source=await readFile(new URL('../public/assets/source/plate-original.mp4',import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'),manifest.sourceSHA256);
  for(const frame of manifest.frames){
    const file=await readFile(new URL(`../public/assets/backgrounds/${frame.file}`,import.meta.url));
    assert.equal(file.toString('ascii',0,4),'RIFF');assert.equal(file.toString('ascii',8,12),'WEBP');assert.equal(file.length,frame.bytes);
  }
  assert.equal(backgroundFrames.length,8);assert.equal(backgroundAssignments.hero,7);
  for(const category of categories)assert(Number.isInteger(backgroundAssignments.categories[category.id]));
});

test('real records in all eight galleries link to details and category neighbors',()=>{
 const original=works.splice(0);try {
  for(const category of categories){
   const records=[0,1,2].map(i=>({id:`qa-${i}`,title:`测试 ${i}`,category:category.id,year:2026,description:'测试数据',cover:'/assets/test.webp',mediaType:category.medium,media:'/assets/test.webp',gallery:[],brand:'测试品牌',duration:'01:30'}));
   works.push(...records);
   assert.equal(worksFor(category.id).length,3);
   const html=categoryMarkup(category);assert(html.includes(`/works/${category.id}/qa-1`));assert(html.includes('01:30'));
   assert.equal(resolveRoute(`/works/${category.id}/qa-1`).work,records[1]);
   const detail=detailMarkup(records[1],category);assert(detail.includes(`/works/${category.id}/qa-0`));assert(detail.includes(`/works/${category.id}/qa-2`));
  }
 }finally{works.splice(0,works.length,...original);}
});

test('poster carousel markup, infinite wrap and side-click routing', async () => {
  const { posterMarkup, posterState } = await import('../src/components/poster-carousel.js');
  const html = posterMarkup();
  assert(html.includes('poster-stage'));
  assert(html.includes('poster-next'));
  assert(html.includes('POSTER DESIGN'));
  assert(html.includes('海报作品'));
  assert(html.includes('poster-viewer'));
  // The discipline switcher now lives in a shared bar above every work surface,
  // so the carousel itself no longer carries the eight category links.
  const bar = disciplineBarMarkup('poster');
  for (const c of categories) {
    assert(bar.includes(`/works/${c.id}`));
  }
  assert(bar.includes('is-active'), 'the current discipline must be highlighted');
  // The dialog must contain prev/next controls so fullscreen viewers can step.
  const dialogMatch = html.match(/<dialog[^>]*>([\s\S]*?)<\/dialog>/);
  assert(dialogMatch, 'dialog markup must be present');
  const dialogInner = dialogMatch[1];
  assert(dialogInner.includes('data-step="-1"'));
  assert(dialogInner.includes('data-step="1"'));

  // Index wraparound in both directions and across arbitrary bounds.
  assert.equal(wrap(-1, 8), 7);
  assert.equal(wrap(0, 8), 0);
  assert.equal(wrap(7, 8), 7);
  assert.equal(wrap(8, 8), 0);
  assert.equal(wrap(81, 8), 1);

  // The carousel exposes a tiny public surface: markup + state.
  assert.equal(typeof posterState, 'object');
  assert('index' in posterState);
});

test('poster data file mirrors the actual assets folder with friendly titles', async () => {
  const { posters } = await import('../src/data/posters.js');
  const { readdir } = await import('node:fs/promises');
  assert.ok(posters.length >= 1, 'expected at least one poster in the assets folder');
  const files = (await readdir(new URL('../public/assets/works/poster/', import.meta.url)))
    .filter(name => /\.(png|jpe?g|webp|avif)$/i.test(name) && name !== '.gitkeep');
  assert.equal(posters.length, files.length, 'every poster file should appear in posters.js');
  const ids = new Set(posters.map(p => p.id));
  assert.equal(ids.size, posters.length, 'poster ids should be unique');
  for (const record of posters) {
    assert(record.title.length <= 32, `title "${record.title}" is too long`);
    assert(!record.title.includes('ChatGPT'), 'titles should not echo ChatGPT metadata');
    assert(record.cover.startsWith('/assets/works/poster/'));
    assert(record.media.startsWith('/assets/works/poster/'));
  }
});

test('image carousel markup adapts to every image discipline', async () => {
  const { carouselMarkup, carouselState } = await import('../src/components/image-carousel.js');
  assert.equal(typeof carouselState, 'object');
  for (const id of ['poster', 'banner', 'ip']) {
    const category = categories.find(c => c.id === id);
    const html = carouselMarkup(category);
    assert(html.includes(`data-carousel="${id}"`), `${id} carousel must carry its own marker`);
    assert(html.includes(category.name), `${id} carousel must show the discipline name`);
    assert(html.includes(escapeHTML(category.english)), `${id} carousel must show the English label`);
    assert(html.includes('poster-stage'));
    assert(html.includes('poster-slide') === false, 'slides are created at mount time, not in markup');
    assert(html.includes('poster-viewer'));
    assert(html.includes('退出画廊'), 'every gallery needs an explicit exit');
    assert(html.includes('/#work-orbit'), 'exit must lead back to the orbit');
  }
});

test('the discipline bar lists all eight categories and flags the active one', () => {
  for (const category of categories) {
    const html = disciplineBarMarkup(category.id);
    assert.equal((html.match(/class="discipline-link/g) || []).length, 8);
    assert(html.includes(`href="/works/${category.id}"`));
    assert(html.includes(`class="discipline-link is-active" data-route href="/works/${category.id}"`), `${category.id} must be highlighted`);
    assert(html.includes('aria-current="page"'));
  }
});

test('video details fold only the asset modules that actually have material', () => {
  const category = categories.find(c => c.id === 'short-film');
  const work = {
    id: 'qa-film-01', title: '测试影片', category: 'short-film', year: 2026,
    description: '用于验证资产折叠模块。', cover: '/assets/test.webp', mediaType: 'video', media: '/assets/test.mp4',
    gallery: [], tools: [],
    assets: {
      characters: [{ src: '/assets/char-1.webp', caption: '角色 A' }],
      environments: [],
      props: [{ src: '/assets/prop-1.webp', caption: '' }]
    }
  };
  const original = works.splice(0);
  try {
    works.push(work);
    const html = detailMarkup(work, category);
    assert(html.includes('data-asset="characters"'), 'populated modules must render');
    assert(html.includes('data-asset="props"'));
    assert(!html.includes('data-asset="environments"'), 'empty modules must be dropped');
    assert(html.includes('CHARACTERS') && html.includes('人物资产'));
    assert(html.includes('01 项'), 'each module shows its asset count');
    assert(html.includes('角色 A'), 'captions are preserved');
    assert(html.includes('video-shell'), 'video disciplines render the native player');
  } finally {
    works.splice(0, works.length, ...original);
  }
});

test('a detail page without assets renders no asset section at all', () => {
  const category = categories.find(c => c.id === 'tvc');
  const work = {
    id: 'qa-tvc-01', title: '无资产项目', category: 'tvc', year: 2026,
    description: '', cover: '/assets/test.webp', mediaType: 'video', media: '/assets/test.mp4',
    gallery: [], tools: []
  };
  const original = works.splice(0);
  try {
    works.push(work);
    const html = detailMarkup(work, category);
    assert(!html.includes('asset-modules'), 'no material means no folded section');
    assert(!html.includes('data-asset='));
  } finally {
    works.splice(0, works.length, ...original);
  }
});

test('the home APP entry keeps its copy and never emits a dead link', async () => {
  const { appEntryMarkup } = await import('../src/components/app-card.js');
  const { appSite } = await import('../src/data/app.js');
  const html = appEntryMarkup();
  assert(html.includes(appSite.title));
  assert(html.includes('APP DOWNLOAD WEBSITE'));
  assert(html.includes('Product / Interface / Experience'));
  assert(!html.includes('<dialog'), 'no intermediate APP preview');
  assert(html.includes(`href="${appSite.siteUrl}" target="_blank"`));
  const original=appSite.siteUrl;try{appSite.siteUrl='';assert(appEntryMarkup().includes('aria-disabled="true"'));assert(!appEntryMarkup().includes('href='));}finally{appSite.siteUrl=original;}
  if (!appSite.siteUrl) {
    assert(html.includes('data-app-external') === false, 'no external link before a URL is provided');
  }
});

test('orbit nodes navigate directly with no explore detour', async () => {
  const { orbitMarkup } = await import('../src/components/orbit.js');
  const html = orbitMarkup();
  assert(!html.includes('orbit-open'), 'the explore button must be gone');
  assert(!html.includes('探索这一领域'));
  for (const c of categories) {
    assert(html.includes(`href="/works/${c.id}" data-route`), `${c.id} node must link straight to its gallery`);
  }
  assert(html.includes('点击分类直接进入作品'));
});

test('work surfaces never render dates or timestamps', async () => {
  const { categoryMarkup } = await import('../src/pages/category.js');
  const { detailMarkup } = await import('../src/pages/detail.js');
  const { posters } = await import('../src/data/posters.js');
  const dated = { id:'dated-1', title:'带日期的记录', category:'tvc', year:2026, description:'描述',
    cover:'/assets/test.webp', mediaType:'video', media:'/assets/test.webp', gallery:[], placeholder:false };
  for (const surface of [categoryMarkup(categories.find(c=>c.id==='tvc'),), detailMarkup(dated, categories.find(c=>c.id==='tvc'))]) {
    assert(!surface.includes('2026'), 'years must not be displayed');
    assert(!surface.includes('年份待填写'));
    assert(!surface.includes('待上传'));
  }
  for (const poster of posters) {
    assert(!/\d{2}[.:/]\d{2}/.test(poster.title), `title "${poster.title}" looks like a date`);
  }
});

test('banner imports preserve original files and separate layout from posters',async()=>{
 const {banners}=await import('../src/data/banners.js');
 const {bannerMarkup}=await import('../src/components/banner-carousel.js');
 const {readdir}=await import('node:fs/promises');
 const filenames=(await readdir(new URL('../public/assets/works/banner/',import.meta.url))).filter(f=>/\.(png|jpe?g|webp|avif)$/i.test(f));
 assert.equal(banners.length,filenames.length);
 for(const banner of banners){assert(filenames.includes(banner.sourceFile));assert(!/2026/.test(banner.title));assert.equal(resolveRoute(`/works/banner/${banner.id}`).work,banner);}
 const html=bannerMarkup(categories.find(c=>c.id==='banner'));assert(html.includes('data-carousel="banner"'));assert(!html.includes('滚轮切换 ·'));
});

test('automatic intro uses original local video and no scroll-driven iframe',async()=>{
 const {openingMarkup}=await import('../src/components/opening.js');const html=openingMarkup();
 assert(html.includes('muted playsinline'));assert(html.includes('preload="none"'));assert(!html.includes('<source'));assert(html.includes('poster="/assets/backgrounds/01-street.webp"'));assert(html.includes('跳过 INTRO'));assert(!html.includes('<iframe'));
});

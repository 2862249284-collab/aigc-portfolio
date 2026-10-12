import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {videoProjects} from '../src/data/video-projects.js';
import {videoCovers} from '../src/data/video-covers.js';

const readJSON=name=>JSON.parse(readFileSync(new URL(`../docs/video-covers/${name}.json`,import.meta.url),'utf8'));
const results=readJSON('results'),sources=readJSON('sources'),candidates=readJSON('candidates');

test('all 15 projects and 20 episodes bind to their own verified real-frame covers',()=>{
 assert.equal(results.length,25);
 assert.equal(new Set(results.map(r=>r.file)).size,25);
 const labels={'short-film':'AI短片','comic-drama':'AI漫剧',tvc:'TVC','ai-live-action':'AI真人',game:'游戏'};
 for(const work of videoProjects){
  const original=sources.find(s=>s.id===work.id);
  const main=results.find(r=>r.file===work.cover);
  assert.equal(main.projectId,work.id);assert.equal(main.episode,null);
  assert.equal(main.titleLines.join(''),work.title);assert.equal(main.category,labels[work.category]);
  for(const ep of work.episodes){
   assert.equal(ep.cover,videoCovers[work.id].episodes[ep.id]);
   const result=results.find(r=>r.file===ep.cover);
   assert.equal(result.sourceEpisode,ep.id);assert.equal(result.title,work.title);
   assert.equal(ep.bilibili||null,original.episodes.find(e=>e.id===ep.id).bilibili);
   assert.equal(result.episode,work.episodes.length>1?ep.number:null);
   const frames=candidates.find(c=>c.episodeId===ep.id);
   assert.deepEqual(frames.candidates.map(c=>c.percentage),[20,40,60,80]);
   assert(frames.candidates.some(c=>c.seconds===result.seconds));
   assert.equal(frames.sourceSha256,result.sourceSha256);
  }
  if(work.episodes.length>1)assert.equal(new Set(work.episodes.map(ep=>results.find(r=>r.file===ep.cover).sha256)).size,work.episodes.length);
 }
});

test('published covers are intact 1920x1080 WebP files with sRGB profiles and bounded titles',()=>{
 for(const result of results){
  const buffer=readFileSync(new URL('../public'+result.file,import.meta.url));
  assert.equal(buffer.toString('ascii',0,4),'RIFF');assert.equal(buffer.toString('ascii',8,12),'WEBP');
  assert.equal(buffer.toString('ascii',12,16),'VP8X');
  assert.equal(buffer.readUIntLE(24,3)+1,1920);assert.equal(buffer.readUIntLE(27,3)+1,1080);
  assert(buffer.includes(Buffer.from('ICCP')));assert.equal(result.colorSpace,'sRGB');
  assert.equal(createHash('sha256').update(buffer).digest('hex'),result.sha256);
  assert(result.titleLines.length<=2);
  for(const [left,top,right,bottom] of result.titleBounds)assert(left>=0&&top>=0&&right<=1920&&bottom<=1080);
  assert(buffer.length<350*1024,'individual cover must remain lightweight');
 }
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {videoProjects} from '../src/data/video-projects.js';
import {shortFilmMarkup,shortFilmEmbedURL} from '../src/pages/short-film.js';
import {findCategory} from '../src/data/categories.js';
test('batch manifest keeps 15 projects, 20 episodes and 18 distinct verified submissions',async()=>{
 assert.equal(videoProjects.length,15);assert.equal(new Set(videoProjects.map(w=>w.id)).size,15);
 const episodes=videoProjects.flatMap(w=>w.episodes);assert.equal(episodes.length,20);
 const linked=episodes.filter(e=>e.bilibili);assert.equal(linked.length,18);assert.equal(new Set(linked.map(e=>e.bilibili)).size,18);
 assert.equal(videoProjects.filter(w=>w.episodes.length===2).length,5);
 for(const ep of episodes){assert(ep.width>0&&ep.height>0);for(const src of [ep.cover,...ep.characters.map(c=>c.src),...Object.values(ep.assets).flat().map(a=>a.src)])assert((await stat(new URL('../public'+src,import.meta.url))).size>0);}
});
test('series render video then characters in episode order and defer every iframe',()=>{
 for(const work of videoProjects){const html=shortFilmMarkup(findCategory(work.category),work);assert(!html.includes('<iframe'));let cursor=-1;for(const ep of work.episodes){const start=html.indexOf(`data-episode="${ep.number}"`);const player=html.indexOf('data-film-player',start);const characters=html.indexOf('<h2>人物介绍</h2>',player);assert(start>cursor&&player>start&&characters>player);cursor=characters;if(ep.bilibili)assert(shortFilmEmbedURL(ep.bilibili));}assert.equal((html.match(/data-film-embed=/g)||[]).length,work.episodes.filter(ep=>ep.bilibili).length);}
});
test('removed projects disappear and game works use their new category',()=>{
 assert(!videoProjects.some(w=>w.id==='exit-interview'));
 assert.deepEqual(videoProjects.filter(w=>w.category==='game').map(w=>w.id),['game-promo','sword-legend']);
 for(const id of ['short-film','comic-drama','tvc','ai-live-action','game']){const html=shortFilmMarkup(findCategory(id));assert(html.includes('video-carousel'));assert(html.includes('data-carousel="'+id+'"'));assert(!html.includes('<iframe'));}
});

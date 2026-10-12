import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workCoverMarkup} from '../src/components/work-cover.js';
import {works} from '../src/data/works.js';
import {findCategory} from '../src/data/categories.js';
import {ips} from '../src/data/ips.js';
import {ipDetailMarkup} from '../src/pages/ip.js';
test('all video projects have real source covers, escaped titles and category captions',()=>{
 const videos=works.filter(w=>w.episodes);assert.equal(videos.length,15);
 for(const w of videos){assert(w.cover);const html=workCoverMarkup(w,findCategory(w.category));assert(html.includes(w.cover));assert(html.includes(findCategory(w.category).name));assert(!html.includes('<video'));}
 const html=workCoverMarkup({title:'<script>x</script>',cover:'/assets/cover.jpg'},{name:'短片'});assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));
});
test('IP intros precede original boards and retain character navigation',()=>{
 for(const w of ips){const html=ipDetailMarkup(w);assert(w.personality&&w.keywords.length);assert(html.indexOf('ip-detail-intro')<html.indexOf('ip-main-character'));assert(html.includes(w.role));assert(html.includes('角色快速切换'));}
});

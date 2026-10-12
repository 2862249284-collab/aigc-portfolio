import {test} from 'node:test';
import assert from 'node:assert/strict';
import {uniqueWorks,visibleSlides,wrapIndex} from '../src/lib/carousel-state.js';

test('small collections and forty bidirectional wraps never repeat a visible work',()=>{
 for(let count=0;count<=8;count++){
  const items=Array.from({length:count},(_,i)=>({id:String(i),media:`/${i}.webp`}));
  let index=0;
  for(const direction of [1,-1])for(let step=0;step<20;step++){
   const records=visibleSlides(items,index),ids=records.map(r=>r.item.id);
   assert.equal(ids.length,Math.min(count,3));assert.equal(new Set(ids).size,ids.length);
   if(count>=3)assert.deepEqual(ids,[wrapIndex(index-1,count),index,wrapIndex(index+1,count)].map(String));
   index=wrapIndex(index+direction,count);
  }
  assert.equal(index,0);
 }
});
test('duplicate IDs or source files cannot enter a carousel twice',()=>{
 const a={id:'a',media:'/a.webp'},b={id:'b',media:'/b.webp'};
 assert.deepEqual(uniqueWorks([a,{...a,media:'/other.webp'},{id:'copy',media:a.media},b]),[a,b]);
});

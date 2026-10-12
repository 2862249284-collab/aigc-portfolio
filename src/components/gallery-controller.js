import {assetURL,reducedMotion} from '../lib/dom.js';
import {worksFor} from '../data/works.js';
import {displayImages} from '../data/display-images.js';
import {visibleSlides,uniqueWorks,wrapIndex} from '../lib/carousel-state.js';
import {workCoverMarkup} from './work-cover.js';
const decoded=new Map();
export function displayURL(item){return assetURL(displayImages[item.media]||item.cover||item.media);}
function preload(src){
 if(!src)return Promise.resolve();
 if(!decoded.has(src)){const img=new Image();img.src=src;decoded.set(src,img.decode().catch(()=>{}));if(decoded.size>32)decoded.delete(decoded.keys().next().value);}
 return decoded.get(src);
}
export function mountGallery(category,root,{state,position,duration=640,autoplay=false,restorePreview=false,entries=worksFor(category.id),onActivate}){
 const page=root.querySelector(`[data-carousel="${category.id}"]`);if(!page)return()=>{};
 const stage=page.querySelector('.poster-stage'),slots=page.querySelector('.poster-slots'),dialog=page.querySelector('dialog');
 const items=uniqueWorks(entries),count=items.length,controller=new AbortController(),{signal}=controller;
 let index=wrapIndex(state.index,count),busy=false,disposed=false,animations=[],timer=0,hovered=false,previewIndex=null,touch=null,suppressClick=0,lastWheel=0,total=0,consumed=false;
 const nodes=new Map(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 function schedule(){clearTimeout(timer);if(autoplay&&count>1&&!disposed&&!busy&&!hovered&&!dialog.open&&!document.hidden&&!reducedMotion())timer=setTimeout(()=>step(1),4000);}
 function syncNode(node,record){node.dataset.offset=record.offset;node.style.zIndex=record.offset===0?'3':'1';Object.assign(node.style,position(record.offset));node.setAttribute('aria-label',record.offset===0?`${record.item.episodes?'查看作品':record.item.kind==='character'?'查看角色':'放大作品'}：${record.item.title}`:`${record.offset<0?'上一张':'下一张'}：${record.item.title}`);}
 function nodeFor(record){
  if(nodes.has(record.item.id))return nodes.get(record.item.id);
  const node=document.createElement('button');node.className='poster-slide';node.dataset.cursor='view';node.dataset.id=record.item.id;
  let image;
  if(record.item.episodes){node.classList.add('has-work-cover');node.innerHTML=workCoverMarkup(record.item,category,displayURL(record.item));image=node.querySelector('img');}
  else{image=new Image();image.alt=record.item.title;image.draggable=false;image.decoding='async';image.src=displayURL(record.item);node.append(image);}
  if(record.item.actionLabel&&!record.item.episodes){const label=document.createElement('span');label.className='gallery-action';label.textContent=record.item.actionLabel;node.append(label);}
  const error=document.createElement('span');error.className='poster-load-error';error.hidden=true;error.textContent='图片暂时无法加载';node.append(error);
  image.addEventListener('error',()=>error.hidden=false,{signal});
  node.addEventListener('click',()=>{if(onActivate&&record.item.episodes){clearTimeout(timer);onActivate(record.item);return;}const offset=Number(node.dataset.offset);if(offset)step(Math.sign(offset));else open();},{signal});
  slots.append(node);nodes.set(record.item.id,node);return node;
 }
 function paint(){
  const records=visibleSlides(items,index),wanted=new Set(records.map(r=>r.item.id));
  for(const [id,node] of nodes)if(!wanted.has(id)){node.remove();nodes.delete(id);}
  for(const record of records){syncNode(nodeFor(record),record);preload(displayURL(record.item));}
  stage.dataset.index=String(index);state.index=index;
  page.querySelector('.poster-counter').textContent=count?`${String(index+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`:'00 / 00';
  page.querySelector('.poster-caption h2').textContent=items[index]?.title||'作品即将展出';
  if(dialog.open&&!onActivate){dialog.querySelector('img').src=assetURL(items[index].media);dialog.querySelector('img').alt=items[index].title;dialog.querySelector('p').textContent=`${index+1} / ${count} · ${items[index].title}`;}
 }
 async function animate(node,from,to,ms=duration){const animation=node.animate([from,to],{duration:ms,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});animations.push(animation);await animation.finished.catch(()=>{});}
 async function step(direction){
  if(busy||disposed||count<2)return;busy=true;clearTimeout(timer);stage.setAttribute('aria-busy','true');direction=Math.sign(direction);
  const next=wrapIndex(index+direction,count),old=visibleSlides(items,index),desired=visibleSlides(items,next);
  // Preview navigation updates synchronously; closing must not race a pending
  // gallery decode and unexpectedly change the restored selection afterwards.
  if(!dialog.open)await Promise.all(desired.map(record=>preload(displayURL(record.item))));if(disposed)return;
  if(!reducedMotion()&&!dialog.open&&!document.hidden){
   const desiredMap=new Map(desired.map(r=>[r.item.id,r]));
   const tasks=[];
   for(const record of old){const node=nodes.get(record.item.id),target=desiredMap.get(record.item.id);
    if(count===3&&record.offset===-direction){
     tasks.push((async()=>{await animate(node,position(record.offset),{...position(-2*direction),opacity:0},duration/2);if(disposed)return;await animate(node,{...position(2*direction),opacity:0},position(target.offset),duration/2);})());
    }else tasks.push(animate(node,position(record.offset),position(target?.offset??record.offset-direction)));
   }
   for(const record of desired)if(!nodes.has(record.item.id)){const node=nodeFor(record);syncNode(node,{...record,offset:2*direction});tasks.push(animate(node,position(2*direction),position(record.offset)));}
   await Promise.all(tasks);if(disposed)return;
  }
  index=next;animations.forEach(a=>a.cancel());animations=[];paint();busy=false;stage.removeAttribute('aria-busy');stage.dispatchEvent(new CustomEvent('gallery-settled',{bubbles:true,detail:{index}}));schedule();
 }
 function open(){if(busy||!count)return;clearTimeout(timer);if(onActivate){onActivate(items[index]);return;}previewIndex=index;dialog.showModal();paint();}
 function close(){if(restorePreview&&previewIndex!==null)index=previewIndex;previewIndex=null;dialog.close();paint();schedule();}
 if(!onActivate){dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal});dialog.addEventListener('click',event=>{if(event.target===dialog)close();},{signal});page.querySelector('.poster-close').addEventListener('click',close,{signal});}
 dialog.addEventListener('close',schedule,{signal});
 page.querySelectorAll('[data-step]').forEach(button=>{button.disabled=count<2;button.addEventListener('click',()=>step(Number(button.dataset.step)),{signal});});
 page.addEventListener('keydown',event=>{if(onActivate&&dialog.open)return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}else if(event.key==='Escape'&&!dialog.open)page.querySelector('a')?.focus();},{signal});
 stage.addEventListener('wheel',event=>{if(event.ctrlKey||event.shiftKey||count<2)return;event.preventDefault();const now=performance.now();if(now-lastWheel>220){total=0;consumed=false;}lastWheel=now;if(busy||consumed)return;const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(total&&Math.sign(total)!==Math.sign(delta))total=0;total+=delta;if(Math.abs(total)>=45){consumed=true;total=0;step(Math.sign(delta));}},{passive:false,signal});
 stage.addEventListener('pointerenter',()=>{hovered=true;clearTimeout(timer);},{signal});stage.addEventListener('pointerleave',()=>{hovered=false;schedule();},{signal});
 stage.addEventListener('pointerdown',event=>{if(event.button===0)touch={x:event.clientX,y:event.clientY,moved:false};},{passive:true,signal});
 stage.addEventListener('pointermove',event=>{if(touch&&Math.abs(event.clientX-touch.x)>12){touch.moved=true;stage.setPointerCapture(event.pointerId);}},{passive:true,signal});
 stage.addEventListener('pointerup',event=>{if(!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;if(touch.moved)suppressClick=performance.now()+400;touch=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);},{signal});
 stage.addEventListener('pointercancel',()=>touch=null,{signal});stage.addEventListener('click',event=>{if(performance.now()<suppressClick){event.preventDefault();event.stopPropagation();}},{capture:true,signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)animations.forEach(a=>{try{a.finish();}catch{}});schedule();},{signal});motion.addEventListener('change',schedule,{signal});
 if(!count)slots.innerHTML='<p class="poster-empty">作品即将展出</p>';paint();schedule();
 return()=>{disposed=true;clearTimeout(timer);controller.abort();animations.forEach(a=>a.cancel());dialog.close();nodes.clear();};
}

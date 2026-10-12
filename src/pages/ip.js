import {ips,ipScenes,ipGalleryItems} from '../data/ips.js';
import {escapeHTML as e,assetURL} from '../lib/dom.js';

import {mountGallery} from '../components/gallery-controller.js';
const galleryState={index:0};
const picture=(src,alt,loading='eager')=>`<img src="${e(assetURL(src))}" alt="${e(alt)}" loading="${loading}" decoding="async" draggable="false">`;
const viewer=()=>`<dialog class="ip-viewer" aria-label="IP 图片预览"><div class="ip-viewer-toolbar"><p aria-live="polite"></p><button type="button" data-ip-zoom aria-label="放大图片">放大 +</button><button type="button" data-ip-close aria-label="关闭 IP 大图">关闭 ×</button></div><div class="ip-viewer-body" tabindex="0"><img alt=""></div><button class="ip-viewer-prev" type="button" data-ip-step="-1" aria-label="上一张图片">←</button><button class="ip-viewer-next" type="button" data-ip-step="1" aria-label="下一张图片">→</button></dialog>`;

export function ipOverviewMarkup(){
 return `<section class="ip-page ip-overview" data-carousel="ip" aria-labelledby="ip-title"><header class="ip-heading"><a href="/#work-orbit" data-route>← 返回创作圆环</a><div><span class="micro">IP DESIGN</span><h1 id="ip-title">角色与他们的世界</h1></div><span class="micro">${String(ipGalleryItems.length).padStart(2,'0')} WORKS</span></header>
 <div class="poster-stage" tabindex="0" role="region" aria-label="IP 作品轮播，滚轮或左右方向键切换"><div class="poster-slots"></div><button class="poster-arrow poster-prev" data-step="-1" aria-label="上一张 IP 作品">←</button><button class="poster-arrow poster-next" data-step="1" aria-label="下一张 IP 作品">→</button></div>
 <div class="poster-caption" aria-live="polite"><span class="poster-counter"></span><h2></h2></div><a data-ip-route data-route hidden></a>${viewer()}</section>`;
}

export function ipDetailMarkup(work){
 return `<section class="ip-page ip-detail" aria-labelledby="ip-character-title"><header class="ip-heading"><a href="/works/ip" data-route>← IP 总览</a><div><span class="micro">CHARACTER ARCHIVE</span><h1 id="ip-character-title">${e(work.title)}</h1></div><span class="micro">IP DESIGN</span></header>
 <div class="ip-detail-layout"><div class="ip-main-character">${picture(work.media,`${work.title}完整角色形象`)}</div><div class="ip-character-info"><div class="ip-character-description"><h2>${e(work.role||'')}</h2>${work.description?`<p>${e(work.description)}</p>`:''}</div><div class="ip-board-list" tabindex="0" aria-label="${e(work.title)}设定资料">${work.gallery.map((board,i)=>`<button type="button" class="ip-board" data-ip-image="${i}" data-cursor="view" aria-label="放大${e(work.title)}：${e(board.caption)}">${picture(board.preview||board.src,`${work.title} · ${board.caption}`)}<span>${e(board.caption)} <span aria-hidden="true">↗</span></span></button>`).join('')}</div></div></div>
 <nav class="ip-character-nav" aria-label="角色快速切换">${ips.map(item=>`<a href="/works/ip/${e(item.id)}" data-route class="${item.id===work.id?'is-active':''}" ${item.id===work.id?'aria-current="page"':''}>${e(item.title)}</a>`).join('')}</nav>${viewer()}</section>`;
}

export function mountIP(root,work){
 const page=root.querySelector('.ip-page');if(!page)return()=>{};
 const items=work?work.gallery.map(b=>({src:b.src,title:`${work.title} · ${b.caption}`})):ipScenes;
 const dialog=page.querySelector('dialog'),image=dialog.querySelector('img'),body=dialog.querySelector('.ip-viewer-body'),zoom=dialog.querySelector('[data-ip-zoom]');
 const controller=new AbortController(),{signal}=controller;let index=0,zoomed=false;
 const resetZoom=()=>{zoomed=false;dialog.classList.remove('is-zoomed');zoom.textContent='放大 +';zoom.setAttribute('aria-label','放大图片');body.scrollTop=0;body.scrollLeft=0;};
 const paint=()=>{resetZoom();image.src=assetURL(items[index].src);image.alt=items[index].title;dialog.querySelector('p').textContent=`${items[index].title} · ${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;};
 const open=next=>{index=next;paint();dialog.showModal();};
 const close=()=>{dialog.close();resetZoom();image.removeAttribute('src');};
 const step=direction=>{index=(index+direction+items.length)%items.length;paint();};
 page.querySelectorAll('[data-ip-image]').forEach(button=>button.addEventListener('click',()=>{index=Number(button.dataset.ipImage);paint();dialog.showModal();},{signal}));
 dialog.querySelector('[data-ip-close]').addEventListener('click',close,{signal});
 dialog.querySelectorAll('[data-ip-step]').forEach(button=>{button.disabled=items.length<2;button.addEventListener('click',()=>step(Number(button.dataset.ipStep)),{signal});});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal});
 dialog.addEventListener('click',event=>{if(event.target===dialog)close();},{signal});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();step(event.key==='ArrowRight'?1:-1);}},{signal});
 zoom.addEventListener('click',()=>{zoomed=!zoomed;dialog.classList.toggle('is-zoomed',zoomed);zoom.textContent=zoomed?'适应屏幕 −':'放大 +';zoom.setAttribute('aria-label',zoomed?'适应屏幕':'放大图片');},{signal});
 const disposeGallery=work?()=>{}:mountGallery({id:'ip'},root,{state:galleryState,entries:ipGalleryItems,autoplay:true,duration:700,position:offset=>({transform:`translateX(calc(${offset*100}% + ${offset*70}px))`,opacity:Math.abs(offset)>1?0:offset===0?1:.5}),onActivate:item=>{
  if(item.kind==='scene')open(item.sceneIndex);
  else{const link=page.querySelector('[data-ip-route]');link.setAttribute('href',item.href);link.click();}
 }});
 return()=>{disposeGallery();controller.abort();dialog.close();image.removeAttribute('src');};
}

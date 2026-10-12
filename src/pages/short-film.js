import {findCategory} from '../data/categories.js';
import {bannerMarkup} from '../components/banner-carousel.js';
import {mountGallery} from '../components/gallery-controller.js';
const videoGalleryState={};
import {escapeHTML as e,assetURL,routeFor} from '../lib/dom.js';
import {worksFor} from '../data/works.js';
import {bilibiliURL} from '../lib/bilibili.js';
export function shortFilmEmbedURL(value){
 const canonical=bilibiliURL(value);if(!canonical)return '';
 const url=new URL(canonical),id=url.pathname.split('/')[2];
 const params=new URLSearchParams({[id.startsWith('BV')?'bvid':'aid']:id.replace(/^av/,''),p:url.searchParams.get('p')||'1',autoplay:'0',muted:'1',danmaku:'0',poster:'1'});
 return `https://player.bilibili.com/player.html?${params}`;
}
export function nativeFilmURL(value){
 if(typeof value!=='string'||!value.endsWith('.mp4'))return '';
 if(value.startsWith('/')&&!value.startsWith('//')&&!value.includes('..'))return assetURL(value);
 try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}
}
export function externalFilmURL(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='www.xiaohongshu.com'&&/^\/explore\/[a-f0-9]{24}$/.test(url.pathname)?url.href:'';}catch{return '';}}
function figures(items,title){return items.map(item=>`<figure class="short-film-character asset-item image-shell"><figcaption><h3>${e(item.name||item.caption||title)}</h3>${item.description?`<p>${e(item.description)}</p>`:''}</figcaption><img src="${e(assetURL(item.src))}" data-full-src="${e(assetURL(item.fullSrc||item.src))}" alt="${e(item.name||item.caption||title)}" loading="lazy" decoding="async"><span class="asset-error">图片暂时无法显示</span></figure>`).join('');}
export function shortFilmMarkup(category,selected){
 const projects=worksFor(category.id);
 const heading=(title,back,label)=>`<header class="short-film-heading"><a data-route href="${back}">← ${label}</a><div><span class="micro">${e(category.english)}</span><h1>${e(title)}</h1></div><span class="micro">${String(projects.length).padStart(2,'0')} WORKS</span></header>`;
 if(!selected)return bannerMarkup(category).replace('gallery-carousel','gallery-carousel video-carousel').replace('</section>', '<a data-video-route data-route hidden></a></section>');
 const work=selected,episodes=work.episodes||[work];
 return `<article class="short-film-page">${heading(work.title,`/works/${category.id}`,'返回'+category.name+'作品')}<nav class="short-film-projects" aria-label="作品切换">${projects.map(p=>`<a data-route href="${routeFor(p)}" ${p.id===work.id?'aria-current="page"':''}>${e(p.title)}</a>`).join('')}</nav>${episodes.map((ep,i)=>{
 const media=nativeFilmURL(ep.media),external=externalFilmURL(ep.watchURL),embed=shortFilmEmbedURL(ep.bilibili),ratio=(ep.width||1920)/(ep.height||1080);
 return `<section class="film-episode" data-episode="${i+1}"><div class="short-film-lead" style="--film-ratio:${ratio}">${episodes.length>1?`<h2>${['第一集','第二集','第三集'][i]||'第'+(i+1)+'集'}</h2>`:''}<div class="short-film-player-wrap"><div class="short-film-player" data-film-player>${media?`<button class="short-film-load" data-film-media="${e(media)}" aria-label="播放 ${e(work.title)} 第${i+1}集"><img src="${e(assetURL(ep.cover))}" alt="${e(work.title)}视频封面" loading="${i?'lazy':'eager'}"><span>▷ 播放完整视频</span></button>`:embed?`<button class="short-film-load" data-film-embed="${e(embed)}" aria-label="加载 ${e(work.title)} 第${i+1}集官方播放器"><img src="${e(assetURL(ep.cover))}" alt="${e(work.title)}视频封面" loading="${i?'lazy':'eager'}" decoding="async"><span>▷ 加载播放器</span></button>`:`${external?`<a class="short-film-load film-external" href="${e(external)}" target="_blank" rel="noopener noreferrer" aria-label="在小红书观看第${i+1}集">`:""}<img class="film-pending-cover" src="${e(assetURL(ep.cover))}" alt="${e(work.title)}视频封面" loading="lazy">${external?'<span>前往小红书观看 ↗</span></a>':''}`}</div><div class="short-film-actions">${media?`<span>完整视频 · 点击播放</span><button type="button" data-film-fullscreen>全屏观看 ↗</button>`:embed?`<span>哔哩哔哩官方播放器</span><a href="${e(bilibiliURL(ep.bilibili))}" target="_blank" rel="noopener noreferrer">在 B 站观看 ↗</a>`:external?'<span>小红书作品 · 如网页不可用，请在 App 中查看</span>':'<span>视频链接待匹配</span>'}</div></div></div><div class="film-project-info"><h3>${e(work.title)} · ${e(category.name)}</h3>${work.description?`<p>${e(work.description)}</p>`:""}</div><section class="short-film-characters" id="${i?'film-characters-'+(i+1):'film-characters'}"><h2>人物介绍</h2>${figures(ep.characters||[],'人物形象')}${ep.characterNote?`<p class="film-pending">${e(ep.characterNote)}</p>`:''}</section>${[['environments','场景设计'],['props','道具设计'],['process','制作过程'],['extras','补充素材']].map(([key,title])=>ep.assets?.[key]?.length?`<section class="short-film-characters" aria-label="${title}"><h2>${title}</h2>${figures(ep.assets[key],title)}</section>`:'').join('')}</section>`;
 }).join('')}</article>`;
}
export function mountShortFilm(root){
 const gallery=root.querySelector('.video-carousel');
 if(gallery){const id=gallery.dataset.carousel;return mountGallery(findCategory(id),root,{state:(videoGalleryState[id]??={index:0}),entries:worksFor(id).map(work=>({...work,actionLabel:'PLAY FILM / 查看作品'})),autoplay:true,duration:700,position:offset=>({transform:`translateX(calc(${offset*100}% + var(--video-gap,70px) * ${offset})) scale(${offset===0?1:.92})`,opacity:Math.abs(offset)>1?0:offset===0?1:.5}),onActivate:work=>{const link=gallery.querySelector('[data-video-route]');link.setAttribute('href',routeFor(work));link.click();}});}
 const page=root.querySelector('.short-film-page');if(!page)return()=>{};
 const controller=new AbortController();let active=null;
 const signal=controller.signal;
 const stop=()=>{if(!active)return;const {frame,host,button}=active;if(frame.tagName==='VIDEO'){frame.pause();frame.removeAttribute('src');frame.load();}else frame.src='about:blank';host.replaceChildren(button);active=null;};
 page.addEventListener('click',event=>{
  const full=event.target.closest('[data-film-fullscreen]');
  if(full){const video=full.closest('.short-film-player-wrap').querySelector('video');if(video){if(video.requestFullscreen)video.requestFullscreen().catch(()=>{});else video.webkitEnterFullscreen?.();}return;}
  const button=event.target.closest('[data-film-media],[data-film-embed]');if(!button)return;
  stop();const host=button.closest('[data-film-player]');
  const media=nativeFilmURL(button.dataset.filmMedia),frame=document.createElement(media?'video':'iframe');
  if(media){
   frame.controls=true;frame.playsInline=true;frame.preload='none';frame.poster=button.querySelector('img').src;frame.setAttribute('aria-label',button.getAttribute('aria-label'));
   frame.addEventListener('error',()=>{const note=document.createElement('p');note.className='film-playback-error';note.textContent='视频加载失败，请检查网络后点击封面重试。';stop();host.append(note);},{once:true,signal});
   frame.src=media;
  }else{frame.src=button.dataset.filmEmbed;frame.title=button.getAttribute('aria-label');frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';}
  host.replaceChildren(frame);active={host,button,frame};
  if(media)frame.play().catch(()=>{});
 },{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(active?.frame.tagName==='VIDEO')active.frame.pause();else stop();}},{signal});
 return()=>{controller.abort();stop();};
}

import { escapeHTML as e, assetURL } from '../lib/dom.js';
import { bilibiliURL } from '../lib/bilibili.js';

export function placeholderMarkup(category,large=false){
  return `<div class="art-placeholder art-placeholder--${e(category.id)} ${large?'art-placeholder--large':''}" role="img" aria-label="${e(category.name)}作品占位图">
    <span class="placeholder-kicker">RESERVED FOR IMAGINATION</span><div class="placeholder-form" aria-hidden="true"><i></i><i></i><i></i></div>
    <span class="placeholder-type">${e(category.english.split(' ')[0])}<span>NOT YET<br>IMAGINED.</span></span>
    <span class="placeholder-foot">${e(category.name)} / 作品待上传 <span>↗</span></span>
  </div>`;
}

export function coverMarkup(work,category){
  const cover=assetURL(work.cover);
  return cover?`<div class="image-shell"><img src="${e(cover)}" alt="${e(work.title)}封面" loading="lazy" decoding="async"><span class="asset-error">封面暂时无法显示</span></div>`:placeholderMarkup(category);
}

export function mediaMarkup(work,category){
  const media=assetURL(work.media),cover=assetURL(work.poster)||assetURL(work.cover);
  if (!media && work.mediaType === 'video' && bilibiliURL(work.bilibili)) return `<div class="bilibili-media">${cover ? `<img src="${e(cover)}" alt="${e(work.title)}封面" loading="lazy">` : ''}<p>完整作品发布于哔哩哔哩</p><a class="text-link" href="${e(bilibiliURL(work.bilibili))}" target="_blank" rel="noopener noreferrer">前往B站观看 ↗</a></div>`;
  if(!media)return `<div class="detail-empty">${placeholderMarkup(category,true)}<span class="empty-media-label">${work.mediaType==='video'?'视频':'图片'}待上传 · 展示占位</span></div>`;
  if(work.mediaType==='video')return `<div class="video-shell"><video controls playsinline preload="none" ${cover?`poster="${e(cover)}"`:''} aria-label="${e(work.title)}"><source src="${e(media)}">你的浏览器不支持视频播放，请使用下方链接查看。</video><div class="video-actions"><span>点击播放 · 原生视频播放器</span><button type="button" data-fullscreen>全屏观看 ↗</button><a href="${e(media)}" target="_blank" rel="noopener">打开原视频 ↗</a></div><p class="video-error" hidden>视频暂时无法播放，请检查资源文件或尝试打开原视频。</p></div>`;
  return `<figure class="detail-image image-shell"><img src="${e(media)}" alt="${e(work.title)}" loading="lazy" decoding="async"><span class="asset-error">图片暂时无法显示</span></figure>`;
}

export function mountMedia(root){
  const controller=new AbortController();const {signal}=controller;
  const viewer=document.createElement('dialog');viewer.className='image-viewer';
  viewer.innerHTML='<button type="button" aria-label="关闭大图">关闭 ×</button><img alt=""><p></p>';
  root.append(viewer);
  const closeViewer=()=>viewer.close();
  viewer.querySelector('button').addEventListener('click',closeViewer,{signal});
  viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer();},{signal});
  root.querySelectorAll('.detail-image img,.detail-gallery img,.asset-item img').forEach(img=>{
    const button=document.createElement('button');button.type='button';button.className='image-zoom';button.setAttribute('aria-label',`放大查看：${img.alt}`);
    img.before(button);button.append(img);
    button.addEventListener('click',()=>{viewer.querySelector('img').src=img.dataset.fullSrc||img.currentSrc||img.src;viewer.querySelector('img').alt=img.alt;viewer.querySelector('p').textContent=img.alt;viewer.showModal();},{signal});
  });
  root.addEventListener('error',event=>{
    if(event.target.tagName==='IMG'){event.target.hidden=true;event.target.closest('.image-shell,.portrait-frame')?.classList.add('asset-unavailable');}
  },{capture:true,signal});
  root.querySelectorAll('video').forEach(video=>{
    const showError=()=>{const notice=video.closest('.video-shell')?.querySelector('.video-error');if(notice)notice.hidden=false;};
    video.addEventListener('error',showError,{signal});video.querySelector('source')?.addEventListener('error',showError,{signal});
  });
  root.querySelectorAll('[data-fullscreen]').forEach(button=>button.addEventListener('click',async()=>{
    const video=button.closest('.video-shell').querySelector('video');
    try{if(video.requestFullscreen)await video.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else button.textContent='请使用播放器的全屏按钮';}catch{button.textContent='请使用播放器的全屏按钮';}
  },{signal}));
  return ()=>{viewer.close();viewer.remove();controller.abort();root.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));video.load();});};
}


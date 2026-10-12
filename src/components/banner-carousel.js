import { escapeHTML as e, reducedMotion, wrap } from '../lib/dom.js';
import { mountGallery } from './gallery-controller.js';

// Banner-only continuous strip: three visible panels and two offscreen buffers.
// Fixed DOM size, real cyclic indices, and an independent autoplay lifecycle.
export const bannerState = {};

export function bannerMarkup(category){
  return `<section class="poster-page gallery-carousel" data-carousel="${e(category.id)}">
    <div class="poster-top"><a href="/#work-orbit" data-route>← 返回创作圆环</a><div><span>${e(category.english)}</span><h1>${e(category.name)}作品</h1></div><a href="/#work-orbit" data-route>退出画廊 ↗</a></div>
    <div class="poster-stage" tabindex="0" role="region" aria-label="${e(category.name)}轮播，滚轮或左右方向键切换"><div class="poster-slots"></div><button class="poster-arrow poster-prev" data-step="-1" aria-label="上一张${e(category.name)}">←</button><button class="poster-arrow poster-next" data-step="1" aria-label="下一张${e(category.name)}">→</button></div>
    <div class="poster-caption" aria-live="polite"><span class="poster-counter"></span><h2></h2></div>
    <dialog class="poster-viewer" aria-label="高清作品查看"><button class="poster-close" aria-label="关闭全屏">关闭 ×</button><button data-step="-1" aria-label="查看上一张">←</button><img alt=""><button data-step="1" aria-label="查看下一张">→</button><p></p></dialog>
  </section>`;
}

export function mountBanner(category,root){
 return mountGallery(category,root,{state:(bannerState[category.id]??={index:0}),autoplay:true,restorePreview:true,duration:700,position:offset=>({transform:`translateX(calc(${offset*100}% + ${offset*70}px))`,opacity:Math.abs(offset)>1?0:offset===0?1:.5})});
}

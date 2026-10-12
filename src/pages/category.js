import { categories } from '../data/categories.js';
import { worksFor } from '../data/works.js';
import { escapeHTML as e, routeFor, arrow } from '../lib/dom.js';
import { coverMarkup } from '../components/media.js';

export function categoryMarkup(category){
  const actual=worksFor(category.id),items=actual;
  const index=categories.indexOf(category);
  return `<section class="collection-page collection--${category.id}" aria-labelledby="collection-heading">
    <a class="back-link" href="/#work-orbit" data-route>← 返回创作圆环</a>
    <div class="collection-heading" data-reveal><span class="eyebrow">DISCIPLINE / ${String(index+1).padStart(2,'0')}</span><div class="collection-title-line"><h1 id="collection-heading">${e(category.name)}<sup>${String(actual.length).padStart(2,'0')}</sup></h1><span class="collection-english">${e(category.english)}</span></div><div class="collection-description"><p>${e(category.description)}</p><span>${actual.length} 件作品${actual.length?'':' · 持续创作中'}</span></div></div>
    <div class="project-grid ${actual.length?'':'project-grid--empty'}">${items.map((work,i)=>`<article class="project-card" style="--stagger:${Math.min(i,5)*70}ms" data-reveal><a href="${routeFor(work)}" data-route aria-label="${e(work.title)}"><div class="project-cover" style="--cover-ratio:${category.ratio}" data-cursor="${work.mediaType==='video'?'play':'view'}">${coverMarkup(work,category)}<span class="project-open">${work.mediaType==='video'?'▷':arrow}</span><span class="project-hover">${e(work.title)}<span>${e(category.name)}</span></span></div><div class="project-meta"><span>${String(i+1).padStart(2,'0')} / ${e(work.title)}</span><span>${work.placeholder?'展示占位':''} ${arrow}</span></div><div class="project-annotation">${[work.brand,work.duration,work.episode].filter(Boolean).map(value=>`<span>${e(value)}</span>`).join('')}</div></a></article>`).join('')}
    ${actual.length?'':`<aside class="empty-collection" data-reveal><span class="empty-cross" aria-hidden="true">+</span><span class="eyebrow">A SPACE FOR WHAT COMES NEXT</span><h2>下一件作品，<br>正在想象之中。</h2><p>该分类尚未上传作品。<br>新的创作将在这里展出。</p><span class="micro">${e(category.english)} / COMING SOON</span></aside>`}</div>
    <a class="next-category" data-route href="/works/${categories[(index+1)%8].id}"><span class="micro">NEXT DISCIPLINE</span><span>${e(categories[(index+1)%8].name)}</span>${arrow}</a>
  </section>`;
}

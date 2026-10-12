import {escapeHTML as e,assetURL} from '../lib/dom.js';

export function workCoverCaption(work,category,episode){
 const label=episode==null?'':(['第一集','第二集','第三集'][episode-1]||'第'+episode+'集');
 return `<span class="work-cover-caption"><strong>${e(work.title)}${label?`<small class="work-cover-episode">${label}</small>`:''}</strong><span>${e(category.name||category.id)}<span aria-hidden="true"> ↗</span></span></span>`;
}
// Video covers use existing project frames. The separate caption never covers faces.
export function workCoverMarkup(work,category,src=work.cover){
 return `<span class="work-cover"><span class="work-cover-image"><img src="${e(assetURL(src))}" alt="${e(work.title)}" draggable="false" decoding="async"><span class="work-cover-play" aria-hidden="true">▷</span></span>${workCoverCaption(work,category)}</span>`;
}

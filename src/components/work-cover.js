import {escapeHTML as e,assetURL} from '../lib/dom.js';

// Video covers use existing project frames. The separate caption never covers faces.
export function workCoverMarkup(work,category,src=work.cover){
 return `<span class="work-cover"><span class="work-cover-image"><img src="${e(assetURL(src))}" alt="${e(work.title)}" draggable="false" decoding="async"><span class="work-cover-play" aria-hidden="true">▷</span></span><span class="work-cover-caption"><strong>${e(work.title)}</strong><span>${e(category.name||category.id)}<span aria-hidden="true"> ↗</span></span></span></span>`;
}

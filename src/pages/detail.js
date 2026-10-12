import { escapeHTML as e, assetURL } from '../lib/dom.js';
import { mediaMarkup } from '../components/media.js';
import { worksFor, works } from '../data/works.js';
import { videoQRMarkup } from '../components/video-qr.js';
import { routeFor } from '../lib/dom.js';

// Folded asset modules mirror the reference site's project breakdown. A module
// with no material is dropped entirely, so a project only shows what it has.
const ASSET_GROUPS = [
  { key: 'characters', en: 'CHARACTERS', cn: '人物资产', note: '三视图 · 写真 · 服装 · 表情' },
  { key: 'environments', en: 'ENVIRONMENTS', cn: '场景资产', note: '室内外场景 · 多角度环境' },
  { key: 'props', en: 'PROPS', cn: '道具资产', note: '三视图 · 产品细节' }
];

function assetModules(work){
  const assets = work.assets || {};
  return ASSET_GROUPS.map(group => {
    const items = Array.isArray(assets[group.key]) ? assets[group.key].filter(item => assetURL(typeof item === 'string' ? item : item?.src)) : [];
    if(!items.length) return '';
    return `<details class="asset-block" data-asset="${group.key}"${group.key === 'characters' ? ' open' : ''}>
      <summary>
        <span class="asset-en micro">${group.en}</span>
        <span class="asset-cn">${group.cn}<small>${group.note}</small></span>
        <span class="asset-count">${String(items.length).padStart(2, '0')} 项</span>
        <span class="asset-toggle" aria-hidden="true"></span>
      </summary>
      <div class="asset-grid">${items.map((item, i) => {
        const image = typeof item === 'string' ? { src: item, caption: '' } : item;
        return `<figure class="asset-item image-shell"><img src="${e(assetURL(image.src))}" alt="${e(image.caption || `${group.cn} ${i + 1}`)}" loading="lazy" decoding="async"><span class="asset-error">图片暂时无法显示</span>${image.caption ? `<figcaption>${e(image.caption)}</figcaption>` : ''}</figure>`;
      }).join('')}</div>
    </details>`;
  }).join('');
}

export function detailMarkup(work,category){
  const siblings=worksFor(category.id),index=siblings.findIndex(item=>item.id===work.id);
  const neighbor=(item,label)=>item?`<a data-route href="${routeFor(item)}"><small>${label}</small><span>${e(item.title)}</span></a>`:`<span><small>${label}</small>暂无更多作品</span>`;
  const modules=assetModules(work);
  return `<article class="detail-page" aria-labelledby="detail-heading"><div class="detail-lead"><div class="detail-nav"><a class="back-link" data-route href="/works/${category.id}">← 返回${e(category.name)}</a><a class="back-link" href="/#work-orbit" data-route>创作圆环 ↗</a></div>
    <div class="detail-heading" data-reveal><span class="eyebrow">${e(category.english)} / ${work.placeholder?'DISPLAY PREVIEW':'PROJECT'}</span><h1 id="detail-heading">${e(work.title)}</h1><div class="detail-facts"><span>${e(category.name)}</span><span>${work.mediaType==='video'?'MOTION / VIDEO':'STILL / IMAGE'}</span>${work.placeholder?'<span class="placeholder-badge">展示占位 · 非真实作品</span>':''}</div></div>
    <div class="project-story"><span class="eyebrow" data-reveal>ABOUT THE PROJECT</span><div data-reveal><h2>创作叙事</h2><p>${e(work.description)}</p>${work.tools?.length?`<div class="project-tools"><span class="micro">TOOLS & PROCESS</span><p>${work.tools.map(e).join(' / ')}</p></div>`:''}</div></div>
    ${videoQRMarkup(work,works)}
    <div class="detail-main-media" data-reveal>${mediaMarkup(work,category)}</div></div>
    ${modules?`<section class="asset-modules" aria-label="项目资产">${modules}</section>`:''}
    ${work.gallery?.length?`<div class="detail-gallery">${work.gallery.map((item,i)=>{const image=typeof item==='string'?{src:item,caption:''}:item;return assetURL(image.src)?`<figure class="image-shell" data-reveal><img src="${e(assetURL(image.src))}" alt="${e(image.caption||`${work.title} 补充图片 ${i+1}`)}" loading="lazy" decoding="async"><span class="asset-error">图片暂时无法显示</span>${image.caption?`<figcaption>${e(image.caption)}</figcaption>`:''}</figure>`:'';}).join('')}</div>`:''}
    ${work.placeholder&&category.id==='ip'?'<div class="ip-preview-notes"><span>01 / 角色立绘</span><span>02 / 表情研究</span><span>03 / 三视图</span><span>04 / 设计说明</span></div>':''}
    <nav class="project-neighbors" aria-label="相邻作品">${neighbor(siblings[index-1],'← 上一个作品')}${neighbor(siblings[index+1],'下一个作品 →')}</nav>
    <div class="detail-end"><p>每一个想法，都值得被看见。</p><a class="text-link" href="/works/${category.id}" data-route>回到${e(category.name)}作品集 ↗</a></div>
  </article>`;
}

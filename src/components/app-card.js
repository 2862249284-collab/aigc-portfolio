import { appSite } from '../data/app.js';
import { escapeHTML as e, assetURL, arrow, reducedMotion } from '../lib/dom.js';

// The entry mirrors the reference site's "APP DESIGN WEBSITE" call-out: a single
// wide, quietly-lit link under the orbit that opens the configured official website directly.
export function appEntryMarkup(){
  const configured = Boolean(assetURL(appSite.siteUrl));
  return `<section class="app-entry" id="app-website" aria-labelledby="app-entry-heading">
    <div class="section-heading" data-reveal><span class="section-number">04 / APP PROJECT</span><span class="micro">PRODUCT · INTERFACE · EXPERIENCE</span><span class="section-plus" aria-hidden="true">+</span></div>
    <a class="app-entry-card" data-reveal aria-describedby="app-entry-tagline" ${configured?`href="${e(assetURL(appSite.siteUrl))}" target="_blank" rel="noopener noreferrer"`:'aria-disabled="true"'}>
      <span class="app-entry-glow" aria-hidden="true"></span>
      <span class="app-entry-body">
        <span class="app-entry-title" id="app-entry-heading"><span class="app-entry-cn">${e(appSite.title)}</span><span class="app-entry-en">${e(appSite.english)}</span></span>
        <span class="app-entry-tagline" id="app-entry-tagline">${e(appSite.tagline)}</span>
      </span>
      <span class="app-entry-arrow" aria-hidden="true">${arrow}</span>
    </a>

  </section>`;
}

export function mountAppEntry(section){
  const card=section.querySelector('.app-entry-card');
  const controller=new AbortController();const {signal}=controller;
  if(!reducedMotion()){
    card.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const rect=card.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      card.style.setProperty('--app-x',`${(x*14).toFixed(2)}px`);
      card.style.setProperty('--app-y',`${(y*8).toFixed(2)}px`);
      card.style.setProperty('--glow-x',`${((x+.5)*100).toFixed(1)}%`);
      card.style.setProperty('--glow-y',`${((y+.5)*100).toFixed(1)}%`);
    },{passive:true,signal});
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--app-x','0px');card.style.setProperty('--app-y','0px');
      card.style.setProperty('--glow-x','50%');card.style.setProperty('--glow-y','50%');
    },{signal});
  }
  return ()=>{controller.abort();};
}

import {shortFilmMarkup,mountShortFilm} from './pages/short-film.js';
import { headerMarkup, footerMarkup } from './components/shell.js';
import { homeMarkup, mountHome } from './pages/home.js';
import { categoryMarkup } from './pages/category.js';
import { detailMarkup } from './pages/detail.js';
import { resolveRoute } from './lib/routes.js';
import { mountMotion } from './lib/motion.js';
import { mountMedia } from './components/media.js';
import { mountVideoQR } from './components/video-qr.js';
import { reducedMotion } from './lib/dom.js';
import { createBackgrounds } from './components/backgrounds.js';
import { orbitState } from './components/orbit.js';
import { carouselMarkup, mountCarousel } from './components/image-carousel.js';
import { bannerMarkup, mountBanner } from './components/banner-carousel.js';
import { mountInteractions } from './components/hover.js';
import { createCursor } from './components/cursor.js';
import { disciplineBarMarkup } from './components/discipline-bar.js';
import {ipOverviewMarkup,ipDetailMarkup,mountIP} from './pages/ip.js';

const app=document.querySelector('#app');
let cleanups=[],currentPath='';
let navigationTimer=0,navigationVersion=0;
const backgrounds=createBackgrounds();
const disposeCursor=createCursor();
addEventListener('pagehide',event=>{if(!event.persisted){cleanups.forEach(dispose=>dispose());backgrounds.dispose();disposeCursor();clearTimeout(navigationTimer);}});
history.scrollRestoration='manual';
const positions=new Map();
function render(){
  cleanups.forEach(dispose=>dispose());cleanups=[];
  const route=resolveRoute(location.pathname);currentPath=location.pathname;
  let content;
  if(route.type==='home'){content=homeMarkup();document.title='AIGC内容创作师 — 视觉艺术与 AI 影像';}
  else if(route.type==='category'){content=route.category.medium==='video'?shortFilmMarkup(route.category):route.category.id==='ip'?ipOverviewMarkup():route.category.id==='banner'?bannerMarkup(route.category):route.category.medium==='image'?carouselMarkup(route.category):categoryMarkup(route.category);document.title=`${route.category.name}作品 — AIGC内容创作师`;}
  else if(route.type==='detail'){content=route.work.episodes?shortFilmMarkup(route.category,route.work):route.work.category==='ip'?ipDetailMarkup(route.work):detailMarkup(route.work,route.category);document.title=`${route.work.title} — AIGC内容创作师`;}
  else {content='<section class="not-found"><span class="eyebrow">404 / OUTSIDE THE ORBIT</span><h1>暂未发现这个世界。</h1><a class="text-link" href="/" data-route>返回首页 ↗</a></section>';document.title='未找到页面 — AIGC内容创作师';}
  const activeDiscipline=route.type==='detail'?route.work.category:route.type==='category'?route.category.id:null;
  const bar=activeDiscipline?disciplineBarMarkup(activeDiscipline):'';
  app.innerHTML=`${headerMarkup()}<main id="main" class="${route.type==='home'?'':'route-enter'}" tabindex="-1">${bar}${content}</main>${footerMarkup()}`;
  document.body.dataset.page=route.type;
  const track=app.querySelector('.discipline-bar-track'),selectedLink=track?.querySelector('[aria-current="page"]');
  if(selectedLink&&track.scrollWidth>track.clientWidth){track.scrollLeft+=selectedLink.getBoundingClientRect().left-track.getBoundingClientRect().left-(track.clientWidth-selectedLink.offsetWidth)/2;}
  const isImageGallery=route.type==='category'&&route.category.medium==='image'&&route.category.id!=='ip';
  document.body.classList.toggle('is-poster-gallery',isImageGallery||(route.type==='category'&&route.category.medium==='video'));
  document.body.classList.toggle('is-work-route',Boolean(activeDiscipline));
  backgrounds.setRoute(route);
  if(route.type==='home')cleanups.push(mountHome(app));
  if(isImageGallery)cleanups.push(route.category.id==='banner'?mountBanner(route.category,app):mountCarousel(route.category,app));
  if(route.category?.medium==='video')cleanups.push(mountShortFilm(app));
  if(activeDiscipline==='ip')cleanups.push(mountIP(app,route.work));
  cleanups.push(mountMotion(app),mountInteractions(app),mountVideoQR(app));
  if(activeDiscipline!=='ip')cleanups.push(mountMedia(app));
  const main=app.querySelector('main');main.focus({preventScroll:true});
}
function scrollToDestination(hash,behavior='instant',saved){
  if(hash){let id;try{id=decodeURIComponent(hash.slice(1));}catch{id='';}let target=document.getElementById(id);if(id==='top'&&target?.hidden)target=document.getElementById('creator');if(target){target.scrollIntoView({behavior,block:'start'});return;}}
  window.scrollTo({top:saved??0,behavior});
}
function navigate(url,{pop=false,source=null}={}){
  const version=++navigationVersion;clearTimeout(navigationTimer);
  app.querySelectorAll('.orbit-departing,.route-departing,.node-departing').forEach(el=>el.classList.remove('orbit-departing','route-departing','node-departing'));
  const destination=resolveRoute(url.pathname);
  if(destination.category)orbitState.index=['poster','banner','ip','short-film','comic-drama','tvc','ai-live-action','game'].indexOf(destination.category.id);
  const commit=()=>{
  if(version!==navigationVersion)return;
  const previous=location.pathname+location.hash;
  if(!pop){positions.set(previous,scrollY);history.pushState({},'',url);}
  if(currentPath===url.pathname){scrollToDestination(url.hash,reducedMotion()?'instant':'smooth',pop?positions.get(url.pathname+url.hash):0);return;}
  // The persistent film compositor crossfades behind a short CSS content entrance.
  // Commit after the bounded exit timer; newer navigation cancels the pending commit.
  render();scrollToDestination(url.hash,'instant',pop?positions.get(url.pathname+url.hash):0);
  if(url.hash==='#work-orbit')app.querySelector('.orbit-layout')?.classList.add('orbit-arriving');
  };
  if(!pop&&!reducedMotion()&&currentPath!==url.pathname&&!source?.matches('.orbit-node,.discipline-link')){
    const orbit=source?.closest('.orbit-layout');
    if(orbit){orbit.classList.add('orbit-departing');source.classList.add('node-departing');}
    else app.querySelector('main')?.classList.add('route-departing');
    navigationTimer=setTimeout(commit,orbit?320:160);
  }else commit();
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-route],a[data-scroll]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
  event.preventDefault();navigate(url,{source:link});
});
addEventListener('popstate',()=>navigate(new URL(location.href),{pop:true}));
render();requestAnimationFrame(()=>scrollToDestination(location.hash));


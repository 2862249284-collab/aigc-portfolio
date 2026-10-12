import {reducedMotion} from '../lib/dom.js';
let completed=false;
const storageKey='portfolio-intro-completed';
export function openingMarkup(){return `<section class="auto-intro" id="top" aria-label="自动开场动画"><video class="intro-video" muted playsinline preload="none" poster="/assets/backgrounds/01-street.webp" aria-hidden="true"></video><div class="intro-title"></div><button class="intro-skip" type="button">跳过 INTRO →</button></section>`;}
export function mountOpening(root){
 const section=root.querySelector('.auto-intro'),video=section.querySelector('video'),controller=new AbortController(),{signal}=controller;
 let state='idle',fadeTimer=0,loadTimer=0,stallTimer=0,seen=completed;
 try{seen ||= sessionStorage.getItem(storageKey)==='1';}catch{}
 const title=root.querySelector('.hero-title-wrap'),anchor=document.createComment('hero title position');
 const locked=[...root.querySelectorAll('main > section:not(.auto-intro),.site-header,.site-footer,.skip-link')];
 const unlock=()=>{locked.forEach(node=>node.inert=false);document.body.classList.remove('in-opening','intro-playing');document.documentElement.classList.remove('intro-playing');};
 const restoreTitle=()=>{if(anchor.parentNode){anchor.replaceWith(title);title.style.removeProperty('opacity');}};
 const stop=()=>{controller.abort();clearTimeout(loadTimer);clearTimeout(stallTimer);video.pause();};
 const finish=()=>{
  if(state==='leaving'||state==='done')return;state='leaving';completed=true;try{sessionStorage.setItem(storageKey,'1');}catch{}
  stop();section.classList.add('intro-leaving');
  fadeTimer=setTimeout(()=>{state='done';section.hidden=true;restoreTitle();unlock();root.querySelector('.hero')?.classList.add('revealed');root.querySelector('#main')?.focus({preventScroll:true});video.removeAttribute('src');video.load();},reducedMotion()?0:500);
 };
 if(seen||(location.hash&&location.hash!=='#top')||reducedMotion()){state='done';section.hidden=true;return()=>{};}
 state='loading';document.body.classList.add('in-opening','intro-playing');document.documentElement.classList.add('intro-playing');locked.forEach(node=>node.inert=true);
 if(title){title.before(anchor);section.querySelector('.intro-title').append(title);}
 section.querySelector('button').focus({preventScroll:true});
 const block=event=>event.preventDefault();addEventListener('wheel',block,{passive:false,signal});addEventListener('touchmove',block,{passive:false,signal});
 addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))event.preventDefault();if(event.key==='Escape')finish();},{signal});
 section.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();finish();},{signal});
 video.addEventListener('loadedmetadata',()=>{if(state==='leaving'||state==='done')return;video.playbackRate=video.duration/6;video.play().catch(finish);},{signal});
 video.addEventListener('playing',()=>{state='playing';clearTimeout(loadTimer);clearTimeout(stallTimer);},{signal});
 video.addEventListener('waiting',()=>{clearTimeout(stallTimer);stallTimer=setTimeout(finish,8000);},{signal});
 video.addEventListener('ended',finish,{signal});video.addEventListener('error',finish,{signal});
 video.muted=true;video.autoplay=true;video.preload='auto';video.src='/assets/source/plate-original.mp4';video.load();loadTimer=setTimeout(finish,10000);
 return()=>{stop();clearTimeout(fadeTimer);restoreTitle();unlock();section.hidden=true;video.removeAttribute('src');video.load();};
}

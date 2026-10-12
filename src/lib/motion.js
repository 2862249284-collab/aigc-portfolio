import { clamp, reducedMotion } from './dom.js';

// One observer and one scroll listener per mounted page; returned disposer owns both.
export function mountMotion(root) {
  const controller=new AbortController();
  const query=matchMedia('(prefers-reduced-motion: reduce)');
  const elements=[...root.querySelectorAll('[data-reveal]')];
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}
  },{threshold:0.12});
  elements.forEach(element=>{element.classList.add('reveal-ready');observer.observe(element);});
  const hero=root.querySelector('.hero'), art=root.querySelector('.hero-art'), title=root.querySelector('.hero-title-group');
  if(hero)observer.observe(hero);
  const portrait=root.querySelector('.portrait-media');
  let frame=0,pointerFrame=0,heroPointer=null,portraitPointer=null;
  function paintPointer(){
    pointerFrame=0;
    if(document.hidden||reducedMotion())return;
    if(hero&&heroPointer){const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',`${(heroPointer.x/r.width-.5)*12}px`);hero.style.setProperty('--my',`${((heroPointer.y-r.top)/r.height-.5)*12}px`);}
    if(portrait&&portraitPointer){const r=portrait.getBoundingClientRect();portrait.style.setProperty('--portrait-x',`${(portraitPointer.x-r.left-r.width/2)*.018}px`);}
  }
  const queuePointer=()=>{if(!pointerFrame)pointerFrame=requestAnimationFrame(paintPointer);};
  function update(){
    frame=0;const reduced=reducedMotion();
    if(hero&&title){
      const p=clamp(-hero.getBoundingClientRect().top/(innerHeight*.85));
      title.style.opacity=1-p;
      title.style.setProperty('--scroll-scale',reduced?1:1+p*.24);
      if(art)art.style.opacity=1-p*.8;
    }
    if(portrait){
      const p=clamp(portrait.getBoundingClientRect().top/innerHeight,-1,1);
      portrait.style.setProperty('--portrait-scale',reduced?1:1.03+(1-p)*.025);
    }
  }
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  addEventListener('scroll',queue,{passive:true,signal:controller.signal});
  addEventListener('resize',queue,{passive:true,signal:controller.signal});
  query.addEventListener('change',queue,{signal:controller.signal});
  if(hero){
    hero.addEventListener('pointermove',event=>{
      if(reducedMotion()||event.pointerType!=='mouse')return;
      heroPointer={x:event.clientX,y:event.clientY};queuePointer();
    },{passive:true,signal:controller.signal});
    hero.addEventListener('pointerleave',()=>{heroPointer=null;hero.style.setProperty('--mx','0px');hero.style.setProperty('--my','0px');},{signal:controller.signal});
  }
  if(portrait){
    portrait.addEventListener('pointermove',event=>{
      if(reducedMotion()||event.pointerType!=='mouse')return;
      portraitPointer={x:event.clientX};queuePointer();
    },{passive:true,signal:controller.signal});
    portrait.addEventListener('pointerleave',()=>{portraitPointer=null;portrait.style.setProperty('--portrait-x','0px');},{signal:controller.signal});
  }
  update();return ()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);};
}

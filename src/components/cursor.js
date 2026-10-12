import { reducedMotion } from '../lib/dom.js';

// A quiet custom cursor layered on top of the native one. The system pointer is
// never hidden, so the site stays usable even if the layer is removed.
export function createCursor(){
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!fine)return ()=>{};
  const layer=document.createElement('div');
  layer.className='cursor-layer';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<span class="cursor-dot"></span><span class="cursor-ring"><span class="cursor-label"></span></span>';
  document.body.append(layer);
  const ring=layer.querySelector('.cursor-ring'),label=layer.querySelector('.cursor-label');
  const controller=new AbortController();const {signal}=controller;
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,frame=0,moved=false;
  const stateFor=target=>{
    if(!target||!target.closest)return '';
    const holder=target.closest('[data-cursor]');
    if(holder)return holder.dataset.cursor||'';
    if(target.closest('video,[data-fullscreen]'))return 'play';
    if(target.closest('.project-cover,.poster-slide,.image-zoom,.image-shell img,[data-cursor-view]'))return 'view';
    if(target.closest('a[href],button,[role="button"],summary,label'))return 'link';
    return '';
  };
  const LABELS={view:'VIEW',play:'PLAY',link:'',drag:'DRAG'};
  const apply=target=>{
    const state=stateFor(target);
    if(layer.dataset.state===state)return;
    if(state)layer.dataset.state=state;else delete layer.dataset.state;
    label.textContent=LABELS[state]||'';
  };
  const draw=()=>{
    frame=0;
    const ease=reducedMotion()?1:1-Math.exp(-0.18);
    x+=(tx-x)*ease;y+=(ty-y)*ease;
    layer.style.setProperty('--cx',`${x.toFixed(1)}px`);
    layer.style.setProperty('--cy',`${y.toFixed(1)}px`);
    if(Math.abs(tx-x)>0.4||Math.abs(ty-y)>0.4)frame=requestAnimationFrame(draw);
  };
  const wake=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    tx=event.clientX;ty=event.clientY;
    if(!moved){x=tx;y=ty;moved=true;layer.classList.add('is-active');}
    apply(event.target);wake();
  },{passive:true,signal});
  addEventListener('pointerover',event=>apply(event.target),{passive:true,signal});
  addEventListener('pointerdown',()=>layer.classList.add('is-pressed'),{passive:true,signal});
  addEventListener('pointerup',()=>layer.classList.remove('is-pressed'),{passive:true,signal});
  document.addEventListener('mouseleave',()=>layer.classList.remove('is-active'),{signal});
  addEventListener('blur',()=>layer.classList.remove('is-active'),{signal});
  return ()=>{controller.abort();cancelAnimationFrame(frame);layer.remove();};
}

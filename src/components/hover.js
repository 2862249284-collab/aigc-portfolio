import { clamp, reducedMotion } from '../lib/dom.js';

// Magnetic buttons, pointer-driven 3D tilt and a soft gloss sweep. Every effect
// is transform/opacity only and is disabled for touch and reduced-motion users.
const MAGNETIC='[data-magnetic],.site-header nav a,.category-tabs a,.orbit-open,.poster-arrow,.back-link,.next-category a';
const TILT='[data-tilt],.project-card';

export function mountInteractions(root){
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!fine||reducedMotion())return ()=>{};
  const controller=new AbortController();const {signal}=controller;
  const cancels=[];let disposed=false;
  const magnet=(element)=>{
    const strength=Number(element.dataset.magnet||13);
    let tx=0,ty=0,x=0,y=0,frame=0,settled=true;
    const tick=()=>{
      frame=0;if(disposed||document.hidden)return;const ease=0.22;
      x+=(tx-x)*ease;y+=(ty-y)*ease;
      element.style.setProperty('--magnet-x',`${x.toFixed(2)}px`);
      element.style.setProperty('--magnet-y',`${y.toFixed(2)}px`);
      if(Math.abs(tx-x)>0.12||Math.abs(ty-y)>0.12)frame=requestAnimationFrame(tick);
      else if(settled){element.style.setProperty('--magnet-x','0px');element.style.setProperty('--magnet-y','0px');}
    };
    cancels.push(()=>cancelAnimationFrame(frame));
    const wake=()=>{if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick);};
    element.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const rect=element.getBoundingClientRect();
      tx=clamp((event.clientX-(rect.left+rect.width/2))/rect.width*2,-1,1)*strength;
      ty=clamp((event.clientY-(rect.top+rect.height/2))/rect.height*2,-1,1)*strength;
      settled=false;wake();
    },{passive:true,signal});
    element.addEventListener('pointerleave',()=>{tx=0;ty=0;settled=true;wake();},{signal});
  };
  const tilt=(element)=>{
    const strength=Number(element.dataset.tilt||1);
    const reset=()=>{
      element.style.setProperty('--tilt-x','0deg');
      element.style.setProperty('--tilt-y','0deg');
      element.style.setProperty('--gloss-x','50%');
      element.style.setProperty('--gloss-y','50%');
      element.style.removeProperty('--tilt-scale');
    };
    element.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const rect=element.getBoundingClientRect();
      const px=(event.clientX-rect.left)/rect.width-.5;
      const py=(event.clientY-rect.top)/rect.height-.5;
      element.style.setProperty('--tilt-x',`${(-py*6*strength).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y',`${(px*8*strength).toFixed(2)}deg`);
      element.style.setProperty('--gloss-x',`${((px+.5)*100).toFixed(1)}%`);
      element.style.setProperty('--gloss-y',`${((py+.5)*100).toFixed(1)}%`);
    },{passive:true,signal});
    element.addEventListener('pointerenter',()=>element.style.setProperty('--tilt-scale','1.012'),{signal});
    element.addEventListener('pointerleave',reset,{signal});
  };
  root.querySelectorAll(MAGNETIC).forEach(magnet);
  root.querySelectorAll(TILT).forEach(tilt);
  return ()=>{disposed=true;controller.abort();cancels.forEach(cancel=>cancel());};
}

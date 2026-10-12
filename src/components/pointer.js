import { clamp } from '../lib/dom.js';

// Model-independent normalized pointer target, with frame-rate-independent damping.
export function createPointerTracker(element) {
  let targetX=0,targetY=0,x=0,y=0;
  const controller=new AbortController();
  element.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    const rect=element.getBoundingClientRect();
    targetX=clamp((event.clientX-rect.left)/rect.width*2-1,-1,1);
    targetY=clamp((event.clientY-rect.top)/rect.height*2-1,-1,1);
  },{passive:true,signal:controller.signal});
  element.addEventListener('pointerleave',()=>{targetX=targetY=0;},{signal:controller.signal});
  return {
    step(dt){const amount=1-Math.exp(-dt*5);x+=(targetX-x)*amount;y+=(targetY-y)*amount;return {x,y};},
    dispose(){controller.abort();}
  };
}

import { backgroundFrames, backgroundAssignments as assignment } from '../data/backgrounds.js';
import { clamp, reducedMotion } from '../lib/dom.js';

// The original video frames are immutable. A single persistent compositor stays
// behind all routes so media never disappears between two page renders.
export function createBackgrounds(){
  const root=document.createElement('div');root.className='cinema-backdrop';root.setAttribute('aria-hidden','true');
  const layers=backgroundFrames.map((src,index)=>{
    const img=new Image();img.className='cinema-frame';img.alt='';img.decoding='async';img.dataset.src=src;img.dataset.frame=index;
    root.append(img);return img;
  });
  const shade=document.createElement('div');shade.className='cinema-shade';root.append(shade);document.body.prepend(root);
  const ready=layers.map(()=>false);
  let route={type:'home'},frame=0,pointerFrame=0,pointerX=0,pointerY=0,disposed=false;
  const controller=new AbortController();
  function load(i){const img=layers[i];if(!img||img.hasAttribute('src'))return;img.src=img.dataset.src;img.decode().then(()=>{if(!disposed){ready[i]=true;schedule();}}).catch(()=>{});}
  const smooth=t=>t*t*(3-2*t);
  function show(weights){
    weights.forEach(([i])=>load(i));
    const usable=weights.filter(([i])=>ready[i]);
    if(!usable.length)return;
    const sum=usable.reduce((total,[,weight])=>total+weight,0);
    if(sum<=0)return; // Keep the previous frame if the next asset is still decoding.
    layers.forEach((img,i)=>{const entry=usable.find(([index])=>index===i);img.style.opacity=entry?entry[1]/sum:0;});
  }
  function update(){
    frame=0;if(disposed)return;
    root.dataset.mode=route.type;
    if(route.type==='home'){
      const stops=[['creator',assignment.hero],['about-me',assignment.about],['work-orbit',assignment.orbit],['contact',assignment.contact]];
      let from=stops[0][1],to=from,mix=0;
      for(let i=1;i<stops.length;i++){
        const section=document.getElementById(stops[i][0]);if(!section)continue;
        const top=section.getBoundingClientRect().top;
        if(top<innerHeight*.85){from=stops[i-1][1];to=stops[i][1];mix=smooth(clamp((innerHeight*.85-top)/(innerHeight*.85)));}
      }
      show(from===to?[[from,1]]:[[from,1-mix],[to,mix]]);
    }else{
      const index=route.type==='category'?assignment.categories[route.category.id]:assignment.detail;
      show([[index??assignment.hero,1]]);
    }
    root.style.setProperty('--bg-scale',reducedMotion()?1:1.035);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true,signal:controller.signal});
  addEventListener('resize',schedule,{passive:true,signal:controller.signal});
  addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||reducedMotion()||document.hidden)return;
    pointerX=event.clientX;pointerY=event.clientY;
    if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{
      pointerFrame=0;
      root.style.setProperty('--bg-x',`${(pointerX/innerWidth-.5)*-9}px`);
      root.style.setProperty('--bg-y',`${(pointerY/innerHeight-.5)*-6}px`);
    });
  },{passive:true,signal:controller.signal});
  return {setRoute(next){route=next;update();schedule();},dispose(){disposed=true;controller.abort();cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);root.remove();}};
}

import { categories } from '../data/categories.js';
import { escapeHTML as e, wrap, reducedMotion, arrow } from '../lib/dom.js';

export const orbitState={index:0};
export function orbitMarkup(){
  return `<div class="orbit-layout">
    <div class="orbit-side"><span class="eyebrow">EXPLORE BY DISCIPLINE</span><p>每一种媒介，<br>都是新的可能。</p><span class="orbit-side-line"></span><span class="micro">08 CREATIVE DIRECTIONS</span></div>
    <div class="orbit" tabindex="0" role="region" aria-label="作品分类圆环，方向键切换，回车进入分类">
      <div class="orbit-guide orbit-guide--outer" aria-hidden="true"></div><div class="orbit-guide orbit-guide--inner" aria-hidden="true"></div>
      <span class="orbit-cross" aria-hidden="true">+</span>
      <div class="doll-host"><div class="doll-fallback" aria-hidden="true"><div class="fallback-head"><i></i><i></i></div><div class="fallback-body"></div></div></div>
      <div class="orbit-caption"><span class="micro">MUSE — DIGITAL COMPANION</span></div>
      <div class="orbit-nodes">${categories.map((category,i)=>`<a class="orbit-node" href="/works/${category.id}" data-route data-index="${i}" aria-label="浏览${e(category.name)}作品"><span class="node-number">${String(i+1).padStart(2,'0')}</span><span class="node-label">${e(category.name)}</span><span class="node-dot" aria-hidden="true"></span></a>`).join('')}</div>
    </div>
    <div class="orbit-selection"><span class="micro">SELECTED DISCIPLINE</span><div class="orbit-current" aria-live="polite"><span class="orbit-index">01 / 08</span><h3>海报</h3><p>让一个画面，承载所有想象。</p></div><span class="micro orbit-hint">点击分类直接进入作品</span></div>
  </div>
  <div class="orbit-toolbar"><span class="orbit-instruction"><span class="tiny-wheel" aria-hidden="true"></span>圆环内滚轮切换 · 点击分类进入</span><div class="orbit-controls"><button type="button" data-orbit-step="-1" aria-label="上一个分类">←</button><span class="orbit-count">01 / 08</span><button type="button" data-orbit-step="1" aria-label="下一个分类">→</button></div><a class="orbit-leave" href="#contact" data-scroll>继续向下 ↓</a></div>`;
}

export function mountOrbit(section){
  const orbit=section.querySelector('.orbit'),nodes=[...section.querySelectorAll('.orbit-node')];
  const controller=new AbortController();const {signal}=controller;
  let target=orbitState.index,current=target,frame=0,last=0,active=false,total=0,lastWheel=0,lockedUntil=0,gestureConsumed=false;
  let radiusX=0,radiusY=0,mobile=false,touch=null;
  const selection=section.querySelector('.orbit-current');
  function announce(){
    const index=wrap(target,categories.length),category=categories[index];orbitState.index=index;
    orbit.dataset.selected=category.id;
    selection.innerHTML=`<span class="orbit-index">${String(index+1).padStart(2,'0')} / 08</span><h3>${e(category.name)}</h3><p>${e(category.description)}</p>`;
    section.querySelector('.orbit-count').textContent=`${String(index+1).padStart(2,'0')} / 08`;
    nodes.forEach((node,i)=>{node.classList.toggle('is-selected',i===index);if(i===index)node.setAttribute('aria-current','true');else node.removeAttribute('aria-current');});
  }
  function layout(){
    nodes.forEach((node,i)=>{
      const angle=(i-current)*Math.PI/4+Math.PI/2;
      const depth=(Math.sin(angle)+1)/2;
      const x=Math.cos(angle)*radiusX,y=Math.sin(angle)*radiusY;
      const scale=mobile?.77+depth*.23:.72+depth*.38;
      node.style.transform=`translate(-50%,-50%) translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      node.style.opacity=.42+depth*.58;node.style.zIndex=String(10+Math.round(depth*10));
    });
  }
  function draw(now){
    frame=0;const dt=Math.min((now-(last||now-16))/1000,.05);last=now;
    current=reducedMotion()?target:current+(target-current)*(1-Math.exp(-dt*7.5));
    if(Math.abs(target-current)<.001)current=target;
    layout();if(current!==target)frame=requestAnimationFrame(draw);
  }
  function select(next){target=next;announce();if(!frame){last=0;frame=requestAnimationFrame(draw);}}
  function resize(){const r=orbit.getBoundingClientRect();mobile=r.width<480;radiusX=r.width*(mobile?.36:.39);radiusY=r.height*(mobile?.37:.37);layout();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(orbit);
  const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;},{threshold:.4});observer.observe(orbit);
  // Captures only direct gestures inside the orbit. Edges, the toolbar and Shift+wheel
  // always scroll normally. A wheel gesture is capped at one category change.
  orbit.addEventListener('wheel',event=>{
    if(!active||event.ctrlKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(!event.deltaY)return;
    event.preventDefault();
    const now=performance.now(),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(now-lastWheel>200){total=0;gestureConsumed=false;}
    lastWheel=now;
    if(now<lockedUntil||gestureConsumed)return;
    if(total&&Math.sign(total)!==Math.sign(delta))total=0;
    total+=delta;
    if(Math.abs(total)>=48){select(target+Math.sign(total));total=0;gestureConsumed=true;lockedUntil=now+550;}
  },{passive:false,signal});
  orbit.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key)){
      event.preventDefault();select(event.key==='Home'?0:event.key==='End'?7:target+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1));
    }else if(event.key==='Enter'&&event.target===orbit){event.preventDefault();nodes[wrap(target,categories.length)].click();}
    else if(event.key==='Escape'){event.preventDefault();section.querySelector('.orbit-leave').focus();}
  },{signal});
  section.querySelectorAll('[data-orbit-step]').forEach(button=>button.addEventListener('click',()=>select(target+Number(button.dataset.orbitStep)),{signal}));
  // Keep pointer and keyboard focus stationary; arrows control orbit rotation.
  orbit.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touch={x:event.clientX,y:event.clientY};},{passive:true,signal});
  orbit.addEventListener('pointerup',event=>{
    if(!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){select(target+(dx<0?1:-1));orbit.dataset.swiped='true';setTimeout(()=>delete orbit.dataset.swiped,350);}
  },{passive:true,signal});
  orbit.addEventListener('pointercancel',()=>{touch=null;},{signal});
  orbit.addEventListener('click',event=>{if(orbit.dataset.swiped){event.preventDefault();event.stopPropagation();}},{capture:true,signal});
  announce();resize();
  return ()=>{controller.abort();observer.disconnect();resizeObserver.disconnect();cancelAnimationFrame(frame);};
}

const WIPE_VH=80, TITLE_Q=0.25, ABOUT_IN=[0.18,0.27], ABOUT_OUT=[0.333,0.373];
const SEC2_RAMP=[0.44,0.56], FLY=[0.565,0.655], FLY_STEP=0.20, FLY_DUR=0.60;
const STAT_FROM=0.74, STAT_IN=0.34, STAT_HOLD=0.40, SEC2_ENTER=[0.44,0.49];
const SEC2_SHOW=[0.43,0.77], S2_EMERGE=0.84, PIN_FRAC=0.66;
const BAND_HL=130, BAND_TOP=220, BAND_BOT=160;
const LERP_TAU=8, SNAP=0.002, LRU_MAX=24, LEAD=24, WATCHDOG=60000, FADE_A=[0.93,0.98];
const WIPE_LEAD=1, A=1/3, B=2/3;
const clamp=t=>Math.max(0,Math.min(1,t));
const ramp=(p,a,b)=>clamp((p-a)/(b-a));
const expoOut=t=>t<=0?0:t>=1?1:1-2**(-10*t);
const easeIn=t=>t*t;
const $=s=>document.querySelector(s);
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=reducedQuery.matches;
const stage=$('#stage'), ra=$('#ra'), rb=$('#rb'), title=$('.title'), about=$('.about');
const sec2=$('#sec2'), strip=$('#strip'), runway=$('.runway');
const stats=[...document.querySelectorAll('[data-stat]')];
const blocks=[...strip.querySelectorAll('[data-block]')];
const rows=[...strip.querySelectorAll('.w-col')].map(col=>[...col.children]);
const titleOut=A*TITLE_Q, titleIn=B+(1-B)*(1-TITLE_Q);
let map={}, width=0, height=0, span=1, s2Start=0, s2Pin=0, geometry=[];
let visible=[true,false,false], lastTime=0, aboutValue=0, diagnosticP=null;

function showPage(){requestAnimationFrame(()=>document.documentElement.classList.add('is-ready'));}
document.fonts.ready.then(()=>{showPage();measure();});
setTimeout(showPage,2500);

function nearestIndex(bank,t){
  let lo=0,hi=bank.length-1;
  while(lo<hi){const mid=(lo+hi)>>1;if(bank[mid].ts<t)lo=mid+1;else hi=mid;}
  return lo>0 && t-bank[lo-1].ts<bank[lo].ts-t?lo-1:lo;
}

// One shared bank owns the bitmaps; each layer owns only its display canvas.
function createBank(){return {frames:[],cache:new Map(),pending:new Map(),epoch:0};}
async function bitmapAt(bank,index){
  if(index<0||index>=bank.frames.length)return null;
  if(bank.cache.has(index)){
    const bmp=bank.cache.get(index);bank.cache.delete(index);bank.cache.set(index,bmp);return bmp;
  }
  if(bank.pending.has(index))return bank.pending.get(index);
  const epoch=bank.epoch;
  const task=createImageBitmap(bank.frames[index].blob).then(bmp=>{
    if(epoch!==bank.epoch){bmp.close();return null;}
    bank.cache.set(index,bmp);
    while(bank.cache.size>LRU_MAX){const key=bank.cache.keys().next().value;bank.cache.get(key).close();bank.cache.delete(key);}
    return bmp;
  }).finally(()=>bank.pending.delete(index));
  bank.pending.set(index,task);return task;
}

function createClip(video,canvas){
  const context=canvas.getContext('2d',{alpha:false});
  let bank=createBank(),dur=0,ready=false,run=0,paintRun=0,lastIndex=-1,wanted=-1,painting=false;
  let smooth=null,status='video',error=null;
  video.muted=true;
  const metadata=()=>{dur=video.duration||0;video.pause();try{video.currentTime=0.001;}catch{}};
  video.addEventListener('loadedmetadata',metadata);
  if(video.readyState>=1)metadata();
  function revert(reason){
    ready=false;status='video';error=reason?String(reason.message||reason):null;
    paintRun++;lastIndex=-1;canvas.classList.remove('is-live');
  }
  function raw(t){
    if(video.readyState>=1 && !video.seeking && Math.abs(video.currentTime-t)>0.01){
      try{video.currentTime=Math.min(t,Math.max(0,video.duration-0.001));}catch{}
    }
  }
  async function paint(){
    if(painting)return;
    painting=true;
    const token=paintRun;
    try{
      const index=wanted;
      const bmp=await bitmapAt(bank,index);
      if(token!==paintRun||!ready||!bmp)return;
      if(canvas.width!==bmp.width||canvas.height!==bmp.height){canvas.width=bmp.width;canvas.height=bmp.height;}
      context.drawImage(bmp,0,0);lastIndex=index;
      canvas.classList.add('is-live');
      // Warm the previous frame and the next two without allocating an unbounded queue.
      for(let d=-1;d<=2;d++)if(d)bitmapAt(bank,index+d).catch(()=>{});
    }catch(err){revert(err);}finally{painting=false;}
  }
  function render(t){
    if(!ready){raw(t);return;}
    wanted=nearestIndex(bank.frames,t);
    if(wanted!==lastIndex)void paint();
  }
  function scrub(target,dt){
    if(smooth===null||reduced)smooth=target;
    else smooth+= (target-smooth)*(1-Math.exp(-dt*LERP_TAU));
    if(Math.abs(target-smooth)<SNAP)smooth=target;
    render(smooth);
  }
  async function build(){
    if(reduced||!window.VideoDecoder||!window.MP4Box||!window.createImageBitmap)return false;
    const token=++run,controller=new AbortController();
    let decoder=null,timeout,expired=false;
    status='building';
    const guard=()=>{if(run!==token||expired)throw new Error('Frame bank cancelled');};
    const work=async()=>{
      const response=await fetch(video.getAttribute('src'),{signal:controller.signal});
      if(!response.ok)throw new Error(`Video fetch: ${response.status}`);
      const buffer=await response.arrayBuffer();guard();
      let config,samples;
      // MP4Box callbacks run during appendBuffer; configure before extracting samples.
      function demux(acceleration){
        return new Promise((resolve,reject)=>{
          const file=window.MP4Box.createFile();
          const extracted=[];
          let expected=0;
          file.onError=err=>reject(new Error(`MP4Box: ${err}`));
          file.onReady=info=>{
            try{
              guard();
              const track=info.videoTracks[0];if(!track)throw new Error('No video track');
              dur=track.duration/track.timescale;expected=track.nb_samples;
              const entry=file.getTrackById(track.id).mdia.minf.stbl.stsd.entries[0];
              const box=entry.avcC||entry.hvcC||entry.vpcC||entry.av1C;
              let description;
              if(box){
                const Stream=window.DataStream||window.MP4Box.DataStream;
                const stream=new Stream(undefined,0,Stream.BIG_ENDIAN);box.write(stream);
                description=new Uint8Array(stream.buffer,8);
              }
              config={codec:track.codec,codedWidth:track.video.width,codedHeight:track.video.height,description,hardwareAcceleration:acceleration};
              try{decoder.configure(config);}catch(err){err.decoderStage=true;throw err;}
              file.setExtractionOptions(track.id,null,{nbSamples:LEAD});file.start();
            }catch(err){reject(err);}
          };
          file.onSamples=(_id,_user,chunk)=>{extracted.push(...chunk);if(extracted.length>=expected)resolve(extracted);};
          try{buffer.fileStart=0;file.appendBuffer(buffer);file.flush();}catch(err){reject(err);}
        });
      }
      async function decode(acceleration){
        let failure=null,frameTasks=[],frames=[],attemptLive=true;
        decoder=new VideoDecoder({
          output:frame=>{
            if(!attemptLive||run!==token||expired){frame.close();return;}
            const timestamp=frame.timestamp/1e6;
            const task=(async()=>{
              try{
                const off=document.createElement('canvas');off.width=frame.displayWidth;off.height=frame.displayHeight;
                off.getContext('2d',{alpha:false}).drawImage(frame,0,0);
                frame.close();frame=null;
                const blob=await new Promise((resolve,reject)=>off.toBlob(b=>b?resolve(b):reject(new Error('WebP encode failed')),'image/webp',0.82));
                if(attemptLive&&run===token&&!expired)frames.push({ts:timestamp,blob});
                off.width=off.height=1;
              }catch(err){failure=err;}finally{if(frame)frame.close();}
            })();
            frameTasks.push(task);
          },
          error:err=>{failure=err;}
        });
        try{
          if(!samples)samples=await demux(acceleration);
          else decoder.configure({...config,hardwareAcceleration:acceleration});
          for(let start=0;start<samples.length;start+=LEAD){
            guard();if(failure)throw failure;
            for(const sample of samples.slice(start,start+LEAD)){
              decoder.decode(new EncodedVideoChunk({type:sample.is_sync?'key':'delta',timestamp:Math.round(sample.cts*1e6/sample.timescale),duration:Math.round(sample.duration*1e6/sample.timescale),data:sample.data}));
            }
            // flush() requires the next chunk to be a keyframe. Drain the queue
            // between batches instead, preserving inter-frame codec references.
            while(decoder.decodeQueueSize>0){
              await new Promise(resolve=>setTimeout(resolve,4));
              guard();if(failure)throw failure;
            }
            await Promise.all(frameTasks);frameTasks=[];
            if(failure)throw failure;
          }
          await decoder.flush();await Promise.all(frameTasks);frameTasks=[];
          if(failure)throw failure;
          guard();if(!frames.length)throw new Error('Decoder returned no frames');
          frames.sort((a,b)=>a.ts-b.ts);
          const origin=frames[0].ts;frames.forEach(frame=>frame.ts-=origin);
          return frames;
        }finally{
          attemptLive=false;
          if(decoder.state!=='closed')decoder.close();
          await Promise.all(frameTasks);
        }
      }
      let frames;
      try{frames=await decode('no-preference');}
      catch(err){
        guard();
        // Retry decoder failures only. Fetch and container failures have no samples.
        if(!samples&&!err.decoderStage)throw err;
        frames=await decode('prefer-software');
      }
      guard();bank.frames=frames;ready=true;status='frames';error=null;return true;
    };
    try{
      return await Promise.race([work(),new Promise((_,reject)=>{
        timeout=setTimeout(()=>{expired=true;controller.abort();if(decoder&&decoder.state!=='closed')decoder.close();reject(new Error('Frame bank watchdog expired'));},WATCHDOG);
      })]);
    }catch(err){revert(err);return false;}finally{clearTimeout(timeout);}
  }
  function shareBank(source){bank=source.bank;dur=source.dur;ready=source.ready;status=ready?'frames':'video';}
  return {build,shareBank,scrub,render,revert,get bank(){return bank;},get dur(){return dur;},get ready(){return ready;},get status(){return status;},get error(){return error;},get time(){return smooth;}};
}
const clips=[1,2,3].map(i=>createClip($(`#v${i}`),$(`#c${i}`)));

function measure(){
  width=innerWidth;height=innerHeight;span=Math.max(1,runway.offsetHeight-height);
  const wipe=Math.min(0.28,(WIPE_VH*height/100)/span);
  map={titleOut,titleIn,wipe,a:A,b:B,span};
  geometry=blocks.map(el=>({el,top:el.offsetTop,height:el.offsetHeight}));
  s2Start=S2_EMERGE*height-geometry[0].top;
  const list=geometry[2],desc=geometry[3];
  s2Pin=PIN_FRAC*height-(list.top+Math.max(list.top+list.height,desc.top+desc.height))/2;
}
function exit(el,value){
  const e=Number(clamp(value).toFixed(3));
  if(el.dataset.exit===String(e))return;
  el.dataset.exit=e;el.style.setProperty('--exit',e);
  el.classList.toggle('is-exiting',e>0&&e<1);el.classList.toggle('is-gone',e>=1);
}
function updateTitle(p){exit(title,p<=A?ramp(p,0,titleOut):1-ramp(p,titleIn,1));}
function updateStats(p){
  const slot=(titleIn-STAT_FROM)/stats.length;
  stats.forEach((el,i)=>{
    const q=(p-STAT_FROM-i*slot)/slot;
    const e=q<0||q>=1?1:q<STAT_IN?1-q/STAT_IN:q<STAT_IN+STAT_HOLD?0:(q-STAT_IN-STAT_HOLD)/(1-STAT_IN-STAT_HOLD);
    exit(el,e);
  });
}
function updateAbout(p){
  const e=expoOut(ramp(p,...ABOUT_IN))*(1-expoOut(ramp(p,...ABOUT_OUT)));
  aboutValue=e;about.style.setProperty('--in',e.toFixed(4));
  about.classList.toggle('is-anim',e>0&&e<1);about.classList.toggle('is-hidden',e<=0);
}
function updateReveals(p){
  const a=ramp(p,A,A+map.wipe),b=ramp(p,B,B+map.wipe);
  ra.style.setProperty('--reveal',a);rb.style.setProperty('--reveal',b);
  stage.style.setProperty('--stage-out',ramp(a,...FADE_A));
  stage.classList.toggle('is-covered',a>=1);ra.classList.toggle('is-covered',b>=1);
  visible=[a<1,a>0&&b<1,b>0];
}
function updateSec2(p){
  const show=p>=SEC2_SHOW[0]&&p<=SEC2_SHOW[1];
  sec2.classList.toggle('is-hidden',!show);sec2.setAttribute('aria-hidden',String(!show));
  if(!show)return;
  const y=reduced?s2Pin:s2Start+(s2Pin-s2Start)*ramp(p,...SEC2_RAMP);
  strip.style.setProperty('--s2y',`${y.toFixed(2)}px`);
  geometry.forEach(({el,top,height:h},i)=>{
    const t=top+y,b=t+h;
    let o=Math.min(expoOut(clamp((t-BAND_HL)/BAND_TOP)),expoOut(clamp((height-b)/BAND_BOT)));
    if(i===0){
      o*=expoOut(ramp(p,...SEC2_ENTER));el.style.setProperty('--wb',`${((1-o)**2*6).toFixed(2)}px`);
      el.classList.toggle('is-entering',o>0&&o<1);
    }
    el.style.setProperty('--o',o.toFixed(4));
  });
  const fly=ramp(p,...FLY);
  rows.forEach(col=>col.forEach((el,i)=>{
    const f=reduced?0:easeIn(clamp((fly-i*FLY_STEP)/FLY_DUR));
    el.style.setProperty('--fly',f.toFixed(4));el.classList.toggle('is-flying',f>0&&f<1);
  }));
}
function updateScrub(p,dt){
  const dur=clips[0].dur;
  const lead=Math.min(WIPE_LEAD,Math.max(0,(dur-0.002)/2));
  const duration=Math.max(0,dur-2*lead-0.001);
  clips.forEach((clip,i)=>{if(visible[i])clip.scrub(reduced?0:p*duration+i*lead,dt);});
}
function drive(p,dt=1/60){
  p=clamp(p);updateTitle(p);updateStats(p);updateAbout(p);updateReveals(p);updateSec2(p);updateScrub(p,dt);
}
function progress(){return clamp(scrollY/span);}
function tick(time){
  if(width!==innerWidth||height!==innerHeight)measure();
  const dt=lastTime?Math.min(0.1,(time-lastTime)/1000):1/60;lastTime=time;
  drive(diagnosticP??progress(),dt);requestAnimationFrame(tick);
}
let resizeTimer;
function scheduleMeasure(){clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120);}
addEventListener('resize',scheduleMeasure);addEventListener('orientationchange',scheduleMeasure);addEventListener('load',measure);
addEventListener('scroll',()=>{diagnosticP=null;},{passive:true});
reducedQuery.addEventListener('change',()=>{reduced=reducedQuery.matches;measure();});
function jump(event,p){event.preventDefault();diagnosticP=null;window.scrollTo({top:p*span,behavior:reduced?'instant':'smooth'});}
$('#menu').addEventListener('click',event=>jump(event,0.56));
$('#about').addEventListener('click',event=>jump(event,0.29));
Object.defineProperty(window,'__plate',{value:Object.freeze({
  get clips(){return clips.map(clip=>Object.freeze({duration:clip.dur,ready:clip.ready,status:clip.status,frames:clip.bank.frames.length,cached:clip.bank.cache.size,time:clip.time,error:clip.error}));},
  get map(){return Object.freeze({...map});},get aboutIn(){return aboutValue;},
  get stats(){return stats.map(el=>({label:el.firstElementChild.textContent,exit:Number(el.dataset.exit),gone:el.classList.contains('is-gone')}));},
  get sec2(){return Object.freeze({start:s2Start,pin:s2Pin,hidden:sec2.classList.contains('is-hidden'),y:strip.style.getPropertyValue('--s2y')});},
  p:progress,drive(p){diagnosticP=clamp(p);measure();drive(diagnosticP,1);},seek(i,t){clips[i]?.render(Math.max(0,t));}
}),writable:false,configurable:false});
measure();drive(progress());requestAnimationFrame(tick);
// Deferred vendor script is available by DOMContentLoaded even if module fetch finishes first.
async function buildBank(){if(await clips[0].build())clips.slice(1).forEach(clip=>clip.shareBank(clips[0]));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildBank,{once:true});else void buildBank();

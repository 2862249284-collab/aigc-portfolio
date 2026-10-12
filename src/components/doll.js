import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createDollModel, disposeObject } from './doll-model.js';
import { createPointerTracker } from './pointer.js';
import { reducedMotion, assetURL } from '../lib/dom.js';

export function mountDoll(host,trackingArea,config) {
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
  catch {host.dataset.renderer='fallback';return ()=>{};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;
  renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);host.dataset.renderer='webgl';
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(33,1,.1,50);camera.position.set(0,.25,7.4);camera.lookAt(0,.1,0);
  const environment=new RoomEnvironment();const generator=new THREE.PMREMGenerator(renderer);
  const envTarget=generator.fromScene(environment,.035);scene.environment=envTarget.texture;generator.dispose();environment.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x46484c,2));
  const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-3,5,4);scene.add(light);
  const rim=new THREE.DirectionalLight(0xffffff,3);rim.position.set(4,1,-2);scene.add(rim);
  let model=createDollModel();scene.add(model.root);
  const pointer=createPointerTracker(trackingArea);
  const controller=new AbortController();
  let disposed=false,inView=false,frame=0,last=0,mixer=null,baseHead=null;
  const offsetEuler=new THREE.Euler(),offsetQuaternion=new THREE.Quaternion();
  const setHeadBase=()=>{baseHead=model.head?.quaternion.clone();};setHeadBase();
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  function draw(now){
    frame=0;if(disposed||!inView||document.hidden)return;
    const dt=Math.min((now-(last||now))/1000,.05);last=now;
    const motion=!reducedMotion();const {x,y}=pointer.step(dt);const time=now/1000;
    if(motion)mixer?.update(dt);
    model.root.position.y=motion?Math.sin(time*1.3)*.07:0;
    model.root.rotation.y=(config.rotationY||0)+(motion?x*.13:0);
    if(model.head&&baseHead){
      offsetEuler.set(motion?y*.15:0,motion?x*.28:0,motion?-x*.04:0);
      offsetQuaternion.setFromEuler(offsetEuler);
      model.head.quaternion.copy(baseHead).multiply(offsetQuaternion);
    }
    if(model.eyes){model.eyes.position.x=motion?x*.035:0;model.eyes.position.y=motion?-y*.025:0;}
    model.arms?.forEach((arm,i)=>{arm.rotation.z=(i?1:-1)*.25+(motion?x*.08+Math.sin(time*1.1)*.025:0);});
    renderer.render(scene,camera);
    if(motion)frame=requestAnimationFrame(draw);
  }
  const resume=()=>{if(!frame&&!disposed&&inView&&!document.hidden){last=0;frame=requestAnimationFrame(draw);}};
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)resume();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'});observer.observe(host);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();},{signal:controller.signal});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',resume,{signal:controller.signal});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;host.dataset.renderer='fallback';},{signal:controller.signal});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';resume();},{signal:controller.signal});
  const modelURL=assetURL(config.model);
  if(modelURL){
    import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().loadAsync(modelURL)).then(gltf=>{
      if(disposed){disposeObject(gltf.scene);return;}
      scene.remove(model.root);disposeObject(model.root);
      const imported=gltf.scene,root=new THREE.Group();root.add(imported);
      const box=new THREE.Box3().setFromObject(imported),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      imported.position.sub(center);root.scale.setScalar(2.9/Math.max(size.x,size.y,size.z,.001)*(config.scale||1));
      model={root,head:config.headNode?imported.getObjectByName(config.headNode):null};setHeadBase();scene.add(root);
      if(gltf.animations.length){mixer=new THREE.AnimationMixer(imported);mixer.clipAction(gltf.animations[0]).play();}
      resume();
    }).catch(()=>{if(!disposed)host.dataset.model='procedural-fallback';});
  }
  return ()=>{
    disposed=true;cancelAnimationFrame(frame);controller.abort();observer.disconnect();resizeObserver.disconnect();pointer.dispose();
    if(mixer){mixer.stopAllAction();mixer.uncacheRoot(mixer.getRoot());}
    disposeObject(model.root);envTarget.dispose();renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  };
}

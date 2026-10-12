import {resume} from '../data/resume.js';
import { profile } from '../data/profile.js';
import { escapeHTML as e, assetURL, arrow } from '../lib/dom.js';
import { orbitMarkup, mountOrbit } from '../components/orbit.js';
import { openingMarkup, mountOpening } from '../components/opening.js';
import { appEntryMarkup, mountAppEntry } from '../components/app-card.js';

export function homeMarkup(){
  const portrait=assetURL(profile.portrait);
  return `${openingMarkup()}<section class="hero" id="creator" aria-labelledby="hero-heading">
    <div class="hero-topline"><span>INDEPENDENT CREATIVE PRACTICE</span><span>PORTFOLIO — VOL. 01</span></div>
    <div class="hero-title-wrap"><span class="hero-eyebrow">在真实之外，创造可能。</span>
      <div class="hero-title-group">
        <h1 class="hero-title-main" id="hero-heading">AI漫剧</h1>
        <h2 class="hero-title-sub">AI视觉设计师</h2>
      </div>
      <div class="hero-title-bottom"><span>AIGC CREATOR</span><p>${e(profile.english)}</p></div>
    </div>
    <div class="hero-bottom"><a class="scroll-cue" href="#about-me" data-scroll><span class="scroll-arrow">↓</span><span>向下滑动探索<small>SCROLL TO EXPLORE</small></span></a><p>以技术为笔，<br>让想象拥有形状。</p><span class="hero-coordinate micro">ART × TECHNOLOGY<br>© ${new Date().getFullYear()}</span></div>
  </section>
  <section class="about-section light-section" id="about-me" aria-labelledby="about-heading">
    <div class="section-heading" data-reveal><span class="section-number">01 / ABOUT ME</span><span class="micro">BEHIND THE IMAGINATION</span><span class="section-plus" aria-hidden="true">+</span></div>
    <div class="about-layout about-profile-layout"><div class="portrait-column" data-reveal><div class="portrait-frame has-portrait"><div class="portrait-media">${portrait?`<img src="${e(portrait)}" alt="${e(profile.portraitAlt)}" loading="lazy" decoding="async">`:''}</div></div><div class="portrait-caption"><span>${e(profile.name)}</span><span>AIGC CREATOR</span></div></div>
    <div class="about-copy"><span class="eyebrow" data-reveal>ABOUT ME</span><h2 id="about-heading" data-reveal>个人简介</h2><div class="about-body" data-reveal><h3>${e(profile.introduction)}</h3>${profile.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}</div><section class="resume-facts" data-reveal aria-label="个人资料"><dl>${resume.facts.filter(([label])=>label!=='求职方向').map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl></section><section class="about-skills" data-reveal><h3>核心能力</h3><ul>${profile.disciplines.map(item=>`<li>${e(item)}</li>`).join('')}</ul></section><section class="resume-employment" data-reveal aria-labelledby="resume-employment-title"><h3 id="resume-employment-title">工作经历</h3><div class="resume-entry"><span class="micro">${e(resume.period)}</span><h4>${e(resume.company)}</h4><p class="resume-role">${e(resume.role)}</p><ul>${resume.responsibilities.map(p=>`<li>${e(p)}</li>`).join('')}</ul></div></section></div></div>
    <div class="resume-content resume-projects-only"><section class="resume-projects" aria-labelledby="resume-projects-title"><h3 id="resume-projects-title">代表项目经历</h3>${resume.projects.map((p,i)=>`<article class="resume-entry" data-reveal><span class="micro">0${i+1}</span><div><h4>${e(p.title)}</h4><p class="resume-works">${e(p.works)}</p><p>${e(p.description)}</p></div></article>`).join('')}</section></div>
    <div class="about-bottom"><span>IDEA → EXPERIMENT → EXPRESSION</span><a href="#work-orbit" data-scroll>走进我的创作世界 ↓</a></div>
  </section>
  <section class="work-section" id="work-orbit" aria-labelledby="work-heading">
    <div class="section-heading" data-reveal><span class="section-number">02 / SELECTED WORKS</span><span class="micro">AN ORBIT OF POSSIBILITIES</span><span class="section-plus" aria-hidden="true">+</span></div>
    <div class="work-heading" data-reveal><h2 id="work-heading">我的创作<span class="outline-text">宇宙</span><span class="small-asterisk">✳</span></h2><p>滚动，让灵感转动。<br><span>FIND YOUR NEXT PERSPECTIVE.</span></p></div>
    ${orbitMarkup()}
    ${appEntryMarkup()}
  </section>`;
}

export function mountHome(root){
  const section=root.querySelector('.work-section');const disposeOrbit=mountOrbit(section),disposeOpening=mountOpening(root);
  const disposeApp=mountAppEntry(section);
  let disposeDoll=()=>{},disposed=false;
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();
    import('../components/doll.js').then(({mountDoll})=>{
      if(!disposed)disposeDoll=mountDoll(section.querySelector('.doll-host'),section.querySelector('.orbit'),profile.doll);
    }).catch(()=>{if(!disposed)section.querySelector('.doll-host').dataset.renderer='fallback';});
  },{rootMargin:'450px'});observer.observe(section);
  return ()=>{disposed=true;observer.disconnect();disposeOrbit();disposeDoll();disposeOpening();disposeApp();};
}

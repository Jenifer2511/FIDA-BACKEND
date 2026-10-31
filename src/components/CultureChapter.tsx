'use client';


import { CinematicLanding } from './CinematicLanding';
import { initialProducts } from '@/lib/catalog';
import {useEffect,useRef} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {FabricFilm} from './FabricFilm';
import {subscribeScrollFrame} from '@/lib/scroll-frame';
import './culture-chapters.css';
import './page-scenes.css';
export type SceneKind='home'|'products'|'enquiry'|'contact'|'story';
export const pageThemes={
 home:{name:'INDIA / MODERN OCCASIONWEAR',image:'/assets/distinct/lehenga-4k.jpg',alt:'A woman wearing an ivory and gold embroidered lehenga in a sunlit palace courtyard',title:<>A world<br/><em>of her own.</em></>,description:'Indian roots. A thousand ways to dress.',cue:'SCROLL TO OPEN THE HOUSE',link:'#fida-edit',action:'Discover the collection'},
 products:{name:'FRANCE / THE EVENING EDIT',image:'/assets/distinct/evening-4k.jpg',alt:'A sculptural bronze evening dress in a clean fashion studio',title:<>Dress for<br/><em>your moment.</em></>,description:'Every style. Every occasion. Your look, your identity.',cue:'SCROLL TO REVEAL EACH LOOK',link:'#collection',action:'Explore all pieces'},
 enquiry:{name:'INDIA / THE ART OF EMBELLISHMENT',image:'/assets/distinct/embroidery-4k.jpg',alt:'A close view of red fabric with intricate Indian gold embroidery',title:<>Every detail.<br/><em>Your story.</em></>,description:'A colour. A beautiful beginning.',cue:'SCROLL TO UNWEAVE THE DETAILS',link:'#enquiry-form',action:'Begin your enquiry'},
 contact:{name:'INDIA / COLOUR & CONNECTION',image:'/assets/culture/saree-weaving-detail-4k.jpg',alt:'A weaver’s hands guiding vibrant threads through a traditional loom to create saree fabric',title:<>A beautiful<br/><em>connection.</em></>,description:'From India. Open to your world.',cue:'SCROLL ACROSS OUR WORLD',link:'#reach-fida',action:'Find FIDA'},
 story:{name:'A HAND BEHIND THE MAKING',image:'/assets/culture/tailor-atelier-4k.jpg',alt:'A tailor guiding cloth through a traditional hand-operated sewing machine',title:<>Made by hand.<br/><em>Held by heart.</em></>,description:'Before the dress. Before the moment.',cue:'SCROLL TO FOLLOW THE THREAD',link:'#makers',action:'Meet the makers'},
};
export const responsivePhoto=(src:string)=>src.includes('/distinct/lehenga-')?{srcSet:src.replace('-4k.jpg','-mobile.webp')+' 1024w',sizes:'100vw'}:src.endsWith('-4k.jpg')?{srcSet:src.replace('-4k.jpg','-mobile.webp')+' 1600w, '+src+' '+(src.includes('/distinct/kaftan-')?2908:3840)+'w',sizes:'(max-width: 760px) 100vw, 3840px'}:{};
export function FashionBackdrop({page}:{page:SceneKind}){if(page==='home')return null;const t=pageThemes[page];return <div className={'page-scenery scenery-'+page} aria-hidden="true"><img src={t.image} {...responsivePhoto(t.image)} alt=""/><div/></div>}
const looks = initialProducts.filter(p => p.featured).slice(0, 3).map((p, i) => ({image:p.image,name:p.name,tag:String(i+1).padStart(2,'0')+' / '+p.category.toUpperCase()}));
function ExistingCultureChapter({kind}:{kind:SceneKind}) {
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),reduce=useReducedMotion();const theme=pageThemes[kind];
 useEffect(()=>{
  const element=root.current,screen=stage.current;if(!element||!screen||reduce)return;
  let disposed=false,release=()=>{};
  Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;gsap.registerPlugin(ScrollTrigger);
   const context=gsap.context(()=>{
    const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:element,start:'top top',end:()=>'+='+Math.max(1,element.offsetHeight-screen.offsetHeight),scrub:true,invalidateOnRefresh:true,onUpdate:self=>{element.dataset.progress=self.progress.toFixed(5);element.dataset.renderProgress=self.progress.toFixed(5);const bar=element.querySelector<HTMLElement>('.scene-progress>i');if(bar)bar.style.transform='scaleX('+self.progress+')';}}});
    // An explicit one-unit clock makes every movement reversible and scroll-owned.
    const clock={value:0};tl.to(clock,{value:1,duration:1},0);
    if(kind==='home'){
     tl.fromTo('.scene-house-word',{letterSpacing:'.02em',scale:1,opacity:1},{letterSpacing:'.22em',scale:1.25,opacity:0,duration:.32},0);
     tl.fromTo('.scene-copy',{yPercent:40,opacity:0},{yPercent:0,opacity:1,duration:.28},.27);
     tl.to('.scene-copy',{yPercent:-18,opacity:0,duration:.22},.78);
     tl.fromTo('.scene-frame-line',{scaleX:()=>screen.clientWidth<760?.76:.34,scaleY:.66,opacity:.7},{scaleX:1,scaleY:1,opacity:0,duration:.5},0);
    }else if(kind==='products'){
     const cards=gsap.utils.toArray<HTMLElement>('.look-card');
     cards.forEach((card,i)=>{const start=i*.245;tl.fromTo(card,{yPercent:125,rotation:9-i*3,rotateY:-12,scale:.86,opacity:0},{yPercent:0,rotation:0,rotateY:0,scale:1,opacity:1,duration:.23},start);if(i<cards.length-1)tl.to(card,{yPercent:-15,rotation:-5,scale:.88,opacity:0,duration:.20},start+.25)});
     tl.to('.scene-copy',{xPercent:-8,yPercent:-5,duration:1},0);
    }else if(kind==='enquiry'){
     gsap.utils.toArray<HTMLElement>('.weave-strip').forEach((strip,i)=>{tl.to(strip,{yPercent:i%2===0?-115:115,duration:.5},i*.045)});
     tl.fromTo('.scene-copy h1 .scene-word',{yPercent:110},{yPercent:0,stagger:.12,duration:.3},.12);
     tl.fromTo('.scene-thread-path',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:.8},.1);
     tl.to('.scene-copy',{xPercent:3,duration:1},0);
    }else if(kind==='contact'){
     tl.fromTo('.contact-letter',{yPercent:125,rotateX:-70,opacity:0},{yPercent:0,rotateX:0,opacity:1,stagger:.035,duration:.28},.06);
     tl.fromTo('.contact-country',{xPercent:30,opacity:0},{xPercent:0,opacity:1,stagger:.15,duration:.25},.25);
     tl.to('.scene-copy',{yPercent:-8,duration:1},0);
     tl.fromTo('.contact-diagonal',{xPercent:-120},{xPercent:120,duration:1},0);
    }else{
     tl.fromTo('.story-thread-path',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:.9},0);
     tl.fromTo('.craft-word',{yPercent:100,opacity:0},{yPercent:0,opacity:1,stagger:.13,duration:.27},.08);
     tl.fromTo('.craft-detail',{clipPath:'inset(100% 0 0 0)',yPercent:15},{clipPath:'inset(0% 0 0 0)',yPercent:0,duration:.43},.38);
     tl.to('.scene-copy',{yPercent:-10,duration:1},0);
    }
   },element);
   const unsub=subscribeScrollFrame(()=>ScrollTrigger.update());
   const refresh=()=>{if(!disposed)ScrollTrigger.refresh()};const resize=new ResizeObserver(refresh);resize.observe(element);resize.observe(screen);document.fonts.ready.then(refresh);refresh();
   release=()=>{unsub();resize.disconnect();context.revert()};
  });
  return()=>{disposed=true;release()};
 },[kind,reduce]);
 return <section className={'page-scene scene-'+kind+(reduce?' scene-reduced':'')} ref={root} data-theme={kind} data-choreography={{home:'webgl-expanding-portrait',products:'scroll-stacked-lookbook',enquiry:'woven-strip-reveal',contact:'diagonal-light-reveal',story:'drawn-thread-and-maker-spiral'}[kind]} aria-label={theme.name}>
  <div className="page-scene-stage" ref={stage}>
   <img className="scene-fallback-photo" src={theme.image} {...responsivePhoto(theme.image)} alt={theme.alt} fetchPriority="high"/>
   <FabricFilm images={[theme.image]} mode={kind} sectionRef={root}/><div className="scene-shade"/>
   {kind==='home'&&<><div className="scene-frame-line" aria-hidden="true"/><span className="scene-house-word" aria-hidden="true">FIDA</span></>}
   {kind==='enquiry'&&<><div className="weave-curtain" aria-hidden="true">{Array.from({length:7},(_,i)=><i className="weave-strip" key={i}/>)}</div><svg className="scene-thread" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true"><path className="scene-thread-path" pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M-20 580C200 280 250 660 520 420S950 180 1220 80"/></svg></>}
   {kind==='contact'&&<><div className="contact-diagonal" aria-hidden="true"/><div className="contact-hello" aria-hidden="true">{'HELLO'.split('').map((letter,i)=><span className="contact-letter" key={i}>{letter}</span>)}</div><div className="contact-countries"><span className="contact-country">INDIA</span><span className="contact-country">SRI LANKA</span><span className="contact-country">UAE</span></div></>}
   {kind==='story'&&<><svg className="story-thread" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true"><path className="story-thread-path" pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M0 630C180 630 150 170 390 220S550 650 760 400 1000 140 1200 180"/></svg><figure className="craft-detail"><img src="/assets/culture/tailor-portrait-mobile.webp" alt="A traditional tailor carefully working at his sewing machine"/><figcaption>THE PERSON BEHIND EVERY PIECE</figcaption></figure></>}
   <div className="scene-copy"><p className="scene-eyebrow">{theme.name}</p><h1>{kind==='enquiry'?<><span className="scene-word-mask"><span className="scene-word">Every detail.</span></span><span className="scene-word-mask"><em className="scene-word">Your story.</em></span></>:kind==='story'?<><span className="scene-word-mask"><span className="craft-word">Made by hand.</span></span><span className="scene-word-mask"><em className="craft-word">Held by heart.</em></span></>:theme.title}</h1><p className="scene-description">{theme.description}</p></div>
   {kind==='products'&&<div className="look-stack" aria-label="Scroll-revealed fashion lookbook">{looks.map(look=><article className="look-card" key={look.image}><img src={look.image} alt={look.name}/><div><p>{look.tag}</p><h2>{look.name}</h2></div></article>)}</div>}
   <div className="scene-bottom"><span><ArrowDown size={15}/>{theme.cue}</span><span className="scene-progress"><i/></span><a href={theme.link}>{theme.action}<ArrowUpRight size={16}/></a></div>
  </div>
 </section>;
}


export function CultureChapter({kind}:{kind:SceneKind}) {
  if (kind === 'home') return <CinematicLanding />;
  return <ExistingCultureChapter kind={kind} />;
}

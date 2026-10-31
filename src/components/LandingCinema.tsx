'use client';
import {useEffect,useRef} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {useReducedMotion} from 'motion/react';
import './landing-cinema.css';

export function LandingManifesto() {
  const section=useRef<HTMLElement>(null);
  const reduce=useReducedMotion();
  useEffect(()=>{
    if(reduce||!section.current)return;
    let disposed=false;let cleanup=()=>{};
    Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
      if(disposed)return;gsap.registerPlugin(ScrollTrigger);
      const ctx=gsap.context(()=>{
        gsap.fromTo('.unfold-word',{opacity:.17},{opacity:1,stagger:.12,ease:'none',scrollTrigger:{trigger:section.current,start:'top 65%',end:'bottom 65%',scrub:true}});
        gsap.from('.unfold-detail-image',{y:24,scale:.99,scrollTrigger:{trigger:section.current,start:'top 85%',end:'bottom 80%',scrub:true}});
      },section);
      cleanup=()=>ctx.revert();
    });
    return()=>{disposed=true;cleanup()};
  },[reduce]);
  return <section className="unfold-manifesto" ref={section}>
    <div className="unfold-note"><p className="eyebrow">THE FIDA POINT OF VIEW</p><span>A SHARED THREAD</span></div>
    <h2>{['Not','one','style.','Not','one','story.','A','thousand','ways','to','be','you.'].map((word,i)=><span className={'unfold-word '+(i>5?'is-italic':'')} key={i}>{word} </span>)}</h2>
    <div className="unfold-detail"><div className="unfold-detail-image"><img src="/assets/distinct/embroidery-mobile.webp" alt="The intricate details of Indian embroidery" loading="lazy"/><span>BEAUTY IN THE DETAILS</span></div><div><p>Occasion frocks, evening dresses, contemporary tailoring, and the hands behind every detail. Our roots lead the way, with a quiet curiosity for the wider world.</p><p>Headquartered in India, with branches in Sri Lanka and the UAE.</p><a href="/our-story">The story of FIDA <ArrowUpRight size={17}/></a></div></div>
  </section>;
}

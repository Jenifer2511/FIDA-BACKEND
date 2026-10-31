'use client';

import {useEffect,useRef,type ReactNode} from 'react';
import {useReducedMotion} from 'motion/react';
import {subscribeScrollFrame} from '@/lib/scroll-frame';
import './product-reveal.css';

const clamp=(n:number)=>Math.min(1,Math.max(0,n));
const ease=(n:number)=>{const p=clamp(n);return p*p*(3-2*p)};

/** The fabric edge and typography follow the same scroll sample as the page. */
export function ProductReveal({children,index=0,className=''}:{children:ReactNode;index?:number;className?:string}){
  const target=useRef<HTMLElement>(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    const element=target.current;
    if(!element||reduced)return;
    let top=0,height=0,viewport=window.innerHeight,last=-1,disposed=false;
    const image=element.querySelector<HTMLElement>('.product-image');
    const paint=(y:number)=>{
      const columns=window.innerWidth<=760?2:3;
      const stagger=(index%columns)*viewport*.018;
      const distance=Math.max(180,Math.min(viewport*.66,height*.92));
      const progress=clamp((y+viewport*.965-top-stagger)/distance);
      if(Math.abs(progress-last)<.0001)return;
      last=progress;
      const reveal=ease(progress),caption=ease((progress-.22)/.78);
      // A shallow, curved hem straightens as the image is fully revealed.
      const hem=7.5*Math.sin(reveal*Math.PI);
      element.style.setProperty('--piece-edge-left',`${reveal*100-hem*.28}%`);
      element.style.setProperty('--piece-edge-mid',`${reveal*100+hem*.48}%`);
      element.style.setProperty('--piece-edge-right',`${reveal*100-hem}%`);
      element.style.setProperty('--piece-image-y',`${(1-reveal)*1}%`);
      element.style.setProperty('--piece-image-scale',`${1.015-reveal*.015}`);
      element.style.setProperty('--piece-veil',`${(1-reveal)*.46}`);
      element.style.setProperty('--piece-caption-y',`${(1-caption)*20}px`);
      element.style.setProperty('--piece-caption-opacity',`${caption}`);
      element.style.setProperty('--piece-rule',`${reveal}`);
      element.dataset.revealProgress=progress.toFixed(5);
      element.dataset.renderProgress=progress.toFixed(5);
    };
    const measure=()=>{
      if(disposed)return;
      viewport=window.innerHeight;
      top=element.getBoundingClientRect().top+window.scrollY;
      height=image?.offsetHeight||element.offsetHeight;
      last=-1;
      paint(window.scrollY);
    };
    measure();
    element.dataset.revealReady='true';
    const unsubscribe=subscribeScrollFrame(({y})=>paint(y));
    const resize=new ResizeObserver(measure);
    resize.observe(element);
    const grid=element.closest('.product-grid');
    if(grid)resize.observe(grid);
    const intersection=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting))measure();
    },{rootMargin:'100% 0px 100% 0px'});
    intersection.observe(element);
    window.addEventListener('resize',measure);
    window.addEventListener('load',measure);
    document.fonts?.ready.then(measure);
    return()=>{
      disposed=true;
      unsubscribe();resize.disconnect();intersection.disconnect();
      window.removeEventListener('resize',measure);
      window.removeEventListener('load',measure);
      delete element.dataset.revealReady;
      for(const property of ['--piece-edge-left','--piece-edge-mid','--piece-edge-right','--piece-image-y','--piece-image-scale','--piece-veil','--piece-caption-y','--piece-caption-opacity','--piece-rule'])element.style.removeProperty(property);
    };
  },[index,reduced]);
  return <article ref={target} className={`product-reveal ${className}`.trim()}>{children}</article>;
}

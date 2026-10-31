'use client';
import {useEffect} from 'react';
import {useReducedMotion} from 'motion/react';
import Lenis from 'lenis';
import {emitScrollFrame} from '@/lib/scroll-frame';
import 'lenis/dist/lenis.css';

/** Smooth the input once. Every scroll scene uses the resulting native position. */
export function SmoothScroll(){
  const reduced=useReducedMotion();
  useEffect(()=>{
    const lenis=reduced?null:new Lenis({autoRaf:false,smoothWheel:true,syncTouch:false,lerp:0,duration:.48,easing:t=>1-Math.pow(1-t,3),wheelMultiplier:.8,anchors:{offset:0,duration:.65},prevent:node=>!!node.closest('.mobile-nav,[data-lenis-prevent]')});
    document.documentElement.dataset.scrollMotion=lenis?'gentle':'native';
    const lock=()=>{if(document.body.style.overflow==='hidden')lenis?.stop();else lenis?.start()};
    const keyboard=(event:KeyboardEvent)=>{if(!['Home','End','PageUp','PageDown','ArrowUp','ArrowDown',' '].includes(event.key)||(event.target as Element)?.closest?.('input,textarea,select,[contenteditable=true]'))return;lenis?.stop();lenis?.start()};
    window.addEventListener('keydown',keyboard);
    const observer=new MutationObserver(lock);observer.observe(document.body,{attributes:true,attributeFilter:['style']});
    let frame=0,last=performance.now(),previous=window.scrollY;
    const tick=(time:number)=>{
      frame=requestAnimationFrame(tick);
      lenis?.raf(time);
      const y=window.scrollY,dt=Math.max(1,time-last);
      emitScrollFrame({time,y,velocity:(y-previous)/dt});previous=y;last=time;
    };
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keyboard);lenis?.destroy();delete document.documentElement.dataset.scrollMotion};
  },[reduced]);
  return null;
}

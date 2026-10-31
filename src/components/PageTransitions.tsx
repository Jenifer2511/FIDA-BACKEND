'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';

/** Keep native document links; add a curtain only without cross-document transitions. */
export function PageTransitions(){
  const reduced=useReducedMotion();
  const [native,setNative]=useState(true);
  const [leaving,setLeaving]=useState(false);
  const pending=useRef(false);
  useEffect(()=>{
    const supported=CSS.supports('view-transition-name','royal-header')&&'onpageswap' in window;
    setNative(supported);
    if(supported||reduced)return;
    let timer:ReturnType<typeof setTimeout>;
    const navigate=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
      const anchor=(event.target as Element).closest?.('a');
      if(!anchor||anchor.hasAttribute('download')||anchor.target&&anchor.target!=='_self')return;
      const destination=new URL(anchor.href,location.href);
      if(destination.origin!==location.origin||destination.pathname===location.pathname&&destination.search===location.search)return;
      event.preventDefault();
      if(pending.current)return;
      pending.current=true;setLeaving(true);
      timer=setTimeout(()=>window.location.assign(destination.href),190);
    };
    const reset=()=>{pending.current=false;setLeaving(false)};
    document.addEventListener('click',navigate);
    window.addEventListener('pageshow',reset);
    return()=>{clearTimeout(timer);document.removeEventListener('click',navigate);window.removeEventListener('pageshow',reset)};
  },[reduced]);
  if(native||reduced)return null;
  return <motion.div className="royal-page-curtain" aria-hidden="true" initial={{scaleY:1}} animate={{scaleY:leaving?1:0}} transition={{duration:leaving?.18:.48,ease:[.22,1,.36,1]}} style={{transformOrigin:leaving?'top':'bottom'}}><span>FIDA<small>FASHIONS & LIFESTYLES</small></span></motion.div>;
}

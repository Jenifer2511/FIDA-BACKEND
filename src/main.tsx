import React from 'react';
import { createRoot } from 'react-dom/client';
import { Site } from './components/Site';
import './styles/globals.css';
import './styles/royal-theme.css';
import './styles/cinematic-polish.css';
import './styles/typography.css';

const routes = {'/':'home','/products':'products','/our-story':'story','/contact':'contact','/enquiry':'enquiry'} as const;
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const page = routes[pathname as keyof typeof routes];
const labels = {home:'A world of her own',products:'The collection',story:'Our story',contact:'Contact',enquiry:'Enquiry'};
document.title = page ? `FIDA — ${labels[page]}` : 'FIDA — A world of her own';
const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
if (robotsMeta) robotsMeta.content = 'index,follow';
const content = page ? <Site page={page}/> : <main style={{minHeight:'100svh',display:'grid',placeContent:'center',padding:'40px',gap:'24px',background:'#eee5d6',color:'#482520',fontFamily:'Georgia,serif'}}><h1 style={{fontSize:'clamp(40px,8vw,85px)',lineHeight:1.1}}>{'A different direction.'}</h1><p>{'This page is not part of the FIDA collection.'}</p><a href="/" style={{padding:'16px 0',textDecoration:'underline'}}>Return to the house of FIDA</a></main>;
createRoot(document.getElementById('root')!).render(content);

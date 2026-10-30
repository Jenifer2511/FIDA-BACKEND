'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {useReducedMotion} from 'motion/react';
import {subscribeScrollFrame} from '@/lib/scroll-frame';
import './story-scene.css';

type Props={images:string[];portrait:string};
const smooth=(a:number,b:number,value:number)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*t*(t*(t*6-15)+10)};

export function StoryScene({images,portrait}:Props){
 const host=useRef<HTMLDivElement>(null),section=useRef<HTMLElement>(null),progressBar=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();
 const [state,setState]=useState<'loading'|'ready'|'fallback'>('loading');
 const [percent,setPercent]=useState(0);
 useEffect(()=>{
  if(!images.length||!host.current||!section.current)return;
  if(reduced){setState('fallback');return}
  let disposed=false,release=()=>{};
  const mount=host.current,root=section.current;
  const load=async()=>{
   let renderer:import('three').WebGLRenderer|undefined;
   try{
    const T=await import('three');if(disposed)return;
    const cols=12,rows=11,count=cols*rows;
    renderer=new T.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});
    renderer.outputColorSpace=T.SRGBColorSpace;
    mount.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.1,100);camera.position.z=14;
    const atlasTile=Math.min(256,2**Math.floor(Math.log2(Math.floor(renderer.capabilities.maxTextureSize/Math.max(cols,rows)))));
    const atlas=document.createElement('canvas');atlas.width=cols*atlasTile;atlas.height=rows*atlasTile;
    const ctx=atlas.getContext('2d')!;ctx.fillStyle='#b6a58b';ctx.fillRect(0,0,atlas.width,atlas.height);
    const loadImage=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src});
    await Promise.all(images.slice(0,count).map(async(src,i)=>{try{const im=await loadImage(src);if(disposed)return;const side=Math.min(im.width,im.height);ctx.drawImage(im,(im.width-side)/2,(im.height-side)/2,side,side,(i%cols)*atlasTile,Math.floor(i/cols)*atlasTile,atlasTile,atlasTile)}catch{}}));
    const portraitImage=await loadImage(portrait);
    if(disposed){renderer.dispose();renderer.domElement.remove();return}
    const atlasTexture=new T.CanvasTexture(atlas);atlasTexture.colorSpace=T.SRGBColorSpace;
    const portraitTexture=new T.Texture(portraitImage);portraitTexture.needsUpdate=true;portraitTexture.colorSpace=T.SRGBColorSpace;
    const geometry=new T.PlaneGeometry(1,1),indices=new Float32Array(count);
    for(let i=0;i<count;i++)indices[i]=i;
    geometry.setAttribute('aIndex',new T.InstancedBufferAttribute(indices,1));
    const material=new T.ShaderMaterial({uniforms:{uAtlas:{value:atlasTexture},uPortrait:{value:portraitTexture},uMix:{value:0},uCols:{value:cols},uRows:{value:rows},uAtlasInset:{value:.5/atlasTile}},vertexShader:`attribute float aIndex;varying vec2 vUv;varying float vIndex;void main(){vUv=uv;vIndex=aIndex;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D uAtlas;uniform sampler2D uPortrait;uniform float uMix;uniform float uCols;uniform float uRows;uniform float uAtlasInset;varying vec2 vUv;varying float vIndex;void main(){float tile=floor(vIndex+.5);vec2 cell=vec2(mod(tile,uCols),uRows-1.-floor(tile/uCols));vec2 uv=(cell+vUv)/vec2(uCols,uRows);vec2 atlasUv=(cell+mix(vec2(uAtlasInset),vec2(1.-uAtlasInset),vUv))/vec2(uCols,uRows);gl_FragColor=mix(texture2D(uAtlas,atlasUv),texture2D(uPortrait,uv),uMix);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,side:T.DoubleSide});
    const mesh=new T.InstancedMesh(geometry,material,count);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);
    const crossGeometry=new T.PlaneGeometry(1,1),crossMaterials:import('three').MeshBasicMaterial[]=[],crossTextures:import('three').Texture[]=[];
    const crossMeshes=Array.from({length:4},(_,i)=>{const texture=new T.TextureLoader().load('/assets/product-'+i+'.jpg');texture.colorSpace=T.SRGBColorSpace;crossTextures.push(texture);const mat=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,side:T.DoubleSide});crossMaterials.push(mat);const plane=new T.Mesh(crossGeometry,mat);plane.scale.set(.92,1.25,1);plane.position.z=3.5+i*.2;scene.add(plane);return plane});
    const seeds=Array.from({length:count},(_,i)=>{const rand=(v:number)=>{const x=Math.sin((i+1)*v)*43758.5453;return x-Math.floor(x)};return{x:rand(12.9898)-.5,y:rand(78.233)-.5,z:(rand(35.12)-.5)*3,rotation:(rand(8.3)-.5)*.7,angle:i/(count-1)*Math.PI*8.5,radius:.12+i/(count-1)*.88}});
    const dummy=new T.Object3D(),captions=Array.from(root.querySelectorAll<HTMLElement>('.makers-caption'));
    let width=1,height=1,top=0,range=1,painted=-1,lastPercent=-1;
    const resize=()=>{width=Math.max(1,mount.clientWidth);height=Math.max(1,mount.clientHeight);const pixelBudget=width<760?2_000_000:4_000_000;renderer!.setPixelRatio(Math.min(window.devicePixelRatio||1,2,Math.sqrt(pixelBudget/(width*height))));renderer!.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();top=root.getBoundingClientRect().top+window.scrollY;range=Math.max(1,root.offsetHeight-mount.clientHeight);painted=-1};
    const ro=new ResizeObserver(resize);ro.observe(mount);ro.observe(root);window.addEventListener('resize',resize,{passive:true});resize();
    document.fonts.ready.then(()=>{if(!disposed)resize()});
    const draw=(y:number)=>{
     const p=Math.max(0,Math.min(1,(y-top)/range));
     if(disposed||document.hidden||p===painted)return;painted=p;
     const mobile=width<760,worldHeight=2*Math.tan(T.MathUtils.degToRad(22.5))*14,worldWidth=worldHeight*camera.aspect;
     const gather=smooth(0,.19,p),inward=smooth(.12,.79,p),assemble=smooth(.78,.97,p);
     material.uniforms.uMix.value=smooth(.84,.99,p);
     const finalHeight=Math.min(worldHeight*(mobile?.62:.76),worldWidth*(mobile?.8:.43)/(portraitImage.width/portraitImage.height));
     const finalWidth=finalHeight*(portraitImage.width/portraitImage.height),tw=finalWidth/cols,th=finalHeight/rows;
     const centreX=mobile?0:-worldWidth*.18,centreY=mobile?.55:0;
     for(let i=0;i<count;i++){
      const seed=seeds[i],angle=seed.angle+p*Math.PI*5,radius=seed.radius*Math.min(worldWidth*.44,worldHeight*.54)*(1-inward*.94);
      const sx=Math.cos(angle)*radius,sy=Math.sin(angle)*radius*(mobile?1.3:.75),sz=Math.sin(angle+p*4)*.8*(1-inward);
      const x=seed.x*worldWidth*1.04*(1-gather)+sx*gather,y=seed.y*worldHeight*.94*(1-gather)+sy*gather,z=seed.z*(1-gather)+sz*gather;
      const fx=(i%cols-cols/2+.5)*tw+centreX,fy=(rows/2-Math.floor(i/cols)-.5)*th+centreY;
      dummy.position.set(x*(1-assemble)+fx*assemble,y*(1-assemble)+fy*assemble,z*(1-assemble));
      dummy.rotation.set(0,Math.sin(p*3+seed.angle)*.09*(1-assemble),(seed.rotation+p*.25)*(1-assemble));
      const tileSize=(mobile?.24:.40)+(i%5)*(mobile?.03:.06);
      dummy.scale.set(tileSize*(1-assemble)+tw*1.001*assemble,tileSize*1.15*(1-assemble)+th*1.001*assemble,1);
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
     }
     mesh.instanceMatrix.needsUpdate=true;
     crossMeshes.forEach((plane,i)=>{const flight=(p-(.17+i*.12))/.24,show=flight>0&&flight<1&&p<.8;plane.visible=show;crossMaterials[i].opacity=show?Math.sin(flight*Math.PI)*.8:0;plane.position.x=(flight*2-1)*worldWidth*.5*(i%2===0?1:-1);plane.position.y=Math.sin(flight*Math.PI+i)*.75;plane.rotation.z=Math.sin(flight*2+i)*.05});
     const opacity=[1-smooth(.08,.20,p),smooth(.22,.31,p)*(1-smooth(.56,.65,p)),smooth(.70,.78,p)*(1-smooth(.86,.93,p)),smooth(.94,.995,p)];
     captions.forEach((caption,i)=>{caption.style.opacity=String(opacity[i]);caption.style.visibility=opacity[i]>.001?'visible':'hidden'});
     renderer!.render(scene,camera);
     root.dataset.storyProgress=p.toFixed(5);root.dataset.renderProgress=p.toFixed(5);
     const current=Math.round(p*100);if(current!==lastPercent){lastPercent=current;setPercent(current)}
     if(progressBar.current)progressBar.current.style.transform='scaleX('+p+')';
    };
    const unsubscribe=subscribeScrollFrame(({y})=>{if(y+window.innerHeight>=top&&y<=top+root.offsetHeight)draw(y)});
    const contextLost=(event:Event)=>{event.preventDefault();setState('fallback')};renderer.domElement.addEventListener('webglcontextlost',contextLost);
    release=()=>{unsubscribe();ro.disconnect();window.removeEventListener('resize',resize);renderer!.domElement.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();atlasTexture.dispose();portraitTexture.dispose();crossGeometry.dispose();crossMaterials.forEach(m=>m.dispose());crossTextures.forEach(t=>t.dispose());renderer!.dispose();renderer!.forceContextLoss();renderer!.domElement.remove()};
    setState('ready');draw(window.scrollY);
   }catch{renderer?.dispose();renderer?.domElement.remove();if(!disposed)setState('fallback')}
  };
  load();return()=>{disposed=true;release()};
 },[images,portrait,reduced]);
 const fallback=state==='fallback'||!!reduced;
 return <section className={'makers-sequence '+(fallback?'makers-fallback':'')} id="makers" ref={section} aria-label="A scroll-controlled tribute: 132 photographs gather into a spiral and form a traditional tailor’s portrait">
  <div className="makers-sticky">
   <div className="makers-grain"/>
   <div className="makers-top"><span>132 PHOTOGRAPHS /<br></br>ONE HUMAN STORY</span><span>{fallback?'A STILL MOMENT':state==='loading'?'GATHERING THE THREADS':'SCROLL TO REVEAL'}</span></div>
   <div className={'webgl-stage '+(fallback?'is-fallback':'')} ref={host}/>
   {fallback&&<img className="portrait-fallback" src={portrait} alt="A traditional Indian tailor working at a vintage sewing machine"/>}
   {!fallback&&<div className="makers-captions" aria-hidden="true"><div className="makers-caption makers-opening"><p className="eyebrow">LOOK A LITTLE CLOSER</p><h2>Nothing beautiful<br/><em>is made alone.</em></h2></div><div className="makers-caption makers-spiral"><p className="eyebrow">A WORLD OF HUMAN CRAFT</p><h2>A hundred stories.<br/><em>One shared thread.</em></h2></div><div className="makers-caption makers-assembly"><p className="eyebrow">AND EVERY THREAD LEADS BACK TO</p><h2>The hands<br/><em>behind it all.</em></h2></div></div>}
   <div className={'makers-caption makers-thanks '+(fallback?'is-still':'')}><p className="eyebrow">TO EVERY MAKER, EVERYWHERE</p><h2>Thank <em>you.</em></h2><p>For the patience.<br/>For the care.<br/>For bringing beauty to life.</p></div>
   <div className="makers-bottom"><div className="makers-progress" role="progressbar" aria-label="Tribute scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fallback?100:percent}><span>{fallback?'CRAFT IS HUMAN':String(percent).padStart(2,'0')+' / 100'}</span><div><i ref={progressBar}/></div></div><div className="makers-controls"><a href="#makers">From the beginning <ArrowUpRight size={13}/></a><a href="#dedication">Continue <ArrowDown size={14}/></a></div></div>
   <p className="makers-note">{fallback?'A quiet tribute, with motion reduced.':'Scroll to gather the stories. Scroll back to unfold them.'}</p>
  </div>
 </section>;
}


'use client';
import {useEffect,useRef,type RefObject} from 'react';
import {useReducedMotion} from 'motion/react';
import {subscribeScrollFrame} from '@/lib/scroll-frame';
type Mode='home'|'products'|'enquiry'|'contact'|'story';
const fragment=`
precision highp float;
uniform sampler2D uImage0;uniform sampler2D uImage1;uniform sampler2D uImage2;uniform vec2 uSize0;uniform vec2 uSize1;uniform vec2 uSize2;uniform vec2 uResolution;uniform float uProgress;uniform float uMode;varying vec2 vUv;
vec2 cover(vec2 uv,float aspect,vec2 size){float b=size.x/size.y;vec2 scale=vec2(min(aspect/b,1.),min(b/aspect,1.));return(uv-.5)*scale+.5+vec2(0.,.28)*(1.-scale);}
vec3 photograph0(vec2 uv,float aspect){return texture2D(uImage0,clamp(cover(uv,aspect,uSize0),.001,.999)).rgb;}
vec3 photograph1(vec2 uv,float aspect){return texture2D(uImage1,clamp(cover(uv,aspect,uSize1),.001,.999)).rgb;}
vec3 photograph2(vec2 uv,float aspect){return texture2D(uImage2,clamp(cover(uv,aspect,uSize2),.001,.999)).rgb;}
void main(){
 vec2 uv=vUv;float p=uProgress;float aspect=uResolution.x/uResolution.y;vec3 colour=vec3(.12,.07,.055);
 if(uMode<.5){
  float open=smoothstep(0.,.58,p);vec2 frame=mix(vec2(aspect<.8?.76:.34,.66),vec2(1.),open);
  vec2 local=(uv-.5)/frame+.5;float inside=step(0.,local.x)*step(local.x,1.)*step(0.,local.y)*step(local.y,1.);
  vec3 background=photograph0(uv,aspect)*.18;
  float fold=sin(local.y*5.+open*3.)*sin(open*3.14159);local.x+=fold*.018;local.y+=sin(local.x*3.)*sin(open*3.14159)*.006;
  vec3 image=photograph0(local,aspect*frame.x/frame.y)*(1.+fold*.08);colour=mix(background,image,inside);
 }else if(uMode<1.5){
  float frameWidth=aspect<.75?.56:.34;float frameHeight=aspect<.75?.46:.70;vec2 centre=aspect<.75?vec2(.60,.63):vec2(.72,.50);
  vec2 local=(uv-centre)/vec2(frameWidth,frameHeight)+.5;float inside=step(0.,local.x)*step(local.x,1.)*step(0.,local.y)*step(local.y,1.);
  float imageAspect=aspect*frameWidth/frameHeight;
  vec2 imageRatio=vec2(uSize0.x/uSize0.y,uSize0.x/uSize0.y);
  vec2 fit=min(vec2(1.),vec2(imageRatio.x/imageAspect,imageAspect/imageRatio.y));
  vec2 fitted=(local-.5)*fit+.5;
  float imageInside=step(0.,fitted.x)*step(fitted.x,1.)*step(0.,fitted.y)*step(fitted.y,1.);
  float position=p*2.;float blend=smoothstep(.34,.66,fract(position));
  vec2 sampleUv=clamp(fitted,.001,.999);
  vec3 first=mix(texture2D(uImage0,sampleUv).rgb,texture2D(uImage1,sampleUv).rgb,blend);
  vec3 second=mix(texture2D(uImage1,sampleUv).rgb,texture2D(uImage2,sampleUv).rgb,blend);
  vec3 garment=position<1.?first:second;
  vec2 edge=min(local,1.-local);float rim=inside*(1.-smoothstep(.004,.012,min(edge.x,edge.y)));
  vec3 paper=vec3(.87,.82,.73);vec3 panel=mix(paper,garment,imageInside);panel=mix(panel,vec3(.70,.57,.36),rim*.72);
  float glow=exp(-distance(uv,centre)*3.)*.13;colour=vec3(.12,.075,.055)+vec3(.18,.12,.07)*glow;colour=mix(colour,panel,inside);
  float shimmer=sin(local.x*8.+p*6.)*.004*sin(p*6.283);colour+=vec3(shimmer)*inside;
 }else if(uMode<2.5){
  vec2 local=(uv-.5)*mix(.80,1.,p)+.5;local.y+=sin(local.x*10.+p*6.)*.008*sin(p*3.14159);colour=photograph0(local,aspect);
 }else if(uMode<3.5){
  float diagonal=uv.x*.7+(1.-uv.y)*.3;float edge=mix(-.12,1.15,p);float reveal=1.-smoothstep(edge-.12,edge+.12,diagonal);
  vec3 image=photograph0(uv,aspect);float grey=dot(image,vec3(.299,.587,.114));vec3 shadow=mix(vec3(grey)*vec3(.32,.23,.20),image*.24,.25);colour=mix(shadow,image,reveal);
  colour+=vec3(.1,.065,.02)*exp(-pow((diagonal-edge)*18.,2.));
 }else{vec2 local=(uv-.5)*mix(.87,1.,p)+.5;local.y+=p*.025;colour=photograph0(local,aspect);}
 float vignette=1.-smoothstep(.25,.9,distance(vUv,vec2(.5)))*.14;gl_FragColor=vec4(colour*vignette,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

/** Texture movement uses only the scroll position: pausing scroll pauses the fabric. */
export function FabricFilm({images,mode,sectionRef}:{images:string[];mode:Mode;sectionRef:RefObject<HTMLElement|null>}){
 const mount=useRef<HTMLDivElement>(null),reduced=useReducedMotion();
 const key=images.join('|');
 useEffect(()=>{
  const host=mount.current,root=sectionRef.current;if(!host||!root||reduced)return;
  let disposed=false,failed=false,cleanup=()=>{};let renderer:import('three').WebGLRenderer|undefined;
  const loaded:import('three').Texture[]=[];
  (async()=>{try{
   const T=await import('three');if(disposed)return;
   renderer=new T.WebGLRenderer({alpha:false,antialias:false,powerPreference:'high-performance'});
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.debug.onShaderError=()=>{failed=true;};host.appendChild(renderer.domElement);
   const loader=new T.TextureLoader();const results=await Promise.allSettled(images.map(async src=>{const t=await loader.loadAsync(innerWidth<760?src.replace('-4k.jpg','-mobile.webp'):src);loaded.push(t);t.colorSpace=T.SRGBColorSpace;return t}));if(results.some(result=>result.status==='rejected'))throw Error('Texture unavailable');const textures=results.map(result=>(result as PromiseFulfilledResult<import('three').Texture>).value);
   if(disposed){loaded.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();return;}
   const size=(i:number)=>new T.Vector2(textures[Math.min(i,textures.length-1)].image.width,textures[Math.min(i,textures.length-1)].image.height);
   const uniforms={uImage0:{value:textures[0]},uImage1:{value:textures[1]||textures[0]},uImage2:{value:textures[2]||textures[0]},uSize0:{value:size(0)},uSize1:{value:size(1)},uSize2:{value:size(2)},uResolution:{value:new T.Vector2(1,1)},uProgress:{value:0},uMode:{value:['home','products','enquiry','contact','story'].indexOf(mode)}};
   const material=new T.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:fragment,depthTest:false,depthWrite:false});
   const geometry=new T.PlaneGeometry(2,2);const scene=new T.Scene();scene.add(new T.Mesh(geometry,material));const camera=new T.Camera();
   let top=0,range=1,last=-1,visible=false;
   const measure=()=>{const w=host.clientWidth,h=host.clientHeight;renderer!.setPixelRatio(Math.min(devicePixelRatio,2,Math.sqrt(4200000/Math.max(1,w*h))));renderer!.setSize(w,h);uniforms.uResolution.value.set(w,h);top=root.getBoundingClientRect().top+window.scrollY;range=Math.max(1,root.offsetHeight-h);last=-1;};
   const observer=new ResizeObserver(measure);observer.observe(host);observer.observe(root);measure();
   const unsubscribe=subscribeScrollFrame(({y})=>{if(disposed||failed||document.hidden||y+innerHeight<top||y>top+root.offsetHeight)return;const p=Math.max(0,Math.min(1,(y-top)/range));if(p===last)return;last=p;uniforms.uProgress.value=p;renderer!.render(scene,camera);if(failed){host.classList.remove('fabric-ready');delete root.dataset.fabric;return;}host.dataset.renderProgress=p.toFixed(5);if(!visible){visible=true;host.classList.add('fabric-ready');root.dataset.fabric='ready';}});
   const lose=(event:Event)=>{event.preventDefault();host.classList.remove('fabric-ready');delete root.dataset.fabric;};
   renderer.domElement.addEventListener('webglcontextlost',lose);
   cleanup=()=>{unsubscribe();observer.disconnect();delete root.dataset.fabric;renderer!.domElement.removeEventListener('webglcontextlost',lose);material.dispose();geometry.dispose();loaded.forEach(t=>t.dispose());renderer!.dispose();renderer!.forceContextLoss();renderer!.domElement.remove();};
  }catch{loaded.forEach(t=>t.dispose());renderer?.dispose();renderer?.domElement.remove();delete root.dataset.fabric;}})();
  return()=>{disposed=true;cleanup();};
 // The image identity is stable; parent re-renders do not rebuild the GPU scene.
 },[key,mode,reduced,sectionRef]);
 return <div className="fabric-film" ref={mount} aria-hidden="true"/>;
}

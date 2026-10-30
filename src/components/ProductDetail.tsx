import {useEffect,useRef} from 'react';
import {ArrowLeft,ArrowUpRight,MessageCircle} from 'lucide-react';
import {useReducedMotion} from 'motion/react';
import {company,type Product} from '@/lib/catalog';
import './product-detail.css';

const vertexShader=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragmentShader=`precision highp float;uniform sampler2D uImage;uniform vec2 uImageSize;uniform vec2 uResolution;uniform float uProgress;varying vec2 vUv;vec2 containScale(){float imageAspect=uImageSize.x/uImageSize.y;float frameAspect=uResolution.x/uResolution.y;return vec2(min(imageAspect/frameAspect,1.),min(frameAspect/imageAspect,1.));}void main(){float ease=uProgress*uProgress*(3.-2.*uProgress);vec2 uv=vUv;float fold=sin(uv.y*16.+ease*8.)*(1.-ease);uv.x+=fold*.045;uv.y+=sin(uv.x*12.-ease*9.)*(1.-ease)*.016;vec2 imageUv=(uv-.5)/containScale()+.5;float inside=step(0.,imageUv.x)*step(imageUv.x,1.)*step(0.,imageUv.y)*step(imageUv.y,1.);vec3 photo=texture2D(uImage,clamp(imageUv,.001,.999)).rgb;vec3 colour=mix(vec3(.933,.906,.859),photo,inside);float crease=exp(-abs(vUv.x-(ease*1.35-.18))*28.)*(1.-ease)*inside;colour=mix(colour,colour*vec3(.68,.56,.42),crease*.5);float sheen=exp(-pow((vUv.x-(ease*1.3-.15))*18.,2.))*(1.-ease)*inside;colour+=vec3(.16,.11,.06)*sheen*.24;gl_FragColor=vec4(colour,1.);}`;

function ProductImage({product}:{product:Product}){
  const mount=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();

  useEffect(()=>{
    const host=mount.current;
    if(!host||reduced)return;
    let disposed=false;
    let renderer:import('three').WebGLRenderer|undefined;
    let texture:import('three').Texture|undefined;
    let geometry:import('three').PlaneGeometry|undefined;
    let material:import('three').ShaderMaterial|undefined;
    let frame=0;
    let resize:ResizeObserver|undefined;

    void (async()=>{
      try{
        const T=await import('three');
        if(disposed)return;
        const loaded=await new T.TextureLoader().loadAsync(product.image);
        if(disposed){loaded.dispose();return;}
        texture=loaded;
        texture.colorSpace=T.SRGBColorSpace;
        renderer=new T.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});
        renderer.outputColorSpace=T.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
        renderer.domElement.setAttribute('aria-hidden','true');
        host.appendChild(renderer.domElement);
        const uniforms={uImage:{value:texture},uImageSize:{value:new T.Vector2(texture.image.width,texture.image.height)},uResolution:{value:new T.Vector2(1,1)},uProgress:{value:0}};
        material=new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,depthTest:false,depthWrite:false});
        geometry=new T.PlaneGeometry(2,2);
        const scene=new T.Scene();
        scene.add(new T.Mesh(geometry,material));
        const camera=new T.Camera();
        const measure=()=>{
          if(!renderer)return;
          const width=host.clientWidth;
          const height=host.clientHeight;
          renderer.setSize(width,height);
          uniforms.uResolution.value.set(width,height);
          renderer.render(scene,camera);
        };
        resize=new ResizeObserver(measure);
        resize.observe(host);
        measure();
        const start=performance.now();
        const animate=(now:number)=>{
          if(disposed||!renderer)return;
          uniforms.uProgress.value=Math.min(1,(now-start)/1250);
          renderer.render(scene,camera);
          if(uniforms.uProgress.value<1)frame=requestAnimationFrame(animate);
        };
        frame=requestAnimationFrame(animate);
      }catch{
        material?.dispose();
        geometry?.dispose();
        renderer?.dispose();
        renderer?.forceContextLoss();
        renderer?.domElement.remove();
        texture?.dispose();
      }
    })();

    return()=>{
      disposed=true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      material?.dispose();
      geometry?.dispose();
      texture?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
  },[product.image,reduced]);

  return <div className="product-detail-image" ref={mount}>
    <img src={product.image} alt={product.name}/>
    <span className="product-detail-image-number">FIDA / {product.category.toUpperCase()}</span>
  </div>;
}

export function ProductDetail({product,onBack}:{product:Product;onBack:()=>void}){
  const detail=useRef<HTMLElement>(null);
  const message=encodeURIComponent(`Hello FIDA, I’m interested in the ${product.name}. Could you share more details, pricing and availability?`);
  const whatsappHref=`${company.whatsapp}?text=${message}`;
  useEffect(()=>{detail.current?.scrollIntoView({behavior:'smooth',block:'start'});},[product.id]);

  return <section className="product-detail" ref={detail} aria-labelledby="product-detail-title">
    <div className="product-detail-visual"><ProductImage product={product}/></div>
    <div className="product-detail-copy">
      <button className="product-detail-back" type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true"/> Back to collection</button>
      <p className="eyebrow">{product.category}</p>
      <h2 id="product-detail-title">{product.name}</h2>
      <span className="product-detail-rule" aria-hidden="true"/>
      <p className="product-detail-description">{product.description}</p>
      <p className="product-detail-availability">{product.price || 'Details & availability on enquiry'}</p>
      <a className="button product-detail-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
        Enquire on WhatsApp <MessageCircle size={17} aria-hidden="true"/>
      </a>
      <a className="button product-detail-enquiry" href={`/enquiry?product=${encodeURIComponent(product.name)}`}>
        Use the enquiry form <ArrowUpRight size={17} aria-hidden="true"/>
      </a>
    </div>
  </section>;
}

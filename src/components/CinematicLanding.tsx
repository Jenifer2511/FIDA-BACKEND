'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { subscribeScrollFrame } from '@/lib/scroll-frame';
import './cinematic-landing.css';

const daylight = '/assets/cinematic/palace-daylight.webp';
const twilight = '/assets/cinematic/palace-twilight.webp';
const chapters = ['THE FIRST LIGHT', 'A DIFFERENT LIGHT', 'YOUR MOMENT'];

/** Two full-bleed photographs, one reversible scroll-controlled film aperture. */
export function CinematicLanding() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || reducedMotion) return;

    let disposed = false;
    let cleanup = () => {};

    async function initialise(root: HTMLElement, stage: HTMLDivElement) {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const chapter = root!.querySelector<HTMLElement>('.fida-film-chapter');
      const progress = root!.querySelector<HTMLElement>('.fida-film-progress-fill');
      const arrival = root!.querySelector<HTMLElement>('.fida-film-arrival');
      const finalCopy = root!.querySelector<HTMLElement>('.fida-film-finale');
      let activeChapter = -1;

      // Only decorative layers move; the collection link remains available throughout.
      const context = gsap.context(() => {
        const clock = { value: 0 };
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${Math.max(1, root!.offsetHeight - stage!.offsetHeight)}`,
            scrub: true,
            invalidateOnRefresh: true,
            onToggle: self => { root.dataset.filmActive = String(self.isActive); },
            onUpdate: self => {
              const index = self.progress < 0.29 ? 0 : self.progress < 0.71 ? 1 : 2;
              if (index !== activeChapter) {
                activeChapter = index;
                if (chapter) chapter.textContent = chapters[index];
              }
              // Avoid hidden duplicate copy in the accessibility tree.
              arrival?.setAttribute('aria-hidden', self.progress > 0.3 ? 'true' : 'false');
              finalCopy?.setAttribute('aria-hidden', self.progress < 0.7 ? 'true' : 'false');
            },
          },
        });

        timeline.to(clock, {
          value: 1,
          duration: 1,
          onUpdate: () => {
            if (progress) progress.style.transform = `scaleX(${clock.value})`;
          },
        }, 0);

        // Establishing shot: a restrained camera move into the sunlit courtyard.
        timeline.fromTo('.fida-film-daylight img',
          { scale: 1, xPercent: 0 },
          { scale: 1.055, xPercent: -0.7, duration: 0.58, ease: 'power1.inOut' }, 0);
        timeline.to('.fida-film-arrival', { opacity: 0, y: -30, duration: 0.14 }, 0.15);
        timeline.fromTo('.fida-film-watermark',
          { xPercent: 5, opacity: 0 },
          { xPercent: -5, opacity: 0.22, duration: 0.18 }, 0.15);
        timeline.to('.fida-film-watermark', { xPercent: -12, opacity: 0, duration: 0.2 }, 0.39);

        // A photograph travels across the screen as a panoramic strip, then
        // opens vertically into a new scene. No scaled portrait or fabric panels.
        timeline.fromTo('.fida-film-twilight',
          { clipPath: 'inset(47% 100% 47% 0%)' },
          { clipPath: 'inset(47% 0% 47% 0%)', duration: 0.17, ease: 'power2.inOut' }, 0.27);
        timeline.to('.fida-film-twilight',
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.29, ease: 'power2.inOut' }, 0.44);
        timeline.fromTo('.fida-film-twilight img',
          { scale: 1.065, xPercent: 0.5 },
          { scale: 1, xPercent: 0, duration: 0.57, ease: 'power1.inOut' }, 0.33);

        // Fine horizontal rules trace the photographic aperture, then disappear.
        timeline.fromTo('.fida-film-aperture', { opacity: 0 }, { opacity: 0.8, duration: 0.03 }, 0.27);
        timeline.fromTo('.fida-film-aperture',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.17, ease: 'power2.inOut' }, 0.27);
        timeline.to('.fida-film-aperture', { opacity: 0, duration: 0.07 }, 0.45);
        timeline.fromTo('.fida-film-interlude', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.09 }, 0.31);
        timeline.to('.fida-film-interlude', { opacity: 0, y: -10, duration: 0.08 }, 0.49);

        // Hold the second photograph long enough to read before leaving the stage.
        timeline.fromTo('.fida-film-finale', { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.71);
        root!.dataset.filmReady = 'true';
      }, root);

      const unsubscribe = subscribeScrollFrame(() => ScrollTrigger.update());
      let refreshFrame = 0;
      const refresh = () => {
        if (disposed) return;
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
      };
      const observer = new ResizeObserver(refresh);
      observer.observe(stage!);
      const photos = Array.from(root!.querySelectorAll('img'));
      photos.forEach(photo => photo.addEventListener('load', refresh));
      document.fonts.ready.then(refresh);
      refresh();

      cleanup = () => {
        cancelAnimationFrame(refreshFrame);
        observer.disconnect();
        photos.forEach(photo => photo.removeEventListener('load', refresh));
        unsubscribe();
        context.revert();
        arrival?.removeAttribute('aria-hidden');
        finalCopy?.setAttribute('aria-hidden', 'true');
        delete root!.dataset.filmReady;
        delete root!.dataset.filmActive;
      };
    }

    initialise(root, stage).catch(error => console.error('FIDA photographic scroll:', error));
    return () => { disposed = true; cleanup(); };
  }, [reducedMotion]);

  return (
    <section className="fida-film" ref={rootRef} aria-label="The world of FIDA">
      <div className="fida-film-stage" ref={stageRef}>
        <div className="fida-film-photo fida-film-daylight">
          <img src={daylight} alt="An ivory and gold lehenga in a sunlit sandstone palace courtyard" width="1672" height="941" fetchPriority="high" decoding="async" />
        </div>
        <div className="fida-film-photo fida-film-twilight" aria-hidden="true">
          <img src={twilight} alt="" width="1672" height="941" decoding="async" />
        </div>
        <div className="fida-film-shade" aria-hidden="true" />
        <div className="fida-film-aperture" aria-hidden="true" />

        <div className="fida-film-arrival">
          <p className="fida-film-eyebrow"><span /> THE HOUSE OF FIDA</p>
          <h1>A world<br /><em>of her own.</em></h1>
          <p className="fida-film-description">Indian roots. A world of expression.<br />For every version of you.</p>
        </div>

        <span className="fida-film-watermark" aria-hidden="true">FIDA</span>
        <p className="fida-film-interlude" aria-hidden="true">SOME MOMENTS<br /><em>deserve to be felt.</em></p>

        <div className="fida-film-finale" aria-hidden="true">
          <p className="fida-film-eyebrow"><span /> AN EXPRESSION, ENTIRELY YOURS</p>
          <h2>Dress for<br /><em>your moment.</em></h2>
          <p className="fida-film-description">From the first light<br />to the last dance.</p>
        </div>

        <div className="fida-film-rail">
          <span className="fida-film-scroll"><ArrowDown size={16} aria-hidden="true" /><span>SCROLL TO<br />FEEL THE STORY</span></span>
          <div className="fida-film-position" aria-hidden="true">
            <span className="fida-film-chapter">THE FIRST LIGHT</span>
            <span className="fida-film-progress"><i className="fida-film-progress-fill" /></span>
          </div>
          <a className="fida-film-collection" href="/products"><span>Discover the collection</span><ArrowUpRight size={20} aria-hidden="true" /></a>
        </div>
        <span className="fida-film-side-note" aria-hidden="true">FASHIONS & LIFESTYLES / INDIA</span>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { journeyState, useOdysseusStore } from '../store/useOdysseusStore';
import { resolveScroll, nearestAnchorVh } from '../lib/scroll';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Immobilité considérée comme « l'utilisateur a fini de scroller ».
const IDLE_MS = 150;
const IDLE_SPEED = 0.35; // px/frame
const SNAP_TOLERANCE_PX = 8;

export function useJourneyScroll() {
  const stepCount = useOdysseusStore((s) => s.steps.length);
  const setNarrative = useOdysseusStore((s) => s.setNarrative);
  const lenisRef = useRef(null);
  // Empêche l'aimantation de contrarier un déplacement déclenché par un bouton.
  const suspendRef = useRef(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const lenis = reduced
      ? null
      : new Lenis({
          // Inertie longue : le glissement d'une escale à l'autre doit se
          // regarder, pas s'expédier.
          duration: 2.1,
          easing: (t) => 1 - Math.pow(1 - t, 4),
          smoothWheel: true,
          touchMultiplier: 1.6,
        });
    lenisRef.current = lenis;

    let previous = lenis ? lenis.scroll : window.scrollY;
    let idleSince = 0;

    const apply = (scrollY) => {
      const state = resolveScroll(scrollY, window.innerHeight, stepCount);
      journeyState.progress = state.progress;
      journeyState.phase = state.phase;
      journeyState.heroFade = state.heroFade;
      journeyState.epilogueFade = state.epilogueFade;
      journeyState.legT = state.legT;
      setNarrative(state.index, state.sailing, state.phase);
    };

    /**
     * Aimantation : dès que le défilement s'arrête, on rejoint l'escale la plus
     * proche. C'est ce qui rend la navigation prévisible — on ne peut pas
     * s'immobiliser au milieu d'une traversée, là où il n'y a rien à lire.
     */
    const maybeSnap = (scrollY, now) => {
      const { hasStarted, cinema } = useOdysseusStore.getState();
      if (!hasStarted || cinema || now < suspendRef.current) return;

      const vh = window.innerHeight;
      // On borne à ce qui est réellement atteignable, sinon l'aimantation
      // vise une position hors document et se relance indéfiniment.
      const maxScroll = document.documentElement.scrollHeight - vh;
      const target = Math.min(nearestAnchorVh(scrollY / vh, stepCount) * vh, maxScroll);
      if (Math.abs(target - scrollY) < SNAP_TOLERANCE_PX) return;

      suspendRef.current = now + 1900;
      if (lenis) lenis.scrollTo(target, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: target, behavior: 'smooth' });
    };

    let raf;
    const tick = (time) => {
      lenis?.raf(time);
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      apply(scrollY);

      const speed = Math.abs(scrollY - previous);
      previous = scrollY;
      if (speed > IDLE_SPEED) idleSince = time;
      else if (time - idleSince > IDLE_MS) maybeSnap(scrollY, time);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onPointer = (e) => {
      journeyState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journeyState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [stepCount, setNarrative]);

  return { lenisRef, suspendRef };
}

/** Défilement programmatique (bouton « commencer », timeline, flèches). */
export function scrollToVh(nav, vhOffset, duration = 3) {
  const target = vhOffset * window.innerHeight;
  const lenis = nav?.lenisRef?.current;
  if (nav?.suspendRef) nav.suspendRef.current = performance.now() + duration * 1000 + 250;
  if (lenis) lenis.scrollTo(target, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: target, behavior: 'smooth' });
}

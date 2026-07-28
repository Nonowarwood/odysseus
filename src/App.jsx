import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import Chart from './components/map/Chart';
import Overture from './components/ui/Overture';
import Chrome from './components/ui/Chrome';
import ChapterPanel from './components/ui/ChapterPanel';
import TransitBanner from './components/ui/TransitBanner';
import Timeline from './components/ui/Timeline';
import Epilogue from './components/ui/Epilogue';
import ProgressRail from './components/ui/ProgressRail';
import PlateLayer from './components/ui/PlateLayer';

import { useJourneyScroll, scrollToVh } from './hooks/useJourneyScroll';
import { useOdysseusStore } from './store/useOdysseusStore';
import { startAmbience, stopAmbience, setScore, setChapterTrack } from './lib/ambience';
import { trackFor } from './data/soundtrack';
import { documentVh, stopOffsetVh } from './lib/scroll';

// Secondes de lecture accordées à chaque hauteur d'écran en mode cinéma.
const CINEMA_SECONDS_PER_VH = 15;

export default function App() {
  const nav = useJourneyScroll();

  const steps = useOdysseusStore((s) => s.steps);
  const index = useOdysseusStore((s) => s.index);
  const phase = useOdysseusStore((s) => s.phase);
  const sailing = useOdysseusStore((s) => s.sailing);
  const soundOn = useOdysseusStore((s) => s.soundOn);
  const cinema = useOdysseusStore((s) => s.cinema);
  const setCinema = useOdysseusStore((s) => s.setCinema);
  const hasStarted = useOdysseusStore((s) => s.hasStarted);
  const startJourney = useOdysseusStore((s) => s.startJourney);

  const readingVeil = phase === 'journey' && !sailing;
  const totalVh = documentVh(steps.length);

  // --- Verrou du scroll tant que l'ouverture n'est pas franchie -----------
  useEffect(() => {
    const lenis = nav.lenisRef.current;
    if (hasStarted) {
      lenis?.start();
      document.body.style.overflow = '';
    } else {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hasStarted, nav]);

  useEffect(() => {
    if (soundOn) startAmbience();
    else stopAmbience();
    return () => stopAmbience();
  }, [soundOn]);

  // La partition suit le chapitre : la météo du récit pilote directement les
  // couches sonores, si bien que l'orage s'entend avant même de se voir.
  useEffect(() => {
    if (!soundOn) return;
    const w = steps[index].weather ?? {};
    setScore({
      storm: Math.max(w.rain ?? 0, (w.lightning ?? 0) * 0.9),
      tension: Math.max(w.wind ?? 0, (w.embers ?? 0) * 0.85, (w.mist ?? 0) * 0.5),
      wonder: Math.max(w.motes ?? 0, (w.mist ?? 0) * 0.6),
    });
    setChapterTrack(trackFor(phase, steps[index].id));
  }, [index, phase, soundOn, steps]);

  const goToStop = useCallback(
    (i) => {
      setCinema(false);
      scrollToVh(nav, stopOffsetVh(Math.min(Math.max(i, 0), steps.length - 1)), 2.8);
    },
    [nav, setCinema, steps.length]
  );

  const begin = useCallback(() => {
    startJourney();
    // On laisse au verrou le temps de se lever avant de lancer le défilement.
    requestAnimationFrame(() => goToStop(0));
  }, [goToStop, startJourney]);

  // --- Mode cinéma : la page se déroule seule, à vitesse de lecture --------
  const cinemaRef = useRef({ raf: 0, last: 0 });
  useEffect(() => {
    if (!cinema) return;

    const state = cinemaRef.current;
    state.last = performance.now();
    const speed = window.innerHeight / CINEMA_SECONDS_PER_VH;
    const maxScroll = (totalVh - 1) * window.innerHeight;

    const tick = (now) => {
      const dt = Math.min((now - state.last) / 1000, 0.06);
      state.last = now;

      const lenis = nav.lenisRef.current;
      const current = lenis ? lenis.scroll : window.scrollY;
      const next = current + speed * dt;

      if (next >= maxScroll) {
        if (lenis) lenis.scrollTo(maxScroll, { immediate: true });
        else window.scrollTo(0, maxScroll);
        setCinema(false);
        return;
      }

      if (lenis) lenis.scrollTo(next, { immediate: true });
      else window.scrollTo(0, next);
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);

    const cancel = () => setCinema(false);
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [cinema, nav, setCinema, totalVh]);

  // --- Navigation au clavier ---------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const s = useOdysseusStore.getState();
      if (!s.hasStarted) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          begin();
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToStop(s.index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToStop(s.index - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToStop(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToVh(nav, totalVh - 1, 3.4);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [begin, goToStop, nav, totalVh]);

  return (
    <>
      <Chart onStopClick={goToStop} />

      {/* Voile de lisibilité : présent seulement quand une colonne de texte
          l'exige. Il vient de la gauche sur grand écran, du bas sur mobile —
          là où le texte se trouve réellement. */}
      <motion.div
        aria-hidden
        animate={{ opacity: readingVeil ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-0 z-10"
      >
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              'linear-gradient(to top, rgba(4,9,15,0.97) 0%, rgba(4,9,15,0.93) 58%, rgba(4,9,15,0.55) 82%, rgba(4,9,15,0.1) 100%)',
          }}
        />
        {/* Le voile couvre tout l'écran et s'éteint dans le dégradé lui-même.
            Le limiter à une boîte de 62vw avec un dégradé oblique laissait une
            arête verticale nette au bord de la boîte, visible sur la mer. */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              'linear-gradient(to right, rgba(4,9,15,0.96) 0%, rgba(4,9,15,0.93) 24%, rgba(4,9,15,0.72) 40%, rgba(4,9,15,0.3) 54%, rgba(4,9,15,0) 66%)',
          }}
        />
      </motion.div>

      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-20" />

      <ProgressRail />
      <Chrome
        onToggleCinema={() => setCinema(!cinema)}
        onRestart={() => goToStop(0)}
        onPrev={() => goToStop(index - 1)}
        onNext={() => goToStop(index + 1)}
      />
      <PlateLayer />
      <ChapterPanel />
      <TransitBanner />
      <Timeline onSelect={goToStop} />
      <Epilogue onRestart={() => goToStop(0)} />
      <Overture onBegin={begin} />

      {/* Le document n'existe que pour donner sa longueur au récit. */}
      <div aria-hidden style={{ height: `${totalVh * 100}vh` }} />
    </>
  );
}

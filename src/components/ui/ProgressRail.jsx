import { useEffect, useRef } from 'react';
import { journeyState, useOdysseusStore } from '../../store/useOdysseusStore.js';

/** Filet de progression en haut d'écran, mis à jour hors du cycle React. */
export default function ProgressRail() {
  const stepCount = useOdysseusStore((s) => s.steps.length);
  const barRef = useRef(null);

  useEffect(() => {
    let frame;
    const tick = () => {
      const bar = barRef.current;
      if (bar) {
        const p =
          journeyState.phase === 'epilogue'
            ? 1
            : journeyState.phase === 'hero'
              ? 0
              : journeyState.progress / (stepCount - 1);
        bar.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stepCount]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px bg-gold/10">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-gold/40 via-gold to-gold/70"
        style={{ transform: 'scaleX(0)', willChange: 'transform' }}
      />
    </div>
  );
}

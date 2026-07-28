import { AnimatePresence, motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';

const LEVELS = [
  { id: 'summary', label: 'Résumé' },
  { id: 'full', label: 'Récit' },
  { id: 'quote', label: 'Homère' },
];

/**
 * Le panneau reste monté en permanence : il ne fait que s'estomper pendant les
 * traversées. Le démonter au fil du scroll rendait son retour aléatoire.
 */
export default function ChapterPanel() {
  const step = useOdysseusStore((s) => s.steps[s.index]);
  const phase = useOdysseusStore((s) => s.phase);
  const sailing = useOdysseusStore((s) => s.sailing);
  const mapMode = useOdysseusStore((s) => s.mapMode);
  const detail = useOdysseusStore((s) => s.detail);
  const setDetail = useOdysseusStore((s) => s.setDetail);

  const visible = phase === 'journey' && !sailing;

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 z-30 flex w-full items-end px-6 pb-36 md:w-[48vw] md:max-w-[580px] md:items-center md:px-10 md:pb-0 lg:px-14">
      <motion.article
        animate={{
          opacity: visible ? 1 : 0,
          x: visible ? 0 : -18,
          filter: visible ? 'blur(0px)' : 'blur(5px)',
        }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
        className="relative w-full"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-1 -top-14 select-none font-title text-[8rem] leading-none text-gold/[0.09] md:-top-16 md:text-[11rem]"
        >
          {step.numeral}
        </span>

        <div className="relative">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.34em] text-gold">
            <span className="whitespace-nowrap">{step.chapter}</span>
            <span className="h-px w-7 bg-gold/50" />
            <span className="text-papyrus/85">{step.timeLabel}</span>
          </p>

          <h2 className="mt-4 font-title text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[1.02] text-ivory">
            {step.title}
          </h2>

          <p className="mt-2 flex items-baseline gap-3">
            <span className="font-title text-xl text-gold">{step.greek}</span>
            <span className="text-sm italic text-papyrus/85">{step.theme}</span>
          </p>

          <div className="mt-7 flex gap-7 border-b border-gold/20 pb-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setDetail(l.id)}
                className={`relative text-[10px] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ${
                  detail === l.id ? 'text-gold' : 'text-papyrus/60 hover:text-ivory'
                }`}
              >
                {l.label}
                {detail === l.id && (
                  <motion.span
                    layoutId="detail-underline"
                    className="absolute -bottom-3 left-0 right-0 h-px bg-gold"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[10rem]">
            <AnimatePresence mode="wait">
              {detail === 'summary' && (
                <motion.p
                  key={`s-${step.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-[1.05rem] font-light leading-[1.7] text-ivory md:text-[1.15rem]"
                >
                  {step.summary}
                </motion.p>
              )}

              {detail === 'full' && (
                <motion.p
                  key={`f-${step.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[40vh] overflow-y-auto pr-3 text-[0.94rem] font-light leading-[1.8] text-ivory/95 [scrollbar-color:rgba(217,180,65,0.4)_transparent] [scrollbar-width:thin]"
                >
                  {step.fullStory}
                </motion.p>
              )}

              {detail === 'quote' && (
                <motion.figure
                  key={`q-${step.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="border-l-2 border-gold/50 pl-5"
                >
                  <blockquote className="font-title text-xl italic leading-snug text-papyrus md:text-2xl">
                    « {step.quote} »
                  </blockquote>
                  <figcaption className="mt-3 text-[9px] font-medium uppercase tracking-[0.3em] text-gold/90">
                    {step.quoteRef}
                  </figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-7 border-t border-gold/20 pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.26em] text-gold">
              {step.duration}
            </p>
            <p className="mt-1.5 text-[11px] tracking-[0.06em] text-papyrus/80">
              {step.characters.join(' · ')}
            </p>
          </div>

          <p className="mt-4 text-sm italic leading-relaxed text-papyrus/85">{step.consequence}</p>

          {mapMode === 'historians' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 overflow-hidden border-t border-dashed border-papyrus/30 pt-4"
            >
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-papyrus">
                {step.certainty === 'debated' ? 'Localisation débattue' : 'Localisation établie'}
              </p>
              <p className="mt-1.5 text-[0.82rem] font-light leading-relaxed text-papyrus/80">
                {step.historianNote}
              </p>
            </motion.div>
          )}
        </div>
      </motion.article>
    </div>
  );
}

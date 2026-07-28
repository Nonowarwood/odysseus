import { motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';

/**
 * Rail chronologique : l'espacement des escales est proportionnel au temps
 * écoulé, pas au nombre de chapitres. Les sept années chez Calypso occupent
 * donc physiquement le tiers du rail — c'est le seul moyen de faire *sentir*
 * la durée du voyage.
 */
export default function Timeline({ onSelect }) {
  const steps = useOdysseusStore((s) => s.steps);
  const index = useOdysseusStore((s) => s.index);
  const phase = useOdysseusStore((s) => s.phase);

  const visible = phase !== 'hero';

  return (
    // Le positionnement reste sur un conteneur neutre : framer-motion écrit un
    // `transform` inline qui écraserait un centrage fait en classe utilitaire.
    <div className="fixed right-7 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <motion.nav
        aria-label="Chronologie du voyage"
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <p className="mb-5 text-right text-[9px] font-medium uppercase tracking-[0.32em] text-papyrus/60">
          Année 0
        </p>

        <div className="flex h-[52vh] flex-col items-end">
        {steps.map((step, i) => {
          const reached = i <= index;
          const active = i === index;
          const next = steps[i + 1];
          const gap = next ? next.year - step.year : 0;
          const grow = 1 + 3.2 * (gap / 10);

          return (
            <div key={step.id} className="contents">
              <button
                onClick={() => onSelect?.(i)}
                className="group flex items-center gap-3 outline-none"
              >
                <span
                  className={`whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.24em] transition-all duration-500 ${
                    active
                      ? 'text-gold opacity-100'
                      : 'text-papyrus opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`block rotate-45 transition-all duration-500 ${
                    active
                      ? 'h-2.5 w-2.5 bg-gold shadow-[0_0_14px_rgba(201,162,39,0.9)]'
                      : reached
                        ? 'h-1.5 w-1.5 bg-gold/70'
                        : 'h-1.5 w-1.5 border border-papyrus/60 bg-transparent'
                  }`}
                />
              </button>

              {next && (
                <div
                  className="relative flex w-full justify-end"
                  style={{ flexGrow: grow, flexBasis: 0 }}
                >
                  <span
                    className={`mr-[3px] h-full w-px transition-colors duration-700 ${
                      i < index ? 'bg-gold/70' : 'bg-papyrus/30'
                    }`}
                  />
                  {step.gapLabel && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.26em] text-papyrus/70">
                      {step.gapLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>

        <p className="mt-5 text-right text-[9px] font-medium uppercase tracking-[0.32em] text-gold">
          Année 10
        </p>
      </motion.nav>
    </div>
  );
}

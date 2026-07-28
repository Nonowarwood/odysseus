import { motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex items-center border border-gold/25 bg-void/75">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-2 text-[9px] font-medium uppercase tracking-[0.22em] transition-colors duration-400 ${
            value === o.value ? 'bg-gold text-void' : 'text-papyrus/80 hover:text-gold'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function IconButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center border bg-void/75 transition-colors duration-400 disabled:opacity-25 ${
        active
          ? 'border-gold bg-gold/15 text-gold'
          : 'border-gold/25 text-papyrus/80 hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}

export default function Chrome({ onToggleCinema, onRestart, onPrev, onNext }) {
  const steps = useOdysseusStore((s) => s.steps);
  const index = useOdysseusStore((s) => s.index);
  const phase = useOdysseusStore((s) => s.phase);
  const hasStarted = useOdysseusStore((s) => s.hasStarted);
  const mapMode = useOdysseusStore((s) => s.mapMode);
  const setMapMode = useOdysseusStore((s) => s.setMapMode);
  const soundOn = useOdysseusStore((s) => s.soundOn);
  const toggleSound = useOdysseusStore((s) => s.toggleSound);
  const cinema = useOdysseusStore((s) => s.cinema);

  const shown = hasStarted;
  const inJourney = phase === 'journey';

  const appear = (delay = 0) => ({
    animate: { opacity: shown ? 1 : 0, y: shown ? 0 : -10 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
    style: { pointerEvents: shown ? 'auto' : 'none' },
  });

  return (
    <>
      {/* Marque */}
      <motion.button
        onClick={onRestart}
        {...appear()}
        className="fixed left-6 top-6 z-40 text-left md:left-10 md:top-8"
      >
        <span className="block font-title text-2xl leading-none text-ivory transition-colors duration-500 hover:text-gold">
          Odysseus
        </span>
        <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.38em] text-gold/80">
          Le Retour
        </span>
      </motion.button>

      {/* Commandes */}
      <motion.div
        {...appear(0.05)}
        className="fixed right-6 top-6 z-40 flex items-center gap-2 md:right-10 md:top-8"
      >
        <IconButton active={soundOn} onClick={toggleSound} label="Ambiance sonore">
          {soundOn ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              <path d="M16.5 8.5a5 5 0 010 7" strokeLinecap="round" />
              <path d="M19 6a8.5 8.5 0 010 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              <path d="M17 9.5l4 5M21 9.5l-4 5" strokeLinecap="round" />
            </svg>
          )}
        </IconButton>

        <IconButton active={cinema} onClick={onToggleCinema} label="Mode cinéma">
          {cinema ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4l13 8-13 8V4z" />
            </svg>
          )}
        </IconButton>
      </motion.div>

      {/* Barre de navigation entre escales — le repère principal.
          Le centrage vit sur le conteneur : framer-motion écrit un transform
          inline qui écraserait un `-translate-x-1/2` posé en classe. */}
      <motion.div
        {...appear(0.1)}
        className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 md:bottom-8"
      >
        <div className="flex items-center gap-3">
          <IconButton onClick={onPrev} disabled={!inJourney || index === 0} label="Escale précédente">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          <div className="flex min-w-0 max-w-[15rem] flex-col items-center border border-gold/25 bg-void/80 px-5 py-2 sm:min-w-[13rem] sm:max-w-none">
            <span className="text-[8px] font-medium uppercase tracking-[0.34em] text-papyrus/60">
              {phase === 'epilogue' ? 'Bilan' : `Escale ${index + 1} / ${steps.length}`}
            </span>
            <span className="mt-0.5 max-w-full truncate font-title text-base leading-tight text-ivory">
              {phase === 'epilogue' ? 'Le voyage est terminé' : steps[index].title}
            </span>
          </div>

          <IconButton
            onClick={onNext}
            disabled={!inJourney || index === steps.length - 1}
            label="Escale suivante"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </div>
      </motion.div>

      {/* Lecture de la carte */}
      <motion.div {...appear(0.15)} className="fixed bottom-8 left-6 z-40 hidden md:left-10 md:block">
        <p className="mb-2 text-[8px] font-medium uppercase tracking-[0.3em] text-papyrus/50">
          Lecture de la carte
        </p>
        <Segmented
          value={mapMode}
          onChange={setMapMode}
          options={[
            { value: 'homer', label: 'Homère' },
            { value: 'historians', label: 'Historiens' },
          ]}
        />
      </motion.div>
    </>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';
import { totalJourneyDistanceKm } from '../../lib/route';
import Rule from './Rule';

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Epilogue({ onRestart }) {
  const phase = useOdysseusStore((s) => s.phase);
  const steps = useOdysseusStore((s) => s.steps);
  const visible = phase === 'epilogue';

  const distance = totalJourneyDistanceKm(steps);

  const stats = [
    { value: '10 ans', label: 'Durée du retour' },
    { value: String(steps.length), label: 'Escales du récit' },
    { value: `≈ ${distance.toLocaleString('fr-FR')} km`, label: 'Distance parcourue' },
    { value: '12 → 0', label: 'Navires restants' },
    { value: '600 → 1', label: 'Hommes revenus' },
    { value: '7 ans', label: 'Immobile chez Calypso' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-6 pb-24 text-center"
        >
          <motion.p
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0}
            className="text-[10px] font-medium uppercase tracking-[0.45em] text-gold"
          >
            Épilogue
          </motion.p>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 font-title text-[clamp(2.6rem,6.5vw,5rem)] leading-[1.02] text-ivory"
          >
            Le voyage est terminé
          </motion.h2>

          <motion.div variants={reveal} initial="hidden" animate="show" custom={2} className="mt-8 w-full max-w-sm">
            <Rule />
          </motion.div>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 max-w-2xl font-title text-xl italic leading-snug text-papyrus md:text-2xl"
          >
            « Il n'est rien de plus doux que sa patrie et ses parents, même à celui qui habite
            au loin une riche demeure. »
          </motion.p>

          <motion.dl
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="font-title text-3xl text-gold md:text-4xl">{s.value}</dt>
                <dd className="mt-2 text-[8px] font-medium uppercase tracking-[0.26em] text-papyrus/75">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.button
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={5}
            onClick={onRestart}
            className="pointer-events-auto mt-14 border border-gold/50 bg-gold/[0.08] px-9 py-3.5 text-[10px] font-medium uppercase tracking-[0.34em] text-gold transition-colors duration-500 hover:bg-gold hover:text-void"
          >
            Reprendre depuis Troie
          </motion.button>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={6}
            className="mt-10 max-w-md text-[9px] leading-relaxed text-papyrus/45"
          >
            Gravures : John Flaxman, gravées par Achille Réveil — domaine public.
            Côtes : Natural Earth. Musique originale ; effets atmosphériques et
            partition de repli synthétisés à la volée.
          </motion.p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

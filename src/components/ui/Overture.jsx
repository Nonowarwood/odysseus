import { AnimatePresence, motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';
import Rule from './Rule';

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 1.3, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Ouverture bloquante : le scroll ne démarre qu'après un clic explicite.
 * On entre dans le récit, on n'y tombe pas.
 */
export default function Overture({ onBegin }) {
  const hasStarted = useOdysseusStore((s) => s.hasStarted);

  return (
    <AnimatePresence>
      {!hasStarted && (
        <motion.header
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(6,13,22,0.42) 0%, rgba(6,13,22,0.8) 55%, rgba(6,13,22,0.97) 100%)',
          }}
        >
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.25}
            className="text-[10px] font-medium uppercase tracking-[0.55em] text-gold"
          >
            Homère · Odyssée
          </motion.p>

          <motion.h1
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.45}
            className="mt-8 font-title text-[clamp(3.5rem,13vw,10rem)] font-normal leading-[0.9] tracking-[0.02em] text-ivory"
            style={{ textShadow: '0 0 90px rgba(217,180,65,0.3)' }}
          >
            Odysseus
          </motion.h1>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.75}
            className="mt-9 w-full max-w-sm"
          >
            <Rule />
          </motion.div>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.9}
            className="mt-7 text-[11px] font-medium uppercase tracking-[0.45em] text-papyrus"
          >
            Le Retour
          </motion.p>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.15}
            className="mt-10 max-w-xl font-title text-2xl italic leading-snug text-ivory/90 md:text-3xl"
          >
            « Après dix années de guerre, un roi entreprend son plus long voyage. »
          </motion.p>

          <motion.button
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.6}
            onClick={onBegin}
            className="group mt-14 inline-flex items-center gap-4 border border-gold/50 bg-gold/[0.06] px-11 py-4 text-[10px] font-medium uppercase tracking-[0.4em] text-gold backdrop-blur-[2px] transition-colors duration-500 hover:bg-gold hover:text-void"
          >
            Commencer le voyage
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.button>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
            className="absolute bottom-9 text-[9px] uppercase tracking-[0.32em] text-papyrus/50"
          >
            14 escales · 10 ans · 1 seul survivant
          </motion.p>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

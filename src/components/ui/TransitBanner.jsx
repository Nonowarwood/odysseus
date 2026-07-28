import { AnimatePresence, motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore.js';
import { legDistanceKm } from '../../lib/route.js';

/**
 * Pendant la traversée, le texte s'efface : il ne reste que la mer, le sillage
 * et ce cartouche de journal de bord.
 */
export default function TransitBanner() {
  const steps = useOdysseusStore((s) => s.steps);
  const index = useOdysseusStore((s) => s.index);
  const sailing = useOdysseusStore((s) => s.sailing);
  const phase = useOdysseusStore((s) => s.phase);

  const next = steps[index + 1];
  const visible = phase === 'journey' && sailing && Boolean(next);
  const km = visible ? legDistanceKm(steps, index) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-36 z-30 flex justify-center px-6 md:bottom-28"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-papyrus/70">
              En mer
            </p>
            <p className="font-title text-3xl text-ivory md:text-4xl">Cap sur {next.title}</p>
            <div className="flex items-center gap-4 text-[9px] font-medium uppercase tracking-[0.3em] text-gold">
              <span>≈ {km.toLocaleString('fr-FR')} km</span>
              <span className="h-1 w-1 rotate-45 bg-gold/50" />
              <span>{next.duration}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useOdysseusStore } from '../../store/useOdysseusStore';
import { asset } from '../../lib/asset';

/**
 * La gravure du chapitre, posée dans l'espace laissé libre par la colonne de
 * texte. Le PNG ne contient que le trait, en blanc sur transparent : on s'en
 * sert comme masque et on peint l'or au travers, puis un second masque radial
 * fait fondre les bords dans la mer — la planche apparaît comme un souvenir,
 * pas comme une image collée.
 */
export default function PlateLayer() {
  const step = useOdysseusStore((s) => s.steps[s.index]);
  const phase = useOdysseusStore((s) => s.phase);
  const sailing = useOdysseusStore((s) => s.sailing);

  const visible = phase === 'journey' && !sailing && Boolean(step.plate);

  return (
    <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.figure
            key={step.plate}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-[7vh] m-0 flex flex-col items-center px-8 md:inset-x-auto md:right-[6vw] md:top-[46%] md:w-[42vw] md:max-w-[600px] md:-translate-y-1/2 md:px-0 xl:right-[14vw]"
          >
            <div
              className="w-full"
              style={{
                aspectRatio: '1.65',
                background:
                  'linear-gradient(165deg, #fff3c9 0%, #f0cf6a 42%, #c9a227 100%)',
                WebkitMaskImage: `url(${asset(`plates/${step.plate}.png`)}), radial-gradient(ellipse 74% 78% at 50% 48%, #000 40%, transparent 97%)`,
                maskImage: `url(${asset(`plates/${step.plate}.png`)}), radial-gradient(ellipse 74% 78% at 50% 48%, #000 40%, transparent 97%)`,
                WebkitMaskSize: 'contain, 100% 100%',
                maskSize: 'contain, 100% 100%',
                WebkitMaskRepeat: 'no-repeat, no-repeat',
                maskRepeat: 'no-repeat, no-repeat',
                WebkitMaskPosition: 'center, center',
                maskPosition: 'center, center',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
                opacity: 0.9,
                filter: 'drop-shadow(0 0 34px rgba(240,207,106,0.3))',
              }}
            />

            <figcaption className="mt-4 hidden max-w-[30rem] text-center text-[10px] font-light italic leading-relaxed text-papyrus/70 md:block">
              {step.plateCaption}
            </figcaption>
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  );
}

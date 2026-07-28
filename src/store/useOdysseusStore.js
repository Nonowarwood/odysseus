import { create } from 'zustand';
import { journeySteps } from '../data/journeySteps';

/**
 * Progression continue du récit, écrite à chaque frame par le scroll et lue
 * par le canvas. Volontairement hors de React : re-rendre l'arbre soixante
 * fois par seconde ferait tomber l'animation de la carte.
 */
export const journeyState = {
  progress: 0, // 0 → steps.length - 1
  phase: 'hero', // 'hero' | 'journey' | 'epilogue'
  heroFade: 0, // 0 = héros plein écran, 1 = carte révélée
  epilogueFade: 0,
  legT: 0, // avancement de la traversée en cours (0 → 1)
  pointer: { x: 0, y: 0 },
};

export const useOdysseusStore = create((set, get) => ({
  steps: journeySteps,

  // Tant que le voyage n'a pas été accepté, le scroll reste verrouillé sur
  // l'ouverture : on entre par un geste, pas par accident.
  hasStarted: false,
  startJourney: () => set({ hasStarted: true }),

  // Étape narrative affichée (change rarement — c'est ce qui pilote le texte).
  index: 0,
  sailing: false, // true pendant une traversée entre deux escales
  phase: 'hero',

  mapMode: 'homer', // 'homer' | 'historians'
  // Allumé d'origine : le son démarre au clic d'entrée, seul moment où le
  // navigateur autorise la lecture audio.
  soundOn: true,
  cinema: false,
  detail: 'summary', // 'summary' | 'full' | 'quote'

  setNarrative: (index, sailing, phase) => {
    const s = get();
    if (s.index === index && s.sailing === sailing && s.phase === phase) return;
    set({
      index,
      sailing,
      phase,
      detail: s.index === index ? s.detail : 'summary',
    });
  },

  setDetail: (detail) => set({ detail }),
  setMapMode: (mapMode) => set({ mapMode }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setCinema: (cinema) => set({ cinema }),
}));

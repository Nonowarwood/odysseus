import { clamp, easeInOut, smoothstep } from './camera';
import { legDistanceKm } from './route';

// Découpage du document, en multiples de la hauteur d'écran.
export const HERO_VH = 1;
export const EPILOGUE_VH = 2;

// Part fixe d'un bloc-chapitre : le temps de lire, identique partout.
const DWELL_VH = 0.7;

// Part variable : la traversée. Elle s'étire avec la distance réellement
// parcourue, si bien que la remontée de la mer du Couchant ne se boucle pas
// aussi vite qu'un saut de Messine à Taormine.
const TRAVEL_MIN_VH = 0.35;
const TRAVEL_MAX_VH = 2.6;

/**
 * Géométrie du document, dérivée des distances du voyage.
 * Les blocs n'ayant plus la même hauteur, tout se calcule à partir d'offsets
 * cumulés plutôt que d'une simple multiplication.
 */
export function buildLayout(steps) {
  const legs = steps.map((_, i) => (i < steps.length - 1 ? legDistanceKm(steps, i) : 0));
  const longest = Math.max(...legs, 1);

  let cursor = HERO_VH;
  const blocks = legs.map((km, i) => {
    // Racine carrée : sans elle, les traversées courtes deviennent
    // imperceptibles à côté des 2 400 km de la remontée vers Corcyre.
    const weight = i < steps.length - 1 ? Math.sqrt(km / longest) : 0;
    const travelVh = i < steps.length - 1 ? TRAVEL_MIN_VH + (TRAVEL_MAX_VH - TRAVEL_MIN_VH) * weight : 0;
    const block = {
      startVh: cursor,
      dwellVh: DWELL_VH,
      travelVh,
      blockVh: DWELL_VH + travelVh,
      km,
      weight,
    };
    cursor += block.blockVh;
    return block;
  });

  const journeyEndVh = cursor;
  const totalVh = journeyEndVh + EPILOGUE_VH;

  return {
    blocks,
    journeyEndVh,
    totalVh,
    stopOffsetVh: (i) => blocks[clamp(i, 0, blocks.length - 1)].startVh,
    epilogueVh: journeyEndVh + (EPILOGUE_VH - 1),
  };
}

/**
 * Points d'ancrage du scroll aimanté : l'ouverture, chaque escale, l'épilogue.
 * On ne s'immobilise jamais ailleurs.
 */
export function anchorsVh(layout) {
  return [0, ...layout.blocks.map((b) => b.startVh), layout.epilogueVh];
}

export function nearestAnchorVh(scrollVh, layout) {
  let best = 0;
  let bestGap = Infinity;
  for (const a of anchorsVh(layout)) {
    const gap = Math.abs(a - scrollVh);
    if (gap < bestGap) {
      bestGap = gap;
      best = a;
    }
  }
  return best;
}

/**
 * Traduit une position de scroll en état narratif :
 *   progress — abscisse continue sur la route (0 → nombre d'escales - 1)
 *   index    — escale décrite par le texte
 *   sailing  — vrai pendant la traversée, quand le texte cède la place à la mer
 */
export function resolveScroll(scrollY, viewportH, layout) {
  const vh = viewportH || 1;
  const y = scrollY / vh;
  const last = layout.blocks.length - 1;

  if (y < HERO_VH) {
    return {
      phase: 'hero',
      progress: 0,
      index: 0,
      sailing: false,
      heroFade: smoothstep(clamp(y / HERO_VH, 0, 1)),
      epilogueFade: 0,
      legT: 0,
    };
  }

  if (y < layout.journeyEndVh) {
    let index = last;
    for (let i = 0; i < layout.blocks.length; i++) {
      const b = layout.blocks[i];
      if (y < b.startVh + b.blockVh) {
        index = i;
        break;
      }
    }

    const block = layout.blocks[index];
    const local = y - block.startVh;
    const legT =
      block.travelVh > 0
        ? easeInOut(clamp((local - block.dwellVh) / block.travelVh, 0, 1))
        : 0;

    return {
      phase: 'journey',
      progress: index + legT,
      index,
      sailing: block.travelVh > 0 && legT > 0.04 && legT < 0.96,
      heroFade: 1,
      epilogueFade: 0,
      legT,
    };
  }

  const t = clamp((y - layout.journeyEndVh) / ((EPILOGUE_VH - 1) * 0.85), 0, 1);
  return {
    phase: 'epilogue',
    progress: last,
    index: last,
    sailing: false,
    heroFade: 1,
    epilogueFade: smoothstep(t),
    legT: 0,
  };
}

import { clamp, easeInOut, smoothstep } from './camera';

// Découpage du document, en multiples de la hauteur d'écran.
export const HERO_VH = 1;
export const CHAPTER_VH = 1;
export const EPILOGUE_VH = 2;

// Part d'un bloc-chapitre passée à l'arrêt sur l'escale, avant d'appareiller.
// Volontairement large : le scroll aimanté ramène de toute façon sur l'escale,
// et il vaut mieux une traversée brève qu'un long moment sans texte à l'écran.
const DWELL = 0.68;

export function documentVh(stepCount) {
  return HERO_VH + stepCount * CHAPTER_VH + EPILOGUE_VH;
}

/** Position de scroll (en vh) de l'escale i. */
export function stopOffsetVh(i) {
  return HERO_VH + i * CHAPTER_VH;
}

/**
 * Points d'ancrage du scroll aimanté : l'ouverture, chaque escale, l'épilogue.
 * On ne s'immobilise jamais ailleurs.
 */
export function anchorsVh(stepCount) {
  return [
    0,
    ...Array.from({ length: stepCount }, (_, i) => stopOffsetVh(i)),
    HERO_VH + stepCount * CHAPTER_VH + (EPILOGUE_VH - 1),
  ];
}

export function nearestAnchorVh(scrollVh, stepCount) {
  const anchors = anchorsVh(stepCount);
  let best = anchors[0];
  let bestGap = Infinity;
  for (const a of anchors) {
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
 *   progress — abscisse continue sur la route (0 → stepCount - 1)
 *   index    — escale décrite par le texte
 *   sailing  — vrai pendant la traversée, quand le texte cède la place à la mer
 */
export function resolveScroll(scrollY, viewportH, stepCount) {
  const vh = viewportH || 1;
  const heroEnd = HERO_VH * vh;
  const journeyEnd = heroEnd + stepCount * CHAPTER_VH * vh;

  if (scrollY < heroEnd) {
    const t = clamp(scrollY / (HERO_VH * vh), 0, 1);
    return {
      phase: 'hero',
      progress: 0,
      index: 0,
      sailing: false,
      heroFade: smoothstep(t),
      epilogueFade: 0,
      legT: 0,
    };
  }

  if (scrollY < journeyEnd) {
    const u = (scrollY - heroEnd) / (CHAPTER_VH * vh);
    const index = clamp(Math.floor(u), 0, stepCount - 1);
    const local = u - index;
    const isLast = index === stepCount - 1;

    const legT = isLast ? 0 : easeInOut(clamp((local - DWELL) / (1 - DWELL), 0, 1));

    return {
      phase: 'journey',
      progress: index + legT,
      index,
      sailing: !isLast && legT > 0.04 && legT < 0.96,
      heroFade: 1,
      epilogueFade: 0,
      legT,
    };
  }

  const t = clamp((scrollY - journeyEnd) / ((EPILOGUE_VH - 1) * vh * 0.85), 0, 1);
  return {
    phase: 'epilogue',
    progress: stepCount - 1,
    index: stepCount - 1,
    sailing: false,
    heroFade: 1,
    epilogueFade: smoothstep(t),
    legT: 0,
  };
}

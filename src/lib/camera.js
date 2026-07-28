import { MAP_VIEW } from '../data/mediterranean.js';

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
export const easeInOut = (t) => {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

/** Amortissement indépendant du framerate. */
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/**
 * Échelle « cover » : la carte remplit toujours le viewport, quel que soit
 * le format d'écran, à zoom 1.
 */
export function baseScale(viewportW, viewportH) {
  const ref = MAP_VIEW.reference ?? MAP_VIEW;
  return Math.max(viewportW / ref.width, viewportH / ref.height);
}

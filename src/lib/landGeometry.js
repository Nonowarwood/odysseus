import { LAND_PATHS } from '../data/mediterranean';

let cache = null;

/**
 * Prépare les anneaux de côte : Path2D pour un tracé rapide, boîte englobante
 * pour pouvoir écarter d'un test tout ce qui sort du cadre, et surface pour
 * ignorer les îlots devenus invisibles au dézoom.
 */
export function getLandRings() {
  if (cache) return cache;

  cache = LAND_PATHS.map((d) => {
    const nums = d.match(/-?\d+(?:\.\d+)?/g);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < nums.length; i += 2) {
      const x = +nums[i];
      const y = +nums[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    return {
      path: new Path2D(d),
      minX,
      minY,
      maxX,
      maxY,
      size: Math.max(maxX - minX, maxY - minY),
    };
  });

  return cache;
}

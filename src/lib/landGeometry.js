import { LAND_PATHS, BATHYMETRY, RIVER_PATHS, LAKE_PATHS } from '../data/mediterranean';

let cache = null;

/**
 * Prépare la géométrie de la carte : Path2D pour un tracé rapide, boîte
 * englobante pour écarter d'un test tout ce qui sort du cadre, et taille pour
 * ignorer ce qui deviendrait invisible au dézoom.
 */
function prepare(d) {
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
}

export function getMapGeometry() {
  if (cache) return cache;

  cache = {
    coast: LAND_PATHS.map(prepare),
    // Nappes de profondeur, empilées de la plus large à la plus étroite :
    // c'est leur superposition qui creuse la mer.
    bathymetry: BATHYMETRY.map((level) => ({
      depth: level.depth,
      shapes: level.paths.map(prepare),
    })),
    rivers: RIVER_PATHS.map(prepare),
    lakes: LAKE_PATHS.map(prepare),
  };

  return cache;
}

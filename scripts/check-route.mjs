/**
 * Vérifie que la route d'Ulysse ne traverse aucune terre.
 *
 * La spline passe par les escales et leurs waypoints, mais rien ne l'empêche
 * de couper une île entre deux points : une courbe de Catmull-Rom déborde
 * naturellement vers l'extérieur des virages. Ce contrôle échantillonne le
 * tracé réellement dessiné et teste chaque point contre les polygones de côte.
 *
 * Usage : node scripts/check-route.mjs
 * Sortie : liste des traversées fautives, avec la position à corriger.
 * Code de retour non nul si la route touche terre — utilisable en CI.
 */
import { journeySteps } from '../src/data/journeySteps.js';
import { LAND_PATHS, MAP_VIEW } from '../src/data/mediterranean.js';
import { buildRoute } from '../src/lib/route.js';
import { project as projectLngLat } from '../src/data/mediterranean.js';

const projectStop = (s) => projectLngLat(s.coordinates.lng, s.coordinates.lat);

// --- Reconstruction des polygones à partir des chemins SVG générés ---------
const polygons = LAND_PATHS.map((d) => {
  const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const pts = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { pts, minX, minY, maxX, maxY };
});

function inPolygon(x, y, poly) {
  if (x < poly.minX || x > poly.maxX || y < poly.minY || y > poly.maxY) return false;
  const pts = poly.pts;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const onLand = (x, y) => polygons.some((p) => inPolygon(x, y, p));

// --- Projection inverse, pour rapporter des coordonnées lisibles -----------
const K = MAP_VIEW.width / (MAP_VIEW.lngMax - MAP_VIEW.lngMin);
const mercY = (lat) => (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
function unproject(x, y) {
  const lng = x / K + MAP_VIEW.lngMin;
  const m = mercY(MAP_VIEW.latMax) - y / K;
  const lat = (360 / Math.PI) * Math.atan(Math.exp((m * Math.PI) / 180)) - 90;
  return { lat, lng };
}

// --- Contrôle -------------------------------------------------------------
const route = buildRoute(journeySteps);
const stopPoints = journeySteps.map((s) => projectStop(s));

// Les escales sont parfois des îles ou des ports : l'accostage franchit
// forcément le trait de côte. On ne juge donc que ce qui se passe au large,
// à plus d'une vingtaine de kilomètres de toute escale.
const NEAR_STOP = 9; // unités de carte ≈ 21 km

const faults = [];
for (let i = 0; i < route.points.length; i++) {
  const p = route.points[i];
  const nearStop = stopPoints.some(
    (q) => Math.hypot(p.x - q.x, p.y - q.y) < NEAR_STOP
  );
  if (nearStop) continue;
  if (!onLand(p.x, p.y)) continue;

  // À quelle traversée appartient ce point ?
  let leg = 0;
  for (let s = 0; s < route.stopLengths.length - 1; s++) {
    if (route.lengths[i] >= route.stopLengths[s]) leg = s;
  }
  faults.push({ leg, ...unproject(p.x, p.y) });
}

// Regroupement par traversée pour un rapport lisible.
const byLeg = new Map();
for (const f of faults) {
  if (!byLeg.has(f.leg)) byLeg.set(f.leg, []);
  byLeg.get(f.leg).push(f);
}

if (!byLeg.size) {
  console.log('La route reste en mer sur toute sa longueur.');
  process.exit(0);
}

console.log(`${faults.length} point(s) à terre, sur ${byLeg.size} traversée(s) :\n`);
for (const [leg, pts] of [...byLeg].sort((a, b) => a[0] - b[0])) {
  const from = journeySteps[leg].title;
  const to = journeySteps[leg + 1]?.title ?? '?';
  const mid = pts[Math.floor(pts.length / 2)];
  console.log(`  ${from} → ${to}`);
  console.log(
    `    ${pts.length} points, milieu vers { lat: ${mid.lat.toFixed(2)}, lng: ${mid.lng.toFixed(2)} }`
  );
}
process.exit(1);

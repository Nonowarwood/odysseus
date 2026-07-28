/**
 * Fabrique la géographie de la carte à partir des données Natural Earth 10 m.
 *
 * Sortie : src/data/mediterranean.js — côtes, bathymétrie, fleuves et lacs,
 * déjà découpés sur la fenêtre du récit, projetés en Mercator et simplifiés.
 * Rien n'est chargé à l'exécution : tout est servi dans le bundle.
 *
 * Sources attendues dans le dossier courant (github.com/martynafford/natural-earth-geojson) :
 *   ne_10m_land.json                    ne_10m_minor_islands.json
 *   ne_10m_bathymetry_K_200.json        ne_10m_bathymetry_J_1000.json
 *   ne_10m_bathymetry_I_2000.json       ne_10m_bathymetry_H_3000.json
 *   ne_10m_bathymetry_G_4000.json       ne_10m_rivers_lake_centerlines.json
 *   ne_10m_lakes.json
 *
 * Usage : node scripts/build-map.mjs [destination]
 */
import fs from 'node:fs';

// --- Fenêtre géographique : Gibraltar → mer Noire, Alpes → Sahara ---
const LNG_MIN = -8, LNG_MAX = 39, LAT_MIN = 28.5, LAT_MAX = 48.5;
const VIEW_W = 2000;

// Clip un peu plus large que la fenêtre pour éviter les bords visibles.
const CLIP = { xMin: LNG_MIN - 1.5, xMax: LNG_MAX + 1.5, yMin: LAT_MIN - 1.5, yMax: LAT_MAX + 1.5 };

// Mercator exprimé en "degrés équivalents" pour partager l'échelle avec la longitude.
const mercY = (lat) => (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const K = VIEW_W / (LNG_MAX - LNG_MIN);
const Y_TOP = mercY(LAT_MAX);
const VIEW_H = (mercY(LAT_MAX) - mercY(LAT_MIN)) * K;

function project([lng, lat]) {
  return [(lng - LNG_MIN) * K, (Y_TOP - mercY(lat)) * K];
}

// --- Sutherland–Hodgman contre un rectangle (polygones) ---
function clipRect(ring) {
  const edges = [
    { inside: (p) => p[0] >= CLIP.xMin, inter: (a, b) => interX(a, b, CLIP.xMin) },
    { inside: (p) => p[0] <= CLIP.xMax, inter: (a, b) => interX(a, b, CLIP.xMax) },
    { inside: (p) => p[1] >= CLIP.yMin, inter: (a, b) => interY(a, b, CLIP.yMin) },
    { inside: (p) => p[1] <= CLIP.yMax, inter: (a, b) => interY(a, b, CLIP.yMax) },
  ];
  let out = ring;
  for (const e of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const curIn = e.inside(cur);
      const prevIn = e.inside(prev);
      if (curIn) {
        if (!prevIn) out.push(e.inter(prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(e.inter(prev, cur));
      }
    }
    if (out.length === 0) return [];
  }
  return out;
}
function interX(a, b, x) {
  const t = (x - a[0]) / (b[0] - a[0]);
  return [x, a[1] + t * (b[1] - a[1])];
}
function interY(a, b, y) {
  const t = (y - a[1]) / (b[1] - a[1]);
  return [a[0] + t * (b[0] - a[0]), y];
}

const inBox = (p) =>
  p[0] >= CLIP.xMin && p[0] <= CLIP.xMax && p[1] >= CLIP.yMin && p[1] <= CLIP.yMax;

/** Découpe une polyligne en tronçons contenus dans la fenêtre. */
function clipLine(points) {
  const runs = [];
  let run = [];
  for (const p of points) {
    if (inBox(p)) run.push(p);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length >= 2);
}

// --- Douglas–Peucker (en espace projeté, tolérance en unités de viewBox) ---
function rdp(points, eps) {
  if (points.length < 3) return points;
  let maxD = 0, idx = 0;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.abs((points[i][0] - ax) * dy - (points[i][1] - ay) * dx) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= eps) return [points[0], points[points.length - 1]];
  return [...rdp(points.slice(0, idx + 1), eps).slice(0, -1), ...rdp(points.slice(idx), eps)];
}

// RDP suppose une polyligne ouverte : sur un anneau fermé, le segment de base
// est dégénéré. On coupe donc l'anneau en deux au point le plus éloigné du départ.
function simplifyRing(pts, eps) {
  const ring = pts.slice();
  const [fx, fy] = ring[0];
  while (ring.length > 1) {
    const [lx, ly] = ring[ring.length - 1];
    if (Math.abs(lx - fx) < 1e-9 && Math.abs(ly - fy) < 1e-9) ring.pop();
    else break;
  }
  if (ring.length < 4) return ring;

  let far = 1, maxD = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = (ring[i][0] - fx) ** 2 + (ring[i][1] - fy) ** 2;
    if (d > maxD) { maxD = d; far = i; }
  }
  const a = rdp(ring.slice(0, far + 1), eps);
  const b = rdp([...ring.slice(far), ring[0]], eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

function ringArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

const r1 = (n) => Math.round(n * 10) / 10;

function toPath(pts, close) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${r1(pts[i][0])} ${r1(pts[i][1])}`;
  return close ? d + 'Z' : d;
}

function read(file) {
  if (!fs.existsSync(file)) {
    console.warn(`  (absent, ignoré) ${file}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectRings(g) {
  const rings = [];
  if (!g) return rings; // certains enregistrements Natural Earth ont une géométrie nulle
  if (g.type === 'Polygon') rings.push(...g.coordinates);
  else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) rings.push(...poly);
  return rings;
}

function collectLines(g) {
  if (!g) return [];
  if (g.type === 'LineString') return [g.coordinates];
  if (g.type === 'MultiLineString') return g.coordinates;
  return [];
}

/** Polygones : découpe, projection, simplification, filtre de surface. */
function polygons(file, { eps, minArea }) {
  const fc = read(file);
  if (!fc) return [];
  const out = [];
  for (const f of fc.features) {
    for (const ring of collectRings(f.geometry)) {
      if (!ring.some(inBox)) continue;
      const clipped = clipRect(ring);
      if (clipped.length < 3) continue;
      const simplified = simplifyRing(clipped.map(project), eps);
      if (simplified.length < 3) continue;
      const area = ringArea(simplified);
      if (area < minArea) continue;
      out.push({ d: toPath(simplified, true), area });
    }
  }
  return out.sort((a, b) => b.area - a.area);
}

/** Polylignes : mêmes étapes, sans fermeture ni filtre de surface. */
function polylines(file, { eps, minLength, keep }) {
  const fc = read(file);
  if (!fc) return [];
  const out = [];
  for (const f of fc.features) {
    if (keep && !keep(f.properties ?? {})) continue;
    for (const line of collectLines(f.geometry)) {
      for (const run of clipLine(line)) {
        const pts = rdp(run.map(project), eps);
        if (pts.length < 2) continue;
        let len = 0;
        for (let i = 1; i < pts.length; i++) {
          len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        }
        if (len < minLength) continue;
        out.push(toPath(pts, false));
      }
    }
  }
  return out;
}

// --- Génération ---------------------------------------------------------

console.log('Côtes…');
// Tolérance fine : la carte se laisse maintenant zoomer jusqu'au navire.
const land = polygons('ne_10m_land.json', { eps: 0.12, minArea: 0.4 });
const minor = polygons('ne_10m_minor_islands.json', { eps: 0.1, minArea: 0.06 });
const coast = [...land, ...minor].sort((a, b) => b.area - a.area).map((p) => p.d);

console.log('Bathymétrie…');
// Chaque niveau est une nappe « plus profond que X mètres ». Empilées de la
// plus large à la plus étroite, elles creusent la mer sans une seule image.
const BATHY_LEVELS = [
  [200, 'ne_10m_bathymetry_K_200.json'],
  [1000, 'ne_10m_bathymetry_J_1000.json'],
  [2000, 'ne_10m_bathymetry_I_2000.json'],
  [3000, 'ne_10m_bathymetry_H_3000.json'],
  [4000, 'ne_10m_bathymetry_G_4000.json'],
];
const bathymetry = BATHY_LEVELS.map(([depth, file]) => ({
  depth,
  paths: polygons(file, { eps: 0.5, minArea: 3 }).map((p) => p.d),
})).filter((b) => b.paths.length);

console.log('Fleuves et lacs…');
// Le rang d'échelle écarte les ruisseaux : on garde les fleuves qui structurent
// réellement le relief, pas le réseau hydrographique complet.
const rivers = polylines('ne_10m_rivers_lake_centerlines.json', {
  eps: 0.25,
  minLength: 6,
  keep: (p) => (p.scalerank ?? 99) <= 7,
});
const lakes = polygons('ne_10m_lakes.json', { eps: 0.2, minArea: 0.4 }).map((p) => p.d);

const list = (arr, indent = '  ') =>
  `[\n${indent}${arr.map((d) => JSON.stringify(d)).join(`,\n${indent}`)},\n${indent.slice(2)}]`;

const out = `// Généré depuis Natural Earth 10 m — ne pas éditer à la main.
// Voir scripts/build-map.mjs.
//
// Projection Mercator, fenêtre ${LNG_MIN}..${LNG_MAX}°E / ${LAT_MIN}..${LAT_MAX}°N.

export const MAP_VIEW = {
  lngMin: ${LNG_MIN},
  lngMax: ${LNG_MAX},
  latMin: ${LAT_MIN},
  latMax: ${LAT_MAX},
  width: ${VIEW_W},
  height: ${Math.round(VIEW_H * 100) / 100},
};

export function project(lng, lat) {
  const k = MAP_VIEW.width / (MAP_VIEW.lngMax - MAP_VIEW.lngMin);
  const mercY = (l) => (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
  return {
    x: (lng - MAP_VIEW.lngMin) * k,
    y: (mercY(MAP_VIEW.latMax) - mercY(lat)) * k,
  };
}

export const LAND_PATHS = ${list(coast)};

/** Nappes « plus profond que N mètres », de la plus large à la plus étroite. */
export const BATHYMETRY = [
${bathymetry.map((b) => `  { depth: ${b.depth}, paths: ${list(b.paths, '    ')} },`).join('\n')}
];

export const RIVER_PATHS = ${list(rivers)};

export const LAKE_PATHS = ${list(lakes)};
`;

const dest = process.argv[2] ?? 'mediterranean.js';
fs.writeFileSync(dest, out);

console.log(`\ncôtes        ${coast.length} anneaux`);
for (const b of bathymetry) console.log(`  -${String(b.depth).padStart(4)} m    ${b.paths.length} nappes`);
console.log(`fleuves      ${rivers.length} tronçons`);
console.log(`lacs         ${lakes.length} anneaux`);
console.log(`→ ${dest}  ${(out.length / 1024).toFixed(0)} Ko`);

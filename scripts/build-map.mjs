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

// --- Sutherland–Hodgman contre un rectangle ---
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

function toPath(pts) {
  const r = (n) => Math.round(n * 10) / 10;
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${r(pts[i][0])} ${r(pts[i][1])}`;
  return d + 'Z';
}

function collectRings(geometry) {
  const rings = [];
  const g = geometry;
  if (g.type === 'Polygon') rings.push(...g.coordinates);
  else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) rings.push(...poly);
  return rings;
}

function processFile(file, { eps, minArea }) {
  const fc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const paths = [];
  for (const f of fc.features) {
    for (const ring of collectRings(f.geometry)) {
      // rejet rapide
      let inBox = false;
      for (const [lng, lat] of ring) {
        if (lng >= CLIP.xMin && lng <= CLIP.xMax && lat >= CLIP.yMin && lat <= CLIP.yMax) { inBox = true; break; }
      }
      if (!inBox) continue;

      const clipped = clipRect(ring);
      if (clipped.length < 3) continue;

      const projected = clipped.map(project);
      const simplified = simplifyRing(projected, eps);
      if (simplified.length < 3) continue;
      const area = ringArea(simplified);
      if (area < minArea) continue;
      paths.push({ d: toPath(simplified), area });
    }
  }
  return paths;
}

const land = processFile("ne10m_land.json", { eps: 0.35, minArea: 0.9 });
const minor = processFile("ne10m_minor.json", { eps: 0.25, minArea: 0.12 });

const all = [...land, ...minor].sort((a, b) => b.area - a.area);
const body = all.map((p) => p.d);

const out = `// Généré depuis Natural Earth 10m (land + minor islands).
// Projection Mercator, fenêtre ${LNG_MIN}..${LNG_MAX}°E / ${LAT_MIN}..${LAT_MAX}°N.
// Ne pas éditer à la main — voir scripts/build-map.mjs.

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

export const LAND_PATHS = ${JSON.stringify(body, null, 0).replace(/","/g, '",\n  "').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')};
`;

fs.writeFileSync(process.argv[3] ?? 'mediterranean.js', out);
console.log('rings:', all.length, 'size:', (out.length / 1024).toFixed(0) + 'KB', 'viewBox h:', VIEW_H.toFixed(1));

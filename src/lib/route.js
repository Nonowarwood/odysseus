import { project, MAP_VIEW } from '../data/mediterranean';

const SAMPLES_PER_SEGMENT = 28;
const EARTH_RADIUS_KM = 6371;

// Catmull-Rom : passe exactement par chaque point d'ancrage, avec une courbure
// douce — c'est ce qui donne à la route l'allure d'un sillage et non d'un
// itinéraire routier.
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/**
 * Construit la route complète en unités carte.
 * Retourne la polyligne échantillonnée (donc la longueur calculée ici est
 * exactement celle que le navigateur mesurera sur le <path>), ainsi que
 * l'abscisse curviligne de chaque escale.
 */
export function buildRoute(steps) {
  const anchors = [];
  const stopAnchorIndex = [];

  steps.forEach((step, i) => {
    if (i > 0) {
      for (const w of step.via ?? []) anchors.push(project(w.lng, w.lat));
    }
    stopAnchorIndex.push(anchors.length);
    anchors.push(project(step.coordinates.lng, step.coordinates.lat));
  });

  // Duplication des extrémités pour que la spline démarre et finisse proprement.
  const padded = [anchors[0], ...anchors, anchors[anchors.length - 1]];

  const points = [anchors[0]];
  const anchorSampleIndex = [0];

  for (let i = 1; i < padded.length - 2; i++) {
    for (let s = 1; s <= SAMPLES_PER_SEGMENT; s++) {
      points.push(catmullRom(padded[i - 1], padded[i], padded[i + 1], padded[i + 2], s / SAMPLES_PER_SEGMENT));
    }
    anchorSampleIndex.push(points.length - 1);
  }

  // Abscisse curviligne cumulée le long de la polyligne.
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const totalLength = lengths[lengths.length - 1];

  const stopLengths = stopAnchorIndex.map((ai) => lengths[anchorSampleIndex[ai]]);

  const round = (n) => Math.round(n * 10) / 10;
  const d =
    `M${round(points[0].x)} ${round(points[0].y)}` +
    points.slice(1).map((p) => `L${round(p.x)} ${round(p.y)}`).join('');

  return { d, points, lengths, totalLength, stopLengths };
}

/** Position + cap le long de la route, à une abscisse curviligne donnée. */
export function pointAtLength(route, length) {
  const { points, lengths } = route;
  const target = Math.min(Math.max(length, 0), route.totalLength);

  let lo = 0;
  let hi = lengths.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] <= target) lo = mid;
    else hi = mid;
  }

  const span = lengths[hi] - lengths[lo] || 1;
  const t = (target - lengths[lo]) / span;
  const a = points[lo];
  const b = points[hi];

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
}

/** Rayon d'incertitude converti de kilomètres en unités de la carte projetée. */
export function kmToMapUnits(km, lat) {
  const centre = project(0, lat);
  const offset = project(0, lat + km / 111.32);
  const vertical = Math.abs(centre.y - offset.y);
  return vertical || (km / 111.32) * (MAP_VIEW.width / (MAP_VIEW.lngMax - MAP_VIEW.lngMin));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function polylineKm(path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    total += 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  return Math.round(total);
}

/** Distance d'une traversée, waypoints compris. */
export function legDistanceKm(steps, i) {
  const to = steps[i + 1];
  if (!to) return 0;
  return polylineKm([steps[i].coordinates, ...(to.via ?? []), to.coordinates]);
}

/** Distance réelle du voyage entier, en suivant la route waypoint par waypoint. */
export function totalJourneyDistanceKm(steps) {
  const path = [];
  steps.forEach((step, i) => {
    if (i > 0) for (const w of step.via ?? []) path.push(w);
    path.push(step.coordinates);
  });
  return polylineKm(path);
}

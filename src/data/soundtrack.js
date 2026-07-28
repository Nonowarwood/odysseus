/**
 * Bande-son composée — facultative.
 *
 * Pour ajouter une piste :
 *   1. déposer le fichier dans `public/audio/` (mp3, m4a ou ogg) ;
 *   2. l'associer ici à l'identifiant de l'escale, tel qu'il apparaît dans
 *      `journeySteps.js` (`troy`, `circe`, `helios`, `ithaca`…).
 *
 * Une escale sans piste n'en est pas privée de son : la partition synthétisée
 * reprend la main. Les deux se mélangent d'ailleurs — quand une piste joue,
 * les couches synthétiques s'effacent en arrière-plan sans disparaître, ce qui
 * garde la mer sous la musique.
 *
 * Les entrées `_overture` et `_epilogue` couvrent l'écran d'accueil et le
 * bilan final. Les pistes n'ont pas besoin de boucler : le lecteur les fait se
 * recouvrir en fondu croisé avant la fin (voir `lib/ambience.js`).
 *
 * Les chemins passent par `asset()` : sur GitHub Pages le site n'est pas servi
 * depuis la racine du domaine, et une URL écrite en dur renverrait un 404.
 *
 * Les noms de fichiers restent volontairement en ASCII sans espaces. macOS
 * enregistre les accents sous forme décomposée (NFD) alors qu'une chaîne de
 * code JavaScript les écrit composés (NFC) : les deux octets diffèrent, et le
 * serveur répond 404 sur un fichier pourtant présent. Un nom sans accent ne
 * peut pas tomber dans ce piège, ici comme sur n'importe quel hébergeur.
 */
import { asset } from '../lib/asset';

export const SOUNDTRACK = {
  _overture: asset('audio/ulysse.mp3'),
  troy: asset('audio/siege-de-troie.mp3'),
  underworld: asset('audio/enfer-d-hades.mp3'),
  sirens: asset('audio/chant-des-sirenes.mp3'),
  ithaca: asset('audio/ithaque.mp3'),
  suitors: asset('audio/ithaque-2.mp3'),
  _epilogue: asset('audio/ulysse.mp3'),
};

/** Piste à jouer pour un état donné du récit, ou null. */
export function trackFor(phase, stepId) {
  if (phase === 'hero') return SOUNDTRACK._overture ?? null;
  if (phase === 'epilogue') return SOUNDTRACK._epilogue ?? SOUNDTRACK[stepId] ?? null;
  return SOUNDTRACK[stepId] ?? null;
}

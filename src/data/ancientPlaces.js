/**
 * Les lieux du récit qui ne sont pas des escales.
 *
 * Écrits à la main, et non tirés d'un jeu de données : Natural Earth ne connaît
 * que les villes d'aujourd'hui, et poser « Naples » ou « Athènes » moderne sur
 * cette carte abîmerait l'illusion au lieu de la nourrir.
 *
 * Leur rôle n'est pas d'informer mais de peupler : voir Ithaque entourée des
 * autres royaumes achéens, c'est comprendre sans un mot que tous les autres
 * rois, eux, sont rentrés chez eux.
 *
 * Ils sont dessinés, jamais écrits : une typographie moderne posée sur une
 * carte gravée trahit l'illusion, là où un petit rempart la sert. Le nom
 * n'apparaît qu'au survol.
 *
 *   kind 'royaume' — un palais, un roi nommé dans l'Iliade ou l'Odyssée.
 *                    Dessiné en citadelle : trois tours sur un rempart.
 *   kind 'repere'  — un cap, une contrée, une borne du monde connu.
 *                    Dessiné en cairn : ce n'est pas une ville.
 */
export const ancientPlaces = [
  // --- Les royaumes achéens ---
  { name: 'Mycènes', note: 'Agamemnon', kind: 'royaume', lat: 37.73, lng: 22.756 },
  { name: 'Sparte', note: 'Ménélas', kind: 'royaume', lat: 37.075, lng: 22.43 },
  { name: 'Pylos', note: 'Nestor', kind: 'royaume', lat: 37.028, lng: 21.695 },
  { name: 'Argos', note: 'Diomède', kind: 'royaume', lat: 37.63, lng: 22.72 },
  { name: 'Phthie', note: 'Achille', kind: 'royaume', lat: 39.15, lng: 22.38 },
  { name: 'Cnossos', note: 'Idoménée', kind: 'royaume', lat: 35.298, lng: 25.163 },
  { name: 'Salamine', note: 'Ajax', kind: 'royaume', lat: 37.96, lng: 23.5 },
  { name: 'Athènes', note: 'Ménesthée', kind: 'royaume', lat: 37.972, lng: 23.726 },

  // --- Le royaume d'Ulysse, au-delà d'Ithaque ---
  { name: 'Samé', note: "l'île voisine", kind: 'royaume', lat: 38.25, lng: 20.65 },
  { name: 'Zacynthe', note: "l'île boisée", kind: 'royaume', lat: 37.79, lng: 20.9 },

  // --- Les bornes du récit ---
  { name: 'Aulis', note: 'le rassemblement de la flotte', kind: 'repere', lat: 38.4, lng: 23.6 },
  { name: 'Ténédos', note: 'la première escale au départ', kind: 'repere', lat: 39.83, lng: 26.05 },
  { name: 'Cap Malée', note: "où la tempête l'emporte", kind: 'repere', lat: 36.43, lng: 23.2 },
  { name: 'Cythère', note: 'la dernière terre connue', kind: 'repere', lat: 36.23, lng: 22.98 },
  { name: 'Délos', note: 'le palmier dont il se souvient', kind: 'repere', lat: 37.393, lng: 25.268 },
  { name: 'Syriè', note: "la patrie d'Eumée", kind: 'repere', lat: 37.44, lng: 24.9 },
  { name: 'Dodone', note: "l'oracle du chêne", kind: 'repere', lat: 39.546, lng: 20.788 },
  { name: 'Thesprotie', note: 'le mensonge du mendiant', kind: 'repere', lat: 39.4, lng: 20.5 },
  { name: "Colonnes d'Héraclès", note: 'la fin du monde connu', kind: 'repere', lat: 36.13, lng: -5.35 },
  { name: 'Sidon', note: 'les Phéniciens', kind: 'repere', lat: 33.563, lng: 35.375 },
  { name: 'Égypte', note: 'où Ménélas fut emporté', kind: 'repere', lat: 31.4, lng: 30.4 },
];

# ODYSSEUS — Architecture technique

## 1. Parti pris

Le récit se déroule dans un bassin de 2 000 km de côté. Un globe 3D y était
contre-productif : il courbe et éloigne précisément la zone qu'on veut lire, et
son coût (Three.js, textures, éclairage) achetait un effet qui desservait le
propos. La carte est donc **une carte marine** — projection Mercator, côtes
réelles, ombrage de rivage à la manière des portulans — dessinée en **canvas 2D**.

Conséquence : plus aucune dépendance 3D, un bundle divisé par trois, des traits
nets à tous les niveaux de zoom, et une direction artistique qu'on contrôle
au pixel près.

## 2. Stack

| Rôle | Choix |
| :--- | :--- |
| Framework | React 18 + Vite |
| Typographie | Inter (structure) + Instrument Serif (titres) |
| Rendu carte | Canvas 2D (`Path2D`), boucle `requestAnimationFrame` maison |
| Scroll fluide | `@studio-freight/lenis` |
| Transitions d'interface | `framer-motion` |
| Styles | Tailwind CSS |
| État | Zustand + un objet mutable hors React pour la progression continue |
| Son | WebAudio synthétisé, adaptatif — aucun fichier audio |
| Illustrations | Gravures de Flaxman, converties en masques alpha au build |

## 3. Itinéraire

Le tracé suit la carte classique de l'Odyssée (tradition Victor Bérard) :
quinze escales, de Troie au palais d'Ithaque, avec les épisodes souvent
oubliés — Kikones, Lestrygons, Île du Soleil, Phéaciens — et Ogygie replacée au
bord de l'Océan, aux colonnes d'Héraclès, et non à Malte. Le voyage traverse
donc toute la Méditerranée, de l'Égée à Gibraltar : 8 700 km.

Les deux derniers chapitres se tiennent au même endroit — l'arrivée sur le
rivage, puis le massacre des prétendants au palais. Une escale peut donc
imposer son propre `zoom`, et le dézoom de traversée s'annule quand deux
escales sont voisines : on ne prend pas de recul pour quatre kilomètres.

## 4. Géographie

`src/data/mediterranean.js` est **généré**, pas écrit à la main.

```bash
# depuis un dossier contenant ne_10m_land.json et ne_10m_minor_islands.json
# (Natural Earth 10 m, via github.com/martynafford/natural-earth-geojson)
node scripts/build-map.mjs
```

Le script découpe quatre jeux de données sur la fenêtre −8→39 °E / 28,5→48,5 °N
(Sutherland–Hodgman pour les polygones, découpe en tronçons pour les lignes),
projette en Mercator et simplifie (Douglas–Peucker, adapté aux contours fermés) :

| couche | contenu | rôle |
| :--- | :--- | :--- |
| côtes | 263 anneaux | le trait de rivage, assez fin pour supporter le zoom |
| bathymétrie | 5 nappes, −200 à −4 000 m | le relief de la mer |
| fleuves | 104 tronçons | la structure des terres |
| lacs | 36 anneaux | — |

Les nappes de bathymétrie sont emboîtées : chacune couvre ce qui est plus
profond qu'un palier. Empilées en fondu sombre, elles creusent le bassin — le
plateau continental reste clair, les fosses ioniennes s'enfoncent — et leur
liseré tient lieu de courbe de niveau. Aucune image raster n'est nécessaire.

Fleuves et lacs n'apparaissent qu'au-delà d'un certain zoom : en vue d'ensemble
ils ne seraient qu'un fourmillement de traits.

Total : 365 ko de JS, servis dans le bundle, sans requête supplémentaire.

La même projection est réexportée sous `project(lng, lat)` : la carte et les
coordonnées du récit vivent forcément dans le même espace.

## 5. Illustrations

Douze chapitres portent une gravure de **John Flaxman**, gravée par Achille
Réveil (v. 1835) — une seule main, une seule édition, domaine public, source
unique : Wikimedia Commons.

```bash
node scripts/build-plates.mjs
```

Le script télécharge la planche, la recadre, puis **inverse la luminance en
canal alpha** : le trait devient opaque, le papier disparaît. Le PNG obtenu ne
sert jamais d'image, seulement de masque CSS — on peint un dégradé d'or au
travers, et un second masque radial fait fondre les bords dans la mer.

Le recadrage segmente la page en bandes horizontales séparées par du papier nu
et garde la plus haute. Chercher le filet du cuivre ne marchait pas : sur les
planches à ciel hachuré, le cadre ne ressort pas du fond.

Trois épisodes (Kikones, Lotophages, Éole) n'ont pas de planche dans cette
série et n'en reçoivent aucune : mieux vaut un chapitre sans image qu'une image
qui ment. `PlateLayer` gère l'absence sans rien afficher.

Le massacre des prétendants n'a pas non plus de planche : celle qui l'accompagne
montre les prétendants découvrant la ruse de Pénélope, et sa légende gravée le
dit — même épisode, autre scène.

## 6. Atmosphères

Chaque escale déclare un vecteur d'intensités dans `journeySteps.js` :

```js
weather: { rain: 0.85, lightning: 0.9, wind: 0.8, wreck: 0.6 }
```

`lib/weather.js` interpole ce vecteur d'une escale à la suivante et dessine, en
espace écran : pluie inclinée par le vent, traînées de vent, éclairs à double
battement, braises ascendantes, voiles de brume, poussières (teintées par
chapitre — violet chez Circé).

Rien ne s'allume ni ne s'éteint d'un coup : la colère de Poséidon monte pendant
la traversée et retombe à l'escale suivante.

Le même vecteur pilote la partition (`lib/ambience.js`), si bien que l'orage
s'entend avant de se voir. Quatre couches synthétisées : mer, bourdon grave,
souffle de tempête avec coups sourds, nappe scintillante.

### Bande-son composée

`data/soundtrack.js` associe un fichier de `public/audio/` à chaque escale.
Rien n'est obligatoire : une escale sans piste garde la partition synthétisée.

Les pistes passent par un `MediaElementSource` branché sur le même bus que le
synthétique — un seul volume, un seul interrupteur. Quand une piste démarre,
le bus synthétique descend à 0,34 au lieu de se couper : la mer reste sous la
musique. Le fondu d'un chapitre à l'autre dure 3 s.

**Les pistes n'ont pas besoin de boucler.** Chaque morceau tourne sur deux
lecteurs : six secondes avant la fin du premier, le second repart de zéro et
l'on passe de l'un à l'autre en fondu croisé. La couture est masquée au lieu
d'être entendue, et une composition à début et fin marqués tourne
indéfiniment. Une piste plus courte que deux fois le fondu s'enchaîne sans
recouvrement, pour ne pas se relayer à chaque tour d'horloge.

Nommer les fichiers **en ASCII, sans espaces ni accents**. macOS enregistre les
accents sous forme décomposée (NFD) alors qu'une chaîne de code les écrit
composés (NFC) : les octets diffèrent et le serveur répond 404 sur un fichier
pourtant bien présent.

## 7. Boucle de rendu

Un seul `requestAnimationFrame`, dans `components/map/Chart.jsx`, qui à chaque
frame :

1. lit `journeyState.progress` (écrit par le scroll, hors de React) ;
2. en déduit la position sur la route et la cible de caméra ;
3. amortit la caméra (`damp`, indépendant du framerate) ;
4. redessine mer, graticule, rose des vents, côtes, route, escales, navire ;
5. repositionne les étiquettes HTML par écriture directe de `style.transform`.

React ne re-rend que lorsque **l'escale décrite change** — jamais à la frame.

Deux optimisations portent la quasi-totalité du budget : le rejet des anneaux
hors cadre par boîte englobante, et l'abandon de ceux qui mesureraient moins
d'1,5 px à l'écran. Mesuré à 60 fps constants en vue d'ensemble comme en zoom.

## 8. Navigation

`src/lib/scroll.js` traduit une position de scroll en état narratif :

```
1 vh                  ouverture (verrouillée jusqu'au clic)
0,7 vh + traversée    un bloc par escale
2 vh                  épilogue
```

**Les blocs n'ont pas la même hauteur.** La part « à quai » est fixe — le temps
de lire est le même partout — mais la traversée s'étire avec la distance
réellement parcourue, en racine carrée pour que les sauts courts ne
disparaissent pas face aux 2 495 km de la remontée vers Corcyre. La durée des
déplacements programmés en découle : 3 s pour les 4 km d'Ithaque au palais,
10 s pour la traversée du Couchant.

Toute la géométrie vit dans `buildLayout(steps)`, qui produit des offsets
cumulés ; plus rien ne peut se calculer par simple multiplication.

Trois garde-fous rendent le défilement prévisible :

1. **Ouverture bloquante** — `lenis.stop()` tant que `hasStarted` est faux :
   on entre dans le récit par un geste, pas par accident.
2. **Aimantation** — 150 ms après l'arrêt du défilement, la page rejoint
   l'escale la plus proche (`nearestAnchorVh`). Il devient impossible de
   s'immobiliser au milieu d'une traversée, là où il n'y a rien à lire — c'était
   la cause du « rien ne s'affiche » sur les escales autres que Troie.
   La cible est bornée à `scrollHeight - vh`, sinon l'aimantation vise une
   position hors document et se relance en boucle.
3. **Commandes explicites** — barre précédent/suivant, rail chronologique
   cliquable, flèches du clavier, clic sur les étiquettes de la carte. Tout
   passe par `scrollToVh`, qui suspend l'aimantation le temps du déplacement.

Le panneau de chapitre reste monté en permanence et ne fait que s'estomper :
le démonter au fil du scroll rendait son retour aléatoire.

## 9. Arborescence

```text
src/
├── components/
│   ├── map/Chart.jsx          # carte, caméra, route, navire
│   └── ui/                    # Overture, ChapterPanel, Chrome, Timeline…
├── data/
│   ├── journeySteps.js        # récit, coordonnées, waypoints, teintes, météo
│   └── mediterranean.js       # GÉNÉRÉ — côtes + projection
├── hooks/useJourneyScroll.js
├── lib/                       # camera, route, scroll, weather, ambience…
└── store/useOdysseusStore.js
```

## 10. Points d'attention

- `journeyState` est volontairement hors de Zustand : le passer dans le store
  déclencherait un rendu React par frame et ferait tomber l'animation.
- Les tracés `via` de `journeySteps.js` ne sont pas décoratifs : ils empêchent
  la spline de couper à travers les terres.
- Le son est actif d'origine, mais le contexte audio n'est ouvert qu'une fois
  l'ouverture franchie : le clic sur « Commencer le voyage » est le seul moment
  où le navigateur autorise la lecture. L'ouvrir avant le laisserait suspendu
  et muet. L'interrupteur reste disponible à tout moment.
- `prefers-reduced-motion` désactive le scroll inertiel et les transitions.
- Aucune musique existante n'est utilisée ni imitée : la bande-son par défaut
  est générée à l'exécution. Toute piste ajoutée dans `public/audio/` engage
  celui qui la dépose — vérifier les droits avant mise en ligne.
- Un dégradé de lisibilité doit couvrir tout l'écran et s'éteindre dans ses
  propres arrêts de couleur. Le poser sur une boîte plus étroite laisse une
  arête verticale nette au bord de la boîte, très visible sur un aplat sombre.
- Framer Motion écrit un `transform` en style inline : tout centrage posé en
  classe utilitaire (`-translate-x-1/2`) doit vivre sur un conteneur parent,
  sinon il est écrasé silencieusement.

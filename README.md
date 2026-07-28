# ODYSSEUS — Le Retour

Le périple d'Ulysse retracé sur une carte marine de la Méditerranée, escale par
escale, année par année.

**→ [nonowarwood.github.io/odysseus](https://nonowarwood.github.io/odysseus/)**

---

Quinze escales, de la chute de Troie au palais d'Ithaque, suivant l'itinéraire
classique de la tradition Victor Bérard. Le récit se déroule au défilement : la
carte navigue avec le navire, chaque chapitre a sa couleur de mer, son temps
qu'il fait et sa gravure.

- **Carte** — côtes réelles (Natural Earth 10 m), projection Mercator, dessinée
  en canvas 2D à la manière d'un portulan.
- **Deux lectures** — la géographie d'Homère, ou les localisations proposées
  par les historiens, avec leurs zones d'incertitude.
- **Gravures** — John Flaxman, gravées par Achille Réveil (v. 1835), domaine
  public, converties en masques et peintes à l'or.
- **Son** — compositions originales, doublées d'une partition synthétisée en
  WebAudio qui prend le relais là où il n'y a pas de piste.

## Développement

```bash
npm install
npm run dev
```

## Mise en ligne

Chaque poussée sur `main` déclenche le workflow `.github/workflows/deploy.yml`,
qui construit le site et le publie sur GitHub Pages.

Le site étant servi depuis un sous-chemin, la construction reçoit
`VITE_BASE=/odysseus/`. Tout chemin d'asset construit à l'exécution doit passer
par `asset()` (`src/lib/asset.js`), sans quoi il renverra un 404 en ligne.

## Ressources générées

Deux jeux de données sont produits hors ligne et versionnés :

```bash
node scripts/build-map.mjs      # côtes → src/data/mediterranean.js
node scripts/build-plates.mjs   # gravures → public/plates/
```

L'architecture est détaillée dans [TECHNICAL.md](TECHNICAL.md), le propos dans
[VISION.md](VISION.md).

## Crédits

Gravures : John Flaxman, gravées par Achille Réveil — domaine public.
Côtes : [Natural Earth](https://www.naturalearthdata.com/), domaine public.
Musique : compositions originales.

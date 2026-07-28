# ODYSSEUS: The Journey Home — Vision Document

> "The world is real. The legend is revealed."

---

## 1. Concept Global
**ODYSSEUS** est une expérience web interactive 3D retraçant le périple mythologique d'Ulysse après la chute de Troie.
Le site combine cartographie 3D réaliste, narration cinématographique, esthétique grecque antique et timeline interactive pour faire ressentir la durée et le drame d'un voyage de 10 ans.

Ce n'est pas un résumé de l'Odyssée : c'est une expérience immersive qui donne l'impression d'accompagner Ulysse, pas de lire une fiche Wikipédia.

---

## 2. Philosophie du projet

Le monde présenté repose sur une Terre réelle : mers, continents et distances sont authentiques. Une couche mythologique vient ensuite **révéler** le récit d'Homère par-dessus ce monde réel :
* routes dorées
* symboles antiques
* cartes anciennes
* annotations grecques
* illustrations mythologiques

Le site doit donner l'impression qu'un ancien manuscrit prend vie devant l'utilisateur.

---

## 3. Identité & Direction Artistique

### Identité
* **Nom :** ODYSSEUS — le nom grec d'Ulysse. Il représente le héros, le roi, l'homme derrière le mythe.
* **Sous-titre :** The Journey Home — le véritable objectif du récit n'est pas de conquérir ni de devenir célèbre, mais de **rentrer chez soi**.

### Règle principale
Le site ne doit **jamais** ressembler à :
* ❌ un jeu vidéo fantasy
* ❌ une carte Google Maps
* ❌ une encyclopédie classique

Il doit ressembler à :
* ✅ une exposition interactive du futur
* ✅ un film dont l'utilisateur contrôle la caméra
* ✅ un manuscrit antique devenu vivant

### Palette de Couleurs
* **Void Black :** `#020409` (Fond & Espace)
* **Ocean Blue :** `#071A2B` (Mers & Océans)
* **Ancient Gold :** `#C9A227` (Lignes de trajet, accents, étapes)
* **Ivory :** `#F5F1E8` (Typographie principale)
* **Papyrus :** `#D8C8A5` (Cartes & UI secondaire)

### Inspiration
Mélange de cinéma spatial moderne, de musées antiques, de manuscrits grecs et de cartographie ancienne.

---

## 4. Expérience Utilisateur (UX)

1. **Intro Cinématographique :**
   * Écran noir, sons légers de mer et de vent.
   * Citation : *"After ten years of war, a king begins his longest journey."*
   * Pause, puis apparition du titre **ODYSSEUS — The Journey Home**.
   * Bouton d'entrée : **"Begin Journey"**.

2. **Navigation Hybride à 3 niveaux (Réel → Historique → Mythologique) :**
   * **Niveau 1 — Le monde réel (Globe Spatial) :** vue spatiale d'ensemble de la Terre, globe réaliste, atmosphère, nuages, lumière solaire dynamique, étoiles. Le globe tourne lentement lorsque l'utilisateur n'interagit pas.
   * **Niveau 2 — Le monde historique (Méditerranée) :** zoom fluide vers le bassin méditerranéen ; apparition progressive des frontières antiques, noms grecs, routes marines.
   * **Niveau 3 — Le monde mythologique (Étapes) :** lorsqu'une étape est sélectionnée, la réalité laisse place au mythe — textures parchemin, gravures anciennes, symboles grecs, citations d'Homère, caméra cinématique avec effets visuels (particules dorées, météo dynamique : brouillard, éclairs, coucher de soleil selon le chapitre).

3. **Interactions :**
   * **Scroll-driven storytelling :** le défilement fait avancer le bateau le long de la route dorée, dessine la ligne et fait défiler le temps — l'utilisateur raconte l'histoire par le mouvement, pas par le clic.
   * **Navigation par timeline / clic sur étape :** la caméra voyage automatiquement, la route se dessine jusqu'à l'endroit choisi, les textes changent.
   * **Mode Cinéma ("Commencer le voyage") :** lecture automatique sans interaction nécessaire — musique, caméra qui suit le trajet, textes qui apparaissent au bon rythme, villes qui s'illuminent, bateau qui avance seul. Le site devient un documentaire.

---

## 5. Le trajet d'Ulysse

Le voyage est représenté par une **route dorée**, ancienne, magique et précieuse :
* lumière animée qui progresse (pas une ligne fixe dessinée d'un coup)
* particules le long du tracé
* effet de profondeur
* un **bateau miniature** qui suit la lumière en tête de progression
* la route ne se révèle qu'au fur et à mesure de l'avancée dans le récit

---

## 6. Chapitres & Trajet

| Chapitre | Étape | Thème | Durée relative |
| :--- | :--- | :--- | :--- |
| **Prologue** | Troie | La chute et le départ | Année 0 |
| **Chapitre I** | Les Lotophages | La tentation de l'oubli | + Quelques jours |
| **Chapitre II** | Polyphème (Cyclope) | L'intelligence contre la force brute | + Quelques semaines |
| **Chapitre III** | Éole | Les vents capturés et la confiance perdue | + Quelques jours |
| **Chapitre IV** | Circé | La métamorphose et l'enchantement | + 1 An |
| **Chapitre V** | Le Royaume des Morts | Faire face au passé et aux prophéties | + Quelques semaines |
| **Chapitre VI** | Les Sirènes | Le chant de la connaissance suprême | + Quelques jours |
| **Chapitre VII** | Scylla & Charybde | Choisir entre deux maux | + Quelques jours |
| **Chapitre VIII** | Calypso (Ogygie) | L'immortalité refusée pour l'humanité | + 7 Ans |
| **Épilogue** | Ithaque | Le retour du Roi | **Année 10** |

---

## 7. Timeline

Élément central de l'expérience — elle montre à la fois la progression géographique et la progression temporelle, pour que l'utilisateur ressente vraiment la **durée** du voyage (10 ans, pas 10 clics) :

```
YEAR 0
TROY
  |
LOTUS EATERS
  |
POLYPHEMUS
  |
CIRCE           +1 YEAR
  |
CALYPSO         +7 YEARS
  |
ITHACA          YEAR 10
```

---

## 8. Profondeur du contenu par étape

Chaque étape propose plusieurs niveaux de lecture, du plus accessible au plus savant (comme une encyclopédie, mais agréable à parcourir) :

1. **Résumé** — ~20 secondes de lecture, pour l'utilisateur pressé.
2. **Récit complet** — le déroulé narratif de l'épisode.
3. **Texte original d'Homère** — citation(s) tirée(s) de l'œuvre.

Chaque étape inclut aussi : illustration, personnages impliqués, durée passée à cet endroit, conséquences sur la suite du voyage.

---

## 9. Carte historiquement documentée

Un interrupteur permet de choisir entre deux lectures de la géographie :

```
○ Version d'Homère
○ Localisations proposées par les historiens
```

Plusieurs étapes de l'Odyssée n'ont pas de localisation certaine : pour les lieux débattus, une légère **zone d'incertitude** est affichée sur la carte plutôt qu'un point unique, ce qui ajoute une dimension pédagogique honnête.

---

## 10. Conclusion du voyage

Le mode Cinéma se termine sur une vue complète de la Méditerranée avec tout le trajet illuminé, accompagnée d'un bilan :

* Durée du voyage : ≈ 10 ans
* Étapes principales : 15 à 20
* Distance estimée : plusieurs milliers de kilomètres
* Point de départ : Troie
* Destination : Ithaque

/**
 * Résout un fichier de `public/` en tenant compte du préfixe de déploiement.
 *
 * Sur GitHub Pages, le site est servi depuis `/<dépôt>/` et non depuis la
 * racine : une URL écrite en dur comme `/audio/ulysse.mp3` renverrait alors un
 * 404. Vite expose le préfixe dans `import.meta.env.BASE_URL` — il faut donc
 * passer par ici pour tout chemin construit à l'exécution. Les imports
 * statiques, eux, sont réécrits par Vite tout seul.
 */
export function asset(path) {
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
}

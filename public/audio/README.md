# Bande-son

Déposer ici les fichiers audio, puis les associer à une escale dans
`src/data/soundtrack.js`.

**Nommer les fichiers en ASCII, sans espaces ni accents** (`chant-des-sirenes.mp3`).
macOS enregistre les accents sous forme décomposée alors que le code les écrit
composés : les octets diffèrent et le serveur répond 404 sur un fichier
pourtant bien présent.

Les pistes n'ont pas besoin de boucler : le lecteur en fait tourner deux
exemplaires qui se relaient en fondu croisé de 6 secondes avant la fin du
morceau. Une escale sans piste n'est pas muette — la partition synthétisée
reprend la main.

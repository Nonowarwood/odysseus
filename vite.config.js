import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sur GitHub Pages, le site est servi depuis `https://<compte>.github.io/<dépôt>/`.
// Le workflow de déploiement renseigne VITE_BASE avec ce préfixe ; en local,
// et pour un domaine personnalisé, la racine suffit.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})

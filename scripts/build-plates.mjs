/**
 * Prépare les gravures de John Flaxman (édition Réveil, domaine public)
 * pour un affichage sur fond sombre.
 *
 *   1. téléchargement depuis Wikimedia Commons
 *   2. recadrage sur le filet du cuivre — la légende gravée sous la planche
 *      est retirée, elle est illisible à l'écran et se lit comme du bruit
 *   3. inversion en canal alpha : le trait devient opaque, le papier
 *      disparaît. On peut alors teinter la gravure en or par CSS.
 *   4. réduction et écriture dans public/plates/
 *
 * Usage : node scripts/build-plates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const OUT_DIR = 'public/plates';
const SOURCE_WIDTH = 1400; // ce qu'on demande à Commons
const TARGET_WIDTH = 640; // ce qu'on sert au navigateur

// id de l'étape → fichier Commons
const PLATES = {
  troy: 'OdysseyDemodokos.png',
  polyphemus: 'OdysseyPolyphemos.png',
  laestrygonians: 'OdysseyAntiphates.png',
  circe: 'OdysseyCirce.png',
  underworld: 'OdysseyUnderworld.png',
  sirens: 'OdysseySirens.png',
  'scylla-charybdis': 'OdysseyScylla.png',
  helios: 'OdysseyApollo.png',
  calypso: 'OdysseyHermes.png',
  phaeacians: 'OdysseyNausikaa.png',
  ithaca: 'OdysseyIthaka.png',
  suitors: 'OdysseySuitors.png',
};

const url = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${SOURCE_WIDTH}`;

async function download(file) {
  const res = await fetch(url(file), {
    headers: { 'User-Agent': 'ODYSSEUS-site/1.0 (projet éducatif; contact via dépôt)' },
  });
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return PNG.sync.read(Buffer.from(await res.arrayBuffer()));
}

const luma = (png, x, y) => {
  const i = (png.width * y + x) << 2;
  return 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
};

/**
 * Une page de l'édition porte trois blocs d'encre séparés par du papier nu :
 * le folio en haut, la planche, puis la légende gravée. On découpe donc la
 * page en bandes horizontales séparées par des rangées vierges et on garde
 * la bande la plus chargée — c'est la gravure, jamais le texte.
 *
 * Chercher directement le filet du cuivre ne marchait pas : sur les planches
 * à ciel hachuré (Sirènes, Apollon, Démodocos), le trait du cadre ne ressort
 * pas du fond et la détection s'effondrait.
 */
function inkProfileRows(png, threshold) {
  const rows = new Array(png.height).fill(0);
  for (let y = 0; y < png.height; y++) {
    let n = 0;
    for (let x = 0; x < png.width; x++) if (luma(png, x, y) < threshold) n++;
    rows[y] = n;
  }
  return rows;
}

function findPlateBox(png) {
  const INK = 190;
  const rows = inkProfileRows(png, INK);

  const blank = png.width * 0.004; // une rangée « vide » garde un peu de grain
  // Écart volontairement court : c'est ce qui détache la légende gravée et le
  // folio, qui ne sont séparés de la planche que par quelques millimètres.
  const minGap = Math.max(3, Math.round(png.height * 0.005));

  const bands = [];
  let start = null;
  let gap = 0;
  for (let y = 0; y <= png.height; y++) {
    const inked = y < png.height && rows[y] > blank;
    if (inked) {
      if (start === null) start = y;
      gap = 0;
    } else if (start !== null) {
      gap++;
      if (gap >= minGap || y === png.height) {
        const end = y - gap;
        bands.push({ start, end, height: end - start });
        start = null;
        gap = 0;
      }
    }
  }

  // On garde la bande la plus haute : la gravure fait toujours plusieurs
  // centimètres, la légende et le folio une seule ligne de texte.
  const band = bands.sort((a, b) => b.height - a.height)[0] ?? {
    start: 0,
    end: png.height - 1,
  };

  // Colonnes : mesurées sur la seule bande retenue.
  let left = png.width;
  let right = 0;
  for (let y = band.start; y <= band.end; y++) {
    for (let x = 0; x < png.width; x++) {
      if (luma(png, x, y) < INK) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (right <= left) {
    left = 0;
    right = png.width - 1;
  }

  const pad = 6; // on mange le filet du cuivre lui-même
  return {
    x: left + pad,
    y: band.start + pad,
    w: Math.max(right - left - pad * 2, 10),
    h: Math.max(band.end - band.start - pad * 2, 10),
  };
}

/** Recadrage + passage en alpha + réduction, en une seule passe de boîte. */
function toGoldMask(png, box, targetWidth) {
  const scale = Math.min(targetWidth / box.w, 1);
  const outW = Math.max(Math.round(box.w * scale), 1);
  const outH = Math.max(Math.round(box.h * scale), 1);
  const out = new PNG({ width: outW, height: outH });

  const sx = box.w / outW;
  const sy = box.h / outH;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      // Moyenne sur le bloc source correspondant : sans cela le trait fin
      // de la gravure se met à scintiller une fois réduit.
      const x0 = box.x + Math.floor(x * sx);
      const x1 = Math.min(box.x + Math.ceil((x + 1) * sx), box.x + box.w);
      const y0 = box.y + Math.floor(y * sy);
      const y1 = Math.min(box.y + Math.ceil((y + 1) * sy), box.y + box.h);

      let sum = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          sum += luma(png, xx, yy);
          n++;
        }
      }
      const gray = n ? sum / n : 255;

      // Le papier n'est jamais parfaitement blanc : on écrase le voile de
      // fond avant de convertir, sinon toute la planche reste laiteuse.
      const ink = Math.max(0, 235 - gray) / 235;
      const alpha = Math.round(Math.min(1, ink * 1.5) * 255);

      const i = (outW * y + x) << 2;
      out.data[i] = 255;
      out.data[i + 1] = 255;
      out.data[i + 2] = 255;
      out.data[i + 3] = alpha;
    }
  }
  return out;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [id, file] of Object.entries(PLATES)) {
  const png = await download(file);
  const box = findPlateBox(png);
  const mask = toGoldMask(png, box, TARGET_WIDTH);
  const dest = path.join(OUT_DIR, `${id}.png`);
  fs.writeFileSync(dest, PNG.sync.write(mask, { colorType: 6 }));
  const kb = (fs.statSync(dest).size / 1024).toFixed(0);
  console.log(
    `${id.padEnd(18)} ${file.padEnd(24)} ${png.width}x${png.height} → ${mask.width}x${mask.height}  ${kb} ko`
  );
}

console.log(`\n${Object.keys(PLATES).length} planches écrites dans ${OUT_DIR}/`);

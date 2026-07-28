/**
 * Effets atmosphériques dessinés en espace écran, par-dessus la carte.
 *
 * Chaque chapitre déclare un vecteur d'intensités (pluie, vent, éclairs,
 * braises, brume, poussières) que l'on interpole d'une escale à la
 * suivante. Aucun effet ne s'allume ni ne s'éteint brutalement : la colère de
 * Poséidon monte pendant la traversée et retombe à l'escale suivante.
 */

const KEYS = ['rain', 'wind', 'lightning', 'embers', 'mist', 'motes'];

export const emptyWeather = () => Object.fromEntries(KEYS.map((k) => [k, 0]));

export function blendWeather(a = {}, b = {}, t) {
  const out = {};
  for (const k of KEYS) out[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t;
  return out;
}

const rand = (a, b) => a + Math.random() * (b - a);

export function createWeather() {
  const rain = Array.from({ length: 260 }, () => ({
    x: Math.random(),
    y: Math.random(),
    len: rand(0.012, 0.045),
    speed: rand(1.1, 2.0),
    alpha: rand(0.25, 0.7),
  }));

  const wind = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    len: rand(0.05, 0.22),
    speed: rand(0.35, 0.95),
    alpha: rand(0.06, 0.22),
  }));

  const embers = Array.from({ length: 110 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: rand(-0.02, 0.06),
    vy: rand(-0.09, -0.03),
    size: rand(0.5, 1.7),
    phase: Math.random() * Math.PI * 2,
    alpha: rand(0.22, 0.62),
  }));

  const mist = Array.from({ length: 7 }, () => ({
    x: Math.random(),
    y: rand(0.25, 0.85),
    r: rand(0.22, 0.5),
    vx: rand(-0.012, 0.012),
    alpha: rand(0.05, 0.13),
  }));

  const motes = Array.from({ length: 150 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: rand(-0.015, 0.015),
    vy: rand(-0.02, -0.004),
    size: rand(0.5, 1.9),
    phase: Math.random() * Math.PI * 2,
    twinkle: rand(0.6, 2.2),
  }));

  // L'éclair a sa propre horloge : il frappe, puis se tait longtemps.
  const bolt = { next: 2, flash: 0, path: null, life: 0 };

  const wrap = (p) => {
    if (p.x < -0.15) p.x += 1.3;
    if (p.x > 1.15) p.x -= 1.3;
    if (p.y < -0.15) p.y += 1.3;
    if (p.y > 1.15) p.y -= 1.3;
  };

  function makeBolt(w, h) {
    const x = rand(0.15, 0.85) * w;
    const pts = [{ x, y: -20 }];
    let cx = x;
    let cy = -20;
    const target = rand(0.45, 0.8) * h;
    while (cy < target) {
      cy += rand(20, 60);
      cx += rand(-40, 40);
      pts.push({ x: cx, y: cy });
    }
    return pts;
  }

  /**
   * @param intensity vecteur d'intensités déjà interpolé
   * @param tint      couleur des poussières [r,g,b] — l'or par défaut
   */
  function draw(ctx, w, h, dt, intensity, tint = [233, 198, 92]) {
    const i = intensity;
    const gust = i.wind ?? 0;

    // --- Brume : de larges voiles doux, dessinés en premier ---------------
    if (i.mist > 0.01) {
      for (const m of mist) {
        m.x += m.vx * dt;
        if (m.x < -0.5) m.x += 2;
        if (m.x > 1.5) m.x -= 2;
        const cx = m.x * w;
        const cy = m.y * h;
        const r = m.r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const a = m.alpha * i.mist;
        g.addColorStop(0, `rgba(150,175,200,${a})`);
        g.addColorStop(1, 'rgba(150,175,200,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    }

    // --- Vent : longues traînées presque horizontales ----------------------
    if (i.wind > 0.01) {
      ctx.lineCap = 'round';
      for (const p of wind) {
        p.x += p.speed * gust * dt * 0.9;
        if (p.x > 1.2) {
          p.x = -0.25;
          p.y = Math.random();
        }
        const len = p.len * w;
        ctx.strokeStyle = `rgba(214,226,238,${p.alpha * i.wind})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x * w, p.y * h);
        ctx.lineTo(p.x * w - len, p.y * h + len * 0.12);
        ctx.stroke();
      }
    }

    // --- Pluie -------------------------------------------------------------
    if (i.rain > 0.01) {
      const slant = 0.22 + gust * 0.75;
      ctx.lineWidth = 1.1;
      for (const p of rain) {
        p.y += p.speed * dt * 0.85;
        p.x += p.speed * slant * dt * 0.85;
        if (p.y > 1.1) {
          p.y = -0.1;
          p.x = Math.random() * 1.3 - 0.15;
        }
        if (p.x > 1.15) p.x -= 1.3;
        const len = p.len * h;
        ctx.strokeStyle = `rgba(188,214,236,${p.alpha * i.rain})`;
        ctx.beginPath();
        ctx.moveTo(p.x * w, p.y * h);
        ctx.lineTo(p.x * w - len * slant, p.y * h - len);
        ctx.stroke();
      }
    }

    // --- Braises : elles montent, elles vacillent --------------------------
    if (i.embers > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of embers) {
        p.x += (p.vx + gust * 0.25) * dt;
        p.y += p.vy * dt;
        p.phase += dt * 3;
        if (p.y < -0.1) {
          p.y = 1.08;
          p.x = Math.random();
        }
        wrap(p);
        const flicker = 0.55 + 0.45 * Math.sin(p.phase);
        const a = p.alpha * i.embers * flicker;
        const px = p.x * w;
        const py = p.y * h;
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4.5);
        g.addColorStop(0, `rgba(255,186,88,${a})`);
        g.addColorStop(0.4, `rgba(226,108,40,${a * 0.5})`);
        g.addColorStop(1, 'rgba(226,108,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // --- Poussières : l'enchantement, le lotus, l'aube ---------------------
    if (i.motes > 0.01) {
      const [r, g, b] = tint;
      for (const p of motes) {
        p.x += (p.vx + gust * 0.08) * dt;
        p.y += p.vy * dt;
        p.phase += dt * p.twinkle;
        wrap(p);
        const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.phase))) * i.motes * 0.75;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Éclairs -----------------------------------------------------------
    if (i.lightning > 0.01) {
      bolt.next -= dt * (0.35 + i.lightning);
      if (bolt.next <= 0) {
        bolt.next = rand(2.5, 7) / Math.max(i.lightning, 0.2);
        bolt.flash = 1;
        bolt.life = 1;
        bolt.path = makeBolt(w, h);
      }
      if (bolt.life > 0) {
        bolt.life = Math.max(0, bolt.life - dt * 3.2);
        // Double battement : la foudre ne s'éteint jamais d'un trait.
        const env = bolt.life > 0.75 ? 1 : bolt.life * (0.6 + 0.4 * Math.sin(bolt.life * 40));

        ctx.fillStyle = `rgba(206,226,255,${0.16 * env * i.lightning})`;
        ctx.fillRect(0, 0, w, h);

        if (bolt.path) {
          ctx.save();
          ctx.strokeStyle = `rgba(232,242,255,${0.85 * env})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(190,215,255,0.9)';
          ctx.shadowBlur = 22;
          ctx.beginPath();
          ctx.moveTo(bolt.path[0].x, bolt.path[0].y);
          for (const pt of bolt.path.slice(1)) ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  return { draw };
}

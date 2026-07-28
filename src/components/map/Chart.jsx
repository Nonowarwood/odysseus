import { useEffect, useMemo, useRef } from 'react';
import { MAP_VIEW, project } from '../../data/mediterranean';
import { getLandRings } from '../../lib/landGeometry';
import { buildRoute, pointAtLength, kmToMapUnits } from '../../lib/route';
import { baseScale, clamp, damp, lerp } from '../../lib/camera';
import { createWeather, blendWeather } from '../../lib/weather';
import { journeyState, useOdysseusStore } from '../../store/useOdysseusStore';

const INK = '#060d16';
const SEA_DEEP = '#0c1b2a';
const SEA_SHALLOW = '#173a52';
const LAND = '#191f2b';
const GOLD_BRIGHT = '#f0cf6a';
const IVORY = '#f5f1e8';

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const mixRgb = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgbCss = ([r, g, b]) => `rgb(${r},${g},${b})`;

const ZOOM_STOP = 4.2;
const ZOOM_SAIL = 1.9;
const PARTICLE_COUNT = 70;

export default function Chart({ onStopClick }) {
  const canvasRef = useRef(null);
  const labelRefs = useRef([]);

  const steps = useOdysseusStore((s) => s.steps);
  const mapMode = useOdysseusStore((s) => s.mapMode);
  const mapModeRef = useRef(mapMode);
  mapModeRef.current = mapMode;

  const route = useMemo(() => buildRoute(steps), [steps]);

  const stopPoints = useMemo(
    () => steps.map((s) => project(s.coordinates.lng, s.coordinates.lat)),
    [steps]
  );

  // Cadrage d'ensemble : toute la route, avec de la marge.
  const basin = useMemo(() => {
    const xs = route.points.map((p) => p.x);
    const ys = route.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      w: maxX - minX,
      h: maxY - minY,
    };
  }, [route]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const rings = getLandRings();
    const routePath = new Path2D(route.d);

    const cam = { x: basin.x, y: basin.y, z: 1 };
    const focal = { x: 0.5, y: 0.5 }; // point de mire, en fraction du viewport
    const defaultShallow = hexToRgb(SEA_SHALLOW);
    const weather = createWeather();
    const moods = steps.map((step) => hexToRgb(step.mood ?? SEA_SHALLOW));
    let initialised = false;
    let uncertainty = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      u: Math.random(),
      speed: 0.12 + Math.random() * 0.25,
      size: 0.6 + Math.random() * 1.6,
      alpha: 0.15 + Math.random() * 0.5,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    // Longueur de route atteinte pour une progression narrative donnée.
    const lengthAt = (progress) => {
      const i = clamp(Math.floor(progress), 0, steps.length - 1);
      const t = clamp(progress - i, 0, 1);
      const a = route.stopLengths[i];
      const b = route.stopLengths[Math.min(i + 1, steps.length - 1)];
      return lerp(a, b, t);
    };

    const basinZoom = () => {
      const s = baseScale(width, height);
      const fit = Math.min((width * 0.78) / (basin.w * s), (height * 0.6) / (basin.h * s));
      return clamp(fit, 0.6, 3);
    };

    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { progress, heroFade, epilogueFade, legT, pointer } = journeyState;
      const chapterFloor = clamp(Math.floor(progress), 0, steps.length - 1);
      const headLength = lengthAt(progress);
      const head = pointAtLength(route, headLength);

      // --- Cible caméra -------------------------------------------------
      const overview = basinZoom();
      const legFrom = stopPoints[chapterFloor];
      const legTo = stopPoints[Math.min(chapterFloor + 1, steps.length - 1)];
      const legSpan = Math.hypot(legTo.x - legFrom.x, legTo.y - legFrom.y);

      // Une escale peut imposer son cadrage — le palais d'Ithaque veut un
      // gros plan là où le reste du récit tient à l'échelle d'une mer.
      const zoomFrom = steps[chapterFloor].zoom ?? ZOOM_STOP;
      const zoomTo = steps[Math.min(chapterFloor + 1, steps.length - 1)].zoom ?? ZOOM_STOP;
      const stopZoom = lerp(zoomFrom, zoomTo, clamp(legT ?? 0, 0, 1));

      // On ne prend pas de recul pour quatre kilomètres : le dézoom de
      // traversée s'annule quand les deux escales sont voisines.
      const sailing = Math.sin(Math.PI * clamp(legT ?? 0, 0, 1)) * clamp(legSpan / 25, 0, 1);
      const travelZoom = lerp(stopZoom, ZOOM_SAIL, sailing);

      let target;
      if (journeyState.phase === 'hero') {
        const t = heroFade;
        target = {
          x: lerp(basin.x, stopPoints[0].x, t),
          y: lerp(basin.y, stopPoints[0].y, t),
          z: lerp(overview * 0.78, ZOOM_STOP, t),
        };
      } else if (journeyState.phase === 'epilogue') {
        const t = epilogueFade;
        const lastStop = stopPoints[stopPoints.length - 1];
        target = {
          x: lerp(lastStop.x, basin.x, t),
          y: lerp(lastStop.y, basin.y, t),
          z: lerp(steps[steps.length - 1].zoom ?? ZOOM_STOP, overview, t),
        };
      } else {
        target = { x: head.x, y: head.y, z: travelZoom };
      }

      if (!initialised) {
        Object.assign(cam, target);
        initialised = true;
      } else {
        cam.x = damp(cam.x, target.x, 2.1, dt);
        cam.y = damp(cam.y, target.y, 2.1, dt);
        cam.z = damp(cam.z, target.z, 1.7, dt);
      }

      const s = baseScale(width, height) * cam.z;

      // Point de mire : pendant le récit, l'escale se place dans la zone
      // laissée libre par la colonne de texte — à droite sur grand écran,
      // au-dessus d'elle sur mobile. Ailleurs, on recentre.
      const narrow = width < 900;
      const inStory = journeyState.phase === 'journey';
      focal.x = damp(focal.x, inStory && !narrow ? 0.62 : 0.5, 3, dt);
      focal.y = damp(focal.y, inStory && narrow ? 0.3 : 0.5, 3, dt);

      // Léger flottement au pointeur : la carte respire sans jamais dériver.
      const driftX = -pointer.x * 14;
      const driftY = -pointer.y * 10;
      const originX = width * focal.x - cam.x * s + driftX;
      const originY = height * focal.y - cam.y * s + driftY;

      const toScreen = (p) => ({ x: p.x * s + originX, y: p.y * s + originY });

      // Fenêtre visible en unités carte (pour le culling).
      const view = {
        minX: (-originX) / s,
        minY: (-originY) / s,
        maxX: (width - originX) / s,
        maxY: (height - originY) / s,
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // --- Mer ----------------------------------------------------------
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, width, height);

      // Chaque chapitre a sa teinte de mer ; on fond de l'une à l'autre au
      // rythme de la traversée, si bien que le changement d'ambiance se sent
      // sans jamais se voir arriver.
      const chapterA = Math.min(chapterFloor, moods.length - 1);
      const chapterB = Math.min(chapterA + 1, moods.length - 1);
      const chapterMix = mixRgb(moods[chapterA], moods[chapterB], clamp(progress - chapterA, 0, 1));
      const neutrality = clamp(
        journeyState.phase === 'hero' ? 1 - heroFade * 0.6 : epilogueFade * 0.7,
        0,
        1
      );
      const shallow = rgbCss(mixRgb(chapterMix, defaultShallow, neutrality));

      const seaGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        0,
        width * 0.5,
        height * 0.48,
        Math.max(width, height) * 0.78
      );
      seaGradient.addColorStop(0, shallow);
      seaGradient.addColorStop(0.55, SEA_DEEP);
      seaGradient.addColorStop(1, INK);
      ctx.fillStyle = seaGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * originX, dpr * originY);
      const px = 1 / s; // un pixel écran, exprimé en unités carte

      // --- Graticule ----------------------------------------------------
      ctx.lineWidth = px;
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.11)';
      ctx.beginPath();
      for (let lng = Math.ceil(MAP_VIEW.lngMin / 5) * 5; lng <= MAP_VIEW.lngMax; lng += 5) {
        const a = project(lng, MAP_VIEW.latMin);
        const b = project(lng, MAP_VIEW.latMax);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      for (let lat = Math.ceil(MAP_VIEW.latMin / 5) * 5; lat <= MAP_VIEW.latMax; lat += 5) {
        const a = project(MAP_VIEW.lngMin, lat);
        const b = project(MAP_VIEW.lngMax, lat);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      // --- Rose des vents portulane : rayons depuis le centre du bassin ---
      const rose = project(16, 38);
      const roseR = MAP_VIEW.width * 0.62;
      const roseFade = clamp(1 - (cam.z - 1.4) / 1.6, 0, 1);
      ctx.strokeStyle = `rgba(201, 162, 39, ${0.075 * roseFade})`;
      ctx.beginPath();
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        ctx.moveTo(rose.x, rose.y);
        ctx.lineTo(rose.x + Math.cos(a) * roseR, rose.y + Math.sin(a) * roseR);
      }
      ctx.stroke();
      if (roseFade > 0.01) {
        ctx.beginPath();
        ctx.arc(rose.x, rose.y, MAP_VIEW.width * 0.19, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Terres -------------------------------------------------------
      const minSize = 1.5 * px; // on ignore ce qui ferait moins de ~1,5 px
      const visible = rings.filter(
        (r) =>
          r.size > minSize &&
          r.maxX > view.minX &&
          r.minX < view.maxX &&
          r.maxY > view.minY &&
          r.minY < view.maxY
      );

      // Ombrage de rivage : plusieurs contours de plus en plus larges et
      // transparents, comme les hachures côtières des portulans. C'est ce
      // dégradé qui donne du relief à la mer plutôt qu'un aplat uniforme.
      ctx.lineJoin = 'round';
      for (const [w, alpha] of [
        [26, 0.035],
        [16, 0.048],
        [9, 0.07],
        [4, 0.1],
      ]) {
        ctx.strokeStyle = `rgba(201, 162, 39, ${alpha})`;
        ctx.lineWidth = w * px;
        for (const r of visible) ctx.stroke(r.path);
      }

      ctx.fillStyle = LAND;
      for (const r of visible) ctx.fill(r.path);

      // Liseré chaud à l'intérieur du trait de côte : sans lui, les terres se
      // lisent comme des trous dans la mer au lieu de masses posées dessus.
      const rimMin = 30 * px;
      ctx.strokeStyle = 'rgba(222, 186, 104, 0.15)';
      ctx.lineWidth = 16 * px;
      for (const r of visible) {
        if (r.size < rimMin) continue;
        ctx.save();
        ctx.clip(r.path);
        ctx.stroke(r.path);
        ctx.restore();
      }

      ctx.strokeStyle = 'rgba(224, 190, 96, 0.62)';
      ctx.lineWidth = 1.05 * px;
      for (const r of visible) ctx.stroke(r.path);

      // --- Zones d'incertitude (mode historiens) -------------------------
      const wantUncertainty = mapModeRef.current === 'historians' ? 1 : 0;
      uncertainty = damp(uncertainty, wantUncertainty, 4, dt);

      if (uncertainty > 0.01) {
        ctx.save();
        ctx.setLineDash([6 * px, 5 * px]);
        steps.forEach((step, i) => {
          if (step.certainty !== 'debated') return;
          const r = kmToMapUnits(step.uncertaintyRadiusKm ?? 120, step.coordinates.lat);
          const p = stopPoints[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(216, 200, 165, ${0.05 * uncertainty})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(216, 200, 165, ${0.4 * uncertainty})`;
          ctx.lineWidth = 1 * px;
          ctx.stroke();
        });
        ctx.restore();
      }

      // --- Route : le tracé complet, en filigrane ------------------------
      ctx.save();
      ctx.setLineDash([3 * px, 6 * px]);
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
      ctx.lineWidth = 1.1 * px;
      ctx.stroke(routePath);
      ctx.restore();
      ctx.restore();

      // --- Route parcourue : dessinée en espace écran pour un rendu net --
      const drawTravelled = (from, to, style, lineWidth, blur) => {
        ctx.save();
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < route.points.length; i++) {
          const l = route.lengths[i];
          if (l < from) continue;
          if (l > to) break;
          const p = toScreen(route.points[i]);
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        const tip = toScreen(head);
        if (started) ctx.lineTo(tip.x, tip.y);
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (blur) {
          ctx.shadowColor = 'rgba(233, 198, 92, 0.75)';
          ctx.shadowBlur = blur;
        }
        ctx.stroke();
        ctx.restore();
      };

      if (headLength > 0.5) {
        drawTravelled(0, headLength, 'rgba(201, 162, 39, 0.28)', 7, 18);
        drawTravelled(0, headLength, 'rgba(233, 198, 92, 0.95)', 1.7, 8);

        // Particules portées par le sillage.
        ctx.save();
        for (const p of particles) {
          p.u += (p.speed * dt) / Math.max(headLength / 260, 0.35);
          if (p.u > 1) p.u -= 1;
          const pos = pointAtLength(route, p.u * headLength);
          const sp = toScreen(pos);
          ctx.globalAlpha = p.alpha * (0.35 + 0.65 * Math.sin(Math.PI * p.u));
          ctx.fillStyle = GOLD_BRIGHT;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Escales -------------------------------------------------------
      const pulse = 0.5 + 0.5 * Math.sin(now / 620);
      const activeIndex = clamp(Math.round(progress), 0, steps.length - 1);

      steps.forEach((step, i) => {
        const p = toScreen(stopPoints[i]);
        const reached = progress >= i - 0.001;
        const isActive = i === activeIndex && Math.abs(progress - i) < 0.35;

        ctx.save();
        if (isActive) {
          ctx.strokeStyle = `rgba(233, 198, 92, ${0.18 + 0.22 * pulse})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 16 + pulse * 9, 0, Math.PI * 2);
          ctx.stroke();

          // Réticule de relevé.
          ctx.strokeStyle = 'rgba(233, 198, 92, 0.45)';
          ctx.beginPath();
          for (const [dx, dy] of [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
          ]) {
            ctx.moveTo(p.x + dx * 13, p.y + dy * 13);
            ctx.lineTo(p.x + dx * 20, p.y + dy * 20);
          }
          ctx.stroke();
        }

        ctx.strokeStyle = reached ? 'rgba(233, 198, 92, 0.85)' : 'rgba(201, 162, 39, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isActive ? 8 : 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = reached ? IVORY : 'rgba(201, 162, 39, 0.55)';
        if (reached) {
          ctx.shadowColor = 'rgba(233, 198, 92, 0.8)';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, isActive ? 3.6 : 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- Le navire -----------------------------------------------------
      if (journeyState.phase !== 'hero' || heroFade > 0.15) {
        const tip = toScreen(head);
        const shipAlpha = clamp(journeyState.phase === 'hero' ? heroFade : 1, 0, 1);
        ctx.save();
        ctx.globalAlpha = shipAlpha;
        ctx.translate(tip.x, tip.y);
        ctx.rotate((head.angle * Math.PI) / 180);
        ctx.shadowColor = 'rgba(233, 198, 92, 0.9)';
        ctx.shadowBlur = 14;

        // Coque
        ctx.fillStyle = IVORY;
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.quadraticCurveTo(2, 5.2, -9, 3.4);
        ctx.quadraticCurveTo(-6, 0, -9, -3.4);
        ctx.quadraticCurveTo(2, -5.2, 11, 0);
        ctx.fill();

        // Voile
        ctx.fillStyle = 'rgba(233, 198, 92, 0.95)';
        ctx.beginPath();
        ctx.moveTo(-1.5, -1);
        ctx.lineTo(-1.5, -13);
        ctx.quadraticCurveTo(7, -8.5, 5.5, -1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // --- Météo du chapitre ---------------------------------------------
      // Les intensités se fondent d'une escale à l'autre : la tempête monte
      // pendant la traversée et retombe en arrivant.
      const weatherA = steps[chapterA].weather ?? {};
      const weatherB = steps[chapterB].weather ?? {};
      const blended = blendWeather(weatherA, weatherB, clamp(progress - chapterA, 0, 1));
      const calm = journeyState.phase === 'hero' ? heroFade : 1 - epilogueFade * 0.75;
      for (const k of Object.keys(blended)) blended[k] *= clamp(calm, 0, 1);

      const tint = steps[chapterA].moteColor ?? steps[chapterB].moteColor ?? [233, 198, 92];
      weather.draw(ctx, width, height, dt, blended, tint);

      // --- Voile d'ambiance (intro / épilogue) ---------------------------
      const veil =
        journeyState.phase === 'hero'
          ? 0.34 - 0.3 * heroFade
          : journeyState.phase === 'epilogue'
            ? 0.04 + 0.2 * epilogueFade
            : 0.04;
      if (veil > 0.005) {
        ctx.fillStyle = `rgba(2, 4, 9, ${veil})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Épilogue : le bilan est centré, on assombrit donc le centre de la
      // carte pour lui donner un fond, sans effacer le tracé sur les bords.
      if (epilogueFade > 0.01) {
        const focus = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.55
        );
        focus.addColorStop(0, `rgba(2, 4, 9, ${0.82 * epilogueFade})`);
        focus.addColorStop(0.55, `rgba(2, 4, 9, ${0.5 * epilogueFade})`);
        focus.addColorStop(1, 'rgba(2, 4, 9, 0)');
        ctx.fillStyle = focus;
        ctx.fillRect(0, 0, width, height);
      }

      // Vignettage
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.42,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.78
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(2,5,10,0.46)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // --- Étiquettes HTML, positionnées par-dessus ----------------------
      // Le nom de l'escale courante figure déjà dans le titre, dans la barre
      // du bas et sur le rail : l'écrire une quatrième fois sur la carte ne
      // faisait que charger l'image. Les étiquettes ne se révèlent donc plus
      // qu'au survol de leur point. Muettes pendant l'intro et l'épilogue, et
      // sur petit écran où la colonne de texte recouvre toute la carte.
      const pointerPx = ((pointer.x + 1) / 2) * width;
      const pointerPy = ((pointer.y + 1) / 2) * height;
      const labelAlpha =
        journeyState.phase === 'hero' || width < 900
          ? 0
          : clamp((cam.z - 1.15) / 1.4, 0, 1) * (1 - epilogueFade);
      steps.forEach((step, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const p = toScreen(stopPoints[i]);
        const onScreen = p.x > -160 && p.x < width + 160 && p.y > -80 && p.y < height + 80;
        const near =
          Math.hypot(p.x - pointerPx, p.y - pointerPy) < 95 && labelAlpha > 0.15;
        el.style.transform = `translate3d(${p.x}px, ${p.y + 20}px, 0) translateX(-50%)`;
        el.style.opacity = !onScreen || labelAlpha === 0 || !near ? '0' : '0.9';
        el.style.pointerEvents = onScreen && near ? 'auto' : 'none';
      });

      frame = requestAnimationFrame(draw);
    };

    let frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [route, steps, stopPoints, basin]);

  return (
    <div className="fixed inset-0 z-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-0">
        {steps.map((step, i) => (
          <button
            key={step.id}
            ref={(el) => (labelRefs.current[i] = el)}
            onClick={() => onStopClick?.(i)}
            className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.24em] text-papyrus transition-[color] duration-300 hover:text-gold"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
          >
            {step.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Partition adaptative, entièrement synthétisée en WebAudio.
 *
 * Aucun fichier audio n'est chargé et rien n'est emprunté à une œuvre
 * existante : tout est fabriqué à la volée à partir de bruit filtré et
 * d'oscillateurs. Quatre couches, dont le niveau suit le chapitre en cours :
 *
 *   mer      — toujours présente, le ressac
 *   bourdon  — deux voix graves désaccordées : la tension, la menace
 *   orage    — souffle large et coups sourds espacés
 *   éclat    — nappe haute et scintillante : Circé, les Sirènes, le lotus
 *
 * Une bande-son composée peut se superposer : voir `setChapterTrack` et
 * `data/soundtrack.js`. Quand une piste joue, les couches synthétiques
 * s'effacent sans disparaître — la mer reste sous la musique.
 *
 * Les pistes n'ont pas besoin de boucler proprement : chacune tourne sur deux
 * lecteurs qui se relaient en fondu croisé avant la fin du morceau, ce qui
 * masque la couture au lieu de la faire entendre.
 *
 * Rien ne démarre avant un geste explicite de l'utilisateur.
 */
let ctx = null;
let master = null;
let layers = null;
let sources = [];

// Pistes composées : url → lecteur à deux voix. Créées à la première demande.
const tracks = new Map();
let currentTrack = null;

const TRACK_FADE = 3; // fondu d'un chapitre à l'autre
const LOOP_FADE = 6; // recouvrement des deux voix d'une même piste

const RAMP = 4; // secondes pour passer d'une ambiance de chapitre à la suivante

function noiseBuffer(audio, seconds = 6) {
  const length = audio.sampleRate * seconds;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);

  // Bruit brun : plus sourd que le blanc, beaucoup plus proche d'une mer.
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.019 * white) / 1.019;
    data[i] = last * 3.2;
  }
  return buffer;
}

function swell(audio, destination, { cutoff, rate, depth, gain, pan }) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio);
  source.loop = true;

  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  filter.Q.value = 0.7;

  const amp = audio.createGain();
  amp.gain.value = gain;

  // LFO d'amplitude : le va-et-vient des vagues.
  const lfo = audio.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = rate;
  const lfoGain = audio.createGain();
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain).connect(amp.gain);

  const panner = audio.createStereoPanner();
  panner.pan.value = pan;

  source.connect(filter).connect(amp).connect(panner).connect(destination);
  source.start();
  lfo.start();
  sources.push(source, lfo);
  return amp;
}

function droneVoice(audio, destination, freq, detune, type = 'sawtooth') {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  filter.Q.value = 4;

  const amp = audio.createGain();
  amp.gain.value = 0.5;

  osc.connect(filter).connect(amp).connect(destination);
  osc.start();
  sources.push(osc);
  return amp;
}

export function startAmbience() {
  if (ctx) {
    ctx.resume();
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Tout le synthétique passe par un même bus : une piste composée n'a plus
  // qu'à le baisser pour prendre le premier plan.
  const synth = ctx.createGain();
  synth.gain.value = 1;
  synth.connect(master);

  const music = ctx.createGain();
  music.gain.value = 1;
  music.connect(master);

  // --- Mer : le lit permanent -------------------------------------------
  const sea = ctx.createGain();
  sea.gain.value = 1;
  sea.connect(synth);
  swell(ctx, sea, { cutoff: 420, rate: 0.075, depth: 0.16, gain: 0.26, pan: -0.35 });
  swell(ctx, sea, { cutoff: 900, rate: 0.052, depth: 0.1, gain: 0.13, pan: 0.4 });
  swell(ctx, sea, { cutoff: 180, rate: 0.031, depth: 0.08, gain: 0.2, pan: 0 });

  // --- Bourdon : la tension ---------------------------------------------
  const drone = ctx.createGain();
  drone.gain.value = 0;
  drone.connect(synth);
  droneVoice(ctx, drone, 55, -6);
  droneVoice(ctx, drone, 55, 7);
  droneVoice(ctx, drone, 82.4, 0, 'triangle'); // la quinte

  // --- Orage : souffle large + coups sourds ------------------------------
  const storm = ctx.createGain();
  storm.gain.value = 0;
  storm.connect(synth);
  swell(ctx, storm, { cutoff: 2600, rate: 0.19, depth: 0.35, gain: 0.3, pan: 0.15 });
  swell(ctx, storm, { cutoff: 5200, rate: 0.27, depth: 0.3, gain: 0.14, pan: -0.2 });

  // --- Éclat : la nappe scintillante -------------------------------------
  const shimmer = ctx.createGain();
  shimmer.gain.value = 0;
  shimmer.connect(synth);
  droneVoice(ctx, shimmer, 330, -4, 'triangle');
  droneVoice(ctx, shimmer, 495, 5, 'sine');
  droneVoice(ctx, shimmer, 660, -8, 'sine');

  layers = { synth, music, drone, storm, shimmer, thump: { timer: null, level: 0 } };

  // Coup sourd périodique — le tonnerre lointain, pendant les tempêtes.
  layers.thump.timer = setInterval(() => {
    if (!ctx || layers.thump.level < 0.15) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(64, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.1);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.5 * layers.thump.level, t + 0.05);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc.connect(amp).connect(master);
    osc.start(t);
    osc.stop(t + 1.7);
  }, 3400);

  master.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 3.5);
}

/**
 * Règle l'ambiance sur le chapitre courant.
 * @param {{tension?: number, storm?: number, wonder?: number}} score
 */
export function setScore({ tension = 0, storm = 0, wonder = 0 } = {}) {
  if (!ctx || !layers) return;
  const t = ctx.currentTime;
  const ramp = (node, value) => {
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(node.gain.value, t);
    node.gain.linearRampToValueAtTime(value, t + RAMP);
  };

  ramp(layers.drone, Math.min(tension, 1) * 0.1);
  ramp(layers.storm, Math.min(storm, 1) * 0.5);
  ramp(layers.shimmer, Math.min(wonder, 1) * 0.045);
  layers.thump.level = Math.min(storm, 1);
}

/**
 * Bascule sur la piste composée du chapitre, ou revient au synthétique.
 * @param {string|null} url
 */
export function setChapterTrack(url) {
  if (!ctx || !layers) {
    currentTrack = url;
    return;
  }
  if (currentTrack === url) return;

  const previous = currentTrack;
  currentTrack = url;
  const now = ctx.currentTime;
  const fade = TRACK_FADE;

  const ramp = (node, value) => {
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(value, now + fade);
  };

  if (previous && tracks.has(previous)) {
    const old = tracks.get(previous);
    ramp(old.gain, 0);
    setTimeout(() => {
      if (currentTrack !== previous) old.stop();
    }, fade * 1000 + 100);
  }

  // Sans piste, le synthétique remonte au premier plan.
  ramp(layers.synth, url ? 0.34 : 1);
  if (!url) return;

  let track = tracks.get(url);
  if (!track) track = createTrack(url);
  track.start();
  ramp(track.gain, 1);
}

/**
 * Un morceau, deux lecteurs. Le second démarre pendant que le premier finit,
 * et l'on passe de l'un à l'autre en fondu : une composition qui ne boucle pas
 * tourne ainsi indéfiniment sans coupure ni silence.
 */
function createTrack(url) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(layers.music);

  const voices = [0, 1].map(() => {
    const el = new Audio(url);
    el.crossOrigin = 'anonymous';
    el.preload = 'auto';
    const g = ctx.createGain();
    g.gain.value = 0;
    ctx.createMediaElementSource(el).connect(g).connect(gain);
    return { el, gain: g };
  });

  let active = 0;
  let timer = null;

  const fade = (voice, to, seconds) => {
    const t = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.linearRampToValueAtTime(to, t + seconds);
  };

  const relay = () => {
    const from = voices[active];
    active = 1 - active;
    const to = voices[active];
    to.el.currentTime = 0;
    to.el.play().catch(() => {});
    fade(to, 1, LOOP_FADE);
    fade(from, 0, LOOP_FADE);
    setTimeout(() => from.el.pause(), LOOP_FADE * 1000 + 200);
  };

  const watch = () => {
    const { duration, currentTime } = voices[active].el;
    if (!duration || !Number.isFinite(duration)) return;
    // Une piste plus courte que le fondu relaierait à chaque tour d'horloge :
    // on la laisse alors s'enchaîner sans recouvrement.
    if (duration <= LOOP_FADE * 2) {
      if (currentTime >= duration - 0.25) relay();
      return;
    }
    // Le fondu doit commencer assez tôt pour être fini quand la piste l'est.
    if (currentTime >= duration - LOOP_FADE) relay();
  };

  const track = {
    gain,
    voices,
    get active() {
      return active;
    },
    start() {
      const voice = voices[active];
      if (voice.el.paused) {
        voice.el.play().catch(() => {
          /* le navigateur refuse la lecture : on reste au synthétique */
        });
      }
      fade(voice, 1, 0.4);
      if (!timer) timer = setInterval(watch, 250);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
      voices.forEach((v) => {
        v.el.pause();
        v.el.src = '';
      });
    },
  };

  tracks.set(url, track);
  // Poignée de débogage : permet d'inspecter le relais des deux voix sans
  // instrumenter le code de production.
  if (import.meta.env?.DEV) window.__odysseusAudio = { tracks, layers };
  return track;
}

export function stopAmbience() {
  if (!ctx || !master) return;
  const audio = ctx;
  const bus = master;
  const stopping = sources;
  const timer = layers?.thump.timer;

  bus.gain.cancelScheduledValues(audio.currentTime);
  bus.gain.setValueAtTime(bus.gain.value, audio.currentTime);
  bus.gain.linearRampToValueAtTime(0, audio.currentTime + 1.2);

  const playing = [...tracks.values()];
  tracks.clear();
  currentTrack = null;

  ctx = null;
  master = null;
  layers = null;
  sources = [];

  setTimeout(() => {
    if (timer) clearInterval(timer);
    playing.forEach((track) => track.stop());
    stopping.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* déjà arrêté */
      }
    });
    audio.close();
  }, 1400);
}

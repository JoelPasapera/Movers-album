// @ts-check
// La voz de la app (sintesis del navegador) y los pitidos de acierto y fallo.
//
// Tres cosas que aqui se cuidan porque en las tablets de verdad fallan:
//   1. Chrome pierde el evento 'end' si el objeto de la frase se recoge de la
//      memoria antes de terminar. Se guarda una referencia hasta que acaba, y
//      ademas hay un reloj de seguridad: si 'end' no llega, se sigue igual.
//      Sin eso, un dialogo de Listen and tick se quedaba en la primera linea.
//   2. Cuando una frase nueva corta a otra (el nino pulsa "Say it again"), la
//      cortada NO avisa de que termino. Antes avisaba (Chrome manda un error
//      "interrupted") y un dialogo repetido se mezclaba con el anterior.
//   3. Chrome corta las frases muy largas a los quince segundos. Los textos
//      largos (el de un tablero) se dicen frase a frase.

import { getSettings, setSetting } from './settings.js';
import * as recordings from './recordings.js';

/** Velocidad del examen: la que suenan las grabaciones de practica. */
export const EXAM_RATE = 0.85;
/** Velocidades de practica que puede elegir el profesor. */
export const RATES = { normal: 0.85, slow: 0.7 };

const PITCH = { adult: 0.9, child: 1.35 };
const MAX_CHUNK = 160;

let examMode = false;
let muted = getSettings().muted;
/** @type {SpeechSynthesisVoice | null} */
let voice = null;
/** @type {AudioContext | null} */
let ctx = null;
const plays = new Map();

/** Lo que esta sonando ahora. Si otra frase lo corta, queda `superseded`. */
/** @type {{ superseded: boolean, done: boolean } | null} */
let current = null;
/** Referencias fuertes a las frases en curso (ver 1 arriba). */
const live = new Set();

/** @returns {SpeechSynthesis | null} */
const synth = () => ('speechSynthesis' in window ? window.speechSynthesis : null);

// ---------------------------------------------------------------- examen

/** En el examen real cada grabacion suena exactamente dos veces. */
/** @param {boolean} value */
export function setExamMode(value) {
  examMode = Boolean(value);
  plays.clear();
  return examMode;
}

export const isExamMode = () => examMode;

/** @param {string} key */
export function playsLeft(key) {
  if (!examMode) return Infinity;
  return Math.max(0, 2 - (plays.get(key) ?? 0));
}

/** @param {string} key */
export function countPlay(key) {
  plays.set(key, (plays.get(key) ?? 0) + 1);
  return playsLeft(key);
}

// ---------------------------------------------------------------- voces

/** @returns {SpeechSynthesisVoice[]} */
const allVoices = () => synth()?.getVoices?.() ?? [];

/** @param {SpeechSynthesisVoice} v */
const isEnglish = (v) => (v.lang ?? '').toLowerCase().replace('_', '-').startsWith('en');

/**
 * La voz elegida en Ajustes si sigue instalada; si no, una britanica, luego
 * cualquier inglesa. Si no hay ninguna inglesa, ninguna: el navegador usa la
 * suya con lang en-GB, que es lo mejor que se puede hacer.
 * @returns {SpeechSynthesisVoice | null}
 */
function pickVoice() {
  const voices = allVoices();
  if (!voices.length) return null;
  const wanted = getSettings().voiceURI;
  const chosen = wanted ? voices.find((v) => v.voiceURI === wanted) : null;
  if (chosen) return chosen;
  const lang = (v) => (v.lang ?? '').replace('_', '-');
  return voices.find((v) => lang(v) === 'en-GB')
    ?? voices.find((v) => lang(v).startsWith('en-GB'))
    ?? voices.find(isEnglish)
    ?? null;
}

export function initVoice() {
  const s = synth();
  if (!s) return;
  voice = pickVoice();
  s.addEventListener?.('voiceschanged', () => { voice = pickVoice(); });
}

/** Las voces inglesas de este aparato, para la pantalla de Ajustes. */
export function englishVoices() {
  return allVoices().filter(isEnglish).map((v) => ({
    uri: v.voiceURI, name: v.name, lang: (v.lang ?? '').replace('_', '-'), local: v.localService !== false,
  }));
}

/** @returns {string} */
export const currentVoiceURI = () => voice?.voiceURI ?? '';

/** @param {string} uri */
export function setVoice(uri) {
  setSetting('voiceURI', uri);
  voice = pickVoice();
  return currentVoiceURI();
}

/** True solo si el navegador tiene una voz inglesa de verdad. Sin ella,
 * speechSynthesis leeria el ingles con acento del idioma del sistema. */
export function englishVoiceAvailable() {
  return allVoices().some(isEnglish);
}

// ---------------------------------------------------------------- volumen y velocidad

export const isMuted = () => muted;

/** @param {boolean} value */
export function setMuted(value) {
  muted = Boolean(value);
  setSetting('muted', muted);
  if (muted) stop();
  return muted;
}

/** @param {'slow' | 'normal'} speed */
export function setSpeed(speed) {
  return setSetting('speed', speed === 'slow' ? 'slow' : 'normal').speed;
}

/** La velocidad que toca: en el simulacro, siempre la del examen. */
export const currentRate = () => (examMode ? EXAM_RATE : RATES[getSettings().speed]);

// ---------------------------------------------------------------- hablar

/**
 * Parte un texto largo en trozos de frases enteras.
 * @param {string} text
 * @returns {string[]}
 */
export function splitForSpeech(text) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_CHUNK) return clean ? [clean] : [];
  const sentences = clean.match(/[^.!?]+[.!?]+["”’']?|[^.!?]+$/g) ?? [clean];
  /** @type {string[]} */
  const out = [];
  let buf = '';
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (buf && (buf.length + 1 + s.length) > MAX_CHUNK) {
      out.push(buf);
      buf = s;
    } else buf = buf ? `${buf} ${s}` : s;
  }
  if (buf) out.push(buf);
  return out;
}

/** Lo que tardaria como mucho una frase, con margen de sobra. */
/** @param {string} text @param {number} rate */
const watchdogMs = (text, rate) => Math.round((text.length / 10 / Math.max(rate, 0.3)) * 1000) + 2500;

/** La grabacion del profesor que esta sonando (ver core/recordings.js). @type {HTMLAudioElement | null} */
let playing = null;

function supersede() {
  if (current) current.superseded = true;
  current = null;
  if (playing) {
    try { playing.pause(); } catch { /* ya parada */ }
    playing = null;
  }
}

/**
 * Dice un texto. `onEnd` se llama al terminar, o enseguida si no hay voz o el
 * sonido esta apagado; NO se llama si otra frase lo corta antes.
 *
 * Si el profesor grabo esa frase (core/recordings.js), suena su grabacion en
 * vez de la voz del navegador, a la velocidad que toca. Si la grabacion falla,
 * se dice con la voz del navegador, como siempre.
 * @param {string} text
 * @param {{ onEnd?: () => void, pitch?: number, rate?: number }} [options]
 */
export function speak(text, { onEnd, pitch = 1.05, rate } = {}) {
  supersede();
  if (muted) {
    onEnd?.();
    return;
  }
  const token = { superseded: false, done: false };
  const speed = rate ?? currentRate();
  if (recordings.has(text) && typeof Audio !== 'undefined') {
    synth()?.cancel?.();
    current = token;
    playRecording(text, token, speed, onEnd, () => speakWithSynth(text, token, speed, pitch, onEnd));
    return;
  }
  speakWithSynth(text, token, speed, pitch, onEnd);
}

/** @param {{ superseded: boolean, done: boolean }} token @param {(() => void) | undefined} onEnd */
function finishToken(token, onEnd) {
  if (token.superseded || token.done) return;
  token.done = true;
  if (current === token) current = null;
  onEnd?.();
}

/**
 * La grabacion del profesor. La velocidad normal de practica es su velocidad
 * natural; la lenta, un poco mas despacio (sin cambiar el tono).
 * @param {string} text @param {{ superseded: boolean, done: boolean }} token @param {number} speed
 * @param {(() => void) | undefined} onEnd @param {() => void} fallback
 */
function playRecording(text, token, speed, onEnd, fallback) {
  recordings.blobFor(text).then((blob) => {
    if (token.superseded) return;
    if (!blob) { fallback(); return; }
    const url = URL.createObjectURL(blob);
    const clip = new Audio(url);
    clip.playbackRate = Math.max(0.5, Math.min(1.5, speed / RATES.normal));
    playing = clip;
    let settled = false;
    /** @type {ReturnType<typeof setTimeout>} */
    let guard;
    /** @param {boolean} ok */
    const settle = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      URL.revokeObjectURL(url);
      if (playing === clip) playing = null;
      if (token.superseded) return;
      if (ok) finishToken(token, onEnd);
      else fallback();
    };
    clip.addEventListener('ended', () => settle(true));
    clip.addEventListener('error', () => settle(false));
    // Como con la voz del navegador: si no avisa de que acabo, se sigue igual.
    guard = setTimeout(() => settle(true), Math.max(watchdogMs(text, speed) * 2, 15000));
    const started = clip.play();
    if (started && typeof started.catch === 'function') started.catch(() => settle(false));
  }).catch(() => { if (!token.superseded) fallback(); });
}

/**
 * La voz del navegador.
 * @param {string} text @param {{ superseded: boolean, done: boolean }} token @param {number} speed
 * @param {number} pitch @param {(() => void) | undefined} onEnd
 */
function speakWithSynth(text, token, speed, pitch, onEnd) {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') {
    if (current === token) current = null;
    onEnd?.();
    return;
  }
  s.cancel();
  s.resume?.();
  current = token;
  const chunks = splitForSpeech(text);
  let next = 0;

  const finish = () => finishToken(token, onEnd);

  const sayNext = () => {
    if (token.superseded) return;
    if (next >= chunks.length) return finish();
    const piece = chunks[next];
    next += 1;
    const utter = new SpeechSynthesisUtterance(piece);
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || 'en-GB';
    utter.rate = speed;
    utter.pitch = pitch;
    let settled = false;
    /** @type {ReturnType<typeof setTimeout>} */
    let guard;
    const advance = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      live.delete(utter);
      sayNext();
    };
    utter.addEventListener('end', advance);
    utter.addEventListener('error', advance);
    guard = setTimeout(advance, watchdogMs(piece, speed));
    live.add(utter);
    s.speak(utter);
  };
  sayNext();
}

/** Corta lo que este sonando, sin avisar a nadie de que termino. */
export function stop() {
  supersede();
  synth()?.cancel?.();
}

/**
 * Dice una conversacion linea a linea: [{ who: 'adult' | 'child', text }].
 * En el examen los dialogos son entre un adulto y un nino, con voces que se
 * distinguen; con una sola voz de sintesis, se distinguen por el tono.
 * Devuelve una funcion para cortarla.
 * @param {{ who: 'adult' | 'child' | string, text: string }[]} lines
 * @param {{ onEnd?: () => void }} [options]
 */
export function speakLines(lines, { onEnd } = {}) {
  let cancelled = false;
  /** @param {number} i */
  const say = (i) => {
    if (cancelled) return;
    if (i >= lines.length) {
      onEnd?.();
      return;
    }
    speak(lines[i].text, { pitch: PITCH[/** @type {'adult' | 'child'} */ (lines[i].who)] ?? 1.05, onEnd: () => say(i + 1) });
  };
  say(0);
  return () => { cancelled = true; stop(); };
}

/** Frase de prueba para la pantalla de Ajustes. */
export function sample() {
  speak('Hello! Let’s play. The cat is under the table.');
}

// ---------------------------------------------------------------- pitidos

/**
 * @param {number} freq @param {number} start @param {number} duration @param {number} gainValue
 */
function tone(freq, start, duration, gainValue) {
  const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  gain.gain.setValueAtTime(gainValue, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.stop(ctx.currentTime + start + duration);
}

/** @param {'correct' | 'wrong' | 'finish'} kind */
/**
 * Suena este aviso? En el simulacro (modo examen) no suenan el de acierto ni el
 * de fallo: en el examen nadie dice si una respuesta esta bien. El de final si.
 * @param {string} kind 'correct' | 'wrong' | 'finish'
 */
export const cueAllowed = (kind) => !(examMode && (kind === 'correct' || kind === 'wrong'));

export function cue(kind) {
  if (muted || !cueAllowed(kind)) return;
  try {
    if (kind === 'correct') {
      tone(660, 0, 0.16, 0.16);
      tone(990, 0.12, 0.22, 0.14);
    } else if (kind === 'wrong') {
      tone(220, 0, 0.26, 0.14);
    } else if (kind === 'finish') {
      tone(523, 0, 0.16, 0.15);
      tone(659, 0.14, 0.16, 0.15);
      tone(784, 0.28, 0.32, 0.15);
    }
  } catch { /* el sonido es opcional */ }
}

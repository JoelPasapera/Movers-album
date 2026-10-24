let voice = null;
let ctx = null;
let muted = false;
let examMode = false;
const plays = new Map();

// En el examen real cada grabacion suena exactamente dos veces.
export function setExamMode(value) {
  examMode = Boolean(value);
  plays.clear();
  return examMode;
}

export const isExamMode = () => examMode;

export function playsLeft(key) {
  if (!examMode) return Infinity;
  return Math.max(0, 2 - (plays.get(key) ?? 0));
}

export function countPlay(key) {
  plays.set(key, (plays.get(key) ?? 0) + 1);
  return playsLeft(key);
}

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang?.startsWith('en-GB')) ||
    voices.find((v) => v.lang?.startsWith('en')) ||
    voices[0]
  );
}

export function initVoice() {
  if (!('speechSynthesis' in window)) return;
  voice = pickVoice();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voice = pickVoice();
  });
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  if (muted) stop();
  return muted;
}

// True solo si el navegador tiene una voz inglesa de verdad. Sin ella,
// speechSynthesis leeria el ingles con acento del idioma del sistema.
export function englishVoiceAvailable() {
  if (!('speechSynthesis' in window)) return false;
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  return voices.some((v) => v.lang?.toLowerCase().startsWith('en'));
}

export function speak(text, { rate = 0.85, onEnd, pitch = 1.05 } = {}) {
  if (muted || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang || 'en-GB';
  utter.rate = rate;
  utter.pitch = pitch;
  if (onEnd) {
    utter.addEventListener('end', onEnd);
    utter.addEventListener('error', onEnd);
  }
  window.speechSynthesis.speak(utter);
}

export function stop() {
  window.speechSynthesis?.cancel?.();
}

// En el examen los diálogos son entre un adulto y un niño, con voces que se
// distinguen. Con una sola voz de sintesis, se distinguen por el tono.
const PITCH = { adult: 0.9, child: 1.35 };

// Dice una conversacion linea a linea: [{ who: 'adult' | 'child', text }].
// Devuelve una funcion para cortarla.
export function speakLines(lines, { onEnd, rate = 0.85 } = {}) {
  let cancelled = false;
  const say = (i) => {
    if (cancelled) return;
    if (i >= lines.length) {
      onEnd?.();
      return;
    }
    speak(lines[i].text, { rate, pitch: PITCH[lines[i].who] ?? 1.05, onEnd: () => say(i + 1) });
  };
  say(0);
  return () => { cancelled = true; stop(); };
}

function tone(freq, start, duration, gainValue) {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
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

export function cue(kind) {
  if (muted) return;
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
  } catch { /* audio is optional */ }
}

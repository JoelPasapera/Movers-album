// @ts-check
// Motor de vocabulario. Lleva la cuenta de cada palabra del wordlist por
// separado, para que el album deje de premiar el jugar y pase a premiar el saber.
//
// Un cromo se gana cuando la palabra esta DOMINADA: dos aciertos y el ultimo
// intento bien. No por orden de lista, como hacia antes.

import * as state from '../core/state.js';
import { localDayNumber } from '../core/time.js';
import { TOPICS } from '../data/topics.js';

const RIGHTS_TO_MASTER = 2;

// Repaso espaciado: cada acierto alarga la espera hasta el repaso siguiente
// (0, 1, 3, 7, 16 y 35 dias) y un fallo la reinicia. El escalon sube como mucho
// UNA vez al dia: acertar la misma palabra tres veces en una tarde es memoria
// de unos minutos, no de semanas, y no puede mandarla a repasar dentro de una
// semana. Lo que hace recordar es volver a acertarla otro dia.
const INTERVALS = [0, 1, 3, 7, 16, 35];

/** Palabras nuevas como mucho en una ronda del Word gym: mas, y no se retienen. */
export const NEW_PER_ROUND = 6;

const today = () => localDayNumber();

export const ALL_WORDS = TOPICS.flatMap((topic) => topic.words.map((word) => ({
  ...word,
  topicId: topic.id,
  topicLabel: topic.label,
  tint: topic.tint,
})));

export const wordById = (id) => ALL_WORDS.find((w) => w.id === id) ?? null;

const book = () => state.get().vocab ?? {};

/**
 * Como va una palabra: aciertos, fallos, escalon del repaso, ultimo dia que se
 * practico y si esta dominada (dos aciertos y el ultimo intento bien).
 * @param {string} id
 * @returns {{ right: number, wrong: number, step: number, last: number | null, mastered: boolean }}
 */
export function statusOf(id) {
  const entry = book()[id];
  return {
    right: entry?.r ?? 0,
    wrong: entry?.w ?? 0,
    step: entry?.s ?? 0,
    last: entry?.d ?? null,
    mastered: (entry?.r ?? 0) >= RIGHTS_TO_MASTER && (entry?.ok ?? false),
  };
}

export const isMastered = (id) => statusOf(id).mastered;

/**
 * Apunta un intento con una palabra. Guarda r (aciertos), w (fallos), s
 * (escalon del repaso), d (dia del ultimo intento), ok (si fue bien) y u (dia
 * en que subio el escalon por ultima vez: el escalon sube solo con el primer
 * acierto de cada dia).
 * @param {string} id @param {boolean} ok
 */
export function mark(id, ok) {
  const now = today();
  state.update((s) => {
    if (!s.vocab) s.vocab = {};
    const entry = s.vocab[id] ?? { r: 0, w: 0, s: 0, d: null, ok: false, u: null };
    if (ok) {
      entry.r += 1;
      if (entry.u !== now) {
        entry.s = Math.min(entry.s + 1, INTERVALS.length - 1);
        entry.u = now;
      }
    } else {
      entry.w += 1;
      entry.s = 0;
    }
    entry.ok = ok;
    entry.d = now;
    s.vocab[id] = entry;
  });
  return statusOf(id);
}

const isDue = (id) => {
  const { last, step } = statusOf(id);
  if (last === null) return true;
  return today() - last >= INTERVALS[Math.min(step, INTERVALS.length - 1)];
};

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Las palabras de una ronda: primero lo que ha fallado, luego lo que nunca ha
 * visto, luego lo que toca repasar. Si el tema esta dado, solo de ese tema; si
 * `ids` esta dado (un tablero), solo esas palabras. Con `maxNew`, no mas de
 * esas palabras nuevas (la ronda puede salir mas corta: aprender diez palabras
 * nuevas de golpe es aprender menos).
 * @param {number} [size] @param {string | null} [topicId] @param {Iterable<string> | null} [ids]
 * @param {{ maxNew?: number }} [options]
 */
export function pickBatch(size = 10, topicId = null, ids = null, { maxNew = Infinity } = {}) {
  const wanted = ids ? new Set([...ids].map((id) => id.toLowerCase())) : null;
  const pool = ALL_WORDS.filter((w) => (!topicId || w.topicId === topicId)
    && (!wanted || wanted.has(w.id.toLowerCase())));
  const failing = [];
  const fresh = [];
  const due = [];
  for (const word of pool) {
    const s = statusOf(word.id);
    if (s.wrong > 0 && !s.mastered) failing.push(word);
    else if (s.last === null) fresh.push(word);
    else if (isDue(word.id)) due.push(word);
  }
  const batch = [
    ...shuffle(failing).slice(0, Math.ceil(size / 2)),
    ...shuffle(fresh),
    ...shuffle(due),
  ];
  const seen = new Set();
  const out = [];
  let fresher = 0;
  /** Cabe una palabra mas? Las nuevas, solo hasta `maxNew`. @param {{ id: string }} word */
  const take = (word) => {
    if (seen.has(word.id)) return;
    const isNew = statusOf(word.id).last === null;
    if (isNew && fresher >= maxNew) return;
    if (isNew) fresher += 1;
    seen.add(word.id);
    out.push(word);
  };
  for (const word of batch) {
    if (out.length >= size) break;
    take(word);
  }
  // Si ya esta todo dominado y al dia, se repasa igualmente.
  for (const word of shuffle(pool)) {
    if (out.length >= size) break;
    take(word);
  }
  return out;
}

const summarize = (pool) => ({
  mastered: pool.filter((w) => isMastered(w.id)).length,
  started: pool.filter((w) => statusOf(w.id).last !== null).length,
  total: pool.length,
});

export function progress(topicId = null) {
  return summarize(topicId ? ALL_WORDS.filter((w) => w.topicId === topicId) : ALL_WORDS);
}

/**
 * Cuantas palabras toca practicar: las falladas que aun no se saben, las que
 * vencen el repaso y las nuevas. De una pagina, si se da el tema.
 * @param {string | null} [topicId]
 */
export function reviewSummary(topicId = null) {
  const pool = topicId ? ALL_WORDS.filter((w) => w.topicId === topicId) : ALL_WORDS;
  let failing = 0;
  let due = 0;
  let fresh = 0;
  for (const word of pool) {
    const s = statusOf(word.id);
    if (s.wrong > 0 && !s.mastered) failing += 1;
    else if (s.last === null) fresh += 1;
    else if (isDue(word.id)) due += 1;
  }
  return { failing, due, fresh, total: pool.length };
}

// Progreso sobre una lista concreta de palabras (un tablero).
export function progressOf(ids) {
  const wanted = new Set([...ids].map((id) => id.toLowerCase()));
  return summarize(ALL_WORDS.filter((w) => wanted.has(w.id.toLowerCase())));
}

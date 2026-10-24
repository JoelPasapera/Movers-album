// Motor de vocabulario. Lleva la cuenta de cada palabra del wordlist por
// separado, para que el album deje de premiar el jugar y pase a premiar el saber.
//
// Un cromo se gana cuando la palabra esta DOMINADA: dos aciertos y el ultimo
// intento bien. No por orden de lista, como hacia antes.

import * as state from '../core/state.js';
import { TOPICS } from '../data/topics.js';

const RIGHTS_TO_MASTER = 2;

// Repaso espaciado sencillo: cada acierto duplica la espera, un fallo la reinicia.
const INTERVALS = [0, 1, 3, 7, 16, 35];

const today = () => Math.floor(Date.now() / 86400000);

export const ALL_WORDS = TOPICS.flatMap((topic) => topic.words.map((word) => ({
  ...word,
  topicId: topic.id,
  topicLabel: topic.label,
  tint: topic.tint,
})));

export const wordById = (id) => ALL_WORDS.find((w) => w.id === id) ?? null;

const book = () => state.get().vocab ?? {};

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

export function mark(id, ok) {
  state.update((s) => {
    if (!s.vocab) s.vocab = {};
    const entry = s.vocab[id] ?? { r: 0, w: 0, s: 0, d: null, ok: false };
    if (ok) {
      entry.r += 1;
      entry.s = Math.min(entry.s + 1, INTERVALS.length - 1);
    } else {
      entry.w += 1;
      entry.s = 0;
    }
    entry.ok = ok;
    entry.d = today();
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

// Primero lo que ha fallado, luego lo que nunca ha visto, luego repaso.
// Si el tema esta dado, solo de ese tema; si `ids` esta dado (un tablero),
// solo esas palabras.
export function pickBatch(size = 10, topicId = null, ids = null) {
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
  for (const word of batch) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);
    out.push(word);
    if (out.length >= size) break;
  }
  // Si ya esta todo dominado y al dia, se repasa igualmente.
  if (out.length < size) {
    for (const word of shuffle(pool)) {
      if (seen.has(word.id)) continue;
      seen.add(word.id);
      out.push(word);
      if (out.length >= size) break;
    }
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

// Progreso sobre una lista concreta de palabras (un tablero).
export function progressOf(ids) {
  const wanted = new Set([...ids].map((id) => id.toLowerCase()));
  return summarize(ALL_WORDS.filter((w) => wanted.has(w.id.toLowerCase())));
}

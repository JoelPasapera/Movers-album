// @ts-check
// El cuaderno de errores de cada nino.
//
// Lo que se falla en un juego se apunta aqui y vuelve OTRO dia en "Fix my
// mistakes". Un error queda arreglado cuando se acierta en dos dias distintos
// despues de fallarlo; si se vuelve a fallar, empieza de nuevo. Es la forma de
// estudiar que mas ayuda a recordar: recuperar la respuesta de memoria (no
// releerla) y hacerlo en dias separados, no todo el mismo dia.
//
// Solo se apuntan preguntas que se entienden solas, sin el resto del juego:
// una pista y su palabra, una frase con un hueco, lo que dice alguien y la
// mejor respuesta. Las que dependen de un dibujo o de un cuento entero no.

import * as state from '../core/state.js';
import { localDate } from '../core/time.js';

/**
 * @typedef {'write' | 'choose'} MistakeKind
 * @typedef {{
 *   key: string, game: string, kind: MistakeKind, prompt: string, say: string, after: string,
 *   answer: string, accept: string[], options: string[], why: string, given: string,
 *   first: string, last: string, misses: number, wins: string[],
 * }} Mistake
 *   key: la misma pregunta tiene siempre la misma clave; game: el juego donde
 *   se fallo; kind: escribir la respuesta o elegirla entre opciones; prompt: lo
 *   que se lee; say: lo que se oye antes de contestar ('' si nada); after: lo
 *   que se oye despues (la frase entera); answer: la respuesta buena; accept:
 *   otras respuestas que tambien valen; options: las opciones (con la buena);
 *   why: la regla, si el juego la sabe; given: lo que contesto la ultima vez
 *   que fallo; first: el dia en que se fallo la primera vez; last: el dia del
 *   ultimo intento; misses: las veces que se ha fallado; wins: los dias en que
 *   se acerto despues del ultimo fallo
 * @typedef {{
 *   game: string, kind: MistakeKind, prompt: string, answer: string, say?: string, after?: string,
 *   accept?: string[], options?: string[], why?: string, given?: string,
 * }} MistakeInput
 */

/** Cuantos errores pendientes se guardan por nino (los mas viejos se van). */
export const MISTAKES_KEPT = 80;
/** Dias distintos que hay que acertar un error para darlo por arreglado. */
export const WINS_TO_FIX = 2;
/** Preguntas por ronda de "Fix my mistakes". */
export const FIX_ROUND = 8;

const isDay = (/** @type {unknown} */ v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const clip = (/** @type {unknown} */ v, max = 200) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/**
 * Como se comparan las respuestas escritas: minusculas, apostrofo recto, sin
 * espacios de mas ni el punto final.
 * @param {string} text
 */
export function normaliseAnswer(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '')
    .trim();
}

/**
 * Una huella corta y estable de un texto (FNV-1a de 32 bits, en hexadecimal).
 * @param {string} text
 */
function fingerprint(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * La clave de una pregunta: el juego y una huella de la pregunta y su
 * respuesta. Fallar dos veces la misma pregunta suma en el mismo error.
 * @param {string} game @param {string} prompt @param {string} answer
 */
export function mistakeKey(game, prompt, answer) {
  return `${clip(game, 20)}:${fingerprint(`${normaliseAnswer(prompt)}|${normaliseAnswer(answer)}`)}`;
}

/**
 * La frase del hueco, sacada del texto de alrededor: desde el principio de su
 * frase hasta el final. "... at home. Every morning she gives it some " y
 * ". Last Sunday..." dan "Every morning she gives it some ...".
 * @param {string} before el texto antes del hueco @param {string} after el texto despues
 */
export function gapSentence(before, after) {
  const start = Math.max(before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '));
  const head = (start >= 0 ? before.slice(start + 2) : before).trimStart();
  const stop = after.search(/[.!?]/);
  const tail = stop >= 0 ? after.slice(0, stop + 1) : after;
  return `${head}…${tail}`.replace(/\s+/g, ' ').trim();
}

/**
 * Un error valido, o null. Lo que no tiene sentido (sin respuesta, opciones
 * sin la buena) no entra: sirve para lo que se apunta y para las copias.
 * @param {unknown} raw
 * @returns {Mistake | null}
 */
export function cleanMistake(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const r = /** @type {any} */ (raw);
  const kind = r.kind === 'choose' ? 'choose' : r.kind === 'write' ? 'write' : null;
  const prompt = clip(r.prompt);
  const answer = clip(r.answer, 80);
  const game = clip(r.game, 20);
  if (!kind || !prompt || !answer || !game || !isDay(r.first) || !isDay(r.last)) return null;
  const strings = (/** @type {unknown} */ v, max = 6) => (Array.isArray(v) ? v : [])
    .map((x) => clip(x, 80)).filter(Boolean).slice(0, max);
  const options = kind === 'choose' ? [...new Set(strings(r.options, 4))] : [];
  if (kind === 'choose' && (options.length < 2 || !options.includes(answer))) return null;
  const wins = [...new Set((Array.isArray(r.wins) ? r.wins : []).filter(isDay))].sort().slice(-WINS_TO_FIX);
  return {
    key: typeof r.key === 'string' && r.key.length <= 40 ? r.key : mistakeKey(game, prompt, answer),
    game,
    kind,
    prompt,
    say: clip(r.say),
    after: clip(r.after),
    answer,
    accept: kind === 'write' ? strings(r.accept) : [],
    options,
    why: clip(r.why),
    given: clip(r.given, 80),
    first: r.first,
    last: r.last,
    misses: Number.isInteger(r.misses) && r.misses > 0 ? Math.min(r.misses, 999) : 1,
    wins,
  };
}

/** Los errores pendientes de un nino. @param {any} [data] @returns {Mistake[]} */
export function mistakesOf(data = state.get()) {
  const list = Array.isArray(data?.mistakes) ? data.mistakes : [];
  return /** @type {Mistake[]} */ (list.map(cleanMistake).filter(Boolean));
}

/** Cuantos errores ha arreglado ya (para animarle). @param {any} [data] */
export function fixedCount(data = state.get()) {
  return Number.isInteger(data?.mistakesFixed) && data.mistakesFixed > 0 ? data.mistakesFixed : 0;
}

/**
 * Toca hoy? Si: no esta arreglado y no se ha intentado hoy (lo de hoy vuelve
 * manana, que es cuando ayuda).
 * @param {Mistake} mistake @param {string} [today]
 */
export const isDue = (mistake, today = localDate()) => mistake.wins.length < WINS_TO_FIX && mistake.last < today;

/**
 * Los que tocan hoy: primero los que mas se fallan, luego los mas antiguos.
 * @param {any} [data] @param {string} [today]
 */
export function dueMistakes(data = state.get(), today = localDate()) {
  return mistakesOf(data)
    .filter((m) => isDue(m, today))
    .sort((a, b) => (b.misses - a.misses) || a.first.localeCompare(b.first) || a.key.localeCompare(b.key));
}

/**
 * Apunta un fallo. Si la pregunta ya estaba, suma un fallo y vuelve a empezar
 * la cuenta de aciertos. Devuelve lo guardado, o null si no vale.
 * @param {MistakeInput} input @param {string} [today]
 * @returns {Mistake | null}
 */
export function noteMistake(input, today = localDate()) {
  const fresh = cleanMistake({ ...input, first: today, last: today, misses: 1, wins: [] });
  if (!fresh) return null;
  /** @type {Mistake} */
  let saved = fresh;
  state.update((s) => {
    const all = /** @type {any} */ (s);
    const list = mistakesOf(all);
    const at = list.findIndex((m) => m.key === fresh.key);
    if (at >= 0) {
      const old = list[at];
      saved = { ...old, ...fresh, first: old.first, misses: old.misses + 1, wins: [] };
      list[at] = saved;
    } else {
      list.push(fresh);
    }
    // Si no caben, se van los que hace mas que no se tocan.
    all.mistakes = list.sort((a, b) => a.last.localeCompare(b.last)).slice(-MISTAKES_KEPT);
  });
  return saved;
}

/**
 * Lo que paso al contestar un error en "Fix my mistakes": 'fixed' si con este
 * acierto queda arreglado, 'better' si es un acierto mas, 'again' si se fallo.
 * @typedef {'fixed' | 'better' | 'again'} FixOutcome
 */

/**
 * Apunta un intento con un error del cuaderno.
 * @param {string} key @param {boolean} ok @param {string} [given] lo que contesto
 * @param {string} [today]
 * @returns {FixOutcome}
 */
export function fixAttempt(key, ok, given = '', today = localDate()) {
  /** @type {FixOutcome} */
  let outcome = ok ? 'better' : 'again';
  state.update((s) => {
    const all = /** @type {any} */ (s);
    const list = mistakesOf(all);
    const at = list.findIndex((m) => m.key === key);
    if (at < 0) return;
    const m = list[at];
    if (ok) {
      const wins = [...new Set([...m.wins, today])].sort();
      if (wins.length >= WINS_TO_FIX) {
        list.splice(at, 1);
        all.mistakesFixed = fixedCount(all) + 1;
        outcome = 'fixed';
      } else {
        list[at] = { ...m, wins, last: today };
      }
    } else {
      list[at] = { ...m, wins: [], last: today, misses: m.misses + 1, given: clip(given, 80) || m.given };
    }
    all.mistakes = list;
  });
  return outcome;
}

/**
 * Esta bien escrita la respuesta? Vale la buena o cualquiera de `accept`.
 * @param {Mistake} mistake @param {string} typed
 */
export function isRightAnswer(mistake, typed) {
  const got = normaliseAnswer(typed);
  return [mistake.answer, ...mistake.accept].some((a) => normaliseAnswer(a) === got);
}

/**
 * Para el profesor: los errores que mas ninos tienen pendientes a la vez
 * (la misma pregunta), de mas a menos.
 * @param {{ name: string, data: any }[]} children
 * @param {number} [limit]
 * @returns {{ mistake: Mistake, names: string[] }[]}
 */
export function classMistakes(children, limit = 8) {
  /** @type {Map<string, { mistake: Mistake, names: string[] }>} */
  const byKey = new Map();
  for (const child of children) {
    for (const m of mistakesOf(child.data)) {
      const entry = byKey.get(m.key) ?? { mistake: m, names: [] };
      if (!entry.names.includes(child.name)) entry.names.push(child.name);
      byKey.set(m.key, entry);
    }
  }
  return [...byKey.values()]
    .sort((a, b) => (b.names.length - a.names.length) || (b.mistake.misses - a.mistake.misses) || a.mistake.key.localeCompare(b.mistake.key))
    .slice(0, limit);
}

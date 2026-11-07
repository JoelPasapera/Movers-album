// @ts-check
// Lo que cada nino confunde AL OIDO en la parte 2 de Listening: las letras de
// un nombre deletreado y los numeros que suenan casi igual (thirteen y thirty,
// fourteen y forty...).
//
// Por cada letra (A-Z) y por cada uno de esos numeros se guarda cuantas veces
// se oyo bien (r) y cuantas mal (w). El dictado de letras y numeros elige mas
// lo que mas se falla, y el informe del profesor lo ensena.
//
// Solo cuenta lo que se oyo: si un nino escribe algo que no se parece en nada
// a lo dictado (otra palabra, el teclado al azar) no se apunta nada, porque
// eso no dice que letra confunde.

import * as state from '../core/state.js';

/** @typedef {{ r: number, w: number }} HeardEntry */

/** Las letras, cada una por su nombre en mayuscula. */
export const LETTER_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Los numeros que se confunden de dos en dos: del 13 al 19 y sus decenas. */
const TEENS = [13, 14, 15, 16, 17, 18, 19];

/** El otro numero de la pareja: 14 → 40, 40 → 14. @type {Map<number, number>} */
const TWINS = new Map(TEENS.flatMap((n) => [[n, (n - 10) * 10], [(n - 10) * 10, n]]));

/** @param {number} n @returns {number | null} */
export const twinOf = (n) => TWINS.get(n) ?? null;

/** Los numeros de las parejas, como claves: '13'...'19', '30'...'90'. */
export const NUMBER_KEYS = [...TWINS.keys()].sort((a, b) => a - b).map(String);

const KEYS = new Set([...LETTER_KEYS, ...NUMBER_KEYS]);

/** @param {string} k */
export const isHeardKey = (k) => KEYS.has(k);

/** @returns {Record<string, HeardEntry>} */
const book = () => /** @type {any} */ (state.get()).letters ?? {};

/**
 * Apunta lo que se oyo: una letra o un numero de pareja, bien o mal.
 * @param {string[]} keys @param {boolean[]} oks la misma longitud que keys
 */
export function heardAll(keys, oks) {
  const pairs = keys.map((k, i) => /** @type {[string, boolean]} */ ([k, oks[i]])).filter(([k]) => isHeardKey(k));
  if (!pairs.length) return;
  state.update((s) => {
    const all = /** @type {any} */ (s);
    if (!all.letters) all.letters = {};
    for (const [k, ok] of pairs) {
      const e = Object.hasOwn(all.letters, k) ? all.letters[k] : { r: 0, w: 0 };
      if (ok) e.r += 1; else e.w += 1;
      all.letters[k] = e;
    }
  });
}

/**
 * Lo que se falla de una letra o un numero, entre 0 y 1. Con pocos intentos
 * cuenta poco (dos aciertos imaginarios de partida).
 * @param {string} k @param {Record<string, HeardEntry>} [data]
 */
export function missRate(k, data = book()) {
  const e = Object.hasOwn(data, k) ? data[k] : null;
  return e ? e.w / (e.r + e.w + 2) : 0;
}

/** Fallos que hacen falta para decir que algo se confunde (no es un despiste). */
export const WEAK_MISSES = 2;
/** Y que proporcion de los intentos tienen que ser fallos. */
export const WEAK_RATE = 0.25;

/**
 * Lo que este nino confunde, de mas a menos: letras y numeros por separado.
 * @param {Record<string, HeardEntry>} [data] @param {number} [limit]
 * @returns {{ letters: string[], numbers: number[] }}
 */
export function weakSpots(data = book(), limit = 4) {
  const weak = Object.keys(data)
    .filter((k) => isHeardKey(k) && data[k].w >= WEAK_MISSES && missRate(k, data) >= WEAK_RATE)
    .sort((a, b) => (missRate(b, data) - missRate(a, data)) || (data[b].w - data[a].w) || a.localeCompare(b));
  return {
    letters: weak.filter((k) => LETTER_KEYS.includes(k)).slice(0, limit),
    numbers: weak.filter((k) => NUMBER_KEYS.includes(k)).map(Number).slice(0, limit),
  };
}

/** Lo guardado de este nino (para elegir el dictado). */
export const heardBook = () => book();

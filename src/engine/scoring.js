// @ts-check
// De notas a escudos, como en el examen.
//
// Una prueba entera (Listening sobre 25, Reading and Writing sobre 39) se
// convierte con la tabla de Cambridge (data/shield-table.js). Una parte o un
// juego, que tienen menos preguntas, con la misma tabla en proporcion: asi
// cinco escudos significan lo mismo en todas partes (no hace falta acertarlo
// todo: en Listening bastan 21 de 25).

import { SHIELD_TABLE, PART_CUTS } from '../data/shield-table.js';

export const MAX_SHIELDS = 5;

/**
 * Escudos de una nota sobre `total` (una parte, un juego): la tabla de
 * Cambridge en proporcion. Siempre al menos 1, como en el examen.
 * @param {number} correct @param {number} total
 */
export function shieldsFor(correct, total) {
  if (total <= 0) return 0;
  const ratio = correct / total;
  // Una milesima de margen: 21/25 tiene que dar lo mismo que la tabla aunque la
  // division no sea exacta.
  return 1 + PART_CUTS.filter((cut) => ratio >= cut - 1e-9).length;
}

/**
 * Escudos de una prueba entera. Si la nota es sobre el total de la prueba,
 * con la tabla de Cambridge tal cual; si no (una prueba de mentira en las
 * comprobaciones, una parte suelta), en proporcion.
 * @param {string} paperId 'listening' | 'reading' (otra, en proporcion)
 * @param {number} marks @param {number} total
 */
export function paperShields(paperId, marks, total) {
  const table = /** @type {Record<string, import('../data/shield-table.js').PaperCuts>} */ (SHIELD_TABLE)[paperId];
  if (!table || total !== table.outOf) return shieldsFor(marks, total);
  return 1 + table.cuts.filter((cut) => marks >= cut).length;
}

/**
 * La tabla de una prueba entera, para ensenarla: de 5 escudos a 1, la nota mas
 * baja y la mas alta de cada uno (5 escudos en Listening: de 21 a 25).
 * @param {'listening' | 'reading'} paperId
 * @returns {{ shields: number, from: number, to: number }[]}
 */
export function shieldRanges(paperId) {
  const { outOf, cuts } = SHIELD_TABLE[paperId];
  // 1 escudo desde 0; 2, desde el primer corte; y asi hasta 5.
  const starts = [0, ...cuts];
  return starts
    .map((from, i) => ({ shields: i + 1, from, to: i + 1 < starts.length ? starts[i + 1] - 1 : outOf }))
    .reverse();
}

/**
 * Cuanto le falta a una prueba entera: la nota del escudo siguiente y la de los
 * 5 (null si ya los tiene). Con la tabla de Cambridge, como paperShields.
 * @param {'listening' | 'reading'} paperId @param {number} marks
 * @returns {{ shields: number, nextAt: number | null, fiveAt: number }}
 */
export function marksToGo(paperId, marks) {
  const { outOf, cuts } = SHIELD_TABLE[paperId];
  const shields = paperShields(paperId, marks, outOf);
  const nextAt = cuts.find((cut) => cut > marks) ?? null;
  return { shields, nextAt, fiveAt: cuts[cuts.length - 1] };
}

/**
 * Lo que se le dice al nino con sus escudos. Cinco escudos ya no quiere decir
 * acertarlo todo (como en el examen), asi que no se dice.
 * @param {number} shields
 */
export function verdict(shields) {
  if (shields >= 5) return 'Fantastic! That is five shields.';
  if (shields === 4) return 'Really good. Almost five shields.';
  if (shields === 3) return 'Good work. Listen again for the small words.';
  if (shields === 2) return 'Nice try. Play it once more.';
  return 'Keep going. You get better every time.';
}

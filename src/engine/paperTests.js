// @ts-check
// Los examenes de practica en papel: los de muestra de Cambridge o los de un
// libro de practica, hechos en clase como el examen de verdad (que es en papel).
//
// El profesor apunta las notas de cada nino (Listening sobre 25, Reading and
// Writing sobre 39 y los escudos de Speaking, que salen de la escala) y la app
// las convierte en escudos con la tabla de Cambridge (data/shield-table.js), la
// misma que usa el simulacro, para que todo se pueda comparar. Y dice cuanto
// falta para los 5 escudos de cada prueba.
//
// Se guarda en el perfil del nino (`paperTests`, los veinte ultimos) y viaja
// en las copias como el resto (engine/backup.js).

import * as state from '../core/state.js';
import { localDate } from '../core/time.js';
import { PAPERS } from './mock.js';
import { paperShields, marksToGo, MAX_SHIELDS } from './scoring.js';

/**
 * @typedef {{ when: string, name: string, listening: number | null, reading: number | null, speaking: number | null }} PaperTest
 * @typedef {'listening' | 'reading' | 'speaking'} PaperId
 */

/** Cuantos se guardan por nino. */
export const PAPER_TESTS_KEPT = 20;

/** Las notas maximas de las pruebas que se puntuan con aciertos (las del examen). */
export const MARKS = /** @type {{ listening: number, reading: number }} */ (Object.fromEntries(
  PAPERS.filter((p) => p.marks > 0).map((p) => [p.id, p.marks]),
));

/** Las tres pruebas, en el orden del examen. */
export const PAPER_IDS = /** @type {PaperId[]} */ (PAPERS.map((p) => p.id));

const isDay = (/** @type {unknown} */ v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** @param {unknown} v @param {number} lo @param {number} hi @returns {number | null} */
const mark = (v, lo, hi) => (Number.isInteger(v) && /** @type {number} */ (v) >= lo && /** @type {number} */ (v) <= hi ? /** @type {number} */ (v) : null);

/**
 * Una entrada valida (o null): fecha, nombre corto, y al menos una prueba con
 * nota posible. Lo que no tiene sentido (31 sobre 25, 6 escudos) no entra.
 * @param {unknown} raw
 * @returns {PaperTest | null}
 */
export function cleanPaperTest(raw) {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = /** @type {any} */ (raw);
  if (!isDay(r.when)) return null;
  const test = {
    when: r.when,
    name: typeof r.name === 'string' ? r.name.trim().slice(0, 40) : '',
    listening: mark(r.listening, 0, MARKS.listening),
    reading: mark(r.reading, 0, MARKS.reading),
    speaking: mark(r.speaking, 1, MAX_SHIELDS),
  };
  return test.listening === null && test.reading === null && test.speaking === null ? null : test;
}

/** Los de un nino, del mas antiguo al mas nuevo. @param {any} [data] @returns {PaperTest[]} */
export function paperTests(data = state.get()) {
  const list = Array.isArray(data?.paperTests) ? data.paperTests : [];
  return list.map(cleanPaperTest).filter(Boolean)
    .sort((a, b) => /** @type {PaperTest} */ (a).when.localeCompare(/** @type {PaperTest} */ (b).when));
}

/**
 * Apunta un examen en el perfil activo. Devuelve lo guardado, o null si no hay
 * ninguna nota valida.
 * @param {{ when?: string, name?: string, listening?: number | null, reading?: number | null, speaking?: number | null }} entry
 * @returns {PaperTest | null}
 */
export function recordPaperTest(entry) {
  const test = cleanPaperTest({ ...entry, when: entry.when || localDate() });
  if (!test) return null;
  state.update((s) => {
    const all = /** @type {any} */ (s);
    all.paperTests = [...paperTests(all), test]
      .sort((a, b) => a.when.localeCompare(b.when))
      .slice(-PAPER_TESTS_KEPT);
  });
  return test;
}

/**
 * Quita una entrada (para corregir una nota mal apuntada).
 * @param {PaperTest} test
 */
export function removePaperTest(test) {
  const key = JSON.stringify(cleanPaperTest(test));
  state.update((s) => {
    const all = /** @type {any} */ (s);
    const list = paperTests(all);
    const at = list.map((t) => JSON.stringify(t)).lastIndexOf(key);
    if (at >= 0) list.splice(at, 1);
    all.paperTests = list;
  });
}

/**
 * Los escudos de cada prueba de un examen (null si esa prueba no se hizo) y
 * el total sobre lo que se hizo.
 * @param {PaperTest} test
 */
export function testShields(test) {
  const listening = test.listening === null ? null : paperShields('listening', test.listening, MARKS.listening);
  const reading = test.reading === null ? null : paperShields('reading', test.reading, MARKS.reading);
  const speaking = test.speaking;
  const done = [listening, reading, speaking].filter((n) => n !== null);
  return {
    listening, reading, speaking,
    total: done.reduce((a, n) => a + /** @type {number} */ (n), 0),
    outOf: done.length * MAX_SHIELDS,
  };
}

/**
 * Como va cada prueba en los examenes en papel: el ultimo resultado, los de
 * antes (para ver si sube) y cuanto falta para los 5 escudos.
 * @param {any} [data]
 * @returns {{ id: PaperId, label: string, shields: number[], last: { when: string, marks: number | null, shields: number } | null, toFive: number | null }[]}
 */
export function paperProgress(data = state.get()) {
  const list = paperTests(data);
  return PAPERS.map((p) => {
    const id = /** @type {PaperId} */ (p.id);
    const done = list.filter((t) => t[id] !== null);
    const shields = done.map((t) => /** @type {number} */ (testShields(t)[id]));
    const lastTest = done.at(-1);
    const marks = id === 'speaking' || !lastTest ? null : /** @type {number} */ (lastTest[id]);
    const toFive = marks === null || id === 'speaking' ? null
      : Math.max(0, marksToGo(/** @type {'listening' | 'reading'} */ (id), marks).fiveAt - marks);
    return {
      id,
      label: p.label,
      shields: shields.slice(-5),
      last: lastTest ? { when: lastTest.when, marks, shields: shields[shields.length - 1] } : null,
      toFive,
    };
  });
}

// @ts-check
// La tabla de Cambridge para pasar las notas de una prueba entera a escudos,
// para el profesor: junto a los examenes en papel (Class progress) y en las
// hojas del profesor del examen para imprimir. Los numeros salen de
// data/shield-table.js: si la tabla cambia, cambia aqui sola.

import { h } from '../../core/dom.js';
import { PAPERS } from '../../engine/mock.js';
import { shieldRanges, MAX_SHIELDS } from '../../engine/scoring.js';

/** "21–25", o "25" si el tramo es de una sola nota. @param {{ from: number, to: number }} range */
const rangeText = (range) => (range.from === range.to ? String(range.from) : `${range.from}–${range.to}`);

/** @param {number} n */
const shieldsLabel = (n) => `${n} shield${n === 1 ? '' : 's'}`;

/**
 * La tabla (Listening y Reading and Writing, de 5 escudos a 1) y la nota que
 * explica de donde sale y que pasa con Speaking.
 * @returns {HTMLElement}
 */
export function shieldTable() {
  const marked = PAPERS.filter((paper) => paper.marks > 0);
  const head = h('tr', {}, [
    h('th', {}, 'Marks'),
    ...Array.from({ length: MAX_SHIELDS }, (unused, i) => h('th', {}, shieldsLabel(MAX_SHIELDS - i))),
  ]);
  const rows = marked.map((paper) => h('tr', {}, [
    h('th', { scope: 'row' }, `${paper.label} (out of ${paper.marks})`),
    ...shieldRanges(/** @type {'listening' | 'reading'} */ (paper.id)).map((range) => h('td', {}, rangeText(range))),
  ]));
  return h('div', { class: 'shield-table' }, [
    h('table', { class: 'report-table' }, [h('thead', {}, head), h('tbody', {}, rows)]),
    h('p', { class: 'shield-table__note' },
      'Cambridge’s guide for practice tests. In the real test the marks for each shield can change a little from test to test. '
      + 'Speaking has no marks: the examiner uses the scale, and here the shields are the average band of the three.'),
  ]);
}

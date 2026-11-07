// @ts-check
// Panel del profesor: los examenes de practica en papel. Un formulario para
// apuntar las notas de cada nino y una tabla con el ultimo resultado de cada
// uno, si sube o baja, y cuanto le falta para los 5 escudos en cada prueba.
// La logica esta en engine/paperTests.js.

import { h } from '../core/dom.js';
import * as state from '../core/state.js';
import { localDate } from '../core/time.js';
import { latestMark } from '../engine/speakingScale.js';
import { MAX_SHIELDS, marksToGo } from '../engine/scoring.js';
import { shieldTable } from './components/shieldTable.js';
import {
  MARKS, recordPaperTest, removePaperTest, paperTests, testShields, paperProgress,
} from '../engine/paperTests.js';

/** @typedef {import('../engine/paperTests.js').PaperTest} PaperTest */

/**
 * Lo escrito en una casilla de nota: un entero entre 0 y max, '' si esta vacia
 * o NaN si no vale.
 * @param {HTMLInputElement} input @param {number} max
 * @returns {number | '' }
 */
function readMark(input, max) {
  const raw = input.value.trim();
  if (!raw) return '';
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : NaN;
}

/** "4 ↑" si sube respecto al anterior, "↓" si baja. @param {number[]} list */
function trend(list) {
  if (list.length < 2) return '';
  const [before, now] = list.slice(-2);
  return now > before ? ' ↑' : now < before ? ' ↓' : '';
}

/**
 * @param {{ list: { id: string, name: string }[], activeId: string | null, onChange: () => void }} o
 *   list: los alumnos; activeId: el perfil cargado (se vuelve a el); onChange:
 *   repintar el panel despues de guardar o borrar
 */
export function paperTestsPanel({ list, activeId, onChange }) {
  /** Lee el album de otro alumno y vuelve al activo. @template T @param {string} id @param {(data: any) => T} read @returns {T} */
  const readOf = (id, read) => {
    state.useProfile(id);
    const out = read(state.get());
    state.useProfile(activeId);
    return out;
  };

  const child = h('select', { class: 'teacher-select', 'aria-label': 'Child' }, list.map((p) => h('option', { value: p.id }, p.name)));
  const when = h('input', { class: 'teacher-select', type: 'date', value: localDate(), 'aria-label': 'Date of the test' });
  const name = h('input', {
    class: 'teacher-select paper-name', type: 'text', maxlength: '40', placeholder: 'Which test? (e.g. Sample test 1)', 'aria-label': 'Which test',
  });
  const markInput = (label, max) => h('input', {
    class: 'teacher-select paper-mark', type: 'number', min: '0', max: String(max), step: '1', inputmode: 'numeric', 'aria-label': `${label}, out of ${max}`,
  });
  const listening = markInput('Listening', MARKS.listening);
  const reading = markInput('Reading and Writing', MARKS.reading);
  const speaking = h('select', { class: 'teacher-select', 'aria-label': 'Speaking shields' }, [
    h('option', { value: '' }, '–'),
    ...Array.from({ length: MAX_SHIELDS }, (unused, i) => h('option', { value: String(i + 1) }, String(i + 1))),
  ]);
  const preview = h('p', { class: 'paper-preview', 'aria-live': 'polite' });
  const save = h('button', { class: 'btn btn--go', disabled: true }, 'Save results');

  /** Lo que hay escrito, ya leido; null si algo no vale o no hay nada. */
  function entry() {
    const l = readMark(listening, MARKS.listening);
    const r = readMark(reading, MARKS.reading);
    const s = speaking.value ? Number(speaking.value) : '';
    if (Number.isNaN(l) || Number.isNaN(r) || !/^\d{4}-\d{2}-\d{2}$/.test(when.value)) return null;
    if (l === '' && r === '' && s === '') return null;
    return {
      when: when.value, name: name.value, listening: l === '' ? null : l, reading: r === '' ? null : r, speaking: s === '' ? null : s,
    };
  }

  function refresh() {
    const l = readMark(listening, MARKS.listening);
    const r = readMark(reading, MARKS.reading);
    const e = entry();
    save.disabled = !e;
    if (Number.isNaN(l)) { preview.textContent = `Listening is marked out of ${MARKS.listening}.`; return; }
    if (Number.isNaN(r)) { preview.textContent = `Reading and Writing is marked out of ${MARKS.reading}.`; return; }
    if (!e) { preview.textContent = 'Write at least one mark.'; return; }
    const s = testShields(/** @type {PaperTest} */ (e));
    /** "3 shields, 7 more marks for 5" @param {'listening' | 'reading'} id @param {number} marks @param {number} n */
    const withGoal = (id, marks, n) => {
      const toFive = marksToGo(id, marks).fiveAt - marks;
      return toFive > 0 ? `${n} shields, ${toFive} more mark${toFive === 1 ? '' : 's'} for 5` : `${n} shields`;
    };
    preview.textContent = [
      s.listening === null || e.listening === null ? '' : `Listening ${withGoal('listening', e.listening, s.listening)}`,
      s.reading === null || e.reading === null ? '' : `Reading and Writing ${withGoal('reading', e.reading, s.reading)}`,
      s.speaking === null ? '' : `Speaking ${s.speaking} shields`,
    ].filter(Boolean).join(' · ');
  }

  /** Si el profesor ya puntuo el Speaking de ese nino ese dia con la escala, se propone. */
  function suggestSpeaking() {
    const mark = readOf(child.value, (data) => latestMark(data));
    speaking.value = mark && mark.by === 'teacher' && mark.when === when.value ? String(mark.shields) : '';
    refresh();
  }

  for (const el of [listening, reading, name]) el.addEventListener('input', refresh);
  speaking.addEventListener('change', refresh);
  child.addEventListener('change', suggestSpeaking);
  when.addEventListener('change', suggestSpeaking);
  save.addEventListener('click', () => {
    const e = entry();
    if (!e) return;
    state.useProfile(child.value);
    recordPaperTest(e);
    state.useProfile(activeId);
    onChange();
  });

  const rows = list.map((p) => readOf(p.id, (data) => ({ profile: p, tests: paperTests(data), progress: paperProgress(data) })))
    .filter((row) => row.tests.length);

  /** @param {ReturnType<typeof paperProgress>[number]} line */
  const paperCell = (line) => {
    if (!line.last) return h('td', { class: 'report-muted' }, '–');
    const marks = line.last.marks === null ? '' : `${line.last.marks}/${MARKS[/** @type {'listening' | 'reading'} */ (line.id)]} · `;
    return h('td', { class: `sh sh--${line.last.shields}` }, `${marks}${line.last.shields}/5${trend(line.shields)}`);
  };

  /** @param {ReturnType<typeof paperProgress>} progress */
  const toFive = (progress) => {
    const gaps = progress.filter((p) => p.toFive)
      .map((p) => `${p.id === 'listening' ? 'Listening' : 'R&W'} +${p.toFive} mark${p.toFive === 1 ? '' : 's'}`);
    const speaking = progress.find((p) => p.id === 'speaking' && p.last && p.last.shields < MAX_SHIELDS);
    if (speaking?.last) {
      const more = MAX_SHIELDS - speaking.last.shields;
      gaps.push(`Speaking +${more} shield${more === 1 ? '' : 's'}`);
    }
    return gaps.length ? gaps.join(' · ') : '5 in every paper';
  };

  const panel = h('div', { class: 'scale-form paper-form' }, [
    h('h3', {}, 'Practice tests on paper'),
    h('p', { class: 'bank-hint' },
      'The real test is on paper. After a practice test in class (a Cambridge sample test or one from a book), '
      + `write each child’s marks: Listening out of ${MARKS.listening}, Reading and Writing out of ${MARKS.reading}, `
      + 'and the Speaking shields from the scale above. The app turns the marks into shields with Cambridge’s table, '
      + 'the same one the mock test uses:'),
    shieldTable(),
    h('div', { class: 'paper-row' }, [
      h('label', {}, ['Child ', child]),
      h('label', {}, ['Date ', when]),
      h('label', { class: 'paper-grow' }, ['Test ', name]),
    ]),
    h('div', { class: 'paper-row' }, [
      h('label', {}, ['Listening ', listening, ` / ${MARKS.listening}`]),
      h('label', {}, ['Reading and Writing ', reading, ` / ${MARKS.reading}`]),
      h('label', {}, ['Speaking ', speaking, ' shields']),
    ]),
    preview,
    h('div', { class: 'result__actions' }, save),
    rows.length ? h('div', { class: 'teacher-scroll' }, h('table', { class: 'teacher paper-summary' }, [
      h('thead', {}, h('tr', {}, [
        h('th', {}, 'Name'), h('th', {}, 'Last test'), h('th', {}, 'Listening'), h('th', {}, 'Reading and Writing'),
        h('th', {}, 'Speaking'), h('th', { title: 'Marks still needed for 5 shields in each paper, from the last test' }, 'To get 5 shields'), h('th', {}, ''),
      ])),
      h('tbody', {}, rows.map((row) => {
        const last = /** @type {PaperTest} */ (row.tests.at(-1));
        return h('tr', {}, [
          h('td', {}, h('b', {}, row.profile.name)),
          h('td', {}, `${last.when}${last.name ? ` · ${last.name}` : ''}`),
          ...row.progress.map(paperCell),
          h('td', { class: 'weak' }, toFive(row.progress)),
          h('td', {}, h('button', {
            class: 'btn btn--ghost',
            title: 'Delete the last test of this child (to fix a mistake)',
            onClick: () => {
              // eslint-disable-next-line no-alert
              if (!window.confirm(`Delete the test of ${last.when} for ${row.profile.name}?`)) return;
              state.useProfile(row.profile.id);
              removePaperTest(last);
              state.useProfile(activeId);
              onChange();
            },
          }, 'Delete last')),
        ]);
      })),
    ])) : null,
  ]);
  suggestSpeaking();
  return panel;
}

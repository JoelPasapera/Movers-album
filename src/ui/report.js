// @ts-check
// Informe imprimible de un alumno, para las familias. Una hoja: lo que sabe,
// como va cada parte del examen, la escala de Speaking, los simulacros y
// que practicar en casa. Se imprime con el boton o con Ctrl+P; print.css
// quita todo lo que no es el informe.

import { h, mount as fill } from '../core/dom.js';
import { reportFor, READY_AT, HOME_TIPS } from '../engine/report.js';
import { SPEAKING_SCALE } from '../data/speaking-scale.js';
import { PAPERS } from '../engine/mock.js';
import { MAX_SHIELDS, marksToGo } from '../engine/scoring.js';
import * as router from '../core/router.js';
import { saveBackup } from './backup.js';
import { testShields, MARKS } from '../engine/paperTests.js';

/** @typedef {import('../engine/report.js').Report} Report */
/** @typedef {import('../engine/report.js').PartLine} PartLine */

const STATUS_TEXT = {
  ready: 'Ready',
  nearly: 'Nearly there',
  practise: 'Needs practice',
  new: 'Not tried yet',
};

/** @param {number} n */
function shields(n) {
  return h('span', { class: 'report-shields', 'aria-label': `${n} of ${MAX_SHIELDS} shields` },
    Array.from({ length: MAX_SHIELDS }, (unused, i) => h('i', { class: i < n ? 'is-on' : '' })));
}

/** @param {Report} report */
function summary(report) {
  const box = (big, small) => h('div', { class: 'report-box' }, [h('b', {}, big), h('span', {}, small)]);
  const ready = report.parts.filter((p) => p.status === 'ready').length;
  return h('div', { class: 'report-summary' }, [
    box(`${report.words.mastered}`, `of ${report.words.total} words known (${report.words.percent}%)`),
    box(`${ready}`, `of ${report.parts.length} test parts ready`),
    box(`${report.shields.shields}`, `of ${report.shields.outOf} shields`),
    box(`${report.streak}`, report.streak === 1 ? 'day in a row' : 'days in a row'),
  ]);
}

/** @param {Report} report */
function partsTable(report) {
  const byPaper = PAPERS.map((paper) => ({
    label: paper.label,
    lines: paper.parts.map((id) => report.parts.find((p) => p.id === id)).filter(Boolean),
  }));
  return h('table', { class: 'report-table' }, [
    h('thead', {}, h('tr', {}, [h('th', {}, 'Paper'), h('th', {}, 'Part'), h('th', {}, 'Shields'), h('th', {}, 'How it is going')])),
    h('tbody', {}, byPaper.flatMap(({ label, lines }) => lines.map((p, i) => h('tr', {}, [
      h('td', { class: 'report-paper' }, i === 0 ? label : ''),
      h('td', {}, [h('b', {}, p.title), h('small', {}, p.tag)]),
      h('td', {}, p.played ? shields(p.shields) : h('span', { class: 'report-muted' }, '–')),
      h('td', { class: `report-status report-status--${p.status}` }, STATUS_TEXT[p.status]),
    ])))),
  ]);
}

/** @param {Report} report */
function speakingBlock(report) {
  const mark = report.speaking;
  if (!mark) {
    return h('p', { class: 'report-muted' }, 'No speaking mark yet. The teacher marks speaking with the Cambridge scale after hearing the child talk.');
  }
  return h('div', {}, [
    h('div', { class: 'report-bands' }, SPEAKING_SCALE.map((c) => h('div', { class: 'report-band' }, [
      h('span', {}, c.label),
      h('b', {}, `${mark.bands[c.id]} / 5`),
    ]))),
    h('p', { class: 'report-small' },
      `${mark.by === 'teacher' ? 'Marked by the teacher' : 'The child’s own check'} on ${mark.when}.`
      + `${mark.note ? ` Note: ${mark.note}` : ''}`),
  ]);
}

/**
 * Como se pasa de notas a escudos en una prueba entera (simulacros y examenes
 * en papel): la tabla de Cambridge, con los numeros de data/shield-table.js.
 */
function tableNote() {
  const five = (/** @type {'listening' | 'reading'} */ id) => `${marksToGo(id, 0).fiveAt} of ${PAPERS.find((p) => p.id === id)?.marks}`;
  return h('p', { class: 'report-small' },
    `A whole paper gets its shields from Cambridge’s table for practice tests: 5 shields from ${five('listening')} in Listening `
    + `and from ${five('reading')} in Reading and Writing. Speaking has no marks: its shields come from the examiner’s scale.`);
}

/** @param {Report} report */
function mocksBlock(report) {
  if (!report.mocks.length) return h('p', { class: 'report-muted' }, 'No mock test finished yet.');
  const last = report.mocks.slice(-5);
  return h('table', { class: 'report-table report-table--mocks' }, [
    h('thead', {}, h('tr', {}, [h('th', {}, 'Date'), ...PAPERS.map((p) => h('th', {}, p.label)), h('th', {}, 'Total')])),
    h('tbody', {}, last.map((m) => h('tr', {}, [
      h('td', {}, m.when),
      ...PAPERS.map((p) => {
        const paper = m.papers.find((x) => x.id === p.id);
        if (!paper) return h('td', { class: 'report-muted' }, '–');
        return h('td', {}, [
          shields(paper.shields),
          paper.total ? h('small', {}, `${paper.score}/${paper.total}${paper.ranOut ? ' · time ran out' : ''}`) : null,
        ]);
      }),
      h('td', {}, h('b', {}, `${m.shields} / ${m.outOf}`)),
    ]))),
  ]);
}

/** @param {Report} report */
function practiseBlock(report) {
  if (!report.practise.length) {
    return h('p', {}, `Every part of the test has ${READY_AT} shields or more. Keep playing a little every day so nothing is forgotten.`);
  }
  return h('ol', { class: 'report-practise' }, report.practise.map((p) => h('li', {}, [
    h('b', {}, `${p.title} `),
    h('span', { class: 'report-small' }, `(${p.tag}) `),
    h('span', {}, HOME_TIPS[p.id] ?? 'Play this part again in the album.'),
  ])));
}

/**
 * Los examenes de practica en papel: los ultimos, con los escudos de cada
 * prueba, y cuanto falta para los 5.
 * @param {Report} report
 */
function paperBlock(report) {
  if (!report.paperTests.length) return h('p', { class: 'report-muted' }, 'No practice test on paper recorded yet.');
  const last = report.paperTests.slice(-5);
  /** @param {number | null} marks @param {number | null} n @param {number} [outOf] */
  const cell = (marks, n, outOf) => (n === null
    ? h('td', { class: 'report-muted' }, '–')
    : h('td', {}, [shields(n), marks === null ? null : h('small', {}, `${marks}/${outOf}`)]));
  const gaps = report.paperProgress.filter((p) => p.toFive).map((p) => `${p.label} ${p.toFive} more mark${p.toFive === 1 ? '' : 's'}`);
  return h('div', {}, [
    h('table', { class: 'report-table report-table--mocks' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'Date'), ...PAPERS.map((p) => h('th', {}, p.label)), h('th', {}, 'Total')])),
      h('tbody', {}, last.map((t) => {
        const s = testShields(t);
        return h('tr', {}, [
          h('td', {}, [t.when, t.name ? h('small', {}, t.name) : null]),
          cell(t.listening, s.listening, MARKS.listening),
          cell(t.reading, s.reading, MARKS.reading),
          cell(null, s.speaking),
          h('td', {}, h('b', {}, `${s.total} / ${s.outOf}`)),
        ]);
      })),
    ]),
    gaps.length ? h('p', { class: 'report-small' }, `For 5 shields in the last test it needed: ${gaps.join(', ')}.`) : null,
  ]);
}

/**
 * Las preguntas del cuaderno de errores que mas falla, con su respuesta, para
 * que la familia se las pregunte en casa. Nada si no tiene ninguna.
 * @param {Report} report
 */
function mistakesBlock(report) {
  if (!report.mistakes.length) return null;
  return h('div', { class: 'report-mistakes' }, [
    h('p', {}, [
      h('b', {}, 'Questions to go over at home: '),
      `${report.mistakesWaiting} question${report.mistakesWaiting === 1 ? '' : 's'} the child got wrong and has not fixed yet. `
      + 'Ask these out loud; the answer is after the arrow.',
    ]),
    h('ol', {}, report.mistakes.map((m) => h('li', {}, [m.prompt, ' \u2192 ', h('b', {}, m.answer)]))),
  ]);
}

/** "J, E and G" @param {string[]} list */
const listOf = (list) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list.join(''));

/**
 * Lo que confunde al oido (del dictado de letras y numeros), si hay algo.
 * @param {Report} report
 */
function hearingBlock(report) {
  const { letters, numbers } = report.hearing;
  if (!letters.length && !numbers.length) return null;
  const what = [
    letters.length ? `the letter${letters.length > 1 ? 's' : ''} ${listOf(letters)}` : '',
    numbers.length ? `numbers like ${numbers.map(([a, b]) => `${a} and ${b}`).join(', or ')}` : '',
  ].filter(Boolean).join(', and ');
  return h('p', { class: 'report-hearing' }, [
    h('b', {}, 'Listening for spelling: '),
    `when they are spoken, the child often mixes up ${what}. `
    + 'Spell names letter by letter for the child to write, and say those numbers for the child to write.',
  ]);
}

/** @param {Report} report */
function pagesBlock(report) {
  return h('div', { class: 'report-pages' }, report.pages.map((page) => {
    const pct = page.total ? Math.round((page.mastered / page.total) * 100) : 0;
    return h('div', { class: 'report-page' }, [
      h('span', {}, page.label),
      h('div', { class: 'report-bar' }, h('i', { style: `width:${pct}%` })),
      h('small', {}, `${page.mastered}/${page.total}`),
    ]);
  }));
}

/**
 * @param {HTMLElement} container
 * @param {string} profileId
 */
export function renderReport(container, profileId) {
  const report = reportFor(profileId);
  if (!report || !report.profile) {
    fill(container, h('div', { class: 'card' }, [
      h('h2', {}, 'No album with that name'),
      h('div', { style: 'margin-top:14px' }, h('button', { class: 'btn btn--go', onClick: () => router.go('/teacher') }, 'Back to class progress')),
    ]));
    return;
  }

  fill(container, h('div', { class: 'card report' }, [
    h('div', { class: 'game-head report-actions' }, [
      h('button', { class: 'btn', onClick: () => router.go('/teacher') }, '← Class progress'),
      h('div', { class: 'spacer' }),
      h('button', { class: 'btn', onClick: () => saveBackup([profileId]) }, 'Save this album'),
      h('button', { class: 'btn btn--go', onClick: () => window.print() }, 'Print'),
    ]),
    h('header', { class: 'report-head' }, [
      h('p', { class: 'report-kicker' }, 'My Movers album · progress report'),
      h('h2', {}, report.profile.name),
      h('p', {}, `Cambridge English A1 Movers practice · ${report.date}`),
    ]),
    summary(report),
    h('h3', { class: 'report-title' }, 'What to practise at home'),
    practiseBlock(report),
    hearingBlock(report),
    mistakesBlock(report),
    h('h3', { class: 'report-title' }, 'The test, part by part'),
    h('p', { class: 'report-small' }, `Shields show the best result in each part: ${READY_AT} or ${MAX_SHIELDS} means the child is ready for that part.`),
    partsTable(report),
    h('h3', { class: 'report-title' }, 'Speaking, with the examiner’s scale'),
    speakingBlock(report),
    h('h3', { class: 'report-title' }, 'Mock tests'),
    tableNote(),
    mocksBlock(report),
    h('h3', { class: 'report-title' }, 'Practice tests on paper'),
    paperBlock(report),
    h('h3', { class: 'report-title' }, 'Words known, page by page'),
    pagesBlock(report),
    h('footer', { class: 'report-foot' }, [
      h('p', {}, 'Teacher: ______________________________    Family: ______________________________'),
      h('p', { class: 'report-small' }, 'Original practice material built on the public A1 Movers syllabus. Not affiliated with Cambridge. All results live only on the device where the child plays.'),
    ]),
  ]));
}

// @ts-check
// Informe imprimible de un alumno, para las familias. Una hoja: lo que sabe,
// como va cada parte del examen, la escala de Speaking, los simulacros y
// que practicar en casa. Se imprime con el boton o con Ctrl+P; print.css
// quita todo lo que no es el informe.

import { h, mount as fill } from '../core/dom.js';
import { reportFor, READY_AT, HOME_TIPS } from '../engine/report.js';
import { SPEAKING_SCALE } from '../data/speaking-scale.js';
import { PAPERS } from '../engine/mock.js';
import { MAX_SHIELDS } from '../engine/scoring.js';
import * as router from '../core/router.js';

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
    h('h3', { class: 'report-title' }, 'The test, part by part'),
    h('p', { class: 'report-small' }, `Shields show the best result in each part: ${READY_AT} or ${MAX_SHIELDS} means the child is ready for that part.`),
    partsTable(report),
    h('h3', { class: 'report-title' }, 'Speaking, with the examiner’s scale'),
    speakingBlock(report),
    h('h3', { class: 'report-title' }, 'Mock tests'),
    mocksBlock(report),
    h('h3', { class: 'report-title' }, 'Words known, page by page'),
    pagesBlock(report),
    h('footer', { class: 'report-foot' }, [
      h('p', {}, 'Teacher: ______________________________    Family: ______________________________'),
      h('p', { class: 'report-small' }, 'Original practice material built on the public A1 Movers syllabus. Not affiliated with Cambridge. All results live only on the device where the child plays.'),
    ]),
  ]));
}

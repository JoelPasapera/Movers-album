// @ts-check
import { h, mount as fill } from '../core/dom.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import { GAMES } from '../games/registry.js';
import { TOPICS } from '../data/topics.js';
import { scalePicker } from './components/scalePicker.js';
import { latestMark, recordTeacherMark, shortBands } from '../engine/speakingScale.js';
import * as router from '../core/router.js';
import { backupPanel } from './backup.js';
import { paperTestsPanel } from './paperTests.js';
import { weakSpots, twinOf } from '../engine/letters.js';
import { mistakesOf, classMistakes } from '../engine/mistakes.js';
import { getGame } from '../games/registry.js';

// Panel para el profesor: en que parte del examen falla cada alumno, y la
// escala de Speaking del handbook para puntuar como lo hace el examinador.
/**
 * @param {HTMLElement} container
 * @param {string} [notice] mensaje que ensenar en la seccion de copias
 */
export function renderTeacher(container, notice = '') {
  const activeId = state.activeProfile();
  const playable = GAMES.filter((g) => g.ready);
  const rows = profiles.list().map((profile) => {
    state.useProfile(profile.id);
    const data = state.get();
    const stickers = TOPICS.reduce((total, t) => total + (data.stickers[t.id]?.length ?? 0), 0);
    const stickerTotal = TOPICS.reduce((total, t) => total + t.words.length, 0);
    return {
      profile,
      streak: data.streak ?? 0,
      stickers,
      stickerTotal,
      shields: playable.map((g) => data.shields[g.id] ?? 0),
      speaking: latestMark(data),
      mixes: weakSpots(/** @type {any} */ (data).letters ?? {}),
      mistakes: mistakesOf(data),
    };
  });
  state.useProfile(activeId);

  const weakest = (row) => {
    /** @type {number | null} */
    let worst = null;
    row.shields.forEach((value, i) => {
      if (worst === null || value < row.shields[worst]) worst = i;
    });
    return worst === null ? '\u2013' : playable[worst].tag;
  };

  // Lo que confunde al oido en el dictado de letras y numeros: "J G · 14/40".
  const mixesCell = (/** @type {{ letters: string[], numbers: number[] }} */ mixes) => {
    const parts = [
      mixes.letters.join(' '),
      mixes.numbers.map((n) => `${n}/${twinOf(n) ?? n}`).join(' '),
    ].filter(Boolean);
    return parts.length ? parts.join(' \u00b7 ') : '\u2013';
  };

  const speakingCell = (mark) => (mark
    ? h('span', { title: `${mark.by === 'teacher' ? 'Teacher\u2019s mark' : 'Own check'} \u00b7 ${mark.when}` },
      `${shortBands(mark.bands)} \u2192 ${mark.shields}/5${mark.by === 'self' ? ' (own)' : ''}`)
    : '\u2013');

  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'game-head' }, [
      h('button', { class: 'btn', onClick: () => router.go('/who') }, '\u2190 Back'),
      h('h2', {}, 'Class progress'),
      h('div', { class: 'spacer' }),
      h('button', {
        class: 'btn',
        title: 'Record the sentences of the games with your own voice',
        onClick: () => router.go('/voice'),
      }, 'Your voice'),
      h('button', {
        class: 'btn btn--go',
        title: 'Do the speaking test face to face with a child, like the examiner, and mark it with the scale',
        onClick: () => router.go('/examiner'),
      }, 'Speaking test'),
      h('button', {
        class: 'btn btn--go',
        title: 'A whole practice test to print, with the Listening to play and the answers',
        onClick: () => router.go('/print'),
      }, 'Print a practice test'),
    ]),
    rows.length
      ? h('div', { class: 'teacher-scroll' }, h('table', { class: 'teacher' }, [
        h('thead', {}, h('tr', {}, [
          h('th', {}, 'Name'),
          ...playable.map((g) => h('th', { title: g.tag }, g.title)),
          h('th', {}, 'Stickers'),
          h('th', {}, 'Streak'),
          h('th', { title: 'Vocabulary and grammar, Pronunciation, Interaction: 0 to 5 each' }, 'Speaking scale'),
          h('th', {}, 'Needs work'),
          h('th', { title: 'Letters and numbers the child often gets wrong when they are spoken (from Letters and numbers)' }, 'Mixes up'),
          h('th', { title: 'Mistakes waiting in Fix my mistakes: they come back on other days until the child gets each one right on two days' }, 'To fix'),
          h('th', {}, ''),
          h('th', {}, ''),
        ])),
        h('tbody', {}, rows.map((row) => h('tr', {}, [
          h('td', {}, h('b', {}, row.profile.name)),
          ...row.shields.map((value) => h('td', {
            class: `sh sh--${value}`,
          }, value ? `${value}/5` : '\u2013')),
          h('td', {}, `${row.stickers}/${row.stickerTotal}`),
          h('td', {}, String(row.streak)),
          h('td', {}, speakingCell(row.speaking)),
          h('td', { class: 'weak' }, weakest(row)),
          h('td', { class: 'mixes' }, mixesCell(row.mixes)),
          h('td', {}, row.mistakes.length ? String(row.mistakes.length) : '\u2013'),
          h('td', {}, h('button', {
            class: 'btn btn--ghost',
            title: 'A one-page report to print for the family',
            onClick: () => router.go(`/report/${row.profile.id}`),
          }, 'Report')),
          h('td', {}, h('button', {
            class: 'btn btn--ghost',
            onClick: () => {
              // eslint-disable-next-line no-alert
              if (window.confirm(`Delete ${row.profile.name} and their album?`)) {
                profiles.remove(row.profile.id);
                // Si era el album cargado, se descarga: si no, lo que se jugara
                // despues volveria a crear el album borrado.
                if (state.activeProfile() === row.profile.id) state.useProfile(null);
                renderTeacher(container);
              }
            },
          }, 'Delete')),
        ]))),
      ]))
      : h('p', {}, 'No albums yet.'),
    rows.length ? classMistakesPanel(rows.map((r) => ({ name: r.profile.name, data: { mistakes: r.mistakes } }))) : null,
    rows.length ? markingForm(container, rows.map((r) => r.profile), activeId) : null,
    rows.length ? paperTestsPanel({ list: rows.map((r) => r.profile), activeId, onChange: () => renderTeacher(container) }) : null,
    backupPanel({ onRestored: (message) => renderTeacher(container, message), notice }),
    h('p', { class: 'bank-hint' },
      'Everything is stored in this browser only. Nothing leaves the device.'),
  ]));
}

/**
 * Lo que la clase falla: las preguntas que mas ninos tienen pendientes en su
 * cuaderno de errores. Para volver a explicarlas en clase.
 * @param {{ name: string, data: any }[]} children
 */
function classMistakesPanel(children) {
  const top = classMistakes(children, 8);
  if (!top.length) return null;
  return h('div', { class: 'scale-form class-mistakes' }, [
    h('h3', {}, 'What the class gets wrong'),
    h('p', { class: 'bank-hint' },
      'The questions the children got wrong and have not fixed yet, the most common first. '
      + 'Each child sees them again in Fix my mistakes; going over them in class helps everyone.'),
    h('ol', { class: 'class-mistakes__list' }, top.map(({ mistake, names }) => h('li', {}, [
      h('span', {}, mistake.prompt),
      ' \u2192 ',
      h('b', {}, mistake.answer),
      h('small', {}, `${getGame(mistake.game)?.title ?? mistake.game} \u00b7 ${names.length === 1 ? '1 child' : `${names.length} children`}: ${names.join(', ')}`),
    ]))),
  ]);
}

// La escala del examinador (ui/components/scalePicker.js). Se puntua a un
// alumno despues de oirle hablar, y la nota manda sobre su autoevaluacion.
function markingForm(container, list, activeId) {
  const select = h('select', { class: 'teacher-select' }, list.map((p) => h('option', { value: p.id }, p.name)));
  const note = h('input', { class: 'teacher-note', type: 'text', maxlength: '200', placeholder: 'Note (optional): what to work on' });
  const save = h('button', { class: 'btn btn--go', disabled: true }, 'Save mark');
  const picker = scalePicker({ onChange: (complete) => { save.disabled = !complete; } });

  save.addEventListener('click', () => {
    state.useProfile(select.value);
    recordTeacherMark(picker.bands(), note.value);
    state.useProfile(activeId);
    renderTeacher(container);
  });

  return h('div', { class: 'scale-form' }, [
    h('h3', {}, 'Mark speaking with the Cambridge scale'),
    h('p', { class: 'bank-hint' },
      'For the whole test face to face, use \u201CSpeaking test\u201D at the top. '
      + 'Or listen to the child do a speaking task, then choose a band for each of the three things the examiner marks. '
      + 'Bands 5, 3 and 1 are described; 4 and 2 sit in between. If the child said only a couple of words, pronunciation gets 3 at most.'),
    h('label', { class: 'scale-who' }, ['Child: ', select]),
    picker.element,
    note,
    h('div', { class: 'result__actions' }, save),
  ]);
}

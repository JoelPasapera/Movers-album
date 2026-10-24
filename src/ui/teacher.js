import { h, mount as fill } from '../core/dom.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import { GAMES } from '../games/registry.js';
import { TOPICS } from '../data/topics.js';
import { SPEAKING_SCALE, BAND_MAX, BAND_NOTES } from '../data/speaking-scale.js';
import { latestMark, recordTeacherMark, shortBands } from '../engine/speakingScale.js';
import * as router from '../core/router.js';

// Panel para el profesor: en que parte del examen falla cada alumno, y la
// escala de Speaking del handbook para puntuar como lo hace el examinador.
export function renderTeacher(container) {
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
    };
  });
  state.useProfile(activeId);

  const weakest = (row) => {
    let worst = null;
    row.shields.forEach((value, i) => {
      if (worst === null || value < row.shields[worst]) worst = i;
    });
    return worst === null ? '\u2013' : playable[worst].tag;
  };

  const speakingCell = (mark) => (mark
    ? h('span', { title: `${mark.by === 'teacher' ? 'Teacher\u2019s mark' : 'Own check'} \u00b7 ${mark.when}` },
      `${shortBands(mark.bands)} \u2192 ${mark.shields}/5${mark.by === 'self' ? ' (own)' : ''}`)
    : '\u2013');

  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'game-head' }, [
      h('button', { class: 'btn', onClick: () => router.go('/who') }, '\u2190 Back'),
      h('h2', {}, 'Class progress'),
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
                renderTeacher(container);
              }
            },
          }, 'Delete')),
        ]))),
      ]))
      : h('p', {}, 'No albums yet.'),
    rows.length ? markingForm(container, rows.map((r) => r.profile), activeId) : null,
    h('p', { class: 'bank-hint' },
      'Everything is stored in this browser only. Nothing leaves the device.'),
  ]));
}

// La escala del examinador, tal cual: tres criterios de 0 a 5. Se puntua a un
// alumno despues de oirle hablar, y la nota manda sobre su autoevaluacion.
function markingForm(container, list, activeId) {
  const bands = {};
  const select = h('select', { class: 'teacher-select' }, list.map((p) => h('option', { value: p.id }, p.name)));
  const note = h('input', { class: 'teacher-note', type: 'text', maxlength: '200', placeholder: 'Note (optional): which task, what to work on' });
  const save = h('button', { class: 'btn btn--go', disabled: true }, 'Save mark');
  const bandText = (criterion, band) => criterion.bands[band] ?? BAND_NOTES[band];

  const blocks = SPEAKING_SCALE.map((criterion) => {
    const detail = h('p', { class: 'scale-detail' }, 'Pick a band to see what it means.');
    const buttons = [];
    for (let band = BAND_MAX; band >= 0; band -= 1) {
      buttons.push(h('button', {
        class: 'btn btn--ghost scale-band',
        'aria-pressed': 'false',
        onClick: (e) => {
          bands[criterion.id] = band;
          for (const b of buttons) b.setAttribute('aria-pressed', 'false');
          e.currentTarget.setAttribute('aria-pressed', 'true');
          detail.textContent = `${band}: ${bandText(criterion, band)}`;
          save.disabled = SPEAKING_SCALE.some((c) => bands[c.id] === undefined);
        },
      }, String(band)));
    }
    return h('div', { class: 'scale-block' }, [
      h('h3', {}, criterion.label),
      h('p', { class: 'scale-aspects' }, criterion.aspects.join(' \u00b7 ')),
      h('div', { class: 'scale-bands' }, buttons),
      detail,
    ]);
  });

  save.addEventListener('click', () => {
    state.useProfile(select.value);
    recordTeacherMark(bands, note.value);
    state.useProfile(activeId);
    renderTeacher(container);
  });

  return h('div', { class: 'scale-form' }, [
    h('h3', {}, 'Mark speaking with the Cambridge scale'),
    h('p', { class: 'bank-hint' },
      'Listen to the child do a speaking task, then choose a band for each of the three things the examiner marks. '
      + 'Bands 5, 3 and 1 are described; 4 and 2 sit in between. If the child said only a couple of words, pronunciation gets 3 at most.'),
    h('label', { class: 'scale-who' }, ['Child: ', select]),
    ...blocks,
    note,
    h('div', { class: 'result__actions' }, save),
  ]);
}

import { h, mount as fill } from '../core/dom.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import { GAMES } from '../games/registry.js';
import { TOPICS } from '../data/topics.js';
import * as router from '../core/router.js';

// Panel para el profesor: en que parte del examen falla cada alumno.
export function renderTeacher(container) {
  const activeId = profiles.currentId();
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
          h('th', {}, 'Needs work'),
          h('th', {}, ''),
        ])),
        h('tbody', {}, rows.map((row) => h('tr', {}, [
          h('td', {}, h('b', {}, row.profile.name)),
          ...row.shields.map((value) => h('td', {
            class: `sh sh--${value}`,
          }, value ? `${value}/5` : '\u2013')),
          h('td', {}, `${row.stickers}/${row.stickerTotal}`),
          h('td', {}, String(row.streak)),
          h('td', { class: 'weak' }, weakest(row)),
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
    h('p', { class: 'bank-hint' },
      'Everything is stored in this browser only. Nothing leaves the device.'),
  ]));
}

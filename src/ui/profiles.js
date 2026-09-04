import { h, mount as fill } from '../core/dom.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import * as router from '../core/router.js';

export function renderProfiles(container) {
  const input = h('input', {
    type: 'text',
    maxlength: '18',
    autocomplete: 'off',
    placeholder: 'your name',
    'aria-label': 'Your name',
  });
  const error = h('p', { class: 'spell-feedback' });

  function addProfile() {
    const name = input.value.trim();
    if (!name) {
      error.textContent = 'Write your name first.';
      error.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    const profile = profiles.add(name);
    state.useProfile(profile.id);
    router.go('/');
  }

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addProfile(); });
  input.addEventListener('input', () => { error.textContent = ''; });

  const existing = profiles.list();

  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'who' }, [
      h('h2', {}, 'Who is playing?'),
      existing.length
        ? h('div', { class: 'who__grid' }, existing.map((profile) => h('button', {
          class: 'who__card',
          onClick: () => {
            profiles.select(profile.id);
            state.useProfile(profile.id);
            router.go('/');
          },
        }, [
          h('span', { class: 'who__face' }, profile.name.slice(0, 1).toUpperCase()),
          h('b', {}, profile.name),
        ])))
        : h('p', {}, 'Nobody yet. Write your name and start your album.'),
      h('p', { class: 'tiles-label' }, 'Or start a new album'),
      h('div', { class: 'writer' }, [
        input,
        h('button', { class: 'btn btn--go', onClick: addProfile }, 'Start'),
      ]),
      error,
      existing.length
        ? h('div', { style: 'margin-top:18px' },
          h('button', { class: 'btn btn--ghost', onClick: () => router.go('/teacher') }, 'Teacher'))
        : null,
    ]),
  ]));
}

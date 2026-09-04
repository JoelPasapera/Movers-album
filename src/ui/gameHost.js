import { h, mount as fill } from '../core/dom.js';
import { getGame } from '../games/registry.js';
import * as router from '../core/router.js';

let active = null;

export function unmountActive() {
  if (active?.destroy) active.destroy();
  active = null;
}

export async function renderGame(container, gameId, topicId) {
  unmountActive();
  const game = getGame(gameId);
  if (!game?.ready || !game.load) {
    fill(container, h('div', { class: 'card' }, [
      h('h2', {}, 'This game is not ready yet'),
      h('p', {}, 'Pick another one from the album.'),
      h('div', { style: 'margin-top:14px' },
        h('button', { class: 'btn btn--go', onClick: () => router.go('/') }, 'Back to album')),
    ]));
    return;
  }
  fill(container, h('div', { class: 'card' }, h('p', {}, 'Loading\u2026')));
  try {
    const module = await game.load();
    active = module.mount(container, {
      topicId,
      onExit: () => router.go(`/topic/${topicId}`),
    });
  } catch (error) {
    console.error('[gameHost] could not start', gameId, error);
    fill(container, h('div', { class: 'card' }, [
      h('h2', {}, 'This game did not open'),
      h('p', {}, 'Something went wrong. Go back and try again.'),
      h('div', { style: 'margin-top:14px' },
        h('button', { class: 'btn btn--go', onClick: () => router.go(`/topic/${topicId}`) }, 'Back to album')),
    ]));
  }
}

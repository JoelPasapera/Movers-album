// @ts-check
import { h, mount as fill } from '../core/dom.js';
import { getGame } from '../games/registry.js';
import * as router from '../core/router.js';
import { setPageTitle } from './pageTitle.js';

let active = null;
/** Cada vez que se abre (o se deja) un juego, cambia: un juego que termina de
 * cargar cuando ya no se quiere no se monta. */
let ticket = 0;

export function unmountActive() {
  ticket += 1;
  if (active?.destroy) active.destroy();
  active = null;
}

// `extra` amplia el contexto del juego: { boardId } para jugar con las
// palabras de un tablero y `back` para volver a donde se abrio el juego.
export async function renderGame(container, gameId, topicId, extra = {}) {
  unmountActive();
  const back = extra.back ?? `/topic/${topicId}`;
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
  const mine = ticket;
  try {
    const module = await game.load();
    // Mientras cargaba, el nino se fue a otra pantalla (o abrio otro juego).
    if (mine !== ticket) return;
    active = module.mount(container, {
      ...extra,
      topicId,
      onExit: () => router.go(back),
    });
    setPageTitle(game.title);
  } catch (error) {
    console.error('[gameHost] could not start', gameId, error);
    fill(container, h('div', { class: 'card' }, [
      h('h2', {}, 'This game did not open'),
      h('p', {}, 'Something went wrong. Go back and try again.'),
      h('div', { style: 'margin-top:14px' },
        h('button', { class: 'btn btn--go', onClick: () => router.go(back) }, 'Back to album')),
    ]));
  }
}

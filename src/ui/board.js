// @ts-check
// Pagina de un tablero tematico: la lamina (sus palabras con el dibujo del
// album), el texto que la presenta leido en voz alta, las cuatro preguntas de
// "Let's talk!" y los tres juegos que se pueden jugar solo con ese tablero.

import { h, mount as fill } from '../core/dom.js';
import { BOARDS, BOARD_GAMES, getBoard } from '../data/boards.js';
import { getGame } from '../games/registry.js';
import { wordById, isMastered, progressOf } from '../engine/vocabulary.js';
import { speak, stop as stopVoice } from '../core/audio.js';
import * as router from '../core/router.js';

/** @param {import('../data/boards.js').Board} board */
function tileGrid(board) {
  return h('div', { class: 'grid grid--board' }, board.words.map((id) => {
    const entry = wordById(id);
    const word = entry?.word ?? id;
    const icon = entry?.icon ?? '';
    const known = isMastered(id);
    return h('div', {
      class: `cromo${known ? ' cromo--known' : ''}${icon ? '' : ' cromo--text'}`,
      style: entry?.tint ? `background:${entry.tint}` : null,
      title: known ? `${word} — you know this word` : word,
    }, [
      icon ? h('div', { class: 'face' }, icon) : null,
      h('b', {}, word),
      known ? h('span', { class: 'cromo__tick', 'aria-label': 'known' }, '✓') : null,
    ]);
  }));
}

/** @param {import('../data/boards.js').Board} board */
function talkList(board) {
  return h('ol', { class: 'board-talk' }, board.talk.map((q) => h('li', {}, [
    h('button', { class: 'btn btn--ghost board-talk__say', onClick: () => speak(q.say), 'aria-label': 'Hear the question' }, '\u{1F50A}'),
    h('span', {}, q.say),
  ])));
}

/** @param {import('../data/boards.js').Board} board */
function gameCards(board) {
  return h('div', { class: 'games' }, BOARD_GAMES.map(({ id, blurb }) => {
    const game = getGame(id);
    if (!game) return null;
    return h('button', {
      class: 'game-card',
      style: `background:var(--${game.colour})`,
      onClick: () => router.go(`/board/${board.id}/play/${id}`),
    }, [
      h('h3', {}, game.title),
      h('p', {}, blurb),
      h('span', { class: 'tag' }, board.title),
    ]);
  }));
}

function boardNav(activeId) {
  return h('nav', { class: 'tabs', 'aria-label': 'Picture boards' }, BOARDS.map((board) => {
    const p = progressOf(board.words);
    return h('button', {
      class: 'tab',
      'aria-selected': String(board.id === activeId),
      onClick: () => router.go(`/board/${board.id}`),
    }, [
      h('span', { class: 'dot', style: `background:var(--${board.colour})` }),
      board.title,
      h('small', {}, `${p.mastered}/${p.total}`),
    ]);
  }));
}

/**
 * @param {HTMLElement} container
 * @param {string} boardId
 */
export function renderBoard(container, boardId) {
  const board = getBoard(boardId);
  if (!board) {
    router.go('/');
    return;
  }
  const p = progressOf(board.words);
  const pct = p.total ? Math.round((p.mastered / p.total) * 100) : 0;

  fill(container, h('div', { class: 'layout' }, [
    boardNav(board.id),
    h('div', { class: 'card' }, [
      h('div', { class: 'album-head' }, [
        h('button', { class: 'btn', onClick: () => router.go('/') }, '← Album'),
        h('h2', {}, board.title),
        h('p', {}, `${p.mastered} of ${p.total} words known${p.mastered < p.total ? ` · ${p.total - p.mastered} to go` : ' · board complete!'}`),
      ]),
      h('div', { class: 'bar' }, h('i', { style: `width:${pct}%` })),
      h('div', { class: 'board-intro' }, [
        h('p', {}, board.intro),
        h('button', { class: 'btn btn--go', onClick: () => speak(board.intro) }, 'Read it to me'),
      ]),
      tileGrid(board),
      h('p', { class: 'games-label' }, 'Let’s talk! Four questions about this board'),
      talkList(board),
      h('p', { class: 'games-label' }, 'Play with the words on this board'),
      gameCards(board),
    ]),
  ]));
  return { destroy() { stopVoice(); } };
}

import { h, mount as fill } from '../core/dom.js';
import { TOPICS, getTopic } from '../data/topics.js';
import { BOARDS } from '../data/boards.js';
import { unlockedIds, topicProgress } from '../engine/progress.js';
import { isMastered, progress as vocabProgress, progressOf, wordById } from '../engine/vocabulary.js';
import { GAMES, PRACTICE } from '../games/registry.js';
import * as router from '../core/router.js';

function tabList(activeId) {
  return h('nav', { class: 'tabs', 'aria-label': 'Album topics' }, TOPICS.map((topic) => {
    const v = vocabProgress(topic.id);
    const have = Math.max(topicProgress(topic.id).have, v.mastered);
    const total = v.total;
    return h('button', {
      class: 'tab',
      'aria-selected': String(topic.id === activeId),
      onClick: () => router.go(`/topic/${topic.id}`),
    }, [
      h('span', { class: 'dot', style: `background:var(--${topic.colour})` }),
      topic.label,
      h('small', {}, `${have}/${total}`),
    ]);
  }));
}

function stickerGrid(topic) {
  const owned = new Set(unlockedIds(topic.id));
  return h('div', { class: 'grid' }, topic.words.map((word) => {
    // Se gana por dominar la palabra, o por los juegos de examen (modo antiguo).
    const has = isMastered(word.id) || owned.has(word.id);
    const plain = has && !word.icon;
    return h('div', {
      class: `cromo${has ? '' : ' cromo--locked'}${plain ? ' cromo--text' : ''}`,
      style: has ? `background:${topic.tint}` : null,
      title: has ? word.word : 'Locked',
    }, [
      plain ? null : h('div', { class: 'face' }, has ? word.icon : '\u{1F512}'),
      h('b', {}, word.word),
    ]);
  }));
}

function cardsFor(list, topicId) {
  return h('div', { class: 'games' }, list.map((game) => h('button', {
    class: `game-card${game.ready ? '' : ' game-card--soon'}`,
    style: `background:var(--${game.colour})`,
    disabled: !game.ready,
    onClick: () => game.ready && router.go(`/play/${game.id}/${topicId}`),
  }, [
    h('h3', {}, game.title),
    h('p', {}, game.blurb),
    h('span', { class: 'tag' }, game.ready ? game.tag : 'Coming soon'),
  ])));
}

const gameCards = (topicId) => cardsFor(GAMES, topicId);
const practiceCards = (topicId) => cardsFor(PRACTICE, topicId);

// Los ocho tableros tematicos: una escena, sus palabras y sus juegos.
function boardCards() {
  return h('div', { class: 'boards' }, BOARDS.map((board) => {
    const p = progressOf(board.words);
    return h('button', {
      class: 'board-card',
      style: `--board:var(--${board.colour})`,
      onClick: () => router.go(`/board/${board.id}`),
    }, [
      h('span', { class: 'board-card__icons' }, board.gaps.slice(0, 3).map((g) => h('span', {}, wordById(g.target)?.icon ?? ''))),
      h('h3', {}, board.title),
      h('p', {}, `${p.mastered} of ${p.total} words known`),
    ]);
  }));
}

export function renderAlbum(container, topicId) {
  const topic = getTopic(topicId);
  const vocab = vocabProgress(topic.id);
  const have = Math.max(topicProgress(topic.id).have, vocab.mastered);
  const total = vocab.total;
  const pct = total ? Math.round((have / total) * 100) : 0;

  fill(container, h('div', { class: 'layout' }, [
    tabList(topic.id),
    h('div', { class: 'card' }, [
      h('div', { class: 'album-head' }, [
        h('h2', {}, topic.label),
        h('p', {}, `${have} of ${total} words known${have < total ? ` \u00b7 ${total - have} to go` : ' \u00b7 page complete!'}`),
      ]),
      h('div', { class: 'bar' }, h('i', { style: `width:${pct}%` })),
      h('button', {
        class: 'mock-cta',
        onClick: () => router.go('/mock'),
      }, [
        h('b', {}, 'Mock test'),
        h('span', {}, 'The whole test, with the real clock. Try it when you feel ready.'),
      ]),
      stickerGrid(topic),
      h('p', { class: 'games-label' }, 'Picture boards: a scene, its words and three games'),
      boardCards(),
      h('p', { class: 'games-label' }, 'Practise the words on this page'),
      practiceCards(topic.id),
      h('p', { class: 'games-label' }, 'Practise the test, part by part'),
      gameCards(topic.id),
    ]),
  ]));
}

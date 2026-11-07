// @ts-check
import { h, mount as fill } from '../core/dom.js';
import { TOPICS, getTopic } from '../data/topics.js';
import { BOARDS } from '../data/boards.js';
import { unlockedIds, topicProgress } from '../engine/progress.js';
import { isMastered, progress as vocabProgress, progressOf, wordById } from '../engine/vocabulary.js';
import { GAMES, PRACTICE } from '../games/registry.js';
import * as router from '../core/router.js';
import { planCard } from './components/planCard.js';
import { dueMistakes, mistakesOf } from '../engine/mistakes.js';
import { tabNav, centreCurrent } from './components/tabNav.js';

/** @param {string} activeId */
function tabList(activeId) {
  return tabNav({
    label: 'Album topics',
    activeId,
    items: TOPICS.map((topic) => {
      const v = vocabProgress(topic.id);
      const have = Math.max(topicProgress(topic.id).have, v.mastered);
      return { id: topic.id, label: topic.label, colour: topic.colour, count: `${have}/${v.total}`, route: `/topic/${topic.id}` };
    }),
  });
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
    class: `game-card game-card--${game.colour}${game.ready ? '' : ' game-card--soon'}`,
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

/**
 * El boton del cuaderno de errores, si hay alguno pendiente: cuantos tocan hoy
 * o, si son todos de hoy, que vuelven manana.
 * @param {string} topicId
 */
function mistakesButton(topicId) {
  const pending = mistakesOf().length;
  if (!pending) return null;
  const due = dueMistakes().length;
  return h('button', {
    class: 'fix-cta',
    onClick: () => router.go(`/play/fixit/${topicId}`),
  }, [
    h('b', {}, 'Fix my mistakes'),
    h('span', {}, due
      ? `${due} mistake${due === 1 ? '' : 's'} from other days to fix today.`
      : `${pending} mistake${pending === 1 ? '' : 's'} from today. They come back tomorrow.`),
  ]);
}

export function renderAlbum(container, topicId) {
  const topic = getTopic(topicId);
  const vocab = vocabProgress(topic.id);
  const have = Math.max(topicProgress(topic.id).have, vocab.mastered);
  const total = vocab.total;
  const pct = total ? Math.round((have / total) * 100) : 0;

  const tabs = tabList(topic.id);
  fill(container, h('div', { class: 'layout' }, [
    tabs,
    h('div', { class: 'card' }, [
      h('div', { class: 'album-head' }, [
        h('h2', {}, topic.label),
        h('p', {}, `${have} of ${total} words known${have < total ? ` \u00b7 ${total - have} to go` : ' \u00b7 page complete!'}`),
      ]),
      h('div', { class: 'bar' }, h('i', { style: `width:${pct}%` })),
      planCard(),
      mistakesButton(topic.id),
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
  centreCurrent(tabs);
}

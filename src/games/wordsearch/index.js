import { h, mount as fill, qsa } from '../../core/dom.js';
import { cue, speak, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { buildGrid, matchSelection, cellsOf } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'wordsearch', title: 'Find the words' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let round = buildGrid(topic.id);
  let first = null;
  let found = new Set();
  let misses = 0;

  const counter = h('span', { class: 'counter' });
  const grid = h('div', { class: 'ws-grid' });
  const list = h('div', { class: 'ws-list' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Find the words'),
    h('span', { class: 'scene-label' }, topic.label),
    h('div', { class: 'spacer' }),
    counter,
  ]);

  const cellEl = (r, c) => grid.querySelector(`[data-r="${r}"][data-c="${c}"]`);

  function tap(r, c) {
    if (found.size >= round.words.length) return;
    if (!first) {
      first = { r, c };
      cellEl(r, c).classList.add('is-first');
      return;
    }
    const word = matchSelection(round, first, { r, c });
    cellEl(first.r, first.c).classList.remove('is-first');
    first = null;
    if (!word || found.has(word.word)) {
      misses += 1;
      cue('wrong');
      feedback.textContent = 'Not a word from the list. Tap the first letter, then the last.';
      feedback.className = 'spell-feedback spell-feedback--no';
      return;
    }
    found.add(word.word);
    cellsOf(word).forEach(({ r: rr, c: cc }) => cellEl(rr, cc).classList.add('is-found'));
    qsa('.ws-word', list).forEach((el) => { if (el.dataset.word === word.word) el.classList.add('is-found'); });
    counter.textContent = `${found.size} of ${round.words.length}`;
    feedback.textContent = `${word.word.toLowerCase()}!`;
    feedback.className = 'spell-feedback spell-feedback--ok';
    cue('correct');
    speak(word.word.toLowerCase());
    if (found.size >= round.words.length) setTimeout(finish, 900);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.words.length;
    const score = Math.max(0, total - Math.floor(misses / 3));
    const shields = shieldsFor(score, total);
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `All ${total} words found`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, misses
        ? `${misses} wrong taps. Look for the first letter of each word before you tap.`
        : 'Not one wrong tap.'),
      h('div', { class: 'review' }, round.words.map((w) => h('div', {}, w.word.toLowerCase()))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { round = buildGrid(topic.id); found = new Set(); misses = 0; first = null; build(); } }, 'New grid'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function build() {
    counter.textContent = `0 of ${round.words.length}`;
    fill(grid, ...round.grid.flatMap((row, r) => row.map((letter, c) => h('button', {
      class: 'ws-cell',
      dataset: { r: String(r), c: String(c) },
      onClick: () => tap(r, c),
    }, letter))));
    grid.style.gridTemplateColumns = `repeat(${round.grid.length}, 1fr)`;
    fill(list, ...round.words.map((w) => h('span', { class: 'ws-word', dataset: { word: w.word } }, w.word.toLowerCase())));
    fill(stage,
      h('p', { class: 'bank-hint' }, 'Find the words. Tap the first letter, then the last letter. Words go across, down or diagonal.'),
      list, grid, feedback);
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  return { destroy() { stopVoice(); } };
}

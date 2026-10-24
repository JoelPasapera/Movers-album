import { h, mount as fill, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomSet } from '../../data/matching.js';
import { buildRound, isMatch } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'matchpics', title: 'Listen and match' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let source = randomSet();
  let round = buildRound(source);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const leftCol = h('div', { class: 'match-left' });
  const cardGrid = h('div', { class: 'match-cards' });
  const prompt = h('p', { class: 'p6-prompt masked' });
  const stage = h('div');

  let masked = true;
  const maskToggle = h('button', {
    class: 'btn btn--ghost',
    onClick: () => {
      masked = !masked;
      prompt.classList.toggle('masked', masked);
      maskToggle.textContent = masked ? 'Show the words' : 'Hide the words';
    },
  }, 'Show the words');
  if (ctx.exam) maskToggle.classList.add('hidden');

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => {
      if (locked || playsLeft('q') <= 0) return;
      countPlay('q');
      countPlay('q');
      speak(round.questions[index].say);
      refreshPlays();
      refreshPlays();
    },
  }, 'Say it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Listen and match'),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  function refreshPlays() {
    const left = playsLeft('q');
    if (left === Infinity) return;
    sayAgain.textContent = left > 0 ? `Say it again (${left})` : 'No more plays';
    sayAgain.disabled = left <= 0;
  }

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'ok' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1600);
  }

  function stamp(left, letter, tone) {
    qsa('.match-item', leftCol).forEach((item) => {
      if (item.dataset.left !== left) return;
      const box = item.querySelector('.match-item__box');
      box.textContent = letter;
      box.classList.add(`is-${tone}`);
    });
  }

  function answer(letter) {
    if (locked) return;
    locked = true;
    const question = round.questions[index];
    const ok = isMatch(question, letter);
    if (ok) score += 1;
    answers.push({ question, ok, given: letter });
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'ok' : 'no', ok ? 'Yes!' : `It was ${question.letter}`);
    stamp(question.left, question.letter, ok ? 'ok' : 'no');
    qsa('.match-card', cardGrid).forEach((card) => {
      if (card.dataset.letter === question.letter) card.classList.add('is-right');
      else if (card.dataset.letter === letter && !ok) card.classList.add('is-wrong');
    });
    setTimeout(next, ok ? 950 : 1800);
  }

  function next() {
    index += 1;
    if (index >= round.questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const question = round.questions[index];
    counter.textContent = `${index + 1} of ${round.questions.length}`;
    prompt.textContent = question.say;
    prompt.classList.toggle('masked', masked);
    qsa('.match-card', cardGrid).forEach((c) => c.classList.remove('is-right', 'is-wrong'));
    qsa('.match-item', leftCol).forEach((item) => {
      item.classList.toggle('is-active', item.dataset.left === question.left);
    });
    speak(question.say);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.questions.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('matchpics', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, score);
    const spare = round.cards
      .filter((c) => c.letter !== round.example.letter
        && !round.questions.some((q) => q.letter === c.letter))
      .map((c) => c.letter).join(' and ');

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        `Pictures ${spare} were never the answer, but you still heard about them. `
        + 'That is why you have to listen to the whole sentence, not just one word.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.left} \u2014 ${a.question.letter} ${a.question.word}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New set'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    source = randomSet(source.id);
    round = buildRound(source);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    const items = [round.example, ...round.questions];
    fill(leftCol, h('h3', { class: 'match-left__title' }, round.leftLabel),
      ...items.map((item) => h('div', {
        class: 'match-item',
        dataset: { left: item.left },
      }, [
        h('span', {}, item.left),
        h('span', { class: 'match-item__box' }, '\u2026'),
      ])));

    fill(cardGrid, ...round.cards.map((card) => h('button', {
      class: 'match-card',
      dataset: { letter: card.letter },
      'aria-label': `picture ${card.letter}`,
      onClick: () => answer(card.letter),
    }, [
      h('span', { class: 'match-card__letter' }, card.letter),
      h('span', { class: 'match-card__face' }, card.icon),
    ])));

    fill(stage,
      h('p', { class: 'bank-hint' },
        `${round.intro} Seven pictures, five answers. Two pictures are never used.`),
      h('div', { class: 'match-pair' }, [leftCol, cardGrid]),
      h('div', { class: 'instruction instruction--clue' }, [prompt, sayAgain, maskToggle]));

    stamp(round.example.left, round.example.letter, 'example');
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}

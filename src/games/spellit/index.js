import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { definitionsFor, allDefinitions } from '../../data/definitions.js';
import { buildRound, checkAnswer, feedbackFor } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

export const meta = { id: 'spellit', title: 'Spell it' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  const pool = allDefinitions();
  let round = buildRound(definitionsFor(topic.id), pool);
  let index = 0;
  let locked = false;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const clueText = h('p');
  const bankGrid = h('div', { class: 'bank' });
  const input = h('input', {
    type: 'text',
    maxlength: '24',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'write the word here',
    'aria-label': 'Write the word',
  });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const readClue = h('button', {
    class: 'btn',
    onClick: () => !locked && speak(round.questions[index].clue),
  }, 'Read it to me');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Spell it'),
    h('span', { class: 'scene-label' }, topic.label),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  const submitBtn = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
  const writer = h('div', { class: 'writer' }, [input, submitBtn, readClue]);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submit();
  });
  input.addEventListener('input', () => {
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  function submit() {
    if (locked) return;
    const question = round.questions[index];
    const result = checkAnswer(question, input.value);

    if (result.kind === 'empty') {
      feedback.textContent = 'Write the word first.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }

    locked = true;
    const ok = result.kind === 'correct';
    answers.push({ question, ok, kind: result.kind });

    feedback.textContent = feedbackFor(result, question);
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'correct' : 'wrong', ok ? 'Yes!' : 'Look again');
    if (!ok) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 320);
    }

    Array.from(bankGrid.children).forEach((card) => {
      if (card.dataset.word === question.id) card.classList.add('is-right');
    });

    setTimeout(next, ok ? 1100 : 2400);
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
    clueText.textContent = question.clue;
    input.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    Array.from(bankGrid.children).forEach((card) => card.classList.remove('is-right'));
    speak(question.clue);
    setTimeout(() => input.focus(), 80);
  }

  function buildBank() {
    fill(bankGrid, ...round.bank.map((entry) => h('button', {
      class: 'bank-card',
      dataset: { word: entry.id },
      title: 'Tap to copy',
      onClick: () => {
        if (locked) return;
        input.value = entry.answer;
        input.focus();
      },
    }, [
      h('span', { class: 'bank-card__face' }, entry.icon),
      h('span', { class: 'bank-card__word' }, entry.answer),
    ])));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: round.questions.length });
    const shields = shieldsFor(correct, round.questions.length);
    recordShields('spellit', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, correct);

    const articleSlips = answers.filter(
      (a) => a.kind === 'missing-article' || a.kind === 'wrong-article',
    ).length;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === round.questions.length
        ? 'All correct!'
        : `${correct} out of ${round.questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      articleSlips
        ? h('p', { class: 'spell-tip' },
          `${articleSlips} of them were only about the little word in front. Copy the whole answer, "a" and all.`)
        : null,
      stickerBlock(topic, unlocked, correct),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.icon} ${a.question.answer}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    round = buildRound(definitionsFor(topic.id), pool);
    index = 0;
    answers.length = 0;
    build();
  }

  function build() {
    if (!round) {
      fill(root, h('div', { class: 'card' }, [
        h('h2', {}, 'No clues for this topic yet'),
        h('p', {}, 'Try Animals, Food, The town, The world, Health, Jobs, Clothes, Weather or Transport.'),
        h('div', { style: 'margin-top:14px' },
          h('button', { class: 'btn btn--go', onClick: () => ctx.onExit?.() }, 'Back to album')),
      ]));
      return;
    }
    buildBank();
    fill(stage,
      h('div', { class: 'instruction instruction--clue' }, clueText),
      writer,
      feedback,
      h('p', { class: 'bank-hint' }, 'Eight words, five clues. Three of them are not used.'),
      bankGrid);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
    },
  };
}

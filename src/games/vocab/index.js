import { h, mount as fill, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { buildRound, check } from './questions.js';
import { mark, progress, statusOf } from '../../engine/vocabulary.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'vocab', title: 'Word gym' };

const SIZE = 10;

export function mount(root, ctx = {}) {
  const topic = ctx.topicId ? getTopic(ctx.topicId) : null;
  let questions = buildRound({ size: SIZE, topicId: topic?.id ?? null });
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];
  const won = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const toastSlot = h('span');
  const prompt = h('p', { class: 'p6-prompt' });
  const board = h('div');
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const input = h('input', {
    type: 'text',
    maxlength: '24',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'write the word',
    'aria-label': 'Write the word you hear',
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitSpelling(); });
  input.addEventListener('input', () => {
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => !locked && speak(questions[index].say),
  }, 'Say it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Word gym'),
    topic ? h('span', { class: 'scene-label' }, topic.label) : null,
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
    toastSlot,
  ]);

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  function settle(ok, extra = '') {
    const question = questions[index];
    locked = true;
    if (ok) score += 1;
    const before = statusOf(question.word.id).mastered;
    const after = mark(question.word.id, ok);
    if (!before && after.mastered) won.push(question.word);
    answers.push({ question, ok });
    marksChip.textContent = `${score} / ${questions.length}`;
    cue(ok ? 'correct' : 'wrong');
    toast(ok, ok ? 'Yes!' : `It was "${question.word.word}"`);
    feedback.textContent = ok
      ? (after.mastered && !before ? `New sticker: ${question.word.word}` : 'Right.')
      : `${extra}The word is "${question.word.word}".`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    if (!ok) speak(question.word.word);
    setTimeout(next, ok ? 950 : 2000);
  }

  function submitSpelling() {
    if (locked) return;
    const question = questions[index];
    const result = check(question, input.value);
    if (result.kind === 'empty') {
      feedback.textContent = 'Write the word you hear.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    settle(result.ok);
  }

  function pickOption(id) {
    if (locked) return;
    const question = questions[index];
    const ok = check(question, id).ok;
    qsa('.gym-card', board).forEach((card) => {
      card.classList.add('is-done');
      if (card.dataset.id === question.word.id) card.classList.add('is-right');
      else if (card.dataset.id === id) card.classList.add('is-wrong');
    });
    settle(ok);
  }

  function render() {
    locked = false;
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    marksChip.textContent = `${score} / ${questions.length}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';

    if (question.kind === 'spell') {
      prompt.textContent = 'Listen and write the word.';
      fill(board, h('div', { class: 'writer' }, [
        input,
        h('button', { class: 'btn btn--go', onClick: submitSpelling }, 'Check'),
        sayAgain,
      ]));
      input.value = '';
      setTimeout(() => input.focus(), 80);
    } else if (question.kind === 'picture') {
      prompt.textContent = 'Listen and tap the right picture.';
      fill(board, h('div', { class: 'gym-grid' }, question.options.map((option) => h('button', {
        class: 'gym-card',
        dataset: { id: option.id },
        'aria-label': 'picture option',
        onClick: () => pickOption(option.id),
      }, [
        h('span', { class: 'gym-card__face' }, option.icon),
        h('span', { class: 'gym-card__word' }, option.word),
      ]))));
    } else {
      prompt.textContent = 'Listen and tap the word you hear.';
      fill(board, h('div', { class: 'gym-words' }, question.options.map((option) => h('button', {
        class: 'gym-card gym-card--text',
        dataset: { id: option.id },
        onClick: () => pickOption(option.id),
      }, option.word))));
    }
    speak(question.say);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function finish() {
    stopVoice();
    cue('finish');
    const shields = shieldsFor(score, questions.length);
    if (ctx.onFinish) return ctx.onFinish({ score, total: questions.length });
    state.touchStreak();
    const all = progress();
    const here = topic ? progress(topic.id) : null;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      won.length
        ? h('div', {}, [
          h('div', { class: 'result__stickers' }, won.map((word) => h('div', {
            class: 'cromo pop',
            style: `background:${word.tint};width:88px`,
          }, [
            word.icon ? h('div', { class: 'face' }, word.icon) : null,
            h('b', { style: word.icon ? null : 'font-size:17px' }, word.word),
          ]))),
          h('p', {}, `${won.length} new sticker${won.length > 1 ? 's' : ''} \u2014 you know ${won.length > 1 ? 'these words' : 'this word'} now.`),
        ])
        : h('p', {}, 'No new stickers yet. Get a word right twice and it is yours.'),
      h('p', { class: 'spell-tip' }, here
        ? `${here.mastered} of ${here.total} words on this page. ${all.mastered} of ${all.total} in the whole album.`
        : `${all.mastered} of ${all.total} words in the whole album.`),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.word.icon ? `${a.question.word.icon} ` : ''}${a.question.word.word}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Ten more words'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    questions = buildRound({ size: SIZE, topicId: topic?.id ?? null });
    index = 0;
    score = 0;
    answers.length = 0;
    won.length = 0;
    build();
  }

  function build() {
    const here = topic ? progress(topic.id) : progress();
    fill(stage,
      h('p', { class: 'bank-hint' },
        `Ten words. The ones you get wrong come back sooner. `
        + `${here.mastered} of ${here.total} known${topic ? ` on this page` : ''}.`),
      h('div', { class: 'instruction instruction--clue' }, [prompt, sayAgain]),
      board,
      feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}

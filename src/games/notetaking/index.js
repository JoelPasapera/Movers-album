import { h, mount as fill, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomForm } from '../../data/notes.js';
import { buildRound, checkRow, feedbackFor, marksFor } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'notetaking', title: 'Listen and write' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let source = randomForm();
  let round = buildRound(source);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const form = h('div', { class: 'note-form' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const input = h('input', {
    type: 'text',
    maxlength: '24',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    'aria-label': 'Write what you hear',
  });

  const submitBtn = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
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
    h('h2', {}, 'Listen and write'),
    h('span', { class: 'scene-label' }, round.title),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  input.addEventListener('input', () => {
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

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
    setTimeout(() => fill(toastSlot), 1500);
  }

  function submit() {
    if (locked) return;
    const row = round.questions[index];
    const result = checkRow(row, input.value);
    if (result.kind === 'empty') {
      feedback.textContent = 'Write what you hear.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    locked = true;
    const marks = marksFor(result);
    score += marks;
    answers.push({ row, value: input.value.trim(), marks, kind: result.kind });

    const slot = qsa('.note-gap', form)[round.rows.indexOf(row)];
    if (slot) {
      slot.textContent = row.answer;
      slot.classList.add(marks ? 'is-ok' : 'is-no');
    }

    feedback.textContent = feedbackFor(result, row);
    feedback.className = `spell-feedback spell-feedback--${marks ? 'ok' : 'no'}`;
    cue(marks ? 'correct' : 'wrong');
    toast(marks ? 'ok' : 'no', marks ? 'Yes!' : 'Listen again');
    setTimeout(next, marks ? 1200 : 2600);
  }

  function next() {
    index += 1;
    if (index >= round.questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const row = round.questions[index];
    counter.textContent = `${index + 1} of ${round.questions.length}`;
    input.value = '';
    input.placeholder = row.kind === 'number' ? 'write the number' : 'write the word';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    qsa('.note-row', form).forEach((el, i) => {
      el.classList.toggle('is-active', round.rows[i] === row);
    });
    speak(row.say);
    setTimeout(() => input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.questions.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('notetaking', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, score);
    const spelledMiss = answers.filter((a) => a.kind === 'spelledWrong').length;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, spelledMiss
        ? 'When they spell a name letter by letter, your spelling has to be perfect. '
          + 'Practise the alphabet, especially G and J.'
        : 'In this part some small spelling mistakes are allowed, but never in a name '
          + 'that was spelled out for you.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.marks ? '' : 'bad',
      }, [
        h('b', {}, a.marks ? '\u2713 ' : '\u2717 '),
        `${a.row.label} ${a.row.answer}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New notes'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    source = randomForm(source.id);
    round = buildRound(source);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(form, h('h3', { class: 'note-form__title' }, round.title),
      ...round.rows.map((row) => h('div', { class: 'note-row' }, [
        h('span', { class: 'note-row__label' }, row.label),
        h('span', {
          class: `note-gap${row.example ? ' is-example' : ''}`,
        }, row.example ? row.answer : '\u2026'),
      ])));

    fill(stage,
      h('p', { class: 'bank-hint' }, `${round.intro} Listen and fill in the notes. Five marks.`),
      form,
      h('div', { class: 'writer' }, [input, submitBtn, sayAgain]),
      feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}

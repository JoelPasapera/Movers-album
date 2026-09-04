import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { buildRound, check } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'sentence', title: 'Use the word' };

export function mount(root, ctx = {}) {
  let items = buildRound();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const target = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback' });
  const model = h('p', { class: 'talk-model hidden' });
  const stage = h('div');
  const input = h('input', {
    type: 'text', maxlength: '80', autocomplete: 'off', spellcheck: 'false',
    placeholder: 'write a sentence with the word', 'aria-label': 'Write a sentence',
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Use the word'),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  function submit() {
    if (locked) return;
    const item = items[index];
    const result = check(item, input.value);
    if (result.kind === 'empty') {
      feedback.textContent = result.note;
      feedback.className = 'spell-feedback spell-feedback--no';
      return;
    }
    locked = true;
    score += result.marks;
    answers.push({ item, text: input.value.trim(), marks: result.marks });
    marks.textContent = `${score} / ${items.length * 2}`;
    feedback.textContent = result.note;
    feedback.className = `spell-feedback spell-feedback--${result.marks === 2 ? 'ok' : 'no'}`;
    cue(result.marks === 2 ? 'correct' : 'wrong');
    fill(model, [h('b', {}, 'An example: '), item.model]);
    model.classList.remove('hidden');
    speak(item.model);
    setTimeout(next, result.marks === 2 ? 2200 : 3400);
  }

  function next() {
    index += 1;
    if (index >= items.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const item = items[index];
    counter.textContent = `${index + 1} of ${items.length}`;
    marks.textContent = `${score} / ${items.length * 2}`;
    fill(target, ['Write a sentence with the word ', h('b', { class: 'gap-slot is-active' }, item.word)]);
    input.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    model.classList.add('hidden');
    speak(item.word);
    setTimeout(() => input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = items.length * 2;
    const shields = shieldsFor(score, total);
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'These small words do not have pictures. The only way to learn them is to use them.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.marks === 2 ? '' : 'bad' }, [
        h('b', {}, `${a.marks}/2 `), `${a.item.word}: ${a.text}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { items = buildRound(); index = 0; score = 0; answers.length = 0; build(); } }, 'More words'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function build() {
    fill(stage,
      h('p', { class: 'bank-hint' }, 'Six words. Write your own sentence with each one. Two marks each.'),
      h('div', { class: 'instruction instruction--clue' }, target),
      h('div', { class: 'writer' }, [input, h('button', { class: 'btn btn--go', onClick: submit }, 'Check')]),
      feedback, model);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  return { destroy() { stopVoice(); } };
}

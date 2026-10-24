import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { buildRound, isCorrect } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'wordform', title: 'Add -ly and -ing' };

export function mount(root, ctx = {}) {
  const topic = ctx.topicId ? getTopic(ctx.topicId) : null;
  let questions = buildRound();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const sentence = h('p', { class: 'gap-text' });
  const options = h('div', { class: 'chat-options' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Add -ly and -ing'),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  function choose(value) {
    if (locked) return;
    locked = true;
    const question = questions[index];
    const ok = isCorrect(question, value);
    if (ok) score += 1;
    answers.push({ question, ok, value });
    marksChip.textContent = `${score} / ${questions.length}`;
    fill(sentence, question.before,
      h('span', { class: `gap-slot ${ok ? 'is-ok' : 'is-no'}` }, question.pair.formed),
      question.after);
    feedback.textContent = ok
      ? `Yes. ${question.rule}`
      : `It was "${question.pair.formed}". ${question.rule}`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    speak(`${question.before}${question.pair.formed}${question.after}`);
    setTimeout(next, ok ? 1600 : 3000);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    marksChip.textContent = `${score} / ${questions.length}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(sentence, question.before,
      h('span', { class: 'gap-slot is-active' }, '\u2026'), question.after);
    fill(options, ...question.options.map((word, i) => h('button', {
      class: 'chat-option',
      onClick: () => choose(word),
    }, [h('span', { class: 'chat-option__letter' }, 'ABCD'[i]), word])));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const shields = shieldsFor(score, questions.length);
    if (ctx.onFinish) return ctx.onFinish({ score, total: questions.length });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        'Two rules do most of the work: verbs ending in e lose the e before -ing, '
        + 'and short verbs double the last letter.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.pair.base} \u2192 ${a.question.pair.formed}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'More words'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    questions = buildRound();
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Put -ly or -ing at the end of the word and choose the right spelling.'),
      sentence, options, feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  void topic;
  return { destroy() { stopVoice(); } };
}

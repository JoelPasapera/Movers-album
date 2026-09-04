import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { renderScene } from '../../data/scenes/part6.js';
import { buildRound, isCorrect } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'yesno', title: 'Yes or no?' };

export function mount(root, ctx = {}) {
  const topic = ctx.topicId ? getTopic(ctx.topicId) : null;
  let round = buildRound();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const picture = h('div', { class: 'p6-picture' });
  const sentence = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Yes or no?'),
    h('span', { class: 'scene-label' }, round.scene.title),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  const buttons = h('div', { class: 'yesno-buttons' }, [
    h('button', { class: 'yesno-btn yesno-btn--yes', onClick: () => answer(true) }, 'yes'),
    h('button', { class: 'yesno-btn yesno-btn--no', onClick: () => answer(false) }, 'no'),
  ]);

  function answer(said) {
    if (locked) return;
    locked = true;
    const question = round.questions[index];
    const ok = isCorrect(question, said);
    if (ok) score += 1;
    answers.push({ question, ok, said });
    marksChip.textContent = `${score} / ${round.questions.length}`;
    feedback.textContent = ok
      ? 'Right. Look again at the picture before every sentence.'
      : `The answer is "${question.answer ? 'yes' : 'no'}". Look at the picture again.`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    setTimeout(next, ok ? 1000 : 2200);
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
    marksChip.textContent = `${score} / ${round.questions.length}`;
    sentence.textContent = question.text;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    speak(question.text);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const shields = shieldsFor(score, round.questions.length);
    if (ctx.onFinish) return ctx.onFinish({ score, total: round.questions.length });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${round.questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        'Every sentence is about this picture only. If you cannot see it, the answer is no.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, `${a.question.answer ? 'yes' : 'no'} `),
        a.question.text,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Another picture'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    round = buildRound();
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    picture.innerHTML = renderScene(round.scene);
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Look at the picture and read. Write yes or no. Here are two examples:'),
      picture,
      h('div', { class: 'yesno-examples' }, round.examples.map((ex) => h('div', {}, [
        h('b', {}, ex.answer ? 'yes ' : 'no  '),
        ex.text,
      ]))),
      h('div', { class: 'instruction instruction--clue' }, sentence),
      buttons,
      feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  void topic;
  return { destroy() { stopVoice(); } };
}

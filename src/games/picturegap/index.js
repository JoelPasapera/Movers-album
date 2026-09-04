import { h, mount as fill, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { buildRound, isCorrect } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'picturegap', title: 'What are they doing today?' };

export function mount(root, ctx = {}) {
  let round = buildRound();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const sentence = h('p', { class: 'p6-prompt' });
  const bank = h('div', { class: 'bank' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'What are they doing today?'),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  function choose(id) {
    if (locked) return;
    locked = true;
    const q = round.questions[index];
    const ok = isCorrect(q, id);
    if (ok) score += 1;
    answers.push({ q, ok });
    marks.textContent = `${score} / ${round.questions.length}`;
    qsa('.bank-card', bank).forEach((c) => {
      if (c.dataset.word === q.target) c.classList.add('is-right');
      else if (c.dataset.word === id) c.classList.add('is-wrong');
    });
    fill(sentence, ...q.text.split('___').flatMap((part, i, arr) => (
      i < arr.length - 1
        ? [part, h('span', { class: `gap-slot ${ok ? 'is-ok' : 'is-no'}` }, q.target)]
        : [part]
    )));
    feedback.textContent = ok ? 'Yes!' : `It was "${q.target}".`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    speak(q.text.replace('___', q.target));
    setTimeout(next, ok ? 1200 : 2400);
  }

  function next() {
    index += 1;
    if (index >= round.questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const q = round.questions[index];
    counter.textContent = `${index + 1} of ${round.questions.length}`;
    marks.textContent = `${score} / ${round.questions.length}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    qsa('.bank-card', bank).forEach((c) => c.classList.remove('is-right', 'is-wrong'));
    fill(sentence, ...q.text.split('___').flatMap((part, i, arr) => (
      i < arr.length - 1 ? [part, h('span', { class: 'gap-slot is-active' }, '\u2026')] : [part]
    )));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.questions.length;
    const shields = shieldsFor(score, total);
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'Read the whole sentence first. The words around the gap tell you what fits.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.ok ? '' : 'bad' }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '), a.q.text.replace('___', a.q.target),
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { round = buildRound(); index = 0; score = 0; answers.length = 0; build(); } }, 'More sentences'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function build() {
    fill(bank, ...round.cards.map((c) => h('button', {
      class: 'bank-card',
      dataset: { word: c.id },
      onClick: () => choose(c.id),
    }, [h('span', { class: 'bank-card__face' }, c.icon), h('span', { class: 'bank-card__word' }, c.word)])));
    fill(stage,
      h('p', { class: 'bank-hint' }, 'Read the sentence and tap the picture that fills the gap. Eight pictures, six sentences.'),
      h('div', { class: 'instruction instruction--clue' }, sentence),
      bank, feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  return { destroy() { stopVoice(); } };
}

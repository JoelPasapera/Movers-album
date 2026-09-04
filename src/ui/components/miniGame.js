// Esqueleto comun de los juegos de eleccion multiple: cabecera, contador,
// una pregunta cada vez, resultado final. Los seis juegos del picture book
// lo usan para no repetir el mismo codigo seis veces.

import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from './rewards.js';
import * as state from '../../core/state.js';

export function chooser(root, ctx, {
  id, title, hint, tip, build, renderPrompt, options, isRight, sayAfter, again = 'Play again',
}) {
  let questions = build();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const prompt = h('div', { class: 'instruction instruction--clue' });
  const grid = h('div', { class: 'chat-options' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, title),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  function choose(value) {
    if (locked) return;
    locked = true;
    const q = questions[index];
    const ok = isRight(q, value);
    if (ok) score += 1;
    answers.push({ q, ok, value });
    marks.textContent = `${score} / ${questions.length}`;
    feedback.textContent = ok ? 'Yes!' : `It was "${q.answer}".`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    if (sayAfter) speak(sayAfter(q));
    setTimeout(next, ok ? 1000 : 2200);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const q = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    marks.textContent = `${score} / ${questions.length}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(prompt, renderPrompt(q));
    fill(grid, ...options(q).map((value, i) => h('button', {
      class: 'chat-option',
      onClick: () => choose(value),
    }, [h('span', { class: 'chat-option__letter' }, 'ABCD'[i]), value])));
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
      tip ? h('p', { class: 'spell-tip' }, tip) : null,
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.ok ? '' : 'bad' }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        String(a.q.answer),
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', {
          class: 'btn btn--go',
          onClick: () => { questions = build(); index = 0; score = 0; answers.length = 0; start(); },
        }, again),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function start() {
    fill(stage, h('p', { class: 'bank-hint' }, hint), prompt, grid, feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  start();
  void id;
  return { destroy() { stopVoice(); } };
}

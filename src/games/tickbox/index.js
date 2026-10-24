import { h, mount as fill } from '../../core/dom.js';
import { speakLines, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { buildRound, isCorrect } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow } from '../../ui/components/rewards.js';

export const meta = { id: 'tickbox', title: 'Listen and tick' };

// Listening, parte 4: la pregunta, tres dibujos y un dialogo que nombra los
// tres. Igual que en el examen, cada dialogo suena entero y se elige al final.
export function mount(root, ctx = {}) {
  let questions = buildRound();
  let index = 0;
  let locked = false;
  let stopDialogue = null;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const questionLine = h('p');
  const grid = h('div', { class: 'tick-grid' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const again = h('button', {
    class: 'btn',
    onClick: () => {
      if (locked || playsLeft('q') <= 0) return;
      countPlay('q');
      play();
      updatePlays();
    },
  }, 'Play it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Listen and tick'),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  function updatePlays() {
    const left = playsLeft('q');
    if (left === Infinity) return;
    again.textContent = left > 0 ? `Play it again (${left})` : 'No more plays';
    again.disabled = left <= 0;
  }

  function play() {
    if (stopDialogue) stopDialogue();
    stopDialogue = speakLines(questions[index].lines);
  }

  function choose(option) {
    if (locked) return;
    locked = true;
    if (stopDialogue) stopDialogue();
    const q = questions[index];
    const ok = isCorrect(q, option.word);
    answers.push({ q, ok, chosen: option.word });
    marks.textContent = `${answers.filter((a) => a.ok).length} / ${questions.length}`;
    feedback.textContent = ok ? 'Yes!' : `It was ${q.answer}. Listen to the whole dialogue: they change their minds.`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    for (const card of grid.children) {
      if (card.dataset.word === q.answer) card.classList.add('is-right');
      if (card.dataset.word === option.word && !ok) card.classList.add('is-wrong');
    }
    setTimeout(next, ok ? 1100 : 2600);
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
    marks.textContent = `${answers.filter((a) => a.ok).length} / ${questions.length}`;
    questionLine.textContent = q.question;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(grid, ...q.options.map((option) => h('button', {
      class: 'bank-card',
      dataset: { word: option.word },
      onClick: () => choose(option),
    }, [
      h('span', { class: 'bank-card__letter' }, option.letter),
      h('span', { class: 'bank-card__face' }, option.icon),
      h('span', { class: 'bank-card__word' }, option.word),
    ])));
    countPlay('q');
    updatePlays();
    play();
  }

  function finish() {
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: questions.length });
    const shields = shieldsFor(correct, questions.length);
    recordShields('tickbox', shields);
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === questions.length ? 'All correct!' : `${correct} out of ${questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'In this part the speakers talk about all three pictures. The answer is the one they agree on at the end, so never tick after the first word you hear.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.ok ? '' : 'bad' }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.q.question} ${a.q.answer}${a.ok ? '' : ` (you chose ${a.chosen})`}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { questions = buildRound(); index = 0; answers.length = 0; start(); } }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function start() {
    fill(stage,
      h('p', { class: 'bank-hint' }, 'Listen to the whole dialogue, then tick the right picture. Five dialogues, one mark each.'),
      h('div', { class: 'instruction instruction--clue' }, questionLine),
      h('div', { class: 'writer' }, again),
      feedback,
      grid);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  start();
  return { destroy() { if (stopDialogue) stopDialogue(); stopVoice(); } };
}

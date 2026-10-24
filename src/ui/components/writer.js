// Esqueleto comun de los juegos de escribir una palabra con banco de dibujos:
// una pregunta cada vez, el nino escribe (o copia del banco), se corrige la
// ortografia exacta y al final hay resultado. Hermano de chooser() para los
// juegos de escribir, con el mismo aspecto que Spell it.

import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from './rewards.js';
import * as state from '../../core/state.js';

const normalise = (s) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!]+$/, '')
  .replace(/^(the|a|an|my) /, '');

function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return rows[a.length][b.length];
}

// Como en el examen: la palabra tiene que estar bien escrita. "Casi" se dice,
// pero no puntua.
export function checkSpelling(typed, answer) {
  const got = normalise(typed);
  const want = normalise(answer);
  if (!got) return { kind: 'empty' };
  if (got === want) return { kind: 'correct' };
  if (distance(got, want) <= 2) return { kind: 'spelling' };
  return { kind: 'wrong' };
}

export function speller(root, ctx, {
  id, title, hint, tip, build, renderPrompt, sayPrompt, answerOf, again = 'Play again',
}) {
  let round = build();
  let index = 0;
  let locked = false;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const prompt = h('div', { class: 'instruction instruction--clue' });
  const bank = h('div', { class: 'bank' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');
  const input = h('input', {
    type: 'text', maxlength: '24', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    placeholder: 'write the word here', 'aria-label': 'Write the word',
  });
  const check = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
  const again_ = h('button', { class: 'btn', onClick: () => !locked && speak(sayPrompt(round.questions[index])) }, 'Say it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, title),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  input.addEventListener('input', () => { feedback.textContent = ''; feedback.className = 'spell-feedback'; });

  function submit() {
    if (locked) return;
    const q = round.questions[index];
    const result = checkSpelling(input.value, answerOf(q));
    if (result.kind === 'empty') {
      feedback.textContent = 'Write the word first.';
      feedback.className = 'spell-feedback spell-feedback--no';
      return;
    }
    locked = true;
    const ok = result.kind === 'correct';
    answers.push({ q, ok, kind: result.kind });
    marks.textContent = `${answers.filter((a) => a.ok).length} / ${round.questions.length}`;
    feedback.textContent = ok ? 'Perfect!'
      : result.kind === 'spelling' ? `Right word, wrong spelling: ${answerOf(q)}` : `It was "${answerOf(q)}".`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    for (const card of bank.children) if (card.dataset.word === answerOf(q)) card.classList.add('is-right');
    speak(q.say ?? answerOf(q));
    setTimeout(next, ok ? 1100 : 2400);
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
    marks.textContent = `${answers.filter((a) => a.ok).length} / ${round.questions.length}`;
    input.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    for (const card of bank.children) card.classList.remove('is-right');
    fill(prompt, renderPrompt(q));
    speak(sayPrompt(q));
    setTimeout(() => input.focus(), 80);
  }

  function buildBank() {
    fill(bank, ...round.bank.map((entry) => h('button', {
      class: 'bank-card',
      dataset: { word: entry.answer },
      title: 'Tap to copy',
      onClick: () => { if (!locked) { input.value = entry.answer; input.focus(); } },
    }, [
      h('span', { class: 'bank-card__face' }, entry.icon || ''),
      h('span', { class: 'bank-card__word' }, entry.answer),
    ])));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: round.questions.length });
    const shields = shieldsFor(correct, round.questions.length);
    state.touchStreak();
    const slips = answers.filter((a) => a.kind === 'spelling').length;
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === round.questions.length ? 'All correct!' : `${correct} out of ${round.questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      slips ? h('p', { class: 'spell-tip' }, `${slips} of them were the right word with a spelling slip. In the test, spelling has to be perfect.`) : null,
      tip ? h('p', { class: 'spell-tip' }, tip) : null,
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.ok ? '' : 'bad' }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.q.icon ? `${a.q.icon} ` : ''}${a.q.say ?? answerOf(a.q)}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { round = build(); index = 0; answers.length = 0; start(); } }, again),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function start() {
    buildBank();
    fill(stage,
      h('p', { class: 'bank-hint' }, hint),
      prompt,
      h('div', { class: 'writer' }, [input, check, again_]),
      feedback,
      bank);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  start();
  void id;
  return { destroy() { stopVoice(); } };
}

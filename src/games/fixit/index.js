// @ts-check
// Fix my mistakes: las preguntas que el nino fallo en otros juegos vuelven
// otro dia, mezcladas (engine/mistakes.js).
//
// Como ensena: hay que sacar la respuesta de memoria (sin banco de palabras ni
// el resto del juego delante), y cada error vuelve en dias distintos hasta
// acertarlo dos veces. Al fallar se dice la respuesta y la regla (si el juego
// la sabe); un fallo de ortografia se corrige escribiendo la palabra otra vez.
// No entra en el simulacro: es entrenamiento.

import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getGame } from '../registry.js';
import {
  dueMistakes, mistakesOf, fixedCount, fixAttempt, isRightAnswer, FIX_ROUND, WINS_TO_FIX,
} from '../../engine/mistakes.js';
import { compareSpelling } from '../../engine/spelling.js';
import { spellingFix } from '../../ui/components/spellingFix.js';
import { practised } from '../../engine/progress.js';

/** @typedef {import('../../engine/mistakes.js').Mistake} Mistake */
/** @typedef {import('../../engine/mistakes.js').FixOutcome} FixOutcome */

export const meta = { id: 'fixit', title: 'Fix my mistakes' };

/** @param {string[]} list */
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Un fallo de escribir que es casi la palabra (una o dos letras): se corrige
 * con mira, tapa, escribe. Si es otra palabra, basta con ensenar la buena.
 * @param {string} typed @param {string} answer
 */
function nearlyRight(typed, answer) {
  const changes = compareSpelling(typed, answer).filter((s) => s.kind !== 'same').length;
  return changes > 0 && changes <= Math.max(2, Math.floor(answer.length / 3));
}

/** "1 mistake", "3 mistakes" @param {number} n */
const mistakesText = (n) => `${n} mistake${n === 1 ? '' : 's'}`;

/**
 * @param {HTMLElement} root
 * @param {{ topicId?: string | null, exam?: boolean, onExit?: () => void }} [ctx]
 */
export function mount(root, ctx = {}) {
  /** @type {Mistake[]} */
  let round = [];
  let index = 0;
  let locked = false;
  /** @type {{ mistake: Mistake, ok: boolean, outcome: FixOutcome }[]} */
  const results = [];

  const counter = h('span', { class: 'counter' });
  const from = h('p', { class: 'fixit-from' });
  const promptText = h('p', { class: 'p6-prompt fixit-prompt' });
  const hear = h('button', { class: 'btn', type: 'button', onClick: () => { const m = round[index]; if (m?.say) speak(m.say); } }, 'Listen again');
  const board = h('div');
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const fixSlot = h('div');
  const stage = h('div');
  const input = h('input', {
    type: 'text',
    maxlength: '40',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'write your answer',
    'aria-label': 'Write your answer',
  });
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') answerWritten(); });
  input.addEventListener('input', () => {
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '← Album'),
    h('h2', {}, meta.title),
    h('div', { class: 'spacer' }),
    counter,
  ]);

  /** Sin nada que arreglar hoy: lo que hay pendiente y cuando vuelve. */
  function renderEmpty() {
    const pending = mistakesOf().length;
    const fixed = fixedCount();
    counter.textContent = '';
    fill(stage, h('div', { class: 'fixit-empty' }, [
      h('p', { class: 'fixit-empty__big' }, pending
        ? `Your ${mistakesText(pending)} come back tomorrow.`
        : 'No mistakes to fix. Well done!'),
      h('p', {}, pending
        ? 'A mistake comes back on another day: that is when it helps you remember.'
        : 'When you get a question wrong in a game, it comes here the next day.'),
      fixed ? h('p', {}, `You have fixed ${mistakesText(fixed)} so far.`) : null,
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn', type: 'button', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function answerWritten() {
    if (locked) return;
    const typed = input.value;
    if (!typed.trim()) {
      feedback.textContent = 'Write your answer first.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    settle(isRightAnswer(round[index], typed), typed);
  }

  /** @param {string} option */
  function answerChosen(option) {
    if (locked) return;
    const mistake = round[index];
    for (const button of board.querySelectorAll('.chat-option')) {
      const value = /** @type {HTMLElement} */ (button).dataset.value;
      if (value === mistake.answer) button.classList.add('is-right');
      else if (value === option) button.classList.add('is-wrong');
    }
    settle(option === mistake.answer, option);
  }

  /**
   * Cierra una pregunta: la apunta en el cuaderno y dice como va.
   * @param {boolean} ok @param {string} given
   */
  function settle(ok, given) {
    locked = true;
    const mistake = round[index];
    const outcome = fixAttempt(mistake.key, ok, given);
    results.push({ mistake, ok, outcome });
    cue(ok ? 'correct' : 'wrong');
    feedback.textContent = ok
      ? (outcome === 'fixed' ? 'Yes! That one is fixed for good.' : `Yes! Get it right on ${WINS_TO_FIX === 2 ? 'one more day' : 'more days'} and it is fixed.`)
      : `It is “${mistake.answer}”.${mistake.why ? ` ${mistake.why}` : ''}`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    if (!ok && mistake.kind === 'write' && !ctx.exam && nearlyRight(given, mistake.answer)) {
      fill(board);
      fill(fixSlot, spellingFix({ typed: given, answer: mistake.answer, say: mistake.after || undefined, onDone: () => next() }));
      return;
    }
    if (mistake.after) speak(mistake.after);
    else if (!ok) speak(mistake.answer);
    setTimeout(next, ok ? 1400 : 3400);
  }

  function render() {
    locked = false;
    const mistake = round[index];
    counter.textContent = `${index + 1} of ${round.length}`;
    const game = getGame(mistake.game);
    from.textContent = `From “${game?.title ?? mistake.game}”${mistake.misses > 1 ? ` · missed ${mistake.misses} times` : ''}`;
    promptText.textContent = mistake.prompt;
    hear.classList.toggle('hidden', !mistake.say);
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(fixSlot);
    if (mistake.kind === 'write') {
      input.value = '';
      fill(board, h('div', { class: 'writer' }, [
        input,
        h('button', { class: 'btn btn--go', type: 'button', onClick: answerWritten }, 'Check'),
      ]));
      setTimeout(() => input.focus(), 80);
    } else {
      fill(board, h('div', { class: 'chat-options' }, shuffle(mistake.options).map((option, i) => h('button', {
        class: 'chat-option',
        type: 'button',
        dataset: { value: option },
        onClick: () => answerChosen(option),
      }, [h('span', { class: 'chat-option__letter' }, 'ABCD'[i]), option]))));
    }
    if (mistake.say) speak(mistake.say);
  }

  function next() {
    index += 1;
    if (index >= round.length) return finish();
    render();
  }

  function finish() {
    stopVoice();
    cue('finish');
    practised(meta.id);
    const right = results.filter((r) => r.ok).length;
    const fixedNow = results.filter((r) => r.outcome === 'fixed').length;
    counter.textContent = `${round.length} of ${round.length}`;
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${right} out of ${results.length}`),
      h('p', {}, fixedNow
        ? `${mistakesText(fixedNow)} fixed for good!`
        : right ? 'Good work. The ones you got right need one more day.' : 'Keep going. They come back tomorrow.'),
      h('p', { class: 'spell-tip' }, `A mistake is fixed when you get it right on ${WINS_TO_FIX} different days. `
        + `${fixedCount() ? `You have fixed ${mistakesText(fixedCount())} so far.` : ''}`),
      h('div', { class: 'review' }, results.map((r) => h('div', { class: r.ok ? '' : 'bad' }, [
        h('b', {}, r.ok ? '✓ ' : '✗ '),
        `${r.mistake.prompt} → ${r.mistake.answer}${r.outcome === 'fixed' ? ' (fixed)' : ''}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', type: 'button', onClick: start }, 'Fix more'),
        h('button', { class: 'btn', type: 'button', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function start() {
    round = dueMistakes().slice(0, FIX_ROUND);
    index = 0;
    results.length = 0;
    if (!round.length) {
      renderEmpty();
      return;
    }
    fill(stage,
      h('p', { class: 'bank-hint' }, `${mistakesText(round.length)} from other days. Get each one right on ${WINS_TO_FIX} different days and it is fixed.`),
      from,
      h('div', { class: 'instruction instruction--clue' }, [promptText, hear]),
      board,
      feedback,
      fixSlot);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  start();

  return { destroy() { stopVoice(); } };
}

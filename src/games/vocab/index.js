// @ts-check
// Word gym: las palabras del wordlist, con repaso espaciado.
//
// Como ensena (cada cosa tiene su porque):
//   - Una palabra nueva se presenta antes de preguntarla (dibujo, palabra y
//     voz) y se pregunta dos pasos despues: hay que recordarla, no adivinarla
//     ni copiarla.
//   - No mas de NEW_PER_ROUND palabras nuevas por ronda: con mas, se retienen
//     menos.
//   - Una palabra fallada vuelve unos pasos despues en la misma ronda, y un
//     fallo de ortografia se corrige en el momento (mira, tapa, escribe).
//   - Lo que se falla vuelve antes en las rondas siguientes (engine/vocabulary.js).

import { h, mount as fill, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { getBoard } from '../../data/boards.js';
import { buildRound, check, questionFor, sessionSteps, RETRY_GAP } from './questions.js';
import { mark, progress, progressOf, statusOf, NEW_PER_ROUND } from '../../engine/vocabulary.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import { spellingFix } from '../../ui/components/spellingFix.js';
import { practised } from '../../engine/progress.js';

/** @typedef {import('./questions.js').Step} Step */

export const meta = { id: 'vocab', title: 'Word gym' };

/** Palabras por ronda (puede salir menos si hay pocas que repasar y muchas nuevas). */
const SIZE = 10;

/**
 * @param {HTMLElement} root
 * @param {{ topicId?: string | null, boardId?: string, exam?: boolean, onExit?: () => void, onFinish?: (r: { score: number, total: number }) => void }} [ctx]
 */
export function mount(root, ctx = {}) {
  // Desde un tablero se entrenan solo sus palabras; desde el album, la pagina.
  const boardData = ctx.boardId ? getBoard(ctx.boardId) : null;
  const topic = !boardData && ctx.topicId ? getTopic(ctx.topicId) : null;
  const options = { size: SIZE, topicId: topic?.id ?? null, ids: boardData?.words ?? null, maxNew: NEW_PER_ROUND };

  /** Las preguntas de la ronda (una por palabra). @type {any[]} */
  let questions = [];
  /** El orden de la ronda: presentaciones, preguntas y segundas oportunidades. @type {Step[]} */
  let steps = [];
  let index = 0;
  let locked = false;
  /** Aciertos al primer intento (los reintentos no suman nota). */
  let score = 0;
  /** Preguntas contestadas por primera vez. */
  let firstTries = 0;
  /** @type {{ word: any, ok: boolean, fixed: boolean }[]} */
  const answers = [];
  /** @type {any[]} */
  const won = [];
  /** @type {any[]} */
  const met = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const toastSlot = h('span');
  const prompt = h('p', { class: 'p6-prompt' });
  const board = h('div');
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const fixSlot = h('div');
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

  /** Lo que se dice en el paso de ahora. */
  const sayNow = () => {
    const step = steps[index];
    return step.type === 'meet' ? step.word.word : step.question.say;
  };

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => !locked && speak(sayNow()),
  }, 'Say it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, boardData ? '← Board' : '← Album'),
    h('h2', {}, 'Word gym'),
    boardData ? h('span', { class: 'scene-label' }, boardData.title) : topic ? h('span', { class: 'scene-label' }, topic.label) : null,
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
    toastSlot,
  ]);

  /** @param {boolean} ok @param {string} message */
  function toast(ok, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${ok ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  /** "3 of 8": las preguntas contestadas por primera vez, sin contar reintentos. */
  function showCount() {
    const step = steps[index];
    counter.textContent = step?.type === 'meet' ? 'New word'
      : step?.type === 'test' && step.retry ? 'Try again'
        : `${Math.min(firstTries + 1, questions.length)} of ${questions.length}`;
    marksChip.textContent = `${score} / ${questions.length}`;
  }

  /**
   * Una palabra fallada vuelve RETRY_GAP pasos despues (una sola vez), con
   * opciones nuevas.
   * @param {any} word
   */
  function scheduleRetry(word) {
    const at = Math.min(index + 1 + RETRY_GAP, steps.length);
    steps.splice(at, 0, { type: 'test', question: questionFor(word), retry: true });
  }

  /**
   * Cierra una pregunta: nota, repaso de la palabra, mensaje y, si fallo,
   * segunda oportunidad.
   * @param {boolean} ok @param {string} [typed] lo que escribio (preguntas de escribir)
   */
  function settle(ok, typed) {
    const step = /** @type {{ type: 'test', question: any, retry: boolean }} */ (steps[index]);
    const question = step.question;
    locked = true;
    const before = statusOf(question.word.id).mastered;
    const after = mark(question.word.id, ok);
    if (!before && after.mastered) won.push(question.word);
    if (step.retry) {
      const first = answers.find((a) => a.word.id === question.word.id);
      if (first && ok) first.fixed = true;
    } else {
      firstTries += 1;
      if (ok) score += 1;
      answers.push({ word: question.word, ok, fixed: false });
      if (!ok) scheduleRetry(question.word);
    }
    marksChip.textContent = `${score} / ${questions.length}`;
    cue(ok ? 'correct' : 'wrong');
    toast(ok, ok ? 'Yes!' : `It was "${question.word.word}"`);
    feedback.textContent = ok
      ? (after.mastered && !before ? `New sticker: ${question.word.word}` : step.retry ? 'Yes! Now you know it.' : 'Right.')
      : `The word is "${question.word.word}".${step.retry ? '' : ' It will come back soon.'}`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    // Un fallo de ortografia se corrige ahora: mira, tapa, escribe.
    if (!ok && question.kind === 'spell' && typed && !ctx.exam) {
      fill(board);
      fill(fixSlot, spellingFix({ typed, answer: question.word.word, onDone: () => next() }));
      return;
    }
    if (!ok) speak(question.word.word);
    setTimeout(next, ok ? 950 : 2000);
  }

  function submitSpelling() {
    if (locked) return;
    const step = steps[index];
    if (step.type !== 'test') return;
    const result = check(step.question, input.value);
    if (result.kind === 'empty') {
      feedback.textContent = 'Write the word you hear.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    settle(result.ok, input.value);
  }

  /** @param {string} id */
  function pickOption(id) {
    if (locked) return;
    const step = steps[index];
    if (step.type !== 'test') return;
    const question = step.question;
    const ok = check(question, id).ok;
    // Al contestar se ven los nombres de los dibujos (antes no: se acertaria leyendo).
    qsa('.gym-card', board).forEach((card) => {
      card.classList.add('is-done');
      if (card.dataset.id === question.word.id) card.classList.add('is-right');
      else if (card.dataset.id === id) card.classList.add('is-wrong');
    });
    settle(ok);
  }

  /** Conocer una palabra nueva: dibujo, palabra y voz, y decirla en voz alta. @param {any} word */
  function renderMeet(word) {
    met.push(word);
    prompt.textContent = 'A new word. Look, listen and say it.';
    fill(board, h('div', { class: 'meet' }, [
      word.icon ? h('div', { class: 'meet__face', 'aria-hidden': 'true' }, word.icon) : null,
      h('p', { class: 'meet__word' }, word.word),
      h('p', { class: 'meet__hint' }, 'Say it out loud. You will see it again in a minute.'),
      h('div', { class: 'meet__actions' }, [
        h('button', { class: 'btn btn--go', type: 'button', onClick: () => { if (!locked) { locked = true; next(); } } }, 'Got it'),
      ]),
    ]));
    setTimeout(() => /** @type {HTMLButtonElement | null} */ (board.querySelector('.btn--go'))?.focus(), 80);
  }

  /** @param {any} question */
  function renderTest(question) {
    if (question.kind === 'spell') {
      prompt.textContent = 'Listen and write the word.';
      fill(board, h('div', { class: 'writer' }, [
        input,
        h('button', { class: 'btn btn--go', onClick: submitSpelling }, 'Check'),
      ]));
      input.value = '';
      setTimeout(() => input.focus(), 80);
    } else if (question.kind === 'picture') {
      prompt.textContent = 'Listen and tap the right picture.';
      fill(board, h('div', { class: 'gym-grid' }, question.options.map((/** @type {any} */ option) => h('button', {
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
      fill(board, h('div', { class: 'gym-words' }, question.options.map((/** @type {any} */ option) => h('button', {
        class: 'gym-card gym-card--text',
        dataset: { id: option.id },
        onClick: () => pickOption(option.id),
      }, option.word))));
    }
  }

  function render() {
    locked = false;
    const step = steps[index];
    showCount();
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(fixSlot);
    if (step.type === 'meet') renderMeet(step.word);
    else renderTest(step.question);
    speak(sayNow());
  }

  function next() {
    index += 1;
    if (index >= steps.length) return finish();
    render();
  }

  function finish() {
    stopVoice();
    cue('finish');
    const shields = shieldsFor(score, questions.length);
    if (ctx.onFinish) return ctx.onFinish({ score, total: questions.length });
    practised(meta.id);
    const all = progress();
    const here = boardData ? progressOf(boardData.words) : topic ? progress(topic.id) : null;
    const where = boardData ? 'on this board' : 'on this page';
    const missed = answers.filter((a) => !a.ok);

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
          h('p', {}, `${won.length} new sticker${won.length > 1 ? 's' : ''} — you know ${won.length > 1 ? 'these words' : 'this word'} now.`),
        ])
        : h('p', {}, 'No new stickers yet. Get a word right twice and it is yours.'),
      met.length ? h('p', { class: 'spell-tip' }, `${met.length} new word${met.length > 1 ? 's' : ''} today. Tomorrow they come back: that is how you remember them.`) : null,
      missed.length ? h('p', { class: 'spell-tip' }, `The words with ✗ come back first in your next Word gym.`) : null,
      h('p', { class: 'spell-tip' }, here
        ? `${here.mastered} of ${here.total} words ${where}. ${all.mastered} of ${all.total} in the whole album.`
        : `${all.mastered} of ${all.total} words in the whole album.`),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '✓ ' : '✗ '),
        `${a.word.icon ? `${a.word.icon} ` : ''}${a.word.word}${!a.ok && a.fixed ? ' (fixed)' : ''}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'More words'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, boardData ? 'Back to the board' : 'Back to album'),
      ]),
    ]));
  }

  /** Una ronda nueva: las preguntas y su orden, con las nuevas presentadas antes. */
  function newRound() {
    questions = buildRound(options);
    const fresh = new Set(questions.filter((q) => statusOf(q.word.id).last === null).map((q) => q.word.id));
    steps = sessionSteps(questions, (id) => fresh.has(id));
    index = 0;
    score = 0;
    firstTries = 0;
    answers.length = 0;
    won.length = 0;
    met.length = 0;
  }

  function restart() {
    newRound();
    build();
  }

  function build() {
    const here = boardData ? progressOf(boardData.words) : topic ? progress(topic.id) : progress();
    const where = boardData ? ' on this board' : topic ? ' on this page' : '';
    const fresh = steps.filter((s) => s.type === 'meet').length;
    fill(stage,
      h('p', { class: 'bank-hint' },
        `${questions.length} words${fresh ? `, ${fresh} of them new` : ''}. The ones you get wrong come back. `
        + `${here.mastered} of ${here.total} known${where}.`),
      h('div', { class: 'instruction instruction--clue' }, [prompt, sayAgain]),
      board,
      feedback,
      fixSlot);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  newRound();
  build();

  return { destroy() { stopVoice(); } };
}
